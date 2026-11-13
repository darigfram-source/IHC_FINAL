'use client';

import React, { useEffect, useState } from 'react';
import { dentroDeVentana, VENTANA_MENSAJE_MS } from '@/lib/chat-reglas';

/** Reloj que se actualiza cada 20 s, para que los botones desaparezcan al pasar los 5 minutos.
 *  Empieza en 0 (sin hora) y se llena ya en el navegador, para no leer la hora al pre-renderizar. */
export function useAhora(): number {
  const [ahora, setAhora] = useState(0);
  useEffect(() => {
    const inicio = setTimeout(() => setAhora(Date.now()), 0);
    const t = setInterval(() => setAhora(Date.now()), 20_000);
    return () => {
      clearTimeout(inicio);
      clearInterval(t);
    };
  }, []);
  return ahora;
}

/** Minutos que le quedan (redondeado hacia arriba) para modificar el mensaje. */
export function minutosRestantes(creadoIso: string, ahoraMs: number): number {
  return Math.max(1, Math.ceil((new Date(creadoIso).getTime() + VENTANA_MENSAJE_MS - ahoraMs) / 60_000));
}

interface AccionesProps {
  creadoIso?: string | null;
  ahoraMs: number;
  onEditar: () => void;
  onEliminar: () => void;
  /** Clases del texto de los botones (depende del color de la burbuja). */
  clase?: string;
}

/** Botones "Editar" y "Eliminar": solo aparecen durante los primeros 5 minutos. */
export function AccionesMensaje({ creadoIso, ahoraMs, onEditar, onEliminar, clase = '' }: AccionesProps) {
  if (!creadoIso || ahoraMs === 0 || !dentroDeVentana(creadoIso, ahoraMs)) return null;
  const base = `underline underline-offset-2 font-bold cursor-pointer min-h-[24px] ${clase}`;
  return (
    <span className="inline-flex items-center gap-2" title={`Puedes modificarlo ${minutosRestantes(creadoIso, ahoraMs)} min más`}>
      <button type="button" onClick={onEditar} className={base}>
        Editar
      </button>
      <button type="button" onClick={onEliminar} className={base}>
        Eliminar
      </button>
    </span>
  );
}

interface EditorProps {
  inicial: string;
  onGuardar: (texto: string) => void;
  onCancelar: () => void;
  guardando?: boolean;
}

/** Cuadro para editar el texto de un mensaje propio. */
export function EditorMensaje({ inicial, onGuardar, onCancelar, guardando }: EditorProps) {
  const [texto, setTexto] = useState(inicial);
  const valido = texto.trim().length > 0 && texto.trim() !== inicial.trim();
  return (
    <div className="space-y-2">
      <textarea
        value={texto}
        maxLength={2000}
        rows={3}
        autoFocus
        onChange={(e) => setTexto(e.target.value)}
        aria-label="Editar mensaje"
        className="w-full rounded-xl px-3 py-2 text-xs sm:text-sm text-slate-900 bg-white border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
      />
      <div className="flex items-center justify-end gap-2 text-xs">
        <button
          type="button"
          onClick={onCancelar}
          disabled={guardando}
          className="px-3 py-1.5 rounded-lg bg-white/20 hover:bg-white/30 font-bold min-h-[32px] cursor-pointer"
        >
          Cancelar
        </button>
        <button
          type="button"
          onClick={() => onGuardar(texto.trim())}
          disabled={!valido || guardando}
          className="px-3 py-1.5 rounded-lg bg-white text-emerald-800 hover:bg-emerald-50 disabled:opacity-50 font-bold min-h-[32px] cursor-pointer"
        >
          {guardando ? 'Guardando…' : 'Guardar'}
        </button>
      </div>
    </div>
  );
}
