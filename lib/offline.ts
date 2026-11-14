// Modo sin internet de la web (punto 14). Misma idea que la app Flutter (store.dart / almacen.dart):
// lo local manda, lo pendiente se sube en cuanto hay conexión y nunca se pierde un registro por falta de red.
//
//  - Caché del perfil: la última respuesta de /api/paciente/perfil, para poder mostrar pantallas sin internet.
//  - Cola de envíos: registro diario, meta, cuestionario SUS y solicitudes ARCO hechos sin conexión.
//
// Todo vive en localStorage de este navegador y cada pendiente lleva el id de la persona a la que pertenece:
// si otra persona entra en el mismo navegador, los pendientes de la primera NO se suben a la cuenta de la segunda.

export interface Almacenamiento {
  getItem(clave: string): string | null;
  setItem(clave: string, valor: string): void;
  removeItem(clave: string): void;
}

export const CLAVE_CACHE = 'nm_offline_v1_cache';
export const CLAVE_COLA = 'nm_offline_v1_cola';
export const EVENTO_COLA = 'nutrimasa:cola'; // cambió la cola (se encoló o se envió algo)
export const EVENTO_SINCRONIZADO = 'nutrimasa:sincronizado'; // se subió algo: las pantallas pueden recargar sus datos
const MAX_COLA = 200;

function almacenPorDefecto(): Almacenamiento | null {
  try {
    return typeof localStorage === 'undefined' ? null : localStorage;
  } catch {
    return null; // modo privado estricto o almacenamiento bloqueado
  }
}

// ---------------------------------------------------------------------------------------------- tipos

export interface CuerpoRegistro {
  fecha: string; // AAAA-MM-DD (día local de la persona)
  peso_ayunas: number;
  sentadilla_kg: number;
  press_banca_kg: number;
  volumen_entrenamiento_kg: number;
  proteina_consumida_g: number | null; // opcional: null si no la registró
  notas: string;
}

interface Comun {
  id: string;
  owner: string; // usuarios.id de la persona que lo creó
  creado: number;
}
export interface ItemRegistro extends Comun {
  tipo: 'registro';
  fecha: string;
  cuerpo: CuerpoRegistro;
}
export interface ItemMeta extends Comun {
  tipo: 'meta';
  valor: number;
}
export interface ItemSus extends Comun {
  tipo: 'sus';
  respuestas: number[];
  segundos?: number;
}
export interface ItemArco extends Comun {
  tipo: 'arco';
  arcoTipo: string;
  descripcion: string;
}
export type ItemCola = ItemRegistro | ItemMeta | ItemSus | ItemArco;

type SinComunes<T> = T extends Comun ? Omit<T, 'id' | 'creado'> : never;
export type NuevoItem = SinComunes<ItemCola>;

/** Fila de registro como la devuelve /api/paciente/perfil (solo lo que la web usa). */
export interface FilaRegistro {
  id?: string;
  usuario_id?: string;
  fecha: string;
  peso_ayunas: number | string | null;
  sentadilla_kg?: number | string | null;
  press_banca_kg?: number | string | null;
  volumen_entrenamiento_kg?: number | string | null;
  proteina_consumida_g?: number | string | null;
  notas?: string | null;
  /** true si todavía está solo en este dispositivo (no se ha subido). */
  pendiente_subida?: boolean;
}

/** Perfil del paciente. Se tipa de forma laxa a propósito: la ruta devuelve toda la fila de `usuarios` más lo calculado. */
export interface PerfilPaciente {
  id: string;
  registros?: FilaRegistro[];
  peso_actual?: number | string | null;
  peso_objetivo?: number | string | null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [campo: string]: any;
}

// -------------------------------------------------------------------------------------- lectura segura

const esObjeto = (x: unknown): x is Record<string, unknown> => typeof x === 'object' && x !== null && !Array.isArray(x);

function itemValido(x: unknown): x is ItemCola {
  if (!esObjeto(x)) return false;
  if (typeof x.id !== 'string' || typeof x.owner !== 'string' || !x.owner || typeof x.creado !== 'number') return false;
  switch (x.tipo) {
    case 'registro':
      return typeof x.fecha === 'string' && esObjeto(x.cuerpo) && Number.isFinite(Number(x.cuerpo.peso_ayunas));
    case 'meta':
      return typeof x.valor === 'number' && Number.isFinite(x.valor);
    case 'sus':
      return Array.isArray(x.respuestas) && x.respuestas.length === 10;
    case 'arco':
      return typeof x.arcoTipo === 'string' && typeof x.descripcion === 'string';
    default:
      return false;
  }
}

export function leerCola(st: Almacenamiento | null = almacenPorDefecto()): ItemCola[] {
  if (!st) return [];
  try {
    const crudo = st.getItem(CLAVE_COLA);
    if (!crudo) return [];
    const j: unknown = JSON.parse(crudo);
    return Array.isArray(j) ? j.filter(itemValido) : [];
  } catch {
    return [];
  }
}

function avisarCambio() {
  try {
    if (typeof window !== 'undefined') window.dispatchEvent(new Event(EVENTO_COLA));
  } catch {
    /* sin ventana: nada que avisar */
  }
}

function escribirCola(cola: ItemCola[], st: Almacenamiento | null): boolean {
  if (!st) return false;
  try {
    if (cola.length === 0) st.removeItem(CLAVE_COLA);
    else st.setItem(CLAVE_COLA, JSON.stringify(cola));
    avisarCambio();
    return true;
  } catch {
    return false; // sin espacio o almacenamiento bloqueado
  }
}

const crearId = () => `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;

/** Guarda un envío pendiente. Un registro del mismo día reemplaza al anterior (como en la app) y de la meta solo
 *  cuenta la última. Devuelve false si no se pudo guardar en este dispositivo. */
export function encolar(nuevo: NuevoItem, st: Almacenamiento | null = almacenPorDefecto()): boolean {
  const cola = leerCola(st);
  let resto = cola;
  if (nuevo.tipo === 'registro') {
    resto = cola.filter((i) => !(i.tipo === 'registro' && i.owner === nuevo.owner && i.fecha === nuevo.fecha));
  } else if (nuevo.tipo === 'meta') {
    resto = cola.filter((i) => !(i.tipo === 'meta' && i.owner === nuevo.owner));
  }
  const item = { ...nuevo, id: crearId(), creado: Date.now() } as ItemCola;
  return escribirCola([...resto, item].slice(-MAX_COLA), st);
}

function quitar(id: string, st: Almacenamiento | null) {
  escribirCola(
    leerCola(st).filter((i) => i.id !== id),
    st
  );
}

/** Quita un pendiente que ya no vale porque lo mismo se guardó después con internet (si no, al subirlo pisaría lo más nuevo). */
export function descartarPendiente(owner: string, tipo: 'registro' | 'meta', fecha?: string, st: Almacenamiento | null = almacenPorDefecto()) {
  const cola = leerCola(st);
  const resto = cola.filter((i) => !(i.owner === owner && i.tipo === tipo && (tipo !== 'registro' || (i.tipo === 'registro' && i.fecha === fecha))));
  if (resto.length !== cola.length) escribirCola(resto, st);
}

/** Quita los pendientes de registros y de evaluación SUS de esta persona (al borrar sus datos no deben volver a subirse).
 *  La meta y las solicitudes ARCO no se tocan: no son "registros" y la solicitud ARCO es un trámite que debe llegar. */
export function descartarPendientesDeDatos(owner: string, st: Almacenamiento | null = almacenPorDefecto()) {
  const cola = leerCola(st);
  const resto = cola.filter((i) => !(i.owner === owner && (i.tipo === 'registro' || i.tipo === 'sus')));
  if (resto.length !== cola.length) escribirCola(resto, st);
}

export const pendientesDe = (owner: string | null, st: Almacenamiento | null = almacenPorDefecto()): number =>
  owner ? leerCola(st).filter((i) => i.owner === owner).length : 0;

// ------------------------------------------------------------------------------------------------ caché

interface CachePerfil {
  v: 1;
  owner: string;
  guardado: number;
  perfil: PerfilPaciente;
}

export function guardarCachePerfil(perfil: PerfilPaciente, st: Almacenamiento | null = almacenPorDefecto()) {
  if (!st || typeof perfil.id !== 'string' || !perfil.id) return;
  try {
    const c: CachePerfil = { v: 1, owner: perfil.id, guardado: Date.now(), perfil };
    st.setItem(CLAVE_CACHE, JSON.stringify(c));
  } catch {
    /* sin espacio: la página funciona igual con internet */
  }
}

export function leerCachePerfil(st: Almacenamiento | null = almacenPorDefecto()): CachePerfil | null {
  if (!st) return null;
  try {
    const crudo = st.getItem(CLAVE_CACHE);
    if (!crudo) return null;
    const c: unknown = JSON.parse(crudo);
    if (!esObjeto(c) || c.v !== 1 || typeof c.owner !== 'string' || !c.owner || !esObjeto(c.perfil)) return null;
    return c as unknown as CachePerfil;
  } catch {
    return null;
  }
}

/** Id de la persona cuyos datos están en caché (quien usó este navegador por última vez con internet). */
export const propietarioLocal = (st: Almacenamiento | null = almacenPorDefecto()): string | null => leerCachePerfil(st)?.owner ?? null;

/** Al cerrar sesión se borra la caché de datos de salud. Los pendientes se conservan (llevan su dueño) para no
 *  perder lo que se registró sin internet: solo se suben cuando esa misma persona vuelve a entrar. */
export function limpiarCacheAlSalir(st: Almacenamiento | null = almacenPorDefecto()) {
  try {
    st?.removeItem(CLAVE_CACHE);
  } catch {
    /* nada */
  }
  try {
    if (typeof navigator !== 'undefined' && 'serviceWorker' in navigator) {
      navigator.serviceWorker.controller?.postMessage({ tipo: 'limpiar' });
    }
  } catch {
    /* sin service worker */
  }
}

/** Cierra la sesión del paciente. Pide confirmación si hay pendientes sin subir y no cierra sin internet (si no, la
 *  sesión seguiría abierta en el servidor aunque la pantalla diga que se cerró). true si se cerró. */
export async function cerrarSesion(st: Almacenamiento | null = almacenPorDefecto()): Promise<boolean> {
  const n = pendientesDe(propietarioLocal(st), st);
  if (n > 0 && !window.confirm(`Tienes ${n} ${n === 1 ? 'pendiente' : 'pendientes'} sin subir. Se subirán cuando vuelvas a entrar con tu misma cuenta. ¿Cerrar sesión ahora?`)) {
    return false;
  }
  try {
    await fetchConTiempo('/api/auth/logout', { method: 'POST' }, 8_000);
  } catch {
    window.alert('Para cerrar sesión necesitas conexión a internet. Inténtalo de nuevo cuando vuelva.');
    return false;
  }
  limpiarCacheAlSalir(st);
  return true;
}

// ------------------------------------------------------------------------------ pendientes sobre el perfil

const dia = (f: unknown) => String(f ?? '').slice(0, 10);
const numONull = (v: number) => (Number.isFinite(v) && v !== 0 ? v : null);

/** Perfil con lo pendiente ya aplicado: los registros hechos sin internet aparecen en la lista, el peso actual es el
 *  del último registro y la meta es la última que se fijó. */
export function aplicarPendientes(perfil: PerfilPaciente, cola: ItemCola[]): PerfilPaciente {
  const mios = cola.filter((i) => i.owner === perfil.id);
  if (mios.length === 0) return perfil;

  let registros: FilaRegistro[] = [...(perfil.registros ?? [])];
  let hayRegistros = false;
  for (const it of mios) {
    if (it.tipo !== 'registro') continue;
    hayRegistros = true;
    const c = it.cuerpo;
    const fila: FilaRegistro = {
      id: `reg-${perfil.id}-${it.fecha}`,
      usuario_id: perfil.id,
      fecha: it.fecha,
      peso_ayunas: c.peso_ayunas,
      sentadilla_kg: numONull(c.sentadilla_kg),
      press_banca_kg: numONull(c.press_banca_kg),
      volumen_entrenamiento_kg: c.volumen_entrenamiento_kg,
      proteina_consumida_g: c.proteina_consumida_g,
      notas: c.notas || null,
      pendiente_subida: true,
    };
    registros = registros.filter((r) => dia(r.fecha) !== it.fecha);
    registros.push(fila);
  }
  registros.sort((a, b) => dia(a.fecha).localeCompare(dia(b.fecha)));

  const resultado: PerfilPaciente = { ...perfil, registros };
  if (hayRegistros && registros.length > 0) {
    const ultimo = Number(registros[registros.length - 1].peso_ayunas);
    if (Number.isFinite(ultimo) && ultimo > 0) resultado.peso_actual = ultimo;
  }
  const metas = mios.filter((i): i is ItemMeta => i.tipo === 'meta');
  if (metas.length > 0) resultado.peso_objetivo = metas[metas.length - 1].valor;
  return resultado;
}

/** ¿Hay registro de hoy en lo guardado en este dispositivo (caché o pendientes)? Sirve para decidir el recordatorio sin internet. */
export function hayRegistroLocal(hoy: string, owner: string | null, st: Almacenamiento | null = almacenPorDefecto()): boolean {
  if (!owner) return false;
  if (leerCola(st).some((i) => i.tipo === 'registro' && i.owner === owner && i.fecha === hoy)) return true;
  const c = leerCachePerfil(st);
  return c?.owner === owner && (c.perfil.registros ?? []).some((r) => dia(r.fecha) === hoy);
}

// ------------------------------------------------------------------------------------------------- red

type Fetch = typeof fetch;

/** fetch con tiempo límite: en una red muy mala, esperar para siempre es peor que guardar en el dispositivo. */
export async function fetchConTiempo(url: string, init: RequestInit = {}, ms = 10_000, f: Fetch = fetch): Promise<Response> {
  const control = new AbortController();
  const t = setTimeout(() => control.abort(), ms);
  try {
    return await f(url, { ...init, signal: control.signal });
  } finally {
    clearTimeout(t);
  }
}

export type ResultadoPerfil =
  | { estado: 'ok'; perfil: PerfilPaciente; desdeCache: boolean; guardadoEn: number | null; pendientes: number }
  | { estado: 'sin-sesion' }
  | { estado: 'sin-datos' };

/** Carga el perfil con internet y, si no se puede (sin red, tiempo agotado o error del servidor), usa la última copia
 *  guardada. En ambos casos incluye lo pendiente de subir. Sesión caducada (401/403) NO usa la caché: pide entrar de nuevo. */
export async function cargarPerfil(f: Fetch = fetch, st: Almacenamiento | null = almacenPorDefecto()): Promise<ResultadoPerfil> {
  let res: Response | null = null;
  try {
    res = await fetchConTiempo('/api/paciente/perfil', { cache: 'no-store' }, 8_000, f);
  } catch {
    res = null; // sin conexión o tiempo agotado
  }

  if (res && res.ok) {
    const j: { success?: boolean; data?: PerfilPaciente } | null = await res.json().catch(() => null);
    if (j?.success && j.data && typeof j.data.id === 'string') {
      guardarCachePerfil(j.data, st);
      const cola = leerCola(st);
      return { estado: 'ok', perfil: aplicarPendientes(j.data, cola), desdeCache: false, guardadoEn: null, pendientes: cola.filter((i) => i.owner === j.data!.id).length };
    }
  }
  if (res && (res.status === 401 || res.status === 403)) return { estado: 'sin-sesion' };
  if (res && res.status === 404) return { estado: 'sin-datos' };

  const c = leerCachePerfil(st);
  if (!c) return { estado: 'sin-datos' };
  const cola = leerCola(st);
  return {
    estado: 'ok',
    perfil: aplicarPendientes(c.perfil, cola),
    desdeCache: true,
    guardadoEn: c.guardado,
    pendientes: cola.filter((i) => i.owner === c.owner).length,
  };
}

/** true si el error de `fetch` es de red (sin conexión, DNS, tiempo agotado) y no de la aplicación. */
export const esErrorDeRed = (e: unknown): boolean =>
  e instanceof TypeError || (e instanceof DOMException && (e.name === 'AbortError' || e.name === 'TimeoutError'));

// ----------------------------------------------------------------------------------------- envío de la cola

export interface Descartado {
  tipo: ItemCola['tipo'];
  motivo: string;
}
export interface ResultadoEnvio {
  enviados: number;
  descartados: Descartado[];
  pendientes: number;
  detenido: 'red' | 'sesion' | null;
}

function peticionDe(item: ItemCola): { url: string; init: RequestInit } {
  const json = (metodo: string, cuerpo: unknown): RequestInit => ({
    method: metodo,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(cuerpo),
  });
  switch (item.tipo) {
    case 'registro':
      return { url: '/api/paciente/diario', init: json('POST', item.cuerpo) };
    case 'meta':
      return { url: '/api/paciente/meta', init: json('PUT', { peso_objetivo: item.valor }) };
    case 'sus':
      return { url: '/api/paciente/sus', init: json('POST', { respuestas: item.respuestas, segundos_registro: item.segundos }) };
    case 'arco':
      return { url: '/api/paciente/arco', init: json('POST', { tipo: item.arcoTipo, descripcion: item.descripcion }) };
  }
}

let enCurso: Promise<ResultadoEnvio> | null = null;

/** Sube lo pendiente de `owner` en el orden en que se creó. Se detiene en el primer fallo de red o de sesión (lo que
 *  queda se reintenta después). Un rechazo del servidor por datos inválidos (400, 404, 409, 422) se descarta y se avisa:
 *  reintentarlo nunca lo arreglaría y bloquearía lo demás. Nunca lanza. */
export function enviarCola(owner: string, f: Fetch = fetch, st: Almacenamiento | null = almacenPorDefecto()): Promise<ResultadoEnvio> {
  if (enCurso) return enCurso;
  const promesa = (async () => {
    const resultado: ResultadoEnvio = { enviados: 0, descartados: [], pendientes: 0, detenido: null };
    try {
      const lista = leerCola(st)
        .filter((i) => i.owner === owner)
        .sort((a, b) => a.creado - b.creado);
      for (const item of lista) {
        const { url, init } = peticionDe(item);
        let res: Response;
        try {
          res = await fetchConTiempo(url, init, 12_000, f);
        } catch {
          resultado.detenido = 'red';
          break;
        }
        const j: { success?: boolean; error?: string } = await res.json().catch(() => ({}));
        if (res.ok && j.success) {
          quitar(item.id, st);
          resultado.enviados += 1;
          continue;
        }
        if (res.status === 401 || res.status === 403) {
          resultado.detenido = 'sesion';
          break;
        }
        if (res.status >= 500 || res.status === 429 || res.status === 408) {
          resultado.detenido = 'red';
          break;
        }
        quitar(item.id, st);
        resultado.descartados.push({ tipo: item.tipo, motivo: j.error || `El servidor lo rechazó (${res.status}).` });
      }
    } finally {
      resultado.pendientes = pendientesDe(owner, st);
    }
    if (resultado.enviados > 0 || resultado.descartados.length > 0) {
      try {
        if (typeof window !== 'undefined') window.dispatchEvent(new Event(EVENTO_SINCRONIZADO));
      } catch {
        /* nada */
      }
    }
    return resultado;
  })();
  // Se libera después de asignar: si la cola está vacía la función termina sin esperar nada.
  enCurso = promesa;
  void promesa.finally(() => {
    if (enCurso === promesa) enCurso = null;
  });
  return promesa;
}

export const ETIQUETA_TIPO: Record<ItemCola['tipo'], string> = {
  registro: 'registro diario',
  meta: 'meta de peso',
  sus: 'cuestionario de usabilidad',
  arco: 'solicitud de derechos ARCO',
};
