'use client';

import React, { useState } from 'react';
import { Lock, AlertCircle } from 'lucide-react';
import {
  APODO_MAX,
  validarCedulaNutri,
  validarEspecialidadNutri,
  validarNombreNutri,
  type PerfilNutriPropio,
} from '@/lib/nutri-perfil';

interface Props {
  inicial?: PerfilNutriPropio | null;
  /** true cuando la cuenta ya está verificada: nombre y cédula quedan de solo lectura. */
  bloquearIdentidad?: boolean;
  textoBoton: string;
  /** Devuelve null si salió bien, o el texto del error. */
  alGuardar: (v: { nombre: string; apodo: string; cedula: string; institucion: string; especialidad: string }) => Promise<string | null>;
}

const CANDADO = 'Verificado: ya no se puede cambiar. Si hay un error, escribe a la administración.';
const campo =
  'w-full px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 text-sm focus-visible:outline-2 focus-visible:outline-emerald-500 read-only:bg-slate-100 read-only:text-slate-500';

/** Formulario de datos profesionales (solicitud inicial y "Mi perfil profesional"). La BASE decide qué se guarda. */
export const FormularioNutri: React.FC<Props> = ({ inicial, bloquearIdentidad = false, textoBoton, alGuardar }) => {
  const [nombre, setNombre] = useState(inicial?.nombre ?? '');
  const [apodo, setApodo] = useState(inicial?.apodo ?? '');
  const [cedula, setCedula] = useState(inicial?.cedula_profesional ?? '');
  const [institucion, setInstitucion] = useState(inicial?.institucion ?? '');
  const [especialidad, setEspecialidad] = useState(inicial?.especialidad ?? '');
  const [errores, setErrores] = useState<Record<string, string>>({});
  const [errorGeneral, setErrorGeneral] = useState<string | null>(null);
  const [guardando, setGuardando] = useState(false);

  const enviar = async (e: React.FormEvent) => {
    e.preventDefault();
    const err: Record<string, string> = {};
    if (!bloquearIdentidad) {
      const n = validarNombreNutri(nombre);
      const c = validarCedulaNutri(cedula);
      if (n) err.nombre = n;
      if (c) err.cedula = c;
    }
    const es = validarEspecialidadNutri(especialidad);
    if (es) err.especialidad = es;
    setErrores(err);
    if (Object.keys(err).length > 0) return;

    setGuardando(true);
    setErrorGeneral(null);
    const msg = await alGuardar({
      nombre: nombre.trim(),
      apodo: apodo.trim(),
      cedula: cedula.trim(),
      institucion: institucion.trim(),
      especialidad: especialidad.trim(),
    });
    setErrorGeneral(msg);
    setGuardando(false);
  };

  const msgError = (id: string) =>
    errores[id] ? (
      <p role="alert" className="mt-1 text-[11px] font-bold text-rose-700">
        {errores[id]}
      </p>
    ) : null;

  return (
    <form onSubmit={enviar} noValidate className="space-y-4 text-xs">
      <div>
        <label htmlFor="nn-nombre" className="font-bold text-slate-700 block mb-1">
          Nombre completo
        </label>
        <div className="relative">
          <input id="nn-nombre" value={nombre} onChange={(e) => setNombre(e.target.value)} readOnly={bloquearIdentidad} className={campo} />
          {bloquearIdentidad && <Lock aria-hidden className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />}
        </div>
        <p className="mt-1 text-[11px] text-slate-500">{bloquearIdentidad ? CANDADO : 'Como aparece en tu cédula profesional.'}</p>
        {msgError('nombre')}
      </div>

      <div>
        <label htmlFor="nn-apodo" className="font-bold text-slate-700 block mb-1">
          Apodo o nombre público (opcional)
        </label>
        <input id="nn-apodo" value={apodo} maxLength={APODO_MAX} onChange={(e) => setApodo(e.target.value)} className={campo} />
        <p className="mt-1 text-[11px] text-slate-500">Así te verán los pacientes, junto a tu nombre verificado.</p>
      </div>

      <div>
        <label htmlFor="nn-cedula" className="font-bold text-slate-700 block mb-1">
          Cédula profesional
        </label>
        <div className="relative">
          <input
            id="nn-cedula"
            value={cedula}
            inputMode="numeric"
            maxLength={8}
            readOnly={bloquearIdentidad}
            onChange={(e) => setCedula(e.target.value.replace(/\D/g, ''))}
            className={campo}
          />
          {bloquearIdentidad && <Lock aria-hidden className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />}
        </div>
        <p className="mt-1 text-[11px] text-slate-500">{bloquearIdentidad ? CANDADO : 'De 7 u 8 dígitos. La comprobamos en la SEP.'}</p>
        {msgError('cedula')}
      </div>

      <div>
        <label htmlFor="nn-inst" className="font-bold text-slate-700 block mb-1">
          Institución o consultorio
        </label>
        <input id="nn-inst" value={institucion} onChange={(e) => setInstitucion(e.target.value)} className={campo} />
      </div>

      <div>
        <label htmlFor="nn-esp" className="font-bold text-slate-700 block mb-1">
          Especialidad
        </label>
        <input id="nn-esp" value={especialidad} onChange={(e) => setEspecialidad(e.target.value)} className={campo} />
        {msgError('especialidad')}
      </div>

      {errorGeneral && (
        <div role="alert" className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs font-medium flex items-start gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          {errorGeneral}
        </div>
      )}

      <button
        type="submit"
        disabled={guardando}
        className="w-full py-3 bg-[#14532d] hover:bg-[#166534] text-white font-bold rounded-xl shadow-md text-sm disabled:opacity-50"
      >
        {guardando ? 'Guardando…' : textoBoton}
      </button>
    </form>
  );
};
