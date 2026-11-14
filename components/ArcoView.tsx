'use client';

import React, { useEffect, useState } from 'react';
import { ShieldCheck, RefreshCw } from 'lucide-react';
import {
  arcoAbierta,
  etiquetaEstadoArco,
  COLOR_ESTADO_ARCO,
  etiquetaTipoArco,
  type SolicitudArco,
} from '@/lib/arco';


const fecha = (iso: string) =>
  new Date(iso).toLocaleDateString('es-MX', { day: 'numeric', month: 'short', year: 'numeric' });

/** Pestaña "Derechos ARCO" del panel: lista las solicitudes de sus pacientes y permite responderlas. */
export const ArcoView: React.FC = () => {
  const [lista, setLista] = useState<SolicitudArco[]>([]);
  const [cargando, setCargando] = useState(true);
  const [errorCarga, setErrorCarga] = useState<string | null>(null);
  const [filtro, setFiltro] = useState<'abiertas' | 'todas'>('abiertas');
  const [respuestas, setRespuestas] = useState<Record<string, string>>({});
  const [guardando, setGuardando] = useState<string | null>(null);
  const [errorFila, setErrorFila] = useState<Record<string, string>>({});

  // Cambiar `version` vuelve a pedir la lista (botón Actualizar).
  const [version, setVersion] = useState(0);

  useEffect(() => {
    let vigente = true;
    (async () => {
      try {
        const res = await fetch('/api/nutriologo/arco', { cache: 'no-store' });
        const j = await res.json();
        if (!res.ok || !j.success) throw new Error(j.error ?? 'Error');
        if (!vigente) return;
        setLista(j.data as SolicitudArco[]);
        setErrorCarga(null);
      } catch {
        if (vigente) setErrorCarga('No se pudieron cargar las solicitudes. Inténtalo de nuevo.');
      } finally {
        if (vigente) setCargando(false);
      }
    })();
    return () => {
      vigente = false;
    };
  }, [version]);

  const actualizar = () => {
    setCargando(true);
    setVersion((v) => v + 1);
  };

  const responder = async (s: SolicitudArco, estado: 'en_proceso' | 'atendida' | 'rechazada') => {
    setGuardando(s.id);
    setErrorFila((e) => ({ ...e, [s.id]: '' }));
    try {
      const res = await fetch('/api/nutriologo/arco', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: s.id, estado, respuesta: respuestas[s.id] ?? s.respuesta ?? '' }),
      });
      const j = await res.json();
      if (!res.ok || !j.success) {
        setErrorFila((e) => ({ ...e, [s.id]: j.error ?? 'No se pudo guardar.' }));
        return;
      }
      setLista((l) => l.map((x) => (x.id === s.id ? { ...x, ...j.data, paciente_nombre: x.paciente_nombre } : x)));
    } catch {
      setErrorFila((e) => ({ ...e, [s.id]: 'No se pudo guardar. Revisa tu conexión.' }));
    } finally {
      setGuardando(null);
    }
  };

  const visibles = lista.filter((s) => filtro === 'todas' || arcoAbierta(s.estado));
  const abiertas = lista.filter((s) => arcoAbierta(s.estado)).length;

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-[var(--surface)] border border-[var(--border)] rounded-xl shadow-sm select-text">
      <div className="p-4 border-b border-[var(--border)] flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-emerald-600" />
          <div>
            <h3 className="font-bold text-sm text-[var(--text)]">Solicitudes de derechos ARCO</h3>
            <p className="text-[11px] text-[var(--text-subtle)]">
              Debes responder dentro del plazo que marca la LFPDPPP. {abiertas} abierta{abiertas === 1 ? '' : 's'}.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {(['abiertas', 'todas'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFiltro(f)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold border ${
                filtro === f ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-[var(--surface)] text-[var(--text-muted)] border-[var(--border)] hover:bg-[var(--surface-hover)]'
              }`}
            >
              {f === 'abiertas' ? 'Abiertas' : 'Todas'}
            </button>
          ))}
          <button
            onClick={actualizar}
            aria-label="Actualizar"
            className="p-1.5 rounded-lg border border-[var(--border)] text-[var(--text-muted)] hover:bg-[var(--surface-hover)]"
          >
            <RefreshCw className={`w-4 h-4 ${cargando ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {errorCarga ? (
          <p role="alert" className="text-xs font-bold text-rose-700 dark:text-rose-400">
            {errorCarga}
          </p>
        ) : cargando && lista.length === 0 ? (
          <p className="text-xs text-[var(--text-subtle)]">Cargando…</p>
        ) : visibles.length === 0 ? (
          <p className="text-xs text-[var(--text-subtle)]">
            {filtro === 'abiertas' ? 'No tienes solicitudes abiertas.' : 'Tus pacientes aún no han enviado solicitudes.'}
          </p>
        ) : (
          visibles.map((s) => {
            const abierta = arcoAbierta(s.estado);
            return (
              <article key={s.id} className="rounded-xl border border-[var(--border)] p-4 space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-bold text-[var(--text)]">
                      {etiquetaTipoArco(s.tipo)} · {s.paciente_nombre}
                    </p>
                    <p className="text-[11px] text-[var(--text-subtle)]">Recibida el {fecha(s.creado_en)}</p>
                  </div>
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${COLOR_ESTADO_ARCO[s.estado] ?? COLOR_ESTADO_ARCO.recibida}`}>
                    {etiquetaEstadoArco(s.estado)}
                  </span>
                </div>
                <p className="text-sm text-[var(--text)] whitespace-pre-wrap">{s.descripcion}</p>

                {abierta ? (
                  <div className="space-y-2">
                    <label htmlFor={`resp-${s.id}`} className="text-xs font-bold text-[var(--text)]">
                      Respuesta para el paciente
                    </label>
                    <textarea
                      id={`resp-${s.id}`}
                      rows={3}
                      maxLength={2000}
                      value={respuestas[s.id] ?? s.respuesta ?? ''}
                      onChange={(e) => setRespuestas((r) => ({ ...r, [s.id]: e.target.value }))}
                      className="w-full rounded-lg border border-[var(--border)] bg-[var(--surface-raised)] p-2 text-sm text-[var(--text)] focus-visible:outline-2 focus-visible:outline-emerald-500"
                    />
                    {errorFila[s.id] && (
                      <p role="alert" className="text-xs font-bold text-rose-700 dark:text-rose-400">
                        {errorFila[s.id]}
                      </p>
                    )}
                    <div className="flex flex-wrap gap-2">
                      {s.estado === 'recibida' && (
                        <button
                          disabled={guardando === s.id}
                          onClick={() => responder(s, 'en_proceso')}
                          className="px-3 py-2 rounded-lg text-xs font-bold border border-blue-200 text-blue-700 hover:bg-blue-50 disabled:opacity-60"
                        >
                          Marcar en proceso
                        </button>
                      )}
                      <button
                        disabled={guardando === s.id}
                        onClick={() => responder(s, 'atendida')}
                        className="px-3 py-2 rounded-lg text-xs font-bold bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-60"
                      >
                        Responder y marcar atendida
                      </button>
                      <button
                        disabled={guardando === s.id}
                        onClick={() => responder(s, 'rechazada')}
                        className="px-3 py-2 rounded-lg text-xs font-bold border border-rose-200 text-rose-700 dark:text-rose-400 hover:bg-rose-50 disabled:opacity-60"
                      >
                        Rechazar con motivo
                      </button>
                    </div>
                  </div>
                ) : (
                  s.respuesta?.trim() && (
                    <div className="rounded-lg bg-[var(--surface-raised)] border border-[var(--border)] p-3">
                      <p className="text-xs font-bold text-[var(--text)]">Tu respuesta</p>
                      <p className="text-sm text-[var(--text-muted)] whitespace-pre-wrap">{s.respuesta}</p>
                    </div>
                  )
                )}
              </article>
            );
          })
        )}
      </div>
    </div>
  );
};
