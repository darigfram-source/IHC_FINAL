// Lógica pura de la sincronización periódica del chat con el nutriólogo (sin React, fácil de probar).

export interface MensajeChat {
  id: string;
  usuario_id: string;
  remitente: 'usuario' | 'nutriologo';
  contenido: string;
  tipo?: string;
  creado_en?: string;
  editado_en?: string | null;
  /** Lo que dice la base: es el mismo valor que usa la app. */
  leido?: boolean;
}

export const INTERVALO_BASE_MS = 15_000; // cada cuánto se consulta con la pestaña visible
export const INTERVALO_MAX_MS = 60_000; // tope cuando hay fallos seguidos

/** Espera hasta la siguiente consulta: crece al doble con cada fallo seguido, hasta el tope. */
export function esperaSiguiente(fallosSeguidos: number): number {
  if (fallosSeguidos <= 0) return INTERVALO_BASE_MS;
  return Math.min(INTERVALO_BASE_MS * 2 ** fallosSeguidos, INTERVALO_MAX_MS);
}

/**
 * Mezcla la lista del servidor con los mensajes que el paciente acaba de escribir y aún no tienen id real
 * (`local-…`). Un local se conserva solo si el servidor todavía no trae un mensaje igual del paciente,
 * para que no desaparezca ni se duplique mientras el envío está en curso.
 */
export function mezclarMensajes(servidor: MensajeChat[], actuales: MensajeChat[]): MensajeChat[] {
  const locales = actuales.filter((m) => m.id.startsWith('local-'));
  if (!locales.length) return servidor;
  const sobrantes = [...servidor.filter((m) => m.remitente === 'usuario')];
  const pendientes = locales.filter((l) => {
    const i = sobrantes.findIndex((s) => s.contenido === l.contenido);
    if (i === -1) return true; // el servidor aún no lo trae
    sobrantes.splice(i, 1); // se empareja una sola vez (dos mensajes iguales no se confunden)
    return false;
  });
  return [...servidor, ...pendientes];
}

/** ¿Cambió algo? Evita volver a pintar (y mover el scroll) si la lista es la misma. */
export function listasIguales(a: MensajeChat[], b: MensajeChat[]): boolean {
  if (a.length !== b.length) return false;
  return a.every((m, i) => m.id === b[i].id && m.contenido === b[i].contenido && (m.editado_en ?? null) === (b[i].editado_en ?? null) && (m.leido ?? null) === (b[i].leido ?? null));
}

/** Cuántos mensajes del nutriólogo hay que la persona aún no ha leído. La fuente es el campo `leido` de la base (el mismo
 *  que usa la app), no algo guardado solo en esta pantalla. */
export function sinLeerDelNutriologo(lista: MensajeChat[]): number {
  return lista.filter((m) => m.remitente === 'nutriologo' && m.leido === false).length;
}

/** La lista con los mensajes del nutriólogo ya marcados como leídos (se usa al instante, antes de que el servidor responda). */
export function conNutriologoLeido(lista: MensajeChat[]): MensajeChat[] {
  return lista.map((m) => (m.remitente === 'nutriologo' && m.leido === false ? { ...m, leido: true } : m));
}

/** ¿Pidió revisión y el nutriólogo todavía no responde? */
export function revisionPendienteEn(lista: MensajeChat[]): boolean {
  const ultNut = lista.map((m) => m.remitente).lastIndexOf('nutriologo');
  return lista.slice(ultNut + 1).some((m) => m.remitente === 'usuario' && m.contenido.includes('revisión de un nutriólogo'));
}
