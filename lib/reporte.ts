// Cálculo de las métricas de un reporte a partir de los registros diarios reales
// (misma idea que DatosReporte en la app Flutter). Se usa en el cliente (vista previa)
// y en la API (valor que se guarda).
export interface RegistroReporte {
  fecha: string; // YYYY-MM-DD
  peso_ayunas: number | null;
  sentadilla_kg: number | null;
  press_banca_kg: number | null;
}

const DIA = 86_400_000;
const clave = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

export const diasDelPeriodo = (tipo: 'semanal' | 'mensual') => (tipo === 'semanal' ? 7 : 30);

export function metricasReporte(
  registros: RegistroReporte[],
  tipo: 'semanal' | 'mensual',
  hoy = new Date()
) {
  const dias = diasDelPeriodo(tipo);
  const fin = clave(hoy);
  const inicio = clave(new Date(hoy.getTime() - (dias - 1) * DIA));
  const v = registros
    .filter((r) => r.fecha.slice(0, 10) >= inicio && r.fecha.slice(0, 10) <= fin && r.peso_ayunas != null)
    .sort((a, b) => a.fecha.localeCompare(b.fecha));
  if (v.length === 0) return null;

  const primero = v[0];
  const ultimo = v[v.length - 1];
  const pi = Number(primero.peso_ayunas);
  const pf = Number(ultimo.peso_ayunas);
  const r1 = (n: number) => Math.round(n * 10) / 10;
  return {
    fecha_inicio: inicio,
    fecha_fin: fin,
    peso_inicial_periodo: pi,
    peso_final_periodo: pf,
    cambio_peso: r1(pf - pi),
    progreso_sentadilla_kg: r1((ultimo.sentadilla_kg ?? 0) - (primero.sentadilla_kg ?? 0)),
    progreso_banca_kg: r1((ultimo.press_banca_kg ?? 0) - (primero.press_banca_kg ?? 0)),
    adherencia_registro_pct: Math.min(100, Math.round((v.length / dias) * 100)),
  };
}
