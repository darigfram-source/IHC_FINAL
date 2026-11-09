'use client';

import React, { useState, useEffect } from 'react';
import {
  TrendingUp,
  Scale,
  Dumbbell,
  Layers,
  Calendar,
  Sparkles,
  Info,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';
import { PacienteTopBar } from '@/components/paciente/PacienteNavigation';

interface Registro {
  id: string;
  fecha: string;
  peso_ayunas: number;
  sentadilla_kg: number;
  press_banca_kg: number;
  volumen_entrenamiento_kg: number;
  proteina_consumida_g?: number;
}

export default function PacienteGraficasPage() {
  const [tab, setTab] = useState<'peso' | 'cargas' | 'volumen'>('peso');
  const [registros, setRegistros] = useState<Registro[]>([]);
  const [pesoActual, setPesoActual] = useState<number>(78.4);
  const [pesoMeta, setPesoMeta] = useState<number>(82.0);
  const [estadoHipertrofia, setEstadoHipertrofia] = useState<string>('En progreso');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchHistory() {
      try {
        const res = await fetch('/api/paciente/perfil');
        const json = await res.json();
        if (json.success && json.data) {
          if (json.data.registros && json.data.registros.length > 0) {
            setRegistros(json.data.registros);
          } else {
            // Datos iniciales de demostración si aún no hay registros
            setRegistros([
              { id: '1', fecha: '2026-10-10', peso_ayunas: 77.2, sentadilla_kg: 95, press_banca_kg: 65, volumen_entrenamiento_kg: 11000 },
              { id: '2', fecha: '2026-10-17', peso_ayunas: 77.6, sentadilla_kg: 97.5, press_banca_kg: 67.5, volumen_entrenamiento_kg: 11600 },
              { id: '3', fecha: '2026-10-24', peso_ayunas: 78.0, sentadilla_kg: 100, press_banca_kg: 70, volumen_entrenamiento_kg: 12100 },
              { id: '4', fecha: '2026-10-31', peso_ayunas: 78.4, sentadilla_kg: 102.5, press_banca_kg: 72.5, volumen_entrenamiento_kg: 12500 },
            ]);
          }
          if (json.data.peso_actual) setPesoActual(Number(json.data.peso_actual));
          if (json.data.peso_objetivo) setPesoMeta(Number(json.data.peso_objetivo));
          if (json.data.estado_hipertrofia) setEstadoHipertrofia(json.data.estado_hipertrofia);
        }
      } catch (e) {
        console.error('Error cargando gráficas:', e);
      } finally {
        setLoading(false);
      }
    }
    fetchHistory();
  }, []);

  // Calcular puntos para SVG (ViewBox 600x260 adaptable)
  const dataList = registros.slice(-7);
  const svgWidth = 600;
  const svgHeight = 240;
  const padX = 40;
  const padY = 30;

  const weights = dataList.map((r) => Number(r.peso_ayunas));
  const minW = Math.min(...(weights.length ? weights : [70])) - 1;
  const maxW = Math.max(...(weights.length ? weights : [85])) + 1;

  const squats = dataList.map((r) => Number(r.sentadilla_kg));
  const benches = dataList.map((r) => Number(r.press_banca_kg));
  const maxLoad = Math.max(...(squats.length ? squats : [120])) + 5;
  const minLoad = Math.min(...(benches.length ? benches : [50])) - 5;

  const volumes = dataList.map((r) => Number(r.volumen_entrenamiento_kg || 10000));
  const minVol = Math.min(...(volumes.length ? volumes : [9000])) - 500;
  const maxVol = Math.max(...(volumes.length ? volumes : [15000])) + 500;

  const getPoints = (values: number[], minVal: number, maxVal: number) => {
    if (values.length <= 1) return `${padX},${svgHeight / 2} ${svgWidth - padX},${svgHeight / 2}`;
    const range = maxVal - minVal || 1;
    return values
      .map((v, i) => {
        const x = padX + (i / (values.length - 1)) * (svgWidth - padX * 2);
        const y = svgHeight - padY - ((v - minVal) / range) * (svgHeight - padY * 2);
        return `${x},${y}`;
      })
      .join(' ');
  };

  return (
    <div className="w-full min-h-full">
      <PacienteTopBar
        titulo="Gráficas de Evolución"
        subtitulo="Tendencia de composición corporal y cargas de trabajo"
        badge="Progresión Clínica"
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Selector de Métrica Adaptable (Segmented Control) */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div
            role="tablist"
            aria-label="Selector de métrica gráfica"
            className="inline-flex p-1 rounded-2xl bg-[var(--surface)] border border-[var(--border)] shadow-[var(--shadow-sm)]"
          >
            <button
              role="tab"
              aria-selected={tab === 'peso'}
              onClick={() => setTab('peso')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all min-h-[44px] cursor-pointer focus-visible:outline-2 focus-visible:outline-emerald-500 ${
                tab === 'peso'
                  ? 'bg-emerald-600 text-white shadow-md'
                  : 'text-[var(--text-muted)] hover:text-[var(--text)]'
              }`}
            >
              <Scale className="w-4 h-4 shrink-0" />
              <span>Peso Corporal</span>
            </button>

            <button
              role="tab"
              aria-selected={tab === 'cargas'}
              onClick={() => setTab('cargas')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all min-h-[44px] cursor-pointer focus-visible:outline-2 focus-visible:outline-emerald-500 ${
                tab === 'cargas'
                  ? 'bg-emerald-600 text-white shadow-md'
                  : 'text-[var(--text-muted)] hover:text-[var(--text)]'
              }`}
            >
              <Dumbbell className="w-4 h-4 shrink-0" />
              <span>Cargas (Sentadilla/Banca)</span>
            </button>

            <button
              role="tab"
              aria-selected={tab === 'volumen'}
              onClick={() => setTab('volumen')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all min-h-[44px] cursor-pointer focus-visible:outline-2 focus-visible:outline-emerald-500 ${
                tab === 'volumen'
                  ? 'bg-emerald-600 text-white shadow-md'
                  : 'text-[var(--text-muted)] hover:text-[var(--text)]'
              }`}
            >
              <Layers className="w-4 h-4 shrink-0" />
              <span>Volumen Total</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-[var(--text-muted)]">Estado actual:</span>
            <span
              className={`px-3 py-1 rounded-full text-xs font-bold border ${
                estadoHipertrofia === 'En progreso'
                  ? 'bg-[var(--primary-surface)] text-[var(--primary-text)] border-[var(--primary-border)]'
                  : 'bg-[var(--warning-surface)] text-[var(--warning-text)] border-[var(--warning-border)]'
              }`}
            >
              {estadoHipertrofia}
            </span>
          </div>
        </div>

        {/* ====================================================================
            LAYOUT GRID RESPONSIVO: GRÁFICA PRINCIPAL + TABLA DE HISTORIAL
            ==================================================================== */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* ================================================================
              GRÁFICA INTERACTIVA ADAPTABLE (lg:col-span-8)
              ================================================================ */}
          <div className="lg:col-span-8 space-y-6">
            <article
              aria-label="Gráfica de evolución temporal"
              className="rounded-3xl p-5 sm:p-6 lg:p-8 bg-[var(--surface)] border border-[var(--border)] shadow-[var(--shadow-sm)] space-y-6"
            >
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <span className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider block">
                    {tab === 'peso' && 'Evolución de Peso en Ayunas (kg)'}
                    {tab === 'cargas' && 'Sobrecarga Progresiva: Sentadilla vs Banca (kg)'}
                    {tab === 'volumen' && 'Volumen Semanal de Carga (kg totales)'}
                  </span>
                  <div className="text-2xl sm:text-3xl font-black text-[var(--text)] mt-1">
                    {tab === 'peso' && `${pesoActual} kg`}
                    {tab === 'cargas' && `${squats[squats.length - 1] || 100} kg / ${benches[benches.length - 1] || 70} kg`}
                    {tab === 'volumen' && `${volumes[volumes.length - 1] || 12500} kg`}
                  </div>
                </div>

                {tab === 'cargas' && (
                  <div className="flex items-center gap-4 text-xs font-semibold">
                    <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
                      <span className="w-3 h-3 rounded-full bg-emerald-500 inline-block"></span> Sentadilla
                    </span>
                    <span className="flex items-center gap-1.5 text-indigo-600 dark:text-indigo-400">
                      <span className="w-3 h-3 rounded-full bg-indigo-500 inline-block"></span> Press de Banca
                    </span>
                  </div>
                )}
              </div>

              {/* LIENZO SVG ADAPTABLE FLUIDO (ViewBox 600x240) */}
              <div className="w-full bg-[var(--surface-raised)] rounded-2xl p-4 sm:p-6 border border-[var(--border-subtle)]">
                <svg
                  viewBox={`0 0 ${svgWidth} ${svgHeight}`}
                  className="w-full h-56 sm:h-72 overflow-visible"
                >
                  {/* Líneas de rejilla adaptadas a modo claro y oscuro */}
                  <line x1="30" y1="30" x2={svgWidth - 30} y2="30" stroke="currentColor" className="text-slate-200 dark:text-slate-800" strokeDasharray="4 4" strokeWidth="1" />
                  <line x1="30" y1="120" x2={svgWidth - 30} y2="120" stroke="currentColor" className="text-slate-200 dark:text-slate-800" strokeDasharray="4 4" strokeWidth="1" />
                  <line x1="30" y1="210" x2={svgWidth - 30} y2="210" stroke="currentColor" className="text-slate-200 dark:text-slate-800" strokeDasharray="4 4" strokeWidth="1" />

                  {/* TAB: PESO */}
                  {tab === 'peso' && (
                    <>
                      <polyline
                        fill="none"
                        stroke="#10b981"
                        strokeWidth="4"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        points={getPoints(weights, minW, maxW)}
                      />
                      {weights.map((w, idx) => {
                        const range = maxW - minW || 1;
                        const x = padX + (idx / (weights.length - 1 || 1)) * (svgWidth - padX * 2);
                        const y = svgHeight - padY - ((w - minW) / range) * (svgHeight - padY * 2);
                        return (
                          <g key={idx}>
                            <circle cx={x} cy={y} r="6" fill="#10b981" stroke="var(--surface)" strokeWidth="2.5" />
                            <text
                              x={x}
                              y={y - 12}
                              textAnchor="middle"
                              fontSize="11"
                              fontWeight="bold"
                              className="fill-emerald-700 dark:fill-emerald-300"
                            >
                              {w} kg
                            </text>
                          </g>
                        );
                      })}
                    </>
                  )}

                  {/* TAB: CARGAS */}
                  {tab === 'cargas' && (
                    <>
                      <polyline
                        fill="none"
                        stroke="#10b981"
                        strokeWidth="3.5"
                        strokeLinecap="round"
                        points={getPoints(squats, minLoad, maxLoad)}
                      />
                      {squats.map((s, idx) => {
                        const range = maxLoad - minLoad || 1;
                        const x = padX + (idx / (squats.length - 1 || 1)) * (svgWidth - padX * 2);
                        const y = svgHeight - padY - ((s - minLoad) / range) * (svgHeight - padY * 2);
                        return <circle key={'s' + idx} cx={x} cy={y} r="5" fill="#10b981" stroke="var(--surface)" strokeWidth="2" />;
                      })}

                      <polyline
                        fill="none"
                        stroke="#6366f1"
                        strokeWidth="3.5"
                        strokeLinecap="round"
                        strokeDasharray="6 3"
                        points={getPoints(benches, minLoad, maxLoad)}
                      />
                      {benches.map((b, idx) => {
                        const range = maxLoad - minLoad || 1;
                        const x = padX + (idx / (benches.length - 1 || 1)) * (svgWidth - padX * 2);
                        const y = svgHeight - padY - ((b - minLoad) / range) * (svgHeight - padY * 2);
                        return <circle key={'b' + idx} cx={x} cy={y} r="5" fill="#6366f1" stroke="var(--surface)" strokeWidth="2" />;
                      })}
                    </>
                  )}

                  {/* TAB: VOLUMEN */}
                  {tab === 'volumen' && (
                    <>
                      <polyline
                        fill="none"
                        stroke="#f59e0b"
                        strokeWidth="4"
                        strokeLinecap="round"
                        points={getPoints(volumes, minVol, maxVol)}
                      />
                      {volumes.map((v, idx) => {
                        const range = maxVol - minVol || 1;
                        const x = padX + (idx / (volumes.length - 1 || 1)) * (svgWidth - padX * 2);
                        const y = svgHeight - padY - ((v - minVol) / range) * (svgHeight - padY * 2);
                        return <circle key={'v' + idx} cx={x} cy={y} r="5" fill="#f59e0b" stroke="var(--surface)" strokeWidth="2" />;
                      })}
                    </>
                  )}
                </svg>

                {/* Fechas en el eje horizontal */}
                <div className="flex justify-between text-xs text-[var(--text-subtle)] px-4 mt-3">
                  <span>{dataList[0]?.fecha || 'Semana 1'}</span>
                  <span>{dataList[Math.floor(dataList.length / 2)]?.fecha || 'Semana 2'}</span>
                  <span>{dataList[dataList.length - 1]?.fecha || 'Actual'}</span>
                </div>
              </div>

              {/* Criterio Científico WCAG AA */}
              <div className="p-4 rounded-2xl bg-[var(--primary-surface)] border border-[var(--primary-border)] text-[var(--primary-text)] flex items-start gap-3 text-xs leading-relaxed">
                <Info className="w-5 h-5 shrink-0 mt-0.5 text-[var(--primary)]" />
                <p>
                  <strong>Tasa de Ganancia Óptima:</strong> La ganancia muscular recomendada oscila entre 0.25% y 0.5% del peso corporal por semana en deportistas con sobrecarga progresiva (Schoenfeld et al., 2021). Un ritmo mayor suele reflejar acumulación de tejido graso no deseado.
                </p>
              </div>
            </article>
          </div>

          {/* ================================================================
              TABLA DE HISTORIAL DE MEDICIONES (lg:col-span-4)
              ================================================================ */}
          <div className="lg:col-span-4 space-y-6">
            <article
              aria-label="Historial de mediciones recientes"
              className="rounded-3xl p-5 sm:p-6 bg-[var(--surface)] border border-[var(--border)] shadow-[var(--shadow-sm)] space-y-4"
            >
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-[var(--text)] uppercase tracking-wider flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-[var(--primary)]" />
                  <span>Últimos Registros</span>
                </h3>
                <span className="text-xs text-[var(--text-subtle)] font-medium">
                  {dataList.length} entradas
                </span>
              </div>

              <div className="space-y-2.5">
                {dataList.slice().reverse().map((reg, index) => (
                  <div
                    key={reg.id || index}
                    className="p-3.5 rounded-2xl bg-[var(--surface-raised)] border border-[var(--border-subtle)] flex items-center justify-between text-xs"
                  >
                    <div>
                      <span className="font-bold text-[var(--text)] block text-sm">
                        {reg.fecha}
                      </span>
                      <span className="text-[11px] text-[var(--text-subtle)] block mt-0.5">
                        Sentadilla: {reg.sentadilla_kg}kg · Banca: {reg.press_banca_kg}kg
                      </span>
                    </div>

                    <div className="text-right">
                      <span className="font-black text-[var(--text)] text-base">
                        {reg.peso_ayunas} kg
                      </span>
                      <span className="block text-[10px] text-[var(--primary)] font-bold">
                        {reg.proteina_consumida_g ? `${reg.proteina_consumida_g}g prot.` : 'Completo'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </article>
          </div>
        </div>
      </div>
    </div>
  );
}
