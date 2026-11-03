'use client';

import React from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Home,
  ClipboardEdit,
  TrendingUp,
  MessageSquare,
  Menu as MenuIcon,
  Wifi,
  Battery,
  LogOut,
  Dumbbell,
  Laptop,
} from 'lucide-react';

export default function PacienteLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  const isAuthPage = pathname === '/paciente/login' || pathname === '/paciente/registro';

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } finally {
      router.push('/');
      router.refresh();
    }
  };

  if (isAuthPage) {
    return <>{children}</>;
  }

  const tabs = [
    { label: 'Inicio', href: '/paciente/dashboard', icon: Home },
    { label: 'Registro', href: '/paciente/diario', icon: ClipboardEdit },
    { label: 'Gráficas', href: '/paciente/graficas', icon: TrendingUp },
    { label: 'Chat', href: '/paciente/chat', icon: MessageSquare },
    { label: 'Menú', href: '/paciente/menu', icon: MenuIcon },
  ];

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-start p-0 sm:py-6 selection:bg-emerald-600 selection:text-white">
      {/* Contenedor Responsivo / Mobile Shell */}
      <div className="w-full max-w-md bg-slate-50 text-slate-900 sm:rounded-3xl shadow-2xl sm:border sm:border-slate-300 overflow-hidden flex flex-col min-h-screen sm:min-h-[760px] sm:max-h-[850px] relative">
        {/* Barra de Estado Móvil */}
        <div className="h-7 bg-slate-100 px-5 flex items-center justify-between text-[11px] font-bold text-slate-500 select-none border-b border-slate-200 shrink-0">
          <span>9:41</span>
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-emerald-700 font-semibold uppercase tracking-wider">NutriMasa</span>
            <Wifi className="w-3.5 h-3.5 text-slate-500" />
            <Battery className="w-4 h-4 text-slate-500" />
          </div>
        </div>

        {/* Contenido Principal de la Pantalla */}
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>

        {/* Barra de Navegación Inferior Móvil (Figuras 3 a 7) */}
        <nav className="h-16 bg-white border-t border-slate-200 flex items-center justify-around px-2 shrink-0 select-none z-20">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = pathname === tab.href;

            return (
              <Link
                key={tab.href}
                href={tab.href}
                className={`flex flex-col items-center justify-center w-14 py-1 transition-all ${
                  isActive ? 'text-emerald-700 font-black' : 'text-slate-400 hover:text-slate-600'
                }`}
              >
                <Icon className={`w-5 h-5 mb-0.5 ${isActive ? 'stroke-[2.5]' : 'stroke-2'}`} />
                <span className="text-[10px]">{tab.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
