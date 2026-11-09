'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  MessageSquare,
  Send,
  AlertTriangle,
  Clock,
  Sparkles,
  ShieldAlert,
  Info,
  UserCheck,
  CheckCheck,
} from 'lucide-react';
import { PacienteTopBar } from '@/components/paciente/PacienteNavigation';

interface Mensaje {
  id: string;
  usuario_id: string;
  remitente: 'usuario' | 'nutriologo';
  contenido: string;
  tipo?: string;
  creado_en?: string;
}

export default function PacienteChatPage() {
  const [mensajes, setMensajes] = useState<Mensaje[]>([]);
  const [nuevoMensaje, setNuevoMensaje] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    async function loadChat() {
      try {
        const res = await fetch('/api/paciente/chat');
        const json = await res.json();
        if (json.success && json.data && json.data.length > 0) {
          setMensajes(json.data);
        } else {
          // Mensajes iniciales de bienvenida
          setMensajes([
            {
              id: 'init-1',
              usuario_id: 'paciente',
              remitente: 'nutriologo',
              contenido:
                '¡Hola! Soy tu nutriólogo deportivo asignado. Estaré supervisando tus registros diarios de peso en ayunas, volumen y progresión de cargas. Cualquier duda sobre tu superávit (+400 kcal) o tu distribución de proteína (1.6–1.8 g/kg), escríbela aquí.',
              creado_en: '10:00 AM',
            },
            {
              id: 'init-2',
              usuario_id: 'paciente',
              remitente: 'nutriologo',
              contenido:
                'Recuerda que este canal es de consulta asíncrona; respondo habitualmente en las revisiones matutinas y vespertinas.',
              creado_en: '10:01 AM',
            },
          ]);
        }
      } catch (e) {
        console.error('Error cargando chat:', e);
      } finally {
        setLoading(false);
      }
    }
    loadChat();
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [mensajes]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nuevoMensaje.trim() || enviando) return;

    const texto = nuevoMensaje.trim();
    setNuevoMensaje('');
    setEnviando(true);

    const tempMsg: Mensaje = {
      id: `local-${Date.now()}`,
      usuario_id: 'paciente',
      remitente: 'usuario',
      contenido: texto,
      creado_en: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMensajes((prev) => [...prev, tempMsg]);

    try {
      const res = await fetch('/api/paciente/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contenido: texto }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        console.warn('Error sincronizando mensaje con BD, se mantiene en memoria.');
      }
    } catch (e) {
      console.error('Error al enviar mensaje:', e);
    } finally {
      setEnviando(false);
    }
  };

  const enviarPreguntaRapida = (pregunta: string) => {
    setNuevoMensaje(pregunta);
  };

  return (
    <div className="w-full flex flex-col h-[calc(100vh-4rem)] md:h-screen">
      <PacienteTopBar
        titulo="Consulta con Especialista"
        subtitulo="Mensajería asíncrona deportiva"
        badge="Nutriólogo Asignado"
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

      {/* CONTENEDOR PRINCIPAL DEL CHAT (Adaptable a pantallas grandes) */}
      <div className="flex-1 max-w-5xl w-full mx-auto p-4 sm:p-6 flex flex-col min-h-0 overflow-hidden">
        {/* Tarjeta del Chat con Bordes y Superficie Adaptable */}
        <div className="flex-1 rounded-3xl bg-[var(--surface)] border border-[var(--border)] shadow-[var(--shadow-sm)] flex flex-col min-h-0 overflow-hidden">
          {/* Header del Chat */}
          <div className="px-5 py-3.5 border-b border-[var(--border)] bg-[var(--surface-raised)] flex items-center justify-between shrink-0">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-10 h-10 rounded-2xl bg-emerald-600 text-white flex items-center justify-center font-bold text-sm shadow-sm">
                  ND
                </div>
                <div className="w-3 h-3 rounded-full bg-emerald-500 border-2 border-[var(--surface)] absolute -bottom-0.5 -right-0.5" />
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-sm font-bold text-[var(--text)]">Nutriólogo Deportivo</h2>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[var(--primary-surface)] text-[var(--primary-text)] border border-[var(--primary-border)]">
                    Especialista Acreditado
                  </span>
                </div>
                <p className="text-xs text-[var(--text-subtle)] flex items-center gap-1 mt-0.5">
                  <Clock className="w-3 h-3" />
                  Horario habitual de respuesta: &lt; 24h
                </p>
              </div>
            </div>

            <div className="hidden sm:flex items-center gap-2 text-xs text-[var(--text-subtle)]">
              <UserCheck className="w-4 h-4 text-[var(--primary)]" />
              <span>Cédula Profesional Validada</span>
            </div>
          </div>

          {/* Área de Mensajes */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
            {mensajes.map((msg) => {
              const isUser = msg.remitente === 'usuario';

              return (
                <div
                  key={msg.id}
                  className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}
                >
                  <div
                    className={`max-w-[85%] sm:max-w-[70%] rounded-2xl px-4 py-3 text-xs sm:text-sm leading-relaxed shadow-xs ${
                      isUser
                        ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-br-none'
                        : 'bg-[var(--surface-raised)] text-[var(--text)] border border-[var(--border-subtle)] rounded-bl-none'
                    }`}
                  >
                    <p className="whitespace-pre-line">{msg.contenido}</p>
                    <div
                      className={`text-[10px] mt-1.5 flex items-center justify-end gap-1 ${
                        isUser ? 'text-emerald-100' : 'text-[var(--text-subtle)]'
                      }`}
                    >
                      <span>{msg.creado_en || 'Hoy'}</span>
                      {isUser && <CheckCheck className="w-3 h-3" />}
                    </div>
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>

          {/* Preguntas Frecuentes / Atajos Rápidos */}
          <div className="px-4 py-2 border-t border-[var(--border)] bg-[var(--surface-raised)] flex items-center gap-2 overflow-x-auto text-xs whitespace-nowrap shrink-0">
            <span className="text-[11px] font-semibold text-[var(--text-subtle)] flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              Consultas habituales:
            </span>
            <button
              onClick={() => enviarPreguntaRapida('¿En qué momento del día es mejor tomar los 5g de creatina?')}
              className="px-3 py-1.5 rounded-full bg-[var(--surface)] border border-[var(--border)] hover:border-[var(--primary)] text-[var(--text)] transition-colors cursor-pointer min-h-[32px]"
            >
              ¿Timing de creatina?
            </button>
            <button
              onClick={() => enviarPreguntaRapida('¿Qué colación puedo ingerir si me faltan 25g de proteína hoy?')}
              className="px-3 py-1.5 rounded-full bg-[var(--surface)] border border-[var(--border)] hover:border-[var(--primary)] text-[var(--text)] transition-colors cursor-pointer min-h-[32px]"
            >
              ¿Falta de proteína hoy?
            </button>
            <button
              onClick={() => enviarPreguntaRapida('Sentí fatiga articular en la última serie pesada de sentadilla.')}
              className="px-3 py-1.5 rounded-full bg-[var(--surface)] border border-[var(--border)] hover:border-[var(--primary)] text-[var(--text)] transition-colors cursor-pointer min-h-[32px]"
            >
              Fatiga en sentadilla
            </button>
          </div>

          {/* Formulario de Entrada */}
          <form
            onSubmit={handleSend}
            className="p-3 sm:p-4 border-t border-[var(--border)] bg-[var(--surface)] flex items-center gap-3 shrink-0"
          >
            <input
              type="text"
              value={nuevoMensaje}
              onChange={(e) => setNuevoMensaje(e.target.value)}
              placeholder="Escribe tu consulta nutricional..."
              className="flex-1 bg-[var(--surface-raised)] border border-[var(--border)] rounded-2xl px-4 py-3 text-xs sm:text-sm text-[var(--text)] placeholder-[var(--text-subtle)] focus:outline-none focus:border-[var(--primary)] transition-all min-h-[44px]"
            />
            <button
              type="submit"
              disabled={enviando || !nuevoMensaje.trim()}
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
