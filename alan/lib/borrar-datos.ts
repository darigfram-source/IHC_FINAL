// "Borrar registros y mensajes" en el dispositivo. La parte de la nube la hace DELETE /api/paciente/datos.

import { CLAVE_CACHE, EVENTO_SINCRONIZADO, descartarPendientesDeDatos, guardarCachePerfil, leerCachePerfil, type Almacenamiento } from '@/lib/offline';

const CLAVE_TIEMPOS_REGISTRO = 'nutrimasa.tiempos_registro'; // tiempos medidos para la evaluación SUS (lib/sus.ts)
const PREFIJO_CHAT_IA = 'nm_chat_ia_v1_'; // conversación con el asistente de IA, una por persona

/** Borra de este dispositivo lo que se llama "registros y mensajes": pendientes de subir, copia guardada para uso sin
 *  internet (registros y mensajes), tiempos de registro y la conversación con el asistente de IA de esta persona.
 *  `authId` es el id de la sesión (el de /api/auth/me). */
export function borrarDatosLocales(owner: string, authId: string | null, st: Almacenamiento | null = almacenLocal()) {
  if (!st) return;
  descartarPendientesDeDatos(owner, st);

  // La copia guardada se conserva con el perfil pero sin registros ni mensajes.
  const c = leerCachePerfil(st);
  if (c && c.owner === owner) {
    guardarCachePerfil({ ...c.perfil, registros: [], mensajes: [], reportes: c.perfil.reportes ?? [] }, st);
  } else {
    try {
      st.removeItem(CLAVE_CACHE);
    } catch {
      /* nada */
    }
  }

  try {
    st.removeItem(CLAVE_TIEMPOS_REGISTRO);
    if (authId) st.removeItem(`${PREFIJO_CHAT_IA}${authId}`);
  } catch {
    /* almacenamiento bloqueado: no hay nada que borrar */
  }

  try {
    if (typeof window !== 'undefined') window.dispatchEvent(new Event(EVENTO_SINCRONIZADO)); // las pantallas recargan
    if (typeof navigator !== 'undefined' && 'serviceWorker' in navigator) {
      navigator.serviceWorker.controller?.postMessage({ tipo: 'limpiar' }); // páginas guardadas con datos de salud
    }
  } catch {
    /* sin ventana o sin service worker */
  }
}

function almacenLocal(): Almacenamiento | null {
  try {
    return typeof window !== 'undefined' ? window.localStorage : null;
  } catch {
    return null;
  }
}
