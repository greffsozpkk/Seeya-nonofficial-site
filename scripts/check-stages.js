const assert=require('node:assert/strict');
const archive=require('../data/archive.json'),routes=require('../src/data/routes.json');
const {songs,mappings,songPath,songByTitle,performances,videoId}=require('../src/shared/stage-data');
const cutoff=require('../src/data/site.json').snapshotDate.slice(0,10);
const byId=new Map(archive.map(x=>[x.id,x]));
assert.equal(new Set(songs.map(s=>s.id)).size,songs.length);
for(const s of songs){assert(routes.some(r=>r.path===songPath(s)&&r.songId===s.id));assert(performances(archive,s.id,cutoff).length>0,s.id+' requires a performance');}
for(const m of mappings){const row=byId.get(m.archiveId);assert(row,'Unknown archive reference');assert(['broadcast','concert','live'].includes(m.category));assert(['single','multi','compilation'].includes(m.scope));assert(videoId(m.url));assert([row.source,...(row.additionalSources||[])].some(s=>s?.url===m.url),'Must reference an existing source');for(const id of m.songIds)assert(songs.some(s=>s.id===id));}
assert.equal(songByTitle('그놈 목소리').id,'his-voice');assert.equal(songByTitle('sTaY').id,'stay');assert.equal(songByTitle('사랑의 인사 2026'),undefined,'Different editions must not merge automatically');
const stay=performances(archive,'stay',cutoff),spring=performances(archive,'like-spring',cutoff);
const picnic=stay.find(r=>r.id==='v475-sheet2-row74');assert.equal(picnic.clips.length,2);assert.equal(stay.filter(r=>r.id===picnic.id).length,1);assert(!picnic.clips.some(c=>videoId(c.url)==='umxr2fEgcas'));assert.equal(spring.find(r=>r.id===picnic.id).clips[0].url,'https://www.youtube.com/watch?v=umxr2fEgcas');
for(const replacement of [{eventState:'scheduled'},{date:'2099-01-01'},{source:{},additionalSources:[]}])assert(!performances(archive.map(r=>r.id===picnic.id?{...r,...replacement}:r),'stay',cutoff).some(r=>r.id===picnic.id));
const {getFilteredArchive}=require('../src/shared/views');assert.deepEqual(getFilteredArchive(archive,{query:'',year:'all',member:'all',type:'all',sort:'newest',record:picnic.id}).map(r=>r.id),[picnic.id]);
console.log(`PASS: ${songs.length} songs, ${mappings.length} source mappings; route coverage, explicit aliases, per-song source isolation, event deduplication, scheduled/missing-source exclusion, exact archive links.`);
