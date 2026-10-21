'use strict';
// Retire only the old test shell. Never touch diary caches or browser-local personal entries.
self.addEventListener('install',event=>event.waitUntil(self.skipWaiting()));
self.addEventListener('activate',event=>event.waitUntil((async()=>{
 for(const name of await caches.keys())if(name.startsWith('seeya-passport-shell-'))await caches.delete(name);
 await self.clients.claim();await self.registration.unregister();
})()));
self.addEventListener('fetch',event=>{
 const url=new URL(event.request.url);
 if(event.request.mode==='navigate'&&url.origin===self.location.origin&&['/passport/test/','/passport/test','/passport/test/index.html'].includes(url.pathname))event.respondWith(Promise.resolve(Response.redirect(self.location.origin+'/diary/'+url.search,302)));
});
