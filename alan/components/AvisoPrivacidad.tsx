import { SECCIONES_AVISO } from '@/lib/aviso-privacidad';

/** Texto completo del aviso de privacidad (sin marco): se reutiliza en la página pública y en el menú. */
export function AvisoPrivacidad() {
  return (
    <div className="space-y-4">
      {SECCIONES_AVISO.map((s) => (
        <section key={s.titulo}>
          <h2 className="text-sm font-bold text-[var(--text)]">{s.titulo}</h2>
          <p className="text-xs sm:text-[13px] text-[var(--text-muted)] leading-relaxed mt-1">{s.texto}</p>
        </section>
      ))}
    </div>
  );
}
