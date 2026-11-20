'use strict';
module.exports=function(args){
 const {M,root,state,save,locked,sync,button}=args,D=M.drive;
 const logo=typeof Image==='undefined'?null:new Image();if(logo){logo.onload=()=>paint();logo.src='/images/game/our-stage/card-logo.svg';}
 const places=[['방송국','오늘의 음악 방송'],['라디오 스튜디오','목소리로 만나는 밤'],['공연장','우리의 무대가 기다려요']];
 let previousPattern=null,difficulty='normal',run=null,result=null,paused=false,countdown=3000,last=0,raf=0,canvas=null,place=places[0],pointer=null;
 const $=q=>root.querySelector(q);
 const crashDuration=900;let crashRemaining=0;
 const reducedMotion=()=>typeof matchMedia==='function'&&matchMedia('(prefers-reduced-motion: reduce)').matches;
 function lobby(){return `<article class="mini-game-card drive-lobby"><span class="leisure-icon" aria-hidden="true">▰</span><h4>씨야, 스케줄 가는 길</h4><p>차를 피해 오늘의 무대까지 달려요.</p><small>30초 도착 · 8~12코인 · 하루 보상 2회</small>${button('스케줄 출발하기','drive-open','','primary',!state().simple.debuted)}<p>오늘 보상 ${D.limit-D.remaining(state().leisure.drive)} / ${D.limit}회</p></article>`;}
 function choices(){return `<div class="drive-difficulties" role="group" aria-label="주행 난이도">${Object.entries(D.difficulties).map(([id,d])=>`<button data-action="drive-difficulty" data-value="${id}" aria-pressed="${difficulty===id}"><strong>${d.name}</strong><span>${d.reward}코인</span></button>`).join('')}</div><p class="drive-difficulty-note">${D.difficulties[difficulty].description} · 난이도 합산 하루 2회</p>`;}
 function panel(){
  const left=D.remaining(state().leisure.drive),playing=run&&!result,level=D.difficulties[playing?run.difficulty:difficulty];
  return `<section class="drive-page"><div class="drive-heading"><small>SCHEDULE DRIVE</small><h2>씨야, 스케줄 가는 길</h2><p>${place[0]}까지, 안전하게 출발!</p></div>${playing?`<p class="drive-difficulty-note">${level.name} · 성공 보상 ${left?level.reward+'코인':'모두 수령'}</p>`:choices()}<div class="drive-hud" aria-label="주행 상태"><strong id="driveTime">${run?Math.ceil((D.duration-run.elapsed)/1000):30}초</strong><span id="driveHits">충돌 ${run?.hits||0} / 2</span><span>오늘 보상 ${D.limit-left} / ${D.limit}</span></div><div class="drive-road"><canvas id="scheduleRoad" width="320" height="480" tabindex="0" role="application" aria-label="스케줄 주행. 왼쪽 오른쪽 방향키 또는 A D로 차선을 바꾸세요. 터치는 좌우로 밀거나 원하는 차선을 누르세요."></canvas><div id="driveOverlay" class="drive-overlay" ${playing?'hidden':''}>${result?`<strong>${result.success?'스케줄 도착!':'괜찮아요, 다시 출발해요'}</strong><p>${result.success?place[1]:'다른 차와 두 번 부딪혔어요.'}</p><b>${result.coins?'+'+result.coins+' 코인':result.success?'연습 주행 완료':'보상 횟수는 줄어들지 않아요'}</b>`:'<strong>오늘도 씨야와 함께</strong><p>30초 동안 차를 피해 달려요.<br>한 번 부딪혀도 계속 갈 수 있어요.</p>'}</div></div><p id="driveStatus" class="drive-status" role="status" aria-live="polite">${result?.success?(left?'오늘 보상을 '+left+'번 더 받을 수 있어요.':'오늘 보상 2회를 모두 받았어요.'):playing?'좌우로 밀거나 원하는 차선을 눌러요.':'← → / A·D · 터치 / 스와이프'}</p><div class="drive-actions">${playing?button('잠시 멈추기','drive-pause'):button(result?'다시 출발하기':left?'출발하기':'보상 없이 연습하기','drive-start','','primary')}${button('코인 모으기로','drive-exit')}</div>${!playing&&!left?'<p class="private-note">오늘의 보상을 모두 받았어요. 한국 시간 자정에 다시 열려요.<br>계속해서 보상 없이 연습할 수 있어요.</p>':''}</section>`;
 }
 function stop(){if(typeof document!=='undefined')document.removeEventListener('keydown',onKey);cancelAnimationFrame(raf);raf=0;canvas=null;pointer=null;crashRemaining=0;}
 function render(){args.openDrivePage();mount();}
 function handle(a,v){
  if(!a.startsWith('drive-'))return false;
  if(a==='drive-open'){stop();run=null;result=null;place=places[state().leisure.drive.serial%places.length];render();}
  if(a==='drive-difficulty'&&(!run||result)&&Object.hasOwn(D.difficulties,v)){difficulty=v;render();}
  if(a==='drive-start'){
   if(!state().simple.debuted||(run&&!result))return true;
   stop();const ticket=D.start(state().leisure.drive,Date.now(),difficulty);if(!ticket)return true;save();
   const seed=typeof crypto!=='undefined'&&crypto.getRandomValues?crypto.getRandomValues(new Uint32Array(1))[0]:Date.now()^Math.floor(Math.random()*4294967296);
   run=D.create(ticket.id,seed,ticket.difficulty,previousPattern);previousPattern=run.pattern;result=null;paused=false;countdown=3000;place=places[(ticket.id-1)%places.length];render();
  }
  if(a==='drive-pause'&&run&&!result){paused=!paused;last=0;refreshPause();}
  if(a==='drive-exit'){stop();run=null;result=null;args.exitDrivePage();}
  return true;
 }
 function refreshPause(){const overlay=$('#driveOverlay'),btn=$('[data-action="drive-pause"]');if(!overlay||!btn)return;overlay.hidden=!paused;overlay.innerHTML=paused?'<strong>잠깐 쉬어가요</strong><p>시간과 차량이 멈춰 있어요.</p>':'';btn.textContent=paused?'계속 달리기':'잠시 멈추기';if(!paused)canvas?.focus({preventScroll:true});}
 function steer(d){if(run&&!run.done&&!result&&!paused&&countdown<=0)D.move(run,d);}
 function onKey(e){
  if(!canvas?.isConnected||!run||run.done||result||paused||countdown>0||document.hidden||e.defaultPrevented||e.altKey||e.ctrlKey||e.metaKey)return;
  // Keep steering after clicking the HUD or page, but leave text entry and dialogs alone.
  if($('#stageModal')?.open||e.target?.isContentEditable||e.target?.closest?.('input,textarea,select,[contenteditable]:not([contenteditable="false"]),[role="textbox"],dialog[open],[role="dialog"]'))return;
  const key=e.code||e.key;
  const direction=['ArrowLeft','KeyA','a','A'].includes(key)?-1:['ArrowRight','KeyD','d','D'].includes(key)?1:0;
  if(direction){e.preventDefault();steer(direction);}
 }
 function mount(){
  canvas=$('#scheduleRoad');if(!canvas)return;const target=canvas;paint();if(!run||result)return;
  target.focus({preventScroll:true});last=0;
  document.removeEventListener('keydown',onKey);document.addEventListener('keydown',onKey);
  target.onpointerdown=e=>{e.preventDefault();target.focus({preventScroll:true});target.setPointerCapture(e.pointerId);pointer={id:e.pointerId,x:e.clientX,start:e.clientX,moved:false};};
  target.onpointermove=e=>{if(!pointer||pointer.id!==e.pointerId)return;const dx=e.clientX-pointer.x;if(Math.abs(dx)>22){steer(Math.sign(dx));pointer.x=e.clientX;pointer.moved=true;}};
  target.onpointerup=e=>{if(pointer?.id!==e.pointerId)return;if(!pointer.moved&&run&&!run.done&&!paused&&countdown<=0){const rect=target.getBoundingClientRect(),lane=Math.max(0,Math.min(2,Math.floor(((e.clientX-rect.left)/rect.width*320-37)/82)));run.lane=lane;}pointer=null;};
  target.onpointercancel=()=>{pointer=null;};
  const frame=now=>{
   if(canvas!==target||!target.isConnected||!run||result){stop();return;}
   if($('#stageModal')?.open&&!paused){paused=true;refreshPause();}
   const dt=last?Math.min(50,Math.max(0,now-last)):0;last=now;
   if(!paused&&!document.hidden){
    if(crashRemaining>0)crashRemaining=Math.max(0,crashRemaining-dt);
    else if(countdown>0)countdown=Math.max(0,countdown-dt);
    else {const hits=run.hits;D.advance(run,dt);if(run.hits!==hits){if(run.hits>=2)crashRemaining=crashDuration;$('#driveStatus').textContent=run.hits===1?'한 번 부딪혔어요. 이제 한 번 더 부딪히면 멈춰요.':'쿵! 차가 멈췄어요.';}}
   }
   paint();$('#driveTime').textContent=Math.ceil((D.duration-run.elapsed)/1000)+'초';$('#driveHits').textContent='충돌 '+run.hits+' / 2';
   const overlay=$('#driveOverlay');if(!paused){overlay.hidden=countdown<=0;overlay.innerHTML=countdown>0?'<strong>'+Math.ceil(countdown/1000)+'</strong><p>출발 준비!</p>':'';}
   if(run.done&&crashRemaining<=0&&!paused&&!document.hidden){const completed=run;stop();locked(()=>{sync();const settled=D.finish(state().leisure.drive,completed);if(settled){save();result=settled;}else result={success:false,coins:0,remaining:D.remaining(state().leisure.drive)};render();});return;}
   raf=requestAnimationFrame(frame);
  };raf=requestAnimationFrame(frame);
 }
 if(typeof document!=='undefined')document.addEventListener('visibilitychange',()=>{if(document.hidden&&run&&!result&&canvas?.isConnected){paused=true;last=0;refreshPause();}});
 function paint(){
  if(!canvas)return;const c=canvas.getContext('2d');if(!c)return;c.imageSmoothingEnabled=false;
  const t=run?.elapsed||0,level=D.difficulties[run?.difficulty||difficulty],offset=(t*level.speed)%80;
  c.fillStyle='#c5d7bc';c.fillRect(0,0,320,480);
  c.fillStyle='#eee2cf';c.fillRect(21,0,278,480);c.fillStyle='#646575';c.fillRect(37,0,246,480);
  c.fillStyle='#f9efdf';c.fillRect(40,0,3,480);c.fillRect(277,0,3,480);
  for(let y=-80;y<480;y+=80){c.fillStyle='#dfd9d2';c.fillRect(117,y+offset,4,35);c.fillRect(199,y+offset,4,35);c.fillStyle='#8da985';c.fillRect(0,y+offset+8,17,26);c.fillRect(303,y+offset+45,17,26);c.fillStyle='#5e8669';c.fillRect(3,y+offset+12,12,16);c.fillRect(306,y+offset+48,12,16);}
  const car=(lane,y,color,van=false)=>{const x=78+82*lane-19;c.fillStyle='#383244';c.fillRect(x-3,y+7,44,56);c.fillStyle=color;c.fillRect(x,y,38,70);c.fillRect(x+4,y-4,30,78);c.fillStyle='#cce2e2';c.fillRect(x+5,y+8,28,13);c.fillStyle='#554659';c.fillRect(x+5,y+48,28,10);c.fillStyle='#ffedc4';c.fillRect(x+1,y,7,5);c.fillRect(x+30,y,7,5);c.fillStyle='#ba6d76';c.fillRect(x+2,y+65,6,5);c.fillRect(x+30,y+65,6,5);if(van){c.fillStyle='#fff4df';c.fillRect(x+6,y+27,26,13);if(logo?.complete&&logo.naturalWidth)c.drawImage(logo,x+7,y+30,24,7);}};
  for(const obstacle of run?.rows||[])car(obstacle.lane,obstacle.y,['#a4bac6','#dfb48d','#b9b0cc','#c9c7b5'][obstacle.color]);
  const impactAge=crashDuration-crashRemaining;
  const jolt=crashRemaining>0&&!reducedMotion()?Math.sin(impactAge*.055)*4*Math.max(0,1-impactAge/360):0;
  if(run?.hits>=2||!run?.immune||Math.floor(t/130)%2===0)car((run?.x??1)+jolt/82,375,'#c38aa8',true);
  if(crashRemaining>0){
   // A single pixel impact, not a flashing screen. Keep the hit visible before the result.
   const x=78+82*run.x,y=378,spread=reducedMotion()?1:Math.min(1,impactAge/120);
   c.fillStyle='#764653';c.fillRect(x-28,y-5,56,10);c.fillRect(x-5,y-28,10,56);
   c.fillStyle='#ffce80';c.fillRect(x-23,y-4,46,8);c.fillRect(x-4,y-23,8,46);
   c.fillStyle='#fff3cf';c.fillRect(x-12,y-12,24,24);
   c.fillStyle='#edaa7d';for(const [dx,dy] of [[-1,-1],[1,-1],[-1,1],[1,1]])c.fillRect(x+dx*(23+10*spread)-3,y+dy*(21+8*spread)-3,6,6);
   c.fillStyle='#694553';c.fillRect(x-29,y-64,58,29);c.fillStyle='#fff2d8';c.font='bold 18px sans-serif';c.textAlign='center';c.fillText('쿵!',x,y-43);
  }
  if(!run||run.elapsed<1200){c.fillStyle='#fff7e9';c.fillRect(79,22,162,42);c.fillStyle='#76516c';c.font='bold 14px sans-serif';c.textAlign='center';c.fillText(place[0]+' 가는 길',160,48);}
  if(result?.success){c.fillStyle='#eaddca';c.fillRect(38,120,244,60);c.fillStyle='#fff6df';for(let x=44;x<279;x+=24)c.fillRect(x,130,12,40);}
 }
 return {lobby,panel,handle,stop};
};
