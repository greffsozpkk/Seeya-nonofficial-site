'use strict';
const assert=require('node:assert/strict'),M=require('../src/shared/our-stage').forTest(),T=require('../src/shared/our-stage-test-tools')(M);
for(const o of T.options()){
 const s=T.create(o.id,10000);assert(M.valid(s),o.id);assert.deepEqual(M.loadSave(JSON.stringify(s)),s);assert(!s.active&&!s.queue&&!s.mini.active);
 if(o.id.startsWith('album:')){assert(M.albumUnlocked(s,o.album));assert.equal(M.albumCount(s,o.album),o.album==='first-mind'?1:0);}
 if(o.id.startsWith('story:')){const id=o.id.slice(6);assert(!s.proofs.includes('story:'+id));assert(M.canChallenge(s,'story:'+id));assert(M.answer(s,'story:'+id,M.challenges['story:'+id].answer));assert(M.valid(s));}
}
assert.throws(()=>T.create('invalid'));assert.throws(()=>require('../src/shared/our-stage-test-tools')(require('../src/shared/our-stage')).create('complete'));
const complete=T.create('complete');assert.equal(M.count(complete),82);assert(M.finaleReady(complete));assert(!complete.finale);
const G=M.mini;
for(const p of G.patterns){const m=G.fresh(),id=G.start(m,'rhythm',10000,()=>.2,p.id);assert(id);assert(G.beginBeat(m,id,10000));assert(G.valid(m));for(const [i,t]of G.offsets(m.active).entries()){assert.equal(G.tap(m,id,m.active.beatStart+t),i+1);assert.equal(G.tap(m,id,m.active.beatStart+t+1),null);}const end=G.endAt(m.active);assert.equal(G.finish(m,id,end-1),null);assert.equal(G.finish(m,id,end).reward,16);assert(!G.finish(m,id,end));}
const old=G.fresh();G.start(old,'rhythm',10000);delete old.active.pattern;assert(G.valid(old));assert.deepEqual(G.offsets(old.active),G.patterns[0].offsets);old.active.pattern='bad';assert(!G.valid(old));assert(!G.start(G.fresh(),'rhythm',10000,Math.random,'bad'));
console.log('PASS 33 test-only checkpoints, playable selected stories, production guard, save roundtrip, three rhythm patterns and old rhythm saves.');
