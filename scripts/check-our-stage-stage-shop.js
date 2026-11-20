'use strict';
const assert=require('node:assert/strict');
const make=test=>require('../src/shared/our-stage-leisure')(require('../src/shared/our-stage-first-release')(require('../src/shared/our-stage-simple')(test?require('../src/shared/our-stage').forTest():require('../src/shared/our-stage'))));
const M=make(true),T=require('../src/shared/our-stage-test-tools')(M),now=Date.now(),s=T.create('album:lovely-sweet-heart',now);
assert.equal(M.decorStore.items.length,9);
const old=structuredClone(s);delete old.leisure.decor;const loaded=M.loadSave(JSON.stringify(old));assert.deepEqual(loaded.leisure.decor,M.decorStore.fresh());assert.equal(M.coins(loaded),M.coins(s));
const empty=M.fresh(now);assert(!M.buyDecor(empty,'hall'));assert(!M.equipDecor(s,'hall'));assert(!M.buyDecor(s,'unknown'));
s.simple.walletOffset+=1000;const balance=M.coins(s);assert(M.buyDecor(s,'hall'));assert.equal(M.coins(s),balance-80);assert(!M.buyDecor(s,'hall'));assert.equal(M.coins(s),balance-80);
assert(!M.buyDecor(s,'mic'));assert(M.buyDecor(s,'banner'));for(const id of ['hall','banner'])assert(M.equipDecor(s,id));
assert.deepEqual(s.leisure.decor.equipped,{background:'hall',effect:null,audience:'banner'});assert(M.valid(s));assert.deepEqual(M.loadSave(JSON.stringify(s)),s);
const poor=structuredClone(s);poor.simple.walletOffset-=M.coins(poor);assert.equal(M.coins(poor),0);assert(!M.buyDecor(poor,'rooftop'));assert(M.valid(poor));
for(const mutate of [d=>d.owned.push('hall'),d=>d.owned.push('unknown'),d=>d.equipped.audience='hall',d=>d.equipped.background='rooftop',d=>delete d.equipped.audience]){const bad=structuredClone(s);mutate(bad.leisure.decor);assert(!M.valid(bad));assert.throws(()=>M.loadSave(JSON.stringify(bad)));}
const all=T.create('all-content',now);assert(M.valid(all));assert.equal(M.coins(all),10000);assert(M.memberCards(all).every(c=>c.earned));assert(M.badges(all).every(b=>b.earned));assert(M.storyEntries.every(e=>M.storyDone(all,e.id)));assert(M.albums.every(a=>all.simple.concerts[a.id]?.restored));assert(M.wordTasks.every(q=>all.simple.wordDone[q.track]));assert(M.shop.every(o=>M.memberIds.every(m=>M.styleOwned(all,o.id,m))));assert(M.capsuleOutfits.every(o=>o.members.every(m=>M.styleOwned(all,o.id,m))));assert.deepEqual(M.loadSave(JSON.stringify(all)),all);
for(const id of ['hall','banner'])assert(M.equipDecor(all,id));assert(M.applySkin(all,'stage-blue'));assert.equal(all.leisure.decor.equipped.background,null);assert.equal(all.leisure.decor.equipped.audience,'banner');assert(M.equipDecor(all,'rooftop'));assert.equal(all.leisure.skins.stage,null);assert(!M.clearDecor(all,'prop'));assert(M.clearDecor(all,'audience'));assert.equal(all.leisure.decor.equipped.audience,null);assert(!M.clearDecor(all,'unknown'));assert(M.valid(all));
assert.throws(()=>require('../src/shared/our-stage-test-tools')(make(false)).create('all-content'));
let saves=0,draws=0;const args={M,state:()=>s,button:(n,a,v)=>`<button data-action="${a}" data-value="${v}">${n}</button>`,esc:String,stageArt:()=>'<figure>preview</figure>',save:()=>saves++,draw:()=>draws++,say:()=>{},openShop:()=>{}};
const ui=require('../src/client/our-stage-stage-shop')(args),before=JSON.stringify(s);ui.handle('decor-preview','rooftop');assert.match(ui.panel(),/preview/);assert.equal(JSON.stringify(s),before);ui.handle('decor-buy','rooftop');assert.equal(saves,1);assert.equal(s.leisure.decor.equipped.background,'rooftop');const after=M.coins(s);ui.handle('decor-buy','rooftop');assert.equal(M.coins(s),after);assert.equal(saves,1);assert(M.valid(s));
console.log('PASS stage shop: migration, purchase/dedup/balance, slot ownership, capsule mixing, save roundtrip, preview without purchase and full test unlock with production guard.');

const legacy=structuredClone(s);legacy.leisure.decor.owned.push('mic','speakers','flowers');legacy.leisure.decor.equipped.prop='flowers';delete legacy.leisure.decor.equipped.effect;
const previousCoins=M.coins(s)-140,refunded=M.loadSave(JSON.stringify(legacy));
assert.equal(M.coins(refunded),previousCoins+140);assert.deepEqual(refunded.leisure.decor,s.leisure.decor);
assert.equal(M.coins(M.loadSave(JSON.stringify(refunded))),M.coins(refunded),'refund does not repeat');
assert.equal(M.coins(M.loadSave(JSON.stringify(legacy))),M.coins(refunded),'reimport cannot stack refunds');
const invalid=structuredClone(legacy);invalid.leisure.decor.equipped.prop='hall';assert.throws(()=>M.loadSave(JSON.stringify(invalid)));
assert.doesNotMatch(ui.controls(),/소품/);
console.log('PASS retired props: removed from shop/stage controls, old saves refund 140 coins and roundtrip without repeat refunds.');

const intermediate=structuredClone(s);delete intermediate.leisure.decor.equipped.effect;
assert.deepEqual(M.loadSave(JSON.stringify(intermediate)),s);
const fx=structuredClone(s),start=M.coins(fx);
for(const id of ['petals','confetti','starlight']){assert(M.buyDecor(fx,id));assert(M.equipDecor(fx,id));assert.equal(fx.leisure.decor.equipped.effect,id);}
assert.equal(M.coins(fx),start-155);assert(M.equipDecor(fx,'hall'));assert.equal(fx.leisure.decor.equipped.effect,'starlight');
assert.deepEqual(M.loadSave(JSON.stringify(fx)),fx);assert(M.clearDecor(fx,'effect'));assert.equal(fx.leisure.decor.equipped.effect,null);
for(const id of ['hall','unknown']){const bad=structuredClone(fx);bad.leisure.decor.equipped.effect=id;assert.throws(()=>M.loadSave(JSON.stringify(bad)));}
const unowned=structuredClone(s);unowned.leisure.decor.equipped.effect='petals';assert.throws(()=>M.loadSave(JSON.stringify(unowned)));
console.log('PASS stage effects: legacy migration, one effect per stage, ownership, purchase, clear and save roundtrip.');
