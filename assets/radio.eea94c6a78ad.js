(function(){'use strict';const modules={
"src/client/radio.js":function(module,exports,__require){
'use strict';
const {filterRadio,cards,selection,clock,paginateRadio,pagination,PAGE_SIZE}=__require("src/shared/radio.js");
const byId=id=>document.getElementById(id),rows=JSON.parse(byId('radioData').textContent);
let iframe=byId('radioPlayer');
const list=byId('radioList'),search=byId('radioSearch'),sort=byId('radioSort'),seek=byId('radioSeek'),play=byId('radioPlay'),speed=byId('radioSpeed');
const isPodcast=row=>row?.provider==='spotify';
const mediaId=row=>isPodcast(row)?row.episodeId:row?.videoId;
const key='seeya-radio-v1';let saved=[],positions={},last='';
try{const value=JSON.parse(localStorage.getItem(key)||'{}');saved=Array.isArray(value.saved)?value.saved.filter(id=>rows.some(r=>r.id===id)):[];last=typeof value.last==='string'?value.last:'';for(const row of rows){const p=value.positions?.[row.id];if(p&&p.videoId===mediaId(row)&&Number.isFinite(p.time)&&p.time>=0&&p.time<86400)positions[row.id]=p;}}catch{}
let selected=rows.find(r=>r.id===last)||rows[0],state={member:'전체',query:'',sort:'newest',format:'all',page:1},api=null,ready=false,failed=false,dragging=false,lastPersist=0,rateSignature='';
const continuous=byId('radioContinuous');continuous.checked=false;let autoActive=false,advanceTimer=null,handledEnd='';
function cancelAdvance(){clearTimeout(advanceTimer);advanceTimer=null;}
function visibleRows(){const visible=filterRadio(rows,state);return byId('radioSavedOnly').checked?visible.filter(r=>saved.includes(r.id)):visible;}
function nextRow(){const visible=visibleRows(),index=visible.findIndex(r=>r.id===selected?.id);return index<0?null:visible[index+1]||null;}
function nextLabel(){const visible=visibleRows(),index=visible.findIndex(r=>r.id===selected?.id);byId('radioNextManual').disabled=index<0||index>=visible.length-1;const next=nextRow();byId('radioNext').textContent=!continuous.checked?'현재 목록 순서대로 이어집니다.':next?'다음 방송 · '+next.date+' · '+(next.program||next.title):'현재 목록에서 다음 방송이 없어 이 방송에서 마칩니다.';}
function advance(){
 if(!continuous.checked||!autoActive||!ready)return;
 const next=nextRow();if(!next){autoActive=false;say('목록의 연속재생을 마쳤습니다.');return;}
 choose(next,{autoplay:true});
}
function say(message){byId('radioSelectionStatus').textContent=message;}
function persist(){try{localStorage.setItem(key,JSON.stringify({saved,last:selected?.id,positions}));return true;}catch{return false;}}
function renderList(){const paging=paginateRadio(visibleRows(),state.page);state.page=paging.page;list.innerHTML=cards(paging.items,selected?.id,saved);byId('radioPagination').innerHTML=pagination(paging.page,paging.total);byId('radioCount').textContent='총 '+visibleRows().length+'개 · '+paging.page+' / '+paging.total+' 페이지';nextLabel();}
function saveButton(){const active=saved.includes(selected?.id);byId('radioSave').textContent=active?'♥ 저장됨':'♡ 저장';byId('radioSave').setAttribute('aria-pressed',String(active));}
function showSelection(){if(!selected)return;byId('radioCurrent').innerHTML=selection(selected);byId('radioOriginal').href=isPodcast(selected)?selected.url:'https://www.youtube.com/watch?v='+selected.videoId;byId('radioOriginal').textContent=(isPodcast(selected)?'Spotify':'YouTube')+'에서 열기 ↗';byId('radioTransport').hidden=false;speed.parentElement.hidden=isPodcast(selected);byId('radioPodcastReload').hidden=!isPodcast(selected);continuous.disabled=false;byId('radioArchive').href='/archive/?record='+encodeURIComponent(selected.id);byId('radioBottomTitle').textContent=selected.title;if(iframe)iframe.title=selected.title;saveButton();renderList();}
function playerURL(row){const u=new URL('https://www.youtube.com/embed/'+row.videoId);u.search=new URLSearchParams({rel:'0',enablejsapi:'1',playsinline:'1',origin:location.origin,start:String(Math.floor(positions[row.id]?.time||0))}).toString();return u.href;}
function setControls(enabled){for(const id of ['radioPlay','radioBack','radioForward','radioRestart'])byId(id).disabled=!enabled;if(!enabled){seek.disabled=true;speed.disabled=true;}}
function resetProgress(){seek.max='0';seek.value='0';seek.disabled=true;byId('radioElapsed').textContent='0:00';byId('radioDuration').textContent='--:--';play.innerHTML='<span aria-hidden="true">▶</span>';play.setAttribute('aria-label','재생');speed.disabled=true;speed.innerHTML='<option value="1">1.0×</option>';rateSignature='';byId('radioBottomStatus').textContent='재생 대기';}
function remember(){if(!ready||failed||!selected||api.getVideoData?.()?.video_id!==mediaId(selected))return;const time=Number(api.getCurrentTime()),duration=Number(api.getDuration());if(Number.isFinite(time)&&duration>0){positions[selected.id]={videoId:mediaId(selected),time:api.getPlayerState()===0?0:Math.min(time,duration)};persist();}}
function sync(){
 if(!ready||failed||!selected)return;
 if(api.getVideoData?.()?.video_id!==mediaId(selected))return;
 const duration=Number(api.getDuration())||0,time=Number(api.getCurrentTime())||0,playing=api.getPlayerState()===1;
 play.innerHTML=playing?'<span aria-hidden="true">❚❚</span>':'<span aria-hidden="true">▶</span>';play.setAttribute('aria-label',playing?'일시정지':'재생');
 if(duration>0){seek.max=String(Math.floor(duration));seek.disabled=false;if(!dragging)seek.value=String(Math.floor(time));byId('radioElapsed').textContent=clock(time);byId('radioDuration').textContent=clock(duration);seek.setAttribute('aria-valuetext',clock(time)+' / '+clock(duration));}
 const rates=(api.getAvailablePlaybackRates?.()||[1]).filter(n=>Number.isFinite(n)&&n>0);const sig=rates.join(',');if(sig!==rateSignature){rateSignature=sig;speed.innerHTML=rates.map(n=>`<option value="${n}">${Number.isInteger(n)?n.toFixed(1):n}×</option>`).join('');}speed.disabled=rates.length<2;speed.value=String(api.getPlaybackRate?.()||1);
 byId('radioBottomStatus').textContent=(playing?'재생 중 · ':'선택한 방송 · ')+clock(time)+(duration?' / '+clock(duration):'');
 if(Date.now()-lastPersist>5000){remember();lastPersist=Date.now();}
}
function toggle(){if(!ready||failed)return;if(api.getPlayerState()===1)api.pauseVideo();else api.playVideo();}
function jump(time){if(!ready||failed)return;const duration=Number(api.getDuration());if(duration>0){api.seekTo(Math.max(0,Math.min(duration,time)),true);}}
function choose(row,{autoplay=false}={}){
 if(!row||row.id===selected?.id)return;
 const previousPodcast=isPodcast(selected);cancelAdvance();remember();selected=row;failed=false;autoActive=autoplay;handledEnd='';
 if(autoplay)state.page=Math.floor(visibleRows().findIndex(r=>r.id===row.id)/PAGE_SIZE)+1;
 resetProgress();showSelection();persist();
 say(autoplay?'다음 방송을 재생합니다.':positions[row.id]?.time?'지난 위치 '+clock(positions[row.id].time)+'부터 준비했습니다. 재생을 눌러주세요.':'방송을 선택했습니다. 재생을 눌러주세요.');
 if(isPodcast(row)){mountPodcast(autoplay);}
 else if(previousPodcast){mountYouTube(autoplay);}
 else if(ready){api.pauseVideo();setControls(true);if(autoplay)api.loadVideoById({videoId:row.videoId,startSeconds:0});else api.cueVideoById({videoId:row.videoId,startSeconds:positions[row.id]?.time||0});}else iframe.src=playerURL(row);
 if(!autoplay)document.querySelector('.radio-player-panel').scrollIntoView({block:'start',behavior:'auto'});
}
continuous.addEventListener('change',()=>{cancelAdvance();autoActive=continuous.checked&&ready&&api?.getPlayerState()===1;nextLabel();say(continuous.checked?'연속재생을 켰습니다. 방송이 끝나면 현재 목록의 다음 방송으로 이어집니다.':'연속재생을 껐습니다. 현재 방송은 계속 재생됩니다.');});
byId('radioFormat').addEventListener('change',()=>{state.format=byId('radioFormat').value;state.page=1;renderList();});
byId('radioNextManual').addEventListener('click',()=>{const visible=visibleRows(),index=visible.findIndex(r=>r.id===selected?.id);if(index>=0&&visible[index+1]){choose(visible[index+1]);state.page=Math.floor((index+1)/PAGE_SIZE)+1;renderList();}});
byId('radioPodcastReload').addEventListener('click',()=>{if(isPodcast(selected)){mountPodcast();say('플레이어를 다시 불러왔습니다. 재생 버튼을 눌러주세요.');}});
search.addEventListener('input',()=>{state.query=search.value;state.page=1;renderList();});sort.addEventListener('change',()=>{state.sort=sort.value;state.page=1;renderList();});
byId('radioSavedOnly').addEventListener('change',()=>{state.page=1;renderList();});
byId('radioSave').addEventListener('click',()=>{if(!selected)return;saved=saved.includes(selected.id)?saved.filter(id=>id!==selected.id):[...saved,selected.id];const ok=persist();saveButton();renderList();say(ok?(saved.includes(selected.id)?'이 브라우저에 방송을 저장했습니다.':'저장 목록에서 뺐습니다.'):'브라우저 저장을 사용할 수 없어 이번 화면에서만 유지됩니다.');});
document.querySelectorAll('[data-radio-member]').forEach(button=>button.addEventListener('click',()=>{state.member=button.dataset.radioMember;state.page=1;document.querySelectorAll('[data-radio-member]').forEach(b=>b.setAttribute('aria-pressed',String(b===button)));renderList();}));
byId('radioPagination').addEventListener('click',event=>{const button=event.target.closest('[data-radio-page]');if(!button||button.disabled)return;state.page=Number(button.dataset.radioPage);renderList();document.querySelector('.radio-library').scrollIntoView({block:'start',behavior:'auto'});});
list.addEventListener('click',event=>{const button=event.target.closest('[data-radio-id]');if(button)choose(rows.find(r=>r.id===button.dataset.radioId));});
play.addEventListener('click',toggle);byId('radioBack').addEventListener('click',()=>jump(Number(api?.getCurrentTime()||0)-15));byId('radioForward').addEventListener('click',()=>jump(Number(api?.getCurrentTime()||0)+15));byId('radioRestart').addEventListener('click',()=>jump(0));
seek.addEventListener('input',()=>{dragging=true;byId('radioElapsed').textContent=clock(seek.value);});seek.addEventListener('change',()=>{jump(Number(seek.value));dragging=false;});seek.addEventListener('blur',()=>{dragging=false;});
speed.addEventListener('change',()=>{if(ready&&!failed)api.setPlaybackRate(Number(speed.value));});
byId('radioToPlayer').addEventListener('click',()=>{document.querySelector('.radio-player-panel').scrollIntoView({block:'start',behavior:'auto'});play?.focus({preventScroll:true});});
window.addEventListener('pagehide',()=>{cancelAdvance();remember();});
document.addEventListener('visibilitychange',()=>{if(document.hidden)remember();else sync();});
// Visibility changes never trigger playback. Only an opted-in ENDED event advances.
setInterval(()=>{if(!document.hidden)sync();},1000);
let generation=0,apiRequested=false;
function teardown(){generation++;clearTimeout(timeout);ready=false;const old=api;api=null;try{old?.destroy();}catch{}byId('radioMedia').replaceChildren();iframe=null;setControls(false);}
function mountPodcast(autoplay=false){
 teardown();const token=generation;byId('radioMedia').className='radio-podcast';const target=document.createElement('div');byId('radioMedia').appendChild(target);
 const alive=()=>token===generation&&isPodcast(selected);
 const events={
  onReady(event){if(!alive())return;api=event.target;ready=true;clearTimeout(timeout);setControls(true);say(autoplay?'다음 방송을 재생합니다.':'재생 버튼을 눌러 들어보세요.');sync();if(autoplay)timeout=setTimeout(()=>{if(alive()&&api.getPlayerState()!==1){autoActive=false;say('자동 재생이 시작되지 않았습니다. 재생 버튼을 눌러 이어 들어주세요.');}},12000);},
  onProgress(){if(alive())sync();},
  onStateChange(event){if(!alive())return;if(event.data===1){clearTimeout(timeout);handledEnd='';autoActive=continuous.checked;say('재생 중');}else if(event.data===2){remember();say('일시정지');}else if(event.data===0){if(handledEnd===selected.id)return;handledEnd=selected.id;remember();if(continuous.checked&&autoActive){advance();return;}say('방송이 끝났습니다. 다른 방송을 골라주세요.');}sync();},
  onError(){if(!alive())return;clearTimeout(timeout);failed=true;autoActive=false;setControls(false);say('팟캐스트를 연결하지 못했습니다. 다시 불러오거나 Spotify에서 열기를 이용해 주세요.');}
 };
 timeout=setTimeout(()=>{if(alive()&&!ready)say('추가 버튼 연결이 지연되고 있습니다. 플레이어 안의 버튼 또는 Spotify에서 열기를 이용해 주세요.');},12000);
 api=__require("src/client/spotify-radio.js")(target,selected,events,{autoplay,start:autoplay?0:positions[selected.id]?.time||0});nextLabel();
}
let startYouTube=false;
function mountYouTube(autoplay=false){teardown();startYouTube=autoplay;byId('radioMedia').className='radio-video';iframe=document.createElement('iframe');iframe.id='radioPlayer';iframe.title=selected.title;iframe.allow='accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share';iframe.referrerPolicy='strict-origin-when-cross-origin';iframe.allowFullscreen=true;iframe.src=playerURL(selected);byId('radioMedia').appendChild(iframe);connect();}
function init(){if(api||!selected||isPodcast(selected))return;const token=generation;api=new window.YT.Player('radioPlayer',{events:{
 onReady(event){if(token!==generation||isPodcast(selected))return;api=event.target;ready=true;clearTimeout(timeout);setControls(true);if(startYouTube){startYouTube=false;api.loadVideoById({videoId:selected.videoId,startSeconds:0});}say(positions[selected.id]?.time?'지난 위치 '+clock(positions[selected.id].time)+'부터 이어 들을 수 있어요.':'재생 버튼을 눌러 들어보세요.');sync();},
 onStateChange(event){if(token!==generation||isPodcast(selected))return;if(!selected||api.getVideoData?.()?.video_id!==mediaId(selected))return;if(event.data===1){handledEnd='';autoActive=continuous.checked;say('재생 중');}else if(event.data===2){remember();say('일시정지');}else if(event.data===0){if(handledEnd===selected.id||api.getPlayerState()!==0)return;handledEnd=selected.id;remember();if(continuous.checked&&autoActive){advance();return;}say('방송이 끝났습니다. 다른 방송을 골라주세요.');}sync();},
 onPlaybackRateChange(){if(token===generation)sync();},
 onAutoplayBlocked(){if(token!==generation||isPodcast(selected))return;cancelAdvance();autoActive=false;say('자동 재생이 차단되었습니다. 재생 버튼을 눌러 이어 들어주세요.');},
 onError(event){
  if(token!==generation||isPodcast(selected))return;
  const id=api?.getVideoData?.()?.video_id;if(id&&id!==selected?.videoId)return;
  failed=true;setControls(false);byId('radioBottomStatus').textContent='원본에서 확인해 주세요';
  cancelAdvance();
  if(continuous.checked&&autoActive&&[2,5,100,101,150].includes(event?.data)&&nextRow()){
   say('재생할 수 없는 영상을 건너뛰고 다음 방송으로 이어집니다.');
   const failedId=selected.id;advanceTimer=setTimeout(()=>{advanceTimer=null;if(selected?.id===failedId)advance();},1200);
  }else{autoActive=false;say('이 영상을 여기서 재생할 수 없습니다. YouTube에서 열기로 확인해 주세요.');}
 }
 }});}
let timeout;
function connect(){
 clearTimeout(timeout);const token=generation;
 timeout=setTimeout(()=>{if(token===generation&&!ready&&!isPodcast(selected))say('추가 버튼을 연결하지 못했습니다. 영상 안의 기본 버튼 또는 YouTube에서 열기를 이용해 주세요.');},12000);
 if(window.YT?.Player)init();else if(!apiRequested){apiRequested=true;window.onYouTubeIframeAPIReady=init;const script=document.createElement('script');script.src='https://www.youtube.com/iframe_api';script.onerror=()=>{apiRequested=false;clearTimeout(timeout);if(!isPodcast(selected))say('추가 버튼을 연결하지 못했습니다. 영상 안의 기본 버튼 또는 원본을 이용해 주세요.');};document.head.appendChild(script);}
}
if(selected){showSelection();if(isPodcast(selected))mountPodcast();else{iframe.src=playerURL(selected);connect();}}


},
"src/shared/radio.js":function(module,exports,__require){
'use strict';
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function videoId(value){try{const u=new URL(value);if(u.protocol!=='https:')return '';let id='';if(u.hostname==='youtu.be')id=u.pathname.slice(1);else if(['youtube.com','www.youtube.com','m.youtube.com'].includes(u.hostname))id=u.searchParams.get('v')||u.pathname.match(/^\/(?:shorts|live|embed)\/([^/]+)/)?.[1]||'';return /^[\w-]{11}$/.test(id)?id:'';}catch{return '';}}
function resolveRadio(archive,reviews,today){
 const seen=new Set(),records=new Set();return reviews.flatMap(review=>{
  const row=archive.find(r=>r.id===review.recordId);
  if(!row||row.type!=='radio'||row.hidden||['hidden','scheduled','upcoming'].includes(row.status)||['scheduled','upcoming','cancelled'].includes(row.eventState)||row.date>today||!['official-channel-checked','fan-channel-checked'].includes(review.channelStatus))return [];
  const source=[row.source,...(row.additionalSources||[])].find(s=>s&&videoId(s.url)===review.youtubeId);
  if(!source||seen.has(review.youtubeId)||records.has(row.id))return [];
  seen.add(review.youtubeId);records.add(row.id);
  return [{id:row.id,date:row.date,dateBasis:row.dateBasis,dateStatus:row.dateStatus,title:row.title,program:row.program||'',members:row.members||[],source:source.label,videoId:review.youtubeId,kind:review.kind,channel:review.channel,channelStatus:review.channelStatus}];
 });
}
const kindLabel=kind=>({podcast:'공식 팟캐스트',full:'전체본 · 채널 표기',replay:'방송 다시보기',clip:'라이브 클립',part:'방송 일부 · 1–2부',excerpt:'방송 일부',talk:'토크 클립'}[kind]||'영상');
const dateLabel=r=>(r.dateBasis==='broadcast'?'방송일':r.dateBasis==='video-published'?'영상 게시일':r.dateBasis==='schedule'?'일정표 기준':'기록일')+(r.dateStatus==='tentative'?' · 잠정':'');
const channelLabel=r=>r.provider==='spotify'?'공식 팟캐스트':r.channelStatus==='fan-channel-checked'?'팬 보관 영상':'방송사·제작 채널';
function filterRadio(rows,{member='전체',query='',sort='newest',format='all'}={}){
 const q=query.trim().toLocaleLowerCase();return rows.filter(r=>(format==='all'||(format==='podcast'?r.provider==='spotify':r.provider!=='spotify'))&&(member==='전체'||(member==='씨야'?(r.members.includes('씨야')||['남규리','김연지','이보람'].every(m=>r.members.includes(m))):r.members.includes(member)))&&(!q||[r.title,r.program,r.channel,...r.members].join(' ').toLocaleLowerCase().includes(q))).sort((a,b)=>(sort==='oldest'?1:-1)*a.date.localeCompare(b.date)||a.id.localeCompare(b.id));
}
function cards(rows,selected,saved=[]){return rows.map(r=>`<article class="radio-item ${r.id===selected?'is-selected':''}"><div class="radio-wave" aria-hidden="true">${r.kind==='clip'?'♫':'◖◗'}</div><div class="radio-item-copy"><h3>${esc(r.title)}</h3><p>${esc(r.date)} · ${dateLabel(r)}<br>${esc(r.members.join(' · '))}</p><p>${esc(r.program)}</p><div class="radio-item-meta">${r.provider==='spotify'?'팟캐스트 · Spotify':'영상 · YouTube'}<br>${esc(r.channel)} · ${channelLabel(r)}<br>${r.provider==='spotify'?'':kindLabel(r.kind)}${saved.includes(r.id)?' · 저장됨':''}</div></div><button type="button" data-radio-id="${esc(r.id)}" aria-pressed="${r.id===selected}" aria-label="${esc(r.title)} ${r.id===selected?'선택됨':'선택'}">${r.id===selected?'선택됨':'선택'}</button></article>`).join('')||'<p class="radio-empty">조건에 맞는 방송이 없습니다.<br>검색어나 필터를 바꿔보세요.</p>';}
function selection(r){return `<div class="radio-now-label">지금 고른 방송 · ${kindLabel(r.kind)}</div><h2 id="radioCurrentTitle">${esc(r.title)}</h2><p>${esc(r.program)}</p><p class="radio-credits">${esc(r.date)} · ${dateLabel(r)} · ${esc(r.members.join(' · '))}<br>${r.provider==='spotify'?'팟캐스트 · Spotify':'영상 · YouTube'}<br>${esc(r.channel)} · ${channelLabel(r)}</p>`;}
const clock=seconds=>{const n=Math.max(0,Math.floor(Number(seconds)||0));return n>=3600?`${Math.floor(n/3600)}:${String(Math.floor(n/60)%60).padStart(2,'0')}:${String(n%60).padStart(2,'0')}`:`${Math.floor(n/60)}:${String(n%60).padStart(2,'0')}`;};
const PAGE_SIZE=9;
function paginateRadio(rows,page=1){const total=Math.max(1,Math.ceil(rows.length/PAGE_SIZE));const current=Math.max(1,Math.min(total,Math.floor(Number(page))||1));return {items:rows.slice((current-1)*PAGE_SIZE,current*PAGE_SIZE),page:current,total};}
function pagination(page,total){if(total<=1)return '';return `<button type="button" data-radio-page="${page-1}" ${page===1?'disabled':''} aria-label="이전 페이지">‹</button>${Array.from({length:total},(_,i)=>i+1).filter(n=>n===1||n===total||Math.abs(n-page)<=2).map((n,i,a)=>`${i&&n-a[i-1]>1?'<span>…</span>':''}<button type="button" data-radio-page="${n}" aria-label="${n}페이지" ${n===page?'aria-current="page"':''}>${n}</button>`).join('')}<button type="button" data-radio-page="${page+1}" ${page===total?'disabled':''} aria-label="다음 페이지">›</button>`;}
module.exports={PAGE_SIZE,paginateRadio,pagination,esc,videoId,resolveRadio,filterRadio,cards,selection,clock,dateLabel,channelLabel};

},
"src/client/spotify-radio.js":function(module,exports,__require){
'use strict';
let sdk=null,pending=[];
function load(callback,fail){
 if(sdk){callback(sdk);return;}
 pending.push({callback,fail});if(pending.length>1)return;
 window.onSpotifyIframeApiReady=value=>{sdk=value;const jobs=pending;pending=[];jobs.forEach(job=>job.callback(value));};
 const script=document.createElement('script');script.src='https://open.spotify.com/embed/iframe-api/v1';script.async=true;
 script.onerror=()=>{const jobs=pending;pending=[];jobs.forEach(job=>job.fail());};document.head.appendChild(script);
}
// Small adapter keeps the visible, official Spotify Embed in the common transport.
// Seconds outside this adapter; Spotify playback_update reports milliseconds.
module.exports=function(element,row,events,{autoplay=false,start=0}={}){
 let controller=null,dead=false,position=0,duration=0,state=5,started=false,ended=false;
 const uri='spotify:episode:'+row.episodeId;
 const player={
  getVideoData:()=>({video_id:row.episodeId}),getCurrentTime:()=>position,getDuration:()=>duration,getPlayerState:()=>state,
  getAvailablePlaybackRates:()=>[1],getPlaybackRate:()=>1,setPlaybackRate(){},
  playVideo(){if(!dead)controller?.resume();},pauseVideo(){if(!dead)controller?.pause();},
  seekTo(seconds){if(!dead&&duration>0){ended=false;controller?.seek(Math.floor(Math.max(0,Math.min(duration,seconds))));}},
  destroy(){dead=true;controller?.destroy();controller=null;}
 };
 load(I=>{
  if(dead)return;
  I.createController(element,{url:'https://open.spotify.com/episode/'+row.episodeId+(start>0?'?t='+Math.floor(start):''),width:'100%',height:232},c=>{
   if(dead){c.destroy();return;}controller=c;
   c.addListener('ready',()=>{if(dead)return;events.onReady({target:player});if(autoplay)c.resume();});
   c.addListener('playback_update',event=>{
    if(dead||event.data.playingURI!==uri)return;
    const d=event.data;position=Math.max(0,Number(d.position)||0)/1000;duration=Math.max(0,Number(d.duration)||0)/1000;
    const previous=state;
    // Spotify can report isPaused:false on its final, duration-equal update.
    // Use the provider's actual position, never an elapsed wall-clock timer.
    if(started&&duration>0&&position>=duration&&!d.isBuffering){if(ended)return;ended=true;state=0;}
    else if(!d.isPaused&&!d.isBuffering){started=true;ended=false;state=1;}
    else state=d.isBuffering?3:2;
    if(previous!==state)events.onStateChange({data:state});else events.onProgress();
   });
  });
 },()=>{if(!dead)events.onError({data:'connection'});});
 return player;
};

}
};const cache={};function __require(id){if(cache[id])return cache[id].exports;const m=cache[id]={exports:{}};modules[id](m,m.exports,__require);return m.exports;}__require("src/client/radio.js");})();
