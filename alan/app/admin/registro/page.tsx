'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowRight, BadgeCheck, Eye, EyeOff, Lock, Mail } from 'lucide-react';
import { MarcoNutri } from '@/components/admin/MarcoNutri';

export default function AdminRegistroPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [ver, setVer] = useState(false);
  const [error, setError] = useState('');
  const [aviso, setAviso] = useState('');
  const [cargando, setCargando] = useState(false);

  const enviar = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (password.length < 8 || !/[a-z]/.test(password) || !/[A-Z]/.test(password) || !/[0-9]/.test(password)) {
      setError('La contraseña debe tener al menos 8 caracteres, con mayúsculas, minúsculas y números.');
      return;
    }
    setCargando(true);
    try {
      const res = await fetch('/api/auth/registro-nutriologo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const j = await res.json();
      if (!res.ok || !j.success) {
        setError(j.error ?? 'No se pudo crear la cuenta.');
        return;
      }
      if (j.needsConfirmation) {
        setAviso(j.message ?? 'Revisa tu correo para confirmar tu cuenta.');
        return;
      }
      router.push(j.redirectTo ?? '/admin/solicitud');
      router.refresh();
    } catch {
      setError('Error de conexión con el servidor.');
    } finally {
      setCargando(false);
    }
  };

  return (
    <MarcoNutri titulo="Alta de nutriólogo" sinSalir>
      <p className="flex items-start gap-2 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs mb-5">
        <BadgeCheck className="w-4 h-4 shrink-0 mt-0.5" />
        Paso 1 de 2: crea tu cuenta. Después de confirmar tu correo capturas tus datos profesionales; antes de activarla comprobamos tu cédula en la SEP y tu identidad (podemos pedirte una videollamada). No te pedimos tu CURP.
      </p>

      {aviso ? (
        <div role="status" className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-medium">
          {aviso}
        </div>
      ) : (
        <form onSubmit={enviar} className="space-y-4 text-xs">
          <div>
            <label htmlFor="reg-email" className="font-bold text-slate-700 block mb-1">
              Correo institucional o profesional
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                id="reg-email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 text-xs focus-visible:outline-2 focus-visible:outline-emerald-500"
                placeholder="correo@institucion.mx"
              />
            </div>
          </div>
          <div>
            <label htmlFor="reg-pass" className="font-bold text-slate-700 block mb-1">
              Contraseña
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                id="reg-pass"
                type={ver ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-9 pr-10 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 text-xs focus-visible:outline-2 focus-visible:outline-emerald-500"
              />
              <button
                type="button"
                onClick={() => setVer((v) => !v)}
                aria-label={ver ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-emerald-700"
              >
                {ver ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            <p className="mt-1 text-[11px] text-slate-500">Mínimo 8 caracteres, con mayúsculas, minúsculas y números.</p>
          </div>

          {error && (
            <div role="alert" className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs font-medium">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={cargando}
            className="w-full py-3 bg-[#14532d] hover:bg-[#166534] text-white font-bold rounded-xl shadow-md text-sm flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {cargando ? 'Creando cuenta…' : 'Crear cuenta'}
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>
      )}

      <p className="mt-6 pt-4 border-t border-slate-100 text-center text-xs text-slate-500">
        ¿Ya tienes cuenta?{' '}
        <Link href="/admin/login" className="text-emerald-700 font-bold hover:underline">
          Entrar al panel
        </Link>
      </p>
    </MarcoNutri>
  );
}
