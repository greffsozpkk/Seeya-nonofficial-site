const assert=require('node:assert/strict');
const base=require('../data/archive.json');
const old=require('../data/archive-stage-v474.json');
const extra=require('../data/archive-schedule-v475.json');
const {mergeArchive}=require('../src/shared/archive-data');
const {getFilteredArchive,archiveView,archiveDateLabel}=require('../src/shared/views');
const before=JSON.stringify(base),rows=mergeArchive(base);
assert.equal(JSON.stringify(base),before,'Merge must not mutate base records');
assert.deepEqual(mergeArchive(rows),rows,'Repeated merge must not duplicate notes or sources');
assert.equal(extra.records.length,47);
const ids=new Set(rows.map(x=>x.id));assert.equal(ids.size,rows.length);
for(const p of [...old.patches,...extra.patches])assert(ids.has(p.id),'Missing patch target '+p.id);
for(const r of rows){assert(/^\d{4}-\d{2}-\d{2}$/.test(r.date),r.id+' date missing');for(const s of [r.source,...(r.additionalSources||[])])assert(['http:','https:'].includes(new URL(s.url).protocol));}
for(let n=31;n<=46;n++)assert.equal(rows.find(x=>x.id===`v474-stage-research-${String(n).padStart(3,'0')}`).dateStatus,'confirmed');
assert.equal(rows.find(x=>x.id==='v474-stage-research-031').date,'2026-05-28');
assert.equal(rows.find(x=>x.id==='v474-stage-research-032').date,'2026-08-26');
assert.equal(rows.find(x=>x.id==='v474-stage-research-033').date,'2026-06-12');
assert.equal(rows.filter(x=>x.source?.url.includes('7AnevPm_sho')).length,1);
assert(!rows.some(x=>x.date==='2026-06-13'&&x.program.includes('불후')));
assert.equal(rows.find(x=>x.id==='20260605-seeya-powerfm-environment').recordedDate,'2026-06-02');
assert.equal(rows.find(x=>x.id==='20260829-the-fan-seoul').endDate,'2026-08-30');
assert(old.records.filter(x=>['v474-stage-research-034','v474-stage-research-035'].includes(x.id)).every(x=>!x.members.includes('남규리')));
const state={query:'',year:'all',member:'all',type:'all',sort:'newest',page:1};
for(const sort of ['newest','oldest','added'])for(let page=1;page<=Math.ceil(rows.length/9);page++){const html=archiveView(rows,{...state,sort,page}).grid;assert(!html.includes('undefined'));assert(!html.includes('>null<'));}
const fallback={id:'fallback',publishedDate:'2026-07-01',title:'게시일',type:'music-show',members:[],songs:[]};
assert(archiveDateLabel(fallback).includes('영상 게시일'));
assert.equal(getFilteredArchive([fallback],{...state,year:'2026'}).length,1);
console.log(`PASS: ${rows.length} records; 47 additions; 16 dates resolved; source merge, year filters, all pages and sorts.`);
