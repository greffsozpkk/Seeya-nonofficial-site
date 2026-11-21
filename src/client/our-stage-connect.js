'use strict';
module.exports=function({root,sprite,styles,esc}){
 const G=require('../shared/our-stage-connect'),key='seeya-our-stage-connect-v1';
 let game=null,selected=null,highlight=[],path=null,pathUntil=0,paused=true,last=0,saveAt=0,resetAsked=false,message='',storageFailed=false;
 try{const raw=localStorage.getItem(key);if(raw){const parsed=JSON.parse(raw);if(G.valid(parsed))game=parsed;else message='저장된 판을 읽지 못했어요. 새 판으로 시작해 주세요.';}}catch{message='저장된 판을 불러오지 못했어요. 이 화면에서 새 판을 시작할 수 있어요.';}
 const tileArt=require('./our-stage-style-tile'),faces=G.tiles.map(t=>tileArt(t));
 const remaining=()=>game?.board.filter(v=>v!==null).length||0;
 const clock=()=>{const seconds=Math.floor((game?.elapsed||0)/1000);return Math.floor(seconds/60)+':'+String(seconds%60).padStart(2,'0');};
 function persist(){try{localStorage.setItem(key,JSON.stringify(game));storageFailed=false;}catch{storageFailed=true;}}
 function accrue(){const now=performance.now();if(last&&!paused&&game&&remaining()&&!document.hidden)game.elapsed+=Math.max(0,Math.floor(now-last));last=now;}
 function pause(){accrue();paused=true;selected=null;highlight=[];path=null;if(game)persist();}
 function board(){
  if(!game)return '';
  const coord=(v,max)=>v===0?.16:v===max+1?max+.54:v-.15;
  return `<div class="connect-board-wrap"><div class="connect-board" aria-label="캐릭터 사천성 패">${game.board.map((id,i)=>id===null?'<span class="connect-empty" aria-hidden="true"></span>':`<button type="button" class="connect-tile ${selected===i?'is-selected':''} ${highlight.includes(i)?'is-hint':''}" data-action="connect-tile" data-value="${i}" aria-pressed="${selected===i}" aria-label="${G.tiles[id].name} ${G.tiles[id].era} ${G.tiles[id].part==='clothes'?'의상':'헤어'}, ${Math.floor(i/G.cols)+1}행 ${i%G.cols+1}열" ${paused?'disabled':''}><span class="connect-face" aria-hidden="true">${faces[id]}</span><span><b>${esc(G.tiles[id].name)} · ${G.tiles[id].part==='clothes'?'의상':'헤어'}</b></span></button>`).join('')}</div>${path?`<svg class="connect-path" viewBox="0 0 6.7 8.7" preserveAspectRatio="none" aria-hidden="true"><polyline points="${path.map(p=>coord(p.x,6)+','+coord(p.y,8)).join(' ')}"/></svg>`:''}${paused&&remaining()?'<div class="connect-pause"><strong>잠시 쉬는 중</strong><button type="button" class="primary" data-action="connect-resume">이어서 하기</button></div>':''}</div>`;
 }
 function render(){return `<section class="panel connect-page"><header class="connect-heading"><div><small class="eyebrow">TAKE A BREAK</small><h2>멤버 사천성</h2></div><span class="connect-free">시간 제한 없이</span></header><p>같은 헤어·같은 의상의 패를 연결해요.<br>선은 두 번까지 꺾을 수 있어요.</p>${!game?'<div class="connect-intro"><div aria-hidden="true">'+faces.slice(0,3).join('')+'</div><p>천천히, 우리끼리 한 판.<br>코인이나 포인트는 사용하지 않아요.</p><button type="button" class="primary" data-action="connect-new">새 판 시작</button></div>':`<div class="connect-stats"><strong>${24-remaining()/2} / 24쌍</strong><span>플레이 <b data-connect-clock>${clock()}</b></span></div>${board()}${!remaining()?'<div class="connect-complete" role="status"><h3>모두 찾았어요!</h3><p>세 사람의 추억을 한 판 가득 모았네요.</p><button type="button" class="primary" data-action="connect-new">한 판 더</button></div>':`<div class="connect-tools"><button type="button" data-action="connect-hint" ${paused?'disabled':''}>힌트</button><button type="button" data-action="connect-shuffle" ${paused?'disabled':''}>섞기</button><button type="button" data-action="connect-pause" ${paused?'disabled':''}>잠깐 쉬기</button><button type="button" data-action="connect-reset">새 판</button></div>`}`}${resetAsked?'<div class="connect-confirm"><p>지금 판을 마치고 새로 시작할까요?</p><button type="button" class="primary" data-action="connect-new">새 판 시작</button> <button type="button" data-action="connect-cancel">계속하기</button></div>':''}<p class="connect-status" role="status">${esc(storageFailed?'진행 상황을 저장하지 못했어요. 이 화면을 닫으면 사라질 수 있어요.':message)}</p><details class="connect-help"><summary>플레이 안내</summary><p>다른 패를 통과하지 않고, 두 번 이하로 꺾어 연결하면 한 쌍이 사라져요. 판 바깥의 빈 공간도 이용할 수 있어요.</p><p>연결할 쌍이 없으면 남은 패를 자동으로 섞어요. 힌트·섞기는 횟수 제한이 없어요.</p><p>코인 보상이나 일일 제한은 없어요. 진행 중인 판은 이 브라우저에 자동 저장돼요.</p></details></section>`;}
 function repaint(focusIndex=null){const el=root.querySelector('.connect-page');if(el){el.outerHTML=render();if(focusIndex!==null)root.querySelector('[data-action="connect-tile"][data-value="'+focusIndex+'"]')?.focus({preventScroll:true});}}
 function handle(action,value){
  if(!action.startsWith('connect-'))return false;
  accrue();
  if(action==='connect-new'){game=G.fresh();paused=false;selected=null;highlight=[];path=null;resetAsked=false;message='마음에 드는 패부터 골라보세요.';last=performance.now();persist();repaint();root.querySelector('.connect-page')?.scrollIntoView?.({block:'start'});return true;}
  if(action==='connect-reset'){resetAsked=true;repaint();return true;}
  if(action==='connect-cancel'){resetAsked=false;repaint();return true;}
  if(!game)return true;
  if(action==='connect-resume'){paused=false;last=performance.now();message='';repaint();return true;}
  if(action==='connect-pause'){pause();repaint();return true;}
  if(paused||!remaining()||resetAsked)return true;
  if(action==='connect-hint'){const h=G.hint(game.board);highlight=h?[h.a,h.b]:[];selected=null;message='반짝이는 두 패를 연결해 보세요.';repaint();return true;}
  if(action==='connect-shuffle'){game.board=G.shuffle(game.board);game.shuffles++;selected=null;highlight=[];path=null;message='남은 패를 새롭게 놓았어요.';persist();repaint();return true;}
  if(action==='connect-tile'){
   const i=Number(value);if(!Number.isInteger(i)||i<0||i>=48||game.board[i]===null||path)return true;
   highlight=[];
   if(selected===i){selected=null;repaint(i);return true;}
   if(selected===null){selected=i;message='같은 헤어·같은 의상의 패를 골라주세요.';repaint(i);return true;}
   const found=G.remove(game,selected,i);
   if(!found){selected=i;message='지금은 연결되지 않아요. 다른 짝을 찾아볼까요?';repaint(i);return true;}
   selected=null;path=found;pathUntil=performance.now()+420;message=remaining()?'한 쌍을 찾았어요!':'';persist();repaint();
  }
  return true;
 }
 function update(){
  if(!root.querySelector('.connect-page')){if(!paused)pause();return;}
  accrue();const now=performance.now();
  if(path&&now>=pathUntil){path=null;if(remaining()&&!G.hint(game.board)){game.board=G.shuffle(game.board);game.shuffles++;message='연결할 쌍이 없어 남은 패를 섞었어요.';persist();}repaint();}
  const el=root.querySelector('[data-connect-clock]');if(el)el.textContent=clock();
  if(game&&!paused&&now-saveAt>5000){persist();saveAt=now;}
 }
 document.addEventListener('visibilitychange',()=>{if(document.hidden){pause();repaint();}});
 window.addEventListener('pagehide',pause);
 return {render,handle,update,pause};
};
