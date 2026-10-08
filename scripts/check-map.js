'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const root=path.resolve(__dirname,'..'),read=p=>fs.readFileSync(path.join(root,p),'utf8'),json=p=>JSON.parse(read(p));
const config=json('src/data/map-places.json'),route=json('src/data/map-preview-route.json'),archive=json('data/archive.json');
const shared=require('../src/shared/seeya-map'),{resolvePlaces,filterPlaces,cards,detail,groupPins}=shared;
const allRows=resolvePlaces(config,archive),concertConfig={...config,places:config.places.filter(p=>!p.name)},rows=resolvePlaces(concertConfig,archive),html=read(route.path.slice(1)+'index.html');
assert.equal(config.places.length,76);assert.equal(allRows.length,76);assert.equal(new Set(allRows.map(p=>p.id)).size,76);assert.equal(rows.length,7);assert.equal(new Set(rows.map(p=>p.id)).size,7);
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
vm.runInNewContext(read('src/client/seeya-map.js'),{require:name=>name==='./kakao-map'?{isDomestic:require('../src/client/kakao-map').isDomestic,mountKakaoMap(config,{onError}){onError();}}:shared,document:doc,window:{matchMedia:()=>({matches:true})},clearTimeout(){},setTimeout(){},navigator:{}});
assert.equal(workspace.dataset.view,'list');assert.equal(get('mapError').hidden,false);assert(get('mapError').textContent.includes('목록'));
get('mapSearch').handlers.input({target:{value:'수원'}});assert(get('mapList').innerHTML.includes('선승관'));assert(!get('mapList').innerHTML.includes('KBS홀'));
get('mapSearch').handlers.input({target:{value:'없는장소'}});assert.equal(get('mapEmpty').hidden,false);
get('mapReset').onclick();assert.equal(get('mapEmpty').hidden,true);assert(get('mapCount').innerHTML.includes('7'));
const {promoStatus}=shared;
for(const p of allRows){assert(p.addressSource&&p.coordinateSource&&p.source.url&&p.dateBasis);assert(p.coordinates.every(Number.isFinite));assert(html.includes(p.name));assert(detail(p).includes(p.source.url.replaceAll('&','&amp;')));}
assert.equal(filterPlaces(allRows,{relation:'콘서트 혜택'}).length,11);
assert.equal(filterPlaces(allRows,{relation:'사진·사인'}).length,1);
assert.equal(filterPlaces(allRows,{category:'카페'}).length,15);
assert.equal(filterPlaces(allRows,{member:'씨야'}).length,25);
assert.equal(filterPlaces(allRows,{member:'이보람'}).length,35);
assert(!filterPlaces(allRows,{member:'씨야'}).some(p=>p.id==='maboklim'));
const ohji=allRows.find(p=>p.id==='ohji'),thai=allRows.find(p=>p.id==='thailicious');
assert.equal(promoStatus(thai,'2026-10-05T00:00:00+09:00'),'혜택 종료');
assert.equal(promoStatus(ohji,'2026-10-10T23:59:59+09:00'),'혜택 기간');
assert.equal(promoStatus(ohji,'2026-10-11T01:00:01+09:00'),'혜택 종료');
assert.equal(promoStatus(ohji,'2026-10-05T23:59:59+09:00'),'혜택 예정');
assert(!detail(allRows.find(p=>p.id==='maboklim')).includes('20주년 콘서트 기록관'));
assert.equal(filterPlaces(allRows,{category:'식당',region:'서울'}).length,8);
assert.equal(resolvePlaces(config,archive.filter(r=>r.id!=='v4145-NIeNbStvYa0')).find(p=>p.id==='maboklim').recordId,null);
console.log('PASS: map preview isolation, 76 verified places and seven tour venues, filters, clustering, escaping and library-failure fallback.');

assert.equal(filterPlaces(allRows,{region:'제주'}).length,14);
assert.equal(filterPlaces(allRows,{category:'여행·자연'}).length,8);
assert(filterPlaces(allRows,{category:'문화공간'}).some(p=>p.id==='ulsan-art-museum'));
assert.equal(filterPlaces(allRows,{category:'쇼핑'})[0].id,'dongmyo-area');
assert(filterPlaces(allRows,{relation:'팬 행사'}).some(p=>p.id==='about-project-jamsil'));
for(const p of allRows.filter(p=>p.locationPrecision==='area')){assert(detail(p).includes('지역 지도'));assert(!detail(p).includes('link/to/'));assert(detail(p).includes('대표 위치'));}
assert.equal(allRows.find(p=>p.id==='dufore-jeju').coordinates[0],33.5185278);
assert.equal(allRows.find(p=>p.id==='about-project-jamsil').dateBasis,'영상 게시일');
assert.equal(allRows.find(p=>p.id==='rully-gachang').dateBasis,'공연일');
for(const p of config.researchQueue)assert(!allRows.some(r=>r.name===p.name));
for(const category of ['문화공간','여행·자연','쇼핑'])assert(html.includes('data-category="'+category+'"'));
assert(!html.includes('leadSource'));
console.log('PASS: new place categories, representative area links, publication dates, correct Jeju branch and unpublished research queue.');

// Ordinary performance venues must never inherit the 20th-anniversary tour branding.
for(const p of allRows.filter(p=>p.category==='공연장'&&!p.tourVenue)) {assert(!detail(p).includes('20주년 콘서트 기록관'));assert(!detail(p).includes('THE FAN'));assert(cards([p]).includes(p.name));assert(!cards([p]).includes('map-ticket'));}
const closed=allRows.find(p=>p.id==='ikcoffee-historic');assert(detail(closed).includes('옛 위치 보기'));assert(!detail(closed).includes('link/to/'));assert(cards([closed]).includes('영업 종료'));
const hk=allRows.find(p=>p.id==='avenue-of-stars');assert(detail(hk).includes('google.com/maps/search/'));assert(!detail(hk).includes('map.kakao.com'));assert(filterPlaces(allRows,{region:'홍콩'}).length===1);
const review=config.researchReview.rows;assert.equal(review.length,105);assert.equal(new Set(review.map(r=>r.id)).size,105);
for(const r of review){if(r.status==='pending')assert(config.researchQueue.some(q=>q.researchRefs?.includes(r.id)));else assert(allRows.some(p=>p.id===r.placeId));}
assert(!html.includes('researchReview'));assert(!html.includes('researchQueue'));
assert.equal(allRows.find(p=>p.id==='haeundae-busking').date,'2026-05-22');assert.equal(allRows.find(p=>p.id==='jungmun-byeoljang').dateBasis,'영상 게시일');
console.log('PASS: historical venue branding, closed cafe, overseas map link and all 105 workbook dispositions.');

// Confirmed leads retain evidence dates, precise old-station coordinates and an area-only lake pin.
assert.equal(allRows.find(p=>p.id==='old-kim-you-jeong-station').coordinates[0],37.819447);
assert.equal(allRows.find(p=>p.id==='geumdwaeji-sikdang').dateBasis,'SNS 게시일 · 기사 확인');
assert(cards([allRows.find(p=>p.id==='ict-valley-floria')]).includes('공연 예정'));
assert(!detail(allRows.find(p=>p.id==='uiam-lake')).includes('link/to/'));
assert.equal(review.filter(r=>r.status==='pending').length,50);

// Every map place must have an archive disposition; multiple locations may share one broadcast.
assert.equal(config.archiveAudit.rows.length, config.places.length);
assert.equal(new Set(config.archiveAudit.rows.map(r=>r.placeId)).size,config.places.length);
for(const p of config.places){
 const audit=config.archiveAudit.rows.find(r=>r.placeId===p.id);
 assert(audit,'Missing archive audit: '+p.id);
 const id=p.relatedRecordId||p.recordId;
 assert.equal(audit.recordId,id||null);
 if(id) assert(archive.some(r=>r.id===id),'Unresolved archive record: '+p.id);
 else assert(p.archiveExclusion&&audit.status==='map-only','Unexplained archive omission: '+p.id);
}
assert.equal(config.archiveAudit.rows.filter(r=>r.status==='map-only').length,1);
const station=allRows.find(p=>p.id==='old-kim-you-jeong-station'),lake=allRows.find(p=>p.id==='uiam-lake');
assert.equal(station.recordId,lake.recordId);
const trip=archive.find(r=>r.id===station.recordId);
assert.equal(trip.date,'2024-05-03');assert.equal(trip.dateBasis,'broadcast');
assert(trip.note.includes('김유정역')&&trip.note.includes('의암호'));
assert(detail(station).includes('/archive/?record='+trip.id));
assert(!html.includes('archiveAudit'));assert(!html.includes('archiveExclusion'));
const batch=json('src/data/archive-content-updates.json').find(b=>b.id==='archive-2026-10-08-map-reverse-audit');
assert.equal(batch.additions.length,7);
for(const r of batch.additions){
 assert(archive.some(a=>a.id===r.id));
 if(r.source.url.includes('instagram.com')&&!r.title.includes('팬 카페'))assert.equal(r.dateBasis,'post-published');
}
const fan=archive.find(r=>r.id==='20240215-boram-birthday-fancafe');
assert.equal(fan.calendar.enabled,false);assert(fan.note.includes('직접 참석을 뜻하지'));
const rully=archive.find(r=>r.id==='v475-sheet2-row31');assert.equal(rully.venue,'룰리커피 가창점');
assert.equal(rully.date,'2026-06-28');assert.equal(rully.dateBasis,'event');
console.log('PASS: all 76 map archive dispositions, single Chuncheon broadcast, seven additions and evidence date distinctions.');

// Public map uses the shared navigation, while the previous preview stays unlisted.
const publicMap=read('map/index.html');
assert(publicMap.includes('씨야 대동여지도 <span aria-hidden="true">📍</span>'));
assert(publicMap.includes('걸어서 씨야 속으로'));
assert(!publicMap.includes('map-ticket'));
assert(publicMap.includes('class="mobile mobile-compact"'));
assert(publicMap.includes('class="brand logo-brand"'));
assert(publicMap.includes('rel="canonical" href="https://seeya-fanpage.com/map/"'));
assert(read('sitemap.xml').includes('https://seeya-fanpage.com/map/'));
assert.equal((read('src/template.html').match(/href="\/map\/"/g)||[]).length,3);
assert.equal(JSON.parse(publicMap.match(/id="mapData">(.*?)<\/script>/s)[1]).places.length,allRows.length);
console.log('PASS: public map, shared navigation, subtitle and photo-free place cards.');
