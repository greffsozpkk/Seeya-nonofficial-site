'use strict';
const dateInKorea=(now=new Date())=>new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Seoul',year:'numeric',month:'2-digit',day:'2-digit'}).format(now);
function todayEvents(data,now=new Date()){
 const date=dateInKorea(now);
 return (data.events||[]).filter(e=>['confirmed','changed'].includes(e.state)&&e.date<=date&&(e.endDate||e.date)>=date)
 .sort((a,b)=>(a.time||'99:99').localeCompare(b.time||'99:99')||a.id.localeCompare(b.id))
 .filter((e,i,a)=>a.findIndex(x=>x.id===e.id)===i)
 .map(e=>({id:e.id,title:e.title,time:e.time||'',timeLabel:e.timeLabel||'',date:e.date,members:e.members||[]}));
}
function artist(e){return e.members?.length===3?'씨야':e.members?.join('·')||'씨야';}
function shortTitle(e){
 let title=String(e.title).replace(/\s+/g,' ').trim();
 for(const prefix of [artist(e),...(e.members||[])]){
 if(title.startsWith(prefix+' '))title=title.slice(prefix.length).replace(/^[\s·:–—-]+/,'');
 }
 return Array.from(title).length>55?Array.from(title).slice(0,54).join('')+'…':title;
}
function message(events,date){
 if(!events.length)return null;
 const query=new URLSearchParams({month:date.slice(0,7),day:date,view:'list',anniversaries:'0'});
 if(events.length===1)query.set('event',events[0].id);
 return {
 title:events.length===1?'오늘의 씨야 · '+artist(events[0]):'오늘의 씨야 · 일정 '+events.length+'개',
 body:events.slice(0,2).map(e=>`${e.time||'시간 미정'} ${events.length>1?artist(e)+' · ':''}${shortTitle(e)}`).join('\n')+(events.length>2?`\n외 ${events.length-2}개 일정`:''),
 url:'https://seeya-fanpage.com/calendar/?'+query,tag:'seeya-schedule-'+date};
}
const validTime=value=>typeof value==='string'&&/^([01]\d|2[0-3]):(00|30)$/.test(value);
function due(s,now){
 const [h,m]=new Intl.DateTimeFormat('en-GB',{timeZone:'Asia/Seoul',hour:'2-digit',minute:'2-digit',hourCycle:'h23'}).format(now).split(':').map(Number);
 const [sh,sm]=(validTime(s.dailyTime)?s.dailyTime:'09:00').split(':').map(Number),elapsed=h*60+m-sh*60-sm;
 return s.daily&&!s.expired&&s.dailyDate!==dateInKorea(now)&&elapsed>=0&&elapsed<5;
}
function previews(data,now=new Date()){
 const date=dateInKorea(now),events=todayEvents(data,now);
 const list=[{key:'today',label:'오늘 일정',date,events,payload:message(events,date)}];
 const dates=[...new Set((data.events||[]).map(e=>e.date))].filter(d=>d<=date).sort().reverse();
 for(const count of [1,2,4]){
 for(const d of dates){const selected=todayEvents(data,new Date(d+'T03:00:00Z')).slice(0,count);if(selected.length<count)continue;
 const payload=message(selected,d);payload.title='[예시] '+payload.title;payload.tag='seeya-preview-'+count;
 list.push({key:'example'+count,label:count+'개 일정 예시',date:d,events:selected,payload});break;}
 }
 return list;
}
function validSubscription(s){
 try{const u=new URL(s.endpoint);return u.protocol==='https:'&&!u.username&&!u.password&&!u.port&&
 (['fcm.googleapis.com','jmt17.google.com','android.googleapis.com','updates.push.services.mozilla.com','web.push.apple.com'].includes(u.hostname)||u.hostname.endsWith('.notify.windows.com'))&&
 u.pathname.length>1&&typeof s.keys?.p256dh==='string'&&/^[A-Za-z0-9_-]{87}=?$/.test(s.keys.p256dh)&&typeof s.keys?.auth==='string'&&/^[A-Za-z0-9_-]{22}={0,2}$/.test(s.keys.auth);
 }catch{return false;}
}
module.exports={dateInKorea,todayEvents,message,validSubscription,validTime,due,previews};
