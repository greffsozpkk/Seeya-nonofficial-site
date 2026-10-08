'use strict';
const assert=require('node:assert/strict'),zlib=require('node:zlib');
// Decode our non-interlaced RGB/RGBA PNGs using Node only. A valid canvas size
// alone missed the white bottom/right strips in the old 180/192 px exports.
module.exports=function checkIcon(bytes,label){
 const w=bytes.readUInt32BE(16),h=bytes.readUInt32BE(20),type=bytes[25];
 assert.equal(bytes[24],8,label+' bit depth');
 assert([2,6].includes(type),label+' must be RGB/RGBA');
 assert.equal(bytes[28],0,label+' interlace');
 const channels=type===2?3:4,stride=w*channels,chunks=[];
 for(let at=8;at<bytes.length;){const length=bytes.readUInt32BE(at),kind=bytes.toString('ascii',at+4,at+8);if(kind==='IDAT')chunks.push(bytes.subarray(at+8,at+8+length));at+=12+length;}
 const raw=zlib.inflateSync(Buffer.concat(chunks)),pixels=Buffer.alloc(stride*h);
 assert.equal(raw.length,(stride+1)*h,label+' scanlines');
 function paeth(a,b,c){const p=a+b-c,pa=Math.abs(p-a),pb=Math.abs(p-b),pc=Math.abs(p-c);return pa<=pb&&pa<=pc?a:pb<=pc?b:c;}
 for(let y=0;y<h;y++){
  const filter=raw[y*(stride+1)];assert(filter<=4,label+' PNG filter');
  for(let x=0;x<stride;x++){
   const i=y*stride+x,a=x>=channels?pixels[i-channels]:0,b=y?pixels[i-stride]:0,c=y&&x>=channels?pixels[i-stride-channels]:0;
   const delta=[0,a,b,Math.floor((a+b)/2),paeth(a,b,c)][filter];pixels[i]=(raw[y*(stride+1)+1+x]+delta)&255;
  }
 }
 const bg=[247,220,231];
 for(let y=0;y<h;y++)for(let x=0;x<w;x++){
  const i=(y*w+x)*channels;
  if(channels===4)assert.equal(pixels[i+3],255,label+' transparent pixel');
  // Full bleed on all four sides; no baked-in rounded mask or capture border.
  if(x<3||y<3||x>=w-3||y>=h-3)for(let c=0;c<3;c++)assert(Math.abs(pixels[i+c]-bg[c])<=1,label+' non-pink edge at '+x+','+y);
  // Keep every mark within the central 80% circle, safe for maskable launchers.
  if(Math.hypot(x+.5-w/2,y+.5-h/2)>w*.4)for(let c=0;c<3;c++)assert(Math.abs(pixels[i+c]-bg[c])<=1,label+' artwork outside safe area');
 }
};
