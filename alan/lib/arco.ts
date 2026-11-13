// Derechos ARCO (LFPDPPP): acceso, rectificación, cancelación y oposición. Mismo contenido que lib/arco.dart de la app.
export const TIPOS_ARCO = [
  { clave: 'acceso', titulo: 'Acceso', ayuda: 'Conocer qué datos tuyos tenemos y cómo los usamos.' },
  { clave: 'rectificacion', titulo: 'Rectificación', ayuda: 'Corregir datos tuyos que estén mal o incompletos.' },
  { clave: 'cancelacion', titulo: 'Cancelación', ayuda: 'Pedir que se eliminen tus datos de nuestros registros.' },
  { clave: 'oposicion', titulo: 'Oposición', ayuda: 'Oponerte a que usemos tus datos para un fin concreto.' },
] as const;

export type TipoArco = (typeof TIPOS_ARCO)[number]['clave'];
export type EstadoArco = 'recibida' | 'en_proceso' | 'atendida' | 'rechazada';

export const ARCO_MIN_CARACTERES = 10; // la base también lo exige (CHECK en solicitudes_arco)
export const ARCO_MAX_CARACTERES = 1000;

export interface SolicitudArco {
  id: string;
  tipo: string;
  descripcion: string;
  estado: string;
  respuesta: string | null;
  creado_en: string;
  atendido_en?: string | null;
}

/** Una solicitud sigue abierta mientras está recibida o en proceso (igual que `abierta` en arco.dart).
 *  Acepta la solicitud completa o solo su estado. */
export function arcoAbierta(x: string | { estado: string }): boolean {
  const estado = typeof x === 'string' ? x : x.estado;
  return estado === 'recibida' || estado === 'en_proceso';
}

export function etiquetaTipoArco(clave: string): string {
  return TIPOS_ARCO.find((t) => t.clave === clave)?.titulo ?? clave;
}

export function etiquetaEstadoArco(estado: string): string {
  switch (estado) {
    case 'en_proceso':
      return 'En proceso';
    case 'atendida':
      return 'Atendida';
    case 'rechazada':
      return 'Rechazada';
    default:
      return 'Recibida';
  }
}

export const COLOR_ESTADO_ARCO: Record<string, string> = {
  recibida: 'bg-blue-500/10 text-blue-700 dark:text-blue-300 border-blue-500/30',
  en_proceso: 'bg-amber-500/10 text-amber-800 dark:text-amber-300 border-amber-500/30',
  atendida: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/30',
  rechazada: 'bg-rose-500/10 text-rose-700 dark:text-rose-300 border-rose-500/30',
};

/** Devuelve el texto del error, o null si la solicitud es válida. Se usa en la pantalla y en la API. */
export function validarSolicitudArco(tipo: string, descripcion: string): string | null {
  if (!TIPOS_ARCO.some((t) => t.clave === tipo)) return 'Elige qué quieres solicitar.';
  const texto = descripcion.trim();
  if (texto.length < ARCO_MIN_CARACTERES) return `Cuéntanos un poco más (mínimo ${ARCO_MIN_CARACTERES} caracteres).`;
  if (texto.length > ARCO_MAX_CARACTERES) return `Máximo ${ARCO_MAX_CARACTERES} caracteres.`;
  return null;
}
