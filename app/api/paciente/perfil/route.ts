import { NextResponse } from 'next/server';
import { getCurrentSession } from '@/lib/auth';
import { getPatientCompleteData, query, hasDbConnection } from '@/lib/db';

export async function GET() {
  const session = await getCurrentSession();
  if (!session || session.rol !== 'paciente') {
    return NextResponse.json({ success: false, error: 'No autorizado' }, { status: 401 });
  }

  const data = await getPatientCompleteData(session.userId);
  if (!data) {
    return NextResponse.json({ success: false, error: 'Paciente no encontrado' }, { status: 404 });
  }

  return NextResponse.json({ success: true, data });
}

export async function PUT(request: Request) {
  const session = await getCurrentSession();
  if (!session || session.rol !== 'paciente') {
    return NextResponse.json({ success: false, error: 'No autorizado' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { edad, estatura_cm, peso_objetivo, nivel_entrenamiento } = body;

    if (hasDbConnection()) {
      await query(
        `UPDATE perfiles_paciente
         SET edad = COALESCE($1, edad),
             estatura_cm = COALESCE($2, estatura_cm),
             peso_objetivo = COALESCE($3, peso_objetivo),
             nivel_entrenamiento = COALESCE($4, nivel_entrenamiento),
             actualizado_en = CURRENT_TIMESTAMP
         WHERE usuario_id = $5`,
        [edad, estatura_cm, peso_objetivo, nivel_entrenamiento, session.userId]
      );
    }

    return NextResponse.json({ success: true, message: 'Perfil actualizado' });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Error actualizando perfil' }, { status: 500 });
  }
}
