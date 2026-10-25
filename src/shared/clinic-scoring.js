'use strict';
const bank=require('../data/clinic-bank.json'), forms=require('../data/clinic-forms.json'), engine=require('./clinic-model');
const scoringRevision='clinic-integrated-zero-missing-v3',axes=Object.keys(bank.axes),byId=Object.fromEntries(bank.questions.map(q=>[q.id,q]));
const data={...bank,forms:forms.modes};
const plain=v=>v!==null&&typeof v==='object'&&!Array.isArray(v);
const cleanName=v=>String(v).replace(/[\u0000-\u001f\u007f]/g,'').trim().slice(0,24);
function validAnswer(id,value){return !!byId[id]&&engine.answered(byId[id],value);}
function storable(id,value){
 const q=byId[id];if(!q)return false;
 if(q.kind!=='inventory')return validAnswer(id,value);
 return plain(value)&&Object.entries(value).every(([key,v])=>q.items.some(i=>i.id===key)&&(v===''||q.states.some(s=>s.value===v)));
}
function uncertain(id,value){
 const q=byId[id];if(!q||!validAnswer(id,value))return false;
 if(q.kind==='preference')return value==='unknown';
 if(q.scorePart==='context')return ['unknown','unavailable','no-opportunity'].includes(value);
 return engine.bound(q,value).known<1;
}
function answeredCount(state){return state.questionOrder.filter(id=>validAnswer(id,state.answersById[id])).length;}
function create(mode,name='',id='clinic-'+Date.now(),now=new Date().toISOString()){
 const form=forms.modes[mode];if(!form?.ids?.length)throw Error('문항 구성을 찾을 수 없습니다.');
 return {runId:id,mode,displayName:cleanName(name),bankRevision:bank.revision,formRevision:form.revision||forms.revision,scoringRevision,
  questionOrder:[...form.ids],displayDirections:Object.fromEntries(form.ids.map(id=>[id,byId[id].displayOrder?.[0]==='right'])),answersById:{},currentIndex:0,stage:'question',updatedAt:now};
}
function restore(value){
 const bad=()=>{throw Error('이전 진행 기록을 읽을 수 없거나 문항 버전이 다릅니다.');};
 if(!plain(value)||value.bankRevision!==bank.revision||value.formRevision!==(forms.modes[value.mode]?.revision||forms.revision)||![scoringRevision,'clinic-integrated-60-40-v2'].includes(value.scoringRevision)||typeof value.runId!=='string'||!value.runId||value.runId.length>128||typeof value.displayName!=='string'||cleanName(value.displayName)!==value.displayName)return bad();
 const expected=forms.modes[value.mode]?.ids;
 if(!expected||JSON.stringify(expected)!==JSON.stringify(value.questionOrder)||!Number.isInteger(value.currentIndex)||value.currentIndex<0||value.currentIndex>=expected.length||!['question','review','result'].includes(value.stage)||!Number.isFinite(Date.parse(value.updatedAt)))return bad();
 if(!plain(value.answersById)||!plain(value.displayDirections)||Object.keys(value.displayDirections).length!==expected.length)return bad();
 for(const [id,v] of Object.entries(value.answersById))if(!expected.includes(id)||!storable(id,v))return bad();
 for(const id of expected)if(value.displayDirections[id] !== (byId[id].displayOrder?.[0]==='right'))return bad();
 if(value.stage==='result'&&!Number.isFinite(Date.parse(value.completedAt)))return bad();
 return value.scoringRevision===scoringRevision?value:{...value,previousScoringRevision:value.scoringRevision,scoringRevision};
}
function carryAnswers(from,to){
 if(!from||from.bankRevision!==bank.revision||from.scoringRevision!==scoringRevision||from.displayName!==to.displayName)return 0;
 let count=0;
 for(const id of to.questionOrder){const v=from.answersById[id];if(validAnswer(id,v)){to.answersById[id]=typeof v==='object'?{...v}:v;count++;}}
 const missing=to.questionOrder.findIndex(id=>!validAnswer(id,to.answersById[id]));
 to.currentIndex=missing<0?0:missing;to.stage=missing<0?'review':'question';return count;
}
function score(state){
 const scored=engine.score(data,state.answersById,state.mode),axisRatios={};let codes=[''];const boundaryAxes=[];
 for(const axis of axes){const row=scored.axisResults[axis],def=bank.axes[axis];
  axisRatios[axis]={ready:row.ready,left:row.leftPercent,right:row.rightPercent,pole:row.pole,nearBoundary:row.nearBoundary,
   coverage:{valid:row.valid,total:row.total},mean:row.valid?row.right/row.valid:null};
  if(row.ready&&!row.pole)boundaryAxes.push(axis);
  codes=row.ready?codes.flatMap(c=>(row.pole?[row.pole]:[def.left,def.right]).map(p=>c+p)):[];
 }
 return {...scored,possibleTypes:codes,boundaryAxes,axisRatios,depthReady:scored.ready,depthRange:scored.total,
  depthScore:scored.total?.exact?scored.total.low:null,scoringRevision};
}
function rangeText(value,empty='판단 보류'){return value?(value.exact?String(value.low):value.low+'~'+value.high):empty;}
function contextLines(state){
 const lines=[];
 if(state.questionOrder.includes('BEH-02')){
  const q=byId['BEH-02'],v=state.answersById[q.id],summary=engine.inventory(q,v);
  if(summary.complete)lines.push('씨야용 바로가기·즐겨찾기·알림 등 '+summary.selected+'종류를 사용해요.');
 }
 if(state.questionOrder.includes('BEH-07')){const q=byId['BEH-07'],choice=q.choices.find(c=>c.value===state.answersById[q.id]);if(choice)lines.push('일정 챙기기 · '+choice.label.replace(/^[AB] · /,''));}
 return lines;
}
module.exports={bank,forms,axes,byId,engine,data,scoringRevision,cleanName,validAnswer,storable,uncertain,answeredCount,create,restore,carryAnswers,score,rangeText,contextLines};
