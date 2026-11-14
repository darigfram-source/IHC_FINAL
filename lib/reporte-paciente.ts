// Arma lo que se muestra y se imprime en los reportes del paciente (igual que reporte_pdf.dart de la app):
// su propio resumen semanal/mensual y los reportes clínicos que guardó su nutriólogo.
import { metricasReporte, diasDelPeriodo, type RegistroReporte } from './reporte';
import { limitarSuperavit, GKG_MIN, GKG_MAX, GKG_TOPE } from './motor-reglas';
import type { Reporte } from './types';

export interface ReporteVista {
  titulo: string;
  nombre: string;
  periodo: string; // "2026-11-06 a 2026-11-12"
  secciones: { titulo: string; filas?: { k: string; v: string }[]; texto?: string }[];
  /** Peso en ayunas del periodo, para la gráfica (opcional). */
  serie?: { fecha: string; peso: number }[];
  pie?: string;
}

interface RegistroCompleto extends RegistroReporte {
  volumen_entrenamiento_kg?: number | null;
}

const n1 = (v: number) => (Math.round(v * 10) / 10).toFixed(1);
const sg = (v: number) => (v > 0 ? `+${n1(v)}` : n1(v));

/** Resumen propio de los últimos 7 (semanal) o 30 días (mensual). `hoy` solo se pasa desde eventos o efectos. */
export function resumenPropio(
  nombre: string,
  registros: RegistroCompleto[],
  tipo: 'semanal' | 'mensual',
  plan: { peso_actual?: number | null; superavit_kcal?: number | null },
  hoy: Date
): ReporteVista {
  const dias = diasDelPeriodo(tipo);
  const titulo = tipo === 'semanal' ? 'Resumen semanal' : 'Resumen mensual';
  const m = metricasReporte(registros, tipo, hoy);
  if (!m) {
    return {
      titulo,
      nombre,
      periodo: 'Sin registros en este periodo',
      secciones: [{ titulo: 'Resumen del periodo', texto: 'Sin registros en este periodo.' }],
    };
  }
  const v = registros
    .filter((r) => r.fecha.slice(0, 10) >= m.fecha_inicio && r.fecha.slice(0, 10) <= m.fecha_fin && r.peso_ayunas != null)
    .sort((a, b) => a.fecha.localeCompare(b.fecha));
  const vol = v.reduce((s, r) => s + Number(r.volumen_entrenamiento_kg ?? 0), 0) / v.length;
  const peso = Number(v[v.length - 1].peso_ayunas);
  const superavit = limitarSuperavit(Number(plan.superavit_kcal) || 450);

  return {
    titulo,
    nombre,
    periodo: `${m.fecha_inicio} a ${m.fecha_fin}`,
    secciones: [
      {
        titulo: 'Resumen del periodo',
        filas: [
          { k: 'Registros', v: `${v.length} de ${dias} días (adherencia ${m.adherencia_registro_pct}%)` },
          { k: 'Peso', v: `${n1(m.peso_inicial_periodo)} kg a ${n1(m.peso_final_periodo)} kg (${sg(m.cambio_peso)} kg)` },
          { k: 'Volumen promedio', v: `${Math.round(vol)} kg` },
          { k: 'Sentadilla', v: `${sg(m.progreso_sentadilla_kg)} kg` },
          { k: 'Press de banca', v: `${sg(m.progreso_banca_kg)} kg` },
        ],
      },
      {
        titulo: 'Tu plan',
        filas: [
          { k: 'Proteína', v: `${n1(peso * GKG_MIN)} a ${n1(peso * GKG_MAX)} g al día` },
          { k: 'Tope de proteína', v: `${n1(peso * GKG_TOPE)} g al día (2.0 g/kg)` },
          { k: 'Superávit', v: `+${superavit} kcal sobre tu dieta habitual` },
        ],
      },
    ],
    serie: v.map((r) => ({ fecha: r.fecha.slice(0, 10), peso: Number(r.peso_ayunas) })),
  };
}

/** Reporte clínico que el nutriólogo guardó en la base. */
export function reporteClinicoVista(nombre: string, r: Reporte): ReporteVista {
  const emitido = String(r.creado_en ?? '').slice(0, 10);
  return {
    titulo: `Reporte ${r.periodo_tipo}`,
    nombre,
    periodo: `${String(r.fecha_inicio).slice(0, 10)} a ${String(r.fecha_fin).slice(0, 10)}`,
    secciones: [
      {
        titulo: 'Cifras del periodo',
        filas: [
          { k: 'Peso', v: `${n1(Number(r.peso_inicial_periodo))} kg a ${n1(Number(r.peso_final_periodo))} kg (${sg(Number(r.cambio_peso))} kg)` },
          { k: 'Sentadilla', v: `${sg(Number(r.progreso_sentadilla_kg ?? 0))} kg` },
          { k: 'Press de banca', v: `${sg(Number(r.progreso_banca_kg ?? 0))} kg` },
          { k: 'Adherencia al registro', v: `${r.adherencia_registro_pct}%` },
        ],
      },
      { titulo: 'Evaluación', texto: r.evaluacion_clinica },
      { titulo: 'Recomendaciones', texto: r.recomendaciones_siguientes },
    ],
    pie: emitido ? `Emitido el ${emitido}` : undefined,
  };
}
