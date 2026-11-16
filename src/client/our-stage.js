(function(){
'use strict';
const isTest=location.pathname.replace(/\/$/,'')==='/game/our-stage/test';
const baseModel=isTest?require('../shared/our-stage').forTest():require('../shared/our-stage');
const M=require('../shared/our-stage-simple')(baseModel),root=document.getElementById('ourStage');
if(!root)return;
const testTools=location.pathname.replace(/\/$/,'')==='/game/our-stage/test'?require('../shared/our-stage-test-tools')(M):null;
const checkpointKey='seeya-our-stage-before-test-jump-v1';
const key='seeya-our-stage-local-v1',$=q=>root.querySelector(q),art='/images/game/our-stage/';
const optimizedImages=require('../data/our-stage-optimized-images.json');
const optimized=html=>html.replace(/\/images\/game\/our-stage\/[^\s"'<>]+\.png/g,path=>optimizedImages[path]||path);
let vcrUI=null,ticketUI=null;
let activeChallenge=null,afterChallenge=null,returnFocus=null,blocked=false;
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const outfits=require('../data/our-stage-outfits.json');
const {nameTag}=require('../shared/our-stage-name-tag');
const outfitKey='seeya-our-stage-outfit-v1';
let outfitId='base';
try{const saved=localStorage.getItem(outfitKey);if(outfits.some(x=>x.id===saved))outfitId=saved;}catch{}
const styles=[...outfits,...M.shop],preview={},layers=require('../data/our-stage-layers.json');
const styleId=(id,part='clothes')=>preview[id]?.[part]||(part==='hair'?s.hair:s.equipped)[id];
const outfit=(id,part='clothes')=>styles.find(o=>o.id===styleId(id,part));
let artSequence=0;
const sprite=(id,override)=>{
 const filterId='stage-sprite-'+(++artSequence);
 const clothing=override||outfit(id),hair=override||outfit(id,'hair'),head=layers[hair.id],body=layers[clothing.id],h=head.members[id],b=body.members[id];
 const scale=320/(h.chin-h.head[1]),hw=h.head[2]*scale,hh=h.head[3]*scale;
 const bh=320,bw=b.body[2]*bh/b.body[3],headX=(440-hw)/2,headY=25,bodyY=340;
 const part=(data,box,x,y,w,height)=>`<svg x="${x}" y="${y}" width="${w}" height="${height}" viewBox="${box.join(' ')}" overflow="hidden" preserveAspectRatio="none"><image href="${data.image}" width="${data.width}" height="${data.height}"/></svg>`;
 return `<svg class="member-sprite" viewBox="0 0 440 680" role="img" aria-label="${M.members.find(x=>x.id===id).name} · 의상 ${clothing.name} · 헤어 ${hair.name}" data-clothes="${clothing.id}" data-hair="${hair.id}"><defs><filter id="${filterId}" color-interpolation-filters="sRGB"><feComponentTransfer><feFuncA type="discrete" tableValues="0 0 0 0 0 0 0 1"/></feComponentTransfer></filter></defs><g filter="url(#${filterId})"><g class="sprite-hair">${part({...head,image:head.headImage||head.image},h.head,headX,headY,hw,hh)}</g><g class="sprite-body">${part(body,b.body,(440-bw)/2,bodyY,bw,bh)}</g></g>${clothing.id==='practice'?nameTag(id):''}</svg>`;
};
const portrait=id=>`<div class="member-crop">${sprite(id)}</div>`;
const outfitLineup=o=>`<div class="outfit-sheet mapped-outfit" aria-label="${esc(o.name)} 멤버별 의상">${M.memberIds.map(id=>`<figure>${sprite(id,o)}<figcaption>${M.members.find(m=>m.id===id).name}</figcaption></figure>`).join('')}</div>`;
const outfitSummary=()=>M.memberIds.map(id=>M.members.find(m=>m.id===id).name+' · '+outfit(id).name+(preview[id]?' (미리입기)':'')).join(' / ');
const glowstick=()=>`<svg viewBox="0 0 48 80" aria-hidden="true" class="seeya-lightstick"><image href="${art}official-lightstick.svg" width="48" height="80"/></svg>`;
const stageArt=(live=false,finale=false,lead=0)=>`<figure class="stage-art${live?' live':''}${finale?' finale':''}" aria-label="${finale?'씨야 응원봉이 객석을 채우는 4집 피날레':'세 멤버의 도트 공연 무대'}"><div class="stage-beams" aria-hidden="true"><i></i><i></i><i></i></div><div class="stage-banner">${finale?'FIRST, AGAIN · 우리의 빛':'SEEYA · OUR STAGE'}</div><div class="stage-trio">${M.memberIds.map((id,i)=>`<div class="stage-performer ${lead%3===i?'lead':''}" style="--beat:${i*-.19}s">${sprite(id)}<svg class="stage-mic" viewBox="0 0 36 60" aria-hidden="true" shape-rendering="crispEdges"><path fill="#f3c8a6" d="M3 35h9v-7h9v20H3z"/><path fill="#252335" d="M17 14h9v31h-9z"/><path fill="#d8d2e4" d="M13 4h17v18H13z"/><path fill="#8d859b" d="M13 9h17v4H13z"/></svg></div>`).join('')}</div><div class="stage-confetti" aria-hidden="true">${finale?Array.from({length:18},(_,i)=>`<i style="--x:${(i*37)%100}%;--delay:${i*-.23}s"></i>`).join(''):''}</div><div class="stage-audience" aria-hidden="true">${Array.from({length:finale?54:18},(_,i)=>`<span style="--beat:${(i%9)*-.13}s;--rise:${i%3*5}px">${glowstick()}</span>`).join('')}</div><figcaption>${finale?'함께 모은 노래, 함께 밝히는 객석':'한 걸음씩, 세 목소리가 만드는 무대'}${M.memberIds.some(id=>styleId(id)==='rebloom')?' · 현재 세 멤버 의상 재해석':''}</figcaption></figure>`;

let wardrobeView='closet',shopMember='br',coinDay=M.kstDay();
const headings=['연습실','노래','이야기','추억','공연','의상·배지'], icons=['♫','♬','▤','♡','✧','◇'];
let decoratingCard=null,badgePage=0;
let cardMember='all',cardKind='all',cardOnlyOwned=false,cardPage=0,showHeld=false;
let concertQuery='',concertAlbum='all',concertKind='all',pendingImport=null;
let scene=0,selectedAlbum='first-mind',badgeFilter='all',storyFilter='all',storyAlbum='all',track='scent',s=M.fresh(),warn='',showTimer,showing=false;
function read(){const raw=localStorage.getItem(key);if(!raw)return M.fresh();return M.loadSave(raw);}
let needsSaveMigration=false,legacyOutfitMigration=false;
try{const oldVersion=JSON.parse(localStorage.getItem(key)||'null')?.version;needsSaveMigration=oldVersion<11||!JSON.parse(localStorage.getItem(key)||'null')?.simple;legacyOutfitMigration=oldVersion<5;s=read();if(M.simpleMode){try{const raw=localStorage.getItem(key);if(raw&&!JSON.parse(raw).simple&&!localStorage.getItem(key+'-before-simple'))localStorage.setItem(key+'-before-simple',raw);}catch{}}if(isTest&&s.active&&s.active.end>Date.now()+1000){s.active.end=Date.now()+1000;localStorage.setItem(key,JSON.stringify(s));}}catch{blocked=true;warn='저장 데이터를 읽을 수 없어요. 저장 관리에서 백업을 복원할 수 있어요.';}
try{
 const raw=localStorage.getItem(key);
 if(raw&&needsSaveMigration&&!blocked){
  if(legacyOutfitMigration&&M.outfitOwned(s,outfitId))M.memberIds.forEach(m=>M.equip(s,m,outfitId));
  localStorage.setItem(key,JSON.stringify(s));
 }
}catch{}
const title=id=>M.songs.find(x=>x.id===id).title;
const has=id=>M.has(s,id), ready=id=>M.ready(s,id), open=id=>M.open(s,id),pct=id=>M.percent(s,id);
function say(msg){$('#feedback').textContent=store?.dirty?saveMessage():msg;}
let store;try{store=require('./our-stage-storage')({storage:localStorage,key,load:M.loadSave});}catch{blocked=true;}
function saveMessage(){return store?.conflict?'다른 탭의 기록과 충돌했어요. 현재 기록을 백업한 뒤 저장 관리에서 선택해 주세요.':'변경 내용을 저장하지 못했어요. 이 화면을 유지하고 저장을 재시도하거나 백업해 주세요.';}
function saveNotice(){const box=$('#saveAlert');if(!box)return;box.hidden=!store?.dirty;if(store?.dirty){box.innerHTML='<p>'+saveMessage()+'</p>'+button('저장 재시도','save-retry')+button('현재 기록 백업','export')+button('저장 관리','storage');say('');}}
let savingAction=false;const saveFailure=new Error('stage-save-failed');
const albumSize=M.songs.length, albumBadge='첫 번째 앨범을 펼치다';

let lastStories=new Set(M.storyEntries.filter(e=>M.storyAvailable(s,e.id)).map(e=>e.id));
let lastCards=new Set(M.memberCards(s).filter(c=>c.earned).map(c=>c.id));
let lastBadges=new Set(M.badges(s).filter(b=>b.earned).map(b=>b.id)),noticeTimer;
function updateCollectionNotice(){
 const earned=M.badges(s).filter(b=>b.earned),added=earned.filter(b=>!lastBadges.has(b.id));
 lastBadges=new Set(earned.map(b=>b.id));
 const newStories=M.storyEntries.filter(e=>M.storyAvailable(s,e.id)&&!lastStories.has(e.id));
 lastStories=new Set(M.storyEntries.filter(e=>M.storyAvailable(s,e.id)).map(e=>e.id));
 const addedCards=M.memberCards(s).filter(c=>c.earned&&!lastCards.has(c.id));lastCards=new Set(M.memberCards(s).filter(c=>c.earned).map(c=>c.id));
 if(added.length||newStories.length||addedCards.length){const notice=$('#albumNotice');notice.textContent=(addedCards.length?'도트 카드 '+addedCards.length+'장을 얻었어요. ':'')+(added.length?'✦ '+added.map(b=>b.name).join(' · ')+' 배지를 얻었어요. ':'')+(newStories.length?'이야기 '+newStories.length+'개가 열렸어요. 이야기 탭에서 만나보세요.':'');clearTimeout(noticeTimer);noticeTimer=setTimeout(()=>{notice.textContent='';},8000);}
}

function save(){if(!M.valid(s)){warn='기록의 형식을 확인하지 못해 저장을 멈췄어요. 현재 화면을 유지하고 백업해 주세요.';say(warn);if(savingAction)throw saveFailure;return false;}if(blocked||!store){warn='저장소를 사용할 수 없어요. 현재 화면을 닫지 말고 백업해 주세요.';say(warn);if(savingAction)throw saveFailure;return false;}const ok=store.write(s);saveNotice();if(!ok){if(savingAction)throw saveFailure;return false;}warn='';updateCollectionNotice();return true;}
function button(label,action,value='',kind='',disabled=false){return `<button class="${kind}" data-action="${action}" data-value="${value}" ${disabled?'disabled':''}>${label}</button>`;}
function link(label,url){return `<a target="_blank" rel="noopener noreferrer" href="${url}">${label} ↗</a>`;}
function panel(body,cls=''){return `<article class="panel ${cls}">${body}</article>`;}
function mark(t){return `<small class="eyebrow">${t}</small>`;}
function bars(n){return `<div class="bar"><b style="width:${n}%"></b></div>`;}
function goal(){
 if(!ready('scent'))return ['첫 노래를 준비해요','세 가지 연습을 마치면 다음 곡이 열려요.','여인의 향기 연습하기','pick','scent'];
 if(!has('first'))return ['첫 무대의 기억','연습한 노래로 첫 무대를 열어보세요.','첫 무대 열기','perform','first'];
 if(!has('album'))return ['첫 앨범을 펼쳐요','앨범의 이야기를 간직하고 다음 여정을 준비해요.','1집 이야기 열기','album',''];
 for(const a of M.albums){if(!M.albumUnlocked(s,a.id))continue;const t=a.tracks.find(t=>open(t.id)&&!ready(t.id));if(t)return [title(t.id)+' 연습하기','연습 완료 → 다음 곡 자동 해금','연습 이어가기','pick',t.id];}
 const next=M.albums.find(a=>M.albumAvailable(s,a.id));if(next)return ['다음 앨범으로',next.name+'의 새 의상을 받아요.','앨범 열기','unlock-album',next.id];
 for(const a of M.albums.slice(1)){const req=M.albumRequirements(s,a.id);if(!M.albumUnlocked(s,a.id)&&req[0].done){const todo=req.find(r=>!r.done);if(todo)return ['다음 앨범 전에 만나는 이야기',todo.label,'이야기 열기',todo.action,todo.value];}}
 return ['우리의 콘서트','연습한 앨범으로 공연하고 기념 티켓을 모아요.','공연 보러 가기','tab','4'];
}

function clock(){return s.active?`${Math.max(0,Math.ceil((s.active.end-Date.now())/1000))}초`:'';}
function studio(){
 const g=goal(),m=M.memberCards(s).find(x=>x.id===s.displayCard&&x.earned);
 const status=s.active?M.lessons[s.active.lesson].title+' 중':'오늘도 한 곡씩, 함께 맞춰가요.';
 return `<section class="studio-next"><div><small>다음 할 일</small><h3>${g[0]}</h3><p>${g[1]}</p></div>${button(g[2],g[3],g[4],'primary')}</section><div class="studio-layout"><article class="studio-board">
 <header class="studio-top"><div>${mark('REHEARSAL ROOM')}<h2>세 사람의 연습실</h2></div><div class="resources"><span>연습 포인트 <b id="studioPoints">${s.points}<small> / 100</small></b></span><span>모은 트랙 <b>${M.count(s)}<small> / ${albumSize}</small></b></span></div></header>
 <details class="progress-help"><summary>연습은 어떻게 하나요?</summary><p>보컬·팀 호흡·무대 동선 연습을 마치면 준비도 100%가 돼요. 다음 곡은 자동으로 열립니다.</p><p>연습과 활동 퀴즈로 코인을 모아 의상과 헤어를 살 수 있어요.</p></details><div class="room${s.active?' is-practicing':''}${m?' has-keepsake':''}"><p class="room-status" role="status">${s.active?'♫ ':''}${status}</p>${m?`<button class="wall-card" data-action="card-detail" data-value="${m.id}" aria-label="대표 카드 펼치기 · ${M.members.find(x=>x.id===m.member).name} · ${esc(m.title)}">${cardFace(m)}</button>`:''}<div class="pixel-trio">${['br','gr','yj'].map(id=>`<div class="pixel-member member-${id}">${sprite(id)}</div>`).join('')}</div><div class="member-labels"><span>이보람</span><span>남규리</span><span>김연지</span></div></div>
 ${practice()}<div class="studio-coins"><div><small>코인</small><strong>${M.coins(s)} <span>코인</span></strong><p>${s.shopJob?'활동 진행 중 · '+M.shopJobById(s.shopJob.kind).name:'이야기를 모두 마쳐도, 코인은 계속 모을 수 있어요.'}</p></div>${button('코인 모으기','open-coins','','primary')}</div><div class="outfit-current"><details><summary>현재 의상</summary><span>${esc(outfitSummary())}</span></details>${button('의상 바꾸기','tab','5','link')}</div>${m?`<p class="display-card">벽에 전시 중 · ${M.members.find(x=>x.id===m.member).name} · ${esc(m.title)} ${button('카드북 열기','tab','3','link')}</p>`:''}</article>
 </div><div class="studio-games">${button('활동 퀴즈','mini-open','quiz')}${button('스타일 짝 맞추기','mini-open','pairs')}<small>코인 보상 · 오늘 남은 도전 ${Math.max(0,M.mini.dailyLimit-M.mini.used(s.mini,Date.now()))} / ${M.mini.dailyLimit}회</small></div>`;
}
function practice(){
 const lessonButtons=M.lessons.map((l,i)=>{const done=s.tracks[track].includes(i),active=s.active?.track===track&&s.active.lesson===i,queued=s.queue?.track===track&&s.queue.lesson===i;
 return button(`${l.title}<small>${done?'완료':active?'연습 중':queued?'예약됨':`${s.active?'예약':'시작'} · ${l.seconds}초 · +${l.gain}%`}</small>`,'train',String(i),'lesson',done||active||queued||!!s.queue||(!s.active&&s.points<5));}).join('');
 return panel(`${mark('PRACTICE')}<div class="line"><h2>오늘의 연습</h2><select id="track" aria-label="연습할 곡">${M.songs.filter(x=>open(x.id)).map(x=>`<option value="${x.id}" ${track===x.id?'selected':''}>${x.title} · ${M.songAlbum(x.id).name}</option>`)}</select></div><div class="line"><b>${title(track)}</b><b>${pct(track)}%</b></div>${bars(pct(track))}<div class="lessons">${lessonButtons}</div><small>연습 한 번에 5포인트 · ${M.timing.recoveryMs/1000}초마다 5 회복 · 다음 연습 1개 예약 가능</small><div class="queue">${s.active?`진행 중 · ${title(s.active.track)} / ${M.lessons[s.active.lesson].title} <b id="clock">${clock()}</b>`:'진행 중인 연습이 없어요.'}${s.queue?`<br>${s.active?'다음':'포인트 회복 대기 중'} · ${title(s.queue.track)} / ${M.lessons[s.queue.lesson].title} ${button('예약 취소','cancel','','link')}`:''}</div>${ready(track)&&M.songs.find(t=>open(t.id)&&!ready(t.id))?button('다음 곡 연습하기','pick',M.songs.find(t=>open(t.id)&&!ready(t.id)).id,'primary'):''}`,'practice');
}

function albumChecklist(id){
 const req=M.albumRequirements(s,id),unlocked=M.albumUnlocked(s,id),firstMissing=req.find(r=>!r.done),comeback=id==='still-here';
 return `<section class="comeback-checklist"><h3>${comeback?'각자의 시간을 지나, 다시 씨야로':'다음 무대 전에 간직할 이야기'}</h3><p>${unlocked?'이미 열린 앨범은 유지돼요. 아직 읽지 않은 이야기도 돌아볼 수 있어요.':comeback?'전곡 연습과 아래 이야기를 마치면 복귀 앨범이 열려요.':'아래 조건을 마치면 다음 앨범으로 이어져요. 완료한 조건은 다시 진행하지 않아요.'}</p><ol>${req.map(r=>`<li class="${r.done?'done':''}"><span>${r.done?'✓':'○'} ${esc(r.label)}</span>${!r.done&&r===firstMissing?button('이어서 보기',r.action,r.value,'primary'):''}</li>`).join('')}</ol></section>`;
}
function albumJourney(){
 return `<div class="album-journey" aria-label="앨범 여정">${M.albums.map((a,i)=>{const owned=M.albumUnlocked(s,a.id),done=M.albumComplete(s,a.id),can=M.albumAvailable(s,a.id);return `<button data-action="album-view" data-value="${a.id}" class="album-step ${selectedAlbum===a.id?'selected':''}" aria-pressed="${selectedAlbum===a.id}"><small>${a.type.split(' · ')[0]}</small><strong>${a.name}</strong><span>${done?'전곡 수집 완료':owned||i===0?M.albumCount(s,a.id)+' / '+a.tracks.length+'트랙':can?'해금 가능':'잠김'}</span></button>`;}).join('')}</div>`;
}
function albumConcertCard(a){const done=s.simple.concerts[a.id],can=M.concertReady(s,a.id);return `<article class="album-concert-card"><div><h3>${esc(a.name)}</h3><small>${done?'콘서트 완료 · 티켓 획득':can?'공연할 준비가 됐어요':'전곡 수집 + 보컬곡 연습 완료 후 열려요'}</small></div><div class="album-concert-actions">${button(done?'다시 공연하기':'앨범 콘서트','perform','album:'+a.id,can?'primary':'',!can)}${button('기념 티켓','ticket-open',a.id,'',!done)}</div></article>`;}
function songs(){
 const a=M.albumById(selectedAlbum),n=M.albumCount(s,a.id),unlocked=a.id==='first-mind'||M.albumUnlocked(s,a.id);
 const list=a.tracks.map((t,i)=>`<article class="row song-row ${open(t.id)?'collected':'is-locked'}"><span class="num">${String(i+1).padStart(2,'0')}</span><div><h3>${esc(t.title)}</h3><small>${open(t.id)?'준비도 '+pct(t.id)+'%':i?'앞 곡 연습 완료 후 해금':'앨범 해금 후 열림'}${t.instrumental?' · 반주':''}</small></div>${button(open(t.id)?'연습하기':'잠김','pick',t.id,'',!open(t.id))}</article>`).join('');
 return `${mark('ALBUM JOURNEY')}<h2>앨범을 한 장씩 펼쳐요</h2><p>앞 곡을 연습하면 다음 곡이 열려요.<br>전곡 연습과 필수 이야기를 마치면 다음 앨범으로 이어집니다.</p>${albumJourney()}${a.id==='still-here'?vcrUI.card():''}${panel(`<div class="line"><h2>${esc(a.name)}</h2><span class="status-pill">${n} / ${a.tracks.length}트랙</span></div>${!unlocked?albumChecklist(a.id)+button('앨범 열고 의상 받기','unlock-album',a.id,'primary',!M.albumAvailable(s,a.id)):''}${a.id==='rebloom'?'<p class="private-note">당시 활동 멤버는 김연지·이보람·수미입니다. 도트 의상은 현재 세 멤버의 재해석이에요.</p>':''}<div class="album-story-link">${button('이 시기의 이야기','stories-album',a.id)}</div><div class="song-list">${list}</div>${albumConcertCard(a)}${link('앨범 원본 기록',a.source)}${M.albumMastered(s,a.id)&&M.albums.indexOf(a)<M.albums.length-1?button('다음 앨범 보기','album-view',M.albums[M.albums.indexOf(a)+1].id,'primary'):''}`)}`;
}

function stories(){
 const core=[
 {id:'intro',date:'2006.02.24',title:'처음 모인 목소리',description:'여인의 향기 연습 · 게임 속 첫걸음',action:'pick',value:'scent',ok:true,done:ready('scent'),imageIndex:0,album:'first-mind'},
 {id:'first',date:'2006.02.24',title:'첫 무대의 기억',description:'여인의 향기 준비도 100%',action:'perform',value:'first',ok:ready('scent'),done:has('first'),imageIndex:1,album:'first-mind'},
 {id:'album',date:'2006.02.24',title:'노래로 채운 시간',description:'첫 무대 완료 후 열림',action:'album',value:'',ok:has('first'),done:has('album'),imageIndex:2,album:'first-mind'},
 ...M.members.map(m=>({id:m.id,date:m.date,title:m.title,subject:m.name,description:m.fact,condition:M.coreCondition(m.id),action:'story',value:m.id,ok:M.coreAvailable(s,m.id)||has(m.id),done:has(m.id),imageIndex:{yj:3,gr:4,br:5}[m.id],album:'see-you-again'})),
 {id:'reunion',date:'2020.02.21',title:'하나로 모인 기록',subject:'씨야',description:'2020년 슈가맨3에서 다시 함께 노래한 세 사람의 기록입니다.',condition:M.coreCondition('reunion'),action:'story',value:'reunion',ok:M.coreAvailable(s,'reunion')||has('reunion'),done:has('reunion'),imageIndex:6,album:'see-you-again'}
 ].map(e=>({...e,kind:'core'}));
 const all=[...core,...M.storyEntries.map(e=>({...e,ok:M.storyAvailable(s,e.id),done:M.storyDone(s,e.id),description:e.summary,condition:M.storyCondition(e.id),action:'timeline',value:e.id}))];
 const entries=all.filter(e=>(storyAlbum==='all'||e.album===storyAlbum)&&(storyFilter==='all'||storyFilter===e.kind||storyFilter==='available'&&e.ok&&!e.done)).sort((a,b)=>a.date.localeCompare(b.date));
 return `${storyAlbum==='all'||storyAlbum==='still-here'?vcrUI.card():''}${mark('STORY BOOK')}<h2>무대 너머의 이야기</h2><p>2006년 첫 무대부터 각자의 활동, 다시 함께한 날까지.<br>앨범을 따라 진행하면 실제 활동 시기 순으로 이야기가 열려요.</p><div class="story-tools"><div class="badge-filters" aria-label="이야기 분류">${[['all','전체'],['available','새로 열린 이야기'],['album','앨범 이야기'],['event','사이드 이벤트'],['core','멤버·시작 이야기']].map(([id,n])=>`<button data-action="story-filter" data-value="${id}" aria-pressed="${storyFilter===id}">${n}</button>`).join('')}</div><label>앨범 <select id="storyAlbum">${[['all','전체 앨범'],...M.albums.map(a=>[a.id,a.name])].map(([id,n])=>`<option value="${id}" ${storyAlbum===id?'selected':''}>${n}</option>`).join('')}</select></label></div><p class="private-note">2011–2022년의 개인 활동·재회는 See You Again 이후의 이야기로 이어집니다.</p><div class="cards timeline-cards">${entries.map(e=>panel(`${e.kind==='core'?storyArt(e.imageIndex):entryArt(e)}${mark(e.date+' · '+(e.kind==='core'?'STORY':e.kind==='album'?'ALBUM':'EVENT'))}<span class="story-subject">${esc(e.subject||'씨야')}</span><h3>${esc(e.title)}</h3>${M.storyDestination(e.id)?'<span class="required-story">'+esc(M.albumById(M.storyDestination(e.id)).name)+' 진입 전 이야기</span>':''}<p class="story-summary">${esc(e.description)}</p><small class="story-condition">${e.done?'간직한 이야기':e.ok?'지금 열 수 있어요':'해금 조건 · '+esc(e.condition||e.description)}</small>${button(e.done?'다시 보기':e.ok?'이야기 열기':'아직 잠긴 이야기',e.action,e.value,e.ok&&!e.done?'primary':'',!e.ok)}`,'timeline-card '+(e.ok?'':'is-locked'))).join('')||'<p>이 조건에 맞는 이야기가 없어요.</p>'}</div>`;
}
const cardFace=c=>`<div class="pixel-collectible ${c.kind} ${c.earned?'':'unearned'}" data-card="${c.id}"><div class="collectible-top"><div class="card-brand"><img src="/images/game/our-stage/card-logo.svg" alt="SEEYA"><span>archive</span></div><span>${c.kind==='album'?'ALBUM':c.kind==='special'?'FINALE':'STORY'}</span></div><div class="collectible-art">${c.earned?(c.style?sprite(c.member,styles.find(o=>o.id===c.style)):c.image?`<img src="${c.image}" alt="${esc(c.title)} 도트 카드">`:storyArt(c.scene)):'<span class="card-lock" aria-label="아직 얻지 못한 카드">?</span>'}</div><strong>${M.members.find(m=>m.id===c.member).name}</strong><span class="collectible-caption">${esc(c.title)}</span>${cardBadgeRow(c)}<small>No. ${String(M.memberCards(s).findIndex(x=>x.id===c.id)+1).padStart(2,'0')} · ${c.earned?'COLLECTED':'LOCKED'}</small></div>`;
function cardBadgeRow(c){const selected=s.cardDecorations[c.id]||[];return selected.length?`<div class="card-badge-row" aria-label="카드에 붙인 배지">${selected.map(id=>{const b=M.badges(s).find(b=>b.id===id);return `<span title="${esc(b.name)}" aria-label="${esc(b.name)}">${badgeImage(b)}</span>`;}).join('')}</div>`:'';}
function badgeEditor(c){
 const earned=M.badges(s).filter(b=>b.earned),selected=s.cardDecorations[c.id]||[],pages=Math.max(1,Math.ceil(earned.length/12));badgePage=Math.min(badgePage,pages-1);
 return `<section class="card-badge-editor"><div class="line"><h3>내 배지로 꾸미기</h3><strong>${selected.length} / 3개</strong></div><p>배지를 누르면 붙이고, 다시 누르면 뗄 수 있어요. 카드마다 자동으로 저장됩니다.</p><div class="badge-selected">${selected.map(id=>button(esc(earned.find(b=>b.id===id).name)+' ×','card-badge',id)).join('')||'<small>아래에서 붙일 배지를 골라주세요.</small>'}</div><div class="badge-picker">${earned.slice(badgePage*12,badgePage*12+12).map(b=>`<button data-action="card-badge" data-value="${b.id}" aria-pressed="${selected.includes(b.id)}" ${selected.length===3&&!selected.includes(b.id)?'disabled':''}>${badgeImage(b)}<span>${esc(b.name)}</span></button>`).join('')||'<p>앨범과 이야기를 진행해 첫 배지를 모아보세요.</p>'}</div><nav class="card-pagination" aria-label="획득 배지 페이지">${button('이전','badge-page',String(badgePage-1),'',badgePage===0)}<span>${badgePage+1} / ${pages}</span>${button('다음','badge-page',String(badgePage+1),'',badgePage>=pages-1)}</nav>${selected.length===3?'<p class="private-note">3개를 모두 붙였어요. 다른 배지로 바꾸려면 하나를 먼저 떼어주세요.</p>':''}${button('꾸미기 완료','decorate-done',c.id,'primary')}</section>`;
}
function cardDetail(id){const c=M.memberCards(s).find(c=>c.id===id);if(!c)return;dialog(`${mark('MEMBER CARD')}<h2>${M.members.find(m=>m.id===c.member).name} · ${esc(c.title)}</h2>${cardFace(c)}<p>${esc(c.note||'')}</p><p>${c.earned?'카드북에 간직했어요.':esc(c.hint)}</p><div class="card-detail-actions">${button(s.displayCard===c.id?'연습실 벽에 전시 중':'연습실 벽에 전시','display-card',c.id,'primary',!c.earned||s.displayCard===c.id)}${c.earned?button('배지로 꾸미기','decorate-card',c.id):''}${button('카드북으로','tab','3')}</div>${decoratingCard===id&&c.earned?badgeEditor(c):''}`);}
function refreshCardEditor(focusValue){const top=$('#stageModal').scrollTop;cardDetail(decoratingCard);$('#stageModal').scrollTop=top;if(focusValue)$('#modalBody .badge-picker [data-value="'+focusValue+'"]')?.focus({preventScroll:true});}
function memories(){

 const all=M.memberCards(s),filtered=all.filter(c=>(cardMember==='all'||c.member===cardMember)&&(cardKind==='all'||c.kind===cardKind)&&(!cardOnlyOwned||c.earned)),pages=Math.max(1,Math.ceil(filtered.length/12));cardPage=Math.min(cardPage,pages-1);
 return `${panel('<h3>앨범 기념 티켓</h3><p>앨범 콘서트를 마치면 자동으로 열려요.</p><div class="ticket-list">'+M.albums.map(a=>button(esc(a.name),'ticket-open',a.id,'',!s.simple.concerts[a.id])).join('')+'</div>')}${mark('MEMORY BOOK')}<h2>멤버 도트 카드북</h2><p>앨범을 열면 멤버 카드 3장, 이야기를 간직하면 특별한 활동 카드가 모여요.<br>카드의 모습은 그 시절 그대로 간직됩니다.</p><div class="line"><strong>${all.filter(c=>c.earned).length} / ${all.length}장 수집</strong><label><input id="cardOwned" type="checkbox" ${cardOnlyOwned?'checked':''}> 모은 카드만</label></div><div class="cardbook-tools"><label>멤버 <select id="cardMember">${[['all','전체'],...M.memberIds.map(id=>[id,M.members.find(m=>m.id===id).name])].map(([id,n])=>`<option value="${id}" ${cardMember===id?'selected':''}>${n}</option>`).join('')}</select></label><div class="badge-filters">${[['all','전체'],['album','앨범'],['story','이야기'],['special','피날레']].map(([id,n])=>button(n,'card-kind',id,cardKind===id?'primary':'')).join('')}</div></div><div class="cardbook-grid">${filtered.slice(cardPage*12,cardPage*12+12).map(c=>`<article>${cardFace(c)}<p class="card-condition">${c.earned?'획득 완료':esc(c.hint)}</p>${button(c.earned?'카드 펼치기':'획득 방법 보기','card-detail',c.id)}</article>`).join('')||'<p>아직 모은 카드가 없어요. 앨범의 첫 페이지를 열어보세요.</p>'}</div><nav class="card-pagination" aria-label="카드북 페이지">${button('이전','card-page',String(cardPage-1),'',cardPage===0)}<span>${cardPage+1} / ${pages}</span>${button('다음','card-page',String(cardPage+1),'',cardPage>=pages-1)}</nav>${badgeShelf()}`;
}

const badgeArt=require('../data/our-stage-badge-art.json');
const badgeImage=badge=>{
 const filterId='stage-badge-'+(++artSequence);
 const standalone=badgeArt.badges[badge.id].image;
 if(standalone)return `<img class="pixel-badge unique-badge" src="${standalone}" alt="${esc(badge.name)} 배지" data-badge-art="${badge.id}">`;
 const entry=badgeArt.badges[badge.id],source=entry.logo?badgeArt.logoSheets[entry.sheet]:badgeArt.sheets[entry.sheet];
 const logo=entry.logo,box=logo?.box;
 const lettering=logo?`<image class="official-badge-logo" href="${art}${logo.tone==='light'?'badge-logo-light.svg':'card-logo.svg'}" x="${box[0]}" y="${box[1]}" width="${box[2]}" height="${box[3]}"/>`:'';
 const preserved=(entry.preserve||[]).map(b=>`<svg x="${b[0]}" y="${b[1]}" width="${b[2]}" height="${b[3]}" viewBox="${b.join(' ')}" overflow="hidden"><image href="${badgeArt.sheets[entry.sheet]}" width="1536" height="1024"/></svg>`).join('');
 return `<svg class="pixel-badge unique-badge" viewBox="0 0 256 256" role="img" aria-label="${esc(badge.name)} 배지" data-badge-art="${entry.sheet}:${entry.index}"><defs><filter id="${filterId}"><feComponentTransfer><feFuncA type="discrete" tableValues="0 0 0 0 0 0 0 1"/></feComponentTransfer></filter></defs><svg width="256" height="256" viewBox="${entry.box.join(' ')}" overflow="hidden"><image href="${source}" width="1536" height="1024" ${entry.logo?'filter="url(#'+filterId+')"':''}/>${lettering}${preserved}</svg></svg>`;
};
function badgeShelf(){
 const all=M.badges(s),filtered=all.filter(b=>badgeFilter==='all'||badgeFilter==='earned'&&b.earned||badgeFilter==='album'&&b.group==='앨범'||badgeFilter==='activity'&&b.group!=='앨범');
 return panel(`<div class="line"><h3>배지함</h3><small>${all.filter(b=>b.earned).length} / ${all.length}개</small></div><div class="badge-filters" aria-label="배지 필터">${[['all','전체'],['earned','획득'],['album','앨범'],['activity','이야기·활동']].map(([id,label])=>`<button data-action="badge-filter" data-value="${id}" aria-pressed="${badgeFilter===id}">${label}</button>`).join('')}</div><div class="badges">${filtered.map(b=>`<div class="badge-card ${b.earned?'on':'unearned'}">${badgeImage(b)}<strong>${esc(b.name)}</strong><small>${b.earned?'획득 완료 · ':''}${b.hint}</small></div>`).join('')||'<p>아직 획득한 배지가 없어요. 첫 연습부터 시작해 보세요.</p>'}</div>`);
}


const storyArt=(i,cls='story-tile')=>`<svg class="${cls}" viewBox="${i%4*450+3} ${Math.floor(i/4)*450+3} 444 444" role="img" aria-label="${['처음 모인 목소리','첫 무대의 기억','노래로 채운 시간','가면 너머의 목소리','카메라 앞에서','또 다른 하모니','하나로 모인 기록','우리의 콘서트'][i]} 도트 삽화"><svg x="${i%4*450+3}" y="${Math.floor(i/4)*450+3}" width="444" height="444" viewBox="${i%4*450+3} ${Math.floor(i/4)*450+3} 444 444" overflow="hidden"><image href="${art}pixel-stories-period.png" width="1800" height="900" preserveAspectRatio="none"/></svg></svg>`;
function entryArt(e){
 return `<div class="timeline-art scene-art"><img src="${e.image}" alt="${esc(e.title)} 도트 삽화" loading="lazy"></div>`;
}
function timeline(id){
 const e=M.storyById(id);if(!e||!M.storyAvailable(s,id))return;
 dialog(`${mark((e.kind==='album'?'ALBUM STORY':'SIDE EVENT')+' · '+e.date)}<span class="story-subject">${esc(e.subject)}</span><h2>${esc(e.title)}</h2>${entryArt(e)}<p class="private-note">${esc(e.illustrationNote||'기록을 바탕으로 재구성한 도트 삽화입니다.')} ${e.wardrobeSource?link('의상 참고 자료',e.wardrobeSource):''}</p><div class="story-prose">${e.body.map(t=>`<p>${esc(t)}</p>`).join('')}</div>${link('원본 기록 확인',e.source)}${e.contextSource?link('관련 인터뷰·보도 확인',e.contextSource):''}${e.identitySource?link('가면의 주인공 확인',e.identitySource):''}${e.badgeName?'<p class="collected-note">완료 보상 · '+esc(e.badgeName)+' 배지</p>':''}<hr>${M.storyDone(s,id)?'<p class="collected-note">이 이야기를 추억에 간직했어요.</p>':button('이야기 한 조각 풀기','challenge','story:'+id,'primary')}${button('이 시기의 이야기 보기','stories-album',e.album)}`);
}
function chapterReward(a){
 dialog(`${mark('ALBUM UNLOCKED')}<h2>${a.name} 해금!</h2>${a.id==='still-here'?vcrUI.card():''}<div class="outfit-reward">${outfitLineup(outfits.find(o=>o.id===a.id))}<strong>새 의상, 멤버 도트 카드 3장과 앨범 해금 배지를 얻었어요.</strong>${button('새 의상 입기','wear-reward',a.id,'primary')}</div>${button('이 앨범의 곡 만나기','album-view',a.id)}${button('새로 열린 앨범 이야기','timeline',M.storyEntries.find(e=>e.kind==='album'&&e.album===a.id).id)}`);
}

function outfitCard(o){
 const owned=M.outfitOwned(s,o.id),wearing=M.memberIds.every(id=>styleId(id)===o.id&&styleId(id,'hair')===o.id);
 const status=['base','practice'].includes(o.id)?'처음부터 보유':owned?'획득 완료':'미획득 · 테스트 미리입기';
 const condition=o.id==='practice'?'새 게임은 이 연습복으로 시작해요.':o.id==='base'?'기존 콘서트 의상도 자유롭게 입을 수 있어요.':o.id==='first-mind'?'이야기 E03 「노래로 채운 시간」을 완료하면 얻어요.':`${esc(o.name)} 앨범을 해금하면 얻어요.`;
 return panel(`${outfitLineup(o)}${mark(o.type)}<h3>${esc(o.name)}</h3><span class="outfit-ownership ${owned?'owned':'preview'}">${status}</span><p class="outfit-condition">${condition}</p><p class="outfit-note">${o.note}</p>${o.wardrobeSource?link('의상 참고 사진',o.wardrobeSource):''}${o.url?`<details><summary>참고한 앨범 보기</summary>${link('앨범 정보',o.url)} · ${link('커버 이미지',o.cover)}</details>`:''}${button(wearing?(owned?'입고 있는 의상':'미리 입는 중'):owned?'세 멤버 함께 입기':'테스트로 미리 입기','outfit',o.id,wearing?'':'primary',wearing||!M.canWearOutfit(s,o.id))}`,'outfit-card');
}
function wardrobe(){
 const options=(id,part)=>styles.filter(o=>!M.shopById(o.id)||M.styleOwned(s,o.id,id)).map(o=>`<option value="${o.id}" ${styleId(id,part)===o.id?'selected':''}>${esc(o.name)}${M.styleOwned(s,o.id,id)?'':' · 테스트 미리입기'}</option>`).join('');
 return `<h2>각자의 스타일을 만들어요</h2><p>의상과 헤어를 따로 골라 자유롭게 조합해 보세요. 귀고리는 헤어에 맞춰 바뀌어요.<br>세트로 얻은 의상과 헤어는 각각 선택할 수 있어요.</p>
 <div class="member-wardrobe">${M.memberIds.map(id=>panel(`<div class="wardrobe-sprite">${sprite(id)}</div><h3>${M.members.find(m=>m.id===id).name}</h3><label class="wardrobe-part" for="wear-${id}">의상<select id="wear-${id}" data-member="${id}" data-part="clothes" aria-label="${M.members.find(m=>m.id===id).name} 의상">${options(id,'clothes')}</select></label><label class="wardrobe-part" for="hair-${id}">헤어<select id="hair-${id}" data-member="${id}" data-part="hair" aria-label="${M.members.find(m=>m.id===id).name} 헤어">${options(id,'hair')}</select></label><small>${preview[id]?'미획득 스타일 미리입기 · 새로고침하면 보유 조합으로 돌아가요.':'보유 스타일 · 조합도 자동 저장돼요.'}</small>${button('이 의상과 같은 헤어로','match-hair',id,'link')}`)).join('')}</div>
 <p class="private-note">앨범 미리입기는 테스트 기능이에요. 상점 스타일은 해당 멤버가 구매한 뒤 조합할 수 있어요.<br>Rebloom은 현재 세 멤버의 재해석입니다.</p><h3>연습복·콘서트 세트</h3><div class="outfit-grid">${outfits.filter(o=>['base','practice'].includes(o.id)).map(outfitCard).join('')}</div><h3>앨범 의상 세트</h3><p>앨범을 해금하면 세 멤버의 의상과 헤어를 함께 얻어요.</p><div class="outfit-grid">${outfits.filter(o=>!['base','practice'].includes(o.id)).map(outfitCard).join('')}</div>`;
}
function coinRoom(){
 const active=s.shopJob&&M.shopJobById(s.shopJob.kind),daily=M.canClaimDaily(s);
 return `<div class="line"><div>${mark('BACKSTAGE')}<h2>코인 모으기</h2><p>모든 이야기를 마친 뒤에도 계속 참여할 수 있어요.</p></div><strong class="coin-wallet">코인 <b>${M.coins(s)}</b></strong></div>
 ${panel(`<div class="line"><div><h3>오늘의 연습실 출석</h3><p>하루 한 번, ${M.dailyReward}코인 · 한국 시간 자정에 새로 시작해요.</p></div>${button(daily?M.dailyReward+'코인 받기':'오늘 받았어요','daily-coins','','primary',!daily)}</div>`,'daily-coins')}
 ${miniUI.room()}
 <div class="coin-actions">${button('무대 상점에서 사용하기','wardrobe-view','shop','primary')}${button('연습실로','tab','0')}</div>`;
}
function shop(){
 const income=M.earnings(s),member=M.members.find(m=>m.id===shopMember);
 return `<div class="line"><div><h2>무대 상점</h2><p>무대의 의상과 헤어를 한 사람씩 모아요.</p></div><strong class="coin-wallet">코인 <b>${M.coins(s)}</b></strong></div>
 ${panel(`<div class="line"><div><h3>다음 의상도 차근차근</h3><p>매일 출석 보상과 미니게임으로 코인을 모아요.</p></div>${button('코인 모으기','open-coins','','primary')}</div>`)}
 <details class="coin-guide"><summary>코인은 어떻게 모으나요?</summary><ul class="coin-income-list"><li>새 노래 수집 <b>5코인</b></li><li>연습 과제 완료 <b>2코인</b></li><li>첫 여정 이야기 <b>5코인</b></li><li>앨범 이야기·이벤트 <b>8코인</b></li><li>매일 출석 <b>20코인</b></li><li>활동 퀴즈 <b>최대 15코인</b></li><li>스타일 짝 맞추기 <b>최대 36코인</b></li></ul><p class="private-note">수집·연습·이야기 보상은 처음 한 번만 받아요.<br>코인은 의상과 헤어 구매에 사용할 수 있어요.</p></details>
 <div class="badge-filters shop-members" aria-label="구매할 멤버">${M.memberIds.map(id=>button(M.members.find(m=>m.id===id).name,'shop-member',id,shopMember===id?'primary':'')).join('')}</div>
 <p>${member.name}의 스타일을 골라주세요. 다른 멤버의 의상은 따로 구매할 수 있어요.</p>
 <div class="shop-grid">${M.shop.map(o=>{const owned=M.styleOwned(s,o.id,shopMember);return panel(`<div class="shop-sprite">${sprite(shopMember,o)}</div>${mark(o.date)}<h3>${o.name}</h3><p>${member.name} · 의상 + 헤어</p><p class="outfit-note">${o.note}</p>${link('참고한 무대 보기',o.url)}<div class="shop-price"><b>${owned?'보유 중':o.price+'코인'}</b>${button(owned?'입기':M.coins(s)<o.price?(o.price-M.coins(s))+'코인 더 필요':'구매하기',owned?'shop-wear':'shop-buy',o.id,'primary',!owned&&M.coins(s)<o.price)}</div>`,'shop-card');}).join('')}</div>`;
}
function designs(){
 return `${mark('PIXEL COLLECTION')}<div class="badge-filters wardrobe-tabs" aria-label="의상과 배지">${[['closet','내 옷장'],['shop','무대 상점'],['coins','코인 모으기'],['badges','배지함']].map(([id,n])=>`<button data-action="wardrobe-view" data-value="${id}" aria-pressed="${wardrobeView===id}">${n}</button>`).join('')}</div>${wardrobeView==='coins'?coinRoom():wardrobeView==='shop'?shop():wardrobeView==='badges'?badgeShelf():wardrobe()}`;
}
function concertRows(){
 const match=id=>{const t=M.songAlbum(id).tracks.find(t=>t.id===id);return title(id).toLocaleLowerCase().includes(concertQuery.toLocaleLowerCase())&&(concertAlbum==='all'||M.songAlbum(id).id===concertAlbum)&&(concertKind==='all'||Boolean(t.instrumental)===(concertKind==='inst'));};
 const label=id=>`<b>${esc(title(id))}</b><small>${esc(M.songAlbum(id).name)} · ${M.songAlbum(id).tracks.find(t=>t.id===id).instrumental?'반주':'보컬'}</small>`;
 const selected=s.setlist.map((id,i)=>({id,i})).filter(x=>match(x.id)),available=M.ids.filter(id=>ready(id)&&!s.setlist.includes(id)&&match(id));
 return `<p>담은 곡 ${s.setlist.length}개 · 검색 결과 ${selected.length+available.length}개</p>${selected.map(({id,i})=>`<div class="row"><span class="num">${i+1}</span><div class="concert-track-name">${label(id)}</div><div class="tools">${button('위로','up',id,'',i===0)}${button('빼기','remove',id)}</div></div>`).join('')}${available.map(id=>`<div class="row"><div class="concert-track-name">${label(id)}</div>${button('담기','add',id)}</div>`).join('')||'<p>이 조건의 준비된 곡이 없어요.</p>'}`;
}
function concert(){
 const can=has('album')&&s.setlist.length>=2;
 return panel(`<h2>앨범 콘서트</h2><p>연습을 마친 앨범으로 공연하고 티켓을 모아요.</p><div class="album-concert-list">${M.albums.map(albumConcertCard).join('')}</div>`)+panel(`${mark('OUR CONCERT')}<h2>우리의 콘서트</h2>${stageArt()}<h3>셋리스트</h3><p>준비도 100%인 곡을 담고 순서를 정해요. 재수록곡은 앨범명으로 구분해 주세요.</p>${button(has('ending')?'다시 공연하기':'콘서트 열기','perform','ending','primary',!can)}<div class="concert-filters"><label>곡명 검색<input id="concertQuery" type="search" value="${esc(concertQuery)}" placeholder="곡명으로 찾기"></label><label>앨범<select id="concertAlbum"><option value="all">전체 앨범</option>${M.albums.map(a=>`<option value="${a.id}" ${a.id===concertAlbum?'selected':''}>${a.name}</option>`).join('')}</select></label><label>트랙<select id="concertKind">${[['all','전체'],['vocal','보컬'],['inst','반주']].map(([id,name])=>`<option value="${id}" ${id===concertKind?'selected':''}>${name}</option>`).join('')}</select></label></div><div id="concertRows">${concertRows()}</div><p>${can?'공연을 시작할 준비가 됐어요.':'첫 앨범을 열고 준비도 100%인 곡을 두 곡 이상 담아 주세요.'}</p><hr><h3>4집 피날레 · 우리의 빛</h3><p>4집 전곡 수집 + 준비도 100% 보컬곡 ${M.albumById('first-again').tracks.filter(t=>!t.instrumental&&ready(t.id)).length} / 2곡 이상. 공연을 마치면 피날레 카드 3장을 받아요.</p>${button(s.finale?'4집 피날레 다시 보기':'4집 피날레 열기','perform','finale','primary',!M.finaleReady(s))}`);
}
function draw(){const focus=document.activeElement,restore=focus&&($('#screen').contains(focus)||$('#tabs').contains(focus)),identity=restore?{id:focus.id,action:focus.dataset.action,value:focus.dataset.value,start:focus.selectionStart,end:focus.selectionEnd}:null;const a=M.albumById(selectedAlbum);$('.os-chapter').innerHTML=mark(a.type)+'<strong>'+a.name+'</strong><small>'+M.albumCount(s,a.id)+' / '+a.tracks.length+'트랙 수집</small>'; if(!open(track))track='scent';$('#tabs').innerHTML=headings.map((name,i)=>`<button data-action="tab" data-value="${i}" aria-current="${scene===i?'page':'false'}"><span>${icons[i]}</span>${name}</button>`).join('');$('#screen').innerHTML=optimized([studio,songs,stories,memories,concert,designs][scene]());if(identity){const next=identity.id?document.getElementById(identity.id):[...root.querySelectorAll('[data-action]')].find(e=>e.dataset.action===identity.action&&e.dataset.value===identity.value);if(next){next.focus({preventScroll:true});if(identity.start!=null&&next.setSelectionRange)try{next.setSelectionRange(identity.start,identity.end);}catch{}}}}
function dialog(content){vcrUI?.destroy();if(!$('#stageModal').open)returnFocus=document.activeElement;$('#modalBody').innerHTML=optimized(content);const h=$('#modalBody h2');if(h){h.id='stageModalTitle';h.tabIndex=-1;}if(!$('#stageModal').open)$('#stageModal').showModal();h?.focus({preventScroll:true});}
function close(){window.clearTimeout(showTimer);showing=false;$('#stageModal').close();}
function book(id){
 const m=M.members.find(x=>x.id===id),isReunion=id==='reunion';
 if((!m&&!isReunion)||(!has(id)&&!M.coreAvailable(s,id)))return;
 dialog(`${mark(isReunion?'E07 · 재회':m.episode+' · '+m.name)}<h2>${isReunion?'하나로 모인 기록':m.title}</h2>${storyArt(isReunion?6:{yj:3,gr:4,br:5}[m.id],'story-modal-art')}<small>${isReunion?'2020.02.21':m.date}</small><p>${isReunion?'JTBC 슈가맨3에서 원년 멤버 세 사람이 다시 함께 노래했어요.':m.fact}</p>${link('이야기의 원본 기록',isReunion?M.reunionUrl:m.url)}<hr>${has(id)?'<p class="collected-note">이 추억은 이미 카드북에 간직했어요.</p>':button('이야기 한 조각 풀기','challenge','story:'+id,'primary')}`);
}
function album(){
 if(!has('first'))return;
 dialog(`${mark('E03 · ALBUM NOTES')}<h2>노래로 채운 시간</h2>${storyArt(2,'story-modal-art')}<p>2006년에 발표한 첫 정규 앨범 <b>The First Mind</b>에는 ‘여인의 향기’, ‘구두’, ‘Promise U’가 담겨 있어요.</p>${link('앨범 펼쳐보기','https://www.melon.com/album/detail.htm?albumId=314286')}<hr>${has('album')?'<p>앨범 기록을 간직했어요. 노래 탭에서 Promise U를 만나보세요.</p>':button('앨범 퀴즈 풀기','challenge','story:album','primary')}`);
}
function challenge(key,then=null,note=''){
 if(!M.canChallenge(s,key))return;
 activeChallenge=key;afterChallenge=then;
 const q=M.challenges[key];
 dialog(`${mark(key.startsWith('song:')?'A SONG TO REMEMBER':'A MOMENT TO KEEP')}<h2>${q.question}</h2><p class="quiz-help">한 문제씩, 씨야를 조금 더 알아가요.<br>틀려도 괜찮아요. 힌트를 보고 다시 골라보세요.</p><div class="quiz-options">${q.choices.map((x,i)=>button(`<span>${i+1}</span>${x}`,'challenge-answer',String(i))).join('')}</div><p class="quiz-note" role="status">${note}</p><details class="quiz-hint"><summary>힌트 보기</summary><p>${q.explanation}</p>${link('관련 기록 보기',q.source)}</details>`);
}
function finishChallenge(){
 const key=activeChallenge,next=afterChallenge,q=M.challenges[key];
 activeChallenge=null;afterChallenge=null;
 if(key.startsWith('story:')&&!next)M.claim(s,key.slice(6));
 save();draw();
 if(next){next();return;}
 dialog(`${mark('MEMORY UNLOCKED')}<div class="reward-symbol" aria-hidden="true">✦</div><h2>${key.startsWith('song:')?title(key.slice(5))+' 수집 완료':'추억을 간직했어요'}</h2><p>${q.explanation}</p>${key==='story:album'?`<div class="outfit-reward">${outfitLineup(outfits.find(o=>o.id==='first-mind'))}<strong>The First Mind 의상을 얻었어요!</strong>${button('새 의상 입기','wear-reward','first-mind','primary')}</div>`:''}${key.startsWith('song:')?button('이 곡 연습하기','pick',key.slice(5),'primary'):M.storyById(key.slice(6))?button('다음 이야기 보기','stories-album',M.storyById(key.slice(6)).album,'primary'):button('추억 보러 가기','tab','3','primary')}${M.storyDestination(key)?button('다음 앨범 준비 확인하기','album-view',M.storyDestination(key),'primary'):''}${key.startsWith('song:')&&M.albumComplete(s,M.songAlbum(key.slice(5)).id)?`<p class="collected-note">${M.songAlbum(key.slice(5)).name} 전곡 수집 배지를 받았어요.</p>${button('앨범 여정 보기','album-view',M.songAlbum(key.slice(5)).id)}`:''}`);
}
const fanLetterInvite=()=>`<div class="concert-letter-invite"><p>지금의 감정을 방명록으로 남겨주세요.</p>${link('FAN LETTERS 쓰러 가기','/fan-letters/')}</div>`;
function perform(id){
 const albumId=id.startsWith('album:')?id.slice(6):null,finale=id==='finale'||albumId==='first-again';
 if(showing||albumId&&!M.concertReady(s,albumId)||id==='finale'&&!M.finaleReady(s)||!albumId&&id!=='finale'&&(id==='first'?!ready('scent'):!has('album')||s.setlist.length<2))return;
 const list=albumId?M.concertTracks(s,albumId):id==='finale'?M.albumById('first-again').tracks.filter(t=>!t.instrumental&&ready(t.id)).map(t=>t.id):id==='first'?['scent']:[...s.setlist];let i=0;showing=true;showHeld=false;
 function next(){
 if(!showing)return;
 if(i>=list.length){if(id==='finale'||albumId==='first-again')M.finishFinale(s);else if(!albumId)M.claim(s,id);const awarded=[];for(const a of M.albums)if((albumId?a.id===albumId:id!=='first')&&M.finishConcert(s,a.id,list))awarded.push(a.id);M.settle(s);showing=false;if(!save()){draw();saveNotice();return;}draw();
 dialog(`${mark('CURTAIN CALL')}<h2>${albumId?esc(M.albumById(albumId).name):finale?'우리의 빛, First, Again':id==='first'?'첫 무대의 기억':'우리의 불빛'}</h2>${stageArt(true,finale)}<p>함께한 무대를 간직했어요.</p>${awarded.map(a=>`<p class="collected-note">${esc(M.albumById(a).name)} 기념 티켓을 받았어요.</p>`).join('')}${albumId||awarded.length?button('기념 티켓 보기','ticket-open',albumId||awarded[0],'primary'):''}${fanLetterInvite()}${id==='first'?button('구두 연습하기','pick','shoes','primary')+button('1집 이야기 열기','album'):button('공연 목록으로','tab','4')}`);return;}
 dialog(`${mark('OUR CONCERT')}<h2>${title(list[i])}</h2>${stageArt(true,finale,i)}<p>${++i} / ${list.length}곡</p><div class="performance-controls">${button('응원 보내기','audience-cheer')}${button(showHeld?'자동 넘김 켜기':'이 장면 더 보기','show-hold')}${button('다음 곡','show-next')}${button('마지막 인사로','skip')}</div><p id="cheerEcho" role="status"></p>`);if(!showHeld)showTimer=setTimeout(next,M.timing.performanceMs);
 }
 $('#stageModal')._next=next;$('#stageModal')._finish=()=>{clearTimeout(showTimer);i=list.length;next();};next();
}

function testPanel(){
 if(!testTools)return;
 let backup=false;try{backup=Boolean(localStorage.getItem(checkpointKey));}catch{}
 const opts=testTools.options();
 dialog(`${mark('TEST ONLY')}<h2>원하는 구간부터 테스트</h2><p>선택한 앨범은 해금 직후, 이야기는 읽기 직전으로 이동해요. 이전 구간의 곡·연습·필수 조건은 준비됩니다.</p><label class="test-jump-label">이동할 구간<select id="testDestination"><optgroup label="앨범">${opts.filter(o=>!o.id.startsWith('story:')).map(o=>`<option value="${o.id}">${esc(o.label)}</option>`).join('')}</optgroup><optgroup label="이야기">${opts.filter(o=>o.id.startsWith('story:')).map(o=>`<option value="${o.id}">${esc(o.label)}</option>`).join('')}</optgroup></select></label>${button('선택한 구간으로 이동','test-jump-confirm','','primary')}<p class="private-note">처음 이동하기 전 기록을 이 브라우저에 따로 보관해요. 여러 구간을 테스트해도 원래 기록은 유지됩니다. 테스트 중 만든 기록은 ‘이동 전 기록으로 돌아가기’를 누르면 교체돼요.</p><div class="stack">${button('이동 전 기록으로 돌아가기','test-restore-confirm','','',!backup)}${button('미니게임 대기·오늘 횟수 초기화','test-mini-reset')}</div><p class="private-note">테스트 페이지 전용 기능입니다. 코인 보유량은 초기화하지 않아요.</p>`);
}
function replaceTestState(next){
 store?.adopt();s=next;M.memberIds.forEach(id=>delete preview[id]);track='scent';lastCards=new Set(M.memberCards(s).filter(c=>c.earned).map(c=>c.id));lastBadges=new Set(M.badges(s).filter(b=>b.earned).map(b=>b.id));lastStories=new Set(M.storyEntries.filter(e=>M.storyAvailable(s,e.id)).map(e=>e.id));clearTimeout(noticeTimer);$('#albumNotice').textContent='';warn='';close();
}
function testAction(a,v){
 if(!testTools||!a.startsWith('test-'))return false;
 if(a==='test-tools')testPanel();
 if(a==='test-jump-confirm'){const id=$('#testDestination').value,o=testTools.options().find(o=>o.id===id);if(o)dialog(`<h2>이 구간으로 이동할까요?</h2><p>${esc(o.label)}</p><p>현재 화면을 테스트용 진행 상태로 바꿉니다. 이동 전 기록은 따로 보관됩니다.</p>${button('취소','test-tools')}${button('이동하기','test-jump-apply',id,'primary')}`);}
 if(a==='test-jump-apply'){
  try{const next=testTools.create(v),old=localStorage.getItem(checkpointKey);if(old)M.loadSave(old);else localStorage.setItem(checkpointKey,JSON.stringify(s));localStorage.setItem(key,JSON.stringify(next));replaceTestState(next);const o=testTools.options().find(o=>o.id===v);selectedAlbum=o.album;if(v.startsWith('story:')){scene=2;storyAlbum=o.album;storyFilter='all';draw();const id=v.slice(6);M.storyById(id)?timeline(id):book(id);}else{scene=1;draw();}say('테스트 구간으로 이동했어요. 상단 테스트 이동에서 원래 기록으로 돌아갈 수 있어요.');}catch{dialog('<h2>이동하지 못했어요</h2><p>기록을 안전하게 저장할 수 없어요. 저장 공간을 확인하거나 백업을 내려받은 뒤 다시 시도해 주세요.</p>');}
 }
 if(a==='test-restore-confirm')dialog(`<h2>이동 전 기록으로 돌아갈까요?</h2><p>구간 이동 후의 테스트 진행은 원래 기록으로 교체됩니다.</p>${button('계속 테스트','test-tools')}${button('원래 기록 복원','test-restore-apply','','primary')}`);
 if(a==='test-restore-apply'){try{const next=M.loadSave(localStorage.getItem(checkpointKey));localStorage.setItem(key,JSON.stringify(next));localStorage.removeItem(checkpointKey);replaceTestState(next);scene=0;selectedAlbum=M.songAlbum(next.collected[next.collected.length-1]).id;draw();say('구간 이동 전 기록으로 돌아왔어요.');}catch{dialog('<h2>복원하지 못했어요</h2><p>보관된 기록을 읽을 수 없어요. 현재 기록은 그대로 두고 저장 관리에서 백업을 확인해 주세요.</p>');}}
 if(a==='test-mini-reset'){const earned=s.mini.earned;s.mini=M.mini.fresh();s.mini.earned=earned;save();close();scene=5;wardrobeView='coins';draw();say('테스트용으로 도전 횟수와 대기 시간을 초기화했어요. 보유 코인은 유지됩니다.');}
 return true;
}
function management(){
 dialog(`${mark('LOCAL SAVE')}<h2>저장 관리</h2><p>진행 상황은 이 주소를 여는 브라우저에 자동으로 저장돼요. 다른 기기로 옮기려면 백업 파일을 사용해 주세요.</p><div class="stack">${button('백업 내려받기','export')}${store?.dirty?button('저장 재시도','save-retry')+button('저장된 기록으로 돌아가기','saved-confirm'):button('백업 불러오기','import')+button('처음부터 다시 시작','reset')}</div>${button('마지막 백업 교체 전 기록 복원','restore-import')}${button('전환 전 원본 백업','export-before-simple')}<p role="status" id="saveNote">${store?.dirty?saveMessage():''}</p>`);
}
function sync(){try{const next=store?.pull();if(next)s=next;saveNotice();}catch{say('다른 탭의 기록을 읽지 못했어요. 현재 화면의 기록은 유지합니다.');}}
function handle(a,v){
 if(store?.dirty&&!['storage','export','export-before-simple','save-retry','saved-confirm','saved-apply','restore-import'].includes(a)){saveNotice();return;}
 if(a==='save-retry'){if(save()){draw();say('저장했어요. 이제 계속 진행할 수 있어요.');}return;}
 if(a==='saved-confirm'){dialog('<h2>저장된 기록으로 돌아갈까요?</h2><p>아직 저장하지 못한 현재 변경은 사라집니다. 먼저 현재 기록을 백업해 주세요. 다른 탭에 저장된 기록은 유지됩니다.</p>'+button('현재 기록 백업','export')+button('취소','storage')+button('저장된 기록으로 돌아가기','saved-apply'));return;}
 if(a==='saved-apply'){s=store.discard()||M.fresh();close();draw();saveNotice();say('저장된 기록을 불러왔어요.');return;}
 if(blocked&&!['storage','export','export-before-simple','import','import-confirm','reset','confirm-reset'].includes(a)){management();return;}
 if(testAction(a,v))return;
 if(ticketUI?.handle(a,v))return;
 if(miniUI.handle(a,v))return;
 if(a==='reunion-vcr'){vcrUI.show();return;}
 if(a==='card-kind'){cardKind=v;cardPage=0;draw();return;}
 if(a==='card-page'){cardPage=Math.max(0,Number(v)||0);draw();return;}
 if(a==='card-detail'){decoratingCard=null;badgePage=0;cardDetail(v);return;}
 if(a==='decorate-card'){if(!M.cardOwned(s,v))return;decoratingCard=v;badgePage=0;cardDetail(v);$('#modalBody .card-badge-editor')?.scrollIntoView({block:'start'});return;}
 if(a==='decorate-done'){decoratingCard=null;cardDetail(v);return;}
 if(a==='badge-page'&&decoratingCard){badgePage=Math.max(0,Number(v)||0);refreshCardEditor();return;}
 if(a==='card-badge'&&decoratingCard){if(M.decorateCard(s,decoratingCard,v)){save();draw();refreshCardEditor(v);}return;}
 if(a==='display-card'){if(M.cardOwned(s,v)){s.displayCard=v;save();draw();cardDetail(v);}return;}
 if(a==='audience-cheer'){const stage=$('#modalBody .stage-art');if(stage){stage.classList.remove('cheer-burst');void stage.offsetWidth;stage.classList.add('cheer-burst');$('#cheerEcho').textContent='씨야! 우리의 응원이 무대를 밝혀요.';}return;}
 if(a==='show-hold'&&showing){showHeld=!showHeld;clearTimeout(showTimer);$('#modalBody [data-action="show-hold"]').textContent=showHeld?'자동 넘김 켜기':'이 장면 더 보기';if(!showHeld)showTimer=setTimeout($('#stageModal')._next,M.timing.performanceMs);return;}
 if(a==='show-next'&&showing){clearTimeout(showTimer);$('#stageModal')._next();return;}
 if(a==='story-filter'){storyFilter=v;if(v==='core')storyAlbum='all';draw();return;}
 if(a==='stories-album'){storyAlbum=v;storyFilter='all';scene=2;if($('#stageModal').open)close();draw();$('#screen').focus({preventScroll:true});return;}
 if(a==='timeline'){timeline(v);return;}
 if(a==='badge-filter'){badgeFilter=v;draw();return;}
 if(a==='album-view'){if(!M.albumById(v))return;if($('#stageModal').open)close();selectedAlbum=v;scene=1;draw();$('#screen').focus({preventScroll:true});return;}
 if(a==='unlock-album'){if(!M.unlockAlbum(s,v))return;selectedAlbum=v;save();draw();chapterReward(M.albumById(v));return;}
 if(a==='tab'){if($('#stageModal').open)close();scene=Number(v);draw();$('#screen').focus({preventScroll:true});return;}
 if(a==='pick'){if($('#stageModal').open)close();if(!open(v))return;if($('#stageModal').open)close();scene=0;track=v;selectedAlbum=M.songAlbum(v).id;draw();$('.practice').scrollIntoView({block:'center'});return;}
 if(a==='wear-reward'){if(!M.outfitOwned(s,v))return;close();handle('outfit',v);return;}
 if(a==='mini-open'){scene=5;wardrobeView='coins';draw();const card=$('[data-action="mini-start"][data-value="'+v+'"]');card?.scrollIntoView({block:'center'});card?.focus();return;}
 if(a==='open-coins'){scene=5;wardrobeView='coins';draw();return;}
 if(a==='daily-coins'){if(M.claimDaily(s)){save();draw();say(`오늘의 출석 보상 ${M.dailyReward}코인을 받았어요.`);}else{draw();say('오늘의 출석 보상은 이미 받았어요.');}return;}
 if(a==='wardrobe-view'){wardrobeView=v;draw();return;}
 if(a==='shop-member'){if(M.memberIds.includes(v)){shopMember=v;draw();}return;}
 if(a==='shop-job'){const job=M.shopJobById(v);if(job&&M.startShopJob(s,Date.now(),v)){save();draw();say(`${job.name} 시작! ${job.seconds}초 뒤 ${job.reward}코인이 들어와요.`);}return;}
 if(a==='match-hair'){const id=styleId(v);if(M.equipPart(s,v,'hair',id)){if(preview[v]){delete preview[v].hair;if(!Object.keys(preview[v]).length)delete preview[v];}}else if(M.canWearOutfit(s,id)){preview[v]??={};preview[v].hair=id;}save();draw();return;}
 if(a==='shop-wear'){if(M.equip(s,shopMember,v)){delete preview[shopMember];save();draw();say('의상을 갈아입었어요. 내 옷장과 연습실에서 확인해 보세요.');}return;}
 if(a==='shop-buy'){
  const o=M.shopById(v);if(!o||M.styleOwned(s,v,shopMember)||M.coins(s)<o.price)return;
  dialog(`${mark('STAGE STYLE')}<h2>${M.members.find(m=>m.id===shopMember).name}의 스타일을 구매할까요?</h2><div class="shop-sprite">${sprite(shopMember,o)}</div><h3>${o.name}</h3><p>의상과 헤어 한 세트 · ${o.price}코인<br>구매 후 남는 코인: ${M.coins(s)-o.price}</p>${button('취소','shop-cancel')}${button('구매하고 입기','shop-confirm',v+':'+shopMember,'primary')}`);return;
 }
 if(a==='shop-cancel'){close();return;}
 if(a==='shop-confirm'){
  const [id,member]=v.split(':');if(!M.purchase(s,id,member)){close();draw();say('코인이나 보유 상태가 바뀌었어요. 다시 확인해 주세요.');return;}
  M.equip(s,member,id);delete preview[member];save();close();draw();say('구매한 스타일을 입었어요. 다른 멤버의 의상은 그대로예요.');return;
 }
 if(a==='outfit'){if(!outfits.some(x=>x.id===v)||!M.canWearOutfit(s,v))return;
  M.memberIds.forEach(id=>{if(M.equip(s,id,v))delete preview[id];else preview[id]={clothes:v,hair:v};});
  save();scene=0;draw();say(M.outfitOwned(s,v)?'세 멤버가 함께 갈아입었어요.':'미획득 의상을 미리 입어봐요. 새로고침하면 보유 의상으로 돌아가요.');$('#screen').focus({preventScroll:true});return;
 }
 if(a==='storage'){management();return;}
 if(a==='story'){book(v);return;}
 if(a==='album'){album();return;}
 if(a==='challenge'){challenge(v);return;}
 if(a==='challenge-answer'){
  if(!activeChallenge)return;
  if(!M.answer(s,activeChallenge,Number(v))){challenge(activeChallenge,afterChallenge,'조금 달라요. 힌트를 읽고 다시 골라보세요.');return;}
  finishChallenge();return;
 }
 if(a==='perform'){perform(v);return;}
 if(a==='skip'){if(showing)$('#stageModal')._finish();return;}
 if(a==='export-before-simple'){const raw=localStorage.getItem(key+'-before-simple');if(!raw){say('이 브라우저에는 전환 전 기록이 없어요.');return;}const url=URL.createObjectURL(new Blob([raw],{type:'application/json'})),el=document.createElement('a');el.href=url;el.download='seeya-before-simple.json';el.click();setTimeout(()=>URL.revokeObjectURL(url),3000);return;}
 if(a==='export'){const u=URL.createObjectURL(new Blob([blocked?localStorage.getItem(key):JSON.stringify(s,null,2)],{type:'application/json'}));const el=document.createElement('a');el.href=u;el.download='seeya-our-stage.json';el.click();setTimeout(()=>URL.revokeObjectURL(u),3000);return;}
 if(a==='import-confirm'){if(!pendingImport)return;try{localStorage.setItem(key+'-before-import',JSON.stringify(s));}catch{say('교체 전 기록을 보관하지 못했어요. 현재 기록은 유지됩니다.');return;}s=pendingImport;pendingImport=null;M.memberIds.forEach(id=>delete preview[id]);M.settle(s);blocked=false;save();close();scene=0;draw();say('진행 상황을 복원했어요.');return;}
 if(a==='restore-import'){try{const old=M.loadSave(localStorage.getItem(key+'-before-import'));s=old;save();close();draw();say('백업 교체 전 기록을 복원했어요.');}catch(e){if(e===saveFailure)throw e;say('보관된 기록을 복원하지 못했어요.');}return;}
 if(a==='import'){$('#stageFile').click();return;}
 if(a==='reset'){dialog(`<h2>처음부터 시작할까요?</h2><p>이 기기의 체험 기록이 지워져요.</p>${button('현재 기록 유지','storage')}${button('초기화하기','confirm-reset')}`);return;}
 if(a==='confirm-reset'){outfitId='base';M.memberIds.forEach(id=>delete preview[id]);try{localStorage.removeItem(outfitKey);}catch{}s=M.fresh();lastCards=new Set();lastBadges=new Set();lastStories=new Set();storyFilter='all';storyAlbum='all';selectedAlbum='first-mind';track='scent';scene=0;warn='';blocked=false;close();}
 if(a==='train'){if(M.train(s,track,Number(v)))say(s.queue?'다음 연습을 예약했어요.':'연습을 시작했어요.');}
 if(a==='cancel'){s.queue=null;say('예약을 취소했어요.');}

 if(a==='display'&&has(v))s.display=v;
 if(a==='remove')s.setlist=s.setlist.filter(x=>x!==v);
 if(a==='add'&&ready(v)&&!s.setlist.includes(v))s.setlist.push(v);
 if(a==='up'){const i=s.setlist.indexOf(v);if(i>0)[s.setlist[i-1],s.setlist[i]]=[s.setlist[i],s.setlist[i-1]];}
 save();draw();
}
async function locked(f,recovery=false){const run=async()=>{if(store?.dirty&&!recovery){saveNotice();return;}savingAction=true;try{return await f();}catch(e){if(e!==saveFailure)throw e;close();draw();saveNotice();}finally{savingAction=false;}};if(navigator.locks)await navigator.locks.request(key,run);else run();}
root.addEventListener('click',e=>{const el=e.target.closest('[data-action]');if(el)locked(()=>{sync();if(!store?.dirty&&M.settle(s))save();return handle(el.dataset.action,el.dataset.value);},true);});
root.addEventListener('input',e=>{if(e.target.id==='concertQuery'){concertQuery=e.target.value;$('#concertRows').innerHTML=concertRows();}});
root.addEventListener('change',e=>{if(['concertAlbum','concertKind'].includes(e.target.id)){if(e.target.id==='concertAlbum')concertAlbum=e.target.value;else concertKind=e.target.value;$('#concertRows').innerHTML=concertRows();return;}if(['cardMember','cardOwned'].includes(e.target.id)){if(e.target.id==='cardMember')cardMember=e.target.value;else cardOnlyOwned=e.target.checked;cardPage=0;draw();return;}if(e.target.dataset.member){const member=e.target.dataset.member,id=e.target.value,part=e.target.dataset.part,focus=e.target.id;locked(()=>{sync();if(M.equipPart(s,member,part,id)){if(preview[member]){delete preview[member][part];if(!Object.keys(preview[member]).length)delete preview[member];}}else if(M.canWearOutfit(s,id)){preview[member]??={};preview[member][part]=id;}save();draw();$('#'+focus)?.focus();});return;}if(e.target.id==='track'){track=e.target.value;draw();}if(e.target.id==='storyAlbum'){storyAlbum=e.target.value;if(storyFilter==='core')storyFilter='all';draw();$('#storyAlbum').focus();}});
$('#stageFile').onchange=async e=>{const file=e.target.files[0];if(!file)return;try{if(file.size>256000)throw Error();pendingImport=M.loadSave(await file.text());dialog('<h2>백업으로 교체할까요?</h2><p>현재 진행을 백업 파일의 내용으로 교체합니다. 교체 전 기록은 별도로 보관합니다.</p>'+button('취소','storage')+button('백업으로 교체','import-confirm','','primary'));}catch{if($('#saveNote'))$('#saveNote').textContent='이 게임의 유효한 백업 파일을 선택해 주세요.';}e.target.value='';};
$('#stageClose').onclick=close;$('#stageModal').addEventListener('close',()=>{showing=false;activeChallenge=null;afterChallenge=null;clearTimeout(showTimer);if(returnFocus?.isConnected)returnFocus.focus({preventScroll:true});else $('#screen').focus({preventScroll:true});});
window.addEventListener('storage',e=>{if(e.key===key){sync();draw();}});
function tick(){if(blocked||store?.dirty||document.hidden)return;miniUI.update();const now=Date.now();if($('#clock'))$('#clock').textContent=clock();if($('#jobClock')&&s.shopJob)$('#jobClock').textContent=Math.max(0,Math.ceil((s.shopJob.end-now)/1000));
 const due=s.active&&s.active.end<=now||s.shopJob&&s.shopJob.end<=now||s.points<100&&now>=s.energyAt+M.timing.recoveryMs||!s.active&&s.queue&&s.points>=5;
 if(due)locked(()=>{sync();const wasJob=M.shopJobById(s.shopJob?.kind),before={points:s.points,active:s.active,queue:s.queue},done=M.settle(s);save();if(done||before.active!==s.active||before.queue!==s.queue||(before.points<5)!==(s.points<5))draw();else if($('#studioPoints'))$('#studioPoints').innerHTML=s.points+'<small> / '+100+'</small>';if(done)say(wasJob&&!s.shopJob?`${wasJob.name} 완료! ${wasJob.reward}코인을 받았어요.`:'연습을 마쳤어요. 준비도가 올랐어요.');});
 if(coinDay!==M.kstDay()){coinDay=M.kstDay();draw();}
}
vcrUI=require('./our-stage-vcr')({M,root,state:()=>s,dialog,button,mark});
ticketUI=require('./our-stage-tickets')({M,state:()=>s,root,dialog,button,esc,save});
const miniUI=require('./our-stage-mini-v2')({M,root,state:()=>s,save,draw,dialog,button,esc,mark,locked,sync});
if(testTools)$('.os-heading').insertAdjacentHTML('beforeend',button('테스트 이동','test-tools','','test-tools-button'));
draw();tick();setInterval(tick,250);if(warn)say(warn);
if(!blocked){locked(()=>{sync();M.settle(s);save();draw();});document.addEventListener('visibilitychange',()=>{if(!document.hidden)locked(()=>{sync();M.settle(s);save();draw();});});}
})();
