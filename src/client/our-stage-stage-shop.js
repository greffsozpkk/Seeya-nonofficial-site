'use strict';
module.exports=function({M,state,button,esc,stageArt,save,draw,say,openShop,focusPreview}){
 const D=M.decorStore,art=require('./our-stage-decor-art');let selected=null,filter='all';
 function panel(){const s=state(),i=D.byId(selected),owned=i&&s.leisure.decor.owned.includes(i.id);
  if(i){const preview={...s.leisure.decor.equipped,[i.slot]:i.id},wearing=s.leisure.decor.equipped[i.slot]===i.id;return `<section class="decor-detail"><div class="action-row">${button('← 무대 상품 목록','decor-list')}</div><small class="eyebrow">${D.slots[i.slot]} · 미리보기</small><h3>${esc(i.name)}</h3>${stageArt(false,false,0,null,'',false,false,preview)}<p>${esc(i.description)}</p><div class="decor-buy-row"><strong>${owned?'보유 중':i.price+'코인'}</strong>${button(owned?(wearing?'사용 중':'무대에 적용'):'구매하고 적용 · '+i.price+'코인',owned?'decor-equip':'decor-buy',i.id,'primary',owned?wearing:M.coins(s)<i.price||!s.simple.debuted)}</div>${!owned&&M.coins(s)<i.price?'<p class="private-note">'+(i.price-M.coins(s))+'코인이 더 필요해요.</p>':''}</section>`;}
  return `<div class="badge-filters decor-filters" aria-label="무대 상품 종류">${[['all','전체'],...Object.entries(D.slots)].map(([id,label])=>button(label,'decor-filter',id,filter===id?'primary':'')).join('')}</div><div class="decor-shop-grid">${D.items.filter(i=>filter==='all'||i.slot===filter).map(i=>`<button class="decor-shop-card" data-action="decor-preview" data-value="${i.id}" aria-label="${esc(i.name)} 미리보기"><div class="decor-shop-art">${art.thumbnail(i.id)}</div><small>${D.slots[i.slot]}</small><strong>${esc(i.name)}</strong><span>${s.leisure.decor.owned.includes(i.id)?'보유 중':i.price+'코인'}</span></button>`).join('')}</div>`;
 }
 function controls(){const s=state();return `<div class="decor-equipped">${Object.entries(D.slots).map(([slot,label])=>`<section><h3>${label}</h3><div class="decor-options">${button(slot==='background'?'기본 무대':'없음','decor-clear',slot,!s.leisure.decor.equipped[slot]&&(slot!=='background'||!s.leisure.skins.stage)?'primary':'')}${D.items.filter(i=>i.slot===slot&&s.leisure.decor.owned.includes(i.id)).map(i=>`<button data-action="decor-equip" data-value="${i.id}" aria-pressed="${s.leisure.decor.equipped[slot]===i.id}">${esc(i.name)}</button>`).join('')}</div></section>`).join('')}</div><div class="growth-actions">${button('무대 상점 둘러보기','decor-shop')}</div>`;}
 function handle(a,v){if(!a.startsWith('decor-'))return false;
  if(a==='decor-shop'){selected=null;openShop();return true;}
  if(a==='decor-preview'){if(D.byId(v)){selected=v;draw();focusPreview?.();}return true;}
  if(a==='decor-list'){selected=null;draw();return true;}
  if(a==='decor-filter'){if(v==='all'||Object.hasOwn(D.slots,v)){filter=v;selected=null;draw();}return true;}
  if(a==='decor-buy'){if(M.buyDecor(state(),v)){M.equipDecor(state(),v);save();draw();say('구매한 장식을 무대에 적용했어요.');}else{draw();say('보유 코인과 구매 상태를 다시 확인해 주세요.');}return true;}
  if(a==='decor-equip'&&M.equipDecor(state(),v)){save();draw();say('무대 장식을 바꿨어요.');}
  if(a==='decor-clear'&&M.clearDecor(state(),v)){save();draw();say('무대 장식을 정리했어요.');}
  return true;
 }
 return {panel,controls,handle};
};
