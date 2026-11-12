'use strict';
const {buildEvents,koreaDate,addDays,weekBounds,MEMBERS}=require('./calendar-data');
const reviewedRadio=new Map(require('../data/radio-pilot.json').filter(v=>v.kind==='replay'&&v.channelStatus==='official-channel-checked').map(v=>[v.recordId,'https://www.youtube.com/watch?v='+v.youtubeId]));
const ARTISTS=['전체','씨야',...MEMBERS];
function matches(artist,members){
 const group=MEMBERS.every(m=>members.includes(m));
 return artist==='전체'||(artist==='씨야'?group:!group&&members.includes(artist));
}
function activityModel(rows,artist,now,previousVisit=0,refs={}){
 const today=koreaDate(now), yesterday=addDays(today,-1), tomorrow=addDays(today,1);
 const {weekStart,weekEnd}=weekBounds(today);
 const clock=new Intl.DateTimeFormat('en-GB',{timeZone:'Asia/Seoul',hour:'2-digit',minute:'2-digit',hourCycle:'h23'}).format(now);
 const visible=rows.filter(r=>!r.hidden&&!r.mergedInto);
 const records=new Map(visible.map(r=>[r.id,r]));
 const notices=[],candidates=[],upcoming=[];
 const events=buildEvents(visible).flatMap(e=>{
  const sessions=refs.concerts?.[e.recordIds[0]]?.sessions;
  if(!sessions?.length)return [e];
  return sessions.filter(s=>s.date>=e.date&&s.date<=e.endDate).map(s=>({...e,
   calendarId:e.id,id:s.id,date:s.date,endDate:s.date,time:s.date===e.date?e.time:'',
   endTime:s.date===e.date&&e.date===e.endDate?e.endTime:'',session:true}));
 });
 for(const e of events){
  const linked=e.recordIds.map(id=>records.get(id));
  if(!matches(artist,e.members)||e.endDate<yesterday||e.endDate<weekStart||e.date>weekEnd)continue;
  const completed=linked.every(r=>r.eventState==='completed');
  const todayEvent=e.date<=today&&e.endDate>=today;
  if(e.state==='cancelled'||linked.some(r=>['cancelled','postponed'].includes(r.eventState))){
   if(e.endDate>=today)notices.push({title:e.title,label:e.state==='cancelled'?'취소 안내':'일정 변경 안내',href:sourceFor(linked[0],'notice')||calendarUrl(e)});
   continue;
  }
  if(e.state==='tentative'&&!(e.endDate===yesterday&&linked.some(r=>sourceFor(r,'replay')))){
   if(e.date>=today)notices.push({title:e.title,label:'일정 확인 중',href:sourceFor(linked[0],'notice')||calendarUrl(e)});
   continue;
  }
  const ended=completed||(e.endDate===today&&e.endTime&&e.endTime<=clock);
  let rank;
  if(todayEvent)rank=0;
  else if(e.date===tomorrow&&!completed)rank=1;
  else if(e.endDate===yesterday&&(completed||linked.some(r=>sourceFor(r,'replay')))&&['performance','broadcast'].includes(e.type))rank=2;
  else if(e.date>tomorrow&&!completed)rank=3;
  else continue;
  // Among today's sessions prefer remaining timed starts, then active/past starts, then unknown times.
  let order=0;
  if(todayEvent)order=ended?3:!e.time?2:e.date===today&&e.time>=clock?0:1;
  const entry={event:e,row:linked[0],rank,order};
  candidates.push(entry);
  if(e.endDate>=today&&!completed)upcoming.push(entry);
 }
 const byStart=(a,b)=>a.event.date.localeCompare(b.event.date)||(a.event.time||'99:99').localeCompare(b.event.time||'99:99')||a.event.id.localeCompare(b.event.id);
 const compare=(a,b)=>a.rank-b.rank||a.order-b.order||byStart(a,b);
 const feature=candidates.sort(compare)[0];
 const other=upcoming.sort(compare).filter(x=>x!==feature).slice(0,4);
 let recent=null;
 if(!feature){
  for(const row of visible){
   if(!matches(artist,row.members)||row.date>today||['scheduled','cancelled','postponed'].includes(row.eventState))continue;
   const changed=Math.max(...[row.addedAt,row.updatedAt].map(v=>v?Date.parse(v.length===10?v+'T00:00:00+09:00':v)||0:0));
   if(changed>0&&changed<=now.getTime()&&(!recent||changed>recent.changed))recent={row,changed};
  }
 }
 return {artist,today,weekStart,weekEnd,feature,other,notices,recent,since:!!recent&&previousVisit>0&&recent.changed>previousVisit};
}
// An optional reviewed action references a URL already present on the public archive card.
function sourceFor(row,action){
 const url=row.homeActions?.[action]||(action==='replay'?reviewedRadio.get(row.id):'');
 if(!url||!/^https:\/\//i.test(url))return '';
 return [row.source,...(row.additionalSources||[])].some(s=>s?.url===url)?url:'';
}
const calendarUrl=e=>'/calendar/?month='+e.date.slice(0,7)+'&event='+encodeURIComponent(e.calendarId||e.id);
function activityActions(entry,refs){
 const {row,event:e,rank}=entry;
 const collection=refs.concerts[row.id];
 if(rank===2){
  const replay=sourceFor(row,'replay');
  const record={label:collection?collection.label+' 공연 기록':'방송 기록',href:collection?collection.href:'/archive/?record='+encodeURIComponent(row.id)};
  if(!collection&&e.type==='performance')record.label='공연 기록';
  if(e.type==='broadcast'&&replay)return [{label:'공식 다시보기',href:replay},record];
  const diary={label:'감상 남기기',href:'/diary/#new?event='+encodeURIComponent(e.id)+'&date='+e.endDate};
  return e.type==='performance'?[record,diary]:[record];
 }
 const info={label:({performance:row.type==='concert'?'공연 안내':'행사 안내',broadcast:'방송 안내',booking:'예매 안내',release:'발매 안내'})[e.type],href:sourceFor(row,'notice')||calendarUrl(e)};
 if(rank===0){
  const direction=refs.venues[row.venue];
  if(e.type==='performance'&&direction)return [{label:'공연장 길찾기',href:direction},info];
  const url=sourceFor(row,'listen')||sourceFor(row,'watch')||sourceFor(row,'booking')||sourceFor(row,'release');
  if(url)return [{label:({broadcast:row.type==='radio'?'공식 청취 페이지':'공식 시청 페이지',booking:'예매처 보기',release:'음원 듣기'})[e.type]||'공식 페이지',href:url},info];
 }
 return [info,{label:'일정 담기',save:e.id}];
}
module.exports={ARTISTS,matches,activityModel,activityActions,calendarUrl};
