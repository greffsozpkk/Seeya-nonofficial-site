const catalog=require('../data/concerts.json');
const {videoId}=require('./stage-data');
const categoryLabels={seeya:'씨야 공연',member:'멤버 공연',fanmeeting:'팬미팅'};
const concertPath=c=>'/archive/concerts/'+c.id+'/';
function concertForRecord(id){return catalog.find(c=>c.events.some(e=>e.id===id));}
function sources(row){return [row.source,...(row.additionalSources||[])].filter((s,i,all)=>{if(!s?.url||all.findIndex(x=>x?.url===s.url)!==i)return false;try{const u=new URL(s.url);return ['http:','https:'].includes(u.protocol)&&!(u.hostname==='docs.google.com'&&u.pathname.startsWith('/spreadsheets/'));}catch(_){return false;}});}
function stateOf(row,cutoff){if(row.eventState==='cancelled')return 'cancelled';if(row.date>cutoff)return 'upcoming';if(row.date<=cutoff&&(row.endDate||row.date)>=cutoff)return 'current';if(row.eventState==='scheduled')return 'pending';return 'past';}
const stateLabels={upcoming:'예정 일정',current:'오늘 포함 일정',past:'지난 공연 기록',pending:'진행 여부 확인 중',cancelled:'취소된 일정'};
function concerts(archive,cutoff){const byId=new Map(archive.map(r=>[r.id,r]));return catalog.map(c=>{
 const events=c.events.map(ref=>{const row=byId.get(ref.id);if(!row||row.hidden===true)return null;const links=sources(row);return {...row,label:ref.label,state:stateOf(row,cutoff),videos:links.filter(s=>videoId(s.url)),references:links.filter(s=>!videoId(s.url))};}).filter(Boolean).sort((a,b)=>a.date.localeCompare(b.date));
 return {...c,events,members:[...new Set(events.flatMap(e=>e.members||[]))],years:[...new Set(events.map(e=>e.date.slice(0,4)))],first:events[0]?.date||'',last:events.at(-1)?.date||'',sourceCount:new Set(events.flatMap(e=>sources(e).map(s=>s.url))).size};
 }).filter(c=>c.events.length);}
module.exports={catalog,categoryLabels,concertPath,concertForRecord,sources,stateOf,stateLabels,concerts};
