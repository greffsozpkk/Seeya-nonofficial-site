"use strict";
// Independent of the live save: a failed history write must never erase it.
module.exports=function({storage,key,load,summary}){
 const historyKey=key+'-backups-v1',limit=12,maxChars=750000;
 let error='';
 const stamp=n=>Number.isSafeInteger(n)&&n>0&&n<253402268399999;
 const day=now=>new Date(now+9*3600000).toISOString().slice(0,10);
 function read(){
  const raw=storage.getItem(historyKey);if(!raw)return {version:1,next:1,daily:'',concerts:{},entries:[]};
  const h=JSON.parse(raw);
  if(h?.version!==1||!Number.isSafeInteger(h.next)||h.next<1||typeof h.daily!=='string'||!h.concerts||typeof h.concerts!=='object'||Array.isArray(h.concerts)||!Array.isArray(h.entries)||h.entries.length>limit||h.entries.some(e=>!e||typeof e.id!=='string'||!stamp(e.at)||typeof e.reason!=='string'||typeof e.raw!=='string')||new Set(h.entries.map(e=>e.id)).size!==h.entries.length)throw Error('history');
  return h;
 }
 function write(h){
  h.entries=h.entries.slice(0,limit);
  while(h.entries.length>1&&JSON.stringify(h).length>maxChars)h.entries.pop();
  while(true){try{storage.setItem(historyKey,JSON.stringify(h));error='';return;}catch(e){if(h.entries.length<=1)throw e;h.entries.pop();}}
 }
 function append(h,raw,reason,now){if(!stamp(now))throw Error('time');h.entries.unshift({id:now+'-'+h.next++,at:now,reason,raw});write(h);}
 const fail=()=>{error='백업 목록을 저장하거나 읽지 못했어요. 저장 공간을 확인하고 파일 백업도 보관해 주세요.';return {ok:false,error};};
 function add(state,reason='직접 백업',now=Date.now()){
  try{const raw=JSON.stringify(state);load(raw);append(read(),raw,reason,now);return {ok:true};}catch{return fail();}
 }
 function auto(state,now=Date.now(),visible=true){
  try{
   const h=read(),today=day(now),receipts={...state.simple?.concerts,...state.solo?.concerts};
   const completed=Object.entries(receipts).filter(([id,r])=>!h.concerts[id]&&stamp(r?.at));
   const first=h.entries.length===0&&h.daily==='';
   if(!(visible&&today>h.daily)&&(!completed.length||first))return {ok:true};
   for(const [id,r] of completed)h.concerts[id]=r.at;
   if(visible&&today>h.daily)h.daily=today;
   const reason=!first&&completed.length?'콘서트 완료 · '+completed.map(([id])=>summary(state,id).album).join(', '):'하루 첫 접속';
   const raw=JSON.stringify(state);load(raw);append(h,raw,reason,now);return {ok:true};
  }catch{return fail();}
 }
 function entries(){try{return read().entries.map(e=>{try{return {...summary(load(e.raw)),id:e.id,at:e.at,reason:e.reason,valid:true};}catch{return {id:e.id,at:e.at,reason:e.reason,valid:false};}});}catch{fail();return [];}}
 function raw(id){const entry=read().entries.find(e=>e.id===id);if(!entry)throw Error('missing');return entry.raw;}
 function get(id){return load(raw(id));}
 function restore(id,currentRaw,commit,now=Date.now()){
  try{
   const next=get(id),h=read();
   // Even a damaged live save is preserved before replacing it.
   if(currentRaw!==null)append(h,currentRaw,'복원 직전 기록',now);
   if(!commit(next)){error='복원 내용을 저장하지 못했어요. 기존 진행을 유지합니다.';return {ok:false,error};}
   error='';return {ok:true,state:next};
  }catch{return fail();}
 }
 return {limit,add,auto,entries,get,raw,restore,get error(){return error;}};
};
