(function(){'use strict';const modules={
"src/client/our-stage.js":function(module,exports,__require){
(function(){
'use strict';
const {isTest,key,outfitKey,connectKey}=__require("src/shared/our-stage-environment.js")(location.pathname);
const baseModel=isTest?__require("src/shared/our-stage.js").forTest():__require("src/shared/our-stage.js");
const M=__require("src/shared/our-stage-leisure.js")(__require("src/shared/our-stage-first-release.js")(__require("src/shared/our-stage-simple.js")(baseModel))),root=document.getElementById('ourStage');
if(!root)return;
const testTools=isTest?__require("src/shared/our-stage-test-tools.js")(M):null;
const checkpointKey='seeya-our-stage-before-test-jump-v1';
const $=q=>root.querySelector(q),art='/images/game/our-stage/';
const optimizedImages=__require("src/data/our-stage-optimized-images.json");
const optimized=html=>html.replace(/\/images\/game\/our-stage\/[^\s"'<>]+\.png/g,path=>optimizedImages[path]||path);
let vcrUI=null,ticketUI=null,giftUI=null,wallUI=null,coinUI=null,motionUI=null,roomDisplay=null,roomLife=null,roomPosters=null;
let activeChallenge=null,afterChallenge=null,returnFocus=null,blocked=false;
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const outfits=__require("src/data/our-stage-outfits.json");
const {nameTag}=__require("src/shared/our-stage-name-tag.js");
let outfitId='base';
try{const saved=localStorage.getItem(outfitKey);if(outfits.some(x=>x.id===saved))outfitId=saved;}catch{}
const skinVisual=__require("src/client/our-stage-skins.js"),decorArt=__require("src/client/our-stage-decor-art.js");
const styles=[...outfits,...M.shop,...M.capsuleOutfits],preview={},layers=__require("src/data/our-stage-layers.json");
const styleId=(id,part='clothes')=>preview[id]?.[part]||(part==='hair'?s.hair:s.equipped)[id];
const outfit=(id,part='clothes')=>styles.find(o=>o.id===styleId(id,part));
const motions=__require("src/shared/our-stage-motion-library.js");
const motionFor=id=>id==='scent'?'scent':id==='lovely-sweet-heart-01'?'greeting':false;
let artSequence=0;
const cardSmileHeads=Object.fromEntries(["still-here", "first-again", "base", "stage-seasons", "tour-encore", "tour-believe", "tour-varsity", "capsule-white", "capsule-silver"].map(id=>[id,art+'cards/'+id+'-subtle-smile.png']));
const mouthPositions=__require("src/data/our-stage-mouths.json");
const sprite=(id,override,motion=false,equippedOnly=false)=>{
 const filterId='stage-sprite-'+(++artSequence);
 const clothing=equippedOnly?styles.find(o=>o.id===s.equipped[id]):override||outfit(id),hair=equippedOnly?styles.find(o=>o.id===s.hair[id]):override||outfit(id,'hair'),head=layers[hair.id],body=layers[clothing.id],h=head.members[id],b=body.members[id];
 const {hw,hh,bh,bw,headX,headY,bodyX,bodyY}=__require("src/shared/our-stage-sprite-geometry.js")(id,hair.id,clothing.id,layers);
 // Expression follows the outfit; a separate hairstyle keeps its own face and accessories.
 const smileStyle=cardSmileHeads[clothing.id]&&hair.headKind!=='가면'?(cardSmileHeads[hair.id]?hair.id:clothing.id):null;
 const mouth=mouthPositions[hair.id][id],sourceMouth=smileStyle&&mouthPositions[smileStyle][id];
 const smilePatch=smileStyle?'<svg x="'+(mouth[0]-42)+'" y="'+(mouth[1]-21)+'" width="84" height="54" viewBox="'+[sourceMouth[0]-42,sourceMouth[1]-21,84,54].join(' ')+'" overflow="hidden"><image href="'+cardSmileHeads[smileStyle]+'" width="1536" height="1024"/></svg>':'';
 const part=(data,box,x,y,w,height,face=false)=>`<svg x="${x}" y="${y}" width="${w}" height="${height}" viewBox="${box.join(' ')}" overflow="hidden" preserveAspectRatio="none"><image href="${data.image}" width="${data.width}" height="${data.height}"/>${face?smilePatch:''}</svg>`;
 const headMarkup=`<g class="sprite-hair">${part({...head,image:head.headImage||head.image},h.head,headX,headY,hw,hh,true)}</g>`;
 const bodyMarkup=motion?__require("src/client/our-stage-choreo.js")({uid:filterId,image:part(body,b.body,0,0,234,333),head:headMarkup,x:bodyX,y:bodyY,width:bw,mode:motion,...(motion==='room'?{height:bh}:{})}):`${headMarkup}<g class="sprite-body">${part(body,b.body,bodyX,bodyY,bw,bh)}</g>`;
 return `<svg class="member-sprite" viewBox="0 0 440 680" ${motion?'preserveAspectRatio="xMidYMax meet"':''} role="img" aria-label="${M.members.find(x=>x.id===id).name} · 의상 ${clothing.name} · 헤어 ${hair.name}" data-clothes="${clothing.id}" data-expression="${smileStyle?'subtle-smile':'neutral'}" data-hair="${hair.id}"><defs><filter id="${filterId}" color-interpolation-filters="sRGB"><feComponentTransfer><feFuncA type="discrete" tableValues="0 0 0 0 0 0 0 1"/></feComponentTransfer></filter></defs><g filter="url(#${filterId})">${bodyMarkup}</g>${clothing.id==='practice'?nameTag(id):''}</svg>`;
};
const portrait=id=>`<div class="member-crop">${sprite(id)}</div>`;
const outfitLineup=o=>`<div class="outfit-sheet mapped-outfit" aria-label="${esc(o.name)} 멤버별 의상">${M.memberIds.map(id=>`<figure>${sprite(id,o)}<figcaption>${M.members.find(m=>m.id===id).name}</figcaption></figure>`).join('')}</div>`;
const outfitSummary=()=>M.memberIds.map(id=>M.members.find(m=>m.id===id).name+' · '+outfit(id).name+(preview[id]?' (미리입기)':'')).join(' / ');
const skinAttrs=id=>skinVisual.attributes(s.leisure.skins.cards[id]||{});
const stageSkinAttrs=decor=>{if(decor.background)return '';const i=M.capsules.byId(s.leisure.skins.stage);return i?`data-stage-skin="${i.motif}" style="--skin-stage:${i.color};--skin-stage-dark:${i.paper}"`:'';};
const stageArt=(live=false,finale=false,lead=0,album=null,caption='',motion=false,entrance=false,previewDecor=null,equippedOnly=false,soloMember=null)=>{const decor=previewDecor||s.leisure.decor.equipped;return `<figure class="stage-art${entrance?' stage-entrance'+(album?.id==='still-here'?' slow-entrance':''):''}${live?' live':''}${finale?' finale':''}${motion?' scent-choreo '+(motion==='greeting'?'greeting-choreo':''):''}" data-motion="${motion||''}" ${soloMember?'data-solo-member="'+soloMember+'"':''} ${stageSkinAttrs(decor)} data-shop-background="${decor.background||''}" aria-label="${soloMember?M.members.find(m=>m.id===soloMember).name+' 솔로 무대':finale?'씨야 응원봉이 객석을 채우는 4집 피날레':'세 멤버의 도트 공연 무대'}"><div class="stage-set" aria-hidden="true">${decor.background?decorArt.backdrop(decor.background):skinVisual.stageSet()}${decorArt.effect(decor.effect)}</div><div class="stage-trio">${(soloMember?[soloMember]:M.memberIds).map((id,i)=>`<div data-member="${id}" class="stage-performer ${lead%3===i?'lead':''}" style="--beat:${i*-.19}s;--phrase-delay:${i*.06}s;--arrival:${album?.id==='still-here'?8.1:4.5}s;--o:${id==='gr'?0:id==='br'?1:2}"><div class="stage-lift">${sprite(id,album?outfits.find(o=>o.id===album.id):motion?outfits.find(o=>o.id===motions[motion].album):undefined,motion,equippedOnly)}<svg class="stage-mic" viewBox="0 0 36 60" aria-hidden="true" shape-rendering="crispEdges"><path fill="#f3c8a6" d="M3 35h9v-7h9v20H3z"/><path fill="#252335" d="M17 14h9v31h-9z"/><path fill="#d8d2e4" d="M13 4h17v18H13z"/><path fill="#8d859b" d="M13 9h17v4H13z"/></svg></div></div>`).join('')}</div><div class="stage-confetti" aria-hidden="true">${finale&&!decor.effect?Array.from({length:18},(_,i)=>`<i style="--x:${(i*37)%100}%;--delay:${i*-.23}s"></i>`).join(''):''}</div><div class="stage-audience" aria-hidden="true">${decorArt.audience(decor.audience||'lightsticks')}</div><figcaption>${soloMember?M.members.find(m=>m.id===soloMember).name+'의 목소리로 채우는 무대':finale?'함께 모은 노래, 함께 밝히는 객석':'한 걸음씩, 세 목소리가 만드는 무대'}${(album?.id==='rebloom'||!album&&M.memberIds.some(id=>styleId(id)==='rebloom'))?' · 현재 세 멤버 의상 재해석':''}</figcaption></figure>`;};

let songView='albums',soloAlbum='solo-br',practiceView='albums',soloPracticeTrack=null;
let wardrobeView='closet',shopSection='clothes',shopMember='br',coinDay=M.kstDay();
const headings=['연습실','노래','이야기','기념품','공연','꾸미기'], icons=['♫','♬','▤','♡','✧','◇'];
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
const title=id=>M.songs.find(x=>x.id===id)?.title||M.soloTrackById(id)?.title||'';
const has=id=>M.has(s,id), ready=id=>M.ready(s,id), open=id=>M.open(s,id),pct=id=>M.percent(s,id);
function say(msg){$('#feedback').textContent=store?.dirty?saveMessage():msg;}
let store;try{store=__require("src/client/our-stage-storage.js")({storage:localStorage,key,load:M.loadSave});}catch{blocked=true;}
let backups;
try{backups=__require("src/client/our-stage-backups.js")({storage:localStorage,key,load:M.loadSave,summary:(state,id)=>({album:id?([...M.albums,...M.soloAlbums].find(a=>a.id===id)?.name||id):!state.simple.debuted?'연습생':([...M.albums].reverse().find(a=>M.albumUnlocked(state,a.id))?.name||M.albums[0].name),songs:M.count(state),solo:state.solo?.done.length||0})});}catch{}
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

function save(){if(!M.valid(s)){warn='기록의 형식을 확인하지 못해 저장을 멈췄어요. 현재 화면을 유지하고 백업해 주세요.';say(warn);if(savingAction)throw saveFailure;return false;}if(blocked||!store){warn='저장소를 사용할 수 없어요. 현재 화면을 닫지 말고 백업해 주세요.';say(warn);if(savingAction)throw saveFailure;return false;}const ok=store.write(s);saveNotice();if(!ok){if(savingAction)throw saveFailure;return false;}warn='';backups?.auto(s,Date.now(),!document.hidden);updateCollectionNotice();return true;}
function button(label,action,value='',kind='',disabled=false){return `<button class="${kind}" data-action="${action}" data-value="${value}" ${disabled?'disabled':''}>${label}</button>`;}
function link(label,url){return `<a target="_blank" rel="noopener noreferrer" href="${url}">${label} ↗</a>`;}
function panel(body,cls=''){return `<article class="panel ${cls}">${body}</article>`;}
function mark(t){return `<small class="eyebrow">${t}</small>`;}
function bars(n){return `<div class="bar"><b style="width:${n}%"></b></div>`;}
function goal(){
 if(M.soloUnlocked(s)&&!M.soloAlbums.every(a=>s.solo?.concerts[a.id]))return ['세 목소리, 세 개의 무대','멤버의 솔로곡을 연습하고 나만의 솔로 콘서트를 열어요.','솔로곡 만나기','solo-open',''];
 if(!s.simple.debuted)return [ready('scent')?'첫 무대를 준비했어요':'연습실에 처음 모인 날',ready('scent')?'곧 데뷔 무대가 시작돼요.':'여인의 향기로 우리의 첫 연습을 시작해요.',ready('scent')?'데뷔 무대 보기':'연습하기',ready('scent')?'perform':'train-all',ready('scent')?'first':'scent'];
 if(!ready('scent'))return ['첫 노래를 준비해요','세 가지 연습을 마치면 다음 곡이 열려요.','여인의 향기 연습하기','pick','scent'];
 if(!has('first'))return ['첫 무대의 기억','연습한 노래로 첫 무대를 열어보세요.','첫 무대 열기','perform','first'];
 if(!s.simple.debuted&&!has('album'))return ['첫 앨범을 펼쳐요','앨범의 이야기를 간직하고 다음 여정을 준비해요.','1집 이야기 열기','album',''];
 for(const a of M.albums){if(!M.albumUnlocked(s,a.id))continue;const t=a.tracks.find(t=>open(t.id)&&!ready(t.id));if(t)return [title(t.id)+' 연습하기','연습 완료 → 다음 곡 자동 해금','연습 이어가기','pick',t.id];}
 const show=M.albums.find(a=>M.concertReady(s,a.id)&&!s.simple.concerts[a.id]);if(show)return [show.name+' 콘서트','공연을 마치면 티켓과 다음 앨범이 열려요.','콘서트 열기','perform','album:'+show.id];
 const next=M.albums.find(a=>M.albumAvailable(s,a.id));if(next)return ['다음 앨범으로',next.name+'의 새 의상을 받아요.','앨범 열기','unlock-album',next.id];
 for(const a of M.albums.slice(1)){const req=M.albumRequirements(s,a.id);if(!M.albumUnlocked(s,a.id)&&req[0].done){const todo=req.find(r=>!r.done);if(todo)return ['다음 앨범 전에 만나는 이야기',todo.label,'이야기 열기',todo.action,todo.value];}}
 return ['우리의 콘서트','연습한 앨범으로 공연하고 기념 티켓을 모아요.','공연 보러 가기','tab','4'];
}

function clock(){return s.active?`${Math.max(0,Math.ceil((s.active.end-Date.now())/1000))}초`:'';}
function wallKeepsakes(){return wallUI.markup();}
function traineeRoom(){track='scent';return `<div class="studio-board trainee-studio">${mark('CHAPTER 00 · TRAINEE')}<h2>연습실에 처음 모인 날</h2><p>작은 연습 하나로, 우리의 첫 무대를 시작해요.</p><div class="room studio-room-v2 ${s.active?'is-practicing':''}">${roomDisplay.markup()}${roomDisplay.cardMarkup()}${roomPosters.markup()}${miniUI.machineButton()}<p class="room-status">${ready('scent')?'첫 무대에 설 준비가 됐어요.':'세 목소리가 처음 만나는 연습실'}</p>${roomLife.markup(true)}</div>${roomLife.controls()}${practice()}</div>`;}
function lyricStatus(){const q=M.wordTasks.find(q=>q.track===s.active?.track);if(!q||!s.simple.debuted)return '';const end=s.simple.wordDone[q.track]?q.tokens.length:s.active.lesson===2?q.tokens.length:Math.floor(q.tokens.length/3)*(s.active.lesson+1);return q.tokens.slice(0,end).join(' ');}
function studio(){
 if(!s.simple.debuted)return traineeRoom();
 const g=goal(),m=M.memberCards(s).find(x=>x.id===s.displayCard&&x.earned);
 const status=s.solo?.active?M.soloTrackById(s.solo.active.id).title+' 연습 중':s.active?(lyricStatus()||M.lessons[s.active.lesson].title+' 중'):'오늘도 연습, 또 연습!';
 return `<section class="studio-next"><div><small>다음 할 일</small><h3>${g[0]}</h3><p>${g[1]}</p></div>${button(g[2],g[3],g[4],'primary')}</section><div class="studio-layout"><article class="studio-board">
 <header class="studio-top"><div>${mark('REHEARSAL ROOM')}<h2>세 사람의 연습실</h2></div><div class="resources"><span>연습 포인트 <b id="studioPoints">${s.points}<small> / 100</small></b></span><span>모은 트랙 <b>${M.count(s)}<small> / ${albumSize}</small></b></span></div></header>
 <details class="progress-help"><summary>연습은 어떻게 하나요?</summary><p>보컬·팀 호흡·무대 동선 연습을 마치면 준비도 100%가 돼요. 다음 곡은 자동으로 열립니다.</p><p>연습 포인트는 ${M.timing.testMode?'1초':'90초'}마다 5씩 회복돼요.</p><p>연습과 활동 퀴즈로 코인을 모아 의상과 헤어를 살 수 있어요.</p></details><div class="room studio-room-v2${s.active||s.solo?.active?' is-practicing':''}">${roomDisplay.markup()}${roomDisplay.cardMarkup()}${roomPosters.markup()}${miniUI.machineButton()}<p class="room-status" role="status">${s.active?'♫ ':''}${status}</p>${roomLife.markup()}</div><div class="room-quick-actions">${button('전시장 보기','room-display')}${button('카드 고르기','room-cardbook')}${button('포스터 고르기','room-posters')}</div>${roomLife.controls()}
 ${roomPractice()}<div class="studio-coins"><div><small>코인</small><strong>${M.coins(s)} <span>코인</span></strong>${s.shopJob?'<p>활동 진행 중 · '+M.shopJobById(s.shopJob.kind).name+'</p>':''}</div>${button('코인 모으기','open-coins','','primary')}</div><div class="outfit-current"><details><summary>현재 의상</summary><span>${esc(outfitSummary())}</span></details>${button('의상 바꾸기','wardrobe-view','closet','link')}</div>${m?`<p class="display-card">벽에 전시 중 · ${M.cardMembers.find(x=>x.id===m.member).name} · ${esc(m.title)} ${button('카드북 열기','wardrobe-view','cards','link')}</p>`:''}</article>
 </div>`;
}
function roomPractice(){
 if(!M.soloUnlocked(s))return practice();
 const solo=practiceView==='solo'||!!s.solo?.active;
 const tabs='<div class="badge-filters room-practice-tabs" aria-label="연습 종류">'+button('앨범곡 연습','practice-view','albums',solo?'':'primary')+button('솔로곡 연습','practice-view','solo',solo?'primary':'')+'</div>';
 return tabs+(solo?soloUI.practice(soloPracticeTrack):practice());
}
function practice(){
 const trainee=!s.simple.debuted,nextTrack=!trainee&&ready(track)?M.songs.find(t=>open(t.id)&&!ready(t.id)):null;
 const remaining=M.lessons.filter((l,i)=>!s.tracks[track].includes(i)),cost=trainee?0:remaining.length*5,seconds=M.practiceSeconds(s,track),busy=s.active?.track===track,queued=s.queue?.track===track;
 const label=ready(track)?'연습 완료':busy?'연습 중':queued?'다음 연습 예약됨':trainee?'연습하기':`${s.active?'다음 연습 예약':'연습하기'} · ${cost}포인트 · ${seconds}초`;
 return panel(`${mark(trainee?'OUR FIRST SONG':'PRACTICE')}<div class="line"><h2>${trainee?'우리의 첫 연습':'오늘의 연습'}</h2></div>${trainee?'':`<div class="practice-picker"><label>앨범<select id="practiceAlbum" aria-label="연습할 앨범">${M.albums.filter(a=>a.tracks.some(t=>open(t.id))).map(a=>`<option value="${a.id}" ${M.songAlbum(track).id===a.id?'selected':''}>${esc(a.name)}</option>`).join('')}</select></label><label>노래<select id="track" aria-label="연습할 곡">${M.songAlbum(track).tracks.filter(x=>open(x.id)).map(x=>`<option value="${x.id}" ${track===x.id?'selected':''}>${esc(x.title)}${ready(x.id)?' · 완료':''}</option>`).join('')}</select></label></div>`}<div class="line"><b>${title(track)}</b><b>${pct(track)}%</b></div>${bars(pct(track))}<div class="practice-segments">${['보컬','팀 호흡','무대 동선'].map((name,i)=>`<span class="${s.tracks[track].includes(i)?'done':busy&&s.active.lesson===i?'current':''}">${name}</span>`).join('')}</div><div class="unified-practice">${button(label,'train-all',track,'primary',ready(track)||busy||queued||!!s.solo?.active||!!s.queue||(!s.active&&s.points<cost))}</div><div class="queue">${s.active?`진행 중 · ${title(s.active.track)} / ${M.lessons[s.active.lesson].title} <b id="clock">${clock()}</b>`:ready(track)&&trainee?'잠시 후 데뷔 무대가 시작돼요.':'진행 중인 연습이 없어요.'}${s.queue?`<br>다음 연습 · ${title(s.queue.track)} ${button('예약 취소','cancel','','link')}`:''}</div>${nextTrack?`<div class="practice-next"><div><small>다음 연습</small><strong>${esc(nextTrack.title)}</strong><p>${esc(M.songAlbum(nextTrack.id).name)} · 다음 무대를 준비해요.</p></div>${button('다음 곡 연습하기','practice-next',track+'|'+nextTrack.id,'primary')}</div>`:''}`,'practice');
}

const soloUI=__require("src/client/our-stage-solo.js")({M,state:()=>s,selected:()=>soloAlbum,button,esc,panel,link});
const soloSongs=()=>soloUI.songs(),soloConcertList=()=>soloUI.concerts();
function albumChecklist(id){const req=M.albumRequirements(s,id);return `<section class="comeback-checklist"><h3>다음 앨범을 만나는 방법</h3><p>이전 앨범의 콘서트를 마치면 자동으로 열려요. 이야기와 가사 과제는 원할 때 즐겨주세요.</p>${req.map(r=>`<p>${esc(r.label)}</p>${button('이전 앨범 보기','album-view',r.value.slice(6),'primary')}`).join('')}</section>`;}
function albumJourney(){
 return `<div class="album-journey" aria-label="앨범 여정">${M.albums.map((a,i)=>{const owned=M.albumUnlocked(s,a.id),done=M.albumComplete(s,a.id),can=M.albumAvailable(s,a.id);return `<button data-action="album-view" data-value="${a.id}" class="album-step ${selectedAlbum===a.id?'selected':''}" aria-pressed="${selectedAlbum===a.id}"><small>${a.type.split(' · ')[0]}</small><strong>${a.name}</strong><span>${done?'전곡 수집 완료':owned||i===0?M.albumCount(s,a.id)+' / '+a.tracks.length+'트랙':can?'해금 가능':'잠김'}</span></button>`;}).join('')}</div>`;
}
function albumConcertCard(a){const done=s.simple.concerts[a.id],can=M.concertReady(s,a.id);return `<article class="album-concert-card"><div><h3>${esc(a.name)}</h3><small>${done?'콘서트 완료 · 티켓 획득':can?'공연할 준비가 됐어요':'전곡 수집 + 보컬곡 연습 완료 후 열려요'}</small></div><div class="album-concert-actions">${button(done?'다시 공연하기':'앨범 콘서트','perform','album:'+a.id,can?'primary':'',!can)}${button('기념 티켓','ticket-open',a.id,'',!done)}${done?button('앙코르 무대','encore-open',a.id):''}</div></article>`;}
function songs(){
 const tabs='<div class="badge-filters" aria-label="노래 여정">'+button('앨범','song-view','albums',songView==='albums'?'primary':'')+button('솔로','song-view','solo',songView==='solo'?'primary':'')+'</div>';
 if(songView==='solo')return tabs+soloSongs();
 const a=M.albumById(selectedAlbum),n=M.albumCount(s,a.id),unlocked=a.id==='first-mind'||M.albumUnlocked(s,a.id);
 const list=a.tracks.map((t,i)=>`<article class="row song-row ${open(t.id)?'collected':'is-locked'}"><span class="num">${String(i+1).padStart(2,'0')}</span><div><h3>${esc(t.title)}</h3><small>${open(t.id)?'준비도 '+pct(t.id)+'%':i?'앞 곡 연습 완료 후 해금':'앨범 해금 후 열림'}${t.instrumental?' · 반주':''}</small></div>${button(open(t.id)?'연습하기':'잠김','pick',t.id,'',!open(t.id))}</article>`).join('');
 return `${tabs}${mark('ALBUM JOURNEY')}<h2>앨범을 한 장씩 펼쳐요</h2><p>앞 곡을 연습하면 다음 곡이 열려요.<br>앨범 콘서트를 마치면 다음 앨범이 자동으로 열려요.</p>${albumJourney()}${a.id==='still-here'?vcrUI.card():''}${panel(`<div class="line"><h2>${esc(a.name)}</h2><span class="status-pill">${n} / ${a.tracks.length}트랙</span></div>${!unlocked?albumChecklist(a.id)+button('앨범 열고 의상 받기','unlock-album',a.id,'primary',!M.albumAvailable(s,a.id)):''}${a.id==='rebloom'?'<p class="private-note">당시 활동 멤버는 김연지·이보람·수미입니다. 도트 의상은 현재 세 멤버의 재해석이에요.</p>':''}<div class="album-story-link">${button('이 시기의 이야기','stories-album',a.id)}</div><div class="song-list">${list}</div>${giftUI.taskList(a.id)}${albumConcertCard(a)}${link('앨범 원본 기록',a.source)}${M.albumMastered(s,a.id)&&M.albums.indexOf(a)<M.albums.length-1?button('다음 앨범 보기','album-view',M.albums[M.albums.indexOf(a)+1].id,'primary'):''}`)}`;
}

function storyEntries(){
 const core=[
 {id:'intro',date:'2006.02.24',title:'처음 모인 목소리',description:'여인의 향기 연습 · 게임 속 첫걸음',action:'pick',value:'scent',ok:true,done:ready('scent'),imageIndex:0,album:'first-mind'},
 {id:'first',date:'2006.02.24',title:'첫 무대의 기억',description:'여인의 향기 준비도 100%',action:'perform',value:'first',ok:ready('scent'),done:has('first'),imageIndex:1,album:'first-mind'},
 {id:'album',date:'2006.02.24',title:'노래로 채운 시간',description:'첫 무대 완료 후 열림',action:'album',value:'',ok:has('first'),done:has('album'),imageIndex:2,album:'first-mind'},
 ...M.members.map(m=>({id:m.id,date:m.date,title:m.title,subject:m.name,description:m.fact,condition:M.coreCondition(m.id),action:'story',value:m.id,ok:M.coreAvailable(s,m.id)||has(m.id),done:has(m.id),imageIndex:{yj:3,gr:4,br:5}[m.id],album:'see-you-again'})),
 {id:'reunion',date:'2020.02.21',title:'하나로 모인 기록',subject:'씨야',description:'2020년 슈가맨3에서 다시 함께 노래한 세 사람의 기록입니다.',condition:M.coreCondition('reunion'),action:'story',value:'reunion',ok:M.coreAvailable(s,'reunion')||has('reunion'),done:has('reunion'),imageIndex:6,album:'see-you-again'}
 ].map(e=>({...e,kind:'core'}));
 const all=[...core,...M.storyEntries.map(e=>({...e,ok:M.storyAvailable(s,e.id),done:M.storyDone(s,e.id),description:e.summary,condition:M.storyCondition(e.id),action:'timeline',value:e.id}))];
 return all;
}
function stories(){
 const entries=storyEntries().filter(e=>(storyAlbum==='all'||e.album===storyAlbum)&&(storyFilter==='all'||storyFilter===e.kind||storyFilter==='available'&&e.ok&&!e.done)).sort((a,b)=>a.date.localeCompare(b.date));
 return `${storyAlbum==='all'||storyAlbum==='still-here'?vcrUI.card():''}${mark('STORY BOOK')}<h2>무대 너머의 이야기</h2><div class="story-tools"><div class="badge-filters" aria-label="이야기 분류">${[['all','전체'],['available','새로 열린 이야기'],['album','앨범 이야기'],['event','사이드 이벤트'],['core','멤버·시작 이야기']].map(([id,n])=>`<button data-action="story-filter" data-value="${id}" aria-pressed="${storyFilter===id}">${n}</button>`).join('')}</div><label>앨범 <select id="storyAlbum">${[['all','전체 앨범'],...M.albums.map(a=>[a.id,a.name])].map(([id,n])=>`<option value="${id}" ${storyAlbum===id?'selected':''}>${n}</option>`).join('')}</select></label></div><div class="story-image-grid">${entries.map(e=>`<button type="button" class="story-image-card ${e.ok?'':'is-locked'}" data-action="story-detail" data-value="${esc(e.id)}" aria-label="${esc(e.title)} · ${e.done?'간직한 이야기 · 다시 보기':e.ok?'이야기 열기':'해금 안내'}"><span class="story-card-art" aria-hidden="true">${e.kind==='core'?storyArt(e.imageIndex):`<img src="${esc(e.image)}" alt="" loading="lazy">`}${e.done||!e.ok?`<span class="story-card-status">${e.done?'✓':'🔒'}</span>`:''}</span><span class="story-card-title">${esc(e.title)}</span></button>`).join('')||'<p>이 조건에 맞는 이야기가 없어요.</p>'}</div>`;
}
function storyDetail(id){const e=storyEntries().find(e=>e.id===id);if(!e)return;if(e.ok&&e.kind!=='core')return timeline(id);if(e.ok&&e.action==='story')return book(e.value);dialog(`${mark(e.date)}<h2>${esc(e.title)}</h2>${e.kind==='core'?storyArt(e.imageIndex,'story-modal-art'):entryArt(e)}<p>${esc(e.description)}</p>${e.ok?button(e.done?'다시 보기':'이야기 이어가기',e.action,e.value,'primary'):'<p>해금 조건 · '+esc(e.condition||e.description)+'</p>'}`);}
const cardFace=c=>`<div class="pixel-collectible ${c.kind} ${c.earned?'':'unearned'}" data-card="${c.id}" ${skinAttrs(c.id)}>${skinVisual.frame(s.leisure.skins.cards[c.id]?.frame)}<div class="collectible-top"><div class="card-brand"><img src="/images/game/our-stage/card-logo.svg" alt="SEEYA"><span>archive</span></div><span>${c.kind==='heritage'?'MEMBER':c.kind==='album'?'ALBUM':c.kind==='special'?'FINALE':'STORY'}</span></div><div class="collectible-art">${c.earned?(c.style?sprite(c.member,styles.find(o=>o.id===c.style),false):c.image?`<img src="${c.image}" alt="${esc(c.title)} 도트 카드">`:storyArt(c.scene)):'<span class="card-lock" aria-label="아직 얻지 못한 카드">?</span>'}</div><strong>${M.cardMembers.find(m=>m.id===c.member).name}</strong><span class="collectible-caption">${esc(c.title)}</span>${cardBadgeRow(c)}<small>No. ${String(M.memberCards(s).findIndex(x=>x.id===c.id)+1).padStart(2,'0')} · ${c.earned?'COLLECTED':'LOCKED'}</small></div>`;
function cardBadgeRow(c){const selected=s.cardDecorations[c.id]||[];return selected.length?`<div class="card-badge-row" aria-label="카드에 붙인 배지">${selected.map(id=>{const b=M.badges(s).find(b=>b.id===id);return `<span title="${esc(b.name)}" aria-label="${esc(b.name)}">${badgeImage(b)}</span>`;}).join('')}</div>`:'';}
function badgeEditor(c){
 const earned=M.badges(s).filter(b=>b.earned),selected=s.cardDecorations[c.id]||[],pages=Math.max(1,Math.ceil(earned.length/12));badgePage=Math.min(badgePage,pages-1);
 return `<section class="card-badge-editor"><div class="line"><h3>내 배지로 꾸미기</h3><strong>${selected.length} / 3개</strong></div><p>배지를 눌러 붙이거나 뗄 수 있어요.</p><div class="badge-selected">${selected.map(id=>button(esc(earned.find(b=>b.id===id).name)+' ×','card-badge',id)).join('')||'<small>아래에서 붙일 배지를 골라주세요.</small>'}</div><div class="badge-picker">${earned.slice(badgePage*12,badgePage*12+12).map(b=>`<button data-action="card-badge" data-value="${b.id}" aria-pressed="${selected.includes(b.id)}" ${selected.length===3&&!selected.includes(b.id)?'disabled':''}>${badgeImage(b)}<span>${esc(b.name)}</span></button>`).join('')||'<p>앨범과 이야기를 진행해 첫 배지를 모아보세요.</p>'}</div><nav class="card-pagination" aria-label="획득 배지 페이지">${button('이전','badge-page',String(badgePage-1),'',badgePage===0)}<span>${badgePage+1} / ${pages}</span>${button('다음','badge-page',String(badgePage+1),'',badgePage>=pages-1)}</nav>${selected.length===3?'<p class="private-note">3개를 모두 붙였어요. 다른 배지로 바꾸려면 하나를 먼저 떼어주세요.</p>':''}${button('꾸미기 완료','decorate-done',c.id,'primary')}</section>`;
}
function cardDetail(id){const c=M.memberCards(s).find(c=>c.id===id);if(!c)return;dialog(`${mark('MEMBER CARD')}<h2>${M.cardMembers.find(m=>m.id===c.member).name} · ${esc(c.title)}</h2>${cardFace(c)}<p>${esc(c.note||'')}</p>${c.source?link('당시 활동 기록',c.source):''}<p>${c.earned?'카드북에 간직했어요.':esc(c.hint)}</p><div class="card-detail-actions">${button(s.displayCard===c.id?'연습실 벽에 전시 중':'연습실 벽에 전시','display-card',c.id,'primary',!c.earned||s.displayCard===c.id)}${c.earned?button('배지로 꾸미기','decorate-card',c.id)+button('프레임·배경 꾸미기','capsule-editor',c.id):''}${button('카드북으로','wardrobe-view','cards')}</div>${decoratingCard===id&&c.earned?badgeEditor(c):''}`);}
function refreshCardEditor(focusValue){const top=$('#stageModal').scrollTop;cardDetail(decoratingCard);$('#stageModal').scrollTop=top;if(focusValue)$('#modalBody .badge-picker [data-value="'+focusValue+'"]')?.focus({preventScroll:true});}
function memories(){return `${mark('KEEPSAKES')}<h2>함께한 순간의 기념품</h2><div class="keepsake-actions">${button('내 아티스트 패스','pass-open')}${button('선물함 보기','gift-shelf')}</div>${panel('<h3>콘서트 기념 티켓</h3><p>앨범·솔로 콘서트를 마치면 자동으로 열려요.</p><div class="ticket-list">'+M.albums.map(a=>button(esc(a.name),'ticket-open',a.id,'',!s.simple.concerts[a.id])).join('')+'</div>'+ticketUI.gallery())}`;}
function cardbook(){

 const all=M.memberCards(s),filtered=all.filter(c=>(cardMember==='all'||c.member===cardMember)&&(cardKind==='all'||c.kind===cardKind)&&(!cardOnlyOwned||c.earned)),pages=Math.max(1,Math.ceil(filtered.length/12));cardPage=Math.min(cardPage,pages-1);
 return `${mark('MEMORY BOOK')}<h2>멤버 도트 카드북</h2><details class="collection-help"><summary>카드 모으는 방법</summary><p>앨범을 열면 멤버 카드 3장, 이야기를 간직하면 활동 카드를 얻어요. Rebloom에서는 수미의 기념 카드도 모여요.</p></details><div class="line"><strong>${all.filter(c=>c.earned).length} / ${all.length}장 수집</strong><label><input id="cardOwned" type="checkbox" ${cardOnlyOwned?'checked':''}> 모은 카드만</label></div><div class="cardbook-tools"><label>멤버 <select id="cardMember">${[['all','전체'],...M.cardMembers.map(m=>[m.id,m.name])].map(([id,n])=>`<option value="${id}" ${cardMember===id?'selected':''}>${n}</option>`).join('')}</select></label><div class="badge-filters">${[['all','전체'],['album','앨범'],['story','이야기'],['heritage','함께한 멤버'],['special','피날레']].map(([id,n])=>button(n,'card-kind',id,cardKind===id?'primary':'')).join('')}</div></div><div class="cardbook-grid">${filtered.slice(cardPage*12,cardPage*12+12).map(c=>`<article>${cardFace(c)}<p class="card-condition">${c.earned?'보유':'미획득'}</p>${button('상세 보기','card-detail',c.id)}</article>`).join('')||'<p>아직 모은 카드가 없어요. 앨범의 첫 페이지를 열어보세요.</p>'}</div><nav class="card-pagination" aria-label="카드북 페이지">${button('이전','card-page',String(cardPage-1),'',cardPage===0)}<span>${cardPage+1} / ${pages}</span>${button('다음','card-page',String(cardPage+1),'',cardPage>=pages-1)}</nav>`;
}

const badgeArt=__require("src/data/our-stage-badge-art.json");
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
const badgeShortName=name=>[['The First Mind','1집'],['Lovely Sweet Heart','2집'],['California Dream','2.5집'],['Brilliant Change','3집'],['First, Again','4집'],['See You Again','베스트']].reduce((text,[full,short])=>text.replace(full,short),name);
function badgeShelf(){
 const all=M.badges(s),filtered=all.filter(b=>badgeFilter==='all'||badgeFilter==='earned'&&b.earned||badgeFilter==='album'&&b.group==='앨범'||badgeFilter==='activity'&&b.group!=='앨범');
 return panel(`<div class="line"><h3>배지함</h3><small>${all.filter(b=>b.earned).length} / ${all.length}개</small></div><div class="badge-filters" aria-label="배지 필터">${[['all','전체'],['earned','획득'],['album','앨범'],['activity','이야기·활동']].map(([id,label])=>`<button data-action="badge-filter" data-value="${id}" aria-pressed="${badgeFilter===id}">${label}</button>`).join('')}</div><div class="badges compact-badges">${filtered.map(b=>`<button type="button" class="badge-card ${b.earned?'on':'unearned'}" data-action="badge-detail" data-value="${esc(b.id)}" aria-label="${esc(b.name)} · ${b.earned?'보유':'미획득'} · 상세 보기">${badgeImage(b)}<strong>${esc(badgeShortName(b.name))}</strong><small>${b.earned?'보유':'미획득'}</small></button>`).join('')||'<p>아직 획득한 배지가 없어요. 첫 연습부터 시작해 보세요.</p>'}</div>`);
}


const storyArt=(i,cls='story-tile')=>i===0?`<img class="${cls}" src="${art}stories/intro-practice.png" alt="처음 모인 목소리 · 연습복 도트 삽화">`:`<svg class="${cls}" viewBox="${i%4*450+3} ${Math.floor(i/4)*450+3} 444 444" role="img" aria-label="${['처음 모인 목소리','첫 무대의 기억','노래로 채운 시간','가면 너머의 목소리','카메라 앞에서','또 다른 하모니','하나로 모인 기록','우리의 콘서트'][i]} 도트 삽화"><svg x="${i%4*450+3}" y="${Math.floor(i/4)*450+3}" width="444" height="444" viewBox="${i%4*450+3} ${Math.floor(i/4)*450+3} 444 444" overflow="hidden"><image href="${art}pixel-stories-period.png" width="1800" height="900" preserveAspectRatio="none"/></svg></svg>`;
function entryArt(e){
 return `<div class="timeline-art scene-art"><img src="${e.image}" alt="${esc(e.title)} 도트 삽화" loading="lazy"></div>`;
}
function timeline(id){
 const e=M.storyById(id);if(!e||!M.storyAvailable(s,id))return;
 dialog(`${mark((e.kind==='album'?'ALBUM STORY':'SIDE EVENT')+' · '+e.date)}<span class="story-subject">${esc(e.subject)}</span><h2>${esc(e.title)}</h2>${entryArt(e)}<details class="illustration-source"><summary>그림 참고 자료</summary><p>${esc(e.illustrationNote||'기록을 바탕으로 재구성한 도트 삽화입니다.')} ${e.wardrobeSource?link('의상 참고 자료',e.wardrobeSource):''}</p></details><div class="story-prose">${e.body.map(t=>`<p>${esc(t)}</p>`).join('')}</div>${link('원본 기록 확인',e.source)}${e.archiveUrl?link('공연 기록 모아보기',e.archiveUrl):''}${e.contextSource?link('관련 인터뷰·보도 확인',e.contextSource):''}${e.identitySource?link('가면의 주인공 확인',e.identitySource):''}${e.badgeName?'<p class="collected-note">완료 보상 · '+esc(e.badgeName)+' 배지</p>':''}<hr>${M.storyDone(s,id)?'<p class="collected-note">이 이야기를 추억에 간직했어요.</p>':button('이야기 한 조각 풀기','challenge','story:'+id,'primary')}${button('이 시기의 이야기 보기','stories-album',e.album)}`);
}
function chapterReward(a){
 dialog(`${mark('ALBUM UNLOCKED')}<h2>${a.name} 해금!</h2>${a.id==='still-here'?vcrUI.card():''}<div class="outfit-reward">${outfitLineup(outfits.find(o=>o.id===a.id))}<strong>새 의상, 멤버 도트 카드 3장과 앨범 해금 배지를 얻었어요.</strong>${a.id==='rebloom'?'<p>함께했던 수미의 카드와 ‘모든 멤버 해금’ 배지도 받았어요.</p>':''}${button('새 의상 입기','wear-reward',a.id,'primary')}</div>${button('이 앨범의 곡 만나기','album-view',a.id)}${button('새로 열린 앨범 이야기','timeline',M.storyEntries.find(e=>e.kind==='album'&&e.album===a.id).id)}`);
}

function outfitCard(o,detail=false){
 const owned=M.outfitOwned(s,o.id),wearing=M.memberIds.every(id=>styleId(id)===o.id&&styleId(id,'hair')===o.id);
 const status=['base','practice'].includes(o.id)?'처음부터 보유':owned?'획득 완료':'미획득 · 테스트 미리입기';
 const condition=o.id==='practice'?'새 게임은 이 연습복으로 시작해요.':o.id==='base'?'기존 콘서트 의상도 자유롭게 입을 수 있어요.':o.id==='first-mind'?'이야기 E03 「노래로 채운 시간」을 완료하면 얻어요.':`${esc(o.name)} 앨범을 해금하면 얻어요.`;
 if(!detail)return panel(`${outfitLineup(o)}<h3>${esc(o.name)}</h3><span class="outfit-ownership">${owned?'보유':'미획득'}</span>${button('상세 보기','outfit-detail',o.id)}`,'outfit-card compact-outfit');
 return panel(`${outfitLineup(o)}${mark(o.type)}<h2>${esc(o.name)}</h2><span class="outfit-ownership ${owned?'owned':'preview'}">${status}</span><p class="outfit-condition">${condition}</p><p class="outfit-note">${o.note}</p>${o.wardrobeSource?link('의상 참고 사진',o.wardrobeSource):''}${o.url?`<details><summary>참고한 앨범 보기</summary>${link('앨범 정보',o.url)} · ${link('커버 이미지',o.cover)}</details>`:''}${button(wearing?(owned?'입고 있는 의상':'미리 입는 중'):owned?'세 멤버 함께 입기':'테스트로 미리 입기','outfit',o.id,wearing?'':'primary',wearing||!M.canWearOutfit(s,o.id))}`,'outfit-card');
}
function wardrobe(){
 const options=(id,part)=>styles.filter(o=>(!M.shopById(o.id)&&!o.reward)||M.styleOwned(s,o.id,id)).map(o=>`<option value="${o.id}" ${styleId(id,part)===o.id?'selected':''}>${esc(o.name)}${M.styleOwned(s,o.id,id)?'':' · 테스트 미리입기'}</option>`).join('');
 return `<h2>내 옷장</h2><details class="collection-help"><summary>멤버별 의상·헤어 조합</summary><p>의상과 헤어·가면을 따로 골라요. 귀고리는 헤어에 맞춰 바뀝니다.</p>
 <div class="member-wardrobe">${M.memberIds.map(id=>panel(`<div class="wardrobe-sprite">${sprite(id)}</div><h3>${M.members.find(m=>m.id===id).name}</h3><label class="wardrobe-part" for="wear-${id}">의상<select id="wear-${id}" data-member="${id}" data-part="clothes" aria-label="${M.members.find(m=>m.id===id).name} 의상">${options(id,'clothes')}</select></label><label class="wardrobe-part" for="hair-${id}">헤어·가면<select id="hair-${id}" data-member="${id}" data-part="hair" aria-label="${M.members.find(m=>m.id===id).name} 헤어·가면">${options(id,'hair')}</select></label><small>${preview[id]?'미획득 스타일 미리입기 · 새로고침하면 보유 조합으로 돌아가요.':'보유 스타일'}</small>${button('이 의상과 같은 헤어로','match-hair',id,'link')}`)).join('')}</div>
 </details><details class="collection-help"><summary>의상 획득 안내</summary><p class="private-note">앨범 미리입기는 테스트 기능이에요. 상점 스타일은 해당 멤버가 구매한 뒤 조합할 수 있어요.<br>Rebloom은 현재 세 멤버의 재해석입니다.</p></details>${miniUI.wardrobe()}<h3>연습복·콘서트 세트</h3><div class="outfit-grid">${outfits.filter(o=>['base','practice'].includes(o.id)).map(o=>outfitCard(o)).join('')}</div><h3>앨범 의상 세트</h3><div class="outfit-grid">${outfits.filter(o=>!['base','practice'].includes(o.id)).map(o=>outfitCard(o)).join('')}</div>`;
}
function coinRoom(){
 const active=s.shopJob&&M.shopJobById(s.shopJob.kind),daily=M.canClaimDaily(s);
 return `<div class="line"><div>${mark('BACKSTAGE')}<h2>코인 모으기</h2></div><strong class="coin-wallet">코인 <b>${M.coins(s)}</b></strong></div>
 ${panel(`<div class="line"><div><h3>오늘의 연습실 출석</h3><p>하루 한 번, ${M.dailyReward}코인 · 한국 시간 자정에 새로 시작해요.</p></div>${button(daily?M.dailyReward+'코인 받기':'오늘 받았어요','daily-coins','','primary',!daily)}</div>`,'daily-coins')}
 ${miniUI.room()}
 ${panel(`<div class="line"><div><h3>보상 없이, 잠깐 쉬어가기</h3><p>멤버 사천성 · 시간 제한 없이 즐겨요.</p></div>${button('사천성 하러 가기','wardrobe-view','rest')}</div>`)}
 <div class="coin-actions">${button('코인 상점에서 사용하기','wardrobe-view','shop','primary')}${button('연습실로','tab','0')}</div>`;
}
function shop(){
 const tabs='<div class="badge-filters shop-section-tabs" aria-label="상점 분류">'+[['clothes','의상'],['stage','무대']].map(([id,label])=>button(label,'shop-section',id,shopSection===id?'primary':'')).join('')+'</div>';
 if(shopSection==='stage')return `<div class="line"><h2>코인 상점</h2><strong class="coin-wallet">${M.coins(s)} 코인</strong></div>${tabs}${stageShopUI.panel()}`;
 const income=M.earnings(s),member=M.members.find(m=>m.id===shopMember);
 return `<div class="line"><div><h2>코인 상점</h2><p>무대의 의상과 헤어를 한 사람씩 모아요.</p></div><strong class="coin-wallet">코인 <b>${M.coins(s)}</b></strong></div>${tabs}
 ${panel(`<div class="line"><div><h3>오늘의 코인 모으기</h3></div>${button('코인 모으기','open-coins','','primary')}</div>`)}
 <details class="coin-guide"><summary>코인은 어떻게 모으나요?</summary><ul class="coin-income-list"><li>새 노래 수집 <b>5코인</b></li><li>연습 과제 완료 <b>2코인</b></li><li>첫 여정 이야기 <b>5코인</b></li><li>앨범 이야기·이벤트 <b>8코인</b></li><li>매일 출석 <b>20코인</b></li><li>활동 퀴즈 <b>최대 20코인</b></li><li>스타일 짝 맞추기 <b>최대 20코인</b></li><li>이야기 그림 맞추기 <b>최대 20코인</b></li><li>스케줄 가는 길 <b>8~12코인 · 하루 2회</b></li></ul><p class="private-note">수집·연습·이야기 보상은 처음 한 번만 받아요.<br>코인은 의상과 헤어 구매에 사용할 수 있어요.</p></details>
 <div class="badge-filters shop-members" aria-label="구매할 멤버">${M.memberIds.map(id=>button(M.members.find(m=>m.id===id).name,'shop-member',id,shopMember===id?'primary':'')).join('')}</div>
 <p>${member.name}의 스타일을 골라주세요. 다른 멤버의 의상은 따로 구매할 수 있어요.</p>
 <div class="shop-grid">${M.shop.map(o=>{const owned=M.styleOwned(s,o.id,shopMember);return panel(`<div class="shop-sprite">${sprite(shopMember,o)}</div><h3>${esc(o.name)}</h3>${button('상세 보기','shop-detail',o.id)}<div class="shop-price"><b>${owned?'보유 중':o.price+'코인'}</b>${button(owned?'입기':M.coins(s)<o.price?(o.price-M.coins(s))+'코인 더 필요':'구매하기',owned?'shop-wear':'shop-buy',o.id,'primary',!owned&&M.coins(s)<o.price)}</div>`,'shop-card');}).join('')}</div>`;
}
function designs(){
 return `<div class="badge-filters wardrobe-tabs" aria-label="꾸미기 메뉴">${[['closet','내 옷장'],['cards','카드북'],['badges','배지함'],['stage','무대 꾸미기'],['shop','코인 상점'],['capsule','뽑기'],['coins','코인 모으기'],['rest','쉬어가기']].map(([id,n])=>`<button data-action="${id==='capsule'?'capsule-open':'wardrobe-view'}" data-value="${id}" aria-pressed="${wardrobeView===id}">${n}</button>`).join('')}</div>${wardrobeView==='rest'?connectUI.render():wardrobeView==='drive'?miniUI.drivePanel():wardrobeView==='capsule'?miniUI.capsulePanel():wardrobeView==='cards'?cardbook():wardrobeView==='stage'?miniUI.stagePanel():wardrobeView==='coins'?coinRoom():wardrobeView==='shop'?shop():wardrobeView==='badges'?badgeShelf():wardrobe()}`;
}
function concertRows(){
 const match=id=>{const t=M.songAlbum(id).tracks.find(t=>t.id===id);return title(id).toLocaleLowerCase().includes(concertQuery.toLocaleLowerCase())&&(concertAlbum==='all'||M.songAlbum(id).id===concertAlbum)&&(concertKind==='all'||Boolean(t.instrumental)===(concertKind==='inst'));};
 const label=id=>`<b>${esc(title(id))}</b><small>${esc(M.songAlbum(id).name)} · ${M.songAlbum(id).tracks.find(t=>t.id===id).instrumental?'반주':'보컬'}</small>`;
 const selected=s.setlist.map((id,i)=>({id,i})).filter(x=>match(x.id)),available=M.ids.filter(id=>ready(id)&&!s.setlist.includes(id)&&match(id));
 return `<p>담은 곡 ${s.setlist.length}개 · 검색 결과 ${selected.length+available.length}개</p>${selected.map(({id,i})=>`<div class="row"><span class="num">${i+1}</span><div class="concert-track-name">${label(id)}</div><div class="tools">${button('위로','up',id,'',i===0)}${button('빼기','remove',id)}</div></div>`).join('')}${available.map(id=>`<div class="row"><div class="concert-track-name">${label(id)}</div>${button('담기','add',id)}</div>`).join('')||'<p>이 조건의 준비된 곡이 없어요.</p>'}`;
}
function concert(){return panel(`<div class="line"><h2>앨범 콘서트</h2><div class="action-row">${button('무대 꾸미기','capsule-stage')}${button('내 아티스트 패스','pass-open')}</div></div><p>연습한 노래가 하나의 공연으로. 콘서트를 마치면 다음 앨범이 열려요.</p><div class="album-concert-list">${M.albums.map(albumConcertCard).join('')}</div>${soloConcertList()}<div class="growth-actions">${link('라디오로 여운 이어가기','/radio/')}${link('다이어리에 추억 남기기','/diary/')}</div>`);}
function draw(){const focus=document.activeElement,restore=focus&&($('#screen').contains(focus)||$('#tabs').contains(focus)),identity=restore?{id:focus.id,action:focus.dataset.action,value:focus.dataset.value,start:focus.selectionStart,end:focus.selectionEnd}:null;const a=M.albumById(selectedAlbum);if(!s.simple.debuted)scene=0;$('.os-chapter').innerHTML=!s.simple.debuted?mark('CHAPTER 00 · TRAINEE')+'<strong>연습실에 처음 모인 날</strong>':mark(a.type)+'<strong>'+a.name+'</strong><small>'+M.albumCount(s,a.id)+' / '+a.tracks.length+'트랙 수집</small>'; if(!open(track))track='scent';$('#tabs').innerHTML=(s.simple.debuted?headings:headings.slice(0,1)).map((name,i)=>`<button data-action="tab" data-value="${i}" aria-current="${scene===i?'page':'false'}"><span>${icons[i]}</span>${name}</button>`).join('');$('#screen').innerHTML=optimized([studio,songs,stories,memories,concert,designs][scene]());wallUI?.refresh();ticketUI?.refreshGallery();roomLife?.bind();if(identity){const next=identity.id?document.getElementById(identity.id):[...root.querySelectorAll('[data-action]')].find(e=>e.dataset.action===identity.action&&e.dataset.value===identity.value);if(next){next.focus({preventScroll:true});if(identity.start!=null&&next.setSelectionRange)try{next.setSelectionRange(identity.start,identity.end);}catch{}}}}
function dialog(content){motionUI?.stop();coinUI?.clearStage();vcrUI?.destroy();if(!$('#stageModal').open)returnFocus=document.activeElement;$('#modalBody').innerHTML=optimized(content);$('#modalBody').scrollTop=0;$('#stageModal').scrollTop=0;const h=$('#modalBody h2');if(h){h.id='stageModalTitle';h.tabIndex=-1;}if(!$('#stageModal').open)$('#stageModal').showModal();h?.focus({preventScroll:true});}
function close(){motionUI?.stop();coinUI?.clearStage();window.clearTimeout(showTimer);showing=false;$('#stageModal').close();}
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
 dialog(`${mark('MEMORY UNLOCKED')}<div class="reward-symbol" aria-hidden="true">✦</div><h2>${key.startsWith('song:')?title(key.slice(5))+' 수집 완료':'추억을 간직했어요'}</h2><p>${q.explanation}</p>${key==='story:album'?`<div class="outfit-reward">${outfitLineup(outfits.find(o=>o.id==='first-mind'))}<strong>The First Mind 의상을 얻었어요!</strong>${button('새 의상 입기','wear-reward','first-mind','primary')}</div>`:''}${key.startsWith('song:')?button('이 곡 연습하기','pick',key.slice(5),'primary'):M.storyById(key.slice(6))?button('다음 이야기 보기','stories-album',M.storyById(key.slice(6)).album,'primary'):button('카드북 보기','wardrobe-view','cards','primary')}${M.storyDestination(key)?button('다음 앨범 준비 확인하기','album-view',M.storyDestination(key),'primary'):''}${key.startsWith('song:')&&M.albumComplete(s,M.songAlbum(key.slice(5)).id)?`<p class="collected-note">${M.songAlbum(key.slice(5)).name} 전곡 수집 배지를 받았어요.</p>${button('앨범 여정 보기','album-view',M.songAlbum(key.slice(5)).id)}`:''}`);
}
const fanLetterInvite=()=>`<div class="concert-letter-invite"><p>지금의 감정을 방명록으로 남겨주세요.</p>${link('FAN LETTERS 쓰러 가기','/fan-letters/')}</div>`;
function perform(id){
 const solo=id.startsWith('solo:'),soloId=solo?id.slice(5):null;
 const encore=id.startsWith('encore:'),encoreId=encore?id.slice(7):null,albumId=id.startsWith('album:')?id.slice(6):encore?M.songAlbum(encoreId)?.id:id==='finale'?'first-again':null,a=solo?M.soloById(soloId):M.albumById(albumId);
 if(showing||solo&&!M.soloConcertReady(s,soloId)||encore&&(!s.simple.concerts[albumId]||!M.concertTracks(s,albumId).includes(encoreId))||a&&!solo&&!encore&&!M.concertReady(s,albumId)||!a&&id!=='first'||id==='first'&&!ready('scent'))return;
 const list=solo?a.tracks.map(t=>t.id):a?M.concertTracks(s,albumId):['scent'],useEquipped=solo||encore||!!(a&&s.simple.concerts[albumId]);
 const phases=(encore?[encoreId]:list).map((song,i,all)=>({name:encore?'앙코르':!a?'첫 무대':i===0?'오프닝':i===all.length-1?'마지막 곡':'메인 무대',songs:[song]}));
 let i=0;showing=true;showHeld=false;coinUI.begin();
 const duration=4000,entrance=a&&!encore?(a.id==='still-here'?8100:4500):0;
 const concertMotion=motionFor(list.find(song=>motionFor(song)))||(a&&M.albums.indexOf(a)%2===1?'greeting':'scent');
 function next(){
 if(!showing)return;
 if(i>=phases.length){showing=false;motionUI.stop();coinUI.clearStage();
 if(encore){dialog(`${mark('ENCORE')}<h2>다시 만난 ${esc(title(encoreId))}</h2>${coinUI.summary()}${fanLetterInvite()}${button('공연 목록으로','tab','4')}`);return;}
 if(solo){M.finishSoloConcert(s,soloId);if(!save())return;draw();ticketUI.show(soloId,'<p>'+esc(a.artist)+'의 솔로 무대 배지를 간직했어요.</p>'+coinUI.summary()+fanLetterInvite()+button('다른 솔로곡 만나기','solo-open','','primary'));return;}
 if(!a){M.finishDebut(s);if(!save())return;draw();ticketUI.showPass(`<div class="debut-rewards"><h3>첫 무대를 함께 완성했어요</h3>${coinUI.summary()}<p>연습생 수료 배지 · 첫 무대 포스터 · 1집 의상 · 아티스트 패스</p>${outfitLineup(outfits.find(o=>o.id==='first-mind'))}${button('1집 의상 입기','wear-reward','first-mind')}<p>성공적으로 데뷔했어요. 이제 연습에 포인트가 소모됩니다.</p>${button('1집 연습 시작하기','pick','shoes','primary')}</div>`);return;}

 const wasOpen=new Set(s.albums);M.finishConcert(s,albumId,list);if(albumId==='first-again')M.finishFinale(s);M.settle(s);if(!save())return;draw();
 const following=M.albums[M.albums.indexOf(a)+1],opened=following&&!wasOpen.has(following.id)&&M.albumUnlocked(s,following.id);
 const footer=`${coinUI.summary()}${following?`<div class="curtain-next"><h3>${opened?'다음 앨범이 열렸어요': '다음 여정'} · ${esc(following.name)}</h3>${opened?'<p>앨범 의상과 멤버 카드도 함께 받았어요.</p>'+(following.id==='rebloom'?'<p>함께했던 수미의 카드와 ‘모든 멤버 해금’ 배지도 받았어요.</p>':'')+'':''}${button('다음 앨범으로',opened&&following.id==='still-here'?'bridge-then-album':'album-view',following.id,'primary')}</div>`:'<div class="curtain-next"><h3>세 목소리의 새로운 무대가 열렸어요</h3><p>20주년 단체 카드와 멤버별 솔로 여정을 만나요.</p>'+button('단체 카드 보기','card-detail','group:the-fan')+button('솔로곡 만나기','solo-open','','primary')+'</div>'}${fanLetterInvite()}${button('공연 목록으로','tab','4')}`;
 ticketUI.show(albumId,footer);return;
 }
 const phase=phases[i],phaseDuration=duration+(i===0?entrance:0),last=i===phases.length-1,theme=a?__require("src/data/our-stage-album-keepsakes.json")[a.id].colors[1]:'#895570';i++;$('#stageModal')._duration=phaseDuration;
 if(i===1){dialog(`<div class="album-show" style="--album-light:${theme}"><h2 class="concert-accessible-title">${solo?esc(a.name):'우리의 콘서트'}</h2>${stageArt(true,last&&!!a,i-1,solo?null:a,esc(phase.name),concertMotion,!!entrance,null,useEquipped,solo?a.member:null)}<div class="concert-medley${phase.name==='메들리'?' is-medley':''}"><div>${phase.songs.map(t=>`<span>${esc(title(t))}</span>`).join('')}</div></div><p id="concertPhase">${esc(phase.name)} · ${i} / ${phases.length}곡</p>${coinUI.counter()}<div class="performance-controls">${button('응원 보내기','audience-cheer')}${button(showHeld?'자동 넘김 켜기':'잠시 멈추기','show-hold')}${button('다음 곡','show-next')}${button('마지막 인사로','skip')}</div><p id="cheerEcho" role="status"></p></div>`);const stage=$('#modalBody .stage-art');motionUI.mount(stage,entrance);motionUI.pause(showHeld||document.hidden);coinUI.mount(stage,phases.length*duration+entrance,entrance);coinUI.pause(showHeld||document.hidden);if(stage?.classList.contains('stage-entrance')){stage.addEventListener('animationend',e=>{if(e.animationName==='our-stage-lift'&&e.target.closest('.stage-performer')?.style.getPropertyValue('--o')==='2')stage.classList.add('entrance-lit');});}
 }else{
 // Keep the same stage and animation clock across song boundaries.
 $('#modalBody .concert-medley div').innerHTML=phase.songs.map(t=>`<span>${esc(title(t))}</span>`).join('');
 $('#concertPhase').textContent=phase.name+' · '+i+' / '+phases.length+'곡';
 if(last&&a){const stage=$('#modalBody .stage-art');stage.classList.add('finale');stage.querySelector('.stage-confetti').innerHTML=Array.from({length:18},(_,n)=>`<i style="--x:${(n*37)%100}%;--delay:${n*-.23}s"></i>`).join('');}
 }
 if(!showHeld)showTimer=setTimeout(()=>$('#stageModal')._next(),phaseDuration);
 }
 $('#stageModal')._advance=next;$('#stageModal')._next=()=>locked(()=>{sync();next();});$('#stageModal')._finish=()=>{clearTimeout(showTimer);i=phases.length;next();};$('#stageModal')._duration=duration;next();
}

function bridge(id){
 const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
 dialog(`<div class="reunion-bridge"><small>다시 만날 약속</small><h2>${reduced?'2011 → 2026':'2011'}</h2><p>열다섯 해를 건너, 다시 같은 무대로.</p>${button('다음 앨범으로','bridge-skip')}</div>`);
 const target=$('.reunion-bridge h2'),start=performance.now();
 if(!reduced){const step=now=>{if(!target.isConnected||!$('#stageModal').open)return;const p=Math.min(1,(now-start)/1400);target.textContent=String(2011+Math.floor(15*(1-(1-p)**2)));if(p<1)requestAnimationFrame(step);};requestAnimationFrame(step);}
 clearTimeout(showTimer);showTimer=setTimeout(()=>{if(target.isConnected&&$('#stageModal').open)handle('album-view',id);},reduced?1200:2200);
}
function motionPreview(id='scent'){
 if(!isTest||!motions[id])return;
 const m=motions[id];
 dialog(`<div class="motion-preview" data-motion="${id}" style="--motion-speed:${m.speed}"><small class="eyebrow">${m.label} · 동작 미리보기</small><h2>${m.title}</h2><div class="motion-song-picker" aria-label="미리볼 무대">${Object.entries(motions).map(([key,item])=>`<button data-action="motion-preview" data-value="${key}" aria-pressed="${id===key}">${item.title}</button>`).join('')}</div><p>${m.description}<br>참고 구간 ${m.range} · ${m.seconds}초<br>기본 재생은 ${m.speed}배속<br>1·2·4·8배속으로 비교할 수 있어요.</p>${stageArt(true,false,0,M.albumById(m.album),'',id)}<p class="motion-duration" role="status">한 흐름 ${m.seconds/m.speed}초 · ${m.speed}배속</p><div class="motion-tuning"><fieldset class="motion-size"><legend>움직임 크기</legend>${['작게','기본','크게'].map((label,i)=>`<button data-action="motion-size" data-value="${[.65,1,1.25][i]}" aria-pressed="${i===2}">${label}</button>`).join('')}</fieldset><fieldset class="motion-size"><legend>재생 속도</legend>${[1,2,4,8].map(speed=>`<button data-action="motion-speed" data-value="${speed}" aria-pressed="${speed===m.speed}">${speed}배</button>`).join('')}</fieldset></div><div class="motion-preview-controls">${button('동작 멈추기','motion-pause')}${button('처음부터 보기','motion-restart')}${link('참고한 후렴 보기',m.source)}</div></div>`);
}
function restartMotion(){const box=$('.motion-preview'),id=box?.dataset.motion;if(!motions[id])return;box.querySelector('.stage-art').outerHTML=stageArt(true,false,0,M.albumById(motions[id].album),'',id);box.classList.remove('motion-paused');box.querySelector('[data-action="motion-pause"]').textContent='동작 멈추기';}
function testPanel(){
 if(!testTools)return;
 let backup=false;try{backup=Boolean(localStorage.getItem(checkpointKey));}catch{}
 const opts=testTools.options();
 dialog(`${mark('TEST ONLY')}<h2>원하는 구간부터 테스트</h2><p>원하는 구간부터 시작해 보세요. 모든 콘텐츠 해금은 의상·무대·뽑기를 전부 열고 테스트용 10,000코인을 준비해요.</p><label class="test-jump-label">이동할 구간<select id="testDestination"><optgroup label="앨범">${opts.filter(o=>!o.id.startsWith('story:')).map(o=>`<option value="${o.id}">${esc(o.label)}</option>`).join('')}</optgroup><optgroup label="이야기">${opts.filter(o=>o.id.startsWith('story:')).map(o=>`<option value="${o.id}">${esc(o.label)}</option>`).join('')}</optgroup></select></label>${button('선택한 구간으로 이동','test-jump-confirm','','primary')}<p class="private-note">처음 이동하기 전 기록을 이 브라우저에 따로 보관해요. 여러 구간을 테스트해도 원래 기록은 유지됩니다. 테스트 중 만든 기록은 ‘이동 전 기록으로 돌아가기’를 누르면 교체돼요.</p><div class="stack">${button('이동 전 기록으로 돌아가기','test-restore-confirm','','',!backup)}${button('미니게임 대기·오늘 횟수 초기화','test-mini-reset')}</div><p class="private-note">횟수 초기화는 보유 코인을 바꾸지 않아요.</p>`);
}
function replaceTestState(next){
 giftUI.resetPending();
 store?.adopt();s=next;M.memberIds.forEach(id=>delete preview[id]);track='scent';lastCards=new Set(M.memberCards(s).filter(c=>c.earned).map(c=>c.id));lastBadges=new Set(M.badges(s).filter(b=>b.earned).map(b=>b.id));lastStories=new Set(M.storyEntries.filter(e=>M.storyAvailable(s,e.id)).map(e=>e.id));clearTimeout(noticeTimer);$('#albumNotice').textContent='';warn='';close();
}
function testAction(a,v){
 if(!testTools||!a.startsWith('test-'))return false;
 if(a==='test-tools')testPanel();
 if(a==='test-jump-confirm'){const id=$('#testDestination').value,o=testTools.options().find(o=>o.id===id);if(o)dialog(`<h2>이 구간으로 이동할까요?</h2><p>${esc(o.label)}</p><p>현재 화면을 테스트용 진행 상태로 바꿉니다. 이동 전 기록은 따로 보관됩니다.</p>${button('취소','test-tools')}${button('이동하기','test-jump-apply',id,'primary')}`);}
 if(a==='test-jump-apply'){
  try{const next=testTools.create(v),old=localStorage.getItem(checkpointKey);if(old)M.loadSave(old);else localStorage.setItem(checkpointKey,JSON.stringify(s));localStorage.setItem(key,JSON.stringify(next));replaceTestState(next);const o=testTools.options().find(o=>o.id===v);selectedAlbum=o.album;if(v.startsWith('story:')){scene=2;storyAlbum=o.album;storyFilter='all';draw();const id=v.slice(6);M.storyById(id)?timeline(id):book(id);}else if(v==='solo-start'){songView='solo';scene=1;draw();}else if(v==='all-content'){scene=5;wardrobeView='closet';draw();}else{scene=1;draw();}say('테스트 구간으로 이동했어요. 상단 테스트 이동에서 원래 기록으로 돌아갈 수 있어요.');}catch{dialog('<h2>이동하지 못했어요</h2><p>기록을 안전하게 저장할 수 없어요. 저장 공간을 확인하거나 백업을 내려받은 뒤 다시 시도해 주세요.</p>');}
 }
 if(a==='test-restore-confirm')dialog(`<h2>이동 전 기록으로 돌아갈까요?</h2><p>구간 이동 후의 테스트 진행은 원래 기록으로 교체됩니다.</p>${button('계속 테스트','test-tools')}${button('원래 기록 복원','test-restore-apply','','primary')}`);
 if(a==='test-restore-apply'){try{const next=M.loadSave(localStorage.getItem(checkpointKey));localStorage.setItem(key,JSON.stringify(next));localStorage.removeItem(checkpointKey);replaceTestState(next);scene=0;selectedAlbum=M.songAlbum(next.collected[next.collected.length-1]).id;draw();say('구간 이동 전 기록으로 돌아왔어요.');}catch{dialog('<h2>복원하지 못했어요</h2><p>보관된 기록을 읽을 수 없어요. 현재 기록은 그대로 두고 저장 관리에서 백업을 확인해 주세요.</p>');}}
 if(a==='test-mini-reset'){const earned=s.mini.earned;s.mini=M.mini.fresh();s.mini.earned=earned;{const earned=s.leisure.play.earned,total=s.leisure.play.total,recent=s.leisure.play.recent;s.leisure.play=M.play.fresh();Object.assign(s.leisure.play,{earned,total,recent});}save();close();scene=5;wardrobeView='coins';draw();say('테스트용으로 도전 횟수와 대기 시간을 초기화했어요. 보유 코인은 유지됩니다.');}
 return true;
}
const backupTime=at=>new Date(at).toLocaleString('ko-KR',{timeZone:'Asia/Seoul',year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',second:'2-digit',hour12:false});
function backupDescription(entry){return entry.valid?esc(entry.album)+' · '+entry.songs+'곡 수집'+(entry.solo?' · 솔로 '+entry.solo+'곡':''):'읽을 수 없는 원본 · 파일로 보관할 수 있어요.';}
function management(note=''){
 const entries=backups?.entries()||[],message=note||backups?.error||(!backups?'이 브라우저에서는 백업 목록을 사용할 수 없어요. 파일 백업을 이용해 주세요.':'');
 dialog(`${mark('SAVE & BACKUP')}<h2>저장 관리</h2><p>진행 상황은 자동으로 저장됩니다.<br>이전 진행으로 돌아가려면 아래 백업을 선택해 주세요.</p><section class="stage-backups"><div class="line"><h3>이 브라우저의 백업</h3>${button('지금 백업하기','backup-create','','',!backups||blocked||store?.dirty)}</div><p class="private-note">하루 첫 접속·앨범 및 솔로 콘서트 첫 완료 시 자동 백업합니다. 최근 ${backups?.limit||12}개를 보관하며, 공간이 부족하면 오래된 백업부터 정리됩니다.</p><p id="backupNote" role="status">${esc(message)}</p><div class="stage-backup-list">${entries.map(e=>`<article class="stage-backup-item"><strong>${esc(backupTime(e.at))}</strong><span>${esc(e.reason)}</span><small>${backupDescription(e)}</small>${button(e.valid?'이 기록으로 복원':'원본 파일 내려받기',e.valid?'backup-preview':'backup-export',e.id,'',!!store?.dirty)}</article>`).join('')||'<p>아직 보관된 백업이 없어요.</p>'}</div><p class="private-note">현재 브라우저에만 보관됩니다. 브라우저 데이터를 삭제하거나 기기를 바꾸기 전에는 파일로 내려받아 주세요.</p></section><h3>파일 백업</h3><div class="growth-actions">${button('백업 내려받기','export')}${store?.dirty?button('저장 재시도','save-retry')+button('저장된 기록으로 돌아가기','saved-confirm'):button('백업 불러오기','import')}</div><details><summary>이전 기록·초기화</summary><div class="stack">${button('마지막 파일 백업 교체 전 기록 복원','restore-import')}${isTest?button('전환 전 원본 백업','export-before-simple'):''}${button('처음부터 다시 시작','reset')}</div></details><p role="status" id="saveNote">${store?.dirty?saveMessage():''}</p>`);
}
function backupAction(a,id){
 if(!a.startsWith('backup-'))return false;
 if(!backups){management('백업 목록을 사용할 수 없어요.');return true;}
 if(a==='backup-create'){const result=backups.add(s);management(result.ok?'현재 진행을 백업했어요.':result.error);}
 if(a==='backup-preview'){const entry=backups.entries().find(e=>e.id===id&&e.valid);if(!entry){management('이 백업을 읽지 못했어요. 다른 기록을 선택해 주세요.');return true;}dialog(`<h2>이 기록으로 돌아갈까요?</h2><p>${esc(backupTime(entry.at))}<br>${backupDescription(entry)}</p><p>현재 진행은 ‘복원 직전 기록’으로 먼저 보관합니다. 복원 후에도 그 기록으로 돌아올 수 있어요.</p><div class="growth-actions">${button('취소','storage')}${button('이 기록으로 복원','backup-restore',id,'primary')}</div>`);}
 if(a==='backup-restore'){
  let result;try{result=backups.restore(id,localStorage.getItem(key),next=>{M.settle(next);return !!store?.write(next);});}catch{result={ok:false,error:'복원하지 못했어요. 현재 기록은 유지됩니다.'};}
  if(!result.ok){management(result.error);return true;}
  giftUI.resetPending();s=result.state;blocked=false;warn='';pendingImport=null;M.memberIds.forEach(member=>delete preview[member]);lastCards=new Set(M.memberCards(s).filter(c=>c.earned).map(c=>c.id));lastBadges=new Set(M.badges(s).filter(b=>b.earned).map(b=>b.id));lastStories=new Set(M.storyEntries.filter(e=>M.storyAvailable(s,e.id)).map(e=>e.id));track=s.collected.find(t=>!ready(t))||'scent';selectedAlbum=M.songAlbum(track).id;scene=0;close();draw();saveNotice();say('선택한 백업으로 복원했어요. 저장 관리에서 복원 직전 기록으로 돌아갈 수 있어요.');
 }
 if(a==='backup-export'){try{const url=URL.createObjectURL(new Blob([backups.raw(id)],{type:'application/json'})),el=document.createElement('a');el.href=url;el.download='seeya-our-stage-recovery.json';el.click();setTimeout(()=>URL.revokeObjectURL(url),3000);}catch{management('원본을 읽지 못했어요.');}}
 return true;
}

function sync(){try{const next=store?.pull();if(next)s=next;saveNotice();}catch{say('다른 탭의 기록을 읽지 못했어요. 현재 화면의 기록은 유지합니다.');}}
function focusGameScreen(){if(matchMedia('(max-width:650px)').matches)$('#screen').scrollIntoView({block:'start'});$('#screen').focus({preventScroll:true});}
function handle(a,v){
 if(connectUI.handle(a,v))return;
 if(a==='tab'||a==='wardrobe-view')connectUI.pause();
 if(store?.dirty&&!['storage','export','export-before-simple','save-retry','saved-confirm','saved-apply','restore-import'].includes(a)){saveNotice();return;}
 if(a==='save-retry'){if(save()){draw();say('저장했어요. 이제 계속 진행할 수 있어요.');}return;}
 if(a==='saved-confirm'){dialog('<h2>저장된 기록으로 돌아갈까요?</h2><p>아직 저장하지 못한 현재 변경은 사라집니다. 먼저 현재 기록을 백업해 주세요. 다른 탭에 저장된 기록은 유지됩니다.</p>'+button('현재 기록 백업','export')+button('취소','storage')+button('저장된 기록으로 돌아가기','saved-apply'));return;}
 if(a==='saved-apply'){s=store.discard()||M.fresh();close();draw();saveNotice();say('저장된 기록을 불러왔어요.');return;}
 if(blocked&&!['storage','export','export-before-simple','import','import-confirm','reset','confirm-reset','backup-preview','backup-restore','backup-export'].includes(a)){management();return;}
 if(backupAction(a,v))return;
 if(isTest&&a==='motion-preview'){motionPreview(v||'scent');return;}
 if(isTest&&a==='motion-size'){const box=$('.motion-preview');if(!box||![.65,1,1.25].includes(Number(v)))return;box.style.setProperty('--motion',v);box.querySelectorAll('[data-action="motion-size"]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.value===v)));return;}
 if(isTest&&a==='motion-speed'){const box=$('.motion-preview');if(!box||![1,2,4,8].includes(Number(v)))return;box.style.setProperty('--motion-speed',v);const timing=box.querySelector('.motion-duration');if(timing)timing.textContent='한 흐름 '+(motions[box.dataset.motion].seconds/Number(v))+'초 · '+v+'배속';box.querySelectorAll('[data-action="motion-speed"]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.value===v)));restartMotion();return;}
 if(isTest&&a==='motion-restart'){restartMotion();return;}
 if(isTest&&a==='motion-pause'){const box=$('.motion-preview');if(!box)return;const paused=box.classList.toggle('motion-paused');box.querySelector('[data-action="motion-pause"]').textContent=paused?'동작 재생하기':'동작 멈추기';return;}
 if(a==='room-posters'){roomPosters.open();return;}
 if(a==='room-poster-view'){roomPosters.view();return;}
 if(a==='room-poster-download'){roomPosters.download();return;}
 if(a==='room-poster-select'){roomPosters.choose(v);return;}
 if(a==='room-display'){roomDisplay.open();return;}
 if(a==='room-cardbook'){close();scene=5;wardrobeView='cards';draw();return;}
 if(testAction(a,v))return;
 const ticketAction=ticketUI?.handle(a,v);if(ticketAction)return ticketAction;
 if(giftUI?.handle(a,v))return;
 if(a==='encore-open'){if(!s.simple.concerts[v])return;dialog(`<h2>다시 듣고 싶은 무대</h2><div class="encore-choices">${M.concertTracks(s,v).map(t=>button(esc(title(t)),'perform','encore:'+t)).join('')}</div>`);return;}
 if(stageShopUI.handle(a,v))return;
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
 if(a==='concert-coin'){coinUI.claim(v);return;}
 if(a==='show-hold'&&showing){showHeld=!showHeld;motionUI.pause(showHeld||document.hidden);coinUI.pause(showHeld||document.hidden);clearTimeout(showTimer);$('#modalBody [data-action="show-hold"]').textContent=showHeld?'자동 넘김 켜기':'이 장면 더 보기';if(!showHeld)showTimer=setTimeout($('#stageModal')._next,$('#stageModal')._duration||M.timing.performanceMs);return;}
 if(a==='show-next'&&showing){clearTimeout(showTimer);$('#stageModal')._advance();return;}
 if(a==='story-detail'){storyDetail(v);return;}
 if(a==='outfit-detail'){const o=outfits.find(o=>o.id===v);if(o)dialog(outfitCard(o,true));return;}
 if(a==='shop-detail'){const o=M.shopById(v);if(o)dialog(`${mark(o.date)}<h2>${esc(o.name)}</h2><div class="shop-sprite">${sprite(shopMember,o)}</div><p>${esc(o.note)}</p>${link(o.sourceLabel||'참고한 무대 보기',o.url)}<p>${M.members.find(m=>m.id===shopMember).name} · 의상 + 헤어 · ${o.price}코인</p>${button('상점으로','wardrobe-view','shop')}`);return;}
 if(a==='story-filter'){storyFilter=v;if(v==='core')storyAlbum='all';draw();return;}
 if(a==='stories-album'){storyAlbum=v;storyFilter='all';scene=2;if($('#stageModal').open)close();draw();$('#screen').focus({preventScroll:true});return;}
 if(a==='timeline'){timeline(v);return;}
 if(a==='badge-detail'){const b=M.badges(s).find(b=>b.id===v);if(b)dialog(`<div class="badge-detail">${mark(b.group)}<h2>${esc(b.name)}</h2>${badgeImage(b)}<strong>${b.earned?'획득 완료':'아직 얻지 못한 배지'}</strong><p>${esc(b.hint)}</p></div>`);return;}
 if(a==='badge-filter'){badgeFilter=v;draw();return;}
 if(a==='practice-view'){if(!M.soloUnlocked(s))return;practiceView=v;draw();return;}
 if(a==='solo-practice-pick'){if(!M.soloOpen(s,v))return;soloPracticeTrack=v;practiceView='solo';scene=0;if($('#stageModal').open)close();draw();$('#screen').focus({preventScroll:true});return;}
 if(a==='solo-open'||a==='solo-member'||a==='song-view'){if($('#stageModal').open)close();songView=a==='song-view'?v:'solo';if(a==='solo-member'&&M.soloById(v))soloAlbum=v;scene=1;draw();$('#screen').focus({preventScroll:true});return;}
 if(a==='solo-train'){if(M.soloTrain(s,v)){soloPracticeTrack=v;practiceView='solo';save();draw();say('솔로곡 연습을 시작했어요.');}else say('진행 중인 연습과 연습 포인트를 확인해 주세요.');return;}
 if(a==='album-view'){songView='albums';if(!M.albumById(v))return;if($('#stageModal').open)close();selectedAlbum=v;scene=1;draw();$('#screen').focus({preventScroll:true});return;}
 if(a==='unlock-album'){if(!M.unlockAlbum(s,v))return;selectedAlbum=v;save();draw();chapterReward(M.albumById(v));return;}
 if(a==='tab'&&!s.simple.debuted&&v!=='0')return;
 if(a==='trainee-info'){say('첫 연습과 데뷔 무대를 마치면 아티스트 패스를 받아요.');return;}
 if(a==='train-all'){if(M.trainAll(s,v)){save();draw();say(s.queue?'다음 곡의 연습을 예약했어요.':'연습을 시작했어요.');}return;}
 if(a==='bridge-then-album'){bridge(v);return;}
 if(a==='bridge-skip'){clearTimeout(showTimer);handle('album-view','still-here');return;}
 if(a==='tab'){if($('#stageModal').open)close();scene=Number(v);draw();focusGameScreen();return;}
 if(a==='practice-next'){const [from,to]=v.split('|');if(from!==track||!ready(from)||!open(to))return;if(!giftUI.beforeNext(from,to))handle('pick',to);return;}
 if(a==='pick'){if($('#stageModal').open)close();if(!open(v))return;if($('#stageModal').open)close();scene=0;track=v;selectedAlbum=M.songAlbum(v).id;draw();$('.practice').scrollIntoView({block:'center'});return;}
 if(a==='wear-reward'){if(!M.outfitOwned(s,v))return;close();handle('outfit',v);return;}
 if(a==='mini-open'){scene=5;wardrobeView='coins';draw();const card=$('[data-action="mini-start"][data-value="'+v+'"]');card?.scrollIntoView({block:'center'});card?.focus();return;}
 if(a==='open-coins'){scene=5;wardrobeView='coins';draw();focusGameScreen();return;}
 if(a==='daily-coins'){if(M.claimDaily(s)){save();draw();say(`오늘의 출석 보상 ${M.dailyReward}코인을 받았어요.`);}else{draw();say('오늘의 출석 보상은 이미 받았어요.');}return;}
 if(a==='wardrobe-view'){close();scene=5;wardrobeView=v;draw();focusGameScreen();return;}
 if(a==='shop-section'){if(['clothes','stage'].includes(v)){shopSection=v;draw();}return;}
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
  save();close();scene=0;draw();say(M.outfitOwned(s,v)?'세 멤버가 함께 갈아입었어요.':'미획득 의상을 미리 입어봐요. 새로고침하면 보유 의상으로 돌아가요.');$('#screen').focus({preventScroll:true});return;
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
 if(a==='import-confirm'){if(!pendingImport)return;giftUI.resetPending();try{localStorage.setItem(key+'-before-import',JSON.stringify(s));}catch{say('교체 전 기록을 보관하지 못했어요. 현재 기록은 유지됩니다.');return;}s=pendingImport;pendingImport=null;M.memberIds.forEach(id=>delete preview[id]);M.settle(s);blocked=false;save();close();scene=0;draw();say('진행 상황을 복원했어요.');return;}
 if(a==='restore-import'){try{const old=M.loadSave(localStorage.getItem(key+'-before-import'));s=old;save();close();draw();say('백업 교체 전 기록을 복원했어요.');}catch(e){if(e===saveFailure)throw e;say('보관된 기록을 복원하지 못했어요.');}return;}
 if(a==='import'){$('#stageFile').click();return;}
 if(a==='reset'){dialog(`<h2>처음부터 시작할까요?</h2><p>이 페이지에 저장된 게임 기록이 지워져요.</p>${button('현재 기록 유지','storage')}${button('초기화하기','confirm-reset')}`);return;}
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
root.addEventListener('click',e=>{const el=e.target.closest('[data-action]');if(el)locked(()=>{sync();if(!blocked&&!store?.dirty&&M.settle(s))save();return handle(el.dataset.action,el.dataset.value);},true);});
root.addEventListener('input',e=>{if(e.target.id==='concertQuery'){concertQuery=e.target.value;$('#concertRows').innerHTML=concertRows();}});
root.addEventListener('change',e=>{if(['concertAlbum','concertKind'].includes(e.target.id)){if(e.target.id==='concertAlbum')concertAlbum=e.target.value;else concertKind=e.target.value;$('#concertRows').innerHTML=concertRows();return;}if(['cardMember','cardOwned'].includes(e.target.id)){if(e.target.id==='cardMember')cardMember=e.target.value;else cardOnlyOwned=e.target.checked;cardPage=0;draw();return;}if(e.target.dataset.member){const member=e.target.dataset.member,id=e.target.value,part=e.target.dataset.part,focus=e.target.id;locked(()=>{sync();if(M.equipPart(s,member,part,id)){if(preview[member]){delete preview[member][part];if(!Object.keys(preview[member]).length)delete preview[member];}}else if(M.canWearOutfit(s,id)){preview[member]??={};preview[member][part]=id;}save();draw();$('#'+focus)?.focus();});return;}if(['practiceAlbum','track','soloPracticeAlbum','soloPracticeTrack'].includes(e.target.id)){
 const id=e.target.id,value=e.target.value,solo=id.startsWith('solo');
 if(id==='practiceAlbum'){const choices=M.albumById(value)?.tracks.filter(t=>open(t.id));if(!choices?.length)return;track=(choices.find(t=>!ready(t.id))||choices[0]).id;}
 else if(id==='track'){if(!open(value))return;track=value;}
 else {if(s.solo?.active)return;if(id==='soloPracticeAlbum'){const choices=M.soloById(value)?.tracks.filter(t=>M.soloOpen(s,t.id));if(!choices?.length)return;soloPracticeTrack=(choices.find(t=>!M.soloDone(s,t.id))||choices[0]).id;}else{if(!M.soloOpen(s,value))return;soloPracticeTrack=value;}}
 // Only refresh the practice panel so the room and scroll position stay still.
 $('.practice').outerHTML=solo?soloUI.practice(soloPracticeTrack):practice();
 $('#'+id)?.focus({preventScroll:true});return;
 }if(e.target.id==='storyAlbum'){storyAlbum=e.target.value;if(storyFilter==='core')storyFilter='all';draw();$('#storyAlbum').focus();}});
$('#stageFile').onchange=async e=>{const file=e.target.files[0];if(!file)return;try{if(file.size>256000)throw Error();pendingImport=M.loadSave(await file.text());dialog('<h2>백업으로 교체할까요?</h2><p>현재 진행을 백업 파일의 내용으로 교체합니다. 교체 전 기록은 별도로 보관합니다.</p>'+button('취소','storage')+button('백업으로 교체','import-confirm','','primary'));}catch{if($('#saveNote'))$('#saveNote').textContent='이 게임의 유효한 백업 파일을 선택해 주세요.';}e.target.value='';};
$('#stageClose').onclick=close;$('#stageModal').addEventListener('close',()=>{motionUI?.stop();coinUI?.clearStage();showing=false;activeChallenge=null;afterChallenge=null;clearTimeout(showTimer);if(returnFocus?.isConnected)returnFocus.focus({preventScroll:true});else $('#screen').focus({preventScroll:true});});
window.addEventListener('storage',e=>{if(e.key===key){sync();draw();}});
function tick(){if(!s.simple.debuted&&ready('scent')&&!showing&&!$('#stageModal').open&&!blocked&&!store?.dirty){locked(()=>{sync();perform('first');});}
 if(blocked||store?.dirty||document.hidden)return;miniUI.update();connectUI.update();const now=Date.now();if($('#soloClock')&&s.solo?.active)$('#soloClock').textContent=Math.max(0,Math.ceil((s.solo.active.end-now)/1000))+'초';if($('#clock'))$('#clock').textContent=clock();if($('#jobClock')&&s.shopJob)$('#jobClock').textContent=Math.max(0,Math.ceil((s.shopJob.end-now)/1000));
 const due=s.solo?.active&&s.solo.active.end<=now||s.active&&s.active.end<=now||s.shopJob&&s.shopJob.end<=now||s.points<100&&now>=s.energyAt+M.timing.recoveryMs||!s.active&&s.queue&&s.points>=5;
 if(due)locked(()=>{sync();const wasJob=M.shopJobById(s.shopJob?.kind),before={points:s.points,active:s.active,queue:s.queue},done=M.settle(s);save();if(done||before.active!==s.active||before.queue!==s.queue||(before.points<5)!==(s.points<5))draw();else if($('#studioPoints'))$('#studioPoints').innerHTML=s.points+'<small> / '+100+'</small>';if(done)say(wasJob&&!s.shopJob?`${wasJob.name} 완료! ${wasJob.reward}코인을 받았어요.`:'연습을 마쳤어요. 준비도가 올랐어요.');});
 if(coinDay!==M.kstDay()){coinDay=M.kstDay();locked(()=>{sync();M.recordPlayDay(s);save();draw();});}
}
vcrUI=__require("src/client/our-stage-vcr.js")({M,root,state:()=>s,dialog,button,mark});
giftUI=__require("src/client/our-stage-gifts.js")({M,state:()=>s,root,dialog,button,esc,save,draw,close,goPractice:id=>handle('pick',id)});
wallUI=__require("src/client/our-stage-wall-keepsakes.js")({M,state:()=>s,root,esc});
roomDisplay=__require("src/client/our-stage-room-display.js")({M,state:()=>s,wall:wallUI,cardFace,esc,button,dialog});
roomPosters=__require("src/client/our-stage-room-posters.js")({M,state:()=>s,esc,dialog,save,draw,close,root,button});
roomLife=__require("src/client/our-stage-room-life.js")({root,sprite,members:M.members,practiceOutfit:outfits.find(o=>o.id==='practice'),isTest});
motionUI=__require("src/client/our-stage-concert-motion.js")();
coinUI=__require("src/client/our-stage-concert-coins.js")({root,dailyLimit:M.concertCoinLimit,remaining:()=>M.concertCoinRemaining(s),allowed:()=>showing&&!showHeld&&!document.hidden&&$('#stageModal').open,award:()=>M.claimConcertCoin(s)&&save()});
ticketUI=__require("src/client/our-stage-tickets.js")({M,state:()=>s,root,dialog,button,esc,save,draw,refreshWall:()=>wallUI.refresh()});
const stageShopUI=__require("src/client/our-stage-stage-shop.js")({M,state:()=>s,button,esc,stageArt,save,draw,say,focusPreview:()=>{$('.decor-detail')?.scrollIntoView({block:'start'});},openShop:()=>{close();scene=5;wardrobeView='shop';shopSection='stage';draw();}});
const miniUI=__require("src/client/our-stage-leisure.js")({M,root,state:()=>s,save,draw,dialog,button,esc,mark,locked,sync,sprite,cardFace,stageArt,stageDecorControls:()=>stageShopUI.controls(),openDrivePage:()=>{if($('#stageModal').open)close();scene=5;wardrobeView='drive';draw();$('.drive-page').scrollIntoView({block:'start'});},exitDrivePage:()=>{scene=5;wardrobeView='coins';draw();$('#screen').focus({preventScroll:true});},isCapsulePage:()=>scene===5&&wardrobeView==='capsule',openCapsulePage:(focus=true)=>{if($('#stageModal').open)close();scene=5;wardrobeView='capsule';draw();if(focus){const h=$('#screen .capsule-page h2');if(h){h.tabIndex=-1;h.focus({preventScroll:true});}$('#screen').scrollIntoView({block:'start'});}},clearOutfitPreview:()=>Object.keys(preview).forEach(k=>delete preview[k])});
const connectUI=__require("src/client/our-stage-connect.js")({root,sprite,styles,esc,key:connectKey});
if(isTest){const speed=root.querySelector('.test-timing');if(speed)speed.textContent='로컬 테스트 · 첫 연습 약 1초, 이후 한 곡 연습 3초';}
if(testTools)$('.os-heading').insertAdjacentHTML('beforeend',button('테스트 이동','test-tools','','test-tools-button')+button('무대 동작 보기','motion-preview','','test-tools-button'));
draw();tick();setInterval(tick,250);if(warn)say(warn);
if(!blocked){locked(()=>{sync();if(!document.hidden)M.recordPlayDay(s);M.settle(s);save();draw();});document.addEventListener('visibilitychange',()=>{motionUI?.pause(document.hidden||showHeld);coinUI?.pause(document.hidden||showHeld);if(!document.hidden)locked(()=>{sync();if(!document.hidden)M.recordPlayDay(s);M.settle(s);save();draw();});});}
if(isTest&&motions[new URLSearchParams(location.search).get('stagePreview')])motionPreview(new URLSearchParams(location.search).get('stagePreview'));
})();

},
"src/shared/our-stage-environment.js":function(module,exports,__require){
'use strict';
module.exports=function(pathname){
 const isTest=pathname.replace(/\/$/,'')==='/game/our-stage/test';
 return {isTest,key:isTest?'seeya-our-stage-local-v1':'seeya-our-stage-public-v1',
 outfitKey:isTest?'seeya-our-stage-outfit-v1':'seeya-our-stage-public-outfit-v1',
 connectKey:isTest?'seeya-our-stage-connect-v1':'seeya-our-stage-public-connect-v1'};
};

},
"src/shared/our-stage.js":function(module,exports,__require){
'use strict';
function createModel(testMode=false) {
  const mini=__require("src/shared/our-stage-mini.js")(testMode);
  const playDays=__require("src/shared/our-stage-play-days.js");
  const playDayCount=playDays.count,recordPlayDay=(s,now=Date.now())=>playDays.record(s,kstDay(now));
  const timing={shopMs:testMode?1000:60000,recoveryMs:testMode?1000:90000,performanceMs:testMode?1000:3300,testMode};
  // Album order follows Melon 314286. Each condition uses permanent progress.
  const songs = [
    {id:'scent', title:'여인의 향기', hint:'연습실에 처음 들어오면 열려요.', unlocked:()=>true},
    {id:'shoes', title:'구두', hint:'첫 무대를 마치면 열려요.', unlocked:s=>has(s,'first')},
    {id:'because', title:'사랑하기 때문에 (Feat. SG워너비)', hint:'구두의 팀 호흡 연습을 마치면 열려요.', unlocked:s=>s.tracks.shoes.includes(1)},
    {id:'flower', title:'접시꽃', hint:'구두 준비도 100%를 달성하면 열려요.', unlocked:s=>ready(s,'shoes')},
    {id:'promise', title:'Promise U', hint:'앨범 퀴즈를 풀거나 1집 기록을 간직하면 열려요.', unlocked:s=>has(s,'album')},
    {id:'again', title:'처음부터 또다시', hint:'Promise U의 보컬 연습을 마치면 열려요.', unlocked:s=>s.tracks.promise.includes(0)},
    {id:'guilty', title:'유죄', hint:'처음부터 또다시를 한 번 연습하면 열려요.', unlocked:s=>has(s,'yj')||s.tracks.again.length>0},
    {id:'parting', title:'이별 해보기', hint:'유죄를 한 번 연습하면 열려요.', unlocked:s=>has(s,'gr')||s.tracks.guilty.length>0},
    {id:'tears', title:'Tears And Fears', hint:'이별 해보기를 한 번 연습하면 열려요.', unlocked:s=>has(s,'br')||s.tracks.parting.length>0},
    {id:'loved', title:'사랑했다면', hint:'Tears And Fears를 한 번 연습하면 열려요.', unlocked:s=>has(s,'reunion')||s.tracks.tears.length>0},
    {id:'just', title:'그냥', hint:'서로 다른 세 곡의 준비도를 100%로 만들면 열려요.', unlocked:s=>ids.filter(id=>id!=='just'&&ready(s,id)).length>=3},
    {id:'fault', title:'내 잘못입니다', hint:'그냥을 한 번 연습하면 열려요.', unlocked:s=>has(s,'ending')||s.tracks.just.length>0}
  ];
  const lessons = [
    {title:'보컬 연습', seconds:testMode?1:5, gain:30},
    {title:'팀 호흡 맞추기', seconds:testMode?1:5, gain:30},
    {title:'무대 동선 연습', seconds:testMode?1:5, gain:40}
  ];
  const members = [
    {id:'yj', name:'김연지', episode:'E04', title:'가면 너머의 목소리', date:'2018.09.07', fact:'김연지의 DMC 페스티벌 ‘복면가왕 더 위너’ 무대를 아카이브에서 만날 수 있어요.', url:'https://www.youtube.com/watch?v=VX4z0syPoWw'},
    {id:'gr', name:'남규리', episode:'E05', title:'카메라 앞에서', date:'2011.05.20', fact:'드라마 ‘49일’의 마지막 장면을 돌아보는 종영 보도에 남규리의 연기 기록이 남아 있어요.', url:'https://www.bntnews.co.kr/article/view/bnt201105200353'},
    {id:'br', name:'이보람', episode:'E06', title:'또 다른 하모니', date:'2022.07.16', fact:'이보람은 ‘놀면 뭐하니?’에서 가야G 멤버로 첫 쇼케이스 무대에 섰어요.', url:'https://www.youtube.com/watch?v=cojgPoISAf0'}
  ];
  const reunionUrl='https://tv.jtbc.co.kr/clip/pr10011122/pm10055652/vo10354827/view';

  const albums=__require("src/data/our-stage-albums.json");
  const albumById=id=>albums.find(a=>a.id===id);
  const practiceDurations=[15,20,25,30,35,40,45,60];
  const lessonSeconds=(id,lesson)=>{
    if(testMode)return 1;
    const total=practiceDurations[albums.findIndex(a=>a.tracks.some(t=>t.id===id))]||15;
    const part=Math.floor(total/3);return lesson===2?total-part*2:part;
  };
  const trainingMs=(s,id,lesson,chain=false)=>chain&&s.simple?.debuted===false?(testMode?333:1000):lessonSeconds(id,lesson)*1000;
  const practiceSeconds=(s,id)=>Math.ceil(lessons.reduce((n,l,i)=>n+(s.tracks[id].includes(i)?0:trainingMs(s,id,i,true)),0)/1000);
  const storyEntries=__require("src/data/our-stage-stories.json");
  const storyById=id=>storyEntries.find(e=>e.id===id);
  const storyAvailable=(s,id)=>{const e=storyById(id);return Boolean(e&&albumUnlocked(s,e.album)&&albumCount(s,e.album)>=e.minTracks&&(e.requiresFlags||[]).every(id=>has(s,id)));};
  const storyDone=(s,id)=>Boolean(storyById(id)&&s.proofs.includes('story:'+id));
  const storyCondition=id=>{const e=storyById(id);return albumById(e.album).name+(e.minTracks?' · '+e.minTracks+'트랙 수집':' 해금')+(e.requiresFlags||[]).map(id=>' + ‘'+members.find(m=>m.id===id).title+'’ 간직하기').join('');};
  const quizLevels=['','첫걸음','기억 넓히기','연결하기','비교하기','종합하기'];
  const songAlbum=id=>albums.find(a=>a.tracks.some(t=>t.id===id));
  const albumCount=(s,id)=>albumById(id)?.tracks.filter(t=>open(s,t.id)).length||0;
  const albumComplete=(s,id)=>Boolean(albumById(id)&&albumCount(s,id)===albumById(id).tracks.length);
  const albumMastered=(s,id)=>Boolean(albumById(id)&&albumById(id).tracks.every(t=>ready(s,t.id)));
  const albumUnlocked=(s,id)=>id==='first-mind'?(has(s,'album')||s.simple?.debuted===true):s.albums.includes(id);
  const albumStoryGates={'lovely-sweet-heart':['event-rookie'],'brilliant-change':['event-seoul']};
  const storyDestination=key=>{const id=key.replace(/^story:/,'');if(['gr','yj','reunion','br','event-wsg','event-yeonji-return','event-gyulmung'].includes(id))return 'still-here';return Object.keys(albumStoryGates).find(a=>albumStoryGates[a].includes(id))||null;};
  const comebackStoryIds=['gr','yj','reunion','br'];
  const comebackRequirements=s=>[
    ...comebackStoryIds.map(id=>({label:id==='reunion'?'씨야 · 하나로 모인 기록':members.find(m=>m.id===id).name+' · '+members.find(m=>m.id===id).title,done:has(s,id),action:'story',value:id})),
    ...['event-wsg','event-yeonji-return','event-gyulmung'].map(id=>({label:storyById(id).subject+' · '+storyById(id).title,done:storyDone(s,id),action:'timeline',value:id}))
  ];
  const albumRequirements=(s,id)=>{const i=albums.findIndex(a=>a.id===id);return i<1?[]:[{label:albums[i-1].name+' 전곡 수집',done:albumUnlocked(s,albums[i-1].id)&&albumComplete(s,albums[i-1].id),action:'album-view',value:albums[i-1].id},...(albumStoryGates[id]||[]).map(k=>({label:storyById(k).title,done:storyDone(s,k),action:'timeline',value:k})),...(id==='still-here'?comebackRequirements(s):[])];};
  const albumAvailable=(s,id)=>{const i=albums.findIndex(a=>a.id===id);return i>0&&!albumUnlocked(s,id)&&albumRequirements(s,id).every(r=>r.done);};
  function unlockAlbum(s,id){if(!albumAvailable(s,id))return false;s.albums.push(id);return true;}
  // Personal activities belong to the 2011–2022 interval, never the debut tutorial.
  const coreCondition=id=>({gr:'See You Again · 5트랙 수집',yj:'See You Again 9트랙 수집 + ‘카메라 앞에서’ 간직하기',reunion:'See You Again 12트랙 수집 + ‘가면 너머의 목소리’ 간직하기',br:'See You Again 전곡 수집 + ‘하나로 모인 기록’ 간직하기'}[id]||'');
  const coreAvailable=(s,id)=>{
    if(!albumUnlocked(s,'see-you-again'))return false;
    const n=albumCount(s,'see-you-again');
    return id==='gr'?n>=5:id==='yj'?n>=9&&has(s,'gr'):id==='reunion'?n>=12&&has(s,'yj')&&has(s,'gr'):id==='br'?n>=15&&has(s,'reunion'):false;
  };
  const finaleReady=s=>albumComplete(s,'first-again')&&albumById('first-again').tracks.filter(t=>!t.instrumental&&ready(s,t.id)).length>=2;
  function finishFinale(s){if(!finaleReady(s)||s.finale)return false;s.finale=true;return true;}
  const cardMembers=[...members.map(({id,name})=>({id,name})),{id:'sm',name:'수미'},{id:'group',name:'씨야'}];
  function memberCards(s){
    const cards=[];
    for(const a of albums)for(const member of ['br','gr','yj'])cards.push({id:'album:'+a.id+':'+member,member,kind:'album',title:a.name,style:a.id,earned:albumUnlocked(s,a.id),hint:a.name+' 해금',note:a.id==='rebloom'?'현재 세 멤버 의상의 재해석 카드 · 실제 활동 멤버 구성과 다릅니다.':'앨범 의상 도트 카드'});
    for(const m of members)cards.push({id:'story:'+m.id,member:m.id,kind:'story',title:m.title,scene:{yj:3,gr:4,br:5}[m.id],earned:has(s,m.id),hint:coreCondition(m.id)+' 후 이야기 간직하기',note:m.date+' · 활동 이야기 카드'});
    for(const member of ['br','gr','yj']){
      cards.push({id:'reunion:'+member,member,kind:'story',title:'다시 같은 무대',style:'stage-sugarman',earned:has(s,'reunion'),hint:'2020년 재회 이야기 간직하기',note:'재회 기념 도트 카드'});
      cards.push({id:'finale:'+member,member,kind:'special',title:'우리의 빛, First, Again',style:'first-again',earned:s.finale,hint:'4집 전곡 수집 · 보컬곡 2곡 준비 · 4집 피날레 완료',note:'게임 속 콘서트 기념 카드'});
    }
    for(const id of ['event-bcm','event-kairos']){const e=storyById(id);cards.push({id:'event:'+id,member:'gr',kind:'story',title:e.title,image:e.image,earned:storyDone(s,id),hint:storyCondition(id)+' 후 이야기 간직하기',note:e.illustrationNote});}
    cards.push({id:'heritage:sumi',member:'sm',kind:'heritage',title:'함께했던 목소리 · Rebloom',image:'/images/game/our-stage/cards/sumi-rebloom.png',earned:albumUnlocked(s,'rebloom'),hint:'Rebloom 앨범 해금',note:'2009년 합류해 Rebloom 활동을 함께한 수미를 기억하는 카드입니다. 당시 방송 의상과 헤어를 참고한 도트 재해석이에요.',source:'https://www.hankyung.com/article/2009102079027'});
    cards.push({id:'group:the-fan',member:'group',kind:'special',title:'우리 셋, 스무 해의 무대',image:'/images/game/our-stage/cards/group-the-fan-heart-v2.png',earned:Boolean(s.simple?.concerts?.['first-again']),hint:'20주년 콘서트 · First, Again 앨범 콘서트 완료',note:'이보람 · 남규리 · 김연지가 함께한 20주년 콘서트 기념 단체 카드'});
    return cards;
  }
  const cardOwned=(s,id)=>memberCards(s).some(c=>c.id===id&&c.earned);
  const shop=__require("src/data/our-stage-shop.json"),capsuleOutfits=__require("src/data/our-stage-capsule-outfits.json");
  const memberIds=['br','gr','yj'];
  const shopById=id=>shop.find(o=>o.id===id);
  const shopJobs=[
    {id:'setup',name:'공연 준비 돕기',description:'소품을 정리하고 조명을 켜요.',reward:10,seconds:testMode?1:60},
    {id:'soundcheck',name:'사운드 체크',description:'마이크와 모니터 소리를 맞춰요.',reward:15,seconds:testMode?1:90},
    {id:'lightstick',name:'응원봉 점검',description:'객석을 밝힐 응원봉을 준비해요.',reward:12,seconds:testMode?1:60},
    {id:'poster',name:'포스터 정리',description:'공연 포스터와 안내물을 정돈해요.',reward:8,seconds:testMode?1:30}
  ];
  const shopJobById=id=>shopJobs.find(j=>j.id===id);
  const emptyJobCounts=()=>({soundcheck:0,lightstick:0,poster:0});
  const jobCount=(s,id)=>id==='setup'?s.gigs:s.jobCounts[id];
  const dailyReward=20;
  const kstDay=(now=Date.now())=>Number.isSafeInteger(now)&&now>=0&&now<=253402268399999?new Date(now+32400000).toISOString().slice(0,10):null;
  const canClaimDaily=(s,now=Date.now())=>{const day=kstDay(now);return Boolean(day&&(!s.daily.lastDay||day>s.daily.lastDay)&&s.daily.count<1000000);};
  function claimDaily(s,now=Date.now()){if(!canClaimDaily(s,now))return false;s.daily.lastDay=kstDay(now);s.daily.count++;return true;}
  const defaultEquipment=()=>({br:'practice',gr:'practice',yj:'practice'});
  const earnings=s=>({
    songs:Math.max(0,s.collected.length-1)*5,
    practice:ids.reduce((n,id)=>n+s.tracks[id].length,0)*2,
    stories:s.flags.length*5+storyEntries.filter(e=>storyDone(s,e.id)).length*8,
    jobs:shopJobs.reduce((n,j)=>n+jobCount(s,j.id)*j.reward,0),
    daily:s.daily.count*dailyReward,
    mini:s.mini.earned
  });
  const coins=s=>Object.values(earnings(s)).reduce((a,b)=>a+b,0)-s.purchases.reduce((n,p)=>n+(shopById(p.split(':')[0])?.price||0),0);
  const styleOwned=(s,id,member)=>memberIds.includes(member)&&(['base','practice'].includes(id)||Boolean(albumById(id))&&albumUnlocked(s,id)||Boolean(shopById(id))&&s.purchases.includes(id+':'+member)||capsuleOutfits.some(o=>o.id===id&&o.members.includes(member)&&s.leisure?.capsules?.owned?.includes(o.reward)));
  function equipPart(s,member,part,id){if(!['clothes','hair'].includes(part)||!styleOwned(s,id,member))return false;(part==='hair'?s.hair:s.equipped)[member]=id;return true;}
  function equip(s,member,id){if(!styleOwned(s,id,member))return false;s.equipped[member]=id;s.hair[member]=id;return true;}
  function purchase(s,id,member){const o=shopById(id);if(!o||!memberIds.includes(member)||s.purchases.includes(id+':'+member)||coins(s)<o.price)return false;s.purchases.push(id+':'+member);return true;}
  // Retain historical earnings and settle already-started legacy jobs; no new idle jobs.
  function startShopJob(){return false;}
  const outfitOwned=(s,id)=>['base','practice'].includes(id)||albumUnlocked(s,id);
  const canWearOutfit=(s,id)=>(['base','practice'].includes(id)||Boolean(albumById(id)))&&(outfitOwned(s,id)||testMode);
  for(const a of albums.slice(1))a.tracks.forEach((t,i)=>songs.push({
    ...t,album:a.id,
    hint:i?'앞 트랙을 수집하고 한 번 연습하면 열려요.':'이 앨범을 해금하면 열려요.',
    unlocked:s=>albumUnlocked(s,a.id)&&(!i||(open(s,a.tracks[i-1].id)&&s.tracks[a.tracks[i-1].id].length>0))
  }));

  const ids = songs.map(s=>s.id);
  const flags = ['first','album','yj','gr','br','reunion','ending'];
  function fresh(now=Date.now()){
    return {version:11,mini:mini.fresh(),daily:{lastDay:null,count:0},jobCounts:emptyJobCounts(),cardDecorations:{},displayCard:null,finale:false,purchases:[],equipped:defaultEquipment(),hair:defaultEquipment(),gigs:0,shopJob:null,content:'album-journey',albums:[],points:100,energyAt:now,tracks:Object.fromEntries(ids.map(id=>[id,[]])),flags:[],collected:['scent'],proofs:[],notes:{},active:null,queue:null,setlist:[],display:null};
  }
  const has=(s,id)=>s.flags.includes(id);
  const eligible=(s,id)=>songs.find(song=>song.id===id)?.unlocked(s)??false;
  const open=(s,id)=>s.collected.includes(id);
  const ready=(s,id)=>s.tracks[id].length===3;
  const percent=(s,id)=>s.tracks[id].reduce((sum,i)=>sum+lessons[i].gain,0);
  const voices=s=>members.filter(m=>has(s,m.id)).length;
  const count=s=>ids.filter(id=>open(s,id)).length;
  const cheers=s=>ids.reduce((n,k)=>n+s.tracks[k].length,0)*2+s.flags.length*5;
  function recover(s,now){
    if(now<s.energyAt)return;
    const n=Math.floor((now-s.energyAt)/timing.recoveryMs);
    if(s.points===100){s.energyAt=now;return;}
    if(n){s.points=Math.min(100,s.points+n*5);s.energyAt=s.points===100?now:s.energyAt+n*timing.recoveryMs;}
  }
  function start(s,job,at){
    const cost=job.chain?(s.simple?.debuted===false?0:(3-s.tracks[job.track].length)*5):5;
    if(s.points<cost)return false;
    if(s.points===100)s.energyAt=at;
    s.points-=cost;s.active={...job,end:at+trainingMs(s,job.track,job.lesson,job.chain)};return true;
  }
  function settle(s,now=Date.now()){
    let finished=0;
    if(s.shopJob&&s.shopJob.end<=now){if(s.shopJob.kind==='setup')s.gigs++;else s.jobCounts[s.shopJob.kind]++;s.shopJob=null;finished++;}
    while(s.active&&s.active.end<=now){
      const {track,lesson,end,chain}=s.active;
      if(!s.tracks[track].includes(lesson))s.tracks[track].push(lesson);
      if(ready(s,track)&&!s.setlist.includes(track))s.setlist.push(track);
      s.active=null;finished++;recover(s,end);
      if(chain&&!ready(s,track)){const next=[0,1,2].find(i=>!s.tracks[track].includes(i));s.active={track,lesson:next,chain:true,end:end+trainingMs(s,track,next,true)};}
      else if(s.queue&&start(s,s.queue,end))s.queue=null;
    }
    if(!s.active&&s.queue){const cost=s.queue.chain?(s.simple?.debuted===false?0:(3-s.tracks[s.queue.track].length)*5):5;const at=s.energyAt+Math.ceil(Math.max(0,cost-s.points)/5)*timing.recoveryMs;if(at<=now){recover(s,at);if(start(s,s.queue,at)){s.queue=null;return finished+settle(s,now);}}}
    recover(s,now);return finished;
  }
  function trainAll(s,track,now=Date.now()){
    if(!ids.includes(track)||!open(s,track)||ready(s,track)||s.queue||s.active?.track===track)return false;
    const job={track,lesson:[0,1,2].find(i=>!s.tracks[track].includes(i)),chain:true};
    if(s.active){s.queue=job;return true;}
    return start(s,job,now);
  }
  function train(s,track,lesson,now=Date.now()){
    if(!ids.includes(track)||!open(s,track)||!lessons[lesson]||s.tracks[track].includes(lesson))return false;
    const same=j=>j&&j.track===track&&j.lesson===lesson;
    if(same(s.active)||s.queue)return false;
    const job={track,lesson};
    if(s.active){s.queue=job;return true;}
    return start(s,job,now);
  }
  function claim(s,id){
    if(has(s,id))return false;
    const allowed=id==='first'?ready(s,'scent'):id==='album'?has(s,'first'):
      members.some(m=>m.id===id)||id==='reunion'?coreAvailable(s,id):
      id==='ending'?has(s,'album')&&s.setlist.length>=2:false;
    if(!allowed||!s.proofs.includes('story:'+id))return false;
    s.flags.push(id);return true;
  }
  function valid(s,limits={}){
    if(!s||s.version!==11||!(limits.miniValid||mini.valid)(s.mini)||s.content!=='album-journey'||!Number.isInteger(s.points)||s.points<0||s.points>(limits.maxPoints??100)||!Number.isSafeInteger(s.energyAt)||s.energyAt<0)return false;
    const subset=(a,opts)=>Array.isArray(a)&&a.every(x=>opts.includes(x))&&new Set(a).size===a.length;
    if(!subset(s.flags,flags)||!s.tracks||!ids.every(id=>subset(s.tracks[id],[0,1,2])))return false;
    if(!subset(s.albums,albums.slice(1).map(a=>a.id)))return false;
    if(!s.albums.every((id,i)=>id===albums[i+1].id&&albumUnlocked(s,albums[i].id)&&albumComplete(s,albums[i].id)))return false;
    if(!subset(s.collected,ids)||!s.collected.includes('scent')||!s.collected.every(id=>(limits.eligible||eligible)(s,id))||!subset(s.proofs,Object.keys(challenges))||!s.notes||typeof s.notes!=='object'||Array.isArray(s.notes)||!Object.entries(s.notes).every(([k,v])=>k.startsWith('story:')&&challenges[k]&&typeof v==='string'&&v.trim().length>0&&v.length<=200))return false;
    if(!ids.every(id=>!s.tracks[id].length||open(s,id)))return false;
    const job=j=>j&&(j.chain===undefined||typeof j.chain==='boolean')&&ids.includes(j.track)&&open(s,j.track)&&[0,1,2].includes(j.lesson)&&!s.tracks[j.track].includes(j.lesson);
    if(s.active!==null&&(!job(s.active)||!Number.isSafeInteger(s.active.end)||s.active.end<0))return false;
    if(s.queue!==null&&(!job(s.queue)||(s.active&&s.queue.track===s.active.track&&s.queue.lesson===s.active.lesson)))return false;
    if(!storyEntries.every(e=>!storyDone(s,e.id)||storyAvailable(s,e.id)))return false;
    if(!subset(s.setlist,ids.filter(id=>ready(s,id)))||!(s.display===null||members.some(m=>m.id===s.display&&has(s,m.id))))return false;
    if(!s.daily||typeof s.daily!=='object'||Array.isArray(s.daily)||!Number.isInteger(s.daily.count)||s.daily.count<0||s.daily.count>1000000)return false;
    if(s.daily.count===0?s.daily.lastDay!==null:typeof s.daily.lastDay!=='string'||!/^\d{4}-\d{2}-\d{2}$/.test(s.daily.lastDay)||!Number.isFinite(Date.parse(s.daily.lastDay+'T00:00:00Z'))||new Date(s.daily.lastDay+'T00:00:00Z').toISOString().slice(0,10)!==s.daily.lastDay)return false;
    if(!Number.isInteger(s.gigs)||s.gigs<0||s.gigs>1000000||!subset(s.purchases,shop.flatMap(o=>memberIds.map(m=>o.id+':'+m))))return false;
    if(!s.jobCounts||typeof s.jobCounts!=='object'||Array.isArray(s.jobCounts)||Object.keys(s.jobCounts).length!==3||!shopJobs.slice(1).every(j=>Number.isInteger(s.jobCounts[j.id])&&s.jobCounts[j.id]>=0&&s.jobCounts[j.id]<=1000000))return false;
    if(s.shopJob!==null&&(!s.shopJob||!shopJobById(s.shopJob.kind)||!Number.isSafeInteger(s.shopJob.end)||s.shopJob.end<0||jobCount(s,s.shopJob.kind)>=1000000))return false;
    if(typeof s.finale!=='boolean'||s.finale&&!finaleReady(s)||!(s.displayCard===null||cardOwned(s,s.displayCard)))return false;
    if(s.displayPoster!==undefined&&!(typeof s.displayPoster==='string'&&albums.some(a=>a.id===s.displayPoster)&&albumUnlocked(s,s.displayPoster)))return false;
    if(!s.cardDecorations||typeof s.cardDecorations!=='object'||Array.isArray(s.cardDecorations))return false;
    if(!playDays.valid(s))return false;
    const earnedBadges=badges(s).filter(b=>b.earned).map(b=>b.id);
    if(!Object.entries(s.cardDecorations).every(([id,list])=>cardOwned(s,id)&&Array.isArray(list)&&list.length<=3&&subset(list,earnedBadges)))return false;
    if(!s.equipped||!s.hair||!memberIds.every(m=>styleOwned(s,s.equipped[m],m)&&styleOwned(s,s.hair[m],m))||(limits.balance??coins(s))<0)return false;
    return s.flags.every(id=>s.proofs.includes('story:'+id))&&(!has(s,'first')||ready(s,'scent'))&&(!has(s,'album')||has(s,'first'))&&(!voices(s)||has(s,'album'))&&(!has(s,'reunion')||has(s,'gr')&&has(s,'yj'))&&(!has(s,'ending')||albumUnlocked(s,'first-mind')&&ids.filter(id=>ready(s,id)).length>=2);
  }

  function loadSave(raw){
    let data=JSON.parse(raw);
    if([1,2,3].includes(data?.version)){
      const legacy=__require("src/shared/our-stage-legacy.js").loadSave(raw);
      data={...legacy,version:4,content:'album-journey',tracks:{...fresh().tracks,...legacy.tracks},albums:[]};
    }
    if(data?.version===4)data={...data,version:5,purchases:[],equipped:defaultEquipment(),gigs:0,shopJob:null};
    if(data?.version===5)data={...data,version:6,hair:{...data.equipped}};
    if(data?.version===6)data={...data,version:8,cardDecorations:{},displayCard:data.display?'story:'+data.display:null,finale:false};
    if(data?.version===7)data={...data,version:8,cardDecorations:{}};
    if(data?.version===8)data={...data,version:9,jobCounts:emptyJobCounts(),shopJob:data.shopJob?{...data.shopJob,kind:'setup'}:null};
    if(data?.version===9)data={...data,version:10,daily:{lastDay:null,count:0}};
    if(data?.version===10)data={...data,version:11,mini:mini.fresh()};
    if(!valid(data))throw Error('Invalid stage save');
    return data;
  }


  const challenges = {...__require("src/data/our-stage-challenges.json"),...__require("src/data/our-stage-journey-challenges.json")};
  for(const q of Object.values(challenges)){if(!q.level)q.level=1;if(!q.skill)q.skill='첫 기억';}
  storyEntries.forEach((e,i)=>{
    const q=e.quiz,choices=[...q.wrong],answer=i%(choices.length+1);choices.splice(answer,0,q.correct);
    challenges['story:'+e.id]={...q,choices,answer,source:e.source};
  });

  function canChallenge(s,key){
    if(!challenges[key])return false;
    const [kind,id]=key.split(':');
    if(kind==='story'&&storyById(id))return storyAvailable(s,id)&&!storyDone(s,id);
    if(kind==='song')return eligible(s,id)&&!open(s,id);
    return id==='first'?ready(s,'scent'):id==='album'?has(s,'first'):
      members.some(m=>m.id===id)||id==='reunion'?coreAvailable(s,id):
      id==='ending'?has(s,'album')&&s.setlist.length>=2:false;
  }
  function answer(s,key,index){
    if(!canChallenge(s,key)||index!==challenges[key].answer)return false;
    if(!s.proofs.includes(key))s.proofs.push(key);
    if(key.startsWith('song:'))s.collected.push(key.slice(5));
    return true;
  }
  const canCheer=(s,key)=>Boolean(challenges[key]&&key.startsWith('story:')&&(s.proofs.includes(key)||canChallenge(s,key)));
  function cheer(s,key,text){
    text=String(text||'').trim();
    if(!canCheer(s,key)||!text||text.length>200)return false;
    s.notes[key]=text;if(!s.proofs.includes(key))s.proofs.push(key);return true;
  }

  function decorateCard(s,cardId,badgeId){
    if(!cardOwned(s,cardId)||!badges(s).some(b=>b.id===badgeId&&b.earned))return false;
    const list=s.cardDecorations[cardId]||[];
    if(list.includes(badgeId)){const next=list.filter(id=>id!==badgeId);if(next.length)s.cardDecorations[cardId]=next;else delete s.cardDecorations[cardId];return true;}
    if(list.length>=3)return false;
    s.cardDecorations[cardId]=[...list,badgeId];return true;
  }
  function badges(s){
    const b=[
      {id:'first-practice',name:'첫 연습',earned:ids.some(id=>s.tracks[id].length),hint:'어떤 곡이든 한 번 연습',icon:0},
      {id:'first-stage',name:'첫 무대 포스터',earned:has(s,'first'),hint:'첫 무대 완료',icon:1},
      {id:'three-voices',name:'세 개의 마이크',earned:voices(s)===3,hint:'김연지 ‘가면 너머의 목소리’ · 남규리 ‘카메라 앞에서’ · 이보람 ‘또 다른 하모니’ 이야기 모두 간직하기',icon:3},
      {id:'reunion',name:'다시 같은 무대',earned:has(s,'reunion'),hint:'재회 이야기 완료',icon:4},
      {id:'ending',name:'우리의 불빛',earned:has(s,'ending'),hint:'첫 콘서트 완료',icon:5}
    ].map(x=>({...x,group:'이야기',kind:'activity'}));
    albums.forEach((a,i)=>{
      for(const [kind,name,earned,hint] of [
        ['unlock',a.name+' · 첫 페이지',albumUnlocked(s,a.id),'앨범 해금'],
        ['collect',i===0?'첫 번째 앨범을 펼치다':a.name+' · 전곡 수집',albumComplete(s,a.id),a.tracks.length+'트랙 모두 수집'],
        ['master',a.name+' · 무대 완성',albumMastered(s,a.id),'모든 트랙 준비도 100%']
      ])b.push({id:a.id+'-'+kind,name,earned,hint,group:'앨범',kind,album:a.id,icon:i});
    });
    for(const [target,name] of [[50,'함께한 50일'],[100,'함께한 100일']])b.push({id:'play-days-'+target,name,earned:playDayCount(s)>=target,hint:'누적 '+target+'일 방문 · 현재 '+playDayCount(s)+'일. 한국 시간 기준 하루 한 번, 연속 방문이 아니어도 괜찮아요.',group:'활동',kind:'activity',icon:2});
    const practices=ids.reduce((n,id)=>n+s.tracks[id].length,0),notes=Object.keys(s.notes).length;
    for(const [prefix,label,values,n,icon] of [
      ['practice','차곡차곡 연습',[10,30,60],practices,0],
      ['collection','노래 수집가',[10,30,60],count(s),2],
      ['cheer','응원의 문장',[1,3,5],notes,3]
    ])for(const target of values)b.push({id:prefix+'-'+target,name:label+' '+target,earned:n>=target,hint:prefix==='practice'?target+'회 연습 완료':prefix==='collection'?target+'트랙 수집':target+'개 이야기에 응원 남기기',group:'활동',kind:'activity',icon});
    b.push({id:'all-master',name:'우리의 모든 계절',earned:albums.every(a=>albumMastered(s,a.id)),hint:'8개 앨범의 모든 트랙 준비도 100%',group:'활동',kind:'activity',icon:5});
    for(const e of storyEntries.filter(e=>e.kind==='event'&&e.awardBadge!==false))b.push({id:e.id,name:e.badgeName||e.title,earned:storyDone(s,e.id),hint:'사이드 이벤트 간직하기 · '+e.date,group:'이벤트',kind:'activity',icon:e.icon});
    b.push({id:'story-journey',name:'노래 사이의 모든 기억',earned:storyEntries.every(e=>storyDone(s,e.id)),hint:'앨범 이야기 '+storyEntries.filter(e=>e.kind==='album').length+'개와 사이드 이벤트 '+storyEntries.filter(e=>e.kind==='event').length+'개 간직하기',group:'이야기',kind:'activity',icon:2});
    b.push({id:'gyul-star',name:'귤별이 돼',earned:memberCards(s).filter(c=>c.member==='gr'&&c.earned).length>=3,hint:'남규리 멤버 카드 3장 수집',group:'활동',kind:'activity',icon:2});
    if(s.simple?.phaseOne===1)b.push({id:'trainee-complete',name:'연습생 수료',earned:ready(s,'scent'),hint:'첫 노래 연습 완료',group:'이야기',kind:'activity',icon:0});
    b.push({id:'all-members-unlocked',name:'모든 멤버 해금',earned:albumUnlocked(s,'rebloom'),hint:'Rebloom 해금 · 씨야를 함께한 네 멤버의 기록',group:'이야기',kind:'activity',icon:2});
    for(const [member,name] of [['br','이보람'],['gr','남규리'],['yj','김연지']])b.push({id:'solo-concert-'+member,name:name+'의 솔로 무대',earned:Boolean(s.solo?.concerts?.['solo-'+member]),hint:name+' 솔로 콘서트 완료',group:'솔로 콘서트',kind:'activity',icon:2});
    return b;
  }

  return {playDayCount,recordPlayDay,capsuleOutfits,canCheer,albumStoryGates,storyDestination,comebackRequirements,albumRequirements,mini,dailyReward,kstDay,canClaimDaily,claimDaily,shopJobs,shopJobById,decorateCard,cardMembers,memberCards,cardOwned,coreAvailable,coreCondition,finaleReady,finishFinale,shop,shopById,memberIds,earnings,coins,styleOwned,equip,equipPart,purchase,startShopJob,storyEntries,storyById,storyAvailable,storyDone,storyCondition,quizLevels,albums,albumById,songAlbum,albumCount,albumComplete,albumMastered,albumAvailable,unlockAlbum,badges,albumUnlocked,outfitOwned,canWearOutfit,timing,lessonSeconds,practiceSeconds,challenges,canChallenge,answer,cheer,eligible,loadSave,songs,lessons,members,reunionUrl,ids,fresh,has,open,ready,percent,voices,count,cheers,settle,trainAll,train,claim,valid};
}
module.exports=createModel();
module.exports.forTest=()=>createModel(true);

},
"src/shared/our-stage-mini.js":function(module,exports,__require){
'use strict';
// Local game economy. Limits survive reloads; this is not a server anti-cheat system.
module.exports=function(testMode=false,customBank=null){
 const cooldown=testMode?60000:900000, dailyLimit=6;
 const games=[{id:'quiz',name:'노래 단서 퀴즈',description:'곡과 앨범의 단서를 보고 세 문제를 풀어요.',maxReward:15},{id:'rhythm',name:'응원 리듬 맞추기',description:'노래에 맞춰 다가오는 빛이 중앙에 닿으면 눌러요.',maxReward:16}];
 const bank=customBank||{...__require("src/data/our-stage-challenges.json"),...__require("src/data/our-stage-journey-challenges.json")};
 const pool=Object.keys(bank).filter(k=>k.startsWith('song:'));
 const fresh=()=>({earned:0,day:null,plays:0,next:{quiz:0,rhythm:0},active:null});
 const time=n=>Number.isSafeInteger(n)&&n>=0&&n<253402268399999;
 const day=n=>time(n)?new Date(n+32400000).toISOString().slice(0,10):null;
 const used=(m,now)=>m.day&&day(now)>m.day?0:m.plays;
 const wait=(m,kind,now)=>Math.max(0,(m.next[kind]||0)-now);
 function canStart(m,kind,now){return time(now)&&games.some(g=>g.id===kind)&&!m.active&&(!m.day||day(now)>=m.day)&&used(m,now)<dailyLimit&&!wait(m,kind,now);}
 function start(m,kind,now,random=Math.random,pattern='steady'){
  if(!canStart(m,kind,now)||!patterns.some(p=>p.id===pattern))return false;
  if(m.day!==day(now)){m.day=day(now);m.plays=0;}m.plays++;m.next[kind]=now+cooldown;
  const keys=[...pool];for(let i=keys.length-1;i>0;i--){const j=Math.floor(Math.max(0,Math.min(.999999,random()))*(i+1));[keys[i],keys[j]]=[keys[j],keys[i]];}
  m.active={id:kind+':'+now,kind,...(kind==='rhythm'?{pattern,began:false}:{}),started:now,keys:kind==='quiz'?keys.slice(0,3):[],answers:[],taps:[],beatStart:null};return m.active.id;
 }
 const question=a=>a?.kind==='quiz'?bank[a.keys[a.answers.length]]:null;
 function answer(m,id,index){const a=m.active,q=question(a);if(!a||a.id!==id||!q||!Number.isInteger(index)||index<0||index>=q.choices.length)return false;a.answers.push(index);return true;}
 const beats=8,interval=700,lead=2100,windowMs=200;
 const patterns=[{id:'steady',name:'기본 박자',offsets:[0,700,1400,2100,2800,3500,4200,4900]},{id:'pairs',name:'두 번씩 치기',offsets:[0,450,1400,1850,2800,3250,4200,4650]},{id:'offbeat',name:'엇박자',offsets:[0,1050,1750,2100,3150,3850,4200,5250]}];
 const charts=__require("src/data/our-stage-rhythm-songs.json");
 const chartById=id=>charts.find(c=>c.id===id);
 const total=a=>a.kind==='quiz'?3:offsets(a).length;
 function beginChart(m,id,now,chartId){const began=m.active?.began;if(!chartById(chartId)||!beginBeat(m,id,now))return false;m.active.chartId=chartId;m.active.began=began===true;return true;}
 const offsets=a=>a.chartId?chartById(a.chartId).chart.notes.map(t=>t-chartById(a.chartId).chart.notes[0]):a.tempoMs?Array.from({length:8},(_,i)=>i*a.tempoMs):patterns.find(p=>p.id===(a.pattern||'steady')).offsets;
 function beginSong(m,id,now,tempoMs){if(!Number.isInteger(tempoMs)||tempoMs<400||tempoMs>1500||!beginBeat(m,id,now))return false;m.active.tempoMs=tempoMs;return true;}
 function resetBeat(m,id){const a=m.active;if(!a||a.id!==id||a.kind!=='rhythm')return false;a.beatStart=null;a.taps=[];delete a.tempoMs;delete a.chartId;return true;}
 const endAt=a=>a.beatStart+offsets(a).at(-1)+windowMs;
 function beginBeat(m,id,now){const a=m.active;if(!a||a.id!==id||a.kind!=='rhythm'||a.beatStart!==null||!time(now)||now<a.started)return false;a.beatStart=now+lead;a.began=true;return true;}
 function tap(m,id,now){const a=m.active;if(!a||a.id!==id||a.kind!=='rhythm'||a.beatStart===null||!time(now)||now<a.beatStart-lead||now>endAt(a))return null;
  if(a.taps.length>=total(a)*4||a.taps.length&&now-a.taps[a.taps.length-1]<100)return null;
  a.began=true;a.taps.push(now);return score(a);
 }
 function judge(a){
  const hit=new Set(),times=offsets(a);let misses=0;for(const t of a.taps){let n=0;times.forEach((x,i)=>{if(Math.abs(t-a.beatStart-x)<Math.abs(t-a.beatStart-times[n]))n=i;});if(Math.abs(t-a.beatStart-times[n])<=windowMs&&!hit.has(n))hit.add(n);else if(t>=a.beatStart-windowMs)misses++;}return {hits:hit.size,misses,score:Math.max(0,hit.size-misses)};
 }
 function score(a){return a.kind==='quiz'?a.answers.reduce((n,x,i)=>n+(x===bank[a.keys[i]].answer?1:0),0):judge(a).score;}
 function finish(m,id,now){const a=m.active;if(!a||a.id!==id||!time(now))return null;
  if(a.kind==='quiz'?a.answers.length!==3:a.beatStart===null||now<endAt(a))return null;
  const correct=score(a),count=total(a),reward=a.kind==='quiz'?correct*5:Math.round(16*correct/count),result={kind:a.kind,correct,total:count,reward};m.earned+=reward;m.active=null;return result;
 }
 function abandon(m,id){const a=m.active;if(a?.id!==id)return false;if(a.kind==='rhythm'&&a.began===false){m.plays=Math.max(0,m.plays-1);if(m.next.rhythm===a.started+cooldown)m.next.rhythm=0;}m.active=null;return true;}
 function valid(m){
  if(!m||!Number.isSafeInteger(m.earned)||m.earned<0||m.earned>100000000||!Number.isInteger(m.plays)||m.plays<0||m.plays>dailyLimit||!m.next||!games.every(g=>time(m.next[g.id])))return false;
  if(m.day===null?m.plays!==0:typeof m.day!=='string'||!/^\d{4}-\d{2}-\d{2}$/.test(m.day)||!Number.isFinite(Date.parse(m.day+'T00:00:00Z'))||new Date(m.day+'T00:00:00Z').toISOString().slice(0,10)!==m.day)return false;
  const a=m.active;if(a===null)return true;
  if(!a||!games.some(g=>g.id===a.kind)||!time(a.started)||a.id!==a.kind+':'+a.started||m.plays<1||m.next[a.kind]<=a.started||!Array.isArray(a.keys)||!Array.isArray(a.answers)||!Array.isArray(a.taps))return false;
  if(a.kind==='quiz')return a.keys.length===3&&new Set(a.keys).size===3&&a.keys.every(k=>pool.includes(k))&&a.answers.length<=3&&a.answers.every((x,i)=>Number.isInteger(x)&&x>=0&&x<bank[a.keys[i]].choices.length)&&a.taps.length===0&&a.beatStart===null;
  return (a.began===undefined||typeof a.began==='boolean')&&(a.began!==false||!a.taps.length)&&(a.chartId===undefined||Boolean(chartById(a.chartId))&&a.beatStart!==null&&a.tempoMs===undefined)&&(a.tempoMs===undefined||Number.isInteger(a.tempoMs)&&a.tempoMs>=400&&a.tempoMs<=1500&&a.beatStart!==null)&&patterns.some(p=>p.id===(a.pattern||'steady'))&&!a.keys.length&&!a.answers.length&&(a.beatStart===null?!a.taps.length:time(a.beatStart)&&a.beatStart>=a.started+lead)&&a.taps.length<=total(a)*4&&a.taps.every((t,i)=>time(t)&&t>=a.beatStart-lead&&t<=endAt(a)&&(!i||t-a.taps[i-1]>=100));
 }
 return {judge,charts,chartById,beginChart,total,beginSong,resetBeat,patterns,offsets,endAt,games,bank,pool,fresh,day,used,wait,canStart,start,question,answer,beginBeat,tap,score,finish,abandon,valid,cooldown,dailyLimit,beats,interval,lead,windowMs};
};

},
"src/data/our-stage-challenges.json":function(module,exports,__require){
module.exports={"song:shoes":{"question":"씨야 1집의 두 번째 수록곡은?","choices":["구두","Stay","결혼할까요"],"answer":0,"explanation":"1집 The First Mind의 2번 트랙은 ‘구두’예요.","source":"https://www.melon.com/album/detail.htm?albumId=314286"},"song:because":{"question":"‘사랑하기 때문에’에 피처링한 팀은?","choices":["SG워너비","다비치","브라운 아이드 걸스"],"answer":0,"explanation":"이 곡은 SG워너비가 피처링한 1집 수록곡이에요.","source":"https://www.melon.com/album/detail.htm?albumId=314286"},"song:flower":{"question":"1집 수록곡 중 꽃의 이름을 가진 곡은?","choices":["접시꽃","해바라기","장미"],"answer":0,"explanation":"1집 네 번째 트랙은 ‘접시꽃’이에요.","source":"https://www.melon.com/album/detail.htm?albumId=314286"},"song:promise":{"question":"1집 다섯 번째 트랙의 제목은?","choices":["Stay","Promise U","The Last"],"answer":1,"explanation":"Promise U는 1집 다섯 번째 트랙이에요.","source":"https://www.melon.com/album/detail.htm?albumId=314286"},"song:again":{"question":"‘Promise U’ 다음에 이어지는 1집 곡은?","choices":["처음부터 또다시","구두","여인의 향기"],"answer":0,"explanation":"앨범의 6번 트랙은 ‘처음부터 또다시’예요.","source":"https://www.melon.com/album/detail.htm?albumId=314286"},"song:guilty":{"question":"‘처음부터 또다시’ 다음의 1집 수록곡은?","choices":["무죄","유죄","약속"],"answer":1,"explanation":"1집 7번 트랙의 제목은 ‘유죄’예요.","source":"https://www.melon.com/album/detail.htm?albumId=314286"},"song:parting":{"question":"1집의 실제 수록곡 제목은?","choices":["이별 준비","이별 일기","이별 해보기"],"answer":2,"explanation":"‘이별 해보기’는 1집 8번 트랙이에요.","source":"https://www.melon.com/album/detail.htm?albumId=314286"},"song:tears":{"question":"제목 ‘Tears And ___’에 들어가는 단어는?","choices":["Fears","Stars","Dreams"],"answer":0,"explanation":"정식 곡명은 Tears And Fears예요.","source":"https://www.melon.com/album/detail.htm?albumId=314286"},"song:loved":{"question":"1집의 실제 수록곡 제목을 골라보세요.","choices":["사랑했다면","사랑할까요","사랑의 인사"],"answer":0,"explanation":"‘사랑했다면’은 1집 10번 트랙이에요.","source":"https://www.melon.com/album/detail.htm?albumId=314286"},"song:just":{"question":"1집에서 ‘사랑했다면’ 다음에 오는 곡은?","choices":["그냥","구두","접시꽃"],"answer":0,"explanation":"1집 11번 트랙은 ‘그냥’이에요.","source":"https://www.melon.com/album/detail.htm?albumId=314286"},"song:fault":{"question":"씨야 1집을 마무리하는 마지막 곡은?","choices":["내 잘못입니다","Promise U","유죄"],"answer":0,"explanation":"12번 트랙 ‘내 잘못입니다’로 첫 앨범이 마무리돼요.","source":"https://www.melon.com/album/detail.htm?albumId=314286"},"story:first":{"question":"씨야의 데뷔 앨범 타이틀곡은?","choices":["사랑의 인사","여인의 향기","Hot Girl"],"answer":1,"explanation":"씨야는 1집 타이틀곡 ‘여인의 향기’로 데뷔했어요.","source":"https://www.melon.com/album/detail.htm?albumId=314286"},"story:album":{"question":"씨야의 첫 정규 앨범 이름은?","choices":["Lovely Sweet Heart","First, Again","The First Mind"],"answer":2,"explanation":"The First Mind는 2006년에 발표된 씨야의 첫 정규 앨범이에요.","source":"https://www.melon.com/album/detail.htm?albumId=314286"},"story:yj":{"question":"이 기록의 주인공, ‘복면가왕 더 위너’ 무대에 선 멤버는?","choices":["이보람","김연지","남규리"],"answer":1,"explanation":"방금 읽은 2018 DMC 페스티벌 무대의 주인공은 김연지예요.","source":"https://www.youtube.com/watch?v=VX4z0syPoWw","level":4,"skill":"멤버 활동의 흐름"},"story:gr":{"question":"남규리의 연기 기록에서 살펴본 드라마는?","choices":["49일","별에서 온 그대","도깨비"],"answer":0,"explanation":"남규리가 출연한 드라마 ‘49일’의 기록을 만났어요.","source":"https://www.bntnews.co.kr/article/view/bnt201105200353","level":4,"skill":"멤버 활동의 흐름"},"story:br":{"question":"이보람이 ‘놀면 뭐하니?’에서 함께한 팀은?","choices":["가야G","씨스타","오렌지캬라멜"],"answer":0,"explanation":"이보람은 WSG워너비의 가야G 멤버로 함께했어요.","source":"https://www.youtube.com/watch?v=cojgPoISAf0","level":4,"skill":"멤버 활동의 흐름"},"story:reunion":{"question":"2020년 씨야 세 사람이 다시 함께 노래한 프로그램은?","choices":["슈가맨3","유희열의 스케치북","복면가왕"],"answer":0,"explanation":"JTBC 슈가맨3에서 원년 멤버 세 사람이 다시 무대에 섰어요.","source":"https://tv.jtbc.co.kr/clip/pr10011122/pm10055652/vo10354827/view","level":4,"skill":"멤버 활동의 흐름"},"story:ending":{"question":"이번에 모아 온 1집의 수록곡은 모두 몇 곡인가요?","choices":["10곡","11곡","12곡"],"answer":2,"explanation":"The First Mind의 열두 곡을 하나씩 모으며 우리만의 무대를 채워요.","source":"https://www.melon.com/album/detail.htm?albumId=314286"}};
},
"src/data/our-stage-journey-challenges.json":function(module,exports,__require){
module.exports={"song:lovely-sweet-heart-01":{"question":"2집 Lovely Sweet Heart에 수록된 곡은?","choices":["사랑의 인사","여인의 향기","Hot Girl"],"answer":0,"explanation":"2집의 1번 트랙은 ‘사랑의 인사’입니다.","source":"https://www.melon.com/album/detail.htm?albumId=352046","level":2,"skill":"곡 알아보기"},"song:lovely-sweet-heart-02":{"question":"2집에서 ‘사랑의 인사’ 바로 다음 곡은?","choices":["너는 내 남자","결혼할까요","Dirty Dancing"],"answer":1,"explanation":"‘사랑의 인사’ 다음에는 ‘결혼할까요’가 이어집니다.","source":"https://www.melon.com/album/detail.htm?albumId=352046","level":2,"skill":"수록 순서"},"song:lovely-sweet-heart-03":{"question":"‘너는 내 남자’가 수록된 정규 앨범은?","choices":["The First Mind","Brilliant Change","Lovely Sweet Heart"],"answer":2,"explanation":"‘너는 내 남자’는 Lovely Sweet Heart의 수록곡입니다.","source":"https://www.melon.com/album/detail.htm?albumId=352046","level":2,"skill":"앨범 연결"},"song:lovely-sweet-heart-04":{"question":"2집 Lovely Sweet Heart에 수록된 곡은?","choices":["Dirty Dancing","여인의 향기","Hot Girl"],"answer":0,"explanation":"2집의 4번 트랙은 ‘Dirty Dancing’입니다.","source":"https://www.melon.com/album/detail.htm?albumId=352046","level":2,"skill":"곡 알아보기"},"song:lovely-sweet-heart-05":{"question":"2집에서 ‘Dirty Dancing’ 바로 다음 곡은?","choices":["사랑의 인사","어떻게 널 잊겠니","결혼할까요"],"answer":1,"explanation":"‘Dirty Dancing’ 다음에는 ‘어떻게 널 잊겠니’가 이어집니다.","source":"https://www.melon.com/album/detail.htm?albumId=352046","level":2,"skill":"수록 순서"},"song:lovely-sweet-heart-06":{"question":"‘사랑아’가 수록된 정규 앨범은?","choices":["The First Mind","Brilliant Change","Lovely Sweet Heart"],"answer":2,"explanation":"‘사랑아’는 Lovely Sweet Heart의 수록곡입니다.","source":"https://www.melon.com/album/detail.htm?albumId=352046","level":2,"skill":"앨범 연결"},"song:lovely-sweet-heart-07":{"question":"2집 Lovely Sweet Heart에 수록된 곡은?","choices":["그 사람이 나를 사랑해요","여인의 향기","Hot Girl"],"answer":0,"explanation":"2집의 7번 트랙은 ‘그 사람이 나를 사랑해요’입니다.","source":"https://www.melon.com/album/detail.htm?albumId=352046","level":2,"skill":"곡 알아보기"},"song:lovely-sweet-heart-08":{"question":"2집에서 ‘그 사람이 나를 사랑해요’ 바로 다음 곡은?","choices":["사랑의 인사","Summer Dream","결혼할까요"],"answer":1,"explanation":"‘그 사람이 나를 사랑해요’ 다음에는 ‘Summer Dream’가 이어집니다.","source":"https://www.melon.com/album/detail.htm?albumId=352046","level":2,"skill":"수록 순서"},"song:lovely-sweet-heart-09":{"question":"‘사랑이 간다’가 수록된 정규 앨범은?","choices":["The First Mind","Brilliant Change","Lovely Sweet Heart"],"answer":2,"explanation":"‘사랑이 간다’는 Lovely Sweet Heart의 수록곡입니다.","source":"https://www.melon.com/album/detail.htm?albumId=352046","level":2,"skill":"앨범 연결"},"song:lovely-sweet-heart-10":{"question":"2집 Lovely Sweet Heart에 수록된 곡은?","choices":["감동을 주세요","여인의 향기","Hot Girl"],"answer":0,"explanation":"2집의 10번 트랙은 ‘감동을 주세요’입니다.","source":"https://www.melon.com/album/detail.htm?albumId=352046","level":2,"skill":"곡 알아보기"},"song:lovely-sweet-heart-11":{"question":"2집에서 ‘감동을 주세요’ 바로 다음 곡은?","choices":["사랑의 인사","얼음인형","결혼할까요"],"answer":1,"explanation":"‘감동을 주세요’ 다음에는 ‘얼음인형’가 이어집니다.","source":"https://www.melon.com/album/detail.htm?albumId=352046","level":2,"skill":"수록 순서"},"song:lovely-sweet-heart-12":{"question":"‘순애보’가 수록된 정규 앨범은?","choices":["The First Mind","Brilliant Change","Lovely Sweet Heart"],"answer":2,"explanation":"‘순애보’는 Lovely Sweet Heart의 수록곡입니다.","source":"https://www.melon.com/album/detail.htm?albumId=352046","level":2,"skill":"앨범 연결"},"song:lovely-sweet-heart-13":{"question":"2집 Lovely Sweet Heart에 수록된 곡은?","choices":["남","여인의 향기","Hot Girl"],"answer":0,"explanation":"2집의 13번 트랙은 ‘남’입니다.","source":"https://www.melon.com/album/detail.htm?albumId=352046","level":2,"skill":"곡 알아보기"},"song:california-dream-01":{"question":"‘슬픈 발걸음’의 또 다른 이름은?","choices":["구두 III","구두 II","여인의 향기 II"],"answer":1,"explanation":"앨범 소개는 ‘슬픈 발걸음’을 구두 II로 소개합니다.","source":"https://www.melon.com/album/detail.htm?albumId=362767","level":2,"skill":"활동 연결"},"song:california-dream-02":{"question":"California Dream에서 ‘슬픈 발걸음’과 함께 타이틀로 표시된 곡은?","choices":["Classic","연가","그래도 좋아"],"answer":2,"explanation":"음원 목록에서 ‘슬픈 발걸음’과 ‘그래도 좋아’가 타이틀로 표시됩니다.","source":"https://www.melon.com/album/detail.htm?albumId=362767","level":2,"skill":"활동 연결"},"song:california-dream-03":{"question":"California Dream의 앨범 사진을 촬영한 지역으로 소개된 곳은?","choices":["LA와 라스베가스","서울과 부산","파리와 런던"],"answer":0,"explanation":"앨범 소개에는 LA와 라스베가스에서 재킷 사진을 촬영했다고 나옵니다.","source":"https://www.melon.com/album/detail.htm?albumId=362767","level":2,"skill":"활동 연결"},"song:california-dream-04":{"question":"발매 순서에서 California Dream 바로 앞의 정규 앨범은?","choices":["The First Mind","Lovely Sweet Heart","Brilliant Change"],"answer":1,"explanation":"2집 Lovely Sweet Heart 다음에 2.5집 California Dream이 이어집니다.","source":"https://www.melon.com/album/detail.htm?albumId=362767","level":2,"skill":"활동 연결"},"song:california-dream-05":{"question":"‘미워요’와 같은 California Dream에 담긴 곡은?","choices":["Hot Girl","그 놈 목소리","Classic"],"answer":2,"explanation":"‘미워요’와 ‘Classic’은 모두 California Dream 수록곡입니다.","source":"https://www.melon.com/album/detail.htm?albumId=362767","level":2,"skill":"활동 연결"},"song:california-dream-06":{"question":"‘요즘 나는’의 원래 OST에 함께 참여한 두 사람은?","choices":["남규리 · 이홍기","김연지 · 제아","이보람 · 이홍기"],"answer":0,"explanation":"남규리와 FTIsland 이홍기가 시트콤 ‘못말리는 결혼’ OST ‘요즘 나는’에 참여했습니다.","source":"https://www.melon.com/album/detail.htm?albumId=362767","level":2,"skill":"활동 연결"},"song:california-dream-07":{"question":"‘깊은 밤을 날아서’가 담긴 원래 영화 OST는?","choices":["고死: 피의 중간고사","못말리는 결혼","풀하우스"],"answer":1,"explanation":"남규리가 영화 ‘못말리는 결혼’ OST에서 부른 곡을 이 앨범에도 담았습니다.","source":"https://www.melon.com/album/detail.htm?albumId=362767","level":2,"skill":"활동 연결"},"song:california-dream-08":{"question":"이보람의 ‘처음 그 자리에’가 나온 원래 드라마는?","choices":["49일","투명인간 최장수","풀하우스"],"answer":2,"explanation":"이보람이 부른 ‘풀하우스’ OST ‘처음 그 자리에’도 앨범에 담겼습니다.","source":"https://www.melon.com/album/detail.htm?albumId=362767","level":2,"skill":"활동 연결"},"song:california-dream-09":{"question":"‘미친 사랑의 노래’와 연결되는 드라마는?","choices":["투명인간 최장수","풀하우스","49일"],"answer":0,"explanation":"‘미친 사랑의 노래’는 드라마 ‘투명인간 최장수’ OST입니다.","source":"https://music.bugs.co.kr/album/100005","level":2,"skill":"활동 연결"},"song:california-dream-10":{"question":"‘The Day’를 원래 함께 불렀던 두 보컬은?","choices":["남규리 · 이홍기","김연지 · 제아","이보람 · 제아"],"answer":1,"explanation":"앨범 소개에는 김연지와 브라운 아이드 걸스 제아가 함께 부른 곡으로 나옵니다.","source":"https://www.melon.com/album/detail.htm?albumId=362767","level":2,"skill":"활동 연결"},"song:california-dream-11":{"question":"California Dream 소개에서 ‘The Day’와 함께 언급된 김연지·제아의 곡은?","choices":["연가","Classic","정"],"answer":2,"explanation":"‘The Day’와 ‘정’이 김연지·제아의 참여곡으로 함께 소개됩니다.","source":"https://www.melon.com/album/detail.htm?albumId=362767","level":2,"skill":"활동 연결"},"song:brilliant-change-01":{"question":"3집 ‘가니’의 피처링 명단은?","choices":["김용준 · 황정음 · Mario","김진호 · 황정음 · Mario","김용준 · 제아 · 이홍기","김진호 · 제아 · 이홍기"],"answer":0,"explanation":"‘가니’에는 SG워너비 김용준, 황정음, Mario가 참여했습니다.","source":"https://www.melon.com/album/detail.htm?albumId=398227","level":3,"skill":"참여진·무대 연결"},"song:brilliant-change-02":{"question":"‘Hot Girl’ 활동에서 시도한 음악 스타일은?","choices":["어쿠스틱 포크","일렉트로 하우스","재즈 스윙","국악 발라드"],"answer":1,"explanation":"3집 활동 인터뷰는 ‘Hot Girl’을 일렉트로 하우스 비트의 댄스곡으로 설명합니다.","source":"https://www.starnewskorea.com/music/2008/10/01/2008100115361214204","level":3,"skill":"참여진·무대 연결"},"song:brilliant-change-03":{"question":"3집의 시작 세 곡이 실제 순서대로 연결된 것은?","choices":["Hot Girl → 가니 → Turn It Up","Turn It Up → 가니 → Hot Girl","가니 → Hot Girl → Turn It Up","가니 → Turn It Up → Hot Girl"],"answer":2,"explanation":"3집은 가니, Hot Girl, Turn It Up 순서로 시작합니다.","source":"https://www.melon.com/album/detail.htm?albumId=398227","level":3,"skill":"참여진·무대 연결"},"song:brilliant-change-04":{"question":"‘가니’의 김용준과 달리 ‘집으로 돌아오는 길’에 참여한 SG워너비 멤버는?","choices":["김용준","이석훈","이홍기","김진호"],"answer":3,"explanation":"‘집으로 돌아오는 길’의 피처링 표기는 SG워너비 김진호입니다.","source":"https://www.melon.com/album/detail.htm?albumId=398227","level":3,"skill":"참여진·무대 연결"},"song:brilliant-change-05":{"question":"3집 수록 순서에서 두 곡이 바로 이어지는 연결은?","choices":["집으로 돌아오는 길 (feat. SG워너비 - 김진호) → 내가 울더라도","내가 울더라도 → 집으로 돌아오는 길 (feat. SG워너비 - 김진호)","집으로 돌아오는 길 (feat. SG워너비 - 김진호) → 덩그러니","사모곡 → 내가 울더라도"],"answer":0,"explanation":"3집 4번 ‘집으로 돌아오는 길 (feat. SG워너비 - 김진호)’ 다음은 5번 ‘내가 울더라도’입니다.","source":"https://www.melon.com/album/detail.htm?albumId=398227","level":3,"skill":"두 곡 연결"},"song:brilliant-change-06":{"question":"3집 수록 순서에서 두 곡이 바로 이어지는 연결은?","choices":["덩그러니 → 내가 울더라도","내가 울더라도 → 덩그러니","내가 울더라도 → 사모곡","I Wish → 덩그러니"],"answer":1,"explanation":"3집 5번 ‘내가 울더라도’ 다음은 6번 ‘덩그러니’입니다.","source":"https://www.melon.com/album/detail.htm?albumId=398227","level":3,"skill":"두 곡 연결"},"song:brilliant-change-07":{"question":"3집 수록 순서에서 두 곡이 바로 이어지는 연결은?","choices":["사모곡 → 덩그러니","덩그러니 → I Wish","덩그러니 → 사모곡","남자는 그래요 → 사모곡"],"answer":2,"explanation":"3집 6번 ‘덩그러니’ 다음은 7번 ‘사모곡’입니다.","source":"https://www.melon.com/album/detail.htm?albumId=398227","level":3,"skill":"두 곡 연결"},"song:brilliant-change-08":{"question":"3집 수록 순서에서 두 곡이 바로 이어지는 연결은?","choices":["I Wish → 사모곡","사모곡 → 남자는 그래요","그 사람 (구두 Ⅲ) → I Wish","사모곡 → I Wish"],"answer":3,"explanation":"3집 7번 ‘사모곡’ 다음은 8번 ‘I Wish’입니다.","source":"https://www.melon.com/album/detail.htm?albumId=398227","level":3,"skill":"두 곡 연결"},"song:brilliant-change-09":{"question":"3집 수록 순서에서 두 곡이 바로 이어지는 연결은?","choices":["I Wish → 남자는 그래요","남자는 그래요 → I Wish","I Wish → 그 사람 (구두 Ⅲ)","솜사탕 → 남자는 그래요"],"answer":0,"explanation":"3집 8번 ‘I Wish’ 다음은 9번 ‘남자는 그래요’입니다.","source":"https://www.melon.com/album/detail.htm?albumId=398227","level":3,"skill":"두 곡 연결"},"song:brilliant-change-10":{"question":"3집 수록 순서에서 두 곡이 바로 이어지는 연결은?","choices":["그 사람 (구두 Ⅲ) → 남자는 그래요","남자는 그래요 → 그 사람 (구두 Ⅲ)","남자는 그래요 → 솜사탕","나 없이도 → 그 사람 (구두 Ⅲ)"],"answer":1,"explanation":"3집 9번 ‘남자는 그래요’ 다음은 10번 ‘그 사람 (구두 Ⅲ)’입니다.","source":"https://www.melon.com/album/detail.htm?albumId=398227","level":3,"skill":"두 곡 연결"},"song:brilliant-change-11":{"question":"3집 수록 순서에서 두 곡이 바로 이어지는 연결은?","choices":["솜사탕 → 그 사람 (구두 Ⅲ)","그 사람 (구두 Ⅲ) → 나 없이도","그 사람 (구두 Ⅲ) → 솜사탕","Loving You → 솜사탕"],"answer":2,"explanation":"3집 10번 ‘그 사람 (구두 Ⅲ)’ 다음은 11번 ‘솜사탕’입니다.","source":"https://www.melon.com/album/detail.htm?albumId=398227","level":3,"skill":"두 곡 연결"},"song:brilliant-change-12":{"question":"3집 수록 순서에서 두 곡이 바로 이어지는 연결은?","choices":["나 없이도 → 솜사탕","솜사탕 → Loving You","가니 (feat. SG워너비 - 김용준, 황정음, Mario) → 나 없이도","솜사탕 → 나 없이도"],"answer":3,"explanation":"3집 11번 ‘솜사탕’ 다음은 12번 ‘나 없이도’입니다.","source":"https://www.melon.com/album/detail.htm?albumId=398227","level":3,"skill":"두 곡 연결"},"song:brilliant-change-13":{"question":"3집 수록 순서에서 두 곡이 바로 이어지는 연결은?","choices":["나 없이도 → Loving You","Loving You → 나 없이도","나 없이도 → 가니 (feat. SG워너비 - 김용준, 황정음, Mario)","Hot Girl → Loving You"],"answer":0,"explanation":"3집 12번 ‘나 없이도’ 다음은 13번 ‘Loving You’입니다.","source":"https://www.melon.com/album/detail.htm?albumId=398227","level":3,"skill":"두 곡 연결"},"song:rebloom-01":{"question":"Rebloom의 타이틀곡과 작곡가를 바르게 연결하면?","choices":["그 놈 목소리 · 김도훈","그 놈 목소리 · 이민수","Hot Girl · 이민수","Stay · 박근태"],"answer":1,"explanation":"앨범 소개는 타이틀곡 ‘그 놈 목소리’를 이민수 작곡가의 곡으로 소개합니다.","source":"https://www.melon.com/album/detail.htm?albumId=703853","level":3,"skill":"앨범 맥락"},"song:rebloom-02":{"question":"Rebloom의 의미와 당시 새 멤버가 맞게 연결된 것은?","choices":["다시 피어남 · 남규리","첫 만남 · 수미","다시 피어남 · 수미","캘리포니아의 꿈 · 남규리"],"answer":2,"explanation":"Rebloom은 꽃이 다시 핀다는 뜻이며, 수미 합류 이후의 앨범입니다.","source":"https://www.melon.com/album/detail.htm?albumId=703853","level":3,"skill":"앨범 맥락"},"song:rebloom-03":{"question":"Rebloom 소개에서 댄스곡 ‘앗차’와 대비해 발라드로 소개한 곡은?","choices":["그 놈 목소리","T-Gana","Hot Girl","눈물의 여왕"],"answer":3,"explanation":"앨범 소개에서 ‘앗차’는 댄스곡, ‘눈물의 여왕’은 발라드로 설명합니다.","source":"https://www.melon.com/album/detail.htm?albumId=703853","level":3,"skill":"앨범 맥락"},"song:rebloom-04":{"question":"현재 수집 목록의 Rebloom과 실제 활동을 설명한 것으로 맞는 것은?","choices":["당시 활동 멤버와 게임의 현재 세 멤버 의상 시안은 다르다","당시에도 게임 의상의 세 멤버가 그대로 활동했다","Rebloom은 2011년 베스트 앨범이다","그 놈 목소리는 3집 타이틀곡이다"],"answer":0,"explanation":"Rebloom은 수미 합류 시기의 앨범입니다. 게임의 도트 의상은 현재 세 멤버로 재해석한 시안입니다.","source":"https://www.melon.com/album/detail.htm?albumId=703853","level":3,"skill":"앨범 맥락"},"song:rebloom-05":{"question":"Rebloom의 디지털 수록 목록에서 마지막 두 곡의 순서는?","choices":["T-Gana → 바람핀다 믿었니","바람핀다 믿었니 → T-Gana","눈물의 여왕 → T-Gana","앗차! → 바람핀다 믿었니"],"answer":1,"explanation":"현재 음원 목록은 4번 바람핀다 믿었니, 5번 T-Gana로 끝납니다.","source":"https://www.melon.com/album/detail.htm?albumId=703853","level":3,"skill":"앨범 맥락"},"song:see-you-again-01":{"question":"See You Again에서 새롭게 발표한 두 곡의 조합은?","choices":["여인의 향기 · 구두","사랑의 인사 · 결혼할까요","내겐 너무 멋진 그대 · The Last","그 놈 목소리 · 눈물의 여왕"],"answer":2,"explanation":"앞의 두 곡은 이 앨범에서 발표한 곡이며, 뒤에는 이전 활동곡들이 이어집니다.","source":"https://music.bugs.co.kr/album/259909","level":4,"skill":"신곡·재수록 비교","additionalSources":["https://www.melon.com/album/detail.htm?albumId=314286","https://www.melon.com/album/detail.htm?albumId=352046","https://www.melon.com/album/detail.htm?albumId=362767","https://www.melon.com/album/detail.htm?albumId=398227","https://www.melon.com/album/detail.htm?albumId=703853","https://www.melon.com/album/detail.htm?albumId=13299661","https://www.melon.com/album/detail.htm?albumId=13391243&ref=copyurl&snsGate=Y"]},"song:see-you-again-02":{"question":"See You Again의 첫 두 곡 뒤에 이어지는 1집 수록곡 조합은?","choices":["사랑의 인사 · 결혼할까요","슬픈 발걸음 · 그래도 좋아","그 놈 목소리 · 눈물의 여왕","여인의 향기 · 구두"],"answer":3,"explanation":"3번 여인의 향기, 4번 구두는 The First Mind에 실렸던 곡입니다.","source":"https://music.bugs.co.kr/album/259909","level":4,"skill":"재수록 비교","additionalSources":["https://www.melon.com/album/detail.htm?albumId=314286","https://www.melon.com/album/detail.htm?albumId=352046","https://www.melon.com/album/detail.htm?albumId=362767","https://www.melon.com/album/detail.htm?albumId=398227","https://www.melon.com/album/detail.htm?albumId=703853","https://www.melon.com/album/detail.htm?albumId=13299661","https://www.melon.com/album/detail.htm?albumId=13391243&ref=copyurl&snsGate=Y"]},"song:see-you-again-03":{"question":"베스트 앨범의 ‘여인의 향기’와 이전 앨범이 바르게 연결된 것은?","choices":["The First Mind","Lovely Sweet Heart","California Dream","Brilliant Change"],"answer":0,"explanation":"‘여인의 향기’는 이전 앨범 The First Mind에서도 만날 수 있습니다.","source":"https://www.melon.com/album/detail.htm?albumId=314286","level":4,"skill":"앨범 간 비교","additionalSources":["https://www.melon.com/album/detail.htm?albumId=352046","https://www.melon.com/album/detail.htm?albumId=362767","https://www.melon.com/album/detail.htm?albumId=398227","https://www.melon.com/album/detail.htm?albumId=703853","https://music.bugs.co.kr/album/259909","https://www.melon.com/album/detail.htm?albumId=13299661","https://www.melon.com/album/detail.htm?albumId=13391243&ref=copyurl&snsGate=Y"]},"song:see-you-again-04":{"question":"베스트 앨범의 ‘구두’와 이전 앨범이 바르게 연결된 것은?","choices":["Lovely Sweet Heart","The First Mind","California Dream","Brilliant Change"],"answer":1,"explanation":"‘구두’는 이전 앨범 The First Mind에서도 만날 수 있습니다.","source":"https://www.melon.com/album/detail.htm?albumId=314286","level":4,"skill":"앨범 간 비교","additionalSources":["https://www.melon.com/album/detail.htm?albumId=352046","https://www.melon.com/album/detail.htm?albumId=362767","https://www.melon.com/album/detail.htm?albumId=398227","https://www.melon.com/album/detail.htm?albumId=703853","https://music.bugs.co.kr/album/259909","https://www.melon.com/album/detail.htm?albumId=13299661","https://www.melon.com/album/detail.htm?albumId=13391243&ref=copyurl&snsGate=Y"]},"song:see-you-again-05":{"question":"베스트 앨범의 ‘사랑의 인사’와 이전 앨범이 바르게 연결된 것은?","choices":["The First Mind","California Dream","Lovely Sweet Heart","Brilliant Change"],"answer":2,"explanation":"‘사랑의 인사’는 이전 앨범 Lovely Sweet Heart에서도 만날 수 있습니다.","source":"https://www.melon.com/album/detail.htm?albumId=352046","level":4,"skill":"앨범 간 비교","additionalSources":["https://www.melon.com/album/detail.htm?albumId=314286","https://www.melon.com/album/detail.htm?albumId=362767","https://www.melon.com/album/detail.htm?albumId=398227","https://www.melon.com/album/detail.htm?albumId=703853","https://music.bugs.co.kr/album/259909","https://www.melon.com/album/detail.htm?albumId=13299661","https://www.melon.com/album/detail.htm?albumId=13391243&ref=copyurl&snsGate=Y"]},"song:see-you-again-06":{"question":"베스트 앨범의 ‘결혼할까요’와 이전 앨범이 바르게 연결된 것은?","choices":["The First Mind","California Dream","Brilliant Change","Lovely Sweet Heart"],"answer":3,"explanation":"‘결혼할까요’는 이전 앨범 Lovely Sweet Heart에서도 만날 수 있습니다.","source":"https://www.melon.com/album/detail.htm?albumId=352046","level":4,"skill":"앨범 간 비교","additionalSources":["https://www.melon.com/album/detail.htm?albumId=314286","https://www.melon.com/album/detail.htm?albumId=362767","https://www.melon.com/album/detail.htm?albumId=398227","https://www.melon.com/album/detail.htm?albumId=703853","https://music.bugs.co.kr/album/259909","https://www.melon.com/album/detail.htm?albumId=13299661","https://www.melon.com/album/detail.htm?albumId=13391243&ref=copyurl&snsGate=Y"]},"song:see-you-again-07":{"question":"베스트 앨범의 ‘사랑이 간다’와 이전 앨범이 바르게 연결된 것은?","choices":["Lovely Sweet Heart","The First Mind","California Dream","Brilliant Change"],"answer":0,"explanation":"‘사랑이 간다’는 이전 앨범 Lovely Sweet Heart에서도 만날 수 있습니다.","source":"https://www.melon.com/album/detail.htm?albumId=352046","level":4,"skill":"앨범 간 비교","additionalSources":["https://www.melon.com/album/detail.htm?albumId=314286","https://www.melon.com/album/detail.htm?albumId=362767","https://www.melon.com/album/detail.htm?albumId=398227","https://www.melon.com/album/detail.htm?albumId=703853","https://music.bugs.co.kr/album/259909","https://www.melon.com/album/detail.htm?albumId=13299661","https://www.melon.com/album/detail.htm?albumId=13391243&ref=copyurl&snsGate=Y"]},"song:see-you-again-08":{"question":"베스트 앨범의 ‘슬픈 발걸음 (구두 Ⅱ)’와 이전 앨범이 바르게 연결된 것은?","choices":["The First Mind","California Dream","Lovely Sweet Heart","Brilliant Change"],"answer":1,"explanation":"‘슬픈 발걸음 (구두 Ⅱ)’는 이전 앨범 California Dream에서도 만날 수 있습니다.","source":"https://www.melon.com/album/detail.htm?albumId=362767","level":4,"skill":"앨범 간 비교","additionalSources":["https://www.melon.com/album/detail.htm?albumId=314286","https://www.melon.com/album/detail.htm?albumId=352046","https://www.melon.com/album/detail.htm?albumId=398227","https://www.melon.com/album/detail.htm?albumId=703853","https://music.bugs.co.kr/album/259909","https://www.melon.com/album/detail.htm?albumId=13299661","https://www.melon.com/album/detail.htm?albumId=13391243&ref=copyurl&snsGate=Y"]},"song:see-you-again-09":{"question":"베스트 앨범의 ‘그래도 좋아’와 이전 앨범이 바르게 연결된 것은?","choices":["The First Mind","Lovely Sweet Heart","California Dream","Brilliant Change"],"answer":2,"explanation":"‘그래도 좋아’는 이전 앨범 California Dream에서도 만날 수 있습니다.","source":"https://www.melon.com/album/detail.htm?albumId=362767","level":4,"skill":"앨범 간 비교","additionalSources":["https://www.melon.com/album/detail.htm?albumId=314286","https://www.melon.com/album/detail.htm?albumId=352046","https://www.melon.com/album/detail.htm?albumId=398227","https://www.melon.com/album/detail.htm?albumId=703853","https://music.bugs.co.kr/album/259909","https://www.melon.com/album/detail.htm?albumId=13299661","https://www.melon.com/album/detail.htm?albumId=13391243&ref=copyurl&snsGate=Y"]},"song:see-you-again-10":{"question":"베스트 앨범의 ‘미워요’와 이전 앨범이 바르게 연결된 것은?","choices":["The First Mind","Lovely Sweet Heart","Brilliant Change","California Dream"],"answer":3,"explanation":"‘미워요’는 이전 앨범 California Dream에서도 만날 수 있습니다.","source":"https://www.melon.com/album/detail.htm?albumId=362767","level":4,"skill":"앨범 간 비교","additionalSources":["https://www.melon.com/album/detail.htm?albumId=314286","https://www.melon.com/album/detail.htm?albumId=352046","https://www.melon.com/album/detail.htm?albumId=398227","https://www.melon.com/album/detail.htm?albumId=703853","https://music.bugs.co.kr/album/259909","https://www.melon.com/album/detail.htm?albumId=13299661","https://www.melon.com/album/detail.htm?albumId=13391243&ref=copyurl&snsGate=Y"]},"song:see-you-again-11":{"question":"베스트 앨범의 ‘미친 사랑의 노래’와 이전 앨범이 바르게 연결된 것은?","choices":["California Dream","The First Mind","Lovely Sweet Heart","Brilliant Change"],"answer":0,"explanation":"‘미친 사랑의 노래’는 이전 앨범 California Dream에서도 만날 수 있습니다.","source":"https://www.melon.com/album/detail.htm?albumId=362767","level":4,"skill":"앨범 간 비교","additionalSources":["https://www.melon.com/album/detail.htm?albumId=314286","https://www.melon.com/album/detail.htm?albumId=352046","https://www.melon.com/album/detail.htm?albumId=398227","https://www.melon.com/album/detail.htm?albumId=703853","https://music.bugs.co.kr/album/259909","https://www.melon.com/album/detail.htm?albumId=13299661","https://www.melon.com/album/detail.htm?albumId=13391243&ref=copyurl&snsGate=Y"]},"song:see-you-again-12":{"question":"베스트 앨범의 ‘가니 (feat. 김용준 Of SG워너비, 황정음, Mario)’와 이전 앨범이 바르게 연결된 것은?","choices":["The First Mind","Brilliant Change","Lovely Sweet Heart","California Dream"],"answer":1,"explanation":"‘가니 (feat. 김용준 Of SG워너비, 황정음, Mario)’는 이전 앨범 Brilliant Change에서도 만날 수 있습니다.","source":"https://www.melon.com/album/detail.htm?albumId=398227","level":4,"skill":"앨범 간 비교","additionalSources":["https://www.melon.com/album/detail.htm?albumId=314286","https://www.melon.com/album/detail.htm?albumId=352046","https://www.melon.com/album/detail.htm?albumId=362767","https://www.melon.com/album/detail.htm?albumId=703853","https://music.bugs.co.kr/album/259909","https://www.melon.com/album/detail.htm?albumId=13299661","https://www.melon.com/album/detail.htm?albumId=13391243&ref=copyurl&snsGate=Y"]},"song:see-you-again-13":{"question":"베스트 앨범의 ‘사모곡’와 이전 앨범이 바르게 연결된 것은?","choices":["The First Mind","Lovely Sweet Heart","Brilliant Change","California Dream"],"answer":2,"explanation":"‘사모곡’는 이전 앨범 Brilliant Change에서도 만날 수 있습니다.","source":"https://www.melon.com/album/detail.htm?albumId=398227","level":4,"skill":"앨범 간 비교","additionalSources":["https://www.melon.com/album/detail.htm?albumId=314286","https://www.melon.com/album/detail.htm?albumId=352046","https://www.melon.com/album/detail.htm?albumId=362767","https://www.melon.com/album/detail.htm?albumId=703853","https://music.bugs.co.kr/album/259909","https://www.melon.com/album/detail.htm?albumId=13299661","https://www.melon.com/album/detail.htm?albumId=13391243&ref=copyurl&snsGate=Y"]},"song:see-you-again-14":{"question":"베스트 앨범의 ‘그 놈 목소리’와 이전 앨범이 바르게 연결된 것은?","choices":["The First Mind","Lovely Sweet Heart","California Dream","Rebloom"],"answer":3,"explanation":"‘그 놈 목소리’는 이전 앨범 Rebloom에서도 만날 수 있습니다.","source":"https://www.melon.com/album/detail.htm?albumId=703853","level":4,"skill":"앨범 간 비교","additionalSources":["https://www.melon.com/album/detail.htm?albumId=314286","https://www.melon.com/album/detail.htm?albumId=352046","https://www.melon.com/album/detail.htm?albumId=362767","https://www.melon.com/album/detail.htm?albumId=398227","https://music.bugs.co.kr/album/259909","https://www.melon.com/album/detail.htm?albumId=13299661","https://www.melon.com/album/detail.htm?albumId=13391243&ref=copyurl&snsGate=Y"]},"song:see-you-again-15":{"question":"베스트 앨범의 ‘눈물의 여왕’와 이전 앨범이 바르게 연결된 것은?","choices":["Rebloom","The First Mind","Lovely Sweet Heart","California Dream"],"answer":0,"explanation":"‘눈물의 여왕’는 이전 앨범 Rebloom에서도 만날 수 있습니다.","source":"https://www.melon.com/album/detail.htm?albumId=703853","level":4,"skill":"앨범 간 비교","additionalSources":["https://www.melon.com/album/detail.htm?albumId=314286","https://www.melon.com/album/detail.htm?albumId=352046","https://www.melon.com/album/detail.htm?albumId=362767","https://www.melon.com/album/detail.htm?albumId=398227","https://music.bugs.co.kr/album/259909","https://www.melon.com/album/detail.htm?albumId=13299661","https://www.melon.com/album/detail.htm?albumId=13391243&ref=copyurl&snsGate=Y"]},"song:still-here-01":{"question":"2026년 선공개 싱글과 정규 앨범을 발매 순서대로 연결하면?","choices":["First, Again → 그럼에도, 우린","그럼에도, 우린 → First, Again","See You Again → Rebloom","First, Again → See You Again"],"answer":1,"explanation":"2026년 선공개 ‘그럼에도, 우린’ 다음에 정규 4집 First, Again이 나왔습니다.","source":"https://www.melon.com/album/detail.htm?albumId=13391243&ref=copyurl&snsGate=Y","level":4,"skill":"발매 흐름","additionalSources":["https://www.melon.com/album/detail.htm?albumId=314286","https://www.melon.com/album/detail.htm?albumId=352046","https://www.melon.com/album/detail.htm?albumId=362767","https://www.melon.com/album/detail.htm?albumId=398227","https://www.melon.com/album/detail.htm?albumId=703853","https://music.bugs.co.kr/album/259909","https://www.melon.com/album/detail.htm?albumId=13299661"]},"song:still-here-02":{"question":"‘그럼에도, 우린’ 싱글과 4집에 모두 있는 버전 구성을 고르면?","choices":["반주곡만 있다","Live Ver.만 있다","보컬곡과 반주곡이 모두 있다","보컬곡만 있고 반주곡은 없다"],"answer":2,"explanation":"싱글에는 보컬곡과 Inst.가, 4집에도 보컬곡과 Inst. (To My Fan)가 수록되어 있습니다.","source":"https://www.melon.com/album/detail.htm?albumId=13391243&ref=copyurl&snsGate=Y","level":4,"skill":"버전 비교","additionalSources":["https://www.melon.com/album/detail.htm?albumId=314286","https://www.melon.com/album/detail.htm?albumId=352046","https://www.melon.com/album/detail.htm?albumId=362767","https://www.melon.com/album/detail.htm?albumId=398227","https://www.melon.com/album/detail.htm?albumId=703853","https://music.bugs.co.kr/album/259909","https://www.melon.com/album/detail.htm?albumId=13299661"]},"song:first-again-01":{"question":"3집과 4집의 타이틀곡·스타일을 바르게 짝지으면?","choices":["Hot Girl — 칠하우스 / Stay — 일렉트로 하우스","그 놈 목소리 — 록 / Stay — 재즈","사랑의 인사 — 하우스 / I Believe — 4집 타이틀","Hot Girl — 일렉트로 하우스 / Stay — 칠하우스"],"answer":3,"explanation":"3집 Hot Girl은 일렉트로 하우스, 4집 타이틀 Stay는 칠하우스로 소개됩니다.","source":"https://www.melon.com/album/detail.htm?albumId=13391243&ref=copyurl&snsGate=Y","level":5,"skill":"종합 연결","additionalSources":["https://www.melon.com/album/detail.htm?albumId=314286","https://www.melon.com/album/detail.htm?albumId=352046","https://www.melon.com/album/detail.htm?albumId=362767","https://www.melon.com/album/detail.htm?albumId=398227","https://www.melon.com/album/detail.htm?albumId=703853","https://music.bugs.co.kr/album/259909","https://www.melon.com/album/detail.htm?albumId=13299661","https://www.starnewskorea.com/music/2008/10/01/2008100115361214204"]},"song:first-again-02":{"question":"발매 흐름이 맞는 것은?","choices":["See You Again → 그럼에도, 우린 → First, Again","그럼에도, 우린 → See You Again → First, Again","First, Again → See You Again → 그럼에도, 우린","See You Again → First, Again → 그럼에도, 우린"],"answer":0,"explanation":"2011년 베스트 앨범, 2026년 선공개 싱글, 정규 4집 순서입니다.","source":"https://www.melon.com/album/detail.htm?albumId=13391243&ref=copyurl&snsGate=Y","level":5,"skill":"종합 연결","additionalSources":["https://www.melon.com/album/detail.htm?albumId=314286","https://www.melon.com/album/detail.htm?albumId=352046","https://www.melon.com/album/detail.htm?albumId=362767","https://www.melon.com/album/detail.htm?albumId=398227","https://www.melon.com/album/detail.htm?albumId=703853","https://music.bugs.co.kr/album/259909","https://www.melon.com/album/detail.htm?albumId=13299661"]},"song:first-again-03":{"question":"4집 2~4번 트랙의 순서를 고르면?","choices":["봄처럼 그댄 → 계절은 돌고 돌아 → I Believe","계절은 돌고 돌아 → 봄처럼 그댄 → I Believe","I Believe → 봄처럼 그댄 → 계절은 돌고 돌아","계절은 돌고 돌아 → I Believe → 봄처럼 그댄"],"answer":1,"explanation":"4집 2번부터 계절은 돌고 돌아, 봄처럼 그댄, I Believe가 이어집니다.","source":"https://www.melon.com/album/detail.htm?albumId=13391243&ref=copyurl&snsGate=Y","level":5,"skill":"종합 연결","additionalSources":["https://www.melon.com/album/detail.htm?albumId=314286","https://www.melon.com/album/detail.htm?albumId=352046","https://www.melon.com/album/detail.htm?albumId=362767","https://www.melon.com/album/detail.htm?albumId=398227","https://www.melon.com/album/detail.htm?albumId=703853","https://music.bugs.co.kr/album/259909","https://www.melon.com/album/detail.htm?albumId=13299661"]},"song:first-again-04":{"question":"4집 소개에서 세 멤버의 제작 참여를 어떻게 설명하나요?","choices":["세 멤버 모두 연주에만 참여했다","수록곡 전부를 세 멤버만 단독 작곡했다","멤버들이 직접 작사·작곡에 참여했다","모든 곡이 기존 곡의 재수록이다"],"answer":2,"explanation":"앨범 소개는 남규리·김연지·이보람의 작사·작곡 참여를 설명합니다. 모든 곡의 단독 창작이라는 뜻은 아닙니다.","source":"https://www.melon.com/album/detail.htm?albumId=13391243&ref=copyurl&snsGate=Y","level":5,"skill":"종합 연결","additionalSources":["https://www.melon.com/album/detail.htm?albumId=314286","https://www.melon.com/album/detail.htm?albumId=352046","https://www.melon.com/album/detail.htm?albumId=362767","https://www.melon.com/album/detail.htm?albumId=398227","https://www.melon.com/album/detail.htm?albumId=703853","https://music.bugs.co.kr/album/259909","https://www.melon.com/album/detail.htm?albumId=13299661"]},"song:first-again-05":{"question":"선공개곡이 4집에서 놓인 위치와 버전이 맞는 것은?","choices":["1번 보컬곡 / 10번 Inst.","4번 Live Ver. / 11번 보컬곡","5번 Inst. / 11번 보컬곡","5번 보컬곡 / 11번 Inst. (To My Fan)"],"answer":3,"explanation":"그럼에도, 우린은 5번 보컬곡과 11번 반주 버전으로 수록됩니다.","source":"https://www.melon.com/album/detail.htm?albumId=13391243&ref=copyurl&snsGate=Y","level":5,"skill":"종합 연결","additionalSources":["https://www.melon.com/album/detail.htm?albumId=314286","https://www.melon.com/album/detail.htm?albumId=352046","https://www.melon.com/album/detail.htm?albumId=362767","https://www.melon.com/album/detail.htm?albumId=398227","https://www.melon.com/album/detail.htm?albumId=703853","https://music.bugs.co.kr/album/259909","https://www.melon.com/album/detail.htm?albumId=13299661"]},"song:first-again-06":{"question":"4집 중반 세 곡이 실제 수록 순서대로 놓인 것은?","choices":["그럼에도, 우린 → 안돼요 → 잔향","안돼요 → 그럼에도, 우린 → 잔향","잔향 → 안돼요 → 그럼에도, 우린","그럼에도, 우린 → 잔향 → 안돼요"],"answer":0,"explanation":"5~7번 트랙은 그럼에도, 우린, 안돼요, 잔향 순서입니다.","source":"https://www.melon.com/album/detail.htm?albumId=13391243&ref=copyurl&snsGate=Y","level":5,"skill":"종합 연결","additionalSources":["https://www.melon.com/album/detail.htm?albumId=314286","https://www.melon.com/album/detail.htm?albumId=352046","https://www.melon.com/album/detail.htm?albumId=362767","https://www.melon.com/album/detail.htm?albumId=398227","https://www.melon.com/album/detail.htm?albumId=703853","https://music.bugs.co.kr/album/259909","https://www.melon.com/album/detail.htm?albumId=13299661"]},"song:first-again-07":{"question":"4집에서 보컬곡 구간의 끝과 반주곡 구간의 시작을 연결하면?","choices":["끝내 꺾이지 않는 것 → Stay Inst.","우리 Live Ver. → Stay Inst.","잔향 → 우리 Live Ver.","Stay Inst. → 우리 Live Ver."],"answer":1,"explanation":"9번 우리 Live Ver.까지 보컬곡이며 10번 Stay Inst.부터 반주곡입니다.","source":"https://www.melon.com/album/detail.htm?albumId=13391243&ref=copyurl&snsGate=Y","level":5,"skill":"종합 연결","additionalSources":["https://www.melon.com/album/detail.htm?albumId=314286","https://www.melon.com/album/detail.htm?albumId=352046","https://www.melon.com/album/detail.htm?albumId=362767","https://www.melon.com/album/detail.htm?albumId=398227","https://www.melon.com/album/detail.htm?albumId=703853","https://music.bugs.co.kr/album/259909","https://www.melon.com/album/detail.htm?albumId=13299661"]},"song:first-again-08":{"question":"20주년 4집의 디지털 수록 구성을 정확히 나누면?","choices":["보컬곡 8개 + 반주곡 3개","보컬곡 10개 + 반주곡 1개","보컬곡 9개 + 반주곡 2개","보컬곡 11개 + 반주곡 0개"],"answer":2,"explanation":"총 11트랙 중 마지막 2개는 Inst.이고, 우리 Live Ver.는 보컬곡입니다.","source":"https://www.melon.com/album/detail.htm?albumId=13391243&ref=copyurl&snsGate=Y","level":5,"skill":"종합 연결","additionalSources":["https://www.melon.com/album/detail.htm?albumId=314286","https://www.melon.com/album/detail.htm?albumId=352046","https://www.melon.com/album/detail.htm?albumId=362767","https://www.melon.com/album/detail.htm?albumId=398227","https://www.melon.com/album/detail.htm?albumId=703853","https://music.bugs.co.kr/album/259909","https://www.melon.com/album/detail.htm?albumId=13299661"]},"song:first-again-09":{"question":"이름에 버전 표기가 있는 곡 중 반주곡으로 분류하면 안 되는 것은?","choices":["Stay Inst.","그럼에도, 우린 Inst. (To My Fan)","그럼에도, 우린 (Inst.)","우리 Live Ver."],"answer":3,"explanation":"Live Ver.는 라이브 버전이며 Inst.와 다릅니다. 우리 Live Ver.는 보컬곡입니다.","source":"https://www.melon.com/album/detail.htm?albumId=13391243&ref=copyurl&snsGate=Y","level":5,"skill":"종합 연결","additionalSources":["https://www.melon.com/album/detail.htm?albumId=314286","https://www.melon.com/album/detail.htm?albumId=352046","https://www.melon.com/album/detail.htm?albumId=362767","https://www.melon.com/album/detail.htm?albumId=398227","https://www.melon.com/album/detail.htm?albumId=703853","https://music.bugs.co.kr/album/259909","https://www.melon.com/album/detail.htm?albumId=13299661"]},"song:first-again-10":{"question":"4집에서 보컬곡과 반주곡이 모두 수록된 두 곡은?","choices":["Stay · 그럼에도, 우린","I Believe · Stay","우리 · 안돼요","잔향 · 봄처럼 그댄"],"answer":0,"explanation":"반주 트랙은 Stay Inst.와 그럼에도, 우린 Inst. (To My Fan)입니다.","source":"https://www.melon.com/album/detail.htm?albumId=13391243&ref=copyurl&snsGate=Y","level":5,"skill":"종합 연결","additionalSources":["https://www.melon.com/album/detail.htm?albumId=314286","https://www.melon.com/album/detail.htm?albumId=352046","https://www.melon.com/album/detail.htm?albumId=362767","https://www.melon.com/album/detail.htm?albumId=398227","https://www.melon.com/album/detail.htm?albumId=703853","https://music.bugs.co.kr/album/259909","https://www.melon.com/album/detail.htm?albumId=13299661"]},"song:first-again-11":{"question":"첫 앨범부터 20주년 앨범까지의 연결이 모두 맞는 것은?","choices":["The First Mind — 구두 II / First, Again — Hot Girl","The First Mind — 여인의 향기 / First, Again — Stay","Lovely Sweet Heart — 그 놈 목소리 / First, Again — Stay","Brilliant Change — Stay / First, Again — 사랑의 인사"],"answer":1,"explanation":"첫 앨범의 타이틀은 여인의 향기, 20주년 정규 4집의 타이틀은 Stay입니다.","source":"https://www.melon.com/album/detail.htm?albumId=13391243&ref=copyurl&snsGate=Y","level":5,"skill":"종합 연결","additionalSources":["https://www.melon.com/album/detail.htm?albumId=314286","https://www.melon.com/album/detail.htm?albumId=352046","https://www.melon.com/album/detail.htm?albumId=362767","https://www.melon.com/album/detail.htm?albumId=398227","https://www.melon.com/album/detail.htm?albumId=703853","https://music.bugs.co.kr/album/259909","https://www.melon.com/album/detail.htm?albumId=13299661"]}};
},
"src/data/our-stage-rhythm-songs.json":function(module,exports,__require){
module.exports=[{"id":"track-001","title":"여인의 향기","youtubeId":"YKW0KSHTF1k","channel":"SeeYa - Topic","source":"https://www.youtube.com/playlist?list=OLAK5uy_lyJ-tB1LJGJfsBVbV0lzZFaPM7AlEbBKk","checkedAt":"2026-11-15","channelNote":"YouTube 제공 음원 · 씨야 공식 채널의 발표곡 목록과 대조","chart":{"revision":"onsets-20261116-v1","startMs":34430,"notes":[37430,37969,38511,39050,39590,40129,40670,41210,41739,42289,42830,43370,43911,44449,44979,45529,46070,46609,47150,47689,48230,48769,49310,49849,50391,50929,51470,52009,52551,53088,53630,54169],"checkedAt":"2026-11-16","method":"Official YouTube playback; authored 32-note chart from measured spectral-flux attack times. No audio files stored or served."}},{"id":"track-013","title":"사랑의 인사","youtubeId":"wRdNZKsh_a0","channel":"SeeYa - Topic","source":"https://www.youtube.com/playlist?list=OLAK5uy_mt80dMhgflNhbmoK-sEZpvpfKodHY4UME","checkedAt":"2026-11-15","channelNote":"YouTube 제공 음원 · 씨야 공식 채널의 발표곡 목록과 대조","chart":{"revision":"onsets-20261116-v1","startMs":53779,"notes":[56779,57367,57958,58558,59158,59758,60339,60928,61528,62120,62720,63309,63909,64496,65096,65680,66280,66880,67469,68059,68659,69247,69718,70447,71038,71638,72189,72808,73408,75789,76377,76977],"checkedAt":"2026-11-16","method":"Official YouTube playback; authored 32-note chart from measured spectral-flux attack times. No audio files stored or served."}},{"id":"track-038","title":"Hot Girl","youtubeId":"VYvKqDIxERQ","channel":"SeeYa - Topic","source":"https://www.youtube.com/playlist?list=OLAK5uy_l5jBVGbk_7ivpN_n_kPLlkRK1Gj-qryVk","checkedAt":"2026-11-15","channelNote":"YouTube 제공 음원 · 씨야 공식 채널의 발표곡 목록과 대조","chart":{"revision":"onsets-20261116-v1","startMs":27907,"notes":[30907,31338,31768,32200,32646,33080,33509,33939,34387,35046,35480,36125,36548,36989,37419,37867,38286,38728,39160,39606,40027,40469,40899,41348,41766,42427,43086,43628,43949,44379,44827,45246],"checkedAt":"2026-11-16","method":"Official YouTube playback; authored 32-note chart from measured spectral-flux attack times. No audio files stored or served."}}];
},
"src/shared/our-stage-play-days.js":function(module,exports,__require){
'use strict';
// Separate from the optional daily coin claim. Older saves retain verified attendance.
const state=s=>s.playDays===undefined?s.daily:s.playDays;
const count=s=>state(s)?.count||0;
function valid(s){
 if(s.playDays===undefined)return true;
 const p=s.playDays;if(!p||Array.isArray(p)||!Number.isInteger(p.count)||p.count<0||p.count>1000000)return false;
 if(p.count===0)return p.lastDay===null;
 return typeof p.lastDay==='string'&&/^\d{4}-\d{2}-\d{2}$/.test(p.lastDay)&&Number.isFinite(Date.parse(p.lastDay+'T00:00:00Z'))&&new Date(p.lastDay+'T00:00:00Z').toISOString().slice(0,10)===p.lastDay;
}
function record(s,day){
 if(!day||!valid(s))return false;
 const p=state(s);if(!p||p.count>=1000000||p.lastDay&&day<=p.lastDay)return false;
 s.playDays={count:p.count+1,lastDay:day};return true;
}
module.exports={count,valid,record};

},
"src/data/our-stage-albums.json":function(module,exports,__require){
module.exports=[{"id":"first-mind","name":"The First Mind","type":"1ST ALBUM · 2006.02.24","source":"https://www.melon.com/album/detail.htm?albumId=314286","checkedAt":"2026-11-15","tracks":[{"id":"scent","title":"여인의 향기","instrumental":false,"reissue":false},{"id":"shoes","title":"구두","instrumental":false,"reissue":false},{"id":"because","title":"사랑하기 때문에 (feat. SG 워너비)","instrumental":false,"reissue":false},{"id":"flower","title":"접시꽃","instrumental":false,"reissue":false},{"id":"promise","title":"Promise U","instrumental":false,"reissue":false},{"id":"again","title":"처음부터 또다시","instrumental":false,"reissue":false},{"id":"guilty","title":"유죄","instrumental":false,"reissue":false},{"id":"parting","title":"이별해보기","instrumental":false,"reissue":false},{"id":"tears","title":"Tearsandfears","instrumental":false,"reissue":false},{"id":"loved","title":"사랑했다면","instrumental":false,"reissue":false},{"id":"just","title":"그냥","instrumental":false,"reissue":false},{"id":"fault","title":"내 잘못입니다","instrumental":false,"reissue":false}]},{"id":"lovely-sweet-heart","name":"Lovely Sweet Heart","type":"2ND ALBUM · 2007.05.25","source":"https://www.melon.com/album/detail.htm?albumId=352046","checkedAt":"2026-11-15","tracks":[{"id":"lovely-sweet-heart-01","title":"사랑의 인사","instrumental":false,"reissue":false},{"id":"lovely-sweet-heart-02","title":"결혼할까요","instrumental":false,"reissue":false},{"id":"lovely-sweet-heart-03","title":"너는 내 남자","instrumental":false,"reissue":false},{"id":"lovely-sweet-heart-04","title":"Dirty Dancing","instrumental":false,"reissue":false},{"id":"lovely-sweet-heart-05","title":"어떻게 널 잊겠니","instrumental":false,"reissue":false},{"id":"lovely-sweet-heart-06","title":"사랑아","instrumental":false,"reissue":false},{"id":"lovely-sweet-heart-07","title":"그 사람이 나를 사랑해요","instrumental":false,"reissue":false},{"id":"lovely-sweet-heart-08","title":"Summer Dream","instrumental":false,"reissue":false},{"id":"lovely-sweet-heart-09","title":"사랑이 간다","instrumental":false,"reissue":false},{"id":"lovely-sweet-heart-10","title":"감동을 주세요","instrumental":false,"reissue":false},{"id":"lovely-sweet-heart-11","title":"얼음인형","instrumental":false,"reissue":false},{"id":"lovely-sweet-heart-12","title":"순애보","instrumental":false,"reissue":false},{"id":"lovely-sweet-heart-13","title":"남","instrumental":false,"reissue":false}]},{"id":"california-dream","name":"California Dream","type":"2.5 ALBUM · 2008.01.02","source":"https://www.melon.com/album/detail.htm?albumId=362767","checkedAt":"2026-11-15","tracks":[{"id":"california-dream-01","title":"슬픈 발걸음","instrumental":false,"reissue":false},{"id":"california-dream-02","title":"그래도 좋아","instrumental":false,"reissue":false},{"id":"california-dream-03","title":"Classic","instrumental":false,"reissue":false},{"id":"california-dream-04","title":"연가","instrumental":false,"reissue":false},{"id":"california-dream-05","title":"미워요","instrumental":false,"reissue":false},{"id":"california-dream-06","title":"요즘 나는","instrumental":false,"reissue":false},{"id":"california-dream-07","title":"깊은 밤을 날아서","instrumental":false,"reissue":false},{"id":"california-dream-08","title":"처음 그 자리에","instrumental":false,"reissue":false},{"id":"california-dream-09","title":"미친 사랑의 노래","instrumental":false,"reissue":false},{"id":"california-dream-10","title":"The Day","instrumental":false,"reissue":false},{"id":"california-dream-11","title":"정","instrumental":false,"reissue":false}]},{"id":"brilliant-change","name":"Brilliant Change","type":"3RD ALBUM · 2008.09.26","source":"https://www.melon.com/album/detail.htm?albumId=398227","checkedAt":"2026-11-15","tracks":[{"id":"brilliant-change-01","title":"가니 (feat. SG워너비 - 김용준, 황정음, Mario)","instrumental":false,"reissue":false},{"id":"brilliant-change-02","title":"Hot Girl","instrumental":false,"reissue":false},{"id":"brilliant-change-03","title":"Turn It Up","instrumental":false,"reissue":false},{"id":"brilliant-change-04","title":"집으로 돌아오는 길 (feat. SG워너비 - 김진호)","instrumental":false,"reissue":false},{"id":"brilliant-change-05","title":"내가 울더라도","instrumental":false,"reissue":false},{"id":"brilliant-change-06","title":"덩그러니","instrumental":false,"reissue":false},{"id":"brilliant-change-07","title":"사모곡","instrumental":false,"reissue":false},{"id":"brilliant-change-08","title":"I Wish","instrumental":false,"reissue":false},{"id":"brilliant-change-09","title":"남자는 그래요","instrumental":false,"reissue":false},{"id":"brilliant-change-10","title":"그 사람 (구두 Ⅲ)","instrumental":false,"reissue":false},{"id":"brilliant-change-11","title":"솜사탕","instrumental":false,"reissue":false},{"id":"brilliant-change-12","title":"나 없이도","instrumental":false,"reissue":false},{"id":"brilliant-change-13","title":"Loving You","instrumental":false,"reissue":false}]},{"id":"rebloom","name":"Rebloom","type":"MINI ALBUM · 2009.10.26","source":"https://www.melon.com/album/detail.htm?albumId=703853","checkedAt":"2026-11-15","tracks":[{"id":"rebloom-01","title":"그 놈 목소리","instrumental":false,"reissue":false},{"id":"rebloom-02","title":"앗차!","instrumental":false,"reissue":false},{"id":"rebloom-03","title":"눈물의 여왕","instrumental":false,"reissue":false},{"id":"rebloom-04","title":"바람핀다 믿었니","instrumental":false,"reissue":false},{"id":"rebloom-05","title":"T-Gana (티가나)","instrumental":false,"reissue":false}]},{"id":"see-you-again","name":"See You Again","type":"BEST ALBUM · 2011.01.21","source":"https://music.bugs.co.kr/album/259909","checkedAt":"2026-11-15","tracks":[{"id":"see-you-again-01","title":"내겐 너무 멋진 그대","instrumental":false,"reissue":false},{"id":"see-you-again-02","title":"The Last","instrumental":false,"reissue":false},{"id":"see-you-again-03","title":"여인의 향기","instrumental":false,"reissue":true},{"id":"see-you-again-04","title":"구두","instrumental":false,"reissue":true},{"id":"see-you-again-05","title":"사랑의 인사","instrumental":false,"reissue":true},{"id":"see-you-again-06","title":"결혼할까요","instrumental":false,"reissue":true},{"id":"see-you-again-07","title":"사랑이 간다","instrumental":false,"reissue":true},{"id":"see-you-again-08","title":"슬픈 발걸음 (구두 Ⅱ)","instrumental":false,"reissue":true},{"id":"see-you-again-09","title":"그래도 좋아","instrumental":false,"reissue":true},{"id":"see-you-again-10","title":"미워요","instrumental":false,"reissue":true},{"id":"see-you-again-11","title":"미친 사랑의 노래","instrumental":false,"reissue":true},{"id":"see-you-again-12","title":"가니 (feat. 김용준 Of SG워너비, 황정음, Mario)","instrumental":false,"reissue":true},{"id":"see-you-again-13","title":"사모곡","instrumental":false,"reissue":true},{"id":"see-you-again-14","title":"그 놈 목소리","instrumental":false,"reissue":true},{"id":"see-you-again-15","title":"눈물의 여왕","instrumental":false,"reissue":true}]},{"id":"still-here","name":"그럼에도, 우린","type":"PRE-RELEASE SINGLE · 2026.03.30","source":"https://www.melon.com/album/detail.htm?albumId=13299661","checkedAt":"2026-11-15","tracks":[{"id":"still-here-01","title":"그럼에도, 우린","instrumental":false,"reissue":false},{"id":"still-here-02","title":"그럼에도, 우린 (Inst.)","instrumental":true,"reissue":false}]},{"id":"first-again","name":"First, Again","type":"4TH ALBUM · 2026.05.14","source":"https://www.melon.com/album/detail.htm?albumId=13391243&ref=copyurl&snsGate=Y","checkedAt":"2026-11-15","tracks":[{"id":"first-again-01","title":"Stay","instrumental":false,"reissue":false},{"id":"first-again-02","title":"계절은 돌고 돌아","instrumental":false,"reissue":false},{"id":"first-again-03","title":"봄처럼 그댄","instrumental":false,"reissue":false},{"id":"first-again-04","title":"I Believe","instrumental":false,"reissue":false},{"id":"first-again-05","title":"그럼에도, 우린","instrumental":false,"reissue":false},{"id":"first-again-06","title":"안돼요","instrumental":false,"reissue":false},{"id":"first-again-07","title":"잔향","instrumental":false,"reissue":false},{"id":"first-again-08","title":"끝내 꺾이지 않는 것","instrumental":false,"reissue":false},{"id":"first-again-09","title":"우리 Live Ver.","instrumental":false,"reissue":false},{"id":"first-again-10","title":"Stay Inst.","instrumental":true,"reissue":false},{"id":"first-again-11","title":"그럼에도, 우린 Inst. (To My Fan)","instrumental":true,"reissue":false}]}];
},
"src/data/our-stage-stories.json":function(module,exports,__require){
module.exports=[{"id":"chapter-lovely","album":"lovely-sweet-heart","kind":"album","title":"사랑의 인사를 건네던 계절","date":"2007","body":["2집 Lovely Sweet Heart는 ‘사랑의 인사’를 시작으로 ‘결혼할까요’, ‘얼음인형’ 등을 담았습니다. 1집 이후 씨야의 노래가 한 걸음 더 넓어진 시기예요.","열세 곡을 따라가며 한 앨범 안에서도 달라지는 목소리와 분위기를 떠올려보세요."],"source":"https://www.melon.com/album/detail.htm?albumId=352046","checkedAt":"2026-11-15","minTracks":0,"icon":2,"quiz":{"question":"Lovely Sweet Heart의 첫 곡과 그다음 곡은?","correct":"사랑의 인사 → 결혼할까요","wrong":["결혼할까요 → 사랑의 인사","여인의 향기 → 구두"],"explanation":"2집 Lovely Sweet Heart는 ‘사랑의 인사’를 시작으로 ‘결혼할까요’, ‘얼음인형’ 등을 담았습니다. 1집 이후 씨야의 노래가 한 걸음 더 넓어진 시기예요.","level":2,"skill":"이야기 기억"},"image":"/images/game/our-stage/stories/chapter-lovely-period.png","illustrationNote":"앨범 재킷의 의상·헤어를 참고한 도트 재구성입니다.","wardrobeSource":"https://www.melon.com/album/detail.htm?albumId=352046","wardrobeStatus":"album-reference","subject":"씨야","summary":"씨야가 ‘사랑의 인사’와 함께 새로운 계절을 열었던 2집 활동 이야기입니다."},{"id":"chapter-california","album":"california-dream","kind":"album","title":"각자의 노래가 모인 여행","date":"2008","body":["California Dream은 ‘슬픈 발걸음’과 ‘그래도 좋아’, 멤버들이 참여했던 OST와 협업곡을 함께 담았습니다.","남규리의 영화·시트콤 OST, 이보람의 ‘풀하우스’ OST, 김연지와 제아의 노래가 씨야의 앨범 안에서 만납니다. 재킷은 LA와 라스베가스 등지에서 촬영했어요."],"source":"https://www.melon.com/album/detail.htm?albumId=362767","checkedAt":"2026-11-15","minTracks":0,"icon":2,"quiz":{"question":"California Dream의 특징으로 맞는 것은?","correct":"멤버들의 OST·협업곡도 함께 담았다","wrong":["모든 곡이 반주곡이다","전곡이 4집의 라이브 버전이다"],"explanation":"California Dream은 ‘슬픈 발걸음’과 ‘그래도 좋아’, 멤버들이 참여했던 OST와 협업곡을 함께 담았습니다.","level":2,"skill":"이야기 기억"},"image":"/images/game/our-stage/stories/chapter-california-period.png","illustrationNote":"앨범 재킷의 의상·헤어를 참고한 도트 재구성입니다.","wardrobeSource":"https://www.melon.com/album/detail.htm?albumId=362767","wardrobeStatus":"album-reference","subject":"씨야","summary":"씨야의 California Dream 수록곡과 겨울의 활동을 돌아봅니다."},{"id":"chapter-brilliant","album":"brilliant-change","kind":"album","title":"새로운 비트 위의 세 목소리","date":"2008","body":["3집 Brilliant Change의 ‘Hot Girl’에서 씨야는 일렉트로 하우스 비트의 댄스곡에 도전했습니다.","당시 인터뷰에서는 다른 장르와 춤을 보여주고 싶었다고 설명했어요. 익숙한 가창력에 새로운 무대 표현을 더한 활동이었습니다."],"source":"https://www.starnewskorea.com/music/2008/10/01/2008100115361214204","checkedAt":"2026-11-15","minTracks":0,"icon":2,"quiz":{"question":"3집 Hot Girl 활동의 변화와 맞는 설명은?","correct":"일렉트로 하우스와 춤에 도전했다","wrong":["전곡을 무반주로 발표했다","기존 앨범의 반주만 모았다","영화 OST만 발표했다"],"explanation":"3집 Brilliant Change의 ‘Hot Girl’에서 씨야는 일렉트로 하우스 비트의 댄스곡에 도전했습니다.","level":3,"skill":"이야기 기억"},"image":"/images/game/our-stage/stories/chapter-brilliant-period.png","illustrationNote":"앨범 재킷의 의상·헤어를 참고한 도트 재구성입니다.","wardrobeSource":"https://www.melon.com/album/detail.htm?albumId=398227","wardrobeStatus":"album-reference","subject":"씨야","summary":"씨야가 ‘Hot Girl’로 춤과 새로운 음악 스타일에 도전한 3집 이야기입니다."},{"id":"chapter-rebloom","album":"rebloom","kind":"album","title":"다시 피어난다는 이름","date":"2009","body":["Rebloom은 수미가 합류한 뒤 발표한 앨범입니다. 앨범명에는 꽃이 다시 피어난다는 뜻이 담겼고, 타이틀은 이민수가 작곡한 ‘그 놈 목소리’예요.","이 시기 활동 멤버는 김연지·이보람·수미였습니다. 게임에서 입어보는 현재 세 멤버의 의상은 재해석 시안이며, 실제 당시 모습과 구분됩니다."],"source":"https://www.melon.com/album/detail.htm?albumId=703853","checkedAt":"2026-11-15","minTracks":0,"icon":2,"quiz":{"question":"Rebloom의 역사와 게임 의상에 대한 설명은?","correct":"수미 합류 시기이며 게임 의상은 현재 세 멤버의 재해석이다","wrong":["남규리가 새 멤버로 합류한 앨범이다","4집을 달리 부르는 이름이다","첫 정규 앨범이다"],"explanation":"Rebloom은 수미가 합류한 뒤 발표한 앨범입니다. 앨범명에는 꽃이 다시 피어난다는 뜻이 담겼고, 타이틀은 이민수가 작곡한 ‘그 놈 목소리’예요.","level":3,"skill":"이야기 기억"},"image":"/images/game/our-stage/stories/chapter-rebloom.png","subject":"씨야 · 이보람·김연지·수미","summary":"이보람·김연지·수미가 함께한 Rebloom의 발매 기록입니다."},{"id":"chapter-again","album":"see-you-again","kind":"album","title":"노래로 묶어 건넨 인사","date":"2011","body":["See You Again에는 ‘내겐 너무 멋진 그대’, ‘The Last’와 이전 활동곡들이 함께 담겼습니다.","1집의 ‘여인의 향기’, 2집의 ‘사랑의 인사’, 3집의 ‘가니’, Rebloom의 ‘그 놈 목소리’까지 이어지는 목록은 그동안의 노래를 돌아보게 합니다."],"source":"https://music.bugs.co.kr/album/259909","checkedAt":"2026-11-15","minTracks":0,"icon":2,"quiz":{"question":"See You Again의 구성을 바르게 설명하면?","correct":"새 곡과 이전 활동곡을 함께 담았다","wrong":["전곡이 반주곡이다","4집 신곡만 다시 실었다","California Dream 곡만 실었다"],"explanation":"See You Again에는 ‘내겐 너무 멋진 그대’, ‘The Last’와 이전 활동곡들이 함께 담겼습니다.","level":4,"skill":"이야기 기억"},"image":"/images/game/our-stage/stories/chapter-again-period.png","illustrationNote":"앨범 재킷의 의상·헤어를 참고한 도트 재구성입니다.","wardrobeSource":"https://www.melon.com/album/detail.htm?albumId=1150052","wardrobeStatus":"album-reference","subject":"씨야","summary":"새 곡과 지난 활동곡을 함께 담은 See You Again의 이야기입니다."},{"id":"chapter-still","album":"still-here","kind":"album","title":"그럼에도, 다시 함께","date":"2026.03.30","body":["‘그럼에도, 우린’은 2026년 정규 4집에 앞서 공개된 곡입니다. 이후 First, Again에도 보컬곡과 반주 버전이 실렸어요.","오래된 노래를 모으던 여정이 새로운 노래로 이어집니다. 다시 함께 노래하는 세 사람에게 남기고 싶은 한마디를 떠올려보세요."],"source":"https://www.melon.com/album/detail.htm?albumId=13391243&ref=copyurl&snsGate=Y","checkedAt":"2026-11-15","minTracks":0,"icon":2,"quiz":{"question":"2026년 곡과 앨범의 순서는?","correct":"그럼에도, 우린 선공개 → First, Again","wrong":["First, Again → 그럼에도, 우린 선공개","Rebloom → The First Mind","First, Again → See You Again"],"explanation":"‘그럼에도, 우린’은 2026년 정규 4집에 앞서 공개된 곡입니다. 이후 First, Again에도 보컬곡과 반주 버전이 실렸어요.","level":4,"skill":"이야기 기억"},"image":"/images/game/our-stage/stories/chapter-still-period.png","illustrationNote":"앨범 재킷의 의상·헤어를 참고한 도트 재구성입니다.","wardrobeSource":"https://www.melon.com/album/detail.htm?albumId=13299661","wardrobeStatus":"album-reference","subject":"씨야","summary":"2026년 다시 함께 노래한 씨야의 ‘그럼에도, 우린’을 만납니다."},{"id":"chapter-first-again","album":"first-again","kind":"album","title":"처음처럼, 또 한 번의 시작","date":"2026.05.14","body":["First, Again은 데뷔 20주년을 기념한 정규 4집입니다. 타이틀곡 ‘Stay’를 포함해 보컬곡 9개와 반주곡 2개가 담겼습니다.","앨범 소개는 세 멤버의 작사·작곡 참여와 넓어진 음악적 표현을 설명합니다. 마지막 페이지에서 끝나는 대신, 앞으로 쌓일 노래를 기다리는 장이에요."],"source":"https://www.melon.com/album/detail.htm?albumId=13391243&ref=copyurl&snsGate=Y","checkedAt":"2026-11-15","minTracks":0,"icon":2,"quiz":{"question":"4집의 소개와 수록 구성이 모두 맞는 것은?","correct":"20주년 앨범 · Stay 타이틀 · 반주곡 2개","wrong":["10주년 앨범 · Hot Girl 타이틀 · 반주곡 2개","20주년 앨범 · 전곡 반주곡","20주년 앨범 · 그 놈 목소리 타이틀"],"explanation":"First, Again은 데뷔 20주년을 기념한 정규 4집입니다. 타이틀곡 ‘Stay’를 포함해 보컬곡 9개와 반주곡 2개가 담겼습니다.","level":5,"skill":"이야기 기억"},"image":"/images/game/our-stage/stories/chapter-first-again-period.png","illustrationNote":"앨범 재킷의 의상·헤어를 참고한 도트 재구성입니다.","wardrobeSource":"https://www.melon.com/album/detail.htm?albumId=13391243&ref=copyurl&snsGate=Y","wardrobeStatus":"album-reference","subject":"씨야","summary":"씨야의 데뷔 20주년 정규 4집 First, Again을 펼쳐봅니다."},{"id":"event-ost","album":"first-mind","kind":"event","title":"드라마 밖에서도 빛난 노래","date":"2006","body":["씨야는 2006년 Mnet KM 뮤직 페스티벌에서 최우수 OST상을 받았습니다.","드라마와 함께 기억된 노래가 시상식의 기록으로도 남았어요. 데뷔하던 해의 또 하나의 발자취입니다."],"source":"https://www.starnewskorea.com/music/2006/11/25/2006112518150646752","checkedAt":"2026-11-15","minTracks":6,"icon":1,"quiz":{"question":"2006년 MKMF에서 씨야가 받은 부문은?","correct":"최우수 OST상","wrong":["최우수 록음악상","최우수 댄스음악상"],"explanation":"씨야는 2006년 Mnet KM 뮤직 페스티벌에서 최우수 OST상을 받았습니다.","level":1,"skill":"이야기 기억"},"image":"/images/game/our-stage/stories/event-ost-period.png","illustrationNote":"당시 활동 의상으로 재구성한 장면입니다. 이 행사에서 입은 의상은 확인 전입니다.","wardrobeSource":"https://www.starnewskorea.com/music/2006/11/25/2006112518150646752","wardrobeStatus":"period-reference-event-unconfirmed","subject":"씨야","summary":"씨야가 2006년 MKMF에서 최우수 OST상을 받은 순간입니다."},{"id":"event-rookie","album":"first-mind","kind":"event","title":"첫해의 이름이 불리다","date":"2006.12.14","body":["씨야는 2006년 골든디스크에서 신인상을 받았습니다.","데뷔 앨범을 모으는 여정 속에서, 그해 새롭게 등장한 목소리로 인정받았던 순간을 간직해보세요."],"source":"https://www.nocutnews.co.kr/news/224195","checkedAt":"2026-11-15","minTracks":10,"icon":1,"quiz":{"question":"2006년 골든디스크에서 씨야의 수상 부문은?","correct":"신인상","wrong":["대상","디지털 음원 본상"],"explanation":"씨야는 2006년 골든디스크에서 신인상을 받았습니다.","level":1,"skill":"이야기 기억"},"image":"/images/game/our-stage/stories/event-rookie-period.png","illustrationNote":"행사 사진의 의상·헤어를 참고한 도트 재구성입니다.","wardrobeSource":"https://news.nate.com/view/20061214n18649","wardrobeStatus":"event-photo-reference","subject":"씨야","summary":"씨야의 2006년 골든디스크 신인상 수상 기록입니다."},{"id":"event-copyright","album":"lovely-sweet-heart","kind":"event","title":"노래를 지키는 약속","date":"2007.06.27","body":["문화관광부는 2007년 6월 27일 씨야 등을 저작권 홍보대사로 위촉한다고 발표했습니다.","공식 발표는 저작권 홍보와 교육 활동에 참여하는 역할을 소개했어요. 무대에서 노래하는 것과 더불어 창작의 가치를 알리는 기록입니다."],"source":"https://www.mcst.go.kr/site/s_notice/press/pressView.jsp?pSeq=8766","checkedAt":"2026-11-15","minTracks":3,"icon":3,"quiz":{"question":"2007년 6월 문화관광부가 발표한 씨야의 홍보대사 분야는?","correct":"저작권","wrong":["산림 보호","교통 안전"],"explanation":"문화관광부는 2007년 6월 27일 씨야 등을 저작권 홍보대사로 위촉한다고 발표했습니다.","level":2,"skill":"이야기 기억"},"image":"/images/game/our-stage/stories/event-copyright-period.png","illustrationNote":"행사 사진의 의상·헤어를 참고한 도트 재구성입니다.","wardrobeSource":"https://news.nate.com/view/20070627n09395","wardrobeStatus":"event-photo-reference","subject":"씨야","summary":"씨야가 2007년 저작권 홍보대사로 위촉된 기록입니다."},{"id":"event-netiquette","album":"lovely-sweet-heart","kind":"event","title":"온라인에서도 따뜻한 인사","date":"2007.09.18","body":["씨야는 2007년 9월 18일 정보통신윤리 홍보대사 위촉패를 받았습니다.","건전한 인터넷 문화와 올바른 네티켓을 알리는 활동이었어요. 위촉식에서는 신고·상담 업무도 체험했다고 보도됐습니다."],"source":"https://m.etnews.com/200709180162","checkedAt":"2026-11-15","minTracks":7,"icon":3,"quiz":{"question":"정보통신윤리 홍보대사 활동과 연결되는 것은?","correct":"건전한 인터넷 문화와 네티켓","wrong":["해양 구조 교육","지역 관광 코스 개발"],"explanation":"씨야는 2007년 9월 18일 정보통신윤리 홍보대사 위촉패를 받았습니다.","level":2,"skill":"이야기 기억"},"image":"/images/game/our-stage/stories/event-netiquette-period.png","illustrationNote":"행사 사진의 의상·헤어를 참고한 도트 재구성입니다.","wardrobeSource":"https://m.etnews.com/200709180162","wardrobeStatus":"event-photo-reference","subject":"씨야","summary":"씨야가 건전한 인터넷 문화와 네티켓을 알린 이야기입니다."},{"id":"event-digital","album":"lovely-sweet-heart","kind":"event","title":"노래가 닿은 자리마다","date":"2007.12.14","body":["씨야는 2007년 골든디스크에서 디지털 음원 본상을 받았습니다.","전년의 신인상에 이어 또 다른 부문의 수상이 남았습니다. 2집의 곡들을 모은 뒤 이 한 해의 기록도 함께 펼쳐보세요."],"source":"https://www.osen.co.kr/article/G0712140129","checkedAt":"2026-11-15","minTracks":13,"icon":1,"quiz":{"question":"씨야의 골든디스크 수상을 연도 순으로 연결하면?","correct":"2006 신인상 → 2007 디지털 음원 본상","wrong":["2006 대상 → 2007 신인상","2006 디지털 음원 본상 → 2007 신인상"],"explanation":"씨야는 2007년 골든디스크에서 디지털 음원 본상을 받았습니다.","level":2,"skill":"이야기 기억"},"image":"/images/game/our-stage/stories/event-digital-period.png","illustrationNote":"행사 사진의 의상·헤어를 참고한 도트 재구성입니다.","wardrobeSource":"https://www.osen.co.kr/article/G0712140129","wardrobeStatus":"event-photo-reference","subject":"씨야","summary":"씨야가 2007년 골든디스크 디지털 음원 본상을 받은 기록입니다."},{"id":"event-seoul","album":"california-dream","kind":"event","title":"겨울의 시상식에서","date":"2008.01.31","body":["씨야는 2008년 1월 31일 제17회 서울가요대상에서 본상을 받았습니다.","California Dream 활동 시기에 열린 시상식의 기록이에요. 새 앨범의 노래를 모으며, 그 겨울 무대에 더해진 박수도 기억해보세요."],"source":"https://www.edaily.co.kr/News/Read?mediaCodeNo=258&newsId=01236566586283296","checkedAt":"2026-11-15","minTracks":6,"icon":1,"quiz":{"question":"2008년 1월 씨야가 본상을 받은 시상식은?","correct":"서울가요대상","wrong":["MBC 연기대상","골든디스크 신인상 시상식"],"explanation":"씨야는 2008년 1월 31일 제17회 서울가요대상에서 본상을 받았습니다.","level":2,"skill":"이야기 기억"},"image":"/images/game/our-stage/stories/event-seoul-period.png","illustrationNote":"당시 활동 의상으로 재구성한 장면입니다. 이 행사에서 입은 의상은 확인 전입니다.","wardrobeSource":"https://www.melon.com/album/detail.htm?albumId=362767","wardrobeStatus":"period-reference-event-unconfirmed","subject":"씨야","summary":"씨야의 2008년 서울가요대상 본상 수상 기록입니다."},{"id":"event-bcm","album":"see-you-again","kind":"event","title":"부산에서 전한 콘텐츠의 인사","date":"2011.04.26","body":["부산시는 2011년 4월 남규리와 조현재를 부산콘텐츠마켓 홍보대사로 소개했습니다. 위촉식 일정은 4월 26일이었어요.","드라마 ‘49일’에 출연하던 시기의 개인 활동입니다. 그룹의 앨범 이야기 뒤에서 멤버의 또 다른 발자취도 만나보세요."],"source":"https://www.busan.go.kr/news/totalnews01/view?dataNo=32991&gugun=Next","checkedAt":"2026-11-15","minTracks":5,"icon":4,"quiz":{"question":"남규리가 2011년 조현재와 함께 홍보대사를 맡은 행사는?","correct":"부산콘텐츠마켓","wrong":["부산국제영화제","서울가요대상","골든디스크"],"explanation":"부산시는 2011년 4월 남규리와 조현재를 부산콘텐츠마켓 홍보대사로 소개했습니다. 위촉식 일정은 4월 26일이었어요.","level":4,"skill":"이야기 기억"},"image":"/images/game/our-stage/stories/event-bcm-period.png","illustrationNote":"당시 활동 의상으로 재구성한 장면입니다. 이 행사에서 입은 의상은 확인 전입니다.","wardrobeSource":"https://www.bntnews.co.kr/article/view/bnt201105200353","wardrobeStatus":"period-reference-event-unconfirmed","subject":"남규리","summary":"남규리가 2011년 부산콘텐츠마켓 홍보대사로 함께한 기록입니다."},{"id":"event-kairos","album":"see-you-again","kind":"event","title":"배우의 이름으로 받은 박수","date":"2020.12.30","body":["남규리는 ‘카이로스’로 2020 MBC 연기대상 월화 미니·단막 부문 여자 우수 연기상을 받았습니다.","2011년 앨범 이후의 개인 활동을 돌아보는 보너스 이야기입니다. 이 이벤트의 날짜는 앨범 발매일과 다른 실제 수상일이에요."],"source":"https://enews.imbc.com/News/RetrieveNewsInfo/301881","checkedAt":"2026-11-15","minTracks":15,"icon":4,"quiz":{"question":"2020년 남규리의 우수 연기상과 연결되는 방송사·작품은?","correct":"MBC · 카이로스","wrong":["SBS · 49일","MBC · 인생은 아름다워","KBS · 카이로스"],"explanation":"남규리는 ‘카이로스’로 2020 MBC 연기대상 월화 미니·단막 부문 여자 우수 연기상을 받았습니다.","level":4,"skill":"이야기 기억"},"image":"/images/game/our-stage/stories/event-kairos-period.png","illustrationNote":"행사 사진의 의상·헤어를 참고한 도트 재구성입니다.","wardrobeSource":"https://enews.imbc.com/News/RetrieveNewsInfo/301881","wardrobeStatus":"event-photo-reference","subject":"남규리","summary":"남규리가 ‘카이로스’로 2020 MBC 연기대상 우수 연기상을 받은 순간입니다."},{"id":"event-wsg","album":"see-you-again","kind":"event","title":"씨야를 다시 떠올린 목소리","date":"2022.07.23","body":["2022년 이보람은 MBC 「놀면 뭐하니?」의 WSG워너비 프로젝트에 참여해 소연, HYNN(박혜원), 정지소와 가야G로 함께했습니다.","가야G의 「그때 그 순간 그대로」 활동은 이보람이 새로운 동료들과 다시 노래를 전한 시간이었습니다. MBC의 방송 안내에는 씨야 해체 이후 무대를 향했던 간절한 마음과, 음원 1위 소식을 듣고 흘린 눈물이 소개됩니다.","익숙한 목소리를 새로운 무대에서 다시 만나는 순간. 이 이야기는 이보람의 새 활동을 따라 씨야의 노래도 함께 떠올려 보는 장면으로 구성했습니다.","세 사람은 저마다의 자리에서 노래와 일상을 이어 갔습니다. 이후의 회복과 진심을 나눈 이야기까지 따라가면, 「그럼에도, 우린」으로 향합니다."],"source":"https://enews.imbc.com/News/RetrieveNewsInfo/354733","checkedAt":"2026-11-15","minTracks":15,"requiresFlags":["br"],"awardBadge":false,"icon":5,"quiz":{"question":"이보람의 WSG워너비 활동을 담은 팀과 곡의 연결은?","correct":"가야G · 그때 그 순간 그대로","wrong":["4FIRE · 보고싶었어","오아시소 · 그때 그 순간 그대로","가야G · Clink Clink"],"explanation":"이보람은 소연·HYNN(박혜원)·정지소와 가야G로 함께하며 「그때 그 순간 그대로」를 불렀어요.","level":4,"skill":"활동과 노래 연결"},"image":"/images/game/our-stage/stories/event-wsg.png","illustrationNote":"마이크와 추억의 앨범으로 활동의 의미를 표현한 도트 삽화입니다. 실제 방송 장면을 재현한 그림은 아닙니다.","subject":"이보람","summary":"WSG워너비 가야G의 무대에서 이보람의 목소리를 다시 만나고, 씨야의 노래도 함께 떠올려 보는 이야기입니다."},{"id":"event-yeonji-gasoline","subject":"김연지","title":"불꽃처럼 오른 가왕의 자리","badgeName":"김연지 · 불광동 휘발유","date":"2016.07.31","minTracks":7,"icon":3,"source":"https://enews.imbc.com/News/RetrieveNewsInfo/188082","identitySource":"https://enews.imbc.com/News/RetrieveNewsInfo/188937","summary":"김연지가 불광동 휘발유로 35대 가왕에 오른 무대를 간직해요.","body":["2016년 7월 31일, 「복면가왕」의 불광동 휘발유가 흑기사를 꺾고 35대 가왕에 올랐습니다.","8월 14일 가면을 벗은 주인공은 김연지였습니다. 가면 뒤에서 오롯이 목소리로 전한 노래가 가왕의 자리까지 닿은 순간이에요.","이 이야기는 2016년 첫 가왕 등극을 다룹니다. 별도로 만나는 2018년 DMC 페스티벌 「복면가왕 더 위너」 이야기와는 다른 무대예요."],"quiz":{"question":"김연지가 2016년 35대 가왕에 올랐을 때의 가면 이름은?","correct":"불광동 휘발유","wrong":["나이팅게일","걸리버","흑기사"],"explanation":"불광동 휘발유는 김연지의 가면 이름이에요. 2016년 7월 31일 35대 가왕에 올랐습니다.","level":4,"skill":"멤버와 활동 연결"},"album":"see-you-again","kind":"event","checkedAt":"2026-11-15","image":"/images/game/our-stage/stories/gasoline-story-pixel.png","illustrationNote":"당시 가면·무대 의상을 참고한 도트 재해석입니다. 실제 방송 화면은 아닙니다."},{"id":"event-boram-nightingale","subject":"이보람","title":"나이팅게일의 노래가 닿은 곳","badgeName":"이보람 · 나이팅게일","date":"2019.06.02","minTracks":10,"icon":5,"source":"https://enews.imbc.com/News/RetrieveNewsInfo/261263","identitySource":"https://enews.imbc.com/News/RetrieveNewsInfo/263769","summary":"이보람이 나이팅게일로 103대 가왕에 오른 순간을 간직해요.","body":["2019년 6월 2일, 「복면가왕」의 나이팅게일은 「현명한 선택」 무대로 걸리버를 꺾고 103대 가왕에 올랐습니다.","7월 21일 공개된 나이팅게일의 정체는 이보람이었습니다. 103대부터 105대까지 가왕 자리를 지키며 자신만의 목소리를 들려주었어요.","커다란 미소의 가면과 가왕의 왕관을 도트 배지에 담았습니다. 이 이야기를 간직하면 이보람의 전용 배지를 받을 수 있어요."],"quiz":{"question":"이보람이 나이팅게일로 첫 가왕에 올랐을 때 부른 결승 무대 곡은?","correct":"현명한 선택","wrong":["그때 그 순간 그대로","사랑의 인사","미친 사랑의 노래"],"explanation":"2019년 6월 2일 나이팅게일은 「현명한 선택」으로 103대 가왕에 올랐어요.","level":4,"skill":"활동과 무대 연결"},"album":"see-you-again","kind":"event","checkedAt":"2026-11-15","image":"/images/game/our-stage/stories/nightingale-story-pixel.png","illustrationNote":"당시 가면·무대 의상을 참고한 도트 재해석입니다. 실제 방송 화면은 아닙니다."},{"id":"event-yeonji-return","subject":"김연지","title":"다시 노래할 용기","date":"2025.07.25","summary":"수술과 회복의 시간을 공개하고, 다시 노래를 시작한 김연지의 이야기를 만나요.","body":["김연지는 공식 유튜브에서 성대 수술과 회복의 과정을 직접 공개했습니다. 2025년 7월 25일에는 「씨야 김연지, 성대 수술 6개월 만에 처음 노래해 봤습니다」 영상을 올렸어요.","익숙했던 노래를 다시 시작하는 긴장과 기대. 이 장면에서는 어려움을 과장하기보다, 자신의 속도로 목소리를 되찾아 가며 팬들에게 전한 마음을 간직합니다.","이후 20주년 활동을 앞둔 인터뷰에서 김연지는 회복이 예상보다 오래 걸렸고, 멤버들의 응원이 함께하는 데 힘이 되었다고 이야기했습니다.","표시된 날짜는 첫 노래 도전 영상의 공개일이며, 수술일을 뜻하지 않습니다."],"source":"https://www.youtube.com/watch?v=OFAHe024sH0","contextSource":"https://sports.donga.com/ent/article/all/20260329/133633106/2","quiz":{"question":"김연지가 회복 과정 뒤 공식 채널에서 팬들에게 보여 준 도전은?","correct":"다시 노래를 불러 보는 도전","wrong":["새 드라마의 첫 대본 읽기","요리 대회 결승 참가","댄스팀의 첫 해외 공연"],"explanation":"김연지는 수술과 회복 과정을 공개한 뒤, 다시 노래를 시작하는 긴장과 기대를 전했어요.","level":4,"skill":"활동의 의미 읽기"},"album":"see-you-again","kind":"event","minTracks":15,"requiresFlags":["br"],"awardBadge":false,"icon":3,"checkedAt":"2026-11-15","dateBasis":"video-published","image":"/images/game/our-stage/stories/event-yeonji-return.png","illustrationNote":"활동의 의미를 표현한 도트 삽화입니다. 실제 촬영 장면이나 당시 의상을 재현한 그림은 아닙니다."},{"id":"event-gyulmung","subject":"남규리","title":"카메라 앞에 꺼낸 진심","date":"2025.08.10","summary":"귤멍에서 일상과 음악의 마음을 나누며 다시 함께할 날을 그린 남규리를 만나요.","body":["남규리는 유튜브 「귤멍」에서 자신의 일상과 음악 이야기를 팬들과 나누었습니다. 2025년 8월 10일 공개한 특별 다큐멘터리에서는 씨야로 보낸 시간과 솔로 음악을 향한 마음을 돌아봤어요.","기다려 준 팬들에게 고마움을 전하고, 세 사람이 다시 함께 음악을 만들 날을 바라는 마음도 꺼냈습니다. 카메라 앞의 솔직한 이야기를 지나, 다음 장에서는 다시 모인 씨야를 만납니다.","이 이야기는 2026년 복귀 전 공개된 영상의 기록입니다. 유튜브 활동만이 재결합의 계기였다는 뜻은 아닙니다. 표시된 날짜는 영상 공개일입니다."],"source":"https://www.youtube.com/watch?v=D8XBjkcX7Z0","contextSource":"https://www.xportsnews.com/article/2039114","quiz":{"question":"귤멍 특별 다큐멘터리에서 남규리가 나눈 마음과 가까운 것은?","correct":"팬들에게 전하는 고마움과 다시 함께할 음악에 대한 바람","wrong":["가수 활동을 모두 지우겠다는 선언","씨야와 관계없는 여행 일정만 소개","새 스포츠 팀의 경기 계획"],"explanation":"남규리는 씨야의 시간과 솔로 음악을 돌아보며 팬들에게 고마움과 다시 함께할 바람을 전했어요.","level":4,"skill":"활동의 의미 읽기"},"album":"see-you-again","kind":"event","minTracks":15,"requiresFlags":["br"],"awardBadge":false,"icon":3,"checkedAt":"2026-11-15","dateBasis":"video-published","image":"/images/game/our-stage/stories/event-gyulmung.png","illustrationNote":"활동의 의미를 표현한 도트 삽화입니다. 실제 촬영 장면이나 당시 의상을 재현한 그림은 아닙니다."},{"subject":"씨야","kind":"event","awardBadge":false,"icon":2,"checkedAt":"2026-11-19","illustrationNote":"2026년 3월 30일 팬미팅 사진의 멤버별 흰 상의·청바지 착장을 참고한 도트 재해석입니다.","id":"event-rebloom-fanmeeting","album":"still-here","title":"다시 피어난 만남, RE:BLOOM","date":"2026.03.30","minTracks":1,"summary":"재결합 후 첫 팬미팅 RE:BLOOM에서 다시 마주한 씨야와 팬들의 시간을 간직해요.","body":["2026년 3월 30일, 씨야는 서울 종로구 이들스(EDLS)에서 재결합 기념 첫 팬미팅 RE:BLOOM을 열었습니다. 신곡 ‘그럼에도, 우린’을 발표한 바로 그날이었어요.","다시 모인 세 목소리가 팬들과 가까이 마주한 자리. 오래 기다린 마음과 다시 시작하는 마음이 한 공간에서 만났습니다.","팬미팅의 이름처럼 다시 피어난 만남을 간직하고, 이제 새 앨범과 더 큰 무대로 이어지는 이야기를 펼쳐 봅니다."],"source":"https://www.edaily.co.kr/News/Read?mediaCodeNo=257&newsId=02197606645388568","archiveUrl":"/archive/concerts/rebloom-2026/","quiz":{"question":"재결합 첫 팬미팅 RE:BLOOM이 열린 날, 씨야가 함께 전한 새 소식은?","correct":"신곡 ‘그럼에도, 우린’ 발표","wrong":["정규 4집 ‘First, Again’ 발표","전국투어 인천 공연 개최","첫 앨범 ‘The First Mind’ 발표"],"explanation":"2026년 3월 30일 신곡 발표에 이어, 같은 날 저녁 RE:BLOOM 팬미팅으로 팬들과 만났어요.","level":4,"skill":"활동과 만남 연결"},"image":"/images/game/our-stage/stories/event-rebloom-fanmeeting-v2.png"},{"subject":"씨야","kind":"event","awardBadge":false,"icon":2,"checkedAt":"2026-11-19","illustrationNote":"20주년 전국투어의 씨야 과잠과 멤버별 하의·헤어를 참고한 도트 재해석입니다.","id":"event-the-fan-tour","album":"first-again","title":"전국 투어 콘서트, THE FAN","date":"2026.10.31","minTracks":11,"summary":"서울부터 인천까지, 20주년 전국투어에서 함께 부른 노래로 이야기의 마지막 장을 채워요.","body":["정규 4집으로 새 출발을 알린 씨야는 20주년 전국투어 THE FAN으로 팬들을 만났습니다. 2026년 8월 서울에서 시작해 부산·대구·고양·청주·수원을 지나, 10월 31일 인천까지 일곱 도시로 이어진 공연이었어요.","‘여인의 향기’와 ‘사랑의 인사’ 같은 익숙한 노래부터 ‘Stay’와 ‘그럼에도, 우린’까지. 함께 지나온 시간과 새롭게 쌓아 갈 시간이 하나의 무대에서 만났습니다.","연습실에서 시작한 우리의 이야기는 함께 노래하는 객석 앞에서 마지막 장을 덮습니다. 공연이 끝나도 마음에 남은 노래처럼, 씨야와 함께할 다음 이야기를 기다려요."],"source":"https://www.ksw-news.com/news/articleView.html?idxno=3028276","archiveUrl":"/archive/concerts/the-fan-2026/","quiz":{"question":"20주년 전국투어 THE FAN의 무대가 이어 준 두 시간은?","correct":"기존 대표곡의 추억과 재결합 후 새 노래","wrong":["오직 데뷔 전 연습곡만","멤버들이 출연한 드라마 OST만","씨야 노래 없이 해외 팝송만"],"explanation":"THE FAN은 씨야의 대표곡과 정규 4집 신곡을 함께 들려주며, 오래된 추억과 새로운 출발을 이었어요.","level":5,"skill":"공연의 의미 읽기"},"image":"/images/game/our-stage/stories/event-the-fan-tour-v2.png"}];
},
"src/data/our-stage-shop.json":function(module,exports,__require){
module.exports=[{"id":"stage-sugarman","name":"슈가맨3 · 다시 만난 화이트","type":"STAGE STYLE","price":60,"url":"https://www.segye.com/newsView/20200223507996","date":"2020.02.21","prompt":"Create ONE transparent PNG sprite lineup, exactly THREE full-body chunky pixel characters. First image is approved game art: match its coarse square pixels, dot eyes, tiny bodies, flat 2-3 tone shading. Second image is wardrobe reference only. No smooth anime, no scenery, no text, no shadows. Each sprite centered in its own equal-width third with generous transparent gaps, same baseline and arms down. Fixed LEFT Boram, CENTER Gyuri, RIGHT Yeonji, unlike photo order. Adapt 2020 Sugarman white costumes: LEFT Boram (photo center) light brown hair tied low with front wisps, white off-shoulder ruffled long sleeve short dress, white shoes. CENTER Gyuri (photo left) long brown hair with bangs, white long-sleeve flared mini dress with small waist belt, white shoes. RIGHT Yeonji (photo right) long burgundy red straight hair, white tailored double-breasted jacket mini dress, white thigh-high boots.","source":"C:\\Users\\sunil\\.codex\\generated_images\\01a1da83-87e4-7f53-a9eb-c8eed8d4215d\\exec-aaa397ed-2459-481b-95fc-c396401fa52e.png","note":"방송 무대의 의상과 헤어를 참고한 도트 재해석입니다. 구매한 의상과 헤어는 내 옷장에서 따로 조합할 수 있어요. 작은 장식과 보이지 않는 부분은 단순화했어요.","image":"/images/game/our-stage/pixel-stage-sugarman.png","width":1774,"height":887,"members":[[17,574],[592,591],[1184,572]],"method":"Built-in image_gen","identitySource":"https://www.dispatch.co.kr/2066191","mappingNote":"슈가맨3 남규리의 흰 칼라 의상과 방송 자막을 대조했습니다. 생성본은 실사 디테일을 단순화한 시안입니다."},{"id":"stage-seasons","name":"더 시즌즈 · 블랙 앤 화이트","type":"STAGE STYLE","price":90,"url":"https://enews.imbc.com/News/RetrieveNewsInfo/506622","date":"2026.05.29","prompt":"Create ONE transparent PNG sprite lineup, exactly THREE full-body chunky pixel characters. First image is approved game art: match its coarse square pixels, dot eyes, tiny bodies, flat 2-3 tone shading. Second image is wardrobe reference only. No smooth anime, no scenery, no text, no shadows. Each sprite centered in its own equal-width third with generous transparent gaps, same baseline and arms down. Fixed LEFT Boram, CENTER Gyuri, RIGHT Yeonji, unlike photo order. Adapt 2026 The Seasons black/white costumes: LEFT Boram (photo center) long straight brown hair side part, fitted white lace blouse with flared cuffs and scarf flower, black mini skirt, black shoes. CENTER Gyuri (photo left) long black wavy hair with short bangs, white blouse under black vest with black pleated skirt, black shoes. RIGHT Yeonji (photo right) long dark brown hair in low side ponytail, white high-neck ruffled peplum blouse and black wide-leg trousers, black shoes.","source":"C:\\Users\\sunil\\.codex\\generated_images\\01a1da83-87e4-7f53-a9eb-c8eed8d4215d\\exec-94ee5925-92bc-4a5c-9ddb-cdcc10e82822.png","note":"방송 무대의 의상과 헤어를 참고한 도트 재해석입니다. 구매한 의상과 헤어는 내 옷장에서 따로 조합할 수 있어요. 작은 장식과 보이지 않는 부분은 단순화했어요.","image":"/images/game/our-stage/pixel-stage-seasons.png","width":1774,"height":887,"members":[[592,591],[0,591],[1183,575]],"method":"Built-in image_gen","identitySource":"https://enter.etoday.co.kr/news/view/297930","mappingNote":"생성본의 중앙 캐릭터(검정 조끼)는 이보람, 왼쪽 캐릭터(레이스 블라우스)는 남규리입니다. members는 실제 멤버 순서 br/gr/yj로 좌표를 연결합니다."},{"id":"tour-encore","name":"20주년 · 앙코르","type":"CONCERT STYLE","price":100,"date":"2026.10.31","url":"https://www.youtube.com/watch?v=dVjGetjnVzs","note":"인천 앙코르의 이보람 과잠, 남규리 흰 스커트, 김연지 네이비 착장을 참고했어요. 의상과 헤어를 따로 조합할 수 있어요.","image":"/images/game/our-stage/layers/tour-encore.png","width":1536,"height":1024,"members":[[0,512],[512,512],[1024,512]],"sources":["https://www.youtube.com/watch?v=wgJ8Ag7YY54"],"method":"Built-in image_gen","mappingNote":"멤버 이름이 표시된 개별 영상과 단체 무대의 의상·헤어를 대조. br/gr/yj 순서의 독립 헤어·의상 레이어."},{"id":"tour-believe","name":"20주년 · I Believe","type":"CONCERT STYLE","price":120,"date":"2026.08–10","url":"https://www.youtube.com/watch?v=NlNPMFCVrvY","note":"20주년 투어의 블랙 코르셋·화이트 드레스 무대를 참고했어요. 작은 장식과 화면에서 가려진 부분은 단순화했어요.","image":"/images/game/our-stage/layers/tour-believe.png","width":1536,"height":1024,"members":[[0,512],[512,512],[1024,512]],"sources":["https://www.youtube.com/watch?v=EXNheFJHMho","https://www.youtube.com/watch?v=m9fbiFor9F0"],"method":"Built-in image_gen","mappingNote":"멤버 이름이 표시된 개별 영상과 단체 무대의 의상·헤어를 대조. br/gr/yj 순서의 독립 헤어·의상 레이어."},{"id":"tour-varsity","name":"20주년 · 씨야 과잠","type":"CONCERT STYLE","price":100,"date":"2026.10.31","url":"https://www.youtube.com/watch?v=OsU2A-Xpq7c","note":"세 멤버가 과잠을 입은 별도 세트예요. 이보람의 네이비 미니, 남규리의 흰 프릴 스커트, 김연지의 벨트·네이비 스커트 조합을 참고했어요. 작은 장식은 도트로 단순화했어요.","image":"/images/game/our-stage/layers/tour-varsity.png","width":1536,"height":1024,"members":[[0,512],[512,512],[1024,512]],"sources":["https://www.youtube.com/watch?v=dVjGetjnVzs","https://www.youtube.com/watch?v=8tXCxWsLc_c","https://www.youtube.com/watch?v=wgJ8Ag7YY54"],"method":"Built-in image_gen","mappingNote":"그럼에도 우린의 과잠 장면과 멤버별 앙코르 착장 연속성을 대조. 고정 열 순서는 이보람·남규리·김연지. 기존 tour-encore 레이어와 구매 기록은 유지."},{"id":"stage-hanbok","name":"설날 · 색동 한복","type":"SPECIAL STYLE","price":80,"date":"2008 설 인사","url":"https://www.joynews24.com/view/311671","sourceLabel":"참고한 설 인사 사진","note":"예전에 선보인 한복 세트예요. 2008년 설 인사 사진을 참고한 도트 의상으로, 이보람은 청록·분홍, 남규리는 아이보리·빨강, 김연지는 분홍·파랑 한복을 입어요. 의상과 헤어는 따로 조합할 수 있어요.","image":"/images/game/our-stage/layers/california-dream-v2.png","width":1536,"height":1024,"members":[[0,512],[512,512],[1024,512]],"sources":["https://www.joynews24.com/view/311684","https://www.joynews24.com/view/311672","https://www.joynews24.com/view/311683"],"mappingNote":"기존 2.5집 설 인사 한복 레이어를 별도 상점 세트로 복원. br/gr/yj 멤버별 좌표와 헤어를 유지하며 현행 앨범 무대 의상은 변경하지 않음."}];
},
"src/data/our-stage-capsule-outfits.json":function(module,exports,__require){
module.exports=[{"id":"capsule-white","reward":"outfit-white","name":"사랑하고 싶어 - 2026","type":"CAPSULE STYLE","date":"2026.11.14","url":"https://www.youtube.com/watch?v=X6AllgM6ix4","note":"‘사랑하고 싶어’ 무대의 의상과 헤어를 참고한 도트 재해석. 한 세트로 세 멤버의 의상과 헤어를 함께 얻어요.","image":"/images/game/our-stage/layers/capsule-white.png","width":1536,"height":1024,"title":"사랑하고 싶어","year":2026,"members":["br","gr","yj"],"rarity":"special","color":"#849bb7","paper":"#f0f5ff","headKind":"헤어","sourceLabel":"불후의 명곡"},{"id":"capsule-silver","reward":"outfit-silver","name":"보여줄게 - 2026","type":"CAPSULE STYLE","date":"2026.05.30","url":"https://www.youtube.com/watch?v=vK1eUYoklQY","note":"‘보여줄게’ 무대의 실버·라벤더 의상과 헤어를 참고한 도트 재해석. 한 세트로 세 멤버의 의상과 헤어를 함께 얻어요.","image":"/images/game/our-stage/layers/capsule-silver.png","width":1536,"height":1024,"title":"보여줄게","year":2026,"members":["br","gr","yj"],"rarity":"special","color":"#a08ac8","paper":"#f3edff","headKind":"헤어","sourceLabel":"불후의 명곡"},{"id":"capsule-cocktail","reward":"outfit-cocktail","name":"칵테일 사랑 - 2006","date":"2006.08.26","note":"콘서트 7080 ‘칵테일 사랑’ 무대의 블루·화이트 의상과 헤어를 참고했어요. 이보람의 파란 땋은 머리 장식, 남규리의 조끼·셔츠, 김연지의 줄무늬 상의를 도트로 재해석했습니다.","type":"CAPSULE STYLE","url":"https://www.youtube.com/watch?v=Cu2s2DCmK6A&t=917s","image":"/images/game/our-stage/layers/capsule-cocktail.png","width":1536,"height":1024,"title":"칵테일 사랑","year":2006,"members":["br","gr","yj"],"rarity":"special","color":"#577db4","paper":"#eaf3ff","headKind":"헤어","sourceLabel":"콘서트 7080"},{"id":"capsule-hotgirl","reward":"outfit-hotgirl","name":"Hot Girl - 2008","date":"2008.10.03","note":"뮤직뱅크 ‘Hot Girl’ 무대의 핑크 착장과 헤드폰을 참고했어요. 이보람의 리본·노랑 벨트, 남규리의 미니 모자·후드 세트, 김연지의 체크 셔츠·오버롤을 도트로 재해석했습니다. 작은 장식과 불명확한 신발 디테일은 단순화했어요.","type":"CAPSULE STYLE","url":"https://www.youtube.com/watch?v=Cu2s2DCmK6A&t=3208s","image":"/images/game/our-stage/layers/capsule-hotgirl.png","width":1536,"height":1024,"title":"Hot Girl","year":2008,"members":["br","gr","yj"],"rarity":"special","color":"#d64c95","paper":"#fff0f7","headKind":"헤어","sourceLabel":"뮤직뱅크"},{"id":"capsule-nightingale","reward":"outfit-nightingale","name":"어제 오늘 그리고 - 2019","title":"어제 오늘 그리고","year":2019,"date":"2019.07.21","members":["br"],"rarity":"special","headKind":"가면","color":"#8a9e6d","paper":"#f3f6e8","sourceLabel":"복면가왕 · 나이팅게일","url":"https://www.youtube.com/watch?v=HCkuUnEnFqY","note":"나이팅게일의 연두색 드레스·흰 앞치마와 가면을 도트로 재해석했어요. 의상과 가면을 따로 조합할 수 있어요.","type":"CAPSULE STYLE","image":"/images/game/our-stage/layers/capsule-solo-20261119.png","width":1536,"height":1024},{"id":"capsule-kairos","reward":"outfit-kairos","name":"카이로스 - 2020","title":"카이로스","year":2020,"date":"2020","members":["gr"],"rarity":"rare","headKind":"헤어","color":"#b28d9f","paper":"#fff0f6","sourceLabel":"드라마 · 강현채","url":"https://enews.imbc.com/News/RetrieveNewsInfo/293723","note":"강현채의 분홍 꽃무늬 블라우스와 긴 머리를 참고했어요. 사진에 보이지 않는 하의와 신발은 게임에 맞춰 재해석했습니다.","type":"CAPSULE STYLE","image":"/images/game/our-stage/layers/capsule-solo-20261119.png","width":1536,"height":1024},{"id":"capsule-gasoline","reward":"outfit-gasoline","name":"헤어지는 중입니다 - 2016","title":"헤어지는 중입니다","year":2016,"date":"2016.07.31","members":["yj"],"rarity":"special","headKind":"가면","color":"#d55236","paper":"#fff2e6","sourceLabel":"복면가왕 · 불광동 휘발유","url":"https://enews.imbc.com/News/ViewAmp/189402","note":"불광동 휘발유의 붉은 드레스·장갑과 불꽃 가면을 도트로 재해석했어요. 의상과 가면을 따로 조합할 수 있어요.","type":"CAPSULE STYLE","image":"/images/game/our-stage/layers/capsule-solo-20261119.png","width":1536,"height":1024},{"id":"capsule-brother","reward":"outfit-brother","name":"형 (兄) - 2024","title":"형 (兄)","year":2024,"date":"2024.02.21","members":["br"],"rarity":"normal","headKind":"헤어","color":"#6a6179","paper":"#f3edf6","sourceLabel":"방구석 캐스팅 · Special Clip","url":"https://www.youtube.com/watch?v=oukYixC1ldo","note":"짧은 검은 단발과 흰 칼라의 체크 의상을 참고했어요. 영상에서 확인한 상반신을 바탕으로 하의와 신발은 도트 의상으로 재해석했습니다.","type":"CAPSULE STYLE","image":"/images/game/our-stage/layers/capsule-solo-normal-20261119.png","width":1536,"height":1024},{"id":"capsule-good-day","reward":"outfit-good-day","name":"이렇게 좋은 날 - 2019","title":"이렇게 좋은 날","year":2019,"date":"2019.04.23","members":["br"],"rarity":"rare","headKind":"헤어","color":"#bd788f","paper":"#fff0f4","sourceLabel":"보람씨야 · Live clip","url":"https://www.youtube.com/watch?v=DujKGd4aA60","note":"꽃무늬 분홍 원피스·짧은 웨이브 머리와 드롭 귀고리를 참고했어요. 영상에서 보이지 않는 치마 길이와 신발은 게임에 맞춰 재해석했습니다.","type":"CAPSULE STYLE","image":"/images/game/our-stage/layers/capsule-solo-rare-20261119.png","width":1536,"height":1024},{"id":"capsule-sorrow","reward":"outfit-sorrow","name":"슬픔이 찾아와서 그래 - 2025","title":"슬픔이 찾아와서 그래","year":2025,"date":"2025.09","members":["gr"],"rarity":"normal","headKind":"헤어","color":"#ad9479","paper":"#faf2e8","sourceLabel":"에잇 8recordz · LIVE CLIP","url":"https://www.youtube.com/watch?v=nN7NV5FBhBw","note":"베이지 니트와 긴 머리를 참고했어요. 영상의 상반신 착장을 도트로 옮기고, 하의와 신발은 크림색으로 재해석했습니다.","type":"CAPSULE STYLE","image":"/images/game/our-stage/layers/capsule-solo-normal-20261119.png","width":1536,"height":1024},{"id":"capsule-confession","reward":"outfit-confession","name":"고백하는 거 맞아 - 2024","title":"고백하는 거 맞아","year":2024,"date":"2024","members":["gr"],"rarity":"rare","headKind":"헤어","color":"#9d94b1","paper":"#f3eff9","sourceLabel":"뮤직카우 · Live Clip","url":"https://www.youtube.com/watch?v=UkOV4Z8Vpm8","note":"턱선 단발, 회색 끈 원피스와 목의 꽃 장식·흰 카디건을 참고했어요. 작은 장식과 화면 밖 하의 길이·신발은 단순화했습니다.","type":"CAPSULE STYLE","image":"/images/game/our-stage/layers/capsule-solo-rare-20261119.png","width":1536,"height":1024},{"id":"capsule-mom","reward":"outfit-mom","name":"내 맘 (Mom) - 2020","title":"내 맘 (Mom)","year":2020,"date":"2020.02.13","members":["yj"],"rarity":"normal","headKind":"헤어","color":"#b6a083","paper":"#fff8ec","sourceLabel":"김연지 Official · Live Clip","url":"https://www.youtube.com/watch?v=_FJkNLkV82U","note":"크림색 브이넥 니트와 밝은 갈색 웨이브 머리를 참고했어요. 하의와 신발은 게임에 맞춰 재해석했습니다. 표기 연도는 음원 발매가 아닌 라이브 클립 공개 연도예요.","type":"CAPSULE STYLE","image":"/images/game/our-stage/layers/capsule-solo-normal-20261119.png","width":1536,"height":1024},{"id":"capsule-wind","reward":"outfit-wind","name":"바람이 불면 - 2020","title":"바람이 불면","year":2020,"date":"2020.03.06","members":["yj"],"rarity":"rare","headKind":"헤어","color":"#677d9b","paper":"#eff4fa","sourceLabel":"KBS · 유희열의 스케치북","url":"https://www.youtube.com/watch?v=lOvBRahMvtQ","note":"흰 브이넥 블라우스, 푸른 바지와 청록색 구두를 실제 전신 무대 화면에서 확인했어요. 활동기 머리와 귀고리를 함께 도트로 재해석했습니다.","type":"CAPSULE STYLE","image":"/images/game/our-stage/layers/capsule-solo-rare-20261119.png","width":1536,"height":1024},{"id":"capsule-49days","reward":"outfit-49days","name":"49일 - 2011","title":"49일","year":2011,"date":"2011","members":["gr"],"rarity":"rare","headKind":"헤어","color":"#cb93aa","paper":"#fff0f5","sourceLabel":"드라마 · 신지현","url":"https://www.chosun.com/site/data/html_dir/2011/04/15/2011041500845.html","note":"신지현의 분홍 시폰 원피스·허리 리본과 긴 머리를 당시 SBS 촬영 사진에서 참고했어요. 시폰의 층과 작은 디테일은 도트로 단순화했습니다.","type":"CAPSULE STYLE","image":"/images/game/our-stage/layers/capsule-drama-20261119.png","width":1254,"height":1254},{"id":"capsule-cruel-city","reward":"outfit-cruel-city","name":"무정도시 - 2013","title":"무정도시","year":2013,"date":"2013.06.25","members":["gr"],"rarity":"normal","headKind":"헤어","color":"#686575","paper":"#f0eef4","sourceLabel":"드라마 · 윤수민","url":"https://cm.asiae.co.kr/article/2013062518111747114","note":"윤수민의 잠입 장면 속 검은 모자·가죽 재킷·검은 스키니 바지와 배낭을 참고했어요. 화면 밖 신발과 작은 장식은 단순화했습니다.","type":"CAPSULE STYLE","image":"/images/game/our-stage/layers/capsule-drama-20261119.png","width":1254,"height":1254},{"id":"capsule-wedding","reward":"outfit-wedding","name":"결혼할까요 - 2007","title":"결혼할까요","year":2007,"date":"2007.09.09","members":["br","gr","yj"],"rarity":"special","headKind":"헤어","color":"#b798cc","paper":"#fff7fc","sourceLabel":"SBS 인기가요 · 웨딩드레스","url":"https://www.youtube.com/watch?v=D-mng72Hx1w","note":"이보람의 홀터넥·튤 드레스, 남규리의 연보라 리본·벌룬 드레스, 김연지의 층층이 레이스 드레스와 당시 헤어를 참고했어요. 작은 장식은 도트로 단순화했으며, 한 번 뽑으면 세 멤버의 의상과 헤어를 함께 얻어요.","type":"CAPSULE STYLE","image":"/images/game/our-stage/layers/capsule-wedding-2007.png","width":1536,"height":1024}];
},
"src/shared/our-stage-legacy.js":function(module,exports,__require){
'use strict';
function createModel(testMode=false) {
  const timing={recoveryMs:testMode?1000:60000,performanceMs:testMode?1000:3300,testMode};
  // Album order follows Melon 314286. Each condition uses permanent progress.
  const songs = [
    {id:'scent', title:'여인의 향기', hint:'연습실에 처음 들어오면 열려요.', unlocked:()=>true},
    {id:'shoes', title:'구두', hint:'첫 무대를 마치면 열려요.', unlocked:s=>has(s,'first')},
    {id:'because', title:'사랑하기 때문에 (Feat. SG워너비)', hint:'구두의 팀 호흡 연습을 마치면 열려요.', unlocked:s=>s.tracks.shoes.includes(1)},
    {id:'flower', title:'접시꽃', hint:'구두 준비도 100%를 달성하면 열려요.', unlocked:s=>ready(s,'shoes')},
    {id:'promise', title:'Promise U', hint:'앨범 퀴즈를 풀거나 1집 기록을 간직하면 열려요.', unlocked:s=>has(s,'album')},
    {id:'again', title:'처음부터 또다시', hint:'Promise U의 보컬 연습을 마치면 열려요.', unlocked:s=>s.tracks.promise.includes(0)},
    {id:'guilty', title:'유죄', hint:'이야기에서 김연지의 멤버 카드를 얻으면 열려요.', unlocked:s=>has(s,'yj')},
    {id:'parting', title:'이별 해보기', hint:'이야기에서 남규리의 멤버 카드를 얻으면 열려요.', unlocked:s=>has(s,'gr')},
    {id:'tears', title:'Tears And Fears', hint:'이야기에서 이보람의 멤버 카드를 얻으면 열려요.', unlocked:s=>has(s,'br')},
    {id:'loved', title:'사랑했다면', hint:'세 카드를 모으고 재회의 기억을 간직하면 열려요.', unlocked:s=>has(s,'reunion')},
    {id:'just', title:'그냥', hint:'서로 다른 세 곡의 준비도를 100%로 만들면 열려요.', unlocked:s=>ids.filter(id=>id!=='just'&&ready(s,id)).length>=3},
    {id:'fault', title:'내 잘못입니다', hint:'우리의 콘서트 엔딩을 보면 열려요.', unlocked:s=>has(s,'ending')}
  ];
  const lessons = [
    {title:'보컬 연습', seconds:testMode?1:10, gain:30},
    {title:'팀 호흡 맞추기', seconds:testMode?1:12, gain:30},
    {title:'무대 동선 연습', seconds:testMode?1:15, gain:40}
  ];
  const members = [
    {id:'yj', name:'김연지', episode:'E04', title:'가면 너머의 목소리', date:'2018.09.07', fact:'김연지의 DMC 페스티벌 ‘복면가왕 더 위너’ 무대를 아카이브에서 만날 수 있어요.', url:'https://www.youtube.com/watch?v=VX4z0syPoWw'},
    {id:'gr', name:'남규리', episode:'E05', title:'카메라 앞에서', date:'2011.05.20', fact:'드라마 ‘49일’의 마지막 장면을 돌아보는 종영 보도에 남규리의 연기 기록이 남아 있어요.', url:'https://www.bntnews.co.kr/article/view/bnt201105200353'},
    {id:'br', name:'이보람', episode:'E06', title:'또 다른 하모니', date:'2022.07.16', fact:'이보람은 ‘놀면 뭐하니?’에서 가야G 멤버로 첫 쇼케이스 무대에 섰어요.', url:'https://www.youtube.com/watch?v=cojgPoISAf0'}
  ];
  const reunionUrl='https://tv.jtbc.co.kr/clip/pr10011122/pm10055652/vo10354827/view';
  const ids = songs.map(s=>s.id);
  const flags = ['first','album','yj','gr','br','reunion','ending'];
  function fresh(now=Date.now()){
    return {version:3,content:'first-mind',points:100,energyAt:now,tracks:Object.fromEntries(ids.map(id=>[id,[]])),flags:[],collected:['scent'],proofs:[],notes:{},active:null,queue:null,setlist:[],display:null};
  }
  const has=(s,id)=>s.flags.includes(id);
  // Costume ownership is derived from album progress, never from test fitting.
  // Add a real chapter unlock flag here when its playable album is implemented.
  const albumUnlockFlags={'first-mind':'album','lovely-sweet-heart':null,'california-dream':null,'brilliant-change':null,rebloom:null,'see-you-again':null,'still-here':null,'first-again':null};
  const albumUnlocked=(s,id)=>Boolean(albumUnlockFlags[id]&&has(s,albumUnlockFlags[id]));
  const outfitOwned=(s,id)=>id==='base'||albumUnlocked(s,id);
  const canWearOutfit=(s,id)=>(id==='base'||Object.hasOwn(albumUnlockFlags,id))&&(outfitOwned(s,id)||testMode);
  const eligible=(s,id)=>songs.find(song=>song.id===id)?.unlocked(s)??false;
  const open=(s,id)=>s.collected.includes(id);
  const ready=(s,id)=>s.tracks[id].length===3;
  const percent=(s,id)=>s.tracks[id].reduce((sum,i)=>sum+lessons[i].gain,0);
  const voices=s=>members.filter(m=>has(s,m.id)).length;
  const count=s=>ids.filter(id=>open(s,id)).length;
  const cheers=s=>ids.reduce((n,k)=>n+s.tracks[k].length,0)*2+s.flags.length*5;
  function recover(s,now){
    if(now<s.energyAt)return;
    const n=Math.floor((now-s.energyAt)/timing.recoveryMs);
    if(s.points===100){s.energyAt=now;return;}
    if(n){s.points=Math.min(100,s.points+n*5);s.energyAt=s.points===100?now:s.energyAt+n*timing.recoveryMs;}
  }
  function start(s,job,at){
    if(s.points<5)return false;
    if(s.points===100)s.energyAt=at;
    s.points-=5;s.active={...job,end:at+lessons[job.lesson].seconds*1000};return true;
  }
  function settle(s,now=Date.now()){
    let finished=0;
    while(s.active&&s.active.end<=now){
      const {track,lesson,end}=s.active;
      if(!s.tracks[track].includes(lesson))s.tracks[track].push(lesson);
      if(ready(s,track)&&!s.setlist.includes(track))s.setlist.push(track);
      s.active=null;finished++;recover(s,end);
      if(s.queue){const next=s.queue;s.queue=null;start(s,next,end);}
    }
    recover(s,now);return finished;
  }
  function train(s,track,lesson,now=Date.now()){
    if(!ids.includes(track)||!open(s,track)||!lessons[lesson]||s.tracks[track].includes(lesson))return false;
    const same=j=>j&&j.track===track&&j.lesson===lesson;
    if(same(s.active)||same(s.queue)||s.queue)return false;
    const job={track,lesson};
    if(s.active){s.queue=job;return true;}
    return start(s,job,now);
  }
  function claim(s,id){
    if(has(s,id))return false;
    const allowed=id==='first'?ready(s,'scent'):id==='album'?has(s,'first'):
      members.some(m=>m.id===id)?has(s,'album'):id==='reunion'?voices(s)===3:
      id==='ending'?has(s,'reunion')&&s.setlist.length>=2:false;
    if(!allowed||!s.proofs.includes('story:'+id))return false;
    s.flags.push(id);return true;
  }
  function valid(s){
    if(!s||s.version!==3||s.content!=='first-mind'||!Number.isInteger(s.points)||s.points<0||s.points>100||!Number.isSafeInteger(s.energyAt)||s.energyAt<0)return false;
    const subset=(a,opts)=>Array.isArray(a)&&a.every(x=>opts.includes(x))&&new Set(a).size===a.length;
    if(!subset(s.flags,flags)||!s.tracks||!ids.every(id=>subset(s.tracks[id],[0,1,2])))return false;
    if(!subset(s.collected,ids)||!s.collected.includes('scent')||!s.collected.every(id=>eligible(s,id))||!subset(s.proofs,Object.keys(challenges))||!s.notes||typeof s.notes!=='object'||Array.isArray(s.notes)||!Object.entries(s.notes).every(([k,v])=>k.startsWith('story:')&&challenges[k]&&typeof v==='string'&&v.trim().length>0&&v.length<=200))return false;
    if(!subset(s.flags,flags)||!s.tracks||!ids.every(id=>subset(s.tracks[id],[0,1,2]))||!ids.every(id=>!s.tracks[id].length||open(s,id)))return false;
    const job=j=>j&&ids.includes(j.track)&&open(s,j.track)&&[0,1,2].includes(j.lesson)&&!s.tracks[j.track].includes(j.lesson);
    if(s.active!==null&&(!job(s.active)||!Number.isSafeInteger(s.active.end)||s.active.end<0))return false;
    if(s.queue!==null&&(!s.active||!job(s.queue)||(s.queue.track===s.active.track&&s.queue.lesson===s.active.lesson)))return false;
    if(!subset(s.setlist,ids.filter(id=>ready(s,id)))||!(s.display===null||members.some(m=>m.id===s.display&&has(s,m.id))))return false;
    return s.flags.every(id=>s.proofs.includes('story:'+id))&&(!has(s,'first')||ready(s,'scent'))&&(!has(s,'album')||has(s,'first'))&&(!voices(s)||has(s,'album'))&&(!has(s,'reunion')||voices(s)===3)&&(!has(s,'ending')||has(s,'reunion')&&ids.filter(id=>ready(s,id)).length>=2);
  }
  function loadSave(raw){
    const data=JSON.parse(raw);
    if(data?.version===1&&data.content==='studio-1'&&data.tracks&&['scent','shoes','promise'].every(id=>Array.isArray(data.tracks[id]))){
      const tracks=fresh().tracks;
      for(const id of ['scent','shoes','promise'])tracks[id]=data.tracks[id];
      Object.assign(data,{version:2,content:'first-mind',tracks});
    }
    if(data?.version===2&&data.content==='first-mind'){
      if(!data.tracks||!Array.isArray(data.flags)||!ids.every(id=>Array.isArray(data.tracks[id])))throw Error('Invalid stage save');
      data.collected=ids.filter(id=>eligible(data,id));data.proofs=data.flags.map(id=>'story:'+id);data.notes={};data.version=3;
    }
    if(!valid(data))throw Error('Invalid stage save');
    return data;
  }

  const challenges = __require("src/data/our-stage-challenges.json");
  function canChallenge(s,key){
    if(!challenges[key])return false;
    const [kind,id]=key.split(':');
    if(kind==='song')return eligible(s,id)&&!open(s,id);
    return id==='first'?ready(s,'scent'):id==='album'?has(s,'first'):
      members.some(m=>m.id===id)?has(s,'album'):id==='reunion'?voices(s)===3:
      id==='ending'?has(s,'reunion')&&s.setlist.length>=2:false;
  }
  function answer(s,key,index){
    if(!canChallenge(s,key)||index!==challenges[key].answer)return false;
    if(!s.proofs.includes(key))s.proofs.push(key);
    if(key.startsWith('song:'))s.collected.push(key.slice(5));
    return true;
  }
  function cheer(s,key,text){
    text=String(text||'').trim();
    if(!key.startsWith('story:')||!canChallenge(s,key)||!text||text.length>200)return false;
    s.notes[key]=text;if(!s.proofs.includes(key))s.proofs.push(key);return true;
  }
  return {albumUnlocked,outfitOwned,canWearOutfit,timing,challenges,canChallenge,answer,cheer,eligible,loadSave,songs,lessons,members,reunionUrl,ids,fresh,has,open,ready,percent,voices,count,cheers,settle,train,claim,valid};
}
module.exports=createModel();
module.exports.forTest=()=>createModel(true);

},
"src/shared/our-stage-leisure.js":function(module,exports,__require){
'use strict';
module.exports=function(M){
 M=__require("src/shared/our-stage-solo.js")(M);
 const drive=__require("src/shared/our-stage-drive.js"),decorStore=__require("src/shared/our-stage-stage-shop.js");
 const play=__require("src/shared/our-stage-play.js")(M),capsules=__require("src/shared/our-stage-capsules.js");
 const migrate=s=>{if(s.leisure===undefined)s.leisure={version:2,play:play.fresh(s.mini),capsules:capsules.fresh(),skins:{cards:{},stage:null}};if(s.leisure?.version===1){for(const slots of Object.values(s.leisure.skins?.cards||{})){if(slots.effect){if(!s.leisure.capsules?.owned?.includes(slots.effect)||!['effect-petals','effect-record','effect-twinkle','effect-confetti'].includes(slots.effect))throw Error('Invalid old effect');if(!slots.frame)slots.frame=slots.effect;delete slots.effect;}}s.leisure.version=2;}if(s.leisure.decor===undefined)s.leisure.decor=decorStore.fresh();else s.leisure.decor=decorStore.migrate(s.leisure.decor);if(s.leisure.drive===undefined)s.leisure.drive=drive.fresh();return s;};
 const net=s=>s.leisure.play.earned+s.leisure.drive.earned-(s.leisure.capsules.pulls-s.leisure.capsules.freePulls)*capsules.price-decorStore.spent(s.leisure.decor);
 const coins=s=>M.coins(s)+net(s);
 const owns=(s,id)=>s.leisure.capsules.owned.includes(id);
 function ownStateValid(s){try{const l=s.leisure;if(!l||l.version!==2||!play.valid(l.play,s)||!drive.valid(l.drive)||!decorStore.valid(l.decor)||!capsules.valid(l.capsules)||!l.skins||!l.skins.cards||typeof l.skins.cards!=='object'||Array.isArray(l.skins.cards))return false;
 if(l.skins.stage!==null&&l.decor.equipped.background!==null)return false;
 if(l.skins.stage!==null&&(!owns(s,l.skins.stage)||capsules.byId(l.skins.stage)?.kind!=='stage'))return false;
 return Object.entries(l.skins.cards).every(([id,slots])=>M.cardOwned(s,id)&&slots&&typeof slots==='object'&&!Array.isArray(slots)&&Object.entries(slots).every(([kind,item])=>['frame','background'].includes(kind)&&owns(s,item)&&capsules.byId(item)?.kind===kind));
 }catch{return false;}}
 const adjusted=s=>({...s,simple:{...s.simple,walletOffset:s.simple.walletOffset+net(s)}});
 const valid=s=>ownStateValid(s)&&M.valid(adjusted(s));
 function loadSave(raw){if(typeof raw!=='string'||raw.length>512000)throw Error('Invalid leisure save');let s=JSON.parse(raw);if(s?.leisure===undefined)return migrate(M.loadSave(raw));migrate(s);if(!ownStateValid(s))throw Error('Invalid leisure data');const offset=s.simple.walletOffset;s=M.loadSave(JSON.stringify(adjusted(s)));s.simple.walletOffset=offset;if(!valid(s))throw Error('Invalid leisure save');return s;}
 const fresh=now=>migrate(M.fresh(now));
 function purchase(s,id,member){const o=M.shopById(id);if(!o||!M.memberIds.includes(member)||s.purchases.includes(id+':'+member)||coins(s)<o.price)return false;s.purchases.push(id+':'+member);return true;}
 const capsuleUnlocked=s=>Boolean(s.simple.concerts['first-mind']);
 const pull=(s,now=Date.now(),random=Math.random)=>capsuleUnlocked(s)?capsules.pull(s.leisure.capsules,now,coins(s),random):null;
 const exchange=(s,id)=>capsuleUnlocked(s)&&capsules.exchange(s.leisure.capsules,id);
 function applySkin(s,id,card=null){const item=capsules.byId(id);if(!item||!owns(s,id))return false;if(item.kind==='stage'){s.leisure.skins.stage=id;s.leisure.decor.equipped.background=null;return true;}if(item.kind==='outfit'||!M.cardOwned(s,card))return false;s.leisure.skins.cards[card]??={};s.leisure.skins.cards[card][item.kind]=id;return true;}
 function clearSkin(s,kind,card=null){if(kind==='stage'){s.leisure.skins.stage=null;s.leisure.decor.equipped.background=null;return true;}if(!['frame','background'].includes(kind)||!M.cardOwned(s,card))return false;if(s.leisure.skins.cards[card]){delete s.leisure.skins.cards[card][kind];if(!Object.keys(s.leisure.skins.cards[card]).length)delete s.leisure.skins.cards[card];}return true;}
 function buyDecor(s,id){const i=decorStore.byId(id);if(!s.simple.debuted||!i||s.leisure.decor.owned.includes(id)||coins(s)<i.price)return false;s.leisure.decor.owned.push(id);return true;}
 function equipDecor(s,id){const i=decorStore.byId(id);if(!i||!s.leisure.decor.owned.includes(id))return false;s.leisure.decor.equipped[i.slot]=id;if(i.slot==='background')s.leisure.skins.stage=null;return true;}
 function clearDecor(s,slot){if(!Object.hasOwn(decorStore.slots,slot))return false;s.leisure.decor.equipped[slot]=null;if(slot==='background')s.leisure.skins.stage=null;return true;}
 return {...M,earnings:s=>({...M.earnings(s),mini:M.earnings(s).mini+s.leisure.play.earned+s.leisure.drive.earned}),coins,purchase,fresh,valid,loadSave,play,drive,decorStore,buyDecor,equipDecor,clearDecor,capsules,capsuleUnlocked,pullCapsule:pull,exchangeCapsule:exchange,applySkin,clearSkin};
};

},
"src/shared/our-stage-solo.js":function(module,exports,__require){
'use strict';
// A separate encore chapter preserves the original eight-album save and unlock order.
module.exports=function(B){
 const soloAlbums=__require("src/data/our-stage-solos.json");
 const legacyAlbums=__require("src/data/our-stage-solos-v1.json");
 const soloById=id=>soloAlbums.find(a=>a.id===id);
 const soloTrackById=id=>soloAlbums.flatMap(a=>a.tracks).find(t=>t.id===id);
 const chapter=id=>soloAlbums.find(a=>a.tracks.some(t=>t.id===id));
 const soloUnlocked=s=>Boolean(s.simple?.concerts?.['first-again']);
 const soloSeconds=B.timing.testMode?3:15,soloCost=15;
 const data=s=>s.solo||{catalogVersion:2,done:[],active:null,concerts:{}};
 const soloDone=(s,id)=>data(s).done.includes(id);
 const soloOpen=(s,id)=>{const a=chapter(id),i=a?.tracks.findIndex(t=>t.id===id);return !!a&&soloUnlocked(s)&&(soloDone(s,id)||i===0||soloDone(s,a.tracks[i-1].id));};
 const soloConcertReady=(s,id)=>soloUnlocked(s)&&!!soloById(id)&&soloById(id).tracks.every(t=>soloDone(s,t.id));
 const stamp=n=>Number.isSafeInteger(n)&&n>0&&n<253402268399999;
 function ownValid(s){
  if(s.solo===undefined)return true;
  const x=s.solo;if(!x||x.catalogVersion!==2||Array.isArray(x)||!Array.isArray(x.done)||new Set(x.done).size!==x.done.length||!x.done.every(id=>soloTrackById(id))||!x.concerts||typeof x.concerts!=='object'||Array.isArray(x.concerts))return false;
  if(!soloUnlocked(s)&&(x.done.length||x.active||Object.keys(x.concerts).length))return false;
  if(x.active!==null&&(!x.active||!soloOpen(s,x.active.id)||soloDone(s,x.active.id)||!stamp(x.active.end)||s.active||s.queue))return false;
  return Object.entries(x.concerts).every(([id,r])=>soloConcertReady(s,id)&&r&&stamp(r.at)&&typeof r.restored==='boolean'&&r.serial==='OS-'+id+'-'+r.at&&Array.isArray(r.tracks)&&r.tracks.join('|')===soloById(id).tracks.map(t=>t.id).join('|'));
 }
 const valid=s=>{try{return B.valid(s)&&ownValid(s);}catch{return false;}};
 function migrate(s){
  const x=s.solo;if(x===undefined||x?.catalogVersion!==undefined)return s;
  const oldTrack=id=>legacyAlbums.flatMap(a=>a.tracks).find(t=>t.id===id);
  const oldOpen=id=>{const a=legacyAlbums.find(a=>a.tracks.some(t=>t.id===id)),i=a?.tracks.findIndex(t=>t.id===id);return !!a&&soloUnlocked(s)&&(i===0||x.done.includes(a.tracks[i-1].id));};
  if(!x||!Array.isArray(x.done)||new Set(x.done).size!==x.done.length||!x.done.every(id=>oldTrack(id)&&oldOpen(id))||!x.concerts||typeof x.concerts!=='object'||Array.isArray(x.concerts))throw Error('Invalid legacy solo save');
  if(!soloUnlocked(s)&&(x.done.length||x.active||Object.keys(x.concerts).length))throw Error('Invalid legacy solo gate');
  if(x.active!==null&&(!x.active||!oldOpen(x.active.id)||x.done.includes(x.active.id)||!stamp(x.active.end)||s.active||s.queue))throw Error('Invalid legacy solo practice');
  for(const [id,r] of Object.entries(x.concerts)){
   const a=legacyAlbums.find(a=>a.id===id);
   if(!a||!a.tracks.every(t=>x.done.includes(t.id))||!r||!stamp(r.at)||typeof r.restored!=='boolean'||r.serial!=='OS-'+id+'-'+r.at||!Array.isArray(r.tracks)||r.tracks.join('|')!==a.tracks.map(t=>t.id).join('|'))throw Error('Invalid legacy solo receipt');
  }
  const done=[];
  for(const a of soloAlbums){
   const old=legacyAlbums.find(v=>v.id===a.id),earned=old.tracks.filter(t=>x.done.includes(t.id));
   const kept=a.tracks.filter(t=>x.done.includes(t.id)).map(t=>t.id);
   let credit=earned.length-kept.length;
   for(const t of a.tracks)if(!kept.includes(t.id)&&(x.concerts[a.id]||credit>0)){kept.push(t.id);credit--;}
   done.push(...kept);
   if(x.concerts[a.id])x.concerts[a.id].tracks=a.tracks.map(t=>t.id);
  }
  // A changed catalog must not strand a paid practice on a removed song.
  if(x.active)s.points=Math.min(100,s.points+soloCost);
  x.done=done;x.active=null;x.catalogVersion=2;return s;
 }
 function loadSave(raw){const s=migrate(B.loadSave(raw));if(!ownValid(s))throw Error('Invalid solo save');return s;}
 function settle(s,now=Date.now()){
  let n=B.settle(s,now);const a=s.solo?.active;
  if(a&&now>=a.end){if(!s.solo.done.includes(a.id))s.solo.done.push(a.id);s.solo.active=null;n++;}
  return n;
 }
 function soloTrain(s,id,now=Date.now()){
  if(!stamp(now)||!soloOpen(s,id)||soloDone(s,id)||s.solo?.active||s.active||s.queue)return false;
  settle(s,now);if(s.points<soloCost)return false;
  if(s.points===100)s.energyAt=now;
  s.points-=soloCost;s.solo??={catalogVersion:2,done:[],active:null,concerts:{}};s.solo.active={id,end:now+soloSeconds*1000};return true;
 }
 function finishSoloConcert(s,id,now=Date.now()){
  if(!stamp(now)||!soloConcertReady(s,id)||s.solo.concerts[id])return false;
  s.solo.concerts[id]={at:now,serial:'OS-'+id+'-'+now,tracks:soloById(id).tracks.map(t=>t.id),restored:false};return true;
 }
 const trainAll=(s,...args)=>!s.solo?.active&&B.trainAll(s,...args);
 const train=(s,...args)=>!s.solo?.active&&B.train(s,...args);
 function restoreTicket(s,id,perm){if(!soloById(id))return B.restoreTicket(s,id,perm);const r=s.solo?.concerts[id];if(!r||r.restored||!Array.isArray(perm)||perm.length!==9||!perm.every((v,i)=>v===i))return false;r.restored=true;return true;}
 return {...B,soloAlbums,soloById,soloTrackById,soloUnlocked,soloOpen,soloDone,soloSeconds,soloCost,soloConcertReady,soloTrain,finishSoloConcert,trainAll,train,valid,loadSave,settle,restoreTicket};
};

},
"src/data/our-stage-solos.json":function(module,exports,__require){
module.exports=[{"id":"solo-br","member":"br","name":"이보람 솔로 콘서트","artist":"이보람","type":"SOLO CONCERT","style":"capsule-brother","colors":["#f6e2ec","#a55179"],"line":"한 곡씩 쌓아 온 마음, 이보람의 목소리로 만나는 무대.","band":"이보람 · 나의 목소리","tracks":[{"id":"solo-h28bQxTXKYs","title":"엎질러진 물처럼","album":"엎질러진 물처럼","youtubeId":"h28bQxTXKYs"},{"id":"solo-wBus8ecrRvs","title":"니가 보고 싶어","album":"니가 보고 싶어","youtubeId":"wBus8ecrRvs"},{"id":"solo-1Hk-bc4enn4","title":"술이 생각나는 밤","album":"술이 생각나는 밤","youtubeId":"1Hk-bc4enn4"},{"id":"solo-5nMVw8v_eF4","title":"사랑은 스쳐가는 바람인가요","album":"사랑은 스쳐가는 바람인가요","youtubeId":"5nMVw8v_eF4"},{"id":"solo-DMJ0rx41-Fc","title":"텅빈 거리","album":"텅빈 거리","youtubeId":"DMJ0rx41-Fc"},{"id":"solo-uHGopkuaC7w","title":"축가","album":"축가","youtubeId":"uHGopkuaC7w"},{"id":"solo-666dgFSDYvg","title":"찬바람이 부니까","album":"찬바람이 부니까","youtubeId":"666dgFSDYvg"},{"id":"solo-KncXz5s4UKU","title":"하얀 크리스마스","album":"하얀 크리스마스","youtubeId":"KncXz5s4UKU"},{"id":"solo-TsLpu5H-jMI","title":"너의 키스를","album":"너의 키스를","youtubeId":"TsLpu5H-jMI"},{"id":"solo-Bl9XgEl8jdw","title":"좋아보여","album":"좋아보여","youtubeId":"Bl9XgEl8jdw"},{"id":"solo-HHqJFGNNiKo","title":"그 때의 나, 그 때의 너","album":"그 때의 나, 그 때의 너","youtubeId":"HHqJFGNNiKo"},{"id":"solo-DujKGd4aA60","title":"이렇게 좋은날","album":"이렇게 좋은날","youtubeId":"DujKGd4aA60"},{"id":"solo-ppe9vyChKLs","title":"흩어지는 중","album":"흩어지는 중","youtubeId":"ppe9vyChKLs"},{"id":"solo-c6MlQvbbZw0","title":"한 밤의 꿈처럼","album":"한 밤의 꿈처럼","youtubeId":"c6MlQvbbZw0"},{"id":"solo-pwdQrpNpFyA","title":"너를 사랑하니까","album":"너를 사랑하니까","youtubeId":"pwdQrpNpFyA"},{"id":"solo-yjvTqgRzcXY","title":"빛의 반대편에서","album":"빛의 반대편에서","youtubeId":"yjvTqgRzcXY"}],"catalogVersion":2,"scopeNote":"개인 오리지널 솔로곡. 남규리의 그래도 좋아해요와 우리 사랑 그런 거 해요 Part.2 포함."},{"id":"solo-gr","member":"gr","name":"남규리 솔로 콘서트","artist":"남규리","type":"SOLO CONCERT","style":"capsule-sorrow","colors":["#fae9d9","#a56b43"],"line":"오래 간직한 이야기, 남규리의 목소리로 건네는 인사.","band":"남규리 · 나의 목소리","tracks":[{"id":"solo-xHB6Pn5rNxo","title":"그 남자","album":"그 남자","youtubeId":"xHB6Pn5rNxo"},{"id":"solo-cjuv_qVAgRA","title":"HALO","album":"기적:奇跡","youtubeId":"cjuv_qVAgRA"},{"id":"solo-Mjl8tBDX5Ik","title":"고백하는 거 맞아","album":"고백하는 거 맞아","youtubeId":"Mjl8tBDX5Ik"},{"id":"solo-siyf1bcO5Gc","title":"그래도 좋아해요","album":"그래도 좋아해요","youtubeId":"siyf1bcO5Gc"},{"id":"solo-9klPsmjNPDw","title":"December Dream","album":"December Dream","youtubeId":"9klPsmjNPDw"},{"id":"solo-VGi-Jh4xB3o","title":"삼겹살송","album":"삼겹살송","youtubeId":"VGi-Jh4xB3o"},{"id":"solo-06MOxzzMPvI","title":"우리 사랑 그런 거 해요 Part.1","album":"우리 사랑 그런 거 해요","youtubeId":"06MOxzzMPvI"},{"id":"solo-DFBk5oSn72Y","title":"우리 사랑 그런 거 해요 Part.2 (feat. KoN)","album":"우리 사랑 그런 거 해요","youtubeId":"DFBk5oSn72Y"}],"catalogVersion":2,"scopeNote":"개인 오리지널 솔로곡. 남규리의 그래도 좋아해요와 우리 사랑 그런 거 해요 Part.2 포함."},{"id":"solo-yj","member":"yj","name":"김연지 솔로 콘서트","artist":"김연지","type":"SOLO CONCERT","style":"capsule-wind","colors":["#e4e4f7","#6662a3"],"line":"마음을 채우는 울림, 김연지의 목소리로 이어지는 밤.","band":"김연지 · 나의 목소리","tracks":[{"id":"solo-8UAxgcnvk2E","title":"잊었니","album":"잊었니","youtubeId":"8UAxgcnvk2E"},{"id":"solo-mZttjZ9KsQA","title":"어쩌다","album":"어쩌다","youtubeId":"mZttjZ9KsQA"},{"id":"solo-_lTZCnkpoyQ","title":"10년이나 버티니","album":"10년이나 버티니","youtubeId":"_lTZCnkpoyQ"},{"id":"solo-lOvBRahMvtQ","title":"바람이 불면","album":"바람이 불면","youtubeId":"lOvBRahMvtQ"},{"id":"solo-1nBWqLheBGI","title":"안부","album":"안부","youtubeId":"1nBWqLheBGI"},{"id":"solo-pZ7RisNx0bo","title":"그래, 너야","album":"그래, 너야","youtubeId":"pZ7RisNx0bo"},{"id":"solo-JIpU0HXvc_E","title":"노래","album":"노래","youtubeId":"JIpU0HXvc_E"}],"catalogVersion":2,"scopeNote":"개인 오리지널 솔로곡. 남규리의 그래도 좋아해요와 우리 사랑 그런 거 해요 Part.2 포함."}];
},
"src/data/our-stage-solos-v1.json":function(module,exports,__require){
module.exports=[{"id":"solo-br","member":"br","name":"이보람 솔로 콘서트","artist":"이보람","type":"SOLO CONCERT","style":"capsule-brother","colors":["#f6e2ec","#a55179"],"line":"한 곡씩 쌓아 온 마음, 이보람의 목소리로 만나는 무대.","band":"이보람 · 나의 목소리","tracks":[{"id":"solo-ppe9vyChKLs","title":"흩어지는 중","album":"흩어지는 중","youtubeId":"ppe9vyChKLs"},{"id":"solo-2WyOq7IMEnc","title":"처음 그 자리에","album":"풀하우스 OST","youtubeId":"2WyOq7IMEnc"},{"id":"solo-L5Cn7BpkEeQ","title":"FREAK (Korean Version)","album":"하이에나 OST · Korean Version","youtubeId":"L5Cn7BpkEeQ"},{"id":"solo-yjvTqgRzcXY","title":"빛의 반대편에서","album":"빛의 반대편에서","youtubeId":"yjvTqgRzcXY"},{"id":"solo-7VGw30BGkyw","title":"매일 이렇게 비가 내려","album":"IONY의 오선지 : Project #01","youtubeId":"7VGw30BGkyw"},{"id":"solo-pwdQrpNpFyA","title":"너를 사랑하니까","album":"너를 사랑하니까","youtubeId":"pwdQrpNpFyA"},{"id":"solo-oukYixC1ldo","title":"형 (兄)","album":"형 (兄)","youtubeId":"oukYixC1ldo"},{"id":"solo-c6MlQvbbZw0","title":"한 밤의 꿈처럼","album":"한 밤의 꿈처럼","youtubeId":"c6MlQvbbZw0"},{"id":"solo-q4jtpVDemFE","title":"사랑하니까","album":"너를 사랑하니까","youtubeId":"q4jtpVDemFE"},{"id":"solo-DujKGd4aA60","title":"이렇게 좋은날","album":"이렇게 좋은날","youtubeId":"DujKGd4aA60"}]},{"id":"solo-gr","member":"gr","name":"남규리 솔로 콘서트","artist":"남규리","type":"SOLO CONCERT","style":"capsule-sorrow","colors":["#fae9d9","#a56b43"],"line":"오래 간직한 이야기, 남규리의 목소리로 건네는 인사.","band":"남규리 · 나의 목소리","tracks":[{"id":"solo-xHB6Pn5rNxo","title":"그 남자","album":"그 남자","youtubeId":"xHB6Pn5rNxo"},{"id":"solo-MiUAHBTO55g","title":"남자","album":"고사: 피의 중간고사 OST","youtubeId":"MiUAHBTO55g"},{"id":"solo-Sn7YYiXgQ6Y","title":"깊은 밤을 날아서","album":"California Dream · 못말리는 결혼 OST","youtubeId":"Sn7YYiXgQ6Y"},{"id":"solo-cjuv_qVAgRA","title":"HALO","album":"기적:奇跡","youtubeId":"cjuv_qVAgRA"},{"id":"solo-siyf1bcO5Gc","title":"그래도 좋아해요","album":"그래도 좋아해요","youtubeId":"siyf1bcO5Gc"},{"id":"solo-9klPsmjNPDw","title":"December Dream","album":"December Dream","youtubeId":"9klPsmjNPDw"},{"id":"solo-nN7NV5FBhBw","title":"슬픔이 찾아와서 그래","album":"슬픔이 찾아와서 그래","youtubeId":"nN7NV5FBhBw"},{"id":"solo-5USUHmWpPcg","title":"가슴앓이","album":"기억","youtubeId":"5USUHmWpPcg"},{"id":"solo-Mjl8tBDX5Ik","title":"고백하는 거 맞아","album":"고백하는 거 맞아","youtubeId":"Mjl8tBDX5Ik"},{"id":"solo-06MOxzzMPvI","title":"우리 사랑 그런 거 해요 Part.1","album":"우리 사랑 그런 거 해요 Part.1","youtubeId":"06MOxzzMPvI"},{"id":"solo-DFBk5oSn72Y","title":"우리 사랑 그런 거 해요 Part.2 (feat. KoN)","album":"우리 사랑 그런 거 해요 Part.2 (feat. KoN)","youtubeId":"DFBk5oSn72Y"},{"id":"solo-gwanaksan","title":"관악산","album":"부를텐데 · 공개 자작곡","youtubeId":"pXHDS6tqN5Q"}]},{"id":"solo-yj","member":"yj","name":"김연지 솔로 콘서트","artist":"김연지","type":"SOLO CONCERT","style":"capsule-wind","colors":["#e4e4f7","#6662a3"],"line":"마음을 채우는 울림, 김연지의 목소리로 이어지는 밤.","band":"김연지 · 나의 목소리","tracks":[{"id":"solo-8UAxgcnvk2E","title":"잊었니","album":"잊었니","youtubeId":"8UAxgcnvk2E"},{"id":"solo-lOvBRahMvtQ","title":"바람이 불면","album":"바람이 불면","youtubeId":"lOvBRahMvtQ"},{"id":"solo-_FJkNLkV82U","title":"내 맘","album":"내 맘","youtubeId":"_FJkNLkV82U"},{"id":"solo-JIpU0HXvc_E","title":"노래","album":"미친 사랑의 노래","youtubeId":"JIpU0HXvc_E"},{"id":"solo-Uko7Y-Tfj-8","title":"당신은 천사와 커피를 마셔본 적이 있습니까","album":"당신은 천사와 커피를 마셔본 적이 있습니까 (청설 X 김연지)","youtubeId":"Uko7Y-Tfj-8"},{"id":"solo-arm2c6NH9vg","title":"비가 오면 마음껏 울어도 되니까","album":"비가 오면 마음껏 울어도 되니까","youtubeId":"arm2c6NH9vg"},{"id":"solo-gwRkvYc59_s","title":"사랑의 인사","album":"사랑의 인사","youtubeId":"gwRkvYc59_s"},{"id":"solo-atp-TU4Xezs","title":"가슴으로 운다","album":"가슴으로 운다","youtubeId":"atp-TU4Xezs"},{"id":"solo-8k-YrZ5Gg2g","title":"빨간풍선","album":"빨간풍선 OST Part.1","youtubeId":"8k-YrZ5Gg2g"},{"id":"solo-7h3ndp05JN0","title":"Whisky on the Rock","album":"우리들의 블루스 OST Part 1","youtubeId":"7h3ndp05JN0"},{"id":"solo-_lTZCnkpoyQ","title":"10년이나 버티니","album":"10년이나 버티니","youtubeId":"_lTZCnkpoyQ"},{"id":"solo-PHQbDyffSTw","title":"계절사이","album":"군주 - 가면의 주인 (MBC 수목드라마) OST - Part.5","youtubeId":"PHQbDyffSTw"},{"id":"solo-6yrrTYk4sMs","title":"너만 있으면 다였는데","album":"너만 있으면 다였는데.. - RBW 아티스트 다이어리 시즌2","youtubeId":"6yrrTYk4sMs"}]}];
},
"src/shared/our-stage-drive.js":function(module,exports,__require){
'use strict';
const duration=30000,limit=2,reward=10;
const difficulties={
 easy:{name:'쉬움',reward:8,description:'천천히, 여유롭게',speed:.14,gain:.05,earlyGap:2300,gap:1950,doubleAfter:16000,doubleChance:.2},
 normal:{name:'보통',reward:10,description:'익숙한 속도로',speed:.18,gain:.07,earlyGap:1900,gap:1500,doubleAfter:9000,doubleChance:.45},
 hard:{name:'어려움',reward:12,description:'빠르게, 연속해서',speed:.23,gain:.08,earlyGap:1600,gap:1250,doubleAfter:5000,doubleChance:.65}
};
const hasDifficulty=id=>Object.hasOwn(difficulties,id);
const difficultyOf=r=>r.difficulty===undefined?'normal':r.difficulty;
const winsValid=s=>s.wins===undefined?s.earned===s.paid*reward:!!s.wins&&Object.keys(s.wins).length===3&&Object.keys(difficulties).every(k=>Number.isSafeInteger(s.wins[k])&&s.wins[k]>=0)&&Object.values(s.wins).reduce((a,b)=>a+b,0)===s.paid&&Object.entries(difficulties).reduce((n,[k,d])=>n+s.wins[k]*d.reward,0)===s.earned;
const day=n=>new Date(n+32400000).toISOString().slice(0,10);
const time=n=>Number.isSafeInteger(n)&&n>=0&&n<253402200000000;
const fresh=()=>({day:null,count:0,earned:0,paid:0,serial:0,active:null,wins:{easy:0,normal:0,hard:0}});
const remaining=(s,now=Date.now())=>s.day&&day(now)<s.day?0:limit-(s.day===day(now)?s.count:0);
function valid(s){return !!s&&Number.isSafeInteger(s.serial)&&s.serial>=0&&s.serial<=1000000&&Number.isSafeInteger(s.paid)&&s.paid>=0&&s.paid<=s.serial&&winsValid(s)&&Number.isInteger(s.count)&&s.count>=0&&s.count<=limit&&s.count<=s.paid&&(s.day===null?s.count===0&&s.paid===0:typeof s.day==='string'&&/^\d{4}-\d{2}-\d{2}$/.test(s.day)&&Number.isFinite(Date.parse(s.day))&&new Date(s.day).toISOString().slice(0,10)===s.day)&&(s.active===null||!!s.active&&s.active.id===s.serial&&time(s.active.started)&&hasDifficulty(difficultyOf(s.active)));}
function start(s,now=Date.now(),difficulty='normal'){
 if(!valid(s)||!time(now)||s.serial>=1000000||!hasDifficulty(difficulty))return null;
 // Older saves earned 10 coins per win; preserve those wins and their daily count.
 if(s.wins===undefined)s.wins={easy:0,normal:s.paid,hard:0};
 s.active={id:++s.serial,started:now,difficulty};return {...s.active};
}
function finish(s,run,now=Date.now()){
 if(!valid(s)||!s.active||!run||run.id!==s.active.id||difficultyOf(run)!==difficultyOf(s.active)||!run.done||!time(now))return null;
 const difficulty=difficultyOf(s.active),amount=difficulties[difficulty].reward;
 if(s.wins===undefined)s.wins={easy:0,normal:s.paid,hard:0};
 const eligible=run.elapsed>=duration&&run.hits<2&&now-s.active.started>=duration;
 s.active=null;
 let coins=0;
 if(eligible&&remaining(s,now)>0){if(s.day!==day(now)){s.day=day(now);s.count=0;}s.count++;s.paid++;s.wins[difficulty]++;s.earned+=amount;coins=amount;}
 return {success:eligible,coins,difficulty,remaining:remaining(s,now)};
}
const patterns=['weave','convoy','mixed'];
function mixSeed(seed){let n=seed>>>0;n=Math.imul(n^(n>>>16),0x7feb352d);n=Math.imul(n^(n>>>15),0x846ca68b);return (n^(n>>>16))>>>0;}
function create(id,seed=Date.now(),difficulty='normal',previousPattern=null){
 if(!hasDifficulty(difficulty))throw Error('Invalid drive difficulty');
 const r={id,difficulty,seed:mixSeed(seed),elapsed:0,lane:1,x:1,hits:0,immune:0,next:1000,rows:[],done:false,passed:0,wave:0,lastSafe:null,hold:0};
 const pool=patterns.filter(p=>p!==previousPattern);
 r.pattern=pool[Math.floor(random(r)*pool.length)];r.direction=random(r)<.5?-1:1;r.phase=Math.floor(random(r)*4);
 r.next=800+Math.floor(random(r)*500);return r;
}
function nextSafe(r){
 let safe;
 if(r.pattern==='weave'){
  // Sweep the open lane left/centre/right, with a random phase and mirrored start.
  const sequence=[0,1,2,1];safe=sequence[(r.wave+r.phase)%4];if(r.direction<0)safe=2-safe;
 }else if(r.pattern==='convoy'){
  // Short clusters of traffic leave one edge open, then switch to another corridor.
  if(r.hold<=0){const choices=[0,1,2].filter(l=>l!==r.lastSafe);r.lastSafe=choices[Math.floor(random(r)*choices.length)];r.hold=2+Math.floor(random(r)*2);}
  safe=r.lastSafe;r.hold--;
 }else{
  const choices=[0,1,2].filter(l=>l!==r.lastSafe);safe=choices[Math.floor(random(r)*choices.length)];
 }
 r.lastSafe=safe;r.wave++;return safe;
}
function random(r){r.seed=(Math.imul(r.seed,1664525)+1013904223)>>>0;return r.seed/4294967296;}
function move(r,direction){if(!r.done)r.lane=Math.max(0,Math.min(2,r.lane+Math.sign(direction)));}
function advance(r,ms){
 if(r.done)return r;
 const dt=Math.max(0,Math.min(50,ms));
 r.elapsed=Math.min(duration,r.elapsed+dt);r.immune=Math.max(0,r.immune-dt);
 r.x+=Math.sign(r.lane-r.x)*Math.min(Math.abs(r.lane-r.x),dt/150);
 const level=difficulties[difficultyOf(r)],speed=level.speed+level.gain*Math.min(1,r.elapsed/duration);
 for(const car of r.rows){car.y+=dt*speed;
  if(!car.hit&&car.y>341&&car.y<421&&Math.abs(car.lane-r.x)<.62&&r.immune<=0){car.hit=true;r.hits++;r.immune=1400;}
 }
 r.rows=r.rows.filter(c=>c.y<520);
 if(r.elapsed>=r.next&&r.elapsed<duration-2200){
  const safe=nextSafe(r),lanes=[0,1,2].filter(l=>l!==safe);
  const occupied=r.elapsed<level.doubleAfter?[lanes[Math.floor(random(r)*2)]]:random(r)<level.doubleChance?lanes:[lanes[Math.floor(random(r)*2)]];
  occupied.forEach(lane=>r.rows.push({lane,y:-72,color:Math.floor(random(r)*4),hit:false}));
  // Bounded timing variation keeps successive rows far enough apart to change lanes.
  r.next=r.elapsed+(r.elapsed<5000?level.earlyGap:level.gap)*(.95+random(r)*.2);
 }
 r.done=r.hits>=2||r.elapsed>=duration;
 return r;
}
module.exports={duration,limit,reward,difficulties,patterns,day,fresh,valid,remaining,start,finish,create,move,advance};

},
"src/shared/our-stage-stage-shop.js":function(module,exports,__require){
'use strict';
const items=[
 {id:'hall',slot:'background',name:'작은 라이브홀',price:80,description:'와인빛 커튼과 원목 바닥, 가까이서 만나는 세 목소리.'},
 {id:'showcase',slot:'background',name:'연습실 쇼케이스',price:60,description:'거울 벽과 따뜻한 조명 아래 여는 작은 공연.'},
 {id:'rooftop',slot:'background',name:'야외 밤무대',price:120,description:'도시의 밤을 뒤로하고 펼치는 옥상 라이브.'},
 {id:'petals',slot:'effect',name:'꽃잎',price:45,description:'분홍 꽃잎이 무대 위로 천천히 흩날려요.'},
 {id:'confetti',slot:'effect',name:'색종이',price:60,description:'작은 색종이가 축하 인사처럼 내려와요.'},
 {id:'starlight',slot:'effect',name:'별빛',price:50,description:'무대 뒤편에 작은 별빛이 은은하게 반짝여요.'},
 {id:'balloons',slot:'audience',name:'분홍 풍선 객석',price:50,description:'작은 분홍 풍선들이 높낮이를 달리하며 객석을 가득 채워요.'},
 {id:'phone-lights',slot:'audience',name:'휴대폰 라이트 객석',price:50,description:'객석 곳곳에서 켠 하얀 휴대폰 라이트가 잔잔하게 반짝여요.'},
 {id:'banner',slot:'audience',name:'도트 응원 플래카드',price:60,description:'보람·규리·연지와 씨야를 응원하는 작은 손팻말 네 개.'}
];
const slots={background:'배경',effect:'무대 효과',audience:'관객석'},byId=id=>items.find(i=>i.id===id);
const fresh=()=>({owned:[],equipped:{background:null,effect:null,audience:null}});
function valid(d){return !!d&&Array.isArray(d.owned)&&new Set(d.owned).size===d.owned.length&&d.owned.every(id=>byId(id))&&!!d.equipped&&typeof d.equipped==='object'&&!Array.isArray(d.equipped)&&Object.keys(d.equipped).length===3&&Object.keys(slots).every(slot=>d.equipped[slot]===null||d.owned.includes(d.equipped[slot])&&byId(d.equipped[slot])?.slot===slot);}
const spent=d=>d.owned.reduce((n,id)=>n+(byId(id)?.price||0),0);
function migrate(d){
 // Refund retired props by removing their purchase deductions, once and idempotently.
 if(!d?.equipped)return d;
 if(!Object.hasOwn(d.equipped,'prop')){
  const e=d.equipped;
  if(Object.keys(e).length===2&&Object.hasOwn(e,'background')&&Object.hasOwn(e,'audience'))return {...d,equipped:{...e,effect:null}};
  return d;
 }
 const retired=['mic','speakers','flowers'],e=d.equipped;
 if(!Array.isArray(d.owned)||new Set(d.owned).size!==d.owned.length||d.owned.some(id=>!byId(id)&&!retired.includes(id))||Object.keys(e).length!==3||!(e.prop===null||retired.includes(e.prop)&&d.owned.includes(e.prop)))throw Error('Invalid retired props');
 const next={...d,owned:d.owned.filter(id=>!retired.includes(id)),equipped:{background:e.background,effect:null,audience:e.audience}};
 if(!valid(next))throw Error('Invalid stage decorations');return next;
}
module.exports={items,slots,byId,fresh,valid,spent,migrate};

},
"src/shared/our-stage-play.js":function(module,exports,__require){
'use strict';
const bank=__require("src/shared/our-stage-play-bank.js"),pick=__require("src/shared/our-stage-style-pick.js");
module.exports=function(M){
 const cooldown=M.timing.testMode?10000:900000,limit=6;
 const games=[{id:'quiz',name:'씨야 활동 퀴즈',description:'무대와 이야기 속 순간을 떠올려요.',detail:'3문제 · 모두 맞히면 20코인',icon:'?'},{id:'pairs',name:'멤버 스타일 짝 맞추기',description:'앨범의 헤어와 의상을 섞어 매번 새로운 조합.',detail:'16장 · 8쌍 · 최대 20코인',icon:'♡'},{id:'jigsaw',name:'이야기 그림 맞추기',description:'두 조각을 눌러 추억의 그림을 완성해요.',detail:'4 × 4 · 최대 20코인',icon:'▦'}];
 const fresh=(old={})=>({day:old.day||null,plays:old.plays||0,total:0,earned:0,next:{quiz:old.next?.quiz||0,pairs:old.next?.pairs||0,jigsaw:0},recent:[],active:null});
 const time=n=>Number.isSafeInteger(n)&&n>=0&&n<253402200000000;
 const day=n=>new Date(n+32400000).toISOString().slice(0,10);
 const used=(m,now)=>!m.day||day(now)>m.day?0:m.plays;
 const wait=(m,kind,now)=>Math.max(0,m.next[kind]-now);
 const shuffle=(a,r=Math.random)=>{a=[...a];for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.max(0,Math.min(.999999,Number(r())||0))*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;};
 const cardPool=s=>{
  const albums=[...['practice','base'],...M.albums.filter(a=>M.albumUnlocked(s,a.id)).map(a=>a.id)].map(id=>({id,name:id==='practice'?'연습복':id==='base'?'20주년':M.albumById(id).name}));
  return [...albums,...M.shop,...M.capsuleOutfits].flatMap(o=>M.memberIds.filter(member=>albums.includes(o)||M.styleOwned(s,o.id,member)).flatMap(member=>['hair','clothes'].map(part=>({id:o.id+':'+member+(part==='clothes'?':clothes':''),style:o.id,member,part,label:o.name}))));
 };
 const stories=s=>M.storyEntries.filter(e=>M.storyDone(s,e.id)&&e.image);
 const questionPool=s=>bank.filter(q=>M.albumUnlocked(s,q.album));
 const available=(s,kind)=>kind!=='jigsaw'||stories(s).length>0;
 function canStart(s,kind,now){const m=s.leisure.play;return time(now)&&time(now+cooldown)&&s.simple.debuted&&games.some(g=>g.id===kind)&&available(s,kind)&&!m.active&&!s.mini.active&&(!m.day||day(now)>=m.day)&&used(m,now)<limit&&!wait(m,kind,now)&&m.total<1000000;}
 function start(s,kind,now,random=Math.random){if(!canStart(s,kind,now))return false;const m=s.leisure.play;let a={id:kind+':'+now,kind,started:now};
 if(kind==='quiz'){const pool=questionPool(s),unused=pool.filter(q=>!m.recent.includes(q.id));const qs=shuffle(unused.length>=3?unused:pool,random).slice(0,3);if(qs.length<3)return false;a.questions=qs.map(q=>({id:q.id,order:shuffle(q.choices.map((_,i)=>i),random)}));a.answers=[];m.recent=[...qs.map(q=>q.id),...m.recent.filter(id=>!qs.some(q=>q.id===id))].slice(0,9);}
 if(kind==='pairs'){const cards=pick(cardPool(s),8,random);if(cards.length<8)return false;a.deck=shuffle(cards.flatMap(c=>[c.id,c.id]),random);a.history=[];a.open=null;a.reveal=null;a.hideAt=0;}
 if(kind==='jigsaw'){const list=stories(s).sort((a,b)=>a.id.localeCompare(b.id)),hash=[...day(now)].reduce((n,c)=>(n*31+c.charCodeAt(0))>>>0,0);a.story=list[hash%list.length].id;a.perm=shuffle(Array.from({length:16},(_,i)=>i),random);if(a.perm.filter((n,i)=>n===i).length>=5)a.perm=a.perm.map((_,i)=> (i+5)%16);a.swaps=0;}
 if(m.day!==day(now)){m.day=day(now);m.plays=0;}m.plays++;m.total++;m.next[kind]=now+cooldown;m.active=a;return a.id;
 }
 const question=a=>a?.kind==='quiz'?bank.find(q=>q.id===a.questions[a.answers.length]?.id):null;
 function answer(m,id,position){const a=m.active,q=question(a);if(!q||a.id!==id||!Number.isInteger(position)||position<0||position>=q.choices.length)return false;a.answers.push(a.questions[a.answers.length].order[position]);return true;}
 function progress(a){const matched=new Set();let combo=0,maxCombo=0;for(const [x,y]of a.history){if(a.deck[x]===a.deck[y]){matched.add(x);matched.add(y);maxCombo=Math.max(maxCombo,++combo);}else combo=0;}return {matched,combo,maxCombo,turns:a.history.length,pairs:matched.size/2,done:matched.size===16||a.history.length>=200};}
 function settle(m,now){const a=m.active;if(a?.kind==='pairs'&&a.reveal&&now>=a.hideAt){a.reveal=null;a.hideAt=0;return true;}return false;}
 function flip(m,id,i,now){const a=m.active;if(a?.kind!=='pairs'||a.id!==id||!Number.isInteger(i)||i<0||i>=16||!time(now)||now<a.started)return false;settle(m,now);const p=progress(a);if(p.done||a.reveal||p.matched.has(i)||a.open===i)return false;if(a.open===null){a.open=i;return true;}const first=a.open;a.open=null;a.history.push([first,i]);if(a.deck[first]!==a.deck[i]){a.reveal=[first,i];a.hideAt=now+850;}return true;}
 function swap(m,id,i,j){const a=m.active;if(a?.kind!=='jigsaw'||a.id!==id||![i,j].every(n=>Number.isInteger(n)&&n>=0&&n<16)||i===j||a.swaps>=10000||a.perm.every((n,k)=>n===k))return false;[a.perm[i],a.perm[j]]=[a.perm[j],a.perm[i]];a.swaps++;return true;}
 function finish(m,id){const a=m.active;if(!a||a.id!==id)return null;let result;
 if(a.kind==='quiz'){if(a.answers.length!==3)return null;const correct=a.answers.reduce((n,v,i)=>n+(v===bank.find(q=>q.id===a.questions[i].id).answer?1:0),0);result={kind:a.kind,correct,total:3,reward:correct*5+(correct===3?5:0)};}
 if(a.kind==='pairs'){const p=progress(a);if(!p.done)return null;result={kind:a.kind,correct:p.pairs,total:8,reward:Math.min(20,Math.floor(p.pairs*1.5*(1+p.maxCombo*.05))+(p.turns===8?4:0)),turns:p.turns,combo:p.maxCombo};}
 if(a.kind==='jigsaw'){if(!a.perm.every((n,i)=>n===i))return null;result={kind:a.kind,correct:16,total:16,reward:a.swaps<=24?20:a.swaps<=36?15:10,story:a.story,swaps:a.swaps};}
 if(!result)return null;m.earned+=result.reward;m.active=null;return result;
 }
 const permutation=(a,n)=>Array.isArray(a)&&a.length===n&&new Set(a).size===n&&a.every(v=>Number.isInteger(v)&&v>=0&&v<n);
 function valid(m,s){try{
 if(!m||!Number.isSafeInteger(m.earned)||m.earned<0||m.earned>m.total*20||!Number.isSafeInteger(m.total)||m.total<0||m.total>1000000||!Number.isInteger(m.plays)||m.plays<0||m.plays>6||!m.next||!games.every(g=>time(m.next[g.id]))||!Array.isArray(m.recent)||m.recent.length>9||new Set(m.recent).size!==m.recent.length||!m.recent.every(id=>bank.some(q=>q.id===id)))return false;
 if(m.day===null?m.plays!==0:typeof m.day!=='string'||!/^\d{4}-\d{2}-\d{2}$/.test(m.day)||!Number.isFinite(Date.parse(m.day))||new Date(m.day).toISOString().slice(0,10)!==m.day)return false;
 const a=m.active;if(a===null)return true;if(!a||!games.some(g=>g.id===a.kind)||!time(a.started)||a.id!==a.kind+':'+a.started||m.plays<1||m.total<1||m.next[a.kind]!==a.started+cooldown||m.day!==day(a.started))return false;
 if(a.kind==='quiz')return Array.isArray(a.questions)&&a.questions.length===3&&new Set(a.questions.map(q=>q.id)).size===3&&a.questions.every(q=>questionPool(s).some(x=>x.id===q.id)&&permutation(q.order,bank.find(x=>x.id===q.id).choices.length))&&Array.isArray(a.answers)&&a.answers.length<=3&&a.answers.every((v,i)=>a.questions[i].order.includes(v));
 if(a.kind==='jigsaw')return stories(s).some(e=>e.id===a.story)&&permutation(a.perm,16)&&Number.isInteger(a.swaps)&&a.swaps>=0&&a.swaps<=10000;
 const index=n=>Number.isInteger(n)&&n>=0&&n<16,pool=cardPool(s);if(!Array.isArray(a.deck)||a.deck.length!==16||new Set(a.deck).size!==8||!a.deck.every(id=>pool.some(c=>c.id===id)&&a.deck.filter(x=>x===id).length===2)||!Array.isArray(a.history)||a.history.length>200)return false;
 const matched=new Set();for(const p of a.history){if(!Array.isArray(p)||p.length!==2||!p.every(index)||p[0]===p[1]||p.some(i=>matched.has(i)))return false;if(a.deck[p[0]]===a.deck[p[1]])p.forEach(i=>matched.add(i));}
 if(a.open!==null&&(!index(a.open)||matched.has(a.open)))return false;
 if(a.reveal!==null){const p=a.history.at(-1);if(a.open!==null||!Array.isArray(a.reveal)||a.reveal.length!==2||!a.reveal.every((v,i)=>v===p?.[i])||a.deck[p[0]]===a.deck[p[1]]||!time(a.hideAt)||a.hideAt<a.started)return false;}else if(a.hideAt!==0)return false;return true;
 }catch{return false;}}
 return {bank,games,limit,cooldown,fresh,used,wait,start,canStart,available,question,answer,cardPool,stories,progress,flip,settle,swap,finish,valid};
};

},
"src/shared/our-stage-play-bank.js":function(module,exports,__require){
'use strict';
const original=__require("src/data/our-stage-activity-quiz.json"),stories=__require("src/data/our-stage-stories.json");
const bank=Object.entries(original).map(([id,q])=>({id,...q}));
for(const e of stories.filter(e=>['chapter-california','chapter-first-again','event-boram-nightingale','event-yeonji-return','event-gyulmung','event-rebloom-fanmeeting','event-the-fan-tour'].includes(e.id))){const q=e.quiz;bank.push({id:'memory:'+e.id,album:e.album,question:q.question,choices:[q.correct,...q.wrong],answer:0,explanation:q.explanation,source:e.source});}
const extra=[
 ['chapter-california','California Dream 재킷 촬영지로 소개된 두 도시는?','LA와 라스베가스','파리와 런던','도쿄와 오사카'],
 ['chapter-california','California Dream에 모인 이보람의 OST는 어느 드라마와 연결되나요?','풀하우스','49일','카이로스'],
 ['chapter-california','California Dream에 담긴 협업에서 김연지와 함께 노래한 가수는?','제아','아이유','태연'],
 ['chapter-brilliant','Hot Girl 활동 당시 씨야가 새롭게 보여 주고 싶었다고 밝힌 것은?','다른 장르와 춤','악기 연주만 하는 무대','멤버 없는 무대'],
 ['chapter-again','See You Again에 새 곡으로 함께 담긴 두 제목은?','내겐 너무 멋진 그대 · The Last','Stay · 잔향','Hot Girl · Turn It Up'],
 ['chapter-first-again','First, Again 앨범 소개에서 세 멤버가 참여한 작업은?','작사·작곡','뮤지컬 번역','영화 각본'],
 ['event-yeonji-gasoline','불광동 휘발유가 가왕에 오를 때 맞붙었던 가왕은?','흑기사','걸리버','나이팅게일'],
 ['event-boram-nightingale','나이팅게일이 처음 가왕에 올랐을 때 꺾은 가왕은?','걸리버','흑기사','불광동 휘발유'],
 ['event-boram-nightingale','나이팅게일이 지킨 가왕의 대수는?','103대부터 105대','35대부터 37대','1대부터 3대'],
 ['event-rebloom-fanmeeting','재결합 팬미팅 RE:BLOOM이 열린 서울의 장소는?','종로구 이들스(EDLS)','올림픽주경기장','고척스카이돔'],
 ['event-the-fan-tour','20주년 THE FAN 전국투어의 마지막 도시는?','인천','서울','부산'],
 ['event-the-fan-tour','20주년 THE FAN 전국투어가 이어진 도시 수는?','일곱 도시','세 도시','열두 도시']
];
extra.filter((_,i)=>i>=6).forEach(([id,question,...choices],i)=>{const e=stories.find(e=>e.id===id);bank.push({id:'detail:'+i,album:e.album,question,choices,answer:0,explanation:e.body[0]+(id==='chapter-california'?' '+e.body[1]:''),source:e.source});});
module.exports=bank;

},
"src/data/our-stage-activity-quiz.json":function(module,exports,__require){
module.exports={"song:activity-debut-team":{"question":"씨야의 데뷔곡을 소개하는 라디오 DJ라면, 어떤 곡을 틀어야 할까요?","choices":["여인의 향기","사랑의 인사","Hot Girl"],"answer":0,"explanation":"씨야는 2006년 1집 The First Mind의 여인의 향기로 데뷔했습니다.","source":"https://www.melon.com/album/detail.htm?albumId=314286","album":"first-mind"},"song:activity-debut-duet":{"question":"1집 녹음실에 함께한 피처링 팀! 사랑하기 때문에에 참여한 팀은?","choices":["브라운 아이드 소울","V.O.S","SG워너비"],"answer":2,"explanation":"사랑하기 때문에에는 SG워너비가 피처링했습니다.","source":"https://www.melon.com/album/detail.htm?albumId=314286","album":"first-mind"},"song:activity-debut-rookie":{"question":"데뷔 첫해의 트로피를 전시한다면? 2006년 골든디스크에서 받은 상은?","choices":["대상","신인상","디지털 음원 본상"],"answer":1,"explanation":"씨야는 2006년 골든디스크에서 신인상을 받았습니다.","source":"https://www.nocutnews.co.kr/news/224195","album":"first-mind"},"song:activity-debut-ost":{"question":"2006년 MKMF 시상식, 씨야의 이름이 불린 부문은?","choices":["최우수 OST상","최우수 댄스상","최우수 록상"],"answer":0,"explanation":"씨야는 2006년 Mnet KM 뮤직 페스티벌에서 최우수 OST상을 받았습니다.","source":"https://www.starnewskorea.com/music/2006/11/25/2006112518150646752","album":"first-mind"},"song:activity-copyright":{"question":"2007년 씨야가 창작의 가치를 알리며 맡은 홍보대사 활동은?","choices":["관광 홍보","환경 보호 홍보","저작권 홍보"],"answer":2,"explanation":"문화관광부는 2007년 6월 27일 씨야 등을 저작권 홍보대사로 위촉한다고 발표했습니다.","source":"https://www.mcst.go.kr/site/s_notice/press/pressView.jsp?pSeq=8766","album":"lovely-sweet-heart"},"song:activity-netiquette":{"question":"2집 활동기, 씨야가 네티켓 홍보대사로 알리려 한 것은?","choices":["교통안전 수칙","올바른 인터넷 이용 문화","공연장 좌석 예절"],"answer":1,"explanation":"씨야는 2007년 9월 18일 정보통신윤리 홍보대사 위촉패를 받았습니다.","source":"https://m.etnews.com/200709180162","album":"lovely-sweet-heart"},"song:activity-digital":{"question":"신인상을 받은 다음 해, 씨야가 골든디스크에서 받은 상은?","choices":["디지털 음원 부문 본상","음반 대상","인기상"],"answer":0,"explanation":"씨야는 2007년 골든디스크에서 디지털 음원 본상을 받았습니다.","source":"https://www.osen.co.kr/article/G0712140129","album":"lovely-sweet-heart"},"song:activity-california-ost":{"question":"California Dream에서 다시 만나는 이보람의 OST는 어느 드라마의 노래일까요?","choices":["궁","커피프린스 1호점","풀하우스"],"answer":2,"explanation":"이보람의 풀하우스 OST 처음 그 자리에가 California Dream에도 담겼습니다.","source":"https://www.melon.com/album/detail.htm?albumId=362767","album":"california-dream"},"song:activity-california-duet":{"question":"California Dream에 담긴 김연지의 협업 상대는?","choices":["나르샤","제아","가인"],"answer":1,"explanation":"김연지는 제아와 함께 부른 노래로 California Dream에 참여했습니다.","source":"https://www.melon.com/album/detail.htm?albumId=362767","album":"california-dream"},"song:activity-california-jacket":{"question":"California Dream 재킷 촬영 여행의 목적지는?","choices":["LA·라스베이거스","파리·런던","도쿄·오사카"],"answer":0,"explanation":"California Dream 재킷은 LA와 라스베이거스 등지에서 촬영했습니다.","source":"https://www.melon.com/album/detail.htm?albumId=362767","album":"california-dream"},"song:activity-seoul-award":{"question":"California Dream 활동 무렵 열린 제17회 서울가요대상에서 씨야가 받은 상은?","choices":["신인상","대상","본상"],"answer":2,"explanation":"씨야는 2008년 1월 31일 제17회 서울가요대상에서 본상을 받았습니다.","source":"https://www.edaily.co.kr/News/Read?mediaCodeNo=258&newsId=01236566586283296","album":"california-dream"},"song:activity-new-beat":{"question":"3집 Hot Girl에서 씨야가 도전한 새로운 비트는?","choices":["레게","일렉트로 하우스","스윙 재즈"],"answer":1,"explanation":"3집 Brilliant Change의 ‘Hot Girl’에서 씨야는 일렉트로 하우스 비트의 댄스곡에 도전했습니다.","source":"https://www.starnewskorea.com/music/2008/10/01/2008100115361214204","album":"brilliant-change"},"song:activity-rebloom-member":{"question":"Rebloom 활동에 새롭게 합류한 멤버는?","choices":["수미","보람","연지"],"answer":0,"explanation":"Rebloom은 수미가 합류한 뒤 발표한 앨범입니다. 앨범명에는 꽃이 다시 피어난다는 뜻이 담겼고, 타이틀은 이민수가 작곡한 ‘그 놈 목소리’예요.","source":"https://www.melon.com/album/detail.htm?albumId=703853","album":"rebloom"},"song:activity-rebloom-producer":{"question":"그 놈 목소리를 만든 작곡가는?","choices":["김도훈","조영수","이민수"],"answer":2,"explanation":"Rebloom의 타이틀곡 그 놈 목소리는 이민수 작곡가의 곡입니다.","source":"https://www.melon.com/album/detail.htm?albumId=703853","album":"rebloom"},"song:activity-again-new":{"question":"See You Again에서 기존 히트곡들과 함께 만난 새 노래 두 곡은?","choices":["사랑의 인사 · 결혼할까요","내겐 너무 멋진 그대 · The Last","Stay · 그럼에도, 우린"],"answer":1,"explanation":"See You Again에는 ‘내겐 너무 멋진 그대’, ‘The Last’와 이전 활동곡들이 함께 담겼습니다.","source":"https://music.bugs.co.kr/album/259909","album":"see-you-again"},"song:activity-gyuri-market":{"question":"2011년 남규리가 조현재와 함께 홍보대사를 맡은 행사는?","choices":["부산콘텐츠마켓","부산국제영화제","서울드라마어워즈"],"answer":0,"explanation":"부산시는 2011년 4월 남규리와 조현재를 부산콘텐츠마켓 홍보대사로 소개했습니다. 위촉식 일정은 4월 26일이었어요.","source":"https://www.busan.go.kr/news/totalnews01/view?dataNo=32991&gugun=Next","album":"see-you-again"},"song:activity-gyuri-award":{"question":"남규리에게 2020 MBC 연기대상 우수연기상을 안겨준 작품은?","choices":["49일","붉은 달 푸른 해","카이로스"],"answer":2,"explanation":"남규리는 ‘카이로스’로 2020 MBC 연기대상 월화 미니·단막 부문 여자 우수 연기상을 받았습니다.","source":"https://enews.imbc.com/News/RetrieveNewsInfo/301881","album":"see-you-again"},"song:activity-boram-team":{"question":"WSG워너비에서 이보람이 소연·HYNN·정지소와 함께한 팀은?","choices":["오아시소","가야G","4FIRE"],"answer":1,"explanation":"이보람은 소연·HYNN·정지소와 가야G로 함께했습니다.","source":"https://enews.imbc.com/News/RetrieveNewsInfo/354733","album":"see-you-again"},"song:activity-boram-song":{"question":"가야G의 첫 활동 무대에서 이보람이 함께 부른 노래는?","choices":["그때 그 순간 그대로","보고싶었어","Clink Clink"],"answer":0,"explanation":"가야G는 그때 그 순간 그대로로 활동했습니다.","source":"https://enews.imbc.com/News/RetrieveNewsInfo/354733","album":"see-you-again"},"song:activity-yeonji-mask":{"question":"김연지가 2016년 복면가왕 가왕에 오를 때 쓴 가면의 이름은?","choices":["밤의 여왕","노래요정 지니","불광동 휘발유"],"answer":2,"explanation":"김연지는 불광동 휘발유로 2016년 35대 가왕에 올랐습니다.","source":"https://enews.imbc.com/News/RetrieveNewsInfo/188082","album":"see-you-again"},"song:activity-boram-mask":{"question":"이보람이 3연승 가왕에 오른 가면은?","choices":["동방불패","나이팅게일","동막골소녀"],"answer":1,"explanation":"이보람은 나이팅게일로 103~105대 가왕에 올랐습니다.","source":"https://enews.imbc.com/News/RetrieveNewsInfo/261263","album":"see-you-again"},"song:activity-gyuri-channel":{"question":"재회 전 남규리가 팬들에게 일상과 마음을 전한 유튜브 채널은?","choices":["귤멍","보람씨야","연지구"],"answer":0,"explanation":"남규리는 귤멍에서 일상과 마음을 팬들에게 전했습니다.","source":"https://www.youtube.com/watch?v=D8XBjkcX7Z0","album":"see-you-again"},"song:activity-reunion-show":{"question":"2020년 원년 멤버 세 사람이 함께 선 재회 방송은?","choices":["놀면 뭐하니?","불후의 명곡","슈가맨3"],"answer":2,"explanation":"2020년 2월 21일, 씨야 원년 멤버 세 사람은 JTBC 슈가맨3에서 함께 노래했습니다.","source":"https://tv.jtbc.co.kr/clip/pr10011122/pm10055652/vo10354827/view","album":"see-you-again"},"song:activity-pre-release":{"question":"2026년 정규 4집에 앞서 먼저 팬들을 만난 노래는?","choices":["Roller Coaster","그럼에도, 우린","Stay"],"answer":1,"explanation":"‘그럼에도, 우린’은 2026년 정규 4집에 앞서 공개된 곡입니다. 이후 First, Again에도 보컬곡과 반주 버전이 실렸어요.","source":"https://www.melon.com/album/detail.htm?albumId=13391243&ref=copyurl&snsGate=Y","album":"still-here"},"song:activity-anniversary":{"question":"First, Again이 기념하는 씨야의 데뷔 주년은?","choices":["20주년","15주년","25주년"],"answer":0,"explanation":"First, Again은 데뷔 20주년을 기념한 정규 4집입니다. 타이틀곡 ‘Stay’를 포함해 보컬곡 9개와 반주곡 2개가 담겼습니다.","source":"https://www.melon.com/album/detail.htm?albumId=13391243&ref=copyurl&snsGate=Y","album":"first-again"},"song:activity-album-writing":{"question":"First, Again 앨범 소개에서 세 사람의 참여를 강조한 작업은?","choices":["앨범 재킷 직접 촬영","전곡 오케스트라 지휘","작사·작곡"],"answer":2,"explanation":"First, Again 앨범 소개는 세 멤버의 작사·작곡 참여를 강조합니다.","source":"https://www.melon.com/album/detail.htm?albumId=13391243&ref=copyurl&snsGate=Y","album":"first-again"},"song:activity-yeonji-dmc":{"question":"김연지의 2018 DMC 페스티벌 무대를 다시 찾는다면, 어떤 공연명을 검색하면 될까요?","choices":["복면가왕 더 위너","나는 가수다","불후의 명곡"],"answer":0,"explanation":"김연지는 2018 DMC 페스티벌의 복면가왕 더 위너 무대에 섰습니다.","source":"https://www.youtube.com/watch?v=VX4z0syPoWw","album":"see-you-again"},"song:activity-gyuri-49":{"question":"남규리의 2011년 연기 활동을 돌아볼 때 만나는 드라마는?","choices":["카이로스","49일","붉은 달 푸른 해"],"answer":1,"explanation":"남규리는 2011년 드라마 49일에 출연했습니다.","source":"https://www.bntnews.co.kr/article/view/bnt201105200353","album":"see-you-again"}};
},
"src/shared/our-stage-style-pick.js":function(module,exports,__require){
'use strict';
// Balanced faces on each new board, without changing a resumed board.
module.exports=function pick(pool,count,random=Math.random){
 const shuffle=a=>{a=[...a];for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.max(0,Math.min(.999999,Number(random())||0))*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;};
 return shuffle(['hair','clothes'].flatMap(part=>shuffle(pool.filter(c=>c.part===part)).slice(0,count/2)));
};

},
"src/shared/our-stage-capsules.js":function(module,exports,__require){
'use strict';
// Cosmetic rewards only. Album/story collections are never part of this pool.
const rows=[
 ['frame-letter','frame','normal','분홍 편지','letter','#a75b7a','#fff0ee'],
 ['frame-ticket','frame','normal','입장 티켓','ticket','#295383','#fff4d8'],
 ['frame-varsity','frame','normal','씨야 과잠','varsity','#29364c','#fff8e9'],
 ['frame-piano','frame','normal','피아노 건반','piano','#353044','#fffdf4'],
 ['frame-blossom','frame','rare','벚꽃 약속','blossom','#c16d97','#fff0f6'],
 ['frame-vinyl','frame','rare','보랏빛 레코드','vinyl','#7560aa','#efe7ff'],
 ['frame-stars','frame','special','우리의 별자리','stars','#e3bc71','#222842'],
 ['frame-encore','frame','special','황금빛 앙코르','encore','#b8873f','#fff6dd'],
 ['back-note','background','normal','노래가 적힌 노트','note','#8d7793','#fffaf0'],
 ['back-check','background','normal','연습실 체크','check','#7995a4','#eaf4f6'],
 ['back-petals','background','normal','봄날의 꽃잎','petals','#df93ac','#fff1f4'],
 ['back-stamp','background','normal','마음의 우표','stamp','#a2819d','#f5edf7'],
 ['back-night','background','rare','밤하늘의 오선지','night','#d9caed','#292841'],
 ['back-fan','background','special','객석의 불빛','fan','#edb3de','#302345'],
 ['effect-petals','frame','rare','꽃잎 리본','ribbon','#e69ab7','#fff1f4'],
 ['effect-record','frame','rare','레코드 컬렉션','record','#aa9bdb','#ede6ff'],
 ['effect-twinkle','frame','rare','별빛 브로치','twinkle','#e6c78b','#fff4d7'],
 ['effect-confetti','frame','rare','커튼콜 리본','confetti','#c188a9','#fff0f6'],
 ['stage-sunset','stage','normal','노을빛 무대','sunset','#d37d82','#422b51'],
 ['stage-blue','stage','normal','푸른 새벽','blue','#78aace','#182842'],
 ['stage-spring','stage','rare','벚꽃 앙코르','spring','#e9a3c1','#583652'],
 ['stage-neon','stage','rare','Hot 네온','neon','#66e5d8','#271744'],
 ['stage-moon','stage','rare','달빛 발라드','moon','#b7b4ee','#202846'],
 ['stage-reunion','stage','rare','슈가맨 · 다시 만난 무대','reunion','#8acdde','#101b38'],
 ['stage-gold','stage','special','THE FAN · 황금빛 밤','gold','#f2ce78','#37274e']
];
const outfits=__require("src/data/our-stage-capsule-outfits.json");
for(const o of outfits)rows.push([o.reward,'outfit',o.rarity,o.name,o.id.replace('capsule-',''),o.color,o.paper]);
const pool=rows.map(([id,kind,rarity,name,motif,color,paper])=>({id,kind,rarity,name,motif,color,paper}));
const byId=id=>pool.find(x=>x.id===id),rates={normal:70,rare:25,special:5},refund={normal:1,rare:2,special:3},cost={normal:3,rare:6,special:12};
const fresh=()=>({pulls:0,freePulls:0,freeDay:null,day:null,rareMiss:0,specialMiss:0,owned:[],tickets:0,exchanges:[],history:[],last:null});
const integer=(n,max=1000000)=>Number.isSafeInteger(n)&&n>=0&&n<=max;
const date=d=>d===null||typeof d==='string'&&/^\d{4}-\d{2}-\d{2}$/.test(d)&&Number.isFinite(Date.parse(d))&&new Date(d).toISOString().slice(0,10)===d;
const day=now=>new Date(now+32400000).toISOString().slice(0,10);
const time=n=>Number.isSafeInteger(n)&&n>0&&n<253402200000000;
const randomUnit=r=>Math.max(0,Math.min(.999999,Number(r())||0));
function valid(g){try{
 if(!g||![g.pulls,g.freePulls,g.tickets,g.rareMiss,g.specialMiss].every(n=>integer(n))||g.freePulls>g.pulls||g.rareMiss>9||g.specialMiss>29||g.rareMiss>g.specialMiss||g.specialMiss>g.pulls||!date(g.freeDay)||!date(g.day)||g.freeDay!==null&&(!g.day||g.freeDay>g.day)||g.pulls===0&&(g.day!==null||g.last!==null)||g.freePulls===0&&g.freeDay!==null||g.freePulls>0&&g.freeDay===null)return false;
 if(!Array.isArray(g.owned)||new Set(g.owned).size!==g.owned.length||!g.owned.every(id=>byId(id))||!Array.isArray(g.exchanges)||new Set(g.exchanges).size!==g.exchanges.length||!g.exchanges.every(id=>g.owned.includes(id))||g.owned.length>g.pulls+g.exchanges.length)return false;
 if(g.tickets+g.exchanges.reduce((n,id)=>n+cost[byId(id).rarity],0)>g.pulls*3||!Array.isArray(g.history)||g.history.length>10||!g.history.every(r=>byId(r.item)&&date(r.day)&&r.day!==null&&typeof r.duplicate==='boolean'&&typeof r.free==='boolean')||g.pulls>0&&(!g.last||!byId(g.last.item)||!g.owned.includes(g.last.item)||!integer(g.last.number)||g.last.number!==g.pulls||typeof g.last.duplicate!=='boolean'||typeof g.last.free!=='boolean'))return false;
 return true;
 }catch{return false;}}
function pull(g,now,balance,random=Math.random){if(!time(now)||g.day&&day(now)<g.day||g.pulls>=1000000)return null;const today=day(now),free=g.freeDay!==today;if(!free&&balance<30)return null;
 let rarity;if(g.specialMiss===29)rarity='special';else if(g.rareMiss===9)rarity=randomUnit(random)<.05?'special':'rare';else{const n=randomUnit(random);rarity=n<.7?'normal':n<.95?'rare':'special';}
 const tier=pool.filter(x=>x.rarity===rarity),unowned=tier.filter(x=>!g.owned.includes(x.id)),choices=unowned.length?unowned:tier,item=choices[Math.floor(randomUnit(random)*choices.length)],duplicate=g.owned.includes(item.id);
 g.pulls++;g.day=today;if(free){g.freePulls++;g.freeDay=today;}g.rareMiss=rarity==='normal'?g.rareMiss+1:0;g.specialMiss=rarity==='special'?0:g.specialMiss+1;
 if(duplicate)g.tickets+=refund[rarity];else g.owned.push(item.id);
 g.last={number:g.pulls,item:item.id,duplicate,free};g.history=[{item:item.id,duplicate,free,day:today},...g.history].slice(0,10);return {...g.last,refund:duplicate?refund[rarity]:0};
}
function exchange(g,id){const item=byId(id);if(!item||item.kind==='outfit'||g.owned.includes(id)||g.tickets<cost[item.rarity])return false;g.tickets-=cost[item.rarity];g.owned.push(id);g.exchanges.push(id);return true;}
module.exports={pool,byId,rates,refund,cost,fresh,valid,pull,exchange,day,time,price:30};

},
"src/shared/our-stage-first-release.js":function(module,exports,__require){
'use strict';
// First-release experience layered over the proven practice-only economy.
module.exports=function(M){
 const stamp=n=>Number.isSafeInteger(n)&&n>0&&n<253402268399999;
 function migrate(s,now=Date.now()){
  if(s.simple.phaseOne===undefined){
   s.simple.phaseOne=1;
   s.simple.debuted=M.has(s,'first');
   s.simple.passIssuedAt=s.simple.debuted?(s.simple.concerts['first-mind']?.at||now):null;
   for(const r of Object.values(s.simple.concerts))r.restored=true;
  }
  return s;
 }
 const fresh=now=>migrate(M.fresh(now),now);
 function valid(s){return M.valid(s)&&s.simple.phaseOne===1&&typeof s.simple.debuted==='boolean'&&s.simple.debuted===M.has(s,'first')&&(s.simple.debuted?stamp(s.simple.passIssuedAt):s.simple.passIssuedAt===null)&&Object.values(s.simple.concerts).every(r=>typeof r.restored==='boolean')&&(!s.active?.chain||s.simple.debuted||s.active.track==='scent');}
 function loadSave(raw){const s=migrate(M.loadSave(raw));if(!valid(s))throw Error('Invalid first-release save');return s;}
 function finishDebut(s,now=Date.now()){
  if(s.simple.debuted||!M.ready(s,'scent')||!stamp(now))return false;
  if(!M.has(s,'first')&&!M.claim(s,'first'))return false;
  s.simple.debuted=true;s.simple.passIssuedAt=now;
  // The free trainee practice carries no coin payout.
  s.simple.walletOffset-=6;
  M.settle(s,now);return true;
 }
 function settle(s,now=Date.now()){
  const n=M.settle(s,now);
  if(!s.simple.debuted&&s.collected.every(id=>id==='scent'||id==='shoes')&&!s.tracks.shoes.length)s.collected=['scent'];
  return n;
 }
 function finishConcert(s,id,tracks,now){const changed=M.finishConcert(s,id,tracks,now);if(changed)s.simple.concerts[id].restored=false;return changed;}
 function restoreTicket(s,id,permutation){const r=s.simple.concerts[id];if(!r||r.restored||!Array.isArray(permutation)||permutation.length!==9||!permutation.every((v,i)=>v===i))return false;r.restored=true;return true;}
 const trainAll=(s,id,now)=>!s.simple.debuted&&id!=='scent'?false:M.trainAll(s,id,now);
 return {...M,fresh,valid,loadSave,settle,finishDebut,finishConcert,restoreTicket,trainAll};
};

},
"src/shared/our-stage-simple.js":function(module,exports,__require){
'use strict';
// Practice-only progression; frozen legacy economy is retained for save compatibility.
module.exports=function(B){
 const old=__require("src/shared/our-stage-growth.js")(B),activity=__require("src/data/our-stage-activity-quiz.json"),mini=__require("src/shared/our-stage-puzzles.js")(__require("src/shared/our-stage-mini.js")(B.timing.testMode,activity));
 mini.games[0]={...mini.games[0],name:'씨야 활동 퀴즈',description:'무대·방송·수상·협업의 순간을 떠올리는 세 문제예요.'};
 const wordTasks=__require("src/shared/our-stage-word-tasks.js");
 const concertRewards=__require("src/shared/our-stage-concert-rewards.js");
 const seed=()=>({version:2,walletOffset:0,concertCoins:concertRewards.fresh(),concerts:{},nickname:'',nicknameSet:false,wordDone:{},legacyAlbums:[]});
 const eligible=(s,id)=>{const a=B.songAlbum(id);if(!a||a.id!=='first-mind'&&!B.albumUnlocked(s,a.id))return false;const i=a.tracks.findIndex(t=>t.id===id);return i===0||B.ready(s,a.tracks[i-1].id);};
 function collect(s){let n=0;for(const id of B.ids)if(!B.open(s,id)&&eligible(s,id)){s.collected.push(id);n++;}return n;}
 const coins=s=>B.coins(s)+s.simple.walletOffset;
 function valid(s){try{const x=s.simple;if(!x||!concertRewards.valid(x.concertCoins)||x.version!==2||!Number.isSafeInteger(x.walletOffset)||Math.abs(x.walletOffset)>1e12||typeof x.nickname!=='string'||x.nickname.length>24||!x.concerts||typeof x.concerts!=='object'||Array.isArray(x.concerts))return false;
 if(!Object.entries(x.concerts).every(([id,r])=>B.albumById(id)&&r&&Number.isSafeInteger(r.at)&&r.at>=0&&r.at<253402268399999&&Array.isArray(r.tracks)&&r.tracks.length===new Set(r.tracks).size&&B.albumById(id).tracks.filter(t=>!t.instrumental).every(t=>r.tracks.includes(t.id)&&B.ready(s,t.id))&&r.tracks.every(t=>B.songAlbum(t)?.id===id)&&r.serial==='OS-'+id+'-'+r.at))return false;
 if(typeof x.nicknameSet!=='boolean'||!x.wordDone||typeof x.wordDone!=='object'||Array.isArray(x.wordDone)||!Object.entries(x.wordDone).every(([id,at])=>wordTasks.some(q=>q.track===id)&&B.open(s,id)&&Number.isSafeInteger(at)&&at>0&&at<253402268399999))return false;
 if(!Array.isArray(x.legacyAlbums)||new Set(x.legacyAlbums).size!==x.legacyAlbums.length||!x.legacyAlbums.every(id=>s.albums.includes(id))||!s.albums.every(id=>x.legacyAlbums.includes(id)||x.concerts[B.albums[B.albums.findIndex(a=>a.id===id)-1].id]))return false;
 return B.valid(s,{balance:coins(s),miniValid:mini.valid,eligible:(s,id)=>eligible(s,id)||B.eligible(s,id)});
 }catch{return false;}}
 function loadSave(raw){if(typeof raw!=='string'||raw.length>512000)throw Error('Invalid stage save');let s=JSON.parse(raw);if(s?.simple){if(s.simple.version===1){s.simple={...s.simple,version:2,nicknameSet:!!s.simple.nickname,wordDone:{},legacyAlbums:[...s.albums]};}if(s.simple.concertCoins===undefined)s.simple.concertCoins=concertRewards.fresh();if(!valid(s))throw Error('Invalid practice save');return s;}
 s=s?.growth?old.loadSave(raw):B.loadSave(raw);const balance=s.growth?old.coins(s):B.coins(s);s.simple=seed();s.simple.legacyAlbums=[...s.albums];s.simple.nicknameSet=!!s.simple.nickname;s.simple.walletOffset=balance-B.coins(s);s.points=Math.min(100,s.points);mini.migrate(s.mini);
 if(s.mini.active?.kind==='quiz'){s.mini.active=null;s.mini.plays=Math.max(0,s.mini.plays-1);s.mini.next.quiz=0;}
 if(!valid(s))throw Error('Invalid migrated practice save');return s;}
 const fresh=now=>{const s=B.fresh(now);s.simple=seed();mini.migrate(s.mini);return s;};
 const settle=(s,now=Date.now())=>{let n=B.settle(s,now)+collect(s);for(const a of B.albums)if(albumAvailable(s,a.id)&&unlockAlbum(s,a.id))n++;return n;};
 const albumRequirements=(s,id)=>{const i=B.albums.findIndex(a=>a.id===id);return i<1?[]:[{label:B.albums[i-1].name+' 콘서트 완료',done:Boolean(s.simple.concerts[B.albums[i-1].id]),action:'perform',value:'album:'+B.albums[i-1].id}];};
 const albumAvailable=(s,id)=>B.albums.findIndex(a=>a.id===id)>0&&!B.albumUnlocked(s,id)&&albumRequirements(s,id).every(r=>r.done);
 function unlockAlbum(s,id){if(!albumAvailable(s,id))return false;s.albums.push(id);collect(s);return true;}
 const songs=B.songs.map(t=>{const a=B.songAlbum(t.id),i=a.tracks.findIndex(x=>x.id===t.id);return {...t,hint:i?'앞 곡의 연습을 모두 마치면 자동으로 열려요.':a.id==='first-mind'?'첫 연습을 시작해요.':'앨범을 열면 바로 연습할 수 있어요.'};});
 const challenges={...B.challenges},map={'first':'debut-team','album':'debut-duet','ending':'debut-ost','chapter-lovely':'copyright','chapter-california':'california-ost','chapter-brilliant':'new-beat','chapter-rebloom':'rebloom-member','chapter-again':'again-new','chapter-still':'pre-release','chapter-first-again':'album-writing','gr':'gyuri-49','yj':'yeonji-dmc','br':'boram-team','reunion':'reunion-show'};
 for(const [id,q]of Object.entries(map))challenges['story:'+id]={...activity['song:activity-'+q],level:1,skill:'활동의 순간'};
 const canChallenge=(s,key)=>!key.startsWith('song:')&&B.canChallenge(s,key);
 function answer(s,key,index){if(!canChallenge(s,key)||challenges[key].answer!==index)return false;return B.answer(s,key,B.challenges[key].answer);}
 function claim(s,id){if(['first','ending'].includes(id)&&B.canChallenge(s,'story:'+id)&&!s.proofs.includes('story:'+id))s.proofs.push('story:'+id);return B.claim(s,id);}
 function purchase(s,id,member){const o=B.shopById(id);if(!o||!B.memberIds.includes(member)||s.purchases.includes(id+':'+member)||coins(s)<o.price)return false;s.purchases.push(id+':'+member);return true;}
 const concertTracks=(s,id)=>B.albumById(id)?.tracks.filter(t=>!t.instrumental).map(t=>t.id)||[];
 const concertReady=(s,id)=>B.albumUnlocked(s,id)&&B.albumComplete(s,id)&&concertTracks(s,id).length>0&&concertTracks(s,id).every(t=>B.ready(s,t));
 function finishConcert(s,id,tracks,now=Date.now()){if(!concertReady(s,id)||s.simple.concerts[id]||!Number.isSafeInteger(now)||now<0||now>=253402268399999||!Array.isArray(tracks)||!concertTracks(s,id).every(t=>tracks.includes(t)))return false;s.simple.concerts[id]={at:now,tracks:concertTracks(s,id),serial:'OS-'+id+'-'+now};const next=B.albums[B.albums.findIndex(a=>a.id===id)+1];if(id==='first-mind'){if(!s.proofs.includes('story:ending'))s.proofs.push('story:ending');if(!s.flags.includes('ending'))s.flags.push('ending');}if(next)unlockAlbum(s,next.id);return true;}
 const badges=s=>B.badges(s).filter(b=>!b.id.startsWith('cheer-')||b.earned).map(b=>b.id.startsWith('cheer-')?{...b,hint:'이전에 간직한 응원 기록'}:b);
 const wordAvailable=(s,id)=>wordTasks.some(q=>q.track===id)&&B.open(s,id)&&!s.simple.wordDone[id];
 function answerWords(s,id,guess,now=Date.now()){const q=wordTasks.find(q=>q.track===id);if(!q||!wordAvailable(s,id)||!Number.isSafeInteger(now)||now<=0||now>=253402268399999||!Array.isArray(guess)||guess.length!==q.tokens.length||new Set(guess).size!==guess.length||!guess.every((n,i)=>Number.isInteger(n)&&n>=0&&n<q.tokens.length&&q.tokens[n]===q.tokens[i]))return false;s.simple.wordDone[id]=now;return true;}
 const giftDesigns=__require("src/shared/our-stage-gift-designs.js");
 function gifts(s){return [...B.albums.filter(a=>s.simple.concerts[a.id]).map(a=>({id:'concert:'+a.id,kind:'bouquet',label:a.name+' 콘서트',at:s.simple.concerts[a.id].at})),...wordTasks.filter(q=>s.simple.wordDone[q.track]).map((q,i)=>({id:'word:'+q.track,kind:['box','bear','towel'][wordTasks.indexOf(q)%3],giftName:giftDesigns.forGift('word:'+q.track).name,label:q.song+' · '+giftDesigns.forGift('word:'+q.track).name,at:s.simple.wordDone[q.track]})),...(s.daily.count?[{id:'attendance',kind:'letters',label:s.daily.count+'번의 연습실 출석',at:null}]:[])];}
 return {...B,concertCoinLimit:concertRewards.limit,concertCoinRemaining:concertRewards.remaining,claimConcertCoin:concertRewards.claim,simpleMode:true,wordTasks,wordAvailable,answerWords,gifts,fresh,loadSave,valid,mini,coins,purchase,settle,eligible,songs,albumRequirements,albumAvailable,unlockAlbum,challenges,canChallenge,answer,claim,badges,concertTracks,concertReady,finishConcert};
};

},
"src/shared/our-stage-growth.js":function(module,exports,__require){
'use strict';
// Opt-in test economy; original collection/story IDs and legacy save schema survive.
module.exports=function(B){
 const mini=__require("src/shared/our-stage-puzzles.js")(B.mini),wordGates=__require("src/shared/our-stage-word-gates.js");
 const test=B.timing.testMode,stats=['vocal','harmony','emotion'],names=['보컬','화음','감성'];
 const time=n=>Number.isSafeInteger(n)&&n>=0&&n<253402268399999;
 const integer=(n,max=1e9)=>Number.isSafeInteger(n)&&n>=0&&n<=max;
 const object=o=>o&&typeof o==='object'&&!Array.isArray(o);
 const exact=(o,keys)=>object(o)&&Object.keys(o).length===keys.length&&keys.every(k=>Object.hasOwn(o,k));
 const themes=['#241d42','#59354e','#34534f','#293d61','#47344d','#5b4637','#3d495e','#442b53'];
 // Eight real release chapters, not the four-album approximation in the review.
 const ranges=[[100,180,80,150,2,5,12],[190,300,160,260,5,20,45],[310,400,270,380,8,20,45],[410,520,390,550,10,45,90],[530,600,560,700,10,45,90],[610,730,710,900,12,45,90],[740,780,910,1100,15,90,180],[790,950,1110,1500,15,90,180]];
 const itemNames=['진주빛 풍선','첫 무대 데님 리본','화음 마이크','꽃잎 응원 카드','별빛 헤어핀','추억의 라디오','무대 뒤 응원 수건','재회의 세 줄 리본','우리의 응원봉 장식','피날레 골드 프레임'];
 const items=itemNames.map((name,i)=>({id:'keepsake-'+i,name,price:100+i*120,buff:.01,chapter:Math.min(7,Math.floor(i*.8)),shape:i%3,theme:themes[Math.min(7,Math.floor(i*.8))]}));
 const cost=l=>Math.floor(50*Math.pow(l,1.55));
 const value=l=>30+12*(l-1)+30*Math.floor(l/10);
 const spent=levels=>stats.reduce((sum,k)=>{for(let l=1;l<levels[k];l++)sum+=cost(l);return sum;},0);
 const seed=now=>({version:1,testGrant:0,levels:{vocal:1,harmony:1,emotion:1},stageEarned:0,offlineEarned:0,offlineUnits:0,records:{},items:[],booster:{day:B.kstDay(now),used:0,armed:false},representative:null,lastActiveAt:now,offlineReceipt:null,pending:null,sequence:0,receipts:{},nickname:'',lastResult:null});
 function init(s,now=Date.now()){if(!s.growth)s.growth=seed(now);mini.migrate(s.mini);if(s.chapterWords===undefined)s.chapterWords=[];return s;}
 const profile=id=>{const a=B.songAlbum(id);if(!a)return null;const ai=B.albums.indexOf(a),i=a.tracks.findIndex(t=>t.id===id),t=a.tracks[i],r=ranges[ai],ratio=i/Math.max(1,a.tracks.length-1);const tempo=/Hot Girl|그 놈 목소리|가니|그래도 좋아/i.test(t.title);return {album:a,track:t,chapter:ai,theme:themes[ai],target:Math.round(r[0]+(r[1]-r[0])*Math.pow(ratio,1.2)),reward:Math.round(r[2]+(r[3]-r[2])*ratio),ap:r[4],seconds:ai===0&&i<3?3:Math.round(r[5]+(r[6]-r[5])*ratio),weights:tempo?[1.4,1.1,.9]:[1,1.2,1.5],kind:tempo?'템포':'발라드',role:i===0?'첫 트랙':'수록 트랙'};};
 const cleared=(s,a)=>a.tracks.filter(t=>!t.instrumental).every(t=>s.growth?.records[t.id]?.wins>0);
 const cap=s=>100+20*B.albums.filter(a=>cleared(s,a)).length;
 const coins=s=>B.coins(s)+200+s.growth.testGrant+s.growth.stageEarned+s.growth.offlineEarned-spent(s.growth.levels)-s.growth.items.reduce((n,id)=>n+items.find(i=>i.id===id).price,0);
 const buff=s=>s.growth.items.reduce((n,id)=>n+items.find(i=>i.id===id).buff,0);
 const score=(s,id,condition=1)=>Math.round(profile(id).weights.reduce((n,w,i)=>n+w*value(s.growth.levels[stats[i]]),0)*(1+buff(s))*condition);
 const rank=(score,target)=>score>=Math.ceil(target*125/100)?'PERFECT':score>=Math.ceil(target*110/100)?'S':score>=target?'A':'RETRY';
 const apCost=(s,id)=>profile(id).ap;
 const recoveryMs=test?1000:30000;
 function recover(s,now){if(now<s.energyAt)return;const maximum=cap(s);if(s.points>=maximum){s.points=maximum;s.energyAt=now;return;}const n=Math.floor((now-s.energyAt)/recoveryMs);s.points=Math.min(maximum,s.points+n);s.energyAt=s.points===maximum?now:s.energyAt+n*recoveryMs;}
 const trainingSeconds=(s,id)=>test?1:Math.max(1,profile(id).seconds-(s.growth.booster.armed?1:0));
 function start(s,job,at){const ap=apCost(s,job.track);if(s.points<ap)return false;if(s.points===cap(s))s.energyAt=at;s.points-=ap;s.active={...job,end:at+trainingSeconds(s,job.track)*1000};return true;}
 function train(s,id,lesson,now=Date.now()){init(s,now);if(!B.ids.includes(id)||!B.open(s,id)||![0,1,2].includes(lesson)||s.tracks[id].includes(lesson)||s.queue||s.active?.track===id&&s.active.lesson===lesson)return false;if(s.active){s.queue={track:id,lesson};return true;}return start(s,{track:id,lesson},now);}
 function refreshBooster(s,now){const b=s.growth.booster,day=B.kstDay(now);if(day>b.day)s.growth.booster={day,used:0,armed:false};}
 function settle(s,now=Date.now()){
  init(s,now);refreshBooster(s,now);let done=0;
  if(s.shopJob&&s.shopJob.end<=now){if(s.shopJob.kind==='setup')s.gigs++;else s.jobCounts[s.shopJob.kind]++;s.shopJob=null;done++;}
  while(s.active&&s.active.end<=now){const j=s.active;s.active=null;if(!s.tracks[j.track].includes(j.lesson))s.tracks[j.track].push(j.lesson);if(B.ready(s,j.track)&&!s.setlist.includes(j.track))s.setlist.push(j.track);done++;recover(s,j.end);if(s.queue&&start(s,s.queue,j.end))s.queue=null;}
  if(!s.active&&s.queue){const needed=Math.max(0,apCost(s,s.queue.track)-s.points),at=s.energyAt+needed*recoveryMs;if(at<=now){recover(s,at);if(start(s,s.queue,at)){s.queue=null;done+=settle(s,now);}}}
  recover(s,now);
  const g=s.growth,p=g.pending;
  if(p&&p.end<=now){const r=g.records[p.track]||{plays:0,wins:0,best:0,rank:'RETRY',mastery:0};r.plays++;if(p.rank!=='RETRY'){r.wins++;r.mastery++;}r.best=Math.max(r.best,p.score);r.rank=rank(r.best,profile(p.track).target);g.records[p.track]=r;g.stageEarned+=p.reward;g.lastResult={...p};g.pending=null;done++;for(const a of B.albums)if(cleared(s,a)&&!g.receipts[a.id])g.receipts[a.id]={at:p.end,serial:'OS-'+a.id+'-'+p.serial};}
  return done;
 }
 function perform(s,id,now=Date.now(),random=Math.random){init(s,now);settle(s,now);const p=profile(id),g=s.growth;if(!p||p.track.instrumental||!B.ready(s,id)||g.pending||s.points<p.ap||g.sequence>=1e6)return false;const v=score(s,id,.95+.1*Math.max(0,Math.min(1,random()))),r=rank(v,p.target),boost=g.booster.armed;s.points-=p.ap;g.booster.armed=false;g.sequence++;g.pending={track:id,score:v,rank:r,reward:r==='RETRY'?0:Math.floor(p.reward*(boost?1.5:1)),end:now+(test?1:Math.min(12,3+p.chapter))*1000,serial:g.sequence,boost};return true;}
 function upgrade(s,k){if(!stats.includes(k)||s.growth.levels[k]>=500||coins(s)<cost(s.growth.levels[k]))return false;s.growth.levels[k]++;return true;}
 function buy(s,id){const i=items.find(x=>x.id===id);if(!i||s.growth.items.includes(id)||!B.albumUnlocked(s,B.albums[i.chapter].id)||coins(s)<i.price)return false;s.growth.items.push(id);return true;}
 function boost(s,now=Date.now()){refreshBooster(s,now);const b=s.growth.booster;if(b.day>B.kstDay(now)||b.used>=3||b.armed)return false;b.used++;b.armed=true;return true;}
 function resume(s,now=Date.now()){
  init(s,now);const g=s.growth;if(now<g.lastActiveAt)return 0;const seconds=Math.min(21600,Math.max(0,Math.floor((now-g.lastActiveAt)/1000))),units=Math.floor(seconds/60),p=profile(g.representative);let reward=0;
  if(p&&units&&g.records[p.track.id]?.wins){reward=units*Math.max(1,Math.floor(p.reward/100));g.offlineEarned+=reward;g.offlineUnits+=units;g.records[p.track.id].mastery+=units;g.offlineReceipt={at:now,seconds:units*60,reward};}
  g.lastActiveAt=now;return reward;
 }
 function validate(s){try{
  if(!Array.isArray(s.chapterWords)||new Set(s.chapterWords).size!==s.chapterWords.length||!s.chapterWords.every(id=>wordGates.some(q=>q.album===id)))return false;
  const g=s.growth;if(!exact(g,Object.keys(seed(0)))||g.version!==1||!integer(g.testGrant,1000000)||(!test&&g.testGrant!==0)||!exact(g.levels,stats)||!stats.every(k=>integer(g.levels[k],500)&&g.levels[k]>=1)||!integer(g.stageEarned)||!integer(g.offlineEarned)||!integer(g.offlineUnits,1e7)||!integer(g.sequence,1e6)||!time(g.lastActiveAt))return false;
  if(!object(g.records)||!Object.entries(g.records).every(([id,r])=>B.ids.includes(id)&&B.ready(s,id)&&!profile(id).track.instrumental&&exact(r,['plays','wins','best','rank','mastery'])&&integer(r.plays,1e6)&&integer(r.wins,r.plays)&&integer(r.best,1e6)&&r.rank===rank(r.best,profile(id).target)&&integer(r.mastery,1e8)&&r.mastery>=r.wins&&r.mastery<=r.wins+g.offlineUnits&&Boolean(r.wins)===(r.best>=profile(id).target)))return false;
  if(Object.values(g.records).reduce((n,r)=>n+r.mastery-r.wins,0)!==g.offlineUnits)return false;
  const plays=Object.values(g.records).reduce((n,r)=>n+r.plays,0);if(plays+(g.pending?1:0)!==g.sequence||g.stageEarned>Object.entries(g.records).reduce((n,[id,r])=>n+r.wins*Math.floor(profile(id).reward*1.5),0)||g.offlineEarned>g.offlineUnits*15)return false;
  if(!Array.isArray(g.items)||new Set(g.items).size!==g.items.length||!g.items.every(id=>items.some(i=>i.id===id&&B.albumUnlocked(s,B.albums[i.chapter].id))))return false;
  const b=g.booster;if(!exact(b,['day','used','armed'])||!/^\d{4}-\d{2}-\d{2}$/.test(b.day)||B.kstDay(Date.parse(b.day+'T00:00:00+09:00'))!==b.day||!integer(b.used,3)||typeof b.armed!=='boolean'||b.armed&&!b.used)return false;
  if(g.representative!==null&&!g.records[g.representative]?.wins)return false;
  const result=p=>exact(p,['track','score','rank','reward','end','serial','boost'])&&B.ids.includes(p.track)&&B.ready(s,p.track)&&!profile(p.track).track.instrumental&&integer(p.score,1e6)&&p.rank===rank(p.score,profile(p.track).target)&&p.reward===(p.rank==='RETRY'?0:Math.floor(profile(p.track).reward*(p.boost?1.5:1)))&&time(p.end)&&integer(p.serial,g.sequence)&&p.serial>0&&typeof p.boost==='boolean';
  if(g.pending!==null&&(!result(g.pending)||g.pending.serial!==g.sequence)||g.lastResult!==null&&!result(g.lastResult))return false;
  if(!B.albums.every(a=>!cleared(s,a)||Object.hasOwn(g.receipts,a.id)))return false;
  if(!object(g.receipts)||!Object.entries(g.receipts).every(([id,r])=>B.albums.some(a=>a.id===id&&cleared(s,a))&&exact(r,['at','serial'])&&time(r.at)&&typeof r.serial==='string'&&new RegExp('^OS-'+id+'-[1-9][0-9]{0,6}$').test(r.serial)))return false;
  if(g.offlineReceipt!==null&&(!exact(g.offlineReceipt,['at','seconds','reward'])||!time(g.offlineReceipt.at)||!integer(g.offlineReceipt.seconds,21600)||!integer(g.offlineReceipt.reward,5400)))return false;
  if(typeof g.nickname!=='string'||g.nickname.length>24||!integer(s.points,cap(s))||coins(s)<0)return false;
  // Validate all legacy collection fields without interpreting the new AP cap as corruption.
  return B.valid(s,{maxPoints:cap(s),balance:coins(s),miniValid:mini.valid});
 }catch{return false;}}
 function loadSave(raw){if(typeof raw!=='string'||raw.length>256000)throw Error('Invalid stage save');const parsed=JSON.parse(raw);let s;if(parsed?.growth!==undefined){s=init(parsed);if(!validate(s))throw Error('Invalid growth save');}else{s=init(B.loadSave(raw));}return s;}
 function prepareTest(s,id){if(!test)return false;const a=B.albumById(id);if(!a)return false;const p=profile(a.tracks.filter(t=>!t.instrumental).at(-1).id);while(score(s,p.track.id,.95)<p.target)stats.forEach(k=>s.growth.levels[k]++);s.growth.testGrant=spent(s.growth.levels);return true;}
 const albumRequirements=(s,id)=>{const req=B.albumRequirements(s,id),i=B.albums.findIndex(a=>a.id===id);if(i>0&&!B.albumUnlocked(s,id))req.push({label:B.albums[i-1].name+' 보컬 무대 모두 A 이상',done:cleared(s,B.albums[i-1]),action:'growth-album',value:B.albums[i-1].id});if(i>0&&!B.albumUnlocked(s,id)&&wordGates.some(q=>q.album===id))req.push({label:'대표곡 가사 블록 완성',done:s.chapterWords.includes(id),action:'chapter-words',value:id});return req;};
 const albumAvailable=(s,id)=>B.albumAvailable(s,id)&&albumRequirements(s,id).every(r=>r.done);
 const wordAvailable=(s,id)=>wordGates.some(q=>q.album===id)&&!B.albumUnlocked(s,id)&&!s.chapterWords.includes(id)&&albumRequirements(s,id).filter(r=>r.action!=='chapter-words').every(r=>r.done);
 function answerWords(s,id,guess){const q=wordGates.find(q=>q.album===id);if(!q||!wordAvailable(s,id)||!Array.isArray(guess)||guess.length!==q.tokens.length||new Set(guess).size!==guess.length||!guess.every((n,i)=>Number.isInteger(n)&&q.tokens[n]===q.tokens[i]))return false;s.chapterWords.push(id);return true;}
 function unlockAlbum(s,id){return albumAvailable(s,id)&&B.unlockAlbum(s,id);}
 function purchase(s,id,member){const o=B.shopById(id);if(!o||!B.memberIds.includes(member)||s.purchases.includes(id+':'+member)||coins(s)<o.price)return false;s.purchases.push(id+':'+member);return true;}
 return {...B,mini,wordGates,wordAvailable,answerWords,growth:{stats,names,items,themes,ranges,prepareTest,cost,value,profile,cap,coins,buff,score,rank,cleared,trainingSeconds,apCost,perform,upgrade,buy,boost,resume,init},timing:{...B.timing,recoveryMs},fresh:now=>init(B.fresh(now),now),loadSave,valid:validate,train,settle,coins,purchase,albumRequirements,albumAvailable,unlockAlbum};
};

},
"src/shared/our-stage-puzzles.js":function(module,exports,__require){
'use strict';
module.exports=function(legacy){
 const cards=[['br','first-mind'],['gr','first-mind'],['yj','first-mind'],['br','lovely-sweet-heart'],['gr','lovely-sweet-heart'],['yj','lovely-sweet-heart'],['br','california-dream'],['gr','california-dream']].map(([member,style],id)=>({id,member,style,label:{'first-mind':'1집','lovely-sweet-heart':'2집','california-dream':'2.5집'}[style]}));
 const games=[legacy.games[0],{id:'pairs',name:'멤버 스타일 짝 맞추기',description:'활동기 도트 스타일 8쌍을 찾아요. 연속으로 맞히면 화음 콤보!',maxReward:36}];
 const migrate=m=>{if(m.schema===undefined){if(m.active?.kind==='rhythm'){legacy.abandon(m,m.active.id);}m.schema=2;m.next.pairs=0;}return m;};
 const fresh=()=>migrate(legacy.fresh());
 const canStart=(m,kind,now)=>games.some(g=>g.id===kind)&&legacy.valid({...m,active:null})&&Number.isSafeInteger(now)&&now>=0&&now<253402268399999-legacy.cooldown&&!m.active&&(!m.day||legacy.day(now)>=m.day)&&legacy.used(m,now)<legacy.dailyLimit&&!legacy.wait(m,kind,now);
 function start(m,kind,now,random=Math.random){if(!canStart(m,kind,now))return false;if(kind==='quiz')return legacy.start(m,kind,now,random);if(m.day!==legacy.day(now)){m.day=legacy.day(now);m.plays=0;}m.plays++;m.next.pairs=now+legacy.cooldown;const deck=cards.flatMap(c=>[c.id,c.id]);for(let i=15;i>0;i--){const j=Math.floor(Math.max(0,Math.min(.999999,random()))*(i+1));[deck[i],deck[j]]=[deck[j],deck[i]];}m.active={kind:'pairs',id:'pairs:'+now,started:now,deck,history:[],open:null,reveal:null,hideAt:0};return m.active.id;}
 function progress(a){const matched=new Set();let combo=0,maxCombo=0;for(const [x,y]of a.history){if(a.deck[x]===a.deck[y]){matched.add(x);matched.add(y);combo++;maxCombo=Math.max(combo,maxCombo);}else combo=0;}return {matched,combo,maxCombo,turns:a.history.length,pairs:matched.size/2,done:matched.size===16||a.history.length>=200};}
 function settle(m,now){const a=m.active;if(a?.kind==='pairs'&&a.reveal&&now>=a.hideAt){a.reveal=null;a.hideAt=0;return true;}return false;}
 function flip(m,id,index,now){const a=m.active;if(a?.kind!=='pairs'||a.id!==id||!Number.isInteger(index)||index<0||index>15||!Number.isSafeInteger(now)||now<a.started)return false;settle(m,now);const p=progress(a);if(p.done||a.reveal||p.matched.has(index)||a.open===index)return false;if(a.open===null){a.open=index;return true;}const first=a.open;a.open=null;a.history.push([first,index]);if(a.deck[first]!==a.deck[index]){a.reveal=[first,index];a.hideAt=now+850;}return true;}
 function finish(m,id,now){const a=m.active;if(a?.kind!=='pairs')return legacy.finish(m,id,now);if(a.id!==id||!Number.isSafeInteger(now)||now<a.started)return null;const p=progress(a);if(!p.done)return null;const multiplier=1+p.maxCombo*.1,rank=p.pairs===8?(p.turns===8?'S':p.turns<=12?'A':'B'):'C',reward=Math.floor(p.pairs*2*multiplier)+(rank==='S'?8:0);m.earned+=reward;m.active=null;return {...p,matched:undefined,kind:'pairs',correct:p.pairs,total:8,multiplier,rank,reward};}
 function abandon(m,id){if(m.active?.kind!=='pairs')return legacy.abandon(m,id);if(m.active.id!==id)return false;m.active=null;return true;}
 function valid(m){try{if(m.schema!==2||!Number.isSafeInteger(m.next.pairs)||m.next.pairs<0||m.next.pairs>253402268399999)return false;if(m.active?.kind!=='pairs')return m.active?.kind!=='rhythm'&&legacy.valid(m);if(!legacy.valid({...m,active:null}))return false;const a=m.active,index=n=>Number.isInteger(n)&&n>=0&&n<16;if(a.id!=='pairs:'+a.started||!Number.isSafeInteger(a.started)||a.started<0||m.next.pairs!==a.started+legacy.cooldown||m.plays<1||!Array.isArray(a.deck)||a.deck.length!==16||!cards.every(c=>a.deck.filter(x=>x===c.id).length===2)||!Array.isArray(a.history)||a.history.length>200)return false;const matched=new Set();for(const pair of a.history){if(!Array.isArray(pair)||pair.length!==2||!pair.every(index)||pair[0]===pair[1]||pair.some(i=>matched.has(i)))return false;if(a.deck[pair[0]]===a.deck[pair[1]])pair.forEach(i=>matched.add(i));}if(a.open!==null&&(!index(a.open)||matched.has(a.open)))return false;if(a.reveal!==null){const last=a.history.at(-1);if(a.open!==null||!Array.isArray(a.reveal)||a.reveal.length!==2||!a.reveal.every((v,i)=>v===last?.[i])||a.deck[a.reveal[0]]===a.deck[a.reveal[1]]||!Number.isSafeInteger(a.hideAt)||a.hideAt<a.started)return false;}else if(a.hideAt!==0)return false;return true;}catch{return false;}}
 return {...legacy,games,cards,migrate,fresh,canStart,start,progress,settle,flip,finish,abandon,valid};
};

},
"src/shared/our-stage-word-gates.js":function(module,exports,__require){
'use strict';
// Reuse the short excerpts already supplied in the archive's lyric quiz dataset.
const bank=__require("data/lyric-quiz.json");
const specs=[['lovely-sweet-heart','L1-001'],['brilliant-change','L1-021'],['still-here','L1-022']];
module.exports=specs.map(([album,id])=>{const q=bank.find(q=>q.id===id);return {album,id,song:q.song,source:q.source,tokens:q.lyric.trim().split(/\s+/)};});

},
"data/lyric-quiz.json":function(module,exports,__require){
module.exports=[{"id":"L1-001","level":1,"song":"여인의 향기","album":"The First Mind · 2006","lyric":"사랑했었나봐 지우지 못하나봐","source":"https://music.bugs.co.kr/track/80187425"},{"id":"L1-002","level":1,"song":"구두","album":"The First Mind · 2006","lyric":"높은 구두를 신고 진하게 화장을 하죠","source":"https://music.bugs.co.kr/track/80187426"},{"id":"L1-003","level":1,"song":"Promise U","album":"The First Mind · 2006","lyric":"I Promise U 난 너를 잊어 갈게","source":"https://music.bugs.co.kr/track/80187428"},{"id":"L1-004","level":1,"song":"사랑의 인사","album":"Lovely Sweet Heart · 2007","lyric":"내겐 그대가 하나뿐이라 다른사랑 못할 것 같아요","source":"https://music.bugs.co.kr/track/80331364"},{"id":"L1-005","level":1,"song":"결혼할까요","album":"Lovely Sweet Heart · 2007","lyric":"약속해줘요 항상 같은 자리에 나와 함께 하기를","source":"https://music.bugs.co.kr/track/80331365"},{"id":"L1-006","level":1,"song":"너는 내 남자","album":"Lovely Sweet Heart · 2007","lyric":"사랑을 백번 천번 만번 불러보아도","source":"https://music.bugs.co.kr/track/80331366"},{"id":"L1-007","level":1,"song":"어떻게 널 잊겠니","album":"Lovely Sweet Heart · 2007","lyric":"사랑이 널 잊겠니 어떻게 널 잊겠니","source":"https://music.bugs.co.kr/track/80331368"},{"id":"L1-008","level":1,"song":"사랑아","album":"Lovely Sweet Heart · 2007","lyric":"가지마요 사랑아 나 여기 있어요","source":"https://music.bugs.co.kr/track/80331369"},{"id":"L1-009","level":1,"song":"그 사람이 나를 사랑해요","album":"Lovely Sweet Heart · 2007","lyric":"그 사람이 나를 사랑해요","source":"https://music.bugs.co.kr/track/80331370"},{"id":"L1-010","level":1,"song":"사랑이 간다","album":"Lovely Sweet Heart · 2007","lyric":"사랑이 간다 나를 두고","source":"https://music.bugs.co.kr/track/80331372"},{"id":"L1-011","level":1,"song":"얼음인형","album":"Lovely Sweet Heart · 2007","lyric":"사랑해요 한마디 못해서","source":"https://music.bugs.co.kr/track/80331374"},{"id":"L1-012","level":1,"song":"Hot Girl","album":"Brillant Change · 2008","lyric":"Just one more time 크게 소리질러봐","source":"https://music.bugs.co.kr/track/1605159"},{"id":"L1-013","level":1,"song":"Turn It Up","album":"Brillant Change · 2008","lyric":"just Turn It up fine fine Turn It Up","source":"https://music.bugs.co.kr/track/1605160"},{"id":"L1-014","level":1,"song":"내가 울더라도","album":"Brillant Change · 2008","lyric":"사랑해 너 때문에 울더라도","source":"https://music.bugs.co.kr/track/1605162"},{"id":"L1-015","level":1,"song":"덩그러니","album":"Brillant Change · 2008","lyric":"이젠 내게서 떠나가 제발 내게서 떠나가","source":"https://music.bugs.co.kr/track/1605163"},{"id":"L1-016","level":1,"song":"남자는 그래요","album":"Brillant Change · 2008","lyric":"남자는 그래요 다 그래요","source":"https://music.bugs.co.kr/track/1605166"},{"id":"L1-017","level":1,"song":"Stay","album":"First, Again · 2026","lyric":"stay in the twilight stay in the twilight","source":"https://music.bugs.co.kr/track/6464992"},{"id":"L1-018","level":1,"song":"I Believe","album":"First, Again · 2026","lyric":"나는 나를 놓지 않아 끝까지 날 안아","source":"https://music.bugs.co.kr/track/6464995"},{"id":"L1-019","level":1,"song":"잔향","album":"First, Again · 2026","lyric":"다시 널 사랑하게 만들어","source":"https://music.bugs.co.kr/track/6464998"},{"id":"L1-020","level":1,"song":"끝내 꺾이지 않는 것","album":"First, Again · 2026","lyric":"끝내 꺾이지 않는 것들이 있어","source":"https://music.bugs.co.kr/track/6464999"},{"id":"L1-021","level":1,"song":"슬픈 발걸음","album":"California Dream · 2008","lyric":"어디로든 가고싶어 그대가 기억나지 않는 곳으로","source":"https://music.bugs.co.kr/track/2205186"},{"id":"L1-022","level":1,"song":"미친 사랑의 노래","album":"투명인간 최장수 OST · 2006","lyric":"널 사랑하니까 전부니까 내 삶 널 위해 쓰고싶어","source":"https://music.bugs.co.kr/track/80243727"},{"id":"L1-023","level":1,"song":"미워요","album":"California Dream · 2008","lyric":"사랑한다고 하더니 나를 떠나가 버린 그 사람","source":"https://music.bugs.co.kr/track/1000052"},{"id":"L1-024","level":1,"song":"그 놈 목소리","album":"Rebloom · 2009","lyric":"귀를 감아 넘어오는 그 놈 목소리","source":"https://music.bugs.co.kr/track/1824781"},{"id":"L1-025","level":1,"song":"여성시대","album":"여성시대 / 영원한 사랑 · 2009","lyric":"화장하고 머리를 자르고 멋진 여자로 태어날 거야","source":"https://music.bugs.co.kr/track/1735468"},{"id":"L1-026","level":1,"song":"The Day","album":"To My Lover · 2006","lyric":"니가 보고 싶어서 너의 집앞을 서성거리고","source":"https://music.bugs.co.kr/track/80261813"},{"id":"L1-027","level":1,"song":"원더우먼","album":"원더우먼 · 2010","lyric":"여자들아 기죽지 마라 당당하게 외쳐라","source":"https://music.bugs.co.kr/track/1895081"},{"id":"L1-028","level":1,"song":"가니 (feat. SG워너비 - 김용준, 황정음, Mario)","album":"Brillant Change · 2008","lyric":"저 멀리 가니 나를 두고 가야 하니","source":"https://music.bugs.co.kr/track/1605158"},{"id":"L1-029","level":1,"song":"T-Gana (티가나)","album":"Rebloom · 2009","lyric":"너를 사랑하는 내맘이 밤 하늘에 하얀별처럼 너무 티가 나나봐","source":"https://music.bugs.co.kr/track/1824785"},{"id":"L1-030","level":1,"song":"정","album":"California Dream · 2008","lyric":"잊으려 잊으려 해봐도 사랑했던 널 잊지 못하고","source":"https://music.bugs.co.kr/track/1000058"},{"id":"L2-001","level":2,"song":"여인의 향기","album":"The First Mind · 2006","lyric":"잘 지내 보여요 그대 얼굴을","source":"https://music.bugs.co.kr/track/80187425"},{"id":"L2-002","level":2,"song":"구두","album":"The First Mind · 2006","lyric":"헤어지기 위해서 미워하는 연습을 했어","source":"https://music.bugs.co.kr/track/80187426"},{"id":"L2-003","level":2,"song":"접시꽃","album":"The First Mind · 2006","lyric":"한참을 너에게 길들여 졌나봐","source":"https://music.bugs.co.kr/track/80187427"},{"id":"L2-004","level":2,"song":"Promise U","album":"The First Mind · 2006","lyric":"한동안 많이 힘들겠지 예전처럼 우리 다시 만날까","source":"https://music.bugs.co.kr/track/80187428"},{"id":"L2-005","level":2,"song":"유죄","album":"The First Mind · 2006","lyric":"어디서부터 손을대야 내맘 곳곳에 박혀있는 너를","source":"https://music.bugs.co.kr/track/80189378"},{"id":"L2-006","level":2,"song":"이별해보기","album":"The First Mind · 2006","lyric":"아주 조금씩 나아질꺼야 때론 많이 힘들겠지만","source":"https://music.bugs.co.kr/track/80189379"},{"id":"L2-007","level":2,"song":"Tearsandfears","album":"The First Mind · 2006","lyric":"날 떠날꺼라고 말을해봐 내가 널 사랑하지 못하게","source":"https://music.bugs.co.kr/track/80189380"},{"id":"L2-008","level":2,"song":"사랑했다면","album":"The First Mind · 2006","lyric":"그댈 보내고 한참 울었죠","source":"https://music.bugs.co.kr/track/80189381"},{"id":"L2-009","level":2,"song":"그냥","album":"The First Mind · 2006","lyric":"이미 잘 알잖아 무슨 말 하는지","source":"https://music.bugs.co.kr/track/80189382"},{"id":"L2-010","level":2,"song":"내 잘못입니다","album":"The First Mind · 2006","lyric":"그대 품이 따뜻해서 나도 모르게","source":"https://music.bugs.co.kr/track/80189383"},{"id":"L2-011","level":2,"song":"사랑의 인사","album":"Lovely Sweet Heart · 2007","lyric":"비내리는 거릴 좋아 했었죠","source":"https://music.bugs.co.kr/track/80331364"},{"id":"L2-012","level":2,"song":"결혼할까요","album":"Lovely Sweet Heart · 2007","lyric":"그대의 작은 목소린 무엇보다 내게 큰 힘이 돼죠","source":"https://music.bugs.co.kr/track/80331365"},{"id":"L2-013","level":2,"song":"너는 내 남자","album":"Lovely Sweet Heart · 2007","lyric":"그리운 맘 바람에게 전해보아도","source":"https://music.bugs.co.kr/track/80331366"},{"id":"L2-014","level":2,"song":"어떻게 널 잊겠니","album":"Lovely Sweet Heart · 2007","lyric":"멍하니 길을 걷다가 하늘만 바라보다가","source":"https://music.bugs.co.kr/track/80331368"},{"id":"L2-015","level":2,"song":"사랑아","album":"Lovely Sweet Heart · 2007","lyric":"웃음 보일때 가세요 금세 눈물 흐를까 봐","source":"https://music.bugs.co.kr/track/80331369"},{"id":"L2-016","level":2,"song":"그 사람이 나를 사랑해요","album":"Lovely Sweet Heart · 2007","lyric":"나만을 바라보는데 내곁에 다른 한사람","source":"https://music.bugs.co.kr/track/80331370"},{"id":"L2-017","level":2,"song":"Summer Dream","album":"Lovely Sweet Heart · 2007","lyric":"친구들 함께 간 그 바닷가","source":"https://music.bugs.co.kr/track/80331371"},{"id":"L2-018","level":2,"song":"사랑이 간다","album":"Lovely Sweet Heart · 2007","lyric":"사랑이 떠나가네 이젠 다시 볼 수 없는 곳으로","source":"https://music.bugs.co.kr/track/80331372"},{"id":"L2-019","level":2,"song":"감동을 주세요","album":"Lovely Sweet Heart · 2007","lyric":"사랑이란 가슴으로 하는거죠","source":"https://music.bugs.co.kr/track/80331373"},{"id":"L2-020","level":2,"song":"얼음인형","album":"Lovely Sweet Heart · 2007","lyric":"어제도 힘겨운 하룰 살았죠","source":"https://music.bugs.co.kr/track/80331374"},{"id":"L2-021","level":2,"song":"Hot Girl","album":"Brillant Change · 2008","lyric":"함께 노래하고 웃는게 난 좋아","source":"https://music.bugs.co.kr/track/1605159"},{"id":"L2-022","level":2,"song":"Turn It Up","album":"Brillant Change · 2008","lyric":"저 하늘에 달빛이 사라진듯이","source":"https://music.bugs.co.kr/track/1605160"},{"id":"L2-023","level":2,"song":"내가 울더라도","album":"Brillant Change · 2008","lyric":"요즘 이상해졌어 자주 웃지도 않고","source":"https://music.bugs.co.kr/track/1605162"},{"id":"L2-024","level":2,"song":"덩그러니","album":"Brillant Change · 2008","lyric":"사랑은 그렇게 갔어 네게 너무나 잔인하게도","source":"https://music.bugs.co.kr/track/1605163"},{"id":"L2-025","level":2,"song":"사모곡","album":"Brillant Change · 2008","lyric":"미련일까요 그댈 향한 마음","source":"https://music.bugs.co.kr/track/1605164"},{"id":"L2-026","level":2,"song":"남자는 그래요","album":"Brillant Change · 2008","lyric":"그대는 벌써 잊었나봐요","source":"https://music.bugs.co.kr/track/1605166"},{"id":"L2-027","level":2,"song":"Stay","album":"First, Again · 2026","lyric":"해가 지는 이 거리 붉게 물든 하늘빛","source":"https://music.bugs.co.kr/track/6464992"},{"id":"L2-028","level":2,"song":"I Believe","album":"First, Again · 2026","lyric":"아무도 모르게 버텨온 날들","source":"https://music.bugs.co.kr/track/6464995"},{"id":"L2-029","level":2,"song":"잔향","album":"First, Again · 2026","lyric":"불이 꺼진 방 나홀로 앉아 있어","source":"https://music.bugs.co.kr/track/6464998"},{"id":"L2-030","level":2,"song":"끝내 꺾이지 않는 것","album":"First, Again · 2026","lyric":"바람은 늘 먼저 지나가고","source":"https://music.bugs.co.kr/track/6464999"},{"id":"L2-031","level":2,"song":"The Day","album":"To My Lover · 2006","lyric":"내게 어울린다던 머릴 잘랐어 연락없었던 친굴 만났어","source":"https://music.bugs.co.kr/track/80261813"},{"id":"L2-032","level":2,"song":"Classic","album":"California Dream · 2008","lyric":"그댄 쉽나요 날 잊고 사는게","source":"https://music.bugs.co.kr/track/1000050"},{"id":"L2-033","level":2,"song":"연가","album":"California Dream · 2008","lyric":"이렇게 하루가 흘러도 내 안의 너만 더 커져가고","source":"https://music.bugs.co.kr/track/1000051"},{"id":"L2-034","level":2,"song":"I Wish","album":"Brillant Change · 2008","lyric":"이른 아침 눈을 떠보니 그대가 내 곁에 있네요","source":"https://music.bugs.co.kr/track/1605165"},{"id":"L2-035","level":2,"song":"시차 (With 다비치, 블랙펄)","album":"숙명 OST · 2008","lyric":"그대와 내가 만약 다른 날에 태어났다면","source":"https://music.bugs.co.kr/track/1510001"},{"id":"L2-036","level":2,"song":"The Day","album":"To My Lover · 2006","lyric":"눈을 가려도 내겐 너만 보이고 귀를 막아도 난 너만 들리고","source":"https://music.bugs.co.kr/track/80261813"},{"id":"L2-037","level":2,"song":"원더우먼","album":"원더우먼 · 2010","lyric":"사랑에 실패해도 우리들만 있으면 괜찮아","source":"https://music.bugs.co.kr/track/1895081"},{"id":"L2-038","level":2,"song":"가니 (feat. SG워너비 - 김용준, 황정음, Mario)","album":"Brillant Change · 2008","lyric":"내게 한발 두발 멀어지는 네 발소리에 울먹울먹 울고있는 내 맘을 알까","source":"https://music.bugs.co.kr/track/1605158"},{"id":"L2-039","level":2,"song":"미워요","album":"California Dream · 2008","lyric":"마음이 약해서 그댈 붙잡지도 못하고 못난 정 때문에 잊지도 못하고","source":"https://music.bugs.co.kr/track/1000052"},{"id":"L2-040","level":2,"song":"그 놈 목소리","album":"Rebloom · 2009","lyric":"흔들리잖아 너의 전화 한 콜에 나 믿고 싶잖아 변한 너일지도 몰라","source":"https://music.bugs.co.kr/track/1824781"},{"id":"L2-041","level":2,"song":"여성시대","album":"여성시대 / 영원한 사랑 · 2009","lyric":"예쁜 구두를 신고 유행하는 옷 입고 거릴 나서본다","source":"https://music.bugs.co.kr/track/1735468"},{"id":"L2-042","level":2,"song":"T-Gana (티가나)","album":"Rebloom · 2009","lyric":"첨엔 수줍은척 아닌척 또 튕기는척 싫은척 해주는게 여자에 관심의 표현이라 믿었어","source":"https://music.bugs.co.kr/track/1824785"},{"id":"L2-043","level":2,"song":"정","album":"California Dream · 2008","lyric":"버리고 버리려 해봐도 세상에 난 너밖에 없는데","source":"https://music.bugs.co.kr/track/1000058"},{"id":"L2-044","level":2,"song":"Stay","album":"First, Again · 2026","lyric":"조용히 번진 온기 말없이도 전해져 너무 좋은 이 순간 시간을 멈추고 싶어","source":"https://music.bugs.co.kr/track/6464992"},{"id":"L2-045","level":2,"song":"I Believe","album":"First, Again · 2026","lyric":"무너질 듯한 밤의 끝에서 나를 겨우 붙잡고 서 있어","source":"https://music.bugs.co.kr/track/6464995"},{"id":"L3-001","level":3,"song":"여인의 향기","album":"The First Mind · 2006","lyric":"두눈이 먼다면 심장이 멈추면 될까요","source":"https://music.bugs.co.kr/track/80187425"},{"id":"L3-002","level":3,"song":"구두","album":"The First Mind · 2006","lyric":"그리워 너무 그리워 그리워도 나 참아야겠지","source":"https://music.bugs.co.kr/track/80187426"},{"id":"L3-003","level":3,"song":"접시꽃","album":"The First Mind · 2006","lyric":"아려오는 가슴에 다시 너의 얼굴","source":"https://music.bugs.co.kr/track/80187427"},{"id":"L3-004","level":3,"song":"Promise U","album":"The First Mind · 2006","lyric":"환한 미소로 내게 다가왔던 그대는 어디에","source":"https://music.bugs.co.kr/track/80187428"},{"id":"L3-005","level":3,"song":"유죄","album":"The First Mind · 2006","lyric":"내맘속에 또 니가 왔나봐","source":"https://music.bugs.co.kr/track/80189378"},{"id":"L3-006","level":3,"song":"이별해보기","album":"The First Mind · 2006","lyric":"참 바보같았어 다시 사랑하도록 내 방하나 비워둘것을","source":"https://music.bugs.co.kr/track/80189379"},{"id":"L3-007","level":3,"song":"Tearsandfears","album":"The First Mind · 2006","lyric":"더 강한 척 약한 날 감춰두고","source":"https://music.bugs.co.kr/track/80189380"},{"id":"L3-008","level":3,"song":"사랑했다면","album":"The First Mind · 2006","lyric":"그대 사진을 모두 찢어요","source":"https://music.bugs.co.kr/track/80189381"},{"id":"L3-009","level":3,"song":"그냥","album":"The First Mind · 2006","lyric":"우리 흔적 조금만 기억하며 살께","source":"https://music.bugs.co.kr/track/80189382"},{"id":"L3-010","level":3,"song":"내 잘못입니다","album":"The First Mind · 2006","lyric":"슬픈 노래로 내 맘 달래봅니다","source":"https://music.bugs.co.kr/track/80189383"},{"id":"L3-011","level":3,"song":"사랑의 인사","album":"Lovely Sweet Heart · 2007","lyric":"지나가는 발소리 그대이기를 원하고 또 원하죠","source":"https://music.bugs.co.kr/track/80331364"},{"id":"L3-012","level":3,"song":"결혼할까요","album":"Lovely Sweet Heart · 2007","lyric":"한 여름날에 눈이 내릴때까지","source":"https://music.bugs.co.kr/track/80331365"},{"id":"L3-013","level":3,"song":"너는 내 남자","album":"Lovely Sweet Heart · 2007","lyric":"이별과 백년 천년 만년 사는것보다","source":"https://music.bugs.co.kr/track/80331366"},{"id":"L3-014","level":3,"song":"어떻게 널 잊겠니","album":"Lovely Sweet Heart · 2007","lyric":"오늘 하루도 너를 미워하다가","source":"https://music.bugs.co.kr/track/80331368"},{"id":"L3-015","level":3,"song":"사랑아","album":"Lovely Sweet Heart · 2007","lyric":"나는 매일 청소만 하네요","source":"https://music.bugs.co.kr/track/80331369"},{"id":"L3-016","level":3,"song":"그 사람이 나를 사랑해요","album":"Lovely Sweet Heart · 2007","lyric":"왜 내맘을 흔들어 놓나요","source":"https://music.bugs.co.kr/track/80331370"},{"id":"L3-017","level":3,"song":"Summer Dream","album":"Lovely Sweet Heart · 2007","lyric":"부드러운 하얀 모랫길 너와 나","source":"https://music.bugs.co.kr/track/80331371"},{"id":"L3-018","level":3,"song":"사랑이 간다","album":"Lovely Sweet Heart · 2007","lyric":"기억은 왜 녹슬지도 않나","source":"https://music.bugs.co.kr/track/80331372"},{"id":"L3-019","level":3,"song":"감동을 주세요","album":"Lovely Sweet Heart · 2007","lyric":"비온뒤에 땅이 굳어지듯이 우리 사랑도 그럴거에요","source":"https://music.bugs.co.kr/track/80331373"},{"id":"L3-020","level":3,"song":"얼음인형","album":"Lovely Sweet Heart · 2007","lyric":"그 흔한 추억도 내게는 하나없네요","source":"https://music.bugs.co.kr/track/80331374"},{"id":"L3-021","level":3,"song":"Hot Girl","album":"Brillant Change · 2008","lyric":"창틀 없는 감옥 속에 갇힌 너의 영혼을 깨워봐","source":"https://music.bugs.co.kr/track/1605159"},{"id":"L3-022","level":3,"song":"Turn It Up","album":"Brillant Change · 2008","lyric":"아슬아슬 mini skirt 새빨간 lipstick","source":"https://music.bugs.co.kr/track/1605160"},{"id":"L3-023","level":3,"song":"내가 울더라도","album":"Brillant Change · 2008","lyric":"Never Say goodbye 이젠 니가 없더라도","source":"https://music.bugs.co.kr/track/1605162"},{"id":"L3-024","level":3,"song":"덩그러니","album":"Brillant Change · 2008","lyric":"얼마나 많은 날들을 떠나보내면 잊을수 있을까","source":"https://music.bugs.co.kr/track/1605163"},{"id":"L3-025","level":3,"song":"사모곡","album":"Brillant Change · 2008","lyric":"술에 취하면 그대 생각에 가슴치고 후회했어요","source":"https://music.bugs.co.kr/track/1605164"},{"id":"L3-026","level":3,"song":"남자는 그래요","album":"Brillant Change · 2008","lyric":"여자는 그래요 다 그래요 마음 주면 아낌없이 주죠","source":"https://music.bugs.co.kr/track/1605166"},{"id":"L3-027","level":3,"song":"Stay","album":"First, Again · 2026","lyric":"사라질까 두려워 너를 더 깊이 안아","source":"https://music.bugs.co.kr/track/6464992"},{"id":"L3-028","level":3,"song":"I Believe","album":"First, Again · 2026","lyric":"지워지지 않을 이 흔적이 나를 더 강하게해","source":"https://music.bugs.co.kr/track/6464995"},{"id":"L3-029","level":3,"song":"잔향","album":"First, Again · 2026","lyric":"끝이 없을 것만 같았었던 우리 사랑은","source":"https://music.bugs.co.kr/track/6464998"},{"id":"L3-030","level":3,"song":"끝내 꺾이지 않는 것","album":"First, Again · 2026","lyric":"남아 있는 숨 하나가 나를 일으켜","source":"https://music.bugs.co.kr/track/6464999"},{"id":"L3-031","level":3,"song":"접시꽃","album":"The First Mind · 2006","lyric":"나만을 아껴준 고마움 모르던 바보같은 나는","source":"https://music.bugs.co.kr/track/80187427"},{"id":"L3-032","level":3,"song":"유죄","album":"The First Mind · 2006","lyric":"사랑이란건 그런가봐 항상 더 사랑한 사람이 죄인인건가봐","source":"https://music.bugs.co.kr/track/80189378"},{"id":"L3-033","level":3,"song":"이별해보기","album":"The First Mind · 2006","lyric":"거울속에 비춰진 마치 울것같은 그 어색한 미소들에","source":"https://music.bugs.co.kr/track/80189379"},{"id":"L3-034","level":3,"song":"Tearsandfears","album":"The First Mind · 2006","lyric":"허기를 채운순간 이름따윈 잊게되는 밤","source":"https://music.bugs.co.kr/track/80189380"},{"id":"L3-035","level":3,"song":"그냥","album":"The First Mind · 2006","lyric":"그게 내 삶인걸 그게 내 행복인걸","source":"https://music.bugs.co.kr/track/80189382"},{"id":"L3-036","level":3,"song":"내 잘못입니다","album":"The First Mind · 2006","lyric":"그러면서도 미련은 버리지 못하는 나","source":"https://music.bugs.co.kr/track/80189383"},{"id":"L3-037","level":3,"song":"Summer Dream","album":"Lovely Sweet Heart · 2007","lyric":"어젯 밤엔 아무 말 못했지만","source":"https://music.bugs.co.kr/track/80331371"},{"id":"L3-038","level":3,"song":"감동을 주세요","album":"Lovely Sweet Heart · 2007","lyric":"세상이 무너져도 날 지켜준단 말","source":"https://music.bugs.co.kr/track/80331373"},{"id":"L3-039","level":3,"song":"Turn It Up","album":"Brillant Change · 2008","lyric":"별이 잠이 든 밤 기분 좋아","source":"https://music.bugs.co.kr/track/1605160"},{"id":"L3-040","level":3,"song":"끝내 꺾이지 않는 것","album":"First, Again · 2026","lyric":"말하지 않아도 알아보는 마음 하나로","source":"https://music.bugs.co.kr/track/6464999"},{"id":"L3-041","level":3,"song":"가니 (feat. SG워너비 - 김용준, 황정음, Mario)","album":"Brillant Change · 2008","lyric":"그렁그렁 눈물젖은 네 눈에 비친 내 모습이","source":"https://music.bugs.co.kr/track/1605158"},{"id":"L3-042","level":3,"song":"눈물의 여왕","album":"Rebloom · 2009","lyric":"고장이 나버린 수도꼭지처럼 눈물로 만든 사람처럼","source":"https://music.bugs.co.kr/track/1824783"},{"id":"L3-043","level":3,"song":"원더우먼","album":"원더우먼 · 2010","lyric":"사랑은 유행가보다 더해 빠르게 변하잖아","source":"https://music.bugs.co.kr/track/1895081"},{"id":"L3-044","level":3,"song":"T-Gana (티가나)","album":"Rebloom · 2009","lyric":"자주 보면 쉽게 질릴까 떨어져 있으려해도","source":"https://music.bugs.co.kr/track/1824785"},{"id":"L3-045","level":3,"song":"정","album":"California Dream · 2008","lyric":"하늘아 제발 비라도 내릴 순 없겠니","source":"https://music.bugs.co.kr/track/1000058"},{"id":"L3-046","level":3,"song":"여인의 향기","album":"The First Mind · 2006","lyric":"그대 때문에 행복을 배웠고 그대 때문에 사랑을 알았는데","source":"https://music.bugs.co.kr/track/80187425"},{"id":"L3-047","level":3,"song":"구두","album":"The First Mind · 2006","lyric":"밥보다 술을 더 많이 마시고 술로다 채워버린 쓰린 속을 감싸안은채","source":"https://music.bugs.co.kr/track/80187426"},{"id":"L3-048","level":3,"song":"결혼할까요","album":"Lovely Sweet Heart · 2007","lyric":"서쪽 하늘에 해가 뜨는날까지 그대만을 사랑하고 싶어요","source":"https://music.bugs.co.kr/track/80331365"},{"id":"L3-049","level":3,"song":"너는 내 남자","album":"Lovely Sweet Heart · 2007","lyric":"나무 같은 사랑을 하고 싶다던 그 사람 언제나 같은 자리에 있던 그 사람","source":"https://music.bugs.co.kr/track/80331366"},{"id":"L3-050","level":3,"song":"사랑아","album":"Lovely Sweet Heart · 2007","lyric":"그대는 모르죠 받기만한 내 사랑이 이별한 후엔 사무치도록 후회만 남는걸","source":"https://music.bugs.co.kr/track/80331369"},{"id":"L3-051","level":3,"song":"Hot Girl","album":"Brillant Change · 2008","lyric":"머리 아픈 고민 따위 버리고 이 노래 느껴봐 Feel the music","source":"https://music.bugs.co.kr/track/1605159"},{"id":"L3-052","level":3,"song":"The Day","album":"To My Lover · 2006","lyric":"마지막 니 모습 표정까지도 아직 난 잊을 수 없는데","source":"https://music.bugs.co.kr/track/80261813"},{"id":"L3-053","level":3,"song":"원더우먼","album":"원더우먼 · 2010","lyric":"언젠가 세월이 흐른 뒤에 지금을 생각하면 우리 함께 웃으며 얘기 할 수 있을지도 몰라","source":"https://music.bugs.co.kr/track/1895081"},{"id":"L3-054","level":3,"song":"가니 (feat. SG워너비 - 김용준, 황정음, Mario)","album":"Brillant Change · 2008","lyric":"나 고개 돌리고 다 둘러 보아도 어디로 넌 바람처럼 사라지고","source":"https://music.bugs.co.kr/track/1605158"},{"id":"L3-055","level":3,"song":"미워요","album":"California Dream · 2008","lyric":"사랑이 사랑을 잊혀지게 한다는 그 말 아무리 되뇌어도 그리움만 차","source":"https://music.bugs.co.kr/track/1000052"},{"id":"L3-056","level":3,"song":"그 놈 목소리","album":"Rebloom · 2009","lyric":"왜 넌 아직도 날 들고 놓고 할 수 있는지","source":"https://music.bugs.co.kr/track/1824781"},{"id":"L3-057","level":3,"song":"여성시대","album":"여성시대 / 영원한 사랑 · 2009","lyric":"세상이 또 나를 속인다고 해도 눈물을 닦고 당당해져서 세상 앞에 웃도록","source":"https://music.bugs.co.kr/track/1735468"},{"id":"L3-058","level":3,"song":"T-Gana (티가나)","album":"Rebloom · 2009","lyric":"들켜버렸어 내마음 Oh 알면 어때 언젠가는 다 알게될걸","source":"https://music.bugs.co.kr/track/1824785"},{"id":"L3-059","level":3,"song":"정","album":"California Dream · 2008","lyric":"미련 때문에 못된 미련 때문에 보내지도 못하고","source":"https://music.bugs.co.kr/track/1000058"},{"id":"L3-060","level":3,"song":"Stay","album":"First, Again · 2026","lyric":"너와 나를 감싼 이 밤에 흩어지는 시간 너머로","source":"https://music.bugs.co.kr/track/6464992"}];
},
"src/shared/our-stage-word-tasks.js":function(module,exports,__require){
'use strict';
const bank=[...__require("data/lyric-quiz.json"),...__require("src/data/our-stage-word-task-excerpts.json")];
module.exports=__require("src/data/our-stage-word-task-specs.json").map(([album,track,id])=>{const q=bank.find(q=>q.id===id);return {album,track,id,song:q.song,source:q.source,tokens:q.lyric.trim().split(/\s+/)};});

},
"src/data/our-stage-word-task-excerpts.json":function(module,exports,__require){
module.exports=[{"id":"OS-L-01","song":"사랑하기 때문에","source":"https://music.bugs.co.kr/track/80189376","lyric":"기다림이 버릇이 됐어 눈물 흘릴줄 아는데","verifiedAt":"2026-11-17"},{"id":"OS-L-02","song":"처음부터 또다시","source":"https://music.bugs.co.kr/track/80189377","lyric":"오늘은 모처럼 난 하늘이 보여","verifiedAt":"2026-11-17"},{"id":"OS-L-03","song":"Dirty Dancing","source":"https://www.youtube.com/watch?v=XZ6YmufCpvU","lyric":"단 한순간에 너의 입술에 키스","verifiedAt":"2026-11-17"},{"id":"OS-L-04","song":"순애보","source":"https://music.bugs.co.kr/track/80331375","lyric":"거울에 비친 내게 웃어도 눈물만 흐르고","verifiedAt":"2026-11-17"},{"id":"OS-L-05","song":"남","source":"https://music.bugs.co.kr/track/80331376","lyric":"이제 우린 정말 남이니까요","verifiedAt":"2026-11-17"},{"id":"OS-L-06","song":"그래도 좋아","source":"https://music.bugs.co.kr/track/1000049","lyric":"니가 정말 좋아 미치도록 좋아","verifiedAt":"2026-11-17"},{"id":"OS-L-07","song":"요즘 나는","source":"https://music.bugs.co.kr/track/1000053","lyric":"요즘들어 니가 부쩍 더 좋아져","verifiedAt":"2026-11-17"},{"id":"OS-L-08","song":"깊은 밤을 날아서","source":"https://music.bugs.co.kr/track/1000054","lyric":"고운 그대 손을 잡고 밤하늘을 날아서","verifiedAt":"2026-11-17"},{"id":"OS-L-09","song":"처음 그 자리에","source":"https://music.bugs.co.kr/track/1000055","lyric":"우연히 다가온 그대 사랑이 왠지 낯설지 않았죠","verifiedAt":"2026-11-17"},{"id":"OS-L-10","song":"집으로 돌아오는 길","source":"https://music.bugs.co.kr/track/1605161","lyric":"집에 돌아오는 길이 너무나도 멀어서","verifiedAt":"2026-11-17"},{"id":"OS-L-11","song":"그 사람","source":"https://music.bugs.co.kr/track/1605167","lyric":"그대여 나는 알고있어요 사랑은 참아 낼수록 더 커지는걸","verifiedAt":"2026-11-17"},{"id":"OS-L-12","song":"솜사탕","source":"https://music.bugs.co.kr/track/1605168","lyric":"기분 좋은 바람 꽃들에게 인사하네요","verifiedAt":"2026-11-17"},{"id":"OS-L-13","song":"나 없이도","source":"https://music.bugs.co.kr/track/1605169","lyric":"나 없이도 되나요 행복한가봐요","verifiedAt":"2026-11-17"},{"id":"OS-L-14","song":"Loving You","source":"https://music.bugs.co.kr/track/1605170","lyric":"첫눈에 사랑인걸 알았죠 나만의 그대란걸","verifiedAt":"2026-11-17"},{"id":"OS-L-15","song":"앗차!","source":"https://music.bugs.co.kr/track/1824782","lyric":"생각 따윈 던져버려 사랑은 지금 바로 이 순간뿐","verifiedAt":"2026-11-17"},{"id":"OS-L-16","song":"바람핀다 믿었니","source":"https://music.bugs.co.kr/track/1824784","lyric":"너만 사랑하기도 하루가 벅차 너만 가득한데","verifiedAt":"2026-11-17"},{"id":"OS-L-17","song":"내겐 너무 멋진 그대","source":"https://music.bugs.co.kr/track/2237882","lyric":"좋은 추억들만 니가 가져가줄래 넌 행복해야 하니까","verifiedAt":"2026-11-17"},{"id":"OS-L-18","song":"The Last","source":"https://music.bugs.co.kr/track/2237883","lyric":"내 심장이 멈출때까지 너 하나만 사랑해","verifiedAt":"2026-11-17"},{"id":"OS-L-19","song":"그럼에도, 우린","source":"https://music.bugs.co.kr/track/6445011","lyric":"한때의 꽃이 아니라 계절을 견딘 나무로","verifiedAt":"2026-11-17"},{"id":"OS-L-20","song":"계절은 돌고 돌아","source":"https://music.bugs.co.kr/track/6464993","lyric":"계절은 돌고 돌아 벌써 가을이 됐고","verifiedAt":"2026-11-17"},{"id":"OS-L-21","song":"봄처럼 그댄","source":"https://music.bugs.co.kr/track/6464994","lyric":"기다린 만큼 참았던 만큼 이 순간이 소중하죠","verifiedAt":"2026-11-17"},{"id":"OS-L-22","song":"안돼요","source":"https://music.bugs.co.kr/track/6464997","lyric":"햇살이 좋은 날 왜 우린 멀어지나요","verifiedAt":"2026-11-17"},{"id":"OS-L-23","song":"우리 Live Ver.","source":"https://music.bugs.co.kr/track/6465000","lyric":"말하지 못한 마음이 사라진 건 아니야","verifiedAt":"2026-11-17"}];
},
"src/data/our-stage-word-task-specs.json":function(module,exports,__require){
module.exports=[["first-mind","promise","L1-003"],["first-mind","fault","L2-010"],["lovely-sweet-heart","lovely-sweet-heart-01","L1-004"],["lovely-sweet-heart","lovely-sweet-heart-05","L2-014"],["lovely-sweet-heart","lovely-sweet-heart-11","L2-020"],["california-dream","california-dream-01","L1-021"],["california-dream","california-dream-10","L1-026"],["california-dream","california-dream-11","L2-043"],["brilliant-change","brilliant-change-02","L1-012"],["brilliant-change","brilliant-change-05","L1-014"],["brilliant-change","brilliant-change-07","L2-025"],["rebloom","rebloom-03","L3-042"],["see-you-again","see-you-again-03","L2-001"],["see-you-again","see-you-again-10","L1-023"],["see-you-again","see-you-again-14","L1-024"],["first-again","first-again-01","L2-027"],["first-again","first-again-04","L1-018"],["first-again","first-again-08","L1-020"],["first-mind","scent","L3-001"],["first-mind","shoes","L1-002"],["first-mind","because","OS-L-01"],["first-mind","flower","L2-003"],["first-mind","again","OS-L-02"],["first-mind","guilty","L2-005"],["first-mind","parting","L2-006"],["first-mind","tears","L2-007"],["first-mind","loved","L2-008"],["first-mind","just","L2-009"],["lovely-sweet-heart","lovely-sweet-heart-02","L1-005"],["lovely-sweet-heart","lovely-sweet-heart-03","L1-006"],["lovely-sweet-heart","lovely-sweet-heart-04","OS-L-03"],["lovely-sweet-heart","lovely-sweet-heart-06","L1-008"],["lovely-sweet-heart","lovely-sweet-heart-07","L1-009"],["lovely-sweet-heart","lovely-sweet-heart-08","L2-017"],["lovely-sweet-heart","lovely-sweet-heart-09","L1-010"],["lovely-sweet-heart","lovely-sweet-heart-10","L3-019"],["lovely-sweet-heart","lovely-sweet-heart-12","OS-L-04"],["lovely-sweet-heart","lovely-sweet-heart-13","OS-L-05"],["california-dream","california-dream-02","OS-L-06"],["california-dream","california-dream-03","L2-032"],["california-dream","california-dream-04","L2-033"],["california-dream","california-dream-05","L1-023"],["california-dream","california-dream-06","OS-L-07"],["california-dream","california-dream-07","OS-L-08"],["california-dream","california-dream-08","OS-L-09"],["california-dream","california-dream-09","L1-022"],["brilliant-change","brilliant-change-01","L1-028"],["brilliant-change","brilliant-change-03","L1-013"],["brilliant-change","brilliant-change-04","OS-L-10"],["brilliant-change","brilliant-change-06","L1-015"],["brilliant-change","brilliant-change-08","L2-034"],["brilliant-change","brilliant-change-09","L1-016"],["brilliant-change","brilliant-change-10","OS-L-11"],["brilliant-change","brilliant-change-11","OS-L-12"],["brilliant-change","brilliant-change-12","OS-L-13"],["brilliant-change","brilliant-change-13","OS-L-14"],["rebloom","rebloom-01","L3-056"],["rebloom","rebloom-02","OS-L-15"],["rebloom","rebloom-04","OS-L-16"],["rebloom","rebloom-05","L1-029"],["see-you-again","see-you-again-01","OS-L-17"],["see-you-again","see-you-again-02","OS-L-18"],["see-you-again","see-you-again-04","L2-002"],["see-you-again","see-you-again-05","L2-011"],["see-you-again","see-you-again-06","L2-012"],["see-you-again","see-you-again-07","L2-018"],["see-you-again","see-you-again-08","L1-021"],["see-you-again","see-you-again-09","OS-L-06"],["see-you-again","see-you-again-11","L1-022"],["see-you-again","see-you-again-12","L3-041"],["see-you-again","see-you-again-13","L3-025"],["see-you-again","see-you-again-15","L3-042"],["still-here","still-here-01","OS-L-19"],["first-again","first-again-02","OS-L-20"],["first-again","first-again-03","OS-L-21"],["first-again","first-again-05","OS-L-19"],["first-again","first-again-06","OS-L-22"],["first-again","first-again-07","L1-019"],["first-again","first-again-09","OS-L-23"]];
},
"src/shared/our-stage-concert-rewards.js":function(module,exports,__require){
'use strict';
const limit=30;
const fresh=()=>({day:null,count:0});
const day=now=>Number.isSafeInteger(now)&&now>=0&&now<253402268399999?new Date(now+9*3600000).toISOString().slice(0,10):null;
function valid(x){return !!x&&!Array.isArray(x)&&Number.isInteger(x.count)&&x.count>=0&&x.count<=limit&&(x.day===null?x.count===0:typeof x.day==='string'&&/^\d{4}-\d{2}-\d{2}$/.test(x.day)&&Number.isFinite(Date.parse(x.day+'T00:00:00Z'))&&new Date(x.day+'T00:00:00Z').toISOString().slice(0,10)===x.day);}
function remaining(s,now=Date.now()){const x=s.simple.concertCoins,today=day(now);if(!valid(x)||!today||x.day&&today<x.day)return 0;return limit-(today===x.day?x.count:0);}
function claim(s,now=Date.now()){if(!remaining(s,now)||!Number.isSafeInteger(s.simple.walletOffset)||s.simple.walletOffset>=1e12)return false;const x=s.simple.concertCoins,today=day(now);if(x.day!==today){x.day=today;x.count=0;}x.count++;s.simple.walletOffset++;return true;}
module.exports={limit,fresh,valid,remaining,claim};

},
"src/shared/our-stage-gift-designs.js":function(module,exports,__require){
'use strict';
// Keep the original earned-gift mapping stable. Art is the approved merchandise atlas.
const designs=[
 {id:'story-journey',name:'씨야 굿즈 선물 상자'},
 {id:'collection-30',name:'세 목소리 폴라로이드'},
 {id:'first-stage',name:'씨야 응원 슬로건'},
 {id:'collection-10',name:'앨범 키링'},
 {id:'event-rookie',name:'세 멤버 아크릴 스탠드'},
 {id:'reunion',name:'씨야 응원 수건'},
 {id:'event-ost',name:'씨야 탁상 달력'},
 {id:'cheer-1',name:'리본 포토카드 홀더'},
 {id:'collection-60',name:'멤버 포토카드 세트'}
];
function forGift(id){const seed=Array.from(id).reduce((n,c)=>(n*31+c.charCodeAt(0))>>>0,0);return designs[seed%designs.length];}
module.exports={designs,forGift};

},
"src/shared/our-stage-test-tools.js":function(module,exports,__require){
'use strict';
// Deliberately separate from normal unlock rules. Only the test client calls this.
module.exports=function(M){
 const core=['gr','yj','reunion','br'],counts={gr:5,yj:9,reunion:12,br:15};
 const options=()=>[...(M.soloAlbums?[{id:'solo-start',label:'20주년 콘서트 완료 · 솔로곡 연습 시작',album:'first-again'}]:[]),...(M.decorStore?[{id:'all-content',label:'모든 콘텐츠 해금 · 의상·무대·뽑기까지 전부',album:'first-again'}]:[]),...(M.finishDebut?[{id:'trainee',label:'연습생부터 · 첫 연습과 데뷔',album:'first-mind'}]:[]),...M.albums.map(a=>({id:'album:'+a.id,label:a.name+' · 앨범 시작',album:a.id})),{id:'complete',label:'전체 앨범 전곡 수집 · 이야기와 피날레는 직접 진행',album:'first-again'},...core.map(id=>({id:'story:'+id,label:id==='reunion'?'씨야 · 하나로 모인 기록':M.members.find(m=>m.id===id).name+' · '+M.members.find(m=>m.id===id).title,album:'see-you-again'})),...M.storyEntries.map(e=>({id:'story:'+e.id,label:e.date+' · '+e.subject+' · '+e.title,album:e.album}))];
 function create(target,now=Date.now()){
  if(!M.timing.testMode)throw Error('Test tools disabled');
  const option=options().find(o=>o.id===target);if(!option)throw Error('Unknown test target');
  if(target==='trainee')return M.fresh(now);
  if(target==='solo-start'){const s=create('complete',now);M.finishConcert(s,'first-again',M.concertTracks(s,'first-again'),now);M.finishFinale(s);if(!M.valid(s))throw Error('Invalid solo checkpoint');return s;}
  if(target==='all-content'){
   const s=create('complete',now);
   s.flags=['first','album','gr','yj','br','reunion','ending'];s.proofs=Object.keys(M.challenges);s.finale=true;
   for(const a of M.albums)s.simple.concerts[a.id]={at:now,tracks:M.concertTracks(s,a.id),serial:'OS-'+a.id+'-'+now,restored:true};
   for(const q of M.wordTasks)s.simple.wordDone[q.track]=now;
   s.purchases=M.shop.flatMap(o=>M.memberIds.map(id=>o.id+':'+id));
   const pool=M.capsules.pool,g=s.leisure.capsules;
   Object.assign(g,{pulls:pool.length,freePulls:1,day:M.capsules.day(now),freeDay:M.capsules.day(now),owned:pool.map(i=>i.id),last:{number:pool.length,item:pool[pool.length-1].id,duplicate:false,free:false}});
   s.leisure.decor.owned=M.decorStore.items.map(i=>i.id);
   s.playDays={count:100,lastDay:M.kstDay(now)};
   if(M.soloAlbums){s.solo={catalogVersion:2,done:M.soloAlbums.flatMap(a=>a.tracks.map(t=>t.id)),active:null,concerts:{}};for(const a of M.soloAlbums)M.finishSoloConcert(s,a.id,now);}
   s.simple.walletOffset+=10000-M.coins(s);
   if(!M.valid(s))throw Error('Invalid full-content checkpoint');return s;
  }
  const s=M.fresh(now),ai=M.albums.findIndex(a=>a.id===option.album),story=target.startsWith('story:')?target.slice(6):null,e=M.storyById(story);
  const count=target==='complete'?M.albumById(option.album).tracks.length:story?(e?.minTracks??counts[story]):option.album==='first-mind'?1:0;
  const proof=k=>{if(!s.proofs.includes(k))s.proofs.push(k);};
  const flag=id=>{if(!s.flags.includes(id))s.flags.push(id);proof('story:'+id);};
  flag('first');flag('album');s.tracks.scent=[0,1,2];if(s.simple?.phaseOne){s.simple.debuted=true;s.simple.passIssuedAt=now;}
  s.albums=M.albums.slice(1,ai+1).map(a=>a.id);
  for(const [i,a] of M.albums.entries()){
   if(i>ai)break;
   for(const t of a.tracks.slice(0,i<ai?a.tracks.length:count)){if(!s.collected.includes(t.id))s.collected.push(t.id);s.tracks[t.id]=[0,1,2];if(t.id!=='scent')proof('song:'+t.id);}
  }
  const personal=M.albumCount(s,'see-you-again'),stop=core.indexOf(story);
  for(const [i,id] of core.entries())if(personal>=counts[id]&&(stop<0||i<stop))flag(id);
  // Only prerequisites of already-opened albums are pre-completed; selected stories remain playable.
  for(const a of M.albums.slice(1,ai+1))for(const id of M.albumStoryGates[a.id]||[])proof('story:'+id);
  if(ai>=M.albums.findIndex(a=>a.id==='still-here'))for(const id of ['event-wsg','event-yeonji-return','event-gyulmung'])proof('story:'+id);
  if(e?.requiresFlags)for(const id of e.requiresFlags)flag(id);
  s.setlist=s.collected.filter(id=>M.ready(s,id)).slice(0,2);
  if(s.simple?.version===2)for(const a of M.albums.slice(0,ai)){s.simple.concerts[a.id]={at:now,tracks:M.concertTracks(s,a.id),serial:'OS-'+a.id+'-'+now,...(s.simple?.phaseOne?{restored:true}:{})};}
  if(M.growth)M.growth.prepareTest(s,option.album);
  if(!M.valid(s)||story&&(e?!M.storyAvailable(s,story):!M.coreAvailable(s,story)))throw Error('Invalid test checkpoint');
  return s;
 }
 return {options,create};
};

},
"src/data/our-stage-optimized-images.json":function(module,exports,__require){
module.exports={"/images/game/our-stage/gasoline-badge.png":"/images/game/our-stage/gasoline-badge.webp","/images/game/our-stage/nightingale-badge.png":"/images/game/our-stage/nightingale-badge.webp","/images/game/our-stage/pixel-activity-logo-base.png":"/images/game/our-stage/pixel-activity-logo-base.webp","/images/game/our-stage/pixel-album-keepsakes-v3.png":"/images/game/our-stage/pixel-album-keepsakes-v3.webp","/images/game/our-stage/pixel-album-logo-base.png":"/images/game/our-stage/pixel-album-logo-base.webp","/images/game/our-stage/pixel-fan-keepsakes-v3.png":"/images/game/our-stage/pixel-fan-keepsakes-v3.webp","/images/game/our-stage/pixel-gyul-star-v2.png":"/images/game/our-stage/pixel-gyul-star-v2.webp","/images/game/our-stage/pixel-rehearsal-room.png":"/images/game/our-stage/pixel-rehearsal-room.webp","/images/game/our-stage/pixel-stories-period.png":"/images/game/our-stage/pixel-stories-period.webp","/images/game/our-stage/layers/base-earrings.png":"/images/game/our-stage/layers/base-earrings.webp","/images/game/our-stage/layers/base.png":"/images/game/our-stage/layers/base.webp","/images/game/our-stage/layers/brilliant-change-earrings.png":"/images/game/our-stage/layers/brilliant-change-earrings.webp","/images/game/our-stage/layers/brilliant-change-v2.png":"/images/game/our-stage/layers/brilliant-change-v2.webp","/images/game/our-stage/layers/california-dream-earrings.png":"/images/game/our-stage/layers/california-dream-earrings.webp","/images/game/our-stage/layers/california-dream-stage.png":"/images/game/our-stage/layers/california-dream-stage.webp","/images/game/our-stage/layers/first-again-earrings.png":"/images/game/our-stage/layers/first-again-earrings.webp","/images/game/our-stage/layers/first-again.png":"/images/game/our-stage/layers/first-again.webp","/images/game/our-stage/layers/first-mind-earrings.png":"/images/game/our-stage/layers/first-mind-earrings.webp","/images/game/our-stage/layers/first-mind.png":"/images/game/our-stage/layers/first-mind.webp","/images/game/our-stage/layers/lovely-sweet-heart-earrings.png":"/images/game/our-stage/layers/lovely-sweet-heart-earrings.webp","/images/game/our-stage/layers/lovely-sweet-heart.png":"/images/game/our-stage/layers/lovely-sweet-heart.webp","/images/game/our-stage/layers/practice-v3.png":"/images/game/our-stage/layers/practice-v3.webp","/images/game/our-stage/layers/rebloom-earrings.png":"/images/game/our-stage/layers/rebloom-earrings.webp","/images/game/our-stage/layers/rebloom.png":"/images/game/our-stage/layers/rebloom.webp","/images/game/our-stage/layers/see-you-again-earrings.png":"/images/game/our-stage/layers/see-you-again-earrings.webp","/images/game/our-stage/layers/see-you-again.png":"/images/game/our-stage/layers/see-you-again.webp","/images/game/our-stage/layers/stage-seasons-earrings.png":"/images/game/our-stage/layers/stage-seasons-earrings.webp","/images/game/our-stage/layers/stage-seasons.png":"/images/game/our-stage/layers/stage-seasons.webp","/images/game/our-stage/layers/stage-sugarman-earrings.png":"/images/game/our-stage/layers/stage-sugarman-earrings.webp","/images/game/our-stage/layers/stage-sugarman.png":"/images/game/our-stage/layers/stage-sugarman.webp","/images/game/our-stage/layers/still-here-earrings.png":"/images/game/our-stage/layers/still-here-earrings.webp","/images/game/our-stage/layers/still-here.png":"/images/game/our-stage/layers/still-here.webp","/images/game/our-stage/layers/tour-believe-earrings.png":"/images/game/our-stage/layers/tour-believe-earrings.webp","/images/game/our-stage/layers/tour-believe.png":"/images/game/our-stage/layers/tour-believe.webp","/images/game/our-stage/layers/tour-encore-earrings.png":"/images/game/our-stage/layers/tour-encore-earrings.webp","/images/game/our-stage/layers/tour-encore.png":"/images/game/our-stage/layers/tour-encore.webp","/images/game/our-stage/layers/tour-varsity-earrings.png":"/images/game/our-stage/layers/tour-varsity-earrings.webp","/images/game/our-stage/layers/tour-varsity.png":"/images/game/our-stage/layers/tour-varsity.webp","/images/game/our-stage/stories/chapter-again-period.png":"/images/game/our-stage/stories/chapter-again-period.webp","/images/game/our-stage/stories/chapter-brilliant-period.png":"/images/game/our-stage/stories/chapter-brilliant-period.webp","/images/game/our-stage/stories/chapter-california-period.png":"/images/game/our-stage/stories/chapter-california-period.webp","/images/game/our-stage/stories/chapter-first-again-period.png":"/images/game/our-stage/stories/chapter-first-again-period.webp","/images/game/our-stage/stories/chapter-lovely-period.png":"/images/game/our-stage/stories/chapter-lovely-period.webp","/images/game/our-stage/stories/chapter-rebloom.png":"/images/game/our-stage/stories/chapter-rebloom.webp","/images/game/our-stage/stories/chapter-still-period.png":"/images/game/our-stage/stories/chapter-still-period.webp","/images/game/our-stage/stories/event-bcm-period.png":"/images/game/our-stage/stories/event-bcm-period.webp","/images/game/our-stage/stories/event-copyright-period.png":"/images/game/our-stage/stories/event-copyright-period.webp","/images/game/our-stage/stories/event-digital-period.png":"/images/game/our-stage/stories/event-digital-period.webp","/images/game/our-stage/stories/event-gyulmung.png":"/images/game/our-stage/stories/event-gyulmung.webp","/images/game/our-stage/stories/event-kairos-period.png":"/images/game/our-stage/stories/event-kairos-period.webp","/images/game/our-stage/stories/event-netiquette-period.png":"/images/game/our-stage/stories/event-netiquette-period.webp","/images/game/our-stage/stories/event-ost-period.png":"/images/game/our-stage/stories/event-ost-period.webp","/images/game/our-stage/stories/event-rookie-period.png":"/images/game/our-stage/stories/event-rookie-period.webp","/images/game/our-stage/stories/event-seoul-period.png":"/images/game/our-stage/stories/event-seoul-period.webp","/images/game/our-stage/stories/event-wsg.png":"/images/game/our-stage/stories/event-wsg.webp","/images/game/our-stage/stories/event-yeonji-return.png":"/images/game/our-stage/stories/event-yeonji-return.webp","/images/game/our-stage/stories/gasoline-story.png":"/images/game/our-stage/stories/gasoline-story.webp","/images/game/our-stage/stories/nightingale-story.png":"/images/game/our-stage/stories/nightingale-story.webp"};
},
"src/data/our-stage-outfits.json":function(module,exports,__require){
module.exports=[{"id":"practice","name":"처음의 연습복","type":"PRACTICE SET","image":"/images/game/our-stage/layers/practice-v3.png","note":"귀고리 없이 수수한 머리와 흰 티셔츠·트레이닝 바지로 시작해요. 보람·규리·연지 이름표도 작은 도트 패치로 붙였어요. 특정 활동 사진을 그대로 재현한 의상은 아닙니다.","width":1536,"height":1024},{"id":"base","name":"20주년 콘서트","type":"CONCERT SET","image":"/images/game/our-stage/seeya-pixel-base.png","note":"기존 기본 의상을 별도의 20주년 콘서트 세트로 옮겼어요. 처음부터 자유롭게 입을 수 있어요.","width":1774,"height":887,"members":[[84,515],[620,508],[1146,541]]},{"id":"first-mind","name":"The First Mind","type":"1ST ALBUM · 2006.02.24","image":"/images/game/our-stage/pixel-first-mind.png","note":"앨범 커버의 의상과 머리 스타일을 참고한 도트 시안입니다. 보이지 않는 하의·신발은 디자인으로 보완했어요.","url":"https://www.melon.com/album/detail.htm?albumId=314286","cover":"https://is1-ssl.mzstatic.com/image/thumb/Music112/v4/4f/90/b7/4f90b7bb-17a4-9989-4ec0-f5e5ea8eb807/8806163340067_cover.jpg/1200x1200bf-60.jpg","prompt":"Create a single transparent PNG sprite lineup with exactly THREE full-body chunky 2D pixel-art characters. Image 1 is the approved game sprite STYLE reference; retain identical large-head tiny-body proportions, simple square eyes and short mouth, hard square pixel edges and flat 2-3 tones. Image 2 is the album wardrobe reference. NO photoreal/anime smoothness, no fine texture, no shadows, no text, no scene, no props. Left-to-right fixed Boram, Gyuri, Yeonji. Three sprites each centered in its own equal-width third with generous transparent gaps and same baseline. Entire body visible. Simple straight standing pose, arms down. Coarse roughly 32x48 logical pixel sprites enlarged. No intricate facial detail. Adapt only hairstyle/clothing as specified. Album wardrobe: White debut outfits. LEFT Boram: short layered light brown hair, cropped white textured vest and white skirt. CENTER Gyuri: straight black bob with bangs under a white lace hood, off shoulder white blouse and white skirt. RIGHT Yeonji: long black fine braids, white lace shoulder bolero and white dress. Simple white shoes.","width":1774,"height":887,"members":[[139,445],[1187,457],[637,477]],"identityReview":{"status":"caption-checked","source":"https://www.kookje.co.kr/news2011/asp/newsbody.asp?code=0500&key=20060310.22035155435","evidence":"앨범 커버의 YEONJI · BORAM · GYURI 표기와 실명 사진 설명 대조. 흰 후드 김연지 / 짧은 갈색 머리 이보람 / 긴 땋은 머리 남규리."}},{"id":"lovely-sweet-heart","name":"Lovely Sweet Heart","type":"2ND ALBUM · 2007.05.25","image":"/images/game/our-stage/pixel-lovely-sweet-heart.png","note":"앨범 커버의 의상과 머리 스타일을 참고한 도트 시안입니다. 보이지 않는 하의·신발은 디자인으로 보완했어요.","url":"https://www.melon.com/album/detail.htm?albumId=352046","cover":"https://is1-ssl.mzstatic.com/image/thumb/Music122/v4/3d/5c/cd/3d5ccd4e-facb-5d08-bb32-0fe1d50ed182/8806163340050_cover.jpg/1200x1200bb.jpg","prompt":"Create a single transparent PNG sprite lineup with exactly THREE full-body chunky 2D pixel-art characters. Image 1 is the approved game sprite STYLE reference; retain identical large-head tiny-body proportions, simple square eyes and short mouth, hard square pixel edges and flat 2-3 tones. Image 2 is the album wardrobe reference. NO photoreal/anime smoothness, no fine texture, no shadows, no text, no scene, no props. Left-to-right fixed Boram, Gyuri, Yeonji. Three sprites each centered in its own equal-width third with generous transparent gaps and same baseline. Entire body visible. Simple straight standing pose, arms down. Coarse roughly 32x48 logical pixel sprites enlarged. No intricate facial detail. Adapt only hairstyle/clothing as specified. Album wardrobe: LEFT Boram: dark brown side ponytails, navy cropped blazer over light blue shirt, cream mini skirt with pink bow belt. CENTER Gyuri: brunette updo with bangs and white hairband, white cropped blazer over blue-yellow vertical stripe minidress, woven brown waist belt. RIGHT Yeonji: dark long wavy hair, navy-white striped cropped blazer, pink shirt and white mini skirt with pink belt. Simplified heels.","width":1774,"height":887,"members":[[155,436],[591,592],[1183,465]],"identityReview":{"status":"caption-checked","source":"https://www.donga.com/news/Entertainment/article/all/20070530/8447950/1","evidence":"동일 의상 사진에 왼쪽부터 이보람·남규리·김연지 명시. 네이비 재킷 / 흰 재킷과 헤어밴드 / 줄무늬 재킷."}},{"id":"california-dream","name":"California Dream","type":"2.5 ALBUM · 2008.01.02","image":"/images/game/our-stage/layers/california-dream-stage.png","note":"2008년 2월 3일 인기가요 ‘그래도 좋아’ 무대의 의상과 헤어를 참고했어요. 작은 장식은 도트로 단순화했습니다.","url":"https://www.melon.com/album/detail.htm?albumId=362767","cover":"https://image.genie.co.kr/Y/IMAGE/IMG_ALBUM/055/420/850/55420850_1405324372412_1_600x600.JPG","prompt":"Create a single transparent PNG sprite lineup with exactly THREE full-body chunky 2D pixel-art characters. Image 1 is the approved game sprite STYLE reference; retain identical large-head tiny-body proportions, simple square eyes and short mouth, hard square pixel edges and flat 2-3 tones. Image 2 is the album wardrobe reference. NO photoreal/anime smoothness, no fine texture, no shadows, no text, no scene, no props. Left-to-right fixed Boram, Gyuri, Yeonji. Three sprites each centered in its own equal-width third with generous transparent gaps and same baseline. Entire body visible. Simple straight standing pose, arms down. Coarse roughly 32x48 logical pixel sprites enlarged. No intricate facial detail. Adapt only hairstyle/clothing as specified. Album wardrobe: Casual travel looks based on photo section. LEFT Boram: long dark hair with bangs, pale pink sleeveless top, blue jeans. CENTER Gyuri: long black hair with bangs, white sleeveless long top with black bust panel and necklace, dark jeans. RIGHT Yeonji: long brown hair, pale cream sleeveless blouse, dark blue jeans. Simplified white shoes.","width":1536,"height":1024,"members":[[85,506],[591,592],[1183,504]],"identityReview":{"status":"stage-checked","source":"https://www.youtube.com/watch?v=Z7QOYi6iR70","sources":["https://www.osen.co.kr/article/G0801090055","https://music.bugs.co.kr/track/1000049"],"evidence":"2008.02.03 SBS 인기가요 그래도 좋아 무대의 의상·헤어 대조. 남규리 쇼트커트 기사 및 곡 파트 표기를 함께 참고. 도트 열은 이보람 노랑 재킷·검정 허리 장식 / 남규리 분홍 재킷·짧은 단발 / 김연지 네이비 조끼·노랑 허리 리본 순서.","note":"2008년 2월 3일 인기가요 ‘그래도 좋아’ 무대의 의상과 헤어를 참고했어요. 작은 장식은 도트로 단순화했습니다."},"wardrobeSource":"https://www.youtube.com/watch?v=Z7QOYi6iR70"},{"id":"brilliant-change","name":"Brilliant Change","type":"3RD ALBUM · 2008.09.26","image":"/images/game/our-stage/pixel-brilliant-change.png","note":"3집 활동기 인터뷰 사진의 의상과 헤어를 참고했어요. 앨범 커버 의상이 아닌 당시 활동 사진의 재해석입니다.","url":"https://www.melon.com/album/detail.htm?albumId=398227","cover":"https://coverartarchive.org/release/dc732f97-ca67-4325-b575-54cebd35a969/front-500","prompt":"Create a single transparent PNG sprite lineup with exactly THREE full-body chunky 2D pixel-art characters. Image 1 is the approved game sprite STYLE reference; retain identical large-head tiny-body proportions, simple square eyes and short mouth, hard square pixel edges and flat 2-3 tones. Image 2 is the album wardrobe reference. NO photoreal/anime smoothness, no fine texture, no shadows, no text, no scene, no props. Left-to-right fixed Boram, Gyuri, Yeonji. Three sprites each centered in its own equal-width third with generous transparent gaps and same baseline. Entire body visible. Simple straight standing pose, arms down. Coarse roughly 32x48 logical pixel sprites enlarged. No intricate facial detail. Adapt only hairstyle/clothing as specified. Album wardrobe: Retro colorful stage looks inspired by cover. LEFT Boram: short light brown pixie hair, black cropped jacket, yellow tie and bright lime yellow short skirt, gray knee high boots. CENTER Gyuri: black bob, little black hat, red sleeveless tunic with bold silver/white shoulder bow and black belt, dark leggings and red heels. RIGHT Yeonji: long brown hair, shiny purple small hat, green/white stripe sleeveless top, black-white patterned pants and purple shoes.","width":1774,"height":887,"members":[[158,424],[665,518],[1183,468]],"identityReview":{"status":"caption-checked","source":"https://www.starnewskorea.com/music/2008/10/10/2008101013581404445","evidence":"3집 활동기 인터뷰 사진에 왼쪽부터 이보람·남규리·김연지 명시. 이보람 체크 원피스와 옆 땋은 머리 / 남규리 회색 체크 원피스와 짧은 갈색 머리·빨강 헤어밴드 / 김연지 검정 조끼와 반바지·긴 갈색 머리.","note":"3집 활동기 인터뷰 사진의 의상과 헤어를 참고했어요. 앨범 커버 의상이 아닌 당시 활동 사진의 재해석입니다."},"wardrobeSource":"https://www.starnewskorea.com/music/2008/10/10/2008101013581404445"},{"id":"rebloom","name":"Rebloom","type":"MINI ALBUM · 2009.10.26","image":"/images/game/our-stage/pixel-rebloom.png","note":"현재 세 멤버가 입는 재해석 의상입니다. 남규리는 이 앨범에 참여하지 않았으며, 당시 활동 모습·멤버 구성을 재현한 것이 아닙니다.","url":"https://www.melon.com/album/detail.htm?albumId=703853","cover":"https://image.bugsm.co.kr/album/images/500/2037/203741.jpg","prompt":"Create a single transparent PNG sprite lineup with exactly THREE full-body chunky 2D pixel-art characters. Image 1 is the approved game sprite STYLE reference; retain identical large-head tiny-body proportions, simple square eyes and short mouth, hard square pixel edges and flat 2-3 tones. Image 2 is the album wardrobe reference. NO photoreal/anime smoothness, no fine texture, no shadows, no text, no scene, no props. Left-to-right fixed Boram, Gyuri, Yeonji. Three sprites each centered in its own equal-width third with generous transparent gaps and same baseline. Entire body visible. Simple straight standing pose, arms down. Coarse roughly 32x48 logical pixel sprites enlarged. No intricate facial detail. Adapt only hairstyle/clothing as specified. Album wardrobe: USER AUTHORIZED reinterpretation of Rebloom cover clothing on current three characters, NOT historical lineup. Keep base LEFT red long hair Boram, CENTER black long hair Gyuri, RIGHT brown long hair Yeonji. LEFT wears black sleeveless studded moto vest, black pants. CENTER wears tailored black blazer, black V neck dress, silver waistbelt. RIGHT wears pale silver fringed shoulder jacket over black sequin top and slim black pants. All black boots.","width":1774,"height":887,"members":[[84,507],[591,592],[1183,506]]},{"id":"see-you-again","name":"See You Again","type":"BEST ALBUM · 2011.01.21","image":"/images/game/our-stage/pixel-see-you-again.png","note":"앨범 커버의 의상과 머리 스타일을 참고한 도트 시안입니다. 보이지 않는 하의·신발은 디자인으로 보완했어요.","url":"https://www.melon.com/album/detail.htm?albumId=1150052","cover":"https://i.scdn.co/image/ab67616d0000b273190e0c6930ae2521e1c0688a","prompt":"Create a single transparent PNG sprite lineup with exactly THREE full-body chunky 2D pixel-art characters. Image 1 is the approved game sprite STYLE reference; retain identical large-head tiny-body proportions, simple square eyes and short mouth, hard square pixel edges and flat 2-3 tones. Image 2 is the album wardrobe reference. NO photoreal/anime smoothness, no fine texture, no shadows, no text, no scene, no props. Left-to-right fixed Boram, Gyuri, Yeonji. Three sprites each centered in its own equal-width third with generous transparent gaps and same baseline. Entire body visible. Simple straight standing pose, arms down. Coarse roughly 32x48 logical pixel sprites enlarged. No intricate facial detail. Adapt only hairstyle/clothing as specified. Album wardrobe: Warm cafe winter outfits. LEFT Boram: brown updo with bangs, fitted cream long sleeve peplum sweater, dark skirt. CENTER Gyuri: long black hair, beige pompom knit beanie, oatmeal cable cardigan over cream top, dark trousers. RIGHT Yeonji: long wavy brown hair, warm camel coat over gray cuff sweater, dark trousers. Small neutral shoes, no cups.","width":1774,"height":887,"members":[[188,375],[676,420],[1185,448]],"identityReview":{"status":"caption-checked","source":"https://www.starnewskorea.com/music/2011/01/30/2011013011312367388","evidence":"동일 카페 사진에 이보람·남규리·김연지 명시. 크림 니트 / 비니 / 카멜 코트."}},{"id":"still-here","name":"그럼에도, 우린","type":"PRE-RELEASE SINGLE · 2026.03.30","image":"/images/game/our-stage/pixel-still-here.png","note":"앨범 커버의 의상과 머리 스타일을 참고한 도트 시안입니다. 보이지 않는 하의·신발은 디자인으로 보완했어요.","url":"https://www.melon.com/album/detail.htm?albumId=13299661","cover":"https://www.bntnews.co.kr/data/bnt/image/2026/03/30/bnt202603300083.jpeg","prompt":"Create a single transparent PNG sprite lineup with exactly THREE full-body chunky 2D pixel-art characters. Image 1 is the approved game sprite STYLE reference; retain identical large-head tiny-body proportions, simple square eyes and short mouth, hard square pixel edges and flat 2-3 tones. Image 2 is the album wardrobe reference. NO photoreal/anime smoothness, no fine texture, no shadows, no text, no scene, no props. Left-to-right fixed Boram, Gyuri, Yeonji. Three sprites each centered in its own equal-width third with generous transparent gaps and same baseline. Entire body visible. Simple straight standing pose, arms down. Coarse roughly 32x48 logical pixel sprites enlarged. No intricate facial detail. Adapt only hairstyle/clothing as specified. Album wardrobe: Dark blue comeback outfits. LEFT Boram: long brown hair parted, black blazer over light blue untucked open shirt, black crop top, loose black trousers. CENTER Gyuri: long black straight hair, black leather long coat over black lace minidress, tall black boots. RIGHT Yeonji: long black waves with bangs, navy off shoulder asymmetrical dress with long side train, tall black boots.","width":1774,"height":887,"members":[[1183,483],[591,592],[110,481]],"identityReview":{"status":"caption-checked","source":"https://www.sportschosun.com/entertainment/2026-04-01/202603310100209640014543","evidence":"커버 사진에 왼쪽부터 김연지·남규리·이보람 명시. 파란 셔츠와 재킷 김연지 / 가죽 코트 남규리 / 네이비 오프숄더 이보람. 뉴스엔 개별 이름 사진으로 재확인."}},{"id":"first-again","name":"First, Again","type":"4TH ALBUM · 2026.05.14","image":"/images/game/our-stage/pixel-first-again.png","note":"앨범 커버의 의상과 머리 스타일을 참고한 도트 시안입니다. 보이지 않는 하의·신발은 디자인으로 보완했어요.","url":"https://www.melon.com/album/detail.htm?albumId=13391243&ref=copyurl&snsGate=Y","cover":"https://image.bugsm.co.kr/album/images/500/41474/4147431.jpg","prompt":"Create a single transparent PNG sprite lineup with exactly THREE full-body chunky 2D pixel-art characters. Image 1 is the approved game sprite STYLE reference; retain identical large-head tiny-body proportions, simple square eyes and short mouth, hard square pixel edges and flat 2-3 tones. Image 2 is the album wardrobe reference. NO photoreal/anime smoothness, no fine texture, no shadows, no text, no scene, no props. Left-to-right fixed Boram, Gyuri, Yeonji. Three sprites each centered in its own equal-width third with generous transparent gaps and same baseline. Entire body visible. Simple straight standing pose, arms down. Coarse roughly 32x48 logical pixel sprites enlarged. No intricate facial detail. Adapt only hairstyle/clothing as specified. Album wardrobe: Soft natural white shirts and blue jeans matching bedroom cover. LEFT Boram: warm brown low side ponytail, white rolled sleeve button shirt, wide cropped blue jeans. CENTER Gyuri: long dark brown wavy hair, loose white flowing blouse over cream undershirt, light blue jeans. RIGHT Yeonji: dark black two loose braids and wispy bangs, cream embroidered blouse, blue jeans. All standing, neutral white shoes adapted from seated cover, no cushions.","width":1774,"height":887,"members":[[1183,460],[634,549],[144,439]],"identityReview":{"status":"caption-checked","source":"https://m.tf.co.kr/read/entertain/2302510.htm","evidence":"같은 흰 상의·청바지 촬영 사진의 왼쪽부터 이보람·남규리·김연지 표기와 의상 대조. 갈색 옆 묶음 머리·흰 셔츠 김연지 / 검은 머리·크림 블라우스 이보람."}}];
},
"src/shared/our-stage-name-tag.js":function(module,exports,__require){
'use strict';
// Eleven-pixel Hangul glyphs keep the rehearsal patch crisp at sprite scale.
const glyphs={
 '보':['00100000100','00100000100','00111111100','00100000100','00111111100','00000000000','00000100000','00000100000','00111111100','00000000000','00000000000'],
 '람':['11111001000','00001001000','11111001110','10000001000','11111001000','00000000000','00111111100','00100000100','00100000100','00100000100','00111111100'],
 '규':['00111111100','00000000100','00000000100','00000000100','00000000000','11111111111','00010001000','00010001000','00010001000','00010001000','00000000000'],
 '리':['11111100100','00000100100','00000100100','11111100100','10000000100','10000000100','11111100100','00000000100','00000000100','00000000100','00000000100'],
 '연':['01110000100','10001011100','10001000100','10001011100','01110000100','00000000100','00000000000','00100000000','00100000000','00100000000','00111111100'],
 '지':['11111110100','00010000100','00010000100','00101000100','00101000100','01000100100','10000010100','00000000100','00000000100','00000000100','00000000100']
};
function nameTag(member){
 const name={br:'보람',gr:'규리',yj:'연지'}[member];if(!name)return '';
 const dots=[...name].map((letter,i)=>glyphs[letter].flatMap((row,y)=>[...row].flatMap((dot,x)=>dot==='1'?[`M${174+i*48+x*4} ${401+y*4}h4v4h-4z`]:[])).join('')).join('');
 return `<g class="rehearsal-name-tag" aria-label="리허설 이름표 ${name}" shape-rendering="crispEdges"><title>${name}</title><path fill="#c7c3b8" d="M162 397h116v52H162z"/><path fill="#f3efdd" d="M158 393h116v52H158z"/><path fill="#ded8c4" d="M158 393h8v8h-8zM266 393h8v8h-8zM158 437h8v8h-8zM266 437h8v8h-8z"/><path fill="#383947" d="${dots}"/></g>`;
}
module.exports={nameTag,glyphs};

},
"src/client/our-stage-skins.js":function(module,exports,__require){
'use strict';
const C=__require("src/shared/our-stage-capsules.js");
function attributes(slots={}){const f=C.byId(slots.frame),b=C.byId(slots.background);return `data-skin-frame="${f?.motif||''}" data-skin-back="${b?.motif||''}" style="${f?'--skin-frame:'+f.color+';--skin-frame-paper:'+f.paper+';':''}${b?'--skin-back:'+b.color+';--skin-back-paper:'+b.paper+';':''}"`;}
const star='<path d="M0-14 4-4 14 0 4 4 0 14-4 4-14 0-4-4Z"/>';
const flower='<g><circle cx="0" cy="-9" r="7"/><circle cx="9" cy="-2" r="7"/><circle cx="6" cy="9" r="7"/><circle cx="-6" cy="9" r="7"/><circle cx="-9" cy="-2" r="7"/><circle r="4" fill="#fff1c5"/></g>';
const ribbon='<path d="M0 0-15-10-16 9 0 2 16 9 15-10Z"/><path d="M-3 2-9 24 0 19 8 25 4 2Z"/><rect x="-4" y="-4" width="8" height="8" rx="2" fill="#fff0cf"/>';
const record='<circle r="17" fill="#393149"/><g fill="none" stroke="#cab4db" stroke-width="1"><circle r="13"/><circle r="10"/></g><circle r="6" fill="#d9b4dc"/><circle r="2" fill="#fff5d7"/>';
function frame(id){const i=C.byId(id);if(!i||i.kind!=='frame')return '';const m=i.motif;let decor='';
 const at=(x,y,art,rotate=0)=>`<g transform="translate(${x} ${y}) rotate(${rotate})">${art}</g>`;
 if(['blossom','ribbon'].includes(m))decor=at(18,26,flower)+at(282,26,flower)+at(18,454,flower)+at(282,454,flower)+(m==='ribbon'?at(150,462,ribbon):'');
 if(['vinyl','record'].includes(m))decor=at(20,25,record)+at(280,454,record)+'<path d="M8 52v370M292 52v370" stroke-dasharray="3 7"/>';
 if(['stars','twinkle','encore'].includes(m))decor=at(20,25,star)+at(280,25,star)+at(20,455,star)+at(280,455,star)+'<path d="M35 12h230M35 468h230" fill="none"/>'+(m==='encore'?'<path d="m122 18 7-10 11 9 10-15 10 15 11-9 7 10v8h-56Z"/>':'');
 if(['letter','confetti'].includes(m))decor=at(20,24,ribbon)+at(280,450,ribbon,180)+(m==='confetti'?'<path d="M10 60h8v12h-8zm272 36h8v12h-8zM10 350h8v12h-8zm272 40h8v12h-8z"/>':'');
 if(m==='ticket')decor='<path d="M5 75h290M5 425h290" fill="none" stroke-dasharray="3 6"/><circle cx="0" cy="75" r="10" fill="#f5ede7"/><circle cx="300" cy="75" r="10" fill="#f5ede7"/><path d="M25 460h250" stroke-width="8" stroke-dasharray="2 4 1 3"/>';
 if(m==='piano')decor=Array.from({length:20},(_,n)=>`<rect x="${n*15}" y="459" width="14" height="21" fill="#fff8e9"/>${n%7!==2&&n%7!==6?`<rect x="${n*15+10}" y="459" width="8" height="12" fill="#302d3d"/>`:''}`).join('');
 if(m==='varsity')decor='<path d="M5 12h290M5 20h290M5 460h290M5 468h290" stroke="#fff3d4" stroke-width="3"/><path d="M282 90v280" stroke-dasharray="2 18" stroke-width="5"/>';
 return `<svg class="card-frame-art" viewBox="0 0 300 480" preserveAspectRatio="none" aria-hidden="true" fill="${i.color}" stroke="${i.color}"><rect x="7" y="7" width="286" height="466" rx="3" fill="none" stroke-width="2"/>${decor}</svg>`;
}
const stageSet=()=>'<div class="capsule-scenery" aria-hidden="true"><div class="scenery-led"><i></i><i></i><i></i></div><div class="scenery-curtain left"></div><div class="scenery-curtain right"></div><div class="scenery-valance"></div><div class="scenery-truss"></div><div class="scenery-lamps"><i></i><i></i><i></i><i></i><i></i></div><div class="scenery-risers"></div><div class="scenery-floor"></div></div>';
function stageAttributes(i){return `data-stage-skin="${i.motif}" style="--skin-stage:${i.color};--skin-stage-dark:${i.paper}"`;}
module.exports={attributes,frame,stageSet,stageAttributes};

},
"src/client/our-stage-decor-art.js":function(module,exports,__require){
'use strict';
const D=__require("src/shared/our-stage-stage-shop.js");
const rect=(x,y,w,h,c)=>`<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${c}"/>`;
const svg=(body,cls='',height=360)=>`<svg class="${cls}" viewBox="0 0 600 ${height}" preserveAspectRatio="none" aria-hidden="true" shape-rendering="crispEdges">${body}</svg>`;
const wood=()=>rect(0,270,600,90,'#9c705c')+Array.from({length:6},(_,i)=>rect(0,270+i*18,600,3,'#644c49')+rect(i%2?80:20,270+i*18,2,18,'#c19a79')+rect(i%2?380:260,270+i*18,2,18,'#c19a79')).join('');
function backdrop(id){let b='';
 if(id==='hall'){
  b=rect(0,0,600,360,'#2c2536')+wood()+rect(65,30,470,220,'#4c3042');
  for(const x of [0,530])for(let n=0;n<5;n++)b+=rect(x+n*14,15,14,265,['#713f53','#96536b','#61374d','#81455d','#4b2f43'][n]);
  b+=rect(0,0,600,25,'#96536b')+rect(0,25,600,5,'#d8b78c');
  for(const x of [120,290,460])b+=rect(x,32,16,30,'#39303b')+rect(x-14,60,44,10,'#d8bc8b')+rect(x-8,70,32,5,'#fff0c8');
  b+=`<image href="/images/game/our-stage/card-logo.svg" x="245" y="105" width="110" height="32" opacity=".65"/>`;
 }else if(id==='showcase'){
  b=rect(0,0,600,360,'#d3c9ba')+wood()+rect(32,40,536,205,'#826f6a');
  for(let n=0;n<4;n++){const x=40+n*132;b+=rect(x,48,124,188,'#a8bbc1')+`<path d="M${x} 180l124-110v28l-124 110Z" fill="#dce7df" opacity=".55"/>`+rect(x+120,48,4,188,'#ead9c3');}
  b+=rect(20,217,560,8,'#725745')+rect(28,0,7,27,'#574b47')+rect(20,27,25,9,'#fff0c7')+rect(563,0,7,27,'#574b47')+rect(555,27,25,9,'#fff0c7');
 }else if(id==='rooftop'){
  b=rect(0,0,600,360,'#20263e')+rect(0,120,600,150,'#30354d')+rect(453,34,27,27,'#edddae')+rect(448,39,37,17,'#edddae');
  for(let n=0;n<11;n++){const x=n*58,h=45+(n*31)%80,y=260-h;b+=rect(x,y,50,h,n%2?'#3c4159':'#292e46');for(let row=0;row<4;row++)for(let col=0;col<3;col++)if((row+col+n)%3)b+=rect(x+8+col*13,y+10+row*19,5,7,'#ba9b78');}
  for(let n=0;n<12;n++)b+=rect(22+n*49,18+(n*37)%86,3,3,'#b5aec5');
  b+=wood()+rect(0,248,600,6,'#9e9ba5')+Array.from({length:16},(_,n)=>rect(n*40,248,4,40,'#747182')).join('');
 }
 return b?svg(b,'shop-backdrop'):'';
}
const scatter=(n,salt=0)=>{const v=Math.sin((n+1)*127.1+(salt+1)*311.7)*43758.5453;return v-Math.floor(v);};
function effect(id,preview=false){
 if(!['petals','confetti','starlight'].includes(id))return '';
 let b=preview?rect(0,0,600,360,'#29263e'):'';
 const stars=id==='starlight',count=stars?23:id==='petals'?25:38;
 for(let n=0;n<count;n++){
  const x=Math.round(12+scatter(n,31)*576),y=Math.round(12+scatter(n,32)*325),size=3+Math.round(scatter(n,33)*4),speed=stars?3+scatter(n,34)*4:7+scatter(n,34)*6;
  const color=(id==='petals'?['#f8c4d8','#e99dbf','#ffe1e8']:stars?['#fff2c7','#ddd8ff','#e4f3ff']:['#ffd49d','#f2aecf','#c4b3f3','#afdfdd'])[n% (stars?3:id==='petals'?3:4)];
  const shape=stars?rect(-1,-size,2,size*2,color)+rect(-size,-1,size*2,2,color)+rect(-2,-2,4,4,'#fff8e9'):id==='petals'?`<path d="M-4-5h6v3h3v5H2v3h-5V3h-3V-2h2Z" fill="${color}"/>`:rect(-2,-size/2,4,size,color);
  b+=`<g transform="translate(${x} ${stars?y:-16})"><g class="${stars?'shop-fx-star':'shop-fx-fall'}" style="--fx-speed:${speed}s;--fx-delay:${-scatter(n,35)*speed}s;--fx-drift:${Math.round(scatter(n,36)*60-30)}px;--fx-rest:${y}px">${shape}</g></g>`;
 }
 return svg(b,preview?'shop-effect-thumb':'shop-effect');
}
function pixelName(name,x,y,color){const {glyphs}=__require("src/shared/our-stage-name-tag.js");let d='';[...name].forEach((letter,i)=>glyphs[letter].forEach((row,yy)=>[...row].forEach((dot,xx)=>{if(dot==='1')d+=`M${x+i*26+xx*2} ${y+yy*2}h2v2h-2z`;})));return `<path fill="${color}" d="${d}"/>`;}
const heart=(x,y,color)=>`<path fill="${color}" d="M${x} ${y+3}h3v-3h6v3h3v-3h6v3h3v6h-3v3h-3v3h-3v3h-3v-3h-3v-3h-3v-3h-3Z"/>`;
function crowd(){let b='';
 for(let row=0;row<3;row++)for(let n=0;n<29;n++){
  const x=n*22+(row%2)*9-5,y=48+row*28+Math.floor(scatter(n,row*17)*13);
  b+=rect(x+2,y,9,3,'#342c43')+rect(x,y+3,13,10,'#342c43')+rect(x-4,y+13,21,19,'#342c43');
 }
 return `<g class="audience-crowd">${b}</g>`;
}
function audience(id){let b=crowd();
 if(id==='lightsticks'){
  for(let row=0;row<3;row++)for(let n=0;n<29;n++){
   const k=row*29+n,x=Math.round(n*21+(row%2)*8-5+scatter(k,41)*7),y=Math.round(4+row*32+scatter(k,42)*16),w=17+row*2;
   b+=`<g class="audience-lightstick" style="--audience-delay:${-scatter(k,43)*4}s;--audience-speed:${2.5+scatter(k,44)*2}s"><image href="/images/game/our-stage/official-lightstick.svg" x="${x}" y="${y}" width="${w}" height="${w*80/48}"/></g>`;
  }
 }else if(id==='balloons'){
  for(let row=0;row<3;row++)for(let n=0;n<29;n++){
   const k=row*29+n,x=Math.round(n*21+(row%2)*9-7+scatter(k,5)*8),y=Math.round(5+row*31+scatter(k,12)*22),scale=.65+row*.13+scatter(k,21)*.16;
   b+=`<g class="audience-balloon" style="--audience-delay:${-scatter(k,2)*5}s;--audience-speed:${3+scatter(k,3)*2}s"><g transform="translate(${x} ${y}) scale(${scale})">`+rect(9,23,1,47,'#a97691')+`<path d="M5 0h10v3h4v4h3v12h-3v4h-4v3h-4v3H8v-3H5v-3H1v-4h-3V7h3V3h4Z" fill="${['#ef99bb','#f3b4cd','#db7fa8','#ffc6dc'][Math.floor(scatter(k,4)*4)]}"/>`+rect(3,7,3,8,'#ffe9f2')+rect(6,4,5,3,'#ffe9f2')+'</g></g>';
  }
 }else if(id==='phone-lights'){
  for(let row=0;row<4;row++)for(let n=0;n<30;n++){
   const k=row*30+n,x=Math.round(n*20+(row%2)*8+scatter(k,6)*9-5),y=Math.round(10+row*26+scatter(k,15)*17),w=6+row*2,h=10+row*3;
   b+=rect(x,y,w,h,'#373347')+rect(x+1,y+2,w-2,h-3,'#272536')+rect(x+Math.floor(w/2)-1,y+h,3,7,'#514255');
   b+=`<g class="audience-phone-glow" style="--audience-delay:${-scatter(k,8)*4}s;--audience-speed:${2.8+scatter(k,9)*2}s">`+`<circle cx="${x+2}" cy="${y+3}" r="${11+row*2}" fill="#d9e9ff" opacity=".11"/><circle cx="${x+2}" cy="${y+3}" r="${6+row}" fill="#e8efff" opacity=".3"/><circle cx="${x+2}" cy="${y+3}" r="${3+row*.4}" fill="#fffef4" opacity=".65"/>`+rect(x-1,y,6,6,'#fffef4')+(k%7===0?rect(x-5,y+2,14,2,'#edf4ff')+rect(x+1,y-4,2,14,'#edf4ff'):'')+'</g>';
  }
 }else if(id==='banner'){
  const boards=[{x:8,y:33,name:'보람',paper:'#f5c4d8',ink:'#733d61'},{x:155,y:14,name:'규리',paper:'#f4d2a8',ink:'#745044'},{x:305,y:43,name:'연지',paper:'#d6c8ed',ink:'#594477'},{x:454,y:24,name:null,paper:'#e9d8e0',ink:'#764b67'}];
  for(const [i,a]of boards.entries()){
   b+=`<g class="audience-placard" style="--audience-delay:${-i*.8}s;--audience-speed:${3.6+i*.3}s">`;
   b+=rect(a.x+19,a.y+39,7,51,'#c6a0a1')+rect(a.x+102,a.y+39,7,51,'#b88f9b')+rect(a.x+3,a.y+3,132,43,'#110f23')+rect(a.x,a.y,132,43,a.ink)+rect(a.x+3,a.y+3,126,37,a.paper);
   b+=rect(a.x+8,a.y+7,4,4,'#fff4e8')+rect(a.x+120,a.y+32,4,4,'#fff4e8');
   b+=a.name?pixelName(a.name,a.x+24,a.y+10,a.ink)+heart(a.x+88,a.y+13,a.ink):`<image href="/images/game/our-stage/card-logo.svg" x="${a.x+20}" y="${a.y+10}" width="76" height="22"/>`+heart(a.x+101,a.y+15,a.ink);
   b+=rect(a.x+15,a.y+35,14,10,'#e3b6ad')+rect(a.x+99,a.y+35,14,10,'#dab0ad')+'</g>';
  }
 }else return '';
 return svg(b,'shop-audience',128).replace('preserveAspectRatio="none"','preserveAspectRatio="xMidYMid meet"');
}
function thumbnail(id){const i=D.byId(id);if(!i)return '';return i.slot==='background'?backdrop(id):i.slot==='effect'?effect(id,true):audience(id);}
module.exports={backdrop,effect,audience,thumbnail};

},
"src/data/our-stage-layers.json":function(module,exports,__require){
module.exports={"base":{"image":"/images/game/our-stage/layers/base.png","width":1536,"height":1024,"members":{"br":{"head":[52,17,430,579],"body":[170,657,254,347],"chin":362},"gr":{"head":[541,16,430,578],"body":[630,657,262,347],"chin":363},"yj":{"head":[1027,17,452,565],"body":[1117,657,250,347],"chin":362}},"headImage":"/images/game/our-stage/layers/base-earrings.png"},"first-mind":{"image":"/images/game/our-stage/layers/first-mind.png","width":1536,"height":1024,"members":{"br":{"head":[124,48,380,378],"body":[202,666,233,332],"chin":372},"gr":{"head":[1024,47,389,573],"body":[1100,666,233,332],"chin":372},"yj":{"head":[552,46,472,514],"body":[650,665,234,333],"chin":372}},"headImage":"/images/game/our-stage/layers/first-mind-earrings.png"},"lovely-sweet-heart":{"image":"/images/game/our-stage/layers/lovely-sweet-heart.png","width":1536,"height":1024,"members":{"br":{"head":[113,25,384,526],"body":[182,631,257,380],"chin":373},"gr":{"head":[581,12,373,379],"body":[635,629,267,382],"chin":373},"yj":{"head":[1024,24,427,539],"body":[1098,631,261,380],"chin":373}},"headImage":"/images/game/our-stage/layers/lovely-sweet-heart-earrings.png"},"california-dream":{"image":"/images/game/our-stage/layers/california-dream-stage.png","width":1536,"height":1024,"members":{"br":{"head":[84,21,412,476],"body":[159,595,259,416],"chin":380},"gr":{"head":[588,48,352,363],"body":[638,595,261,416],"chin":383},"yj":{"head":[1070,7,401,539],"body":[1119,595,259,416],"chin":380}},"headImage":"/images/game/our-stage/layers/california-dream-earrings.png"},"brilliant-change":{"image":"/images/game/our-stage/layers/brilliant-change-v2.png","width":1536,"height":1024,"members":{"br":{"head":[115,98,341,459],"body":[176,626,228,367],"chin":383},"gr":{"head":[570,74,397,343],"body":[654,626,229,367],"chin":383},"yj":{"head":[1055,62,393,512],"body":[1129,626,239,367],"chin":383}},"headImage":"/images/game/our-stage/layers/brilliant-change-earrings.png"},"rebloom":{"image":"/images/game/our-stage/layers/rebloom.png","width":1536,"height":1024,"members":{"br":{"head":[73,11,401,558],"body":[183,672,227,334],"chin":334},"gr":{"head":[560,11,400,556],"body":[650,672,237,334],"chin":334},"yj":{"head":[1045,11,419,535],"body":[1128,672,228,334],"chin":334}},"headImage":"/images/game/our-stage/layers/rebloom-earrings.png"},"see-you-again":{"image":"/images/game/our-stage/layers/see-you-again.png","width":1536,"height":1024,"members":{"br":{"head":[158,29,312,387],"body":[205,640,224,348],"chin":389},"gr":{"head":[594,26,349,545],"body":[638,640,258,348],"chin":389},"yj":{"head":[1027,103,368,467],"body":[1088,640,233,348],"chin":389}},"headImage":"/images/game/our-stage/layers/see-you-again-earrings.png"},"still-here":{"image":"/images/game/our-stage/layers/still-here.png","width":1536,"height":1024,"members":{"br":{"head":[1024,17,429,565],"body":[1109,678,247,332],"chin":352},"gr":{"head":[571,17,453,567],"body":[641,675,254,335],"chin":352},"yj":{"head":[84,17,409,574],"body":[181,678,246,332],"chin":352}},"headImage":"/images/game/our-stage/layers/still-here-earrings.png"},"first-again":{"image":"/images/game/our-stage/layers/first-again.png","width":1536,"height":1024,"members":{"br":{"head":[1030,27,397,540],"body":[1107,644,250,359],"chin":354},"gr":{"head":[556,26,411,577],"body":[641,644,255,359],"chin":355},"yj":{"head":[121,26,370,540],"body":[202,644,229,360],"chin":355}},"headImage":"/images/game/our-stage/layers/first-again-earrings.png"},"stage-sugarman":{"image":"/images/game/our-stage/layers/stage-sugarman.png","width":1536,"height":1024,"members":{"br":{"head":[121,25,357,453],"body":[184,630,233,355],"chin":346},"gr":{"head":[585,25,368,519],"body":[643,630,250,356],"chin":344},"yj":{"head":[1057,25,364,519],"body":[1119,630,234,356],"chin":346}},"headImage":"/images/game/our-stage/layers/stage-sugarman-earrings.png"},"stage-seasons":{"image":"/images/game/our-stage/layers/stage-seasons.png","width":1536,"height":1024,"members":{"br":{"head":[579,21,381,533],"body":[649,632,244,358],"chin":333},"gr":{"head":[140,21,346,539],"body":[202,633,243,358],"chin":333},"yj":{"head":[1042,21,362,528],"body":[1109,633,227,358],"chin":333}},"headImage":"/images/game/our-stage/layers/stage-seasons-earrings.png"},"practice":{"image":"/images/game/our-stage/layers/practice-v3.png","width":1536,"height":1024,"members":{"br":{"head":[91,26,390,399],"body":[178,656,234,349],"chin":363},"gr":{"head":[589,28,345,535],"body":[650,656,231,349],"chin":363},"yj":{"head":[1068,28,356,526],"body":[1125,656,234,349],"chin":363}}},"tour-believe":{"image":"/images/game/our-stage/layers/tour-believe.png","width":1536,"height":1024,"members":{"br":{"head":[71,24,408,571],"body":[169,658,253,347],"chin":362},"gr":{"head":[570,13,382,580],"body":[631,658,274,347],"chin":362},"yj":{"head":[1045,35,403,550],"body":[1119,658,248,347],"chin":362}},"headImage":"/images/game/our-stage/layers/tour-believe-earrings.png"},"tour-encore":{"image":"/images/game/our-stage/layers/tour-encore.png","width":1536,"height":1024,"members":{"br":{"head":[57,23,418,572],"body":[172,657,249,350],"chin":362},"gr":{"head":[551,24,410,566],"body":[638,657,251,350],"chin":362},"yj":{"head":[1040,23,428,551],"body":[1117,657,248,350],"chin":362}},"headImage":"/images/game/our-stage/layers/tour-encore-earrings.png"},"tour-varsity":{"image":"/images/game/our-stage/layers/tour-varsity.png","width":1536,"height":1024,"members":{"br":{"head":[56,23,419,572],"body":[173,639,249,369],"chin":362},"gr":{"head":[552,23,407,568],"body":[637,638,261,370],"chin":362},"yj":{"head":[1008,23,428,552],"body":[1085,639,248,369],"chin":362}},"headImage":"/images/game/our-stage/layers/tour-varsity-earrings.png"},"stage-hanbok":{"image":"/images/game/our-stage/layers/california-dream-v2.png","width":1536,"height":1024,"members":{"br":{"head":[107,26,346,538],"body":[167,657,263,344],"chin":363},"gr":{"head":[602,28,333,529],"body":[628,657,281,344],"chin":363},"yj":{"head":[1074,26,348,524],"body":[1108,657,269,344],"chin":363}}},"capsule-white":{"image":"/images/game/our-stage/layers/capsule-white.png","width":1536,"height":1024,"members":{"br":{"head":[0,0,512,610],"body":[100,630,350,394],"chin":364},"gr":{"head":[512,0,512,610],"body":[612,630,350,394],"chin":364},"yj":{"head":[1024,0,512,610],"body":[1124,630,350,394],"chin":364}}},"capsule-silver":{"image":"/images/game/our-stage/layers/capsule-silver.png","width":1536,"height":1024,"members":{"br":{"head":[0,0,512,610],"body":[100,630,350,394],"chin":364},"gr":{"head":[512,0,512,610],"body":[612,630,350,394],"chin":364},"yj":{"head":[1024,0,512,610],"body":[1124,630,350,394],"chin":364}}},"capsule-cocktail":{"image":"/images/game/our-stage/layers/capsule-cocktail.png","width":1536,"height":1024,"members":{"br":{"head":[0,0,512,610],"body":[100,630,350,394],"chin":364},"gr":{"head":[512,0,512,610],"body":[612,630,350,394],"chin":364},"yj":{"head":[1024,0,512,610],"body":[1124,630,350,394],"chin":364}}},"capsule-hotgirl":{"image":"/images/game/our-stage/layers/capsule-hotgirl.png","width":1536,"height":1024,"members":{"br":{"head":[0,0,512,610],"body":[100,630,350,394],"chin":364},"gr":{"head":[512,0,512,610],"body":[612,630,350,394],"chin":364},"yj":{"head":[1024,0,512,610],"body":[1124,630,350,394],"chin":364}}},"capsule-nightingale":{"image":"/images/game/our-stage/layers/capsule-solo-20261119.png","width":1536,"height":1024,"members":{"br":{"head":[0,0,512,580],"body":[100,600,350,424],"chin":400}}},"capsule-kairos":{"image":"/images/game/our-stage/layers/capsule-solo-20261119.png","width":1536,"height":1024,"members":{"gr":{"head":[512,0,512,580],"body":[612,600,350,424],"chin":358}}},"capsule-gasoline":{"image":"/images/game/our-stage/layers/capsule-solo-20261119.png","width":1536,"height":1024,"members":{"yj":{"head":[1024,0,512,580],"body":[1124,600,350,424],"chin":452}}},"capsule-brother":{"image":"/images/game/our-stage/layers/capsule-solo-normal-20261119.png","width":1536,"height":1024,"members":{"br":{"head":[0,0,512,590],"body":[100,630,350,394],"chin":359}}},"capsule-good-day":{"image":"/images/game/our-stage/layers/capsule-solo-rare-20261119.png","width":1536,"height":1024,"members":{"br":{"head":[0,0,512,590],"body":[100,630,350,394],"chin":364}}},"capsule-sorrow":{"image":"/images/game/our-stage/layers/capsule-solo-normal-20261119.png","width":1536,"height":1024,"members":{"gr":{"head":[512,0,512,590],"body":[612,630,350,394],"chin":359}}},"capsule-confession":{"image":"/images/game/our-stage/layers/capsule-solo-rare-20261119.png","width":1536,"height":1024,"members":{"gr":{"head":[512,0,460,440],"body":[612,630,350,394],"chin":364}}},"capsule-mom":{"image":"/images/game/our-stage/layers/capsule-solo-normal-20261119.png","width":1536,"height":1024,"members":{"yj":{"head":[1024,0,512,590],"body":[1124,630,350,394],"chin":359}}},"capsule-wind":{"image":"/images/game/our-stage/layers/capsule-solo-rare-20261119.png","width":1536,"height":1024,"members":{"yj":{"head":[1008,0,528,590],"body":[1080,630,360,394],"chin":364}}},"capsule-49days":{"image":"/images/game/our-stage/layers/capsule-drama-20261119.png","width":1254,"height":1254,"members":{"gr":{"head":[0,0,627,650],"body":[150,690,430,550],"chin":402}}},"capsule-cruel-city":{"image":"/images/game/our-stage/layers/capsule-drama-20261119.png","width":1254,"height":1254,"members":{"gr":{"head":[627,0,627,650],"body":[710,690,430,550],"chin":402}}},"capsule-wedding":{"image":"/images/game/our-stage/layers/capsule-wedding-2007.png","width":1536,"height":1024,"members":{"br":{"head":[0,0,512,590],"body":[100,610,350,414],"chin":363},"gr":{"head":[512,0,512,590],"body":[612,610,350,414],"chin":363},"yj":{"head":[1024,0,512,590],"body":[1124,610,350,414],"chin":363}}}};
},
"src/shared/our-stage-motion-library.js":function(module,exports,__require){
'use strict';
module.exports={
 scent:{seconds:64,speed:2,range:'1:01–2:05',title:'여인의 향기',album:'first-mind',label:'1집',description:'후렴의 팔선과 무릎 동작 · 대형 이동 · 보컬 파트 전환',source:'https://www.youtube.com/watch?v=rFCNRIpPukY&t=61s'},
 greeting:{seconds:28,speed:1,range:'1:32–2:00',title:'사랑의 인사',album:'lovely-sweet-heart',label:'2집',description:'사선 방향 전환과 교차 스텝 · 멤버별 팔선 · 보컬 파트 전환',source:'https://www.youtube.com/watch?v=63sCks2FLBI&t=92s'},
 marry:{seconds:24,speed:2,range:'2:23–2:47',title:'결혼할까요',album:'lovely-sweet-heart',label:'2집',description:'가슴에 모았다 펴기 · 약속 손짓 · 얼굴 옆 웨이브 · 제자리 발끝 들기',source:'https://www.youtube.com/watch?v=D-mng72Hx1w&t=143s'},
 voice:{seconds:20,speed:2,range:'0:47–1:07',title:'그 놈 목소리',album:'first-again',label:'20주년 콘서트',description:'네 번 이어지는 큰 팔선 · 머리 옆 접기와 펼치기 · 무릎 반동 · 자리 고정',source:'https://www.youtube.com/watch?v=i9tx0-ldVYc&t=47s'}
};

},
"src/data/our-stage-mouths.json":function(module,exports,__require){
module.exports={"base":{"br":[294,318],"gr":[763,318],"yj":[1233,318]},"first-mind":{"br":[322,324],"gr":[1210,324],"yj":[766,324]},"lovely-sweet-heart":{"br":[312,326],"gr":[770,326],"yj":[1202,326]},"california-dream":{"br":[294,334],"gr":[767,336],"yj":[1242,334]},"brilliant-change":{"br":[286,338],"gr":[768,338],"yj":[1248,338]},"rebloom":{"br":[298,292],"gr":[766,292],"yj":[1215,292]},"see-you-again":{"br":[320,348],"gr":[774,349],"yj":[1198,348]},"still-here":{"br":[1203,308],"gr":[766,308],"yj":[305,308]},"first-again":{"br":[1223,308],"gr":[766,308],"yj":[320,308]},"stage-sugarman":{"br":[305,302],"gr":[770,302],"yj":[1234,302]},"stage-seasons":{"br":[774,287],"gr":[328,287],"yj":[1216,287]},"practice":{"br":[294,318],"gr":[763,318],"yj":[1240,318]},"tour-believe":{"br":[294,318],"gr":[764,318],"yj":[1233,318]},"tour-encore":{"br":[294,317],"gr":[764,317],"yj":[1218,317]},"tour-varsity":{"br":[293,317],"gr":[763,317],"yj":[1201,317]},"stage-hanbok":{"br":[294,318],"gr":[764,318],"yj":[1242,318]},"capsule-white":{"br":[292,312],"gr":[760,312],"yj":[1242,312]},"capsule-silver":{"br":[298,317],"gr":[766,317],"yj":[1245,317]},"capsule-cocktail":{"br":[297,317],"gr":[764,316],"yj":[1244,316]},"capsule-hotgirl":{"br":[297,316],"gr":[766,316],"yj":[1244,316]},"capsule-nightingale":{"br":[302,350]},"capsule-kairos":{"gr":[776,315]},"capsule-gasoline":{"yj":[1240,379]},"capsule-brother":{"br":[293,316]},"capsule-good-day":{"br":[292,317]},"capsule-sorrow":{"gr":[766,316]},"capsule-confession":{"gr":[771,317]},"capsule-mom":{"yj":[1246,316]},"capsule-wind":{"yj":[1214,317]},"capsule-49days":{"gr":[356,354]},"capsule-cruel-city":{"gr":[898,354]},"capsule-wedding":{"br":[296,315],"gr":[764,315],"yj":[1243,314]}};
},
"src/shared/our-stage-sprite-geometry.js":function(module,exports,__require){
'use strict';
const anchors=__require("src/data/our-stage-anchors.json");
// Align the anatomical chin and neck, not the bounding box of asymmetric hair.
module.exports=function geometry(member,hairId,clothesId,layers){
 const h=layers[hairId].members[member],b=layers[clothesId].members[member];
 const headAnchor=anchors[hairId][member].head,neckAnchor=anchors[clothesId][member].neck;
 const reach=Math.max(headAnchor[0]-h.head[0],h.head[0]+h.head[2]-headAnchor[0]);
 const hs=Math.min(320/(headAnchor[1]-h.head[1]),216/reach),bs=320/b.body[3];
 return {hw:h.head[2]*hs,hh:h.head[3]*hs,bw:b.body[2]*bs,bh:320,
  headX:220-(headAnchor[0]-h.head[0])*hs,headY:345-(headAnchor[1]-h.head[1])*hs,
  bodyX:220-(neckAnchor[0]-b.body[0])*bs,bodyY:340-(neckAnchor[1]-b.body[1])*bs};
};

},
"src/data/our-stage-anchors.json":function(module,exports,__require){
module.exports={"first-again":{"gr":{"neck":[768,658],"head":[764,356]},"yj":{"neck":[317.5,657],"head":[318,356]},"br":{"neck":[1232.5,658],"head":[1221,355]}},"rebloom":{"gr":{"neck":[768.5,672],"head":[768.5,335]},"yj":{"neck":[1241,672],"head":[1242.5,335]},"br":{"neck":[297,672],"head":[301,335]}},"stage-hanbok":{"gr":{"neck":[768.5,657],"head":[764,364]},"yj":{"neck":[1242.5,657],"head":[1244.5,364]},"br":{"neck":[298.5,657],"head":[298,364]}},"stage-seasons":{"gr":{"neck":[324,633],"head":[328.5,334]},"yj":{"neck":[1219,633],"head":[1218.5,334]},"br":{"neck":[769.5,632],"head":[776.5,334]}},"california-dream":{"gr":{"neck":[768.5,595],"head":[766.5,384]},"yj":{"neck":[1248,595],"head":[1242,381]},"br":{"neck":[290.5,595],"head":[292,381]}},"still-here":{"gr":{"neck":[767.5,676],"head":[768,353]},"yj":{"neck":[305,678],"head":[306.5,353]},"br":{"neck":[1235,678],"head":[1229.5,353]}},"stage-sugarman":{"gr":{"neck":[768,640],"head":[771,345]},"yj":{"neck":[1236,640],"head":[1236.5,347]},"br":{"neck":[300,640],"head":[305.5,347]}},"see-you-again":{"gr":{"neck":[768,640],"head":[772.5,390]},"yj":{"neck":[1204.5,640],"head":[1199,390]},"br":{"neck":[319,640],"head":[317.5,390]}},"tour-encore":{"gr":{"neck":[767.5,657],"head":[765.5,363]},"yj":{"neck":[1241.5,657],"head":[1237.5,363]},"br":{"neck":[297,657],"head":[297,363]}},"base":{"gr":{"neck":[766,657],"head":[765.5,364]},"yj":{"neck":[1241.5,657],"head":[1238,364]},"br":{"neck":[298,657],"head":[299,364]}},"practice":{"gr":{"neck":[765.5,656],"head":[762.5,364]},"yj":{"neck":[1242,656],"head":[1244,364]},"br":{"neck":[296.5,656],"head":[296.5,364]}},"tour-varsity":{"gr":{"neck":[768,639],"head":[765.5,363]},"yj":{"neck":[1209,639],"head":[1206,363]},"br":{"neck":[297.5,639],"head":[296.5,363]}},"lovely-sweet-heart":{"gr":{"neck":[768.5,629],"head":[772,374]},"yj":{"neck":[1227.5,631],"head":[1227.5,374]},"br":{"neck":[311.5,631],"head":[311.5,374]}},"brilliant-change":{"gr":{"neck":[769,626],"head":[768.5,384]},"yj":{"neck":[1248,626],"head":[1249,384]},"br":{"neck":[291,626],"head":[287,384]}},"tour-believe":{"gr":{"neck":[767,658],"head":[764.5,363]},"yj":{"neck":[1242.5,658],"head":[1238,363]},"br":{"neck":[297,658],"head":[296,363]}},"first-mind":{"gr":{"neck":[1215.5,667],"head":[1212.5,373]},"yj":{"neck":[767,665],"head":[766,373]},"br":{"neck":[318.5,667],"head":[320.5,373]}},"capsule-white":{"br":{"neck":[297.5,643],"head":[292.5,358]},"yj":{"neck":[1243,644],"head":[1241.5,358]},"gr":{"neck":[769,642],"head":[759.5,358]}},"capsule-silver":{"br":{"neck":[296.5,655],"head":[300.5,364]},"yj":{"neck":[1241.5,655],"head":[1247,364]},"gr":{"neck":[764.5,655],"head":[767.5,364]}},"capsule-cocktail":{"gr":{"neck":[765.5,656],"head":[766.5,363]},"br":{"neck":[296,655],"head":[301,363]},"yj":{"neck":[1241.5,655],"head":[1246,363]}},"capsule-hotgirl":{"gr":{"neck":[765.5,653],"head":[767,364]},"br":{"neck":[296,653],"head":[299.5,364]},"yj":{"neck":[1241,654],"head":[1247,364]}},"capsule-nightingale":{"br":{"head":[301,400],"neck":[300,614]}},"capsule-kairos":{"gr":{"head":[777,358],"neck":[769,614]}},"capsule-gasoline":{"yj":{"head":[1237,452],"neck":[1238,614]}},"capsule-brother":{"br":{"head":[294,359],"neck":[294,639]}},"capsule-good-day":{"br":{"head":[294,364],"neck":[294,655]}},"capsule-sorrow":{"gr":{"head":[766,359],"neck":[766,639]}},"capsule-confession":{"gr":{"head":[770,364],"neck":[766,655]}},"capsule-mom":{"yj":{"head":[1248,359],"neck":[1248,639]}},"capsule-wind":{"yj":{"head":[1217,364],"neck":[1215,655]}},"capsule-49days":{"gr":{"head":[354,402],"neck":[352,695]}},"capsule-cruel-city":{"gr":{"head":[900,402],"neck":[899,695]}},"capsule-wedding":{"br":{"head":[298,363],"neck":[296,632]},"gr":{"head":[765,363],"neck":[766,629]},"yj":{"head":[1244,363],"neck":[1245,630]}}};
},
"src/client/our-stage-choreo.js":function(module,exports,__require){
'use strict';

// Articulated cuts of the approved first-album sprite, not a new character design.
// The source atlas is normalised to 234 × 333 so all three mapped costumes share joints.
// Greeting gesture reference: https://www.youtube.com/watch?v=63sCks2FLBI&t=92s
// Gesture reference: https://www.youtube.com/watch?v=rFCNRIpPukY&t=61s
// Source-timed, member-specific gestures. The elbow bends independently of the shoulder.
module.exports=function choreoBody({uid,image,head,x,y=340,width,mode,height=320}){
 const legY=mode==='greeting'?195:208;
 const left='0,32 72,32 62,78 62,112 50,137 47,184 0,184';
 const right='234,32 162,32 172,78 172,112 184,137 187,184 234,184';
 const piece=(name,shape)=>`<clipPath id="${uid}-${name}">${shape}</clipPath>`;
 const cut=name=>`<g clip-path="url(#${uid}-${name})">${image}</g>`;
 return `<g class="scent-facing-head">${head}</g><g class="scent-facing-body"><svg class="scent-body" x="${x}" y="${y}" width="${width}" height="${height}" viewBox="0 0 234 333" overflow="visible">
 <defs>${piece('left',`<polygon points="${left}"/>`)}${piece('right',`<polygon points="${right}"/>`)}${piece('arm-top','<rect width="234" height="113"/>')}${piece('arm-bottom','<rect y="112" width="234" height="100"/>')}${piece('leg-l',`<rect x="0" y="${legY}" width="117" height="${333-legY}"/>`)}${piece('leg-r',`<rect x="117" y="${legY}" width="117" height="${333-legY}"/>`)}
 <mask id="${uid}-torso" maskUnits="userSpaceOnUse" x="0" y="0" width="234" height="333"><rect width="234" height="${legY+2}" fill="white"/><polygon points="${left}" fill="black"/><polygon points="${right}" fill="black"/></mask></defs>
 <g class="scent-step-left"><g class="scent-leg scent-leg-left">${cut('leg-l')}</g></g><g class="scent-step-right"><g class="scent-leg scent-leg-right">${cut('leg-r')}</g></g>
 <g class="scent-upper"><g mask="url(#${uid}-torso)">${image}</g>
 <g class="scent-arm scent-free-arm"><g clip-path="url(#${uid}-arm-top)">${cut('left')}</g><g class="scent-elbow-left"><g clip-path="url(#${uid}-arm-bottom)">${cut('left')}</g></g></g>
 <g class="scent-arm scent-singing-arm"><g clip-path="url(#${uid}-arm-top)">${cut('right')}</g><g class="scent-elbow-right"><g clip-path="url(#${uid}-arm-bottom)">${cut('right')}</g><g class="scent-hand-mic" shape-rendering="crispEdges"><path fill="#292631" d="M202 145h12v45h-12z"/><path fill="#aea6bb" d="M198 185h20v18h-20z"/><path fill="#e8e2ed" d="M198 195h20v5h-20z"/><path fill="#ffcfac" d="M199 145h17v13h-17z"/></g></g></g></g></svg></g>`;
};

},
"src/client/our-stage-storage.js":function(module,exports,__require){
'use strict';
// The last successfully observed value is a compare-and-swap baseline.
module.exports=function({storage,key,load}){
 let baseline=storage.getItem(key),dirty=false,conflict=false;
 function pull(){const raw=storage.getItem(key);if(dirty){conflict=raw!==baseline;return null;}if(raw===baseline)return null;const value=raw?load(raw):null;baseline=raw;return value;}
 function write(value){dirty=true;try{const raw=storage.getItem(key);if(raw!==baseline){conflict=true;return false;}const next=JSON.stringify(value);storage.setItem(key,next);baseline=next;dirty=false;conflict=false;return true;}catch{return false;}}
 function adopt(){baseline=storage.getItem(key);dirty=false;conflict=false;}
 function discard(){const raw=storage.getItem(key);const value=raw?load(raw):null;baseline=raw;dirty=false;conflict=false;return value;}
 return {pull,write,adopt,discard,get dirty(){return dirty;},get conflict(){return conflict;}};
};

},
"src/client/our-stage-backups.js":function(module,exports,__require){
"use strict";
// Independent of the live save: a failed history write must never erase it.
module.exports=function({storage,key,load,summary}){
 const historyKey=key+'-backups-v1',limit=12,maxChars=750000;
 let error='';
 const stamp=n=>Number.isSafeInteger(n)&&n>0&&n<253402268399999;
 const day=now=>new Date(now+9*3600000).toISOString().slice(0,10);
 function read(){
  const raw=storage.getItem(historyKey);if(!raw)return {version:1,next:1,daily:'',concerts:{},entries:[]};
  const h=JSON.parse(raw);
  if(h?.version!==1||!Number.isSafeInteger(h.next)||h.next<1||typeof h.daily!=='string'||!h.concerts||typeof h.concerts!=='object'||Array.isArray(h.concerts)||!Array.isArray(h.entries)||h.entries.length>limit||h.entries.some(e=>!e||typeof e.id!=='string'||!stamp(e.at)||typeof e.reason!=='string'||typeof e.raw!=='string')||new Set(h.entries.map(e=>e.id)).size!==h.entries.length)throw Error('history');
  return h;
 }
 function write(h){
  h.entries=h.entries.slice(0,limit);
  while(h.entries.length>1&&JSON.stringify(h).length>maxChars)h.entries.pop();
  while(true){try{storage.setItem(historyKey,JSON.stringify(h));error='';return;}catch(e){if(h.entries.length<=1)throw e;h.entries.pop();}}
 }
 function append(h,raw,reason,now){if(!stamp(now))throw Error('time');h.entries.unshift({id:now+'-'+h.next++,at:now,reason,raw});write(h);}
 const fail=()=>{error='백업 목록을 저장하거나 읽지 못했어요. 저장 공간을 확인하고 파일 백업도 보관해 주세요.';return {ok:false,error};};
 function add(state,reason='직접 백업',now=Date.now()){
  try{const raw=JSON.stringify(state);load(raw);append(read(),raw,reason,now);return {ok:true};}catch{return fail();}
 }
 function auto(state,now=Date.now(),visible=true){
  try{
   const h=read(),today=day(now),receipts={...state.simple?.concerts,...state.solo?.concerts};
   const completed=Object.entries(receipts).filter(([id,r])=>!h.concerts[id]&&stamp(r?.at));
   const first=h.entries.length===0&&h.daily==='';
   if(!(visible&&today>h.daily)&&(!completed.length||first))return {ok:true};
   for(const [id,r] of completed)h.concerts[id]=r.at;
   if(visible&&today>h.daily)h.daily=today;
   const reason=!first&&completed.length?'콘서트 완료 · '+completed.map(([id])=>summary(state,id).album).join(', '):'하루 첫 접속';
   const raw=JSON.stringify(state);load(raw);append(h,raw,reason,now);return {ok:true};
  }catch{return fail();}
 }
 function entries(){try{return read().entries.map(e=>{try{return {...summary(load(e.raw)),id:e.id,at:e.at,reason:e.reason,valid:true};}catch{return {id:e.id,at:e.at,reason:e.reason,valid:false};}});}catch{fail();return [];}}
 function raw(id){const entry=read().entries.find(e=>e.id===id);if(!entry)throw Error('missing');return entry.raw;}
 function get(id){return load(raw(id));}
 function restore(id,currentRaw,commit,now=Date.now()){
  try{
   const next=get(id),h=read();
   // Even a damaged live save is preserved before replacing it.
   if(currentRaw!==null)append(h,currentRaw,'복원 직전 기록',now);
   if(!commit(next)){error='복원 내용을 저장하지 못했어요. 기존 진행을 유지합니다.';return {ok:false,error};}
   error='';return {ok:true,state:next};
  }catch{return fail();}
 }
 return {limit,add,auto,entries,get,raw,restore,get error(){return error;}};
};

},
"src/client/our-stage-solo.js":function(module,exports,__require){
'use strict';
module.exports=function({M,state,selected,button,esc,panel,link}){
 function card(a){const s=state(),done=s.solo?.concerts[a.id],ready=M.soloConcertReady(s,a.id),n=a.tracks.filter(t=>M.soloDone(s,t.id)).length;
  return `<article class="album-concert-card"><div><h3>${esc(a.name)}</h3><small>${done?'콘서트 완료 · 티켓 획득':n+' / '+a.tracks.length+'곡 연습 완료'}</small></div><div class="album-concert-actions">${button(done?'다시 공연하기':'솔로 콘서트','perform','solo:'+a.id,ready?'primary':'',!ready)}${button('기념 티켓','ticket-open',a.id,'',!done)}</div></article>`;
 }
 function concerts(){const s=state();return `<section class="solo-concert-list"><h3>세 목소리의 솔로 무대</h3>${M.soloUnlocked(s)?M.soloAlbums.map(card).join('')+button('솔로곡 연습하기','solo-open'):'<p>20주년 콘서트 · First, Again을 마치면 열려요.</p>'}</section>`;}
 function songs(){const s=state();if(!M.soloUnlocked(s))return panel('<h2>세 목소리, 세 개의 무대</h2><p>20주년 콘서트 · First, Again을 마친 뒤<br>멤버들의 솔로곡을 만나보세요.</p>'+button('마지막 앨범 보기','album-view','first-again'));
  const a=M.soloById(selected()),active=s.solo?.active;
  return `<h2>세 목소리, 세 개의 무대</h2><div class="badge-filters solo-members" aria-label="솔로 멤버">${M.soloAlbums.map(x=>button(x.artist,'solo-member',x.id,a.id===x.id?'primary':'')).join('')}</div>${panel(`<div class="line"><h3>${esc(a.artist)}의 노래</h3><strong>${s.points} / 100 포인트</strong></div><details class="progress-help"><summary>솔로 무대 준비하기</summary><p>한 곡씩 연습하면 다음 노래가 열려요.<br>전곡 연습 후 솔로 콘서트와 티켓을 간직하세요.</p><p>한 곡 ${M.soloCost}포인트 · ${M.soloSeconds}초</p></details>${active?`<p class="solo-progress" role="status">${esc(M.soloTrackById(active.id).title)} 연습 중 · <b id="soloClock">${Math.max(0,Math.ceil((active.end-Date.now())/1000))}초</b></p>`:''}<div class="song-list">${a.tracks.map((t,i)=>{const done=M.soloDone(s,t.id),open=M.soloOpen(s,t.id),busy=active?.id===t.id;return `<article class="row song-row ${open?'collected':'is-locked'}"><span class="num">${i+1}</span><div><h3>${esc(t.title)}</h3><small>${done?'연습 완료':busy?'연습 중':open?'연습 가능':'앞 곡 연습 후 해금'}</small></div>${button(done?'완료':busy?'연습 중':open?'연습하기':'잠김','solo-train',t.id,open&&!done?'primary':'',done||!open||!!active||!!s.active||!!s.queue||s.points<M.soloCost)}${done?`<div class="solo-song-source">${link('영상 보기','https://www.youtube.com/watch?v='+t.youtubeId)}</div>`:''}</article>`;}).join('')}</div>${card(a)}`)}`;
 }
 function practice(selectedTrack){
  const s=state();if(!M.soloUnlocked(s))return '';
  const active=s.solo?.active,tracks=M.soloAlbums.flatMap(a=>a.tracks),open=tracks.filter(t=>M.soloOpen(s,t.id));
  const t=M.soloTrackById(active?.id)||open.find(t=>t.id===selectedTrack)||open.find(t=>!M.soloDone(s,t.id))||open[0];
  const a=M.soloAlbums.find(a=>a.tracks.some(x=>x.id===t.id)),done=M.soloDone(s,t.id),busy=active?.id===t.id,next=a.tracks[a.tracks.findIndex(x=>x.id===t.id)+1];
  const options=a.tracks.filter(x=>M.soloOpen(s,x.id)).map(x=>'<option value="'+x.id+'" '+(x.id===t.id?'selected':'')+'>'+esc(x.title)+(M.soloDone(s,x.id)?' · 완료':'')+'</option>').join('');
  const albums=M.soloAlbums.filter(a=>a.tracks.some(t=>M.soloOpen(s,t.id))).map(x=>'<option value="'+x.id+'" '+(x.id===a.id?'selected':'')+'>'+esc(x.name)+'</option>').join('');
  return panel(`<h2>솔로곡 연습</h2><div class="practice-picker"><label>솔로 앨범<select id="soloPracticeAlbum" aria-label="연습할 솔로 앨범" ${active?'disabled':''}>${albums}</select></label><label>노래<select id="soloPracticeTrack" aria-label="연습실 솔로곡" ${active?'disabled':''}>${options}</select></label></div><div class="line"><div><h3>${esc(t.title)}</h3><small>${esc(a.artist)}</small></div><strong>${done?'연습 완료':busy?'연습 중':'연습 가능'}</strong></div><div class="unified-practice">${button(done?'연습 완료':busy?'연습 중':`연습하기 · ${M.soloCost}포인트 · ${M.soloSeconds}초`,'solo-train',t.id,'primary',done||!!active||!!s.active||!!s.queue||s.points<M.soloCost)}</div><div class="queue" role="status">${busy?`남은 시간 <b id="soloClock">${Math.max(0,Math.ceil((active.end-Date.now())/1000))}초</b>`:s.active||s.queue?'진행 중인 앨범곡 연습을 마친 뒤 시작할 수 있어요.':done?'한 곡의 무대를 준비했어요.':'연습을 마치면 다음 솔로곡이 열려요.'}</div>${done&&next&&M.soloOpen(s,next.id)?`<div class="practice-next"><div><small>다음 연습</small><strong>${esc(next.title)}</strong><p>${esc(a.artist)}의 다음 무대를 준비해요.</p></div>${button('다음 곡 연습하기','solo-practice-pick',next.id,'primary')}</div>`:''}${M.soloConcertReady(s,a.id)?card(a):''}`,'practice');
 }
 return {songs,concerts,practice};
};

},
"src/data/our-stage-badge-art.json":function(module,exports,__require){
module.exports={"sheets":{"album":"/images/game/our-stage/pixel-album-keepsakes-v3.png","activity":"/images/game/our-stage/pixel-fan-keepsakes-v3.png"},"width":1536,"height":1024,"columns":6,"rows":4,"badges":{"first-mind-unlock":{"sheet":"album","index":0,"box":[38,69,199,174],"logo":{"box":[94,122,120,34],"tone":"dark"}},"first-mind-collect":{"sheet":"album","index":1,"box":[295,63,182,182],"logo":{"box":[345,95,84,24],"tone":"dark"}},"first-mind-master":{"sheet":"album","index":2,"box":[533,69,216,174],"logo":{"box":[597,117,100,29],"tone":"dark"}},"lovely-sweet-heart-unlock":{"sheet":"album","index":3,"box":[803,68,199,175],"logo":{"box":[858,134,112,32],"tone":"light"}},"lovely-sweet-heart-collect":{"sheet":"album","index":4,"box":[1042,66,223,188]},"lovely-sweet-heart-master":{"sheet":"album","index":5,"box":[1309,40,194,215]},"california-dream-unlock":{"sheet":"album","index":6,"box":[35,319,204,171],"logo":{"box":[89,371,122,35],"tone":"dark"}},"california-dream-collect":{"sheet":"album","index":7,"box":[275,319,227,170]},"california-dream-master":{"sheet":"album","index":8,"box":[549,289,173,216],"logo":{"box":[581,404,80,23],"tone":"dark"}},"brilliant-change-unlock":{"sheet":"album","index":9,"box":[789,317,215,172],"logo":{"box":[827,342,113,32],"tone":"light"}},"brilliant-change-collect":{"sheet":"album","index":10,"box":[1041,303,221,186]},"brilliant-change-master":{"sheet":"album","index":11,"box":[1288,336,229,134],"logo":{"box":[1344,376,119,34],"tone":"dark"}},"rebloom-unlock":{"sheet":"album","index":12,"box":[34,559,205,180],"logo":{"box":[110,603,105,30],"tone":"light"}},"rebloom-collect":{"sheet":"album","index":13,"box":[271,567,228,171]},"rebloom-master":{"sheet":"album","index":14,"box":[531,543,205,201],"logo":{"box":[565,690,91,26],"tone":"light"}},"see-you-again-unlock":{"sheet":"album","index":15,"box":[794,561,209,180],"logo":{"box":[854,606,125,35],"tone":"dark"}},"see-you-again-collect":{"sheet":"album","index":16,"box":[1054,557,195,182]},"see-you-again-master":{"sheet":"album","index":17,"box":[1280,558,246,177],"logo":{"box":[1398,683,57,16],"tone":"light"}},"still-here-unlock":{"sheet":"album","index":18,"box":[29,806,205,185],"logo":{"box":[101,927,103,29],"tone":"light"}},"still-here-collect":{"sheet":"album","index":19,"box":[274,834,225,121],"logo":{"box":[333,871,118,34],"tone":"light"}},"still-here-master":{"sheet":"album","index":20,"box":[526,799,226,186]},"first-again-unlock":{"sheet":"album","index":21,"box":[791,807,209,185],"logo":{"box":[885,835,90,26],"tone":"dark"}},"first-again-collect":{"sheet":"album","index":22,"box":[1039,786,203,208]},"first-again-master":{"sheet":"album","index":23,"box":[1289,808,220,179],"logo":{"box":[1348,873,112,32],"tone":"dark"}},"first-practice":{"sheet":"activity","index":0,"box":[63,32,155,219]},"first-stage":{"sheet":"activity","index":1,"box":[270,78,232,145],"logo":{"box":[316,120,132,37],"tone":"light"}},"three-voices":{"sheet":"activity","index":2,"box":[526,36,228,208]},"reunion":{"sheet":"activity","index":3,"box":[778,58,236,183],"logo":{"box":[845,98,133,38],"tone":"light"}},"ending":{"sheet":"activity","index":4,"box":[1037,78,231,141]},"practice-10":{"sheet":"activity","index":5,"box":[1290,60,234,181]},"practice-30":{"sheet":"activity","index":6,"box":[29,284,214,216]},"practice-60":{"sheet":"activity","index":7,"box":[299,275,166,230]},"collection-10":{"sheet":"activity","index":8,"box":[525,288,217,208]},"collection-30":{"sheet":"activity","index":9,"box":[802,284,192,216]},"collection-60":{"sheet":"activity","index":10,"box":[1032,304,242,179]},"cheer-1":{"sheet":"activity","index":11,"box":[1318,276,182,223]},"cheer-3":{"sheet":"activity","index":12,"box":[21,570,217,154]},"cheer-5":{"sheet":"activity","index":13,"box":[272,545,219,200]},"all-master":{"sheet":"activity","index":14,"box":[519,535,224,202],"logo":{"box":[568,668,77,22],"tone":"light"},"preserve":[[627,532,113,196]]},"event-ost":{"sheet":"activity","index":15,"box":[779,557,226,175],"logo":{"box":[841,618,132,37],"tone":"dark"}},"event-rookie":{"sheet":"activity","index":16,"box":[1035,543,230,196]},"event-copyright":{"sheet":"activity","index":17,"box":[1304,542,206,200]},"event-netiquette":{"sheet":"activity","index":18,"box":[34,801,197,190]},"event-digital":{"sheet":"activity","index":19,"box":[273,806,215,193]},"event-seoul":{"sheet":"activity","index":20,"box":[522,793,221,192],"logo":{"box":[568,911,107,30],"tone":"dark"}},"event-bcm":{"sheet":"activity","index":21,"box":[786,802,191,195],"logo":{"box":[817,852,98,28],"tone":"light"}},"event-kairos":{"sheet":"activity","index":22,"box":[1035,794,214,203]},"story-journey":{"sheet":"activity","index":23,"box":[1280,786,246,212],"logo":{"box":[1400,872,62,18],"tone":"light"},"preserve":[[1316,833,81,113]]},"gyul-star":{"image":"/images/game/our-stage/pixel-gyul-star-v2.png"},"event-yeonji-gasoline":{"image":"/images/game/our-stage/gasoline-badge.png"},"event-boram-nightingale":{"image":"/images/game/our-stage/nightingale-badge.png"},"trainee-complete":{"image":"/images/game/our-stage/trainee-complete.svg"},"all-members-unlocked":{"image":"/images/game/our-stage/badges/all-members.svg"},"play-days-50":{"image":"/images/game/our-stage/badge-play-days-50.svg"},"play-days-100":{"image":"/images/game/our-stage/badge-play-days-100.svg"},"solo-concert-br":{"image":"/images/game/our-stage/badge-solo-br-v1.png"},"solo-concert-gr":{"image":"/images/game/our-stage/badge-solo-gr-v1.png"},"solo-concert-yj":{"image":"/images/game/our-stage/badge-solo-yj-v1.png"}},"logoSheets":{"album":"/images/game/our-stage/pixel-album-logo-base.png","activity":"/images/game/our-stage/pixel-activity-logo-base.png"}};
},
"src/data/our-stage-album-keepsakes.json":function(module,exports,__require){
module.exports={"first-mind":{"image":"/images/game/our-stage/ticket-first-mind.png","colors":["#ead7e2","#81536d"],"line":"낯선 구두 소리가 멈춘 자리, 공간을 채우는 여인의 향기.","band":"처음 만난 세 목소리"},"lovely-sweet-heart":{"image":"/images/game/our-stage/ticket-lovely-sweet-heart.png","colors":["#f3d7de","#9c5269"],"line":"수줍게 건넨 사랑의 인사, 영원을 꿈꾸던 가장 눈부신 날들.","band":"다정한 인사의 계절"},"california-dream":{"image":"/images/game/our-stage/ticket-california-dream.png","colors":["#dce9df","#4e7467"],"line":"한여름 밤처럼 뜨겁게 빛나, 오래도록 노래로 남은 꿈.","band":"오래도록 노래로 남은 꿈"},"brilliant-change":{"image":"/images/game/our-stage/ticket-brilliant-change.png","colors":["#dce3f1","#4b658c"],"line":"가장 화려하게 빛나던 무대 위, 차마 전하지 못한 진심을 삼키다.","band":"가장 눈부신 변화"},"rebloom":{"image":"/images/game/our-stage/ticket-rebloom.png","colors":["#e7dcf1","#795d93"],"line":"시린 겨울을 견뎌낸 뿌리처럼, 상처 위에 다시 꽃피운 세 목소리.","band":"다시 피어난 노래"},"see-you-again":{"image":"/images/game/our-stage/ticket-see-you-again.png","colors":["#f1e2cf","#906c43"],"line":"이루지 못한 Always, 기약 없는 Again을 기다리며.","band":"다시 만날 약속"},"still-here":{"image":"/images/game/our-stage/ticket-still-here.png","colors":["#dce8ef","#4c7186"],"line":"모두가 끝이라 말하던 시간을 건너, 기적처럼 다시 마주한 우리.","band":"긴 시간을 건너, 다시"},"first-again":{"image":"/images/game/our-stage/ticket-first-again.png","colors":["#e5dcf0","#785493"],"line":"기적 위에서 다시 시작하는, 모두가 꿈꾸던 Always를 향해.","band":"다시, 처음처럼"},"solo-br":{"member":"br","style":"capsule-brother","colors":["#f6e2ec","#a55179"],"line":"한 곡씩 쌓아 온 마음, 이보람의 목소리로 만나는 무대.","band":"이보람 · 나의 목소리","image":"/images/game/our-stage/ticket-solo-br-v1.png"},"solo-gr":{"member":"gr","style":"capsule-sorrow","colors":["#fae9d9","#a56b43"],"line":"오래 간직한 이야기, 남규리의 목소리로 건네는 인사.","band":"남규리 · 나의 목소리","image":"/images/game/our-stage/ticket-solo-gr-v1.png"},"solo-yj":{"member":"yj","style":"capsule-wind","colors":["#e4e4f7","#6662a3"],"line":"마음을 채우는 울림, 김연지의 목소리로 이어지는 밤.","band":"김연지 · 나의 목소리","image":"/images/game/our-stage/ticket-solo-yj-v1.png"}};
},
"src/client/our-stage-vcr.js":function(module,exports,__require){
'use strict';
const youtube=__require("src/client/our-stage-youtube.js");
const album='still-here',video='QwEAjrfN8WE';
module.exports=function({M,root,state,dialog,button,mark}){
 const $=s=>root.querySelector(s),available=()=>M.albumUnlocked(state(),album);
 let player=null,generation=0,timer=0;
 function destroy(){generation++;clearTimeout(timer);try{player?.destroy();}catch{}player=null;}
 function card(){return available()?`<section class="reunion-vcr-card">${mark('VCR · 다시 함께, 씨야')}<h3>세 목소리가 다시 모인 날</h3><p>각자의 시간을 지나, 다시 함께할 내일을 이야기합니다.</p>${button('재결합 VCR 보기','reunion-vcr','','primary')}<small>선택 시청 · 언제든 다음 무대로 갈 수 있어요.</small></section>`:'';}
 function show(){if(!available())return;dialog(`${mark('VCR · 다시 함께, 씨야')}<h2>세 목소리가 다시 모인 날</h2><p>귤멍 Ep.40 · 그럼에도 우린 씨야입니다<br><small>남규리의 귤멍 · 2026.03.29 공개</small></p><div class="reunion-vcr-player"><div id="reunionVcrPlayer"></div></div><p id="vcrStatus" role="status">공식 영상을 불러오는 중이에요.</p><div class="vcr-actions">${button('다음 무대로 →','album-view',album,'primary')}${button('다시 연결','reunion-vcr','','quiet')}<a href="https://www.youtube.com/watch?v=${video}" target="_blank" rel="noopener noreferrer">YouTube에서 열기 ↗</a></div><p class="private-note">시청은 선택이에요. 영상 길이와 관계없이 다음 곡으로 진행할 수 있으며, 별도의 코인이나 해금 조건은 없습니다.</p>`);mount();}
 async function mount(){destroy();const own=generation,note=t=>{if(own===generation&&$('#vcrStatus'))$('#vcrStatus').textContent=t;};try{await youtube();if(own!==generation||!$('#reunionVcrPlayer'))return;
  timer=setTimeout(()=>note('연결이 지연되고 있어요. 다시 연결하거나 원본 영상을 확인해 주세요.'),15000);
  player=new window.YT.Player('reunionVcrPlayer',{width:'100%',height:300,videoId:video,playerVars:{controls:1,playsinline:1,origin:location.origin},events:{onReady:e=>{if(own!==generation)return;clearTimeout(timer);e.target.getIframe().title='귤멍 Ep.40 · 그럼에도 우린 씨야입니다';note('영상 안의 재생 버튼을 눌러주세요.');},onError:()=>{if(own!==generation)return;clearTimeout(timer);note('영상을 재생할 수 없어요. 원본에서 확인하거나 다음 무대로 이동할 수 있어요.');}}});
 }catch{note('연결하지 못했어요. 원본 영상을 확인하거나 다음 무대로 이동해 주세요.');}}
 $('#stageModal').addEventListener('close',destroy);
 document.addEventListener('visibilitychange',()=>{if(document.hidden)try{player?.pauseVideo();}catch{}});
 return {card,show,destroy};
};

},
"src/client/our-stage-youtube.js":function(module,exports,__require){
'use strict';
let pending;
module.exports=function(){
 if(window.YT?.Player)return Promise.resolve();
 if(!pending)pending=new Promise((resolve,reject)=>{
  let script=document.querySelector('script[src="https://www.youtube.com/iframe_api"]');
  const previous=window.onYouTubeIframeAPIReady;
  const timer=setTimeout(()=>{script?.remove();pending=null;reject(Error('timeout'));},15000);
  window.onYouTubeIframeAPIReady=()=>{clearTimeout(timer);try{previous?.();}catch{}resolve();};
  if(!script){script=document.createElement('script');script.src='https://www.youtube.com/iframe_api';document.head.append(script);}
  script.addEventListener('error',()=>{clearTimeout(timer);script.remove();pending=null;reject(Error('network'));},{once:true});
 });return pending;
};

},
"src/client/our-stage-gifts.js":function(module,exports,__require){
'use strict';
const icon=__require("src/client/our-stage-gift-art.js");
module.exports=function({M,state,root,dialog,button,esc,save,draw,close,goPractice}){
 const $=q=>root.querySelector(q);let task=null,order=[],guess=[],peeked=false,message='',lastGifts=new Set(M.gifts(state()).map(g=>g.id));
 const date=at=>at?new Date(at).toLocaleDateString('ko-KR',{timeZone:'Asia/Seoul'}):'';
 let nextPractice=null;
 // Fixed, uneven floor positions keep earlier gifts in place as the pile grows.
 const spots=[[7,2,54,-7],[49,1,44,8],[26,16,42,-4],[0,25,40,5],[60,23,38,-8],[34,37,42,6],[12,48,36,-5],[66,46,34,9],[40,60,37,-3],[5,66,32,7],[64,66,32,-6],[28,78,32,3]];
 function corner(){
  const gifts=M.gifts(state()),added=gifts.some(g=>!lastGifts.has(g.id));lastGifts=new Set(gifts.map(g=>g.id));
  if(!gifts.length)return '<button class="gift-corner empty" data-action="gift-shelf" aria-label="선물 코너 열기"><span class="gift-floor-label">선물 코너</span></button>';
  const ordered=gifts.filter(g=>g.at).sort((a,b)=>a.at-b.at||a.id.localeCompare(b.id)),shown=ordered.slice(0,spots.length);
  const pile=shown.map((g,i)=>{const [x,y,w,r]=spots[i];return `<span class="gift-item" data-gift-id="${esc(g.id)}" style="--gx:${x}%;--gy:${y}%;--gw:${w}%;--gr:${r}deg;z-index:${i+2}">${icon(g)}</span>`;}).join('');
  const bundles=Array.from({length:Math.min(4,Math.ceil(Math.max(0,ordered.length-spots.length)/6))},(_,i)=>`<span class="gift-item gift-bundle" style="--gx:${-7+i*19}%;--gy:${-4+i%2*6}%;--gw:48%;--gr:${i%2?7:-5}deg;z-index:${20+i}">${icon({id:'overflow-'+i,kind:'box'})}</span>`).join('');
  return `<button class="gift-corner${added?' gift-new':''}" data-action="gift-shelf" aria-label="받은 선물 ${gifts.length}개, 선물 살펴보기">${pile}${bundles}${gifts.some(g=>g.kind==='letters')?`<span class="gift-item gift-letters" style="--gx:66%;--gy:-3%;--gw:40%;--gr:5deg;z-index:25">${icon('letters')}</span>`:''}<span class="gift-floor-label">선물 살펴보기</span></button>`;
 }
 function beforeNext(from,to){
  if(!M.ready(state(),from)||!M.wordAvailable(state(),from))return false;
  handle('word-open',from);nextPractice=to;render();return true;
 }
 function resetPending(){nextPractice=null;task=null;}
 function taskList(album){const s=state(),list=M.wordTasks.filter(q=>(!album||q.album===album)&&M.open(s,q.track));return list.length?`<details class="word-task-list"><summary>가사 한 줄로 선물 모으기 · 선택</summary><p>풀지 않아도 다음 곡과 앨범은 열려요.</p>${list.map(q=>`<div class="word-task-row"><span>${esc(q.song)}<small>${esc(M.albumById(q.album).name)}</small></span>${button(s.simple.wordDone[q.track]?'선물 받았어요':'가사 맞추기','word-open',q.track,'',!!s.simple.wordDone[q.track])}</div>`).join('')}</details>`:'';}
 function shelf(){nextPractice=null;const gifts=M.gifts(state());dialog(`<small class="eyebrow">GIFTS FOR SEEYA</small><h2>연습실에 쌓인 마음</h2><p>콘서트와 가사 한 줄, 매일의 출석이 선물로 남아요.</p><div class="gift-shelf">${gifts.map(g=>`<article>${icon(g)}<strong>${esc(g.label)}</strong>${g.at?`<small>${date(g.at)}</small>`:''}</article>`).join('')||'<p>아직 선물이 없어요. 출석하거나 콘서트를 열어보세요.</p>'}</div>${taskList()}`);}
 function render(){const q=task;if(!q)return;dialog(`<small class="eyebrow">A LINE TO REMEMBER · 선택 과제</small><h2>가사 블록 맞추기</h2><p>${esc(q.song)} · ${esc(M.albumById(q.album).name)}</p><p>연습한 노래를 떠올리며 블록을 순서대로 놓아보세요.</p><div class="word-answer" aria-label="내가 놓은 블록">${guess.map((n,i)=>button(esc(q.tokens[n]),'word-remove',String(i))).join('')||'<span>아래 블록을 눌러주세요.</span>'}</div><div class="word-pool">${order.map(n=>button(esc(q.tokens[n]),'word-pick',String(n),'',guess.includes(n))).join('')}</div><p class="word-feedback" role="status">${esc(message)}</p><div class="growth-actions">${button('하나 되돌리기','word-undo','','',!guess.length)}${button('첫 블록 보기','word-peek','','',peeked)}${button(nextPractice?'나중에 풀고 다음 곡으로':'나중에 풀기','word-later')}</div><p class="private-note">원할 때만 해보세요. 곡과 앨범 해금에는 영향을 주지 않아요.</p><a href="${esc(q.source)}" target="_blank" rel="noopener">가사 출처 보기 ↗</a>`);}
 function handle(a,v){if(a==='gift-shelf'){shelf();return true;}if(!a.startsWith('word-'))return false;
 if(a==='word-open'){nextPractice=null;task=M.wordTasks.find(q=>q.track===v);if(!task||!M.wordAvailable(state(),v)){task=null;return true;}order=task.tokens.map((_,i)=>i);for(let i=order.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[order[i],order[j]]=[order[j],order[i]];}if(order.every((n,i)=>n===i))order.push(order.shift());guess=[];peeked=false;message='';render();return true;}
 if(a==='word-later'){const next=nextPractice;resetPending();close();if(next)goPractice(next);return true;}
 if(!task||!$('#modalBody .word-answer'))return true;
 if(a==='word-pick'){const n=Number(v);if(!Number.isInteger(n)||n<0||n>=task.tokens.length||guess.includes(n)||guess.length===task.tokens.length)return true;guess.push(n);message='';if(guess.length===task.tokens.length){if(M.answerWords(state(),task.track,guess)){if(!save())return true;draw();dialog(`<small class="eyebrow">A GIFT FOR SEEYA</small><h2>선물이 하나 놓였어요</h2><div class="word-gift">${icon(M.gifts(state()).find(g=>g.id==='word:'+task.track))}</div><h3>${esc(M.gifts(state()).find(g=>g.id==='word:'+task.track).giftName)}</h3><p>${esc(task.song)}의 한 줄을 완성했어요.</p>${button('선물함 보기','gift-shelf','','primary')}${button(nextPractice?'다음 곡 연습하기':'계속하기','word-later')}`);task=null;return true;}message='조금 달라요. 놓은 블록을 눌러 바꾸거나 하나 되돌려 보세요.';}}
 if(a==='word-remove')guess.splice(Number(v),1);if(a==='word-undo')guess.pop();if(a==='word-peek'&&!peeked){peeked=true;message='첫 블록은 “'+task.tokens[0]+'”예요.';}render();return true;
 }
 return {corner,taskList,handle,beforeNext,resetPending};
};

},
"src/client/our-stage-gift-art.js":function(module,exports,__require){
'use strict';
// Reuse the approved SEEYA merchandise artwork, including its official logo overlays.
const art=__require("src/data/our-stage-badge-art.json"),designs=__require("src/shared/our-stage-gift-designs.js");
let sequence=0;
module.exports=function(gift){
 const g=typeof gift==='string'?{kind:gift}:gift;
 const id=g.id?.startsWith('concert:')?g.id.slice(8)+'-master':g.kind==='letters'?'cheer-5':designs.forGift(g.id||g.kind).id;
 const entry=art.badges[id],source=entry.logo?art.logoSheets[entry.sheet]:art.sheets[entry.sheet],filter='gift-cutout-'+(++sequence),box=entry.logo?.box;
 const logo=box?`<image href="/images/game/our-stage/${entry.logo.tone==='light'?'badge-logo-light.svg':'card-logo.svg'}" x="${box[0]}" y="${box[1]}" width="${box[2]}" height="${box[3]}"/>`:'';
 const preserved=(entry.preserve||[]).map(b=>`<svg x="${b[0]}" y="${b[1]}" width="${b[2]}" height="${b[3]}" viewBox="${b.join(' ')}" overflow="hidden"><image href="${art.sheets[entry.sheet]}" width="1536" height="1024"/></svg>`).join('');
 return `<svg viewBox="${entry.box.join(' ')}" class="gift-pixel" aria-hidden="true" data-gift-art="${id}" overflow="hidden"><defs><filter id="${filter}"><feComponentTransfer><feFuncA type="discrete" tableValues="0 0 0 0 0 0 0 1"/></feComponentTransfer></filter></defs><image href="${source}" width="1536" height="1024" filter="url(#${filter})"/>${logo}${preserved}</svg>`;
};

},
"src/client/our-stage-wall-keepsakes.js":function(module,exports,__require){
'use strict';
const art=__require("src/client/our-stage-keepsake-art.js"),drawTicket=__require("src/client/our-stage-ticket-art.js");
module.exports=function({M,state,root,esc}){
 const cache=new Map();
 function items(){const s=state().simple;if(!s.debuted)return [];
  const result=[{kind:'pass',key:JSON.stringify(['pass',s.nickname,s.passIssuedAt]),label:'나의 아티스트 패스 열기',action:'pass-open',id:'',make:()=>art.drawPass({nickname:s.nickname,issuedAt:s.passIssuedAt})}];
  const album=M.albums.filter(a=>s.concerts[a.id]).sort((a,b)=>s.concerts[b.id].at-s.concerts[a.id].at)[0];
  if(album){const receipt=s.concerts[album.id];result.push({kind:'ticket',key:JSON.stringify(['ticket',album.id,s.nickname,receipt]),label:album.name+' 콘서트 기념 티켓 열기',action:'ticket-open',id:album.id,make:()=>drawTicket({album,index:M.albums.indexOf(album),receipt,nickname:s.nickname})});}
  return result;
 }
 function markup(){if(!state().simple.debuted)return '<button class="wall-pass trainee-pass" data-action="trainee-info" aria-label="연습생 출입증"><span>SEEYA</span><b>TRAINEE</b><small>CHAPTER 00</small></button>';
  return items().map(item=>`<button class="wall-${item.kind} wall-keepsake" data-action="${item.action}" data-value="${item.id}" data-keepsake="${item.kind}" data-image-key="${esc(item.key)}" aria-label="${esc(item.label)}" title="${esc(item.label)}">${cache.get(item.key)?.url?`<img src="${cache.get(item.key).url}" alt="${esc(item.label)}">`:'<span class="keepsake-loading" aria-hidden="true">'+(item.kind==='pass'?'ARTIST PASS':'CONCERT TICKET')+'</span>'}</button>`).join('');
 }
 function refresh(){for(const item of items()){
  const targets=[...root.querySelectorAll(`[data-keepsake="${item.kind}"]`)];for(const target of targets){target.dataset.imageKey=item.key;
  let entry=cache.get(item.key);
  if(!entry){entry={};cache.set(item.key,entry);entry.pending=item.make().then(c=>{
   // Small wall previews reuse the full keepsake composition without retaining full-size canvases.
   const thumb=document.createElement('canvas');thumb.width=item.kind==='pass'?252:540;thumb.height=Math.round(thumb.width*c.height/c.width);thumb.getContext('2d').drawImage(c,0,0,thumb.width,thumb.height);
   entry.url=thumb.toDataURL('image/png');return entry.url;
  }).catch(()=>{cache.delete(item.key);return null;});
  while(cache.size>12)cache.delete(cache.keys().next().value);}
  Promise.resolve(entry.url||entry.pending).then(async url=>{if(!url)return;const img=new Image();img.src=url;img.alt=item.label;
   try{await img.decode();}catch{return;}
   if(!target.isConnected||target.dataset.imageKey!==item.key)return;
   const old=target.querySelector('img');if(old)old.src=url;else target.replaceChildren(img);
  });
 }}}
 return {markup,refresh};
};

},
"src/client/our-stage-keepsake-art.js":function(module,exports,__require){
'use strict';
const optimized=__require("src/data/our-stage-optimized-images.json"),stories=__require("src/data/our-stage-stories.json"),layers=__require("src/data/our-stage-layers.json");
function load(src){return new Promise((resolve,reject)=>{const img=new Image(),timer=setTimeout(()=>reject(Error('image timeout')),12000);img.onload=()=>{clearTimeout(timer);resolve(img);};img.onerror=()=>{clearTimeout(timer);reject(Error('image unavailable'));};img.src=optimized[src]||src;});}
function cover(c,img,x,y,w,h,box){const [sx,sy,sw,sh]=box||[0,0,img.width,img.height],r=Math.max(w/sw,h/sh);c.save();c.beginPath();c.rect(x,y,w,h);c.clip();c.imageSmoothingEnabled=false;c.drawImage(img,sx,sy,sw,sh,x+(w-sw*r)/2,y+(h-sh*r)/2,sw*r,sh*r);c.restore();}
function panelSource(id){const image=__require("src/data/our-stage-album-keepsakes.json")[id]?.image;if(image)return {src:image};const story=stories.find(e=>e.kind==='album'&&e.album===id);return story?{src:story.image}:{src:'/images/game/our-stage/pixel-stories-period.png',box:[903,3,444,444]};}
async function panel(id){const solo=__require("src/data/our-stage-album-keepsakes.json")[id];if(solo?.member&&!solo.image)return soloPanel(solo);const source=panelSource(id),canvas=document.createElement('canvas');canvas.width=600;canvas.height=600;const c=canvas.getContext('2d');c.fillStyle='#e9dce5';c.fillRect(0,0,600,600);try{cover(c,await load(source.src),0,0,600,600,source.box);}catch{c.fillStyle='#81536d';c.font='bold 46px sans-serif';c.textAlign='center';c.fillText('OUR STAGE',300,290);c.fillText('SEEYA',300,350);}return canvas;}
async function soloPanel(theme){
 const canvas=document.createElement('canvas');canvas.width=600;canvas.height=600;const c=canvas.getContext('2d');
 const l=layers[theme.style],m=l.members[theme.member],g=__require("src/shared/our-stage-sprite-geometry.js")(theme.member,theme.style,theme.style,layers);
 const [body,head]=await Promise.all([load(l.image),load(l.headImage||l.image)]);
 c.fillStyle=theme.colors[0];c.fillRect(0,0,600,600);c.fillStyle=theme.colors[1];c.fillRect(24,24,552,8);c.fillRect(24,568,552,8);c.globalAlpha=.12;
 for(let x=40;x<600;x+=80)c.fillRect(x,40,30,510);c.globalAlpha=1;c.imageSmoothingEnabled=false;
 c.save();c.translate(102,5);c.scale(.9,.85);c.drawImage(head,...m.head,g.headX,g.headY,g.hw,g.hh);c.drawImage(body,...m.body,g.bodyX,g.bodyY,g.bw,g.bh);c.restore();return canvas;
}
async function drawPass({nickname,issuedAt}){
 const canvas=document.createElement('canvas');canvas.width=840;canvas.height=1200;const c=canvas.getContext('2d');c.scale(2,2);await document.fonts.ready;
 const text=(t,x,y,w,size,color='#40343e',weight=600)=>{c.fillStyle=color;c.font=weight+' '+size+'px system-ui,sans-serif';while(c.measureText(t).width>w&&size>9){c.font=weight+' '+--size+'px system-ui,sans-serif';}c.fillText(t,x,y);};
 c.fillStyle='#fff8f1';c.fillRect(0,0,420,600);const g=c.createLinearGradient(0,0,420,90);g.addColorStop(0,'#81536d');g.addColorStop(1,'#b06f8c');c.fillStyle=g;c.fillRect(0,0,420,92);
 c.fillStyle='#5e3a4e';c.fillRect(193,0,34,40);c.fillStyle='#fff8f1';c.beginPath();c.roundRect(178,52,64,16,8);c.fill();
 text('OUR STAGE',28,26,170,10,'#f7e6ee');c.textAlign='right';text('ARTIST · 2006',392,26,170,10,'#f7e6ee');c.textAlign='center';
 try{c.drawImage(await load('/images/game/our-stage/card-logo.svg'),140,109,140,40);}catch{text('SEEYA',210,142,250,32);}
 text('A R C H I V E',210,159,230,9,'#81536d');c.strokeStyle='#cda55f';c.lineWidth=2;c.beginPath();c.roundRect(105,170,210,28,14);c.stroke();text('A R T I S T  P A S S',210,189,200,11,'#8d6a2a');
 // One shared recording-room scene, also used by the wall pass and PNG export.
 c.fillStyle='#f2e3eb';c.beginPath();c.roundRect(46,208,328,190,14);c.fill();
 try{const img=await load('/images/game/our-stage/artist-pass-recording-trio.png');c.save();c.beginPath();c.roundRect(46,208,328,190,14);c.clip();cover(c,img,46,208,328,190);c.restore();}
 catch{text('세 목소리와 함께하는 첫 무대',210,307,300,16,'#81536d');}
 c.textAlign='left';text('함께한 팬',46,426,328,10,'#9b5a74');text(nickname||'익명의 씨야 팬',46,459,328,30,'#40343e',800);c.fillStyle='#cda55f';c.fillRect(46,478,328,2);
 const date=new Date(issuedAt).toLocaleDateString('ko-KR',{timeZone:'Asia/Seoul'});for(const [i,[label,value]] of [['DEBUT','2006. 02. 24.'],['발급일',date],['CHAPTER','00 → 01']].entries()){const x=46+i*116;text(label,x,501,108,9,'#9b5a74');text(value,x,521,108,13);}
 c.setLineDash([3,3]);c.strokeStyle='#d6c4cd';c.beginPath();c.moveTo(46,555);c.lineTo(374,555);c.stroke();text('팬 게임 기념 패스 · 실제 출입증이 아닙니다',46,573,328,9,'#8b7d86');text('OS-PASS-'+new Date(issuedAt+9*3600000).toISOString().slice(2,16).replace(/[-T:]/g,''),46,588,328,8,'#8b7d86');return canvas;
}
module.exports={load,cover,panel,panelSource,drawPass};

},
"src/client/our-stage-ticket-art.js":function(module,exports,__require){
'use strict';
const themes=__require("src/data/our-stage-album-keepsakes.json");
const optimized=__require("src/data/our-stage-optimized-images.json");
function load(src){return new Promise((resolve,reject)=>{const img=new Image(),timer=setTimeout(()=>reject(new Error('이미지를 불러오지 못했어요.')),15000);img.onload=()=>{clearTimeout(timer);resolve(img);};img.onerror=()=>{clearTimeout(timer);reject(new Error('이미지를 불러오지 못했어요.'));};img.src=optimized[src]||src;});}
module.exports=async function({album,index,receipt,nickname}){
 const keepsake=__require("src/client/our-stage-keepsake-art.js"),solo=!!album.member;
 const [logo,picture]=await Promise.all([load('/images/game/our-stage/card-logo.svg'),keepsake.panel(album.id)]);
 await document.fonts.ready;
 const canvas=document.createElement('canvas');canvas.width=1800;canvas.height=840;
 const c=canvas.getContext('2d');c.scale(2,2);
 const colors=themes[album.id].colors;
 const [wash,accent]=colors,ink='#40343e';
 const rect=(x,y,w,h,fill)=>{c.fillStyle=fill;c.fillRect(x,y,w,h);};
 const text=(t,x,y,max,size=18,color=ink,weight=500)=>{c.fillStyle=color;c.font=weight+' '+size+'px system-ui, sans-serif';while(c.measureText(t).width>max&&size>11){size--;c.font=weight+' '+size+'px system-ui, sans-serif';}c.fillText(t,x,y);};
 const line=(x,y,x2,y2,color)=>{c.strokeStyle=color;c.lineWidth=1;c.beginPath();c.moveTo(x,y);c.lineTo(x2,y2);c.stroke();};
 rect(0,0,900,420,'#fcf8f1');rect(0,0,900,7,accent);
 // Archive wordmark, paired with the same official SEEYA mark as the card book.
 c.drawImage(logo,396,23,108,30.61);c.textAlign='center';text('A R C H I V E',450,70,150,10,ink,600);c.textAlign='left';
 text('OUR STAGE',40,49,220,12,accent,700);c.textAlign='right';text(solo?'SOLO CONCERT · '+album.artist:'ALBUM CONCERT · '+String(index+1).padStart(2,'0'),860,49,240,12,accent,700);c.textAlign='left';
 line(40,86,860,86,'#ded2d5');
 c.imageSmoothingEnabled=false;c.drawImage(picture,616,98,244,244);c.imageSmoothingEnabled=true;
 c.textAlign='center';text(themes[album.id].band||'함께 완성한 우리의 무대',738,357,244,11,accent,600);c.textAlign='left';
 text(solo?'SOLO STAGE  /  솔로 콘서트 기념':'CHAPTER '+String(index+1).padStart(2,'0')+'  /  앨범 완주 기념',42,121,540,13,accent,700);
 text(album.name,40,170,545,38,ink,750);
 const quote=themes[album.id].line,split=quote.indexOf(',');
 const quoteLines=split<0?[quote]:[quote.slice(0,split+1),quote.slice(split+1).trim()];
 quoteLines.forEach((part,i)=>text(part,42,216+i*22,540,15,'#766771'));
 const release=album.type.match(/\d{4}\.\d{2}\.\d{2}/)?.[0]||'';
 text(solo?'세 목소리의 또 다른 이야기':'앨범 발매일  '+release,42,275,540,12,accent,600);
 text('함께한 팬',42,312,190,11,accent,700);text(nickname||'익명의 씨야 팬',42,338,190,21,ink,700);
 text('콘서트를 마친 날',250,312,300,11,accent,600);text(receipt?new Date(receipt.at).toLocaleDateString('ko-KR',{timeZone:'Asia/Seoul'}):'콘서트 완료 후 기록',250,338,340,18,ink,600);
 c.setLineDash([3,5]);line(27,365,873,365,'#cabbc5');c.setLineDash([]);
 text('팬 게임 기념 티켓 · 실제 입장권이 아닙니다',42,393,500,11,'#766771');c.textAlign='right';text(receipt?'OS-'+String(index+1).padStart(2,'0')+'-'+new Date(receipt.at+9*3600000).toISOString().slice(2,16).replace(/[-T:]/g,''):'OS-'+String(index+1).padStart(2,'0'),860,393,350,10,'#766771');c.textAlign='left';
 c.globalCompositeOperation='destination-out';for(const x of [0,900]){c.beginPath();c.arc(x,365,12,0,Math.PI*2);c.fill();}c.globalCompositeOperation='source-over';
 return canvas;
};

},
"src/client/our-stage-room-display.js":function(module,exports,__require){
'use strict';
const giftArt=__require("src/client/our-stage-gift-art.js");
module.exports=function({M,state,wall,cardFace,esc,button,dialog}){
 function card(){return M.memberCards(state()).find(c=>c.id===state().displayCard&&c.earned);}
 function gifts(){return M.gifts(state()).slice().sort((a,b)=>(b.at||0)-(a.at||0)||a.id.localeCompare(b.id)).slice(0,3);}
 function cardMarkup(){const c=card();return c?`<button class="wall-card room-featured-card" data-action="card-detail" data-value="${esc(c.id)}" aria-label="대표 카드 상세 보기">${cardFace(c)}</button>`:'';}
 function giftMarkup(){return gifts().map(g=>`<span class="cabinet-gift" title="${esc(g.label)}">${giftArt(g)}</span>`).join('');}
 function markup(){return `<div class="room-cabinet"><div class="cabinet-miniatures" aria-hidden="true" inert><div class="cabinet-top">${wall.markup()}</div><div class="cabinet-bottom">${giftMarkup()}</div></div><button class="cabinet-open" data-action="room-display" aria-label="연습실 전시장 열기 · 아티스트 패스, 티켓, 선물"><span>전시장</span></button></div>`;}
 function open(){const s=state(),hasTicket=M.albums.some(a=>s.simple.concerts[a.id]);dialog(`<div class="room-display-detail"><small class="eyebrow">OUR MEMORIES</small><h2>연습실 전시장</h2><div class="display-keepsakes">${wall.markup()}</div>${!hasTicket?'<p class="private-note">앨범 콘서트를 마치면 기념 티켓이 놓여요.</p>':''}<h3>최근에 받은 선물</h3><div class="display-gifts">${gifts().map(g=>`<article>${giftArt(g)}<strong>${esc(g.label)}</strong></article>`).join('')||'<p>받은 선물이 이곳에 놓여요.</p>'}</div>${button('선물함 열기','gift-shelf')}</div>`);wall.refresh();}
 return {markup,open,cardMarkup};
};

},
"src/client/our-stage-room-posters.js":function(module,exports,__require){
'use strict';
const art=__require("src/data/our-stage-album-keepsakes.json");
module.exports=function({M,state,esc,dialog,save,draw,close,root,button,renderPoster=__require("src/client/our-stage-poster-art.js")}){
 let preview=null,version=0;
 const owned=id=>M.albums.some(a=>a.id===id)&&M.albumUnlocked(state(),id);
 const selected=()=>M.albums.find(a=>a.id===state().displayPoster&&owned(a.id))||M.albums.find(a=>owned(a.id));
 function face(a){const p=art[a.id];return `<span class="album-poster-art" style="--poster-paper:${p.colors[0]};--poster-ink:${p.colors[1]}"><span class="poster-brand"><img src="/images/game/our-stage/card-logo.svg" alt="SEEYA"></span><img class="poster-illustration" src="${p.image}" alt=""><strong>${esc(a.name)}</strong><small>${esc(a.type)}</small></span>`;}
 function markup(){const a=selected();return `<button class="room-album-poster" data-action="room-poster-view" aria-label="${a?esc(a.name)+' 앨범 포스터 크게 보기':'앨범 해금 후 포스터를 걸 수 있어요'}" ${a?'':'disabled'}>${a?face(a):'<span class="poster-empty">ALBUM<br>POSTER</span>'}</button>`;}
 function view(){const a=selected();if(!a)return;const token=++version;preview=null;
  dialog(`<div class="room-poster-detail"><small class="eyebrow">OUR ALBUM</small><h2>${esc(a.name)}</h2><div id="roomPosterExport"><p role="status">포스터 이미지를 준비하고 있어요…</p></div></div>`);
  const target=root?.querySelector('#roomPosterExport');if(!target)return;
  return renderPoster(a).then(canvas=>{
   if(token!==version||!target.isConnected||!root.querySelector('#stageModal')?.open)return;
   const url=canvas.toDataURL('image/png');preview={url,name:'seeya-'+a.id+'-poster.png'};
   target.innerHTML=`<img class="room-poster-export" src="${url}" alt="${esc(a.name)} 앨범 포스터 · SEEYA Archive"><div class="growth-actions">${button('이미지 저장','room-poster-download','','primary')}</div><p class="private-note">휴대폰에서는 이미지를 길게 눌러 사진에 저장할 수 있어요.</p>`;
  }).catch(()=>{
   if(token!==version||!target.isConnected||!root.querySelector('#stageModal')?.open)return;
   target.innerHTML='<p role="status">포스터 이미지를 불러오지 못했어요.</p>'+button('다시 불러오기','room-poster-view');
  });
 }
 function download(){if(!preview)return;const a=document.createElement('a');a.href=preview.url;a.download=preview.name;a.click();}
 function open(){const current=selected();dialog(`<div class="room-poster-picker"><small class="eyebrow">OUR ALBUMS</small><h2>연습실에 걸 앨범 포스터</h2><p>앨범을 해금하면 포스터도 함께 열려요.</p><div class="room-poster-grid">${M.albums.map(a=>{const unlocked=owned(a.id),active=current?.id===a.id;return `<button data-action="room-poster-select" data-value="${a.id}" class="${unlocked?'':'is-locked'}" aria-pressed="${active}" aria-label="${esc(a.name)} · ${active?'전시 중':unlocked?'포스터 걸기':'앨범 해금 필요'}" ${unlocked?'':'disabled'}>${face(a)}<span>${active?'전시 중':unlocked?'포스터 걸기':'앨범 해금 후'}</span></button>`;}).join('')}</div></div>`);}
 function choose(id){if(!owned(id))return false;state().displayPoster=id;if(save()){close();draw();}return true;}
 return {markup,open,view,download,choose,selected};
};

},
"src/client/our-stage-poster-art.js":function(module,exports,__require){
'use strict';
const themes=__require("src/data/our-stage-album-keepsakes.json"),{load}=__require("src/client/our-stage-keepsake-art.js");
module.exports=async function drawPoster(album){
 const theme=themes[album.id];if(!theme)throw Error('Unknown poster');
 const [logo,picture]=await Promise.all([load('/images/game/our-stage/card-logo.svg'),load(theme.image)]);
 await document.fonts.ready;
 const canvas=document.createElement('canvas');canvas.width=1200;canvas.height=1600;
 const c=canvas.getContext('2d'),ink=theme.colors[1];
 c.fillStyle='#fff7e8';c.fillRect(0,0,1200,1600);
 c.strokeStyle='#805c4b';c.lineWidth=5;c.strokeRect(20,20,1160,1560);
 c.fillStyle=theme.colors[0];c.fillRect(36,36,1128,1528);
 const logoAt=(width,y)=>c.drawImage(logo,(1200-width)/2,y,width,width*logo.height/logo.width);
 logoAt(400,78);
 c.imageSmoothingEnabled=false;c.drawImage(picture,100,240,1000,1000);c.imageSmoothingEnabled=true;
 c.textAlign='center';c.fillStyle=ink;
 function text(value,y,size,max){c.font='600 '+size+'px system-ui,sans-serif';while(c.measureText(value).width>max&&size>16)c.font='600 '+--size+'px system-ui,sans-serif';c.fillText(value,600,y);}
 text(album.name,1320,64,1000);text(album.type,1376,25,1000);
 c.strokeStyle=ink;c.globalAlpha=.25;c.lineWidth=2;c.beginPath();c.moveTo(100,1420);c.lineTo(1100,1420);c.stroke();c.globalAlpha=1;
 logoAt(190,1450);text('A R C H I V E',1532,20,300);
 return canvas;
};

},
"src/client/our-stage-room-life.js":function(module,exports,__require){
'use strict';
// Purely visual room life: no currency, rewards, or saved progress are changed.
module.exports=function({root,sprite,members,practiceOutfit,isTest}){
 // Separate floor lanes leave room for hair, raised arms and labels, even on mobile.
 const homes={br:[22,90],gr:[50,90],yj:[78,90]},names=Object.fromEntries(members.map(m=>[m.id,m.name]));
 const plans={
  br:[['water',19,74],['score',25,80],['stretch',21,86],['hair',24,75],['hum',21,83],['greet',25,85]],
  gr:[['stretch',50,78],['score',48,86],['water',53,76],['hum',50,80],['greet',48,85],['hair',49,74]],
  yj:[['capsule',80,81],['stretch',77,75],['score',79,87],['greet',77,85],['hair',77,75],['hum',80,83]]
 };
 const texts={capsule:'뭐가 나올까?',water:'잠깐 쉬어가요',stretch:'기지개 쭉!',score:'한 번 더 맞춰볼까?',hair:'이 정도면 됐지?',hum:'♪ ♫',greet:''};
 const order=['br','gr','yj'];
 const icons={water:'<path fill="#4079a3" d="M13 3h10v7H13z"/><path fill="#d8f0f5" stroke="#436278" stroke-width="2" d="M10 10h16v30H10z"/><path fill="#79c8e3" d="M12 21h12v16H12z"/>',score:'<path fill="#fff2d0" stroke="#745040" stroke-width="2" d="M2 10h18l4 3 4-3h18v29H28l-4 3-4-3H2z"/><path stroke="#a28165" stroke-width="2" d="M8 17h10M8 23h10M8 29h10M30 17h10M30 23h10M30 29h10"/>',capsule:'<circle cx="23" cy="23" r="14" fill="#f1c1d6" stroke="#74465f" stroke-width="3"/><path fill="#fff0ce" d="M10 23a13 13 0 0 1 26 0z"/><path stroke="#74465f" stroke-width="3" d="M9 23h28"/>'};
 let room=null,raf=0,last=0,elapsed=0,routines=new Map(),paused=false,reactions=new Map(),reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
 function markup(trainee=false){return `<div class="room-residents">${members.map(m=>`<button class="room-actor" data-room-action="touch" data-member="${m.id}" data-pose="idle" style="left:${homes[m.id][0]}%;top:90%" aria-label="${m.name} 반응 보기"><span class="room-emote" aria-hidden="true"></span><span class="room-actor-art">${sprite(m.id,trainee?practiceOutfit:undefined,'room')}</span><span class="room-prop" aria-hidden="true"></span><span class="room-actor-name">${m.name}</span></button>`).join('')}</div>`;}
 function controls(){return `<div class="room-life-controls"><button data-room-action="pause" aria-pressed="${paused||reduced}">${paused||reduced?'일상 동작 켜기':'일상 동작 멈추기'}</button>${isTest?'<button data-room-action="next">다음 일상 보기</button>':''}<span class="room-life-status" role="status" aria-live="polite"></span></div>`;}
 function actor(id){return room?.querySelector(`[data-member="${id}"]`);}
 function pose(id,kind,text=''){const el=actor(id);if(!el)return;if(el.dataset.pose===kind&&el.querySelector('.room-emote').textContent===text)return;el.dataset.pose=kind;el.querySelector('.room-emote').textContent=text;el.querySelector('.room-prop').innerHTML=icons[kind]?`<svg viewBox="0 0 48 48">${icons[kind]}</svg>`:'';}
 function put(id,p){const el=actor(id);if(!el)return;el.style.left=p[0]+'%';el.style.top=p[1]+'%';el.style.zIndex=String(Math.round(p[1]));}
 function resetActor(id){put(id,homes[id]);pose(id,'idle');actor(id)?.classList.remove('capsule-received');}
 function start(id,r){const [kind,x,y]=plans[id][r.sequence%plans[id].length];r.sequence++;r.cycle={kind,at:[x,y],time:0};}
 function greet(id,c){
  const other=id==='gr'?'br':'gr';
  // Do not interrupt a touch response or another exchange. Both stay in their lanes.
  if(reactions.has(other))return;
  c.greetSent=true;
  for(const [who,target,delay,text] of [[id,other,0,'같이 힘내요!'],[other,id,650,'좋아!']]){
   const el=actor(who);el.dataset.greetingSide=homes[target][0]>homes[who][0]?'right':'left';
   el.classList.remove('capsule-received');
   pose(who,delay?'idle':'greet',delay?'':text);
   reactions.set(who,{start:elapsed+delay,until:elapsed+delay+2100,kind:'greet',text});
  }
 }
 function interpolate(points,progress){const t=Math.min(.999999,Math.max(0,progress))*(points.length-1),i=Math.floor(t),u=t-i;return points[i].map((n,k)=>n+(points[i+1][k]-n)*u);}
 function frame(now){raf=0;if(!room?.isConnected)return;const dt=last?Math.min(80,now-last):0;last=now;
  const unavailable=document.hidden||!!root.querySelector('dialog[open]');room.classList.toggle('life-paused',unavailable||paused||reduced);
  let turning=false;
  if(!unavailable&&!paused&&!reduced){elapsed+=dt;for(const [id,r] of reactions){if(elapsed>=r.until){pose(id,'idle');reactions.delete(id);}else if(r.kind&&elapsed>=r.start)pose(id,r.kind,r.text);}
   if(!paused&&!reduced&&!room.classList.contains('is-practicing')){
    for(const [id,r] of routines){
     if(reactions.has(id))continue;
     if(!r.cycle){r.wait-=dt;if(r.wait<=0)start(id,r);}
     if(!r.cycle)continue;
     const c=r.cycle;c.time+=dt;const t=c.time,home=homes[id],walk=r.walk,hold=r.hold;
     const route=[home,[(home[0]+c.at[0])/2,Math.min(home[1],(home[1]+c.at[1])/2+2)],c.at];
     if(t<walk){put(id,interpolate(route,t/walk));pose(id,'walk');}
     else if(t<walk+hold){put(id,c.at);pose(id,c.kind,texts[c.kind]);if(c.kind==='greet'&&!c.greetSent)greet(id,c);if(c.kind==='capsule'){turning=t<walk+hold*.65;actor(id).classList.toggle('capsule-received',!turning);}}
     else if(t<walk*2+hold){actor(id).classList.remove('capsule-received');put(id,interpolate(route.slice().reverse(),(t-walk-hold)/walk));pose(id,'walk');}
     else{resetActor(id);r.cycle=null;r.wait=r.rest;}
    }
   }
  }
  if(!unavailable&&!paused&&!reduced)room.classList.toggle('machine-turning',turning&&!reactions.has('yj'));
  raf=requestAnimationFrame(frame);
 }
 function bind(){cancelAnimationFrame(raf);room=root.querySelector('.studio-room-v2');reactions.clear();last=0;routines=new Map(order.map((id,i)=>[id,{sequence:0,cycle:null,wait:900+i*400,walk:3100+i*400,hold:4300+i*350,rest:1300+i*300}]));if(room){for(const id of order)resetActor(id);raf=requestAnimationFrame(frame);}}
 root.addEventListener('click',e=>{const control=e.target.closest('[data-room-action]');if(!control)return;const action=control.dataset.roomAction;
  if(action==='touch'){const id=control.dataset.member;if(!actor(id))return;if(routines.get(id)?.cycle?.kind==='capsule')room.classList.remove('machine-turning');actor(id).classList.remove('capsule-received');const previous=Number(control.dataset.touches||0);control.dataset.touches=String(previous+1);const kinds=['wave','heart','nod'];pose(id,kinds[previous%3],['반가워요!','♥','함께 연습해요!'][previous%3]);reactions.set(id,{until:elapsed+2400});const status=root.querySelector('.room-life-status');if(status)status.textContent=names[id]+' '+['손 흔들기','하트 인사','고개 끄덕이기'][previous%3];}
  if(action==='pause'){paused=!(paused||reduced);reduced=false;control.textContent=paused?'일상 동작 켜기':'일상 동작 멈추기';control.setAttribute('aria-pressed',String(paused));}
  if(action==='next'){for(const [id,r] of routines){resetActor(id);r.cycle=null;r.wait=0;}room?.classList.remove('machine-turning');reactions.clear();paused=false;reduced=false;const p=root.querySelector('[data-room-action="pause"]');if(p){p.textContent='일상 동작 멈추기';p.setAttribute('aria-pressed','false');}}
 });
 return {markup,controls,bind};
};

},
"src/client/our-stage-concert-motion.js":function(module,exports,__require){
'use strict';
const library=__require("src/shared/our-stage-motion-library.js"),tracks=__require("src/data/our-stage-choreography.json"),channels=__require("src/shared/our-stage-motion-channels.js");
// Shuffle complete phrases, not four-second songs. The scent/greeting pair stays together.
function makeQueue(random=Math.random){let bag=[],last=null;return ()=>{if(!bag.length){let groups=[['scent','greeting'],['marry'],['voice']];for(let i=groups.length-1;i>0;i--){const j=Math.floor(random()*(i+1));[groups[i],groups[j]]=[groups[j],groups[i]];}if(groups[0][0]===last)[groups[0],groups[1]]=[groups[1],groups[0]];bag=groups.flat();}last=bag.shift();return last;};}
function framesFor(track,member,transform,previous,bridge,duration){const total=bridge+duration,out=previous?[{offset:0,transform:transform(previous)}]:[];for(const f of track.frames)out.push({offset:(bridge+f.time/(track.end-track.start)*duration)/total,transform:transform(f.members[member])});return out;}
function create({random=Math.random,reduced=()=>matchMedia('(prefers-reduced-motion: reduce)').matches}={}){
 let stage=null,animations=[],generation=0,held=false,previous=null,next=null;
 function stop(){generation++;for(const a of animations)a.cancel();animations=[];stage=null;previous=null;held=false;}
 function run(entrance=0){if(!stage?.isConnected)return;const token=generation,id=next(),track=tracks[id],duration=library[id].seconds/library[id].speed*1000,bridge=previous?650:0;
  stage.dataset.motion=id;const before=animations;animations=[];
  for(const member of ['br','gr','yj']){const actor=stage.querySelector(`[data-member="${member}"]`);if(!actor)continue;
   for(const [part,transform] of Object.entries(channels)){const target=part?actor.querySelector(part.trim()):actor;if(!target?.animate)continue;
    const animation=target.animate(framesFor(track,member,transform,previous?.[member],bridge,duration),{duration:duration+bridge,delay:entrance,fill:'both',easing:'linear'});animations.push(animation);if(held)animation.pause();
   }
  }
  for(const a of before)a.cancel();previous=track.frames.at(-1).members;
  if(animations.length)animations[0].finished.then(()=>{if(token===generation&&stage?.isConnected)run();}).catch(()=>{});
 }
 function mount(target,entrance=0){stop();stage=target;if(!stage)return;next=makeQueue(random);stage.classList.add('concert-motion-mix');if(!reduced())run(entrance);}
 function pause(value){held=value;for(const a of animations)value?a.pause():a.play();}
 return {mount,pause,stop};
}
module.exports=create;module.exports.makeQueue=makeQueue;module.exports.framesFor=framesFor;

},
"src/data/our-stage-choreography.json":function(module,exports,__require){
module.exports={"scent":{"source":"https://www.youtube.com/watch?v=rFCNRIpPukY","start":61,"end":125,"frames":[{"time":0,"note":"61s: 후렴 진입. 가운데 보컬, 양옆은 넓은 발 간격.","members":{"br":[-3,0,0,0,0,0,0,0,5,-5],"gr":[0,0,0,0,-18,-112,100,90,0,0],"yj":[3,0,0,0,0,0,0,0,5,-5]}},{"time":2,"note":"앞뒤 관찰 자세를 잇는 체중 이동.","members":{"br":[-5,2,-3,0,-20,-120,20,120,7,-3],"gr":[0,1,0,-2,20,-65,100,90,0,0],"yj":[5,2,3,0,-20,-120,20,120,3,-7]}},{"time":4,"note":"65s: 옆 멤버는 팔을 허리 쪽에 모으고, 보컬은 마이크 유지.","members":{"br":[-5,0,-3,0,-10,-90,20,120,0,0],"gr":[1,0,0,-3,-18,-112,100,90,0,0],"yj":[5,0,3,0,-10,-90,20,120,0,0]}},{"time":6.5,"note":"70s 동작으로 진입: 무릎을 굽히며 팔을 올림.","members":{"br":[-7,3,-4,0,75,-20,0,0,9,-2],"gr":[0,3,0,-2,-15,-95,100,90,4,-4],"yj":[7,3,4,0,60,-20,0,0,2,-9]}},{"time":9,"note":"70s: 옆 멤버의 머리 위 팔선과 굽힌 무릎. 보컬은 노래 유지.","members":{"br":[-7,3,-4,0,140,-25,-25,60,11,-3],"gr":[0,3,2,0,-18,-112,100,90,4,-4],"yj":[7,3,4,0,125,-20,-20,50,3,-11]}},{"time":11,"note":"올렸던 손을 어깨선으로 내리고 발을 모으는 연결.","members":{"br":[-4,1,0,0,80,-65,10,40,4,0],"gr":[2,0,2,-2,42,-22,100,90,0,0],"yj":[4,1,0,0,65,-55,10,35,0,-4]}},{"time":13,"note":"오케스트라 화면 전환 앞뒤를 잇는 중립 자세.","members":{"br":[-3,0,0,0,15,-25,0,0,0,0],"gr":[0,0,0,-3,-18,-112,100,90,0,0],"yj":[3,0,0,0,12,-20,0,0,0,0]}},{"time":19,"note":"75–80s 오케스트라 컷: 보이지 않는 안무는 새로 만들지 않고 호흡만 유지.","members":{"br":[-3,1,0,2,0,0,0,0,0,0],"gr":[0,1,0,-1,-18,-112,100,90,0,0],"yj":[3,1,0,-2,0,0,0,0,0,0]}},{"time":23,"note":"다음 보컬 파트로 마이크를 올리는 연결.","members":{"br":[-2,0,0,1,8,-18,100,90,0,0],"gr":[1,0,0,0,-20,-120,20,120,0,0],"yj":[3,0,0,-1,0,0,0,0,0,0]}},{"time":29,"note":"90s 짧은 머리 보컬 클로즈업: 고개를 기울여 노래.","members":{"br":[-2,0,1,4,-18,-112,100,90,0,0],"gr":[1,0,0,0,-10,-25,0,0,0,0],"yj":[3,0,0,0,10,-25,0,0,0,0]}},{"time":32,"note":"보컬의 손을 가슴 앞에서 조금 펼침.","members":{"br":[-1,0,0,2,30,-65,100,90,0,0],"gr":[2,0,0,1,0,0,0,0,0,0],"yj":[4,0,0,-1,0,0,0,0,0,0]}},{"time":34,"note":"95s: 가운데 보컬과 양옆 낮은 팔선, 넓어진 대형.","members":{"br":[0,-2,0,-2,-18,-112,100,90,4,-4],"gr":[-7,1,-3,0,0,0,0,0,3,0],"yj":[7,1,3,0,0,0,0,0,0,-3]}},{"time":39,"note":"100s: 양옆은 앞으로, 보컬은 뒤쪽에 남는 대형을 작게 해석.","members":{"br":[0,-3,0,-2,-10,-70,100,90,0,0],"gr":[-8,2,0,0,8,0,0,0,0,0],"yj":[8,2,0,0,12,0,0,0,0,0]}},{"time":42,"note":"다음 보컬로 전환. 앞뒤 화면에서 확인되는 마이크 이동.","members":{"br":[-3,0,0,0,-20,-120,20,120,0,0],"gr":[-4,1,0,0,0,0,0,0,0,0],"yj":[5,1,0,2,8,-18,100,90,0,0]}},{"time":44,"note":"105s 긴 머리 보컬 클로즈업: 마이크와 상체 중심.","members":{"br":[-4,0,0,0,0,0,0,0,0,0],"gr":[-3,0,0,0,0,0,0,0,0,0],"yj":[4,0,0,3,-12,-85,100,90,0,0]}},{"time":49,"note":"110s: 자유 손을 윗배/가슴 아래에 두고 고개를 기울임.","members":{"br":[-4,0,0,1,0,0,0,0,0,0],"gr":[-3,0,0,-1,0,0,0,0,0,0],"yj":[3,0,1,5,-12,-105,100,90,0,0]}},{"time":53,"note":"클로즈업으로 보이지 않는 하체는 큰 동작 없이 유지.","members":{"br":[-3,1,0,0,0,0,0,0,0,0],"gr":[-2,1,0,0,-20,-120,20,120,0,0],"yj":[2,1,0,2,-18,-112,100,90,0,0]}},{"time":57,"note":"다음 목소리로 넘기는 연결.","members":{"br":[-2,0,0,0,0,0,0,0,0,0],"gr":[0,0,0,-1,8,-18,100,90,0,0],"yj":[2,0,0,0,-20,-120,20,120,0,0]}},{"time":59,"note":"120s 앞머리 보컬 클로즈업: 마이크를 입에 두고 고개를 들기.","members":{"br":[-2,0,0,1,0,0,0,0,0,0],"gr":[0,0,0,-4,-12,-92,100,90,0,0],"yj":[2,0,0,-1,0,0,0,0,0,0]}},{"time":64,"note":"125s까지의 노래 자세를 이어 마침. 원본에 없는 피날레 동작은 넣지 않음.","members":{"br":[-3,0,0,0,0,0,0,0,5,-5],"gr":[0,0,0,0,-18,-112,100,90,0,0],"yj":[3,0,0,0,0,0,0,0,5,-5]}}]},"greeting":{"source":"https://www.youtube.com/watch?v=63sCks2FLBI","start":92,"end":120,"frames":[{"time":0,"note":"92: 연지 보컬, 규리 가슴 앞 손, 보람 낮은 마이크","members":{"br":[0,0,0,0,-8,-65,8,65,0,0,0,0],"gr":[0,0,0,0,-30,-120,30,120,0,0,0,0],"yj":[0,0,0,0,12,-40,100,90,0,0,0,0]}},{"time":1,"note":"93: 보람·규리 팔꿈치 벌리기","members":{"br":[0,0,0,0,40,-130,-40,130,0,0,0,0],"gr":[0,0,0,0,35,-130,-35,130,0,0,0,0],"yj":[0,0,0,2,12,-40,100,90,0,0,0,0]}},{"time":2.65,"note":"94.65: 가슴/허리 높이의 팔꿈치 리듬","members":{"br":[0,3,0,0,65,-130,-65,130,8,-4,0,0],"gr":[0,4,0,0,45,-130,-45,130,6,-7,0,0],"yj":[0,0,0,0,-8,-105,100,90,0,0,0,0]}},{"time":3.48,"note":"95.48: 팔을 내리고 발 모으기","members":{"br":[-3,1,0,3,-8,-65,8,65,0,0,0,0],"gr":[2,1,0,0,30,-8,-30,8,0,0,0,0],"yj":[0,0,0,0,12,-40,100,90,0,0,0,0]}},{"time":4.17,"note":"96.17: 옆걸음 준비","members":{"br":[-3,0,0,0,35,-130,-20,130,0,0,0,0],"gr":[-2,0,0,0,25,-65,-25,65,0,0,0,0],"yj":[0,0,0,0,15,-55,100,90,0,0,0,0]}},{"time":4.78,"note":"96.78: 화면 왼쪽으로 몸 틀기","members":{"br":[-10,3,-2,2,30,-130,-20,130,-9,9,-48,10],"gr":[-7,3,0,0,25,-65,-25,65,-8,7,-32,8],"yj":[0,0,0,2,12,-40,100,90,0,0,-8,0]}},{"time":5.37,"note":"97.37: 정면을 거쳐 반대쪽으로","members":{"br":[-3,4,0,0,28,-130,-18,130,2,-3,0,0],"gr":[-2,4,0,0,25,-65,-25,65,0,0,0,0],"yj":[0,0,0,-2,12,-40,100,90,0,0,0,0]}},{"time":6.13,"note":"98.13: 오른쪽 사선으로 몸 틀기","members":{"br":[8,2,2,0,30,-130,-20,130,9,-8,42,-9],"gr":[6,2,0,0,25,-65,-25,65,8,-7,30,-7],"yj":[0,0,0,0,12,-40,100,90,0,0,10,0]}},{"time":6.68,"note":"98.68: 낮은 손바닥과 교차 스텝","members":{"br":[3,2,0,0,30,-8,-30,8,-4,7,0,8],"gr":[2,3,0,0,30,-8,-30,8,-6,8,0,13],"yj":[0,0,0,0,12,-40,100,90,0,0,0,0]}},{"time":7.26,"note":"99.26: 옆으로 발 내딛기","members":{"br":[9,0,2,0,30,-8,-30,8,10,-6,15,0],"gr":[7,0,2,0,30,-8,-30,8,10,-6,15,0],"yj":[0,0,0,-2,12,-40,100,90,0,0,0,0]}},{"time":7.81,"note":"99.81: 반대 발 교차","members":{"br":[2,3,0,0,30,-8,-30,8,5,-8,0,-9],"gr":[1,3,0,0,30,-8,-30,8,6,-8,0,-13],"yj":[0,0,0,0,12,-40,100,90,0,0,0,0]}},{"time":8.38,"note":"100.38: 왼쪽으로 발 내딛기","members":{"br":[-8,0,-2,0,30,-8,-30,8,-9,6,-15,0],"gr":[-6,0,-2,0,30,-8,-30,8,-9,6,-15,0],"yj":[0,0,0,0,25,-15,100,90,0,0,0,0]}},{"time":8.94,"note":"100.94: 가슴 앞 손, 교차한 발","members":{"br":[-3,3,0,0,-30,-120,30,120,-3,5,0,6],"gr":[-2,3,0,0,-30,-120,30,120,-8,8,0,15],"yj":[0,0,0,0,15,-55,100,90,0,0,0,0]}},{"time":9.5,"note":"101.5: 규리 오른쪽 사선, 보람 상체 기울이기","members":{"br":[3,0,-4,-6,-30,-120,30,120,7,-6,15,0],"gr":[5,0,2,-2,-30,-120,30,120,10,-8,48,-11],"yj":[0,0,0,-5,12,-40,100,90,0,0,0,0]}},{"time":10.16,"note":"102.16: 정면으로 돌아오기","members":{"br":[0,0,0,0,-8,-65,8,65,8,-8,0,0],"gr":[0,0,0,0,-30,-120,30,120,7,-7,8,0],"yj":[0,0,0,0,25,-70,100,90,0,0,0,0]}},{"time":11.44,"note":"103.44: 가슴 앞 교차 팔","members":{"br":[0,0,-3,2,-30,-120,30,120,10,-7,0,0],"gr":[0,0,3,-2,-30,-120,30,120,8,-8,0,0],"yj":[0,0,0,0,-20,-115,100,90,0,0,0,0]}},{"time":12.15,"note":"104.15: 앞으로 펼친 손","members":{"br":[0,0,0,0,55,-65,-55,65,0,0,0,0],"gr":[0,0,0,0,50,-55,-50,55,0,0,0,0],"yj":[0,0,0,0,60,-70,100,90,0,0,0,0]}},{"time":12.72,"note":"104.72: 낮은 팔 준비","members":{"br":[0,0,0,0,30,-8,-30,8,0,0,0,0],"gr":[0,0,0,0,0,0,0,0,0,0,0,0],"yj":[0,0,0,0,65,-70,100,90,0,0,0,0]}},{"time":13.3,"note":"105.3: 한 손을 높게 쓸어올리기","members":{"br":[0,0,-3,0,145,-20,10,30,0,0,0,0],"gr":[0,0,-3,0,135,-20,0,0,0,0,0,0],"yj":[0,0,0,0,140,-30,100,90,0,0,0,0]}},{"time":13.94,"note":"105.94: 쓸어내리는 팔과 사선 방향","members":{"br":[-5,0,0,2,30,-8,-30,8,0,0,-35,0],"gr":[-3,0,0,0,45,-20,0,0,0,0,-22,0],"yj":[0,0,0,0,145,-20,100,90,0,0,0,0]}},{"time":15.18,"note":"107.18: 어깨 앞 한 손 포인트","members":{"br":[0,0,0,-5,30,-145,0,0,0,0,0,0],"gr":[0,0,0,2,40,-145,0,0,0,0,0,0],"yj":[0,0,0,3,12,-40,100,90,0,0,0,0]}},{"time":16.44,"note":"108.44: 손을 어깨에서 바깥으로","members":{"br":[0,0,0,-3,65,-100,0,0,0,0,-15,0],"gr":[-3,0,0,0,80,-60,0,0,0,0,-22,0],"yj":[0,0,0,2,40,-80,100,90,0,0,0,0]}},{"time":17.68,"note":"109.68: 반대 손을 어깨 옆으로","members":{"br":[0,0,0,2,0,0,-50,110,0,0,0,0],"gr":[0,0,0,2,0,0,-55,105,0,0,0,0],"yj":[0,0,0,0,-8,-65,100,90,0,0,0,0]}},{"time":18.93,"note":"110.93: 보람 마이크 준비","members":{"br":[0,0,0,0,-8,-65,65,80,0,0,0,0],"gr":[0,0,0,0,30,-8,-35,45,0,0,0,0],"yj":[0,0,0,0,35,-60,100,90,0,0,0,0]}},{"time":19.5,"note":"111.5: 보람 보컬 시작, 규리 양팔 위로","members":{"br":[0,0,0,0,-20,-110,100,90,0,0,0,0],"gr":[0,0,0,0,105,-30,-105,30,0,0,0,0],"yj":[0,0,0,0,5,-15,100,90,0,0,0,0]}},{"time":20.3,"note":"112.3: 규리 양손 위","members":{"br":[0,0,0,0,-20,-110,100,90,0,0,0,0],"gr":[0,0,0,2,155,-15,-155,15,0,0,0,0],"yj":[0,0,0,0,12,-40,100,90,0,0,0,0]}},{"time":20.82,"note":"112.82: 규리 손 내리기, 연지 안무 합류","members":{"br":[0,0,0,0,-20,-110,100,90,0,0,0,0],"gr":[0,0,0,0,70,-85,-20,30,10,-8,0,0],"yj":[0,0,0,0,85,-105,35,80,0,0,0,0]}},{"time":21.37,"note":"113.37: 머리 위 사선으로 양팔 넘기기","members":{"br":[0,0,0,0,-20,-110,100,90,0,0,0,0],"gr":[0,0,7,-5,155,-25,-120,35,12,-8,22,0],"yj":[0,0,8,-5,150,-25,-115,35,10,-9,25,0]}},{"time":21.92,"note":"113.92: 팔 내리며 정면","members":{"br":[0,0,0,0,25,-90,100,90,0,0,0,0],"gr":[0,3,0,0,30,-8,-30,8,0,0,0,0],"yj":[0,3,0,0,30,-8,-30,8,0,0,0,0]}},{"time":22.51,"note":"114.51: 얼굴 옆 손, 고개 기울임","members":{"br":[0,0,0,0,10,-35,100,90,0,0,0,0],"gr":[0,0,-3,-7,0,0,-70,120,0,0,-15,0],"yj":[0,0,-3,-7,0,0,-70,120,0,0,-15,0]}},{"time":23.06,"note":"115.06: 얼굴 앞을 쓸며 왼쪽 사선으로","members":{"br":[0,0,0,0,-20,-110,100,90,0,0,0,0],"gr":[0,0,0,3,0,0,55,120,-8,8,-45,7],"yj":[0,0,0,3,0,0,55,120,-7,7,-38,5]}},{"time":23.61,"note":"115.61: 규리 왼쪽 측면, 손은 앞으로 내려옴","members":{"br":[0,0,0,0,-20,-110,100,90,0,0,0,0],"gr":[-6,0,0,0,15,0,55,50,-10,9,-58,10],"yj":[-4,0,0,0,0,0,45,45,-8,7,-42,7]}},{"time":24.5,"note":"116.5: 정면 복귀, 낮은 팔","members":{"br":[0,0,0,0,-20,-110,100,90,0,0,0,0],"gr":[-2,0,0,0,30,-8,-30,8,0,0,-12,0],"yj":[-1,0,0,0,30,-8,-30,8,0,0,-8,0]}},{"time":25.91,"note":"117.91: 발 벌리고 고개 기울이기","members":{"br":[0,0,0,0,20,-20,100,90,0,0,0,0],"gr":[0,0,3,9,0,0,0,0,12,-12,0,0],"yj":[0,0,3,8,0,0,0,0,10,-10,0,0]}},{"time":26.6,"note":"118.6: 발 모으고 손 가슴 앞으로","members":{"br":[0,0,0,0,-20,-110,100,90,0,0,0,0],"gr":[0,2,0,0,-8,-65,8,65,0,0,0,0],"yj":[0,2,0,0,-8,-65,8,65,0,0,0,0]}},{"time":27.29,"note":"119.29: 규리·연지 교차 팔","members":{"br":[0,0,0,0,-20,-110,100,90,0,0,0,0],"gr":[0,0,0,0,-30,-120,30,120,0,0,0,0],"yj":[0,0,0,0,-30,-120,30,120,0,0,0,0]}},{"time":28,"note":"120: 손을 펴며 다음 동작으로","members":{"br":[0,0,0,0,20,-85,100,90,0,0,0,0],"gr":[0,0,0,0,50,-65,-50,65,0,0,0,0],"yj":[0,0,0,0,50,-65,-50,65,0,0,0,0]}}]},"marry":{"source":"https://www.youtube.com/watch?v=D-mng72Hx1w","start":143,"end":167,"frames":[{"time":0,"note":"앞발 들기와 가슴으로 모았다 펴는 손 · 1","members":{"br":[0,0,-4,3,3,-25,100,90,-14,11,0,0,1.3],"gr":[0,0,-4,3,8,-25,22,90,-14,11,0,0,1.3],"yj":[0,0,-4,3,13,-25,22,90,-14,11,0,0,1.3]}},{"time":0.75,"note":"앞발 들기와 가슴으로 모았다 펴는 손 · 2","members":{"br":[0,5,4,-3,30,-70,100,90,14,-11,0,0,1.3],"gr":[0,5,4,-3,35,-70,22,90,14,-11,0,0,1.3],"yj":[0,5,4,-3,40,-70,22,90,14,-11,0,0,1.3]}},{"time":1.5,"note":"앞발 들기와 가슴으로 모았다 펴는 손 · 3","members":{"br":[0,0,-4,3,-23,-115,100,90,-14,11,0,0,1.3],"gr":[0,0,-4,3,-18,-115,22,90,-14,11,0,0,1.3],"yj":[0,0,-4,3,-13,-115,22,90,-14,11,0,0,1.3]}},{"time":2.25,"note":"앞발 들기와 가슴으로 모았다 펴는 손 · 4","members":{"br":[0,5,4,-3,45,-55,100,90,14,-11,0,0,1.3],"gr":[0,5,4,-3,50,-55,22,90,14,-11,0,0,1.3],"yj":[0,5,4,-3,55,-55,22,90,14,-11,0,0,1.3]}},{"time":3,"note":"앞발 들기와 가슴으로 모았다 펴는 손 · 5","members":{"br":[0,0,-4,3,77,-18,100,90,-14,11,0,0,1.3],"gr":[0,0,-4,3,82,-18,22,90,-14,11,0,0,1.3],"yj":[0,0,-4,3,87,-18,22,90,-14,11,0,0,1.3]}},{"time":3.75,"note":"앞발 들기와 가슴으로 모았다 펴는 손 · 6","members":{"br":[0,5,4,-3,30,-65,100,90,14,-11,0,0,1.3],"gr":[0,5,4,-3,35,-65,22,90,14,-11,0,0,1.3],"yj":[0,5,4,-3,40,-65,22,90,14,-11,0,0,1.3]}},{"time":4.5,"note":"앞발 들기와 가슴으로 모았다 펴는 손 · 7","members":{"br":[0,0,-4,3,-20,-110,100,90,-14,11,0,0,1.3],"gr":[0,0,-4,3,-15,-110,22,90,-14,11,0,0,1.3],"yj":[0,0,-4,3,-10,-110,22,90,-14,11,0,0,1.3]}},{"time":5.25,"note":"앞발 들기와 가슴으로 모았다 펴는 손 · 8","members":{"br":[0,5,4,-3,60,-35,100,90,14,-11,0,0,1.3],"gr":[0,5,4,-3,65,-35,22,90,14,-11,0,0,1.3],"yj":[0,5,4,-3,70,-35,22,90,14,-11,0,0,1.3]}},{"time":6,"note":"약속 손을 얼굴 옆에 들고 앞으로 건네기 · 1","members":{"br":[0,0,-4,3,60,-125,22,90,-14,11,0,0,1.3],"gr":[0,0,-4,3,65,-125,22,90,-14,11,0,0,1.3],"yj":[0,0,-4,3,70,-125,100,90,-14,11,0,0,1.3]}},{"time":6.75,"note":"약속 손을 얼굴 옆에 들고 앞으로 건네기 · 2","members":{"br":[0,5,4,-3,90,-105,22,90,14,-11,0,0,1.3],"gr":[0,5,4,-3,95,-105,22,90,14,-11,0,0,1.3],"yj":[0,5,4,-3,100,-105,100,90,14,-11,0,0,1.3]}},{"time":7.5,"note":"약속 손을 얼굴 옆에 들고 앞으로 건네기 · 3","members":{"br":[0,0,-4,3,50,-55,22,90,-14,11,0,0,1.3],"gr":[0,0,-4,3,55,-55,22,90,-14,11,0,0,1.3],"yj":[0,0,-4,3,60,-55,100,90,-14,11,0,0,1.3]}},{"time":8.25,"note":"약속 손을 얼굴 옆에 들고 앞으로 건네기 · 4","members":{"br":[0,5,4,-3,85,-15,22,90,14,-11,0,0,1.3],"gr":[0,5,4,-3,90,-15,22,90,14,-11,0,0,1.3],"yj":[0,5,4,-3,95,-15,100,90,14,-11,0,0,1.3]}},{"time":9,"note":"약속 손을 얼굴 옆에 들고 앞으로 건네기 · 5","members":{"br":[0,0,-4,3,35,-75,22,90,-14,11,0,0,1.3],"gr":[0,0,-4,3,40,-75,22,90,-14,11,0,0,1.3],"yj":[0,0,-4,3,45,-75,100,90,-14,11,0,0,1.3]}},{"time":9.75,"note":"약속 손을 얼굴 옆에 들고 앞으로 건네기 · 6","members":{"br":[0,5,4,-3,-23,-115,22,90,14,-11,0,0,1.3],"gr":[0,5,4,-3,-18,-115,22,90,14,-11,0,0,1.3],"yj":[0,5,4,-3,-13,-115,100,90,14,-11,0,0,1.3]}},{"time":10.5,"note":"약속 손을 얼굴 옆에 들고 앞으로 건네기 · 7","members":{"br":[0,0,-4,3,60,-95,22,90,-14,11,0,0,1.3],"gr":[0,0,-4,3,65,-95,22,90,-14,11,0,0,1.3],"yj":[0,0,-4,3,70,-95,100,90,-14,11,0,0,1.3]}},{"time":11.25,"note":"약속 손을 얼굴 옆에 들고 앞으로 건네기 · 8","members":{"br":[0,5,4,-3,85,-30,22,90,14,-11,0,0,1.3],"gr":[0,5,4,-3,90,-30,22,90,14,-11,0,0,1.3],"yj":[0,5,4,-3,95,-30,100,90,14,-11,0,0,1.3]}},{"time":12,"note":"손바닥을 어깨 높이로 펼치고 얼굴 옆으로 흔들기 · 1","members":{"br":[0,0,-4,3,73,-70,22,90,-14,11,0,0,1.3],"gr":[0,0,-4,3,78,-70,22,90,-14,11,0,0,1.3],"yj":[0,0,-4,3,83,-70,100,90,-14,11,0,0,1.3]}},{"time":12.75,"note":"손바닥을 어깨 높이로 펼치고 얼굴 옆으로 흔들기 · 2","members":{"br":[0,5,4,-3,107,-105,22,90,14,-11,0,0,1.3],"gr":[0,5,4,-3,112,-105,22,90,14,-11,0,0,1.3],"yj":[0,5,4,-3,117,-105,100,90,14,-11,0,0,1.3]}},{"time":13.5,"note":"손바닥을 어깨 높이로 펼치고 얼굴 옆으로 흔들기 · 3","members":{"br":[0,0,-4,3,65,-45,22,90,-14,11,0,0,1.3],"gr":[0,0,-4,3,70,-45,22,90,-14,11,0,0,1.3],"yj":[0,0,-4,3,75,-45,100,90,-14,11,0,0,1.3]}},{"time":14.25,"note":"손바닥을 어깨 높이로 펼치고 얼굴 옆으로 흔들기 · 4","members":{"br":[0,5,4,-3,110,-90,22,90,14,-11,0,0,1.3],"gr":[0,5,4,-3,115,-90,22,90,14,-11,0,0,1.3],"yj":[0,5,4,-3,120,-90,100,90,14,-11,0,0,1.3]}},{"time":15,"note":"손바닥을 어깨 높이로 펼치고 얼굴 옆으로 흔들기 · 5","members":{"br":[0,0,-4,3,73,-35,22,90,-14,11,0,0,1.3],"gr":[0,0,-4,3,78,-35,22,90,-14,11,0,0,1.3],"yj":[0,0,-4,3,83,-35,100,90,-14,11,0,0,1.3]}},{"time":15.75,"note":"손바닥을 어깨 높이로 펼치고 얼굴 옆으로 흔들기 · 6","members":{"br":[0,5,4,-3,105,-110,22,90,14,-11,0,0,1.3],"gr":[0,5,4,-3,110,-110,22,90,14,-11,0,0,1.3],"yj":[0,5,4,-3,115,-110,100,90,14,-11,0,0,1.3]}},{"time":16.5,"note":"손바닥을 어깨 높이로 펼치고 얼굴 옆으로 흔들기 · 7","members":{"br":[0,0,-4,3,55,-65,22,90,-14,11,0,0,1.3],"gr":[0,0,-4,3,60,-65,22,90,-14,11,0,0,1.3],"yj":[0,0,-4,3,65,-65,100,90,-14,11,0,0,1.3]}},{"time":17.25,"note":"손바닥을 어깨 높이로 펼치고 얼굴 옆으로 흔들기 · 8","members":{"br":[0,5,4,-3,20,-95,22,90,14,-11,0,0,1.3],"gr":[0,5,4,-3,25,-95,22,90,14,-11,0,0,1.3],"yj":[0,5,4,-3,30,-95,100,90,14,-11,0,0,1.3]}},{"time":18,"note":"세 멤버 얼굴 옆 웨이브와 번갈아 발끝 들기 · 1","members":{"br":[0,0,-6,3,87,-110,22,90,-16,13,0,0,1.3],"gr":[0,0,-6,3,92,-110,100,90,-16,13,0,0,1.3],"yj":[0,0,-6,3,97,-110,22,90,-16,13,0,0,1.3]}},{"time":18.75,"note":"세 멤버 얼굴 옆 웨이브와 번갈아 발끝 들기 · 2","members":{"br":[0,5,6,-3,115,-95,22,90,16,-13,0,0,1.3],"gr":[0,5,6,-3,120,-95,100,90,16,-13,0,0,1.3],"yj":[0,5,6,-3,125,-95,22,90,16,-13,0,0,1.3]}},{"time":19.5,"note":"세 멤버 얼굴 옆 웨이브와 번갈아 발끝 들기 · 3","members":{"br":[0,0,-6,3,69,-60,22,90,-16,13,0,0,1.3],"gr":[0,0,-6,3,74,-60,100,90,-16,13,0,0,1.3],"yj":[0,0,-6,3,79,-60,22,90,-16,13,0,0,1.3]}},{"time":20.25,"note":"세 멤버 얼굴 옆 웨이브와 번갈아 발끝 들기 · 4","members":{"br":[0,5,6,-3,110,-100,22,90,16,-13,0,0,1.3],"gr":[0,5,6,-3,115,-100,100,90,16,-13,0,0,1.3],"yj":[0,5,6,-3,120,-100,22,90,16,-13,0,0,1.3]}},{"time":21,"note":"세 멤버 얼굴 옆 웨이브와 번갈아 발끝 들기 · 5","members":{"br":[0,0,-6,3,63,-40,22,90,-16,13,0,0,1.3],"gr":[0,0,-6,3,68,-40,100,90,-16,13,0,0,1.3],"yj":[0,0,-6,3,73,-40,22,90,-16,13,0,0,1.3]}},{"time":21.75,"note":"세 멤버 얼굴 옆 웨이브와 번갈아 발끝 들기 · 6","members":{"br":[0,5,6,-3,93,-105,22,90,16,-13,0,0,1.3],"gr":[0,5,6,-3,98,-105,100,90,16,-13,0,0,1.3],"yj":[0,5,6,-3,103,-105,22,90,16,-13,0,0,1.3]}},{"time":22.5,"note":"세 멤버 얼굴 옆 웨이브와 번갈아 발끝 들기 · 7","members":{"br":[0,0,-6,3,37,-65,22,90,-16,13,0,0,1.3],"gr":[0,0,-6,3,42,-65,100,90,-16,13,0,0,1.3],"yj":[0,0,-6,3,47,-65,22,90,-16,13,0,0,1.3]}},{"time":23.25,"note":"세 멤버 얼굴 옆 웨이브와 번갈아 발끝 들기 · 8","members":{"br":[0,5,6,-3,-25,-95,22,90,16,-13,0,0,1.3],"gr":[0,5,6,-3,-20,-95,100,90,16,-13,0,0,1.3],"yj":[0,5,6,-3,-15,-95,22,90,16,-13,0,0,1.3]}},{"time":24,"note":"허리 손과 정면 자세로 다음 무대에 연결","members":{"br":[0,0,-4,3,8,-25,100,90,-14,11,0,0,1.3],"gr":[0,0,-4,3,8,-25,100,90,-14,11,0,0,1.3],"yj":[0,0,-4,3,8,-25,100,90,-14,11,0,0,1.3]}}]},"voice":{"source":"https://www.youtube.com/watch?v=i9tx0-ldVYc","start":47,"end":67,"frames":[{"time":0,"note":"1번째 후렴 강조 · 준비 반동","members":{"br":[0,0,-6,3,16,-65,22,90,-16,13,0,0,1.3],"gr":[0,0,-6,3,20,-65,22,90,-16,13,0,0,1.3],"yj":[0,0,-6,3,24,-65,100,90,-16,13,0,0,1.3]}},{"time":0.5,"note":"1번째 후렴 강조 · 팔 올리기","members":{"br":[0,5,6,-3,91,-45,22,90,16,-13,0,0,1.3],"gr":[0,5,6,-3,95,-45,22,90,16,-13,0,0,1.3],"yj":[0,5,6,-3,99,-45,100,90,16,-13,0,0,1.3]}},{"time":1,"note":"1번째 후렴 강조 · 머리 위 큰 팔선","members":{"br":[0,0,-6,3,154,-25,22,90,-16,13,0,0,1.3],"gr":[0,0,-6,3,158,-25,22,90,-16,13,0,0,1.3],"yj":[0,0,-6,3,162,-25,100,90,-16,13,0,0,1.3]}},{"time":1.5,"note":"1번째 후렴 강조 · 머리 옆 접기","members":{"br":[0,5,6,-3,119,-75,22,90,16,-13,0,0,1.3],"gr":[0,5,6,-3,123,-75,22,90,16,-13,0,0,1.3],"yj":[0,5,6,-3,127,-75,100,90,16,-13,0,0,1.3]}},{"time":2,"note":"1번째 후렴 강조 · 위로 한 번 더","members":{"br":[0,0,-6,3,161,-15,22,90,-16,13,0,0,1.3],"gr":[0,0,-6,3,165,-15,22,90,-16,13,0,0,1.3],"yj":[0,0,-6,3,169,-15,100,90,-16,13,0,0,1.3]}},{"time":2.5,"note":"1번째 후렴 강조 · 옆으로 크게 펼치기","members":{"br":[0,5,6,-3,88,-12,-65,25,16,-13,0,0,1.3],"gr":[0,5,6,-3,92,-12,-65,25,16,-13,0,0,1.3],"yj":[0,5,6,-3,96,-12,100,90,16,-13,0,0,1.3]}},{"time":3,"note":"1번째 후렴 강조 · 관자놀이 손짓","members":{"br":[0,0,-6,3,106,-110,22,90,-16,13,0,0,1.3],"gr":[0,0,-6,3,110,-110,22,90,-16,13,0,0,1.3],"yj":[0,0,-6,3,114,-110,100,90,-16,13,0,0,1.3]}},{"time":3.5,"note":"1번째 후렴 강조 · 앞으로 펼치기","members":{"br":[0,5,6,-3,61,-45,22,90,16,-13,0,0,1.3],"gr":[0,5,6,-3,65,-45,22,90,16,-13,0,0,1.3],"yj":[0,5,6,-3,69,-45,100,90,16,-13,0,0,1.3]}},{"time":4,"note":"1번째 후렴 강조 · 제자리 발 구르기","members":{"br":[0,0,-6,3,8,-35,22,90,-16,13,0,0,1.3],"gr":[0,0,-6,3,12,-35,22,90,-16,13,0,0,1.3],"yj":[0,0,-6,3,16,-35,100,90,-16,13,0,0,1.3]}},{"time":4.5,"note":"1번째 후렴 강조 · 다음 강조로 연결","members":{"br":[0,5,6,-3,46,-65,22,90,16,-13,0,0,1.3],"gr":[0,5,6,-3,50,-65,22,90,16,-13,0,0,1.3],"yj":[0,5,6,-3,54,-65,100,90,16,-13,0,0,1.3]}},{"time":5,"note":"2번째 후렴 강조 · 준비 반동","members":{"br":[0,0,-6,3,16,-65,22,90,-16,13,0,0,1.3],"gr":[0,0,-6,3,20,-65,22,90,-16,13,0,0,1.3],"yj":[0,0,-6,3,24,-65,100,90,-16,13,0,0,1.3]}},{"time":5.5,"note":"2번째 후렴 강조 · 팔 올리기","members":{"br":[0,5,6,-3,91,-45,22,90,16,-13,0,0,1.3],"gr":[0,5,6,-3,95,-45,22,90,16,-13,0,0,1.3],"yj":[0,5,6,-3,99,-45,100,90,16,-13,0,0,1.3]}},{"time":6,"note":"2번째 후렴 강조 · 머리 위 큰 팔선","members":{"br":[0,0,-6,3,154,-25,22,90,-16,13,0,0,1.3],"gr":[0,0,-6,3,158,-25,22,90,-16,13,0,0,1.3],"yj":[0,0,-6,3,162,-25,100,90,-16,13,0,0,1.3]}},{"time":6.5,"note":"2번째 후렴 강조 · 머리 옆 접기","members":{"br":[0,5,6,-3,119,-75,22,90,16,-13,0,0,1.3],"gr":[0,5,6,-3,123,-75,22,90,16,-13,0,0,1.3],"yj":[0,5,6,-3,127,-75,100,90,16,-13,0,0,1.3]}},{"time":7,"note":"2번째 후렴 강조 · 위로 한 번 더","members":{"br":[0,0,-6,3,161,-15,22,90,-16,13,0,0,1.3],"gr":[0,0,-6,3,165,-15,22,90,-16,13,0,0,1.3],"yj":[0,0,-6,3,169,-15,100,90,-16,13,0,0,1.3]}},{"time":7.5,"note":"2번째 후렴 강조 · 옆으로 크게 펼치기","members":{"br":[0,5,6,-3,88,-12,-65,25,16,-13,0,0,1.3],"gr":[0,5,6,-3,92,-12,-65,25,16,-13,0,0,1.3],"yj":[0,5,6,-3,96,-12,100,90,16,-13,0,0,1.3]}},{"time":8,"note":"2번째 후렴 강조 · 관자놀이 손짓","members":{"br":[0,0,-6,3,106,-110,22,90,-16,13,0,0,1.3],"gr":[0,0,-6,3,110,-110,22,90,-16,13,0,0,1.3],"yj":[0,0,-6,3,114,-110,100,90,-16,13,0,0,1.3]}},{"time":8.5,"note":"2번째 후렴 강조 · 앞으로 펼치기","members":{"br":[0,5,6,-3,61,-45,22,90,16,-13,0,0,1.3],"gr":[0,5,6,-3,65,-45,22,90,16,-13,0,0,1.3],"yj":[0,5,6,-3,69,-45,100,90,16,-13,0,0,1.3]}},{"time":9,"note":"2번째 후렴 강조 · 제자리 발 구르기","members":{"br":[0,0,-6,3,8,-35,22,90,-16,13,0,0,1.3],"gr":[0,0,-6,3,12,-35,22,90,-16,13,0,0,1.3],"yj":[0,0,-6,3,16,-35,100,90,-16,13,0,0,1.3]}},{"time":9.5,"note":"2번째 후렴 강조 · 다음 강조로 연결","members":{"br":[0,5,6,-3,46,-65,22,90,16,-13,0,0,1.3],"gr":[0,5,6,-3,50,-65,22,90,16,-13,0,0,1.3],"yj":[0,5,6,-3,54,-65,100,90,16,-13,0,0,1.3]}},{"time":10,"note":"3번째 후렴 강조 · 준비 반동","members":{"br":[0,0,-6,3,16,-65,100,90,-16,13,0,0,1.3],"gr":[0,0,-6,3,20,-65,22,90,-16,13,0,0,1.3],"yj":[0,0,-6,3,24,-65,22,90,-16,13,0,0,1.3]}},{"time":10.5,"note":"3번째 후렴 강조 · 팔 올리기","members":{"br":[0,5,6,-3,91,-45,100,90,16,-13,0,0,1.3],"gr":[0,5,6,-3,95,-45,22,90,16,-13,0,0,1.3],"yj":[0,5,6,-3,99,-45,22,90,16,-13,0,0,1.3]}},{"time":11,"note":"3번째 후렴 강조 · 머리 위 큰 팔선","members":{"br":[0,0,-6,3,154,-25,100,90,-16,13,0,0,1.3],"gr":[0,0,-6,3,158,-25,22,90,-16,13,0,0,1.3],"yj":[0,0,-6,3,162,-25,22,90,-16,13,0,0,1.3]}},{"time":11.5,"note":"3번째 후렴 강조 · 머리 옆 접기","members":{"br":[0,5,6,-3,119,-75,100,90,16,-13,0,0,1.3],"gr":[0,5,6,-3,123,-75,22,90,16,-13,0,0,1.3],"yj":[0,5,6,-3,127,-75,22,90,16,-13,0,0,1.3]}},{"time":12,"note":"3번째 후렴 강조 · 위로 한 번 더","members":{"br":[0,0,-6,3,161,-15,100,90,-16,13,0,0,1.3],"gr":[0,0,-6,3,165,-15,22,90,-16,13,0,0,1.3],"yj":[0,0,-6,3,169,-15,22,90,-16,13,0,0,1.3]}},{"time":12.5,"note":"3번째 후렴 강조 · 옆으로 크게 펼치기","members":{"br":[0,5,6,-3,88,-12,100,90,16,-13,0,0,1.3],"gr":[0,5,6,-3,92,-12,-65,25,16,-13,0,0,1.3],"yj":[0,5,6,-3,96,-12,-65,25,16,-13,0,0,1.3]}},{"time":13,"note":"3번째 후렴 강조 · 관자놀이 손짓","members":{"br":[0,0,-6,3,106,-110,100,90,-16,13,0,0,1.3],"gr":[0,0,-6,3,110,-110,22,90,-16,13,0,0,1.3],"yj":[0,0,-6,3,114,-110,22,90,-16,13,0,0,1.3]}},{"time":13.5,"note":"3번째 후렴 강조 · 앞으로 펼치기","members":{"br":[0,5,6,-3,61,-45,100,90,16,-13,0,0,1.3],"gr":[0,5,6,-3,65,-45,22,90,16,-13,0,0,1.3],"yj":[0,5,6,-3,69,-45,22,90,16,-13,0,0,1.3]}},{"time":14,"note":"3번째 후렴 강조 · 제자리 발 구르기","members":{"br":[0,0,-6,3,8,-35,100,90,-16,13,0,0,1.3],"gr":[0,0,-6,3,12,-35,22,90,-16,13,0,0,1.3],"yj":[0,0,-6,3,16,-35,22,90,-16,13,0,0,1.3]}},{"time":14.5,"note":"3번째 후렴 강조 · 다음 강조로 연결","members":{"br":[0,5,6,-3,46,-65,100,90,16,-13,0,0,1.3],"gr":[0,5,6,-3,50,-65,22,90,16,-13,0,0,1.3],"yj":[0,5,6,-3,54,-65,22,90,16,-13,0,0,1.3]}},{"time":15,"note":"4번째 후렴 강조 · 준비 반동","members":{"br":[0,0,-6,3,16,-65,100,90,-16,13,0,0,1.3],"gr":[0,0,-6,3,20,-65,22,90,-16,13,0,0,1.3],"yj":[0,0,-6,3,24,-65,22,90,-16,13,0,0,1.3]}},{"time":15.5,"note":"4번째 후렴 강조 · 팔 올리기","members":{"br":[0,5,6,-3,91,-45,100,90,16,-13,0,0,1.3],"gr":[0,5,6,-3,95,-45,22,90,16,-13,0,0,1.3],"yj":[0,5,6,-3,99,-45,22,90,16,-13,0,0,1.3]}},{"time":16,"note":"4번째 후렴 강조 · 머리 위 큰 팔선","members":{"br":[0,0,-6,3,154,-25,100,90,-16,13,0,0,1.3],"gr":[0,0,-6,3,158,-25,22,90,-16,13,0,0,1.3],"yj":[0,0,-6,3,162,-25,22,90,-16,13,0,0,1.3]}},{"time":16.5,"note":"4번째 후렴 강조 · 머리 옆 접기","members":{"br":[0,5,6,-3,119,-75,100,90,16,-13,0,0,1.3],"gr":[0,5,6,-3,123,-75,22,90,16,-13,0,0,1.3],"yj":[0,5,6,-3,127,-75,22,90,16,-13,0,0,1.3]}},{"time":17,"note":"4번째 후렴 강조 · 위로 한 번 더","members":{"br":[0,0,-6,3,161,-15,100,90,-16,13,0,0,1.3],"gr":[0,0,-6,3,165,-15,22,90,-16,13,0,0,1.3],"yj":[0,0,-6,3,169,-15,22,90,-16,13,0,0,1.3]}},{"time":17.5,"note":"4번째 후렴 강조 · 옆으로 크게 펼치기","members":{"br":[0,5,6,-3,88,-12,100,90,16,-13,0,0,1.3],"gr":[0,5,6,-3,92,-12,-65,25,16,-13,0,0,1.3],"yj":[0,5,6,-3,96,-12,-65,25,16,-13,0,0,1.3]}},{"time":18,"note":"4번째 후렴 강조 · 관자놀이 손짓","members":{"br":[0,0,-6,3,106,-110,100,90,-16,13,0,0,1.3],"gr":[0,0,-6,3,110,-110,22,90,-16,13,0,0,1.3],"yj":[0,0,-6,3,114,-110,22,90,-16,13,0,0,1.3]}},{"time":18.5,"note":"4번째 후렴 강조 · 앞으로 펼치기","members":{"br":[0,5,6,-3,61,-45,100,90,16,-13,0,0,1.3],"gr":[0,5,6,-3,65,-45,22,90,16,-13,0,0,1.3],"yj":[0,5,6,-3,69,-45,22,90,16,-13,0,0,1.3]}},{"time":19,"note":"4번째 후렴 강조 · 제자리 발 구르기","members":{"br":[0,0,-6,3,8,-35,100,90,-16,13,0,0,1.3],"gr":[0,0,-6,3,12,-35,22,90,-16,13,0,0,1.3],"yj":[0,0,-6,3,16,-35,22,90,-16,13,0,0,1.3]}},{"time":19.5,"note":"4번째 후렴 강조 · 다음 강조로 연결","members":{"br":[0,5,6,-3,46,-65,100,90,16,-13,0,0,1.3],"gr":[0,5,6,-3,50,-65,22,90,16,-13,0,0,1.3],"yj":[0,5,6,-3,54,-65,22,90,16,-13,0,0,1.3]}},{"time":20,"note":"마지막 반동을 풀며 다음 무대로 연결","members":{"br":[0,0,-4,3,20,-65,100,90,-14,11,0,0,1.3],"gr":[0,0,-4,3,20,-65,22,90,-14,11,0,0,1.3],"yj":[0,0,-4,3,20,-65,22,90,-14,11,0,0,1.3]}}]}};
},
"src/shared/our-stage-motion-channels.js":function(module,exports,__require){
'use strict';
// Same rig channels for CSS previews and the continuously blended concert player.
const rot=n=>`rotate(${n}deg)`,scaled=n=>`rotate(calc(${n}deg * var(--motion)))`;
// The rig's screen-left arm is the singer's right arm. When it lifts outwards,
// its forearm must fold in the opposite direction from the low chest gesture.
// Mirror this for the other arm, preserving the inward microphone hold.
const elbow=(shoulder,bend,side)=>{
 const lift=Math.max(0,Math.min(1,(side*shoulder-25)/35));
 return Math.round((bend+(side*Math.abs(bend)-bend)*lift)*1000)/1000;
};
module.exports={
 '':v=>`translate(calc(${v[0]}px * var(--motion)),${v[1]}px) ${scaled(v[2])}`,
 ' .sprite-hair':v=>scaled(v[3]),
 ' .scent-free-arm':v=>rot(v[4])+` scaleY(${v[12]||1})`,' .scent-elbow-left':v=>rot(elbow(v[4],v[5],1)),
 ' .scent-singing-arm':v=>rot(v[6]),' .scent-elbow-right':v=>rot(elbow(v[6],v[7],-1)),
 ' .scent-leg-left':v=>scaled(v[8]),' .scent-leg-right':v=>scaled(v[9]),
 ' .scent-facing-body':v=>`skewY(${Math.sin((v[10]||0)*Math.PI/180)*4}deg) scaleX(${1-Math.abs(Math.sin((v[10]||0)*Math.PI/180))*.28})`,
 ' .scent-step-left':v=>`translate(${v[11]||0}px,${(v[11]||0)>0?-5:0}px)`,
 ' .scent-step-right':v=>`translate(${-(v[11]||0)}px,${(v[11]||0)<0?-5:0}px)`
};

},
"src/client/our-stage-concert-coins.js":function(module,exports,__require){
'use strict';
// One ephemeral show session. The existing save/lock path owns wallet updates.
module.exports=function({root,award,allowed,remaining=()=>Infinity,dailyLimit=30,now=()=>performance.now(),random=Math.random,setTimer=setTimeout,clearTimer=clearTimeout}){
 const limit=12,lifetime=3500,places=[[10,20],[30,13],[50,16],[72,13],[90,20],[10,51],[90,51],[20,70],[80,70]];
 let total=0,spawned=0,serial=0,stage=null,layer=null,active=null,task=null,end=0,pausedAt=null,lastPlace=-1;
 const $=q=>root.querySelector(q);
 function cancel(){if(task)clearTimer(task.id);task=null;}
 function later(fn,ms){cancel();task={fn,due:now()+ms,id:setTimer(()=>{task=null;fn();},ms)};}
 function clearStage(){cancel();layer?.remove();layer=null;stage=null;active=null;pausedAt=null;}
 function begin(){clearStage();total=0;spawned=0;serial++;lastPlace=-1;}
 function dailyText(){const left=Math.max(0,Math.min(dailyLimit,remaining()));return '오늘 모은 코인 '+(dailyLimit-left)+' / '+dailyLimit+'개 · 더 얻을 수 있는 코인 '+left+'개'+(left===0?' — 오늘 코인을 전부 모았어요! 내일 다시 만나요.':'');}
 function dailyMarkup(){const left=Math.max(0,Math.min(dailyLimit,remaining()));return '<span>오늘 모음 <b>'+(dailyLimit-left)+' / '+dailyLimit+'코인</b></span><span>추가 획득 가능 <b>'+left+'코인</b></span>'+(left===0?'<strong class="concert-coin-complete">오늘 코인을 전부 모았어요!<br>내일 다시 만나요.</strong>':'');}
 function update(){const n=$('#concertCoinCount');if(n)n.textContent=String(total);const d=$('#concertCoinDaily');if(d)d.innerHTML=dailyMarkup();}
 function schedule(delay=1300+random()*1900){if(!stage?.isConnected||spawned>=limit||remaining()<=0||now()+delay+lifetime>end)return;later(spawn,delay);}
 function expire(){active=null;layer?.replaceChildren();schedule();}
 function spawn(){update();if(remaining()<=0||!allowed()||!stage?.isConnected||pausedAt!==null)return;
  let place=Math.floor(random()*places.length);if(place===lastPlace)place=(place+1)%places.length;lastPlace=place;
  const [x,y]=places[place],id=String(++serial);spawned++;
  const coin=document.createElement('button');coin.type='button';coin.className='concert-coin';coin.dataset.action='concert-coin';coin.dataset.value=id;coin.setAttribute('aria-label','보너스 1코인 받기');coin.style.left=x+'%';coin.style.top=y+'%';
  coin.innerHTML='<svg viewBox="0 0 24 24" aria-hidden="true" shape-rendering="crispEdges"><path fill="#794a26" d="M6 1h12v3h3v3h2v11h-3v3H5v-3H2V6h4z"/><path fill="#f5bc48" d="M7 3h10v2h3v13h-3v2H7v-2H4V6h3z"/><path fill="#ffed9c" d="M7 5h10v2H7zM6 7h2v9H6z"/><path fill="#b7742d" d="M11 7h3v10h-3v-7H9V8h2z"/></svg>';
  layer.replaceChildren(coin);active={id,coin,expires:now()+lifetime};later(expire,lifetime);
 }
 function mount(target,duration,entrance=0){clearStage();stage=target;end=now()+duration;if(!stage)return;
  layer=document.createElement('div');layer.className='concert-coin-layer';stage.append(layer);update();
  schedule(entrance+(duration-entrance<=4000?300+random()*150:650+random()*650));
 }
 function claim(id){if(!active||active.id!==id||pausedAt!==null||!allowed()||!stage?.isConnected||now()>=active.expires)return false;
  const coin=active.coin;active=null;cancel();coin.disabled=true;
  // Consume before saving: repeated taps and a delayed queued click cannot pay twice.
  if(!award()){layer?.replaceChildren();update();return false;}
  total++;coin.className='concert-coin concert-coin-earned';coin.removeAttribute('data-action');coin.setAttribute('aria-label','1코인을 받았어요');coin.innerHTML='<span>+1</span>';update();
  const status=$('#concertCoinStatus');if(status)status.textContent='1코인을 받았어요. 이번 공연 '+total+'코인. '+dailyText();
  schedule();return true;
 }
 function pause(value){if(value&&pausedAt===null){pausedAt=now();if(task){task.remaining=Math.max(0,task.due-now());clearTimer(task.id);}if(layer)layer.hidden=true;}
  else if(!value&&pausedAt!==null){const elapsed=now()-pausedAt;end+=elapsed;if(active)active.expires+=elapsed;pausedAt=null;if(layer)layer.hidden=false;if(task){const {fn,remaining}=task;later(fn,remaining);}}
 }
 function counter(){return '<p class="concert-coin-counter">이번 공연 <b id="concertCoinCount">'+total+'</b>코인 <small>반짝이는 코인을 누르면 +1</small></p><p id="concertCoinDaily" class="concert-coin-daily">'+dailyMarkup()+'</p><span id="concertCoinStatus" class="concert-accessible-title" role="status"></span>';}
 function summary(){return total?'<p class="concert-coin-result">공연 중 모은 보너스 <strong>'+total+'코인</strong>을 지갑에 담았어요.</p><p class="concert-coin-daily">'+dailyMarkup()+'</p>':'<p class="concert-coin-daily">'+dailyMarkup()+'</p>';}
 return {begin,mount,claim,pause,clearStage,counter,summary};
};

},
"src/client/our-stage-tickets.js":function(module,exports,__require){
'use strict';
const drawTicket=__require("src/client/our-stage-ticket-art.js"),art=__require("src/client/our-stage-keepsake-art.js");
module.exports=function({M,state,root,dialog,button,esc,save,draw,refreshWall}){
 const previews=new Map();
 const albums=[...M.albums,...(M.soloAlbums||[])],album=id=>albums.find(a=>a.id===id),receipt=id=>state().simple.concerts[id]||state().solo?.concerts[id];
 const $=q=>root.querySelector(q);let ticket=null,activeId=null,extra='',sequence=0,mode='ticket',puzzle=null;
 function gallery(){const s=state();return `<div class="ticket-gallery" aria-label="앨범 기념 티켓 모음">${albums.map(a=>{const owned=!!receipt(a.id);return `<button class="ticket-collectible ${owned?'is-earned':'is-unearned'}" data-action="ticket-open" data-value="${a.id}" aria-label="${esc(a.name)} · ${owned?'기념 티켓 보기':'콘서트 완료 후 획득'}" ${owned?'':'disabled'}><span class="ticket-thumbnail" data-ticket-preview="${a.id}"><span>티켓 불러오는 중…</span></span><strong>${esc(a.name)}</strong><small>${owned?'획득 완료':'콘서트 완료 후 획득'}</small></button>`;}).join('')}</div>`;}
 async function refreshGallery(){const s=state();await Promise.all(albums.map(async(a,index)=>{const el=root.querySelector(`[data-ticket-preview="${a.id}"]`);if(!el)return;const record=receipt(a.id),nickname=s.simple.nickname,key=JSON.stringify([nickname,record||null]);let cached=previews.get(a.id);if(!cached||cached.key!==key){cached={key,promise:drawTicket({album:a,index,receipt:record,nickname}).then(c=>c.toDataURL('image/png'))};previews.set(a.id,cached);}try{const url=await cached.promise;if(!el.isConnected||previews.get(a.id)!==cached)return;const img=new Image();img.alt=a.name+' 기념 티켓';img.src=url;el.replaceChildren(img);}catch{previews.delete(a.id);if(el.isConnected)el.textContent='티켓 미리보기를 불러오지 못했어요.';}}));}
 async function render(name){const s=state(),target=$('#ticketCanvasSlot'),version=++sequence;if(!target)return;
 const preview=target.querySelector('.stage-ticket-preview');
 if(!preview){ticket=null;target.innerHTML='<p role="status">기념 이미지를 만들고 있어요…</p>';}
 try{const a=album(activeId),c=mode==='pass'?await art.drawPass({nickname:name??s.simple.nickname,issuedAt:s.simple.passIssuedAt}):await drawTicket({album:a,index:albums.indexOf(a),receipt:receipt(activeId),nickname:s.simple.nickname});
 const url=c.toDataURL('image/png'),blob=await new Promise(resolve=>c.toBlob(resolve,'image/png'));if(!blob)throw Error('PNG');
 // Decode offscreen while the previous pass stays visible, including its download controls.
 const ready=new Image();ready.src=url;await ready.decode();
 if(!target.isConnected||version!==sequence)return;
 ticket={url,blob,name:mode==='pass'?'seeya-artist-pass.png':'seeya-'+activeId+'-ticket.png'};
 if(preview){preview.src=url;return;}
 target.innerHTML=`<img class="stage-ticket-preview ${mode==='pass'?'artist-pass-preview':''}" src="${url}" alt="${mode==='pass'?'씨야 아티스트 패스':esc(a.name)+' 앨범 기념 티켓'}"><div class="growth-actions">${button('PNG 저장','ticket-download','','primary')}${button('공유하기','ticket-share')}</div><p class="private-note">휴대폰에서는 이미지를 길게 눌러 저장할 수 있어요.</p><p id="ticketMessage" role="status"></p>`;
 }catch{if(target.isConnected&&version===sequence){if(preview){const status=$('#passNameStatus')||$('#ticketMessage');if(status)status.textContent='이름은 저장됐지만 이미지 갱신에 실패했어요. 다시 저장해 주세요.';}else target.innerHTML='<p role="status">이미지를 불러오지 못했어요.</p>'+button('다시 불러오기','ticket-refresh');}}}
 function show(id,footer=''){if(!receipt(id))return;mode='ticket';activeId=id;extra=footer;puzzle=null;
 dialog(`<small class="eyebrow">CURTAIN CALL · CHAPTER TICKET</small><h2>우리의 무대를 간직해요</h2><div id="ticketCanvasSlot"></div><div class="ticket-extras">${button(receipt(id).restored?'그림 다시 맞추기':'티켓 그림 맞추기 · 선택','ticket-puzzle',id)}${receipt(id).restored?'<span class="restored-seal">✦ 그림 복원 완료</span>':''}${button('패스에서 이름 바꾸기','pass-open')}</div>${footer}`);return render();}
 function showPass(footer=''){if(!state().simple.debuted)return;mode='pass';extra=footer;puzzle=null;
 dialog(`<small class="eyebrow">OUR STAGE · ARTIST PASS</small><h2>${footer?'첫 무대, 우리의 시작':'나의 아티스트 패스'}</h2><p>세 목소리와 함께한 여정에 이름을 남겨주세요.</p><label class="ticket-name">함께한 팬<input id="passNickname" maxlength="24" value="${esc(state().simple.nickname)}" placeholder="익명의 씨야 팬"></label>${button('이름 저장','pass-name-save')}<span id="passNameStatus" role="status"></span><div id="ticketCanvasSlot"></div>${footer}`);
 return render();}
 async function openPuzzle(id){if(!receipt(id))return;const footer=extra;dialog('<h2>티켓 그림 맞추기</h2><p id="puzzleLoading">그림을 불러오고 있어요…</p>');const loading=$('#puzzleLoading');const version=++sequence;const c=await art.panel(id);if(version!==sequence||!loading.isConnected||!$('#stageModal').open)return;const perm=[0,1,2,3,4,5,6,7,8];for(let i=8;i>0;i--){const j=Math.floor(Math.random()*(i+1));[perm[i],perm[j]]=[perm[j],perm[i]];}while(perm.filter((v,i)=>v===i).length>3)perm.push(perm.shift());puzzle={id,perm,selected:null,url:c.toDataURL(),footer};renderPuzzle();}
 function renderPuzzle(){const p=puzzle;if(!p)return;const done=p.perm.every((v,i)=>v===i),count=p.perm.filter((v,i)=>v===i).length;
 dialog(`<small class="eyebrow">A PIECE OF OUR STAGE · 선택</small><h2>${done?'한 장의 기억이 완성됐어요':'티켓 그림 맞추기'}</h2><p>조각 두 개를 차례로 누르면 자리가 바뀝니다.</p><div class="ticket-puzzle" aria-label="티켓 그림 9조각">${p.perm.map((v,i)=>`<button data-action="ticket-piece" data-value="${i}" aria-label="${i+1}번 자리 · 그림 ${v+1}번 조각${v===i?' · 맞는 자리':''}" aria-pressed="${p.selected===i}" ${done?'disabled':''} style="background-image:url('${p.url}');background-position:${v%3*50}% ${Math.floor(v/3)*50}%"><span>${i+1}</span></button>`).join('')}</div><p role="status">${done?'✦ 그림 복원 완료':count+' / 9조각이 제자리에 있어요.'}</p><details class="puzzle-guide"><summary>완성 그림 보기</summary><img src="${p.url}" alt="맞출 그림 전체"></details><div class="growth-actions">${button(done?'기념 티켓 보기':'나중에 하고 티켓 보기','ticket-puzzle-back',p.id,'primary')}</div>`);}
 function handle(a,id){if(!a.startsWith('ticket-')&&!a.startsWith('pass-'))return false;
 if(a==='ticket-open')return show(id)||true;if(a==='pass-open')return showPass()||true;
 if(a==='pass-name-save'){state().simple.nickname=$('#passNickname').value.trim().slice(0,24);state().simple.nicknameSet=true;if(save()){$('#passNameStatus').textContent='이름을 저장했어요.';refreshWall?.();refreshGallery();return render();}return true;}
 if(a==='ticket-refresh')return render();if(a==='ticket-puzzle')return openPuzzle(id);
 if(a==='ticket-puzzle-back'){const footer=puzzle?.footer||'';puzzle=null;return show(id,footer);}
 if(a==='ticket-piece'&&puzzle){const i=Number(id);if(!Number.isInteger(i)||i<0||i>8)return true;const p=puzzle;if(p.selected===i)p.selected=null;else if(p.selected===null)p.selected=i;else{[p.perm[i],p.perm[p.selected]]=[p.perm[p.selected],p.perm[i]];p.selected=null;if(p.perm.every((v,i)=>v===i)&&M.restoreTicket(state(),p.id,p.perm)){save();draw?.();}}renderPuzzle();const focus=$(`[data-action="ticket-piece"][data-value="${i}"]`);if(focus&&!focus.disabled)focus.focus();else $('[data-action="ticket-puzzle-back"]')?.focus();return true;}
 if(a==='ticket-download'&&ticket){const link=document.createElement('a');link.href=ticket.url;link.download=ticket.name;link.click();}
 if(a==='ticket-share'&&ticket){const file=new File([ticket.blob],ticket.name,{type:'image/png'});if(navigator.canShare?.({files:[file]}))return navigator.share({files:[file],title:'씨야 키우기 기념 이미지'}).catch(e=>{if(e.name!=='AbortError'&&$('#ticketMessage'))$('#ticketMessage').textContent='PNG 저장이나 이미지 길게 누르기를 이용해 주세요.';});if($('#ticketMessage'))$('#ticketMessage').textContent='PNG 저장이나 이미지 길게 누르기를 이용해 주세요.';}
 return true;
 }
 return {handle,show,showPass,gallery,refreshGallery};
};

},
"src/client/our-stage-stage-shop.js":function(module,exports,__require){
'use strict';
module.exports=function({M,state,button,esc,stageArt,save,draw,say,openShop,focusPreview}){
 const D=M.decorStore,art=__require("src/client/our-stage-decor-art.js");let selected=null,filter='all';
 function panel(){const s=state(),i=D.byId(selected),owned=i&&s.leisure.decor.owned.includes(i.id);
  if(i){const preview={...s.leisure.decor.equipped,[i.slot]:i.id},wearing=s.leisure.decor.equipped[i.slot]===i.id;return `<section class="decor-detail"><div class="action-row">${button('← 무대 상품 목록','decor-list')}</div><small class="eyebrow">${D.slots[i.slot]} · 미리보기</small><h3>${esc(i.name)}</h3>${stageArt(false,false,0,null,'',false,false,preview)}<p>${esc(i.description)}</p><div class="decor-buy-row"><strong>${owned?'보유 중':i.price+'코인'}</strong>${button(owned?(wearing?'사용 중':'무대에 적용'):'구매하고 적용 · '+i.price+'코인',owned?'decor-equip':'decor-buy',i.id,'primary',owned?wearing:M.coins(s)<i.price||!s.simple.debuted)}</div>${!owned&&M.coins(s)<i.price?'<p class="private-note">'+(i.price-M.coins(s))+'코인이 더 필요해요.</p>':''}</section>`;}
  return `<div class="badge-filters decor-filters" aria-label="무대 상품 종류">${[['all','전체'],...Object.entries(D.slots)].map(([id,label])=>button(label,'decor-filter',id,filter===id?'primary':'')).join('')}</div><div class="decor-shop-grid">${D.items.filter(i=>filter==='all'||i.slot===filter).map(i=>`<button class="decor-shop-card" data-action="decor-preview" data-value="${i.id}" aria-label="${esc(i.name)} 미리보기"><div class="decor-shop-art">${art.thumbnail(i.id)}</div><small>${D.slots[i.slot]}</small><strong>${esc(i.name)}</strong><span>${s.leisure.decor.owned.includes(i.id)?'보유 중':i.price+'코인'}</span></button>`).join('')}</div>`;
 }
 function controls(){const s=state();return `<div class="decor-equipped">${Object.entries(D.slots).map(([slot,label])=>`<section><h3>${label}</h3><div class="decor-options">${button(slot==='background'?'기본 무대':'없음','decor-clear',slot,!s.leisure.decor.equipped[slot]&&(slot!=='background'||!s.leisure.skins.stage)?'primary':'')}${D.items.filter(i=>i.slot===slot&&s.leisure.decor.owned.includes(i.id)).map(i=>`<button data-action="decor-equip" data-value="${i.id}" aria-pressed="${s.leisure.decor.equipped[slot]===i.id}">${esc(i.name)}</button>`).join('')}</div></section>`).join('')}</div><div class="growth-actions">${button('코인 상점 둘러보기','decor-shop')}</div>`;}
 function handle(a,v){if(!a.startsWith('decor-'))return false;
  if(a==='decor-shop'){selected=null;openShop();return true;}
  if(a==='decor-preview'){if(D.byId(v)){selected=v;draw();focusPreview?.();}return true;}
  if(a==='decor-list'){selected=null;draw();return true;}
  if(a==='decor-filter'){if(v==='all'||Object.hasOwn(D.slots,v)){filter=v;selected=null;draw();}return true;}
  if(a==='decor-buy'){if(M.buyDecor(state(),v)){M.equipDecor(state(),v);save();draw();say('구매한 장식을 무대에 적용했어요.');}else{draw();say('보유 코인과 구매 상태를 다시 확인해 주세요.');}return true;}
  if(a==='decor-equip'&&M.equipDecor(state(),v)){save();draw();say('무대 장식을 바꿨어요.');}
  if(a==='decor-clear'&&M.clearDecor(state(),v)){save();draw();say('무대 장식을 정리했어요.');}
  return true;
 }
 return {panel,controls,handle};
};

},
"src/client/our-stage-leisure.js":function(module,exports,__require){
'use strict';
module.exports=function(args){
 const {M,root,state,save,draw,dialog,button,esc,mark,locked,sync,sprite,cardFace,stageArt}=args,G=M.play,C=M.capsules,$=q=>root.querySelector(q);
 const visuals=__require("src/client/our-stage-skins.js");
 const driving=__require("src/client/our-stage-drive.js")(args);
 const legacy=__require("src/client/our-stage-mini-v2.js")(args);let viewing=null,selected=null,targetCard=null,filter='all',capsuleView='home',capsuleValue=null,revealPrize=false;
 const rarity={normal:'일반',rare:'레어',special:'특별'},kindName={frame:'프레임',background:'배경',stage:'무대',outfit:'의상'};
 const machine=()=>`<svg class="capsule-machine-art" viewBox="0 0 120 170" aria-hidden="true" shape-rendering="crispEdges"><path fill="#352d48" d="M20 0h80v8h12v96h-8v58H16v-58H8V8h12z"/><path fill="#bb789c" d="M20 8h80v8h4v84H16V16h4zM24 106h72v48H24z"/><path fill="#fae9e9" d="M24 20h72v66H24z"/><path fill="#c3b8e2" d="M28 24h64v56H28z"/><path fill="#fff8e8" d="M28 24h8v48h-8z"/><g stroke="#554664" stroke-width="3"><circle cx="43" cy="66" r="11" fill="#edc58d"/><circle cx="68" cy="66" r="11" fill="#ecc0d5"/><circle cx="80" cy="48" r="10" fill="#b8dbcf"/><circle cx="53" cy="43" r="11" fill="#fff1cf"/></g><path stroke="#554664" stroke-width="2" d="M32 66h22m3 0h22m-9-18h20M42 43h22"/><path fill="#f8dfb2" d="M28 90h64v8H28zM53 113h14v20H53z"/><path fill="#fff7e5" d="M43 118h34v7H43z"/><path fill="#382f4b" d="M38 139h44v15H38z"/><path fill="#f0c1d6" d="M45 144h30v8H45z"/><path fill="#6f5477" d="M18 162h24v8H18zm60 0h24v8H78z"/></svg>`;
 function machineButton(){return `<button class="room-capsule ${M.capsuleUnlocked(state())?'':'is-locked'}" data-action="capsule-open" aria-label="캡슐 뽑기 ${M.capsuleUnlocked(state())?'열기':'· 첫 앨범 콘서트 후 해금'}">${machine()}<span>${M.capsuleUnlocked(state())?'캡슐 뽑기':'콘서트 후 오픈'}</span></button>`;}
 function room(){const s=state(),m=s.leisure.play;return `<section class="mini-lobby"><div class="line"><div>${mark('PLAY BREAK')}<h3>미니게임</h3></div><strong>오늘 ${Math.max(0,6-G.used(m,Date.now()))} / 6회 남음</strong></div><div class="leisure-game-grid">${G.games.map(g=>`<article class="mini-game-card"><span class="leisure-icon" aria-hidden="true">${g.icon}</span><h4>${g.name}</h4><p>${g.description}</p><small>${g.detail}</small>${button('도전하기','leisure-start',g.id,'primary',!G.canStart(s,g.id,Date.now()))}<p data-leisure-wait="${g.id}" role="status"></p></article>`).join('')}</div>${m.active?'<div class="mini-resume"><p>지난 도전을 이어서 할 수 있어요.</p>'+button('이어 하기','leisure-resume')+button('이번 도전 그만하기','leisure-abandon')+'</div>':''}${s.mini.active?'<p>업데이트 전에 시작한 게임이 있어요.</p>'+button('이전 도전 이어 하기','mini-resume')+button('이전 도전 그만하기','mini-abandon'):''}<p class="private-note">세 게임 합산 하루 6회 · 같은 게임 재도전 ${M.timing.testMode?'10초 (테스트)':'15분'}</p><div class="leisure-game-grid drive-lobby-grid">${driving.lobby()}</div><div class="capsule-lobby-link"><div><h4>모은 코인으로 나만의 무대</h4><p>의상·카드·무대를 꾸미는 ${C.pool.length}가지 캡슐.</p></div>${button('캡슐 뽑기','capsule-open','','primary')}</div></section>`;}
 function quiz(){const a=state().leisure.play.active,q=G.question(a);if(!q){result();return;}viewing=a.id;const item=a.questions[a.answers.length];dialog(`${mark('SEEYA QUIZ')}<h2>씨야 활동 퀴즈</h2><p>${a.answers.length+1} / 3 · 모두 맞히면 20코인</p><h3 class="mini-question">${esc(q.question)}</h3><div class="quiz-options">${item.order.map((n,i)=>button(esc(q.choices[n]),'leisure-answer',a.answers.length+':'+i)).join('')}</div>`);}
 const cardInfo=id=>G.cardPool(state()).find(c=>c.id===id);
 function face(id){const c=cardInfo(id);return `<div class="leisure-pair-portrait">${__require("src/client/our-stage-style-tile.js")(c)}</div><b>${esc(M.cardMembers.find(m=>m.id===c.member).name)}</b><small>${esc(c.label)} · ${c.part==='clothes'?'의상':'헤어'}</small>`;}
 function pairBoard(){const a=state().leisure.play.active,p=G.progress(a);return `<p class="pairs-score" role="status">${p.pairs} / 8쌍 · ${p.turns}턴 · 화음 콤보 ${p.combo}</p><div class="pairs-grid">${a.deck.map((id,i)=>{const up=p.matched.has(i)||a.open===i||a.reveal?.includes(i);return `<button class="pair-card ${up?'is-up':''} ${p.matched.has(i)?'is-matched':''}" data-action="leisure-flip" data-value="${i}" aria-label="${i+1}번째 카드${up?' · '+esc(M.cardMembers.find(m=>m.id===cardInfo(id).member).name)+' '+esc(cardInfo(id).label):' · 뒤집기'}" aria-pressed="${!!up}" ${p.matched.has(i)||p.done?'disabled':''}><span class="pair-inner"><span class="pair-back" aria-hidden="true"><b>SEEYA</b><small>OUR STAGE</small></span><span class="pair-face" aria-hidden="true">${up?face(id):''}</span></span></button>`;}).join('')}</div>${p.done?button('보상 받기','leisure-result',a.id,'primary'):''}`;}
 function pairs(){const a=state().leisure.play.active;viewing=a.id;G.settle(state().leisure.play,Date.now());dialog(`${mark('STYLE MATCH')}<h2>멤버 스타일 짝 맞추기</h2><p>같은 헤어·같은 의상의 카드 두 장을 찾아요.</p><div id="leisurePairs">${pairBoard()}</div><details><summary>보상 안내</summary><p>찾은 쌍과 연속 매칭에 따라 최대 20코인. 8턴 완성에는 보너스가 포함돼요.</p></details>`);}
 function refreshPairs(){const box=$('#leisurePairs'),a=state().leisure.play.active;if(!box||a?.id!==viewing)return;const p=G.progress(a);box.querySelector('.pairs-score').textContent=`${p.pairs} / 8쌍 · ${p.turns}턴 · 화음 콤보 ${p.combo}`;box.querySelectorAll('.pair-card').forEach((el,i)=>{const up=p.matched.has(i)||a.open===i||a.reveal?.includes(i);if(up&&!el.querySelector('.pair-face').innerHTML)el.querySelector('.pair-face').innerHTML=face(a.deck[i]);el.classList.toggle('is-up',!!up);el.classList.toggle('is-matched',p.matched.has(i));el.setAttribute('aria-pressed',String(!!up));el.setAttribute('aria-label',`${i+1}번째 카드${up?' · '+M.cardMembers.find(m=>m.id===cardInfo(a.deck[i]).member).name+' '+cardInfo(a.deck[i]).label:' · 뒤집기'}`);el.disabled=p.matched.has(i)||p.done;});if(p.done&&!box.querySelector('[data-action="leisure-result"]'))box.insertAdjacentHTML('beforeend',button('보상 받기','leisure-result',a.id,'primary'));}
 function jigBoard(){const a=state().leisure.play.active,e=M.storyById(a.story),done=a.perm.every((n,i)=>n===i);return `<p role="status">${a.swaps}번 교환 · ${done?'그림을 완성했어요!':selected===null?'조각 하나를 골라 주세요.':'바꿀 조각을 골라 주세요.'}</p><div class="leisure-jigsaw" style="--puzzle-image:url('${e.image}')">${a.perm.map((n,i)=>`<button class="${selected===i?'selected':''}" data-action="leisure-swap" data-value="${i}" style="background-position:${n%4*100/3}% ${Math.floor(n/4)*100/3}%" aria-label="${i+1}번째 자리, 원래 ${n+1}번 조각" aria-pressed="${selected===i}" ${done?'disabled':''}></button>`).join('')}</div>${done?button('보상 받기','leisure-result',a.id,'primary'):''}`;}
 function jigsaw(){const a=state().leisure.play.active,e=M.storyById(a.story);viewing=a.id;selected=null;dialog(`${mark('MEMORY PUZZLE')}<h2>이야기 그림 맞추기</h2><p>${esc(e.title)}</p><div id="leisureJigsaw">${jigBoard()}</div><details class="jigsaw-reference"><summary>완성 그림 보기</summary><img src="${e.image}" alt="${esc(e.title)} 완성 그림"></details><small>24번 이내 20코인 · 36번 이내 15코인 · 이후 10코인</small>`);}
 function resume(){const a=state().leisure.play.active;if(!a)return;({quiz,pairs,jigsaw}[a.kind])();}
 function result(){const r=G.finish(state().leisure.play,viewing);if(!r)return;save();draw();dialog(`${mark('PLAY COMPLETE')}<h2>${r.kind==='jigsaw'?'추억 한 장을 완성했어요':r.correct===r.total?'완벽한 호흡!':'함께한 만큼, 한 걸음'}</h2>${r.story?`<img class="leisure-result-art" src="${M.storyById(r.story).image}" alt="${esc(M.storyById(r.story).title)}"><p>${esc(M.storyById(r.story).title)}</p>`:`<p>${r.correct} / ${r.total} ${r.kind==='pairs'?'쌍':'정답'}</p>`}<strong class="mini-reward">+${r.reward} 코인</strong><div class="leisure-actions">${button('캡슐 뽑기','capsule-open','','primary')}${button('놀이로 돌아가기','leisure-close')}</div>`);viewing=null;}
 function outfitPreview(item){const o=M.capsuleOutfits.find(o=>o.reward===item.id);return `<span class="capsule-outfit-trio${o.members.length===1?' solo':''}" aria-hidden="true">${o.members.map(m=>sprite(m,o)).join('')}</span>`;}
 function swatch(item){if(item.kind==='outfit')return outfitPreview(item);if(item.kind==='stage')return `<span class="skin-stage-sample stage-art" ${visuals.stageAttributes(item)} aria-hidden="true"><span class="stage-set">${visuals.stageSet()}</span></span>`;
 const slots={[item.kind]:item.id};return `<span class="skin-card-sample pixel-collectible" ${visuals.attributes(slots)} aria-hidden="true">${visuals.frame(slots.frame)}<span class="collectible-top"><span class="card-brand"><img src="/images/game/our-stage/card-logo.svg" alt=""><span>archive</span></span></span><span class="collectible-art">${sprite('gr',{id:'practice',name:'연습복'})}</span><strong>SEEYA</strong></span>`;}
 const outfitFor=i=>M.capsuleOutfits.find(o=>o.reward===i.id);
 const memberNames=o=>o.members.map(id=>M.members.find(m=>m.id===id).name).join('·');
 const contents=o=>(o.members.length===3?'3인 세트':memberNames(o)+' 전용')+' · 의상 + '+o.headKind;
 const outfitDetails=i=>{const o=outfitFor(i);return o?`<p class="capsule-outfit-meta">${esc(o.sourceLabel)}<br>${esc(contents(o))}</p><a class="capsule-source" href="${esc(o.url)}" target="_blank" rel="noopener">참고한 무대·작품 ↗</a><details class="capsule-costume-note"><summary>의상 참고 안내</summary><p>${esc(o.note)}</p></details>`:'';};
 const wearLabel=o=>o.members.length===3?'세 멤버 함께 입기':memberNames(o)+'에게 입히기';
 const useLabel=i=>i.kind==='stage'?'무대에 쓰기':i.kind==='outfit'?wearLabel(outfitFor(i)):'카드에 입히기';
 function wardrobe(){const owned=M.capsuleOutfits.filter(o=>state().leisure.capsules.owned.includes(o.reward));return `<section class="capsule-wardrobe"><h3>뽑기 전용 의상</h3><div class="outfit-grid">${owned.map(o=>`<article class="capsule-outfit-card">${outfitPreview(C.byId(o.reward))}<h4>${esc(o.name)}</h4>${button('상세 보기','capsule-detail',o.reward)}</article>`).join('')||'<p>아직 뽑은 의상이 없어요.</p>'}</div>${button('뽑기 의상 보기','capsule-filter','outfit')}</section>`;}
 function capsuleHome(){const s=state(),g=s.leisure.capsules,open=M.capsuleUnlocked(s),today=C.day(Date.now()),free=g.freeDay!==today,backwards=g.day&&today<g.day;return `${mark('CAPSULE COLLECTION')}<h2>작은 캡슐, 우리의 무대</h2><div class="capsule-wallet"><b>${M.coins(s)} 코인</b><span>교환권 ${g.tickets}장</span><span>${g.owned.length} / ${C.pool.length}종</span></div><div class="capsule-machine ${open?'':'covered'}">${machine()}</div><div class="capsule-main-action">${button(!open?'첫 앨범 콘서트 후 오픈':free?'오늘의 무료 뽑기':'손잡이 돌리기 · 30코인','capsule-pull',String(g.pulls),'primary',!open||backwards||!free&&M.coins(s)<30)}</div><p class="capsule-note">${!open?'The First Mind 콘서트를 마치면 기계가 열려요.':backwards?'기기 날짜를 확인해 주세요.':free?'오늘의 무료 캡슐이 기다리고 있어요.':'무료 캡슐은 한국 시간 자정에 다시 열려요.'}</p><div class="leisure-actions capsule-menu">${button('뽑기 도감 · 교환소','capsule-collection')}${button('뽑기 전용 의상','capsule-filter','outfit')}${button('카드 꾸미기','capsule-editor')}${button('무대 꾸미기','capsule-stage')}</div><details class="capsule-rules"><summary>확률과 보장 · 중복 안내</summary><p>일반 70% · 레어 25% · 특별 5%<br>등급 전체의 확률이며, 개별 의상의 확률은 아닙니다.<br>레어 이상은 늦어도 10번째, 특별은 늦어도 30번째에 나와요. 보장 회차에는 확률이 달라집니다.</p><p>특별 보장까지 ${30-g.specialMiss}회 · 레어 이상 보장까지 ${10-g.rareMiss}회<br>10회 보장에서는 레어 95%·특별 5%, 30회 보장에서는 특별 100%입니다.</p><p>같은 등급 안에서 미보유 아이템을 먼저 뽑아요. 모두 모았다면 중복이 나올 수 있어요.<br>중복은 일반 1장·레어 2장·특별 3장의 교환권으로 바뀝니다. 무료도 보장 횟수에 포함돼요.</p><p>게임 코인만 사용해요. 앨범·이야기 보상은 뽑기에 포함되지 않습니다.<br>전용 의상은 뽑기로만 얻으며 상점 판매·교환은 하지 않아요.</p></details>${g.last?button('마지막 캡슐 보기','capsule-last'):''}`;}
 function capsuleResult(animate=false){const s=state(),g=s.leisure.capsules,r=g.last;if(!r)return capsuleHome();const item=C.byId(r.item),today=C.day(Date.now()),free=g.freeDay!==today,disabled=!M.capsuleUnlocked(s)||!!(g.day&&today<g.day)||!free&&M.coins(s)<C.price;return `<div class="capsule-result ${animate?'is-revealing':''}">${mark('CAPSULE · '+rarity[item.rarity])}<div class="capsule-pop" aria-hidden="true">✦</div><div class="capsule-prize">${swatch(item)}<h2>${esc(item.name)}</h2>${outfitDetails(item)}<p>${kindName[item.kind]} · ${r.duplicate?'이미 있어요 · 교환권 +'+C.refund[item.rarity]:'새로운 꾸미기 아이템을 얻었어요!'}</p><p class="capsule-note">보유 ${M.coins(s)}코인 · ${free?'오늘의 무료 뽑기 가능':'다시 뽑으면 30코인이 사용돼요.'}</p><div class="leisure-actions capsule-menu">${button(useLabel(item),'capsule-use',item.id,'primary')}${button(free?'다시 뽑기 · 무료':'다시 뽑기 · '+C.price+'코인','capsule-pull',String(g.pulls),'',disabled)}${button('뽑기 화면으로','capsule-open')}${button('도감 보기','capsule-collection')}</div></div></div>`;}
 function collection(){const s=state(),g=s.leisure.capsules;return `${mark('COLLECTION & EXCHANGE')}<h2>나만의 꾸미기 도감</h2><p>${g.owned.length} / ${C.pool.length}종 · 교환권 ${g.tickets}장</p><div class="badge-filters">${[['all','전체'],...Object.entries(kindName)].map(([id,n])=>button(n,'capsule-filter',id,filter===id?'primary':'')).join('')}</div><div class="capsule-collection">${C.pool.filter(i=>filter==='all'||i.kind===filter).map(i=>`<button class="capsule-item capsule-catalog-card" data-action="capsule-detail" data-value="${i.id}" aria-label="${esc(i.name)} · ${rarity[i.rarity]} · 상세 보기"><span class="capsule-catalog-art">${swatch(i)}</span><span class="capsule-catalog-name">${esc(i.name)}</span><span class="capsule-catalog-rarity" data-rarity="${i.rarity}">${rarity[i.rarity]}</span></button>`).join('')}</div>${button('기계로 돌아가기','capsule-open')}`;}
 function itemDetail(i){
  const s=state(),g=s.leisure.capsules,owned=g.owned.includes(i.id);
  const description={frame:'카드의 테두리와 장식을 바꿀 수 있어요.',background:'카드의 배경을 바꿀 수 있어요.',stage:'콘서트 무대의 색과 배경 연출을 바꿀 수 있어요.',outfit:'획득한 의상은 내 옷장에서 멤버에게 입힐 수 있어요.'}[i.kind];
  const action=owned?button(useLabel(i),'capsule-use',i.id,'primary'):i.kind==='outfit'?'<p class="capsule-only">뽑기로만 얻을 수 있는 의상이에요.</p>':`<p>교환권 ${g.tickets}장 보유 · ${C.cost[i.rarity]}장으로 교환</p>${button('교환 · '+C.cost[i.rarity]+'장','capsule-exchange-confirm',i.id,'primary',g.tickets<C.cost[i.rarity]||!M.capsuleUnlocked(s))}`;
  return `${mark(rarity[i.rarity]+' · '+kindName[i.kind])}<h2>${esc(i.name)}</h2>${swatch(i)}<p>${owned?'보유 중':'아직 얻지 못한 아이템이에요.'}</p><p>${description}</p>${outfitDetails(i)}<div class="capsule-detail-actions">${action}${button('도감으로','capsule-collection')}</div>`;
 }
 function editor(cardId){const s=state(),cards=M.memberCards(s).filter(c=>c.earned);targetCard=cards.some(c=>c.id===cardId)?cardId:cards.some(c=>c.id===targetCard)?targetCard:s.displayCard||cards[0]?.id;if(!targetCard)return '<h2>첫 카드를 기다려요</h2><p>앨범을 해금해 멤버 카드를 먼저 모아 주세요.</p>';const c=cards.find(c=>c.id===targetCard),slots=s.leisure.skins.cards[targetCard]||{};return `${mark('CARD STUDIO')}<h2>나만의 카드 꾸미기</h2><label class="skin-card-select">꾸밀 카드<select id="skinCard">${cards.map(c=>`<option value="${c.id}" ${c.id===targetCard?'selected':''}>${M.cardMembers.find(m=>m.id===c.member).name} · ${esc(c.title)}</option>`).join('')}</select></label><div class="skin-card-preview">${cardFace(c)}</div>${['frame','background'].map(kind=>`<section class="skin-slot"><h3>${kindName[kind]}</h3><div class="skin-options">${button('기본','capsule-clear',kind+'|'+targetCard,slots[kind]?'':'primary')}${C.pool.filter(i=>i.kind===kind&&s.leisure.capsules.owned.includes(i.id)).map(i=>`<button data-action="capsule-apply" data-value="${i.id}|${targetCard}" aria-pressed="${slots[kind]===i.id}">${swatch(i)}<span>${esc(i.name)}</span></button>`).join('')}</div></section>`).join('')}<p class="private-note">이 카드의 카드북·상세 화면·연습실 전시에 함께 적용돼요.</p>${button('뽑기로 돌아가기','capsule-open')}`;}
 function stagePanel(){const s=state(),items=C.pool.filter(i=>i.kind==='stage'&&s.leisure.capsules.owned.includes(i.id));return `${mark('STAGE STUDIO')}<h2>우리의 무대 꾸미기</h2>${stageArt()}${args.stageDecorControls?.()||button('기본 무대','capsule-clear','stage',s.leisure.skins.stage?'':'primary')}${items.length?'<h3>뽑기 배경</h3>':''}<div class="skin-options">${items.map(i=>`<button data-action="capsule-apply" data-value="${i.id}|stage" aria-pressed="${s.leisure.skins.stage===i.id}">${swatch(i)}<span>${esc(i.name)}</span></button>`).join('')}</div>`; }
 function showCapsule(view='home',value=null,reveal=false,focus=true){capsuleView=view;capsuleValue=value;revealPrize=reveal;args.openCapsulePage(focus);}
 function capsulePanel(){
  const s=state(),i=C.byId(capsuleValue);let content='';
  if(capsuleView==='result'){content=capsuleResult(revealPrize);revealPrize=false;}
  else if(capsuleView==='collection')content=collection();
  else if(capsuleView==='editor')content=editor(capsuleValue);
  else if(capsuleView==='stage')content=stagePanel();
  else if(capsuleView==='detail'&&i)content=itemDetail(i);
  else if(capsuleView==='exchange'&&i)content=`${mark('EXCHANGE')}<h2>${esc(i.name)}</h2>${swatch(i)}<p>교환권 ${C.cost[i.rarity]}장으로 가져올까요?</p>${button('교환하기','capsule-exchange',i.id,'primary')}${button('돌아가기','capsule-collection')}`;
  else if(capsuleView==='exchanged'&&i)content='<h2>'+esc(i.name)+'을 얻었어요</h2>'+swatch(i)+button('바로 꾸미기','capsule-use',i.id,'primary')+button('도감으로','capsule-collection');
  else if(capsuleView==='worn'&&i){const o=outfitFor(i);content='<h2>'+esc(o.members.length===3?'세 멤버가 함께 갈아입었어요':memberNames(o)+'의 스타일을 바꿨어요')+'</h2>'+outfitPreview(i)+'<p>의상과 헤어·가면은 내 옷장에서 따로 바꿀 수 있어요.</p>'+button('내 옷장으로','wardrobe-view','closet','primary');}
  else content=capsuleHome();
  return `<section class="capsule-page" data-capsule-view="${capsuleView}">${capsuleView!=='home'?'<nav class="capsule-page-back" aria-label="뽑기 화면 이동">'+button('← 뽑기로','capsule-open')+'</nav>':''}${content}</section>`;
 }
 function handle(a,v){if(driving.handle(a,v))return true;if(a.startsWith('mini-'))return legacy.handle(a,v);if(!a.startsWith('leisure-')&&!a.startsWith('capsule-'))return false;const s=state(),m=s.leisure.play;
 if(a==='leisure-start'&&G.start(s,v,Date.now())){save();draw();resume();}
 if(a==='leisure-resume')resume();
 if(a==='leisure-answer'){const [n,i]=v.split(':').map(Number),active=m.active,q=G.question(active);if(active?.id===viewing&&active.answers.length===n&&q){const actual=active.questions[n].order[i];if(G.answer(m,viewing,i)){save();dialog(`${mark('SEEYA QUIZ')}<h2>${actual===q.answer?'정답이에요!':'이 순간을 기억해 봐요'}</h2><h3>${esc(q.choices[q.answer])}</h3><p>${esc(q.explanation)}</p>${q.source?`<a href="${esc(q.source)}" target="_blank" rel="noopener">원본 기록 보기 ↗</a>`:''}<div class="leisure-actions">${button(active.answers.length===3?'보상 받기':'다음 문제','leisure-next','','primary')}</div>`);}}}
 if(a==='leisure-next')quiz();
 if(a==='leisure-flip'&&G.flip(m,viewing,Number(v),Date.now())){save();refreshPairs();}
 if(a==='leisure-swap'&&m.active?.id===viewing){const i=Number(v);if(!Number.isInteger(i)||i<0||i>15)return true;if(selected===i)selected=null;else if(selected===null)selected=i;else{if(G.swap(m,viewing,selected,i))save();selected=null;}$('#leisureJigsaw').innerHTML=jigBoard();$('#leisureJigsaw [data-value="'+i+'"]')?.focus();}
 if(a==='leisure-result'&&m.active?.id===v)result();
 if(a==='leisure-abandon'){dialog('<h2>이번 도전을 그만할까요?</h2><p>보상 없이 종료되며 오늘의 횟수는 돌아오지 않아요. 창만 닫으면 나중에 이어 할 수 있어요.</p>'+button('계속하기','leisure-resume')+button('그만하기','leisure-confirm-abandon'));}
 if(a==='leisure-confirm-abandon'){m.active=null;viewing=null;save();draw();$('#stageModal').close();}
 if(a==='leisure-close'){$('#stageModal').close();draw();}
 if(a==='capsule-open')showCapsule();
 if(a==='capsule-last')showCapsule('result');
 if(a==='capsule-pull'&&Number(v)===s.leisure.capsules.pulls){const r=M.pullCapsule(s);if(r){save();showCapsule('result',null,true);}else showCapsule();}
 if(a==='capsule-detail'&&C.byId(v))showCapsule('detail',v);
 if(a==='capsule-collection')showCapsule('collection');
 if(a==='capsule-filter'){filter=v;showCapsule('collection');}
 if(a==='capsule-exchange-confirm'&&C.byId(v))showCapsule('exchange',v);
 if(a==='capsule-exchange'&&M.exchangeCapsule(s,v)){save();showCapsule('exchanged',v);}
 if(a==='capsule-wear'){const o=M.capsuleOutfits.find(o=>o.reward===v);if(o&&s.leisure.capsules.owned.includes(v)){o.members.forEach(m=>M.equip(s,m,o.id));args.clearOutfitPreview?.();save();showCapsule('worn',v);}}
 if(a==='capsule-use'){const i=C.byId(v);if(i&&s.leisure.capsules.owned.includes(v)){if(i.kind==='outfit'){handle('capsule-wear',v);}else if(i.kind==='stage'){M.applySkin(s,v);save();showCapsule('stage');}else{showCapsule('editor');const slot=$('#screen [data-value="'+v+'|'+targetCard+'"]');slot?.focus();}}}
 if(a==='capsule-editor')showCapsule('editor',v||null);
 if(a==='capsule-stage')showCapsule('stage');
 if(a==='capsule-apply'){const [id,card]=v.split('|');if(M.applySkin(s,id,card)){save();C.byId(id).kind==='stage'&&!args.isCapsulePage()?draw():showCapsule(C.byId(id).kind==='stage'?'stage':'editor',card,false,false);}}
 if(a==='capsule-clear'){const [kind,card]=v.split('|');if(M.clearSkin(s,kind,card)){save();kind==='stage'&&!args.isCapsulePage()?draw():showCapsule(kind==='stage'?'stage':'editor',card,false,false);}}
 return true;
 }
 function update(){if(state().mini.active)legacy.update();const s=state(),m=s.leisure.play;for(const g of G.games){const label=$(`[data-leisure-wait="${g.id}"]`),btn=$(`[data-action="leisure-start"][data-value="${g.id}"]`);if(label){const seconds=Math.ceil(G.wait(m,g.id,Date.now())/1000);label.textContent=!G.available(s,g.id)?'이야기를 한 편 간직하면 열려요.':G.used(m,Date.now())>=6?'오늘의 놀이를 모두 마쳤어요.':seconds?'다음 도전까지 '+Math.floor(seconds/60)+':'+String(seconds%60).padStart(2,'0'):m.active||s.mini.active?'진행 중인 도전을 먼저 마쳐 주세요.':'';btn.disabled=!G.canStart(s,g.id,Date.now());}}
 if(m.active?.kind==='pairs'&&m.active.reveal&&Date.now()>=m.active.hideAt)locked(()=>{sync();if(G.settle(state().leisure.play,Date.now())){save();refreshPairs();}});
 }
 root.addEventListener('change',e=>{if(e.target.id==='skinCard'){const id=e.target.value;locked(()=>{sync();showCapsule('editor',id,false,false);});}});
 return {room,update,handle,machineButton,wardrobe,stagePanel,capsulePanel,drivePanel:driving.panel};
};

},
"src/client/our-stage-drive.js":function(module,exports,__require){
'use strict';
module.exports=function(args){
 const {M,root,state,save,locked,sync,button}=args,D=M.drive;
 const logo=typeof Image==='undefined'?null:new Image();if(logo){logo.onload=()=>paint();logo.src='/images/game/our-stage/card-logo.svg';}
 const places=[['방송국','오늘의 음악 방송'],['라디오 스튜디오','목소리로 만나는 밤'],['공연장','우리의 무대가 기다려요']];
 let previousPattern=null,difficulty='normal',run=null,result=null,paused=false,countdown=3000,last=0,raf=0,canvas=null,place=places[0],pointer=null;
 const $=q=>root.querySelector(q);
 const crashDuration=900;let crashRemaining=0;
 const reducedMotion=()=>typeof matchMedia==='function'&&matchMedia('(prefers-reduced-motion: reduce)').matches;
 function lobby(){return `<article class="mini-game-card drive-lobby"><span class="leisure-icon" aria-hidden="true">▰</span><h4>씨야, 스케줄 가는 길</h4><p>차를 피해 오늘의 무대까지 달려요.</p><small>30초 도착 · 8~12코인 · 하루 보상 2회</small>${button('스케줄 출발하기','drive-open','','primary',!state().simple.debuted)}<p>오늘 보상 ${D.limit-D.remaining(state().leisure.drive)} / ${D.limit}회</p></article>`;}
 function choices(){return `<div class="drive-difficulties" role="group" aria-label="주행 난이도">${Object.entries(D.difficulties).map(([id,d])=>`<button data-action="drive-difficulty" data-value="${id}" aria-pressed="${difficulty===id}"><strong>${d.name}</strong><span>${d.reward}코인</span></button>`).join('')}</div><p class="drive-difficulty-note">${D.difficulties[difficulty].description} · 난이도 합산 하루 2회</p>`;}
 function panel(){
  const left=D.remaining(state().leisure.drive),playing=run&&!result,level=D.difficulties[playing?run.difficulty:difficulty];
  return `<section class="drive-page"><div class="drive-heading"><small>SCHEDULE DRIVE</small><h2>씨야, 스케줄 가는 길</h2><p>${place[0]}까지, 안전하게 출발!</p></div>${playing?`<p class="drive-difficulty-note">${level.name} · 성공 보상 ${left?level.reward+'코인':'모두 수령'}</p>`:choices()}<div class="drive-hud" aria-label="주행 상태"><strong id="driveTime">${run?Math.ceil((D.duration-run.elapsed)/1000):30}초</strong><span id="driveHits">충돌 ${run?.hits||0} / 2</span><span>오늘 보상 ${D.limit-left} / ${D.limit}</span></div><div class="drive-road"><canvas id="scheduleRoad" width="320" height="480" tabindex="0" role="application" aria-label="스케줄 주행. 왼쪽 오른쪽 방향키 또는 A D로 차선을 바꾸세요. 터치는 좌우로 밀거나 원하는 차선을 누르세요."></canvas><div id="driveOverlay" class="drive-overlay" ${playing?'hidden':''}>${result?`<strong>${result.success?'스케줄 도착!':'괜찮아요, 다시 출발해요'}</strong><p>${result.success?place[1]:'다른 차와 두 번 부딪혔어요.'}</p><b>${result.coins?'+'+result.coins+' 코인':result.success?'연습 주행 완료':'보상 횟수는 줄어들지 않아요'}</b>`:'<strong>오늘도 씨야와 함께</strong><p>30초 동안 차를 피해 달려요.<br>한 번 부딪혀도 계속 갈 수 있어요.</p>'}</div></div><p id="driveStatus" class="drive-status" role="status" aria-live="polite">${result?.success?(left?'오늘 보상을 '+left+'번 더 받을 수 있어요.':'오늘 보상 2회를 모두 받았어요.'):playing?'좌우로 밀거나 원하는 차선을 눌러요.':'← → / A·D · 터치 / 스와이프'}</p><div class="drive-actions">${playing?button('잠시 멈추기','drive-pause'):button(result?'다시 출발하기':left?'출발하기':'보상 없이 연습하기','drive-start','','primary')}${button('코인 모으기로','drive-exit')}</div>${!playing&&!left?'<p class="private-note">오늘의 보상을 모두 받았어요. 한국 시간 자정에 다시 열려요.<br>계속해서 보상 없이 연습할 수 있어요.</p>':''}</section>`;
 }
 function stop(){if(typeof document!=='undefined')document.removeEventListener('keydown',onKey);cancelAnimationFrame(raf);raf=0;canvas=null;pointer=null;crashRemaining=0;}
 function render(){args.openDrivePage();mount();}
 function handle(a,v){
  if(!a.startsWith('drive-'))return false;
  if(a==='drive-open'){stop();run=null;result=null;place=places[state().leisure.drive.serial%places.length];render();}
  if(a==='drive-difficulty'&&(!run||result)&&Object.hasOwn(D.difficulties,v)){difficulty=v;render();}
  if(a==='drive-start'){
   if(!state().simple.debuted||(run&&!result))return true;
   stop();const ticket=D.start(state().leisure.drive,Date.now(),difficulty);if(!ticket)return true;save();
   const seed=typeof crypto!=='undefined'&&crypto.getRandomValues?crypto.getRandomValues(new Uint32Array(1))[0]:Date.now()^Math.floor(Math.random()*4294967296);
   run=D.create(ticket.id,seed,ticket.difficulty,previousPattern);previousPattern=run.pattern;result=null;paused=false;countdown=3000;place=places[(ticket.id-1)%places.length];render();
  }
  if(a==='drive-pause'&&run&&!result){paused=!paused;last=0;refreshPause();}
  if(a==='drive-exit'){stop();run=null;result=null;args.exitDrivePage();}
  return true;
 }
 function refreshPause(){const overlay=$('#driveOverlay'),btn=$('[data-action="drive-pause"]');if(!overlay||!btn)return;overlay.hidden=!paused;overlay.innerHTML=paused?'<strong>잠깐 쉬어가요</strong><p>시간과 차량이 멈춰 있어요.</p>':'';btn.textContent=paused?'계속 달리기':'잠시 멈추기';if(!paused)canvas?.focus({preventScroll:true});}
 function steer(d){if(run&&!run.done&&!result&&!paused&&countdown<=0)D.move(run,d);}
 function onKey(e){
  if(!canvas?.isConnected||!run||run.done||result||paused||countdown>0||document.hidden||e.defaultPrevented||e.altKey||e.ctrlKey||e.metaKey)return;
  // Keep steering after clicking the HUD or page, but leave text entry and dialogs alone.
  if($('#stageModal')?.open||e.target?.isContentEditable||e.target?.closest?.('input,textarea,select,[contenteditable]:not([contenteditable="false"]),[role="textbox"],dialog[open],[role="dialog"]'))return;
  const key=e.code||e.key;
  const direction=['ArrowLeft','KeyA','a','A'].includes(key)?-1:['ArrowRight','KeyD','d','D'].includes(key)?1:0;
  if(direction){e.preventDefault();steer(direction);}
 }
 function mount(){
  canvas=$('#scheduleRoad');if(!canvas)return;const target=canvas;paint();if(!run||result)return;
  target.focus({preventScroll:true});last=0;
  document.removeEventListener('keydown',onKey);document.addEventListener('keydown',onKey);
  target.onpointerdown=e=>{e.preventDefault();target.focus({preventScroll:true});target.setPointerCapture(e.pointerId);pointer={id:e.pointerId,x:e.clientX,start:e.clientX,moved:false};};
  target.onpointermove=e=>{if(!pointer||pointer.id!==e.pointerId)return;const dx=e.clientX-pointer.x;if(Math.abs(dx)>22){steer(Math.sign(dx));pointer.x=e.clientX;pointer.moved=true;}};
  target.onpointerup=e=>{if(pointer?.id!==e.pointerId)return;if(!pointer.moved&&run&&!run.done&&!paused&&countdown<=0){const rect=target.getBoundingClientRect(),lane=Math.max(0,Math.min(2,Math.floor(((e.clientX-rect.left)/rect.width*320-37)/82)));run.lane=lane;}pointer=null;};
  target.onpointercancel=()=>{pointer=null;};
  const frame=now=>{
   if(canvas!==target||!target.isConnected||!run||result){stop();return;}
   if($('#stageModal')?.open&&!paused){paused=true;refreshPause();}
   const dt=last?Math.min(50,Math.max(0,now-last)):0;last=now;
   if(!paused&&!document.hidden){
    if(crashRemaining>0)crashRemaining=Math.max(0,crashRemaining-dt);
    else if(countdown>0)countdown=Math.max(0,countdown-dt);
    else {const hits=run.hits;D.advance(run,dt);if(run.hits!==hits){if(run.hits>=2)crashRemaining=crashDuration;$('#driveStatus').textContent=run.hits===1?'한 번 부딪혔어요. 이제 한 번 더 부딪히면 멈춰요.':'쿵! 차가 멈췄어요.';}}
   }
   paint();$('#driveTime').textContent=Math.ceil((D.duration-run.elapsed)/1000)+'초';$('#driveHits').textContent='충돌 '+run.hits+' / 2';
   const overlay=$('#driveOverlay');if(!paused){overlay.hidden=countdown<=0;overlay.innerHTML=countdown>0?'<strong>'+Math.ceil(countdown/1000)+'</strong><p>출발 준비!</p>':'';}
   if(run.done&&crashRemaining<=0&&!paused&&!document.hidden){const completed=run;stop();locked(()=>{sync();const settled=D.finish(state().leisure.drive,completed);if(settled){save();result=settled;}else result={success:false,coins:0,remaining:D.remaining(state().leisure.drive)};render();});return;}
   raf=requestAnimationFrame(frame);
  };raf=requestAnimationFrame(frame);
 }
 if(typeof document!=='undefined')document.addEventListener('visibilitychange',()=>{if(document.hidden&&run&&!result&&canvas?.isConnected){paused=true;last=0;refreshPause();}});
 function paint(){
  if(!canvas)return;const c=canvas.getContext('2d');if(!c)return;c.imageSmoothingEnabled=false;
  const t=run?.elapsed||0,level=D.difficulties[run?.difficulty||difficulty],offset=(t*level.speed)%80;
  c.fillStyle='#c5d7bc';c.fillRect(0,0,320,480);
  c.fillStyle='#eee2cf';c.fillRect(21,0,278,480);c.fillStyle='#646575';c.fillRect(37,0,246,480);
  c.fillStyle='#f9efdf';c.fillRect(40,0,3,480);c.fillRect(277,0,3,480);
  for(let y=-80;y<480;y+=80){c.fillStyle='#dfd9d2';c.fillRect(117,y+offset,4,35);c.fillRect(199,y+offset,4,35);c.fillStyle='#8da985';c.fillRect(0,y+offset+8,17,26);c.fillRect(303,y+offset+45,17,26);c.fillStyle='#5e8669';c.fillRect(3,y+offset+12,12,16);c.fillRect(306,y+offset+48,12,16);}
  const car=(lane,y,color,van=false)=>{const x=78+82*lane-19;c.fillStyle='#383244';c.fillRect(x-3,y+7,44,56);c.fillStyle=color;c.fillRect(x,y,38,70);c.fillRect(x+4,y-4,30,78);c.fillStyle='#cce2e2';c.fillRect(x+5,y+8,28,13);c.fillStyle='#554659';c.fillRect(x+5,y+48,28,10);c.fillStyle='#ffedc4';c.fillRect(x+1,y,7,5);c.fillRect(x+30,y,7,5);c.fillStyle='#ba6d76';c.fillRect(x+2,y+65,6,5);c.fillRect(x+30,y+65,6,5);if(van){c.fillStyle='#fff4df';c.fillRect(x+6,y+27,26,13);if(logo?.complete&&logo.naturalWidth)c.drawImage(logo,x+7,y+30,24,7);}};
  for(const obstacle of run?.rows||[])car(obstacle.lane,obstacle.y,['#a4bac6','#dfb48d','#b9b0cc','#c9c7b5'][obstacle.color]);
  const impactAge=crashDuration-crashRemaining;
  const jolt=crashRemaining>0&&!reducedMotion()?Math.sin(impactAge*.055)*4*Math.max(0,1-impactAge/360):0;
  if(run?.hits>=2||!run?.immune||Math.floor(t/130)%2===0)car((run?.x??1)+jolt/82,375,'#c38aa8',true);
  if(crashRemaining>0){
   // A single pixel impact, not a flashing screen. Keep the hit visible before the result.
   const x=78+82*run.x,y=378,spread=reducedMotion()?1:Math.min(1,impactAge/120);
   c.fillStyle='#764653';c.fillRect(x-28,y-5,56,10);c.fillRect(x-5,y-28,10,56);
   c.fillStyle='#ffce80';c.fillRect(x-23,y-4,46,8);c.fillRect(x-4,y-23,8,46);
   c.fillStyle='#fff3cf';c.fillRect(x-12,y-12,24,24);
   c.fillStyle='#edaa7d';for(const [dx,dy] of [[-1,-1],[1,-1],[-1,1],[1,1]])c.fillRect(x+dx*(23+10*spread)-3,y+dy*(21+8*spread)-3,6,6);
   c.fillStyle='#694553';c.fillRect(x-29,y-64,58,29);c.fillStyle='#fff2d8';c.font='bold 18px sans-serif';c.textAlign='center';c.fillText('쿵!',x,y-43);
  }
  if(!run||run.elapsed<1200){c.fillStyle='#fff7e9';c.fillRect(79,22,162,42);c.fillStyle='#76516c';c.font='bold 14px sans-serif';c.textAlign='center';c.fillText(place[0]+' 가는 길',160,48);}
  if(result?.success){c.fillStyle='#eaddca';c.fillRect(38,120,244,60);c.fillStyle='#fff6df';for(let x=44;x<279;x+=24)c.fillRect(x,130,12,40);}
 }
 return {lobby,panel,handle,stop};
};

},
"src/client/our-stage-mini-v2.js":function(module,exports,__require){
'use strict';
module.exports=function({M,root,state,save,draw,dialog,button,esc,mark,locked,sync}){
 const G=M.mini,$=q=>root.querySelector(q),layers=__require("src/data/our-stage-layers.json"),optimized=__require("src/data/our-stage-optimized-images.json");let viewing=null;
 const stamp=ms=>{const n=Math.ceil(ms/1000);return Math.floor(n/60)+':'+String(n%60).padStart(2,'0');};
 function room(){const m=state().mini;return `<section class="mini-lobby"><h3>작은 놀이, 다음 무대의 코인</h3><p>오늘 남은 도전 ${Math.max(0,G.dailyLimit-G.used(m,Date.now()))} / ${G.dailyLimit}회 · 두 게임 합산</p><div class="mini-game-grid">${G.games.map(g=>`<article class="mini-game-card"><h4>${g.name}</h4><p>${g.description}</p><strong>최대 ${g.maxReward}코인</strong><small>${g.id==='pairs'?'16장 · 8쌍 · 화음 콤보와 S등급 보너스':'무작위 3문제 · 정답당 5코인'}</small>${button('도전하기','mini-start',g.id,'primary',!G.canStart(m,g.id,Date.now()))}<p data-mini-wait="${g.id}" role="status"></p></article>`).join('')}</div>${m.active?`<p>진행 중인 게임이 있어요.</p>${button('이어 하기','mini-resume')}${button('이번 도전 그만하기','mini-abandon')}`:''}<p class="private-note">시작하면 도전 횟수와 대기 시간이 적용됩니다. 닫거나 새로고침해도 이어 할 수 있어요.<br>한국 시간 자정에 6회 충전 · 재도전 대기 ${G.cooldown/60000}분.</p></section>`;}
 function quiz(){const a=state().mini.active;if(a?.kind!=='quiz')return;viewing=a.id;const q=G.question(a);if(!q){result();return;}dialog(`${mark('SEEYA QUIZ')}<h2>씨야 활동 퀴즈</h2>${q.album?'<small>'+esc(M.albumById(q.album).name)+' 활동의 기억</small>':''}<p>${a.answers.length+1} / 3문제 · 정답당 5코인</p><h3>${esc(q.question)}</h3><div class="quiz-options">${q.choices.map((x,i)=>button(esc(x),'mini-answer',a.answers.length+':'+i)).join('')}</div>`);}
 function face(id,slot){const c=G.cards[id],d=layers[c.style],box=d.members[c.member].head,name=M.members.find(m=>m.id===c.member).name;return `<svg viewBox="${box.join(' ')}" aria-hidden="true"><defs><clipPath id="pair-crop-${slot}"><rect x="${box[0]}" y="${box[1]}" width="${box[2]}" height="${box[3]}"/></clipPath></defs><image clip-path="url(#pair-crop-${slot})" href="${optimized[d.headImage||d.image]||d.headImage||d.image}" width="${d.width}" height="${d.height}"/></svg><b>${name}</b><small>${c.label} 스타일</small>`;}
 function board(){const a=state().mini.active;if(a?.kind!=='pairs')return '';const p=G.progress(a);return `<p class="pairs-score" role="status">${p.pairs} / 8쌍 · ${p.turns}턴 · 화음 콤보 ${p.combo}연속 · 최고 ×${(1+p.maxCombo*.1).toFixed(1)}</p><div class="pairs-grid" aria-label="멤버 스타일 카드 16장">${a.deck.map((id,i)=>{const up=p.matched.has(i)||a.open===i||a.reveal?.includes(i),c=G.cards[id],name=M.members.find(m=>m.id===c.member).name;return `<button class="pair-card ${up?'is-up':''} ${p.matched.has(i)?'is-matched':''}" data-action="mini-flip" data-value="${i}" aria-label="${i+1}번째 카드${up?' · '+name+' '+c.label+(p.matched.has(i)?' · 짝 완성':''):' · 뒤집기'}" aria-pressed="${Boolean(up)}" ${p.matched.has(i)||p.done?'disabled':''}><span class="pair-inner"><span class="pair-back" aria-hidden="true"><b>SEEYA</b><small>OUR STAGE</small></span><span class="pair-face" aria-hidden="true">${up?face(id,i):''}</span></span></button>`;}).join('')}</div>${p.done?button('결과와 보상 확인','mini-result','','primary'):''}`;}
 function pairs(){const a=state().mini.active;if(a?.kind!=='pairs')return;viewing=a.id;if(G.settle(state().mini,Date.now()))save();dialog(`${mark('STYLE MATCH')}<h2>멤버 스타일 짝 맞추기</h2><p>같은 멤버·같은 활동기의 카드 두 장을 찾아요.</p><div id="pairsBoard">${board()}</div><details class="pairs-help"><summary>화음 콤보와 보상</summary><p>두 장을 고를 때마다 1턴입니다. 연속 매칭마다 최고 콤보 배율이 0.1씩 올라가며 최대 ×1.8입니다.</p><p>기본 보상은 찾은 쌍당 2코인 × 최고 콤보 배율(소수점 버림). 최소 8턴으로 완성하면 S등급과 8코인을 추가로 받아요. 최대 36코인입니다. 9~12턴은 A, 13턴 이상은 B입니다.</p><p>최대 200턴까지 진행하며, 그때까지 찾은 쌍으로 정산합니다. 1집·2집·2.5집의 도트 스타일을 사용합니다.</p></details>`);}
 function refresh(){const box=$('#pairsBoard'),a=state().mini.active;if(!box||a?.id!==viewing)return;const p=G.progress(a);box.querySelector('.pairs-score').textContent=`${p.pairs} / 8쌍 · ${p.turns}턴 · 화음 콤보 ${p.combo}연속 · 최고 ×${(1+p.maxCombo*.1).toFixed(1)}`;box.querySelectorAll('.pair-card').forEach((el,i)=>{const up=p.matched.has(i)||a.open===i||a.reveal?.includes(i),c=G.cards[a.deck[i]],name=M.members.find(m=>m.id===c.member).name;if(up&&!el.querySelector('.pair-face').innerHTML)el.querySelector('.pair-face').innerHTML=face(a.deck[i],i);el.classList.toggle('is-up',Boolean(up));el.classList.toggle('is-matched',p.matched.has(i));el.setAttribute('aria-pressed',Boolean(up));el.setAttribute('aria-label',`${i+1}번째 카드${up?' · '+name+' '+c.label+(p.matched.has(i)?' · 짝 완성':''):' · 뒤집기'}`);el.disabled=p.matched.has(i)||p.done;});if(p.done&&!box.querySelector('[data-action="mini-result"]'))box.insertAdjacentHTML('beforeend',button('결과와 보상 확인','mini-result','','primary'));}

 function result(){const r=G.finish(state().mini,viewing,Date.now());if(!r)return;viewing=null;save();draw();dialog(`${mark('PLAY COMPLETE')}<h2>${r.kind==='pairs'?r.rank+'등급 · '+(r.correct===8?'완성된 하모니':'다음에도 함께해요'):r.correct===r.total?'완벽한 기억!':'함께한 만큼, 한 걸음'}</h2><p>${r.correct} / ${r.total} ${r.kind==='pairs'?'쌍':'정답'}</p>${r.kind==='pairs'?`<p>${r.turns}턴 · 최고 화음 콤보 ${r.maxCombo}연속 · ×${r.multiplier.toFixed(1)}</p>`:''}<strong class="mini-reward">+${r.reward} 코인</strong><p>코인이 지갑에 들어왔어요.</p>${button('코인 모으기로','mini-done','','primary')}`);}
 function update(){const m=state().mini;for(const g of G.games){const label=$(`[data-mini-wait="${g.id}"]`),btn=$(`[data-action="mini-start"][data-value="${g.id}"]`);if(label){const ms=G.wait(m,g.id,Date.now());label.textContent=G.used(m,Date.now())>=G.dailyLimit?'오늘 도전을 모두 마쳤어요.':ms?'다음 도전까지 '+stamp(ms):m.active?'진행 중인 도전을 먼저 마쳐주세요.':'지금 도전할 수 있어요.';btn.disabled=!G.canStart(m,g.id,Date.now());}}if(m.active?.kind==='pairs'&&m.active.reveal&&Date.now()>=m.active.hideAt)locked(()=>{sync();if(G.settle(state().mini,Date.now())){save();refresh();}});}
 function handle(action,value){if(!action.startsWith('mini-'))return false;const m=state().mini;
  if(action==='mini-start'&&G.start(m,value,Date.now())){if(value==='quiz'&&M.simpleMode){const pool=G.pool.filter(k=>G.bank[k].album==='first-mind'||M.albumUnlocked(state(),G.bank[k].album));for(let i=pool.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[pool[i],pool[j]]=[pool[j],pool[i]];}if(pool.length>=3)m.active.keys=pool.slice(0,3);}save();draw();value==='quiz'?quiz():pairs();}
  if(action==='mini-resume')m.active?.kind==='quiz'?quiz():pairs();
  if(action==='mini-flip'&&G.flip(m,viewing,Number(value),Date.now())){save();refresh();}
  if(action==='mini-result')result();
  if(action==='mini-answer'){const [n,i]=value.split(':').map(Number),a=m.active;if(a?.id!==viewing||a.answers.length!==n)return true;const q=G.question(a);if(G.answer(m,viewing,i)){save();dialog(`${mark('SONG QUIZ')}<h2>${i===q.answer?'정답이에요!':'이번 정답을 기억해 봐요'}</h2><h3>${esc(q.choices[q.answer])}</h3><p>${esc(q.explanation)}</p>${q.source?`<p><a href="${esc(q.source)}" target="_blank" rel="noopener">원본 기록 보기 ↗</a></p>`:''}${button(a.answers.length===3?'결과 보기':'다음 문제','mini-next','','primary')}`);}}
  if(action==='mini-next')quiz();
  if(action==='mini-abandon'){if(m.active)G.abandon(m,m.active.id);viewing=null;save();draw();}
  if(action==='mini-done'){$('#stageModal').close();draw();}
  update();return true;
 }
 return {room,update,handle};
};

},
"src/client/our-stage-style-tile.js":function(module,exports,__require){
'use strict';
const layers=__require("src/data/our-stage-layers.json"),optimized=__require("src/data/our-stage-optimized-images.json");
let sequence=0;
module.exports=function tile(c){
 const d=layers[c.style],clothes=c.part==='clothes',box=d.members[c.member][clothes?'body':'head'];
 const image=clothes?d.image:d.headImage||d.image,clip='style-tile-'+(++sequence);
 return `<svg class="style-tile-art" data-part="${clothes?'clothes':'hair'}" viewBox="${box.join(' ')}" overflow="hidden" aria-hidden="true"><defs><clipPath id="${clip}"><rect x="${box[0]}" y="${box[1]}" width="${box[2]}" height="${box[3]}"/></clipPath></defs><image clip-path="url(#${clip})" href="${optimized[image]||image}" width="${d.width}" height="${d.height}"/></svg>`;
};

},
"src/client/our-stage-connect.js":function(module,exports,__require){
'use strict';
module.exports=function({root,sprite,styles,esc,key='seeya-our-stage-connect-v1'}){
 const G=__require("src/shared/our-stage-connect.js");
 let game=null,selected=null,highlight=[],path=null,pathUntil=0,paused=true,last=0,saveAt=0,resetAsked=false,message='',storageFailed=false;
 try{const raw=localStorage.getItem(key);if(raw){const parsed=JSON.parse(raw);if(G.valid(parsed))game=parsed;else message='저장된 판을 읽지 못했어요. 새 판으로 시작해 주세요.';}}catch{message='저장된 판을 불러오지 못했어요. 이 화면에서 새 판을 시작할 수 있어요.';}
 const tileArt=__require("src/client/our-stage-style-tile.js"),faces=G.tiles.map(t=>tileArt(t));
 const remaining=()=>game?.board.filter(v=>v!==null).length||0;
 const clock=()=>{const seconds=Math.floor((game?.elapsed||0)/1000);return Math.floor(seconds/60)+':'+String(seconds%60).padStart(2,'0');};
 function persist(){try{localStorage.setItem(key,JSON.stringify(game));storageFailed=false;}catch{storageFailed=true;}}
 function accrue(){const now=performance.now();if(last&&!paused&&game&&remaining()&&!document.hidden)game.elapsed+=Math.max(0,Math.floor(now-last));last=now;}
 function pause(){accrue();paused=true;selected=null;highlight=[];path=null;if(game)persist();}
 function board(){
  if(!game)return '';
  const coord=(v,max)=>v===0?.16:v===max+1?max+.54:v-.15;
  return `<div class="connect-board-wrap"><div class="connect-board" aria-label="캐릭터 사천성 패">${game.board.map((id,i)=>id===null?'<span class="connect-empty" aria-hidden="true"></span>':`<button type="button" class="connect-tile ${selected===i?'is-selected':''} ${highlight.includes(i)?'is-hint':''}" data-action="connect-tile" data-value="${i}" aria-pressed="${selected===i}" aria-label="${G.tiles[id].name} ${G.tiles[id].era} ${G.tiles[id].part==='clothes'?'의상':'헤어'}, ${Math.floor(i/G.cols)+1}행 ${i%G.cols+1}열" ${paused?'disabled':''}><span class="connect-face" aria-hidden="true">${faces[id]}</span><span><b>${esc(G.tiles[id].name)} · ${G.tiles[id].part==='clothes'?'의상':'헤어'}</b></span></button>`).join('')}</div>${path?`<svg class="connect-path" viewBox="0 0 6.7 8.7" preserveAspectRatio="none" aria-hidden="true"><polyline points="${path.map(p=>coord(p.x,6)+','+coord(p.y,8)).join(' ')}"/></svg>`:''}${paused&&remaining()?'<div class="connect-pause"><strong>잠시 쉬는 중</strong><button type="button" class="primary" data-action="connect-resume">이어서 하기</button></div>':''}</div>`;
 }
 function render(){return `<section class="panel connect-page"><header class="connect-heading"><div><small class="eyebrow">TAKE A BREAK</small><h2>멤버 사천성</h2></div><span class="connect-free">시간 제한 없이</span></header><p>같은 헤어·같은 의상의 패를 연결해요.<br>선은 두 번까지 꺾을 수 있어요.</p>${!game?'<div class="connect-intro"><div aria-hidden="true">'+faces.slice(0,3).join('')+'</div><p>천천히, 우리끼리 한 판.<br>코인이나 포인트는 사용하지 않아요.</p><button type="button" class="primary" data-action="connect-new">새 판 시작</button></div>':`<div class="connect-stats"><strong>${24-remaining()/2} / 24쌍</strong><span>플레이 <b data-connect-clock>${clock()}</b></span></div>${board()}${!remaining()?'<div class="connect-complete" role="status"><h3>모두 찾았어요!</h3><p>세 사람의 추억을 한 판 가득 모았네요.</p><button type="button" class="primary" data-action="connect-new">한 판 더</button></div>':`<div class="connect-tools"><button type="button" data-action="connect-hint" ${paused?'disabled':''}>힌트</button><button type="button" data-action="connect-shuffle" ${paused?'disabled':''}>섞기</button><button type="button" data-action="connect-pause" ${paused?'disabled':''}>잠깐 쉬기</button><button type="button" data-action="connect-reset">새 판</button></div>`}`}${resetAsked?'<div class="connect-confirm"><p>지금 판을 마치고 새로 시작할까요?</p><button type="button" class="primary" data-action="connect-new">새 판 시작</button> <button type="button" data-action="connect-cancel">계속하기</button></div>':''}<p class="connect-status" role="status">${esc(storageFailed?'진행 상황을 저장하지 못했어요. 이 화면을 닫으면 사라질 수 있어요.':message)}</p><details class="connect-help"><summary>플레이 안내</summary><p>다른 패를 통과하지 않고, 두 번 이하로 꺾어 연결하면 한 쌍이 사라져요. 판 바깥의 빈 공간도 이용할 수 있어요.</p><p>연결할 쌍이 없으면 남은 패를 자동으로 섞어요. 힌트·섞기는 횟수 제한이 없어요.</p><p>코인 보상이나 일일 제한은 없어요. 진행 중인 판은 이 브라우저에 자동 저장돼요.</p></details></section>`;}
 function repaint(focusIndex=null){const el=root.querySelector('.connect-page');if(el){el.outerHTML=render();if(focusIndex!==null)root.querySelector('[data-action="connect-tile"][data-value="'+focusIndex+'"]')?.focus({preventScroll:true});}}
 function handle(action,value){
  if(!action.startsWith('connect-'))return false;
  accrue();
  if(action==='connect-new'){game=G.fresh();paused=false;selected=null;highlight=[];path=null;resetAsked=false;message='마음에 드는 패부터 골라보세요.';last=performance.now();persist();repaint();root.querySelector('.connect-page')?.scrollIntoView?.({block:'start'});return true;}
  if(action==='connect-reset'){resetAsked=true;repaint();return true;}
  if(action==='connect-cancel'){resetAsked=false;repaint();return true;}
  if(!game)return true;
  if(action==='connect-resume'){paused=false;last=performance.now();message='';repaint();return true;}
  if(action==='connect-pause'){pause();repaint();return true;}
  if(paused||!remaining()||resetAsked)return true;
  if(action==='connect-hint'){const h=G.hint(game.board);highlight=h?[h.a,h.b]:[];selected=null;message='반짝이는 두 패를 연결해 보세요.';repaint();return true;}
  if(action==='connect-shuffle'){game.board=G.shuffle(game.board);game.shuffles++;selected=null;highlight=[];path=null;message='남은 패를 새롭게 놓았어요.';persist();repaint();return true;}
  if(action==='connect-tile'){
   const i=Number(value);if(!Number.isInteger(i)||i<0||i>=48||game.board[i]===null||path)return true;
   highlight=[];
   if(selected===i){selected=null;repaint(i);return true;}
   if(selected===null){selected=i;message='같은 헤어·같은 의상의 패를 골라주세요.';repaint(i);return true;}
   const found=G.remove(game,selected,i);
   if(!found){selected=i;message='지금은 연결되지 않아요. 다른 짝을 찾아볼까요?';repaint(i);return true;}
   selected=null;path=found;pathUntil=performance.now()+420;message=remaining()?'한 쌍을 찾았어요!':'';persist();repaint();
  }
  return true;
 }
 function update(){
  if(!root.querySelector('.connect-page')){if(!paused)pause();return;}
  accrue();const now=performance.now();
  if(path&&now>=pathUntil){path=null;if(remaining()&&!G.hint(game.board)){game.board=G.shuffle(game.board);game.shuffles++;message='연결할 쌍이 없어 남은 패를 섞었어요.';persist();}repaint();}
  const el=root.querySelector('[data-connect-clock]');if(el)el.textContent=clock();
  if(game&&!paused&&now-saveAt>5000){persist();saveAt=now;}
 }
 document.addEventListener('visibilitychange',()=>{if(document.hidden){pause();repaint();}});
 window.addEventListener('pagehide',pause);
 return {render,handle,update,pause};
};

},
"src/shared/our-stage-connect.js":function(module,exports,__require){
'use strict';
const cols=6,rows=8;
const members=[['br','보람'],['gr','규리'],['yj','연지']];
const styles=[['first-mind','1집'],['lovely-sweet-heart','2집'],['california-dream','2.5집'],['brilliant-change','3집']];
// Keep the original twelve IDs stable for saved games.
const tiles=styles.flatMap(([style,era])=>members.map(([member,name])=>({member,name,style,era,part:'hair'})));
const outfits=[...__require("src/data/our-stage-outfits.json"),...__require("src/data/our-stage-shop.json"),...__require("src/data/our-stage-capsule-outfits.json")];
for(const outfit of outfits)for(const [member,name] of members)for(const part of ['hair','clothes']){
 if(outfit.reward&&!outfit.members.includes(member))continue;
 if(!tiles.some(t=>t.style===outfit.id&&t.member===member&&t.part===part))tiles.push({member,name,style:outfit.id,era:styles.find(s=>s[0]===outfit.id)?.[1]||({'practice':'연습복','base':'20주년','first-again':'4집','still-here':'재결합'})[outfit.id]||outfit.name,part});
}
const pick=__require("src/shared/our-stage-style-pick.js");
const point=i=>({x:i%cols+1,y:Math.floor(i/cols)+1});
function route(board,a,b,match=true){
 if(!Number.isInteger(a)||!Number.isInteger(b)||a<0||b<0||a>=48||b>=48||a===b||board[a]===null||board[b]===null||match&&board[a]!==board[b])return null;
 const start=point(a),end=point(b);
 const empty=p=>p.x===0||p.y===0||p.x===cols+1||p.y===rows+1||board[(p.y-1)*cols+p.x-1]===null||p.x===start.x&&p.y===start.y||p.x===end.x&&p.y===end.y;
 const clear=(p,q)=>{
  if(p.x!==q.x&&p.y!==q.y||!empty(p)||!empty(q))return false;
  const dx=Math.sign(q.x-p.x),dy=Math.sign(q.y-p.y);
  for(let x=p.x+dx,y=p.y+dy;x!==q.x||y!==q.y;x+=dx,y+=dy)if(!empty({x,y}))return false;
  return true;
 };
 const check=ps=>{
  ps=ps.filter((p,i)=>!i||p.x!==ps[i-1].x||p.y!==ps[i-1].y);
  if(!ps.slice(1).every((p,i)=>clear(ps[i],p)))return null;
  return ps.filter((p,i)=>!i||i===ps.length-1||!((ps[i-1].x===p.x&&p.x===ps[i+1].x)||(ps[i-1].y===p.y&&p.y===ps[i+1].y)));
 };
 let path=check([start,end]);if(path)return path;
 for(const corner of [{x:start.x,y:end.y},{x:end.x,y:start.y}]){path=check([start,corner,end]);if(path)return path;}
 for(let x=0;x<=cols+1;x++){path=check([start,{x,y:start.y},{x,y:end.y},end]);if(path)return path;}
 for(let y=0;y<=rows+1;y++){path=check([start,{x:start.x,y},{x:end.x,y},end]);if(path)return path;}
 return null;
}
function hint(board){for(let a=0;a<board.length;a++)if(board[a]!==null)for(let b=a+1;b<board.length;b++)if(board[a]===board[b]){const path=route(board,a,b);if(path)return {a,b,path};}return null;}
function shuffle(board,random=Math.random){
 const next=[...board],slots=board.flatMap((v,i)=>v===null?[]:[i]);
 for(let i=slots.length-1;i>0;i--){const j=Math.floor(Math.max(0,Math.min(.999999,random()))*(i+1));[next[slots[i]],next[slots[j]]]=[next[slots[j]],next[slots[i]]];}
 if(slots.length&&!hint(next)){
  // Keep cleared spaces and the exact tile counts; guarantee one legal next move.
  outer:for(const a of slots)for(const b of slots)if(route(next,a,b,false)){
   const c=slots.find(i=>i!==a&&next[i]===next[a]);
   [next[b],next[c]]=[next[c],next[b]];break outer;
  }
 }
 return next;
}
const fresh=(random=Math.random)=>({version:1,board:shuffle(pick(tiles.map((t,id)=>({...t,id})),12,random).flatMap(t=>[t.id,t.id,t.id,t.id]),random),elapsed:0,moves:0,shuffles:0});
function valid(s){return !!s&&s.version===1&&Array.isArray(s.board)&&s.board.length===48&&s.board.every(v=>v===null||Number.isInteger(v)&&v>=0&&v<tiles.length)&&tiles.every((_,i)=>{const n=s.board.filter(v=>v===i).length;return n<=4&&n%2===0;})&&['elapsed','moves','shuffles'].every(k=>Number.isSafeInteger(s[k])&&s[k]>=0&&s[k]<=1e9);}
function remove(s,a,b){const path=route(s.board,a,b);if(!path)return null;s.board[a]=null;s.board[b]=null;s.moves++;return path;}
module.exports={cols,rows,tiles,point,route,hint,shuffle,fresh,valid,remove};

}
};const cache={};function __require(id){if(cache[id])return cache[id].exports;const m=cache[id]={exports:{}};modules[id](m,m.exports,__require);return m.exports;}__require("src/client/our-stage.js");})();
