'use strict';
const {SECTIONS,chars,count}=require('../shared/my-concert');
const Show=require('../shared/my-concert-show');
const {themes,fonts,backdrop}=require('../shared/my-concert-design');
const W=1080,H=1350,metaFont='"Passport Dodum", sans-serif';

function wrap(ctx,text,width){
 const lines=[];let line='';
 for(const word of text.trim().split(/\s+/)){
  const next=line?line+' '+word:word;
  if(ctx.measureText(next).width<=width){line=next;continue;}
  if(line)lines.push(line);
  line='';
  if(ctx.measureText(word).width<=width || /[A-Za-z]/.test(word)){line=word;continue;}
  for(const ch of chars(word)){
   if(line && ctx.measureText(line+ch).width>width){lines.push(line);line='';}
   line+=ch;
  }
 }
 if(line)lines.push(line);
 return lines;
}

function tracks(d,songs){
 const interruptions=new Map();
 for(const v of d.vcrs||[])interruptions.set(v.after,(interruptions.get(v.after)||0)+1);
 let number=0;
 return SECTIONS.flatMap(section=>d.sections[section.id].map((id,i)=>{
  const song=Show.songInfo(id,songs);
  const feature=song.title.match(/\s*\((feat\.\s*.+)\)\s*$/i);
  const text=Show.isHidden(id)?'히든 스테이지':song.title.slice(0,feature?.index??song.title.length);
  const credit=[feature?.[1],song.artistType==='solo'?song.artistNames.join(' · '):''].filter(Boolean).join(' / ');
  return {id,text,credit,section:i===0?section.name:'',number:++number,vcr:interruptions.get(number)||0};
 }));
}

// Keep each section heading and its first song together. Choose the largest size
// that fits, retaining one column when a second column offers little benefit.
function layout(ctx,entries,area,family,{long=false,sparse=entries.length<=6}={}){
 let best;
 for(const columns of long||sparse?[1]:[1,2]){
  const width=(area.right-area.left-(columns-1)*42)/columns*(sparse?.82:1);
  for(let size=long||sparse?40:36;size>=(long?40:8);size--){
   ctx.font=size+'px '+family;
   const step=Math.ceil(size*1.28), indent=size*1.65;
   const rows=entries.map((row,i)=>{
    ctx.font=size+'px '+family;
    const lines=wrap(ctx,row.text,width-indent);
    const creditSize=Math.max(9,Math.round(size*.75)),creditStep=Math.ceil(creditSize*1.22);
    ctx.font=creditSize+'px '+family;
    const credits=row.credit?wrap(ctx,row.credit,width-indent):[];
    const gap=row.section&&i>0?(sparse?38:long?30:0):0;
    const heading=row.section?step:0;
    const height=gap+heading+Math.max(lines.length*step+credits.length*creditStep,row.vcr?step*1.65:0)+Math.ceil(size*(long?.35:.25));
    return {...row,lines,credits,creditSize,creditStep,height,heading,gap};
   });
   const total=rows.reduce((n,r)=>n+r.height,0);
   let split=rows.length,tallest=total;
   if(columns===2){
    let left=0;
    for(let i=1;i<rows.length;i++){
     left+=rows[i-1].height;
     const h=Math.max(left,total-left);
     if(h<tallest){split=i;tallest=h;}
    }
   }
   if(!long&&tallest>area.bottom-area.top)continue;
   if(!best || size>best.size+2)best={size,step,indent,width,usedHeight:tallest,columns:columns===1?[rows]:[rows.slice(0,split),rows.slice(split)]};
   break;
  }
 }
 if(!best)throw Error('글자가 포스터 영역을 넘었어요. 제목 길이를 확인해 주세요.');
 if(sparse){
  let measured=240;
  for(const row of best.columns[0]){
   ctx.font=best.size+'px '+family;
   for(const line of row.lines)measured=Math.max(measured,best.indent+ctx.measureText(line).width);
   ctx.font=row.creditSize+'px '+family;
   for(const line of row.credits)measured=Math.max(measured,best.indent+ctx.measureText(line).width);
   ctx.font=Math.min(21,Math.round(best.size*.82))+'px '+metaFont;
   if(row.section)measured=Math.max(measured,ctx.measureText(row.section).width);
  }
  best.width=Math.min(best.width,Math.ceil(measured)+2);
 }
 return best;
}

// Extend only the quiet middle of the paper; keep header/footer art in proportion.
function paintBackground(ctx,image,height){
 if(height===H){ctx.drawImage(image,0,0,W,H);return;}
 const scale=image.naturalHeight/H,cut=650,band=90,extra=height-H;
 ctx.drawImage(image,0,0,image.naturalWidth,cut*scale,0,0,W,cut);
 ctx.drawImage(image,0,cut*scale,image.naturalWidth,band*scale,0,cut,W,band+extra);
 ctx.drawImage(image,0,(cut+band)*scale,image.naturalWidth,(H-cut-band)*scale,0,cut+band+extra,W,H-cut-band);
}

function draw(canvas,d,songs,logo,background){
 canvas.width=W;canvas.height=H;
 const ctx=canvas.getContext('2d');if(!ctx)throw Error('이 브라우저에서 이미지 만들기를 사용할 수 없어요.');
 const t=themes[d.theme]||themes.rose,family=(fonts[d.font]||fonts.dodum).family;
 const ink=t.dark?'#fff7f1':'#392c34', accent=t.dark?'#e4cee3':'#75495e';
 const entries=tracks(d,songs),long=d.format==='long',sparse=entries.length<=6;
 let titleSize=entries.length>=20?46:60,lines;
 do{
  ctx.font='bold '+titleSize+'px '+family;lines=wrap(ctx,d.title.trim(),t.right-t.left);
  if(lines.length<=2)break;
  titleSize-=2;
 }while(titleSize>=30);
 const headingY=t.top+36+28+titleSize;
 const dividerY=headingY+(lines.length-1)*titleSize*1.12+(d.planner.trim()?35:0)+29;
 const top=dividerY+14;
 const fitted=layout(ctx,entries,{...t,top},family,{long,sparse}),bounds=[];
 const extra=long?Math.max(0,Math.ceil(top+fitted.usedHeight+24-t.bottom)):0;
 const height=H+extra,bottom=t.bottom+extra;
 canvas.height=height;
 if(background)paintBackground(ctx,background,height);
 else{
  const g=ctx.createLinearGradient(0,0,W,height);
  g.addColorStop(0,t.dark?'#342337':'#fff7ee');g.addColorStop(1,t.dark?'#171624':'#f6dbe4');
  ctx.fillStyle=g;ctx.fillRect(0,0,W,height);ctx.strokeStyle=t.dark?'#735066':'#d8a2b6';ctx.strokeRect(38,38,W-76,height-76);
 }
 const center=(t.left+t.right)/2,anchor=t.centered?center:t.left;
 ctx.textAlign=t.centered?'center':'left';ctx.fillStyle=accent;
 if(logo){
  const h=36,w=h*logo.naturalWidth/logo.naturalHeight;
  ctx.save();if(t.dark)ctx.filter='brightness(0) invert(1)';
  ctx.drawImage(logo,t.centered?center-w/2:anchor,t.top,w,h);ctx.restore();
 }
 ctx.font='bold '+titleSize+'px '+family;
 let y=headingY;
 ctx.fillStyle=ink;
 for(const line of lines){ctx.fillText(line,anchor,y,t.right-t.left);y+=titleSize*1.12;}
 y-=titleSize*1.12;
 if(d.planner.trim()){y+=35;ctx.font='24px '+family;ctx.fillStyle=accent;ctx.fillText('기획 · '+d.planner.trim(),anchor,y);}
 y+=29;ctx.strokeStyle=accent;ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(t.left,y);ctx.lineTo(t.right,y);ctx.stroke();
 const {size,step,indent,width}=fitted;
 ctx.textAlign='left';
 fitted.columns.forEach((rows,col)=>{
  const x=sparse?center-width/2:t.left+col*(width+42);
  let rowY=top+(sparse?Math.min(70,Math.max(0,(bottom-top-fitted.usedHeight)/3)):0);
  for(const r of rows){
   let base=rowY+r.gap;
   if(r.section){
    ctx.fillStyle=accent;ctx.font=Math.min(21,Math.round(size*.82))+'px '+metaFont;
    ctx.fillText(r.section,x,base+step*.78);base+=r.heading;
   }
   ctx.fillStyle=accent;ctx.font=Math.round(size*.73)+'px '+metaFont;
   ctx.fillText(String(r.number).padStart(2,'0'),x,base+size);
   ctx.fillStyle=ink;ctx.font=size+'px '+family;
   r.lines.forEach((line,i)=>ctx.fillText(line,x+indent,base+size+i*step,width-indent));
   ctx.fillStyle=accent;ctx.font=r.creditSize+'px '+family;
   r.credits.forEach((line,i)=>ctx.fillText(line,x+indent,base+r.lines.length*step+r.creditSize+i*r.creditStep,width-indent));
   if(r.vcr){ctx.fillStyle=accent;ctx.font=Math.round(size*.53)+'px '+metaFont;ctx.fillText('VCR'+(r.vcr>1?'×'+r.vcr:''),x,base+size+step*.55,indent-2);}
   rowY+=r.height;bounds.push({id:r.id,lines:r.lines,left:x,width,bottom:rowY});
  }
 });
 ctx.font='17px '+metaFont;ctx.fillStyle=accent;ctx.textAlign=t.centered?'center':'left';
 ctx.fillText('SEEYA ARCHIVE   ·   '+count(d)+' SONGS   ·   팬이 만든 가상 콘서트',anchor,bottom+27);
 return {width:W,height,rows:bounds,fontSize:size,columns:fitted.columns.length,contentBottom:bottom};
}

const images=new Map();
function image(src){
 if(!images.has(src))images.set(src,new Promise((resolve,reject)=>{
  const im=new Image();im.onload=()=>resolve(im);im.onerror=()=>{images.delete(src);reject(Error('포스터 이미지를 불러오지 못했어요. 다시 시도해 주세요.'));};im.src=src;
 }));
 return images.get(src);
}
async function render(canvas,d,songs){
 const bg=backdrop(d.theme);
 const [logo,background]=await Promise.all([image(require('../data/passport-brand.json').logo),bg?image(bg):null,
  document.fonts?.load('30px '+(fonts[d.font]||fonts.dodum).family),
  document.fonts?.load('bold 60px '+(fonts[d.font]||fonts.dodum).family),document.fonts?.load('20px '+metaFont)]);
 return draw(canvas,d,songs,logo,background);
}
function png(canvas){return new Promise((resolve,reject)=>{try{canvas.toBlob(b=>b?resolve(b):reject(Error('이미지를 만들지 못했어요. 다시 시도해 주세요.')),'image/png');}catch{reject(Error('이미지 저장을 다시 시도해 주세요.'));}});}
module.exports={wrap,layout,draw,render,png};
