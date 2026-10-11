'use strict';
const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
// All edits use the same 1080-wide coordinates as the exported canvas.
function movePhoto(v,dx,dy,h){return {photoX:clamp(v.photoX+dx/1080*100,0,100),photoY:clamp(v.photoY+dy/h*100,0,100)};}
function moveMotto(v,m,dx,dy,h){return {mottoX:clamp(v.mottoX+dx/Math.max(1,952-m.width)*100,0,100),mottoY:clamp(v.mottoY+dy/Math.max(1,h-190-m.height)*100,0,100)};}
function resizePhoto(v,r,corner,dx,dy,h){
 const sx=corner.includes('w')?-1:1,sy=corner.includes('n')?-1:1;
 const ratio=clamp(1+(sx*dx*r.width+sy*dy*r.height)/(r.width*r.width+r.height*r.height),10/v.photoSize,200/v.photoSize);
 const width=r.width*ratio,height=r.height*ratio;
 const cx=r.x+r.width/2+sx*(width-r.width)/2,cy=r.y+r.height/2+sy*(height-r.height)/2;
 return {photoSize:v.photoSize*ratio,photoX:clamp(cx/1080*100,0,100),photoY:clamp(cy/h*100,0,100)};
}
module.exports={movePhoto,moveMotto,resizePhoto};
