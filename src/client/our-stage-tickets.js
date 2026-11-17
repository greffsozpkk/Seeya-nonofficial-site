'use strict';
const drawTicket=require('./our-stage-ticket-art');
module.exports=function({M,state,root,dialog,button,esc,save}){
 const $=q=>root.querySelector(q);let ticket=null,activeId=null,extra='',sequence=0;
 function nameForm(){return `<div class="ticket-name-form"><label class="ticket-name">티켓에 남길 이름<input id="ticketNickname" maxlength="24" value="${esc(state().simple.nickname)}" placeholder="익명의 씨야 팬"></label><p>처음 한 번 정하면 다음 티켓에도 사용해요. 비워두어도 괜찮아요.</p>${button('이 이름으로 담기','ticket-render',activeId,'primary')}</div>`;}
 async function render(id){const a=M.albumById(id),s=state(),receipt=s.simple.concerts[id],target=$('#ticketCanvasSlot'),version=++sequence;ticket=null;if(!a||!receipt||!target)return;
 target.innerHTML='<p role="status">기념 티켓을 만들고 있어요…</p>';try{const c=await drawTicket({album:a,index:M.albums.indexOf(a),receipt,nickname:s.simple.nickname}),url=c.toDataURL('image/png'),blob=await new Promise(resolve=>c.toBlob(resolve,'image/png'));if(!target.isConnected||version!==sequence)return;if(!blob)throw Error('PNG');ticket={url,blob,name:'seeya-'+id+'-ticket.png'};target.innerHTML=`<img class="stage-ticket-preview" src="${url}" alt="${esc(a.name)} 앨범 완주 기념 티켓"><div class="growth-actions">${button('PNG 저장','ticket-download','','primary')}${button('공유하기','ticket-share')}${button('이름 바꾸기','ticket-edit')}</div><p class="private-note">휴대폰에서는 이미지를 길게 눌러 저장할 수 있어요.</p><p id="ticketMessage" role="status"></p>`;
 }catch{if(target.isConnected&&version===sequence)target.innerHTML='<p role="status">티켓을 불러오지 못했어요. 연결을 확인하고 다시 시도해 주세요.</p>'+button('다시 불러오기','ticket-refresh',id);}}
 function show(id,footer=''){if(!state().simple.concerts[id])return;activeId=id;extra=footer;dialog(`<small class="eyebrow">CURTAIN CALL · CHAPTER TICKET</small><h2>우리의 무대를 간직해요</h2><div id="ticketCanvasSlot"></div><div id="ticketNameSlot">${state().simple.nicknameSet?'':nameForm()}</div>${footer}`);return render(id);}
 function handle(a,id){if(!a.startsWith('ticket-'))return false;if(a==='ticket-open')return show(id)||true;if(a==='ticket-refresh')return render(activeId);if(a==='ticket-edit'){$('#ticketNameSlot').innerHTML=nameForm();$('#ticketNickname').focus();}
 if(a==='ticket-render'){const input=$('#ticketNickname');if(!input)return true;state().simple.nickname=input.value.trim().slice(0,24);state().simple.nicknameSet=true;if(!save())return true;return show(activeId,extra);}
 if(a==='ticket-download'&&ticket){const link=document.createElement('a');link.href=ticket.url;link.download=ticket.name;link.click();}
 if(a==='ticket-share'&&ticket){const file=new File([ticket.blob],ticket.name,{type:'image/png'});if(navigator.canShare?.({files:[file]}))return navigator.share({files:[file],title:'씨야 키우기 앨범 기념 티켓'}).catch(e=>{if(e.name!=='AbortError'&&$('#ticketMessage'))$('#ticketMessage').textContent='PNG 저장이나 이미지 길게 누르기를 이용해 주세요.';});if($('#ticketMessage'))$('#ticketMessage').textContent='PNG 저장이나 이미지 길게 누르기를 이용해 주세요.';}return true;}
 return {handle,show};
};
