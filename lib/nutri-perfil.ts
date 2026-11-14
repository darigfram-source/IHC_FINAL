// Perfil profesional de un nutriólogo (port de perfil_nutri.dart), tal como lo ven los pacientes.

export interface PerfilNutri {
  id: string;
  nombre: string; // nombre real completo (el que se verifica con la cédula)
  apodo: string | null; // nombre público; vacío = se usa el nombre real
  institucion: string | null;
  especialidad: string | null;
  cedula_verificada: boolean;
  /** Solo en la pantalla "Mi nutriólogo"; la lista pública no la incluye. */
  cedula_profesional?: string | null;
}

/** Como lo ven los pacientes: el apodo si lo puso, si no el nombre real. */
export const nombreVisible = (n: Pick<PerfilNutri, 'nombre' | 'apodo'>) => (n.apodo?.trim() || n.nombre || '').trim();

/** true si hay que mostrar también el nombre real (el apodo no lo sustituye). */
export const muestraNombreReal = (n: Pick<PerfilNutri, 'nombre' | 'apodo'>) => {
  const apodo = n.apodo?.trim() ?? '';
  return apodo !== '' && !!n.nombre && apodo !== n.nombre;
};

/** Iniciales para el avatar (máximo 2 letras). */
export function iniciales(n: Pick<PerfilNutri, 'nombre' | 'apodo'>): string {
  const partes = nombreVisible(n).split(/\s+/).filter(Boolean);
  if (partes.length === 0) return 'NU';
  if (partes.length === 1) return partes[0][0].toUpperCase();
  return (partes[0][0] + partes[1][0]).toUpperCase();
}

/** Con más de un nutriólogo activo, la persona debe elegir uno al registrarse. */
export const debeElegirNutri = (activos: unknown[]) => activos.length > 1;

export const CAMPOS_PUBLICOS_NUTRI = 'id, nombre, apodo, institucion, especialidad, cedula_verificada';

// ---- Reglas de captura del alta de nutriólogo (las mismas que exige la base; la base manda) ----
export const validarNombreNutri = (v: unknown): string | null =>
  String(v ?? '').trim().length < 5 ? 'Escribe tu nombre completo' : null;

export const validarCedulaNutri = (v: unknown): string | null =>
  /^[0-9]{7,8}$/.test(String(v ?? '').trim()) ? null : 'La cédula tiene 7 u 8 dígitos';

export const validarEspecialidadNutri = (v: unknown): string | null =>
  String(v ?? '').trim().length < 3 ? 'Escribe tu especialidad' : null;

export const APODO_MAX = 40;

export type EstadoAccesoNutri = 'sin_solicitud' | 'pendiente' | 'activo';

/** Fila propia del nutriólogo (incluso pendiente), con los campos que él mismo edita. */
export interface PerfilNutriPropio extends PerfilNutri {
  cedula_profesional: string | null;
  activo: boolean;
}

export const CAMPOS_PERFIL_PROPIO = `${CAMPOS_PUBLICOS_NUTRI}, cedula_profesional, activo`;

export function estadoAcceso(fila: Pick<PerfilNutriPropio, 'activo' | 'cedula_verificada'> | null): EstadoAccesoNutri {
  if (!fila) return 'sin_solicitud';
  // Igual que lib/roles.ts: entra al panel solo con cédula verificada y cuenta activa.
  return fila.activo && fila.cedula_verificada ? 'activo' : 'pendiente';
}
