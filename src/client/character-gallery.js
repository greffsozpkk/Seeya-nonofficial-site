const items=require('../data/character-gallery.json');
const {characterCaption,characterAlt}=require('../shared/character-caption');
function initCharacterGallery(){
 const section=document.getElementById('characterCollection'),dialog=document.getElementById('characterDialog');
 if(!section)return;
 const cards=[...section.querySelectorAll('.character-card')],pageSize=6,pageCount=Math.ceil(cards.length/pageSize);
 const pagination=document.createElement('nav');pagination.className='character-pagination';pagination.setAttribute('aria-label','캐릭터 이미지 페이지');
 const status=document.createElement('p');status.className='character-page-status';status.setAttribute('aria-live','polite');
 section.querySelector('.character-grid').after(status,pagination);
 const heading=section.querySelector('#characterCollectionTitle');heading.tabIndex=-1;
 const readPage=()=>{const value=Number(new URL(location.href).searchParams.get('page'));return Number.isInteger(value)&&value>0?Math.min(value,pageCount):1;};
 function showPage(scroll=false){
  const current=readPage();cards.forEach((card,i)=>card.hidden=i<(current-1)*pageSize||i>=current*pageSize);
  status.textContent=`${current} / ${pageCount} 페이지 · 전체 ${cards.length}장`;
  pagination.replaceChildren();pagination.hidden=pageCount<=1;
  const add=(label,page,disabled=false)=>{const button=document.createElement('button');button.type='button';button.textContent=label;button.disabled=disabled;
   if(label===String(current))button.setAttribute('aria-current','page');
   button.addEventListener('click',()=>{const url=new URL(location.href);if(page===1)url.searchParams.delete('page');else url.searchParams.set('page',page);history.pushState(null,'',url);showPage(true);});pagination.append(button);};
  add('이전',current-1,current===1);
  const start=Math.max(1,Math.min(current-2,pageCount-4));
  for(let p=start;p<=Math.min(pageCount,start+4);p++)add(String(p),p);
  add('다음',current+1,current===pageCount);
  if(scroll){heading.focus({preventScroll:true});section.scrollIntoView({block:'start'});}
 }
 showPage();window.addEventListener('popstate',()=>showPage(true));
 if(!dialog||typeof dialog.showModal!=='function')return;
 let index=0,opener=null,touchX=null;
 function render(){
  index=(index+items.length)%items.length;const item=items[index];
  const img=document.getElementById('characterDialogImage');img.src=item.image;img.alt=characterAlt(item,index);
  document.getElementById('characterDialogTitle').innerHTML=characterCaption(item);
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
