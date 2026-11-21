'use strict';
const themes=require('../data/our-stage-album-keepsakes.json'),{load}=require('./our-stage-keepsake-art');
module.exports=async function drawPoster(album){
 const theme=themes[album.id];if(!theme)throw Error('Unknown poster');
 const [logo,picture]=await Promise.all([load('/images/game/our-stage/card-logo.svg'),load(theme.image)]);
 await document.fonts.ready;
 const canvas=document.createElement('canvas');canvas.width=1200;canvas.height=1600;
 const c=canvas.getContext('2d'),ink=theme.colors[1];
 c.fillStyle='#fff7e8';c.fillRect(0,0,1200,1600);
 c.strokeStyle='#805c4b';c.lineWidth=5;c.strokeRect(20,20,1160,1560);
 c.fillStyle=theme.colors[0];c.fillRect(36,36,1128,1528);
 const logoAt=(width,y)=>c.drawImage(logo,(1200-width)/2,y,width,width*logo.height/logo.width);
 logoAt(400,78);
 c.imageSmoothingEnabled=false;c.drawImage(picture,100,240,1000,1000);c.imageSmoothingEnabled=true;
 c.textAlign='center';c.fillStyle=ink;
 function text(value,y,size,max){c.font='600 '+size+'px system-ui,sans-serif';while(c.measureText(value).width>max&&size>16)c.font='600 '+--size+'px system-ui,sans-serif';c.fillText(value,600,y);}
 text(album.name,1320,64,1000);text(album.type,1376,25,1000);
 c.strokeStyle=ink;c.globalAlpha=.25;c.lineWidth=2;c.beginPath();c.moveTo(100,1420);c.lineTo(1100,1420);c.stroke();c.globalAlpha=1;
 logoAt(190,1450);text('A R C H I V E',1532,20,300);
 return canvas;
};
