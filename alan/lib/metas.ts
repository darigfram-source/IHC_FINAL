// Port a TypeScript de la pantalla Metas y del "avance hacia tu meta" de la app Flutter
// (menu_pages.dart: MetasPage, inicio_tab.dart: _avance). Mantener sincronizado.

export const META_MIN_KG = 30;
export const META_MAX_KG = 250;

/** Lee el peso objetivo escrito por la persona ("82", "82.5", "82,5"). null si no es válido (30 a 250 kg). */
export function leerMeta(texto: string): number | null {
  const t = texto.trim().replace(',', '.');
  if (!/^\d{1,3}(\.\d{1,2})?$/.test(t)) return null;
  const v = Number(t);
  return v >= META_MIN_KG && v <= META_MAX_KG ? Math.round(v * 10) / 10 : null;
}

export const n1 = (v: number) => v.toFixed(1);

/** Texto de la tarjeta: cuánto falta (o que ya se alcanzó). */
export function textoFalta(pesoActual: number, meta: number): string {
  const falta = meta - pesoActual;
  return falta > 0
    ? `Hoy pesas ${n1(pesoActual)} kg. Te faltan ${n1(falta)} kg.`
    : `Hoy pesas ${n1(pesoActual)} kg. ¡Ya alcanzaste tu meta!`;
}

export interface Avance {
  /** 0 a 100 */
  pct: number;
  mensaje: string;
}

/** Avance desde el primer peso registrado hasta la meta. null si no hay de dónde medirlo
 *  (sin registros, o la meta no está por encima del peso con el que empezó), igual que la app. */
export function avanceHaciaMeta(p: { pesoInicial: number | null; pesoActual: number; meta: number }): Avance | null {
  const { pesoInicial, pesoActual, meta } = p;
  if (pesoInicial === null || !Number.isFinite(pesoInicial)) return null;
  const total = meta - pesoInicial;
  if (total <= 0) return null;
  const pct = Math.min(1, Math.max(0, (pesoActual - pesoInicial) / total));
  const mensaje =
    pct >= 1
      ? '¡Alcanzaste tu meta!'
      : pct >= 0.5
        ? 'Ya pasaste la mitad del camino. ¡Sigue así!'
        : 'Vas avanzando. La constancia es lo que cuenta.';
  return { pct: Math.round(pct * 100), mensaje };
}

/** Aviso suave (no bloquea) cuando la meta se aleja del plan de ganar masa. Es un añadido de la web. */
export function avisoDeMeta(pesoActual: number, meta: number): string | null {
  if (meta < pesoActual - 0.05) {
    return 'Tu meta está por debajo de tu peso actual y el plan de NutriMasa busca ganar masa. Puedes guardarla, pero coméntalo con tu nutriólogo.';
  }
  if (meta - pesoActual > 15) {
    return 'Es una meta lejana (más de 15 kg por encima de tu peso). Puedes guardarla, pero conviene comentarla con tu nutriólogo para fijar etapas.';
  }
  return null;
}
