'use strict';
const MEMBERS=['남규리','김연지','이보람'];
const TYPES={performance:'공연·행사',broadcast:'방송·라디오',release:'발매',booking:'예매',anniversary:'기념일'};
function exactDate(value){return /^\d{4}-\d{2}-\d{2}$/.test(value||'')&&!Number.isNaN(Date.parse(value+'T00:00:00Z'))&&new Date(value+'T00:00:00Z').toISOString().slice(0,10)===value;}
function koreaDate(now=new Date()){const p=new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Seoul',year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(now);return ['year','month','day'].map(k=>p.find(x=>x.type===k).value).join('-');}
function addDays(date,n){return new Date(Date.parse(date+'T00:00:00Z')+n*86400000).toISOString().slice(0,10);}
function safeUrl(value){try{const u=new URL(value);return u.protocol==='https:'||u.protocol==='http:'?u.href:'';}catch{return '';}}
function buildEvents(rows){
 const groups=new Map();
 for(const row of rows){
  const c=row.calendar||{};
  if(row.hidden||c.enabled===false||!exactDate(row.date)||row.dateStatus!=='confirmed'||!['event','broadcast','release','recording'].includes(row.dateBasis))continue;
  const type=c.type||({concert:'performance',event:'performance','music-show':'broadcast',radio:'broadcast',variety:'broadcast',album:'release'}[row.type]);
  if(!TYPES[type]||type==='anniversary')continue;
  if(c.time&&!/^([01]\d|2[0-3]):[0-5]\d$/.test(c.time))throw Error('Invalid calendar time: '+row.id);
  if(c.endTime&&(!c.time||!/^([01]\d|2[0-3]):[0-5]\d$/.test(c.endTime)))throw Error('Invalid calendar end time: '+row.id);
  const endDate=c.endDate||row.endDate||row.date;
  if(!exactDate(endDate)||endDate<row.date||(c.endTime&&endDate===row.date&&c.endTime<=c.time))throw Error('Invalid calendar end: '+row.id);
  const id='activity-'+(c.groupId||row.id);
  if(!/^[a-zA-Z0-9_-]+$/.test(id))throw Error('Invalid calendar id: '+id);
  const state=c.state||({cancelled:'cancelled',changed:'changed'}[row.eventState])||'confirmed';
  if(!['confirmed','changed','cancelled'].includes(state))throw Error('Invalid calendar state: '+row.id);
  const event={id,date:row.date,endDate,time:c.time||'',endTime:c.endTime||'',timeLabel:c.timeLabel||'',title:c.title||row.title.replace(/\s*출연 예정$/,' 출연'),type,members:row.members.filter(m=>MEMBERS.includes(m)),state,venue:row.venue||'',note:c.note??row.note??'',basis:row.dateBasis,recordIds:[row.id],sources:[row.source,...(row.additionalSources||[])].filter(s=>s&&safeUrl(s.url)).map(s=>({label:s.label||'관련 자료',url:safeUrl(s.url)})),updatedAt:row.updatedAt||row.addedAt||row.date,sequence:c.sequence||0};
  if(!Number.isInteger(event.sequence)||event.sequence<0)throw Error('Invalid calendar sequence: '+row.id);
  if(groups.has(id)){
   const first=groups.get(id);
   if(first.date!==event.date||first.time!==event.time||first.type!==event.type||first.state!==event.state)throw Error('Calendar group mismatch: '+id);
   first.recordIds.push(row.id);first.members=[...new Set([...first.members,...event.members])];
   first.sources=[...new Map([...first.sources,...event.sources].map(s=>[s.url,s])).values()];
   first.updatedAt=[first.updatedAt,event.updatedAt].sort().at(-1);first.sequence=Math.max(first.sequence,event.sequence);
  }else groups.set(id,event);
 }
 return [...groups.values()].sort((a,b)=>a.date.localeCompare(b.date)||a.time.localeCompare(b.time)||a.id.localeCompare(b.id));
}
function buildAnniversaries(members,albums,debut){
 const base={type:'anniversary',state:'confirmed',time:'',endTime:'',timeLabel:'',venue:'',recordIds:[],updatedAt:'2026-09-30',sequence:0,annual:true};
 const list=members.map((m,i)=>{const md=m.birthday.match(/(\d+)월\s*(\d+)일/);if(!md)throw Error('Invalid birthday');return {...base,id:'birthday-'+['gyuri','yeonji','boram'][i],date:'2006-'+md[1].padStart(2,'0')+'-'+md[2].padStart(2,'0'),title:m.name+' 생일',members:[m.name],note:'매년 함께 기념하는 생일입니다.',sources:[{label:'멤버 소개',url:'/members/'}]};});
 list.push({...base,id:'seeya-debut',date:addDays(debut.date,0).replace(/^2006/,'2007'),title:'씨야 데뷔 기념일',members:MEMBERS,note:'2006년 3월 12일 첫 방송 데뷔를 기념합니다.',sources:[{label:'데뷔 기록',url:'/archive/?record='+encodeURIComponent(debut.id)}]});
 albums.filter(a=>/ALBUM/.test(a.type)).forEach(a=>{const d=a.type.match(/(\d{4})\.(\d{2})\.(\d{2})/),key=new URL(a.url).searchParams.get('albumId');if(!d||!key)throw Error('Invalid anniversary album');const date=`${Number(d[1])+1}-${d[2]}-${d[3]}`;list.push({...base,id:'album-'+key,date,title:a.name+' 발매 기념일',members:MEMBERS,note:`${d[1]}년 ${Number(d[2])}월 ${Number(d[3])}일 발매된 씨야 앨범입니다.`,sources:[{label:'앨범 정보',url:a.url}]});});
 return list;
}
function occurrences(events,month){return events.map(e=>e.annual?{...e,date:month.slice(0,4)+e.date.slice(4),endDate:month.slice(0,4)+e.date.slice(4)}:e).filter(e=>exactDate(e.date)&&e.date.slice(0,7)<=month&&(e.endDate||e.date).slice(0,7)>=month&&(!e.annual||e.date>=events.find(x=>x.id===e.id).date));}
function filterEvents(events,{member='all',type='all',anniversaries=true}={}){return events.filter(e=>(anniversaries||!e.annual)&&(member==='all'||(member==='group'?MEMBERS.every(m=>e.members.includes(m)):e.members.includes(member)))&&(type==='all'||e.type===type));}
function timeText(e){return e.annual?'매년 기념':e.time?`${e.time}${e.endTime?'–'+e.endTime:''}${e.timeLabel?' · '+e.timeLabel:''}`:e.type==='release'?'발매일 · 시간 미정':'시간 미정';}
function stateText(e){return {cancelled:'취소',changed:'변경',confirmed:'확정'}[e.state];}
module.exports={MEMBERS,TYPES,exactDate,koreaDate,addDays,safeUrl,buildEvents,buildAnniversaries,occurrences,filterEvents,timeText,stateText};
