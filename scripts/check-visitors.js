'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
async function run(){
 let instant='2026-10-21T18:00:00+09:00',fail=false,tick;
 class Clock extends Date{constructor(...args){super(...(args.length?args:[instant]));}static now(){return new Date(instant).getTime();}}
 const element=()=>({textContent:'',hidden:false,children:[],append(...items){this.children.push(...items);},replaceChildren(){this.children=[];},setAttribute(name,value){this[name]=value;}});
 const ids=Object.fromEntries(['today-visitors-count','today-visitors-status'].map(x=>[x,element()]));
 ids['today-visitors-count'].parentElement=element();
 const listeners={},document={visibilityState:'visible',getElementById:id=>ids[id],createElement:element,addEventListener:(event,fn)=>listeners[event]=fn};
 const sample={schemaVersion:2,metric:'totalUsers',timeZone:'Asia/Seoul',date:'2026-10-21',users:12,updatedAt:'2026-10-21T17:55:00+09:00',limited:false,history:Array.from({length:8},(_,i)=>({date:`2026-10-${14+i}`,users:i===7?12:27}))};
 let response=sample,calls=0;
 vm.runInNewContext(fs.readFileSync(path.join(__dirname,'../assets/visitor-count.js'),'utf8'),{document,window:{addEventListener:(e,fn)=>listeners[e]=fn},Date:Clock,Intl,setInterval:fn=>tick=fn,fetch:async(url,options)=>{calls++;assert.equal(options.cache,'no-store');if(fail)throw Error('offline');return {ok:true,json:async()=>response};}});
 const flush=()=>new Promise(resolve=>setImmediate(resolve));await flush();
 assert.equal(ids['today-visitors-count'].textContent,'12');assert.equal(ids['today-visitors-status'].textContent,'명');
 const home=fs.readFileSync(path.join(__dirname,'../src/pages/home.js'),'utf8');assert(!/visitor-history|yesterday-visitors|visitor-help|visitor-update/.test(home));
 response={...sample,updatedAt:'2026-10-21T14:17:00+09:00'};tick();await flush();assert(ids['today-visitors-count'].parentElement.title.includes('갱신 지연'));
 fail=true;tick();await flush();assert.equal(ids['today-visitors-count'].textContent,'12');assert(ids['today-visitors-count'].parentElement.title.includes('연결 실패'));
 instant='2026-10-22T00:01:00+09:00';listeners.pageshow();await flush();assert.equal(ids['today-visitors-count'].textContent,'—');assert.equal(ids['today-visitors-status'].textContent,'집계 대기');
 fail=false;response={...sample,users:-9};tick();await flush();assert.equal(ids['today-visitors-count'].textContent,'—');
 instant='2026-10-21T18:00:00+09:00';response={date:'2026-10-21',users:3,updatedAt:'2026-10-21T14:17:00+09:00'};tick();await flush();assert.equal(ids['today-visitors-count'].textContent,'3');assert.equal(ids['today-visitors-status'].textContent,'명');
 response={...sample,history:[{date:'<img>',users:1}]};tick();await flush();assert.equal(ids['today-visitors-count'].textContent,'3');
 response={...sample,updatedAt:'2026-10-22T18:00:00+09:00'};tick();await flush();assert.equal(ids['today-visitors-count'].textContent,'3');
 document.visibilityState='hidden';const before=calls;tick();await flush();assert.equal(calls,before);
 document.visibilityState='visible';response=sample;listeners.visibilitychange();await flush();assert.equal(ids['today-visitors-count'].textContent,'12');
 console.log('PASS visitors: Today-only display, lag/offline metadata, KST rollover, old schema, invalid data and resume.');
}
run().catch(error=>{console.error(error);process.exitCode=1;});
