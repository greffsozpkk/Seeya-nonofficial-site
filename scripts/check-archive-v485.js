const assert=require('node:assert/strict');
const {mergeArchive}=require('../src/shared/archive-data');
const {archiveDateLabel,getFilteredArchive,archiveView}=require('../src/shared/views');
const extra=require('../data/archive-press-v485.json').records;
const all=mergeArchive(require('../data/archive.json'));
assert.equal(extra.length,154);
assert.equal(new Set(all.map(x=>x.id)).size,all.length);
assert.deepEqual(mergeArchive(all),all,'Repeat merges must not duplicate articles');
const years={2006:30,2007:43,2008:21,2009:23,2010:13,2011:24};
for(const [year,count] of Object.entries(years))assert.equal(extra.filter(x=>x.date.startsWith(year)).length,count);
for(const x of extra){
 assert.equal(x.type,'news');assert.equal(new Date(x.date).toISOString().slice(0,10),x.date);
 assert.match(archiveDateLabel(x),/기사 게시일/);
 assert.equal(all.filter(y=>y.source?.url===x.source.url).length,1);
 assert.equal(new URL(x.source.url).protocol,'https:');assert(x.note&&x.program&&x.members.length);
 assert(!x.thumbnail,'Press images must remain at their original source');
}
const byUrl=fragment=>extra.find(x=>x.source.url.includes(fragment));
assert.equal(byUrl('20070816n15532').date,'2007-08-17');
assert.equal(byUrl('bnt200911010014').date,'2009-11-03');
assert.equal(byUrl('NISX20110718').date,'2011-07-19');
assert.equal(byUrl('4962111').date,'2011-07-26');
const state={query:'',year:'all',member:'all',type:'news',sort:'oldest',page:1};
const articles=getFilteredArchive(all,state);assert(articles.length>=168);
const seen=new Set();for(let page=1;page<=Math.ceil(articles.length/9);page++){
 const view=archiveView(all,{...state,page});assert.match(view.count,new RegExp('총 '+articles.length));
 for(const m of view.grid.matchAll(/class="archive-source" href="([^"]+)"/g))seen.add(m[1].replace(/&amp;/g,'&'));
}
for(const x of extra)assert(seen.has(x.source.url),'Article must be reachable through pagination: '+x.title);
console.log('PASS: 154 articles, publication dates, unique sources, idempotent merge, full article pagination.');
