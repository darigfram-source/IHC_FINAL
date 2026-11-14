import { NextResponse } from 'next/server';
import { crearClienteServidor } from '@/lib/supabase/server';
import { nutriologoActual } from '@/lib/nutriologo';
import { planDerivado, tendencia, ETIQUETA_ESTADO } from '@/lib/motor-reglas';

const sinAcceso = () => NextResponse.json({ success: false, error: 'No autorizado' }, { status: 401 });

/** Todo lo que necesita el panel del nutriólogo, en una sola llamada. El RLS de la base
 *  limita cada consulta a SUS pacientes; el filtro por nutriologo_id es solo un refuerzo. */
export async function GET() {
  const supabase = await crearClienteServidor();
  const nut = await nutriologoActual(supabase);
  if (!nut) return sinAcceso();

  const { data: filas, error } = await supabase
    .from('usuarios')
    .select('*')
    .eq('nutriologo_id', nut.id)
    .order('id');
  if (error) return NextResponse.json({ success: false, error: 'No se pudieron cargar los pacientes' }, { status: 500 });

  const ids = (filas ?? []).map((u) => u.id as string);
  const desde = new Date(Date.now() - 90 * 86_400_000).toISOString().slice(0, 10);

  const vacio = { data: [] as Record<string, unknown>[] };
  const [regs, msgs, reps, arts] = await Promise.all([
    ids.length
      ? supabase.from('registros_diarios').select('*').in('usuario_id', ids).gte('fecha', desde).order('fecha', { ascending: true })
      : vacio,
    ids.length
      ? supabase.from('mensajes_chat').select('*').in('usuario_id', ids).order('creado_en', { ascending: true })
      : vacio,
    ids.length
      ? supabase.from('reportes').select('*').in('usuario_id', ids).order('creado_en', { ascending: false })
      : vacio,
    supabase.from('articulos_educativos').select('*').order('creado_en', { ascending: false }),
  ]);

  const registrosDe = (id: string) =>
    ((regs.data ?? []) as Record<string, any>[]).filter((r) => r.usuario_id === id); // eslint-disable-line @typescript-eslint/no-explicit-any

  const usuarios = (filas ?? []).map((u) => {
    const registros = registrosDe(u.id);
    const t = tendencia(registros as any); // eslint-disable-line @typescript-eslint/no-explicit-any
    const plan = planDerivado(u);
    const pesoActual = registros.length ? Number(registros[registros.length - 1].peso_ayunas) : Number(u.peso_actual);
    const conPeso = planDerivado({ ...u, peso_actual: pesoActual });
    return {
      ...u,
      peso_actual: pesoActual,
      proteina_g_kg: u.proteina_g_kg ?? plan.proteina_g_kg,
      carbs_peri_entreno_g: u.carbs_peri_entreno_g ?? plan.carbs_peri_entreno_g,
      grasas_g: u.grasas_g ?? null, // solo si el nutriólogo las definió (igual que la app)
      // Solo lo que el nutriólogo indicó (vacío = sin indicación; ya no se rellena con creatina por defecto).
      suplementacion_sugerida: String(u.suplementacion_sugerida ?? '').trim(),
      // Igual que el portal del paciente: dependen del peso y del superávit (400-500).
      superavit_kcal: conPeso.superavit_kcal,
      calorias_mantenimiento: conPeso.calorias_mantenimiento,
      calorias_totales: conPeso.calorias_totales,
      carbohidratos_g: conPeso.carbohidratos_g,
      estado: ETIQUETA_ESTADO[t.estado],
      tendencia_cargas: t.deltaCargas > 0 ? 'Suben' : t.deltaCargas < 0 ? 'Bajan' : 'Sin cambio',
      registros,
    };
  });

  return NextResponse.json({
    success: true,
    data: {
      nutriologo: nut,
      usuarios,
      mensajes: ((msgs.data ?? []) as Record<string, any>[]).filter((m) => !m.eliminado_en), // eslint-disable-line @typescript-eslint/no-explicit-any
      reportes: reps.data ?? [],
      articulos: arts.data ?? [],
    },
  });
}
