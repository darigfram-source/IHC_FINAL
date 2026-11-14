import { NextResponse } from 'next/server';
import { crearClienteServidor } from '@/lib/supabase/server';
import { nutriologoActual } from '@/lib/nutriologo';

const falla = (error: string, status: number) => NextResponse.json({ success: false, error }, { status });
const ESTADOS_RESPUESTA = ['en_proceso', 'atendida', 'rechazada'];

/** Solicitudes ARCO de los pacientes del nutriólogo, con el nombre del paciente. */
export async function GET() {
  const supabase = await crearClienteServidor();
  const nut = await nutriologoActual(supabase);
  if (!nut) return falla('No autorizado', 401);

  const { data: pacientes } = await supabase.from('usuarios').select('id, nombre').eq('nutriologo_id', nut.id);
  const nombres = new Map((pacientes ?? []).map((p) => [p.id as string, p.nombre as string]));
  if (nombres.size === 0) return NextResponse.json({ success: true, data: [] });

  const { data, error } = await supabase
    .from('solicitudes_arco')
    .select('*')
    .in('usuario_id', [...nombres.keys()])
    .order('creado_en', { ascending: false });
  if (error) {
    console.error('nutriologo/arco GET:', error.message);
    return falla('No se pudieron cargar las solicitudes', 500);
  }
  return NextResponse.json({
    success: true,
    data: (data ?? []).map((s) => ({ ...s, paciente_nombre: nombres.get(s.usuario_id) ?? 'Paciente' })),
  });
}

/** Responde una solicitud: la marca en proceso, atendida o rechazada. */
export async function PATCH(request: Request) {
  const supabase = await crearClienteServidor();
  const nut = await nutriologoActual(supabase);
  if (!nut) return falla('No autorizado', 401);

  const b = await request.json().catch(() => ({}));
  const id = String(b.id ?? '');
  const estado = String(b.estado ?? '');
  const respuesta = String(b.respuesta ?? '').trim();
  if (!id) return falla('Solicitud requerida', 400);
  if (!ESTADOS_RESPUESTA.includes(estado)) return falla('Estado no válido', 400);
  if (estado !== 'en_proceso' && respuesta.length < 5) {
    return falla('Escribe la respuesta que verá el paciente.', 400);
  }
  if (respuesta.length > 2000) return falla('La respuesta es demasiado larga.', 400);

  // Solo solicitudes de SUS pacientes (el RLS también lo exige; aquí damos un error claro).
  const { data: s } = await supabase.from('solicitudes_arco').select('id, usuario_id').eq('id', id).maybeSingle();
  if (!s) return falla('Solicitud no encontrada', 404);
  const { data: p } = await supabase.from('usuarios').select('id').eq('id', s.usuario_id).eq('nutriologo_id', nut.id).maybeSingle();
  if (!p) return falla('Solicitud no encontrada', 404);

  const cambios: Record<string, unknown> = { estado };
  if (respuesta) cambios.respuesta = respuesta;
  const { data, error } = await supabase.from('solicitudes_arco').update(cambios).eq('id', id).select().maybeSingle();
  if (error || !data) {
    if (error) console.error('nutriologo/arco PATCH:', error.message);
    return falla('No se pudo guardar la respuesta', 500);
  }
  return NextResponse.json({ success: true, data });
}
