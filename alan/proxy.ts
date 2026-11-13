import { NextResponse, type NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { envSupabase } from '@/lib/supabase/env';
import { obtenerRol } from '@/lib/roles';

// Next 16: "proxy" reemplaza a "middleware". Refresca la sesión de Supabase y protege rutas.
export async function proxy(request: NextRequest) {
  const { url, key } = envSupabase();
  let response = NextResponse.next({ request });

  const supabase = createServerClient(url, key, {
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll(lista) {
        lista.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        lista.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
      },
    },
  });

  // getUser() valida el token con Supabase (getSession() solo lo leería de la cookie).
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const redirigir = (ruta: string, from?: string) => {
    const destino = new URL(ruta, request.url);
    if (from) destino.searchParams.set('from', from);
    const r = NextResponse.redirect(destino);
    response.cookies.getAll().forEach((c) => r.cookies.set(c)); // conserva cookies refrescadas
    return r;
  };

  const { pathname } = request.nextUrl;
  const rol = user ? (await obtenerRol(supabase, user.id)).rol : null;

  if (pathname.startsWith('/admin')) {
    if (pathname === '/admin/login') return rol === 'admin' ? redirigir('/admin') : response;
    if (rol !== 'admin') return redirigir('/admin/login', pathname);
  }

  if (pathname.startsWith('/paciente')) {
    if (pathname === '/paciente/login' || pathname === '/paciente/registro') {
      return rol === 'paciente' ? redirigir('/paciente/dashboard') : response;
    }
    if (rol !== 'paciente') return redirigir('/paciente/login', pathname);
  }

  return response;
}

export const config = {
  matcher: ['/admin/:path*', '/paciente/:path*'],
};
