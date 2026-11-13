import { NextResponse } from 'next/server';
import { PROTEINA_MAX_REGISTRO_G } from '@/lib/motor-reglas';
import { crearClienteServidor } from '@/lib/supabase/server';

const noAutorizado = () => NextResponse.json({ success: false, error: 'No autorizado' }, { status: 401 });

async function usuarioActual() {
  const supabase = await crearClienteServidor();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) return { supabase, usuario: null };
  const { data: usuario } = await supabase
    .from('usuarios')
    .select('id')
    .eq('auth_id', auth.user.id)
    .maybeSingle();
  return { supabase, usuario };
}

export async function GET() {
  const { supabase, usuario } = await usuarioActual();
  if (!usuario) return noAutorizado();
  const { data, error } = await supabase
    .from('registros_diarios')
    .select('*')
    .eq('usuario_id', usuario.id)
    .order('fecha', { ascending: true });
  if (error) return NextResponse.json({ success: false, error: 'Error obteniendo registros' }, { status: 500 });
  return NextResponse.json({ success: true, data });
}

export async function POST(request: Request) {
  const { supabase, usuario } = await usuarioActual();
  if (!usuario) return noAutorizado();

  const b = await request.json();
  const peso = Number(b.peso_ayunas);
  if (!(peso >= 30 && peso <= 250)) {
    return NextResponse.json({ success: false, error: 'El peso en ayunas es obligatorio y debe ser realista' }, { status: 400 });
  }
  const fecha = /^\d{4}-\d{2}-\d{2}$/.test(b.fecha) ? b.fecha : new Date().toLocaleDateString('en-CA', { timeZone: 'America/Mexico_City' }); // AAAA-MM-DD, hora de México (no UTC)
  // La proteína es opcional (igual que en la app): vacía se guarda como null, no como 0.
  let proteina: number | null = null;
  const crudo = b.proteina_consumida_g;
  if (!(crudo === undefined || crudo === null || crudo === '')) {
    const v = Number(crudo);
    if (!Number.isFinite(v) || v < 0 || v > PROTEINA_MAX_REGISTRO_G) {
      return NextResponse.json({ success: false, error: `La proteína debe estar entre 0 y ${PROTEINA_MAX_REGISTRO_G} g (o déjala vacía).` }, { status: 400 });
    }
    proteina = Math.round(v * 100) / 100;
  }
  const alerta = proteina !== null && proteina > 2.0 * peso; // mismo criterio que la app Flutter

  const opcional = (v: unknown) => (v === undefined || v === null || v === '' ? null : Number(v));
  const fila = {
    id: `reg-${usuario.id}-${fecha}`,
    usuario_id: usuario.id,
    fecha,
    peso_ayunas: peso,
    sentadilla_kg: Number(b.sentadilla_kg) || null,
    press_banca_kg: Number(b.press_banca_kg) || null,
    volumen_entrenamiento_kg: Math.round(Number(b.volumen_entrenamiento_kg) || 0),
    proteina_consumida_g: proteina,
    alerta_exceso_proteina: alerta,
    notas: typeof b.notas === 'string' && b.notas.trim() ? b.notas.trim().slice(0, 500) : null,
    series_efectivas: opcional(b.series_efectivas),
    calorias_consumidas: opcional(b.calorias_consumidas),
    peso_muerto_kg: opcional(b.peso_muerto_kg),
  };
  const { error } = await supabase.from('registros_diarios').upsert(fila, { onConflict: 'usuario_id,fecha' });
  if (error) {
    console.error('diario:', error.message);
    return NextResponse.json({ success: false, error: 'Error procesando el registro diario' }, { status: 500 });
  }
  await supabase.from('usuarios').update({ peso_actual: peso }).eq('id', usuario.id);

  return NextResponse.json({
    success: true,
    message: 'Registro diario guardado y sincronizado exitosamente',
    id: fila.id,
    alerta_exceso_proteina: alerta,
  });
}
