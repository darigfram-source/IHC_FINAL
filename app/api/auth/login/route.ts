import { NextResponse } from 'next/server';
import { crearClienteServidor } from '@/lib/supabase/server';
import { obtenerRol } from '@/lib/roles';
import { asegurarUsuario } from '@/lib/perfil';

const falla = (error: string, status: number, codigo?: string) =>
  NextResponse.json({ success: false, error, ...(codigo ? { codigo } : {}) }, { status });

export async function POST(request: Request) {
  try {
    const { email, password, expectedRole } = await request.json();
    if (!email || !password) return falla('Correo y contraseña requeridos', 400);

    const supabase = await crearClienteServidor();
    const { data, error } = await supabase.auth.signInWithPassword({
      email: String(email).trim().toLowerCase(),
      password: String(password),
    });

    if (error || !data.user) {
      if (error?.code === 'email_not_confirmed') {
        return falla('Confirma tu correo: te enviamos un enlace al registrarte (revisa spam).', 403, 'email_no_confirmado');
      }
      return falla('Credenciales inválidas. Verifica tu correo o contraseña.', 401);
    }

    let info = await obtenerRol(supabase, data.user.id);

    // Primer inicio de sesión de un paciente registrado desde la web: se crea su fila.
    if (info.rol === null && info.motivo === 'sin_perfil') {
      const creado = await asegurarUsuario(supabase, data.user);
      if (creado) info = await obtenerRol(supabase, data.user.id);
    }

    // Nutriólogo con el alta a medias (sin datos profesionales o en verificación): conserva la sesión
    // y va a su pantalla de solicitud o de espera; allí no ve pacientes ni el panel.
    if (info.rol === null && expectedRole === 'admin') {
      if (info.motivo === 'nutriologo_pendiente') {
        return NextResponse.json({ success: true, user: { email: data.user.email, rol: null }, redirectTo: '/admin/verificacion' });
      }
      if (info.motivo === 'sin_perfil') {
        return NextResponse.json({ success: true, user: { email: data.user.email, rol: null }, redirectTo: '/admin/solicitud' });
      }
    }

    if (info.rol === null) {
      await supabase.auth.signOut();
      return falla(
        info.motivo === 'nutriologo_pendiente'
          ? 'Tu cuenta de nutriólogo está pendiente de verificación de cédula.'
          : data.user.user_metadata?.tipo === 'nutriologo'
            ? 'Esta cuenta es de nutriólogo. Ingresa en el panel de administrador.'
            : 'Tu cuenta aún no tiene perfil. Completa el cuestionario de registro.',
        403
      );
    }

    if (expectedRole && info.rol !== expectedRole) {
      await supabase.auth.signOut();
      return falla(
        expectedRole === 'admin'
          ? 'Esta cuenta pertenece a un paciente. Ingresa en el portal del paciente.'
          : 'Esta cuenta pertenece al nutriólogo. Ingresa en el panel de administrador.',
        403
      );
    }

    return NextResponse.json({
      success: true,
      user: { id: info.id, email: data.user.email, nombre: info.nombre, rol: info.rol },
      redirectTo: info.rol === 'admin' ? '/admin' : '/paciente/dashboard',
    });
  } catch (e) {
    console.error('login:', e);
    return falla('Error procesando el inicio de sesión', 500);
  }
}
