'use strict';
const art=require('../data/our-stage-album-keepsakes.json');
module.exports=function({M,state,esc,dialog,save,draw,close}){
 const owned=id=>M.albums.some(a=>a.id===id)&&M.albumUnlocked(state(),id);
 const selected=()=>M.albums.find(a=>a.id===state().displayPoster&&owned(a.id))||M.albums.find(a=>owned(a.id));
 function face(a){const p=art[a.id];return `<span class="album-poster-art" style="--poster-paper:${p.colors[0]};--poster-ink:${p.colors[1]}"><span class="poster-brand"><img src="/images/game/our-stage/card-logo.svg" alt="SEEYA"></span><img class="poster-illustration" src="${p.image}" alt=""><strong>${esc(a.name)}</strong><small>${esc(a.type)}</small></span>`;}
 function markup(){const a=selected();return `<button class="room-album-poster" data-action="room-poster-view" aria-label="${a?esc(a.name)+' 앨범 포스터 크게 보기':'앨범 해금 후 포스터를 걸 수 있어요'}" ${a?'':'disabled'}>${a?face(a):'<span class="poster-empty">ALBUM<br>POSTER</span>'}</button>`;}
 function view(){const a=selected();if(!a)return;dialog(`<div class="room-poster-detail"><small class="eyebrow">OUR ALBUM</small><h2>${esc(a.name)}</h2><div class="room-poster-large">${face(a)}</div></div>`);}
 function open(){const current=selected();dialog(`<div class="room-poster-picker"><small class="eyebrow">OUR ALBUMS</small><h2>연습실에 걸 앨범 포스터</h2><p>앨범을 해금하면 포스터도 함께 열려요.</p><div class="room-poster-grid">${M.albums.map(a=>{const unlocked=owned(a.id),active=current?.id===a.id;return `<button data-action="room-poster-select" data-value="${a.id}" class="${unlocked?'':'is-locked'}" aria-pressed="${active}" aria-label="${esc(a.name)} · ${active?'전시 중':unlocked?'포스터 걸기':'앨범 해금 필요'}" ${unlocked?'':'disabled'}>${face(a)}<span>${active?'전시 중':unlocked?'포스터 걸기':'앨범 해금 후'}</span></button>`;}).join('')}</div></div>`);}
 function choose(id){if(!owned(id))return false;state().displayPoster=id;if(save()){close();draw();}return true;}
 return {markup,open,view,choose,selected};
};
