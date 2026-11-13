import type { Metadata } from 'next';
import { AvisoPrivacidad } from '@/components/AvisoPrivacidad';

export const metadata: Metadata = {
  title: 'Aviso de privacidad | NutriMasa',
};

// Página pública (no pide sesión): el registro la enlaza para que se lea antes de dar el consentimiento.
export default function AvisoPrivacidadPage() {
  return (
    <main className="min-h-screen bg-[var(--surface-raised)] px-4 py-8">
      <article className="max-w-2xl mx-auto bg-[var(--surface)] border border-[var(--border)] rounded-3xl p-6 sm:p-8 shadow-[var(--shadow-sm)]">
        <h1 className="text-xl font-bold text-[var(--text)] mb-1">Aviso de privacidad</h1>
        <p className="text-xs text-[var(--text-subtle)] mb-6">NutriMasa · LFPDPPP</p>
        <AvisoPrivacidad />
      </article>
    </main>
  );
}
