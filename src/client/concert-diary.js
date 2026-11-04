'use strict';
const C=require('../shared/concert-diary'),P=require('../shared/passport'),Save=require('../shared/passport-play-save'),Poster=require('./my-concert-poster');
async function save(d,songs){
 const concertPoster=C.snapshot(d,songs),json=JSON.stringify(concertPoster);
 const hash=Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(json)))).map(v=>v.toString(16).padStart(2,'0')).join('');
 const at=new Date(),record=P.entry({entryId:'concert-'+hash,kind:'play',status:'done',date:P.today(),title:d.title,members:['seeya'],play:{game:'other',level:'나만의 씨야 콘서트',mode:Object.values(d.sections).flat().length+'곡',source:'result'},note:'직접 구성한 가상 콘서트의 셋리스트와 포스터입니다.',concertPoster,createdAt:at.toISOString(),updatedAt:at.toISOString()});
 const task=()=>Save.save(localStorage,record);
 return navigator.locks?navigator.locks.request('seeya-passport-save',task):task();
}
async function mount(host,value,download){
 host.innerHTML='<h3>나의 콘서트 포스터</h3><p role="status">포스터를 불러오고 있어요.</p>';
 try{
  const recipe=C.clean(value),canvas=document.createElement('canvas');await Poster.render(canvas,recipe.draft,recipe.songs);if(!host.isConnected)return;
  canvas.setAttribute('role','img');canvas.setAttribute('aria-label',recipe.draft.title+' 콘서트 셋리스트 포스터');canvas.style.cssText='width:100%;height:auto;display:block;border-radius:12px';
  host.querySelector('p').textContent='저장 당시의 셋리스트와 디자인입니다. 다이어리 백업에도 함께 포함돼요.';host.append(canvas);
  const button=document.createElement('button');button.type='button';button.textContent='콘서트 포스터 저장';host.append(button);
  button.onclick=async()=>{button.disabled=true;try{download(await Poster.png(canvas),'seeya-diary-concert.png');}catch(e){host.querySelector('p').textContent=e.message;}finally{button.disabled=false;}};
 }catch(e){if(host.isConnected)host.querySelector('p').textContent='포스터를 불러오지 못했어요. '+e.message;}
}
module.exports={save,mount};
