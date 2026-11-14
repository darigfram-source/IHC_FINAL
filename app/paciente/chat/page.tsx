'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  Send,
  Clock,
  Sparkles,
  ShieldAlert,
  UserCheck,
  CheckCheck,
  Bot,
  Stethoscope,
  Hourglass,
} from 'lucide-react';
import { PacienteTopBar } from '@/components/paciente/PacienteNavigation';
import { AccionesMensaje, EditorMensaje, useAhora } from '@/components/AccionesMensaje';
import {
  esperaSiguiente,
  listasIguales,
  mezclarMensajes,
  revisionPendienteEn,
  sinLeerDelNutriologo,
  conNutriologoLeido,
} from '@/lib/sincronizar-chat';

interface Mensaje {
  id: string;
  usuario_id: string;
  remitente: 'usuario' | 'nutriologo';
  contenido: string;
  tipo?: string;
  creado_en?: string;
  editado_en?: string | null;
  leido?: boolean;
}

// Conversación con el asistente de IA: igual que en la app, se queda en este dispositivo (no se sube a la base).
interface MensajeIA {
  id: string;
  autor: 'usuario' | 'ia';
  texto: string;
  hora: string;
  origen?: 'ia' | 'reglas';
}

type Canal = 'ia' | 'nutriologo';

const PREGUNTAS_IA = ['¿Cuánta proteína necesito?', '¿Subo mi superávit?', 'Me siento estancado', '¿Puedo tomar creatina?'];
const PREGUNTAS_NUTRI = [
  '¿Qué colación puedo ingerir si me faltan 25g de proteína hoy?',
  '¿Puedo mover mi horario de entrenamiento esta semana?',
];
const MAX_GUARDADOS = 60;
const MENSAJE_REVISION = 'Solicito la revisión de un nutriólogo.';

const ahora = () => new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
const bienvenidaIA = (): MensajeIA => ({
  id: 'ia-bienvenida',
  autor: 'ia',
  hora: '',
  texto:
    'Hola, soy el asistente de NutriMasa. Puedo explicarte tu plan de proteína y superávit, tu progreso y darte consejos ' +
    'generales. No diagnostico ni receto: para eso pide la revisión de un nutriólogo.',
});

export default function PacienteChatPage() {
  const [canal, setCanal] = useState<Canal>('ia');
  const [mensajes, setMensajes] = useState<Mensaje[]>([]);
  const [mensajesIA, setMensajesIA] = useState<MensajeIA[]>([bienvenidaIA()]);
  const [claveIA, setClaveIA] = useState<string | null>(null);
  const [nuevoMensaje, setNuevoMensaje] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [escribiendoIA, setEscribiendoIA] = useState(false);
  const [revisionPendiente, setRevisionPendiente] = useState(false);
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const ahoraMs = useAhora();
  const [editandoId, setEditandoId] = useState<string | null>(null);
  const [guardandoEdicion, setGuardandoEdicion] = useState(false);
  const [errorMensaje, setErrorMensaje] = useState<string | null>(null);
  const [sinConexion, setSinConexion] = useState(false);
  const [ultimaSync, setUltimaSync] = useState<string | null>(null);
  const [intentoLeidos, setIntentoLeidos] = useState(0); // sube al terminar de marcar: reintenta si aún quedan sin leer
  const marcandoLeidos = useRef(false);
  const mensajesRef = useRef<Mensaje[]>([]);
  const consultando = useRef(false);
  const fallos = useRef(0);
  const repetir = useRef(false);

  // Conversación con el nutriólogo (base de datos). Devuelve true si el servidor respondió bien.
  const recargarChat = async (): Promise<boolean> => {
    if (consultando.current) {
      repetir.current = true; // hay una en curso (quizá anterior al cambio): se repite al terminar
      return true;
    }
    consultando.current = true;
    try {
      const res = await fetch('/api/paciente/chat', { cache: 'no-store' });
      const json = await res.json();
      if (!res.ok || !json.success || !json.data) throw new Error(json.error || 'Error');
      const lista = mezclarMensajes(json.data as Mensaje[], mensajesRef.current) as Mensaje[];
      // Solo se vuelve a pintar si algo cambió (así no se mueve el scroll cada 15 s).
      if (!listasIguales(lista, mensajesRef.current)) {
        mensajesRef.current = lista;
        setMensajes(lista);
      }
      setRevisionPendiente(revisionPendienteEn(lista));
      fallos.current = 0;
      setSinConexion(false);
      setUltimaSync(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
      return true;
    } catch {
      fallos.current += 1;
      setSinConexion(true);
      return false;
    } finally {
      consultando.current = false;
      setLoading(false);
      if (repetir.current) {
        repetir.current = false;
        void recargarChat();
      }
    }
  };

  useEffect(() => {
    mensajesRef.current = mensajes;
  }, [mensajes]);

  // Sincronización periódica: cada 15 s con la pestaña visible (más lenta si falla la red), una consulta
  // inmediata al volver a la pestaña o a tener internet, y ninguna con la pestaña oculta.
  useEffect(() => {
    let cancelado = false;
    let temporizador: ReturnType<typeof setTimeout> | undefined;

    const programar = () => {
      if (cancelado) return;
      clearTimeout(temporizador);
      if (document.hidden) return; // se reanuda en visibilitychange
      temporizador = setTimeout(async () => {
        await recargarChat();
        programar();
      }, esperaSiguiente(fallos.current));
    };
    const ahoraMismo = async () => {
      if (document.hidden) return;
      clearTimeout(temporizador);
      await recargarChat();
      programar();
    };

    // eslint-disable-next-line react-hooks/set-state-in-effect
    ahoraMismo();
    document.addEventListener('visibilitychange', ahoraMismo);
    window.addEventListener('online', ahoraMismo);
    window.addEventListener('focus', ahoraMismo);
    return () => {
      cancelado = true;
      clearTimeout(temporizador);
      document.removeEventListener('visibilitychange', ahoraMismo);
      window.removeEventListener('online', ahoraMismo);
      window.removeEventListener('focus', ahoraMismo);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Mensajes del nutriólogo sin leer: el dato es el campo `leido` de la base (el mismo que usa la app), así web y app no se
  // contradicen. Al abrir la pestaña "Nutriólogo" (y mientras está abierta) se marcan como leídos en la base.
  const sinLeer = sinLeerDelNutriologo(mensajes);

  useEffect(() => {
    if (loading || canal !== 'nutriologo' || marcandoLeidos.current) return;
    if (sinLeerDelNutriologo(mensajes) === 0) return;
    marcandoLeidos.current = true;
    // Al instante en pantalla; si el servidor falla, la siguiente consulta trae `leido: false` y se reintenta.
    const lista = conNutriologoLeido(mensajesRef.current) as Mensaje[];
    mensajesRef.current = lista;
    setMensajes(lista);
    fetch('/api/paciente/chat/leidos', { method: 'POST' })
      .catch(() => {
        /* sin conexión: se reintenta con la siguiente consulta */
      })
      .finally(() => {
        marcandoLeidos.current = false;
        setIntentoLeidos((n) => n + 1);
      });
  }, [mensajes, canal, loading, intentoLeidos]);

  // Conversación con el asistente de IA (este dispositivo), separada por persona.
  useEffect(() => {
    async function cargarIA() {
      try {
        const res = await fetch('/api/auth/me');
        const j = await res.json();
        const clave = j?.user?.userId ? `nm_chat_ia_v1_${j.user.userId}` : null;
        setClaveIA(clave);
        if (clave) {
          try {
            const guardado = JSON.parse(localStorage.getItem(clave) ?? '[]') as MensajeIA[];
            if (Array.isArray(guardado) && guardado.length) setMensajesIA([bienvenidaIA(), ...guardado]);
          } catch {
            /* sin almacenamiento: la conversación vive solo mientras la página está abierta */
          }
        }
      } catch {
        /* sin sesión: el middleware ya redirige */
      }
    }
    cargarIA();
  }, []);

  useEffect(() => {
    if (!claveIA) return;
    try {
      const sinBienvenida = mensajesIA.filter((m) => m.id !== 'ia-bienvenida').slice(-MAX_GUARDADOS);
      localStorage.setItem(claveIA, JSON.stringify(sinBienvenida));
    } catch {
      /* ignorar */
    }
  }, [mensajesIA, claveIA]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [mensajes, mensajesIA, canal, escribiendoIA]);

  const enviarAlNutriologo = async (texto: string): Promise<boolean> => {
    try {
      const res = await fetch('/api/paciente/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contenido: texto }),
      });
      const data = await res.json();
      return res.ok && data.success;
    } catch {
      return false;
    }
  };

  const mensajeLocal = (texto: string): Mensaje => ({
    id: `local-${Date.now()}`,
    usuario_id: 'paciente',
    remitente: 'usuario',
    contenido: texto,
    creado_en: ahora(),
  });

  const pedirRevision = async () => {
    if (revisionPendiente) return;
    setRevisionPendiente(true);
    const temp = mensajeLocal(MENSAJE_REVISION);
    setMensajes((prev) => [...prev, temp]);
    const ok = await enviarAlNutriologo(MENSAJE_REVISION);
    if (!ok) {
      setMensajes((prev) => prev.filter((m) => m.id !== temp.id));
      setRevisionPendiente(false);
      setMensajesIA((prev) => [
        ...prev,
        { id: `ia-${Date.now()}`, autor: 'ia', hora: ahora(), texto: 'No pude enviar tu solicitud. Revisa tu conexión e inténtalo de nuevo.' },
      ]);
      return;
    }
    recargarChat();
    setMensajesIA((prev) => [
      ...prev,
      {
        id: `ia-${Date.now()}`,
        autor: 'ia',
        hora: ahora(),
        texto:
          'Listo. Un nutriólogo revisará tus registros y te responderá en el chat con el nutriólogo. ' +
          'No es en tiempo real y no sirve para urgencias.',
      },
    ]);
  };

  const preguntarIA = async (texto: string) => {
    const previos = mensajesIA
      .filter((m) => m.id !== 'ia-bienvenida')
      .slice(-8)
      .map((m) => ({ autor: m.autor, texto: m.texto }));
    setMensajesIA((prev) => [...prev, { id: `u-${Date.now()}`, autor: 'usuario', texto, hora: ahora() }]);
    setEscribiendoIA(true);
    try {
      const res = await fetch('/api/paciente/asesor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mensaje: texto, historial: previos }),
      });
      const j = await res.json();
      if (!res.ok || !j.success) throw new Error(j.error || 'Error');
      const d = j.data as { texto: string; pedirRevision?: boolean; origen?: 'ia' | 'reglas' };
      setMensajesIA((prev) => [...prev, { id: `ia-${Date.now()}`, autor: 'ia', texto: d.texto, hora: ahora(), origen: d.origen }]);
      // El asistente dice "ya pedí la revisión": se avisa de verdad al nutriólogo (una sola vez).
      if (d.pedirRevision && !revisionPendiente) {
        setRevisionPendiente(true);
        const temp = mensajeLocal(MENSAJE_REVISION);
        setMensajes((prev) => [...prev, temp]);
        const ok = await enviarAlNutriologo(MENSAJE_REVISION);
        if (!ok) {
          setMensajes((prev) => prev.filter((m) => m.id !== temp.id));
          setRevisionPendiente(false);
        } else {
          recargarChat();
        }
      }
    } catch {
      setMensajesIA((prev) => [
        ...prev,
        {
          id: `ia-${Date.now()}`,
          autor: 'ia',
          hora: ahora(),
          texto: 'No pude responderte ahora. Inténtalo de nuevo en un momento o escribe a tu nutriólogo.',
        },
      ]);
    } finally {
      setEscribiendoIA(false);
    }
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    const texto = nuevoMensaje.trim();
    if (!texto || enviando || escribiendoIA) return;
    setNuevoMensaje('');

    if (canal === 'ia') {
      await preguntarIA(texto);
      return;
    }

    setEnviando(true);
    const temp = mensajeLocal(texto);
    setMensajes((prev) => [...prev, temp]);
    const ok = await enviarAlNutriologo(texto);
    if (!ok) {
      console.warn('Error sincronizando mensaje con BD.');
      setMensajes((prev) => prev.filter((m) => m.id !== temp.id));
      setNuevoMensaje(texto);
    } else {
      await recargarChat(); // trae el id real para poder editar o eliminar
    }
    setEnviando(false);
  };

  const guardarEdicion = async (id: string, texto: string) => {
    setGuardandoEdicion(true);
    setErrorMensaje(null);
    try {
      const res = await fetch('/api/paciente/chat', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, contenido: texto }),
      });
      const j = await res.json().catch(() => ({}));
      if (!res.ok || !j.success) throw new Error(j.error || 'No se pudo editar el mensaje.');
      setEditandoId(null);
    } catch (e) {
      setErrorMensaje(e instanceof Error ? e.message : 'No se pudo editar el mensaje.');
    } finally {
      setGuardandoEdicion(false);
      await recargarChat();
    }
  };

  const eliminarMensaje = async (id: string) => {
    if (!window.confirm('¿Eliminar este mensaje? Tu nutriólogo ya no lo verá.')) return;
    setErrorMensaje(null);
    try {
      const res = await fetch('/api/paciente/chat', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
      const j = await res.json().catch(() => ({}));
      if (!res.ok || !j.success) throw new Error(j.error || 'No se pudo eliminar el mensaje.');
    } catch (e) {
      setErrorMensaje(e instanceof Error ? e.message : 'No se pudo eliminar el mensaje.');
    } finally {
      await recargarChat();
    }
  };

  const preguntas = canal === 'ia' ? PREGUNTAS_IA : PREGUNTAS_NUTRI;

  return (
    <div className="w-full flex flex-col h-[calc(100vh-4rem)] md:h-screen">
      <PacienteTopBar
        titulo={canal === 'ia' ? 'Asistente IA' : 'Consulta con Especialista'}
        subtitulo={canal === 'ia' ? 'Dudas rápidas sobre tu plan' : 'Mensajería asíncrona deportiva'}
        badge={canal === 'ia' ? 'Asistente IA' : 'Nutriólogo Asignado'}
      />

      {/* AVISO MÉDICO OBLIGATORIO (Figura 6 - WCAG AA) */}
      <div
        role="alert"
        className="bg-[var(--warning-surface)] border-b border-[var(--warning-border)] text-[var(--warning-text)] px-4 py-2.5 text-xs flex items-center justify-between gap-3 shrink-0"
      >
        <div className="flex items-center gap-2.5 max-w-4xl mx-auto w-full">
          <ShieldAlert className="w-5 h-5 shrink-0 text-[var(--warning)]" />
          <p className="leading-tight">
            <strong>Aviso de Seguridad Médica:</strong> Este canal es de seguimiento nutricional asíncrono. No es un servicio de urgencias médicas ni respuesta en tiempo real.
          </p>
        </div>
      </div>

      <div className="flex-1 max-w-5xl w-full mx-auto p-4 sm:p-6 flex flex-col min-h-0 overflow-hidden">
        <div className="flex-1 rounded-3xl bg-[var(--surface)] border border-[var(--border)] shadow-[var(--shadow-sm)] flex flex-col min-h-0 overflow-hidden">
          {/* Selector de canal */}
          <div className="px-4 pt-3 shrink-0 bg-[var(--surface-raised)] border-b border-[var(--border)]">
            <div role="tablist" aria-label="Con quién chatear" className="inline-flex p-1 rounded-xl bg-[var(--surface-active)] gap-1 mb-3">
              {(
                [
                  { id: 'ia', texto: 'Asistente IA', Icono: Bot },
                  { id: 'nutriologo', texto: 'Nutriólogo', Icono: Stethoscope },
                ] as const
              ).map(({ id, texto, Icono }) => (
                <button
                  key={id}
                  role="tab"
                  aria-selected={canal === id}
                  onClick={() => setCanal(id)}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold min-h-[36px] cursor-pointer transition-colors ${
                    canal === id
                      ? 'bg-[var(--surface)] text-[var(--primary-text)] shadow-sm'
                      : 'text-[var(--text-subtle)] hover:text-[var(--text)]'
                  }`}
                >
                  <Icono className="w-4 h-4" />
                  {texto}
                  {id === 'nutriologo' && sinLeer > 0 && canal !== 'nutriologo' && (
                    <span
                      className="ml-1 min-w-[18px] px-1 h-[18px] rounded-full bg-emerald-600 text-white text-[10px] flex items-center justify-center"
                      aria-label={`${sinLeer} mensaje${sinLeer === 1 ? '' : 's'} nuevo${sinLeer === 1 ? '' : 's'} del nutriólogo`}
                    >
                      {sinLeer}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Header del canal */}
          <div className="px-5 py-3.5 border-b border-[var(--border)] bg-[var(--surface-raised)] flex items-center justify-between shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-emerald-600 text-white flex items-center justify-center font-bold text-sm shadow-sm">
                {canal === 'ia' ? <Bot className="w-5 h-5" /> : 'ND'}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-sm font-bold text-[var(--text)]">
                    {canal === 'ia' ? 'Asistente IA de NutriMasa' : 'Nutriólogo Deportivo'}
                  </h2>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[var(--primary-surface)] text-[var(--primary-text)] border border-[var(--primary-border)]">
                    {canal === 'ia' ? 'Primera línea' : 'Especialista Acreditado'}
                  </span>
                </div>
                <p className="text-xs text-[var(--text-subtle)] flex items-center gap-1 mt-0.5">
                  <Clock className="w-3 h-3" />
                  {canal === 'ia' ? 'Responde al momento; no sustituye a un profesional' : 'Horario habitual de respuesta: < 24h'}
                </p>
              </div>
            </div>

            {canal === 'nutriologo' && (
              <div className="hidden sm:flex items-center gap-2 text-xs text-[var(--text-subtle)]">
                <UserCheck className="w-4 h-4 text-[var(--primary)]" />
                <span>Cédula Profesional Validada</span>
              </div>
            )}
          </div>

          {/* Pedir revisión (solo en el canal del asistente) */}
          {canal === 'ia' && (
            <div className="px-5 py-2 border-b border-[var(--border)] bg-[var(--surface)] shrink-0 text-xs">
              {revisionPendiente ? (
                <span className="flex items-center gap-2 font-bold text-[var(--primary-text)]">
                  <Hourglass className="w-4 h-4" />
                  Revisión de nutriólogo solicitada
                </span>
              ) : (
                <button
                  onClick={pedirRevision}
                  className="flex items-center gap-2 font-bold text-[var(--primary-text)] hover:underline min-h-[36px] cursor-pointer"
                >
                  <Stethoscope className="w-4 h-4" />
                  Pedir revisión de un nutriólogo
                </button>
              )}
            </div>
          )}

          {sinConexion && (
            <div role="status" className="px-5 py-1.5 border-b border-[var(--border)] bg-[var(--warning-surface)] text-[var(--warning-text)] text-[11px] shrink-0">
              Sin conexión: no se están recibiendo mensajes nuevos{ultimaSync ? ` (última actualización ${ultimaSync})` : ''}. Se reintenta solo.
            </div>
          )}

          {/* Área de Mensajes */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
            {canal === 'ia' ? (
              <>
                {mensajesIA.map((msg) => {
                  const isUser = msg.autor === 'usuario';
                  return (
                    <div key={msg.id} className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}>
                      <div
                        className={`max-w-[85%] sm:max-w-[70%] rounded-2xl px-4 py-3 text-xs sm:text-sm leading-relaxed shadow-xs ${
                          isUser
                            ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-br-none'
                            : 'bg-[var(--surface-raised)] text-[var(--text)] border border-[var(--border-subtle)] rounded-bl-none'
                        }`}
                      >
                        <p className="whitespace-pre-line">{msg.texto}</p>
                        {msg.hora && (
                          <div className={`text-[10px] mt-1.5 text-right ${isUser ? 'text-emerald-100' : 'text-[var(--text-subtle)]'}`}>
                            {msg.hora}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
                {escribiendoIA && (
                  <p className="text-xs text-[var(--text-subtle)]" aria-live="polite">
                    Asistente IA está escribiendo…
                  </p>
                )}
              </>
            ) : loading ? (
              <p className="text-xs text-[var(--text-subtle)]">Cargando conversación…</p>
            ) : mensajes.length === 0 ? (
              <p className="text-xs text-[var(--text-subtle)] max-w-md">
                Aún no hay mensajes con tu nutriólogo. Escribe tu consulta; la responderá en sus revisiones (no es en tiempo real).
              </p>
            ) : (
              mensajes.map((msg) => {
                const isUser = msg.remitente === 'usuario';
                // Solo los mensajes ya guardados (id real) se pueden modificar.
                const guardado = !msg.id.startsWith('local-');
                const editando = editandoId === msg.id;
                return (
                  <div key={msg.id} className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}>
                    <div
                      className={`max-w-[85%] sm:max-w-[70%] rounded-2xl px-4 py-3 text-xs sm:text-sm leading-relaxed shadow-xs ${
                        isUser
                          ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-br-none'
                          : 'bg-[var(--surface-raised)] text-[var(--text)] border border-[var(--border-subtle)] rounded-bl-none'
                      }`}
                    >
                      {editando ? (
                        <EditorMensaje
                          inicial={msg.contenido}
                          guardando={guardandoEdicion}
                          onCancelar={() => setEditandoId(null)}
                          onGuardar={(t) => guardarEdicion(msg.id, t)}
                        />
                      ) : (
                        <p className="whitespace-pre-line">{msg.contenido}</p>
                      )}
                      <div
                        className={`text-[10px] mt-1.5 flex flex-wrap items-center justify-end gap-x-2 gap-y-1 ${
                          isUser ? 'text-emerald-100' : 'text-[var(--text-subtle)]'
                        }`}
                      >
                        {isUser && guardado && !editando && (
                          <AccionesMensaje
                            creadoIso={msg.creado_en}
                            ahoraMs={ahoraMs}
                            onEditar={() => {
                              setErrorMensaje(null);
                              setEditandoId(msg.id);
                            }}
                            onEliminar={() => eliminarMensaje(msg.id)}
                          />
                        )}
                        {msg.editado_en && <span className="italic">editado</span>}
                        <span>
                          {msg.creado_en && msg.creado_en.length > 8
                            ? new Date(msg.creado_en).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })
                            : msg.creado_en || 'Hoy'}
                        </span>
                        {isUser && <CheckCheck className="w-3 h-3" />}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
            {errorMensaje && canal === 'nutriologo' && (
              <p role="alert" className="text-xs font-bold text-[var(--danger-text,#b91c1c)]">
                {errorMensaje}
              </p>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Atajos rápidos */}
          <div className="px-4 py-2 border-t border-[var(--border)] bg-[var(--surface-raised)] flex items-center gap-2 overflow-x-auto text-xs whitespace-nowrap shrink-0">
            <span className="text-[11px] font-semibold text-[var(--text-subtle)] flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              Consultas habituales:
            </span>
            {preguntas.map((p) => (
              <button
                key={p}
                onClick={() => setNuevoMensaje(p)}
                className="px-3 py-1.5 rounded-full bg-[var(--surface)] border border-[var(--border)] hover:border-[var(--primary)] text-[var(--text)] transition-colors cursor-pointer min-h-[32px]"
              >
                {p}
              </button>
            ))}
          </div>

          {/* Formulario de Entrada */}
          <form
            onSubmit={handleSend}
            className="p-3 sm:p-4 border-t border-[var(--border)] bg-[var(--surface)] flex items-center gap-3 shrink-0"
          >
            <input
              type="text"
              value={nuevoMensaje}
              maxLength={canal === 'ia' ? 1000 : 2000}
              onChange={(e) => setNuevoMensaje(e.target.value)}
              placeholder={canal === 'ia' ? 'Pregunta algo sobre tu plan…' : 'Escribe tu consulta nutricional...'}
              className="flex-1 bg-[var(--surface-raised)] border border-[var(--border)] rounded-2xl px-4 py-3 text-xs sm:text-sm text-[var(--text)] placeholder-[var(--text-subtle)] focus:outline-none focus:border-[var(--primary)] transition-all min-h-[44px]"
            />
            <button
              type="submit"
              disabled={enviando || escribiendoIA || !nuevoMensaje.trim()}
              aria-label="Enviar mensaje"
              className="w-12 h-12 rounded-2xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 text-white flex items-center justify-center shadow-md shadow-emerald-950/20 transition-all shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-emerald-500 min-h-[44px] min-w-[44px]"
            >
              <Send className="w-5 h-5" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
