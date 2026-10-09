'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const P=require('../src/shared/passport'),root=path.resolve(__dirname,'..'),read=p=>fs.readFileSync(path.join(root,p),'utf8');
const sample={entryId:'test-12345678',kind:'concert',status:'done',title:'<img src=x onerror=alert(1)>',date:'2006',time:'',members:['seeya'],note:'<script>test</script>',snapshot:{place:'기억의 공연장'},createdAt:'2026-10-09T00:00:00Z',updatedAt:'2026-10-09T00:00:00Z'};
for(const d of ['','2006','2006-03','2008-02-29'])assert.equal(P.entry({...sample,date:d}).date,d);
for(const d of ['2026-02-29','2026-04-31','2026-00','2026-13','x','2026-1-01'])assert.throws(()=>P.entry({...sample,date:d}));
assert.equal(P.entry(sample).datePrecision,'year');assert.equal(P.entry({...sample,date:''}).datePrecision,'none');
assert.equal(P.summary([sample,{...sample,entryId:'test-22222222',date:'2099-01-01'},{...sample,entryId:'test-33333333',status:'planned'}],'2026-10-09').concert,1);
assert(!P.esc(sample.note).includes('<script>'));
assert.throws(()=>P.entry({...sample,date:'2099-01-01'}),/미래 날짜/);
assert.throws(()=>P.profile(null),/신분 카드/);
assert.throws(()=>P.profile({since:'2099'}),/입덕일/);
for(const since of ['2005','2006-02','2006-03-11'])assert.throws(()=>P.profile({since}),/데뷔일/);
for(const since of ['2006','2006-03','2006-03-12'])assert.equal(P.profile({since}).since,since);
for(const [day,status] of [['2026-10-09','done'],['2026-10-10','planned'],['2026-10-11','planned'],['2025','done'],['2026','planned']])assert.equal(P.defaultStatus(day,'2026-10-10'),status);
let legacy=JSON.stringify({...P.empty(),profile:{since:'2005'},entries:[sample]});
const legacyStore=P.storage({getItem:()=>legacy,setItem:(k,v)=>legacy=v});
assert.equal(legacyStore.get().entries.length,1);assert.throws(()=>legacyStore.save(legacyStore.get()),/데뷔일/);
legacyStore.save({...legacyStore.get(),profile:{since:'2006-03-12'}});assert.equal(legacyStore.get().entries.length,1);
const seoulEntry={...sample,date:'2026-08-30',archiveId:'20260829-the-fan-seoul',eventId:'old-event'};
assert(P.duplicate(seoulEntry,{...seoulEntry,eventId:'new-session'}));
assert(!P.duplicate(seoulEntry,{...seoulEntry,date:'2026-08-29'}));
const current=P.validate({...P.empty(),entries:[sample]}),incoming=P.validate({...P.empty(),entries:[{...sample,title:'changed'},{...sample,entryId:'test-98765432',date:'2006-03'}]});
assert.deepEqual(P.review(current,incoming),{added:1,conflicts:1,suspected:0});
const merged=P.merge(current,incoming);assert.equal(merged.entries[0].title,sample.title);assert.equal(P.merge(merged,incoming).entries.length,2);assert.equal(P.merge(current,incoming,true).entries[0].title,'changed');
assert.throws(()=>P.validate({...incoming,schemaVersion:2}));assert.throws(()=>P.validate({...current,entries:[sample,sample]}));assert.throws(()=>P.validate({...current,entries:[{...sample,members:['evil']}]}));
assert(P.duplicate(sample,{...sample,entryId:'another-id'}));assert(!P.duplicate(sample,{...sample,time:'18:00'}));
let data=null,fail=false;const adapter={getItem:()=>data,setItem:(k,v)=>{if(fail)throw Object.assign(Error('full'),{name:'QuotaExceededError'});data=v;}};
const store=P.storage(adapter);store.save(current);const saved=data;fail=true;assert.throws(()=>store.save(incoming));assert.equal(data,saved);assert.deepEqual(store.get(),current);fail=false;data='changed in another tab';assert.throws(()=>store.save(incoming),/다른 창/);assert.equal(data,'changed in another tab');assert.throws(()=>P.storage(adapter));
const html=read('passport/test/index.html');assert(!html.includes('googletagmanager'));assert(!html.includes('/assets/analytics.js'));assert(!html.includes('/assets/visitor-count.js'));assert(html.includes('noindex,follow'));assert(!read('sitemap.xml').includes('/passport/test/'));
const catalog=JSON.parse(html.match(/id="passportCatalog">([\s\S]*?)<\/script>/)[1]);assert.equal(catalog.tour.length,8);for(const t of catalog.tour)assert(catalog.events.some(e=>e.id===t.eventId));for(const e of catalog.events)if(e.placeId)assert(catalog.places.some(p=>p.id===e.placeId));assert(catalog.events.some(e=>e.endDate!==e.date));
for(const file of ['src/shared/calendar-view.js','src/shared/seeya-map.js','src/template.html','src/offline.html'])assert(!read(file).includes('/passport/'),file+' must not expose the test page');
assert(!read('src/pages/passport.js').includes('href="#'));assert(!read('src/client/passport.js').includes('href="#'),'Hash links must account for the shared base URL');
assert(read('passport/index.html').includes('/passport/test/'));
const build=JSON.parse(read('build-manifest.json'));for(const file of build.files.filter(p=>p.endsWith('.html')&&p!=='passport/test/index.html'))assert(!/href="[^"]*\/passport\//.test(read(file)),file+' exposes passport');
for(const city of ['서울','부산']){const t=catalog.tour.find(t=>t.label===city),e=catalog.events.find(e=>e.id===t.eventId);assert(e);assert(e.archiveId);}
const seoul=catalog.tour.filter(t=>t.label==='서울');assert.deepEqual(seoul.map(t=>t.date),['2026-08-29','2026-08-30']);
assert.equal(new Set(seoul.map(t=>t.eventId)).size,2);
assert.equal(new Set(catalog.events.map(e=>e.id)).size,catalog.events.length);
assert.equal(new Set(seoul.map(t=>t.archiveId)).size,1);
// Offline worker: complete installation, private data never cached, network failure opens the saved shell.
async function offline(){
 const handlers={},items=new Map(),cache={put:async(k,v)=>items.set(k,v),match:async k=>items.get(k)},names=['unrelated','seeya-passport-shell-old'],deleted=[];let offline=false,claimed=0;
 const fetch=async req=>{if(offline)throw Error('offline');return {ok:true,url:typeof req==='string'?req:req.url};};
 const context={URL,Request:class{constructor(url){this.url=url;}},Response:{error:()=>({error:true})},fetch,caches:{open:async()=>cache,keys:async()=>names,delete:async n=>deleted.push(n)},self:{location:{origin:'https://seeya-fanpage.com'},clients:{claim:async()=>claimed++},addEventListener:(k,f)=>handlers[k]=f}};
 vm.runInNewContext(read('passport/sw.js'),context);let pending;handlers.install({waitUntil:p=>pending=p});await pending;assert(items.has('/passport/test/'));assert(![...items.keys()].some(k=>/archive\.json|manage|instagram|https:/.test(k)));handlers.activate({waitUntil:p=>pending=p});await pending;assert.deepEqual(deleted,['seeya-passport-shell-old']);assert.equal(claimed,1);
 offline=true;let response;handlers.fetch({request:{method:'GET',mode:'navigate',url:'https://seeya-fanpage.com/passport/test/?from=calendar'},respondWith:p=>response=p});assert.equal((await response).url,'/passport/test/');
 for(const url of ['https://seeya-fanpage.com/data/archive.json','https://seeya-fanpage.com/manage/','https://youtube.com/watch?v=x']){let called=false;handlers.fetch({request:{method:'GET',mode:'navigate',url},respondWith:()=>called=true});assert(!called,url);}
 console.log('PASS passport: partial dates, planned exclusion, import validation/idempotence, storage failure/conflict preservation, privacy, catalog links and offline shell isolation.');
}
offline().catch(e=>{console.error(e);process.exitCode=1;});
