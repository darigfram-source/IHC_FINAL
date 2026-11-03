import { NextResponse } from 'next/server';
import { INITIAL_USUARIOS } from '@/lib/data/initialData';

export async function GET() {
  return NextResponse.json({
    success: true,
    data: INITIAL_USUARIOS,
  });
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { usuarioId, superavit_kcal, proteina_g_kg } = body;

    return NextResponse.json({
      success: true,
      message: 'Plan de usuario actualizado correctamente',
      updated: { usuarioId, superavit_kcal, proteina_g_kg },
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Error procesando solicitud' },
      { status: 500 }
    );
  }
}
