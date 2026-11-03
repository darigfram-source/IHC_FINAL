// ============================================================================
// AUTENTICACIÓN Y SESIONES SEGURAS: NUTRIMASA
// Manejo de JWT con 'jose' y hash de contraseñas con 'bcryptjs'
// Roles: 'admin' (Nutriólogo) y 'paciente'
// ============================================================================

import { SignJWT, jwtVerify } from 'jose';
import bcrypt from 'bcryptjs';
import { cookies } from 'next/headers';

const JWT_SECRET = new TextEncoder().encode(
  process.env.AUTH_SECRET || 'nutrimasa_jwt_secret_key_production_2026_sports_hypertrophy'
);

export const COOKIE_NAME = 'nutrimasa_session';

export interface SessionPayload {
  userId: string;
  email: string;
  nombre: string;
  rol: 'admin' | 'paciente';
  iat?: number;
  exp?: number;
}

// Generación de Hash de contraseña
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

// Verificación de contraseña contra hash
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

// Creación de token JWT firmado
export async function createSessionToken(payload: Omit<SessionPayload, 'iat' | 'exp'>): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(JWT_SECRET);
}

// Verificación y decodificación de token JWT
export async function verifySessionToken(token: string): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload as unknown as SessionPayload;
  } catch (error) {
    return null;
  }
}

// Obtener sesión del usuario actual desde cookies del servidor
export async function getCurrentSession(): Promise<SessionPayload | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(COOKIE_NAME)?.value;
    if (!token) return null;
    return await verifySessionToken(token);
  } catch {
    return null;
  }
}
