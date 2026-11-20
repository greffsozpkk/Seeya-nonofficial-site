'use strict';
const assert=require('node:assert/strict'),B=require('../src/shared/our-stage');
const make=b=>require('../src/shared/our-stage-leisure')(require('../src/shared/our-stage-first-release')(require('../src/shared/our-stage-simple')(b)));
const M=make(B.forTest()),P=make(B),tools=require('../src/shared/our-stage-test-tools')(M),now=1800000000000;
const fresh=M.fresh(now);assert(!M.soloUnlocked(fresh));assert(!M.soloTrain(fresh,M.soloAlbums[0].tracks[0].id,now));assert(!M.finishSoloConcert(fresh,'solo-br',now));
assert.deepEqual(M.soloAlbums.map(a=>a.tracks.length),[16,8,7]);assert.equal(P.soloSeconds,15);
let s=tools.create('solo-start',now),clock=now;
assert(M.soloUnlocked(s));assert(M.memberCards(s).find(c=>c.id==='group:the-fan').earned);assert(!s.solo);assert.equal(M.badges(s).filter(b=>b.id.startsWith('solo-concert-')&&b.earned).length,0);
const group='group:the-fan';assert(M.decorateCard(s,group,'first-practice'));s.displayCard=group;assert(M.valid(s));s=M.loadSave(JSON.stringify(s));assert.equal(s.displayCard,group);assert(M.decorateCard(s,group,'first-practice'));
for(const a of M.soloAlbums){
 assert(!M.soloOpen(s,a.tracks[1].id));assert(!M.finishSoloConcert(s,a.id,clock));
 for(const t of a.tracks){
  clock+=3000;M.settle(s,clock);const balance=s.points;assert(M.soloTrain(s,t.id,clock));assert.equal(s.points,balance-15);assert(!M.soloTrain(s,t.id,clock));assert(!M.trainAll(s,'shoes',clock));
  s=M.loadSave(JSON.stringify(s));const end=s.solo.active.end;assert.equal(end-clock,3000);M.settle(s,end-1);assert(!M.soloDone(s,t.id));clock=end;M.settle(s,clock);assert(M.soloDone(s,t.id));assert(M.valid(s));assert(!M.soloTrain(s,t.id,clock));
 }
 assert(M.soloConcertReady(s,a.id));assert(M.finishSoloConcert(s,a.id,clock));assert(!M.finishSoloConcert(s,a.id,clock+1));assert(M.badges(s).find(b=>b.id==='solo-concert-'+a.member).earned);assert(M.decorateCard(s,group,'solo-concert-'+a.member));assert(M.valid(s));const receipt=structuredClone(s.solo.concerts[a.id]);
 assert(!M.restoreTicket(s,a.id,[0,1,2]));assert(M.restoreTicket(s,a.id,[0,1,2,3,4,5,6,7,8]));assert(!M.restoreTicket(s,a.id,[0,1,2,3,4,5,6,7,8]));s=M.loadSave(JSON.stringify(s));assert.equal(s.solo.concerts[a.id].at,receipt.at);
}
assert.equal(s.solo.done.length,31);assert.equal(Object.keys(s.solo.concerts).length,3);
for(const change of [x=>x.solo.done.push(x.solo.done[0]),x=>x.solo.done.splice(0,1),x=>x.solo.concerts['solo-br'].tracks.pop(),x=>x.solo.active={id:'fake',end:clock},x=>x.solo=null]){const x=structuredClone(s);change(x);assert(!M.valid(x));assert.throws(()=>M.loadSave(JSON.stringify(x)));}
const early=M.fresh(now);early.solo=structuredClone(s.solo);assert(!M.valid(early));assert.throws(()=>M.loadSave(JSON.stringify(early)));
const full=tools.create('all-content',now);assert(M.soloAlbums.every(a=>M.soloConcertReady(full,a.id)&&full.solo.concerts[a.id]));
assert.equal(M.badges(s).filter(b=>b.id.startsWith('solo-concert-')&&b.earned).length,3);
const old=require('../src/data/our-stage-solos-v1.json');
const legacy=tools.create('solo-start',now);
legacy.solo={done:old[0].tracks.slice(0,4).map(t=>t.id),active:null,concerts:{}};
const migrated=M.loadSave(JSON.stringify(legacy));
assert.equal(migrated.solo.catalogVersion,2);assert.equal(migrated.solo.done.length,4);
assert(legacy.solo.done.filter(id=>M.soloTrackById(id)).every(id=>migrated.solo.done.includes(id)));
assert.deepEqual(M.loadSave(JSON.stringify(migrated)),migrated);
legacy.points=60;legacy.solo.active={id:old[0].tracks[4].id,end:now+5000};
const refunded=M.loadSave(JSON.stringify(legacy));assert.equal(refunded.points,75);assert.equal(refunded.solo.active,null);
const invalidLegacy=structuredClone(legacy);invalidLegacy.solo.done.push('unknown');assert.throws(()=>M.loadSave(JSON.stringify(invalidLegacy)));
const completed=tools.create('solo-start',now);
completed.solo={done:old.flatMap(a=>a.tracks.map(t=>t.id)),active:null,concerts:Object.fromEntries(old.map(a=>[a.id,{at:now,serial:'OS-'+a.id+'-'+now,tracks:a.tracks.map(t=>t.id),restored:true}]))};
const carried=M.loadSave(JSON.stringify(completed));assert.equal(carried.solo.done.length,31);
for(const a of M.soloAlbums){assert(M.soloConcertReady(carried,a.id));assert.equal(carried.solo.concerts[a.id].at,now);assert(carried.solo.concerts[a.id].restored);assert(M.badges(carried).find(b=>b.id==='solo-concert-'+a.member).earned);}
console.log('PASS old solo save migration: retained songs, removed-song credit, active-practice refund, ticket/badge preservation and repeated loading.');
console.log('PASS solo chapters: final-concert gate, group card/decorations, 31 sequential tracks, point charges, restart timers, three concerts/tickets, replay dedup, invalid backups and test checkpoints.');
