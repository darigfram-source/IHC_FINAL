import type { SupabaseClient } from '@supabase/supabase-js';

// Mismas reglas que la app Flutter: es nutriólogo quien tiene fila en `nutriologos`
// (con cédula verificada y activo); es paciente quien tiene fila en `usuarios`.
export type Rol = 'admin' | 'paciente';

export type ResultadoRol =
  | { rol: 'admin'; id: string; nombre: string }
  | { rol: 'paciente'; id: string; nombre: string }
  | { rol: null; motivo: 'nutriologo_pendiente' | 'sin_perfil' };

export async function obtenerRol(supabase: SupabaseClient, authId: string): Promise<ResultadoRol> {
  const { data: nut } = await supabase
    .from('nutriologos')
    .select('id, nombre, cedula_verificada, activo')
    .eq('auth_id', authId)
    .maybeSingle();

  if (nut) {
    if (nut.cedula_verificada && nut.activo) {
      return { rol: 'admin', id: nut.id, nombre: nut.nombre };
    }
    return { rol: null, motivo: 'nutriologo_pendiente' };
  }

  const { data: usr } = await supabase
    .from('usuarios')
    .select('id, nombre')
    .eq('auth_id', authId)
    .maybeSingle();

  if (usr) return { rol: 'paciente', id: usr.id, nombre: usr.nombre };
  return { rol: null, motivo: 'sin_perfil' };
}
