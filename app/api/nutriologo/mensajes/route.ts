import { NextResponse } from 'next/server';
import { crearClienteServidor } from '@/lib/supabase/server';
import { nutriologoActual } from '@/lib/nutriologo';
import { dentroDeVentana, errorModificarMensaje } from '@/lib/chat-reglas';

const falla = (error: string, status: number) => NextResponse.json({ success: false, error }, { status });
const TIPOS = ['texto', 'sugerencia_suplementacion', 'ajuste_plan', 'guia_educativa'];


/** Mensaje propio del nutriólogo, sin eliminar y dentro de los 5 minutos. null si todo bien. */
async function validarPropio(
  supabase: Awaited<ReturnType<typeof crearClienteServidor>>,
  nutriologoId: string,
  id: string
): Promise<{ error: string; status: number } | null> {
  const { data: m } = await supabase
    .from('mensajes_chat')
    .select('id, remitente, nutriologo_id, creado_en, eliminado_en')
    .eq('id', id)
    .maybeSingle();
  if (!m || m.eliminado_en) return { error: 'Mensaje no encontrado', status: 404 };
  if (m.remitente !== 'nutriologo' || m.nutriologo_id !== nutriologoId) {
    return { error: 'Solo quien escribió el mensaje puede modificarlo.', status: 403 };
  }
  if (!dentroDeVentana(m.creado_en)) {
    return { error: 'Pasaron más de 5 minutos: ya no se puede modificar este mensaje.', status: 409 };
  }
  return null;
}

/** Envía un mensaje del nutriólogo a uno de sus pacientes. */
export async function POST(request: Request) {
  const supabase = await crearClienteServidor();
  const nut = await nutriologoActual(supabase);
  if (!nut) return falla('No autorizado', 401);

  const b = await request.json();
  const usuarioId = String(b.usuario_id ?? '');
  const texto = String(b.contenido ?? '').trim();
  const tipo = TIPOS.includes(b.tipo) ? b.tipo : 'texto';
  if (!usuarioId || !texto) return falla('Paciente y contenido requeridos', 400);
  if (texto.length > 2000) return falla('Mensaje demasiado largo', 400);

  const fila = {
    id: `msg-nut-${usuarioId}-${Date.now()}${Math.floor(Math.random() * 1000)}`,
    usuario_id: usuarioId,
    nutriologo_id: nut.id,
    remitente: 'nutriologo',
    contenido: texto,
    tipo,
    leido: false,
  };
  const { data, error } = await supabase.from('mensajes_chat').insert(fila).select().maybeSingle();
  if (error) {
    console.error('nutriologo/mensajes:', error.message);
    return falla('No se pudo enviar el mensaje', 500);
  }
  // Responder también deja como leídos los mensajes del paciente (igual que la app).
  await supabase.from('mensajes_chat').update({ leido: true }).eq('usuario_id', usuarioId).eq('remitente', 'usuario').eq('leido', false);
  return NextResponse.json({ success: true, data: data ?? fila });
}

/** Marca como leídos los mensajes que el paciente le mandó al nutriólogo. */
export async function PATCH(request: Request) {
  const supabase = await crearClienteServidor();
  const nut = await nutriologoActual(supabase);
  if (!nut) return falla('No autorizado', 401);
  const b = await request.json();
  // Con "id" y "contenido" es una edición de un mensaje propio (5 minutos); sin ellos, marcar como leídos.
  if (b.id) {
    const texto = String(b.contenido ?? '').trim();
    if (!texto) return falla('Texto requerido', 400);
    if (texto.length > 2000) return falla('Mensaje demasiado largo', 400);
    const v = await validarPropio(supabase, nut.id, String(b.id));
    if (v) return falla(v.error, v.status);
    const { data, error } = await supabase
      .from('mensajes_chat')
      .update({ contenido: texto })
      .eq('id', String(b.id))
      .eq('remitente', 'nutriologo')
      .eq('nutriologo_id', nut.id)
      .select('id');
    if (error || !data?.length) {
      console.error('nutriologo/mensajes PATCH:', error?.message);
      return falla(errorModificarMensaje(error?.message), 400);
    }
    return NextResponse.json({ success: true });
  }
  const { usuario_id } = b;
  if (!usuario_id) return falla('Paciente requerido', 400);
  const { error } = await supabase
    .from('mensajes_chat')
    .update({ leido: true })
    .eq('usuario_id', String(usuario_id))
    .eq('remitente', 'usuario')
    .eq('leido', false);
  if (error) return falla('No se pudo actualizar', 500);
  return NextResponse.json({ success: true });
}

/** Elimina (oculta) un mensaje propio del nutriólogo (5 minutos). */
export async function DELETE(request: Request) {
  const supabase = await crearClienteServidor();
  const nut = await nutriologoActual(supabase);
  if (!nut) return falla('No autorizado', 401);
  const b = await request.json().catch(() => ({}));
  const id = String(b.id ?? '');
  if (!id) return falla('Mensaje requerido', 400);
  const v = await validarPropio(supabase, nut.id, id);
  if (v) return falla(v.error, v.status);
  const { data, error } = await supabase
    .from('mensajes_chat')
    .update({ eliminado_en: new Date().toISOString() })
    .eq('id', id)
    .eq('remitente', 'nutriologo')
    .eq('nutriologo_id', nut.id)
    .select('id');
  if (error || !data?.length) {
    console.error('nutriologo/mensajes DELETE:', error?.message);
    return falla(errorModificarMensaje(error?.message), 400);
  }
  return NextResponse.json({ success: true });
}
