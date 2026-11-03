'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Dumbbell,
  ArrowRight,
  ShieldCheck,
  AlertCircle,
  CheckCircle2,
  Lock,
  Mail,
  User,
  Scale,
  Ruler,
  Calendar,
  ArrowLeft,
} from 'lucide-react';

export default function PacienteRegistroPage() {
  const router = useRouter();

  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    password: '',
    edad: 24,
    sexo: 'M',
    estatura_cm: 175,
    peso_actual: 72.0,
    peso_objetivo: 78.0,
    nivel_entrenamiento: 'Intermedio',
    sin_enfermedad_renal: true,
    sin_trastornos_alimenticios: true,
    experiencia_minima: true,
    consentimiento_informado: true,
  });

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData((prev) => ({ ...prev, [name]: checked }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validación de criterios de exclusión de salud del estudio (Fig. 2)
    if (!formData.sin_enfermedad_renal) {
      setError('Por seguridad médica, el protocolo con superávit e hipertrofia no admite antecedentes renales o hepáticos no controlados.');
      return;
    }
    if (!formData.sin_trastornos_alimenticios) {
      setError('Por directrices clínicas, se requiere alta médica previa ante antecedentes de TCA.');
      return;
    }
    if (!formData.experiencia_minima) {
      setError('El protocolo requiere al menos 6 meses de experiencia previa con ejercicios de sobrecarga.');
      return;
    }
    if (!formData.consentimiento_informado) {
      setError('Debes aceptar el consentimiento informado y aviso de privacidad LFPDPPP.');
      return;
    }

    if (formData.edad < 18 || formData.edad > 40) {
      setError('El rango de edad del protocolo es de 18 a 40 años.');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/auth/registro', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nombre: formData.nombre,
          email: formData.email,
          password: formData.password,
          edad: Number(formData.edad),
          sexo: formData.sexo,
          estatura_cm: Number(formData.estatura_cm),
          peso_actual: Number(formData.peso_actual),
          peso_objetivo: Number(formData.peso_objetivo),
          nivel_entrenamiento: formData.nivel_entrenamiento,
          sin_enfermedad_renal: formData.sin_enfermedad_renal,
          sin_trastornos_alimenticios: formData.sin_trastornos_alimenticios,
          experiencia_minima: formData.experiencia_minima,
          consentimiento_informado: formData.consentimiento_informado,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setError(data.error || 'Ocurrió un error al registrar tu cuenta.');
        setLoading(false);
        return;
      }

      // Redirigir directamente al dashboard del paciente
      router.push('/paciente/dashboard');
      router.refresh();
    } catch (err) {
      setError('Error de comunicación con el servidor. Verifica tu conexión.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center p-4 py-8">
      <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl relative">
        <Link
          href="/paciente/login"
          className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-emerald-400 mb-6 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Volver a iniciar sesión
        </Link>

        {/* Encabezado */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center text-white shadow-lg shadow-emerald-950/50 shrink-0">
            <Dumbbell className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-black text-xl text-white tracking-tight">NutriMasa</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                Onboarding
              </span>
            </div>
            <p className="text-xs text-slate-400">Cuestionario de Elegibilidad (Figura 2)</p>
          </div>
        </div>

        <h1 className="text-xl font-bold text-white mb-1">Registro de Nuevo Paciente</h1>
        <p className="text-xs text-slate-400 mb-6">
          Completa tus datos personales, antropométricos y de salud. Se configurará tu cálculo automático de proteína (1.6–1.8 g/kg) y superávit calórico.
        </p>

        {error && (
          <div className="mb-5 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-start gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Sección 1: Datos de Cuenta */}
          <div className="space-y-3">
            <h2 className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
              <User className="w-3.5 h-3.5" />
              1. Datos de Acceso
            </h2>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Nombre Completo</label>
              <input
                type="text"
                name="nombre"
                value={formData.nombre}
                onChange={handleChange}
                placeholder="Ej. Roberto Gómez"
                required
                className="w-full bg-slate-950/70 border border-slate-800 focus:border-emerald-500 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Correo Electrónico</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="paciente@correo.com"
                  required
                  className="w-full bg-slate-950/70 border border-slate-800 focus:border-emerald-500 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Contraseña</label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Mínimo 6 caracteres"
                  required
                  className="w-full bg-slate-950/70 border border-slate-800 focus:border-emerald-500 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Sección 2: Antropometría y Experiencia */}
          <div className="space-y-3 pt-3 border-t border-slate-800">
            <h2 className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
              <Scale className="w-3.5 h-3.5" />
              2. Parámetros Físicos y Meta
            </h2>

            <div className="grid grid-cols-3 gap-2.5">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Edad</label>
                <input
                  type="number"
                  name="edad"
                  min={18}
                  max={40}
                  value={formData.edad}
                  onChange={handleChange}
                  className="w-full bg-slate-950/70 border border-slate-800 focus:border-emerald-500 rounded-xl px-3 py-2 text-sm text-white focus:outline-none"
                />
                <span className="text-[10px] text-slate-500">18–40 años</span>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Estatura</label>
                <input
                  type="number"
                  name="estatura_cm"
                  value={formData.estatura_cm}
                  onChange={handleChange}
                  className="w-full bg-slate-950/70 border border-slate-800 focus:border-emerald-500 rounded-xl px-3 py-2 text-sm text-white focus:outline-none"
                />
                <span className="text-[10px] text-slate-500">cm</span>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Sexo</label>
                <select
                  name="sexo"
                  value={formData.sexo}
                  onChange={handleChange}
                  className="w-full bg-slate-950/70 border border-slate-800 focus:border-emerald-500 rounded-xl px-2 py-2 text-sm text-white focus:outline-none"
                >
                  <option value="M">Masc.</option>
                  <option value="F">Fem.</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Peso Inicial (kg)</label>
                <input
                  type="number"
                  step="0.1"
                  name="peso_actual"
                  value={formData.peso_actual}
                  onChange={handleChange}
                  className="w-full bg-slate-950/70 border border-slate-800 focus:border-emerald-500 rounded-xl px-3 py-2 text-sm text-white focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Peso Meta (kg)</label>
                <input
                  type="number"
                  step="0.1"
                  name="peso_objetivo"
                  value={formData.peso_objetivo}
                  onChange={handleChange}
                  className="w-full bg-slate-950/70 border border-slate-800 focus:border-emerald-500 rounded-xl px-3 py-2 text-sm text-white focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Nivel en Pesas / Fuerza</label>
              <select
                name="nivel_entrenamiento"
                value={formData.nivel_entrenamiento}
                onChange={handleChange}
                className="w-full bg-slate-950/70 border border-slate-800 focus:border-emerald-500 rounded-xl px-3 py-2 text-sm text-white focus:outline-none"
              >
                <option value="Principiante">Principiante (6 - 12 meses)</option>
                <option value="Intermedio">Intermedio (1 a 3 años de sobrecarga)</option>
                <option value="Avanzado">Avanzado (&gt; 3 años entrenando)</option>
              </select>
            </div>
          </div>

          {/* Sección 3: Criterios de Exclusión Médica (Figura 2) */}
          <div className="space-y-3 pt-3 border-t border-slate-800">
            <h2 className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5" />
              3. Criterios de Exclusión y Consentimiento
            </h2>

            <div className="space-y-2 bg-slate-950/60 p-3.5 rounded-2xl border border-slate-800 text-xs text-slate-300">
              <label className="flex items-start gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  name="sin_enfermedad_renal"
                  checked={formData.sin_enfermedad_renal}
                  onChange={handleChange}
                  className="mt-0.5 rounded border-slate-700 text-emerald-500 focus:ring-emerald-500 bg-slate-900"
                />
                <span>Declaro <strong>NO</strong> padecer enfermedades renales o hepáticas crónicas.</span>
              </label>

              <label className="flex items-start gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  name="sin_trastornos_alimenticios"
                  checked={formData.sin_trastornos_alimenticios}
                  onChange={handleChange}
                  className="mt-0.5 rounded border-slate-700 text-emerald-500 focus:ring-emerald-500 bg-slate-900"
                />
                <span>Declaro <strong>NO</strong> tener diagnóstico de trastornos alimentarios (TCA).</span>
              </label>

              <label className="flex items-start gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  name="experiencia_minima"
                  checked={formData.experiencia_minima}
                  onChange={handleChange}
                  className="mt-0.5 rounded border-slate-700 text-emerald-500 focus:ring-emerald-500 bg-slate-900"
                />
                <span>Cuento con <strong>al menos 6 meses</strong> continuos de entrenamiento con pesas.</span>
              </label>

              <label className="flex items-start gap-2.5 cursor-pointer pt-1 border-t border-slate-800/80">
                <input
                  type="checkbox"
                  name="consentimiento_informado"
                  checked={formData.consentimiento_informado}
                  onChange={handleChange}
                  className="mt-0.5 rounded border-slate-700 text-emerald-500 focus:ring-emerald-500 bg-slate-900"
                />
                <span className="text-[11px] text-slate-400">
                  Acepto el <strong className="text-white">Consentimiento Informado</strong> y autorizo el tratamiento de mis datos personales según el Aviso de Privacidad y la normativa LFPDPPP.
                </span>
              </label>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-bold rounded-xl text-sm shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
          >
            {loading ? 'Creando cuenta y calculando plan...' : 'Completar Registro y Entrar'}
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
}
