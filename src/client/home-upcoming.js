'use strict';
const {homeUpcoming}=require('../shared/home-upcoming');
const {koreaDate}=require('../shared/calendar-data');
function initHomeUpcoming(fallback){
 if(!document.getElementById('homeUpcoming'))return;
 const root=document.getElementById('homeUpcoming');
 const links=document.getElementById('homeLinks')?.textContent;
 const {createExperience,previewClock}=require('./home-activity');
 const enhanced=links?createExperience(root,JSON.parse(links),previewClock()):null;
 let rows=fallback,pending=false,lastRefresh=0,lastKoreaDay;
 function render(data){
  if(enhanced){enhanced(data);return;}
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
  pending=true;lastRefresh=Date.now();lastKoreaDay=koreaDate();
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
 function check(force=false){
  if(document.visibilityState==='hidden')return;
  if(force===true||lastKoreaDay!==koreaDate()||Date.now()-lastRefresh>=300000)refresh();
 }
 refresh();
 setInterval(()=>{if(enhanced&&document.visibilityState!=='hidden')render(rows);check();},30000);
 if(enhanced){
  function refreshAtMidnight(){
   const midnight=Date.parse(koreaDate()+'T00:00:00+09:00')+86400000;
   setTimeout(()=>{check(true);refreshAtMidnight();},Math.max(1,midnight-Date.now()));
  }
  refreshAtMidnight();
 }
 document.addEventListener('visibilitychange',()=>check(true));
 window.addEventListener('pageshow',()=>check(true));
 window.addEventListener('online',()=>check(true));
}
module.exports={initHomeUpcoming};
