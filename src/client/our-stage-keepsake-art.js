'use strict';
const optimized=require('../data/our-stage-optimized-images.json'),stories=require('../data/our-stage-stories.json'),layers=require('../data/our-stage-layers.json');
function load(src){return new Promise((resolve,reject)=>{const img=new Image(),timer=setTimeout(()=>reject(Error('image timeout')),12000);img.onload=()=>{clearTimeout(timer);resolve(img);};img.onerror=()=>{clearTimeout(timer);reject(Error('image unavailable'));};img.src=optimized[src]||src;});}
function cover(c,img,x,y,w,h,box){const [sx,sy,sw,sh]=box||[0,0,img.width,img.height],r=Math.max(w/sw,h/sh);c.save();c.beginPath();c.rect(x,y,w,h);c.clip();c.imageSmoothingEnabled=false;c.drawImage(img,sx,sy,sw,sh,x+(w-sw*r)/2,y+(h-sh*r)/2,sw*r,sh*r);c.restore();}
function panelSource(id){const image=require('../data/our-stage-album-keepsakes.json')[id]?.image;if(image)return {src:image};const story=stories.find(e=>e.kind==='album'&&e.album===id);return story?{src:story.image}:{src:'/images/game/our-stage/pixel-stories-period.png',box:[903,3,444,444]};}
async function panel(id){const source=panelSource(id),canvas=document.createElement('canvas');canvas.width=600;canvas.height=600;const c=canvas.getContext('2d');c.fillStyle='#e9dce5';c.fillRect(0,0,600,600);try{cover(c,await load(source.src),0,0,600,600,source.box);}catch{c.fillStyle='#81536d';c.font='bold 46px sans-serif';c.textAlign='center';c.fillText('OUR STAGE',300,290);c.fillText('SEEYA',300,350);}return canvas;}
async function drawPass({nickname,issuedAt}){
 const canvas=document.createElement('canvas');canvas.width=840;canvas.height=1200;const c=canvas.getContext('2d');c.scale(2,2);await document.fonts.ready;
 const text=(t,x,y,w,size,color='#40343e',weight=600)=>{c.fillStyle=color;c.font=weight+' '+size+'px system-ui,sans-serif';while(c.measureText(t).width>w&&size>9){c.font=weight+' '+--size+'px system-ui,sans-serif';}c.fillText(t,x,y);};
 c.fillStyle='#fff8f1';c.fillRect(0,0,420,600);const g=c.createLinearGradient(0,0,420,90);g.addColorStop(0,'#81536d');g.addColorStop(1,'#b06f8c');c.fillStyle=g;c.fillRect(0,0,420,92);
 c.fillStyle='#5e3a4e';c.fillRect(193,0,34,40);c.fillStyle='#fff8f1';c.beginPath();c.roundRect(178,52,64,16,8);c.fill();
 text('OUR STAGE',28,26,170,10,'#f7e6ee');c.textAlign='right';text('ARTIST · 2006',392,26,170,10,'#f7e6ee');c.textAlign='center';
 try{c.drawImage(await load('/images/game/our-stage/card-logo.svg'),140,109,140,40);}catch{text('SEEYA',210,142,250,32);}
 text('A R C H I V E',210,159,230,9,'#81536d');c.strokeStyle='#cda55f';c.lineWidth=2;c.beginPath();c.roundRect(105,170,210,28,14);c.stroke();text('A R T I S T  P A S S',210,189,200,11,'#8d6a2a');
 c.fillStyle='#2a2140';c.beginPath();c.roundRect(46,208,328,190,14);c.fill();
 const l=layers['first-mind'];try{const [body,head]=await Promise.all([load(l.image),load(l.headImage||l.image)]);c.save();c.beginPath();c.rect(46,208,328,190);c.clip();c.imageSmoothingEnabled=false;
 for(const [i,id] of ['br','gr','yj'].entries()){const m=l.members[id],scale=320/(m.chin-m.head[1]),hw=m.head[2]*scale,hh=m.head[3]*scale,bw=m.body[2]*320/m.body[3],unit=.23,cx=101+i*109;
 c.fillStyle='#ead7e21a';c.fillRect(cx-35,208,70,190);c.drawImage(head,...m.head,cx-hw*unit/2,225,hw*unit,hh*unit);c.drawImage(body,...m.body,cx-bw*unit/2,225+315*unit,bw*unit,320*unit);}
 c.restore();}catch{text('세 목소리와 함께하는 첫 무대',210,307,300,16,'#fff8f1');}
 c.textAlign='left';text('함께한 팬',46,426,328,10,'#9b5a74');text(nickname||'익명의 씨야 팬',46,459,328,30,'#40343e',800);c.fillStyle='#cda55f';c.fillRect(46,478,328,2);
 const date=new Date(issuedAt).toLocaleDateString('ko-KR',{timeZone:'Asia/Seoul'});for(const [i,[label,value]] of [['DEBUT','2006. 02. 24.'],['발급일',date],['CHAPTER','00 → 01']].entries()){const x=46+i*116;text(label,x,501,108,9,'#9b5a74');text(value,x,521,108,13);}
 c.setLineDash([3,3]);c.strokeStyle='#d6c4cd';c.beginPath();c.moveTo(46,555);c.lineTo(374,555);c.stroke();text('팬 게임 기념 패스 · 실제 출입증이 아닙니다',46,573,328,9,'#8b7d86');text('OS-PASS-'+new Date(issuedAt+9*3600000).toISOString().slice(2,16).replace(/[-T:]/g,''),46,588,328,8,'#8b7d86');return canvas;
}
module.exports={load,cover,panel,panelSource,drawPass};
