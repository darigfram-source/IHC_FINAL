'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { usePathname } from 'next/navigation';
import { metricasReporte } from './reporte';
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
  
  // Panel real (nutriólogo con sesión): datos que vienen de Supabase
  modoReal: boolean;
  cargandoPanel: boolean;
  errorPanel: string | null;
  limpiarErrorPanel: () => void;
  refrescarPanel: () => Promise<void>;

  // Acciones. updatePlan devuelve null si salió bien o el texto del error.
  updatePlan: (data: {
    usuarioId: string;
    superavit_kcal: number;
    proteina_g_kg: number;
    carbs_peri_entreno_g: number;
    grasas_g: number;
    motivo: string;
    suplementacion?: string;
  }) => Promise<string | null>;
  enviarMensaje: (texto: string, tipo?: MensajeChat['tipo'], usuarioId?: string) => void;
  enviarMensajePaciente: (texto: string, usuarioId?: string) => void;
  /** Editan o eliminan un mensaje propio del nutriólogo (5 minutos). Devuelven null si salió bien o el error. */
  editarMensaje: (id: string, texto: string) => Promise<string | null>;
  eliminarMensaje: (id: string) => Promise<string | null>;
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

  // Modo real: dentro de /admin con sesión de nutriólogo verificado, los datos vienen de Supabase.
  const pathname = usePathname();
  const enAdmin = pathname?.startsWith('/admin') && !pathname.startsWith('/admin/login');
  const [modoReal, setModoReal] = useState(false);
  const [cargandoPanel, setCargandoPanel] = useState<boolean>(false);
  const [errorPanel, setErrorPanel] = useState<string | null>(null);

  // Modales
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isAdjustModalOpen, setIsAdjustModalOpen] = useState(false);
  const [isNewArticleModalOpen, setIsNewArticleModalOpen] = useState(false);
  const [isLegalModalOpen, setIsLegalModalOpen] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);

  // Carga inicial de localStorage para persistencia (solo datos de demostración)
  useEffect(() => {
    if (typeof window !== 'undefined' && !enAdmin) {
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
  }, [enAdmin]);

  // Guardado automático en localStorage. Con datos reales NO se guarda nada de pacientes
  // en el navegador (son datos de salud).
  useEffect(() => {
    if (typeof window !== 'undefined' && !modoReal && !enAdmin) {
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
  }, [usuarios, mensajes, articulos, reportes, selectedUsuarioId, activePatientId, modoReal, enAdmin]);

  // Fecha local legible ('YYYY-MM-DD HH:mm:ss'), como la usan las vistas del panel.
  const fechaLocal = (iso: string) => {
    const d = new Date(iso);
    if (isNaN(d.getTime())) return String(iso).replace('T', ' ').slice(0, 19);
    const p = (n: number) => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}:${p(d.getSeconds())}`;
  };

  const refrescarPanel = useCallback(async () => {
    try {
      const res = await fetch('/api/nutriologo/panel', { cache: 'no-store' });
      if (res.status === 401) {
        setModoReal(false);
        return;
      }
      const j = await res.json();
      if (!res.ok || !j.success) throw new Error(j.error || 'Error');
      const d = j.data;
      setNutriologo(d.nutriologo);
      setUsuarios(d.usuarios);
      setMensajes(
        d.mensajes.map((m: MensajeChat) => ({ ...m, hora_iso: m.creado_en, creado_en: fechaLocal(m.creado_en) }))
      );
      setReportes(d.reportes);
      setArticulos(d.articulos);
      setSelectedUsuarioId((prev) =>
        d.usuarios.some((u: Usuario) => u.id === prev) ? prev : d.usuarios[0]?.id ?? ''
      );
      setModoReal(true);
      setIsAuthenticated(true);
      setErrorPanel(null);
    } catch {
      setErrorPanel('No se pudo conectar con la base. Se reintenta solo.');
    } finally {
      setCargandoPanel(false);
    }
  }, []);

  // Carga al entrar a /admin y sondeo cada 30 s (como la app) mientras la pestaña está visible.
  useEffect(() => {
    if (!enAdmin) {
      setModoReal(false);
      return;
    }
    setCargandoPanel(true);
    refrescarPanel();
    const t = setInterval(() => {
      if (document.visibilityState === 'visible') refrescarPanel();
    }, 30_000);
    return () => clearInterval(t);
  }, [enAdmin, refrescarPanel]);

  // Al abrir un chat con mensajes sin leer, se marcan como leídos.
  useEffect(() => {
    if (!modoReal || activeTab !== 'mensajes' || !selectedUsuarioId) return;
    const hayPendientes = mensajes.some(
      (m) => m.usuario_id === selectedUsuarioId && m.remitente === 'usuario' && !m.leido
    );
    if (!hayPendientes) return;
    setMensajes((prev) =>
      prev.map((m) =>
        m.usuario_id === selectedUsuarioId && m.remitente === 'usuario' ? { ...m, leido: true } : m
      )
    );
    fetch('/api/nutriologo/mensajes', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ usuario_id: selectedUsuarioId }),
    }).catch(() => {});
  }, [modoReal, activeTab, selectedUsuarioId, mensajes]);

  const llamar = async (url: string, method: string, body: unknown) => {
    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const j = await res.json().catch(() => ({}));
      if (!res.ok || !j.success) return { ok: false as const, error: (j.error as string) || 'Error de conexión', j };
      return { ok: true as const, error: null, j };
    } catch {
      return { ok: false as const, error: 'No se pudo conectar. Revisa tu internet.', j: {} };
    }
  };

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

  const updatePlan = async ({
    usuarioId,
    superavit_kcal,
    proteina_g_kg,
    carbs_peri_entreno_g,
    grasas_g,
    motivo,
    suplementacion,
  }: {
    usuarioId: string;
    superavit_kcal: number;
    proteina_g_kg: number;
    carbs_peri_entreno_g: number;
    grasas_g: number;
    motivo: string;
    suplementacion?: string;
  }): Promise<string | null> => {
    if (modoReal) {
      const r = await llamar('/api/nutriologo/plan', 'POST', {
        usuario_id: usuarioId,
        superavit_kcal,
        proteina_g_kg,
        motivo,
        suplementacion,
      });
      if (!r.ok) return r.error;
      if (r.j?.suplementacionNoGuardada) {
        await refrescarPanel();
        return 'El plan se guardó, pero la base no permitió guardar la suplementación. Revisa tus políticas RLS de usuarios.';
      }
      await refrescarPanel();
      return null;
    }
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
    return null;
  };

  const enviarMensaje = (
    texto: string,
    tipo: MensajeChat['tipo'] = 'texto',
    targetUserId?: string
  ) => {
    const target = targetUserId || selectedUsuarioId;
    if (!texto.trim() || !target) return;

    if (modoReal) {
      const temporal: MensajeChat = {
        id: `tmp-${Date.now()}`,
        usuario_id: target,
        nutriologo_id: nutriologo?.id || '',
        remitente: 'nutriologo',
        tipo,
        contenido: texto,
        leido: false,
        creado_en: fechaLocal(new Date().toISOString()),
      };
      setMensajes((prev) => [...prev, temporal]);
      llamar('/api/nutriologo/mensajes', 'POST', { usuario_id: target, contenido: texto, tipo }).then((r) => {
        if (!r.ok) {
          setMensajes((prev) => prev.filter((m) => m.id !== temporal.id));
          setErrorPanel(`No se envió el mensaje: ${r.error}`);
        } else {
          refrescarPanel();
        }
      });
      return;
    }

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

  const editarMensaje = async (id: string, texto: string): Promise<string | null> => {
    const limpio = texto.trim();
    if (!limpio) return 'El mensaje no puede quedar vacío.';
    if (!modoReal) return 'Solo se puede editar en el panel conectado.';
    const r = await llamar('/api/nutriologo/mensajes', 'PATCH', { id, contenido: limpio });
    if (!r.ok) return r.error;
    await refrescarPanel();
    return null;
  };

  const eliminarMensaje = async (id: string): Promise<string | null> => {
    if (!modoReal) return 'Solo se puede eliminar en el panel conectado.';
    const r = await llamar('/api/nutriologo/mensajes', 'DELETE', { id });
    if (!r.ok) return r.error;
    await refrescarPanel();
    return null;
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
    if (modoReal) {
      const actual = articulos.find((a) => a.id === articuloId);
      if (!actual) return;
      setArticulos((prev) =>
        prev.map((a) => (a.id === articuloId ? { ...a, visible_en_app: !a.visible_en_app } : a))
      );
      llamar('/api/nutriologo/articulos', 'PATCH', {
        id: articuloId,
        visible_en_app: !actual.visible_en_app,
      }).then((r) => {
        if (!r.ok) setErrorPanel(`No se cambió la visibilidad: ${r.error}`);
        refrescarPanel();
      });
      return;
    }
    setArticulos((prev) =>
      prev.map((art) => (art.id === articuloId ? { ...art, visible_en_app: !art.visible_en_app } : art))
    );
  };

  const agregarArticulo = (articuloData: Omit<ArticuloEducativo, 'id' | 'creado_en'>) => {
    if (modoReal) {
      llamar('/api/nutriologo/articulos', 'POST', articuloData).then((r) => {
        if (!r.ok) setErrorPanel(`No se guardó el artículo: ${r.error}`);
        refrescarPanel();
      });
      return;
    }
    const nuevo: ArticuloEducativo = {
      ...articuloData,
      id: `art-${Date.now()}`,
      creado_en: new Date().toISOString().split('T')[0],
    };
    setArticulos((prev) => [nuevo, ...prev]);
  };

  const generarReporte = (reporteData: Omit<Reporte, 'id' | 'creado_en' | 'nutriologo_id'>): Reporte => {
    // Con datos reales las cifras salen de los registros del paciente (no de valores fijos).
    let datos = reporteData;
    if (modoReal) {
      const u = usuarios.find((x) => x.id === reporteData.usuario_id);
      const m = metricasReporte(u?.registros ?? [], reporteData.periodo_tipo);
      if (m) datos = { ...reporteData, ...m };
      llamar('/api/nutriologo/reportes', 'POST', {
        usuario_id: reporteData.usuario_id,
        periodo_tipo: reporteData.periodo_tipo,
        evaluacion_clinica: reporteData.evaluacion_clinica,
        recomendaciones_siguientes: reporteData.recomendaciones_siguientes,
      }).then((r) => {
        if (!r.ok) setErrorPanel(`No se guardó el reporte: ${r.error}`);
        refrescarPanel();
      });
    }
    const nuevo: Reporte = {
      ...datos,
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
    if (modoReal) {
      fetch('/api/auth/logout', { method: 'POST' })
        .catch(() => {})
        .finally(() => {
          window.location.href = '/admin/login';
        });
      return;
    }
    setIsAuthenticated(false);
  };

  const resetToInitial = () => {
    if (modoReal) return; // con datos reales no hay "demo" que restablecer
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
        modoReal,
        cargandoPanel,
        errorPanel,
        limpiarErrorPanel: () => setErrorPanel(null),
        refrescarPanel,
        updatePlan,
        enviarMensaje,
        enviarMensajePaciente,
        editarMensaje,
        eliminarMensaje,
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
