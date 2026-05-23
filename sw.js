// ========================================================
// SERVICE WORKER - ALERTA CRÍTICA INFINITA CON ACCIONES
// ========================================================

const CACHE_NAME = 'control-meds-v3';
let intervaloAlarma = null;

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

// Escuchar la orden desde el index.html
self.addEventListener('message', (event) => {
  if (event.data.accion === 'iniciarAlarmaInfinita') {
    const { nombre, dosis, url } = event.data;
    
    // Limpiar cualquier alarma previa para que no se dupliquen
    clearInterval(intervaloAlarma);

    // BOMBARDEO VISUAL Y SONORO: Se ejecuta cada 3 segundos sin parar
    intervaloAlarma = setInterval(() => {
      const ahora = new Date();
      const horaActual = `${String(ahora.getHours()).padStart(2, '0')}:${String(ahora.getMinutes()).padStart(2, '0')}`;

      self.registration.showNotification(`🚨 ¡ALERTA DE MEDICAMENTO CRÍTICA!`, {
        body: `TOMAR AHORA: ${nombre}\nDOSIS: ${dosis}\nHora: ${horaActual} hrs.\n\n⚠️ Despliega o toca para atender de inmediato.`,
        icon: 'https://images.t2.ai/direct/1000093551.png', // Tu logo
        badge: 'https://images.t2.ai/direct/1000093551.png',
        
        // Patrón de vibración masivo y rítmico (Vibra 500ms, frena 200ms...)
        vibrate: [500, 200, 500, 200, 500, 200, 500, 200, 500, 200], 
        
        tag: 'alarma-critica-vibrante', // Sobrescribe la alerta anterior para forzar sonido y vibración
        renotify: true,                 // Obliga al teléfono a sonar en cada repetición
        requireInteraction: true,       // Mantiene la ventana flotante visible en pantalla
        data: { url: url },
        
        // Botones de acción rápida directo en la notificación flotante
        actions: [
          { action: 'confirmar', title: '✅ Ya lo tomé' },
          { action: 'abrir', title: '📱 Abrir Aplicación' }
        ]
      });
    }, 3000); 
  }
});

// Manejar los clics en la notificación o en sus botones
self.addEventListener('notificationclick', (event) => {
  event.notification.close(); // Quita la notificación de la pantalla
  
  // Frenamos la ráfaga repetitiva de mensajes y vibraciones
  clearInterval(intervaloAlarma);

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      // Avisar a la pestaña abierta que la alarma se detuvo
      for (const client of clientList) {
        if (client.url === event.notification.data.url && 'focus' in client) {
          client.postMessage({ accion: 'alertaAtendida' });
          return client.focus();
        }
      }
      // Si la app estaba cerrada, la abre desde cero
      if (clients.openWindow) {
        return clients.openWindow(event.notification.data.url);
      }
    })
  );
});
