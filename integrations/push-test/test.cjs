'use strict';
const {test,after}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),os=require('node:os'),path=require('node:path');
const {dateInKorea,todayEvents,message,validSubscription,due,validTime,previews}=require('./schedule.cjs');
const temp=fs.mkdtempSync(path.join(os.tmpdir(),'seeya-push-test-'));
process.env.PUSH_TEST_STATE_DIR=temp;
const webpush=require('web-push');let sends=0;
webpush.sendNotification=async()=>{sends++;};
const {server,base,state,tick,send}=require('./server.cjs');
let origin;const ready=new Promise(resolve=>server.listen(0,'127.0.0.1',()=>{origin='http://127.0.0.1:'+server.address().port;resolve();}));
const subscription={endpoint:'https://fcm.googleapis.com/fcm/send/test-only',keys:{p256dh:'A'.repeat(87),auth:'A'.repeat(22)}};
async function request(route,data,token,extra={}){await ready;return fetch(origin+base+route,data===undefined?{}:{method:'POST',headers:{'Content-Type':'application/json',...(token?{Authorization:'Bearer '+token}:{}),...extra},body:JSON.stringify(data)});}
after(async()=>{await new Promise(resolve=>server.close(resolve));fs.rmSync(temp,{recursive:true,force:true});});
test('Korean date rollover; cancelled/tentative filtered; IDs deduplicated; multi-day retained',()=>{
 const now=new Date('2026-11-26T15:00:00Z');assert.equal(dateInKorea(now),'2026-11-27');
 const e={id:'a',date:'2026-11-27',state:'confirmed',time:'21:00',title:'radio'};
 const list=todayEvents({events:[e,e,{...e,id:'cancel',state:'cancelled'},{...e,id:'wait',state:'tentative'},{...e,id:'past',date:'2026-11-26'},{...e,id:'multi',date:'2026-11-26',endDate:'2026-11-28',time:'10:00'}]},now);
 assert.deepEqual(list.map(x=>x.id),['multi','a']);assert.match(message(list,'2026-11-27').body,/10:00/);
});
test('push destination rejects local/arbitrary hosts and invalid keys',()=>{
 assert.ok(validSubscription(subscription));
 assert.ok(validSubscription({...subscription,endpoint:'https://jmt17.google.com/fcm/send/test-only'}));
 for(const endpoint of ['http://fcm.googleapis.com/a','https://127.0.0.1/a','https://fcm.googleapis.com.evil.test/a','https://evil.test/a','https://u:p@fcm.googleapis.com/a'])assert.equal(validSubscription({...subscription,endpoint}),false);
 assert.equal(validSubscription({...subscription,keys:{}}),false);
});
test('server only exposes explicit preview files, not source, keys, or other pages',async()=>{
 await ready;for(const url of ['/.git/config','/data/archive.json',base+'.runtime/state.json',base+'server.cjs',base+'../server.cjs'])assert.equal((await fetch(origin+url)).status,404);
 const page=await request('');assert.equal(page.status,200);assert.match(await page.text(),/오늘의 씨야/);
 const manifest=await(await request('manifest.webmanifest')).json();assert.equal(manifest.scope,base);
 const config=await(await request('api/config')).json();assert.ok(config.publicKey);assert.equal(config.privateKey,undefined);
});
test('device ownership, cross-origin rejection, rate limit, unsubscribe cancels queued push',async()=>{
 assert.equal((await request('api/subscribe',{subscription},null,{Origin:'https://elsewhere.test'})).status,403);
 assert.equal((await request('api/test',{})).status,401);
 const created=await request('api/subscribe',{subscription});assert.equal(created.status,200);const {token}=await created.json();
 assert.equal((await request('api/subscribe',{subscription})).status,409);
 assert.equal((await request('api/status',{},'invalid')).status,401);
 await request('api/daily',{enabled:true},token);assert.equal((await(await request('api/status',{},token)).json()).daily,true);
 assert.equal((await request('api/test',{},token)).status,200);assert.equal((await request('api/test',{},token)).status,429);
 await request('api/unsubscribe',{},token);assert.equal(state.subscriptions[token],undefined);assert.equal((await request('api/status',{},token)).status,401);
});
test('morning digest sends at most once and no late catch-up; no events means no send',async()=>{
 const data=JSON.parse(fs.readFileSync(path.join(__dirname,'../../calendar/events.json')));
 const event=data.events.find(e=>e.state==='confirmed');assert.ok(event);
 state.subscriptions.test={subscription,daily:true};
 const at9=new Date(event.date+'T00:00:00Z');await tick(at9);assert.equal(sends,1);await tick(at9);assert.equal(sends,1);
 delete state.subscriptions.test.dailyDate;await tick(new Date(event.date+'T10:00:00Z'));assert.equal(sends,1);
 await tick(new Date('2099-12-30T00:00:00Z'));assert.equal(sends,1);delete state.subscriptions.test;
});
test('expired push subscription disables scheduled sends',async()=>{
 state.subscriptions.expired={subscription,daily:true};webpush.sendNotification=async()=>{throw {statusCode:410};};await send('expired',{title:'test'});assert.equal(state.subscriptions.expired.expired,true);assert.equal(state.subscriptions.expired.daily,false);delete state.subscriptions.expired;
});
test('message shape and calendar deep links preserve notification date even when opened later',()=>{
 const {selectionFromURL}=require('../../src/shared/calendar-state');
 const e={id:'event-1',title:'이보람 한밤의 꿈',date:'2026-11-25',time:'21:00',members:['이보람']};
 assert.equal(message([],'2026-11-25'),null);
 const one=message([e],'2026-11-25');assert.equal(one.title,'오늘의 씨야 · 이보람');assert.equal(one.body,'21:00 한밤의 꿈');
 const selected=selectionFromURL(new URL(one.url).search,[e],'2026-12-02');assert.equal(selected.day,'2026-11-25');assert.equal(selected.event,e.id);assert.equal(selected.view,'list');assert.equal(selected.anniversaries,false);
 const many=message([e,{...e,id:'2',time:''},{...e,id:'3'},{...e,id:'4'}],'2026-11-25');assert.match(many.title,/4개/);assert.equal(many.body.split('\n').length,3);assert.match(many.body,/시간 미정/);assert.match(many.body,/외 2개 일정/);
 const multiple=selectionFromURL(new URL(many.url).search,[e],'2026-12-02');assert.equal(multiple.day,'2026-11-25');assert.equal(multiple.event,'');
 const sample=previews({events:[{...e,state:'confirmed'}]},new Date('2026-11-27T03:00:00Z')).find(p=>p.key==='example1');assert.match(sample.payload.title,/^\[예시\]/);assert.equal(sample.date,'2026-11-25');
});
test('device times, 30-minute validation, short grace window, and per-day duplicate prevention',()=>{
 assert.ok(validTime('08:30'));for(const t of ['24:00','08:15','9:00',null])assert.equal(validTime(t),false);
 const s={daily:true,dailyTime:'08:30'};
 assert.equal(due(s,new Date('2026-11-26T23:29:00Z')),false);assert.equal(due(s,new Date('2026-11-26T23:30:00Z')),true);assert.equal(due(s,new Date('2026-11-26T23:34:00Z')),true);assert.equal(due(s,new Date('2026-11-26T23:35:00Z')),false);
 assert.equal(due({...s,dailyDate:'2026-11-27'},new Date('2026-11-26T23:30:00Z')),false);
 assert.equal(due({...s,dailyTime:'09:00'},new Date('2026-11-26T23:30:00Z')),false);
});
