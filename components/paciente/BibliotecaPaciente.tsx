'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { BookOpen, Clock, Search, X, Quote, ChevronRight } from 'lucide-react';
import { GUIAS_BASE, type ArticuloBiblioteca } from '@/lib/guias-base';

export function BibliotecaPaciente() {
  const [lista, setLista] = useState<ArticuloBiblioteca[]>(GUIAS_BASE);
  const [cargando, setCargando] = useState(true);
  const [sinConexion, setSinConexion] = useState(false);
  const [q, setQ] = useState('');
  const [cat, setCat] = useState('Todas');
  const [abierto, setAbierto] = useState<ArticuloBiblioteca | null>(null);
  const botonCerrar = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    let vivo = true;
    (async () => {
      try {
        const res = await fetch('/api/paciente/biblioteca');
        const j = await res.json();
        if (!res.ok || !j.success) throw new Error(j.error || 'Error');
        if (vivo) setLista(j.data as ArticuloBiblioteca[]);
      } catch {
        // Sin internet o sin la tabla: quedan las guías base de la app.
        if (vivo) setSinConexion(true);
      } finally {
        if (vivo) setCargando(false);
      }
    })();
    return () => {
      vivo = false;
    };
  }, []);

  // Escape cierra el artículo y el foco pasa al botón de cerrar.
  useEffect(() => {
    if (!abierto) return;
    botonCerrar.current?.focus();
    const alTeclear = (e: KeyboardEvent) => e.key === 'Escape' && setAbierto(null);
    window.addEventListener('keydown', alTeclear);
    return () => window.removeEventListener('keydown', alTeclear);
  }, [abierto]);

  const categorias = useMemo(() => ['Todas', ...Array.from(new Set(lista.map((a) => a.categoria)))], [lista]);

  const filtrada = useMemo(() => {
    const t = q.trim().toLowerCase();
    return lista.filter(
      (a) =>
        (cat === 'Todas' || a.categoria === cat) &&
        (!t || a.titulo.toLowerCase().includes(t) || a.resumen.toLowerCase().includes(t) || a.cuerpo.toLowerCase().includes(t))
    );
  }, [lista, q, cat]);

  const etiquetaAutor = (a: ArticuloBiblioteca) =>
    !a.deNutriologo ? 'Guía base de NutriMasa' : a.autor ? `Por ${a.autor}` : 'Publicado por un nutriólogo';

  return (
    <div className="space-y-5">
      <div className="relative">
        <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-subtle)] pointer-events-none" />
        <input
          type="search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Buscar en la biblioteca"
          aria-label="Buscar en la biblioteca"
          className="w-full bg-[var(--surface)] border border-[var(--border)] rounded-2xl pl-10 pr-4 py-3 text-sm text-[var(--text)] placeholder-[var(--text-subtle)] focus:outline-none focus:border-[var(--primary)] min-h-[44px]"
        />
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1" role="group" aria-label="Filtrar por categoría">
        {categorias.map((c) => (
          <button
            key={c}
            onClick={() => setCat(c)}
            aria-pressed={cat === c}
            className={`px-3.5 py-2 rounded-full text-xs font-bold whitespace-nowrap border min-h-[36px] cursor-pointer transition-colors ${
              cat === c
                ? 'bg-emerald-600 border-emerald-600 text-white'
                : 'bg-[var(--surface)] border-[var(--border)] text-[var(--text-muted)] hover:border-[var(--primary)]'
            }`}
          >
            {c}
          </button>
        ))}
      </div>

      {sinConexion && (
        <p role="status" className="text-xs text-[var(--text-subtle)]">
          No se pudieron traer los artículos de los nutriólogos. Se muestran las guías base.
        </p>
      )}

      {cargando && lista.length === 0 ? (
        <p className="text-xs text-[var(--text-subtle)]">Cargando biblioteca…</p>
      ) : filtrada.length === 0 ? (
        <p className="text-sm text-[var(--text-subtle)] py-8 text-center">No encontramos nada con esa búsqueda.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtrada.map((a) => (
            <button
              key={`${a.id ?? 'base'}-${a.titulo}`}
              onClick={() => setAbierto(a)}
              className="p-5 rounded-2xl bg-[var(--surface)] hover:bg-[var(--surface-hover)] border border-[var(--border)] hover:border-[var(--primary)] text-left transition-all flex flex-col justify-between gap-3 cursor-pointer focus-visible:outline-2 focus-visible:outline-emerald-500"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[var(--primary-surface)] text-[var(--primary-text)] border border-[var(--primary-border)]">
                    {a.categoria}
                  </span>
                  <span className="flex items-center gap-1 text-[10px] text-[var(--text-subtle)] shrink-0">
                    <Clock className="w-3 h-3" />
                    {a.minutos} min
                  </span>
                </div>
                <h3 className="text-sm font-bold text-[var(--text)] leading-snug">{a.titulo}</h3>
                <p className="text-xs text-[var(--text-muted)] leading-relaxed line-clamp-2">{a.resumen}</p>
              </div>
              <div className="flex items-center justify-between text-[11px] text-[var(--text-subtle)] pt-2 border-t border-[var(--border-subtle)]">
                <span>{etiquetaAutor(a)}</span>
                <span className="flex items-center gap-1 text-[var(--primary)] font-bold">
                  Leer <ChevronRight className="w-3 h-3" />
                </span>
              </div>
            </button>
          ))}
        </div>
      )}

      <p className="text-[11px] text-[var(--text-subtle)] leading-relaxed flex items-start gap-2">
        <BookOpen className="w-3.5 h-3.5 shrink-0 mt-0.5" />
        Material informativo con referencias científicas. No sustituye una consulta con tu nutriólogo ni con un profesional de la salud.
      </p>

      {abierto && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={abierto.titulo}
          onClick={() => setAbierto(null)}
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-xl bg-[var(--surface)] rounded-3xl p-6 sm:p-8 shadow-2xl border border-[var(--border)] max-h-[88vh] overflow-y-auto space-y-4"
          >
            <div className="flex items-center justify-between gap-3">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[var(--primary-surface)] text-[var(--primary-text)] border border-[var(--primary-border)]">
                {abierto.categoria}
              </span>
              <button
                ref={botonCerrar}
                onClick={() => setAbierto(null)}
                aria-label="Cerrar"
                className="w-10 h-10 rounded-xl hover:bg-[var(--surface-hover)] text-[var(--text-subtle)] flex items-center justify-center cursor-pointer focus-visible:outline-2 focus-visible:outline-emerald-500"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <h3 className="text-lg sm:text-xl font-black text-[var(--text)] leading-snug">{abierto.titulo}</h3>
            <p className="text-xs text-[var(--text-subtle)] font-medium">
              {etiquetaAutor(abierto)} · {abierto.minutos} min de lectura
            </p>
            <div className="text-sm text-[var(--text-muted)] leading-relaxed space-y-3 pt-3 border-t border-[var(--border)]">
              {abierto.cuerpo.split(/\n{2,}/).map((p, i) => (
                <p key={i} className="whitespace-pre-line">
                  {p}
                </p>
              ))}
            </div>
            {abierto.citas && (
              <div className="p-4 rounded-2xl bg-[var(--surface-raised)] border border-[var(--border-subtle)] text-xs text-[var(--text)] flex items-start gap-2">
                <Quote className="w-4 h-4 text-[var(--primary)] shrink-0 mt-0.5" />
                <div>
                  <strong className="block font-bold mb-1">Fuentes</strong>
                  <span className="italic opacity-90">{abierto.citas}</span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
