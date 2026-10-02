(function(){'use strict';const modules={
"src/client/radio.js":function(module,exports,__require){
'use strict';
const {filterRadio,cards,selection,clock}=__require("src/shared/radio.js");
const byId=id=>document.getElementById(id),rows=JSON.parse(byId('radioData').textContent);
const iframe=byId('radioPlayer'),list=byId('radioList'),search=byId('radioSearch'),sort=byId('radioSort'),seek=byId('radioSeek'),play=byId('radioPlay'),speed=byId('radioSpeed');
const key='seeya-radio-v1';let saved=[],positions={},last='';
try{const value=JSON.parse(localStorage.getItem(key)||'{}');saved=Array.isArray(value.saved)?value.saved.filter(id=>rows.some(r=>r.id===id)):[];last=typeof value.last==='string'?value.last:'';for(const row of rows){const p=value.positions?.[row.id];if(p&&p.videoId===row.videoId&&Number.isFinite(p.time)&&p.time>=0&&p.time<86400)positions[row.id]=p;}}catch{}
let selected=rows.find(r=>r.id===last)||rows[0],state={member:'전체',query:'',sort:'newest'},api=null,ready=false,failed=false,dragging=false,lastPersist=0,rateSignature='';
function say(message){byId('radioSelectionStatus').textContent=message;}
function persist(){try{localStorage.setItem(key,JSON.stringify({saved,last:selected?.id,positions}));return true;}catch{return false;}}
function renderList(){let visible=filterRadio(rows,state);if(byId('radioSavedOnly').checked)visible=visible.filter(r=>saved.includes(r.id));list.innerHTML=cards(visible,selected?.id,saved);byId('radioCount').textContent=visible.length+'개 영상';}
function saveButton(){const active=saved.includes(selected?.id);byId('radioSave').textContent=active?'♥ 저장됨':'♡ 저장';byId('radioSave').setAttribute('aria-pressed',String(active));}
function showSelection(){if(!selected)return;byId('radioCurrent').innerHTML=selection(selected);byId('radioOriginal').href='https://www.youtube.com/watch?v='+selected.videoId;byId('radioArchive').href='/archive/?record='+encodeURIComponent(selected.id);byId('radioBottomTitle').textContent=selected.title;iframe.title=selected.title;saveButton();renderList();}
function playerURL(row){const u=new URL('https://www.youtube.com/embed/'+row.videoId);u.search=new URLSearchParams({rel:'0',enablejsapi:'1',playsinline:'1',origin:location.origin,start:String(Math.floor(positions[row.id]?.time||0))}).toString();return u.href;}
function setControls(enabled){for(const id of ['radioPlay','radioBack','radioForward','radioRestart'])byId(id).disabled=!enabled;if(!enabled){seek.disabled=true;speed.disabled=true;}}
function resetProgress(){seek.max='0';seek.value='0';seek.disabled=true;byId('radioElapsed').textContent='0:00';byId('radioDuration').textContent='--:--';play.innerHTML='<span aria-hidden="true">▶</span>';play.setAttribute('aria-label','재생');speed.disabled=true;speed.innerHTML='<option value="1">1.0×</option>';rateSignature='';byId('radioBottomStatus').textContent='재생 대기';}
function remember(){if(!ready||failed||!selected||api.getVideoData?.().video_id!==selected.videoId)return;const time=Number(api.getCurrentTime()),duration=Number(api.getDuration());if(Number.isFinite(time)&&duration>0){positions[selected.id]={videoId:selected.videoId,time:api.getPlayerState()===0?0:Math.min(time,duration)};persist();}}
function sync(){
 if(!ready||failed||!selected)return;
 if(api.getVideoData?.().video_id!==selected.videoId)return;
 const duration=Number(api.getDuration())||0,time=Number(api.getCurrentTime())||0,playing=api.getPlayerState()===1;
 play.innerHTML=playing?'<span aria-hidden="true">❚❚</span>':'<span aria-hidden="true">▶</span>';play.setAttribute('aria-label',playing?'일시정지':'재생');
 if(duration>0){seek.max=String(Math.floor(duration));seek.disabled=false;if(!dragging)seek.value=String(Math.floor(time));byId('radioElapsed').textContent=clock(time);byId('radioDuration').textContent=clock(duration);seek.setAttribute('aria-valuetext',clock(time)+' / '+clock(duration));}
 const rates=(api.getAvailablePlaybackRates?.()||[1]).filter(n=>Number.isFinite(n)&&n>0);const sig=rates.join(',');if(sig!==rateSignature){rateSignature=sig;speed.innerHTML=rates.map(n=>`<option value="${n}">${Number.isInteger(n)?n.toFixed(1):n}×</option>`).join('');}speed.disabled=rates.length<2;speed.value=String(api.getPlaybackRate?.()||1);
 byId('radioBottomStatus').textContent=(playing?'재생 중 · ':'선택한 방송 · ')+clock(time)+(duration?' / '+clock(duration):'');
 if(Date.now()-lastPersist>5000){remember();lastPersist=Date.now();}
}
function toggle(){if(!ready||failed)return;if(api.getPlayerState()===1)api.pauseVideo();else api.playVideo();}
function jump(time){if(!ready||failed)return;const duration=Number(api.getDuration());if(duration>0){api.seekTo(Math.max(0,Math.min(duration,time)),true);}}
function choose(row){
 if(!row||row.id===selected?.id)return;
 remember();selected=row;failed=false;resetProgress();showSelection();persist();
 if(ready){api.pauseVideo();api.cueVideoById({videoId:row.videoId,startSeconds:positions[row.id]?.time||0});setControls(true);}else iframe.src=playerURL(row);
 say(positions[row.id]?.time?'지난 위치 '+clock(positions[row.id].time)+'부터 준비했습니다. 재생을 눌러주세요.':'방송을 선택했습니다. 재생을 눌러주세요.');
 document.querySelector('.radio-player-panel').scrollIntoView({block:'start',behavior:'auto'});
}
search.addEventListener('input',()=>{state.query=search.value;renderList();});sort.addEventListener('change',()=>{state.sort=sort.value;renderList();});
byId('radioSavedOnly').addEventListener('change',renderList);
byId('radioSave').addEventListener('click',()=>{if(!selected)return;saved=saved.includes(selected.id)?saved.filter(id=>id!==selected.id):[...saved,selected.id];const ok=persist();saveButton();renderList();say(ok?(saved.includes(selected.id)?'이 브라우저에 방송을 저장했습니다.':'저장 목록에서 뺐습니다.'):'브라우저 저장을 사용할 수 없어 이번 화면에서만 유지됩니다.');});
document.querySelectorAll('[data-radio-member]').forEach(button=>button.addEventListener('click',()=>{state.member=button.dataset.radioMember;document.querySelectorAll('[data-radio-member]').forEach(b=>b.setAttribute('aria-pressed',String(b===button)));renderList();}));
list.addEventListener('click',event=>{const button=event.target.closest('[data-radio-id]');if(button)choose(rows.find(r=>r.id===button.dataset.radioId));});
play.addEventListener('click',toggle);byId('radioBack').addEventListener('click',()=>jump(Number(api?.getCurrentTime()||0)-15));byId('radioForward').addEventListener('click',()=>jump(Number(api?.getCurrentTime()||0)+15));byId('radioRestart').addEventListener('click',()=>jump(0));
seek.addEventListener('input',()=>{dragging=true;byId('radioElapsed').textContent=clock(seek.value);});seek.addEventListener('change',()=>{jump(Number(seek.value));dragging=false;});seek.addEventListener('blur',()=>{dragging=false;});
speed.addEventListener('change',()=>{if(ready&&!failed)api.setPlaybackRate(Number(speed.value));});
byId('radioToPlayer').addEventListener('click',()=>{document.querySelector('.radio-player-panel').scrollIntoView({block:'start',behavior:'auto'});play.focus({preventScroll:true});});
window.addEventListener('pagehide',remember);
document.addEventListener('visibilitychange',()=>{if(document.hidden)remember();else sync();});
// Observation only: never force playback when hidden, and never intercept lock controls.
setInterval(()=>{if(!document.hidden)sync();},1000);
function init(){if(api||!selected)return;api=new window.YT.Player('radioPlayer',{events:{
 onReady(event){api=event.target;ready=true;clearTimeout(timeout);setControls(true);say(positions[selected.id]?.time?'지난 위치 '+clock(positions[selected.id].time)+'부터 이어 들을 수 있어요.':'재생 버튼을 눌러 들어보세요.');sync();},
 onStateChange(event){if(!selected||api.getVideoData?.().video_id!==selected.videoId)return;if(event.data===1){say('재생 중');}else if(event.data===2){remember();say('일시정지');}else if(event.data===0){remember();say('방송이 끝났습니다. 다른 방송을 골라주세요.');}sync();},
 onPlaybackRateChange(){sync();},
 onAutoplayBlocked(){say('영상 안의 재생 버튼을 직접 눌러주세요.');},
 onError(){failed=true;setControls(false);byId('radioBottomStatus').textContent='원본에서 확인해 주세요';say('이 영상을 여기서 재생할 수 없습니다. YouTube에서 열기로 확인해 주세요.');}
 }});}
let timeout;
if(selected){showSelection();iframe.src=playerURL(selected);timeout=setTimeout(()=>{if(!ready)say('추가 버튼을 연결하지 못했습니다. 영상 안의 기본 버튼 또는 YouTube에서 열기를 이용해 주세요.');},12000);
 if(window.YT?.Player)init();else{window.onYouTubeIframeAPIReady=init;const script=document.createElement('script');script.src='https://www.youtube.com/iframe_api';script.onerror=()=>{clearTimeout(timeout);say('추가 버튼을 연결하지 못했습니다. 영상 안의 기본 버튼 또는 원본을 이용해 주세요.');};document.head.appendChild(script);}}

},
"src/shared/radio.js":function(module,exports,__require){
'use strict';
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function videoId(value){try{const u=new URL(value);if(u.protocol!=='https:')return '';let id='';if(u.hostname==='youtu.be')id=u.pathname.slice(1);else if(['youtube.com','www.youtube.com','m.youtube.com'].includes(u.hostname))id=u.searchParams.get('v')||u.pathname.match(/^\/(?:shorts|live|embed)\/([^/]+)/)?.[1]||'';return /^[\w-]{11}$/.test(id)?id:'';}catch{return '';}}
function resolveRadio(archive,reviews,today){
 const seen=new Set();return reviews.flatMap(review=>{
  const row=archive.find(r=>r.id===review.recordId);
  if(!row||row.type!=='radio'||row.hidden||['hidden','scheduled','upcoming'].includes(row.status)||['scheduled','upcoming','cancelled'].includes(row.eventState)||row.date>today||review.channelStatus!=='official-channel-checked')return [];
  const source=[row.source,...(row.additionalSources||[])].find(s=>s&&videoId(s.url)===review.youtubeId);
  if(!source||seen.has(review.youtubeId))return [];
  seen.add(review.youtubeId);
  return [{id:row.id,date:row.date,dateBasis:row.dateBasis,title:row.title,program:row.program||'',members:row.members||[],source:source.label,videoId:review.youtubeId,kind:review.kind,channel:review.channel}];
 });
}
const kindLabel=kind=>({full:'전체본 · 채널 표기',replay:'방송 다시보기',clip:'라이브 클립'}[kind]||'영상');
function filterRadio(rows,{member='전체',query='',sort='newest'}={}){
 const q=query.trim().toLocaleLowerCase();return rows.filter(r=>(member==='전체'||(member==='씨야'?(r.members.includes('씨야')||['남규리','김연지','이보람'].every(m=>r.members.includes(m))):r.members.includes(member)))&&(!q||[r.title,r.program,r.channel,...r.members].join(' ').toLocaleLowerCase().includes(q))).sort((a,b)=>(sort==='oldest'?1:-1)*a.date.localeCompare(b.date)||a.id.localeCompare(b.id));
}
function cards(rows,selected,saved=[]){return rows.map(r=>`<article class="radio-item ${r.id===selected?'is-selected':''}"><div class="radio-wave" aria-hidden="true">${r.kind==='clip'?'♫':'◖◗'}</div><div class="radio-item-copy"><h3>${esc(r.title)}</h3><p>${esc(r.date)} · ${esc(r.members.join(' · '))}</p><p>${esc(r.program)}</p><div class="radio-item-meta">${esc(r.channel)} · ${kindLabel(r.kind)}${saved.includes(r.id)?' · 저장됨':''}</div></div><button type="button" data-radio-id="${esc(r.id)}" aria-pressed="${r.id===selected}" aria-label="${esc(r.title)} ${r.id===selected?'선택됨':'선택'}">${r.id===selected?'선택됨':'선택'}</button></article>`).join('')||'<p class="radio-empty">조건에 맞는 테스트 영상이 없습니다.<br>이번에는 공식 영상 3개만 먼저 담았습니다.</p>';}
function selection(r){return `<div class="radio-now-label">지금 고른 방송 · ${kindLabel(r.kind)}</div><h2 id="radioCurrentTitle">${esc(r.title)}</h2><p>${esc(r.program)}</p><p class="radio-credits">${esc(r.date)} · ${r.dateBasis==='broadcast'?'방송일':'기록일'} · ${esc(r.members.join(' · '))}<br>${esc(r.channel)}</p>`;}
const clock=seconds=>{const n=Math.max(0,Math.floor(Number(seconds)||0));return n>=3600?`${Math.floor(n/3600)}:${String(Math.floor(n/60)%60).padStart(2,'0')}:${String(n%60).padStart(2,'0')}`:`${Math.floor(n/60)}:${String(n%60).padStart(2,'0')}`;};
module.exports={esc,videoId,resolveRadio,filterRadio,cards,selection,clock};

}
};const cache={};function __require(id){if(cache[id])return cache[id].exports;const m=cache[id]={exports:{}};modules[id](m,m.exports,__require);return m.exports;}__require("src/client/radio.js");})();
