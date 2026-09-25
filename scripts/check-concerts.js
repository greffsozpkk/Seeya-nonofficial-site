const assert=require('node:assert/strict');
const archive=require('../data/archive.json'),routes=require('../src/data/routes.json'),site=require('../src/data/site.json');
const {catalog,concerts,concertPath,concertForRecord,sources,stateOf}=require('../src/shared/concert-data');
const list=concerts(archive,site.snapshotDate.slice(0,10));const ids=catalog.flatMap(c=>c.events.map(e=>e.id));
assert.equal(new Set(ids).size,ids.length,'Archive entries must not duplicate across collections');
assert.equal(new Set(catalog.map(c=>c.id)).size,catalog.length);
for(const c of catalog){assert(routes.some(r=>r.concertId===c.id&&r.path===concertPath(c)));assert(c.events.length);for(const ref of c.events){assert(archive.some(r=>r.id===ref.id&&r.type==='concert'),'Missing original concert record');assert.equal(concertForRecord(ref.id).id,c.id);}}
const fan=list.find(c=>c.id==='the-fan-2026');assert.equal(fan.events.length,7);assert.equal(fan.events.filter(e=>e.state==='upcoming').length,4);assert.equal(fan.events.find(e=>e.label==='서울').endDate,'2026-08-30');
const daegu=fan.events.find(e=>e.label==='대구');assert.equal(daegu.videos.length,8);assert(daegu.videos.some(s=>s.url.endsWith('aKTA8kR_NG8')));assert(daegu.videos.some(s=>s.url.endsWith('dW8vBqXwWGE')));assert.equal(daegu.date,'2026-09-12');assert.equal(daegu.songs.length,7);assert(!daegu.references.some(s=>s.url.includes('docs.google.com')));assert.deepEqual(daegu.songs,archive.find(r=>r.id===daegu.id).songs);
const rebloom=list.find(c=>c.id==='rebloom-2026').events[0];assert.deepEqual(rebloom.songs,['그래도 좋아']);assert(rebloom.videos.some(s=>s.url.endsWith('QKNH-IrU78U')));
assert.equal(stateOf({date:'2026-09-15',endDate:'2026-09-17'},'2026-09-16'),'current');assert.equal(stateOf({date:'2026-09-10',eventState:'scheduled'},'2026-09-16'),'pending');assert.equal(stateOf({date:'2026-10-10',eventState:'cancelled'},'2026-09-16'),'cancelled');
assert.deepEqual(sources({source:{url:'javascript:alert(1)'},additionalSources:[{url:'https://docs.google.com/spreadsheets/x'},{url:'https://example.com/a'},{url:'https://example.com/a'}]}).map(x=>x.url),['https://example.com/a']);
assert(!concerts(archive.map(r=>r.id===daegu.id?{...r,hidden:true}:r),'2026-09-16').find(c=>c.id===fan.id).events.some(e=>e.id===daegu.id));
console.log(`PASS: ${list.length} concert collections / ${ids.length} canonical references, routes, regional grouping, date ranges, explicit schedule states, source deduplication, spreadsheet exclusion, preserved partial song lists.`);
