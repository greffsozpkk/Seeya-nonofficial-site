'use strict';
const songs=require('../data/our-stage-rhythm-songs.json');
let apiPromise;
function youtube(){
 if(window.YT?.Player)return Promise.resolve();
 if(!apiPromise)apiPromise=new Promise((resolve,reject)=>{
  const previous=window.onYouTubeIframeAPIReady;
  const timer=setTimeout(()=>{apiPromise=null;reject(Error('timeout'));},15000);
  window.onYouTubeIframeAPIReady=()=>{clearTimeout(timer);try{previous?.();}finally{resolve();}};
  let script=document.querySelector('script[src="https://www.youtube.com/iframe_api"]');
  if(!script){script=document.createElement('script');script.src='https://www.youtube.com/iframe_api';document.head.append(script);}
  script.addEventListener('error',()=>{clearTimeout(timer);script.remove();apiPromise=null;reject(Error('network'));},{once:true});
 });return apiPromise;
}
module.exports=function({root,esc,button,onReset}){
 let player=null,generation=0,ready=false,failed=false,readyTimer=0,selected=songs[0],clock=require('../shared/our-stage-song-clock')();
 const $=s=>root.querySelector(s),note=t=>{const n=$('#songStatus');if(n)n.textContent=t;};
 function markup(){return `<section class="rhythm-song"><label class="song-select">노래<select id="rhythmSong">${songs.map(s=>`<option value="${s.id}" ${s===selected?'selected':''}>${esc(s.title)}</option>`).join('')}</select></label><div class="rhythm-youtube"><div id="rhythmYouTube"></div></div><p id="songStatus" role="status">공식 플레이어를 불러오는 중이에요.</p><details class="song-help"><summary>이용 방법 · 원본 영상 · 다시 연결</summary><a id="rhythmOriginal" href="https://www.youtube.com/watch?v=${selected.youtubeId}" target="_blank" rel="noopener noreferrer">YouTube에서 열기 ↗</a>${button('플레이어 다시 연결','mini-song-retry','','quiet')}<p class="private-note">영상을 재생하고 일정한 박자가 들리는 구간에서 네 번 눌러주세요. 직접 맞춘 템포로 8박자를 이어가요. 광고가 나오면 본 영상이 시작된 뒤 준비해 주세요.</p></details></section>`;}
 function destroy(){generation++;clearTimeout(readyTimer);ready=false;failed=false;clock=require('../shared/our-stage-song-clock')();if(player){try{player.destroy();}catch{}player=null;}}
 async function mount(){destroy();const own=generation;try{await youtube();if(own!==generation||!$('#rhythmYouTube'))return;
  player=new window.YT.Player('rhythmYouTube',{width:'100%',height:'220',videoId:selected.youtubeId,playerVars:{playsinline:1,controls:1,origin:location.origin},events:{
   onReady:e=>{if(own!==generation)return;clearTimeout(readyTimer);failed=false;ready=true;e.target.getIframe().title=selected.title+' · YouTube 공식 플레이어';note('영상의 재생 버튼을 누른 뒤 아래에서 박자를 준비해 주세요.');},
   onStateChange:e=>{if(own!==generation)return;if(e.data===0){clock.reset();onReset('영상이 끝났어요. 다시 재생하거나 다른 곡을 골라주세요.');}else if(e.data===2||e.data===3)note('영상이 멈춰 있어요. 다시 재생하면 박자도 이어집니다.');else if(e.data===1)note('재생 중 · 노래를 들으며 박자를 맞춰주세요.');},
   onPlaybackRateChange:()=>{if(own!==generation)return;clock.reset();onReset('재생 속도가 바뀌었어요. 박자를 다시 네 번 맞춰주세요.');},
   onError:()=>{if(own!==generation)return;clearTimeout(readyTimer);failed=true;clock.reset();onReset('영상을 재생할 수 없어요. 다른 곡이나 기본 박자를 선택해 주세요.');note('삽입 제한·삭제 또는 연결 문제로 재생하지 못했어요. 원본 링크에서도 확인할 수 있어요.');if($('.song-help'))$('.song-help').open=true;}
  }});readyTimer=setTimeout(()=>{if(own===generation&&!ready){failed=true;note('플레이어 연결이 지연되고 있어요. 다시 연결하거나 기본 박자를 선택해 주세요.');if($('.song-help'))$('.song-help').open=true;}},15000);
 }catch{if(own===generation){failed=true;note('플레이어를 불러오지 못했어요. 다시 연결하거나 기본 박자로 도전해 주세요.');}}}
 function sample(){if(!ready||failed||!player)return {playing:false,now:null};try{const s=clock.sample(player.getCurrentTime(),player.getPlayerState()===1,performance.now(),player.getPlaybackRate());if(s.jump)onReset('재생 위치가 바뀌었어요. 새 구간에서 박자를 다시 네 번 맞춰주세요.');return s;}catch{return {playing:false,now:null};}}
 function tap(){const s=sample();if(!s.playing){note('먼저 YouTube 영상의 재생 버튼을 눌러주세요.');return null;}return clock.tap(player.getCurrentTime());}
 function select(id){const found=songs.find(s=>s.id===id);if(!found)return;selected=found;}
 return {markup,mount,destroy,sample,tap,select,begin:t=>clock.begin(t)};
};
