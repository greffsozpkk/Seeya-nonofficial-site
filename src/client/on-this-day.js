const {koreaDate,onThisDay}=require('../shared/on-this-day');

function initOnThisDay(fallback){
 if(!document.getElementById('onThisDay'))return;
 let rows=fallback,pending=false;
 function render(){
  const block=document.getElementById('onThisDay');if(!block)return;
  const holder=document.createElement('div');holder.innerHTML=onThisDay(rows,new Date());
  block.replaceWith(holder.firstElementChild);
 }
 async function refresh(){
  if(pending)return;pending=true;
  render();
  try{
   const response=await fetch('/data/archive.json',{cache:'no-store'});
   if(!response.ok)throw new Error('Archive unavailable');
   const data=await response.json();
   if(!Array.isArray(data)||data.some(row=>!row||typeof row!=='object'))throw new Error('Invalid archive');
   rows=data;render();
  }catch{/* Keep the latest available archive when offline. */}
  finally{pending=false;}
 }
 function checkDay(){
  if(document.visibilityState==='hidden')return;
  if(document.getElementById('onThisDay')?.dataset.day!==koreaDate())refresh();
 }
 refresh();
 setInterval(checkDay,30000);
 document.addEventListener('visibilitychange',checkDay);
 window.addEventListener('pageshow',checkDay);
}
module.exports={initOnThisDay};
