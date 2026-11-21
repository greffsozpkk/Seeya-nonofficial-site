'use strict';
const giftArt=require('./our-stage-gift-art');
module.exports=function({M,state,wall,cardFace,esc,button,dialog}){
 function card(){return M.memberCards(state()).find(c=>c.id===state().displayCard&&c.earned);}
 function gifts(){return M.gifts(state()).slice().sort((a,b)=>(b.at||0)-(a.at||0)||a.id.localeCompare(b.id)).slice(0,3);}
 function cardMarkup(){const c=card();return c?`<button class="wall-card room-featured-card" data-action="card-detail" data-value="${esc(c.id)}" aria-label="대표 카드 상세 보기">${cardFace(c)}</button>`:'';}
 function giftMarkup(){return gifts().map(g=>`<span class="cabinet-gift" title="${esc(g.label)}">${giftArt(g)}</span>`).join('');}
 function markup(){return `<div class="room-cabinet"><div class="cabinet-miniatures" aria-hidden="true" inert><div class="cabinet-top">${wall.markup()}</div><div class="cabinet-bottom">${giftMarkup()}</div></div><button class="cabinet-open" data-action="room-display" aria-label="연습실 전시장 열기 · 아티스트 패스, 티켓, 선물"><span>전시장</span></button></div>`;}
 function open(){const s=state(),hasTicket=M.albums.some(a=>s.simple.concerts[a.id]);dialog(`<div class="room-display-detail"><small class="eyebrow">OUR MEMORIES</small><h2>연습실 전시장</h2><div class="display-keepsakes">${wall.markup()}</div>${!hasTicket?'<p class="private-note">앨범 콘서트를 마치면 기념 티켓이 놓여요.</p>':''}<h3>최근에 받은 선물</h3><div class="display-gifts">${gifts().map(g=>`<article>${giftArt(g)}<strong>${esc(g.label)}</strong></article>`).join('')||'<p>받은 선물이 이곳에 놓여요.</p>'}</div>${button('선물함 열기','gift-shelf')}</div>`);wall.refresh();}
 return {markup,open,cardMarkup};
};
