const albums=require('../data/albums.json');
const history=require('../data/history.json');
const tarot=require('../data/tarot.json');
const TODAY_SONGS=require('../data/today-songs.json');
const TODAY_MOODS=require('../data/today-moods.json');
const fanChantImages=require('../data/fanchant.json');
const archiveTypes=require('../data/archive-types.json');
const W=x=>`<div class="page">${x}</div>`;
function esc(s){
  return String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]))
}
function archivePageItems(current,total){
  if(total<=7)return Array.from({length:total},(_,i)=>i+1);
  const items=[1];
  if(current>4)items.push("…");
  const start=Math.max(2,current-1);
  const end=Math.min(total-1,current+1);
  for(let i=start;i<=end;i++)items.push(i);
  if(current<total-3)items.push("…");
  items.push(total);
  return items;
}
function archiveSearchText(x){return [x.date,x.title,x.program,x.type,x.album,x.releaseType,x.genre,x.style,x.distributor,x.agency,x.note,x.venue,x.awardName,x.awardCategory,x.eventState,x.stageKind,...(x.members||[]),...(x.titleTracks||[]),...(x.songs||[]),...(x.tags||[]),...(x.collaborators||[])].join(" ").toLowerCase();}
function galleryCard(x,index){
  const image=x.image||"";
  const title=esc(x.title||"SEEYA PHOTO");
  const member=esc(x.member||"씨야");
  const media=image?`<img class="gallery-image" src="${esc(image)}" alt="${title}" loading="lazy" onerror="this.parentElement.innerHTML='<div class=&quot;gallery-image-fallback&quot;><b>${member}</b><span>ADD PHOTO</span></div>'">`:`<div class="gallery-image-fallback"><b>${member}</b><span>ADD PHOTO</span></div>`;
  return `<article class="gallery-card">
    <button type="button" class="gallery-image-wrap" onclick="openGalleryLightbox(${index})" aria-label="${title} 크게 보기" style="border:0;padding:0;width:100%;font:inherit;text-align:inherit">${media}<span class="gallery-badge">${member}</span></button>
  </article>`;
}
function pickTodayMoment(items,now=new Date()){if(!items.length)return null;const pool=items.filter(x=>x.featured!==false);const list=pool.length?pool:items;const key=Number(`${now.getFullYear()}${String(now.getMonth()+1).padStart(2,"0")}${String(now.getDate()).padStart(2,"0")}`);return list[key%list.length];}
function newsDateParts(pubDate){
  const d=new Date(pubDate);
  if(isNaN(d))return {day:"--",ym:""};
  const parts=Object.fromEntries(new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Seoul',year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(d).map(p=>[p.type,p.value]));
  return {day:parts.day,ym:parts.year+'.'+parts.month};
}
module.exports={albums,history,tarot,TODAY_SONGS,TODAY_MOODS,fanChantImages,archiveTypes,W,esc,archivePageItems,archiveSearchText,galleryCard,pickTodayMoment,newsDateParts};
