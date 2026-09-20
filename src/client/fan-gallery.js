'use strict';
const {prepare,pageSlice,cards,pagination}=require('../shared/fan-gallery');
const posts=prepare(require('../data/fan-posts.json'));
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
