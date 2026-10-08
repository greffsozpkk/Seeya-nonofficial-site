'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs');
const {placeIdsForRecord,recordsByPlace,coverage}=require('../src/shared/map-archive');
const {resolvePlaces,detail}=require('../src/shared/seeya-map');
const config=require('../src/data/map-places.json'),registry=require('../src/data/map-archive-links.json'),pending=require('../src/data/map-archive-pending.json'),archive=require('../data/archive.json');
const ids=new Set(config.places.map(p=>p.id));
for(const id of [...Object.values(registry.venues),...Object.values(registry.records).flat()])assert(ids.has(id),'Unknown linked place '+id);
for(const name of Object.keys(pending))assert(!registry.venues[name],'Venue cannot be pending and linked');
const report=coverage(archive,config.places,pending);
assert.deepEqual(JSON.parse(fs.readFileSync(require('node:path').join(__dirname,'../map/coverage.json'),'utf8')),report);
assert.equal(report.summary.records,report.summary.linked+report.summary.pending+report.summary.unreviewed);
// Existing aliases link future records, while unverified similar branches never merge by fuzzy name.
const fixture={id:'future-fixture',venue:'  경희대학교   평화의전당  ',title:'새 공연',date:'2027-01-01',members:['남규리'],source:{url:'https://example.com/a'}};
assert.deepEqual(placeIdsForRecord(fixture),['khu-grand-peace-palace']);
assert.deepEqual(placeIdsForRecord({...fixture,hidden:true}),[]);
assert.deepEqual(placeIdsForRecord({...fixture,mergedInto:'parent'}),[]);
assert.deepEqual(placeIdsForRecord({...fixture,venue:'경희대학교 평화의전당 인근 식당'}),[]);
assert.equal(coverage([{...fixture,venue:'새로 생긴 공연장'}],config.places,pending).summary.unreviewed,1);
const rows=resolvePlaces(config,[...archive,fixture]);
assert(rows.find(p=>p.id==='khu-grand-peace-palace').records.some(r=>r.id===fixture.id));
assert(detail(rows.find(p=>p.id==='khu-grand-peace-palace')).includes('/archive/?record=future-fixture'));
const hongik=rows.find(p=>p.id==='hongik-daehakro');assert(hongik.records.length>1);
assert.equal(new Set(hongik.records.map(r=>r.id)).size,hongik.records.length);
assert(!resolvePlaces(config,archive.filter(r=>!hongik.records.some(x=>x.id===r.id))).some(p=>p.id==='hongik-daehakro'));
for(const id of ['dakdonggari-suseong','woosuk-jeonju','dst-campus','jecheon-hanbang-expo','hongik-daehakro','olympic-main-stadium'])assert(rows.some(p=>p.id===id&&p.records.length));
for(const p of rows.filter(p=>p.archiveOnly)){assert(p.source.url);assert(p.records.length);assert(p.addressSource&&p.coordinateSource);}
assert.equal(recordsByPlace([fixture,{...fixture,id:'hidden',hidden:true}]).get('khu-grand-peace-palace').length,1);
if(report.summary.unreviewed)console.warn('Map venues await review: '+report.summary.unreviewed);
console.log('PASS: archive/map joins, future aliases, hidden records, venue grouping, missing-location report and six omitted venues.');
// Admin coverage is a read-only same-origin report; no private access key is sent.
const vm=require('node:vm'),admin=fs.readFileSync(require('node:path').join(__dirname,'../src/admin/admin.js'),'utf8');
const elements=new Map(),get=id=>{if(!elements.has(id))elements.set(id,{});return elements.get(id);};
let failed=false;
const context={$:get,Map,encodeURIComponent,Error,esc:s=>String(s??'').replace(/[<>&"]/g,c=>({'<':'&lt;','>':'&gt;','&':'&amp;','"':'&quot;'}[c])),fetch:async(url,options)=>{assert.equal(url,'/map/coverage.json');assert.equal(options.credentials,'omit');assert(!options.headers);return {ok:!failed,json:async()=>({...report,rows:[{venue:'<img src=x>',status:'unreviewed',title:'<script>',recordId:'a&b',reason:'<reason>'}]})};}};
vm.runInNewContext(admin.slice(admin.indexOf("$('map-coverage-refresh').onclick=")),context);
(async()=>{await get('map-coverage-refresh').onclick();assert(get('map-coverage-result').innerHTML.includes('&lt;img'));assert(!get('map-coverage-result').innerHTML.includes('<script>'));assert.equal(get('map-coverage-refresh').disabled,false);failed=true;await get('map-coverage-refresh').onclick();assert(get('map-coverage-result').textContent.includes('불러오지 못했어요'));console.log('PASS: admin map coverage, escaping, read-only request and fetch failure recovery.');})().catch(e=>{console.error(e);process.exitCode=1;});
