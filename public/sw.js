/*
 * Service worker de la PWA.
 * - Navegación: red primero y, si no hay conexión, index.html de la caché.
 * - Recursos propios: caché primero + revalidación en segundo plano.
 * - Firebase / Google: nunca se cachean, siempre van a la red.
 */
const VERSION = 'tareas-v1'
const STATIC_CACHE = `${VERSION}-static`
const RUNTIME_CACHE = `${VERSION}-runtime`

const APP_SHELL = [
  '/',
  '/index.html',
  '/manifest.webmanifest',
  '/favicon.svg',
  '/icons/icon-192.png',
  '/icons/icon-512.png',
  '/icons/apple-touch-icon.png',
]

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(STATIC_CACHE)
      .then((cache) => cache.addAll(APP_SHELL))
      .then(() => self.skipWaiting()),
  )
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((key) => !key.startsWith(VERSION))
            .map((key) => caches.delete(key)),
        ),
      )
      .then(() => self.clients.claim()),
  )
})

async function respuestaOffline() {
  const cacheada = await caches.match('/index.html')
  return (
    cacheada ||
    new Response('Sin conexión. Abre la app al menos una vez con internet.', {
      status: 503,
      headers: { 'Content-Type': 'text/plain; charset=utf-8' },
    })
  )
}

self.addEventListener('fetch', (event) => {
  const { request } = event
  if (request.method !== 'GET') return

  const url = new URL(request.url)
  if (url.origin !== self.location.origin) return

  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((respuesta) => {
          const copia = respuesta.clone()
          caches.open(STATIC_CACHE).then((cache) => cache.put('/index.html', copia))
          return respuesta
        })
        .catch(respuestaOffline),
    )
    return
  }

  event.respondWith(
    caches.match(request).then((cacheada) => {
      const desdeRed = fetch(request)
        .then((respuesta) => {
          if (respuesta.ok) {
            const copia = respuesta.clone()
            caches.open(RUNTIME_CACHE).then((cache) => cache.put(request, copia))
          }
          return respuesta
        })
        .catch(() => cacheada)

      return cacheada || desdeRed
    }),
  )
})
