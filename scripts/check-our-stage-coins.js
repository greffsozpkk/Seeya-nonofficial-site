'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs');
const M=require('../src/shared/our-stage').forTest(),s=M.fresh();
const before=Date.parse('2026-11-15T14:59:59.999Z'),after=before+1;
assert.equal(M.kstDay(before),'2026-11-15');assert.equal(M.kstDay(after),'2026-11-16');
assert(M.claimDaily(s,before));assert.equal(M.coins(s),20);
assert(!M.claimDaily(s,before));assert(!M.claimDaily(s,before-86400000));
const restored=M.loadSave(JSON.stringify(s));assert(!M.claimDaily(restored,before));assert(M.claimDaily(restored,after));assert.equal(M.coins(restored),40);
for(const bad of [-1,NaN,Infinity,1.5,Number.MAX_SAFE_INTEGER])assert(!M.claimDaily(restored,bad));
for(const daily of [null,[],{count:-1,lastDay:null},{count:1,lastDay:null},{count:0,lastDay:'2026-11-15'},{count:1,lastDay:'2026-02-30'},{count:1,lastDay:'2026-13-01'}])assert(!M.valid({...restored,daily}));
const complete=structuredClone(require('./check-our-stage-cards').complete);complete.gigs=100;M.purchase(complete,'tour-varsity','br');M.equip(complete,'br','tour-varsity');
const balance=M.coins(complete),old={...complete,version:9};delete old.daily;
const migrated=M.loadSave(JSON.stringify(old));assert.equal(migrated.version,11);assert.equal(M.coins(migrated),balance);assert.deepEqual(migrated.purchases,complete.purchases);assert.deepEqual(migrated.equipped,complete.equipped);assert.deepEqual(migrated.collected,complete.collected);
assert(!M.startShopJob(migrated,after,'setup'));assert.equal(M.coins(migrated),balance);assert.deepEqual(M.loadSave(JSON.stringify(migrated)),migrated);
const layers=require('../src/data/our-stage-layers.json');for(const [id,l]of Object.entries(layers)){if(id==='practice')assert(!l.headImage);else{assert(l.headImage.endsWith('-earrings.png'));assert(fs.existsSync('.'+l.headImage));}}
assert(fs.readFileSync('images/game/our-stage/official-lightstick.svg','utf8').includes('씨야 20주년 공식 응원봉'));
console.log('PASS daily KST midnight/idempotence/rollback, v9 wallet migration, preserved historical earnings, 14 accessory heads and original practice.');
