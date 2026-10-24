'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const C=require('../src/shared/clinic-scoring'),I=require('../src/shared/clinic-interpretation');
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
 assert.deepEqual(C.score(uncertain).depthRange,{low:95,high:100,exact:false});
 assert.equal(C.score(uncertain).depthScore,null);assert.equal(C.score(uncertain).depthReady,true);
 assert.equal(C.rangeText(C.score(uncertain).depthRange),'95~100');
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
 assert.equal(C.score(irrelevant).answered,0);assert.equal(C.score(irrelevant).depthRange,null);
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
const missing=complete('brief');missing.answersById['MAX2-DEPTH-001']='unknown';assert.equal(C.score(missing).depthReady,false);
missing.answersById['MAX2-MS-001']='unknown';assert.equal(C.score(missing).axisRatios.MS.ready,false);
const missingGroup=complete();for(const q of C.bank.questions.filter(q=>q.scoringGroup==='기대와 기다림'))missingGroup.answersById[q.id]='unknown';
assert.equal(C.score(missingGroup).emotion.ready,false);
const tied=complete('detailed');for(const a of C.axes)tied.questionOrder.filter(id=>C.byId[id].axis===a).forEach((id,i)=>tied.answersById[id]=i<5?'left':'right');
assert.equal(C.score(tied).typeCode,null);assert.equal(C.score(tied).possibleTypes.length,16);assert.equal(C.score(tied).axisRatios.MS.left,50);
assert.equal(I.explain(C.score(tied)).meaning.length,0);
const partial=C.create('brief');partial.answersById['BEH-01']={lock:'seeya',home:''};
assert.equal(C.restore(partial),partial);assert.equal(C.answeredCount(partial),0);assert(!C.validAnswer('BEH-01',partial.answersById['BEH-01']));
const good=complete();for(const patch of [{bankRevision:'old'},{formRevision:'old'},{scoringRevision:'old'},{currentIndex:999},{answersById:{'MAX2-MS-001':1}},{answersById:{'BEH-01':{noSuch:'other'}}},{questionOrder:good.questionOrder.slice(1)},{stage:'result',completedAt:'invalid'},{stage:'result',completedAt:new Date().toISOString(),answersById:{}},{displayDirections:{}}])assert.throws(()=>C.restore({...good,...patch}));
assert(!C.validAnswer('BEH-05','999'));assert(!C.validAnswer('MAX2-MS-001',1));
const from=complete('brief'),original=JSON.stringify(from),to=C.create('detailed',from.displayName);
assert.equal(C.carryAnswers(from,to),20);assert.equal(C.answeredCount(to),20);assert.equal(JSON.stringify(from),original);
to.answersById['BEH-01'].lock='other';assert.equal(from.answersById['BEH-01'].lock,'seeya');
assert.equal(C.carryAnswers(from,C.create('max','다른 사람')),0);
assert.equal(C.carryAnswers(from,C.create('brief',from.displayName)),20);
assert.equal(C.carryAnswers({...from,bankRevision:'old'},C.create('max',from.displayName)),0);
console.log('PASS clinic model: agreed 20/60/148, 16 types, canonical A/B, 60/40 independent scoring, settings domain cap, context-only items, unknown bounds/thresholds, partial saves and safe carry.');

const html=fs.readFileSync('game/clinic/test/index.html','utf8');assert(html.includes('noindex,nofollow'));assert(!html.includes('analytics.js')&&!html.includes('googletagmanager'));assert(!fs.readFileSync('sitemap.xml','utf8').includes('/game/clinic/test/'));assert(fs.readFileSync('game/clinic/index.html','utf8').includes('준비중'));assert(!fs.readFileSync('game/index.html','utf8').includes('/game/clinic/test/'));
// Exercise the actual shipped event handlers, including storage and all three exports.
const source=fs.readFileSync('src/client/clinic.js','utf8'),values=new Map([['seeya-clinic-test-progress-v1','{"legacy":"retain exactly"}']]),handlers={};
let checked=false,nickname='<img src=x onerror=x>',copied='',printed=false,dialog=null,pngLines=[],blob=null;
const key=mode=>'seeya-clinic-test-progress-v2'+(mode==='max'?'':'-'+mode);
const current=mode=>JSON.parse(values.get(key(mode)));
const app={innerHTML:'',querySelector:q=>q==='#clinicName'?{value:nickname}:q==='#clinicCarry'?{checked}:q==='.clinic-progress'?{lastElementChild:{textContent:''}}:q==='progress'?{value:0}:q==='#clinicInventorySummary'?{textContent:''}:null,scrollIntoView(){},addEventListener:(e,fn)=>handlers[e]=fn};
const notice={textContent:'',hidden:true};
const canvas=()=>({width:0,height:0,getContext:()=>({fillRect(){},strokeRect(){},drawImage(){},measureText:t=>({width:String(t).length*15}),fillText:t=>pngLines.push(String(t))}),toBlob:fn=>fn({type:'image/png'})});
const ctx={require:p=>p.includes('clinic-interpretation')?I:p.includes('clinic-scoring')?C:require('../src/shared/common'),document:{getElementById:id=>id==='clinicApp'?app:notice,createElement:tag=>tag==='canvas'?canvas():tag==='dialog'?(dialog={innerHTML:'',querySelector:()=>({}),showModal(){this.open=true;},close(){},remove(){}}):{click(){},remove(){}},body:{append(){}}},localStorage:{getItem:k=>values.get(k)||null,setItem:(k,v)=>values.set(k,v)},window:{confirm:()=>true,print:()=>printed=true},crypto:{randomUUID:()=> 'clinic-fixture'},Date,Intl,JSON,Number,Math,String,URL:{createObjectURL:b=>{blob=b;return 'blob:fixture';},revokeObjectURL(){}},Promise,navigator:{clipboard:{writeText:async t=>{copied=t;}}},Image:class{constructor(){this.naturalWidth=200;this.naturalHeight=100;}async decode(){}},Blob:class{constructor(parts){this.text=parts.join('');}},setTimeout:fn=>fn()};
const load=()=>vm.runInNewContext('(function(){'+source+'})();',ctx);
const click=dataset=>handlers.click({target:{closest:()=>({dataset})}});
const change=(value,item)=>handlers.change({target:{name:item?'':'clinicAnswer',value,dataset:item?{inventoryItem:item}:{}}});
const answer=q=>{const v=response(q);if(q.kind==='inventory')q.items.forEach(i=>change(v[i.id],i.id));else change(v);};
(async()=>{
 load();assert(app.innerHTML.includes('이전 검사 기록 파일로 보관'));
 for(const mode of ['brief','detailed','max']){
  await click({action:'home'});await click({start:mode});assert.equal(C.answeredCount(current(mode)),0);
  const count=selected[mode].ids.length;
  await click({action:'next'});assert.equal(current(mode).currentIndex,0);assert(notice.textContent.includes('응답을'));
  for(let i=0;i<count;i++){
   const q=C.byId[current(mode).questionOrder[i]];
   if(q.kind==='inventory'&&mode==='brief'){
    change('seeya',q.items[0].id);await click({action:'next'});assert.equal(current(mode).currentIndex,i);
    load();await click({resume:mode});assert(app.innerHTML.includes('value="seeya" selected'));assert(app.innerHTML.includes('미선택'));
   }
   answer(q);await click({action:'next'});
  }
  assert(app.innerHTML.includes('미응답 0문항'));await click({action:'complete'});
  assert(app.innerHTML.includes('소리 보관인형'));assert(!app.innerHTML.includes('<img src=x'));assert(app.innerHTML.includes('&lt;img'));
  assert(app.innerHTML.includes('clinicCertificate'));assert(app.innerHTML.includes('나의 팬 성향 해설'));
  assert.equal((app.innerHTML.match(/class="clinic-pole-letter"/g)||[]).length,8);
  assert(!app.innerHTML.includes('두 비율은 응답의 기울기'));assert(app.innerHTML.includes('100</strong>'));
  assert.equal(app.innerHTML.includes('씨야를 챙기는 나의 방법'),mode!=='brief');
  await click({action:'copy'});assert(copied.includes('마음 60 / 60 · 행동 40 / 40'));assert(copied.includes(count+'문항'));
  await click({action:'print'});assert(printed);
  pngLines=[];await click({action:'png'});assert(dialog.open&&dialog.innerHTML.includes('PNG 내려받기'));assert(pngLines.some(t=>t.includes('100 / 100')));
  load();assert(app.innerHTML.includes('진단서 다시 보기'));await click({resume:mode});assert(app.innerHTML.includes('100</strong>'));
 }
 assert.equal(values.get('seeya-clinic-test-progress-v1'),'{"legacy":"retain exactly"}');
 const max=values.get(key('max')),detailedBefore=values.get(key('detailed'));
 await click({action:'home'});await click({resume:'brief'});await click({question:String(selected.brief.ids.indexOf('BEH-01'))});
 setting.items.forEach(i=>change('unused',i.id));await click({action:'review'});await click({action:'complete'});
 assert(app.innerHTML.includes('95~100</strong>'));await click({action:'copy'});assert(copied.includes('95~100/100'));pngLines=[];await click({action:'png'});assert(pngLines.some(t=>t.includes('95~100 / 100')));
 assert.equal(values.get(key('max')),max);assert.equal(values.get(key('detailed')),detailedBefore);
 await click({action:'home'});checked=true;await click({start:'detailed'});assert.equal(C.answeredCount(current('detailed')),20);assert.equal(values.get(key('max')),max);
 assert.equal(current('brief').stage,'result');assert.equal(current('detailed').answersById['BEH-01'].lock,'unused');
 await click({action:'home'});nickname='다른 사람';await click({start:'max'});assert.equal(C.answeredCount(current('max')),0);
 await click({action:'legacy'});assert(blob.text.includes('retain exactly'));assert.equal(values.get('seeya-clinic-test-progress-v1'),'{"legacy":"retain exactly"}');
 ctx.localStorage.getItem=()=>'{broken';load();assert(notice.textContent.includes('읽을 수'));
 ctx.localStorage.getItem=()=>null;ctx.localStorage.setItem=()=>{throw Error('quota');};load();checked=false;await click({start:'brief'});assert(app.innerHTML.includes('현재 1 / 20'));assert(notice.textContent.includes('저장하지 못'));
 console.log('PASS clinic client: all 228 responses, partial inventory/reload, completion/review, 3-mode isolation, opted-in carry/name guard, legacy backup, HTML/copy/PNG ranges, PDF action, escaping/storage errors and public isolation.');
})().catch(e=>{console.error(e);process.exitCode=1;});
