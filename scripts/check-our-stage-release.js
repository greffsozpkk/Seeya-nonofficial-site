const assert=require('node:assert/strict'),fs=require('node:fs');
require('./check-our-stage-wardrobe-review');
const M=require('../src/shared/our-stage').forTest(),art=require('../src/data/our-stage-badge-art.json');
const badges=M.badges(M.fresh());assert.equal(badges.length,49);assert.equal(Object.keys(art.badges).length,49);
// New games start in practice clothes; existing concert equipment remains valid.
const fresh=M.fresh();assert.deepEqual(fresh.equipped,{br:'practice',gr:'practice',yj:'practice'});
assert.deepEqual(fresh.hair,fresh.equipped);
for(const m of M.memberIds){assert(M.styleOwned(fresh,'base',m));assert(M.styleOwned(fresh,'practice',m));assert(M.equip(fresh,m,'base'));}
assert.deepEqual(M.loadSave(JSON.stringify(fresh)),fresh);
assert(!M.badges(fresh).find(b=>b.id==='gyul-star').earned);
const fixtures=require('./check-our-stage-journey');
const earned=s=>M.badges(s).find(b=>b.id==='gyul-star').earned;
assert(!earned(fixtures.checkpoints[1]));assert(earned(fixtures.checkpoints[2]));
assert(earned(M.loadSave(JSON.stringify(fixtures.complete))));
const outfits=require('../src/data/our-stage-outfits.json'),layers=require('../src/data/our-stage-layers.json');
assert.equal(new Set(outfits.map(o=>o.id)).size,10);
for(const id of ['california-dream','brilliant-change']){
 const o=outfits.find(o=>o.id===id);assert(o.wardrobeSource);assert.equal(o.identityReview.status,id==='california-dream'?'stage-checked':'caption-checked');
 for(const [i,m]of M.memberIds.entries())for(const box of [layers[id].members[m].head,layers[id].members[m].body])assert.equal(Math.floor((box[0]+box[2]/2)/512),i);
}
assert.equal(new Set(badges.map(b=>art.badges[b.id].image||art.badges[b.id].sheet+':'+art.badges[b.id].index)).size,49);
for(const b of badges){const a=art.badges[b.id];if(a.image){assert(fs.existsSync('.'+a.image));continue;}assert(a.index>=0&&a.index<24);assert(fs.existsSync('.'+art.sheets[a.sheet]));}
assert.equal(M.members.find(m=>m.id==='yj').name,'김연지');assert(M.members.find(m=>m.id==='yj').fact.startsWith('김연지'));
for(const e of M.storyEntries){assert(e.subject);assert(e.summary);assert(!e.summary.includes('트랙 수집'));if(['event-kairos','event-bcm'].includes(e.id)){assert.equal(e.subject,'남규리');assert(e.summary.startsWith('남규리'));}}
assert(M.storyById('event-kairos').source.includes('imbc.com'));assert(!M.coreCondition('yj').includes('남규리 이야기'));
assert(M.storyById('chapter-rebloom').subject.includes('수미'));
const client=fs.readFileSync('src/client/our-stage.js','utf8');assert(client.includes('description:m.fact'));assert(client.includes('description:e.summary'));assert(client.includes('해금 조건 · '));
console.log('PASS 49 unique badge motifs, stable reward IDs, explicit story subjects/summaries, Gyuri acting awards, Yeonji performance and separate prerequisite labels.');
