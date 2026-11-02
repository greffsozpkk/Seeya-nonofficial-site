'use strict';
const {SECTIONS,chars,count}=require('../shared/my-concert');
const Show=require('../shared/my-concert-show');
const {themes,fonts,backdrop}=require('../shared/my-concert-design');
const W=1080,H=1350,metaFont='"Passport Dodum", sans-serif';

function wrap(ctx,text,width){
 const lines=[];let line='';
 for(const ch of chars(text)){
  if(line && ctx.measureText(line+ch).width>width){lines.push(line);line='';}
  line+=ch;
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
  const text=song.title+(song.artistType==='solo'?'  /  '+song.artistNames.join(' · '):'');
  return {id,text,section:i===0?section.name:'',number:++number,vcr:interruptions.get(number)||0};
 }));
}

// Keep each section heading and its first song together. Choose the largest size
// that fits, retaining one column when a second column offers little benefit.
function layout(ctx,entries,area,family){
 let best;
 for(const columns of [1,2]){
  const width=(area.right-area.left-(columns-1)*42)/columns;
  for(let size=36;size>=10;size--){
   ctx.font=size+'px '+family;
   const step=Math.ceil(size*1.28), indent=size*1.65;
   const rows=entries.map(row=>{
    const lines=wrap(ctx,row.text,width-indent);
    const heading=row.section?step:0;
    const height=heading+Math.max(lines.length*step,row.vcr?step*1.65:0)+Math.ceil(size*.25);
    return {...row,lines,height,heading};
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
   if(tallest>area.bottom-area.top)continue;
   if(!best || size>best.size+2)best={size,step,indent,width,columns:columns===1?[rows]:[rows.slice(0,split),rows.slice(split)]};
   break;
  }
 }
 if(!best)throw Error('글자가 포스터 영역을 넘었어요. 제목 길이를 확인해 주세요.');
 return best;
}

function draw(canvas,d,songs,logo,background){
 canvas.width=W;canvas.height=H;
 const ctx=canvas.getContext('2d');if(!ctx)throw Error('이 브라우저에서 이미지 만들기를 사용할 수 없어요.');
 const t=themes[d.theme]||themes.rose,family=(fonts[d.font]||fonts.dodum).family;
 const ink=t.dark?'#fff7f1':'#392c34', accent=t.dark?'#e4cee3':'#75495e';
 if(background)ctx.drawImage(background,0,0,W,H);
 else{
  const g=ctx.createLinearGradient(0,0,W,H);
  g.addColorStop(0,t.dark?'#342337':'#fff7ee');g.addColorStop(1,t.dark?'#171624':'#f6dbe4');
  ctx.fillStyle=g;ctx.fillRect(0,0,W,H);ctx.strokeStyle=t.dark?'#735066':'#d8a2b6';ctx.strokeRect(38,38,W-76,H-76);
 }
 const center=(t.left+t.right)/2,anchor=t.centered?center:t.left;
 ctx.textAlign=t.centered?'center':'left';ctx.fillStyle=accent;
 if(logo){
  const h=36,w=h*logo.naturalWidth/logo.naturalHeight;
  ctx.save();if(t.dark)ctx.filter='brightness(0) invert(1)';
  ctx.drawImage(logo,t.centered?center-w/2:anchor,t.top,w,h);ctx.restore();
 }
 let titleSize=60,lines;
 do{
  ctx.font='bold '+titleSize+'px '+family;lines=wrap(ctx,d.title.trim(),t.right-t.left);
  if(lines.length<=2)break;
  titleSize-=2;
 }while(titleSize>=30);
 let y=t.top+36+28+titleSize;
 ctx.fillStyle=ink;
 for(const line of lines){ctx.fillText(line,anchor,y);y+=titleSize*1.12;}
 y-=titleSize*1.12;
 if(d.planner.trim()){y+=35;ctx.font='24px '+family;ctx.fillStyle=accent;ctx.fillText('기획 · '+d.planner.trim(),anchor,y);}
 y+=29;ctx.strokeStyle=accent;ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(t.left,y);ctx.lineTo(t.right,y);ctx.stroke();
 const top=y+14;
 const fitted=layout(ctx,tracks(d,songs),{...t,top},family),bounds=[];
 const {size,step,indent,width}=fitted;
 ctx.textAlign='left';
 fitted.columns.forEach((rows,col)=>{
  const x=t.left+col*(width+42);let rowY=top;
  for(const r of rows){
   let base=rowY;
   if(r.section){
    ctx.fillStyle=accent;ctx.font=Math.min(21,Math.round(size*.82))+'px '+metaFont;
    ctx.fillText(r.section,x,base+step*.78);base+=r.heading;
   }
   ctx.fillStyle=accent;ctx.font=Math.round(size*.73)+'px '+metaFont;
   ctx.fillText(String(r.number).padStart(2,'0'),x,base+size);
   ctx.fillStyle=ink;ctx.font=size+'px '+family;
   r.lines.forEach((line,i)=>ctx.fillText(line,x+indent,base+size+i*step));
   if(r.vcr){ctx.fillStyle=accent;ctx.font=Math.round(size*.53)+'px '+metaFont;ctx.fillText('VCR'+(r.vcr>1?'×'+r.vcr:''),x,base+size+step*.55,indent-2);}
   rowY+=r.height;bounds.push({id:r.id,lines:r.lines,bottom:rowY});
  }
 });
 ctx.font='17px '+metaFont;ctx.fillStyle=accent;ctx.textAlign=t.centered?'center':'left';
 ctx.fillText('SEEYA ARCHIVE   ·   '+count(d)+' SONGS   ·   팬이 만든 가상 콘서트',anchor,t.bottom+27);
 return {width:W,height:H,rows:bounds,fontSize:size,columns:fitted.columns.length};
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
