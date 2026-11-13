'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Dumbbell,
  Scale,
  Flame,
  Apple,
  TrendingUp,
  MessageSquare,
  AlertCircle,
  CheckCircle2,
  ChevronRight,
  Sparkles,
  Droplet,
  Calendar,
  Clock,
  ArrowRight,
  Activity,
  Award,
} from 'lucide-react';
import { PacienteTopBar } from '@/components/paciente/PacienteNavigation';
import { ConsejoDelDia } from '@/components/paciente/ConsejoDelDia';
import { avanceHaciaMeta } from '@/lib/metas';
import { claveDia } from '@/lib/recordatorio';
import { cargarPerfil, EVENTO_SINCRONIZADO } from '@/lib/offline';

interface PacienteData {
  id: string;
  nombre: string;
  email: string;
  edad: number;
  sexo: string;
  estatura_cm: number;
  peso_actual: number;
  peso_objetivo: number;
  nivel_entrenamiento: string;
  proteina_g_kg: number;
  superavit_kcal: number;
  suplementacion_sugerida?: string | null;
  recomendaciones_nutriologo?: Partial<Record<'suplementos' | 'hidratacion' | 'macros', { texto: string; fecha: string }>>;
  estado_hipertrofia: string;
  tendencia_cargas: string;
  registros?: any[];
  mensajes?: any[];
}

type CitaNutri = { texto: string; fecha: string } | undefined;

const fechaCita = (iso: string) => {
  const d = new Date(iso);
  return isNaN(d.getTime()) ? '' : d.toLocaleDateString('es-MX', { day: 'numeric', month: 'long' });
};

/** Lo que el nutriólogo escribió (cita textual) o "Pendiente de tu nutriólogo". Nunca cifras inventadas. */
function BloqueNutriologo({ cita }: { cita: CitaNutri }) {
  if (!cita) return <p className="text-[11px] font-semibold opacity-90">Pendiente de tu nutriólogo</p>;
  return (
    <div className="space-y-0.5">
      <p className="text-xs font-semibold leading-snug">“{cita.texto}”</p>
      <p className="text-[10px] opacity-80">Tu nutriólogo{fechaCita(cita.fecha) ? `, ${fechaCita(cita.fecha)}` : ''}</p>
    </div>
  );
}

export default function PacienteDashboardPage() {
  const [data, setData] = useState<PacienteData | null>(null);
  const [loading, setLoading] = useState(true);
  // 'datos' = cargó (de internet o de la copia del dispositivo); 'sesion' = sesión caducada; 'vacio' = sin internet y sin copia.
  const [carga, setCarga] = useState<'datos' | 'sesion' | 'vacio'>('datos');
  const [guardadoEn, setGuardadoEn] = useState<number | null>(null); // se llena solo si se muestra la copia del dispositivo
  const [fechaHoyStr, setFechaHoyStr] = useState('');
  const [fechaFormateada, setFechaFormateada] = useState('');

  useEffect(() => {
    const now = new Date();
    // Fecha LOCAL: con toISOString() después de las 18:00 en México "hoy" ya sería mañana (UTC).
    setFechaHoyStr(claveDia(now));
    setFechaFormateada(
      now.toLocaleDateString('es-MX', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
      })
    );

    async function loadData() {
      // Con internet trae lo último; sin internet muestra la copia guardada (más lo que se registró sin conexión).
      const r = await cargarPerfil();
      if (r.estado === 'ok') {
        setData(r.perfil as unknown as PacienteData);
        setGuardadoEn(r.desdeCache ? r.guardadoEn : null);
        setCarga('datos');
      } else {
        setCarga(r.estado === 'sin-sesion' ? 'sesion' : 'vacio');
      }
      setLoading(false);
    }
    loadData();
    // Cuando se sube lo que estaba pendiente, se vuelven a pedir los datos.
    window.addEventListener(EVENTO_SINCRONIZADO, loadData);
    return () => window.removeEventListener(EVENTO_SINCRONIZADO, loadData);
  }, []);

  if (loading) {
    return (
      <div className="w-full">
        <PacienteTopBar titulo="Dashboard" subtitulo="Cargando tu plan..." />
        <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6 animate-pulse">
          <div className="h-20 bg-slate-200 dark:bg-slate-800/60 rounded-2xl"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="h-64 bg-slate-200 dark:bg-slate-800/60 rounded-3xl lg:col-span-2"></div>
            <div className="h-64 bg-slate-200 dark:bg-slate-800/60 rounded-3xl"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="w-full">
        <PacienteTopBar titulo="Dashboard" subtitulo="No se pudo cargar tu plan" />
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div role="alert" className="p-5 rounded-3xl bg-[var(--surface)] border border-[var(--border)] shadow-[var(--shadow-sm)] space-y-3">
            <p className="text-sm font-bold text-[var(--text)]">
              {carga === 'sesion' ? 'Tu sesión caducó.' : 'No hay conexión y todavía no hay datos guardados en este dispositivo.'}
            </p>
            <p className="text-xs text-[var(--text-muted)] leading-relaxed">
              {carga === 'sesion'
                ? 'Inicia sesión de nuevo para ver tu plan.'
                : 'Abre NutriMasa una vez con internet y tus datos quedarán guardados para consultarlos sin conexión.'}
            </p>
            {carga === 'sesion' ? (
              <Link href="/paciente/login" className="inline-flex items-center min-h-[44px] px-4 rounded-xl bg-[var(--primary)] text-white text-xs font-bold">
                Iniciar sesión
              </Link>
            ) : (
              <button
                type="button"
                onClick={() => window.location.reload()}
                className="inline-flex items-center min-h-[44px] px-4 rounded-xl bg-[var(--primary)] text-white text-xs font-bold cursor-pointer"
              >
                Reintentar
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  const paciente = data;

  const peso = Number(paciente.peso_actual || 75);
  const objetivo = Number(paciente.peso_objetivo || 80);
  const diffPeso = Math.abs(objetivo - peso).toFixed(1);
  const faltaSubir = objetivo >= peso;

  // Cálculos científicos según PDF (1.6 - 1.8 g/kg y +400 a +500 kcal)
  const proteinaGramosMin = Math.round(peso * 1.6);
  const proteinaGramosMax = Math.round(peso * 1.8);
  const proteinaActualPrescrita = Math.round(peso * (paciente.proteina_g_kg || 1.75));

  // Comprobar si ya registró hoy
  const registroHoy = paciente.registros?.find((r) => r.fecha === fechaHoyStr);

  // Último mensaje del nutriólogo
  const ultimoMensaje = paciente.mensajes?.slice(-1)[0];

  // Avance desde el primer peso registrado hasta la meta (igual que la app). Sin registros no hay de dónde medirlo.
  const pesosRegistrados = (paciente.registros ?? [])
    .map((r) => Number(r.peso_ayunas))
    .filter((p) => Number.isFinite(p) && p > 0);
  const avance = avanceHaciaMeta({
    pesoInicial: pesosRegistrados.length ? pesosRegistrados[0] : null,
    pesoActual: peso,
    meta: objetivo,
  });
  const porcentajeProgreso = avance?.pct ?? 0;

  return (
    <div className="w-full min-h-full">
      {/* Encabezado Superior Adaptable */}
      <PacienteTopBar
        titulo={`Hola, ${paciente.nombre.split(' ')[0]}`}
        subtitulo={fechaFormateada ? `Hoy es ${fechaFormateada}` : 'Plan de hipertrofia activo'}
        badge="Plan Activo"
      />

      {/* Contenedor Centrado y Fluido (max-w-7xl, clamp de padding) */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {guardadoEn !== null && (
          <p role="status" className="p-3 rounded-2xl bg-[var(--surface)] border border-[var(--border)] text-xs font-semibold text-[var(--text-muted)]">
            Estás viendo los datos guardados en este dispositivo (última actualización:{' '}
            {new Date(guardadoEn).toLocaleString('es-MX', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}). Se
            actualizan solos cuando vuelva la conexión.
          </p>
        )}

        {/* BANNER DE BIENVENIDA / HERO FLUIDO */}
        <section
          aria-label="Resumen de bienvenida"
          className="rounded-3xl p-5 sm:p-6 lg:p-8 bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 text-white shadow-lg shadow-emerald-950/20 relative overflow-hidden"
        >
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1.5 max-w-2xl">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-[11px] font-bold tracking-wide uppercase">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Protocolo de Hipertrofia Miofibrilar</span>
              </div>
              <h2 className="text-xl sm:text-2xl lg:text-3xl font-black tracking-tight leading-tight">
                {paciente.nombre}
              </h2>
              <p className="text-xs sm:text-sm text-emerald-100/90 leading-relaxed">
                Supervisión diaria con superávit calórico controlado (+{paciente.superavit_kcal || 400} kcal) y sobrecarga en sentadilla y banca.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3 shrink-0">
              <Link
                href="/paciente/diario"
                className="px-4 py-2.5 rounded-xl bg-white text-emerald-800 hover:bg-emerald-50 text-xs sm:text-sm font-bold shadow-md transition-all flex items-center gap-2 cursor-pointer min-h-[44px] focus-visible:outline-2 focus-visible:outline-white"
              >
                <Dumbbell className="w-4 h-4 text-emerald-600" />
                <span>Registrar Hoy</span>
              </Link>
              <Link
                href="/paciente/chat"
                className="px-4 py-2.5 rounded-xl bg-emerald-700/60 hover:bg-emerald-700/90 border border-white/25 text-white text-xs sm:text-sm font-bold transition-all flex items-center gap-2 cursor-pointer min-h-[44px] focus-visible:outline-2 focus-visible:outline-white"
              >
                <MessageSquare className="w-4 h-4" />
                <span>Consultar Nutriólogo</span>
              </Link>
            </div>
          </div>

          {/* Adorno visual de fondo */}
          <div className="absolute -right-8 -bottom-12 w-64 h-64 rounded-full bg-white/10 blur-2xl pointer-events-none" />
        </section>

        {/* CONSEJO DEL DÍA (IA con respaldo de lista fija) */}
        <ConsejoDelDia />

        {/* ====================================================================
            LAYOUT GRID RESPONSIVO:
            - Móvil (<640px): 1 columna apilada
            - Tablet (640-1024px): 2 columnas
            - Escritorio (>1024px): 12 columnas (8 col principal, 4 col lateral)
            ==================================================================== */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* ================================================================
              COLUMNA PRINCIPAL (lg:col-span-8)
              ================================================================ */}
          <div className="lg:col-span-8 space-y-6">
            {/* 1. TARJETA: COMPOSICIÓN CORPORAL (Figura 3) */}
            <article
              aria-label="Composición Corporal"
              className="rounded-3xl p-5 sm:p-6 bg-[var(--surface)] border border-[var(--border)] shadow-[var(--shadow-sm)] hover:border-[var(--primary)] transition-all"
            >
              <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-2xl bg-[var(--primary-surface)] border border-[var(--primary-border)] text-[var(--primary-text)] flex items-center justify-center shrink-0">
                    <Scale className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm sm:text-base font-bold text-[var(--text)]">
                      Composición Corporal & Peso
                    </h3>
                    <p className="text-xs text-[var(--text-subtle)]">
                      Monitoreo matutino en ayunas
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-bold border ${
                      paciente.estado_hipertrofia === 'En progreso'
                        ? 'bg-[var(--primary-surface)] text-[var(--primary-text)] border-[var(--primary-border)]'
                        : paciente.estado_hipertrofia === 'Estancado'
                        ? 'bg-[var(--warning-surface)] text-[var(--warning-text)] border-[var(--warning-border)]'
                        : 'bg-[var(--danger-surface)] text-[var(--danger-text)] border-[var(--danger-border)]'
                    }`}
                  >
                    {paciente.estado_hipertrofia}
                  </span>
                </div>
              </div>

              {/* Grid 2 columnas para Peso Actual y Peso Objetivo */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
                <div className="p-4 rounded-2xl bg-[var(--surface-raised)] border border-[var(--border-subtle)]">
                  <span className="text-[11px] font-bold text-[var(--text-muted)] uppercase tracking-wider block">
                    Peso Actual
                  </span>
                  <div className="flex items-baseline gap-1.5 mt-1">
                    <span className="text-3xl sm:text-4xl font-black text-[var(--text)] tracking-tight">
                      {peso}
                    </span>
                    <span className="text-sm font-bold text-[var(--text-muted)]">kg</span>
                  </div>
                  <div className="mt-2 flex items-center gap-1.5 text-xs font-semibold text-[var(--primary)]">
                    <TrendingUp className="w-3.5 h-3.5 shrink-0" />
                    <span>Cargas: {paciente.tendencia_cargas || 'Suben'}</span>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-[var(--surface-raised)] border border-[var(--border-subtle)]">
                  <span className="text-[11px] font-bold text-[var(--text-muted)] uppercase tracking-wider block">
                    Peso Meta
                  </span>
                  <div className="flex items-baseline gap-1.5 mt-1">
                    <span className="text-3xl sm:text-4xl font-black text-[var(--text-subtle)] tracking-tight">
                      {objetivo}
                    </span>
                    <span className="text-sm font-bold text-[var(--text-muted)]">kg</span>
                  </div>
                  <div className="mt-2 text-xs font-semibold text-[var(--text-muted)]">
                    {faltaSubir ? `Faltan +${diffPeso} kg de masa` : `Variación: ${diffPeso} kg`}
                  </div>
                  <Link href="/paciente/metas" className="mt-1.5 inline-block text-xs font-bold text-[var(--primary-text)] underline">
                    Ver o cambiar mi meta
                  </Link>
                </div>
              </div>

              {/* Barra de Progreso Accesible */}
              {avance && (
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-semibold text-[var(--text-muted)]">
                  <span>Avance hacia tu meta</span>
                  <span className="font-bold text-[var(--text)]">{porcentajeProgreso}%</span>
                </div>
                <div
                  role="progressbar"
                  aria-valuenow={porcentajeProgreso}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-label="Progreso hacia meta de peso"
                  className="w-full h-3 rounded-full bg-[var(--surface-active)] overflow-hidden"
                >
                  <div
                    className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full transition-all duration-500"
                    style={{ width: `${porcentajeProgreso}%` }}
                  />
                </div>
                <p className="text-xs text-[var(--text-muted)]">
                  {avance.mensaje}
                </p>
              </div>
              )}
            </article>

            {/* 2. TARJETA: PRESCRIPCIÓN DEL DÍA (4 Subtarjetas en Grid Adaptable) */}
            <article
              aria-label="Prescripción nutricional del día"
              className="rounded-3xl p-5 sm:p-6 bg-[var(--surface)] border border-[var(--border)] shadow-[var(--shadow-sm)] space-y-5"
            >
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-2xl bg-[var(--primary-surface)] border border-[var(--primary-border)] text-[var(--primary-text)] flex items-center justify-center shrink-0">
                    <Apple className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm sm:text-base font-bold text-[var(--text)]">
                      Prescripción Nutricional Diaria
                    </h3>
                    <p className="text-xs text-[var(--text-subtle)]">
                      Basado en ciencia de hipertrofia (Morton et al., 2018; Schoenfeld, 2021)
                    </p>
                  </div>
                </div>

                <span className="px-3 py-1 rounded-full text-xs font-bold bg-[var(--surface-raised)] border border-[var(--border)] text-[var(--text)]">
                  Nivel: {paciente.nivel_entrenamiento}
                </span>
              </div>

              {/* Grid de 4 Métricas (1 col en móvil pequeño, 2 en tablet, 4 en desktop) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* 1. Proteína Diaria */}
                <div className="p-4 rounded-2xl bg-[var(--primary-surface)] border border-[var(--primary-border)] space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--primary-text)]">
                      Proteína Diaria
                    </span>
                    <Sparkles className="w-4 h-4 text-[var(--primary)]" />
                  </div>
                  <div className="text-2xl font-black text-[var(--primary-text)]">
                    {proteinaActualPrescrita} g
                  </div>
                  <p className="text-[11px] font-medium text-[var(--primary-text)] opacity-90">
                    {paciente.proteina_g_kg || '1.75'} g/kg ({proteinaGramosMin}–{proteinaGramosMax} g)
                  </p>
                </div>

                {/* 2. Superávit Calórico */}
                <div className="p-4 rounded-2xl bg-[var(--warning-surface)] border border-[var(--warning-border)] space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--warning-text)]">
                      Superávit
                    </span>
                    <Flame className="w-4 h-4 text-[var(--warning)]" />
                  </div>
                  <div className="text-2xl font-black text-[var(--warning-text)]">
                    +{paciente.superavit_kcal || 400} kcal
                  </div>
                  <p className="text-[11px] font-medium text-[var(--warning-text)] opacity-90">
                    sobre tu dieta habitual
                  </p>
                </div>

                {/* 3. Hidratación: solo la referencia general; lo personal lo indica el nutriólogo */}
                <div className="p-4 rounded-2xl bg-[var(--cyan-surface)] border border-[var(--cyan-border)] space-y-1.5 text-[var(--cyan-text)]">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider">Hidratación</span>
                    <Droplet className="w-4 h-4 text-[var(--cyan)]" />
                  </div>
                  <div className="text-2xl font-black">2 – 2.5 L</div>
                  <p className="text-[11px] font-medium opacity-90">
                    Referencia general al día (más si sudas mucho). No es una indicación personal.
                  </p>
                  {paciente.recomendaciones_nutriologo?.hidratacion && (
                    <BloqueNutriologo cita={paciente.recomendaciones_nutriologo.hidratacion} />
                  )}
                </div>
                {/* 4. Suplementación: solo si el nutriólogo la indicó */}
                <div className="p-4 rounded-2xl bg-[var(--purple-surface)] border border-[var(--purple-border)] space-y-1.5 text-[var(--purple-text)]">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider">Suplementación</span>
                    <Award className="w-4 h-4 text-[var(--purple)]" />
                  </div>
                  {paciente.suplementacion_sugerida ? (
                    <>
                      <div className="text-sm font-black leading-snug">{paciente.suplementacion_sugerida}</div>
                      <p className="text-[11px] font-medium opacity-90">Indicado por tu nutriólogo</p>
                    </>
                  ) : (
                    <>
                      <BloqueNutriologo cita={paciente.recomendaciones_nutriologo?.suplementos} />
                      <p className="text-[10px] opacity-80">Los suplementos los valida un nutriólogo.</p>
                    </>
                  )}
                </div>
              </div>

              {/* Calorías y macronutrientes: los define el nutriólogo */}
              <div className="p-4 rounded-2xl bg-[var(--surface-raised)] border border-[var(--border)] space-y-1.5 text-[var(--text)]">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-subtle)]">
                  Calorías y macronutrientes
                </span>
                <BloqueNutriologo cita={paciente.recomendaciones_nutriologo?.macros} />
              </div>

              {/* Guía Informativa */}
              <div className="p-3.5 rounded-2xl bg-[var(--surface-raised)] border border-[var(--border-subtle)] flex items-start gap-3 text-xs text-[var(--text-muted)]">
                <AlertCircle className="w-4 h-4 text-[var(--primary)] shrink-0 mt-0.5" />
                <p className="leading-relaxed">
                  <strong>Tope de seguridad:</strong> Ingestas superiores a 2.0 g/kg no proveen hipertrofia muscular extra según la evidencia clínica y saturan la oxidación de aminoácidos.
                </p>
              </div>
            </article>
          </div>

          {/* ================================================================
              COLUMNA LATERAL (lg:col-span-4)
              ================================================================ */}
          <div className="lg:col-span-4 space-y-6">
            {/* 1. BANNER: REGISTRO PENDIENTE O COMPLETADO */}
            <article
              aria-label="Estado del registro diario"
              className="rounded-3xl p-5 bg-[var(--surface)] border border-[var(--border)] shadow-[var(--shadow-sm)] space-y-3"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-[var(--primary)]" />
                  <span className="text-xs font-bold text-[var(--text)] uppercase tracking-wider">
                    Registro de Hoy
                  </span>
                </div>
                <span className="text-[11px] text-[var(--text-subtle)]">
                  {fechaHoyStr || 'Hoy'}
                </span>
              </div>

              {!registroHoy ? (
                <div className="p-4 rounded-2xl bg-[var(--warning-surface)] border border-[var(--warning-border)] text-[var(--warning-text)] space-y-3">
                  <div className="flex items-start gap-2.5">
                    <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-xs font-bold">Registro de hoy pendiente</h4>
                      <p className="text-[11px] opacity-90 mt-0.5 leading-relaxed">
                        Pésate en ayunas e ingresa tus cargas para sincronizar tu progreso con el especialista.
                      </p>
                    </div>
                  </div>

                  <Link
                    href="/paciente/diario"
                    className="w-full py-2.5 px-3 rounded-xl bg-[var(--warning)] hover:bg-[var(--warning-hover)] text-white text-xs font-bold flex items-center justify-center gap-2 shadow-sm transition-colors cursor-pointer min-h-[44px] focus-visible:outline-2 focus-visible:outline-emerald-500"
                  >
                    <span>Completar Registro Diario</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              ) : (
                <div className="p-4 rounded-2xl bg-[var(--primary-surface)] border border-[var(--primary-border)] text-[var(--primary-text)] space-y-2">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 shrink-0" />
                    <h4 className="text-xs font-bold">¡Registro de hoy completado!</h4>
                  </div>
                  <p className="text-xs opacity-90">
                    Peso registrado: <strong>{registroHoy.peso_ayunas} kg</strong>.{' '}
                    {registroHoy.pendiente_subida
                      ? 'Guardado en este dispositivo: se subirá cuando haya internet.'
                      : 'Datos sincronizados con tu nutriólogo.'}
                  </p>
                  <Link
                    href="/paciente/diario"
                    className="inline-flex items-center gap-1 text-xs font-bold underline underline-offset-2 hover:opacity-80 pt-1"
                  >
                    <span>Actualizar datos de hoy</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              )}
            </article>

            {/* 2. TARJETA: MENSAJE DEL ESPECIALISTA (Figura 3) */}
            <article
              aria-label="Mensaje del especialista"
              className="rounded-3xl p-5 bg-[var(--surface)] border border-[var(--border)] shadow-[var(--shadow-sm)] space-y-3"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                    <MessageSquare className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-[var(--text)]">Mensaje del Especialista</h4>
                    <p className="text-[10px] text-[var(--text-subtle)]">Nutriólogo Deportivo Asignado</p>
                  </div>
                </div>

                <Link
                  href="/paciente/chat"
                  aria-label="Ir al chat con el nutriólogo"
                  className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-0.5 min-h-[44px] items-center"
                >
                  <span>Chat</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              <div className="p-3.5 rounded-2xl bg-[var(--surface-raised)] border border-[var(--border-subtle)] text-xs text-[var(--text)] space-y-2">
                <p className="italic leading-relaxed">
                  {ultimoMensaje?.contenido
                    ? `"${ultimoMensaje.contenido}"`
                    : '"Mantén la constancia en el peso matutino y la sobrecarga en sentadilla. Si tienes fatiga, avísame en el chat."'}
                </p>
                <div className="flex items-center justify-between text-[10px] text-[var(--text-subtle)] font-medium pt-1 border-t border-[var(--border-subtle)]">
                  <span>Lic. Nutrición Deportiva</span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    Responde &lt; 24h
                  </span>
                </div>
              </div>
            </article>

            {/* 3. TARJETA: ACCESOS RÁPIDOS Y REPORTE */}
            <article
              aria-label="Acciones rápidas"
              className="rounded-3xl p-5 bg-[var(--surface)] border border-[var(--border)] shadow-[var(--shadow-sm)] space-y-3"
            >
              <h4 className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider">
                Acciones Rápidas
              </h4>

              <div className="grid grid-cols-2 gap-3">
                <Link
                  href="/paciente/graficas"
                  className="p-3 rounded-2xl bg-[var(--surface-raised)] hover:bg-[var(--surface-hover)] border border-[var(--border)] text-[var(--text)] text-left flex flex-col justify-between min-h-[72px] transition-colors focus-visible:outline-2 focus-visible:outline-emerald-500"
                >
                  <TrendingUp className="w-5 h-5 text-emerald-600 dark:text-emerald-400 mb-1" />
                  <span className="text-xs font-bold leading-tight">Ver Gráficas</span>
                </Link>

                <Link
                  href="/paciente/menu"
                  className="p-3 rounded-2xl bg-[var(--surface-raised)] hover:bg-[var(--surface-hover)] border border-[var(--border)] text-[var(--text)] text-left flex flex-col justify-between min-h-[72px] transition-colors focus-visible:outline-2 focus-visible:outline-emerald-500"
                >
                  <Award className="w-5 h-5 text-indigo-600 dark:text-indigo-400 mb-1" />
                  <span className="text-xs font-bold leading-tight">Biblioteca & PDF</span>
                </Link>
              </div>
            </article>
          </div>
        </div>
      </div>
    </div>
  );
}
