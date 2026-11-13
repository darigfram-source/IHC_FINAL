'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  User,
  BookOpen,
  FileText,
  ShieldCheck,
  LogOut,
  ChevronRight,
  ExternalLink,
  Sparkles,
  Info,
  CheckCircle2,
  X,
  Download,
  Dumbbell,
  Sun,
  Moon,
  Laptop,
  Gauge,
  Palette,
  Bell,
  Flag,
  UserRound,
  HelpCircle,
} from 'lucide-react';
import { PacienteTopBar } from '@/components/paciente/PacienteNavigation';
import { ThemeToggle } from '@/components/ThemeToggle';
import { AvisoPrivacidad } from '@/components/AvisoPrivacidad';
import { useTheme } from '@/lib/ThemeContext';
import { nombreVisible, type PerfilNutri } from '@/lib/nutri-perfil';
import { cargarPerfil, cerrarSesion } from '@/lib/offline';

export default function PacienteMenuPage() {
  const router = useRouter();
  const { theme } = useTheme();

  const [perfil, setPerfil] = useState<any>(null);
  // 'cargando' | 'ok' | 'error': sin datos de ejemplo, si no se pueden leer se dice y ya.
  const [estadoPerfil, setEstadoPerfil] = useState<'cargando' | 'ok' | 'error'>('cargando');
  const [modalAviso, setModalAviso] = useState(false);
  // undefined = cargando; null = sin nutriólogo asignado (o no se pudo leer).
  const [nutri, setNutri] = useState<PerfilNutri | null | undefined>(undefined);

  useEffect(() => {
    let vigente = true;
    (async () => {
      let n: PerfilNutri | null = null;
      try {
        const res = await fetch('/api/paciente/nutriologo', { cache: 'no-store' });
        const j = await res.json();
        if (res.ok && j.success) n = j.data as PerfilNutri | null;
      } catch {
        // Se queda como "sin asignar": la pantalla Mi nutriólogo muestra el detalle.
      }
      if (vigente) setNutri(n);
    })();
    return () => {
      vigente = false;
    };
  }, []);

  useEffect(() => {
    async function fetchPerfil() {
      const r = await cargarPerfil(); // sin internet usa la copia guardada
      if (r.estado === 'ok') {
        setPerfil(r.perfil);
        setEstadoPerfil('ok');
      } else {
        setEstadoPerfil('error');
      }
    }
    fetchPerfil();
  }, []);

  const handleLogout = async () => {
    if (await cerrarSesion()) {
      router.push('/');
      router.refresh();
    }
  };

  const user = perfil as { nombre?: string; email?: string; edad?: number; peso_actual?: number | string; peso_objetivo?: number | string; registros?: { peso_ayunas?: number | string }[] } | null;
  // Igual que la app: el peso de hoy es el del último registro; si no hay, el del alta.
  const pesosReg = (user?.registros ?? []).map((r) => Number(r.peso_ayunas)).filter((v) => Number.isFinite(v) && v > 0);
  const pesoHoy = user ? (pesosReg.length ? pesosReg[pesosReg.length - 1] : Number(user.peso_actual)) : NaN;
  const metaKg = user ? Number(user.peso_objetivo) : NaN;
  const nombrePerfil = user?.nombre?.trim() ?? '';

  return (
    <div className="w-full min-h-full">
      <PacienteTopBar
        titulo="Menú y Ajustes"
        subtitulo="Perfil, preferencias de tema y biblioteca"
        badge="Configuración"
      />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* ==================================================================
            1. TARJETA DE PERFIL DEL USUARIO (Adaptable)
            ================================================================== */}
        <article
          aria-label="Información del perfil"
          className="rounded-3xl p-5 sm:p-6 bg-[var(--surface)] border border-[var(--border)] shadow-[var(--shadow-sm)] flex flex-col sm:flex-row sm:items-center justify-between gap-4"
        >
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-emerald-600 to-teal-400 text-white flex items-center justify-center font-black text-2xl shadow-md shrink-0">
              {nombrePerfil.charAt(0).toUpperCase() || '·'}
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-[var(--text)]">
                {user ? nombrePerfil : estadoPerfil === 'cargando' ? 'Cargando…' : 'No se pudieron cargar tus datos'}
              </h2>
              <p className="text-xs sm:text-sm text-[var(--text-muted)]">
                {user ? user.email : estadoPerfil === 'error' ? 'Recarga la página para intentarlo de nuevo.' : ''}
              </p>
              {user && (
                <div className="flex flex-wrap items-center gap-2 mt-1.5 text-xs text-[var(--primary)] font-semibold">
                  {user.edad ? <span>{user.edad} años</span> : null}
                  {Number.isFinite(pesoHoy) && pesoHoy > 0 && (
                    <>
                      <span>•</span>
                      <span>{pesoHoy.toFixed(1)} kg actual</span>
                    </>
                  )}
                  {Number.isFinite(metaKg) && metaKg > 0 && (
                    <>
                      <span>•</span>
                      <span>Meta {metaKg.toFixed(1)} kg</span>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>

          <Link
            href="/paciente/nutriologo"
            aria-label="Ver los datos de mi nutriólogo"
            className="p-3 rounded-2xl bg-[var(--surface-raised)] hover:bg-[var(--surface-hover)] border border-[var(--border-subtle)] text-xs space-y-0.5 shrink-0 transition-colors focus-visible:outline-2 focus-visible:outline-emerald-500"
          >
            <span className="text-[10px] font-bold text-[var(--text-subtle)] uppercase block">
              Mi nutriólogo
            </span>
            <span className="font-bold text-[var(--text)] block">
              {nutri === undefined ? 'Cargando…' : nutri ? nombreVisible(nutri) || 'Tu nutriólogo' : 'Sin asignar todavía'}
            </span>
            <span className="text-[10px] text-[var(--primary-text)] font-semibold flex items-center gap-1">
              {nutri?.cedula_profesional ? `Céd. ${nutri.cedula_profesional} · ` : ''}Ver datos
              <ChevronRight className="w-3 h-3" />
            </span>
          </Link>
        </article>

        {/* Mi perfil y datos (pantalla propia: /paciente/perfil) */}
        <Link
          href="/paciente/perfil"
          aria-label="Editar mi perfil y mis datos"
          className="rounded-3xl p-5 sm:p-6 bg-[var(--surface)] border border-[var(--border)] hover:border-[var(--primary)] shadow-[var(--shadow-sm)] flex items-center justify-between gap-4 transition-all focus-visible:outline-2 focus-visible:outline-emerald-500"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[var(--primary-surface)] text-[var(--primary)] flex items-center justify-center">
              <UserRound className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-[var(--text)]">Mi perfil y datos</h3>
              <p className="text-xs text-[var(--text-subtle)]">Edita tu nombre, edad, peso, estatura y nivel.</p>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-[var(--primary)] shrink-0" />
        </Link>

        {/* ==================================================================
            2. CONFIGURACIÓN DE TEMA (Requisito: Claro, Oscuro y Auto)
            ================================================================== */}
        <section
          aria-label="Ajustes de apariencia"
          className="rounded-3xl p-5 sm:p-6 bg-[var(--surface)] border border-[var(--border)] shadow-[var(--shadow-sm)] space-y-4"
        >
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-amber-500/15 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                <Palette className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm sm:text-base font-bold text-[var(--text)]">
                  Apariencia y Modo Oscuro
                </h3>
                <p className="text-xs text-[var(--text-subtle)]">
                  Selecciona tu preferencia visual (se guarda automáticamente)
                </p>
              </div>
            </div>

            {/* Segmented Control de Tema */}
            <ThemeToggle variant="segmented" />
          </div>

          <div className="p-3.5 rounded-2xl bg-[var(--surface-raised)] border border-[var(--border-subtle)] text-xs text-[var(--text-muted)] flex items-start gap-2.5">
            <Info className="w-4 h-4 text-[var(--primary)] shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              <strong>Automático:</strong> Se adapta al tema de tu sistema operativo (prefers-color-scheme) y se aplica antes del primer render para evitar cualquier parpadeo de pantalla.
            </p>
          </div>
        </section>

        {/* ==================================================================
            3. BIBLIOTECA EDUCATIVA (pantalla propia: /paciente/biblioteca)
            ================================================================== */}
        <Link
          href="/paciente/biblioteca"
          aria-label="Abrir la biblioteca educativa"
          className="rounded-3xl p-5 sm:p-6 bg-[var(--surface)] border border-[var(--border)] hover:border-[var(--primary)] shadow-[var(--shadow-sm)] flex items-center justify-between gap-4 transition-all focus-visible:outline-2 focus-visible:outline-emerald-500"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[var(--primary-surface)] text-[var(--primary)] flex items-center justify-center">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-[var(--text)]">Biblioteca Educativa</h3>
              <p className="text-xs text-[var(--text-subtle)]">
                Guías con referencias científicas y artículos de tu nutriólogo. Con buscador y categorías.
              </p>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-[var(--primary)] shrink-0" />
        </Link>

        {/* Metas (pantalla propia: /paciente/metas) */}
        <Link
          href="/paciente/metas"
          aria-label="Abrir las metas"
          className="rounded-3xl p-5 sm:p-6 bg-[var(--surface)] border border-[var(--border)] hover:border-[var(--primary)] shadow-[var(--shadow-sm)] flex items-center justify-between gap-4 transition-all focus-visible:outline-2 focus-visible:outline-emerald-500"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[var(--primary-surface)] text-[var(--primary)] flex items-center justify-center">
              <Flag className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-[var(--text)]">Metas fijadas</h3>
              <p className="text-xs text-[var(--text-subtle)]">
                {Number.isFinite(metaKg) && metaKg > 0 ? `Tu peso objetivo (${metaKg.toFixed(1)} kg) y tu avance. Puedes cambiarlo.` : 'Tu peso objetivo y tu avance. Puedes cambiarlo.'}
              </p>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-[var(--primary)] shrink-0" />
        </Link>

        {/* Recordatorios y avisos (pantalla propia: /paciente/recordatorios) */}
        <Link
          href="/paciente/recordatorios"
          aria-label="Abrir los recordatorios"
          className="rounded-3xl p-5 sm:p-6 bg-[var(--surface)] border border-[var(--border)] hover:border-[var(--primary)] shadow-[var(--shadow-sm)] flex items-center justify-between gap-4 transition-all focus-visible:outline-2 focus-visible:outline-emerald-500"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/15 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-[var(--text)]">Recordatorios</h3>
              <p className="text-xs text-[var(--text-subtle)]">
                Aviso diario para tu registro y cuando tu nutriólogo te responda.
              </p>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-[var(--primary)] shrink-0" />
        </Link>

        {/* ==================================================================
            4. REPORTES Y PRIVACIDAD DE SALUD
            ================================================================== */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Reporte Periódico */}
          <div className="rounded-3xl p-5 bg-[var(--surface)] border border-[var(--border)] shadow-[var(--shadow-sm)] flex flex-col justify-between space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-teal-500/15 text-teal-600 dark:text-teal-400 flex items-center justify-center">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-[var(--text)]">Reporte de Progreso</h4>
                <p className="text-xs text-[var(--text-subtle)]">Tu resumen y los de tu nutriólogo, en PDF</p>
              </div>
            </div>

            <Link
              href="/paciente/reportes"
              className="w-full py-3 px-4 rounded-xl bg-[var(--surface-raised)] hover:bg-[var(--surface-hover)] border border-[var(--border)] text-[var(--text)] text-xs font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer min-h-[44px] focus-visible:outline-2 focus-visible:outline-emerald-500"
            >
              <Download className="w-4 h-4 text-[var(--primary)]" />
              <span>Ver reportes y descargar PDF</span>
            </Link>
          </div>

          {/* Normativa LFPDPPP */}
          <div className="rounded-3xl p-5 bg-[var(--surface)] border border-[var(--border)] shadow-[var(--shadow-sm)] flex flex-col justify-between space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-blue-500/15 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-[var(--text)]">Privacidad y Normativa</h4>
                <p className="text-xs text-[var(--text-subtle)]">Ley Federal LFPDPPP & Consentimiento</p>
              </div>
            </div>

            <button
              onClick={() => setModalAviso(true)}
              className="w-full py-3 px-4 rounded-xl bg-[var(--surface-raised)] hover:bg-[var(--surface-hover)] border border-[var(--border)] text-[var(--text)] text-xs font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer min-h-[44px] focus-visible:outline-2 focus-visible:outline-emerald-500"
            >
              <ShieldCheck className="w-4 h-4 text-blue-500" />
              <span>Ver Aviso de Privacidad</span>
            </button>

            <Link
              href="/paciente/arco"
              className="w-full py-3 px-4 rounded-xl bg-[var(--surface-raised)] hover:bg-[var(--surface-hover)] border border-[var(--border)] text-[var(--text)] text-xs font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer min-h-[44px] focus-visible:outline-2 focus-visible:outline-emerald-500"
            >
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Ejercer mis derechos ARCO</span>
            </Link>
          </div>
        </div>

        {/* Evaluación de usabilidad (SUS) */}
        <Link
          href="/paciente/sus"
          aria-label="Abrir la evaluación de usabilidad"
          className="rounded-3xl p-5 sm:p-6 bg-[var(--surface)] border border-[var(--border)] hover:border-[var(--primary)] shadow-[var(--shadow-sm)] flex items-center justify-between gap-4 transition-all focus-visible:outline-2 focus-visible:outline-emerald-500"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-teal-500/15 text-teal-600 dark:text-teal-400 flex items-center justify-center">
              <Gauge className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-[var(--text)]">Evaluación de usabilidad (SUS)</h3>
              <p className="text-xs text-[var(--text-subtle)]">10 preguntas y el tiempo de tu registro diario.</p>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-[var(--primary)] shrink-0" />
        </Link>

        {/* Ayuda (pantalla propia: /paciente/ayuda) */}
        <Link
          href="/paciente/ayuda"
          aria-label="Abrir la ayuda y preguntas frecuentes"
          className="rounded-3xl p-5 sm:p-6 bg-[var(--surface)] border border-[var(--border)] hover:border-[var(--primary)] shadow-[var(--shadow-sm)] flex items-center justify-between gap-4 transition-all focus-visible:outline-2 focus-visible:outline-emerald-500"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-500/15 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <HelpCircle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-[var(--text)]">Ayuda</h3>
              <p className="text-xs text-[var(--text-subtle)]">Preguntas frecuentes sobre tu registro, tus datos y el chat.</p>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-[var(--primary)] shrink-0" />
        </Link>

        {/* ==================================================================
            5. CERRAR SESIÓN
            ================================================================== */}
        <button
          onClick={handleLogout}
          className="w-full py-3.5 px-6 rounded-2xl bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/30 dark:hover:bg-rose-950/60 border border-rose-200 dark:border-rose-900/60 text-rose-700 dark:text-rose-400 font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-colors cursor-pointer min-h-[44px] focus-visible:outline-2 focus-visible:outline-rose-500"
        >
          <LogOut className="w-4 h-4" />
          <span>Cerrar Sesión</span>
        </button>
      </div>

      {/* MODAL AVISO DE PRIVACIDAD */}
      {modalAviso && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in"
        >
          <div className="w-full max-w-lg bg-[var(--surface)] rounded-3xl p-6 sm:p-8 shadow-2xl border border-[var(--border)] max-h-[85vh] overflow-y-auto space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-[var(--text)] flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-[var(--primary)]" />
                Aviso de Privacidad LFPDPPP
              </h3>
              <button
                onClick={() => setModalAviso(false)}
                aria-label="Cerrar aviso"
                className="w-8 h-8 rounded-full bg-[var(--surface-raised)] text-[var(--text-muted)] flex items-center justify-center cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <AvisoPrivacidad />

            <Link
              href="/paciente/arco"
              className="block text-center text-xs font-bold text-[var(--primary-text)] underline"
            >
              Ejercer mis derechos (ARCO)
            </Link>

            <button
              onClick={() => setModalAviso(false)}
              className="w-full py-3 bg-[var(--surface-raised)] hover:bg-[var(--surface-hover)] text-[var(--text)] font-bold rounded-xl text-xs transition-colors cursor-pointer border border-[var(--border)]"
            >
              Cerrar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
