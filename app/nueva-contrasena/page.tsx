'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Dumbbell, ArrowRight, AlertCircle, Lock, Eye, EyeOff } from 'lucide-react';

function CampoContrasena({
  valor,
  onChange,
  etiqueta,
}: {
  valor: string;
  onChange: (v: string) => void;
  etiqueta: string;
}) {
  const [ver, setVer] = useState(false);
  return (
    <div>
      <label className="block text-xs font-semibold text-slate-300 mb-1.5">{etiqueta}</label>
      <div className="relative">
        <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type={ver ? 'text' : 'password'}
          value={valor}
          onChange={(e) => onChange(e.target.value)}
          required
          autoComplete="new-password"
          className="w-full bg-slate-950/70 border border-slate-800 focus:border-emerald-500 rounded-xl pl-10 pr-11 py-2.5 text-sm text-white focus:outline-none focus:ring-1 focus:ring-emerald-500 transition-all"
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
  );
}

export default function NuevaContrasenaPage() {
  const router = useRouter();
  const [pw, setPw] = useState('');
  const [pw2, setPw2] = useState('');
  const [error, setError] = useState('');
  const [sinSesion, setSinSesion] = useState(false);
  const [loading, setLoading] = useState(false);

  const guardar = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (pw !== pw2) {
      setError('Las contraseñas no coinciden.');
      return;
    }
    if (pw.length < 8 || !/[a-z]/.test(pw) || !/[A-Z]/.test(pw) || !/[0-9]/.test(pw)) {
      setError('La contraseña debe tener al menos 8 caracteres, con mayúsculas, minúsculas y números.');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch('/api/auth/nueva-contrasena', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: pw }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        if (res.status === 401) setSinSesion(true);
        setError(data.error || 'No se pudo cambiar la contraseña.');
        setLoading(false);
        return;
      }
      router.push(data.redirectTo);
      router.refresh();
    } catch {
      setError('Error de conexión con el servidor. Intenta de nuevo.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center p-4">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center text-white shadow-lg shadow-emerald-950/50">
            <Dumbbell className="w-6 h-6" />
          </div>
          <span className="font-black text-xl text-white tracking-tight">NutriMasa</span>
        </div>

        <h1 className="text-xl font-bold text-white mb-1">Crea tu nueva contraseña</h1>
        <p className="text-xs text-slate-400 mb-5">
          Mínimo 8 caracteres, con mayúsculas, minúsculas y números.
        </p>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-start gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {sinSesion ? (
          <Link href="/recuperar" className="text-emerald-400 font-semibold underline underline-offset-2 text-xs">
            Pedir un enlace nuevo
          </Link>
        ) : (
          <form onSubmit={guardar} className="space-y-4">
            <CampoContrasena valor={pw} onChange={setPw} etiqueta="Nueva contraseña" />
            <CampoContrasena valor={pw2} onChange={setPw2} etiqueta="Repite la contraseña" />
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-bold rounded-xl text-sm shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
            >
              {loading ? 'Guardando...' : 'Guardar contraseña'}
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
