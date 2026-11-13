'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Dumbbell, LogOut } from 'lucide-react';

/** Marco común de las pantallas del alta de nutriólogo (sin panel): centrado y con "Cerrar sesión" a la mano. */
export const MarcoNutri: React.FC<{ titulo: string; children: React.ReactNode; sinSalir?: boolean }> = ({ titulo, children, sinSalir }) => {
  const router = useRouter();
  const salir = async () => {
    await fetch('/api/auth/logout', { method: 'POST' }).catch(() => {});
    router.push('/admin/login');
    router.refresh();
  };
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#06140e] via-[#0b241a] to-[#040e0a] flex items-start sm:items-center justify-center p-4">
      <div className="max-w-lg w-full bg-white rounded-3xl shadow-2xl border border-emerald-950/20 overflow-hidden">
        <div className="p-6 bg-gradient-to-b from-[#0a1f16] to-[#102d21] text-white flex items-center justify-between gap-3 border-b border-[#184231]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center border border-emerald-300/30">
              <Dumbbell className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-black tracking-tight">{titulo}</h1>
              <p className="text-[11px] text-emerald-300/80 font-medium">NutriMasa Pro</p>
            </div>
          </div>
          {!sinSalir && (
            <button onClick={salir} className="flex items-center gap-1.5 text-xs text-emerald-200 hover:text-white px-2 py-1.5 rounded-lg hover:bg-white/10">
              <LogOut className="w-4 h-4" />
              Cerrar sesión
            </button>
          )}
        </div>
        <div className="p-6 text-slate-800">{children}</div>
      </div>
    </div>
  );
};
