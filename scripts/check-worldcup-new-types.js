'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs');
const {current,manifest}=require('../src/shared/worldcup-manifest'),catalog=current();
const group=catalog.find(c=>c.id==='group'),album=catalog.find(c=>c.id==='album4'),covers=catalog.find(c=>c.id==='covers');
assert.equal(catalog.length,7);assert.equal(album.candidates.length,9);assert.deepEqual(album.rounds,['all']);
assert.deepEqual(album.candidates,group.candidates.filter(r=>r.album==='First, Again · 2026'));
assert(album.candidates.every(r=>r.channel==='SEEYA Official'&&!/inst\.|instrumental/i.test(r.title)));
assert.deepEqual(covers.rounds,[16,'all']);assert.equal(covers.candidates.length,26);
const archive=require('../data/archive.json'),channels=new Set(['KBS 레전드 케이팝','KBS Kpop','MBCentertainment','JTBC Entertainment','Beginagain 비긴어게인','미스&미스터트롯','TVCHOSUN JOY','TVCHOSUN - TV조선','피크닉라이브 소풍']);
for(const r of covers.candidates){assert(channels.has(r.channel));assert(/^[\w-]{11}$/.test(r.youtubeId));assert(r.videoTitle&&r.channelUrl&&r.checkedAt);assert(archive.some(a=>a.id===r.archiveRef));assert(!/정체 공개|결과 발표|인터뷰|세로직캠/.test(r.videoTitle));assert(['방송 무대','방송 클립'].includes(r.videoKind));}
assert.equal(new Set(covers.candidates.map(r=>r.youtubeId)).size,26);
assert.equal(new Set(covers.candidates.map(r=>r.artist+'|'+r.title)).size,26);
const pending=require('../src/data/worldcup-covers-pending.json');assert.equal(pending.candidates.length,26);assert(pending.candidates.every(r=>r.embedError===150&&!covers.candidates.some(c=>c.youtubeId===r.youtubeId)));
const generated=JSON.parse(fs.readFileSync('game/worldcup/catalog.json','utf8'));assert.deepEqual(generated,manifest());
const html=fs.readFileSync('game/worldcup/test/index.html','utf8');for(const c of [album,covers,catalog.find(c=>c.id==='covers-all')])assert(html.includes(c.title));
assert(!fs.readFileSync('game/index.html','utf8').includes('?type=album4'));
console.log('PASS new worldcups: nine shared album tracks, all-only mode, twenty-six unique official-channel covers with archive provenance, generated catalog and test-only entry.');

const all=catalog.find(c=>c.id==='covers-all'),extra=require('../src/data/worldcup-cover-extras.json');
assert.equal(all.candidates.length,128);assert.deepEqual(all.rounds,[32,64,'all']);
assert.deepEqual(all.candidates,[...covers.candidates,...extra]);
assert.equal(all.candidates.filter(r=>r.artist==='남규리').length,3);
assert(extra.some(r=>r.channel==='보람씨야')&&extra.some(r=>r.channel==='김연지 Official'));
assert(extra.every(r=>r.embedCheck==='initialized'&&r.videoTitle&&r.channelUrl&&r.checkedAt));
const extraPending=require('../src/data/worldcup-cover-extras-pending.json');
assert.equal(extraPending.candidates.filter(r=>r.embedError===150).length,14);
assert(extraPending.candidates.every(r=>!all.candidates.some(c=>c.youtubeId===r.youtubeId)));
assert(generated.collections.every(c=>c.candidates.length<=128&&JSON.stringify(c).length<=40000));
console.log('PASS: seven independent worldcups; 26 shared broadcasts + 102 extra covers; 128 unique candidates; 14 blocked and 3 reserve videos excluded; dynamic server limits respected.');
