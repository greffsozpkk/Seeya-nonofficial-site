'use strict';
const assert=require('node:assert/strict'),M=require('../src/shared/our-stage').forTest();
const fixtures=require('./check-our-stage-journey');
const full=structuredClone(fixtures.complete);
full.proofs=full.proofs.filter(k=>!M.storyById(k.slice(6)));
for(const k of Object.keys(full.notes))if(M.storyById(k.slice(6)))delete full.notes[k];
assert(M.valid(full));assert.deepEqual(M.loadSave(JSON.stringify(full)),full);
assert.equal(M.storyEntries.length,15);assert.equal(M.storyEntries.filter(e=>e.kind==='album').length,7);
assert.equal(M.storyEntries.filter(e=>e.kind==='event').length,8);
const fresh=M.fresh();
for(const e of M.storyEntries){
 const key='story:'+e.id,q=M.challenges[key];
 assert(!M.storyAvailable(fresh,e.id));assert(!M.answer(fresh,key,q.answer));assert(!M.cheer(fresh,key,'응원'));
 assert(M.storyAvailable(full,e.id));assert(!M.storyDone(full,e.id));
 const s=structuredClone(full),before=s.proofs.length;
 assert(!M.answer(s,key,(q.answer+1)%q.choices.length));assert.equal(s.proofs.length,before);
 assert(M.answer(s,key,q.answer));assert(M.storyDone(s,e.id));assert(!M.answer(s,key,q.answer));
 assert(!M.cheer(s,key,'반복 보상'));assert(M.valid(s));assert.deepEqual(M.loadSave(JSON.stringify(s)),s);
 const note=structuredClone(full);
 assert(!M.cheer(note,key,' '));assert(!M.cheer(note,key,'x'.repeat(201)));
 assert(M.cheer(note,key,'<사진> 대신 마음을 남겨요'));assert(M.storyDone(note,e.id));assert(M.valid(note));
 assert.equal(M.badges(note).filter(b=>b.earned).length,M.badges(full).filter(b=>b.earned).length+(e.kind==='event'?1:0));
}
for(let ai=1;ai<M.albums.length;ai++){
 const a=M.albums[ai],s=structuredClone(fixtures.checkpoints[ai-1]);
 assert(!M.storyAvailable(s,M.storyEntries.find(e=>e.album===a.id&&e.kind==='album').id));
 assert(M.unlockAlbum(s,a.id));let now=Math.max(Date.now(),s.energyAt)+1000;
 for(let count=0;count<=a.tracks.length;count++){
  for(const e of M.storyEntries.filter(e=>e.album===a.id))assert.equal(M.storyAvailable(s,e.id),count>=e.minTracks,e.id+' count '+count);
  if(count===a.tracks.length)break;
  const t=a.tracks[count],key='song:'+t.id;assert(M.answer(s,key,M.challenges[key].answer));
  now+=1000;M.settle(s,now);assert(M.train(s,t.id,0,now));now+=1000;M.settle(s,now);assert(M.valid(s));
 }
}
const forged=M.fresh();forged.proofs.push('story:event-copyright');assert(!M.valid(forged));assert.throws(()=>M.loadSave(JSON.stringify(forged)));
const expected=[1,2,2,3,3,4,4,5];
M.albums.forEach((a,ai)=>a.tracks.forEach(t=>{
 const q=M.challenges['song:'+t.id];if(t.id==='scent')return;
 assert(q&&q.level===expected[ai]);assert(q.choices.length===(q.level<=2?3:4));assert(new Set(q.choices).size===q.choices.length);
 assert(q.choices[q.answer]);assert(q.source.startsWith('https://'));assert(q.explanation.length>10);
}));
assert(M.challenges['song:california-dream-08'].choices.includes('풀하우스'));
assert.equal(M.challenges['song:rebloom-01'].choices[M.challenges['song:rebloom-01'].answer],'그 놈 목소리 · 이민수');
assert.equal(M.challenges['song:first-again-09'].choices[M.challenges['song:first-again-09'].answer],'우리 Live Ver.');
assert.equal(M.badges(fixtures.complete).filter(b=>b.earned).length,48);
console.log('PASS story expansion: 15 sourced stories, threshold boundaries, old-v4 saves, wrong/retry/cheer/replay, event badges, backup validation and five quiz tiers.');
module.exports={unread:full};

