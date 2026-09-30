'use strict';
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..'),read=p=>fs.readFileSync(path.join(root,p),'utf8');
const worker=read('sw.js'),fallback=read('offline.html'),build=JSON.parse(read('build-manifest.json'));
const originalImage=fs.readFileSync(path.join(root,'images/app/seeya-offline-characters.png'));
assert.equal(fallback,read('src/offline.html').replace('{{offlineIllustration}}','data:image/png;base64,'+originalImage.toString('base64')));
const embedded=fallback.match(/<img src="data:image\/png;base64,([^"]+)"/);
assert(embedded,'Offline image must be embedded');assert(Buffer.from(embedded[1],'base64').equals(originalImage));
assert(!fallback.includes('{{offlineIllustration}}'));
assert.equal(originalImage.readUInt32BE(16),1536);assert.equal(originalImage.readUInt32BE(20),1024);
const gallery=JSON.parse(read('src/data/character-gallery.json'));
assert.equal(gallery.filter(x=>x.image==='/images/app/seeya-offline-characters.png').length,1);
assert.deepEqual(gallery.find(x=>x.id==='offline-characters').usedOn,[{label:'연결 안내',path:'/offline.html'}]);assert(build.auxiliary.includes('offline.html'));
assert(!/skipWaiting\(|clients\.claim\(/.test(worker));assert(!/__OFFLINE_HASH__|__PUBLIC_PATHS__/.test(worker));
assert(!/<(?:link|iframe)\b|src="https?:/.test(fallback));assert(fallback.includes('noindex,nofollow'));
for(const file of build.files.filter(p=>p.endsWith('.html')))assert(/src="\/assets\/offline\.[a-f0-9]+\.js"/.test(read(file)),file);
const preview=JSON.parse(read('src/data/exam-preview-route.json')).path;
assert(!/src="\/assets\/offline\./.test(read(preview.slice(1)+'index.html')));
assert(!read('sitemap.xml').includes('/offline.html'));
const handlers={},stores=new Map(),origin='https://seeya-fanpage.com';
let mode='online',fetches=[];
const cacheFor=name=>({put:async(key,value)=>stores.get(name).set(key,value.clone()),match:async key=>stores.get(name).get(key)?.clone()});
const cacheApi={open:async name=>{if(!stores.has(name))stores.set(name,new Map());return cacheFor(name);},keys:async()=>[...stores.keys()],delete:async name=>stores.delete(name)};
vm.runInNewContext(worker,{self:{location:{origin},addEventListener:(name,fn)=>handlers[name]=fn},URL,Request:class{constructor(url,options){this.url=new URL(url,origin).href;Object.assign(this,options);}},caches:cacheApi,fetch:async(request,options)=>{
 fetches.push({request,options});if(mode==='offline')throw Error('Offline');
 return new Response(request.url.endsWith('/offline.html')?fallback:'CURRENT '+mode,{status:mode==='missing'?404:mode==='server-error'?503:200,headers:{'content-type':'text/html'}});
}});
const lifecycle=async name=>{let job;handlers[name]({waitUntil:p=>job=p});await job;};
function navigate(url,mode='navigate',method='GET'){let response;handlers.fetch({request:{url:new URL(url,origin).href,mode,method},respondWith:p=>response=p});return response;}
async function check(){
 await lifecycle('install');assert.equal(stores.size,1);const name=[...stores.keys()][0];assert.deepEqual([...stores.get(name).keys()],['/offline.html']);assert.equal(fetches[0].request.cache,'reload');
 for(const status of ['online','missing','server-error']){mode=status;const response=await navigate('/archive/?record=test');assert.equal(await response.text(),'CURRENT '+status);assert.equal(fetches.at(-1).options.cache,'no-store');}
 mode='offline';assert.equal(await(await navigate('/music/')).text(),fallback);assert.equal(await(await navigate('/music/index.html')).text(),fallback);assert.equal(await(await navigate('/?source=pwa')).text(),fallback);
 for(const [url,type,method] of [['/data/news.json','cors'],['/data/archive.json','cors'],['/assets/site.js','no-cors'],['/images/a.png','no-cors'],['https://www.youtube.com/embed/test','navigate'],['/unknown/','navigate'],[preview,'navigate'],['/','navigate','POST']])assert.equal(navigate(url,type,method),undefined,url);
 stores.set('unrelated-cache',new Map([['keep',1]]));stores.set('seeya-offline-old',new Map());await lifecycle('activate');assert(stores.has('unrelated-cache'));assert(!stores.has('seeya-offline-old'));assert(stores.has(name));
 assert.deepEqual([...stores.get(name).keys()],['/offline.html'],'Only the fallback is cached');
 mode='online';assert.equal(await(await navigate('/music/')).text(),'CURRENT online','Restored network returns actual page');
 mode='offline';stores.get(name).clear();await assert.rejects(navigate('/music/'));
 const registerSource=read('src/client/offline.js');
 for(const config of [{secure:false,supported:true},{secure:true,supported:false},{secure:true,supported:true},{secure:true,supported:true,loaded:true}]){
  const registrations=[],events={};const navigator=config.supported?{serviceWorker:{register:(url,opts)=>{registrations.push({url,opts});return Promise.reject(Error('blocked storage'));}}}:{};
  vm.runInNewContext(registerSource,{navigator,window:{isSecureContext:config.secure,addEventListener:(name,fn)=>events[name]=fn},document:{readyState:config.loaded?'complete':'loading'}});
  if(events.load)events.load();await Promise.resolve();
  assert.equal(registrations.length,config.secure&&config.supported?1:0);
  if(registrations.length){assert.equal(registrations[0].url,'/sw.js');assert.equal(registrations[0].opts.updateViaCache,'none');}
 }
 console.log('PASS offline: one cached fallback; fresh navigations; offline/recovery; 404/503 pass-through; JSON/assets/private/third-party exclusion; scoped cleanup; optional registration.');
}
check().catch(error=>{console.error(error);process.exitCode=1;});
