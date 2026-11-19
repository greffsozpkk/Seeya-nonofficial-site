'use strict';
const assert=require('node:assert/strict'),M=require('../src/shared/our-stage-first-release')(require('../src/shared/our-stage-simple')(require('../src/shared/our-stage').forTest()));
const beforeMidnight=Date.parse('2026-11-19T14:59:59Z'),afterMidnight=beforeMidnight+1000;
let s=M.fresh(beforeMidnight),start=M.coins(s);
for(let i=0;i<30;i++)assert(M.claimConcertCoin(s,beforeMidnight));
assert.equal(M.coins(s),start+30);assert.equal(M.concertCoinRemaining(s,beforeMidnight),0);assert(!M.claimConcertCoin(s,beforeMidnight));
s=M.loadSave(JSON.stringify(s));assert.equal(M.concertCoinRemaining(s,beforeMidnight),0,'reload does not reset daily cap');
assert.equal(M.concertCoinRemaining(s,afterMidnight),30);assert(M.claimConcertCoin(s,afterMidnight));assert.equal(M.concertCoinRemaining(s,afterMidnight),29);
assert(!M.claimConcertCoin(s,beforeMidnight),'clock rollback cannot reopen previous day');
const old=JSON.parse(JSON.stringify(s));delete old.simple.concertCoins;const migrated=M.loadSave(JSON.stringify(old));assert.equal(M.coins(migrated),M.coins(s),'migration keeps wallet');assert.equal(M.concertCoinRemaining(migrated,afterMidnight),30);
for(const broken of [{day:'2026-02-30',count:1},{day:null,count:1},{day:'2026-11-19',count:31},{day:'2026-11-19',count:-1},{day:'2026-11-19',count:1.5}]){const bad=structuredClone(s);bad.simple.concertCoins=broken;assert(!M.valid(bad));assert.throws(()=>M.loadSave(JSON.stringify(bad)));}
console.log('PASS concert daily rewards: 30 cap, repeat shows/reload, KST midnight, rollback, migration and invalid backup validation.');
