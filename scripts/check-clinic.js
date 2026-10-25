'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const C=require('../src/shared/clinic-scoring'),I=require('../src/shared/clinic-interpretation'),Summary=require('../src/client/clinic-summary');
const clone=v=>JSON.parse(JSON.stringify(v));
function response(q,high=true,pole='left'){
 if(q.kind==='inventory')return Object.fromEntries(q.items.map(i=>[i.id,high?'seeya':'other']));
 if(q.kind==='preference')return pole;
 if(q.area==='emotion')return high?'5':'1';
 return {binary:high?'yes':'no',frequency:high?'7':'0',share:high?'most':'none'}[q.kind];
}
function complete(mode='max',high=true,pole='left'){
 const s=C.create(mode,'확인용','fixture-'+mode);
 for(const id of s.questionOrder)s.answersById[id]=response(C.byId[id],high,pole);
 return s;
}
const selected=C.forms.modes,setting=C.byId['BEH-01'];
assert.equal(C.bank.questions.length,148);assert.equal(new Set(C.bank.questions.map(q=>q.id)).size,148);
assert.equal(C.bank.types.length,16);assert.equal(new Set(C.bank.types.map(t=>t.code)).size,16);
assert.deepEqual(C.axes.map(a=>C.bank.questions.filter(q=>q.axis===a).length),[28,26,32,30]);
assert(selected.brief.ids.every(id=>selected.detailed.ids.includes(id)));
assert(selected.detailed.ids.every(id=>selected.max.ids.includes(id)));
for(const q of C.bank.questions){
 assert(q.prompt&&q.instruction&&q.period);
 if(q.kind==='preference'){
  assert.equal(q.leftPole,C.bank.axes[q.axis].left);assert.equal(q.rightPole,C.bank.axes[q.axis].right);
  assert.deepEqual(q.choices.slice(0,2).map(c=>c.value),q.displayOrder);
  assert.equal(new Set(q.choices.map(c=>c.value)).size,3);
 }else if(q.kind!=='inventory')assert(q.choices.length>1);
}
assert.throws(()=>C.create('invalid'));
for(const [mode,count,emotionCount,behaviorCount] of [['brief',20,4,4],['detailed',60,12,8],['max',148,24,8]]){
 const f=selected[mode],qs=C.engine.forForm(C.data,mode).questions;
 assert.equal(f.ids.length,count);assert.equal(new Set(f.ids).size,count);
 assert.equal(qs.filter(q=>q.area==='emotion').length,emotionCount);
 assert.equal(qs.filter(q=>q.area==='behavior').length,behaviorCount);
 assert.equal(qs.filter(q=>q.scorePart==='emotion').reduce((n,q)=>n+q.weight,0),60);
 assert.equal(qs.filter(q=>q.scorePart==='behavior').reduce((n,q)=>n+q.weight,0),40);
 const high=complete(mode),low=complete(mode,false),s=C.score(high);
 assert.equal(s.typeCode,'MRIP');assert.equal(C.score(complete(mode,true,'right')).typeCode,'SDTF');
 assert.equal(C.answeredCount(high),count);assert.equal(C.restore(high),high);
 assert.deepEqual(s.depthRange,{low:100,high:100,exact:true});assert.equal(C.score(low).depthScore,0);
 for(const q of qs.filter(q=>q.area==='emotion'))low.answersById[q.id]='5';
 assert.equal(C.score(low).depthScore,60);
 const uncertain=complete(mode);uncertain.answersById['BEH-01']=Object.fromEntries(setting.items.map(i=>[i.id,'unused']));
 assert.deepEqual(C.score(uncertain).depthRange,{low:95,high:95,exact:true});
 assert.equal(C.score(uncertain).depthScore,95);assert.equal(C.score(uncertain).depthReady,true);
 assert.equal(C.rangeText(C.score(uncertain).depthRange),'95');
 for(const q of qs.filter(q=>q.kind==='preference'))uncertain.answersById[q.id]='unknown';
 assert.equal(C.score(uncertain).typeCode,null);assert.equal(C.score(uncertain).possibleTypes.length,0);
 assert.deepEqual(C.score(high).axisRatios,C.score(low).axisRatios);
 for(const t of C.bank.types){
  const st=complete(mode);C.axes.forEach((a,i)=>st.questionOrder.filter(id=>C.byId[id].axis===a).forEach(id=>st.answersById[id]=t.code[i]===C.bank.axes[a].left?'left':'right'));
  const sc=C.score(st),profile=I.explain(sc);assert.equal(sc.typeCode,t.code);assert.equal(profile.meaning.map(m=>m.code).join(''),t.code);
  assert.equal(profile.paragraphs.length,2);assert.equal(profile.findings.length,3);
  assert.deepEqual(I.explain({...sc,depthScore:0}),I.explain({...sc,depthScore:100}));
 }
 const irrelevant=C.create(mode);for(const q of C.bank.questions)if(!f.ids.includes(q.id))irrelevant.answersById[q.id]=response(q);
 assert.equal(C.score(irrelevant).answered,0);assert.equal(C.score(irrelevant).depthScore,0);
}
const context=complete(),before=C.score(context).depthRange;
context.answersById['BEH-02']=Object.fromEntries(C.byId['BEH-02'].items.map(i=>[i.id,'unused']));context.answersById['BEH-07']='no-opportunity';
assert.deepEqual(C.score(context).depthRange,before);assert.equal(C.contextLines(context).length,2);assert.equal(C.contextLines(complete('brief')).length,0);
const other=Object.fromEntries(setting.items.map(i=>[i.id,'other']));
assert.equal(C.engine.inventory(setting,{...other,lock:'seeya'}).low,1/3);
assert.equal(C.engine.inventory(setting,{...other,lock:'seeya',home:'seeya',keyboard:'seeya',watch:'seeya'}).low,1/3);
assert.equal(C.engine.bound(C.byId['BEH-05'],'unavailable').known,0);assert.equal(C.engine.bound(C.byId['BEH-05'],'0').known,1);
const weights=complete('brief');weights.answersById['BEH-05']='0';assert.equal(C.score(weights).depthScore,85);
const detailed=complete('detailed');detailed.answersById['BEH-05']='0';assert.equal(C.score(detailed).depthScore,92);
const missing=complete('brief');missing.answersById['MAX2-DEPTH-001']='unknown';assert.equal(C.score(missing).depthReady,true);assert.equal(C.score(missing).depthScore,85);
missing.answersById['MAX2-MS-001']='unknown';assert.equal(C.score(missing).axisRatios.MS.ready,false);
const missingGroup=complete();for(const q of C.bank.questions.filter(q=>q.scoringGroup==='기대와 기다림'))missingGroup.answersById[q.id]='unknown';
assert.equal(C.score(missingGroup).emotion.ready,true);
const tied=complete('detailed');for(const a of C.axes)tied.questionOrder.filter(id=>C.byId[id].axis===a).forEach((id,i)=>tied.answersById[id]=i<5?'left':'right');
assert.equal(C.score(tied).typeCode,null);assert.equal(C.score(tied).possibleTypes.length,16);assert.equal(C.score(tied).axisRatios.MS.left,50);
assert.equal(I.explain(C.score(tied)).meaning.length,0);
const partial=C.create('brief');partial.answersById['BEH-01']={lock:'seeya',home:''};
assert.equal(C.restore(partial),partial);assert.equal(C.answeredCount(partial),0);assert(!C.validAnswer('BEH-01',partial.answersById['BEH-01']));
const good=complete();for(const patch of [{bankRevision:'old'},{formRevision:'old'},{scoringRevision:'old'},{currentIndex:999},{answersById:{'MAX2-MS-001':1}},{answersById:{'BEH-01':{noSuch:'other'}}},{questionOrder:good.questionOrder.slice(1)},{stage:'result',completedAt:'invalid'},{displayDirections:{}}])assert.throws(()=>C.restore({...good,...patch}));
assert(!C.validAnswer('BEH-05','999'));assert(!C.validAnswer('MAX2-MS-001',1));
const from=complete('brief'),original=JSON.stringify(from),to=C.create('detailed',from.displayName);
assert.equal(C.carryAnswers(from,to),20);assert.equal(C.answeredCount(to),20);assert.equal(JSON.stringify(from),original);
to.answersById['BEH-01'].lock='other';assert.equal(from.answersById['BEH-01'].lock,'seeya');
assert.equal(C.carryAnswers(from,C.create('max','다른 사람')),0);
assert.equal(C.carryAnswers(from,C.create('brief',from.displayName)),20);
assert.equal(C.carryAnswers({...from,bankRevision:'old'},C.create('max',from.displayName)),0);
// Blank, partial and unavailable answers always produce one fixed-denominator score.
for(const mode of Object.keys(selected)){
 const blank=C.create(mode),empty=C.score(blank);assert.equal(empty.depthScore,0);assert.equal(empty.depthReady,true);assert.equal(empty.typeCode,null);
 blank.stage='result';blank.completedAt=new Date().toISOString();assert.equal(C.restore(blank),blank);
 const old={...complete(mode),scoringRevision:'clinic-integrated-60-40-v2'};const before=JSON.stringify(old);const migrated=C.restore(old);
 assert.equal(migrated.scoringRevision,C.scoringRevision);assert.equal(JSON.stringify(old),before);assert.deepEqual(migrated.answersById,old.answersById);
 const variants=[{},Object.fromEntries(setting.items.map(i=>[i.id,'unused'])),{lock:'seeya'},Object.fromEntries(setting.items.map(i=>[i.id,'other']))];
 for(const v of variants){const b=C.engine.bound(setting,v);assert.equal(b.low,b.high);}
 const st=complete(mode);for(const id of st.questionOrder)if(C.byId[id].kind!=='preference')delete st.answersById[id];
 assert.equal(C.score(st).typeCode,'MRIP');assert.equal(C.score(st).depthScore,0);
 for(const id of st.questionOrder){const q=C.byId[id];if(q.scorePart==='emotion'||q.scorePart==='behavior')st.answersById[id]=q.kind==='inventory'?{}:'unknown';}
 assert.equal(C.score(st).depthScore,0);
 const scored=C.score(complete(mode));assert.equal(scored.depthScore,scored.emotion.display.low+scored.behavior.display.low);
}
const routePaths=new Set(require('../src/data/routes.json').map(r=>r.path));
const prescriptions=[...Object.values(I.profiles.types).map(p=>p.prescription),...Object.values(I.profiles.fallbackPrescriptions)];
assert.equal(new Set(prescriptions.map(p=>p.medicine)).size,18);
assert.equal(new Set(prescriptions.map(p=>p.mission)).size,18);
for(const p of prescriptions){
 assert(/ (캡슐|시럽)$/.test(p.medicine));
 for(const k of ['medicine','dose','mission','after'])assert(typeof p[k]==='string'&&p[k].trim());
 assert.deepEqual(Object.keys(p.link).sort(),['href','label']);
 assert(p.link.href.startsWith('/')&&!p.link.href.startsWith('//'));
 const url=new URL(p.link.href,'https://seeya-fanpage.com');assert.equal(url.origin,'https://seeya-fanpage.com');assert(routePaths.has(url.pathname));
 assert(!p.link.href.includes('/test/'));assert(p.link.label);
}
assert.equal(I.explain(C.score(tied)).prescription,I.profiles.fallbackPrescriptions.balanced);
assert.equal(I.explain(C.score(C.create('brief'))).prescription,I.profiles.fallbackPrescriptions.insufficient);
console.log('PASS clinic model: agreed 20/60/148, 16 types, canonical A/B, 60/40 independent scoring, settings domain cap, context-only items, zero missing / unused points and explicit scoring migration, partial saves and safe carry.');

const html=fs.readFileSync('game/clinic/test/index.html','utf8');assert(html.includes('noindex,nofollow'));assert(!html.includes('analytics.js')&&!html.includes('googletagmanager'));assert(!fs.readFileSync('sitemap.xml','utf8').includes('/game/clinic/test/'));assert(fs.readFileSync('game/clinic/index.html','utf8').includes('준비중'));assert(!fs.readFileSync('game/index.html','utf8').includes('/game/clinic/test/'));
// Exercise the actual shipped event handlers, storage and DOM-based image/print exports.
const source=fs.readFileSync('src/client/clinic.js','utf8'),values=new Map([['seeya-clinic-test-progress-v1','{"legacy":"retain exactly"}']]),handlers={};
let checked=false,nickname='<img src=x onerror=x>',printed=false,dialog=null,capturedHTML='',preparedHTML='',blob=null,captureFailure=false,prepareFailure=false,captureGate=null,summaryData=null,summaryFailure=false,summaryGate=null,captureCount=0,summaryCount=0;
const key=mode=>'seeya-clinic-test-progress-v2'+(mode==='max'?'':'-'+mode);
const current=mode=>JSON.parse(values.get(key(mode)));
const exportButtons=[{dataset:{action:'png'},disabled:false},{dataset:{action:'summary'},disabled:false}];
const app={innerHTML:'',querySelectorAll:()=>exportButtons,querySelector:q=>q==='#clinicName'?{value:nickname}:q==='#clinicCarry'?{checked}:q==='.clinic-progress'?{lastElementChild:{textContent:''}}:q==='progress'?{value:0}:q==='#clinicInventorySummary'?{textContent:''}:null,scrollIntoView(){},addEventListener:(e,fn)=>handlers[e]=fn};
const notice={textContent:'',hidden:true};
const certificate={get outerHTML(){return app.innerHTML.match(/<article id="clinicCertificate"[\s\S]*?<\/article>/)?.[0]||'';}};
const capture={capture:async target=>{captureCount++;assert.equal(target,certificate,'capture the actual certificate node, not a text summary');capturedHTML=target.outerHTML;if(captureGate)await captureGate;if(captureFailure)throw Error('이미지 저장 실패 검사');return {blob:{type:'image/png'},width:1600,height:3200};}};
const summaryCapture={capture:async data=>{summaryCount++;summaryData=clone(data);if(summaryGate)await summaryGate;if(summaryFailure)throw Error('요약 이미지 저장 실패 검사');return {blob:{type:'image/png'},width:1080,height:1350};}};
const printing={install:getCertificate=>({prepare(){assert.equal(getCertificate(),certificate);preparedHTML=getCertificate().outerHTML;if(prepareFailure)throw Error('인쇄 준비 실패 검사');}})};
const ctx={require:p=>p==='./clinic-image'?capture:p==='./clinic-summary'?summaryCapture:p==='./clinic-print'?printing:p.includes('clinic-interpretation')?I:p.includes('clinic-scoring')?C:require('../src/shared/common'),document:{fonts:{ready:Promise.resolve()},getElementById:id=>id==='clinicApp'?app:id==='clinicCertificate'?(certificate.outerHTML?certificate:null):notice,createElement:tag=>tag==='dialog'?(dialog={innerHTML:'',querySelector:()=>({}),showModal(){this.open=true;},close(){},remove(){}}):{click(){},remove(){}},body:{append(){}}},localStorage:{getItem:k=>values.get(k)||null,setItem:(k,v)=>values.set(k,v)},window:{confirm:()=>true,print:()=>{assert(preparedHTML,'prepare page structure before opening print');printed=true;}},crypto:{randomUUID:()=> 'clinic-fixture'},Date,Intl,JSON,Number,Math,String,URL:{createObjectURL:b=>{blob=b;return 'blob:fixture';},revokeObjectURL(){}},Promise,Blob:class{constructor(parts){this.text=parts.join('');}},setTimeout:fn=>fn()};
const load=()=>vm.runInNewContext('(function(){'+source+'})();',ctx);
const click=(dataset,button=exportButtons.find(b=>b.dataset.action===dataset.action)||{dataset})=>handlers.click({target:{closest:()=>button}});
const change=(value,item)=>handlers.change({target:{name:item?'':'clinicAnswer',value,dataset:item?{inventoryItem:item}:{}}});
const answer=q=>{const v=response(q);if(q.kind==='inventory')q.items.forEach(i=>change(v[i.id],i.id));else change(v);};
(async()=>{
 load();assert(app.innerHTML.includes('이전 검사 기록 파일로 보관'));
 for(const mode of ['brief','detailed','max']){
  await click({action:'home'});await click({start:mode});assert.equal(C.answeredCount(current(mode)),0);
  const count=selected[mode].ids.length;
  await click({action:'next'});assert.equal(current(mode).currentIndex,1);await click({action:'previous'});
  for(let i=0;i<count;i++){
   const q=C.byId[current(mode).questionOrder[i]];
   if(q.kind==='inventory'&&mode==='brief'){
    change('seeya',q.items[0].id);await click({action:'next'});assert.equal(current(mode).currentIndex,i+1);await click({action:'previous'});
    load();await click({resume:mode});assert(app.innerHTML.includes('value="seeya" selected'));assert(app.innerHTML.includes('미선택'));
   }
   answer(q);await click({action:'next'});
  }
  assert(app.innerHTML.includes('미응답 0문항'));await click({action:'complete'});
  assert(app.innerHTML.includes('소리 수집가 형'));assert(!app.innerHTML.includes('<img src=x'));assert(app.innerHTML.includes('&lt;img'));
  assert(app.innerHTML.includes('clinicCertificate'));assert(app.innerHTML.includes('나의 팬 성향 해설'));
  const scoreSection=app.innerHTML.match(/<section class="clinic-depth"[\s\S]*?<\/section>/)?.[0];
  assert(scoreSection?.includes('00 · 과몰입 지수')&&scoreSection.includes('100</strong>')&&scoreSection.includes('마음'));
  assert(scoreSection.includes('과몰입 지수는 마음과 행동 점수를 합친 값입니다.'));
  for(const obsolete of ['마음 60점과 행동 40점','팬 경력이나 우열','미응답·기능 미사용·판단 불가','각각 반올림','검사 길이별 점수','세 응답이 모두','2:1 선택','빠른 방향 확인용'])assert(!scoreSection.includes(obsolete),obsolete+' should not appear in the result score section');
  const scoreText=scoreSection.match(/<div class="clinic-score">([\s\S]*?)<\/div>/)?.[1].replace(/<[^>]*>/g,' ').replace(/\s+/g,' ').trim();
  assert.equal(scoreText,'과몰입 지수 100 / 100');
  assert(app.innerHTML.indexOf('00 · 과몰입 지수')<app.innerHTML.indexOf('01 · 마음이 향하는 네 방향'));
  assert(!app.innerHTML.includes(current(mode).bankRevision)&&!app.innerHTML.includes(current(mode).formRevision)&&!app.innerHTML.includes(current(mode).scoringRevision));
  assert.equal((app.innerHTML.match(/class="clinic-pole-letter"/g)||[]).length,8);
  assert.equal((app.innerHTML.match(/class="clinic-meter"/g)||[]).length,4);
  assert(app.innerHTML.includes('class="eye clinic-type-eyebrow"'));
  assert(!app.innerHTML.includes('두 비율은 응답의 기울기'));assert(app.innerHTML.includes('100</strong>'));
  assert.equal(app.innerHTML.includes('씨야를 챙기는 나의 방법'),mode!=='brief');
  assert(!app.innerHTML.includes('data-action="copy"')&&!app.innerHTML.includes('결과 문구 복사'));
  printed=false;await click({action:'print'});assert(printed);assert.equal(preparedHTML,certificate.outerHTML);
  await click({action:'png'});assert(dialog.open&&dialog.innerHTML.includes('PNG 내려받기'));assert.equal(capturedHTML,certificate.outerHTML);assert(capturedHTML.includes('100</strong>'));
  assert(!capturedHTML.includes('data-action="png"'),'save just the certificate, not its toolbar');
  assert(app.innerHTML.includes('data-action="summary"'));
  const beforeSummary=values.get(key(mode));await click({action:'summary'});
  assert(dialog.open&&dialog.innerHTML.includes('진단서 요약 이미지')&&dialog.innerHTML.includes('PNG 내려받기')&&dialog.innerHTML.includes('seeya-clinic-summary.png'));
  assert.equal(summaryData.name,current(mode).displayName);assert.equal(summaryData.modeLabel,C.forms.modes[mode].label);
  assert.equal(summaryData.model.typeCode,'MRIP');assert.equal(summaryData.model.depthDisplay,'100');
  assert.deepEqual(summaryData.model.axisRatios,clone(C.score(current(mode)).axisRatios));
  assert(summaryData.date&&summaryData.model.profile.prescription.medicine);
  const summaryHTML=Summary.renderMarkup(summaryData);assert(!summaryHTML.includes(nickname));assert(summaryHTML.includes('&lt;img'));
  assert(summaryHTML.includes('100</strong>')&&summaryHTML.includes('소리 수집가 형'));
  assert.equal(values.get(key(mode)),beforeSummary);
  load();assert(app.innerHTML.includes('진단서 다시 보기'));await click({resume:mode});assert(app.innerHTML.includes('100</strong>'));
 }
 assert.equal(values.get('seeya-clinic-test-progress-v1'),'{"legacy":"retain exactly"}');
 const max=values.get(key('max')),detailedBefore=values.get(key('detailed'));
 await click({action:'home'});await click({resume:'brief'});await click({question:String(selected.brief.ids.indexOf('BEH-01'))});
 setting.items.forEach(i=>change('unused',i.id));await click({action:'review'});await click({action:'complete'});
 assert(app.innerHTML.includes('95</strong>'));await click({action:'png'});assert(capturedHTML.includes('95</strong>'));
 assert.equal(values.get(key('max')),max);assert.equal(values.get(key('detailed')),detailedBefore);
 await click({action:'home'});checked=true;await click({start:'detailed'});assert.equal(C.answeredCount(current('detailed')),20);assert.equal(values.get(key('max')),max);
 assert.equal(current('brief').stage,'result');assert.equal(current('detailed').answersById['BEH-01'].lock,'unused');
 await click({action:'home'});nickname='다른 사람';await click({start:'max'});assert.equal(C.answeredCount(current('max')),0);
 await click({action:'legacy'});assert(blob.text.includes('retain exactly'));assert.equal(values.get('seeya-clinic-test-progress-v1'),'{"legacy":"retain exactly"}');
 const examples=C.bank.types.map(t=>{
  const state=complete('brief');
  C.axes.forEach((axis,i)=>state.questionOrder.filter(id=>C.byId[id].axis===axis).forEach(id=>state.answersById[id]=t.code[i]===C.bank.axes[axis].left?'left':'right'));
  return state;
 });
 examples.push(clone(tied));
 const unknown=complete('brief');for(const id of unknown.questionOrder)if(C.byId[id].kind==='preference')unknown.answersById[id]='unknown';examples.push(unknown);
 for(const state of examples){
  state.stage='result';state.completedAt=new Date().toISOString();assert.equal(C.restore(state),state);
  const rx=I.explain(C.score(state)).prescription;
  values.set(key(state.mode),JSON.stringify(state));load();await click({resume:state.mode});
  const section=app.innerHTML.match(/<section class="clinic-rx"[\s\S]*?<\/section>/)?.[0];
  assert(section&&section.includes(rx.medicine)&&section.includes(rx.mission));
  assert(section.includes('추천 재활 활동')&&section.includes('마음이 가는 활동만'));
  assert(!section.includes('오늘의 미션'));
  assert.equal((section.match(/<a /g)||[]).length,1);assert(section.includes('href="'+rx.link.href+'"'));
  await click({action:'png'});assert.equal(capturedHTML,certificate.outerHTML);
  await click({action:'print'});assert.equal(preparedHTML,certificate.outerHTML);
  const beforeSummary=values.get(key(state.mode));await click({action:'summary'});
  assert.equal(summaryData.model.typeCode,C.score(state).typeCode);
  assert.equal(summaryData.model.profile.prescription.medicine,rx.medicine);
  assert.equal(summaryData.model.profile.prescription.dose,rx.dose);
  const summaryHTML=Summary.renderMarkup(summaryData);
  assert(summaryHTML.includes(rx.medicine)&&summaryHTML.includes(rx.dose));
  assert.equal(summaryHTML.includes('class="clinic-summary-code"'),!!C.score(state).typeCode);
  assert.equal(summaryHTML.includes('clinic-summary-pending'),!C.score(state).typeCode);
  assert(!summaryHTML.includes(summaryData.model.profile.paragraphs[0]),'summary omits full interpretation paragraphs');
  assert.equal(values.get(key(state.mode)),beforeSummary);
  for(const content of [capturedHTML,preparedHTML]){
   for(const k of ['medicine','dose','mission','after'])assert(content.includes(rx[k]));
   assert(content.includes('href="'+rx.link.href+'"'));
   assert(content.includes('00 · 과몰입 지수')&&content.includes('01 · 마음이 향하는 네 방향')&&content.includes('02 · 나의 팬 성향 해설'));
   assert(content.includes('추천 재활 활동')&&!content.includes('오늘의 미션'));
   for(const revision of [state.bankRevision,state.formRevision,state.scoringRevision])assert(!content.includes(revision));
  }
 }
 // Anonymous display is presentation-only; blank names remain blank in saved answers.
 for(const inputName of ['', '   ', '씨야 팬']){
  const anonymous={...complete('brief'),...{displayName:C.create('brief',inputName).displayName,stage:'result',completedAt:new Date().toISOString()}};
  const raw=JSON.stringify(anonymous);values.set(key('brief'),raw);load();await click({resume:'brief'});
  const expected=inputName.trim()||'익명의 씨야 팬';
  assert(app.innerHTML.includes('성명 · '+expected));
  await click({action:'png'});assert(capturedHTML.includes('성명 · '+expected));
  await click({action:'print'});assert(preparedHTML.includes('성명 · '+expected));
  await click({action:'summary'});assert.equal(summaryData.name,expected);assert(Summary.renderMarkup(summaryData).includes(expected));
  assert.equal(values.get(key('brief')),raw);
 }
 // Actual UI: permit skipped questions and a partial inventory, then export one score.
 checked=false;nickname='빈 응답 검토';await click({action:'home'});await click({start:'brief'});
 await click({action:'next'});assert.equal(current('brief').currentIndex,1);
 await click({question:String(selected.brief.ids.indexOf('BEH-01'))});change('seeya','lock');
 await click({action:'review'});assert(app.innerHTML.includes('미응답 0점으로 진단서 발급'));
 await click({action:'complete'});assert.equal(C.restore(current('brief')).stage,'result');assert(app.innerHTML.includes('2</strong>'));
 await click({action:'png'});assert(capturedHTML.includes('2</strong>'));assert(!capturedHTML.includes('2~'));
 await click({action:'summary'});assert.equal(summaryData.model.depthDisplay,'2');assert.equal(summaryData.model.typeCode,null);
 load();await click({resume:'brief'});assert(app.innerHTML.includes('2</strong>'));
 // A failed or in-progress export cannot destroy answers or leave the button disabled.
 const beforeExport=values.get(key('brief')),beforeHTML=app.innerHTML;
 const imageButton=exportButtons[0];let releaseCapture;
 captureGate=new Promise(resolve=>releaseCapture=resolve);const inFlight=click(imageButton.dataset,imageButton);
 assert(exportButtons.every(b=>b.disabled));const priorSummaryCount=summaryCount;await click({action:'summary'});assert.equal(summaryCount,priorSummaryCount,'do not start another capture while full export is running');releaseCapture();await inFlight;assert(exportButtons.every(b=>!b.disabled));captureGate=null;
 captureFailure=true;await click(imageButton.dataset,imageButton);assert(notice.textContent.includes('이미지 저장 실패'));assert.equal(imageButton.disabled,false);captureFailure=false;
 const summaryButton=exportButtons[1];let releaseSummary;
 summaryGate=new Promise(resolve=>releaseSummary=resolve);const summaryInFlight=click(summaryButton.dataset,summaryButton);
 assert(exportButtons.every(b=>b.disabled));const priorCaptureCount=captureCount;await click({action:'png'});assert.equal(captureCount,priorCaptureCount,'do not start another capture while summary export is running');releaseSummary();await summaryInFlight;assert(exportButtons.every(b=>!b.disabled));summaryGate=null;
 summaryFailure=true;await click(summaryButton.dataset,summaryButton);assert(notice.textContent.includes('요약 이미지 저장 실패'));assert.equal(summaryButton.disabled,false);summaryFailure=false;
 const printButton={dataset:{action:'print'},disabled:false};prepareFailure=true;printed=false;await click(printButton.dataset,printButton);
 assert(notice.textContent.includes('인쇄 준비 실패'));assert.equal(printButton.disabled,false);assert.equal(printed,false);prepareFailure=false;
 assert.equal(values.get(key('brief')),beforeExport);assert.equal(app.innerHTML,beforeHTML);
 console.log('PASS prescriptions: all 16 distinct prescriptions and two unresolved fallbacks, one relevant public link, exact certificate DOM passed to image/print export, summary scores/types/prescriptions including unresolved results, anonymous names and hidden revision metadata.');
 ctx.localStorage.getItem=()=>'{broken';load();assert(notice.textContent.includes('읽을 수'));
 ctx.localStorage.getItem=()=>null;ctx.localStorage.setItem=()=>{throw Error('quota');};load();checked=false;await click({start:'brief'});assert(app.innerHTML.includes('현재 1 / 20'));assert(notice.textContent.includes('저장하지 못'));
 console.log('PASS clinic client: all 228 responses, partial inventory/reload, completion/review, 3-mode isolation, opted-in carry/name guard, legacy backup, single scores, concise score labels, full/summary image controls, PDF preparation, full/summary image and print failure recovery, escaping/storage errors and public isolation.');
})().catch(e=>{console.error(e);process.exitCode=1;});
