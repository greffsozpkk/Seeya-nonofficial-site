'use strict';
const art=require('../data/our-stage-badge-art.json');
const themes=require('../data/our-stage-album-keepsakes.json');
const optimized=require('../data/our-stage-optimized-images.json');
function load(src){return new Promise((resolve,reject)=>{const img=new Image(),timer=setTimeout(()=>reject(new Error('이미지를 불러오지 못했어요.')),15000);img.onload=()=>{clearTimeout(timer);resolve(img);};img.onerror=()=>{clearTimeout(timer);reject(new Error('이미지를 불러오지 못했어요.'));};img.src=optimized[src]||src;});}
module.exports=async function({album,index,receipt,nickname}){
 const badge=art.badges[album.id+'-master'],source=badge.logo?art.logoSheets[badge.sheet]:art.sheets[badge.sheet];
 const [logo,sheet,badgeLogo]=await Promise.all([load('/images/game/our-stage/card-logo.svg'),load(source),load('/images/game/our-stage/'+(badge.logo?.tone==='light'?'badge-logo-light.svg':'card-logo.svg'))]);
 await document.fonts.ready;
 const canvas=document.createElement('canvas');canvas.width=1800;canvas.height=840;
 const c=canvas.getContext('2d');c.scale(2,2);
 const colors=themes[album.id].colors;
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
 const crop=document.createElement('canvas');crop.width=badge.box[2];crop.height=badge.box[3];const cc=crop.getContext('2d');cc.drawImage(sheet,...badge.box,0,0,crop.width,crop.height);
 if(badge.logo){const pixels=cc.getImageData(0,0,crop.width,crop.height);for(let i=3;i<pixels.data.length;i+=4)pixels.data[i]=pixels.data[i]<224?0:255;cc.putImageData(pixels,0,0);const [x,y,w,h]=badge.logo.box;cc.drawImage(badgeLogo,x-badge.box[0],y-badge.box[1],w,h);}
 const size=Math.min(166/crop.width,132/crop.height),w=crop.width*size,h=crop.height*size;c.imageSmoothingEnabled=false;c.drawImage(crop,738-w/2,202-h/2,w,h);c.imageSmoothingEnabled=true;
 line(636,278,840,278,accent);c.textAlign='center';text('함께 완성한 우리의 무대',738,310,225,14,accent,600);text('CHAPTER '+String(index+1).padStart(2,'0')+' · '+album.type.split(' · ')[1].slice(0,4),738,332,220,10,accent,600);c.textAlign='left';
 text('CHAPTER '+String(index+1).padStart(2,'0')+'  /  앨범 완주 기념',42,121,540,13,accent,700);
 text(album.name,40,170,545,38,ink,750);
 text(themes[album.id].line,42,202,540,15,'#766771');
 text('함께한 팬',42,246,540,11,accent,700);text(nickname||'익명의 씨야 팬',42,276,540,24,ink,700);
 text('함께 부른 노래',42,312,190,11,accent,600);text(receipt.tracks.length===1?'싱글 무대':receipt.tracks.length+'곡',42,338,190,21,ink,700);
 text('콘서트를 마친 날',250,312,300,11,accent,600);text(new Date(receipt.at).toLocaleDateString('ko-KR',{timeZone:'Asia/Seoul'}),250,338,340,18,ink,600);
 c.setLineDash([3,5]);line(27,365,873,365,'#cabbc5');c.setLineDash([]);
 text('팬 게임 기념 티켓 · 실제 입장권이 아닙니다',42,393,500,11,'#766771');c.textAlign='right';text('OS-'+String(index+1).padStart(2,'0')+'-'+new Date(receipt.at+9*3600000).toISOString().slice(2,16).replace(/[-T:]/g,''),860,393,350,10,'#766771');c.textAlign='left';
 c.globalCompositeOperation='destination-out';for(const x of [0,900]){c.beginPath();c.arc(x,365,12,0,Math.PI*2);c.fill();}c.globalCompositeOperation='source-over';
 return canvas;
};
