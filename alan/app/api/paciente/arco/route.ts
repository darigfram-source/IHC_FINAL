import { NextResponse } from 'next/server';
import { crearClienteServidor } from '@/lib/supabase/server';
import { validarSolicitudArco } from '@/lib/arco';

const falla = (error: string, status: number) => NextResponse.json({ success: false, error }, { status });

async function pacienteActual() {
  const supabase = await crearClienteServidor();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) return { supabase, usuario: null };
  const { data: usuario } = await supabase
    .from('usuarios')
    .select('id, nutriologo_id')
    .eq('auth_id', auth.user.id)
    .maybeSingle();
  return { supabase, usuario };
}

/** Solicitudes ARCO de la persona con sesión (el RLS ya limita a las suyas). */
export async function GET() {
  const { supabase, usuario } = await pacienteActual();
  if (!usuario) return falla('No autorizado', 401);
  const { data, error } = await supabase
    .from('solicitudes_arco')
    .select('id, tipo, descripcion, estado, respuesta, creado_en, atendido_en')
    .eq('usuario_id', usuario.id)
    .order('creado_en', { ascending: false });
  if (error) return falla('No se pudieron cargar tus solicitudes', 500);
  return NextResponse.json({ success: true, data: data ?? [], tiene_nutriologo: Boolean(usuario.nutriologo_id) });
}

/** Registra una solicitud ARCO. Va al nutriólogo asignado (nutriologo_id puede ir vacío si aún no tiene). */
export async function POST(request: Request) {
  const { supabase, usuario } = await pacienteActual();
  if (!usuario) return falla('No autorizado', 401);

  const b = await request.json().catch(() => ({}));
  const tipo = String(b.tipo ?? '');
  const descripcion = String(b.descripcion ?? '').trim();
  const err = validarSolicitudArco(tipo, descripcion);
  if (err) return falla(err, 422);

  // Reintento de una solicitud que se envió sin internet: si ya llegó la misma hace poco, no se duplica.
  const desde = new Date(Date.now() - 10 * 60_000).toISOString();
  const { data: igual } = await supabase
    .from('solicitudes_arco')
    .select('id')
    .eq('usuario_id', usuario.id)
    .eq('tipo', tipo)
    .eq('descripcion', descripcion)
    .gte('creado_en', desde)
    .limit(1);
  if (igual && igual.length) return NextResponse.json({ success: true, duplicada: true });

  const { error } = await supabase.from('solicitudes_arco').insert({
    id: `arco-${usuario.id}-${Date.now()}${Math.floor(Math.random() * 1000)}`,
    usuario_id: usuario.id,
    nutriologo_id: usuario.nutriologo_id ?? null,
    tipo,
    descripcion,
  });
  if (error) {
    console.error('arco:', error.message);
    return falla('No se pudo registrar tu solicitud', 500);
  }
  return NextResponse.json({ success: true });
}
