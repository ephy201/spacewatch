const staticCacheName = 'site-static-v9';
const dynamicCacheName = 'site-dynamic-v9';
const assets = [
  '/',
  '/index.html',
  '/css/styles.css',
  '/js/app.js',
  '/images/The_joint_ESA_NASA_Hubble_Space_Telescope.jpg',
  '/images/sky-earth-space-working-2156.jpg',
  '/images/universe_in_a_jar.jpg',
  'https://use.fontawesome.com/releases/v5.0.13/css/all.css',
  'https://fonts.googleapis.com/icon?family=Material+Icons',
  'https://cdnjs.cloudflare.com/ajax/libs/materialize/1.0.0-beta/css/materialize.min.css',
  'https://fonts.gstatic.com/s/materialicons/v48/flUhRq6tzZclQEJ-Vdg-IuiaDsNc.woff2',
  '/404.html'
];

// cache size limit function
const limitCacheSize = (name, size) => {
  caches.open(name).then(cache => {
    cache.keys().then(keys => {
      if(keys.length > size){
        cache.delete(keys[0]).then(limitCacheSize(name, size));
      }
    });
  });
};

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
        .filter(key => key !== staticCacheName && key !== dynamicCacheName)
        .map(key => caches.delete(key))
      );
    })
  );
});

// fetch events
self.addEventListener('fetch', evt => {
  if(evt.request.url.indexOf('firestore.googleapis.com') === -1){
    evt.respondWith(
      caches.match(evt.request).then(cacheRes => {
        return cacheRes || fetch(evt.request).then(fetchRes => {
          return caches.open(dynamicCacheName).then(cache => {
            cache.put(evt.request.url, fetchRes.clone());
            // check cached items size
            limitCacheSize(dynamicCacheName, 35);
            return fetchRes;
          })
        });
      }).catch(() => {
        if(evt.request.url.indexOf('.html') > -1){
          return caches.match('/pages/404.html');
        } 
      })
    );
  }
});