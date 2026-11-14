// Editar y eliminar mensajes propios: solo durante los primeros 5 minutos.
// Misma regla que la app Flutter (chat_reglas.dart) y que valida la base de datos.
export const VENTANA_MENSAJE_MS = 5 * 60 * 1000;

/** ¿Sigue dentro de los 5 minutos? `creadoIso` es la fecha original (ISO) del mensaje. */
export function dentroDeVentana(creadoIso: string | undefined | null, ahoraMs = Date.now()): boolean {
  if (!creadoIso) return false;
  const t = new Date(creadoIso).getTime();
  return Number.isFinite(t) && ahoraMs - t <= VENTANA_MENSAJE_MS;
}

/** Traduce el error de la base a un texto para la persona. */
export function errorModificarMensaje(msg: string | undefined): string {
  const t = msg ?? '';
  if (t.includes('5 minutos')) return 'Pasaron más de 5 minutos: ya no se puede modificar este mensaje.';
  if (t.includes('Solo quien escribió')) return 'Solo quien escribió el mensaje puede modificarlo.';
  return 'No se pudo completar. Revisa tu conexión e inténtalo de nuevo.';
}
