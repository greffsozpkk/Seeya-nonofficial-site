'use strict';
// Build substitutes the fallback hash and public route list. Cache only this one page.
const CACHE_PREFIX='seeya-offline-';
const CACHE_NAME=CACHE_PREFIX+__OFFLINE_HASH__;
const OFFLINE_URL='/offline.html';
const PUBLIC_PATHS=new Set(__PUBLIC_PATHS__);
self.addEventListener('install',event=>{
 event.waitUntil((async()=>{
  const response=await fetch(new Request(OFFLINE_URL,{cache:'reload'}));
  if(!response.ok||!response.headers.get('content-type')?.includes('text/html'))throw new Error('Offline page unavailable');
  const cache=await caches.open(CACHE_NAME);
  await cache.put(OFFLINE_URL,response);
 })());
});
self.addEventListener('activate',event=>{
 event.waitUntil((async()=>{
  const names=await caches.keys();
  await Promise.all(names.filter(name=>name.startsWith(CACHE_PREFIX)&&name!==CACHE_NAME).map(name=>caches.delete(name)));
 })());
});
self.addEventListener('fetch',event=>{
 const request=event.request,url=new URL(request.url);
 // JSON, assets, third-party embeds, unknown URLs and private previews use the browser normally.
 if(request.method!=='GET'||request.mode!=='navigate'||url.origin!==self.location.origin||!PUBLIC_PATHS.has(url.pathname))return;
 event.respondWith((async()=>{
  try{return await fetch(request,{cache:'no-store'});}
  catch(error){
   const cache=await caches.open(CACHE_NAME);
   const fallback=await cache.match(OFFLINE_URL);
   if(fallback)return fallback;
   throw error;
  }
 })());
});
// Updates wait for existing tabs to close. Never force activation or reload a quiz.
