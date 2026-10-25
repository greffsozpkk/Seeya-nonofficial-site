'use strict';
const C=require('./clinic-scoring');
const directional=value=>value==='left'||value==='right';

// Ask only for the extra A/B answers needed by axes below the existing threshold.
function plan(state){
 const order=state.questionOrder,expected=C.forms.modes[state.mode]?.ids;
 if(!expected||!Array.isArray(order)||JSON.stringify(order)!==JSON.stringify(expected))throw Error('보완할 문항 구성을 찾을 수 없습니다.');
 const answers=state.answersById||{},axes=[],chosen=new Set();
 for(const axis of C.axes){
  const ids=order.filter(id=>C.byId[id].kind==='preference'&&C.byId[id].axis===axis);
  const valid=ids.filter(id=>directional(answers[id])).length,required=Math.ceil(ids.length*.8),needed=Math.max(0,required-valid);
  if(!needed)continue;
  axes.push({axis,valid,required,needed});
  const missing=ids.filter(id=>!C.validAnswer(id,answers[id]));
  const unknown=ids.filter(id=>answers[id]==='unknown');
  for(const id of [...missing,...unknown].slice(0,needed))chosen.add(id);
 }
 const ids=order.filter(id=>chosen.has(id));
 return {needed:axes.reduce((n,axis)=>n+axis.needed,0),ids,axes,
  missing:ids.filter(id=>!C.validAnswer(id,answers[id])).length,
  unknown:ids.filter(id=>answers[id]==='unknown').length};
}

// A fixed queue survives answers, refreshes and pauses without reordering a session.
function session(state){
 const value=state?.completion,order=state?.questionOrder,expected=C.forms.modes[state?.mode]?.ids;
 if(state?.stage!=='question'||!expected||!Array.isArray(order)||!value||typeof value!=='object'||Array.isArray(value))return null;
 if(!Array.isArray(value.ids)||!value.ids.length||value.ids.length>order.length||new Set(value.ids).size!==value.ids.length)return null;
 if(!Number.isInteger(value.index)||value.index<0||value.index>=value.ids.length)return null;
 if(value.ids.some(id=>typeof id!=='string'||!expected.includes(id)||!order.includes(id)||C.byId[id]?.kind!=='preference'))return null;
 if(state.currentIndex!==order.indexOf(value.ids[value.index]))return null;
 return value;
}

function clear(state){delete state.completion;}

function start(state){
 const next=plan(state);
 if(next.ids.length){
  state.completion={ids:[...next.ids],index:0};
  state.currentIndex=state.questionOrder.indexOf(next.ids[0]);
  state.stage='question';
 }else{
  clear(state);
  state.stage='review';
 }
 return next;
}

module.exports={plan,session,start,clear};
