'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Gauge, Save } from 'lucide-react';
import { PacienteTopBar } from '@/components/paciente/PacienteNavigation';
import {
  META_SEGUNDOS_REGISTRO,
  PREGUNTAS_SUS,
  SUS_PROMEDIO_REFERENCIA,
  leerTiemposRegistro,
  puntajeSus,
  resumenTiempos,
} from '@/lib/sus';
import { encolar, EVENTO_SINCRONIZADO, fetchConTiempo, propietarioLocal } from '@/lib/offline';

interface ResultadoSus {
  puntaje: number;
  segundos_registro: number | null;
  creado_en: string;
}

export default function PacienteSusPage() {
  const [resp, setResp] = useState<(number | null)[]>(Array(10).fill(null));
  const [tiempos, setTiempos] = useState<number[]>([]);
  const [historial, setHistorial] = useState<ResultadoSus[] | null>(null);
  const [version, setVersion] = useState(0);
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [aviso, setAviso] = useState<string | null>(null);

  useEffect(() => {
    let vigente = true;
    (async () => {
      try {
        const res = await fetch('/api/paciente/sus', { cache: 'no-store' });
        const j = await res.json();
        if (vigente && res.ok && j.success) setHistorial(j.data as ResultadoSus[] | null);
      } catch {
        // Sin historial: el cuestionario se puede contestar igual.
      } finally {
        // Los tiempos viven en este navegador: se leen aquí para no desajustar el render del servidor.
        if (vigente) setTiempos(leerTiemposRegistro());
      }
    })();
    return () => {
      vigente = false;
    };
  }, [version]);

  // Cuando se sube lo que quedó pendiente, se vuelve a pedir la lista.
  useEffect(() => {
    const recargar = () => setVersion((v) => v + 1);
    window.addEventListener(EVENTO_SINCRONIZADO, recargar);
    return () => window.removeEventListener(EVENTO_SINCRONIZADO, recargar);
  }, []);

  const completo = resp.every((v) => v !== null);
  const puntaje = completo ? puntajeSus(resp as number[]) : null;
  const t = resumenTiempos(tiempos);
  const promedioSus =
    historial && historial.length > 0 ? historial.reduce((a, r) => a + Number(r.puntaje), 0) / historial.length : null;

  const guardar = async () => {
    if (!completo) return;
    setEnviando(true);
    setError(null);
    setAviso(null);
    // Sin internet (o servidor caído) el cuestionario se guarda en el dispositivo y se envía después, como en la app.
    const guardarEnDispositivo = (): boolean => {
      const dueno = propietarioLocal();
      if (!dueno || puntaje === null) return false;
      if (!encolar({ tipo: 'sus', owner: dueno, respuestas: resp as number[], segundos: t?.ultimo })) return false;
      setResp(Array(10).fill(null));
      setAviso(`Cuestionario guardado en este dispositivo. Tu puntaje SUS fue ${puntaje.toFixed(1)} de 100; se enviará cuando haya internet.`);
      return true;
    };
    try {
      const res = await fetchConTiempo('/api/paciente/sus', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ respuestas: resp, segundos_registro: t?.ultimo }),
      });
      const j = await res.json().catch(() => ({}));
      if (res.ok && j.success) {
        setResp(Array(10).fill(null));
        setAviso(`Cuestionario guardado. Tu puntaje SUS fue ${Number(j.puntaje).toFixed(1)} de 100.`);
        setVersion((v) => v + 1);
        return;
      }
      if ((res.status >= 500 || res.status === 401 || res.status === 403) && guardarEnDispositivo()) return;
      setError(j.error ?? 'No se pudo guardar el cuestionario.');
    } catch {
      if (!guardarEnDispositivo()) setError('No se pudo guardar sin internet. Conéctate para enviar el cuestionario.');
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div className="w-full min-h-full">
      <PacienteTopBar titulo="Evaluación de usabilidad" subtitulo="Escala SUS: 10 preguntas" badge="SUS" />

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-5">
        <Link href="/paciente/menu" className="flex items-center gap-2 text-xs font-bold text-[var(--primary-text)] hover:underline min-h-[44px] w-fit">
          <ArrowLeft className="w-4 h-4" />
          Volver al menú
        </Link>

        <section aria-label="Datos de la prueba" className="rounded-3xl p-5 bg-[var(--surface)] border border-[var(--border)] shadow-[var(--shadow-sm)] space-y-1.5">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-2xl bg-teal-500/15 text-teal-600 dark:text-teal-400 flex items-center justify-center">
              <Gauge className="w-5 h-5" />
            </div>
            <h2 className="text-sm sm:text-base font-bold text-[var(--text)]">Datos de la prueba</h2>
          </div>
          <p className="text-sm font-bold text-[var(--text)]">
            {t
              ? `Tiempo del último registro: ${t.ultimo} s (${t.ultimo < META_SEGUNDOS_REGISTRO ? 'cumple' : 'no cumple'} la meta de menos de ${META_SEGUNDOS_REGISTRO} s)`
              : 'Tiempo del registro diario: aún sin medir. Se mide al guardar un registro en este navegador.'}
          </p>
          {t && (
            <p className="text-xs text-[var(--text-muted)]">
              Registros medidos: {t.total} · promedio {t.promedio.toFixed(1)} s · menos de {META_SEGUNDOS_REGISTRO} s: {t.bajoMeta} de {t.total}
            </p>
          )}
          {promedioSus !== null && historial && (
            <p className="text-xs text-[var(--text-muted)]">
              Cuestionarios guardados: {historial.length} · promedio SUS: {promedioSus.toFixed(1)} ({SUS_PROMEDIO_REFERENCIA} es el promedio de referencia)
            </p>
          )}
        </section>

        <p className="text-xs text-[var(--text-subtle)]">1 = totalmente en desacuerdo · 5 = totalmente de acuerdo</p>

        <ol className="space-y-3">
          {PREGUNTAS_SUS.map((p, i) => (
            <li key={i}>
              <fieldset className="rounded-2xl p-4 bg-[var(--surface)] border border-[var(--border)] shadow-[var(--shadow-sm)] space-y-3">
                <legend className="sr-only">Pregunta {i + 1}</legend>
                <p className="text-sm font-semibold text-[var(--text)]">
                  {i + 1}. {p}
                </p>
                <div role="radiogroup" aria-label={`Respuesta a la pregunta ${i + 1}`} className="grid grid-cols-5 gap-2">
                  {[1, 2, 3, 4, 5].map((v) => {
                    const activo = resp[i] === v;
                    return (
                      <button
                        key={v}
                        type="button"
                        role="radio"
                        aria-checked={activo}
                        onClick={() => setResp((r) => r.map((x, j) => (j === i ? v : x)))}
                        className={`min-h-[44px] rounded-xl border text-sm font-extrabold cursor-pointer focus-visible:outline-2 focus-visible:outline-emerald-500 ${
                          activo
                            ? 'bg-[var(--primary-surface)] border-[var(--primary)] text-[var(--primary-text)]'
                            : 'bg-[var(--surface-raised)] border-[var(--border)] text-[var(--text)] hover:bg-[var(--surface-hover)]'
                        }`}
                      >
                        {v}
                      </button>
                    );
                  })}
                </div>
              </fieldset>
            </li>
          ))}
        </ol>

        {puntaje !== null && (
          <p className="rounded-2xl p-4 bg-[var(--primary-surface)] text-[var(--primary-text)] text-lg font-extrabold">
            Puntaje SUS: {puntaje.toFixed(1)} de 100
          </p>
        )}
        {error && (
          <p role="alert" className="text-xs font-bold text-rose-700 dark:text-rose-400">
            {error}
          </p>
        )}
        {aviso && (
          <p role="status" className="text-xs font-bold text-emerald-700 dark:text-emerald-400">
            {aviso}
          </p>
        )}

        <button
          onClick={guardar}
          disabled={!completo || enviando}
          className="w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-bold flex items-center justify-center gap-2 min-h-[44px] cursor-pointer"
        >
          <Save className="w-4 h-4" />
          {enviando ? 'Guardando…' : completo ? 'Guardar cuestionario' : 'Responde las 10 preguntas'}
        </button>
      </div>
    </div>
  );
}
