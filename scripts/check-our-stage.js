'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),M=require('../src/shared/our-stage');
let now=Date.now(),s=M.fresh(now);
function solved(key){assert(M.answer(s,key,M.challenges[key].answer),key);assert(M.valid(s));}
function train(id){for(let i=0;i<3;i++){now+=60000;M.settle(s,now);assert(M.train(s,id,i,now));now+=20000;M.settle(s,now);assert(M.valid(s));}}
assert.equal(M.count(s),1);assert(!M.answer(s,'song:fault',0));assert(!M.claim(s,'first'));
assert(!M.train(s,'shoes',0,now));
assert(M.train(s,'scent',0,now));assert(M.train(s,'scent',1,now));assert(!M.train(s,'scent',2,now));
now+=30000;assert.equal(M.settle(s,now),2);assert.equal(M.percent(s,'scent'),60);
assert(M.train(s,'scent',2,now));now+=20000;M.settle(s,now);
assert(!M.answer(s,'story:first',0));assert(!M.claim(s,'first'));
solved('story:first');assert(M.claim(s,'first'));assert(!M.claim(s,'first'));
assert(M.eligible(s,'shoes'));assert(!M.open(s,'shoes'));
solved('song:shoes');assert(!M.answer(s,'song:shoes',0));train('shoes');
solved('song:because');solved('song:flower');
assert(!M.cheer(s,'story:album','   '));assert(!M.cheer(s,'story:album','a'.repeat(201)));
assert(M.cheer(s,'story:album','세 사람의 목소리를 오래 기억할게요.'));
assert(M.claim(s,'album'));solved('song:promise');train('promise');solved('song:again');
for(const id of ['gr','yj','br','reunion']){assert(!M.canChallenge(s,'story:'+id));assert(!M.claim(s,id));}
train('again');
for(const id of ['guilty','parting','tears','loved','just']){solved('song:'+id);train(id);}
solved('song:fault');
solved('story:ending');assert(M.claim(s,'ending'));
assert.equal(M.count(s),12);assert.equal(M.voices(s),0);assert(M.has(s,'ending'));assert(M.valid(s));
assert.equal(M.memberCards(s).filter(c=>c.earned).length,3);
assert.deepEqual(M.loadSave(JSON.stringify(s)),s);
const legacy=JSON.parse(JSON.stringify(s));legacy.flags=['first','album','yj','gr','br','reunion','ending'];legacy.version=2;legacy.content='first-mind';delete legacy.collected;delete legacy.notes;delete legacy.proofs;
const migrated=M.loadSave(JSON.stringify(legacy));assert.equal(M.count(migrated),12);assert.deepEqual(migrated.flags,legacy.flags);assert.deepEqual(migrated.tracks,s.tracks);
const invalid={...s,flags:null};assert.equal(M.valid(invalid),false);assert.throws(()=>M.loadSave(JSON.stringify(invalid)));
assert.throws(()=>M.loadSave('broken'));
assert(M.valid({...s,notes:{'story:album':'<img src=x onerror=alert(1)>'}}));
const html=fs.readFileSync('game/our-stage/test/index.html','utf8');
assert(html.includes('noindex,nofollow'));assert(html.includes('mobileMenu'));assert(!html.includes('googletagmanager'));
assert(fs.readFileSync('game/test/index.html','utf8').includes('href="/game/our-stage/test/"'));
assert(fs.readFileSync('game/index.html','utf8').includes('href="/game/our-stage/"'));
assert(fs.readFileSync('sitemap.xml','utf8').includes('/game/our-stage/</loc>'));
assert(!fs.readFileSync('sitemap.xml','utf8').includes('/game/our-stage/test/'));
console.log('PASS our stage: all 12 unlocks and badge, quiz/retry gates, queue/timers, story cheer, old save migration, backup validation and public/test entries.');
module.exports={complete:s};
const T=M.forTest(),t=T.fresh(1000);
assert.deepEqual(T.lessons.map(x=>x.seconds),[1,1,1]);
assert.deepEqual(M.lessons.map(x=>x.seconds),[5,5,5]);
assert.equal(T.timing.recoveryMs,1000);assert.equal(T.timing.performanceMs,1000);
assert(T.train(t,'scent',0,1000));assert(T.train(t,'scent',1,1000));
assert.equal(T.settle(t,1999),0);assert.equal(t.points,95);
assert.equal(T.settle(t,2000),1);assert.equal(t.active.lesson,1);assert.equal(t.active.end,3000);
assert.equal(T.settle(t,3000),1);assert.equal(t.points,100);assert.equal(t.active,null);
assert(T.valid(t));assert.deepEqual(T.loadSave(JSON.stringify(t)),t);
const wardrobe=JSON.parse(fs.readFileSync('src/data/our-stage-outfits.json','utf8'));
assert.equal(wardrobe.length,10);assert(wardrobe.find(o=>o.id==='rebloom').note.includes('참여하지 않았으며'));
for(const o of wardrobe){assert(fs.existsSync('.'+o.image));assert.equal(Object.keys(require('../src/data/our-stage-layers.json')[o.id].members).length,3);}
console.log('PASS test-only 1-second queue/recovery boundaries, save compatibility, 8 album outfits + practice and concert.');


const starter=M.fresh(),tester=M.forTest();
assert(M.outfitOwned(starter,'base'));
assert(!M.outfitOwned(starter,'first-mind'));
assert(!M.canWearOutfit(starter,'first-mind'));
assert(tester.canWearOutfit(starter,'first-mind'));
assert(!tester.canWearOutfit(starter,'missing'));
assert(M.albumUnlocked(s,'first-mind'));
assert(M.outfitOwned(s,'first-mind'));
assert(M.canWearOutfit(s,'first-mind'));
for(const id of ['lovely-sweet-heart','california-dream','brilliant-change','rebloom','see-you-again','still-here','first-again']){
 assert(!M.outfitOwned(s,id));assert(!M.canWearOutfit(s,id));assert(tester.canWearOutfit(starter,id));
}
assert(M.outfitOwned(M.loadSave(JSON.stringify(s)),'first-mind'));
console.log('PASS album reward ownership, existing saves, production lock and preview separation.');

