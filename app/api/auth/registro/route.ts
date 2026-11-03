import { NextResponse } from 'next/server';
import { query, hasDbConnection } from '@/lib/db';
import { hashPassword, createSessionToken, COOKIE_NAME } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      nombre,
      email,
      password,
      edad = 24,
      estatura_cm = 175,
      peso_actual = 70.0,
      peso_objetivo = 75.0,
      nivel_entrenamiento = 'Intermedio',
      condicion_renal_diabetes = false,
      embarazo_lactancia = false,
      trastorno_conducta_alimentaria = false,
      consentimiento_informado = true,
    } = body;

    if (!email || !password || !nombre) {
      return NextResponse.json(
        { success: false, error: 'Nombre, correo y contraseña son obligatorios' },
        { status: 400 }
      );
    }

    const cleanEmail = email.trim().toLowerCase();
    const userId = `usr-${Date.now()}`;
    const pwdHash = await hashPassword(password);

    // Calcular valores iniciales de hipertrofia (Morton 2018, Urdampilleta 2012)
    const proteina_g_kg = 1.75;
    const superavit_kcal = 450;
    const calorias_mantenimiento = Math.round(Number(peso_actual) * 32);
    const calorias_totales = calorias_mantenimiento + superavit_kcal;
    const carbohidratos_g = Math.round((calorias_totales * 0.55) / 4);
    const carbs_peri_entreno_g = 75;
    const grasas_g = Math.round(Number(peso_actual) * 0.95);

    const elegible = !condicion_renal_diabetes && !embarazo_lactancia && !trastorno_conducta_alimentaria;

    if (hasDbConnection()) {
      try {
        // Verificar existencia
        const existing = await query('SELECT id FROM usuarios WHERE LOWER(email) = $1', [cleanEmail]);
        if (existing && existing.length > 0) {
          return NextResponse.json(
            { success: false, error: 'Ya existe una cuenta registrada con este correo electrónico.' },
            { status: 409 }
          );
        }

        // Insertar usuario
        await query(
          'INSERT INTO usuarios (id, email, password_hash, rol, nombre) VALUES ($1, $2, $3, $4, $5)',
          [userId, cleanEmail, pwdHash, 'paciente', nombre]
        );

        // Insertar perfil de paciente
        await query(
          `INSERT INTO perfiles_paciente (
            usuario_id, nutriologo_id, edad, estatura_cm, peso_inicial, peso_actual, peso_objetivo,
            nivel_entrenamiento, condicion_renal_diabetes, embarazo_lactancia, trastorno_conducta_alimentaria,
            elegible, consentimiento_informado, proteina_g_kg, superavit_kcal, calorias_mantenimiento,
            calorias_totales, carbohidratos_g, carbs_peri_entreno_g, grasas_g, suplementacion_sugerida,
            estado, tendencia_cargas
          ) VALUES (
            $1, 'usr-admin', $2, $3, $4, $4, $5,
            $6, $7, $8, $9,
            $10, $11, $12, $13, $14,
            $15, $16, $17, $18, 'Creatina Monohidratada 5g/día constante',
            'En progreso', 'Suben'
          )`,
          [
            userId,
            edad,
            estatura_cm,
            peso_actual,
            peso_objetivo,
            nivel_entrenamiento,
            condicion_renal_diabetes,
            embarazo_lactancia,
            trastorno_conducta_alimentaria,
            elegible,
            consentimiento_informado,
            proteina_g_kg,
            superavit_kcal,
            calorias_mantenimiento,
            calorias_totales,
            carbohidratos_g,
            carbs_peri_entreno_g,
            grasas_g,
          ]
        );
      } catch (dbErr) {
        console.error('Error insertando usuario en BD:', dbErr);
      }
    }

    // Crear sesión
    const token = await createSessionToken({
      userId,
      email: cleanEmail,
      nombre,
      rol: 'paciente',
    });

    const response = NextResponse.json({
      success: true,
      user: { id: userId, email: cleanEmail, nombre, rol: 'paciente' },
      redirectTo: '/paciente/dashboard',
    });

    response.cookies.set(COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 7 * 24 * 60 * 60,
    });

    return response;
  } catch (err: any) {
    console.error('Error en registro:', err);
    return NextResponse.json(
      { success: false, error: 'Error al registrar nuevo paciente' },
      { status: 500 }
    );
  }
}
