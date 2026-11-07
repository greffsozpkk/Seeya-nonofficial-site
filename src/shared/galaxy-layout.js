'use strict';
// A reproducible, curved cloud rather than rows. Small light points can cluster; zoom reveals the letters.
function random(seed=742){return()=>((seed=(Math.imul(seed,1664525)+1013904223)>>>0)/4294967296);}
function spine(t){return .79-.6*t+.065*Math.sin(t*Math.PI*2);}
// Vary the thickness along the curved core. The wider halo fades into a
// sparse field. Reject samples outside the sky to avoid lines along its edges.
function scatter(rand) {
 for (;;) {
  const layer=rand();
  if(layer<.12)return {x:rand(),y:rand()};
  const x=rand()<.48?(rand()+rand())/2:rand();
  const mid=Math.sin(Math.PI*x);
  const width=.05+.075*mid+.045*Math.sin(2.2*Math.PI*x+.6)**2;
  const gaussian=Math.sqrt(-2*Math.log(1-rand()))*Math.cos(2*Math.PI*rand());
  const y=spine(x)+gaussian*width*(layer<.46?1.85:.62);
  if(y>0&&y<1)return {x,y};
 }
}

function layout(letters,width,height){
 const field=random(927),points=[],normalized=[];
 const left=22,top=48,usableWidth=width-left*2,usableHeight=height-top*2;
 for(const letter of letters){
  const hasPlace=Number.isFinite(letter.place)&&letter.place>=.05&&letter.place<=.95;
  let seed=19;
  for(const char of letter.id)seed=(Math.imul(seed,31)+char.charCodeAt(0))>>>0;
  const personal=random(seed);
  const origin=hasPlace
   ? {x:letter.place,y:spine(letter.place)+(personal()+personal()+personal()-1.5)*.04}
   : scatter(field);
  let {x,y}=origin;
  for(let attempt=0;attempt<45;attempt++){
   if(!normalized.some(other=>Math.abs(x-other.x)<.007&&Math.abs(y-other.y)<.012))break;
   const dx=origin.x+(personal()-.5)*.045;
   const dy=origin.y+(personal()-.5)*.085;
   if(dx>0 && dx<1 && dy>0 && dy<1){x=dx;y=dy;}
  }
  normalized.push({x,y});
  points.push({x:left+x*usableWidth,y:top+y*usableHeight});
 }
 return points;
}
module.exports={random,spine,layout};
