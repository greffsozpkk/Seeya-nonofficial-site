import {buildPushPayload} from '@block65/webcrypto-web-push';
import schedule from '../schedule.cjs';
const {dateInKorea,todayEvents,message,validTime,validSubscription,due,previews}=schedule;
const headers={'Cache-Control':'no-store','X-Content-Type-Options':'nosniff','Referrer-Policy':'no-referrer','X-Robots-Tag':'noindex, nofollow, noarchive'};
const json=(data,status=200)=>Response.json(data,{status,headers});
const hash=async text=>Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(text))),b=>b.toString(16).padStart(2,'0')).join('');
const token=()=>Array.from(crypto.getRandomValues(new Uint8Array(32)),b=>b.toString(16).padStart(2,'0')).join('');
const sql=(env,query,...args)=>env.DB.prepare(query).bind(...args);
const baseFor=env=>env.PUBLIC_APP_ORIGIN?'/':'/preview/'+env.PREVIEW_GATE+'/notifications/test/';
export async function calendar(){
 const res=await fetch('https://seeya-fanpage.com/calendar/events.json',{signal:AbortSignal.timeout(8000),cf:{cacheTtl:60,cacheEverything:true}});
 if(!res.ok)throw Error('calendar');
 const data=await res.json();if(!Array.isArray(data.events))throw Error('calendar');return data;
}
async function readBody(req){
 if(Number(req.headers.get('content-length')||0)>8192)throw Error('body');
 const reader=req.body?.getReader();if(!reader)return {};
 let chunks=[],size=0;
 while(true){const {done,value}=await reader.read();if(done)break;size+=value.byteLength;if(size>8192){await reader.cancel();throw Error('body');}chunks.push(value);}
 const all=new Uint8Array(size);let pos=0;for(const chunk of chunks){all.set(chunk,pos);pos+=chunk.length;}return JSON.parse(new TextDecoder().decode(all));
}
// The exact preview shown to the user is kept in a signed, short-lived ticket.
// A calendar update between opening the page and pressing Test cannot change it.
async function signature(env,text){if(!env.PREVIEW_SIGNING_KEY)throw Error('Signing key unavailable');const key=await crypto.subtle.importKey('raw',new TextEncoder().encode(env.PREVIEW_SIGNING_KEY),{name:'HMAC',hash:'SHA-256'},false,['sign']);return btoa(String.fromCharCode(...new Uint8Array(await crypto.subtle.sign('HMAC',key,new TextEncoder().encode(text)))));}
export async function ticket(env,payload,now=Date.now()){
 const data=btoa(unescape(encodeURIComponent(JSON.stringify({payload,expires:now+3600000}))));return data+'.'+await signature(env,data);
}
export async function verifyTicket(env,value,now=Date.now()){
 if(typeof value!=='string'||value.length>6000)return null;
 const [data,sig,...rest]=value.split('.');if(rest.length||!sig)return null;
 const expected=await signature(env,data);let difference=expected.length^sig.length;for(let i=0;i<expected.length;i++)difference|=expected.charCodeAt(i)^(sig.charCodeAt(i)||0);if(difference)return null;
 try{const parsed=JSON.parse(decodeURIComponent(escape(atob(data))));return parsed.expires>now?parsed.payload:null;}catch{return null;}
}
export async function dispatchJob(env,id,sendFetch=fetch){
 const now=Date.now();
 const job=await sql(env,"UPDATE jobs SET status='sending' WHERE id=? AND status='pending' AND due_at<=? AND expires_at>? RETURNING *",id,now,now).first();
 if(!job)return;
 const sub=await sql(env,'SELECT * FROM subscribers WHERE id=? AND expired=0',job.subscriber_id).first();
 if(!sub){await sql(env,"UPDATE jobs SET status='cancelled' WHERE id=?",id).run();return;}
 let result,status='failed',expired=false,sent='',stage='encryption';
 try{
 const subscription=JSON.parse(sub.subscription);
 if(!validSubscription(subscription))throw Error('subscription');
 const request=await buildPushPayload({data:job.payload,options:{ttl:300}},subscription,{subject:'https://seeya-fanpage.com',publicKey:env.VAPID_PUBLIC_KEY,privateKey:env.VAPID_PRIVATE_KEY});
 stage='transport';
 const response=await sendFetch(subscription.endpoint,{...request,redirect:'manual',signal:AbortSignal.timeout(8000)});
 if(response.ok){status='sent';sent=new Date().toISOString();result='푸시 서비스에 전달했어요. 휴대전화에서 실제 수신을 확인해 주세요.';}
 else{expired=[404,410].includes(response.status);result='발송 실패 ('+response.status+')'+(expired?' · 해제 후 다시 신청해 주세요.':'');}
 await response.body?.cancel();
 }catch(e){result='발송 연결을 확인하지 못했어요. 잠시 뒤 테스트해 주세요.';const detail=String(e?.message||'').replace(/https?:\/\/\S+/g,'[url]').replace(/[A-Za-z0-9_/-]{40,}/g,'[redacted]').slice(0,240);await sql(env,"INSERT INTO metadata(key,value) VALUES('last_error',?) ON CONFLICT(key) DO UPDATE SET value=excluded.value",JSON.stringify({stage,name:e?.name,message:detail})).run();}
 // An ambiguous network response is not retried automatically: avoid duplicates.
 await env.DB.batch([
 sql(env,'UPDATE jobs SET status=? WHERE id=?',status,id),
 sql(env,'UPDATE subscribers SET last_result=?,last_sent_at=CASE WHEN ?<>\'\' THEN ? ELSE last_sent_at END,expired=?,daily=CASE WHEN ?=1 THEN 0 ELSE daily END WHERE id=?',result,sent,sent,Number(expired),Number(expired),sub.id)
 ]);
}
export async function tick(env,now=new Date(),loadCalendar=calendar,sendFetch=fetch){
 await sql(env,"INSERT INTO metadata(key,value) VALUES('last_cron',?) ON CONFLICT(key) DO UPDATE SET value=excluded.value",now.toISOString()).run();
 const {results:subscribers}=await sql(env,'SELECT * FROM subscribers WHERE daily=1 AND expired=0 LIMIT 30').all();
 const targets=subscribers.filter(s=>due({daily:s.daily,dailyTime:s.daily_time},now));
 if(targets.length){
 try{
 const events=todayEvents(await loadCalendar(),now),date=dateInKorea(now),payload=message(events,date);
 if(payload)await env.DB.batch(targets.map(s=>sql(env,'INSERT OR IGNORE INTO jobs(id,subscriber_id,payload,due_at,expires_at) VALUES(?,?,?,?,?)','daily:'+date+':'+s.id,s.id,JSON.stringify(payload),now.getTime(),now.getTime()+300000)));
 }catch{console.error('Calendar fetch unavailable; no schedule sent.');}
 }
 const {results:jobs}=await sql(env,"SELECT id FROM jobs WHERE status='pending' AND due_at<=? AND expires_at>? ORDER BY due_at LIMIT 8",Date.now(),Date.now()).all();
 for(const job of jobs)await dispatchJob(env,job.id,sendFetch);
 await env.DB.batch([
 sql(env,"UPDATE jobs SET status='expired' WHERE status='pending' AND expires_at<=?",Date.now()),
 sql(env,"UPDATE jobs SET status='unknown' WHERE status='sending' AND due_at<?",Date.now()-120000),
 sql(env,'DELETE FROM jobs WHERE expires_at<?',Date.now()-7*86400000)
 ]);
}
export async function handle(req,env,ctx){
 const url=new URL(req.url),base=baseFor(env);
 if((!env.PUBLIC_APP_ORIGIN&&!env.PREVIEW_GATE)||!url.pathname.startsWith(base))return json({error:'Not found'},404);
 const route=url.pathname.slice(base.length);
 if(req.method==='GET'&&route==='api/config'){
 const data=await calendar(),items=previews(data);for(const item of items)if(item.payload)item.ticket=await ticket(env,item.payload);
 const cron=await sql(env,"SELECT value FROM metadata WHERE key='last_cron'").first();
 return json({publicKey:env.VAPID_PUBLIC_KEY,date:dateInKorea(),events:todayEvents(data),previews:items,mode:'cloud',lastCron:cron?.value||'',serverTime:new Date().toISOString()});
 }
 if(route.startsWith('api/')){
 if(req.method!=='POST'||!req.headers.get('content-type')?.startsWith('application/json'))return json({error:'POST JSON required'},405);
 if(env.PUBLIC_APP_ORIGIN?req.headers.get('origin')!==env.PUBLIC_APP_ORIGIN:((req.headers.has('origin')&&req.headers.get('origin')!==url.origin)||req.headers.get('sec-fetch-site')==='cross-site'))return json({error:'다른 사이트에서는 요청할 수 없습니다.'},403);
 const b=await readBody(req),rawToken=req.headers.get('authorization')?.replace(/^Bearer /,''),id=rawToken&&/^[a-f0-9]{64}$/.test(rawToken)?await hash(rawToken):'';
 const own=id?await sql(env,'SELECT * FROM subscribers WHERE id=?',id).first():null;
 if(route==='api/subscribe'){
 if(!validSubscription(b.subscription))return json({error:'지원하지 않는 푸시 연결입니다. Chrome 또는 홈 화면에 추가한 Safari 앱에서 확인해 주세요.'},400);
 // Enforce both unique endpoints and capacity inside the same SQL statement.
 const match=await sql(env,'SELECT id FROM subscribers WHERE endpoint=?',b.subscription.endpoint).first();
 if(match&&match.id!==id)return json({error:'기존 알림 연결을 해제한 뒤 다시 신청해 주세요.'},409);
 if(own){await sql(env,'UPDATE subscribers SET endpoint=?,subscription=?,expired=0 WHERE id=?',b.subscription.endpoint,JSON.stringify(b.subscription),id).run();return json({token:rawToken});}
 const newToken=token(),newId=await hash(newToken);
 const result=await sql(env,'INSERT INTO subscribers(id,endpoint,subscription,created_at) SELECT ?,?,?,? WHERE (SELECT COUNT(*) FROM subscribers)<?',newId,b.subscription.endpoint,JSON.stringify(b.subscription),new Date().toISOString(),env.PUBLIC_APP_ORIGIN?3000:30).run();
 return result.meta.changes?json({token:newToken}):json({error:'현재 알림 신청 한도에 도달했어요. 잠시 뒤 다시 확인해 주세요.'},429);
 }
 if(!own)return json({error:'이 기기에서 알림 받기를 먼저 신청해 주세요.'},401);
 if(route==='api/status'){
 const job=await sql(env,"SELECT status FROM jobs WHERE subscriber_id=? ORDER BY due_at DESC LIMIT 1",id).first();
 return json({daily:!!own.daily,dailyTime:own.daily_time,expired:!!own.expired,lastResult:job&&['unknown','expired'].includes(job.status)?'이전 발송 완료를 확인하지 못했어요. 테스트를 다시 눌러 주세요.':own.last_result,lastSentAt:own.last_sent_at,pending:job?.status==='pending'});
 }
 if(route==='api/unsubscribe'){await sql(env,'DELETE FROM subscribers WHERE id=?',id).run();return json({ok:true});}
 if(route==='api/daily'){
 if(!validTime(b.time))return json({error:'알림 시간은 30분 단위로 선택해 주세요.'},400);
 await env.DB.batch([sql(env,'UPDATE subscribers SET daily=?,daily_time=? WHERE id=?',Number(b.enabled===true),b.time,id),sql(env,"UPDATE jobs SET status='cancelled' WHERE subscriber_id=? AND id LIKE 'daily:%' AND status='pending'",id)]);return json({daily:b.enabled===true,dailyTime:b.time});
 }
 if(route==='api/test'){
 if(own.expired)return json({error:'만료된 구독입니다. 해제 후 다시 신청해 주세요.'},410);
 let payload;
 if(b.kind==='today'){const events=todayEvents(await calendar());payload=message(events,dateInKorea());if(!payload)return json({empty:true});}
 else if(b.kind==='preview')payload=await verifyTicket(env,b.ticket);
 if(!payload)return json({error:'미리보기가 만료됐어요. 연결 상태를 다시 확인한 뒤 눌러 주세요.'},400);
 const now=Date.now(),jobId='test:'+crypto.randomUUID();
 const claim=await sql(env,'UPDATE subscribers SET last_request=?,last_result=? WHERE id=? AND last_request<=?',now,'선택한 미리보기 알림을 클라우드에서 발송 대기 중입니다.',id,now-30000).run();
 if(!claim.meta.changes)return json({error:'30초 간격으로 테스트할 수 있어요.'},429);
 await sql(env,'INSERT INTO jobs(id,subscriber_id,payload,due_at,expires_at) VALUES(?,?,?,?,?)',jobId,id,JSON.stringify({...payload,tag:jobId}),now+15000,now+300000).run();
 ctx.waitUntil((async()=>{await new Promise(resolve=>setTimeout(resolve,15050));await dispatchJob(env,jobId);})());
 return json({queued:true,delay:15});
 }
 return json({error:'Not found'},404);
 }
 if(env.PUBLIC_APP_ORIGIN)return json({error:'Not found'},404);
 if(req.method!=='GET')return json({error:'Method not allowed'},405);
 if(route==='manifest.webmanifest')return json({id:base,name:'씨야 알림 테스트',short_name:'씨야 알림',start_url:base,scope:base,display:'standalone',background_color:'#fffaf7',theme_color:'#793952',icons:[{src:base+'icon-192.png',sizes:'192x192',type:'image/png'},{src:base+'icon-512.png',sizes:'512x512',type:'image/png'}]});
 const allowed=['','client.js','style.css','sw.js','icon-192.png','icon-512.png','apple-touch-icon.png','badge-96.png'];
 if(!allowed.includes(route))return json({error:'Not found'},404);
 const asset=await env.ASSETS.fetch(new Request(new URL('/'+(route||'page.html'),url)));
 const response=new Response(asset.body,asset);for(const [k,v]of Object.entries(headers))response.headers.set(k,v);return response;
}
export default {
 async fetch(req,env,ctx){try{return await handle(req,env,ctx);}catch{return json({error:'연결을 확인하지 못했어요. 잠시 뒤 다시 시도해 주세요.'},503);}},
 scheduled(controller,env,ctx){ctx.waitUntil(tick(env,new Date(controller.scheduledTime)));}
};
