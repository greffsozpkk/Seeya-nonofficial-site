'use strict';
const assert=require('node:assert/strict'),vm=require('node:vm'),fs=require('node:fs');
let clock=0,next=0,paid=0,allowed=true,fail=false;const timers=new Map();
class Element{constructor(){this.style={};this.dataset={};this.isConnected=true;this.children=[];}setAttribute(){}removeAttribute(k){if(k==='data-action')delete this.dataset.action;}append(e){this.children.push(e);}replaceChildren(...e){this.children=e;}remove(){this.isConnected=false;} }
const nodes={'#concertCoinCount':new Element(),'#concertCoinStatus':new Element()},ctx={module:{exports:{}},document:{createElement:()=>new Element()}};
vm.runInNewContext(fs.readFileSync(require.resolve('../src/client/our-stage-concert-coins'),'utf8'),ctx);
const ui=ctx.module.exports({root:{querySelector:q=>nodes[q]},award:()=>{if(fail)throw Error('save failed');paid++;return true;},allowed:()=>allowed,now:()=>clock,random:()=>0,setTimer:(fn,ms)=>{timers.set(++next,{fn,at:clock+ms});return next;},clearTimer:id=>timers.delete(id)});
function advance(ms){const until=clock+ms;for(;;){const entry=[...timers].sort((a,b)=>a[1].at-b[1].at)[0];if(!entry||entry[1].at>until)break;clock=entry[1].at;timers.delete(entry[0]);entry[1].fn();}clock=until;}
function mount(duration=4000){const stage=new Element();ui.mount(stage,duration);return stage;}
function coin(stage){return stage.children.at(-1).children[0];}
ui.begin();let stage=mount();advance(650);let id=coin(stage).dataset.value;
assert(ui.claim(id));assert(!ui.claim(id));assert.equal(paid,1);assert.equal(nodes['#concertCoinCount'].textContent,'1');
stage=mount();advance(650);id=coin(stage).dataset.value;advance(2400);assert(!ui.claim(id),'expired coins do not pay');
stage=mount();advance(650);id=coin(stage).dataset.value;ui.pause(true);advance(10000);assert(!ui.claim(id));ui.pause(false);assert(ui.claim(id),'pause preserves remaining lifetime');
stage=mount();advance(650);id=coin(stage).dataset.value;ui.clearStage();assert(!ui.claim(id));assert.equal(timers.size,0);
stage=mount();advance(650);id=coin(stage).dataset.value;mount();assert(!ui.claim(id),'old scene token rejected');
ui.clearStage();allowed=false;stage=mount();advance(4000);assert(!coin(stage),'background has no collectible');allowed=true;
ui.begin();const before=paid;for(let i=0;i<15;i++){stage=mount();advance(650);const c=coin(stage);if(c)ui.claim(c.dataset.value);}assert.equal(paid-before,12,'bounded bonuses even if user repeats a paused scene');
ui.begin();stage=mount();advance(650);id=coin(stage).dataset.value;fail=true;assert.throws(()=>ui.claim(id),/save failed/);assert(!ui.claim(id),'save failure cannot replay consumed tap');ui.clearStage();
console.log('PASS concert coins: once-only claims, expiry, pause/resume, scene/close cleanup, hidden tabs, per-show limit and save failures.');
