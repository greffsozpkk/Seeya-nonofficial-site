'use strict';
const assert=require('node:assert/strict'),P=require('../src/shared/passport'),Play=require('../src/shared/passport-play'),S=require('../src/shared/passport-play-save'),C=require('../src/shared/passport-calendar'),V=require('../src/shared/calendar-view'),X=require('../src/shared/passport-extra');
const values=new Map(),adapter={getItem:k=>values.get(k)??null,setItem:(k,v)=>values.set(k,v)};
assert.equal(S.enabled(adapter),false);assert.equal(values.size,0);
S.preference(adapter,true);assert(S.enabled(adapter));S.preference(adapter,false);assert(!S.enabled(adapter));assert(!values.has(P.KEY));
const base={game:'exam',level:'재회 탐구 · 난이도 하',mode:'카드형',score:4,maxScore:100,correct:1,total:25};
const first=S.result('first-12345',{...base,name:'PRIVATE NAME',answers:{q:1}},new Date('2026-10-01T15:30:00Z'));
assert.equal(first.date,'2026-10-02');assert.equal(first.time,'00:30');assert(!JSON.stringify(first).includes('PRIVATE'));assert(!JSON.stringify(first).includes('answers'));
assert.equal(S.save(adapter,first).already,false);assert.equal(S.save(adapter,first).already,true);assert.equal(P.storage(adapter).get().entries.length,1);
const second=S.result('second-12345',base,new Date('2026-10-01T15:30:01Z'));S.save(adapter,second);assert.equal(P.storage(adapter).get().entries.length,2);
const lyric=S.result('lyrics-12345',{game:'lyrics',level:'LEVEL 2',score:7,maxScore:10,correct:9,total:10},new Date('2026-10-01T15:30:02Z'));S.save(adapter,lyric);assert.equal(lyric.play.correct,9);assert.equal(lyric.play.score,7);
const raw=adapter.getItem(P.KEY),state=P.validate(JSON.parse(raw));assert.deepEqual(P.validate(JSON.parse(JSON.stringify(state))),state);assert.equal(P.summary(state.entries).play,3);assert.equal(P.merge(state,state).entries.length,3);
const old=X.publicSummary(P.empty());delete old.c.play;assert.equal(X.checkSummary(old).c.play,0);
for(const patch of [{score:-1},{score:101},{score:1.5},{correct:26},{total:0},{game:'invalid'}])assert.throws(()=>Play.clean({...base,...patch}));
assert.equal(Play.clean({game:'other'}).score,null);
assert.throws(()=>S.save({getItem:()=>'{broken',setItem:()=>assert.fail('must not overwrite')},first));
assert.throws(()=>S.save({getItem:k=>adapter.getItem(k),setItem:()=>{throw Error('quota');}},S.result('quota-12345',base,new Date('2026-10-01T15:30:03Z'))));assert.equal(adapter.getItem(P.KEY),raw);
// Calendar dates are constrained to the actual occurrence, not arbitrary URL dates.
const multi={id:'two-day',date:'2026-08-29',endDate:'2026-08-30'};
assert.equal(C.selectedEvent(multi,'2026-08-30').date,'2026-08-30');assert.equal(C.selectedEvent(multi,'2026-08-31').date,'2026-08-29');assert.equal(C.selectedEvent(multi,'2026-02-30').date,'2026-08-29');
const annual={id:'anniversary',date:'2007-03-12',annual:true};assert.equal(C.selectedEvent(annual,'2027-03-12').date,'2027-03-12');assert.equal(C.selectedEvent(annual,'','2026-10-11').date,'2026-03-12');assert.notEqual(C.selectedEvent(annual,'2027-03-13').date,'2027-03-13');
const card={...multi,type:'performance',members:[],state:'confirmed',recordIds:[],sources:[],note:'',venue:'',time:''};assert(V.eventCard(card,false,'2026-08-30').includes('date=2026-08-30'));assert(!V.eventCard({...card,state:'cancelled'}).includes('/diary/'));
console.log('PASS passport play/calendar: opt-in preference, KST, result privacy, run dedupe, independent replays, quota/corruption preservation, backup and legacy QR, bounded event dates and cancellation.');

const fs=require('node:fs'),path=require('node:path');
const html=fs.readFileSync(path.join(__dirname,'../diary/index.html'),'utf8'),catalog=JSON.parse(html.match(/id="passportCatalog">([\s\S]*?)<\/script>/)[1]);
const seoul=catalog.events.find(e=>e.archiveId==='20260829-the-fan-seoul'&&e.date==='2026-08-29');
assert.equal(C.selectedEvent(seoul,'2026-08-30').date,'2026-08-30');
const calState=require('../src/shared/calendar-state').selectionFromURL('?month=2026-08&event=two-day&day=2026-08-30',[multi],'2026-10-11');assert.equal(calState.day,'2026-08-30');
