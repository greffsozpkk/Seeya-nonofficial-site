"use strict";
const assert=require('node:assert/strict'),factory=require('../src/client/our-stage-backups');
const start=Date.UTC(2026,10,21,14,59,59),history='game-backups-v1';
const state=n=>({n,simple:{concerts:{}},solo:{concerts:{}}});
function load(raw){const s=JSON.parse(raw);if(!Number.isInteger(s.n)||s.n<0)throw Error('bad save');return s;}
const summarize=(s,id)=>({album:id||'album-'+s.n,songs:s.n,solo:0});
function harness(){const map=new Map();let quota=Infinity,deny=false;const storage={getItem:k=>map.get(k)||null,setItem:(k,v)=>{if(deny||v.length>quota)throw Error('quota');map.set(k,v);}};const make=key=>factory({storage,key,load,summary:summarize});return {map,make,storage,setQuota:n=>quota=n,deny:v=>deny=v};}
const h=harness(),b=h.make('game');let s=state(2);
assert(b.auto(s,start).ok);assert.equal(b.entries().length,1);assert.equal(b.entries()[0].reason,'하루 첫 접속');
assert(b.auto(s,start+500).ok);assert.equal(b.entries().length,1);
const another=h.make('game');another.auto(s,start+600);assert.equal(b.entries().length,1,'another tab must not duplicate daily backups');
b.auto(s,start+1000,false);assert.equal(b.entries().length,1,'hidden tab does not count as first visit');
b.auto(s,start+1000);assert.equal(b.entries().length,2,'KST midnight');b.auto(s,start-86400000);assert.equal(b.entries().length,2,'clock rollback');
s.simple.concerts.first={at:start+2000};b.auto(s,start+2000);assert.match(b.entries()[0].reason,/콘서트 완료.*first/);const n=b.entries().length;b.auto(s,start+3000);assert.equal(b.entries().length,n);
s.solo.concerts.solo={at:start+4000};b.auto(s,start+4000);assert.match(b.entries()[0].reason,/solo/);
const existing=h.make('old');existing.auto(s,start);assert.equal(existing.entries().length,1,'existing concerts should not flood history');
const pub=h.make('public');pub.auto(state(0),start);assert.equal(pub.entries().length,1);assert.equal(b.entries().length,n+1);
assert(b.add(state(4),'직접 백업',start+5000).ok);const target=b.entries()[0].id;
let current=JSON.stringify(state(8));const result=b.restore(target,current,next=>{current=JSON.stringify(next);return true;},start+6000);assert(result.ok);assert.equal(load(current).n,4);assert.equal(b.entries()[0].reason,'복원 직전 기록');
const undo=b.entries()[0].id;assert(b.restore(undo,current,next=>{current=JSON.stringify(next);return true;},start+7000).ok);assert.equal(load(current).n,8);
const before=current;assert(!b.restore('missing',current,()=>{throw Error('must not run');},start+8000).ok);assert.equal(current,before);
assert(!b.restore(target,current,()=>false,start+9000).ok);assert.equal(current,before,'failed live save preserves current state');
assert(b.restore(target,'broken JSON',()=>true,start+10000).ok);assert.equal(b.entries()[0].valid,false);assert.equal(b.raw(b.entries()[0].id),'broken JSON');
for(let i=0;i<20;i++)assert(b.add(state(i),'직접 백업',start+11000+i).ok);assert.equal(b.entries().length,12);assert.equal(b.entries()[0].songs,19);
const count=b.entries().length;const raw=h.map.get(history);h.deny(true);assert(!b.add(state(40)).ok);assert.equal(h.map.get(history),raw);let committed=false;assert(!b.restore(b.entries()[0].id,current,()=>{committed=true;return true;}).ok);assert(!committed,'do not restore without preserving previous state');h.deny(false);
h.map.set(history,'bad history');assert.equal(b.entries().length,0);assert(b.error);assert(!b.add(state(0)).ok);assert.equal(h.map.get(history),'bad history','never silently overwrite damaged history');
const q=harness(),qb=q.make('game');qb.add(state(1),'manual',start);qb.add(state(2),'manual',start+1);const one=JSON.stringify({...JSON.parse(q.map.get(history)),entries:JSON.parse(q.map.get(history)).entries.slice(0,1)}).length;q.setQuota(one+30);assert(qb.add(state(3),'manual',start+2).ok);assert.equal(qb.entries()[0].songs,3);assert(qb.entries().length<3);
// Actual game snapshots survive validation and restoration, including timed practice.
const base=require('../src/shared/our-stage');const M=require('../src/shared/our-stage-leisure')(require('../src/shared/our-stage-first-release')(require('../src/shared/our-stage-simple')(base)));
const real=harness(),rb=factory({storage:real.storage,key:'real',load:M.loadSave,summary:()=>({album:'first',songs:1,solo:0})});const fresh=M.fresh(start);assert(M.trainAll(fresh,'scent',start));assert(rb.add(fresh,'manual',start).ok);assert.equal(rb.get(rb.entries()[0].id).active.end,fresh.active.end);
const restored=rb.restore(rb.entries()[0].id,JSON.stringify(M.fresh(start)),next=>M.valid(next),start+1);assert(restored.ok);assert(M.valid(restored.state));
console.log('PASS backup history: KST/hidden/clock boundaries, multi-instance dedup, concert/solo/manual events, isolation, restore+undo, damaged save recovery, corrupt history preservation, quota fail-safe and bounded retention.');
