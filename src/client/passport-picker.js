'use strict';
// Editable combobox with manual selection (WAI-ARIA APG).
module.exports=function picker(input,list,info,events,onChoose,esc){
 let matches=[],active=-1;
 const close=()=>{list.hidden=true;input.setAttribute('aria-expanded','false');input.removeAttribute('aria-activedescendant');active=-1;};
 function mark(i){active=i;[...list.children].forEach((el,n)=>el.setAttribute('aria-selected',String(n===i)));if(i>=0){input.setAttribute('aria-activedescendant',list.children[i].id);list.children[i].scrollIntoView({block:'nearest'});}else input.removeAttribute('aria-activedescendant');}
 function show(){const q=input.value.trim().toLowerCase(),terms=q.split(/\s+/).filter(Boolean);const all=events.filter(e=>terms.every(t=>(e.date+' '+e.title+' '+e.venue+' '+(e.city||'')).toLowerCase().includes(t)));matches=all.slice(0,30);active=-1;input.removeAttribute('aria-activedescendant');list.innerHTML=matches.map((e,i)=>`<div role="option" aria-selected="false" id="pp-option-${i}" data-index="${i}"><span>${esc(e.date)}${e.time?' · '+esc(e.time):''}</span><strong>${esc(e.title)}</strong><small>${esc(e.venue||'장소 정보 없음')}</small></div>`).join('');list.hidden=!matches.length;input.setAttribute('aria-expanded',String(!!matches.length));info.textContent=all.length?(all.length>30?`${all.length}개 중 30개 표시 · 검색어로 좁혀 주세요.`:`${all.length}개 일정 · 선택하면 기록에 채워집니다.`):'일치하는 일정이 없어요. 아래에 직접 기록할 수 있습니다.';}
 function choose(i){if(!matches[i])return;const e=matches[i];input.value='';close();onChoose(e);info.textContent='일정을 선택했어요. 제목과 날짜를 확인해 주세요.';}
 input.addEventListener('input',show);input.addEventListener('focus',show);input.addEventListener('click',()=>{if(list.hidden)show();});
 input.addEventListener('keydown',e=>{if(e.key==='ArrowDown'||e.key==='ArrowUp'){e.preventDefault();if(list.hidden)show();if(matches.length)mark(active<0?(e.key==='ArrowDown'?0:matches.length-1):Math.max(0,Math.min(matches.length-1,active+(e.key==='ArrowDown'?1:-1))));}else if(e.key==='Enter'&&!list.hidden){e.preventDefault();if(active>=0)choose(active);}else if(e.key==='Escape'){e.preventDefault();close();}else if(e.key==='Tab')close();});
 input.addEventListener('blur',close);
 list.addEventListener('pointerdown',e=>{if(e.target.closest('[role=option]'))e.preventDefault();});
 list.addEventListener('click',e=>{const row=e.target.closest('[role=option]');if(row)choose(Number(row.dataset.index));});
 return {close};
};
