const assert=require('node:assert/strict');
const rows=require('../data/archive.json');
const {mergeArchive}=require('../src/shared/archive-data');
const {getFilteredArchive,archiveView,archiveDateLabel}=require('../src/shared/views');
assert(Array.isArray(rows));
assert.equal(new Set(rows.map(x=>x.id)).size,rows.length,'Duplicate record IDs');
assert.deepEqual(mergeArchive(rows),rows,'Loading must not alter canonical records');
for(const x of rows){
 assert(x.id&&x.title&&Array.isArray(x.members));
 assert(/^\d{4}-\d{2}-\d{2}$/.test(x.date),x.id+' missing date');
 assert.equal(new Date(x.date).toISOString().slice(0,10),x.date,x.id+' invalid date');
 for(const s of [x.source,...(x.additionalSources||[])])assert(['https:','http:'].includes(new URL(s.url).protocol),x.id+' source');
 if(x.dateBasis==='video-published'&&x.publishedDate)assert.equal(x.date,x.publishedDate,x.id+' publication date');
}
const state={query:'',year:'all',member:'all',type:'all',sort:'newest',page:1};
const sbs12=rows.filter(r=>r.id==='20260917-gyuri-yeonji-sbs12n');assert.equal(sbs12.length,1);assert.equal(sbs12[0].eventState,'completed');assert(!sbs12[0].title.includes('예정'));assert.equal(sbs12[0].songs.length,3);
assert.equal(rows.find(r=>r.id==='20260929-gyuri-ena-kpopup-24').eventState,'scheduled','Recording is not a completed broadcast');
assert.equal(rows.find(r=>r.id==='20260920-gyuri-gwangju-charity').dateStatus,'tentative');
assert(archiveDateLabel({date:'2021-02-22',dateBasis:'post-published'}).includes('게시글 작성일'));
for(const sort of ['newest','oldest','added'])for(let page=1;page<=Math.ceil(rows.length/9);page++){
 const html=archiveView(rows,{...state,sort,page}).grid;
 assert(!html.includes('undefined'));assert(!html.includes('>null<'));
 assert.equal((html.match(/<article class="archive-card"/g)||[]).length,Math.min(9,rows.length-(page-1)*9),'Keep nine records per page');
}
// Every source must remain reachable after collapsing the long card body.
for(const record of rows){
 const html=archiveView(rows,{...state,record:record.id}).grid;
 assert(html.includes('<details class="archive-details">'),'Native disclosure must work without JavaScript');
 for(const source of [record.source,...(record.additionalSources||[])]){
  const url=new URL(source.url);
  if(url.hostname==='docs.google.com'&&url.pathname.startsWith('/spreadsheets/'))continue;
  const escaped=source.url.replace(/&/g,'&amp;').replace(/"/g,'&quot;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
  assert(html.includes(`href="${escaped}"`),record.id+' missing source after compact layout');
 }
}
const cultwo=rows.filter(x=>x.date==='2026-04-02'&&x.type==='radio'&&x.program.includes('컬투쇼'));
assert.equal(cultwo.length,1);assert.equal(cultwo[0].members.length,3);assert(cultwo[0].source.url.includes('ghw-gqpjAD8'));
assert.equal(rows.find(x=>x.id==='20260525-gyuri-namgyeoseo').members.length,3);
const btn=rows.filter(x=>x.date>='2026-01-01'&&x.date<='2026-09-12'&&x.title.includes('한밤의 꿈'));
assert.deepEqual(btn.map(x=>x.episode).sort((a,b)=>a-b),Array.from({length:20},(_,i)=>i+1));
assert(archiveDateLabel(btn.find(x=>x.episode===18)).includes('영상 게시일'));
const articles=rows.filter(x=>x.id.startsWith('v485-'));
assert(articles.length>=154,'Consolidated historic press records are missing');
for(const x of articles)assert(archiveDateLabel(x).includes('기사 게시일'));
const seen=new Set();
const press=getFilteredArchive(rows,{...state,type:'news'});
for(let page=1;page<=Math.ceil(press.length/9);page++){
 for(const m of archiveView(rows,{...state,type:'news',page}).grid.matchAll(/class="archive-source" href="([^"]+)"/g))seen.add(m[1].replace(/&amp;/g,'&'));
}
for(const x of articles)assert(seen.has(x.source.url),x.id+' unreachable through pagination');
assert.equal(rows.find(x=>x.id==='20260605-seeya-powerfm-environment').recordedDate,'2026-06-02');
assert.equal(rows.find(x=>x.id==='v487-2026-011').recordedDate,'2026-05-23');
console.log(`PASS: ${rows.length} canonical records; dates, sources, filters, pagination and preserved key appearances`);
