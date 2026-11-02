'use strict';
module.exports=function initDrag({root,getDraft,mutate}){
 let source,mark,touch,frame;
 function clearMark(){if(mark)mark.element.classList.remove('mc-drop-'+mark.side);mark=null;}
 function cancel(){
  if(frame)cancelAnimationFrame(frame);frame=null;touch=null;
  source?.classList.remove('mc-lifted');source=null;clearMark();
 }
 function locate(element,y){
  clearMark();
  const section=element?.closest('[data-destination]');
  if(!section||!root.contains(section))return;
  const tracks=[...section.querySelectorAll('[data-track]')];
  const next=tracks.find(row=>{const box=row.getBoundingClientRect();return y<box.top+box.height/2;});
  const side=next?'before':'after', target=next||tracks.at(-1)||section.querySelector('.mc-slot');
  if(!target)return;
  mark={element:target,side,section:section.dataset.destination,index:next?tracks.indexOf(next):tracks.length};
  target.classList.add('mc-drop-'+side);
 }
 function drop(){
  const item=source?.dataset, target=mark;
  cancel();if(!item||!target)return;
  const same=item.section===target.section;
  const from=getDraft().sections[item.section].indexOf(item.track);
  const to=target.index-(same&&from<target.index?1:0);
  if(from<0||(same&&from===to))return;
  mutate({type:same?'order':'move',id:item.track,section:item.section,target:target.section,to});
 }
 root.addEventListener('dragstart',event=>{
  const row=event.target.closest('[data-track]');
  if(!row||touch||event.target.closest('button,select,input')){event.preventDefault();return;}
  source=row;source.classList.add('mc-lifted');
  event.dataTransfer.effectAllowed='move';event.dataTransfer.setData('text/plain',row.dataset.track);
 });
 root.addEventListener('dragover',event=>{
  if(!source||touch)return;
  locate(event.target,event.clientY);if(mark)event.preventDefault();
 });
 root.addEventListener('drop',event=>{
  if(!source||touch)return;
  event.preventDefault();locate(event.target,event.clientY);drop();
 });
 root.addEventListener('dragend',cancel);
 function scrollFrame(){
  if(!touch)return;
  const {x,y}=touch;
  const distance=y<65?y-65:y>window.innerHeight-65?y-window.innerHeight+65:0;
  if(distance){window.scrollBy(0,Math.sign(distance)*Math.min(16,Math.ceil(Math.abs(distance)/4)));locate(document.elementFromPoint(x,y),y);}
  frame=requestAnimationFrame(scrollFrame);
 }
 root.addEventListener('pointerdown',event=>{
  const grip=event.target.closest('.mc-grip');
  if(!grip||event.pointerType==='mouse'||!event.isPrimary)return;
  event.preventDefault();source=grip.closest('[data-track]');source.classList.add('mc-lifted');
  grip.setPointerCapture(event.pointerId);
  touch={id:event.pointerId,x:event.clientX,y:event.clientY};frame=requestAnimationFrame(scrollFrame);
 });
 root.addEventListener('pointermove',event=>{
  if(touch?.id!==event.pointerId)return;
  touch.x=event.clientX;touch.y=event.clientY;
  locate(document.elementFromPoint(touch.x,touch.y),touch.y);
 });
 root.addEventListener('pointerup',event=>{
  if(touch?.id!==event.pointerId)return;
  locate(document.elementFromPoint(event.clientX,event.clientY),event.clientY);drop();
 });
 root.addEventListener('pointercancel',event=>{if(touch?.id===event.pointerId)cancel();});
 root.addEventListener('lostpointercapture',event=>{if(touch?.id===event.pointerId)cancel();});
 window.addEventListener('pagehide',cancel);
};
