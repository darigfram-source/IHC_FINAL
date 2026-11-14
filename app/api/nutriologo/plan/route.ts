import { NextResponse } from 'next/server';
import { crearClienteServidor } from '@/lib/supabase/server';
import { nutriologoActual } from '@/lib/nutriologo';
import { limitarSuperavit, GKG_TOPE } from '@/lib/motor-reglas';

const falla = (error: string, status: number) => NextResponse.json({ success: false, error }, { status });

/** Ajusta el plan de un paciente y deja el historial en ajustes_plan. */
export async function POST(request: Request) {
  const supabase = await crearClienteServidor();
  const nut = await nutriologoActual(supabase);
  if (!nut) return falla('No autorizado', 401);

  const b = await request.json();
  const usuarioId = String(b.usuario_id ?? '');
  const motivo = String(b.motivo ?? '').trim() || 'Ajuste del nutriólogo.';
  const superavit = limitarSuperavit(Number(b.superavit_kcal));
  const proteina = Number(b.proteina_g_kg);
  // Suplementación que el nutriólogo indica (texto libre, opcional). undefined = no tocar; '' = borrar la indicación.
  // Grasas (g/día) que define el nutriólogo; opcional. Igual que la app: si la base no tiene la columna, el plan se guarda igual.
  const grasas = Number.isFinite(Number(b.grasas_g)) && Number(b.grasas_g) >= 40 && Number(b.grasas_g) <= 150 ? Math.round(Number(b.grasas_g)) : undefined;
  const suplementacion = typeof b.suplementacion === 'string' ? b.suplementacion.trim().slice(0, 200) : undefined;
  if (!usuarioId || !Number.isFinite(superavit) || !Number.isFinite(proteina)) return falla('Datos incompletos', 400);
  if (proteina > GKG_TOPE) return falla('La proteína no puede pasar de 2.0 g/kg al día.', 422);
  if (proteina < 1.0) return falla('Proteína fuera de rango.', 422);

  const { data: actual, error: e0 } = await supabase
    .from('usuarios')
    .select('id, superavit_kcal, proteina_g_kg')
    .eq('id', usuarioId)
    .eq('nutriologo_id', nut.id)
    .maybeSingle();
  if (e0 || !actual) return falla('Paciente no encontrado', 404);

  // Se intenta guardar superávit y proteína; si la base solo permite el superávit
  // (como en la app), se guarda ese y se avisa.
  let proteinaGuardada = proteina;
  let { error } = await supabase
    .from('usuarios')
    .update({ superavit_kcal: superavit, proteina_g_kg: proteina })
    .eq('id', usuarioId);
  if (error) {
    proteinaGuardada = Number(actual.proteina_g_kg ?? proteina);
    ({ error } = await supabase.from('usuarios').update({ superavit_kcal: superavit }).eq('id', usuarioId));
  }
  if (error) {
    console.error('nutriologo/plan:', error.message);
    return falla('No se pudo guardar el ajuste', 500);
  }

  let grasasGuardadas = true;
  if (grasas !== undefined) {
    const { error: eGr } = await supabase.from('usuarios').update({ grasas_g: grasas }).eq('id', usuarioId);
    if (eGr) {
      grasasGuardadas = false;
      console.error('nutriologo/plan (grasas):', eGr.message);
    }
  }

  let suplementacionGuardada = true;
  if (suplementacion !== undefined) {
    const { error: eSup } = await supabase
      .from('usuarios')
      .update({ suplementacion_sugerida: suplementacion || null })
      .eq('id', usuarioId);
    if (eSup) {
      suplementacionGuardada = false;
      console.error('nutriologo/plan (suplementación):', eSup.message);
    }
  }

  const { error: eAj } = await supabase.from('ajustes_plan').insert({
    id: `aj-${Date.now()}${Math.floor(Math.random() * 1000)}`,
    usuario_id: usuarioId,
    nutriologo_id: nut.id,
    superavit_kcal_anterior: actual.superavit_kcal,
    superavit_kcal_nuevo: superavit,
    proteina_g_kg_anterior: actual.proteina_g_kg,
    proteina_g_kg_nuevo: proteinaGuardada,
    motivo_ajuste: motivo,
  });
  if (eAj) console.error('nutriologo/plan (historial):', eAj.message);

  // Aviso al paciente por el chat (como promete el modal; si falla, el ajuste ya quedó guardado).
  await supabase.from('mensajes_chat').insert({
    id: `msg-nut-${usuarioId}-${Date.now()}${Math.floor(Math.random() * 1000)}`,
    usuario_id: usuarioId,
    nutriologo_id: nut.id,
    remitente: 'nutriologo',
    contenido: `📋 Plan actualizado: superávit de +${superavit} kcal y proteína de ${proteinaGuardada} g/kg. Motivo: ${motivo}`,
    tipo: 'ajuste_plan',
    leido: false,
  });

  return NextResponse.json({
    success: true,
    data: { superavit_kcal: superavit, proteina_g_kg: proteinaGuardada },
    proteinaNoGuardada: proteinaGuardada !== proteina,
    suplementacionNoGuardada: !suplementacionGuardada,
    grasasNoGuardadas: !grasasGuardadas,
  });
}
