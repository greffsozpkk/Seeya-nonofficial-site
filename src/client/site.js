const {albums,history,tarot,TODAY_SONGS,TODAY_MOODS,fanChantImages,archiveTypes,W,esc,archivePageItems,archiveSearchText,galleryCard,pickTodayMoment,newsDateParts}=require('../shared/common');
const {newsList,galleryMoment,archiveView,getFilteredArchive:filterArchive}=require('../shared/views');
const today=require('../pages/today');
const tarotPage=require('../pages/tarot');
const {mergeArchive}=require('../shared/archive-data');
const ARCHIVE_FALLBACK=mergeArchive(require('../../data/archive.json'));
const NEWS_FALLBACK=require('../../data/news.json');
const PHOTOS_FALLBACK=require('../../data/photos.json');
let fanChantLightboxIndex=0,fanChantTouchX=null;
function renderFanChantGrid(){
  const grid=document.getElementById("fanChantGrid");if(!grid)return;
  grid.innerHTML=fanChantImages.map((x,i)=>`<button type="button" class="fanchant-image-card" onclick="openFanChantLightbox(${i})" aria-label="${x.title} 응원법 크게 보기"><img src="${x.image}" alt="${x.title} 응원법" loading="lazy"><span class="fanchant-image-label">${x.title}</span></button>`).join("");
}
function ensureFanChantLightbox(){
  let lb=document.getElementById("fanChantLightbox");if(lb)return lb;
  lb=document.createElement("div");lb.id="fanChantLightbox";lb.className="fanchant-lightbox";
  lb.innerHTML=`<div class="fanchant-lightbox-stage" role="dialog" aria-modal="true" aria-label="응원법 이미지 크게 보기">
    <button type="button" class="fanchant-lightbox-close" aria-label="닫기" onclick="closeFanChantLightbox()">×</button>
    <button type="button" class="fanchant-lightbox-nav fanchant-lightbox-prev" aria-label="이전 응원법" onclick="moveFanChantLightbox(-1)">‹</button>
    <img class="fanchant-lightbox-img" id="fanChantLightboxImg" alt="">
    <button type="button" class="fanchant-lightbox-nav fanchant-lightbox-next" aria-label="다음 응원법" onclick="moveFanChantLightbox(1)">›</button>
    <div class="fanchant-lightbox-info"><div class="fanchant-lightbox-title" id="fanChantLightboxTitle"></div><div class="fanchant-lightbox-count" id="fanChantLightboxCount"></div></div>
  </div>`;
  lb.addEventListener("click",e=>{if(e.target===lb)closeFanChantLightbox()});
  lb.addEventListener("touchstart",e=>{fanChantTouchX=e.changedTouches[0].clientX},{passive:true});
  lb.addEventListener("touchend",e=>{if(fanChantTouchX==null)return;const dx=e.changedTouches[0].clientX-fanChantTouchX;fanChantTouchX=null;if(Math.abs(dx)>45)moveFanChantLightbox(dx>0?-1:1)},{passive:true});
  document.body.appendChild(lb);return lb;
}
function updateFanChantLightbox(){
  fanChantLightboxIndex=(fanChantLightboxIndex+fanChantImages.length)%fanChantImages.length;
  const x=fanChantImages[fanChantLightboxIndex];
  document.getElementById("fanChantLightboxImg").src=x.image;
  document.getElementById("fanChantLightboxImg").alt=x.title+" 응원법";
  document.getElementById("fanChantLightboxTitle").textContent=x.title;
  document.getElementById("fanChantLightboxCount").textContent=`${fanChantLightboxIndex+1} / ${fanChantImages.length}`;
}
function openFanChantLightbox(i){const lb=ensureFanChantLightbox();fanChantLightboxIndex=i;updateFanChantLightbox();lb.classList.add("open");document.body.classList.add("fanchant-lightbox-open");lb.querySelector(".fanchant-lightbox-close").focus()}
function closeFanChantLightbox(){const lb=document.getElementById("fanChantLightbox");if(lb)lb.classList.remove("open");document.body.classList.remove("fanchant-lightbox-open")}
function moveFanChantLightbox(step){fanChantLightboxIndex+=step;updateFanChantLightbox()}
if(!window.__fanchantKeysBound){window.__fanchantKeysBound=true;document.addEventListener("keydown",e=>{const lb=document.getElementById("fanChantLightbox");if(!lb||!lb.classList.contains("open"))return;if(e.key==="Escape")closeFanChantLightbox();else if(e.key==="ArrowLeft")moveFanChantLightbox(-1);else if(e.key==="ArrowRight")moveFanChantLightbox(1)})}
const GALLERY_DATA_URL="data/photos.json";
let galleryItems=[],galleryLightboxIndex=0,galleryTouchX=null;
function renderGallery(){
  const grid=document.getElementById("galleryGrid");if(!grid)return;
  const items=galleryItems.filter(x=>x.hidden!==true).slice(0,8);
  grid.innerHTML=items.length?items.map((x,i)=>galleryCard(x,i)).join(""):`<div class="gallery-empty"><div class="gallery-empty-inner"><div class="gallery-empty-mark">✦</div><h2>아직 등록된 사진이 없어요.</h2></div></div>`;
  renderGalleryMoment();
}
function ensureGalleryLightbox(){
  let lb=document.getElementById("galleryLightbox");
  if(lb)return lb;
  lb=document.createElement("div");lb.id="galleryLightbox";lb.className="gallery-lightbox";
  lb.innerHTML=`<div class="gallery-lightbox-stage" role="dialog" aria-modal="true" aria-label="갤러리 사진 크게 보기">
    <button type="button" class="gallery-lightbox-close" aria-label="닫기" onclick="closeGalleryLightbox()">×</button>
    <button type="button" class="gallery-lightbox-nav gallery-lightbox-prev" aria-label="이전 사진" onclick="moveGalleryLightbox(-1)">‹</button>
    <img class="gallery-lightbox-img" id="galleryLightboxImg" alt="">
    <button type="button" class="gallery-lightbox-nav gallery-lightbox-next" aria-label="다음 사진" onclick="moveGalleryLightbox(1)">›</button>
    <div class="gallery-lightbox-info"><div class="gallery-lightbox-title" id="galleryLightboxTitle"></div><div class="gallery-lightbox-count" id="galleryLightboxCount"></div></div>
  </div>`;
  lb.addEventListener("click",e=>{if(e.target===lb)closeGalleryLightbox()});
  lb.addEventListener("touchstart",e=>{galleryTouchX=e.changedTouches[0]?.clientX??null},{passive:true});
  lb.addEventListener("touchend",e=>{if(galleryTouchX==null)return;const dx=(e.changedTouches[0]?.clientX??galleryTouchX)-galleryTouchX;galleryTouchX=null;if(Math.abs(dx)>55)moveGalleryLightbox(dx<0?1:-1)},{passive:true});
  document.body.appendChild(lb);return lb;
}
function updateGalleryLightbox(){
  const items=galleryItems.filter(x=>x.hidden!==true).slice(0,8);if(!items.length)return;
  galleryLightboxIndex=(galleryLightboxIndex+items.length)%items.length;
  const x=items[galleryLightboxIndex];
  document.getElementById("galleryLightboxImg").src=x.image||"";
  document.getElementById("galleryLightboxImg").alt=x.title||"SEEYA PHOTO";
  document.getElementById("galleryLightboxTitle").textContent=x.title||x.member||"SEEYA PHOTO";
  document.getElementById("galleryLightboxCount").textContent=`${galleryLightboxIndex+1} / ${items.length}`;
  const lb=document.getElementById("galleryLightbox");
  lb.querySelectorAll(".gallery-lightbox-nav").forEach(b=>b.style.display=items.length>1?"flex":"none");
}
function openGalleryLightbox(index){
  const lb=ensureGalleryLightbox();galleryLightboxIndex=index;updateGalleryLightbox();lb.classList.add("open");document.body.classList.add("gallery-lightbox-open");lb.querySelector(".gallery-lightbox-close").focus();
}
function closeGalleryLightbox(){const lb=document.getElementById("galleryLightbox");if(lb)lb.classList.remove("open");document.body.classList.remove("gallery-lightbox-open")}
function moveGalleryLightbox(step){galleryLightboxIndex+=step;updateGalleryLightbox()}
if(!window.__galleryKeysBound){
  window.__galleryKeysBound=true;
  document.addEventListener("keydown",e=>{const lb=document.getElementById("galleryLightbox");if(!lb||!lb.classList.contains("open"))return;if(e.key==="Escape")closeGalleryLightbox();else if(e.key==="ArrowLeft")moveGalleryLightbox(-1);else if(e.key==="ArrowRight")moveGalleryLightbox(1)});
}
async function loadGallery(){
  const status=document.getElementById("galleryStatus");
  if(status)status.textContent="사진을 불러오는 중…";
  try{
    const r=await fetch(GALLERY_DATA_URL+`?v=${Date.now()}`,{cache:"no-store"});
    if(!r.ok)throw new Error("photos json "+r.status);
    const data=await r.json();
    galleryItems=(Array.isArray(data)?data:(data.photos||[])).filter(x=>x&&x.hidden!==true);
    galleryItems.sort((a,b)=>String(b.date||"").localeCompare(String(a.date||"")) || Number(a.order||999)-Number(b.order||999));
    if(status)status.textContent=`${Math.min(galleryItems.length,8)} PHOTOS · MANUAL ARCHIVE`;
  }catch(e){
    galleryItems=normalizePhotos(PHOTOS_FALLBACK);
    if(status)status.textContent="사진 데이터를 불러오지 못했습니다";

  }
  renderGallery();
}
let archiveData=[];
const ARCHIVE_PAGE_SIZE=9;
let archiveState={query:"",year:"all",member:"all",type:"all",sort:"newest",page:1};
async function loadArchive(){try{const r=await fetch("data/archive.json",{cache:"no-store"});if(!r.ok)throw new Error("archive fetch failed");archiveData=mergeArchive(await r.json());}catch(e){archiveData=ARCHIVE_FALLBACK;}renderArchive();}
function setArchiveQuery(v){archiveState.query=v.trim();archiveState.page=1;renderArchive();}
function setArchiveFilter(k,v){archiveState[k]=v;archiveState.page=1;syncArchiveControls();renderArchive();}
function setArchiveSort(v){archiveState.sort=v;archiveState.page=1;renderArchive();}
function resetArchiveFilters(){archiveState={query:"",year:"all",member:"all",type:"all",sort:"newest",page:1};const q=document.getElementById("archiveSearch");if(q)q.value="";const s=document.getElementById("archiveSort");if(s)s.value="newest";syncArchiveControls();renderArchive();}
function setArchivePage(page){
  const total=Math.max(1,Math.ceil(getFilteredArchive().length/ARCHIVE_PAGE_SIZE));
  const next=Math.max(1,Math.min(Number(page)||1,total));
  if(next===archiveState.page)return;
  archiveState.page=next;
  renderArchive();
  requestAnimationFrame(()=>document.querySelector(".archive-results-head")?.scrollIntoView({behavior:"smooth",block:"start"}));
}
function syncArchiveControls(){const map={year:"archiveYears",member:"archiveMembers",type:"archiveTypes"};Object.entries(map).forEach(([k,id])=>{const box=document.getElementById(id);if(!box)return;box.querySelectorAll(".archive-chip").forEach(b=>b.classList.toggle("active",b.dataset.value===archiveState[k]));});}
let currentNewsCategory="씨야";
function bindNewsFilter(){
  const f=document.getElementById("newsFilter");
  if(!f)return;
  f.querySelectorAll("button").forEach(btn=>btn.addEventListener("click",()=>{
    if(btn.dataset.news===currentNewsCategory)return;
    f.querySelectorAll("button").forEach(b=>b.classList.remove("active"));
    btn.classList.add("active");
    currentNewsCategory=btn.dataset.news;
    loadNews(currentNewsCategory,false);
  }));
}
async function getNewsData(){
  try{
    const r=await fetch(`data/news.json?v=${Date.now()}`,{cache:"no-store"});
    if(!r.ok)throw new Error("local news json");
    return await r.json();
  }catch(e){
    return NEWS_FALLBACK;
  }
}
async function loadNews(category="씨야",bind=true){
  const box=document.getElementById("newsBox");
  const label=document.getElementById("newsLabel");
  const updated=document.getElementById("newsUpdated");
  if(!box)return;
  currentNewsCategory=category;
  if(bind)bindNewsFilter();
  if(label)label.textContent=`${category==="씨야"?"SEEYA":category} · LATEST NEWS`;

  const data=await getNewsData();
  const items=require('../shared/news-filter').filterNews(data[category],category).sort((a,b)=>new Date(b.pubDate)-new Date(a.pubDate));
  renderNews(items);
  if(updated && data.updatedAt){
    const d=new Date(data.categoryUpdatedAt?.[category]||data.updatedAt);
    updated.textContent=`UPDATED · ${d.toLocaleString("ko-KR",{month:"2-digit",day:"2-digit",hour:"2-digit",minute:"2-digit"})}`;
  }
}
function showCard(n){
  let t=tarot[n];
  modalbox.innerHTML=`<button class="close" onclick="closeCard()">×</button>
  <div class="modal-card-layout">
    <div class="modal-card-image-wrap">
      <img class="modal-tarot-image" src="assets/tarot/21-world-preview.png" alt="${t.name} tarot preview">
      <div class="modal-card-note">현재는 THE WORLD 이미지를 공통 미리보기로 사용 중입니다.</div>
    </div>
    <div class="modal-card-content">
      <div class="eye">${String(t.n).padStart(2,"0")} · SEEYA TAROT</div>
      <h2>${t.name}</h2>
      <div style="font-size:13px;color:var(--deep);font-weight:700">${t.keywords}</div>
      <h3 style="color:var(--deep);margin-top:28px">♪ 대표곡 · ${t.song}</h3>
      <div class="chips">${t.related.map(x=>`<span>관련곡 · ${x}</span>`).join("")}</div>
      <hr style="border:0;border-top:1px solid var(--line);margin:24px 0">
      <div class="eye">CARD READING</div><p style="line-height:1.95">${t.detail}</p>
      <div class="eye" style="margin-top:24px">SHADOW</div><p style="line-height:1.8;color:var(--muted)">${t.shadow}</p>
      <div class="eye" style="margin-top:24px">SEEYA STORY</div><p style="line-height:1.95">${t.story}</p>
      <div class="eye" style="margin-top:24px">VISUAL MOTIF</div><p>${t.motif}</p>
      <div class="eye" style="margin-top:24px">TODAY'S MESSAGE</div><p style="font-family:'Gowun Batang';font-size:18px;line-height:1.95">${t.message}</p>
      <div class="eye" style="margin-top:24px">LYRIC MOMENT</div><p class="notice">${t.lyric}</p>
    </div>
  </div>`;
  modal.classList.add("on")
}
function closeCard(){modal.classList.remove("on")}
let tarotUnlocked=false;
let easterKeys="";
const TAROT_EASTER_TRIGGER="seeyatarot";
function showEasterToast(){
  const old=document.querySelector(".preview-toast");
  if(old)old.remove();
  const t=document.createElement("div");
  t.className="preview-toast";
  t.textContent="EASTER EGG · SEEYA TAROT";
  document.body.appendChild(t);
  setTimeout(()=>t.remove(),2600);
}
addEventListener("keydown",e=>{
  if(e.ctrlKey||e.altKey||e.metaKey||e.key.length!==1)return;
  easterKeys=(easterKeys+e.key.toLowerCase()).slice(-TAROT_EASTER_TRIGGER.length);
  if(easterKeys===TAROT_EASTER_TRIGGER){
    tarotUnlocked=true;
    showEasterToast();
    document.getElementById("app").innerHTML=tarotPage();
    scrollTo(0,0);
  }
});
function employeeCard(){return W(`
<section class="employee-page">
  <div class="employee-hero">
    <div class="eye">SEEYA · FAN PLAY</div>
    <h1>명예 영업사원증 발급소</h1>
    <div class="employee-kicker">씨야의 좋은 음악을 널리 알리는 당신에게.</div>
    <p>이름 또는 닉네임과 사진 한 장으로 <b>씨야엔터테인먼트 명예 영업사원증</b>을 만들어보세요.<br>사진은 브라우저 안에서만 처리되며 서버로 전송하거나 저장하지 않습니다.</p>
  </div>

  <div class="employee-layout">
    <section class="employee-panel">
      <div class="employee-field">
        <div class="employee-label"><b>01 · 이름 또는 닉네임</b><small>필수</small></div>
        <input class="employee-input" id="employeeName" type="text" maxlength="14" placeholder="사원증에 표시할 이름" autocomplete="off">
      </div>

      <div class="employee-field">
        <div class="employee-label"><b>02 · 사진</b><small>JPG · PNG · WEBP</small></div>
        <label class="employee-file" for="employeePhoto">사진 선택하기
          <input id="employeePhoto" type="file" accept="image/*">
        </label>
        <div class="employee-photo-name" id="employeePhotoName">아직 선택한 사진이 없습니다.</div>
      </div>

      <div class="employee-field">
        <div class="employee-label"><b>03 · 사진 맞추기</b><small>미리보기를 직접 드래그할 수 있어요</small></div>
        <input class="employee-range" id="employeeZoom" type="range" min="1" max="2.3" value="1" step="0.01">
        <div class="employee-help">슬라이더로 확대하고, 오른쪽 사원증의 사진 영역을 마우스나 손가락으로 드래그해 위치를 조절하세요.</div>
        <div class="employee-control-row" style="margin-top:10px">
          <button class="employee-mini-btn" type="button" id="employeePhotoReset">사진 위치 초기화</button>
          <button class="employee-mini-btn" type="button" id="employeeIdReset">사번 새로 만들기</button>
        </div>
      </div>

      <div class="employee-field">
        <div class="employee-label"><b>04 · 자동 입력</b><small>직접 입력할 필요 없어요</small></div>
        <div class="employee-auto">
          <div class="employee-auto-box"><small>EMPLOYEE NO.</small><b id="employeeIdText"></b></div>
          <div class="employee-auto-box"><small>ISSUE DATE</small><b id="employeeDateText"></b></div>
        </div>
      </div>

      <div class="employee-field">
        <button class="employee-issue" type="button" id="employeeIssue">명예 영업사원증 발급하기</button>
        <button class="employee-download" type="button" id="employeeDownload" disabled>PNG로 저장하기</button>
        <div class="employee-status" id="employeeStatus"></div>
      </div>

      <div class="employee-privacy">
        <b>UNOFFICIAL · FAN MADE ID CARD</b><br>
        이 사원증은 SEEYA ARCHIVE에서 제공하는 팬메이드 콘텐츠이며 실제 씨야엔터테인먼트의 공식 사원증이 아닙니다.<br>
        선택한 사진은 현재 브라우저 안에서만 합성되며 별도의 서버에 업로드하거나 보관하지 않습니다.
      </div>
    </section>

    <section class="employee-preview-panel">
      <div class="employee-preview-title"><b>실시간 미리보기</b><span>SEEYA ENTERTAINMENT · FAN MADE</span></div>
      <div class="employee-canvas-shell">
        <canvas id="employeeCardCanvas" width="1086" height="1448" aria-label="씨야엔터테인먼트 명예 영업사원증 미리보기"></canvas>
      </div>
      <p class="employee-preview-note">최종 저장 이미지는 1086 × 1448 PNG로 생성됩니다. 이름·사번·발급일만 템플릿의 해당 위치에 맞춰 합성됩니다.</p>
    </section>
  </div>
</section>
`)}
const EMPLOYEE_TEMPLATE_URL="images/employee-card/seeya-honorary-sales-staff-template.png";
let employeeTemplateImage=null;
let employeePhotoImage=null;
let employeePhotoObjectUrl="";
let employeePhotoZoom=1;
let employeePhotoOffset={x:0,y:0};
let employeeIssued=false;
let employeeDrag=null;
let employeeIdValue="";
let employeeIssueDateValue="";
function employeeFormatDate(d=new Date()){
  return `${d.getFullYear()}.${String(d.getMonth()+1).padStart(2,"0")}.${String(d.getDate()).padStart(2,"0")}`;
}
function employeeMakeId(){
  const d=new Date();
  const code=String(Math.floor(1000+Math.random()*9000));
  return `SY-${String(d.getFullYear()).slice(-2)}${String(d.getMonth()+1).padStart(2,"0")}${String(d.getDate()).padStart(2,"0")}-${code}`;
}
function employeeRoundRect(ctx,x,y,w,h,r){
  const rr=Math.min(r,w/2,h/2);
  ctx.beginPath();
  ctx.moveTo(x+rr,y);
  ctx.arcTo(x+w,y,x+w,y+h,rr);
  ctx.arcTo(x+w,y+h,x,y+h,rr);
  ctx.arcTo(x,y+h,x,y,rr);
  ctx.arcTo(x,y,x+w,y,rr);
  ctx.closePath();
}
function employeeFitText(ctx,text,maxWidth,startSize,minSize=26){
  let size=startSize;
  while(size>minSize){
    ctx.font=`700 ${size}px "Gowun Batang", serif`;
    if(ctx.measureText(text).width<=maxWidth)break;
    size-=2;
  }
  return size;
}
function employeeMarkDirty(){
  employeeIssued=false;
  const dl=document.getElementById("employeeDownload");
  if(dl)dl.disabled=true;
  const s=document.getElementById("employeeStatus");
  if(s)s.textContent="";
}
function employeeCoverSampleValue(ctx,x,y,w,h,c1,c2){
  const g=ctx.createLinearGradient(x,y,x+w,y+h);
  g.addColorStop(0,c1);
  g.addColorStop(.55,c2);
  g.addColorStop(1,c1);
  ctx.fillStyle=g;
  ctx.fillRect(x,y,w,h);
}
function renderEmployeeCard(){
  const canvas=document.getElementById("employeeCardCanvas");
  if(!canvas)return;
  const ctx=canvas.getContext("2d");
  ctx.clearRect(0,0,canvas.width,canvas.height);

  if(!employeeTemplateImage||!employeeTemplateImage.complete){
    ctx.fillStyle="#fff5f8";ctx.fillRect(0,0,canvas.width,canvas.height);
    ctx.fillStyle="#a06a7d";ctx.font='28px "Gowun Batang",serif';ctx.textAlign="center";
    ctx.fillText("사원증 템플릿을 불러오는 중…",canvas.width/2,canvas.height/2);
    return;
  }
  ctx.drawImage(employeeTemplateImage,0,0,canvas.width,canvas.height);

  // Photo area: cover the baked-in sample silhouette while preserving the outer frame.
  const box={x:376,y:498,w:338,h:382,r:20};
  ctx.save();
  employeeRoundRect(ctx,box.x,box.y,box.w,box.h,box.r);
  ctx.clip();
  if(employeePhotoImage){
    const base=Math.max(box.w/employeePhotoImage.naturalWidth,box.h/employeePhotoImage.naturalHeight);
    const scale=base*employeePhotoZoom;
    const dw=employeePhotoImage.naturalWidth*scale;
    const dh=employeePhotoImage.naturalHeight*scale;
    const dx=box.x+(box.w-dw)/2+employeePhotoOffset.x;
    const dy=box.y+(box.h-dh)/2+employeePhotoOffset.y;
    ctx.drawImage(employeePhotoImage,dx,dy,dw,dh);
  }
  ctx.restore();

  // The template already contains the fixed FAN TITLE.
  // Cover only the editable sample values, but use slightly larger masks than before
  // so the baked-in demo text never peeks through on different browsers.
  employeeCoverSampleValue(ctx,480,891,260,60,"#faeeeb","#f8eae8");
  employeeCoverSampleValue(ctx,480,1031,300,60,"#f9ece9","#f7e8e6");
  employeeCoverSampleValue(ctx,480,1101,260,60,"#f9ece9","#f7e8e6");

  const name=(document.getElementById("employeeName")?.value||"").trim();
  ctx.textAlign="left";
  ctx.textBaseline="alphabetic";

  const valueX=492;
  const nameSize=employeeFitText(ctx,name||"이름을 입력하세요",232,30,19);
  ctx.font=`700 ${nameSize}px "Gowun Batang","Noto Serif KR",serif`;
  ctx.fillStyle=name?"#5b4549":"#b4979f";
  ctx.fillText(name||"이름을 입력하세요",valueX,929,236);

  ctx.fillStyle="#5b474b";
  ctx.font='700 25px "Gowun Batang","Noto Serif KR",serif';
  ctx.fillText(employeeIdValue||"SY-000000-0000",valueX,1068,288);
  ctx.fillText(employeeIssueDateValue||employeeFormatDate(),valueX,1138,248);

}
function employeeResetPhotoPosition(){
  employeePhotoZoom=1;
  employeePhotoOffset={x:0,y:0};
  const zoom=document.getElementById("employeeZoom");
  if(zoom)zoom.value="1";
  employeeMarkDirty();
  renderEmployeeCard();
}
function employeeSetStatus(text,error=false){
  const s=document.getElementById("employeeStatus");
  if(!s)return;
  s.textContent=text;
  s.classList.toggle("employee-error",!!error);
}
function issueEmployeeCard(){
  const name=(document.getElementById("employeeName")?.value||"").trim();
  if(!name){employeeSetStatus("이름 또는 닉네임을 입력해주세요.",true);document.getElementById("employeeName")?.focus();return false;}
  if(!employeePhotoImage){employeeSetStatus("사원증에 사용할 사진을 선택해주세요.",true);return false;}
  employeeIssued=true;
  renderEmployeeCard();
  const dl=document.getElementById("employeeDownload");
  if(dl)dl.disabled=false;
  employeeSetStatus("SEEYA ENTERTAINMENT · 명예 영업사원 등록 완료 ♡");
  return true;
}
function downloadEmployeeCard(){
  if(!employeeIssued&&!issueEmployeeCard())return;
  renderEmployeeCard();
  const canvas=document.getElementById("employeeCardCanvas");
  const name=(document.getElementById("employeeName")?.value||"SEEYA_FAN").trim().replace(/[\\/:*?"<>|]/g,"_");
  canvas.toBlob(blob=>{
    if(!blob){employeeSetStatus("이미지를 저장하지 못했습니다. 다시 시도해주세요.",true);return;}
    const url=URL.createObjectURL(blob);
    const a=document.createElement("a");
    a.href=url;
    a.download=`SEEYA_명예영업사원_${name}.png`;
    document.body.appendChild(a);a.click();a.remove();
    setTimeout(()=>URL.revokeObjectURL(url),1500);
  },"image/png");
}
function initEmployeeCard(){
  const canvas=document.getElementById("employeeCardCanvas");
  if(!canvas)return;

  if(!employeeIdValue)employeeIdValue=employeeMakeId();
  if(!employeeIssueDateValue)employeeIssueDateValue=employeeFormatDate();

  document.getElementById("employeeIdText").textContent=employeeIdValue;
  document.getElementById("employeeDateText").textContent=employeeIssueDateValue;

  const nameInput=document.getElementById("employeeName");
  const photoInput=document.getElementById("employeePhoto");
  const zoomInput=document.getElementById("employeeZoom");

  nameInput.addEventListener("input",()=>{employeeMarkDirty();renderEmployeeCard()});
  zoomInput.value=String(employeePhotoZoom);
  zoomInput.addEventListener("input",()=>{
    employeePhotoZoom=Number(zoomInput.value)||1;
    employeeMarkDirty();renderEmployeeCard();
  });

  photoInput.addEventListener("change",()=>{
    const file=photoInput.files?.[0];
    if(!file)return;
    if(!file.type.startsWith("image/")){
      employeeSetStatus("이미지 파일을 선택해주세요.",true);photoInput.value="";return;
    }
    if(file.size>15*1024*1024){
      employeeSetStatus("사진은 15MB 이하를 권장합니다.",true);photoInput.value="";return;
    }
    if(employeePhotoObjectUrl)URL.revokeObjectURL(employeePhotoObjectUrl);
    employeePhotoObjectUrl=URL.createObjectURL(file);
    const img=new Image();
    img.onload=()=>{
      employeePhotoImage=img;
      employeePhotoZoom=1;employeePhotoOffset={x:0,y:0};
      zoomInput.value="1";
      document.getElementById("employeePhotoName").textContent=file.name;
      employeeMarkDirty();renderEmployeeCard();
    };
    img.onerror=()=>employeeSetStatus("사진을 읽지 못했습니다. 다른 파일을 선택해주세요.",true);
    img.src=employeePhotoObjectUrl;
  });

  document.getElementById("employeePhotoReset").addEventListener("click",employeeResetPhotoPosition);
  document.getElementById("employeeIdReset").addEventListener("click",()=>{
    employeeIdValue=employeeMakeId();
    document.getElementById("employeeIdText").textContent=employeeIdValue;
    employeeMarkDirty();renderEmployeeCard();
  });
  document.getElementById("employeeIssue").addEventListener("click",issueEmployeeCard);
  document.getElementById("employeeDownload").addEventListener("click",downloadEmployeeCard);

  canvas.addEventListener("pointerdown",e=>{
    if(!employeePhotoImage)return;
    canvas.setPointerCapture(e.pointerId);
    const rect=canvas.getBoundingClientRect();
    const scale=canvas.width/rect.width;
    employeeDrag={x:e.clientX,y:e.clientY,ox:employeePhotoOffset.x,oy:employeePhotoOffset.y,scale};
    canvas.classList.add("dragging");
  });
  canvas.addEventListener("pointermove",e=>{
    if(!employeeDrag)return;
    employeePhotoOffset.x=employeeDrag.ox+(e.clientX-employeeDrag.x)*employeeDrag.scale;
    employeePhotoOffset.y=employeeDrag.oy+(e.clientY-employeeDrag.y)*employeeDrag.scale;
    employeeMarkDirty();renderEmployeeCard();
  });
  const endDrag=e=>{
    if(!employeeDrag)return;
    employeeDrag=null;canvas.classList.remove("dragging");
    try{canvas.releasePointerCapture(e.pointerId)}catch(_){}
  };
  canvas.addEventListener("pointerup",endDrag);
  canvas.addEventListener("pointercancel",endDrag);

  if(!employeeTemplateImage){
    employeeTemplateImage=new Image();
    employeeTemplateImage.onload=()=>document.fonts?.ready?document.fonts.ready.then(renderEmployeeCard):renderEmployeeCard();
    employeeTemplateImage.onerror=()=>employeeSetStatus("사원증 템플릿을 불러오지 못했습니다.",true);
    employeeTemplateImage.src=EMPLOYEE_TEMPLATE_URL;
  }else{
    document.fonts?.ready?document.fonts.ready.then(renderEmployeeCard):renderEmployeeCard();
  }
}
function normalizePhotos(data){return (Array.isArray(data)?data:(data.photos||[])).filter(x=>x&&x.hidden!==true).sort((a,b)=>String(b.date||'').localeCompare(String(a.date||''))||Number(a.order||999)-Number(b.order||999));}
function renderNews(items){const box=document.getElementById('newsBox');if(box)box.innerHTML=newsList(items);}
function renderGalleryMoment(){const box=document.getElementById('galleryMoment');if(box)box.innerHTML=galleryMoment(galleryItems);}
function getFilteredArchive(){return filterArchive(archiveData,archiveState);}
function renderArchive(){const view=archiveView(archiveData,archiveState);for(const [key,id] of Object.entries({grid:'archiveGrid',count:'archiveCount',active:'archiveActive',pagination:'archivePagination'})){const el=document.getElementById(id);if(el){if(key==='count')el.textContent=view[key];else el.innerHTML=view[key];}}}
// Old bookmarked hash routes become normal page navigations; ordinary anchors are untouched.
if(/^#\/(?:$|guide|news|music|history|members|gallery|archive|today|game\/lyrics)/.test(location.hash)){location.replace(location.hash.slice(1));}
const page=document.body.dataset.page;
if(page==='news')loadNews();
if(page==='gallery'){galleryItems=normalizePhotos(PHOTOS_FALLBACK);loadGallery();}
if(page==='archive'){archiveData=ARCHIVE_FALLBACK;loadArchive();}
if(page==='quiz')window.initLyricQuiz();
if(page==='today'){const block=document.querySelector('.today-fortune');if(block){const holder=document.createElement('div');holder.innerHTML=today();block.replaceWith(holder.querySelector('.today-fortune'));}}

Object.assign(window,{renderFanChantGrid,ensureFanChantLightbox,updateFanChantLightbox,openFanChantLightbox,closeFanChantLightbox,moveFanChantLightbox,renderGallery,ensureGalleryLightbox,updateGalleryLightbox,openGalleryLightbox,closeGalleryLightbox,moveGalleryLightbox,loadGallery,loadArchive,setArchiveQuery,setArchiveFilter,setArchiveSort,resetArchiveFilters,setArchivePage,syncArchiveControls,bindNewsFilter,getNewsData,loadNews,showCard,closeCard,showEasterToast,employeeCard,employeeFormatDate,employeeMakeId,employeeRoundRect,employeeFitText,employeeMarkDirty,employeeCoverSampleValue,renderEmployeeCard,employeeResetPhotoPosition,employeeSetStatus,issueEmployeeCard,downloadEmployeeCard,initEmployeeCard,normalizePhotos,renderNews,renderGalleryMoment,getFilteredArchive,renderArchive});
