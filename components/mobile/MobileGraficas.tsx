'use client';

import React, { useState } from 'react';
import { useNutriMasa } from '@/lib/NutriMasaContext';
import { WeightChart } from '../WeightChart';
import {
  TrendingUp,
  Dumbbell,
  Activity,
  AlertTriangle,
  Info,
  Beef,
  Flame,
  CheckCircle2,
} from 'lucide-react';

export const MobileGraficas: React.FC = () => {
  const { activePatient } = useNutriMasa();
  const [metricTab, setMetricTab] = useState<'peso' | 'volumen' | 'cargas'>('peso');
  const [verMasAlerta, setVerMasAlerta] = useState(false);

  if (!activePatient) return null;

  const registros = activePatient.registros || [];
  const ultRegistro = registros[registros.length - 1];

  const sorted = [...registros].sort(
    (a, b) => new Date(a.fecha).getTime() - new Date(b.fecha).getTime()
  );

  return (
    <div className="p-4 space-y-4 text-slate-800">
      {/* Encabezado (Figura 5: "Tu progreso" [Peso] [Volumen] [Cargas]) */}
      <div className="space-y-3">
        <h2 className="text-xl font-black text-slate-900 tracking-tight">Tu progreso</h2>

        <div className="flex bg-slate-200/80 p-1 rounded-xl text-xs font-semibold">
          <button
            onClick={() => setMetricTab('peso')}
            className={`flex-1 py-1.5 rounded-lg transition-all ${
              metricTab === 'peso'
                ? 'bg-white text-emerald-900 shadow-xs font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Peso
          </button>
          <button
            onClick={() => setMetricTab('volumen')}
            className={`flex-1 py-1.5 rounded-lg transition-all ${
              metricTab === 'volumen'
                ? 'bg-white text-emerald-900 shadow-xs font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Volumen
          </button>
          <button
            onClick={() => setMetricTab('cargas')}
            className={`flex-1 py-1.5 rounded-lg transition-all ${
              metricTab === 'cargas'
                ? 'bg-white text-emerald-900 shadow-xs font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Cargas
          </button>
        </div>
      </div>

      {/* Gráfica Seleccionada */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-extrabold text-slate-800">
            {metricTab === 'peso' && 'Peso en ayunas, últimas 4 semanas'}
            {metricTab === 'volumen' && 'Volumen de carga semanal (kg)'}
            {metricTab === 'cargas' && 'Sentadilla y Press de banca (kg)'}
          </span>
          <span className="text-xs font-bold text-emerald-700">
            {metricTab === 'peso' && `${activePatient.peso_actual} kg`}
            {metricTab === 'volumen' && `${ultRegistro?.volumen_entrenamiento_kg || 9450} kg`}
            {metricTab === 'cargas' && `${ultRegistro?.sentadilla_kg || 100} / ${ultRegistro?.press_banca_kg || 70} kg`}
          </span>
        </div>

        {/* Gráfica SVG */}
        {metricTab === 'peso' && (
          <div className="pt-2">
            <WeightChart
              registros={registros}
              pesoObjetivo={activePatient.peso_objetivo}
              height={140}
            />
          </div>
        )}

        {metricTab === 'volumen' && (
          <div className="h-32 flex items-end gap-2 pt-4 px-2">
            {sorted.map((item, idx) => {
              const maxVol = 12000;
              const heightPct = Math.min(100, Math.max(20, ((item.volumen_entrenamiento_kg || 8000) / maxVol) * 100));
              return (
                <div key={idx} className="flex-1 flex flex-col items-center gap-1">
                  <span className="text-[9px] font-bold text-slate-500">
                    {((item.volumen_entrenamiento_kg || 0) / 1000).toFixed(1)}k
                  </span>
                  <div className="w-full bg-slate-100 rounded-t-lg h-20 flex items-end">
                    <div
                      className="w-full bg-purple-600 rounded-t-lg transition-all"
                      style={{ height: `${heightPct}%` }}
                    />
                  </div>
                  <span className="text-[10px] text-slate-400">S{idx + 1}</span>
                </div>
              );
            })}
          </div>
        )}

        {metricTab === 'cargas' && (
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between text-xs p-2.5 bg-slate-50 rounded-xl border border-slate-100">
              <span className="font-semibold text-slate-700">Sentadilla trasera:</span>
              <span className="font-bold text-emerald-700 text-sm">{ultRegistro?.sentadilla_kg || 100} kg</span>
            </div>
            <div className="flex items-center justify-between text-xs p-2.5 bg-slate-50 rounded-xl border border-slate-100">
              <span className="font-semibold text-slate-700">Press de banca plano:</span>
              <span className="font-bold text-blue-700 text-sm">{ultRegistro?.press_banca_kg || 70} kg</span>
            </div>
            <div className="text-[11px] text-slate-500 text-center">
              Tendencia actual: <strong className="text-slate-800">{activePatient.tendencia_cargas}</strong>
            </div>
          </div>
        )}
      </div>

      {/* Meta y Plan (Figura 5: "Meta: 80 kg", "Tu plan de hoy...") */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-2.5 text-xs">
        <div className="flex items-center justify-between font-bold">
          <span className="text-slate-700">Meta: {activePatient.peso_objetivo} kg</span>
          <span className="text-emerald-700">
            Faltan {(activePatient.peso_objetivo - activePatient.peso_actual).toFixed(1)} kg
          </span>
        </div>

        <div className="p-3 bg-emerald-50/80 rounded-xl border border-emerald-200 text-emerald-950 space-y-1">
          <p className="font-extrabold text-[11px] text-emerald-900">Tu plan de hoy:</p>
          <p className="leading-relaxed">
            • <strong>Proteína:</strong> {activePatient.proteina_g_kg} g/kg al día ({Math.round(activePatient.proteina_g_kg * activePatient.peso_actual)} g totales).
          </p>
          <p className="leading-relaxed">
            • <strong>Superávit:</strong> +{activePatient.superavit_kcal} kcal sobre tu dieta habitual.
          </p>
        </div>
      </div>

      {/* Aviso Educativo sobre Exceso de Proteína (Figura 5 text) */}
      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 text-xs text-amber-950 space-y-1.5 shadow-2xs">
        <div className="flex items-start gap-2">
          <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <p className="font-bold text-amber-900 leading-snug">
              Aviso educativo: Pasar de 2.0 g/kg de proteína al día no aporta más músculo y de forma sostenida puede exigir más a los riñones.
            </p>
            <button
              onClick={() => setVerMasAlerta(!verMasAlerta)}
              className="text-amber-800 font-bold underline mt-1 block"
            >
              {verMasAlerta ? 'Ver menos' : 'Ver más'}
            </button>
          </div>
        </div>

        {verMasAlerta && (
          <div className="pt-2 border-t border-amber-200 text-[11px] text-amber-800 leading-relaxed space-y-1 mt-2">
            <p>
              Estudios científicos (Morton et al., 2018; Jäger et al., 2017) concluyen que la síntesis de proteína muscular se satura en 1.6–1.8 g/kg. Ingestas superiores a 2.0 g/kg elevan la presión intraglomerular renal sin brindar beneficios hipertróficos comprobados.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
