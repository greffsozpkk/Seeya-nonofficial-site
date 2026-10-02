'use strict';
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function videoId(value){try{const u=new URL(value);if(u.protocol!=='https:')return '';let id='';if(u.hostname==='youtu.be')id=u.pathname.slice(1);else if(['youtube.com','www.youtube.com','m.youtube.com'].includes(u.hostname))id=u.searchParams.get('v')||u.pathname.match(/^\/(?:shorts|live|embed)\/([^/]+)/)?.[1]||'';return /^[\w-]{11}$/.test(id)?id:'';}catch{return '';}}
function resolveRadio(archive,reviews,today){
 const seen=new Set();return reviews.flatMap(review=>{
  const row=archive.find(r=>r.id===review.recordId);
  if(!row||row.type!=='radio'||row.hidden||['hidden','scheduled','upcoming'].includes(row.status)||['scheduled','upcoming','cancelled'].includes(row.eventState)||row.date>today||review.channelStatus!=='official-channel-checked')return [];
  const source=[row.source,...(row.additionalSources||[])].find(s=>s&&videoId(s.url)===review.youtubeId);
  if(!source||seen.has(review.youtubeId))return [];
  seen.add(review.youtubeId);
  return [{id:row.id,date:row.date,dateBasis:row.dateBasis,title:row.title,program:row.program||'',members:row.members||[],source:source.label,videoId:review.youtubeId,kind:review.kind,channel:review.channel}];
 });
}
const kindLabel=kind=>({full:'전체본 · 채널 표기',replay:'방송 다시보기',clip:'라이브 클립'}[kind]||'영상');
function filterRadio(rows,{member='전체',query='',sort='newest'}={}){
 const q=query.trim().toLocaleLowerCase();return rows.filter(r=>(member==='전체'||(member==='씨야'?(r.members.includes('씨야')||['남규리','김연지','이보람'].every(m=>r.members.includes(m))):r.members.includes(member)))&&(!q||[r.title,r.program,r.channel,...r.members].join(' ').toLocaleLowerCase().includes(q))).sort((a,b)=>(sort==='oldest'?1:-1)*a.date.localeCompare(b.date)||a.id.localeCompare(b.id));
}
function cards(rows,selected){return rows.map(r=>`<article class="radio-item"><div class="radio-item-meta"><time>${esc(r.date)}</time><span>${kindLabel(r.kind)}</span></div><h3>${esc(r.title)}</h3><p>${esc(r.program)}</p><p class="radio-credits">${esc(r.members.join(' · '))}<br>${esc(r.channel)}</p><button type="button" data-radio-id="${esc(r.id)}" aria-pressed="${r.id===selected}">${r.id===selected?'선택한 방송':'이 방송 선택'}</button><a href="/archive/?record=${encodeURIComponent(r.id)}">아카이브 기록</a></article>`).join('')||'<p class="radio-empty">조건에 맞는 테스트 영상이 없습니다.<br>이번에는 공식 영상 3개만 먼저 담았습니다.</p>';}
function selection(r){return `<div class="radio-now-label">선택한 방송 · ${kindLabel(r.kind)}</div><h2 id="radioCurrentTitle">${esc(r.title)}</h2><p>${esc(r.date)} · ${r.dateBasis==='broadcast'?'방송일':'기록일'} · ${esc(r.members.join(' · '))}<br>${esc(r.program)}</p><p class="radio-credits">출처 · ${esc(r.source)}<br>채널 · ${esc(r.channel)}</p><a class="radio-original" href="https://www.youtube.com/watch?v=${r.videoId}" target="_blank" rel="noopener noreferrer">YouTube에서 열기 ↗</a>`;}
module.exports={esc,videoId,resolveRadio,filterRadio,cards,selection};
