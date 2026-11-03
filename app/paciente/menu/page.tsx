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
} from 'lucide-react';

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
    }, 500);
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
    <div className="p-4 space-y-4 pb-12">
      {/* 1. Header Perfil del Usuario (Figura 7) */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm flex items-center gap-3.5">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white flex items-center justify-center font-black text-lg shadow-md shadow-emerald-700/20 shrink-0">
          {user.nombre?.charAt(0) || 'P'}
        </div>
        <div className="flex-1 min-w-0">
          <h1 className="text-base font-bold text-slate-900 truncate">{user.nombre}</h1>
          <p className="text-xs text-slate-500 truncate">{user.email}</p>
          <div className="flex items-center gap-2 mt-1 text-[10px] text-emerald-700 font-semibold">
            <span>{user.edad} años</span>
            <span>•</span>
            <span>{user.peso_actual} kg actual</span>
            <span>•</span>
            <span>Meta {user.peso_objetivo} kg</span>
          </div>
        </div>
      </div>

      {/* Nutriólogo Asignado Info */}
      <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs">
        <div>
          <span className="text-[10px] font-bold text-slate-600 uppercase block">Especialista Asignado</span>
          <span className="font-bold text-slate-800">Nutriólogo Admin</span>
          <span className="text-[10px] text-slate-600 block">Cédula Profesional: CED-ADMIN-001</span>
        </div>
        <Link
          href="/paciente/chat"
          className="px-3 py-1.5 rounded-xl bg-white border border-slate-200 hover:border-emerald-500 text-emerald-700 font-bold text-[11px] shadow-sm transition-colors"
        >
          Enviar Mensaje
        </Link>
      </div>

      {/* 2. Biblioteca Científica (Artículos Validados) */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm space-y-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-emerald-100 text-emerald-700">
              <BookOpen className="w-4 h-4" />
            </div>
            <div>
              <span className="text-xs font-bold text-slate-800 block">Biblioteca Educativa</span>
              <span className="text-[10px] text-slate-600">Nutrición basada en evidencia</span>
            </div>
          </div>
          <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
            {ARTICULOS.length} Guías
          </span>
        </div>

        <div className="space-y-2">
          {ARTICULOS.map((art) => (
            <button
              key={art.id}
              onClick={() => setModalArticulo(art)}
              className="w-full p-2.5 rounded-xl bg-slate-50 hover:bg-emerald-50/50 border border-slate-100 hover:border-emerald-200 text-left transition-colors flex items-center justify-between group"
            >
              <div className="flex-1 pr-2">
                <span className="text-[11px] font-bold text-slate-900 group-hover:text-emerald-700 block line-clamp-1">
                  {art.titulo}
                </span>
                <span className="text-[10px] text-slate-600 line-clamp-1">{art.resumen}</span>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-emerald-600 shrink-0" />
            </button>
          ))}
        </div>
      </div>

      {/* 3. Exportar Reporte de Progreso Personal */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm space-y-2">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-teal-100 text-teal-700">
            <FileText className="w-4 h-4" />
          </div>
          <div>
            <span className="text-xs font-bold text-slate-800 block">Reporte Periódico de Progreso</span>
            <span className="text-[10px] text-slate-600">Resumen clínico y de sobrecarga en PDF</span>
          </div>
        </div>

        <button
          onClick={handleDescargarReporte}
          className="w-full py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-800 text-xs font-bold flex items-center justify-center gap-2 transition-colors"
        >
          <Download className="w-4 h-4 text-slate-600" />
          <span>Generar / Imprimir Reporte</span>
        </button>
      </div>

      {/* 4. Normativa y Privacidad de Salud */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm space-y-2">
        <button
          onClick={() => setModalAviso(true)}
          className="w-full flex items-center justify-between text-left"
        >
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-blue-100 text-blue-700">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <span className="text-xs font-bold text-slate-800 block">Normativa de Salud y Privacidad</span>
              <span className="text-[10px] text-slate-600">Aviso LFPDPPP y Consentimiento Informado</span>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-400" />
        </button>
      </div>

      {/* 5. Cerrar Sesión */}
      <button
        onClick={handleLogout}
        className="w-full py-3 rounded-2xl bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 text-xs font-bold flex items-center justify-center gap-2 transition-colors shadow-sm"
      >
        <LogOut className="w-4 h-4" />
        <span>Cerrar Sesión</span>
      </button>

      {/* MODAL ARTÍCULO EDUCATIVO */}
      {modalArticulo && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
          <div className="w-full max-w-sm bg-white rounded-3xl p-5 shadow-2xl border border-slate-200 max-h-[85vh] overflow-y-auto">
            <div className="flex items-start justify-between gap-2 mb-3">
              <div className="flex items-center gap-1.5 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                <Sparkles className="w-3 h-3" />
                <span>Ciencia Validada</span>
              </div>
              <button
                onClick={() => setModalArticulo(null)}
                className="w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <h3 className="text-base font-black text-slate-900 mb-2 leading-snug">
              {modalArticulo.titulo}
            </h3>
            <p className="text-[10px] text-slate-600 mb-3 font-semibold">
              Por: {modalArticulo.autor} · {modalArticulo.tiempoLectura} de lectura
            </p>

            <div className="text-xs text-slate-700 leading-relaxed space-y-3 pt-2 border-t border-slate-100">
              <p>{modalArticulo.contenido}</p>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-[11px]">
                <strong className="block text-slate-900 font-bold mb-0.5">Referencia Bibliográfica:</strong>
                <span className="text-slate-600 italic">{modalArticulo.evidencia}</span>
              </div>
            </div>

            <button
              onClick={() => setModalArticulo(null)}
              className="mt-4 w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs transition-colors"
            >
              Entendido
            </button>
          </div>
        </div>
      )}

      {/* MODAL AVISO DE PRIVACIDAD */}
      {modalAviso && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
          <div className="w-full max-w-sm bg-white rounded-3xl p-5 shadow-2xl border border-slate-200 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                Aviso de Privacidad LFPDPPP
              </h3>
              <button
                onClick={() => setModalAviso(false)}
                className="w-7 h-7 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="text-xs text-slate-700 leading-relaxed space-y-2.5">
              <p>
                Los datos personales y antropométricos (peso, estatura, registros de entrenamiento y mensajes) recopilados por <strong>NutriMasa</strong> están protegidos conforme a la <em>Ley Federal de Protección de Datos Personales en Posesión de los Particulares (LFPDPPP)</em>.
              </p>
              <p>
                Su tratamiento es estrictamente confidencial para fines de supervisión nutricional deportiva por parte del profesional acreditado.
              </p>
            </div>

            <button
              onClick={() => setModalAviso(false)}
              className="mt-4 w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl text-xs transition-colors"
            >
              Cerrar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
