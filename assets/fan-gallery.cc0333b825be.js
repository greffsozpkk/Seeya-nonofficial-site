(function(){'use strict';const modules={
"src/client/fan-gallery.js":function(module,exports,__require){
'use strict';
const {prepare,pageSlice,cards,pagination}=__require("src/shared/fan-gallery.js");
const posts=prepare(__require("src/data/fan-posts.json"));
const grid=document.getElementById('fanPhotoGrid');
const pager=document.getElementById('fanPhotoPages');
let page=1;
function embed(){if(window.instgrm&&window.instgrm.Embeds)window.instgrm.Embeds.process();}
function render(requested,focus){
 const state=pageSlice(posts,requested);page=state.page;
 grid.innerHTML=cards(state.items);
 pager.innerHTML=pagination(page,state.totalPages);
 document.getElementById('fanPhotoStatus').textContent=`총 ${posts.length}개 게시물 · ${page} / ${state.totalPages} 페이지`;
 embed();
 if(focus){const heading=document.getElementById('fanPhotoTitle');heading.focus({preventScroll:true});heading.scrollIntoView({block:'start'});}
}
function fromUrl(){return new URLSearchParams(location.search).get('page');}
if(grid&&pager){
 render(fromUrl(),false);
 pager.addEventListener('click',event=>{
  const button=event.target.closest('button[data-fan-page]');if(!button||button.disabled)return;
  const next=pageSlice(posts,button.dataset.fanPage).page;if(next===page)return;
  const url=new URL(location.href);if(next===1)url.searchParams.delete('page');else url.searchParams.set('page',String(next));
  history.pushState(null,'',url);render(next,true);
 });
 window.addEventListener('popstate',()=>render(fromUrl(),true));
 // Load the official renderer only on this page; never copy Instagram image URLs.
 const script=document.createElement('script');script.src='https://www.instagram.com/embed.js';script.async=true;script.addEventListener('load',embed);document.head.append(script);
}

},
"src/shared/fan-gallery.js":function(module,exports,__require){
'use strict';
const PAGE_SIZE=6;
const escape=value=>String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function prepare(data){
 const accounts=new Map();
 for(const a of data.accounts){
  if(!/^[a-zA-Z0-9._]{1,30}$/.test(a.handle)||!a.name||accounts.has(a.handle))throw new Error('Invalid fan gallery account');
  accounts.set(a.handle,a);
 }
 const seen=new Set();
 return data.posts.map(p=>{
  if(!/^[A-Za-z0-9_-]+$/.test(p.id)||seen.has(p.id)||!accounts.has(p.account)||!p.label||!/^\d{4}-\d{2}-\d{2}$/.test(p.postedOn))throw new Error('Invalid fan gallery post: '+p.id);
  seen.add(p.id);return {...p,accountName:accounts.get(p.account).name};
 }).sort((a,b)=>b.postedOn.localeCompare(a.postedOn));
}
function pageSlice(posts,requested){
 const totalPages=Math.max(1,Math.ceil(posts.length/PAGE_SIZE));
 const value=Number(requested);
 const page=Number.isSafeInteger(value)&&value>0?Math.min(value,totalPages):1;
 return {page,totalPages,items:posts.slice((page-1)*PAGE_SIZE,page*PAGE_SIZE)};
}
function cards(items){return items.map(p=>{
 const url='https://www.instagram.com/p/'+p.id+'/';
 return `<article class="fan-photo-card"><h3>${escape(p.label)}</h3><p class="fan-photo-date">게시일 <time datetime="${p.postedOn}">${p.postedOn}</time></p><div class="fan-photo-embed"><blockquote class="instagram-media" data-instgrm-permalink="${url}" data-instgrm-version="14"><a href="${url}" target="_blank" rel="noopener noreferrer">Instagram에서 사진 보기</a></blockquote></div><div class="fan-photo-credit"><a href="https://www.instagram.com/${p.account}/" target="_blank" rel="noopener noreferrer">${escape(p.accountName)}<span>@${escape(p.account)}</span></a><a href="${url}" target="_blank" rel="noopener noreferrer">원본 게시물 보기 ↗</a></div></article>`;
}).join('')||'<p class="fan-photo-empty">함께 간직할 사진을 기다리고 있어요.</p>';}
function pagination(page,totalPages){
 if(totalPages<=1)return '';
 return `<button type="button" data-fan-page="${page-1}"${page===1?' disabled':''}>이전</button><span>${page} / ${totalPages}</span><button type="button" data-fan-page="${page+1}"${page===totalPages?' disabled':''}>다음</button>`;
}
module.exports={PAGE_SIZE,prepare,pageSlice,cards,pagination};

},
"src/data/fan-posts.json":function(module,exports,__require){
module.exports={"accounts":[{"handle":"seeya_tree.weathered","name":"계절을 견딘 나무"}],"posts":[{"id":"DdWi60Vmks6","account":"seeya_tree.weathered","postedOn":"2026-09-16","label":"남규리"},{"id":"DdEe3aGPK3b","account":"seeya_tree.weathered","postedOn":"2026-09-09","label":"씨야"},{"id":"Dc-wanjGvuU","account":"seeya_tree.weathered","postedOn":"2026-09-07","label":"이보람"},{"id":"Dc-jcp7Gvrz","account":"seeya_tree.weathered","postedOn":"2026-09-07","label":"김연지"},{"id":"Dc6Dx9QGt6D","account":"seeya_tree.weathered","postedOn":"2026-09-05","label":"남규리"}]};
}
};const cache={};function __require(id){if(cache[id])return cache[id].exports;const m=cache[id]={exports:{}};modules[id](m,m.exports,__require);return m.exports;}__require("src/client/fan-gallery.js");})();
