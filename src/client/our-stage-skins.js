'use strict';
const C=require('../shared/our-stage-capsules');
function attributes(slots={}){const f=C.byId(slots.frame),b=C.byId(slots.background);return `data-skin-frame="${f?.motif||''}" data-skin-back="${b?.motif||''}" style="${f?'--skin-frame:'+f.color+';--skin-frame-paper:'+f.paper+';':''}${b?'--skin-back:'+b.color+';--skin-back-paper:'+b.paper+';':''}"`;}
const star='<path d="M0-14 4-4 14 0 4 4 0 14-4 4-14 0-4-4Z"/>';
const flower='<g><circle cx="0" cy="-9" r="7"/><circle cx="9" cy="-2" r="7"/><circle cx="6" cy="9" r="7"/><circle cx="-6" cy="9" r="7"/><circle cx="-9" cy="-2" r="7"/><circle r="4" fill="#fff1c5"/></g>';
const ribbon='<path d="M0 0-15-10-16 9 0 2 16 9 15-10Z"/><path d="M-3 2-9 24 0 19 8 25 4 2Z"/><rect x="-4" y="-4" width="8" height="8" rx="2" fill="#fff0cf"/>';
const record='<circle r="17" fill="#393149"/><g fill="none" stroke="#cab4db" stroke-width="1"><circle r="13"/><circle r="10"/></g><circle r="6" fill="#d9b4dc"/><circle r="2" fill="#fff5d7"/>';
function frame(id){const i=C.byId(id);if(!i||i.kind!=='frame')return '';const m=i.motif;let decor='';
 const at=(x,y,art,rotate=0)=>`<g transform="translate(${x} ${y}) rotate(${rotate})">${art}</g>`;
 if(['blossom','ribbon'].includes(m))decor=at(18,26,flower)+at(282,26,flower)+at(18,454,flower)+at(282,454,flower)+(m==='ribbon'?at(150,462,ribbon):'');
 if(['vinyl','record'].includes(m))decor=at(20,25,record)+at(280,454,record)+'<path d="M8 52v370M292 52v370" stroke-dasharray="3 7"/>';
 if(['stars','twinkle','encore'].includes(m))decor=at(20,25,star)+at(280,25,star)+at(20,455,star)+at(280,455,star)+'<path d="M35 12h230M35 468h230" fill="none"/>'+(m==='encore'?'<path d="m122 18 7-10 11 9 10-15 10 15 11-9 7 10v8h-56Z"/>':'');
 if(['letter','confetti'].includes(m))decor=at(20,24,ribbon)+at(280,450,ribbon,180)+(m==='confetti'?'<path d="M10 60h8v12h-8zm272 36h8v12h-8zM10 350h8v12h-8zm272 40h8v12h-8z"/>':'');
 if(m==='ticket')decor='<path d="M5 75h290M5 425h290" fill="none" stroke-dasharray="3 6"/><circle cx="0" cy="75" r="10" fill="#f5ede7"/><circle cx="300" cy="75" r="10" fill="#f5ede7"/><path d="M25 460h250" stroke-width="8" stroke-dasharray="2 4 1 3"/>';
 if(m==='piano')decor=Array.from({length:20},(_,n)=>`<rect x="${n*15}" y="459" width="14" height="21" fill="#fff8e9"/>${n%7!==2&&n%7!==6?`<rect x="${n*15+10}" y="459" width="8" height="12" fill="#302d3d"/>`:''}`).join('');
 if(m==='varsity')decor='<path d="M5 12h290M5 20h290M5 460h290M5 468h290" stroke="#fff3d4" stroke-width="3"/><path d="M282 90v280" stroke-dasharray="2 18" stroke-width="5"/>';
 return `<svg class="card-frame-art" viewBox="0 0 300 480" preserveAspectRatio="none" aria-hidden="true" fill="${i.color}" stroke="${i.color}"><rect x="7" y="7" width="286" height="466" rx="3" fill="none" stroke-width="2"/>${decor}</svg>`;
}
const stageSet=()=>'<div class="capsule-scenery" aria-hidden="true"><div class="scenery-led"><i></i><i></i><i></i></div><div class="scenery-curtain left"></div><div class="scenery-curtain right"></div><div class="scenery-valance"></div><div class="scenery-truss"></div><div class="scenery-lamps"><i></i><i></i><i></i><i></i><i></i></div><div class="scenery-risers"></div><div class="scenery-floor"></div></div>';
function stageAttributes(i){return `data-stage-skin="${i.motif}" style="--skin-stage:${i.color};--skin-stage-dark:${i.paper}"`;}
module.exports={attributes,frame,stageSet,stageAttributes};
