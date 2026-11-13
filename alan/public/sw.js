// Service worker de NutriMasa.
//  1) Avisos: mostrar avisos del sistema (Chrome en Android no permite `new Notification()`) y abrir la pantalla al tocarlos.
//  2) Modo sin internet (punto 14): guardar las pantallas del paciente y sus archivos para poder abrirlas sin conexión.
//
// Lo que NUNCA se guarda aquí: respuestas de /api/ (los datos de salud viven solo en la caché local de la página, que se
// borra al cerrar sesión), páginas de otras personas ni respuestas con redirección (por ejemplo, al inicio de sesión).
const VERSION = 'v1';
const CACHE_PAGINAS = 'nm-paginas-' + VERSION;
const CACHE_ESTATICO = 'nm-estatico-' + VERSION;
const OFFLINE_URL = '/offline.html';
const MAX_ESTATICOS = 300;
const ESPERA_RED_MS = 4000; // con una copia guardada, no se espera más que esto a una red lenta

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches
      .open(CACHE_ESTATICO)
      .then((c) => c.addAll([OFFLINE_URL, '/icons/icon-192.svg', '/icons/icon-512.svg']))
      .catch(() => {})
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches
      .keys()
      .then((nombres) =>
        Promise.all(nombres.filter((n) => n.startsWith('nm-') && n !== CACHE_PAGINAS && n !== CACHE_ESTATICO).map((n) => caches.delete(n)))
      )
      .then(() => self.clients.claim())
  );
});

// ---------------------------------------------------------------------------------------------- utilidades

// Solo las pantallas de la persona con sesión. El inicio de sesión y el registro no se guardan.
const esPaginaPaciente = (ruta) => ruta.startsWith('/paciente/') && ruta !== '/paciente/login' && ruta !== '/paciente/registro';
// La clave ignora los parámetros (?from=...): la pantalla es la misma.
const clavePagina = (url) => url.origin + url.pathname;

async function recortar(cache, maximo) {
  const claves = await cache.keys();
  for (let i = 0; i < claves.length - maximo; i++) await cache.delete(claves[i]);
}

function conTiempo(promesaFetch, ms, control) {
  const t = setTimeout(() => control.abort(), ms);
  return promesaFetch.finally(() => clearTimeout(t));
}

async function paginaRedPrimero(req) {
  const url = new URL(req.url);
  const cache = await caches.open(CACHE_PAGINAS);
  const clave = clavePagina(url);
  const previa = await cache.match(clave);
  try {
    let res;
    if (previa) {
      const control = new AbortController();
      res = await conTiempo(fetch(req, { signal: control.signal }), ESPERA_RED_MS, control);
    } else {
      res = await fetch(req);
    }
    if (res.ok && !res.redirected && res.type === 'basic' && esPaginaPaciente(url.pathname)) {
      await cache.put(clave, res.clone());
    }
    return res;
  } catch (_) {
    if (previa) return previa;
    return (await caches.match(OFFLINE_URL)) || Response.error();
  }
}

async function estaticoCachePrimero(req) {
  const cache = await caches.open(CACHE_ESTATICO);
  // Los archivos de /_next/static llevan el hash en el nombre: ignorar ?dpl=... es seguro.
  const guardado = await cache.match(req, { ignoreSearch: true });
  if (guardado) return guardado;
  const res = await fetch(req);
  if (res.ok && res.type === 'basic') {
    await cache.put(req, res.clone());
    recortar(cache, MAX_ESTATICOS).catch(() => {});
  }
  return res;
}

self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;
  if (url.pathname.startsWith('/api/')) return; // datos: siempre de la red

  if (url.pathname.startsWith('/_next/static/') || url.pathname.startsWith('/icons/') || url.pathname === OFFLINE_URL) {
    e.respondWith(estaticoCachePrimero(req).catch(() => Response.error()));
    return;
  }
  if (req.mode === 'navigate') {
    e.respondWith(paginaRedPrimero(req));
  }
});

// ---------------------------------------------------------------------- mensajes de la página (limpiar / precalentar)

// Archivos que una pantalla necesita: el HTML los nombra (en las etiquetas y dentro de los datos de Next).
const RE_ARCHIVOS = /(?:\/_next\/)?static\/(?:chunks|css|media)\/[A-Za-z0-9_\-.~%/]+?\.(?:js|css|woff2|woff)(?:\?dpl=[A-Za-z0-9_\-]+)?/g;

async function precalentar(urls) {
  const paginas = await caches.open(CACHE_PAGINAS);
  const estaticos = await caches.open(CACHE_ESTATICO);
  const archivos = new Set();
  for (const ruta of urls) {
    if (typeof ruta !== 'string' || !esPaginaPaciente(ruta.split('?')[0])) continue;
    try {
      const res = await fetch(ruta, { credentials: 'same-origin', cache: 'no-store' });
      if (!res.ok || res.redirected || res.type !== 'basic') continue; // sin sesión: no se guarda nada
      await paginas.put(clavePagina(new URL(ruta, self.location.origin)), res.clone());
      const html = await res.text();
      for (const m of html.match(RE_ARCHIVOS) || []) {
        archivos.add(m.startsWith('/') ? m : '/_next/' + m);
        if (archivos.size >= 200) break;
      }
    } catch (_) {
      /* sin red: se intentará en otra visita */
    }
  }
  for (const archivo of archivos) {
    try {
      if (await estaticos.match(archivo, { ignoreSearch: true })) continue;
      const res = await fetch(archivo);
      if (res.ok && res.type === 'basic') await estaticos.put(archivo, res);
    } catch (_) {
      /* se guardará la próxima vez que la pantalla lo pida */
    }
  }
  await recortar(estaticos, MAX_ESTATICOS);
}

self.addEventListener('message', (e) => {
  const d = e.data || {};
  if (d.tipo === 'limpiar') e.waitUntil(caches.delete(CACHE_PAGINAS));
  else if (d.tipo === 'precalentar' && Array.isArray(d.urls)) e.waitUntil(precalentar(d.urls.slice(0, 20)));
});

// ------------------------------------------------------------------------------------------------- avisos

self.addEventListener('notificationclick', (e) => {
  e.notification.close();
  const raw = (e.notification.data && e.notification.data.url) || '/paciente/dashboard';
  // Solo rutas del propio sitio.
  const url = typeof raw === 'string' && raw.startsWith('/paciente/') ? raw : '/paciente/dashboard';
  e.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((lista) => {
      for (const c of lista) {
        if ('focus' in c) {
          if ('navigate' in c) c.navigate(url);
          return c.focus();
        }
      }
      return self.clients.openWindow(url);
    })
  );
});
