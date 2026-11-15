'use strict';
const songs=require('../data/our-stage-rhythm-songs.json'),youtube=require('./our-stage-youtube');
module.exports=function({root,esc,button,onReset,onStart}){
 let player=null,generation=0,ready=false,failed=false,readyTimer=0,armed=false,selected=songs[0],clock;
 const $=s=>root.querySelector(s),note=t=>{const n=$('#songStatus');if(n)n.textContent=t;};
 function markup(){const c=selected.chart;return `<section class="rhythm-song"><label class="song-select">노래<select id="rhythmSong">${songs.map(s=>`<option value="${s.id}" ${s===selected?'selected':''}>${esc(s.title)}</option>`).join('')}</select></label><p class="song-chart-info">${c.notes.length}노트 · 약 ${Math.ceil((c.notes.at(-1)-c.startMs)/1000)}초 · 시작하면 연주 구간으로 바로 이동해요.</p><div class="rhythm-youtube"><div id="rhythmYouTube"></div></div><p id="songStatus" role="status">공식 플레이어를 준비하고 있어요.</p><details class="song-help"><summary>재생 도움말 · 원본 영상</summary><a id="rhythmOriginal" href="https://www.youtube.com/watch?v=${selected.youtubeId}" target="_blank" rel="noopener noreferrer">YouTube에서 열기 ↗</a>${button('플레이어 다시 연결','mini-song-retry','','quiet')}<p class="private-note">자동 재생이 막히면 영상의 재생 버튼을 눌러주세요. 광고·버퍼링 중에는 기다려 주세요. 재생 위치나 속도를 바꾸면 이번 연주를 처음부터 다시 시작할 수 있어요.</p></details></section>`;}
 function destroy(){generation++;clearTimeout(readyTimer);ready=false;failed=false;armed=false;clock=null;try{player?.destroy();}catch{}player=null;}
 function interrupt(message){armed=false;clock?.reset();try{player?.pauseVideo();}catch{}onReset(message);}
 async function mount(){destroy();const own=generation;try{await youtube();if(own!==generation||!$('#rhythmYouTube'))return;
  readyTimer=setTimeout(()=>{if(own===generation&&!ready){failed=true;note('연결이 지연되고 있어요. 다시 연결하거나 기본 박자를 선택해 주세요.');if($('.song-help'))$('.song-help').open=true;}},15000);
  player=new window.YT.Player('rhythmYouTube',{width:'100%',height:220,videoId:selected.youtubeId,playerVars:{playsinline:1,controls:1,start:Math.floor(selected.chart.startMs/1000),origin:location.origin},events:{
   onReady:e=>{if(own!==generation)return;clearTimeout(readyTimer);ready=true;failed=false;e.target.getIframe().title=selected.title+' · YouTube 공식 플레이어';const btn=$('[data-action="mini-song-start"]');if(btn)btn.disabled=false;note('준비됐어요. 아래 ‘노래와 함께 시작’을 눌러주세요.');},
   onStateChange:e=>{if(own!==generation)return;if(e.data===1){note('노래에 맞춰 연주 중이에요.');if(!armed)onStart();}else if(e.data===2||e.data===3)note(armed?'일시 정지 · 다시 재생하면 이어집니다.':'시작 버튼을 누르면 카운트다운 뒤 노트가 나와요.');else if(e.data===0&&armed)interrupt('영상이 끝났어요. 처음부터 다시 도전할 수 있어요.');},
   onAutoplayBlocked:()=>{if(own===generation)note('영상 안의 재생 버튼을 눌러주세요. 재생되면 카운트다운이 시작돼요.');},
   onPlaybackRateChange:e=>{if(own===generation&&armed&&e.data!==1)interrupt('재생 속도가 바뀌었어요. 기본 속도로 다시 시작해 주세요.');},
   onError:()=>{if(own!==generation)return;clearTimeout(readyTimer);failed=true;interrupt('영상을 재생하지 못했어요. 다른 곡이나 기본 박자를 선택해 주세요.');note('삽입 제한·삭제 또는 연결 오류입니다. 원본 링크에서 확인할 수 있어요.');if($('.song-help'))$('.song-help').open=true;}
  }});
 }catch{if(own===generation){failed=true;note('플레이어를 불러오지 못했어요. 다시 연결하거나 기본 박자로 도전해 주세요.');if($('.song-help'))$('.song-help').open=true;}}}
 function start(epoch){if(!ready||failed)return false;clock=require('../shared/our-stage-song-clock')(selected.chart);clock.arm(epoch);armed=true;try{player.setPlaybackRate(1);player.loadVideoById({videoId:selected.youtubeId,startSeconds:selected.chart.startMs/1000,endSeconds:(selected.chart.notes.at(-1)+1500)/1000});player.playVideo();return true;}catch{interrupt('재생을 시작하지 못했어요. 다시 연결해 주세요.');return false;}}
 function sample(){if(!ready||failed||!player||!armed||!clock)return {playing:false,now:null};try{const s=clock.sample(player.getCurrentTime(),player.getPlayerState()===1,performance.now(),player.getPlaybackRate());if(s.jump)interrupt('재생 위치가 바뀌었어요. 처음부터 다시 시작해 주세요.');return s;}catch{return {playing:false,now:null};}}
 function select(id){const found=songs.find(s=>s.id===id);if(found)selected=found;}
 return {markup,mount,destroy,sample,select,start,isReady:()=>ready&&!failed,current:()=>selected};
};
