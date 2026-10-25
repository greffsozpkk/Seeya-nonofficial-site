'use strict';
const I=require('../shared/clinic-interpretation');
const imageExport=require('./clinic-image'),summaryExport=require('./clinic-summary'),printExport=require('./clinic-print');
const C=require('../shared/clinic-scoring'),{esc:E}=require('../shared/common');
const app=document.getElementById('clinicApp');
if(app){
 const printer=printExport.install(()=>document.getElementById('clinicCertificate'));
 const KEY='seeya-clinic-test-progress-v2',savedModes={},legacy={};const storageKey=mode=>mode==='max'?KEY:KEY+'-'+mode;let state=null,error='',imageUrl=null,storageWarning='',exporting=false;
 const notice=t=>{const n=document.getElementById('clinicNotice');n.textContent=t;n.hidden=!t;};
 function write(){state.updatedAt=new Date().toISOString();try{localStorage.setItem(storageKey(state.mode),JSON.stringify(state));savedModes[state.mode]=state;}catch{storageWarning='이 브라우저에 저장하지 못했어요. 창을 닫으면 진행 내용이 사라질 수 있습니다.';notice(storageWarning);}}
 for(const mode of Object.keys(C.forms.modes)){try{const raw=localStorage.getItem(storageKey(mode));if(raw){const saved=C.restore(JSON.parse(raw));if(saved.mode!==mode)throw Error('모드 불일치');savedModes[mode]=saved;}}catch{error='이전 진행 기록 중 읽을 수 없거나 문항 버전이 달라진 기록이 있습니다. 다른 검사는 계속할 수 있어요.';}}state=Object.values(savedModes).sort((a,b)=>Date.parse(b.updatedAt)-Date.parse(a.updatedAt))[0]||null;
 for(const key of ['seeya-clinic-test-progress-v1','seeya-clinic-test-progress-v1-brief','seeya-clinic-test-progress-v1-detailed']){try{const raw=localStorage.getItem(key);if(raw)legacy[key]=raw;}catch{}}
 const scoringNote='미응답·기능 미사용·판단 불가는 0점으로 계산합니다. 마음·행동 점수를 각각 반올림해 합산합니다.';
 const modeLabel=()=>C.forms.modes[state.mode].label;
 function inventoryText(q,value){const s=C.engine.inventory(q,value);return `씨야용 ${s.selected}개 · 기능 미사용 ${s.unused}개 · 미선택 ${s.unanswered}개`+(q.id==='BEH-01'?'\n화면·프로필·소리는 각각 한 영역으로 묶어 최대 5점만 반영해요.':'\n이 항목은 결과 설명용으로 점수에는 넣지 않아요.');}
 function backupLegacy(){const blob=new Blob([JSON.stringify({kind:'seeya-clinic-legacy-backup',exportedAt:new Date().toISOString(),records:legacy},null,2)],{type:'application/json'}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download='seeya-clinic-previous-records.json';document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);notice('이전 검사 기록을 파일로 보관했습니다. 새 문항에 답을 변환해 가져오지는 않습니다.');}
 function focus(){app.querySelector('h2')?.focus({preventScroll:true});app.scrollIntoView({block:'start',behavior:'auto'});}
 const name=()=>state?.displayName?.trim()||'익명의 씨야 팬';
 const date=()=>new Intl.DateTimeFormat('ko-KR',{timeZone:'Asia/Seoul',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date(state.completedAt));
 function home(){
  const canCarry=state&&C.answeredCount(state)>0;
  app.innerHTML=`<section class="clinic-start"><figure><img src="/images/game/seeya-clinic.png" width="1536" height="1024" alt="진료실에서 함께하는 씨야 세 멤버"></figure><h2 tabindex="-1">나의 마음을 천천히 살펴볼까요?</h2><p>성향은 A/B, 마음은 다섯 단계로 답해요.<br>행동은 문항에 표시된 기간과 현재 설정을 기준으로 골라주세요.</p><label class="clinic-name">이름 또는 닉네임 <small>선택</small><input id="clinicName" maxlength="24" autocomplete="off" value="${E(state?.displayName||'')}" placeholder="진단서에 표시할 이름"></label>
  ${canCarry?`<label class="clinic-carry"><input id="clinicCarry" type="checkbox"><span>지금 확인한 ${E(C.forms.modes[state.mode].label)}의 공통 응답을 가져와 시작하기<small>같은 닉네임으로 시작할 때만 가져옵니다. 원래 검사와 진단서는 바꾸지 않아요.</small></span></label>`:''}
  <div class="clinic-modes">${Object.entries(C.forms.modes).map(([id,m])=>{const saved=savedModes[id];return `<article class="clinic-mode"><h3>${E(m.label)}</h3><b>${m.ids.length}문항</b><p class="clinic-small">${E(m.description)}</p><button data-start="${id}" class="clinic-primary" aria-label="${E(m.label)} 시작하기">검사 시작하기</button>${saved?`<button data-resume="${id}" aria-label="${E(m.label)} ${saved.stage==='result'?'진단서 다시 보기':'이어서 하기'}">${saved.stage==='result'?'진단서 다시 보기':`이어서 하기 · ${C.answeredCount(saved)}/${saved.questionOrder.length} 응답`}</button>`:''}</article>`;}).join('')}</div>
  <p class="clinic-small">20문항은 60문항에, 60문항은 MAX에 포함됩니다.<br>검사별 진행 상황과 진단서는 따로 저장되며, 공통 응답은 선택한 경우에만 가져옵니다.<br>응답과 이름은 이 브라우저에만 저장됩니다. 문항과 산식은 검토 중입니다.</p>
  ${Object.keys(legacy).length?'<div class="clinic-legacy"><p class="clinic-small">이전 문항으로 저장한 기록은 그대로 보관되어 있어요. 새 문항과 응답 방식이 달라 자동 변환하지 않습니다. 아래 파일은 이전 기록 보관용이며 새 검사로 가져오는 기능은 아닙니다.</p><button data-action="legacy">이전 검사 기록 파일로 보관</button></div>':''}</section>`;notice(error||storageWarning);
 }
 function question(){
  const id=state.questionOrder[state.currentIndex],q=C.byId[id],v=state.answersById[id],total=state.questionOrder.length,done=C.answeredCount(state);
  let inputs='';
  if(q.kind==='inventory'){
   inputs=`<fieldset class="clinic-inventory"><legend>각 항목의 현재 상태를 골라주세요.</legend>${q.items.map(item=>`<label for="clinic-item-${E(item.id)}"><span>${E(item.label)}</span><select id="clinic-item-${E(item.id)}" data-inventory-item="${E(item.id)}" required><option value="">선택해 주세요</option>${q.states.map(s=>`<option value="${E(s.value)}" ${v?.[item.id]===s.value?'selected':''}>${E(s.label)}</option>`).join('')}</select></label>`).join('')}</fieldset><output id="clinicInventorySummary" aria-live="polite" class="clinic-inventory-summary">${E(inventoryText(q,v))}</output>`;
  }else{
   inputs=`<fieldset class="clinic-scale ${q.kind==='preference'?'clinic-binary':''}"><legend>${q.kind==='preference'?'두 선택 중 더 자연스러운 쪽을 골라주세요.':'가장 가까운 응답을 하나 골라주세요.'}</legend>${q.choices.map((choice,index)=>{const skip=['unknown','unavailable','no-opportunity'].includes(choice.value),prefix=q.kind==='preference'&&index<2?'AB'[index]+'. ':q.area==='emotion'&&!skip?choice.value+'. ':'';return `<label class="${skip?'clinic-skip':''}"><input type="radio" name="clinicAnswer" value="${E(choice.value)}" ${v===choice.value?'checked':''}><span>${E(prefix+choice.label)}</span></label>`;}).join('')}</fieldset>`;
  }
  app.innerHTML=`<section class="clinic-question"><div class="clinic-progress"><span>현재 ${state.currentIndex+1} / ${total}</span><span>응답 완료 ${done} / ${total}</span></div><progress value="${done}" max="${total}" aria-label="응답 완료"></progress><p class="clinic-small"><b>${E(q.period||'')}</b>${q.scorePart==='context'?' · 결과 설명용 · 점수 제외':''}</p><h2 tabindex="-1">${E(q.prompt)}</h2><p class="clinic-small">${E(q.instruction)}</p>${inputs}<div class="clinic-qnav"><button data-action="previous" ${state.currentIndex===0?'disabled':''}>이전</button><button data-action="next" class="clinic-primary">${state.currentIndex===total-1?'응답 확인하기':'다음'}</button></div><div class="clinic-actions"><button data-action="home">잠깐 쉬기</button><button data-action="review">전체 응답 확인</button></div><small class="clinic-small">미응답으로 다음을 누를 수 있으며 과몰입 점수는 0점 처리합니다. 이전으로 돌아가 수정할 수 있어요.</small></section>`;focus();
 }
 function review(){
  const ids=state.questionOrder,missing=ids.filter(id=>!C.validAnswer(id,state.answersById[id])),unknown=ids.filter(id=>C.uncertain(id,state.answersById[id])),s=C.score(state),lack=[...C.axes.filter(a=>!s.axisRatios[a].ready).map(a=>C.bank.axes[a].name),...(!s.depthReady?['과몰입 지수']:[])];
  app.innerHTML=`<section class="clinic-review"><h2 tabindex="-1">진단서 발급 전 확인</h2><p>응답 완료 ${ids.length-missing.length} / ${ids.length}<br>판단 불가·여건 없음 등이 포함된 응답 ${unknown.length}문항 · 미응답 ${missing.length}문항</p><p class="clinic-small">문항 번호를 누르면 해당 응답을 수정할 수 있습니다. 선택하지 않은 문항·항목은 0점으로 계산합니다. A/B 성향은 선택한 응답만으로 판단합니다.</p><div class="clinic-review-list">${ids.map((id,i)=>`<button data-question="${i}" class="${missing.includes(id)?'missing':unknown.includes(id)?'unknown':''}" aria-label="${i+1}번 ${missing.includes(id)?'미응답':unknown.includes(id)?'일부 미확인':'응답 완료'}">${i+1}${missing.includes(id)?' · 미응답':unknown.includes(id)?' · 미확인':''}</button>`).join('')}</div>${lack.length?`<p class="clinic-small">현재 응답으로 결과를 보류할 영역: ${lack.map(E).join(' / ')}<br>성향은 축별 A/B 유효 응답 80% 이상이 필요합니다. 과몰입 점수의 미응답은 0점으로 계산합니다.</p>`:''}<div class="clinic-actions">${missing.length?`<button data-question="${ids.indexOf(missing[0])}">첫 미응답으로 이동</button>`:''}<button data-action="complete" class="clinic-primary">${missing.length?'미응답 0점으로 진단서 발급':'검사 완료 · 진단서 발급'}</button><button data-action="back">검사로 돌아가기</button></div><p class="clinic-small">${E(scoringNote)}</p></section>`;focus();
 }
 function model(){const score=C.score(state),type=C.bank.types.find(t=>t.code===score.typeCode),summary=score.typeCode?type.name:score.possibleTypes.length?'두 방향이 나란한 경계 성향':'아직 살펴볼 마음이 있어요';return {...score,depthDisplay:C.rangeText(score.depthRange),title:summary,resultTitle:score.typeCode?score.typeCode+' — '+summary+' 형':summary,profile:I.explain(score),findings:I.explain(score).findings};}
 function prescriptionHTML(rx){return `<section class="clinic-rx" aria-labelledby="clinicRxTitle"><div class="clinic-rx-head"><h3 id="clinicRxTitle" class="clinic-section-title">℞ 오늘의 처방전</h3><span>노래와 이야기로 조제했어요</span></div><h4 class="clinic-rx-medicine">${E(rx.medicine)}</h4><p class="clinic-small clinic-rx-choice">마음이 가는 활동만 가볍게 골라보세요.</p><dl class="clinic-rx-directions"><div><dt>복용법</dt><dd>${E(rx.dose)}</dd></div><div><dt>추천 재활 활동</dt><dd>${E(rx.mission)}</dd></div></dl><p class="clinic-rx-after"><small>복용 후 나올 법한 한마디</small>“${E(rx.after)}”</p><a class="clinic-rx-link" href="${E(rx.link.href)}">${E(rx.link.label)} <span aria-hidden="true">→</span></a></section>`;}
 function result(){const s=model();app.innerHTML=`<article id="clinicCertificate" class="clinic-certificate"><div class="clinic-masthead"><img src="/images/common/clinic-logo.png" alt="SEEYA"><small>FAN CHECK CLINIC<br>마음을 살펴보는 작은 진료실</small></div><h2 tabindex="-1">과몰입 진단서</h2><p style="text-align:center" class="clinic-small">씨야를 좋아하는 나만의 방식</p><div class="clinic-patient"><span>성명 · ${E(name())}</span><span>검사일 · ${E(date())}</span><span>${E(modeLabel())} · ${state.questionOrder.length}문항</span></div><div class="clinic-diagnosis"><div><small class="eye clinic-type-eyebrow">나의 팬 성향</small><h3 class="clinic-type-title">${s.typeCode?`<span class="clinic-type-code">${E(s.typeCode)}</span><span class="clinic-type-dash" aria-hidden="true">—</span><span class="clinic-type-name">${E(s.title)} 형</span>`:E(s.title)}</h3>${!s.typeCode?`<p>${s.possibleTypes.length?'경계 축 · '+s.boundaryAxes.map(E).join(' / '):'유효 응답 부족 · 아래 영역을 확인해주세요.'}</p>`:''}<p class="clinic-type-tagline">${E(s.profile.tagline)}</p></div></div><section class="clinic-depth" aria-labelledby="clinicDepthTitle"><div class="clinic-depth-head"><h3 id="clinicDepthTitle" class="clinic-section-title">00 · 과몰입 지수</h3><div class="clinic-score"><span>과몰입 지수</span><strong>${!s.depthReady?'—':s.depthDisplay}</strong><span>/ 100</span></div></div>${!s.depthReady?'<p class="clinic-small">과몰입 지수를 판단할 응답이 부족해요.</p>':'<p class="clinic-small">과몰입 지수는 마음과 행동 점수를 합친 값입니다.</p>'}<div class="clinic-depth-parts"><span>마음 <b>${E(C.rangeText(s.emotion.display))} / 60</b></span><span>행동 <b>${E(C.rangeText(s.behavior.display))} / 40</b></span></div></section><h3 class="clinic-section-title">01 · 마음이 향하는 네 방향</h3>${C.axes.map(a=>{const def=C.bank.axes[a],v=s.axisRatios[a];return `<section class="clinic-ratio"><div><span><b class="clinic-pole-letter">${E(def.left)}</b> ${E(def.leftLabel)} ${v.ready?v.left+'%':'—'}</span><span><b class="clinic-pole-letter">${E(def.right)}</b> ${E(def.rightLabel)} ${v.ready?v.right+'%':'—'}</span></div>${v.ready?`<div class="clinic-meter" role="meter" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${v.right}" aria-label="${E(def.rightLabel)} ${v.right}%"><span style="width:${v.right}%"></span></div>`:''}${!v.ready?'<p class="clinic-small">판단할 응답이 부족해요.</p>':!v.pole?'<p class="clinic-small">양쪽이 같은 경계입니다.</p>':''}</section>`;}).join('')}${s.possibleTypes.length>1?`<p class="clinic-small">함께 살펴볼 유형: ${s.possibleTypes.map(code=>E(code+' '+C.bank.types.find(t=>t.code===code).name)).join(' · ')}</p>`:''}<section class="clinic-profile"><h3 class="clinic-section-title">02 · 나의 팬 성향 해설</h3>${s.profile.paragraphs.map(p=>`<p>${E(p)}</p>`).join('')}<h4>주요 관찰 소견</h4>${s.findings.length?`<ul class="clinic-findings">${s.findings.slice(0,3).map(t=>`<li>${E(t)}</li>`).join('')}</ul>`:'<p>확인 가능한 응답을 조금 더 모은 뒤 소견을 살펴보세요.</p>'}</section>${C.contextLines(state).length?`<section class="clinic-context"><h4>씨야를 챙기는 나의 방법 <small>점수 제외</small></h4>${C.contextLines(state).map(t=>`<p>${E(t)}</p>`).join('')}</section>`:''}${prescriptionHTML(s.profile.prescription)}<p class="clinic-closing">좋아하는 방식은 달라도,<br>소중한 마음은 저마다의 속도로 자랍니다.</p><div class="clinic-document-foot">씨야를 좋아하는 방식을 살펴보는 팬 테스트입니다.<br>검토용 문항 · 유형명과 산식은 수정될 수 있습니다.</div></article><div class="clinic-actions"><button data-action="summary" class="clinic-primary">진단서 요약 이미지 저장</button><button data-action="png">전체 진단서 이미지 저장</button><button data-action="print">인쇄 / PDF 저장</button><button data-action="review">응답 수정하기</button><button data-action="home">다시 검사하기</button></div>`;focus();}
 function render(){notice(storageWarning);if(!state)return home();if(state.stage==='result')result();else if(state.stage==='review')review();else question();}
 async function png(kind='full'){
  const summary=kind==='summary';
  const {blob}=summary?await summaryExport.capture({name:name(),date:date(),modeLabel:modeLabel(),model:model()}):await imageExport.capture(document.getElementById('clinicCertificate'));
  if(imageUrl)URL.revokeObjectURL(imageUrl);imageUrl=URL.createObjectURL(blob);const url=imageUrl;
  const dialog=document.createElement('dialog');dialog.className='clinic-image-dialog';
  dialog.innerHTML=`<h2>${summary?'진단서 요약 이미지':'전체 진단서 이미지'}</h2>${summary?'<p class="clinic-small">1080 × 1350 · 세로형 요약 이미지</p>':''}<img src="${url}" alt="${summary?'나의 씨야 과몰입 진단서 요약':'나의 씨야 과몰입 진단서'}"><div class="clinic-actions"><a href="${url}" download="${summary?'seeya-clinic-summary.png':'seeya-clinic.png'}">PNG 내려받기</a><button type="button">닫기</button></div>`;
  dialog.querySelector('button').onclick=()=>dialog.close();dialog.onclose=()=>{dialog.remove();URL.revokeObjectURL(url);if(imageUrl===url)imageUrl=null;};document.body.append(dialog);dialog.showModal();
 }
 app.addEventListener('change',e=>{
  if(!state||state.stage!=='question')return;
  const id=state.questionOrder[state.currentIndex],q=C.byId[id];
  if(e.target.dataset?.inventoryItem&&q.kind==='inventory'){
   const item=e.target.dataset.inventoryItem;if(!q.items.some(i=>i.id===item))return;
   const next={...(state.answersById[id]||{}),[item]:e.target.value};if(!C.storable(id,next))return;state.answersById[id]=next;
   const output=app.querySelector('#clinicInventorySummary');if(output)output.textContent=inventoryText(q,next);
  }else if(e.target.name==='clinicAnswer'&&q.kind!=='inventory'){
   const value=e.target.value;if(!C.validAnswer(id,value))return;state.answersById[id]=value;
  }else return;
  write();notice(storageWarning);const done=C.answeredCount(state);app.querySelector('.clinic-progress').lastElementChild.textContent=`응답 완료 ${done} / ${state.questionOrder.length}`;app.querySelector('progress').value=done;
 });
 app.addEventListener('click',async e=>{
  const b=e.target.closest('button');if(!b)return;notice('');
  if(b.dataset.action==='legacy'){backupLegacy();return;}
  if(b.dataset.resume){state=savedModes[b.dataset.resume]||null;render();return;}
  if(b.dataset.start){
   if(!C.forms.modes[b.dataset.start])return;
   if(savedModes[b.dataset.start]&&!window.confirm(C.forms.modes[b.dataset.start].label+'의 새 버전 진행·진단서를 덮어쓰고 새로 시작할까요?'))return;
   const previous=state,wantsCarry=!!app.querySelector('#clinicCarry')?.checked;
   state=C.create(b.dataset.start,app.querySelector('#clinicName').value,crypto.randomUUID());
   const copied=wantsCarry?C.carryAnswers(previous,state):0;error='';write();render();
   if(wantsCarry&&!storageWarning)notice(copied?`공통 응답 ${copied}개를 가져왔어요. 각 문항에서 다시 수정할 수 있습니다.`:'같은 닉네임의 가져올 공통 응답이 없어 새로 시작했어요.');return;
  }
  if(!state)return;
  const action=b.dataset.action;
  if(action==='home'){home();focus();return;}
  if(action==='resume'){render();return;}
  if(action==='previous'){state.currentIndex=Math.max(0,state.currentIndex-1);state.stage='question';}
  else if(action==='next'){
   const id=state.questionOrder[state.currentIndex];
   if(state.currentIndex===state.questionOrder.length-1)state.stage='review';else state.currentIndex++;
  }else if(action==='review')state.stage='review';
  else if(action==='back')state.stage='question';
  else if(b.dataset.question!==undefined){const index=Number(b.dataset.question);if(!Number.isInteger(index)||index<0||index>=state.questionOrder.length)return;state.currentIndex=index;state.stage='question';}
  else if(action==='complete'){state.completedAt=new Date().toISOString();state.stage='result';}
  else if(action==='print'){b.disabled=true;try{if(document.fonts?.ready)await document.fonts.ready;printer.prepare();window.print();notice('A4 세로 2쪽으로 구성했어요. 인쇄 창에서 PDF로 저장을 선택해주세요.');}catch(e){notice(e.message||'인쇄 화면을 준비하지 못했어요. 다시 시도해주세요.');}finally{b.disabled=false;}return;}
  else if(action==='png'||action==='summary'){if(exporting)return;exporting=true;const buttons=[...app.querySelectorAll('[data-action="png"], [data-action="summary"]')];buttons.forEach(button=>button.disabled=true);try{await png(action==='summary'?'summary':'full');}catch(e){notice(e.message||'이미지를 만들지 못했어요. 다시 시도해주세요.');}finally{exporting=false;buttons.forEach(button=>button.disabled=false);}return;}
  else return;
  write();render();
 });
 home();
}
