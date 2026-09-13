const {esc,archiveTypes}=require('./common');
const {archiveDateLabel,archiveSourceLinks}=require('./views');

function koreaDate(now=new Date()){
 const parts=new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Seoul',year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(now);
 const value=key=>parts.find(p=>p.type===key).value;
 return `${value('year')}-${value('month')}-${value('day')}`;
}
function exactDate(value){
 if(!/^\d{4}-\d{2}-\d{2}$/.test(value))return false;
 const d=new Date(value+'T00:00:00Z');
 return !Number.isNaN(d.getTime())&&d.toISOString().slice(0,10)===value;
}
function selectOnThisDay(rows,now=new Date()){
 const day=koreaDate(now),year=Number(day.slice(0,4)),seen=new Set();
 const records=rows.filter(row=>{
  const date=row.date||row.publishedDate||'';
  if(!exactDate(date)||Number(date.slice(0,4))>=year||date.slice(5)!==day.slice(5))return false;
  if(row.dateBasis==='season'||row.dateStatus==='unknown'||row.eventState==='scheduled'||row.eventState==='cancelled'||row.hidden===true)return false;
  if(row.id&&seen.has(row.id))return false;
  if(row.id)seen.add(row.id);
  return true;
 }).sort((a,b)=>(b.date||b.publishedDate).localeCompare(a.date||a.publishedDate)||String(a.id||a.title).localeCompare(String(b.id||b.title)));
 return {day,records};
}
function onThisDay(rows,now=new Date()){
 const {day,records}=selectOnThisDay(rows,now),month=Number(day.slice(5,7)),date=Number(day.slice(8,10));
 const groups=[...new Set(records.map(row=>(row.date||row.publishedDate).slice(0,4)))];
 return `<section class="on-this-day" id="onThisDay" data-day="${day}" aria-labelledby="onThisDayTitle">
  <header class="on-this-day-heading"><div><div class="eye">ON THIS DAY · ${month}.${String(date).padStart(2,'0')}</div><h2 id="onThisDayTitle">오늘 날짜의 씨야</h2></div><span class="on-this-day-date">${month}월 ${date}일 · 한국 날짜 기준</span></header>
  <p class="on-this-day-intro">지난해까지의 기록 중 오늘과 같은 월·일의 씨야와 멤버들의 활동을 모았습니다.<br>영상·기사 게시일 기준의 기록과 잠정 날짜는 카드에 따로 표시합니다.</p>
  ${records.length?`<p class="on-this-day-count">${groups.length}개 연도 · ${records.length}개의 기록</p><div class="on-this-day-years">${groups.map(year=>`<section class="on-this-day-year" aria-labelledby="day-year-${year}"><h3 id="day-year-${year}">${year}<span>${Number(day.slice(0,4))-Number(year)}년 전 오늘</span></h3><div class="on-this-day-cards">${records.filter(row=>(row.date||row.publishedDate).startsWith(year)).map(row=>`<article class="on-this-day-card" data-record-id="${esc(row.id||'')}"><div class="on-this-day-type">${esc(archiveTypes[row.type]||row.type||'기록')}</div><h4>${esc(row.title||row.program||'씨야의 기록')}</h4><p class="on-this-day-record-date">${archiveDateLabel(row)}</p>${row.members?.length?`<p>${esc(row.members.join(' · '))}</p>`:''}${row.songs?.length?`<p>관련곡 · ${esc(row.songs.join(' · '))}</p>`:''}${row.note?`<p class="on-this-day-note">${esc(row.note)}</p>`:''}<div class="on-this-day-sources">${archiveSourceLinks(row)}</div></article>`).join('')}</div></section>`).join('')}</div>`:`<div class="on-this-day-empty"><strong>${month}월 ${date}일의 과거 기록을 기다리고 있어요.</strong><p>아직 이 날짜로 등록된 지난 연도의 기록이 없습니다.<br>새로운 기록을 찾으면 이곳에도 함께 보여드릴게요.</p></div>`}
  <a class="on-this-day-more" href="/archive/">아카이브 전체 기록 보기 →</a>
 </section>`;
}
module.exports={koreaDate,selectOnThisDay,onThisDay};
