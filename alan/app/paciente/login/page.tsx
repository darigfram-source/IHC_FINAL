'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ReenviarConfirmacion } from '@/components/ReenviarConfirmacion';
import { Dumbbell, ArrowRight, ShieldCheck, AlertCircle, User, Lock, ArrowLeft, Eye, EyeOff } from 'lucide-react';

export default function PacienteLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [ver, setVer] = useState(false);
  const [confirmado, setConfirmado] = useState(false);
  const [pideReenvio, setPideReenvio] = useState(false); // cuenta sin confirmar: se ofrece reenviar el correo

  useEffect(() => {
    // Llegan aquí desde el enlace del correo de confirmación (/auth/callback).
    setConfirmado(new URLSearchParams(window.location.search).get('confirmado') === '1');
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setPideReenvio(false);
    setLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, expectedRole: 'paciente' }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setError(data.error || 'Credenciales no válidas. Revisa correo y contraseña.');
        setPideReenvio(data.codigo === 'email_no_confirmado');
        setLoading(false);
        return;
      }

      router.push('/paciente/dashboard');
      router.refresh();
    } catch (err) {
      setError('Error de conexión con el servidor. Intenta de nuevo.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center p-4">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl relative">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-emerald-400 mb-6 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Volver al portal principal
        </Link>

        {/* Header App Paciente */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center text-white shadow-lg shadow-emerald-950/50">
            <Dumbbell className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-black text-xl text-white tracking-tight">NutriMasa</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                App Paciente
              </span>
            </div>
            <p className="text-xs text-slate-400">Seguimiento de hipertrofia y nutrición</p>
          </div>
        </div>

        <h1 className="text-xl font-bold text-white mb-1">Iniciar Sesión</h1>
        <p className="text-xs text-slate-400 mb-5">
          Ingresa con tu cuenta de paciente para sincronizar tu peso en ayunas y entrenamiento.
        </p>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {pideReenvio && (
          <div className="mb-4 -mt-2">
            <ReenviarConfirmacion correo={email} tema="oscuro" />
          </div>
        )}

        {confirmado && (
          <div className="mb-4 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs">
            Correo confirmado. Inicia sesión para continuar.
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Correo Electrónico
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="ejemplo@paciente.com"
                required
                className="w-full bg-slate-950/70 border border-slate-800 focus:border-emerald-500 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Contraseña
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type={ver ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full bg-slate-950/70 border border-slate-800 focus:border-emerald-500 rounded-xl pl-10 pr-11 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 transition-all"
              />
              <button
                type="button"
                onClick={() => setVer((v) => !v)}
                aria-label={ver ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-emerald-400 transition-colors"
              >
                {ver ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div className="text-right -mt-1">
            <Link href="/recuperar" className="text-xs text-emerald-400 hover:text-emerald-300 underline underline-offset-2">
              ¿Olvidaste tu contraseña?
            </Link>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-bold rounded-xl text-sm shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
          >
            {loading ? 'Accediendo...' : 'Entrar a mi App'}
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Registro Link */}
        <div className="mt-5 text-center">
          <p className="text-xs text-slate-400">
            ¿Aún no estás registrado?{' '}
            <Link
              href="/paciente/registro"
              className="text-emerald-400 hover:text-emerald-300 font-semibold underline underline-offset-2"
            >
              Realiza el Cuestionario de Elegibilidad
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
