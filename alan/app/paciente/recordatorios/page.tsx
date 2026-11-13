'use client';

import React, { useEffect, useState } from 'react';
import { Bell, BellOff, Info, Send, Clock } from 'lucide-react';
import { PacienteTopBar } from '@/components/paciente/PacienteNavigation';
import {
  idPersonaActual,
  cargarPrefs,
  guardarPrefs,
  permisoAvisos,
  pedirPermisoAvisos,
  mostrarAviso,
  type PermisoAvisos,
} from '@/lib/avisos-web';
import {
  PREFS_POR_DEFECTO,
  analizarHora,
  claveDia,
  formatoHora,
  proximoRecordatorio,
  type PrefsRecordatorio,
} from '@/lib/recordatorio';
import { hayRegistroLocal } from '@/lib/offline';

export default function RecordatoriosPage() {
  const [listo, setListo] = useState(false);
  const [id, setId] = useState('local');
  const [prefs, setPrefs] = useState<PrefsRecordatorio>(PREFS_POR_DEFECTO);
  const [permiso, setPermiso] = useState<PermisoAvisos>('pendiente');
  const [registroHoy, setRegistroHoy] = useState(false);
  // La hora se toma al cargar (ya en el navegador), no al renderizar: Next no permite leerla en el render.
  const [ahora, setAhora] = useState<Date | null>(null);
  const [mensaje, setMensaje] = useState<string | null>(null);

  useEffect(() => {
    let vigente = true;
    (async () => {
      const pid = await idPersonaActual();
      let hecho = false;
      try {
        const res = await fetch('/api/paciente/diario', { cache: 'no-store' });
        const j = await res.json();
        if (res.ok && j.success && Array.isArray(j.data)) {
          const hoy = claveDia(new Date());
          hecho = j.data.some((r: { fecha?: string }) => String(r.fecha ?? '').slice(0, 10) === hoy);
        }
      } catch {
        /* sin conexión: se decide con lo guardado en este dispositivo (abajo) */
      }
      // Lo registrado sin internet (aún sin subir) también cuenta.
      if (!hecho && hayRegistroLocal(claveDia(new Date()), pid)) hecho = true;
      if (!vigente) return;
      setId(pid);
      setPrefs(cargarPrefs(pid));
      setPermiso(permisoAvisos());
      setRegistroHoy(hecho);
      setAhora(new Date());
      setListo(true);
    })();
    return () => {
      vigente = false;
    };
  }, []);

  const cambiar = async (nuevas: PrefsRecordatorio) => {
    setPrefs(nuevas);
    guardarPrefs(id, nuevas);
    setMensaje(null);
    // El permiso se pide justo al activar, que es una acción de la persona.
    if (nuevas.activo && permisoAvisos() === 'pendiente') setPermiso(await pedirPermisoAvisos());
  };

  const permitir = async () => {
    setMensaje(null);
    setPermiso(await pedirPermisoAvisos());
  };

  const probar = async () => {
    const ok = await mostrarAviso('Notificación de prueba', 'Así te avisaremos para completar tu registro.', '/paciente/diario', 'prueba');
    setMensaje(
      ok
        ? 'Notificación enviada.'
        : 'No se pudo enviar. Revisa que las notificaciones estén permitidas para este sitio en tu navegador.'
    );
  };

  const proximo = ahora ? proximoRecordatorio({ ahora, hora: prefs.hora, min: prefs.min, registroHoy }) : null;
  const esHoy = ahora && proximo ? claveDia(proximo) === claveDia(ahora) : false;

  return (
    <div className="w-full min-h-full">
      <PacienteTopBar titulo="Recordatorios" subtitulo="Aviso diario para tu registro" badge="Avisos" />

      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        <section
          aria-label="Recordatorio diario"
          className="rounded-3xl p-5 sm:p-6 bg-[var(--surface)] border border-[var(--border)] shadow-[var(--shadow-sm)] space-y-5"
        >
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-[var(--primary-surface)] text-[var(--primary)] flex items-center justify-center">
                {prefs.activo ? <Bell className="w-5 h-5" /> : <BellOff className="w-5 h-5" />}
              </div>
              <div>
                <h3 className="text-sm sm:text-base font-bold text-[var(--text)]">Recordatorio diario</h3>
                <p className="text-xs text-[var(--text-subtle)]">Te avisa si aún no has hecho tu registro del día.</p>
              </div>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={prefs.activo}
              aria-label="Activar el recordatorio diario"
              disabled={!listo}
              onClick={() => cambiar({ ...prefs, activo: !prefs.activo })}
              className={`relative w-12 h-7 rounded-full transition-colors shrink-0 cursor-pointer disabled:opacity-50 focus-visible:outline-2 focus-visible:outline-emerald-500 ${
                prefs.activo ? 'bg-emerald-600' : 'bg-slate-400 dark:bg-slate-600'
              }`}
            >
              <span
                className={`absolute top-0.5 left-0.5 w-6 h-6 rounded-full bg-white shadow transition-transform ${
                  prefs.activo ? 'translate-x-5' : ''
                }`}
              />
            </button>
          </div>

          <div className={`flex items-center justify-between gap-4 ${prefs.activo ? '' : 'opacity-50'}`}>
            <label htmlFor="hora-recordatorio" className="flex items-center gap-2 text-sm font-semibold text-[var(--text)]">
              <Clock className="w-4 h-4 text-[var(--primary)]" />
              Hora del aviso
            </label>
            <input
              id="hora-recordatorio"
              type="time"
              value={formatoHora(prefs.hora, prefs.min)}
              disabled={!prefs.activo || !listo}
              onChange={(e) => {
                const h = analizarHora(e.target.value);
                if (h) void cambiar({ ...prefs, ...h });
              }}
              className="px-3 py-2 rounded-xl bg-[var(--surface-raised)] border border-[var(--border)] text-sm font-bold text-[var(--text)] min-h-[44px] focus-visible:outline-2 focus-visible:outline-emerald-500"
            />
          </div>

          {listo && proximo && prefs.activo && (
            <p className="text-xs text-[var(--text-muted)]">
              Próximo aviso: <strong>{esHoy ? 'hoy' : 'mañana'} a las {formatoHora(prefs.hora, prefs.min)}</strong>
              {registroHoy ? ' (hoy ya hiciste tu registro).' : '.'}
            </p>
          )}
        </section>

        <section
          aria-label="Permiso de notificaciones"
          className="rounded-3xl p-5 sm:p-6 bg-[var(--surface)] border border-[var(--border)] shadow-[var(--shadow-sm)] space-y-3"
        >
          <h3 className="text-sm font-bold text-[var(--text)]">Notificaciones del navegador</h3>
          {permiso === 'concedido' && (
            <>
              <p className="text-xs text-[var(--text-muted)]">Permitidas. También te avisaremos cuando tu nutriólogo te responda.</p>
              <button
                type="button"
                onClick={probar}
                className="w-full py-3 px-4 rounded-xl bg-[var(--surface-raised)] hover:bg-[var(--surface-hover)] border border-[var(--border)] text-[var(--text)] text-xs font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer min-h-[44px] focus-visible:outline-2 focus-visible:outline-emerald-500"
              >
                <Send className="w-4 h-4 text-[var(--primary)]" />
                Enviar notificación de prueba
              </button>
            </>
          )}
          {permiso === 'pendiente' && (
            <>
              <p className="text-xs text-[var(--text-muted)]">
                Para que el aviso salga aunque tengas otra pestaña abierta, permite las notificaciones.
              </p>
              <button
                type="button"
                onClick={permitir}
                className="w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer min-h-[44px] focus-visible:outline-2 focus-visible:outline-emerald-500"
              >
                <Bell className="w-4 h-4" />
                Permitir notificaciones
              </button>
            </>
          )}
          {permiso === 'denegado' && (
            <p className="text-xs text-[var(--text-muted)]">
              Las notificaciones están bloqueadas para este sitio. Puedes activarlas en la configuración del navegador (el
              candado junto a la dirección). Mientras tanto verás el aviso dentro de la página.
            </p>
          )}
          {permiso === 'no-soportado' && (
            <p className="text-xs text-[var(--text-muted)]">
              Este navegador no permite notificaciones. Verás el aviso dentro de la página.
            </p>
          )}
          {mensaje && (
            <p role="status" className="text-xs font-bold text-[var(--primary-text)]">
              {mensaje}
            </p>
          )}
        </section>

        <div className="p-4 rounded-2xl bg-[var(--surface-raised)] border border-[var(--border-subtle)] text-xs text-[var(--text-muted)] flex items-start gap-2.5">
          <Info className="w-4 h-4 text-[var(--primary)] shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            En la versión web los avisos solo llegan <strong>con NutriMasa abierto</strong> (aunque sea en otra pestaña o en
            segundo plano). Si cierras el navegador no suenan. Para recibirlos siempre, usa la app de Android o iPhone. Tu
            preferencia se guarda solo en este navegador. En iPhone, las notificaciones web funcionan únicamente si agregas
            NutriMasa a la pantalla de inicio.
          </p>
        </div>
      </div>
    </div>
  );
}
