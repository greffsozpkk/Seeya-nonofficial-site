 'use strict';
const assert=require('node:assert/strict'),M=require('../src/shared/our-stage').forTest();
const fixtures=require('./check-our-stage-journey');
const s=structuredClone(fixtures.complete),debut=structuredClone(require('./check-our-stage').complete);
assert.equal(M.memberCards(s).length,36);assert.equal(new Set(M.memberCards(s).map(c=>c.id)).size,36);
assert.equal(M.memberCards(debut).filter(c=>c.earned).length,3);
for(const stage of [M.fresh(),debut,...fixtures.checkpoints.slice(0,5)])for(const id of ['gr','yj','reunion','br'])assert(!M.coreAvailable(stage,id));
// Cross the real timeline thresholds by ordinary collection/practice, without needing future stories for old songs.
let gate=structuredClone(fixtures.checkpoints[4]),time=gate.energyAt+1000;
assert(M.unlockAlbum(gate,'see-you-again'));
const thresholds={gr:5,yj:9,reunion:12,br:15};
for(let n=0;n<=15;n++){
  for(const id of ['gr','yj','reunion','br']){
    assert.equal(M.coreAvailable(gate,id),n>=thresholds[id],id+' threshold '+n);
    if(n===thresholds[id]){assert(M.answer(gate,'story:'+id,M.challenges['story:'+id].answer));assert(M.claim(gate,id));}
  }
  assert(M.valid(gate));if(n===15)break;
  const t=M.albumById('see-you-again').tracks[n],k='song:'+t.id;
  assert(M.answer(gate,k,M.challenges[k].answer));time+=1000;M.settle(gate,time);assert(M.train(gate,t.id,0,time));time+=1000;M.settle(gate,time);
}
let p=structuredClone(fixtures.checkpoints[5]);assert(M.albumUnlocked(p,'see-you-again'));p.flags=p.flags.filter(x=>!['gr','yj','br','reunion'].includes(x));p.proofs=p.proofs.filter(x=>!['story:gr','story:yj','story:br','story:reunion','story:event-wsg','story:event-yeonji-return','story:event-gyulmung'].includes(x));
assert(M.coreAvailable(p,'gr'));assert(!M.coreAvailable(p,'yj'));
for(const id of ['gr','yj','reunion','br']){assert(M.canChallenge(p,'story:'+id));assert(M.answer(p,'story:'+id,M.challenges['story:'+id].answer));assert(M.claim(p,id));assert(M.valid(p));}
assert(!M.finaleReady(debut));assert(!M.finishFinale(debut));assert(M.finaleReady(s));
const n=M.memberCards(s).filter(c=>c.earned).length;assert(M.finishFinale(s));assert(!M.finishFinale(s));assert.equal(M.memberCards(s).filter(c=>c.earned).length,n+3);
s.displayCard='finale:br';assert(M.valid(s));assert.deepEqual(M.loadSave(JSON.stringify(s)),s);
const old=structuredClone(s);old.version=6;old.display='yj';delete old.displayCard;delete old.finale;
const migrated=M.loadSave(JSON.stringify(old));assert.equal(migrated.displayCard,'story:yj');assert.equal(migrated.finale,false);assert.deepEqual(migrated.collected,s.collected);assert.deepEqual(migrated.purchases,s.purchases);assert.deepEqual(migrated.hair,s.hair);
assert(!M.valid({...debut,displayCard:'finale:br'}));assert(!M.valid({...debut,finale:true}));
assert(M.memberCards(s).filter(c=>c.style==='rebloom').every(c=>c.note.includes('재해석')));
console.log('PASS 36 pixel cards, debut without future stories, chronological gates, automatic retroactive album rewards, one-time finale cards, v6 wardrobe/save migration, invalid card display rejection.');
module.exports={complete:s};
