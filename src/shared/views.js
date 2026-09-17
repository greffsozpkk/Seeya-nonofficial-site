const {concertForRecord,concertPath}=require('./concert-data');
const {songByTitle,songPath}=require('./stage-data');
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
function archiveEffectiveDate(x){return x.date||x.publishedDate||"";}
function archiveDateLabel(x){
 const date=archiveEffectiveDate(x);
 if(!date)return "날짜 확인 중";
 const basis=x.dateBasis||(!x.date&&x.publishedDate?"video-published":"");
 const label={"article-published":"기사 게시일","post-published":"게시글 작성일",interview:"인터뷰일","video-published":"영상 게시일",broadcast:"방송일",recording:"녹화일",schedule:"일정표 기준",event:"행사일",release:"발매·공개일","series-start":"첫 방송일",season:"공연 시즌"}[basis]||(x.dateStatus==="tentative"?"잠정 날짜":"");
 return esc(date)+(x.endDate?" ~ "+esc(x.endDate):"")+(label?" · "+label:"")+(x.dateStatus==="tentative"&&label!=="잠정 날짜"?" (잠정)":"");
}
function getFilteredArchive(archiveData,archiveState){const q=archiveState.query.toLowerCase();let rows=archiveData.filter(x=>{if(archiveState.record&&x.id!==archiveState.record)return false;if(archiveState.year!=="all"&&!archiveEffectiveDate(x).startsWith(archiveState.year))return false;if(archiveState.member!=="all"&&!(x.members||[]).includes(archiveState.member))return false;if(archiveState.type!=="all"&&x.type!==archiveState.type)return false;if(q&&!archiveSearchText(x).includes(q))return false;return true;});rows.sort((a,b)=>!archiveEffectiveDate(a)!==!archiveEffectiveDate(b)?(!archiveEffectiveDate(a)?1:-1):archiveState.sort==="oldest"?archiveEffectiveDate(a).localeCompare(archiveEffectiveDate(b)):archiveState.sort==="added"?(String(b.addedAt||"").localeCompare(String(a.addedAt||""))||archiveEffectiveDate(b).localeCompare(archiveEffectiveDate(a))):archiveEffectiveDate(b).localeCompare(archiveEffectiveDate(a)));return rows;}
function archivePagination(totalPages,archiveState){
  if(totalPages<=1)return "";
  const current=archiveState.page;
  const pages=archivePageItems(current,totalPages);
  return `<button class="archive-page-btn" type="button" onclick="setArchivePage(${current-1})" ${current===1?"disabled":""} aria-label="이전 페이지">‹</button>${pages.map(p=>p==="…"?`<span class="archive-page-gap">…</span>`:`<button class="archive-page-btn ${p===current?"active":""}" type="button" onclick="setArchivePage(${p})" ${p===current?'aria-current="page"':""}>${p}</button>`).join("")}<button class="archive-page-btn" type="button" onclick="setArchivePage(${current+1})" ${current===totalPages?"disabled":""} aria-label="다음 페이지">›</button>`;
}
function archiveSources(x){
 const sources=[x.source,...(x.additionalSources||[])].filter(s=>{
  if(!s?.url)return false;
  try{const u=new URL(s.url);return ["http:","https:"].includes(u.protocol)&&!(u.hostname==="docs.google.com"&&u.pathname.startsWith("/spreadsheets/"));}catch{return false;}
 });
 return sources.filter((s,i,a)=>a.findIndex(t=>t.url===s.url)===i);
}
function archiveSourceLinks(x){
 return archiveSources(x).map(s=>`<a class="archive-source" href="${esc(s.url)}" target="_blank" rel="noopener noreferrer">${esc(s.label||s.platform||"원본")} 보기 →</a>`).join("");
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
  view.grid=pageRows.map(x=>{
    const typeLabel=archiveTypes[x.type]||x.type;
    const members=(x.members||[]).join(" · ");
    const titleTracks=(x.titleTracks||[]).filter(s=>!/(\binst\.?\b|\(inst\.?\))/i.test(s)).join(" · ");
    const relatedSongs=x.type!=="album"?(x.songs||[]).filter(s=>!/(\binst\.?\b|\(inst\.?\))/i.test(s)).map(name=>{
      const song=songByTitle(name);return song?`<a href="${songPath(song)}">${esc(name)}</a>`:esc(name);
    }).join(" · "):"";
    const collaborators=(x.collaborators||[]).join(" · ");
    const visual=x.thumbnail||(x.type==="music-show"?"images/archive/archive-stage.png":x.type==="interview"?"images/archive/archive-interview.png":"");
    const visualAlt=x.thumbnail&&x.type==="album"?(x.album||x.title)+" 앨범 커버":"";
    const thumbnail=visual?`<img class="archive-small-thumb" src="${esc(visual)}" alt="${esc(visualAlt)}" loading="lazy" onerror="this.remove()">`:"";
    const sources=archiveSources(x),primary=sources[0],extra=sources.slice(1);
    const primaryLabel=x.eventState==="scheduled"?"안내 보기":x.type==="news"?"기사 보기":x.type==="radio"?"방송 보기":"원본 보기";
    const sourceLink=s=>`<a class="archive-source" href="${esc(s.url)}" target="_blank" rel="noopener noreferrer">${esc(s.label||s.platform||"원본")} 보기 ↗</a>`;
    const concert=concertForRecord(x.id);
    const state=x.status==="documented"?"일정 기록":x.status==="unverified"?"자료 확인 중":x.status!=="available"?"자료 확인 중":"";
    const badges=`${x.eventState==="scheduled"?'<span class="archive-compact-state">UPCOMING · 예정</span>':""}${state?`<span class="archive-compact-state">${state}</span>`:""}`;
    const albumInfo=x.type==="album"?`${x.releaseType?`유형 · ${esc(x.releaseType)}<br>`:""}${x.trackCount?`수록 · ${esc(x.trackCount)}곡<br>`:""}${x.genre?`장르 · ${esc(x.genre)}<br>`:""}`:"";
    return `<article class="archive-card" data-record-id="${esc(x.id)}">
      <div class="archive-compact-head">
        <div class="archive-date">${archiveDateLabel(x)}</div>
        ${thumbnail}
        <div class="archive-compact-category">${esc(typeLabel)}</div>
        <h3>${esc(x.title)}</h3>
        ${members?`<div class="archive-compact-members">${esc(members)}</div>`:""}
        ${badges?`<div class="archive-compact-badges">${badges}</div>`:""}
      </div>
      <div class="archive-card-footer ${primary?'has-primary':''}">
        ${primary?`<a class="archive-source" href="${esc(primary.url)}" target="_blank" rel="noopener noreferrer" aria-label="${esc(x.title)} · ${esc(primary.label||primary.platform||'원본')} 보기">${primaryLabel} ↗</a>`:""}
        <details class="archive-details">
          <summary><span class="archive-detail-closed">${extra.length?`상세·추가 자료 ${extra.length}개`:"상세 보기"}</span><span class="archive-detail-open">접기</span><span class="archive-detail-arrow" aria-hidden="true">⌄</span></summary>
          <div class="archive-detail-content">
            ${x.program?`<div class="archive-detail-program">${esc(x.program)}</div>`:""}
            <div class="archive-meta">${albumInfo}${x.venue?`장소 · ${esc(x.venue)}<br>`:""}${x.awardCategory?`수상 · ${esc(x.awardCategory)}<br>`:""}${collaborators?`함께 · ${esc(collaborators)}<br>`:""}${titleTracks?`<strong class="archive-title-track">TITLE · ${esc(titleTracks)}</strong>`:""}${relatedSongs?`<span class="archive-related-song">관련곡 · ${relatedSongs}</span>`:""}${x.agency?`<div>기획 · ${esc(x.agency)}</div>`:""}${x.note?`<p class="archive-card-note">${esc(x.note)}</p>`:""}</div>
            ${primary?`<div class="archive-primary-credit">대표 출처 · ${esc(primary.label||primary.platform||"원본")}</div>`:""}
            ${extra.length?`<div class="archive-extra-sources">${extra.map(sourceLink).join("")}</div>`:""}
            ${concert?`<a class="archive-source" href="${concertPath(concert)}?event=${encodeURIComponent(x.id)}">콘서트 기록관 보기 →</a>`:""}
            ${(x.tags||[]).length?`<div class="archive-tags">${x.tags.slice(0,6).map(t=>`<span>#${esc(t)}</span>`).join("")}</div>`:""}
          </div>
        </details>
      </div>
    </article>`;
  }).join("");
  view.pagination=archivePagination(totalPages,archiveState);
  return view;
}
module.exports={archiveDateLabel,archiveSourceLinks,newsList,galleryMoment,getFilteredArchive,archiveView};
