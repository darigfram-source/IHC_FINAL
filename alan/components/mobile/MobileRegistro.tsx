'use client';

import React, { useState } from 'react';
import { useNutriMasa } from '@/lib/NutriMasaContext';
import {
  Check,
  Dumbbell,
  Scale,
  Activity,
  Beef,
  WifiOff,
  AlertTriangle,
  Clock,
  Sparkles,
} from 'lucide-react';

interface MobileRegistroProps {
  onSuccess: () => void;
}

export const MobileRegistro: React.FC<MobileRegistroProps> = ({ onSuccess }) => {
  const { activePatient, agregarRegistroDiario } = useNutriMasa();

  const registros = activePatient?.registros || [];
  const ultRegistro = registros[registros.length - 1];

  const [pesoAyunas, setPesoAyunas] = useState<number | string>(
    ultRegistro?.peso_ayunas || activePatient?.peso_actual || 71.0
  );
  const [volumenKg, setVolumenKg] = useState<number | string>(
    ultRegistro?.volumen_entrenamiento_kg || 9450
  );
  const [sentadillaKg, setSentadillaKg] = useState<number | string>(
    ultRegistro?.sentadilla_kg || 100
  );
  const [pressBancaKg, setPressBancaKg] = useState<number | string>(
    ultRegistro?.press_banca_kg || 70
  );
  const [proteinaG, setProteinaG] = useState<number | string>(
    ultRegistro?.proteina_consumida_g || Math.round((activePatient?.proteina_g_kg || 1.75) * (activePatient?.peso_actual || 71))
  );
  const [notas, setNotas] = useState('');
  const [guardadoExitoso, setGuardadoExitoso] = useState(false);

  if (!activePatient) return null;

  const pesoNum = Number(pesoAyunas) || activePatient.peso_actual;
  const proteinaNum = Number(proteinaG) || 0;
  const proteinaGKgReal = pesoNum > 0 ? proteinaNum / pesoNum : 0;
  const alertaExcesoProteina = proteinaGKgReal > 2.0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const hoy = new Date().toISOString().split('T')[0];

    agregarRegistroDiario(activePatient.id, {
      fecha: hoy,
      peso_ayunas: Number(pesoAyunas),
      volumen_entrenamiento_kg: Number(volumenKg),
      sentadilla_kg: Number(sentadillaKg),
      press_banca_kg: Number(pressBancaKg),
      series_efectivas: 16,
      proteina_consumida_g: Number(proteinaG),
      calorias_consumidas: activePatient.calorias_totales,
      alerta_exceso_proteina: alertaExcesoProteina,
      notas: notas || 'Registro completado en < 30s desde la app móvil.',
    });

    setGuardadoExitoso(true);
    setTimeout(() => {
      setGuardadoExitoso(false);
      onSuccess();
    }, 1500);
  };

  return (
    <div className="p-4 space-y-4 text-slate-800">
      {/* Encabezado (Figura 4: "Registro de hoy - Se completa en menos de 30 segundos") */}
      <div className="border-b border-slate-200 pb-3">
        <h2 className="text-xl font-black text-slate-900 tracking-tight">Registro de hoy</h2>
        <div className="flex items-center gap-1.5 text-xs text-emerald-700 font-semibold mt-0.5">
          <Clock className="w-3.5 h-3.5" />
          <span>Se completa en menos de 30 segundos</span>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4 text-xs">
        {/* Campo 1: Peso en ayunas (kg) con referencia del último registro */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
              <Scale className="w-4 h-4 text-emerald-600" />
              Peso en ayunas (kg)
            </label>
            <span className="text-[11px] text-slate-400">
              Último: {ultRegistro?.peso_ayunas || activePatient.peso_actual} kg
            </span>
          </div>

          <input
            type="number"
            step="0.1"
            required
            value={pesoAyunas}
            onChange={(e) => setPesoAyunas(e.target.value)}
            className="w-full text-2xl font-black text-emerald-800 p-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 text-center"
          />
        </div>

        {/* Campo 2: Volumen de entrenamiento (kg totales) */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
              <Activity className="w-4 h-4 text-purple-600" />
              Volumen de entrenamiento (kg totales)
            </label>
            <span className="text-[11px] text-slate-400">Sugerido</span>
          </div>

          <input
            type="number"
            required
            value={volumenKg}
            onChange={(e) => setVolumenKg(e.target.value)}
            className="w-full text-xl font-extrabold text-slate-800 p-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 text-center"
          />
        </div>

        {/* Campo 3: Progresión de cargas (kg) - Sentadilla y Press de banca (Figura 4) */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
          <label className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
            <Dumbbell className="w-4 h-4 text-blue-600" />
            Progresión de cargas (kg)
          </label>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <span className="text-[11px] font-semibold text-slate-600 block">Sentadilla</span>
              <input
                type="number"
                step="0.5"
                required
                value={sentadillaKg}
                onChange={(e) => setSentadillaKg(e.target.value)}
                className="w-full text-lg font-bold text-slate-800 p-2 bg-slate-50 border border-slate-300 rounded-xl text-center focus:ring-2 focus:ring-emerald-500"
              />
              <span className="text-[10px] text-slate-400 block text-center">
                Previo: {ultRegistro?.sentadilla_kg || 100} kg
              </span>
            </div>

            <div className="space-y-1">
              <span className="text-[11px] font-semibold text-slate-600 block">Press de banca</span>
              <input
                type="number"
                step="0.5"
                required
                value={pressBancaKg}
                onChange={(e) => setPressBancaKg(e.target.value)}
                className="w-full text-lg font-bold text-slate-800 p-2 bg-slate-50 border border-slate-300 rounded-xl text-center focus:ring-2 focus:ring-emerald-500"
              />
              <span className="text-[10px] text-slate-400 block text-center">
                Previo: {ultRegistro?.press_banca_kg || 70} kg
              </span>
            </div>
          </div>
        </div>

        {/* Campo 4: Proteína diaria estimada */}
        <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-2xs space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
              <Beef className="w-4 h-4 text-emerald-600" />
              Proteína ingerida hoy (g)
            </label>
            <span className="text-[11px] text-emerald-700 font-semibold">
              Meta: {Math.round(activePatient.proteina_g_kg * activePatient.peso_actual)}g
            </span>
          </div>

          <input
            type="number"
            value={proteinaG}
            onChange={(e) => setProteinaG(e.target.value)}
            className="w-full text-base font-bold text-slate-800 p-2 bg-slate-50 border border-slate-300 rounded-xl text-center focus:ring-2 focus:ring-emerald-500"
          />

          {alertaExcesoProteina && (
            <div className="p-2.5 bg-amber-50 border border-amber-200 rounded-xl text-amber-900 text-[11px] leading-tight flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <p>
                <strong>Aviso educativo:</strong> Consumir más de 2.0 g/kg de proteína no aporta más músculo y eleva la presión de filtración en tus riñones. Mantente cerca de tu meta.
              </p>
            </div>
          )}
        </div>

        {/* Aviso de sincronización offline (Figura 4: "Sin conexión tu registro se guarda y se sincroniza después") */}
        <div className="p-3 bg-slate-100/90 rounded-xl border border-slate-200 flex items-center gap-2 text-[11px] text-slate-500">
          <WifiOff className="w-4 h-4 text-slate-400 shrink-0" />
          <span>Sin conexión tu registro se guarda y se sincroniza después.</span>
        </div>

        {/* Botón Guardar Registro (Figura 4: [Guardar registro]) */}
        <button
          type="submit"
          disabled={guardadoExitoso}
          className="w-full py-3.5 bg-[#14532d] hover:bg-[#166534] active:bg-[#0f3d21] text-white font-extrabold text-sm rounded-2xl shadow-md transition-all flex items-center justify-center gap-2"
        >
          {guardadoExitoso ? (
            <>
              <Check className="w-5 h-5 text-emerald-300" />
              <span>¡Registro guardado y sincronizado!</span>
            </>
          ) : (
            <span>Guardar registro</span>
          )}
        </button>
      </form>
    </div>
  );
};
