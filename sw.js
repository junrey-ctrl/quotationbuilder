const CACHE='skylar-desk-v6';
const ASSETS=['/','/index.html','/manifest.webmanifest','/skylar-logo.svg'];

self.addEventListener('install',event=>{
  event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(ASSETS)));
  self.skipWaiting();
});

self.addEventListener('activate',event=>{
  event.waitUntil(caches.keys().then(keys=>
    Promise.all(keys.filter(key=>key!==CACHE).map(key=>caches.delete(key)))
  ));
  self.clients.claim();
});

self.addEventListener('fetch',event=>{
  if(event.request.method!=='GET') return;
  const isNavigation=event.request.mode==='navigate' ||
    (event.request.headers.get('accept')||'').includes('text/html');

  if(isNavigation){
    event.respondWith(fetch(event.request).then(response=>{
      if(response.ok){
        const copy=response.clone();
        caches.open(CACHE).then(cache=>cache.put('/index.html',copy));
      }
      return response;
    }).catch(()=>caches.match('/index.html')));
    return;
  }

  event.respondWith(caches.match(event.request).then(cached=>{
    if(cached) return cached;
    return fetch(event.request).then(response=>{
      if(response.ok){
        const copy=response.clone();
        caches.open(CACHE).then(cache=>cache.put(event.request,copy));
      }
      return response;
    });
  }));
});