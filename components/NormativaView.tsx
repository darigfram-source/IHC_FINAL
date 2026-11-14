'use client';

import React from 'react';
import { CheckCircle2, ClipboardCheck, Scale } from 'lucide-react';
import { LISTA_VERIFICACION_PROFESIONAL, NORMATIVA_AVISO, NORMATIVA_PROFESIONAL } from '@/lib/normativa';

/** Pestaña "Normativa del profesional" del panel. */
export const NormativaView: React.FC = () => (
  <div className="flex-1 overflow-y-auto select-text">
    <div className="max-w-3xl mx-auto space-y-4 pb-6">
      <p className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs leading-relaxed flex items-start gap-2">
        <Scale className="w-4 h-4 shrink-0 mt-0.5" />
        {NORMATIVA_AVISO}
      </p>

      {NORMATIVA_PROFESIONAL.map((s) => (
        <details key={s.titulo} className="group bg-white border border-slate-200 rounded-xl shadow-sm">
          <summary className="cursor-pointer list-none p-4 flex flex-col gap-0.5 focus-visible:outline-2 focus-visible:outline-emerald-500 rounded-xl">
            <span className="text-sm font-extrabold text-slate-800 group-open:text-emerald-800">{s.titulo}</span>
            <span className="text-xs text-slate-500">{s.resumen}</span>
          </summary>
          <div className="px-4 pb-4 space-y-2">
            <ul className="space-y-2">
              {s.puntos.map((p) => (
                <li key={p} className="flex items-start gap-2.5 text-[13px] leading-relaxed text-slate-700">
                  <span aria-hidden className="mt-2 w-1.5 h-1.5 rounded-full bg-emerald-600 shrink-0" />
                  {p}
                </li>
              ))}
            </ul>
            <p className="text-[11.5px] italic text-slate-500 pt-1">Fuente: {s.fuente}</p>
          </div>
        </details>
      ))}

      <section className="bg-white border border-slate-200 rounded-xl shadow-sm p-4">
        <h3 className="text-sm font-extrabold text-slate-800 flex items-center gap-2 mb-3">
          <ClipboardCheck className="w-5 h-5 text-emerald-600" />
          Lista de verificación
        </h3>
        <ul className="space-y-2">
          {LISTA_VERIFICACION_PROFESIONAL.map((v) => (
            <li key={v} className="flex items-start gap-2 text-[13px] leading-snug text-slate-700">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              {v}
            </li>
          ))}
        </ul>
      </section>
    </div>
  </div>
);
