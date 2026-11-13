'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { BadgeCheck } from 'lucide-react';
import { MarcoNutri } from '@/components/admin/MarcoNutri';
import { FormularioNutri } from '@/components/admin/FormularioNutri';

/** Paso 2 del alta: la cuenta ya existe y tiene el correo confirmado; faltan los datos profesionales. */
export default function AdminSolicitudPage() {
  const router = useRouter();
  const [listo, setListo] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Si ya envió su solicitud (o ya es nutriólogo activo), esta pantalla no le toca.
  useEffect(() => {
    let vigente = true;
    (async () => {
      try {
        const res = await fetch('/api/nutriologo/perfil', { cache: 'no-store' });
        const j = await res.json();
        if (!vigente) return;
        if (!res.ok || !j.success) {
          setError(j.error ?? 'No se pudo revisar tu cuenta.');
          return;
        }
        if (j.estado === 'activo') router.replace('/admin');
        else if (j.estado === 'pendiente') router.replace('/admin/verificacion');
        else setListo(true);
      } catch {
        if (vigente) setError('No se pudo conectar. Revisa tu internet e inténtalo de nuevo.');
      }
    })();
    return () => {
      vigente = false;
    };
  }, [router]);

  return (
    <MarcoNutri titulo="Registro de nutriólogo">
      <p className="flex items-start gap-2 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs mb-5">
        <BadgeCheck className="w-4 h-4 shrink-0 mt-0.5" />
        Paso 2 de 2: tu correo ya está confirmado. Captura tus datos profesionales: antes de activar tu cuenta comprobamos tu cédula en la SEP y tu identidad (podemos pedirte una videollamada). No te pedimos tu CURP.
      </p>
      {error ? (
        <p role="alert" className="text-xs font-bold text-rose-700">
          {error}
        </p>
      ) : !listo ? (
        <p className="text-xs text-slate-500">Revisando tu cuenta…</p>
      ) : (
        <FormularioNutri
          textoBoton="Enviar solicitud"
          alGuardar={async (v) => {
            const res = await fetch('/api/nutriologo/perfil', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(v),
            });
            const j = await res.json().catch(() => ({}));
            if (!res.ok || !j.success) return j.error ?? 'No se pudo enviar la solicitud.';
            router.push('/admin/verificacion');
            router.refresh();
            return null;
          }}
        />
      )}
    </MarcoNutri>
  );
}
