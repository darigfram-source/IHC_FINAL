'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  Nutriologo,
  Usuario,
  RegistroDiario,
  MensajeChat,
  ArticuloEducativo,
  Reporte,
  AjustePlan,
} from './types';
import {
  INITIAL_NUTRIOLOGO,
  INITIAL_USUARIOS,
  INITIAL_MENSAJES,
  INITIAL_ARTICULOS,
  INITIAL_REPORTES,
} from './data/initialData';

interface NutriMasaContextType {
  nutriologo: Nutriologo | null;
  usuarios: Usuario[];
  selectedUsuario: Usuario | null;
  selectedUsuarioId: string;
  setSelectedUsuarioId: (id: string) => void;
  
  // Paciente activo en la App Móvil
  activePatientId: string;
  setActivePatientId: (id: string) => void;
  activePatient: Usuario | null;

  mensajes: MensajeChat[];
  articulos: ArticuloEducativo[];
  reportes: Reporte[];
  activeTab: 'usuarios' | 'mensajes' | 'reportes' | 'biblioteca';
  setActiveTab: (tab: 'usuarios' | 'mensajes' | 'reportes' | 'biblioteca') => void;
  
  // Modales
  isDetailModalOpen: boolean;
  setIsDetailModalOpen: (open: boolean) => void;
  isAdjustModalOpen: boolean;
  setIsAdjustModalOpen: (open: boolean) => void;
  isNewArticleModalOpen: boolean;
  setIsNewArticleModalOpen: (open: boolean) => void;
  isLegalModalOpen: boolean;
  setIsLegalModalOpen: (open: boolean) => void;
  isReportModalOpen: boolean;
  setIsReportModalOpen: (open: boolean) => void;
  
  // Acciones
  updatePlan: (data: {
    usuarioId: string;
    superavit_kcal: number;
    proteina_g_kg: number;
    carbs_peri_entreno_g: number;
    grasas_g: number;
    motivo: string;
  }) => void;
  enviarMensaje: (texto: string, tipo?: MensajeChat['tipo'], usuarioId?: string) => void;
  enviarMensajePaciente: (texto: string, usuarioId?: string) => void;
  agregarRegistroDiario: (usuarioId: string, registro: Omit<RegistroDiario, 'id' | 'usuario_id'>) => void;
  actualizarElegibilidad: (usuarioId: string, datos: Partial<Usuario>) => void;
  toggleArticuloVisibility: (articuloId: string) => void;
  agregarArticulo: (articulo: Omit<ArticuloEducativo, 'id' | 'creado_en'>) => void;
  generarReporte: (reporte: Omit<Reporte, 'id' | 'creado_en' | 'nutriologo_id'>) => Reporte;
  
  // Auth
  isAuthenticated: boolean;
  login: (email: string, role: 'nutriologo' | 'usuario') => boolean;
  logout: () => void;
  resetToInitial: () => void;
}

const NutriMasaContext = createContext<NutriMasaContextType | undefined>(undefined);

const STORAGE_KEY = 'nutrimasa_state_v2';

export const NutriMasaProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(true);
  const [nutriologo, setNutriologo] = useState<Nutriologo | null>(INITIAL_NUTRIOLOGO);
  const [usuarios, setUsuarios] = useState<Usuario[]>(INITIAL_USUARIOS);
  const [selectedUsuarioId, setSelectedUsuarioId] = useState<string>('usr-02');
  const [activePatientId, setActivePatientId] = useState<string>('usr-02');
  const [mensajes, setMensajes] = useState<MensajeChat[]>(INITIAL_MENSAJES);
  const [articulos, setArticulos] = useState<ArticuloEducativo[]>(INITIAL_ARTICULOS);
  const [reportes, setReportes] = useState<Reporte[]>(INITIAL_REPORTES);
  const [activeTab, setActiveTab] = useState<'usuarios' | 'mensajes' | 'reportes' | 'biblioteca'>('usuarios');

  // Modales
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isAdjustModalOpen, setIsAdjustModalOpen] = useState(false);
  const [isNewArticleModalOpen, setIsNewArticleModalOpen] = useState(false);
  const [isLegalModalOpen, setIsLegalModalOpen] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);

  // Carga inicial de localStorage para persistencia
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
          const parsed = JSON.parse(saved);
          if (parsed.usuarios) setUsuarios(parsed.usuarios);
          if (parsed.mensajes) setMensajes(parsed.mensajes);
          if (parsed.articulos) setArticulos(parsed.articulos);
          if (parsed.reportes) setReportes(parsed.reportes);
          if (parsed.selectedUsuarioId) setSelectedUsuarioId(parsed.selectedUsuarioId);
          if (parsed.activePatientId) setActivePatientId(parsed.activePatientId);
        }
      } catch (e) {
        console.error('Error cargando estado guardado:', e);
      }
    }
  }, []);

  // Guardado automático en localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const stateToSave = {
          usuarios,
          mensajes,
          articulos,
          reportes,
          selectedUsuarioId,
          activePatientId,
        };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(stateToSave));
      } catch (e) {
        console.error('Error guardando estado:', e);
      }
    }
  }, [usuarios, mensajes, articulos, reportes, selectedUsuarioId, activePatientId]);

  const selectedUsuario = usuarios.find((u) => u.id === selectedUsuarioId) || usuarios[0] || null;
  const activePatient = usuarios.find((u) => u.id === activePatientId) || usuarios[0] || null;

  // Registrar un nuevo día desde la vista móvil del paciente y actualizar métricas dinámicamente
  const agregarRegistroDiario = (
    usuarioId: string,
    registroData: Omit<RegistroDiario, 'id' | 'usuario_id'>
  ) => {
    const nuevoRegistro: RegistroDiario = {
      ...registroData,
      id: `reg-${Date.now()}`,
      usuario_id: usuarioId,
    };

    setUsuarios((prevUsuarios) =>
      prevUsuarios.map((user) => {
        if (user.id !== usuarioId) return user;

        const registrosActuales = user.registros || [];
        const ultRegPrevio = registrosActuales[registrosActuales.length - 1];

        // Comparar progresión de cargas
        let tendencia = user.tendencia_cargas;
        if (ultRegPrevio) {
          const sentadillaSubio = nuevoRegistro.sentadilla_kg > ultRegPrevio.sentadilla_kg;
          const bancaSubio = nuevoRegistro.press_banca_kg > ultRegPrevio.press_banca_kg;
          const sentadillaBajo = nuevoRegistro.sentadilla_kg < ultRegPrevio.sentadilla_kg;

          if (sentadillaSubio || bancaSubio) {
            tendencia = 'Suben';
          } else if (sentadillaBajo) {
            tendencia = 'Bajan';
          } else {
            tendencia = 'Sin cambio';
          }
        }

        // Evaluar estado clínico
        let nuevoEstado = user.estado;
        const pesoSubio = nuevoRegistro.peso_ayunas > user.peso_actual;
        if (pesoSubio && tendencia === 'Sin cambio') {
          nuevoEstado = 'Peso sube, cargas no';
        } else if (tendencia === 'Suben') {
          nuevoEstado = 'En progreso';
        } else if (tendencia === 'Sin cambio' && !pesoSubio) {
          nuevoEstado = 'Estancado';
        }

        // Recalcular dinámicamente según el nuevo peso en ayunas
        const nuevoPeso = nuevoRegistro.peso_ayunas;

        return {
          ...user,
          peso_actual: nuevoPeso,
          tendencia_cargas: tendencia,
          estado: nuevoEstado,
          registros: [...registrosActuales, nuevoRegistro],
        };
      })
    );
  };

  const actualizarElegibilidad = (usuarioId: string, datos: Partial<Usuario>) => {
    setUsuarios((prev) =>
      prev.map((u) => (u.id === usuarioId ? { ...u, ...datos } : u))
    );
  };

  const updatePlan = ({
    usuarioId,
    superavit_kcal,
    proteina_g_kg,
    carbs_peri_entreno_g,
    grasas_g,
    motivo,
  }: {
    usuarioId: string;
    superavit_kcal: number;
    proteina_g_kg: number;
    carbs_peri_entreno_g: number;
    grasas_g: number;
    motivo: string;
  }) => {
    setUsuarios((prev) =>
      prev.map((user) => {
        if (user.id !== usuarioId) return user;

        const nuevasCaloriasTotales = user.calorias_mantenimiento + superavit_kcal;
        const nuevosCarbsG = Math.round(
          (nuevasCaloriasTotales - proteina_g_kg * user.peso_actual * 4 - grasas_g * 9) / 4
        );

        let nuevoEstado = user.estado;
        if (user.estado === 'Estancado') {
          nuevoEstado = 'En progreso';
        } else if (user.estado === 'Peso sube, cargas no' && superavit_kcal <= 400) {
          nuevoEstado = 'En progreso';
        }

        return {
          ...user,
          superavit_kcal,
          proteina_g_kg,
          carbs_peri_entreno_g,
          grasas_g,
          carbohidratos_g: Math.max(200, nuevosCarbsG),
          calorias_totales: nuevasCaloriasTotales,
          estado: nuevoEstado,
        };
      })
    );

    const nuevoMensaje: MensajeChat = {
      id: `msg-${Date.now()}`,
      usuario_id: usuarioId,
      nutriologo_id: nutriologo?.id || 'nut-01',
      remitente: 'nutriologo',
      tipo: 'ajuste_plan',
      contenido: `📋 Plan actualizado: Se ajustó el superávit calórico a +${superavit_kcal} kcal y proteína a ${proteina_g_kg} g/kg (${(
        proteina_g_kg * (selectedUsuario?.peso_actual || 70)
      ).toFixed(0)}g totales). Motivo clínico: ${motivo}`,
      leido: false,
      creado_en: new Date().toISOString().replace('T', ' ').slice(0, 19),
    };
    setMensajes((prev) => [...prev, nuevoMensaje]);
  };

  const enviarMensaje = (
    texto: string,
    tipo: MensajeChat['tipo'] = 'texto',
    targetUserId?: string
  ) => {
    const target = targetUserId || selectedUsuarioId;
    if (!texto.trim() || !target) return;

    const nuevoMensaje: MensajeChat = {
      id: `msg-${Date.now()}`,
      usuario_id: target,
      nutriologo_id: nutriologo?.id || 'nut-01',
      remitente: 'nutriologo',
      tipo,
      contenido: texto,
      leido: true,
      creado_en: new Date().toISOString().replace('T', ' ').slice(0, 19),
    };

    setMensajes((prev) => [...prev, nuevoMensaje]);
  };

  const enviarMensajePaciente = (texto: string, usuarioId?: string) => {
    const target = usuarioId || activePatientId;
    if (!texto.trim() || !target) return;

    const nuevoMensaje: MensajeChat = {
      id: `msg-${Date.now()}`,
      usuario_id: target,
      nutriologo_id: nutriologo?.id || 'nut-01',
      remitente: 'usuario',
      tipo: 'texto',
      contenido: texto,
      leido: false,
      creado_en: new Date().toISOString().replace('T', ' ').slice(0, 19),
    };

    setMensajes((prev) => [...prev, nuevoMensaje]);
  };

  const toggleArticuloVisibility = (articuloId: string) => {
    setArticulos((prev) =>
      prev.map((art) => (art.id === articuloId ? { ...art, visible_en_app: !art.visible_en_app } : art))
    );
  };

  const agregarArticulo = (articuloData: Omit<ArticuloEducativo, 'id' | 'creado_en'>) => {
    const nuevo: ArticuloEducativo = {
      ...articuloData,
      id: `art-${Date.now()}`,
      creado_en: new Date().toISOString().split('T')[0],
    };
    setArticulos((prev) => [nuevo, ...prev]);
  };

  const generarReporte = (reporteData: Omit<Reporte, 'id' | 'creado_en' | 'nutriologo_id'>): Reporte => {
    const nuevo: Reporte = {
      ...reporteData,
      id: `rep-${Date.now()}`,
      nutriologo_id: nutriologo?.id || 'nut-01',
      creado_en: new Date().toISOString().replace('T', ' ').slice(0, 19),
    };
    setReportes((prev) => [nuevo, ...prev]);
    return nuevo;
  };

  const login = (email: string, role: 'nutriologo' | 'usuario') => {
    setIsAuthenticated(true);
    setNutriologo(INITIAL_NUTRIOLOGO);
    return true;
  };

  const logout = () => {
    setIsAuthenticated(false);
  };

  const resetToInitial = () => {
    setUsuarios(INITIAL_USUARIOS);
    setMensajes(INITIAL_MENSAJES);
    setArticulos(INITIAL_ARTICULOS);
    setReportes(INITIAL_REPORTES);
    setSelectedUsuarioId('usr-02');
    setActivePatientId('usr-02');
    setNutriologo(INITIAL_NUTRIOLOGO);
    if (typeof window !== 'undefined') {
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem('nutrimasa_state_v1');
    }
  };

  return (
    <NutriMasaContext.Provider
      value={{
        nutriologo,
        usuarios,
        selectedUsuario,
        selectedUsuarioId,
        setSelectedUsuarioId,
        activePatientId,
        setActivePatientId,
        activePatient,
        mensajes,
        articulos,
        reportes,
        activeTab,
        setActiveTab,
        isDetailModalOpen,
        setIsDetailModalOpen,
        isAdjustModalOpen,
        setIsAdjustModalOpen,
        isNewArticleModalOpen,
        setIsNewArticleModalOpen,
        isLegalModalOpen,
        setIsLegalModalOpen,
        isReportModalOpen,
        setIsReportModalOpen,
        updatePlan,
        enviarMensaje,
        enviarMensajePaciente,
        agregarRegistroDiario,
        actualizarElegibilidad,
        toggleArticuloVisibility,
        agregarArticulo,
        generarReporte,
        isAuthenticated,
        login,
        logout,
        resetToInitial,
      }}
    >
      {children}
    </NutriMasaContext.Provider>
  );
};

export const useNutriMasa = () => {
  const context = useContext(NutriMasaContext);
  if (!context) {
    throw new Error('useNutriMasa debe usarse dentro de un NutriMasaProvider');
  }
  return context;
};
