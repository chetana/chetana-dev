// Push notification handler for service worker
self.addEventListener('push', (event) => {
  const data = event.data ? event.data.json() : {}
  const title = data.title || 'Health Tracker'
  const options = {
    body: data.body || 'Time to do your pushups!',
    icon: '/pwa-192x192.png',
    badge: '/pwa-192x192.png',
    tag: 'health-reminder',
    renotify: true,
    data: { url: '/projects/health' }
  }
  event.waitUntil(self.registration.showNotification(title, options))
})

self.addEventListener('notificationclick', (event) => {
  event.notification.close()
  const url = event.notification.data?.url || '/projects/health'
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
      for (const client of windowClients) {
        if (client.url.includes('/projects/health') && 'focus' in client) {
          return client.focus()
        }
      }
      return clients.openWindow(url)
    })
  )
})
