(function(){'use strict';const modules={
"src/client/calendar.js":function(module,exports,__require){
'use strict';
const {koreaDate,exactDate,occurrences}=__require("src/shared/calendar-data.js");
const {monthContent,upcoming}=__require("src/shared/calendar-view.js");
const {calendarICS}=__require("src/shared/calendar-ics.js");
const {defaultDay,selectionFromURL}=__require("src/shared/calendar-state.js");
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

},
"src/shared/calendar-data.js":function(module,exports,__require){
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

},
"src/shared/calendar-view.js":function(module,exports,__require){
'use strict';
const {TYPES,occurrences,filterEvents,timeText,stateText}=__require("src/shared/calendar-data.js");
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const dateLabel=d=>`${Number(d.slice(5,7))}월 ${Number(d.slice(8,10))}일`;
function upcoming(events,today){return events.filter(e=>e.date>=today&&e.state!=='cancelled').slice(0,3).map(e=>`<a href="/calendar/?month=${e.date.slice(0,7)}&event=${encodeURIComponent(e.id)}"><time>${e.date.slice(5).replace('-',' / ')}</time><span>${esc(e.title)}</span></a>`).join('')||'<p>새로운 만남을 기다리고 있어요.</p>';}
function eventCard(e,open=false){return `<details class="cal-event${e.state==='cancelled'?' is-cancelled':''}" data-type="${esc(e.type)}" id="cal-${esc(e.id)}"${open?' open':''}><summary><time datetime="${e.date}">${dateLabel(e.date)}${e.endDate&&e.endDate!==e.date?`<br>~ ${dateLabel(e.endDate)}`:''}</time><span class="cal-event-copy"><span class="cal-meta"><span class="cal-category">${esc(TYPES[e.type])}</span> <span>${esc(e.members.length===3?'씨야':e.members.join(' · '))}</span></span><strong>${esc(e.title)}</strong><span class="cal-time">${esc(timeText(e))}</span></span><span class="cal-state ${e.state}">${e.annual?'기념일':stateText(e)}</span><span class="cal-expand" aria-hidden="true">＋</span></summary><div class="cal-event-body">${e.venue?`<p><b>장소</b> ${esc(e.venue)}</p>`:''}<p>${esc(e.note).replace(/\n/g,'<br>')}</p>${e.basis==='recording'?'<p class="cal-note">녹화일 기준입니다. 방송일과 다를 수 있어요.</p>':''}<div class="cal-links">${e.recordIds.map(id=>`<a href="/archive/?record=${encodeURIComponent(id)}">아카이브 기록 보기</a>`).join('')}${e.sources.map(s=>`<a href="${esc(s.url)}"${s.url.startsWith('/')?'':' target="_blank" rel="noopener noreferrer"'}>${esc(s.label)}${s.url.startsWith('/')?'':' ↗'}</a>`).join('')}</div>${e.state!=='cancelled'?`<button type="button" class="cal-save cal-js" data-save="${esc(e.id)}" hidden>이 일정 저장 (.ics)</button><p class="cal-note">저장한 사본에는 이후 변경이 자동 반영되지 않아요.</p>`:''}</div></details>`;}
function monthContent(events,state){
 const {month,day='',today='',event=''}=state;
 const list=filterEvents(occurrences(events,month),state).sort((a,b)=>a.date.localeCompare(b.date)||a.time.localeCompare(b.time)||a.title.localeCompare(b.title,'ko'));
 const [year,m]=month.split('-').map(Number),offset=new Date(Date.UTC(year,m-1,1)).getUTCDay(),days=new Date(Date.UTC(year,m,0)).getUTCDate();
 const grid=Array.from({length:offset},()=>'<span class="cal-pad" aria-hidden="true"></span>').concat(Array.from({length:days},(_,i)=>{const d=month+'-'+String(i+1).padStart(2,'0'),entries=list.filter(e=>e.date<=d&&(e.endDate||e.date)>=d);return `<button type="button" data-day="${d}" class="cal-day${d===today?' is-today':''}${d===day?' is-selected':''}" aria-pressed="${d===day}" aria-label="${m}월 ${i+1}일, ${entries.length}개 일정${d===today?', 오늘':''}"><span class="cal-day-num">${i+1}</span>${entries.length?`<span class="cal-dots" aria-hidden="true">${[...new Set(entries.map(e=>e.type))].map(t=>`<i class="dot-${t}"></i>`).join('')}</span><span class="cal-day-preview" aria-hidden="true">${esc(entries[0].title)}</span><small>${entries.length}건</small>`:''}</button>`;})).join('');
 const chosen=day?list.filter(e=>e.date<=day&&(e.endDate||e.date)>=day):list;
 return {grid:`<div class="cal-week" aria-hidden="true">${['일','월','화','수','목','금','토'].map(x=>`<span>${x}</span>`).join('')}</div><div class="cal-grid" aria-label="${year}년 ${m}월">${grid}</div>`,list:chosen.length?chosen.map(e=>eventCard(e,e.id===event)).join(''):`<div class="cal-empty"><strong>${day?dateLabel(day):m+'월'}에${state.member==='all'&&state.type==='all'?'':' 선택한 조건으로'} 등록된 일정이 없어요.</strong><p>일정이 확인되면 이곳에 함께 모아둘게요.</p></div>`,heading:day?dateLabel(day)+'의 일정':m+'월 전체 일정',count:chosen.length,monthCount:list.length};
}
module.exports={esc,eventCard,monthContent,dateLabel,upcoming};

},
"src/shared/calendar-ics.js":function(module,exports,__require){
'use strict';
const {addDays,timeText}=__require("src/shared/calendar-data.js");
const ORIGIN='https://seeya-fanpage.com';
const text=value=>String(value??'').replace(/\\/g,'\\\\').replace(/\r?\n|\r/g,'\\n').replace(/;/g,'\\;').replace(/,/g,'\\,');
const stamp=value=>{const d=new Date(/^\d{4}-\d{2}-\d{2}$/.test(value)?value+'T00:00:00+09:00':value);if(Number.isNaN(d.getTime()))throw Error('Invalid calendar modification date');return d.toISOString().replace(/[-:]/g,'').slice(0,15)+'Z';};
function fold(line){let result='',bytes=0;for(const char of line){const n=new TextEncoder().encode(char).length;if(bytes+n>75){result+='\r\n ';bytes=1;}result+=char;bytes+=n;}return result;}
function eventLines(e){
 const url=ORIGIN+'/calendar/?'+(e.annual?'':'month='+e.date.slice(0,7)+'&')+'event='+encodeURIComponent(e.id);
 const lines=['BEGIN:VEVENT','UID:'+e.id+'@seeya-fanpage.com','DTSTAMP:'+stamp(e.updatedAt),'LAST-MODIFIED:'+stamp(e.updatedAt),'SEQUENCE:'+e.sequence];
 if(e.time){lines.push('DTSTART:'+stamp(e.date+'T'+e.time+':00+09:00'));if(e.endTime)lines.push('DTEND:'+stamp((e.endDate||e.date)+'T'+e.endTime+':00+09:00'));}
 else lines.push('DTSTART;VALUE=DATE:'+e.date.replace(/-/g,''),'DTEND;VALUE=DATE:'+addDays(e.endDate||e.date,1).replace(/-/g,''));
 if(e.annual)lines.push('RRULE:FREQ=YEARLY');
 lines.push('SUMMARY:'+text((e.state==='cancelled'?'[취소] ':e.state==='changed'?'[변경] ':'')+e.title),'STATUS:'+(e.state==='cancelled'?'CANCELLED':'CONFIRMED'),'TRANSP:TRANSPARENT','CATEGORIES:'+text(e.type),'LOCATION:'+text(e.venue),'DESCRIPTION:'+text([e.members.join(' · '),timeText(e),e.note,...e.sources.map(s=>s.label+': '+(s.url.startsWith('/')?ORIGIN+s.url:s.url)),...e.recordIds.map(id=>ORIGIN+'/archive/?record='+encodeURIComponent(id))].filter(Boolean).join('\n')),'URL:'+url,'END:VEVENT');
 return lines;
}
function calendarICS(events,name='씨야 활동 일정'){return ['BEGIN:VCALENDAR','VERSION:2.0','PRODID:-//SEEYA ARCHIVE//Calendar//KO','CALSCALE:GREGORIAN','X-WR-CALNAME:'+text(name),'X-WR-TIMEZONE:Asia/Seoul',...events.flatMap(eventLines),'END:VCALENDAR'].map(fold).join('\r\n')+'\r\n';}
module.exports={calendarICS,fold,text,stamp};

},
"src/shared/calendar-state.js":function(module,exports,__require){
'use strict';
const {exactDate,MEMBERS,TYPES}=__require("src/shared/calendar-data.js");
const validMonth=m=>/^(20\d{2}|2100)-(0[1-9]|1[0-2])$/.test(m||'')&&m>='2006-01';
function defaultDay(month,today){return month===today.slice(0,7)?today:month+'-01';}
function selectionFromURL(search,events,today){
 const q=new URLSearchParams(search),month=validMonth(q.get('month'))?q.get('month'):today.slice(0,7);
 const state={month,today,day:q.get('scope')==='month'?'':defaultDay(month,today),member:q.get('member')||'all',type:q.get('type')||'all',anniversaries:q.get('anniversaries')!=='0',view:q.get('view')==='list'?'list':'calendar',event:q.get('event')||''};
 if(!['all','group',...MEMBERS].includes(state.member))state.member='all';
 if(!['all',...Object.keys(TYPES)].includes(state.type))state.type='all';
 if(exactDate(q.get('day'))&&q.get('day').startsWith(month))state.day=q.get('day');
 const target=events.find(e=>e.id===state.event);
 if(target){
  if(target.annual)state.anniversaries=true;
  const day=target.annual?month.slice(0,4)+target.date.slice(4):target.date;
  if(exactDate(day)){state.day=day;state.month=day.slice(0,7);state.member='all';state.type='all';}
 }else state.event='';
 return state;
}
module.exports={defaultDay,selectionFromURL};

}
};const cache={};function __require(id){if(cache[id])return cache[id].exports;const m=cache[id]={exports:{}};modules[id](m,m.exports,__require);return m.exports;}__require("src/client/calendar.js");})();
