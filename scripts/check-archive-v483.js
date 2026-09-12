const assert=require('node:assert/strict');
const {mergeArchive}=require('../src/shared/archive-data');
const {archiveDateLabel}=require('../src/shared/views');
const extra=require('../data/archive-radio-interviews-v483.json');
const all=mergeArchive(require('../data/archive.json'));
assert.equal(extra.records.length,14);
assert.equal(extra.records.filter(x=>x.type==='radio').length,6);
assert.equal(new Set(all.map(x=>x.id)).size,all.length);
assert.deepEqual(mergeArchive(all),all);
for(const x of extra.records){
 assert.equal(all.filter(y=>y.source?.url===x.source.url).length,1);
 assert.match(x.date,/^\d{4}-\d{2}-\d{2}$/);
 assert.equal(new URL(x.source.url).protocol,'https:');
 if(x.dateStatus==='tentative')assert.match(archiveDateLabel(x),/잠정/);
 if(x.dateBasis==='article-published')assert.match(archiveDateLabel(x),/기사 게시일/);
 if(x.dateBasis==='video-published')assert.match(archiveDateLabel(x),/영상 게시일/);
}
assert.deepEqual(extra.records.at(-1).members,['김연지','이보람']);
console.log('PASS: 14 records, distinct sources, idempotent merge, date provenance and participants');
