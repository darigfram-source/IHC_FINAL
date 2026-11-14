'use client';

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Bell, MessageSquare, X } from 'lucide-react';
import {
  idPersonaActual,
  cargarPrefs,
  cargarUltimoAvisoDia,
  guardarUltimoAvisoDia,
  cargarMarcaChat,
  guardarMarcaChat,
  mostrarAviso,
  permisoAvisos,
  registrarServiceWorker,
} from '@/lib/avisos-web';
import { claveDia, debeAvisarRegistro, mensajesNuevosDelNutriologo } from '@/lib/recordatorio';
import { hayRegistroLocal } from '@/lib/offline';

type Aviso = { tipo: 'registro' | 'respuesta'; texto: string };

const CADA_MS = 30_000; // revisa si toca el recordatorio
const CADA_CHAT_TICKS = 2; // y cada 2 revisiones (60 s) mira si el nutriólogo respondió

/** Avisos del paciente mientras la página está abierta (sin envío push):
 *  - recordatorio del registro diario a la hora elegida, si aún no hay registro de hoy;
 *  - aviso cuando el nutriólogo responde.
 *  Sale un aviso del sistema si la persona dio permiso y, siempre, una tarjeta dentro de la página.
 *  Los avisos del sistema no incluyen el texto del mensaje: la pantalla bloqueada la ve cualquiera. */
export const AvisosPaciente: React.FC = () => {
  const pathname = usePathname();
  const [aviso, setAviso] = useState<Aviso | null>(null);
  const rutaRef = useRef(pathname);

  useEffect(() => {
    rutaRef.current = pathname;
  }, [pathname]);

  useEffect(() => {
    let vivo = true;
    let id: string | null = null;
    let ticks = 0;
    let registroConfirmadoDia: string | null = null; // evita volver a preguntar hoy si ya registró

    const revisarRegistro = async () => {
      if (!id) return;
      const ahora = new Date();
      const hoy = claveDia(ahora);
      if (registroConfirmadoDia === hoy) return;
      const prefs = cargarPrefs(id);
      const ultimo = cargarUltimoAvisoDia(id);
      // Primera comprobación barata, sin red: ¿ya es la hora y falta avisar?
      if (!debeAvisarRegistro({ ahora, prefs, registroHoy: false, ultimoAvisoDia: ultimo })) return;
      // Lo registrado sin internet (aún sin subir) también cuenta: si no, el aviso insistiría a quien ya registró.
      if (hayRegistroLocal(hoy, id)) {
        registroConfirmadoDia = hoy;
        return;
      }
      const lanzarAviso = () => {
        if (!vivo) return;
        guardarUltimoAvisoDia(id!, hoy);
        // Si ya está en la pantalla de registro no hace falta recordárselo.
        if (!rutaRef.current.startsWith('/paciente/diario')) {
          setAviso({ tipo: 'registro', texto: 'Anota tu peso y tu entrenamiento de hoy. Toma menos de 30 segundos.' });
          if (document.visibilityState !== 'visible') {
            void mostrarAviso('Es hora de tu registro', 'Anota tu peso y tu entrenamiento de hoy.', '/paciente/diario', 'registro-diario');
          }
        }
      };
      try {
        const res = await fetch('/api/paciente/diario', { cache: 'no-store' });
        const j = await res.json();
        if (!res.ok || !j.success || !Array.isArray(j.data)) return;
        const registroHoy = j.data.some((r: { fecha?: string }) => String(r.fecha ?? '').slice(0, 10) === hoy);
        if (registroHoy) {
          registroConfirmadoDia = hoy;
          return;
        }
        lanzarAviso();
      } catch {
        // Sin conexión: el recordatorio no necesita internet. Como arriba ya se vio que no hay registro de hoy en este
        // dispositivo, se avisa igual.
        lanzarAviso();
      }
    };

    const revisarChat = async () => {
      if (!id) return;
      try {
        const res = await fetch('/api/paciente/chat', { cache: 'no-store' });
        const j = await res.json();
        if (!res.ok || !j.success || !Array.isArray(j.data)) return;
        const { nuevos, marca } = mensajesNuevosDelNutriologo(j.data, cargarMarcaChat(id));
        if (marca) guardarMarcaChat(id, marca);
        if (!vivo || nuevos === 0) return;
        if (rutaRef.current.startsWith('/paciente/chat') && document.visibilityState === 'visible') {
          // Ya está viendo el chat: el aviso es solo la tarjeta, para que sepa que hay algo nuevo.
          setAviso({ tipo: 'respuesta', texto: nuevos === 1 ? 'Tienes una respuesta nueva.' : `Tienes ${nuevos} respuestas nuevas.` });
          return;
        }
        setAviso({ tipo: 'respuesta', texto: nuevos === 1 ? 'Tu nutriólogo te respondió.' : `Tu nutriólogo te escribió ${nuevos} mensajes.` });
        if (document.visibilityState !== 'visible') {
          void mostrarAviso('Tu nutriólogo te respondió', 'Abre el chat para leer su mensaje.', '/paciente/chat', 'respuesta-nutriologo');
        }
      } catch {
        /* sin conexión: se reintenta en la siguiente revisión */
      }
    };

    const tick = () => {
      if (!id) return;
      void revisarRegistro();
      ticks += 1;
      // También con la pestaña en segundo plano: es cuando el aviso del sistema sirve.
      if (ticks % CADA_CHAT_TICKS === 0) void revisarChat();
    };

    (async () => {
      id = await idPersonaActual();
      if (!vivo) return;
      if (permisoAvisos() === 'concedido') void registrarServiceWorker();
      void revisarChat(); // primera vez: solo fija la marca; no avisa de mensajes viejos
      void revisarRegistro();
    })();

    const t = setInterval(tick, CADA_MS);
    const alVolver = () => {
      if (document.visibilityState === 'visible') {
        void revisarRegistro();
        void revisarChat();
      }
    };
    document.addEventListener('visibilitychange', alVolver);
    return () => {
      vivo = false;
      clearInterval(t);
      document.removeEventListener('visibilitychange', alVolver);
    };
  }, []);

  if (!aviso) return null;
  const esRegistro = aviso.tipo === 'registro';
  const Icono = esRegistro ? Bell : MessageSquare;
  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed z-40 left-4 right-4 bottom-24 md:left-auto md:right-6 md:bottom-6 md:w-96 rounded-2xl bg-[var(--surface)] border border-[var(--border)] shadow-[var(--shadow-sm)] p-4 flex items-start gap-3"
    >
      <div className="w-9 h-9 rounded-xl bg-[var(--primary-surface)] text-[var(--primary)] flex items-center justify-center shrink-0">
        <Icono className="w-4 h-4" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-bold text-[var(--text)]">{esRegistro ? 'Es hora de tu registro' : 'Mensaje de tu nutriólogo'}</p>
        <p className="text-xs text-[var(--text-muted)] mt-0.5">{aviso.texto}</p>
        <Link
          href={esRegistro ? '/paciente/diario' : '/paciente/chat'}
          onClick={() => setAviso(null)}
          className="inline-block mt-2 text-xs font-bold text-[var(--primary-text)] underline"
        >
          {esRegistro ? 'Hacer mi registro' : 'Abrir el chat'}
        </Link>
      </div>
      <button
        type="button"
        onClick={() => setAviso(null)}
        aria-label="Cerrar aviso"
        className="w-8 h-8 rounded-full bg-[var(--surface-raised)] text-[var(--text-muted)] flex items-center justify-center shrink-0 cursor-pointer"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};
