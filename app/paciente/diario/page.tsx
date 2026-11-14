'use client';

import React, { useState, useEffect, useRef } from 'react';
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
import { guardarTiempoRegistro } from '@/lib/sus';
import { PROTEINA_MAX_REGISTRO_G, nivelAlertaProteina, rangoProteinaG, textoAlertaProteina, textoAvisoDespuesDeGuardar } from '@/lib/motor-reglas';
import { claveDia } from '@/lib/recordatorio';
import { cargarPerfil, descartarPendiente, encolar, fetchConTiempo, propietarioLocal, type CuerpoRegistro } from '@/lib/offline';

// Reloj del navegador, fuera del componente: se usa solo en los manejadores de eventos, nunca al pintar.
const ahoraMs = () => Date.now();

export default function PacienteDiarioPage() {
  const router = useRouter();

  const [fecha, setFecha] = useState<string>('');
  const [pesoAyunas, setPesoAyunas] = useState<string>('');
  const [sentadillaKg, setSentadillaKg] = useState<string>('');
  const [pressBancaKg, setPressBancaKg] = useState<string>('');
  const [volumenKg, setVolumenKg] = useState<string>('');
  const [proteinaG, setProteinaG] = useState<string>(''); // opcional
  const [notas, setNotas] = useState<string>('');

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  // Texto de cuando el registro quedó solo en este dispositivo (sin internet o servidor no disponible).
  const [guardadoLocal, setGuardadoLocal] = useState<string | null>(null);
  const [error, setError] = useState('');
  // Aviso educativo que se muestra después de guardar si la proteína quedó alta (igual que en la app).
  const [avisoPost, setAvisoPost] = useState<string | null>(null);
  // Momento en que se abrió la pantalla: el tiempo del registro (meta < 30 s) se mide hasta guardar.
  const inicioRegistro = useRef(0);

  // Cargar datos previos si existen
  useEffect(() => {
    // Fecha LOCAL (no UTC): después de las 18:00 en México, toISOString() ya daría el día siguiente.
    setFecha(claveDia(new Date()));
    inicioRegistro.current = ahoraMs();

    async function loadTodayLog() {
      // Con internet trae lo último; sin internet usa la copia guardada para poder registrar igual.
      const r = await cargarPerfil();
      if (r.estado !== 'ok') return;
      const p = r.perfil;
      if (p.peso_actual) {
        setPesoAyunas(String(p.peso_actual));
      }
      const ultimoReg = p.registros?.[p.registros.length - 1];
      if (ultimoReg) {
        if (ultimoReg.sentadilla_kg) setSentadillaKg(String(ultimoReg.sentadilla_kg));
        if (ultimoReg.press_banca_kg) setPressBancaKg(String(ultimoReg.press_banca_kg));
        if (ultimoReg.volumen_entrenamiento_kg) setVolumenKg(String(ultimoReg.volumen_entrenamiento_kg));
      }
    }
    loadTodayLog();
  }, []);

  // Proteína (opcional) y alerta en dos niveles, calculadas al pintar con las mismas reglas que la app.
  const pesoNum = Number(pesoAyunas);
  const protTexto = proteinaG.trim().replace(',', '.');
  const protNum = protTexto === '' ? null : Number(protTexto);
  const protValida = protNum !== null && Number.isFinite(protNum) && protNum >= 0 && protNum <= PROTEINA_MAX_REGISTRO_G;
  const protInvalida = protNum !== null && !protValida;
  const ratio = protValida && pesoNum > 0 ? (protNum as number) / pesoNum : null;
  const nivel = ratio !== null ? nivelAlertaProteina(protNum as number, pesoNum) : 'ok';
  const meta = pesoNum > 0 ? rangoProteinaG(pesoNum) : null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess(false);

    if (!pesoNum || pesoNum <= 30 || pesoNum >= 250) {
      setError('Por favor ingresa un peso en ayunas válido (ej. 78.4 kg).');
      return;
    }
    if (protInvalida) {
      setError(`La proteína debe estar entre 0 y ${PROTEINA_MAX_REGISTRO_G} g, o déjala vacía.`);
      return;
    }

    setLoading(true);
    setGuardadoLocal(null);

    const cuerpo: CuerpoRegistro = {
      fecha,
      peso_ayunas: pesoNum,
      sentadilla_kg: Number(sentadillaKg) || 0,
      press_banca_kg: Number(pressBancaKg) || 0,
      volumen_entrenamiento_kg: Number(volumenKg) || 0,
      proteina_consumida_g: protValida ? (protNum as number) : null,
      notas,
    };

    // Tras guardar: si la proteína quedó alta se muestra el aviso educativo y se entra al tablero al cerrarlo.
    const irAlTablero = (ms: number) => {
      const aviso = ratio !== null ? textoAvisoDespuesDeGuardar(nivel, ratio) : null;
      if (aviso) {
        setAvisoPost(aviso);
        return;
      }
      setTimeout(() => {
        router.push('/paciente/dashboard');
        router.refresh();
      }, ms);
    };

    // Guarda el registro en este dispositivo para subirlo después. Devuelve false si no se pudo (no hay datos cargados
    // de la persona o el navegador no deja guardar).
    const guardarEnDispositivo = (motivo: string): boolean => {
      const owner = propietarioLocal();
      if (!owner || !encolar({ tipo: 'registro', owner, fecha: cuerpo.fecha, cuerpo })) {
        setError('No se pudo guardar sin internet. Conéctate para registrar tu día.');
        setLoading(false);
        return false;
      }
      guardarTiempoRegistro((ahoraMs() - inicioRegistro.current) / 1000);
      inicioRegistro.current = ahoraMs();
      setGuardadoLocal(motivo);
      setSuccess(true);
      setLoading(false);
      irAlTablero(2500);
      return true;
    };

    try {
      const res = await fetchConTiempo('/api/paciente/diario', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(cuerpo),
      });

      const data = await res.json().catch(() => ({}));

      if (res.ok && data.success) {
        const dueno = propietarioLocal();
        if (dueno) descartarPendiente(dueno, 'registro', cuerpo.fecha); // un pendiente viejo de ese día pisaría este
        guardarTiempoRegistro((ahoraMs() - inicioRegistro.current) / 1000);
        inicioRegistro.current = ahoraMs();
        setSuccess(true);
        setLoading(false);
        irAlTablero(1500);
        return;
      }
      // El servidor no está disponible o la sesión caducó: el registro no se pierde, se guarda aquí y se sube después.
      if (res.status >= 500 || res.status === 401 || res.status === 403) {
        guardarEnDispositivo(
          res.status >= 500
            ? 'El servidor no respondió. Tu registro quedó guardado en este dispositivo y se subirá solo en cuanto se pueda.'
            : 'Tu sesión caducó. Tu registro quedó guardado en este dispositivo; inicia sesión con la misma cuenta y se subirá.'
        );
        return;
      }
      setError(data.error || 'No se pudo guardar el registro.');
      setLoading(false);
    } catch {
      // Sin conexión (o tiempo agotado). Si el servidor sí lo recibió, al reenviarlo se actualiza el mismo día: no se duplica.
      guardarEnDispositivo('Sin conexión: tu registro quedó guardado en este dispositivo y se subirá solo cuando vuelva el internet.');
    }
  };

  const irAlTableroYa = () => {
    router.push('/paciente/dashboard');
    router.refresh();
  };

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
              <span className="font-bold block text-sm">
                {guardadoLocal ? '¡Registro guardado en tu dispositivo!' : '¡Registro guardado con éxito!'}
              </span>
              <span className="text-xs opacity-90">
                {guardadoLocal ??
                  'Tus datos se sincronizaron con la base de datos y ya los puede revisar tu especialista.'}
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
                        placeholder="Ej. 78.4"
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
                        placeholder="Ej. 100"
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
                        placeholder="Ej. 70"
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
                    placeholder="Ej. 12500"
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
              {/* Proteína (opcional) con alerta en dos niveles */}
              <div className="rounded-3xl p-5 sm:p-6 bg-[var(--surface)] border border-[var(--border)] shadow-[var(--shadow-sm)] space-y-4">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <Apple className="w-5 h-5 text-[var(--primary)]" />
                    <h2 className="text-sm sm:text-base font-bold text-[var(--text)]">3. Ingesta de Proteína</h2>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[var(--surface-raised)] text-[var(--text-muted)] border border-[var(--border)]">
                    Opcional
                  </span>
                </div>

                <div>
                  <label htmlFor="proteina-hoy" className="block text-xs font-bold text-[var(--text-muted)] uppercase mb-1.5">
                    Proteína ingerida hoy (g)
                  </label>
                  <div className="relative">
                    <input
                      id="proteina-hoy"
                      type="text"
                      inputMode="decimal"
                      value={proteinaG}
                      onChange={(e) => setProteinaG(e.target.value)}
                      placeholder="Opcional"
                      aria-invalid={protInvalida}
                      aria-describedby="proteina-ayuda"
                      className="w-full text-2xl font-black text-[var(--text)] bg-[var(--surface-raised)] border border-[var(--border)] rounded-xl px-4 py-2.5 focus:outline-none focus:border-[var(--primary)] pr-10 transition-colors min-h-[44px]"
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-bold text-[var(--text-muted)]">g</span>
                  </div>
                  <p id="proteina-ayuda" className={`mt-1.5 text-xs ${protInvalida ? 'text-rose-600 font-bold' : 'text-[var(--text-subtle)]'}`}>
                    {protInvalida
                      ? `Escribe un valor entre 0 y ${PROTEINA_MAX_REGISTRO_G} g, o déjala vacía.`
                      : meta
                        ? `Meta: ${Math.round(meta.min)}–${Math.round(meta.max)} g (1.6 a 1.8 g/kg)${ratio !== null ? ` · Hoy: ${ratio.toFixed(2)} g/kg` : ''}`
                        : 'Escribe tu peso para ver tu meta de proteína.'}
                  </p>
                </div>

                {nivel === 'rebasa' && ratio !== null && (
                  <div role="alert" className="p-4 rounded-2xl bg-[var(--danger-surface)] border border-[var(--danger-border)] text-[var(--danger-text)] text-xs space-y-1">
                    <div className="flex items-center gap-2 font-bold">
                      <AlertTriangle className="w-4 h-4 shrink-0" />
                      <span>Aviso educativo: llegaste al tope</span>
                    </div>
                    <p className="leading-relaxed">{textoAlertaProteina(nivel, ratio)}</p>
                  </div>
                )}
                {nivel === 'cerca' && ratio !== null && (
                  <div role="status" className="p-4 rounded-2xl bg-[var(--warning-surface)] border border-[var(--warning-border)] text-[var(--warning-text)] text-xs space-y-1">
                    <div className="flex items-center gap-2 font-bold">
                      <AlertTriangle className="w-4 h-4 shrink-0" />
                      <span>Aviso educativo: arriba de tu rango</span>
                    </div>
                    <p className="leading-relaxed">{textoAlertaProteina(nivel, ratio)}</p>
                  </div>
                )}
                {nivel === 'ok' && ratio !== null && (
                  <div className="p-3.5 rounded-2xl bg-[var(--primary-surface)] border border-[var(--primary-border)] text-[var(--primary-text)] text-xs flex items-center gap-2">
                    <Sparkles className="w-4 h-4 shrink-0 text-[var(--primary)]" />
                    <span>{ratio < 1.6 ? 'Vas por debajo del rango de 1.6 a 1.8 g/kg; aún puedes completar tu meta.' : 'Estás dentro del rango de 1.6 a 1.8 g/kg.'}</span>
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

      {avisoPost && (
        <div role="dialog" aria-modal="true" aria-labelledby="aviso-edu-titulo" className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-[var(--surface)] rounded-3xl p-6 shadow-2xl border border-[var(--border)] space-y-4">
            <h3 id="aviso-edu-titulo" className="text-base font-bold text-[var(--text)] flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-600" />
              Aviso educativo
            </h3>
            <p className="text-sm text-[var(--text-muted)] leading-relaxed">{avisoPost}</p>
            <button
              type="button"
              autoFocus
              onClick={irAlTableroYa}
              className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold cursor-pointer min-h-[44px]"
            >
              Entendido
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
