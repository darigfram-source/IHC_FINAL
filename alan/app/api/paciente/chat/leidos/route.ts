import { NextResponse } from 'next/server';
import { crearClienteServidor } from '@/lib/supabase/server';

/** Marca como leídos los mensajes que el nutriólogo le escribió a la persona con sesión (igual que
 *  Nube.marcarLeidosDelNutriologo de la app). Así la web y la app comparten el mismo "leído" en la base y no se
 *  contradicen: lo que se lee en una deja de contar como nuevo en la otra. */
export async function POST() {
  const supabase = await crearClienteServidor();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) return NextResponse.json({ success: false, error: 'No autorizado' }, { status: 401 });

  const { data: usuario } = await supabase.from('usuarios').select('id').eq('auth_id', auth.user.id).maybeSingle();
  if (!usuario) return NextResponse.json({ success: false, error: 'Paciente no encontrado' }, { status: 404 });

  const { data, error } = await supabase
    .from('mensajes_chat')
    .update({ leido: true })
    .eq('usuario_id', usuario.id)
    .eq('remitente', 'nutriologo')
    .eq('leido', false)
    .is('eliminado_en', null)
    .select('id');
  if (error) {
    console.error('chat leidos:', error.message);
    return NextResponse.json({ success: false, error: 'No se pudieron marcar como leídos' }, { status: 500 });
  }
  return NextResponse.json({ success: true, marcados: data?.length ?? 0 });
}
