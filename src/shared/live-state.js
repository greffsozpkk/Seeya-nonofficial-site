'use strict';
function cell(data,songId,sessionId){
 const entries=data.evidence.filter(e=>e.songId===songId&&e.sessionId===sessionId),sources=[...new Map(entries.flatMap(e=>e.sources).map(s=>[s.url,s])).values()];
 const yes=entries.some(e=>e.status==='confirmed'),no=entries.some(e=>e.status==='not-performed');
 return {status:yes&&!no?'confirmed':no&&!yes?'not-performed':'unknown',sources,excerpt:yes&&sources.every(s=>s.scope==='excerpt')};
}
function summary(data,songId,sessionIds=data.sessions.map(s=>s.id)){
 const cells=[...new Set(sessionIds)].map(id=>cell(data,songId,id));return {confirmed:cells.filter(c=>c.status==='confirmed').length,excerpt:cells.filter(c=>c.status==='confirmed'&&c.excerpt).length};
}
module.exports={cell,summary};
