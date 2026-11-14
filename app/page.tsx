'use client';

import React from 'react';
import Link from 'next/link';
import {
  Dumbbell,
  Smartphone,
  ShieldCheck,
  TrendingUp,
  UserCheck,
  ArrowRight,
  Sparkles,
  BookOpen,
  Scale,
  Beef,
  Flame,
} from 'lucide-react';
import { ThemeToggle } from '@/components/ThemeToggle';

export default function WelcomePortalPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#06140e] via-[#0a1f16] to-[#040e0a] text-white flex flex-col justify-between selection:bg-emerald-500 selection:text-white">
      {/* Barra de Encabezado Superior */}
      <header className="px-6 py-5 border-b border-emerald-950/60 bg-black/20 backdrop-blur-md flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center shadow-lg shadow-emerald-950/60 border border-emerald-300/30">
            <Dumbbell className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-lg tracking-tight text-white">NutriMasa</span>
              <span className="text-[10px] font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded-full">
                Sports Science
              </span>
            </div>
            <p className="text-[11px] text-emerald-300/70">
              Nutrición deportiva supervisada para hipertrofia
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 text-xs">
          <ThemeToggle variant="compact" />
          <span className="hidden sm:inline text-emerald-200/60">¿Ya tienes cuenta?</span>
          <Link
            href="/paciente/login"
            className="px-3.5 py-1.5 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/30 font-semibold transition-all min-h-[40px] flex items-center"
          >
            Entrar
          </Link>
        </div>
      </header>

      {/* Hero Central */}
      <main className="flex-1 max-w-5xl mx-auto w-full px-6 py-12 flex flex-col items-center justify-center text-center">
        {/* Badge superior */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-950/80 border border-emerald-500/30 text-emerald-300 text-xs font-semibold mb-6 shadow-md">
          <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
          <span>Plataforma Clínica de Hipertrofia y Sobrecarga Progresiva</span>
        </div>

        <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white max-w-3xl leading-tight">
          Supervisión nutricional exacta para{' '}
          <span className="bg-gradient-to-r from-emerald-400 to-teal-300 bg-clip-text text-transparent">
            ganar masa muscular
          </span>{' '}
          sin mitos de gimnasio
        </h1>

        <p className="mt-4 text-sm sm:text-base text-emerald-100/70 max-w-2xl leading-relaxed">
          Conectamos a deportistas de fuerza con especialistas certificados. Registro diario en menos de 30 segundos, alertas de composición y ajuste dinámico de macronutrientes.
        </p>

        {/* LAS DOS PUERTAS DE ACCESO (Requisito 1: "Soy paciente" y "Soy nutriólogo") */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-3xl mt-10 text-left">
          {/* Tarjeta 1: Acceso Paciente */}
          <div className="bg-gradient-to-b from-white/10 to-white/5 border border-emerald-500/30 hover:border-emerald-400 rounded-3xl p-6 sm:p-8 backdrop-blur-md transition-all hover:shadow-2xl hover:shadow-emerald-950/80 flex flex-col justify-between group">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-emerald-600/30 text-emerald-300 flex items-center justify-center mb-5 border border-emerald-400/30 group-hover:scale-105 transition-transform">
                <Smartphone className="w-6 h-6" />
              </div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 block mb-1">
                Portal del Usuario
              </span>
              <h2 className="text-2xl font-black text-white">Soy Paciente</h2>
              <p className="text-xs text-emerald-100/70 mt-2 leading-relaxed">
                Accede a tu plan personalizado, registra tu peso matutino en ayunas, monitorea tu fuerza en sentadilla y banca, y chatea con tu especialista.
              </p>

              <div className="mt-4 pt-3 border-t border-white/10 space-y-1.5 text-[11px] text-emerald-200/80 font-medium">
                <div className="flex items-center gap-2">
                  <Beef className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>Proteína 1.6–1.8 g/kg calculada en tiempo real</span>
                </div>
                <div className="flex items-center gap-2">
                  <Flame className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  <span>Superávit medido (+400 a +500 kcal)</span>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-white/10 flex flex-col sm:flex-row gap-2.5">
              <Link
                href="/paciente/login"
                className="flex-1 py-3 px-4 bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 transition-all shadow-md"
              >
                <span>Iniciar Sesión</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/paciente/registro"
                className="py-3 px-4 bg-white/10 hover:bg-white/20 text-emerald-200 border border-white/20 font-semibold rounded-xl text-xs text-center transition-all"
              >
                Crear Cuenta
              </Link>
            </div>
          </div>

          {/* Tarjeta 2: Acceso Nutriólogo */}
          <div className="bg-gradient-to-b from-[#0c261b] to-[#081b13] border border-emerald-700/40 hover:border-emerald-500 rounded-3xl p-6 sm:p-8 backdrop-blur-md transition-all hover:shadow-2xl hover:shadow-emerald-950/80 flex flex-col justify-between group">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-teal-500/20 text-teal-300 flex items-center justify-center mb-5 border border-teal-400/30 group-hover:scale-105 transition-transform">
                <UserCheck className="w-6 h-6" />
              </div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-teal-400 block mb-1">
                Portal Clínico Profesional
              </span>
              <h2 className="text-2xl font-black text-white">Soy Nutriólogo</h2>
              <p className="text-xs text-emerald-100/70 mt-2 leading-relaxed">
                Panel web de escritorio para especialistas certificados: tabla de usuarios asignados, alertas de estancamiento, intervención en cargas y generación de reportes.
              </p>

              <div className="mt-4 pt-3 border-t border-emerald-800/40 space-y-1.5 text-[11px] text-teal-200/80 font-medium">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-3.5 h-3.5 text-teal-400 shrink-0" />
                  <span>Detección de mesetas y alertas de ganancia grasa</span>
                </div>
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>Tope de seguridad renal en 2.0 g/kg (ISSN)</span>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-emerald-800/40">
              <Link
                href="/admin/login"
                className="w-full py-3 px-4 bg-[#14532d] hover:bg-[#166534] active:bg-[#0f3d21] text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 transition-all shadow-md border border-emerald-600/40"
              >
                <span>Acceder al Panel del Nutriólogo</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>

      </main>

      {/* Footer */}
      <footer className="px-6 py-4 border-t border-emerald-950/60 text-center text-[11px] text-emerald-400/50">
        NutriMasa Pro • Plataforma Médica y Deportiva • Cumplimiento con LFPDPPP y Consentimiento Informado
      </footer>
    </div>
  );
}
