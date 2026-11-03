import { NextResponse } from 'next/server';
import { getCurrentSession } from '@/lib/auth';
import { query, hasDbConnection } from '@/lib/db';

export async function GET() {
  const session = await getCurrentSession();
  if (!session || session.rol !== 'paciente') {
    return NextResponse.json({ success: false, error: 'No autorizado' }, { status: 401 });
  }

  if (hasDbConnection()) {
    try {
      const messages = await query(
        'SELECT * FROM mensajes_chat WHERE usuario_id = $1 ORDER BY creado_en ASC',
        [session.userId]
      );
      return NextResponse.json({ success: true, data: messages });
    } catch (e) {
      console.error('Error cargando chat del paciente:', e);
    }
  }

  return NextResponse.json({ success: true, data: [] });
}

export async function POST(request: Request) {
  const session = await getCurrentSession();
  if (!session || session.rol !== 'paciente') {
    return NextResponse.json({ success: false, error: 'No autorizado' }, { status: 401 });
  }

  try {
    const { contenido, tipo = 'texto' } = await request.json();
    if (!contenido || !contenido.trim()) {
      return NextResponse.json({ success: false, error: 'Contenido requerido' }, { status: 400 });
    }

    const msgId = `msg-${Date.now()}`;
    const cleanContent = contenido.trim();

    if (hasDbConnection()) {
      await query(
        `INSERT INTO mensajes_chat (id, usuario_id, nutriologo_id, remitente, contenido, tipo, leido)
         VALUES ($1, $2, 'usr-admin', 'usuario', $3, $4, false)`,
        [msgId, session.userId, cleanContent, tipo]
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        id: msgId,
        usuario_id: session.userId,
        remitente: 'usuario',
        contenido: cleanContent,
        tipo,
        leido: false,
        creado_en: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error('Error enviando mensaje de paciente:', error);
    return NextResponse.json({ success: false, error: 'Error al enviar mensaje' }, { status: 500 });
  }
}
