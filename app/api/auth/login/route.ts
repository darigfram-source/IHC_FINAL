import { NextResponse } from 'next/server';
import { query, hasDbConnection } from '@/lib/db';
import { verifyPassword, createSessionToken, COOKIE_NAME } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const { email, password, expectedRole } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: 'Correo y contraseña requeridos' },
        { status: 400 }
      );
    }

    const cleanEmail = email.trim().toLowerCase();
    let user: any = null;

    if (hasDbConnection()) {
      try {
        const rows = await query('SELECT * FROM usuarios WHERE LOWER(email) = $1', [cleanEmail]);
        if (rows && rows.length > 0) {
          const candidate = rows[0];
          const isValid = await verifyPassword(password, candidate.password_hash);
          if (isValid) {
            user = candidate;
          }
        }
      } catch (err) {
        console.error('Error verificando usuario en DB:', err);
      }
    }

    // Fallback con credenciales oficiales documentadas
    if (!user) {
      if (cleanEmail === 'admin@nutrimasa.com' && (password === 'Password123!' || password === '12345678')) {
        user = {
          id: 'usr-admin',
          email: 'admin@nutrimasa.com',
          nombre: 'Nutriólogo Admin',
          rol: 'admin',
        };
      } else if (cleanEmail === 'dario@nutrimasa.com' && (password === 'Password123!' || password === '12345678')) {
        user = {
          id: 'usr-02',
          email: 'dario@nutrimasa.com',
          nombre: 'Darío Fuentes',
          rol: 'paciente',
        };
      } else if (cleanEmail === 'alan@nutrimasa.com' && (password === 'Password123!' || password === '12345678')) {
        user = {
          id: 'usr-01',
          email: 'alan@nutrimasa.com',
          nombre: 'Alan Salazar',
          rol: 'paciente',
        };
      } else if (cleanEmail === 'carlos@nutrimasa.com' && (password === 'Password123!' || password === '12345678')) {
        user = {
          id: 'usr-03',
          email: 'carlos@nutrimasa.com',
          nombre: 'Carlos Mendoza',
          rol: 'paciente',
        };
      }
    }

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Credenciales inválidas. Verifica tu correo o contraseña.' },
        { status: 401 }
      );
    }

    // Si se especificó un rol esperado, validar coherencia
    if (expectedRole && user.rol !== expectedRole) {
      const msg =
        expectedRole === 'admin'
          ? 'Esta cuenta pertenece a un paciente. Por favor ingresa en el portal del paciente.'
          : 'Esta cuenta pertenece al nutriólogo. Por favor ingresa en el panel de administrador.';
      return NextResponse.json({ success: false, error: msg }, { status: 403 });
    }

    // Generar JWT
    const token = await createSessionToken({
      userId: user.id,
      email: user.email,
      nombre: user.nombre,
      rol: user.rol,
    });

    const response = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        nombre: user.nombre,
        rol: user.rol,
      },
      redirectTo: user.rol === 'admin' ? '/admin' : '/paciente/dashboard',
    });

    // Establecer Cookie HTTP-Only Segura
    response.cookies.set(COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 7 * 24 * 60 * 60, // 7 días
    });

    return response;
  } catch (error: any) {
    console.error('Error en login:', error);
    return NextResponse.json(
      { success: false, error: 'Error procesando la solicitud de inicio de sesión' },
      { status: 500 }
    );
  }
}
