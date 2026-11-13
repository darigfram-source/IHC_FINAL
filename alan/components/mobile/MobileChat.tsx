'use client';

import React, { useState } from 'react';
import { useNutriMasa } from '@/lib/NutriMasaContext';
import {
  Send,
  AlertTriangle,
  CheckCheck,
  User,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';

export const MobileChat: React.FC = () => {
  const { activePatient, mensajes, enviarMensajePaciente, nutriologo } = useNutriMasa();
  const [nuevoTexto, setNuevoTexto] = useState('');

  if (!activePatient) return null;

  const chatMessages = mensajes.filter((m) => m.usuario_id === activePatient.id);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nuevoTexto.trim()) return;

    enviarMensajePaciente(nuevoTexto, activePatient.id);
    setNuevoTexto('');
  };

  return (
    <div className="flex flex-col h-[calc(100vh-8.5rem)] text-slate-800">
      {/* Encabezado (Figura 6: "Tu nutriólogo") */}
      <div className="p-3.5 bg-white border-b border-slate-200 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-full bg-emerald-700 text-white flex items-center justify-center font-bold text-xs">
            AD
          </div>
          <div>
            <h2 className="text-sm font-extrabold text-slate-900 leading-tight">
              Tu nutriólogo
            </h2>
            <p className="text-[10px] text-emerald-700 font-semibold">
              {nutriologo?.nombre || 'Nutriólogo Admin'} • {nutriologo?.cedula_profesional}
            </p>
          </div>
        </div>
      </div>

      {/* AVISO FIJO OBLIGATORIO (Fiel a Figura 6: "Este chat no es en tiempo real y no sirve para urgencias...") */}
      <div className="bg-amber-50 border-b border-amber-200 px-3.5 py-2.5 flex items-center gap-2 text-xs text-amber-900 shrink-0">
        <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
        <p className="text-[11px] font-medium leading-tight">
          Este chat no es en tiempo real y no sirve para urgencias. Si tienes síntomas, acude con un profesional de la salud.
        </p>
      </div>

      {/* Lista de Mensajes */}
      <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-slate-100/60">
        {chatMessages.length === 0 ? (
          <div className="text-center py-10 text-slate-400 text-xs">
            Inicia una conversación con tu especialista para resolver dudas o solicitar pautas de suplementación.
          </div>
        ) : (
          chatMessages.map((msg) => {
            const esNutri = msg.remitente === 'nutriologo';
            return (
              <div
                key={msg.id}
                className={`flex flex-col ${esNutri ? 'items-start' : 'items-end'}`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-xs shadow-2xs leading-relaxed ${
                    esNutri
                      ? 'bg-white text-slate-800 border border-slate-200 rounded-bl-xs'
                      : 'bg-[#14532d] text-white rounded-br-xs'
                  }`}
                >
                  {msg.tipo === 'ajuste_plan' && (
                    <span className="inline-block text-[9px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800 px-1.5 py-0.2 rounded mb-1">
                      Ajuste de tu Nutriólogo
                    </span>
                  )}
                  {msg.tipo === 'sugerencia_suplementacion' && (
                    <span className="inline-block text-[9px] font-bold uppercase tracking-wider bg-teal-100 text-teal-800 px-1.5 py-0.2 rounded mb-1">
                      Sugerencia con Evidencia
                    </span>
                  )}

                  <p className="whitespace-pre-wrap">{msg.contenido}</p>

                  <div
                    className={`text-[9px] mt-1 flex items-center justify-end gap-1 ${
                      esNutri ? 'text-slate-400' : 'text-emerald-200/80'
                    }`}
                  >
                    <span>{msg.creado_en.slice(11, 16) || 'Reciente'}</span>
                    {!esNutri && <CheckCheck className="w-3 h-3 text-emerald-300" />}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Barra de Entrada (Figura 6: "Escribe tu mensaje" [Enviar]) */}
      <form
        onSubmit={handleSend}
        className="p-3 bg-white border-t border-slate-200 flex items-center gap-2 shrink-0"
      >
        <input
          type="text"
          value={nuevoTexto}
          onChange={(e) => setNuevoTexto(e.target.value)}
          placeholder="Escribe tu mensaje..."
          className="flex-1 px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-800"
        />
        <button
          type="submit"
          disabled={!nuevoTexto.trim()}
          className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition-all shadow-xs shrink-0"
        >
          Enviar
        </button>
      </form>
    </div>
  );
};
