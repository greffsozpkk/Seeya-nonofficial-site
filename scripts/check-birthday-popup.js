'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const {DAY,STORAGE_KEY,END,isBirthday,birthdayPopup}=require('../src/shared/birthday-popup');
const {initBirthdayPopup}=require('../src/client/birthday-popup');
for(const date of ['2026-10-29T14:59:59.999Z','2026-10-30T15:00:00Z','2027-10-30T03:00:00Z'])assert(!isBirthday(new Date(date)),date);
for(const date of ['2026-10-29T15:00:00Z','2026-10-30T14:59:59.999Z'])assert(isBirthday(new Date(date)),date);
assert(!isBirthday(new Date('invalid')));
function setup({date='2026-10-30T12:00:00+09:00',saved=null,blocked=false,present=true}={}){
 let current=new Date(date),value=saved,deadline,cleared=0;
 const node=()=>({events:{},addEventListener(k,f){this.events[k]=f;}});
 const dialog={...node(),open:false,showModal(){this.open=true;},close(){this.open=false;this.events.close?.();},getBoundingClientRect(){return {left:10,right:100,top:10,bottom:200};}};
 const image={...node(),dataset:{birthdaySrc:'/images/events/yeonji-birthday-20261030.png'}},check={...node(),checked:false},button=node(),classes=new Set();
 const doc={...node(),getElementById:id=>({birthdayPopup:present?dialog:null,birthdayPopupImage:image,birthdayPopupHide:check,birthdayPopupClose:button}[id]),documentElement:{classList:{add:k=>classes.add(k),remove:k=>classes.delete(k)}}};
 const win={...node(),get localStorage(){if(blocked)throw new Error('Storage denied');return {getItem:k=>k===STORAGE_KEY?value:null,setItem:(k,v)=>{assert.equal(k,STORAGE_KEY);value=v;},removeItem:k=>{assert.equal(k,STORAGE_KEY);value=null;}};},setTimeout(fn,ms){deadline={fn,ms};return 1;},clearTimeout(){cleared++;}};
 initBirthdayPopup(doc,win,()=>current);
 return {dialog,image,check,button,doc,win,classes,get saved(){return value;},get deadline(){return deadline;},setDate:date=>{current=new Date(date);},setSaved:v=>{value=v;}};
}
for(const options of [{saved:DAY},{date:'2026-10-31T00:00:00+09:00'},{date:'2026-10-29T23:59:59+09:00'},{present:false}]){const t=setup(options);assert(!t.dialog.open);assert.equal(t.image.src,undefined,'No image request outside campaign or after opt-out');}
let t=setup();assert(t.dialog.open);assert.equal(t.deadline.ms,12*60*60*1000);assert(t.classes.has('birthday-popup-open'));assert(t.image.src);
t.button.events.click();assert(!t.dialog.open);assert(!t.classes.size);assert.equal(t.saved,null);assert(setup({saved:t.saved}).dialog.open,'Ordinary close does not opt out');
t=setup();t.check.checked=true;t.check.events.change();assert.equal(t.saved,DAY);t.button.events.click();assert(!setup({saved:t.saved}).dialog.open,'Opt-out survives another page visit');
t=setup();t.check.checked=true;t.check.events.change();t.check.checked=false;t.check.events.change();assert.equal(t.saved,null);
t=setup({blocked:true});t.check.checked=true;assert.doesNotThrow(()=>t.check.events.change());t.button.events.click();assert(!t.dialog.open);
t=setup();let prevented=false;t.dialog.events.cancel({preventDefault(){prevented=true;}});assert(prevented);assert(!t.dialog.open);
t=setup();t.dialog.events.click({target:t.dialog,clientX:50,clientY:50});assert(t.dialog.open);t.dialog.events.click({target:t.dialog,clientX:0,clientY:0});assert(!t.dialog.open);
t=setup();t.setDate('2026-10-31T00:00:00+09:00');t.deadline.fn();assert(!t.dialog.open);assert(!t.classes.size);
t=setup();t.setDate('2026-10-31T03:00:00+09:00');t.doc.events.visibilitychange();assert(!t.dialog.open);
t=setup();t.setSaved(DAY);t.win.events.storage({key:STORAGE_KEY});assert(!t.dialog.open,'Other-tab opt-out closes an open popup');
t=setup();t.image.events.error();assert(!t.dialog.open,'Missing image never strands a blank modal');
const root=path.resolve(__dirname,'..'),home=fs.readFileSync(path.join(root,'index.html'),'utf8'),archive=fs.readFileSync(path.join(root,'archive/index.html'),'utf8');
assert(home.includes(birthdayPopup()));assert(!archive.includes('id="birthdayPopup"'));
assert(!birthdayPopup().includes(' open'));assert(!birthdayPopup().includes(' src='),'Poster source is assigned only on the valid date');
const png=fs.readFileSync(path.join(root,'images/events/yeonji-birthday-20261030.png'));assert.equal(png.readUInt32BE(16),850);assert.equal(png.readUInt32BE(20),1063);
console.log('PASS birthday popup: fixed KST date boundaries, persistent opt-out, ordinary close/ESC/backdrop, unavailable storage, midnight/resume/cross-tab expiry, HOME-only markup and original poster.');
