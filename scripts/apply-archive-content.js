'use strict';
const batches=require('../src/data/archive-content-updates.json');
// One-time content imports preserve later edits/deletions made in the web manager.
function sourceKey(value){
 try{
  const u=new URL(value),host=u.hostname.replace(/^www\./,'');
  if(host==='youtu.be')return 'youtube:'+u.pathname.slice(1);
  if(host==='youtube.com'||host==='m.youtube.com'){
   const id=u.searchParams.get('v')||u.pathname.match(/^\/(?:shorts|live|embed|v)\/([^/]+)/)?.[1];
   if(id)return 'youtube:'+id;
  }
  if(host==='instagram.com'){
   const id=u.pathname.match(/\/(?:p|reel)\/([^/]+)/)?.[1];
   if(id)return 'instagram:'+id;
  }
  u.hash='';for(const key of [...u.searchParams.keys()])if(key.startsWith('utm_')||['si','feature'].includes(key))u.searchParams.delete(key);
  return u.href.replace(/\/$/,'');
 }catch{return value;}
}
const sources=row=>[row.source,...(row.additionalSources||[])].filter(Boolean);
function extend(row,links,note,checkedAt){
 if(row.hidden||row.status==='hidden')return row;
 const keys=new Set(sources(row).map(s=>sourceKey(s.url)));
 const additional=[...(row.additionalSources||[])];
 for(const s of links||[])if(!keys.has(sourceKey(s.url))){additional.push(s);keys.add(sourceKey(s.url));}
 const nextNote=note&&!String(row.note||'').includes(note)?[row.note,note].filter(Boolean).join('\n'):row.note;
 if(additional.length===(row.additionalSources||[]).length&&nextNote===row.note)return row;
 return {...row,additionalSources:additional,...(nextNote!==undefined?{note:nextNote}:{}),updatedAt:[row.updatedAt||row.addedAt||checkedAt,checkedAt].sort().at(-1)};
}
function applyContent(rows,applied=[]){
 let result=rows.slice();const completed=new Set(applied);
 for(const batch of batches){
  if(completed.has(batch.id))continue;
  for(const record of batch.additions){
   const keySet=new Set(sources(record).map(s=>sourceKey(s.url)));
   let matches=result.filter(r=>r.id===record.id);
   if(!matches.length)matches=result.filter(r=>sources(r).some(s=>keySet.has(sourceKey(s.url))));
   if(matches.length>1)throw new Error('Ambiguous archive import: '+record.id);
   if(matches.length){const found=matches[0];result=result.map(r=>r===found?extend(r,sources(record),null,batch.checkedAt):r);}
   else result.push(JSON.parse(JSON.stringify(record)));
  }
  for(const patch of batch.updates){
   const found=result.find(r=>r.id===patch.id);
   if(!found)continue; // A manager may have intentionally removed this record.
   result=result.map(r=>r===found?extend(r,patch.sources,patch.noteAppend,batch.checkedAt):r);
  }
  completed.add(batch.id);
 }
 return {rows:result,applied:[...completed]};
}
module.exports={applyContent,sourceKey};
