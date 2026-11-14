// ============================================================================
// TIPOS DE DATOS: NUTRIMASA
// Basado en el documento de propuesta académica NutriMasa Pro
// ============================================================================

export type EstadoPaciente = 'En progreso' | 'Estancado' | 'Peso sube, cargas no' | 'Sin datos';
export type TendenciaCargas = 'Suben' | 'Sin cambio' | 'Bajan';

export interface Nutriologo {
  id: string;
  nombre: string;
  email: string;
  cedula_profesional: string;
  institucion: string;
  especialidad: string;
}

export interface RegistroDiario {
  id: string;
  usuario_id: string;
  fecha: string; // YYYY-MM-DD
  peso_ayunas: number; // kg
  sentadilla_kg: number;
  press_banca_kg: number;
  peso_muerto_kg?: number;
  volumen_entrenamiento_kg: number;
  series_efectivas: number;
  proteina_consumida_g: number;
  calorias_consumidas: number;
  alerta_exceso_proteina?: boolean; // Se activa si ingesta supera 2.0 g/kg
  notas?: string;
}

export interface Usuario {
  id: string;
  nutriologo_id: string;
  nombre: string;
  email: string;
  edad: number;
  estatura_cm: number;
  peso_inicial: number;
  peso_actual: number;
  peso_objetivo: number;
  nivel_entrenamiento: 'Principiante' | 'Intermedio';
  
  // Parámetros calculados y recomendados (Morton 2018, Urdampilleta 2012)
  proteina_g_kg: number; // 1.6 - 1.8 g/kg (Tope máx 2.0 g/kg)
  superavit_kcal: number; // 400 - 500 kcal
  calorias_mantenimiento: number;
  calorias_totales: number;
  carbohidratos_g: number;
  carbs_peri_entreno_g: number;
  grasas_g: number;
  suplementacion_sugerida: string;
  
  // Estado en la vista del Nutriólogo (Figura 8)
  estado: EstadoPaciente;
  tendencia_cargas: TendenciaCargas;
  
  // Elegibilidad y privacidad (LFPDPPP)
  condicion_renal_diabetes: boolean;
  embarazo_lactancia: boolean;
  trastorno_conducta_alimentaria: boolean;
  elegible: boolean;
  consentimiento_informado: boolean;
  consentimiento_fecha?: string | null; // cuándo aceptó el consentimiento informado (ISO)
  
  // Registros históricos asociados
  registros?: RegistroDiario[];
}

export interface MensajeChat {
  id: string;
  usuario_id: string;
  nutriologo_id: string;
  remitente: 'nutriologo' | 'usuario';
  contenido: string;
  tipo?: 'texto' | 'sugerencia_suplementacion' | 'ajuste_plan' | 'guia_educativa';
  leido: boolean;
  creado_en: string;
  /** Fecha original (ISO) del mensaje, para la regla de los 5 minutos. Solo en datos reales. */
  hora_iso?: string;
  /** Si el autor lo editó. */
  editado_en?: string | null;
}

export interface AjustePlan {
  id: string;
  usuario_id: string;
  nutriologo_id: string;
  superavit_kcal_anterior: number;
  superavit_kcal_nuevo: number;
  proteina_g_kg_anterior: number;
  proteina_g_kg_nuevo: number;
  motivo_ajuste: string;
  creado_en: string;
}

export interface Reporte {
  id: string;
  usuario_id: string;
  nutriologo_id: string;
  periodo_tipo: 'semanal' | 'mensual';
  fecha_inicio: string;
  fecha_fin: string;
  peso_inicial_periodo: number;
  peso_final_periodo: number;
  cambio_peso: number;
  progreso_sentadilla_kg: number;
  progreso_banca_kg: number;
  adherencia_registro_pct: number;
  evaluacion_clinica: string;
  recomendaciones_siguientes: string;
  creado_en: string;
}

export interface ArticuloEducativo {
  id: string;
  titulo: string;
  categoria: 'Proteína & Salud Renal' | 'Superávit Calórico' | 'Suplementación' | 'Entrenamiento';
  resumen: string;
  contenido_completo: string;
  citas_cientificas: string;
  tiempo_lectura_min: number;
  visible_en_app: boolean;
  creado_en: string;
}
