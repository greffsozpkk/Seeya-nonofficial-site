'use strict';
// Isolated scope: does not replace the public site's or diary's service worker.
self.addEventListener('push',event=>{
 let p;try{p=event.data.json();}catch{p={title:'씨야 알림 테스트',body:'새 알림이 도착했어요.'};}
 const allowed=new URL(self.registration.scope);
 let url=allowed.href;
 try{const target=new URL(p.url,allowed);if(target.href.startsWith(allowed.href)||(target.origin==='https://seeya-fanpage.com'&&target.pathname==='/calendar/'))url=target.href;}catch{}
 event.waitUntil(self.registration.showNotification(p.title||'씨야 아카이브',{body:p.body||'',icon:new URL('icon-192.png',allowed).href,badge:new URL('badge-96.png',allowed).href,tag:p.tag||'seeya-test',data:{url}}));
});
self.addEventListener('notificationclick',event=>{
 event.notification.close();const url=event.notification.data?.url||self.registration.scope;
 event.waitUntil((async()=>{const clients=await self.clients.matchAll({type:'window',includeUncontrolled:true});for(const client of clients){if(client.url===url){await client.focus();return;}}await self.clients.openWindow(url);})());
});
