const assert=require('node:assert/strict');
const {mergeArchive}=require('../src/shared/archive-data');
const {archiveDateLabel}=require('../src/shared/views');
const extra=require('../data/archive-press-v484.json');
const all=mergeArchive(require('../data/archive.json'));
assert.equal(extra.records.length,14);
assert.equal(extra.patches.length,5);
assert(all.length>=312);
assert.deepEqual(mergeArchive(all),all);
for(const x of extra.records){
 assert.equal(x.type,'news');assert.match(archiveDateLabel(x),/기사 게시일/);
 assert.equal(all.filter(y=>y.source?.url===x.source.url).length,1);
 for(const s of [x.source,...x.additionalSources])assert.equal(new URL(s.url).protocol,'https:');
}
for(const p of extra.patches){const x=all.find(x=>x.id===p.id);assert(x);for(const s of p.additionalSources)assert(x.additionalSources.some(a=>a.url===s.url));}
console.log('PASS: v4.84 article cards and source patches preserved, dates and idempotent merge');
