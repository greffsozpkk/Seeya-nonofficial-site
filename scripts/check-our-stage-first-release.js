'use strict';
const assert=require('node:assert/strict');
const base=require('../src/shared/our-stage');
const wrap=B=>require('../src/shared/our-stage-first-release')(require('../src/shared/our-stage-simple')(B));
const M=wrap(base.forTest());let now=1800000000000,s=M.fresh(now);
assert(M.valid(s));assert(!s.simple.debuted);assert.equal(s.simple.passIssuedAt,null);
assert(M.trainAll(s,'scent',now));assert(!M.trainAll(s,'scent',now));assert.equal(s.points,100);
s=M.loadSave(JSON.stringify(s));M.settle(s,now+=1000);assert(M.ready(s,'scent'));assert.deepEqual(s.collected,['scent']);
assert(M.finishDebut(s,now));assert(!M.finishDebut(s,now+1));assert(M.valid(s));assert(M.albumUnlocked(s,'first-mind'));assert(M.outfitOwned(s,'first-mind'));assert(M.open(s,'shoes'));
const issued=s.simple.passIssuedAt;s=M.loadSave(JSON.stringify(s));assert.equal(s.simple.passIssuedAt,issued);
assert.equal(M.badges(s).filter(b=>b.id==='trainee-complete'&&b.earned).length,1);
for(const a of M.albums){
 for(const t of a.tracks){if(M.ready(s,t.id))continue;assert(M.trainAll(s,t.id,now));s=M.loadSave(JSON.stringify(s));M.settle(s,now+=3100);assert(M.valid(s),t.id);}
 assert(M.concertReady(s,a.id));assert(M.finishConcert(s,a.id,M.concertTracks(s,a.id),now));assert.equal(s.simple.concerts[a.id].restored,false);
 const before=JSON.stringify(s);assert(!M.restoreTicket(s,a.id,[0,1,2]));assert.equal(JSON.stringify(s),before);
 assert(M.valid(s));assert(M.restoreTicket(s,a.id,[0,1,2,3,4,5,6,7,8]));assert(!M.restoreTicket(s,a.id,[0,1,2,3,4,5,6,7,8]));
}
assert.deepEqual(s.simple.wordDone,{},'lyrics stay optional throughout all eight albums');
for(const o of require('../src/shared/our-stage-test-tools')(M).options())assert(M.valid(require('../src/shared/our-stage-test-tools')(M).create(o.id,now)));
// Production timing: charge remaining lessons once; survive offline chaining and queued recovery.
const P=wrap(base),q=require('../src/shared/our-stage-test-tools')(M).create('album:lovely-sweet-heart',now);
q.points=20;q.energyAt=now;const t=P.albums[1].tracks[0].id,other='shoes';q.tracks[other]=[0,1];
// Use an independent save for the partial-lesson case so completed album receipts stay consistent.
let partial=P.fresh(now);partial.tracks.scent=[0,1];assert(P.trainAll(partial,'scent',now));P.settle(partial,now+1001);assert(P.finishDebut(partial,now+1001));
partial.points=20;partial.energyAt=now;assert(P.trainAll(partial,'shoes',now));assert.equal(partial.points,5);
P.settle(partial,now+5000);assert.equal(partial.points,5);assert.deepEqual(partial.tracks.shoes,[0]);
partial=P.loadSave(JSON.stringify(partial));P.settle(partial,now+15000);assert(P.ready(partial,'shoes'));assert.equal(partial.points,5);assert(P.valid(partial));
partial.tracks.shoes=[0,1];partial.setlist=partial.setlist.filter(id=>id!=='shoes');assert(P.trainAll(partial,'shoes',now+15000));assert.equal(partial.points,0);
assert(P.trainAll(partial,'because',now+15000));assert(!P.trainAll(partial,'because',now+15000));P.settle(partial,now+300000);assert(P.ready(partial,'because'));assert(P.valid(partial));
// Legacy migration preserves coins, optional tasks, existing tickets and issuance timestamp.
const legacy=JSON.parse(JSON.stringify(s));legacy.flags.push('album');legacy.proofs.push('story:album');delete legacy.simple.phaseOne;delete legacy.simple.debuted;delete legacy.simple.passIssuedAt;for(const r of Object.values(legacy.simple.concerts))delete r.restored;
const balance=M.coins(legacy),migrated=M.loadSave(JSON.stringify(legacy));assert.equal(M.coins(migrated),balance);assert(Object.values(migrated.simple.concerts).every(r=>r.restored));assert(M.valid(migrated));
for(const mutate of [x=>x.simple.debuted=false,x=>x.simple.passIssuedAt=-1,x=>x.simple.concerts['first-mind'].restored='yes',x=>x.active={track:'scent',lesson:0,end:now,chain:'yes'}]){const bad=JSON.parse(JSON.stringify(s));mutate(bad);assert(!M.valid(bad));}
console.log('PASS first release: free trainee, once-only debut/pass, chained/partial/queued/offline practice, eight album journeys, optional lyrics/puzzle, all checkpoints, legacy migration and invalid saves.');
