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
