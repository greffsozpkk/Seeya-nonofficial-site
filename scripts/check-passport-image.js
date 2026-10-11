'use strict';
const assert=require('node:assert/strict'),R=require('../src/shared/passport-image'),P=require('../src/shared/passport');
const entry=P.entry({entryId:'image-test-508',kind:'concert',status:'done',title:'씨야 20주년 전국 투어 콘서트 · 청주',date:'2026-10-10',time:'18:00',members:['seeya'],seat:'PRIVATE_SEAT',note:'PRIVATE_NOTE',companions:'PRIVATE_FRIEND',snapshot:{place:'청주대학교 석우문화체육관'},createdAt:'2026-10-11T01:00:00Z',updatedAt:'2026-10-11T01:00:00Z'});
const state={...P.empty(),profile:{...P.profile(),nickname:'PRIVATE_NAME'},entries:[entry]};
const calls=[],g={measureText:s=>({width:String(s).length*20})};
for(const name of ['scale','fillRect','drawImage','save','restore','fillText','strokeRect','beginPath','moveTo','lineTo','stroke','setLineDash','arc','fill'])g[name]=(...a)=>calls.push([name,...a]);
const canvas={getContext:()=>g},catalog={tour:[{label:'서울',date:'2026-08-29',eventId:'seoul'},{label:'서울',date:'2026-08-30',eventId:'seoul-day2'}]},photo={width:800,height:1200};
const opts={type:'ticket',color:'cream',device:'iphone',entry:entry.entryId,motto:'함께한 기억',mottoSize:28,mottoX:0,mottoY:92,photoX:50,photoY:42,photoSize:75,photoOpacity:75,period:'month',month:'2026-10',nickname:false,seat:false};
for(const type of ['profile','lock','home','ticket','review','stats'])for(const color of Object.keys(R.COLORS)){calls.length=0;const dim=R.draw(canvas,state,catalog,{...opts,type,color},photo);assert.deepEqual([canvas.width,canvas.height],[dim.width,dim.height]);const image=calls.findIndex(c=>c[0]==='drawImage'),background=calls.findIndex(c=>c[0]==='fillRect'),firstText=calls.findIndex(c=>c[0]==='fillText');assert(background<image&&image<firstText,'Photo must precede every text layer');assert.equal(calls.filter(c=>c[0]==='drawImage').length,1);assert(!JSON.stringify(calls).includes('PRIVATE_'));}
assert.deepEqual(R.size('ticket'),[1080,1920]);
calls.length=0;R.draw(canvas,state,catalog,{...opts,nickname:true,seat:true},null);assert(JSON.stringify(calls).includes('PRIVATE_NAME'));assert(JSON.stringify(calls).includes('PRIVATE_SEAT'));assert(!calls.some(c=>c[0]==='drawImage'));
const rect=R.photoRect(800,1200,1080,1920,opts);assert.equal(rect.width/rect.height,800/1200);assert.equal(rect.x+rect.width/2,540);
const larger=R.photoRect(800,1200,1080,1920,{...opts,photoSize:150,photoX:100,photoY:0});assert.equal(larger.width,rect.width*2);assert.equal(larger.x+larger.width/2,1080);assert.equal(larger.y+larger.height/2,0);
for(const h of [1080,1920,2339])for(const x of [0,100])for(const y of [0,100]){const m=R.mottoLayout(g,{...opts,motto:'a'.repeat(80),mottoSize:72,mottoX:x,mottoY:y},h);assert(m.x>=64&&m.y>=80);assert(m.y+(m.lines.length-1)*m.lineHeight<h-50,'Phrase stays inside output margins');}
assert.equal(Object.keys(R.COLORS).length,7);
console.log('PASS image maker: all templates/colors, photo below text, preserved aspect ratio, positioning/scale, phrase bounds, vertical boarding pass and private-field exclusion.');
