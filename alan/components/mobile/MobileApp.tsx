'use client';

import React, { useState } from 'react';
import { useNutriMasa } from '@/lib/NutriMasaContext';
import { MobileInicio } from './MobileInicio';
import { MobileRegistro } from './MobileRegistro';
import { MobileGraficas } from './MobileGraficas';
import { MobileChat } from './MobileChat';
import { MobileMenu } from './MobileMenu';
import { MobileElegibilidadModal } from './MobileElegibilidadModal';
import { ConsentModal } from '../ConsentModal';
import {
  Home,
  ClipboardEdit,
  TrendingUp,
  MessageSquare,
  Menu as MenuIcon,
  Smartphone,
  Laptop,
  Users,
  ChevronDown,
  Wifi,
  Battery,
} from 'lucide-react';
import Link from 'next/link';

export const MobileApp: React.FC = () => {
  const {
    usuarios,
    activePatientId,
    setActivePatientId,
    activePatient,
    mensajes,
  } = useNutriMasa();

  const [activeTab, setActiveTab] = useState<'inicio' | 'registro' | 'graficas' | 'chat' | 'menu'>('inicio');
  const [isElegibilidadOpen, setIsElegibilidadOpen] = useState(false);

  // Mensajes no leídos del nutriólogo para el paciente activo
  const unreadCount = mensajes.filter(
    (m) => m.usuario_id === activePatientId && m.remitente === 'nutriologo' && !m.leido
  ).length;

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col items-center justify-start p-0 sm:py-6">
      {/* Barra de Controles Superiores para Escritorio (Switcher de rol y selector de paciente) */}
      <div className="w-full max-w-md px-4 mb-3 flex items-center justify-between text-xs select-none">
        {/* Switcher a Panel de Escritorio */}
        <Link
          href="/"
          className="flex items-center gap-1.5 bg-emerald-600/30 hover:bg-emerald-600/50 text-emerald-300 border border-emerald-500/40 px-3 py-1.5 rounded-full font-bold transition-all"
        >
          <Laptop className="w-3.5 h-3.5" />
          <span>Panel Nutriólogo (Web)</span>
        </Link>

        {/* Selector de Paciente para Pruebas */}
        <div className="flex items-center gap-1.5 bg-slate-800 border border-slate-700 px-2.5 py-1 rounded-full">
          <span className="text-[10px] text-slate-400">Paciente:</span>
          <select
            value={activePatientId}
            onChange={(e) => setActivePatientId(e.target.value)}
            className="bg-transparent text-emerald-300 font-bold text-xs focus:outline-none cursor-pointer"
          >
            {usuarios.map((u) => (
              <option key={u.id} value={u.id} className="bg-slate-900 text-white">
                {u.nombre}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Contenedor del Móvil (Smartphone Mockup) */}
      <div className="w-full max-w-md bg-slate-50 text-slate-900 sm:rounded-3xl shadow-2xl sm:border sm:border-slate-300 overflow-hidden flex flex-col min-h-screen sm:min-h-[740px] sm:max-h-[820px]">
        {/* Barra de Estado Móvil */}
        <div className="h-6 bg-slate-100 px-5 flex items-center justify-between text-[11px] font-bold text-slate-600 select-none border-b border-slate-200">
          <span>9:41</span>
          <div className="flex items-center gap-2">
            <Wifi className="w-3 h-3 text-slate-600" />
            <Battery className="w-3.5 h-3.5 text-slate-600" />
          </div>
        </div>

        {/* Pantalla Activa con Scroll */}
        <div className="flex-1 overflow-y-auto">
          {activeTab === 'inicio' && (
            <MobileInicio
              onNavigateTab={(tab) => setActiveTab(tab)}
              onOpenElegibilidad={() => setIsElegibilidadOpen(true)}
            />
          )}

          {activeTab === 'registro' && (
            <MobileRegistro onSuccess={() => setActiveTab('graficas')} />
          )}

          {activeTab === 'graficas' && <MobileGraficas />}

          {activeTab === 'chat' && <MobileChat />}

          {activeTab === 'menu' && (
            <MobileMenu onOpenElegibilidad={() => setIsElegibilidadOpen(true)} />
          )}
        </div>

        {/* Barra de Navegación Inferior (Fiel a Figuras 3 a 7: Inicio, Registro, Gráficas, Chat, Menú) */}
        <nav className="h-16 bg-white border-t border-slate-200 flex items-center justify-around px-2 shrink-0 select-none z-20">
          {/* 1. Inicio */}
          <button
            onClick={() => setActiveTab('inicio')}
            className={`flex flex-col items-center justify-center w-14 py-1 transition-all ${
              activeTab === 'inicio' ? 'text-emerald-700 font-extrabold' : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            <Home className="w-5 h-5 mb-0.5" />
            <span className="text-[10px]">Inicio</span>
          </button>

          {/* 2. Registro */}
          <button
            onClick={() => setActiveTab('registro')}
            className={`flex flex-col items-center justify-center w-14 py-1 transition-all ${
              activeTab === 'registro' ? 'text-emerald-700 font-extrabold' : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            <ClipboardEdit className="w-5 h-5 mb-0.5" />
            <span className="text-[10px]">Registro</span>
          </button>

          {/* 3. Gráficas */}
          <button
            onClick={() => setActiveTab('graficas')}
            className={`flex flex-col items-center justify-center w-14 py-1 transition-all ${
              activeTab === 'graficas' ? 'text-emerald-700 font-extrabold' : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            <TrendingUp className="w-5 h-5 mb-0.5" />
            <span className="text-[10px]">Gráficas</span>
          </button>

          {/* 4. Chat */}
          <button
            onClick={() => setActiveTab('chat')}
            className={`flex flex-col items-center justify-center w-14 py-1 transition-all relative ${
              activeTab === 'chat' ? 'text-emerald-700 font-extrabold' : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            <div className="relative">
              <MessageSquare className="w-5 h-5 mb-0.5" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-white"></span>
              )}
            </div>
            <span className="text-[10px]">Chat</span>
          </button>

          {/* 5. Menú */}
          <button
            onClick={() => setActiveTab('menu')}
            className={`flex flex-col items-center justify-center w-14 py-1 transition-all ${
              activeTab === 'menu' ? 'text-emerald-700 font-extrabold' : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            <MenuIcon className="w-5 h-5 mb-0.5" />
            <span className="text-[10px]">Menú</span>
          </button>
        </nav>
      </div>

      {/* Modales */}
      <MobileElegibilidadModal
        isOpen={isElegibilidadOpen}
        onClose={() => setIsElegibilidadOpen(false)}
      />
      <ConsentModal />
    </div>
  );
};
