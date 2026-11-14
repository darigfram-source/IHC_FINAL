import { NextResponse } from 'next/server';
import { crearClienteServidor } from '@/lib/supabase/server';
import { obtenerRol } from '@/lib/roles';

const falla = (error: string, status: number) => NextResponse.json({ success: false, error }, { status });

export async function POST(request: Request) {
  try {
    const { password } = await request.json();
    const pw = String(password ?? '');
    if (pw.length < 8 || !/[a-z]/.test(pw) || !/[A-Z]/.test(pw) || !/[0-9]/.test(pw)) {
      return falla('La contraseña debe tener al menos 8 caracteres, con mayúsculas, minúsculas y números.', 400);
    }

    const supabase = await crearClienteServidor();
    const { data: auth } = await supabase.auth.getUser();
    if (!auth.user) {
      return falla('El enlace venció o no es válido. Pide uno nuevo desde "¿Olvidaste tu contraseña?".', 401);
    }

    const { error } = await supabase.auth.updateUser({ password: pw });
    if (error) {
      console.error('nueva-contrasena:', error.status, error.code, error.message);
      if (error.code === 'same_password') return falla('La nueva contraseña debe ser distinta a la anterior.', 400);
      if (error.code === 'weak_password') return falla('La contraseña es muy débil. Prueba con una más larga.', 400);
      return falla('No se pudo cambiar la contraseña. Inténtalo de nuevo.', 400);
    }

    const info = await obtenerRol(supabase, auth.user.id);
    const redirectTo =
      info.rol === 'admin' ? '/admin' : info.rol === 'paciente' ? '/paciente/dashboard' : '/paciente/login';
    return NextResponse.json({ success: true, redirectTo });
  } catch (e) {
    console.error('nueva-contrasena:', e);
    return falla('Error procesando la solicitud.', 500);
  }
}
