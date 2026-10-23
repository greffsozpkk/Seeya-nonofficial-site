'use strict';
const bank=require('../data/clinic-bank.json'),forms=require('../data/clinic-forms.json');
const scoringRevision='facet-mean-80-v1',axes=Object.keys(bank.axes),byId=Object.fromEntries(bank.questions.map(q=>[q.id,q]));
function validAnswer(v){return v==='unknown'||(Number.isInteger(v)&&v>=1&&v<=5);}
function create(mode,name='',id='clinic-'+Date.now(),now=new Date().toISOString()){
 const form=forms.modes[mode];if(!form?.ids?.length)throw Error('문항 구성 검토 중입니다.');
 return {runId:id,mode,displayName:String(name).replace(/[\u0000-\u001f\u007f]/g,'').trim().slice(0,24),bankRevision:bank.revision,formRevision:form.revision||forms.revision,scoringRevision,questionOrder:[...form.ids],displayDirections:Object.fromEntries(form.ids.map(id=>[id,false])),answersById:{},currentIndex:0,stage:'question',updatedAt:now};
}
function restore(value){
 if(!value||value.bankRevision!==bank.revision||value.formRevision!==(forms.modes[value.mode]?.revision||forms.revision)||value.scoringRevision!==scoringRevision||typeof value.runId!=='string'||typeof value.displayName!=='string'||value.displayName.length>24)throw Error('이전 진행 기록을 읽을 수 없습니다.');
 const expected=forms.modes[value.mode]?.ids;if(!expected||JSON.stringify(expected)!==JSON.stringify(value.questionOrder)||!Number.isInteger(value.currentIndex)||value.currentIndex<0||value.currentIndex>=expected.length||!['question','review','result'].includes(value.stage))throw Error('이전 진행 기록을 읽을 수 없습니다.');
 if(!value.answersById||typeof value.answersById!=='object'||Array.isArray(value.answersById)||!value.displayDirections||typeof value.displayDirections!=='object')throw Error('이전 진행 기록을 읽을 수 없습니다.');
 for(const [id,v] of Object.entries(value.answersById))if(!expected.includes(id)||!validAnswer(v))throw Error('이전 진행 기록을 읽을 수 없습니다.');
 for(const id of expected)if(typeof value.displayDirections[id]!=='boolean')throw Error('이전 진행 기록을 읽을 수 없습니다.');
 if(value.stage==='result'&&(!Number.isFinite(Date.parse(value.completedAt))||expected.some(id=>!validAnswer(value.answersById[id]))))throw Error('이전 진행 기록을 읽을 수 없습니다.');
 return value;
}
function score(state){
 const order=state.questionOrder,answers=state.answersById,axisRatios={};
 function area(axis){const planned=order.map(id=>byId[id]).filter(q=>q.axis===axis),facets=[...new Set(planned.map(q=>q.facet))],values=Object.fromEntries(facets.map(f=>[f,[]]));let valid=0;
  for(const q of planned){const r=answers[q.id];if(!Number.isInteger(r)||r<1||r>5)continue;let v=(r-1)/4;if(q.kind==='preference'&&state.displayDirections[q.id])v=1-v;values[q.facet].push(v);valid++;}
  const present=facets.filter(f=>values[f].length),coverage={valid,total:planned.length,facets:present.length,plannedFacets:facets.length},ready=planned.length>0&&valid/planned.length>=.8&&present.length===facets.length;
  const mean=ready?present.reduce((s,f)=>s+values[f].reduce((a,b)=>a+b,0)/values[f].length,0)/present.length:null;
  return {ready,mean,coverage};
 }
 let codes=[''];const boundaryAxes=[];
 for(const axis of axes){const a=area(axis),def=bank.axes[axis],right=a.ready?Math.round(a.mean*100):null,pole=a.ready?(Math.abs(a.mean-.5)<1e-12?null:a.mean<.5?def.left:def.right):null;
  axisRatios[axis]={...a,left:right===null?null:100-right,right,pole};if(a.ready&&!pole)boundaryAxes.push(axis);codes=a.ready?codes.flatMap(c=>(pole?[pole]:[def.left,def.right]).map(p=>c+p)):[];
 }
 const depth=area('DEPTH');return {typeCode:codes.length===1?codes[0]:null,possibleTypes:codes,boundaryAxes,axisRatios,depthScore:depth.ready?Math.round(depth.mean*100):null,depthCoverage:depth.coverage,scoringRevision};
}
module.exports={bank,forms,axes,byId,scoringRevision,validAnswer,create,restore,score};
