'use strict';
const assert=require('node:assert/strict');
const make=test=>require('../src/shared/our-stage-leisure')(require('../src/shared/our-stage-first-release')(require('../src/shared/our-stage-simple')(test?require('../src/shared/our-stage').forTest():require('../src/shared/our-stage'))));
const M=make(false),T=make(true),start=1800000000000;
const durations=[15,20,25,30,35,40,45,60];
assert.equal(M.timing.recoveryMs,90000);assert.equal(T.timing.recoveryMs,1000);
for(const [i,a] of M.albums.entries())for(const t of a.tracks){
 assert.equal([0,1,2].reduce((n,l)=>n+M.lessonSeconds(t.id,l),0),durations[i]);
 assert.equal([0,1,2].reduce((n,l)=>n+T.lessonSeconds(t.id,l),0),3);
}
const energy=M.fresh(start);energy.points=0;
M.settle(energy,start+89999);assert.equal(energy.points,0);
M.settle(energy,start+90000);assert.equal(energy.points,5);
M.settle(energy,start+180000);assert.equal(energy.points,10);
M.settle(energy,start);assert.equal(energy.points,10);
M.settle(energy,start+1800000);assert.equal(energy.points,100);
let s=M.fresh(start),now=start,trained=0;
assert.equal(M.practiceSeconds(s,'scent'),3);assert.equal(T.practiceSeconds(T.fresh(start),'scent'),1);
function practice(id,expected){
 M.settle(s,now);
 if(s.simple.debuted&&s.points<15){now=s.energyAt+Math.ceil((15-s.points)/5)*90000;M.settle(s,now);}
 assert.equal(M.practiceSeconds(s,id),expected);
 const before=now,balance=s.points,free=!s.simple.debuted;
 assert(M.trainAll(s,id,now));assert.equal(s.points,balance-(free?0:15));
 while(s.active){
  const end=s.active.end,lesson=s.active.lesson;
  s=M.loadSave(JSON.stringify(s));assert.equal(s.active.end,end,'reload preserves active deadline');
  M.settle(s,end-1);assert(!s.tracks[id].includes(lesson),'lesson must not finish early');
  now=end;M.settle(s,now);assert(s.tracks[id].includes(lesson));assert(M.valid(s));
 }
 assert.equal(now-before,expected*1000);assert.equal(M.practiceSeconds(s,id),0);trained++;
}
practice('scent',3);now+=5000;assert(M.finishDebut(s,now));
for(const [i,a] of M.albums.entries()){
 while(!M.concertReady(s,a.id))practice(a.tracks.find(t=>!M.ready(s,t.id)).id,durations[i]);
 now+=M.concertTracks(s,a.id).length*4000+(a.id==='still-here'?8100:4500);
 assert(M.finishConcert(s,a.id,M.concertTracks(s,a.id),now));M.settle(s,now);assert(M.valid(s));
}
assert.equal(trained,80);assert.equal(now-start,19638500,'progression with full concerts takes 5h27m18.5s');
assert.equal(Object.keys(s.simple.concerts).length,8);
console.log('PASS pacing: all album durations, 90-second recovery/cap/rollback, partial save reload, unchanged fast tests, 8-album production journey in 5h27m18.5s.');
