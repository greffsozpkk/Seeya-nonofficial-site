'use strict';
const assert=require('node:assert/strict'),M=require('../src/shared/our-stage').forTest();
const fixtures=require('./check-our-stage-journey');
const s=structuredClone(fixtures.checkpoints[5]),keys=['gr','yj','reunion','br'];
s.flags=s.flags.filter(id=>!keys.includes(id));s.proofs=s.proofs.filter(k=>!keys.some(id=>k==='story:'+id)&&!['story:event-wsg','story:event-yeonji-return','story:event-gyulmung'].includes(k));
assert(M.albumComplete(s,'see-you-again'));assert(M.valid(s));
assert(!M.albumAvailable(s,'still-here'));assert(!M.unlockAlbum(s,'still-here'));assert(!M.eligible(s,'still-here-01'));assert(!M.storyAvailable(s,'event-wsg'));
for(const id of keys){assert(M.coreAvailable(s,id));assert(M.cheer(s,'story:'+id,'각자의 무대도 응원해요.'));assert(M.claim(s,id));assert(!M.unlockAlbum(s,'still-here'));assert(M.valid(s));}
assert(M.storyAvailable(s,'event-wsg'));const q=M.challenges['story:event-wsg'];assert(!M.answer(s,'story:event-wsg',(q.answer+1)%4));assert(!M.unlockAlbum(s,'still-here'));
assert(M.answer(s,'story:event-wsg',q.answer));for(const id of ['event-yeonji-return','event-gyulmung']){assert(!M.unlockAlbum(s,'still-here'));assert(M.storyAvailable(s,id));assert(M.answer(s,'story:'+id,M.challenges['story:'+id].answer));assert(M.valid(s));}assert(M.albumAvailable(s,'still-here'));assert(M.unlockAlbum(s,'still-here'));assert(!M.unlockAlbum(s,'still-here'));assert(M.eligible(s,'still-here-01'));assert(M.valid(s));
assert.deepEqual(M.loadSave(JSON.stringify(s)),s);
// Saves which had already reached the return are not locked or falsely marked read.
const old=structuredClone(fixtures.complete);old.flags=old.flags.filter(id=>!keys.includes(id));old.proofs=old.proofs.filter(k=>!keys.some(id=>k==='story:'+id)&&!['story:event-wsg','story:event-yeonji-return','story:event-gyulmung'].includes(k));
const restored=M.loadSave(JSON.stringify(old));assert(M.albumUnlocked(restored,'still-here'));assert(M.albumUnlocked(restored,'first-again'));assert(!M.storyDone(restored,'event-wsg'));assert(M.coreAvailable(restored,'gr'));
assert.equal(M.albumRequirements(s,'still-here').length,8);assert(M.albumRequirements(s,'still-here').every(r=>r.done));
console.log('PASS comeback story gate: three members/reunion/WSG mandatory, no early song access, retry/cheer path, once-only unlock and prior unlocked saves preserved.');
module.exports={before:(()=>{const x=structuredClone(fixtures.checkpoints[5]);x.flags=x.flags.filter(id=>!keys.includes(id));x.proofs=x.proofs.filter(k=>!keys.some(id=>k==='story:'+id)&&!['story:event-wsg','story:event-yeonji-return','story:event-gyulmung'].includes(k));return x;})()};
