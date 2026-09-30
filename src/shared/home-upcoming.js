'use strict';
const {buildEvents,koreaDate,addDays,MEMBERS,TYPES,timeText}=require('./calendar-data');
const esc=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const shortDate=date=>`${Number(date.slice(5,7))}.${Number(date.slice(8,10))}`;
const weekday=date=>'일월화수목금토'[new Date(date+'T00:00:00Z').getUTCDay()];
function upcomingSchedule(rows,now=new Date()){
 const today=koreaDate(now),day=new Date(today+'T00:00:00Z').getUTCDay();
 const weekStart=addDays(today,-((day+6)%7)),weekEnd=addDays(weekStart,6);
 const future=buildEvents(rows.filter(row=>row.eventState!=='completed'&&row.eventState!=='cancelled'))
  .filter(e=>e.state!=='cancelled'&&e.endDate>=today)
  .sort((a,b)=>a.date.localeCompare(b.date)||(a.time||'99:99').localeCompare(b.time||'99:99')||a.id.localeCompare(b.id));
 const week=future.filter(e=>e.date<=weekEnd);
 return {today,weekStart,weekEnd,thisWeek:week.length>0,events:(week.length?week:future).slice(0,5)};
}
function homeUpcoming(rows,now=new Date()){
 const s=upcomingSchedule(rows,now);
 const month=(s.events.find(e=>e.date>=s.today)?.date||s.today).slice(0,7);
 const allHref=`/calendar/?month=${month}&amp;scope=month`;
 return `<section class="home-upcoming" id="homeUpcoming" data-day="${s.today}" aria-labelledby="homeUpcomingTitle">
 <div class="home-upcoming-inner">
  <div class="home-upcoming-head"><span class="home-upcoming-kicker">SEEYA SCHEDULE</span>
   <h2 id="homeUpcomingTitle">${s.thisWeek?'이번 주 씨야':'다가오는 씨야'}</h2>
   <p>${s.thisWeek?`${shortDate(s.weekStart)} — ${shortDate(s.weekEnd)} · 한국 날짜 기준`:'다음에 만날 씨야의 순간들'}</p>
   <a class="home-upcoming-all" href="${allHref}">전체 일정 보기 <span aria-hidden="true">↗</span></a>
  </div>
  ${s.events.length?`<ul class="home-upcoming-list">${s.events.map(e=>{
   const ongoing=e.date<s.today;
   const members=MEMBERS.every(m=>e.members.includes(m))?'씨야':e.members.join(' · ')||'씨야';
   const title=e.title.replace(/^(?:씨야|남규리|김연지|이보람)\s*·\s*/, '');
   return `<li><a class="home-upcoming-item" href="/calendar/?month=${e.date.slice(0,7)}&amp;event=${encodeURIComponent(e.id)}" data-type="${esc(e.type)}">
    <div class="home-upcoming-date"><time datetime="${e.date}">${shortDate(e.date)}</time><span>${e.date===s.today?'오늘':ongoing?'진행 중':weekday(e.date)+'요일'}</span>${e.endDate!==e.date?`<small>~ ${shortDate(e.endDate)}</small>`:''}</div>
    <div class="home-upcoming-copy"><div class="home-upcoming-meta"><span class="home-upcoming-type">${esc(TYPES[e.type])}</span><span>${esc(members)}</span>${e.state==='changed'?'<b>일정 변경</b>':''}</div>
     <h3>${esc(title)}</h3>${e.time?`<p>${esc(timeText(e))}</p>`:''}
    </div><span class="home-upcoming-chevron" aria-hidden="true">›</span>
   </a></li>`;
  }).join('')}</ul>`:'<p class="home-upcoming-empty">새로운 만남을 기다리고 있어요.<br>확인된 일정이 등록되면 이곳에 함께 보여드릴게요.</p>'}
 </div></section>`;
}
module.exports={upcomingSchedule,homeUpcoming};
