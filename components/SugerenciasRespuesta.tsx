'use client';

import React, { useRef, useState } from 'react';
import { Sparkles, RefreshCw, Loader2, ChevronDown } from 'lucide-react';

interface Props {
  usuarioId: string;
  /** Pone el borrador en la caja de texto del chat. NO lo envía. */
  onUsar: (texto: string) => void;
}

/** Borradores de respuesta para el paciente. Se piden con el botón, se pueden regenerar y, al elegir uno,
 *  pasan a la caja de texto para que el nutriólogo lo revise y lo edite. Nunca se mandan solos.
 *  El chat lo monta con key={usuarioId}, así al cambiar de paciente se limpia todo. */
export const SugerenciasRespuesta: React.FC<Props> = ({ usuarioId, onUsar }) => {
  const [abierto, setAbierto] = useState(false);
  const [textos, setTextos] = useState<string[]>([]);
  const [deIA, setDeIA] = useState(false);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const vistas = useRef<string[]>([]); // todo lo ya mostrado a este paciente: "Generar otras" no lo repite

  const pedir = async () => {
    setCargando(true);
    setError(null);
    try {
      const res = await fetch('/api/nutriologo/sugerencias', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ usuario_id: usuarioId, anteriores: vistas.current.slice(-9) }),
      });
      const j = await res.json().catch(() => ({}));
      if (!res.ok || !j.success) {
        setError((j.error as string) || 'No se pudieron generar los borradores.');
        return;
      }
      const lista: string[] = j.data.sugerencias ?? [];
      vistas.current = [...vistas.current, ...lista];
      setTextos(lista);
      setDeIA(j.data.deIA === true);
    } catch {
      setError('No se pudo conectar. Revisa tu internet.');
    } finally {
      setCargando(false);
    }
  };

  const abrir = () => {
    setAbierto(true);
    if (!textos.length && !cargando) void pedir();
  };

  if (!abierto) {
    return (
      <div className="px-3 py-2 bg-white border-t border-slate-200">
        <button
          type="button"
          onClick={abrir}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-violet-50 text-violet-700 hover:bg-violet-100 border border-violet-200 rounded-lg transition-colors"
        >
          <Sparkles className="w-3.5 h-3.5" />
          Sugerir respuestas
        </button>
      </div>
    );
  }

  return (
    <div className="bg-violet-50/60 border-t border-violet-200 px-3 py-2.5 space-y-2">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <Sparkles className="w-3.5 h-3.5 text-violet-600 shrink-0" />
          <span className="text-[11px] font-bold uppercase tracking-wider text-violet-700">Borradores de respuesta</span>
          {textos.length > 0 && (
            <span
              className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${
                deIA ? 'bg-violet-200 text-violet-800' : 'bg-slate-200 text-slate-700'
              }`}
            >
              {deIA ? 'Con IA' : 'Automáticos'}
            </span>
          )}
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            type="button"
            onClick={() => void pedir()}
            disabled={cargando}
            className="flex items-center gap-1 px-2 py-1 text-[11px] font-semibold bg-white hover:bg-violet-100 disabled:opacity-50 text-violet-700 border border-violet-200 rounded-md transition-colors"
          >
            {cargando ? <Loader2 className="w-3 h-3 animate-spin" /> : <RefreshCw className="w-3 h-3" />}
            Generar otras
          </button>
          <button
            type="button"
            onClick={() => setAbierto(false)}
            aria-label="Ocultar borradores"
            className="p-1 text-violet-700 hover:bg-violet-100 rounded-md"
          >
            <ChevronDown className="w-4 h-4" />
          </button>
        </div>
      </div>

      {cargando && !textos.length && (
        <p className="text-xs text-slate-500 flex items-center gap-2">
          <Loader2 className="w-3.5 h-3.5 animate-spin" /> Redactando borradores…
        </p>
      )}

      {error && (
        <p role="alert" className="text-xs font-semibold text-rose-700">
          {error}
        </p>
      )}

      {textos.length > 0 && (
        <ul className={`grid gap-2 md:grid-cols-3 ${cargando ? 'opacity-60' : ''}`}>
          {textos.map((t, i) => (
            <li key={`${i}-${t.slice(0, 20)}`} className="bg-white border border-slate-200 rounded-lg p-2.5 flex flex-col gap-2">
              <p className="text-xs text-slate-800 leading-relaxed whitespace-pre-wrap flex-1">{t}</p>
              <button
                type="button"
                onClick={() => onUsar(t)}
                className="self-start px-2.5 py-1 text-[11px] font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-md transition-colors"
              >
                Usar este borrador
              </button>
            </li>
          ))}
        </ul>
      )}

      <p className="text-[10px] text-slate-500">
        Son solo borradores: no se envían solos. Revísalos y edítalos antes de mandarlos; tú eres quien responde al paciente.
        {deIA ? ' Escritos con IA a partir de sus registros y su conversación reciente.' : ''}
      </p>
    </div>
  );
};
