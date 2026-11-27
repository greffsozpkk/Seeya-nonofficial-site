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
 const DB=await mf.getD1Database('DB');for(const file of ['schema.sql','public-schema.sql'])for(const stmt of fs.readFileSync(new URL(file,import.meta.url),'utf8').split(';').map(x=>x.trim()).filter(Boolean))await DB.prepare(stmt).run();
 const request=(path,method='GET',body,token,from=origin)=>mf.dispatchFetch('https://api.example'+path,{method,headers:{Origin:from,'Content-Type':'application/json',...(token?{Authorization:'Bearer '+token}:{})},...(body?{body:JSON.stringify(body)}:{})});
 assert.equal((await request('/api/config','GET',null,null,'https://evil.example')).status,403);
 assert.equal((await request('/api/config')).headers.get('Access-Control-Allow-Origin'),origin);
 assert.equal((await request('/api/subscribe','OPTIONS')).status,204);
 assert.equal((await request('/deliver','POST',{})).status,404);
 const ec=createECDH('prime256v1');ec.generateKeys();const subscription={endpoint:'https://fcm.googleapis.com/fcm/send/public-unit',keys:{p256dh:ec.getPublicKey().toString('base64url'),auth:randomBytes(16).toString('base64url')}};
 const res=await request('/api/subscribe','POST',{subscription});assert.equal(res.status,200);const {token}=await res.json();
 assert.equal((await request('/api/status','POST',{},token)).status,200);assert.equal((await request('/api/status','POST',{},'a'.repeat(64))).status,401);
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
 await scheduled(env,new Date(now.getTime()+86400000),async()=>({events:[]}));assert.equal((await DB.prepare('SELECT COUNT(*) AS n FROM jobs').first()).n,160);
 }finally{Date.now=actualNow;}
 }finally{await mf.dispose();}
});
