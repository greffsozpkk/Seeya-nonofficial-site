'use strict';
// Only public application files are cached. Personal entries stay in browser storage.
const CACHE=__PASSPORT_CACHE__,FILES=__PASSPORT_FILES__;
self.addEventListener('install',event=>event.waitUntil((async()=>{
 const cache=await caches.open(CACHE);
 try{for(const file of FILES){const response=await fetch(new Request(file,{cache:'reload'}));if(!response.ok)throw Error('Passport offline preparation failed');await cache.put(file,response);}}
 catch(error){await caches.delete(CACHE);throw error;}
})()));
self.addEventListener('activate',event=>event.waitUntil((async()=>{for(const name of await caches.keys())if(name.startsWith('seeya-passport-shell-')&&name!==CACHE)await caches.delete(name);await self.clients.claim();})()));
self.addEventListener('fetch',event=>{
 const req=event.request,u=new URL(req.url);if(req.method!=='GET'||u.origin!==self.location.origin)return;
 const document=req.mode==='navigate'&&['/passport/test/','/passport/test/index.html','/passport/test'].includes(u.pathname);
 if(!document&&!FILES.includes(u.pathname))return;
 event.respondWith((async()=>{const cache=await caches.open(CACHE);if(document){try{const response=await fetch(req);if(response.ok)return response;}catch{}return await cache.match('/passport/test/')||Response.error();}return await cache.match(u.pathname)||fetch(req);})());
});
// No forced reload, skipWaiting, third-party cache, or personal data transport.
