'use client';

import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import Link from 'next/link';
import { Download, FileText, ArrowLeft, CalendarDays, Stethoscope } from 'lucide-react';
import { PacienteTopBar } from '@/components/paciente/PacienteNavigation';
import { cargarPerfil } from '@/lib/offline';
import { ReporteVistaImpresa } from '@/components/paciente/ReporteVistaImpresa';
import { resumenPropio, reporteClinicoVista, type ReporteVista } from '@/lib/reporte-paciente';
import type { Reporte } from '@/lib/types';

interface Perfil {
  nombre: string;
  peso_actual: number;
  superavit_kcal: number;
  registros: { fecha: string; peso_ayunas: number | null; sentadilla_kg: number | null; press_banca_kg: number | null; volumen_entrenamiento_kg?: number | null }[];
  reportes: Reporte[];
}

export default function PacienteReportesPage() {
  const [perfil, setPerfil] = useState<Perfil | null>(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(false);
  const [vista, setVista] = useState<ReporteVista | null>(null);

  useEffect(() => {
    (async () => {
      // Con internet trae lo último; sin internet usa la copia guardada (los reportes se calculan en el dispositivo).
      const r = await cargarPerfil();
      if (r.estado === 'ok') setPerfil(r.perfil as unknown as Perfil);
      else setError(true);
      setCargando(false);
    })();
  }, []);

  const verResumen = (tipo: 'semanal' | 'mensual') => {
    if (!perfil) return;
    setVista(resumenPropio(perfil.nombre, perfil.registros ?? [], tipo, perfil, new Date()));
  };

  // Imprime solo el reporte: el navegador ofrece "Guardar como PDF". El nombre del archivo sale del título.
  const descargarPDF = () => {
    if (!vista) return;
    const tituloAntes = document.title;
    const limpiar = () => {
      document.body.classList.remove('imprimiendo-reporte');
      document.title = tituloAntes;
      window.removeEventListener('afterprint', limpiar);
    };
    document.title = `${vista.titulo} - NutriMasa`;
    document.body.classList.add('imprimiendo-reporte');
    window.addEventListener('afterprint', limpiar);
    window.print();
  };

  const reportes = perfil?.reportes ?? [];

  return (
    <div className="w-full min-h-full">
      <PacienteTopBar titulo="Reportes y resúmenes" subtitulo="Tu progreso, listo para guardar en PDF" badge="Reportes" />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {cargando ? (
          <p className="text-xs text-[var(--text-subtle)]">Cargando…</p>
        ) : error || !perfil ? (
          <p role="alert" className="text-sm font-bold text-rose-700">
            No se pudieron cargar tus datos. Revisa tu conexión e inténtalo de nuevo.
          </p>
        ) : vista ? (
          <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <button
                onClick={() => setVista(null)}
                className="flex items-center gap-2 text-xs font-bold text-[var(--primary-text)] hover:underline min-h-[44px] cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                Volver a los reportes
              </button>
              <button
                onClick={descargarPDF}
                className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-2 min-h-[44px] cursor-pointer"
              >
                <Download className="w-4 h-4" />
                Descargar PDF
              </button>
            </div>
            <p className="text-[11px] text-[var(--text-subtle)]">
              Se abrirá la ventana de impresión: elige “Guardar como PDF” como destino.
            </p>
            <div className="rounded-2xl overflow-hidden border border-[var(--border)] shadow-[var(--shadow-sm)]">
              <ReporteVistaImpresa r={vista} />
            </div>
          </div>
        ) : (
          <>
            <section aria-label="Mi resumen" className="rounded-3xl p-5 sm:p-6 bg-[var(--surface)] border border-[var(--border)] shadow-[var(--shadow-sm)] space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-teal-500/15 text-teal-600 flex items-center justify-center">
                  <CalendarDays className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-sm sm:text-base font-bold text-[var(--text)]">Mi resumen</h2>
                  <p className="text-xs text-[var(--text-subtle)]">Se calcula con tus registros de peso y cargas.</p>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {(['semanal', 'mensual'] as const).map((t) => (
                  <button
                    key={t}
                    onClick={() => verResumen(t)}
                    className="py-3 px-4 rounded-xl bg-[var(--surface-raised)] hover:bg-[var(--surface-hover)] border border-[var(--border)] hover:border-[var(--primary)] text-[var(--text)] text-xs font-bold min-h-[44px] cursor-pointer"
                  >
                    {t === 'semanal' ? 'Resumen semanal (7 días)' : 'Resumen mensual (30 días)'}
                  </button>
                ))}
              </div>
            </section>

            <section aria-label="Reportes de mi nutriólogo" className="rounded-3xl p-5 sm:p-6 bg-[var(--surface)] border border-[var(--border)] shadow-[var(--shadow-sm)] space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-[var(--primary-surface)] text-[var(--primary)] flex items-center justify-center">
                  <Stethoscope className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-sm sm:text-base font-bold text-[var(--text)]">Reportes de mi nutriólogo</h2>
                  <p className="text-xs text-[var(--text-subtle)]">Evaluación y recomendaciones de cada periodo.</p>
                </div>
              </div>
              {reportes.length === 0 ? (
                <p className="text-xs text-[var(--text-subtle)]">
                  Todavía no tienes reportes. Cuando tu nutriólogo te envíe uno, aparecerá aquí.
                </p>
              ) : (
                <ul className="space-y-2">
                  {reportes.map((r) => (
                    <li key={r.id}>
                      <button
                        onClick={() => setVista(reporteClinicoVista(perfil.nombre, r))}
                        className="w-full text-left p-4 rounded-2xl bg-[var(--surface-raised)] hover:bg-[var(--surface-hover)] border border-[var(--border-subtle)] hover:border-[var(--primary)] flex items-center justify-between gap-3 cursor-pointer min-h-[56px]"
                      >
                        <span className="flex items-center gap-3 min-w-0">
                          <FileText className="w-5 h-5 text-[var(--primary)] shrink-0" />
                          <span className="min-w-0">
                            <span className="block text-sm font-bold text-[var(--text)]">
                              Reporte {r.periodo_tipo}
                            </span>
                            <span className="block text-[11px] text-[var(--text-subtle)]">
                              {String(r.fecha_inicio).slice(0, 10)} a {String(r.fecha_fin).slice(0, 10)}
                            </span>
                          </span>
                        </span>
                        <span className="text-xs font-bold text-[var(--primary)] shrink-0">Abrir</span>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </section>

            <Link href="/paciente/menu" className="inline-block text-xs font-bold text-[var(--primary-text)] hover:underline min-h-[44px] leading-[44px]">
              ← Volver al menú
            </Link>
          </>
        )}
      </div>

      {/* Copia que se imprime: vive fuera del diseño de la página (directo en body) para que el PDF salga limpio. */}
      {vista && createPortal(<div id="reporte-impreso"><ReporteVistaImpresa r={vista} /></div>, document.body)}
    </div>
  );
}
