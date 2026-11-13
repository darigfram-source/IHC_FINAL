'use client';

import React from 'react';
import { useNutriMasa } from '@/lib/NutriMasaContext';
import { Sidebar } from '@/components/Sidebar';
import { Header } from '@/components/Header';
import { UserTable } from '@/components/UserTable';
import { UserInspector } from '@/components/UserInspector';
import { ChatView } from '@/components/ChatView';
import { ReportsView } from '@/components/ReportsView';
import { LibraryView } from '@/components/LibraryView';
import { ArcoView } from '@/components/ArcoView';
import { UserDetailModal } from '@/components/UserDetailModal';
import { AdjustPlanModal } from '@/components/AdjustPlanModal';
import { ConsentModal } from '@/components/ConsentModal';

export default function AdminDashboardPage() {
  const { activeTab, cargandoPanel, modoReal, errorPanel, limpiarErrorPanel } = useNutriMasa();

  if (cargandoPanel && !modoReal) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-slate-100 text-sm text-slate-500">
        Cargando tu panel…
      </div>
    );
  }

  return (
    <div className="flex h-screen w-full overflow-hidden bg-slate-100 select-none">
      {/* Barra Lateral Izquierda (Panel con Usuarios, Mensajes, Reportes, Biblioteca) */}
      <Sidebar />

      {/* Contenido Principal de Escritorio */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Barra Superior con KPIs */}
        <Header />

        {errorPanel && (
          <div role="alert" className="mx-6 mt-3 flex items-center justify-between gap-3 rounded-lg border border-rose-200 bg-rose-50 px-4 py-2 text-xs text-rose-700">
            <span>{errorPanel}</span>
            <button onClick={limpiarErrorPanel} className="font-bold hover:underline">
              Cerrar
            </button>
          </div>
        )}

        {/* Área de Trabajo según Pestaña Activa */}
        <main className="flex-1 p-6 overflow-hidden flex flex-col">
          {activeTab === 'usuarios' && (
            <div className="flex-1 flex gap-6 overflow-hidden">
              {/* Sección Central: Tabla "Mis usuarios" */}
              <UserTable />

              {/* Columna Derecha: Tarjeta de Inspección Rápida (Figura 8) */}
              <UserInspector />
            </div>
          )}

          {activeTab === 'mensajes' && <ChatView />}

          {activeTab === 'reportes' && <ReportsView />}

          {activeTab === 'biblioteca' && <LibraryView />}

          {activeTab === 'arco' && <ArcoView />}
        </main>
      </div>

      {/* Modales y Paneles Flotantes */}
      <UserDetailModal />
      <AdjustPlanModal />
      <ConsentModal />
    </div>
  );
}
