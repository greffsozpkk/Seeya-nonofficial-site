'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const M=require('../src/shared/our-stage').forTest(),{unread}=require('./check-our-stage-stories');
const layers=require('../src/data/our-stage-layers.json'),outfits=require('../src/data/our-stage-outfits.json');
const s=structuredClone(unread);s.gigs=100;
for(const o of M.shop)for(const m of M.shopMembers(o))if(!M.styleOwned(s,o.id,m))assert(M.purchase(s,o.id,m));
assert(M.valid(s));
const styles=[...outfits,...M.shop];
for(const m of M.memberIds)for(const clothes of styles)for(const hair of styles){
 if(!M.styleOwned(s,clothes.id,m)||!M.styleOwned(s,hair.id,m))continue;
 const others=M.memberIds.filter(x=>x!==m).map(x=>[x,s.equipped[x],s.hair[x]]);
 assert(M.equipPart(s,m,'clothes',clothes.id));
 assert(M.equipPart(s,m,'hair',hair.id));
 assert.equal(s.equipped[m],clothes.id);assert.equal(s.hair[m],hair.id);
 for(const [id,c,h] of others){assert.equal(s.equipped[id],c);assert.equal(s.hair[id],h);}
 assert(M.valid(s));assert.deepEqual(M.loadSave(JSON.stringify(s)),s);
}
const locked=M.fresh();
assert.equal(M.equipPart(locked,'br','hair','stage-sugarman'),false);
assert.equal(M.equipPart(locked,'br','clothes','first-mind'),false);
assert.equal(M.equipPart(locked,'br','nose','base'),false);
const old=structuredClone(s);old.version=5;delete old.hair;
const migrated=M.loadSave(JSON.stringify(old));assert.equal(migrated.version,11);assert.deepEqual(migrated.hair,old.equipped);
assert.deepEqual(migrated.purchases,old.purchases);assert.deepEqual(migrated.collected,old.collected);assert.equal(M.coins(migrated),M.coins(s));
const invalid=structuredClone(locked);invalid.hair.br='stage-sugarman';assert.equal(M.valid(invalid),false);assert.throws(()=>M.loadSave(JSON.stringify(invalid)));
assert(M.equip(s,'br','base'));assert.equal(s.hair.br,'base');assert.equal(s.equipped.br,'base');
for(const o of styles){
 const a=layers[o.id];assert(a);assert(fs.existsSync(path.join(__dirname,'..',a.image)));
 for(const m of Object.keys(a.members)){const p=a.members[m];for(const box of [p.head,p.body]){assert(box[0]>=0&&box[1]>=0&&box[2]>0&&box[3]>0&&box[0]+box[2]<=a.width&&box[1]+box[3]<=a.height);}assert(p.chin>p.head[1]&&p.chin<p.head[1]+p.head[3]);}
}
const entries=require('../src/data/our-stage-stories.json');
assert.equal(entries.filter(e=>e.wardrobeStatus==='period-reference-event-unconfirmed').length,3);
assert.equal(entries.filter(e=>e.image.endsWith('-period.png')).length,14);
console.log(`PASS modular wardrobe: ${3*styles.length**2} owned outfit/hair combinations, member isolation, v5 migration, backup roundtrip, locked parts, ${styles.length} layer atlases, period-source labels.`);

