'use strict';
// Stored chart timestamps use the selected official video's media timeline.
module.exports=function(chart){
 let last=null,epoch=null,waiting=false;
 function reset(){last=null;epoch=null;waiting=false;}
 function arm(beatStart){reset();epoch=beatStart;waiting=true;}
 function sample(media,playing,wall,rate=1){
  if(!Number.isFinite(media)||media<0||epoch===null)return {playing:false,now:null};
  const ms=media*1000;
  if(waiting){if(!playing)return {playing:false,now:null};if(ms<chart.startMs-3000||ms>chart.notes[0]-400){if(last&&wall-last.wall>10000){reset();return {playing:false,jump:true,now:null};}last??={wall};return {playing:false,preparing:true,now:null};}waiting=false;last=null;}
  const jump=last&&Math.abs(media-last.media-(last.playing?(wall-last.wall)/1000*last.rate:0))>.55;
  if(jump||rate!==1){reset();return {playing:false,jump:true,now:null};}
  last={media,wall,playing,rate};
  return {playing,now:playing?Math.round(epoch+ms-chart.notes[0]):null};
 }
 return {sample,arm,reset};
};
