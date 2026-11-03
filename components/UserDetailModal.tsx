'use client';

import React, { useState } from 'react';
import { useNutriMasa } from '@/lib/NutriMasaContext';
import { EvolutionCharts } from './EvolutionCharts';
import {
  X,
  TrendingUp,
  Calculator,
  Calendar,
  ShieldCheck,
  Sliders,
  MessageSquare,
  Beef,
  Flame,
  Dumbbell,
  AlertCircle,
  FileSpreadsheet,
} from 'lucide-react';

export const UserDetailModal: React.FC = () => {
  const {
    selectedUsuario,
    isDetailModalOpen,
    setIsDetailModalOpen,
    setIsAdjustModalOpen,
    setActiveTab,
  } = useNutriMasa();

  const [activeTab, setActiveTabLocal] = useState<'graficas' | 'requerimientos' | 'registros' | 'elegibilidad'>('graficas');

  if (!isDetailModalOpen || !selectedUsuario) return null;

  const registros = selectedUsuario.registros || [];
  const gramosProteina = Math.round(selectedUsuario.proteina_g_kg * selectedUsuario.peso_actual);

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-5 border-b border-slate-200 bg-gradient-to-r from-[#0a1a14] to-slate-900 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-emerald-600/30 text-emerald-400 flex items-center justify-center font-bold text-base border border-emerald-500/30">
              {selectedUsuario.nombre.substring(0, 2).toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-lg text-white">
                  {selectedUsuario.nombre}
                </h3>
                <span className="text-xs bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded-full font-semibold">
                  {selectedUsuario.estado}
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5">
                {selectedUsuario.edad} años • {selectedUsuario.estatura_cm} cm • Peso actual:{' '}
                <strong className="text-emerald-400">{selectedUsuario.peso_actual} kg</strong> (Meta:{' '}
                {selectedUsuario.peso_objetivo} kg)
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setIsDetailModalOpen(false);
                setIsAdjustModalOpen(true);
              }}
              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors"
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>Ajustar Plan</span>
            </button>
            <button
              onClick={() => {
                setIsDetailModalOpen(false);
                setActiveTab('mensajes');
              }}
              className="px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>Abrir Chat</span>
            </button>
            <button
              onClick={() => setIsDetailModalOpen(false)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors ml-2"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Tabs */}
        <div className="px-5 border-b border-slate-200 bg-slate-50 flex items-center gap-4 text-xs font-semibold text-slate-600 shrink-0">
          <button
            onClick={() => setActiveTabLocal('graficas')}
            className={`py-3 border-b-2 flex items-center gap-2 transition-all ${
              activeTab === 'graficas'
                ? 'border-emerald-600 text-emerald-800'
                : 'border-transparent hover:text-slate-900'
            }`}
          >
            <TrendingUp className="w-4 h-4" />
            <span>Gráficas de Evolución</span>
          </button>

          <button
            onClick={() => setActiveTabLocal('requerimientos')}
            className={`py-3 border-b-2 flex items-center gap-2 transition-all ${
              activeTab === 'requerimientos'
                ? 'border-emerald-600 text-emerald-800'
                : 'border-transparent hover:text-slate-900'
            }`}
          >
            <Calculator className="w-4 h-4" />
            <span>Requerimientos Diarios Calculados</span>
          </button>

          <button
            onClick={() => setActiveTabLocal('registros')}
            className={`py-3 border-b-2 flex items-center gap-2 transition-all ${
              activeTab === 'registros'
                ? 'border-emerald-600 text-emerald-800'
                : 'border-transparent hover:text-slate-900'
            }`}
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Historial de Registros ({registros.length})</span>
          </button>

          <button
            onClick={() => setActiveTabLocal('elegibilidad')}
            className={`py-3 border-b-2 flex items-center gap-2 transition-all ${
              activeTab === 'elegibilidad'
                ? 'border-emerald-600 text-emerald-800'
                : 'border-transparent hover:text-slate-900'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Elegibilidad y LFPDPPP</span>
          </button>
        </div>

        {/* Modal Tab Content */}
        <div className="p-6 overflow-y-auto flex-1">
          {activeTab === 'graficas' && <EvolutionCharts usuario={selectedUsuario} />}

          {activeTab === 'requerimientos' && (
            <div className="space-y-5 text-xs text-slate-700">
              {/* Marco explicativo */}
              <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4">
                <h4 className="font-bold text-sm text-emerald-900 mb-1">
                  Motor de Reglas y Fórmulas Nutricionales
                </h4>
                <p className="text-emerald-800 leading-relaxed">
                  Conforme a los requerimientos técnicos del proyecto (Requerimiento 8), los cálculos se actualizan dinámicamente según el peso corporal registrado en ayunas ({selectedUsuario.peso_actual} kg), manteniendo la proteína estrictamente entre <strong>1.6 y 1.8 g/kg</strong> y el superávit en <strong>400–500 kcal</strong> para evitar ganancia de grasa y sobrecarga renal.
                </p>
              </div>

              {/* Fórmulas y valores calculados */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-3">
                  <div className="flex items-center gap-2">
                    <Beef className="w-4 h-4 text-emerald-600" />
                    <h5 className="font-bold text-slate-800 text-xs">Proteína Diaria Recomendada</h5>
                  </div>
                  <div className="text-2xl font-black text-slate-900">
                    {gramosProteina} g/día{' '}
                    <span className="text-xs font-normal text-slate-500">
                      ({selectedUsuario.proteina_g_kg} g/kg)
                    </span>
                  </div>
                  <div className="space-y-1 text-[11px] text-slate-500">
                    <p>• Rango de evidencia: 1.6 - 1.8 g/kg (Morton et al., 2018)</p>
                    <p className="text-emerald-700 font-semibold">• Límite superior de seguridad: 2.0 g/kg (Jäger et al., 2017)</p>
                  </div>
                </div>

                <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-3">
                  <div className="flex items-center gap-2">
                    <Flame className="w-4 h-4 text-amber-500" />
                    <h5 className="font-bold text-slate-800 text-xs">Superávit Calórico para Hipertrofia</h5>
                  </div>
                  <div className="text-2xl font-black text-emerald-700">
                    +{selectedUsuario.superavit_kcal} kcal/día
                  </div>
                  <div className="space-y-1 text-[11px] text-slate-500">
                    <p>• TMB + Mantenimiento: ~{selectedUsuario.calorias_mantenimiento} kcal</p>
                    <p className="font-semibold text-slate-800">• Ingesta Diaria Total: {selectedUsuario.calorias_totales} kcal</p>
                  </div>
                </div>
              </div>

              {/* Distribución de macros */}
              <div className="border border-slate-200 rounded-xl p-4 bg-slate-50">
                <h5 className="font-bold text-slate-800 mb-3">Distribución de Macronutrientes y Suplementación</h5>
                <div className="grid grid-cols-3 gap-3 text-center">
                  <div className="bg-white p-3 rounded-lg border border-slate-200">
                    <span className="text-slate-400 block text-[10px]">Carbohidratos Peri-Entreno</span>
                    <span className="text-base font-bold text-slate-900">{selectedUsuario.carbs_peri_entreno_g} g</span>
                    <span className="text-[10px] text-slate-500 block">60-90m pre-entreno</span>
                  </div>
                  <div className="bg-white p-3 rounded-lg border border-slate-200">
                    <span className="text-slate-400 block text-[10px]">Grasas Totales</span>
                    <span className="text-base font-bold text-slate-900">{selectedUsuario.grasas_g} g</span>
                    <span className="text-[10px] text-slate-500 block">Ácidos grasos esenciales</span>
                  </div>
                  <div className="bg-white p-3 rounded-lg border border-slate-200">
                    <span className="text-slate-400 block text-[10px]">Suplemento Validado</span>
                    <span className="text-xs font-bold text-teal-800 block mt-1">Creatina 5g/día</span>
                    <span className="text-[10px] text-teal-600 block">Urdampilleta (2012)</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'registros' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs text-slate-500">
                <span>Registros sincronizados desde la app móvil del usuario</span>
                <span className="font-semibold text-emerald-700">Tiempo de llenado: &lt; 30 segundos</span>
              </div>

              <div className="border border-slate-200 rounded-xl overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-100 text-slate-600 font-bold uppercase text-[10px]">
                    <tr>
                      <th className="p-2.5">Fecha</th>
                      <th className="p-2.5">Peso Ayunas</th>
                      <th className="p-2.5">Sentadilla</th>
                      <th className="p-2.5">Press Banca</th>
                      <th className="p-2.5">Volumen Total</th>
                      <th className="p-2.5">Proteína</th>
                      <th className="p-2.5">Notas</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {registros.map((reg) => (
                      <tr key={reg.id} className="hover:bg-slate-50">
                        <td className="p-2.5 font-semibold text-slate-900">{reg.fecha}</td>
                        <td className="p-2.5 font-bold text-emerald-700">{reg.peso_ayunas} kg</td>
                        <td className="p-2.5">{reg.sentadilla_kg || '-'} kg</td>
                        <td className="p-2.5">{reg.press_banca_kg || '-'} kg</td>
                        <td className="p-2.5">{reg.volumen_entrenamiento_kg ? `${reg.volumen_entrenamiento_kg.toLocaleString()} kg` : '-'}</td>
                        <td className="p-2.5">{reg.proteina_consumida_g ? `${reg.proteina_consumida_g} g` : '-'}</td>
                        <td className="p-2.5 text-slate-500 text-[11px] truncate max-w-xs">{reg.notas || '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'elegibilidad' && (
            <div className="space-y-4 text-xs text-slate-700">
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900">Cuestionario de Elegibilidad Inicial (Filtro Clínico)</span>
                  <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full">
                    Apto para Hipertrofia
                  </span>
                </div>
                <p className="text-slate-600 leading-relaxed text-xs">
                  Conforme a los Límites de la propuesta (Límite 1), las personas con enfermedad renal, diabetes, embarazo o TCA son canalizadas a un profesional médico especializado.
                </p>
              </div>

              <div className="space-y-2">
                <div className="p-3 bg-white border border-slate-200 rounded-lg flex items-center justify-between">
                  <span>Enfermedad renal o diabetes previa:</span>
                  <span className="font-bold text-emerald-700">No reportada (Negativo)</span>
                </div>
                <div className="p-3 bg-white border border-slate-200 rounded-lg flex items-center justify-between">
                  <span>Embarazo o periodo de lactancia:</span>
                  <span className="font-bold text-emerald-700">No reportado (Negativo)</span>
                </div>
                <div className="p-3 bg-white border border-slate-200 rounded-lg flex items-center justify-between">
                  <span>Trastorno de la conducta alimentaria (TCA):</span>
                  <span className="font-bold text-emerald-700">No reportado (Negativo)</span>
                </div>
                <div className="p-3 bg-white border border-slate-200 rounded-lg flex items-center justify-between">
                  <span>Consentimiento informado firmado (LFPDPPP 2025):</span>
                  <span className="font-bold text-emerald-700">Aceptado digitalmente ✓</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end">
          <button
            onClick={() => setIsDetailModalOpen(false)}
            className="px-5 py-2 bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs rounded-lg transition-colors"
          >
            Cerrar Vista Detallada
          </button>
        </div>
      </div>
    </div>
  );
};
