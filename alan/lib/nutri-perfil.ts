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
