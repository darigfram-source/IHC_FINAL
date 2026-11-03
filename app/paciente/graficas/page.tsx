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

  // Calcular puntos para SVG
  const dataList = registros.slice(-7); // Últimos 7 registros
  const count = dataList.length;

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

  // Normalizador para SVG (width 320, height 140, padding 20)
  const svgWidth = 320;
  const svgHeight = 140;
  const padX = 25;
  const padY = 20;

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
    <div className="p-4 space-y-4 pb-12">
      {/* Header Gráficas (Figura 5) */}
      <div className="pt-1">
        <div className="flex items-center gap-2 mb-1">
          <div className="p-1.5 rounded-lg bg-emerald-100 text-emerald-700">
            <TrendingUp className="w-4 h-4" />
          </div>
          <span className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider">
            Evolución y Progreso
          </span>
        </div>
        <h1 className="text-xl font-black text-slate-900 tracking-tight">Gráficas del Paciente</h1>
        <p className="text-xs text-slate-600">
          Tendencia de peso matutino, progresión de sobrecarga en sentadilla/banca y volumen semanal.
        </p>
      </div>

      {/* Tabs Selector de Métrica */}
      <div className="bg-slate-200/80 p-1 rounded-xl flex items-center gap-1 text-xs font-bold text-slate-600">
        <button
          onClick={() => setTab('peso')}
          className={`flex-1 py-1.5 rounded-lg transition-all flex items-center justify-center gap-1.5 ${
            tab === 'peso' ? 'bg-white text-emerald-800 shadow-sm' : 'hover:text-slate-900'
          }`}
        >
          <Scale className="w-3.5 h-3.5" />
          <span>Peso</span>
        </button>
        <button
          onClick={() => setTab('cargas')}
          className={`flex-1 py-1.5 rounded-lg transition-all flex items-center justify-center gap-1.5 ${
            tab === 'cargas' ? 'bg-white text-emerald-800 shadow-sm' : 'hover:text-slate-900'
          }`}
        >
          <Dumbbell className="w-3.5 h-3.5" />
          <span>Cargas</span>
        </button>
        <button
          onClick={() => setTab('volumen')}
          className={`flex-1 py-1.5 rounded-lg transition-all flex items-center justify-center gap-1.5 ${
            tab === 'volumen' ? 'bg-white text-emerald-800 shadow-sm' : 'hover:text-slate-900'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>Volumen</span>
        </button>
      </div>

      {/* Tarjeta de Gráfica Interactiva */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-slate-600 uppercase block">
              {tab === 'peso' && 'Evolución de Peso en Ayunas (kg)'}
              {tab === 'cargas' && 'Sobrecarga Progresiva: Sentadilla vs Banca (kg)'}
              {tab === 'volumen' && 'Volumen Semanal de Carga (kg totales)'}
            </span>
            <div className="text-xl font-black text-slate-900 mt-0.5">
              {tab === 'peso' && `${pesoActual} kg`}
              {tab === 'cargas' && `${squats[squats.length - 1] || 100} kg / ${benches[benches.length - 1] || 70} kg`}
              {tab === 'volumen' && `${volumes[volumes.length - 1] || 12500} kg`}
            </div>
          </div>

          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
            {estadoHipertrofia}
          </span>
        </div>

        {/* Lienzo SVG */}
        <div className="w-full bg-slate-50 rounded-xl p-2 border border-slate-100 flex flex-col items-center justify-center">
          <svg viewBox={`0 0 ${svgWidth} ${svgHeight}`} className="w-full h-36 overflow-visible">
            {/* Grid horizontal lines */}
            <line x1="15" y1="20" x2={svgWidth - 15} y2="20" stroke="#e2e8f0" strokeDasharray="3 3" />
            <line x1="15" y1="70" x2={svgWidth - 15} y2="70" stroke="#e2e8f0" strokeDasharray="3 3" />
            <line x1="15" y1="120" x2={svgWidth - 15} y2="120" stroke="#e2e8f0" strokeDasharray="3 3" />

            {/* TAB: PESO */}
            {tab === 'peso' && (
              <>
                <polyline
                  fill="none"
                  stroke="#059669"
                  strokeWidth="3.5"
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
                      <circle cx={x} cy={y} r="5" fill="#059669" stroke="#ffffff" strokeWidth="2" />
                      <text x={x} y={y - 8} textAnchor="middle" fontSize="9" fontWeight="bold" fill="#047857">
                        {w}
                      </text>
                    </g>
                  );
                })}
              </>
            )}

            {/* TAB: CARGAS (Sentadilla y Banca) */}
            {tab === 'cargas' && (
              <>
                {/* Sentadilla: Verde Esmeralda */}
                <polyline
                  fill="none"
                  stroke="#059669"
                  strokeWidth="3"
                  strokeLinecap="round"
                  points={getPoints(squats, minLoad, maxLoad)}
                />
                {squats.map((s, idx) => {
                  const range = maxLoad - minLoad || 1;
                  const x = padX + (idx / (squats.length - 1 || 1)) * (svgWidth - padX * 2);
                  const y = svgHeight - padY - ((s - minLoad) / range) * (svgHeight - padY * 2);
                  return <circle key={'s' + idx} cx={x} cy={y} r="4" fill="#059669" stroke="#ffffff" strokeWidth="2" />;
                })}

                {/* Banca: Azul Indigo */}
                <polyline
                  fill="none"
                  stroke="#4f46e5"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeDasharray="4 2"
                  points={getPoints(benches, minLoad, maxLoad)}
                />
                {benches.map((b, idx) => {
                  const range = maxLoad - minLoad || 1;
                  const x = padX + (idx / (benches.length - 1 || 1)) * (svgWidth - padX * 2);
                  const y = svgHeight - padY - ((b - minLoad) / range) * (svgHeight - padY * 2);
                  return <circle key={'b' + idx} cx={x} cy={y} r="4" fill="#4f46e5" stroke="#ffffff" strokeWidth="2" />;
                })}
              </>
            )}

            {/* TAB: VOLUMEN */}
            {tab === 'volumen' && (
              <>
                <polyline
                  fill="none"
                  stroke="#d97706"
                  strokeWidth="3"
                  strokeLinecap="round"
                  points={getPoints(volumes, minVol, maxVol)}
                />
                {volumes.map((v, idx) => {
                  const range = maxVol - minVol || 1;
                  const x = padX + (idx / (volumes.length - 1 || 1)) * (svgWidth - padX * 2);
                  const y = svgHeight - padY - ((v - minVol) / range) * (svgHeight - padY * 2);
                  return <circle key={'v' + idx} cx={x} cy={y} r="4" fill="#d97706" stroke="#ffffff" strokeWidth="2" />;
                })}
              </>
            )}
          </svg>

          {/* Leyenda de fechas / etiquetas */}
          <div className="w-full flex justify-between text-[10px] text-slate-600 px-3 mt-2">
            <span>{dataList[0]?.fecha || 'Inicio'}</span>
            <span>{dataList[Math.floor(dataList.length / 2)]?.fecha || 'Medio'}</span>
            <span>{dataList[dataList.length - 1]?.fecha || 'Último'}</span>
          </div>
        </div>

        {/* Leyenda explicativa de colores */}
        {tab === 'cargas' && (
          <div className="flex items-center justify-center gap-4 text-xs font-semibold pt-1">
            <span className="flex items-center gap-1.5 text-emerald-800">
              <span className="w-3 h-3 rounded-full bg-emerald-600 inline-block"></span> Sentadilla
            </span>
            <span className="flex items-center gap-1.5 text-indigo-800">
              <span className="w-3 h-3 rounded-full bg-indigo-600 inline-block"></span> Press de Banca
            </span>
          </div>
        )}

        {/* Resumen de Criterio Científico */}
        <div className="p-3 rounded-xl bg-emerald-50/70 border border-emerald-200 text-xs text-emerald-950 flex items-start gap-2">
          <Info className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
          <p className="text-[11px] leading-relaxed">
            <strong>Tasa de Ganancia Óptima:</strong> Un incremento sostenido de 0.25% a 0.5% del peso corporal por semana indica predominio de hipertrofia miofibrilar con mínima adiposidad.
          </p>
        </div>
      </div>

      {/* Historial de Registros Recientes */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm space-y-2.5">
        <h2 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
          <Calendar className="w-3.5 h-3.5 text-slate-500" />
          Últimas Mediciones Registradas
        </h2>

        <div className="space-y-1.5">
          {dataList.slice().reverse().map((reg, index) => (
            <div
              key={reg.id || index}
              className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between text-xs"
            >
              <div>
                <span className="font-bold text-slate-800 block text-xs">{reg.fecha}</span>
                <span className="text-[10px] text-slate-600">
                  Squat: {reg.sentadilla_kg} kg · Banca: {reg.press_banca_kg} kg
                </span>
              </div>
              <div className="text-right">
                <span className="font-black text-slate-900 text-sm">{reg.peso_ayunas} kg</span>
                <span className="block text-[10px] text-emerald-600 font-semibold">
                  {reg.proteina_consumida_g ? `${reg.proteina_consumida_g}g prot.` : 'Completado'}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
