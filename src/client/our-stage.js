(function(){
'use strict';
const isTest=location.pathname.replace(/\/$/,'')==='/game/our-stage/test';
const baseModel=isTest?require('../shared/our-stage').forTest():require('../shared/our-stage');
const M=require('../shared/our-stage-leisure')(require('../shared/our-stage-first-release')(require('../shared/our-stage-simple')(baseModel))),root=document.getElementById('ourStage');
if(!root)return;
const testTools=location.pathname.replace(/\/$/,'')==='/game/our-stage/test'?require('../shared/our-stage-test-tools')(M):null;
const checkpointKey='seeya-our-stage-before-test-jump-v1';
const key='seeya-our-stage-local-v1',$=q=>root.querySelector(q),art='/images/game/our-stage/';
const optimizedImages=require('../data/our-stage-optimized-images.json');
const optimized=html=>html.replace(/\/images\/game\/our-stage\/[^\s"'<>]+\.png/g,path=>optimizedImages[path]||path);
let vcrUI=null,ticketUI=null,giftUI=null,wallUI=null,coinUI=null,motionUI=null;
let activeChallenge=null,afterChallenge=null,returnFocus=null,blocked=false;
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const outfits=require('../data/our-stage-outfits.json');
const {nameTag}=require('../shared/our-stage-name-tag');
const outfitKey='seeya-our-stage-outfit-v1';
let outfitId='base';
try{const saved=localStorage.getItem(outfitKey);if(outfits.some(x=>x.id===saved))outfitId=saved;}catch{}
const skinVisual=require('./our-stage-skins'),decorArt=require('./our-stage-decor-art');
const styles=[...outfits,...M.shop,...M.capsuleOutfits],preview={},layers=require('../data/our-stage-layers.json');
const styleId=(id,part='clothes')=>preview[id]?.[part]||(part==='hair'?s.hair:s.equipped)[id];
const outfit=(id,part='clothes')=>styles.find(o=>o.id===styleId(id,part));
const motions=require('../shared/our-stage-motion-library');
const motionFor=id=>id==='scent'?'scent':id==='lovely-sweet-heart-01'?'greeting':false;
let artSequence=0;
const cardSmileHeads=Object.fromEntries(["still-here", "first-again", "base", "stage-seasons", "tour-encore", "tour-believe", "tour-varsity", "capsule-white", "capsule-silver"].map(id=>[id,art+'cards/'+id+'-subtle-smile.png']));
const mouthPositions=require('../data/our-stage-mouths.json');
const sprite=(id,override,motion=false,equippedOnly=false)=>{
 const filterId='stage-sprite-'+(++artSequence);
 const clothing=equippedOnly?styles.find(o=>o.id===s.equipped[id]):override||outfit(id),hair=equippedOnly?styles.find(o=>o.id===s.hair[id]):override||outfit(id,'hair'),head=layers[hair.id],body=layers[clothing.id],h=head.members[id],b=body.members[id];
 const {hw,hh,bh,bw,headX,headY,bodyX,bodyY}=require('../shared/our-stage-sprite-geometry')(id,hair.id,clothing.id,layers);
 // Expression follows the outfit; a separate hairstyle keeps its own face and accessories.
 const smileStyle=cardSmileHeads[clothing.id]&&hair.headKind!=='가면'?(cardSmileHeads[hair.id]?hair.id:clothing.id):null;
 const mouth=mouthPositions[hair.id][id],sourceMouth=smileStyle&&mouthPositions[smileStyle][id];
 const smilePatch=smileStyle?'<svg x="'+(mouth[0]-42)+'" y="'+(mouth[1]-21)+'" width="84" height="54" viewBox="'+[sourceMouth[0]-42,sourceMouth[1]-21,84,54].join(' ')+'" overflow="hidden"><image href="'+cardSmileHeads[smileStyle]+'" width="1536" height="1024"/></svg>':'';
 const part=(data,box,x,y,w,height,face=false)=>`<svg x="${x}" y="${y}" width="${w}" height="${height}" viewBox="${box.join(' ')}" overflow="hidden" preserveAspectRatio="none"><image href="${data.image}" width="${data.width}" height="${data.height}"/>${face?smilePatch:''}</svg>`;
 const headMarkup=`<g class="sprite-hair">${part({...head,image:head.headImage||head.image},h.head,headX,headY,hw,hh,true)}</g>`;
 const bodyMarkup=motion?require('./our-stage-choreo')({uid:filterId,image:part(body,b.body,0,0,234,333),head:headMarkup,x:bodyX,y:bodyY,width:bw,mode:motion}):`${headMarkup}<g class="sprite-body">${part(body,b.body,bodyX,bodyY,bw,bh)}</g>`;
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
function traineeRoom(){track='scent';return `<div class="studio-board trainee-studio">${mark('CHAPTER 00 · TRAINEE')}<h2>연습실에 처음 모인 날</h2><p>작은 연습 하나로, 우리의 첫 무대를 시작해요.</p><div class="room ${s.active?'is-practicing':''}">${wallKeepsakes()}<p class="room-status">${ready('scent')?'첫 무대에 설 준비가 됐어요.':'세 목소리가 처음 만나는 연습실'}</p><div class="pixel-trio">${['br','gr','yj'].map(id=>`<div class="pixel-member">${sprite(id,outfits.find(o=>o.id==='practice'))}</div>`).join('')}</div><div class="member-labels"><span>이보람</span><span>남규리</span><span>김연지</span></div></div>${practice()}</div>`;}
function lyricStatus(){const q=M.wordTasks.find(q=>q.track===s.active?.track);if(!q||!s.simple.debuted)return '';const end=s.simple.wordDone[q.track]?q.tokens.length:s.active.lesson===2?q.tokens.length:Math.floor(q.tokens.length/3)*(s.active.lesson+1);return q.tokens.slice(0,end).join(' ');}
function studio(){
 if(!s.simple.debuted)return traineeRoom();
 const g=goal(),m=M.memberCards(s).find(x=>x.id===s.displayCard&&x.earned);
 const status=s.solo?.active?M.soloTrackById(s.solo.active.id).title+' 연습 중':s.active?(lyricStatus()||M.lessons[s.active.lesson].title+' 중'):'오늘도 연습, 또 연습!';
 return `<section class="studio-next"><div><small>다음 할 일</small><h3>${g[0]}</h3><p>${g[1]}</p></div>${button(g[2],g[3],g[4],'primary')}</section><div class="studio-layout"><article class="studio-board">
 <header class="studio-top"><div>${mark('REHEARSAL ROOM')}<h2>세 사람의 연습실</h2></div><div class="resources"><span>연습 포인트 <b id="studioPoints">${s.points}<small> / 100</small></b></span><span>모은 트랙 <b>${M.count(s)}<small> / ${albumSize}</small></b></span></div></header>
 <details class="progress-help"><summary>연습은 어떻게 하나요?</summary><p>보컬·팀 호흡·무대 동선 연습을 마치면 준비도 100%가 돼요. 다음 곡은 자동으로 열립니다.</p><p>연습 포인트는 ${M.timing.testMode?'1초':'90초'}마다 5씩 회복돼요.</p><p>연습과 활동 퀴즈로 코인을 모아 의상과 헤어를 살 수 있어요.</p></details><div class="room${s.active||s.solo?.active?' is-practicing':''}${m?' has-keepsake':''}">${wallKeepsakes()}${miniUI.machineButton()}<p class="room-status" role="status">${s.active?'♫ ':''}${status}</p>${m?`<button class="wall-card" data-action="card-detail" data-value="${m.id}" aria-label="대표 카드 펼치기 · ${M.cardMembers.find(x=>x.id===m.member).name} · ${esc(m.title)}">${cardFace(m)}</button>`:''}<div class="pixel-trio">${['br','gr','yj'].map(id=>`<div class="pixel-member member-${id}">${sprite(id)}</div>`).join('')}</div>${giftUI.corner()}<div class="member-labels"><span>이보람</span><span>남규리</span><span>김연지</span></div></div>
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

const soloUI=require('./our-stage-solo')({M,state:()=>s,selected:()=>soloAlbum,button,esc,panel,link});
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
function draw(){const focus=document.activeElement,restore=focus&&($('#screen').contains(focus)||$('#tabs').contains(focus)),identity=restore?{id:focus.id,action:focus.dataset.action,value:focus.dataset.value,start:focus.selectionStart,end:focus.selectionEnd}:null;const a=M.albumById(selectedAlbum);if(!s.simple.debuted)scene=0;$('.os-chapter').innerHTML=!s.simple.debuted?mark('CHAPTER 00 · TRAINEE')+'<strong>연습실에 처음 모인 날</strong>':mark(a.type)+'<strong>'+a.name+'</strong><small>'+M.albumCount(s,a.id)+' / '+a.tracks.length+'트랙 수집</small>'; if(!open(track))track='scent';$('#tabs').innerHTML=(s.simple.debuted?headings:headings.slice(0,1)).map((name,i)=>`<button data-action="tab" data-value="${i}" aria-current="${scene===i?'page':'false'}"><span>${icons[i]}</span>${name}</button>`).join('');$('#screen').innerHTML=optimized([studio,songs,stories,memories,concert,designs][scene]());wallUI?.refresh();ticketUI?.refreshGallery();if(identity){const next=identity.id?document.getElementById(identity.id):[...root.querySelectorAll('[data-action]')].find(e=>e.dataset.action===identity.action&&e.dataset.value===identity.value);if(next){next.focus({preventScroll:true});if(identity.start!=null&&next.setSelectionRange)try{next.setSelectionRange(identity.start,identity.end);}catch{}}}}
function dialog(content){motionUI?.stop();coinUI?.clearStage();vcrUI?.destroy();if(!$('#stageModal').open)returnFocus=document.activeElement;$('#modalBody').innerHTML=optimized(content);const h=$('#modalBody h2');if(h){h.id='stageModalTitle';h.tabIndex=-1;}if(!$('#stageModal').open)$('#stageModal').showModal();h?.focus({preventScroll:true});}
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
 const phase=phases[i],phaseDuration=duration+(i===0?entrance:0),last=i===phases.length-1,theme=a?require('../data/our-stage-album-keepsakes.json')[a.id].colors[1]:'#895570';i++;$('#stageModal')._duration=phaseDuration;
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
function management(){
 dialog(`${mark('LOCAL SAVE')}<h2>저장 관리</h2><p>진행 상황은 이 주소를 여는 브라우저에 자동으로 저장돼요. 다른 기기로 옮기려면 백업 파일을 사용해 주세요.</p><div class="stack">${button('백업 내려받기','export')}${store?.dirty?button('저장 재시도','save-retry')+button('저장된 기록으로 돌아가기','saved-confirm'):button('백업 불러오기','import')+button('처음부터 다시 시작','reset')}</div>${button('마지막 백업 교체 전 기록 복원','restore-import')}${button('전환 전 원본 백업','export-before-simple')}<p role="status" id="saveNote">${store?.dirty?saveMessage():''}</p>`);
}
function sync(){try{const next=store?.pull();if(next)s=next;saveNotice();}catch{say('다른 탭의 기록을 읽지 못했어요. 현재 화면의 기록은 유지합니다.');}}
function handle(a,v){
 if(connectUI.handle(a,v))return;
 if(a==='tab'||a==='wardrobe-view')connectUI.pause();
 if(store?.dirty&&!['storage','export','export-before-simple','save-retry','saved-confirm','saved-apply','restore-import'].includes(a)){saveNotice();return;}
 if(a==='save-retry'){if(save()){draw();say('저장했어요. 이제 계속 진행할 수 있어요.');}return;}
 if(a==='saved-confirm'){dialog('<h2>저장된 기록으로 돌아갈까요?</h2><p>아직 저장하지 못한 현재 변경은 사라집니다. 먼저 현재 기록을 백업해 주세요. 다른 탭에 저장된 기록은 유지됩니다.</p>'+button('현재 기록 백업','export')+button('취소','storage')+button('저장된 기록으로 돌아가기','saved-apply'));return;}
 if(a==='saved-apply'){s=store.discard()||M.fresh();close();draw();saveNotice();say('저장된 기록을 불러왔어요.');return;}
 if(blocked&&!['storage','export','export-before-simple','import','import-confirm','reset','confirm-reset'].includes(a)){management();return;}
 if(isTest&&a==='motion-preview'){motionPreview(v||'scent');return;}
 if(isTest&&a==='motion-size'){const box=$('.motion-preview');if(!box||![.65,1,1.25].includes(Number(v)))return;box.style.setProperty('--motion',v);box.querySelectorAll('[data-action="motion-size"]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.value===v)));return;}
 if(isTest&&a==='motion-speed'){const box=$('.motion-preview');if(!box||![1,2,4,8].includes(Number(v)))return;box.style.setProperty('--motion-speed',v);const timing=box.querySelector('.motion-duration');if(timing)timing.textContent='한 흐름 '+(motions[box.dataset.motion].seconds/Number(v))+'초 · '+v+'배속';box.querySelectorAll('[data-action="motion-speed"]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.value===v)));restartMotion();return;}
 if(isTest&&a==='motion-restart'){restartMotion();return;}
 if(isTest&&a==='motion-pause'){const box=$('.motion-preview');if(!box)return;const paused=box.classList.toggle('motion-paused');box.querySelector('[data-action="motion-pause"]').textContent=paused?'동작 재생하기':'동작 멈추기';return;}
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
 if(a==='tab'){if($('#stageModal').open)close();scene=Number(v);draw();$('#screen').focus({preventScroll:true});return;}
 if(a==='practice-next'){const [from,to]=v.split('|');if(from!==track||!ready(from)||!open(to))return;if(!giftUI.beforeNext(from,to))handle('pick',to);return;}
 if(a==='pick'){if($('#stageModal').open)close();if(!open(v))return;if($('#stageModal').open)close();scene=0;track=v;selectedAlbum=M.songAlbum(v).id;draw();$('.practice').scrollIntoView({block:'center'});return;}
 if(a==='wear-reward'){if(!M.outfitOwned(s,v))return;close();handle('outfit',v);return;}
 if(a==='mini-open'){scene=5;wardrobeView='coins';draw();const card=$('[data-action="mini-start"][data-value="'+v+'"]');card?.scrollIntoView({block:'center'});card?.focus();return;}
 if(a==='open-coins'){scene=5;wardrobeView='coins';draw();return;}
 if(a==='daily-coins'){if(M.claimDaily(s)){save();draw();say(`오늘의 출석 보상 ${M.dailyReward}코인을 받았어요.`);}else{draw();say('오늘의 출석 보상은 이미 받았어요.');}return;}
 if(a==='wardrobe-view'){close();scene=5;wardrobeView=v;draw();return;}
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
vcrUI=require('./our-stage-vcr')({M,root,state:()=>s,dialog,button,mark});
giftUI=require('./our-stage-gifts')({M,state:()=>s,root,dialog,button,esc,save,draw,close,goPractice:id=>handle('pick',id)});
wallUI=require('./our-stage-wall-keepsakes')({M,state:()=>s,root,esc});
motionUI=require('./our-stage-concert-motion')();
coinUI=require('./our-stage-concert-coins')({root,dailyLimit:M.concertCoinLimit,remaining:()=>M.concertCoinRemaining(s),allowed:()=>showing&&!showHeld&&!document.hidden&&$('#stageModal').open,award:()=>M.claimConcertCoin(s)&&save()});
ticketUI=require('./our-stage-tickets')({M,state:()=>s,root,dialog,button,esc,save,draw,refreshWall:()=>wallUI.refresh()});
const stageShopUI=require('./our-stage-stage-shop')({M,state:()=>s,button,esc,stageArt,save,draw,say,focusPreview:()=>{$('.decor-detail')?.scrollIntoView({block:'start'});},openShop:()=>{close();scene=5;wardrobeView='shop';shopSection='stage';draw();}});
const miniUI=require('./our-stage-leisure')({M,root,state:()=>s,save,draw,dialog,button,esc,mark,locked,sync,sprite,cardFace,stageArt,stageDecorControls:()=>stageShopUI.controls(),openDrivePage:()=>{if($('#stageModal').open)close();scene=5;wardrobeView='drive';draw();$('.drive-page').scrollIntoView({block:'start'});},exitDrivePage:()=>{scene=5;wardrobeView='coins';draw();$('#screen').focus({preventScroll:true});},isCapsulePage:()=>scene===5&&wardrobeView==='capsule',openCapsulePage:(focus=true)=>{if($('#stageModal').open)close();scene=5;wardrobeView='capsule';draw();if(focus){const h=$('#screen .capsule-page h2');if(h){h.tabIndex=-1;h.focus({preventScroll:true});}$('#screen').scrollIntoView({block:'start'});}},clearOutfitPreview:()=>Object.keys(preview).forEach(k=>delete preview[k])});
const connectUI=require('./our-stage-connect')({root,sprite,styles,esc});
if(isTest){const speed=root.querySelector('.test-timing');if(speed)speed.textContent='로컬 테스트 · 첫 연습 약 1초, 이후 한 곡 연습 3초';}
if(testTools)$('.os-heading').insertAdjacentHTML('beforeend',button('테스트 이동','test-tools','','test-tools-button')+button('무대 동작 보기','motion-preview','','test-tools-button'));
draw();tick();setInterval(tick,250);if(warn)say(warn);
if(!blocked){locked(()=>{sync();if(!document.hidden)M.recordPlayDay(s);M.settle(s);save();draw();});document.addEventListener('visibilitychange',()=>{motionUI?.pause(document.hidden||showHeld);coinUI?.pause(document.hidden||showHeld);if(!document.hidden)locked(()=>{sync();if(!document.hidden)M.recordPlayDay(s);M.settle(s);save();draw();});});}
if(isTest&&motions[new URLSearchParams(location.search).get('stagePreview')])motionPreview(new URLSearchParams(location.search).get('stagePreview'));
})();
