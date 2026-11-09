const CACHE='skylar-desk-v12';
const ASSETS=['/manifest.webmanifest','/skylar-logo.svg'];

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
  const requestUrl=new URL(event.request.url);
  // Never cache authenticated API responses or user-specific data.
  if(requestUrl.origin===self.location.origin && requestUrl.pathname.startsWith('/api/')){
    event.respondWith(fetch(event.request));
    return;
  }
  const isNavigation=event.request.mode==='navigate' ||
    (event.request.headers.get('accept')||'').includes('text/html');

  if(isNavigation){
    event.respondWith(fetch(event.request).then(response=>{
      const finalPath=new URL(response.url||event.request.url).pathname;
      // Only cache the authenticated app shell, never the public login page or redirects.
      if(response.ok && (finalPath==='/' || finalPath==='/index.html')){
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
      if(response.ok && requestUrl.origin===self.location.origin){
        const copy=response.clone();
        caches.open(CACHE).then(cache=>cache.put(event.request,copy));
      }
      return response;
    });
  }));
});

[executed on device: MSI (864cdbb2-925e-4012-9a0d-c0374f6639f0)]