import { NextResponse } from 'next/server';
import { INITIAL_REPORTES } from '@/lib/data/initialData';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const usuarioId = searchParams.get('usuarioId');

  const filtered = usuarioId
    ? INITIAL_REPORTES.filter((r) => r.usuario_id === usuarioId)
    : INITIAL_REPORTES;

  return NextResponse.json({
    success: true,
    data: filtered,
  });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const nuevoReporte = {
      id: `rep-${Date.now()}`,
      ...body,
      creado_en: new Date().toISOString(),
    };

    return NextResponse.json({
      success: true,
      data: nuevoReporte,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Error al generar reporte' },
      { status: 500 }
    );
  }
}
