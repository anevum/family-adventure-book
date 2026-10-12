/* Demo shell only. No account data or personal media belongs in this cache. */
const CACHE='adventure-book-demo-shell-v5';
const ASSETS=['./','./index.html','./assets/style.css','./assets/adventure.css','./assets/app.js','./assets/icons/icon.svg','./manifest.webmanifest'];
self.addEventListener('install',event=>event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(ASSETS)).then(()=>self.skipWaiting())));
self.addEventListener('activate',event=>event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(key=>key!==CACHE).map(key=>caches.delete(key)))).then(()=>self.clients.claim())));
self.addEventListener('fetch',event=>{
  if(event.request.method!=='GET'||new URL(event.request.url).origin!==self.location.origin)return;
  event.respondWith(fetch(event.request).then(response=>{
    if(response.ok&&['document','script','style','image','manifest'].includes(event.request.destination)){
      const copy=response.clone();caches.open(CACHE).then(c=>c.put(event.request,copy));
    }
    return response;
  }).catch(()=>caches.match(event.request).then(cached=>cached||caches.match('./index.html'))));
});
