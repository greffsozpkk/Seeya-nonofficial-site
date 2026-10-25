'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const C=require('../src/shared/clinic-scoring'),I=require('../src/shared/clinic-interpretation'),Summary=require('../src/client/clinic-summary'),Completion=require('../src/shared/clinic-completion');
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
assert.equal(C.score(tied).typeCode,'MRIP');assert.deepEqual(C.score(tied).possibleTypes,['MRIP']);assert.equal(C.score(tied).axisRatios.MS.left,52);
assert.equal(I.explain(C.score(tied)).meaning.length,4);
// Exact ties use a stable answered representative; ordinary majorities stay untouched.
const tiePriority={MS:['001','018','012'],RD:['001','004','017'],IT:['001','008','032'],PF:['001','017','020']};
for(const axis of C.axes){
 tiePriority[axis]=tiePriority[axis].map(n=>'MAX2-'+axis+'-'+n);
 assert.deepEqual(C.bank.scoring.preferenceTieBreak.priority[axis],tiePriority[axis]);
}
assert.equal(C.bank.scoring.preferenceTieBreak.bonus,.5);
function setBalancedAxis(state,axis,skipped=[],anchor=tiePriority[axis][0],side='left'){
 const ids=state.questionOrder.filter(id=>C.byId[id].axis===axis);
 for(const id of skipped)state.answersById[id]='unknown';
 const active=ids.filter(id=>!skipped.includes(id));assert(active.includes(anchor));assert.equal(active.length%2,0);
 const ordered=[anchor,...active.filter(id=>id!==anchor)];
 ordered.forEach((id,i)=>state.answersById[id]=i<active.length/2?side:side==='left'?'right':'left');
 return active;
}
for(const mode of ['detailed','max']){
 const allTied=complete(mode);for(const axis of C.axes)setBalancedAxis(allTied,axis);
 const before=JSON.stringify(allTied),sc=C.score(allTied);assert.equal(sc.typeCode,'MRIP');assert.equal(sc.possibleTypes.length,1);assert.equal(sc.depthScore,100);
 assert.equal(JSON.stringify(allTied),before,'scoring must not mutate answers');
 assert.deepEqual(C.score(C.restore(clone(allTied))),sc,'restored answers resolve the same way');
 const mirrored=clone(allTied);for(const id of mirrored.questionOrder)if(C.byId[id].kind==='preference')mirrored.answersById[id]=mirrored.answersById[id]==='left'?'right':'left';
 const ms=C.score(mirrored);assert.equal(ms.typeCode,'SDTF');assert.equal(ms.depthScore,sc.depthScore);
 const reordered={...C.data,questions:C.data.questions.map(q=>q.kind==='preference'?{...q,displayOrder:[...q.displayOrder].reverse(),choices:[...q.choices].reverse()}:q),forms:{...C.data.forms,[mode]:{...C.data.forms[mode],ids:[...C.data.forms[mode].ids].reverse()}}};
 assert.equal(C.engine.score(reordered,allTied.answersById,mode).typeCode,sc.typeCode,'display A/B or form ordering must not decide a tie');
 for(const axis of C.axes){
  const row=sc.axisResults[axis],ratio=sc.axisRatios[axis];
  assert.equal(row.left,row.right);assert.equal(row.weightedLeft,row.left+.5);assert.equal(row.weightedRight,row.right);assert.equal(row.weightTotal,row.valid+.5);
  assert.equal(row.tieResolved,true);assert.equal(row.tieBreakQuestionId,tiePriority[axis][0]);
  assert.equal(ratio.tieResolved,true);assert.equal(ratio.tieBreakQuestionId,row.tieBreakQuestionId);
  assert.equal(ratio.left+ratio.right,100);assert(ratio.left>50&&ratio.left<=53);
  assert.equal(ms.axisRatios[axis].right,ratio.left);assert.equal(ms.axisRatios[axis].left,ratio.right);
  const majority=complete(mode),ids=majority.questionOrder.filter(id=>C.byId[id].axis===axis),primary=tiePriority[axis][0];
  majority.answersById[primary]='right';const rest=ids.filter(id=>id!==primary);rest.forEach((id,i)=>majority.answersById[id]=i<ids.length/2+1?'left':'right');
  const mr=C.score(majority).axisResults[axis];assert.equal(mr.pole,C.bank.axes[axis].left);assert.equal(mr.tieResolved,false);assert.equal(mr.weightedLeft,mr.left);assert.equal(mr.weightedRight,mr.right);
  assert.equal(mr.leftPercent,Math.round(mr.left/mr.valid*100),'non-tie ratio remains raw');
  const fallback=complete(mode),priority=tiePriority[axis],other=ids.findLast(id=>!priority.includes(id));
  setBalancedAxis(fallback,axis,[priority[0],other],priority[1],'right');
  const fr=C.score(fallback).axisResults[axis];assert(fr.ready&&fr.tieResolved);assert.equal(fr.tieBreakQuestionId,priority[1]);assert.equal(fr.pole,C.bank.axes[axis].right);
 }
}
for(const axis of C.axes){
 const fallback=complete('max'),ids=fallback.questionOrder.filter(id=>C.byId[id].axis===axis),priority=tiePriority[axis];
 const extra=ids.findLast(id=>!priority.includes(id)),skipped=[...priority,extra];
 const canonical=ids.filter(id=>!skipped.includes(id)).sort()[0];setBalancedAxis(fallback,axis,skipped,canonical,'right');
 delete fallback.answersById[priority[0]];
 const row=C.score(fallback).axisResults[axis];assert(row.ready&&row.tieResolved);assert.equal(row.tieBreakQuestionId,canonical);assert.equal(row.pole,C.bank.axes[axis].right);
 const insufficient=complete('detailed'),small=insufficient.questionOrder.filter(id=>C.byId[id].axis===axis);
 setBalancedAxis(insufficient,axis,small.slice(6),small[0]);const short=C.score(insufficient);
 assert.equal(short.axisResults[axis].ready,false);assert.equal(short.axisResults[axis].tieResolved,false);assert.equal(short.typeCode,null,'too few answers must not invent a type');
}

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
 for(const revision of ['clinic-integrated-60-40-v2','clinic-integrated-zero-missing-v3']){
  const old={...complete(mode),scoringRevision:revision};const before=JSON.stringify(old);const migrated=C.restore(old);
  assert.equal(migrated.scoringRevision,C.scoringRevision);assert.equal(JSON.stringify(old),before);assert.deepEqual(migrated.answersById,old.answersById);assert.equal(C.score(migrated).depthScore,C.score(complete(mode)).depthScore);
 }
 const oldTie={...clone(tied),scoringRevision:'clinic-integrated-zero-missing-v3'};assert.equal(C.score(C.restore(oldTie)).typeCode,'MRIP');
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
assert.equal(I.explain(C.score(tied)).prescription,I.profiles.types.MRIP.prescription);
assert.equal(I.explain(C.score(C.create('brief'))).prescription,I.profiles.fallbackPrescriptions.insufficient);
// Completion revisits only the minimum unresolved A/B answers, never depth items.
for(const mode of Object.keys(selected)){
 const ready=complete(mode),originalReady=JSON.stringify(ready),readyPlan=Completion.plan(ready);
 assert.equal(readyPlan.needed,0);assert.deepEqual(readyPlan.ids,[]);assert.equal(JSON.stringify(ready),originalReady);
 const blank=C.create(mode),beforeBlank=JSON.stringify(blank),emptyPlan=Completion.plan(blank);
 const expected=C.axes.reduce((sum,axis)=>sum+Math.ceil(blank.questionOrder.filter(id=>C.byId[id].axis===axis).length*.8),0);
 assert.equal(emptyPlan.needed,expected);assert.equal(emptyPlan.ids.length,expected);assert.equal(emptyPlan.missing,expected);assert.equal(emptyPlan.unknown,0);
 assert(emptyPlan.ids.every(id=>C.byId[id].kind==='preference'));assert.equal(new Set(emptyPlan.ids).size,expected);
 assert.deepEqual(emptyPlan.ids,[...emptyPlan.ids].sort((a,b)=>blank.questionOrder.indexOf(a)-blank.questionOrder.indexOf(b)));
 assert.equal(JSON.stringify(blank),beforeBlank,'planning must not mutate stored progress');
 for(const axis of C.axes){
  const state=complete(mode),ids=state.questionOrder.filter(id=>C.byId[id].axis===axis),required=Math.ceil(ids.length*.8),inactive=ids.slice(required-1);
  inactive.forEach(id=>delete state.answersById[id]);state.answersById[inactive[0]]='unknown';
  const before=JSON.stringify(state),depth=C.score(state).depthScore,plan=Completion.plan(state);
  assert.equal(plan.needed,1);assert.equal(plan.ids.length,1);assert.equal(C.byId[plan.ids[0]].axis,axis);
  assert.equal(plan.ids[0],inactive.length>1?inactive[1]:inactive[0],'unanswered questions take priority over a deliberate unknown');
  assert.equal(plan.missing,inactive.length>1?1:0);assert.equal(plan.unknown,inactive.length>1?0:1);
  const row=plan.axes.find(row=>row.axis===axis);assert(row);assert.equal(row.required,required);assert.equal(row.valid,required-1);assert.equal(row.needed,1);
  assert.equal(JSON.stringify(state),before);
  const answers=clone(state.answersById),order=[...state.questionOrder];Completion.start(state);
  assert.deepEqual(state.answersById,answers);assert.deepEqual(state.questionOrder,order);assert.equal(state.stage,'question');
  assert.equal(state.questionOrder[state.currentIndex],plan.ids[0]);assert.deepEqual(Completion.session(state),state.completion);
  assert.deepEqual(Completion.session(C.restore(clone(state))),state.completion,'valid completion progress survives restore');
  state.answersById[plan.ids[0]]='left';assert(Completion.session(state),'an answer must not discard its active queue before Next');
  assert.equal(Completion.plan(state).needed,0);assert(C.score(state).typeCode);assert.equal(C.score(state).depthScore,depth);
  Completion.clear(state);assert.equal(Completion.session(state),null);assert.equal(state.completion,undefined);
  Completion.start(state);assert.equal(state.stage,'review');assert.equal(state.completion,undefined);
 }
 const unknown=complete(mode);for(const id of unknown.questionOrder)if(C.byId[id].kind==='preference')unknown.answersById[id]='unknown';
 const unknownPlan=Completion.plan(unknown);assert.equal(unknownPlan.needed,expected);assert.equal(unknownPlan.missing,0);assert.equal(unknownPlan.unknown,expected);
 const snapshot=clone(unknown);Completion.start(unknown);assert.deepEqual(unknown.answersById,snapshot.answersById);assert.equal(C.score(unknown).depthScore,100);
 const session=unknown.completion,preference=session.ids[0],depthId=unknown.questionOrder.find(id=>C.byId[id].kind!=='preference');
 for(const completion of [null,{}, {ids:[],index:0}, {ids:[preference,preference],index:0}, {ids:[depthId],index:0}, {ids:['unknown-question'],index:0}, {ids:[preference],index:1}, {ids:[preference],index:-1}, {ids:[preference],index:.5}]){
  const broken={...unknown,completion},before=JSON.stringify(broken);assert.equal(Completion.session(broken),null);
  const restored=C.restore(broken);assert.equal(restored.completion,undefined);assert.deepEqual(restored.answersById,unknown.answersById);
  assert.equal(restored.runId,unknown.runId);assert.equal(restored.currentIndex,unknown.currentIndex);assert.equal(JSON.stringify(broken),before,'recovery must leave the original saved object intact');
 }
 assert.equal(Completion.session({...unknown,stage:'result'}),null);assert.equal(Completion.session({...unknown,currentIndex:(unknown.currentIndex+1)%unknown.questionOrder.length}),null);
}
console.log('PASS clinic completion model: per-mode thresholds, minimal unanswered-first queues, unknown-only answers, ready-axis exclusion, depth preservation, persisted sessions and malformed queue rejection.');
console.log('PASS clinic model: agreed 20/60/148, 16 types, canonical A/B, 60/40 independent scoring, settings domain cap, context-only items, zero missing / unused points, representative tie resolution, stable version migration, partial saves and safe carry.');

const html=fs.readFileSync('game/clinic/test/index.html','utf8'),publicHTML=fs.readFileSync('game/clinic/index.html','utf8'),hubHTML=fs.readFileSync('game/index.html','utf8'),sitemap=fs.readFileSync('sitemap.xml','utf8');
assert(html.includes('noindex,nofollow'));assert(!html.includes('analytics.js')&&!html.includes('googletagmanager'));assert(!sitemap.includes('/game/clinic/test/'));assert(!hubHTML.includes('/game/clinic/test/'));
assert(html.includes('data-clinic-environment="test"'));assert(publicHTML.includes('data-clinic-environment="public"'));
assert(!publicHTML.includes('준비중')&&!publicHTML.includes('검토용'));assert(!/<meta name="(?:robots|googlebot)" content="[^"]*noindex/.test(publicHTML));
assert(sitemap.includes('<loc>https://seeya-fanpage.com/game/clinic/</loc>'));assert(publicHTML.includes('href="https://seeya-fanpage.com/game/clinic/"'));
assert(publicHTML.includes('href="/manifest.webmanifest"'));assert(!html.includes('href="/manifest.webmanifest"'));
const clinicAsset=(markup,extension)=>markup.match(new RegExp('/assets/clinic\\.[^"\\s]+\\.'+extension))?.[0];
for(const extension of ['js','css']){const asset=clinicAsset(publicHTML,extension);assert(asset,'public clinic '+extension+' bundle');assert.equal(asset,clinicAsset(html,extension),'public/test share the same implementation');assert(fs.existsSync('.'+asset));}
const clinicCard=hubHTML.match(/<a class="game-card game-card-clinic"[\s\S]*?<\/a>/)?.[0];
assert(clinicCard&&clinicCard.includes('href="/game/clinic/"'));assert(!clinicCard.includes('준비중'));assert(clinicCard.includes('검사 시작하기'));
for(const form of Object.values(selected))assert(clinicCard.includes(String(form.ids.length)),'PLAY reflects each actual form length');
// Exercise the actual shipped event handlers, storage and DOM-based image/print exports.
const source=fs.readFileSync('src/client/clinic.js','utf8'),values=new Map([['seeya-clinic-test-progress-v1','{"legacy":"retain exactly"}']]),handlers={};
let checked=false,nickname='<img src=x onerror=x>',printed=false,dialog=null,capturedHTML='',preparedHTML='',blob=null,captureFailure=false,prepareFailure=false,captureGate=null,summaryData=null,summaryFailure=false,summaryGate=null,captureCount=0,summaryCount=0;
const key=mode=>'seeya-clinic-test-progress-v2'+(mode==='max'?'':'-'+mode);
const current=mode=>JSON.parse(values.get(key(mode)));
const exportButtons=[{dataset:{action:'png'},disabled:false},{dataset:{action:'summary'},disabled:false}];
const app={dataset:{clinicEnvironment:'test'},innerHTML:'',querySelectorAll:()=>exportButtons,querySelector:q=>q==='#clinicName'?{value:nickname}:q==='#clinicCarry'?{checked}:q==='.clinic-progress'?{lastElementChild:{textContent:''}}:q==='progress'?{value:0}:q==='#clinicInventorySummary'?{textContent:''}:null,scrollIntoView(){},addEventListener:(e,fn)=>handlers[e]=fn};
const notice={textContent:'',hidden:true};
const certificate={get outerHTML(){return app.innerHTML.match(/<article id="clinicCertificate"[\s\S]*?<\/article>/)?.[0]||'';}};
const capture={capture:async target=>{captureCount++;assert.equal(target,certificate,'capture the actual certificate node, not a text summary');capturedHTML=target.outerHTML;if(captureGate)await captureGate;if(captureFailure)throw Error('이미지 저장 실패 검사');return {blob:{type:'image/png'},width:1600,height:3200};}};
const summaryCapture={capture:async data=>{summaryCount++;summaryData=clone(data);if(summaryGate)await summaryGate;if(summaryFailure)throw Error('요약 이미지 저장 실패 검사');return {blob:{type:'image/png'},width:1080,height:1350};}};
const printing={install:getCertificate=>({prepare(){assert.equal(getCertificate(),certificate);preparedHTML=getCertificate().outerHTML;if(prepareFailure)throw Error('인쇄 준비 실패 검사');}})};
const ctx={require:p=>p==='./clinic-image'?capture:p==='./clinic-summary'?summaryCapture:p==='./clinic-print'?printing:p.includes('clinic-interpretation')?I:p.includes('clinic-scoring')?C:p.includes('clinic-completion')?Completion:require('../src/shared/common'),document:{fonts:{ready:Promise.resolve()},getElementById:id=>id==='clinicApp'?app:id==='clinicCertificate'?(certificate.outerHTML?certificate:null):notice,createElement:tag=>tag==='dialog'?(dialog={innerHTML:'',setAttribute(){},querySelector:()=>({}),showModal(){this.open=true;},close(){},remove(){}}):{click(){},remove(){}},body:{append(){}}},localStorage:{getItem:k=>values.get(k)||null,setItem:(k,v)=>values.set(k,v)},window:{confirm:()=>true,print:()=>{assert(preparedHTML,'prepare page structure before opening print');printed=true;}},crypto:{randomUUID:()=> 'clinic-fixture'},Date,Intl,JSON,Number,Math,String,URL:{createObjectURL:b=>{blob=b;return 'blob:fixture';},revokeObjectURL(){}},Promise,Blob:class{constructor(parts){this.text=parts.join('');}},setTimeout:fn=>fn()};
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
   if(q.kind==='preference'){assert.equal(app.innerHTML.split(q.instruction).length-1,1,'one instruction per A/B question');assert(!app.innerHTML.includes('두 선택 중 더 자연스러운 쪽을 골라주세요.'));}
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
  await click({action:'png'});assert(dialog.open&&dialog.innerHTML.includes('PNG 이미지 저장'));assert.equal(capturedHTML,certificate.outerHTML);assert(capturedHTML.includes('100</strong>'));
  assert(!capturedHTML.includes('data-action="png"'),'save just the certificate, not its toolbar');
  assert(app.innerHTML.includes('data-action="summary"'));
  const beforeSummary=values.get(key(mode));await click({action:'summary'});
  assert(dialog.open&&dialog.innerHTML.includes('진단서 요약 이미지')&&dialog.innerHTML.includes('PNG 이미지 저장')&&dialog.innerHTML.includes('seeya-clinic-summary.png'));
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
 // Shipped UI: each mode completes only deficient preference axes, with no forced choice.
 checked=false;
 for(const mode of ['brief','detailed','max']){
  const fixture=complete(mode);fixture.stage='review';
  for(const [i,axis] of ['MS','IT'].entries()){
   const ids=fixture.questionOrder.filter(id=>C.byId[id].axis===axis),required=Math.ceil(ids.length*.8);
   for(const id of ids.slice(required-1)){if(i===0)fixture.answersById[id]='unknown';else delete fixture.answersById[id];}
  }
  const baseline=clone(fixture.answersById),baselineDepth=C.score(fixture).depthScore,plan=Completion.plan(fixture);
  assert.equal(plan.needed,2);assert.equal(plan.unknown,1);assert.equal(plan.missing,1);
  const otherModes=Object.keys(selected).filter(m=>m!==mode).map(m=>[m,values.get(key(m))]);
  values.set(key(mode),JSON.stringify(fixture));load();await click({resume:mode});
  assert(app.innerHTML.includes('data-action="completion-start"'));
  await click({action:'completion-start'});
  assert.equal(current(mode).stage,'question');assert.deepEqual(current(mode).completion.ids,plan.ids);
  assert.equal(current(mode).questionOrder[current(mode).currentIndex],plan.ids[0]);
  assert(app.innerHTML.includes('data-action="completion-next"'));assert(app.innerHTML.includes('data-action="completion-review"'));
  change('right');assert.equal(current(mode).completion.index,0,'choosing an answer must not auto-advance');
  await click({action:'home'});await click({resume:mode});assert.equal(current(mode).completion.index,0);
  load();await click({resume:mode});assert.equal(current(mode).completion.index,0);assert(app.innerHTML.includes('value="right" checked'));
  await click({action:'completion-next'});assert.equal(current(mode).completion.index,1);
  await click({action:'completion-previous'});assert.equal(current(mode).completion.index,0);assert(app.innerHTML.includes('value="right" checked'));
  change('left');await click({action:'completion-next'});change('unknown');
  await click({action:'completion-next'});
  assert.equal(current(mode).stage,'review');assert.equal(current(mode).completion,undefined,'the finite queue must end rather than cycle unknown answers');
  assert.equal(Completion.plan(current(mode)).needed,1);assert(app.innerHTML.includes('data-action="completion-start"'));
  assert.equal(current(mode).answersById[plan.ids[1]],'unknown');assert.equal(C.score(current(mode)).depthScore,baselineDepth);
  await click({action:'complete'});assert.equal(current(mode).stage,'result');assert.equal(C.score(current(mode)).typeCode,null);
  assert(app.innerHTML.includes('data-action="completion-start"'),'partial results still offer a route to complete the type');
  await click({action:'completion-start'});assert.equal(current(mode).completion.ids.length,1);
  const finalId=current(mode).questionOrder[current(mode).currentIndex];change('left');await click({action:'completion-next'});
  assert.equal(current(mode).stage,'review');assert.equal(Completion.plan(current(mode)).needed,0);
  assert(!app.innerHTML.includes('data-action="completion-start"'),'no completion prompt once every axis meets its threshold');
  await click({action:'complete'});assert(C.score(current(mode)).typeCode);assert.equal(C.score(current(mode)).depthScore,baselineDepth);
  assert(!app.innerHTML.includes('data-action="completion-start"'));
  const touched=new Set([...plan.ids,finalId]);
  for(const id of fixture.questionOrder)if(!touched.has(id))assert.deepEqual(current(mode).answersById[id],baseline[id],'other answers must stay unchanged: '+id);
  assert.deepEqual(current(mode).questionOrder,fixture.questionOrder);
  for(const [otherMode,raw] of otherModes)assert.equal(values.get(key(otherMode)),raw,'completion must not alter another mode');
  // Leave midway to normal review, then revisit an ordinary question without a stale queue.
  values.set(key(mode),JSON.stringify(fixture));load();await click({resume:mode});await click({action:'completion-start'});
  await click({action:'completion-review'});assert.equal(current(mode).stage,'review');assert.equal(current(mode).completion,undefined);
  await click({action:'completion-start'});await click({action:'review'});assert.equal(current(mode).stage,'review');assert.equal(current(mode).completion,undefined);
  await click({action:'completion-start'});await click({question:'0'});assert.equal(current(mode).stage,'question');assert.equal(current(mode).completion,undefined);
  // Pressing Next without answering leaves the original missing/unknown answers intact.
  values.set(key(mode),JSON.stringify(fixture));load();await click({resume:mode});await click({action:'completion-start'});
  await click({action:'completion-next'});await click({action:'completion-next'});
  assert.equal(current(mode).stage,'review');assert.deepEqual(current(mode).answersById,baseline);assert.equal(Completion.plan(current(mode)).needed,2);
 }
 console.log('PASS clinic completion UI: all three modes, minimum queue, explicit Next, pause/reload/back, unknown/skip, partial-result entry, ordinary-review exit, preservation and no prompt after threshold.');
 // Actual UI: permit skipped questions and a partial inventory, then export one score.
 checked=false;nickname='빈 응답 검토';await click({action:'home'});await click({start:'brief'});
 await click({action:'next'});assert.equal(current('brief').currentIndex,1);
 await click({question:String(selected.brief.ids.indexOf('BEH-01'))});change('seeya','lock');
 await click({action:'review'});assert(app.innerHTML.includes('지금 답변으로 결과 보기'));
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
 console.log('PASS prescriptions: all 16 distinct prescriptions, resolved ties and insufficient-answer fallback, one relevant public link, exact certificate DOM passed to image/print export, summary scores/types/prescriptions including unresolved results, anonymous names and hidden revision metadata.');
 // Public launch: run the shipped handlers in a separate namespace on the same browser storage.
 const testSnapshot=new Map([...values].filter(([k])=>k.startsWith('seeya-clinic-test-')));
 const publicKey=mode=>'seeya-clinic-progress-v1'+(mode==='max'?'':'-'+mode),publicCurrent=mode=>JSON.parse(values.get(publicKey(mode)));
 const assertTestPreserved=()=>{for(const [k,v] of testSnapshot)assert.equal(values.get(k),v,'public flow must not alter test records: '+k);};
 app.dataset.clinicEnvironment='public';checked=true;nickname='공개 팬';load();
 assert(!app.innerHTML.includes('이전 검사 기록 파일로 보관'));assert(!app.innerHTML.includes('data-resume='));
 assert(!app.innerHTML.includes('clinicCarry'),'test answers must not be available for public carry');
 for(const mode of ['brief','detailed','max']){
  const untouched=new Map([...values].filter(([k])=>k.startsWith('seeya-clinic-progress-v1')&&k!==publicKey(mode)));
  checked=false;await click({action:'home'});await click({start:mode});
  assert.equal(C.answeredCount(publicCurrent(mode)),0);assert.equal(publicCurrent(mode).displayName,'공개 팬');
  assertTestPreserved();const first=publicCurrent(mode).questionOrder[0];change('left');await click({action:'next'});
  await click({action:'home'});load();await click({resume:mode});
  assert.equal(publicCurrent(mode).answersById[first],'left');assert.equal(publicCurrent(mode).currentIndex,1);
  // A partial public certificate can enter the same finite completion flow.
  const fixture=complete(mode);fixture.displayName=nickname;fixture.stage='review';
  for(const [i,axis] of ['MS','IT'].entries()){
   const ids=fixture.questionOrder.filter(id=>C.byId[id].axis===axis),required=Math.ceil(ids.length*.8);
   for(const id of ids.slice(required-1)){if(i===0)fixture.answersById[id]='unknown';else delete fixture.answersById[id];}
  }
  values.set(publicKey(mode),JSON.stringify(fixture));load();await click({resume:mode});
  assert.equal(Completion.plan(publicCurrent(mode)).needed,2);await click({action:'complete'});
  assert.equal(C.score(publicCurrent(mode)).typeCode,null);assert(app.innerHTML.includes('data-action="completion-start"'));
  await click({action:'completion-start'});change('left');await click({action:'completion-next'});
  load();await click({resume:mode});assert.equal(publicCurrent(mode).completion.index,1);
  change('left');await click({action:'completion-next'});assert.equal(publicCurrent(mode).stage,'review');
  assert.equal(Completion.plan(publicCurrent(mode)).needed,0);await click({action:'complete'});
  assert.equal(C.score(publicCurrent(mode)).typeCode,'MRIP');assert.equal(C.score(publicCurrent(mode)).depthScore,100);
  for(const text of ['검토용','문항과 산식은 검토 중','준비중'])assert(!app.innerHTML.includes(text),'public result text: '+text);
  const saved=values.get(publicKey(mode));
  await click({action:'png'});await click({action:'print'});await click({action:'summary'});
  for(const content of [capturedHTML,preparedHTML,Summary.renderMarkup(summaryData)]){
   assert(content.includes('공개 팬'));assert(content.includes('MRIP'));assert(!content.includes('검토용'));
   assert(!content.includes('completion-start'));
  }
  assert.equal(values.get(publicKey(mode)),saved);load();await click({resume:mode});
  assert(app.innerHTML.includes('100</strong>'));assert(!app.innerHTML.includes('검토용'));assertTestPreserved();
  for(const [k,v] of untouched)assert.equal(values.get(k),v,'public modes must remain independent');
 }
 // Explicit carry is allowed between public forms, never by reading a test form.
 const publicBriefBefore=values.get(publicKey('brief'));await click({action:'home'});await click({resume:'brief'});await click({action:'home'});
 checked=true;await click({start:'detailed'});assert.equal(C.answeredCount(publicCurrent('detailed')),C.answeredCount(JSON.parse(publicBriefBefore)));
 assert.equal(values.get(publicKey('brief')),publicBriefBefore);assertTestPreserved();
 // Missing or unexpected page configuration must use the public namespace.
 for(const environment of [undefined,'unexpected']){
  app.dataset=environment===undefined?undefined:{clinicEnvironment:environment};load();
  assert(!app.innerHTML.includes('이전 검사 기록 파일로 보관'));assert(!app.innerHTML.includes('검토 중'));
  await click({resume:'brief'});assert(app.innerHTML.includes('성명 · 공개 팬'));assert(!app.innerHTML.includes('검토용'));
 }
 const publicSnapshot=new Map([...values].filter(([k])=>k.startsWith('seeya-clinic-progress-v1')));
 app.dataset={clinicEnvironment:'test'};checked=false;load();assert(app.innerHTML.includes('이전 검사 기록 파일로 보관'));
 assert(app.innerHTML.includes('문항과 산식은 검토 중'));await click({resume:'brief'});assert(app.innerHTML.includes('검토용'));
 await click({action:'home'});nickname='테스트 재검사';checked=true;await click({start:'max'});
 for(const [k,v] of publicSnapshot)assert.equal(values.get(k),v,'test restart must not alter public progress');
 assert(!app.innerHTML.includes('공개 팬'));assert(!/\bfetch\s*\(|XMLHttpRequest|sendBeacon/.test(source),'launch must not add answer transmission');
 console.log('PASS clinic public launch: indexable public route and shared assets, test noindex, separate names/answers/progress, all-mode completion and resume, public PNG/PDF text, legacy isolation and safe default namespace.');
 ctx.localStorage.getItem=()=>'{broken';load();assert(notice.textContent.includes('읽을 수'));
 ctx.localStorage.getItem=()=>null;ctx.localStorage.setItem=()=>{throw Error('quota');};load();checked=false;await click({start:'brief'});assert(app.innerHTML.includes('현재 1 / 20'));assert(notice.textContent.includes('저장하지 못'));
 console.log('PASS clinic client: all 228 responses, partial inventory/reload, completion/review, 3-mode isolation, opted-in carry/name guard, legacy backup, single scores, concise score labels, full/summary image controls, PDF preparation, full/summary image and print failure recovery, escaping/storage errors and public isolation.');
})().catch(e=>{console.error(e);process.exitCode=1;});
