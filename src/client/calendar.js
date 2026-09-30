'use strict';
const {koreaDate,exactDate,occurrences}=require('../shared/calendar-data');
const {monthContent,upcoming}=require('../shared/calendar-view');
const {calendarICS}=require('../shared/calendar-ics');
const {defaultDay,selectionFromURL}=require('../shared/calendar-state');
const form=document.getElementById('calendarFilters'),monthInput=document.getElementById('calendarMonth'),status=document.getElementById('calendarStatus');
let data=null,events=[],state=selectionFromURL('',[],koreaDate());
function fromURL(){
 state=selectionFromURL(location.search,events,koreaDate());
}
function enable(){document.querySelectorAll('.cal-js').forEach(el=>el.hidden=false);}
function render(saveURL=true){
 if(!data)return;
 state.today=koreaDate();const view=monthContent(events,state);
 document.querySelector('.cal-upcoming>div').innerHTML=upcoming(data.events,state.today);
 monthInput.value=state.month;form.elements.member.value=state.member;form.elements.type.value=state.type;form.elements.anniversaries.checked=state.anniversaries;
 const board=document.getElementById('calendarGrid');board.querySelector('.cal-week').outerHTML=view.grid.match(/^<div class="cal-week"[\s\S]*?<\/div>/)[0];board.querySelector('.cal-grid').outerHTML=view.grid.slice(view.grid.indexOf('<div class="cal-grid"'));
 board.hidden=state.view==='list';document.querySelector('.cal-columns').classList.toggle('list-only',state.view==='list');
 document.getElementById('calendarList').innerHTML=view.list;document.getElementById('calendarListTitle').textContent=view.heading;
 status.textContent=Number(state.month.slice(5))+'월 · '+view.monthCount+'개 일정'+(state.day?' · 선택한 날 '+view.count+'개':'');
 document.querySelectorAll('[data-view]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.view===state.view)));
 document.querySelector('[data-month-step="-1"]').disabled=state.month<='2006-01';document.querySelector('[data-month-step="1"]').disabled=state.month>='2100-12';enable();
 if(saveURL){const q=new URLSearchParams({month:state.month});for(const key of ['day','event'])if(state[key])q.set(key,state[key]);if(!state.day)q.set('scope','month');if(state.member!=='all')q.set('member',state.member);if(state.type!=='all')q.set('type',state.type);if(!state.anniversaries)q.set('anniversaries','0');if(state.view==='list')q.set('view','list');history.replaceState(null,'','/calendar/?'+q+location.hash);}
}
form.addEventListener('submit',e=>e.preventDefault());
form.addEventListener('change',()=>{state.member=form.elements.member.value;state.type=form.elements.type.value;state.anniversaries=form.elements.anniversaries.checked;if(state.type==='anniversary'){state.anniversaries=true;}state.event='';render();});
monthInput.addEventListener('change',()=>{if(!monthInput.validity.valid||!monthInput.value)return;state.month=monthInput.value;state.day=defaultDay(state.month,koreaDate());state.event='';render();});
document.querySelector('.calendar-page').addEventListener('click',async event=>{
 const b=event.target.closest('button');if(!b)return;
 if(b.dataset.copy){const input=b.closest('article').querySelector('input');try{await navigator.clipboard.writeText(input.value);document.getElementById('calendarCopyStatus').textContent='구독 주소를 복사했어요.';}catch{input.focus();input.select();document.getElementById('calendarCopyStatus').textContent='주소를 선택했어요. 직접 복사해 주세요.';}return;}
 if(!data)return;
 if(b.dataset.save){const e=occurrences(events,state.month).find(e=>e.id===b.dataset.save);if(!e||e.state==='cancelled')return;const href=URL.createObjectURL(new Blob([calendarICS([e],e.title)],{type:'text/calendar;charset=utf-8'})),a=document.createElement('a');a.href=href;a.download='seeya-'+e.id+'.ics';a.click();setTimeout(()=>URL.revokeObjectURL(href),1000);return;}
 if(b.dataset.day){state.day=b.dataset.day;state.event='';render();document.querySelector(`[data-day="${state.day}"]`)?.focus({preventScroll:true});return;}
 if(b.dataset.monthStep){const [y,m]=state.month.split('-').map(Number),date=new Date(Date.UTC(y,m-1+Number(b.dataset.monthStep),1));state.month=date.toISOString().slice(0,7);state.day=defaultDay(state.month,koreaDate());state.event='';}
 else if(b.id==='calendarToday'){state.month=koreaDate().slice(0,7);state.day=koreaDate();state.event='';}
 else if(b.id==='calendarAllDays'){state.day='';state.event='';}
 else if(b.dataset.view)state.view=b.dataset.view;
 else return;render();
});
window.addEventListener('popstate',()=>{if(data){fromURL();render(false);}});
document.addEventListener('visibilitychange',()=>{if(!document.hidden&&data)render(false);});
fetch('/calendar/events.json',{cache:'no-store'}).then(r=>{if(!r.ok)throw Error('load');return r.json();}).then(value=>{if(!Array.isArray(value.events)||!Array.isArray(value.anniversaries))throw Error('data');data=value;events=[...data.events,...data.anniversaries];fromURL();render(false);if(state.event)document.getElementById('cal-'+state.event)?.scrollIntoView({block:'nearest'});}).catch(()=>{status.textContent='최신 달력을 불러오지 못해 빌드 시점의 일정을 표시합니다. 연결 후 새로고침해 주세요.';document.querySelectorAll('.cal-workspace button,.cal-workspace input,.cal-workspace select').forEach(el=>el.disabled=true);});
document.querySelectorAll('[data-copy]').forEach(b=>b.hidden=false);
