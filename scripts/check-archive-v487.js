const assert=require('node:assert/strict');
const {mergeArchive}=require('../src/shared/archive-data');
const base=require('../data/archive.json'),extra=require('../data/archive-expanded-v487.json');
const rows=mergeArchive(base);
assert.equal(extra.records.length,39);
assert.equal(extra.records.filter(x=>x.id.startsWith('v487-2026-')).length,13);
assert.equal(new Set(rows.map(x=>x.id)).size,rows.length);
assert.deepEqual(mergeArchive(rows),rows,'Repeated client/build merging must not duplicate notes or sources');
for(const x of extra.records){
 assert(/^\d{4}-\d{2}-\d{2}$/.test(x.date));
 assert(x.source.url.startsWith('https://'));
 assert(x.members.length);
 if(x.dateBasis==='video-published')assert.equal(x.date,x.publishedDate);
 if(x.id.startsWith('v487-2026-'))assert(x.date>='2026-01-01'&&x.date<='2026-09-12');
}
for(const p of extra.patches)assert(rows.find(x=>x.id===p.id),'Patch target exists: '+p.id);
const picnic=rows.find(x=>x.id==='v475-sheet2-row74');
assert.equal(picnic.date,'2026-08-24');assert.equal(picnic.dateBasis,'recording');
assert(picnic.source.url.includes('55xQxdPzGrQ'));
assert.equal(rows.filter(x=>x.title.includes('THE FAN')&&x.title.includes('SEOUL')).length,1);
assert(rows.find(x=>x.id==='v487-history-019').note.includes('2006년'));
console.log('PASS: 39 additions, 16 patch targets, date provenance, idempotent merging and concert deduplication');
