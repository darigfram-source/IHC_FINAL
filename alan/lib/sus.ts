// Escala SUS (usabilidad) y tiempo del registro diario. Mismo contenido que lib/sus.dart de la app.
export const PREGUNTAS_SUS = [
  'Creo que me gustaría usar esta aplicación con frecuencia.',
  'Encontré la aplicación innecesariamente compleja.',
  'Pensé que la aplicación era fácil de usar.',
  'Creo que necesitaría el apoyo de un técnico para usar esta aplicación.',
  'Encontré que las funciones de la aplicación estaban bien integradas.',
  'Pensé que había demasiada inconsistencia en la aplicación.',
  'Imagino que la mayoría de las personas aprenderían a usarla rápidamente.',
  'Encontré la aplicación muy incómoda de usar.',
  'Me sentí muy seguro usando la aplicación.',
  'Necesité aprender muchas cosas antes de poder usarla.',
] as const;

export const META_SEGUNDOS_REGISTRO = 30; // meta: llenar el registro en menos de 30 s
export const SUS_PROMEDIO_REFERENCIA = 68; // promedio de referencia de la escala

/** Puntaje SUS (0 a 100). `r` son 10 respuestas de 1 a 5. Impares: r-1. Pares: 5-r. Suma × 2.5. */
export function puntajeSus(r: number[]): number {
  if (r.length !== 10 || r.some((v) => !Number.isInteger(v) || v < 1 || v > 5)) {
    throw new Error('La escala SUS tiene 10 preguntas con respuestas de 1 a 5');
  }
  let suma = 0;
  for (let i = 0; i < 10; i++) suma += i % 2 === 0 ? r[i] - 1 : 5 - r[i];
  return suma * 2.5;
}

// Tiempos medidos en ESTE navegador (se borran con "Borrar mis datos"; ver lib/borrar-datos.ts).
const CLAVE_TIEMPOS = 'nutrimasa.tiempos_registro';
const MAX_TIEMPOS = 200;

export function leerTiemposRegistro(): number[] {
  try {
    const v = JSON.parse(localStorage.getItem(CLAVE_TIEMPOS) ?? '[]');
    return Array.isArray(v) ? v.filter((x) => typeof x === 'number' && Number.isFinite(x) && x >= 0) : [];
  } catch {
    return [];
  }
}

export function guardarTiempoRegistro(segundos: number): void {
  if (!Number.isFinite(segundos) || segundos < 0 || segundos > 3600) return;
  try {
    const lista = [...leerTiemposRegistro(), Math.round(segundos)].slice(-MAX_TIEMPOS);
    localStorage.setItem(CLAVE_TIEMPOS, JSON.stringify(lista));
  } catch {
    /* sin almacenamiento: no se mide */
  }
}

export function resumenTiempos(tiempos: number[]) {
  if (tiempos.length === 0) return null;
  const total = tiempos.length;
  return {
    ultimo: tiempos[total - 1],
    total,
    promedio: tiempos.reduce((a, b) => a + b, 0) / total,
    bajoMeta: tiempos.filter((t) => t < META_SEGUNDOS_REGISTRO).length,
  };
}
