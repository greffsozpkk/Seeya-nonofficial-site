'use strict';
module.exports=function(M){
 const drive=require('./our-stage-drive'),decorStore=require('./our-stage-stage-shop');
 const play=require('./our-stage-play')(M),capsules=require('./our-stage-capsules');
 const migrate=s=>{if(s.leisure===undefined)s.leisure={version:2,play:play.fresh(s.mini),capsules:capsules.fresh(),skins:{cards:{},stage:null}};if(s.leisure?.version===1){for(const slots of Object.values(s.leisure.skins?.cards||{})){if(slots.effect){if(!s.leisure.capsules?.owned?.includes(slots.effect)||!['effect-petals','effect-record','effect-twinkle','effect-confetti'].includes(slots.effect))throw Error('Invalid old effect');if(!slots.frame)slots.frame=slots.effect;delete slots.effect;}}s.leisure.version=2;}if(s.leisure.decor===undefined)s.leisure.decor=decorStore.fresh();else s.leisure.decor=decorStore.migrate(s.leisure.decor);if(s.leisure.drive===undefined)s.leisure.drive=drive.fresh();return s;};
 const net=s=>s.leisure.play.earned+s.leisure.drive.earned-(s.leisure.capsules.pulls-s.leisure.capsules.freePulls)*capsules.price-decorStore.spent(s.leisure.decor);
 const coins=s=>M.coins(s)+net(s);
 const owns=(s,id)=>s.leisure.capsules.owned.includes(id);
 function ownStateValid(s){try{const l=s.leisure;if(!l||l.version!==2||!play.valid(l.play,s)||!drive.valid(l.drive)||!decorStore.valid(l.decor)||!capsules.valid(l.capsules)||!l.skins||!l.skins.cards||typeof l.skins.cards!=='object'||Array.isArray(l.skins.cards))return false;
 if(l.skins.stage!==null&&l.decor.equipped.background!==null)return false;
 if(l.skins.stage!==null&&(!owns(s,l.skins.stage)||capsules.byId(l.skins.stage)?.kind!=='stage'))return false;
 return Object.entries(l.skins.cards).every(([id,slots])=>M.cardOwned(s,id)&&slots&&typeof slots==='object'&&!Array.isArray(slots)&&Object.entries(slots).every(([kind,item])=>['frame','background'].includes(kind)&&owns(s,item)&&capsules.byId(item)?.kind===kind));
 }catch{return false;}}
 const adjusted=s=>({...s,simple:{...s.simple,walletOffset:s.simple.walletOffset+net(s)}});
 const valid=s=>ownStateValid(s)&&M.valid(adjusted(s));
 function loadSave(raw){if(typeof raw!=='string'||raw.length>512000)throw Error('Invalid leisure save');let s=JSON.parse(raw);if(s?.leisure===undefined)return migrate(M.loadSave(raw));migrate(s);if(!ownStateValid(s))throw Error('Invalid leisure data');const offset=s.simple.walletOffset;s=M.loadSave(JSON.stringify(adjusted(s)));s.simple.walletOffset=offset;if(!valid(s))throw Error('Invalid leisure save');return s;}
 const fresh=now=>migrate(M.fresh(now));
 function purchase(s,id,member){const o=M.shopById(id);if(!o||!M.memberIds.includes(member)||s.purchases.includes(id+':'+member)||coins(s)<o.price)return false;s.purchases.push(id+':'+member);return true;}
 const capsuleUnlocked=s=>Boolean(s.simple.concerts['first-mind']);
 const pull=(s,now=Date.now(),random=Math.random)=>capsuleUnlocked(s)?capsules.pull(s.leisure.capsules,now,coins(s),random):null;
 const exchange=(s,id)=>capsuleUnlocked(s)&&capsules.exchange(s.leisure.capsules,id);
 function applySkin(s,id,card=null){const item=capsules.byId(id);if(!item||!owns(s,id))return false;if(item.kind==='stage'){s.leisure.skins.stage=id;s.leisure.decor.equipped.background=null;return true;}if(item.kind==='outfit'||!M.cardOwned(s,card))return false;s.leisure.skins.cards[card]??={};s.leisure.skins.cards[card][item.kind]=id;return true;}
 function clearSkin(s,kind,card=null){if(kind==='stage'){s.leisure.skins.stage=null;s.leisure.decor.equipped.background=null;return true;}if(!['frame','background'].includes(kind)||!M.cardOwned(s,card))return false;if(s.leisure.skins.cards[card]){delete s.leisure.skins.cards[card][kind];if(!Object.keys(s.leisure.skins.cards[card]).length)delete s.leisure.skins.cards[card];}return true;}
 function buyDecor(s,id){const i=decorStore.byId(id);if(!s.simple.debuted||!i||s.leisure.decor.owned.includes(id)||coins(s)<i.price)return false;s.leisure.decor.owned.push(id);return true;}
 function equipDecor(s,id){const i=decorStore.byId(id);if(!i||!s.leisure.decor.owned.includes(id))return false;s.leisure.decor.equipped[i.slot]=id;if(i.slot==='background')s.leisure.skins.stage=null;return true;}
 function clearDecor(s,slot){if(!Object.hasOwn(decorStore.slots,slot))return false;s.leisure.decor.equipped[slot]=null;if(slot==='background')s.leisure.skins.stage=null;return true;}
 return {...M,earnings:s=>({...M.earnings(s),mini:M.earnings(s).mini+s.leisure.play.earned+s.leisure.drive.earned}),coins,purchase,fresh,valid,loadSave,play,drive,decorStore,buyDecor,equipDecor,clearDecor,capsules,capsuleUnlocked,pullCapsule:pull,exchangeCapsule:exchange,applySkin,clearSkin};
};
