'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const root=path.resolve(__dirname,'..'),read=p=>fs.readFileSync(path.join(root,p),'utf8'),json=p=>JSON.parse(read(p));
const config=json('src/data/map-places.json'),route=json('src/data/map-preview-route.json'),archive=json('data/archive.json');
const shared=require('../src/shared/seeya-map'),{resolvePlaces,filterPlaces,cards,detail,groupPins}=shared;
const allRows=resolvePlaces(config,archive),concertConfig={...config,places:config.places.filter(p=>!p.name)},rows=resolvePlaces(concertConfig,archive),html=read(route.path.slice(1)+'index.html');
assert.equal(config.places.length,28);assert.equal(allRows.length,28);assert.equal(new Set(allRows.map(p=>p.id)).size,28);assert.equal(rows.length,7);assert.equal(new Set(rows.map(p=>p.id)).size,7);
assert.deepEqual(rows.map(p=>p.recordId).sort(),json('src/data/concerts.json').find(t=>t.id==='the-fan-2026').events.map(e=>e.id).sort());
for(const p of rows){assert(p.coordinates[0]>33&&p.coordinates[0]<39);assert(p.coordinates[1]>124&&p.coordinates[1]<131);assert(p.addressSource&&p.coordinateSource&&p.checkedAt);assert.equal(p.date,archive.find(r=>r.id===p.recordId).date);assert(html.includes(p.name));}
assert.equal(resolvePlaces(concertConfig,archive.filter(r=>r.id!==rows[0].recordId)).length,6);
assert.equal(resolvePlaces(concertConfig,archive.map(r=>r.id===rows[0].recordId?{...r,hidden:true}:r)).length,6);
const changed=archive.map(r=>r.id===rows[0].recordId?{...r,date:'2026-08-30'}:r);assert.equal(resolvePlaces(concertConfig,changed)[0].date,'2026-08-30');
assert.equal(filterPlaces(rows,{query:'수원'})[0].locality,'용인시 기흥구');assert.equal(filterPlaces(rows,{query:'용인 선승관'}).length,1);
assert.equal(filterPlaces(rows,{region:'경기'}).length,2);assert.equal(filterPlaces(rows,{member:'남규리'}).length,7);assert.equal(filterPlaces(rows,{query:'없는장소'}).length,0);
assert.equal(filterPlaces(rows,{bounds:{south:35,north:35.2,west:129,east:129.2}})[0].city,'부산');
assert.equal(filterPlaces(rows,{sort:'newest'})[0].city,'인천');assert.equal(filterPlaces(rows)[0].city,'서울');
assert.equal(groupPins(rows,()=>({x:1,y:1}))[0].items.length,7);assert.equal(groupPins(rows,p=>({x:p[0]*10000,y:p[1]*10000})).length,7);
assert(!cards([{...rows[0],name:'<img src=x onerror=alert(1)>'}]).includes('<img'));assert(detail(rows[0]).includes('/archive/?record='+rows[0].recordId));
assert(html.includes('noindex,nofollow,noarchive,nosnippet'));assert(!html.includes('googletagmanager'));assert(!html.includes('rel="manifest"'));assert(!read('sitemap.xml').includes(route.path));assert(!read('sw.js').includes(route.path));assert(!read('src/template.html').includes(route.path));
for(const m of html.matchAll(/(?:href|src)="(\/[^"#?]+)[^\"]*"/g)){let p=path.join(root,decodeURIComponent(m[1]));if(fs.existsSync(p)&&fs.statSync(p).isDirectory())p=path.join(p,'index.html');assert(fs.existsSync(p),'Missing map link '+m[1]);}
// Library failure must still bind and execute search and list controls.
const elements=new Map(),get=id=>{if(!elements.has(id))elements.set(id,{hidden:false,textContent:'',innerHTML:'',dataset:{},handlers:{},addEventListener(name,fn){this.handlers[name]=fn;},setAttribute(){},focus(){}});return elements.get(id);};
get('mapData').textContent=JSON.stringify({places:rows,tileUrl:config.tileUrl});
const workspace={dataset:{view:'map'}},doc={getElementById:get,querySelectorAll:()=>[],querySelector:s=>s==='.map-workspace'?workspace:null,addEventListener(){}};
vm.runInNewContext(read('src/client/seeya-map.js'),{require:()=>shared,document:doc,window:{matchMedia:()=>({matches:true})},clearTimeout(){},setTimeout(){},navigator:{}});
assert.equal(workspace.dataset.view,'list');assert.equal(get('mapError').hidden,false);assert(get('mapError').textContent.includes('목록'));
get('mapSearch').handlers.input({target:{value:'수원'}});assert(get('mapList').innerHTML.includes('선승관'));assert(!get('mapList').innerHTML.includes('KBS홀'));
get('mapSearch').handlers.input({target:{value:'없는장소'}});assert.equal(get('mapEmpty').hidden,false);
get('mapReset').onclick();assert.equal(get('mapEmpty').hidden,true);assert(get('mapCount').innerHTML.includes('7'));
const {promoStatus}=shared;
for(const p of allRows){assert(p.addressSource&&p.coordinateSource&&p.source.url&&p.dateBasis);assert(p.coordinates.every(Number.isFinite));assert(html.includes(p.name));assert(detail(p).includes(p.source.url.replaceAll('&','&amp;')));}
assert.equal(filterPlaces(allRows,{relation:'콘서트 혜택'}).length,11);
assert.equal(filterPlaces(allRows,{relation:'사진·사인'}).length,1);
assert.equal(filterPlaces(allRows,{category:'카페'}).length,6);
assert.equal(filterPlaces(allRows,{member:'씨야'}).length,21);
assert.equal(filterPlaces(allRows,{member:'이보람'}).length,21);
assert(!filterPlaces(allRows,{member:'씨야'}).some(p=>p.id==='maboklim'));
const ohji=allRows.find(p=>p.id==='ohji'),thai=allRows.find(p=>p.id==='thailicious');
assert.equal(promoStatus(thai,'2026-10-05T00:00:00+09:00'),'혜택 종료');
assert.equal(promoStatus(ohji,'2026-10-10T23:59:59+09:00'),'혜택 기간');
assert.equal(promoStatus(ohji,'2026-10-11T01:00:01+09:00'),'혜택 종료');
assert.equal(promoStatus(ohji,'2026-10-05T23:59:59+09:00'),'혜택 예정');
assert(!detail(allRows.find(p=>p.id==='maboklim')).includes('20주년 콘서트 기록관'));
assert.equal(filterPlaces(allRows,{category:'식당',region:'서울'}).length,3);
assert.equal(resolvePlaces(config,archive.filter(r=>r.id!=='v4145-NIeNbStvYa0')).find(p=>p.id==='maboklim').recordId,null);
console.log('PASS: map preview isolation, 28 verified places and seven archive-linked venues, filters, clustering, escaping and library-failure fallback.');
