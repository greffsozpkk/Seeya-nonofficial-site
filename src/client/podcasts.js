'use strict';
const {current,frame}=require('../shared/radio-podcasts');
const data=document.getElementById('podcastData');
if(data){
 const rows=JSON.parse(data.textContent);let selected=rows[0];
 const byId=id=>document.getElementById(id);
 function select(row,reload=false){
  if(!row||(!reload&&row.id===selected?.id))return;
  selected=row;
  // Destroy the previous browsing context before mounting the new player.
  byId('podcastFrame').replaceChildren();
  byId('podcastFrame').innerHTML=frame(row);
  byId('podcastCurrent').innerHTML=current(row);
  byId('podcastOriginal').href=row.url;
  byId('podcastArchive').href='/archive/?record='+encodeURIComponent(row.id);
  byId('podcastStatus').textContent='플레이어 안의 재생 버튼을 눌러주세요.';
  for(const button of document.querySelectorAll('[data-podcast-id]')){
   const active=button.dataset.podcastId===row.id;
   button.setAttribute('aria-pressed',String(active));button.textContent=active?'선택됨':'선택';
   button.closest('.radio-item').classList.toggle('is-selected',active);
  }
 }
 byId('podcastList').addEventListener('click',event=>{const button=event.target.closest('[data-podcast-id]');if(button)select(rows.find(row=>row.id===button.dataset.podcastId));});
 byId('podcastReload')?.addEventListener('click',()=>select(selected,true));
}
