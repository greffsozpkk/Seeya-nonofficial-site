'use strict';
function imageUrls(row){return row.image?[row.image]:/^[\w-]{11}$/.test(row.youtubeId||'')?[`https://i.ytimg.com/vi/${row.youtubeId}/maxresdefault.jpg`,`https://i.ytimg.com/vi/${row.youtubeId}/hqdefault.jpg`]:[];}
function loadImage(url){return new Promise(resolve=>{const img=new Image();let done=false;const end=value=>{if(done)return;done=true;clearTimeout(timer);img.onload=img.onerror=null;resolve(value);};const timer=setTimeout(()=>end(null),7000);img.crossOrigin='anonymous';img.referrerPolicy='no-referrer';img.onload=()=>end(img.naturalWidth>120?img:null);img.onerror=()=>end(null);img.src=url;});}
function lines(ctx,text,width,maxLines){const result=[];let line='';for(const ch of String(text||'')){if(ctx.measureText(line+ch).width>width&&line){result.push(line);line='';}line+=ch;}if(line)result.push(line);if(result.length>maxLines){result.length=maxLines;let last=result[maxLines-1];while(last&&ctx.measureText(last+'…').width>width)last=last.slice(0,-1);result[maxLines-1]=last+'…';}return result;}
async function render({row,title,nickname}){
 const canvas=document.createElement('canvas');canvas.width=1080;canvas.height=1350;const ctx=canvas.getContext('2d');
 const images=await Promise.all(imageUrls(row).map(loadImage)),photo=images.find(Boolean);
 ctx.fillStyle='#fff9fb';ctx.fillRect(0,0,1080,1350);ctx.strokeStyle='#d493ab';ctx.lineWidth=3;ctx.strokeRect(40,40,1000,1270);ctx.textAlign='center';ctx.fillStyle='#9b4267';ctx.font='22px sans-serif';ctx.fillText('SEEYA PLAY · WORLD CUP',540,108);
 ctx.fillStyle='#35252e';ctx.font='bold 32px sans-serif';lines(ctx,title,900,2).forEach((s,i)=>ctx.fillText(s,540,170+i*42));
 ctx.font='28px sans-serif';lines(ctx,nickname?nickname+' 님의 최종 선택':'나의 최종 선택',900,2).forEach((s,i)=>ctx.fillText(s,540,255+i*36));
 ctx.fillStyle='#f4e6ed';ctx.fillRect(80,320,920,470);
 if(photo){const scale=Math.min(920/photo.naturalWidth,470/photo.naturalHeight),w=photo.naturalWidth*scale,h=photo.naturalHeight*scale;ctx.drawImage(photo,80+(920-w)/2,320+(470-h)/2,w,h);}else{ctx.fillStyle='#a15879';ctx.font='bold 70px serif';ctx.fillText('SEEYA',540,555);ctx.font='24px sans-serif';ctx.fillText('MY FAVORITE',540,605);}
 ctx.fillStyle='#98687d';ctx.font='19px sans-serif';lines(ctx,photo?(row.image?row.imageCredit||'배역 이미지':'YouTube · '+(row.channel||'')):'',900,1).forEach(s=>ctx.fillText(s,540,825));
 ctx.fillStyle='#9b4267';ctx.font='22px sans-serif';ctx.fillText('MY WINNER',540,880);ctx.fillStyle='#35252e';ctx.font='bold 52px sans-serif';lines(ctx,row.title,900,3).forEach((s,i)=>ctx.fillText(s,540,955+i*68));ctx.font='25px sans-serif';lines(ctx,[row.artist||'씨야',row.album].filter(Boolean).join(' · '),900,2).forEach((s,i)=>ctx.fillText(s,540,1170+i*34));ctx.font='19px sans-serif';ctx.fillStyle='#98687d';ctx.fillText('seeya-fanpage.com',540,1270);
 const blob=await new Promise((resolve,reject)=>{try{canvas.toBlob(b=>b?resolve(b):reject(Error('이미지를 저장하지 못했어요. 다시 시도해 주세요.')),'image/png');}catch(e){reject(e);}});
 return {blob,hasImage:!!photo};
}
module.exports={render,imageUrls,lines};
