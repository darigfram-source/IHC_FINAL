'use client';

import React from 'react';
import { useNutriMasa } from '@/lib/NutriMasaContext';
import { ThemeToggle } from '@/components/ThemeToggle';
import {
  Users,
  Activity,
  AlertTriangle,
  Award,
  CheckCircle2,
  Smartphone,
  ExternalLink,
} from 'lucide-react';
import Link from 'next/link';

export const Header: React.FC = () => {
  const { activeTab, usuarios, nutriologo } = useNutriMasa();

  const totalPacientes = usuarios.length;
  const enProgreso = usuarios.filter((u) => u.estado === 'En progreso').length;
  const estancados = usuarios.filter((u) => u.estado === 'Estancado').length;
  const alertas = usuarios.filter((u) => u.estado === 'Peso sube, cargas no').length;

  const getTitle = () => {
    switch (activeTab) {
      case 'usuarios':
        return {
          title: 'Panel del Nutriólogo',
          subtitle: 'Supervisión de usuarios asignados, peso en ayunas y progresión de cargas',
        };
      case 'mensajes':
        return {
          title: 'Centro de Mensajería Asíncrona',
          subtitle: 'Soporte, resolución de dudas y prescripción de suplementación validada',
        };
      case 'reportes':
        return {
          title: 'Módulo de Reportes Clínicos',
          subtitle: 'Generación de resúmenes periódicos descargables e imprimibles',
        };
      case 'biblioteca':
        return {
          title: 'Gestión de Biblioteca Educativa',
          subtitle: 'Artículos científicos validados para contrarrestar el "bro-science"',
        };
      case 'normativa':
        return {
          title: 'Normativa del profesional',
          subtitle: 'Resumen informativo de las obligaciones al atender pacientes con NutriMasa',
        };
      case 'perfil':
        return {
          title: 'Mi perfil profesional',
          subtitle: 'Lo que ven tus pacientes: nombre, cédula verificada, institución y especialidad',
        };
      case 'arco':
        return {
          title: 'Derechos ARCO de tus pacientes',
          subtitle: 'Solicitudes de acceso, rectificación, cancelación y oposición (LFPDPPP)',
        };
    }
  };

  const { title, subtitle } = getTitle();

  return (
    <header className="h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between shrink-0 select-none">
      {/* Título de sección */}
      <div>
        <h1 className="text-base font-extrabold text-slate-900 tracking-tight">{title}</h1>
        <p className="text-xs text-slate-500 hidden sm:block">{subtitle}</p>
      </div>

      {/* Métricas Rápidas (KPIs para el Especialista) y Switcher de rol */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-lg text-xs">
          <span className="text-slate-500 font-medium">Pacientes:</span>
          <span className="font-extrabold text-slate-900">{totalPacientes}</span>
          <span className="text-slate-300">|</span>
          <span className="inline-flex items-center gap-1 text-emerald-700 font-bold">
            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
            {enProgreso} en progreso
          </span>
          <span className="text-slate-300">|</span>
          <span className="inline-flex items-center gap-1 text-amber-700 font-bold">
            <AlertTriangle className="w-3 h-3 text-amber-500" />
            {estancados + alertas} atención
          </span>
        </div>

        {/* Especialidad clínica */}
        <div className="hidden lg:flex items-center gap-2 bg-emerald-50 text-emerald-900 border border-emerald-200/80 px-3 py-1.5 rounded-lg text-xs font-semibold">
          <Award className="w-3.5 h-3.5 text-emerald-700" />
          <span>Nutrición Deportiva e Hipertrofia</span>
        </div>

        <ThemeToggle variant="compact" />
      </div>
    </header>
  );
};
