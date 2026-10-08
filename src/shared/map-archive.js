'use strict';
const registry=require('../data/map-archive-links.json');
const normalizeVenue=value=>String(value||'').normalize('NFKC').replace(/\s+/g,' ').trim();
const venues=new Map(Object.entries(registry.venues).map(([name,id])=>[normalizeVenue(name),id]));
function placeIdsForRecord(row){
 if(!row||row.hidden||row.mergedInto)return [];
 return [...new Set([...(registry.records[row.id]||[]),venues.get(normalizeVenue(row.venue))].filter(Boolean))];
}
const dateLabel=row=>({'event':'활동일','broadcast':'방송일','season':'공연 시작일','recording':'촬영일','schedule':'예정일','post-published':'게시일','video-published':'영상 게시일','article-published':'기사 게시일','published':'게시일'}[row.dateBasis]||'기록일');
function recordsByPlace(archive){
 const result=new Map();
 for(const row of archive){for(const id of placeIdsForRecord(row)){
  if(!result.has(id))result.set(id,[]);
  result.get(id).push({id:row.id,title:row.title,date:row.date,dateBasis:dateLabel(row),members:row.members||[],eventState:row.eventState||'',venue:row.venue||'',source:row.source});
 }}
 for(const rows of result.values())rows.sort((a,b)=>b.date.localeCompare(a.date)||a.id.localeCompare(b.id));
 return result;
}
function coverage(archive,places,pending){
 const ids=new Set(places.map(p=>p.id)),rows=[];
 for(const record of archive){
  if(record.hidden||record.mergedInto||!record.venue)continue;
  const linked=placeIdsForRecord(record).filter(id=>ids.has(id)),reason=pending[normalizeVenue(record.venue)];
  rows.push({recordId:record.id,title:record.title,venue:record.venue,placeIds:linked,status:linked.length?'linked':reason?'pending':'unreviewed',...(!linked.length?{reason:reason||'새 장소의 위치와 연결을 확인해 주세요.'}:{})});
 }
 return {summary:{records:rows.length,venues:new Set(rows.map(r=>normalizeVenue(r.venue))).size,linked:rows.filter(r=>r.status==='linked').length,pending:rows.filter(r=>r.status==='pending').length,unreviewed:rows.filter(r=>r.status==='unreviewed').length},rows};
}
module.exports={normalizeVenue,placeIdsForRecord,recordsByPlace,coverage};
