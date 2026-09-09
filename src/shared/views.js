const {albums,history,tarot,TODAY_SONGS,TODAY_MOODS,fanChantImages,archiveTypes,W,esc,archivePageItems,archiveSearchText,galleryCard,pickTodayMoment,newsDateParts}=require('./common');
function newsList(items){
  if(!items?.length)return '<div class="news-empty">최근 검색된 기사가 없습니다.</div>';
  return `<div class="news-list">${items.slice(0,10).map(item=>{
    const p=newsDateParts(item.pubDate);
    return `<a class="news-card" href="${esc(item.link)}" target="_blank" rel="noopener noreferrer">
      <div class="news-date"><strong>${p.day}</strong><span>${p.ym}</span></div>
      <div class="news-body">
        <span class="news-source">${esc(item.source||"NEWS")}</span>
        <h3>${esc(item.title||"")}</h3>
        ${item.description?`<p>${esc(item.description)}</p>`:""}
      </div>
      <div class="news-go">기사 읽기 ↗</div>
    </a>`;
  }).join("")}</div>`;
}
function galleryMoment(galleryItems,now=new Date()){
  const x=pickTodayMoment(galleryItems,now);
  if(!x)return `<div class="gallery-moment-empty"><b>SEEYA</b><span>ADD YOUR PHOTOS</span></div>`;
  const index=galleryItems.indexOf(x);
  const image=x.image||"";
  const title=esc(x.title||"오늘 만나는 씨야의 한 장");
  const member=esc(x.member||"씨야");
  const source=esc(x.source||"");
  const date=esc(x.date||"");
  const sourceLink=esc(x.sourceLink||x.link||"");
  const media=image?`<img src="${esc(image)}" alt="${title}" onerror="this.parentElement.innerHTML='<div class=&quot;gallery-moment-empty&quot;><b>SEEYA</b><span>ADD PHOTO</span></div>'">`:`<div class="gallery-moment-empty"><b>SEEYA</b><span>ADD PHOTO</span></div>`;
  return `<article class="gallery-moment">
    <button type="button" class="gallery-moment-media" onclick="openGalleryLightbox(${index})" aria-label="${title} 크게 보기" style="border:0;padding:0;width:100%;font:inherit;text-align:inherit">${media}</button>
    <div class="gallery-moment-copy">
      <div class="gallery-moment-label">TODAY'S SEEYA PHOTO</div>
      <h3 class="gallery-moment-member">${member}</h3>
      <p class="gallery-moment-title">${title}</p>
      ${(source||date)?`<div class="gallery-moment-meta">${source?`<span>${source}</span>`:""}${date?`<span>· ${date}</span>`:""}</div>`:""}
      ${sourceLink?`<a class="gallery-moment-link" href="${sourceLink}" target="_blank" rel="noopener noreferrer">원본 게시물 보기 <span>↗</span></a>`:""}
    </div>
  </article>`;
}
function getFilteredArchive(archiveData,archiveState){const q=archiveState.query.toLowerCase();let rows=archiveData.filter(x=>{if(archiveState.year!=="all"&&!String(x.date||"").startsWith(archiveState.year))return false;if(archiveState.member!=="all"&&!(x.members||[]).includes(archiveState.member))return false;if(archiveState.type!=="all"&&x.type!==archiveState.type)return false;if(q&&!archiveSearchText(x).includes(q))return false;return true;});rows.sort((a,b)=>archiveState.sort==="oldest"?String(a.date).localeCompare(String(b.date)):archiveState.sort==="added"?(String(b.addedAt||"").localeCompare(String(a.addedAt||""))||String(b.date).localeCompare(String(a.date))):String(b.date).localeCompare(String(a.date)));return rows;}
function archivePagination(totalPages,archiveState){
  if(totalPages<=1)return "";
  const current=archiveState.page;
  const pages=archivePageItems(current,totalPages);
  return `<button class="archive-page-btn" type="button" onclick="setArchivePage(${current-1})" ${current===1?"disabled":""} aria-label="이전 페이지">‹</button>${pages.map(p=>p==="…"?`<span class="archive-page-gap">…</span>`:`<button class="archive-page-btn ${p===current?"active":""}" type="button" onclick="setArchivePage(${p})" ${p===current?'aria-current="page"':""}>${p}</button>`).join("")}<button class="archive-page-btn" type="button" onclick="setArchivePage(${current+1})" ${current===totalPages?"disabled":""} aria-label="다음 페이지">›</button>`;
}
function archiveView(archiveData,archiveState){
  const view={grid:"",count:"",active:"",pagination:""};
  const ARCHIVE_PAGE_SIZE=9;
  const rows=getFilteredArchive(archiveData,archiveState);
  const totalPages=Math.max(1,Math.ceil(rows.length/ARCHIVE_PAGE_SIZE));
  if(archiveState.page>totalPages)archiveState.page=totalPages;
  if(archiveState.page<1)archiveState.page=1;
  const currentPage=archiveState.page;
  const start=(currentPage-1)*ARCHIVE_PAGE_SIZE;
  const pageRows=rows.slice(start,start+ARCHIVE_PAGE_SIZE);
  view.count=rows.length?`총 ${rows.length}개의 기록 · ${currentPage} / ${totalPages} 페이지`:"총 0개의 기록";
  {
    const arr=[];
    if(archiveState.query)arr.push(`검색 · ${archiveState.query}`);
    if(archiveState.year!=="all")arr.push(archiveState.year);
    if(archiveState.member!=="all")arr.push(archiveState.member);
    if(archiveState.type!=="all")arr.push(archiveTypes[archiveState.type]||archiveState.type);
    view.active=arr.length?arr.map(x=>`<span>${esc(x)}</span>`).join("")+`<button class="archive-reset" onclick="resetArchiveFilters()">조건 초기화 ×</button>`:"";
  }
  if(!rows.length){
    view.grid=`<div class="archive-empty"><b>조건에 맞는 기록이 없습니다.</b><br><br>검색어나 필터를 바꿔보세요.</div>`;
    return view;
  }
  view.grid=pageRows.map(x=>{const typeLabel=archiveTypes[x.type]||x.type;const members=(x.members||[]).join(" · ");const titleTracks=(x.titleTracks||[]).filter(s=>!/(\binst\.?\b|\(inst\.?\))/i.test(s)).join(" · ");const relatedSongs=x.type!=="album"?(x.songs||[]).filter(s=>!/(\binst\.?\b|\(inst\.?\))/i.test(s)).join(" · "):"";const collaborators=(x.collaborators||[]).join(" · ");const fallback=`<div class="archive-thumb-placeholder archive-cover-fallback"><b>${String(x.date).slice(0,4)}</b><small>${x.releaseType||typeLabel}</small><em>${x.album||x.program||x.title}</em></div>`;const categoryPlaceholder=x.type==="music-show"?"images/archive/archive-stage.png":x.type==="interview"?"images/archive/archive-interview.png":"";const visual=x.thumbnail||categoryPlaceholder;const visualAlt=x.thumbnail&&x.type==="album"?(x.album||x.title)+" 앨범 커버":"";const thumb=visual?`${fallback}<img src="${visual}" alt="${visualAlt}" loading="lazy" onerror="this.remove()">`:fallback;const albumInfo=x.type==="album"?`${x.releaseType?`유형 · ${x.releaseType}<br>`:""}${x.trackCount?`수록 · ${x.trackCount}곡<br>`:""}${x.genre?`장르 · ${x.genre}<br>`:""}`:"";const eventMark=x.eventState==="scheduled"?`<span class="archive-event-state">UPCOMING</span>`:"";const awardInfo=x.awardCategory?`수상 · ${x.awardCategory}<br>`:"";return `<article class="archive-card"><div class="archive-thumb">${thumb}<span class="archive-status">${x.status==="available"?"● AVAILABLE":"○ UNKNOWN"}</span>${eventMark}</div><div class="archive-body"><div class="archive-date">${x.date}</div><div class="archive-program">${x.program||typeLabel}</div><h3>${x.title}</h3><div class="archive-meta">${albumInfo}${x.venue?`장소 · ${x.venue}<br>`:""}${awardInfo}${members?`멤버 · ${members}<br>`:""}${collaborators?`함께 · ${collaborators}<br>`:""}${titleTracks?`<strong class="archive-title-track">TITLE · ${titleTracks}</strong>`:""}${relatedSongs?`<span class="archive-related-song">관련곡 · ${relatedSongs}</span>`:""}${x.agency?`<br>기획 · ${x.agency}`:""}${x.note?`<span class="archive-card-note">${x.note}</span>`:""}</div><div class="archive-tags">${(x.tags||[]).slice(0,6).map(t=>`<span>#${t}</span>`).join("")}</div><a class="archive-source" href="${x.source?.url||"#"}" target="_blank" rel="noopener">${x.source?.label||x.source?.platform||"원본"}에서 보기 →</a></div></article>`;}).join("");
  view.pagination=archivePagination(totalPages,archiveState);
  return view;
}
module.exports={newsList,galleryMoment,getFilteredArchive,archiveView};
