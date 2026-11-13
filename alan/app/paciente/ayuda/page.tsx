'use client';

import React from 'react';
import Link from 'next/link';
import { ChevronDown, ShieldCheck } from 'lucide-react';
import { PacienteTopBar } from '@/components/paciente/PacienteNavigation';
import { PREGUNTAS_FRECUENTES } from '@/lib/ayuda';

export default function AyudaPage() {
  return (
    <div className="w-full min-h-full">
      <PacienteTopBar titulo="Ayuda" subtitulo="Preguntas frecuentes" badge="Ayuda" />

      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-3">
        {PREGUNTAS_FRECUENTES.map((p) => (
          <details
            key={p.pregunta}
            className="group rounded-2xl bg-[var(--surface)] border border-[var(--border)] shadow-[var(--shadow-sm)] overflow-hidden"
          >
            <summary className="flex items-center justify-between gap-3 px-4 sm:px-5 min-h-[56px] py-3 cursor-pointer list-none text-sm font-bold text-[var(--text)] focus-visible:outline-2 focus-visible:outline-emerald-500 [&::-webkit-details-marker]:hidden">
              <span>{p.pregunta}</span>
              <ChevronDown className="w-4 h-4 shrink-0 text-[var(--primary)] transition-transform group-open:rotate-180" aria-hidden="true" />
            </summary>
            <p className="px-4 sm:px-5 pb-4 text-sm text-[var(--text-muted)] leading-relaxed">{p.respuesta}</p>
          </details>
        ))}

        <Link
          href="/paciente/arco"
          className="mt-2 flex items-center gap-3 p-4 rounded-2xl bg-[var(--surface-raised)] border border-[var(--border-subtle)] text-xs text-[var(--text-muted)] hover:border-[var(--primary)] transition-colors"
        >
          <ShieldCheck className="w-4 h-4 text-[var(--primary)] shrink-0" />
          <span>¿Quieres acceder, corregir o cancelar tus datos? Ejerce tus derechos ARCO.</span>
        </Link>
      </div>
    </div>
  );
}
