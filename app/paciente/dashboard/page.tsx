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
  ArrowUpRight,
  Calendar,
  Sparkles,
  Droplet,
  Clock,
} from 'lucide-react';

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
  calorias_totales: number;
  estado_hipertrofia: string;
  tendencia_cargas: string;
  registros?: any[];
  mensajes?: any[];
}

export default function PacienteDashboardPage() {
  const [data, setData] = useState<PacienteData | null>(null);
  const [loading, setLoading] = useState(true);
  const [fechaHoyStr, setFechaHoyStr] = useState('');
  const [fechaFormateada, setFechaFormateada] = useState('');

  useEffect(() => {
    const now = new Date();
    setFechaHoyStr(now.toISOString().split('T')[0]);
    setFechaFormateada(
      now.toLocaleDateString('es-MX', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
      })
    );

    async function loadData() {
      try {
        const res = await fetch('/api/paciente/perfil');
        const json = await res.json();
        if (json.success && json.data) {
          setData(json.data);
        }
      } catch (err) {
        console.error('Error cargando perfil:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  if (loading) {
    return (
      <div className="p-6 space-y-4 animate-pulse">
        <div className="h-6 w-32 bg-slate-200 rounded"></div>
        <div className="h-24 bg-slate-200 rounded-2xl"></div>
        <div className="h-36 bg-slate-200 rounded-2xl"></div>
        <div className="h-28 bg-slate-200 rounded-2xl"></div>
      </div>
    );
  }

  const paciente = data || {
    id: 'usr-paciente-01',
    nombre: 'Paciente Activo',
    email: 'paciente@nutrimasa.com',
    edad: 24,
    sexo: 'M',
    estatura_cm: 178,
    peso_actual: 78.4,
    peso_objetivo: 82.0,
    nivel_entrenamiento: 'Intermedio',
    proteina_g_kg: 1.75,
    superavit_kcal: 400,
    calorias_totales: 2700,
    estado_hipertrofia: 'En progreso',
    tendencia_cargas: 'Suben',
    registros: [],
    mensajes: [],
  };

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

  const getStatusBadge = (estado: string) => {
    switch (estado) {
      case 'En progreso':
        return 'bg-emerald-100 text-emerald-800 border-emerald-300';
      case 'Estancado':
        return 'bg-amber-100 text-amber-800 border-amber-300';
      default:
        return 'bg-rose-100 text-rose-800 border-rose-300';
    }
  };

  return (
    <div className="p-4 space-y-4 pb-12">
      {/* 1. Header Saludo y Perfil (Figura 3) */}
      <div className="flex items-center justify-between pt-1">
        <div>
          <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wider block">
            Plan de Hipertrofia
          </span>
          <h1 className="text-xl font-black text-slate-900 tracking-tight">
            Hola, {paciente.nombre.split(' ')[0]} 👋
          </h1>
          <p className="text-xs text-slate-600">
            {fechaFormateada || 'Plan activo'}
          </p>
        </div>
        <div className="w-10 h-10 rounded-2xl bg-emerald-600 text-white flex items-center justify-center font-bold text-sm shadow-md shadow-emerald-700/20">
          {paciente.nombre.charAt(0)}
        </div>
      </div>

      {/* 2. Banner de Registro Pendiente / Completado */}
      {!registroHoy ? (
        <div className="p-3.5 rounded-2xl bg-gradient-to-r from-amber-500/15 via-amber-500/10 to-transparent border border-amber-500/30 flex items-center justify-between gap-3">
          <div className="flex items-start gap-2.5">
            <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <div className="text-xs font-bold text-amber-900">Registro de hoy pendiente</div>
              <div className="text-[11px] text-amber-700">
                Pésate en ayunas e ingresa tus cargas del día.
              </div>
            </div>
          </div>
          <Link
            href="/paciente/diario"
            className="px-3 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold shrink-0 shadow-sm transition-colors"
          >
            Registrar
          </Link>
        </div>
      ) : (
        <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-emerald-800 font-semibold">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>¡Registro de hoy completado ({registroHoy.peso_ayunas} kg)!</span>
          </div>
          <Link
            href="/paciente/diario"
            className="text-[11px] font-bold text-emerald-700 hover:text-emerald-900 underline"
          >
            Editar
          </Link>
        </div>
      )}

      {/* 3. Tarjeta de Peso Actual y Meta (Figura 3) */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm relative overflow-hidden">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-emerald-100 text-emerald-700">
              <Scale className="w-4 h-4" />
            </div>
            <span className="text-xs font-bold text-slate-700">Composición Corporal</span>
          </div>
          <span
            className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${getStatusBadge(
              paciente.estado_hipertrofia
            )}`}
          >
            {paciente.estado_hipertrofia}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-3">
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
            <span className="text-[10px] font-bold text-slate-600 uppercase block">Peso Actual</span>
            <div className="flex items-baseline gap-1 mt-0.5">
              <span className="text-2xl font-black text-slate-900">{peso}</span>
              <span className="text-xs text-slate-600 font-semibold">kg</span>
            </div>
            <span className="text-[10px] text-emerald-600 font-semibold flex items-center gap-0.5 mt-0.5">
              <TrendingUp className="w-3 h-3" /> Cargas: {paciente.tendencia_cargas || 'Suben'}
            </span>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
            <span className="text-[10px] font-bold text-slate-600 uppercase block">Objetivo</span>
            <div className="flex items-baseline gap-1 mt-0.5">
              <span className="text-2xl font-black text-slate-700">{objetivo}</span>
              <span className="text-xs text-slate-600 font-semibold">kg</span>
            </div>
            <span className="text-[10px] text-slate-600 font-medium block mt-0.5">
              {faltaSubir ? `Faltan +${diffPeso} kg` : `Diferencia: ${diffPeso} kg`}
            </span>
          </div>
        </div>

        {/* Barra de progreso de peso hacia el objetivo */}
        <div>
          <div className="flex justify-between text-[10px] font-semibold text-slate-600 mb-1">
            <span>Progreso hacia volumen magro</span>
            <span>{Math.min(100, Math.round((peso / objetivo) * 100))}%</span>
          </div>
          <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full transition-all duration-500"
              style={{ width: `${Math.min(100, Math.round((peso / objetivo) * 100))}%` }}
            />
          </div>
        </div>
      </div>

      {/* 4. Prescripción Nutricional Diaria (1.6 - 1.8 g/kg y +400 a +500 kcal) */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-teal-100 text-teal-700">
              <Apple className="w-4 h-4" />
            </div>
            <div>
              <span className="text-xs font-bold text-slate-800 block">Prescripción del Día</span>
              <span className="text-[10px] text-slate-600">Calculado para hipertrofia muscular</span>
            </div>
          </div>
          <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
            {paciente.nivel_entrenamiento}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-2.5">
          {/* Tarjeta Proteína */}
          <div className="p-3 rounded-xl bg-gradient-to-br from-emerald-50 to-teal-50/40 border border-emerald-100">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] font-bold text-emerald-950 uppercase">Proteína Diaria</span>
              <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
            </div>
            <div className="text-lg font-black text-emerald-900 leading-tight">
              {proteinaActualPrescrita} g
            </div>
            <div className="text-[10px] text-emerald-700 font-semibold mt-0.5">
              {paciente.proteina_g_kg || '1.75'} g/kg ({proteinaGramosMin}–{proteinaGramosMax} g)
            </div>
          </div>

          {/* Tarjeta Superávit */}
          <div className="p-3 rounded-xl bg-gradient-to-br from-amber-50 to-orange-50/40 border border-amber-100">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] font-bold text-amber-950 uppercase">Superávit Calórico</span>
              <Flame className="w-3.5 h-3.5 text-amber-600" />
            </div>
            <div className="text-lg font-black text-amber-900 leading-tight">
              +{paciente.superavit_kcal || 400} kcal
            </div>
            <div className="text-[10px] text-amber-700 font-semibold mt-0.5">
              Meta: {paciente.calorias_totales || 2700} kcal/día
            </div>
          </div>
        </div>

        {/* Hidratación y Creatina */}
        <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between text-xs text-slate-700">
          <div className="flex items-center gap-2">
            <Droplet className="w-4 h-4 text-cyan-600" />
            <div>
              <span className="font-semibold block text-[11px]">Agua recomendada:</span>
              <span className="text-[10px] text-slate-600">3.5 a 4.0 litros / día</span>
            </div>
          </div>
          <div className="text-right">
            <span className="text-[10px] font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded border border-purple-200">
              Creatina: 5g / día
            </span>
          </div>
        </div>
      </div>

      {/* 5. Tarjeta de Retroalimentación del Nutriólogo (Figura 3) */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-indigo-100 text-indigo-700">
              <MessageSquare className="w-4 h-4" />
            </div>
            <span className="text-xs font-bold text-slate-800">Mensaje de tu Especialista</span>
          </div>
          <Link
            href="/paciente/chat"
            className="text-[11px] font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-0.5"
          >
            Abrir chat
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="p-3 rounded-xl bg-indigo-50/50 border border-indigo-100 text-xs text-slate-700">
          {ultimoMensaje ? (
            <p className="line-clamp-2 italic">
              &quot;{ultimoMensaje.contenido}&quot;
            </p>
          ) : (
            <p className="text-slate-600 italic">
              &quot;Mantén la constancia en el peso matutino. Si las cargas en sentadilla siguen subiendo, el superávit está funcionando óptimamente.&quot;
            </p>
          )}
          <div className="mt-2 flex items-center justify-between text-[10px] text-indigo-700 font-semibold">
            <span>Lic. Nutrición Deportiva</span>
            <span>Nutriólogo Asignado</span>
          </div>
        </div>
      </div>

      {/* 6. Botones de Acción Principal */}
      <div className="grid grid-cols-2 gap-2.5 pt-1">
        <Link
          href="/paciente/diario"
          className="p-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex flex-col items-center justify-center text-center shadow-md shadow-emerald-700/20 transition-colors"
        >
          <Dumbbell className="w-5 h-5 mb-1" />
          <span>Registrar Hoy</span>
          <span className="text-[9px] font-normal opacity-80">Peso y cargas del día</span>
        </Link>

        <Link
          href="/paciente/graficas"
          className="p-3.5 rounded-2xl bg-white hover:bg-slate-50 border border-slate-300 text-slate-800 font-bold text-xs flex flex-col items-center justify-center text-center shadow-sm transition-colors"
        >
          <TrendingUp className="w-5 h-5 mb-1 text-emerald-600" />
          <span>Ver Gráficas</span>
          <span className="text-[9px] font-normal text-slate-600">Progreso de 4 semanas</span>
        </Link>
      </div>
    </div>
  );
}
