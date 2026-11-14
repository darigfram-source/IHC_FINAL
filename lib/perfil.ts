import type { SupabaseClient, User } from '@supabase/supabase-js';

export interface PerfilRegistro {
  nombre: string;
  edad: number;
  estatura_cm: number;
  peso_actual: number;
  peso_objetivo: number;
  nivel_entrenamiento: 'Principiante' | 'Intermedio';
  consentimiento_informado: boolean;
  nutriologo_id?: string | null;
}

/** Garantiza que exista la fila en `usuarios` (misma estructura que Nube.crearUsuario de la app).
 *  El cuestionario viaja en user_metadata porque con confirmación de correo la persona aún no
 *  tiene sesión al registrarse: la fila se crea en su primer inicio de sesión real. */
export async function asegurarUsuario(supabase: SupabaseClient, user: User) {
  const { data: existente } = await supabase
    .from('usuarios')
    .select('id, nombre')
    .eq('auth_id', user.id)
    .maybeSingle();
  if (existente) return existente;

  // Fila ya creada (p. ej. desde la app Flutter) pero sin auth_id: se enlaza por correo confirmado.
  if (user.email && user.email_confirmed_at) {
    const { data: enlazado } = await supabase
      .from('usuarios')
      .update({ auth_id: user.id })
      .eq('email', user.email.toLowerCase())
      .is('auth_id', null)
      .select('id, nombre')
      .maybeSingle();
    if (enlazado) return enlazado;
  }

  const p = user.user_metadata?.perfil as PerfilRegistro | undefined;
  if (!p || !p.consentimiento_informado) return null; // registro incompleto (p. ej. se hizo en otra plataforma)

  // El elegido solo vale si sigue activo; si no (o no eligió), se asigna al primero activo.
  let nutriologoId: string | null = null;
  if (p.nutriologo_id) {
    const { data: elegido } = await supabase.from('nutriologos').select('id').eq('id', p.nutriologo_id).eq('activo', true).maybeSingle();
    nutriologoId = elegido?.id ?? null;
  }
  if (!nutriologoId) {
    const { data: n } = await supabase
      .from('nutriologos')
      .select('id')
      .eq('activo', true)
      .order('creado_en')
      .limit(1)
      .maybeSingle();
    nutriologoId = n?.id ?? null;
  }

  const fila = {
    id: `usr-${user.id.substring(0, 8)}`,
    auth_id: user.id,
    nutriologo_id: nutriologoId,
    nombre: p.nombre,
    email: (user.email ?? '').toLowerCase(),
    edad: p.edad,
    estatura_cm: p.estatura_cm,
    peso_inicial: p.peso_actual,
    peso_actual: p.peso_actual,
    peso_objetivo: p.peso_objetivo,
    nivel_entrenamiento: p.nivel_entrenamiento,
    elegible: true,
    consentimiento_informado: true,
    consentimiento_fecha: new Date().toISOString(),
  };
  const { error } = await supabase.from('usuarios').insert(fila);
  if (error) {
    console.error('asegurarUsuario:', error.message);
    return null;
  }
  return { id: fila.id, nombre: fila.nombre };
}
