'use strict';
const P=require('./passport'),X=require('./passport-extra');
const COLORS={ink:{label:'검은색',bg:'#19171c',fg:'#fff9fc',accent:'#efb8cd'},pink:{label:'핑크',bg:'#f7dce7',fg:'#34232d',accent:'#973358'},cream:{label:'크림',bg:'#fcf4e8',fg:'#352e27',accent:'#88583c'},white:{label:'흰색',bg:'#ffffff',fg:'#29232c',accent:'#963858'},gyuri:{label:'남규리 · 로즈',bg:'#d6487f',fg:'#ffffff',accent:'#fff2b5'},yeonji:{label:'김연지 · 바이올렛',bg:'#6b5bd1',fg:'#ffffff',accent:'#eddbff'},boram:{label:'이보람 · 틸',bg:'#2f8f7a',fg:'#ffffff',accent:'#d8fff4'}};
const clamp=(v,min,max)=>Math.max(min,Math.min(max,Number(v)||0));
function size(type,device){return ['lock','home'].includes(type)?({iphone:[1170,2532],max:[1290,2796],android:[1440,3120]}[device]||[1170,2532]):type==='ticket'?[1080,1920]:type==='review'?[1080,1920]:[1080,1080];}
function photoRect(iw,ih,w,h,opts){const ratio=Math.min(w/iw,h/ih)*clamp(opts.photoSize,10,200)/100;const width=iw*ratio,height=ih*ratio;return {x:w*clamp(opts.photoX,0,100)/100-width/2,y:h*clamp(opts.photoY,0,100)/100-height/2,width,height};}
function wrap(g,value,width,maxLines=4){let line='',lines=[];const tokens=String(value).match(/[A-Za-z0-9]+|[^\n]|\n/gu)||[];for(const token of tokens){for(const ch of g.measureText(token).width>width?[...token]:[token]){if(ch==='\n'||g.measureText(line+ch).width>width&&line){lines.push(line.trimEnd());line=ch==='\n'?'':ch.trimStart();}else line+=ch;}}lines.push(line);if(lines.length>maxLines){lines=lines.slice(0,maxLines);let last=lines[maxLines-1];while(last&&g.measureText(last+'…').width>width)last=last.slice(0,-1);lines[maxLines-1]=last+'…';}return lines;}
function text(g,value,x,y,font,width=920,lineHeight=font*1.4,maxLines=4){g.font=`${font>=40?'600':'400'} ${font}px Arial, sans-serif`;const lines=wrap(g,value,width,maxLines);lines.forEach((line,i)=>g.fillText(line,x,y+i*lineHeight));return lines.length*lineHeight;}
function mottoLayout(g,opts,h){const font=clamp(opts.mottoSize,18,72);g.font=`400 ${font}px Arial, sans-serif`;const lines=wrap(g,opts.motto||'',880,8),width=Math.max(1,...lines.map(s=>g.measureText(s).width));const height=lines.length*font*1.35;return {font,lines,x:64+(1080-128-width)*clamp(opts.mottoX,0,100)/100,y:80+(h-190-height)*clamp(opts.mottoY,0,100)/100,lineHeight:font*1.35};}
function ticket(g,e,state,opts,H,c){
 const {fg,accent,bg}=c;
 const line=y=>{g.save();g.shadowBlur=0;g.strokeStyle=accent;g.lineWidth=2;g.beginPath();g.moveTo(76,y);g.lineTo(1004,y);g.stroke();g.restore();};
 g.strokeStyle=accent;g.lineWidth=2;g.strokeRect(42,42,996,H-84);
 g.fillStyle=accent;text(g,'SEEYA AIR · WITH YOU',80,112,26,820,38,1);text(g,'BOARDING PASS',80,220,67,920,85,1);
 g.fillStyle=fg;text(g,'마음이 머무는 곳으로',82,271,24);line(312);
 // Decorative route is a keepsake motif, never an invented airport or travel booking.
 text(g,'WITH',80,411,90,400);text(g,'SEEYA',680,411,90,340);
 text(g,'나의 오늘',85,465,24,300);text(g,'함께한 순간',687,465,24,300);
 g.save();g.shadowBlur=0;g.strokeStyle=accent;g.lineWidth=3;g.beginPath();g.moveTo(425,395);g.lineTo(620,395);g.lineTo(603,379);g.moveTo(620,395);g.lineTo(603,411);g.stroke();g.restore();
 g.fillStyle=accent;text(g,'DESTINATION · '+(e?P.KINDS[e.kind]:'나의 기록'),80,561,22);
 g.fillStyle=fg;text(g,e?.title||'기록을 선택해 주세요',80,626,49,920,67,3);
 g.fillStyle=accent;text(g,e?.kind==='goods'?'COLLECTION':'VENUE',80,856,22);
 g.fillStyle=fg;text(g,e?.kind==='goods'?'나의 굿즈 컬렉션':e?.snapshot?.place||'나의 기억 속 한 장면',80,908,30,920,43,2);
 line(1025);
 const field=(label,value,x,y,width)=>{g.fillStyle=accent;text(g,label,x,y,20,width,28,1);g.fillStyle=fg;text(g,value,x,y+52,30,width,42,2);};
 field('DATE',e?P.dateLabel(e.date):'—',80,1090,530);field(e?.kind==='goods'?'QUANTITY':'TIME',e?.kind==='goods'?(e.goods?.quantity||1)+'개':e?.time||'미기록',690,1090,300);
 field('PASSENGER',opts.nickname?state.profile.nickname||'WITH YOU':'WITH YOU',80,1240,530);
 field(e?.kind==='concert'&&opts.seat?'SEAT':'STATUS',e?.kind==='concert'&&opts.seat?e.seat||'미기록':!e?'—':e.kind==='goods'?(e.status==='planned'?'구매 예정':'구매했어요'):e.status==='planned'?'갈 예정':e.kind==='story'?'남긴 이야기':'다녀왔어요',690,1240,300);
 g.save();g.shadowBlur=0;g.strokeStyle=accent;g.setLineDash([10,10]);g.beginPath();g.moveTo(44,1430);g.lineTo(1036,1430);g.stroke();g.setLineDash([]);g.fillStyle=bg;for(const x of [42,1038]){g.beginPath();g.arc(x,1430,22,0,Math.PI*2);g.fill();}g.restore();
 g.fillStyle=accent;text(g,'MEMORY STUB',80,1510,22);g.fillStyle=fg;text(g,e?.title||'WITH YOU PASSPORT',80,1565,31,920,42,2);
 // A drawn stripe motif, not a scannable code or real ticket identifier.
 g.save();g.shadowBlur=0;g.fillStyle=fg;let x=82;for(let i=0;i<84;i++){const w=[2,5,3,7,2,4][i%6];g.fillRect(x,1683,w,62);x+=w+6;}g.restore();
 g.fillStyle=accent;text(g,'PERSONAL KEEPSAKE · 입장권이 아닌 나의 추억',80,1793,19,920,28,1);
}
function draw(canvas,state,catalog,opts,photo){
 const type=opts.type,[w,h]=size(type,opts.device);canvas.width=w;canvas.height=h;
 const g=canvas.getContext('2d'),scale=w/1080,H=h/scale,c=COLORS[opts.color]||COLORS.ink;
 g.scale(scale,scale);g.fillStyle=c.bg;g.fillRect(0,0,1080,H);
 // Layer order is fixed: background -> user's photo -> structure/text -> custom phrase.
 if(photo){const r=photoRect(photo.width,photo.height,1080,H,opts);g.save();g.globalAlpha=clamp(opts.photoOpacity,0,100)/100;g.drawImage(photo,r.x,r.y,r.width,r.height);g.restore();}
 g.fillStyle=c.fg;g.shadowColor=c.bg;g.shadowBlur=photo?10:0;
 const wallpaper=['lock','home'].includes(type),years=state.profile.since?Number(P.today().slice(0,4))-Number(state.profile.since.slice(0,4))+1:0;
 if(type==='ticket')ticket(g,state.entries.find(e=>e.entryId===opts.entry),state,opts,H,c);
 else {
  let y=wallpaper?(type==='lock'?H*.44:H*.62):100;
  text(g,'WITH YOU PASSPORT'+(opts.nickname&&state.profile.nickname?' · '+state.profile.nickname:''),76,y,24,920,32,1);y+=90;
  if(wallpaper){text(g,'THE FAN · TOUR STAMPS',76,y,28,920,40);y+=85;catalog.tour.forEach((t,i)=>{const x=160+(i%4)*250,cy=y+Math.floor(i/4)*175,done=X.tourEntries(t,state.entries).length>0;g.save();g.shadowBlur=0;g.beginPath();g.arc(x,cy,64,0,Math.PI*2);g.strokeStyle=c.accent;g.fillStyle=done?'#a13259':c.bg;g.setLineDash(done?[]:[6,7]);g.fill();g.stroke();g.restore();g.fillStyle=done?'#fff':c.fg;g.textAlign='center';text(g,t.label,x,cy+5,28,150,35,1);text(g,t.date.slice(5).replace('-','.'),x,cy-28,18,150,25,1);g.textAlign='left';});g.fillStyle=c.fg;y+=310;const next=catalog.tour.filter(t=>t.date>=P.today()).sort((a,b)=>a.date.localeCompare(b.date))[0];if(next)text(g,`NEXT · ${next.label} ${next.date} · D-${Math.round((Date.parse(next.date)-Date.parse(P.today()))/86400000)}`,76,y,26,920,40);}
  else if(type==='profile'){text(g,opts.nickname?state.profile.nickname||'WITH YOU':'WITH YOU',76,y,64,920,82);y+=140;g.fillStyle=c.accent;text(g,years?'위듀 '+years+'년차':'우리의 첫 페이지',76,y,62,920,80);y+=110;g.fillStyle=c.fg;text(g,P.MEMBERS[state.profile.favMember]||'씨야 완전체',76,y,32,920,46);y+=60;text(g,state.profile.favSong||'',76,y,30,920,45);}
  else {let rows=state.entries;if(type==='review'){const period=opts.period==='year'?opts.month.slice(0,4):opts.month;rows=rows.filter(e=>e.date.startsWith(period));text(g,period+' · '+(opts.period==='year'?'올해의 나':'이달의 나'),76,y,52,920,80);}else text(g,'함께 쌓은 순간들',76,y,54,920,80);const counts=P.summary(rows);y+=145;for(const [v,label] of [[counts.concert,'공연 관람'],[counts.visit,'장소 방문'],[X.songs(rows).length,'라이브로 들은 곡'],[counts.goods,'굿즈 구매 기록']]){g.fillStyle=c.accent;text(g,String(v),76,y,76,920,90);g.fillStyle=c.fg;text(g,label,250,y,32,710,48);y+=140;}if(type==='review')rows.filter(e=>P.completed(e)).slice(0,4).forEach(e=>{text(g,P.dateLabel(e.date)+' · '+e.title,76,y,26,920,40,2);y+=100;});}
 }
 const m=mottoLayout(g,opts,H);g.fillStyle=c.fg;g.font=`400 ${m.font}px Arial, sans-serif`;m.lines.forEach((line,i)=>g.fillText(line,m.x,m.y+i*m.lineHeight));
 g.fillStyle=c.accent;text(g,'SEEYA ARCHIVE · 나의 기억으로 남긴 기록',76,H-50,18,920,28,1);
 return {width:w,height:h};
}
module.exports={COLORS,size,photoRect,mottoLayout,draw};
