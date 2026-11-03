import { NextResponse } from 'next/server';
import { INITIAL_MENSAJES } from '@/lib/data/initialData';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const usuarioId = searchParams.get('usuarioId');

  const filtered = usuarioId
    ? INITIAL_MENSAJES.filter((m) => m.usuario_id === usuarioId)
    : INITIAL_MENSAJES;

  return NextResponse.json({
    success: true,
    data: filtered,
  });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const nuevoMensaje = {
      id: `msg-${Date.now()}`,
      ...body,
      creado_en: new Date().toISOString(),
    };

    return NextResponse.json({
      success: true,
      data: nuevoMensaje,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Error al enviar mensaje' },
      { status: 500 }
    );
  }
}
