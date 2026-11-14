import { NextResponse } from 'next/server';
import { crearClienteServidor } from '@/lib/supabase/server';

// Siempre responde lo mismo exista o no el correo (o ya esté confirmado), para no revelar qué cuentas están registradas.
const RESPUESTA = 'Si ese correo está pendiente de confirmar, te enviamos otro enlace. Revisa también la carpeta de spam.';

/** Vuelve a mandar el correo de confirmación de cuenta (por si no llegó o venció). Equivale a Nube.reenviarConfirmacion de la app. */
export async function POST(request: Request) {
  try {
    const { email } = await request.json().catch(() => ({}));
    const correo = String(email ?? '').trim().toLowerCase();
    if (!/^\S+@\S+\.\S+$/.test(correo)) {
      return NextResponse.json({ success: false, error: 'Escribe un correo válido.' }, { status: 400 });
    }

    const supabase = await crearClienteServidor();
    const origin = new URL(request.url).origin;
    const { error } = await supabase.auth.resend({
      type: 'signup',
      email: correo,
      // Misma URL que usa el registro (ya está permitida en Supabase).
      options: { emailRedirectTo: `${origin}/auth/callback` },
    });

    if (error) {
      console.error('reenviar-confirmacion:', error.status, error.code, error.message);
      if (error.status === 429 || error.code === 'over_email_send_rate_limit' || /seconds|rate limit|too many/i.test(error.message)) {
        return NextResponse.json({ success: false, error: 'Espera un minuto antes de pedir otro correo.' }, { status: 429 });
      }
      // Cualquier otro error se oculta igual que si el correo no existiera.
    }

    const res = NextResponse.json({ success: true, message: RESPUESTA });
    // El enlace de este correo es de confirmación: se quita la marca de "recuperar contraseña" si quedó de antes.
    res.cookies.set('nm_recuperar', '', { httpOnly: true, sameSite: 'lax', secure: process.env.NODE_ENV === 'production', maxAge: 0, path: '/' });
    return res;
  } catch (e) {
    console.error('reenviar-confirmacion:', e);
    return NextResponse.json({ success: false, error: 'No se pudo procesar la solicitud.' }, { status: 500 });
  }
}
