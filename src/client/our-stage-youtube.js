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
