'use strict';
const {homeUpcoming}=require('../shared/home-upcoming');
const {koreaDate}=require('../shared/calendar-data');
function initHomeUpcoming(fallback){
 if(!document.getElementById('homeUpcoming'))return;
 let rows=fallback,pending=false,lastRefresh=0;
 function render(data){
  const current=document.getElementById('homeUpcoming');
  if(!current)return;
  const holder=document.createElement('div');
  holder.innerHTML=homeUpcoming(data,new Date());
  const next=holder.firstElementChild;
  if(current.innerHTML!==next.innerHTML)current.innerHTML=next.innerHTML;
  current.dataset.day=next.dataset.day;
 }
 async function refresh(){
  if(pending)return;
  pending=true;lastRefresh=Date.now();
  try{
   render(rows);
   const response=await fetch('/data/archive.json',{cache:'no-store'});
   if(!response.ok)throw Error('Archive unavailable');
   const data=await response.json();
   if(!Array.isArray(data)||data.some(row=>!row||typeof row!=='object'||typeof row.title!=='string'||!Array.isArray(row.members)))throw Error('Invalid archive');
   render(data);rows=data;
  }catch(_){/* Keep the last valid schedule when offline or a refresh fails. */}
  finally{pending=false;}
 }
 function check(){
  if(document.visibilityState==='hidden')return;
  if(document.getElementById('homeUpcoming')?.dataset.day!==koreaDate()||Date.now()-lastRefresh>=300000)refresh();
 }
 refresh();
 setInterval(check,30000);
 document.addEventListener('visibilitychange',check);
 window.addEventListener('pageshow',check);
}
module.exports={initHomeUpcoming};
