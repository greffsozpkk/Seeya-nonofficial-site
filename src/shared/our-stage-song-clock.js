'use strict';
// A user-set beat grid follows YouTube media time, not a guessed song BPM.
module.exports=function(){
 let last=null,taps=[],target=null,epoch=null,tempo=null;
 function reset(){taps=[];target=epoch=tempo=null;}
 function sample(media,playing,wall,rate=1){
  if(!Number.isFinite(media)||media<0)return {playing:false,now:null};
  const jump=last&&Math.abs(media-last.media-(last.playing?(wall-last.wall)/1000*last.rate:0))>.7;
  if(jump)reset();
  if(!playing&&taps.length&&target===null)taps=[];
  last={media,wall,playing,rate};
  return {jump:Boolean(jump),playing,now:playing&&target!==null?Math.round(epoch+(media-target)*1000):null};
 }
 function tap(media){
  if(!last?.playing||target!==null)return null;
  if(taps.length&&media-taps[taps.length-1]<.15)return null;
  taps.push(media);
  if(taps.length<4)return {count:taps.length};
  const gaps=taps.slice(1).map((t,i)=>(t-taps[i])*1000),avg=gaps.reduce((a,b)=>a+b,0)/3;
  if(avg<400||avg>1500||gaps.some(x=>Math.abs(x-avg)>avg*.3)){taps=[];return {retry:true};}
  tempo=Math.round(avg);return {count:4,tempo};
 }
 function begin(beatStart){epoch=beatStart;target=taps[3]+4*tempo/1000;}
 return {sample,tap,begin,reset};
};
