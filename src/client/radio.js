'use strict';
const {filterRadio,cards,selection,clock,paginateRadio,pagination,PAGE_SIZE}=require('../shared/radio');
const byId=id=>document.getElementById(id),rows=JSON.parse(byId('radioData').textContent);
let iframe=byId('radioPlayer');
const list=byId('radioList'),search=byId('radioSearch'),sort=byId('radioSort'),seek=byId('radioSeek'),play=byId('radioPlay'),speed=byId('radioSpeed');
const isPodcast=row=>row?.provider==='spotify';
const mediaId=row=>isPodcast(row)?row.episodeId:row?.videoId;
const key='seeya-radio-v1';let saved=[],positions={},last='';
try{const value=JSON.parse(localStorage.getItem(key)||'{}');saved=Array.isArray(value.saved)?value.saved.filter(id=>rows.some(r=>r.id===id)):[];last=typeof value.last==='string'?value.last:'';for(const row of rows){const p=value.positions?.[row.id];if(p&&p.videoId===mediaId(row)&&Number.isFinite(p.time)&&p.time>=0&&p.time<86400)positions[row.id]=p;}}catch{}
let selected=rows.find(r=>r.id===last)||rows[0],state={member:'전체',query:'',sort:'newest',format:'all',page:1},api=null,ready=false,failed=false,dragging=false,lastPersist=0,rateSignature='';
const continuous=byId('radioContinuous');continuous.checked=false;let autoActive=false,advanceTimer=null,handledEnd='';
let shuffle=false,repeatOne=false,shuffleSignature='',shuffleIds=[];
function cancelAdvance(){clearTimeout(advanceTimer);advanceTimer=null;}
function visibleRows(){const visible=filterRadio(rows,state);return byId('radioSavedOnly').checked?visible.filter(r=>saved.includes(r.id)):visible;}
function playbackRows(){
 const visible=visibleRows();if(!shuffle)return visible;
 const signature=JSON.stringify(visible.map(r=>r.id).sort());
 if(signature!==shuffleSignature){shuffleSignature=signature;shuffleIds=require('../shared/radio-order')(visible.map(r=>r.id),selected?.id);}
 const index=new Map(visible.map(r=>[r.id,r]));return shuffleIds.map(id=>index.get(id)).filter(Boolean);
}
function nextRow(){const visible=playbackRows(),index=visible.findIndex(r=>r.id===selected?.id);return index<0?null:visible[index+1]||null;}
function nextLabel(){const visible=playbackRows(),index=visible.findIndex(r=>r.id===selected?.id);byId('radioPreviousManual').disabled=index<=0;byId('radioNextManual').disabled=index<0||index>=visible.length-1;const next=nextRow();byId('radioNext').textContent=repeatOne?'한 편 반복 · 현재 방송이 끝나면 처음부터 다시 재생합니다.':!continuous.checked?(shuffle?'랜덤 순서 준비 · 연속재생을 켜면 이어집니다.':'현재 목록 순서대로 이어집니다.'):next?(shuffle?'랜덤 다음 · ':'다음 방송 · ')+next.date+' · '+(next.program||next.title):'현재 목록에서 다음 방송이 없어 이 방송에서 마칩니다.';}
function advance(){
 if(!continuous.checked||!autoActive||!ready)return;
 if(repeatOne&&!failed){choose(selected,{autoplay:true,restart:true});return;}
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
function choose(row,{autoplay=false,restart=false}={}){
 if(!row||(!restart&&row.id===selected?.id))return;
 const previousPodcast=isPodcast(selected);cancelAdvance();remember();selected=row;failed=false;autoActive=autoplay;handledEnd='';
 if(autoplay)state.page=Math.floor(visibleRows().findIndex(r=>r.id===row.id)/PAGE_SIZE)+1;
 resetProgress();showSelection();persist();
 say(autoplay?'선택한 방송을 재생합니다.':positions[row.id]?.time?'지난 위치 '+clock(positions[row.id].time)+'부터 준비했습니다. 재생을 눌러주세요.':'방송을 선택했습니다. 재생을 눌러주세요.');
 if(isPodcast(row)){mountPodcast(autoplay);}
 else if(previousPodcast){mountYouTube(autoplay);}
 else if(ready){api.pauseVideo();setControls(true);if(autoplay)api.loadVideoById({videoId:row.videoId,startSeconds:0});else api.cueVideoById({videoId:row.videoId,startSeconds:positions[row.id]?.time||0});}else {startYouTube=autoplay;iframe.src=playerURL(row);}
 if(!autoplay)document.querySelector('.radio-player-panel').scrollIntoView({block:'start',behavior:'auto'});
}
function showModes(){byId('radioShuffle').setAttribute('aria-pressed',String(shuffle));byId('radioRepeatOne').setAttribute('aria-pressed',String(repeatOne));nextLabel();}
function enableMode(){cancelAdvance();continuous.checked=true;autoActive=ready&&api?.getPlayerState()===1;}
byId('radioShuffle').addEventListener('click',()=>{shuffle=!shuffle;shuffleSignature='';if(shuffle)enableMode();showModes();say(shuffle?'랜덤 재생을 켰습니다. 현재 목록 전체를 한 번씩 섞어 이어 듣습니다.':'랜덤 재생을 끄고 목록 순서로 돌아갑니다.');});
byId('radioRepeatOne').addEventListener('click',()=>{repeatOne=!repeatOne;if(repeatOne)enableMode();showModes();say(repeatOne?'한 편 반복을 켰습니다. 현재 방송이 끝나면 처음부터 다시 재생합니다.':'한 편 반복을 껐습니다. 다음 방송부터 설정한 순서로 이어집니다.');});
continuous.addEventListener('change',()=>{cancelAdvance();if(!continuous.checked){repeatOne=false;showModes();}autoActive=continuous.checked&&ready&&api?.getPlayerState()===1;nextLabel();say(continuous.checked?'연속재생을 켰습니다. 방송이 끝나면 현재 목록의 다음 방송으로 이어집니다.':'연속재생을 껐습니다. 현재 방송은 계속 재생됩니다.');});
byId('radioFormat').addEventListener('change',()=>{state.format=byId('radioFormat').value;state.page=1;renderList();});
function listenAdjacent(direction){const visible=playbackRows(),index=visible.findIndex(r=>r.id===selected?.id);if(index<0)return;const row=visible[index+direction];if(row)choose(row,{autoplay:true});}
byId('radioPreviousManual').addEventListener('click',()=>listenAdjacent(-1));
byId('radioNextManual').addEventListener('click',()=>listenAdjacent(1));
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
  onReady(event){if(!alive())return;api=event.target;ready=true;clearTimeout(timeout);setControls(true);say(autoplay?'선택한 방송을 재생합니다.':'재생 버튼을 눌러 들어보세요.');sync();if(autoplay)timeout=setTimeout(()=>{if(alive()&&api.getPlayerState()!==1){autoActive=false;say('자동 재생이 시작되지 않았습니다. 재생 버튼을 눌러 이어 들어주세요.');}},12000);},
  onProgress(){if(alive())sync();},
  onStateChange(event){if(!alive())return;if(event.data===1){clearTimeout(timeout);handledEnd='';autoActive=continuous.checked;say('재생 중');}else if(event.data===2){remember();say('일시정지');}else if(event.data===0){if(handledEnd===selected.id)return;handledEnd=selected.id;remember();if(continuous.checked&&autoActive){advance();return;}say('방송이 끝났습니다. 다른 방송을 골라주세요.');}sync();},
  onError(){if(!alive())return;clearTimeout(timeout);failed=true;autoActive=false;setControls(false);say('팟캐스트를 연결하지 못했습니다. 다시 불러오거나 Spotify에서 열기를 이용해 주세요.');}
 };
 timeout=setTimeout(()=>{if(alive()&&!ready)say('추가 버튼 연결이 지연되고 있습니다. 플레이어 안의 버튼 또는 Spotify에서 열기를 이용해 주세요.');},12000);
 api=require('./spotify-radio')(target,selected,events,{autoplay,start:autoplay?0:positions[selected.id]?.time||0});nextLabel();
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
  if(!repeatOne&&continuous.checked&&autoActive&&[2,5,100,101,150].includes(event?.data)&&nextRow()){
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

