(function(){'use strict';const modules={
"src/client/passport.js":function(module,exports,__require){
'use strict';
const Brand=__require("src/data/passport-brand.json");
const P=__require("src/shared/passport.js"),G=__require("src/shared/passport-goods.js");
const attachPicker=__require("src/client/passport-picker.js"),Play=__require("src/shared/passport-play.js"),PlayUI=__require("src/client/play-passport.js"),Cal=__require("src/shared/passport-calendar.js");
const X=__require("src/shared/passport-extra.js"),Share=__require("src/client/passport-share.js"),Maker=__require("src/client/passport-maker.js");
const app=document.getElementById('passportApp'),status=document.getElementById('ppStatus');
const catalog=JSON.parse(document.getElementById('passportCatalog').textContent),E=P.esc;
let makerCleanup=null;
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
function detail(id){const e=state.entries.find(e=>e.entryId===id);if(!e){app.innerHTML=linkBack()+'<p>기록을 찾지 못했어요. 백업 파일에서 복원할 수 있습니다.</p>';return;}const place=catalog.places.find(p=>p.id===e.placeId),event=catalog.events.find(x=>x.id===e.eventId);app.innerHTML=linkBack()+`<div class="pp-detail"><div>${ticket(e)}<div class="pp-actions" style="margin-top:18px"><a href="/diary/#make=${E(id)}">이미지로 만들기</a><a href="/diary/#share">QR로 공유</a><a href="/diary/#edit=${E(id)}">수정</a></div><p class="pp-help">공유 이미지에는 결제금액·구매처·메모·동행인이 포함되지 않아요. 좌석은 이미지 만들기에서 직접 선택할 때만 포함합니다.</p></div><section class="pp-panel"><h2>${e.kind==='goods'?'나의 구매 기록':'그날의 기억'}</h2>${goodsDetail(e)}${e.kind==='play'?'<p>'+E(Play.summary(e.play))+'</p><p class="pp-help">'+(e.play?.source==='result'?'게임 완료 결과에서 저장한 기록':'직접 남긴 플레이 기록')+'</p><a href="/game/">씨야 플레이로 이동 →</a>':''}<dl><dt>상태</dt><dd>${kindState(e)}${e.status==='planned'?`<button data-complete="${E(e.entryId)}" ${e.date&&e.date>P.today().slice(0,e.date.length)?'disabled title="예정 날짜가 지난 뒤 완료로 바꿀 수 있어요"':''}>${e.kind==='goods'?'구매했어요':e.kind==='play'?'플레이 완료':e.kind==='story'?'기록 완료':'다녀왔어요'}</button>`:''}</dd><dt>${e.kind==='play'?'플레이 날짜':e.kind==='goods'?(e.status==='planned'?'구매 예정일':'구매일'):'날짜'}</dt><dd>${P.dateLabel(e.date)}</dd>${e.kind==='goods'?'':`<dt>함께</dt><dd>${E(e.companions||'기록하지 않았어요')}</dd>`}<dt>정보 기준</dt><dd>${e.kind==='play'?'씨야 플레이 기록':e.eventId?'일정에서 시작한 기록':e.placeId?'지도에서 시작한 기록':'직접 입력'}</dd></dl>${detailExtras(e)}<p class="pp-note">${E(e.note||'아직 메모가 없어요.')}</p><div class="pp-actions">${place?`<a href="/map/?place=${encodeURIComponent(place.id)}">지도에서 보기</a>`:''}${event?.calendar?`<a href="/calendar/?month=${(e.date||event.date).slice(0,7)}&day=${encodeURIComponent(e.date||event.date)}&event=${encodeURIComponent(event.id)}">연결된 일정</a>`:''}${e.archiveId&&catalog.events.some(x=>x.archiveId===e.archiveId)?`<a href="/archive/?record=${encodeURIComponent(e.archiveId)}">아카이브 기록</a>`:''}</div>${(e.eventId&&!event||e.placeId&&!place)?'<p class="pp-help">공개 정보의 연결이 사라졌지만 작성 당시 내용은 수첩에 남아 있어요.</p>':''}<div class="pp-danger"><button data-action="show-delete">이 기록 삭제</button><div id="ppDelete" class="pp-confirm" hidden><p>삭제 후에는 백업 파일이 있어야 복원할 수 있어요.</p><button data-delete="${E(id)}">이 기록을 삭제합니다</button></div></div></section></div><div id="ppExportResult"></div>`;}
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
function settings(){let last='';try{last=localStorage.getItem('seeya-passport-backup-date')||'';}catch{}app.innerHTML=linkBack()+`<div class="pp-settings"><div id="ppPlayPreference"></div><section class="pp-panel"><h2>기록을 안전하게 가져가기</h2><p>현재 이 브라우저에 ${state.entries.length}개의 기록이 있어요. 다른 기기에서는 아래 백업 파일을 가져와 이어 쓸 수 있습니다.</p><button data-action="backup" class="pp-primary">백업 파일 내려받기</button><p class="pp-help">마지막 백업 요청: ${E(last||'아직 없어요')}<br>다운로드 후 파일이 실제로 저장됐는지 확인해 주세요.</p><a href="/about/install/">홈 화면에 추가하는 방법 →</a></section><section class="pp-panel"><h2>백업 가져오기</h2><p>내용을 먼저 확인한 다음 적용합니다. 잘못된 파일은 기존 기록을 바꾸지 않습니다.</p><input id="ppImport" type="file" accept="application/json,.json" aria-label="백업 JSON 파일 선택"><div id="ppImportPreview"></div></section><section class="pp-panel pp-danger"><h2>이 브라우저의 수첩 비우기</h2><p>신분 카드와 모든 개인 기록을 삭제합니다. 먼저 백업을 내려받아 주세요.</p><label class="pp-field"><span>계속하려면 ‘삭제’를 입력하세요.</span><input id="ppDeleteAllText" autocomplete="off"></label><button data-action="delete-all">전체 삭제</button></section></div>`;PlayUI.mount(document.getElementById('ppPlayPreference'));document.getElementById('ppImport').addEventListener('change',async ev=>{pendingImport=null;const preview=document.getElementById('ppImportPreview');preview.textContent='';const file=ev.target.files[0];if(!file)return;try{if(file.size>8*1024*1024)throw Error('8MB 이하의 백업 파일을 선택해 주세요.');const value=P.validate(JSON.parse(await file.text()));if(!preview.isConnected)return;const r=P.review(state,value);pendingImport=value;preview.innerHTML=`<div class="pp-confirm"><p>새 기록 ${r.added}건 · 같은 ID ${r.conflicts}건 · 중복 의심 ${r.suspected}건</p><p>가져올 신분 카드: ${E(value.profile.nickname||'이름 없음')}</p><label class="pp-field"><span>같은 ID 처리</span><select id="ppImportMode"><option value="keep">현재 기록 유지</option><option value="replace">가져온 기록으로 교체</option></select></label><label><input id="ppImportProfile" type="checkbox"> 신분 카드도 가져오기</label><p class="pp-help">‘현재 기록 유지’는 같은 ID의 현재 내용을 그대로 두고 새 ID만 추가합니다. ‘가져온 기록으로 교체’는 같은 ID의 내용을 백업 내용으로 바꿉니다. 백업에 없는 현재 기록은 삭제하지 않습니다.<br>다른 ID의 중복 의심 기록은 합치지 않습니다. 적용 전 백업을 권장합니다.</p><button data-action="apply-import" class="pp-primary">확인한 내용 가져오기</button></div>`;}catch(e){say('가져오지 않았습니다. '+(e instanceof SyntaxError?'JSON 백업 파일을 확인해 주세요.':e.message));}});}
function download(blob,name){const u=URL.createObjectURL(blob),a=document.createElement('a');a.href=u;a.download=name;document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(u),30000);}
function backup(){download(new Blob([JSON.stringify({...state,exportedAt:new Date().toISOString()},null,2)],{type:'application/json'}),`seeya-passport-${P.today()}-${state.entries.length}entries.json`);try{localStorage.setItem('seeya-passport-backup-date',P.today());localStorage.setItem('seeya-diary-backup-snapshot',backupSnapshot());}catch{}say('백업 다운로드를 요청했어요. 파일 저장을 확인해 주세요.');}
function render(){say('');if(makerCleanup){makerCleanup();makerCleanup=null;}if(location.hash.startsWith('#view=')){viewShare(location.hash.slice(6));return;}document.querySelector('.pp-tabs').hidden=false;document.querySelectorAll('.pp-tabs a').forEach(a=>{const active=location.hash.startsWith('#make')?'#make':location.hash.startsWith('#new')?'#new':location.hash;const selected=new URL(a.href).hash===active;if(selected)a.setAttribute('aria-current','page');else a.removeAttribute('aria-current');});if(P.beforeDebut(state.profile.since))say('기존 입덕일이 데뷔일 이전이에요. 신분 카드에서 날짜를 수정해 주세요. 기존 기록은 그대로 보관했습니다.');renderedHash=location.hash;if(exportURL){URL.revokeObjectURL(exportURL);exportURL='';}pendingImport=null;const h=location.hash.slice(1);if(h==='make'||h.startsWith('make=')||h.startsWith('make?'))makerCleanup=Maker(app,state,catalog,say,download,h.startsWith('make=')?h.slice(5):'',{month:new URLSearchParams(h.split('?')[1]||'').get('month'),dirty:v=>dirty=v});else if(h==='share')sharePage();else if(h==='month')monthPage();else if(h==='tour')app.innerHTML=linkBack()+tour();else if(h==='goods'){filterKind='goods';page=1;home();}else if(h==='settings')settings();else if(h==='profile')editProfile();else if(h==='new'||h.startsWith('new?'))editor(null,new URLSearchParams(h.split('?')[1]||''));else if(h.startsWith('edit=')){const e=state.entries.find(x=>x.entryId===h.slice(5));if(e)editor(e);else detail(h.slice(5));}else if(h.startsWith('entry='))detail(h.slice(6));else {if(!h&&filterKind==='goods')filterKind='';home();}}
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
const G=__require("src/shared/passport-goods.js"),Play=__require("src/shared/passport-play.js");
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
 return {entryId:e.entryId,kind:e.kind,status:e.status,title,date:dt,datePrecision:precision(dt),time,members:[...new Set(e.members)],eventId:text(e.eventId||'',160),placeId:text(e.placeId||'',160),archiveId:text(e.archiveId||'',160),songs:e.kind==='concert'?[...new Set(songs)]:[],links:checkedLinks,seat:text(e.seat||'',100),companions:text(e.companions||'',120),note:text(e.note||'',4000),...(e.kind==='goods'?{goods:G.clean(e.goods)}:{}),...(e.kind==='play'?{play:Play.clean(e.play)}:{}),snapshot:{title:text(snap.title||'',300),place:text(snap.place||'',300),address:text(snap.address||'',400)},createdAt:e.createdAt,updatedAt:e.updatedAt};
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
 const blockPositions=recovered?.blocks||{};if(recovered)mottos.splice(0,mottos.length,...recovered.mottos.map(m=>({...m})));recordIds.push(...(recovered?.recordIds||[]).filter(id=>state.entries.some(e=>e.entryId===id)).slice(0,8));const blockNames={tour:'투어 스탬프',records:'나의 기록'};
 const photoKeys=['photoSize','photoOpacity','photoX','photoY'],mottoKeys=['motto','mottoFont','mottoSize','mottoX','mottoY'];
 const opts=(items,selected)=>items.map(([v,n])=>`<option value="${E(v)}" ${v===selected?'selected':''}>${E(n)}</option>`).join('');
 const slider=(name,label,value,min,max,unit='%')=>`<label class="pp-field pp-slider" for="${name}"><span>${label} <output for="${name}" aria-hidden="true">${value}${unit}</output></span><input id="${name}" name="${name}" form="ppMakerControls" type="range" step="any" aria-label="${label}" min="${min}" max="${max}" value="${value}" data-unit="${unit}"></label>`;
 app.innerHTML=`<a class="pp-back" href="/diary/">← 내 다이어리</a><section class="pp-panel pp-maker"><h2>이미지 만들기</h2><p id="ppDraftNotice" class="pp-draft-notice">문구·배치는 이 탭에 임시 보관합니다. 사진은 화면 이동 중에는 유지되지만 새로고침·탭 닫기 후에는 다시 선택해 주세요. 초안은 JSON 기록 백업에 포함되지 않습니다.</p><div class="pp-template-tabs" role="group" aria-label="이미지 템플릿">${Object.entries(templates).map(([v,n])=>`<button data-template="${v}" aria-pressed="${v===type}">${n}</button>`).join('')}</div><div class="pp-maker-layout"><div class="pp-canvas-wrap"><div id="ppEditStage" class="pp-edit-stage"><canvas id="ppCanvas" aria-label="내 다이어리 이미지 미리보기"></canvas><div id="ppSelection" class="pp-selection" role="group" tabindex="0" aria-label="선택한 요소 이동" hidden>${['nw','ne','sw','se'].map((d,i)=>`<button type="button" class="pp-resize pp-resize-${d}" data-corner="${d}" aria-label="사진 ${['왼쪽 위','오른쪽 위','왼쪽 아래','오른쪽 아래'][i]} 크기 조절"></button>`).join('')}</div></div>
 <div class="pp-edit-tools"><div class="pp-edit-modes" role="group" aria-label="편집할 요소"><button type="button" data-edit="photo" disabled>사진</button><button type="button" data-edit="motto">문구</button><button type="button" data-edit="tour" hidden>투어 스탬프</button><button type="button" data-edit="records" hidden>나의 기록</button><button type="button" data-edit="none" aria-pressed="true">완료</button></div><div id="ppPhotoTools" hidden>${slider('photoSize','사진 확대',75,10,200)}${slider('photoOpacity','사진 진하기',70,0,100)}<div class="pp-actions"><button type="button" id="ppCenterPhoto">가운데</button><button type="button" id="ppResetPhoto">초기화</button></div></div><div id="ppMottoTools" hidden><label class="pp-field"><span>문구 글꼴</span><select name="mottoFont" form="ppMakerControls">${opts(Object.entries(R.FONTS).map(([k,v])=>[k,v.label]),'basic')}</select></label><p id="ppFontStatus" class="pp-help" role="status"></p><label class="pp-field pp-font-size"><span>글자 크기</span><button type="button" data-font="-2" aria-label="글자 작게">−</button><input form="ppMakerControls" type="number" name="mottoSize" aria-label="문구 글자 크기" min="18" max="150" value="28"><span>px</span><button type="button" data-font="2" aria-label="글자 크게">+</button></label><div class="pp-actions"><button type="button" id="ppEditMotto">문구 수정</button><button type="button" id="ppCenterMotto">가운데</button><button type="button" id="ppResetMotto">초기화</button></div></div><div id="ppBlockTools" hidden><p class="pp-help">선택한 영역을 끌어 이동하세요. 버튼으로 조금씩 조절할 수도 있어요.</p><div class="pp-actions"><button type="button" data-block-move="left" aria-label="선택 영역 왼쪽으로">←</button><button type="button" data-block-move="up" aria-label="선택 영역 위로">↑</button><button type="button" data-block-move="down" aria-label="선택 영역 아래로">↓</button><button type="button" data-block-move="right" aria-label="선택 영역 오른쪽으로">→</button><button type="button" id="ppResetBlock">기본 위치</button></div></div><p id="ppEditHint" class="pp-help" aria-live="polite">사진·문구·투어 스탬프·나의 기록을 선택해 편집하세요.</p></div><label class="pp-guide-toggle"><input id="ppShowGuides" type="checkbox"> 가운데 정렬선 표시 · 저장 이미지에는 제외</label><p id="ppOverlap" class="pp-maker-notice" role="status" hidden></p><p id="ppPhotoHint" class="pp-maker-notice" hidden>포토 티켓은 사진을 넣으면 중앙 공간이 채워져요. 사진 없이 기록을 담으려면 ‘선택한 기록’을 이용해 보세요.</p><p id="ppImageSize" class="pp-help"></p></div><form id="ppMakerControls" class="pp-form-grid">
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
  for(const k of ['tour','records']){const b=R.blockLayout(k,state,catalog,v,H);if(b)fixed.push(b);}
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
 function geometry(){const v=values(),H=canvas.height/canvas.width*1080,g=canvas.getContext('2d');return {v,H,blocks:{tour:R.blockLayout('tour',state,catalog,v,H),records:R.blockLayout('records',state,catalog,v,H)},m:R.mottoLayout(g,v,H),r:photo?R.photoRect(photo.width,photo.height,1080,H,v):null};}
 function syncSelection(){
  const {H,m,r,blocks}=geometry();for(const k of Object.keys(blockNames)){app.querySelector('[data-edit='+k+']').hidden=!blocks[k];if(selected===k&&!blocks[k])selected='none';}const b=selected==='photo'?r:selected==='motto'&&values().motto.trim()?{x:m.x,y:m.y-m.font,width:m.width,height:m.height}:blocks[selected]||null;
  selection.hidden=!b;
  if(b){Object.assign(selection.style,{left:b.x/1080*100+'%',top:b.y/H*100+'%',width:b.width/1080*100+'%',height:b.height/H*100+'%'});selection.setAttribute('aria-label',(blockNames[selected]|| (selected==='photo'?'사진':'문구'))+' 이동 · 방향키로 미세 조절');}
  selection.querySelectorAll('[data-corner]').forEach(el=>el.hidden=selected!=='photo');
  document.getElementById('ppBlockTools').hidden=!blocks[selected];document.getElementById('ppPhotoTools').hidden=selected!=='photo';document.getElementById('ppMottoTools').hidden=selected!=='motto';
  app.querySelectorAll('[data-edit]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.edit===selected)));
  document.getElementById('ppEditHint').textContent=blocks[selected]?blockNames[selected]+' 영역을 끌어 이동 · 방향키로 미세 조절':selected==='photo'?'사진을 끌어 이동 · 모서리를 끌어 크기 조절':selected==='motto'?'문구를 끌어 이동 · 아래에서 글자 크기 조절':'사진·문구·투어 스탬프·나의 기록을 선택해 편집하세요.';
 }
 function setValues(v){for(const [k,n] of Object.entries(v)){if(/^(tour|records)[XY]$/.test(k))(blockPositions[type]||= {})[k]=n;else f.elements[k].value=n;}draw();}
 app.querySelectorAll('[data-edit]').forEach(b=>b.onclick=()=>{selected=b.dataset.edit;layersUI();syncSelection();});
 document.getElementById('ppResetBlock').onclick=()=>{const p=blockPositions[type]||{};delete p[selected+'X'];delete p[selected+'Y'];draw();};
 app.querySelectorAll('[data-block-move]').forEach(b=>b.onclick=()=>{const box=geometry().blocks[selected];if(!box)return;const [dx,dy]={left:[-12,0],right:[12,0],up:[0,-12],down:[0,12]}[b.dataset.blockMove];setValues(D.moveBlock(selected,box,dx,dy));});
 app.querySelectorAll('[data-font]').forEach(b=>b.onclick=()=>setValues({mottoSize:Math.max(18,Math.min(150,(Number(f.elements.mottoSize.value)||28)+Number(b.dataset.font)))}));
 document.getElementById('ppCenterPhoto').onclick=()=>setValues({photoX:50,photoY:50});
 document.getElementById('ppCenterMotto').onclick=()=>setValues({mottoX:50});
 document.getElementById('ppEditMotto').onclick=()=>f.elements.motto.focus();
 canvas.addEventListener('pointerdown',e=>{saveLayer();const box=canvas.getBoundingClientRect(),H=canvas.height/canvas.width*1080,x=(e.clientX-box.left)/box.width*1080,y=(e.clientY-box.top)/box.height*H,g=canvas.getContext('2d');const hit=b=>b&&x>=b.x&&x<=b.x+b.width&&y>=b.y&&y<=b.y+b.height;
  for(let i=mottos.length-1;i>=0;i--){const m=R.mottoLayout(g,mottos[i],H);if(mottos[i].motto.trim()&&hit({x:m.x,y:m.y-m.font,width:m.width,height:m.height})){chooseLayer('motto',i);return;}}
  for(const kind of ['records','tour']){const b=R.blockLayout(kind,state,catalog,values(),H);if(hit(b)){selected=kind;syncSelection();return;}}
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
 g.fillStyle=fg;drawLogo(g,logo,88,208,380);
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
  drawLogo(g,logo,76,y-44,230);text(g,'DIARY'+(opts.nickname&&state.profile.nickname?' · '+state.profile.nickname:''),346,y,24,650,32,1);y+=90;
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

}
};const cache={};function __require(id){if(cache[id])return cache[id].exports;const m=cache[id]={exports:{}};modules[id](m,m.exports,__require);return m.exports;}__require("src/client/passport.js");})();
