import { NextResponse } from 'next/server';
import { crearClienteServidor } from '@/lib/supabase/server';

// Siempre responde lo mismo exista o no el correo, para no revelar qué cuentas están registradas.
const RESPUESTA =
  'Si ese correo tiene una cuenta, te enviamos un enlace para crear una nueva contraseña. Revisa también spam.';

export async function POST(request: Request) {
  try {
    const { email } = await request.json();
    const correo = String(email ?? '').trim().toLowerCase();
    if (!/^\S+@\S+\.\S+$/.test(correo)) {
      return NextResponse.json({ success: false, error: 'Escribe un correo válido.' }, { status: 400 });
    }

    const supabase = await crearClienteServidor();
    const origin = new URL(request.url).origin;
    const { error } = await supabase.auth.resetPasswordForEmail(correo, {
      // Misma URL que ya está permitida para confirmar cuenta (sin parámetros extra).
      redirectTo: `${origin}/auth/callback`,
    });

    if (error) {
      console.error('recuperar:', error.status, error.code, error.message);
      if (error.status === 429 || error.code === 'over_email_send_rate_limit') {
        return NextResponse.json(
          { success: false, error: 'Se enviaron demasiados correos. Espera unos minutos e inténtalo de nuevo.' },
          { status: 429 }
        );
      }
      // Cualquier otro error se oculta igual que si el correo no existiera.
    }

    const res = NextResponse.json({ success: true, message: RESPUESTA });
    // Marca que este navegador pidió recuperar contraseña: /auth/callback lo usa para saber
    // que el enlace del correo es de recuperación y no de confirmación de cuenta.
    res.cookies.set('nm_recuperar', '1', {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60,
      path: '/',
    });
    return res;
  } catch (e) {
    console.error('recuperar:', e);
    return NextResponse.json({ success: false, error: 'No se pudo procesar la solicitud.' }, { status: 500 });
  }
}
