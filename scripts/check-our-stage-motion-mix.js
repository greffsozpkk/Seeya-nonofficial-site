'use strict';
const assert=require('node:assert/strict'),create=require('../src/client/our-stage-concert-motion'),tracks=require('../src/data/our-stage-choreography.json'),library=require('../src/shared/our-stage-motion-library'),channels=require('../src/shared/our-stage-motion-channels');
for(const random of [()=>0,()=>.999,Math.random]){const pick=create.makeQueue(random),ids=Array.from({length:120},pick);for(let i=0;i<ids.length;i++){assert(library[ids[i]]);if(i){assert.notEqual(ids[i],ids[i-1]);if(ids[i-1]==='scent')assert.equal(ids[i],'greeting');}if(i%4===3)assert.equal(new Set(ids.slice(i-3,i+1)).size,4);}}
for(const [id,t]of Object.entries(tracks)){assert.equal(t.frames[0].time,0);assert.equal(t.frames.at(-1).time,t.end-t.start);assert.equal(library[id].seconds,t.end-t.start);t.frames.forEach((f,i)=>{assert(!i||f.time>t.frames[i-1].time);for(const m of ['br','gr','yj'])assert(f.members[m].every(Number.isFinite));});}
const made=[];let mounts=0;
const element={animate:(frames,timing)=>{let resolve;const a={frames,timing,finished:new Promise(r=>resolve=r),finish:()=>resolve(),cancel(){this.cancelled=true;},pause(){this.paused=true;},play(){this.paused=false;}};made.push(a);return a;},querySelector:()=>element};
const stage={isConnected:true,dataset:{},classList:{add:()=>mounts++},querySelector:()=>element};
(async()=>{const ui=create({random:()=>.999,reduced:()=>false});ui.mount(stage,4500);assert.equal(stage.dataset.motion,'scent');assert.equal(made.length,33);assert.equal(made[0].timing.duration,32000);assert.equal(made[0].timing.delay,4500);
 ui.pause(true);assert(made.every(a=>a.paused));ui.pause(false);assert(made.every(a=>!a.paused));
 const first=made[0];first.finish();await Promise.resolve();assert.equal(stage.dataset.motion,'greeting');assert.equal(mounts,1);assert(first.cancelled);const second=made[33];assert.equal(second.timing.duration,28650);assert.equal(second.frames[0].transform,channels[''](tracks.scent.frames.at(-1).members.br));assert.equal(second.frames[1].transform,channels[''](tracks.greeting.frames[0].members.br));assert(second.frames[1].offset>0,'blend interval before next phrase');
 ui.stop();const count=made.length;second.finish();await Promise.resolve();assert.equal(made.length,count,'closed modal cannot schedule another phrase');assert(made.every(a=>a.cancelled));
 const reduced=create({reduced:()=>true});reduced.mount(stage);assert.equal(made.length,count,'reduced motion does not start animations');reduced.stop();
 console.log('PASS motion mix: complete 4-phrase shuffle, scent to greeting, no immediate repeats, smooth bridge, pause/resume, close cancellation and reduced motion.');
})().catch(e=>{console.error(e);process.exitCode=1;});

for(const id of ['marry','voice'])for(const m of ['br','gr','yj']){
 const frames=tracks[id].frames;
 assert(frames.every(f=>f.members[m][0]===0&&f.members[m][10]===0&&f.members[m][11]===0),'new routines keep each member in place');
 assert(frames.every((f,i)=>!i||f.time-frames[i-1].time<=.76),'no long held poses');
 for(let part=0;part<4;part++){
  const values=frames.filter(f=>f.time>=part*library[id].seconds/4&&f.time<(part+1)*library[id].seconds/4).map(f=>f.members[m][4]);
  assert(Math.max(...values)-Math.min(...values)>65,'each phrase has a visible arm sweep');
 }
}
