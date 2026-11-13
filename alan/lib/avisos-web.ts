// Avisos del navegador (Notification API). Nunca lanzan errores: si algo falla, la página sigue igual.
// Solo salen con la página (o la app instalada) abierta, aunque sea en segundo plano.
import { leerPrefs, type PrefsRecordatorio } from './recordatorio';
import { propietarioLocal } from './offline';

export type PermisoAvisos = 'concedido' | 'denegado' | 'pendiente' | 'no-soportado';

export function soportaAvisos(): boolean {
  return typeof window !== 'undefined' && 'Notification' in window;
}

export function permisoAvisos(): PermisoAvisos {
  if (!soportaAvisos()) return 'no-soportado';
  if (Notification.permission === 'granted') return 'concedido';
  if (Notification.permission === 'denied') return 'denegado';
  return 'pendiente';
}

/** Pide permiso. Debe llamarse desde un clic de la persona; si no, el navegador lo ignora. */
export async function pedirPermisoAvisos(): Promise<PermisoAvisos> {
  if (!soportaAvisos()) return 'no-soportado';
  try {
    await Notification.requestPermission();
  } catch {
    /* navegadores viejos con callback: se vuelve a leer el estado */
  }
  if (permisoAvisos() === 'concedido') await registrarServiceWorker();
  return permisoAvisos();
}

export async function registrarServiceWorker(): Promise<ServiceWorkerRegistration | null> {
  try {
    if (!('serviceWorker' in navigator)) return null;
    return (await navigator.serviceWorker.getRegistration('/')) ?? (await navigator.serviceWorker.register('/sw.js'));
  } catch {
    return null;
  }
}

/** Muestra un aviso del sistema. true si se pudo mostrar. */
export async function mostrarAviso(titulo: string, cuerpo: string, url: string, etiqueta: string): Promise<boolean> {
  if (permisoAvisos() !== 'concedido') return false;
  try {
    const reg = await registrarServiceWorker();
    if (reg) {
      await reg.showNotification(titulo, { body: cuerpo, tag: etiqueta, data: { url }, icon: '/icons/icon-192.svg' });
      return true;
    }
    const n = new Notification(titulo, { body: cuerpo, tag: etiqueta, icon: '/icons/icon-192.svg' });
    n.onclick = () => {
      window.focus();
      window.location.href = url;
    };
    return true;
  } catch {
    return false;
  }
}

// ---- Preferencias y marcas guardadas en este navegador, separadas por persona ----

export async function idPersonaActual(): Promise<string> {
  try {
    const res = await fetch('/api/auth/me', { cache: 'no-store' });
    const j = await res.json();
    return typeof j?.user?.userId === 'string' && j.user.userId ? j.user.userId : 'local';
  } catch {
    // Sin internet: se usa la persona de la copia guardada, para que sus preferencias de recordatorio sigan valiendo.
    return propietarioLocal() ?? 'local';
  }
}

const k = (tipo: string, id: string) => `nm_${tipo}_v1_${id}`;

function leer(clave: string): string | null {
  try {
    return localStorage.getItem(clave);
  } catch {
    return null;
  }
}
function escribir(clave: string, valor: string) {
  try {
    localStorage.setItem(clave, valor);
  } catch {
    /* sin almacenamiento: la preferencia dura solo mientras la página está abierta */
  }
}

export const cargarPrefs = (id: string): PrefsRecordatorio => leerPrefs(leer(k('recordatorio', id)));
export const guardarPrefs = (id: string, p: PrefsRecordatorio) => escribir(k('recordatorio', id), JSON.stringify(p));
export const cargarUltimoAvisoDia = (id: string) => leer(k('aviso_registro_dia', id));
export const guardarUltimoAvisoDia = (id: string, dia: string) => escribir(k('aviso_registro_dia', id), dia);
export const cargarMarcaChat = (id: string) => leer(k('chat_marca', id));
export const guardarMarcaChat = (id: string, marca: string) => escribir(k('chat_marca', id), marca);
