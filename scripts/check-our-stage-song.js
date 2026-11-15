'use strict';
const assert=require('node:assert/strict'),clock=require('../src/shared/our-stage-song-clock'),G=require('../src/shared/our-stage-mini')(true);
const c=clock(),m=G.fresh(),id=G.start(m,'rhythm',10000);
for(let i=0;i<4;i++){assert(!c.sample(10+i*.6,true,i*600).jump);const r=c.tap(10+i*.6);assert.equal(r.count,i+1);if(i===3){assert.equal(r.tempo,600);assert(G.beginSong(m,id,10000,r.tempo));c.begin(m.active.beatStart);}}
assert(G.valid(m));const start=m.active.beatStart;
assert.equal(c.sample(12,false,200).jump,true); // Seeking invalidates the whole grid.
assert.equal(c.sample(12,true,201).now,null);
G.resetBeat(m,id);assert(G.valid(m));assert.equal(G.finish(m,id,999999),null);
const paused=clock();for(let i=0;i<4;i++){paused.sample(10+i*.5,true,i*500);paused.tap(10+i*.5);}assert(G.beginSong(m,id,10000,500));paused.begin(m.active.beatStart);
assert.equal(paused.sample(12,false,2000).now,null);
assert.equal(paused.sample(12,false,22000).now,null); // Twenty seconds paused never finish the game.
const resume=paused.sample(12,true,22001);assert(!resume.jump);assert.equal(resume.now,start-1500);
assert.equal(paused.sample(12.5,true,22501).now,start-1000);
assert.equal(paused.sample(40,true,22502).jump,true);assert.equal(paused.sample(40.01,true,22512).now,null);
for(const tempo of [400,700,1500]){const s=G.fresh(),key=G.start(s,'rhythm',10000);assert(G.beginSong(s,key,10000,tempo));for(const [i,offset]of G.offsets(s.active).entries()){assert.equal(G.tap(s,key,s.active.beatStart+offset),i+1);assert(G.valid(s));}const end=G.endAt(s.active);assert.equal(G.finish(s,key,end-1),null);assert.equal(G.finish(s,key,end).reward,16);assert.equal(G.finish(s,key,end),null);}
for(const tempo of [0,399,1501,NaN,700.1]){const s=G.fresh(),key=G.start(s,'rhythm',10000);assert(!G.beginSong(s,key,10000,tempo));assert.equal(s.active.beatStart,null);}
const uneven=clock();let retry;[0,.5,1.6,2.1].forEach((v,i)=>{uneven.sample(v,true,v*1000);retry=uneven.tap(v);});assert(retry.retry);
const bad=G.fresh();G.start(bad,'rhythm',10000);bad.active.tempoMs=500;assert(!G.valid(bad));
const songs=require('../src/data/our-stage-rhythm-songs.json'),catalog=require('../src/data/worldcup-songs.json').candidates;assert.equal(songs.length,3);for(const song of songs){assert(catalog.some(x=>x.youtubeId===song.youtubeId&&x.channel==='SEEYA Official'));}
console.log('PASS song rhythm: calibrated tempo, media clock, pause/buffer freeze, seek reset, tempo bounds, eight unique hits, no duplicate reward, official source catalog.');
