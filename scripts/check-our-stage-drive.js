'use strict';
const assert=require('node:assert/strict'),D=require('../src/shared/our-stage-drive');
const startTime=Date.UTC(2026,10,20,3),s=D.fresh();
assert.ok(D.valid(s));
function win(at){const ticket=D.start(s,at),r=D.create(ticket.id,42);r.elapsed=D.duration;r.done=true;return D.finish(s,r,at+D.duration);}
assert.equal(win(startTime).coins,10);assert.equal(win(startTime+60000).coins,10);
assert.equal(win(startTime+120000).coins,0);assert.equal(s.earned,20);assert.equal(D.remaining(s,startTime),0);
const failed=D.create(D.start(s,startTime+180000).id);failed.done=true;failed.hits=2;
assert.equal(D.finish(s,failed,startTime+181000).coins,0);assert.equal(s.count,2);
assert.equal(D.finish(s,failed,startTime+182000),null,'a run settles once');
assert.equal(win(startTime+86400000).coins,10);assert.equal(s.count,1);assert.equal(s.earned,30);
assert.equal(win(startTime).coins,0,'turning the clock back cannot reset rewards');
const early=D.create(D.start(s,startTime+90000000).id);early.elapsed=D.duration;early.done=true;
assert.equal(D.finish(s,early,startTime+90000001).coins,0,'wall time also protects completion');
assert.equal(D.valid({...s,count:3}),false);assert.equal(D.valid({...s,earned:s.earned+1}),false);
const routeCoverage={};
for(const difficulty of Object.keys(D.difficulties))for(let seed=1;seed<=300;seed++){
 const r=D.create(seed,seed,difficulty);routeCoverage[difficulty]??=new Set();routeCoverage[difficulty].add(r.pattern);let frames=0;
 while(!r.done&&frames++<1000){
  const threats=r.rows.filter(c=>c.y>240&&c.y<430),safe=[0,1,2].filter(l=>!threats.some(c=>c.lane===l));
  if(safe.length&&!safe.includes(r.lane))r.lane=safe.sort((a,b)=>Math.abs(a-r.x)-Math.abs(b-r.x))[0];
  D.advance(r,50);
 }
 assert.equal(r.elapsed,30000,difficulty+' route remains avoidable for seed '+seed);assert.equal(r.hits,0);
}
for(const difficulty of Object.keys(D.difficulties))assert.deepEqual([...routeCoverage[difficulty]].sort(),[...D.patterns].sort());
for(const prior of D.patterns)for(let seed=1;seed<=100;seed++)assert.notEqual(D.create(1,seed,'normal',prior).pattern,prior,'retry avoids the previous pattern');
const crash=D.create(1);crash.rows=[{lane:1,y:370}];D.advance(crash,50);assert.equal(crash.hits,1);
crash.rows=[{lane:1,y:370}];D.advance(crash,50);assert.equal(crash.hits,1,'collision grace period');
crash.immune=0;D.advance(crash,50);assert.equal(crash.done,true);assert.equal(crash.hits,2);
const M=require('../src/shared/our-stage-leisure')(require('../src/shared/our-stage-first-release')(require('../src/shared/our-stage-simple')(require('../src/shared/our-stage').forTest())));
const state=M.fresh(startTime),before=M.coins(state);state.leisure.drive=s;
assert.equal(M.coins(state),before+30);assert.ok(M.valid(state));
const restored=M.loadSave(JSON.stringify(state));assert.equal(M.coins(restored),M.coins(state));
delete state.leisure.drive;assert.deepEqual(M.loadSave(JSON.stringify(state)).leisure.drive,D.fresh(),'existing saves migrate');
console.log('PASS schedule drive: 900 avoidable routes across all nine difficulty/pattern combinations, collisions/grace, 30s, separate two/day rewards, retry/dedup, KST/clock rollback and wallet/save migration.');

// Exercise the actual client loop and touch handlers without a browser or wall-clock waits.
const T=require('../src/shared/our-stage-test-tools')(M),clientState=T.create('album:lovely-sweet-heart',startTime);
const savedGlobals={document:global.document,requestAnimationFrame:global.requestAnimationFrame,cancelAnimationFrame:global.cancelAnimationFrame,now:Date.now};
let frame=null,clock=startTime,engine,ui,html='',elements={},visibility;
const context={fillRect(){},fillText(){}};
const makeCanvas=()=>({isConnected:true,getContext:()=>context,focus(){},setPointerCapture(){},getBoundingClientRect:()=>({left:0,width:320})});
try{
 const listeners=new Map();global.document={hidden:false,addEventListener:(name,fn)=>{listeners.set(name,fn);if(name==='visibilitychange')visibility=fn;},removeEventListener:(name,fn)=>{if(listeners.get(name)===fn)listeners.delete(name);}};
 global.requestAnimationFrame=fn=>{frame=fn;return 1;};global.cancelAnimationFrame=()=>{frame=null;};Date.now=()=>clock;
 const root={querySelector:q=>elements[q]||null},wallet=M.coins(clientState);
 ui=require('../src/client/our-stage-drive')({M:{...M,drive:{...D,create:(...a)=>(engine=D.create(...a))}},root,state:()=>clientState,
  save:()=>assert.ok(M.valid(clientState)),locked:f=>f(),sync(){},button:label=>label,
  openDrivePage:()=>{if(elements['#scheduleRoad'])elements['#scheduleRoad'].isConnected=false;elements={'#scheduleRoad':makeCanvas(),'#driveTime':{},'#driveHits':{},'#driveStatus':{},'#driveOverlay':{},'[data-action="drive-pause"]':{}};html=ui.panel();},exitDrivePage(){}});
 function step(){const fn=frame;frame=null;clock+=50;if(fn)fn(clock);}
 function arrive(){for(let n=0;n<750&&frame;n++){
  const threats=engine.rows.filter(c=>c.y>240&&c.y<430),safe=[0,1,2].filter(l=>!threats.some(c=>c.lane===l));
  if(safe.length&&!safe.includes(engine.lane)){
   const x=78+82*safe[0],c=elements['#scheduleRoad'];c.onpointerdown({preventDefault(){},pointerId:1,clientX:x});c.onpointerup({pointerId:1,clientX:x});
  }
  step();
 }assert.match(html,/스케줄 도착!/);}
 ui.handle('drive-open');assert.match(html,/data-value="normal" aria-pressed="true"/);ui.handle('drive-difficulty','easy');ui.handle('drive-start');step();assert.equal(engine.difficulty,'easy');ui.handle('drive-difficulty','hard');assert.equal(engine.difficulty,'easy','difficulty is fixed during a run');
 ui.handle('drive-pause');const pausedAt=engine.elapsed;for(let n=0;n<100;n++)step();assert.equal(engine.elapsed,pausedAt);
 ui.handle('drive-pause');global.document.hidden=true;visibility();for(let n=0;n<10;n++)step();assert.equal(engine.elapsed,pausedAt);
 global.document.hidden=false;ui.handle('drive-pause');arrive();assert.equal(M.coins(clientState),wallet+8);assert.match(html,/\+8 코인/);
 ui.handle('drive-difficulty','hard');ui.handle('drive-start');arrive();assert.equal(M.coins(clientState),wallet+20);
 ui.handle('drive-start');arrive();assert.equal(M.coins(clientState),wallet+20);assert.match(html,/오늘 보상 2회를 모두 받았어요/);
 ui.handle('drive-start');for(let n=0;n<65;n++)step();
 function pressKey(overrides={}){let prevented=false;const event={key:'ArrowLeft',code:'ArrowLeft',target:{closest:()=>null},preventDefault(){prevented=true;},...overrides};listeners.get('keydown')?.(event);return prevented;}
 engine.lane=1;assert.equal(pressKey(),true);assert.equal(engine.lane,0,'steers after focus leaves the canvas');
 assert.equal(pressKey({key:'ㅇ',code:'KeyD'}),true);assert.equal(engine.lane,1,'physical D key works with Korean layout');
 assert.equal(pressKey({key:'ㅁ',code:'KeyA',isComposing:true}),true);assert.equal(engine.lane,0);
 engine.lane=1;assert.equal(pressKey({ctrlKey:true}),false);assert.equal(engine.lane,1);
 assert.equal(pressKey({target:{closest:()=>({tagName:'INPUT'})}}),false);assert.equal(engine.lane,1);
 assert.equal(pressKey({target:{isContentEditable:true}}),false);assert.equal(engine.lane,1);
 elements['#stageModal']={open:true};assert.equal(pressKey(),false);assert.equal(engine.lane,1);delete elements['#stageModal'];
 ui.handle('drive-pause');assert.equal(pressKey(),false);assert.equal(engine.lane,1);ui.handle('drive-pause');
 engine.hits=1;engine.immune=0;engine.rows=[{lane:engine.x,y:370,color:0}];
 const earnedBeforeCrash=M.coins(clientState),countBeforeCrash=clientState.leisure.drive.count;
 step();assert.equal(engine.hits,2);assert.match(elements['#driveStatus'].textContent,/쿵/);
 assert.doesNotMatch(html,/다른 차와 두 번/,'impact is shown before the result');
 const crashTime=engine.elapsed,crashY=engine.rows[0].y;
 ui.handle('drive-pause');for(let n=0;n<25;n++)step();assert.equal(engine.elapsed,crashTime);
 assert.doesNotMatch(html,/다른 차와 두 번/,'pausing also freezes the impact');ui.handle('drive-pause');
 for(let n=0;n<10;n++)step();assert.equal(engine.rows[0].y,crashY);assert.doesNotMatch(html,/다른 차와 두 번/);
 for(let n=0;n<12;n++)step();assert.match(html,/다른 차와 두 번/,'result follows the short impact');
 assert.equal(M.coins(clientState),earnedBeforeCrash);assert.equal(clientState.leisure.drive.count,countBeforeCrash);assert.equal(frame,null);
 ui.handle('drive-start');for(let n=0;n<65;n++)step();engine.hits=1;engine.immune=0;engine.rows=[{lane:engine.x,y:370,color:0}];step();
 ui.handle('drive-exit');assert.equal(frame,null,'leaving during impact cancels its pending result');assert.equal(listeners.has('keydown'),false,'exit removes keyboard handling');
 console.log('PASS schedule client: touch-driven arrival, automatic payment twice, free practice, pause/background freeze, focus-independent keyboard/IME/input guards and exit cancellation.');
}finally{global.document=savedGlobals.document;global.requestAnimationFrame=savedGlobals.requestAnimationFrame;global.cancelAnimationFrame=savedGlobals.cancelAnimationFrame;Date.now=savedGlobals.now;}

// The shared daily limit survives changing difficulty, retries, reloads and old saves.
for(const first of Object.keys(D.difficulties))for(const second of Object.keys(D.difficulties)){
 const ledger=D.fresh();let at=startTime;
 const complete=(difficulty,hits=0)=>{const ticket=D.start(ledger,at,difficulty),r=D.create(ticket.id,7,difficulty);r.done=true;r.elapsed=D.duration;r.hits=hits;at+=60000;return D.finish(ledger,r,at);};
 assert.equal(complete(first,2).coins,0);assert.equal(ledger.count,0);
 assert.equal(complete(first).coins,D.difficulties[first].reward);
 assert.equal(complete(second).coins,D.difficulties[second].reward);
 assert.equal(complete('hard').coins,0);assert.equal(ledger.count,2);
 assert.equal(ledger.earned,D.difficulties[first].reward+D.difficulties[second].reward);
 assert.ok(D.valid(JSON.parse(JSON.stringify(ledger))));
 assert.equal(D.valid({...ledger,earned:ledger.earned+2}),false);
 assert.equal(D.valid({...ledger,wins:{easy:0,normal:0,hard:0}}),false);
 const test=M.fresh(startTime);test.leisure.drive=ledger;const loaded=M.loadSave(JSON.stringify(test));assert.equal(loaded.leisure.drive.earned,ledger.earned);
}
const old={day:D.day(startTime),count:1,earned:30,paid:3,serial:3,active:null};
assert.ok(D.valid(old));const legacyTicket=D.start(old,startTime,'hard');
assert.deepEqual(old.wins,{easy:0,normal:3,hard:0});
const upgrade=D.create(legacyTicket.id,1,'hard');upgrade.elapsed=D.duration;upgrade.done=true;
assert.equal(D.finish(old,upgrade,startTime+D.duration).coins,12);assert.equal(old.earned,42);assert.equal(old.count,2);
const protectedLedger=D.fresh(),t=D.start(protectedLedger,startTime,'easy'),wrong=D.create(t.id,1,'hard');wrong.done=true;wrong.elapsed=D.duration;
assert.equal(D.finish(protectedLedger,wrong,startTime+D.duration),null,'run cannot switch to a higher reward');
assert.ok(protectedLedger.active);assert.equal(D.start(protectedLedger,startTime,'invalid'),null);
console.log('PASS drive difficulties: 8/10/12 payouts, all nine mixed daily pairs, failure/reload, legacy earnings, invalid tiers and reward mismatch protection.');

const fingerprints=new Set();
for(let seed=1;seed<=30;seed++){
 const r=D.create(1,seed,'normal'),route=[];
 for(let i=0;i<250;i++){const wave=r.wave;r.immune=100000;D.advance(r,50);if(r.wave!==wave)route.push([r.pattern,r.lastSafe,r.rows.filter(c=>c.y===-72).map(c=>c.lane),Math.round(r.next)]);}
 fingerprints.add(JSON.stringify(route));
}
assert.equal(fingerprints.size,30,'starts vary both lane arrangement and timing');
console.log('PASS traffic patterns: three styles at every difficulty, varied seeds/lanes/timing and no immediate repeat.');
