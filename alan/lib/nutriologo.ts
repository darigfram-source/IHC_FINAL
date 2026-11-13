import type { SupabaseClient } from '@supabase/supabase-js';

/** Fila del nutriólogo con sesión, solo si su cédula está verificada y la cuenta activa.
 *  Las reglas RLS de la base siguen aplicando: aquí solo se evita atender a quien no es nutriólogo. */
export async function nutriologoActual(supabase: SupabaseClient) {
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) return null;
  const { data: nut } = await supabase
    .from('nutriologos')
    .select('id, nombre, apodo, email, cedula_profesional, institucion, especialidad, activo, cedula_verificada')
    .eq('auth_id', auth.user.id)
    .maybeSingle();
  if (!nut || !nut.activo || !nut.cedula_verificada) return null;
  return nut;
}
