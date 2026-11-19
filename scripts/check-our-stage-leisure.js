'use strict';
const assert=require('node:assert/strict'),base=require('../src/shared/our-stage');
const wrap=B=>require('../src/shared/our-stage-leisure')(require('../src/shared/our-stage-first-release')(require('../src/shared/our-stage-simple')(B)));
const M=wrap(base.forTest()),G=M.play,C=M.capsules,T=require('../src/shared/our-stage-test-tools')(M);
let now=Date.parse('2026-11-19T03:00:00Z'),s=T.create('album:lovely-sweet-heart',now);
assert(M.valid(s));assert.equal(G.bank.length,41);assert.equal(C.pool.length,40);assert.deepEqual(Object.fromEntries(['normal','rare','special'].map(k=>[k,C.pool.filter(i=>i.rarity===k).length])),{normal:14,rare:15,special:11});
const balance=M.coins(s),legacy=JSON.parse(JSON.stringify(s));delete legacy.leisure;const migrated=M.loadSave(JSON.stringify(legacy));assert.equal(M.coins(migrated),balance);assert(M.valid(migrated));
assert(!M.capsuleUnlocked(T.create('album:first-mind',now)));assert(!M.pullCapsule(T.create('album:first-mind',now),now));
let id=G.start(s,'quiz',now);assert(id);const firstIds=s.leisure.play.active.questions.map(q=>q.id);assert.equal(new Set(firstIds).size,3);
for(let i=0;i<3;i++){const a=s.leisure.play.active,q=G.question(a);assert(G.answer(s.leisure.play,id,a.questions[i].order.indexOf(q.answer)));s=M.loadSave(JSON.stringify(s));}
let r=G.finish(s.leisure.play,id);assert.equal(r.reward,20);assert.equal(M.coins(s),balance+20);assert.equal(G.finish(s.leisure.play,id),null);assert(!G.start(s,'quiz',now));
now+=G.cooldown;id=G.start(s,'quiz',now);assert(s.leisure.play.active.questions.every(q=>!firstIds.includes(q.id)));s.leisure.play.active=null;
id=G.start(s,'pairs',now);let a=s.leisure.play.active;assert.equal(new Set(a.deck).size,8);assert(a.deck.every(c=>!c.startsWith('rebloom:')));
for(const card of new Set(a.deck)){const ix=a.deck.map((v,i)=>v===card?i:-1).filter(i=>i>=0);assert(G.flip(s.leisure.play,id,ix[0],now));assert(!G.flip(s.leisure.play,id,ix[0],now));assert(G.flip(s.leisure.play,id,ix[1],now));}
r=G.finish(s.leisure.play,id);assert.equal(r.reward,20);assert(M.valid(s));
const e=M.storyEntries.find(e=>M.storyDone(s,e.id)&&e.image);assert(e);id=G.start(s,'jigsaw',now);assert(id);a=s.leisure.play.active;assert(a.perm.filter((n,i)=>n===i).length<5);assert(!G.swap(s.leisure.play,id,0,0));
s=M.loadSave(JSON.stringify(s));a=s.leisure.play.active;for(let i=0;i<16;i++)if(a.perm[i]!==i)assert(G.swap(s.leisure.play,id,i,a.perm.indexOf(i)));
r=G.finish(s.leisure.play,id);assert.equal(r.reward,20);assert(!G.finish(s.leisure.play,id));
while(s.leisure.play.plays<6){now+=G.cooldown;assert(G.start(s,'quiz',now));s.leisure.play.active=null;}assert(!G.start(s,'pairs',now+G.cooldown));assert(!G.canStart(s,'quiz',now-86400000));now+=86400000;assert(G.start(s,'quiz',now));assert.equal(s.leisure.play.plays,1);s.leisure.play.active=null;
const before=M.coins(s);r=M.pullCapsule(s,now,()=>0);assert(r.free);assert.equal(M.coins(s),before);const first=r.item;r=M.pullCapsule(s,now,()=>0);assert(!r.free);assert.notEqual(r.item,first);assert.equal(M.coins(s),before-30);assert(M.valid(s));assert.deepEqual(M.loadSave(JSON.stringify(s)),s);
const poor=T.create('album:lovely-sweet-heart',now);poor.simple.walletOffset-=M.coins(poor);assert(M.pullCapsule(poor,now,()=>0));assert(!M.pullCapsule(poor,now,()=>0));assert(M.valid(poor));
const g=C.fresh();for(let i=1;i<=30;i++){r=C.pull(g,now,999999,()=>.2);assert(r);if(i===10||i===20)assert.equal(C.byId(r.item).rarity,'rare');if(i===30)assert.equal(C.byId(r.item).rarity,'special');assert(C.valid(g));}assert.equal(g.freePulls,1);assert(!C.pull(g,now-86400000,99999));assert(C.pull(g,now+86400000,0).free);
assert.equal(g.history.length,10);assert(g.tickets>0);const unowned=C.pool.find(i=>!g.owned.includes(i.id)&&g.tickets>=C.cost[i.rarity]);assert(C.exchange(g,unowned.id));assert(!C.exchange(g,unowned.id));assert(C.valid(g));
const rich=T.create('complete',now);rich.simple.walletOffset+=10000;for(let i=0;i<30;i++)assert(M.pullCapsule(rich,now,()=>0));const card=M.memberCards(rich).find(c=>c.earned).id;
for(const item of rich.leisure.capsules.owned){if(C.byId(item).kind!=='outfit')assert(M.applySkin(rich,item,card));assert(M.valid(rich));}assert(!M.applySkin(rich,'missing',card));assert(!M.applySkin(rich,'frame-letter','missing'));assert(M.clearSkin(rich,'frame',card));assert(M.valid(rich));assert.deepEqual(M.loadSave(JSON.stringify(rich)),rich);
// Spending newly earned coins at the existing shop must remain valid after reload.
const shopper=T.create('album:lovely-sweet-heart',now),o=M.shop[0];shopper.simple.walletOffset-=M.coins(shopper);shopper.leisure.play.total=100;shopper.leisure.play.earned=2000;assert(M.purchase(shopper,o.id,'br'));assert(M.valid(shopper));assert.deepEqual(M.loadSave(JSON.stringify(shopper)),shopper);
for(const mutate of [x=>x.leisure.capsules.rareMiss=10,x=>x.leisure.capsules.specialMiss=30,x=>x.leisure.capsules.freePulls=x.leisure.capsules.pulls+1,x=>x.leisure.capsules.owned.push('fake'),x=>x.leisure.capsules.tickets=999999,x=>x.leisure.skins.stage='frame-letter',x=>x.leisure.play.earned=-1,x=>x.leisure.play.plays=7,x=>x.leisure.skins.cards.fake={frame:'frame-letter'}]){const bad=JSON.parse(JSON.stringify(rich));mutate(bad);assert(!M.valid(bad));assert.throws(()=>M.loadSave(JSON.stringify(bad)));}
const prod=wrap(base);assert.equal(prod.play.cooldown,900000);assert.equal(M.play.cooldown,10000);assert(!M.play.canStart(M.fresh(now),'quiz',now));
// Existing unfinished games and their already-counted daily attempt survive the update.
const old=require('../src/shared/our-stage-first-release')(require('../src/shared/our-stage-simple')(base.forTest())),oldSave=require('../src/shared/our-stage-test-tools')(old).create('album:lovely-sweet-heart',now);old.mini.start(oldSave.mini,'pairs',now);const recovered=M.loadSave(JSON.stringify(oldSave));assert(recovered.mini.active);assert.equal(recovered.leisure.play.plays,1);assert(!G.canStart(recovered,'quiz',now));
console.log('PASS leisure: 41 sourced questions, diverse unlocked decks, three games, resume/once-only rewards, shared six/day and cooldown, 40 cosmetics, free/KST/pity/duplicate/exchange, persistence, shop balance and legacy migration.');
