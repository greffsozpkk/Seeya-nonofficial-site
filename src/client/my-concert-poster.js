'use strict';
const {SECTIONS,chars,count}=require('../shared/my-concert');
const Show=require('../shared/my-concert-show');
function wrap(ctx,text,width){const lines=[];let line='';for(const ch of chars(text)){if(line&&ctx.measureText(line+ch).width>width){lines.push(line);line='';}line+=ch;}if(line)lines.push(line);return lines;}
function layout(ctx,d,songs){
 const byId=new Map(songs.map(s=>[s.id,s]));let size=34,groups,total=0;
 for(;size>=12;size--){
  ctx.font=`${size}px "Passport Dodum", sans-serif`;
  groups=SECTIONS.map(section=>({section,rows:d.sections[section.id].map(id=>{const song=Show.isHidden(id)?Show.songInfo(id,songs):byId.get(id);if(!song)throw Error('곡 정보를 다시 불러와 주세요.');const text=song.title+(song.artistType==='solo'?'  /  '+song.artistNames.join(' · '):'');const lines=wrap(ctx,text,822);return {song,lines,height:Math.max(44,lines.length*(size*1.28)+14)};})}));
  total=groups.reduce((n,g)=>n+42+g.rows.reduce((v,r)=>v+r.height,0)+16,0);if(total<=825+Math.max(0,count(d)-12)*62)break;
 }
 if(total>825+Math.max(0,count(d)-12)*62)throw Error('글자가 너무 길어 포스터에 담지 못했어요. 곡 정보를 확인해 주세요.');
 return {size,groups,total};
}
async function fonts(){if(!document.fonts)return;await Promise.race([Promise.allSettled([document.fonts.load('30px "Passport Dodum"'),document.fonts.load('60px "Passport Batang"')]),new Promise(r=>setTimeout(r,2500))]);}
function draw(canvas,d,songs,logo){
 canvas.width=1080;const tracksHeight=Math.max(0,count(d)-12)*62,addedHeight=(d.vcrs?.length||0)*80+tracksHeight;canvas.height=1350+addedHeight;const ctx=canvas.getContext('2d');if(!ctx)throw Error('이 브라우저에서 이미지 만들기를 사용할 수 없어요.');
 const night=d.theme==='night',ink=night?'#fff3eb':'#3d2834',muted=night?'#dfbdcb':'#855d70',line=night?'#735066':'#d8a2b6';
 const bg=ctx.createLinearGradient(0,0,1080,canvas.height);bg.addColorStop(0,night?'#342337':'#fff7ee');bg.addColorStop(1,night?'#171624':'#f6dbe4');ctx.fillStyle=bg;ctx.fillRect(0,0,1080,canvas.height);
 if(night){for(const [x,color] of [[220,'#b96a8350'],[850,'#a8a1cc35']]){const g=ctx.createRadialGradient(x,20,1,x,20,630);g.addColorStop(0,color);g.addColorStop(1,'#00000000');ctx.fillStyle=g;ctx.fillRect(0,0,1080,canvas.height);}}
 ctx.strokeStyle=line;ctx.lineWidth=2;ctx.strokeRect(34,34,1012,1282+addedHeight);ctx.strokeRect(46,46,988,1258+addedHeight);
 ctx.fillStyle=muted;ctx.textAlign='left';ctx.font='19px "Passport Dodum",sans-serif';ctx.fillText('A STAGE MADE BY YOU',86,100);ctx.textAlign='right';ctx.fillText('ADMIT ONE · '+count(d)+' SONGS',994,100);
 ctx.textAlign='left';ctx.fillStyle=ink;ctx.font='bold 46px "Passport Batang",serif';if(logo){ctx.save();if(night)ctx.filter='brightness(0) invert(1)';const h=52;ctx.drawImage(logo,86,121,h*logo.naturalWidth/logo.naturalHeight,h);ctx.restore();}
 let titleSize=66,titleLines;do{ctx.font=`${titleSize}px "Passport Batang",serif`;titleLines=wrap(ctx,d.title.trim(),908);if(titleLines.length<=2)break;titleSize-=2;}while(titleSize>30);
 ctx.font=`${titleSize}px "Passport Batang",serif`;titleLines.forEach((s,i)=>ctx.fillText(s,86,237+i*(titleSize*1.12)));
 let top=237+(titleLines.length-1)*titleSize*1.12+36;
 if(d.planner.trim()){ctx.fillStyle=muted;ctx.font='22px "Passport Dodum",sans-serif';ctx.fillText('기획 · '+d.planner.trim(),86,top);top+=27;}
 const start=Math.max(335,top+18);ctx.setLineDash([5,7]);ctx.strokeStyle=line;ctx.beginPath();ctx.moveTo(65,start-18);ctx.lineTo(1015,start-18);ctx.stroke();ctx.setLineDash([]);
 const l=layout(ctx,d,songs);let y=start,number=1;const available=1202+tracksHeight-start,scale=Math.min(1,available/l.total);ctx.save();ctx.translate(0,start);ctx.scale(1,scale);y=0;
 const bounds=[];
 for(const g of l.groups){ctx.fillStyle=muted;ctx.font='bold 19px "Passport Dodum",sans-serif';ctx.fillText(g.section.name,88,y+25);ctx.textAlign='right';ctx.fillText(String(g.rows.length).padStart(2,'0')+' TRACK'+(g.rows.length>1?'S':''),990,y+25);ctx.textAlign='left';y+=42;
  for(const row of g.rows){ctx.fillStyle=muted;ctx.font='20px "Passport Dodum",sans-serif';ctx.fillText(String(number++).padStart(2,'0'),90,y+l.size);ctx.fillStyle=ink;ctx.font=`${l.size}px "Passport Dodum",sans-serif`;row.lines.forEach((s,i)=>ctx.fillText(s,157,y+l.size+i*l.size*1.28));bounds.push({id:row.song.id,bottom:start+(y+row.height)*scale,lines:row.lines});y+=row.height;
   for(const vcr of d.vcrs||[]){if(vcr.after===number-1){ctx.fillStyle=muted;ctx.font='26px "Passport Dodum",sans-serif';ctx.fillText(Show.vcrLabel,157,y+40);y+=80/scale;}}
  }
  y+=16;
 }
 ctx.restore();ctx.strokeStyle=line;ctx.beginPath();ctx.moveTo(86,1215+addedHeight);ctx.lineTo(994,1215+addedHeight);ctx.stroke();ctx.fillStyle=muted;ctx.textAlign='center';ctx.font='17px "Passport Dodum",sans-serif';ctx.fillText('팬이 만든 가상 콘서트입니다. 실제 공연 안내가 아닙니다.',540,1250+addedHeight);ctx.font='16px sans-serif';ctx.fillText('SEEYA ARCHIVE  ·  seeya-fanpage.com',540,1281+addedHeight);
 return {width:1080,height:canvas.height,rows:bounds,fontSize:l.size};
}
let logoPromise;
function logoImage(){
 if(!logoPromise)logoPromise=new Promise((resolve,reject)=>{const image=new Image();image.onload=()=>resolve(image);image.onerror=()=>{logoPromise=null;reject(Error('로고를 불러오지 못했어요. 다시 시도해 주세요.'));};image.src=require('../data/passport-brand.json').logo;});
 return logoPromise;
}
async function render(canvas,d,songs){const [,logo]=await Promise.all([fonts(),logoImage()]);return draw(canvas,d,songs,logo);}
function png(canvas){return new Promise((resolve,reject)=>{try{canvas.toBlob(b=>b?resolve(b):reject(Error('이미지를 만들지 못했어요. 다시 시도해 주세요.')),'image/png');}catch{reject(Error('이미지 저장을 다시 시도해 주세요.'));}});}
module.exports={wrap,layout,draw,render,png};
