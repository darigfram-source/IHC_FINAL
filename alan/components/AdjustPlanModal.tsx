'use client';

import React, { useState, useEffect } from 'react';
import { useNutriMasa } from '@/lib/NutriMasaContext';
import {
  X,
  Sliders,
  AlertTriangle,
  Flame,
  Beef,
  Wheat,
  Check,
  Info,
  BookOpen,
} from 'lucide-react';

export const AdjustPlanModal: React.FC = () => {
  const {
    selectedUsuario,
    isAdjustModalOpen,
    setIsAdjustModalOpen,
    updatePlan,
  } = useNutriMasa();

  const [superavitKcal, setSuperavitKcal] = useState<number>(450);
  const [proteinaGKg, setProteinaGKg] = useState<number>(1.75);
  const [carbsPeriEntreno, setCarbsPeriEntreno] = useState<number>(75);
  const [grasasG, setGrasasG] = useState<number>(68);
  const [motivo, setMotivo] = useState<string>('');
  const [suplementacion, setSuplementacion] = useState<string>('');
  const [exito, setExito] = useState(false);
  const [errorGuardar, setErrorGuardar] = useState<string | null>(null);

  useEffect(() => {
    if (selectedUsuario) {
      setSuperavitKcal(selectedUsuario.superavit_kcal || 450);
      setProteinaGKg(selectedUsuario.proteina_g_kg || 1.75);
      setCarbsPeriEntreno(selectedUsuario.carbs_peri_entreno_g || 70);
      setGrasasG(selectedUsuario.grasas_g || 68);
      setSuplementacion(selectedUsuario.suplementacion_sugerida || '');

      if (selectedUsuario.estado === 'Estancado') {
        setMotivo(
          'Ajuste por estancamiento de cargas y peso estable durante 2 semanas. Se incrementa el superávit para reactivar síntesis proteica.'
        );
      } else if (selectedUsuario.estado === 'Peso sube, cargas no') {
        setMotivo(
          'Moderación de superávit calórico y optimización del timing de hidratos peri-entrenamiento para evitar ganancia excesiva de grasa.'
        );
      } else {
        setMotivo('Optimización periódica de macronutrientes para soporte de hipertrofia continua.');
      }
    }
  }, [selectedUsuario]);

  if (!isAdjustModalOpen || !selectedUsuario) return null;

  const peso = selectedUsuario.peso_actual;
  const caloriasMantenimiento = selectedUsuario.calorias_mantenimiento || 2300;
  const caloriasTotalesNuevas = caloriasMantenimiento + superavitKcal;
  const gramosProteinaNuevos = Math.round(proteinaGKg * peso);
  const caloriasProteina = gramosProteinaNuevos * 4;
  const caloriasGrasas = grasasG * 9;
  const carbohidratosTotalesG = Math.max(
    150,
    Math.round((caloriasTotalesNuevas - caloriasProteina - caloriasGrasas) / 4)
  );

  const isProteinaExcesiva = proteinaGKg > 2.0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorGuardar(null);
    const error = await updatePlan({
      usuarioId: selectedUsuario.id,
      superavit_kcal: superavitKcal,
      proteina_g_kg: proteinaGKg,
      carbs_peri_entreno_g: carbsPeriEntreno,
      grasas_g: grasasG,
      motivo,
      suplementacion,
    });
    if (error) {
      setErrorGuardar(error);
      return;
    }

    setExito(true);
    setTimeout(() => {
      setExito(false);
      setIsAdjustModalOpen(false);
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-xl w-full border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="p-5 border-b border-slate-200 bg-gradient-to-r from-emerald-950 to-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-600/30 rounded-xl border border-emerald-400/30">
              <Sliders className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <h3 className="font-bold text-base text-white">
                Ajuste Manual del Plan Nutricional
              </h3>
              <p className="text-xs text-emerald-300/80">
                Paciente: <span className="font-semibold text-white">{selectedUsuario.nombre}</span> ({peso} kg en ayunas)
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsAdjustModalOpen(false)}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 text-sm max-h-[80vh] overflow-y-auto">
          {/* Fundamento científico visible */}
          <div className="bg-emerald-50 border border-emerald-200/80 rounded-xl p-3.5 flex items-start gap-3">
            <BookOpen className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
            <div className="text-xs text-emerald-950">
              <span className="font-bold">Marco Basado en Evidencia Científica:</span>
              <p className="mt-0.5 text-emerald-900 leading-relaxed">
                Superávit recomendado: <strong>400–500 kcal</strong> sobre dieta habitual (Urdampilleta et al., 2012). Rango proteico óptimo: <strong>1.6–1.8 g/kg</strong> al día (Morton et al., 2018; Jäger et al., 2017).
              </p>
            </div>
          </div>

          {/* Control 1: Superávit Calórico */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <Flame className="w-4 h-4 text-amber-500" />
                Superávit Calórico para Hipertrofia (kcal/día)
              </label>
              <span className="text-sm font-extrabold text-emerald-700">
                +{superavitKcal} kcal
              </span>
            </div>

            <input
              type="range"
              min="250"
              max="650"
              step="25"
              value={superavitKcal}
              onChange={(e) => setSuperavitKcal(Number(e.target.value))}
              className="w-full accent-emerald-600 cursor-pointer"
            />

            {/* Presets rápidos */}
            <div className="flex items-center gap-2 pt-1">
              <span className="text-[11px] text-slate-400">Preajustes:</span>
              {[350, 400, 450, 500].map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => setSuperavitKcal(preset)}
                  className={`px-2.5 py-1 text-xs rounded-md border font-medium transition-all ${
                    superavitKcal === preset
                      ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                      : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  +{preset} kcal
                </button>
              ))}
            </div>
          </div>

          {/* Control 2: Proteína en g/kg */}
          <div className="space-y-2 pt-2 border-t border-slate-100">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <Beef className="w-4 h-4 text-emerald-600" />
                Ingesta Diaria de Proteína (g / kg)
              </label>
              <div className="text-right">
                <span className="text-sm font-extrabold text-slate-900">{proteinaGKg.toFixed(2)} g/kg</span>
                <span className="text-xs text-slate-500 ml-1.5">({gramosProteinaNuevos} g totales)</span>
              </div>
            </div>

            <input
              type="range"
              min="1.4"
              max="2.3"
              step="0.05"
              value={proteinaGKg}
              onChange={(e) => setProteinaGKg(Number(e.target.value))}
              className="w-full accent-emerald-600 cursor-pointer"
            />

            {/* Alerta de exceso de proteína (> 2.0 g/kg) */}
            {isProteinaExcesiva && (
              <div className="bg-rose-50 border border-rose-200 rounded-lg p-3 flex items-start gap-2.5 text-xs text-rose-900 animate-in fade-in">
                <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold">Advertencia Clínica: Exceso Proteico</span>
                  <p className="mt-0.5 text-rose-800">
                    La evidencia clínica (de Lorenzo & Mihic, 2026; Ko et al., 2020) no demuestra beneficios hipertróficos por encima de 2.0 g/kg y puede inducir aumento de la presión intraglomerular renal. El sistema recomienda mantener entre 1.6 y 1.8 g/kg.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Control 3: Carbohidratos Peri-Entrenamiento y Grasas */}
          <div className="grid grid-cols-2 gap-4 pt-2 border-t border-slate-100">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Carbos Peri-Entreno (g)
              </label>
              <input
                type="number"
                min="40"
                max="150"
                value={carbsPeriEntreno}
                onChange={(e) => setCarbsPeriEntreno(Number(e.target.value))}
                className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
              />
              <span className="text-[10px] text-slate-400 mt-0.5 block">
                60-90m pre y post-entreno
              </span>
            </div>
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Grasas Saludables (g)
              </label>
              <input
                type="number"
                min="40"
                max="120"
                value={grasasG}
                onChange={(e) => setGrasasG(Number(e.target.value))}
                className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
              />
              <span className="text-[10px] text-slate-400 mt-0.5 block">
                ~1.0 g / kg de peso
              </span>
            </div>
          </div>

          {/* Resumen del nuevo balance metabólico */}
          <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
            <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-2">
              Nueva Distribución Diaria Estimada
            </div>
            <div className="grid grid-cols-4 gap-2 text-center">
              <div className="bg-white p-2 rounded-lg border border-slate-100">
                <span className="text-[10px] text-slate-400 block">Total Kcal</span>
                <span className="font-extrabold text-emerald-800 text-sm">{caloriasTotalesNuevas}</span>
              </div>
              <div className="bg-white p-2 rounded-lg border border-slate-100">
                <span className="text-[10px] text-slate-400 block">Proteína</span>
                <span className="font-extrabold text-slate-800 text-sm">{gramosProteinaNuevos}g</span>
              </div>
              <div className="bg-white p-2 rounded-lg border border-slate-100">
                <span className="text-[10px] text-slate-400 block">Carbohidratos</span>
                <span className="font-extrabold text-slate-800 text-sm">{carbohidratosTotalesG}g</span>
              </div>
              <div className="bg-white p-2 rounded-lg border border-slate-100">
                <span className="text-[10px] text-slate-400 block">Grasas</span>
                <span className="font-extrabold text-slate-800 text-sm">{grasasG}g</span>
              </div>
            </div>
          </div>

          {/* Suplementación: solo lo que el nutriólogo indique; vacío = el paciente ve "Pendiente de tu nutriólogo" */}
          <div>
            <label htmlFor="suplementacion" className="text-xs font-bold text-slate-700 block mb-1">
              Suplementación indicada al paciente (opcional)
            </label>
            <input
              id="suplementacion"
              type="text"
              maxLength={200}
              value={suplementacion}
              onChange={(e) => setSuplementacion(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 text-slate-800"
              placeholder="Ej.: Creatina monohidratada 3–5 g al día (déjalo vacío si no indicas ninguna)"
            />
            <p className="text-[10px] text-slate-400 mt-1">
              Si lo dejas vacío, el paciente ve “Pendiente de tu nutriólogo”. Nada se indica por defecto.
            </p>
          </div>

          {/* Motivo clínico */}
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">
              Justificación Clínica del Reajuste (se notificará al paciente en su chat)
            </label>
            <textarea
              rows={2}
              required
              value={motivo}
              onChange={(e) => setMotivo(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 text-slate-800"
              placeholder="Escribe la razón profesional del cambio calórico o de macronutrientes..."
            />
          </div>

          {errorGuardar && (
            <div role="alert" className="flex items-start gap-2 p-3 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-700">
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{errorGuardar}</span>
            </div>
          )}

          {/* Botones de acción */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200">
            <button
              type="button"
              onClick={() => setIsAdjustModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 rounded-lg hover:bg-slate-100"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={exito}
              className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white text-xs font-bold rounded-lg shadow-sm flex items-center gap-2 transition-all"
            >
              {exito ? (
                <>
                  <Check className="w-4 h-4" />
                  <span>¡Plan Actualizado y Notificado!</span>
                </>
              ) : (
                <>
                  <Sliders className="w-4 h-4" />
                  <span>Guardar y Aplicar Ajuste</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
