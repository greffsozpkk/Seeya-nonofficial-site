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
