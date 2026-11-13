'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, CheckCircle2, Circle, Send, ShieldCheck, TriangleAlert } from 'lucide-react';
import { PacienteTopBar } from '@/components/paciente/PacienteNavigation';
import {
  ARCO_MAX_CARACTERES,
  COLOR_ESTADO_ARCO,
  TIPOS_ARCO,
  etiquetaEstadoArco,
  etiquetaTipoArco,
  validarSolicitudArco,
  type SolicitudArco,
} from '@/lib/arco';
import { encolar, EVENTO_SINCRONIZADO, fetchConTiempo, propietarioLocal } from '@/lib/offline';

const fechaLarga = (iso: string) =>
  new Date(iso).toLocaleDateString('es-MX', { day: 'numeric', month: 'long', year: 'numeric' });

export default function PacienteArcoPage() {
  const [lista, setLista] = useState<SolicitudArco[]>([]);
  const [tieneNutriologo, setTieneNutriologo] = useState(true);
  const [cargando, setCargando] = useState(true);
  const [errorCarga, setErrorCarga] = useState(false);
  const [tipo, setTipo] = useState<string>('');
  const [texto, setTexto] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);
  const [aviso, setAviso] = useState<string | null>(null);

  // Cambiar `version` vuelve a pedir la lista (después de enviar una solicitud).
  const [version, setVersion] = useState(0);

  useEffect(() => {
    let vigente = true;
    (async () => {
      try {
        const res = await fetch('/api/paciente/arco', { cache: 'no-store' });
        const j = await res.json();
        if (!res.ok || !j.success) throw new Error('Error');
        if (!vigente) return;
        setLista(j.data as SolicitudArco[]);
        setTieneNutriologo(Boolean(j.tiene_nutriologo));
        setErrorCarga(false);
      } catch {
        if (vigente) setErrorCarga(true);
      } finally {
        if (vigente) setCargando(false);
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

  const enviar = async () => {
    const err = validarSolicitudArco(tipo, texto);
    if (err) {
      setError(err);
      return;
    }
    setError(null);
    setEnviando(true);
    // Sin internet se guarda en el dispositivo y se envía sola al volver la conexión (como en la app). Mientras tanto
    // la solicitud NO ha llegado al responsable: el aviso lo dice con claridad.
    const guardarEnDispositivo = (): boolean => {
      const dueno = propietarioLocal();
      if (!dueno || !encolar({ tipo: 'arco', owner: dueno, arcoTipo: tipo, descripcion: texto })) return false;
      setTipo('');
      setTexto('');
      setAviso('Tu solicitud quedó guardada en este dispositivo, pero todavía NO se ha enviado. Se enviará sola cuando haya internet.');
      return true;
    };
    try {
      const res = await fetchConTiempo('/api/paciente/arco', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tipo, descripcion: texto }),
      });
      const j = await res.json().catch(() => ({}));
      if (res.ok && j.success) {
        setTipo('');
        setTexto('');
        setAviso('Solicitud registrada. Aquí puedes ver cómo avanza.');
        setVersion((v) => v + 1);
        return;
      }
      if ((res.status >= 500 || res.status === 401 || res.status === 403) && guardarEnDispositivo()) return;
      setError(j.error ?? 'No se pudo registrar tu solicitud.');
    } catch {
      if (!guardarEnDispositivo()) setError('No se pudo guardar sin internet. Conéctate para enviar tu solicitud.');
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div className="w-full min-h-full">
      <PacienteTopBar titulo="Ejercer mis derechos" subtitulo="Acceso, rectificación, cancelación y oposición" badge="ARCO" />

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        <Link
          href="/paciente/menu"
          className="flex items-center gap-2 text-xs font-bold text-[var(--primary-text)] hover:underline min-h-[44px] w-fit"
        >
          <ArrowLeft className="w-4 h-4" />
          Volver al menú
        </Link>

        <section
          aria-label="Nueva solicitud"
          className="rounded-3xl p-5 sm:p-6 bg-[var(--surface)] border border-[var(--border)] shadow-[var(--shadow-sm)] space-y-4"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-500/15 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h2 className="text-sm sm:text-base font-bold text-[var(--text)]">¿Qué quieres solicitar?</h2>
          </div>

          <div role="radiogroup" aria-label="Tipo de solicitud" className="space-y-2">
            {TIPOS_ARCO.map((t) => {
              const activo = tipo === t.clave;
              return (
                <button
                  key={t.clave}
                  type="button"
                  role="radio"
                  aria-checked={activo}
                  onClick={() => setTipo(t.clave)}
                  className={`w-full text-left flex items-start gap-3 p-3 rounded-2xl border min-h-[44px] cursor-pointer transition-colors focus-visible:outline-2 focus-visible:outline-emerald-500 ${
                    activo
                      ? 'border-[var(--primary)] bg-[var(--primary-surface)]'
                      : 'border-[var(--border)] bg-[var(--surface-raised)] hover:bg-[var(--surface-hover)]'
                  }`}
                >
                  {activo ? (
                    <CheckCircle2 className="w-5 h-5 text-[var(--primary)] shrink-0 mt-0.5" />
                  ) : (
                    <Circle className="w-5 h-5 text-[var(--text-subtle)] shrink-0 mt-0.5" />
                  )}
                  <span>
                    <span className="block text-sm font-bold text-[var(--text)]">{t.titulo}</span>
                    <span className="block text-xs text-[var(--text-muted)]">{t.ayuda}</span>
                  </span>
                </button>
              );
            })}
          </div>

          <div className="space-y-1">
            <label htmlFor="arco-texto" className="text-xs font-bold text-[var(--text)]">
              Describe tu solicitud
            </label>
            <textarea
              id="arco-texto"
              value={texto}
              onChange={(e) => setTexto(e.target.value)}
              maxLength={ARCO_MAX_CARACTERES}
              rows={5}
              className="w-full rounded-2xl p-3 text-sm bg-[var(--surface-raised)] border border-[var(--border)] text-[var(--text)] focus-visible:outline-2 focus-visible:outline-emerald-500"
            />
            <p className="text-[11px] text-[var(--text-subtle)] text-right">
              {texto.length}/{ARCO_MAX_CARACTERES}
            </p>
          </div>

          {error && (
            <p role="alert" className="text-xs font-bold text-rose-700 dark:text-rose-400">
              {error}
            </p>
          )}
          {aviso && !error && (
            <p role="status" className="text-xs font-bold text-emerald-700 dark:text-emerald-400">
              {aviso}
            </p>
          )}

          <button
            onClick={enviar}
            disabled={enviando}
            className="w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 text-white text-xs font-bold flex items-center justify-center gap-2 min-h-[44px] cursor-pointer"
          >
            <Send className="w-4 h-4" />
            {enviando ? 'Enviando…' : 'Enviar solicitud'}
          </button>

          {!tieneNutriologo && !cargando && (
            <p className="flex items-start gap-2 text-xs text-amber-800 dark:text-amber-300 bg-amber-500/10 border border-amber-500/30 rounded-2xl p-3">
              <TriangleAlert className="w-4 h-4 shrink-0 mt-0.5" />
              Todavía no tienes nutriólogo asignado. Tu solicitud quedará registrada y se atenderá cuando lo tengas.
            </p>
          )}
          <p className="text-[11px] text-[var(--text-subtle)] leading-relaxed">
            Tu solicitud llega a tu nutriólogo asignado, que debe responderte en el plazo que marca la ley.
          </p>
        </section>

        <section aria-label="Tus solicitudes" className="space-y-3">
          <h2 className="text-sm sm:text-base font-bold text-[var(--text)]">Tus solicitudes</h2>
          {cargando ? (
            <p className="text-xs text-[var(--text-subtle)]">Cargando…</p>
          ) : errorCarga ? (
            <p role="alert" className="text-xs font-bold text-rose-700 dark:text-rose-400">
              No se pudieron cargar tus solicitudes. Revisa tu conexión e inténtalo de nuevo.
            </p>
          ) : lista.length === 0 ? (
            <p className="text-xs text-[var(--text-subtle)]">Aún no has enviado ninguna solicitud.</p>
          ) : (
            <ul className="space-y-3">
              {lista.map((s) => (
                <li key={s.id} className="rounded-2xl p-4 bg-[var(--surface)] border border-[var(--border)] shadow-[var(--shadow-sm)] space-y-2">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-bold text-[var(--text)]">{etiquetaTipoArco(s.tipo)}</p>
                      <p className="text-[11px] text-[var(--text-subtle)]">{fechaLarga(s.creado_en)}</p>
                    </div>
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border shrink-0 ${COLOR_ESTADO_ARCO[s.estado] ?? COLOR_ESTADO_ARCO.recibida}`}>
                      {etiquetaEstadoArco(s.estado)}
                    </span>
                  </div>
                  <p className="text-sm text-[var(--text)] whitespace-pre-wrap">{s.descripcion}</p>
                  {s.respuesta?.trim() && (
                    <div className="rounded-xl p-3 bg-[var(--surface-raised)] border border-[var(--border-subtle)]">
                      <p className="text-xs font-bold text-[var(--text)]">Respuesta de tu nutriólogo</p>
                      <p className="text-sm text-[var(--text-muted)] whitespace-pre-wrap">{s.respuesta}</p>
                    </div>
                  )}
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}
