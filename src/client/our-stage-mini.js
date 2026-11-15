'use strict';
module.exports=function({M,root,state,save,draw,dialog,button,esc,mark,locked,sync}){
 const G=M.mini,$=q=>root.querySelector(q);let viewing=null,frame=0,lastBeat=-1,feedback='',audio=null,sound=true,timbre='clap';
 const stamp=ms=>{const seconds=Math.ceil(ms/1000);return `${Math.floor(seconds/60)}:${String(seconds%60).padStart(2,'0')}`;};
 function room(){const s=state(),m=s.mini,remaining=Math.max(0,G.dailyLimit-G.used(m,Date.now()));
  return `<section class="mini-lobby"><div class="line"><div><h3>작은 놀이, 다음 무대의 코인</h3><p>오늘 남은 도전 <b>${remaining} / ${G.dailyLimit}회</b> · 두 게임 합산</p></div><span class="mini-tag">로컬 테스트 · 재도전 1분</span></div><div class="mini-game-grid">${G.games.map((g,i)=>`<article class="mini-game-card"><span class="mini-icon" aria-hidden="true">${i?'♫':'?'}</span><h4>${g.name}</h4><p>${g.description}</p><strong>최대 ${g.maxReward}코인</strong><small>${i?'8박자 · 성공한 박자당 2코인':'무작위 3문제 · 정답당 5코인'}</small>${button('도전하기','mini-start',g.id,'primary',!G.canStart(m,g.id,Date.now()))}<p class="mini-wait" data-mini-wait="${g.id}" role="status"></p></article>`).join('')}</div>${m.active?`<div class="mini-resume"><p>진행 중인 ${m.active.kind==='quiz'?'퀴즈':'리듬 게임'}가 있어요.</p>${button('이어 하기','mini-resume')}${button('이번 도전 그만하기','mini-abandon')}</div>`:''}<p class="private-note">시작할 때 도전 횟수와 대기 시간이 적용돼요. 중간에 그만둬도 되돌아가지 않아요.<br>문제는 시간 제한 없이 풀 수 있어요. 리듬 게임은 화면을 떠나면 종료돼요.<br>도전 횟수는 한국 시간 자정에 초기화됩니다. 연습 시간 1초 설정과는 별개예요.</p></section>`;
 }
 function update(){const m=state().mini;for(const g of G.games){const label=$(`[data-mini-wait="${g.id}"]`),btn=$(`[data-action="mini-start"][data-value="${g.id}"]`);if(!label)continue;const ms=G.wait(m,g.id,Date.now());label.textContent=G.used(m,Date.now())>=G.dailyLimit?'오늘 도전을 모두 마쳤어요.':ms?`다음 도전까지 ${stamp(ms)}`:m.active?'진행 중인 도전을 먼저 마쳐주세요.':'지금 도전할 수 있어요.';btn.disabled=!G.canStart(m,g.id,Date.now());}}
 function showQuiz(){const a=state().mini.active;if(!a||a.kind!=='quiz')return;viewing=a.id;const q=G.question(a);if(!q){result();return;}
  dialog(`${mark('SONG QUIZ')}<h2>노래 단서 퀴즈</h2><p class="mini-progress">${a.answers.length+1} / 3문제 · 정답당 5코인</p><h3 class="mini-question">${esc(q.question)}</h3><div class="quiz-options">${q.choices.map((x,i)=>button(esc(x),'mini-answer',`${a.answers.length}:${i}`)).join('')}</div><p class="private-note">답을 고르면 확정돼요. 틀려도 다음 문제에 도전할 수 있어요.</p>`);
 }
 function result(){const r=G.finish(state().mini,viewing,Date.now());if(!r)return;cancelAnimationFrame(frame);viewing=null;save();draw();dialog(`${mark('PLAY COMPLETE')}<h2>${r.correct===r.total?'완벽한 호흡!':'함께한 만큼, 한 걸음'}</h2><p class="mini-result">${r.correct} / ${r.total} ${r.kind==='quiz'?'정답':'박자 성공'}</p><strong class="mini-reward">+${r.reward} 코인</strong><p>보상이 지갑에 들어왔어요. 다음 도전은 대기 시간이 끝난 뒤에 할 수 있어요.</p>${button('코인 모으기로','mini-done','','primary')}`);}
 function unlockAudio(){if(!sound)return;try{audio??=new(window.AudioContext||window.webkitAudioContext)();audio.resume().catch(()=>audioNotice());}catch{audioNotice();}}
 function audioNotice(){const el=$('#rhythmAudioNote');if(el)el.textContent='소리를 켜지 못했어요. 기기 음량을 확인하거나 효과음을 다시 켜 주세요.';}
 function tone(frequency,duration,type='sine',volume=.08,end=frequency){if(!sound||!audio||audio.state!=='running')return;try{const t=audio.currentTime,o=audio.createOscillator(),g=audio.createGain();o.type=type;o.frequency.setValueAtTime(frequency,t);o.frequency.exponentialRampToValueAtTime(end,t+duration);g.gain.setValueAtTime(volume,t);g.gain.exponentialRampToValueAtTime(.001,t+duration);o.connect(g).connect(audio.destination);o.start(t);o.stop(t+duration);o.onended=()=>{o.disconnect();g.disconnect();};}catch{}}
 function beep(){tone(480,.045,'sine',.035);}
 function hitSound(){
  if(timbre==='drum'){tone(180,.16,'sine',.22,45);tone(900,.025,'triangle',.035);}
  else if(timbre==='bell'){tone(880,.24,'sine',.12);tone(1320,.16,'sine',.04);}
  else {if(!sound||!audio||audio.state!=='running')return;const length=Math.floor(audio.sampleRate*.11),buffer=audio.createBuffer(1,length,audio.sampleRate),samples=buffer.getChannelData(0);for(let i=0;i<length;i++)samples[i]=(Math.random()*2-1)*Math.exp(-i/length*7);const n=audio.createBufferSource(),filter=audio.createBiquadFilter(),g=audio.createGain();n.buffer=buffer;filter.type='highpass';filter.frequency.value=900;g.gain.value=.32;n.connect(filter).connect(g).connect(audio.destination);n.start();n.onended=()=>{n.disconnect();filter.disconnect();g.disconnect();};}
 }
 // Resume audio in the actual touch/click gesture, before asynchronous save locks.
 root.addEventListener('pointerdown',e=>{if(e.target.closest('[data-action="mini-sound"]')&&!sound){try{audio??=new(window.AudioContext||window.webkitAudioContext)();audio.resume().catch(()=>audioNotice());}catch{audioNotice();}}if(e.target.closest('[data-action="mini-beat-begin"],[data-action="mini-tap"]'))unlockAudio();});
 root.addEventListener('keydown',e=>{if(e.code==='Space'&&$('[data-action="mini-tap"]'))unlockAudio();});
 root.addEventListener('change',e=>{if(e.target.id==='rhythmTimbre'){timbre=e.target.value;unlockAudio();hitSound();}if(e.target.id==='rhythmPattern'){const value=e.target.value;locked(()=>{sync();const a=state().mini.active;if(a?.kind==='rhythm'&&a.beatStart===null&&G.patterns.some(p=>p.id===value)){a.pattern=value;save();}});}});
 function showRhythm(){const a=state().mini.active;if(!a||a.kind!=='rhythm')return;viewing=a.id;feedback='';lastBeat=-1;
  dialog(`${mark('RHYTHM CHECK')}<h2>응원 리듬 맞추기</h2><div class="rhythm-options"><label>박자 패턴<select id="rhythmPattern" ${a.beatStart!==null?'disabled':''}>${G.patterns.map(p=>`<option value="${p.id}" ${p.id===(a.pattern||'steady')?'selected':''}>${p.name}</option>`).join('')}</select></label><label>타격음<select id="rhythmTimbre">${[['clap','손뼉'],['drum','드럼'],['bell','벨']].map(([id,n])=>`<option value="${id}" ${timbre===id?'selected':''}>${n}</option>`).join('')}</select></label></div><p>빛이 가운데 선에 닿는 순간 눌러주세요.<br>터치·클릭 또는 스페이스 키 · 성공당 2코인</p><div class="rhythm-track" aria-hidden="true"><div class="rhythm-target"></div>${Array.from({length:8},(_,i)=>`<i class="rhythm-note" data-beat="${i}"></i>`).join('')}</div><p id="rhythmStatus" role="status">준비되면 시작하세요. 3박자 예고 후 시작해요.</p>${button('박자 시작','mini-beat-begin','','primary rhythm-tap')}${button(sound?'효과음 끄기':'효과음 켜기','mini-sound','','quiet')}<p class="private-note"><span id="rhythmAudioNote">시작 버튼을 누르면 예고음과 성공 타격음이 켜져요. 기기 음량도 확인해 주세요.</span><br>선택한 패턴으로 8번 맞춰요. 노래 음원은 사용하지 않아요. 화면을 닫거나 다른 앱으로 이동하면 보상 없이 종료돼요.</p>`);
  if(a.beatStart!==null){$('#rhythmStatus').textContent='진행 중인 박자로 돌아왔어요.';activateBeat();}
 }
 function activateBeat(){if($('#rhythmPattern'))$('#rhythmPattern').disabled=true;const btn=$('[data-action="mini-beat-begin"]');if(btn){btn.dataset.action='mini-tap';btn.textContent='박자 맞추기';btn.focus();}cancelAnimationFrame(frame);animate();}
 function animate(){const a=state().mini.active;if(!a||a.id!==viewing||a.beatStart===null)return;const now=Date.now(),elapsed=now-a.beatStart;
  for(const n of root.querySelectorAll('[data-beat]')){const offset=(G.offsets(a)[Number(n.dataset.beat)]-elapsed)/G.lead;n.style.left=`${50+offset*46}%`;n.style.opacity=offset>=-.15&&offset<=1?1:0;}
  const beat=elapsed<0?Math.floor(elapsed/G.interval):G.offsets(a).filter(t=>t<=elapsed).length-1;if(beat!==lastBeat){lastBeat=beat;beep();}
  const label=$('#rhythmStatus');if(label)label.textContent=elapsed<0?`준비 · ${Math.ceil(-elapsed/G.interval)}`:`${Math.min(8,beat+1)} / 8박자 · ${G.score(a)}번 성공${feedback?' · '+feedback:''}`;
  if(now>=G.endAt(a)+150){locked(()=>{sync();result();});return;}frame=requestAnimationFrame(animate);
 }
 function handle(action,value){if(!action.startsWith('mini-'))return false;const m=state().mini;
  if(action==='mini-start'){if(G.start(m,value,Date.now())){save();draw();value==='quiz'?showQuiz():showRhythm();}}
  if(action==='mini-resume'){m.active?.kind==='quiz'?showQuiz():showRhythm();}
  if(action==='mini-answer'){const [n,i]=value.split(':').map(Number),a=m.active;if(a?.id!==viewing||a.answers.length!==n)return true;const q=G.question(a);if(G.answer(m,viewing,i)){save();dialog(`${mark('SONG QUIZ')}<h2>${i===q.answer?'정답이에요!':'이번 정답을 기억해 봐요'}</h2><h3>${esc(q.choices[q.answer])}</h3><p>${esc(q.explanation)}</p><p>${a.answers.length} / 3문제 · 현재 ${G.score(a)*5}코인</p>${button(a.answers.length===3?'결과 보기':'다음 문제','mini-next','','primary')}`);}}
  if(action==='mini-next'){showQuiz();}
  if(action==='mini-beat-begin'){if(G.beginBeat(m,viewing,Date.now())){save();activateBeat();}}
  if(action==='mini-tap'){const before=m.active?G.score(m.active):0,r=G.tap(m,viewing,Date.now());if(r!==null){feedback=r>before?'좋아요!':'조금 더 박자에 맞춰봐요';if(r>before){hitSound();const btn=$('[data-action="mini-tap"]');btn?.classList.remove('rhythm-hit');void btn?.offsetWidth;btn?.classList.add('rhythm-hit');}save();}}
  if(action==='mini-sound'){sound=!sound;if(sound){unlockAudio();hitSound();}$('[data-action="mini-sound"]').textContent=sound?'효과음 끄기':'효과음 켜기';}
  if(action==='mini-abandon'){if(m.active)G.abandon(m,m.active.id);viewing=null;cancelAnimationFrame(frame);save();draw();}
  if(action==='mini-done'){$('#stageModal').close();draw();}
  update();return true;
 }
 function stopRhythm(){const id=viewing;viewing=null;cancelAnimationFrame(frame);if(!id)return;locked(()=>{sync();const m=state().mini;if(m.active?.id===id&&m.active.kind==='rhythm'){G.abandon(m,id);save();draw();}});}
 $('#stageModal').addEventListener('close',stopRhythm);
 document.addEventListener('visibilitychange',()=>{if(document.hidden&&state().mini.active?.kind==='rhythm'&&viewing){stopRhythm();dialog('<h2>리듬 도전을 마쳤어요</h2><p>화면을 떠나 이번 도전은 보상 없이 종료됐어요. 대기 시간이 끝나면 다시 도전할 수 있어요.</p>');}});
 root.addEventListener('keydown',e=>{if(e.code==='Space'&&!e.repeat&&$('[data-action="mini-tap"]')&&$('#stageModal').open){e.preventDefault();locked(()=>{sync();handle('mini-tap','');});}});
 // A half-played rhythm cannot complete unattended after reload. Quiz answers can resume.
 if(state().mini.active?.kind==='rhythm'){G.abandon(state().mini,state().mini.active.id);save();}
 return {room,update,handle};
};
