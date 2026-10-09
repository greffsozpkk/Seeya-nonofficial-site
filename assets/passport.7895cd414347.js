(function(){'use strict';const modules={
"src/client/passport.js":function(module,exports,__require){
'use strict';
const P=__require("src/shared/passport.js");
const attachPicker=__require("src/client/passport-picker.js");
const X=__require("src/shared/passport-extra.js"),Share=__require("src/client/passport-share.js"),Maker=__require("src/client/passport-maker.js");
const app=document.getElementById('passportApp'),status=document.getElementById('ppStatus');
const catalog=JSON.parse(document.getElementById('passportCatalog').textContent),E=P.esc;
let store,state,dirty=false,pendingImport=null,filterKind='',filterYear='',filterMember='',listMode=false,page=1,exportURL='',renderedHash=location.hash;
const say=s=>{status.textContent=s;};
const options=(items,selected)=>items.map(([v,t])=>`<option value="${E(v)}"${v===selected?' selected':''}>${E(t)}</option>`).join('');
const field=(label,name,value='',extra='')=>`<label class="pp-field"><span>${label}</span><input name="${name}" value="${E(value)}" ${extra}></label>`;
const memberNames=e=>e.members.map(m=>P.MEMBERS[m]).join(' · ')||'멤버 미지정';
const eventKind=e=>e?.type==='performance'?'concert':'story';
const kindState=e=>e.status==='planned'?'갈 예정':e.kind==='story'?'남긴 이야기':'다녀왔어요';
function save(next){try{state=store.save(next);dirty=false;return true;}catch(error){say(error.name==='QuotaExceededError'?'저장 공간이 부족합니다. 입력 내용을 복사해 두고 수첩을 백업해 주세요.':error.message||'저장하지 못했습니다. 입력 내용을 복사해 주세요.');return false;}}
function go(hash=''){dirty=false;if(location.hash===hash)render();else location.hash=hash;}
function linkBack(){return '<a class="pp-back" href="/passport/test/">← 내 패스포트</a>';}
function profileCard(){const p=state.profile,n=P.summary(state.entries),years=p.since?Math.max(1,Number(P.today().slice(0,4))-Number(p.since.slice(0,4))+1):0;return `<div class="pp-sidebar"><section class="pp-panel pp-profile" style="--pp-color:${P.COLORS[p.color]}"><div class="pp-card-top"><span>SINCE ${E(p.since||'YOUR FIRST DAY')}</span><span>WITH YOU</span></div><div class="pp-identity"><div><p>처음 씨야를 좋아한 날</p><strong>${years?'위듀 '+years+'년차':'우리의 첫 페이지'}</strong></div><span class="pp-round-seal">SEE<br>YA</span></div><p class="pp-nickname">${E(p.nickname||'나의 패스포트')}</p><div class="pp-stats"><div><b>${n.concert}</b><span>공연 관람</span></div><div><b>${n.visit}</b><span>장소 방문</span></div><div><b>${X.songs(state.entries).length}</b><span>들은 곡 / ${catalog.songs.length}</span></div></div>${p.favSong?`<p class="pp-help">MY SONG · ${E(p.favSong)}</p>`:''}${p.motto?`<p class="pp-motto">${E(p.motto)}</p>`:''}<div class="pp-actions"><button data-action="copy-summary">집계 복사</button><a href="/passport/test/#share">QR로 공유</a></div><a class="pp-profile-edit" href="/passport/test/#profile">신분 카드 편집 →</a></section><section class="pp-panel pp-member-counts"><p class="pp-label">MEMBERS</p>${Object.entries(P.MEMBERS).map(([id,name])=>`<div><span class="pp-member-dot" data-member="${id}"></span><span>${name}</span><b>${state.entries.filter(e=>P.completed(e)&&e.members.includes(id)).length}</b></div>`).join('')}</section><div class="pp-storage-note"><b>이 브라우저에 저장돼요</b><p>기기를 바꾸기 전에 백업해 주세요.<br>기록은 다른 사람과 비교하지 않아요.</p><a href="/passport/test/#settings">백업·복원</a> · <a href="/about/install/">홈 화면에 추가</a></div></div>`;}
function tour(){const total=catalog.tour.filter(t=>X.tourEntries(t,state.entries).length).length;return `<section class="pp-tour-section"><div class="pp-section-head"><div><p class="pp-label">THE FAN · 20TH ANNIVERSARY TOUR</p><h2>투어 도장판 <small>${total} / ${catalog.tour.length}</small></h2></div><a href="/calendar/">일정 보기</a></div><div class="pp-panel pp-tour">${catalog.tour.map(t=>{const records=X.tourEntries(t,state.entries),planned=state.entries.some(x=>x.eventId===t.eventId&&x.date===t.date&&x.status==='planned'),diff=Math.round((Date.parse(t.date)-Date.parse(P.today()))/86400000);return `<button class="pp-stamp${records.length?' is-done':''}" data-event="${E(t.eventId)}" aria-label="${E(t.label+' '+P.dateLabel(t.date))} 공연 기록하기"><strong><small>${t.date.slice(5).replace('-','.')}</small>${E(t.label)}</strong><span>${records.length?'관람 '+records.length+'회':planned?'갈 예정':diff>0?'D-'+diff:diff===0?'오늘':'추억 남기기'}</span></button>`;}).join('')}</div></section>`;}
function home(){let rows=state.entries.filter(e=>(!filterKind||e.kind===filterKind)&&(!filterYear||e.date.slice(0,4)===filterYear)&&(!filterMember||e.members.includes(filterMember))).sort((a,b)=>(b.date||'').localeCompare(a.date||'')||b.createdAt.localeCompare(a.createdAt));const pages=Math.max(1,Math.ceil(rows.length/9));page=Math.min(page,pages);const years=[...new Set(state.entries.map(e=>e.date.slice(0,4)).filter(Boolean))].sort().reverse();app.innerHTML=`<div class="pp-layout">${profileCard()}<div>${tour()}<div class="pp-toolbar"><h2>내 기록 <small>${rows.length}</small></h2><button data-action="view" aria-pressed="${listMode}">${listMode?'스탬프 보기':'시간순 보기'}</button><div class="pp-filters"><select id="ppYearFilter" aria-label="기록 연도 필터">${options([['','모든 연도'],...years.map(y=>[y,y+'년'])],filterYear)}</select><select id="ppKindFilter" aria-label="기록 종류 필터">${options([['','모든 종류'],...Object.entries(P.KINDS)],filterKind)}</select><select id="ppMemberFilter" aria-label="기록 멤버 필터">${options([['','모든 멤버'],...Object.entries(P.MEMBERS)],filterMember)}</select></div></div>${rows.length?`<div class="pp-records${listMode?' is-list':''}">${rows.slice((page-1)*9,page*9).map(e=>`<a href="/passport/test/#entry=${encodeURIComponent(e.entryId)}" class="pp-record" data-kind="${e.kind}"><span class="pp-label">${{concert:'CONCERT · TICKET',visit:'VISIT',event:'FAN EVENT',story:'MY STORY'}[e.kind]}</span><h3>${E(e.title)}</h3><p>${P.dateLabel(e.date)}${e.time?' · '+e.time:''}</p><p>${E(e.snapshot.place||memberNames(e))}</p><div class="pp-record-foot"><span>${e.kind==='concert'?(e.songs||[]).length+'곡 · ':''}${kindState(e)}</span><span class="pp-member-dot" data-member="${e.members[0]||'seeya'}"></span></div></a>`).join('')}</div><div class="pp-pagination"><button data-page="${page-1}" ${page===1?'disabled':''}>이전</button><span>${page} / ${pages}</span><button data-page="${page+1}" ${page===pages?'disabled':''}>다음</button></div>`:`<div class="pp-empty"><div class="pp-empty-stamps" aria-hidden="true">TICKET　 VISIT　 MY STORY</div><strong>처음 씨야를 좋아한 날부터.</strong><p>날짜가 정확하지 않아도 괜찮아요.<br>한 장의 기억으로 수첩을 시작해 보세요.</p><a href="/passport/test/#profile">처음 좋아한 날 남기기 →</a></div>`}<a class="pp-new-bottom" href="/passport/test/#new">＋ 기록 남기기</a></div></div>`;}

function ticket(e){return `<div class="pp-ticket"><p class="pp-label">WITH YOU PASSPORT · ${P.KINDS[e.kind]}</p><h2>${E(e.title)}</h2><p>${E(e.snapshot.place||'나의 기억 속 한 장면')}</p><div class="pp-ticket-cut"><p>${P.dateLabel(e.date)}${e.time?' · '+e.time:''}</p>${e.seat?`<p>좌석 · ${E(e.seat)}</p>`:''}<p>${E(memberNames(e))}</p><span class="pp-seal">${e.status==='planned'?'TO BE THERE':e.kind==='story'?'MY MEMORY':'I WAS HERE'}</span></div></div>`;}
function detail(id){const e=state.entries.find(e=>e.entryId===id);if(!e){app.innerHTML=linkBack()+'<p>기록을 찾지 못했어요. 백업 파일에서 복원할 수 있습니다.</p>';return;}const place=catalog.places.find(p=>p.id===e.placeId),event=catalog.events.find(x=>x.id===e.eventId);app.innerHTML=linkBack()+`<div class="pp-detail"><div>${ticket(e)}<div class="pp-actions" style="margin-top:18px"><a href="/passport/test/#make=${E(id)}">이미지로 만들기</a><a href="/passport/test/#share">QR로 공유</a><a href="/passport/test/#edit=${E(id)}">수정</a></div><p class="pp-help">공유 이미지에는 메모·동행인이 포함되지 않아요. 좌석은 이미지 만들기에서 직접 선택할 때만 포함합니다.</p></div><section class="pp-panel"><h2>그날의 기억</h2><dl><dt>상태</dt><dd>${kindState(e)}</dd><dt>날짜</dt><dd>${P.dateLabel(e.date)}</dd><dt>함께</dt><dd>${E(e.companions||'기록하지 않았어요')}</dd><dt>정보 기준</dt><dd>${e.eventId?'일정에서 시작한 기록':e.placeId?'지도에서 시작한 기록':'직접 입력'}</dd></dl>${detailExtras(e)}<p class="pp-note">${E(e.note||'아직 메모가 없어요.')}</p><div class="pp-actions">${place?`<a href="/map/?place=${encodeURIComponent(place.id)}">지도에서 보기</a>`:''}${event?.calendar?`<a href="/calendar/?month=${event.date.slice(0,7)}&event=${encodeURIComponent(event.id)}">연결된 일정</a>`:''}${e.archiveId&&catalog.events.some(x=>x.archiveId===e.archiveId)?`<a href="/archive/?record=${encodeURIComponent(e.archiveId)}">아카이브 기록</a>`:''}</div>${(e.eventId&&!event||e.placeId&&!place)?'<p class="pp-help">공개 정보의 연결이 사라졌지만 작성 당시 내용은 수첩에 남아 있어요.</p>':''}<div class="pp-danger"><button data-action="show-delete">이 기록 삭제</button><div id="ppDelete" class="pp-confirm" hidden><p>삭제 후에는 백업 파일이 있어야 복원할 수 있어요.</p><button data-delete="${E(id)}">이 기록을 삭제합니다</button></div></div></section></div><div id="ppExportResult"></div>`;}
function songFields(e){const known=new Set(catalog.songs.map(s=>s.id)),unknown=(e.songs||[]).filter(id=>!known.has(id));return `<fieldset class="pp-wide pp-song-box" id="ppSongBox" ${e.kind==='concert'?'':'hidden'}><legend>그날 들은 곡</legend><input id="ppSongSearch" type="search" placeholder="곡명 검색" aria-label="들은 곡 검색"><div class="pp-song-list">${[...catalog.songs,...unknown.map(id=>({id,title:id,album:'이전 백업의 곡'}))].map(s=>`<label data-song-title="${E(s.title.toLowerCase())}"><input type="checkbox" name="song" value="${E(s.id)}" ${(e.songs||[]).includes(s.id)?'checked':''}><span>${E(s.title)}<small>${E(s.album||'')}</small></span></label>`).join('')}</div><p class="pp-help">공연에서 실제 들은 곡만 체크해 주세요. 예정 기록은 들은 곡 집계에서 제외합니다.</p></fieldset>`;}
function linkFields(e){return `<section class="pp-wide pp-link-fields"><h3>관련 링크 <small>최대 8개</small></h3><p class="pp-help">인스타그램·유튜브·X 등 관련 게시물의 https:// 주소를 적어 주세요.</p><div id="ppLinkRows">${(e.links||[]).map((l,i)=>linkRow(l,i)).join('')}</div><button type="button" id="ppAddLink">＋ 링크 추가</button></section>`;}
function linkRow(l,i){return `<div class="pp-link-row"><label class="pp-field"><span>링크 주소 ${i+1}</span><input data-url type="url" maxlength="2000" value="${E(l.url)}" placeholder="https://"></label><label class="pp-field"><span>한 줄 설명 ${i+1}</span><input data-label maxlength="120" value="${E(l.label)}" placeholder="직접 찍은 공연 영상"></label><button type="button" data-remove-link aria-label="링크 ${i+1} 삭제">삭제</button></div>`;}
function readLinks(f){return [...f.querySelectorAll('.pp-link-row')].map(r=>({url:r.querySelector('[data-url]').value.trim(),label:r.querySelector('[data-label]').value.trim()})).filter(x=>x.url||x.label).map(x=>{if(!x.url)throw Error('설명이 있는 링크의 주소를 입력해 주세요.');return {...x,url:X.url(x.url)};});}
function wireExtras(f){f.elements.kind.addEventListener('change',()=>{document.getElementById('ppSongBox').hidden=f.elements.kind.value!=='concert';});document.getElementById('ppSongSearch').oninput=e=>{const q=e.target.value.trim().toLowerCase();f.querySelectorAll('[data-song-title]').forEach(r=>r.hidden=!r.dataset.songTitle.includes(q));};document.getElementById('ppAddLink').onclick=()=>{const box=document.getElementById('ppLinkRows');if(box.children.length>=8){say('링크는 최대 8개까지 넣을 수 있어요.');return;}box.insertAdjacentHTML('beforeend',linkRow({url:'',label:''},box.children.length));dirty=true;box.lastElementChild.querySelector('input').focus();};f.addEventListener('click',e=>{if(e.target.closest('[data-remove-link]')){e.target.closest('.pp-link-row').remove();dirty=true;}});}
function detailExtras(e){const first=new Set(X.firstSongs(e,state.entries));return `${e.kind==='concert'?`<section class="pp-detail-songs"><h3>그날 들은 곡 <small>${(e.songs||[]).length}</small></h3>${(e.songs||[]).length?`<ul>${e.songs.map(id=>`<li>${E(catalog.songs.find(s=>s.id===id)?.title||id)} ${first.has(id)&&e.status==='done'?'<small class="pp-first" title="내 수첩에 기록한 첫 청취">FIRST</small>':''}</li>`).join('')}</ul>`:'<p class="pp-help">기록 수정에서 들은 곡을 체크할 수 있어요.</p>'}</section>`:''}${e.links?.length?`<section class="pp-attached"><h3>함께 남긴 링크</h3>${e.links.map(l=>{const yt=X.youtube(l.url);return `<a href="${E(l.url)}" target="_blank" rel="noopener noreferrer">${yt?`<img src="https://i.ytimg.com/vi/${yt}/mqdefault.jpg" alt="유튜브 영상 썸네일" loading="lazy" referrerpolicy="no-referrer">`:''}<span>${E(l.label||new URL(l.url).hostname)} ↗</span></a>`;}).join('')}</section>`:''}`;}
async function copyText(text){try{await navigator.clipboard.writeText(text);say('복사했어요. 원하는 곳에 붙여넣어 주세요.');}catch{say('자동 복사를 사용할 수 없어요. 아래 문구를 선택해 복사해 주세요.');const t=document.createElement('textarea');t.value=text;t.readOnly=true;status.append(t);t.select();}}
function monthPage(){app.innerHTML=linkBack()+`<section class="pp-panel"><p class="pp-label">MY MONTH · WITH YOU</p><h2>이달의 나</h2><label class="pp-field"><span>기록을 돌아볼 달</span><input id="ppMonth" type="month" value="${P.today().slice(0,7)}"></label><div id="ppMonthResult"></div><a href="/passport/test/#make">결산 이미지 만들기 →</a></section>`;const draw=()=>{const m=document.getElementById('ppMonth').value,rows=state.entries.filter(e=>e.date.startsWith(m)&&P.completed(e)),n=P.summary(rows);document.getElementById('ppMonthResult').innerHTML=`<div class="pp-stats"><div><b>${n.concert}</b><span>공연</span></div><div><b>${n.visit}</b><span>장소</span></div><div><b>${X.songs(rows).length}</b><span>들은 곡</span></div></div>${rows.length?rows.map(e=>`<p><a href="/passport/test/#entry=${E(e.entryId)}">${P.dateLabel(e.date)} · ${E(e.title)}</a></p>`).join(''):'<p>이달의 기억을 기다리고 있어요.</p>'}`;};document.getElementById('ppMonth').onchange=draw;draw();}
function sharePage(){app.innerHTML=linkBack()+`<section class="pp-panel pp-settings"><p class="pp-label">WITH YOU · SHARE</p><h2>나의 패스포트 요약 QR</h2><p>처음 좋아한 날, 공연·장소·팬 행사·이야기 집계와 완료한 기록의 제목·날짜, 들은 곡 수를 공유합니다. 메모·좌석·동행인·첨부 링크는 제외합니다.</p><p class="pp-help">내용이 주소 안에 담깁니다. 링크를 받은 사람은 누구나 요약을 볼 수 있으며 나중에 회수할 수 없습니다. 공유 전에 기록 제목도 확인해 주세요.</p><label class="pp-checks"><input type="checkbox" id="ppShareName"> 닉네임도 포함</label><button id="ppBuildQR" class="pp-primary">요약 미리보기·QR 만들기</button><div id="ppQRResult"></div></section>`;document.getElementById('ppBuildQR').onclick=async()=>{const target=document.getElementById('ppQRResult');try{const result=await Share.make(state,document.getElementById('ppShareName').checked,location.origin+'/passport/test/#view=');if(!target.isConnected)return;target.innerHTML=`<p class="pp-help">최근 기록 ${result.included}개 포함 · 전체 집계는 유지합니다.${result.included<state.entries.filter(e=>P.completed(e)).length?' QR 용량에 맞춰 최근 기록부터 담았습니다.':''}</p><div id="ppQRCanvas"></div><label class="pp-field"><span>공유 주소</span><textarea readonly id="ppShareURL">${E(result.url)}</textarea></label><div class="pp-actions"><button id="ppCopyURL">주소 복사</button><button id="ppSaveQR">QR 이미지 저장</button><a href="${E(result.url)}" target="_blank" rel="noopener noreferrer">읽기 전용 미리보기</a></div><details><summary>공유되는 기록 확인</summary>${result.summary.r.map(r=>`<p>${E(r.d+' · '+r.t)}</p>`).join('')}</details>`;document.getElementById('ppQRCanvas').append(result.canvas);document.getElementById('ppCopyURL').onclick=()=>copyText(result.url);document.getElementById('ppSaveQR').onclick=()=>result.canvas.toBlob(b=>download(b,'with-you-summary-qr.png'),'image/png');}catch{say('이 브라우저에서는 QR을 만들지 못했어요. 최신 브라우저에서 다시 시도해 주세요.');}};}
async function viewShare(token){document.querySelector('.pp-tabs').hidden=true;app.innerHTML='<p>공유된 패스포트를 여는 중이에요.</p>';try{const s=await Share.decode(token);if(location.hash!=='#view='+token)return;app.innerHTML=`<section class="pp-panel pp-shared"><p class="pp-label">WITH YOU PASSPORT · READ ONLY</p><h2>${E(s.n||'위듀의 패스포트')}</h2><p>본인이 기록한 패스포트 요약입니다.</p><div class="pp-stats"><div><b>${s.c.concert}</b><span>공연 관람</span></div><div><b>${s.c.visit}</b><span>장소 방문</span></div><div><b>${s.c.event}</b><span>팬 행사</span></div></div><div class="pp-tour">${catalog.tour.map(t=>`<div class="pp-stamp ${s.r.some(r=>r.k==='concert'&&r.d===t.date&&(r.i===t.eventId||r.a===t.archiveId))?'is-done':''}"><strong><small>${t.date.slice(5)}</small>${E(t.label)}</strong></div>`).join('')}</div><p class="pp-help">도장은 공유에 포함된 최근 기록 기준입니다.</p><div class="pp-records">${s.r.map(r=>`<div class="pp-record" data-kind="${r.k}"><span class="pp-label">${P.KINDS[r.k]}</span><h3>${E(r.t)}</h3><p>${P.dateLabel(r.d)}</p><p>들은 곡 ${r.z}곡</p></div>`).join('')}</div></section><a href="/passport/test/">내 기기의 패스포트 열기 →</a>`;}catch{app.innerHTML='<section class="pp-panel"><h2>공유 주소를 확인해 주세요.</h2><p>주소가 잘렸거나 지원하지 않는 공유 내용입니다.</p></section>';}}

function editor(existing,params=new URLSearchParams()){
 const ev=catalog.events.find(x=>x.id===params.get('event')),pl=catalog.places.find(x=>x.id===(params.get('place')||ev?.placeId));
 const now=new Date().toISOString(),e=existing||{entryId:crypto.randomUUID(),kind:ev?eventKind(ev):pl?'visit':'story',status:ev?P.defaultStatus(ev.date):pl?'planned':'done',title:ev?.title||pl?.name||'',date:ev?.date||'',time:ev?.time||'',members:ev?.members||[],eventId:ev?.id||'',placeId:pl?.id||'',archiveId:ev?.archiveId||'',snapshot:{title:ev?.title||'',place:pl?.name||ev?.venue||'',address:pl?.address||''},seat:'',companions:'',note:'',createdAt:now,updatedAt:now};
 e.songs=e.songs||[];e.links=e.links||[];const parts=e.date.split('-');app.innerHTML=linkBack()+`<section class="pp-panel pp-editor"><h2>${existing?'기록 수정':'새 기록 남기기'}</h2><form id="ppEntryForm" class="pp-form-grid"><label class="pp-field"><span>기록 종류</span><select name="kind">${options(Object.entries(P.KINDS),e.kind)}</select></label><label class="pp-field"><span>기록 상태</span><select name="status">${options([['planned','갈 예정 / 계획'],['done','다녀왔어요 / 남긴 이야기']],e.status)}</select></label><div class="pp-wide pp-event-picker"><label class="pp-field" for="ppEventSearch"><span>등록된 일정 찾기 (선택)</span></label><input id="ppEventSearch" role="combobox" aria-autocomplete="list" aria-expanded="false" aria-controls="ppEventList" aria-describedby="ppEventHint" placeholder="공연명·장소·날짜 검색" autocomplete="off"><div id="ppEventList" class="pp-event-results" role="listbox" aria-label="검색된 일정" hidden></div><p id="ppEventHint" class="pp-help" role="status">검색 결과를 선택하면 제목·날짜·장소가 채워져요.</p><div id="ppSelectedEvent" class="pp-selected-event" hidden></div><div id="ppSessions" class="pp-sessions" role="group" aria-label="공연 날짜 선택" hidden></div></div><div class="pp-wide">${field('제목 *','title',e.title,'required maxlength="160"')}</div><div class="pp-wide"><span>날짜 (아는 만큼만)</span><div class="pp-date-fields">${field('연도','year',parts[0]||'','type="number" min="1900" max="2100" placeholder="미상"')}${field('월','month',parts[1]||'','type="number" min="1" max="12" placeholder="선택"')}${field('일','day',parts[2]||'','type="number" min="1" max="31" placeholder="선택"')}</div><p class="pp-help">날짜를 모두 비우면 ‘날짜 미상’으로 남아요.</p></div>${field('시간 (선택)','time',e.time,'type="time"')}${field('좌석 (선택)','seat',e.seat,'maxlength="100"')}${field('장소 이름 (직접 수정 가능)','place',e.snapshot.place,'maxlength="300"')}${field('함께 간 사람 (선택)','companions',e.companions,'maxlength="120"')}<fieldset class="pp-wide"><legend>함께한 멤버</legend><div class="pp-checks">${Object.entries(P.MEMBERS).map(([v,t])=>`<label><input type="checkbox" name="member" value="${v}"${e.members.includes(v)?' checked':''}>${t}</label>`).join('')}</div></fieldset>${songFields(e)}${linkFields(e)}<label class="pp-field pp-wide"><span>나만의 메모</span><textarea name="note" maxlength="4000" placeholder="그날의 마음을 적어 주세요.">${E(e.note)}</textarea></label><div class="pp-wide pp-draft-preview"><p class="pp-label">기록 미리보기</p><div id="ppDraft" class="pp-preview-summary"></div></div><div class="pp-wide pp-confirm" id="ppDuplicate" hidden><p>같은 날짜·회차의 비슷한 기록이 있어요.</p><label><input type="checkbox" name="allowDuplicate"> 별도의 경험으로 추가할게요</label></div><div class="pp-wide pp-actions"><button type="submit" class="pp-primary">${existing?'변경 내용 저장':'수첩에 기록하기'}</button><a href="/passport/test/">취소</a></div></form></section>`;
 const f=document.getElementById('ppEntryForm');wireExtras(f);let eventId=e.eventId,placeId=e.placeId,archiveId=e.archiveId,snapshot={...e.snapshot},statusManual=false;
 const preview=()=>{document.getElementById('ppDraft').innerHTML=ticket({title:f.elements.title.value||'나의 기록',kind:f.elements.kind.value,status:f.elements.status.value,date:[f.elements.year.value,f.elements.month.value,f.elements.day.value].filter(Boolean).join('-'),time:f.elements.time.value,seat:f.elements.seat.value,members:[...f.querySelectorAll('[name=member]:checked')].map(b=>b.value),snapshot:{place:f.elements.place.value}});};preview();
 f.addEventListener('input',ev=>{dirty=true;if(ev.target.name==='allowDuplicate')return;document.getElementById('ppDuplicate').hidden=true;if(f.elements.allowDuplicate)f.elements.allowDuplicate.checked=false;preview();});
 f.elements.place.addEventListener('change',()=>{if(f.elements.place.value!==snapshot.place){placeId='';snapshot.address='';}});
 function selectedEvent(x){const box=document.getElementById('ppSelectedEvent'),sessions=document.getElementById('ppSessions');box.hidden=!x;box.innerHTML=x?`<div><small>연결된 일정</small><strong>${E(x.date+' · '+x.title)}</strong></div><button type="button" id="ppUnlinkEvent">연결 해제</button>`:'';const group=catalog.tour.find(t=>(t.eventIds||[t.eventId]).includes(x?.id));const choices=group?(group.eventIds||[group.eventId]).map(id=>catalog.events.find(x=>x.id===id)).filter(Boolean):[];sessions.hidden=choices.length<2;sessions.innerHTML=choices.length>1?'<p>공연 날짜를 선택해 주세요.</p><div>'+choices.map(v=>`<button type="button" data-session="${E(v.id)}" aria-pressed="${f.elements.year.value+'-'+String(f.elements.month.value).padStart(2,'0')+'-'+String(f.elements.day.value).padStart(2,'0')===v.date}">${E(P.dateLabel(v.date))}</button>`).join('')+'</div>':'';}
 function chooseEvent(x){dirty=true;statusManual=false;const p=catalog.places.find(p=>p.id===x.placeId);eventId=x.id;placeId=p?.id||'';archiveId=x.archiveId;snapshot={title:x.title,place:p?.name||x.venue,address:p?.address||''};for(const [k,v] of Object.entries({title:x.title,year:x.date.slice(0,4),month:Number(x.date.slice(5,7)),day:Number(x.date.slice(8,10)),time:x.time,place:snapshot.place,kind:eventKind(x),status:P.defaultStatus(x.date)}))f.elements[k].value=v;f.querySelectorAll('[name=member]').forEach(b=>b.checked=x.members.includes(b.value));document.getElementById('ppSongBox').hidden=f.elements.kind.value!=='concert';document.getElementById('ppDuplicate').hidden=true;f.elements.allowDuplicate.checked=false;selectedEvent(x);preview();}
 selectedEvent(catalog.events.find(x=>x.id===eventId));
 attachPicker(document.getElementById('ppEventSearch'),document.getElementById('ppEventList'),document.getElementById('ppEventHint'),catalog.events,chooseEvent,E);
 f.addEventListener('click',ev=>{const b=ev.target.closest('button');if(b?.dataset.session){chooseEvent(catalog.events.find(x=>x.id===b.dataset.session));}else if(b?.id==='ppUnlinkEvent'){dirty=true;eventId='';archiveId='';selectedEvent(null);}});
 f.elements.status.addEventListener('change',()=>{statusManual=true;});
 for(const key of ['year','month','day'])f.elements[key].addEventListener('change',()=>{if(existing||statusManual)return;const y=f.elements.year.value,m=f.elements.month.value,d=f.elements.day.value,dt=y+(m?'-'+m.padStart(2,'0'):'')+(d?'-'+d.padStart(2,'0'):'');try{if(dt)f.elements.status.value=P.defaultStatus(P.date(dt));}catch{}preview();});
 f.addEventListener('submit',ev=>{ev.preventDefault();try{const y=f.elements.year.value,m=f.elements.month.value,d=f.elements.day.value;if((m&&!y)||(d&&(!y||!m)))throw Error('월·일을 입력하려면 앞의 연도·월도 입력해 주세요.');const dt=y+(m?'-'+m.padStart(2,'0'):'')+(d?'-'+d.padStart(2,'0'):'');const v=P.entry({...e,title:f.elements.title.value,kind:f.elements.kind.value,status:f.elements.status.value,date:dt,time:f.elements.time.value,seat:f.elements.seat.value,companions:f.elements.companions.value,note:f.elements.note.value,songs:[...f.querySelectorAll('[name=song]:checked')].map(b=>b.value),links:readLinks(f),members:[...f.querySelectorAll('[name=member]:checked')].map(b=>b.value),eventId,placeId,archiveId,snapshot:{...snapshot,place:f.elements.place.value},updatedAt:new Date().toISOString()});if(v.status==='done'&&v.date>P.today().slice(0,v.date.length))throw Error('미래 날짜는 ‘갈 예정’으로 저장해 주세요.');if(state.entries.some(x=>x.entryId!==e.entryId&&P.duplicate(x,v))&&!f.elements.allowDuplicate.checked){document.getElementById('ppDuplicate').hidden=false;document.getElementById('ppDuplicate').scrollIntoView({block:'center'});return;}const entries=state.entries.filter(x=>x.entryId!==e.entryId).concat(v);if(save({...state,entries})){say('수첩에 저장했어요.');go('#entry='+v.entryId);}}catch(err){say(err.message);status.scrollIntoView({block:'center'});}});
}
function editProfile(){const p=state.profile;app.innerHTML=linkBack()+`<section class="pp-panel pp-settings"><h2>나의 신분 카드</h2><form id="ppProfile" class="pp-form-grid">${field('닉네임','nickname',p.nickname,'maxlength="30"')}${field('처음 좋아한 날','since',p.since,'placeholder="2006 또는 2006-03-12" maxlength="10"')}<p class="pp-help pp-wide">데뷔일인 2006년 3월 12일부터 오늘까지 입력할 수 있어요.<br>2006년·2006년 3월처럼 날짜를 모르면 해당 연도나 월까지만 적어도 괜찮아요.</p><label class="pp-field"><span>카드 색</span><select name="color">${options([['rose','로즈'],['violet','바이올렛'],['teal','그린'],['ink','잉크']],p.color)}</select></label><label class="pp-field"><span>최애 멤버</span><select name="favMember">${options(Object.entries(P.MEMBERS),p.favMember)}</select></label><label class="pp-field"><span>최애 곡</span><select name="favSong">${options([['','선택 안 함'],...catalog.songs.map(s=>[s.title,s.title])],p.favSong)}</select></label>${field('응원 문구','motto',p.motto,'maxlength="120"')}<button class="pp-primary" type="submit">신분 카드 저장</button></form></section>`;const f=document.getElementById('ppProfile');f.addEventListener('input',()=>dirty=true);f.addEventListener('submit',e=>{e.preventDefault();try{const p=P.profile(Object.fromEntries(new FormData(f)));if(p.since>P.today().slice(0,p.since.length))throw Error('입덕일은 오늘 이전으로 입력해 주세요.');if(save({...state,profile:p})){say('신분 카드를 저장했어요.');go('');}}catch(e){say(e.message);}});}
function settings(){let last='';try{last=localStorage.getItem('seeya-passport-backup-date')||'';}catch{}app.innerHTML=linkBack()+`<div class="pp-settings"><section class="pp-panel"><h2>기록을 안전하게 가져가기</h2><p>현재 이 브라우저에 ${state.entries.length}개의 기록이 있어요. 다른 기기에서는 아래 백업 파일을 가져와 이어 쓸 수 있습니다.</p><button data-action="backup" class="pp-primary">백업 파일 내려받기</button><p class="pp-help">마지막 백업 요청: ${E(last||'아직 없어요')}<br>다운로드 후 파일이 실제로 저장됐는지 확인해 주세요.</p><a href="/about/install/">홈 화면에 추가하는 방법 →</a></section><section class="pp-panel"><h2>백업 가져오기</h2><p>내용을 먼저 확인한 다음 적용합니다. 잘못된 파일은 기존 기록을 바꾸지 않습니다.</p><input id="ppImport" type="file" accept="application/json,.json" aria-label="백업 JSON 파일 선택"><div id="ppImportPreview"></div></section><section class="pp-panel pp-danger"><h2>이 브라우저의 수첩 비우기</h2><p>신분 카드와 모든 개인 기록을 삭제합니다. 먼저 백업을 내려받아 주세요.</p><label class="pp-field"><span>계속하려면 ‘삭제’를 입력하세요.</span><input id="ppDeleteAllText" autocomplete="off"></label><button data-action="delete-all">전체 삭제</button></section></div>`;document.getElementById('ppImport').addEventListener('change',async ev=>{pendingImport=null;const preview=document.getElementById('ppImportPreview');preview.textContent='';const file=ev.target.files[0];if(!file)return;try{if(file.size>8*1024*1024)throw Error('8MB 이하의 백업 파일을 선택해 주세요.');const value=P.validate(JSON.parse(await file.text()));if(!preview.isConnected)return;const r=P.review(state,value);pendingImport=value;preview.innerHTML=`<div class="pp-confirm"><p>새 기록 ${r.added}건 · 같은 ID ${r.conflicts}건 · 중복 의심 ${r.suspected}건</p><p>가져올 신분 카드: ${E(value.profile.nickname||'이름 없음')}</p><label class="pp-field"><span>같은 ID 처리</span><select id="ppImportMode"><option value="keep">현재 기록 유지</option><option value="replace">가져온 기록으로 교체</option></select></label><label><input id="ppImportProfile" type="checkbox"> 신분 카드도 가져오기</label><p class="pp-help">다른 ID의 중복 의심 기록은 합치지 않습니다. 적용 전 백업을 권장합니다.</p><button data-action="apply-import" class="pp-primary">확인한 내용 가져오기</button></div>`;}catch(e){say('가져오지 않았습니다. '+(e instanceof SyntaxError?'JSON 백업 파일을 확인해 주세요.':e.message));}});}
function download(blob,name){const u=URL.createObjectURL(blob),a=document.createElement('a');a.href=u;a.download=name;document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(u),30000);}
function backup(){download(new Blob([JSON.stringify({...state,exportedAt:new Date().toISOString()},null,2)],{type:'application/json'}),`seeya-passport-${P.today()}-${state.entries.length}entries.json`);try{localStorage.setItem('seeya-passport-backup-date',P.today());}catch{}say('백업 다운로드를 요청했어요. 파일 저장을 확인해 주세요.');}
function render(){if(location.hash.startsWith('#view=')){viewShare(location.hash.slice(6));return;}document.querySelector('.pp-tabs').hidden=false;document.querySelectorAll('.pp-tabs a').forEach(a=>{const active=location.hash.startsWith('#make')?'#make':location.hash.startsWith('#new')?'#new':location.hash;const selected=new URL(a.href).hash===active;if(selected)a.setAttribute('aria-current','page');else a.removeAttribute('aria-current');});if(P.beforeDebut(state.profile.since))say('기존 입덕일이 데뷔일 이전이에요. 신분 카드에서 날짜를 수정해 주세요. 기존 기록은 그대로 보관했습니다.');renderedHash=location.hash;if(exportURL){URL.revokeObjectURL(exportURL);exportURL='';}pendingImport=null;const h=location.hash.slice(1);if(h==='make'||h.startsWith('make='))Maker(app,state,catalog,say,download,h.startsWith('make=')?h.slice(5):'');else if(h==='share')sharePage();else if(h==='month')monthPage();else if(h==='tour')app.innerHTML=linkBack()+tour();else if(h==='settings')settings();else if(h==='profile')editProfile();else if(h==='new'||h.startsWith('new?'))editor(null,new URLSearchParams(h.split('?')[1]||''));else if(h.startsWith('edit=')){const e=state.entries.find(x=>x.entryId===h.slice(5));if(e)editor(e);else detail(h.slice(5));}else if(h.startsWith('entry='))detail(h.slice(6));else home();}
app.addEventListener('click',ev=>{const b=ev.target.closest('button');if(!b||!store)return;if(b.dataset.action==='copy-summary'){copyText(X.summaryText(state));return;}if(b.dataset.event){go('#new?event='+encodeURIComponent(b.dataset.event));return;}if(b.dataset.page){page=Number(b.dataset.page);home();return;}if(b.dataset.delete){if(save({...state,entries:state.entries.filter(x=>x.entryId!==b.dataset.delete)})){say('기록을 삭제했어요.');go('');}return;}switch(b.dataset.action){case 'view':listMode=!listMode;home();break;case 'show-delete':document.getElementById('ppDelete').hidden=false;break;case 'backup':backup();break;case 'delete-all':if(document.getElementById('ppDeleteAllText').value!=='삭제'){say('확인란에 ‘삭제’를 입력해 주세요.');break;}if(save(P.empty())){say('이 브라우저의 개인 수첩을 비웠어요.');go('');}break;case 'apply-import':if(pendingImport){try{const next=P.merge(state,pendingImport,document.getElementById('ppImportMode').value==='replace',document.getElementById('ppImportProfile').checked);if(save(next)){say('백업을 가져왔어요.');go('');}}catch(e){say(e.message);}}break;}});
app.addEventListener('change',e=>{if(e.target.id==='ppMemberFilter'){filterMember=e.target.value;page=1;home();}if(e.target.id==='ppKindFilter'){filterKind=e.target.value;page=1;home();}if(e.target.id==='ppYearFilter'){filterYear=e.target.value;page=1;home();}});
function confirmDiscard(leave){
 if(document.getElementById('ppDiscard'))return;
 const panel=document.createElement('div');panel.id='ppDiscard';panel.className='pp-discard';panel.setAttribute('role','dialog');panel.setAttribute('aria-modal','true');panel.setAttribute('aria-labelledby','ppDiscardTitle');
 panel.innerHTML='<div class="pp-panel"><h2 id="ppDiscardTitle">아직 저장하지 않은 입력이 있어요.</h2><p>이동하면 지금 작성 중인 내용은 사라집니다.</p><div class="pp-actions"><button id="ppStay">계속 작성</button><button id="ppLeave">저장하지 않고 이동</button></div></div>';
 const prior=document.activeElement;document.querySelector('.passport-page').append(panel);
 const stay=panel.querySelector('#ppStay'),exit=panel.querySelector('#ppLeave');stay.focus();
 stay.onclick=()=>{panel.remove();prior?.focus();};exit.onclick=()=>{panel.remove();dirty=false;leave();};
 panel.addEventListener('keydown',e=>{if(e.key==='Escape'){e.preventDefault();stay.click();}if(e.key==='Tab'){e.preventDefault();(document.activeElement===stay?exit:stay).focus();}});
}
document.addEventListener('click',e=>{if(!dirty)return;const a=e.target.closest('a');if(a){e.preventDefault();confirmDiscard(()=>location.href=a.href);}});
window.addEventListener('beforeunload',e=>{if(dirty){e.preventDefault();e.returnValue='';}});
window.addEventListener('hashchange',()=>{if(dirty){const target=location.hash;history.replaceState(null,'',location.pathname+location.search+renderedHash);confirmDiscard(()=>{location.hash=target;});return;}dirty=false;if(!store&&!location.hash.startsWith('#view=')){try{store=P.storage(localStorage);state=store.get();}catch{say('수첩 저장소를 열지 못했어요.');return;}}render();});
window.addEventListener('storage',e=>{if(e.key===P.KEY)say('다른 창에서 수첩이 변경됐어요. 작성 중인 내용을 복사한 뒤 새로고침해 주세요.');});
try{if(location.hash.startsWith('#view=')){viewShare(location.hash.slice(6));}else{store=P.storage(localStorage);state=store.get();render();}}catch(e){say('저장소를 열지 못했습니다. 기존 기록을 덮어쓰지 않았어요.');app.innerHTML='<section class="pp-panel"><h2>기록 보호를 위해 수첩을 멈췄어요.</h2><p>브라우저의 사이트 저장 허용 여부를 확인해 주세요. 저장 내용이 손상된 경우 원본을 먼저 내려받아 보관할 수 있습니다.</p><button id="ppRecover">저장 원본 내려받기</button></section>';document.getElementById('ppRecover').onclick=()=>{try{const raw=localStorage.getItem(P.KEY);if(raw)download(new Blob([raw],{type:'text/plain'}),'seeya-passport-recovery.txt');else say('저장된 원본이 없습니다.');}catch{say('저장소에 접근할 수 없습니다. 브라우저 설정을 확인해 주세요.');}};}
if('serviceWorker' in navigator&&window.isSecureContext){navigator.serviceWorker.register('/passport/sw.js',{scope:'/passport/test/',updateViaCache:'none'}).then(reg=>{const report=()=>{document.getElementById('ppOffline').textContent=reg.active?'오프라인 수첩이 준비됐어요. 공개 일정은 마지막 저장본을 사용합니다.':'오프라인 수첩을 준비하고 있어요. 이 화면을 잠시 열어 두세요.';};report();if(reg.installing)reg.installing.addEventListener('statechange',report);reg.addEventListener('updatefound',()=>reg.installing?.addEventListener('statechange',report));}).catch(()=>document.getElementById('ppOffline').textContent='오프라인 준비를 못 했어요. 연결된 상태에서 다시 열어 주세요.');}else document.getElementById('ppOffline').textContent='이 환경은 오프라인 수첩을 지원하지 않습니다.';

},
"src/shared/passport.js":function(module,exports,__require){
'use strict';
const KEY='seeya-passport-v1';
const DEBUT='2006-03-12';
const defaultStatus=(date,day=today())=>date&&date<day.slice(0,date.length)?'done':'planned';
const beforeDebut=since=>!!since&&since<DEBUT.slice(0,since.length);
const KINDS={concert:'공연 관람',visit:'장소 방문',event:'팬 행사',story:'나의 씨야 이야기'};
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
 if(e.status==='done'&&dt>today().slice(0,dt.length))throw Error('미래 날짜는 ‘갈 예정’으로 저장해 주세요.');
 const time=text(e.time||'',5);if(time&&!/^([01]\d|2[0-3]):[0-5]\d$/.test(time))throw Error('시간을 확인해 주세요.');
 for(const k of ['createdAt','updatedAt'])if(typeof e[k]!=='string'||!/^\d{4}-/.test(e[k])||!Number.isFinite(Date.parse(e[k])))throw Error('기록 저장 시각이 올바르지 않습니다.');
 const snap=e.snapshot||{};
 const songs=e.songs||[],links=e.links||[];
 if(!Array.isArray(songs)||songs.length>400||songs.some(s=>typeof s!=='string'||s.length>180))throw Error('곡 목록을 확인해 주세요.');
 if(!Array.isArray(links)||links.length>8)throw Error('링크는 최대 8개까지 저장할 수 있어요.');
 const checkedLinks=links.map(l=>{const raw=text(l.url,2000),u=new URL(raw);if(u.protocol!=='https:'||u.username||u.password)throw Error('링크는 https:// 주소로 입력해 주세요.');return {url:u.href,label:text(l.label||'',120)};});
 return {entryId:e.entryId,kind:e.kind,status:e.status,title,date:dt,datePrecision:precision(dt),time,members:[...new Set(e.members)],eventId:text(e.eventId||'',160),placeId:text(e.placeId||'',160),archiveId:text(e.archiveId||'',160),songs:e.kind==='concert'?[...new Set(songs)]:[],links:checkedLinks,seat:text(e.seat||'',100),companions:text(e.companions||'',120),note:text(e.note||'',4000),snapshot:{title:text(snap.title||'',300),place:text(snap.place||'',300),address:text(snap.address||'',400)},createdAt:e.createdAt,updatedAt:e.updatedAt};
}
function validate(input,allowLegacyProfile=false){
 if(!input||input.schemaVersion!==1||!Array.isArray(input.entries)||input.entries.length>2000)throw Error('지원하지 않는 백업이거나 기록이 2,000건을 넘습니다.');
 const entries=input.entries.map(entry);if(new Set(entries.map(e=>e.entryId)).size!==entries.length)throw Error('파일 안에 동일한 기록 ID가 반복됩니다.');
 return {schemaVersion:1,profile:profile(input.profile,allowLegacyProfile),entries};
}
const empty=()=>({schemaVersion:1,profile:profile(),entries:[]});
function duplicate(a,b){return a.kind===b.kind&&a.date===b.date&&a.time===b.time&&((a.eventId&&a.eventId===b.eventId)||(a.archiveId&&a.archiveId===b.archiveId)||(a.placeId&&a.placeId===b.placeId)||(!a.eventId&&!a.placeId&&!b.eventId&&!b.placeId&&a.title===b.title));}
function review(current,incoming){return {added:incoming.entries.filter(e=>!current.entries.some(x=>x.entryId===e.entryId)).length,conflicts:incoming.entries.filter(e=>current.entries.some(x=>x.entryId===e.entryId)).length,suspected:incoming.entries.filter(e=>current.entries.some(x=>x.entryId!==e.entryId&&duplicate(x,e))).length};}
function merge(current,incoming,replace=false,replaceProfile=false){const rows=new Map(current.entries.map(e=>[e.entryId,e]));for(const e of incoming.entries)if(replace||!rows.has(e.entryId))rows.set(e.entryId,e);return validate({schemaVersion:1,profile:replaceProfile?incoming.profile:current.profile,entries:[...rows.values()]});}
function completed(e,day=today()){return e.status==='done'&&(!e.date||e.date<=day.slice(0,e.date.length));}
function summary(entries,day=today()){const done=entries.filter(e=>completed(e,day));return {concert:done.filter(e=>e.kind==='concert').length,visit:done.filter(e=>e.kind==='visit').length,event:done.filter(e=>e.kind==='event').length,story:done.filter(e=>e.kind==='story').length};}
function storage(adapter){let raw=adapter.getItem(KEY),state=raw?validate(JSON.parse(raw),true):empty();return {get:()=>state,raw:()=>raw,save(next){const checked=validate(next);if(adapter.getItem(KEY)!==raw)throw Error('다른 창에서 수첩이 변경됐습니다. 입력 내용을 복사한 뒤 새로고침해 주세요.');const value=JSON.stringify(checked);adapter.setItem(KEY,value);raw=value;state=checked;return state;}};}
module.exports={KEY,DEBUT,defaultStatus,beforeDebut,KINDS,MEMBERS,COLORS,esc,today,date,precision,dateLabel,profile,entry,validate,empty,duplicate,review,merge,completed,summary,storage};

},
"src/client/passport-picker.js":function(module,exports,__require){
'use strict';
// Editable combobox with manual selection (WAI-ARIA APG).
module.exports=function picker(input,list,info,events,onChoose,esc){
 let matches=[],active=-1;
 const close=()=>{list.hidden=true;input.setAttribute('aria-expanded','false');input.removeAttribute('aria-activedescendant');active=-1;};
 function mark(i){active=i;[...list.children].forEach((el,n)=>el.setAttribute('aria-selected',String(n===i)));if(i>=0){input.setAttribute('aria-activedescendant',list.children[i].id);list.children[i].scrollIntoView({block:'nearest'});}else input.removeAttribute('aria-activedescendant');}
 function show(){const q=input.value.trim().toLowerCase(),terms=q.split(/\s+/).filter(Boolean);const all=events.filter(e=>terms.every(t=>(e.date+' '+e.title+' '+e.venue+' '+(e.city||'')).toLowerCase().includes(t)));matches=all.slice(0,30);active=-1;input.removeAttribute('aria-activedescendant');list.innerHTML=matches.map((e,i)=>`<div role="option" aria-selected="false" id="pp-option-${i}" data-index="${i}"><span>${esc(e.date)}${e.time?' · '+esc(e.time):''}</span><strong>${esc(e.title)}</strong><small>${esc(e.venue||'장소 정보 없음')}</small></div>`).join('');list.hidden=!matches.length;input.setAttribute('aria-expanded',String(!!matches.length));info.textContent=all.length?(all.length>30?`${all.length}개 중 30개 표시 · 검색어로 좁혀 주세요.`:`${all.length}개 일정 · 선택하면 기록에 채워집니다.`):'일치하는 일정이 없어요. 아래에 직접 기록할 수 있습니다.';}
 function choose(i){if(!matches[i])return;const e=matches[i];input.value='';close();onChoose(e);info.textContent='일정을 선택했어요. 제목과 날짜를 확인해 주세요.';}
 input.addEventListener('input',show);input.addEventListener('focus',show);input.addEventListener('click',()=>{if(list.hidden)show();});
 input.addEventListener('keydown',e=>{if(e.key==='ArrowDown'||e.key==='ArrowUp'){e.preventDefault();if(list.hidden)show();if(matches.length)mark(active<0?(e.key==='ArrowDown'?0:matches.length-1):Math.max(0,Math.min(matches.length-1,active+(e.key==='ArrowDown'?1:-1))));}else if(e.key==='Enter'&&!list.hidden){e.preventDefault();if(active>=0)choose(active);}else if(e.key==='Escape'){e.preventDefault();close();}else if(e.key==='Tab')close();});
 input.addEventListener('blur',close);
 list.addEventListener('pointerdown',e=>{if(e.target.closest('[role=option]'))e.preventDefault();});
 list.addEventListener('click',e=>{const row=e.target.closest('[role=option]');if(row)choose(Number(row.dataset.index));});
 return {close};
};

},
"src/shared/passport-extra.js":function(module,exports,__require){
'use strict';
const P=__require("src/shared/passport.js");
function songs(entries){return [...new Set(entries.filter(e=>e.kind==='concert'&&P.completed(e)).flatMap(e=>e.songs||[]))];}
function tourEntries(t,entries){return entries.filter(e=>e.kind==='concert'&&P.completed(e)&&e.date===t.date&&(e.eventId===t.eventId||e.archiveId===t.archiveId));}
function firstSongs(entry,entries){const prior=entries.filter(e=>e.entryId!==entry.entryId&&e.kind==='concert'&&P.completed(e)&&e.date&&entry.date&&(e.date<entry.date||e.date===entry.date&&e.createdAt<entry.createdAt));const heard=new Set(prior.flatMap(e=>e.songs||[]));return (entry.songs||[]).filter(id=>!heard.has(id));}
function summaryText(state){const n=P.summary(state.entries);return `WITH YOU PASSPORT · 공연 ${n.concert}회 · 장소 ${n.visit}회 · 팬 행사 ${n.event}회 · 라이브로 들은 곡 ${songs(state.entries).length}곡`;}
function url(value){if(!value)return '';const u=new URL(value);if(u.protocol!=='https:'||u.username||u.password)throw Error('링크는 https:// 주소로 입력해 주세요.');return u.href;}
function youtube(value){try{const u=new URL(value),host=u.hostname.replace(/^www\./,'');const id=host==='youtu.be'?u.pathname.slice(1):['youtube.com','m.youtube.com'].includes(host)?(u.searchParams.get('v')||u.pathname.match(/^\/(?:shorts|embed)\/([^/]+)/)?.[1]):'';return /^[\w-]{11}$/.test(id||'')?id:'';}catch{return '';}}
function publicSummary(state,nickname=false){const done=state.entries.filter(e=>P.completed(e)).sort((a,b)=>b.date.localeCompare(a.date));return {v:1,n:nickname?state.profile.nickname:'',s:state.profile.since,c:P.summary(done),r:done.slice(0,80).map(e=>({k:e.kind,d:e.date,t:e.title.slice(0,100),i:e.eventId,a:e.archiveId,z:(e.songs||[]).length}))};}
function checkSummary(x){if(!x||x.v!==1||!Array.isArray(x.r)||x.r.length>80)throw Error('올바른 공유 요약이 아닙니다.');const str=(v,n)=>{if(typeof v!=='string'||v.length>n)throw Error('공유 내용이 너무 깁니다.');return v;};const count=v=>{if(!Number.isInteger(v)||v<0||v>2000)throw Error('공유 집계를 확인할 수 없습니다.');return v;};return {v:1,n:str(x.n,30),s:P.profile({since:str(x.s,10)}).since,c:Object.fromEntries(Object.keys(P.KINDS).map(k=>[k,count(x.c?.[k])])),r:x.r.map(r=>({k:Object.hasOwn(P.KINDS,r.k)?r.k:(()=>{throw Error('기록 종류 오류');})(),d:P.date(str(r.d,10)),t:str(r.t,100),i:str(r.i,160),a:str(r.a,160),z:count(r.z)}))};}
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
const P=__require("src/shared/passport.js"),X=__require("src/shared/passport-extra.js"),E=P.esc;
module.exports=function maker(app,state,catalog,say,download,entryId=''){
 const templates={profile:'프로필',lock:'잠금화면',home:'홈화면',ticket:'티켓',review:'결산',stats:'집계'};
 const colors={ink:'#1f1b24',rose:'#d6487f',violet:'#6b5bd1',teal:'#2f8f7a',pink:'#f7dce7',cream:'#fcf8f5'};
 let type=entryId?'ticket':'lock',blob=null,serial=0;
 const opts=(items,selected)=>items.map(([v,n])=>`<option value="${E(v)}" ${v===selected?'selected':''}>${E(n)}</option>`).join('');
 app.innerHTML=`<a class="pp-back" href="/passport/test/">← 내 패스포트</a><section class="pp-panel pp-maker"><h2>이미지 만들기</h2><div class="pp-template-tabs" role="group" aria-label="이미지 템플릿">${Object.entries(templates).map(([v,n])=>`<button data-template="${v}" aria-pressed="${v===type}">${n}</button>`).join('')}</div><div class="pp-maker-layout"><div class="pp-canvas-wrap"><canvas id="ppCanvas" aria-label="내 패스포트 이미지 미리보기"></canvas><p id="ppImageSize" class="pp-help"></p></div><form id="ppMakerControls" class="pp-form-grid"><label class="pp-field"><span>색</span><select name="color">${opts(Object.keys(colors).map(k=>[k,{ink:'검정',rose:'로즈',violet:'바이올렛',teal:'틸',pink:'핑크',cream:'크림'}[k]]),'ink')}</select></label><label class="pp-field" id="ppDevice"><span>화면 크기</span><select name="device">${opts([['iphone','iPhone 일반 · 1170×2532'],['max','Pro Max · 1290×2796'],['android','Android · 1440×3120']],'iphone')}</select></label><label class="pp-field pp-wide"><span>캐릭터 그림</span><select name="character">${opts([['','없음'],...catalog.characters.map((c,i)=>[c.id,'캐릭터 일러스트 '+(i+1)])],'')}</select></label><label class="pp-field pp-wide"><span>문구</span><input name="motto" maxlength="80" value="${E(state.profile.motto)}" placeholder="함께한 기억, 앞으로의 우리"></label><label class="pp-field pp-wide" id="ppImageEntry"><span>기록 선택</span><select name="entry">${opts(state.entries.map(e=>[e.entryId,P.dateLabel(e.date)+' · '+e.title]),entryId||state.entries[0]?.entryId)}</select></label><label class="pp-field pp-wide" id="ppReviewMonth"><span>결산 기간</span><select name="period"><option value="month">월간</option><option value="year">연간</option></select><input type="month" name="month" value="${P.today().slice(0,7)}"></label><label class="pp-checks pp-wide"><input name="nickname" type="checkbox"> 닉네임 포함</label><label class="pp-checks pp-wide" id="ppSeatOpt"><input name="seat" type="checkbox"> 좌석 정보 포함</label><p class="pp-help pp-wide">메모·동행인·첨부 링크는 이미지에 포함하지 않습니다. 저장 전에 미리보기를 확인해 주세요.</p><div class="pp-actions pp-wide"><button type="button" id="ppSaveImage" class="pp-primary">이미지 저장</button><button type="button" id="ppShareMade">이미지 공유</button></div></form></div></section>`;
 const f=document.getElementById('ppMakerControls'),canvas=document.getElementById('ppCanvas');
 const text=(g,s,x,y,size,maxWidth,lineHeight,maxLines=4)=>{g.font=`${size>=44?'600 ':''}${size}px Arial, sans-serif`;let line='',row=0;for(const ch of String(s)){if(g.measureText(line+ch).width>maxWidth&&line){g.fillText(line,x,y+row*lineHeight);row++;if(row>=maxLines)return;line='';}line+=ch;}if(line)g.fillText(line,x,y+row*lineHeight);};
 async function draw(){const run=++serial;blob=null;const wallpaper=['lock','home'].includes(type),size=wallpaper?{iphone:[1170,2532],max:[1290,2796],android:[1440,3120]}[f.elements.device.value]:type==='ticket'?[1080,1350]:type==='review'?[1080,1920]:[1080,1080];canvas.width=size[0];canvas.height=size[1];const g=canvas.getContext('2d'),w=canvas.width,h=canvas.height,scale=w/1080;g.scale(scale,scale);const H=h/scale,bg=colors[f.elements.color.value],light=['pink','cream'].includes(f.elements.color.value),fg=light?'#29232a':'#fff7fb',accent=light?'#b43764':'#f0aeca';g.fillStyle=bg;g.fillRect(0,0,1080,H);g.fillStyle=fg;
 document.getElementById('ppDevice').hidden=!wallpaper;document.getElementById('ppImageEntry').hidden=type!=='ticket';document.getElementById('ppSeatOpt').hidden=type!=='ticket';document.getElementById('ppReviewMonth').hidden=type!=='review';
 const n=P.summary(state.entries),years=state.profile.since?Number(P.today().slice(0,4))-Number(state.profile.since.slice(0,4))+1:0;
 let y=wallpaper?(type==='lock'?H*.44:H*.64):100;
 text(g,'WITH YOU PASSPORT'+(f.elements.nickname.checked&&state.profile.nickname?' · '+state.profile.nickname:''),76,y,24,920,32,1);y+=90;
 if(type==='ticket'){const e=state.entries.find(e=>e.entryId===f.elements.entry.value);if(e){text(g,e.title,76,y,54,920,76);y+=320;text(g,e.snapshot.place,76,y,30,920,45);y+=120;text(g,P.dateLabel(e.date)+(e.time?' · '+e.time:''),76,y,34,920,50);y+=100;if(f.elements.seat.checked)text(g,'좌석 · '+(e.seat||'미입력'),76,y,28,920,42);y+=75;text(g,'들은 곡 '+(e.songs||[]).length+'곡 · '+(e.status==='planned'?'갈 예정':'다녀왔어요'),76,y,30,920,44);g.strokeStyle=accent;g.setLineDash([10,10]);g.beginPath();g.moveTo(76,660);g.lineTo(1000,660);g.stroke();g.setLineDash([]);}else text(g,'먼저 기록을 남겨 주세요.',76,y,40,920,60);}
 else if(type==='lock'||type==='home'){text(g,'THE FAN · TOUR STAMPS',76,y,28,920,40);y+=85;catalog.tour.forEach((t,i)=>{const x=160+(i%4)*250,cy=y+Math.floor(i/4)*175,done=X.tourEntries(t,state.entries).length>0;g.beginPath();g.arc(x,cy,64,0,Math.PI*2);g.strokeStyle=accent;g.fillStyle=done?'#c84a74':bg;g.setLineDash(done?[]:[6,7]);g.fill();g.stroke();g.setLineDash([]);g.fillStyle=done?'#fff':fg;g.textAlign='center';text(g,t.label,x,cy+5,28,150,35,1);text(g,t.date.slice(5).replace('-','.'),x,cy-28,18,150,25,1);g.textAlign='left';});g.fillStyle=fg;y+=310;const next=catalog.tour.filter(t=>t.date>=P.today()).sort((a,b)=>a.date.localeCompare(b.date))[0];if(next)text(g,`NEXT · ${next.label} ${next.date} · D-${Math.round((Date.parse(next.date)-Date.parse(P.today()))/86400000)}`,76,y,26,920,40);}
 else if(type==='profile'){text(g,f.elements.nickname.checked?state.profile.nickname||'WITH YOU':'WITH YOU',76,y,64,920,82);y+=140;g.fillStyle=accent;text(g,years?'위듀 '+years+'년차':'우리의 첫 페이지',76,y,62,920,80);y+=110;g.fillStyle=fg;text(g,P.MEMBERS[state.profile.favMember]||'씨야 완전체',76,y,32,920,46);y+=60;text(g,state.profile.favSong||'',76,y,30,920,45);}
 else {let rows=state.entries;if(type==='review'){const period=f.elements.period.value==='year'?f.elements.month.value.slice(0,4):f.elements.month.value;rows=rows.filter(e=>e.date.startsWith(period));text(g,period+' · '+(f.elements.period.value==='year'?'올해의 나':'이달의 나'),76,y,52,920,80);}else text(g,'함께 쌓은 순간들',76,y,54,920,80);const counts=P.summary(rows);y+=145;for(const [v,label] of [[counts.concert,'공연 관람'],[counts.visit,'장소 방문'],[X.songs(rows).length,'라이브로 들은 곡']]){g.fillStyle=accent;text(g,String(v),76,y,76,920,90);g.fillStyle=fg;text(g,label,250,y,32,710,48);y+=140;}if(type==='review'){rows.filter(e=>P.completed(e)).slice(0,4).forEach(e=>{text(g,P.dateLabel(e.date)+' · '+e.title,76,y,26,920,40,2);y+=100;});}}
 const char=catalog.characters.find(c=>c.id===f.elements.character.value);if(char){try{const img=new Image();img.src=char.image;await img.decode();if(run!==serial)return;const maxH=wallpaper?190:180,ratio=Math.min(380/img.width,maxH/img.height);g.drawImage(img,680, H-110-img.height*ratio,img.width*ratio,img.height*ratio);}catch{say('캐릭터 그림을 불러오지 못했어요. 연결된 상태에서 다시 선택해 주세요.');}}
 g.fillStyle=fg;text(g,f.elements.motto.value,76,H-140,28,char?550:920,42,2);g.fillStyle=accent;text(g,'SEEYA ARCHIVE · 나의 기억으로 남긴 기록',76,H-50,18,920,28,1);document.getElementById('ppImageSize').textContent=`${w} × ${h} PNG · ${templates[type]}`;await new Promise(resolve=>canvas.toBlob(b=>{if(run===serial)blob=b;resolve();},'image/png'));
 }
 app.querySelectorAll('[data-template]').forEach(b=>b.onclick=()=>{type=b.dataset.template;app.querySelectorAll('[data-template]').forEach(x=>x.setAttribute('aria-pressed',String(x===b)));draw();});f.addEventListener('input',()=>draw());f.onsubmit=e=>e.preventDefault();document.getElementById('ppSaveImage').onclick=()=>{if(blob)download(blob,`with-you-${type}.png`);else say('이미지를 준비 중이에요. 잠시 후 다시 눌러 주세요.');};document.getElementById('ppShareMade').onclick=async()=>{if(!blob)return;const file=new File([blob],`with-you-${type}.png`,{type:'image/png'});if(navigator.canShare?.({files:[file]})){try{await navigator.share({files:[file]});}catch(e){if(e.name!=='AbortError')say('공유 대신 이미지 저장을 이용해 주세요.');}}else download(blob,file.name);};draw();
};

}
};const cache={};function __require(id){if(cache[id])return cache[id].exports;const m=cache[id]={exports:{}};modules[id](m,m.exports,__require);return m.exports;}__require("src/client/passport.js");})();
