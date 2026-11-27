import {test} from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createECDH,randomBytes} from 'node:crypto';
import {Miniflare,convertV4MiniflareOptions} from 'miniflare';
import webpush from 'web-push';
import {ticket,verifyTicket,tick,dispatchJob} from './worker.mjs';

test('cloud worker: signed preview, ownership, durable jobs, expiry and no duplicate daily delivery',async()=>{
 const vapid=webpush.generateVAPIDKeys(),gate='cloud-unit-test-only',keys={PREVIEW_GATE:gate,PREVIEW_SIGNING_KEY:randomBytes(32).toString('hex'),VAPID_PUBLIC_KEY:vapid.publicKey,VAPID_PRIVATE_KEY:vapid.privateKey};
 const calendar={events:[{id:'a',date:'2026-11-27',title:'씨야 테스트 방송',members:['이보람'],state:'confirmed',time:'21:00'}]};
 let runtimePushes=0;
 const mf=new Miniflare(convertV4MiniflareOptions({workers:[{name:'test',modules:true,scriptPath:new URL('../.runtime/worker-build/worker.js',import.meta.url).pathname.replace(/^\/([A-Z]:)/,'$1'),compatibilityDate:'2026-11-01',bindings:keys,d1Databases:['DB'],serviceBindings:{ASSETS:()=>new Response('test asset')},outboundService:req=>{if(new URL(req.url).hostname==='fcm.googleapis.com'){runtimePushes++;return new Response(null,{status:201});}return Response.json(calendar);}}]}));
 try{
 const db=await mf.getD1Database('DB'),schema=fs.readFileSync(new URL('./schema.sql',import.meta.url),'utf8');for(const statement of schema.split(';').map(s=>s.trim()).filter(Boolean))await db.prepare(statement).run();
 const env={...keys,DB:db},base='http://localhost/preview/'+gate+'/notifications/test/';
 const api=(route,data,token,origin='http://localhost')=>mf.dispatchFetch(base+'api/'+route,{method:'POST',headers:{'content-type':'application/json',origin,...(token?{authorization:'Bearer '+token}:{})},body:JSON.stringify(data)});
 assert.equal((await mf.dispatchFetch('http://localhost/')).status,404);
 assert.equal((await mf.dispatchFetch(base+'cloud/worker.mjs')).status,404);
 const ecdh=createECDH('prime256v1');ecdh.generateKeys();
 const subscription={endpoint:'https://fcm.googleapis.com/fcm/send/unit-test',keys:{p256dh:ecdh.getPublicKey().toString('base64url'),auth:randomBytes(16).toString('base64url')}};
 assert.equal((await api('subscribe',{subscription},null,'https://evil.test')).status,403);
 const registered=await api('subscribe',{subscription});assert.equal(registered.status,200);const {token}=await registered.json();
 assert.equal((await api('subscribe',{subscription})).status,409);
 assert.equal((await api('status',{},'b'.repeat(64))).status,401);
 assert.equal((await api('daily',{enabled:true,time:'09:05'},token)).status,400);
 assert.equal((await api('daily',{enabled:true,time:'09:00'},token)).status,200);
 const payload={title:'[예시] 원하는 미리보기',body:'21:00 한밤의 꿈',url:'https://seeya-fanpage.com/calendar/?day=2026-11-27',tag:'example'};
 const signed=await ticket(env,payload);assert.deepEqual(await verifyTicket(env,signed),payload);
 assert.equal(await verifyTicket(env,signed+'x'),null);assert.equal(await verifyTicket({...env,PREVIEW_SIGNING_KEY:gate},signed),null);assert.equal(await verifyTicket(env,signed,Date.now()+3600001),null);
 assert.equal((await api('test',{kind:'preview',ticket:signed+'x'},token)).status,400);
 const queued=await api('test',{kind:'preview',ticket:signed},token);assert.equal(queued.status,200);
 assert.equal((await api('test',{kind:'preview',ticket:signed},token)).status,429);
 const job=await db.prepare('SELECT * FROM jobs').first();assert.equal(JSON.parse(job.payload).body,payload.body);
 // Let the actual workerd fetch run through the runtime, not only a Node mock.
 await new Promise(resolve=>setTimeout(resolve,16500));
 assert.equal(runtimePushes,1);assert.equal((await db.prepare('SELECT status FROM jobs WHERE id=?').bind(job.id).first()).status,'sent');
 await db.prepare("UPDATE jobs SET status='pending' WHERE id=?").bind(job.id).run();
 await db.prepare('UPDATE jobs SET due_at=? WHERE id=?').bind(Date.now()-1,job.id).run();
 let sent=0;const sendFetch=async(url,init)=>{sent++;assert.equal(url,subscription.endpoint);assert.equal(init.redirect,'manual');assert.ok(init.headers);assert.ok(init.body);return new Response(null,{status:201});};
 await Promise.all([dispatchJob(env,job.id,sendFetch),dispatchJob(env,job.id,sendFetch)]);assert.equal(sent,1);
 const status=await (await api('status',{},token)).json();assert.match(status.lastResult,/전달/);
 const now=new Date();const today=new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Seoul',year:'numeric',month:'2-digit',day:'2-digit'}).format(now);
 const hour=new Intl.DateTimeFormat('en-GB',{timeZone:'Asia/Seoul',hour:'2-digit',hourCycle:'h23'}).format(now);
 const testNow=new Date(today+'T'+hour+':00:00+09:00');
 await api('daily',{enabled:true,time:hour+':00'},token);
 const todayCalendar={events:[{...calendar.events[0],date:today}]};
 const realNow=Date.now;Date.now=()=>testNow.getTime();
 await tick(env,testNow,async()=>todayCalendar,sendFetch);await tick(env,testNow,async()=>todayCalendar,sendFetch);
 assert.equal(sent,2);assert.equal((await db.prepare("SELECT COUNT(*) AS n FROM jobs WHERE id LIKE 'daily:%'").first()).n,1);
 // No schedules means no new daily job.
 await tick(env,new Date(testNow.getTime()+86400000),async()=>({events:[]}),sendFetch);assert.equal(sent,2);
 Date.now=realNow;
 const owner=await db.prepare('SELECT id FROM subscribers').first();
 await db.prepare('INSERT INTO jobs(id,subscriber_id,payload,due_at,expires_at) VALUES(?,?,?,?,?)').bind('expired-test',owner.id,JSON.stringify(payload),Date.now()-1,Date.now()+60000).run();
 await dispatchJob(env,'expired-test',async()=>new Response(null,{status:410}));assert.equal((await db.prepare('SELECT expired FROM subscribers').first()).expired,1);
 await api('unsubscribe',{},token);assert.equal((await db.prepare('SELECT COUNT(*) AS n FROM subscribers').first()).n,0);assert.equal((await db.prepare('SELECT COUNT(*) AS n FROM jobs').first()).n,0);
 }finally{await mf.dispose();}
});
