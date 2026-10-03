'use strict';
const {esc,dateLabel}=require('./radio');
function resolvePodcasts(archive,reviews,today){
 const seen=new Set();
 return reviews.flatMap(review=>{
  const row=archive.find(r=>r.id===review.recordId);
  if(!row||row.type!=='radio'||row.hidden||['hidden','scheduled','upcoming','cancelled'].includes(row.status)||['scheduled','upcoming','cancelled'].includes(row.eventState)||row.date>today||review.status!=='official-embed-checked'||!/^\d+$/.test(review.showId)||!/^\d+$/.test(review.episodeId)||seen.has(review.episodeId))return [];
  const source=[row.source,...(row.additionalSources||[])].find(s=>{try{const u=new URL(s.url);return u.protocol==='https:'&&u.hostname==='podcasts.apple.com'&&u.pathname.endsWith('/id'+review.showId)&&u.searchParams.get('i')===review.episodeId;}catch{return false;}});
  if(!source)return [];
  seen.add(review.episodeId);
  return [{id:row.id,title:row.title,date:row.date,dateBasis:row.dateBasis,dateStatus:row.dateStatus,program:row.program||'',members:row.members||[],source:source.label,url:source.url,embed:`https://embed.podcasts.apple.com/kr/podcast/id${review.showId}?i=${review.episodeId}&theme=auto`,publisher:review.publisher}];
 }).sort((a,b)=>b.date.localeCompare(a.date)||a.id.localeCompare(b.id));
}
function current(row){return `<div class="radio-now-label">지금 고른 방송 · 공식 팟캐스트</div><h2>${esc(row.title)}</h2><p>${esc(row.program)}</p><p>${esc(row.date)} · ${dateLabel(row)} · ${esc(row.members.join(' · '))}</p><p class="radio-credits">${esc(row.publisher)} · Apple Podcasts</p>`;}
function frame(row){return `<iframe id="podcastPlayer" src="${esc(row.embed)}" title="${esc(row.title)} · Apple Podcasts 플레이어" allow="autoplay; encrypted-media" referrerpolicy="strict-origin-when-cross-origin"></iframe>`;}
module.exports={resolvePodcasts,current,frame};
