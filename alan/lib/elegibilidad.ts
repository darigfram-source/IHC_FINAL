// Criterios de elegibilidad del registro del paciente. Los usa la pantalla (para avisar todos los motivos
// juntos) y el servidor (que no se fía de la pantalla). Mismos criterios que la app Flutter, más la
// experiencia mínima que la web ya pedía.

export const EDAD_MIN = 18;
export const EDAD_MAX = 40;

export interface DatosElegibilidad {
  edad: unknown;
  nivel_entrenamiento: unknown;
  sin_enfermedad_renal: unknown;
  sin_diabetes: unknown;
  sin_embarazo_lactancia: unknown;
  sin_trastornos_alimenticios: unknown;
  experiencia_minima: unknown;
}

/**
 * Motivos por los que NutriMasa no es la opción adecuada. Lista vacía = puede continuar.
 * Cada declaración de salud debe venir en `true`: si falta o viene en otro valor se trata como no cumplida,
 * porque quien llame a la API sin pasar por la pantalla no debe saltarse el filtro.
 */
export function motivosExclusion(d: DatosElegibilidad): string[] {
  const motivos: string[] = [];
  const edad = Number(d.edad);
  if (!(edad >= EDAD_MIN && edad <= EDAD_MAX)) motivos.push(`El protocolo es para adultos de ${EDAD_MIN} a ${EDAD_MAX} años.`);
  if (d.nivel_entrenamiento === 'Avanzado') motivos.push('Esta versión es para personas con nivel principiante o intermedio.');
  if (d.sin_enfermedad_renal !== true) motivos.push('Enfermedad renal o hepática crónica.');
  if (d.sin_diabetes !== true) motivos.push('Diabetes.');
  if (d.sin_embarazo_lactancia !== true) motivos.push('Embarazo o lactancia.');
  if (d.sin_trastornos_alimenticios !== true) motivos.push('Trastorno de la conducta alimentaria (se requiere alta médica previa).');
  if (d.experiencia_minima !== true) motivos.push('Se requieren al menos 6 meses continuos de entrenamiento con pesas.');
  return motivos;
}
