'use strict';
// Only public application files are cached. Personal entries stay in browser storage.
const CACHE="seeya-diary-shell-36a0f6ae460a",FILES=["/assets/GowunDodum-Regular.385f1f238065.woff2","/assets/GowunBatang-Regular.d66f8f3914dc.woff2","/assets/NanumPenScript-Regular.d083eb8197a2.woff2","/diary/","/assets/site.53f1b5f5cbaf.css","/assets/passport.02dfea7478a5.css","/assets/diary.7facf7a63b29.js","/assets/mobile-menu.d34f2de4a9e9.js","/manifest.webmanifest","/images/app/favicon-192.png","/images/app/apple-touch-icon-180-v2.png"];
self.addEventListener('install',event=>event.waitUntil((async()=>{
 const cache=await caches.open(CACHE);
 try{for(const file of FILES){const response=await fetch(new Request(file,{cache:'reload'}));if(!response.ok)throw Error('Passport offline preparation failed');await cache.put(file,response);}}
 catch(error){await caches.delete(CACHE);throw error;}
})()));
self.addEventListener('activate',event=>event.waitUntil((async()=>{for(const name of await caches.keys())if(name.startsWith('seeya-diary-shell-')&&name!==CACHE)await caches.delete(name);await self.clients.claim();})()));
self.addEventListener('fetch',event=>{
 const req=event.request,u=new URL(req.url);if(req.method!=='GET'||u.origin!==self.location.origin)return;
 const document=req.mode==='navigate'&&['/diary/','/diary/index.html','/diary'].includes(u.pathname);
 if(!document&&!FILES.includes(u.pathname))return;
 event.respondWith((async()=>{const cache=await caches.open(CACHE);if(document){try{const response=await fetch(req);if(response.ok)return response;}catch{}return await cache.match('/diary/')||Response.error();}return await cache.match(u.pathname)||fetch(req);})());
});
// No forced reload, skipWaiting, third-party cache, or personal data transport.
