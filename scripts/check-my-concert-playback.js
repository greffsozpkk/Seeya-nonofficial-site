'use strict';
const assert=require('node:assert/strict');
const init=require('../src/client/my-concert-playback');
const Show=require('../src/shared/my-concert-show');
const {songs}=require('../game/my-concert/catalog.json');
const events={}, nodes=new Map(), loads=[];
function el(id){if(!nodes.has(id))nodes.set(id,{focus(){},replaceChildren(){}});return nodes.get(id);}
const root={addEventListener(type,fn){events[type]=fn;}};
let mock;
class Player{
 constructor(frame,options){mock=this;this.events=options.events;this.id='';this.state=-1;}
 loadVideoById(id){this.id=id;loads.push(id);}
 getVideoData(){return{video_id:this.id};}
 getPlayerState(){return this.state;}
 playVideo(){this.send(1);}
 destroy(){this.destroyed=true;}
 send(state){this.state=state;this.events.onStateChange({target:this,data:state});}
 error(code){this.events.onError({target:this,data:code});}
}
global.window={YT:{Player},addEventListener(type,fn){events[type]=fn;}};
Object.defineProperty(global,'navigator',{value:{onLine:true},configurable:true});
global.document={createElement:()=>({})};
global.location={origin:'https://example.com'};
const ids=Object.keys(Show.media.performances);
const song=ids.find(k=>Show.media.performances[k].length>1);
const next=ids.find(k=>k!==song);
const show={title:'concert',sections:{opening:[song],main:[next],encore:[]},vcrs:[]};
const click=watch=>events.click({target:{closest:()=>({dataset:{watch}})}});
const flush=()=>new Promise(resolve=>setImmediate(resolve));
(async()=>{
 init({root,$:el,esc:String,getShow:()=>show,getSongs:()=>songs,edit(){}});
 click('start');await flush();mock.events.onReady({target:mock});
 const first=mock.id;mock.events.onAutoplayBlocked();assert.match(el('mcPlayStatus').textContent,/재생 버튼/);
 assert.equal(mock.id,first);click('resume');mock.send(2);assert.match(el('mcPlayStatus').textContent,/일시정지/);
 mock.error(101);assert.notEqual(mock.id,first);assert.equal(el('mcNow').textContent,'오프닝 · 1 / 2곡');
 mock.send(1);mock.send(0);assert.equal(el('mcNow').textContent,'본 무대 · 2 / 2곡');
 mock.send(0);assert.equal(el('mcNow').textContent,'본 무대 · 2 / 2곡');
 events.offline();assert(mock.destroyed);assert.match(el('mcPlayStatus').textContent,/연결을 확인/);
 click('resume');await flush();mock.events.onReady({target:mock});assert.equal(mock.id,Show.media.performances[next][0].videoId);
 mock.send(1);mock.send(0);assert(mock.destroyed);assert.match(el('mcPlayStatus').textContent,/마쳤어요|모두 감상/);
 click('same');await flush();mock.events.onReady({target:mock});assert.equal(mock.id,first);
 for(const v of Show.media.performances[song])mock.error(100);
 assert.equal(mock.id,Show.media.performances[next][0].videoId);assert.match(el('mcQueue').innerHTML,/재생 제한/);
 click('poster');assert(mock.destroyed);assert.equal(el('mcResult').hidden,false);
 console.log('PASS concert playback: blocked, pause, resume, alternatives, end, duplicate end, offline retry, exhaustion, restart and teardown.');
})().catch(e=>{console.error(e);process.exitCode=1;});
