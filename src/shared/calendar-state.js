'use strict';
const {exactDate,MEMBERS,TYPES}=require('./calendar-data');
const validMonth=m=>/^(20\d{2}|2100)-(0[1-9]|1[0-2])$/.test(m||'')&&m>='2006-01';
function defaultDay(month,today){return month===today.slice(0,7)?today:month+'-01';}
function selectionFromURL(search,events,today){
 const q=new URLSearchParams(search),month=validMonth(q.get('month'))?q.get('month'):today.slice(0,7);
 const state={month,today,day:q.get('scope')==='month'?'':defaultDay(month,today),member:q.get('member')||'all',type:q.get('type')||'all',anniversaries:q.get('anniversaries')!=='0',view:q.get('view')==='list'?'list':'calendar',event:q.get('event')||''};
 if(!['all','group',...MEMBERS].includes(state.member))state.member='all';
 if(!['all',...Object.keys(TYPES)].includes(state.type))state.type='all';
 if(exactDate(q.get('day'))&&q.get('day').startsWith(month))state.day=q.get('day');
 const target=events.find(e=>e.id===state.event);
 if(target){
  if(target.annual)state.anniversaries=true;
  const day=target.annual?month.slice(0,4)+target.date.slice(4):target.date;
  if(exactDate(day)){state.day=day;state.month=day.slice(0,7);state.member='all';state.type='all';}
 }else state.event='';
 return state;
}
module.exports={defaultDay,selectionFromURL};
