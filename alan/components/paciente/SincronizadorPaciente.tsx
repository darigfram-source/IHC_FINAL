'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { CheckCircle2, AlertTriangle, RefreshCw, WifiOff, X } from 'lucide-react';
import {
  ETIQUETA_TIPO,
  EVENTO_COLA,
  EVENTO_SINCRONIZADO,
  enviarCola,
  fetchConTiempo,
  leerCola,
  pendientesDe,
  propietarioLocal,
  type ResultadoEnvio,
} from '@/lib/offline';
import { registrarServiceWorker } from '@/lib/avisos-web';

const CADA_MS = 20_000; // igual que la app: reintenta cada 20 s mientras haya pendientes
const CLAVE_PRECALENTADO = 'nm_offline_v1_precalentado';
// Pantallas que se guardan para abrirlas sin conexión (solo las que la persona puede usar sin internet o consultar).
const PANTALLAS = [
  '/paciente/dashboard',
  '/paciente/diario',
  '/paciente/graficas',
  '/paciente/chat',
  '/paciente/menu',
  '/paciente/metas',
  '/paciente/reportes',
  '/paciente/recordatorios',
  '/paciente/sus',
  '/paciente/arco',
  '/paciente/nutriologo',
  '/paciente/biblioteca',
];

/** Pide al service worker que guarde las pantallas, una vez por sesión del navegador y solo con internet y datos cargados. */
async function precalentarPantallas() {
  try {
    if (sessionStorage.getItem(CLAVE_PRECALENTADO)) return;
    if (!('serviceWorker' in navigator)) return;
    if (!(await registrarServiceWorker())) return;
    const listo = await navigator.serviceWorker.ready;
    if (!listo.active) return;
    listo.active.postMessage({ tipo: 'precalentar', urls: PANTALLAS });
    sessionStorage.setItem(CLAVE_PRECALENTADO, '1');
  } catch {
    /* sin service worker: la web funciona igual, solo no abre sin internet */
  }
}

/** Evita que dos pestañas suban lo mismo a la vez (Web Locks). Sin soporte, sigue de largo. */
async function conCandado(tarea: () => Promise<ResultadoEnvio>): Promise<ResultadoEnvio | null> {
  const locks = typeof navigator !== 'undefined' ? navigator.locks : undefined;
  if (!locks) return tarea();
  return locks.request('nm-sync-paciente', { ifAvailable: true }, async (lock) => (lock ? tarea() : null));
}

type Aviso = { ok: boolean; texto: string };

/** Franja con el estado de la conexión y de lo pendiente. Además sube solo lo que se guardó sin internet:
 *  al volver la red, al volver a la pestaña y cada 20 s. No muestra nada si hay internet y no hay pendientes. */
export const SincronizadorPaciente: React.FC = () => {
  const [enLinea, setEnLinea] = useState(true);
  const [pendientes, setPendientes] = useState(0);
  const [subiendo, setSubiendo] = useState(false);
  const [sesionCaducada, setSesionCaducada] = useState(false);
  const [aviso, setAviso] = useState<Aviso | null>(null);
  const temporizadorAviso = useRef<ReturnType<typeof setTimeout> | null>(null);

  const recontar = useCallback(() => setPendientes(pendientesDe(propietarioLocal())), []);

  const mostrarAviso = useCallback((a: Aviso, ms: number | null) => {
    setAviso(a);
    if (temporizadorAviso.current) clearTimeout(temporizadorAviso.current);
    temporizadorAviso.current = ms ? setTimeout(() => setAviso(null), ms) : null;
  }, []);

  const intentar = useCallback(async () => {
    if (typeof navigator !== 'undefined' && !navigator.onLine) return;
    if (leerCola().length === 0) return;
    // Se sube con la sesión que está abierta ahora: los pendientes de otra persona no se tocan.
    let userId: string | null = null;
    try {
      const r = await fetchConTiempo('/api/auth/me', { cache: 'no-store' }, 8_000);
      if (r.status === 401 || r.status === 403) {
        setSesionCaducada(true);
        return;
      }
      const j = await r.json().catch(() => null);
      userId = typeof j?.user?.userId === 'string' ? j.user.userId : null;
    } catch {
      return; // sin conexión de verdad: se reintenta
    }
    if (!userId || pendientesDe(userId) === 0) return;

    setSesionCaducada(false);
    setSubiendo(true);
    try {
      const r = await conCandado(() => enviarCola(userId!));
      if (!r) return;
      if (r.detenido === 'sesion') setSesionCaducada(true);
      if (r.descartados.length > 0) {
        const detalle = r.descartados.map((d) => `tu ${ETIQUETA_TIPO[d.tipo]} (${d.motivo})`).join('; ');
        mostrarAviso({ ok: false, texto: `No se pudo subir ${detalle}. Vuelve a hacerlo desde su pantalla.` }, null);
      } else if (r.enviados > 0 && r.pendientes === 0) {
        mostrarAviso({ ok: true, texto: 'Listo: lo que guardaste sin internet ya se subió.' }, 6_000);
      }
    } finally {
      setSubiendo(false);
      recontar();
    }
  }, [mostrarAviso, recontar]);

  useEffect(() => {
    setEnLinea(navigator.onLine);
    recontar();
    void intentar();

    const alConectar = () => {
      setEnLinea(true);
      void intentar();
    };
    const alDesconectar = () => setEnLinea(false);
    const alVolver = () => {
      if (document.visibilityState === 'visible') {
        setEnLinea(navigator.onLine);
        void intentar();
      }
    };
    const tick = () => {
      void intentar();
      if (navigator.onLine && propietarioLocal()) void precalentarPantallas();
    };

    window.addEventListener('online', alConectar);
    window.addEventListener('offline', alDesconectar);
    window.addEventListener(EVENTO_COLA, recontar);
    window.addEventListener(EVENTO_SINCRONIZADO, recontar);
    document.addEventListener('visibilitychange', alVolver);
    const t = setInterval(tick, CADA_MS);
    // Un poco después de cargar, para no competir con la pantalla que se está abriendo.
    const primera = setTimeout(() => {
      if (navigator.onLine && propietarioLocal()) void precalentarPantallas();
    }, 4_000);

    return () => {
      window.removeEventListener('online', alConectar);
      window.removeEventListener('offline', alDesconectar);
      window.removeEventListener(EVENTO_COLA, recontar);
      window.removeEventListener(EVENTO_SINCRONIZADO, recontar);
      document.removeEventListener('visibilitychange', alVolver);
      clearInterval(t);
      clearTimeout(primera);
      if (temporizadorAviso.current) clearTimeout(temporizadorAviso.current);
    };
  }, [intentar, recontar]);

  const hayPendientes = pendientes > 0;
  if (enLinea && !hayPendientes && !aviso) return null;

  const textoPendientes = pendientes === 1 ? '1 pendiente por subir' : `${pendientes} pendientes por subir`;

  return (
    <div className="w-full px-4 sm:px-6 lg:px-8 pt-3 space-y-2" role="status" aria-live="polite">
      {!enLinea && (
        <div className="flex items-start gap-3 p-3 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/60 text-amber-800 dark:text-amber-300">
          <WifiOff className="w-4 h-4 mt-0.5 shrink-0" aria-hidden="true" />
          <p className="text-xs font-semibold leading-relaxed">
            Sin conexión. Puedes seguir usando NutriMasa: lo que registres se guarda en este dispositivo y se sube solo cuando vuelva el
            internet.{hayPendientes ? ` Ahora tienes ${textoPendientes}.` : ''}
          </p>
        </div>
      )}

      {enLinea && hayPendientes && (
        <div className="flex items-start gap-3 p-3 rounded-2xl bg-sky-50 dark:bg-sky-950/30 border border-sky-200 dark:border-sky-900/60 text-sky-800 dark:text-sky-300">
          <RefreshCw className={`w-4 h-4 mt-0.5 shrink-0 ${subiendo ? 'animate-spin' : ''}`} aria-hidden="true" />
          <div className="flex-1 min-w-0">
            {sesionCaducada ? (
              <p className="text-xs font-semibold leading-relaxed">
                Tienes {textoPendientes}, pero tu sesión caducó.{' '}
                <Link href="/paciente/login" className="underline font-bold">
                  Inicia sesión
                </Link>{' '}
                con la misma cuenta para subirlos.
              </p>
            ) : (
              <p className="text-xs font-semibold leading-relaxed">
                {subiendo ? 'Subiendo lo que guardaste sin internet…' : `Tienes ${textoPendientes}. Se suben solos; si quieres, `}
                {!subiendo && (
                  <button type="button" onClick={() => void intentar()} className="underline font-bold cursor-pointer min-h-[24px]">
                    súbelos ahora
                  </button>
                )}
                {!subiendo && '.'}
              </p>
            )}
          </div>
        </div>
      )}

      {aviso && (
        <div
          className={`flex items-start gap-3 p-3 rounded-2xl border ${
            aviso.ok
              ? 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-900/60 text-emerald-800 dark:text-emerald-300'
              : 'bg-rose-50 dark:bg-rose-950/30 border-rose-200 dark:border-rose-900/60 text-rose-700 dark:text-rose-400'
          }`}
        >
          {aviso.ok ? <CheckCircle2 className="w-4 h-4 mt-0.5 shrink-0" aria-hidden="true" /> : <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" aria-hidden="true" />}
          <p className="flex-1 text-xs font-semibold leading-relaxed">{aviso.texto}</p>
          <button
            type="button"
            onClick={() => setAviso(null)}
            aria-label="Cerrar aviso"
            className="w-6 h-6 rounded-full flex items-center justify-center shrink-0 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
};
