import { NextResponse } from 'next/server';
import { randomUUID } from 'crypto';
import { crearClienteServidor } from '@/lib/supabase/server';
import { dentroDeVentana, errorModificarMensaje } from '@/lib/chat-reglas';

const noAutorizado = () => NextResponse.json({ success: false, error: 'No autorizado' }, { status: 401 });

async function usuarioActual() {
  const supabase = await crearClienteServidor();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) return { supabase, usuario: null };
  const { data: usuario } = await supabase
    .from('usuarios')
    .select('id, nutriologo_id')
    .eq('auth_id', auth.user.id)
    .maybeSingle();
  return { supabase, usuario };
}

export async function GET() {
  const { supabase, usuario } = await usuarioActual();
  if (!usuario) return noAutorizado();
  const { data, error } = await supabase
    .from('mensajes_chat')
    .select('*')
    .eq('usuario_id', usuario.id)
    .order('creado_en', { ascending: true });
  if (error) return NextResponse.json({ success: false, error: 'Error cargando el chat' }, { status: 500 });
  return NextResponse.json({ success: true, data: (data ?? []).filter((m) => !m.eliminado_en) });
}

export async function POST(request: Request) {
  const { supabase, usuario } = await usuarioActual();
  if (!usuario) return noAutorizado();

  const { contenido } = await request.json();
  const texto = String(contenido ?? '').trim();
  if (!texto) return NextResponse.json({ success: false, error: 'Contenido requerido' }, { status: 400 });
  if (texto.length > 2000) return NextResponse.json({ success: false, error: 'Mensaje demasiado largo' }, { status: 400 });

  const fila = {
    id: `msg-${randomUUID()}`,
    usuario_id: usuario.id,
    nutriologo_id: usuario.nutriologo_id,
    remitente: 'usuario',
    contenido: texto,
    tipo: 'texto',
    leido: false,
    creado_en: new Date().toISOString(),
  };
  const { error } = await supabase.from('mensajes_chat').insert(fila);
  if (error) {
    console.error('chat:', error.message);
    return NextResponse.json({ success: false, error: 'Error al enviar mensaje' }, { status: 500 });
  }
  return NextResponse.json({ success: true, data: fila });
}

/** Mensaje propio del paciente (dirigido al nutriólogo), sin eliminar y dentro de los 5 minutos. */
async function mensajePropioModificable(
  supabase: Awaited<ReturnType<typeof crearClienteServidor>>,
  usuarioId: string,
  id: string
): Promise<{ ok: true } | { ok: false; error: string; status: number }> {
  const { data: m } = await supabase
    .from('mensajes_chat')
    .select('id, remitente, creado_en, eliminado_en')
    .eq('id', id)
    .eq('usuario_id', usuarioId)
    .maybeSingle();
  if (!m || m.eliminado_en) return { ok: false, error: 'Mensaje no encontrado', status: 404 };
  if (m.remitente !== 'usuario') return { ok: false, error: 'Solo puedes modificar tus propios mensajes', status: 403 };
  if (!dentroDeVentana(m.creado_en)) {
    return { ok: false, error: 'Pasaron más de 5 minutos: ya no se puede modificar este mensaje.', status: 409 };
  }
  return { ok: true };
}

/** Edita el texto de un mensaje propio (5 minutos). */
export async function PATCH(request: Request) {
  const { supabase, usuario } = await usuarioActual();
  if (!usuario) return noAutorizado();
  const b = await request.json().catch(() => ({}));
  const id = String(b.id ?? '');
  const texto = String(b.contenido ?? '').trim();
  if (!id || !texto) return NextResponse.json({ success: false, error: 'Mensaje y texto requeridos' }, { status: 400 });
  if (texto.length > 2000) return NextResponse.json({ success: false, error: 'Mensaje demasiado largo' }, { status: 400 });

  const v = await mensajePropioModificable(supabase, usuario.id, id);
  if (!v.ok) return NextResponse.json({ success: false, error: v.error }, { status: v.status });

  const { data, error } = await supabase
    .from('mensajes_chat')
    .update({ contenido: texto })
    .eq('id', id)
    .eq('usuario_id', usuario.id)
    .eq('remitente', 'usuario')
    .select('*');
  if (error || !data?.length) {
    console.error('chat PATCH:', error?.message);
    return NextResponse.json({ success: false, error: errorModificarMensaje(error?.message) }, { status: 400 });
  }
  return NextResponse.json({ success: true, data: data[0] });
}

/** Elimina (oculta) un mensaje propio (5 minutos). */
export async function DELETE(request: Request) {
  const { supabase, usuario } = await usuarioActual();
  if (!usuario) return noAutorizado();
  const b = await request.json().catch(() => ({}));
  const id = String(b.id ?? '');
  if (!id) return NextResponse.json({ success: false, error: 'Mensaje requerido' }, { status: 400 });

  const v = await mensajePropioModificable(supabase, usuario.id, id);
  if (!v.ok) return NextResponse.json({ success: false, error: v.error }, { status: v.status });

  const { data, error } = await supabase
    .from('mensajes_chat')
    .update({ eliminado_en: new Date().toISOString() })
    .eq('id', id)
    .eq('usuario_id', usuario.id)
    .eq('remitente', 'usuario')
    .select('id');
  if (error || !data?.length) {
    console.error('chat DELETE:', error?.message);
    return NextResponse.json({ success: false, error: errorModificarMensaje(error?.message) }, { status: 400 });
  }
  return NextResponse.json({ success: true });
}
