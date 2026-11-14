'use client';

import React, { useEffect, useState } from 'react';
import { Save, Info, UserRound, Trash2, AlertTriangle } from 'lucide-react';
import { PacienteTopBar } from '@/components/paciente/PacienteNavigation';
import { cargarPerfil, fetchConTiempo } from '@/lib/offline';
import { borrarDatosLocales } from '@/lib/borrar-datos';
import { NIVELES, validarPerfil, type ErroresPerfil } from '@/lib/perfil-edicion';

const campo =
  'w-full px-3 py-2.5 rounded-xl bg-[var(--surface-raised)] border border-[var(--border)] text-base font-bold text-[var(--text)] min-h-[44px] focus-visible:outline-2 focus-visible:outline-emerald-500';

function ErrorCampo({ id, texto }: { id: string; texto?: string }) {
  if (!texto) return null;
  return (
    <p id={id} role="alert" className="mt-1.5 text-xs font-bold text-rose-600">
      {texto}
    </p>
  );
}

interface Form {
  nombre: string;
  edad: string;
  peso: string;
  estatura: string;
  nivel: string;
}

export default function PerfilPage() {
  const [form, setForm] = useState<Form | null>(null);
  const [original, setOriginal] = useState<Form | null>(null);
  const [errorCarga, setErrorCarga] = useState(false);
  const [errores, setErrores] = useState<ErroresPerfil>({});
  const [guardando, setGuardando] = useState(false);
  const [mensaje, setMensaje] = useState<{ ok: boolean; texto: string } | null>(null);
  const [owner, setOwner] = useState<string | null>(null);
  const [confirmando, setConfirmando] = useState(false);
  const [borrando, setBorrando] = useState(false);
  const [mensajeBorrado, setMensajeBorrado] = useState<{ ok: boolean; texto: string } | null>(null);

  useEffect(() => {
    let vigente = true;
    (async () => {
      const r = await cargarPerfil();
      if (!vigente) return;
      if (r.estado !== 'ok') {
        setErrorCarga(true);
        return;
      }
      const p = r.perfil;
      setOwner(p.id);
      const regs = Array.isArray(p.registros) ? p.registros : [];
      const pesos = regs.map((x) => Number(x.peso_ayunas)).filter((v) => Number.isFinite(v) && v > 0);
      // Igual que la app: el peso de hoy es el del último registro; si no hay, el del alta.
      const peso = pesos.length ? pesos[pesos.length - 1] : Number(p.peso_actual);
      const f: Form = {
        nombre: String(p.nombre ?? ''),
        edad: String(p.edad ?? ''),
        peso: Number.isFinite(peso) ? peso.toFixed(1) : '',
        estatura: p.estatura_cm != null ? String(Number(p.estatura_cm)) : '',
        nivel: p.nivel_entrenamiento === 'Principiante' ? 'Principiante' : 'Intermedio',
      };
      setForm(f);
      setOriginal(f);
    })();
    return () => {
      vigente = false;
    };
  }, []);

  const cambiar = (k: keyof Form, v: string) => {
    setForm((f) => (f ? { ...f, [k]: v } : f));
    setErrores((e) => ({ ...e, [k]: undefined }));
    setMensaje(null);
  };

  const hayCambios = !!form && !!original && (Object.keys(form) as (keyof Form)[]).some((k) => form[k].trim() !== original[k].trim());

  const guardar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form) return;
    const v = validarPerfil(form);
    if (!v.ok) {
      setErrores(v.errores);
      setMensaje({ ok: false, texto: 'Revisa los campos marcados.' });
      return;
    }
    setGuardando(true);
    setMensaje(null);
    try {
      const res = await fetchConTiempo('/api/paciente/perfil', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(v.datos),
      });
      const j = await res.json().catch(() => ({}));
      if (res.ok && j.success) {
        // Vuelve a pedir el perfil: así la copia guardada para uso sin internet queda con los datos nuevos.
        await cargarPerfil();
        const f: Form = {
          nombre: v.datos.nombre,
          edad: String(v.datos.edad),
          peso: v.datos.peso_actual.toFixed(1),
          estatura: String(v.datos.estatura_cm),
          nivel: v.datos.nivel_entrenamiento,
        };
        setForm(f);
        setOriginal(f);
        setMensaje({ ok: true, texto: 'Perfil guardado.' });
        return;
      }
      setMensaje({ ok: false, texto: (j.error as string) || 'No se pudo guardar tu perfil.' });
    } catch {
      setMensaje({ ok: false, texto: 'No se pudo guardar sin internet. Conéctate para cambiar tus datos.' });
    } finally {
      setGuardando(false);
    }
  };

  const borrarTodo = async () => {
    if (!owner) return;
    setBorrando(true);
    setMensajeBorrado(null);
    try {
      // Primero la nube: si no hay internet no se borra nada (si no, la copia de la nube volvería a bajar).
      const res = await fetchConTiempo('/api/paciente/datos', { method: 'DELETE' }, 15_000);
      const j = await res.json().catch(() => ({}));
      if (!res.ok || !j.success) {
        setMensajeBorrado({ ok: false, texto: (j.error as string) || 'No se pudieron borrar tus datos.' });
        return;
      }
      let authId: string | null = null;
      try {
        const me = await fetchConTiempo('/api/auth/me', { cache: 'no-store' }, 8_000);
        authId = (await me.json())?.user?.userId ?? null;
      } catch {
        /* sin el id no se puede quitar la conversación con el asistente; lo demás sí se borra */
      }
      borrarDatosLocales(owner, authId);
      setConfirmando(false);
      setMensajeBorrado({ ok: true, texto: 'Listo: se borraron tus registros y mensajes, en este dispositivo y en la nube.' });
    } catch {
      setMensajeBorrado({ ok: false, texto: 'Para borrar tus datos necesitas internet. No se borró nada; inténtalo cuando vuelva la conexión.' });
    } finally {
      setBorrando(false);
    }
  };

  return (
    <div className="w-full min-h-full">
      <PacienteTopBar titulo="Mi perfil y datos" subtitulo="Nombre, edad, peso, estatura y nivel" badge="Perfil" />

      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {errorCarga && (
          <p role="alert" className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/60 text-xs font-bold text-rose-700 dark:text-rose-400">
            No se pudieron cargar tus datos. Recarga la página.
          </p>
        )}

        {!form && !errorCarga && <div className="h-64 rounded-3xl bg-slate-200 dark:bg-slate-800/60 animate-pulse" aria-label="Cargando" />}

        {form && (
          <form
            onSubmit={guardar}
            noValidate
            aria-label="Editar mi perfil"
            className="rounded-3xl p-5 sm:p-6 bg-[var(--surface)] border border-[var(--border)] shadow-[var(--shadow-sm)] space-y-4"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-[var(--primary-surface)] text-[var(--primary)] flex items-center justify-center">
                <UserRound className="w-5 h-5" />
              </div>
              <h3 className="text-sm sm:text-base font-bold text-[var(--text)]">Tus datos</h3>
            </div>

            <div>
              <label htmlFor="p-nombre" className="block text-sm font-bold text-[var(--text)] mb-1.5">
                Nombre
              </label>
              <input
                id="p-nombre"
                type="text"
                autoComplete="name"
                value={form.nombre}
                onChange={(e) => cambiar('nombre', e.target.value)}
                aria-invalid={!!errores.nombre}
                aria-describedby={errores.nombre ? 'p-nombre-err' : undefined}
                className={campo}
              />
              <ErrorCampo id="p-nombre-err" texto={errores.nombre} />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label htmlFor="p-edad" className="block text-sm font-bold text-[var(--text)] mb-1.5">
                  Edad
                </label>
                <input
                  id="p-edad"
                  type="text"
                  inputMode="numeric"
                  value={form.edad}
                  onChange={(e) => cambiar('edad', e.target.value)}
                  aria-invalid={!!errores.edad}
                  aria-describedby={errores.edad ? 'p-edad-err' : undefined}
                  className={campo}
                />
                <ErrorCampo id="p-edad-err" texto={errores.edad} />
              </div>
              <div>
                <label htmlFor="p-peso" className="block text-sm font-bold text-[var(--text)] mb-1.5">
                  Peso (kg)
                </label>
                <input
                  id="p-peso"
                  type="text"
                  inputMode="decimal"
                  value={form.peso}
                  onChange={(e) => cambiar('peso', e.target.value)}
                  aria-invalid={!!errores.peso}
                  aria-describedby={errores.peso ? 'p-peso-err' : undefined}
                  className={campo}
                />
                <ErrorCampo id="p-peso-err" texto={errores.peso} />
              </div>
              <div>
                <label htmlFor="p-estatura" className="block text-sm font-bold text-[var(--text)] mb-1.5">
                  Estatura (cm)
                </label>
                <input
                  id="p-estatura"
                  type="text"
                  inputMode="decimal"
                  value={form.estatura}
                  onChange={(e) => cambiar('estatura', e.target.value)}
                  aria-invalid={!!errores.estatura}
                  aria-describedby={errores.estatura ? 'p-estatura-err' : undefined}
                  className={campo}
                />
                <ErrorCampo id="p-estatura-err" texto={errores.estatura} />
              </div>
            </div>

            <div>
              <label htmlFor="p-nivel" className="block text-sm font-bold text-[var(--text)] mb-1.5">
                Nivel de entrenamiento
              </label>
              <select id="p-nivel" value={form.nivel} onChange={(e) => cambiar('nivel', e.target.value)} className={campo}>
                {NIVELES.map((n) => (
                  <option key={n} value={n}>
                    {n}
                  </option>
                ))}
              </select>
            </div>

            <button
              type="submit"
              disabled={!hayCambios || guardando}
              className="w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer min-h-[44px] focus-visible:outline-2 focus-visible:outline-emerald-500"
            >
              <Save className="w-4 h-4" />
              {guardando ? 'Guardando…' : 'Guardar cambios'}
            </button>

            {mensaje && (
              <p role={mensaje.ok ? 'status' : 'alert'} className={`text-xs font-bold ${mensaje.ok ? 'text-[var(--primary-text)]' : 'text-rose-600'}`}>
                {mensaje.texto}
              </p>
            )}
          </form>
        )}

        {form && (
          <section
            aria-label="Borrar registros y mensajes"
            className="rounded-3xl p-5 sm:p-6 bg-[var(--surface)] border border-rose-200 dark:border-rose-900/60 shadow-[var(--shadow-sm)] space-y-3"
          >
            <h3 className="text-sm sm:text-base font-bold text-[var(--text)]">Borrar registros y mensajes</h3>
            <p className="text-xs text-[var(--text-muted)] leading-relaxed">
              Elimina todos tus registros diarios, todos tus mensajes con tu nutriólogo, tu conversación con el asistente y tus
              resultados de usabilidad, en este dispositivo y en la nube. Tu perfil, tu meta y tus solicitudes ARCO no se borran.
              No se puede deshacer.
            </p>
            <button
              type="button"
              onClick={() => {
                setMensajeBorrado(null);
                setConfirmando(true);
              }}
              className="w-full py-3 px-4 rounded-xl bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/30 dark:hover:bg-rose-950/60 border border-rose-200 dark:border-rose-900/60 text-rose-700 dark:text-rose-400 text-sm font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer min-h-[44px] focus-visible:outline-2 focus-visible:outline-rose-500"
            >
              <Trash2 className="w-4 h-4" />
              Borrar registros y mensajes
            </button>
            {mensajeBorrado && (
              <p role={mensajeBorrado.ok ? 'status' : 'alert'} className={`text-xs font-bold ${mensajeBorrado.ok ? 'text-[var(--primary-text)]' : 'text-rose-600'}`}>
                {mensajeBorrado.texto}
              </p>
            )}
          </section>
        )}

        {form && (
          <div className="p-4 rounded-2xl bg-[var(--surface-raised)] border border-[var(--border-subtle)] text-xs text-[var(--text-muted)] flex items-start gap-2.5">
            <Info className="w-4 h-4 text-[var(--primary)] shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              Tu nutriólogo ve estos datos en tu expediente. Tu proteína y tu superávit no se cambian aquí: los define él según tu
              tendencia. El peso que ves en tus gráficas es el de tu último registro diario.
            </p>
          </div>
        )}
      </div>

      {confirmando && (
        <div role="dialog" aria-modal="true" aria-labelledby="borrar-titulo" className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-[var(--surface)] rounded-3xl p-6 shadow-2xl border border-[var(--border)] space-y-4">
            <h3 id="borrar-titulo" className="text-base font-bold text-[var(--text)] flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-rose-600" />
              ¿Borrar registros y mensajes?
            </h3>
            <p className="text-xs text-[var(--text-muted)] leading-relaxed">
              Esta acción no se puede deshacer. Tu nutriólogo ya no verá tus registros ni la conversación. Necesitas internet para
              hacerlo.
            </p>
            {mensajeBorrado && !mensajeBorrado.ok && (
              <p role="alert" className="text-xs font-bold text-rose-600">
                {mensajeBorrado.texto}
              </p>
            )}
            <div className="flex gap-3">
              <button
                type="button"
                autoFocus
                onClick={() => setConfirmando(false)}
                disabled={borrando}
                className="flex-1 py-3 rounded-xl bg-[var(--surface-raised)] hover:bg-[var(--surface-hover)] border border-[var(--border)] text-[var(--text)] text-xs font-bold cursor-pointer min-h-[44px] disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={borrarTodo}
                disabled={borrando}
                className="flex-1 py-3 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold cursor-pointer min-h-[44px] disabled:opacity-50"
              >
                {borrando ? 'Borrando…' : 'Borrar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
