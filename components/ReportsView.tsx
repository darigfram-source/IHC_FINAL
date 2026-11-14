'use client';

import React, { useState } from 'react';
import { useNutriMasa } from '@/lib/NutriMasaContext';
import {
  FileText,
  Printer,
  Calendar,
  CheckCircle,
  TrendingUp,
  Dumbbell,
  Beef,
  Flame,
  Award,
  ChevronDown,
} from 'lucide-react';

export const ReportsView: React.FC = () => {
  const {
    usuarios,
    selectedUsuarioId,
    setSelectedUsuarioId,
    selectedUsuario,
    nutriologo,
    reportes,
    generarReporte,
  } = useNutriMasa();

  const [periodoTipo, setPeriodoTipo] = useState<'semanal' | 'mensual'>('mensual');
  const [evaluacionTexto, setEvaluacionTexto] = useState(
    'El paciente ha mantenido una constancia destacada en el registro de peso en ayunas y cargas. Se observa adaptación favorable al superávit calórico controlado (+400 kcal).'
  );
  const [recomendacionesTexto, setRecomendacionesTexto] = useState(
    '1. Priorizar carbohidratos complejos en la ventana de 90 min pre-entrenamiento de sentadilla.\n2. Monitorear que la ingesta proteica no sobrepase 1.8 g/kg para mantener seguridad renal.\n3. Continuar con el registro diario de peso en ayunas y cargas.'
  );

  const userReports = reportes.filter((r) => r.usuario_id === selectedUsuarioId);

  const handlePrint = () => {
    if (typeof window !== 'undefined') {
      window.print();
    }
  };

  const handleCreateReport = () => {
    if (!selectedUsuario) return;
    const pesoInicial = selectedUsuario.peso_inicial;
    const pesoFinal = selectedUsuario.peso_actual;
    const cambio = Number((pesoFinal - pesoInicial).toFixed(1));

    generarReporte({
      usuario_id: selectedUsuario.id,
      periodo_tipo: periodoTipo,
      fecha_inicio: '2026-10-06',
      fecha_fin: '2026-11-03',
      peso_inicial_periodo: pesoInicial,
      peso_final_periodo: pesoFinal,
      cambio_peso: cambio,
      progreso_sentadilla_kg: 5.0,
      progreso_banca_kg: 2.5,
      adherencia_registro_pct: 95,
      evaluacion_clinica: evaluacionTexto,
      recomendaciones_siguientes: recomendacionesTexto,
    });
  };

  return (
    <div className="flex-1 flex gap-5 overflow-hidden">
      {/* Columna Izquierda: Configuración del Reporte */}
      <div className="w-80 bg-white border border-slate-200 rounded-xl p-4 shadow-sm flex flex-col shrink-0 overflow-y-auto print:hidden">
        <div className="border-b border-slate-200 pb-3 mb-4">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-emerald-600" />
            <h3 className="font-bold text-sm text-slate-800">Generador de Reportes</h3>
          </div>
          <p className="text-[11px] text-slate-400 mt-0.5">
            Resumen periódico para seguimiento y expediente clínico
          </p>
        </div>

        {/* Selector de Paciente */}
        <div className="space-y-3 text-xs">
          <div>
            <label className="font-bold text-slate-700 block mb-1">Paciente asignado</label>
            <select
              value={selectedUsuarioId}
              onChange={(e) => setSelectedUsuarioId(e.target.value)}
              className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-800 font-medium"
            >
              {usuarios.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.nombre} ({u.peso_actual} kg)
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="font-bold text-slate-700 block mb-1">Periodicidad del reporte</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setPeriodoTipo('semanal')}
                className={`py-2 rounded-lg font-semibold border transition-all ${
                  periodoTipo === 'semanal'
                    ? 'bg-emerald-600 text-white border-emerald-600'
                    : 'bg-slate-50 text-slate-600 border-slate-200'
                }`}
              >
                Semanal
              </button>
              <button
                type="button"
                onClick={() => setPeriodoTipo('mensual')}
                className={`py-2 rounded-lg font-semibold border transition-all ${
                  periodoTipo === 'mensual'
                    ? 'bg-emerald-600 text-white border-emerald-600'
                    : 'bg-slate-50 text-slate-600 border-slate-200'
                }`}
              >
                Mensual
              </button>
            </div>
          </div>

          <div>
            <label className="font-bold text-slate-700 block mb-1">Evaluación clínica</label>
            <textarea
              rows={3}
              value={evaluacionTexto}
              onChange={(e) => setEvaluacionTexto(e.target.value)}
              className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-800 text-xs"
            />
          </div>

          <div>
            <label className="font-bold text-slate-700 block mb-1">Pautas y recomendaciones</label>
            <textarea
              rows={4}
              value={recomendacionesTexto}
              onChange={(e) => setRecomendacionesTexto(e.target.value)}
              className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-800 text-xs"
            />
          </div>

          <div className="pt-2 space-y-2">
            <button
              onClick={handleCreateReport}
              className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg transition-colors flex items-center justify-center gap-2 shadow-xs"
            >
              <CheckCircle className="w-4 h-4" />
              <span>Guardar en Historial</span>
            </button>

            <button
              onClick={handlePrint}
              className="w-full py-2 bg-slate-800 hover:bg-slate-900 text-white font-bold rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              <Printer className="w-4 h-4" />
              <span>Imprimir / Exportar PDF</span>
            </button>
          </div>
        </div>

        {/* Historial de reportes emitidos */}
        <div className="mt-6 pt-4 border-t border-slate-200">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-2">
            Reportes emitidos ({userReports.length})
          </span>
          <div className="space-y-1.5">
            {userReports.map((r) => (
              <div
                key={r.id}
                className="p-2 bg-slate-50 border border-slate-200 rounded-lg text-[11px] text-slate-600"
              >
                <div className="font-semibold text-slate-800 capitalize">
                  Reporte {r.periodo_tipo}
                </div>
                <div className="text-[10px] text-slate-400">
                  Emitido: {r.creado_en.slice(0, 10)} • Adherencia: {r.adherencia_registro_pct}%
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Columna Derecha: Vista Previa Imprimible (A4 / Hoja membretada oficial) */}
      <div className="flex-1 bg-white border border-slate-200 rounded-xl shadow-sm overflow-y-auto p-8 text-slate-900 print:border-none print:shadow-none print:p-0">
        {/* Encabezado Institucional */}
        <div className="border-b-2 border-emerald-700 pb-5 mb-6 flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl font-black text-emerald-800 tracking-tight">NutriMasa</span>
              <span className="text-xs bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded font-bold">
                EXPEDIENTE CLÍNICO DEPORTIVO
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              NutriMasa Sports Performance • Clínica de Nutrición Especializada
            </p>
            <p className="text-[11px] text-slate-400">
              Programa de Nutrición Deportiva Supervisada para Hipertrofia Muscular
            </p>
          </div>

          <div className="text-right text-xs text-slate-600">
            <p className="font-bold text-slate-900">{nutriologo?.nombre}</p>
            <p>{nutriologo?.especialidad}</p>
            <p className="text-emerald-700 font-semibold">{nutriologo?.cedula_profesional}</p>
            <p className="text-[11px] text-slate-400 mt-1">
              Fecha de emisión: {new Date().toLocaleDateString('es-MX', { day: 'numeric', month: 'long', year: 'numeric' })}
            </p>
          </div>
        </div>

        {/* Ficha del Paciente */}
        <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 mb-6">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
            Datos Generales del Paciente
          </div>
          <div className="grid grid-cols-4 gap-4 text-xs">
            <div>
              <span className="text-slate-400 block text-[10px]">Paciente:</span>
              <span className="font-bold text-slate-900 text-sm">{selectedUsuario?.nombre}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px]">Edad / Estatura:</span>
              <span className="font-semibold text-slate-800">
                {selectedUsuario?.edad} años / {selectedUsuario?.estatura_cm} cm
              </span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px]">Nivel deportivo:</span>
              <span className="font-semibold text-slate-800">{selectedUsuario?.nivel_entrenamiento}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px]">Periodo evaluado:</span>
              <span className="font-bold text-emerald-800 capitalize">{periodoTipo}</span>
            </div>
          </div>
        </div>

        {/* Métricas Clave de Evolución */}
        <div className="grid grid-cols-4 gap-3 mb-6">
          <div className="bg-emerald-50/70 border border-emerald-200 rounded-xl p-3.5 text-center">
            <span className="text-[10px] text-emerald-800 font-bold uppercase block">
              Variación de Peso
            </span>
            <div className="text-xl font-extrabold text-emerald-900 mt-1">
              {(selectedUsuario?.peso_actual || 70) - (selectedUsuario?.peso_inicial || 70) >= 0 ? '+' : ''}
              {((selectedUsuario?.peso_actual || 70) - (selectedUsuario?.peso_inicial || 70)).toFixed(1)} kg
            </div>
            <span className="text-[10px] text-emerald-700">
              Actual: {selectedUsuario?.peso_actual} kg (Objetivo: {selectedUsuario?.peso_objetivo} kg)
            </span>
          </div>

          <div className="bg-blue-50/70 border border-blue-200 rounded-xl p-3.5 text-center">
            <span className="text-[10px] text-blue-800 font-bold uppercase block">
              Sentadilla Máx
            </span>
            <div className="text-xl font-extrabold text-blue-900 mt-1">100 kg</div>
            <span className="text-[10px] text-blue-700">Sobrecarga progresiva</span>
          </div>

          <div className="bg-indigo-50/70 border border-indigo-200 rounded-xl p-3.5 text-center">
            <span className="text-[10px] text-indigo-800 font-bold uppercase block">
              Press de Banca
            </span>
            <div className="text-xl font-extrabold text-indigo-900 mt-1">70 kg</div>
            <span className="text-[10px] text-indigo-700">Tensión mecánica constante</span>
          </div>

          <div className="bg-teal-50/70 border border-teal-200 rounded-xl p-3.5 text-center">
            <span className="text-[10px] text-teal-800 font-bold uppercase block">
              Adherencia de Registro
            </span>
            <div className="text-xl font-extrabold text-teal-900 mt-1">94%</div>
            <span className="text-[10px] text-teal-700">Constancia en app móvil</span>
          </div>
        </div>

        {/* Prescripción Nutricional Basada en Evidencia */}
        <div className="border border-slate-200 rounded-xl p-4 mb-6 bg-white">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
            Pauta Dietética para Hipertrofia (Morton et al. 2018, Urdampilleta 2012)
          </h4>
          <div className="grid grid-cols-4 gap-3 text-xs">
            <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-100">
              <span className="text-slate-400 block text-[10px]">Energía Total:</span>
              <span className="font-extrabold text-slate-900 text-sm">
                {selectedUsuario?.calorias_totales} kcal
              </span>
              <span className="text-emerald-700 text-[10px] font-semibold block">
                Superávit: +{selectedUsuario?.superavit_kcal} kcal
              </span>
            </div>

            <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-100">
              <span className="text-slate-400 block text-[10px]">Proteína Biológica:</span>
              <span className="font-extrabold text-slate-900 text-sm">
                {selectedUsuario?.proteina_g_kg} g/kg
              </span>
              <span className="text-slate-500 text-[10px] block">
                Total: {Math.round((selectedUsuario?.proteina_g_kg || 1.7) * (selectedUsuario?.peso_actual || 70))}g (Tope: 2.0)
              </span>
            </div>

            <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-100">
              <span className="text-slate-400 block text-[10px]">Suplementación indicada:</span>
              <span className="font-bold text-teal-800 text-xs block leading-tight">
                {selectedUsuario?.suplementacion_sugerida || 'Sin indicación registrada'}
              </span>
            </div>
          </div>
        </div>

        {/* Conclusiones Clínicas */}
        <div className="space-y-4 text-xs">
          <div>
            <h5 className="font-bold text-slate-800 mb-1">Evaluación del Especialista:</h5>
            <p className="bg-slate-50 p-3 rounded-lg border border-slate-200 text-slate-700 leading-relaxed whitespace-pre-wrap">
              {evaluacionTexto}
            </p>
          </div>

          <div>
            <h5 className="font-bold text-slate-800 mb-1">Pautas para el Siguiente Periodo:</h5>
            <p className="bg-slate-50 p-3 rounded-lg border border-slate-200 text-slate-700 leading-relaxed whitespace-pre-wrap">
              {recomendacionesTexto}
            </p>
          </div>
        </div>

        {/* Firma del Nutriólogo */}
        <div className="mt-12 pt-6 border-t border-slate-300 flex items-center justify-between">
          <div className="text-[10px] text-slate-400">
            Documento emitido mediante la plataforma de interacción médico-deportiva NutriMasa.<br />
            Los datos son tratados conforme a la LFPDPPP bajo consentimiento informado.
          </div>

          <div className="text-center w-56">
            <div className="border-b border-slate-400 pb-1 mb-1 font-serif italic text-emerald-800 text-sm">
              Nutriólogo Admin
            </div>
            <p className="text-xs font-bold text-slate-800">{nutriologo?.nombre}</p>
            <p className="text-[10px] text-slate-500">{nutriologo?.cedula_profesional}</p>
            <p className="text-[10px] text-emerald-700">Nutriólogo Deportivo Certificado</p>
          </div>
        </div>
      </div>
    </div>
  );
};
