'use client';

import React, { useEffect, useState } from 'react';
import { Lightbulb, Sparkles } from 'lucide-react';

interface Consejo {
  tema: string;
  texto: string;
  deIA: boolean;
}

const CLAVE = 'consejo_ia_web_v1';
const MAX_INTENTOS = 2;

const diaLocal = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

// Guardado en el navegador: la IA se pide 1 vez al día y, si falla, como máximo 2 intentos al día.
function leer(): { dia?: string; consejo?: Consejo; intentos?: number } {
  try {
    return JSON.parse(localStorage.getItem(CLAVE) ?? '{}');
  } catch {
    return {};
  }
}
function guardar(v: object) {
  try {
    localStorage.setItem(CLAVE, JSON.stringify(v));
  } catch {
    /* sin almacenamiento: se pide sin guardar */
  }
}

export function ConsejoDelDia() {
  const [consejo, setConsejo] = useState<Consejo | null>(null);

  useEffect(() => {
    let vivo = true;
    const hoy = diaLocal();
    const g = leer();
    const mismoDia = g.dia === hoy;
    if (mismoDia && g.consejo?.deIA) {
      setConsejo(g.consejo);
      return;
    }
    const intentos = mismoDia ? g.intentos ?? 0 : 0;
    if (mismoDia && g.consejo && intentos >= MAX_INTENTOS) {
      setConsejo(g.consejo);
      return;
    }
    (async () => {
      try {
        const res = await fetch(`/api/paciente/consejo?dia=${hoy}`);
        const j = await res.json();
        if (!j.success) throw new Error('sin consejo');
        const c = j.data as Consejo;
        guardar({ dia: hoy, consejo: c, intentos: c.deIA ? intentos : intentos + 1 });
        if (vivo) setConsejo(c);
      } catch {
        if (vivo) setConsejo(null);
      }
    })();
    return () => {
      vivo = false;
    };
  }, []);

  if (!consejo) return null;

  return (
    <section
      aria-label="Consejo del día"
      className="rounded-3xl p-5 sm:p-6 bg-[var(--surface)] border border-[var(--border)] shadow-[var(--shadow-sm)] flex items-start gap-4"
    >
      <div className="w-10 h-10 rounded-2xl bg-[var(--primary-surface)] border border-[var(--primary-border)] text-[var(--primary-text)] flex items-center justify-center shrink-0">
        <Lightbulb className="w-5 h-5" />
      </div>
      <div className="min-w-0 space-y-1">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--primary-text)]">
            Consejo del día · {consejo.tema}
          </span>
          {consejo.deIA && (
            <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-[var(--primary-surface)] border border-[var(--primary-border)] text-[var(--primary-text)]">
              <Sparkles className="w-3 h-3" />
              Escrito con IA
            </span>
          )}
        </div>
        <p className="text-sm font-medium leading-relaxed">{consejo.texto}</p>
        {consejo.deIA && (
          <p className="text-[11px] opacity-70">Orientación general, no sustituye a tu nutriólogo.</p>
        )}
      </div>
    </section>
  );
}
