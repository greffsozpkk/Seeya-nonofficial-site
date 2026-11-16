'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs');
const M=require('../src/shared/our-stage').forTest(),live=require('../src/shared/our-stage');
const s=M.fresh(1000);assert(M.valid(s));assert.equal(M.coins(s),0);
assert.equal(M.timing.shopMs,1000);assert.equal(live.timing.shopMs,60000);
assert(!M.purchase(s,'stage-sugarman','br'));assert(!M.equip(s,'br','stage-sugarman'));
assert(!M.equip(s,'br','first-mind'));assert(!M.startShopJob(s,-1));
assert(!M.startShopJob(s,1000));s.shopJob={kind:'setup',end:2000}; // Migrated in-flight job.
assert.equal(M.settle(s,1999),0);assert.equal(M.coins(s),0);
let restored=M.loadSave(JSON.stringify(s));assert.equal(M.settle(restored,2000),1);
assert.equal(M.coins(restored),10);assert.equal(M.settle(restored,9000),0);assert.equal(restored.gigs,1);
restored.gigs+=5; // Historical earnings remain spendable.
assert.equal(M.coins(restored),60);
assert(!M.purchase(restored,'no-style','br'));assert(!M.purchase(restored,'stage-sugarman','xx'));
assert(M.purchase(restored,'stage-sugarman','br'));assert.equal(M.coins(restored),0);
assert(!M.purchase(restored,'stage-sugarman','br'));assert(!M.styleOwned(restored,'stage-sugarman','gr'));
assert(M.equip(restored,'br','stage-sugarman'));assert.equal(restored.equipped.gr,'practice');
assert(M.valid(restored));assert.deepEqual(M.loadSave(JSON.stringify(restored)),restored);
for(const mutate of [
 x=>x.purchases.push('stage-seasons:br'),x=>x.purchases.push('stage-sugarman:br'),
 x=>x.equipped.gr='stage-sugarman',x=>x.gigs=-1,x=>x.shopJob={end:'later'}
]){const bad=structuredClone(restored);mutate(bad);assert(!M.valid(bad));assert.throws(()=>M.loadSave(JSON.stringify(bad)));}
const full=structuredClone(require('./check-our-stage-stories').unread);
const earned=M.coins(full);assert(earned>0);
const old={...full,version:4};for(const k of ['purchases','gigs','equipped','shopJob'])delete old[k];
const migrated=M.loadSave(JSON.stringify(old));assert.equal(migrated.version,11);
assert.deepEqual(migrated.collected,full.collected);assert.equal(M.coins(migrated),earned);
const event=M.storyEntries[0];assert(M.cheer(migrated,'story:'+event.id,'좋아요'));
assert.equal(M.coins(migrated),earned+8);assert(M.cheer(migrated,'story:'+event.id,'다시'));
assert.equal(M.coins(migrated),earned+8);
assert(M.equip(migrated,'br',M.albums[1].id));assert(M.equip(migrated,'gr',M.albums[2].id));
assert.notEqual(migrated.equipped.br,migrated.equipped.gr);
assert.equal(new Set(M.storyEntries.map(e=>e.image)).size,20);
for(const e of M.storyEntries)assert(fs.existsSync('.'+e.image),e.image);
for(const o of M.shop){assert(fs.existsSync('.'+o.image));assert.equal(o.members.length,3);assert(o.price>0);assert(o.url.startsWith('https://'));}
console.log('PASS stage shop: migrated progress earnings, legacy in-flight job settlement, once-only rewards, balance, per-member purchases/equipment, invalid backup rejection, 20 distinct scenes.');
module.exports={full:migrated};

