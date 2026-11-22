'use strict';
const assert=require('node:assert/strict');
const make=test=>require('../src/shared/our-stage-leisure')(require('../src/shared/our-stage-first-release')(require('../src/shared/our-stage-simple')(test?require('../src/shared/our-stage').forTest():require('../src/shared/our-stage'))));
for(const test of [false,true]){
 const M=make(test),s=M.fresh();s.simple.walletOffset=120;
 for(const id of ['boram-still-like-you-hat','boram-hot-girl-yellow-bow']){
  const balance=M.coins(s);
  for(const m of ['gr','yj']){assert(!M.purchase(s,id,m));assert(!M.styleOwned(s,id,m));assert(!M.equipPart(s,m,'hair',id));}
  assert(M.purchase(s,id,'br'));assert.equal(M.coins(s),balance-60);
  assert(!M.purchase(s,id,'br'));assert.equal(M.coins(s),balance-60);
  assert(M.equip(s,'br',id));assert(M.valid(s));
 }
 assert(M.equipPart(s,'br','hair','boram-still-like-you-hat'));
 assert.equal(s.equipped.br,'boram-hot-girl-yellow-bow');
 assert.deepEqual(M.loadSave(JSON.stringify(s)),s);
 const bad=structuredClone(s);bad.purchases[0]='boram-still-like-you-hat:gr';assert(!M.valid(bad));
 const poor=M.fresh();assert(!M.purchase(poor,'boram-hot-girl-yellow-bow','br'));
 if(test){const T=require('../src/shared/our-stage-test-tools')(M),album=T.create('album:california-dream');
  assert(M.styleOwned(album,'boram-still-like-you-hat','br'));assert(!M.purchase(album,'boram-still-like-you-hat','br'));
  assert(M.equip(album,'br','boram-still-like-you-hat'));assert(M.valid(album));assert.deepEqual(M.loadSave(JSON.stringify(album)),album);
 }
}
console.log('PASS Boram shop styles: public/test purchase, balance, member restrictions, separate hair/clothes, backups and existing 2.5 album entitlement.');
