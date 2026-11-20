'use strict';
const themes=require('../data/our-stage-album-keepsakes.json');
const optimized=require('../data/our-stage-optimized-images.json');
function load(src){return new Promise((resolve,reject)=>{const img=new Image(),timer=setTimeout(()=>reject(new Error('이미지를 불러오지 못했어요.')),15000);img.onload=()=>{clearTimeout(timer);resolve(img);};img.onerror=()=>{clearTimeout(timer);reject(new Error('이미지를 불러오지 못했어요.'));};img.src=optimized[src]||src;});}
module.exports=async function({album,index,receipt,nickname}){
 const keepsake=require('./our-stage-keepsake-art');
 const [logo,picture]=await Promise.all([load('/images/game/our-stage/card-logo.svg'),keepsake.panel(album.id)]);
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
 c.imageSmoothingEnabled=false;c.drawImage(picture,616,98,244,244);c.imageSmoothingEnabled=true;
 c.textAlign='center';text(themes[album.id].band||'함께 완성한 우리의 무대',738,357,244,11,accent,600);c.textAlign='left';
 text('CHAPTER '+String(index+1).padStart(2,'0')+'  /  앨범 완주 기념',42,121,540,13,accent,700);
 text(album.name,40,170,545,38,ink,750);
 const quote=themes[album.id].line,split=quote.indexOf(',');
 const quoteLines=split<0?[quote]:[quote.slice(0,split+1),quote.slice(split+1).trim()];
 quoteLines.forEach((part,i)=>text(part,42,216+i*22,540,15,'#766771'));
 const release=album.type.match(/\d{4}\.\d{2}\.\d{2}/)?.[0]||'';
 text('앨범 발매일  '+release,42,275,540,12,accent,600);
 text('함께한 팬',42,312,190,11,accent,700);text(nickname||'익명의 씨야 팬',42,338,190,21,ink,700);
 text('콘서트를 마친 날',250,312,300,11,accent,600);text(receipt?new Date(receipt.at).toLocaleDateString('ko-KR',{timeZone:'Asia/Seoul'}):'콘서트 완료 후 기록',250,338,340,18,ink,600);
 c.setLineDash([3,5]);line(27,365,873,365,'#cabbc5');c.setLineDash([]);
 text('팬 게임 기념 티켓 · 실제 입장권이 아닙니다',42,393,500,11,'#766771');c.textAlign='right';text(receipt?'OS-'+String(index+1).padStart(2,'0')+'-'+new Date(receipt.at+9*3600000).toISOString().slice(2,16).replace(/[-T:]/g,''):'OS-'+String(index+1).padStart(2,'0'),860,393,350,10,'#766771');c.textAlign='left';
 c.globalCompositeOperation='destination-out';for(const x of [0,900]){c.beginPath();c.arc(x,365,12,0,Math.PI*2);c.fill();}c.globalCompositeOperation='source-over';
 return canvas;
};
