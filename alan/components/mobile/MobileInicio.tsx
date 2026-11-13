'use client';

import React from 'react';
import { useNutriMasa } from '@/lib/NutriMasaContext';
import {
  Flame,
  Beef,
  MessageSquare,
  BookOpen,
  Target,
  ArrowRight,
  TrendingUp,
  Sparkles,
  CheckCircle2,
} from 'lucide-react';

interface MobileInicioProps {
  onNavigateTab: (tab: 'inicio' | 'registro' | 'graficas' | 'chat' | 'menu') => void;
  onOpenElegibilidad: () => void;
}

export const MobileInicio: React.FC<MobileInicioProps> = ({
  onNavigateTab,
  onOpenElegibilidad,
}) => {
  const { activePatient, mensajes } = useNutriMasa();

  if (!activePatient) return null;

  // Gramos calculados de proteína diarios basados en el peso actual
  const gramosProteina = Math.round(activePatient.proteina_g_kg * activePatient.peso_actual);

  // Último mensaje del nutriólogo
  const ultimoMensajeNutri = mensajes
    .filter((m) => m.usuario_id === activePatient.id && m.remitente === 'nutriologo')
    .slice(-1)[0];

  // Cálculo de progreso hacia la meta
  const progresoKg = (activePatient.peso_actual - activePatient.peso_inicial).toFixed(1);
  const faltaKg = (activePatient.peso_objetivo - activePatient.peso_actual).toFixed(1);

  return (
    <div className="p-4 space-y-4 text-slate-800">
      {/* Saludo (Fiel a Figura 3: "Hola, [Nombre]") */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-black text-slate-900 tracking-tight">
            Hola, {activePatient.nombre.replace('Usuario 02 ', '')}
          </h1>
          <p className="text-xs text-slate-500 font-medium">
            Plan de Hipertrofia Supervisada Activo
          </p>
        </div>
        <button
          onClick={onOpenElegibilidad}
          className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2.5 py-1 rounded-full border border-emerald-300 hover:bg-emerald-200 transition-colors"
        >
          {activePatient.nivel_entrenamiento} ✓
        </button>
      </div>

      {/* Banner Superior Verde (Figura 3: "Tu registro de hoy está pendiente" [Registrar ahora]) */}
      <div className="bg-[#14532d] text-white p-4 rounded-2xl shadow-md border border-emerald-800 flex items-center justify-between">
        <div>
          <p className="font-bold text-xs text-emerald-100">Tu registro de hoy está pendiente</p>
          <p className="text-[10px] text-emerald-300/80 mt-0.5">Toma menos de 30 segundos</p>
        </div>
        <button
          onClick={() => onNavigateTab('registro')}
          className="px-3.5 py-2 bg-white text-emerald-900 font-extrabold text-xs rounded-xl shadow-xs hover:bg-emerald-50 active:scale-95 transition-all"
        >
          Registrar ahora
        </button>
      </div>

      {/* Tarjeta de Peso Actual vs Meta (Figura 3: 78.4 kg - 80 kg) */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-2xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
            Peso actual
          </span>
          <div className="text-xl font-black text-slate-900 mt-1">
            {activePatient.peso_actual.toFixed(1)} <span className="text-xs font-normal text-slate-500">kg</span>
          </div>
          <span className="text-[10px] text-emerald-700 font-semibold mt-0.5 block">
            {Number(progresoKg) >= 0 ? `+${progresoKg}` : progresoKg} kg desde inicio
          </span>
        </div>

        <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-2xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
            Peso meta
          </span>
          <div className="text-xl font-black text-emerald-700 mt-1">
            {activePatient.peso_objetivo.toFixed(1)} <span className="text-xs font-normal text-slate-500">kg</span>
          </div>
          <span className="text-[10px] text-slate-400 font-medium mt-0.5 block">
            Faltan {faltaKg} kg
          </span>
        </div>
      </div>

      {/* Tarjeta Plan de hoy (Figura 3: Proteína 1.6 a 1.8 g/kg, Superávit +400 a 500 kcal) */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-extrabold text-slate-900 uppercase tracking-wide">
            Plan de hoy
          </span>
          <span className="text-[10px] font-bold bg-emerald-50 text-emerald-800 px-2 py-0.5 rounded border border-emerald-200">
            {activePatient.calorias_totales} kcal diarias
          </span>
        </div>

        <div className="space-y-2 text-xs">
          <div className="flex items-center justify-between p-2.5 bg-slate-50 rounded-xl border border-slate-100">
            <div className="flex items-center gap-2">
              <Beef className="w-4 h-4 text-emerald-600" />
              <span className="font-semibold text-slate-800">Proteína:</span>
            </div>
            <div className="text-right">
              <span className="font-extrabold text-slate-900">
                {activePatient.proteina_g_kg} g/kg
              </span>
              <span className="text-slate-500 text-[11px] ml-1.5 font-bold text-emerald-700">
                ({gramosProteina} g)
              </span>
            </div>
          </div>

          <div className="flex items-center justify-between p-2.5 bg-slate-50 rounded-xl border border-slate-100">
            <div className="flex items-center gap-2">
              <Flame className="w-4 h-4 text-amber-500" />
              <span className="font-semibold text-slate-800">Superávit calórico:</span>
            </div>
            <span className="font-extrabold text-emerald-700">
              +{activePatient.superavit_kcal} kcal
            </span>
          </div>
        </div>
      </div>

      {/* Aviso de Mensaje del Nutriólogo (Figura 3: "Tu nutriólogo respondió" [Ver]) */}
      {ultimoMensajeNutri && (
        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3.5 flex items-center justify-between shadow-2xs">
          <div className="flex items-center gap-2.5 overflow-hidden pr-2">
            <div className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-xs shrink-0">
              <MessageSquare className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold text-slate-900 truncate">Tu nutriólogo respondió</p>
              <p className="text-[11px] text-slate-500 truncate mt-0.5">
                {ultimoMensajeNutri.contenido}
              </p>
            </div>
          </div>
          <button
            onClick={() => onNavigateTab('chat')}
            className="px-3 py-1.5 bg-white text-emerald-800 border border-slate-200 rounded-lg text-xs font-bold hover:bg-emerald-50 shrink-0"
          >
            Ver
          </button>
        </div>
      )}

      {/* Botones de Acceso Rápido (Figura 3: [Metas] [Biblioteca]) */}
      <div className="grid grid-cols-2 gap-3 pt-1">
        <button
          onClick={() => onNavigateTab('graficas')}
          className="p-3 bg-white border border-slate-200 hover:border-emerald-300 rounded-2xl text-center shadow-2xs transition-all flex flex-col items-center justify-center gap-1 group"
        >
          <Target className="w-5 h-5 text-emerald-600 group-hover:scale-110 transition-transform" />
          <span className="text-xs font-bold text-slate-800">Metas y Cargas</span>
        </button>

        <button
          onClick={() => onNavigateTab('menu')}
          className="p-3 bg-white border border-slate-200 hover:border-emerald-300 rounded-2xl text-center shadow-2xs transition-all flex flex-col items-center justify-center gap-1 group"
        >
          <BookOpen className="w-5 h-5 text-teal-600 group-hover:scale-110 transition-transform" />
          <span className="text-xs font-bold text-slate-800">Biblioteca</span>
        </button>
      </div>
    </div>
  );
};
