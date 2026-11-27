'use strict';
const dateInKorea=(now=new Date())=>new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Seoul',year:'numeric',month:'2-digit',day:'2-digit'}).format(now);
const validTypes=value=>Number.isInteger(value)&&value>=1&&value<=15;
const anniversaryType=e=>e.id?.startsWith('birthday-')?2:e.id==='seeya-debut'?4:e.id?.startsWith('album-')?8:0;
function todayEvents(data,now=new Date(),types=1){
 const date=dateInKorea(now);
 const activities=(types&1)?(data.events||[]).filter(e=>['confirmed','changed'].includes(e.state)&&e.date<=date&&(e.endDate||e.date)>=date)
 :[];
 const anniversaries=(data.anniversaries||[]).filter(e=>e.annual&&e.state==='confirmed'&&(types&anniversaryType(e))&&e.date<=date&&e.date.slice(5)===date.slice(5)).map(e=>({...e,date,annual:true}));
 return [...activities,...anniversaries].sort((a,b)=>(a.time||'99:99').localeCompare(b.time||'99:99')||a.id.localeCompare(b.id))
 .filter((e,i,a)=>a.findIndex(x=>x.id===e.id)===i)
 .map(e=>({id:e.id,title:e.title,time:e.time||'',endTime:e.endTime||'',timeLabel:e.timeLabel||'',venue:e.venue||'',annual:!!e.annual,date:e.date,members:e.members||[]}));
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
 const query=new URLSearchParams({month:date.slice(0,7),day:date,view:'list',anniversaries:events.some(e=>e.annual)?'1':'0'});
 if(events.length===1)query.set('event',events[0].id);
 return {
 title:`씨야 일정 · ${Number(date.slice(5,7))}월 ${Number(date.slice(8,10))}일`,
 body:events.slice(0,2).map(e=>{
  if(e.annual)return [artist(e),shortTitle(e)].join('\n');
  const time=e.time?e.time+(e.endTime?'–'+e.endTime:''):'시간 미정';
  const label=String(e.timeLabel||'').trim();
  const place=(!['공연 시작','방송 시작','시작','방송','공연'].includes(label)&&label)||e.venue||'';
  return [time+(place?' · '+place:''),artist(e),shortTitle(e)].join('\n');
 }).join('\n\n')+(events.length>2?`\n\n외 ${events.length-2}개 일정`:''),
 url:'https://seeya-fanpage.com/calendar/?'+query,tag:'seeya-schedule-'+date};
}
const validTime=value=>typeof value==='string'&&/^([01]\d|2[0-3]):(00|30)$/.test(value);
function due(s,now){
 const [h,m]=new Intl.DateTimeFormat('en-GB',{timeZone:'Asia/Seoul',hour:'2-digit',minute:'2-digit',hourCycle:'h23'}).format(now).split(':').map(Number);
 const [sh,sm]=(validTime(s.dailyTime)?s.dailyTime:'09:00').split(':').map(Number),elapsed=h*60+m-sh*60-sm;
 return s.daily&&!s.expired&&s.dailyDate!==dateInKorea(now)&&elapsed>=0&&elapsed<5;
}
function previews(data,now=new Date(),types=1){
 const date=dateInKorea(now),events=todayEvents(data,now,types);
 const list=[{key:'today',label:'오늘 일정',date,events,payload:message(events,date)}];
 const annualDates=(data.anniversaries||[]).filter(e=>types&anniversaryType(e)).flatMap(e=>[Number(date.slice(0,4)),Number(date.slice(0,4))-1].map(y=>String(y)+e.date.slice(4)));
 const dates=[...new Set([...((types&1)?data.events||[]:[]).map(e=>e.date),...annualDates])].filter(d=>d<=date&&new Date(d+'T00:00:00Z').toISOString().slice(0,10)===d).sort().reverse();
 for(const count of [1,2,4]){
 for(const d of dates){const selected=todayEvents(data,new Date(d+'T03:00:00Z'),types).slice(0,count);if(selected.length<count)continue;
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
module.exports={validTypes,dateInKorea,todayEvents,message,validSubscription,validTime,due,previews};
