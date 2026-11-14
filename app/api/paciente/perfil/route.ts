import { NextResponse } from 'next/server';
import { crearClienteServidor } from '@/lib/supabase/server';
import { validarPerfil } from '@/lib/perfil-edicion';
import { planDerivado, tendencia, ETIQUETA_ESTADO } from '@/lib/motor-reglas';
import { buscarRecomendaciones } from '@/lib/recomendaciones';

const noAutorizado = () => NextResponse.json({ success: false, error: 'No autorizado' }, { status: 401 });

export async function GET() {
  const supabase = await crearClienteServidor();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) return noAutorizado();

  const { data: usuario } = await supabase.from('usuarios').select('*').eq('auth_id', auth.user.id).maybeSingle();
  if (!usuario) return NextResponse.json({ success: false, error: 'Paciente no encontrado' }, { status: 404 });

  const [regs, msgs, reps] = await Promise.all([
    supabase.from('registros_diarios').select('*').eq('usuario_id', usuario.id).order('fecha', { ascending: true }),
    supabase.from('mensajes_chat').select('*').eq('usuario_id', usuario.id).order('creado_en', { ascending: true }),
    supabase.from('reportes').select('*').eq('usuario_id', usuario.id).order('creado_en', { ascending: false }),
  ]);

  const registros = regs.data ?? [];
  const t = tendencia(registros);
  const plan = planDerivado(usuario);
  const mensajesVisibles = (msgs.data ?? []).filter((m) => !m.eliminado_en);

  // Calorías totales, carbohidratos, grasas y suplementos NO se calculan ni se rellenan por defecto: los define el
  // nutriólogo. Se quitan de la respuesta los valores por defecto de la base para que ninguna pantalla los muestre.
  /* eslint-disable @typescript-eslint/no-unused-vars */
  const {
    calorias_mantenimiento: _cm,
    calorias_totales: _ct,
    carbohidratos_g: _cg,
    carbs_peri_entreno_g: _cp,
    grasas_g: _gg,
    ...base
  } = usuario;
  /* eslint-enable @typescript-eslint/no-unused-vars */

  return NextResponse.json({
    success: true,
    data: {
      ...base,
      proteina_g_kg: usuario.proteina_g_kg ?? plan.proteina_g_kg,
      // Solo lo que el nutriólogo escribió en ese campo (vacío = pendiente).
      suplementacion_sugerida: String(usuario.suplementacion_sugerida ?? '').trim() || null,
      // Citas textuales de sus mensajes sobre suplementos, agua y macros (sin IA).
      recomendaciones_nutriologo: buscarRecomendaciones(mensajesVisibles),
      // Depende del peso actual y del superávit (acotado a 400-500): se recalcula.
      superavit_kcal: plan.superavit_kcal,
      estado: ETIQUETA_ESTADO[t.estado],
      tendencia_cargas: t.deltaCargas > 0 ? 'Suben' : t.deltaCargas < 0 ? 'Bajan' : 'Sin cambio',
      rol: 'paciente',
      registros,
      mensajes: mensajesVisibles,
      reportes: reps.data ?? [],
    },
  });
}

export async function PUT(request: Request) {
  const supabase = await crearClienteServidor();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) return noAutorizado();

  const b = await request.json().catch(() => ({}));

  // Formulario "Mi perfil y datos": nombre, edad, peso, estatura y nivel juntos, con la misma validación que la pantalla.
  if (b.nombre !== undefined) {
    const v = validarPerfil({
      nombre: String(b.nombre ?? ''),
      edad: String(b.edad ?? ''),
      peso: String(b.peso_actual ?? ''),
      estatura: String(b.estatura_cm ?? ''),
      nivel: String(b.nivel_entrenamiento ?? ''),
    });
    if (!v.ok) {
      return NextResponse.json({ success: false, error: Object.values(v.errores)[0] ?? 'Datos no válidos' }, { status: 400 });
    }
    // Se comprueba que la base realmente guardó (si las reglas RLS no dejan actualizar, no hay error pero tampoco cambio).
    const { data, error } = await supabase.from('usuarios').update(v.datos).eq('auth_id', auth.user.id).select('id');
    if (error || !data?.length) {
      console.error('perfil PUT:', error?.message ?? 'sin filas actualizadas');
      return NextResponse.json({ success: false, error: 'No se pudo guardar tu perfil. Intenta de nuevo.' }, { status: 500 });
    }
    return NextResponse.json({ success: true, message: 'Perfil actualizado' });
  }

  // Cambios sueltos (compatibilidad con lo que ya existía).
  const cambios: Record<string, unknown> = {};
  if (Number(b.edad) >= 18 && Number(b.edad) <= 40) cambios.edad = Number(b.edad);
  if (Number(b.estatura_cm) >= 100 && Number(b.estatura_cm) <= 230) cambios.estatura_cm = Number(b.estatura_cm);
  if (Number(b.peso_objetivo) >= 30 && Number(b.peso_objetivo) <= 250) cambios.peso_objetivo = Number(b.peso_objetivo);
  if (b.nivel_entrenamiento === 'Principiante' || b.nivel_entrenamiento === 'Intermedio') {
    cambios.nivel_entrenamiento = b.nivel_entrenamiento;
  }
  // El superávit lo fija el nutriólogo: el paciente no puede cambiarlo desde aquí.

  if (Object.keys(cambios).length === 0) {
    return NextResponse.json({ success: false, error: 'Nada que actualizar' }, { status: 400 });
  }
  const { error } = await supabase.from('usuarios').update(cambios).eq('auth_id', auth.user.id);
  if (error) return NextResponse.json({ success: false, error: 'Error actualizando perfil' }, { status: 500 });
  return NextResponse.json({ success: true, message: 'Perfil actualizado' });
}
