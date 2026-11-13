'use client';

import React from 'react';
import { useNutriMasa } from '@/lib/NutriMasaContext';
import { ShieldCheck, X, FileLock, UserCheck, Scale } from 'lucide-react';

export const ConsentModal: React.FC = () => {
  const { isLegalModalOpen, setIsLegalModalOpen } = useNutriMasa();

  if (!isLegalModalOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full border border-slate-200 overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="p-5 border-b border-slate-200 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
            <div>
              <h3 className="font-bold text-base text-white">
                Aviso de Privacidad y Consentimiento de Datos Sensibles de Salud
              </h3>
              <p className="text-xs text-slate-400">
                Conforme a la Ley Federal de Protección de Datos Personales en Posesión de los Particulares (LFPDPPP)
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsLegalModalOpen(false)}
            className="p-1 rounded-lg text-slate-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-4 text-xs leading-relaxed text-slate-700">
          <div className="bg-emerald-50 border border-emerald-200 p-3.5 rounded-xl text-emerald-950 font-medium">
            <strong>Tratamiento de Datos Personales de Salud (Requerimientos 12–14):</strong><br />
            El peso corporal, las cargas de entrenamiento, el historial de salud y las notas clínicas constituyen <em>datos personales sensibles</em>. NutriMasa implementa salvaguardas técnicas y administrativas para garantizar confidencialidad estricta entre paciente y su nutriólogo asignado.
          </div>

          <div className="space-y-3">
            <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <Scale className="w-4 h-4 text-emerald-700" />
              1. Identidad y Domicilio del Responsable
            </h4>
            <p>
              La plataforma NutriMasa Pro es responsable del tratamiento ético y seguro de sus datos de salud.
            </p>

            <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <UserCheck className="w-4 h-4 text-emerald-700" />
              2. Finalidades Primarias del Tratamiento
            </h4>
            <ul className="list-disc list-inside space-y-1 text-slate-600 pl-2">
              <li>Monitorear la evolución ponderal en ayunas y progresión de fuerza para hipertrofia.</li>
              <li>Calcular recomendaciones de proteína (1.6–1.8 g/kg) con tope preventivo de 2.0 g/kg para protección de la salud renal.</li>
              <li>Ajustar el superávit calórico (+400 a +500 kcal) por el nutriólogo deportivo certificado.</li>
              <li>Permitir la comunicación asíncrona de supervisión y resolución de dudas sobre suplementación.</li>
            </ul>

            <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <FileLock className="w-4 h-4 text-emerald-700" />
              3. Ejercicio de Derechos ARCO (Acceso, Rectificación, Cancelación y Oposición)
            </h4>
            <p>
              Todo usuario y especialista podrá en cualquier momento solicitar el acceso a sus registros, la rectificación de datos inexactos o la cancelación definitiva de su historial a través de los canales institucionales.
            </p>

            <h4 className="font-bold text-slate-900 text-sm text-amber-800">
              4. Deslinde de Responsabilidad y Urgencias Médicas
            </h4>
            <p className="bg-amber-50 p-3 rounded-lg border border-amber-200 text-amber-900 font-medium">
              NutriMasa no es un servicio de atención médica de urgencias ni reemplaza la consulta clínica presencial o diagnósticos médicos de patologías agudas. Ante cualquier síntoma adverso, el paciente debe acudir a un centro hospitalario.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end">
          <button
            onClick={() => setIsLegalModalOpen(false)}
            className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-lg transition-colors"
          >
            Entendido y Conforme
          </button>
        </div>
      </div>
    </div>
  );
};
