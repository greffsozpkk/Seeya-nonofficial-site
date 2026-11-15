
'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs');
const M=require('../src/shared/our-stage').forTest();
let s=structuredClone(require('./check-our-stage').complete),now=Math.max(Date.now(),s.energyAt)+1000;
const assertValid=()=>assert(M.valid(s),'valid at '+JSON.stringify(s.albums));
assert.equal(M.songs.length,82);assert.equal(M.badges(s).length,49);
assert.deepEqual(M.albums.map(a=>a.tracks.length),[12,13,11,13,5,15,2,11]);
assert(!M.unlockAlbum(s,'first-again'));
const checkpoints=[];
for(const a of M.albums.slice(1)){
 checkpoints.push(structuredClone(s));
 assert(M.albumAvailable(s,a.id));assert(!M.outfitOwned(s,a.id));
 assert(M.unlockAlbum(s,a.id));assert(!M.unlockAlbum(s,a.id));assert(M.outfitOwned(s,a.id));
 assert(!M.answer(s,'song:'+a.tracks[1].id,M.challenges['song:'+a.tracks[1].id].answer));
 for(const [i,t]of a.tracks.entries()){
  assert(M.eligible(s,t.id));const key='song:'+t.id,q=M.challenges[key];
  assert(!M.answer(s,key,(q.answer+1)%3));assert(!M.open(s,t.id));
  assert(M.answer(s,key,q.answer));assert(!M.answer(s,key,q.answer));assertValid();
  if(i<a.tracks.length-1)assert(!M.eligible(s,a.tracks[i+1].id));
  now+=1000;M.settle(s,now);assert(M.train(s,t.id,0,now));
  assert.equal(M.settle(s,now+999),0);now+=1000;assert.equal(M.settle(s,now),1);assertValid();
 }
 assert(M.albumComplete(s,a.id));assert(M.badges(s).find(b=>b.id===a.id+'-collect').earned);
 assert(!M.albumMastered(s,a.id));
 assert.deepEqual(M.loadSave(JSON.stringify(s)),s);
}
assert.equal(M.count(s),82);
assert(M.albums.every(a=>M.albumUnlocked(s,a.id)));
for(const id of M.ids)for(let lesson=0;lesson<3;lesson++)if(!s.tracks[id].includes(lesson)){
 now+=1000;M.settle(s,now);assert(M.train(s,id,lesson,now));now+=1000;M.settle(s,now);
}
for(const id of ['gr','yj','reunion','br']){assert(M.answer(s,'story:'+id,M.challenges['story:'+id].answer));assert(M.claim(s,id));}
for(const id of ['first','album','yj','gr','br'])assert(M.cheer(s,'story:'+id,'응원해요'));
for(const e of M.storyEntries)assert(M.answer(s,'story:'+e.id,M.challenges['story:'+e.id].answer));
assertValid();assert(M.badges(s).every(b=>b.earned));
assert.equal(M.badges(s).filter(b=>b.earned).length,49);
const corrupt=structuredClone(checkpoints[0]);corrupt.albums=['first-again'];assert(!M.valid(corrupt));assert.throws(()=>M.loadSave(JSON.stringify(corrupt)));
const legacy=require('../src/shared/our-stage-legacy'),old=legacy.fresh();
const migrated=M.loadSave(JSON.stringify(old));assert.equal(migrated.version,8);assert.equal(M.count(migrated),1);assert.deepEqual(migrated.albums,[]);
assert.equal(old.version,3);
assert(!fs.readFileSync('game/index.html','utf8').includes('/our-stage/'));
console.log('PASS album journey: sequential 8 chapters, 82 track slots, wrong/retry gates, 1-second practice, costumes, 49 badges, persistence, v3 migration, invalid skip rejection.');
module.exports={complete:s,checkpoints};

