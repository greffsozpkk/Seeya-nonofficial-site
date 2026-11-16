'use strict';
const layers=require('../data/our-stage-layers.json');
const optimized=require('../data/our-stage-optimized-images.json');
function load(src){return new Promise((resolve,reject)=>{const img=new Image(),timer=setTimeout(()=>reject(new Error('이미지를 불러오지 못했어요.')),15000);img.onload=()=>{clearTimeout(timer);resolve(img);};img.onerror=()=>{clearTimeout(timer);reject(new Error('이미지를 불러오지 못했어요.'));};img.src=optimized[src]||src;});}
module.exports=async function({album,index,receipt,nickname}){
 const outfit=layers[album.id];
 const [logo,body,head]=await Promise.all([load('/images/game/our-stage/card-logo.svg'),load(outfit.image),load(outfit.headImage||outfit.image)]);
 await document.fonts.ready;
 const canvas=document.createElement('canvas');canvas.width=1800;canvas.height=840;
 const c=canvas.getContext('2d');c.scale(2,2);
 const colors=[['#ead7e2','#81536d'],['#f3d7de','#9c5269'],['#dce9df','#4e7467'],['#dce3f1','#4b658c'],['#e7dcf1','#795d93'],['#f1e2cf','#906c43'],['#dce8ef','#4c7186'],['#e5dcf0','#785493']][index];
 const [wash,accent]=colors,ink='#40343e';
 const rect=(x,y,w,h,fill)=>{c.fillStyle=fill;c.fillRect(x,y,w,h);};
 const text=(t,x,y,max,size=18,color=ink,weight=500)=>{c.fillStyle=color;c.font=weight+' '+size+'px system-ui, sans-serif';while(c.measureText(t).width>max&&size>11){size--;c.font=weight+' '+size+'px system-ui, sans-serif';}c.fillText(t,x,y);};
 const line=(x,y,x2,y2,color)=>{c.strokeStyle=color;c.lineWidth=1;c.beginPath();c.moveTo(x,y);c.lineTo(x2,y2);c.stroke();};
 rect(0,0,900,420,'#fcf8f1');rect(0,0,900,7,accent);
 // Archive wordmark, paired with the same official SEEYA mark as the card book.
 c.drawImage(logo,396,23,108,30.61);c.textAlign='center';text('A R C H I V E',450,70,150,10,ink,600);c.textAlign='left';
 text('OUR STAGE',40,49,220,12,accent,700);c.textAlign='right';text('ALBUM CONCERT · '+String(index+1).padStart(2,'0'),860,49,240,12,accent,700);c.textAlign='left';
 line(40,86,860,86,'#ded2d5');
 rect(615,104,245,244,wash);
 // A soft spotlight and a stage underline frame the approved album sprites.
 const glow=c.createRadialGradient(738,180,5,738,220,175);glow.addColorStop(0,'#ffffffd9');glow.addColorStop(1,'#ffffff00');rect(615,104,245,244,glow);
 for(const [x,y,r] of [[642,133,4],[829,154,3],[808,122,5]]){c.fillStyle=accent;c.beginPath();c.moveTo(x,y-r);c.lineTo(x+2,y);c.lineTo(x,y+r);c.lineTo(x-2,y);c.closePath();c.fill();}
 c.imageSmoothingEnabled=false;
 ['br','gr','yj'].forEach((id,i)=>{const m=outfit.members[id],scale=320/(m.chin-m.head[1]),hw=m.head[2]*scale,hh=m.head[3]*scale,bh=320,bw=m.body[2]*bh/m.body[3],s=.17,x=621+i*77,y=155;
 c.drawImage(head,...m.head,x+(440-hw)/2*s,y+25*s,hw*s,hh*s);
 c.drawImage(body,...m.body,x+(440-bw)/2*s,y+340*s,bw*s,bh*s);
 });c.imageSmoothingEnabled=true;
 line(636,278,840,278,accent);c.textAlign='center';text('함께 완성한 우리의 무대',738,310,225,14,accent,600);text('WITH YOU, ALWAYS',738,332,220,10,accent,600);c.textAlign='left';
 text('CHAPTER '+String(index+1).padStart(2,'0')+'  /  앨범 완주 기념',42,121,540,13,accent,700);
 text(album.name,40,170,545,38,ink,750);
 text('한 곡씩 쌓아온 마음이 오늘의 무대가 되었어요.',42,202,540,15,'#766771');
 text('함께한 팬',42,246,540,11,accent,700);text(nickname||'익명의 씨야 팬',42,276,540,24,ink,700);
 text('함께 부른 노래',42,312,190,11,accent,600);text(receipt.tracks.length+'곡',42,338,190,21,ink,700);
 text('콘서트를 마친 날',250,312,300,11,accent,600);text(new Date(receipt.at).toLocaleDateString('ko-KR',{timeZone:'Asia/Seoul'}),250,338,340,18,ink,600);
 c.setLineDash([3,5]);line(27,365,873,365,'#cabbc5');c.setLineDash([]);
 text('팬 게임 기념 티켓 · 실제 입장권이 아닙니다',42,393,500,11,'#766771');c.textAlign='right';text(receipt.serial,860,393,350,10,'#766771');c.textAlign='left';
 c.globalCompositeOperation='destination-out';for(const x of [0,900]){c.beginPath();c.arc(x,365,12,0,Math.PI*2);c.fill();}c.globalCompositeOperation='source-over';
 return canvas;
};
