'use strict';
// Build substitutes the fallback hash and public route list. Cache only this one page.
const CACHE_PREFIX='seeya-offline-';
const CACHE_NAME=CACHE_PREFIX+"d24f1091023b";
const OFFLINE_URL='/offline.html';
const PUBLIC_PATHS=new Set(["/","/index.html","/members/","/members","/members/index.html","/music/","/music","/music/index.html","/music/stages/","/music/stages","/music/stages/index.html","/music/stages/scent-of-a-woman/","/music/stages/scent-of-a-woman","/music/stages/scent-of-a-woman/index.html","/music/stages/shoes/","/music/stages/shoes","/music/stages/shoes/index.html","/music/stages/crazy-love-song/","/music/stages/crazy-love-song","/music/stages/crazy-love-song/index.html","/music/stages/love-greeting/","/music/stages/love-greeting","/music/stages/love-greeting/index.html","/music/stages/marry-me/","/music/stages/marry-me","/music/stages/marry-me/index.html","/music/stages/ice-doll/","/music/stages/ice-doll","/music/stages/ice-doll/index.html","/music/stages/sad-footsteps/","/music/stages/sad-footsteps","/music/stages/sad-footsteps/index.html","/music/stages/still-like-you/","/music/stages/still-like-you","/music/stages/still-like-you/index.html","/music/stages/hot-girl/","/music/stages/hot-girl","/music/stages/hot-girl/index.html","/music/stages/his-voice/","/music/stages/his-voice","/music/stages/his-voice/index.html","/music/stages/wonderful-you/","/music/stages/wonderful-you","/music/stages/wonderful-you/index.html","/music/stages/nevertheless-us/","/music/stages/nevertheless-us","/music/stages/nevertheless-us/index.html","/music/stages/stay/","/music/stages/stay","/music/stages/stay/index.html","/music/stages/like-spring/","/music/stages/like-spring","/music/stages/like-spring/index.html","/music/fanchant/","/music/fanchant","/music/fanchant/index.html","/history/","/history","/history/index.html","/gallery/","/gallery","/gallery/index.html","/gallery/characters/","/gallery/characters","/gallery/characters/index.html","/gallery/fans/","/gallery/fans","/gallery/fans/index.html","/archive/","/archive","/archive/index.html","/archive/concerts/","/archive/concerts","/archive/concerts/index.html","/archive/concerts/the-fan-2026/","/archive/concerts/the-fan-2026","/archive/concerts/the-fan-2026/index.html","/archive/concerts/first-concert-2007/","/archive/concerts/first-concert-2007","/archive/concerts/first-concert-2007/index.html","/archive/concerts/boram-sparkle-2026/","/archive/concerts/boram-sparkle-2026","/archive/concerts/boram-sparkle-2026/index.html","/archive/concerts/boram-still-singing-2025/","/archive/concerts/boram-still-singing-2025","/archive/concerts/boram-still-singing-2025/index.html","/archive/concerts/yeonji-hug-2019/","/archive/concerts/yeonji-hug-2019","/archive/concerts/yeonji-hug-2019/index.html","/archive/concerts/boram-boramhada-2019/","/archive/concerts/boram-boramhada-2019","/archive/concerts/boram-boramhada-2019/index.html","/archive/concerts/yeonji-daegu-2017/","/archive/concerts/yeonji-daegu-2017","/archive/concerts/yeonji-daegu-2017/index.html","/archive/concerts/rebloom-2026/","/archive/concerts/rebloom-2026","/archive/concerts/rebloom-2026/index.html","/archive/concerts/gyuri-lux-2024/","/archive/concerts/gyuri-lux-2024","/archive/concerts/gyuri-lux-2024/index.html","/guide/","/guide","/guide/index.html","/guide/dictionary/","/guide/dictionary","/guide/dictionary/index.html","/today/","/today","/today/index.html","/calendar/","/calendar","/calendar/index.html","/game/","/game","/game/index.html","/game/lyrics/","/game/lyrics","/game/lyrics/index.html","/game/exam/","/game/exam","/game/exam/index.html","/news/","/news","/news/index.html","/letter/","/letter","/letter/index.html","/about/","/about","/about/index.html","/about/install/","/about/install","/about/install/index.html","/radio/test/","/radio/test","/radio/test/index.html","/radio/","/radio","/radio/index.html"]);
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
