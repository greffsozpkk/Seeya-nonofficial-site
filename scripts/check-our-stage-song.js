'use strict';
const assert=require('node:assert/strict'),clock=require('../src/shared/our-stage-song-clock'),G=require('../src/shared/our-stage-mini')(true);
const songs=require('../src/data/our-stage-rhythm-songs.json'),catalog=require('../src/data/worldcup-songs.json').candidates;
assert.equal(songs.length,3);
for(const song of songs){
 assert(catalog.some(x=>x.youtubeId===song.youtubeId&&x.channel==='SEEYA Official'));
 const chart=song.chart;assert.equal(chart.notes.length,32);assert.equal(chart.notes[0]-chart.startMs,3000);assert(chart.notes.every((n,i)=>Number.isInteger(n)&&(!i||n>chart.notes[i-1]+200)));
 const m=G.fresh(),id=G.start(m,'rhythm',10000);assert(!G.beginChart(m,id,10000,'missing'));assert(G.beginChart(m,id,10000,song.id));assert(G.valid(m));
 const c=clock(chart),epoch=m.active.beatStart;c.arm(epoch);
 assert.equal(c.sample(0,false,0).now,null);assert.equal(c.sample(chart.startMs/1000,true,1).now,epoch-3000);
 assert.equal(c.sample(chart.startMs/1000+.1,false,101).now,null);assert.equal(c.sample(chart.startMs/1000+.1,false,20101).now,null);
 assert.equal(c.sample(chart.startMs/1000+.1,true,20102).now,epoch-2900);
 assert.equal(c.sample(chart.startMs/1000+.2,true,20202).now,epoch-2800);
 assert(c.sample(200,true,20203).jump);assert.equal(c.sample(201,true,21203).now,null);
 c.arm(epoch);assert.equal(c.sample((chart.startMs-1000)/1000,true,0).now,epoch-4000);assert(c.sample((chart.startMs-1000)/1000,true,1,1.5).jump);
 for(const [i,offset]of G.offsets(m.active).entries()){assert.equal(G.tap(m,id,epoch+offset),i+1);assert(G.valid(m));}
 const end=G.endAt(m.active);assert.equal(G.finish(m,id,end-1),null);assert.deepEqual(G.finish(m,id,end),{kind:'rhythm',correct:32,total:32,reward:16});assert.equal(G.finish(m,id,end),null);
}
for(const tempo of [400,700,1500]){const m=G.fresh(),id=G.start(m,'rhythm',10000);assert(G.beginSong(m,id,10000,tempo));for(const o of G.offsets(m.active))G.tap(m,id,m.active.beatStart+o);assert(G.valid(m));assert.equal(G.finish(m,id,G.endAt(m.active)).reward,16);}
const m=G.fresh(),id=G.start(m,'rhythm',10000);G.beginChart(m,id,10000,songs[0].id);for(const o of G.offsets(m.active).slice(0,16))G.tap(m,id,m.active.beatStart+o);assert.equal(G.finish(m,id,G.endAt(m.active)).reward,8);
console.log('PASS fixed song charts: 3 official songs, 32 timestamped notes each, pause/buffer freeze, keyframe tolerance, seek/rate reset, proportional rewards once, legacy save compatibility.');
