'use client';

import React, { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Dumbbell, Lock, Mail, ArrowRight, UserCheck, ArrowLeft, ShieldCheck } from 'lucide-react';
import Link from 'next/link';

function AdminLoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState('admin@nutrimasa.com');
  const [password, setPassword] = useState('Password123!');
  const [errorMsg, setErrorMsg] = useState('');
  const [cargando, setCargando] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setCargando(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, expectedRole: 'admin' }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        setErrorMsg(data.error || 'Credenciales inválidas');
        setCargando(false);
        return;
      }

      const dest = searchParams.get('from') || '/admin';
      router.push(dest);
      router.refresh();
    } catch {
      setErrorMsg('Error de conexión con el servidor');
      setCargando(false);
    }
  };

  const handleQuickLogin = async () => {
    setEmail('admin@nutrimasa.com');
    setPassword('Password123!');
    setCargando(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'admin@nutrimasa.com', password: 'Password123!', expectedRole: 'admin' }),
      });
      const data = await res.json();
      if (data.success) {
        router.push('/admin');
        router.refresh();
      }
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="p-7">
      <form onSubmit={handleSubmit} className="space-y-4 text-xs">
        <div>
          <label className="font-bold text-slate-700 block mb-1">
            Correo Institucional o Profesional
          </label>
          <div className="relative">
            <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 focus:ring-2 focus:ring-emerald-500 text-xs"
              placeholder="admin@nutrimasa.com"
            />
          </div>
        </div>

        <div>
          <label className="font-bold text-slate-700 block mb-1">Contraseña</label>
          <div className="relative">
            <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 focus:ring-2 focus:ring-emerald-500 text-xs"
              placeholder="••••••••"
            />
          </div>
        </div>

        {errorMsg && (
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs font-medium">
            {errorMsg}
          </div>
        )}

        <button
          type="submit"
          disabled={cargando}
          className="w-full py-3 bg-[#14532d] hover:bg-[#166534] active:bg-[#0f3d21] text-white font-bold rounded-xl shadow-md transition-all flex items-center justify-center gap-2 text-sm disabled:opacity-50"
        >
          <span>{cargando ? 'Accediendo...' : 'Entrar al Panel Admin'}</span>
          <ArrowRight className="w-4 h-4" />
        </button>

        {/* Acceso Rápido Demo */}
        <button
          type="button"
          onClick={handleQuickLogin}
          disabled={cargando}
          className="w-full py-2.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 font-semibold rounded-xl transition-all flex items-center justify-center gap-2 text-xs"
        >
          <UserCheck className="w-4 h-4 text-emerald-600" />
          <span>Acceso Rápido Demo (Nutriólogo Admin)</span>
        </button>
      </form>

      {/* Enlace a Portal de Paciente */}
      <div className="mt-6 pt-4 border-t border-slate-100 text-center">
        <p className="text-xs text-slate-500">
          ¿Eres paciente?{' '}
          <Link href="/paciente/login" className="text-emerald-700 font-bold hover:underline">
            Accede aquí a tu app móvil
          </Link>
        </p>
      </div>
    </div>
  );
}

export default function AdminLoginPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#06140e] via-[#0b241a] to-[#040e0a] flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-2xl border border-emerald-950/20 overflow-hidden">
        {/* Banner Superior */}
        <div className="p-8 bg-gradient-to-b from-[#0a1f16] to-[#102d21] text-white text-center border-b border-[#184231] relative">
          <Link
            href="/"
            className="absolute left-5 top-5 p-2 rounded-xl text-emerald-300 hover:text-white hover:bg-white/10 transition-colors flex items-center gap-1 text-xs"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Portal</span>
          </Link>

          <div className="w-14 h-14 mx-auto rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center shadow-lg shadow-emerald-950/50 mb-3 border border-emerald-300/30">
            <Dumbbell className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-black tracking-tight text-white">NutriMasa Pro</h1>
          <p className="text-xs text-emerald-300/80 font-medium mt-1">
            Panel Clínico para Nutriólogos Deportivos
          </p>
        </div>

        {/* Formulario envuelto en Suspense */}
        <Suspense fallback={<div className="p-8 text-center text-xs text-slate-500">Cargando formulario de acceso...</div>}>
          <AdminLoginForm />
        </Suspense>
      </div>
    </div>
  );
}
