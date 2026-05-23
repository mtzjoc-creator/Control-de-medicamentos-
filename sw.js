// ========================================================
// SERVICE WORKER - CONTROL DE MEDICAMENTOS MOISÉS AGUILAR
// Corriendo en segundo plano las 24 horas
// ========================================================

const CACHE_NAME = 'control-meds-v1';
const ASSETS = [
  '/',
  '/index.html',
  'https://images.t2.ai/direct/1000093551.png'
];

// Instalar el Service Worker y almacenar en caché archivos esenciales
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS);
    })
  );
  self.skipWaiting();
});

// Activar el Service Worker
self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

// Interceptar clics en la notificación para abrir el sistema en el teléfono
self.addEventListener('notificationclick', (event) => {
  event.notification.close(); // Cierra la notificación flotante

  // Busca si el sitio ya está abierto en alguna pestaña y la enfoca, si no, la abre nueva
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if (client.url === event.notification.data.url && 'focus' in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(event.notification.data.url);
      }
    })
  );
});
