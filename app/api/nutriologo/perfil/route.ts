import { NextResponse } from 'next/server';
import type { SupabaseClient } from '@supabase/supabase-js';
import { crearClienteServidor } from '@/lib/supabase/server';
import {
  APODO_MAX,
  CAMPOS_PERFIL_PROPIO,
  estadoAcceso,
  validarCedulaNutri,
  validarEspecialidadNutri,
  validarNombreNutri,
  type PerfilNutriPropio,
} from '@/lib/nutri-perfil';

const falla = (error: string, status: number) => NextResponse.json({ success: false, error }, { status });

/** Texto legible de un error de la base (igual que la app). Las reglas las pone la base (supabase/13_*.sql). */
function textoError(e: { code?: string; message?: string }): string {
  if (e.code === 'P0001' && e.message) return e.message; // RAISE EXCEPTION de los triggers
  if (e.code === '23505') return 'Ya enviaste tu solicitud con esta cuenta.';
  if (e.code === '42501' || e.code === '42P01' || e.code === 'PGRST204') {
    return 'La base de datos no aceptó el cambio. Revisa que supabase/13_verificacion_nutriologos.sql esté ejecutado en Supabase.';
  }
  return `No se pudo guardar: ${e.message ?? 'error desconocido'}`;
}

/** Fila propia: el nutriólogo la ve aunque esté pendiente de verificación (RLS). */
async function filaPropia(supabase: SupabaseClient, authId: string) {
  const { data, error } = await supabase.from('nutriologos').select(CAMPOS_PERFIL_PROPIO).eq('auth_id', authId).maybeSingle();
  return { fila: (data as PerfilNutriPropio | null) ?? null, error };
}

/** La persona con sesión, solo si su cuenta NO es de paciente. */
async function cuentaNutri() {
  const supabase = await crearClienteServidor();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) return { supabase, user: null, esPaciente: false };
  const { data: vol } = await supabase.from('usuarios').select('id').eq('auth_id', auth.user.id).maybeSingle();
  return { supabase, user: auth.user, esPaciente: Boolean(vol) };
}

function leerCampos(b: Record<string, unknown>) {
  return {
    nombre: String(b.nombre ?? '').trim(),
    apodo: String(b.apodo ?? '').trim().slice(0, APODO_MAX),
    cedula: String(b.cedula ?? '').trim(),
    institucion: String(b.institucion ?? '').trim(),
    especialidad: String(b.especialidad ?? '').trim(),
  };
}

/** Estado de la cuenta (sin_solicitud | pendiente | activo) y la fila propia. */
export async function GET() {
  const { supabase, user, esPaciente } = await cuentaNutri();
  if (!user) return falla('No autorizado', 401);
  if (esPaciente) return falla('Esta cuenta es de voluntario. Ingresa en el portal del paciente.', 403);
  const { fila, error } = await filaPropia(supabase, user.id);
  if (error) {
    console.error('nutriologo/perfil GET:', error.message);
    return falla('No se pudo cargar tu perfil', 500);
  }
  return NextResponse.json({ success: true, estado: estadoAcceso(fila), data: fila });
}

/** Primera vez: envía los datos profesionales. La BASE la deja siempre pendiente (activo y cédula verificada en false). */
export async function POST(request: Request) {
  const { supabase, user, esPaciente } = await cuentaNutri();
  if (!user) return falla('No autorizado', 401);
  if (esPaciente) return falla('Esta cuenta es de voluntario. Ingresa en el portal del paciente.', 403);

  const c = leerCampos(await request.json().catch(() => ({})));
  const err = validarNombreNutri(c.nombre) ?? validarCedulaNutri(c.cedula) ?? validarEspecialidadNutri(c.especialidad);
  if (err) return falla(err, 400);

  const { error } = await supabase.from('nutriologos').insert({
    auth_id: user.id,
    nombre: c.nombre,
    apodo: c.apodo || null,
    cedula_profesional: c.cedula,
    institucion: c.institucion,
    especialidad: c.especialidad,
  });
  if (error) {
    console.error('nutriologo/perfil POST:', error.code, error.message);
    return falla(textoError(error), error.code === '23505' ? 409 : 400);
  }
  const { fila } = await filaPropia(supabase, user.id);
  return NextResponse.json({ success: true, estado: estadoAcceso(fila), data: fila });
}

/** Guarda el perfil. Con la cuenta verificada, nombre y cédula no cambian (la base también lo exige). */
export async function PUT(request: Request) {
  const { supabase, user, esPaciente } = await cuentaNutri();
  if (!user) return falla('No autorizado', 401);
  if (esPaciente) return falla('Esta cuenta es de voluntario.', 403);

  const { fila: actual } = await filaPropia(supabase, user.id);
  if (!actual) return falla('Primero envía tu solicitud.', 404);

  const c = leerCampos(await request.json().catch(() => ({})));
  const bloqueada = actual.cedula_verificada;
  const err = (bloqueada ? null : validarNombreNutri(c.nombre) ?? validarCedulaNutri(c.cedula)) ?? validarEspecialidadNutri(c.especialidad);
  if (err) return falla(err, 400);

  const cambios: Record<string, unknown> = { apodo: c.apodo || null, institucion: c.institucion, especialidad: c.especialidad };
  if (!bloqueada) {
    cambios.nombre = c.nombre;
    cambios.cedula_profesional = c.cedula;
  }
  const { error } = await supabase.from('nutriologos').update(cambios).eq('id', actual.id);
  if (error) {
    console.error('nutriologo/perfil PUT:', error.code, error.message);
    return falla(textoError(error), 400);
  }
  // Se devuelve lo que la base de verdad guardó.
  const { fila } = await filaPropia(supabase, user.id);
  return NextResponse.json({ success: true, estado: estadoAcceso(fila), data: fila });
}
