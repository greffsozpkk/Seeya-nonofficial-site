'use strict';
module.exports=function({M,root,state,save,dialog,button,esc,advance}){
 let current=null,pool=[],selection=[],timer=0,token=0;const $=q=>root.querySelector(q);
 function show(message=''){const q=M.wordGates.find(q=>q.album===current);if(!q)return;dialog(`<small class="eyebrow">CHAPTER BRIDGE</small><h2>노래로 여는 다음 장</h2><p>${esc(q.song)} · 단어 블록을 순서대로 골라 한 구절을 완성해요.</p><div class="word-slots" aria-label="선택한 가사 단어">${q.tokens.map((_,i)=>`<span>${selection[i]===undefined?'빈칸 '+(i+1):esc(q.tokens[selection[i]])}</span>`).join('')}</div><div class="word-bank">${pool.map(i=>button(esc(q.tokens[i]),'word-pick',String(i),'',selection.includes(i))).join('')}</div><p id="wordFeedback" role="status">${message}</p><div class="growth-actions">${button('한 칸 되돌리기','word-undo','','',!selection.length)}${button('다시 맞추기','word-reset')}${button('완성 확인','word-check','','primary',selection.length!==q.tokens.length)}</div><p class="private-note">몇 번이든 다시 맞출 수 있어요. 코인·AP·미니게임 도전 횟수를 사용하지 않습니다.</p><a href="${q.source}" target="_blank" rel="noopener noreferrer">가사 출처 보기 ↗</a>`);}
 function open(id){if(!M.wordAvailable(state(),id))return;current=id;selection=[];pool=M.wordGates.find(q=>q.album===id).tokens.map((_,i)=>i);for(let i=pool.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[pool[i],pool[j]]=[pool[j],pool[i]];}show();}
 function finish(){clearTimeout(timer);if(!current)return;const id=current;current=null;advance(id);}
 function handle(action,value){if(action==='chapter-words'){open(value);return true;}if(!action.startsWith('word-'))return false;if(action==='word-next'){finish();return true;}const q=M.wordGates.find(q=>q.album===current);if(!q||!M.wordAvailable(state(),current))return true;
  if(action==='word-pick'){const i=Number(value);if(Number.isInteger(i)&&pool.includes(i)&&!selection.includes(i)){selection.push(i);show();}}
  if(action==='word-undo'){selection.pop();show();}
  if(action==='word-reset'){selection=[];show();}
  if(action==='word-check'){if(!M.answerWords(state(),current,selection)){show('순서가 조금 달라요. 단어를 다시 골라보세요.');return true;}if(!M.unlockAlbum(state(),current))return true;save();const seq=++token;dialog(`<div class="word-celebration"><small class="eyebrow">A NEW CHAPTER</small><h2>${esc(M.albumById(current).name)}</h2><p class="word-reveal">${q.tokens.map((t,i)=>`<span style="--word-delay:${i*.15}s">${esc(t)}</span>`).join(' ')}</p><p>기억한 노래가 다음 장을 열었어요.<br>새 앨범 의상과 멤버 카드도 함께 받습니다.</p>${button('지금 앨범 펼치기','word-next','','primary')}<small>잠시 뒤 새 앨범으로 이어집니다.</small></div>`);timer=setTimeout(()=>{if(seq===token&&$('.word-celebration'))finish();},Math.max(2500,q.tokens.length*150+1500));}
  return true;
 }
 $('#stageModal').addEventListener('close',()=>{clearTimeout(timer);token++;current=null;});
 return {handle};
};
