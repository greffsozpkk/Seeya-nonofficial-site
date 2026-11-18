'use strict';
const drawTicket=require('./our-stage-ticket-art'),art=require('./our-stage-keepsake-art');
module.exports=function({M,state,root,dialog,button,esc,save,draw}){
 const $=q=>root.querySelector(q);let ticket=null,activeId=null,extra='',sequence=0,mode='ticket',puzzle=null;
 async function render(name){const s=state(),target=$('#ticketCanvasSlot'),version=++sequence;if(!target)return;
 const preview=target.querySelector('.stage-ticket-preview');
 if(!preview){ticket=null;target.innerHTML='<p role="status">기념 이미지를 만들고 있어요…</p>';}
 try{const a=M.albumById(activeId),c=mode==='pass'?await art.drawPass({nickname:name??s.simple.nickname,issuedAt:s.simple.passIssuedAt}):await drawTicket({album:a,index:M.albums.indexOf(a),receipt:s.simple.concerts[activeId],nickname:s.simple.nickname});
 const url=c.toDataURL('image/png'),blob=await new Promise(resolve=>c.toBlob(resolve,'image/png'));if(!blob)throw Error('PNG');
 // Decode offscreen while the previous pass stays visible, including its download controls.
 const ready=new Image();ready.src=url;await ready.decode();
 if(!target.isConnected||version!==sequence)return;
 ticket={url,blob,name:mode==='pass'?'seeya-artist-pass.png':'seeya-'+activeId+'-ticket.png'};
 if(preview){preview.src=url;return;}
 target.innerHTML=`<img class="stage-ticket-preview ${mode==='pass'?'artist-pass-preview':''}" src="${url}" alt="${mode==='pass'?'씨야 아티스트 패스':esc(a.name)+' 앨범 기념 티켓'}"><div class="growth-actions">${button('PNG 저장','ticket-download','','primary')}${button('공유하기','ticket-share')}</div><p class="private-note">휴대폰에서는 이미지를 길게 눌러 저장할 수 있어요.</p><p id="ticketMessage" role="status"></p>`;
 }catch{if(target.isConnected&&version===sequence){if(preview){const status=$('#passNameStatus')||$('#ticketMessage');if(status)status.textContent='이름은 저장됐지만 이미지 갱신에 실패했어요. 다시 저장해 주세요.';}else target.innerHTML='<p role="status">이미지를 불러오지 못했어요.</p>'+button('다시 불러오기','ticket-refresh');}}}
 function show(id,footer=''){if(!state().simple.concerts[id])return;mode='ticket';activeId=id;extra=footer;puzzle=null;
 dialog(`<small class="eyebrow">CURTAIN CALL · CHAPTER TICKET</small><h2>우리의 무대를 간직해요</h2><div id="ticketCanvasSlot"></div><div class="ticket-extras">${button(state().simple.concerts[id].restored?'그림 다시 맞추기':'티켓 그림 맞추기 · 선택','ticket-puzzle',id)}${state().simple.concerts[id].restored?'<span class="restored-seal">✦ 그림 복원 완료</span>':''}<p>퍼즐을 풀지 않아도 티켓을 저장하고 다음 앨범으로 갈 수 있어요.</p>${button('패스에서 이름 바꾸기','pass-open')}</div>${footer}`);return render();}
 function showPass(footer=''){if(!state().simple.debuted)return;mode='pass';extra=footer;puzzle=null;
 dialog(`<small class="eyebrow">OUR STAGE · ARTIST PASS</small><h2>${footer?'첫 무대, 우리의 시작':'나의 아티스트 패스'}</h2><p>세 목소리와 함께한 여정에 이름을 남겨주세요.</p><label class="ticket-name">함께한 팬<input id="passNickname" maxlength="24" value="${esc(state().simple.nickname)}" placeholder="익명의 씨야 팬"></label>${button('이름 저장','pass-name-save')}<span id="passNameStatus" role="status"></span><div id="ticketCanvasSlot"></div><p class="private-note">이름 저장을 누르면 패스와 앨범 티켓에 함께 반영돼요.</p>${footer}`);
 return render();}
 async function openPuzzle(id){if(!state().simple.concerts[id])return;const footer=extra;dialog('<h2>티켓 그림 맞추기</h2><p id="puzzleLoading">그림을 불러오고 있어요…</p>');const loading=$('#puzzleLoading');const version=++sequence;const c=await art.panel(id);if(version!==sequence||!loading.isConnected||!$('#stageModal').open)return;const perm=[0,1,2,3,4,5,6,7,8];for(let i=8;i>0;i--){const j=Math.floor(Math.random()*(i+1));[perm[i],perm[j]]=[perm[j],perm[i]];}while(perm.filter((v,i)=>v===i).length>3)perm.push(perm.shift());puzzle={id,perm,selected:null,url:c.toDataURL(),footer};renderPuzzle();}
 function renderPuzzle(){const p=puzzle;if(!p)return;const done=p.perm.every((v,i)=>v===i),count=p.perm.filter((v,i)=>v===i).length;
 dialog(`<small class="eyebrow">A PIECE OF OUR STAGE · 선택</small><h2>${done?'한 장의 기억이 완성됐어요':'티켓 그림 맞추기'}</h2><p>조각 두 개를 차례로 누르면 자리가 바뀝니다.</p><div class="ticket-puzzle" aria-label="티켓 그림 9조각">${p.perm.map((v,i)=>`<button data-action="ticket-piece" data-value="${i}" aria-label="${i+1}번 자리 · 그림 ${v+1}번 조각${v===i?' · 맞는 자리':''}" aria-pressed="${p.selected===i}" ${done?'disabled':''} style="background-image:url('${p.url}');background-position:${v%3*50}% ${Math.floor(v/3)*50}%"><span>${i+1}</span></button>`).join('')}</div><p role="status">${done?'✦ 그림 복원 완료':count+' / 9조각이 제자리에 있어요.'}</p><details class="puzzle-guide"><summary>완성 그림 보기</summary><img src="${p.url}" alt="맞출 그림 전체"></details><div class="growth-actions">${button(done?'기념 티켓 보기':'나중에 하고 티켓 보기','ticket-puzzle-back',p.id,'primary')}</div>`);}
 function handle(a,id){if(!a.startsWith('ticket-')&&!a.startsWith('pass-'))return false;
 if(a==='ticket-open')return show(id)||true;if(a==='pass-open')return showPass()||true;
 if(a==='pass-name-save'){state().simple.nickname=$('#passNickname').value.trim().slice(0,24);state().simple.nicknameSet=true;if(save()){$('#passNameStatus').textContent='이름을 저장했어요.';const wall=$('.wall-pass small');if(wall)wall.textContent=state().simple.nickname||'OUR STAGE';return render();}return true;}
 if(a==='ticket-refresh')return render();if(a==='ticket-puzzle')return openPuzzle(id);
 if(a==='ticket-puzzle-back'){const footer=puzzle?.footer||'';puzzle=null;return show(id,footer);}
 if(a==='ticket-piece'&&puzzle){const i=Number(id);if(!Number.isInteger(i)||i<0||i>8)return true;const p=puzzle;if(p.selected===i)p.selected=null;else if(p.selected===null)p.selected=i;else{[p.perm[i],p.perm[p.selected]]=[p.perm[p.selected],p.perm[i]];p.selected=null;if(p.perm.every((v,i)=>v===i)&&M.restoreTicket(state(),p.id,p.perm)){save();draw?.();}}renderPuzzle();const focus=$(`[data-action="ticket-piece"][data-value="${i}"]`);if(focus&&!focus.disabled)focus.focus();else $('[data-action="ticket-puzzle-back"]')?.focus();return true;}
 if(a==='ticket-download'&&ticket){const link=document.createElement('a');link.href=ticket.url;link.download=ticket.name;link.click();}
 if(a==='ticket-share'&&ticket){const file=new File([ticket.blob],ticket.name,{type:'image/png'});if(navigator.canShare?.({files:[file]}))return navigator.share({files:[file],title:'씨야 키우기 기념 이미지'}).catch(e=>{if(e.name!=='AbortError'&&$('#ticketMessage'))$('#ticketMessage').textContent='PNG 저장이나 이미지 길게 누르기를 이용해 주세요.';});if($('#ticketMessage'))$('#ticketMessage').textContent='PNG 저장이나 이미지 길게 누르기를 이용해 주세요.';}
 return true;
 }
 return {handle,show,showPass};
};
