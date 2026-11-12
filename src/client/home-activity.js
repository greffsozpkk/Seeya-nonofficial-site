'use strict';
const {ARTISTS,activityModel,activityActions,calendarUrl}=require('../shared/home-activity');
const {TYPES,timeText,MEMBERS}=require('../shared/calendar-data');
const {calendarICS}=require('../shared/calendar-ics');
const escape=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const dateLabel=s=>`${Number(s.slice(5,7))}월 ${Number(s.slice(8))}일`;
const members=e=>MEMBERS.every(m=>e.members.includes(m))?'씨야':e.members.join(' · ');
const artistKey='seeya.home.artist.v1';
function storage(area,method,key,value){
 try{return window[area][method](key,value);}catch{return null;}
}
function previousVisit(){
 const sessionKey='seeya.home.visit.session.v1',key='seeya.home.visit.v1';
 let prior=storage('sessionStorage','getItem',sessionKey);
 if(prior===null){
  prior=storage('localStorage','getItem',key)||'0';
  storage('sessionStorage','setItem',sessionKey,prior);
 }
 storage('localStorage','setItem',key,String(Date.now()));
 return Number(prior)||0;
}
function featureCard(model,refs){
 if(!model.feature){
  const r=model.recent?.row;
  const empty=model.artist==='전체'?'이번 주에 남은 일정이 없어요.':model.artist+'의 이번 주 남은 일정이 없어요.';
  return `<article class="activity-card empty"><p class="activity-phase">${escape(empty)}</p>${r?`<p class="activity-meta">${model.since?'지난 방문 이후 추가·보강된 기록':'최근 추가·보강된 기록'}</p><h3>${escape(r.title)}</h3><a class="activity-primary" href="/archive/?record=${encodeURIComponent(r.id)}">기록 보기</a>`:'<a class="activity-primary" href="/archive/">아카이브 둘러보기</a>'}</article>`;
 }
 const {event:e,rank}=model.feature;
 const when=['오늘','내일','어제',dateLabel(e.date)][rank];
 const actions=activityActions(model.feature,refs).map((a,i)=>a.save?`<button type="button" data-home-save>일정 담기</button>`:`<a class="${i===0?'activity-primary':''}" href="${escape(a.href)}"${a.href.startsWith('https://')?' target="_blank" rel="noopener noreferrer"':''}>${escape(a.label)}</a>`).join('');
 const title=e.title.replace(/^(씨야|남규리|김연지|이보람)\s*·\s*/,'');
 return `<article class="activity-card" data-phase="${rank}"><div class="activity-eyeline"><span class="activity-phase">${when}</span><span>${escape(TYPES[e.type])} · ${escape(members(e))}</span></div><h3>${escape(title)}</h3><p class="activity-meta"><time datetime="${e.date}">${dateLabel(e.date)}${e.endDate!==e.date?' – '+dateLabel(e.endDate):''}</time>${e.time?' · '+escape(timeText(e)):''}</p>${e.venue?`<p class="activity-location">${escape(e.venue)}</p>`:''}<div class="activity-actions">${actions}</div></article>`;
}
function createExperience(root,refs,injected){
 let artist=injected?'씨야':storage('localStorage','getItem',artistKey);
 if(!ARTISTS.includes(artist))artist='전체';
 const prior=injected?0:previousVisit();
 let rows=[],model,previousMarkup;
 root.classList.add('home-activity');
 root.innerHTML=`<div class="activity-inner"><header><span class="home-upcoming-kicker">SEEYA SCHEDULE</span><h2 id="homeUpcomingTitle">이번 주 씨야</h2><p class="activity-week"></p><div class="activity-artists" role="group" aria-label="관심 아티스트">${ARTISTS.map(m=>`<button type="button" data-artist="${m}">${m}</button>`).join('')}</div></header><div class="activity-content" aria-live="polite"></div></div>`;
 const content=root.querySelector('.activity-content');
 function render(data){
  rows=data;
  const now=injected?.now||new Date();
  const previewRows=injected?rows.filter(r=>r.id===injected.id).map(r=>({...r,eventState:injected.phase==='after'?'completed':'scheduled'})):rows;
  model=activityModel(previewRows,artist,now,prior,refs);
  root.dataset.day=model.today;
  root.querySelector('.activity-week').textContent=dateLabel(model.weekStart)+' – '+dateLabel(model.weekEnd)+' · 한국 날짜 기준';
  root.querySelectorAll('[data-artist]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.artist===artist)));
  const list=model.other.map(({event:e})=>`<li><a href="${escape(calendarUrl(e))}"><time datetime="${e.date}">${dateLabel(e.date)}</time><span>${escape(e.title)}</span>${e.time?`<small>${escape(e.time)}</small>`:''}<span aria-hidden="true">›</span></a></li>`).join('');
  const notices=model.notices.map(e=>`<li><a href="${escape(e.href)}">${escape(e.label)} · ${escape(e.title)}</a></li>`).join('');
  const next=featureCard(model,refs)+(list?`<ul class="activity-list" aria-label="이번 주 다른 일정">${list}</ul>`:'')+(notices?`<ul class="activity-list">${notices}</ul>`:'')+`<a class="activity-calendar" href="/calendar/?month=${model.today.slice(0,7)}&amp;scope=month">전체 일정 보기 <span aria-hidden="true">↗</span></a>`;
  if(previousMarkup!==next){
   previousMarkup=next;
   const active=content.contains(document.activeElement)?document.activeElement:null;
   const selector=active?.hasAttribute('data-home-save')?'[data-home-save]':null;
   const href=active?.getAttribute('href');
   content.innerHTML=next;
   if(selector)content.querySelector(selector)?.focus({preventScroll:true});
   else if(href)Array.from(content.querySelectorAll('a')).find(a=>a.getAttribute('href')===href)?.focus({preventScroll:true});
  }
 }
 root.addEventListener('click',event=>{
  const button=event.target.closest('button');
  if(!button)return;
  if(button.dataset.artist){
   artist=button.dataset.artist;
   if(!injected)storage('localStorage','setItem',artistKey,artist);
   render(rows);
  }else if(button.hasAttribute('data-home-save')&&model?.feature){
   const e=model.feature.event,a=document.createElement('a');
   const url=URL.createObjectURL(new Blob([calendarICS([e.session?{...e,id:e.calendarId+'-'+e.date.replaceAll('-','')}:e],e.title)],{type:'text/calendar;charset=utf-8'}));
   a.href=url;a.download='seeya-'+e.id+'.ics';a.click();
   setTimeout(()=>URL.revokeObjectURL(url),1000);
  }
 });
 return render;
}
function previewClock(){
 if(!['127.0.0.1','localhost','[::1]'].includes(location.hostname))return null;
 const phase=new URLSearchParams(location.search).get('incheon');
 const dates={before:'2026-10-30',today:'2026-10-31',after:'2026-11-01'};
 if(!Object.hasOwn(dates,phase))return null;
 return {phase,now:new Date(dates[phase]+'T12:00:00+09:00'),id:'20261031-the-fan-incheon'};
}
module.exports={createExperience,previewClock};
