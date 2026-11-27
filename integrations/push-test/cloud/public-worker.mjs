import {handle,calendar,dispatchJob} from './worker.mjs';
import schedule from '../schedule.cjs';
const {dateInKorea,todayEvents,message}=schedule;
const sql=(e,q,...a)=>e.DB.prepare(q).bind(...a);
const cors=(response,origin)=>{const r=new Response(response.body,response);r.headers.set('Vary','Origin');if(origin){r.headers.set('Access-Control-Allow-Origin',origin);r.headers.set('Access-Control-Allow-Methods','GET, POST, OPTIONS');r.headers.set('Access-Control-Allow-Headers','Content-Type, Authorization');r.headers.set('Access-Control-Max-Age','600');}return r;};
async function callShard(env,shard,depth){return env.DISPATCH.fetch('https://worker.internal/deliver',{method:'POST',headers:{Authorization:'Bearer '+env.PREVIEW_SIGNING_KEY,'Content-Type':'application/json'},body:JSON.stringify({shard,depth})});}
async function drain(env,shard,depth,ctx){
 const job=await sql(env,"SELECT id FROM jobs WHERE status='pending' AND due_at<=? AND expires_at>? AND substr(subscriber_id,1,1)=? ORDER BY due_at LIMIT 1",Date.now(),Date.now(),shard).first();
 if(!job)return;
 await dispatchJob(env,job.id);
 if(depth<12)ctx.waitUntil(callShard(env,shard,depth+1));
}
export async function scheduled(env,now=new Date(),loadCalendar=calendar){
 const date=dateInKorea(now),time=new Intl.DateTimeFormat('en-GB',{timeZone:'Asia/Seoul',hour:'2-digit',minute:'2-digit',hourCycle:'h23'}).format(now);
 const [h,m]=time.split(':').map(Number),elapsed=m%30,slot=String(h).padStart(2,'0')+':'+(m<30?'00':'30');
 await sql(env,"INSERT INTO metadata(key,value) VALUES('last_cron',?) ON CONFLICT(key) DO UPDATE SET value=excluded.value",now.toISOString()).run();
 if(elapsed<5){
 const {results:groups}=await sql(env,'SELECT DISTINCT notification_types FROM subscribers WHERE daily=1 AND expired=0 AND daily_time=?',slot).all();
 if(groups.length){try{const data=await loadCalendar();const queries=groups.map(({notification_types:types})=>{const payload=message(todayEvents(data,now,types),date);return payload?sql(env,"INSERT OR IGNORE INTO jobs(id,subscriber_id,payload,due_at,expires_at) SELECT ?||id,id,?,?,? FROM subscribers WHERE daily=1 AND expired=0 AND daily_time=? AND notification_types=?",'daily:'+date+':',JSON.stringify(payload),now.getTime(),now.getTime()+20*60000,slot,types):null;}).filter(Boolean);if(queries.length)await env.DB.batch(queries);}catch{console.error('Calendar unavailable; no digest created.');}}
 }
 const {results}=await sql(env,"SELECT DISTINCT substr(subscriber_id,1,1) AS shard FROM jobs WHERE status='pending' AND due_at<=? AND expires_at>?",Date.now(),Date.now()).all();
 // Each send gets its own Worker request/CPU budget. Bound recursive hops;
 // next cron picks up remaining jobs. D1 claims make overlapping runs safe.
 await Promise.all(results.map(({shard})=>callShard(env,shard,0)));
 await env.DB.batch([sql(env,"UPDATE jobs SET status='expired' WHERE status='pending' AND expires_at<=?",Date.now()),sql(env,"UPDATE jobs SET status='unknown' WHERE status='sending' AND due_at<?",Date.now()-120000),sql(env,'DELETE FROM jobs WHERE expires_at<?',Date.now()-7*86400000),sql(env,'DELETE FROM request_limits WHERE expires_at<?',Date.now())]);
}
export default {
 async fetch(req,env,ctx){
 const url=new URL(req.url),origin=req.headers.get('Origin'),allowed=origin===env.PUBLIC_APP_ORIGIN;
 if(url.pathname==='/deliver'){
 if(req.method!=='POST'||req.headers.get('Authorization')!=='Bearer '+env.PREVIEW_SIGNING_KEY)return new Response('Not found',{status:404});
 const {shard,depth}=await req.json();if(!/^[a-f0-9]$/.test(shard)||!Number.isInteger(depth)||depth<0||depth>12)return new Response('Invalid',{status:400});
 ctx.waitUntil(drain(env,shard,depth,ctx));return new Response(null,{status:202});
 }
 if(req.method==='OPTIONS')return cors(new Response(null,{status:allowed?204:403}),allowed?origin:null);
 if(!allowed)return new Response('Origin not allowed',{status:403});
 try{
 if(req.method==='POST'&&['/api/subscribe','/api/test'].includes(url.pathname)){
 // Short-lived hashed rate-limit buckets; never retain raw network addresses.
 const identity=url.pathname==='/api/test'?req.headers.get('authorization')||'':req.headers.get('CF-Connecting-IP')||'unknown';
 const day=dateInKorea(),hour=new Date().toISOString().slice(0,13),bucket=url.pathname==='/api/test'?day:hour;
 const bytes=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(env.PREVIEW_SIGNING_KEY+url.pathname+identity+bucket));
 const key=Array.from(new Uint8Array(bytes),x=>x.toString(16).padStart(2,'0')).join('');
 const limit=url.pathname==='/api/test'?20:15;
 const counted=await sql(env,'INSERT INTO request_limits(id,count,expires_at) VALUES(?,1,?) ON CONFLICT(id) DO UPDATE SET count=count+1 WHERE count<? RETURNING count',key,Date.now()+86400000,limit).first();
 if(!counted)return cors(Response.json({error:'요청이 많아요. 잠시 뒤 다시 시도해 주세요.'},{status:429}),origin);
 }
 return cors(await handle(req,env,ctx),origin);
 }catch{return cors(Response.json({error:'알림 서버에 연결하지 못했어요. 잠시 뒤 다시 확인해 주세요.'},{status:503}),origin);}
 },
 scheduled(event,env,ctx){ctx.waitUntil(scheduled(env,new Date(event.scheduledTime)));}
};
