import { precacheAndRoute } from 'workbox-precaching';
import { registerRoute } from 'workbox-routing'; 
import { CacheableResponsePlugin } from 'workbox-cacheable-response'; 
import { NetworkFirst, CacheFirst, StaleWhileRevalidate } from 'workbox-strategies'; 
import CONFIG from './config';


const BASE_URL = CONFIG.BASE_URL;
// Do precaching
precacheAndRoute(self.__WB_MANIFEST);

// Cache Google Fonts
registerRoute(
  ({ url }) => url.origin === 'https://fonts.googleapis.com' || url.origin === 'https://fonts.gstatic.com',
  new CacheFirst({
    cacheName: 'google-fonts',
    plugins: [
      new CacheableResponsePlugin({
        statuses: [0, 200], // Cache sukses response
      }),
    ],
  }),
);

// Cache Poppins Font (from Google Fonts)
registerRoute(
  ({ url }) => url.origin === 'https://fonts.googleapis.com' || url.origin === 'https://fonts.gstatic.com',
  new CacheFirst({
    cacheName: 'poppins-fonts',
    plugins: [
      new CacheableResponsePlugin({
        statuses: [0, 200],
      }),
    ],
  }),
);

// Cache ikon avatar dari UI Avatars
registerRoute(
  ({ url }) => url.origin === 'https://ui-avatars.com',
  new CacheFirst({
    cacheName: 'avatars-api',
    plugins: [
      new CacheableResponsePlugin({
        statuses: [0, 200],
      }),
    ],
  }),
);

// Cache JSON dari API (prioritas jaringan untuk data terbaru)
registerRoute(
  ({ request, url }) => {
    const baseUrl = new URL(BASE_URL);
    return baseUrl.origin === url.origin && request.destination !== 'image';
  },
  new NetworkFirst({
    cacheName: 'dicodingstory-api',
    plugins: [
      new CacheableResponsePlugin({
        statuses: [0, 200],
      }),
    ],
  }),
);

// Cache gambar dari API (StaleWhileRevalidate untuk update background)
registerRoute(
  ({ request, url }) => {
    const baseUrl = new URL(BASE_URL);
    return baseUrl.origin === url.origin && request.destination === 'image';
  },
  new StaleWhileRevalidate({
    cacheName: 'dicodingstory-api-images',
    plugins: [
      new CacheableResponsePlugin({
        statuses: [0, 200],
      }),
    ],
  }),
);

// Cache Geocoding reverse dari Maptiler API
registerRoute(
  ({ url }) => url.origin.includes('maptiler'),
  new CacheFirst({
    cacheName: 'maptiler-api',
    plugins: [
      new CacheableResponsePlugin({
        statuses: [0, 200],
      }),
    ],
  }),
);


self.addEventListener('install', (event) => {
  console.log('Service Worker: Installing...');
});

self.addEventListener('activate', (event) => {
  console.log('Service Worker: Activating...');
  event.waitUntil(self.clients.claim());
});

self.addEventListener('push', (event) => {
  console.log('Service Worker: Push event received!');

  const promiseChain = async () => {
    if (event.data) {
      try {
        const data = event.data.json();
        console.log('Push data received:', data);

        await self.registration.showNotification(data.title, {
          body: data.options.body,
          icon: data.options.icon || '/images/dicoding.png',
          image: data.options.image,
          badge: data.options.badge,
        });
      } catch (error) {
        console.error('Error parsing push data or showing notification:', error);
        await self.registration.showNotification('Pemberitahuan Error!', {
          body: 'Terjadi kesalahan saat memproses notifikasi.',
          icon: '/images/dicoding.png',
        });
      }
    } else {
      console.log('Push event received without data. Showing generic notification.');
      await self.registration.showNotification('Pemberitahuan Baru!', {
        body: 'Ada pembaruan untuk Anda.',
        icon: '/images/dicoding.png',
      });
    }
  };

  event.waitUntil(promiseChain());
});

self.addEventListener('notificationclick', (event) => {
  console.log('Service Worker: Notification clicked!');
  event.notification.close();

  const targetUrl = `${self.location.origin}/#/stories`;

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if (client.url === targetUrl && 'focus' in client) {
          return client.focus();
        }
      }
      if (self.clients.openWindow) {
        return self.clients.openWindow(targetUrl);
      }
    })
  );
});

self.addEventListener('notificationclose', (event) => {
  console.log('Service Worker: Notification closed!', event.notification);
});