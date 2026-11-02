'use strict';
const Show=require('../shared/my-concert-show');
let apiPromise;
function loadApi(){
 if(window.YT?.Player)return Promise.resolve(window.YT);
 if(apiPromise)return apiPromise;
 apiPromise=new Promise((resolve,reject)=>{
  const script=document.createElement('script'),previous=window.onYouTubeIframeAPIReady;
  let timer;
  function finish(ok){clearTimeout(timer);window.onYouTubeIframeAPIReady=previous;if(ok)resolve(window.YT);else{script.remove();apiPromise=null;reject(Error('플레이어 연결 실패'));}}
  window.onYouTubeIframeAPIReady=()=>{try{previous?.();}finally{finish(true);}};
  script.src='https://www.youtube.com/iframe_api';script.onerror=()=>finish(false);
  timer=setTimeout(()=>finish(false),15000);document.head.appendChild(script);
 });return apiPromise;
}
module.exports=function playback({root,$,esc,getShow,getSongs,edit}){
 let queue=[],index=-1,alternative=0,player=null,ready=false,generation=0,playing=false,ended=false,active=false,finished=false,readyTimer,failed=new Map(),lastMove=0;
 const status=msg=>{$('mcPlayStatus').textContent=msg;};
 const current=()=>queue[index],video=()=>current()?.videos[alternative];
 function destroy(){generation++;ready=false;playing=false;clearTimeout(readyTimer);if(player){try{player.destroy();}catch{}player=null;}$('mcMount').innerHTML='';}
 function close(){active=false;destroy();$('mcWatch').hidden=true;queue=[];}
 const sectionName={opening:'OPENING',main:'MAIN STAGE',encore:'ENCORE'};
 function controls(){
  let section='';
  $('mcQueue').innerHTML=queue.map((e,i)=>{
   let heading='';if(section!==e.section){section=e.section;heading='<h3>'+sectionName[section]+'</h3>';}
   return heading+'<button data-queue="'+i+'"'+(i===index?' aria-current="step"':'')+'>'+esc(e.kind==='vcr'?'VCR':String(e.number).padStart(2,'0'))+' · '+esc(e.label)+(i===index?(playing?' · 재생 중':' · 현재 항목'):'')+(failed.has(i)?' · '+esc(failed.get(i)):!e.videos.length?' · 무대 영상 준비 중':'')+'</button>';
  }).join('');
  $('mcPrevious').disabled=nextPlayable(index-1,-1)<0;
  $('mcNext').disabled=finished||nextPlayable(index+1,1)>=queue.length;
 }
 function pauseForNetwork(){playing=false;ended=true;destroy();status('플레이어를 불러오지 못했어요. 연결을 확인한 뒤 다시 시도해 주세요.');controls();}
 function finish(){
  finished=true;playing=false;ended=true;destroy();controls();
  const misses=queue.filter((e,i)=>!e.videos.length||failed.has(i)).length;
  status(misses?'감상을 마쳤어요. 재생하지 못한 항목이 '+misses+'개 있어요.':'내 콘서트를 모두 감상했어요.');
 }
 function nextPlayable(start,step){let i=start;while(i>=0&&i<queue.length&&!queue[i].videos.length)i+=step;return i;}
 function advance(){lastMove=Date.now();const next=nextPlayable(index+1,1);if(next>=queue.length)finish();else select(next);}
 function describe(){
  const e=current(),v=video();
  $('mcNow').textContent=(e.kind==='vcr'?'VCR · 다음 노래 '+(e.after+1):e.number)+' / 12 · '+sectionName[e.section];
  $('mcPlayingTitle').textContent=(e.kind==='hidden'?'히든 스테이지 공개 · ':'')+e.title;
  $('mcPlayingCredit').textContent=[e.artist,v?.title,v?.date,v?.channel].filter(Boolean).join(' · ');
  const link=$('mcOriginal');link.hidden=!v;if(v)link.href='https://www.youtube.com/watch?v='+v.videoId;
 }
 function videoError(code){
  if(!navigator.onLine||![2,5,100,101,150].includes(code)){pauseForNetwork();return;}
  playing=false;ended=true;
  if(++alternative<current().videos.length){status('같은 곡의 대체 무대를 연결하고 있어요.');requestVideo();return;}
  failed.set(index,'영상 재생 제한');advance();
 }
 async function mount(){
  destroy();const token=generation;
  try{
   const YT=await loadApi();if(!active||token!==generation)return;
   const frame=document.createElement('iframe');frame.title='콘서트 영상';frame.allow='autoplay; encrypted-media; fullscreen; picture-in-picture';frame.allowFullscreen=true;frame.referrerPolicy='strict-origin-when-cross-origin';
   frame.src='https://www.youtube.com/embed/'+video().videoId+'?enablejsapi=1&playsinline=1&origin='+encodeURIComponent(location.origin);
   $('mcMount').replaceChildren(frame);
   const alive=()=>active&&generation===token&&!finished;
   const matches=()=>alive()&&player?.getVideoData?.()?.video_id===video()?.videoId;
   readyTimer=setTimeout(()=>{if(alive()&&!ready)pauseForNetwork();},15000);
   player=new YT.Player(frame,{events:{
    onReady(event){if(!alive())return;clearTimeout(readyTimer);ready=true;player=event.target;player.loadVideoById(video().videoId);},
    onStateChange(event){
     if(!matches()||event.target.getPlayerState()!==event.data)return;
     if(event.data===1){playing=true;ended=false;failed.delete(index);status('재생 중');controls();}
     if(event.data===2){status('일시정지');playing=false;controls();}
     if(event.data===0&&!ended&&hasStarted){ended=true;playing=false;advance();}
     if(event.data===1)hasStarted=true;
    },
    onAutoplayBlocked(){if(alive()){status('계속 보려면 재생 버튼을 눌러주세요.');playing=false;controls();}},
    onError(event){if(!alive()||ended)return;const id=event.target.getVideoData?.()?.video_id;if(id&&id!==video()?.videoId)return;videoError(event.data);}
   }});
  }catch{if(active&&token===generation)pauseForNetwork();}
 }
 let hasStarted=false,lastVideo='';
 function requestVideo(){
  const id=video().videoId,repeat=lastVideo===id;lastVideo=id;
  hasStarted=false;playing=false;ended=false;describe();controls();
  if(!navigator.onLine){pauseForNetwork();return;}
  if(!ready||repeat)mount();else {try{player.loadVideoById(id);}catch{pauseForNetwork();}}
 }
 function select(i){
  if(i<0||i>=queue.length)return;
  index=i;alternative=0;finished=false;playing=false;ended=false;hasStarted=false;
  if(!current().videos.length){destroy();describe();controls();status('무대 영상 준비 중 · 다음 항목을 선택해 주세요.');return;}
  status('영상을 연결하고 있어요.');requestVideo();
 }
 function start(fresh){
  const d=getShow();
  if(fresh||!queue.length)queue=Show.session(d,getSongs());
  failed.clear();active=true;finished=false;
  $('mcWatchTitle').textContent=d.title;$('mcWatch').hidden=false;$('mcResult').hidden=true;
  const i=nextPlayable(0,1);if(i===queue.length){finish();return;}select(i);$('mcWatchTitle').focus();
 }
 function summary(d,songs){
  const rows=Show.rows(d),hidden=rows.filter(r=>r.kind==='hidden').length,vcr=rows.filter(r=>r.kind==='vcr').length;
  const connected=rows.filter(r=>r.kind==='song'&&Show.media.performances[r.id]?.length).length;
  let problem='';try{Show.session(d,songs,()=>0.5);}catch(e){problem=e.message;}
  $('mcCoverage').textContent=problem||('지정곡 '+(12-hidden)+'곡 중 무대 연결 '+connected+'곡 · 히든 스테이지 '+hidden+'개 · VCR '+vcr+'개'+(!connected&&!hidden&&!vcr?' · 연결된 영상이 없어요.':''));
  $('mcStart').disabled=!!problem||!connected&&!hidden&&!vcr;
 }
 root.addEventListener('click',event=>{
  const b=event.target.closest('button');if(!b)return;
  if(b.dataset.queue!==undefined){select(Number(b.dataset.queue));return;}
  switch(b.dataset.watch){
   case 'start':try{start(true);}catch(e){status(e.message);}break;
   case 'same':start(false);break;case 'redraw':start(true);break;
   case 'prev':case 'next':{const now=Date.now();if(now-lastMove<250)return;lastMove=now;const step=b.dataset.watch==='next'?1:-1;select(nextPlayable(index+step,step));break;}
   case 'resume':if(ready&&!finished&&video())player.playVideo();else if(!finished&&current()?.videos.length)select(index);break;
   case 'poster':close();$('mcResult').hidden=false;$('mcResultTitle').focus();break;
   case 'edit':close();$('mcResult').hidden=false;edit();break;
  }
 });
 window.addEventListener('pagehide',()=>{if(active){close();$('mcResult').hidden=false;}});
 window.addEventListener('offline',()=>{if(active&&!finished)pauseForNetwork();});
 return {summary,close};
};
