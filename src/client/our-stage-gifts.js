'use strict';
const icon=require('./our-stage-gift-art');
module.exports=function({M,state,root,dialog,button,esc,save,draw,close,goPractice}){
 const $=q=>root.querySelector(q);let task=null,order=[],guess=[],peeked=false,message='',lastGifts=new Set(M.gifts(state()).map(g=>g.id));
 const date=at=>at?new Date(at).toLocaleDateString('ko-KR',{timeZone:'Asia/Seoul'}):'';
 let nextPractice=null;
 // Fixed, uneven floor positions keep earlier gifts in place as the pile grows.
 const spots=[[7,2,54,-7],[49,1,44,8],[26,16,42,-4],[0,25,40,5],[60,23,38,-8],[34,37,42,6],[12,48,36,-5],[66,46,34,9],[40,60,37,-3],[5,66,32,7],[64,66,32,-6],[28,78,32,3]];
 function corner(){
  const gifts=M.gifts(state()),added=gifts.some(g=>!lastGifts.has(g.id));lastGifts=new Set(gifts.map(g=>g.id));
  if(!gifts.length)return '<button class="gift-corner empty" data-action="gift-shelf" aria-label="선물 코너 열기"><span class="gift-floor-label">선물 코너</span></button>';
  const ordered=gifts.filter(g=>g.at).sort((a,b)=>a.at-b.at||a.id.localeCompare(b.id)),shown=ordered.slice(0,spots.length);
  const pile=shown.map((g,i)=>{const [x,y,w,r]=spots[i];return `<span class="gift-item" data-gift-id="${esc(g.id)}" style="--gx:${x}%;--gy:${y}%;--gw:${w}%;--gr:${r}deg;z-index:${i+2}">${icon(g)}</span>`;}).join('');
  const bundles=Array.from({length:Math.min(4,Math.ceil(Math.max(0,ordered.length-spots.length)/6))},(_,i)=>`<span class="gift-item gift-bundle" style="--gx:${-7+i*19}%;--gy:${-4+i%2*6}%;--gw:48%;--gr:${i%2?7:-5}deg;z-index:${20+i}">${icon({id:'overflow-'+i,kind:'box'})}</span>`).join('');
  return `<button class="gift-corner${added?' gift-new':''}" data-action="gift-shelf" aria-label="받은 선물 ${gifts.length}개, 선물 살펴보기">${pile}${bundles}${gifts.some(g=>g.kind==='letters')?`<span class="gift-item gift-letters" style="--gx:66%;--gy:-3%;--gw:40%;--gr:5deg;z-index:25">${icon('letters')}</span>`:''}<span class="gift-floor-label">선물 살펴보기</span></button>`;
 }
 function beforeNext(from,to){
  if(!M.ready(state(),from)||!M.wordAvailable(state(),from))return false;
  handle('word-open',from);nextPractice=to;render();return true;
 }
 function resetPending(){nextPractice=null;task=null;}
 function taskList(album){const s=state(),list=M.wordTasks.filter(q=>(!album||q.album===album)&&M.open(s,q.track));return list.length?`<details class="word-task-list"><summary>가사 한 줄로 선물 모으기 · 선택</summary><p>풀지 않아도 다음 곡과 앨범은 열려요.</p>${list.map(q=>`<div class="word-task-row"><span>${esc(q.song)}<small>${esc(M.albumById(q.album).name)}</small></span>${button(s.simple.wordDone[q.track]?'선물 받았어요':'가사 맞추기','word-open',q.track,'',!!s.simple.wordDone[q.track])}</div>`).join('')}</details>`:'';}
 function shelf(){nextPractice=null;const gifts=M.gifts(state());dialog(`<small class="eyebrow">GIFTS FOR SEEYA</small><h2>연습실에 쌓인 마음</h2><p>콘서트와 가사 한 줄, 매일의 출석이 선물로 남아요.</p><div class="gift-shelf">${gifts.map(g=>`<article>${icon(g)}<strong>${esc(g.label)}</strong>${g.at?`<small>${date(g.at)}</small>`:''}</article>`).join('')||'<p>아직 선물이 없어요. 출석하거나 콘서트를 열어보세요.</p>'}</div>${taskList()}`);}
 function render(){const q=task;if(!q)return;dialog(`<small class="eyebrow">A LINE TO REMEMBER · 선택 과제</small><h2>가사 블록 맞추기</h2><p>${esc(q.song)} · ${esc(M.albumById(q.album).name)}</p><p>연습한 노래를 떠올리며 블록을 순서대로 놓아보세요.</p><div class="word-answer" aria-label="내가 놓은 블록">${guess.map((n,i)=>button(esc(q.tokens[n]),'word-remove',String(i))).join('')||'<span>아래 블록을 눌러주세요.</span>'}</div><div class="word-pool">${order.map(n=>button(esc(q.tokens[n]),'word-pick',String(n),'',guess.includes(n))).join('')}</div><p class="word-feedback" role="status">${esc(message)}</p><div class="growth-actions">${button('하나 되돌리기','word-undo','','',!guess.length)}${button('첫 블록 보기','word-peek','','',peeked)}${button(nextPractice?'나중에 풀고 다음 곡으로':'나중에 풀기','word-later')}</div><p class="private-note">원할 때만 해보세요. 곡과 앨범 해금에는 영향을 주지 않아요.</p><a href="${esc(q.source)}" target="_blank" rel="noopener">가사 출처 보기 ↗</a>`);}
 function handle(a,v){if(a==='gift-shelf'){shelf();return true;}if(!a.startsWith('word-'))return false;
 if(a==='word-open'){nextPractice=null;task=M.wordTasks.find(q=>q.track===v);if(!task||!M.wordAvailable(state(),v)){task=null;return true;}order=task.tokens.map((_,i)=>i);for(let i=order.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[order[i],order[j]]=[order[j],order[i]];}if(order.every((n,i)=>n===i))order.push(order.shift());guess=[];peeked=false;message='';render();return true;}
 if(a==='word-later'){const next=nextPractice;resetPending();close();if(next)goPractice(next);return true;}
 if(!task||!$('#modalBody .word-answer'))return true;
 if(a==='word-pick'){const n=Number(v);if(!Number.isInteger(n)||n<0||n>=task.tokens.length||guess.includes(n)||guess.length===task.tokens.length)return true;guess.push(n);message='';if(guess.length===task.tokens.length){if(M.answerWords(state(),task.track,guess)){if(!save())return true;draw();dialog(`<small class="eyebrow">A GIFT FOR SEEYA</small><h2>선물이 하나 놓였어요</h2><div class="word-gift">${icon(M.gifts(state()).find(g=>g.id==='word:'+task.track))}</div><h3>${esc(M.gifts(state()).find(g=>g.id==='word:'+task.track).giftName)}</h3><p>${esc(task.song)}의 한 줄을 완성했어요.</p>${button('선물함 보기','gift-shelf','','primary')}${button(nextPractice?'다음 곡 연습하기':'계속하기','word-later')}`);task=null;return true;}message='조금 달라요. 놓은 블록을 눌러 바꾸거나 하나 되돌려 보세요.';}}
 if(a==='word-remove')guess.splice(Number(v),1);if(a==='word-undo')guess.pop();if(a==='word-peek'&&!peeked){peeked=true;message='첫 블록은 “'+task.tokens[0]+'”예요.';}render();return true;
 }
 return {corner,taskList,handle,beforeNext,resetPending};
};
