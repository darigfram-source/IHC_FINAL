'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { PacienteNavigation } from '@/components/paciente/PacienteNavigation';
import { AvisosPaciente } from '@/components/paciente/AvisosPaciente';
import { SincronizadorPaciente } from '@/components/paciente/SincronizadorPaciente';

export default function PacienteLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAuthPage = pathname === '/paciente/login' || pathname === '/paciente/registro';

  if (isAuthPage) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen min-h-[100dvh] w-full bg-[var(--bg)] text-[var(--text)] flex flex-col md:flex-row antialiased selection:bg-emerald-600 selection:text-white">
      {/* Navegación Adaptable: Móvil (inferior), Tablet (lateral compacta), Escritorio (lateral completa) */}
      <PacienteNavigation />

      {/* Área Principal de Contenido (Ocupa la ventana completa del navegador, sin marcos de celular) */}
      <div className="flex-1 flex flex-col min-w-0 w-full min-h-screen overflow-x-hidden">
        {/* Estado sin internet y subida de lo pendiente (solo se ve si no hay conexión o hay algo por subir) */}
        <SincronizadorPaciente />
        <main className="flex-1 w-full pb-20 md:pb-8">
          {children}
        </main>
      </div>

      {/* Recordatorio del registro y aviso de respuesta del nutriólogo (con la página abierta) */}
      <AvisosPaciente />
    </div>
  );
}
