import React from 'react';
import type { ReporteVista } from '@/lib/reporte-paciente';

// Colores fijos (no del tema): el reporte se imprime y se guarda como PDF en blanco y negro/verde sobre papel blanco.
const VERDE = '#14532d';
const GRIS = '#475569';
const BORDE = '#e2e8f0';

function GraficaPeso({ serie }: { serie: { fecha: string; peso: number }[] }) {
  if (serie.length < 2) return null;
  const W = 560;
  const H = 170;
  const m = { l: 40, r: 12, t: 10, b: 24 };
  const pesos = serie.map((s) => s.peso);
  const lo = Math.floor(Math.min(...pesos) - 0.5);
  const hi = Math.ceil(Math.max(...pesos) + 0.5);
  const t0 = new Date(serie[0].fecha).getTime();
  const t1 = new Date(serie[serie.length - 1].fecha).getTime();
  const span = t1 - t0 || 1;
  const x = (f: string) => m.l + ((new Date(f).getTime() - t0) / span) * (W - m.l - m.r);
  const y = (p: number) => H - m.b - ((p - lo) / (hi - lo || 1)) * (H - m.t - m.b);
  const ticks = [lo, lo + (hi - lo) / 2, hi];
  const puntos = serie.map((s) => `${x(s.fecha).toFixed(1)},${y(s.peso).toFixed(1)}`).join(' ');
  return (
    <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label="Gráfica de peso en ayunas del periodo" style={{ width: '100%', height: 'auto' }}>
      {ticks.map((tk) => (
        <g key={tk}>
          <line x1={m.l} x2={W - m.r} y1={y(tk)} y2={y(tk)} stroke={BORDE} />
          <text x={m.l - 6} y={y(tk) + 3} fontSize="10" textAnchor="end" fill={GRIS}>
            {tk.toFixed(1)}
          </text>
        </g>
      ))}
      <text x={m.l} y={H - 6} fontSize="10" fill={GRIS}>
        {serie[0].fecha.slice(5)}
      </text>
      <text x={W - m.r} y={H - 6} fontSize="10" textAnchor="end" fill={GRIS}>
        {serie[serie.length - 1].fecha.slice(5)}
      </text>
      <polyline points={puntos} fill="none" stroke={VERDE} strokeWidth="2" />
      {serie.map((s) => (
        <circle key={s.fecha} cx={x(s.fecha)} cy={y(s.peso)} r="3" fill={VERDE} />
      ))}
    </svg>
  );
}

/** Contenido del reporte: se ve igual en pantalla (vista previa) y al imprimir / guardar como PDF. */
export function ReporteVistaImpresa({ r }: { r: ReporteVista }) {
  return (
    <div style={{ background: '#fff', color: '#0f172a', padding: 28, fontFamily: 'Arial, Helvetica, sans-serif', lineHeight: 1.45 }}>
      <div style={{ fontSize: 11, fontWeight: 700, color: GRIS }}>NutriMasa</div>
      <h1 style={{ fontSize: 24, fontWeight: 800, color: VERDE, margin: '4px 0' }}>{r.titulo}</h1>
      <div style={{ fontSize: 13 }}>
        {r.nombre} &nbsp;-&nbsp; {r.periodo}
      </div>
      <hr style={{ border: 0, borderTop: `1px solid ${BORDE}`, margin: '14px 0' }} />

      {r.secciones.map((s) => (
        <section key={s.titulo} style={{ marginTop: 14, breakInside: 'avoid' }}>
          <h2 style={{ fontSize: 14, fontWeight: 800, color: VERDE, margin: '0 0 4px' }}>{s.titulo}</h2>
          {s.filas?.map((f) => (
            <div key={f.k} style={{ display: 'flex', gap: 12, padding: '3px 0', fontSize: 12 }}>
              <span style={{ width: 160, flexShrink: 0, color: GRIS }}>{f.k}</span>
              <strong>{f.v}</strong>
            </div>
          ))}
          {s.texto && <p style={{ fontSize: 12, margin: 0, whiteSpace: 'pre-line' }}>{s.texto}</p>}
        </section>
      ))}

      {r.serie && r.serie.length > 1 && (
        <section style={{ marginTop: 14, breakInside: 'avoid' }}>
          <h2 style={{ fontSize: 14, fontWeight: 800, color: VERDE, margin: '0 0 4px' }}>Peso en ayunas (kg)</h2>
          <GraficaPeso serie={r.serie} />
        </section>
      )}

      {r.pie && <p style={{ fontSize: 10, color: GRIS, marginTop: 14 }}>{r.pie}</p>}
      <p style={{ fontSize: 9.5, color: GRIS, marginTop: 18 }}>
        NutriMasa es una herramienta de acompañamiento. No sustituye la consulta con un profesional de la salud ni sirve para urgencias.
      </p>
    </div>
  );
}
