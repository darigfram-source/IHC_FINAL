// Port a TypeScript de lib/recordatorio.dart (app Flutter) más las preferencias del recordatorio.
// En la web los avisos solo salen con la página (o la app instalada) abierta: no hay envío "push".

export interface PrefsRecordatorio {
  activo: boolean;
  hora: number; // 0-23
  min: number; // 0-59
}

/** Igual que la app: activado y a las 20:00. */
export const PREFS_POR_DEFECTO: PrefsRecordatorio = { activo: true, hora: 20, min: 0 };

const enteroEn = (v: unknown, min: number, max: number, defecto: number) => {
  const n = typeof v === 'number' ? v : Number(v);
  return Number.isInteger(n) && n >= min && n <= max ? n : defecto;
};

/** Lee preferencias guardadas (texto JSON) y descarta lo que no sea válido. */
export function leerPrefs(texto: string | null): PrefsRecordatorio {
  if (!texto) return { ...PREFS_POR_DEFECTO };
  try {
    const j = JSON.parse(texto) as Partial<PrefsRecordatorio>;
    return {
      activo: typeof j.activo === 'boolean' ? j.activo : PREFS_POR_DEFECTO.activo,
      hora: enteroEn(j.hora, 0, 23, PREFS_POR_DEFECTO.hora),
      min: enteroEn(j.min, 0, 59, PREFS_POR_DEFECTO.min),
    };
  } catch {
    return { ...PREFS_POR_DEFECTO };
  }
}

/** "20:00" -> { hora: 20, min: 0 }. null si no es una hora válida. */
export function analizarHora(valor: string): { hora: number; min: number } | null {
  const m = /^(\d{1,2}):(\d{2})$/.exec(valor.trim());
  if (!m) return null;
  const hora = Number(m[1]);
  const min = Number(m[2]);
  return hora <= 23 && min <= 59 ? { hora, min } : null;
}

export const formatoHora = (hora: number, min: number) =>
  `${String(hora).padStart(2, '0')}:${String(min).padStart(2, '0')}`;

/** AAAA-MM-DD con la fecha LOCAL (no UTC): "hoy" es el del paciente. */
export const claveDia = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

/** Cuándo toca el próximo recordatorio (hora local). Si hoy ya hay registro, o la hora de hoy ya pasó,
 *  es mañana. Misma lógica que proximoRecordatorio de la app. */
export function proximoRecordatorio(p: { ahora: Date; hora: number; min: number; registroHoy: boolean }): Date {
  const { ahora, hora, min, registroHoy } = p;
  const hoy = new Date(ahora.getFullYear(), ahora.getMonth(), ahora.getDate(), hora, min);
  if (registroHoy || hoy.getTime() <= ahora.getTime()) {
    return new Date(ahora.getFullYear(), ahora.getMonth(), ahora.getDate() + 1, hora, min);
  }
  return hoy;
}

/** ¿Hay que avisar ahora? Solo una vez al día, pasada la hora elegida y si aún no hay registro de hoy. */
export function debeAvisarRegistro(p: {
  ahora: Date;
  prefs: PrefsRecordatorio;
  registroHoy: boolean;
  ultimoAvisoDia: string | null;
}): boolean {
  const { ahora, prefs } = p;
  if (!prefs.activo || p.registroHoy) return false;
  if (p.ultimoAvisoDia === claveDia(ahora)) return false;
  const hoyALaHora = new Date(ahora.getFullYear(), ahora.getMonth(), ahora.getDate(), prefs.hora, prefs.min);
  return ahora.getTime() >= hoyALaHora.getTime();
}

/** Mensajes del nutriólogo posteriores a la última marca vista. Devuelve cuántos y la marca nueva.
 *  Sin marca previa (primera vez en este navegador) solo se fija la marca: no se avisa de lo viejo. */
export function mensajesNuevosDelNutriologo(
  mensajes: { remitente: string; creado_en: string; leido?: boolean }[],
  ultimaMarca: string | null
): { nuevos: number; marca: string | null } {
  const previa = ultimaMarca ? Date.parse(ultimaMarca) : NaN;
  const base = Number.isNaN(previa) ? null : previa;
  let nuevos = 0;
  let marca: string | null = ultimaMarca && base !== null ? ultimaMarca : null;
  let marcaMs = base ?? -Infinity;
  for (const m of mensajes) {
    if (m.remitente !== 'nutriologo') continue;
    const ms = Date.parse(m.creado_en);
    if (Number.isNaN(ms)) continue;
    // Uno ya leído (p. ej. en la app) no cuenta como nuevo, pero sí adelanta la marca.
    if (base !== null && ms > base && m.leido !== true) nuevos++;
    if (ms > marcaMs) {
      marcaMs = ms;
      marca = m.creado_en;
    }
  }
  return { nuevos, marca };
}
