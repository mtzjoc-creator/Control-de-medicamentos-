// ========================================================
// SERVICE WORKER - ALERTA CONTINUA ESTRIDENTE
// ========================================================

const CACHE_NAME = 'control-meds-v2';
let intervaloAlarma = null;

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

// Escuchar la orden del index.html para empezar la ráfaga de ruido
self.addEventListener('message', (event) => {
  if (event.data.accion === 'iniciarAlarmaInfinita') {
    const { nombre, dosis, url } = event.data;
    
    // Si ya hay una alarma sonando, la limpiamos antes de iniciar otra
    clearInterval(intervaloAlarma);

    // EFECTO METRALLETA: Envía una notificación ruidosa cada 3 segundos
    intervaloAlarma = setInterval(() => {
      self.registration.showNotification(`⚠️ ¡ALERTA URGENTE DE MEDICAMENTO!`, {
        body: `POR FAVOR ATENDER: Toma de ${nombre} (${dosis}). Tap aquí para apagar.`,
        icon: 'https://images.t2.ai/direct/1000093551.png',
        badge: 'https://images.t2.ai/direct/1000093551.png',
        vibrate: [500, 200, 500, 200, 500, 200, 500], // Vibración masiva y larga
        tag: 'alarma-critica', // El mismo tag sobreescribe y reactiva el sonido del celular
        renotify: true, // Fuerza al teléfono a volver a sonar y vibrar cada 3 segundos
        requireInteraction: true, // Mantiene la alerta fija en pantalla en sistemas compatibles
        data: { url: url }
      });
    }, 3000); 
  }
});

// Cuando el usuario le da clic a la alerta: DETENEMOS TODO y abrimos la app
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  
  // Apagar la ráfaga de notificaciones
  clearInterval(intervaloAlarma);

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if (client.url === event.notification.data.url && 'focus' in client) {
          // Enviamos señal a la pestaña abierta para que active el sonido fuerte o lo apague
          client.postMessage({ accion: 'alertaAtendida' });
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(event.notification.data.url);
      }
    })
  );
});
