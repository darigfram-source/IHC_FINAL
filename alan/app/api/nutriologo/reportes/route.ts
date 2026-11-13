import { NextResponse } from 'next/server';
import { crearClienteServidor } from '@/lib/supabase/server';
import { nutriologoActual } from '@/lib/nutriologo';
import { metricasReporte, diasDelPeriodo } from '@/lib/reporte';

const falla = (error: string, status: number) => NextResponse.json({ success: false, error }, { status });

/** Crea un reporte con cifras calculadas aquí a partir de los registros reales del paciente. */
export async function POST(request: Request) {
  const supabase = await crearClienteServidor();
  const nut = await nutriologoActual(supabase);
  if (!nut) return falla('No autorizado', 401);

  const b = await request.json();
  const usuarioId = String(b.usuario_id ?? '');
  const tipo = b.periodo_tipo === 'semanal' ? 'semanal' : 'mensual';
  const evaluacion = String(b.evaluacion_clinica ?? '').trim();
  const recomendaciones = String(b.recomendaciones_siguientes ?? '').trim();
  if (!usuarioId) return falla('Paciente requerido', 400);
  if (!evaluacion || !recomendaciones) return falla('Escribe la evaluación y las recomendaciones.', 400);

  const { data: u } = await supabase.from('usuarios').select('id').eq('id', usuarioId).eq('nutriologo_id', nut.id).maybeSingle();
  if (!u) return falla('Paciente no encontrado', 404);

  const desde = new Date(Date.now() - (diasDelPeriodo(tipo) + 1) * 86_400_000).toISOString().slice(0, 10);
  const { data: regs } = await supabase
    .from('registros_diarios')
    .select('fecha, peso_ayunas, sentadilla_kg, press_banca_kg')
    .eq('usuario_id', usuarioId)
    .gte('fecha', desde);
  const m = metricasReporte(regs ?? [], tipo);
  if (!m) return falla('Sin registros en este periodo: no hay cifras que reportar.', 422);

  const fila = {
    id: `rep-${Date.now()}${Math.floor(Math.random() * 1000)}`,
    usuario_id: usuarioId,
    nutriologo_id: nut.id,
    periodo_tipo: tipo,
    ...m,
    evaluacion_clinica: evaluacion,
    recomendaciones_siguientes: recomendaciones,
  };
  const { data, error } = await supabase.from('reportes').insert(fila).select().maybeSingle();
  if (error) {
    console.error('nutriologo/reportes:', error.message);
    return falla('No se pudo guardar el reporte', 500);
  }

  // Aviso al paciente por el chat (si falla, el reporte ya quedó guardado).
  await supabase.from('mensajes_chat').insert({
    id: `msg-nut-${usuarioId}-${Date.now()}${Math.floor(Math.random() * 1000)}`,
    usuario_id: usuarioId,
    nutriologo_id: nut.id,
    remitente: 'nutriologo',
    contenido: `Te envié tu reporte ${tipo}. Lo encuentras en Menú > Reportes y resúmenes.`,
    tipo: 'texto',
    leido: false,
  });
  return NextResponse.json({ success: true, data: data ?? fila });
}
