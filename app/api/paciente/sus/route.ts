import { NextResponse } from 'next/server';
import { crearClienteServidor } from '@/lib/supabase/server';
import { puntajeSus } from '@/lib/sus';

const falla = (error: string, status: number) => NextResponse.json({ success: false, error }, { status });

async function pacienteActual() {
  const supabase = await crearClienteServidor();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) return { supabase, usuario: null };
  const { data: usuario } = await supabase.from('usuarios').select('id').eq('auth_id', auth.user.id).maybeSingle();
  return { supabase, usuario };
}

/** Cuestionarios SUS de la persona con sesión, del más reciente al más antiguo. */
export async function GET() {
  const { supabase, usuario } = await pacienteActual();
  if (!usuario) return falla('No autorizado', 401);
  const { data, error } = await supabase
    .from('sus_resultados')
    .select('puntaje, segundos_registro, creado_en')
    .eq('usuario_id', usuario.id)
    .order('creado_en', { ascending: false })
    .limit(50);
  if (error) return falla('No se pudo cargar el historial', 500);
  return NextResponse.json({ success: true, data: data ?? [] });
}

/** Guarda un cuestionario SUS. El puntaje se calcula AQUÍ a partir de las 10 respuestas (no se confía en el navegador). */
export async function POST(request: Request) {
  const { supabase, usuario } = await pacienteActual();
  if (!usuario) return falla('No autorizado', 401);

  const b = await request.json().catch(() => ({}));
  let puntaje: number;
  try {
    puntaje = puntajeSus(Array.isArray(b.respuestas) ? b.respuestas.map(Number) : []);
  } catch {
    return falla('Responde las 10 preguntas con valores de 1 a 5.', 422);
  }
  const seg = Number(b.segundos_registro);
  const segundos = Number.isFinite(seg) && seg >= 0 && seg <= 3600 ? Math.round(seg) : null;

  // Reintento de un envío sin internet: mismo puntaje en los últimos 10 min = ya llegó, no se duplica.
  const desde = new Date(Date.now() - 10 * 60_000).toISOString();
  const { data: igual } = await supabase
    .from('sus_resultados')
    .select('id')
    .eq('usuario_id', usuario.id)
    .eq('puntaje', puntaje)
    .gte('creado_en', desde)
    .limit(1);
  if (igual && igual.length) return NextResponse.json({ success: true, puntaje, duplicado: true });

  let { error } = await supabase
    .from('sus_resultados')
    .insert({ usuario_id: usuario.id, puntaje, ...(segundos !== null ? { segundos_registro: segundos } : {}) });
  // Si la columna segundos_registro aún no existe en la base, se guarda sin ella (igual que la app).
  if (error && segundos !== null && (error as { code?: string }).code === 'PGRST204') {
    ({ error } = await supabase.from('sus_resultados').insert({ usuario_id: usuario.id, puntaje }));
  }
  if (error) {
    console.error('sus:', error.message);
    return falla('No se pudo guardar el cuestionario', 500);
  }
  return NextResponse.json({ success: true, puntaje });
}
