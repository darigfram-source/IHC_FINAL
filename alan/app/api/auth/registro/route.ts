import { NextResponse } from 'next/server';
import { crearClienteServidor } from '@/lib/supabase/server';
import { asegurarUsuario } from '@/lib/perfil';
import { motivosExclusion } from '@/lib/elegibilidad';

const falla = (error: string, status: number) =>
  NextResponse.json({ success: false, error }, { status });

export async function POST(request: Request) {
  try {
    const b = await request.json();
    const nombre = String(b.nombre ?? '').trim();
    const email = String(b.email ?? '').trim().toLowerCase();
    const password = String(b.password ?? '');

    if (!nombre || !email || !password) return falla('Nombre, correo y contraseña son obligatorios', 400);
    if (password.length < 8) return falla('La contraseña debe tener al menos 8 caracteres.', 400);

    // Criterios de exclusión y consentimiento: se revalidan en el servidor (el front se puede saltar).
    // Se juntan todos los motivos para poder mostrarlos de una vez, como hace la app.
    const motivos = motivosExclusion({
      edad: b.edad,
      nivel_entrenamiento: b.nivel_entrenamiento,
      sin_enfermedad_renal: b.sin_enfermedad_renal,
      sin_diabetes: b.sin_diabetes,
      sin_embarazo_lactancia: b.sin_embarazo_lactancia,
      sin_trastornos_alimenticios: b.sin_trastornos_alimenticios,
      experiencia_minima: b.experiencia_minima,
    });
    if (motivos.length) {
      return NextResponse.json(
        { success: false, error: 'Por seguridad, NutriMasa no es la opción adecuada para tu perfil. Te recomendamos acudir con un profesional de la salud.', motivos },
        { status: 422 }
      );
    }
    if (b.consentimiento_informado !== true) return falla('Debes aceptar el consentimiento informado.', 400);

    const edad = Number(b.edad);
    const estatura = Number(b.estatura_cm);
    const peso = Number(b.peso_actual);
    const meta = Number(b.peso_objetivo);
    if (!(edad >= 18 && edad <= 40)) return falla('El rango de edad del protocolo es de 18 a 40 años.', 422);
    if (!(estatura >= 120 && estatura <= 230) || !(peso >= 30 && peso <= 250) || !(meta >= 30 && meta <= 250)) {
      return falla('Revisa estatura y peso: hay valores fuera de rango.', 400);
    }

    // Nutriólogo elegido (solo si hay varios activos). Aquí no hay sesión para validarlo:
    // asegurarUsuario comprueba que siga activo al crear la fila y, si no, asigna al primero.
    const nutriologoId = typeof b.nutriologo_id === 'string' && b.nutriologo_id.length > 0 && b.nutriologo_id.length <= 64 ? b.nutriologo_id : undefined;

    const nivel = b.nivel_entrenamiento === 'Principiante' ? 'Principiante' : 'Intermedio';
    const supabase = await crearClienteServidor();
    const origin = new URL(request.url).origin;

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${origin}/auth/callback`,
        data: {
          perfil: {
            nombre,
            edad,
            estatura_cm: estatura,
            peso_actual: peso,
            peso_objetivo: meta,
            nivel_entrenamiento: nivel,
            consentimiento_informado: true,
            ...(nutriologoId ? { nutriologo_id: nutriologoId } : {}),
          },
        },
      },
    });

    if (error) {
      console.error('registro:', error.status, error.code, error.message);
      const msg = (error.message || '').toLowerCase();
      let texto = 'No se pudo crear la cuenta. Revisa los datos e inténtalo de nuevo.';
      let status = 400;

      if (error.code === 'over_email_send_rate_limit' || error.status === 429) {
        texto = 'Se enviaron demasiados correos de confirmación. Espera unos minutos e inténtalo de nuevo.';
        status = 429;
      } else if (error.code === 'weak_password') {
        texto = 'La contraseña es muy débil. Usa 8 o más caracteres, mezclando letras y números.';
      } else if (error.code === 'email_address_invalid') {
        texto = 'Ese correo no es válido o no se aceptan correos de ese dominio.';
      } else if (error.code === 'signup_disabled') {
        texto = 'El registro de nuevas cuentas está desactivado en Supabase.';
        status = 403;
      } else if (error.code === 'user_already_exists') {
        texto = 'Ya existe una cuenta con ese correo. Inicia sesión.';
        status = 409;
      } else if (msg.includes('invalid api key') || error.status === 401) {
        texto = 'La llave de Supabase en .env.local no es válida. Revisa NEXT_PUBLIC_SUPABASE_ANON_KEY.';
        status = 500;
      } else if (msg.includes('fetch failed') || error.status === 0) {
        texto = 'No se pudo conectar con Supabase. Revisa NEXT_PUBLIC_SUPABASE_URL y tu internet.';
        status = 502;
      } else if (msg.includes('database error')) {
        texto = 'Supabase falló al guardar la cuenta (error de base de datos). Revisa los logs de Auth.';
        status = 500;
      }
      // En desarrollo se añade el código técnico para depurar más rápido.
      if (process.env.NODE_ENV !== 'production') texto += ` [${error.code ?? error.status}: ${error.message}]`;
      return falla(texto, status);
    }

    // Con confirmación de correo activa no hay sesión todavía: se pide confirmar.
    if (!data.session || !data.user) {
      return NextResponse.json({
        success: true,
        needsConfirmation: true,
        message: 'Te enviamos un enlace de confirmación. Ábrelo y luego inicia sesión.',
      });
    }

    await asegurarUsuario(supabase, data.user);
    return NextResponse.json({ success: true, redirectTo: '/paciente/dashboard' });
  } catch (e) {
    console.error('registro:', e);
    return falla('Error al registrar nuevo paciente', 500);
  }
}
