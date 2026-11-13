import { NextResponse } from 'next/server';
import { crearClienteServidor } from '@/lib/supabase/server';

const falla = (error: string, status: number) => NextResponse.json({ success: false, error }, { status });

/** Paso 1 del alta de nutriólogo: crea la cuenta (correo y contraseña). Los datos profesionales
 *  se capturan después, ya con el correo confirmado, en /admin/solicitud. */
export async function POST(request: Request) {
  try {
    const b = await request.json();
    const email = String(b.email ?? '').trim().toLowerCase();
    const password = String(b.password ?? '');
    if (!email || !password) return falla('Correo y contraseña son obligatorios', 400);
    const pw = password;
    if (pw.length < 8 || !/[a-z]/.test(pw) || !/[A-Z]/.test(pw) || !/[0-9]/.test(pw)) {
      return falla('La contraseña debe tener al menos 8 caracteres, con mayúsculas, minúsculas y números.', 400);
    }

    const supabase = await crearClienteServidor();
    const origin = new URL(request.url).origin;
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${origin}/auth/callback`,
        // Marca la cuenta como de nutriólogo para llevarla a su solicitud al confirmar el correo.
        data: { tipo: 'nutriologo' },
      },
    });

    if (error) {
      console.error('registro-nutriologo:', error.status, error.code, error.message);
      if (error.code === 'over_email_send_rate_limit' || error.status === 429) {
        return falla('Se enviaron muchos correos en poco tiempo. Espera unos minutos e inténtalo otra vez.', 429);
      }
      if (error.code === 'user_already_exists') return falla('Ya existe una cuenta con este correo.', 409);
      if (error.code === 'weak_password') return falla('La contraseña es muy débil. Usa 8 o más caracteres, mezclando letras y números.', 400);
      if (error.code === 'email_address_invalid') return falla('Ese correo no es válido. Revísalo e inténtalo de nuevo.', 400);
      if (error.code === 'signup_disabled') return falla('El registro de nuevas cuentas está desactivado en Supabase.', 403);
      return falla('No se pudo crear la cuenta. Revisa los datos e inténtalo de nuevo.', 400);
    }

    // Con confirmación de correo activa no hay sesión todavía.
    if (!data.session || !data.user) {
      return NextResponse.json({
        success: true,
        needsConfirmation: true,
        message: 'Revisa tu correo para confirmar tu cuenta. Después entra como nutriólogo y captura tus datos profesionales.',
      });
    }
    return NextResponse.json({ success: true, redirectTo: '/admin/solicitud' });
  } catch (e) {
    console.error('registro-nutriologo:', e);
    return falla('Error al registrar la cuenta', 500);
  }
}
