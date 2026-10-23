'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),crypto=require('node:crypto');
const read=p=>fs.readFileSync(p,'utf8'),G=require('../src/shared/worldcup'),Stats=require('../src/shared/worldcup-stats-core');
const catalog=require('../src/shared/worldcup-manifest').current();
const props=new Map([['ENVIRONMENT','test'],['SPREADSHEET_ID','original'],['TOKEN_SECRET','fixture-secret']]);
function sheet(){const rows=[];return {rows,getLastRow:()=>rows.length,appendRow:r=>rows.push([...r]),setFrozenRows(){},getRange:(r,c,n=1,m=1)=>({getValues:()=>Array.from({length:n},(_,i)=>Array.from({length:m},(_,j)=>rows[r-1+i]?.[c-1+j]??'')),getValue:()=>rows[r-1]?.[c-1]??'',setValue:v=>{while(rows.length<r)rows.push([]);rows[r-1][c-1]=v;},setValues:v=>v.forEach((a,i)=>{while(rows.length<r+i)rows.push([]);a.forEach((x,j)=>rows[r-1+i][c-1+j]=x);})})};}
const sheets=new Map(),book={getSheetByName:n=>sheets.get(n),insertSheet:n=>{assert(!sheets.has(n));const s=sheet();sheets.set(n,s);return s;}};
const cache=new Map();let uuid=0,locked=false;
const ctx={Date,Set,JSON,Number,String,Array,Math,Error,WorldcupBracket:G,WorldcupStats:Stats,
 PropertiesService:{getScriptProperties:()=>({getProperty:k=>props.get(k),setProperty:(k,v)=>props.set(k,v)})},
 SpreadsheetApp:{openById:id=>{assert.equal(id,'original');return book;},flush(){}},
 Utilities:{getUuid:()=> 'fixture-uuid-'+(++uuid),computeHmacSha256Signature:(msg,key)=>[...crypto.createHmac('sha256',key).update(msg).digest()],computeDigest:(_,msg)=>[...crypto.createHash('sha256').update(msg).digest()],DigestAlgorithm:{SHA_256:1}},
 LockService:{getScriptLock:()=>({waitLock(){assert(!locked);locked=true;},tryLock(){assert(!locked);locked=true;return true;},releaseLock(){locked=false;}})},
 CacheService:{getScriptCache:()=>({get:k=>cache.get(k),put:(k,v)=>cache.set(k,v),remove:k=>cache.delete(k)})},
 ContentService:{MimeType:{JSON:'json'},createTextOutput:s=>({text:s,setMimeType(){return this;}})},Logger:{log(){}}};
vm.createContext(ctx);vm.runInContext(read('integrations/worldcup/Adapter.gs'),ctx);ctx.loadCatalog_=()=>catalog;
ctx.setupWorldcup();const c=catalog.find(c=>c.id==='album4'),ids=c.candidates.map(r=>r.id);
const request=(action,environment,other={})=>JSON.parse(ctx.dispatch_({action,environment,...other},['health','ranks','overview','catalog'].includes(action)).text);
const scope={collection:c.id,version:c.version,size:'all'};
function start(e){const d=request('start',e,{...scope,client:'fixture-client',requestId:'same-request',nickname:'검증'});assert(d.ok,JSON.stringify(d));return d;}
function finish(d,e){let g=d.game;while(!G.replay(g,ids,c.version).winner)g=G.choose(g,G.replay(g,ids,c.version).pair[0],ids,c.version);return {action:'finish',environment:e,...scope,id:g.id,token:d.token,picks:g.picks,winner:G.replay(g,ids,c.version).winner};}
function send(p){return JSON.parse(ctx.dispatch_(p,false).text);}
const test=start('test'),testDone=finish(test,'test');assert(send(testDone).ok);
const before=JSON.stringify(sheets.get('Results').rows),beforeSessions=JSON.stringify(sheets.get('Sessions').rows);
assert.equal(request('health','production').code,'NOT_READY');assert.equal(sheets.has('Production_Results'),false);
let automationRuns=0;ctx.setupWorldcupAutomation=()=>{automationRuns++;return 'owner-report';};
assert.equal(ctx.setupWorldcupPublicLaunch(),'owner-report');assert.equal(props.get('ENVIRONMENT'),'test');assert.equal(automationRuns,1);
assert.equal(sheets.get('Production_Results').getLastRow(),1);assert.equal(JSON.stringify(sheets.get('Results').rows),before);
assert.equal(request('ranks','production',scope).total,0);assert.equal(request('ranks','test',scope).total,1);
const health=request('health');assert.equal(health.environment,'production');assert(health.environmentIsolation&&health.publicReady&&health.nicknameSupport);assert.equal(health.maxCandidates,256);
const prod=start('production'),prodDone=finish(prod,'production');assert.notEqual(prod.game.id,test.game.id);
assert(!send({...testDone,environment:'production'}).ok);assert(!send({...prodDone,token:test.token}).ok);
assert(send(prodDone).ok);assert(send(prodDone).already);assert.equal(sheets.get('Production_Results').getLastRow(),2);
assert.equal(request('ranks','production',scope).total,1);assert.equal(request('ranks','test',scope).total,1);
assert.equal(sheets.get('Production_Results').rows[1][8],'검증');
ctx.setupWorldcupPublicLaunch();assert.equal(sheets.get('Production_Results').getLastRow(),2);assert.equal(JSON.stringify(sheets.get('Results').rows),before);assert.equal(JSON.stringify(sheets.get('Sessions').rows),beforeSessions);
assert.equal(start('production').game.id,prod.game.id);assert.equal(start('test').game.id,test.game.id);
assert.equal(request('health','unknown').code,'ENVIRONMENT');assert.equal(request('setupWorldcupPublicLaunch','production').code,'ACTION');
// Both rankings exist in distinct cache entries; finishing one cannot invalidate the other's cache.
request('ranks','production',scope);request('ranks','test',scope);assert.equal(cache.size,2);
const pub=read('game/worldcup/index.html'),testHtml=read('game/worldcup/test/index.html');
const payload=h=>JSON.parse(h.match(/id="worldcupData">(.*?)<\/script>/s)[1]);
assert.equal(payload(pub).stats.environment,'production');assert.equal(payload(testHtml).stats.environment,'test');
assert.equal(payload(pub).stats.endpoint,payload(testHtml).stats.endpoint);assert(pub.includes('href="/game/"'));assert(testHtml.includes('href="/game/test/"'));
assert(!pub.includes('noindex,nofollow'));assert(testHtml.includes('noindex,nofollow'));assert(read('sitemap.xml').includes('/game/worldcup/'));assert(!read('sitemap.xml').includes('/game/worldcup/test/'));
assert(pub.includes('/assets/worldcup.')&&pub.includes('strict-origin-when-cross-origin'));assert(read('manage/index.html').includes('&quot;environment&quot;:&quot;production&quot;'));
assert.equal(require('../src/data/worldcup-stats.json').environment,'production');
// Use the real browser client to ensure old test history cannot appear in public play.
const values=new Map([['seeya-worldcup-test-v1',JSON.stringify(test.game)],['seeya-worldcup-test-v1-results','[]']]);let click;
const node=()=>({innerHTML:'',textContent:'',hidden:false,addEventListener(){},querySelector:()=>null,scrollIntoView(){}}),app=node(),notice=node();app.addEventListener=(name,fn)=>{if(name==='click')click=fn;};app.querySelector=q=>q.includes('wcSize')?{value:'32'}:null;
const nodes={worldcupApp:app,wcNotice:notice,worldcupData:{textContent:JSON.stringify({...payload(pub),stats:{environment:'production'}})}};
const client={require:n=>n.includes('worldcup-presentation')?require('../src/shared/worldcup-presentation'):n==='../shared/worldcup'?G:n.includes('worldcup-stats')?{create:()=>({enabled:false,pending:()=>[]})}:n.includes('passport-play-save')?require('../src/shared/passport-play-save'):{esc:String},document:{getElementById:id=>nodes[id]},window:{addEventListener(){},YT:{Player:function(){this.destroy=()=>{};}},confirm:()=>true},localStorage:{getItem:k=>values.get(k)||null,setItem:(k,v)=>values.set(k,v)},location:{origin:'https://example.invalid',pathname:'/game/worldcup/',search:'?type=group'},history:{replaceState(){}},crypto:{randomUUID:()=> 'local-public'},URLSearchParams,Date,JSON,Math,Promise,setTimeout,clearTimeout,navigator:{}};
vm.runInNewContext(read('src/client/worldcup.js'),client);assert(!app.innerHTML.includes('data-action="resume"'));
Promise.resolve(click({target:{closest:()=>({dataset:{action:'start'}})}})).then(()=>{assert(values.has('seeya-worldcup-production-v1'));assert.equal(values.get('seeya-worldcup-test-v1'),JSON.stringify(test.game));console.log('PASS public launch: idempotent setup, preserved test ledger, zero public baseline, separate sessions/signatures/dedup/caches/nicknames, public routes/admin and isolated browser progress.');}).catch(e=>{console.error(e);process.exitCode=1;});
