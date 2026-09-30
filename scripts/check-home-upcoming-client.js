'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const {createRequire}=require('node:module');
const path=require('node:path');
const source=path.resolve(__dirname,'../src/client/home-upcoming.js');
const {homeUpcoming}=require('../src/shared/home-upcoming');
const record=(id,date)=>({id,date,title:id,members:['김연지'],type:'radio',dateStatus:'confirmed',dateBasis:'broadcast',eventState:'scheduled'});
async function run(){
 let instant='2026-09-30T23:59:00+09:00',response=[record('fresh','2026-10-01')],fail=false,calls=0;
 class Clock extends Date{constructor(...args){super(...(args.length?args:[instant]));}static now(){return new Date(instant).getTime();}}
 const parse=html=>({innerHTML:html.slice(html.indexOf('>')+1,html.lastIndexOf('</section>')),dataset:{day:html.match(/data-day="([^"]+)"/)[1]}});
 const root=parse(homeUpcoming([record('old','2026-09-30')],new Clock()));
 const listeners={},document={visibilityState:'visible',getElementById:()=>root,addEventListener:(name,fn)=>listeners[name]=fn,createElement:()=>({set innerHTML(html){this.firstElementChild=parse(html);}})};
 let tick;
 const localRequire=createRequire(source);
 const requireAtTime=name=>{const dependency=localRequire(name);return name==='../shared/calendar-data'?{...dependency,koreaDate:()=>dependency.koreaDate(new Clock())}:dependency;};
 const context={module:{exports:{}},require:requireAtTime,document,window:{addEventListener:(name,fn)=>listeners[name]=fn},Date:Clock,setInterval:fn=>{tick=fn;},fetch:async(url,options)=>{
  assert.equal(url,'/data/archive.json');assert.equal(options.cache,'no-store');calls++;
  if(fail)throw Error('offline');return {ok:true,json:async()=>response};
 }};
 vm.runInNewContext(fs.readFileSync(source,'utf8'),context,{filename:source});
 const flush=()=>new Promise(resolve=>setImmediate(resolve));
 context.module.exports.initHomeUpcoming([record('old','2026-09-30')]);await flush();
 assert(root.innerHTML.includes('fresh'));assert(!root.innerHTML.includes('>old<'));
 // Returning after midnight recomputes the date and removes yesterday's records.
 response=[record('yesterday','2026-09-30'),record('new-day','2026-10-01')];
 instant='2026-10-01T00:00:01+09:00';listeners.pageshow();await flush();
 assert.equal(root.dataset.day,'2026-10-01');assert(root.innerHTML.includes('new-day'));assert(!root.innerHTML.includes('yesterday'));
 fail=true;instant='2026-10-01T00:06:00+09:00';tick();await flush();assert(root.innerHTML.includes('new-day'),'Failed fetch preserves last valid data');
 fail=false;response={invalid:true};instant='2026-10-01T00:12:00+09:00';tick();await flush();assert(root.innerHTML.includes('new-day'),'Malformed response preserves last valid data');
 response=[];instant='2026-10-01T00:18:00+09:00';tick();await flush();assert(root.innerHTML.includes('새로운 만남을 기다리고'),'Empty valid archive clears removed records');
 document.visibilityState='hidden';instant='2026-10-01T00:24:00+09:00';const previous=calls;tick();await flush();assert.equal(calls,previous);
 console.log('PASS: HOME live archive refresh, KST midnight, offline/malformed fallback, removals and hidden-tab throttling.');
}
run().catch(error=>{console.error(error);process.exitCode=1;});
