'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const API=require('../src/client/diary-drive-api'),P=require('../src/shared/passport');
const root=path.resolve(__dirname,'..'),read=p=>fs.readFileSync(path.join(root,p),'utf8');
async function main(){
 assert(API.validClientId('123-unit.apps.googleusercontent.com'));assert(!API.validClientId('secret'));assert(!API.validClientId(''));
 const configured=JSON.parse(read('src/data/diary-drive.json'));assert(configured.clientId===''||API.validClientId(configured.clientId));
 let time=Date.parse('2026-10-17T00:00:00Z'),mode='ok',callback,stored='',metadata,requests=[],failure=0,corrupt=false,evil=false;
 const service=API.create('123-unit.apps.googleusercontent.com',{now:()=>time,fetch:async(url,options)=>{
  requests.push({url,options});assert.equal(options.headers.Authorization,'Bearer MEMORY_ONLY_TOKEN');assert.equal(options.cache,'no-store');assert.equal(options.credentials,'omit');assert(!url.includes('MEMORY_ONLY_TOKEN'));
  if(failure)return new Response(JSON.stringify({error:{errors:[{reason:failure===403?'storageQuotaExceeded':'error'}]}}),{status:failure});
  if(url.includes('/about?'))return Response.json({user:{displayName:'Test',emailAddress:'test@example.com'}});
  if(url.includes('uploadType=resumable')){metadata=JSON.parse(options.body);assert.equal(options.method,'POST');assert.equal(metadata.appProperties.seeyaBackup,API.MARKER);assert(!('parents' in metadata));return new Response('',{headers:{Location:evil?'https://attacker.invalid/steal':'https://www.googleapis.com/upload/drive/v3/files?upload_id=test'}});}
  if(url.includes('upload_id=')){assert.equal(options.method,'PUT');stored=await options.body.text();return Response.json({...metadata,id:'file-1',size:String(new Blob([stored]).size),createdTime:new Date(time).toISOString()});}
  if(url.includes('alt=media'))return new Response(corrupt?'{bad':stored);
  const q=new URL(url).searchParams;assert(q.get('q').includes("'me' in owners"));assert(q.get('q').includes(API.MARKER));assert.equal(q.get('orderBy'),'createdTime desc');return Response.json({files:[],nextPageToken:'next-page'});
 }});
 const oauth={hasGrantedAllScopes:(result,scope)=>{assert.equal(scope,API.SCOPE);return mode!=='denied';},initTokenClient:opts=>{
  callback=opts;assert.equal(opts.scope,API.SCOPE);assert.equal(opts.include_granted_scopes,false);
  return {requestAccessToken:options=>{assert.equal(options.prompt,'select_account');queueMicrotask(()=>mode==='popup'?opts.error_callback({type:'popup_failed_to_open'}):opts.callback(mode==='error'?{error:'access_denied'}:{access_token:'MEMORY_ONLY_TOKEN',expires_in:3600}));}};
 }};
 service.prepare({accounts:{oauth2:oauth}});assert(!service.connected());
 for(mode of ['denied','error','popup']){await assert.rejects(service.connect());assert(!service.connected());}mode='ok';
 await service.connect();assert.equal(service.account().emailAddress,'test@example.com');
 const state=P.empty();state.profile.nickname='테스트';state.entries=[P.entry({entryId:'sample-record',kind:'story',status:'done',title:'기억',date:'2026-10-16',members:['seeya'],note:'비공개 메모',createdAt:'2026-10-16T00:00:00Z',updatedAt:'2026-10-16T00:00:00Z'})];
 const result=await service.backup(state);assert.equal(result.count,1);assert.equal(JSON.parse(stored).entries[0].note,'비공개 메모');assert.deepEqual(await service.read(result.file),P.validate(state));
 await service.list();await service.list('page2');assert(requests.at(-1).url.includes('pageToken=page2'));
 corrupt=true;await assert.rejects(service.read(result.file),/백업 내용을/);await assert.rejects(service.backup(state),/내용 확인/);corrupt=false;
 evil=true;await assert.rejects(service.backup(state),/지원하지 않는 백업 주소/);assert(!requests.some(r=>r.url.includes('attacker')));evil=false;
 await assert.rejects(service.read({...result.file,id:'../steal'}));await assert.rejects(service.read({...result.file,size:API.MAX_BYTES+1}));await assert.rejects(service.backup({schemaVersion:2}));
 for(failure of [403,404,429,500])await assert.rejects(service.list());failure=401;await assert.rejects(service.list(),/다시 연결/);assert(!service.connected());failure=0;
 await service.connect();time+=3600*1000;await assert.rejects(service.list(),/다시 연결/);assert(!service.connected());
 await service.connect();service.disconnect();assert.equal(service.account(),null);await assert.rejects(service.backup(state),/다시 연결/);
 assert(!requests.some(r=>['PATCH','DELETE'].includes(r.options.method)),'Cloud snapshots must never be overwritten or automatically deleted');
 const source=read('src/client/diary-drive-api.js');assert(!/localStorage|sessionStorage/.test(source));assert(!source.includes('client_secret'));
 assert(read('diary/privacy/index.html').includes('drive.file'));assert(!read('diary/index.html').includes('gsi/client'),'Load Google only on an explicit connection request');
 assert(read('src/passport-worker.js').includes('u.origin!==self.location.origin'),'No Drive response caching');
 console.log('PASS Drive backup: optional configuration, minimum scope, memory-only credentials, denial/popup/expiry, owned-file paging, private snapshots, verified upload, invalid/oversized backup rejection, safe API origins and non-destructive restore inputs.');
}
main().catch(error=>{console.error(error);process.exitCode=1;});
