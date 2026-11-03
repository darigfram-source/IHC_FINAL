'use client';

import React from 'react';
import { useNutriMasa } from '@/lib/NutriMasaContext';
import {
  Users,
  MessageSquare,
  FileText,
  BookOpen,
  Dumbbell,
  ShieldCheck,
  LogOut,
  RotateCcw,
  Smartphone,
  ExternalLink,
} from 'lucide-react';
import Link from 'next/link';

export const Sidebar: React.FC = () => {
  const {
    activeTab,
    setActiveTab,
    logout,
    resetToInitial,
    setIsLegalModalOpen,
    mensajes,
    usuarios,
  } = useNutriMasa();

  // Contar mensajes no leídos del nutriólogo
  const unreadMessagesCount = mensajes.filter(
    (m) => m.remitente === 'usuario' && !m.leido
  ).length;

  // Contar alertas en usuarios
  const alertCount = usuarios.filter((u) => u.estado !== 'En progreso').length;

  return (
    <aside className="w-64 bg-[#0a1a14] text-white flex flex-col h-screen select-none shrink-0 border-r border-[#153428] shadow-xl">
      {/* Brand Header */}
      <div className="p-5 border-b border-[#16382a] bg-gradient-to-b from-[#0f281e] to-[#0a1a14]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center shadow-lg shadow-emerald-950/50 border border-emerald-400/30">
            <Dumbbell className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-lg tracking-tight text-white">NutriMasa</span>
              <span className="text-[10px] font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-1.5 py-0.2 rounded">
                PRO
              </span>
            </div>
            <p className="text-[11px] text-emerald-300/80 font-medium">Panel del Especialista</p>
          </div>
        </div>
      </div>



      {/* Navigation Sections */}
      <div className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
        <div className="px-3 pb-2 text-[10px] font-bold uppercase tracking-widest text-emerald-300/50">
          Panel
        </div>

        {/* 1. Usuarios */}
        <button
          onClick={() => setActiveTab('usuarios')}
          className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-lg text-sm font-medium transition-all ${
            activeTab === 'usuarios'
              ? 'bg-emerald-600 text-white shadow-md shadow-emerald-950/40 font-semibold'
              : 'text-emerald-100/80 hover:bg-[#122e23] hover:text-white'
          }`}
        >
          <div className="flex items-center gap-3">
            <Users className="w-4 h-4" />
            <span>Usuarios</span>
          </div>
          {alertCount > 0 && (
            <span
              className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                activeTab === 'usuarios'
                  ? 'bg-emerald-800 text-emerald-100'
                  : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
              }`}
            >
              {alertCount} alert.
            </span>
          )}
        </button>

        {/* 2. Mensajes */}
        <button
          onClick={() => setActiveTab('mensajes')}
          className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-lg text-sm font-medium transition-all ${
            activeTab === 'mensajes'
              ? 'bg-emerald-600 text-white shadow-md shadow-emerald-950/40 font-semibold'
              : 'text-emerald-100/80 hover:bg-[#122e23] hover:text-white'
          }`}
        >
          <div className="flex items-center gap-3">
            <MessageSquare className="w-4 h-4" />
            <span>Mensajes</span>
          </div>
          {unreadMessagesCount > 0 && (
            <span className="bg-rose-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
              {unreadMessagesCount}
            </span>
          )}
        </button>

        {/* 3. Reportes */}
        <button
          onClick={() => setActiveTab('reportes')}
          className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-lg text-sm font-medium transition-all ${
            activeTab === 'reportes'
              ? 'bg-emerald-600 text-white shadow-md shadow-emerald-950/40 font-semibold'
              : 'text-emerald-100/80 hover:bg-[#122e23] hover:text-white'
          }`}
        >
          <div className="flex items-center gap-3">
            <FileText className="w-4 h-4" />
            <span>Reportes</span>
          </div>
          <span className="text-[10px] text-emerald-300/40 font-semibold">PDF</span>
        </button>

        {/* 4. Biblioteca */}
        <button
          onClick={() => setActiveTab('biblioteca')}
          className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-lg text-sm font-medium transition-all ${
            activeTab === 'biblioteca'
              ? 'bg-emerald-600 text-white shadow-md shadow-emerald-950/40 font-semibold'
              : 'text-emerald-100/80 hover:bg-[#122e23] hover:text-white'
          }`}
        >
          <div className="flex items-center gap-3">
            <BookOpen className="w-4 h-4" />
            <span>Biblioteca</span>
          </div>
          <span className="text-[10px] text-emerald-300/60 font-semibold">Ciencia</span>
        </button>

        {/* Sección de cumplimiento normativo */}
        <div className="pt-6 pb-2 px-3 text-[10px] font-bold uppercase tracking-widest text-emerald-300/50">
          Normativa de Salud
        </div>
        <button
          onClick={() => setIsLegalModalOpen(true)}
          className="w-full flex items-center gap-3 px-3.5 py-2 rounded-lg text-xs text-emerald-200/70 hover:bg-[#122e23] hover:text-white transition-all text-left"
        >
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>Aviso LFPDPPP & Salud</span>
        </button>
      </div>

      {/* Footer del Nutriólogo (Actualizado a Nutriólogo Admin y CED-ADMIN-001) */}
      <div className="p-3.5 border-t border-[#16382a] bg-[#0c1f18]">
        <div className="flex items-center gap-3 mb-3 p-2 bg-[#122e23] rounded-lg border border-[#1b4333]">
          <div className="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-300 flex items-center justify-center font-bold text-xs border border-emerald-400/30">
            AD
          </div>
          <div className="overflow-hidden">
            <p className="text-xs font-semibold text-white truncate">
              Nutriólogo Admin
            </p>
            <p className="text-[10px] text-emerald-300/70 truncate">
              Céd. CED-ADMIN-001
            </p>
          </div>
        </div>

        <div className="flex items-center justify-between gap-1 text-[11px] text-emerald-300/60">
          <button
            onClick={resetToInitial}
            title="Restablecer datos predeterminados"
            className="flex items-center gap-1.5 px-2 py-1.5 hover:bg-[#16382a] rounded hover:text-emerald-200 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reiniciar demo</span>
          </button>
          <button
            onClick={logout}
            title="Cerrar sesión"
            className="flex items-center gap-1.5 px-2 py-1.5 hover:bg-rose-950/40 text-rose-300/80 hover:text-rose-200 rounded transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Salir</span>
          </button>
        </div>
      </div>
    </aside>
  );
};
