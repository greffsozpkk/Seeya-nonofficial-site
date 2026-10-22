'use strict';
const assert=require('node:assert/strict'),crypto=require('node:crypto'),fs=require('node:fs'),path=require('node:path');
const G=require('../src/shared/worldcup'),{audit}=require('../src/shared/worldcup-collections'),{createService}=require('../src/shared/worldcup-stats-core'),{create}=require('../src/client/worldcup-stats');
const catalog=audit();let now=Date.parse('2026-10-22T00:00:00Z'),seq=0,paused=false,failAfterAppend=false;const sessions=[],results=[];
const sign=id=>crypto.createHmac('sha256','test-secret').update(id).digest('hex');
const repo={paused:()=>paused,request:(client,id)=>sessions.find(s=>s.client===client&&s.requestId===id),usage:(client,t)=>({hour:sessions.filter(s=>s.client===client&&s.issued>t-3600000).length,day:0,globalDay:0}),session:id=>sessions.find(s=>s.id===id),result:id=>results.find(r=>r.id===id),results:()=>results,addSession:s=>sessions.push(s),addResult:r=>{results.push(r);if(failAfterAppend){failAfterAppend=false;throw Error('response lost');}}};
const service=createService(catalog,repo,{environment:'test',now:()=>now,uuid:()=> 'session-'+(++seq),random:()=>.31,hash:x=>sign(x),sign,verify:(id,t)=>sign(id)===t});
const c=catalog[0],scope={environment:'test',collection:c.id,version:c.version,size:32};
const request=(id='request-0001')=>({action:'start',...scope,client:'client-test-01',requestId:id});
const rejected=(fn,code)=>assert.throws(fn,e=>e.code===code);
const issued=service.handle(request());assert.equal(sessions.length,1);assert.deepEqual(service.handle(request()),issued);assert.equal(sessions.length,1);
rejected(()=>service.handle({...request(),size:64}),'CONFLICT');
rejected(()=>service.handle({...request('new-request'),environment:'production'}),'ENVIRONMENT');
rejected(()=>service.handle({...request('new-request'),size:16}),'VERSION');
rejected(()=>service.handle({...request('new-request'),client:'=SUM(A1)'}),'INPUT');
function finishPayload(issued,c,size){let game=issued.game,ids=c.candidates.map(x=>x.id);while(!G.replay(game,ids,c.version).winner)game=G.choose(game,G.replay(game,ids,c.version).pair[0],ids,c.version);return {action:'finish',environment:'test',collection:c.id,version:c.version,size,id:game.id,token:issued.token,picks:game.picks,winner:G.replay(game,ids,c.version).winner};}
const submit=finishPayload(issued,c,32);
rejected(()=>service.handle({...submit,token:'fake'}),'TOKEN');rejected(()=>service.handle({...submit,picks:[]}),'INCOMPLETE');rejected(()=>service.handle({...submit,picks:['unknown']}),'PATH');rejected(()=>service.handle({...submit,winner:'other'}),'INCOMPLETE');rejected(()=>service.handle(submit),'TOO_FAST');
now+=20000;failAfterAppend=true;assert.throws(()=>service.handle(submit),/response lost/);assert.equal(results.length,1);assert(service.handle(submit).already);assert.equal(results.length,1);
for(let i=0;i<12;i++)assert(service.handle(submit).already);assert.equal(results.length,1);
rejected(()=>service.handle({...submit,winner:'unknown'}),'CONFLICT');
const rank=service.handle({action:'ranks',...scope});assert.equal(rank.total,1);assert.equal(rank.rows[0].percent,100);assert.equal(rank.rows.length,75);
results[0].excluded=true;assert.equal(service.handle({action:'ranks',...scope}).total,0);assert(service.handle(submit).excluded);results[0].excluded=false;
// Successful receipts survive session expiry and cleanup.
now+=25*3600000;assert(service.handle(submit).already);const expired=service.handle(request('expire-request'));now+=25*3600000;rejected(()=>service.handle(finishPayload(expired,c,32)),'EXPIRED');
paused=true;rejected(()=>service.handle(request('pause-request')),'PAUSED');paused=false;
// Every collection/mode uses the same server-issued bracket, including byes.
for(const col of catalog)for(const size of col.rounds){const issued=service.handle({action:'start',environment:'test',collection:col.id,version:col.version,size,client:'client-'+col.id,requestId:'request-'+(++seq)});now+=20000;const p=finishPayload(issued,col,size);assert(!service.handle(p).already);assert(service.handle(p).already);}
const col=catalog[1],other=service.handle({action:'ranks',environment:'test',collection:col.id,version:col.version,size:16});assert.equal(other.total,1);
// A duplicated ledger row from manual import cannot inflate rankings.
results.push({...results[0]});const counts=service.handle({action:'ranks',...scope});assert.equal(counts.total,2);assert.equal(counts.rows[0].wins,2);
for(let i=0;i<10;i++)service.handle({...request('rate-request-'+i),client:'rate-client'});rejected(()=>service.handle({...request('rate-request-11'),client:'rate-client'}),'RATE_LIMIT');
// Candidate duplicate audit catches accidental ID, media and text aliases.
for(const key of ['id','youtubeId','title']){const copy=structuredClone(catalog);copy[0].candidates[1][key]=copy[0].candidates[0][key];assert.throws(()=>audit(copy),/중복/);}
async function checkTransport(){
 const storageMap=new Map(),storage={getItem:k=>storageMap.get(k)||null,setItem:(k,v)=>storageMap.set(k,v)};let calls=0,drop=true;
 const config={endpoint:'https://script.google.com/macros/s/test_deployment/exec',environment:'test'};
 const network=async(url,options)=>{calls++;assert.equal(options.credentials,'omit');assert(!options.mode);const q=JSON.parse(options.body);let d;try{d=service.handle(q);}catch(e){d={ok:false,code:e.code,message:e.message};}if(q.action==='finish'&&drop){drop=false;throw Error('network lost after save');}return {ok:true,type:'cors',json:async()=>d};};
 const client=create(config,{fetch:network,storage,uuid:()=> 'client-transport',now:()=>now});const started=await client.start(c,32,'transport-request');now+=20000;const complete=finishPayload(started,c,32);const game={...started.game,picks:complete.picks,remote:{token:started.token,expires:started.expires,environment:'test'}};
 client.queue(c,game,complete.winner);client.queue(c,game,complete.winner);assert.equal(client.pending().length,1);
 let response=await client.submit(game.id);assert.equal(response.status,'pending');assert.equal(repo.results().filter(x=>x.id===game.id).length,1);
 const before=calls;await client.submit(game.id);assert.equal(calls,before,'backoff');response=await client.submit(game.id,true);assert.equal(response.status,'saved');assert(response.already);assert.equal(repo.results().filter(x=>x.id===game.id).length,1);
 await client.submit(game.id,true);assert.equal(calls,before+1);assert.equal(client.pending().length,0);
 const bad=create({...config,environment:'production'},{fetch:network,storage,uuid:()=> 'prod-client',now:()=>now});assert.equal(bad.get(game.id),undefined);await assert.rejects(bad.start(c,32,'prod-request'),e=>e.code==='ENVIRONMENT');
 const opaque=create(config,{fetch:async()=>({ok:true,type:'opaque'}),storage});await assert.rejects(opaque.call({action:'health'}));
 const off=create({endpoint:''},{fetch:()=>{throw Error('must not fetch');},storage});assert(!off.enabled);await assert.rejects(off.call({action:'health'}),e=>e.code==='UNCONFIGURED');
 // Two simultaneous finish calls share the same request in this page.
 const second=await client.start(c,32,'transport-second');now+=20000;const p=finishPayload(second,c,32);client.queue(c,{...second.game,picks:p.picks,remote:{token:second.token,expires:second.expires,environment:'test'}},p.winner);const b=calls;await Promise.all([client.submit(second.game.id,true),client.submit(second.game.id,true)]);assert.equal(calls,b+1);
 console.log('PASS stats: server-issued four-type brackets, duplicate starts/submissions, tampering/expiry/rate limits, ledger recovery/exclusion/rebuild, separate environments, retry/backoff, opaque rejection and simultaneous client submissions.');
}
async function checkRemoteClient(){
 const vm=require('node:vm'),values=new Map(),timers=[],nodes={},listeners={};let click,requestId=0;
 const node=()=>({innerHTML:'',textContent:'',hidden:false,focus(){},scrollIntoView(){},setAttribute(){}});
 const app=node();app.addEventListener=(name,fn)=>click=fn;app.querySelectorAll=()=>[];app.querySelector=selector=>selector.includes('wcSize')?{value:'16'}:selector==='#wcJoinStats'?{checked:true}:node();
 const storage={getItem:k=>values.get(k)||null,setItem:(k,v)=>values.set(k,v)},conf={endpoint:'https://script.google.com/macros/s/test_deployment/exec',environment:'test'};
 const remote=create(conf,{storage,uuid:()=> 'ui-browser-client',now:()=>now,fetch:async(u,o)=>{const q=JSON.parse(o.body);return {ok:true,type:'cors',json:async()=>service.handle(q)};}});
 nodes.worldcupApp=app;nodes.wcNotice=node();nodes.worldcupData={textContent:JSON.stringify({collections:catalog,stats:conf})};nodes.wcSyncStatus=node();
 const ctx={require:n=>n==='../shared/worldcup'?G:n==='./worldcup-stats'?{create:()=>remote}:n==='../shared/passport-play-save'?require('../src/shared/passport-play-save'):{esc:s=>String(s)},document:{getElementById:id=>nodes[id],createElement:()=>node(),head:{append(){}}},window:{YT:{Player:function(){this.destroy=()=>{};this.pauseVideo=()=>{};}},confirm:()=>true,addEventListener:(n,fn)=>listeners[n]=fn},localStorage:storage,location:{origin:'https://example.test',pathname:'/game/worldcup/test/',search:'?type=solo'},history:{replaceState(){}},crypto:{randomUUID:()=> 'ui-request-'+(++requestId)},URLSearchParams,Date,Math,Promise,setTimeout:fn=>{timers.push(fn);return 1;},clearTimeout(){},navigator:{}};
 const run=()=>vm.runInNewContext('(function(){'+fs.readFileSync(path.resolve(__dirname,'../src/client/worldcup.js'),'utf8')+'})();',ctx);run();
 const button=dataset=>({dataset,disabled:false,insertAdjacentElement(){}}),tap=async dataset=>click({target:{closest:()=>button(dataset)}});
 await tap({action:'start'});let g=JSON.parse(values.get('seeya-worldcup-test-solo-v1'));assert(g.remote&&g.initial.length===16);now+=20000;
 const col=catalog.find(c=>c.id==='solo'),ids=col.candidates.map(x=>x.id);
 while(!G.replay(g,ids,col.version).winner){await tap({pick:G.replay(g,ids,col.version).pair[0]});timers.shift()();await new Promise(resolve=>setImmediate(resolve));g=JSON.parse(values.get('seeya-worldcup-test-solo-v1'));}
 assert(app.innerHTML.includes('이 결과 다이어리에 저장'));assert(nodes.wcSyncStatus.innerHTML.includes('통계 반영 완료'));assert.equal(repo.results().filter(x=>x.id===g.id).length,1);
 await tap({action:'global-rank'});await new Promise(resolve=>setImmediate(resolve));assert(app.innerHTML.includes('TEST STATISTICS'));assert(app.innerHTML.includes('<table>'));assert(app.innerHTML.includes('1 / 2'));await tap({globalPage:'2'});await new Promise(resolve=>setImmediate(resolve));assert(app.innerHTML.includes('2 / 2'));
 await tap({action:'diary'});assert(JSON.parse(values.get('seeya-passport-v1')).entries.length===1);await tap({action:'diary'});assert(JSON.parse(values.get('seeya-passport-v1')).entries.length===1);
 // Sharing cannot queue or register a second copy of the same result.
 ctx.location.search='?type=solo&winner='+G.replay(g,ids,col.version).winner;const before=results.length;run();await new Promise(resolve=>setImmediate(resolve));assert.equal(results.length,before);assert(!app.innerHTML.includes('data-action="diary"'));
 console.log('PASS remote client: server start to final receipt, 20-row ranking pages, manual diary dedup and shared-result isolation.');
}
const root=path.resolve(__dirname,'..'),adapter=fs.readFileSync(path.join(root,'integrations/worldcup/Code.gs'),'utf8');assert(adapter.includes('getScriptLock()')&&adapter.includes('SpreadsheetApp.flush()'));assert(!adapter.includes('TOKEN_SECRET='));assert(adapter.includes('function backupResults()'));assert(adapter.includes('function rebuildStatistics()'));assert(!fs.readFileSync(path.join(root,'src/client/worldcup-stats.js'),'utf8').includes('no-cors'));
checkTransport().then(checkRemoteClient).catch(e=>{console.error(e);process.exitCode=1;});
