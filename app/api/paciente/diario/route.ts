import { NextResponse } from 'next/server';
import { getCurrentSession } from '@/lib/auth';
import { insertDailyLog, query, hasDbConnection } from '@/lib/db';

export async function GET() {
  const session = await getCurrentSession();
  if (!session || session.rol !== 'paciente') {
    return NextResponse.json({ success: false, error: 'No autorizado' }, { status: 401 });
  }

  if (hasDbConnection()) {
    try {
      const logs = await query(
        'SELECT * FROM registros_diarios WHERE usuario_id = $1 ORDER BY fecha ASC',
        [session.userId]
      );
      return NextResponse.json({ success: true, data: logs });
    } catch (e) {
      console.error('Error obteniendo registros diarios:', e);
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
    const body = await request.json();
    const {
      fecha = new Date().toISOString().split('T')[0],
      peso_ayunas,
      sentadilla_kg,
      press_banca_kg,
      volumen_entrenamiento_kg,
      proteina_consumida_g = 0,
      notas = '',
    } = body;

    if (!peso_ayunas) {
      return NextResponse.json(
        { success: false, error: 'El peso en ayunas es obligatorio' },
        { status: 400 }
      );
    }

    const pesoNum = Number(peso_ayunas);
    const proteinaNum = Number(proteina_consumida_g);
    const alerta_exceso_proteina = pesoNum > 0 && proteinaNum / pesoNum > 2.0;

    const result = await insertDailyLog(session.userId, {
      fecha,
      peso_ayunas: pesoNum,
      sentadilla_kg: Number(sentadilla_kg) || 0,
      press_banca_kg: Number(press_banca_kg) || 0,
      volumen_entrenamiento_kg: Number(volumen_entrenamiento_kg) || 0,
      proteina_consumida_g: proteinaNum,
      alerta_exceso_proteina,
      notas,
    });

    return NextResponse.json({
      success: true,
      message: 'Registro diario guardado y sincronizado exitosamente',
      id: result.id,
      alerta_exceso_proteina,
    });
  } catch (error) {
    console.error('Error guardando registro diario:', error);
    return NextResponse.json(
      { success: false, error: 'Error procesando el registro diario' },
      { status: 500 }
    );
  }
}
