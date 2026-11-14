'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  Home,
  ClipboardEdit,
  TrendingUp,
  MessageSquare,
  Menu as MenuIcon,
  Dumbbell,
  LogOut,
  Sparkles,
  ShieldCheck,
  User,
} from 'lucide-react';
import { ThemeToggle } from '@/components/ThemeToggle';
import { cerrarSesion } from '@/lib/offline';

export const NAV_ITEMS = [
  { label: 'Inicio', href: '/paciente/dashboard', icon: Home, description: 'Resumen diario y metas' },
  { label: 'Registro', href: '/paciente/diario', icon: ClipboardEdit, description: 'Peso y cargas de hoy' },
  { label: 'Gráficas', href: '/paciente/graficas', icon: TrendingUp, description: 'Evolución y sobrecarga' },
  { label: 'Chat', href: '/paciente/chat', icon: MessageSquare, description: 'Consulta con especialista' },
  { label: 'Menú', href: '/paciente/menu', icon: MenuIcon, description: 'Biblioteca y ajustes' },
];

export const PacienteNavigation: React.FC = () => {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    if (await cerrarSesion()) {
      router.push('/');
      router.refresh();
    }
  };

  return (
    <>
      {/* ====================================================================
          1. ESCRITORIO (>1024px / lg:flex) - BARRA LATERAL COMPLETA EXPANDIDA
          ==================================================================== */}
      <aside
        aria-label="Navegación principal de escritorio"
        className="hidden lg:flex flex-col justify-between w-64 shrink-0 h-screen sticky top-0 bg-[var(--surface)] border-r border-[var(--border)] p-5 select-none z-30"
      >
        <div className="space-y-6">
          {/* Logo e Identidad de Marca */}
          <Link
            href="/paciente/dashboard"
            className="flex items-center gap-3 group focus-visible:outline-2 focus-visible:outline-emerald-500 rounded-xl"
          >
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center text-white shadow-md shadow-emerald-950/30 group-hover:scale-105 transition-transform">
              <Dumbbell className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-black text-lg tracking-tight text-[var(--text)]">
                  NutriMasa
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30">
                  Paciente
                </span>
              </div>
              <p className="text-[11px] text-[var(--text-subtle)] font-medium">
                Ciencia de Hipertrofia
              </p>
            </div>
          </Link>

          {/* Enlaces de Navegación */}
          <nav className="space-y-1.5" aria-label="Menú de escritorio">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={isActive ? 'page' : undefined}
                  className={`flex items-center gap-3.5 px-3.5 py-3 rounded-xl text-sm font-semibold transition-all min-h-[44px] cursor-pointer focus-visible:outline-2 focus-visible:outline-emerald-500 ${
                    isActive
                      ? 'bg-emerald-600 text-white shadow-md shadow-emerald-900/20'
                      : 'text-[var(--text-muted)] hover:bg-[var(--surface-hover)] hover:text-[var(--text)]'
                  }`}
                >
                  <Icon className={`w-5 h-5 shrink-0 ${isActive ? 'stroke-[2.5]' : 'stroke-2'}`} />
                  <div className="flex-1 min-w-0">
                    <span className="block leading-none">{item.label}</span>
                    <span
                      className={`text-[10px] block mt-1 truncate ${
                        isActive ? 'text-emerald-100 opacity-90' : 'text-[var(--text-subtle)]'
                      }`}
                    >
                      {item.description}
                    </span>
                  </div>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Footer Barra Lateral: Ajustes de Tema y Salir */}
        <div className="pt-4 border-t border-[var(--border)] space-y-3">
          <div className="flex items-center justify-between px-1">
            <span className="text-xs font-semibold text-[var(--text-muted)]">Tema</span>
            <ThemeToggle variant="compact" />
          </div>

          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-xs font-bold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 transition-colors min-h-[44px] cursor-pointer focus-visible:outline-2 focus-visible:outline-rose-500"
          >
            <LogOut className="w-4 h-4 shrink-0" />
            <span>Cerrar Sesión</span>
          </button>
        </div>
      </aside>

      {/* ====================================================================
          2. TABLET (640px–1024px / md:flex lg:hidden) - BARRA LATERAL COMPACTA
          ==================================================================== */}
      <aside
        aria-label="Navegación compacta de tablet"
        className="hidden md:flex lg:hidden flex-col justify-between w-20 shrink-0 h-screen sticky top-0 bg-[var(--surface)] border-r border-[var(--border)] py-5 px-2.5 select-none z-30 items-center"
      >
        <div className="space-y-6 flex flex-col items-center w-full">
          {/* Logo Compacto */}
          <Link
            href="/paciente/dashboard"
            aria-label="Ir al inicio de NutriMasa"
            className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center text-white shadow-md shadow-emerald-950/30 hover:scale-105 transition-transform focus-visible:outline-2 focus-visible:outline-emerald-500"
          >
            <Dumbbell className="w-6 h-6" />
          </Link>

          {/* Íconos de Navegación */}
          <nav className="space-y-2 w-full flex flex-col items-center" aria-label="Menú compacto">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-label={item.label}
                  title={item.label}
                  aria-current={isActive ? 'page' : undefined}
                  className={`w-12 h-12 rounded-xl flex flex-col items-center justify-center transition-all min-h-[44px] min-w-[44px] cursor-pointer focus-visible:outline-2 focus-visible:outline-emerald-500 relative group ${
                    isActive
                      ? 'bg-emerald-600 text-white shadow-md shadow-emerald-900/30 font-bold'
                      : 'text-[var(--text-muted)] hover:bg-[var(--surface-hover)] hover:text-[var(--text)]'
                  }`}
                >
                  <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.5]' : 'stroke-2'}`} />
                  <span className="text-[9px] mt-0.5 leading-none">{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Footer Tablet: Selector de tema y Salir */}
        <div className="flex flex-col items-center gap-2 pt-4 border-t border-[var(--border)] w-full">
          <ThemeToggle variant="compact" />

          <button
            onClick={handleLogout}
            aria-label="Cerrar Sesión"
            title="Cerrar Sesión"
            className="w-11 h-11 rounded-xl flex items-center justify-center text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer min-h-[44px] min-w-[44px] focus-visible:outline-2 focus-visible:outline-rose-500"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </aside>

      {/* ====================================================================
          3. MÓVIL (<640px / md:hidden) - BARRA DE NAVEGACIÓN INFERIOR
          ==================================================================== */}
      <nav
        aria-label="Navegación móvil inferior"
        className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-[var(--surface)] border-t border-[var(--border)] flex items-center justify-around px-2 z-40 select-none shadow-lg pb-[env(safe-area-inset-bottom,0px)]"
      >
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              aria-label={item.label}
              aria-current={isActive ? 'page' : undefined}
              className={`flex flex-col items-center justify-center flex-1 py-1 transition-all min-h-[44px] cursor-pointer focus-visible:outline-2 focus-visible:outline-emerald-500 ${
                isActive
                  ? 'text-emerald-600 dark:text-emerald-400 font-black'
                  : 'text-[var(--text-muted)] hover:text-[var(--text)]'
              }`}
            >
              <Icon className={`w-5 h-5 mb-0.5 ${isActive ? 'stroke-[2.5]' : 'stroke-2'}`} />
              <span className="text-[10px] leading-none">{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </>
  );
};

export const PacienteTopBar: React.FC<{
  titulo?: string;
  subtitulo?: string;
  badge?: string;
}> = ({ titulo = 'Dashboard', subtitulo = 'Plan de hipertrofia muscular', badge }) => {
  return (
    <header className="h-16 px-4 sm:px-6 lg:px-8 border-b border-[var(--border)] bg-[var(--surface)] flex items-center justify-between shrink-0 sticky top-0 z-20 backdrop-blur-md bg-opacity-90 dark:bg-opacity-90">
      <div className="flex items-center gap-3">
        {/* Logo visible en móvil */}
        <div className="md:hidden w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center text-white shadow-sm shrink-0">
          <Dumbbell className="w-5 h-5" />
        </div>

        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-base sm:text-lg font-black tracking-tight text-[var(--text)] leading-none">
              {titulo}
            </h1>
            {badge && (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30">
                {badge}
              </span>
            )}
          </div>
          <p className="text-xs text-[var(--text-subtle)] hidden sm:block mt-0.5">
            {subtitulo}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2.5">
        <ThemeToggle variant="compact" />

        <div className="flex items-center gap-2 pl-2 border-l border-[var(--border)]">
          <Link
            href="/paciente/menu"
            aria-label="Ver perfil de paciente"
            className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold text-xs shadow-sm hover:bg-emerald-700 transition-colors focus-visible:outline-2 focus-visible:outline-emerald-500"
          >
            <User className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </header>
  );
};
