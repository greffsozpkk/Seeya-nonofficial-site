'use strict';
const assert=require('node:assert/strict');
const M=require('../src/shared/our-stage').forTest(),live=require('../src/shared/our-stage');
const s=M.fresh(1000);
assert.equal(M.shopJobs.length,4);
let expected=0,now=1000;
for(const j of M.shopJobs){
 assert.equal(j.seconds,1);assert(live.shopJobById(j.id).seconds>1);
 assert(M.startShopJob(s,now,j.id));
 assert(!M.startShopJob(s,now,M.shopJobs.find(other=>other.id!==j.id).id));
 assert.equal(M.settle(s,now+999),0);assert.equal(M.coins(s),expected);
 const restored=M.loadSave(JSON.stringify(s));assert.equal(M.settle(restored,now+1000),1);
 expected+=j.reward;assert.equal(M.coins(restored),expected);
 assert.equal(M.settle(restored,now+9999),0);assert.equal(M.coins(restored),expected);
 Object.assign(s,restored);now+=10000;
}
assert.deepEqual(s.jobCounts,{soundcheck:1,lightstick:1,poster:1});assert.equal(s.gigs,1);
assert(!M.startShopJob(s,now,'missing'));assert(!M.startShopJob(s,Number.MAX_SAFE_INTEGER,'setup'));
for(const change of [x=>x.jobCounts.soundcheck=-1,x=>x.jobCounts.poster=1.2,x=>x.jobCounts.extra=100,x=>x.jobCounts=null,x=>x.shopJob={kind:'missing',end:now},x=>x.shopJob={end:now}]){
 const bad=structuredClone(s);change(bad);assert(!M.valid(bad));assert.throws(()=>M.loadSave(JSON.stringify(bad)));
}
// Preserve already earned/spent coins, mixed outfits, and an in-flight old job.
const old=M.fresh(1000);old.gigs=20;assert(M.purchase(old,'stage-sugarman','br'));assert(M.equipPart(old,'br','hair','stage-sugarman'));
old.version=8;delete old.jobCounts;old.shopJob={end:2000};
const migrated=M.loadSave(JSON.stringify(old));assert.equal(migrated.version,9);
assert.equal(M.coins(migrated),140);assert.deepEqual(migrated.purchases,old.purchases);assert.deepEqual(migrated.hair,old.hair);
assert.equal(migrated.shopJob.kind,'setup');assert.equal(M.settle(migrated,2000),1);assert.equal(M.coins(migrated),150);assert.equal(M.settle(migrated,3000),0);
for(const id of ['tour-encore','tour-believe'])for(const m of M.memberIds){
 const rich=M.fresh();rich.gigs=100;assert(M.purchase(rich,id,m));assert(!M.purchase(rich,id,m));
 assert(M.equipPart(rich,m,'clothes',id));assert.equal(rich.hair[m],'practice');assert(M.equipPart(rich,m,'hair',id));
 assert.deepEqual(M.loadSave(JSON.stringify(rich)),rich);
}
console.log('PASS 4 backstage jobs, 1-second boundary, reload and once-only rewards, one active activity, v8 balance/purchase migration, malformed saves and 6 new member purchases.');
