'use client';

import React, { useEffect, useState } from 'react';
import { Flag, Info, Save, AlertTriangle } from 'lucide-react';
import { PacienteTopBar } from '@/components/paciente/PacienteNavigation';
import { cargarPerfil, descartarPendiente, encolar, fetchConTiempo, propietarioLocal } from '@/lib/offline';
import { META_MIN_KG, META_MAX_KG, avanceHaciaMeta, avisoDeMeta, leerMeta, n1, textoFalta } from '@/lib/metas';

interface Datos {
  pesoActual: number;
  pesoInicial: number | null;
  meta: number;
}

export default function MetasPage() {
  const [datos, setDatos] = useState<Datos | null>(null);
  const [errorCarga, setErrorCarga] = useState(false);
  const [texto, setTexto] = useState('');
  const [guardando, setGuardando] = useState(false);
  const [mensaje, setMensaje] = useState<{ ok: boolean; texto: string } | null>(null);

  useEffect(() => {
    let vigente = true;
    (async () => {
      // Con internet trae lo último; sin internet usa la copia guardada (con la meta pendiente ya aplicada).
      const r = await cargarPerfil();
      if (!vigente) return;
      if (r.estado !== 'ok') {
        setErrorCarga(true);
        return;
      }
      const regs = Array.isArray(r.perfil.registros) ? r.perfil.registros : [];
      const pesos = regs.map((x) => Number(x.peso_ayunas)).filter((p) => Number.isFinite(p) && p > 0);
      // Igual que la app: el peso de hoy es el del último registro y el inicial el del primero.
      const d: Datos = {
        pesoActual: pesos.length ? pesos[pesos.length - 1] : Number(r.perfil.peso_actual),
        pesoInicial: pesos.length ? pesos[0] : null,
        meta: Number(r.perfil.peso_objetivo),
      };
      setDatos(d);
      setTexto(n1(d.meta));
    })();
    return () => {
      vigente = false;
    };
  }, []);

  const nueva = leerMeta(texto);
  const cambio = datos !== null && nueva !== null && Math.abs(nueva - datos.meta) > 0.001;
  const aviso = datos && nueva !== null ? avisoDeMeta(datos.pesoActual, nueva) : null;
  const avance = datos ? avanceHaciaMeta({ pesoInicial: datos.pesoInicial, pesoActual: datos.pesoActual, meta: datos.meta }) : null;

  const guardar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!datos || nueva === null) return;
    setGuardando(true);
    setMensaje(null);
    // Sin internet (o servidor caído) la meta se guarda en el dispositivo, igual que en la app, y se sube después.
    const guardarEnDispositivo = (): boolean => {
      const dueno = propietarioLocal();
      if (!dueno || !encolar({ tipo: 'meta', owner: dueno, valor: nueva })) return false;
      setDatos({ ...datos, meta: nueva });
      setTexto(n1(nueva));
      setMensaje({ ok: true, texto: 'Meta guardada en este dispositivo. Se subirá cuando haya internet.' });
      return true;
    };
    try {
      const res = await fetchConTiempo('/api/paciente/meta', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ peso_objetivo: nueva }),
      });
      const j = await res.json().catch(() => ({}));
      if (res.ok && j.success) {
        const dueno = propietarioLocal();
        if (dueno) descartarPendiente(dueno, 'meta'); // una meta pendiente más vieja pisaría esta
        const guardada = Number(j.data?.peso_objetivo ?? nueva);
        setDatos({ ...datos, meta: guardada });
        setTexto(n1(guardada));
        setMensaje({ ok: true, texto: 'Meta guardada.' });
        return;
      }
      if (res.status >= 500 || res.status === 401 || res.status === 403) {
        if (!guardarEnDispositivo()) setMensaje({ ok: false, texto: (j.error as string) || 'No se pudo guardar la meta.' });
        return;
      }
      setMensaje({ ok: false, texto: (j.error as string) || 'No se pudo guardar la meta.' });
    } catch {
      if (!guardarEnDispositivo()) setMensaje({ ok: false, texto: 'No se pudo guardar sin internet. Conéctate para cambiar tu meta.' });
    } finally {
      setGuardando(false);
    }
  };

  return (
    <div className="w-full min-h-full">
      <PacienteTopBar titulo="Metas" subtitulo="Tu peso objetivo y tu avance" badge="Metas" />

      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {errorCarga && (
          <p role="alert" className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/60 text-xs font-bold text-rose-700 dark:text-rose-400">
            No se pudieron cargar tus datos. Recarga la página.
          </p>
        )}

        {!datos && !errorCarga && (
          <div className="h-40 rounded-3xl bg-slate-200 dark:bg-slate-800/60 animate-pulse" aria-label="Cargando" />
        )}

        {datos && (
          <>
            <section
              aria-label="Avance hacia tu meta"
              className="rounded-3xl p-5 sm:p-6 bg-[var(--surface)] border border-[var(--border)] shadow-[var(--shadow-sm)] space-y-4"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-[var(--primary-surface)] text-[var(--primary)] flex items-center justify-center">
                  <Flag className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-[var(--text)]">Meta fijada: {n1(datos.meta)} kg</h3>
                  <p className="text-xs text-[var(--text-subtle)]">{textoFalta(datos.pesoActual, datos.meta)}</p>
                </div>
              </div>

              {avance && (
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs font-semibold text-[var(--text-muted)]">
                    <span>Avance hacia tu meta</span>
                    <span className="font-bold text-[var(--text)]">{avance.pct}%</span>
                  </div>
                  <div
                    role="progressbar"
                    aria-valuenow={avance.pct}
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-label="Avance hacia tu meta de peso"
                    className="w-full h-3 rounded-full bg-[var(--surface-active)] overflow-hidden"
                  >
                    <div
                      className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full transition-all duration-500"
                      style={{ width: `${avance.pct}%` }}
                    />
                  </div>
                  <p className="text-xs text-[var(--text-muted)]">{avance.mensaje}</p>
                </div>
              )}
            </section>

            <form
              onSubmit={guardar}
              aria-label="Cambiar peso objetivo"
              className="rounded-3xl p-5 sm:p-6 bg-[var(--surface)] border border-[var(--border)] shadow-[var(--shadow-sm)] space-y-4"
            >
              <div>
                <label htmlFor="meta-peso" className="block text-sm font-bold text-[var(--text)] mb-1.5">
                  Peso objetivo (kg)
                </label>
                <input
                  id="meta-peso"
                  type="text"
                  inputMode="decimal"
                  value={texto}
                  onChange={(e) => {
                    setTexto(e.target.value);
                    setMensaje(null);
                  }}
                  aria-invalid={texto.trim() !== '' && nueva === null}
                  aria-describedby="meta-ayuda"
                  className="w-full px-3 py-2.5 rounded-xl bg-[var(--surface-raised)] border border-[var(--border)] text-base font-bold text-[var(--text)] min-h-[44px] focus-visible:outline-2 focus-visible:outline-emerald-500"
                />
                <p id="meta-ayuda" className={`mt-1.5 text-xs ${texto.trim() !== '' && nueva === null ? 'text-rose-600 font-bold' : 'text-[var(--text-subtle)]'}`}>
                  Un valor entre {META_MIN_KG} y {META_MAX_KG} kg.
                </p>
              </div>

              {aviso && (
                <p className="p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/60 text-xs text-amber-900 dark:text-amber-200 flex items-start gap-2.5">
                  <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{aviso}</span>
                </p>
              )}

              <button
                type="submit"
                disabled={!cambio || guardando}
                className="w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer min-h-[44px] focus-visible:outline-2 focus-visible:outline-emerald-500"
              >
                <Save className="w-4 h-4" />
                {guardando ? 'Guardando…' : 'Guardar meta'}
              </button>

              {mensaje && (
                <p role={mensaje.ok ? 'status' : 'alert'} className={`text-xs font-bold ${mensaje.ok ? 'text-[var(--primary-text)]' : 'text-rose-600'}`}>
                  {mensaje.texto}
                </p>
              )}
            </form>

            <div className="p-4 rounded-2xl bg-[var(--surface-raised)] border border-[var(--border-subtle)] text-xs text-[var(--text-muted)] flex items-start gap-2.5">
              <Info className="w-4 h-4 text-[var(--primary)] shrink-0 mt-0.5" />
              <p className="leading-relaxed">
                Tu nutriólogo ve esta meta en tu expediente. Cambiarla no modifica tu proteína ni tu superávit: esos los define
                él según tu tendencia.
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
