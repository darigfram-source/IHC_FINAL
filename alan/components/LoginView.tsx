'use client';

import React, { useState } from 'react';
import { useNutriMasa } from '@/lib/NutriMasaContext';
import { Dumbbell, ShieldCheck, Lock, Mail, ArrowRight, UserCheck, Smartphone } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export const LoginView: React.FC = () => {
  const { login, setIsLegalModalOpen } = useNutriMasa();
  const router = useRouter();

  const [role, setRole] = useState<'nutriologo' | 'usuario'>('nutriologo');
  const [email, setEmail] = useState('admin@nutrimasa.com');
  const [password, setPassword] = useState('12345678');
  const [errorMsg, setErrorMsg] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (role === 'usuario') {
      router.push('/app');
      return;
    }

    const ok = login(email, 'nutriologo');
    if (!ok) {
      setErrorMsg('Credenciales inválidas');
    }
  };

  const handleDemoLogin = () => {
    login('admin@nutrimasa.com', 'nutriologo');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#06140e] via-[#0b241a] to-[#040e0a] flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-2xl border border-emerald-950/20 overflow-hidden">
        {/* Banner Superior NutriMasa */}
        <div className="p-8 bg-gradient-to-b from-[#0a1f16] to-[#102d21] text-white text-center border-b border-[#184231] relative">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center shadow-lg shadow-emerald-950/50 mb-3 border border-emerald-300/30">
            <Dumbbell className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-black tracking-tight text-white">NutriMasa</h1>
          <p className="text-xs text-emerald-300/80 font-medium mt-1">
            Plataforma de Nutrición Deportiva e Hipertrofia Supervisada
          </p>
        </div>

        {/* Selector de Rol (Figura 1: "Soy usuario" / "Soy nutriólogo") */}
        <div className="p-6">
          <div className="flex bg-slate-100 p-1 rounded-xl mb-6 text-xs font-semibold">
            <button
              type="button"
              onClick={() => {
                setRole('usuario');
                setErrorMsg('');
              }}
              className={`flex-1 py-2 rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                role === 'usuario'
                  ? 'bg-emerald-600 text-white shadow-xs font-bold'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>Soy paciente</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setRole('nutriologo');
                setErrorMsg('');
              }}
              className={`flex-1 py-2 rounded-lg transition-all ${
                role === 'nutriologo'
                  ? 'bg-emerald-600 text-white shadow-xs font-bold'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Soy nutriólogo
            </button>
          </div>

          {/* Opción Paciente */}
          {role === 'usuario' ? (
            <div className="p-5 bg-emerald-50/70 border border-emerald-200 rounded-2xl text-xs text-emerald-950 space-y-4 mb-2">
              <div>
                <p className="font-extrabold text-sm text-emerald-900">App del Paciente (Vista Móvil)</p>
                <p className="leading-relaxed text-emerald-800 text-xs mt-1">
                  Accede a tu registro diario en menos de 30 segundos, consulta tus gráficas de sobrecarga progresiva y comunícate con tu especialista.
                </p>
              </div>

              <Link
                href="/app"
                className="w-full py-3 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-xl shadow-md transition-all flex items-center justify-center gap-2 text-xs"
              >
                <Smartphone className="w-4 h-4" />
                <span>Abrir App Móvil del Paciente</span>
                <ArrowRight className="w-4 h-4 ml-1" />
              </Link>

              <p className="text-[11px] text-slate-500 text-center">
                También puedes acceder directo en <code className="bg-white px-1.5 py-0.5 rounded border border-slate-200 font-mono text-emerald-700">/app</code>
              </p>
            </div>
          ) : (
            <form onSubmit={handleLogin} className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Correo del Nutriólogo
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 focus:ring-2 focus:ring-emerald-500 text-xs"
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
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 focus:ring-2 focus:ring-emerald-500 text-xs"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              {errorMsg && (
                <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-lg text-rose-700 text-xs">
                  {errorMsg}
                </div>
              )}

              {/* Botón Principal de Entrada */}
              <button
                type="submit"
                className="w-full py-3 bg-[#14532d] hover:bg-[#166534] active:bg-[#0f3d21] text-white font-bold rounded-xl shadow-md transition-all flex items-center justify-center gap-2 text-sm"
              >
                <span>Entrar al Panel de Nutriólogo</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              {/* Botón Rápido Demo 1-Click */}
              <button
                type="button"
                onClick={handleDemoLogin}
                className="w-full py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 font-semibold rounded-xl transition-all flex items-center justify-center gap-2 text-xs"
              >
                <UserCheck className="w-4 h-4 text-emerald-600" />
                <span>Acceso Rápido como Nutriólogo Admin</span>
              </button>
            </form>
          )}

          {/* Aviso Legal LFPDPPP */}
          <div className="mt-6 pt-4 border-t border-slate-100 text-center">
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Los datos de peso, entrenamiento y salud son tratados como{' '}
              <strong className="text-slate-600">datos sensibles</strong>.{' '}
              <button
                onClick={() => setIsLegalModalOpen(true)}
                className="text-emerald-700 font-semibold underline hover:text-emerald-900"
              >
                Aviso de Privacidad y Consentimiento
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
