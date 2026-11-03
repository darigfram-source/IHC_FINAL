import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

const JWT_SECRET = new TextEncoder().encode(
  process.env.AUTH_SECRET || 'nutrimasa_jwt_secret_key_production_2026_sports_hypertrophy'
);

const COOKIE_NAME = 'nutrimasa_session';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get(COOKIE_NAME)?.value;

  let session: any = null;
  if (token) {
    try {
      const { payload } = await jwtVerify(token, JWT_SECRET);
      session = payload;
    } catch {
      session = null;
    }
  }

  // 1. Rutas protegidas de ADMINISTRADOR (Nutriólogo)
  if (pathname.startsWith('/admin')) {
    // Permitir acceso a la pantalla de login del admin
    if (pathname === '/admin/login') {
      if (session && session.rol === 'admin') {
        return NextResponse.redirect(new URL('/admin', request.url));
      }
      return NextResponse.next();
    }

    // Proteger resto de rutas /admin/*
    if (!session || session.rol !== 'admin') {
      const loginUrl = new URL('/admin/login', request.url);
      loginUrl.searchParams.set('from', pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  // 2. Rutas protegidas de PACIENTE (Cliente Web Móvil)
  if (pathname.startsWith('/paciente')) {
    // Permitir acceso a login y registro de pacientes
    if (pathname === '/paciente/login' || pathname === '/paciente/registro') {
      if (session && session.rol === 'paciente') {
        return NextResponse.redirect(new URL('/paciente/dashboard', request.url));
      }
      return NextResponse.next();
    }

    // Proteger dashboard, diario, gráficas, chat y menú del paciente
    if (!session || session.rol !== 'paciente') {
      const loginUrl = new URL('/paciente/login', request.url);
      loginUrl.searchParams.set('from', pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/paciente/:path*'],
};
