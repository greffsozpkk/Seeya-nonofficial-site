const assert=require('node:assert/strict');
const {mergeArchive}=require('../src/shared/archive-data');
const base=require('../data/archive.json'),extra=require('../data/archive-audit-v488.json');
const rows=mergeArchive(base);
assert.equal(extra.records.length,48);
assert.equal(extra.patches.length,23);
assert.equal(new Set(rows.map(x=>x.id)).size,rows.length);
assert.deepEqual(mergeArchive(rows),rows,'Client refresh must preserve records, notes and source order');
for(const x of extra.records){
 assert(x.date>='2026-01-01'&&x.date<='2026-09-12');
 assert(x.members.length&&x.source.url.startsWith('https://'));
 assert(!base.some(b=>b.id===x.id));
 if(x.dateBasis==='video-published')assert.equal(x.date,x.publishedDate);
}
for(const p of extra.patches)assert(rows.find(x=>x.id===p.id));
const btn=rows.filter(x=>x.date.startsWith('2026')&&x.title.includes('한밤의 꿈'));
assert.equal(btn.length,20);
assert.deepEqual(btn.map(x=>x.episode).sort((a,b)=>a-b),Array.from({length:20},(_,i)=>i+1));
assert.equal(btn.find(x=>x.episode===18).dateBasis,'video-published');
assert.equal(btn.find(x=>x.episode===18).date,'2026-08-26');
const cultwo=rows.filter(x=>x.date==='2026-04-02'&&x.type==='radio'&&x.program.includes('컬투쇼'));
assert.equal(cultwo.length,1);assert(cultwo[0].title.includes('컬투쇼'));assert.equal(cultwo[0].members.length,3);
assert(cultwo[0].source.url.includes('ghw-gqpjAD8'));
assert.equal(rows.find(x=>x.id==='20260525-gyuri-namgyeoseo').members.length,3);
const festival=rows.filter(x=>x.title.includes('빨간맛'));assert.equal(festival.length,1);
assert.equal(festival[0].date,'2026-06-05');assert.equal(festival[0].recordedDate,'2026-05-23');
assert(rows.find(x=>x.id==='v475-sheet2-row63').source.label.includes('SBS'));
console.log('PASS: 48 additions, 23 patches, all 20 BTN episodes, group appearances, provenance and idempotency');
