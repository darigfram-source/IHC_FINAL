'use client';

import React, { useEffect, useState } from 'react';
import { MailCheck } from 'lucide-react';

const ESPERA_SEGUNDOS = 60; // Supabase limita los correos: se evita pedir otro antes de un minuto

/** Botón "Reenviar correo de confirmación" que aparece en el inicio de sesión cuando la cuenta aún no está confirmada. */
export function ReenviarConfirmacion({ correo, tema = 'oscuro' }: { correo: string; tema?: 'oscuro' | 'claro' }) {
  const [enviando, setEnviando] = useState(false);
  const [espera, setEspera] = useState(0);
  const [mensaje, setMensaje] = useState<{ ok: boolean; texto: string } | null>(null);

  useEffect(() => {
    if (espera <= 0) return;
    const t = setTimeout(() => setEspera((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [espera]);

  const reenviar = async () => {
    if (!/^\S+@\S+\.\S+$/.test(correo.trim())) {
      setMensaje({ ok: false, texto: 'Escribe tu correo arriba para reenviar el enlace.' });
      return;
    }
    setEnviando(true);
    setMensaje(null);
    try {
      const res = await fetch('/api/auth/reenviar-confirmacion', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: correo }),
      });
      const j = await res.json().catch(() => ({}));
      if (res.ok && j.success) {
        setMensaje({ ok: true, texto: 'Te enviamos otro correo. Revisa también la carpeta de spam.' });
        setEspera(ESPERA_SEGUNDOS);
      } else {
        setMensaje({ ok: false, texto: (j.error as string) || 'No se pudo reenviar el correo.' });
        if (res.status === 429) setEspera(ESPERA_SEGUNDOS);
      }
    } catch {
      setMensaje({ ok: false, texto: 'No se pudo conectar. Revisa tu internet e inténtalo de nuevo.' });
    } finally {
      setEnviando(false);
    }
  };

  const oscuro = tema === 'oscuro';
  return (
    <div className="space-y-2">
      <button
        type="button"
        onClick={reenviar}
        disabled={enviando || espera > 0}
        className={`inline-flex items-center gap-2 text-xs font-bold underline underline-offset-2 disabled:opacity-50 disabled:no-underline cursor-pointer min-h-[44px] ${
          oscuro ? 'text-emerald-400 hover:text-emerald-300' : 'text-emerald-700 hover:text-emerald-800'
        }`}
      >
        <MailCheck className="w-4 h-4" />
        {enviando ? 'Enviando…' : espera > 0 ? `Reenviar correo de confirmación (${espera} s)` : 'Reenviar correo de confirmación'}
      </button>
      {mensaje && (
        <p
          role={mensaje.ok ? 'status' : 'alert'}
          className={`text-xs font-semibold ${mensaje.ok ? (oscuro ? 'text-emerald-300' : 'text-emerald-700') : oscuro ? 'text-rose-400' : 'text-rose-700'}`}
        >
          {mensaje.texto}
        </p>
      )}
    </div>
  );
}
