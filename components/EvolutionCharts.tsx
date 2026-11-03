'use client';

import React, { useState } from 'react';
import { RegistroDiario, Usuario } from '@/lib/types';
import { TrendingUp, Dumbbell, Activity, ShieldAlert } from 'lucide-react';

interface EvolutionChartsProps {
  usuario: Usuario;
}

export const EvolutionCharts: React.FC<EvolutionChartsProps> = ({ usuario }) => {
  const [activeMetric, setActiveMetric] = useState<'todos' | 'peso' | 'cargas' | 'volumen'>('todos');
  const registros = usuario.registros || [];

  if (registros.length === 0) {
    return (
      <div className="p-8 text-center bg-slate-50 border border-slate-200 rounded-xl">
        <Activity className="w-10 h-10 mx-auto text-slate-400 mb-2" />
        <p className="text-sm font-medium text-slate-600">No hay registros diarios suficientes para graficar</p>
        <p className="text-xs text-slate-400 mt-1">El usuario comenzará a sincronizar sus datos desde la aplicación móvil.</p>
      </div>
    );
  }

  const sorted = [...registros].sort(
    (a, b) => new Date(a.fecha).getTime() - new Date(b.fecha).getTime()
  );

  return (
    <div className="space-y-6">
      {/* Selector de métricas */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-3">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Visualizar:</span>
          <div className="flex bg-slate-100 p-1 rounded-lg text-xs font-medium">
            <button
              onClick={() => setActiveMetric('todos')}
              className={`px-3 py-1.5 rounded-md transition-all ${
                activeMetric === 'todos' ? 'bg-white text-emerald-800 shadow-sm font-semibold' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Panel Integral
            </button>
            <button
              onClick={() => setActiveMetric('peso')}
              className={`px-3 py-1.5 rounded-md transition-all ${
                activeMetric === 'peso' ? 'bg-white text-emerald-800 shadow-sm font-semibold' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Peso en Ayunas
            </button>
            <button
              onClick={() => setActiveMetric('cargas')}
              className={`px-3 py-1.5 rounded-md transition-all ${
                activeMetric === 'cargas' ? 'bg-white text-emerald-800 shadow-sm font-semibold' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Cargas (Sentadilla / Banca)
            </button>
            <button
              onClick={() => setActiveMetric('volumen')}
              className={`px-3 py-1.5 rounded-md transition-all ${
                activeMetric === 'volumen' ? 'bg-white text-emerald-800 shadow-sm font-semibold' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Volumen de Trabajo
            </button>
          </div>
        </div>

        {/* Indicador de estado de progresión */}
        <div className="flex items-center gap-2 text-xs">
          <span className="text-slate-500">Diagnóstico actual:</span>
          <span
            className={`font-semibold px-2.5 py-1 rounded-full text-xs ${
              usuario.estado === 'En progreso'
                ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                : usuario.estado === 'Estancado'
                ? 'bg-amber-100 text-amber-800 border border-amber-300'
                : 'bg-rose-100 text-rose-800 border border-rose-300'
            }`}
          >
            {usuario.estado}
          </span>
        </div>
      </div>

      {/* Alerta clínica si el peso sube pero las cargas no (Urdampilleta 2012) */}
      {usuario.estado === 'Peso sube, cargas no' && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-3.5 flex items-start gap-3">
          <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="text-xs text-amber-900">
            <p className="font-semibold">Alerta de Composición Corporal: Desproporción Calórica Detectada</p>
            <p className="mt-0.5 text-amber-800">
              El peso del usuario se ha incrementado sostenidamente en las últimas 4 semanas sin una ganancia paralela en cargas de sentadilla o press de banca. Se recomienda evaluar un reajuste a la baja del superávit (+350-400 kcal) o revisar la intensidad efectiva del entrenamiento para prevenir acúmulo de tejido adiposo.
            </p>
          </div>
        </div>
      )}

      {/* Gráfica 1: Peso en ayunas */}
      {(activeMetric === 'todos' || activeMetric === 'peso') && (
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-emerald-50 text-emerald-700 rounded-md">
                <TrendingUp className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-800">Evolución del Peso en Ayunas (kg)</h4>
                <p className="text-xs text-slate-500">Medición diaria matutina con referencia a meta ({usuario.peso_objetivo} kg)</p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-xs text-slate-400">Variación neta</div>
              <div className="text-sm font-bold text-emerald-700">
                {(usuario.peso_actual - usuario.peso_inicial >= 0 ? '+' : '')}
                {(usuario.peso_actual - usuario.peso_inicial).toFixed(1)} kg
              </div>
            </div>
          </div>

          {/* Gráfico SVG SVG Line Chart */}
          <div className="h-44 w-full pt-2">
            <svg viewBox="0 0 500 130" className="w-full h-full overflow-visible">
              <defs>
                <linearGradient id="weightGradDetail" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#10b981" stopOpacity="0.28" />
                  <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
                </linearGradient>
              </defs>

              {/* Guías */}
              <line x1="30" y1="20" x2="480" y2="20" stroke="#f1f5f9" strokeWidth="1" />
              <line x1="30" y1="60" x2="480" y2="60" stroke="#f1f5f9" strokeWidth="1" />
              <line x1="30" y1="100" x2="480" y2="100" stroke="#e2e8f0" strokeWidth="1" />

              {/* Trazo */}
              {(() => {
                const weights = sorted.map((s) => s.peso_ayunas);
                const min = Math.min(...weights) - 0.5;
                const max = Math.max(...weights) + 0.5;
                const range = max - min || 1;

                const pts = sorted.map((s, idx) => {
                  const x = 40 + (idx / (sorted.length - 1 || 1)) * 430;
                  const y = 100 - ((s.peso_ayunas - min) / range) * 80;
                  return { x, y, val: s.peso_ayunas, fecha: s.fecha };
                });

                const d = pts.reduce((acc, pt, i) => {
                  if (i === 0) return `M ${pt.x} ${pt.y}`;
                  const prev = pts[i - 1];
                  const cpx = (prev.x + pt.x) / 2;
                  return `${acc} C ${cpx} ${prev.y}, ${cpx} ${pt.y}, ${pt.x} ${pt.y}`;
                }, '');

                const area = `${d} L ${pts[pts.length - 1].x} 100 L ${pts[0].x} 100 Z`;

                return (
                  <>
                    <path d={area} fill="url(#weightGradDetail)" />
                    <path d={d} fill="none" stroke="#059669" strokeWidth="2.5" />
                    {pts.map((p, i) => (
                      <g key={i}>
                        <circle cx={p.x} cy={p.y} r="4" fill="#ffffff" stroke="#047857" strokeWidth="2" />
                        <text
                          x={p.x}
                          y={p.y - 8}
                          fontSize="10"
                          textAnchor="middle"
                          fill="#065f46"
                          fontWeight="bold"
                        >
                          {p.val}k
                        </text>
                        <text x={p.x} y="115" fontSize="9" textAnchor="middle" fill="#94a3b8">
                          {new Date(p.fecha).toLocaleDateString('es-MX', { day: 'numeric', month: 'short' })}
                        </text>
                      </g>
                    ))}
                  </>
                );
              })()}
            </svg>
          </div>
        </div>
      )}

      {/* Gráfica 2: Progresión de cargas (Sentadilla y Press de banca) */}
      {(activeMetric === 'todos' || activeMetric === 'cargas') && (
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-blue-50 text-blue-700 rounded-md">
                <Dumbbell className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-800">Progresión de Cargas de Fuerza (kg)</h4>
                <p className="text-xs text-slate-500">Sentadilla trasera y Press de banca plano (cargas de trabajo)</p>
              </div>
            </div>
            <div className="flex items-center gap-4 text-xs font-semibold">
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-emerald-600 inline-block"></span>
                <span className="text-slate-700">Sentadilla: {sorted[sorted.length - 1]?.sentadilla_kg || 0} kg</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-blue-600 inline-block"></span>
                <span className="text-slate-700">Press banca: {sorted[sorted.length - 1]?.press_banca_kg || 0} kg</span>
              </div>
            </div>
          </div>

          <div className="h-44 w-full pt-2">
            <svg viewBox="0 0 500 130" className="w-full h-full overflow-visible">
              {/* Guías */}
              <line x1="30" y1="20" x2="480" y2="20" stroke="#f1f5f9" strokeWidth="1" />
              <line x1="30" y1="60" x2="480" y2="60" stroke="#f1f5f9" strokeWidth="1" />
              <line x1="30" y1="100" x2="480" y2="100" stroke="#e2e8f0" strokeWidth="1" />

              {(() => {
                const maxLoad = 135;
                const minLoad = 55;
                const range = maxLoad - minLoad;

                const ptsSquat = sorted.map((s, idx) => ({
                  x: 40 + (idx / (sorted.length - 1 || 1)) * 430,
                  y: 100 - (((s.sentadilla_kg || 0) - minLoad) / range) * 80,
                  val: s.sentadilla_kg,
                  fecha: s.fecha,
                }));

                const ptsBench = sorted.map((s, idx) => ({
                  x: 40 + (idx / (sorted.length - 1 || 1)) * 430,
                  y: 100 - (((s.press_banca_kg || 0) - minLoad) / range) * 80,
                  val: s.press_banca_kg,
                }));

                const dSquat = ptsSquat.reduce((acc, pt, i) => `${acc} ${i === 0 ? 'M' : 'L'} ${pt.x} ${pt.y}`, '');
                const dBench = ptsBench.reduce((acc, pt, i) => `${acc} ${i === 0 ? 'M' : 'L'} ${pt.x} ${pt.y}`, '');

                return (
                  <>
                    <path d={dSquat} fill="none" stroke="#059669" strokeWidth="2.5" strokeDasharray={usuario.tendencia_cargas === 'Sin cambio' ? '4 2' : 'none'} />
                    <path d={dBench} fill="none" stroke="#2563eb" strokeWidth="2.5" strokeDasharray={usuario.tendencia_cargas === 'Sin cambio' ? '4 2' : 'none'} />

                    {ptsSquat.map((p, i) => (
                      <g key={`sq-${i}`}>
                        <circle cx={p.x} cy={p.y} r="3.5" fill="#ffffff" stroke="#059669" strokeWidth="2" />
                        <text x={p.x} y={p.y - 7} fontSize="9" textAnchor="middle" fill="#047857" fontWeight="bold">
                          {p.val}kg
                        </text>
                      </g>
                    ))}

                    {ptsBench.map((p, i) => (
                      <g key={`bc-${i}`}>
                        <circle cx={p.x} cy={p.y} r="3.5" fill="#ffffff" stroke="#2563eb" strokeWidth="2" />
                        <text x={p.x} y={p.y + 14} fontSize="9" textAnchor="middle" fill="#1d4ed8" fontWeight="bold">
                          {p.val}kg
                        </text>
                        <text x={p.x} y="115" fontSize="9" textAnchor="middle" fill="#94a3b8">
                          {new Date(sorted[i].fecha).toLocaleDateString('es-MX', { day: 'numeric', month: 'short' })}
                        </text>
                      </g>
                    ))}
                  </>
                );
              })()}
            </svg>
          </div>
        </div>
      )}

      {/* Gráfica 3: Volumen de entrenamiento (kg totales acumulados por sesión) */}
      {(activeMetric === 'todos' || activeMetric === 'volumen') && (
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-purple-50 text-purple-700 rounded-md">
                <Activity className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-800">Volumen Total Semanal de Carga (kg acumulados)</h4>
                <p className="text-xs text-slate-500">Multiplicación de series x repeticiones x peso levantado</p>
              </div>
            </div>
            <div className="text-right">
              <span className="text-xs text-slate-500">Última semana: </span>
              <span className="text-sm font-bold text-purple-700">
                {sorted[sorted.length - 1]?.volumen_entrenamiento_kg?.toLocaleString()} kg
              </span>
            </div>
          </div>

          <div className="h-32 flex items-end gap-3 px-4 pt-3 pb-2 border-b border-slate-100">
            {sorted.map((item, idx) => {
              const maxVol = 12500;
              const heightPct = Math.min(100, Math.max(15, ((item.volumen_entrenamiento_kg || 8000) / maxVol) * 100));
              return (
                <div key={idx} className="flex-1 flex flex-col items-center gap-1.5 group">
                  <span className="text-[10px] font-semibold text-slate-500 opacity-0 group-hover:opacity-100 transition-opacity">
                    {(item.volumen_entrenamiento_kg / 1000).toFixed(1)}k
                  </span>
                  <div className="w-full bg-slate-100 rounded-t-md h-24 flex items-end">
                    <div
                      className="w-full bg-gradient-to-t from-purple-600 to-indigo-500 rounded-t-md transition-all duration-300 group-hover:brightness-110"
                      style={{ height: `${heightPct}%` }}
                    />
                  </div>
                  <span className="text-[10px] text-slate-400">
                    S{idx + 1}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
