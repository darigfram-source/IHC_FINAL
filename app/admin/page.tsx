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
import { UserDetailModal } from '@/components/UserDetailModal';
import { AdjustPlanModal } from '@/components/AdjustPlanModal';
import { ConsentModal } from '@/components/ConsentModal';

export default function AdminDashboardPage() {
  const { activeTab } = useNutriMasa();

  return (
    <div className="flex h-screen w-full overflow-hidden bg-slate-100 select-none">
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Header />

        <main className="flex-1 p-6 overflow-hidden flex flex-col">
          {activeTab === 'usuarios' && (
            <div className="flex-1 flex gap-6 overflow-hidden">
              <UserTable />

              <UserInspector />
            </div>
          )}

          {activeTab === 'mensajes' && <ChatView />}

          {activeTab === 'reportes' && <ReportsView />}

          {activeTab === 'biblioteca' && <LibraryView />}
        </main>
      </div>

      <UserDetailModal />
      <AdjustPlanModal />
      <ConsentModal />
    </div>
  );
}
