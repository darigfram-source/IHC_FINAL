'use client';

import React, { useRef, useState } from 'react';
import { useNutriMasa } from '@/lib/NutriMasaContext';
import { AccionesMensaje, EditorMensaje, useAhora } from '@/components/AccionesMensaje';
import { SugerenciasRespuesta } from '@/components/SugerenciasRespuesta';
import {
  Send,
  AlertTriangle,
  Clock,
  Sparkles,
  CheckCheck,
  Dumbbell,
  Pill,
  Wheat,
  ShieldCheck,
  User,
} from 'lucide-react';

export const ChatView: React.FC = () => {
  const {
    usuarios,
    selectedUsuarioId,
    setSelectedUsuarioId,
    selectedUsuario,
    mensajes,
    enviarMensaje,
    editarMensaje,
    eliminarMensaje,
    setIsAdjustModalOpen,
    modoReal,
  } = useNutriMasa();

  const [inputTexto, setInputTexto] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const ahoraMs = useAhora();
  const [editandoId, setEditandoId] = useState<string | null>(null);
  const [guardandoEdicion, setGuardandoEdicion] = useState(false);
  const [errorMensaje, setErrorMensaje] = useState<string | null>(null);

  const guardarEdicion = async (id: string, texto: string) => {
    setGuardandoEdicion(true);
    const err = await editarMensaje(id, texto);
    setGuardandoEdicion(false);
    if (err) setErrorMensaje(err);
    else {
      setErrorMensaje(null);
      setEditandoId(null);
    }
  };

  const quitarMensaje = async (id: string) => {
    if (!window.confirm('¿Eliminar este mensaje? El paciente ya no lo verá.')) return;
    const err = await eliminarMensaje(id);
    setErrorMensaje(err);
  };

  // Mensajes correspondientes al usuario seleccionado
  const userMessages = mensajes.filter((m) => m.usuario_id === selectedUsuarioId);

  const handleSend = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputTexto.trim()) return;
    enviarMensaje(inputTexto, 'texto', selectedUsuarioId);
    setInputTexto('');
  };

  // Plantillas clínicas rápidas basadas en evidencia (Urdampilleta 2012, Morton 2018)
  const enviarPlantilla = (texto: string, tipo: 'sugerencia_suplementacion' | 'ajuste_plan' | 'texto') => {
    enviarMensaje(texto, tipo, selectedUsuarioId);
  };

  return (
    <div className="flex-1 flex bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden h-[calc(100vh-6.5rem)]">
      {/* Columna Izquierda: Lista de Pacientes para Chat */}
      <div className="w-72 border-r border-slate-200 bg-slate-50/50 flex flex-col shrink-0">
        <div className="p-3.5 border-b border-slate-200 bg-white">
          <h3 className="font-bold text-sm text-slate-800">Mensajes Asíncronos</h3>
          <p className="text-[11px] text-slate-400">Canal de supervisión con pacientes</p>
        </div>

        <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
          {usuarios.map((u) => {
            const isSelected = u.id === selectedUsuarioId;
            const ultMensaje = mensajes
              .filter((m) => m.usuario_id === u.id)
              .slice(-1)[0];

            return (
              <button
                key={u.id}
                onClick={() => setSelectedUsuarioId(u.id)}
                className={`w-full text-left p-3 flex items-start gap-3 transition-colors ${
                  isSelected ? 'bg-emerald-50/90 border-l-4 border-emerald-600' : 'hover:bg-slate-100/60'
                }`}
              >
                <div
                  className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                    isSelected ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-700'
                  }`}
                >
                  {u.nombre.substring(0, 2).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="font-semibold text-xs text-slate-900 truncate">{u.nombre}</p>
                    <span className="text-[10px] text-slate-400 shrink-0">
                      {ultMensaje ? ultMensaje.creado_en.slice(11, 16) : ''}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 truncate mt-0.5">
                    {ultMensaje ? ultMensaje.contenido : 'Sin mensajes previos'}
                  </p>
                  <div className="mt-1 flex items-center gap-1.5">
                    <span
                      className={`text-[9px] font-bold px-1.5 py-0.2 rounded-full ${
                        u.estado === 'En progreso'
                          ? 'bg-emerald-100 text-emerald-800'
                          : u.estado === 'Estancado'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-rose-100 text-rose-800'
                      }`}
                    >
                      {u.estado}
                    </span>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Columna Derecha: Conversación Activa */}
      <div className="flex-1 flex flex-col bg-slate-50/30">
        {/* Header del Chat */}
        <div className="p-3.5 bg-white border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-sm border border-emerald-300">
              {selectedUsuario?.nombre.substring(0, 2).toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="font-bold text-sm text-slate-900">{selectedUsuario?.nombre}</h4>
                <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-medium">
                  {selectedUsuario?.peso_actual} kg • {selectedUsuario?.nivel_entrenamiento}
                </span>
              </div>
              <p className="text-[11px] text-slate-500">
                Plan activo: <span className="font-semibold text-emerald-700">+{selectedUsuario?.superavit_kcal} kcal</span> | Proteína: <span className="font-semibold text-emerald-700">{selectedUsuario?.proteina_g_kg} g/kg</span>
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsAdjustModalOpen(true)}
            className="px-3 py-1.5 text-xs font-semibold bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 rounded-lg transition-colors"
          >
            Ajustar Plan Nutricional
          </button>
        </div>

        {/* AVISO LEGAL FIJO Y OBLIGATORIO (Especificado en Requerimiento 9 y Figura 6) */}
        <div className="bg-amber-50/90 border-b border-amber-200/90 px-4 py-2.5 flex items-center gap-2.5 text-xs text-amber-900 shadow-2xs">
          <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
          <p className="font-medium">
            <strong>Aviso de servicio:</strong> Este chat no es en tiempo real ni sirve para urgencias médicas. Si tienes síntomas adversos o condiciones agudas, acude de inmediato con un médico o servicio hospitalario.
          </p>
        </div>

        {/* Historial de Mensajes */}
        <div className="flex-1 p-4 overflow-y-auto space-y-3">
          {userMessages.length === 0 ? (
            <div className="text-center py-12 text-slate-400 text-xs">
              No hay mensajes aún en la conversación con este paciente.
            </div>
          ) : (
            userMessages.map((msg) => {
              const esNutriologo = msg.remitente === 'nutriologo';
              return (
                <div
                  key={msg.id}
                  className={`flex flex-col ${esNutriologo ? 'items-end' : 'items-start'}`}
                >
                  <div
                    className={`max-w-[70%] rounded-2xl px-4 py-2.5 text-xs shadow-2xs ${
                      esNutriologo
                        ? 'bg-[#14532d] text-white rounded-br-xs'
                        : 'bg-white text-slate-800 border border-slate-200 rounded-bl-xs'
                    }`}
                  >
                    {/* Badge especial si es ajuste o sugerencia */}
                    {msg.tipo === 'ajuste_plan' && (
                      <span className="inline-block text-[10px] font-bold uppercase tracking-wider bg-emerald-700 text-emerald-100 px-2 py-0.5 rounded mb-1">
                        Ajuste Nutricional Clínico
                      </span>
                    )}
                    {msg.tipo === 'sugerencia_suplementacion' && (
                      <span className="inline-block text-[10px] font-bold uppercase tracking-wider bg-teal-700 text-teal-100 px-2 py-0.5 rounded mb-1">
                        Sugerencia con Evidencia Científica
                      </span>
                    )}

                    {editandoId === msg.id ? (
                      <EditorMensaje
                        inicial={msg.contenido}
                        guardando={guardandoEdicion}
                        onCancelar={() => setEditandoId(null)}
                        onGuardar={(t) => guardarEdicion(msg.id, t)}
                      />
                    ) : (
                      <p className="leading-relaxed whitespace-pre-wrap">{msg.contenido}</p>
                    )}
                    <div
                      className={`text-[9px] mt-1.5 flex flex-wrap items-center justify-end gap-x-2 gap-y-1 ${
                        esNutriologo ? 'text-emerald-200/80' : 'text-slate-400'
                      }`}
                    >
                      {esNutriologo && editandoId !== msg.id && !msg.id.startsWith('tmp-') && (
                        <AccionesMensaje
                          creadoIso={msg.hora_iso}
                          ahoraMs={ahoraMs}
                          clase="text-emerald-100"
                          onEditar={() => {
                            setErrorMensaje(null);
                            setEditandoId(msg.id);
                          }}
                          onEliminar={() => quitarMensaje(msg.id)}
                        />
                      )}
                      {msg.editado_en && <span className="italic">editado</span>}
                      <span>{msg.creado_en}</span>
                      {esNutriologo && <CheckCheck className="w-3 h-3 text-emerald-300" />}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {errorMensaje && (
          <p role="alert" className="px-4 py-2 text-xs font-bold text-rose-700 bg-rose-50 border-t border-rose-200">
            {errorMensaje}
          </p>
        )}

        {/* Borradores de respuesta (IA o reglas): van a la caja de texto, nunca se envían solos */}
        {modoReal && selectedUsuarioId && (
          <SugerenciasRespuesta
            key={selectedUsuarioId}
            usuarioId={selectedUsuarioId}
            onUsar={(t) => {
              setInputTexto(t);
              inputRef.current?.focus();
            }}
          />
        )}

        {/* Barra de Respuestas Rápidas Basadas en Evidencia */}
        <div className="p-2.5 bg-slate-100/80 border-t border-slate-200 flex items-center gap-2 overflow-x-auto text-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 shrink-0">
            Sugerencias Clínicas:
          </span>

          {/* Plantilla 1: Creatina */}
          <button
            onClick={() =>
              enviarPlantilla(
                'Sí, puedes incorporar Creatina Monohidratada (3 a 5g al día constantes). Es el suplemento ergogénico con mayor evidencia científica para aumentar reservas de fosfocreatina en series pesadas.',
                'sugerencia_suplementacion'
              )
            }
            className="flex items-center gap-1.5 px-2.5 py-1 bg-white hover:bg-emerald-50 text-slate-700 hover:text-emerald-800 border border-slate-200 rounded-md shrink-0 text-xs transition-colors"
          >
            <Pill className="w-3.5 h-3.5 text-teal-600" />
            <span>Prescribir Creatina (5g/día)</span>
          </button>

          {/* Plantilla 2: Carbohidratos Peri-Entreno */}
          <button
            onClick={() =>
              enviarPlantilla(
                'Tu peso se ha mantenido estable. Te recomiendo concentrar 70g de carbohidratos 60-90 min antes de entrenar sentadilla para maximizar la repleción de glucógeno.',
                'ajuste_plan'
              )
            }
            className="flex items-center gap-1.5 px-2.5 py-1 bg-white hover:bg-emerald-50 text-slate-700 hover:text-emerald-800 border border-slate-200 rounded-md shrink-0 text-xs transition-colors"
          >
            <Wheat className="w-3.5 h-3.5 text-amber-600" />
            <span>Carbos Peri-Entreno</span>
          </button>

          {/* Plantilla 3: Alerta Proteica */}
          <button
            onClick={() =>
              enviarPlantilla(
                'Recuerda que tu meta de proteína es 1.7 g/kg. Evita sobrepasar los 2.0 g/kg, ya que la evidencia (Morton 2018) demuestra que no aporta mayor hipertrofia y aumenta la sobrecarga renal.',
                'texto'
              )
            }
            className="flex items-center gap-1.5 px-2.5 py-1 bg-white hover:bg-rose-50 text-slate-700 hover:text-rose-800 border border-slate-200 rounded-md shrink-0 text-xs transition-colors"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-rose-600" />
            <span>Tope Seguro Proteína</span>
          </button>
        </div>

        {/* Input Bar */}
        <form onSubmit={handleSend} className="p-3 bg-white border-t border-slate-200 flex items-center gap-3">
          <input
            ref={inputRef}
            type="text"
            value={inputTexto}
            onChange={(e) => setInputTexto(e.target.value)}
            placeholder={`Escribir mensaje asíncrono para ${selectedUsuario?.nombre || 'el paciente'}...`}
            className="flex-1 px-4 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-800"
          />
          <button
            type="submit"
            disabled={!inputTexto.trim()}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs"
          >
            <span>Enviar</span>
            <Send className="w-3.5 h-3.5" />
          </button>
        </form>
      </div>
    </div>
  );
};
