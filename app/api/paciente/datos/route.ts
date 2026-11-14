import { NextResponse } from 'next/server';
import { crearClienteServidor } from '@/lib/supabase/server';

const falla = (error: string, status: number) => NextResponse.json({ success: false, error }, { status });

/** "Borrar registros y mensajes": elimina en la nube los registros diarios, TODOS los mensajes con el nutriólogo y los
 *  resultados SUS de la persona con sesión (igual que Nube.borrarMisDatos de la app). No toca su perfil, su meta, sus
 *  solicitudes ARCO ni los reportes que su nutriólogo ya emitió.
 *  Se comprueba que no quede nada: si las reglas RLS no dejan borrar, el delete no da error pero tampoco borra. */
export async function DELETE() {
  const supabase = await crearClienteServidor();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) return falla('No autorizado', 401);

  const { data: usuario } = await supabase.from('usuarios').select('id').eq('auth_id', auth.user.id).maybeSingle();
  if (!usuario) return falla('Paciente no encontrado', 404);

  const tablas = ['registros_diarios', 'mensajes_chat', 'sus_resultados'] as const;
  for (const tabla of tablas) {
    const { error } = await supabase.from(tabla).delete().eq('usuario_id', usuario.id);
    if (error) {
      console.error(`borrar datos (${tabla}):`, error.message);
      return falla('No se pudieron borrar tus datos. Intenta de nuevo.', 500);
    }
  }

  // Verificación: no debe quedar ninguna fila.
  for (const tabla of tablas) {
    const { count, error } = await supabase.from(tabla).select('id', { count: 'exact', head: true }).eq('usuario_id', usuario.id);
    if (error || (count ?? 0) > 0) {
      console.error(`borrar datos: quedaron filas en ${tabla}`, error?.message ?? count);
      return falla('No se pudo borrar todo. Intenta de nuevo o pide la cancelación en Ejercer mis derechos (ARCO).', 500);
    }
  }
  return NextResponse.json({ success: true });
}
