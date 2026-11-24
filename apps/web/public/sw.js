/* Last Football: notifications only (D132). No caching and no fetch handler. */

self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (event) => event.waitUntil(self.clients.claim()));

function safePath(value) {
  if (typeof value !== 'string' || !/^\/(?![/\\])/.test(value)) return '/hub';
  try {
    const url = new URL(value, self.location.origin);
    return url.origin === self.location.origin ? url.pathname + url.search : '/hub';
  } catch {
    return '/hub';
  }
}

self.addEventListener('push', (event) => {
  let data = {};
  try {
    data = event.data ? event.data.json() : {};
  } catch {
    data = {};
  }
  const title = typeof data.title === 'string' ? data.title.slice(0, 80) : 'Last Football';
  event.waitUntil(
    self.registration.showNotification(title, {
      body: typeof data.body === 'string' ? data.body.slice(0, 160) : '',
      tag: typeof data.tag === 'string' ? data.tag.slice(0, 32) : 'lf',
      icon: '/icon-192.png',
      badge: '/icon-192.png',
      lang: 'pl',
      data: { path: safePath(data.path) },
    }),
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const path = safePath(event.notification.data && event.notification.data.path);
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((tabs) => {
      // Never navigate an open tab: it may be in the middle of a live match.
      const open = tabs.find((tab) => new URL(tab.url).pathname === path);
      return open ? open.focus() : self.clients.openWindow(path);
    }),
  );
});
