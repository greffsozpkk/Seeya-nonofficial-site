'use strict';
const art=require('./our-stage-keepsake-art'),drawTicket=require('./our-stage-ticket-art');
module.exports=function({M,state,root,esc}){
 const cache=new Map();
 function items(){const s=state().simple;if(!s.debuted)return [];
  const result=[{kind:'pass',key:JSON.stringify(['pass',s.nickname,s.passIssuedAt]),label:'나의 아티스트 패스 열기',action:'pass-open',id:'',make:()=>art.drawPass({nickname:s.nickname,issuedAt:s.passIssuedAt})}];
  const album=M.albums.filter(a=>s.concerts[a.id]).sort((a,b)=>s.concerts[b.id].at-s.concerts[a.id].at)[0];
  if(album){const receipt=s.concerts[album.id];result.push({kind:'ticket',key:JSON.stringify(['ticket',album.id,s.nickname,receipt]),label:album.name+' 콘서트 기념 티켓 열기',action:'ticket-open',id:album.id,make:()=>drawTicket({album,index:M.albums.indexOf(album),receipt,nickname:s.nickname})});}
  return result;
 }
 function markup(){if(!state().simple.debuted)return '<button class="wall-pass trainee-pass" data-action="trainee-info" aria-label="연습생 출입증"><span>SEEYA</span><b>TRAINEE</b><small>CHAPTER 00</small></button>';
  return items().map(item=>`<button class="wall-${item.kind} wall-keepsake" data-action="${item.action}" data-value="${item.id}" data-keepsake="${item.kind}" data-image-key="${esc(item.key)}" aria-label="${esc(item.label)}" title="${esc(item.label)}">${cache.get(item.key)?.url?`<img src="${cache.get(item.key).url}" alt="${esc(item.label)}">`:'<span class="keepsake-loading" aria-hidden="true">'+(item.kind==='pass'?'ARTIST PASS':'CONCERT TICKET')+'</span>'}</button>`).join('');
 }
 function refresh(){for(const item of items()){
  const targets=[...root.querySelectorAll(`[data-keepsake="${item.kind}"]`)];for(const target of targets){target.dataset.imageKey=item.key;
  let entry=cache.get(item.key);
  if(!entry){entry={};cache.set(item.key,entry);entry.pending=item.make().then(c=>{
   // Small wall previews reuse the full keepsake composition without retaining full-size canvases.
   const thumb=document.createElement('canvas');thumb.width=item.kind==='pass'?252:540;thumb.height=Math.round(thumb.width*c.height/c.width);thumb.getContext('2d').drawImage(c,0,0,thumb.width,thumb.height);
   entry.url=thumb.toDataURL('image/png');return entry.url;
  }).catch(()=>{cache.delete(item.key);return null;});
  while(cache.size>12)cache.delete(cache.keys().next().value);}
  Promise.resolve(entry.url||entry.pending).then(async url=>{if(!url)return;const img=new Image();img.src=url;img.alt=item.label;
   try{await img.decode();}catch{return;}
   if(!target.isConnected||target.dataset.imageKey!==item.key)return;
   const old=target.querySelector('img');if(old)old.src=url;else target.replaceChildren(img);
  });
 }}}
 return {markup,refresh};
};
