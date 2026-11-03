import { NextResponse } from 'next/server';
import { INITIAL_ARTICULOS } from '@/lib/data/initialData';

export async function GET() {
  return NextResponse.json({
    success: true,
    data: INITIAL_ARTICULOS,
  });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const nuevoArticulo = {
      id: `art-${Date.now()}`,
      ...body,
      creado_en: new Date().toISOString().split('T')[0],
    };

    return NextResponse.json({
      success: true,
      data: nuevoArticulo,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Error al registrar artículo' },
      { status: 500 }
    );
  }
}
