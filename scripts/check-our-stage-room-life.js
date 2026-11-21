'use strict';
const assert=require('node:assert/strict');
const classes=()=>{const s=new Set();return {add:x=>s.add(x),remove:x=>s.delete(x),contains:x=>s.has(x),toggle(x,on){if(on)s.add(x);else s.delete(x);}};};
const actors=Object.fromEntries(['br','gr','yj'].map(id=>{const emote={textContent:''},prop={innerHTML:''};return [id,{dataset:{member:id,pose:'idle'},style:{},classList:classes(),querySelector:q=>q==='.room-emote'?emote:prop}];}));
let callback=null,handler,now=1,modal=false,rafCount=0;
const pause={textContent:'',setAttribute(){}};
const room={isConnected:true,classList:classes(),querySelector:q=>actors[/data-member="([^"]+)"/.exec(q)?.[1]]};
const root={querySelector:q=>q==='.studio-room-v2'?room:q==='dialog[open]'?modal:q==='[data-room-action="pause"]'?pause:null,addEventListener:(kind,fn)=>{handler=fn;}};
global.document={hidden:false};global.matchMedia=()=>({matches:false});global.requestAnimationFrame=fn=>{callback=fn;return ++rafCount;};global.cancelAnimationFrame=()=>{callback=null;};
const ui=require('../src/client/our-stage-room-life')({root,sprite:()=>'<svg/>',members:[{id:'br',name:'보람'},{id:'gr',name:'규리'},{id:'yj',name:'연지'}],isTest:true});
const advance=ms=>{for(let t=0;t<ms;t+=50){now+=50;const fn=callback;callback=null;fn(now);}};
const click=(action,id)=>{const target=id?actors[id]:pause;target.dataset={...target.dataset,roomAction:action};handler({target:{closest:()=>target}});};
ui.bind();advance(2100);for(const id of ['br','gr','yj'])assert.equal(actors[id].dataset.pose,'walk','all three walk concurrently');
const others=JSON.stringify([actors.gr.style,actors.yj.style]);
click('touch','br');const touched=JSON.stringify(actors.br.style);advance(1200);
assert.equal(actors.br.dataset.pose,'wave');assert.equal(JSON.stringify(actors.br.style),touched,'touched member stops');
assert.notEqual(JSON.stringify([actors.gr.style,actors.yj.style]),others,'other members keep moving');
advance(3400);assert.equal(actors.br.dataset.pose,'water');assert.equal(actors.gr.dataset.pose,'stretch');assert.equal(actors.yj.dataset.pose,'capsule');assert(room.classList.contains('machine-turning'));
document.hidden=true;const before=JSON.stringify(actors.br.style);advance(3000);assert.equal(JSON.stringify(actors.br.style),before,'hidden page freezes travel');document.hidden=false;
click('next');advance(4000);assert.equal(actors.br.dataset.pose,'score');assert.equal(actors.gr.dataset.pose,'score');assert.equal(actors.yj.dataset.pose,'stretch');
modal=true;const pose=actors.gr.dataset.pose;advance(7000);assert.equal(actors.gr.dataset.pose,pose,'opening details freezes the routine');modal=false;
click('pause');const pos=JSON.stringify(actors.gr.style);advance(7000);assert.equal(JSON.stringify(actors.gr.style),pos);click('pause');
click('next');advance(4000);assert.equal(actors.br.dataset.pose,'stretch');assert.equal(actors.gr.dataset.pose,'water');assert.equal(actors.yj.dataset.pose,'score');
click('next');advance(4000);assert.equal(actors.br.dataset.pose,'hair');assert.equal(actors.yj.dataset.pose,'greet');
assert.equal(actors.gr.dataset.pose,'idle','neighbour waits briefly before replying');
assert.equal(actors.yj.dataset.greetingSide,'left');assert.equal(actors.gr.dataset.greetingSide,'right');
advance(700);assert.equal(actors.gr.dataset.pose,'greet','neighbour replies to greeting');
click('touch','gr');advance(700);assert.equal(actors.gr.dataset.pose,'wave','touch response takes priority over greeting');
click('next');advance(3200);assert.equal(actors.br.dataset.pose,'hum');
// Sample several complete independent cycles. Horizontal clearance prevents full-height
// sprite occlusion regardless of vertical travel, actions, or a stationary touch target.
const seen=new Set();
for(let t=0;t<120000;t+=100){
 advance(100);
 for(const id of ['br','gr','yj'])seen.add(actors[id].dataset.pose);
 const x=['br','gr','yj'].map(id=>parseFloat(actors[id].style.left));
 assert(x[1]-x[0]>=22&&x[2]-x[1]>=22,'separate routes keep at least 22% horizontal clearance');
 for(const id of ['br','gr','yj']){const y=parseFloat(actors[id].style.top);assert(y>=74&&y<=90);}
 if(t===30000)click('touch','gr');
}
for(const kind of ['hair','hum','greet','capsule','water','score','stretch'])assert(seen.has(kind),'routine is reachable: '+kind);
ui.bind();advance(100);assert.equal(typeof callback,'function');room.isConnected=false;advance(50);assert.equal(callback,null,'no detached room animation loop');
console.log('PASS room life: concurrent independent routines, 120-second clearance audit, individual touch, hidden/modal/manual pause and detached-room cleanup.');
