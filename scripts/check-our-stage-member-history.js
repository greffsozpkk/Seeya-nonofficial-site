'use strict';
const assert=require('node:assert/strict'),base=require('../src/shared/our-stage').forTest();
const M=require('../src/shared/our-stage-first-release')(require('../src/shared/our-stage-simple')(base));
const tools=require('../src/shared/our-stage-test-tools')(M),geometry=require('../src/shared/our-stage-sprite-geometry'),layers=require('../src/data/our-stage-layers'),anchors=require('../src/data/our-stage-anchors');
const before=tools.create('album:brilliant-change'),after=tools.create('album:rebloom');
const card=s=>M.memberCards(s).find(c=>c.id==='heritage:sumi'),badge=s=>M.badges(s).find(b=>b.id==='all-members-unlocked');
assert(!card(before).earned);assert(!badge(before).earned);assert(card(after).earned);assert(badge(after).earned);
assert.equal(M.memberCards(after).filter(c=>c.member==='sm').length,1);assert.deepEqual(M.memberIds,['br','gr','yj']);assert.equal(M.cardMembers.find(m=>m.id==='sm').name,'수미');
assert(!M.cardOwned(before,'heritage:sumi'));assert(!M.valid({...before,displayCard:'heritage:sumi'}));
after.displayCard='heritage:sumi';assert(M.decorateCard(after,'heritage:sumi','all-members-unlocked'));assert(M.valid(after));assert.deepEqual(M.loadSave(JSON.stringify(after)),after);
const old=JSON.parse(JSON.stringify(after));old.displayCard=null;delete old.cardDecorations['heritage:sumi'];assert(card(M.loadSave(JSON.stringify(old))).earned,'existing Rebloom players receive the card retroactively');
for(const hair of Object.keys(layers))for(const clothes of Object.keys(layers))for(const member of M.memberIds){
 const g=geometry(member,hair,clothes,layers),h=layers[hair].members[member],b=layers[clothes].members[member],ha=anchors[hair][member].head,na=anchors[clothes][member].neck;
 const hx=g.headX+(ha[0]-h.head[0])*g.hw/h.head[2],nx=g.bodyX+(na[0]-b.body[0])*g.bw/b.body[2];
 assert(Math.abs(hx-nx)<.001,'chin/neck alignment '+hair+' '+clothes+' '+member);
 assert(Math.abs(g.headY+(ha[1]-h.head[1])*g.hh/h.head[3]-345)<.001);
 assert(Math.abs(g.bodyY+(na[1]-b.body[1])*g.bh/b.body[3]-340)<.001);
 assert(Object.values(g).every(Number.isFinite));
}
console.log('PASS member history: Rebloom unlock, one Sumi card, four-member keepsake badge, display/decorate/backup/migration; 768 mixed wardrobe chin/neck alignments.');
