import {test} from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {fileURLToPath} from 'node:url';
import {createECDH,randomBytes} from 'node:crypto';
import {Miniflare,convertV4MiniflareOptions} from 'miniflare';
import webpush from 'web-push';
import {scheduled} from './public-worker.mjs';

test('public origin, subscriber ownership, rate limits, private dispatch and >30 device scheduling',async()=>{
 const key=webpush.generateVAPIDKeys(),origin='https://seeya-fanpage.com',bindings={PUBLIC_APP_ORIGIN:origin,VAPID_PUBLIC_KEY:key.publicKey,VAPID_PRIVATE_KEY:key.privateKey,PREVIEW_SIGNING_KEY:randomBytes(32).toString('hex')};
 const mf=new Miniflare(convertV4MiniflareOptions({modules:true,scriptPath:fileURLToPath(new URL('../.runtime/public-worker-build/public-worker.js',import.meta.url)),compatibilityDate:'2026-11-01',bindings,d1Databases:['DB'],serviceBindings:{DISPATCH:()=>new Response(null,{status:202})},outboundService:()=>Response.json({events:[]})}));
 try{
 const DB=await mf.getD1Database('DB');for(const file of ['schema.sql','public-schema.sql'])for(const stmt of fs.readFileSync(new URL(file,import.meta.url),'utf8').replace(/ notification_types INTEGER[^\n]+\n/,'').split(';').map(x=>x.trim()).filter(Boolean))await DB.prepare(stmt).run();
 // Upgrade an existing subscriber in place; no opt-in is added by migration.
 await DB.prepare("INSERT INTO subscribers(id,endpoint,subscription,created_at,daily) VALUES('legacy','https://fcm.googleapis.com/fcm/send/legacy','{}','2026-11-27',1)").run();
 await DB.prepare(fs.readFileSync(new URL('migrate-types.sql',import.meta.url),'utf8')).run();
 assert.equal((await DB.prepare("SELECT notification_types FROM subscribers WHERE id='legacy'").first()).notification_types,1);
 await DB.prepare("DELETE FROM subscribers WHERE id='legacy'").run();
 const request=(path,method='GET',body,token,from=origin)=>mf.dispatchFetch('https://api.example'+path,{method,headers:{Origin:from,'Content-Type':'application/json',...(token?{Authorization:'Bearer '+token}:{})},...(body?{body:JSON.stringify(body)}:{})});
 assert.equal((await request('/api/config','GET',null,null,'https://evil.example')).status,403);
 assert.equal((await request('/api/config')).headers.get('Access-Control-Allow-Origin'),origin);
 assert.equal((await request('/api/subscribe','OPTIONS')).status,204);
 assert.equal((await request('/deliver','POST',{})).status,404);
 const ec=createECDH('prime256v1');ec.generateKeys();const subscription={endpoint:'https://fcm.googleapis.com/fcm/send/public-unit',keys:{p256dh:ec.getPublicKey().toString('base64url'),auth:randomBytes(16).toString('base64url')}};
 const res=await request('/api/subscribe','POST',{subscription});assert.equal(res.status,200);const {token}=await res.json();
 assert.equal((await request('/api/status','POST',{},token)).status,200);assert.equal((await request('/api/status','POST',{},'a'.repeat(64))).status,401);
 assert.equal((await (await request('/api/status','POST',{},token)).json()).types,1);
 for(const types of [0,16,'2',null])assert.equal((await request('/api/daily','POST',{enabled:true,time:'09:00',types},token)).status,400);
 assert.equal((await request('/api/daily','POST',{enabled:true,time:'09:00',types:3},token)).status,200);
 await request('/api/daily','POST',{enabled:true,time:'10:00'},token); // Older clients must retain selected kinds.
 assert.equal((await (await request('/api/status','POST',{},token)).json()).types,3);
 assert.equal((await request('/api/config?types=0')).status,400);
 for(let i=0;i<14;i++)await request('/api/subscribe','POST',{subscription},token);
 assert.equal((await request('/api/subscribe','POST',{subscription},token)).status,429);
 await request('/api/unsubscribe','POST',{},token);
 const date='2026-11-27',now=new Date(date+'T09:00:00+09:00'),actualNow=Date.now;Date.now=()=>now.getTime();
 try{
 const records=Array.from({length:160},(_,i)=>({id:randomBytes(32).toString('hex'),endpoint:'https://fcm.googleapis.com/fcm/send/fixture-'+i}));
 await DB.batch(records.map(r=>DB.prepare('INSERT INTO subscribers(id,endpoint,subscription,created_at,daily,daily_time) VALUES(?,?,?,?,1,?)').bind(r.id,r.endpoint,JSON.stringify({...subscription,endpoint:r.endpoint}),now.toISOString(),'09:00')));
 const calls=[],env={...bindings,DB,DISPATCH:{fetch:async(url,init)=>{calls.push(JSON.parse(init.body));return new Response(null,{status:202});}}};
 const data={events:[{id:'concert',date,time:'20:00',members:['씨야'],title:'테스트 공연',state:'confirmed'}]};
 await scheduled(env,now,async()=>data);await scheduled(env,now,async()=>data);
 assert.equal((await DB.prepare('SELECT COUNT(*) AS n FROM jobs').first()).n,160);assert(calls.length>0&&calls.every(c=>c.depth===0));
 assert.equal((await DB.prepare('SELECT COUNT(DISTINCT id) AS n FROM jobs').first()).n,160);
 const anniv={id:'birthday-yeonji',title:'김연지 생일',members:['김연지'],annual:true,date:'2007-11-27',state:'confirmed'};
 for(const [i,mask]of [[0,2],[1,3],[2,8]])await DB.prepare('UPDATE subscribers SET notification_types=? WHERE id=?').bind(mask,records[i].id).run();
 await DB.prepare('DELETE FROM jobs').run();
 await scheduled(env,now,async()=>({...data,anniversaries:[anniv]}));await scheduled(env,now,async()=>({...data,anniversaries:[anniv]}));
 assert.equal((await DB.prepare('SELECT COUNT(*) AS n FROM jobs').first()).n,159);
 const payloadFor=async i=>JSON.parse((await DB.prepare('SELECT payload FROM jobs WHERE subscriber_id=?').bind(records[i].id).first()).payload);
 assert.match((await payloadFor(0)).body,/생일/);assert.doesNotMatch((await payloadFor(0)).body,/테스트 공연/);
 assert.match((await payloadFor(1)).body,/생일/);assert.match((await payloadFor(1)).body,/테스트 공연/);
 assert.doesNotMatch((await payloadFor(3)).body,/생일/);
 await scheduled(env,new Date(now.getTime()+86400000),async()=>({events:[]}));assert.equal((await DB.prepare('SELECT COUNT(*) AS n FROM jobs').first()).n,159);
 }finally{Date.now=actualNow;}
 }finally{await mf.dispose();}
});
