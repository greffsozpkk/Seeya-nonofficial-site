'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs');
const M=require('../src/shared/our-stage-leisure')(require('../src/shared/our-stage-first-release')(require('../src/shared/our-stage-simple')(require('../src/shared/our-stage').forTest())));
const T=require('../src/shared/our-stage-test-tools')(M),G=M.play,C=require('../src/shared/our-stage-connect');
const render=require('../src/client/our-stage-style-tile'),layers=require('../src/data/our-stage-layers.json');
let seed=42;const random=()=>((seed=(Math.imul(seed,1664525)+1013904223)>>>0)/4294967296);
const boards=new Set(),decks=new Set(),now=Date.parse('2026-11-21T03:00:00Z');
for(let n=0;n<50;n++){
 const c=C.fresh(random),ids=[...new Set(c.board)];assert.equal(ids.length,12);assert.equal(ids.filter(id=>C.tiles[id].part==='clothes').length,6);assert(C.valid(c));boards.add(ids.sort((a,b)=>a-b).join());
 const s=T.create('album:lovely-sweet-heart',now),id=G.start(s,'pairs',now,random),a=s.leisure.play.active;assert(id);
 assert.equal(new Set(a.deck).size,8);assert.equal(a.deck.filter(x=>x.endsWith(':clothes')).length,8);assert(M.valid(s));
 assert.deepEqual(M.loadSave(JSON.stringify(s)).leisure.play.active.deck,a.deck);decks.add([...new Set(a.deck)].sort().join());
 for(const card of new Set(a.deck)){const pair=a.deck.flatMap((x,i)=>x===card?[i]:[]);assert(G.flip(s.leisure.play,id,pair[0],now));assert(G.flip(s.leisure.play,id,pair[1],now));}
 assert.equal(G.finish(s.leisure.play,id).reward,20);assert.equal(G.finish(s.leisure.play,id),null);
}
assert(boards.size>40);assert(decks.size>40);
// Existing head-only saves still load without rerolling.
const old=C.fresh(random);old.board=Array.from({length:12},(_,i)=>[i,i,i,i]).flat();assert(C.valid(old));assert(C.tiles.slice(0,12).every(t=>t.part==='hair'));
const s=T.create('album:lovely-sweet-heart',now);G.start(s,'pairs',now,random);s.leisure.play.active.deck=G.cardPool(s).filter(c=>c.part==='hair').slice(0,8).flatMap(c=>[c.id,c.id]);assert.deepEqual(M.loadSave(JSON.stringify(s)).leisure.play.active.deck,s.leisure.play.active.deck);
assert.equal(new Set(C.tiles.map(t=>t.style)).size,32);
const all=T.create('all-content',now);assert(M.valid(all));assert(G.cardPool(all).some(c=>c.style==='capsule-49days'&&c.part==='clothes'));assert(!G.cardPool(all).some(c=>c.style==='capsule-49days'&&c.member!=='gr'));
for(const t of C.tiles){assert(layers[t.style].members[t.member]);const html=render(t);assert(html.includes('data-part="'+t.part+'"'));assert(html.includes('clip-path='));}
const prize=M.capsules.byId('stage-reunion');assert.equal(prize.rarity,'rare');assert.equal(prize.kind,'stage');
const ready=T.create('album:lovely-sweet-heart',now),choices=M.capsules.pool.filter(i=>i.rarity==='rare');let rolls=[.8,(choices.indexOf(prize)+.5)/choices.length];assert.equal(M.pullCapsule(ready,now,()=>rolls.shift()).item,prize.id);assert(M.applySkin(ready,prize.id));assert.equal(M.loadSave(JSON.stringify(ready)).leisure.skins.stage,prize.id);assert(M.clearSkin(ready,'stage'));assert.equal(ready.leisure.skins.stage,null);
for(const name of ['auditorium-stage','card-back-night','card-back-fan'])assert(fs.existsSync('images/game/our-stage/'+name+'.svg'));
console.log('PASS mixed styles: balanced randomized pools, 50 complete matching games, saved/legacy boards, crop assets, reunion prize/equip/save/default reset.');
