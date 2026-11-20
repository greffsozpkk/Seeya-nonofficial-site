'use strict';
const assert=require('node:assert/strict');
const B=require('../src/shared/our-stage').forTest();
const M=require('../src/shared/our-stage-leisure')(require('../src/shared/our-stage-first-release')(require('../src/shared/our-stage-simple')(B)));
const T=require('../src/shared/our-stage-test-tools')(M);
const s=T.create('album:lovely-sweet-heart',Date.now());
s.simple.walletOffset+=1000;
let ui,html='',saves=0;
const args={M,root:{querySelector:()=>null,addEventListener:()=>{}},state:()=>s,
 save:()=>saves++,draw:()=>{},dialog:()=>{throw Error('Gacha must not open a dialog');},
 button:(label,a,v='')=>'<button data-action="'+a+'" data-value="'+v+'">'+label+'</button>',
 esc:String,mark:String,locked:f=>f(),sync:()=>{},sprite:()=>'<svg/>',
 cardFace:()=>'<article/>',stageArt:()=>'<figure/>',isCapsulePage:()=>true,
 openCapsulePage:()=>{html=ui.capsulePanel();}};
ui=require('../src/client/our-stage-leisure')(args);
ui.handle('capsule-open','');
assert.match(html,/data-capsule-view="home"/);
const before=M.coins(s);
ui.handle('capsule-pull',String(s.leisure.capsules.pulls));
assert.equal(M.coins(s),before);
assert.match(html,/data-capsule-view="result"/);
const pulls=s.leisure.capsules.pulls;
ui.handle('capsule-pull',String(pulls-1));
assert.equal(s.leisure.capsules.pulls,pulls,'stale click must not charge again');
ui.handle('capsule-pull',String(pulls));
assert.equal(M.coins(s),before-30);
ui.handle('capsule-collection','');
assert.match(html,/data-capsule-view="collection"/);
ui.handle('capsule-detail',s.leisure.capsules.last.item);
assert.match(html,/data-capsule-view="detail"/);
ui.handle('capsule-editor','');
assert.match(html,/data-capsule-view="editor"/);
const card=M.memberCards(s).find(c=>c.earned).id;
const frame=M.capsules.pool.find(i=>i.kind==='frame');
s.leisure.capsules.owned.push(frame.id);
ui.handle('capsule-apply',frame.id+'|'+card);
assert.equal(s.leisure.skins.cards[card].frame,frame.id);
ui.handle('capsule-clear','frame|'+card);
assert.ok(!s.leisure.skins.cards[card]?.frame);
ui.handle('capsule-stage','');
assert.match(html,/data-capsule-view="stage"/);
const stage=M.capsules.pool.find(i=>i.kind==='stage');
s.leisure.capsules.owned.push(stage.id);
ui.handle('capsule-use',stage.id);
assert.equal(s.leisure.skins.stage,stage.id);
const costume=M.capsuleOutfits[0];
s.leisure.capsules.owned.push(costume.reward);
ui.handle('capsule-wear',costume.reward);
assert.match(html,/data-capsule-view="worn"/);
for(const id of costume.members)assert.equal(s.equipped[id],costume.id);
assert.ok(saves>=6);
console.log('Capsule page navigation, free/retry charge, stale click, card/stage decoration and outfit equip passed.');
