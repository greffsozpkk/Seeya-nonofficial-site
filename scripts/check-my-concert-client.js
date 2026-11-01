'use strict';
// Exercise storage/network failure and share isolation through the actual client event handlers.
const assert=require('node:assert/strict'),vm=require('node:vm'),fs=require('node:fs');
const M=require('../src/shared/my-concert'),catalog=require('../game/my-concert/catalog.json');
const code=fs.readFileSync(require.resolve('../src/client/my-concert'),'utf8');
const flush=()=>new Promise(r=>setImmediate(r));
async function session({raw=null,search='',storageFails=false,networkFails=false}={}){
 const elements=new Map(),events={},writes=[];
 function el(id){if(!elements.has(id))elements.set(id,{id,hidden:true,textContent:'',value:'',dataset:{},innerHTML:'',setAttribute(){},querySelector(){return el('columns');},querySelectorAll(){return[];},addEventListener(type,fn){events[type]=fn;},focus(){},select(){},scrollIntoView(){},showModal(){this.open=true;},close(){this.open=false;},getContext(){return{drawImage(){}};}});return elements.get(id);}
 let unavailable=networkFails;
 const scope={require:n=>n.includes('poster')?{render:async()=>{}}:M,document:{getElementById:el,createElement:()=>el('canvas')},window:{addEventListener(){}},localStorage:{getItem(){return raw;},setItem(k,v){if(storageFails)throw Error('blocked');raw=v;writes.push(v);}},fetch:async()=>{if(unavailable)throw Error('offline');return{ok:true,json:async()=>catalog};},navigator:{clipboard:{writeText:async()=>{throw Error('denied');}}},history:{replaceState(){}},location:{search,pathname:'/game/my-concert/test/',origin:'https://example.test'},URL,URLSearchParams,TextEncoder,TextDecoder,console,setTimeout:()=>1,clearTimeout(){}};
 vm.runInNewContext(code,scope);await flush();
 return {el,writes,get raw(){return raw;},online(){unavailable=false;},async click(dataset){const b={dataset,hasAttribute:()=>false};events.click({target:{closest:()=>b}});await flush();}};
}
(async()=>{
 let s=await session({storageFails:true});await s.click({add:catalog.songs[0].id});assert.equal(s.el('mcTotal').textContent,'1 / 12');assert.match(s.el('mcSaved').textContent,/사용할 수 없/);assert.equal(s.writes.length,0);
 s=await session({raw:'{broken'});assert.equal(s.el('mcRecovery').hidden,false);await s.click({add:catalog.songs[0].id});assert.equal(s.raw,'{broken');assert.equal(s.writes.length,0);
 await s.click({action:'recover'});assert(s.el('mcConfirm').open);await s.click({action:'cancelConfirm'});assert.equal(s.raw,'{broken');
 const d=M.fresh();d.title='내 원래 편집본';const original=JSON.stringify(d);
 s=await session({raw:original,networkFails:true});assert.equal(s.el('mcLoadError').hidden,false);assert.equal(s.raw,original);s.online();await s.click({action:'retry'});assert.equal(s.el('mcTitle').value,d.title);
 const shared=M.fresh();shared.title='<공유 공연>';shared.sections={opening:[catalog.songs[0].id],main:catalog.songs.slice(1,10).map(x=>x.id),encore:catalog.songs.slice(10,12).map(x=>x.id)};
 s=await session({raw:original,search:'?concert='+M.encode(shared)});assert.equal(s.el('mcResult').hidden,false);assert.equal(s.raw,original);assert.match(s.el('mcTextList').innerHTML,/&lt;공유 공연&gt;/);
 await s.click({theme:'night'});assert.equal(s.writes.length,0);await s.click({action:'share'});assert.equal(s.el('mcCopy').hidden,false);assert(s.el('mcCopyLink').value.startsWith('https://example.test/'));
 await s.click({action:'edit'});assert(s.el('mcConfirm').open);await s.click({action:'cancelConfirm'});assert.equal(s.raw,original);
 await s.click({action:'edit'});await s.click({action:'confirm'});assert.equal(JSON.parse(s.raw).title,shared.title);assert.equal(JSON.parse(s.raw).theme,'night');
 s=await session({raw:original,search:'?concert=e30'});assert.equal(s.el('mcSharedError').hidden,false);assert.equal(s.writes.length,0);await s.click({action:'own'});assert.equal(s.el('mcTitle').value,d.title);
 s=await session({search:'?concert='+M.encode(shared)});assert.equal(s.el('mcResult').hidden,false);assert.equal(s.writes.length,0);await s.click({action:'edit'});assert.equal(JSON.parse(s.raw).sections.main.length,9);
 console.log('My concert client: storage failures, corrupt draft recovery, network retry, share isolation and clipboard fallback passed.');
})().catch(e=>{console.error(e);process.exitCode=1;});
