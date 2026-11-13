'use client';

import React, { useEffect, useState } from 'react';
import { BadgeCheck, Hourglass, UserCog } from 'lucide-react';
import { FormularioNutri } from '@/components/admin/FormularioNutri';
import type { PerfilNutriPropio } from '@/lib/nutri-perfil';

/** Pestaña "Mi perfil profesional": lo que ven los pacientes en Menú > Mi nutriólogo.
 *  Con la cuenta verificada, nombre y cédula quedan bloqueados (la base lo exige). */
export const PerfilNutriView: React.FC = () => {
  const [fila, setFila] = useState<PerfilNutriPropio | null>(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [guardado, setGuardado] = useState(false);

  useEffect(() => {
    let vigente = true;
    (async () => {
      try {
        const res = await fetch('/api/nutriologo/perfil', { cache: 'no-store' });
        const j = await res.json();
        if (!vigente) return;
        if (!res.ok || !j.success || !j.data) throw new Error(j.error ?? 'Error');
        setFila(j.data as PerfilNutriPropio);
      } catch {
        if (vigente) setError('No se pudo cargar tu perfil. Inicia sesión como nutriólogo e inténtalo de nuevo.');
      } finally {
        if (vigente) setCargando(false);
      }
    })();
    return () => {
      vigente = false;
    };
  }, []);

  return (
    <div className="flex-1 overflow-y-auto select-text">
      <div className="max-w-xl mx-auto bg-white border border-slate-200 rounded-xl shadow-sm p-5 space-y-4">
        <div className="flex items-center gap-2">
          <UserCog className="w-5 h-5 text-emerald-600" />
          <h3 className="font-bold text-sm text-slate-800">Mi perfil profesional</h3>
        </div>
        <p className="text-xs text-slate-500">
          Tus pacientes ven tu apodo (o tu nombre) con la insignia de cédula verificada, y junto a él tu nombre verificado, en Menú &gt; Mi nutriólogo.
        </p>

        {cargando ? (
          <p className="text-xs text-slate-400">Cargando…</p>
        ) : error || !fila ? (
          <p role="alert" className="text-xs font-bold text-rose-700">
            {error}
          </p>
        ) : (
          <>
            {fila.cedula_verificada ? (
              <p className="flex items-start gap-2 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs">
                <BadgeCheck className="w-4 h-4 shrink-0 mt-0.5" />
                Tu cédula está verificada. Tu nombre y tu cédula ya no se pueden cambiar; tu apodo, institución y especialidad sí.
              </p>
            ) : (
              <p className="flex items-start gap-2 p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs">
                <Hourglass className="w-4 h-4 shrink-0 mt-0.5" />
                Tu cuenta aún está en verificación. Si cambias tu nombre o tu cédula, la verificación se hace con los datos nuevos.
              </p>
            )}
            {guardado && (
              <p role="status" className="text-xs font-bold text-emerald-700">
                Perfil guardado.
              </p>
            )}
            <FormularioNutri
              key={`${fila.nombre}|${fila.apodo}|${fila.cedula_profesional}|${fila.institucion}|${fila.especialidad}`}
              inicial={fila}
              bloquearIdentidad={fila.cedula_verificada}
              textoBoton="Guardar perfil"
              alGuardar={async (v) => {
                setGuardado(false);
                const res = await fetch('/api/nutriologo/perfil', {
                  method: 'PUT',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify(v),
                });
                const j = await res.json().catch(() => ({}));
                if (!res.ok || !j.success) return j.error ?? 'No se pudo guardar.';
                setFila(j.data as PerfilNutriPropio);
                setGuardado(true);
                return null;
              }}
            />
          </>
        )}
      </div>
    </div>
  );
};
