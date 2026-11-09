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
  Palette,
} from 'lucide-react';
import { PacienteTopBar } from '@/components/paciente/PacienteNavigation';
import { ThemeToggle } from '@/components/ThemeToggle';
import { useTheme } from '@/lib/ThemeContext';

interface Articulo {
  id: string;
  titulo: string;
  autor: string;
  tiempoLectura: string;
  resumen: string;
  contenido: string;
  evidencia: string;
}

const ARTICULOS: Articulo[] = [
  {
    id: 'art-1',
    titulo: 'Superávit Calórico Controlado: El "Punto Dulce" de +400 a +500 kcal',
    autor: 'NutriMasa Scientific Review',
    tiempoLectura: '3 min',
    resumen: 'Por qué los superávits excesivos (+1000 kcal) solo aceleran la ganancia de tejido adiposo sin aportar síntesis proteica extra.',
    contenido:
      'En personas con experiencia en fuerza, la tasa máxima de síntesis de tejido muscular esquelético está biológicamente limitada. Un superávit moderado de 400 a 500 kcal diarias sobre el gasto energético total aporta la energía requerida para alimentar el entrenamiento pesado y los procesos anabólicos sin saturar la capacidad de almacenamiento de glucógeno muscular.',
    evidencia: 'Schoenfeld et al., 2021; Slater et al., 2019.',
  },
  {
    id: 'art-2',
    titulo: 'Proteína Diaria: 1.6 a 1.8 g/kg vs el Mito de los 3.0 g/kg',
    autor: 'NutriMasa Scientific Review',
    tiempoLectura: '4 min',
    resumen: 'El metaanálisis más exhaustivo demuestra que por encima de 1.62 g/kg no existe beneficio hipertrófico adicional.',
    contenido:
      'El metaanálisis de Morton et al. (2018) con 49 estudios y 1,863 participantes demostró que la ingesta proteica optimiza la masa magra hasta un límite de 1.62 g/kg/día (con un intervalo de confianza que llega a 1.8 g/kg). Consumir más de 2.0 g/kg simplemente oxida los aminoácidos sobrantes como fuente de combustible o urea, incrementando el coste económico y la fatiga digestiva sin ganancia de músculo.',
    evidencia: 'Morton RW, et al. Br J Sports Med. 2018;52(6):376-384.',
  },
  {
    id: 'art-3',
    titulo: 'Creatina Monohidrato: 3–5g Diarios Sin Fase de Carga',
    autor: 'NutriMasa Scientific Review',
    tiempoLectura: '2 min',
    resumen: 'El suplemento más seguro y respaldado. Desmintiendo retención subcutánea o daño renal en sujetos sanos.',
    contenido:
      'La creatina incrementa las reservas intramusculares de fosfocreatina, aumentando la capacidad de resíntesis rápida de ATP en esfuerzos de máxima intensidad como sentadillas y press de banca. Una dosis continua de 3 a 5 gramos al día satura los depósitos en 3 a 4 semanas con idéntica eficacia que las fases de carga, evitando cualquier malestar gastrointestinal.',
    evidencia: 'Kreider RB, et al. J Int Soc Sports Nutr. 2017;14:18.',
  },
];

export default function PacienteMenuPage() {
  const router = useRouter();
  const { theme } = useTheme();

  const [perfil, setPerfil] = useState<any>(null);
  const [modalArticulo, setModalArticulo] = useState<Articulo | null>(null);
  const [modalAviso, setModalAviso] = useState(false);
  const [reporteDescargado, setReporteDescargado] = useState(false);

  useEffect(() => {
    async function fetchPerfil() {
      try {
        const res = await fetch('/api/paciente/perfil');
        const json = await res.json();
        if (json.success && json.data) {
          setPerfil(json.data);
        }
      } catch (e) {
        console.error('Error cargando perfil:', e);
      }
    }
    fetchPerfil();
  }, []);

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } finally {
      router.push('/');
      router.refresh();
    }
  };

  const handleDescargarReporte = () => {
    setReporteDescargado(true);
    setTimeout(() => {
      window.print();
    }, 400);
  };

  const user = perfil || {
    nombre: 'Paciente Activo',
    email: 'paciente@nutrimasa.com',
    edad: 24,
    peso_actual: 78.4,
    peso_objetivo: 82.0,
    nivel_entrenamiento: 'Intermedio',
    proteina_g_kg: 1.75,
    superavit_kcal: 400,
  };

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
              {user.nombre?.charAt(0) || 'P'}
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-[var(--text)]">
                {user.nombre}
              </h2>
              <p className="text-xs sm:text-sm text-[var(--text-muted)]">
                {user.email}
              </p>
              <div className="flex flex-wrap items-center gap-2 mt-1.5 text-xs text-[var(--primary)] font-semibold">
                <span>{user.edad} años</span>
                <span>•</span>
                <span>{user.peso_actual} kg actual</span>
                <span>•</span>
                <span>Meta {user.peso_objetivo} kg</span>
              </div>
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-[var(--surface-raised)] border border-[var(--border-subtle)] text-xs space-y-0.5 shrink-0">
            <span className="text-[10px] font-bold text-[var(--text-subtle)] uppercase block">
              Nutriólogo Asignado
            </span>
            <span className="font-bold text-[var(--text)] block">
              Nutriólogo Admin
            </span>
            <span className="text-[10px] text-[var(--text-muted)] block">
              Céd. CED-ADMIN-001
            </span>
          </div>
        </article>

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
            3. BIBLIOTECA CIENTÍFICA (Artículos contra el "Bro-Science")
            ================================================================== */}
        <section
          aria-label="Biblioteca científica"
          className="rounded-3xl p-5 sm:p-6 bg-[var(--surface)] border border-[var(--border)] shadow-[var(--shadow-sm)] space-y-4"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-[var(--primary-surface)] text-[var(--primary)] flex items-center justify-center">
                <BookOpen className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm sm:text-base font-bold text-[var(--text)]">
                  Biblioteca Educativa
                </h3>
                <p className="text-xs text-[var(--text-subtle)]">
                  Guías clínicas validadas para desmentir mitos de gimnasio
                </p>
              </div>
            </div>
            <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-[var(--primary-surface)] text-[var(--primary-text)] border border-[var(--primary-border)]">
              {ARTICULOS.length} Guías
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {ARTICULOS.map((art) => (
              <button
                key={art.id}
                onClick={() => setModalArticulo(art)}
                className="p-4 rounded-2xl bg-[var(--surface-raised)] hover:bg-[var(--surface-hover)] border border-[var(--border-subtle)] hover:border-[var(--primary)] text-left transition-all flex flex-col justify-between space-y-3 cursor-pointer group min-h-[140px] focus-visible:outline-2 focus-visible:outline-emerald-500"
              >
                <div>
                  <span className="text-xs font-bold text-[var(--text)] group-hover:text-emerald-600 dark:group-hover:text-emerald-400 block line-clamp-2 leading-snug">
                    {art.titulo}
                  </span>
                  <span className="text-[11px] text-[var(--text-muted)] line-clamp-2 mt-1 block">
                    {art.resumen}
                  </span>
                </div>

                <div className="flex items-center justify-between text-[10px] text-[var(--text-subtle)] pt-2 border-t border-[var(--border-subtle)] w-full font-medium">
                  <span>{art.tiempoLectura}</span>
                  <span className="flex items-center gap-1 text-[var(--primary)] font-bold">
                    Leer <ChevronRight className="w-3 h-3" />
                  </span>
                </div>
              </button>
            ))}
          </div>
        </section>

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
                <p className="text-xs text-[var(--text-subtle)]">Resumen clínico imprimible en PDF</p>
              </div>
            </div>

            <button
              onClick={handleDescargarReporte}
              className="w-full py-3 px-4 rounded-xl bg-[var(--surface-raised)] hover:bg-[var(--surface-hover)] border border-[var(--border)] text-[var(--text)] text-xs font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer min-h-[44px] focus-visible:outline-2 focus-visible:outline-emerald-500"
            >
              <Download className="w-4 h-4 text-[var(--primary)]" />
              <span>Generar / Imprimir Reporte</span>
            </button>
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
          </div>
        </div>

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

      {/* MODAL ARTÍCULO EDUCATIVO */}
      {modalArticulo && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in"
        >
          <div className="w-full max-w-lg bg-[var(--surface)] rounded-3xl p-6 sm:p-8 shadow-2xl border border-[var(--border)] max-h-[85vh] overflow-y-auto space-y-4">
            <div className="flex items-start justify-between gap-3">
              <span className="inline-flex items-center gap-1.5 text-xs font-bold text-[var(--primary)] bg-[var(--primary-surface)] px-3 py-1 rounded-full border border-[var(--primary-border)]">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Ciencia Validada</span>
              </span>
              <button
                onClick={() => setModalArticulo(null)}
                aria-label="Cerrar modal"
                className="w-8 h-8 rounded-full bg-[var(--surface-raised)] hover:bg-[var(--surface-hover)] text-[var(--text-muted)] flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <h3 className="text-lg sm:text-xl font-black text-[var(--text)] leading-snug">
              {modalArticulo.titulo}
            </h3>
            <p className="text-xs text-[var(--text-subtle)] font-medium">
              Por: {modalArticulo.autor} · {modalArticulo.tiempoLectura} de lectura
            </p>

            <div className="text-xs sm:text-sm text-[var(--text-muted)] leading-relaxed space-y-3 pt-3 border-t border-[var(--border)]">
              <p>{modalArticulo.contenido}</p>

              <div className="p-4 rounded-2xl bg-[var(--surface-raised)] border border-[var(--border-subtle)] text-xs text-[var(--text)]">
                <strong className="block font-bold mb-1">Referencia Bibliográfica:</strong>
                <span className="italic opacity-90">{modalArticulo.evidencia}</span>
              </div>
            </div>

            <button
              onClick={() => setModalArticulo(null)}
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs transition-colors cursor-pointer"
            >
              Entendido
            </button>
          </div>
        </div>
      )}

      {/* MODAL AVISO DE PRIVACIDAD */}
      {modalAviso && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in"
        >
          <div className="w-full max-w-md bg-[var(--surface)] rounded-3xl p-6 sm:p-8 shadow-2xl border border-[var(--border)] max-h-[85vh] overflow-y-auto space-y-4">
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

            <div className="text-xs text-[var(--text-muted)] leading-relaxed space-y-3">
              <p>
                Los datos personales y antropométricos (peso, estatura, mediciones de fuerza y mensajes clínicos) recopilados por <strong>NutriMasa Pro</strong> están rigurosamente protegidos conforme a la <em>Ley Federal de Protección de Datos Personales en Posesión de los Particulares (LFPDPPP)</em>.
              </p>
              <p>
                Su tratamiento es estrictamente confidencial para fines exclusivos de supervisión nutricional deportiva por parte del profesional acreditado.
              </p>
            </div>

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
