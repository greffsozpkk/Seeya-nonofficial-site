'use strict';
// Dedicated scope keeps diary/game offline workers and saved data unchanged.
self.addEventListener('push',event=>{
 let p;try{p=event.data.json();}catch{p={title:'씨야 아카이브',body:'오늘의 일정을 확인해 주세요.'};}
 let url=new URL('/calendar/',self.location.origin).href;
 try{const target=new URL(p.url,self.location.origin);if(target.origin===self.location.origin&&target.pathname==='/calendar/')url=target.href;}catch{}
 event.waitUntil(self.registration.showNotification(p.title||'씨야 아카이브',{body:p.body||'',icon:'/images/app/icon-192-v2.png',badge:'/images/app/notification-badge.png',tag:p.tag||'seeya-schedule',actions:[{action:'view-schedule',title:'일정 자세히 보기'}],data:{url}}));
});
self.addEventListener('notificationclick',event=>{event.notification.close();const url=event.notification.data?.url||new URL('/calendar/',self.location.origin).href;event.waitUntil((async()=>{for(const client of await self.clients.matchAll({type:'window',includeUncontrolled:true})){if(client.url===url){await client.focus();return;}}await self.clients.openWindow(url);})());});
