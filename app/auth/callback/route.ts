import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import type { EmailOtpType } from '@supabase/supabase-js';
import { crearClienteServidor } from '@/lib/supabase/server';
import { asegurarUsuario } from '@/lib/perfil';

// Destino de los enlaces de correo (confirmar cuenta y recuperar contraseña).
// Agrega esta URL en Supabase > Authentication > URL Configuration > Redirect URLs.
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const tokenHash = searchParams.get('token_hash');
  const type = searchParams.get('type') as EmailOtpType | null;

  const cookieStore = await cookies();
  const esRecuperacion = type === 'recovery' || cookieStore.get('nm_recuperar')?.value === '1';

  const supabase = await crearClienteServidor();
  let sesion = false;

  if (code) {
    sesion = !(await supabase.auth.exchangeCodeForSession(code)).error;
  } else if (tokenHash && type) {
    sesion = !(await supabase.auth.verifyOtp({ type, token_hash: tokenHash })).error;
  }

  const ir = (ruta: string) => {
    const res = NextResponse.redirect(`${origin}${ruta}`);
    if (esRecuperacion && sesion) res.cookies.delete('nm_recuperar');
    return res;
  };

  if (esRecuperacion) {
    // Con sesión válida: pantalla para escribir la nueva contraseña.
    // Sin sesión (abrió el enlace en otro navegador o venció): que pida uno nuevo.
    return sesion ? ir('/nueva-contrasena') : NextResponse.redirect(`${origin}/recuperar?error=enlace`);
  }

  if (sesion) {
    const { data } = await supabase.auth.getUser();
    if (data.user) {
      // Cuenta de nutriólogo: ya con el correo confirmado, a capturar sus datos profesionales.
      if (data.user.user_metadata?.tipo === 'nutriologo') return NextResponse.redirect(`${origin}/admin/solicitud`);
      const creado = await asegurarUsuario(supabase, data.user);
      if (creado) return NextResponse.redirect(`${origin}/paciente/dashboard`);
    }
  }

  // Si abrió el enlace en otro dispositivo no hay sesión, pero el correo ya quedó confirmado.
  return NextResponse.redirect(`${origin}/paciente/login?confirmado=1`);
}
