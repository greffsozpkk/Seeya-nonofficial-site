'use strict';
// Dedicated preview server: deliberately does NOT serve the repository or public site.
const http=require('node:http'),fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const webpush=require('web-push');
const {dateInKorea,todayEvents,message,validSubscription,validTime,due,previews}=require('./schedule.cjs');
const root=path.resolve(__dirname,'../..'),runtime=process.env.PUSH_TEST_STATE_DIR||path.join(__dirname,'.runtime');
fs.mkdirSync(runtime,{recursive:true});
const stateFile=path.join(runtime,'state.json');
let state=fs.existsSync(stateFile)?JSON.parse(fs.readFileSync(stateFile,'utf8')):{vapid:webpush.generateVAPIDKeys(),gate:crypto.randomBytes(24).toString('hex'),subscriptions:{}};
function save(){fs.writeFileSync(stateFile+'.tmp',JSON.stringify(state),{mode:0o600});fs.renameSync(stateFile+'.tmp',stateFile);}
save();
const base='/preview/'+state.gate+'/notifications/test/';
webpush.setVapidDetails('https://seeya-fanpage.com',state.vapid.publicKey,state.vapid.privateKey);
const readCalendar=()=>JSON.parse(fs.readFileSync(path.join(root,'calendar/events.json'),'utf8'));
const pending=new Map();
async function send(id,payload){
 const s=state.subscriptions[id];if(!s)return;
 try{await webpush.sendNotification(s.subscription,JSON.stringify(payload),{TTL:300,urgency:'normal',timeout:12000});s.lastResult='푸시 서비스에 전달했어요. 실제 수신 여부는 기기에서 확인해 주세요.';s.lastSentAt=new Date().toISOString();}
 catch(e){s.lastResult='발송 실패'+(e.statusCode?' ('+e.statusCode+')':' · 네트워크 연결을 확인해 주세요.');if([404,410].includes(e.statusCode)){s.expired=true;s.daily=false;}}
 save();
}
let ticking=false;
async function tick(now=new Date()){
 if(ticking)return;ticking=true;
 try{
 const date=dateInKorea(now),events=todayEvents(readCalendar(),now);if(!events.length)return;
 for(const [id,s]of Object.entries(state.subscriptions)){
 if(!due(s,now))continue;
 s.dailyDate=date;save(); // At most once per device/day, including restarts.
 await send(id,message(events,date));
 }
 }catch{console.error('Morning schedule check failed. Will check again next minute.');}finally{ticking=false;}
}
const timer=setInterval(tick,60000);timer.unref();
function json(res,status,value){res.writeHead(status,{'Content-Type':'application/json; charset=utf-8'});res.end(JSON.stringify(value));}
async function body(req){let raw='';for await(const chunk of req){raw+=chunk;if(Buffer.byteLength(raw)>8192)throw Error('입력 크기가 너무 큽니다.');}return JSON.parse(raw||'{}');}
const server=http.createServer(async(req,res)=>{
 res.setHeader('Cache-Control','no-store');res.setHeader('X-Content-Type-Options','nosniff');res.setHeader('Referrer-Policy','no-referrer');res.setHeader('X-Robots-Tag','noindex, nofollow, noarchive');
 try{
 const u=new URL(req.url,'http://localhost');
 if(!u.pathname.startsWith(base))return json(res,404,{error:'Not found'});
 const route=u.pathname.slice(base.length);
 if(req.method==='GET'&&route==='api/config')return json(res,200,{publicKey:state.vapid.publicKey,date:dateInKorea(),events:todayEvents(readCalendar()),previews:previews(readCalendar()),dailyTime:'09:00',serverTime:new Date().toISOString()});
 if(route.startsWith('api/')){
 if(req.method!=='POST'||!(req.headers['content-type']||'').startsWith('application/json'))return json(res,405,{error:'POST JSON required'});
 // No CORS. Only the same-origin test page may mutate subscriptions.
 if(req.headers.origin&&new URL(req.headers.origin).host!==req.headers.host)return json(res,403,{error:'다른 사이트에서는 요청할 수 없습니다.'});
 if(req.headers['sec-fetch-site']==='cross-site')return json(res,403,{error:'허용되지 않은 요청입니다.'});
 const b=await body(req);const id=req.headers.authorization?.replace(/^Bearer /,'');
 const own=id&&state.subscriptions[id];
 if(route==='api/subscribe'){
 if(!validSubscription(b.subscription)){
 let host='invalid';try{host=new URL(b.subscription?.endpoint).hostname;}catch{}
 console.error('Unsupported push registration:',host,'key lengths',b.subscription?.keys?.p256dh?.length,b.subscription?.keys?.auth?.length);
 return json(res,400,{error:'이 브라우저의 푸시 연결은 지원하지 않아요. 휴대전화의 Chrome 또는 홈 화면에 추가한 Safari 웹 앱에서 열어 주세요.'});
 }
 const match=Object.entries(state.subscriptions).find(([,s])=>s.subscription.endpoint===b.subscription.endpoint);
 if(match&&match[0]!==id)return json(res,409,{error:'기존 연결 정보가 없습니다. 기기의 알림 구독을 해제한 뒤 다시 신청해 주세요.'});
 if(!own&&Object.keys(state.subscriptions).length>=30)return json(res,429,{error:'테스트 기기 한도에 도달했어요.'});
 const token=own?id:crypto.randomBytes(32).toString('hex');
 state.subscriptions[token]={...own,subscription:b.subscription,createdAt:own?.createdAt||new Date().toISOString(),daily:own?.daily||false,expired:false};save();return json(res,200,{token});
 }
 if(!own)return json(res,401,{error:'이 기기에서 알림 받기를 먼저 신청해 주세요.'});
 if(route==='api/status')return json(res,200,{daily:own.daily,dailyTime:own.dailyTime||'09:00',expired:!!own.expired,lastResult:own.lastResult||'',lastSentAt:own.lastSentAt||'',pending:pending.has(id)});
 if(route==='api/unsubscribe'){clearTimeout(pending.get(id));pending.delete(id);delete state.subscriptions[id];save();return json(res,200,{ok:true});}
 if(route==='api/daily'){
 if(!validTime(b.time||'09:00'))return json(res,400,{error:'알림 시간은 30분 단위로 선택해 주세요.'});
 own.daily=b.enabled===true;own.dailyTime=b.time||'09:00';save();return json(res,200,{daily:own.daily,dailyTime:own.dailyTime});}
 if(route==='api/test'){
 if(own.expired)return json(res,410,{error:'만료된 구독입니다. 해제 후 다시 신청해 주세요.'});
 if(pending.has(id)||Date.now()-(own.lastRequest||0)<30000)return json(res,429,{error:'30초 간격으로 테스트할 수 있어요.'});
 const date=dateInKorea(),events=todayEvents(readCalendar());
 if(b.kind==='today'&&!events.length)return json(res,200,{empty:true});
 let payload;
 if(b.kind==='preview'){
 payload=previews(readCalendar()).find(p=>p.key===b.preview)?.payload;
 if(!payload)return json(res,400,{error:'발송할 일정이 없는 미리보기입니다.'});
 }else payload=b.kind==='today'?message(events,date):{title:'씨야 아카이브 · 테스트 알림',body:'알림이 도착했어요! 화면을 닫거나 잠근 상태에서도 도착하는지 확인해 주세요.',url:base,tag:'seeya-test-'+Date.now()};
 own.lastRequest=Date.now();own.lastResult='15초 뒤 발송을 기다리고 있어요.';save();
 pending.set(id,setTimeout(()=>{pending.delete(id);void send(id,payload);},15000));
 return json(res,200,{queued:true,delay:15});
 }
 return json(res,404,{error:'Not found'});
 }
 if(req.method!=='GET')return json(res,405,{error:'Method not allowed'});
 if(route==='manifest.webmanifest')return json(res,200,{id:base,name:'씨야 알림 테스트',short_name:'씨야 알림',start_url:base,scope:base,display:'standalone',background_color:'#fffaf7',theme_color:'#793952',icons:[{src:base+'icon-192.png',sizes:'192x192',type:'image/png'},{src:base+'icon-512.png',sizes:'512x512',type:'image/png'}]});
 const files={'':['page.html','text/html; charset=utf-8'],'client.js':['client.js','text/javascript; charset=utf-8'],'style.css':['style.css','text/css; charset=utf-8'],'sw.js':['sw.js','text/javascript; charset=utf-8']};
 if(route==='badge-96.png'){res.setHeader('Content-Type','image/png');return res.end(fs.readFileSync(path.join(__dirname,route)));}
 const icons={'icon-192.png':'icon-192-v2.png','icon-512.png':'icon-512-v2.png','apple-touch-icon.png':'apple-touch-icon-180-v2.png'};
 if(icons[route]){res.setHeader('Content-Type','image/png');return res.end(fs.readFileSync(path.join(root,'images/app',icons[route])));}
 if(!files[route])return json(res,404,{error:'Not found'});
 const [file,type]=files[route];res.setHeader('Content-Type',type);res.end(fs.readFileSync(path.join(__dirname,file)));
 }catch{json(res,400,{error:'요청을 처리하지 못했어요. 새로고침 후 다시 시도해 주세요.'});}
});
if(require.main===module){server.listen(Number(process.env.PORT||8210),'127.0.0.1',()=>console.log('Push test: http://127.0.0.1:'+(process.env.PORT||8210)+base));}
module.exports={server,base,state,tick,send};
