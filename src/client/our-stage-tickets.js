'use strict';
const drawTicket=require('./our-stage-ticket-art');
module.exports=function({M,state,root,dialog,button,esc,save}){
 const $=q=>root.querySelector(q);let ticket=null,busy=false;
 function ticketForm(id){const a=M.albumById(id);if(!a||!Boolean(state().simple.concerts[id]))return;dialog(`<small class="eyebrow">CHAPTER TICKET</small><h2>앨범 완주 기념 티켓</h2><p>${esc(a.name)} · 앨범 콘서트 완료</p><p class="growth-help">게임 속 기념 문장 · 한 곡씩 쌓아온 마음이 오늘의 무대를 완성했어요.</p><div class="growth-actions"><a href="/radio/" target="_blank" rel="noopener">라디오로 여운 이어가기 ↗</a><a href="/diary/" target="_blank" rel="noopener">다이어리에 추억 남기기 ↗</a></div><label class="ticket-name">닉네임<input id="ticketNickname" maxlength="24" value="${esc(state().simple.nickname)}" placeholder="익명의 씨야 팬"></label>${button('티켓 이미지 만들기','ticket-render',id,'primary')}`);}
 async function renderTicket(id){
  if(busy)return;const s=state(),a=M.albumById(id),input=$('#ticketNickname');
  if(!a||!s.simple.concerts[id]||!input)return;
  s.simple.nickname=input.value.trim().slice(0,24);if(!save())return;
  busy=true;const trigger=$('[data-action="ticket-render"]');trigger.disabled=true;
  let status=$('#ticketBuildStatus');if(!status){status=document.createElement('p');status.id='ticketBuildStatus';status.setAttribute('role','status');input.closest('label').after(status);}status.textContent='로고와 앨범 의상을 담고 있어요…';
  try{
   const c=await drawTicket({album:a,index:M.albums.indexOf(a),receipt:s.simple.concerts[id],nickname:s.simple.nickname});
   const url=c.toDataURL('image/png'),blob=await new Promise(resolve=>c.toBlob(resolve,'image/png'));
   if(!blob)throw new Error('이미지를 만들지 못했어요.');if(!input.isConnected)return;
   ticket={url,blob,name:'seeya-'+id+'-ticket.png'};
   dialog(`<small class="eyebrow">MY CHAPTER TICKET</small><h2>우리의 무대를 간직해요</h2><img class="stage-ticket-preview" src="${url}" alt="${esc(a.name)} 앨범 완주 기념 티켓"><p>휴대폰에서는 이미지를 길게 눌러 저장할 수 있어요.</p><div class="growth-actions">${button('PNG 저장','ticket-download','','primary')}${button('공유하기','ticket-share')}</div><p id="ticketMessage" role="status"></p>`);
  }catch(e){if(input.isConnected)status.textContent='티켓 이미지를 불러오지 못했어요. 연결을 확인한 뒤 다시 시도해 주세요.';}
  finally{busy=false;if(trigger.isConnected)trigger.disabled=false;}
 }
 function handle(action,id){if(!action.startsWith('ticket-'))return false;if(action==='ticket-open')ticketForm(id);if(action==='ticket-render')return renderTicket(id).then(()=>true);if(action==='ticket-download'&&ticket){const a=document.createElement('a');a.href=ticket.url;a.download=ticket.name;a.click();}if(action==='ticket-share'&&ticket){const file=new File([ticket.blob],ticket.name,{type:'image/png'});if(navigator.canShare?.({files:[file]}))return navigator.share({files:[file],title:'씨야 키우기 앨범 기념 티켓'}).catch(e=>{if(e.name!=='AbortError'&&$('#ticketMessage'))$('#ticketMessage').textContent='PNG 저장이나 이미지 길게 누르기를 이용해 주세요.';}).then(()=>true);$('#ticketMessage').textContent='PNG 저장이나 이미지 길게 누르기를 이용해 주세요.';}return true;}
 return {handle};
};
