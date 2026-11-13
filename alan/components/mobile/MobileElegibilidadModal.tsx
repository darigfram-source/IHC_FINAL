'use client';

import React, { useState } from 'react';
import { useNutriMasa } from '@/lib/NutriMasaContext';
import { ShieldCheck, AlertCircle, CheckCircle2, X } from 'lucide-react';

interface MobileElegibilidadModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MobileElegibilidadModal: React.FC<MobileElegibilidadModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { activePatient, actualizarElegibilidad, setIsLegalModalOpen } = useNutriMasa();

  const [edad, setEdad] = useState(activePatient?.edad || 24);
  const [peso, setPeso] = useState(activePatient?.peso_actual || 71);
  const [estatura, setEstatura] = useState(activePatient?.estatura_cm || 175);
  const [nivel, setNivel] = useState<'Principiante' | 'Intermedio'>(
    activePatient?.nivel_entrenamiento || 'Intermedio'
  );
  const [condicionRenal, setCondicionRenal] = useState(
    activePatient?.condicion_renal_diabetes || false
  );
  const [embarazo, setEmbarazo] = useState(activePatient?.embarazo_lactancia || false);
  const [trastornoAlimentario, setTrastornoAlimentario] = useState(
    activePatient?.trastorno_conducta_alimentaria || false
  );
  const [consentimiento, setConsentimiento] = useState<boolean>(
    Boolean(activePatient?.consentimiento_informado ?? true)
  );

  if (!isOpen || !activePatient) return null;

  const tieneCondicionExcluyente = condicionRenal || embarazo || trastornoAlimentario;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!consentimiento) return;

    actualizarElegibilidad(activePatient.id, {
      edad,
      peso_actual: peso,
      estatura_cm: estatura,
      nivel_entrenamiento: nivel,
      condicion_renal_diabetes: condicionRenal,
      embarazo_lactancia: embarazo,
      trastorno_conducta_alimentaria: trastornoAlimentario,
      elegible: !tieneCondicionExcluyente,
      consentimiento_informado: consentimiento,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto text-slate-800">
        {/* Header (Fiel a Figura 2 del PDF) */}
        <div className="text-center mb-5">
          <div className="w-10 h-10 mx-auto rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mb-2">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <h2 className="text-lg font-black text-slate-900">Antes de empezar</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Confirmamos que la app se adecúa a ti: Son 5 preguntas
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {/* Fila Edad, Peso, Estatura */}
          <div className="grid grid-cols-3 gap-2">
            <div>
              <label className="text-[10px] font-bold text-slate-500 block mb-1">Edad</label>
              <input
                type="number"
                min="18"
                max="40"
                value={edad}
                onChange={(e) => setEdad(Number(e.target.value))}
                className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg text-center font-bold text-slate-900"
              />
            </div>
            <div>
              <label className="text-[10px] font-bold text-slate-500 block mb-1">Peso actual</label>
              <input
                type="number"
                step="0.1"
                value={peso}
                onChange={(e) => setPeso(Number(e.target.value))}
                className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg text-center font-bold text-slate-900"
              />
            </div>
            <div>
              <label className="text-[10px] font-bold text-slate-500 block mb-1">Estatura cm</label>
              <input
                type="number"
                value={estatura}
                onChange={(e) => setEstatura(Number(e.target.value))}
                className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg text-center font-bold text-slate-900"
              />
            </div>
          </div>

          {/* Nivel de entrenamiento */}
          <div>
            <label className="text-[10px] font-bold text-slate-500 block mb-1">
              Nivel de entrenamiento
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setNivel('Principiante')}
                className={`py-2 rounded-lg font-semibold border transition-all text-xs ${
                  nivel === 'Principiante'
                    ? 'bg-emerald-600 text-white border-emerald-600'
                    : 'bg-slate-50 text-slate-600 border-slate-200'
                }`}
              >
                Principiante
              </button>
              <button
                type="button"
                onClick={() => setNivel('Intermedio')}
                className={`py-2 rounded-lg font-semibold border transition-all text-xs ${
                  nivel === 'Intermedio'
                    ? 'bg-emerald-600 text-white border-emerald-600'
                    : 'bg-slate-50 text-slate-600 border-slate-200'
                }`}
              >
                Intermedio
              </button>
            </div>
          </div>

          {/* Cuestionario de exclusión médica */}
          <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-2.5">
            <span className="font-bold text-slate-800 block text-[11px]">
              ¿Tienes alguna de estas condiciones?
            </span>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={condicionRenal}
                onChange={(e) => setCondicionRenal(e.target.checked)}
                className="rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4"
              />
              <span className="text-slate-700">Enfermedad renal o diabetes</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={embarazo}
                onChange={(e) => setEmbarazo(e.target.checked)}
                className="rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4"
              />
              <span className="text-slate-700">Embarazo o lactancia</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={trastornoAlimentario}
                onChange={(e) => setTrastornoAlimentario(e.target.checked)}
                className="rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4"
              />
              <span className="text-slate-700">Trastorno de la conducta alimentaria</span>
            </label>
          </div>

          {/* Advertencia de canalización */}
          {tieneCondicionExcluyente ? (
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-900 text-[11px] leading-relaxed flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <p>
                <strong>Atención:</strong> Por seguridad de tu salud, ante condiciones especiales de metabolismo o riñón te canalizaremos con un profesional médico antes de iniciar pautas de hipertrofia.
              </p>
            </div>
          ) : (
            <p className="text-[10px] text-slate-400 text-center">
              Si no cumples el perfil, te canalizaremos con un profesional de la salud.
            </p>
          )}

          {/* Consentimiento LFPDPPP */}
          <div className="pt-2 border-t border-slate-100">
            <label className="flex items-start gap-2 cursor-pointer text-[10px] text-slate-600 leading-tight">
              <input
                type="checkbox"
                required
                checked={consentimiento}
                onChange={(e) => setConsentimiento(e.target.checked)}
                className="rounded text-emerald-600 focus:ring-emerald-500 w-3.5 h-3.5 mt-0.5 shrink-0"
              />
              <span>
                He leído el aviso de privacidad y doy mi consentimiento para el uso de mis datos de salud conforme a la LFPDPPP.
              </span>
            </label>
          </div>

          {/* Botón Continuar (Figura 2) */}
          <button
            type="submit"
            className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-md transition-all text-xs"
          >
            Continuar
          </button>
        </form>
      </div>
    </div>
  );
};
