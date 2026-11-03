'use client';

import React, { useState } from 'react';
import { useNutriMasa } from '@/lib/NutriMasaContext';
import { ArticuloEducativo } from '@/lib/types';
import {
  User,
  Target,
  BookOpen,
  FileText,
  Bell,
  ShieldCheck,
  HelpCircle,
  LogOut,
  ChevronRight,
  X,
  Quote,
  Clock,
  ExternalLink,
} from 'lucide-react';
import Link from 'next/link';

interface MobileMenuProps {
  onOpenElegibilidad: () => void;
}

export const MobileMenu: React.FC<MobileMenuProps> = ({ onOpenElegibilidad }) => {
  const {
    activePatient,
    articulos,
    reportes,
    setIsLegalModalOpen,
    logout,
  } = useNutriMasa();

  const [selectedArticulo, setSelectedArticulo] = useState<ArticuloEducativo | null>(null);
  const [subView, setSubView] = useState<'menu' | 'biblioteca' | 'reportes'>('menu');

  if (!activePatient) return null;

  // Filtrar solo artículos marcados como visibles en la app
  const visibleArticles = articulos.filter((a) => a.visible_en_app);
  const patientReports = reportes.filter((r) => r.usuario_id === activePatient.id);

  if (subView === 'biblioteca') {
    return (
      <div className="p-4 space-y-3 text-slate-800">
        <div className="flex items-center justify-between border-b border-slate-200 pb-2">
          <button
            onClick={() => setSubView('menu')}
            className="text-xs font-bold text-emerald-700 hover:underline"
          >
            ← Volver al menú
          </button>
          <span className="text-xs font-black text-slate-900">Biblioteca Educativa</span>
        </div>

        <div className="space-y-3">
          {visibleArticles.map((art) => (
            <div
              key={art.id}
              onClick={() => setSelectedArticulo(art)}
              className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-2xs hover:border-emerald-300 cursor-pointer transition-all"
            >
              <div className="flex items-center justify-between text-[10px] mb-1">
                <span className="font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded">
                  {art.categoria}
                </span>
                <span className="text-slate-400 flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {art.tiempo_lectura_min} min
                </span>
              </div>
              <h4 className="font-bold text-xs text-slate-900 mt-1">{art.titulo}</h4>
              <p className="text-[11px] text-slate-500 mt-1 line-clamp-2">{art.resumen}</p>
            </div>
          ))}
        </div>

        {/* Modal de lectura de artículo */}
        {selectedArticulo && (
          <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl max-w-sm w-full p-5 shadow-2xl max-h-[85vh] overflow-y-auto">
              <div className="flex items-start justify-between border-b border-slate-100 pb-2 mb-3">
                <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded">
                  {selectedArticulo.categoria}
                </span>
                <button
                  onClick={() => setSelectedArticulo(null)}
                  className="p-1 rounded-full text-slate-400 hover:text-slate-700"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <h3 className="font-bold text-sm text-slate-900 mb-2">
                {selectedArticulo.titulo}
              </h3>
              <p className="text-xs text-slate-700 leading-relaxed whitespace-pre-line mb-4">
                {selectedArticulo.contenido_completo}
              </p>

              <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200 text-[10px] text-slate-500 italic">
                <Quote className="w-3 h-3 text-emerald-600 inline mr-1" />
                {selectedArticulo.citas_cientificas}
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  if (subView === 'reportes') {
    return (
      <div className="p-4 space-y-3 text-slate-800">
        <div className="flex items-center justify-between border-b border-slate-200 pb-2">
          <button
            onClick={() => setSubView('menu')}
            className="text-xs font-bold text-emerald-700 hover:underline"
          >
            ← Volver al menú
          </button>
          <span className="text-xs font-black text-slate-900">Reportes de tu Nutriólogo</span>
        </div>

        {patientReports.length === 0 ? (
          <div className="text-center py-10 text-slate-400 text-xs">
            Aún no se han emitido reportes periódicos para tu expediente.
          </div>
        ) : (
          patientReports.map((rep) => (
            <div
              key={rep.id}
              className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-2 text-xs"
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-900 capitalize">
                  Resumen {rep.periodo_tipo}
                </span>
                <span className="text-[10px] text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded">
                  {rep.adherencia_registro_pct}% Adherencia
                </span>
              </div>
              <p className="text-[11px] text-slate-600 leading-relaxed">
                {rep.evaluacion_clinica}
              </p>
              <div className="p-2.5 bg-slate-50 rounded-xl text-[11px] text-slate-700 font-medium">
                <strong>Pautas:</strong> {rep.recomendaciones_siguientes}
              </div>
            </div>
          ))
        )}
      </div>
    );
  }

  return (
    <div className="p-4 space-y-4 text-slate-800">
      {/* Encabezado (Figura 7: "Menú") */}
      <h2 className="text-xl font-black text-slate-900 tracking-tight">Menú</h2>

      {/* Tarjeta de Usuario Activo */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs flex items-center gap-3">
        <div className="w-11 h-11 rounded-full bg-emerald-600 text-white flex items-center justify-center font-black text-sm">
          {activePatient.nombre.substring(0, 2).toUpperCase()}
        </div>
        <div>
          <h3 className="font-extrabold text-sm text-slate-900">{activePatient.nombre}</h3>
          <p className="text-xs text-slate-500">
            {activePatient.peso_actual} kg • {activePatient.nivel_entrenamiento}
          </p>
        </div>
      </div>

      {/* Lista de Opciones del Menú (Fiel a la Figura 7 del PDF) */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden divide-y divide-slate-100 text-xs font-semibold">
        {/* 1. Mi perfil y datos */}
        <button
          onClick={onOpenElegibilidad}
          className="w-full p-3.5 flex items-center justify-between hover:bg-slate-50 transition-colors text-left"
        >
          <div className="flex items-center gap-3 text-slate-700">
            <User className="w-4 h-4 text-slate-400" />
            <span>Mi perfil y datos</span>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-400" />
        </button>

        {/* 2. Metas */}
        <div className="p-3.5 flex items-center justify-between text-slate-700">
          <div className="flex items-center gap-3">
            <Target className="w-4 h-4 text-slate-400" />
            <span>Metas fijadas</span>
          </div>
          <span className="text-[11px] font-bold text-emerald-700">
            {activePatient.peso_objetivo} kg
          </span>
        </div>

        {/* 3. Biblioteca educativa */}
        <button
          onClick={() => setSubView('biblioteca')}
          className="w-full p-3.5 flex items-center justify-between hover:bg-slate-50 transition-colors text-left"
        >
          <div className="flex items-center gap-3 text-slate-700">
            <BookOpen className="w-4 h-4 text-teal-600" />
            <span>Biblioteca educativa</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] text-slate-400">
              {visibleArticles.length} guías
            </span>
            <ChevronRight className="w-4 h-4 text-slate-400" />
          </div>
        </button>

        {/* 4. Reportes y resúmenes */}
        <button
          onClick={() => setSubView('reportes')}
          className="w-full p-3.5 flex items-center justify-between hover:bg-slate-50 transition-colors text-left"
        >
          <div className="flex items-center gap-3 text-slate-700">
            <FileText className="w-4 h-4 text-emerald-600" />
            <span>Reportes y resúmenes</span>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-400" />
        </button>

        {/* 5. Recordatorios */}
        <div className="p-3.5 flex items-center justify-between text-slate-700">
          <div className="flex items-center gap-3">
            <Bell className="w-4 h-4 text-slate-400" />
            <span>Recordatorios diarios</span>
          </div>
          <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded font-bold">
            Activos
          </span>
        </div>

        {/* 6. Aviso de privacidad y mis derechos */}
        <button
          onClick={() => setIsLegalModalOpen(true)}
          className="w-full p-3.5 flex items-center justify-between hover:bg-slate-50 transition-colors text-left"
        >
          <div className="flex items-center gap-3 text-slate-700">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Aviso de privacidad y derechos ARCO</span>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-400" />
        </button>
      </div>

      {/* Switcher al Panel de Nutriólogo */}
      <Link
        href="/"
        className="w-full p-3.5 bg-slate-900 text-white rounded-2xl flex items-center justify-between font-bold text-xs shadow-md hover:bg-black transition-all"
      >
        <div className="flex items-center gap-2">
          <span>Cambiar a Panel del Nutriólogo (Web)</span>
        </div>
        <ExternalLink className="w-4 h-4 text-emerald-400" />
      </Link>
    </div>
  );
};
