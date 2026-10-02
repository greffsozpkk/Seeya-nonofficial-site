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
const kindLabel=kind=>({full:'전체본 · 채널 표기',replay:'방송 다시보기',clip:'라이브 클립',part:'방송 일부 · 1–2부'}[kind]||'영상');
function filterRadio(rows,{member='전체',query='',sort='newest'}={}){
 const q=query.trim().toLocaleLowerCase();return rows.filter(r=>(member==='전체'||(member==='씨야'?(r.members.includes('씨야')||['남규리','김연지','이보람'].every(m=>r.members.includes(m))):r.members.includes(member)))&&(!q||[r.title,r.program,r.channel,...r.members].join(' ').toLocaleLowerCase().includes(q))).sort((a,b)=>(sort==='oldest'?1:-1)*a.date.localeCompare(b.date)||a.id.localeCompare(b.id));
}
function cards(rows,selected,saved=[]){return rows.map(r=>`<article class="radio-item ${r.id===selected?'is-selected':''}"><div class="radio-wave" aria-hidden="true">${r.kind==='clip'?'♫':'◖◗'}</div><div class="radio-item-copy"><h3>${esc(r.title)}</h3><p>${esc(r.date)} · ${esc(r.members.join(' · '))}</p><p>${esc(r.program)}</p><div class="radio-item-meta">${esc(r.channel)} · ${kindLabel(r.kind)}${saved.includes(r.id)?' · 저장됨':''}</div></div><button type="button" data-radio-id="${esc(r.id)}" aria-pressed="${r.id===selected}" aria-label="${esc(r.title)} ${r.id===selected?'선택됨':'선택'}">${r.id===selected?'선택됨':'선택'}</button></article>`).join('')||'<p class="radio-empty">조건에 맞는 방송이 없습니다.<br>검색어나 필터를 바꿔보세요.</p>';}
function selection(r){return `<div class="radio-now-label">지금 고른 방송 · ${kindLabel(r.kind)}</div><h2 id="radioCurrentTitle">${esc(r.title)}</h2><p>${esc(r.program)}</p><p class="radio-credits">${esc(r.date)} · ${r.dateBasis==='broadcast'?'방송일':'기록일'} · ${esc(r.members.join(' · '))}<br>${esc(r.channel)}</p>`;}
const clock=seconds=>{const n=Math.max(0,Math.floor(Number(seconds)||0));return n>=3600?`${Math.floor(n/3600)}:${String(Math.floor(n/60)%60).padStart(2,'0')}:${String(n%60).padStart(2,'0')}`:`${Math.floor(n/60)}:${String(n%60).padStart(2,'0')}`;};
const PAGE_SIZE=9;
function paginateRadio(rows,page=1){const total=Math.max(1,Math.ceil(rows.length/PAGE_SIZE));const current=Math.max(1,Math.min(total,Math.floor(Number(page))||1));return {items:rows.slice((current-1)*PAGE_SIZE,current*PAGE_SIZE),page:current,total};}
function pagination(page,total){if(total<=1)return '';return `<button type="button" data-radio-page="${page-1}" ${page===1?'disabled':''} aria-label="이전 페이지">‹</button>${Array.from({length:total},(_,i)=>i+1).filter(n=>n===1||n===total||Math.abs(n-page)<=2).map((n,i,a)=>`${i&&n-a[i-1]>1?'<span>…</span>':''}<button type="button" data-radio-page="${n}" aria-label="${n}페이지" ${n===page?'aria-current="page"':''}>${n}</button>`).join('')}<button type="button" data-radio-page="${page+1}" ${page===total?'disabled':''} aria-label="다음 페이지">›</button>`;}
module.exports={PAGE_SIZE,paginateRadio,pagination,esc,videoId,resolveRadio,filterRadio,cards,selection,clock};
