'use client';

import React from 'react';
import { useNutriMasa } from '@/lib/NutriMasaContext';
import { WeightChart } from './WeightChart';
import {
  Sliders,
  MessageSquare,
  FileDown,
  Maximize2,
  Dumbbell,
  Flame,
  Beef,
  AlertCircle,
  Clock,
  Sparkles,
} from 'lucide-react';

export const UserInspector: React.FC = () => {
  const {
    selectedUsuario,
    setIsDetailModalOpen,
    setIsAdjustModalOpen,
    setIsReportModalOpen,
    setActiveTab,
  } = useNutriMasa();

  if (!selectedUsuario) {
    return (
      <div className="w-80 bg-white border border-slate-200 rounded-xl p-6 text-center text-slate-400 text-xs flex flex-col items-center justify-center">
        Selecciona un paciente en la tabla para inspeccionar su evolución.
      </div>
    );
  }

  const registros = selectedUsuario.registros || [];
  const ultimoRegistro = registros[registros.length - 1];

  // Cálculo de gramos totales de proteína
  const gramosProteina = Math.round(selectedUsuario.proteina_g_kg * selectedUsuario.peso_actual);

  return (
    <div className="w-80 bg-white border border-slate-200 rounded-xl shadow-sm flex flex-col select-none overflow-hidden shrink-0">
      {/* Header (Fiel a Figura 8: "Usuario 02") */}
      <div className="p-4 border-b border-slate-200 bg-gradient-to-b from-slate-50 to-white">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200/60">
              Ficha del Paciente
            </span>
            <h3 className="text-xl font-extrabold text-slate-900 tracking-tight mt-1">
              {selectedUsuario.nombre}
            </h3>
          </div>
          <button
            onClick={() => setIsDetailModalOpen(true)}
            title="Expandir analítica completa"
            className="p-1.5 rounded-lg text-slate-400 hover:text-emerald-700 hover:bg-emerald-50 transition-colors"
          >
            <Maximize2 className="w-4 h-4" />
          </button>
        </div>

        {/* Diagnóstico rápido */}
        <div className="mt-2.5 flex items-center justify-between text-xs">
          <span className="text-slate-500">Estado de hipertrofia:</span>
          <span
            className={`font-semibold px-2 py-0.5 rounded text-[11px] ${
              selectedUsuario.estado === 'En progreso'
                ? 'bg-emerald-100 text-emerald-800'
                : selectedUsuario.estado === 'Estancado'
                ? 'bg-amber-100 text-amber-800'
                : 'bg-rose-100 text-rose-800'
            }`}
          >
            {selectedUsuario.estado}
          </span>
        </div>
      </div>

      {/* Gráfica de peso (Fiel a Figura 8: "Peso, últimas 4 semanas") */}
      <div className="p-4 border-b border-slate-100">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-bold text-slate-700">Peso, últimas 4 semanas</span>
          <span className="text-xs font-semibold text-emerald-700">
            {selectedUsuario.peso_actual.toFixed(1)} kg
          </span>
        </div>

        {/* Gráfica SVG interactiva */}
        <div className="bg-slate-50/70 p-2.5 rounded-lg border border-slate-100">
          <WeightChart
            registros={registros}
            pesoObjetivo={selectedUsuario.peso_objetivo}
            height={130}
          />
        </div>

        {/* Cargas actuales en sentadilla y banca */}
        <div className="grid grid-cols-2 gap-2 mt-3 pt-2 border-t border-slate-100 text-xs">
          <div className="bg-slate-50 p-2 rounded-lg border border-slate-100">
            <span className="text-[10px] text-slate-500 block">Sentadilla</span>
            <span className="font-bold text-slate-800 text-sm">
              {ultimoRegistro?.sentadilla_kg || 100} kg
            </span>
          </div>
          <div className="bg-slate-50 p-2 rounded-lg border border-slate-100">
            <span className="text-[10px] text-slate-500 block">Press de banca</span>
            <span className="font-bold text-slate-800 text-sm">
              {ultimoRegistro?.press_banca_kg || 70} kg
            </span>
          </div>
        </div>
      </div>

      {/* Resumen nutricional calculado (Morton 2018, Urdampilleta 2012) */}
      <div className="p-4 bg-emerald-50/30 border-b border-slate-100 space-y-2">
        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
          Prescripción Activa
        </span>

        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-1.5 text-slate-700">
            <Beef className="w-3.5 h-3.5 text-emerald-600" />
            <span>Proteína diaria:</span>
          </div>
          <span className="font-bold text-slate-900">
            {selectedUsuario.proteina_g_kg} g/kg{' '}
            <span className="text-slate-400 font-normal">({gramosProteina}g)</span>
          </span>
        </div>

        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-1.5 text-slate-700">
            <Flame className="w-3.5 h-3.5 text-amber-600" />
            <span>Superávit calórico:</span>
          </div>
          <span className="font-bold text-emerald-700">
            +{selectedUsuario.superavit_kcal} kcal
          </span>
        </div>

        <div className="flex items-center justify-between text-xs text-slate-500">
          <span>Total ingesta diaria:</span>
          <span className="font-semibold text-slate-800">
            {selectedUsuario.calorias_totales} kcal/día
          </span>
        </div>
      </div>

      {/* Acciones del Inspector (Fieles a la Figura 8 del maquetado) */}
      <div className="p-4 space-y-2.5 mt-auto bg-slate-50/60">
        {/* Botón 1: Ajustar superávit */}
        <button
          onClick={() => setIsAdjustModalOpen(true)}
          className="w-full py-2.5 px-4 bg-[#14532d] hover:bg-[#166534] active:bg-[#0f3d21] text-white text-xs font-semibold rounded-lg shadow-sm transition-all flex items-center justify-center gap-2"
        >
          <Sliders className="w-4 h-4 text-emerald-300" />
          <span>Ajustar superávit</span>
        </button>

        {/* Botón 2: Escribir mensaje */}
        <button
          onClick={() => setActiveTab('mensajes')}
          className="w-full py-2.5 px-4 bg-white hover:bg-slate-50 active:bg-slate-100 text-slate-700 border border-slate-300 text-xs font-semibold rounded-lg shadow-2xs transition-all flex items-center justify-center gap-2"
        >
          <MessageSquare className="w-4 h-4 text-emerald-600" />
          <span>Escribir mensaje</span>
        </button>

        {/* Botón 3: Exportar reporte */}
        <button
          onClick={() => setIsReportModalOpen(true)}
          className="w-full py-2.5 px-4 bg-white hover:bg-slate-50 active:bg-slate-100 text-slate-700 border border-slate-300 text-xs font-semibold rounded-lg shadow-2xs transition-all flex items-center justify-center gap-2"
        >
          <FileDown className="w-4 h-4 text-slate-500" />
          <span>Exportar reporte</span>
        </button>
      </div>
    </div>
  );
};
