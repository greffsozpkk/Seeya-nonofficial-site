'use strict';
const assert=require('node:assert/strict'),M=require('../src/shared/our-stage').forTest(),G=M.mini;
let s=M.fresh(),now=Date.parse('2026-11-15T00:00:00Z');
const old={...s,version:10,gigs:10};delete old.mini;s=M.loadSave(JSON.stringify(old));assert.equal(s.version,11);assert.equal(M.coins(s),100);assert(G.valid(s.mini));
assert.equal(G.cooldown,60000);assert.equal(require('../src/shared/our-stage').mini.cooldown,900000);
function quiz(m,t){const id=G.start(m,'quiz',t);assert(id);assert(!G.start(m,'rhythm',t));for(let i=0;i<3;i++){const q=G.question(m.active);assert(G.answer(m,id,q.answer));}return [id,G.finish(m,id,t+1)];}
let [id,r]=quiz(s.mini,now);assert.equal(r.reward,15);assert.equal(G.finish(s.mini,id,now+2),null);assert(!G.start(s.mini,'quiz',now+59999));assert.equal(M.coins(s),115);
s=M.loadSave(JSON.stringify(s));assert(!G.start(s.mini,'quiz',now+2000));
id=G.start(s.mini,'rhythm',now+10);assert(id);assert(G.beginBeat(s.mini,id,now+20));const first=s.mini.active.beatStart;
assert.equal(G.finish(s.mini,id,first),null);assert.equal(G.tap(s.mini,id,first-1000),0);
for(let i=0;i<8;i++){assert.equal(G.tap(s.mini,id,first+i*700),i+1);assert.equal(G.tap(s.mini,id,first+i*700+1),null);}
r=G.finish(s.mini,id,first+5100);assert.equal(r.reward,16);assert.equal(M.coins(s),131);assert.equal(G.finish(s.mini,id,first+5200),null);
// Four more plays exhaust the daily budget, including abandoned/failed games.
for(let i=1;i<=4;i++){id=G.start(s.mini,'quiz',now+i*60000);assert(id);assert(G.abandon(s.mini,id));}
assert.equal(s.mini.plays,6);assert(!G.canStart(s.mini,'rhythm',now+86400000-32400000-1));
assert(!G.canStart(s.mini,'quiz',now-86400000));
assert(G.canStart(s.mini,'quiz',Date.parse('2026-11-15T15:00:00Z')));
id=G.start(s.mini,'quiz',Date.parse('2026-11-15T15:00:00Z'));assert.equal(s.mini.plays,1);
assert(!G.answer(s.mini,id,-1));assert(!G.answer(s.mini,'stale',0));assert(!G.answer(s.mini,id,999));
const q=G.question(s.mini.active);G.answer(s.mini,id,(q.answer+1)%q.choices.length);assert.equal(G.score(s.mini.active),0);
const resumed=M.loadSave(JSON.stringify(s));assert.equal(resumed.mini.active.answers.length,1);
for(const mutate of [m=>m.earned=-1,m=>m.plays=7,m=>m.day='2026-02-30',m=>m.next.quiz=-1,m=>m.active.keys[0]='unknown',m=>m.active.answers.push(999)]){const bad=structuredClone(s);mutate(bad.mini);assert(!M.valid(bad));}
// Fully completed story saves can still earn through play without unlock dependencies.
const full=structuredClone(require('./check-our-stage-cards').complete),balance=M.coins(full);quiz(full.mini,now);assert.equal(M.coins(full),balance+15);assert(M.valid(full));
console.log('PASS minigame rewards, cooldown/reload, KST daily cap, abandonment, invalid saves, old wallet migration, rhythm timing and one-time payout, post-story play.');
