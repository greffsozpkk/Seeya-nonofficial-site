'use strict';
const assert=require('node:assert/strict'),R=require('../src/shared/passport-image'),P=require('../src/shared/passport');
const entry=P.entry({entryId:'image-test-508',kind:'concert',status:'done',title:'씨야 20주년 전국 투어 콘서트 · 청주',date:'2026-10-10',time:'18:00',members:['seeya'],seat:'PRIVATE_SEAT',note:'PRIVATE_NOTE',companions:'PRIVATE_FRIEND',snapshot:{place:'청주대학교 석우문화체육관'},createdAt:'2026-10-11T01:00:00Z',updatedAt:'2026-10-11T01:00:00Z'});
const state={...P.empty(),profile:{...P.profile(),nickname:'PRIVATE_NAME'},entries:[entry]};
const calls=[],g={measureText:s=>({width:String(s).length*20})};
for(const name of ['scale','fillRect','drawImage','save','restore','fillText','strokeRect','beginPath','moveTo','lineTo','stroke','setLineDash','arc','fill'])g[name]=(...a)=>calls.push([name,...a]);
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
assert(JSON.stringify(calls).includes('팬 된 지 '));
console.log('PASS homepage logo identity/aspect/layering, four phrase fonts, packaged WOFF2 licenses and fan-year wording.');
