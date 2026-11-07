'use strict';
module.exports=function camera(viewport,scene){
 const label=document.getElementById('glZoomLevel'),plus=document.getElementById('glZoomIn'),minus=document.getElementById('glZoomOut');
 let onZoom=null, reportedZoom=null;
 let zoom=1,x=0,y=0,gesture=null,blockedUntil=0;const pointers=new Map();
 const bounds=()=>({width:viewport.clientWidth,height:viewport.clientHeight});
 function draw(){const b=bounds();x=Math.max(b.width*(1-zoom),Math.min(0,x));y=Math.max(b.height*(1-zoom),Math.min(0,y));scene.style.transform=`translate(${x}px,${y}px) scale(${zoom})`;label.textContent=Math.round(zoom*100)+'%';plus.disabled=zoom>=8;minus.disabled=zoom<=1;viewport.classList.toggle('gl-zoomed',zoom>1);
  scene.style.setProperty('--gl-marker-scale',String(1/Math.sqrt(zoom)));
  if(!pointers.size && reportedZoom!==zoom){reportedZoom=zoom;onZoom?.(zoom);}}
 function zoomAt(next,px,py){next=Math.max(1,Math.min(8,next));const ratio=next/zoom;x=px-(px-x)*ratio;y=py-(py-y)*ratio;zoom=next;draw();}
 function centerZoom(factor){const b=bounds();zoomAt(zoom*factor,b.width/2,b.height/2);}
 function reset(){zoom=1;x=0;y=0;gesture=null;pointers.clear();draw();}
 plus.onclick=()=>centerZoom(1.4);minus.onclick=()=>centerZoom(1/1.4);document.getElementById('glZoomReset').onclick=reset;
 viewport.addEventListener('wheel',e=>{if(e.target.closest('.gl-controls'))return;e.preventDefault();const r=viewport.getBoundingClientRect();zoomAt(zoom*Math.exp(-e.deltaY*.002),e.clientX-r.left,e.clientY-r.top);},{passive:false});
 function snapshot(){const p=[...pointers.values()],r=viewport.getBoundingClientRect();if(!p.length){gesture=null;return;}const mid=p.length>1?{x:(p[0].x+p[1].x)/2,y:(p[0].y+p[1].y)/2}:p[0];gesture={px:mid.x-r.left,py:mid.y-r.top,x,y,zoom,distance:p.length>1?Math.hypot(p[0].x-p[1].x,p[0].y-p[1].y):0};}
 viewport.addEventListener('pointerdown',e=>{if(e.target.closest('.gl-controls')||e.button>0)return;pointers.set(e.pointerId,{x:e.clientX,y:e.clientY});e.target.setPointerCapture(e.pointerId);snapshot();if(pointers.size>1)blockedUntil=Date.now()+500;});
 viewport.addEventListener('pointermove',e=>{if(!pointers.has(e.pointerId)||!gesture)return;pointers.set(e.pointerId,{x:e.clientX,y:e.clientY});const p=[...pointers.values()],r=viewport.getBoundingClientRect();const mid=p.length>1?{x:(p[0].x+p[1].x)/2,y:(p[0].y+p[1].y)/2}:p[0],px=mid.x-r.left,py=mid.y-r.top;
  if(p.length>1&&gesture.distance>0){zoom=Math.max(1,Math.min(8,gesture.zoom*Math.hypot(p[0].x-p[1].x,p[0].y-p[1].y)/gesture.distance));blockedUntil=Date.now()+500;}else if(Math.hypot(px-gesture.px,py-gesture.py)>5)blockedUntil=Date.now()+500;
  const ratio=zoom/gesture.zoom;x=px-(gesture.px-gesture.x)*ratio;y=py-(gesture.py-gesture.y)*ratio;draw();
 });
 function end(e){if(!pointers.has(e.pointerId))return;if(pointers.size>1)blockedUntil=Date.now()+500;pointers.delete(e.pointerId);snapshot();draw();}
 viewport.addEventListener('pointerup',end);viewport.addEventListener('pointercancel',end);viewport.addEventListener('lostpointercapture',end);
 viewport.addEventListener('click',e=>{if(!e.target.closest('.gl-controls')&&Date.now()<blockedUntil&&e.detail!==0){e.preventDefault();e.stopImmediatePropagation();}},true);
 viewport.addEventListener('keydown',e=>{if(e.target!==viewport)return;if(e.key==='+'||e.key==='='){e.preventDefault();centerZoom(1.4);}else if(e.key==='-'){e.preventDefault();centerZoom(1/1.4);}else if(e.key==='0'){e.preventDefault();reset();}else if(['ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(e.key)){e.preventDefault();x+=e.key==='ArrowLeft'?60:e.key==='ArrowRight'?-60:0;y+=e.key==='ArrowUp'?60:e.key==='ArrowDown'?-60:0;draw();}});
 scene.addEventListener('focusin',e=>{if(!e.target.matches('.gl-star:focus-visible'))return;const b=bounds();x=b.width/2-parseFloat(e.target.style.left)*zoom;y=b.height/2-parseFloat(e.target.style.top)*zoom;draw();});
 draw();return{reset,onZoom(callback){onZoom=callback;},get zoom(){return zoom;},locate(px,py,level=3){zoom=level;const b=bounds();x=b.width/2-px*zoom;y=b.height/2-py*zoom;draw();}};
};
