'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Award, BadgeCheck, Building2, Hourglass, IdCard, MessageCircle, UserRound } from 'lucide-react';
import { PacienteTopBar } from '@/components/paciente/PacienteNavigation';
import { iniciales, muestraNombreReal, nombreVisible, type PerfilNutri } from '@/lib/nutri-perfil';

function Dato({ icono, titulo, valor }: { icono: React.ReactNode; titulo: string; valor: string }) {
  return (
    <div className="flex items-start gap-3 pt-3">
      <span className="text-[var(--primary)] mt-0.5">{icono}</span>
      <div>
        <p className="text-[11px] text-[var(--text-subtle)]">{titulo}</p>
        <p className="text-sm font-bold text-[var(--text)]">{valor}</p>
      </div>
    </div>
  );
}

export default function PacienteMiNutriologoPage() {
  const [nutri, setNutri] = useState<PerfilNutri | null>(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let vigente = true;
    (async () => {
      try {
        const res = await fetch('/api/paciente/nutriologo', { cache: 'no-store' });
        const j = await res.json();
        if (!res.ok || !j.success) throw new Error('Error');
        if (vigente) setNutri(j.data as PerfilNutri | null);
      } catch {
        if (vigente) setError(true);
      } finally {
        if (vigente) setCargando(false);
      }
    })();
    return () => {
      vigente = false;
    };
  }, []);

  return (
    <div className="w-full min-h-full">
      <PacienteTopBar titulo="Mi nutriólogo" subtitulo="Quién revisa tu progreso" badge="Equipo" />

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-5">
        <Link href="/paciente/menu" className="flex items-center gap-2 text-xs font-bold text-[var(--primary-text)] hover:underline min-h-[44px] w-fit">
          <ArrowLeft className="w-4 h-4" />
          Volver al menú
        </Link>

        {cargando ? (
          <p className="text-xs text-[var(--text-subtle)]">Cargando…</p>
        ) : error ? (
          <p role="alert" className="text-sm font-bold text-rose-700 dark:text-rose-400">
            No se pudieron cargar los datos de tu nutriólogo. Revisa tu conexión e inténtalo de nuevo.
          </p>
        ) : !nutri ? (
          <p className="rounded-2xl p-4 text-xs bg-[var(--surface-raised)] border border-[var(--border)] text-[var(--text-muted)]">
            Todavía no tienes nutriólogo asignado. Cuando haya uno disponible aparecerá aquí.
          </p>
        ) : (
          <article className="rounded-3xl p-5 sm:p-6 bg-[var(--surface)] border border-[var(--border)] shadow-[var(--shadow-sm)]">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-full bg-emerald-600 text-white flex items-center justify-center text-lg font-black shrink-0">
                {iniciales(nutri)}
              </div>
              <div className="flex items-center gap-1.5 min-w-0">
                <h2 className="text-lg font-black text-[var(--text)]">{nombreVisible(nutri) || 'Tu nutriólogo'}</h2>
                {nutri.cedula_verificada && <BadgeCheck aria-label="Cédula verificada" className="w-5 h-5 text-emerald-600 shrink-0" />}
              </div>
            </div>

            {muestraNombreReal(nutri) && (
              <Dato icono={<UserRound className="w-[18px] h-[18px]" />} titulo={nutri.cedula_verificada ? 'Nombre verificado' : 'Nombre completo'} valor={nutri.nombre} />
            )}
            {nutri.especialidad && <Dato icono={<Award className="w-[18px] h-[18px]" />} titulo="Especialidad" valor={nutri.especialidad} />}
            {nutri.institucion && <Dato icono={<Building2 className="w-[18px] h-[18px]" />} titulo="Institución" valor={nutri.institucion} />}
            {nutri.cedula_profesional && (
              <>
                <Dato icono={<IdCard className="w-[18px] h-[18px]" />} titulo="Cédula profesional" valor={nutri.cedula_profesional} />
                <Dato
                  icono={nutri.cedula_verificada ? <BadgeCheck className="w-[18px] h-[18px]" /> : <Hourglass className="w-[18px] h-[18px]" />}
                  titulo="Verificación"
                  valor={nutri.cedula_verificada ? 'Cédula verificada en el Registro Nacional de Profesionistas' : 'Cédula en proceso de verificación'}
                />
              </>
            )}
          </article>
        )}

        <p className="flex items-start gap-2 rounded-2xl p-4 text-xs bg-[var(--primary-surface)] text-[var(--primary-text)]">
          <MessageCircle className="w-4 h-4 shrink-0 mt-0.5" />
          Tu nutriólogo revisa tu progreso y te responde en el chat. El chat no es en tiempo real y no sirve para urgencias.
        </p>
      </div>
    </div>
  );
}
