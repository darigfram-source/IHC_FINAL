'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ClipboardEdit,
  Scale,
  Dumbbell,
  Apple,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Sparkles,
  Info,
  Calendar,
} from 'lucide-react';

export default function PacienteDiarioPage() {
  const router = useRouter();

  const [fecha, setFecha] = useState<string>('');
  const [pesoAyunas, setPesoAyunas] = useState<string>('78.4');
  const [sentadillaKg, setSentadillaKg] = useState<string>('100');
  const [pressBancaKg, setPressBancaKg] = useState<string>('70');
  const [volumenKg, setVolumenKg] = useState<string>('12500');
  const [proteinaG, setProteinaG] = useState<string>('140');
  const [notas, setNotas] = useState<string>('');

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [alertaProteina, setAlertaProteina] = useState(false);

  // Cargar datos previos si existen
  useEffect(() => {
    setFecha(new Date().toISOString().split('T')[0]);

    async function loadTodayLog() {
      try {
        const res = await fetch('/api/paciente/perfil');
        const json = await res.json();
        if (json.success && json.data) {
          if (json.data.peso_actual) {
            setPesoAyunas(String(json.data.peso_actual));
          }
          const ultimoReg = json.data.registros?.[json.data.registros.length - 1];
          if (ultimoReg) {
            if (ultimoReg.sentadilla_kg) setSentadillaKg(String(ultimoReg.sentadilla_kg));
            if (ultimoReg.press_banca_kg) setPressBancaKg(String(ultimoReg.press_banca_kg));
            if (ultimoReg.volumen_entrenamiento_kg) setVolumenKg(String(ultimoReg.volumen_entrenamiento_kg));
            if (ultimoReg.proteina_consumida_g) setProteinaG(String(ultimoReg.proteina_consumida_g));
          }
        }
      } catch (e) {
        console.error('Error cargando datos previos:', e);
      }
    }
    loadTodayLog();
  }, []);

  // Verificar en tiempo real alerta de exceso de proteína (> 2.0 g/kg)
  useEffect(() => {
    const pesoNum = Number(pesoAyunas);
    const protNum = Number(proteinaG);
    if (pesoNum > 0 && protNum > 0) {
      const gKg = protNum / pesoNum;
      setAlertaProteina(gKg > 2.0);
    } else {
      setAlertaProteina(false);
    }
  }, [pesoAyunas, proteinaG]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess(false);

    const pesoNum = Number(pesoAyunas);
    if (!pesoNum || pesoNum <= 30 || pesoNum >= 250) {
      setError('Por favor ingresa un peso en ayunas válido (ej. 78.4 kg).');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/paciente/diario', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fecha,
          peso_ayunas: pesoNum,
          sentadilla_kg: Number(sentadillaKg) || 0,
          press_banca_kg: Number(pressBancaKg) || 0,
          volumen_entrenamiento_kg: Number(volumenKg) || 0,
          proteina_consumida_g: Number(proteinaG) || 0,
          notas,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setError(data.error || 'No se pudo guardar el registro.');
        setLoading(false);
        return;
      }

      setSuccess(true);
      setLoading(false);
      setTimeout(() => {
        router.push('/paciente/dashboard');
        router.refresh();
      }, 1500);
    } catch (err) {
      setError('Error al sincronizar con la base de datos.');
      setLoading(false);
    }
  };

  const pesoNum = Number(pesoAyunas) || 1;
  const protNum = Number(proteinaG) || 0;
  const ratioGKg = (protNum / pesoNum).toFixed(2);

  return (
    <div className="p-4 space-y-4 pb-12">
      {/* Header Formulario (Figura 4) */}
      <div className="pt-1">
        <div className="flex items-center gap-2 mb-1">
          <div className="p-1.5 rounded-lg bg-emerald-100 text-emerald-700">
            <ClipboardEdit className="w-4 h-4" />
          </div>
          <span className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider">
            Sincronización Diaria
          </span>
        </div>
        <h1 className="text-xl font-black text-slate-900 tracking-tight">Registro Diario</h1>
        <p className="text-xs text-slate-600">
          Completa tu peso en ayunas y entrenamiento en menos de 60 segundos. Se sincroniza directamente con tu nutriólogo.
        </p>
      </div>

      {success && (
        <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs flex items-center gap-2.5 shadow-sm animate-in fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <div>
            <span className="font-bold block">¡Registro guardado con éxito!</span>
            <span className="text-[11px] text-emerald-700">
              Tus datos ya están sincronizados con la base de datos.
            </span>
          </div>
        </div>
      )}

      {error && (
        <div className="p-3 rounded-2xl bg-rose-50 border border-rose-300 text-rose-800 text-xs flex items-center gap-2 shadow-sm">
          <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Campo Fecha */}
        <div className="bg-white p-3 rounded-2xl border border-slate-200">
          <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1 flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-slate-500" />
            Fecha de la medición
          </label>
          <input
            type="date"
            value={fecha}
            onChange={(e) => setFecha(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-800 focus:outline-none focus:border-emerald-500"
          />
        </div>

        {/* Sección Peso en Ayunas (Crucial) */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
              <Scale className="w-4 h-4 text-emerald-600" />
              Peso en Ayunas (kg)
            </label>
            <span className="text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full font-bold">
              Obligatorio
            </span>
          </div>
          <div className="relative">
            <input
              type="number"
              step="0.05"
              value={pesoAyunas}
              onChange={(e) => setPesoAyunas(e.target.value)}
              placeholder="78.4"
              required
              className="w-full text-2xl font-black text-slate-900 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 focus:outline-none focus:border-emerald-500 pr-12"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-bold text-slate-500">
              kg
            </span>
          </div>
          <p className="text-[11px] text-slate-600 italic">
            Mídete inmediatamente al levantarte, después de ir al baño y antes de ingerir líquidos.
          </p>
        </div>

        {/* Sección Cargas Principales (Sobrecarga progresiva) */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
              <Dumbbell className="w-4 h-4 text-emerald-600" />
              Sobrecarga Progresiva (Cargas Máximas)
            </label>
            <span className="text-[10px] text-slate-600">Sesión de fuerza</span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <span className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                Sentadilla
              </span>
              <div className="relative">
                <input
                  type="number"
                  step="0.5"
                  value={sentadillaKg}
                  onChange={(e) => setSentadillaKg(e.target.value)}
                  placeholder="100"
                  className="w-full font-black text-slate-900 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-base focus:outline-none focus:border-emerald-500 pr-10"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-500">
                  kg
                </span>
              </div>
            </div>

            <div>
              <span className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                Press de Banca
              </span>
              <div className="relative">
                <input
                  type="number"
                  step="0.5"
                  value={pressBancaKg}
                  onChange={(e) => setPressBancaKg(e.target.value)}
                  placeholder="70"
                  className="w-full font-black text-slate-900 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-base focus:outline-none focus:border-emerald-500 pr-10"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-500">
                  kg
                </span>
              </div>
            </div>
          </div>

          <div>
            <span className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
              Volumen Total de Entrenamiento (kg o series)
            </span>
            <input
              type="number"
              value={volumenKg}
              onChange={(e) => setVolumenKg(e.target.value)}
              placeholder="12500"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-800 focus:outline-none focus:border-emerald-500"
            />
          </div>
        </div>

        {/* Ingesta de Proteína con Alerta de Seguridad Médica */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
              <Apple className="w-4 h-4 text-emerald-600" />
              Proteína Ingerida Hoy (g)
            </label>
            <span className="text-[10px] font-bold text-slate-600">
              Ratio: {ratioGKg} g/kg
            </span>
          </div>

          <div className="relative">
            <input
              type="number"
              value={proteinaG}
              onChange={(e) => setProteinaG(e.target.value)}
              placeholder="140"
              className="w-full text-lg font-black text-slate-900 bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 focus:outline-none focus:border-emerald-500 pr-10"
            />
            <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-500">
              g
            </span>
          </div>

          {/* ALERTA CIENTÍFICA SI EXCEDE 2.0 g/kg (Figura 4) */}
          {alertaProteina ? (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-300 text-rose-800 text-[11px] flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <div>
                <strong className="block font-bold">Límite recomendado superado ({ratioGKg} g/kg)</strong>
                Las evidencias científicas (Morton et al., 2018) demuestran que ingestas superiores a 2.0 g/kg no ofrecen mayor hipertrofia muscular y saturan la oxidación de aminoácidos. Tu rango prescrito es 1.6–1.8 g/kg.
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 text-[11px] text-emerald-700 bg-emerald-50/70 p-2 rounded-lg">
              <Sparkles className="w-3.5 h-3.5 shrink-0" />
              <span>Rango seguro y óptimo para hipertrofia (1.6 a 1.8 g/kg).</span>
            </div>
          )}
        </div>

        {/* Notas Adicionales */}
        <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-sm space-y-1.5">
          <label className="block text-[11px] font-bold text-slate-600 uppercase">
            Sensaciones o Comentarios del Día (Opcional)
          </label>
          <textarea
            value={notas}
            onChange={(e) => setNotas(e.target.value)}
            rows={2}
            placeholder="Ej. Buena energía en sentadilla, descanso adecuado, sin molestias articulares."
            className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-800 focus:outline-none focus:border-emerald-500 resize-none"
          />
        </div>

        {/* Botón Guardar */}
        <button
          type="submit"
          disabled={loading}
          className="w-full py-3.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold rounded-2xl text-sm shadow-md shadow-emerald-700/20 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
        >
          {loading ? 'Guardando en BD...' : 'Guardar y Sincronizar Registro'}
          <ArrowRight className="w-4 h-4" />
        </button>

        <p className="text-[10px] text-slate-600 text-center flex items-center justify-center gap-1">
          <Info className="w-3 h-3" /> Tus datos se actualizan instantáneamente en el panel del especialista.
        </p>
      </form>
    </div>
  );
}
