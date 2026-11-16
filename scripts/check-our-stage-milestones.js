'use strict';
const assert=require('node:assert/strict'),M=require('../src/shared/our-stage').forTest(),F=require('./check-our-stage-journey');
const before={};
for(const [album,stories]of Object.entries(M.albumStoryGates)){
 const index=M.albums.findIndex(a=>a.id===album),id=stories[0],s=structuredClone(F.checkpoints[index-1]);
 s.proofs=s.proofs.filter(k=>k!=='story:'+id);delete s.notes['story:'+id];before[album]=structuredClone(s);
 assert(M.valid(s));assert(M.storyAvailable(s,id));assert(!M.albumAvailable(s,album));assert(!M.unlockAlbum(s,album));
 assert(!M.eligible(s,M.albumById(album).tracks[0].id));
 const q=M.challenges['story:'+id];assert(!M.answer(s,'story:'+id,(q.answer+1)%q.choices.length));assert(!M.albumAvailable(s,album));
 assert(M.cheer(s,'story:'+id,'다음 무대도 응원해요'));const earned=M.coins(s);assert(M.cheer(s,'story:'+id,'다시'));assert.equal(M.coins(s),earned);
 const restored=M.loadSave(JSON.stringify(s));assert(M.albumAvailable(restored,album));assert(M.unlockAlbum(restored,album));assert(!M.unlockAlbum(restored,album));assert(M.valid(restored));
 // Story completion before the last track carries forward; no extra replay or reward.
 const early=structuredClone(before[album]),last=M.albums[index-1].tracks.at(-1).id;
 early.collected=early.collected.filter(k=>k!==last);early.proofs=early.proofs.filter(k=>k!=='song:'+last);early.tracks[last]=[];early.setlist=early.setlist.filter(k=>k!==last);
 assert(M.valid(early));assert(M.storyAvailable(early,id));assert(M.answer(early,'story:'+id,q.answer));assert(!M.albumAvailable(early,album));
 assert(M.answer(early,'song:'+last,M.challenges['song:'+last].answer));assert(M.albumAvailable(early,album));
 assert.equal(M.storyDestination('story:'+id),album);
}
for(const id of ['california-dream','rebloom','see-you-again','first-again'])assert.equal(M.albumRequirements(M.fresh(),id).length,1);
const old=structuredClone(F.complete);for(const id of Object.values(M.albumStoryGates).flat()){old.proofs=old.proofs.filter(k=>k!=='story:'+id);delete old.notes['story:'+id];}
const restored=M.loadSave(JSON.stringify(old));for(const id of Object.keys(M.albumStoryGates))assert(M.albumUnlocked(restored,id));
assert.equal(Object.keys(M.albumStoryGates).length,2);
console.log('PASS two spaced album story gates, wrong-answer/cheer paths, early completion carryover, unlock and reward idempotence, free transitions and old unlocked saves.');
module.exports={before};
