const staticCacheName = 'gratedcloud';
const assets = [
    './',
    './index.html',
    './js/index.js',
    './css/style.css',
    './images/html.jpg',
    './images/css.png',
    './images/js.png',
    './images/favicon/apple-touch-icon.png',
    './images/favicon/favicon-32x32.png',
    './images/favicon/favicon-16x16.png',
    '/images/favicon/android-chrome-192x192.png',
    '/images/favicon/android-chrome-512x512.png',

    'https://fonts.googleapis.com/css?family=Lato:300,400,700',
];
// install event
self.addEventListener('install', evt => {
    evt.waitUntil(
        caches.open(staticCacheName).then((cache) => {
            console.log('caching shell assets');
            cache.addAll(assets);
        })
    );
});
// activate event
self.addEventListener('activate', evt => {
    evt.waitUntil(
        caches.keys().then(keys => {
            return Promise.all(keys
                .filter(key => key !== staticCacheName)
                .map(key => caches.delete(key))
            );
        })
    );
});
// fetch event
self.addEventListener('fetch', evt => {
    evt.respondWith(
        caches.match(evt.request).then(cacheRes => {
            return cacheRes || fetch(evt.request);
        })
    );
});