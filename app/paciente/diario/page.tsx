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
  Layers,
  FileText,
} from 'lucide-react';
import { PacienteTopBar } from '@/components/paciente/PacienteNavigation';

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
    <div className="w-full min-h-full">
      <PacienteTopBar
        titulo="Registro Diario"
        subtitulo="Sincronización en menos de 60 segundos"
        badge="Sincronización Diaria"
      />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Banner de retroalimentación de éxito */}
        {success && (
          <div
            role="status"
            className="p-4 rounded-3xl bg-[var(--primary-surface)] border border-[var(--primary-border)] text-[var(--primary-text)] flex items-center gap-3 shadow-sm animate-in fade-in"
          >
            <CheckCircle2 className="w-6 h-6 shrink-0" />
            <div>
              <span className="font-bold block text-sm">¡Registro guardado con éxito!</span>
              <span className="text-xs opacity-90">
                Tus datos se sincronizaron con la base de datos y ya los puede revisar tu especialista.
              </span>
            </div>
          </div>
        )}

        {/* Mensaje de error */}
        {error && (
          <div
            role="alert"
            className="p-4 rounded-3xl bg-[var(--danger-surface)] border border-[var(--danger-border)] text-[var(--danger-text)] flex items-center gap-3 shadow-sm"
          >
            <AlertTriangle className="w-5 h-5 shrink-0" />
            <span className="text-xs font-semibold">{error}</span>
          </div>
        )}

        {/* Formulario Principal Adaptable */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* ==============================================================
                COLUMNA 1: FECHA, PESO EN AYUNAS Y CARGAS (lg:col-span-7)
                ============================================================== */}
            <div className="lg:col-span-7 space-y-6">
              {/* Fecha y Peso en Ayunas */}
              <div className="rounded-3xl p-5 sm:p-6 bg-[var(--surface)] border border-[var(--border)] shadow-[var(--shadow-sm)] space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Scale className="w-5 h-5 text-[var(--primary)]" />
                    <h2 className="text-sm sm:text-base font-bold text-[var(--text)]">
                      1. Medición Matutina
                    </h2>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[var(--primary-surface)] text-[var(--primary-text)] border border-[var(--primary-border)]">
                    Obligatorio
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Fecha */}
                  <div>
                    <label className="block text-xs font-bold text-[var(--text-muted)] uppercase mb-1.5 flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5" />
                      Fecha de la medición
                    </label>
                    <input
                      type="date"
                      value={fecha}
                      onChange={(e) => setFecha(e.target.value)}
                      required
                      className="w-full bg-[var(--surface-raised)] border border-[var(--border)] rounded-xl px-3.5 py-2.5 text-sm text-[var(--text)] focus:outline-none focus:border-[var(--primary)] transition-colors min-h-[44px]"
                    />
                  </div>

                  {/* Peso en Ayunas */}
                  <div>
                    <label className="block text-xs font-bold text-[var(--text-muted)] uppercase mb-1.5 flex items-center gap-1.5">
                      <Scale className="w-3.5 h-3.5" />
                      Peso en Ayunas (kg)
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        step="0.05"
                        value={pesoAyunas}
                        onChange={(e) => setPesoAyunas(e.target.value)}
                        placeholder="78.4"
                        required
                        className="w-full text-xl sm:text-2xl font-black text-[var(--text)] bg-[var(--surface-raised)] border border-[var(--border)] rounded-xl px-4 py-2 focus:outline-none focus:border-[var(--primary)] pr-12 transition-colors min-h-[44px]"
                      />
                      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-[var(--text-muted)]">
                        kg
                      </span>
                    </div>
                  </div>
                </div>

                <p className="text-[11px] text-[var(--text-subtle)] leading-relaxed italic">
                  💡 Pésate inmediatamente al despertar, tras orinar y antes de consumir agua o alimentos.
                </p>
              </div>

              {/* Sobrecarga Progresiva (Sentadilla, Prensa/Banca, Volumen) */}
              <div className="rounded-3xl p-5 sm:p-6 bg-[var(--surface)] border border-[var(--border)] shadow-[var(--shadow-sm)] space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Dumbbell className="w-5 h-5 text-[var(--primary)]" />
                    <h2 className="text-sm sm:text-base font-bold text-[var(--text)]">
                      2. Cargas Principales de Fuerza
                    </h2>
                  </div>
                  <span className="text-xs text-[var(--text-subtle)]">
                    Sobrecarga progresiva
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Sentadilla */}
                  <div>
                    <label className="block text-xs font-bold text-[var(--text-muted)] uppercase mb-1.5">
                      Sentadilla (kg)
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        step="0.5"
                        value={sentadillaKg}
                        onChange={(e) => setSentadillaKg(e.target.value)}
                        placeholder="100"
                        className="w-full text-lg font-black text-[var(--text)] bg-[var(--surface-raised)] border border-[var(--border)] rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-[var(--primary)] pr-10 transition-colors min-h-[44px]"
                      />
                      <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-[var(--text-muted)]">
                        kg
                      </span>
                    </div>
                  </div>

                  {/* Press de Banca */}
                  <div>
                    <label className="block text-xs font-bold text-[var(--text-muted)] uppercase mb-1.5">
                      Press de Banca (kg)
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        step="0.5"
                        value={pressBancaKg}
                        onChange={(e) => setPressBancaKg(e.target.value)}
                        placeholder="70"
                        className="w-full text-lg font-black text-[var(--text)] bg-[var(--surface-raised)] border border-[var(--border)] rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-[var(--primary)] pr-10 transition-colors min-h-[44px]"
                      />
                      <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-[var(--text-muted)]">
                        kg
                      </span>
                    </div>
                  </div>
                </div>

                {/* Volumen total */}
                <div>
                  <label className="block text-xs font-bold text-[var(--text-muted)] uppercase mb-1.5 flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5" />
                    Volumen Total de la Sesión (kg levantados)
                  </label>
                  <input
                    type="number"
                    value={volumenKg}
                    onChange={(e) => setVolumenKg(e.target.value)}
                    placeholder="12500"
                    className="w-full bg-[var(--surface-raised)] border border-[var(--border)] rounded-xl px-3.5 py-2.5 text-sm text-[var(--text)] focus:outline-none focus:border-[var(--primary)] transition-colors min-h-[44px]"
                  />
                  <span className="text-[10px] text-[var(--text-subtle)] block mt-1">
                    Suma total de repeticiones × peso levantado en la sesión de entrenamiento.
                  </span>
                </div>
              </div>
            </div>

            {/* ==============================================================
                COLUMNA 2: PROTEÍNA, NOTAS Y ENVÍO (lg:col-span-5)
                ============================================================== */}
            <div className="lg:col-span-5 space-y-6">
              {/* Proteína con Alerta Médica > 2.0 g/kg */}
              <div className="rounded-3xl p-5 sm:p-6 bg-[var(--surface)] border border-[var(--border)] shadow-[var(--shadow-sm)] space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Apple className="w-5 h-5 text-[var(--primary)]" />
                    <h2 className="text-sm sm:text-base font-bold text-[var(--text)]">
                      3. Ingesta de Proteína
                    </h2>
                  </div>
                  <span className="text-xs font-bold text-[var(--text-muted)]">
                    Ratio: {ratioGKg} g/kg
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[var(--text-muted)] uppercase mb-1.5">
                    Gramos de Proteína Ingeridos Hoy
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      value={proteinaG}
                      onChange={(e) => setProteinaG(e.target.value)}
                      placeholder="140"
                      className="w-full text-2xl font-black text-[var(--text)] bg-[var(--surface-raised)] border border-[var(--border)] rounded-xl px-4 py-2.5 focus:outline-none focus:border-[var(--primary)] pr-10 transition-colors min-h-[44px]"
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-bold text-[var(--text-muted)]">
                      g
                    </span>
                  </div>
                </div>

                {/* ALERTA CIENTÍFICA SI SUPERA 2.0 g/kg (WCAG AA) */}
                {alertaProteina ? (
                  <div
                    role="alert"
                    className="p-4 rounded-2xl bg-[var(--danger-surface)] border border-[var(--danger-border)] text-[var(--danger-text)] text-xs space-y-1"
                  >
                    <div className="flex items-center gap-2 font-bold">
                      <AlertTriangle className="w-4 h-4 shrink-0" />
                      <span>Alerta Médica: Ratio de {ratioGKg} g/kg supera el límite</span>
                    </div>
                    <p className="leading-relaxed opacity-95">
                      Ingestas mayores a 2.0 g/kg no generan hipertrofia muscular extra y saturan la tasa de aclaramiento renal. Tu rango prescrito es de 1.6–1.8 g/kg.
                    </p>
                  </div>
                ) : (
                  <div className="p-3.5 rounded-2xl bg-[var(--primary-surface)] border border-[var(--primary-border)] text-[var(--primary-text)] text-xs flex items-center gap-2">
                    <Sparkles className="w-4 h-4 shrink-0 text-[var(--primary)]" />
                    <span>Rango seguro y óptimo para hipertrofia (1.6 – 1.8 g/kg).</span>
                  </div>
                )}
              </div>

              {/* Sensaciones / Notas */}
              <div className="rounded-3xl p-5 sm:p-6 bg-[var(--surface)] border border-[var(--border)] shadow-[var(--shadow-sm)] space-y-3">
                <label className="block text-xs font-bold text-[var(--text-muted)] uppercase flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5" />
                  Sensaciones del Entrenamiento (Opcional)
                </label>
                <textarea
                  value={notas}
                  onChange={(e) => setNotas(e.target.value)}
                  rows={3}
                  placeholder="Ej. Buena energía en sentadilla, descanso adecuado, sin molestias articulares."
                  className="w-full bg-[var(--surface-raised)] border border-[var(--border)] rounded-xl p-3 text-xs sm:text-sm text-[var(--text)] focus:outline-none focus:border-[var(--primary)] resize-none transition-colors"
                />
              </div>

              {/* Botón de Enviar */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold text-sm sm:text-base shadow-lg shadow-emerald-950/20 flex items-center justify-center gap-2.5 transition-all disabled:opacity-50 cursor-pointer min-h-[48px] focus-visible:outline-2 focus-visible:outline-emerald-500"
              >
                {loading ? 'Sincronizando con base de datos...' : 'Guardar y Sincronizar Registro'}
                <ArrowRight className="w-5 h-5" />
              </button>

              <p className="text-[11px] text-[var(--text-subtle)] text-center flex items-center justify-center gap-1.5">
                <Info className="w-3.5 h-3.5" />
                Actualización instantánea en el panel de tu nutriólogo.
              </p>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
