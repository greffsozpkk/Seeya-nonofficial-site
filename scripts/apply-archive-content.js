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
// Apply researched corrections only while the reviewed fields and source still match.
// Later edits in the web manager must win over a cumulative update package.
function correctRecord(row,correction,checkedAt){
 if(!correction||row.hidden||row.status==='hidden')return row;
 const allowed=new Set(['date','dateBasis','dateStatus','publishedDate','program','members','note','title','eventState','status','songs','tags','calendar','venue']);
 if(!correction.sourceUrl||!sources(row).some(s=>sourceKey(s.url)===sourceKey(correction.sourceUrl)))return row;
 if(!Object.entries(correction.expected||{}).every(([key,value])=>JSON.stringify(row[key])===JSON.stringify(value)))return row;
 if(Object.keys(correction.values||{}).some(key=>!allowed.has(key)))throw new Error('Unsupported archive correction field');
 if(Object.entries(correction.values||{}).every(([key,value])=>JSON.stringify(row[key])===JSON.stringify(value)))return row;
 return {...row,...correction.values,updatedAt:[row.updatedAt||row.addedAt||checkedAt,checkedAt].sort().at(-1)};
}
function applyContent(rows,applied=[]){
 let result=rows.slice();const completed=new Set(applied);
 for(const batch of batches){
  if(completed.has(batch.id))continue;
  for(const record of batch.additions){
   const keySet=new Set(sources(record).map(s=>sourceKey(s.url)));
   let matches=result.filter(r=>r.id===record.id);
   if(!matches.length&&!batch.separateOccurrences?.includes(record.id))matches=result.filter(r=>sources(r).some(s=>keySet.has(sourceKey(s.url))));
   if(matches.length>1)throw new Error('Ambiguous archive import: '+record.id);
   if(matches.length){const found=matches[0];result=result.map(r=>r===found?extend(r,sources(record),null,batch.checkedAt):r);}
   else result.push(JSON.parse(JSON.stringify(record)));
  }
  for(const patch of batch.updates){
   const found=result.find(r=>r.id===patch.id);
   if(!found)continue; // A manager may have intentionally removed this record.
   result=result.map(r=>r===found?extend(correctRecord(r,patch.correction,batch.checkedAt),patch.sources,patch.noteAppend,batch.checkedAt):r);
  }
  for(const merge of batch.merges||[]){
   const child=result.find(r=>r.id===merge.id),parent=result.find(r=>r.id===merge.targetId);
   if(!child||!parent||child.hidden||parent.hidden||child.autoDiscovery!==true)continue;
   if(!Object.entries(merge.expected).every(([k,v])=>JSON.stringify(child[k])===JSON.stringify(v)))continue;
   if(!sources(parent).some(s=>sourceKey(s.url)===sourceKey(merge.parentSource)))continue;
   const combined=extend(parent,sources(child),null,batch.checkedAt);
   result=result.map(r=>r===parent?combined:r===child?{...child,hidden:true,mergedInto:parent.id,updatedAt:batch.checkedAt}:r);
  }
  completed.add(batch.id);
 }
 return {rows:result,applied:[...completed]};
}
module.exports={applyContent,sourceKey,correctRecord};
