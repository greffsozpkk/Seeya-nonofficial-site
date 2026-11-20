'use strict';
const D=require('../shared/our-stage-stage-shop');
const rect=(x,y,w,h,c)=>`<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${c}"/>`;
const svg=(body,cls='',height=360)=>`<svg class="${cls}" viewBox="0 0 600 ${height}" preserveAspectRatio="none" aria-hidden="true" shape-rendering="crispEdges">${body}</svg>`;
const wood=()=>rect(0,270,600,90,'#9c705c')+Array.from({length:6},(_,i)=>rect(0,270+i*18,600,3,'#644c49')+rect(i%2?80:20,270+i*18,2,18,'#c19a79')+rect(i%2?380:260,270+i*18,2,18,'#c19a79')).join('');
function backdrop(id){let b='';
 if(id==='hall'){
  b=rect(0,0,600,360,'#2c2536')+wood()+rect(65,30,470,220,'#4c3042');
  for(const x of [0,530])for(let n=0;n<5;n++)b+=rect(x+n*14,15,14,265,['#713f53','#96536b','#61374d','#81455d','#4b2f43'][n]);
  b+=rect(0,0,600,25,'#96536b')+rect(0,25,600,5,'#d8b78c');
  for(const x of [120,290,460])b+=rect(x,32,16,30,'#39303b')+rect(x-14,60,44,10,'#d8bc8b')+rect(x-8,70,32,5,'#fff0c8');
  b+=`<image href="/images/game/our-stage/card-logo.svg" x="245" y="105" width="110" height="32" opacity=".65"/>`;
 }else if(id==='showcase'){
  b=rect(0,0,600,360,'#d3c9ba')+wood()+rect(32,40,536,205,'#826f6a');
  for(let n=0;n<4;n++){const x=40+n*132;b+=rect(x,48,124,188,'#a8bbc1')+`<path d="M${x} 180l124-110v28l-124 110Z" fill="#dce7df" opacity=".55"/>`+rect(x+120,48,4,188,'#ead9c3');}
  b+=rect(20,217,560,8,'#725745')+rect(28,0,7,27,'#574b47')+rect(20,27,25,9,'#fff0c7')+rect(563,0,7,27,'#574b47')+rect(555,27,25,9,'#fff0c7');
 }else if(id==='rooftop'){
  b=rect(0,0,600,360,'#20263e')+rect(0,120,600,150,'#30354d')+rect(453,34,27,27,'#edddae')+rect(448,39,37,17,'#edddae');
  for(let n=0;n<11;n++){const x=n*58,h=45+(n*31)%80,y=260-h;b+=rect(x,y,50,h,n%2?'#3c4159':'#292e46');for(let row=0;row<4;row++)for(let col=0;col<3;col++)if((row+col+n)%3)b+=rect(x+8+col*13,y+10+row*19,5,7,'#ba9b78');}
  for(let n=0;n<12;n++)b+=rect(22+n*49,18+(n*37)%86,3,3,'#b5aec5');
  b+=wood()+rect(0,248,600,6,'#9e9ba5')+Array.from({length:16},(_,n)=>rect(n*40,248,4,40,'#747182')).join('');
 }
 return b?svg(b,'shop-backdrop'):'';
}
function prop(id){let b='';
 for(const x of [20,532]){
  if(id==='mic')b+=rect(x+18,175,5,135,'#96929f')+rect(x+2,308,40,5,'#282335')+rect(x+8,172,30,6,'#282335')+rect(x+4,164,15,13,'#d4c5d1')+rect(x+5,167,13,3,'#817987');
  if(id==='speakers')b+=rect(x,224,47,92,'#302e40')+rect(x+5,230,37,80,'#514b5e')+rect(x+12,237,23,20,'#262534')+rect(x+7,268,33,31,'#282635')+rect(x+16,277,15,13,'#746576');
  if(id==='flowers'){b+=rect(x+6,285,36,32,'#b88d69')+rect(x+2,283,44,6,'#dfbd91');for(const [j,dx,dy]of [[0,0,0],[1,20,-12],[2,36,2],[3,12,15]]){b+=rect(x+dx+4,267+dy,4,20,'#759773')+rect(x+dx-5,257+dy,24,8,j%2?'#e3abbb':'#f3ced0')+rect(x+dx+2,250+dy,10,23,j%2?'#e3abbb':'#f3ced0')+rect(x+dx+3,258+dy,8,7,'#f4dfb3');}}
 }
 return b?svg(b,'shop-props'):'';
}
// Stable irregular positions: a redraw never makes the audience jump.
const scatter=(n,salt=0)=>{const v=Math.sin((n+1)*127.1+(salt+1)*311.7)*43758.5453;return v-Math.floor(v);};
function crowd(){let b='';for(let row=0;row<3;row++)for(let n=0;n<29;n++){const x=n*22+(row%2)*9-5,y=48+row*28+Math.floor(scatter(n,row*17)*13);b+=rect(x,y,13,12,['#342e45','#403149','#513b54'][row])+rect(x-4,y+12,21,19,['#302b40','#382d43','#453247'][row]);}return b;}
function pixelName(name,x,y,color){const {glyphs}=require('../shared/our-stage-name-tag');let d='';[...name].forEach((letter,i)=>glyphs[letter].forEach((row,yy)=>[...row].forEach((dot,xx)=>{if(dot==='1')d+=`M${x+i*26+xx*2} ${y+yy*2}h2v2h-2z`;})));return `<path fill="${color}" d="${d}"/>`;}
const heart=(x,y,color)=>`<path fill="${color}" d="M${x} ${y+3}h3v-3h6v3h3v-3h6v3h3v6h-3v3h-3v3h-3v3h-3v-3h-3v-3h-3v-3h-3Z"/>`;
function audience(id){let b=rect(0,0,600,128,'#201e32')+crowd();
 if(id==='balloons'){
  for(let row=0;row<3;row++)for(let n=0;n<29;n++){
   const k=row*29+n,x=Math.round(n*21+(row%2)*9-7+scatter(k,5)*8),y=Math.round(5+row*31+scatter(k,12)*22),scale=.65+row*.13+scatter(k,21)*.16;
   b+=`<g class="audience-balloon" style="--audience-delay:${-scatter(k,2)*5}s;--audience-speed:${3+scatter(k,3)*2}s"><g transform="translate(${x} ${y}) scale(${scale})">`+rect(9,23,1,47,'#a97691')+`<path d="M5 0h10v3h4v4h3v12h-3v4h-4v3h-4v3H8v-3H5v-3H1v-4h-3V7h3V3h4Z" fill="${['#ef99bb','#f3b4cd','#db7fa8','#ffc6dc'][Math.floor(scatter(k,4)*4)]}"/>`+rect(3,7,3,8,'#ffe9f2')+rect(6,4,5,3,'#ffe9f2')+'</g></g>';
  }
 }else if(id==='phone-lights'){
  for(let row=0;row<4;row++)for(let n=0;n<30;n++){
   const k=row*30+n,x=Math.round(n*20+(row%2)*8+scatter(k,6)*9-5),y=Math.round(10+row*26+scatter(k,15)*17),w=6+row*2,h=10+row*3;
   b+=rect(x,y,w,h,'#8e8ea5')+rect(x+1,y+2,w-2,h-3,'#343448')+rect(x+Math.floor(w/2)-1,y+h,3,7,'#b49399');
   b+=`<g class="audience-phone-glow" style="--audience-delay:${-scatter(k,8)*4}s;--audience-speed:${2.8+scatter(k,9)*2}s">`+`<circle cx="${x+2}" cy="${y+3}" r="${7+row*2}" fill="#d9e9ff" opacity=".055"/><circle cx="${x+2}" cy="${y+3}" r="${3+row}" fill="#d9e9ff" opacity=".18"/>`+rect(x,y+1,4,4,'#fffef4')+(k%9===0?rect(x-3,y+2,10,1,'#edf4ff')+rect(x+1,y-2,1,10,'#edf4ff'):'')+'</g>';
  }
 }else if(id==='banner'){
  const boards=[{x:8,y:33,name:'보람',paper:'#f5c4d8',ink:'#733d61'},{x:155,y:14,name:'규리',paper:'#f4d2a8',ink:'#745044'},{x:305,y:43,name:'연지',paper:'#d6c8ed',ink:'#594477'},{x:454,y:24,name:null,paper:'#e9d8e0',ink:'#764b67'}];
  for(const [i,a]of boards.entries()){
   b+=`<g class="audience-placard" style="--audience-delay:${-i*.8}s;--audience-speed:${3.6+i*.3}s">`;
   b+=rect(a.x+19,a.y+39,7,51,'#c6a0a1')+rect(a.x+102,a.y+39,7,51,'#b88f9b')+rect(a.x+3,a.y+3,132,43,'#110f23')+rect(a.x,a.y,132,43,a.ink)+rect(a.x+3,a.y+3,126,37,a.paper);
   b+=rect(a.x+8,a.y+7,4,4,'#fff4e8')+rect(a.x+120,a.y+32,4,4,'#fff4e8');
   b+=a.name?pixelName(a.name,a.x+24,a.y+10,a.ink)+heart(a.x+88,a.y+13,a.ink):`<image href="/images/game/our-stage/card-logo.svg" x="${a.x+20}" y="${a.y+10}" width="76" height="22"/>`+heart(a.x+101,a.y+15,a.ink);
   b+=rect(a.x+15,a.y+35,14,10,'#e3b6ad')+rect(a.x+99,a.y+35,14,10,'#dab0ad')+'</g>';
  }
 }else return '';
 return svg(b,'shop-audience',128).replace('preserveAspectRatio="none"','preserveAspectRatio="xMidYMid meet"');
}
function thumbnail(id){const i=D.byId(id);if(!i)return '';if(i.slot==='background')return backdrop(id);if(i.slot==='audience')return audience(id);return `<svg class="shop-item-art" viewBox="0 145 82 190" aria-hidden="true" shape-rendering="crispEdges">${rect(0,145,82,190,'#e7dbd6')+prop(id).replace(/^<svg[^>]*>|<\/svg>$/g,'')}</svg>`;}
module.exports={backdrop,prop,audience,thumbnail};
