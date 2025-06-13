// Service Worker for Simple Task Manager PWA
const CACHE_NAME = 'task-manager-v1';
const ASSETS_TO_CACHE = [
    './',
    './index.html',
    './style.css',
    './script.js',
    './manifest.json'
];

// Install event - cache essential assets
self.addEventListener('install', (event) => {
    console.log('Service Worker installing...');
    
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                console.log('Caching app assets...');
                return cache.addAll(ASSETS_TO_CACHE);
            })
            .then(() => {
                console.log('Assets cached successfully');
                return self.skipWaiting();
            })
            .catch((error) => {
                console.error('Error caching assets:', error);
            })
    );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
    console.log('Service Worker activating...');
    
    event.waitUntil(
        caches.keys()
            .then((cacheNames) => {
                return Promise.all(
                    cacheNames.map((cacheName) => {
                        if (cacheName !== CACHE_NAME) {
                            console.log('Deleting old cache:', cacheName);
                            return caches.delete(cacheName);
                        }
                    })
                );
            })
            .then(() => {
                console.log('Service Worker activated');
                return self.clients.claim();
            })
    );
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', (event) => {
    // Skip non-GET requests
    if (event.request.method !== 'GET') {
        return;
    }

    event.respondWith(
        caches.match(event.request)
            .then((cachedResponse) => {
                // Return cached version if available
                if (cachedResponse) {
                    return cachedResponse;
                }
                
                // Otherwise, fetch from network
                return fetch(event.request)
                    .then((networkResponse) => {
                        // Don't cache non-successful responses
                        if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
                            return networkResponse;
                        }
                        
                        // Clone the response (it can only be consumed once)
                        const responseToCache = networkResponse.clone();
                        
                        // Add to cache for future use
                        caches.open(CACHE_NAME)
                            .then((cache) => {
                                cache.put(event.request, responseToCache);
                            });
                        
                        return networkResponse;
                    })
                    .catch(() => {
                        // If both cache and network fail, return a custom offline page
                        if (event.request.destination === 'document') {
                            return new Response(
                                `<!DOCTYPE html>
                                <html>
                                <head>
                                    <title>Offline - Task Manager</title>
                                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                                    <style>
                                        body { 
                                            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                                            display: flex; 
                                            justify-content: center; 
                                            align-items: center; 
                                            min-height: 100vh; 
                                            margin: 0; 
                                            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                                            color: white;
                                            text-align: center;
                                            padding: 2rem;
                                        }
                                        .offline-content {
                                            background: rgba(255, 255, 255, 0.1);
                                            padding: 2rem;
                                            border-radius: 16px;
                                            backdrop-filter: blur(10px);
                                        }
                                        h1 { font-size: 2rem; margin-bottom: 1rem; }
                                        p { font-size: 1.1rem; margin-bottom: 1.5rem; }
                                        button {
                                            background: white;
                                            color: #4f46e5;
                                            border: none;
                                            padding: 0.875rem 1.5rem;
                                            border-radius: 8px;
                                            font-size: 1rem;
                                            font-weight: 600;
                                            cursor: pointer;
                                            transition: transform 0.2s ease;
                                        }
                                        button:hover { transform: translateY(-1px); }
                                    </style>
                                </head>
                                <body>
                                    <div class="offline-content">
                                        <h1>📱 You're Offline</h1>
                                        <p>No internet connection, but the app is still available!</p>
                                        <button onclick="window.location.reload()">Try Again</button>
                                    </div>
                                </body>
                                </html>`,
                                { 
                                    headers: { 'Content-Type': 'text/html' } 
                                }
                            );
                        }
                    });
            })
    );
});

// Handle background sync (when back online)
self.addEventListener('sync', (event) => {
    if (event.tag === 'background-sync') {
        console.log('Background sync triggered');
        // You could sync data with server here
    }
});

// Handle push notifications (if needed in future)
self.addEventListener('push', (event) => {
    if (event.data) {
        const data = event.data.json();
        const options = {
            body: data.body,
            icon: './manifest.json',
            badge: './manifest.json',
            tag: 'task-notification'
        };
        
        event.waitUntil(
            self.registration.showNotification(data.title, options)
        );
    }
});

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
    event.notification.close();
    
    event.waitUntil(
        clients.openWindow('./')
    );
});