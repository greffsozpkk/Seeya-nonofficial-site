'use strict';
const {filterRadio,cards,selection}=require('../shared/radio');
const rows=JSON.parse(document.getElementById('radioData').textContent);
const player=document.getElementById('radioPlayer'),list=document.getElementById('radioList'),search=document.getElementById('radioSearch'),sort=document.getElementById('radioSort');
let selected=rows[0]?.id,state={member:'전체',query:'',sort:'newest'};
function renderList(){const filtered=filterRadio(rows,state);list.innerHTML=cards(filtered,selected);document.getElementById('radioCount').textContent=filtered.length+'개 영상';}
search.addEventListener('input',()=>{state.query=search.value;renderList();});
sort.addEventListener('change',()=>{state.sort=sort.value;renderList();});
document.querySelectorAll('[data-radio-member]').forEach(button=>button.addEventListener('click',()=>{state.member=button.dataset.radioMember;document.querySelectorAll('[data-radio-member]').forEach(b=>b.setAttribute('aria-pressed',String(b===button)));renderList();}));
list.addEventListener('click',event=>{
 const button=event.target.closest('[data-radio-id]');if(!button)return;
 const row=rows.find(r=>r.id===button.dataset.radioId);if(!row||row.id===selected)return;
 selected=row.id;
 // Replace only the one iframe's URL. Filtering never touches this browsing context.
 player.src='https://www.youtube.com/embed/'+row.videoId+'?rel=0';player.title=row.title;
 document.getElementById('radioCurrent').innerHTML=selection(row);renderList();
 document.getElementById('radioSelectionStatus').textContent=row.title+' 선택됨. 영상의 재생 버튼을 눌러주세요.';
 document.getElementById('radioCurrent').scrollIntoView({block:'start',behavior:'auto'});
});
