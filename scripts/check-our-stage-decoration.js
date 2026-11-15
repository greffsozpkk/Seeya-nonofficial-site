'use strict';
const assert=require('node:assert/strict'),M=require('../src/shared/our-stage').forTest();
const s=structuredClone(require('./check-our-stage-cards').complete),c='album:first-mind:br',other='album:first-mind:gr',ids=M.badges(s).filter(b=>b.earned).slice(0,4).map(b=>b.id);
const initial=JSON.stringify({purchases:s.purchases,hair:s.hair,equipped:s.equipped,collected:s.collected});
for(const id of ids.slice(0,3))assert(M.decorateCard(s,c,id));
assert(!M.decorateCard(s,c,ids[3]));assert.deepEqual(s.cardDecorations[c],ids.slice(0,3));
assert(M.decorateCard(s,other,ids[3]));assert.deepEqual(s.cardDecorations[c],ids.slice(0,3));
assert(M.decorateCard(s,c,ids[0]));assert(M.decorateCard(s,c,ids[3]));assert.deepEqual(s.cardDecorations[c],[ids[1],ids[2],ids[3]]);
assert(M.valid(s));assert.deepEqual(M.loadSave(JSON.stringify(s)),s);
assert.equal(JSON.stringify({purchases:s.purchases,hair:s.hair,equipped:s.equipped,collected:s.collected}),initial);
const fresh=M.fresh();assert(!M.decorateCard(fresh,c,ids[0]));assert(!M.decorateCard(s,'unknown',ids[0]));assert(!M.decorateCard(s,c,'unknown'));
const debut=structuredClone(require('./check-our-stage').complete);assert(!M.decorateCard(debut,c,'all-master'));
for(const mutate of [x=>x.cardDecorations[c]=ids,x=>x.cardDecorations[c]=[ids[0],ids[0]],x=>x.cardDecorations.unknown=[ids[0]],x=>x.cardDecorations[c]=['unknown'],x=>x.cardDecorations=[]]){const bad=structuredClone(s);mutate(bad);assert(!M.valid(bad));assert.throws(()=>M.loadSave(JSON.stringify(bad)));}
const old=structuredClone(s);old.version=7;delete old.cardDecorations;const migrated=M.loadSave(JSON.stringify(old));assert.equal(migrated.version,10);assert.deepEqual(migrated.cardDecorations,{});assert.equal(migrated.displayCard,s.displayCard);
console.log('PASS card badges: three-owned-only cap, toggle/remove/replace, per-card isolation, unchanged purchases/wardrobe/progress, v7 migration, backup roundtrip and corrupt decoration rejection.');
module.exports={complete:s};
