// Port a TypeScript de lib/motor_reglas.dart (app Flutter). Mantener sincronizados:
// las dos plataformas deben dar el mismo plan y el mismo estado para el mismo usuario.
export const GKG_MIN = 1.6;
export const GKG_MAX = 1.8;
export const GKG_TOPE = 2.0;
export const PROTEINA_MAX_REGISTRO_G = 600; // tope de captura en el registro (igual que la app)
export const SUPERAVIT_MIN = 400;
export const SUPERAVIT_MAX = 500;
export const SUPERAVIT_BASE = 450;

export const limitarSuperavit = (kcal: number) =>
  Math.min(SUPERAVIT_MAX, Math.max(SUPERAVIT_MIN, Math.round(kcal)));

export type EstadoMotor = 'sinDatos' | 'enProgreso' | 'estancado' | 'pesoSubeCargasNo';

export interface RegistroBase {
  fecha: string; // YYYY-MM-DD
  peso_ayunas: number | null;
  sentadilla_kg: number | null;
  press_banca_kg: number | null;
}

const soloFecha = (s: string) => new Date(`${s.slice(0, 10)}T00:00:00`).getTime();
const DIA = 86_400_000;
const cargas = (r: RegistroBase) => (r.sentadilla_kg ?? 0) + (r.press_banca_kg ?? 0);

/** Compara el primer y el último registro de los últimos 14 días (igual que la app). */
export function tendencia(registros: RegistroBase[], hoy = new Date()) {
  const h = soloFecha(hoy.toISOString());
  const desde = h - 13 * DIA;
  const v = registros
    .filter((r) => {
      const f = soloFecha(r.fecha);
      return f >= desde && f <= h;
    })
    .sort((a, b) => soloFecha(a.fecha) - soloFecha(b.fecha));

  const dias = v.length < 2 ? 0 : (soloFecha(v[v.length - 1].fecha) - soloFecha(v[0].fecha)) / DIA;
  if (v.length < 3 || dias < 6) {
    return { estado: 'sinDatos' as EstadoMotor, deltaPeso: 0, deltaCargas: 0, registros: v.length };
  }
  const dP = (v[v.length - 1].peso_ayunas ?? 0) - (v[0].peso_ayunas ?? 0);
  const dC = cargas(v[v.length - 1]) - cargas(v[0]);
  let estado: EstadoMotor;
  if (dP >= 0.5 && dC <= 0) estado = 'pesoSubeCargasNo';
  else if (dP < 0.2 && dC <= 0) estado = 'estancado';
  else estado = 'enProgreso';
  return { estado, deltaPeso: dP, deltaCargas: dC, registros: v.length };
}

// Etiquetas que ya usa el panel/portal web.
export const ETIQUETA_ESTADO: Record<EstadoMotor, 'En progreso' | 'Estancado' | 'Peso sube, cargas no' | 'Sin datos'> = {
  sinDatos: 'Sin datos',
  enProgreso: 'En progreso',
  estancado: 'Estancado',
  pesoSubeCargasNo: 'Peso sube, cargas no',
};

/** Valores del plan que el portal muestra. Si la base ya trae uno (p. ej. superavit_kcal
 *  que fija el nutriólogo) se respeta; el resto se calcula con las mismas fórmulas. */
export function planDerivado(u: { peso_actual?: number | null; superavit_kcal?: number | null }) {
  const peso = Number(u.peso_actual) || 0;
  const superavit = limitarSuperavit(Number(u.superavit_kcal) || SUPERAVIT_BASE);
  const mantenimiento = Math.round(peso * 32);
  const totales = mantenimiento + superavit;
  return {
    proteina_g_kg: 1.75,
    superavit_kcal: superavit,
    calorias_mantenimiento: mantenimiento,
    calorias_totales: totales,
    carbohidratos_g: Math.round((totales * 0.55) / 4),
    carbs_peri_entreno_g: 75,
    grasas_g: Math.round(peso * 0.95),
    suplementacion_sugerida: 'Creatina Monohidratada 5g/día constante',
  };
}

// ---------------------------------------------------------------------------------- proteína: alerta en dos niveles
// Port de MotorReglas.alerta y PlanNutricional (motor_reglas.dart).

export type NivelAlerta = 'ok' | 'cerca' | 'rebasa';

/** 'cerca' = por encima del rango de 1.6 a 1.8 g/kg; 'rebasa' = llegó al tope de 2.0 g/kg o lo pasó. */
export function nivelAlertaProteina(proteinaG: number, pesoKg: number): NivelAlerta {
  if (!(pesoKg > 0) || !Number.isFinite(proteinaG)) return 'ok';
  const gkg = proteinaG / pesoKg;
  if (gkg >= GKG_TOPE) return 'rebasa';
  if (gkg > GKG_MAX) return 'cerca';
  return 'ok';
}

/** Meta de proteína del día en gramos para un peso (rango de 1.6 a 1.8 g/kg y tope de 2.0 g/kg). */
export function rangoProteinaG(pesoKg: number) {
  return { min: pesoKg * GKG_MIN, max: pesoKg * GKG_MAX, tope: pesoKg * GKG_TOPE };
}

/** Texto corto que se muestra junto al campo de proteína. null si va bien. */
export function textoAlertaProteina(nivel: NivelAlerta, gkg: number): string | null {
  const g = gkg.toFixed(2);
  if (nivel === 'rebasa') {
    return `Llevas ${g} g/kg: llegaste al tope de 2.0 g/kg. Pasar de ahí no aporta más músculo y eleva la presión de filtración en tus riñones. Mantente cerca de tu meta.`;
  }
  if (nivel === 'cerca') {
    return `Llevas ${g} g/kg: arriba del rango de 1.6 a 1.8 g/kg y cerca del tope de 2.0. Conviene no pasar de ahí.`;
  }
  return null;
}

/** Aviso educativo que se muestra después de guardar un registro con proteína alta. */
export function textoAvisoDespuesDeGuardar(nivel: NivelAlerta, gkg: number): string | null {
  const g = gkg.toFixed(2);
  if (nivel === 'rebasa') {
    return `Registraste ${g} g/kg de proteína, que llega al tope de 2.0 g/kg. Pasar de ahí no aporta más músculo y, de forma sostenida, puede exigir más a los riñones. Esto es informativo; si tienes dudas, pide la revisión de un nutriólogo.`;
  }
  if (nivel === 'cerca') {
    return `Registraste ${g} g/kg de proteína, arriba del rango de 1.6 a 1.8 g/kg y cerca del tope de 2.0. Conviene no pasar de ahí.`;
  }
  return null;
}
