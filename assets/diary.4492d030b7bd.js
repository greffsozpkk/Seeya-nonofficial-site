(function(){'use strict';const modules={
"src/client/passport.js":function(module,exports,__require){
'use strict';
const Brand=__require("src/data/passport-brand.json");
const P=__require("src/shared/passport.js"),G=__require("src/shared/passport-goods.js");
const attachPicker=__require("src/client/passport-picker.js"),Play=__require("src/shared/passport-play.js"),PlayUI=__require("src/client/play-passport.js"),Cal=__require("src/shared/passport-calendar.js");
const X=__require("src/shared/passport-extra.js"),Share=__require("src/client/passport-share.js"),Maker=__require("src/client/passport-maker.js");
const Drive=__require("src/client/diary-drive.js"),ConcertDiary=__require("src/client/concert-diary.js");
const app=document.getElementById('passportApp'),status=document.getElementById('ppStatus');
const catalog=JSON.parse(document.getElementById('passportCatalog').textContent),E=P.esc;
let makerCleanup=null,driveCleanup=null,importRequest=0;
let store,state,dirty=false,pendingImport=null,filterKind='',filterYear='',filterMember='',filterStatus='',selectedMonth=P.today().slice(0,7),listMode=false,page=1,exportURL='',renderedHash=location.hash;
const say=s=>{status.textContent=s;};
function backupReminder(){
 try{const key='seeya-diary-backup-snapshot',current=JSON.stringify({profile:state.profile,entries:state.entries.map(e=>[e.entryId,e.updatedAt])}),prior=JSON.parse(localStorage.getItem(key)||'null'),snooze=localStorage.getItem('seeya-diary-backup-snooze');if(snooze===current)return '';const old=new Map(prior?.entries||[]);const changed=state.entries.filter(e=>old.get(e.entryId)!==e.updatedAt).length+(prior?.entries||[]).filter(([id])=>!state.entries.some(e=>e.entryId===id)).length+(prior&&JSON.stringify(prior.profile)!==JSON.stringify(state.profile)?1:0);if(changed<5)return '';return '<aside class="pp-backup-reminder"><strong>새 기록과 변경 사항이 쌓였어요. 백업해 둘까요?</strong><p>이 브라우저에만 저장됩니다. 마지막 백업 요청 이후 변경 '+changed+'건 · 파일이 실제 저장됐는지도 확인해 주세요.</p><div class="pp-actions"><button data-action="backup">백업 파일 저장</button><button data-action="backup-later">다음에</button></div></aside>';}catch{return '';}
}
function backupSnapshot(){return JSON.stringify({profile:state.profile,entries:state.entries.map(e=>[e.entryId,e.updatedAt])});}

const options=(items,selected)=>items.map(([v,t])=>`<option value="${E(v)}"${v===selected?' selected':''}>${E(t)}</option>`).join('');
const field=(label,name,value='',extra='')=>`<label class="pp-field"><span>${label}</span><input name="${name}" value="${E(value)}" ${extra}></label>`;
const memberNames=e=>e.members.map(m=>P.MEMBERS[m]).join(' · ')||'멤버 미지정';
const eventKind=e=>e?.type==='performance'?'concert':'story';
const kindState=e=>e.kind==='play'?(e.status==='planned'?'플레이 예정':'플레이 완료'):e.kind==='goods'?(e.status==='planned'?'구매 예정':'구매했어요'):e.status==='planned'?'갈 예정':e.kind==='story'?'남긴 이야기':'다녀왔어요';
function save(next){try{state=store.save(next);dirty=false;return true;}catch(error){say(error.name==='QuotaExceededError'?'저장 공간이 부족합니다. 입력 내용을 복사해 두고 수첩을 백업해 주세요.':error.message||'저장하지 못했습니다. 입력 내용을 복사해 주세요.');return false;}}
function go(hash=''){dirty=false;if(location.hash===hash)render();else location.hash=hash;}
function linkBack(){return '<a class="pp-back" href="/diary/">← 내 다이어리</a>';}
function profileCard(){const p=state.profile,n=P.summary(state.entries),years=p.since?Math.max(1,Number(P.today().slice(0,4))-Number(p.since.slice(0,4))+1):0;return `<div class="pp-sidebar"><section class="pp-panel pp-profile" style="--pp-color:${P.COLORS[p.color]}"><div class="pp-card-top"><span>SINCE ${E(p.since||'YOUR FIRST DAY')}</span><img class="pp-identity-logo" src="${Brand.logo}" alt="SEEYA" width="84" height="21"></div><div class="pp-identity"><div><p>처음 씨야를 좋아한 날</p><strong>${years?years+'년차 씨야 덕후':'우리의 첫 페이지'}</strong></div></div><p class="pp-nickname">${E(p.nickname||'나의 다이어리')}</p><div class="pp-stats"><div><b>${n.concert}</b><span>공연 관람</span></div><div><b>${n.visit}</b><span>장소 방문</span></div><div><b>${X.songs(state.entries).length}</b><span>공연에서 들은 곡 / ${catalog.songs.length}</span></div></div><p class="pp-help">굿즈 구매 ${n.goods}건 · <a href="/diary/#goods">보관함 보기</a></p><p class="pp-help">씨야 플레이 ${n.play}회 · <a href="/game/">플레이하기</a></p>${p.favSong?`<p class="pp-help">MY SONG · ${E(p.favSong)}</p>`:''}${p.motto?`<p class="pp-motto">${E(p.motto)}</p>`:''}<div class="pp-actions"><button data-action="copy-summary">집계 복사</button><a href="/diary/#share">QR로 공유</a></div><a class="pp-profile-edit" href="/diary/#profile">신분 카드 편집 →</a></section><section class="pp-panel pp-member-counts"><p class="pp-label">멤버별 완료 기록 수</p><p class="pp-help">체크한 멤버만 집계해요. 완전체 기록은 개인 멤버 수에 자동 포함되지 않습니다.</p>${Object.entries(P.MEMBERS).map(([id,name])=>`<div><span class="pp-member-dot" data-member="${id}"></span><span>${name}</span><b>${state.entries.filter(e=>P.completed(e)&&e.members.includes(id)).length}</b></div>`).join('')}</section><div class="pp-storage-note"><b>이 브라우저에 저장돼요</b><p>기기를 바꾸기 전에 백업해 주세요.<br>기록은 다른 사람과 비교하지 않아요.</p><a href="/diary/#settings">백업·복원</a> · <a href="/about/install/">홈 화면에 추가</a></div></div>`;}
function tour(){const total=catalog.tour.filter(t=>X.tourEntries(t,state.entries).length).length;return `<section class="pp-tour-section"><div class="pp-section-head"><div><p class="pp-label">THE FAN · 20TH ANNIVERSARY TOUR</p><h2>투어 도장판 <small>${total} / ${catalog.tour.length}</small></h2></div><a href="/calendar/">일정 보기</a></div><div class="pp-panel pp-tour">${catalog.tour.map(t=>{const records=X.tourEntries(t,state.entries),planned=state.entries.some(x=>x.kind==='concert'&&x.eventId===t.eventId&&x.date===t.date&&x.status==='planned'),diff=Math.round((Date.parse(t.date)-Date.parse(P.today()))/86400000);return `<button class="pp-stamp${records.length?' is-done':''}" data-event="${E(t.eventId)}" aria-label="${E(t.label+' '+P.dateLabel(t.date))} 공연 기록하기"><strong><small>${t.date.slice(5).replace('-','.')}</small>${E(t.label)}</strong><span>${records.length?'관람 '+records.length+'회':planned?'갈 예정':diff>0?'D-'+diff:diff===0?'오늘':'추억 남기기'}</span></button>`;}).join('')}</div></section>`;}
function home(){let rows=state.entries.filter(e=>(!filterStatus||e.status===filterStatus)&&(!filterKind||e.kind===filterKind)&&(!filterYear||e.date.slice(0,4)===filterYear)&&(!filterMember||e.members.includes(filterMember))).sort((a,b)=>(b.date||'').localeCompare(a.date||'')||b.createdAt.localeCompare(a.createdAt));const pages=Math.max(1,Math.ceil(rows.length/9));page=Math.min(page,pages);const years=[...new Set(state.entries.map(e=>e.date.slice(0,4)).filter(Boolean))].sort().reverse();app.innerHTML=`${backupReminder()}<div class="pp-layout">${profileCard()}<div>${filterKind==='goods'?goodsIntro():tour()}<div class="pp-toolbar"><h2>내 기록 <small>${rows.length}</small></h2><button data-action="view" aria-pressed="${listMode}">${listMode?'스탬프 보기':'시간순 보기'}</button><div class="pp-filters"><select id="ppStatusFilter" aria-label="기록 상태 필터">${options([['','모든 상태'],['planned','예정'],['done','완료']],filterStatus)}</select><select id="ppYearFilter" aria-label="기록 연도 필터">${options([['','모든 연도'],...years.map(y=>[y,y+'년'])],filterYear)}</select><select id="ppKindFilter" aria-label="기록 종류 필터">${options([['','모든 종류'],...Object.entries(P.KINDS)],filterKind)}</select><select id="ppMemberFilter" aria-label="기록 멤버 필터">${options([['','모든 멤버'],...Object.entries(P.MEMBERS)],filterMember)}</select></div></div>${rows.length?`<div class="pp-records${listMode?' is-list':''}">${rows.slice((page-1)*9,page*9).map(e=>`<a href="/diary/#entry=${encodeURIComponent(e.entryId)}" class="pp-record" data-kind="${e.kind}"><span class="pp-label">${{concert:'CONCERT · TICKET',visit:'VISIT',event:'FAN EVENT',story:'MY STORY',goods:'GOODS · COLLECTION',play:'SEEYA PLAY'}[e.kind]}</span><h3>${E(e.title)}</h3><p>${P.dateLabel(e.date)}${e.time?' · '+e.time:''}</p><p>${E(e.kind==='play'?Play.summary(e.play):e.kind==='goods'?(e.goods?.quantity||1)+'개'+(e.goods?.variant?' · '+e.goods.variant:''):e.snapshot.place||memberNames(e))}</p><div class="pp-record-foot"><span>${e.kind==='concert'?(e.songs||[]).length+'곡 · ':''}${kindState(e)}</span><span class="pp-member-dot" data-member="${e.members[0]||'seeya'}"></span></div></a>`).join('')}</div><div class="pp-pagination"><button data-page="${page-1}" ${page===1?'disabled':''}>이전</button><span>${page} / ${pages}</span><button data-page="${page+1}" ${page===pages?'disabled':''}>다음</button></div>`:`${filterKind==='goods'?'<div class="pp-empty"><strong>소장한 굿즈를 한 점씩 남겨보세요.</strong><p>목록에서 고르거나 굿즈명을 직접 입력할 수 있어요.</p></div>':`<div class="pp-empty"><div class="pp-empty-stamps" aria-hidden="true">TICKET　 VISIT　 MY STORY</div><strong>${state.entries.length?'선택한 조건의 기록이 없어요.':'어떤 기억부터 남겨볼까요?'}</strong><p>한 줄의 감상부터 차근차근 남겨보세요.</p><div class="pp-start-actions"><a href="/diary/#new?kind=concert">다녀온 공연 남기기</a><a href="/diary/#new?kind=visit">방문한 장소 남기기</a><a href="/diary/#new?kind=story">내 이야기 한 줄 남기기</a></div><a href="/diary/#profile">입덕일·신분 카드는 나중에 작성해도 돼요 →</a></div>`}`}<a class="pp-new-bottom" href="/diary/#new${filterKind==='goods'?'?kind=goods':''}">＋ ${filterKind==='goods'?'굿즈 구매 남기기':'기록 남기기'}</a></div></div>`;}

function ticket(e){return `<div class="pp-ticket"><p class="pp-label">SEEYA DIARY · ${P.KINDS[e.kind]}</p><h2>${E(e.title)}</h2><p>${E(e.kind==='play'?Play.GAMES[e.play?.game]||'씨야 플레이':e.kind==='goods'?'나의 굿즈 컬렉션':e.snapshot.place||'나의 기억 속 한 장면')}</p><div class="pp-ticket-cut"><p>${P.dateLabel(e.date)}${e.time?' · '+e.time:''}</p>${e.kind==='goods'?`<p>수량 · ${e.goods?.quantity||1}개</p>`:''}${e.kind==='play'?'<p>'+E(Play.summary(e.play))+'</p>':''}${e.kind!=='goods'&&e.seat?`<p>좌석 · ${E(e.seat)}</p>`:''}<p>${E(memberNames(e))}</p><span class="pp-seal">${e.kind==='play'?'PLAY RECORD':e.kind==='goods'?(e.status==='planned'?'WISH LIST':'MY COLLECTION'):e.status==='planned'?'TO BE THERE':e.kind==='story'?'MY MEMORY':'I WAS HERE'}</span></div></div>`;}
function detail(id){const e=state.entries.find(e=>e.entryId===id);if(!e){app.innerHTML=linkBack()+'<p>기록을 찾지 못했어요. 백업 파일에서 복원할 수 있습니다.</p>';return;}const place=catalog.places.find(p=>p.id===e.placeId),event=catalog.events.find(x=>x.id===e.eventId);app.innerHTML=linkBack()+`<div class="pp-detail"><div>${ticket(e)}${e.concertPoster?'<section id="ppConcertPoster" class="pp-panel"></section>':''}<div class="pp-actions" style="margin-top:18px"><a href="/diary/#make=${E(id)}">이미지로 만들기</a><a href="/diary/#share">QR로 공유</a><a href="/diary/#edit=${E(id)}">수정</a></div><p class="pp-help">공유 이미지에는 결제금액·구매처·메모·동행인이 포함되지 않아요. 좌석은 이미지 만들기에서 직접 선택할 때만 포함합니다.</p></div><section class="pp-panel"><h2>${e.kind==='goods'?'나의 구매 기록':'그날의 기억'}</h2>${goodsDetail(e)}${e.kind==='play'?'<p>'+E(Play.summary(e.play))+'</p><p class="pp-help">'+(e.play?.source==='result'?'게임 완료 결과에서 저장한 기록':'직접 남긴 플레이 기록')+'</p><a href="/game/">씨야 플레이로 이동 →</a>':''}<dl><dt>상태</dt><dd>${kindState(e)}${e.status==='planned'?`<button data-complete="${E(e.entryId)}" ${e.date&&e.date>P.today().slice(0,e.date.length)?'disabled title="예정 날짜가 지난 뒤 완료로 바꿀 수 있어요"':''}>${e.kind==='goods'?'구매했어요':e.kind==='play'?'플레이 완료':e.kind==='story'?'기록 완료':'다녀왔어요'}</button>`:''}</dd><dt>${e.kind==='play'?'플레이 날짜':e.kind==='goods'?(e.status==='planned'?'구매 예정일':'구매일'):'날짜'}</dt><dd>${P.dateLabel(e.date)}</dd>${e.kind==='goods'?'':`<dt>함께</dt><dd>${E(e.companions||'기록하지 않았어요')}</dd>`}<dt>정보 기준</dt><dd>${e.kind==='play'?'씨야 플레이 기록':e.eventId?'일정에서 시작한 기록':e.placeId?'지도에서 시작한 기록':'직접 입력'}</dd></dl>${detailExtras(e)}<p class="pp-note">${E(e.note||'아직 메모가 없어요.')}</p><div class="pp-actions">${place?`<a href="/map/?place=${encodeURIComponent(place.id)}">지도에서 보기</a>`:''}${event?.calendar?`<a href="/calendar/?month=${(e.date||event.date).slice(0,7)}&day=${encodeURIComponent(e.date||event.date)}&event=${encodeURIComponent(event.id)}">연결된 일정</a>`:''}${e.archiveId&&catalog.events.some(x=>x.archiveId===e.archiveId)?`<a href="/archive/?record=${encodeURIComponent(e.archiveId)}">아카이브 기록</a>`:''}</div>${(e.eventId&&!event||e.placeId&&!place)?'<p class="pp-help">공개 정보의 연결이 사라졌지만 작성 당시 내용은 수첩에 남아 있어요.</p>':''}<div class="pp-danger"><button data-action="show-delete">이 기록 삭제</button><div id="ppDelete" class="pp-confirm" hidden><p>삭제 후에는 백업 파일이 있어야 복원할 수 있어요.</p><button data-delete="${E(id)}">이 기록을 삭제합니다</button></div></div></section></div><div id="ppExportResult"></div>`;if(e.concertPoster)ConcertDiary.mount(document.getElementById('ppConcertPoster'),e.concertPoster,download);}
function songFields(e){const known=new Set(catalog.songs.map(s=>s.id)),unknown=(e.songs||[]).filter(id=>!known.has(id));return `<fieldset class="pp-wide pp-song-box" id="ppSongBox" ${e.kind==='concert'?'':'hidden'}><legend>그날 들은 곡</legend><input id="ppSongSearch" type="search" placeholder="곡명 검색" aria-label="들은 곡 검색"><div class="pp-song-list">${[...catalog.songs,...unknown.map(id=>({id,title:id,album:'이전 백업의 곡'}))].map(s=>`<label data-song-title="${E(s.title.toLowerCase())}"><input type="checkbox" name="song" value="${E(s.id)}" ${(e.songs||[]).includes(s.id)?'checked':''}><span>${E(s.title)}<small>${E(s.album||'')}</small></span></label>`).join('')}</div><p class="pp-help">공연에서 실제 들은 곡만 체크해 주세요. 예정 기록은 들은 곡 집계에서 제외합니다.</p></fieldset>`;}
function linkFields(e){return `<section class="pp-wide pp-link-fields"><h3>관련 링크 <small>최대 8개</small></h3><p class="pp-help">인스타그램·유튜브·X 등 관련 게시물의 https:// 주소를 적어 주세요.</p><div id="ppLinkRows">${(e.links||[]).map((l,i)=>linkRow(l,i)).join('')}</div><button type="button" id="ppAddLink">＋ 링크 추가</button></section>`;}
function linkRow(l,i){return `<div class="pp-link-row"><label class="pp-field"><span>링크 주소 ${i+1}</span><input data-url type="url" maxlength="2000" value="${E(l.url)}" placeholder="https://"></label><label class="pp-field"><span>한 줄 설명 ${i+1}</span><input data-label maxlength="120" value="${E(l.label)}" placeholder="직접 찍은 공연 영상"></label><button type="button" data-remove-link aria-label="링크 ${i+1} 삭제">삭제</button></div>`;}
function readLinks(f){return [...f.querySelectorAll('.pp-link-row')].map(r=>({url:r.querySelector('[data-url]').value.trim(),label:r.querySelector('[data-label]').value.trim()})).filter(x=>x.url||x.label).map(x=>{if(!x.url)throw Error('설명이 있는 링크의 주소를 입력해 주세요.');return {...x,url:X.url(x.url)};});}
function wireExtras(f){f.elements.kind.addEventListener('change',()=>{document.getElementById('ppSongBox').hidden=f.elements.kind.value!=='concert';});document.getElementById('ppSongSearch').oninput=e=>{const q=e.target.value.trim().toLowerCase();f.querySelectorAll('[data-song-title]').forEach(r=>r.hidden=!r.dataset.songTitle.includes(q));};document.getElementById('ppAddLink').onclick=()=>{const box=document.getElementById('ppLinkRows');if(box.children.length>=8){say('링크는 최대 8개까지 넣을 수 있어요.');return;}box.insertAdjacentHTML('beforeend',linkRow({url:'',label:''},box.children.length));dirty=true;box.lastElementChild.querySelector('input').focus();};f.addEventListener('click',e=>{if(e.target.closest('[data-remove-link]')){e.target.closest('.pp-link-row').remove();dirty=true;}});}
function detailExtras(e){const first=new Set(X.firstSongs(e,state.entries));return `${e.kind==='concert'?`<section class="pp-detail-songs"><h3>그날 들은 곡 <small>${(e.songs||[]).length}</small></h3>${(e.songs||[]).length?`<ul>${e.songs.map(id=>`<li>${E(catalog.songs.find(s=>s.id===id)?.title||id)} ${first.has(id)&&e.status==='done'?'<small class="pp-first" title="내 수첩에 기록한 첫 청취">FIRST</small>':''}</li>`).join('')}</ul>`:'<p class="pp-help">기록 수정에서 들은 곡을 체크할 수 있어요.</p>'}</section>`:''}${e.links?.length?`<section class="pp-attached"><h3>함께 남긴 링크</h3>${e.links.map(l=>{const yt=X.youtube(l.url);return `<a href="${E(l.url)}" target="_blank" rel="noopener noreferrer">${yt?`<img src="https://i.ytimg.com/vi/${yt}/mqdefault.jpg" alt="유튜브 영상 썸네일" loading="lazy" referrerpolicy="no-referrer">`:''}<span>${E(l.label||new URL(l.url).hostname)} ↗</span></a>`;}).join('')}</section>`:''}`;}
async function copyText(text){try{await navigator.clipboard.writeText(text);say('복사했어요. 원하는 곳에 붙여넣어 주세요.');}catch{say('자동 복사를 사용할 수 없어요. 아래 문구를 선택해 복사해 주세요.');const t=document.createElement('textarea');t.value=text;t.readOnly=true;status.append(t);t.select();}}
function monthPage(){app.innerHTML=linkBack()+`<section class="pp-panel"><p class="pp-label">MY MONTH · WITH YOU</p><h2>이달의 나</h2><label class="pp-field"><span>기록을 돌아볼 달</span><input id="ppMonth" type="month" value="${selectedMonth}"></label><div id="ppMonthResult"></div><a id="ppMonthMake" href="/diary/#make?month=${selectedMonth}">결산 이미지 만들기 →</a></section>`;const draw=()=>{const m=document.getElementById('ppMonth').value;selectedMonth=m||selectedMonth;document.getElementById('ppMonthMake').href='/diary/#make?month='+selectedMonth;const rows=state.entries.filter(e=>e.date.startsWith(m)&&P.completed(e)),n=P.summary(rows);document.getElementById('ppMonthResult').innerHTML=`<div class="pp-stats"><div><b>${n.concert}</b><span>공연</span></div><div><b>${n.visit}</b><span>장소</span></div><div><b>${X.songs(rows).length}</b><span>들은 곡</span></div></div><p>굿즈 구매 ${n.goods}건</p>${rows.length?rows.map(e=>`<p><a href="/diary/#entry=${E(e.entryId)}">${P.dateLabel(e.date)} · ${E(e.title)}</a></p>`).join(''):'<p>이달의 기억을 기다리고 있어요.</p>'}`;};document.getElementById('ppMonth').onchange=draw;draw();}
function sharePage(){app.innerHTML=linkBack()+`<section class="pp-panel pp-settings"><p class="pp-label">WITH YOU · SHARE</p><h2>나의 다이어리 요약 QR</h2><p>처음 좋아한 날, 공연·장소·팬 행사·이야기·굿즈 구매 집계와 완료한 기록의 제목·날짜, 들은 곡 수를 공유합니다. 결제금액·구매처·종류/사이즈·메모·좌석·동행인·첨부 링크는 제외합니다.</p><p class="pp-help">내용이 주소 안에 담깁니다. 링크를 받은 사람은 누구나 요약을 볼 수 있으며 나중에 회수할 수 없습니다. 공유 전에 기록 제목도 확인해 주세요.</p><label class="pp-checks"><input type="checkbox" id="ppShareName"> 닉네임도 포함</label><button id="ppBuildQR" class="pp-primary">요약 미리보기·QR 만들기</button><div id="ppQRResult"></div></section>`;document.getElementById('ppBuildQR').onclick=async()=>{const target=document.getElementById('ppQRResult');try{const result=await Share.make(state,document.getElementById('ppShareName').checked,location.origin+'/diary/#view=');if(!target.isConnected)return;target.innerHTML=`<p class="pp-help">최근 기록 ${result.included}개 포함 · 전체 집계는 유지합니다.${result.included<state.entries.filter(e=>P.completed(e)).length?' QR 용량에 맞춰 최근 기록부터 담았습니다.':''}</p><div id="ppQRCanvas"></div><label class="pp-field"><span>공유 주소</span><textarea readonly id="ppShareURL">${E(result.url)}</textarea></label><div class="pp-actions"><button id="ppCopyURL">주소 복사</button><button id="ppSaveQR">QR 이미지 저장</button><a href="${E(result.url)}" target="_blank" rel="noopener noreferrer">읽기 전용 미리보기</a></div><details><summary>공유되는 기록 확인</summary>${result.summary.r.map(r=>`<p>${E(r.d+' · '+r.t)}</p>`).join('')}</details>`;document.getElementById('ppQRCanvas').append(result.canvas);document.getElementById('ppCopyURL').onclick=()=>copyText(result.url);document.getElementById('ppSaveQR').onclick=()=>result.canvas.toBlob(b=>download(b,'with-you-summary-qr.png'),'image/png');}catch{say('이 브라우저에서는 QR을 만들지 못했어요. 최신 브라우저에서 다시 시도해 주세요.');}};}
async function viewShare(token){document.querySelector('.pp-tabs').hidden=true;app.innerHTML='<p>공유된 다이어리를 여는 중이에요.</p>';try{const s=await Share.decode(token);if(location.hash!=='#view='+token)return;app.innerHTML=`<section class="pp-panel pp-shared"><p class="pp-label">SEEYA DIARY · READ ONLY</p><h2>${E(s.n||'위듀의 다이어리')}</h2><p>본인이 기록한 다이어리 요약입니다.</p><div class="pp-stats"><div><b>${s.c.concert}</b><span>공연 관람</span></div><div><b>${s.c.visit}</b><span>장소 방문</span></div><div><b>${s.c.event}</b><span>팬 행사</span></div></div><p>굿즈 구매 ${s.c.goods}건</p><div class="pp-tour">${catalog.tour.map(t=>`<div class="pp-stamp ${s.r.some(r=>r.k==='concert'&&r.d===t.date&&(r.i===t.eventId||r.a===t.archiveId))?'is-done':''}"><strong><small>${t.date.slice(5)}</small>${E(t.label)}</strong></div>`).join('')}</div><p class="pp-help">도장은 공유에 포함된 최근 기록 기준입니다.</p><div class="pp-records">${s.r.map(r=>`<div class="pp-record" data-kind="${r.k}"><span class="pp-label">${P.KINDS[r.k]}</span><h3>${E(r.t)}</h3><p>${P.dateLabel(r.d)}</p>${r.k==='concert'?`<p>들은 곡 ${r.z}곡</p>`:''}</div>`).join('')}</div></section><a href="/diary/">내 기기의 다이어리 열기 →</a>`;}catch{app.innerHTML='<section class="pp-panel"><h2>공유 주소를 확인해 주세요.</h2><p>주소가 잘렸거나 지원하지 않는 공유 내용입니다.</p></section>';}}

function goodsIntro(){const n=G.totals(state.entries);return `<section class="pp-panel pp-goods-intro"><p class="pp-label">MY GOODS · COLLECTION</p><h2>굿즈 보관함</h2><p>씨야와 함께한 기억을 물건 한 점에도 담아두세요.</p><p><b>${n.quantity}개</b> 소장 · 구매 기록 ${n.records}건</p><a class="pp-primary" href="/diary/#new?kind=goods">＋ 굿즈 구매 남기기</a><p class="pp-help">구매 예정은 소장 수에 포함하지 않아요.</p></section>`;}
function goodsFields(e){const g=e.goods||{},items=catalog.goods||[];return `<fieldset id="ppGoodsBox" class="pp-wide pp-goods-box" ${e.kind==='goods'?'':'hidden'}><legend>굿즈 구매 정보</legend><div class="pp-form-grid"><label class="pp-field pp-wide"><span>확인된 굿즈 선택 (선택)</span><select name="goodsCatalog">${options([['','직접 입력'],...items.map(x=>[x.id,x.collection+' · '+x.name]),...(g.catalogId&&!items.some(x=>x.id===g.catalogId)?[[g.catalogId,'이전 목록의 굿즈']]:[])],g.catalogId||'')}</select></label><p id="ppGoodsSource" class="pp-help pp-wide"></p>${field('수량 *','goodsQuantity',g.quantity??1,'type="number" min="1" max="999" step="1" required inputmode="numeric"')}${field('총 결제금액 (원 · 선택)','goodsAmount',g.amount??'','type="number" min="0" max="999999999" step="1" inputmode="numeric" placeholder="모르면 비워 두세요"')}${field('구매처 (선택)','goodsShop',g.shop||'','maxlength="160" placeholder="현장 부스, 온라인숍 등"')}${field('종류·색상·사이즈 (선택)','goodsVariant',g.variant||'','maxlength="100" placeholder="선택한 멤버, 색상, 사이즈 등"')}<p class="pp-help pp-wide">한 기록에 같은 종류의 굿즈 수량을 적어 주세요. 금액은 수량을 포함한 총 결제금액이며, 모르면 비워 두세요. 0원도 기록할 수 있어요.<br>목록 밖의 굿즈도 직접 입력할 수 있습니다. 구매 가능 여부와 가격은 판매처에서 확인해 주세요.</p></div></fieldset>`;}
function readGoods(f){return {catalogId:f.elements.goodsCatalog.value,quantity:Number(f.elements.goodsQuantity.value),amount:f.elements.goodsAmount.value===''?null:Number(f.elements.goodsAmount.value),shop:f.elements.goodsShop.value,variant:f.elements.goodsVariant.value};}
function wireGoods(f,e){
 const source=document.getElementById('ppGoodsSource');
 const showSource=()=>{const g=(catalog.goods||[]).find(x=>x.id===f.elements.goodsCatalog.value);source.innerHTML=g?`${E(g.collection)} · <a href="${E(g.source.url)}" target="_blank" rel="noopener noreferrer">상품 안내 확인 ↗</a>`:'목록에 없는 굿즈는 아래 굿즈명에 직접 적어 주세요.';};
 const label=(name,value)=>{f.elements[name].closest('label').querySelector('span').textContent=value;};
 const sync=()=>{const goods=f.elements.kind.value==='goods';document.getElementById('ppGoodsBox').hidden=!goods;document.getElementById('ppGoodsBox').disabled=!goods;document.getElementById('ppPlacePicker').hidden=goods;for(const n of ['time','seat','place','companions'])f.elements[n].closest('label').hidden=goods;label('title',goods?'굿즈명 *':'제목 *');document.getElementById('ppDateLabel').textContent=goods?'구매일 / 구매 예정일 (아는 만큼만)':'날짜 (아는 만큼만)';f.elements.status.options[0].textContent=goods?'구매 예정':'갈 예정 / 계획';f.elements.status.options[1].textContent=goods?'구매했어요':'다녀왔어요 / 남긴 이야기';document.getElementById('ppEventHint').textContent=goods?'관련 공연이나 행사를 연결해요. 굿즈명과 구매일은 그대로 유지됩니다.':'검색 결과를 선택하면 제목·날짜·장소가 채워져요.';};
 f.elements.kind.addEventListener('change',sync);
 f.elements.goodsCatalog.addEventListener('change',()=>{const g=(catalog.goods||[]).find(x=>x.id===f.elements.goodsCatalog.value);if(g){f.elements.title.value=g.collection+' · '+g.name;}showSource();dirty=true;f.dispatchEvent(new Event('input',{bubbles:true}));});
 f.elements.title.addEventListener('input',()=>{if(f.elements.kind.value!=='goods')return;const g=(catalog.goods||[]).find(x=>x.id===f.elements.goodsCatalog.value);if(g&&f.elements.title.value!==g.collection+' · '+g.name){f.elements.goodsCatalog.value='';showSource();}});
 sync();showSource();
}

function playFields(e){const p=e.play?{...e.play,maxScore:e.play.maxScore??catalog.playFormats[e.play.game]?.maxScore??null,total:e.play.total??catalog.playFormats[e.play.game]?.total??null}:{game:'lyrics',...catalog.playFormats.lyrics};return `<fieldset class="pp-wide pp-play-fields" id="ppPlayFields" ${e.kind==='play'?'':'hidden'}><legend>씨야 플레이 결과</legend><label class="pp-field"><span>플레이 종류</span><select name="playGame">${options(Object.entries(Play.GAMES),p.game)}</select></label>${field('영역 · 난이도 (선택)','playLevel',p.level||'','maxlength="80" placeholder="재회 탐구 / LEVEL 1"')}<div class="pp-date-fields">${field('점수 (선택)','playScore',p.score??'','type="number" min="0" max="10000"')}${field('만점','playMax',p.maxScore??'','type="number" min="1" max="10000"')}</div><div class="pp-date-fields">${field('정답 수 (선택)','playCorrect',p.correct??'','type="number" min="0" max="10000"')}${field('전체 문항 수','playTotal',p.total??'','type="number" min="1" max="10000"')}</div><p class="pp-help">가사 퀴즈의 점수는 첫 시도 정답 수, 정답 수는 두 번째 시도까지 포함한 합계예요. 전체 문항 수와 만점은 플레이 종류에 맞춰 자동 입력됩니다. 점수·정답 수를 모르면 비워도 됩니다.</p><a href="/game/">씨야 플레이 열기 →</a></fieldset>`;}
function readPlay(f,e){const n=name=>f.elements[name].value===''?null:Number(f.elements[name].value),p={game:f.elements.playGame.value,level:f.elements.playLevel.value,score:n('playScore'),maxScore:n('playMax'),correct:n('playCorrect'),total:n('playTotal'),mode:e.play?.game===f.elements.playGame.value?e.play.mode||'':'',source:e.play?.source||'manual'};if(e.play&&['game','level','score','maxScore','correct','total'].some(k=>p[k]!==e.play[k]))p.source='manual';return p;}
function wirePlay(f,e){const box=document.getElementById('ppPlayFields');const sync=()=>{const play=f.elements.kind.value==='play',goods=f.elements.kind.value==='goods';box.hidden=!play;box.disabled=!play;document.getElementById('ppEventSearch').closest('.pp-event-picker').hidden=play;document.getElementById('ppPlacePicker').hidden=play||goods;for(const n of ['seat','place','companions'])f.elements[n].closest('label').hidden=play||goods;if(play){f.elements.status.options[0].textContent='플레이 예정';f.elements.status.options[1].textContent='플레이 완료';}};f.elements.kind.addEventListener('change',sync);const preset=()=>{const p=catalog.playFormats[f.elements.playGame.value];f.elements.playMax.readOnly=!!p;f.elements.playTotal.readOnly=!!p;f.elements.playScore.max=p?.maxScore||10000;f.elements.playCorrect.max=p?.total||10000;};
 f.elements.playGame.addEventListener('change',()=>{const p=catalog.playFormats[f.elements.playGame.value];f.elements.playMax.value=p?.maxScore??'';f.elements.playTotal.value=p?.total??'';f.elements.playScore.value='';f.elements.playCorrect.value='';f.elements.playLevel.value='';if(f.elements.title.value==='씨야 플레이 기록'||Object.values(Play.GAMES).includes(f.elements.title.value))f.elements.title.value=Play.GAMES[f.elements.playGame.value];preset();f.dispatchEvent(new Event('input',{bubbles:true}));});preset();sync();}

function goodsDetail(e){if(e.kind!=='goods')return '';const g=e.goods||{},item=(catalog.goods||[]).find(x=>x.id===g.catalogId);return `<dl class="pp-goods-detail"><dt>수량</dt><dd>${g.quantity||1}개</dd><dt>총 결제금액</dt><dd>${g.amount==null?'기록하지 않았어요':g.amount.toLocaleString('ko-KR')+'원'}</dd><dt>구매처</dt><dd>${E(g.shop||'기록하지 않았어요')}</dd><dt>종류·색상·사이즈</dt><dd>${E(g.variant||'기록하지 않았어요')}</dd>${e.snapshot.title?`<dt>관련 일정</dt><dd>${E(e.snapshot.title)}</dd>`:''}</dl>${item?`<p><a href="${E(item.source.url)}" target="_blank" rel="noopener noreferrer">${E(item.source.label)} ↗</a></p>`:''}`;}

function editor(existing,params=new URLSearchParams()){
 const ev=Cal.selectedEvent(catalog.events.find(x=>x.id===params.get('event')),params.get('date')||''),pl=catalog.places.find(x=>x.id===(params.get('place')||ev?.placeId));
 const now=new Date().toISOString(),e=existing?JSON.parse(JSON.stringify(existing)):{entryId:crypto.randomUUID(),kind:ev?eventKind(ev):pl?'visit':Object.hasOwn(P.KINDS,params.get('kind'))?params.get('kind'):'story',status:ev?P.defaultStatus(ev.date):pl?'planned':'done',title:ev?.title||(pl?pl.name+' 방문':''),date:ev?.date||'',time:ev?.time||'',members:ev?.members||pl?.members||[],eventId:ev?.id||'',placeId:pl?.id||'',archiveId:ev?.archiveId||'',snapshot:{title:ev?.title||'',place:pl?.name||ev?.venue||'',address:pl?.address||''},seat:'',companions:'',note:'',createdAt:now,updatedAt:now};
 e.songs=e.songs||[];e.links=e.links||[];if(!existing&&e.kind==='goods'){e.title='';e.date=P.today();e.time='';e.status='done';}if(!existing&&e.kind==='play'){e.title='씨야 플레이 기록';e.date=P.today();e.members=['seeya'];e.status='done';}const parts=e.date.split('-');app.innerHTML=linkBack()+`<section class="pp-panel pp-editor"><h2>${existing?'기록 수정':'새 기록 남기기'}</h2><form id="ppEntryForm" class="pp-form-grid"><label class="pp-field"><span>기록 종류</span><select name="kind">${options(Object.entries(P.KINDS),e.kind)}</select></label><label class="pp-field"><span>기록 상태</span><select name="status">${options([['planned','갈 예정 / 계획'],['done','다녀왔어요 / 남긴 이야기']],e.status)}</select></label>${goodsFields(e)}${playFields(e)}<div class="pp-wide pp-event-picker"><label class="pp-field" for="ppEventSearch"><span>등록된 일정 찾기 (선택)</span></label><input id="ppEventSearch" role="combobox" aria-autocomplete="list" aria-expanded="false" aria-controls="ppEventList" aria-describedby="ppEventHint" placeholder="공연명·장소·날짜 검색" autocomplete="off"><div id="ppEventList" class="pp-event-results" role="listbox" aria-label="검색된 일정" hidden></div><p id="ppEventHint" class="pp-help" role="status">검색 결과를 선택하면 제목·날짜·장소가 채워져요.</p><div id="ppSelectedEvent" class="pp-selected-event" hidden></div><div id="ppSessions" class="pp-sessions" role="group" aria-label="공연 날짜 선택" hidden></div></div><div class="pp-wide pp-event-picker" id="ppPlacePicker"><label class="pp-field" for="ppPlaceSearch"><span>대동여지도 장소 찾기 (선택)</span></label><input id="ppPlaceSearch" role="combobox" aria-autocomplete="list" aria-expanded="false" aria-controls="ppPlaceList" aria-describedby="ppPlaceHint" placeholder="장소명·지역·주소 검색" autocomplete="off"><div id="ppPlaceList" class="pp-event-results" role="listbox" aria-label="검색된 장소" hidden></div><p id="ppPlaceHint" class="pp-help" role="status">선택하면 장소 방문 기록으로 채워져요. 방문 날짜는 직접 입력해 주세요.</p><div id="ppSelectedPlace" class="pp-selected-event" hidden></div></div><div class="pp-wide">${field('제목 *','title',e.title,'required maxlength="160"')}</div><div class="pp-wide"><span id="ppDateLabel">날짜 (아는 만큼만)</span><div class="pp-date-fields">${field('연도','year',parts[0]||'','type="number" min="1900" max="2100" placeholder="미상"')}${field('월','month',parts[1]||'','type="number" min="1" max="12" placeholder="선택"')}${field('일','day',parts[2]||'','type="number" min="1" max="31" placeholder="선택"')}</div><p class="pp-help">날짜를 모두 비우면 ‘날짜 미상’으로 남아요.</p></div>${field('시간 (선택)','time',e.time,'type="time"')}${field('좌석 (선택)','seat',e.seat,'maxlength="100"')}${field('장소 이름 (직접 수정 가능)','place',e.snapshot.place,'maxlength="300"')}${field('함께 간 사람 (선택)','companions',e.companions,'maxlength="120"')}<fieldset class="pp-wide"><legend>함께한 멤버</legend><div class="pp-checks">${Object.entries(P.MEMBERS).map(([v,t])=>`<label><input type="checkbox" name="member" value="${v}"${e.members.includes(v)?' checked':''}>${t}</label>`).join('')}</div></fieldset>${songFields(e)}${linkFields(e)}<label class="pp-field pp-wide"><span>나만의 메모</span><textarea name="note" maxlength="4000" placeholder="그날의 마음을 적어 주세요.">${E(e.note)}</textarea></label><details class="pp-wide pp-draft-preview"><summary>기록 미리보기</summary><div id="ppDraft" class="pp-preview-summary"></div></details><div class="pp-wide pp-confirm" id="ppDuplicate" hidden><p>같은 날짜·회차의 비슷한 기록이 있어요.</p><label><input type="checkbox" name="allowDuplicate"> 별도의 경험으로 추가할게요</label></div><div class="pp-wide pp-actions"><button type="submit" class="pp-primary">${existing?'변경 내용 저장':'수첩에 기록하기'}</button><a href="/diary/">취소</a></div></form></section>`;
 const f=document.getElementById('ppEntryForm');simplifyEditor(f,e);wireExtras(f);wireGoods(f,e);let eventId=e.eventId,placeId=e.placeId,archiveId=e.archiveId,snapshot={...e.snapshot},statusManual=false;
 const preview=()=>{document.getElementById('ppDraft').innerHTML=ticket({title:f.elements.title.value||'나의 기록',kind:f.elements.kind.value,status:f.elements.status.value,date:[f.elements.year.value,f.elements.month.value,f.elements.day.value].filter(Boolean).join('-'),time:f.elements.kind.value==='goods'?'':f.elements.time.value,seat:f.elements.seat.value,goods:readGoods(f),play:f.elements.kind.value==='play'?readPlay(f,e):undefined,members:[...f.querySelectorAll('[name=member]:checked')].map(b=>b.value),snapshot:{place:f.elements.place.value}});};preview();
 f.addEventListener('input',ev=>{dirty=true;if(ev.target.name==='allowDuplicate')return;document.getElementById('ppDuplicate').hidden=true;if(f.elements.allowDuplicate)f.elements.allowDuplicate.checked=false;preview();});
 for(const type of ['input','change'])f.elements.place.addEventListener(type,()=>{if(f.elements.place.value!==snapshot.place){placeId='';snapshot.address='';selectedPlace(null);}});
 function selectedEvent(x){const box=document.getElementById('ppSelectedEvent'),sessions=document.getElementById('ppSessions');box.hidden=!x;box.innerHTML=x?`<div><small>연결된 일정</small><strong>${E(x.date+' · '+x.title)}</strong></div><button type="button" id="ppUnlinkEvent">연결 해제</button>`:'';const group=catalog.tour.find(t=>(t.eventIds||[t.eventId]).includes(x?.id));const choices=group?(group.eventIds||[group.eventId]).map(id=>catalog.events.find(x=>x.id===id)).filter(Boolean):[];sessions.hidden=choices.length<2;sessions.innerHTML=choices.length>1?'<p>공연 날짜를 선택해 주세요.</p><div>'+choices.map(v=>`<button type="button" data-session="${E(v.id)}" aria-pressed="${f.elements.year.value+'-'+String(f.elements.month.value).padStart(2,'0')+'-'+String(f.elements.day.value).padStart(2,'0')===v.date}">${E(P.dateLabel(v.date))}</button>`).join('')+'</div>':'';}
 function chooseEvent(x){dirty=true;if(f.elements.kind.value==='goods'){const v=G.eventValues(x);eventId=v.eventId;placeId=v.placeId;archiveId=v.archiveId;snapshot=v.snapshot;selectedEvent(x);selectedPlace(catalog.places.find(p=>p.id===placeId));document.getElementById('ppDuplicate').hidden=true;f.elements.allowDuplicate.checked=false;preview();return;}statusManual=false;const p=catalog.places.find(p=>p.id===x.placeId);eventId=x.id;placeId=p?.id||'';archiveId=x.archiveId;snapshot={title:x.title,place:p?.name||x.venue,address:p?.address||''};for(const [k,v] of Object.entries({title:x.title,year:x.date.slice(0,4),month:Number(x.date.slice(5,7)),day:Number(x.date.slice(8,10)),time:x.time,place:snapshot.place,kind:eventKind(x),status:P.defaultStatus(x.date)}))f.elements[k].value=v;f.querySelectorAll('[name=member]').forEach(b=>b.checked=x.members.includes(b.value));document.getElementById('ppSongBox').hidden=f.elements.kind.value!=='concert';document.getElementById('ppDuplicate').hidden=true;f.elements.allowDuplicate.checked=false;selectedEvent(x);selectedPlace(p);f.elements.kind.dispatchEvent(new Event('change',{bubbles:true}));preview();}
 function selectedPlace(p){
  const box=document.getElementById('ppSelectedPlace');box.hidden=!p;
  box.innerHTML=p?`<div><small>연결된 장소${p.operatingStatus==='closed'?' · 영업 종료 · 과거 기록':''}${p.locationPrecision==='area'?' · 지역 대표 위치':''}</small><strong>${E(p.name)}</strong><small>${E(p.address)}</small><a href="/map/?place=${encodeURIComponent(p.id)}" target="_blank" rel="noopener">지도에서 보기 ↗</a></div><button type="button" id="ppUnlinkPlace">장소 연결 해제</button>`:'';
 }
 function choosePlace(p){
  dirty=true;eventId='';archiveId='';placeId=p.id;snapshot={title:'',place:p.name,address:p.address};
  f.elements.title.value=p.name+' 방문';f.elements.place.value=p.name;f.elements.kind.value='visit';
  if(!existing&&!statusManual){const y=f.elements.year.value,m=f.elements.month.value,d=f.elements.day.value;const day=y+(m?'-'+m.padStart(2,'0'):'')+(d?'-'+d.padStart(2,'0'):'');f.elements.status.value=P.defaultStatus(day);}
  f.querySelectorAll('[name=member]').forEach(b=>b.checked=(p.members||[]).includes(b.value));
  f.elements.kind.dispatchEvent(new Event('change',{bubbles:true}));
  selectedEvent(null);selectedPlace(p);document.getElementById('ppDuplicate').hidden=true;f.elements.allowDuplicate.checked=false;preview();
 }
 const placeRows=catalog.places.map(p=>({...p,title:p.name,venue:p.address,date:[p.category,p.operatingStatus==='closed'?'영업 종료 · 과거 기록':''].filter(Boolean).join(' · ')}));
 attachPicker(document.getElementById('ppPlaceSearch'),document.getElementById('ppPlaceList'),document.getElementById('ppPlaceHint'),placeRows,choosePlace,E,{noun:'장소',empty:'일치하는 장소가 없어요. 장소 이름을 직접 입력해도 됩니다.',selected:'장소를 선택했어요. 내가 방문한 날짜와 상태를 확인해 주세요.'});
 selectedPlace(catalog.places.find(p=>p.id===placeId));
 if(params.get('place')&&!pl)say('지도에서 연결된 장소를 찾지 못했어요. 장소를 다시 검색하거나 직접 입력해 주세요.');
 selectedEvent(catalog.events.find(x=>x.id===eventId));
 attachPicker(document.getElementById('ppEventSearch'),document.getElementById('ppEventList'),document.getElementById('ppEventHint'),catalog.events.map(x=>Cal.selectedEvent(x)),chooseEvent,E);
 if(params.get('event')&&!ev)say('연결된 일정을 찾지 못했어요. 일정 검색에서 다시 선택해 주세요.');
 wirePlay(f,e);f.elements.seat.closest('label').hidden=f.elements.kind.value!=='concert';f.elements.kind.addEventListener('change',()=>{if(f.elements.kind.value==='play'){eventId='';placeId='';archiveId='';snapshot={title:'',place:'',address:''};selectedEvent(null);selectedPlace(null);if(!existing&&!f.elements.year.value){const parts=P.today().split('-');['year','month','day'].forEach((n,i)=>f.elements[n].value=Number(parts[i]));}preview();}});
 f.addEventListener('click',ev=>{const b=ev.target.closest('button');if(b?.id==='ppUnlinkPlace'){dirty=true;placeId='';snapshot.address='';selectedPlace(null);preview();}else if(b?.dataset.session){chooseEvent(catalog.events.find(x=>x.id===b.dataset.session));}else if(b?.id==='ppUnlinkEvent'){dirty=true;eventId='';archiveId='';if(f.elements.kind.value==='goods'){placeId='';snapshot={title:'',place:'',address:''};}selectedEvent(null);selectedPlace(catalog.places.find(p=>p.id===placeId));}});
 f.elements.status.addEventListener('change',()=>{statusManual=true;});
 for(const key of ['year','month','day'])for(const type of ['input','change'])f.elements[key].addEventListener(type,()=>{if(existing||statusManual)return;const y=f.elements.year.value,m=f.elements.month.value,d=f.elements.day.value,dt=y+(m?'-'+m.padStart(2,'0'):'')+(d?'-'+d.padStart(2,'0'):'');try{if(dt)f.elements.status.value=f.elements.kind.value==='goods'&&P.date(dt)<=P.today().slice(0,dt.length)?'done':P.defaultStatus(P.date(dt));}catch{}preview();});
 f.addEventListener('submit',ev=>{ev.preventDefault();try{const y=f.elements.year.value,m=f.elements.month.value,d=f.elements.day.value;if((m&&!y)||(d&&(!y||!m)))throw Error('월·일을 입력하려면 앞의 연도·월도 입력해 주세요.');const dt=y+(m?'-'+m.padStart(2,'0'):'')+(d?'-'+d.padStart(2,'0'):'');if(f.elements.kind.value!=='goods'&&f.elements.place.value!==snapshot.place){placeId='';snapshot.address='';}const v=P.entry({...e,title:f.elements.title.value,kind:f.elements.kind.value,status:f.elements.status.value,date:dt,time:f.elements.kind.value==='goods'?'':f.elements.time.value,seat:f.elements.kind.value==='goods'?'':f.elements.seat.value,companions:f.elements.kind.value==='goods'?'':f.elements.companions.value,note:f.elements.note.value,songs:[...f.querySelectorAll('[name=song]:checked')].map(b=>b.value),links:readLinks(f),goods:readGoods(f),play:f.elements.kind.value==='play'?readPlay(f,e):undefined,members:[...f.querySelectorAll('[name=member]:checked')].map(b=>b.value),eventId,placeId,archiveId,snapshot:{...snapshot,place:f.elements.kind.value==='goods'?snapshot.place:f.elements.place.value},updatedAt:new Date().toISOString()});if(v.status==='done'&&v.date>P.today().slice(0,v.date.length))throw Error('미래 날짜는 예정 상태로 저장해 주세요.');if(state.entries.some(x=>x.entryId!==e.entryId&&P.duplicate(x,v))&&!f.elements.allowDuplicate.checked){document.getElementById('ppDuplicate').hidden=false;document.getElementById('ppDuplicate').scrollIntoView({block:'center'});return;}const entries=state.entries.filter(x=>x.entryId!==e.entryId).concat(v);if(save({...state,entries})){go('#entry='+v.entryId);setTimeout(()=>say('수첩에 저장했어요.'),0);}}catch(err){entryError(f,err.message);}});
}
function entryError(f,message){
 f.querySelectorAll('.pp-field-error').forEach(n=>n.remove());f.querySelectorAll('[aria-invalid]').forEach(n=>{n.removeAttribute('aria-invalid');n.removeAttribute('aria-describedby');});
 const name=/미래 날짜|상태/.test(message)?'status':/날짜|연도|월|일을/.test(message)?'year':/시간/.test(message)?'time':/제목/.test(message)?'title':/점수|만점/.test(message)?'playScore':/정답|문항/.test(message)?'playCorrect':'note';const input=f.elements[name],box=document.createElement('p');box.id='ppEntryError';box.className='pp-field-error';box.setAttribute('role','alert');box.textContent=message;input.closest('label').append(box);input.setAttribute('aria-invalid','true');input.setAttribute('aria-describedby',box.id);const details=input.closest('details');if(details)details.open=true;input.focus();input.scrollIntoView({block:'center'});
}
function simplifyEditor(f,e){
 const more=document.createElement('details');more.className='pp-wide pp-related';more.innerHTML='<summary>관련 정보 더하기</summary><div class="pp-form-grid"></div>';more.querySelector('summary').textContent='관련 정보 더하기';const inner=more.lastElementChild;
 const pick=id=>document.getElementById(id),field=n=>f.elements[n].closest('label'),title=field('title').parentElement,date=pick('ppDateLabel').parentElement,note=field('note');
 const contextual=[pick('ppEventSearch').closest('.pp-event-picker'),pick('ppPlacePicker'),pick('ppSongBox')],extras=[...contextual,field('time'),field('seat'),field('place'),field('companions'),...f.querySelectorAll('fieldset:not(#ppSongBox):not(#ppPlayFields):not(#ppGoodsBox)'),f.querySelector('.pp-link-fields')].filter(Boolean);
 // Move existing nodes so their values, native form validation and picker bindings survive.
 for(const node of extras)if(node!==pick('ppGoodsBox')&&!node.classList.contains('pp-goods-fields'))inner.append(node);
 const base=field('status');f.insertBefore(title,base.nextSibling);f.insertBefore(date,title.nextSibling);f.insertBefore(note,date.nextSibling);f.insertBefore(more,note.nextSibling);
 // Set disclosure only on entry. Picker updates must not close the user's open panel.
 more.open=e.kind==='concert'||e.kind==='visit'||!!(e.eventId||e.placeId||e.seat||e.companions||e.links?.length||e.members?.length);
 const sync=()=>{const kind=f.elements.kind.value;more.querySelector('summary').textContent=kind==='concert'?'공연 정보 더하기 · 일정·좌석·들은 곡':kind==='visit'?'방문 정보 더하기 · 장소 찾기':kind==='goods'?'관련 일정·멤버·링크 더하기':'관련 정보 더하기 · 멤버·일정·링크';field('seat').hidden=kind!=='concert';f.elements.status.options[0].textContent=kind==='goods'?'구매 예정':kind==='play'?'플레이 예정':'예정';f.elements.status.options[1].textContent=kind==='goods'?'구매했어요':kind==='play'?'플레이 완료':kind==='story'?'남긴 이야기':'다녀왔어요';};
 f.elements.kind.addEventListener('change',()=>{if(['concert','visit'].includes(f.elements.kind.value))more.open=true;setTimeout(sync,0);});sync();setTimeout(sync,0);f.addEventListener('invalid',event=>{const more=event.target.closest('details');if(more)more.open=true;},true);
 f.addEventListener('input',()=>{f.querySelectorAll('.pp-field-error').forEach(n=>n.remove());f.querySelectorAll('[aria-invalid]').forEach(n=>{n.removeAttribute('aria-invalid');n.removeAttribute('aria-describedby');});});
}
function editProfile(){const p=state.profile;app.innerHTML=linkBack()+`<section class="pp-panel pp-settings"><h2>나의 신분 카드</h2><form id="ppProfile" class="pp-form-grid">${field('닉네임','nickname',p.nickname,'maxlength="30"')}${field('처음 좋아한 날','since',p.since,'placeholder="2006 또는 2006-03-12" maxlength="10"')}<p class="pp-help pp-wide">데뷔일인 2006년 3월 12일부터 오늘까지 입력할 수 있어요.<br>2006년·2006년 3월처럼 날짜를 모르면 해당 연도나 월까지만 적어도 괜찮아요.</p><label class="pp-field"><span>카드 색</span><select name="color">${options([['rose','로즈'],['violet','바이올렛'],['teal','그린'],['ink','잉크']],p.color)}</select></label><label class="pp-field"><span>최애 멤버</span><select name="favMember">${options(Object.entries(P.MEMBERS),p.favMember)}</select></label><label class="pp-field"><span>최애 곡</span><select name="favSong">${options([['','선택 안 함'],...catalog.songs.map(s=>[s.title,s.title])],p.favSong)}</select></label>${field('응원 문구','motto',p.motto,'maxlength="120"')}<button class="pp-primary" type="submit">신분 카드 저장</button></form></section>`;const f=document.getElementById('ppProfile');f.addEventListener('input',()=>dirty=true);f.addEventListener('submit',e=>{e.preventDefault();try{const p=P.profile(Object.fromEntries(new FormData(f)));if(p.since>P.today().slice(0,p.since.length))throw Error('입덕일은 오늘 이전으로 입력해 주세요.');if(save({...state,profile:p})){go('');setTimeout(()=>say('신분 카드를 저장했어요.'),0);}}catch(e){say(e.message);}});}
function settings(){let last='';try{last=localStorage.getItem('seeya-passport-backup-date')||'';}catch{}app.innerHTML=linkBack()+`<div class="pp-settings"><div id="ppPlayPreference"></div><div id="ppDriveBackup"></div><section class="pp-panel"><h2>기록을 안전하게 가져가기</h2><p>현재 이 브라우저에 ${state.entries.length}개의 기록이 있어요. 다른 기기에서는 아래 백업 파일을 가져와 이어 쓸 수 있습니다.</p><button data-action="backup" class="pp-primary">백업 파일 내려받기</button><p class="pp-help">마지막 백업 요청: ${E(last||'아직 없어요')}<br>다운로드 후 파일이 실제로 저장됐는지 확인해 주세요.</p><a href="/about/install/">홈 화면에 추가하는 방법 →</a></section><section class="pp-panel"><h2>백업 복원</h2><p>내용을 먼저 확인한 다음 적용합니다. 잘못된 파일은 기존 기록을 바꾸지 않습니다.</p><input id="ppImport" type="file" accept="application/json,.json" aria-label="백업 JSON 파일 선택"><div id="ppImportPreview"></div></section><section class="pp-panel pp-danger"><h2>이 브라우저의 수첩 비우기</h2><p>신분 카드와 모든 개인 기록을 삭제합니다. 먼저 백업을 내려받아 주세요.</p><label class="pp-field"><span>계속하려면 ‘삭제’를 입력하세요.</span><input id="ppDeleteAllText" autocomplete="off"></label><button data-action="delete-all">전체 삭제</button></section></div>`;PlayUI.mount(document.getElementById('ppPlayPreference'));driveCleanup=Drive.mount(document.getElementById('ppDriveBackup'),{getState:()=>state,onRestore:(value,name,id)=>{if(id!==importRequest)return false;showImport(value,name);},onRestoreStart:()=>{pendingImport=null;const p=document.getElementById('ppImportPreview');if(p)p.textContent='';return ++importRequest;},onBackedUp:snapshot=>{try{localStorage.setItem('seeya-diary-backup-snapshot',JSON.stringify({profile:snapshot.profile,entries:snapshot.entries.map(e=>[e.entryId,e.updatedAt])}));}catch{}}});document.getElementById('ppImport').addEventListener('change',async ev=>{const requestId=++importRequest;pendingImport=null;const preview=document.getElementById('ppImportPreview');preview.textContent='';const file=ev.target.files[0];if(!file)return;try{if(file.size>8*1024*1024)throw Error('8MB 이하의 백업 파일을 선택해 주세요.');const value=P.validate(JSON.parse(await file.text()));if(!preview.isConnected||requestId!==importRequest)return;showImport(value);}catch(e){say('가져오지 않았습니다. '+(e instanceof SyntaxError?'JSON 백업 파일을 확인해 주세요.':e.message));}});}

function showImport(value,source=''){const preview=document.getElementById('ppImportPreview');if(!preview)return;const r=P.review(state,value);pendingImport=value;preview.innerHTML=`<div class="pp-confirm"><p>새 기록 ${r.added}건 · 같은 ID ${r.conflicts}건 · 중복 의심 ${r.suspected}건</p><p>가져올 신분 카드: ${E(value.profile.nickname||'이름 없음')}</p><label class="pp-field"><span>같은 ID 처리</span><select id="ppImportMode"><option value="keep">현재 기록 유지</option><option value="replace">가져온 기록으로 교체</option></select></label><label><input id="ppImportProfile" type="checkbox"> 신분 카드도 가져오기</label><p class="pp-help">‘현재 기록 유지’는 같은 ID의 현재 내용을 그대로 두고 새 ID만 추가합니다. ‘가져온 기록으로 교체’는 같은 ID의 내용을 백업 내용으로 바꿉니다. 백업에 없는 현재 기록은 삭제하지 않습니다.<br>다른 ID의 중복 의심 기록은 합치지 않습니다. 적용 전 백업을 권장합니다.</p><button data-action="apply-import" class="pp-primary">확인한 내용 가져오기</button></div>`;if(source){const label=document.createElement('p');label.textContent='Drive 백업: '+source;preview.prepend(label);preview.scrollIntoView({behavior:'smooth',block:'start'});preview.querySelector('select')?.focus({preventScroll:true});}}
function download(blob,name){const u=URL.createObjectURL(blob),a=document.createElement('a');a.href=u;a.download=name;document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(u),30000);}
function backup(){download(new Blob([JSON.stringify({...state,exportedAt:new Date().toISOString()},null,2)],{type:'application/json'}),`seeya-passport-${P.today()}-${state.entries.length}entries.json`);try{localStorage.setItem('seeya-passport-backup-date',P.today());localStorage.setItem('seeya-diary-backup-snapshot',backupSnapshot());}catch{}say('백업 다운로드를 요청했어요. 파일 저장을 확인해 주세요.');}
function render(){say('');importRequest++;if(driveCleanup){driveCleanup();driveCleanup=null;}if(makerCleanup){makerCleanup();makerCleanup=null;}if(location.hash.startsWith('#view=')){viewShare(location.hash.slice(6));return;}document.querySelector('.pp-tabs').hidden=false;document.querySelectorAll('.pp-tabs a').forEach(a=>{const active=location.hash.startsWith('#make')?'#make':location.hash.startsWith('#new')?'#new':location.hash;const selected=new URL(a.href).hash===active;if(selected)a.setAttribute('aria-current','page');else a.removeAttribute('aria-current');});if(P.beforeDebut(state.profile.since))say('기존 입덕일이 데뷔일 이전이에요. 신분 카드에서 날짜를 수정해 주세요. 기존 기록은 그대로 보관했습니다.');renderedHash=location.hash;if(exportURL){URL.revokeObjectURL(exportURL);exportURL='';}pendingImport=null;const h=location.hash.slice(1);if(h==='make'||h.startsWith('make=')||h.startsWith('make?'))makerCleanup=Maker(app,state,catalog,say,download,h.startsWith('make=')?h.slice(5):'',{month:new URLSearchParams(h.split('?')[1]||'').get('month'),dirty:v=>dirty=v});else if(h==='share')sharePage();else if(h==='month')monthPage();else if(h==='tour')app.innerHTML=linkBack()+tour();else if(h==='goods'){filterKind='goods';page=1;home();}else if(h==='settings')settings();else if(h==='profile')editProfile();else if(h==='new'||h.startsWith('new?'))editor(null,new URLSearchParams(h.split('?')[1]||''));else if(h.startsWith('edit=')){const e=state.entries.find(x=>x.entryId===h.slice(5));if(e)editor(e);else detail(h.slice(5));}else if(h.startsWith('entry='))detail(h.slice(6));else {if(!h&&filterKind==='goods')filterKind='';home();}}
app.addEventListener('click',ev=>{const b=ev.target.closest('button');if(!b||!store)return;if(b.dataset.complete){const row=state.entries.find(e=>e.entryId===b.dataset.complete);if(row&&save({...state,entries:state.entries.map(e=>e===row?{...e,status:'done',updatedAt:new Date().toISOString()}:e)})){render();say('완료한 기록으로 바꿨어요.');}return;}if(b.dataset.action==='copy-summary'){copyText(X.summaryText(state));return;}if(b.dataset.event){go('#new?event='+encodeURIComponent(b.dataset.event));return;}if(b.dataset.page){page=Number(b.dataset.page);home();return;}if(b.dataset.delete){if(save({...state,entries:state.entries.filter(x=>x.entryId!==b.dataset.delete)})){go('');setTimeout(()=>say('기록을 삭제했어요.'),0);}return;}switch(b.dataset.action){case 'backup-later':try{localStorage.setItem('seeya-diary-backup-snooze',backupSnapshot());}catch{}home();break;case 'view':listMode=!listMode;home();break;case 'show-delete':document.getElementById('ppDelete').hidden=false;break;case 'backup':backup();break;case 'delete-all':if(document.getElementById('ppDeleteAllText').value!=='삭제'){say('확인란에 ‘삭제’를 입력해 주세요.');break;}if(save(P.empty())){Maker.clearDraft();go('');setTimeout(()=>say('이 브라우저의 개인 수첩을 비웠어요.'),0);}break;case 'apply-import':if(pendingImport){try{const counts=P.review(state,pendingImport),replace=document.getElementById('ppImportMode').value==='replace',next=P.merge(state,pendingImport,replace,document.getElementById('ppImportProfile').checked);if(save(next)){go('');setTimeout(()=>say('새 기록 '+counts.added+'건 추가 · 기존 기록 '+counts.conflicts+'건 '+(replace?'교체':'유지')+' · 다른 ID의 기록은 유지했어요.'),0);}}catch(e){say(e.message);}}break;}});
app.addEventListener('change',e=>{if(e.target.id==='ppStatusFilter'){filterStatus=e.target.value;page=1;home();}if(e.target.id==='ppMemberFilter'){filterMember=e.target.value;page=1;home();}if(e.target.id==='ppKindFilter'){filterKind=e.target.value;page=1;home();}if(e.target.id==='ppYearFilter'){filterYear=e.target.value;page=1;home();}});
function confirmDiscard(leave){
 if(document.getElementById('ppDiscard'))return;
 const panel=document.createElement('div');panel.id='ppDiscard';panel.className='pp-discard';panel.setAttribute('role','dialog');panel.setAttribute('aria-modal','true');panel.setAttribute('aria-labelledby','ppDiscardTitle');
 panel.innerHTML='<div class="pp-panel"><h2 id="ppDiscardTitle">아직 저장하지 않은 입력이 있어요.</h2><p>이동하면 지금 작성 중인 내용은 사라집니다.</p><div class="pp-actions"><button id="ppStay">계속 작성</button><button id="ppLeave">저장하지 않고 이동</button></div></div>';
 if(makerCleanup){panel.querySelector('h2').textContent='이미지 편집을 마치고 이동할까요?';panel.querySelector('p').textContent='문구·배치는 이 탭에 임시 보관합니다. 사진은 이 탭에서 이동할 때만 유지되며 새로고침하거나 닫으면 다시 선택해야 해요.';panel.querySelector('#ppLeave').textContent='초안 남기고 이동';}const prior=document.activeElement;document.querySelector('.passport-page').append(panel);
 const stay=panel.querySelector('#ppStay'),exit=panel.querySelector('#ppLeave');stay.focus();
 stay.onclick=()=>{panel.remove();prior?.focus();};exit.onclick=()=>{panel.remove();dirty=false;leave();};
 panel.addEventListener('keydown',e=>{if(e.key==='Escape'){e.preventDefault();stay.click();}if(e.key==='Tab'){e.preventDefault();(document.activeElement===stay?exit:stay).focus();}});
}
document.addEventListener('click',e=>{if(!dirty)return;const a=e.target.closest('a');if(a&&!a.hasAttribute('download')&&a.target!=='_blank'){e.preventDefault();confirmDiscard(()=>location.href=a.href);}});
window.addEventListener('beforeunload',e=>{if(dirty||makerCleanup?.hasPhotos()){e.preventDefault();e.returnValue='';}});
window.addEventListener('hashchange',()=>{if(dirty){const target=location.hash;history.replaceState(null,'',location.pathname+location.search+renderedHash);confirmDiscard(()=>{location.hash=target;});return;}dirty=false;if(!store&&!location.hash.startsWith('#view=')){try{store=P.storage(localStorage);state=store.get();}catch{say('수첩 저장소를 열지 못했어요.');return;}}render();});
window.addEventListener('storage',e=>{if(e.key!==P.KEY)return;if(dirty){say('다른 창에서 수첩이 변경됐어요. 작성 중인 내용을 복사한 뒤 새로고침해 주세요.');return;}try{store=P.storage(localStorage);state=store.get();render();say('다른 화면에서 저장한 기록을 반영했어요.');}catch{say('변경된 기록을 읽지 못했어요. 새로고침해 주세요.');}});
try{if(location.hash.startsWith('#view=')){viewShare(location.hash.slice(6));}else{store=P.storage(localStorage);state=store.get();render();}}catch(e){say('저장소를 열지 못했습니다. 기존 기록을 덮어쓰지 않았어요.');app.innerHTML='<section class="pp-panel"><h2>기록 보호를 위해 수첩을 멈췄어요.</h2><p>브라우저의 사이트 저장 허용 여부를 확인해 주세요. 저장 내용이 손상된 경우 원본을 먼저 내려받아 보관할 수 있습니다.</p><button id="ppRecover">저장 원본 내려받기</button></section>';document.getElementById('ppRecover').onclick=()=>{try{const raw=localStorage.getItem(P.KEY);if(raw)download(new Blob([raw],{type:'text/plain'}),'seeya-passport-recovery.txt');else say('저장된 원본이 없습니다.');}catch{say('저장소에 접근할 수 없습니다. 브라우저 설정을 확인해 주세요.');}};}
if('serviceWorker' in navigator&&window.isSecureContext){navigator.serviceWorker.register('/diary/sw.js',{scope:'/diary/',updateViaCache:'none'}).then(reg=>{const report=event=>{document.getElementById('ppOffline').textContent=event?.target?.state==='redundant'?'오프라인 준비에 실패했어요. 인터넷 연결을 확인하고 다시 열어 주세요.':reg.active?'오프라인 수첩이 준비됐어요. 공개 일정은 마지막 저장본을 사용합니다.':'오프라인 수첩을 준비하고 있어요. 이 화면을 잠시 열어 두세요.';};report();if(reg.installing)reg.installing.addEventListener('statechange',report);reg.addEventListener('updatefound',()=>reg.installing?.addEventListener('statechange',report));}).catch(()=>document.getElementById('ppOffline').textContent='오프라인 준비를 못 했어요. 연결된 상태에서 다시 열어 주세요.');}else document.getElementById('ppOffline').textContent='이 환경은 오프라인 수첩을 지원하지 않습니다.';

},
"src/data/passport-brand.json":function(module,exports,__require){
module.exports={"logo":"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAA1IAAADPCAMAAADI6BA1AAAABGdBTUEAALGPC/xhBQAAAAFzUkdCAK7OHOkAAAAbUExURUxpcWBhYWBhYWBhYWBhYWBhYWBhYWBhYWBhYdFAEKwAAAAIdFJOUwAZ0e64RGGG3E8CEgAADElJREFUeNrt3dty5CgQBNAGcdH/f/F6vRsTc3F7VKgSslDy7GjTQHIEQurXS0Vl81LOM6sVVFS8Sj3O82xqBxUVP6SexFRSIS9kg2AQqd2ZSqm21stHySrspeMVwdbmE6kPptKuaaofWcr/zRsqEcpR0UsdS23qKFJ7MpVqLwpTuFJmLHVwdfnx8dsxlZriJKYWIrUZU8qTmFqN1FZMpZ41LsXUaqT2YaoKKDH1vuRpSO3CVCoakWJqHVK/fkDb4ZJP41FMsSC1A1NNl3xi6vsRgq3EHwZ2XfOp7M3UXKSiMyWixBQbUqGZ0ipKTPEhFZmpqjtRm5W6BVJxmVKixBQlUh/RjMlU1TJKTHEiFZQpbUyIqSvL7RVIxWRKRokpb6RON6QiMqVEiSkGpN5+fDimkhIlptyRSn5IxWNKe33blrwFUuGY0h3ejUuLg9S3Hx+KqaZxJ6bIkYrFlBZSYsr/auZI3lN7IKZ09lxM+SPVnZGKxJQu+8RUBKTiMJW02yemGJD6+8dHYUq7fWIqBlJRmBJSYgqwi9UhAzEGU0JKTEVBKgZTQuoZTKUdkIrBlLb7xFQcpEIwpXtSYioOUhN+5Od20TMdYioSUvgf+dHmhMocpkiQCsCUNifEVCik6JkaOTB75FJ68ysXO+to68rFiafX2aXMYooGKXqmzPt9R+k1LYn1yu3TMsOBoaXwCR3pY0jlhB2H3EwVa6DqMikVqbsdeIMpIqTImTLe5y2Q76JI8TPFhBQ3U8k0OXTMoFak6JmiQoqbKdOLQ1EDRpGiZ4pnu4+eqU6QKEVqHlODbQhG6mXfduZlqsy4DleksEwdcKbASA0cN6BlynANC/wOihQ5U+DQDr1MiJWp618GuSBUpMiZMmUWayA9U4ngsk+RYmfKFNkGnNcjMJUYkFKkyJliRIqWqUpRf0Vq4satvRk5kWJlqjJc9ylS3EyB7yUPP13EyVSjmBEUKWamWJEiZaqhLhYUKdatWzNTrEiRMnU5Ui9FijpSOKZ4keJk6mqksiJFHikYU7xIcTKlSO0SKRRTzEhRMlUVqV0iBWKKGSlKphSpbSKFYcr05Mh0pBiZutpi2p7gj5RpeBbf770IKfRcP9QN2kTfJlI2pqrrlLsKqcUtfus76VYvfwcDmLIgVRYgRcjU5eeldCApwJzpzhQ/UoRMFedrb0VqJ6aKO3veSLn8yM+aiQ06nBUpTqYiIMXH1OVzs3oEMUD3OjOVAyDFx1RlqLgiRcmUCamKzX8gpq6/z6UpUvy968pUDKT4mCoEFVekGJlCI3W6FTKmrr/nU+/xC9C5yY+WKEjRMVUJXjumSK1h6ltbWhik2JgyTGuwyUCRImQKjJTrj66TMdWhLadI8V7Jf6tLJKTYmLI8Y9YUKfqudWIqElJ0TBm+HWg5pUitYqovQqoe585MteWzgSK1iKm3LZpIkMqX/zDqBgVoJ12RWjRH0iPVakymOrb9FCnWOZIfqXT5Tw+q1ZTpFAui6orUGqb4kTKc4QjMVFGk2Pv1IjI5AFLGP47JFGDYKFJLmKJH6rOCHL+EgWXKfyddkfIueRukXk9YTfkTq0itYKp5IHWgkXoGU+51V6QWMEWP1I/uziGZMp0/OY+mSJFHqvEiZZ64W0ymTM+beV/6KVLz50gfpDqsJX/q7cs1invSz30n/epSrtwvFds8+X4N+xymmscaYApSYZkyvlyjLfzfd0qdMuPcKWUKU4GQisuU6WaE7066IgWIVJ2AVJqCVFimjKPGc0JQpBDX1Hnk4HY6+JDyOLW46NLPtOvnOSEoUohI1W2QMlSLjCnbrp/jckqRguz8lF2QisuU8YavX+0VKUik6jZIxWXKeOlXFCnqSL2t9DKkxq25XDM2puqanXRFChOpam0EFqTKjaqRMWXcSfd6xFeRAt1FLzGROtONuh1Rf2/KdSddkQJFqlIh1W41QVimluykK1KgSH1Z7UKPVL1VOzqmViynFClUpL7qzZhIBWZqxU66IoWK1Bf1DopUZKYWnElXpGCR+pOpqEgZ+oCOqfnLKUUKFqk/Kh4WKcOahI8p23LK4Uy6IoWL1O+dGRepyExN30lXpHCR+q3mq5BK2aGHrh9CpWPKOIC6IkUcqV+YOiIjFZqpyY/4KlLASP1S9dBIGZjiW01ZH/FNihRvpH5iygepvAopQzcUukgZl1NFkeKN1E91Ly47Um0VUrGZmrqTrkhBI/WjecMjFZupmTvpihR2LJRdkLIwVfkyZVtO3dpJV6Swkfq/fd+PssKC1N8/OwdmauJOuiIFHgr9+y6iQao5xpORKeNyqilStJH6bGB+pK58dgrNlHE5lRQp1kh9MtVvr08IkArO1LSddEUKHamPFn4/5UVCKjpTadJySpGCD4S+C1LRmbItp4a/giIFj1TKq5Dq3p8dm6lXm/KLo4oUfhzUXZCKztSc5ZQitXBqjYZUeKam7KQrUuuGARqpA/DZHd7d2ExN2ElXpNZFyoTUiwGp8EwZDyYVRSpUpCIiFZ4p42hqwEjl++Uxv9UbDCnb5c31pHIyZdxJT7BI6Rfl90Wqg6JKypTtYFJRpOKUmEjFZ8q4k94UqS2Rqqh+HTl4E50p23LKfvNCkRJSsLSSMmVbTnVFSkhhkdqAKdNyyjz0FSl+pApw1I907PURmUlbvyOZUqSWlBYYKct8QMqU6TkP0P6NIiWkRq5aWZlCvo5UkRJSD2TK1APGwa9IsW858SG1A1Om5VRXpIQUFikLU22DaQ1yZEuRElKbMWXZSW+KlJDCIrUDU5ZuKIqUkEJ36gZMWbZdkyK1C1IDr3CoM5DaginDTnpTpIQUJK5jTKX4k1tRpIQU/FBrjs/U9e9gGf+KlJBCTw28TF2ntipSQgr95EV6FFNdkYrfiWOjvsxCag+mGqArFKm9kDpnIbUJU1dRPxSp6F3Ij9QeTF1tMEMAFCkh9WSmLndIVaQ4t/uAj+lMR8pympuWqeo/KShSM0vfCaktmEr+E5wi9USkvJ4M3ICpQ5GKHCkTUvYWn40U7JTczJIVqcCRMh2ciIDUDkxl91lIkRJSj2ZKkQocqQ2RskwTBydThyIVN1I0SHk+FGhgqlPOc6ciFTZS2233bcFUVaTiRgqN1KK3KgdnqitSYSPFg1Rb0j2kTAGe7lCktJK6eekUmal6KlJRI7UtUrGZQjSbIvU0pNK6mZ6OKUPVFSkhNa+ZwjJluVOohzuE1LxzQWGZKpBOUaSE1EOZSqZ57qVIhUUqR0MqKFPJ9sPyipSQmtlIAZlqlj7RG5IehtT616pEYyq1fNqK3uMnpOa2UQ7EVGrlOK1Fb5vVSmruY4ANMGdU/9J6H4iTbXficqQ6vrR7kSoTqjg0JNOJRSoTXHQlf6bS0NgHFcAvd8wo79q68LRsAyobdyWFYaoTJco0GSlSoCvqMaRaTKQATFEhhfgVREVqWCkapLDrYW+mqJAynd5XpMBKVXBkOZByZ4oLqa5IESn1EKS8maJCynTdp0iBlaoHNrEsSDkzxYWU7SVtihRWqccgZYKlx0KqKlI8Sj0HKVemuJAyvlpAkYIqVXA9x4aUJ1NcSDVFikepJyFlG0vJ7VYe2UpKkcIqRYPUOeWMZncap4UqUlWR4mldMFKJCyk3priQ6i9FikephyHlxRQVUvZtWEUKpxQPUmVOokyjqbqcNyG8b6JI4dr3cUiZvnIJgVR/KVI8SoFP9xEiZYO5OtgO3+1LihSRUpZ6F+S65ajTIuXAFBNSQ0+YKVIopSrqg4mRMn3rr5POhNTYXKRIoZSiQeqciNR9pkr0RClSKKWeidRtpoiQGr1eVqRASj0UqbtMlfCJUqRASj0VqZtM8SA1/u4bRQqj1GORuscUTV+X8Vt5ihSEEzRSBzKv65hiQeq4855VRQqilOWV25shdYcpkq4utxpNkUJ40s7xmTo6UjaiK9/pvuPmq8AVKYRSj0bK9PULW08f/e6BSEUKoNSzkbJ9/0qF1FHuz0GKFECphyNl+lnpQtTRR/doL0XKX6mnIzXI1GqkcvN5BkaR8leKB6lVv7k1xNTSfs69ej1Upki5K8WDVH694jC1DqnDMU+KFECpJKSGmCqr4tScn3lWpLyVat4fGBAp28st6xqkjtJbBbxCQJFyVkpImZshWxegN8bYkXMp/d8swd7HESFSB02pzkilXZGyMvUPd42NHc7RGbMAAAAASUVORK5CYII="};
},
"src/shared/passport.js":function(module,exports,__require){
'use strict';
const G=__require("src/shared/passport-goods.js"),Play=__require("src/shared/passport-play.js"),Concert=__require("src/shared/concert-diary.js");
const KEY='seeya-passport-v1';
const DEBUT='2006-03-12';
const defaultStatus=(date,day=today())=>date&&date<day.slice(0,date.length)?'done':'planned';
const beforeDebut=since=>!!since&&since<DEBUT.slice(0,since.length);
const KINDS={concert:'공연 관람',visit:'장소 방문',event:'팬 행사',story:'나의 씨야 이야기',goods:'굿즈 구매',play:'씨야 플레이'};
const MEMBERS={seeya:'씨야 완전체',gyuri:'남규리',yeonji:'김연지',boram:'이보람'};
const COLORS={rose:'#ac365f',violet:'#6856af',teal:'#267866',ink:'#29242d'};
const esc=x=>String(x??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const today=()=>new Intl.DateTimeFormat('sv-SE',{timeZone:'Asia/Seoul'}).format(new Date());
function text(x,max=200){if(typeof x!=='string'||x.length>max)throw Error('글자 수나 입력 형식이 맞지 않습니다.');return x.trim();}
function date(value){
 if(value==='')return '';
 if(typeof value!=='string'||!/^\d{4}(-\d{2}){0,2}$/.test(value))throw Error('날짜 형식을 확인해 주세요.');
 const [y,m,d]=value.split('-').map(Number);if(y<1900||y>2100||m!==undefined&&(m<1||m>12)||d!==undefined&&(d<1||d>new Date(Date.UTC(y,m,0)).getUTCDate()))throw Error('실제 존재하는 날짜를 입력해 주세요.');return value;
}
const precision=d=>['none','year','month','day'][d?d.split('-').length:0];
const dateLabel=d=>d?d.split('-').map((x,i)=>Number(x)+['년','월','일'][i]).join(' '):'날짜 미상';
function profile(p={},allowLegacy=false){if(!p||typeof p!=='object'||Array.isArray(p))throw Error('신분 카드 형식이 올바르지 않습니다.');const since=date(p.since||'');if(!allowLegacy&&beforeDebut(since))throw Error('처음 좋아한 날은 데뷔일인 2006년 3월 12일부터 입력할 수 있어요.');if(since>today().slice(0,since.length))throw Error('입덕일은 오늘 이전으로 입력해 주세요.');return {nickname:text(p.nickname||'',30),since,motto:text(p.motto||'',120),favMember:Object.hasOwn(MEMBERS,p.favMember)?p.favMember:'seeya',favSong:text(p.favSong||'',160),color:Object.hasOwn(COLORS,p.color)?p.color:'rose'};}
function entry(e){
 if(!e||typeof e!=='object'||!Object.hasOwn(KINDS,e.kind)||!['planned','done'].includes(e.status)||typeof e.entryId!=='string'||!/^[-a-zA-Z0-9]{8,80}$/.test(e.entryId))throw Error('기록 형식이 올바르지 않습니다.');
 const title=text(e.title,160);if(!title)throw Error('제목을 입력해 주세요.');
 const dt=date(e.date||'');if(!Array.isArray(e.members)||e.members.length>4||e.members.some(m=>!Object.hasOwn(MEMBERS,m)))throw Error('멤버 정보가 올바르지 않습니다.');
 if(e.status==='done'&&dt>today().slice(0,dt.length))throw Error('미래 날짜는 예정 상태로 저장해 주세요.');
 const time=text(e.time||'',5);if(time&&!/^([01]\d|2[0-3]):[0-5]\d$/.test(time))throw Error('시간을 확인해 주세요.');
 for(const k of ['createdAt','updatedAt'])if(typeof e[k]!=='string'||!/^\d{4}-/.test(e[k])||!Number.isFinite(Date.parse(e[k])))throw Error('기록 저장 시각이 올바르지 않습니다.');
 const snap=e.snapshot||{};
 const songs=e.songs||[],links=e.links||[];
 if(!Array.isArray(songs)||songs.length>400||songs.some(s=>typeof s!=='string'||s.length>180))throw Error('곡 목록을 확인해 주세요.');
 if(!Array.isArray(links)||links.length>8)throw Error('링크는 최대 8개까지 저장할 수 있어요.');
 const checkedLinks=links.map(l=>{const raw=text(l.url,2000),u=new URL(raw);if(u.protocol!=='https:'||u.username||u.password)throw Error('링크는 https:// 주소로 입력해 주세요.');return {url:u.href,label:text(l.label||'',120)};});
 return {entryId:e.entryId,kind:e.kind,status:e.status,title,date:dt,datePrecision:precision(dt),time,members:[...new Set(e.members)],eventId:text(e.eventId||'',160),placeId:text(e.placeId||'',160),archiveId:text(e.archiveId||'',160),songs:e.kind==='concert'?[...new Set(songs)]:[],links:checkedLinks,seat:text(e.seat||'',100),companions:text(e.companions||'',120),note:text(e.note||'',4000),...(e.kind==='goods'?{goods:G.clean(e.goods)}:{}),...(e.kind==='play'?{play:Play.clean(e.play),...(e.concertPoster?{concertPoster:Concert.clean(e.concertPoster)}:{})}:{}),snapshot:{title:text(snap.title||'',300),place:text(snap.place||'',300),address:text(snap.address||'',400)},createdAt:e.createdAt,updatedAt:e.updatedAt};
}
function validate(input,allowLegacyProfile=false){
 if(!input||input.schemaVersion!==1||!Array.isArray(input.entries)||input.entries.length>2000)throw Error('지원하지 않는 백업이거나 기록이 2,000건을 넘습니다.');
 const entries=input.entries.map(entry);if(new Set(entries.map(e=>e.entryId)).size!==entries.length)throw Error('파일 안에 동일한 기록 ID가 반복됩니다.');
 return {schemaVersion:1,profile:profile(input.profile,allowLegacyProfile),entries};
}
const empty=()=>({schemaVersion:1,profile:profile(),entries:[]});
function duplicate(a,b){if(a.kind==='goods'||b.kind==='goods')return a.kind===b.kind&&a.date===b.date&&G.same(a,b);return a.kind===b.kind&&a.date===b.date&&a.time===b.time&&((a.eventId&&a.eventId===b.eventId)||(a.archiveId&&a.archiveId===b.archiveId)||(a.placeId&&a.placeId===b.placeId)||(!a.eventId&&!a.placeId&&!b.eventId&&!b.placeId&&a.title===b.title));}
function review(current,incoming){return {added:incoming.entries.filter(e=>!current.entries.some(x=>x.entryId===e.entryId)).length,conflicts:incoming.entries.filter(e=>current.entries.some(x=>x.entryId===e.entryId)).length,suspected:incoming.entries.filter(e=>current.entries.some(x=>x.entryId!==e.entryId&&duplicate(x,e))).length};}
function merge(current,incoming,replace=false,replaceProfile=false){const rows=new Map(current.entries.map(e=>[e.entryId,e]));for(const e of incoming.entries)if(replace||!rows.has(e.entryId))rows.set(e.entryId,e);return validate({schemaVersion:1,profile:replaceProfile?incoming.profile:current.profile,entries:[...rows.values()]});}
function completed(e,day=today()){return e.status==='done'&&(!e.date||e.date<=day.slice(0,e.date.length));}
function summary(entries,day=today()){const done=entries.filter(e=>completed(e,day));return {concert:done.filter(e=>e.kind==='concert').length,visit:done.filter(e=>e.kind==='visit').length,event:done.filter(e=>e.kind==='event').length,story:done.filter(e=>e.kind==='story').length,goods:done.filter(e=>e.kind==='goods').length,play:done.filter(e=>e.kind==='play').length};}
function storage(adapter){let raw=adapter.getItem(KEY),state=raw?validate(JSON.parse(raw),true):empty();return {get:()=>state,raw:()=>raw,save(next){const checked=validate(next);if(adapter.getItem(KEY)!==raw)throw Error('다른 창에서 수첩이 변경됐습니다. 입력 내용을 복사한 뒤 새로고침해 주세요.');const value=JSON.stringify(checked);adapter.setItem(KEY,value);raw=value;state=checked;return state;}};}
module.exports={KEY,DEBUT,defaultStatus,beforeDebut,KINDS,MEMBERS,COLORS,esc,today,date,precision,dateLabel,profile,entry,validate,empty,duplicate,review,merge,completed,summary,storage};

},
"src/shared/passport-goods.js":function(module,exports,__require){
'use strict';
function clean(value={}){
 if(!value||typeof value!=='object'||Array.isArray(value))throw Error('굿즈 정보를 확인해 주세요.');
 const str=(v,max)=>{if(typeof v!=='string'||v.length>max)throw Error('굿즈 정보의 글자 수를 확인해 주세요.');return v.trim();};
 const quantity=value.quantity??1,amount=value.amount??null;
 if(!Number.isInteger(quantity)||quantity<1||quantity>999)throw Error('수량은 1~999개의 정수로 입력해 주세요.');
 if(amount!==null&&(!Number.isInteger(amount)||amount<0||amount>999999999))throw Error('결제금액은 0~999,999,999원의 정수로 입력해 주세요.');
 return {catalogId:str(value.catalogId||'',80),quantity,amount,shop:str(value.shop||'',160),variant:str(value.variant||'',100)};
}
function same(a,b){
 const x=a.goods||{},y=b.goods||{};
 return (x.catalogId&&y.catalogId?x.catalogId===y.catalogId:a.title===b.title)&&(x.variant||'')===(y.variant||'')&&(x.shop||'')===(y.shop||'');
}
function totals(entries,day=new Intl.DateTimeFormat('sv-SE',{timeZone:'Asia/Seoul'}).format(new Date())){const rows=entries.filter(e=>e.kind==='goods'&&e.status==='done'&&(!e.date||e.date<=day.slice(0,e.date.length)));return {records:rows.length,quantity:rows.reduce((n,e)=>n+(e.goods?.quantity||1),0)};}
function eventValues(event){return {eventId:event.id,placeId:event.placeId||'',archiveId:event.archiveId||'',snapshot:{title:event.title,place:event.venue||'',address:''}};}
module.exports={clean,same,totals,eventValues};

},
"src/shared/passport-play.js":function(module,exports,__require){
'use strict';
const GAMES={lyrics:'가사 보고 제목 맞히기',exam:'씨야 모의고사',other:'기타 씨야 플레이'};
function clean(p={}){
 if(!p||typeof p!=='object'||!Object.hasOwn(GAMES,p.game))throw Error('플레이 종류를 선택해 주세요.');
 const text=(s,n)=>{if(typeof s!=='string'||s.length>n)throw Error('플레이 정보를 확인해 주세요.');return s.trim();};
 const number=v=>{if(v==null||v==='')return null;if(!Number.isInteger(v)||v<0||v>10000)throw Error('점수·정답 수는 0 이상의 정수로 입력해 주세요.');return v;};
 const score=number(p.score),maxScore=number(p.maxScore),correct=number(p.correct),total=number(p.total);
 if((score!==null&&maxScore===null)||maxScore===0||score>maxScore)throw Error('점수와 만점을 함께 확인해 주세요.');
 if((correct!==null&&total===null)||total===0||correct>total)throw Error('정답 수와 전체 문항 수를 함께 확인해 주세요.');
 return {game:p.game,level:text(p.level||'',80),mode:text(p.mode||'',30),score,maxScore,correct,total,source:p.source==='result'?'result':'manual'};
}
function summary(p){if(!p)return '';return [p.level,p.mode,p.score==null?'':`${p.score} / ${p.maxScore}점`,p.correct==null?'':`정답 ${p.correct} / ${p.total}개`].filter(Boolean).join(' · ');}
module.exports={GAMES,clean,summary};

},
"src/shared/concert-diary.js":function(module,exports,__require){
'use strict';
const D=__require("src/shared/my-concert-design.js");
const sections={opening:3,main:25,encore:4};
function clean(value){
 if(!value||value.version!==1)throw Error('콘서트 포스터 형식을 확인해 주세요.');
 const text=(v,max)=>{if(typeof v!=='string'||v.length>max)throw Error('콘서트 포스터 내용을 확인해 주세요.');return v;};
 const d=value.draft;if(!d||!Object.hasOwn(D.themes,d.theme)||!Object.hasOwn(D.fonts,d.font))throw Error('포스터 배경·글꼴을 확인해 주세요.');
 const ids=[];const checked={};
 for(const [key,max] of Object.entries(sections)){
  const list=d.sections?.[key];if(!Array.isArray(list)||!list.length||list.length>max)throw Error('포스터 곡 수를 확인해 주세요.');
  checked[key]=list.map(id=>{text(id,100);if(!/^[-a-zA-Z0-9]+$/.test(id)||ids.includes(id))throw Error('포스터 곡 정보를 확인해 주세요.');ids.push(id);return id;});
 }
 if(!Array.isArray(value.songs)||value.songs.length>32)throw Error('포스터 곡 목록을 확인해 주세요.');
 const songs=value.songs.map(s=>({id:text(s.id,100),title:text(s.title,300),artistType:s.artistType==='solo'?'solo':'group',artistNames:Array.isArray(s.artistNames)&&s.artistNames.length<=4?s.artistNames.map(n=>text(n,100)):[]}));
 if(new Set(songs.map(s=>s.id)).size!==songs.length||ids.some(id=>!/^hidden-[0-9a-z-]+$/.test(id)&&!songs.some(s=>s.id===id)))throw Error('포스터의 곡 제목이 빠져 있어요.');
 if(!Array.isArray(d.vcrs)||d.vcrs.length>64||d.vcrs.some(v=>!Number.isInteger(v.after)||v.after<1||v.after>=ids.length))throw Error('포스터 VCR 위치를 확인해 주세요.');
 return {version:1,draft:{title:text(d.title,120),planner:text(d.planner,80),theme:d.theme,font:d.font,format:D.outputFormat(d.theme,d.format),sections:checked,vcrs:d.vcrs.map(v=>({after:v.after}))},songs};
}
function snapshot(d,songs){const ids=Object.values(d.sections).flat();return clean({version:1,draft:d,songs:songs.filter(s=>ids.includes(s.id))});}
module.exports={clean,snapshot};

},
"src/shared/my-concert-design.js":function(module,exports,__require){
'use strict';
// Coordinates are in the exported 1080 × 1350 poster.
const themes = {
  curtain: {label:'커튼콜', left:102, right:978, top:152, bottom:1030, centered:true},
  skyline: {label:'도시의 밤', left:84, right:996, top:82, bottom:910, dark:true},
  blossom: {label:'벚꽃 무대', left:165, right:915, top:140, bottom:934, centered:true},
  paper: {label:'종이 셋리스트', left:108, right:972, top:106, bottom:1210},
  breeze: {label:'봄빛 편지', left:126, right:954, top:178, bottom:1160, centered:true},
  spotlight: {label:'세 개의 스포트라이트', left:96, right:984, top:128, bottom:1120, dark:true, centered:true},
  pressed: {label:'장미 편지', left:120, right:960, top:330, bottom:1010, centered:true},
  ribbon: {label:'핑크 리본', left:108, right:972, top:154, bottom:1190, centered:true},
  blueTicket: {label:'블루 티켓', left:114, right:978, top:120, bottom:1160, centered:true},
  rose: {label:'로즈 티켓', left:86, right:994, top:96, bottom:1170},
  night: {label:'나이트 스테이지', left:86, right:994, top:96, bottom:1170, dark:true}
};
const fonts = {
  dodum: {label:'고운돋움', family:'"Passport Dodum", sans-serif'},
  jua: {label:'배민 주아체', family:'"Concert Jua", sans-serif'},
  yeonsung: {label:'배민 연성체', family:'"Concert Yeon Sung", serif'},
  gaegu: {label:'개구체', family:'"Concert Gaegu", cursive'},
  pen: {label:'나눔손글씨 펜', family:'"Passport Pen", cursive'},
  batang: {label:'고운바탕', family:'"Passport Batang", serif'}
};
const formats={poster:'한 장 포스터',long:'읽기 편한 긴 이미지'};
const backdrop = key => ['curtain','skyline','blossom','paper','breeze','spotlight','pressed','ribbon','blueTicket'].includes(key) ? '/images/game/concert-poster-'+key+'.png' : '';
const allowsLong=theme=>!['curtain','blossom','pressed'].includes(theme);
const outputFormat=(theme,format)=>format==='long'&&allowsLong(theme)?'long':'poster';
module.exports = {themes, fonts, formats, backdrop, allowsLong, outputFormat};


},
"src/client/passport-picker.js":function(module,exports,__require){
'use strict';
// Editable combobox with manual selection (WAI-ARIA APG).
module.exports=function picker(input,list,info,events,onChoose,esc,labels={}){
 let matches=[],active=-1;
 const close=()=>{list.hidden=true;input.setAttribute('aria-expanded','false');input.removeAttribute('aria-activedescendant');active=-1;};
 function mark(i){active=i;[...list.children].forEach((el,n)=>el.setAttribute('aria-selected',String(n===i)));if(i>=0){input.setAttribute('aria-activedescendant',list.children[i].id);list.children[i].scrollIntoView({block:'nearest'});}else input.removeAttribute('aria-activedescendant');}
 function show(){const q=input.value.trim().toLowerCase(),terms=q.split(/\s+/).filter(Boolean);const all=events.filter(e=>terms.every(t=>(e.date+' '+e.title+' '+e.venue+' '+(e.city||'')).toLowerCase().includes(t)));matches=all.slice(0,30);active=-1;input.removeAttribute('aria-activedescendant');list.innerHTML=matches.map((e,i)=>`<div role="option" aria-selected="false" id="${esc(list.id)}-option-${i}" data-index="${i}"><span>${esc(e.date)}${e.time?' · '+esc(e.time):''}</span><strong>${esc(e.title)}</strong><small>${esc(e.venue||'장소 정보 없음')}</small></div>`).join('');list.hidden=!matches.length;input.setAttribute('aria-expanded',String(!!matches.length));info.textContent=all.length?(all.length>30?`${all.length}개 중 30개 표시 · 검색어로 좁혀 주세요.`:`${all.length}개 ${labels.noun||'일정'} · 선택하면 기록에 채워집니다.`):labels.empty||'일치하는 일정이 없어요. 아래에 직접 기록할 수 있습니다.';}
 function choose(i){if(!matches[i])return;const e=matches[i];input.value='';close();onChoose(e);info.textContent=labels.selected||'일정을 선택했어요. 제목과 날짜를 확인해 주세요.';}
 input.addEventListener('input',show);input.addEventListener('focus',show);input.addEventListener('click',()=>{if(list.hidden)show();});
 input.addEventListener('keydown',e=>{if(e.key==='ArrowDown'||e.key==='ArrowUp'){e.preventDefault();if(list.hidden)show();if(matches.length)mark(active<0?(e.key==='ArrowDown'?0:matches.length-1):Math.max(0,Math.min(matches.length-1,active+(e.key==='ArrowDown'?1:-1))));}else if(e.key==='Enter'&&!list.hidden){e.preventDefault();if(active>=0)choose(active);}else if(e.key==='Escape'){e.preventDefault();close();}else if(e.key==='Tab')close();});
 input.addEventListener('blur',close);
 list.addEventListener('pointerdown',e=>{if(e.target.closest('[role=option]'))e.preventDefault();});
 list.addEventListener('click',e=>{const row=e.target.closest('[role=option]');if(row)choose(Number(row.dataset.index));});
 return {close};
};

},
"src/client/play-passport.js":function(module,exports,__require){
'use strict';
const S=__require("src/shared/passport-play-save.js");
function mount(host,record=null){
 host.innerHTML=`<section class="play-passport"><label><input type="checkbox" data-play-auto> 씨야 플레이 완료 결과를 다이어리에 자동 저장</label><p>이 기기에서만 저장합니다. 모의고사·가사 퀴즈에 함께 적용되며 이름·답안은 저장하지 않아요.${record?' 지금 켜면 이 결과부터 저장해요.':''}</p>${record?'<button type="button" data-play-save>이 결과만 다이어리에 저장</button>':''}<a href="/diary/${record?'':'#new?kind=play'}">${record?'다이어리 보기':'플레이 기록 직접 남기기'} →</a><p data-play-status role="status"></p></section>`;
 const check=host.querySelector('[data-play-auto]'),button=host.querySelector('[data-play-save]'),status=host.querySelector('[data-play-status]');let busy=false;
 try{check.checked=S.enabled(localStorage);}catch{check.disabled=true;status.textContent='이 브라우저의 저장소를 사용할 수 없어요.';}
 async function save(){
  if(!record||busy)return;busy=true;if(button)button.disabled=true;
  try{
   const task=()=>S.save(localStorage,record),saved=navigator.locks?await navigator.locks.request('seeya-passport-save',task):task();
   status.textContent=saved.already?'이미 저장한 결과입니다.':'다이어리에 결과를 저장했어요.';
   const a=host.querySelector('a');a.href='/diary/#entry='+encodeURIComponent(saved.id);a.textContent='저장한 기록 보기 →';
   if(button)button.textContent='저장 완료';
  }catch(e){status.textContent='저장하지 못했어요. '+e.message;if(button)button.disabled=false;}finally{busy=false;}
 }
 check.addEventListener('change',()=>{try{S.preference(localStorage,check.checked);status.textContent=check.checked?'완료 결과 자동 저장을 켰어요.':'앞으로의 자동 저장을 껐어요. 기존 기록은 유지됩니다.';if(check.checked&&record)save();}catch{check.checked=false;status.textContent='설정을 저장하지 못했어요. 브라우저의 사이트 저장 허용 여부를 확인해 주세요.';}});
 button?.addEventListener('click',save);
 if(record&&check.checked)save();
}
module.exports={mount,result:S.result};

},
"src/shared/passport-play-save.js":function(module,exports,__require){
'use strict';
const P=__require("src/shared/passport.js"),Play=__require("src/shared/passport-play.js");
const PREF='seeya-passport-play-auto-v1';
const enabled=adapter=>adapter.getItem(PREF)==='true';
const preference=(adapter,value)=>adapter.setItem(PREF,value?'true':'false');
function result(id,details,at=new Date()){
 const play=Play.clean({...details,source:'result'}),date=new Intl.DateTimeFormat('sv-SE',{timeZone:'Asia/Seoul'}).format(at),time=new Intl.DateTimeFormat('en-GB',{timeZone:'Asia/Seoul',hour:'2-digit',minute:'2-digit'}).format(at);
 return P.entry({entryId:'play-'+id,kind:'play',status:'done',title:Play.GAMES[play.game]+(play.level?' · '+play.level:''),date,time,members:['seeya'],play,snapshot:{},createdAt:at.toISOString(),updatedAt:at.toISOString()});
}
// Read the newest notebook on each save. A result ID belongs to one completed run.
function save(adapter,record){
 const checked=P.entry(record),store=P.storage(adapter),state=store.get();
 if(state.entries.some(e=>e.entryId===checked.entryId))return {id:checked.entryId,already:true};
 store.save({...state,entries:[...state.entries,checked]});return {id:checked.entryId,already:false};
}
module.exports={PREF,enabled,preference,result,save};

},
"src/shared/passport-calendar.js":function(module,exports,__require){
'use strict';
const P=__require("src/shared/passport.js");
function selectedEvent(event,requested='',today=P.today()){
 if(!event)return undefined;
 let day=event.date;
 if(event.annual){
  const candidate=requested||today.slice(0,4)+event.date.slice(4);
  try{if(P.date(candidate).length===10&&candidate.slice(4)===event.date.slice(4)&&candidate>=event.date)day=candidate;}catch{}
 }else if(requested){try{if(P.date(requested).length===10&&requested>=event.date&&requested<=(event.rangeEndDate||event.endDate||event.date))day=requested;}catch{}}
 return {...event,date:day};
}
module.exports={selectedEvent};

},
"src/shared/passport-extra.js":function(module,exports,__require){
'use strict';
const P=__require("src/shared/passport.js");
function songs(entries){return [...new Set(entries.filter(e=>e.kind==='concert'&&P.completed(e)).flatMap(e=>e.songs||[]))];}
function tourEntries(t,entries){return entries.filter(e=>e.kind==='concert'&&P.completed(e)&&e.date===t.date&&(e.eventId===t.eventId||e.archiveId===t.archiveId));}
function firstSongs(entry,entries){const prior=entries.filter(e=>e.entryId!==entry.entryId&&e.kind==='concert'&&P.completed(e)&&e.date&&entry.date&&(e.date<entry.date||e.date===entry.date&&e.createdAt<entry.createdAt));const heard=new Set(prior.flatMap(e=>e.songs||[]));return (entry.songs||[]).filter(id=>!heard.has(id));}
function summaryText(state){const n=P.summary(state.entries);return `SEEYA DIARY · 공연 ${n.concert}회 · 장소 ${n.visit}회 · 팬 행사 ${n.event}회 · 라이브로 들은 곡 ${songs(state.entries).length}곡 · 굿즈 구매 ${n.goods}건 · 씨야 플레이 ${n.play}회`;}
function url(value){if(!value)return '';const u=new URL(value);if(u.protocol!=='https:'||u.username||u.password)throw Error('링크는 https:// 주소로 입력해 주세요.');return u.href;}
function youtube(value){try{const u=new URL(value),host=u.hostname.replace(/^www\./,'');const id=host==='youtu.be'?u.pathname.slice(1):['youtube.com','m.youtube.com'].includes(host)?(u.searchParams.get('v')||u.pathname.match(/^\/(?:shorts|embed)\/([^/]+)/)?.[1]):'';return /^[\w-]{11}$/.test(id||'')?id:'';}catch{return '';}}
function publicSummary(state,nickname=false){const done=state.entries.filter(e=>P.completed(e)).sort((a,b)=>b.date.localeCompare(a.date));return {v:1,n:nickname?state.profile.nickname:'',s:state.profile.since,c:P.summary(done),r:done.slice(0,80).map(e=>({k:e.kind,d:e.date,t:e.title.slice(0,100),i:e.eventId,a:e.archiveId,z:(e.songs||[]).length}))};}
function checkSummary(x){if(!x||x.v!==1||!Array.isArray(x.r)||x.r.length>80)throw Error('올바른 공유 요약이 아닙니다.');const str=(v,n)=>{if(typeof v!=='string'||v.length>n)throw Error('공유 내용이 너무 깁니다.');return v;};const count=v=>{if(!Number.isInteger(v)||v<0||v>2000)throw Error('공유 집계를 확인할 수 없습니다.');return v;};return {v:1,n:str(x.n,30),s:P.profile({since:str(x.s,10)}).since,c:Object.fromEntries(Object.keys(P.KINDS).map(k=>[k,count(['goods','play'].includes(k)&&x.c?.[k]===undefined?0:x.c?.[k])])),r:x.r.map(r=>({k:Object.hasOwn(P.KINDS,r.k)?r.k:(()=>{throw Error('기록 종류 오류');})(),d:P.date(str(r.d,10)),t:str(r.t,100),i:str(r.i,160),a:str(r.a,160),z:count(r.z)}))};}
module.exports={songs,tourEntries,firstSongs,summaryText,url,youtube,publicSummary,checkSummary};

},
"src/client/passport-share.js":function(module,exports,__require){
'use strict';
const X=__require("src/shared/passport-extra.js"),QR=__require("src/vendor/qrcodegen.js");
async function encode(data){const stream=new Blob([JSON.stringify(data)]).stream().pipeThrough(new CompressionStream('deflate'));const bytes=new Uint8Array(await new Response(stream).arrayBuffer());return btoa(String.fromCharCode(...bytes)).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'');}
async function decode(token){if(!/^[\w-]{1,2400}$/.test(token))throw Error('공유 주소를 확인해 주세요.');const b=Uint8Array.from(atob(token.replace(/-/g,'+').replace(/_/g,'/')),c=>c.charCodeAt(0));const reader=new Blob([b]).stream().pipeThrough(new DecompressionStream('deflate')).getReader();let size=0,parts=[];try{while(true){const {done,value}=await reader.read();if(done)break;size+=value.length;if(size>65536)throw Error('공유 내용이 너무 큽니다.');parts.push(value);}}finally{await reader.cancel();}return X.checkSummary(JSON.parse(await new Blob(parts).text()));}
async function make(state,nickname,base){const data=X.publicSummary(state,nickname),total=data.r.length;let token=await encode(data);while(base.length+token.length>1800&&data.r.length){data.r.pop();token=await encode(data);}const url=base+token;const qr=QR.QrCode.encodeText(url,QR.QrCode.Ecc.MEDIUM);const canvas=document.createElement('canvas'),scale=5,border=4;canvas.width=canvas.height=(qr.size+border*2)*scale;const g=canvas.getContext('2d');g.fillStyle='#fff';g.fillRect(0,0,canvas.width,canvas.height);g.fillStyle='#1f1b24';for(let y=0;y<qr.size;y++)for(let x=0;x<qr.size;x++)if(qr.getModule(x,y))g.fillRect((x+border)*scale,(y+border)*scale,scale,scale);return {url,canvas,included:data.r.length,total,summary:data};}
module.exports={encode,decode,make};

},
"src/vendor/qrcodegen.js":function(module,exports,__require){
/*
 * QR Code generator library (compiled from TypeScript)
 *
 * Copyright (c) Project Nayuki. (MIT License)
 * https://www.nayuki.io/page/qr-code-generator-library
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of
 * this software and associated documentation files (the "Software"), to deal in
 * the Software without restriction, including without limitation the rights to
 * use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of
 * the Software, and to permit persons to whom the Software is furnished to do so,
 * subject to the following conditions:
 * - The above copyright notice and this permission notice shall be included in
 *   all copies or substantial portions of the Software.
 * - The Software is provided "as is", without warranty of any kind, express or
 *   implied, including but not limited to the warranties of merchantability,
 *   fitness for a particular purpose and noninfringement. In no event shall the
 *   authors or copyright holders be liable for any claim, damages or other
 *   liability, whether in an action of contract, tort or otherwise, arising from,
 *   out of or in connection with the Software or the use or other dealings in the
 *   Software.
 */
"use strict";
var qrcodegen;
(function (qrcodegen) {
    /*---- QR Code symbol class ----*/
    /*
     * A QR Code symbol, which is a type of two-dimension barcode.
     * Invented by Denso Wave and described in the ISO/IEC 18004 standard.
     * Instances of this class represent an immutable square grid of dark and light cells.
     * The class provides static factory functions to create a QR Code from text or binary data.
     * The class covers the QR Code Model 2 specification, supporting all versions (sizes)
     * from 1 to 40, all 4 error correction levels, and 4 character encoding modes.
     *
     * Ways to create a QR Code object:
     * - High level: Take the payload data and call QrCode.encodeText() or QrCode.encodeBinary().
     * - Mid level: Custom-make the list of segments and call QrCode.encodeSegments().
     * - Low level: Custom-make the array of data codeword bytes (including
     *   segment headers and final padding, excluding error correction codewords),
     *   supply the appropriate version number, and call the QrCode() constructor.
     * (Note that all ways require supplying the desired error correction level.)
     */
    class QrCode {
        /*-- Constructor (low level) and fields --*/
        // Creates a new QR Code with the given version number,
        // error correction level, data codeword bytes, and mask number.
        // This is a low-level API that most users should not use directly.
        // A mid-level API is the encodeSegments() function.
        constructor(
        // The version number of this QR Code, which is between 1 and 40 (inclusive).
        // This determines the size of this barcode.
        version, 
        // The error correction level used in this QR Code.
        errorCorrectionLevel, dataCodewords, msk) {
            this.version = version;
            this.errorCorrectionLevel = errorCorrectionLevel;
            // The modules of this QR Code (false = light, true = dark).
            // Immutable after constructor finishes. Accessed through getModule().
            this.modules = [];
            // Indicates function modules that are not subjected to masking. Discarded when constructor finishes.
            this.isFunction = [];
            // Check scalar arguments
            if (version < QrCode.MIN_VERSION || version > QrCode.MAX_VERSION)
                throw new RangeError("Version value out of range");
            if (msk < -1 || msk > 7)
                throw new RangeError("Mask value out of range");
            this.size = version * 4 + 17;
            // Initialize both grids to be size*size arrays of Boolean false
            let row = [];
            for (let i = 0; i < this.size; i++)
                row.push(false);
            for (let i = 0; i < this.size; i++) {
                this.modules.push(row.slice()); // Initially all light
                this.isFunction.push(row.slice());
            }
            // Compute ECC, draw modules
            this.drawFunctionPatterns();
            const allCodewords = this.addEccAndInterleave(dataCodewords);
            this.drawCodewords(allCodewords);
            // Do masking
            if (msk == -1) { // Automatically choose best mask
                let minPenalty = 1000000000;
                for (let i = 0; i < 8; i++) {
                    this.applyMask(i);
                    this.drawFormatBits(i);
                    const penalty = this.getPenaltyScore();
                    if (penalty < minPenalty) {
                        msk = i;
                        minPenalty = penalty;
                    }
                    this.applyMask(i); // Undoes the mask due to XOR
                }
            }
            assert(0 <= msk && msk <= 7);
            this.mask = msk;
            this.applyMask(msk); // Apply the final choice of mask
            this.drawFormatBits(msk); // Overwrite old format bits
            this.isFunction = [];
        }
        /*-- Static factory functions (high level) --*/
        // Returns a QR Code representing the given Unicode text string at the given error correction level.
        // As a conservative upper bound, this function is guaranteed to succeed for strings that have 738 or fewer
        // Unicode code points (not UTF-16 code units) if the low error correction level is used. The smallest possible
        // QR Code version is automatically chosen for the output. The ECC level of the result may be higher than the
        // ecl argument if it can be done without increasing the version.
        static encodeText(text, ecl) {
            const segs = qrcodegen.QrSegment.makeSegments(text);
            return QrCode.encodeSegments(segs, ecl);
        }
        // Returns a QR Code representing the given binary data at the given error correction level.
        // This function always encodes using the binary segment mode, not any text mode. The maximum number of
        // bytes allowed is 2953. The smallest possible QR Code version is automatically chosen for the output.
        // The ECC level of the result may be higher than the ecl argument if it can be done without increasing the version.
        static encodeBinary(data, ecl) {
            const seg = qrcodegen.QrSegment.makeBytes(data);
            return QrCode.encodeSegments([seg], ecl);
        }
        /*-- Static factory functions (mid level) --*/
        // Returns a QR Code representing the given segments with the given encoding parameters.
        // The smallest possible QR Code version within the given range is automatically
        // chosen for the output. Iff boostEcl is true, then the ECC level of the result
        // may be higher than the ecl argument if it can be done without increasing the
        // version. The mask number is either between 0 to 7 (inclusive) to force that
        // mask, or -1 to automatically choose an appropriate mask (which may be slow).
        // This function allows the user to create a custom sequence of segments that switches
        // between modes (such as alphanumeric and byte) to encode text in less space.
        // This is a mid-level API; the high-level API is encodeText() and encodeBinary().
        static encodeSegments(segs, ecl, minVersion = 1, maxVersion = 40, mask = -1, boostEcl = true) {
            if (!(QrCode.MIN_VERSION <= minVersion && minVersion <= maxVersion && maxVersion <= QrCode.MAX_VERSION)
                || mask < -1 || mask > 7)
                throw new RangeError("Invalid value");
            // Find the minimal version number to use
            let version;
            let dataUsedBits;
            for (version = minVersion;; version++) {
                const dataCapacityBits = QrCode.getNumDataCodewords(version, ecl) * 8; // Number of data bits available
                const usedBits = QrSegment.getTotalBits(segs, version);
                if (usedBits <= dataCapacityBits) {
                    dataUsedBits = usedBits;
                    break; // This version number is found to be suitable
                }
                if (version >= maxVersion) // All versions in the range could not fit the given data
                    throw new RangeError("Data too long");
            }
            // Increase the error correction level while the data still fits in the current version number
            for (const newEcl of [QrCode.Ecc.MEDIUM, QrCode.Ecc.QUARTILE, QrCode.Ecc.HIGH]) { // From low to high
                if (boostEcl && dataUsedBits <= QrCode.getNumDataCodewords(version, newEcl) * 8)
                    ecl = newEcl;
            }
            // Concatenate all segments to create the data bit string
            let bb = [];
            for (const seg of segs) {
                appendBits(seg.mode.modeBits, 4, bb);
                appendBits(seg.numChars, seg.mode.numCharCountBits(version), bb);
                for (const b of seg.getData())
                    bb.push(b);
            }
            assert(bb.length == dataUsedBits);
            // Add terminator and pad up to a byte if applicable
            const dataCapacityBits = QrCode.getNumDataCodewords(version, ecl) * 8;
            assert(bb.length <= dataCapacityBits);
            appendBits(0, Math.min(4, dataCapacityBits - bb.length), bb);
            appendBits(0, (8 - bb.length % 8) % 8, bb);
            assert(bb.length % 8 == 0);
            // Pad with alternating bytes until data capacity is reached
            for (let padByte = 0xEC; bb.length < dataCapacityBits; padByte ^= 0xEC ^ 0x11)
                appendBits(padByte, 8, bb);
            // Pack bits into bytes in big endian
            let dataCodewords = [];
            while (dataCodewords.length * 8 < bb.length)
                dataCodewords.push(0);
            bb.forEach((b, i) => dataCodewords[i >>> 3] |= b << (7 - (i & 7)));
            // Create the QR Code object
            return new QrCode(version, ecl, dataCodewords, mask);
        }
        /*-- Accessor methods --*/
        // Returns the color of the module (pixel) at the given coordinates, which is false
        // for light or true for dark. The top left corner has the coordinates (x=0, y=0).
        // If the given coordinates are out of bounds, then false (light) is returned.
        getModule(x, y) {
            return 0 <= x && x < this.size && 0 <= y && y < this.size && this.modules[y][x];
        }
        /*-- Private helper methods for constructor: Drawing function modules --*/
        // Reads this object's version field, and draws and marks all function modules.
        drawFunctionPatterns() {
            // Draw horizontal and vertical timing patterns
            for (let i = 0; i < this.size; i++) {
                this.setFunctionModule(6, i, i % 2 == 0);
                this.setFunctionModule(i, 6, i % 2 == 0);
            }
            // Draw 3 finder patterns (all corners except bottom right; overwrites some timing modules)
            this.drawFinderPattern(3, 3);
            this.drawFinderPattern(this.size - 4, 3);
            this.drawFinderPattern(3, this.size - 4);
            // Draw numerous alignment patterns
            const alignPatPos = this.getAlignmentPatternPositions();
            const numAlign = alignPatPos.length;
            for (let i = 0; i < numAlign; i++) {
                for (let j = 0; j < numAlign; j++) {
                    // Don't draw on the three finder corners
                    if (!(i == 0 && j == 0 || i == 0 && j == numAlign - 1 || i == numAlign - 1 && j == 0))
                        this.drawAlignmentPattern(alignPatPos[i], alignPatPos[j]);
                }
            }
            // Draw configuration data
            this.drawFormatBits(0); // Dummy mask value; overwritten later in the constructor
            this.drawVersion();
        }
        // Draws two copies of the format bits (with its own error correction code)
        // based on the given mask and this object's error correction level field.
        drawFormatBits(mask) {
            // Calculate error correction code and pack bits
            const data = this.errorCorrectionLevel.formatBits << 3 | mask; // errCorrLvl is uint2, mask is uint3
            let rem = data;
            for (let i = 0; i < 10; i++)
                rem = (rem << 1) ^ ((rem >>> 9) * 0x537);
            const bits = (data << 10 | rem) ^ 0x5412; // uint15
            assert(bits >>> 15 == 0);
            // Draw first copy
            for (let i = 0; i <= 5; i++)
                this.setFunctionModule(8, i, getBit(bits, i));
            this.setFunctionModule(8, 7, getBit(bits, 6));
            this.setFunctionModule(8, 8, getBit(bits, 7));
            this.setFunctionModule(7, 8, getBit(bits, 8));
            for (let i = 9; i < 15; i++)
                this.setFunctionModule(14 - i, 8, getBit(bits, i));
            // Draw second copy
            for (let i = 0; i < 8; i++)
                this.setFunctionModule(this.size - 1 - i, 8, getBit(bits, i));
            for (let i = 8; i < 15; i++)
                this.setFunctionModule(8, this.size - 15 + i, getBit(bits, i));
            this.setFunctionModule(8, this.size - 8, true); // Always dark
        }
        // Draws two copies of the version bits (with its own error correction code),
        // based on this object's version field, iff 7 <= version <= 40.
        drawVersion() {
            if (this.version < 7)
                return;
            // Calculate error correction code and pack bits
            let rem = this.version; // version is uint6, in the range [7, 40]
            for (let i = 0; i < 12; i++)
                rem = (rem << 1) ^ ((rem >>> 11) * 0x1F25);
            const bits = this.version << 12 | rem; // uint18
            assert(bits >>> 18 == 0);
            // Draw two copies
            for (let i = 0; i < 18; i++) {
                const color = getBit(bits, i);
                const a = this.size - 11 + i % 3;
                const b = Math.floor(i / 3);
                this.setFunctionModule(a, b, color);
                this.setFunctionModule(b, a, color);
            }
        }
        // Draws a 9*9 finder pattern including the border separator,
        // with the center module at (x, y). Modules can be out of bounds.
        drawFinderPattern(x, y) {
            for (let dy = -4; dy <= 4; dy++) {
                for (let dx = -4; dx <= 4; dx++) {
                    const dist = Math.max(Math.abs(dx), Math.abs(dy)); // Chebyshev/infinity norm
                    const xx = x + dx;
                    const yy = y + dy;
                    if (0 <= xx && xx < this.size && 0 <= yy && yy < this.size)
                        this.setFunctionModule(xx, yy, dist != 2 && dist != 4);
                }
            }
        }
        // Draws a 5*5 alignment pattern, with the center module
        // at (x, y). All modules must be in bounds.
        drawAlignmentPattern(x, y) {
            for (let dy = -2; dy <= 2; dy++) {
                for (let dx = -2; dx <= 2; dx++)
                    this.setFunctionModule(x + dx, y + dy, Math.max(Math.abs(dx), Math.abs(dy)) != 1);
            }
        }
        // Sets the color of a module and marks it as a function module.
        // Only used by the constructor. Coordinates must be in bounds.
        setFunctionModule(x, y, isDark) {
            this.modules[y][x] = isDark;
            this.isFunction[y][x] = true;
        }
        /*-- Private helper methods for constructor: Codewords and masking --*/
        // Returns a new byte string representing the given data with the appropriate error correction
        // codewords appended to it, based on this object's version and error correction level.
        addEccAndInterleave(data) {
            const ver = this.version;
            const ecl = this.errorCorrectionLevel;
            if (data.length != QrCode.getNumDataCodewords(ver, ecl))
                throw new RangeError("Invalid argument");
            // Calculate parameter numbers
            const numBlocks = QrCode.NUM_ERROR_CORRECTION_BLOCKS[ecl.ordinal][ver];
            const blockEccLen = QrCode.ECC_CODEWORDS_PER_BLOCK[ecl.ordinal][ver];
            const rawCodewords = Math.floor(QrCode.getNumRawDataModules(ver) / 8);
            const numShortBlocks = numBlocks - rawCodewords % numBlocks;
            const shortBlockLen = Math.floor(rawCodewords / numBlocks);
            // Split data into blocks and append ECC to each block
            let blocks = [];
            const rsDiv = QrCode.reedSolomonComputeDivisor(blockEccLen);
            for (let i = 0, k = 0; i < numBlocks; i++) {
                let dat = data.slice(k, k + shortBlockLen - blockEccLen + (i < numShortBlocks ? 0 : 1));
                k += dat.length;
                const ecc = QrCode.reedSolomonComputeRemainder(dat, rsDiv);
                if (i < numShortBlocks)
                    dat.push(0);
                blocks.push(dat.concat(ecc));
            }
            // Interleave (not concatenate) the bytes from every block into a single sequence
            let result = [];
            for (let i = 0; i < blocks[0].length; i++) {
                blocks.forEach((block, j) => {
                    // Skip the padding byte in short blocks
                    if (i != shortBlockLen - blockEccLen || j >= numShortBlocks)
                        result.push(block[i]);
                });
            }
            assert(result.length == rawCodewords);
            return result;
        }
        // Draws the given sequence of 8-bit codewords (data and error correction) onto the entire
        // data area of this QR Code. Function modules need to be marked off before this is called.
        drawCodewords(data) {
            if (data.length != Math.floor(QrCode.getNumRawDataModules(this.version) / 8))
                throw new RangeError("Invalid argument");
            let i = 0; // Bit index into the data
            // Do the funny zigzag scan
            for (let right = this.size - 1; right >= 1; right -= 2) { // Index of right column in each column pair
                if (right == 6)
                    right = 5;
                for (let vert = 0; vert < this.size; vert++) { // Vertical counter
                    for (let j = 0; j < 2; j++) {
                        const x = right - j; // Actual x coordinate
                        const upward = ((right + 1) & 2) == 0;
                        const y = upward ? this.size - 1 - vert : vert; // Actual y coordinate
                        if (!this.isFunction[y][x] && i < data.length * 8) {
                            this.modules[y][x] = getBit(data[i >>> 3], 7 - (i & 7));
                            i++;
                        }
                        // If this QR Code has any remainder bits (0 to 7), they were assigned as
                        // 0/false/light by the constructor and are left unchanged by this method
                    }
                }
            }
            assert(i == data.length * 8);
        }
        // XORs the codeword modules in this QR Code with the given mask pattern.
        // The function modules must be marked and the codeword bits must be drawn
        // before masking. Due to the arithmetic of XOR, calling applyMask() with
        // the same mask value a second time will undo the mask. A final well-formed
        // QR Code needs exactly one (not zero, two, etc.) mask applied.
        applyMask(mask) {
            if (mask < 0 || mask > 7)
                throw new RangeError("Mask value out of range");
            for (let y = 0; y < this.size; y++) {
                for (let x = 0; x < this.size; x++) {
                    let invert;
                    switch (mask) {
                        case 0:
                            invert = (x + y) % 2 == 0;
                            break;
                        case 1:
                            invert = y % 2 == 0;
                            break;
                        case 2:
                            invert = x % 3 == 0;
                            break;
                        case 3:
                            invert = (x + y) % 3 == 0;
                            break;
                        case 4:
                            invert = (Math.floor(x / 3) + Math.floor(y / 2)) % 2 == 0;
                            break;
                        case 5:
                            invert = x * y % 2 + x * y % 3 == 0;
                            break;
                        case 6:
                            invert = (x * y % 2 + x * y % 3) % 2 == 0;
                            break;
                        case 7:
                            invert = ((x + y) % 2 + x * y % 3) % 2 == 0;
                            break;
                        default: throw new Error("Unreachable");
                    }
                    if (!this.isFunction[y][x] && invert)
                        this.modules[y][x] = !this.modules[y][x];
                }
            }
        }
        // Calculates and returns the penalty score based on state of this QR Code's current modules.
        // This is used by the automatic mask choice algorithm to find the mask pattern that yields the lowest score.
        getPenaltyScore() {
            let result = 0;
            // Adjacent modules in row having same color, and finder-like patterns
            for (let y = 0; y < this.size; y++) {
                let runColor = false;
                let runX = 0;
                let runHistory = [0, 0, 0, 0, 0, 0, 0];
                for (let x = 0; x < this.size; x++) {
                    if (this.modules[y][x] == runColor) {
                        runX++;
                        if (runX == 5)
                            result += QrCode.PENALTY_N1;
                        else if (runX > 5)
                            result++;
                    }
                    else {
                        this.finderPenaltyAddHistory(runX, runHistory);
                        if (!runColor)
                            result += this.finderPenaltyCountPatterns(runHistory) * QrCode.PENALTY_N3;
                        runColor = this.modules[y][x];
                        runX = 1;
                    }
                }
                result += this.finderPenaltyTerminateAndCount(runColor, runX, runHistory) * QrCode.PENALTY_N3;
            }
            // Adjacent modules in column having same color, and finder-like patterns
            for (let x = 0; x < this.size; x++) {
                let runColor = false;
                let runY = 0;
                let runHistory = [0, 0, 0, 0, 0, 0, 0];
                for (let y = 0; y < this.size; y++) {
                    if (this.modules[y][x] == runColor) {
                        runY++;
                        if (runY == 5)
                            result += QrCode.PENALTY_N1;
                        else if (runY > 5)
                            result++;
                    }
                    else {
                        this.finderPenaltyAddHistory(runY, runHistory);
                        if (!runColor)
                            result += this.finderPenaltyCountPatterns(runHistory) * QrCode.PENALTY_N3;
                        runColor = this.modules[y][x];
                        runY = 1;
                    }
                }
                result += this.finderPenaltyTerminateAndCount(runColor, runY, runHistory) * QrCode.PENALTY_N3;
            }
            // 2*2 blocks of modules having same color
            for (let y = 0; y < this.size - 1; y++) {
                for (let x = 0; x < this.size - 1; x++) {
                    const color = this.modules[y][x];
                    if (color == this.modules[y][x + 1] &&
                        color == this.modules[y + 1][x] &&
                        color == this.modules[y + 1][x + 1])
                        result += QrCode.PENALTY_N2;
                }
            }
            // Balance of dark and light modules
            let dark = 0;
            for (const row of this.modules)
                dark = row.reduce((sum, color) => sum + (color ? 1 : 0), dark);
            const total = this.size * this.size; // Note that size is odd, so dark/total != 1/2
            // Compute the smallest integer k >= 0 such that (45-5k)% <= dark/total <= (55+5k)%
            const k = Math.ceil(Math.abs(dark * 20 - total * 10) / total) - 1;
            assert(0 <= k && k <= 9);
            result += k * QrCode.PENALTY_N4;
            assert(0 <= result && result <= 2568888); // Non-tight upper bound based on default values of PENALTY_N1, ..., N4
            return result;
        }
        /*-- Private helper functions --*/
        // Returns an ascending list of positions of alignment patterns for this version number.
        // Each position is in the range [0,177), and are used on both the x and y axes.
        // This could be implemented as lookup table of 40 variable-length lists of integers.
        getAlignmentPatternPositions() {
            if (this.version == 1)
                return [];
            else {
                const numAlign = Math.floor(this.version / 7) + 2;
                const step = (this.version == 32) ? 26 :
                    Math.ceil((this.version * 4 + 4) / (numAlign * 2 - 2)) * 2;
                let result = [6];
                for (let pos = this.size - 7; result.length < numAlign; pos -= step)
                    result.splice(1, 0, pos);
                return result;
            }
        }
        // Returns the number of data bits that can be stored in a QR Code of the given version number, after
        // all function modules are excluded. This includes remainder bits, so it might not be a multiple of 8.
        // The result is in the range [208, 29648]. This could be implemented as a 40-entry lookup table.
        static getNumRawDataModules(ver) {
            if (ver < QrCode.MIN_VERSION || ver > QrCode.MAX_VERSION)
                throw new RangeError("Version number out of range");
            let result = (16 * ver + 128) * ver + 64;
            if (ver >= 2) {
                const numAlign = Math.floor(ver / 7) + 2;
                result -= (25 * numAlign - 10) * numAlign - 55;
                if (ver >= 7)
                    result -= 36;
            }
            assert(208 <= result && result <= 29648);
            return result;
        }
        // Returns the number of 8-bit data (i.e. not error correction) codewords contained in any
        // QR Code of the given version number and error correction level, with remainder bits discarded.
        // This stateless pure function could be implemented as a (40*4)-cell lookup table.
        static getNumDataCodewords(ver, ecl) {
            return Math.floor(QrCode.getNumRawDataModules(ver) / 8) -
                QrCode.ECC_CODEWORDS_PER_BLOCK[ecl.ordinal][ver] *
                    QrCode.NUM_ERROR_CORRECTION_BLOCKS[ecl.ordinal][ver];
        }
        // Returns a Reed-Solomon ECC generator polynomial for the given degree. This could be
        // implemented as a lookup table over all possible parameter values, instead of as an algorithm.
        static reedSolomonComputeDivisor(degree) {
            if (degree < 1 || degree > 255)
                throw new RangeError("Degree out of range");
            // Polynomial coefficients are stored from highest to lowest power, excluding the leading term which is always 1.
            // For example the polynomial x^3 + 255x^2 + 8x + 93 is stored as the uint8 array [255, 8, 93].
            let result = [];
            for (let i = 0; i < degree - 1; i++)
                result.push(0);
            result.push(1); // Start off with the monomial x^0
            // Compute the product polynomial (x - r^0) * (x - r^1) * (x - r^2) * ... * (x - r^{degree-1}),
            // and drop the highest monomial term which is always 1x^degree.
            // Note that r = 0x02, which is a generator element of this field GF(2^8/0x11D).
            let root = 1;
            for (let i = 0; i < degree; i++) {
                // Multiply the current product by (x - r^i)
                for (let j = 0; j < result.length; j++) {
                    result[j] = QrCode.reedSolomonMultiply(result[j], root);
                    if (j + 1 < result.length)
                        result[j] ^= result[j + 1];
                }
                root = QrCode.reedSolomonMultiply(root, 0x02);
            }
            return result;
        }
        // Returns the Reed-Solomon error correction codeword for the given data and divisor polynomials.
        static reedSolomonComputeRemainder(data, divisor) {
            let result = divisor.map(_ => 0);
            for (const b of data) { // Polynomial division
                const factor = b ^ result.shift();
                result.push(0);
                divisor.forEach((coef, i) => result[i] ^= QrCode.reedSolomonMultiply(coef, factor));
            }
            return result;
        }
        // Returns the product of the two given field elements modulo GF(2^8/0x11D). The arguments and result
        // are unsigned 8-bit integers. This could be implemented as a lookup table of 256*256 entries of uint8.
        static reedSolomonMultiply(x, y) {
            if (x >>> 8 != 0 || y >>> 8 != 0)
                throw new RangeError("Byte out of range");
            // Russian peasant multiplication
            let z = 0;
            for (let i = 7; i >= 0; i--) {
                z = (z << 1) ^ ((z >>> 7) * 0x11D);
                z ^= ((y >>> i) & 1) * x;
            }
            assert(z >>> 8 == 0);
            return z;
        }
        // Can only be called immediately after a light run is added, and
        // returns either 0, 1, or 2. A helper function for getPenaltyScore().
        finderPenaltyCountPatterns(runHistory) {
            const n = runHistory[1];
            assert(n <= this.size * 3);
            const core = n > 0 && runHistory[2] == n && runHistory[3] == n * 3 && runHistory[4] == n && runHistory[5] == n;
            return (core && runHistory[0] >= n * 4 && runHistory[6] >= n ? 1 : 0)
                + (core && runHistory[6] >= n * 4 && runHistory[0] >= n ? 1 : 0);
        }
        // Must be called at the end of a line (row or column) of modules. A helper function for getPenaltyScore().
        finderPenaltyTerminateAndCount(currentRunColor, currentRunLength, runHistory) {
            if (currentRunColor) { // Terminate dark run
                this.finderPenaltyAddHistory(currentRunLength, runHistory);
                currentRunLength = 0;
            }
            currentRunLength += this.size; // Add light border to final run
            this.finderPenaltyAddHistory(currentRunLength, runHistory);
            return this.finderPenaltyCountPatterns(runHistory);
        }
        // Pushes the given value to the front and drops the last value. A helper function for getPenaltyScore().
        finderPenaltyAddHistory(currentRunLength, runHistory) {
            if (runHistory[0] == 0)
                currentRunLength += this.size; // Add light border to initial run
            runHistory.pop();
            runHistory.unshift(currentRunLength);
        }
    }
    /*-- Constants and tables --*/
    // The minimum version number supported in the QR Code Model 2 standard.
    QrCode.MIN_VERSION = 1;
    // The maximum version number supported in the QR Code Model 2 standard.
    QrCode.MAX_VERSION = 40;
    // For use in getPenaltyScore(), when evaluating which mask is best.
    QrCode.PENALTY_N1 = 3;
    QrCode.PENALTY_N2 = 3;
    QrCode.PENALTY_N3 = 40;
    QrCode.PENALTY_N4 = 10;
    QrCode.ECC_CODEWORDS_PER_BLOCK = [
        // Version: (note that index 0 is for padding, and is set to an illegal value)
        //0,  1,  2,  3,  4,  5,  6,  7,  8,  9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40    Error correction level
        [-1, 7, 10, 15, 20, 26, 18, 20, 24, 30, 18, 20, 24, 26, 30, 22, 24, 28, 30, 28, 28, 28, 28, 30, 30, 26, 28, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30],
        [-1, 10, 16, 26, 18, 24, 16, 18, 22, 22, 26, 30, 22, 22, 24, 24, 28, 28, 26, 26, 26, 26, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28],
        [-1, 13, 22, 18, 26, 18, 24, 18, 22, 20, 24, 28, 26, 24, 20, 30, 24, 28, 28, 26, 30, 28, 30, 30, 30, 30, 28, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30],
        [-1, 17, 28, 22, 16, 22, 28, 26, 26, 24, 28, 24, 28, 22, 24, 24, 30, 28, 28, 26, 28, 30, 24, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30], // High
    ];
    QrCode.NUM_ERROR_CORRECTION_BLOCKS = [
        // Version: (note that index 0 is for padding, and is set to an illegal value)
        //0, 1, 2, 3, 4, 5, 6, 7, 8, 9,10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40    Error correction level
        [-1, 1, 1, 1, 1, 1, 2, 2, 2, 2, 4, 4, 4, 4, 4, 6, 6, 6, 6, 7, 8, 8, 9, 9, 10, 12, 12, 12, 13, 14, 15, 16, 17, 18, 19, 19, 20, 21, 22, 24, 25],
        [-1, 1, 1, 1, 2, 2, 4, 4, 4, 5, 5, 5, 8, 9, 9, 10, 10, 11, 13, 14, 16, 17, 17, 18, 20, 21, 23, 25, 26, 28, 29, 31, 33, 35, 37, 38, 40, 43, 45, 47, 49],
        [-1, 1, 1, 2, 2, 4, 4, 6, 6, 8, 8, 8, 10, 12, 16, 12, 17, 16, 18, 21, 20, 23, 23, 25, 27, 29, 34, 34, 35, 38, 40, 43, 45, 48, 51, 53, 56, 59, 62, 65, 68],
        [-1, 1, 1, 2, 4, 4, 4, 5, 6, 8, 8, 11, 11, 16, 16, 18, 16, 19, 21, 25, 25, 25, 34, 30, 32, 35, 37, 40, 42, 45, 48, 51, 54, 57, 60, 63, 66, 70, 74, 77, 81], // High
    ];
    qrcodegen.QrCode = QrCode;
    // Appends the given number of low-order bits of the given value
    // to the given buffer. Requires 0 <= len <= 31 and 0 <= val < 2^len.
    function appendBits(val, len, bb) {
        if (len < 0 || len > 31 || val >>> len != 0)
            throw new RangeError("Value out of range");
        for (let i = len - 1; i >= 0; i--) // Append bit by bit
            bb.push((val >>> i) & 1);
    }
    // Returns true iff the i'th bit of x is set to 1.
    function getBit(x, i) {
        return ((x >>> i) & 1) != 0;
    }
    // Throws an exception if the given condition is false.
    function assert(cond) {
        if (!cond)
            throw new Error("Assertion error");
    }
    /*---- Data segment class ----*/
    /*
     * A segment of character/binary/control data in a QR Code symbol.
     * Instances of this class are immutable.
     * The mid-level way to create a segment is to take the payload data
     * and call a static factory function such as QrSegment.makeNumeric().
     * The low-level way to create a segment is to custom-make the bit buffer
     * and call the QrSegment() constructor with appropriate values.
     * This segment class imposes no length restrictions, but QR Codes have restrictions.
     * Even in the most favorable conditions, a QR Code can only hold 7089 characters of data.
     * Any segment longer than this is meaningless for the purpose of generating QR Codes.
     */
    class QrSegment {
        /*-- Constructor (low level) and fields --*/
        // Creates a new QR Code segment with the given attributes and data.
        // The character count (numChars) must agree with the mode and the bit buffer length,
        // but the constraint isn't checked. The given bit buffer is cloned and stored.
        constructor(
        // The mode indicator of this segment.
        mode, 
        // The length of this segment's unencoded data. Measured in characters for
        // numeric/alphanumeric/kanji mode, bytes for byte mode, and 0 for ECI mode.
        // Always zero or positive. Not the same as the data's bit length.
        numChars, 
        // The data bits of this segment. Accessed through getData().
        bitData) {
            this.mode = mode;
            this.numChars = numChars;
            this.bitData = bitData;
            if (numChars < 0)
                throw new RangeError("Invalid argument");
            this.bitData = bitData.slice(); // Make defensive copy
        }
        /*-- Static factory functions (mid level) --*/
        // Returns a segment representing the given binary data encoded in
        // byte mode. All input byte arrays are acceptable. Any text string
        // can be converted to UTF-8 bytes and encoded as a byte mode segment.
        static makeBytes(data) {
            let bb = [];
            for (const b of data)
                appendBits(b, 8, bb);
            return new QrSegment(QrSegment.Mode.BYTE, data.length, bb);
        }
        // Returns a segment representing the given string of decimal digits encoded in numeric mode.
        static makeNumeric(digits) {
            if (!QrSegment.isNumeric(digits))
                throw new RangeError("String contains non-numeric characters");
            let bb = [];
            for (let i = 0; i < digits.length;) { // Consume up to 3 digits per iteration
                const n = Math.min(digits.length - i, 3);
                appendBits(parseInt(digits.substring(i, i + n), 10), n * 3 + 1, bb);
                i += n;
            }
            return new QrSegment(QrSegment.Mode.NUMERIC, digits.length, bb);
        }
        // Returns a segment representing the given text string encoded in alphanumeric mode.
        // The characters allowed are: 0 to 9, A to Z (uppercase only), space,
        // dollar, percent, asterisk, plus, hyphen, period, slash, colon.
        static makeAlphanumeric(text) {
            if (!QrSegment.isAlphanumeric(text))
                throw new RangeError("String contains unencodable characters in alphanumeric mode");
            let bb = [];
            let i;
            for (i = 0; i + 2 <= text.length; i += 2) { // Process groups of 2
                let temp = QrSegment.ALPHANUMERIC_CHARSET.indexOf(text.charAt(i)) * 45;
                temp += QrSegment.ALPHANUMERIC_CHARSET.indexOf(text.charAt(i + 1));
                appendBits(temp, 11, bb);
            }
            if (i < text.length) // 1 character remaining
                appendBits(QrSegment.ALPHANUMERIC_CHARSET.indexOf(text.charAt(i)), 6, bb);
            return new QrSegment(QrSegment.Mode.ALPHANUMERIC, text.length, bb);
        }
        // Returns a new mutable list of zero or more segments to represent the given Unicode text string.
        // The result may use various segment modes and switch modes to optimize the length of the bit stream.
        static makeSegments(text) {
            // Select the most efficient segment encoding automatically
            if (text == "")
                return [];
            else if (QrSegment.isNumeric(text))
                return [QrSegment.makeNumeric(text)];
            else if (QrSegment.isAlphanumeric(text))
                return [QrSegment.makeAlphanumeric(text)];
            else
                return [QrSegment.makeBytes(QrSegment.toUtf8ByteArray(text))];
        }
        // Returns a segment representing an Extended Channel Interpretation
        // (ECI) designator with the given assignment value.
        static makeEci(assignVal) {
            let bb = [];
            if (assignVal < 0)
                throw new RangeError("ECI assignment value out of range");
            else if (assignVal < (1 << 7))
                appendBits(assignVal, 8, bb);
            else if (assignVal < (1 << 14)) {
                appendBits(0b10, 2, bb);
                appendBits(assignVal, 14, bb);
            }
            else if (assignVal < 1000000) {
                appendBits(0b110, 3, bb);
                appendBits(assignVal, 21, bb);
            }
            else
                throw new RangeError("ECI assignment value out of range");
            return new QrSegment(QrSegment.Mode.ECI, 0, bb);
        }
        // Tests whether the given string can be encoded as a segment in numeric mode.
        // A string is encodable iff each character is in the range 0 to 9.
        static isNumeric(text) {
            return QrSegment.NUMERIC_REGEX.test(text);
        }
        // Tests whether the given string can be encoded as a segment in alphanumeric mode.
        // A string is encodable iff each character is in the following set: 0 to 9, A to Z
        // (uppercase only), space, dollar, percent, asterisk, plus, hyphen, period, slash, colon.
        static isAlphanumeric(text) {
            return QrSegment.ALPHANUMERIC_REGEX.test(text);
        }
        /*-- Methods --*/
        // Returns a new copy of the data bits of this segment.
        getData() {
            return this.bitData.slice(); // Make defensive copy
        }
        // (Package-private) Calculates and returns the number of bits needed to encode the given segments at
        // the given version. The result is infinity if a segment has too many characters to fit its length field.
        static getTotalBits(segs, version) {
            let result = 0;
            for (const seg of segs) {
                const ccbits = seg.mode.numCharCountBits(version);
                if (seg.numChars >= (1 << ccbits))
                    return Infinity; // The segment's length doesn't fit the field's bit width
                result += 4 + ccbits + seg.bitData.length;
            }
            return result;
        }
        // Returns a new array of bytes representing the given string encoded in UTF-8.
        static toUtf8ByteArray(str) {
            str = encodeURI(str);
            let result = [];
            for (let i = 0; i < str.length; i++) {
                if (str.charAt(i) != "%")
                    result.push(str.charCodeAt(i));
                else {
                    result.push(parseInt(str.substring(i + 1, i + 3), 16));
                    i += 2;
                }
            }
            return result;
        }
    }
    /*-- Constants --*/
    // Describes precisely all strings that are encodable in numeric mode.
    QrSegment.NUMERIC_REGEX = /^[0-9]*$/;
    // Describes precisely all strings that are encodable in alphanumeric mode.
    QrSegment.ALPHANUMERIC_REGEX = /^[A-Z0-9 $%*+.\/:-]*$/;
    // The set of all legal characters in alphanumeric mode,
    // where each character value maps to the index in the string.
    QrSegment.ALPHANUMERIC_CHARSET = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ $%*+-./:";
    qrcodegen.QrSegment = QrSegment;
})(qrcodegen || (qrcodegen = {}));
/*---- Public helper enumeration ----*/
(function (qrcodegen) {
    var QrCode;
    (function (QrCode) {
        /*
         * The error correction level in a QR Code symbol. Immutable.
         */
        class Ecc {
            /*-- Constructor and fields --*/
            constructor(
            // In the range 0 to 3 (unsigned 2-bit integer).
            ordinal, 
            // (Package-private) In the range 0 to 3 (unsigned 2-bit integer).
            formatBits) {
                this.ordinal = ordinal;
                this.formatBits = formatBits;
            }
        }
        /*-- Constants --*/
        Ecc.LOW = new Ecc(0, 1); // The QR Code can tolerate about  7% erroneous codewords
        Ecc.MEDIUM = new Ecc(1, 0); // The QR Code can tolerate about 15% erroneous codewords
        Ecc.QUARTILE = new Ecc(2, 3); // The QR Code can tolerate about 25% erroneous codewords
        Ecc.HIGH = new Ecc(3, 2); // The QR Code can tolerate about 30% erroneous codewords
        QrCode.Ecc = Ecc;
    })(QrCode = qrcodegen.QrCode || (qrcodegen.QrCode = {}));
})(qrcodegen || (qrcodegen = {}));
/*---- Public helper enumeration ----*/
(function (qrcodegen) {
    var QrSegment;
    (function (QrSegment) {
        /*
         * Describes how a segment's data bits are interpreted. Immutable.
         */
        class Mode {
            /*-- Constructor and fields --*/
            constructor(
            // The mode indicator bits, which is a uint4 value (range 0 to 15).
            modeBits, 
            // Number of character count bits for three different version ranges.
            numBitsCharCount) {
                this.modeBits = modeBits;
                this.numBitsCharCount = numBitsCharCount;
            }
            /*-- Method --*/
            // (Package-private) Returns the bit width of the character count field for a segment in
            // this mode in a QR Code at the given version number. The result is in the range [0, 16].
            numCharCountBits(ver) {
                return this.numBitsCharCount[Math.floor((ver + 7) / 17)];
            }
        }
        /*-- Constants --*/
        Mode.NUMERIC = new Mode(0x1, [10, 12, 14]);
        Mode.ALPHANUMERIC = new Mode(0x2, [9, 11, 13]);
        Mode.BYTE = new Mode(0x4, [8, 16, 16]);
        Mode.KANJI = new Mode(0x8, [8, 10, 12]);
        Mode.ECI = new Mode(0x7, [0, 0, 0]);
        QrSegment.Mode = Mode;
    })(QrSegment = qrcodegen.QrSegment || (qrcodegen.QrSegment = {}));
})(qrcodegen || (qrcodegen = {}));

module.exports=qrcodegen;

},
"src/client/passport-maker.js":function(module,exports,__require){
'use strict';
const Brand=__require("src/data/passport-brand.json");
const Viewport=__require("src/client/passport-viewport.js");
const P=__require("src/shared/passport.js"),R=__require("src/shared/passport-image.js"),D=__require("src/shared/passport-image-edit.js"),E=P.esc;
// Text/layout drafts stay in this tab; photo pixels never enter browser storage or a server.
const DRAFT_KEY='seeya-diary-image-draft-v1';
let memoryDraft=null,memoryPhotos=[];
module.exports=function maker(app,state,catalog,say,download,entryId='',context={}){
 let recovered=memoryDraft;try{recovered ||= JSON.parse(sessionStorage.getItem(DRAFT_KEY)||'null');}catch{}
 if(!recovered||recovered.version!==1||!Array.isArray(recovered.mottos)||recovered.mottos.length>8||!recovered.fields||typeof recovered.fields!=='object')recovered=null;
 let initialized=false,previousDraft='',draftFailed=false;

 const templates={profile:'나의 씨야 카드',review:'이달의 나',records:'선택한 기록',ticket:'포토 티켓',lock:'잠금화면',home:'홈화면'};
 let type=entryId?'ticket':context.month?'review':Object.hasOwn(templates,recovered?.type)?recovered.type:'profile',photo=null,serial=0,uploadSerial=0,disposed=false,selected='none',gesture=null,fontSerial=0,fontReady=true,logoReady=false;
 const logos={},photos=[...memoryPhotos],mottos=[{motto:state.profile.motto||'',mottoFont:'basic',mottoSize:28,mottoX:0,mottoY:92}],recordIds=[];
 let photoIndex=-1,mottoIndex=0,photoCount=0,photoBusy=false;
 const blockPositions=recovered?.blocks||{};if(recovered)mottos.splice(0,mottos.length,...recovered.mottos.map(m=>({...m})));recordIds.push(...(recovered?.recordIds||[]).filter(id=>state.entries.some(e=>e.entryId===id)).slice(0,8));const blockNames={brand:'SEEYA Diary',tour:'투어 스탬프',records:'나의 기록'};
 const photoKeys=['photoSize','photoOpacity','photoX','photoY'],mottoKeys=['motto','mottoFont','mottoSize','mottoX','mottoY'];
 const opts=(items,selected)=>items.map(([v,n])=>`<option value="${E(v)}" ${v===selected?'selected':''}>${E(n)}</option>`).join('');
 const slider=(name,label,value,min,max,unit='%')=>`<label class="pp-field pp-slider" for="${name}"><span>${label} <output for="${name}" aria-hidden="true">${value}${unit}</output></span><input id="${name}" name="${name}" form="ppMakerControls" type="range" step="any" aria-label="${label}" min="${min}" max="${max}" value="${value}" data-unit="${unit}"></label>`;
 app.innerHTML=`<a class="pp-back" href="/diary/">← 내 다이어리</a><section class="pp-panel pp-maker"><h2>이미지 만들기</h2><p id="ppDraftNotice" class="pp-draft-notice">문구·배치는 이 탭에 임시 보관합니다. 사진은 화면 이동 중에는 유지되지만 새로고침·탭 닫기 후에는 다시 선택해 주세요. 초안은 JSON 기록 백업에 포함되지 않습니다.</p><div class="pp-template-tabs" role="group" aria-label="이미지 템플릿">${Object.entries(templates).map(([v,n])=>`<button data-template="${v}" aria-pressed="${v===type}">${n}</button>`).join('')}</div><div class="pp-maker-layout"><div class="pp-canvas-wrap"><div id="ppEditStage" class="pp-edit-stage"><canvas id="ppCanvas" aria-label="내 다이어리 이미지 미리보기"></canvas><div id="ppSelection" class="pp-selection" role="group" tabindex="0" aria-label="선택한 요소 이동" hidden>${['nw','ne','sw','se'].map((d,i)=>`<button type="button" class="pp-resize pp-resize-${d}" data-corner="${d}" aria-label="사진 ${['왼쪽 위','오른쪽 위','왼쪽 아래','오른쪽 아래'][i]} 크기 조절"></button>`).join('')}</div></div>
 <div class="pp-edit-tools"><div class="pp-edit-modes" role="group" aria-label="편집할 요소"><button type="button" data-edit="photo" disabled>사진</button><button type="button" data-edit="motto">문구</button><button type="button" data-edit="brand">SEEYA Diary</button><button type="button" data-edit="tour" hidden>투어 스탬프</button><button type="button" data-edit="records" hidden>나의 기록</button><button type="button" data-edit="none" aria-pressed="true">완료</button></div><div id="ppPhotoTools" hidden>${slider('photoSize','사진 확대',75,10,200)}${slider('photoOpacity','사진 진하기',70,0,100)}<div class="pp-actions"><button type="button" id="ppCenterPhoto">가운데</button><button type="button" id="ppResetPhoto">초기화</button></div></div><div id="ppMottoTools" hidden><label class="pp-field"><span>문구 글꼴</span><select name="mottoFont" form="ppMakerControls">${opts(Object.entries(R.FONTS).map(([k,v])=>[k,v.label]),'basic')}</select></label><p id="ppFontStatus" class="pp-help" role="status"></p><label class="pp-field pp-font-size"><span>글자 크기</span><button type="button" data-font="-2" aria-label="글자 작게">−</button><input form="ppMakerControls" type="number" name="mottoSize" aria-label="문구 글자 크기" min="18" max="150" value="28"><span>px</span><button type="button" data-font="2" aria-label="글자 크게">+</button></label><div class="pp-actions"><button type="button" id="ppEditMotto">문구 수정</button><button type="button" id="ppCenterMotto">가운데</button><button type="button" id="ppResetMotto">초기화</button></div></div><div id="ppBlockTools" hidden><p class="pp-help">선택한 영역을 끌어 이동하세요. 버튼으로 조금씩 조절할 수도 있어요.</p><div class="pp-actions"><button type="button" data-block-move="left" aria-label="선택 영역 왼쪽으로">←</button><button type="button" data-block-move="up" aria-label="선택 영역 위로">↑</button><button type="button" data-block-move="down" aria-label="선택 영역 아래로">↓</button><button type="button" data-block-move="right" aria-label="선택 영역 오른쪽으로">→</button><button type="button" id="ppResetBlock">기본 위치</button></div></div><p id="ppEditHint" class="pp-help" aria-live="polite">사진·문구·SEEYA Diary·투어 스탬프·나의 기록을 선택해 편집하세요.</p></div><label class="pp-guide-toggle"><input id="ppShowGuides" type="checkbox"> 가운데 정렬선 표시 · 저장 이미지에는 제외</label><p id="ppOverlap" class="pp-maker-notice" role="status" hidden></p><p id="ppPhotoHint" class="pp-maker-notice" hidden>포토 티켓은 사진을 넣으면 중앙 공간이 채워져요. 사진 없이 기록을 담으려면 ‘선택한 기록’을 이용해 보세요.</p><p id="ppImageSize" class="pp-help"></p></div><form id="ppMakerControls" class="pp-form-grid">
 <label class="pp-field"><span>배경색</span><select name="color">${opts(Object.entries(R.COLORS).map(([id,c])=>[id,c.label]),'ink')}</select></label><label class="pp-field" id="ppDevice"><span>화면 크기</span><select name="device">${opts([['iphone','iPhone 일반 · 1170×2532'],['max','Pro Max · 1290×2796'],['android','Android · 1440×3120']],'iphone')}</select></label><p class="pp-help pp-wide">멤버 색은 팬페이지에서 구분을 위해 사용하는 색입니다.</p>
 <fieldset class="pp-wide pp-maker-box"><legend>사진 여러 장</legend><label class="pp-field"><span>사진 추가 · 최대 6장</span><input name="photo" type="file" multiple accept="image/jpeg,image/png,image/webp"></label><p id="ppPhotoStatus" class="pp-help" role="status">JPG·PNG·WebP · 1장당 최대 15MB. 사진은 서버로 전송하지 않습니다.</p><label class="pp-field"><span>편집할 사진</span><select id="ppPhotoList" aria-label="편집할 사진"></select></label><div class="pp-actions"><button type="button" id="ppRemovePhoto" disabled>선택 사진 삭제</button><button type="button" id="ppPhotoBack">뒤로</button><button type="button" id="ppPhotoFront">앞으로</button></div><p class="pp-help">사진을 선택해 끌어서 이동하고 모서리로 크기를 바꾸세요. 앞으로/뒤로는 사진끼리 겹치는 순서입니다. 사진은 모든 글씨 아래에 놓입니다. 같은 탭에서 메뉴를 이동하면 사진을 유지합니다. 새로고침하거나 탭을 닫으면 다시 선택해 주세요.</p></fieldset>
 <fieldset class="pp-wide pp-maker-box"><legend>문구 여러 개</legend><label class="pp-field"><span>편집할 문구</span><select id="ppMottoList" aria-label="편집할 문구"></select></label><div class="pp-actions"><button type="button" id="ppAddMotto">문구 추가</button><button type="button" id="ppRemoveMotto">선택 문구 삭제</button></div><label class="pp-field"><span>문구</span><textarea name="motto" maxlength="120" rows="2" placeholder="함께한 기억, 앞으로의 우리">${E(state.profile.motto)}</textarea></label><p class="pp-help">문구는 최대 8개까지 추가하고, 각각 글꼴·크기(18~150)·위치를 바꿀 수 있어요. 저장 전 다른 정보와 겹치지 않는지 확인해 주세요.</p></fieldset>
 <fieldset class="pp-wide pp-maker-box" id="ppRecordControls"><legend>이미지에 담을 기록</legend><label class="pp-checks"><input type="checkbox" name="showRecords"> 선택한 기록 표시</label><p class="pp-help">수첩에 저장한 기록을 최대 8개 골라 담습니다. 이달의 나에는 선택한 달의 기록만 표시합니다. 신분 카드에 기록을 넣으면 세로 이미지로 늘어납니다.</p><label class="pp-field"><span>내 기록 검색</span><input type="search" id="ppRecordSearch" placeholder="제목 또는 날짜로 찾기"></label><div id="ppRecordChoices" class="pp-record-choices"></div><p id="ppRecordCount" class="pp-help" role="status"></p><ol id="ppPickedRecords" class="pp-picked-records"></ol></fieldset>
 <label class="pp-checks pp-wide" id="ppTourOpt"><input type="checkbox" name="showTour" checked> 투어 도장·다음 일정 표시</label>
 ${[['photoX',50],['photoY',42],['mottoX',0],['mottoY',92]].map(([n,v])=>`<input type="hidden" name="${n}" value="${v}">`).join('')}
 <label class="pp-field pp-wide" id="ppImageEntry"><span>티켓에 담을 기록</span><select name="entry">${opts(state.entries.map(e=>[e.entryId,P.dateLabel(e.date)+' · '+e.title]),entryId||state.entries[0]?.entryId)}</select></label><label class="pp-field pp-wide" id="ppReviewMonth"><span>기록을 돌아볼 달</span><input type="hidden" name="period" value="month"><input type="month" name="month" value="${P.today().slice(0,7)}"></label><label class="pp-checks pp-wide"><input name="nickname" type="checkbox"> 닉네임 포함</label><label class="pp-checks pp-wide" id="ppSeatOpt"><input name="seat" type="checkbox"> 좌석 정보 포함</label><p class="pp-help pp-wide">기록의 결제금액·구매처·메모·동행인·첨부 링크는 이미지에 넣지 않습니다. 직접 선택한 사진과 작성한 문구는 저장·공유 이미지에 포함됩니다.</p><div class="pp-actions pp-wide"><button type="button" id="ppSaveImage" class="pp-primary">이미지 저장</button><button type="button" id="ppShareMade">이미지 공유</button></div></form></div></section>`;
 const f=document.getElementById('ppMakerControls'),canvas=document.getElementById('ppCanvas'),photoStatus=document.getElementById('ppPhotoStatus');
 if(recovered){for(const [k,v] of Object.entries(recovered.fields)){const input=f.elements.namedItem(k);if(!input||input.type==='file')continue;if(input.type==='checkbox')input.checked=!!v;else input.value=String(v);}document.getElementById('ppDraftNotice').textContent='편집 초안을 불러왔어요. 문구·배치를 이 탭에 임시 보관하며 사진은 새로고침 후 다시 선택해야 합니다. 초안은 기록 백업에 포함되지 않습니다.';}
 if(context.month&&/^\d{4}-(0[1-9]|1[0-2])$/.test(context.month))f.elements.month.value=context.month;
 if(entryId)f.elements.entry.value=entryId;
 if(mottos.length){for(const k of mottoKeys)f.elements[k].value=mottos[0][k];}
 photoCount=photos.length;if(photos.length){photoIndex=photos.length-1;photo=photos[photoIndex].image;for(const k of photoKeys)f.elements[k].value=photos[photoIndex][k];}
 const preview=Viewport(app,canvas);
 document.getElementById('ppShowGuides').onchange=e=>document.getElementById('ppEditStage').classList.toggle('pp-show-guides',e.target.checked);

 const values=()=>({...(blockPositions[type]||{}),type,photos,mottos,recordIds,showTour:f.elements.showTour.checked,showRecords:type==='records'||f.elements.showRecords.checked,color:f.elements.color.value,device:f.elements.device.value,entry:f.elements.entry.value,period:f.elements.period.value,month:f.elements.month.value,nickname:f.elements.nickname.checked,seat:f.elements.seat.checked,motto:f.elements.motto.value,mottoFont:f.elements.mottoFont.value,...Object.fromEntries(['photoSize','photoOpacity','photoX','photoY','mottoSize','mottoX','mottoY'].map(k=>[k,Number(f.elements[k].value)]))});
 function draw(){if(disposed||!canvas.isConnected)return;saveLayer();for(const [i,m] of mottos.entries()){const o=document.getElementById('ppMottoList').options[i];if(o)o.textContent='문구 '+(i+1)+(m.motto?' · '+m.motto.slice(0,16):'');}serial++;const v=values(),wallpaper=['lock','home'].includes(type),e=state.entries.find(e=>e.entryId===v.entry);document.getElementById('ppDevice').hidden=!wallpaper;document.getElementById('ppTourOpt').hidden=!wallpaper;document.getElementById('ppRecordControls').hidden=type==='ticket';f.elements.showRecords.disabled=type==='records';document.getElementById('ppImageEntry').hidden=type!=='ticket';document.getElementById('ppSeatOpt').hidden=type!=='ticket'||e?.kind!=='concert';document.getElementById('ppReviewMonth').hidden=type!=='review';for(const input of app.querySelectorAll('input[type=range]'))app.querySelector(`output[for="${input.name}"]`).textContent=Math.round(input.value)+input.dataset.unit;const s=R.draw(canvas,state,catalog,v,null,logos[v.color]);document.getElementById('ppImageSize').textContent=`${s.width} × ${s.height} PNG · ${templates[type]}`;preview.resize();syncSelection();draft();warnings(v);}

 function draft(){
  const fields={};for(const input of f.elements)if(input.name&&input.type!=='file')fields[input.name]=input.type==='checkbox'?input.checked:input.value;
  const data={version:1,type,fields,mottos:mottos.map(m=>({...m})),blocks:blockPositions,recordIds:[...recordIds]};const raw=JSON.stringify(data),fingerprint=raw+'|photos:'+photos.map(p=>[p.label,p.photoSize,p.photoOpacity,p.photoX,p.photoY].join(',')).join(';');
  memoryDraft=data;memoryPhotos=[...photos];try{sessionStorage.setItem(DRAFT_KEY,raw);draftFailed=false;}catch{draftFailed=true;document.getElementById('ppDraftNotice').textContent='초안을 기기에 임시 저장하지 못했어요. 같은 탭에서 메뉴를 이동하면 유지되지만 새로고침 전에 이미지를 저장해 주세요.';}
  if(initialized&&previousDraft!==fingerprint)context.dirty?.(true);previousDraft=fingerprint;
 }
 function warnings(v){
  const H=canvas.height/canvas.width*1080,g=canvas.getContext('2d'),boxes=mottos.filter(m=>m.motto.trim()).map(m=>{const b=R.mottoLayout(g,m,H);return {x:b.x,y:b.y-b.font,width:b.width,height:b.height};}),overlap=(a,b)=>a.x<b.x+b.width&&a.x+a.width>b.x&&a.y<b.y+b.height&&a.y+a.height>b.y;
  const fixed=type==='ticket'?[{x:70,y:110,width:940,height:280},{x:70,y:2060,width:940,height:790},{x:70,y:3050,width:940,height:120}]:type==='profile'?[{x:60,y:55,width:960,height:770}]:type==='review'?[{x:60,y:55,width:960,height:760}]:type==='records'?[{x:60,y:55,width:960,height:210}]:[];
  for(const k of ['brand','tour','records']){const b=R.blockLayout(k,state,catalog,v,H);if(b)fixed.push(b);}
  const hit=boxes.some((b,i)=>fixed.some(a=>overlap(a,b))||boxes.slice(i+1).some(a=>overlap(a,b))),note=document.getElementById('ppOverlap');note.hidden=!hit;note.textContent='문구가 기본 정보 또는 다른 문구 영역과 겹칠 수 있어요. 위치·크기를 확인해 주세요. 원하는 배치라면 그대로 저장할 수 있습니다.';
  document.getElementById('ppPhotoHint').hidden=type!=='ticket'||photos.length>0;
 }
 function saveLayer(){
  if(photos[photoIndex])for(const k of photoKeys)photos[photoIndex][k]=Number(f.elements[k].value);
  if(mottos[mottoIndex])for(const k of mottoKeys)mottos[mottoIndex][k]=['motto','mottoFont'].includes(k)?f.elements[k].value:Number(f.elements[k].value);
 }
 function layersUI(){
  document.getElementById('ppPhotoList').innerHTML=photos.map((p,i)=>`<option value="${i}" ${i===photoIndex?'selected':''}>${E(p.label)}</option>`).join('')||'<option>사진을 추가해 주세요</option>';
  document.getElementById('ppMottoList').innerHTML=mottos.map((p,i)=>`<option value="${i}" ${i===mottoIndex?'selected':''}>문구 ${i+1}${p.motto?' · '+E(p.motto.slice(0,16)):''}</option>`).join('')||'<option>문구를 추가해 주세요</option>';
  app.querySelector('[data-edit="photo"]').disabled=!photo;
  app.querySelector('[data-edit="motto"]').disabled=!mottos.length;
  document.getElementById('ppRemovePhoto').disabled=!photo;
  document.getElementById('ppPhotoBack').disabled=photoIndex<=0;
  document.getElementById('ppPhotoFront').disabled=photoIndex<0||photoIndex===photos.length-1;
  document.getElementById('ppRemoveMotto').disabled=!mottos.length;
  document.getElementById('ppAddMotto').disabled=mottos.length>=8;
  f.elements.motto.disabled=!mottos.length;
  document.getElementById('ppPhotoList').disabled=!photos.length;
  document.getElementById('ppMottoList').disabled=!mottos.length;
 }
 function chooseLayer(kind,index){
  saveLayer();gesture=null;selected=kind;
  if(kind==='photo'){photoIndex=index;const p=photos[index];photo=p?.image||null;if(p)for(const k of photoKeys)f.elements[k].value=p[k];}
  else{mottoIndex=index;const p=mottos[index];for(const k of mottoKeys)f.elements[k].value=p?.[k]??({motto:'',mottoFont:'basic',mottoSize:28,mottoX:0,mottoY:92}[k]);}
  if(kind==='photo'&&!photo||kind==='motto'&&!mottos[index])selected='none';
  layersUI();draw();
 }
 const resetPhoto=()=>{for(const [k,v] of Object.entries({photoSize:100,photoOpacity:type==='ticket'?100:45,photoX:50,photoY:type==='ticket'?38:42}))f.elements[k].value=v;};
 f.elements.photo.addEventListener('change',async()=>{
  const files=[...f.elements.photo.files||[]];if(!files.length||photoBusy)return;
  const run=++uploadSerial;photoBusy=true;f.elements.photo.disabled=true;exportState();let added=0,failed=0;
  photoStatus.textContent='사진을 불러오는 중이에요…';
  try{for(const file of files){
   if(disposed||run!==uploadSerial)break;
   if(photos.length>=6){failed+=files.length-added-failed;break;}
   if(!['image/jpeg','image/png','image/webp'].includes(file.type)||file.size>15*1024*1024){failed++;continue;}
   const url=URL.createObjectURL(file);
   try{const img=new Image();img.src=url;await img.decode();if(disposed||run!==uploadSerial)break;
    if(!img.naturalWidth||!img.naturalHeight||img.naturalWidth*img.naturalHeight>60000000)throw Error('size');
    const ratio=Math.min(1,2048/Math.max(img.naturalWidth,img.naturalHeight)),scaled=document.createElement('canvas');scaled.width=Math.max(1,Math.round(img.naturalWidth*ratio));scaled.height=Math.max(1,Math.round(img.naturalHeight*ratio));scaled.getContext('2d').drawImage(img,0,0,scaled.width,scaled.height);
    photos.push({image:scaled,label:'사진 '+(++photoCount),photoSize:photos.length?55:100,photoOpacity:type==='ticket'?100:65,photoX:50,photoY:Math.min(75,38+photos.length*8)});added++;chooseLayer('photo',photos.length-1);
   }catch{failed++;}finally{URL.revokeObjectURL(url);}
  }}finally{if(!disposed&&run===uploadSerial){photoBusy=false;f.elements.photo.disabled=false;f.elements.photo.value='';photoStatus.textContent=added+'장 추가 · 총 '+photos.length+'/6장'+(failed?' · '+failed+'장은 추가하지 못했어요. 형식·용량·최대 장수를 확인해 주세요.':'');exportState();}}
 });
 document.getElementById('ppPhotoList').onchange=e=>chooseLayer('photo',Number(e.target.value));
 document.getElementById('ppMottoList').onchange=e=>chooseLayer('motto',Number(e.target.value));
 document.getElementById('ppRemovePhoto').onclick=()=>{saveLayer();photos.splice(photoIndex,1);photoIndex=-1;photo=null;chooseLayer('photo',photos.length-1);photoStatus.textContent='총 '+photos.length+'/6장';};
 for(const [id,delta] of [['ppPhotoBack',-1],['ppPhotoFront',1]])document.getElementById(id).onclick=()=>{saveLayer();const next=photoIndex+delta;if(next<0||next>=photos.length)return;[photos[photoIndex],photos[next]]=[photos[next],photos[photoIndex]];photoIndex=-1;chooseLayer('photo',next);};
 document.getElementById('ppAddMotto').onclick=()=>{if(mottos.length>=8)return;saveLayer();mottos.push({motto:'새 문구',mottoFont:'basic',mottoSize:40,mottoX:50,mottoY:Math.max(10,85-mottos.length*12)});chooseLayer('motto',mottos.length-1);f.elements.motto.focus();};
 document.getElementById('ppRemoveMotto').onclick=()=>{saveLayer();mottos.splice(mottoIndex,1);mottoIndex=-1;chooseLayer('motto',mottos.length-1);loadFont();};
 document.getElementById('ppResetPhoto').onclick=()=>{resetPhoto();draw();};
 document.getElementById('ppResetMotto').onclick=()=>{f.elements.mottoSize.value=28;f.elements.mottoX.value=0;f.elements.mottoY.value=92;draw();};
 function recordChoices(){
  const q=document.getElementById('ppRecordSearch').value.trim().toLowerCase(),rows=state.entries.filter(e=>(type!=='review'||e.date.startsWith(f.elements.month.value))&&(e.title+' '+e.date).toLowerCase().includes(q));
  document.getElementById('ppRecordChoices').innerHTML=rows.slice(0,50).map(e=>`<label><input type="checkbox" data-record="${E(e.entryId)}" ${recordIds.includes(e.entryId)?'checked':''}><span>${E(e.title)}<small>${E(P.dateLabel(e.date))} · ${E(P.KINDS[e.kind])}</small></span></label>`).join('')||'<p class="pp-help">해당하는 기록이 없어요. 내 다이어리에서 기록을 먼저 남겨 주세요.</p>';
  document.getElementById('ppRecordCount').textContent=`${recordIds.length}/8개 선택`+(rows.length>50?' · 검색 결과는 50개씩 표시됩니다. 검색어로 좁혀 주세요.':'');
  document.getElementById('ppPickedRecords').innerHTML=recordIds.map((id,i)=>{const e=state.entries.find(e=>e.entryId===id);return `<li><span>${E(e?.title||'기록')}${type==='review'&&!e?.date.startsWith(f.elements.month.value)?' (다른 달 · 이미지에서 제외)':''}</span><button type="button" data-record-up="${i}" aria-label="선택 기록 ${i+1} 위로" ${i===0?'disabled':''}>↑</button><button type="button" data-record-down="${i}" aria-label="선택 기록 ${i+1} 아래로" ${i===recordIds.length-1?'disabled':''}>↓</button><button type="button" data-record-remove="${i}" aria-label="선택 기록 ${i+1} 빼기">×</button></li>`;}).join('');
 }
 document.getElementById('ppRecordSearch').oninput=recordChoices;
 document.getElementById('ppRecordChoices').onchange=e=>{const id=e.target.dataset.record;if(!id)return;if(e.target.checked){if(recordIds.length>=8){e.target.checked=false;say('기록은 한 이미지에 최대 8개까지 담을 수 있어요.');return;}recordIds.push(id);f.elements.showRecords.checked=true;}else recordIds.splice(recordIds.indexOf(id),1);recordChoices();draw();};
 document.getElementById('ppPickedRecords').onclick=e=>{const b=e.target.closest('button');if(!b)return;if(b.dataset.recordRemove!==undefined)recordIds.splice(Number(b.dataset.recordRemove),1);else{const up=b.dataset.recordUp!==undefined,i=Number(up?b.dataset.recordUp:b.dataset.recordDown),j=i+(up?-1:1);if(j>=0&&j<recordIds.length)[recordIds[i],recordIds[j]]=[recordIds[j],recordIds[i]];}recordChoices();draw();};
 app.querySelectorAll('[data-template]').forEach(b=>b.onclick=()=>{gesture=null;type=b.dataset.template;app.querySelectorAll('[data-template]').forEach(x=>x.setAttribute('aria-pressed',String(x===b)));recordChoices();draw();});const onInput=e=>{if(e.target.name==='mottoFont'){saveLayer();loadFont();return;}if(e.target.name!=='photo'){if(e.target.name==='motto')selected='motto';if(e.target.name==='month')recordChoices();draw();}};app.addEventListener('input',onInput);f.onsubmit=e=>e.preventDefault();
 const stage=document.getElementById('ppEditStage'),selection=document.getElementById('ppSelection');
 function geometry(){const v=values(),H=canvas.height/canvas.width*1080,g=canvas.getContext('2d');return {v,H,blocks:{brand:R.blockLayout('brand',state,catalog,v,H),tour:R.blockLayout('tour',state,catalog,v,H),records:R.blockLayout('records',state,catalog,v,H)},m:R.mottoLayout(g,v,H),r:photo?R.photoRect(photo.width,photo.height,1080,H,v):null};}
 function syncSelection(){
  const {H,m,r,blocks}=geometry();for(const k of Object.keys(blockNames)){app.querySelector('[data-edit='+k+']').hidden=!blocks[k];if(selected===k&&!blocks[k])selected='none';}const b=selected==='photo'?r:selected==='motto'&&values().motto.trim()?{x:m.x,y:m.y-m.font,width:m.width,height:m.height}:blocks[selected]||null;
  selection.hidden=!b;
  if(b){Object.assign(selection.style,{left:b.x/1080*100+'%',top:b.y/H*100+'%',width:b.width/1080*100+'%',height:b.height/H*100+'%'});selection.setAttribute('aria-label',(blockNames[selected]|| (selected==='photo'?'사진':'문구'))+' 이동 · 방향키로 미세 조절');}
  selection.querySelectorAll('[data-corner]').forEach(el=>el.hidden=selected!=='photo');
  document.getElementById('ppBlockTools').hidden=!blocks[selected];document.getElementById('ppPhotoTools').hidden=selected!=='photo';document.getElementById('ppMottoTools').hidden=selected!=='motto';
  app.querySelectorAll('[data-edit]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.edit===selected)));
  document.getElementById('ppEditHint').textContent=blocks[selected]?blockNames[selected]+' 영역을 끌어 이동 · 방향키로 미세 조절'+(selected==='brand'?' · 삭제할 수 없는 표시입니다.':''):selected==='photo'?'사진을 끌어 이동 · 모서리를 끌어 크기 조절':selected==='motto'?'문구를 끌어 이동 · 아래에서 글자 크기 조절':'사진·문구·SEEYA Diary·투어 스탬프·나의 기록을 선택해 편집하세요.';
 }
 function setValues(v){for(const [k,n] of Object.entries(v)){if(/^(brand|tour|records)[XY]$/.test(k))(blockPositions[type]||= {})[k]=n;else f.elements[k].value=n;}draw();}
 app.querySelectorAll('[data-edit]').forEach(b=>b.onclick=()=>{selected=b.dataset.edit;layersUI();syncSelection();});
 document.getElementById('ppResetBlock').onclick=()=>{const p=blockPositions[type]||{};delete p[selected+'X'];delete p[selected+'Y'];draw();};
 app.querySelectorAll('[data-block-move]').forEach(b=>b.onclick=()=>{const box=geometry().blocks[selected];if(!box)return;const [dx,dy]={left:[-12,0],right:[12,0],up:[0,-12],down:[0,12]}[b.dataset.blockMove];setValues(D.moveBlock(selected,box,dx,dy));});
 app.querySelectorAll('[data-font]').forEach(b=>b.onclick=()=>setValues({mottoSize:Math.max(18,Math.min(150,(Number(f.elements.mottoSize.value)||28)+Number(b.dataset.font)))}));
 document.getElementById('ppCenterPhoto').onclick=()=>setValues({photoX:50,photoY:50});
 document.getElementById('ppCenterMotto').onclick=()=>setValues({mottoX:50});
 document.getElementById('ppEditMotto').onclick=()=>f.elements.motto.focus();
 canvas.addEventListener('pointerdown',e=>{saveLayer();const box=canvas.getBoundingClientRect(),H=canvas.height/canvas.width*1080,x=(e.clientX-box.left)/box.width*1080,y=(e.clientY-box.top)/box.height*H,g=canvas.getContext('2d');const hit=b=>b&&x>=b.x&&x<=b.x+b.width&&y>=b.y&&y<=b.y+b.height;
  for(let i=mottos.length-1;i>=0;i--){const m=R.mottoLayout(g,mottos[i],H);if(mottos[i].motto.trim()&&hit({x:m.x,y:m.y-m.font,width:m.width,height:m.height})){chooseLayer('motto',i);return;}}
  for(const kind of ['brand','records','tour']){const b=R.blockLayout(kind,state,catalog,values(),H);if(hit(b)){selected=kind;syncSelection();return;}}
  for(let i=photos.length-1;i>=0;i--){const p=photos[i];if(hit(R.photoRect(p.image.width,p.image.height,1080,H,p))){chooseLayer('photo',i);return;}}
  selected='none';syncSelection();
 });
 selection.addEventListener('pointerdown',e=>{if(e.button!==0||gesture)return;e.preventDefault();const box=canvas.getBoundingClientRect();gesture={...geometry(),x:e.clientX,y:e.clientY,k:1080/box.width,corner:e.target.dataset.corner,id:e.pointerId,selected};selection.setPointerCapture(e.pointerId);});
 selection.addEventListener('pointermove',e=>{if(!gesture||e.pointerId!==gesture.id)return;const t=gesture,dx=(e.clientX-t.x)*t.k,dy=(e.clientY-t.y)*t.k;setValues(t.blocks[t.selected]?D.moveBlock(t.selected,t.blocks[t.selected],dx,dy):t.selected==='photo'?(t.corner?D.resizePhoto(t.v,t.r,t.corner,dx,dy,t.H):D.movePhoto(t.v,dx,dy,t.H)):D.moveMotto(t.v,t.m,dx,dy,t.H));});
 const stop=e=>{if(gesture&&e.pointerId===gesture.id){gesture=null;if(selection.hasPointerCapture(e.pointerId))selection.releasePointerCapture(e.pointerId);}};
 selection.addEventListener('pointerup',stop);selection.addEventListener('pointercancel',stop);selection.addEventListener('lostpointercapture',()=>gesture=null);
 selection.addEventListener('keydown',e=>{if(e.key==='Escape'){selected='none';syncSelection();return;}const dirs={ArrowLeft:[-1,0],ArrowRight:[1,0],ArrowUp:[0,-1],ArrowDown:[0,1]};if(!dirs[e.key])return;e.preventDefault();const {v,H,m,r,blocks}=geometry(),step=e.shiftKey?20:4,[dx,dy]=dirs[e.key].map(n=>n*step);setValues(blocks[selected]?D.moveBlock(selected,blocks[selected],dx,dy):selected==='photo'?(e.target.dataset.corner?D.resizePhoto(v,r,e.target.dataset.corner,dx,dy,H):D.movePhoto(v,dx,dy,H)):D.moveMotto(v,m,dx,dy,H));});
 function exportState(){for(const id of ['ppSaveImage','ppShareMade'])document.getElementById(id).disabled=!fontReady||!logoReady||photoBusy;}
 async function loadFont(){
  saveLayer();serial++;const run=++fontSerial,message=document.getElementById('ppFontStatus');
  const ids=[...new Set(mottos.map(m=>m.mottoFont).filter(id=>id!=='basic'))];
  if(!ids.length){fontReady=true;message.textContent='';exportState();draw();return;}
  fontReady=false;message.textContent='글꼴을 불러오는 중이에요…';exportState();
  const failed=[];
  await Promise.all(ids.map(async id=>{try{const loaded=await document.fonts.load(`400 32px ${R.fontFamily(id).split(',')[0]}`,'씨야와 함께한 기억 ABC');if(!loaded.length)throw Error('Font missing');}catch{failed.push(id);}}));
  if(disposed||run!==fontSerial)return;
  for(const m of mottos)if(failed.includes(m.mottoFont))m.mottoFont='basic';
  if(mottos[mottoIndex])f.elements.mottoFont.value=mottos[mottoIndex].mottoFont;
  fontReady=true;message.textContent=failed.length?'불러오지 못한 글꼴을 기본 고딕으로 바꿨어요.':'';exportState();draw();
 }
 const logoLoad=(async()=>{try{const img=new Image();img.src=Brand.logo;await img.decode();if(disposed)return;for(const [id,c] of Object.entries(R.COLORS)){const layer=document.createElement('canvas');layer.width=img.naturalWidth;layer.height=img.naturalHeight;const g=layer.getContext('2d');g.drawImage(img,0,0);g.globalCompositeOperation='source-in';g.fillStyle=c.fg;g.fillRect(0,0,layer.width,layer.height);logos[id]=layer;}logoReady=true;exportState();draw();}catch{if(!disposed)say('로고를 불러오지 못했어요. 새로고침 후 다시 시도해 주세요.');}})();
 async function output(share){if(!fontReady||!logoReady||photoBusy){say('사진·글꼴·로고를 불러온 뒤 저장해 주세요.');return;}draw();const version=serial,kind=type;const blob=await new Promise(resolve=>canvas.toBlob(resolve,'image/png'));if(disposed||!canvas.isConnected)return;if(version!==serial){say('이미지가 변경됐어요. 다시 저장해 주세요.');return;}if(!blob){say('이미지를 만들지 못했어요. 사진 크기를 줄이고 다시 시도해 주세요.');return;}const name=`with-you-${kind}.png`,file=new File([blob],name,{type:'image/png'});if(share&&navigator.canShare?.({files:[file]})){try{await navigator.share({files:[file]});}catch(e){if(e.name!=='AbortError')download(blob,name);}}else download(blob,name);context.dirty?.(false);}
 document.getElementById('ppSaveImage').onclick=()=>output(false).catch(()=>say('이미지 저장을 다시 시도해 주세요.'));document.getElementById('ppShareMade').onclick=()=>output(true).catch(()=>say('이미지 저장을 이용해 주세요.'));layersUI();recordChoices();exportState();draw();initialized=true;loadFont();
 const cleanup=()=>{draft();preview.dispose();disposed=true;uploadSerial++;fontSerial++;photo=null;photos.length=0;mottos.length=0;gesture=null;app.removeEventListener('input',onInput);};cleanup.hasPhotos=()=>photos.length>0||draftFailed;return cleanup;
};

module.exports.clearDraft=()=>{memoryDraft=null;memoryPhotos=[];try{sessionStorage.removeItem(DRAFT_KEY);}catch{}};

},
"src/client/passport-viewport.js":function(module,exports,__require){
'use strict';
// Resize only the displayed canvas. Export pixels and layer coordinates stay unchanged.
module.exports=function viewport(app,canvas){
 const layout=app.querySelector('.pp-maker-layout'),wrap=app.querySelector('.pp-canvas-wrap'),stage=app.querySelector('.pp-edit-stage');
 const home=document.createComment('editor home');layout.before(home);
 const bar=document.createElement('div');bar.className='pp-zoom-bar';
 bar.innerHTML='<button type="button" data-expand>크게 편집 ↗</button><label>화면 확대 <select aria-label="미리보기 확대"><option value="1">폭 맞춤</option><option value="fit">전체 보기</option><option value="1.5">150%</option><option value="2">200%</option><option value="3">300%</option></select></label>';
 const area=document.createElement('div');area.className='pp-preview-scroll';area.tabIndex=0;area.setAttribute('aria-label','이미지 편집 미리보기 · 확대 시 스크롤로 이동');
 stage.before(bar,area);area.append(stage);
 const hint=document.createElement('p');hint.className='pp-help';hint.textContent='확대하면 미리보기 안을 스크롤해 이동할 수 있어요. 요소 이동을 마치면 ‘완료’를 눌러 화면을 이동하세요.';area.after(hint);
 const dialog=document.createElement('dialog');dialog.className='pp-editor-dialog passport-page';dialog.setAttribute('aria-labelledby','ppBigEditorTitle');
 dialog.innerHTML='<header class="pp-big-header"><h2 id="ppBigEditorTitle">이미지 크게 편집</h2><button type="button" data-collapse>편집 화면 닫기</button></header><div class="pp-big-body"></div>';
 app.append(dialog);
 const scale=bar.querySelector('select'),expand=bar.querySelector('[data-expand]'),close=dialog.querySelector('[data-collapse]');let disposed=false,overflow='';
 function resize(){if(disposed||!canvas.width)return;const available=Math.max(1,area.clientWidth-24),ratio=canvas.height/canvas.width,width=scale.value==='fit'?Math.min(available,Math.max(1,parseFloat(getComputedStyle(area).maxHeight)-26)/ratio):available*Number(scale.value);stage.style.width=width+'px';canvas.style.width=width+'px';canvas.style.height=width*canvas.height/canvas.width+'px';}
 const observer=new ResizeObserver(resize);observer.observe(area);
 scale.onchange=()=>{resize();area.scrollTo(0,0);};
 function restore(){home.after(layout);expand.hidden=false;document.body.style.overflow=overflow;resize();expand.focus();}
 expand.onclick=()=>{overflow=document.body.style.overflow;dialog.querySelector('.pp-big-body').append(layout);expand.hidden=true;dialog.showModal();document.body.style.overflow='hidden';resize();close.focus();};
 close.onclick=()=>dialog.close();dialog.addEventListener('close',restore);
 resize();
 return {resize,dispose(){disposed=true;observer.disconnect();dialog.removeEventListener('close',restore);if(dialog.open){dialog.close();document.body.style.overflow=overflow;}dialog.remove();}};
};

},
"src/shared/passport-image.js":function(module,exports,__require){
'use strict';
const Play=__require("src/shared/passport-play.js");
const P=__require("src/shared/passport.js"),X=__require("src/shared/passport-extra.js");
const COLORS={ink:{label:'검은색',bg:'#19171c',fg:'#fff9fc',accent:'#efb8cd'},pink:{label:'핑크',bg:'#f7dce7',fg:'#34232d',accent:'#973358'},cream:{label:'크림',bg:'#fcf4e8',fg:'#352e27',accent:'#88583c'},white:{label:'흰색',bg:'#ffffff',fg:'#29232c',accent:'#963858'},gyuri:{label:'남규리 · 로즈',bg:'#d6487f',fg:'#ffffff',accent:'#fff2b5'},yeonji:{label:'김연지 · 바이올렛',bg:'#6b5bd1',fg:'#ffffff',accent:'#eddbff'},boram:{label:'이보람 · 틸',bg:'#2f8f7a',fg:'#ffffff',accent:'#d8fff4'}};
const FONTS={basic:{label:'기본 고딕',family:'Arial, "Malgun Gothic", sans-serif'},dodum:{label:'고운돋움',family:'"Passport Dodum", sans-serif'},batang:{label:'고운바탕',family:'"Passport Batang", serif'},pen:{label:'나눔손글씨 펜',family:'"Passport Pen", cursive'}};
const fontFamily=id=>(FONTS[id]||FONTS.basic).family;
const clamp=(v,min,max)=>Math.max(min,Math.min(max,Number(v)||0));
function size(type,device,opts={}){return ['lock','home'].includes(type)?({iphone:[1170,2532],max:[1290,2796],android:[1440,3120]}[device]||[1170,2532]):type==='ticket'?[1080,3240]:(type==='review'||type==='records'||type==='profile'&&opts.showRecords)?[1080,1920]:[1080,1080];}
function photoRect(iw,ih,w,h,opts){const ratio=Math.min(w/iw,h/ih)*clamp(opts.photoSize,10,200)/100;const width=iw*ratio,height=ih*ratio;return {x:w*clamp(opts.photoX,0,100)/100-width/2,y:h*clamp(opts.photoY,0,100)/100-height/2,width,height};}
function wrap(g,value,width,maxLines=4){let line='',lines=[];const tokens=String(value).match(/[A-Za-z0-9]+|[^\n]|\n/gu)||[];for(const token of tokens){for(const ch of g.measureText(token).width>width?[...token]:[token]){if(ch==='\n'||g.measureText(line+ch).width>width&&line){lines.push(line.trimEnd());line=ch==='\n'?'':ch.trimStart();}else line+=ch;}}lines.push(line);if(lines.length>maxLines){lines=lines.slice(0,maxLines);let last=lines[maxLines-1];while(last&&g.measureText(last+'…').width>width)last=last.slice(0,-1);lines[maxLines-1]=last+'…';}return lines;}
function text(g,value,x,y,font,width=920,lineHeight=font*1.4,maxLines=4){g.font=`${font>=40?'600':'400'} ${font}px Arial, sans-serif`;const lines=wrap(g,value,width,maxLines);lines.forEach((line,i)=>g.fillText(line,x,y+i*lineHeight));return lines.length*lineHeight;}
function mottoLayout(g,opts,h){
 const font=clamp(opts.mottoSize,18,150);g.font=`400 ${font}px ${fontFamily(opts.mottoFont)}`;
 const top=Math.max(80,font+32),maxLines=Math.max(1,Math.min(8,Math.floor((h-top-110)/(font*1.35))));
 const lines=wrap(g,opts.motto||'',880,maxLines),width=Math.max(1,...lines.map(s=>g.measureText(s).width)),height=lines.length*font*1.35;
 const travelX=Math.max(0,952-width),travelY=Math.max(0,h-110-height-top);
 return {font,lines,width,height,travelX,travelY,x:64+travelX*clamp(opts.mottoX,0,100)/100,y:top+travelY*clamp(opts.mottoY,0,100)/100,lineHeight:font*1.35};
}
// Shared bounds keep preview selection, dragging and PNG output in the same coordinates.
function blockLayout(kind,state,catalog,opts,H){
 const wallpaper=['lock','home'].includes(opts.type),tour=kind==='tour';
 if(kind==='brand'){
  const isTicket=opts.type==='ticket',width=isTicket?380:opts.nickname?928:360,height=isTicket?94:64;
  const baseX=isTicket?88:76,baseY=isTicket?208:(wallpaper?(opts.showRecords?300:opts.type==='lock'?H*.44:H*.62):100)-44;
  const travelX=1080-width-40,travelY=H-height-100;
  const pos=(v,base,travel)=>v===undefined||v===null||v===''?base:20+travel*clamp(v,0,100)/100;
  return {x:pos(opts.brandX,baseX,travelX),y:pos(opts.brandY,baseY,travelY),width,height,baseX,baseY,travelX,travelY};
 }

 if(tour?(!wallpaper||opts.showTour===false):(opts.type==='ticket'||!opts.showRecords&&opts.type!=='records'))return null;
 const baseY=tour?(opts.showRecords?300:opts.type==='lock'?H*.44:H*.62)+90-36:(opts.type==='profile'?960:opts.type==='review'?970:opts.type==='records'?340:opts.showTour===false?540:960)-30;
 const count=chosenEntries(state,opts).length;
 const height=tour?443:count?180+(count-1)*recordGap(count,opts.type==='records'):140;
 const width=960,travelX=1080-width-40,travelY=Math.max(0,H-height-100);
 const resolve=(v,base,travel)=>v===undefined||v===null||v===''?Math.max(20,Math.min(20+travel,base)):20+travel*clamp(v,0,100)/100;
 const x=resolve(opts[kind+'X'],60,travelX),y=resolve(opts[kind+'Y'],baseY,travelY);
 return {x,y,width,height,baseX:60,baseY,travelX,travelY};
}
// A narrow keepsake ticket: photo-led, scalloped ends, compact record details.
function ticket(g,e,state,opts,H,c,logo){
 const {fg,accent,bg}=c;
 g.strokeStyle=accent;g.lineWidth=2;g.strokeRect(48,60,984,H-100);
 g.fillStyle=accent;text(g,'WITH YOU · MEMORY TICKET',88,154,28,900,40,1);
 g.fillStyle=fg;const brand=blockLayout('brand',state,null,opts,H);g.save();g.translate(brand.x-brand.baseX,brand.y-brand.baseY);drawLogo(g,logo,88,208,380);g.restore();
 text(g,'우리의 한 장면',94,362,30,880,45,1);
 // The large central area is reserved for the chosen photo.
 g.save();g.shadowBlur=0;g.fillStyle=bg;g.globalAlpha=.9;g.fillRect(50,2060,980,760);g.restore();
 g.fillStyle=accent;text(g,e?P.KINDS[e.kind]:'나의 기록',88,2140,26,900,38,1);
 g.fillStyle=fg;text(g,e?.title||'기록을 선택해 주세요',88,2230,56,904,76,3);
 text(g,e?.kind==='play'?Play.summary(e.play):e?.kind==='goods'?'나의 굿즈 컬렉션':e?.snapshot?.place||'나의 기억 속 한 장면',88,2510,30,900,42,2);
 g.strokeStyle=accent;g.setLineDash([10,10]);g.beginPath();g.moveTo(64,2640);g.lineTo(1016,2640);g.stroke();g.setLineDash([]);
 text(g,e?P.dateLabel(e.date)+(e.time?' · '+e.time:''):'WITH YOU',88,2720,35,900,48,1);
 const detail=opts.nickname?state.profile.nickname||'WITH YOU':'WITH YOU';
 text(g,detail+(e?.kind==='concert'&&opts.seat&&e.seat?' · '+e.seat:e?.kind==='goods'?' · '+(e.goods?.quantity||1)+'개':''),88,2790,28,900,38,1);
 // Decorative stripe motif only; not an admission code.
 g.save();g.shadowBlur=0;g.fillStyle=fg;let x=90;for(let i=0;i<84;i++){const w=[2,5,3,7,2,4][i%6];g.fillRect(x,3060,w,48);x+=w+6;}g.restore();
 g.fillStyle=accent;text(g,'나의 추억을 담은 소장용 티켓',88,3152,22,900,30,1);
}
function ticketCutouts(g,H){
 g.save();g.globalCompositeOperation='destination-out';g.shadowBlur=0;
 for(const y of [0,H])for(let x=45;x<1080;x+=90){g.beginPath();g.arc(x,y,24,0,Math.PI*2);g.fill();}
 g.restore();
}
function drawLogo(g,logo,x,y,w){
 if(!logo)return;
 g.save();g.shadowBlur=0;g.drawImage(logo,x,y,w,w*(logo.naturalHeight||logo.height)/(logo.naturalWidth||logo.width));g.restore();
}
function draw(canvas,state,catalog,opts,photo,logo){
 const type=opts.type,[w,h]=size(type,opts.device,opts);canvas.width=w;canvas.height=h;
 const g=canvas.getContext('2d'),scale=w/1080,H=h/scale,c=COLORS[opts.color]||COLORS.ink;
 g.scale(scale,scale);g.fillStyle=c.bg;g.fillRect(0,0,1080,H);
 // Layer order is fixed: background -> user's photo -> structure/text -> custom phrase.
 const layers=Array.isArray(opts.photos)?opts.photos:photo?[{image:photo,...opts}]:[];
 for(const layer of layers){const img=layer.image;if(!img)continue;const r=photoRect(img.width,img.height,1080,H,layer);g.save();g.globalAlpha=clamp(layer.photoOpacity,0,100)/100;g.drawImage(img,r.x,r.y,r.width,r.height);g.restore();}
 g.fillStyle=c.fg;g.shadowColor=c.bg;g.shadowBlur=layers.length?10:0;
 const wallpaper=['lock','home'].includes(type),years=state.profile.since?Number(P.today().slice(0,4))-Number(state.profile.since.slice(0,4))+1:0;
 if(type==='ticket')ticket(g,state.entries.find(e=>e.entryId===opts.entry),state,opts,H,c,logo);
 else {
  let y=wallpaper?(opts.showRecords?300:type==='lock'?H*.44:H*.62):100;
  const brand=blockLayout('brand',state,catalog,opts,H);g.save();g.translate(brand.x-brand.baseX,brand.y-brand.baseY);drawLogo(g,logo,76,y-44,230);text(g,'DIARY'+(opts.nickname&&state.profile.nickname?' · '+state.profile.nickname:''),346,y,24,650,32,1);g.restore();y+=90;
  if(wallpaper&&opts.showTour!==false){const b=blockLayout('tour',state,catalog,opts,H);g.save();g.translate(b.x-b.baseX,b.y-b.baseY);text(g,'THE FAN · TOUR STAMPS',76,y,28,920,40);y+=85;catalog.tour.forEach((t,i)=>{const x=160+(i%4)*250,cy=y+Math.floor(i/4)*175,done=X.tourEntries(t,state.entries).length>0;g.save();g.shadowBlur=0;g.beginPath();g.arc(x,cy,64,0,Math.PI*2);g.strokeStyle=c.accent;g.fillStyle=done?'#a13259':c.bg;g.setLineDash(done?[]:[6,7]);g.fill();g.stroke();g.restore();g.fillStyle=done?'#fff':c.fg;g.textAlign='center';text(g,t.label,x,cy+5,28,150,35,1);text(g,t.date.slice(5).replace('-','.'),x,cy-28,18,150,25,1);g.textAlign='left';});g.fillStyle=c.fg;y+=310;const next=catalog.tour.filter(t=>t.date>=P.today()).sort((a,b)=>a.date.localeCompare(b.date))[0];if(next)text(g,`NEXT · ${next.label} ${next.date} · D-${Math.round((Date.parse(next.date)-Date.parse(P.today()))/86400000)}`,76,y,26,920,40);g.restore();}
  else if(type==='profile'){
   text(g,opts.nickname?state.profile.nickname||'WITH YOU':'WITH YOU',76,235,64,920,82);
   g.fillStyle=c.accent;text(g,years?years+'년차 씨야 덕후':'우리의 첫 페이지',76,322,38,920,52);
   g.fillStyle=c.fg;text(g,state.profile.since?'SINCE · '+P.dateLabel(state.profile.since):'SINCE · 좋아한 날 미기록',76,384,26,920,38,1);
   text(g,'MY MEMBER · '+(P.MEMBERS[state.profile.favMember]||'씨야 완전체'),76,441,28,920,40,1);
   text(g,'MY SONG · '+(state.profile.favSong||'아직 고르는 중'),76,493,28,920,38,2);
   g.strokeStyle=c.accent;g.beginPath();g.moveTo(76,550);g.lineTo(1004,550);g.stroke();
   const counts=P.summary(state.entries);
   [[counts.concert,'공연 관람'],[counts.visit,'장소 방문'],[X.songs(state.entries).length,'라이브로 들은 곡'],[counts.goods,'굿즈 구매 기록']].forEach(([n,label],i)=>{const x=76+(i%2)*480,y=625+Math.floor(i/2)*140;g.fillStyle=c.accent;text(g,String(n),x,y,64,430,80,1);g.fillStyle=c.fg;text(g,label,x,y+49,27,430,38,1);});
  }
  else if(type==='records'){text(g,'내가 고른 순간들',76,235,54,920,80);}
  else if(!wallpaper){let rows=state.entries;if(type==='review'){const period=opts.period==='year'?opts.month.slice(0,4):opts.month;rows=rows.filter(e=>e.date.startsWith(period));text(g,period+' · '+(opts.period==='year'?'올해의 나':'이달의 나'),76,y,52,920,80);}else text(g,'함께 쌓은 순간들',76,y,54,920,80);const counts=P.summary(rows);y+=145;for(const [v,label] of [[counts.concert,'공연 관람'],[counts.visit,'장소 방문'],[X.songs(rows).length,'라이브로 들은 곡'],[counts.goods,'굿즈 구매 기록']]){g.fillStyle=c.accent;text(g,String(v),76,y,76,920,90);g.fillStyle=c.fg;text(g,label,250,y,32,710,48);y+=140;}if(type==='review'&&opts.showRecords===undefined)rows.filter(e=>P.completed(e)).slice(0,4).forEach(e=>{text(g,P.dateLabel(e.date)+' · '+e.title,76,y,26,920,40,2);y+=100;});}
 }
 if(type!=='ticket'&&(opts.showRecords||type==='records')){
  const rows=chosenEntries(state,opts),y=type==='profile'?960:type==='review'?970:type==='records'?340:opts.showTour===false?540:960;
  const b=blockLayout('records',state,catalog,opts,H);g.save();g.translate(b.x-b.baseX,b.y-b.baseY);recordList(g,rows,y,c,type==='records');g.restore();
 }
 const phrases=Array.isArray(opts.mottos)?opts.mottos:[opts];
 for(const phrase of phrases){const m=mottoLayout(g,phrase,H);g.fillStyle=c.fg;g.font=`400 ${m.font}px ${fontFamily(phrase.mottoFont)}`;m.lines.forEach((line,i)=>g.fillText(line,m.x,m.y+i*m.lineHeight));}
 g.fillStyle=c.accent;text(g,'SEEYA ARCHIVE · 나의 기억으로 남긴 기록',76,H-50,18,920,28,1);
 if(type==='ticket')ticketCutouts(g,H);
 return {width:w,height:h};
}
function chosenEntries(state,opts){
 const ids=[...new Set(Array.isArray(opts.recordIds)?opts.recordIds:[])].slice(0,8);
 return ids.map(id=>state.entries.find(e=>e.entryId===id)).filter(e=>e&&(opts.type!=='review'||e.date.startsWith(opts.month||P.today().slice(0,7))));
}
function recordGap(count,standalone){return standalone?(count>6?180:205):110;}
function recordList(g,rows,y,c,standalone){
 g.fillStyle=c.accent;text(g,'MY RECORDS · '+rows.length,76,y,24,920,35,1);y+=65;
 if(!rows.length){g.fillStyle=c.fg;text(g,'담고 싶은 기록을 선택해 주세요',76,y,28,920,40,1);return;}
 const gap=recordGap(rows.length,standalone);
 for(const e of rows){g.fillStyle=c.accent;text(g,P.dateLabel(e.date)+' · '+(P.completed(e)?'나의 기록':'예정'),76,y,22,920,30,1);g.fillStyle=c.fg;text(g,e.title,76,y+40,30,920,38,2);y+=gap;}
}
module.exports={blockLayout,chosenEntries,FONTS,fontFamily,COLORS,size,photoRect,mottoLayout,draw};

},
"src/shared/passport-image-edit.js":function(module,exports,__require){
'use strict';
const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
// All edits use the same 1080-wide coordinates as the exported canvas.
function movePhoto(v,dx,dy,h){return {photoX:clamp(v.photoX+dx/1080*100,0,100),photoY:clamp(v.photoY+dy/h*100,0,100)};}
function moveMotto(v,m,dx,dy,h){return {mottoX:clamp(v.mottoX+dx/Math.max(1,m.travelX??952-m.width)*100,0,100),mottoY:clamp(v.mottoY+dy/Math.max(1,m.travelY??h-190-m.height)*100,0,100)};}
function resizePhoto(v,r,corner,dx,dy,h){
 const sx=corner.includes('w')?-1:1,sy=corner.includes('n')?-1:1;
 const ratio=clamp(1+(sx*dx*r.width+sy*dy*r.height)/(r.width*r.width+r.height*r.height),10/v.photoSize,200/v.photoSize);
 const width=r.width*ratio,height=r.height*ratio;
 const cx=r.x+r.width/2+sx*(width-r.width)/2,cy=r.y+r.height/2+sy*(height-r.height)/2;
 return {photoSize:v.photoSize*ratio,photoX:clamp(cx/1080*100,0,100),photoY:clamp(cy/h*100,0,100)};
}
function moveBlock(kind,b,dx,dy){return {[kind+'X']:clamp((b.x-20+dx)/Math.max(1,b.travelX)*100,0,100),[kind+'Y']:clamp((b.y-20+dy)/Math.max(1,b.travelY)*100,0,100)};}
module.exports={moveBlock,movePhoto,moveMotto,resizePhoto};

},
"src/client/diary-drive.js":function(module,exports,__require){
'use strict';
const P=__require("src/shared/passport.js"),API=__require("src/client/diary-drive-api.js"),config=__require("src/data/diary-drive.json");
const service=API.create(config.clientId,{fetch:(...args)=>fetch(...args)}),E=P.esc;
let ready=false,loading=null,busy=false,notice='',files=[],next='',listed=false;
const listeners=new Set(),refresh=()=>listeners.forEach(fn=>fn());
const dateLabel=value=>{const d=new Date(value);return Number.isFinite(d.getTime())?d.toLocaleString('ko-KR'):'날짜 확인 필요';};
function loadGoogle(){
 if(window.google?.accounts?.oauth2)return Promise.resolve(window.google);
 if(loading)return loading;
 loading=new Promise((resolve,reject)=>{const script=document.createElement('script');script.src='https://accounts.google.com/gsi/client';script.async=true;script.referrerPolicy='no-referrer';let done=false;const finish=error=>{if(done)return;done=true;clearTimeout(timer);if(error){script.remove();loading=null;reject(error);}else resolve(window.google);};const timer=setTimeout(()=>finish(Error('Google 연결 화면을 불러오지 못했어요. 인터넷 연결을 확인해 주세요.')),15000);script.onload=()=>finish(window.google?.accounts?.oauth2?null:Error('Google 연결을 준비하지 못했어요.'));script.onerror=()=>finish(Error('Google 연결 화면을 불러오지 못했어요. 인터넷 연결을 확인해 주세요.'));document.head.append(script);});
 return loading;
}
function mount(root,{getState,onRestore,onRestoreStart,onBackedUp}){
 const configured=API.validClientId(config.clientId);
 function render(){
  if(!root.isConnected)return;
  const account=service.account();let last=null;try{last=JSON.parse(localStorage.getItem('seeya-diary-drive-last')||'null');}catch{}
  root.innerHTML=`<section class="pp-panel pp-drive"><div class="pp-drive-heading"><span class="pp-label">MY PRIVATE BACKUP</span><span class="pp-drive-badge">${!configured?'연결 준비 중':account?'연결됨':'선택 기능'}</span></div><h2>Google Drive에 백업</h2><p>내 구글 드라이브에 다이어리를 보관하고, 다른 기기에서도 백업을 불러올 수 있어요.</p><p class="pp-help">신분 카드와 모든 기록을 저장합니다. 메모·좌석·동행인·구매 금액도 포함돼요. 사진과 이미지 편집 초안은 포함되지 않습니다.</p>${!configured?'<div class="pp-drive-note">구글 연결을 준비하고 있어요. 지금은 아래의 파일 백업을 이용해 주세요.</div><button disabled>Google Drive 연결 준비 중</button>':`<div class="pp-drive-account">${account?`<b>${E(account.emailAddress)}</b><span>이 계정의 내 드라이브에 저장합니다.</span>`:'구글 연결은 선택 사항입니다. 연결하지 않아도 다이어리를 사용할 수 있어요.'}</div><div class="pp-actions">${account?`<button data-drive="backup" class="pp-primary" ${busy?'disabled':''}>지금 백업 (${getState().entries.length}개 기록)</button><button data-drive="list" ${busy?'disabled':''}>백업 목록 보기</button><button data-drive="disconnect" ${busy?'disabled':''}>이 창 연결 해제</button>`:`<button data-drive="connect" class="pp-primary" ${busy?'disabled':''}>${ready?'Google 계정 선택':'Google Drive 연결'}</button>`}</div>`}<p class="pp-drive-status" role="status" aria-live="polite">${E(notice)}</p>${last?`<p class="pp-help">이 브라우저에서 마지막 백업 성공: ${E(dateLabel(last.at))} · ${Number(last.count)||0}개 기록</p>`:''}<p class="pp-help">버튼을 눌러 백업한 시점의 기록을 날짜별 새 파일로 보관합니다. 자동 백업·기기 간 자동 동기화는 하지 않습니다. 새로고침하거나 연결 시간이 지나면 다시 연결해 주세요.</p><details class="pp-drive-details"><summary>백업과 개인정보 안내</summary><p>연결한 계정에 저장하며 사이트 운영자에게 기록을 보내지 않습니다. 백업 파일은 자동으로 공유하지 않습니다. 개인 Drive에서 파일을 직접 공유하면 그 파일의 내용도 상대방에게 전달됩니다.</p><p>이 창 연결 해제는 구글 계정 로그아웃이나 백업 삭제가 아닙니다. 접근 권한은 <a href="https://myaccount.google.com/connections" target="_blank" rel="noopener noreferrer">Google 계정의 연결 관리</a>에서 취소할 수 있어요.</p><p><a href="/diary/privacy/">다이어리 개인정보 처리 안내</a></p></details>${account&&listed?`<div class="pp-drive-files"><h3>백업 목록</h3><p class="pp-help">이 사이트에서 해당 계정에 만든 백업을 최신순으로 표시해요. 예전 백업은 자동 삭제하지 않습니다. 불필요한 파일은 내 Drive에서 정리해 주세요.</p>${files.length?files.map((file,i)=>`<div class="pp-drive-file"><div><strong>${E(dateLabel(file.createdTime))}</strong><span>${E(file.appProperties?.entries||'?')}개 기록 · ${E(file.name)}</span></div><button data-drive="restore" data-index="${i}" ${busy?'disabled':''}>내용 확인</button></div>`).join(''):'<p>저장된 백업이 아직 없어요. 지금 백업으로 첫 기록을 보관해 보세요.</p>'}${next?`<button data-drive="more" ${busy?'disabled':''}>이전 백업 더 보기</button>`:''}</div>`:''}</section>`;
 }
 listeners.add(render);render();
 async function act(ev){
  const button=ev.target.closest('[data-drive]');if(!button||busy)return;
  const action=button.dataset.drive;
  if(action==='disconnect'){service.disconnect();files=[];next='';listed=false;notice='이 창의 연결을 해제했어요. 기록과 Drive 백업은 그대로 남아 있습니다.';refresh();return;}
  if(navigator.onLine===false){notice='인터넷에 연결한 뒤 이용해 주세요. 기기에 저장한 기록은 그대로예요.';refresh();return;}
  const selected=files[Number(button.dataset.index)];busy=true;notice=action==='backup'?'백업 파일을 저장하고 내용을 확인하고 있어요. 이 창을 닫지 마세요.':'불러오는 중이에요.';
  // The OAuth popup must be requested synchronously from the account-selection click.
  let connection;if(action==='connect'&&ready){try{connection=service.connect();}catch(e){connection=Promise.reject(e);}}
  refresh();
  try{
   if(action==='connect'){
    if(!ready){service.prepare(await loadGoogle());ready=true;notice='준비됐어요. ‘Google 계정 선택’을 눌러 연결해 주세요.';}
    else{await connection;files=[];next='';listed=false;notice='계정을 연결했어요. 지금 백업하거나 기존 백업 목록을 확인해 주세요.';}
   }else if(action==='backup'){
    const snapshot=P.validate(getState()),result=await service.backup(snapshot);
    try{localStorage.setItem('seeya-diary-drive-last',JSON.stringify({at:result.exportedAt,count:result.count}));}catch{}
    onBackedUp(snapshot);notice=`${result.count}개 기록을 백업하고 저장 내용을 확인했어요.`;
    files=[];next='';listed=false;
   }else if(action==='list'||action==='more'){
    const result=await service.list(action==='more'?next:'');files=action==='more'?[...files,...(result.files||[])]:result.files||[];next=result.nextPageToken||'';listed=true;notice='백업을 선택하면 적용 전에 내용을 확인할 수 있어요.';
   }else if(action==='restore'){
    const requestId=onRestoreStart();const value=await service.read(selected);
    if(root.isConnected){notice=onRestore(value,selected.name,requestId)===false?'다른 백업 선택으로 이번 복원 확인을 취소했어요.':'아래 복원 확인란에서 내용을 확인하고 적용해 주세요.';}
    else notice='백업 내용을 읽었지만 화면을 이동하여 복원 확인을 취소했어요. 다시 선택해 주세요.';
   }
  }catch(e){notice=e.message||'요청을 완료하지 못했어요. 기존 기록은 바뀌지 않았습니다.';if(!service.connected()){files=[];next='';listed=false;}}
  finally{busy=false;refresh();}
 }
 root.addEventListener('click',act);
 return ()=>{listeners.delete(render);root.removeEventListener('click',act);};
}
module.exports={mount};

},
"src/client/diary-drive-api.js":function(module,exports,__require){
'use strict';
const P=__require("src/shared/passport.js");
const SCOPE='https://www.googleapis.com/auth/drive.file',MARKER='seeya-diary-v1',MAX_BYTES=8*1024*1024;
const validClientId=id=>typeof id==='string'&&/^\d+-[a-zA-Z0-9_-]+\.apps\.googleusercontent\.com$/.test(id);
// Credentials live only in this module instance, never in browser storage or URLs.
function create(clientId,env){
 let token='',expires=0,user=null,oauth=null,serial=0;
 const now=()=>env.now?env.now():Date.now();
 const connected=()=>!!token&&now()<expires;
 const disconnect=()=>{serial++;token='';expires=0;user=null;};
 const requireToken=()=>{if(!connected()){disconnect();throw Error('연결 시간이 지났어요. Google 계정을 다시 연결해 주세요.');}return token;};
 async function request(url,options={}){
  const u=new URL(url);if(u.origin!=='https://www.googleapis.com'||!/^\/(?:upload\/)?drive\/v3\//.test(u.pathname))throw Error('지원하지 않는 백업 주소입니다.');
  const usedToken=requireToken(),controller=new AbortController(),timer=setTimeout(()=>controller.abort(),45000);
  try{
   const response=await env.fetch(u.href,{...options,headers:{...options.headers,Authorization:'Bearer '+usedToken},credentials:'omit',cache:'no-store',redirect:'error',signal:controller.signal});
   if(token!==usedToken)throw Error('연결 계정이 바뀌었어요. 다시 시도해 주세요.');
   if(!response.ok){
    if(response.status===401){disconnect();throw Error('연결 시간이 지났어요. Google 계정을 다시 연결해 주세요.');}
    let reason='';try{reason=(await response.json()).error?.errors?.[0]?.reason||'';}catch{}
    if(reason==='storageQuotaExceeded')throw Error('Google Drive 저장 공간이 부족해요. 공간을 확보한 뒤 다시 시도해 주세요.');
    if(response.status===403)throw Error('Google Drive 접근을 허용하지 못했어요. 계정 권한이나 사이트 연결 설정을 확인해 주세요.');
    if(response.status===404)throw Error('백업 파일을 찾지 못했어요. 삭제됐거나 다른 계정의 파일일 수 있어요.');
    if(response.status===429||response.status>=500)throw Error('Google Drive가 잠시 응답하지 않아요. 조금 뒤 다시 시도해 주세요.');
    throw Error('Google Drive 요청을 완료하지 못했어요. 다시 시도해 주세요.');
   }
   return response;
  }catch(e){if(e.name==='AbortError'||e instanceof TypeError)throw Error('인터넷 연결이 끊겼거나 응답이 늦어요. 완료 여부를 목록에서 확인한 뒤 다시 시도해 주세요.');throw e;}finally{clearTimeout(timer);}
 }
 function prepare(google){
  if(!validClientId(clientId))throw Error('Google Drive 연결을 준비 중입니다. 파일 백업을 이용해 주세요.');
  oauth=google.accounts.oauth2;
 }
 function connect(){
  if(!oauth)throw Error('Google 연결 화면을 먼저 준비해 주세요.');
  disconnect();const attempt=serial;
  return new Promise((resolve,reject)=>{
   let settled=false;const finish=(error,value)=>{if(settled)return;settled=true;clearTimeout(timer);error?reject(error):resolve(value);};
   const timer=setTimeout(()=>{if(serial===attempt)disconnect();finish(Error('연결 시간이 길어졌어요. 계정 선택 창을 닫고 다시 연결해 주세요.'));},120000);
   let client;try{client=oauth.initTokenClient({client_id:clientId,scope:SCOPE,include_granted_scopes:false,
    callback:async result=>{
     if(settled||serial!==attempt)return;
     if(result.error||!result.access_token||!oauth.hasGrantedAllScopes(result,SCOPE)){finish(Error('Google Drive 연결이 취소됐거나 저장 권한이 허용되지 않았어요.'));return;}
     token=result.access_token;expires=now()+Math.max(0,Number(result.expires_in)*1000-60000);
     try{const data=await (await request('https://www.googleapis.com/drive/v3/about?fields=user(displayName,emailAddress)')).json();if(settled||serial!==attempt)return;user=data.user;if(!user?.emailAddress)throw Error('연결된 계정을 확인하지 못했어요.');finish(null,{...user});}catch(e){if(serial===attempt)disconnect();finish(e);}
    },error_callback:e=>finish(Error(e.type==='popup_failed_to_open'?'계정 선택 창이 차단됐어요. 팝업을 허용한 뒤 다시 연결해 주세요.':'Google 계정 연결을 취소했어요.'))});}catch{finish(Error('Google 연결 설정을 확인해 주세요.'));return;}
   try{client.requestAccessToken({prompt:'select_account'});}catch{finish(Error('Google 계정 선택 창을 열지 못했어요. 다시 시도해 주세요.'));}
  });
 }
 async function list(pageToken=''){
  const query=new URLSearchParams({q:"trashed = false and 'me' in owners and appProperties has { key='seeyaBackup' and value='"+MARKER+"' }",spaces:'drive',orderBy:'createdTime desc',pageSize:'20',fields:'nextPageToken,files(id,name,createdTime,size,mimeType,appProperties)'});
  if(pageToken)query.set('pageToken',pageToken);
  return (await request('https://www.googleapis.com/drive/v3/files?'+query)).json();
 }
 async function read(file){
  if(!file||!/^[-\w]+$/.test(file.id)||file.mimeType!=='application/json'||file.appProperties?.seeyaBackup!==MARKER)throw Error('다이어리 백업 파일을 선택해 주세요.');
  if(Number(file.size)>MAX_BYTES)throw Error('8MB 이하의 백업만 가져올 수 있어요.');
  const response=await request('https://www.googleapis.com/drive/v3/files/'+encodeURIComponent(file.id)+'?alt=media');
  const blob=await response.blob();if(blob.size>MAX_BYTES)throw Error('8MB 이하의 백업만 가져올 수 있어요.');
  try{return P.validate(JSON.parse(await blob.text()));}catch(e){throw Error('백업 내용을 읽지 못했어요. '+(e instanceof SyntaxError?'파일 형식이 올바르지 않습니다.':e.message));}
 }
 async function backup(state){
  const value=P.validate(state),exportedAt=new Date(now()).toISOString(),data=JSON.stringify({...value,exportedAt},null,2),body=new Blob([data],{type:'application/json'});
  if(body.size>MAX_BYTES)throw Error('백업이 8MB를 넘어요. 파일 내려받기로 보관해 주세요.');
  // Create independent snapshots: an empty or stale device cannot overwrite another backup.
  const metadata={name:'SEEYA-Diary-'+exportedAt.replace(/[:.]/g,'-')+'.json',mimeType:'application/json',appProperties:{seeyaBackup:MARKER,entries:String(value.entries.length),exportedAt}};
  const started=await request('https://www.googleapis.com/upload/drive/v3/files?uploadType=resumable&fields=id,name,createdTime,size,mimeType,appProperties',{method:'POST',headers:{'Content-Type':'application/json; charset=UTF-8','X-Upload-Content-Type':'application/json','X-Upload-Content-Length':String(body.size)},body:JSON.stringify(metadata)});
  const url=started.headers.get('Location');if(!url)throw Error('백업 저장을 시작하지 못했어요.');
  const file=await (await request(url,{method:'PUT',headers:{'Content-Type':'application/json'},body})).json();
  if(!file.id)throw Error('백업 완료를 확인하지 못했어요. 목록에서 확인해 주세요.');
  try{const checked=await read(file);if(JSON.stringify(checked)!==JSON.stringify(value))throw Error('저장된 내용이 다릅니다.');}catch{throw Error('백업 파일은 전송했지만 내용 확인을 마치지 못했어요. 백업 목록에서 다시 확인해 주세요.');}
  return {file,exportedAt,count:value.entries.length};
 }
 return {prepare,connect,disconnect,connected,account:()=>connected()?user:null,list,read,backup};
}
module.exports={create,validClientId,SCOPE,MARKER,MAX_BYTES};

},
"src/data/diary-drive.json":function(module,exports,__require){
module.exports={"clientId":""};
},
"src/client/concert-diary.js":function(module,exports,__require){
'use strict';
const C=__require("src/shared/concert-diary.js"),P=__require("src/shared/passport.js"),Save=__require("src/shared/passport-play-save.js"),Poster=__require("src/client/my-concert-poster.js");
async function save(d,songs){
 const concertPoster=C.snapshot(d,songs),json=JSON.stringify(concertPoster);
 const hash=Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(json)))).map(v=>v.toString(16).padStart(2,'0')).join('');
 const at=new Date(),record=P.entry({entryId:'concert-'+hash,kind:'play',status:'done',date:P.today(),title:d.title,members:['seeya'],play:{game:'other',level:'나만의 씨야 콘서트',mode:Object.values(d.sections).flat().length+'곡',source:'result'},note:'직접 구성한 가상 콘서트의 셋리스트와 포스터입니다.',concertPoster,createdAt:at.toISOString(),updatedAt:at.toISOString()});
 const task=()=>Save.save(localStorage,record);
 return navigator.locks?navigator.locks.request('seeya-passport-save',task):task();
}
async function mount(host,value,download){
 host.innerHTML='<h3>나의 콘서트 포스터</h3><p role="status">포스터를 불러오고 있어요.</p>';
 try{
  const recipe=C.clean(value),canvas=document.createElement('canvas');await Poster.render(canvas,recipe.draft,recipe.songs);if(!host.isConnected)return;
  canvas.setAttribute('role','img');canvas.setAttribute('aria-label',recipe.draft.title+' 콘서트 셋리스트 포스터');canvas.style.cssText='width:100%;height:auto;display:block;border-radius:12px';
  host.querySelector('p').textContent='저장 당시의 셋리스트와 디자인입니다. 다이어리 백업에도 함께 포함돼요.';host.append(canvas);
  const button=document.createElement('button');button.type='button';button.textContent='콘서트 포스터 저장';host.append(button);
  button.onclick=async()=>{button.disabled=true;try{download(await Poster.png(canvas),'seeya-diary-concert.png');}catch(e){host.querySelector('p').textContent=e.message;}finally{button.disabled=false;}};
 }catch(e){if(host.isConnected)host.querySelector('p').textContent='포스터를 불러오지 못했어요. '+e.message;}
}
module.exports={save,mount};

},
"src/client/my-concert-poster.js":function(module,exports,__require){
'use strict';
const {SECTIONS,chars,count}=__require("src/shared/my-concert.js");
const Show=__require("src/shared/my-concert-show.js");
const {themes,fonts,backdrop,outputFormat}=__require("src/shared/my-concert-design.js");
const W=1080,H=1350,metaFont='"Passport Dodum", sans-serif';

function wrap(ctx,text,width){
 const lines=[];let line='';
 for(const word of text.trim().split(/\s+/)){
  const next=line?line+' '+word:word;
  if(ctx.measureText(next).width<=width){line=next;continue;}
  if(line)lines.push(line);
  line='';
  if(ctx.measureText(word).width<=width || /[A-Za-z]/.test(word)){line=word;continue;}
  for(const ch of chars(word)){
   if(line && ctx.measureText(line+ch).width>width){lines.push(line);line='';}
   line+=ch;
  }
 }
 if(line)lines.push(line);
 return lines;
}

function tracks(d,songs){
 const interruptions=new Map();
 for(const v of d.vcrs||[])interruptions.set(v.after,(interruptions.get(v.after)||0)+1);
 let number=0;
 return SECTIONS.flatMap(section=>d.sections[section.id].map((id,i)=>{
  const song=Show.songInfo(id,songs);
  const feature=song.title.match(/\s*\((feat\.\s*.+)\)\s*$/i);
  const text=Show.isHidden(id)?'히든 스테이지':song.title.slice(0,feature?.index??song.title.length);
  const credit=[feature?.[1],song.artistType==='solo'?song.artistNames.join(' · '):''].filter(Boolean).join(' / ');
  return {id,text,credit,section:i===0?section.name:'',number:++number,vcr:interruptions.get(number)||0};
 }));
}

// Keep each section heading and its first song together. Choose the largest size
// that fits, retaining one column when a second column offers little benefit.
function layout(ctx,entries,area,family,{long=false,sparse=entries.length<=6}={}){
 let best;
 for(const columns of long||sparse?[1]:[1,2]){
  const width=(area.right-area.left-(columns-1)*42)/columns*(sparse?.82:1);
  for(let size=long||sparse?40:36;size>=(long?40:8);size--){
   ctx.font=size+'px '+family;
   const step=Math.ceil(size*1.28), indent=size*1.65;
   const rows=entries.map((row,i)=>{
    ctx.font=size+'px '+family;
    const lines=wrap(ctx,row.text,width-indent);
    const creditSize=Math.max(9,Math.round(size*.75)),creditStep=Math.ceil(creditSize*1.22);
    ctx.font=creditSize+'px '+family;
    const credits=row.credit?wrap(ctx,row.credit,width-indent):[];
    const gap=row.section&&i>0?(sparse?38:long?30:0):0;
    const heading=row.section?step:0;
    const height=gap+heading+Math.max(lines.length*step+credits.length*creditStep,row.vcr?step*1.65:0)+Math.ceil(size*(long?.35:.25));
    return {...row,lines,credits,creditSize,creditStep,height,heading,gap};
   });
   const total=rows.reduce((n,r)=>n+r.height,0);
   let split=rows.length,tallest=total;
   if(columns===2){
    let left=0;
    for(let i=1;i<rows.length;i++){
     left+=rows[i-1].height;
     const h=Math.max(left,total-left);
     if(h<tallest){split=i;tallest=h;}
    }
   }
   if(!long&&tallest>area.bottom-area.top)continue;
   if(!best || size>best.size+2)best={size,step,indent,width,usedHeight:tallest,columns:columns===1?[rows]:[rows.slice(0,split),rows.slice(split)]};
   break;
  }
 }
 if(!best)throw Error('글자가 포스터 영역을 넘었어요. 제목 길이를 확인해 주세요.');
 if(sparse){
  let measured=240;
  for(const row of best.columns[0]){
   ctx.font=best.size+'px '+family;
   for(const line of row.lines)measured=Math.max(measured,best.indent+ctx.measureText(line).width);
   ctx.font=row.creditSize+'px '+family;
   for(const line of row.credits)measured=Math.max(measured,best.indent+ctx.measureText(line).width);
   ctx.font=Math.min(21,Math.round(best.size*.82))+'px '+metaFont;
   if(row.section)measured=Math.max(measured,ctx.measureText(row.section).width);
  }
  best.width=Math.min(best.width,Math.ceil(measured)+2);
 }
 return best;
}

// Extend only the quiet middle of the paper; keep header/footer art in proportion.
function paintBackground(ctx,image,height){
 if(height===H){ctx.drawImage(image,0,0,W,H);return;}
 const scale=image.naturalHeight/H,cut=650,band=90,extra=height-H;
 ctx.drawImage(image,0,0,image.naturalWidth,cut*scale,0,0,W,cut);
 ctx.drawImage(image,0,cut*scale,image.naturalWidth,band*scale,0,cut,W,band+extra);
 ctx.drawImage(image,0,(cut+band)*scale,image.naturalWidth,(H-cut-band)*scale,0,cut+band+extra,W,H-cut-band);
}

function draw(canvas,d,songs,logo,background){
 canvas.width=W;canvas.height=H;
 const ctx=canvas.getContext('2d');if(!ctx)throw Error('이 브라우저에서 이미지 만들기를 사용할 수 없어요.');
 const t=themes[d.theme]||themes.rose,family=(fonts[d.font]||fonts.dodum).family;
 const ink=t.dark?'#fff7f1':'#392c34', accent=t.dark?'#e4cee3':'#75495e';
 const entries=tracks(d,songs),long=outputFormat(d.theme,d.format)==='long',sparse=entries.length<=6;
 let titleSize=entries.length>=20?46:60,lines;
 do{
  ctx.font='bold '+titleSize+'px '+family;lines=wrap(ctx,d.title.trim(),t.right-t.left);
  if(lines.length<=2)break;
  titleSize-=2;
 }while(titleSize>=30);
 const headingY=t.top+36+28+titleSize;
 const dividerY=headingY+(lines.length-1)*titleSize*1.12+(d.planner.trim()?35:0)+29;
 const top=dividerY+14;
 const fitted=layout(ctx,entries,{...t,top},family,{long,sparse}),bounds=[];
 const extra=long?Math.max(0,Math.ceil(top+fitted.usedHeight+24-t.bottom)):0;
 const height=H+extra,bottom=t.bottom+extra;
 canvas.height=height;
 if(background)paintBackground(ctx,background,height);
 else{
  const g=ctx.createLinearGradient(0,0,W,height);
  g.addColorStop(0,t.dark?'#342337':'#fff7ee');g.addColorStop(1,t.dark?'#171624':'#f6dbe4');
  ctx.fillStyle=g;ctx.fillRect(0,0,W,height);ctx.strokeStyle=t.dark?'#735066':'#d8a2b6';ctx.strokeRect(38,38,W-76,height-76);
 }
 const center=(t.left+t.right)/2,anchor=t.centered?center:t.left;
 ctx.textAlign=t.centered?'center':'left';ctx.fillStyle=accent;
 if(logo){
  const h=36,w=h*logo.naturalWidth/logo.naturalHeight;
  ctx.save();if(t.dark)ctx.filter='brightness(0) invert(1)';
  ctx.drawImage(logo,t.centered?center-w/2:anchor,t.top,w,h);ctx.restore();
 }
 ctx.font='bold '+titleSize+'px '+family;
 let y=headingY;
 ctx.fillStyle=ink;
 for(const line of lines){ctx.fillText(line,anchor,y,t.right-t.left);y+=titleSize*1.12;}
 y-=titleSize*1.12;
 if(d.planner.trim()){y+=35;ctx.font='24px '+family;ctx.fillStyle=accent;ctx.fillText('기획 · '+d.planner.trim(),anchor,y);}
 y+=29;ctx.strokeStyle=accent;ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(t.left,y);ctx.lineTo(t.right,y);ctx.stroke();
 const {size,step,indent,width}=fitted;
 ctx.textAlign='left';
 fitted.columns.forEach((rows,col)=>{
  const x=sparse?center-width/2:t.left+col*(width+42);
  let rowY=top+(sparse?Math.min(70,Math.max(0,(bottom-top-fitted.usedHeight)/3)):0);
  for(const r of rows){
   let base=rowY+r.gap;
   if(r.section){
    ctx.fillStyle=accent;ctx.font=Math.min(21,Math.round(size*.82))+'px '+metaFont;
    ctx.fillText(r.section,x,base+step*.78);base+=r.heading;
   }
   ctx.fillStyle=accent;ctx.font=Math.round(size*.73)+'px '+metaFont;
   ctx.fillText(String(r.number).padStart(2,'0'),x,base+size);
   ctx.fillStyle=ink;ctx.font=size+'px '+family;
   r.lines.forEach((line,i)=>ctx.fillText(line,x+indent,base+size+i*step,width-indent));
   ctx.fillStyle=accent;ctx.font=r.creditSize+'px '+family;
   r.credits.forEach((line,i)=>ctx.fillText(line,x+indent,base+r.lines.length*step+r.creditSize+i*r.creditStep,width-indent));
   if(r.vcr){ctx.fillStyle=accent;ctx.font=Math.round(size*.53)+'px '+metaFont;ctx.fillText('VCR'+(r.vcr>1?'×'+r.vcr:''),x,base+size+step*.55,indent-2);}
   rowY+=r.height;bounds.push({id:r.id,lines:r.lines,left:x,width,bottom:rowY});
  }
 });
 ctx.font='17px '+metaFont;ctx.fillStyle=accent;ctx.textAlign=t.centered?'center':'left';
 ctx.fillText('SEEYA ARCHIVE   ·   '+count(d)+' SONGS   ·   팬이 만든 가상 콘서트',anchor,bottom+27);
 return {width:W,height,rows:bounds,fontSize:size,columns:fitted.columns.length,contentBottom:bottom};
}

const images=new Map();
function image(src){
 if(!images.has(src))images.set(src,new Promise((resolve,reject)=>{
  const im=new Image();im.onload=()=>resolve(im);im.onerror=()=>{images.delete(src);reject(Error('포스터 이미지를 불러오지 못했어요. 다시 시도해 주세요.'));};im.src=src;
 }));
 return images.get(src);
}
async function render(canvas,d,songs){
 const bg=backdrop(d.theme);
 const [logo,background]=await Promise.all([image(__require("src/data/passport-brand.json").logo),bg?image(bg):null,
  document.fonts?.load('30px '+(fonts[d.font]||fonts.dodum).family),
  document.fonts?.load('bold 60px '+(fonts[d.font]||fonts.dodum).family),document.fonts?.load('20px '+metaFont)]);
 return draw(canvas,d,songs,logo,background);
}
function png(canvas){return new Promise((resolve,reject)=>{try{canvas.toBlob(b=>b?resolve(b):reject(Error('이미지를 만들지 못했어요. 다시 시도해 주세요.')),'image/png');}catch{reject(Error('이미지 저장을 다시 시도해 주세요.'));}});}
module.exports={wrap,layout,draw,render,png};

},
"src/shared/my-concert.js":function(module,exports,__require){
'use strict';
const Show=__require("src/shared/my-concert-show.js");
const SECTIONS=[{id:'opening',name:'OPENING',ko:'오프닝',limit:3},{id:'main',name:'MAIN STAGE',ko:'본 무대',limit:25},{id:'encore',name:'ENCORE',ko:'앙코르',limit:4}];
const design=__require("src/shared/my-concert-design.js");
const THEMES=Object.keys(design.themes),KEY='seeya-my-concert-test-v1';
const segmenter=typeof Intl.Segmenter==='function'?new Intl.Segmenter('ko',{granularity:'grapheme'}):null;
const chars=s=>segmenter?[...segmenter.segment(String(s))].map(x=>x.segment):Array.from(String(s));
const clean=s=>typeof s==='string'?s.normalize('NFC').replace(/[\u0000-\u001f\u007f-\u009f\u202a-\u202e\u2066-\u2069]/g,''):'';
const fresh=()=>({schema:3,hidden:{},vcrs:[],title:'우리, 다시 같은 무대에서',planner:'',sections:{opening:[],main:[],encore:[]},theme:'curtain',font:'dodum',format:'poster',updatedAt:''});
const count=d=>SECTIONS.reduce((n,s)=>n+d.sections[s.id].length,0);
const find=(d,id)=>SECTIONS.find(s=>d.sections[s.id].includes(id));
function problems(d){
 const p=[];if(!clean(d.title).trim()||chars(clean(d.title).trim()).length>30)p.push('공연 제목은 1~30자로 입력해 주세요.');
 if(chars(clean(d.planner).trim()).length>20)p.push('기획자 이름은 20자 이내로 입력해 주세요.');
 const missing=SECTIONS.filter(s=>d.sections[s.id].length===0).map(s=>s.ko+' 1곡');
 if(missing.length)p.push(missing.join(', ')+'을 더 골라주세요.');return p;
}
function validate(raw,songs,strict=false){
 if(!raw||typeof raw!=='object'||Array.isArray(raw)||!raw.sections||typeof raw.sections!=='object')throw Error('저장된 구성의 형식을 읽을 수 없어요.');
 const ids=new Set(songs.filter(s=>s.enabled).map(s=>s.id)),d=fresh(),issues=[],seen=new Set();
 if(raw.schema!==1 && raw.schema!==2 && raw.schema!==3){if(strict)throw Error('지원하지 않는 공유 버전이에요.');issues.push('이전 버전에서 복원 가능한 내용을 불러왔어요.');}
 for(const [key,max] of [['title',30],['planner',20]]){
  if(typeof raw[key]!=='string'){if(strict)throw Error('공연 이름 정보를 확인해 주세요.');issues.push('일부 이름 정보를 복원하지 못했어요.');continue;}
  const text=clean(raw[key]).trim();if(strict&&(chars(text).length>max||(key==='title'&&!text)))throw Error('공연 제목·기획자 이름 길이를 확인해 주세요.');
  d[key]=strict?text:chars(text).slice(0,max).join('');if(chars(text).length>max)issues.push('너무 긴 이름은 허용 길이까지 복원했어요.');
 }
 if(raw.schema===2||raw.schema===3){
  if(raw.vcrs!==undefined&&!Array.isArray(raw.vcrs))throw Error('VCR 구성을 읽을 수 없어요.');
  d.vcrs=(raw.vcrs||[]).map(Show.vcrConfig);
  for(const slot of SECTIONS.flatMap(s=>Array.isArray(raw.sections[s.id])?raw.sections[s.id]:[])){
   if(Show.isHidden(slot)){d.hidden[slot]=Show.config(raw.hidden?.[slot],songs);ids.add(slot);}
  }
 }
 for(const s of SECTIONS){
  if(!Array.isArray(raw.sections[s.id])){if(strict)throw Error('공연 구간이 올바르지 않아요.');issues.push(s.ko+' 구성을 복원하지 못했어요.');continue;}
  for(const id of raw.sections[s.id]){
   if(typeof id!=='string'||!ids.has(id)||seen.has(id)||d.sections[s.id].length>=s.limit){if(strict)throw Error('알 수 없는 곡·중복 곡 또는 구간별 곡 수를 확인해 주세요.');issues.push('없어졌거나 중복된 곡을 빈자리로 두었어요.');continue;}
   d.sections[s.id].push(id);seen.add(id);
  }
 }
 if(raw.schema===2 && !strict){
  const oldSlots=[...Array.from({length:1},(_,i)=>d.sections.opening[i]),...Array.from({length:9},(_,i)=>d.sections.main[i]),...Array.from({length:2},(_,i)=>d.sections.encore[i])];
  d.vcrs=d.vcrs.map(v=>({...v,after:Math.max(1,Math.min(count(d)-1,oldSlots.slice(0,v.after).filter(Boolean).length))}));
 }
 if(strict && d.vcrs.some(v=>v.after>=count(d)))throw Error('VCR은 노래와 노래 사이에 배치해 주세요.');
 if(strict&&(Object.keys(raw.sections).length!==3||SECTIONS.some(s=>d.sections[s.id].length===0)))throw Error('완성되지 않은 공유 구성이에요.');
 if(!THEMES.includes(raw.theme)){if(strict)throw Error('지원하지 않는 포스터 테마예요.');issues.push('기본 포스터 테마로 복원했어요.');}else d.theme=raw.theme;
 if(raw.font!==undefined && !Object.hasOwn(design.fonts,raw.font)){if(strict)throw Error('지원하지 않는 글꼴이에요.');}
 else if(raw.font)d.font=raw.font;
 if(raw.format!==undefined&&!Object.hasOwn(design.formats,raw.format)){if(strict)throw Error('지원하지 않는 이미지 형식이에요.');}
 else if(raw.format)d.format=raw.format;
 d.format=design.outputFormat(d.theme,d.format);
 d.updatedAt=typeof raw.updatedAt==='string'?raw.updatedAt:'';
 return {draft:d,issues:[...new Set(issues)]};
}
function change(d,action,songs){
 const next=JSON.parse(JSON.stringify(d)),section=SECTIONS.find(s=>s.id===action.section);let message='';
 if(action.type==='vcr-order'){
  if(!Number.isInteger(action.index)||!next.vcrs[action.index]||!Number.isInteger(action.after)||action.after<1||action.after>=count(d))throw Error('VCR은 노래와 노래 사이에 놓아 주세요.');
  const moved=next.vcrs.splice(action.index,1)[0];moved.after=action.after;
  const siblings=next.vcrs.filter(v=>v.after===action.after);
  if(!Number.isInteger(action.to)||action.to<0||action.to>siblings.length)throw Error('VCR 순서를 다시 선택해 주세요.');
  const before=siblings[action.to];let at=before?next.vcrs.indexOf(before):siblings.length?next.vcrs.indexOf(siblings.at(-1))+1:next.vcrs.length;
  next.vcrs.splice(at,0,moved);return {draft:next,message:'VCR 순서를 바꿨어요.'};
 }
 if(!section)throw Error('구간을 선택해 주세요.');
 if(action.type==='add'){
  if(!songs.some(s=>s.id===action.id&&s.enabled)&&!(Show.isHidden(action.id)&&d.hidden?.[action.id]))throw Error('선택할 수 없는 곡이에요.');
  const selected=find(d,action.id);if(selected)throw Error(selected.name+'에 이미 담긴 곡이에요.');
  if(next.sections[section.id].length>=section.limit)throw Error(section.ko+'이 가득 찼어요. 다른 구간을 골라주세요.');
  next.sections[section.id].push(action.id);message=section.ko+'에 담았어요.';
 }else{
  const list=next.sections[section.id],index=list.indexOf(action.id);if(index<0)throw Error('곡을 다시 선택해 주세요.');
  if(action.type==='remove'){list.splice(index,1);message='곡을 뺐어요. 되돌릴 수 있어요.';}
  else if(action.type==='move'){
   const target=SECTIONS.find(s=>s.id===action.target);if(!target)throw Error('이동할 구간을 선택해 주세요.');
   if(target.id===section.id)return {draft:next,message:'같은 구간이에요.'};
   if(next.sections[target.id].length>=target.limit)throw Error(target.ko+'이 가득 찼어요. 먼저 빈자리를 만들어 주세요.');
   const to=action.to??next.sections[target.id].length;
   if(!Number.isInteger(to)||to<0||to>next.sections[target.id].length)throw Error('놓을 위치를 다시 선택해 주세요.');
   list.splice(index,1);next.sections[target.id].splice(to,0,action.id);message=target.ko+'로 옮겼어요.';
  }else if(action.type==='order'){
   const to=action.to;if(!Number.isInteger(to)||to<0||to>=list.length)throw Error('더 이동할 수 없어요.');
   list.splice(index,1);list.splice(to,0,action.id);message='순서를 바꿨어요.';
  }else throw Error('지원하지 않는 편집이에요.');
 }
 Show.alignVcrs(d,next);
 return {draft:next,message};
}
function encode(d){const payload={schema:3,hidden:Object.fromEntries(Object.entries(d.hidden||{}).filter(([id])=>find(d,id))),vcrs:d.vcrs||[],title:clean(d.title).trim(),planner:clean(d.planner).trim(),sections:d.sections,theme:d.theme,font:d.font,format:d.format};const bytes=new TextEncoder().encode(JSON.stringify(payload));return btoa(Array.from(bytes,b=>String.fromCharCode(b)).join('')).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'');}
function decode(value,songs){if(typeof value!=='string'||value.length>1000000||!/^[\w-]+$/.test(value))throw Error('공유 링크 형식을 확인해 주세요.');let raw;try{raw=JSON.parse(new TextDecoder('utf-8',{fatal:true}).decode(Uint8Array.from(atob(value.replace(/-/g,'+').replace(/_/g,'/')),c=>c.charCodeAt(0))));}catch{throw Error('공유 링크를 읽지 못했어요.');}return validate(raw,songs,true).draft;}
function filter(songs,query,artist,album){const q=clean(query).trim().toLocaleLowerCase('ko');return songs.filter(s=>s.enabled&&(artist==='all'||(artist==='group'?s.artistType==='group':s.memberId===artist))&&(album==='all'||s.albumId===album)&&s.title.toLocaleLowerCase('ko').includes(q));}
function restore(raw,songs){if(!raw)return {draft:fresh(),issues:[]};if(raw.length>1000000)throw Error('저장된 구성의 크기를 확인해 주세요.');let data;try{data=JSON.parse(raw);}catch{throw Error('이전 편집본을 읽지 못했어요. 원본은 지우지 않았습니다.');}return validate(data,songs);}
module.exports={SECTIONS,THEMES,KEY,chars,clean,fresh,count,find,problems,validate,change,encode,decode,filter,restore};

},
"src/shared/my-concert-show.js":function(module,exports,__require){
'use strict';
const media = __require("src/data/my-concert-media.json");
const vcrLibrary=media.vcr.filter(v=>!v.excludeFromVcr);
const vcrTypes={vlog:'브이로그',behind:'비하인드',promo:'홍보·예고',music:'뮤직비디오',challenge:'챌린지',other:'기타 콘텐츠'};
function vcrType(video){
  const t=video.title;
  if(/예매|티켓|홍보|yes\s*24|티저|teaser|trailer|ticket|D-\d+|전국투어\s*콘서트.*(?:만나요|즐거울|계속 됩니다|갑니다)/i.test(t))return 'promo';
  if(/비하인드|behind|스케치|메이킹|making|리허설/i.test(t))return 'behind';
  if(/브이로그|vlog|일상|나들이|여행|먹방|귤멍|ep\.\s*\d+/i.test(t))return 'vlog';
  if(/챌린지|challenge/i.test(t))return 'challenge';
  if(/뮤직비디오|\bMV\b|M\/V|music video/i.test(t))return 'music';
  return 'other';
}
function randomVcrs(channel,type='recommended'){
  return vcrLibrary.filter(v=>(channel==='all'||channel===v.channelId) &&
    (type==='recommended'?vcrType(v)!=='promo':vcrType(v)===type));
}
const hiddenLabel = '히든 스테이지 (랜덤 노래)';
const vcrLabel = 'VCR 재생';
const sections = ['opening','main','encore'];
const isHidden = id => typeof id === 'string' && /^hidden-[0-9a-z-]+$/.test(id);
function songInfo(id, songs) {
  return isHidden(id) ? {id,title:hiddenLabel,artistNames:[],enabled:true} : songs.find(s=>s.id===id);
}
// Only these six songs have a tour recording approved for the concert player.
const tourSongs = new Set(['group-track-022','group-track-058','group-track-060','group-track-062','group-track-063','group-track-064']);
function performanceVideos(id) {
  const sources=media.performances[id]||[];
  for(const kind of ['broadcast','live','tour','official']){
    if(kind==='tour'&&!tourSongs.has(id))continue;
    const videos=sources.filter(v=>v.kind===kind && v.embedAllowed!==false);
    if(videos.length)return videos;
  }
  return [];
}
function checkedSongs(songs) {
  return songs.filter(song => song.enabled && performanceVideos(song.id).length);
}
function config(value,songs) {
  if(value?.mode==='all') return {mode:'all'};
  if(value?.mode==='album' && songs.some(s=>s.albumId===value.album)) return {mode:'album',album:value.album};
  if(value?.mode==='custom' && Array.isArray(value.ids) && value.ids.length && new Set(value.ids).size===value.ids.length && value.ids.every(id=>songs.some(s=>s.id===id && s.enabled)))
    return {mode:'custom',ids:[...new Set(value.ids)]};
  throw Error('히든 스테이지의 후보 범위를 다시 설정해 주세요.');
}
function vcrConfig(v) {
  if(!v || !Number.isInteger(v.after) || v.after<1 || v.after>31) throw Error('VCR 위치를 확인해 주세요.');
  if(v.mode==='link' && typeof v.value==='string' && /^[a-zA-Z0-9_-]{11}$/.test(v.value))return {after:v.after,mode:'link',value:v.value};
  if(v.mode==='fixed' && media.vcr.some(x=>x.videoId===v.value)) return {after:v.after,mode:v.mode,value:v.value};
  if(v.mode==='random' && (v.value==='all'||Object.hasOwn(media.channels,v.value))){
    const type=v.type??'recommended';
    if(type!=='recommended'&&!Object.hasOwn(vcrTypes,type))throw Error('VCR 유형을 다시 선택해 주세요.');
    return {after:v.after,mode:v.mode,value:v.value,...(type==='recommended'?{}:{type})};
  }
  throw Error('VCR 영상 또는 채널을 다시 설정해 주세요.');
}
function candidates(range,songs) {
  return checkedSongs(songs).filter(s=>range.mode==='all'||(range.mode==='album'?s.albumId===range.album:range.ids.includes(s.id))).map(s=>s.id);
}
// Augmenting paths allow a narrow album to displace an earlier broad assignment.
function matching(pools,reserved,random=Math.random) {
  const owner=new Map(),result=[];
  const choices=pools.map(pool=>{
    const ids=[...new Set(pool)].filter(id=>!reserved.has(id));
    for(let i=ids.length-1;i>0;i--){const j=Math.floor(random()*(i+1));[ids[i],ids[j]]=[ids[j],ids[i]];}
    return ids;
  });
  function place(slot,visited) {
    for(const id of choices[slot]){
      if(visited.has(id)) continue;
      visited.add(id);
      if(!owner.has(id)||place(owner.get(id),visited)){
        owner.set(id,slot);result[slot]=id;return true;
      }
    }
    return false;
  }
  if(!choices.every((_,i)=>place(i,new Set()))) throw Error('이 범위에서는 서로 다른 후보를 배정할 수 없어요. 랜덤 범위를 넓히거나 자리를 줄여 주세요.');
  return result;
}
function alignVcrs(previous,next){
  const before=sections.flatMap(s=>previous.sections[s]);
  const after=sections.flatMap(s=>next.sections[s]);
  if(!after.length){next.vcrs=[];return;}
  for(const v of next.vcrs){
    const anchor=after.indexOf(before[v.after-1]);
    v.after=Math.max(1,Math.min(after.length-1,anchor<0?v.after:anchor+1));
  }
}
function youtubeId(input){
  try{
    const u=new URL(input.trim());
    if(!['https:','http:'].includes(u.protocol)||u.username||u.password||u.port)return '';
    const host=u.hostname.replace(/^(www[.]|m[.]|music[.])/,'');
    let id='';
    if(host==='youtu.be')id=u.pathname.slice(1);
    if(host==='youtube.com')id=u.pathname==='/watch'?u.searchParams.get('v'):u.pathname.match(/^\/(?:embed|shorts|live)\/([a-zA-Z0-9_-]{11})\/?$/)?.[1];
    return /^[a-zA-Z0-9_-]{11}$/.test(id||'')?id:'';
  }catch{return '';}
}
function rows(d) {
  const entries=[];let offset=0;
  for(const section of sections){
    const limit=d.sections[section].length;
    for(let i=0;i<limit;i++){
      const number=offset+i+1,id=d.sections[section][i];
      if(id)entries.push({key:'slot-'+number,section,number,id,kind:isHidden(id)?'hidden':'song'});
      (d.vcrs||[]).forEach((v,index)=>{if(v.after===number)entries.push({key:'vcr-'+index,section,after:number,index,kind:'vcr',config:v});});
    }
    offset+=limit;
  }
  return entries;
}
function session(d,songs,random=Math.random) {
  const entries=rows(d);
  const slots=entries.filter(e=>e.kind==='hidden'),fixed=new Set(entries.filter(e=>e.kind==='song').map(e=>e.id));
  const drawn=matching(slots.map(e=>candidates(config(d.hidden?.[e.id],songs),songs)),fixed,random);
  const vcrs=(d.vcrs||[]).map(vcrConfig);
  const vFixed=new Set(vcrs.filter(v=>v.mode!=='random').map(v=>v.value));
  const vDraw=matching(entries.filter(e=>e.kind==='vcr'&&e.config.mode==='random').map(e=>randomVcrs(e.config.value,e.config.type).map(v=>v.videoId)),vFixed,random);
  let h=0,v=0;
  return entries.map(e=>{
    if(e.kind==='vcr'){
      const id=e.config.mode==='random'?vDraw[v]:e.config.value;
      const video=media.vcr.find(x=>x.videoId===id)||{videoId:id,title:'직접 담은 VCR',channel:'YouTube'};
      if(e.config.mode==='random')v++;
      return {...e,label:vcrLabel,title:video.title,artist:video.channel,videos:[video]};
    }
    const id=e.kind==='hidden'?drawn[h++]:e.id,song=songInfo(id,songs);
    const choices=performanceVideos(id);
    return {...e,label:e.kind==='hidden'?hiddenLabel:song.title,title:song.title,artist:song.artistNames.join(' · '),videos:choices};
  });
}
module.exports={vcrLibrary,vcrType,vcrTypes,randomVcrs,alignVcrs,youtubeId,media,hiddenLabel,vcrLabel,isHidden,songInfo,performanceVideos,checkedSongs,config,vcrConfig,candidates,matching,rows,session};

},
"src/data/my-concert-media.json":function(module,exports,__require){
module.exports={"channels":{"UCn6SB-9q1gNfGhx9_fFxIxg":"씨야엔터","UC_naRJKw5Isgpv5nF8yNXLw":"남규리","UCjLZIdvRV7fQ3m_DA9NEkOg":"김연지","UCz11CPccQ2AnizJrdp58Bog":"이보람"},"performances":{"group-track-001":[{"videoId":"I6yE2PFlSaU","title":"060319 씨야(Seeya) - 여인의 향기(Scent of a Woman) | SBS 인기가요","channel":"여돌음방모음","channelId":"UCFil7uLJDTsOQPLGb9AwZyg","duration":213,"date":"2006-03-19","kind":"broadcast","embedAllowed":true,"played":false,"checkedOn":"2026-11-03"},{"videoId":"L0plLJw2v-I","title":"씨야(See ya ) - 여인의 향기 [윤도현의 러브레터] | KBS 20060414 방송","channel":"Again 가요톱10 : KBS KPOP Classic","channelId":"UCmZ19AIj_wcpwRcqG7p9L8g","duration":216,"date":"2006-04-14","kind":"broadcast","embedAllowed":true,"played":false,"checkedOn":"2026-11-03"},{"videoId":"nn639JifcBQ","title":"씨야  - '여인의 향기' [KBS 콘서트7080, 20060826] | SeeYa","channel":"Again 가요톱10 : KBS KPOP Classic","channelId":"UCmZ19AIj_wcpwRcqG7p9L8g","duration":231,"kind":"broadcast","embedAllowed":true,"played":false,"checkedOn":"2026-11-02"},{"videoId":"_8nBbgv5DJI","title":"[MV] 씨야(SeeYa) \"여인의 향기\" - 여인의 향기","channel":"DanalEntertainment","channelId":"UCpmctTnUfbeoycGhieZQAmw","duration":451,"kind":"official","embedAllowed":true,"played":false,"checkedOn":"2026-11-02"},{"videoId":"YKW0KSHTF1k","title":"여인의 향기","channel":"SeeYa - Topic","channelId":"UCcZrxE5zk2zKYmMe9lg9xKA","duration":227,"kind":"official","embedAllowed":true,"played":false,"checkedOn":"2026-11-02"}],"group-track-002":[{"videoId":"jJypqIDNcv4","title":"06/07/09 씨야 구두 SBS인기가요","channel":"보람아몇씨야","channelId":"UCkMT4pUugWZJRfq2t58znaA","duration":225,"published":"2020-06-13","embedAllowed":true,"checkedOn":"2026-11-02","played":true,"performanceId":"stage-jJypqIDNcv4","date":"2006-07-09","kind":"broadcast"},{"videoId":"yu2GPWuI4oI","title":"구두","channel":"SeeYa - Topic","channelId":"UCcZrxE5zk2zKYmMe9lg9xKA","duration":251,"kind":"official","embedAllowed":true,"played":false,"checkedOn":"2026-11-02"}],"group-track-003":[{"videoId":"D9k98OKgfJ8","title":"[뮤직] 워너비 - With(씨야 See Ya) 사랑하기 때문에 06.05.07","channel":"ajax wang","channelId":"UCHaf6i978GU126WwRjZGrSA","duration":208,"kind":"broadcast","embedAllowed":true,"played":false,"checkedOn":"2026-11-02"},{"videoId":"Qq5vnQOAo70","title":"사랑하기때문에","channel":"SeeYa - Topic","channelId":"UCcZrxE5zk2zKYmMe9lg9xKA","duration":235,"kind":"official","embedAllowed":true,"played":false,"checkedOn":"2026-11-02"}],"group-track-004":[{"videoId":"3AokMjrjDD4","title":"접시꽃","channel":"SeeYa - Topic","channelId":"UCcZrxE5zk2zKYmMe9lg9xKA","duration":232,"kind":"official","embedAllowed":true,"played":false,"checkedOn":"2026-11-02"}],"group-track-005":[{"videoId":"eCk7xwAIDDQ","title":"씨야(See ya ) - Promise U [윤도현의 러브레터] | KBS 20060414 방송","channel":"Again 가요톱10 : KBS KPOP Classic","channelId":"UCmZ19AIj_wcpwRcqG7p9L8g","duration":196,"kind":"broadcast","embedAllowed":true,"played":false,"checkedOn":"2026-11-02"},{"videoId":"xWVlz_ThGTk","title":"Promise U","channel":"SeeYa - Topic","channelId":"UCcZrxE5zk2zKYmMe9lg9xKA","duration":221,"kind":"official","embedAllowed":true,"played":false,"checkedOn":"2026-11-02"}],"group-track-006":[{"videoId":"sgpSPvBDUlI","title":"처음부터 또다시","channel":"SeeYa - Topic","channelId":"UCcZrxE5zk2zKYmMe9lg9xKA","duration":264,"kind":"official","embedAllowed":true,"played":false,"checkedOn":"2026-11-02"}],"group-track-007":[{"videoId":"Sv123H1lVI0","title":"유죄","channel":"SeeYa - Topic","channelId":"UCcZrxE5zk2zKYmMe9lg9xKA","duration":245,"kind":"official","embedAllowed":true,"played":false,"checkedOn":"2026-11-02"}],"group-track-008":[{"videoId":"2923ZP17xVA","title":"이별해보기","channel":"SeeYa - Topic","channelId":"UCcZrxE5zk2zKYmMe9lg9xKA","duration":239,"kind":"official","embedAllowed":true,"played":false,"checkedOn":"2026-11-02"}],"group-track-009":[{"videoId":"gCc_mJwuZTs","title":"TearsandFears","channel":"SeeYa - Topic","channelId":"UCcZrxE5zk2zKYmMe9lg9xKA","duration":209,"kind":"official","embedAllowed":true,"played":false,"checkedOn":"2026-11-02"}],"group-track-010":[{"videoId":"6JQ1KkBQZDw","title":"사랑했다면","channel":"SeeYa - Topic","channelId":"UCcZrxE5zk2zKYmMe9lg9xKA","duration":265,"kind":"official","embedAllowed":true,"played":false,"checkedOn":"2026-11-02"}],"group-track-011":[{"videoId":"bA8F0v603OM","title":"그냥","channel":"SeeYa - Topic","channelId":"UCcZrxE5zk2zKYmMe9lg9xKA","duration":265,"kind":"official","embedAllowed":true,"played":false,"checkedOn":"2026-11-02"}],"group-track-012":[{"videoId":"DQ_9e-iKRtA","title":"내 잘못입니다","channel":"SeeYa - Topic","channelId":"UCcZrxE5zk2zKYmMe9lg9xKA","duration":252,"kind":"official","embedAllowed":true,"played":false,"checkedOn":"2026-11-02"}],"group-track-013":[{"videoId":"uYp15-zFr4M","title":"[슈가송] 그 시절 우리가 사랑했던 씨야(See Ya)의 '사랑의 인사'♪ (엉엉 ㅠ_ㅠ) 슈가맨3(SUGARMAN3) 12회","channel":"JTBC Entertainment","channelId":"UCFL1sCAksD6_7JIZwwHcwjQ","duration":336,"date":"2020-02-21","kind":"broadcast","embedAllowed":true,"played":false,"checkedOn":"2026-11-04"},{"videoId":"HwOHSUttRfY","title":"음악중심 - See Ya - Love Greeting, 씨야 - 사랑의 인사, Music Core 20070526","channel":"MBCkpop","channelId":"UCe52oeb7Xv_KaJsEzcKXJJg","duration":221,"kind":"broadcast","embedAllowed":true,"played":false,"checkedOn":"2026-11-02"},{"videoId":"lu1kJ25OWfg","title":"[MV] 씨야(SeeYa) \"Lovely Sweet Heart\" - 사랑의 인사","channel":"DanalEntertainment","channelId":"UCpmctTnUfbeoycGhieZQAmw","duration":368,"kind":"official","embedAllowed":true,"played":false,"checkedOn":"2026-11-02"},{"videoId":"wRdNZKsh_a0","title":"사랑의 인사","channel":"SeeYa - Topic","channelId":"UCcZrxE5zk2zKYmMe9lg9xKA","duration":275,"kind":"official","embedAllowed":true,"played":false,"checkedOn":"2026-11-02"}],"group-track-014":[{"videoId":"tIiNpSJoQ6k","title":"씨야(Seeya) - 결혼할까요 💎몽글몽글 그 시절 사랑노래💙 @2007 바다축제 개막 축하쇼","channel":"BAAMBC LIVE | 뱀비씨 라이브","channelId":"UCiqZSNtipGd0IH59WfriBfA","duration":229,"kind":"broadcast","embedAllowed":true,"played":false,"checkedOn":"2026-11-02"},{"videoId":"Ut_QWvPwvgA","title":"[MV] 씨야(SeeYa) \"Lovely Sweet Heart\" - 결혼할까요","channel":"DanalEntertainment","channelId":"UCpmctTnUfbeoycGhieZQAmw","duration":255,"kind":"official","embedAllowed":true,"played":false,"checkedOn":"2026-11-02"},{"videoId":"0ROaJ2Rp9UU","title":"결혼할까요","channel":"SeeYa - Topic","channelId":"UCcZrxE5zk2zKYmMe9lg9xKA","duration":254,"kind":"official","embedAllowed":true,"played":false,"checkedOn":"2026-11-02"}],"group-track-015":[{"videoId":"A9RgzfE7_os","title":"너는 내 남자","channel":"SeeYa - Topic","channelId":"UCcZrxE5zk2zKYmMe9lg9xKA","duration":211,"kind":"official","embedAllowed":true,"played":false,"checkedOn":"2026-11-02"}],"group-track-016":[{"videoId":"Swo_UcXurL8","title":"Dirty Dancing","channel":"SeeYa - Topic","channelId":"UCcZrxE5zk2zKYmMe9lg9xKA","duration":239,"kind":"official","embedAllowed":true,"played":false,"checkedOn":"2026-11-02"}],"group-track-017":[{"videoId":"RShXr9We_DA","title":"어떻게 널 잊겠니","channel":"SeeYa - Topic","channelId":"UCcZrxE5zk2zKYmMe9lg9xKA","duration":256,"kind":"official","embedAllowed":true,"played":false,"checkedOn":"2026-11-02"}],"group-track-018":[{"videoId":"iIgUm9J3csg","title":"사랑아","channel":"SeeYa - Topic","channelId":"UCcZrxE5zk2zKYmMe9lg9xKA","duration":262,"kind":"official","embedAllowed":true,"played":false,"checkedOn":"2026-11-02"}],"group-track-019":[{"videoId":"-cdNcji7uow","title":"그 사람이 나를 사랑해요","channel":"SeeYa - Topic","channelId":"UCcZrxE5zk2zKYmMe9lg9xKA","duration":257,"kind":"official","embedAllowed":true,"played":false,"checkedOn":"2026-11-02"}],"group-track-020":[{"videoId":"qJQQQi5Tdx8","title":"Summer Dream","channel":"SeeYa - Topic","channelId":"UCcZrxE5zk2zKYmMe9lg9xKA","duration":255,"kind":"official","embedAllowed":true,"played":false,"checkedOn":"2026-11-02"}],"group-track-021":[{"videoId":"alI0-z40e1U","title":"사랑이 간다","channel":"SeeYa - Topic","channelId":"UCcZrxE5zk2zKYmMe9lg9xKA","duration":171,"kind":"official","embedAllowed":true,"played":false,"checkedOn":"2026-11-02"}],"group-track-022":[{"videoId":"iWdwBHd9bFQ","title":"[4K 직캠] 수원 2026 씨야 20주년 콘서트 : THE FAN  - 감동을 주세요(남규리,김연지,이보람)","channel":"kyunphg","channelId":"UC3nEDqvVuqBnigVc88fiMyA","duration":252,"kind":"tour","date":"2026-10-17","checkedOn":"2026-11-03","embedAllowed":true,"played":false},{"videoId":"jnRBe9IktFs","title":"감동을 주세요","channel":"SeeYa - Topic","channelId":"UCcZrxE5zk2zKYmMe9lg9xKA","duration":246,"kind":"official","embedAllowed":true,"played":false,"checkedOn":"2026-11-02"}],"group-track-023":[{"videoId":"AlabxMtT3YI","title":"070913 씨야 얼음인형 엠카","channel":"seeyalover","channelId":"UC3yj9gHFG88rsHJUenBp5Vg","duration":223,"kind":"broadcast","embedAllowed":true,"played":false,"checkedOn":"2026-11-02"},{"videoId":"_veObwyUQj8","title":"[MV] 씨야(SeeYa) \"Lovely Sweet Heart\" - 얼음인형","channel":"DanalEntertainment","channelId":"UCpmctTnUfbeoycGhieZQAmw","duration":289,"kind":"official","embedAllowed":true,"played":false,"checkedOn":"2026-11-02"},{"videoId":"k9nKPduDfUg","title":"얼음인형","channel":"SeeYa - Topic","channelId":"UCcZrxE5zk2zKYmMe9lg9xKA","duration":218,"kind":"official","embedAllowed":true,"played":false,"checkedOn":"2026-11-02"}],"group-track-024":[{"videoId":"zK-pL3A1MeM","title":"순애보","channel":"SeeYa - Topic","channelId":"UCcZrxE5zk2zKYmMe9lg9xKA","duration":295,"kind":"official","embedAllowed":true,"played":false,"checkedOn":"2026-11-02"}],"group-track-025":[{"videoId":"IwU9XiTITMs","title":"남","channel":"SeeYa - Topic","channelId":"UCcZrxE5zk2zKYmMe9lg9xKA","duration":238,"kind":"official","embedAllowed":true,"played":false,"checkedOn":"2026-11-02"}],"group-track-026":[{"videoId":"0nFA9QPlnjg","title":"See Ya - Sad Step, 씨야 - 슬픈 발걸음, Music Core 20080105","channel":"MBCkpop","channelId":"UCe52oeb7Xv_KaJsEzcKXJJg","duration":197,"kind":"broadcast","embedAllowed":true,"played":false,"checkedOn":"2026-11-02"},{"videoId":"zDjkCVF9zzI","title":"Seeya - Sad steps (씨야-슬픈발걸음) @SBS Inkigayo 인기가요 20080113","channel":"SBSKPOP X INKIGAYO","channelId":"UCS_hnpJLQTvBkqALgapi_4g","duration":198,"published":"2012-01-06","embedAllowed":true,"checkedOn":"2026-11-02","played":true,"performanceId":"stage-zDjkCVF9zzI","date":"2008-01-13","kind":"broadcast"},{"videoId":"cFEE7KZZUy0","title":"슬픈 발걸음 (구두 II)","channel":"SeeYa - Topic","channelId":"UCcZrxE5zk2zKYmMe9lg9xKA","duration":270,"kind":"official","embedAllowed":true,"played":false,"checkedOn":"2026-11-02"}],"group-track-027":[{"videoId":"kzbky4z5gu4","title":"See Ya - I still like you, 씨야 - 그래도 좋아, Music Core 20080202","channel":"MBCkpop","channelId":"UCe52oeb7Xv_KaJsEzcKXJJg","duration":186,"kind":"broadcast","embedAllowed":true,"played":false,"checkedOn":"2026-11-02"},{"videoId":"1fzT-UcIF5E","title":"Seeya - I still like you (씨야-그래도좋아)@SBS Inkigayo 인기가요 200802017","channel":"SBSKPOP X INKIGAYO","channelId":"UCS_hnpJLQTvBkqALgapi_4g","duration":196,"published":"2012-01-10","embedAllowed":true,"checkedOn":"2026-11-02","played":true,"performanceId":"stage-1fzT-UcIF5E","date":"2012-01-10","kind":"broadcast"},{"videoId":"Wu2mflg_tyk","title":"그래도 좋아","channel":"SeeYa - Topic","channelId":"UCcZrxE5zk2zKYmMe9lg9xKA","duration":267,"kind":"official","embedAllowed":true,"played":false,"checkedOn":"2026-11-02"}],"group-track-028":[{"videoId":"cav_38-1kBU","title":"Classic","channel":"SeeYa - Topic","channelId":"UCcZrxE5zk2zKYmMe9lg9xKA","duration":200,"kind":"official","embedAllowed":true,"played":false,"checkedOn":"2026-11-02"}],"group-track-029":[{"videoId":"tDFsPmjW3uc","title":"연가","channel":"SeeYa - Topic","channelId":"UCcZrxE5zk2zKYmMe9lg9xKA","duration":230,"kind":"official","embedAllowed":true,"played":false,"checkedOn":"2026-11-02"}],"group-track-030":[{"videoId":"R2Sf4TVhBVQ","title":"07.03.01 씨야 미워요 엠 카운트다운","channel":"씨야박물관","channelId":"UCbQr4QmfQqvOAT7aSY09KBw","duration":250,"kind":"broadcast","embedAllowed":true,"played":false,"checkedOn":"2026-11-02"},{"videoId":"N4z5AUvKkaw","title":"미워요","channel":"SeeYa - Topic","channelId":"UCcZrxE5zk2zKYmMe9lg9xKA","duration":259,"kind":"official","embedAllowed":true,"played":false,"checkedOn":"2026-11-02"}],"group-track-034":[{"videoId":"dRu8mfIa2Ak","title":"[화질개선] 씨야 - 미친 사랑의 노래 #한곡인가 #인기가요","channel":"SBS 옛날 예능 - 빽능","channelId":"UCvRIeQeTZDHRcqVZRu0XBug","duration":622,"kind":"broadcast","embedAllowed":true,"played":false,"checkedOn":"2026-11-02"},{"videoId":"FhGp3Q4ZXtk","title":"[풀버전] 씨야 메인보컬 김연지 등장?!😮 라이브 실력에 난리 난 연습생들 반응ㄷㄷ🔥| 씨야 '미친 사랑의 노래' | SOONIGROUP","channel":"SOONIGROUP [수니그룹]","channelId":"UCO_HUi1SA_FoWMa-Zo3RHKg","duration":218,"published":"2026-04-02","embedAllowed":true,"checkedOn":"2026-11-02","played":true,"performanceId":"stage-FhGp3Q4ZXtk","date":"2026-04-02","kind":"live"},{"videoId":"tnjV-wOYok8","title":"미친 사랑의 노래","channel":"SeeYa - Topic","channelId":"UCcZrxE5zk2zKYmMe9lg9xKA","duration":240,"kind":"official","embedAllowed":true,"played":false,"checkedOn":"2026-11-02"}],"group-track-035":[{"videoId":"kya1JSJak9A","title":"Seeya & BrownEyedGirls - The Day [09_24_06]","channel":"pamy15","kind":"broadcast","played":false,"checkedOn":"2026-11-02"},{"videoId":"3aGZFjkZZsY","title":"The Day","channel":"SeeYa - Topic","channelId":"UCcZrxE5zk2zKYmMe9lg9xKA","duration":240,"kind":"official","embedAllowed":true,"played":false,"checkedOn":"2026-11-02"}],"group-track-036":[{"videoId":"p8vMZP9T1t4","title":"정","channel":"SeeYa - Topic","channelId":"UCcZrxE5zk2zKYmMe9lg9xKA","duration":229,"kind":"official","embedAllowed":true,"played":false,"checkedOn":"2026-11-02"}],"group-track-037":[{"videoId":"Ppd8T3vwHoY","title":"음악중심 - See Ya - Are you leaving, 씨야 - 가니, Music Core 20081101","channel":"MBCkpop","channelId":"UCe52oeb7Xv_KaJsEzcKXJJg","duration":179,"kind":"broadcast","embedAllowed":true,"played":false,"checkedOn":"2026-11-02"},{"videoId":"4aQEJqWtSzs","title":"가니 (Feat. SG워너비 김용준, 황정음, Mario)","channel":"SeeYa - Topic","channelId":"UCcZrxE5zk2zKYmMe9lg9xKA","duration":202,"kind":"official","embedAllowed":true,"played":false,"checkedOn":"2026-11-02"}],"group-track-038":[{"videoId":"28tmGVxRG3s","title":"See Ya - Hot Girl, 씨야 - 핫 걸, Music Core 20081004","channel":"MBCkpop","channelId":"UCe52oeb7Xv_KaJsEzcKXJJg","duration":210,"date":"2008-10-04","kind":"broadcast","embedAllowed":true,"played":false,"checkedOn":"2026-11-04"},{"videoId":"CzkUIfl5R4Q","title":"See Ya - Hot Girl, 씨야 - 핫 걸, Music Core 20081018","channel":"MBCkpop","channelId":"UCe52oeb7Xv_KaJsEzcKXJJg","duration":189,"date":"2008-10-18","kind":"broadcast","embedAllowed":true,"played":false,"checkedOn":"2026-11-04"},{"videoId":"VYvKqDIxERQ","title":"Hot girl","channel":"SeeYa - Topic","channelId":"UCcZrxE5zk2zKYmMe9lg9xKA","duration":196,"kind":"official","embedAllowed":true,"played":false,"checkedOn":"2026-11-02"}],"group-track-039":[{"videoId":"3MlJembFD7s","title":"Turn it up","channel":"SeeYa - Topic","channelId":"UCcZrxE5zk2zKYmMe9lg9xKA","duration":222,"kind":"official","embedAllowed":true,"played":false,"checkedOn":"2026-11-02"}],"group-track-040":[{"videoId":"d25C3kMqdps","title":"집으로 돌아오는길 (Feat. SG워너비 김진호)","channel":"SeeYa - Topic","channelId":"UCcZrxE5zk2zKYmMe9lg9xKA","duration":213,"kind":"official","embedAllowed":true,"played":false,"checkedOn":"2026-11-02"}],"group-track-041":[{"videoId":"6EWtPi95ytY","title":"내가 울더라도","channel":"SeeYa - Topic","channelId":"UCcZrxE5zk2zKYmMe9lg9xKA","duration":201,"kind":"official","embedAllowed":true,"played":false,"checkedOn":"2026-11-02"}],"group-track-042":[{"videoId":"87lN0cAX-FY","title":"덩그러니","channel":"SeeYa - Topic","channelId":"UCcZrxE5zk2zKYmMe9lg9xKA","duration":273,"kind":"official","embedAllowed":true,"played":false,"checkedOn":"2026-11-02"}],"group-track-043":[{"videoId":"MzfMWx7hTuE","title":"사모곡","channel":"SeeYa - Topic","channelId":"UCcZrxE5zk2zKYmMe9lg9xKA","duration":213,"kind":"official","embedAllowed":true,"played":false,"checkedOn":"2026-11-02"}],"group-track-044":[{"videoId":"0d6qNoyLVII","title":"I wish","channel":"SeeYa - Topic","channelId":"UCcZrxE5zk2zKYmMe9lg9xKA","duration":234,"kind":"official","embedAllowed":true,"played":false,"checkedOn":"2026-11-02"}],"group-track-045":[{"videoId":"6kOSSc2Sk4s","title":"남자는 그래요","channel":"SeeYa - Topic","channelId":"UCcZrxE5zk2zKYmMe9lg9xKA","duration":270,"kind":"official","embedAllowed":true,"played":false,"checkedOn":"2026-11-02"}],"group-track-046":[{"videoId":"PZQnPnaAee4","title":"081102 씨야 그사람","channel":"휴우흐","kind":"broadcast","played":false,"checkedOn":"2026-11-02"},{"videoId":"GM8MyJ7ejJ4","title":"그 사람 (구두 Ⅲ)","channel":"SeeYa - Topic","channelId":"UCcZrxE5zk2zKYmMe9lg9xKA","duration":212,"kind":"official","embedAllowed":true,"played":false,"checkedOn":"2026-11-02"}],"group-track-047":[{"videoId":"haW2RdDxZJM","title":"솜사탕","channel":"SeeYa - Topic","channelId":"UCcZrxE5zk2zKYmMe9lg9xKA","duration":190,"kind":"official","embedAllowed":true,"played":false,"checkedOn":"2026-11-02"}],"group-track-048":[{"videoId":"1zsvEKsRU3s","title":"나 없이도","channel":"SeeYa - Topic","channelId":"UCcZrxE5zk2zKYmMe9lg9xKA","duration":282,"kind":"official","embedAllowed":true,"played":false,"checkedOn":"2026-11-02"}],"group-track-049":[{"videoId":"O80eQwDaEuI","title":"Loving you","channel":"SeeYa - Topic","channelId":"UCcZrxE5zk2zKYmMe9lg9xKA","duration":208,"kind":"official","embedAllowed":true,"played":false,"checkedOn":"2026-11-02"}],"group-track-050":[{"videoId":"iXzTNAD2m20","title":"SeeYa - His voice, 씨야 - 그놈 목소리, Music Core 20091114","channel":"MBCkpop","channelId":"UCe52oeb7Xv_KaJsEzcKXJJg","duration":180,"kind":"broadcast","embedAllowed":true,"played":false,"checkedOn":"2026-11-02"},{"videoId":"9AseMGUeNqY","title":"See Ya- His voice (씨야 - 그놈 목소리) @ SBS Inkigayo 인기가요 091220","channel":"SBSKPOP X INKIGAYO","channelId":"UCS_hnpJLQTvBkqALgapi_4g","duration":170,"published":"2012-01-25","embedAllowed":true,"checkedOn":"2026-11-02","played":true,"performanceId":"stage-9AseMGUeNqY","date":"2009-12-20","kind":"broadcast"},{"videoId":"_esZucb02gs","title":"MV | 씨야(SeeYa) - 그 놈 목소리 (His Voice) | Rebloom","channel":"DanalEntertainment","channelId":"UCpmctTnUfbeoycGhieZQAmw","duration":185,"kind":"official","embedAllowed":true,"played":false,"checkedOn":"2026-11-02"},{"videoId":"678GDIWAgPg","title":"그 놈 목소리","channel":"SeeYa - Topic","channelId":"UCcZrxE5zk2zKYmMe9lg9xKA","duration":185,"kind":"official","embedAllowed":true,"played":false,"checkedOn":"2026-11-02"}],"group-track-051":[{"videoId":"TTEB9BXpMuk","title":"앗차!","channel":"SeeYa - Topic","channelId":"UCcZrxE5zk2zKYmMe9lg9xKA","duration":176,"kind":"official","embedAllowed":true,"played":false,"checkedOn":"2026-11-02"}],"group-track-052":[{"videoId":"QiSUtXJY_ws","title":"눈물의 여왕","channel":"SeeYa - Topic","channelId":"UCcZrxE5zk2zKYmMe9lg9xKA","duration":262,"kind":"official","embedAllowed":true,"played":false,"checkedOn":"2026-11-02"}],"group-track-053":[{"videoId":"kfgEH8WBpsc","title":"바람핀다 믿었니","channel":"SeeYa - Topic","channelId":"UCcZrxE5zk2zKYmMe9lg9xKA","duration":194,"kind":"official","embedAllowed":true,"played":false,"checkedOn":"2026-11-02"}],"group-track-054":[{"videoId":"FyN34Vw1SAw","title":"T-Gana","channel":"SeeYa - Topic","channelId":"UCcZrxE5zk2zKYmMe9lg9xKA","duration":204,"kind":"official","embedAllowed":true,"played":false,"checkedOn":"2026-11-02"}],"group-track-055":[{"videoId":"KsqChvjaI6w","title":"SeeYa - So Nice To Meet You, 씨야 - 내겐 너무 멋진 그대, Music Core 20110129","channel":"MBCkpop","channelId":"UCe52oeb7Xv_KaJsEzcKXJJg","duration":218,"kind":"broadcast","embedAllowed":true,"played":false,"checkedOn":"2026-11-02"},{"videoId":"Yax4nGDtkW4","title":"MV | 씨야(SeeYa) - 내겐 너무 멋진 그대 | See You Again","channel":"DanalEntertainment","channelId":"UCpmctTnUfbeoycGhieZQAmw","duration":227,"kind":"official","embedAllowed":true,"played":false,"checkedOn":"2026-11-02"},{"videoId":"kkjuZvmpLFo","title":"내겐 너무 멋진 그대","channel":"SeeYa - Topic","channelId":"UCcZrxE5zk2zKYmMe9lg9xKA","duration":229,"kind":"official","embedAllowed":true,"played":false,"checkedOn":"2026-11-02"}],"group-track-056":[{"videoId":"4gpfFganjz4","title":"SeeYa - The Last, 씨야 - 더 라스트, Music Core 20110129","channel":"MBCkpop","channelId":"UCe52oeb7Xv_KaJsEzcKXJJg","duration":127,"kind":"broadcast","embedAllowed":true,"played":false,"checkedOn":"2026-11-02"},{"videoId":"wGRlWbfddJk","title":"The last","channel":"SeeYa - Topic","channelId":"UCcZrxE5zk2zKYmMe9lg9xKA","duration":204,"kind":"official","embedAllowed":true,"played":false,"checkedOn":"2026-11-02"}],"group-track-057":[{"videoId":"XZOKi5OMtAs","title":"SEEYA (씨야) - Stay | Show! MusicCore | MBC260627방송","channel":"MBCkpop","channelId":"UCe52oeb7Xv_KaJsEzcKXJJg","duration":212,"published":"2026-06-27","embedAllowed":true,"checkedOn":"2026-11-02","played":true,"performanceId":"stage-XZOKi5OMtAs","date":"2026-06-27","kind":"broadcast"},{"videoId":"Tm2OdWE8KBc","title":"Stay - SEEYA (씨야) | SBS 260621 방송","channel":"SBSKPOP X INKIGAYO","channelId":"UCS_hnpJLQTvBkqALgapi_4g","duration":210,"published":"2026-06-21","embedAllowed":true,"checkedOn":"2026-11-02","played":true,"performanceId":"stage-Tm2OdWE8KBc","date":"2026-06-21","kind":"broadcast"},{"videoId":"I1zhkwIuZ0A","title":"씨야 SEEYA - Stay Official MV (SEEYA Ver.)","channel":"SEEYA Official","channelId":"UCn6SB-9q1gNfGhx9_fFxIxg","duration":202,"kind":"official","embedAllowed":true,"played":false,"checkedOn":"2026-11-02"}],"group-track-058":[{"videoId":"5NHQjIoadto","title":"[4K]씨야 SEEYA - 계절은 돌고 돌아 Fancam│2026.08.29 경희대 평화의전당 콘서트 : THE FAN","channel":"DodongFancam도동직캠","channelId":"UCgm2Xzs8djJCUemRhGM6S-g","duration":210,"kind":"tour","embedAllowed":true,"played":false,"checkedOn":"2026-11-02"},{"videoId":"Uq9Tw4NERmQ","title":"Returning to You","channel":"SeeYa - Topic","channelId":"UCcZrxE5zk2zKYmMe9lg9xKA","duration":218,"kind":"official","embedAllowed":true,"played":false,"checkedOn":"2026-11-02"}],"group-track-059":[{"videoId":"vH8QBCYO0Yc","title":"[열린예술무대 뒤란] 씨야(SeeYa) - 봄처럼 그댄(You, Like Spring) | ubc 260821 방송","channel":"열린예술무대 뒤란","kind":"broadcast","played":false,"checkedOn":"2026-11-02"},{"videoId":"JeNLPdkh6FM","title":"씨야 SEEYA - 봄처럼 그댄 Official MV","channel":"SEEYA Official","channelId":"UCn6SB-9q1gNfGhx9_fFxIxg","duration":267,"kind":"official","embedAllowed":true,"played":false,"checkedOn":"2026-11-02"}],"group-track-060":[{"videoId":"pr3jaMISgsk","title":"260829 씨야 20주년 전국 투어 콘서트 THEFAN - 서울 씨야 Seeya - I Believe","channel":"콘서트 직촬","channelId":"UCzNyK9awuAbwFKM4TUF2ofQ","duration":227,"kind":"tour","date":"2026-08-29","checkedOn":"2026-11-03","embedAllowed":true,"played":false},{"videoId":"_CGekO1IRGc","title":"씨야 SEEYA - I Believe Official MV","channel":"SEEYA Official","channelId":"UCn6SB-9q1gNfGhx9_fFxIxg","duration":260,"kind":"official","embedAllowed":true,"played":false,"checkedOn":"2026-11-02"}],"group-track-061":[{"videoId":"whTAN8EeeB8","title":"씨야 -  그럼에도 우린 [열린 음악회/Open Concert] | KBS 260607 방송","channel":"KBS 레전드 케이팝","kind":"broadcast","played":false,"checkedOn":"2026-11-02"},{"videoId":"dmsw-tEenZ0","title":"씨야 SEEYA - 그럼에도 우린 Official MV","channel":"SEEYA Official","channelId":"UCn6SB-9q1gNfGhx9_fFxIxg","duration":222,"kind":"official","embedAllowed":true,"played":false,"checkedOn":"2026-11-02"}],"group-track-062":[{"videoId":"OvNfsRAnG74","title":"260829 씨야 20주년 전국 투어 콘서트 THEFAN - 서울 씨야 Seeya 안돼요","channel":"콘서트 직촬","kind":"tour","played":false,"checkedOn":"2026-11-02"},{"videoId":"aECHa9GVJok","title":"Please Don't","channel":"SeeYa - Topic","channelId":"UCcZrxE5zk2zKYmMe9lg9xKA","duration":242,"kind":"official","embedAllowed":true,"played":false,"checkedOn":"2026-11-02"}],"group-track-063":[{"videoId":"UMpTyqk0sRA","title":"씨야(SeeYa) 콘서트「잔향-4집」직캠 | 260829 씨야 20주년 콘서트 The Fan in 서울","channel":"🐿람보바라기","kind":"tour","played":false,"checkedOn":"2026-11-02"},{"videoId":"nFo1grp3Bjw","title":"Traces of You","channel":"SeeYa - Topic","channelId":"UCcZrxE5zk2zKYmMe9lg9xKA","duration":236,"kind":"official","embedAllowed":true,"played":false,"checkedOn":"2026-11-02"}],"group-track-064":[{"videoId":"mPgTjK3GurQ","title":"2026 08 29 끝내 꺾이지 않는 것 - SEEYA 20주년 기념 콘서트 THE FAN 직캠 4K60P","channel":"햄햄햄","kind":"tour","played":false,"checkedOn":"2026-11-02"},{"videoId":"iOQddZHdcLQ","title":"The Unbroken","channel":"SeeYa - Topic","channelId":"UCcZrxE5zk2zKYmMe9lg9xKA","duration":224,"kind":"official","embedAllowed":true,"played":false,"checkedOn":"2026-11-02"}],"group-track-065":[{"videoId":"OfaMxNJlD_I","title":"씨야 SEEYA - 우리 Live Ver. Official MV","channel":"SEEYA Official","channelId":"UCn6SB-9q1gNfGhx9_fFxIxg","duration":279,"kind":"live","embedAllowed":true,"played":false,"checkedOn":"2026-11-02"}],"group-track-066":[{"videoId":"8BBTw0eJ4HA","title":"Seeya-fool (씨야-바보) @SBS Inkigayo 인기가요 20080413@SBS Inkigayo 인기가요 20080413vv","channel":"SBSKPOP X INKIGAYO","channelId":"UCS_hnpJLQTvBkqALgapi_4g","duration":190,"kind":"broadcast","checkedOn":"2026-11-03","embedAllowed":true,"played":false,"date":"2008-04-13"},{"videoId":"ANUSI5FfWFM","title":"[MV] 씨야 _ 바보","channel":"1theK (원더케이)","channelId":"UCweOkPb1wVVH0Q0Tlj4a5Pw","duration":205,"kind":"official","embedAllowed":true,"played":false,"checkedOn":"2026-11-02"}],"group-track-068":[{"videoId":"sHeo6FDdH_A","title":"[2K] 씨야 & 다비치 & 지연 - 여성시대 (인기가요 2009.05.31)","channel":"화질중시채널","kind":"broadcast","played":false,"checkedOn":"2026-11-02"},{"videoId":"JQ-5-HjuSv0","title":"여성시대","channel":"SeeYa - Topic","channelId":"UCcZrxE5zk2zKYmMe9lg9xKA","duration":212,"kind":"official","embedAllowed":true,"played":false,"checkedOn":"2026-11-02"}],"group-track-070":[{"videoId":"ubVtYiAopyg","title":"【TVPP】Davichi(with T-ARA & SeeYa) - Wonder Woman, 다비치(티아라 & 씨야) - 원더우먼 @ Show! Music Core Live","channel":"TV-People","kind":"broadcast","played":false,"checkedOn":"2026-11-02"},{"videoId":"HuTfUAuwkdU","title":"원더우먼","channel":"SeeYa - Topic","channelId":"UCcZrxE5zk2zKYmMe9lg9xKA","duration":218,"kind":"official","embedAllowed":true,"played":false,"checkedOn":"2026-11-02"}],"group-track-071":[{"videoId":"sHnPOsZSpFQ","title":"씨야 - 가슴이 뭉클 (2010년)","channel":"MBC강원영동 MUSIC","kind":"broadcast","played":false,"checkedOn":"2026-11-02"},{"videoId":"mhmDf1o1hw0","title":"Personal Taste (Original Television Soundtrack) Pt. 2 - My heart is touched (개인의 취향...","channel":"SeeYa - Topic","channelId":"UCcZrxE5zk2zKYmMe9lg9xKA","duration":230,"kind":"official","embedAllowed":true,"played":false,"checkedOn":"2026-11-02"}],"group-track-072":[{"videoId":"NObuBFWx9RM","title":"미쳤나봐","channel":"SeeYa - Topic","channelId":"UCXh-QU9pBl7UgJQaFjbA6gQ","duration":239,"kind":"official","embedAllowed":true,"played":false,"checkedOn":"2026-11-02"}],"group-track-074":[{"videoId":"hpPNSxHK2Mw","title":"씨야 그리고 다비치 - 다 컸잖아 (다 컸잖아)","channel":"SeeYa - Topic","channelId":"UCXh-QU9pBl7UgJQaFjbA6gQ","duration":218,"kind":"official","embedAllowed":true,"played":false,"checkedOn":"2026-11-02"}],"group-track-075":[{"videoId":"5xVPQKrZ-yI","title":"시차 (With DAVICHI, Black Pearl) (시차)","channel":"SeeYa - Topic","channelId":"UCcZrxE5zk2zKYmMe9lg9xKA","duration":229,"kind":"official","embedAllowed":true,"played":false,"checkedOn":"2026-11-02"}],"group-track-076":[{"videoId":"7rs0gK-ahIg","title":"씨야 SeeYa - 용기를 주세요","channel":"MusicActionPlus","channelId":"UCbkYJV9r3qDOHYVvCoX2AAQ","duration":141,"kind":"official","embedAllowed":true,"played":false,"checkedOn":"2026-11-02"}],"group-fate-one-person":[{"videoId":"oqNMOWPuEW0","title":"가슴속에 한사람 (가슴속에 한사람)","channel":"SeeYa - Topic","channelId":"UCcZrxE5zk2zKYmMe9lg9xKA","duration":264,"kind":"official","embedAllowed":true,"played":false,"checkedOn":"2026-11-02"}],"solo-solo-MiUAHBTO55g":[{"videoId":"cUb8m6bpbyw","title":"Nam Gyu-ri - Man, 남규리 - 남자, Music Core 20080809","channel":"MBCkpop","channelId":"UCe52oeb7Xv_KaJsEzcKXJJg","duration":179,"kind":"broadcast","embedAllowed":true,"played":false,"checkedOn":"2026-11-02"},{"videoId":"MiUAHBTO55g","title":"고사: 피의 중간고사 (Original Motion Picture Soundtrack) - 남자 (남자 (男子))","channel":"Nam Gyu ri - Topic","channelId":"UCKRsSjFGndJb9VrTisc60ig","duration":226,"kind":"official","embedAllowed":true,"played":false,"checkedOn":"2026-11-02"}],"solo-solo-Sn7YYiXgQ6Y":[{"videoId":"MbHnINHWyC0","title":"남규리(Nam Kyuri) - 깊은 밤을 날아서 [콘서트7080] | KBS 20070505 방송","channel":"Again 가요톱10 : KBS KPOP Classic","channelId":"UCmZ19AIj_wcpwRcqG7p9L8g","duration":125,"kind":"broadcast","embedAllowed":true,"played":false,"checkedOn":"2026-11-02"},{"videoId":"Sn7YYiXgQ6Y","title":"깊은 밤을 날아서","channel":"SeeYa - Topic","channelId":"UCcZrxE5zk2zKYmMe9lg9xKA","duration":121,"kind":"official","embedAllowed":true,"played":false,"checkedOn":"2026-11-02"}],"solo-solo-cjuv_qVAgRA":[{"videoId":"ZhGOpr2lljo","title":"남규리 'HALO' 라이브클립 VER.1","channel":"뮤직카우","channelId":"UCWMPzEshTKfeQZKFRxyX8_w","duration":184,"kind":"live","embedAllowed":true,"played":false,"checkedOn":"2026-11-02"},{"videoId":"cjuv_qVAgRA","title":"[MV] Nam Kyu Ri(남규리) _ HALO","channel":"1theK (원더케이)","channelId":"UCweOkPb1wVVH0Q0Tlj4a5Pw","duration":186,"kind":"official","embedAllowed":true,"played":false,"checkedOn":"2026-11-02"}],"solo-solo-siyf1bcO5Gc":[{"videoId":"FbOzui3wk1Q","title":"남규리 - 그래도 좋아해요ㅣENA 케이팝업 차트쇼ㅣENA250829 방송","channel":"ENA K-POP","channelId":"UCFpfKdO4MMSc9ZoMjk2Tikg","duration":216,"kind":"broadcast","embedAllowed":true,"played":false,"checkedOn":"2026-11-02"},{"videoId":"siyf1bcO5Gc","title":"[MV] Nam Gyu ri(남규리) _ Still, I Like You(그래도 좋아해요)","channel":"1theK (원더케이)","channelId":"UCweOkPb1wVVH0Q0Tlj4a5Pw","duration":227,"kind":"official","embedAllowed":true,"played":false,"checkedOn":"2026-11-02"}],"solo-solo-9klPsmjNPDw":[{"videoId":"7CsBU-Pk-Po","title":"남규리 - 디셈버드림 (December Dream) Live Ver.","channel":"남규리 Nam Gyu Ri","channelId":"UCNbU5_rEMwaqy6PSXS1wiBA","duration":187,"kind":"live","embedAllowed":true,"played":false,"checkedOn":"2026-11-02"},{"videoId":"9klPsmjNPDw","title":"남규리 - 디셈버드림 (December Dream) Official Music Video","channel":"남규리 Nam Gyu Ri","channelId":"UCNbU5_rEMwaqy6PSXS1wiBA","duration":189,"kind":"official","embedAllowed":true,"played":false,"checkedOn":"2026-11-02"}],"solo-solo-nN7NV5FBhBw":[{"videoId":"nN7NV5FBhBw","title":"LIVE CLIP | 남규리(Nam Gyu Ri) - 슬픔이 찾아와서 그래(Prod. 로코베리)","channel":"에잇 8recordz x studio8","channelId":"UCWQTae3cFaQke_LchN7cGaQ","duration":198,"kind":"live","embedAllowed":true,"played":false,"checkedOn":"2026-11-02"}],"solo-solo-5USUHmWpPcg":[{"videoId":"jsZqyfW7-7M","title":"남규리 - 가슴앓이 (Love, Unspoken) LIVE Clip","channel":"남규리 Nam Gyu Ri","channelId":"UCNbU5_rEMwaqy6PSXS1wiBA","duration":196,"kind":"live","embedAllowed":true,"played":false,"checkedOn":"2026-11-02"},{"videoId":"5USUHmWpPcg","title":"[MV] Nam Gyu Ri(남규리) _ Love, Unspoken(가슴앓이)","channel":"1theK (원더케이)","channelId":"UCweOkPb1wVVH0Q0Tlj4a5Pw","duration":225,"kind":"official","embedAllowed":true,"played":false,"checkedOn":"2026-11-02"}],"solo-solo-Mjl8tBDX5Ik":[{"videoId":"UkOV4Z8Vpm8","title":"[Live Clip] 남규리(Nam Gyu Ri)_고백하는 거 맞아(I'm in love with you)","channel":"뮤직카우","channelId":"UCWMPzEshTKfeQZKFRxyX8_w","duration":247,"kind":"live","embedAllowed":true,"played":false,"checkedOn":"2026-11-02"},{"videoId":"Mjl8tBDX5Ik","title":"[Special Clip] 남규리(Nam Gyu Ri)_고백하는 거 맞아(I'm in love with you)","channel":"뮤직카우","channelId":"UCWMPzEshTKfeQZKFRxyX8_w","duration":249,"kind":"official","embedAllowed":true,"played":false,"checkedOn":"2026-11-02"}],"solo-solo-06MOxzzMPvI":[{"videoId":"njcupKAaiLM","title":"[LIVE] 씨야 남규리(Nam Gyu Ri) - 우리 사랑 그런 거 해요 Part.1 | 12시엔 주현영","channel":"SBS Radio 에라오","channelId":"UCAmff0euQRf6RwVlbB8PLMw","duration":204,"kind":"broadcast","embedAllowed":true,"played":false,"checkedOn":"2026-11-02"},{"videoId":"06MOxzzMPvI","title":"남규리 - 우리 사랑 그런 거 해요 Part.1 Official MV","channel":"남규리 Nam Gyu Ri","channelId":"UCNbU5_rEMwaqy6PSXS1wiBA","duration":210,"kind":"official","embedAllowed":true,"played":false,"checkedOn":"2026-11-02"}],"solo-solo-DFBk5oSn72Y":[{"videoId":"YMRvsqIF7QM","title":"남규리 - 우리 사랑 그런 거 해요 Part.2 (feat. KoN)ㅣ#케이팝업차트쇼 24회 #KPopUpChartShow #클립 ENA260929","channel":"ENA K-POP","channelId":"UCFpfKdO4MMSc9ZoMjk2Tikg","duration":241,"kind":"broadcast","embedAllowed":true,"played":false,"checkedOn":"2026-11-02"},{"videoId":"DFBk5oSn72Y","title":"남규리 - 우리 사랑 그런 거 해요 Part.2 (feat.KoN) Official MV","channel":"남규리 Nam Gyu Ri","channelId":"UCNbU5_rEMwaqy6PSXS1wiBA","duration":240,"kind":"official","embedAllowed":true,"played":false,"checkedOn":"2026-11-02"}],"solo-solo-8UAxgcnvk2E":[{"videoId":"mNbm_SAKk_E","title":"[SBS]최화정의파워타임,잊었니, 김연지 라이브","channel":"SBS Radio 에라오","channelId":"UCAmff0euQRf6RwVlbB8PLMw","duration":190,"kind":"broadcast","embedAllowed":true,"played":false,"checkedOn":"2026-11-02"},{"videoId":"8UAxgcnvk2E","title":"[M/V] 잊었니(Forgot) - 김연지(KIMYEONJI)","channel":"SUPER SOUND Bugs!","channelId":"UC9PVYlrwFSlqG7w8TDsqRvQ","duration":220,"kind":"official","embedAllowed":true,"played":false,"checkedOn":"2026-11-02"}],"solo-solo-lOvBRahMvtQ":[{"videoId":"lOvBRahMvtQ","title":"김연지 - 바람이 불면 [유희열의 스케치북/You Heeyeol's Sketchbook] 20200306","channel":"KBS Kpop","channelId":"UCeLPm9yH_a_QH8n6445G-Ow","duration":252,"kind":"broadcast","embedAllowed":true,"played":false,"checkedOn":"2026-11-02"}],"solo-solo-_FJkNLkV82U":[{"videoId":"_FJkNLkV82U","title":"[Live Clip] 내 맘(Mom) - 김연지 Official","channel":"김연지 Official","channelId":"UCjLZIdvRV7fQ3m_DA9NEkOg","duration":201,"kind":"live","embedAllowed":true,"played":false,"checkedOn":"2026-11-02"}],"solo-solo-JIpU0HXvc_E":[{"videoId":"JIpU0HXvc_E","title":"목소리를 되찾은 김연지의 진짜 이야기 | 김연지 (Kim Yeon Ji) - 노래ㅣ숲세권 라이브 (For:Rest LIVE)","channel":"숲세권 라이브 (For:Rest LIVE)","channelId":"UCEDGYiAk2qmg63pamdGMHSQ","duration":339,"kind":"live","embedAllowed":true,"played":false,"checkedOn":"2026-11-02"}],"solo-solo-Uko7Y-Tfj-8":[{"videoId":"Uko7Y-Tfj-8","title":"[Official] '김연지 - 당신은 천사와 커피를 마셔본 적이 있습니까' Special Clip (Full ver.)","channel":"TOON STUDIO","channelId":"UCve0b6qhfxTpKeqzZ4u0MjQ","duration":280,"kind":"official","embedAllowed":true,"played":false,"checkedOn":"2026-11-02"}],"solo-solo-arm2c6NH9vg":[{"videoId":"pI5rjwb-y2s","title":"[4K] 김연지(KIM YEON JI) “비가 오면 마음껏 울어도 되니까” Band LIVE Concert 노래방 18번 예약이요💘 [it’s KPOP LIVE 잇츠라이브]","channel":"it's Live","channelId":"UCB9e3pof1o83aa0kkaoeJGA","duration":285,"kind":"live","embedAllowed":true,"played":false,"checkedOn":"2026-11-02"},{"videoId":"arm2c6NH9vg","title":"[MV] KIM YEON JI(김연지) _ You can cry when it rains(비가 오면 마음껏 울어도 되니까)","channel":"1theK (원더케이)","channelId":"UCweOkPb1wVVH0Q0Tlj4a5Pw","duration":197,"kind":"official","embedAllowed":true,"played":false,"checkedOn":"2026-11-02"}],"solo-solo-gwRkvYc59_s":[{"videoId":"Xm5Oma6TVTE","title":"김연지 – 사랑의 인사 (원곡 : 씨야) | 피크닉라이브 소풍 | EP.134","channel":"ALL THE K-POP","channelId":"UCPde4guD9yFBRzkxk2PatoA","duration":247,"kind":"broadcast","embedAllowed":true,"played":false,"checkedOn":"2026-11-02"},{"videoId":"gwRkvYc59_s","title":"[Live Clip] 사랑의인사 - 김연지","channel":"김연지 Official","channelId":"UCjLZIdvRV7fQ3m_DA9NEkOg","duration":254,"kind":"live","embedAllowed":true,"played":false,"checkedOn":"2026-11-02"}],"solo-solo-atp-TU4Xezs":[{"videoId":"atp-TU4Xezs","title":"[Live Clip] 가슴으로운다 - 김연지","channel":"김연지 Official","channelId":"UCjLZIdvRV7fQ3m_DA9NEkOg","duration":206,"kind":"live","embedAllowed":true,"played":false,"checkedOn":"2026-11-02"}],"solo-solo-8k-YrZ5Gg2g":[{"videoId":"8k-YrZ5Gg2g","title":"[Live Clip] 빨간풍선 (빨간풍선ost) - 김연지","channel":"김연지 Official","channelId":"UCjLZIdvRV7fQ3m_DA9NEkOg","duration":231,"kind":"live","embedAllowed":true,"played":false,"checkedOn":"2026-11-02"}],"solo-solo-7h3ndp05JN0":[{"videoId":"NRhYAttexQ0","title":"[Live] Whisky on the Rock _ 김연지 [임백천의 백뮤직] | KBS 220817 방송","channel":"KBS KONG","channelId":"UC4GVSWFx-E6At_bnRIUmP4A","duration":304,"kind":"broadcast","embedAllowed":true,"played":false,"checkedOn":"2026-11-02"},{"videoId":"7h3ndp05JN0","title":"[MV] 김연지(Kim Yeon-Ji) - Whisky on the Rock | 우리들의 블루스(Our Blues) OST Part 1","channel":"냠냠엔터테인먼트 YAMYAM ENTERTAINMENT","channelId":"UCx_IoWPI_v4jI230YSvAHWQ","duration":307,"kind":"official","embedAllowed":true,"played":false,"checkedOn":"2026-11-02"}],"solo-solo-_lTZCnkpoyQ":[{"videoId":"_lTZCnkpoyQ","title":"[MV] Kim Yeon Ji(김연지) _ 10 years without you…(10년이나 버티니)","channel":"1theK (원더케이)","channelId":"UCweOkPb1wVVH0Q0Tlj4a5Pw","duration":209,"kind":"official","embedAllowed":true,"played":false,"checkedOn":"2026-11-02"}],"solo-solo-PHQbDyffSTw":[{"videoId":"PHQbDyffSTw","title":"[MV] 김연지 \"군주 - 가면의 주인 OST Part.5\" (Ruler: Master Of The Mask OST Part 5) - 계절사이 (Between Seasons)","channel":"DanalEntertainment","channelId":"UCpmctTnUfbeoycGhieZQAmw","duration":275,"kind":"official","embedAllowed":true,"played":false,"checkedOn":"2026-11-02"}],"solo-solo-6yrrTYk4sMs":[{"videoId":"6yrrTYk4sMs","title":"[RBW 아티스트 다이어리 시즌2] 김연지 '너만 있으면 다였는데' Live","channel":"RainbowbridgeWorld (RBW Inc.)","channelId":"UC4Rt2GpPPCr6IEhm1Jt967A","duration":280,"kind":"live","embedAllowed":true,"played":false,"checkedOn":"2026-11-02"}],"solo-solo-ppe9vyChKLs":[{"videoId":"H_U4HugKNK8","title":"★신곡★ '흩어지는 중' - 이보람 (Lee Boram) ▷Live clip◁ / [보람씨야]","channel":"보람씨야","channelId":"UCz11CPccQ2AnizJrdp58Bog","duration":171,"kind":"live","embedAllowed":true,"played":false,"checkedOn":"2026-11-02"},{"videoId":"ppe9vyChKLs","title":"[Full ver.] 흩어지는 중 (음원ver.) - 이보람 (Lee Boram) / [보람씨야]","channel":"보람씨야","channelId":"UCz11CPccQ2AnizJrdp58Bog","duration":252,"kind":"official","embedAllowed":true,"played":false,"checkedOn":"2026-11-02"}],"solo-solo-2WyOq7IMEnc":[{"videoId":"zWTxdwT2Gqo","title":"이보람 - 처음 그 자리에 (드라마 ＜풀하우스＞ OST) [더 시즌즈-성시경의 고막남친] | KBS 260529 방송","channel":"KBS Kpop","channelId":"UCeLPm9yH_a_QH8n6445G-Ow","duration":45,"kind":"broadcast","embedAllowed":true,"played":false,"checkedOn":"2026-11-02"},{"videoId":"2WyOq7IMEnc","title":"처음 그 자리에","channel":"leeboram - Topic","channelId":"UCO_OtqR33fYqev4XIZ69jvQ","duration":233,"kind":"official","embedAllowed":true,"played":false,"checkedOn":"2026-11-02"}],"solo-solo-L5Cn7BpkEeQ":[{"videoId":"L5Cn7BpkEeQ","title":"FREAK (Korean Version)","channel":"leeboram - Topic","channelId":"UCO_OtqR33fYqev4XIZ69jvQ","duration":203,"kind":"official","embedAllowed":true,"played":false,"checkedOn":"2026-11-02"}],"solo-solo-yjvTqgRzcXY":[{"videoId":"gyzBkqs65xY","title":"[ALLIVE] 이보람 - 빛의 반대편에서 | #MBCRADIO #정오의희망곡김신영입니다 #이보람 #씨야 #빛의반대편에서 #라이브 #무대 | MBC 260804 방송","channel":"Mhz 므흐즈: MBC RADIO","channelId":"UCKNZsAeQXpvI-Mpoc0ZKhsA","duration":211,"kind":"broadcast","embedAllowed":true,"played":false,"checkedOn":"2026-11-02"},{"videoId":"yjvTqgRzcXY","title":"이보람 (씨야) Lee Boram - 빛의 반대편에서 Beyond the light Official M/V","channel":"GENIE MUSIC","channelId":"UCd-OrgPLrnQiQBcq19j5oEQ","duration":209,"kind":"official","embedAllowed":true,"played":false,"checkedOn":"2026-11-02"}],"solo-solo-7VGw30BGkyw":[{"videoId":"7VGw30BGkyw","title":"매일 이렇게 비가 내려 -이보람 (IONY의 오선지 : Project #01)","channel":"보람씨야","channelId":"UCz11CPccQ2AnizJrdp58Bog","duration":151,"kind":"official","embedAllowed":true,"played":false,"checkedOn":"2026-11-02"}],"solo-solo-pwdQrpNpFyA":[{"videoId":"pwdQrpNpFyA","title":"[OFFICIAL SPECIAL VIDEO] 이보람(Lee Bo-Ram) - 너를 사랑하니까(Love, Always) 녹음실 버전","channel":"냠냠엔터테인먼트 YAMYAM ENTERTAINMENT","channelId":"UCx_IoWPI_v4jI230YSvAHWQ","duration":187,"kind":"live","embedAllowed":true,"played":false,"checkedOn":"2026-11-02"}],"solo-solo-oukYixC1ldo":[{"videoId":"_y5Pbme0BBo","title":"한계라고 느껴질 때... 이보람(Lee Boram)이 전하는 마음 '형 (兄)'♬｜비긴어게인 오픈마이크","channel":"Beginagain 비긴어게인","channelId":"UC8WoHUeN-eLynnLKGkwajYQ","duration":401,"kind":"broadcast","embedAllowed":true,"played":false,"checkedOn":"2026-11-02"},{"videoId":"oukYixC1ldo","title":"[최초 공개] 이보람 (씨야) - 형 (兄) Special Clip #이보람 #형","channel":"방구석 캐스팅","channelId":"UCqxtYw8SCaYFNQmCdjnvZrw","duration":250,"kind":"official","embedAllowed":true,"played":false,"checkedOn":"2026-11-02"}],"solo-solo-c6MlQvbbZw0":[{"videoId":"7sgBNEHjpZ0","title":"[OFFICIAL SPECIAL VIDEO] 이보람(Lee Bo-Ram) - 한 밤의 꿈처럼(Dream) 실외라이브","channel":"냠냠엔터테인먼트 YAMYAM ENTERTAINMENT","channelId":"UCx_IoWPI_v4jI230YSvAHWQ","duration":191,"kind":"live","embedAllowed":true,"played":false,"checkedOn":"2026-11-02"},{"videoId":"c6MlQvbbZw0","title":"이보람 (LEE BORAM) (씨야 (SeeYa)) - 한 밤의 꿈처럼 (Dream) MV","channel":"STONE MUSIC","channelId":"UC_pwIXKXNm5KGhdEVzmY60A","duration":189,"kind":"official","embedAllowed":true,"played":false,"checkedOn":"2026-11-02"}],"solo-solo-q4jtpVDemFE":[{"videoId":"BLALkFyMUOk","title":"[풀버전] 가로라이브 '이보람 - 사랑하니까'","channel":"보람씨야","channelId":"UCz11CPccQ2AnizJrdp58Bog","duration":220,"kind":"live","embedAllowed":true,"played":false,"checkedOn":"2026-11-02"},{"videoId":"q4jtpVDemFE","title":"[뮤비] 이보람 - 사랑하니까","channel":"보람씨야","channelId":"UCz11CPccQ2AnizJrdp58Bog","duration":223,"kind":"official","embedAllowed":true,"played":false,"checkedOn":"2026-11-02"}],"solo-solo-DujKGd4aA60":[{"videoId":"DujKGd4aA60","title":"▶Live clip◀ 이렇게 좋은 날 - 이보람 (Lee Boram) / [보람씨야]","channel":"보람씨야","channelId":"UCz11CPccQ2AnizJrdp58Bog","duration":184,"kind":"live","embedAllowed":true,"played":false,"checkedOn":"2026-11-02"}]},"vcr":[{"videoId":"rrMkSeKS4eM","title":"[(주)씨야엔터] 괴성과 고함이 난무한 씨야엔터 굿즈 아이템 회의?! 🐷⏰️👕","channel":"SEEYA Official","channelId":"UCn6SB-9q1gNfGhx9_fFxIxg","duration":113,"published":"2026-10-16","embedAllowed":true,"checkedOn":"2026-11-02","played":true},{"videoId":"Ip9XvKCeEkA","title":"[대구콘서트 스케치] 모두들 풍성한 한가위 보내시고 곧 고양에서 만나요! 🌕🩷","channel":"SEEYA Official","channelId":"UCn6SB-9q1gNfGhx9_fFxIxg","duration":291,"published":"2026-09-25","embedAllowed":true,"checkedOn":"2026-11-02","played":true},{"videoId":"6mik2QfyVCY","title":"EP.68 길고양이 겨울집 만들어주기!(feat. 방산시장 & 다이소) 남규리 소장님의 셀프 시공기 😺♥️🏠","channel":"남규리의 귤멍","channelId":"UC_naRJKw5Isgpv5nF8yNXLw","duration":822,"published":"2026-10-25","embedAllowed":true,"checkedOn":"2026-11-02","played":true},{"videoId":"PzdIJOVqS7I","title":"EP.67 남규리 ASMR 도전! 자연의 소리로 같이 힐링해요 🌳🍃🌞","channel":"남규리의 귤멍","channelId":"UC_naRJKw5Isgpv5nF8yNXLw","duration":1012,"published":"2026-10-18","embedAllowed":true,"checkedOn":"2026-11-02","played":true},{"videoId":"e2-TRuJUoVM","title":"[보람씨야] 조카네 집에 놀러 왔어요! 👶🏻 | 일상 브이로그 VLOG","channel":"보람씨야","channelId":"UCz11CPccQ2AnizJrdp58Bog","duration":448,"published":"2026-10-28","embedAllowed":true,"checkedOn":"2026-11-02","played":true},{"videoId":"-ahH0aTmUDY","title":"[보람씨야] 간만에 친구들이랑 성수 나들이 ☕️ | 일상 브이로그 VLOG","channel":"보람씨야","channelId":"UCz11CPccQ2AnizJrdp58Bog","duration":607,"published":"2026-10-21","embedAllowed":true,"checkedOn":"2026-11-02","played":true},{"videoId":"vScm0bPIGG8","title":"난생 처음 성대 수술하는 20년 차 가수의 슬기로운 '수술' 브이로그 .!","channel":"김연지 Official","channelId":"UCjLZIdvRV7fQ3m_DA9NEkOg","duration":536,"published":"2025-05-13","embedAllowed":true,"checkedOn":"2026-11-02","played":true},{"videoId":"r99O8h-lY40","title":"[VLOG] 김연지, 불후의 명곡 레전드 도전💛 | 왕중왕전 브이로그👑 (feat. DK 오빠) #잊지말아요","channel":"김연지 Official","channelId":"UCjLZIdvRV7fQ3m_DA9NEkOg","duration":1837,"published":"2025-04-29","embedAllowed":true,"checkedOn":"2026-11-02","played":true},{"videoId":"JvCo9GItLaE","title":"씨야의 리즈시절은 지금! 🤣","channelId":"UCn6SB-9q1gNfGhx9_fFxIxg","channel":"SEEYA Official","duration":60},{"videoId":"V3VvyytAW1U","title":"📢 씨야 전국투어 콘서트 예매는 티켓링크와 Yes24에서! #씨야 #남규리 #김연지 #이보람","channelId":"UCn6SB-9q1gNfGhx9_fFxIxg","channel":"SEEYA Official","duration":72},{"videoId":"frBg_RzSfd0","title":"📢 씨야 전국투어 콘서트 예매는 티켓링크와 Yes24에서! #씨야 #남규리 #김연지 #이보람","channelId":"UCn6SB-9q1gNfGhx9_fFxIxg","channel":"SEEYA Official","duration":83},{"videoId":"GaY5Hi4O9xM","title":"📢 씨야 전국투어 콘서트 예매는 티켓링크와 Yes24에서! #씨야 #남규리 #김연지 #이보람","channelId":"UCn6SB-9q1gNfGhx9_fFxIxg","channel":"SEEYA Official","duration":60},{"videoId":"Fc0AFR1Mguo","title":"🎉 씨야 20주년 전국투어 콘서트 합니다 🎉 티켓 예매는 Yes24에서 🩷","channelId":"UCn6SB-9q1gNfGhx9_fFxIxg","channel":"SEEYA Official","duration":60},{"videoId":"vsoslE-hZvA","title":"#테이 선배님의 #씨야 의 #stay 뺏기에 성공하셨습니다 🎵","channelId":"UCn6SB-9q1gNfGhx9_fFxIxg","channel":"SEEYA Official"},{"videoId":"hG8wvCu--4I","title":"#피프티피프티 #예원 #아테나 후배님들과 오늘도 귀여움 \"Stay\" 🩷 @WE_FIFTYFIFTY  #FIFTYFIFTY #YEWON #ATHENA#남규리 #STAY","channelId":"UCn6SB-9q1gNfGhx9_fFxIxg","channel":"SEEYA Official"},{"videoId":"MUx5pquM6gk","title":"보이넥스트도어@BOYNEXTDOOR 성호 후배님과 \"Stay\" 하고싶은 분? 🫢 #BOYNEXTDOOR #성호#씨야 #남규리 #STAY","channelId":"UCn6SB-9q1gNfGhx9_fFxIxg","channel":"SEEYA Official","duration":24},{"videoId":"oizr5swPErA","title":"뭔진 잘 모르겠지만 유행이래요 🫪 콘서트 홍보를 위해 열심히 챌린지 공부 중","channelId":"UCn6SB-9q1gNfGhx9_fFxIxg","channel":"SEEYA Official","duration":15},{"videoId":"n-QfT6M-5e4","title":"라이즈(@RIIZE) 은석 후배님과 음중에서 \"Stay\"✨️ #RIIZE #라이즈#EUNSEOK #은석#SEEYA #씨야 #남규리#STAY #스테이","channelId":"UCn6SB-9q1gNfGhx9_fFxIxg","channel":"SEEYA Official","duration":22},{"videoId":"7RFH_IzUWU0","title":"계속 함께 \"Stay\"하고 싶은 스테이씨 세은 후배님과🩷 @STAYC #STAYC #세은 #씨야 #남규리 #stay","channelId":"UCn6SB-9q1gNfGhx9_fFxIxg","channel":"SEEYA Official","duration":23},{"videoId":"RzKQByBoX6o","title":"스테이씨@STAYC 후배님들! 같이 놀아줘서 고마워요🩷 #STAYC #스테이씨 #시은 #아이사 #재이#씨야 #남규리","channelId":"UCn6SB-9q1gNfGhx9_fFxIxg","channel":"SEEYA Official","duration":22},{"videoId":"y-4OHMWz2-E","title":"오늘은 씨야 대구 콘서트 티켓 오픈날 🫣","channelId":"UCn6SB-9q1gNfGhx9_fFxIxg","channel":"SEEYA Official"},{"videoId":"8c0DhTuDeD8","title":"씨야 전국 투어 콘서트를 위해 E로 개조(?) 중! #씨야 #남규리 #김연지 #이보람","channelId":"UCn6SB-9q1gNfGhx9_fFxIxg","channel":"SEEYA Official","duration":19},{"videoId":"cGVGqZpHIx4","title":"씨야 20주년 콘서트 The Fan에서 만나요 👋 Yes24에서 예매하기! 🫣#씨야 #남규리 #김연지 #이보람 #콘서트","channelId":"UCn6SB-9q1gNfGhx9_fFxIxg","channel":"SEEYA Official","duration":11},{"videoId":"4wZpr4oSygM","title":"2026년 9월 5일, 씨야 부산 갑니다! 지금 Yes24로 고고 🩷","channelId":"UCn6SB-9q1gNfGhx9_fFxIxg","channel":"SEEYA Official","duration":59},{"videoId":"Xr4Z_WbAeAE","title":"여러분들의 많은 사랑과 관심 하나도 빠짐없이 마음에 담을게요! 감사하고 사랑합니다 🩷 -씨야 올림 #씨야 #남규리 #김연지 #이보람","channelId":"UCn6SB-9q1gNfGhx9_fFxIxg","channel":"SEEYA Official","duration":52},{"videoId":"e7YLmydYRqc","title":"2026.05.14 6PM 씨야 정규앨범 [First, Again] D-1 #씨야 #남규리 #김연지 #이보람","channelId":"UCn6SB-9q1gNfGhx9_fFxIxg","channel":"SEEYA Official","duration":47},{"videoId":"lG5qlYP93Qk","title":"2026.05.14 6PM 씨야 정규앨범 [First, Again] D-2 #씨야 #남규리 #김연지 #이보람","channelId":"UCn6SB-9q1gNfGhx9_fFxIxg","channel":"SEEYA Official","duration":60},{"videoId":"Jt8whrpLmyg","title":"2026.05.14 6PM 씨야 정규앨범 [First, Again] D-3 #씨야 #남규리 #김연지 #이보람","channelId":"UCn6SB-9q1gNfGhx9_fFxIxg","channel":"SEEYA Official","duration":43},{"videoId":"EvdD3pMkxTM","title":"2026.05.14 6PM 씨야 정규앨범 [First, Again] D-4 #씨야 #남규리 #김연지 #이보람","channelId":"UCn6SB-9q1gNfGhx9_fFxIxg","channel":"SEEYA Official","duration":44},{"videoId":"kWlQgOXZ0jM","title":"2026.05.14 6PM 씨야 정규앨범 [First, Again] D-5 #씨야 #남규리 #김연지 #이보람","channelId":"UCn6SB-9q1gNfGhx9_fFxIxg","channel":"SEEYA Official","duration":50},{"videoId":"f2xHyZJHheM","title":"2026.05.14 6PM 씨야 정규앨범 [First, Again] D-6 #씨야 #남규리 #김연지 #이보람","channelId":"UCn6SB-9q1gNfGhx9_fFxIxg","channel":"SEEYA Official","duration":28},{"videoId":"9pI-ACDbMVw","title":"2026.05.14 6PM 씨야 정규앨범 [First, Again] D-7 #씨야 #남규리 #김연지 #이보람","channelId":"UCn6SB-9q1gNfGhx9_fFxIxg","channel":"SEEYA Official","duration":27},{"videoId":"aq5Kynr1sAA","title":"2026.05.14 6PM 씨야 정규앨범 [First, Again] D-8 #씨야 #남규리 #김연지 #이보람","channelId":"UCn6SB-9q1gNfGhx9_fFxIxg","channel":"SEEYA Official","duration":60},{"videoId":"IMgKVlFZv2o","title":"2026.05.14 6PM 씨야 정규앨범 [First, Again] D-9 #씨야 #남규리 #김연지 #이보람","channelId":"UCn6SB-9q1gNfGhx9_fFxIxg","channel":"SEEYA Official","duration":60},{"videoId":"-WsgsQkVzJI","title":"2026.05.14 6PM SEEYA Special Album [First, Again] 🎵 #씨야 #SEEYA #남규리 #김연지 #이보람","channelId":"UCn6SB-9q1gNfGhx9_fFxIxg","channel":"SEEYA Official","duration":31},{"videoId":"QOxBzlWPFlc","title":"#남규리 의 사랑의 인사 2026 with #김연지 ❤ 무해한 조합 🤣","channelId":"UCn6SB-9q1gNfGhx9_fFxIxg","channel":"SEEYA Official","duration":44},{"videoId":"ZR1v0Zau09A","title":"#남규리 님이 #김연지 님의 #구두 노래뺏기에 도전하셨습니다 👠 과연 그 결과는?!","channelId":"UCn6SB-9q1gNfGhx9_fFxIxg","channel":"SEEYA Official","duration":66},{"videoId":"Pzl9mpZ-f5Y","title":"챌린지 뚝딱이들의 '그럼에도 우린' LIVE Ver. 많관사부 💗 #씨야 #남규리 #김연지 #이보람 #허각 #그럼에도우린","channelId":"UCn6SB-9q1gNfGhx9_fFxIxg","channel":"SEEYA Official","excludeFromVcr":true},{"videoId":"mv7LonElRgQ","title":"씨야 남규리 - 그럼에도 우린 LIVE Ver. 🎤 많관사부 💗 @Gyulmung","channelId":"UCn6SB-9q1gNfGhx9_fFxIxg","channel":"SEEYA Official","excludeFromVcr":true},{"videoId":"W3JI-zs9aEg","title":"씨야 김연지 - 그럼에도 우린 LIVE Ver. 🎤 많관사부 💗 @Official-eu4ex","channelId":"UCn6SB-9q1gNfGhx9_fFxIxg","channel":"SEEYA Official","excludeFromVcr":true},{"videoId":"Nzub6TrI8DU","title":"씨야 이보람 - 그럼에도 우린 LIVE Ver. 🎤 많관사부 💗 @BoramSEEYA","channelId":"UCn6SB-9q1gNfGhx9_fFxIxg","channel":"SEEYA Official","excludeFromVcr":true},{"videoId":"rSneZtiwVsc","title":"씨야 SEEYA '그럼에도 우린' Teaser 규리 ver.","channelId":"UCn6SB-9q1gNfGhx9_fFxIxg","channel":"SEEYA Official"},{"videoId":"3PlZg9_iTh8","title":"씨야 SEEYA '그럼에도 우린' Teaser 연지 ver.","channelId":"UCn6SB-9q1gNfGhx9_fFxIxg","channel":"SEEYA Official","duration":60},{"videoId":"pCU5V_4VyRM","title":"씨야 SEEYA '그럼에도 우린' Teaser 보람 ver.","channelId":"UCn6SB-9q1gNfGhx9_fFxIxg","channel":"SEEYA Official"},{"videoId":"Xfy-v6uFwqQ","title":"10월에 씨야 전국투어콘서트에서 만나요!","channelId":"UCn6SB-9q1gNfGhx9_fFxIxg","channel":"SEEYA Official","duration":94},{"videoId":"b7NzrBXnWnI","title":"씨야 전국투어콘서트 10월엔 더 즐거울 걸요? 🤣","channelId":"UCn6SB-9q1gNfGhx9_fFxIxg","channel":"SEEYA Official","duration":79},{"videoId":"7RA6GClaMgU","title":"씨야 전국투어 콘서트 [The Fan]은 계속 됩니다!","channelId":"UCn6SB-9q1gNfGhx9_fFxIxg","channel":"SEEYA Official","duration":94},{"videoId":"M-eCxfaBBoA","title":"씨야 전국투어 콘서트 [The Fan] 이젠 부산으로 갑니다!","channelId":"UCn6SB-9q1gNfGhx9_fFxIxg","channel":"SEEYA Official","duration":79},{"videoId":"n_n5s6i_diE","title":"씨야 -  Stay 응원법 (Fanchant Guide)","channelId":"UCn6SB-9q1gNfGhx9_fFxIxg","channel":"SEEYA Official"},{"videoId":"_CGekO1IRGc","title":"씨야 SEEYA - I Believe Official MV","channelId":"UCn6SB-9q1gNfGhx9_fFxIxg","channel":"SEEYA Official","duration":260},{"videoId":"OfaMxNJlD_I","title":"씨야 SEEYA - 우리 Live Ver. Official MV","channelId":"UCn6SB-9q1gNfGhx9_fFxIxg","channel":"SEEYA Official","excludeFromVcr":true},{"videoId":"JeNLPdkh6FM","title":"씨야 SEEYA - 봄처럼 그댄 Official MV","channelId":"UCn6SB-9q1gNfGhx9_fFxIxg","channel":"SEEYA Official","duration":267},{"videoId":"I1zhkwIuZ0A","title":"씨야 SEEYA - Stay Official MV (SEEYA Ver.)","channelId":"UCn6SB-9q1gNfGhx9_fFxIxg","channel":"SEEYA Official","duration":202},{"videoId":"RMNcT5AqLGA","title":"씨야 SEEYA - Stay Official MV","channelId":"UCn6SB-9q1gNfGhx9_fFxIxg","channel":"SEEYA Official","duration":229},{"videoId":"GsoQyLvtqi4","title":"[씨야 SEEYA - Stay] Teaser 03","channelId":"UCn6SB-9q1gNfGhx9_fFxIxg","channel":"SEEYA Official","duration":76},{"videoId":"l9kscOVD9UA","title":"[씨야 SEEYA - Stay] Teaser 02","channelId":"UCn6SB-9q1gNfGhx9_fFxIxg","channel":"SEEYA Official"},{"videoId":"fUMtb3QZMU0","title":"[씨야 SEEYA - Stay] Teaser 01","channelId":"UCn6SB-9q1gNfGhx9_fFxIxg","channel":"SEEYA Official","duration":65},{"videoId":"qqvOlrAx4p4","title":"[비하인드 클립] Nice to See You Again!","channelId":"UCn6SB-9q1gNfGhx9_fFxIxg","channel":"SEEYA Official"},{"videoId":"dmsw-tEenZ0","title":"씨야 SEEYA - 그럼에도 우린 Official MV","channelId":"UCn6SB-9q1gNfGhx9_fFxIxg","channel":"SEEYA Official","duration":222},{"videoId":"7JUhMkPNIXU","title":"씨야 SEEYA '그럼에도 우린' MV Teaser","channelId":"UCn6SB-9q1gNfGhx9_fFxIxg","channel":"SEEYA Official","duration":42},{"videoId":"iEK5HhRNzoQ","title":"씨야 SEEYA '그럼에도 우린' Teaser","channelId":"UCn6SB-9q1gNfGhx9_fFxIxg","channel":"SEEYA Official","duration":39},{"videoId":"TfdmlPWnEkQ","title":"보고만 있어도 미소 지어지는 치즈 냥이네 😺","channelId":"UC_naRJKw5Isgpv5nF8yNXLw","channel":"남규리의 귤멍","duration":28},{"videoId":"QleGsEuPEDA","title":"온 세상이 귀여워 🥰","channelId":"UC_naRJKw5Isgpv5nF8yNXLw","channel":"남규리의 귤멍","duration":56},{"videoId":"5IGU9JCcVUs","title":"한강공원의 소리를 찾아서...!  #남규리 #asmr #한강공원","channelId":"UC_naRJKw5Isgpv5nF8yNXLw","channel":"남규리의 귤멍","duration":59},{"videoId":"4CD3d5uGZjU","title":"편집자는 소리가 잘 안들려서 안경을 썼습니다...? 🤓 #남규리 #귤멍 #ASMR","channelId":"UC_naRJKw5Isgpv5nF8yNXLw","channel":"남규리의 귤멍","duration":58},{"videoId":"rSforGsXP7A","title":"ASMR 재밌네요 🤣 #남규리 #귤멍 #ASMR","channelId":"UC_naRJKw5Isgpv5nF8yNXLw","channel":"남규리의 귤멍"},{"videoId":"qtEsRUrIjZg","title":"우리 사랑 그런 거 해요 콘서트 Ver.🎤🎵 (feat. 씨야 전국투어콘서트)","channelId":"UC_naRJKw5Isgpv5nF8yNXLw","channel":"남규리의 귤멍","duration":132},{"videoId":"4SwCN_toeKk","title":"역시 락발라드하면 허각 @singer.huhgak ! 노래 뺏긴 것 같은데 어쩌죠? 🤣 #남규리 #우사그 #허각","channelId":"UC_naRJKw5Isgpv5nF8yNXLw","channel":"남규리의 귤멍","duration":33},{"videoId":"Iw4Iitj0PsI","title":"우사그 Part.1과 Part.2 가사로 드라마 한 편 탄생 🫪🩷","channelId":"UC_naRJKw5Isgpv5nF8yNXLw","channel":"남규리의 귤멍","duration":53},{"videoId":"zgPmcyfCtds","title":"노래도 잘하고 너무 착하신 #황가람 후배님과 사랑의 인사를 전합니다 ☺️ #남규리 #사랑의인사2026","channelId":"UC_naRJKw5Isgpv5nF8yNXLw","channel":"남규리의 귤멍"},{"videoId":"fZRczmoAggc","title":"원하고 또 원하고 있는데~~~~~~ 경환님 함께해주셔서 감사합니다☺️ #허경환 #남규리 #사랑의인사2026","channelId":"UC_naRJKw5Isgpv5nF8yNXLw","channel":"남규리의 귤멍","duration":51},{"videoId":"eZLx6be0Drw","title":"내겐 그대가 하나뿐이라 다른 사랑 못할 것 같아요🎵 #이세영 #남규리 #사랑의인사2026 #많관사부 🩷","channelId":"UC_naRJKw5Isgpv5nF8yNXLw","channel":"남규리의 귤멍","duration":43},{"videoId":"XwL35GMb_bM","title":"사랑의 인사 2026 with 김용준 🎵 #남규리 #김용준 #씨야 #SG워너비","channelId":"UC_naRJKw5Isgpv5nF8yNXLw","channel":"남규리의 귤멍","duration":49},{"videoId":"2Lt0UKzVuy8","title":"산에서 뛰지 맙시다 🫠","channelId":"UC_naRJKw5Isgpv5nF8yNXLw","channel":"남규리의 귤멍","duration":42},{"videoId":"-DwR0EqHGfA","title":"드라마 인간시장 대본 리딩 현장 👀 배우 남규리의 역할은?!","channelId":"UC_naRJKw5Isgpv5nF8yNXLw","channel":"남규리의 귤멍","duration":26},{"videoId":"gSe6LziFH1M","title":"🍊🐷 듣자마자 군침이 도는 삼겹살송 🎵","channelId":"UC_naRJKw5Isgpv5nF8yNXLw","channel":"남규리의 귤멍","duration":36},{"videoId":"Puc1uh7yuso","title":"새해 복 많이 받으시고 행복한 설 연휴 보내세요🍊⭐️🧡","channelId":"UC_naRJKw5Isgpv5nF8yNXLw","channel":"남규리의 귤멍","duration":83},{"videoId":"3gIhIZWe2ns","title":"🍊 vs 🤖 남규리의 새로운 친구(?)를 소개합니다","channelId":"UC_naRJKw5Isgpv5nF8yNXLw","channel":"남규리의 귤멍","duration":29},{"videoId":"YNCslwKHw5c","title":"🍊 + 🍓 + 🍫 남규리의 딸기 두쫀쿠 만들기","channelId":"UC_naRJKw5Isgpv5nF8yNXLw","channel":"남규리의 귤멍","duration":48},{"videoId":"WEjtFPR2xJY","title":"🍊한테 🍫 #두쫀쿠 사줄 사람~? 😁","channelId":"UC_naRJKw5Isgpv5nF8yNXLw","channel":"남규리의 귤멍","duration":27},{"videoId":"fPQIwFYPHzU","title":"🍊 남규리의 #홍콩여행 은 계속 됩니다 #귤멍 #남규리 #브이로그","channelId":"UC_naRJKw5Isgpv5nF8yNXLw","channel":"남규리의 귤멍","duration":36},{"videoId":"BC6vq6QzTDc","title":"🍊 in #홍콩 ! 혼자서 홍콩은 처음이라서 😂 #홍콩여행 과연 무사히 마쳤을까요?","channelId":"UC_naRJKw5Isgpv5nF8yNXLw","channel":"남규리의 귤멍","duration":29},{"videoId":"OaX7K0TN-Hc","title":"🍊 남규리, 식당 오픈한다?! 남셰프의 요리실력을 #귤멍 에서 확인하세요 🙃","channelId":"UC_naRJKw5Isgpv5nF8yNXLw","channel":"남규리의 귤멍","duration":32},{"videoId":"N8KUIHIftsw","title":"🍊 ☕️ 마시고 마시고 또 마시고! 배가 터질 뻔 했던 #강릉여행 ! 같이 #커피 한 잔 하실래요? 😂","channelId":"UC_naRJKw5Isgpv5nF8yNXLw","channel":"남규리의 귤멍","duration":33},{"videoId":"4vJecNsnSZE","title":"남규리 X SLAY - 디셈버드림 (December Dream) Duet cover #남규리 #slay #decemberdream","channelId":"UC_naRJKw5Isgpv5nF8yNXLw","channel":"남규리의 귤멍","duration":54},{"videoId":"-M7IibL8pA0","title":"2026년 귤도 귤별이도 원하는 일 다 이루어져라 얍🍊 ⭐️🧡","channelId":"UC_naRJKw5Isgpv5nF8yNXLw","channel":"남규리의 귤멍","duration":34},{"videoId":"PsxQWhATlDA","title":"우리 귤별이들은 2026년 어떤 새해 소원을 빌었나요? 👀","channelId":"UC_naRJKw5Isgpv5nF8yNXLw","channel":"남규리의 귤멍","duration":39},{"videoId":"DMOnCJ3jm-s","title":"드디어 귤멍 구독자 애칭을 결정했습니다 🍊🧡","channelId":"UC_naRJKw5Isgpv5nF8yNXLw","channel":"남규리의 귤멍","duration":35},{"videoId":"B2pYJbvHvdo","title":"🍊 남규리 #DecemberDream 뮤비 촬영 현장","channelId":"UC_naRJKw5Isgpv5nF8yNXLw","channel":"남규리의 귤멍","duration":25},{"videoId":"qbAJITv_Hr8","title":"🍊's 신곡 디셈버드림(December Dream)이 12월 23일(화) 오후 6시 공개됩니다! 많은 관심 부탁드려요 🧡","channelId":"UC_naRJKw5Isgpv5nF8yNXLw","channel":"남규리의 귤멍"},{"videoId":"DRLD4c0fdkk","title":"2025 남규리 목소리로 듣는 #씨야 #결혼할까요","channelId":"UC_naRJKw5Isgpv5nF8yNXLw","channel":"남규리의 귤멍","duration":47},{"videoId":"2rLqObTrDMg","title":"다시 돌아온 🍊 휴게소 먹방!","channelId":"UC_naRJKw5Isgpv5nF8yNXLw","channel":"남규리의 귤멍","duration":49},{"videoId":"-bmaW-61dXw","title":"🍊 신곡이 12월 23일 발매됩니다 #남규리 #Decemberdream","channelId":"UC_naRJKw5Isgpv5nF8yNXLw","channel":"남규리의 귤멍","duration":46},{"videoId":"DICaD9bKqHM","title":"🍊 in 결혼식! 저의 오랜 팬을 만나러 광주까지 달려 갔습니다","channelId":"UC_naRJKw5Isgpv5nF8yNXLw","channel":"남규리의 귤멍","duration":25},{"videoId":"0q6OJpqYct8","title":"귤멍 내일 예고! 규리의 비밀 작전이 펼쳐집니다 🫣","channelId":"UC_naRJKw5Isgpv5nF8yNXLw","channel":"남규리의 귤멍","duration":32},{"videoId":"TGp-VQlYnrQ","title":"보부상st 🍊의 가방 속을 공개합니다 😬","channelId":"UC_naRJKw5Isgpv5nF8yNXLw","channel":"남규리의 귤멍","duration":31},{"videoId":"11kcsgcOzNY","title":"🍊 남규리 중국 출장 헤메코","channelId":"UC_naRJKw5Isgpv5nF8yNXLw","channel":"남규리의 귤멍","duration":41},{"videoId":"rIu9Fxw62bI","title":"🍊 집에 몰래(?) 온 손님은? 내일 #귤멍 에서 확인하세요 😬","channelId":"UC_naRJKw5Isgpv5nF8yNXLw","channel":"남규리의 귤멍"},{"videoId":"NQWde0xKsFk","title":"귤 & 멍 듀엣🎵 #그래도좋아해요","channelId":"UC_naRJKw5Isgpv5nF8yNXLw","channel":"남규리의 귤멍","duration":40},{"videoId":"jcob_oe-g64","title":"촬영장에 커피차 선물받았🍊🧡","channelId":"UC_naRJKw5Isgpv5nF8yNXLw","channel":"남규리의 귤멍","duration":17},{"videoId":"i-VpN290pyw","title":"드라마 촬영장 속 🍊은 어떤 모습일까요? #남규리 #배우 #비하인드","channelId":"UC_naRJKw5Isgpv5nF8yNXLw","channel":"남규리의 귤멍","duration":23},{"videoId":"XV_ub5fyEeY","title":"여러분은 #그래도좋아해요 뮤비 다 보셨죠? 😂","channelId":"UC_naRJKw5Isgpv5nF8yNXLw","channel":"남규리의 귤멍","duration":30},{"videoId":"HFqo3cRWePs","title":"유튜브 #먹방 꿈나무 🍊 입니다 🧡","channelId":"UC_naRJKw5Isgpv5nF8yNXLw","channel":"남규리의 귤멍","duration":29},{"videoId":"3KIo5Dgl1z8","title":"🍊도 가끔 빡친답니다...!","channelId":"UC_naRJKw5Isgpv5nF8yNXLw","channel":"남규리의 귤멍","duration":28},{"videoId":"xycH73F9D0A","title":"배우 남규리의 연기 열정 뿜뿜 😬🍊","channelId":"UC_naRJKw5Isgpv5nF8yNXLw","channel":"남규리의 귤멍"},{"videoId":"vC6Ct8n-TC0","title":"웃기는 동생 자월이와 함께한 떡볶이 투어, 함께 보실래요? ☺️","channelId":"UC_naRJKw5Isgpv5nF8yNXLw","channel":"남규리의 귤멍"},{"videoId":"svM4V9SErN0","title":"🍊 오아시스 내한 공연 다녀왔어요 #남규리 #오아시스","channelId":"UC_naRJKw5Isgpv5nF8yNXLw","channel":"남규리의 귤멍","duration":67},{"videoId":"eiw5_ayqGng","title":"🍊🐬🍀 여러분에게도 행운이 함께하길 바라며!","channelId":"UC_naRJKw5Isgpv5nF8yNXLw","channel":"남규리의 귤멍","duration":69},{"videoId":"Phr_VOLlb9k","title":"🍊's 드라이브! 아름다운 신창 해안도로 풍경을 담아왔어요 ☺️","channelId":"UC_naRJKw5Isgpv5nF8yNXLw","channel":"남규리의 귤멍","duration":66},{"videoId":"G5iqrE-FWrU","title":"매주 일요일 #남규리 의 귤멍타임이 찾아옵니다 🍊","channelId":"UC_naRJKw5Isgpv5nF8yNXLw","channel":"남규리의 귤멍","duration":25},{"videoId":"JV7GVJlA0EE","title":"남규리의 #힐링 #브이로그 지금 시작합니다 🍊","channelId":"UC_naRJKw5Isgpv5nF8yNXLw","channel":"남규리의 귤멍","duration":31},{"videoId":"Ajn6wJMUJx0","title":"🍊🥑🥪 아보카도 샌드위치 ASMR #남규리 #레시피","channelId":"UC_naRJKw5Isgpv5nF8yNXLw","channel":"남규리의 귤멍","duration":58},{"videoId":"--IHejqqjNA","title":"🍊🍫🍰 #남규리 의 #티라미수케이크 #레시피 ASMR","channelId":"UC_naRJKw5Isgpv5nF8yNXLw","channel":"남규리의 귤멍","duration":57},{"videoId":"_vSZqKP0Db8","title":"#남규리 작사 🎵 나만을 위해","channelId":"UC_naRJKw5Isgpv5nF8yNXLw","channel":"남규리의 귤멍","duration":68},{"videoId":"Ar15_1Zh78A","title":"혼자서도 잘 먹는 🍊 #먹방 #브이로그","channelId":"UC_naRJKw5Isgpv5nF8yNXLw","channel":"남규리의 귤멍","duration":74},{"videoId":"23mKW4zJxnI","title":"🍊 우리집에 부장님이 놀러오셨어요 😁","channelId":"UC_naRJKw5Isgpv5nF8yNXLw","channel":"남규리의 귤멍","duration":61},{"videoId":"g1kI0iiBy7U","title":"꿈같이 행복한 날들이 계속 되기를 🍊🧡","channelId":"UC_naRJKw5Isgpv5nF8yNXLw","channel":"남규리의 귤멍","duration":86},{"videoId":"M8K4FBtbNNU","title":"🍊 새로운 노래도 많이 기대해주세요^^","channelId":"UC_naRJKw5Isgpv5nF8yNXLw","channel":"남규리의 귤멍","duration":20},{"videoId":"jYT9uH7fLH8","title":"🍊 #남규리 #그래도좋아해요 곧 발매됩니다^^","channelId":"UC_naRJKw5Isgpv5nF8yNXLw","channel":"남규리의 귤멍","duration":20},{"videoId":"S_7mbxOfYHA","title":"🍊's 우당탕탕 #솔로캠핑 기록! 😬","channelId":"UC_naRJKw5Isgpv5nF8yNXLw","channel":"남규리의 귤멍","duration":48},{"videoId":"XsG6uiLceeY","title":"오직 귤멍🍊에서만 볼 수 있는 #허용별 #고민중독 LIVE (feat.소시지 마이크)","channelId":"UC_naRJKw5Isgpv5nF8yNXLw","channel":"남규리의 귤멍","excludeFromVcr":true},{"videoId":"aH34h0M2WPg","title":"여러분, 그래도 좋아해요 🧡","channelId":"UC_naRJKw5Isgpv5nF8yNXLw","channel":"남규리의 귤멍","duration":36},{"videoId":"2cEiN8WY_Jk","title":"🍊 8월 17일 #남규리 #그래도좋아해요","channelId":"UC_naRJKw5Isgpv5nF8yNXLw","channel":"남규리의 귤멍","duration":48},{"videoId":"xaK2DN7t0pc","title":"남규리 - 그래도 좋아해요 D-1 🧡","channelId":"UC_naRJKw5Isgpv5nF8yNXLw","channel":"남규리의 귤멍"},{"videoId":"oO5FmttBXV0","title":"자랑스런 내 친구의 노래^^ #허각 #혼자한잔","channelId":"UC_naRJKw5Isgpv5nF8yNXLw","channel":"남규리의 귤멍","duration":60},{"videoId":"dEplPqErYCA","title":"귤멍과 너무 잘 어울렸던 #신용재 #불멍 (feat. MC귤🍊)","channelId":"UC_naRJKw5Isgpv5nF8yNXLw","channel":"남규리의 귤멍","duration":60},{"videoId":"Oar6mot3rfE","title":"역주행각! #임한별 안녕, 오늘의 그대에게 (feat.MC귤🍊)","channelId":"UC_naRJKw5Isgpv5nF8yNXLw","channel":"남규리의 귤멍","duration":39},{"videoId":"HHN9ncjr2R8","title":"그래도 좋아해요 🍊🧡 with 남규리 밴드","channelId":"UC_naRJKw5Isgpv5nF8yNXLw","channel":"남규리의 귤멍","duration":46},{"videoId":"SfBnm7lUTYM","title":"🍊's 쇼핑 in 동묘!","channelId":"UC_naRJKw5Isgpv5nF8yNXLw","channel":"남규리의 귤멍","duration":33},{"videoId":"2LUJGLqTgjo","title":"미친 허용별귤의 노래...🧡","channelId":"UC_naRJKw5Isgpv5nF8yNXLw","channel":"남규리의 귤멍","duration":51},{"videoId":"boM6aJ-h0Os","title":"허용별🍊이 전하는 사랑의 인사 👋","channelId":"UC_naRJKw5Isgpv5nF8yNXLw","channel":"남규리의 귤멍","duration":101},{"videoId":"8N2L40Hw33A","title":"현장 LIVE를 듣고 더 좋아진 황가람님의 나는 반딧불입니다 🍊🎵","channelId":"UC_naRJKw5Isgpv5nF8yNXLw","channel":"남규리의 귤멍","duration":55},{"videoId":"ZCqSUW8OsFI","title":"🍊 여수 먹방 🐟","channelId":"UC_naRJKw5Isgpv5nF8yNXLw","channel":"남규리의 귤멍","duration":47},{"videoId":"BUncYP66LwI","title":"규리의 업사이클링 리폼 도전! 안입는 옷들을 재탄생시켜 볼까요? ☺️ #패션 #스타일링 #리폼","channelId":"UC_naRJKw5Isgpv5nF8yNXLw","channel":"남규리의 귤멍","duration":52},{"videoId":"ooooRNIgqbs","title":"🍊's New Mate 이야누(Iyana)를 소개합니다 ☺️","channelId":"UC_naRJKw5Isgpv5nF8yNXLw","channel":"남규리의 귤멍","duration":57},{"videoId":"JzyV4zpIffk","title":"🍊만 몰랐던 이야기...?! 본편에서 확인하세요 😂","channelId":"UC_naRJKw5Isgpv5nF8yNXLw","channel":"남규리의 귤멍","duration":62},{"videoId":"J9G9RWjDE4o","title":"사랑을 나누러 갔다가 사랑을 가득 채우고 온 날의 기록 🍊  #HUG #만나샘","channelId":"UC_naRJKw5Isgpv5nF8yNXLw","channel":"남규리의 귤멍","duration":116},{"videoId":"5k6GmZ5eUG4","title":"열정 뿜뿜! 호기심 많은 🍊의 질문 폭격 주의! 🚨","channelId":"UC_naRJKw5Isgpv5nF8yNXLw","channel":"남규리의 귤멍","duration":36},{"videoId":"MGLqMkidH8w","title":"추석특집! 충격과 공포의 송편 만들기 대작전! ☺️🧡","channelId":"UC_naRJKw5Isgpv5nF8yNXLw","channel":"남규리의 귤멍","duration":53},{"videoId":"ut2OmROBB4A","title":"여러분~~ 행복한 한가위 되세요 🍊🧡","channelId":"UC_naRJKw5Isgpv5nF8yNXLw","channel":"남규리의 귤멍"},{"videoId":"8AmlrduO1NY","title":"핫도그, 문어라면, 흑돼지삼겹살...! 제주여행은 먹으려고 가는 거죠! 🫣","channelId":"UC_naRJKw5Isgpv5nF8yNXLw","channel":"남규리의 귤멍","duration":60},{"videoId":"B4IZ9ZR0R2c","title":"규리의 셀프힐링여행☺️🍊🧡 #제주도 #제주여행","channelId":"UC_naRJKw5Isgpv5nF8yNXLw","channel":"남규리의 귤멍","duration":46},{"videoId":"Pcw00-0_4g8","title":"🍊's 제주루트 2일차!","channelId":"UC_naRJKw5Isgpv5nF8yNXLw","channel":"남규리의 귤멍","duration":55},{"videoId":"mab7cyUudfA","title":"🍊 제주 먹방은 계속 됩니다 ☺️ #고기국수 #아이스크림 #돌하르방빵 #핫도그 #문어라면","channelId":"UC_naRJKw5Isgpv5nF8yNXLw","channel":"남규리의 귤멍"},{"videoId":"XYxAjjpYz5Y","title":"🍊 드디어 신곡이 나왔어요!! 우리 라이브 그런거해요!","channelId":"UC_naRJKw5Isgpv5nF8yNXLw","channel":"남규리의 귤멍","excludeFromVcr":true},{"videoId":"XeuhMsp44_s","title":"🍊","channelId":"UC_naRJKw5Isgpv5nF8yNXLw","channel":"남규리의 귤멍","excludeFromVcr":true},{"videoId":"2AGkX5SjOJY","title":"[Special Story with 씨야 마지막 콘서트] 기적같은 여러분! 우리 다시 만나요 👋","channelId":"UC_naRJKw5Isgpv5nF8yNXLw","channel":"남규리의 귤멍","duration":932},{"videoId":"7ESzhJT7lDQ","title":"[🍊's Pick] Dr.Shin 류신 아르기닌 & 관절 6","channelId":"UC_naRJKw5Isgpv5nF8yNXLw","channel":"남규리의 귤멍","duration":147},{"videoId":"vjH-71Nliko","title":"Ep.66 바쁘다 바빠! 남대표 남규리의 요즘 근황 🐷♥️ with 돼지","channelId":"UC_naRJKw5Isgpv5nF8yNXLw","channel":"남규리의 귤멍"},{"videoId":"1cK268hTM8Y","title":"[Special Clip] 나의 별이 되어준 귤별이들에게 💕","channelId":"UC_naRJKw5Isgpv5nF8yNXLw","channel":"남규리의 귤멍","duration":144},{"videoId":"_ij_QXFCzHY","title":"Ep65. 귤별이를 위한 팬송 공개🍊⭐🩷 넌 감동이라고 말하고 싶었어! (feat. 팬 선물 언박싱)","channelId":"UC_naRJKw5Isgpv5nF8yNXLw","channel":"남규리의 귤멍","duration":782},{"videoId":"U8xKCKSkhhk","title":"Ep.64 남규리, 울보된 날! 왜 자꾸 눈물이 날까요? 🥲음악방송 비하인드 (feat. KoN)","channelId":"UC_naRJKw5Isgpv5nF8yNXLw","channel":"남규리의 귤멍","duration":1051},{"videoId":"PQuBCS74HxM","title":"Ep.63 남규리, 10만 유튜버 되다! 실버버튼 언박싱과 구독자 Q&A 함께 해요! 🍊♥️","channelId":"UC_naRJKw5Isgpv5nF8yNXLw","channel":"남규리의 귤멍","duration":979},{"videoId":"wBJxsUK0nc8","title":"Ep.62 살다보니 이런 날이 오네요! 씨야 전국투어 콘서트 [The Fan] 비하인드 🍊🐿️🐶","channelId":"UC_naRJKw5Isgpv5nF8yNXLw","channel":"남규리의 귤멍"},{"videoId":"2FBZ9Vib3Lw","title":"Ep.61 남규리, 단발로 변신! 우리 사랑 그런 거 해요 😘 뮤직비디오 현장 비하인드","channelId":"UC_naRJKw5Isgpv5nF8yNXLw","channel":"남규리의 귤멍","duration":849},{"videoId":"uSVVyzQBRyw","title":"Ep.60 솔로라이프 이제 안녕! 이제 같이 살기로 했어요 😺♥️","channelId":"UC_naRJKw5Isgpv5nF8yNXLw","channel":"남규리의 귤멍"},{"videoId":"j9bpzfdX5yc","title":"Ep.59 우린 조금 멀리 돌아와 같은 곳에 서 있나 봐 🙂 씨야가 콘서트에 진심인 이유 (feat. The Fan)","channelId":"UC_naRJKw5Isgpv5nF8yNXLw","channel":"남규리의 귤멍","duration":977},{"videoId":"COprzuxGen4","title":"Ep.58 남규리 해외 출장 브이로그! 저 어디 다녀왔게요? @.@)","channelId":"UC_naRJKw5Isgpv5nF8yNXLw","channel":"남규리의 귤멍","duration":849},{"videoId":"0zcLLAFvpmw","title":"Ep.57 게임광 남규리의 달콤살벌 힐링데이 a.k.a. 오락실 도장깨기?!","channelId":"UC_naRJKw5Isgpv5nF8yNXLw","channel":"남규리의 귤멍","duration":932},{"videoId":"WsyxwPl55wQ","title":"Ep.56 전시보러 울산 다녀왔어요! 규리의 우아한 하루 브이로그 (feat. 하이퍼리얼리즘)","channelId":"UC_naRJKw5Isgpv5nF8yNXLw","channel":"남규리의 귤멍","duration":824},{"videoId":"POheFIIwsqo","title":"Ep.55 이번엔 대구 다녀왔습니다 🌞 남규리의 두 번째 버스킹 🎶","channelId":"UC_naRJKw5Isgpv5nF8yNXLw","channel":"남규리의 귤멍","duration":1091},{"videoId":"Qdi_gVUmhXI","title":"Ep.54 여러분! 씨야도 음방 돌아요! 씨야~호! 🤗 / 씨야 음악방송 비하인드 🎶","channelId":"UC_naRJKw5Isgpv5nF8yNXLw","channel":"남규리의 귤멍","duration":797},{"videoId":"aZKPgZHFd0c","title":"Ep.53 씨야 엔터 남대표가 쏜다! 고생하는 멤버들을 위한 당근타임 🥕","channelId":"UC_naRJKw5Isgpv5nF8yNXLw","channel":"남규리의 귤멍","duration":1008},{"videoId":"dKVDn4pUiLc","title":"Ep.52 대한민국, 북중미 월드컵! 기적을 바라며 응원했지만.. 🥲","channelId":"UC_naRJKw5Isgpv5nF8yNXLw","channel":"남규리의 귤멍","duration":1144},{"videoId":"ytKnBh5tA30","title":"Ep. 51 부산하면 시장투어! 남규리의 국제시장 & 깡통시장 털기 (feat.씨야 콘서트 홍보)","channelId":"UC_naRJKw5Isgpv5nF8yNXLw","channel":"남규리의 귤멍"},{"videoId":"17gUWdAZWEA","title":"Ep. 50 남대표는 열심히 부산콘서트 홍보 중!🎙 남규리 & 순순희 부산 버스킹 현장 두 번째","channelId":"UC_naRJKw5Isgpv5nF8yNXLw","channel":"남규리의 귤멍","duration":1475},{"videoId":"c8NnJNnkvt0","title":"Ep. 49 버스킹하기 딱 좋은 날씨네! 😎 남규리 & 순순희 부산 버스킹 현장 첫 번째","channelId":"UC_naRJKw5Isgpv5nF8yNXLw","channel":"남규리의 귤멍","duration":968},{"videoId":"b8d3lpKFLrE","title":"Ep.48 남대표의 부산 출장길 브이로그🚙 | 이 상무의 단콘 축하합니다🎉","channelId":"UC_naRJKw5Isgpv5nF8yNXLw","channel":"남규리의 귤멍","duration":1083},{"videoId":"qMxYWkAXPXU","title":"[스페셜 클립] 씨야 SEEYA 정규 4집 앨범 'First, Again' 랜선음감회 🎧 여러분의 최애곡은?! 🩷","channelId":"UC_naRJKw5Isgpv5nF8yNXLw","channel":"남규리의 귤멍"},{"videoId":"Ud_KJY1I1vQ","title":"Ep.47 오늘 밤은 씨야와 함께 STAY 🌟 🤗 | 씨야 정규 4집 타이틀곡 촬영현장 (with 아이키)","channelId":"UC_naRJKw5Isgpv5nF8yNXLw","channel":"남규리의 귤멍","duration":559},{"videoId":"FYrV4XZdbFE","title":"Ep.46 안녕하세요! 정규 4집으로 돌아온 씨야입니다! 🤗 | 씨야 자켓 촬영 현장 비하인드 📸","channelId":"UC_naRJKw5Isgpv5nF8yNXLw","channel":"남규리의 귤멍","duration":504},{"videoId":"uyMM80OZCMY","title":"Ep.45 해피귤스데이 🎂🍊♥️ | 울고 웃었던 아주 특별한 하루 with 특별 게스트들","channelId":"UC_naRJKw5Isgpv5nF8yNXLw","channel":"남규리의 귤멍"},{"videoId":"VE1bXWiCp-4","title":"[보너스 클립] 남규리 - 사랑의 인사 2026 홈비디오 ver.","channelId":"UC_naRJKw5Isgpv5nF8yNXLw","channel":"남규리의 귤멍","duration":241},{"videoId":"esccpk5IGbY","title":"Ep.44 📚책 읽어주는 귤 Part.2 | 꽃을 보듯 너를 본다 나태주 (feat. 수면유도 ASMR)","channelId":"UC_naRJKw5Isgpv5nF8yNXLw","channel":"남규리의 귤멍"},{"videoId":"7FAHv1Xt-Fo","title":"🍊귤's 레시피｜근대쌈밥 with 후무스","channelId":"UC_naRJKw5Isgpv5nF8yNXLw","channel":"남규리의 귤멍","duration":234},{"videoId":"LtGGq6cQxvo","title":"🍊남규리 힐링 브이로그｜Ep 01.멈추니까 보이는 것들｜숨이 차오를 때 한 번씩 잠시 멈춰보세요","channelId":"UC_naRJKw5Isgpv5nF8yNXLw","channel":"남규리의 귤멍","duration":515},{"videoId":"4DLmyJxXkkc","title":"🍊남규리 힐링 브이로그｜Ep 02. 내 시간을 변화시키는 작은 시작 Part1｜망설이지 말고 그냥 시작하세요!","channelId":"UC_naRJKw5Isgpv5nF8yNXLw","channel":"남규리의 귤멍","duration":426},{"videoId":"rZROlcGGWb0","title":"🍊귤's 레시피｜아보카도 샌드위치","channelId":"UC_naRJKw5Isgpv5nF8yNXLw","channel":"남규리의 귤멍"},{"videoId":"fjWWE-dE6To","title":"🍊남규리 힐링 브이로그｜Ep 02. 내 시간을 변화시키는 작은 시작 Part2 ｜ 잘 쉰다는 건 나와 친해지는 일이래요!","channelId":"UC_naRJKw5Isgpv5nF8yNXLw","channel":"남규리의 귤멍","duration":333},{"videoId":"hBRNG286too","title":"🍊귤's 레시피｜홈메이드 티라미수","channelId":"UC_naRJKw5Isgpv5nF8yNXLw","channel":"남규리의 귤멍","duration":148},{"videoId":"9Fo5VYRNnm8","title":"🍊 남규리 힐링 브이로그｜ Ep 03. 나를 위로하는 시간｜혼자서도 밥 잘 먹어요! 나만을 위한 밥상","channelId":"UC_naRJKw5Isgpv5nF8yNXLw","channel":"남규리의 귤멍","duration":554},{"videoId":"hP4Xwjr_J8Q","title":"🍊귤's 레시피｜꽃차","channelId":"UC_naRJKw5Isgpv5nF8yNXLw","channel":"남규리의 귤멍","duration":60},{"videoId":"Akw-DaBjhQ8","title":"🍊 귤's 레시피 | 할머니 갈비찜","channelId":"UC_naRJKw5Isgpv5nF8yNXLw","channel":"남규리의 귤멍","duration":84},{"videoId":"mMGx3-CdDyE","title":"🍊 남규리 힐링 브이로그 | Ep.04 소중한 사람과 함께하는 소중한 순간 | 조카랑 놀아주기 (feat. 짜장면 & 딸기라떼)","channelId":"UC_naRJKw5Isgpv5nF8yNXLw","channel":"남규리의 귤멍","duration":603},{"videoId":"Q6wN8rNK9dA","title":"🍊귤's 레시피 | 나나이모짜장면","channelId":"UC_naRJKw5Isgpv5nF8yNXLw","channel":"남규리의 귤멍","duration":113},{"videoId":"DUwwXeRiQVA","title":"🍊 귤's 레시피 | 나나이모 딸기라테","channelId":"UC_naRJKw5Isgpv5nF8yNXLw","channel":"남규리의 귤멍","duration":55},{"videoId":"zjytr57_Its","title":"🍊 배우 남규리 브이로그 | Ep.05 이 꿈에 머물고 싶어 | 칸 영화제 핑크카펫 &서울가요대상 비하인드","channelId":"UC_naRJKw5Isgpv5nF8yNXLw","channel":"남규리의 귤멍"},{"videoId":"UHwGZGI-nyE","title":"🍊 남규리 힐링 브이로그 | Ep.06 혼자라서 더 즐거운 시간 | 석모도 글램핑 (feat.조양방직)","channelId":"UC_naRJKw5Isgpv5nF8yNXLw","channel":"남규리의 귤멍","duration":1148},{"videoId":"3NxLrvrnzAo","title":"🍊 귤's 핫플레이스 | 조양방직","channelId":"UC_naRJKw5Isgpv5nF8yNXLw","channel":"남규리의 귤멍","duration":204},{"videoId":"89QLwY_GngY","title":"🍊 남규리 뮤직토크쇼 | Ep.07 함께 해줘서 고마워🧡 | 한 여름밤의 친구들(feat.허용별)","channelId":"UC_naRJKw5Isgpv5nF8yNXLw","channel":"남규리의 귤멍","duration":1196},{"videoId":"G_B9p2RZ8vQ","title":"🍊 귤's LIVE | 여름 안에서 (feat.허용별)","channelId":"UC_naRJKw5Isgpv5nF8yNXLw","channel":"남규리의 귤멍","excludeFromVcr":true},{"videoId":"D8XBjkcX7Z0","title":"[남규리 스페셜 다큐멘터리] 이제야 말하는 진심, 노래로 전하는 고백｜씨야에서 그래도 좋아해요까지","channelId":"UC_naRJKw5Isgpv5nF8yNXLw","channel":"남규리의 귤멍","duration":940},{"videoId":"72dkRGcIYgk","title":"🍊 남규리 뮤직토크쇼 | Ep.08 여름밤 허용별 콘서트 | MC규리는 성장 중...!","channelId":"UC_naRJKw5Isgpv5nF8yNXLw","channel":"남규리의 귤멍","duration":1270},{"videoId":"JSD0go1lLII","title":"🍊 귤's LIVE | 허각 - 혼자, 한잔","channelId":"UC_naRJKw5Isgpv5nF8yNXLw","channel":"남규리의 귤멍","excludeFromVcr":true},{"videoId":"dIL1Qdg7_xs","title":"🍊 귤's LIVE | 임한별 - 안녕, 오늘의 그대에게","channelId":"UC_naRJKw5Isgpv5nF8yNXLw","channel":"남규리의 귤멍","excludeFromVcr":true},{"videoId":"t6RZwGdhX98","title":"🍊 귤's LIVE | 신용재 - 불멍","channelId":"UC_naRJKw5Isgpv5nF8yNXLw","channel":"남규리의 귤멍","excludeFromVcr":true},{"videoId":"QLCHun_k69Q","title":"[Special Clip] 그래도 좋아해요 MV 비하인드 토크","channelId":"UC_naRJKw5Isgpv5nF8yNXLw","channel":"남규리의 귤멍","duration":890},{"videoId":"D2g3gaQdqVI","title":"🍊 남규리 힐링 브이로그 | Ep.09 그래도 좋아한다고 고백하는 거 맞아 | 밴드 멤버들과 동묘나들이 (feat. 스타일리스트 귤)","channelId":"UC_naRJKw5Isgpv5nF8yNXLw","channel":"남규리의 귤멍","duration":1137},{"videoId":"v94ggr3izUk","title":"🍊 남규리 뮤직토크쇼 | Ep.10 허용별귤 함께 LIVE | 노래할 때 가장 빛나는 사람들","channelId":"UC_naRJKw5Isgpv5nF8yNXLw","channel":"남규리의 귤멍","excludeFromVcr":true},{"videoId":"FG3pspmrsrw","title":"🍊  귤's LIVE | 허용별 - 이게 뭐냔 말이야","channelId":"UC_naRJKw5Isgpv5nF8yNXLw","channel":"남규리의 귤멍","excludeFromVcr":true},{"videoId":"q3--9xMqPew","title":"🍊  귤's LIVE | 허용별귤 - 미친 사랑의 노래","channelId":"UC_naRJKw5Isgpv5nF8yNXLw","channel":"남규리의 귤멍","excludeFromVcr":true},{"videoId":"wPcNvicmkPo","title":"🍊 남규리 힐링 브이로그 | Ep.11 여수 밤바다 그리고 반딧불 | 여수여행 & 페스티벌 MC 도전기 (특별출연 황가람님)","channelId":"UC_naRJKw5Isgpv5nF8yNXLw","channel":"남규리의 귤멍"},{"videoId":"1oLXlAEXcBU","title":"🍊 남규리 마음대로 브이로그 | Ep.12 만원짜리 패션스타일링?! | 귤실장님 업사이클링 리폼 도전 😀","channelId":"UC_naRJKw5Isgpv5nF8yNXLw","channel":"남규리의 귤멍","duration":1285},{"videoId":"qU2fayONEp0","title":"🍊 남규리 우당탕탕 브이로그 | Ep.13 나의 영국 친구를 소개합니다 | 영어 공부 열심히 하고 있어요 🫣","channelId":"UC_naRJKw5Isgpv5nF8yNXLw","channel":"남규리의 귤멍"},{"videoId":"5JANf4FmbNQ","title":"🍊 남규리 배움 브이로그 | Ep.14 귤식당 오픈 준비 중 | 열심히 메뉴 개발 중! (feat.  어바웃 박준영 셰프)","channelId":"UC_naRJKw5Isgpv5nF8yNXLw","channel":"남규리의 귤멍","duration":1763},{"videoId":"JwmAXqvpR-g","title":"🍊귤's 레시피｜삼겹살 토마토 파스타","channelId":"UC_naRJKw5Isgpv5nF8yNXLw","channel":"남규리의 귤멍","duration":275},{"videoId":"bi4NCaz__OA","title":"🍊귤's 레시피｜마라 크림 리소토 with 삼겹살","channelId":"UC_naRJKw5Isgpv5nF8yNXLw","channel":"남규리의 귤멍","duration":185},{"videoId":"VtouIEjeNnI","title":"🍊귤's 레시피｜삼겹살 떡볶이","channelId":"UC_naRJKw5Isgpv5nF8yNXLw","channel":"남규리의 귤멍","duration":235},{"videoId":"KNOasVMSYrU","title":"🍊 남규리 우당탕탕 브이로그 | Ep.15 추석특집 🥟 달콤살벌 송편 만들기 대작전(?) | 행복한 추석 보내세요 🧡","channelId":"UC_naRJKw5Isgpv5nF8yNXLw","channel":"남규리의 귤멍","duration":1425},{"videoId":"60dNYPs5RJ4","title":"🍊 남규리 힐링 브이로그 | Ep.16 남규리의 제주루트 Day 1 | 제주하늘,제주바다, 그리고 먹방🧡","channelId":"UC_naRJKw5Isgpv5nF8yNXLw","channel":"남규리의 귤멍","duration":1188},{"videoId":"pmhw1lyc0M4","title":"🍊 남규리 힐링 브이로그 | Ep.17 남규리의 제주루트 Day 2 | 규리야! 뭐 햄시냐? 👀","channelId":"UC_naRJKw5Isgpv5nF8yNXLw","channel":"남규리의 귤멍"},{"videoId":"jVCa6jPn3JA","title":"🍊 남규리 힐링 브이로그 | Ep.18 남규리의 제주루트 Day3 | 제주여행, 폭싹 속았수다! 🍀","channelId":"UC_naRJKw5Isgpv5nF8yNXLw","channel":"남규리의 귤멍","duration":1355},{"videoId":"YCtzV3bR6hc","title":"🍊 남규리 일상 브이로그 | Ep.19 남규리의 평범하지만 조금은 특별한 일주일 | 일본어공부 🖊 노래•연기연습 🎤 친구랑 수다👭 김완선 선배님 전시회 🖼  오아시스 콘서트 🎸","channelId":"UC_naRJKw5Isgpv5nF8yNXLw","channel":"남규리의 귤멍","duration":1411},{"videoId":"NIeNbStvYa0","title":"🍊 남규리 일상 브이로그 | Ep.20 변강쇠, 신당동, 엽기의 공통점은?! 🫣 | 매콤 달콤 떡볶이 투어 (feat. 위자월)","channelId":"UC_naRJKw5Isgpv5nF8yNXLw","channel":"남규리의 귤멍","duration":979},{"videoId":"EZDH03RfPKQ","title":"🍊 남규리 일상 브이로그 | Ep.21 남규리 충격 변신! 맑은 눈의 연기광 규리 | 드라마 촬영현장 살짝 보여드릴게요 (feat. 카카오페이지 인간시장)","channelId":"UC_naRJKw5Isgpv5nF8yNXLw","channel":"남규리의 귤멍","duration":591},{"videoId":"4TSdt2-DT80","title":"🍊 남규리 일상 브이로그 | Ep.22 눈물 펑펑 🥲 촬영장에서 생긴 일?! | 드라마 촬영현장 비하인드 두 번째 이야기","channelId":"UC_naRJKw5Isgpv5nF8yNXLw","channel":"남규리의 귤멍","duration":735},{"videoId":"6JiTQ12-tFg","title":" 🍊 남규리 힐링 브이로그 | Ep.23 이상한 나라에서 온 두부 | 남규리의 1일 펫시터 체험기 🐶","channelId":"UC_naRJKw5Isgpv5nF8yNXLw","channel":"남규리의 귤멍","duration":905},{"videoId":"AD77imZkwlM","title":"귤식당 당첨자 발표합니다 🍊🧡","channelId":"UC_naRJKw5Isgpv5nF8yNXLw","channel":"남규리의 귤멍","duration":695},{"videoId":"dkpgvfS_7RA","title":"🍊 남규리 힐링 브이로그 | Ep.24 낯선 도시, 익숙한 설레임의 중국 출장기 | 오늘 저 예쁜가요?","channelId":"UC_naRJKw5Isgpv5nF8yNXLw","channel":"남규리의 귤멍","duration":852},{"videoId":"6h86trNY6zc","title":"🍊 남규리 힐링 브이로그 | Ep.25 남규리의 왓츠인마이백 👝 | 여배우 파우치 털기! 뭐가 계속 나와요...!","channelId":"UC_naRJKw5Isgpv5nF8yNXLw","channel":"남규리의 귤멍","duration":968},{"videoId":"HnUQU1QkZRA","title":"🍊 남규리 힐링 브이로그 | Ep.26 깜짝 몰래카메라 나의 오랜 팬에게 | 광주가서 축가 부르고 왔어요 🎤 #씨야 #결혼할까요","channelId":"UC_naRJKw5Isgpv5nF8yNXLw","channel":"남규리의 귤멍","duration":865},{"videoId":"wmOhX7wUndk","title":"🍊 남규리 힐링 브이로그 | Ep.27 디셈버드림(December Dream) 뮤비 촬영 비하인드 | 드디어 구독자 애칭 발표 😬🧡","channelId":"UC_naRJKw5Isgpv5nF8yNXLw","channel":"남규리의 귤멍"},{"videoId":"9eL33u9f3CE","title":"🍊 남규리 힐링 브이로그 | Ep.28 2026년 새해 복 많이 받으세요! | 강원도 강릉으로 해돋이 기차여행 🌞","channelId":"UC_naRJKw5Isgpv5nF8yNXLw","channel":"남규리의 귤멍","duration":753},{"videoId":"RaK_jf5PwRc","title":"🍊 남규리 힐링 브이로그 | Ep.29 같이 커피 한 잔 할래요? | 강원도 강릉 이색 커피 투어 ☕️","channelId":"UC_naRJKw5Isgpv5nF8yNXLw","channel":"남규리의 귤멍","duration":725},{"videoId":"frUkQQcK6iQ","title":"🍊 남규리 힐링 브이로그 | Ep.30 넌 감동이었어🧡 | 귤별이들과 함께하는 귤식당 오픈! 🎉","channelId":"UC_naRJKw5Isgpv5nF8yNXLw","channel":"남규리의 귤멍","duration":944},{"videoId":"fIehhuyApqI","title":"🍊 남규리 여행 브이로그 | Ep.31 남규리의 우당탕탕 홍콩 여행 🛫 | 혼자 여행 쉽지 않네요...! 🤣","channelId":"UC_naRJKw5Isgpv5nF8yNXLw","channel":"남규리의 귤멍","duration":826},{"videoId":"5CD4IThQet0","title":"🍊 남규리 여행 브이로그 | Ep.32 남규리의 화양연화는 지금! 🌸 | 프로 유튜버로 거듭나는 중입니다 🫡","channelId":"UC_naRJKw5Isgpv5nF8yNXLw","channel":"남규리의 귤멍","duration":997},{"videoId":"1ca4er9zDD0","title":"🍊 남규리 우당탕탕  브이로그 | Ep.33 규리한테 두쫀쿠 사줄 사람? 저요! | 두바이st. 디저트 뿌시기! 👩‍🍳","channelId":"UC_naRJKw5Isgpv5nF8yNXLw","channel":"남규리의 귤멍","duration":880},{"videoId":"DtW-I-B1Pa4","title":"Ep.34 ChatGPT와 함께하는 한남동 투어! 우리..친구가 될 수 있을까? 🤔 |  남규리 우당탕탕 브이로그 🍊","channelId":"UC_naRJKw5Isgpv5nF8yNXLw","channel":"남규리의 귤멍","duration":850},{"videoId":"4m7JqK5odjo","title":"Ep.35 한남동을 방황하는 남규리?! with chatGPT (BGM 삼겹살송 🐷🎵) |  남규리 우당탕탕 브이로그 🍊","channelId":"UC_naRJKw5Isgpv5nF8yNXLw","channel":"남규리의 귤멍","duration":874},{"videoId":"_tCxUsVAd_U","title":"Ep.36 규리야~ 뭐하니? 배우 남규리 드라마 [인간시장] 대본리딩 & 시사회 현장 전격 공개! 😍 |  남규리 힐링 브이로그 🍊","channelId":"UC_naRJKw5Isgpv5nF8yNXLw","channel":"남규리의 귤멍","duration":822},{"videoId":"dfZxJIH4cCI","title":"Ep.37 남규리의 야밤 셀프 세차 도전기! 미안하고 고마운 나의 친구 붕붕이 목욕 시켜줬어요 🚗✨ |  남규리 힐링 브이로그 🍊","channelId":"UC_naRJKw5Isgpv5nF8yNXLw","channel":"남규리의 귤멍","duration":769},{"videoId":"uS_C2lANbP0","title":"Ep.38 남규리의 꿀피부를 위한 소소한 꿀팁들 공개합니다! ☺️ |  남규리 뷰티 브이로그 🍊","channelId":"UC_naRJKw5Isgpv5nF8yNXLw","channel":"남규리의 귤멍"},{"videoId":"HQQl-3OPp0U","title":"Ep.39 관악산 남다람쥐 등장! 좋은 기운 받으러 같이 등산해요 ⛰️ |  남규리 힐링 브이로그 🍊","channelId":"UC_naRJKw5Isgpv5nF8yNXLw","channel":"남규리의 귤멍","duration":891},{"videoId":"QwEAjrfN8WE","title":"Ep.40 그럼에도 우린 씨야입니다 💗 |  씨야 남규리, 김연지, 이보람 브이로그","channelId":"UC_naRJKw5Isgpv5nF8yNXLw","channel":"남규리의 귤멍","duration":883},{"videoId":"evYuFOqyJys","title":"Ep.41 15년을 기다린 꿈같은 하루 ✨️ |  씨야 신곡 그럼에도 우린 뮤직비디오 촬영현장 브이로그 🎵","channelId":"UC_naRJKw5Isgpv5nF8yNXLw","channel":"남규리의 귤멍","duration":961},{"videoId":"ctLA9ECbcoo","title":"Ep.42 야구왕(이 되고 싶은) 남규리 고척돔 가다! |  키움 히어로즈 시구하러 고척돔 간 브이로그 🎵","channelId":"UC_naRJKw5Isgpv5nF8yNXLw","channel":"남규리의 귤멍","duration":1059},{"videoId":"UdgmRKp8A-M","title":"남규리 - 사랑의 인사 2026 Teaser 3","channelId":"UC_naRJKw5Isgpv5nF8yNXLw","channel":"남규리의 귤멍","duration":31},{"videoId":"sMV9vkvXV1c","title":"Ep.43 규리가 2026년에 전하는 사랑의 인사 |  그토록 부르고 싶었던 노래 뮤직비디오 촬영 현장 비하인드🎥","channelId":"UC_naRJKw5Isgpv5nF8yNXLw","channel":"남규리의 귤멍"},{"videoId":"Y1136sZlQHs","title":"Ep.44 📚책 읽어주는 귤 Part.1 | 우리 같이 책 읽을까요? 졸면 안돼요 🤣 본격 꿀잠 유발 영상","channelId":"UC_naRJKw5Isgpv5nF8yNXLw","channel":"남규리의 귤멍","duration":1442},{"videoId":"dPUQRulJx-0","title":"🔔#징글벨락 🔔 #크리스마스송 #캐롤송 #김연지 #생목라이브 #메리크리스마스 🎅🎄#jinglebellsrock #merrychristmas","channelId":"UCjLZIdvRV7fQ3m_DA9NEkOg","channel":"김연지 Official","excludeFromVcr":true},{"videoId":"0UOyAoaehBI","title":"#생목라이브 #차안 #가슴으로운다 #김연지 #목풀기 #연습 #풀려라 #신곡 #리메이크 #kpop #발라드 #라이브","channelId":"UCjLZIdvRV7fQ3m_DA9NEkOg","channel":"김연지 Official","excludeFromVcr":true},{"videoId":"wf7pWfHTkOI","title":"모차르트 막공 퇴근길~","channelId":"UCjLZIdvRV7fQ3m_DA9NEkOg","channel":"김연지 Official","excludeFromVcr":true},{"videoId":"YpaUJoDM_MM","title":"연지시는 아니지만 인이어 언박싱!!!","channelId":"UCjLZIdvRV7fQ3m_DA9NEkOg","channel":"김연지 Official","excludeFromVcr":true},{"videoId":"-_I13nTF-L0","title":"4월22일 연지시","channelId":"UCjLZIdvRV7fQ3m_DA9NEkOg","channel":"김연지 Official","excludeFromVcr":true},{"videoId":"1Vg27yBtWUM","title":"3월15일 연지시","channelId":"UCjLZIdvRV7fQ3m_DA9NEkOg","channel":"김연지 Official","excludeFromVcr":true},{"videoId":"Dk4nQoGfh2g","title":"3월8일 연지시","channelId":"UCjLZIdvRV7fQ3m_DA9NEkOg","channel":"김연지 Official","excludeFromVcr":true},{"videoId":"afk_AwDkE1Y","title":"이걸 다시 부른다고요? 성대수술 후 ‘구두’ 로 돌아왔습니다!","channelId":"UCjLZIdvRV7fQ3m_DA9NEkOg","channel":"김연지 Official","duration":911},{"videoId":"OFAHe024sH0","title":"씨야 김연지, 성대 수술 6개월 만에 처음 노래해 봤습니다","channelId":"UCjLZIdvRV7fQ3m_DA9NEkOg","channel":"김연지 Official","duration":622},{"videoId":"yKevwM9DHk8","title":"씨야 노래를... 다시 부를 수 있을까요? (성대 수술 후 첫 도전)","channelId":"UCjLZIdvRV7fQ3m_DA9NEkOg","channel":"김연지 Official"},{"videoId":"a2Q-Psdhi4I","title":"데뷔 20년 만에 말 못하는 멤버를 처음 보는 씨야 보람이 반응","channelId":"UCjLZIdvRV7fQ3m_DA9NEkOg","channel":"김연지 Official","duration":1288},{"videoId":"Y5niUKlWVQY","title":"20년 차 가수가 목소리를 낼 수 없게 된다면?","channelId":"UCjLZIdvRV7fQ3m_DA9NEkOg","channel":"김연지 Official","duration":724},{"videoId":"mlNsbQEm8Yw","title":"20년 차 가수 생활.. 중단해야할까요?","channelId":"UCjLZIdvRV7fQ3m_DA9NEkOg","channel":"김연지 Official","duration":733},{"videoId":"T9UJ3PcPxu0","title":"[VLOG] 2주만에 불후의명곡 우승하는 방법!!","channelId":"UCjLZIdvRV7fQ3m_DA9NEkOg","channel":"김연지 Official","duration":1640},{"videoId":"g5ZJBeFQuGg","title":"[Real live] 🔔Jingle Bell Rock 🔔- 캐롤송 🎶🎄","channelId":"UCjLZIdvRV7fQ3m_DA9NEkOg","channel":"김연지 Official","excludeFromVcr":true},{"videoId":"p9M3n_ayuOw","title":"[VLOG] 연지의 부산여행 - 해변요가ㅣ브런치ㅣ요트투어ㅣ친구집에서 수다 타임까지ㅣ힐링여행","channelId":"UCjLZIdvRV7fQ3m_DA9NEkOg","channel":"김연지 Official"},{"videoId":"qSUpPP7vHpc","title":"[비하인드] ★ M/V 촬영 비하인드!!★\"비가오면 마음껏울어도되니까\" 뮤비 준비과정 &촬영현장 대.공.개!!","channelId":"UCjLZIdvRV7fQ3m_DA9NEkOg","channel":"김연지 Official"},{"videoId":"HvlsJ-sHt04","title":"[Live Clip] 비가오면 마음껏 울어도 되니까 - 김연지","channelId":"UCjLZIdvRV7fQ3m_DA9NEkOg","channel":"김연지 Official","excludeFromVcr":true},{"videoId":"5p_WUIHRNPk","title":"[VLOG] #전시회 나들이 VIOG -당신에게 '인연'은 무엇인가요??","channelId":"UCjLZIdvRV7fQ3m_DA9NEkOg","channel":"김연지 Official","duration":681},{"videoId":"gwRkvYc59_s","title":"[Live Clip] 사랑의인사 - 김연지","channelId":"UCjLZIdvRV7fQ3m_DA9NEkOg","channel":"김연지 Official","excludeFromVcr":true},{"videoId":"atp-TU4Xezs","title":"[Live Clip] 가슴으로운다 - 김연지","channelId":"UCjLZIdvRV7fQ3m_DA9NEkOg","channel":"김연지 Official","excludeFromVcr":true},{"videoId":"8k-YrZ5Gg2g","title":"[Live Clip] 빨간풍선 (빨간풍선ost) - 김연지","channelId":"UCjLZIdvRV7fQ3m_DA9NEkOg","channel":"김연지 Official","excludeFromVcr":true},{"videoId":"yhRSBlT-zq8","title":"[Live Clip] 시간이 지나면 잊혀진다 누가 그랬어 (뷰티풀모먼트ost) - 김연지","channelId":"UCjLZIdvRV7fQ3m_DA9NEkOg","channel":"김연지 Official","excludeFromVcr":true},{"videoId":"Vtbod5RDRog","title":"[Live Clip] 상상 (이상한변호사우영우ost) -김연지 Official","channelId":"UCjLZIdvRV7fQ3m_DA9NEkOg","channel":"김연지 Official","excludeFromVcr":true},{"videoId":"EPx3mcT-wZI","title":"[Live Clip] Whisky on the rock (우리들의 블루스 OST) - 김연지","channelId":"UCjLZIdvRV7fQ3m_DA9NEkOg","channel":"김연지 Official","excludeFromVcr":true},{"videoId":"fpwo3qTQxuY","title":"[VLOG] 연지의 퍼스널 컬러는?","channelId":"UCjLZIdvRV7fQ3m_DA9NEkOg","channel":"김연지 Official","duration":568},{"videoId":"DHLZEUD8BJk","title":"[Q&A] 미스트롯? 뮤지컬?  연지가 다 알려드립니다~!","channelId":"UCjLZIdvRV7fQ3m_DA9NEkOg","channel":"김연지 Official","duration":934},{"videoId":"zcgC6NDD0tQ","title":"[VLOG] ✨연지 노래방 OPEN✨ - 글램핑 브이로그 2탄","channelId":"UCjLZIdvRV7fQ3m_DA9NEkOg","channel":"김연지 Official"},{"videoId":"b17N4UnAMts","title":"[VLOG] 🏕연지의 가을 글램핑 VLOG - 매니저 1일 체험, 휴게소 간식 flex, 과자 asmr, 바닷가 라이브, 불멍까지🔥","channelId":"UCjLZIdvRV7fQ3m_DA9NEkOg","channel":"김연지 Official","duration":576},{"videoId":"qq7VPSJKwk8","title":"[Live Clip] Shallow (A Star Is Born OST) Vocal only ver. - 김연지 Official","channelId":"UCjLZIdvRV7fQ3m_DA9NEkOg","channel":"김연지 Official","excludeFromVcr":true},{"videoId":"i0iVyaJVyc4","title":"[Live Clip] Shallow(A Star Is Born OST) - 김연지  Official","channelId":"UCjLZIdvRV7fQ3m_DA9NEkOg","channel":"김연지 Official","excludeFromVcr":true},{"videoId":"hNpaQELx8uw","title":"[비하인드]★뮤지컬 모차르트!★ 연콘과 함께하는 대기실 비하인드(with.난넬)","channelId":"UCjLZIdvRV7fQ3m_DA9NEkOg","channel":"김연지 Official","duration":427},{"videoId":"uSWmUJF6Oeg","title":"[비하인드] 첫! 커스텀 인이어 제작기(feat. 언박싱 라이브)","channelId":"UCjLZIdvRV7fQ3m_DA9NEkOg","channel":"김연지 Official"},{"videoId":"0-VgHCHe91s","title":"[Live Clip] 김연지 단독 콘서트 직캠 ✨하이라이트✨ - 2편","channelId":"UCjLZIdvRV7fQ3m_DA9NEkOg","channel":"김연지 Official","excludeFromVcr":true},{"videoId":"K02MHUVQ-6k","title":"[Live Clip] 김연지 단독 콘서트 직캠  ✨하이라이트✨ - 1편","channelId":"UCjLZIdvRV7fQ3m_DA9NEkOg","channel":"김연지 Official","excludeFromVcr":true},{"videoId":"Y1eBMRxDtLo","title":"김연지 - 우리 다시 만나요 [MP3 Audio]","channelId":"UCjLZIdvRV7fQ3m_DA9NEkOg","channel":"김연지 Official","duration":249},{"videoId":"BezuQgMKfYA","title":"김연지 - 도망쳐 [MP3 Audio]","channelId":"UCjLZIdvRV7fQ3m_DA9NEkOg","channel":"김연지 Official","duration":187},{"videoId":"BKr4WHOP07g","title":"[Live Clip] 김연지 - 10년이나버티니","channelId":"UCjLZIdvRV7fQ3m_DA9NEkOg","channel":"김연지 Official","excludeFromVcr":true},{"videoId":"Ce8_oX93cMA","title":"[커버라이브] 우리 그만하자 - 김연지","channelId":"UCjLZIdvRV7fQ3m_DA9NEkOg","channel":"김연지 Official","excludeFromVcr":true},{"videoId":"yKi9ryETvBo","title":"[커버라이브] 전하지 못한 진심(방탄소년단_BTS) - 김연지","channelId":"UCjLZIdvRV7fQ3m_DA9NEkOg","channel":"김연지 Official","excludeFromVcr":true},{"videoId":"ylpCN-CXWJQ","title":"[Official Audio] 10년이나 버티니 - 김연지","channelId":"UCjLZIdvRV7fQ3m_DA9NEkOg","channel":"김연지 Official"},{"videoId":"_FJkNLkV82U","title":"[Live Clip] 내 맘(Mom) - 김연지 Official","channelId":"UCjLZIdvRV7fQ3m_DA9NEkOg","channel":"김연지 Official","excludeFromVcr":true},{"videoId":"M_FPSyuVae4","title":"[Teaser] 바람이 불면(When The Wind Blows) - 김연지 Official","channelId":"UCjLZIdvRV7fQ3m_DA9NEkOg","channel":"김연지 Official","duration":44},{"videoId":"cLaC4v0kRWk","title":"[스포라이브 티저] 바람이 불면(When The Wind Blows) - 김연지 Official","channelId":"UCjLZIdvRV7fQ3m_DA9NEkOg","channel":"김연지 Official","excludeFromVcr":true},{"videoId":"lRY2u_9IQLE","title":"[커버라이브] Love Poem (IU 아이유) - 김연지 Official","channelId":"UCjLZIdvRV7fQ3m_DA9NEkOg","channel":"김연지 Official","excludeFromVcr":true},{"videoId":"wRyD0sv1k8c","title":"[MV] 바람이 불면 (When The Wind Blows) - 김연지 Official","channelId":"UCjLZIdvRV7fQ3m_DA9NEkOg","channel":"김연지 Official"},{"videoId":"yg5sLcy7tCw","title":"[비하인드] ★씨야★ 멤버들과 함께한 슈가맨3 비하인드 영상 대!공!개!","channelId":"UCjLZIdvRV7fQ3m_DA9NEkOg","channel":"김연지 Official"},{"videoId":"r1ZWK8KxAIM","title":"[스포라이브] 김연지 - 바람이 불면 full ver.","channelId":"UCjLZIdvRV7fQ3m_DA9NEkOg","channel":"김연지 Official","excludeFromVcr":true},{"videoId":"Sp0HDqM-xHU","title":"[Official Audio] 바람이 불면 - 김연지 Official","channelId":"UCjLZIdvRV7fQ3m_DA9NEkOg","channel":"김연지 Official","duration":251},{"videoId":"bgSdWO0-iMk","title":"[커버라이브] Best Part(H.E.R) - 김연지 Official","channelId":"UCjLZIdvRV7fQ3m_DA9NEkOg","channel":"김연지 Official","excludeFromVcr":true},{"videoId":"h0o0CtFw1I0","title":"[비하인드] 경★유희열의 스케치북★축 돌아온 김연지의 유.스.케 나들이 + 콘푸로스트 언박싱","channelId":"UCjLZIdvRV7fQ3m_DA9NEkOg","channel":"김연지 Official","duration":188},{"videoId":"eJcxC1f-YTM","title":"[Live Clip] 사랑의인사 (씨야_SeeYa)  - 김연지 Official","channelId":"UCjLZIdvRV7fQ3m_DA9NEkOg","channel":"김연지 Official","excludeFromVcr":true},{"videoId":"NJRvSCPIlpQ","title":"[Live Clip] 비하인드! 사랑의인사 (씨야_SeeYa) - 김연지 Official","channelId":"UCjLZIdvRV7fQ3m_DA9NEkOg","channel":"김연지 Official","duration":119},{"videoId":"YTjhddY18WI","title":"[Live Clip] 미친사랑의 노래 (SeeYa_씨야) - 김연지 Official","channelId":"UCjLZIdvRV7fQ3m_DA9NEkOg","channel":"김연지 Official","excludeFromVcr":true},{"videoId":"PJai01nhBDw","title":"[Live Clip] 미친사랑의 노래(Vocal ver.) - 김연지 Official","channelId":"UCjLZIdvRV7fQ3m_DA9NEkOg","channel":"김연지 Official","excludeFromVcr":true},{"videoId":"CZy8Z1rDlrM","title":"[비하인드] ★불후의 명곡★ 깨발랄한 연지의 P.R.O적 모먼트 대.공.개","channelId":"UCjLZIdvRV7fQ3m_DA9NEkOg","channel":"김연지 Official","duration":365},{"videoId":"8D50dA-bWr8","title":"[Live Clip] 2002(Anne Marie) - 김연지 Official","channelId":"UCjLZIdvRV7fQ3m_DA9NEkOg","channel":"김연지 Official","excludeFromVcr":true},{"videoId":"Us3kFQ39f2Y","title":"[비하인드] ★뮤지컬 모차르트!★ 연지콘스탄체의 연습 현장 대.공.개","channelId":"UCjLZIdvRV7fQ3m_DA9NEkOg","channel":"김연지 Official","duration":246},{"videoId":"4YuwjlXda4s","title":"빛의 반대편에서 by 김연지 #이보람 #김연지 #KimYeonJi #빛의반대편에서 #Beyond_the_light","channelId":"UCz11CPccQ2AnizJrdp58Bog","channel":"보람씨야","duration":37},{"videoId":"dT48xQRbqrc","title":"빛의 반대편에서 with 경서 #이보람 #경서 #KyoungSeo #빛의반대편에서 #Beyond_the_light","channelId":"UCz11CPccQ2AnizJrdp58Bog","channel":"보람씨야","duration":39},{"videoId":"N5xtqno2aoI","title":"노래🎵#김연지 #노래","channelId":"UCz11CPccQ2AnizJrdp58Bog","channel":"보람씨야","duration":39},{"videoId":"dSvveFDnLhE","title":"빛의 반대편에서 by 알리(ALi) #이보람 #알리 #ALi #빛의반대편에서 #Beyond_the_light","channelId":"UCz11CPccQ2AnizJrdp58Bog","channel":"보람씨야","duration":39},{"videoId":"aJvQYuTiilc","title":"빛의 반대편에서 by HYNN(박혜원) #이보람 #박혜원 #HYNN #빛의반대편에서 #Beyond_the_light","channelId":"UCz11CPccQ2AnizJrdp58Bog","channel":"보람씨야","duration":35},{"videoId":"DmB3Frs6x5Q","title":"빛의 반대편에서 by 이솔로몬 #이보람 #이솔로몬 #leesolomon #빛의반대편에서 #Beyond_the_light","channelId":"UCz11CPccQ2AnizJrdp58Bog","channel":"보람씨야","duration":39},{"videoId":"QyAHFzU7b6Y","title":"빛의 반대편에서 by 임한별 #이보람 #임한별 #Onestar #빛의반대편에서 #Beyond_the_light","channelId":"UCz11CPccQ2AnizJrdp58Bog","channel":"보람씨야","duration":40},{"videoId":"l6E1_bRCOGk","title":"빛의 반대편에서 by 쏘머즈 #이보람 #쏘머즈 #somerz #빛의반대편에서 #Beyond_the_light","channelId":"UCz11CPccQ2AnizJrdp58Bog","channel":"보람씨야","duration":57},{"videoId":"2adhvJ-9anM","title":"빛의 반대편에서 by 제아 #이보람 #제아 #JeA #빛의반대편에서 #Beyond_the_light","channelId":"UCz11CPccQ2AnizJrdp58Bog","channel":"보람씨야","duration":35},{"videoId":"B2uSDXuJhOs","title":"☀️ 요즘 날씨 요약 🌧️ #이보람 #씨야","channelId":"UCz11CPccQ2AnizJrdp58Bog","channel":"보람씨야","duration":14},{"videoId":"vCiKmDWJnLc","title":"빛의 반대편에서 by 정동하 #이보람 #정동하 #JungDongHa #빛의반대편에서 #Beyond_the_light","channelId":"UCz11CPccQ2AnizJrdp58Bog","channel":"보람씨야"},{"videoId":"VEm8U00raMY","title":"빛의 반대편에서 by 김예찬 #이보람 #김예찬 #YECHAN #빛의반대편에서 #Beyond_the_light","channelId":"UCz11CPccQ2AnizJrdp58Bog","channel":"보람씨야","duration":38},{"videoId":"ZTQ0dWqiux8","title":"파격 변신!! 드디어 돌아온 빨머람💇‍♀️ #씨야 #이보람","channelId":"UCz11CPccQ2AnizJrdp58Bog","channel":"보람씨야","duration":108},{"videoId":"pYE7U7Ifb74","title":"빛의 반대편에서 by 하은 #이보람 #하은 #haeun #빛의반대편에서 #Beyond_the_light","channelId":"UCz11CPccQ2AnizJrdp58Bog","channel":"보람씨야","duration":39},{"videoId":"OWVEOmnAhVY","title":"🎬✨ 이보람 신곡 [빛의 반대편에서] 비하인드!  #이보람 #씨야 #빛의반대편에서","channelId":"UCz11CPccQ2AnizJrdp58Bog","channel":"보람씨야","duration":110},{"videoId":"QtmrMGKP4tA","title":"빛의 반대편에서 by 허각  #이보람 #허각 #HuhGak #빛의반대편에서 #Beyond_the_light","channelId":"UCz11CPccQ2AnizJrdp58Bog","channel":"보람씨야","duration":34},{"videoId":"pjuVbvMGP14","title":"빛의 반대편에서 by SF9 인성#이보람 #LEEBORAM #SF9 #에스에프나인 #인성 #INSEONG#빛의반대편에서 #Beyond_the_light","channelId":"UCz11CPccQ2AnizJrdp58Bog","channel":"보람씨야"},{"videoId":"d0UxjB8qJNk","title":"빛의 반대편에서 by DK (디셈버) #이보람 #LEEBORAM #디케이 #DK#빛의반대편에서 #Beyond_the_light","channelId":"UCz11CPccQ2AnizJrdp58Bog","channel":"보람씨야","duration":40},{"videoId":"dmlWyVxZVLg","title":"🐯⚾️ 갸보람, 시구하러 가기 전 특훈(?) 받는 중  #씨야 #이보람","channelId":"UCz11CPccQ2AnizJrdp58Bog","channel":"보람씨야","duration":51},{"videoId":"EhnA1riBvFk","title":"#이제야사랑이보이네 #이선희","channelId":"UCz11CPccQ2AnizJrdp58Bog","channel":"보람씨야","duration":60},{"videoId":"MNkq3Hy7f20","title":"#그대에게불러봐요 #정소연","channelId":"UCz11CPccQ2AnizJrdp58Bog","channel":"보람씨야","duration":35},{"videoId":"9O--CDE2ErM","title":"Mute is Off by 이보람 #이보람 #leeboram #MuteisOff챌린지","channelId":"UCz11CPccQ2AnizJrdp58Bog","channel":"보람씨야","duration":36},{"videoId":"WxLSAf8aiXU","title":"#RETURN #DK #디셈버","channelId":"UCz11CPccQ2AnizJrdp58Bog","channel":"보람씨야","duration":55},{"videoId":"m5AhI339WPg","title":"#그집앞 #정동하","channelId":"UCz11CPccQ2AnizJrdp58Bog","channel":"보람씨야","duration":60},{"videoId":"YXZpEBb2Nn8","title":"#당신을위하여 #더크로스","channelId":"UCz11CPccQ2AnizJrdp58Bog","channel":"보람씨야","duration":56},{"videoId":"Ufm2t1N5ekk","title":"#물고기자리 #이안","channelId":"UCz11CPccQ2AnizJrdp58Bog","channel":"보람씨야","duration":58},{"videoId":"1GOS-MSvLoA","title":"#숙녀에게 #변진섭 #송필근","channelId":"UCz11CPccQ2AnizJrdp58Bog","channel":"보람씨야","duration":57},{"videoId":"CCDiQH8Uruk","title":"#Golden #연습","channelId":"UCz11CPccQ2AnizJrdp58Bog","channel":"보람씨야","duration":50},{"videoId":"8p64YYbPyCI","title":"#운명 #풀하우스ost #why","channelId":"UCz11CPccQ2AnizJrdp58Bog","channel":"보람씨야","duration":53},{"videoId":"mqYgq98EuuE","title":"#너에게닿기를 #10cm","channelId":"UCz11CPccQ2AnizJrdp58Bog","channel":"보람씨야"},{"videoId":"AC4zOPFH94E","title":"#이럴거면 #아이비","channelId":"UCz11CPccQ2AnizJrdp58Bog","channel":"보람씨야","duration":60},{"videoId":"3kl-wqnW8fI","title":"매일 이렇게 비가 내려 - 이보람 25.06.23 오후 12시 💙","channelId":"UCz11CPccQ2AnizJrdp58Bog","channel":"보람씨야","duration":13},{"videoId":"tt0uG1HrEAk","title":"'매일 이렇게 비가 내려' - 이보람 25.06.23 오후 12:00","channelId":"UCz11CPccQ2AnizJrdp58Bog","channel":"보람씨야"},{"videoId":"Wg088E533ws","title":"#아시나요 #조성모","channelId":"UCz11CPccQ2AnizJrdp58Bog","channel":"보람씨야","duration":55},{"videoId":"Lo9HeSxc9p8","title":"Never Ending Story - 아이유(IU) (원곡 : 부활)","channelId":"UCz11CPccQ2AnizJrdp58Bog","channel":"보람씨야","duration":39},{"videoId":"pXZ5U8cjhiQ","title":"얼음인형 연습중 🎤 #얼음인형 #씨야","channelId":"UCz11CPccQ2AnizJrdp58Bog","channel":"보람씨야","duration":63},{"videoId":"mEHxqn2t4fo","title":"반가운 목소리 🩷 한서인 - 시간을 지나 🎶","channelId":"UCz11CPccQ2AnizJrdp58Bog","channel":"보람씨야","duration":22},{"videoId":"lXOUFuh24qw","title":"#고민중독 #qwer 연습중 🎤","channelId":"UCz11CPccQ2AnizJrdp58Bog","channel":"보람씨야"},{"videoId":"rp6cw0eAW3Y","title":"겨울 플리에 추가해야징 🧡 #녹지않을게 #케이시 #kassy","channelId":"UCz11CPccQ2AnizJrdp58Bog","channel":"보람씨야"},{"videoId":"KbN2F8o4O0g","title":"‘어떻게 이별까지 사랑하겠어, 널 사랑하는 거지’ 두 번째 미리보기  #어떻게이별까지사랑하겠어 #akmu #cover","channelId":"UCz11CPccQ2AnizJrdp58Bog","channel":"보람씨야","duration":52},{"videoId":"-7undJTsmCs","title":"HAPPY - DAY6(데이식스)","channelId":"UCz11CPccQ2AnizJrdp58Bog","channel":"보람씨야","duration":30},{"videoId":"rszZxGzq5yY","title":"보람씨야 이보람이 추천하는 '2024 Everything we do is music' 뮤지션 모집","channelId":"UCz11CPccQ2AnizJrdp58Bog","channel":"보람씨야"},{"videoId":"PZxV32jEC8I","title":"#그그그 가사가 뭐였더라..🥲","channelId":"UCz11CPccQ2AnizJrdp58Bog","channel":"보람씨야","duration":45},{"videoId":"aPL94FV7u3Q","title":"#형 살려줘... 행사 연습중🤤","channelId":"UCz11CPccQ2AnizJrdp58Bog","channel":"보람씨야","duration":45},{"videoId":"xHrfSq_swgM","title":"[보람씨야] I AM - 아이브 무반주 라이브 #shorts","channelId":"UCz11CPccQ2AnizJrdp58Bog","channel":"보람씨야","excludeFromVcr":true},{"videoId":"1kl1AnjHaNQ","title":"[보람씨야] 늦은후회 - 보보 #shorts","channelId":"UCz11CPccQ2AnizJrdp58Bog","channel":"보람씨야","duration":45},{"videoId":"TYGALsPfGuY","title":"[보람씨야] 결국엔 너에게 닿아서 - WSG워너비(가야G) #shorts","channelId":"UCz11CPccQ2AnizJrdp58Bog","channel":"보람씨야","duration":43},{"videoId":"8P8ryEGx0_U","title":"[보람씨야] Blue Moon - 씨야, 다비치, 블랙펄 #shorts","channelId":"UCz11CPccQ2AnizJrdp58Bog","channel":"보람씨야","duration":32},{"videoId":"wbiDHPTtqVs","title":"냥이와 함께 😺 에스파 #DreamsComeTrue #YouTubeShorts #드컴챌","channelId":"UCz11CPccQ2AnizJrdp58Bog","channel":"보람씨야"},{"videoId":"eFi6rasGFbM","title":"준비하시고 쏘세요 🔫 #댓댓 #thatthat #싸이","channelId":"UCz11CPccQ2AnizJrdp58Bog","channel":"보람씨야","duration":25},{"videoId":"ZnP8ug8cv2c","title":"의리의 가야G 가야G 평생 가야G 🥹❤️","channelId":"UCz11CPccQ2AnizJrdp58Bog","channel":"보람씨야","duration":27},{"videoId":"cCbgFNrqhLk","title":"#NeoSeoulChallenge #NCT127Challenge #광고","channelId":"UCz11CPccQ2AnizJrdp58Bog","channel":"보람씨야","duration":10},{"videoId":"vjdFfiMeLlE","title":"[보람씨야] 사건의 지평선 - 윤하 #shorts","channelId":"UCz11CPccQ2AnizJrdp58Bog","channel":"보람씨야"},{"videoId":"k_f_oFhA71o","title":"람봉 골라보람 🐿️💛","channelId":"UCz11CPccQ2AnizJrdp58Bog","channel":"보람씨야","excludeFromVcr":true},{"videoId":"sDtfWK-qFtM","title":"보람씨야 라이브 스트리밍 중","channelId":"UCz11CPccQ2AnizJrdp58Bog","channel":"보람씨야","excludeFromVcr":true},{"videoId":"S27UvqQdUs0","title":"수다라방📢 당신을 위하여 🎶🎧","channelId":"UCz11CPccQ2AnizJrdp58Bog","channel":"보람씨야","excludeFromVcr":true},{"videoId":"xE2qsy-Ao8c","title":"보람씨야 라이브 스트리밍 중","channelId":"UCz11CPccQ2AnizJrdp58Bog","channel":"보람씨야","excludeFromVcr":true},{"videoId":"Ns0t_K9VX38","title":"보람씨야 라이브 스트리밍 중","channelId":"UCz11CPccQ2AnizJrdp58Bog","channel":"보람씨야","excludeFromVcr":true},{"videoId":"2F8lbmAIe9E","title":"보람씨야 라이브 스트리밍 중","channelId":"UCz11CPccQ2AnizJrdp58Bog","channel":"보람씨야","excludeFromVcr":true},{"videoId":"5EFMPIOC0q4","title":"수다라방 😆","channelId":"UCz11CPccQ2AnizJrdp58Bog","channel":"보람씨야","excludeFromVcr":true},{"videoId":"obqGtsQI-bY","title":"더 울어라~ 젊은 인생아~~","channelId":"UCz11CPccQ2AnizJrdp58Bog","channel":"보람씨야","excludeFromVcr":true},{"videoId":"x1PvT31_vck","title":"오랜만에 깜짝 라방🫣","channelId":"UCz11CPccQ2AnizJrdp58Bog","channel":"보람씨야","excludeFromVcr":true},{"videoId":"oD9ITwOT9_E","title":"오랜만이람","channelId":"UCz11CPccQ2AnizJrdp58Bog","channel":"보람씨야","excludeFromVcr":true},{"videoId":"kvSnASgOItM","title":"구독자 애칭 발표 🥁","channelId":"UCz11CPccQ2AnizJrdp58Bog","channel":"보람씨야","excludeFromVcr":true},{"videoId":"KONXltUM2DA","title":"퇴근길 🚗","channelId":"UCz11CPccQ2AnizJrdp58Bog","channel":"보람씨야","excludeFromVcr":true},{"videoId":"OLg6GfKb7Yc","title":"가야G 가야G 라이브 가야G!!!!❤️","channelId":"UCz11CPccQ2AnizJrdp58Bog","channel":"보람씨야","excludeFromVcr":true},{"videoId":"c6PoIF3PQ04","title":"30만 감사합니다 🙇🏻‍♀️","channelId":"UCz11CPccQ2AnizJrdp58Bog","channel":"보람씨야","excludeFromVcr":true},{"videoId":"gxb926KhG0c","title":"데뷔 16주년이라니!! 근데 이제 코로나를 곁들인..","channelId":"UCz11CPccQ2AnizJrdp58Bog","channel":"보람씨야","excludeFromVcr":true},{"videoId":"ljV61LAl3Ss","title":"치킨 라이브 🐯","channelId":"UCz11CPccQ2AnizJrdp58Bog","channel":"보람씨야","excludeFromVcr":true},{"videoId":"mhbZnyxouAM","title":"눕방 😴 얼마만에 라이브지? 🤭","channelId":"UCz11CPccQ2AnizJrdp58Bog","channel":"보람씨야","excludeFromVcr":true},{"videoId":"CdtBBO_KV8o","title":"오랜만이에요❤️","channelId":"UCz11CPccQ2AnizJrdp58Bog","channel":"보람씨야","excludeFromVcr":true},{"videoId":"f9j0Cj91emE","title":"너무 늦어 죄송해요ㅠ 복면가왕 Q&A 👉🏻👈🏻","channelId":"UCz11CPccQ2AnizJrdp58Bog","channel":"보람씨야","excludeFromVcr":true},{"videoId":"WTZFDr_ZP9Y","title":"이보람 음원발매 기념 버스킹","channelId":"UCz11CPccQ2AnizJrdp58Bog","channel":"보람씨야","excludeFromVcr":true},{"videoId":"yRYZeoEBWDU","title":"[보람씨야] 맛있는 것도 먹고! 우석대학교 씨야 행사🎤 | [일상 브이로그/VLOG]","channelId":"UCz11CPccQ2AnizJrdp58Bog","channel":"보람씨야"},{"videoId":"dW8vBqXwWGE","title":"[보람씨야] 씨야 콘서트 '대구' VLOG 🎤 | 짧음 주의! 대구 콘서트 비하인드","channelId":"UCz11CPccQ2AnizJrdp58Bog","channel":"보람씨야","duration":176},{"videoId":"yyj8xNAfjUs","title":"[보람씨야] 눈물광광🥹 테라리움 만들고 왔어요! 🌿 | 일상 브이로그 VLOG","channelId":"UCz11CPccQ2AnizJrdp58Bog","channel":"보람씨야"},{"videoId":"05rfQa2tRYw","title":"[보람씨야] 제주도 호캉스에 천지연폭포 산책까지!🌴(2부) [제주도 여행 브이로그/VLOG]","channelId":"UCz11CPccQ2AnizJrdp58Bog","channel":"보람씨야","duration":596},{"videoId":"_AbFDbCDAHI","title":"[보람씨야] 제주도 호캉스! (1부)🌴✈️ 먹고! 놀고! 쉬고! [제주도 여행 브이로그/VLOG]","channelId":"UCz11CPccQ2AnizJrdp58Bog","channel":"보람씨야","duration":907},{"videoId":"EKj0dbTGa8M","title":"[보람씨야] 파격 변신!!💇‍♀️ 염색부터 NEW 앨범 라이브 촬영까지! [일상 브이로그/VLOG]","channelId":"UCz11CPccQ2AnizJrdp58Bog","channel":"보람씨야","duration":834},{"videoId":"171P24SS1hM","title":"[보람씨야] (2부) 15년만에 씨야 완전체 음방투어 브이로그!! [일상 브이로그/VLOG]","channelId":"UCz11CPccQ2AnizJrdp58Bog","channel":"보람씨야","duration":607},{"videoId":"wUBH9MJAO_w","title":"[보람씨야] (1부) 15년만에 씨야 완전체 음방투어 브이로그!! [일상 브이로그/VLOG]","channelId":"UCz11CPccQ2AnizJrdp58Bog","channel":"보람씨야"},{"videoId":"gLoFe4TpFSA","title":"[보람씨야] 갸보람 8년만에 시구하고 왔어요! 🐯⚾️ [일상 브이로그/VLOG]","channelId":"UCz11CPccQ2AnizJrdp58Bog","channel":"보람씨야","duration":549},{"videoId":"g2YE1HfEDv0","title":"RETURN - DK(디셈버) / 이보람 (Lee Boram) [보람씨야]","channelId":"UCz11CPccQ2AnizJrdp58Bog","channel":"보람씨야"},{"videoId":"BizTUTWCwyc","title":"그 집 앞 - 정동하 / 이보람 (Lee Boram) [보람씨야]","channelId":"UCz11CPccQ2AnizJrdp58Bog","channel":"보람씨야","duration":234},{"videoId":"eP4cvTgvRys","title":"당신을 위하여 - 더크로스 김혁건x이보람 / 이보람 (Lee Boram) [보람씨야]","channelId":"UCz11CPccQ2AnizJrdp58Bog","channel":"보람씨야","duration":235},{"videoId":"3puQpiw9Ps4","title":"당신을 위하여 / 더 크로스(The Cross) / 이보람 (Lee Boram) [보람씨야]","channelId":"UCz11CPccQ2AnizJrdp58Bog","channel":"보람씨야","duration":243},{"videoId":"sVRdHDy1i5c","title":"물고기자리 -이안 / 이보람 (Lee Boram) [보람씨야]","channelId":"UCz11CPccQ2AnizJrdp58Bog","channel":"보람씨야"},{"videoId":"3hGcIbMd_Lc","title":"숙녀에게 (원곡 : 변진섭) - 송필근 / 이보람 (Lee Boram) [보람씨야]","channelId":"UCz11CPccQ2AnizJrdp58Bog","channel":"보람씨야","duration":193},{"videoId":"Cq7U0pxRzmg","title":"운명 (풀하우스 OST) - WHY / 이보람 (Lee Boram) [보람씨야]","channelId":"UCz11CPccQ2AnizJrdp58Bog","channel":"보람씨야","duration":253},{"videoId":"SiQa6tzVkUw","title":"너에게 닿기를 - 10CM / 이보람 (Lee Boram) [보람씨야]","channelId":"UCz11CPccQ2AnizJrdp58Bog","channel":"보람씨야","duration":154},{"videoId":"_Vq6xCg4Vro","title":"이럴거면 - 아이비 / 이보람 (Lee Boram) [보람씨야]","channelId":"UCz11CPccQ2AnizJrdp58Bog","channel":"보람씨야","duration":234},{"videoId":"0O9DWnIC9ok","title":"#매일이렇게비가내려 #이보람 #무반주 #lyricvideo","channelId":"UCz11CPccQ2AnizJrdp58Bog","channel":"보람씨야","excludeFromVcr":true},{"videoId":"7VGw30BGkyw","title":"매일 이렇게 비가 내려 -이보람 (IONY의 오선지 : Project #01)","channelId":"UCz11CPccQ2AnizJrdp58Bog","channel":"보람씨야","duration":151},{"videoId":"p7GbnNbMuTE","title":"매일 이렇게 비가 내려 -이보람 (IONY의 오선지 : Project #01) (Liveclip Acoustic ver.)","channelId":"UCz11CPccQ2AnizJrdp58Bog","channel":"보람씨야"},{"videoId":"Pkw7SA5Gdx8","title":"모르시나요 - 다비치 / 이보람 (Lee Boram) [보람씨야]","channelId":"UCz11CPccQ2AnizJrdp58Bog","channel":"보람씨야","duration":307},{"videoId":"ZxHFkXjNZ2A","title":"#모르시나요 #다비치","channelId":"UCz11CPccQ2AnizJrdp58Bog","channel":"보람씨야","duration":60},{"videoId":"LvUdZoTQGJ0","title":"아시나요 - 조성모 / 이보람 (Lee Boram) [보람씨야]","channelId":"UCz11CPccQ2AnizJrdp58Bog","channel":"보람씨야","duration":273},{"videoId":"PVTeDuQW-Ng","title":"Never Ending Story - 아이유(IU) (원곡 : 부활) / 이보람 (Lee Boram) [보람씨야]","channelId":"UCz11CPccQ2AnizJrdp58Bog","channel":"보람씨야","duration":224},{"videoId":"8qxl7p8sDPI","title":"다정히 내 이름을 부르면 - 경서예지, 전건호 / 이보람 (Lee Boram) [보람씨야]","channelId":"UCz11CPccQ2AnizJrdp58Bog","channel":"보람씨야","duration":234},{"videoId":"SS2W1KpMIvc","title":"사랑..그게 뭔데 - 지아 (원곡 : 양파) / 이보람 (Lee Boram) [보람씨야]","channelId":"UCz11CPccQ2AnizJrdp58Bog","channel":"보람씨야","duration":226},{"videoId":"M-97dYACT8U","title":"얼음인형 - 씨야(SeeYa) / 이보람 (Lee Boram) [보람씨야]","channelId":"UCz11CPccQ2AnizJrdp58Bog","channel":"보람씨야","duration":215},{"videoId":"6GRYPTsYKJo","title":"★데뷔 13주년 기념★ 미친 사랑의 노래 - 씨야(SeeYa) / 이보람 (Lee Boram) [보람씨야]","channelId":"UCz11CPccQ2AnizJrdp58Bog","channel":"보람씨야","duration":236},{"videoId":"MR4HGTG0CfQ","title":"구두 - 씨야(SeeYa) / 씨야의 '구두 시리즈' 첫 번째 이야기 / 이보람 (Lee Boram) [보람씨야]","channelId":"UCz11CPccQ2AnizJrdp58Bog","channel":"보람씨야","duration":247},{"videoId":"rcG8XAi3OPA","title":"180도 - 벤(BEN) / 이보람 (Lee Boram) [보람씨야]","channelId":"UCz11CPccQ2AnizJrdp58Bog","channel":"보람씨야"},{"videoId":"hpAheGUSvTk","title":"180도 촬영중 무슨일이??? / 이보람 (Lee Boram) [보람씨야]","channelId":"UCz11CPccQ2AnizJrdp58Bog","channel":"보람씨야","duration":54},{"videoId":"ObSPf7YptQY","title":"[보이는노래방] 처음 그 자리에(풀하우스 OST) / 이보람 (Lee Boram) [보람씨야]","channelId":"UCz11CPccQ2AnizJrdp58Bog","channel":"보람씨야","duration":247},{"videoId":"kRHM1rP4gmk","title":"넘쳐흘러 - 엠씨더맥스 (M.C The Max) / 이보람 (Lee Boram) [보람씨야]","channelId":"UCz11CPccQ2AnizJrdp58Bog","channel":"보람씨야","duration":178},{"videoId":"SpOLbureBk4","title":"★신곡발매기념★ '그때의 나 그때의 너' 녹음실 라이브!! / 이보람 (Lee Boram) [보람씨야]","channelId":"UCz11CPccQ2AnizJrdp58Bog","channel":"보람씨야","excludeFromVcr":true},{"videoId":"Gc1_sEj-IrU","title":"[보이는노래방] 여성시대 - 씨야, 다비치, 티아라 / 이보람 (Lee Boram) [보람씨야]","channelId":"UCz11CPccQ2AnizJrdp58Bog","channel":"보람씨야","duration":218},{"videoId":"CySMA0bphao","title":"[보이는노래방] 사랑의 인사 - 씨야 (SeeYa) / 이보람 (Lee Boram) [보람씨야]","channelId":"UCz11CPccQ2AnizJrdp58Bog","channel":"보람씨야","duration":278},{"videoId":"LuorknUivWc","title":"사계 (Four Seasons) - 태연 (TAEYEON) / 이보람 (Lee Boram) [보람씨야]","channelId":"UCz11CPccQ2AnizJrdp58Bog","channel":"보람씨야","duration":152},{"videoId":"NVA1IdgcuBA","title":"잊어가지마 (Prod. 로코베리) - 윤미래 / 이보람 (Lee boram) [보람씨야]","channelId":"UCz11CPccQ2AnizJrdp58Bog","channel":"보람씨야","duration":134},{"videoId":"i1aFaLwsqvM","title":"사계 (하루살이) - 엠씨더맥스 (M.C The Max) / 이보람 (Lee Boram) [보람씨야]","channelId":"UCz11CPccQ2AnizJrdp58Bog","channel":"보람씨야","duration":166},{"videoId":"51O7VJheD9E","title":"★복면가왕 ver.★ 나를 슬프게 하는 사람들 - 김경호 / 이보람 (Lee Boram) [보람씨야]","channelId":"UCz11CPccQ2AnizJrdp58Bog","channel":"보람씨야","duration":263},{"videoId":"DujKGd4aA60","title":"▶Live clip◀ 이렇게 좋은 날 - 이보람 (Lee Boram) / [보람씨야]","channelId":"UCz11CPccQ2AnizJrdp58Bog","channel":"보람씨야","excludeFromVcr":true},{"videoId":"LQKWuMBJuFQ","title":"[복면가왕] 103, 104, 105대 가왕 나이팅게일 이보람 인사드립니다♥","channelId":"UCz11CPccQ2AnizJrdp58Bog","channel":"보람씨야","duration":248},{"videoId":"H_U4HugKNK8","title":"★신곡★ '흩어지는 중' - 이보람 (Lee Boram) ▷Live clip◁ / [보람씨야]","channelId":"UCz11CPccQ2AnizJrdp58Bog","channel":"보람씨야","excludeFromVcr":true},{"videoId":"T2Vy2QnAxLg","title":"[보이는노래방] ▶LIVE◀ 흩어지는 중 - 이보람 (Lee Boram) / [보람씨야]","channelId":"UCz11CPccQ2AnizJrdp58Bog","channel":"보람씨야","excludeFromVcr":true},{"videoId":"orvzqEviTfQ","title":"그때가 좋았어 - 케이시(Kassy) / 이보람 (Lee Boram) [보람씨야]","channelId":"UCz11CPccQ2AnizJrdp58Bog","channel":"보람씨야","duration":237},{"videoId":"ppe9vyChKLs","title":"[Full ver.] 흩어지는 중 (음원ver.) - 이보람 (Lee Boram) / [보람씨야]","channelId":"UCz11CPccQ2AnizJrdp58Bog","channel":"보람씨야","duration":252},{"videoId":"2iSzvt7hmpA","title":"너에 대한 모든 것 - 로코베리 / 이보람 (Lee Boram) [보람씨야]","channelId":"UCz11CPccQ2AnizJrdp58Bog","channel":"보람씨야","duration":209},{"videoId":"pBCWMCG92ms","title":"지우지 못한 사진들처럼 (Vocal.정미) - 아이오니 / 이보람 (Lee Boram) [보람씨야]","channelId":"UCz11CPccQ2AnizJrdp58Bog","channel":"보람씨야"},{"videoId":"p8T0WjpGr-M","title":"가을밤 떠난 너 - 케이시(Kassy) / 이보람 (Lee Boram) [보람씨야]","channelId":"UCz11CPccQ2AnizJrdp58Bog","channel":"보람씨야"},{"videoId":"kiQF638_yBE","title":"시든 꽃에 물을 주듯 - HYNN(박혜원) / 이보람 (Lee Boram) [보람씨야]","channelId":"UCz11CPccQ2AnizJrdp58Bog","channel":"보람씨야"},{"videoId":"LIkmnZmomGM","title":"'보람하다'  나만의 향수만들기 ♥","channelId":"UCz11CPccQ2AnizJrdp58Bog","channel":"보람씨야","duration":372},{"videoId":"9dJFlFTMlSk","title":"헤어지자는 말은 사랑한다는 말이야 - 베이지(Beige) / 이보람 (Lee Boram) [보람씨야]","channelId":"UCz11CPccQ2AnizJrdp58Bog","channel":"보람씨야","duration":230},{"videoId":"Outw2iebvDs","title":"오늘도 빛나는 너에게 (To You My Light) (Feat. 이라온) - 마크툽(Maktub) / 이보람 (Lee Boram) [보람씨야]","channelId":"UCz11CPccQ2AnizJrdp58Bog","channel":"보람씨야","duration":225},{"videoId":"Qqg4KmkfkV0","title":"늦은 밤 너의 집 앞 골목길에서 - 노을 / 이보람 (Lee Boram) [보람씨야]","channelId":"UCz11CPccQ2AnizJrdp58Bog","channel":"보람씨야","duration":216},{"videoId":"-QWumNvRJdM","title":"Into the Unknown 'Frozen 2 (겨울왕국 2 OST)' - Idina Menzel, Aurora / 이보람 (Lee Boram) [보람씨야]","channelId":"UCz11CPccQ2AnizJrdp58Bog","channel":"보람씨야","duration":194},{"videoId":"UEsPL6tqCp4","title":"하얀 크리스마스 - 이보람 (Lee Boram) / [보람씨야]","channelId":"UCz11CPccQ2AnizJrdp58Bog","channel":"보람씨야","duration":124},{"videoId":"sIkd5n4Nppw","title":"여인의 향기 - 씨야 (SeeYa) / 이보람 (Lee Boram) [보람씨야]","channelId":"UCz11CPccQ2AnizJrdp58Bog","channel":"보람씨야","duration":226},{"videoId":"WeMuc0cFk0I","title":"미워요 - 씨야 (SeeYa) / 이보람 (Lee Boram) [보람씨야]","channelId":"UCz11CPccQ2AnizJrdp58Bog","channel":"보람씨야","duration":254},{"videoId":"B77V1wfmhqw","title":"결혼할까요 - 씨야 (SeeYa) / 이보람 (Lee Boram) [보람씨야]","channelId":"UCz11CPccQ2AnizJrdp58Bog","channel":"보람씨야","duration":203},{"videoId":"pmhgDj1J3UQ","title":"실버버튼 언박싱이 왔습니다! 감동의 개봉식✨[보람씨야]","channelId":"UCz11CPccQ2AnizJrdp58Bog","channel":"보람씨야","duration":374},{"videoId":"fU0TvPPWxBk","title":"방구석 콘서트 같은 '발코니 콘서트'  봄 커버송 메들리 [아로하 / 흔들리는 꽃들속에서  네 샴푸향이 느껴진거야 / 봄 사랑 벚꽃말고 / 러브블러썸 / 봄이 좋냐 / 우연히 봄]","channelId":"UCz11CPccQ2AnizJrdp58Bog","channel":"보람씨야","duration":164},{"videoId":"Ne5glv53Rn8","title":"실버버튼 기념 '보람씨야' Q&A '이것이 궁금해 보람' ?!","channelId":"UCz11CPccQ2AnizJrdp58Bog","channel":"보람씨야","duration":718},{"videoId":"1fjX0ibzUlE","title":"데뷔 15년 만에 인이어 이어폰이 생겼습니다~~ '나만의 커스텀 인이어' [보람씨야]","channelId":"UCz11CPccQ2AnizJrdp58Bog","channel":"보람씨야","duration":437},{"videoId":"1aajfv0l_z8","title":"복면가왕 나이팅게일 1주년 기념~! 3라운드 미공개곡 공개! '양파 - A'ddio' [보람씨야]","channelId":"UCz11CPccQ2AnizJrdp58Bog","channel":"보람씨야","duration":216},{"videoId":"JwvWLf-iYDo","title":"뷰티데이/ 메이크업 받기, 머리 붙이기, 뿌염하기, 그리고 저녁메뉴는???!! [보람씨야]","channelId":"UCz11CPccQ2AnizJrdp58Bog","channel":"보람씨야","duration":642},{"videoId":"gaoZ40kWZo4","title":"Lonely Night - 부활 / 슬기로운 의사생활 OST 원곡 ver. [보람씨야]","channelId":"UCz11CPccQ2AnizJrdp58Bog","channel":"보람씨야","duration":196},{"videoId":"sjgD4-10HpM","title":"Memories- Maroon 5 / 이보람 (Lee Boram) [보람씨야]","channelId":"UCz11CPccQ2AnizJrdp58Bog","channel":"보람씨야"},{"videoId":"N5YSV7xejoI","title":"복면가왕 역대 최다득표곡!! 나이팅게일 ver. '그 여자 - 백지영 '/ 이보람 (Lee Boram) [보람씨야]","channelId":"UCz11CPccQ2AnizJrdp58Bog","channel":"보람씨야","duration":277},{"videoId":"h5j9eoeP-ss","title":"갸보람의 야구 사랑 ♥ 보물상자 공개!! (Feat. 남행열차)","channelId":"UCz11CPccQ2AnizJrdp58Bog","channel":"보람씨야","duration":420},{"videoId":"cDN_odyS1Gk","title":"Part of your world - The Little Mermaid (인어공주 ost) / 이보람 (Lee Boram) [보람씨야]","channelId":"UCz11CPccQ2AnizJrdp58Bog","channel":"보람씨야","duration":176},{"videoId":"yQdFh57QgX4","title":"잠시만 안녕 - M.C the MAX (복면가왕 나이팅게일 ver.) / 이보람 (Lee Boram) [보람씨야]","channelId":"UCz11CPccQ2AnizJrdp58Bog","channel":"보람씨야"},{"videoId":"G6Afw4ni6tQ","title":"헬곡!!! My Way (돈꽃 OST) - 이수 (M.C the MAX) / 이보람 (Lee Boram) [보람씨야]","channelId":"UCz11CPccQ2AnizJrdp58Bog","channel":"보람씨야","duration":251},{"videoId":"K_GGhmCnVRc","title":"하늘 끝에서 흘린 눈물 - 주니퍼 / 이보람 (Lee boram) [보람씨야]","channelId":"UCz11CPccQ2AnizJrdp58Bog","channel":"보람씨야","duration":238},{"videoId":"Gd-ES77t1eQ","title":"3 Days 클렌즈주스 디톡스 리얼 후기!! (다이어트 포기할 뻔 ?!) [보람씨야]","channelId":"UCz11CPccQ2AnizJrdp58Bog","channel":"보람씨야","duration":489},{"videoId":"w4DHifb4nCE","title":"9년 만에 부르는!! 내겐 너무 멋진 그대 - 씨야 (SeeYa) / 이보람 (Lee Boram) [보람씨야]","channelId":"UCz11CPccQ2AnizJrdp58Bog","channel":"보람씨야","duration":227},{"videoId":"hcaCPLuKsFg","title":"바람기억 - 나얼 / 이보람 (Lee Boram) [보람씨야]","channelId":"UCz11CPccQ2AnizJrdp58Bog","channel":"보람씨야","duration":295},{"videoId":"CfBcdJovUj0","title":"컴알못의 컴퓨터 조립 도전!! 1탄! (부품설명편) / 이보람 (Lee Boram) [보람씨야]","channelId":"UCz11CPccQ2AnizJrdp58Bog","channel":"보람씨야","duration":422},{"videoId":"NbXCoYTC1Lk","title":"현명한 선택 - 소찬휘 (복면가왕 나이팅게일 ver.) / 이보람 (Lee Boram) [보람씨야]","channelId":"UCz11CPccQ2AnizJrdp58Bog","channel":"보람씨야","duration":198},{"videoId":"oQ7HR-3SNYk","title":"컴알못의 컴퓨터 조립 도전!! 2탄! (조립편) / 이보람 (Lee Boram) [보람씨야]","channelId":"UCz11CPccQ2AnizJrdp58Bog","channel":"보람씨야"},{"videoId":"IS8Rdor6suU","title":"여름 노래 메들리 [여름 안에서/아틀란티스 소녀/SHAKE IT/그 여름을 틀어줘/여행/비행기] / 이보람 (Lee Boram) [보람씨야]","channelId":"UCz11CPccQ2AnizJrdp58Bog","channel":"보람씨야","duration":142},{"videoId":"ZTE1Oq8Z_04","title":"오랜만에 연예인보람! 복면가왕 다녀왔어요~! [보람씨야]","channelId":"UCz11CPccQ2AnizJrdp58Bog","channel":"보람씨야","duration":267},{"videoId":"qagiSVG5MyE","title":"연 - 이영현 (빅마마) (복면가왕 나이팅게일 ver.) / 이보람(Lee Boram) [보람씨야]","channelId":"UCz11CPccQ2AnizJrdp58Bog","channel":"보람씨야"},{"videoId":"BtNY_6QXXvk","title":"Dynamite - 방탄소년단 (BTS) / 이보람 (Lee Boram) [보람씨야]","channelId":"UCz11CPccQ2AnizJrdp58Bog","channel":"보람씨야","duration":202},{"videoId":"LrkSXt9YhPg","title":"야생화 - 박효신 / 이보람 (Lee Boram) [보람씨야]","channelId":"UCz11CPccQ2AnizJrdp58Bog","channel":"보람씨야","duration":312},{"videoId":"tBkXPEddWD4","title":"이 노래 아시는 분!!🙋🏼‍♀️ '입모양 - 이승기' / 이보람 (Lee Boram) [보람씨야]","channelId":"UCz11CPccQ2AnizJrdp58Bog","channel":"보람씨야"},{"videoId":"wD3H4dR706k","title":"흔들리는 꽃들 속에서 네 샴푸향이 느껴진거야 - 장범준 / 이보람 (Lee Boram) [보람씨야]","channelId":"UCz11CPccQ2AnizJrdp58Bog","channel":"보람씨야"},{"videoId":"YjIJ28LSyUw","title":"'음색여신' 펀치의 신곡♥ 너의 목소리 - 펀치 (Punch) / 이보람 (Lee Boram) [보람씨야]","channelId":"UCz11CPccQ2AnizJrdp58Bog","channel":"보람씨야","duration":197},{"videoId":"erD8CrzmE60","title":"오래된 노래 - 스탠딩 에그 (Standing Egg) / 이보람 (Lee Boram) [보람씨야]","channelId":"UCz11CPccQ2AnizJrdp58Bog","channel":"보람씨야"},{"videoId":"Tn6VPGgZqcU","title":"반려견 사랑이와 함께한 화보 촬영 현장 🐶💕 견생샷 찍고 왔어요📸","channelId":"UCz11CPccQ2AnizJrdp58Bog","channel":"보람씨야","duration":451},{"videoId":"viCpi-KTXbU","title":"힘든 건 사랑이 아니다 - 임창정 / 이보람 (Lee Boram) [보람씨야]","channelId":"UCz11CPccQ2AnizJrdp58Bog","channel":"보람씨야"},{"videoId":"t-btii-76E0","title":"행복하니 - 케이시(Kassy) / 이보람 (Lee Boram) [보람씨야]","channelId":"UCz11CPccQ2AnizJrdp58Bog","channel":"보람씨야"},{"videoId":"S26yKHgCpLQ","title":"어디에도 - 엠씨더맥스 (M.C the MAX) / 이보람 (Lee Boram) [보람씨야]","channelId":"UCz11CPccQ2AnizJrdp58Bog","channel":"보람씨야","duration":332},{"videoId":"XP0NRwP4LyU","title":"형 (兄) - 노라조 / 이보람 (Lee Boram) [보람씨야]","channelId":"UCz11CPccQ2AnizJrdp58Bog","channel":"보람씨야","duration":251},{"videoId":"nLpIgkzAa1A","title":"눈의 꽃 - 박효신 / 이보람 (Lee Boram) [보람씨야]","channelId":"UCz11CPccQ2AnizJrdp58Bog","channel":"보람씨야","duration":321},{"videoId":"6ZjBUuEIKds","title":"술 한잔 해요 - 지아 / 이보람 (Lee Boram) [보람씨야]","channelId":"UCz11CPccQ2AnizJrdp58Bog","channel":"보람씨야","duration":210},{"videoId":"A7x52bJ6nRQ","title":"상사화 - 안예은 / 이보람 (Lee Boram) [보람씨야]","channelId":"UCz11CPccQ2AnizJrdp58Bog","channel":"보람씨야","duration":327},{"videoId":"GAjn-2-qUDg","title":"희재 - 성시경 / 이보람 (Lee Boram) [보람씨야]","channelId":"UCz11CPccQ2AnizJrdp58Bog","channel":"보람씨야","duration":226},{"videoId":"wKsaKuZebsM","title":"Celebrity - 아이유(IU) / 이보람 (Lee Boram) [보람씨야]","channelId":"UCz11CPccQ2AnizJrdp58Bog","channel":"보람씨야"},{"videoId":"8EzsOCUpAIw","title":"Don't cry - 더 크로스 (The Cross) / 이보람 (Lee Boram) [보람씨야]","channelId":"UCz11CPccQ2AnizJrdp58Bog","channel":"보람씨야","duration":207},{"videoId":"i2pxhIgWj8s","title":"VLOG ｜ 생애 첫 셀프세차! 제 차가 생겼어요 ♥","channelId":"UCz11CPccQ2AnizJrdp58Bog","channel":"보람씨야","duration":460},{"videoId":"CDTK_FEPsKs","title":"밤하늘의 별을 (2020) - 경서 / 이보람 (Lee Boram) [보람씨야]","channelId":"UCz11CPccQ2AnizJrdp58Bog","channel":"보람씨야","duration":218},{"videoId":"q6YQAvSIo84","title":"VLOG ｜ 💐데뷔 15주년, 보람씨야 2주년 기념! ❤","channelId":"UCz11CPccQ2AnizJrdp58Bog","channel":"보람씨야"},{"videoId":"PvqSbY1VfNU","title":"롤린 (Rollin') - 브레이브걸스(Brave Girls) / 이보람 (Lee Boram) [보람씨야]","channelId":"UCz11CPccQ2AnizJrdp58Bog","channel":"보람씨야","duration":203},{"videoId":"pD7suketqvE","title":"내 손을 잡아 - 아이유(IU) / 이보람 (Lee Boram) [보람씨야]","channelId":"UCz11CPccQ2AnizJrdp58Bog","channel":"보람씨야"},{"videoId":"ib6T90JptX8","title":"VLOG ｜ 카레 만들어 먹기🍛, 호텔식 수건 접기, 소창행주 삶기","channelId":"UCz11CPccQ2AnizJrdp58Bog","channel":"보람씨야","duration":550},{"videoId":"NH0uUxO0MCw","title":"오르막길 - 정인, 윤종신 / 이보람 (Lee Boram) [보람씨야]","channelId":"UCz11CPccQ2AnizJrdp58Bog","channel":"보람씨야","duration":281},{"videoId":"d4F7IvAx1qA","title":"행복한 나를 - 에코 / 이보람 (Lee Boram) [보람씨야]","channelId":"UCz11CPccQ2AnizJrdp58Bog","channel":"보람씨야","duration":243},{"videoId":"erONHczFnGA","title":"삭제 - 이승기 / 이보람 (Lee Boram) [보람씨야]","channelId":"UCz11CPccQ2AnizJrdp58Bog","channel":"보람씨야","duration":236},{"videoId":"CHwqt8Ngu0c","title":"묘해, 너와 - 어쿠스틱 콜라보 (연애의 발견 ost) / 이보람 (Lee Boram) [보람씨야]","channelId":"UCz11CPccQ2AnizJrdp58Bog","channel":"보람씨야","duration":224},{"videoId":"JqlXCrcSJ80","title":"만약에 - 태연 (쾌도 홍길동 ost) / 이보람 (Lee Boram) [보람씨야]","channelId":"UCz11CPccQ2AnizJrdp58Bog","channel":"보람씨야","duration":251},{"videoId":"gcd9t0ZFVcI","title":"끝사랑 - 김범수  / 이보람 (Lee Boram) [보람씨야]","channelId":"UCz11CPccQ2AnizJrdp58Bog","channel":"보람씨야"},{"videoId":"TtXJpgG8bzY","title":"좋니 - 윤종신 / 이보람 (Lee Boram) [보람씨야]","channelId":"UCz11CPccQ2AnizJrdp58Bog","channel":"보람씨야","duration":310},{"videoId":"K9bkqIrGJuY","title":"해바라기도 가끔 목이 아프죠 - 엠씨더맥스 (M.C the MAX) / 이보람 (Lee Boram) [보람씨야]","channelId":"UCz11CPccQ2AnizJrdp58Bog","channel":"보람씨야","duration":269},{"videoId":"6i4gBYneDic","title":"술 노래 메들리 (술이야/소주 한 잔/밤이 되니까/술 한 잔 해요/취중진담) / 이보람 (Lee Boram) [보람씨야]","channelId":"UCz11CPccQ2AnizJrdp58Bog","channel":"보람씨야","duration":193},{"videoId":"EW5WaO64Wa4","title":"바라만 본다 - MSG워너비(M.O.M) / 이보람 (Lee Boram) [보람씨야]","channelId":"UCz11CPccQ2AnizJrdp58Bog","channel":"보람씨야","duration":213},{"videoId":"MFGbHLC4cjw","title":"VLOG ｜ 다이어트 시즌 / 프로필촬영📸 / 보상 폭식데이","channelId":"UCz11CPccQ2AnizJrdp58Bog","channel":"보람씨야","duration":481},{"videoId":"_GuO0h0bVCE","title":"소주 한 잔 - 임창정 / 이보람 (Lee Boram) [보람씨야]","channelId":"UCz11CPccQ2AnizJrdp58Bog","channel":"보람씨야","duration":283},{"videoId":"TSd7SW59ZW8","title":"[티저] 드디어 신곡 나와요! ♥ '사랑하니까 - 이보람'","channelId":"UCz11CPccQ2AnizJrdp58Bog","channel":"보람씨야","duration":114},{"videoId":"14p6foEx1Y4","title":"[티저] 가로라이브 '이보람 - 사랑하니까'","channelId":"UCz11CPccQ2AnizJrdp58Bog","channel":"보람씨야","excludeFromVcr":true},{"videoId":"MxQA54orKlE","title":"사랑앓이 - FT아일랜드 (FTISLAND) / 이보람 (Lee Boram) [보람씨야]","channelId":"UCz11CPccQ2AnizJrdp58Bog","channel":"보람씨야","duration":196},{"videoId":"cEC1MYO8SMs","title":"[녹음실 티저] 이보람 - 사랑하니까","channelId":"UCz11CPccQ2AnizJrdp58Bog","channel":"보람씨야","duration":52},{"videoId":"q4jtpVDemFE","title":"[뮤비] 이보람 - 사랑하니까","channelId":"UCz11CPccQ2AnizJrdp58Bog","channel":"보람씨야","duration":223},{"videoId":"BLALkFyMUOk","title":"[풀버전] 가로라이브 '이보람 - 사랑하니까'","channelId":"UCz11CPccQ2AnizJrdp58Bog","channel":"보람씨야","excludeFromVcr":true},{"videoId":"0ANfHmkSyoQ","title":"[세로라이브] '이보람 - 사랑하니까'","channelId":"UCz11CPccQ2AnizJrdp58Bog","channel":"보람씨야","excludeFromVcr":true},{"videoId":"hNBitlLkebo","title":"[녹음실 풀버전] 이보람 - 사랑하니까","channelId":"UCz11CPccQ2AnizJrdp58Bog","channel":"보람씨야","duration":222},{"videoId":"xkpwmaCJ9uI","title":"못해 - 포맨(4MEN) / 이보람 (Lee Boram) [보람씨야]","channelId":"UCz11CPccQ2AnizJrdp58Bog","channel":"보람씨야"},{"videoId":"5C8O5IEBfXw","title":"비가 오는 날엔 - 비스트(Beast) / 이보람 (Lee Boram) [보람씨야]","channelId":"UCz11CPccQ2AnizJrdp58Bog","channel":"보람씨야","duration":182},{"videoId":"bshC6bXVnos","title":"You - 김상민 / 이보람 (Lee Boram) [보람씨야]","channelId":"UCz11CPccQ2AnizJrdp58Bog","channel":"보람씨야","duration":204},{"videoId":"q-USEdXO8xI","title":"시간을 거슬러 (해를 품은 달 OST) - 린(LYn) / 이보람 (Lee Boram) [보람씨야]","channelId":"UCz11CPccQ2AnizJrdp58Bog","channel":"보람씨야"},{"videoId":"akQz5sPv6Yc","title":"칵테일 사랑 - 마로니에 (권인하/신윤미), (로맨스가 필요해 2012 - 옥상달빛 ver.) / 이보람 (Lee Boram) [보람씨야]","channelId":"UCz11CPccQ2AnizJrdp58Bog","channel":"보람씨야","duration":208},{"videoId":"cx1rw5h7Mi8","title":"기다리다 - 윤하 / 이보람 (Lee Boram) [보람씨야]","channelId":"UCz11CPccQ2AnizJrdp58Bog","channel":"보람씨야","duration":260},{"videoId":"R7trKzGtTtU","title":"기억을 걷는 시간 - 넬(NELL) / 이보람 (Lee Boram) [보람씨야]","channelId":"UCz11CPccQ2AnizJrdp58Bog","channel":"보람씨야","duration":294},{"videoId":"Zj7GVXcF7x8","title":"VLOG ｜(스포주의) 손목 걸고 오징어게임??! 달고나 만들기 / 구슬 홀짝 게임","channelId":"UCz11CPccQ2AnizJrdp58Bog","channel":"보람씨야","duration":488},{"videoId":"yhDlGFZyd9k","title":"사랑 안 해 - 백지영 / 이보람 (Lee Boram) [보람씨야]","channelId":"UCz11CPccQ2AnizJrdp58Bog","channel":"보람씨야"},{"videoId":"cb96dqwR6tM","title":"OHAYO MY NIGHT - 디핵(D-Hack), PATEKO(파테코) / 이보람 (Lee Boram) [보람씨야]","channelId":"UCz11CPccQ2AnizJrdp58Bog","channel":"보람씨야","duration":193},{"videoId":"GsJmvkeW44s","title":"널 사랑하지 않아 - 어반자카파 / 이보람 (Lee Boram) [보람씨야]","channelId":"UCz11CPccQ2AnizJrdp58Bog","channel":"보람씨야","duration":251},{"videoId":"ZNm0mB9bKmE","title":"사랑은 늘 도망가 - 임영웅 (신사와 아가씨 OST) (원곡 : 이문세) / 이보람 (Lee Boram) [보람씨야]","channelId":"UCz11CPccQ2AnizJrdp58Bog","channel":"보람씨야","duration":232},{"videoId":"QdSvK75Tx0w","title":"두 사람 - 성시경 / 이보람 (Lee Boram) [보람씨야]","channelId":"UCz11CPccQ2AnizJrdp58Bog","channel":"보람씨야","duration":249},{"videoId":"p_hYS33CUs0","title":"질풍가도 - 유정석 (쾌걸 근육맨 2세 OST) / 이보람 (Lee Boram) [보람씨야]","channelId":"UCz11CPccQ2AnizJrdp58Bog","channel":"보람씨야"},{"videoId":"I2SaTVt-OwQ","title":"응급실 (쾌걸춘향 OST) - izi / 이보람 (Lee Boram) [보람씨야]","channelId":"UCz11CPccQ2AnizJrdp58Bog","channel":"보람씨야","duration":218},{"videoId":"6l72TmYsxig","title":"12월의 기적 (Miracles in December) - EXO / 이보람 (Lee Boram) [보람씨야]","channelId":"UCz11CPccQ2AnizJrdp58Bog","channel":"보람씨야","duration":274},{"videoId":"ipmP7tnhY-Y","title":"Heaven - 김현성 / 이보람 (Lee Boram) [보람씨야]","channelId":"UCz11CPccQ2AnizJrdp58Bog","channel":"보람씨야","duration":273},{"videoId":"uAHkNFE9lmI","title":"12월32일 - 별 / 이보람 (Lee Boram) [보람씨야]","channelId":"UCz11CPccQ2AnizJrdp58Bog","channel":"보람씨야"},{"videoId":"yp3-w2fRjEk","title":"말하는 대로 - 처진 달팽이 (유재석 & 이적) / 이보람 (Lee Boram) [보람씨야]","channelId":"UCz11CPccQ2AnizJrdp58Bog","channel":"보람씨야"},{"videoId":"-_j3UCirOio","title":"첫눈처럼 너에게 가겠다 - 에일리(Ailee) (도깨비 ost) / 이보람 (Lee Boram) [보람씨야]","channelId":"UCz11CPccQ2AnizJrdp58Bog","channel":"보람씨야","duration":230},{"videoId":"-WFvjBB8xqo","title":"가질 수 없는 너 - 뱅크 / 이보람 (Lee Boram) [보람씨야]","channelId":"UCz11CPccQ2AnizJrdp58Bog","channel":"보람씨야","duration":248},{"videoId":"aIlo_-8iWB4","title":"사랑에 빠지고 싶다 - 김조한 / 이보람 (Lee Boram) [보람씨야]","channelId":"UCz11CPccQ2AnizJrdp58Bog","channel":"보람씨야","duration":222},{"videoId":"miB25j6VFA0","title":"tvN즐거움송 커버 콘테스트 함께해요 🎤🎵","channelId":"UCz11CPccQ2AnizJrdp58Bog","channel":"보람씨야","duration":62},{"videoId":"Bup6nyspaxk","title":"너의 모든 순간 - 성시경 (별에서 온 그대 OST) / 이보람 (Lee Boram) [보람씨야]","channelId":"UCz11CPccQ2AnizJrdp58Bog","channel":"보람씨야","duration":233},{"videoId":"NXRd7NRTg8c","title":"호랑수월가 (나와 호랑이님 ost) - 상록수(feat.나래) / 이보람 (Lee Boram) [보람씨야]","channelId":"UCz11CPccQ2AnizJrdp58Bog","channel":"보람씨야","duration":288},{"videoId":"lV_badY3Bi8","title":"덩그러니 - 이수영 / 이보람 (Lee Boram) [보람씨야]","channelId":"UCz11CPccQ2AnizJrdp58Bog","channel":"보람씨야","duration":240},{"videoId":"agdpOKt8EBA","title":"That That (prod. ＆ feat. SUGA of BTS) - 싸이 (PSY) / 이보람 (Lee Boram) [보람씨야]","channelId":"UCz11CPccQ2AnizJrdp58Bog","channel":"보람씨야","duration":28},{"videoId":"tg2IuFVhUps","title":"어마어마해 - WSG워너비 / 이보람 (Lee Boram) [보람씨야]","channelId":"UCz11CPccQ2AnizJrdp58Bog","channel":"보람씨야"},{"videoId":"g7nYVmFX23Q","title":"한 밤의 꿈처럼 - 이보람 / 방구석 라이브🫶🏻❤️","channelId":"UCz11CPccQ2AnizJrdp58Bog","channel":"보람씨야","excludeFromVcr":true},{"videoId":"P8o3Ss-xPAQ","title":"애교 폭발 길냥이 고양이 냥줍! 이게 바로 간택이란 건가...? [일상 브이로그/VLOG]","channelId":"UCz11CPccQ2AnizJrdp58Bog","channel":"보람씨야","duration":702},{"videoId":"5auNDhYBVI4","title":"그때 그 순간 그대로 (그그그) - WSG워너비(가야G) / 이보람 (Lee Boram) [보람씨야]","channelId":"UCz11CPccQ2AnizJrdp58Bog","channel":"보람씨야","duration":222},{"videoId":"HslC4f6pQWA","title":"냥줍 길냥이! 너의 이름은? 집사 첫 번째 과제! 캣타워 조립하기 [일상 브이로그/VLOG]","channelId":"UCz11CPccQ2AnizJrdp58Bog","channel":"보람씨야","duration":661},{"videoId":"2ShLQvkT9QI","title":"우리 구독자 애칭 정해요😍❤️","channelId":"UCz11CPccQ2AnizJrdp58Bog","channel":"보람씨야","duration":38},{"videoId":"EdjxuH4Z5aY","title":"돈가스 맛집 '정돈'｜백화점에서 블러셔, 안경 구매｜친구들과 수다, 커피 [일상 브이로그/VLOG]","channelId":"UCz11CPccQ2AnizJrdp58Bog","channel":"보람씨야","duration":479},{"videoId":"IgQe-vV6Ivo","title":"가슴으로 낳아 지갑으로 모신다 🙇🏻‍♀️ 펫박람회, 두끼 떡볶이, 분식데이! [일상 브이로그/VLOG]","channelId":"UCz11CPccQ2AnizJrdp58Bog","channel":"보람씨야","duration":810},{"videoId":"Hn5KtY2Dlns","title":"따끈한 청국장 만들어 먹기 ! 스투키캣vs로마샌드 모래 테스트, 아우어 베이커리, 식세기 강추!!! [일상 브이로그/VLOG]","channelId":"UCz11CPccQ2AnizJrdp58Bog","channel":"보람씨야","duration":1045},{"videoId":"SwlPn9ZqMVw","title":"십 년 만에 새 안경, 전설의 핫도그, 애슐리 퀸즈 다녀왔어요! 지비츠 추천! 크록스 꾸미기 [일상 브이로그/VLOG]","channelId":"UCz11CPccQ2AnizJrdp58Bog","channel":"보람씨야","duration":742},{"videoId":"KPSR-eFXSgE","title":"먹고 또 먹고 먹기만 하는 크리스마스 연휴 🎄｜백화점 푸드코트｜백미당｜굴찜｜창문해먹설치｜팥칼국수｜조개롱 [일상 브이로그/VLOG]","channelId":"UCz11CPccQ2AnizJrdp58Bog","channel":"보람씨야","duration":1087},{"videoId":"P-wM7YnPb24","title":"먹고 또 먹고! 오늘도 먹는 브이로그🍜 순두부열라면, 에그샌드위치, 크로플, 구구크러스터, 수제간식 만들기 [일상 브이로그/VLOG]","channelId":"UCz11CPccQ2AnizJrdp58Bog","channel":"보람씨야","duration":857},{"videoId":"EWxFYLtGRXc","title":"잡채만들기, 온센텐동, 모래 전체갈이 [일상 브이로그/VLOG]","channelId":"UCz11CPccQ2AnizJrdp58Bog","channel":"보람씨야","duration":604},{"videoId":"Dx8G_cQ0Ym8","title":"집사 맴찢 ㅠ 동물병원 방문｜마켓컬리 추천템!! 🍤🍝 [일상 브이로그/VLOG]","channelId":"UCz11CPccQ2AnizJrdp58Bog","channel":"보람씨야","duration":606},{"videoId":"DEEQmmrQLgs","title":"[보람씨야X수페] 촬영현장, 압구정 하루, 카레돈가스, 카페 수다, 이보람의 숲킨케어?! 나이트루틴","channelId":"UCz11CPccQ2AnizJrdp58Bog","channel":"보람씨야","duration":1047},{"videoId":"uZ15Br_Zrvo","title":"생일주간 브이로그🥳🎂 선물 언박싱 🎁｜애플워치SE 44mm｜커스텀에어팟｜브레오 눈마사지기｜브리츠 블루투스 스피커｜후원증서,고기,화장품,족욕기｜밀리 자동급식기😻","channelId":"UCz11CPccQ2AnizJrdp58Bog","channel":"보람씨야","duration":888},{"videoId":"IHGTxWrJRag","title":"'그그그' 커버 녹음하던 날🎙｜거제 행사 가던 날 🎤 VLOG","channelId":"UCz11CPccQ2AnizJrdp58Bog","channel":"보람씨야","duration":318},{"videoId":"MrpO55KORTE","title":"오랜만에 보컬쌤으로 보낸 하루 ㅣ 셀프메이크업 ㅣ 노래 잘 부르는 꿀팁전수 ㅣ카페투어 ㅣ마무리는 고기🥩🍖[일상 브이로그/VLOG]","channelId":"UCz11CPccQ2AnizJrdp58Bog","channel":"보람씨야","duration":766},{"videoId":"u8qQCBsd-QA","title":"사건의 지평선 - 윤하 / 이보람 (Lee Boram) [보람씨야]","channelId":"UCz11CPccQ2AnizJrdp58Bog","channel":"보람씨야"},{"videoId":"NXvCPVKKwEI","title":"Blue Moon - 씨야, 다비치, 블랙펄 / 이보람 (Lee Boram) [보람씨야]","channelId":"UCz11CPccQ2AnizJrdp58Bog","channel":"보람씨야","duration":189},{"videoId":"o7iYsuxWLz0","title":"[VLOG] 막방 가야G ..","channelId":"UCz11CPccQ2AnizJrdp58Bog","channel":"보람씨야"},{"videoId":"tE0DpENLHn4","title":"결국엔 너에게 닿아서 - WSG워너비(가야G) / 이보람 (Lee Boram) [보람씨야]","channelId":"UCz11CPccQ2AnizJrdp58Bog","channel":"보람씨야"},{"videoId":"Qn69Fv_2z24","title":"늦은후회 - 보보 / 이보람 (Lee Boram) [보람씨야]","channelId":"UCz11CPccQ2AnizJrdp58Bog","channel":"보람씨야","duration":281},{"videoId":"bm83_9NjE9Q","title":"[Medley] 가족을 위한 노래 (가족사진/걱정말아요 그대/꽃길/엄마/아버지/하늘바라기) / 이보람 (Lee Boram) [보람씨야]","channelId":"UCz11CPccQ2AnizJrdp58Bog","channel":"보람씨야","duration":317},{"videoId":"GvjvBSwl7Pk","title":"5월의 일상 모음.zip  (일하고🎤먹고🥐놀고🐶힐링하고🌿) [일상 브이로그/VLOG]","channelId":"UCz11CPccQ2AnizJrdp58Bog","channel":"보람씨야","duration":818},{"videoId":"Hw4zJ634t4s","title":"놀고 먹는 갓벽한 편의점 세일 제품 먹방편 🍽️ [일상 브이로그/VLOG]","channelId":"UCz11CPccQ2AnizJrdp58Bog","channel":"보람씨야","duration":752},{"videoId":"dJ3oh792Gkk","title":"[무반주메들리] 밤/혼자가아닌나/사랑이야/찰나가영원이될때/열애중/I AM / 이보람 (Lee Boram) [보람씨야]","channelId":"UCz11CPccQ2AnizJrdp58Bog","channel":"보람씨야","excludeFromVcr":true},{"videoId":"LSecsdCJH6k","title":"[Medley] 비 노래 메들리 (빗속에서/비/장마/rain drop/rain/비도오고그래서) / 이보람 (Lee Boram) [보람씨야]","channelId":"UCz11CPccQ2AnizJrdp58Bog","channel":"보람씨야","duration":227},{"videoId":"uLMExuJ2DkQ","title":"헤어지자 말해요 - 박재정 / 이보람 (Lee Boram) [보람씨야]","channelId":"UCz11CPccQ2AnizJrdp58Bog","channel":"보람씨야"},{"videoId":"Zc1xppiQJk0","title":"[무반주메들리] 어른/기댈곳/사랑의바보/그대를알고/해바라기/중독된사랑 / 이보람 (Lee Boram) [보람씨야]","channelId":"UCz11CPccQ2AnizJrdp58Bog","channel":"보람씨야","excludeFromVcr":true},{"videoId":"H9fSg8R9YWY","title":"심(心) - DK(디셈버) / 이보람 (Lee Boram) [보람씨야]","channelId":"UCz11CPccQ2AnizJrdp58Bog","channel":"보람씨야","duration":249},{"videoId":"3xqcLnd2ZvM","title":"돌아와줘요 - 주주시크릿 / 이보람 (Lee Boram) [보람씨야]","channelId":"UCz11CPccQ2AnizJrdp58Bog","channel":"보람씨야","duration":201},{"videoId":"qH-VA8u8BVY","title":"나트랑 브이로그 🥭🌿🪂🔥 주로 먹고 노는 여행🍽️ [일상 브이로그/VLOG]","channelId":"UCz11CPccQ2AnizJrdp58Bog","channel":"보람씨야","duration":767},{"videoId":"3U55-CJIfOE","title":"모래알갱이 - 임영웅 / 이보람 (Lee Boram) [보람씨야]","channelId":"UCz11CPccQ2AnizJrdp58Bog","channel":"보람씨야","duration":222},{"videoId":"SlzpUt53NoU","title":"사랑시 고백구 행복동 - 최수호 / 이보람 (Lee Boram) [보람씨야]","channelId":"UCz11CPccQ2AnizJrdp58Bog","channel":"보람씨야","duration":239},{"videoId":"Fr_7Lo_u8mI","title":"속는 셈 치고 다시 만나자 - 케이시(Kassy) / 이보람 (Lee Boram) [보람씨야]","channelId":"UCz11CPccQ2AnizJrdp58Bog","channel":"보람씨야","duration":192},{"videoId":"if9HWsWUsDY","title":"천상연 - 이창섭 (웹툰 '선녀외전' X 이창섭 (LEE CHANGSUB)) / 이보람 (Lee Boram) [보람씨야]","channelId":"UCz11CPccQ2AnizJrdp58Bog","channel":"보람씨야","duration":271},{"videoId":"Hlj0ItkkP4A","title":"Love wins all - 아이유 (IU) / 이보람 (Lee Boram) [보람씨야]","channelId":"UCz11CPccQ2AnizJrdp58Bog","channel":"보람씨야","duration":257},{"videoId":"yC9B9CHDtyA","title":"태연 - 꿈 / 이보람 (Lee Boram) [보람씨야]","channelId":"UCz11CPccQ2AnizJrdp58Bog","channel":"보람씨야"},{"videoId":"bfPnBgdlkbE","title":"소나기 - 이클립스(ECLIPSE) / 이보람 (Lee Boram) [보람씨야]","channelId":"UCz11CPccQ2AnizJrdp58Bog","channel":"보람씨야","duration":228},{"videoId":"-z0OzrD2lTw","title":"미인 - 이기찬 / 이보람 (Lee Boram) [보람씨야]","channelId":"UCz11CPccQ2AnizJrdp58Bog","channel":"보람씨야","duration":208},{"videoId":"3rkxlYWemP4","title":"영원 (남은 인생 10년 X DK(디셈버)) - 원곡 : 최진영 (SKY) / 이보람 (Lee Boram) [보람씨야]","channelId":"UCz11CPccQ2AnizJrdp58Bog","channel":"보람씨야","duration":224},{"videoId":"_ghnqdvLHVc","title":"HAPPY - DAY6(데이식스) / 이보람 (Lee Boram) [보람씨야]","channelId":"UCz11CPccQ2AnizJrdp58Bog","channel":"보람씨야","duration":187},{"videoId":"807qH9sWxa0","title":"‘어떻게 이별까지 사랑하겠어, 널 사랑하는 거지’ 첫 번째 미리보기  #어떻게이별까지사랑하겠어 #akmu #cover","channelId":"UCz11CPccQ2AnizJrdp58Bog","channel":"보람씨야","duration":60},{"videoId":"DEdF_b1bpsw","title":"어떻게 이별까지 사랑하겠어, 널 사랑하는 거지 - AKMU(악뮤) / 이보람 (Lee Boram) [보람씨야]","channelId":"UCz11CPccQ2AnizJrdp58Bog","channel":"보람씨야","duration":290},{"videoId":"9l4XXP5Tlhk","title":"나는 반딧불 - 황가람 / 이보람 (Lee Boram) [보람씨야]","channelId":"UCz11CPccQ2AnizJrdp58Bog","channel":"보람씨야","duration":206}]};
}
};const cache={};function __require(id){if(cache[id])return cache[id].exports;const m=cache[id]={exports:{}};modules[id](m,m.exports,__require);return m.exports;}__require("src/client/passport.js");})();
