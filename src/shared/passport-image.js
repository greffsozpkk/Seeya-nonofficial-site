'use strict';
const P=require('./passport'),X=require('./passport-extra');
const COLORS={ink:{label:'검은색',bg:'#19171c',fg:'#fff9fc',accent:'#efb8cd'},pink:{label:'핑크',bg:'#f7dce7',fg:'#34232d',accent:'#973358'},cream:{label:'크림',bg:'#fcf4e8',fg:'#352e27',accent:'#88583c'},white:{label:'흰색',bg:'#ffffff',fg:'#29232c',accent:'#963858'},gyuri:{label:'남규리 · 로즈',bg:'#d6487f',fg:'#ffffff',accent:'#fff2b5'},yeonji:{label:'김연지 · 바이올렛',bg:'#6b5bd1',fg:'#ffffff',accent:'#eddbff'},boram:{label:'이보람 · 틸',bg:'#2f8f7a',fg:'#ffffff',accent:'#d8fff4'}};
const FONTS={basic:{label:'기본 고딕',family:'Arial, "Malgun Gothic", sans-serif'},dodum:{label:'고운돋움',family:'"Passport Dodum", sans-serif'},batang:{label:'고운바탕',family:'"Passport Batang", serif'},pen:{label:'나눔손글씨 펜',family:'"Passport Pen", cursive'}};
const fontFamily=id=>(FONTS[id]||FONTS.basic).family;
const clamp=(v,min,max)=>Math.max(min,Math.min(max,Number(v)||0));
function size(type,device,opts={}){return ['lock','home'].includes(type)?({iphone:[1170,2532],max:[1290,2796],android:[1440,3120]}[device]||[1170,2532]):type==='ticket'?[1080,3240]:(type==='review'||type==='records'||type==='profile'&&opts.showRecords)?[1080,1920]:[1080,1080];}
function photoRect(iw,ih,w,h,opts){const ratio=Math.min(w/iw,h/ih)*clamp(opts.photoSize,10,200)/100;const width=iw*ratio,height=ih*ratio;return {x:w*clamp(opts.photoX,0,100)/100-width/2,y:h*clamp(opts.photoY,0,100)/100-height/2,width,height};}
function wrap(g,value,width,maxLines=4){let line='',lines=[];const tokens=String(value).match(/[A-Za-z0-9]+|[^\n]|\n/gu)||[];for(const token of tokens){for(const ch of g.measureText(token).width>width?[...token]:[token]){if(ch==='\n'||g.measureText(line+ch).width>width&&line){lines.push(line.trimEnd());line=ch==='\n'?'':ch.trimStart();}else line+=ch;}}lines.push(line);if(lines.length>maxLines){lines=lines.slice(0,maxLines);let last=lines[maxLines-1];while(last&&g.measureText(last+'…').width>width)last=last.slice(0,-1);lines[maxLines-1]=last+'…';}return lines;}
function text(g,value,x,y,font,width=920,lineHeight=font*1.4,maxLines=4){g.font=`${font>=40?'600':'400'} ${font}px Arial, sans-serif`;const lines=wrap(g,value,width,maxLines);lines.forEach((line,i)=>g.fillText(line,x,y+i*lineHeight));return lines.length*lineHeight;}
function mottoLayout(g,opts,h){
 const font=clamp(opts.mottoSize,18,150);g.font=`400 ${font}px ${fontFamily(opts.mottoFont)}`;
 const top=Math.max(80,font+32),maxLines=Math.max(1,Math.min(8,Math.floor((h-top-110)/(font*1.35))));
 const lines=wrap(g,opts.motto||'',880,maxLines),width=Math.max(1,...lines.map(s=>g.measureText(s).width)),height=lines.length*font*1.35;
 const travelX=Math.max(0,952-width),travelY=Math.max(0,h-110-height-top);
 return {font,lines,width,height,travelX,travelY,x:64+travelX*clamp(opts.mottoX,0,100)/100,y:top+travelY*clamp(opts.mottoY,0,100)/100,lineHeight:font*1.35};
}
// A narrow keepsake ticket: photo-led, scalloped ends, compact record details.
function ticket(g,e,state,opts,H,c,logo){
 const {fg,accent,bg}=c;
 g.strokeStyle=accent;g.lineWidth=2;g.strokeRect(48,60,984,H-100);
 g.fillStyle=accent;text(g,'WITH YOU · MEMORY TICKET',88,154,28,900,40,1);
 g.fillStyle=fg;drawLogo(g,logo,88,208,380);
 text(g,'우리의 한 장면',94,362,30,880,45,1);
 // The large central area is reserved for the chosen photo.
 g.save();g.shadowBlur=0;g.fillStyle=bg;g.globalAlpha=.9;g.fillRect(50,2060,980,760);g.restore();
 g.fillStyle=accent;text(g,e?P.KINDS[e.kind]:'나의 기록',88,2140,26,900,38,1);
 g.fillStyle=fg;text(g,e?.title||'기록을 선택해 주세요',88,2230,56,904,76,3);
 text(g,e?.kind==='goods'?'나의 굿즈 컬렉션':e?.snapshot?.place||'나의 기억 속 한 장면',88,2510,30,900,42,2);
 g.strokeStyle=accent;g.setLineDash([10,10]);g.beginPath();g.moveTo(64,2640);g.lineTo(1016,2640);g.stroke();g.setLineDash([]);
 text(g,e?P.dateLabel(e.date)+(e.time?' · '+e.time:''):'WITH YOU',88,2720,35,900,48,1);
 const detail=opts.nickname?state.profile.nickname||'WITH YOU':'WITH YOU';
 text(g,detail+(e?.kind==='concert'&&opts.seat&&e.seat?' · '+e.seat:e?.kind==='goods'?' · '+(e.goods?.quantity||1)+'개':''),88,2790,28,900,38,1);
 // Decorative stripe motif only; not an admission code.
 g.save();g.shadowBlur=0;g.fillStyle=fg;let x=90;for(let i=0;i<84;i++){const w=[2,5,3,7,2,4][i%6];g.fillRect(x,3060,w,48);x+=w+6;}g.restore();
 g.fillStyle=accent;text(g,'나의 추억을 담은 소장용 티켓',88,3152,22,900,30,1);
}
function ticketCutouts(g,H){
 g.save();g.globalCompositeOperation='destination-out';g.shadowBlur=0;
 for(const y of [0,H])for(let x=45;x<1080;x+=90){g.beginPath();g.arc(x,y,24,0,Math.PI*2);g.fill();}
 g.restore();
}
function drawLogo(g,logo,x,y,w){
 if(!logo)return;
 g.save();g.shadowBlur=0;g.drawImage(logo,x,y,w,w*(logo.naturalHeight||logo.height)/(logo.naturalWidth||logo.width));g.restore();
}
function draw(canvas,state,catalog,opts,photo,logo){
 const type=opts.type,[w,h]=size(type,opts.device,opts);canvas.width=w;canvas.height=h;
 const g=canvas.getContext('2d'),scale=w/1080,H=h/scale,c=COLORS[opts.color]||COLORS.ink;
 g.scale(scale,scale);g.fillStyle=c.bg;g.fillRect(0,0,1080,H);
 // Layer order is fixed: background -> user's photo -> structure/text -> custom phrase.
 const layers=Array.isArray(opts.photos)?opts.photos:photo?[{image:photo,...opts}]:[];
 for(const layer of layers){const img=layer.image;if(!img)continue;const r=photoRect(img.width,img.height,1080,H,layer);g.save();g.globalAlpha=clamp(layer.photoOpacity,0,100)/100;g.drawImage(img,r.x,r.y,r.width,r.height);g.restore();}
 g.fillStyle=c.fg;g.shadowColor=c.bg;g.shadowBlur=layers.length?10:0;
 const wallpaper=['lock','home'].includes(type),years=state.profile.since?Number(P.today().slice(0,4))-Number(state.profile.since.slice(0,4))+1:0;
 if(type==='ticket')ticket(g,state.entries.find(e=>e.entryId===opts.entry),state,opts,H,c,logo);
 else {
  let y=wallpaper?(opts.showRecords?300:type==='lock'?H*.44:H*.62):100;
  drawLogo(g,logo,76,y-44,230);text(g,'PASSPORT'+(opts.nickname&&state.profile.nickname?' · '+state.profile.nickname:''),346,y,24,650,32,1);y+=90;
  if(wallpaper&&opts.showTour!==false){text(g,'THE FAN · TOUR STAMPS',76,y,28,920,40);y+=85;catalog.tour.forEach((t,i)=>{const x=160+(i%4)*250,cy=y+Math.floor(i/4)*175,done=X.tourEntries(t,state.entries).length>0;g.save();g.shadowBlur=0;g.beginPath();g.arc(x,cy,64,0,Math.PI*2);g.strokeStyle=c.accent;g.fillStyle=done?'#a13259':c.bg;g.setLineDash(done?[]:[6,7]);g.fill();g.stroke();g.restore();g.fillStyle=done?'#fff':c.fg;g.textAlign='center';text(g,t.label,x,cy+5,28,150,35,1);text(g,t.date.slice(5).replace('-','.'),x,cy-28,18,150,25,1);g.textAlign='left';});g.fillStyle=c.fg;y+=310;const next=catalog.tour.filter(t=>t.date>=P.today()).sort((a,b)=>a.date.localeCompare(b.date))[0];if(next)text(g,`NEXT · ${next.label} ${next.date} · D-${Math.round((Date.parse(next.date)-Date.parse(P.today()))/86400000)}`,76,y,26,920,40);}
  else if(type==='profile'){
   text(g,opts.nickname?state.profile.nickname||'WITH YOU':'WITH YOU',76,235,64,920,82);
   g.fillStyle=c.accent;text(g,years?years+'년차 씨야 덕후':'우리의 첫 페이지',76,322,38,920,52);
   g.fillStyle=c.fg;text(g,state.profile.since?'SINCE · '+P.dateLabel(state.profile.since):'SINCE · 좋아한 날 미기록',76,384,26,920,38,1);
   text(g,'MY MEMBER · '+(P.MEMBERS[state.profile.favMember]||'씨야 완전체'),76,441,28,920,40,1);
   text(g,'MY SONG · '+(state.profile.favSong||'아직 고르는 중'),76,493,28,920,38,2);
   g.strokeStyle=c.accent;g.beginPath();g.moveTo(76,550);g.lineTo(1004,550);g.stroke();
   const counts=P.summary(state.entries);
   [[counts.concert,'공연 관람'],[counts.visit,'장소 방문'],[X.songs(state.entries).length,'라이브로 들은 곡'],[counts.goods,'굿즈 구매 기록']].forEach(([n,label],i)=>{const x=76+(i%2)*480,y=625+Math.floor(i/2)*140;g.fillStyle=c.accent;text(g,String(n),x,y,64,430,80,1);g.fillStyle=c.fg;text(g,label,x,y+49,27,430,38,1);});
  }
  else if(type==='records'){text(g,'내가 고른 순간들',76,235,54,920,80);}
  else if(!wallpaper){let rows=state.entries;if(type==='review'){const period=opts.period==='year'?opts.month.slice(0,4):opts.month;rows=rows.filter(e=>e.date.startsWith(period));text(g,period+' · '+(opts.period==='year'?'올해의 나':'이달의 나'),76,y,52,920,80);}else text(g,'함께 쌓은 순간들',76,y,54,920,80);const counts=P.summary(rows);y+=145;for(const [v,label] of [[counts.concert,'공연 관람'],[counts.visit,'장소 방문'],[X.songs(rows).length,'라이브로 들은 곡'],[counts.goods,'굿즈 구매 기록']]){g.fillStyle=c.accent;text(g,String(v),76,y,76,920,90);g.fillStyle=c.fg;text(g,label,250,y,32,710,48);y+=140;}if(type==='review'&&opts.showRecords===undefined)rows.filter(e=>P.completed(e)).slice(0,4).forEach(e=>{text(g,P.dateLabel(e.date)+' · '+e.title,76,y,26,920,40,2);y+=100;});}
 }
 if(type!=='ticket'&&(opts.showRecords||type==='records')){
  const rows=chosenEntries(state,opts),y=type==='profile'?960:type==='review'?970:type==='records'?340:opts.showTour===false?540:960;
  recordList(g,rows,y,c,type==='records');
 }
 const phrases=Array.isArray(opts.mottos)?opts.mottos:[opts];
 for(const phrase of phrases){const m=mottoLayout(g,phrase,H);g.fillStyle=c.fg;g.font=`400 ${m.font}px ${fontFamily(phrase.mottoFont)}`;m.lines.forEach((line,i)=>g.fillText(line,m.x,m.y+i*m.lineHeight));}
 g.fillStyle=c.accent;text(g,'SEEYA ARCHIVE · 나의 기억으로 남긴 기록',76,H-50,18,920,28,1);
 if(type==='ticket')ticketCutouts(g,H);
 return {width:w,height:h};
}
function chosenEntries(state,opts){
 const ids=[...new Set(Array.isArray(opts.recordIds)?opts.recordIds:[])].slice(0,6);
 return ids.map(id=>state.entries.find(e=>e.entryId===id)).filter(e=>e&&(opts.type!=='review'||e.date.startsWith(opts.month||P.today().slice(0,7))));
}
function recordList(g,rows,y,c,standalone){
 g.fillStyle=c.accent;text(g,'MY RECORDS · '+rows.length,76,y,24,920,35,1);y+=65;
 if(!rows.length){g.fillStyle=c.fg;text(g,'담고 싶은 기록을 선택해 주세요',76,y,28,920,40,1);return;}
 const gap=standalone?205:110;
 for(const e of rows){g.fillStyle=c.accent;text(g,P.dateLabel(e.date)+' · '+(P.completed(e)?'나의 기록':'예정'),76,y,22,920,30,1);g.fillStyle=c.fg;text(g,e.title,76,y+40,30,920,38,2);y+=gap;}
}
module.exports={chosenEntries,FONTS,fontFamily,COLORS,size,photoRect,mottoLayout,draw};
