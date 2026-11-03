'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  MessageSquare,
  Send,
  AlertTriangle,
  UserCheck,
  Clock,
  Sparkles,
  ShieldAlert,
  Info,
} from 'lucide-react';

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
          // Mensaje de bienvenida inicial
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
    <div className="flex flex-col h-full bg-slate-100">
      {/* 1. Header del Chat con Especialista (Figura 6) */}
      <div className="bg-white border-b border-slate-200 px-4 py-3 flex items-center justify-between shrink-0 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-10 h-10 rounded-2xl bg-emerald-700 text-white flex items-center justify-center font-bold text-sm shadow-md">
              ND
            </div>
            <div className="w-3 h-3 rounded-full bg-emerald-500 border-2 border-white absolute -bottom-0.5 -right-0.5"></div>
          </div>
          <div>
            <div className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
              <span>Nutriólogo Deportivo</span>
              <span className="text-[10px] text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded font-semibold border border-emerald-200">
                Especialista
              </span>
            </div>
            <p className="text-[11px] text-slate-500 flex items-center gap-1">
              <Clock className="w-3 h-3 text-slate-400" />
              Responde habitualmente en &lt; 24h
            </p>
          </div>
        </div>
      </div>

      {/* 2. NOTA FIJA OBLIGATORIA: Advertencia de no urgencia médica (Figura 6) */}
      <div className="bg-amber-500/15 border-b border-amber-500/30 px-3.5 py-2 text-amber-900 text-[11px] flex items-center gap-2 shrink-0 select-none">
        <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0" />
        <span className="leading-tight">
          <strong>Aviso Importante:</strong> Este chat es de seguimiento nutricional asíncrono. No es en tiempo real ni atiende urgencias médicas.
        </span>
      </div>

      {/* 3. Área de Mensajes con Scroll */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {mensajes.map((msg) => {
          const isUser = msg.remitente === 'usuario';

          return (
            <div
              key={msg.id}
              className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}
            >
              <div
                className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-xs shadow-sm leading-relaxed ${
                  isUser
                    ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-br-none'
                    : 'bg-white text-slate-800 border border-slate-200 rounded-bl-none'
                }`}
              >
                <p>{msg.contenido}</p>
                <div
                  className={`text-[9px] mt-1 text-right ${
                    isUser ? 'text-emerald-100' : 'text-slate-400'
                  }`}
                >
                  {msg.creado_en || 'Hoy'}
                </div>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* 4. Sugerencias Rápidas de Dudas Nutricionales */}
      <div className="px-3 py-1.5 bg-slate-50 border-t border-slate-200 flex items-center gap-1.5 overflow-x-auto text-[10px] whitespace-nowrap no-scrollbar shrink-0">
        <span className="text-slate-400 font-semibold flex items-center gap-1">
          <Sparkles className="w-3 h-3 text-amber-500" />
          Dudas frecuentes:
        </span>
        <button
          onClick={() => enviarPreguntaRapida('¿En qué momento del día es mejor tomar los 5g de creatina?')}
          className="px-2.5 py-1 rounded-full bg-white border border-slate-200 text-slate-700 hover:border-emerald-500 transition-colors"
        >
          ¿Timing de creatina?
        </button>
        <button
          onClick={() => enviarPreguntaRapida('¿Qué suplemento o colación puedo tomar si me faltan 30g de proteína hoy?')}
          className="px-2.5 py-1 rounded-full bg-white border border-slate-200 text-slate-700 hover:border-emerald-500 transition-colors"
        >
          ¿Falta de proteína hoy?
        </button>
        <button
          onClick={() => enviarPreguntaRapida('Sentí fatiga al final de la rutina de piernas con las series pesadas.')}
          className="px-2.5 py-1 rounded-full bg-white border border-slate-200 text-slate-700 hover:border-emerald-500 transition-colors"
        >
          Fatiga en sentadilla
        </button>
      </div>

      {/* 5. Input de Envío */}
      <form
        onSubmit={handleSend}
        className="p-3 bg-white border-t border-slate-200 flex items-center gap-2 shrink-0"
      >
        <input
          type="text"
          value={nuevoMensaje}
          onChange={(e) => setNuevoMensaje(e.target.value)}
          placeholder="Escribe tu consulta nutricional..."
          className="flex-1 bg-slate-100 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-emerald-500 focus:bg-white transition-all"
        />
        <button
          type="submit"
          disabled={enviando || !nuevoMensaje.trim()}
          className="w-9 h-9 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 text-white flex items-center justify-center shadow-sm transition-colors shrink-0"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
}
