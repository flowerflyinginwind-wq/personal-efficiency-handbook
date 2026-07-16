const CACHE = 'efficiency-handbook-v2';
const SCHEDULE_KEY = '/__notification-schedule.json';
const PRECACHE = ['./', './index.html', './manifest.json'];
const hasTriggers = typeof TimestampTrigger !== 'undefined';

let schedule = [];
let pollTimer = null;

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE)
      .then((cache) => cache.addAll(PRECACHE))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => loadSchedule())
      .then(() => applySchedule())
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  const url = new URL(event.request.url);
  if (url.origin !== self.location.origin) return;

  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) return cached;
      return fetch(event.request)
        .then((response) => {
          if (response && response.status === 200 && response.type === 'basic') {
            const copy = response.clone();
            caches.open(CACHE).then((cache) => cache.put(event.request, copy));
          }
          return response;
        })
        .catch(() => {
          if (event.request.mode === 'navigate') {
            return caches.match('./index.html');
          }
        });
    })
  );
});

self.addEventListener('message', (event) => {
  if (event.data?.type !== 'SCHEDULE_NOTIFICATIONS') return;
  const work = setSchedule(event.data.items || []);
  if (event.waitUntil) event.waitUntil(work);
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((list) => {
      for (const client of list) {
        if (client.url.includes(self.registration.scope) && 'focus' in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) return clients.openWindow('./');
    })
  );
});

async function loadSchedule() {
  try {
    const cache = await caches.open(CACHE);
    const res = await cache.match(SCHEDULE_KEY);
    schedule = res ? await res.json() : [];
  } catch {
    schedule = [];
  }
}

async function persistSchedule() {
  const cache = await caches.open(CACHE);
  await cache.put(SCHEDULE_KEY, new Response(JSON.stringify(schedule)));
}

async function setSchedule(items) {
  const now = Date.now();
  schedule = (items || []).filter((item) => item.at > now);
  await persistSchedule();
  await applySchedule();
}

async function clearOurNotifications() {
  const all = await self.registration.getNotifications();
  all.forEach((n) => {
    if (n.tag && n.tag.startsWith('efficiency-')) n.close();
  });
}

async function applySchedule() {
  await clearOurNotifications();
  const now = Date.now();
  const upcoming = schedule.filter((item) => item.at > now);

  if (hasTriggers) {
    for (const item of upcoming) {
      try {
        await self.registration.showNotification(item.title, {
          body: item.body,
          tag: item.tag,
          data: { kind: item.kind, id: item.id },
          showTrigger: new TimestampTrigger(item.at),
        });
      } catch {
        /* skip unsupported or duplicate schedules */
      }
    }
  }

  if (!pollTimer) {
    pollTimer = setInterval(() => tickSchedule(), 30000);
  }
  if (!hasTriggers) tickSchedule();
}

async function tickSchedule() {
  const now = Date.now();
  const existing = await self.registration.getNotifications();
  const shown = new Set(existing.map((n) => n.tag));
  let changed = false;

  for (const item of schedule) {
    if (item.at > now || item.fired || shown.has(item.tag)) continue;
    item.fired = true;
    changed = true;
    try {
      await self.registration.showNotification(item.title, {
        body: item.body,
        tag: item.tag,
        data: { kind: item.kind, id: item.id },
      });
    } catch {
      /* ignore */
    }
  }

  if (changed) await persistSchedule();
}
