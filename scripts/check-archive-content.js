'use strict';
const assert=require('node:assert/strict');
const {applyContent,sourceKey,correctRecord}=require('./apply-archive-content');
const batches=require('../src/data/archive-content-updates.json');
const batch=batches[0],first=batch.additions[0];
const fixture=batch.updates.map(p=>({id:p.id,date:'2006-01-01',note:'운영자가 작성한 설명',source:{url:'https://example.org/'+p.id},custom:'preserve'}));
fixture.push({id:'user-record',date:'2026-10-01',note:'keep'});
const before=JSON.stringify(fixture),result=applyContent(fixture);
assert.equal(JSON.stringify(fixture),before,'Must not mutate input');
assert.equal(result.rows.length,fixture.length+batch.additions.length);
assert.deepEqual(applyContent(result.rows,result.applied),result,'Ledger makes import idempotent');
assert.deepEqual(applyContent(result.rows).rows,result.rows,'Sources and notes must not duplicate');
for(const patch of batch.updates){const row=result.rows.find(r=>r.id===patch.id);assert.equal(row.date,'2006-01-01');assert.equal(row.custom,'preserve');assert(row.note.startsWith('운영자가 작성한 설명'));}
const deleted=result.rows.filter(r=>r.id!==first.id);
assert.deepEqual(applyContent(deleted,result.applied).rows,deleted,'Later manager deletions must persist');
const auto={...first,id:'auto-import',title:'관리자 제목',source:{...first.source,url:first.source.url.replace('www.youtube.com/watch?v=','youtu.be/')}};
const merged=applyContent([...fixture,auto]);
assert.equal(merged.rows.length,result.rows.length);assert(!merged.rows.some(r=>r.id===first.id));assert.equal(merged.rows.find(r=>r.id==='auto-import').title,'관리자 제목');
const hidden={...auto,hidden:true};assert.deepEqual(applyContent([...fixture,hidden]).rows.find(r=>r.id===hidden.id),hidden);
assert.equal(sourceKey('https://www.instagram.com/name/reel/ABC/?utm_source=test'),sourceKey('https://instagram.com/p/ABC/'));
assert.equal(sourceKey('https://youtube.com/shorts/ABC?si=x'),sourceKey('https://youtu.be/ABC'));
assert(!applyContent([]).rows.some(r=>r.id===batch.updates[0].id),'Do not recreate deleted supplement targets');
console.log('PASS: archive content import, URL deduplication, preserved edits/deletions, one-time ledger.');
const original={id:'date-review',date:'2020-02-29',dateBasis:'video-published',publishedDate:'2020-02-29',note:'keep',source:{url:'https://youtu.be/-sBEvFr5Rs0'}};
const correction={sourceUrl:'https://www.youtube.com/watch?v=-sBEvFr5Rs0',expected:{date:'2020-02-29',dateBasis:'video-published'},values:{date:'2008-12-19',dateBasis:'broadcast',dateStatus:'tentative'}};
const fixed=correctRecord(original,correction,'2026-10-03');
assert.equal(fixed.date,'2008-12-19');assert.equal(fixed.publishedDate,'2020-02-29');assert.equal(fixed.note,'keep');assert.equal(original.date,'2020-02-29');
assert.deepEqual(correctRecord(fixed,correction,'2026-10-03'),fixed);
for(const changes of [{date:'2008-12-20'},{dateBasis:'broadcast'},{hidden:true},{source:{url:'https://example.com/changed'}}]){
 const edited={...original,...changes};assert.deepEqual(correctRecord(edited,correction,'2026-10-03'),edited,'Preserve manager changes and unrelated sources');
}
assert.throws(()=>correctRecord(original,{...correction,values:{id:'changed'}},'2026-10-03'),/Unsupported/);
console.log('PASS: guarded broadcast-date correction, publication date preservation and repeat application.');
