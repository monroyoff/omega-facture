// OMEGA FACTURE Service Worker v2.0
// Système de mise à jour automatique & purge de cache immédiate
const CACHE_NAME = 'omega-facture-cache-v2';
const PRECACHE_ASSETS = [
  '/manifest.json',
  '/icons/icon-192.png',
  '/icons/icon-512.png',
];

self.addEventListener('install', (event) => {
  // Activation immédiate sans attendre la fermeture des onglets ouverts
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(PRECACHE_ASSETS).catch((err) => {
        console.warn('[SW v2] Precache partiel:', err);
      });
    })
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      // Purge absolue de TOUS les anciens caches (y compris v1)
      return Promise.all(
        keys.filter((key) => key !== CACHE_NAME).map((key) => {
          console.log('[SW v2] Suppression ancien cache :', key);
          return caches.delete(key);
        })
      );
    }).then(() => {
      // Prise de contrôle immédiate de tous les onglets / WebView actifs
      return self.clients.claim();
    }).then(() => {
      // Informer les pages ouvertes qu'une nouvelle version a pris le relais
      return self.clients.matchAll({ type: 'window' }).then((clients) => {
        clients.forEach((client) => {
          client.postMessage({ type: 'SW_ACTIVATED', cache: CACHE_NAME });
        });
      });
    })
  );
});

self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

self.addEventListener('fetch', (event) => {
  const url = event.request.url;

  // Contournement direct pour les vérifications de version, API, paiements et Supabase
  if (
    event.request.method !== 'GET' ||
    url.includes('version.json') ||
    url.includes('/api/') ||
    url.includes('fedapay.com') ||
    url.includes('paydunya.com') ||
    url.includes('supabase.co')
  ) {
    return;
  }

  // Stratégie NETWORK-FIRST universelle :
  // Toujours charger la dernière version fraîche depuis le serveur en priorité.
  // En cas d'indisponibilité réseau (hors-ligne), utiliser le cache de secours.
  event.respondWith(
    fetch(event.request)
      .then((networkResponse) => {
        if (networkResponse && networkResponse.status === 200) {
          // Les pages HTML ne sont pas stockées dans le cache persistant afin de garantir
          // une mise à jour instantanée sans résidu dès chaque déploiement.
          const isHtml = networkResponse.headers.get('content-type')?.includes('text/html');
          if (!isHtml) {
            const responseToCache = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, responseToCache);
            });
          }
        }
        return networkResponse;
      })
      .catch(async () => {
        const cached = await caches.match(event.request);
        if (cached) return cached;
        if (event.request.headers.get('accept')?.includes('text/html')) {
          return caches.match('/dashboard') || caches.match('/');
        }
        return new Response('Contenu indisponible hors-ligne', { status: 503 });
      })
  );
});
