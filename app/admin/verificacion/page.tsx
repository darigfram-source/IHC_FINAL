'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Hourglass, Pencil, RefreshCw } from 'lucide-react';
import { MarcoNutri } from '@/components/admin/MarcoNutri';
import { FormularioNutri } from '@/components/admin/FormularioNutri';
import type { PerfilNutriPropio } from '@/lib/nutri-perfil';

function Fila({ t, v }: { t: string; v?: string | null }) {
  return (
    <div className="pt-2.5">
      <p className="text-[11px] text-slate-500">{t}</p>
      <p className="text-sm font-bold text-slate-800">{v?.trim() ? v : '—'}</p>
    </div>
  );
}

/** La solicitud ya se envió: sin permisos hasta que la administración la apruebe. */
export default function AdminVerificacionPage() {
  const router = useRouter();
  const [fila, setFila] = useState<PerfilNutriPropio | null>(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [aviso, setAviso] = useState<string | null>(null);
  const [editando, setEditando] = useState(false);
  const [version, setVersion] = useState(0);

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
        setError(null);
        if (j.estado === 'activo') router.replace('/admin');
        else if (j.estado === 'sin_solicitud') router.replace('/admin/solicitud');
        else {
          setFila(j.data as PerfilNutriPropio);
          if (version > 0) setAviso('Tu cuenta sigue en verificación.');
        }
      } catch {
        if (vigente) setError('No se pudo conectar. Revisa tu internet e inténtalo de nuevo.');
      } finally {
        if (vigente) setCargando(false);
      }
    })();
    return () => {
      vigente = false;
    };
  }, [router, version]);

  const actualizar = () => {
    setAviso(null);
    setCargando(true);
    setVersion((v) => v + 1);
  };

  return (
    <MarcoNutri titulo="Verificación de cuenta">
      <div className="text-center space-y-2">
        <Hourglass className="w-12 h-12 mx-auto text-emerald-700" />
        <h2 className="text-lg font-black text-slate-900">Estamos verificando tu información</h2>
        <p className="text-xs text-slate-500 leading-relaxed">
          Comprobamos tu cédula profesional y tu identidad. Te avisaremos por correo cuando tu cuenta quede verificada; mientras tanto no verás pacientes ni aparecerás para que los voluntarios te elijan.
        </p>
      </div>

      {error && (
        <p role="alert" className="mt-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium">
          {error}
        </p>
      )}
      {aviso && !error && (
        <p role="status" className="mt-4 p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs font-medium">
          {aviso}
        </p>
      )}

      {fila && !editando && (
        <section className="mt-5 rounded-2xl border border-slate-200 p-4">
          <h3 className="text-xs font-extrabold text-slate-800">Datos que enviaste</h3>
          <Fila t="Nombre completo" v={fila.nombre} />
          {fila.apodo?.trim() && <Fila t="Apodo" v={fila.apodo} />}
          <Fila t="Cédula profesional" v={fila.cedula_profesional} />
          <Fila t="Institución" v={fila.institucion} />
          <Fila t="Especialidad" v={fila.especialidad} />
        </section>
      )}

      {fila && editando && (
        <section className="mt-5">
          <p className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs mb-4">
            Puedes corregir tus datos; si cambias tu nombre o tu cédula, la verificación se hace con los datos nuevos.
          </p>
          <FormularioNutri
            inicial={fila}
            textoBoton="Guardar datos"
            alGuardar={async (v) => {
              const res = await fetch('/api/nutriologo/perfil', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(v),
              });
              const j = await res.json().catch(() => ({}));
              if (!res.ok || !j.success) return j.error ?? 'No se pudo guardar.';
              setFila(j.data as PerfilNutriPropio);
              setEditando(false);
              return null;
            }}
          />
          <button onClick={() => setEditando(false)} className="mt-2 w-full py-2.5 text-xs font-bold text-slate-600 hover:underline">
            Cancelar
          </button>
        </section>
      )}

      {!editando && (
        <div className="mt-5 space-y-2">
          <button
            onClick={actualizar}
            disabled={cargando}
            className="w-full py-3 bg-[#14532d] hover:bg-[#166534] text-white font-bold rounded-xl text-sm flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${cargando ? 'animate-spin' : ''}`} />
            Actualizar
          </button>
          {fila && (
            <button
              onClick={() => setEditando(true)}
              className="w-full py-3 border border-slate-300 text-slate-700 font-bold rounded-xl text-sm flex items-center justify-center gap-2 hover:bg-slate-50"
            >
              <Pencil className="w-4 h-4" />
              Corregir mis datos
            </button>
          )}
        </div>
      )}
    </MarcoNutri>
  );
}
