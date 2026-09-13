const items=require('../data/character-gallery.json');
function initCharacterGallery(){
 const section=document.getElementById('characterCollection'),dialog=document.getElementById('characterDialog');
 if(!section||!dialog||typeof dialog.showModal!=='function')return;
 let index=0,opener=null,touchX=null;
 function render(){
  index=(index+items.length)%items.length;const item=items[index];
  const img=document.getElementById('characterDialogImage');img.src=item.image;img.alt=item.title+' 캐릭터 일러스트';
  document.getElementById('characterDialogTitle').textContent=item.title;
  document.getElementById('characterDialogCount').textContent=`${index+1} / ${items.length}`;
  document.getElementById('characterOriginal').href=item.image;
 }
 section.querySelectorAll('[data-character-index]').forEach(link=>link.addEventListener('click',event=>{
  if(event.ctrlKey||event.metaKey||event.shiftKey||event.altKey)return;
  event.preventDefault();index=Number(link.dataset.characterIndex);opener=link;render();dialog.showModal();document.body.classList.add('character-dialog-open');dialog.querySelector('.character-close').focus();
 }));
 dialog.querySelector('.character-close').addEventListener('click',()=>dialog.close());
 dialog.querySelectorAll('[data-character-step]').forEach(button=>button.addEventListener('click',()=>{index+=Number(button.dataset.characterStep);render();}));
 dialog.addEventListener('keydown',event=>{if(event.key==='ArrowLeft'||event.key==='ArrowRight'){event.preventDefault();index+=event.key==='ArrowLeft'?-1:1;render();}});
 dialog.addEventListener('click',event=>{if(event.target===dialog){const r=dialog.getBoundingClientRect();if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom)dialog.close();}});
 dialog.addEventListener('close',()=>{document.body.classList.remove('character-dialog-open');opener?.focus({preventScroll:true});});
 const img=document.getElementById('characterDialogImage');
 img.addEventListener('touchstart',event=>{touchX=event.touches.length===1?event.touches[0].clientX:null;},{passive:true});
 img.addEventListener('touchend',event=>{if(touchX===null)return;const dx=event.changedTouches[0].clientX-touchX;touchX=null;if(Math.abs(dx)>55){index+=dx<0?1:-1;render();}},{passive:true});
 img.addEventListener('touchcancel',()=>touchX=null,{passive:true});
}
module.exports={initCharacterGallery};
