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
  if(p.kind!==undefined&&!['post','reel'].includes(p.kind))throw new Error('Invalid fan gallery kind: '+p.id);
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
 const url='https://www.instagram.com/'+(p.kind==='reel'?'reel':'p')+'/'+p.id+'/';
 const credit=p.accountName===p.account?'@'+escape(p.account):`${escape(p.accountName)}<span>@${escape(p.account)}</span>`;
 return `<article class="fan-photo-card"><h3>${escape(p.label)}</h3><p class="fan-photo-date">게시일 <time datetime="${p.postedOn}">${p.postedOn}</time></p><div class="fan-photo-embed"><blockquote class="instagram-media" data-instgrm-permalink="${url}" data-instgrm-version="14"><a href="${url}" target="_blank" rel="noopener noreferrer">Instagram에서 게시물 보기</a></blockquote></div><div class="fan-photo-credit"><a href="https://www.instagram.com/${p.account}/" target="_blank" rel="noopener noreferrer">${credit}</a><a href="${url}" target="_blank" rel="noopener noreferrer">원본 게시물 보기 ↗</a></div></article>`;
}).join('')||'<p class="fan-photo-empty">함께 간직할 사진을 기다리고 있어요.</p>';}
function pagination(page,totalPages){
 if(totalPages<=1)return '';
 return `<button type="button" data-fan-page="${page-1}"${page===1?' disabled':''}>이전</button><span>${page} / ${totalPages}</span><button type="button" data-fan-page="${page+1}"${page===totalPages?' disabled':''}>다음</button>`;
}
module.exports={PAGE_SIZE,prepare,pageSlice,cards,pagination};

},
"src/data/fan-posts.json":function(module,exports,__require){
module.exports={"accounts":[{"handle":"seeya_tree.weathered","name":"계절을 견딘 나무"},{"handle":"_jerry.j_ramficial","name":"제리제이"},{"handle":"zenix_5071","name":"zenix_5071"},{"handle":"87dynamic_ssc","name":"87dynamic_ssc"},{"handle":"ramirang_","name":"ramirang_"},{"handle":"w.beauty_m","name":"w.beauty_m"},{"handle":"gyuljam0426","name":"gyuljam0426"},{"handle":"nam_hee0928","name":"nam_hee0928"},{"handle":"dream_afr_10","name":"dream_afr_10"},{"handle":"terry.seo_93","name":"terry.seo_93"},{"handle":"leeboram_ing","name":"leeboram_ing"},{"handle":"cup_soohans","name":"cup_soohans"},{"handle":"seeya060312","name":"seeya060312"}],"posts":[{"id":"DdehVH8kl_M","account":"zenix_5071","postedOn":"2026-09-20","label":"씨야","kind":"post"},{"id":"Ddd24NmT3wc","account":"87dynamic_ssc","postedOn":"2026-09-19","label":"씨야","kind":"post"},{"id":"DdeOn5kS2FA","account":"ramirang_","postedOn":"2026-09-19","label":"김연지 · 이보람","kind":"reel"},{"id":"DdWi60Vmks6","account":"seeya_tree.weathered","postedOn":"2026-09-16","label":"남규리"},{"id":"DdWhfOgAcCS","account":"_jerry.j_ramficial","postedOn":"2026-09-16","label":"씨야"},{"id":"DdWgQnNgapZ","account":"_jerry.j_ramficial","postedOn":"2026-09-16","label":"이보람"},{"id":"DdT810Eklwz","account":"w.beauty_m","postedOn":"2026-09-15","label":"씨야","kind":"post"},{"id":"DdEe3aGPK3b","account":"seeya_tree.weathered","postedOn":"2026-09-09","label":"씨야"},{"id":"DdC-1r2AXGa","account":"_jerry.j_ramficial","postedOn":"2026-09-09","label":"씨야"},{"id":"DdCwvX6Ej0l","account":"_jerry.j_ramficial","postedOn":"2026-09-08","label":"이보람"},{"id":"Dc-wanjGvuU","account":"seeya_tree.weathered","postedOn":"2026-09-07","label":"이보람"},{"id":"Dc-jcp7Gvrz","account":"seeya_tree.weathered","postedOn":"2026-09-07","label":"김연지"},{"id":"Dc8XLtTAXSH","account":"_jerry.j_ramficial","postedOn":"2026-09-06","label":"씨야"},{"id":"Dc6Dx9QGt6D","account":"seeya_tree.weathered","postedOn":"2026-09-05","label":"남규리"},{"id":"Dc41E9zmpm8","account":"seeya_tree.weathered","postedOn":"2026-09-04","label":"씨야"},{"id":"Dc27s3NGpNb","account":"seeya_tree.weathered","postedOn":"2026-09-04","label":"이보람"},{"id":"Dc3CCg9gdnW","account":"_jerry.j_ramficial","postedOn":"2026-09-04","label":"씨야"},{"id":"Dc3AWteAfik","account":"_jerry.j_ramficial","postedOn":"2026-09-04","label":"이보람"},{"id":"Dc02HW0mg47","account":"seeya_tree.weathered","postedOn":"2026-09-03","label":"김연지"},{"id":"DcyEN1pmn91","account":"seeya_tree.weathered","postedOn":"2026-09-02","label":"남규리"},{"id":"DcwxOFQkgMh","account":"seeya_tree.weathered","postedOn":"2026-09-01","label":"이보람"},{"id":"Dcs5aWPGgaY","account":"seeya_tree.weathered","postedOn":"2026-08-31","label":"김연지"},{"id":"DctSQpuAa83","account":"_jerry.j_ramficial","postedOn":"2026-08-31","label":"이보람"},{"id":"DcslwFdGsJt","account":"seeya_tree.weathered","postedOn":"2026-08-31","label":"남규리"},{"id":"DcoVY5uAdq7","account":"_jerry.j_ramficial","postedOn":"2026-08-29","label":"씨야"},{"id":"DcfLyqTPCu_","account":"seeya_tree.weathered","postedOn":"2026-08-26","label":"남규리 · 이보람"},{"id":"DcdUD8ePUch","account":"seeya_tree.weathered","postedOn":"2026-08-25","label":"씨야"},{"id":"DcdHQRAGiv5","account":"seeya_tree.weathered","postedOn":"2026-08-25","label":"남규리"},{"id":"DcXPTT5AY0b","account":"_jerry.j_ramficial","postedOn":"2026-08-23","label":"이보람"},{"id":"DcQNgTegX-I","account":"_jerry.j_ramficial","postedOn":"2026-08-20","label":"이보람"},{"id":"DcM0bO8AbGb","account":"_jerry.j_ramficial","postedOn":"2026-08-19","label":"이보람"},{"id":"DcKIrKUEstT","account":"_jerry.j_ramficial","postedOn":"2026-08-18","label":"이보람"},{"id":"DcGFNWdgQSM","account":"_jerry.j_ramficial","postedOn":"2026-08-16","label":"이보람"},{"id":"DcGCgTjgfjZ","account":"_jerry.j_ramficial","postedOn":"2026-08-16","label":"이보람"},{"id":"DcF9EBTgdkm","account":"_jerry.j_ramficial","postedOn":"2026-08-16","label":"이보람"},{"id":"DcD6pDogTzq","account":"_jerry.j_ramficial","postedOn":"2026-08-15","label":"이보람"},{"id":"DcD6LHvgUoD","account":"_jerry.j_ramficial","postedOn":"2026-08-15","label":"씨야"},{"id":"DcDcwvhgXqd","account":"_jerry.j_ramficial","postedOn":"2026-08-15","label":"이보람"},{"id":"Db4QZMfjzIG","account":"seeya_tree.weathered","postedOn":"2026-08-11","label":"씨야"},{"id":"Db2ceHtGpKz","account":"seeya_tree.weathered","postedOn":"2026-08-10","label":"이보람"},{"id":"Db2YrX9Gm9w","account":"seeya_tree.weathered","postedOn":"2026-08-10","label":"김연지"},{"id":"Db2S0XDmjoJ","account":"seeya_tree.weathered","postedOn":"2026-08-10","label":"남규리"},{"id":"DbpiQZGmrto","account":"seeya_tree.weathered","postedOn":"2026-08-05","label":"남규리"},{"id":"DbpYB_VGud-","account":"seeya_tree.weathered","postedOn":"2026-08-05","label":"이보람"},{"id":"DbpQgNRGkRy","account":"seeya_tree.weathered","postedOn":"2026-08-05","label":"김연지"},{"id":"DbOmYYPkuAL","account":"seeya_tree.weathered","postedOn":"2026-07-26","label":"남규리"},{"id":"Da0nGw-z1ON","account":"gyuljam0426","postedOn":"2026-07-16","label":"남규리 · 이보람","kind":"reel"},{"id":"Dawp4gtTnbB","account":"nam_hee0928","postedOn":"2026-07-14","label":"이보람","kind":"reel"},{"id":"DY0swylP8ML","account":"dream_afr_10","postedOn":"2026-05-27","label":"김연지","kind":"reel"},{"id":"DX9V1QQErHq","account":"terry.seo_93","postedOn":"2026-05-05","label":"씨야","kind":"post"},{"id":"DX8DokUPIvS","account":"leeboram_ing","postedOn":"2026-05-05","label":"이보람","kind":"reel"},{"id":"DW_siXBEZ9g","account":"cup_soohans","postedOn":"2026-04-11","label":"이보람","kind":"post"},{"id":"DVz6CKCj9EY","account":"leeboram_ing","postedOn":"2026-03-13","label":"이보람","kind":"reel"},{"id":"DVx8eftj0Mf","account":"seeya060312","postedOn":"2026-03-12","label":"씨야","kind":"post"}]};
}
};const cache={};function __require(id){if(cache[id])return cache[id].exports;const m=cache[id]={exports:{}};modules[id](m,m.exports,__require);return m.exports;}__require("src/client/fan-gallery.js");})();
