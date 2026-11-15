'use strict';
const youtube=require('./our-stage-youtube');
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
