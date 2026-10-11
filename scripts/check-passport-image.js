'use strict';
const assert=require('node:assert/strict'),R=require('../src/shared/passport-image'),P=require('../src/shared/passport');
const entry=P.entry({entryId:'image-test-508',kind:'concert',status:'done',title:'씨야 20주년 전국 투어 콘서트 · 청주',date:'2026-10-10',time:'18:00',members:['seeya'],seat:'PRIVATE_SEAT',note:'PRIVATE_NOTE',companions:'PRIVATE_FRIEND',snapshot:{place:'청주대학교 석우문화체육관'},createdAt:'2026-10-11T01:00:00Z',updatedAt:'2026-10-11T01:00:00Z'});
const state={...P.empty(),profile:{...P.profile(),nickname:'PRIVATE_NAME'},entries:[entry]};
const calls=[],g={measureText:s=>({width:String(s).length*20})};
for(const name of ['translate','scale','fillRect','drawImage','save','restore','fillText','strokeRect','beginPath','moveTo','lineTo','stroke','setLineDash','arc','fill'])g[name]=(...a)=>calls.push([name,...a]);
const canvas={getContext:()=>g},catalog={tour:[{label:'서울',date:'2026-08-29',eventId:'seoul'},{label:'서울',date:'2026-08-30',eventId:'seoul-day2'}]},photo={width:800,height:1200};
const opts={type:'ticket',color:'cream',device:'iphone',entry:entry.entryId,motto:'함께한 기억',mottoSize:28,mottoX:0,mottoY:92,photoX:50,photoY:42,photoSize:75,photoOpacity:75,period:'month',month:'2026-10',nickname:false,seat:false};
for(const type of ['profile','lock','home','ticket','review','stats'])for(const color of Object.keys(R.COLORS)){calls.length=0;const dim=R.draw(canvas,state,catalog,{...opts,type,color},photo);assert.deepEqual([canvas.width,canvas.height],[dim.width,dim.height]);const image=calls.findIndex(c=>c[0]==='drawImage'),background=calls.findIndex(c=>c[0]==='fillRect'),firstText=calls.findIndex(c=>c[0]==='fillText');assert(background<image&&image<firstText,'Photo must precede every text layer');assert.equal(calls.filter(c=>c[0]==='drawImage').length,1);assert(!JSON.stringify(calls).includes('PRIVATE_'));}
assert.deepEqual(R.size('ticket'),[1080,3240]);
calls.length=0;R.draw(canvas,state,catalog,{...opts,nickname:true,seat:true},null);assert(JSON.stringify(calls).includes('PRIVATE_NAME'));assert(JSON.stringify(calls).includes('PRIVATE_SEAT'));assert(!calls.some(c=>c[0]==='drawImage'));
const rect=R.photoRect(800,1200,1080,1920,opts);assert.equal(rect.width/rect.height,800/1200);assert.equal(rect.x+rect.width/2,540);
const larger=R.photoRect(800,1200,1080,1920,{...opts,photoSize:150,photoX:100,photoY:0});assert.equal(larger.width,rect.width*2);assert.equal(larger.x+larger.width/2,1080);assert.equal(larger.y+larger.height/2,0);
for(const h of [1080,1920,2339])for(const x of [0,100])for(const y of [0,100]){const m=R.mottoLayout(g,{...opts,motto:'a'.repeat(80),mottoSize:72,mottoX:x,mottoY:y},h);assert(m.x>=64&&m.y>=80);assert(m.y+(m.lines.length-1)*m.lineHeight<h-50,'Phrase stays inside output margins');}
assert.equal(Object.keys(R.COLORS).length,7);
console.log('PASS image maker: all templates/colors, photo below text, preserved aspect ratio, positioning/scale, phrase bounds, vertical boarding pass and private-field exclusion.');

const D=require('../src/shared/passport-image-edit');
assert.deepEqual(D.movePhoto(opts,108,-192,1920),{photoX:60,photoY:32});
assert.deepEqual(D.movePhoto(opts,-99999,99999,1920),{photoX:0,photoY:100});
for(const corner of ['nw','ne','sw','se']){
 const sx=corner.includes('w')?-1:1,sy=corner.includes('n')?-1:1;
 const v={...opts,photoX:50,photoY:50,photoSize:50},r=R.photoRect(800,1200,1080,1920,v);
 const edit=D.resizePhoto(v,r,corner,sx*50,sy*75,1920),after=R.photoRect(800,1200,1080,1920,{...v,...edit});
 assert(edit.photoSize>v.photoSize);
 assert(Math.abs(after.width/after.height-800/1200)<1e-9);
 assert(Math.abs((after.x+(sx<0?after.width:0))-(r.x+(sx<0?r.width:0)))<1e-8,'Opposite corner stays fixed');
 assert(Math.abs((after.y+(sy<0?after.height:0))-(r.y+(sy<0?r.height:0)))<1e-8);
}
const m=R.mottoLayout(g,opts,1920),mv=D.moveMotto(opts,m,20,-40,1920),m2=R.mottoLayout(g,{...opts,...mv},1920);
assert(Math.abs(m2.x-m.x-20)<1e-8);assert(Math.abs(m2.y-m.y+40)<1e-8);
calls.length=0;R.draw(canvas,state,catalog,{...opts,type:'profile'},null);
for(const label of ['MY MEMBER','MY SONG','공연 관람','장소 방문','굿즈 구매 기록'])assert(JSON.stringify(calls).includes(label),'Combined profile missing '+label);
const prior={...entry,entryId:'past',date:'2025-10-10',title:'OUTSIDE_MONTH'};
calls.length=0;R.draw(canvas,{...state,entries:[entry,prior]},catalog,{...opts,type:'review'},null);
assert(!JSON.stringify(calls).includes('OUTSIDE_MONTH'));
assert(JSON.stringify(calls).includes('이달의 나'));
console.log('PASS direct editor: drag bounds, fixed-corner resizing, text position, combined profile and monthly scope.');

const fs=require('node:fs'),path=require('node:path'),brand=require('../src/data/passport-brand.json');
const template=fs.readFileSync(path.join(__dirname,'../src/template.html'),'utf8');
assert(template.includes(brand.logo),'Passport must use the exact homepage logo');
const logo={width:850,height:207};
for(const type of ['profile','review','ticket','lock','home']){
 calls.length=0;R.draw(canvas,state,catalog,{...opts,type},photo,logo);
 const logos=calls.filter(c=>c[0]==='drawImage'&&c[1]===logo);
 assert.equal(logos.length,1);assert(Math.abs(logos[0][4]/logos[0][5]-850/207)<1e-9);
 assert(calls.findIndex(c=>c[0]==='drawImage'&&c[1]===photo)<calls.indexOf(logos[0]));
 assert(!calls.some(c=>c[0]==='fillText'&&c[1]==='SEEYA'),'Heading uses logo, not plain text');
}
const textFonts=[];g.fillText=(...a)=>{calls.push(['fillText',...a]);textFonts.push([a[0],g.font]);};
for(const id of Object.keys(R.FONTS)){
 textFonts.length=0;R.draw(canvas,state,catalog,{...opts,mottoFont:id},null,logo);
 assert(textFonts.some(([text,font])=>text===opts.motto&&font.includes(R.fontFamily(id))));
}
assert.equal(R.fontFamily('unknown'),R.fontFamily('basic'));
for(const name of ['GowunDodum-Regular','GowunBatang-Regular','NanumPenScript-Regular']){
 const dir=path.join(__dirname,'../src/vendor/passport-fonts');
 assert.equal(fs.readFileSync(path.join(dir,name+'.woff2')).subarray(0,4).toString(),'wOF2');
 assert(fs.readFileSync(path.join(dir,name+'-OFL.txt'),'utf8').includes('SIL OPEN FONT LICENSE'));
}
calls.length=0;R.draw(canvas,{...state,profile:{...state.profile,since:'2006-03-12'}},catalog,{...opts,type:'profile'},null,logo);
assert(JSON.stringify(calls).includes('년차 씨야 덕후'));
console.log('PASS homepage logo identity/aspect/layering, four phrase fonts, packaged WOFF2 licenses and fan-year wording.');

// Image selection never mutates saved records, and each personal layer is independent.
const extra={...entry,entryId:'second-record',title:'SECOND RECORD',date:'2026-09-10'},saved={...state,entries:[entry,extra]},before=JSON.stringify(saved);
assert.deepEqual(R.chosenEntries(saved,{recordIds:[extra.entryId,entry.entryId,extra.entryId,'missing']}),[extra,entry]);
assert.deepEqual(R.chosenEntries(saved,{type:'review',month:'2026-10',recordIds:[extra.entryId,entry.entryId]}),[entry]);
const photo2={width:600,height:600},phrases=[{...opts,motto:'FIRST PHRASE',mottoSize:150,mottoFont:'pen'},{...opts,motto:'SECOND PHRASE',mottoSize:66,mottoFont:'batang'}];
calls.length=0;R.draw(canvas,saved,catalog,{...opts,type:'records',recordIds:[extra.entryId],photos:[{...opts,image:photo},{...opts,image:photo2,photoX:75}],mottos:phrases},null,logo);
assert.deepEqual(calls.filter(c=>c[0]==='drawImage').map(c=>c[1]),[photo,photo2,logo]);
assert(calls.findIndex(c=>c[0]==='drawImage'&&c[1]===photo2)<calls.findIndex(c=>c[0]==='fillText'));
for(const phrase of phrases)assert(calls.some(c=>c[0]==='fillText'&&c[1]===phrase.motto));
assert(calls.some(c=>c[0]==='fillText'&&c[1]==='SECOND RECORD'));
assert(!JSON.stringify(calls).includes(entry.title));assert(!JSON.stringify(calls).includes('PRIVATE_'));
assert.equal(JSON.stringify(saved),before);
assert.deepEqual(R.size('profile','iphone',{showRecords:true}),[1080,1920]);
for(const type of ['home','lock']){
 calls.length=0;R.draw(canvas,state,catalog,{...opts,type,showTour:false,mottos:[],photos:[]},null,logo);
 assert(!calls.some(c=>c[0]==='arc'),'Hidden tour must remove every stamp');
 assert(!calls.some(c=>c[0]==='fillText'&&/TOUR STAMPS|NEXT/.test(c[1])));
 calls.length=0;R.draw(canvas,state,catalog,{...opts,type,showTour:true},null,logo);
 assert(calls.some(c=>c[0]==='arc'));
}
for(const h of [1080,1920,2339])for(const y of [0,100]){
 const m=R.mottoLayout(g,{...opts,motto:'긴 문구 '.repeat(25),mottoSize:150,mottoY:y},h);
 assert.equal(m.font,150);assert(m.y-m.font>=0);assert(m.y+(m.lines.length-1)*m.lineHeight<h-50);
}
calls.length=0;R.draw(canvas,state,catalog,{...opts,type:'review',showRecords:false,mottos:[]},null,logo);
assert(!calls.some(c=>c[0]==='fillText'&&c[1].includes(entry.title)));
console.log('PASS independent photo/text layers, selected record order/month/privacy, hidden tour/records, 150px bounds and expanded card.');

// Group movement uses the exact transform exported to PNG, independent of preview zoom.
for(const type of ['lock','home','profile','review','records']){
 const opt={...opts,type,showRecords:true,showTour:true,recordIds:[entry.entryId]};
 const H=R.size(type,'iphone',opt)[1]/R.size(type,'iphone',opt)[0]*1080;
 for(const kind of ['tour','records']){
  const before=R.blockLayout(kind,state,catalog,opt,H);if(!before)continue;
  const delta=D.moveBlock(kind,before,12,-24),after=R.blockLayout(kind,state,catalog,{...opt,...delta},H);
  assert(Math.abs(after.x-before.x-12)<1e-8);assert(Math.abs(after.y-before.y+24)<1e-8);
  calls.length=0;R.draw(canvas,state,catalog,{...opt,...delta},null);
  assert(calls.some(c=>c[0]==='translate'&&Math.abs(c[1]-(after.x-after.baseX))<1e-8&&Math.abs(c[2]-(after.y-after.baseY))<1e-8),'PNG must use moved group geometry');
  for(const n of [-99999,99999]){const b=R.blockLayout(kind,state,catalog,{...opt,...D.moveBlock(kind,before,n,n)},H);assert(b.x>=20&&b.x+b.width<=1060);assert(b.y>=20&&b.y+b.height<=H-80+1e-8);}
  assert.deepEqual(R.blockLayout(kind,state,catalog,opt,H),before,'Default position remains reproducible');
 }
}
assert.equal(R.blockLayout('tour',state,catalog,{...opts,type:'lock',showTour:false},2339),null);
assert.equal(R.blockLayout('records',state,catalog,{...opts,type:'profile',showRecords:false},1080),null);
assert.equal(R.blockLayout('records',state,catalog,{...opts,type:'ticket',showRecords:true},3240),null);
assert(!fs.readFileSync(path.join(__dirname,'../src/pages/passport.js'),'utf8').includes('>플레이 기록</a>'));
console.log('PASS movable tour/record blocks: independent transforms, PNG coordinates, bounds, default positions and visibility.');
