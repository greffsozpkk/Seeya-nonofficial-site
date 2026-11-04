'use strict';
const assert=require('node:assert/strict');
const init=require('../src/client/my-concert-playback');
const Show=require('../src/shared/my-concert-show');
const {songs}=require('../game/my-concert/catalog.json');
const events={}, nodes=new Map(), loads=[];
function el(id){if(!nodes.has(id))nodes.set(id,{events:{},attrs:{},focus(){},replaceChildren(){},setAttribute(k,v){this.attrs[k]=v;},addEventListener(k,fn){this.events[k]=fn;}});return nodes.get(id);}
const root={addEventListener(type,fn){events[type]=fn;}};
let mock;
class Player{
 constructor(frame,options){mock=this;this.events=options.events;this.id='';this.state=-1;}
 loadVideoById(id){this.id=id;this.time=0;this.duration=180;loads.push(id);}
 getVideoData(){return{video_id:this.id};}
 getPlayerState(){return this.state;}
 playVideo(){this.send(1);}
 pauseVideo(){this.send(2);}
 getCurrentTime(){return this.time;}
 getDuration(){return this.duration;}
 seekTo(time){this.time=time;this.seeks=(this.seeks||[]).concat(time);}
 destroy(){this.destroyed=true;}
 send(state){this.state=state;this.events.onStateChange({target:this,data:state});}
 error(code){this.events.onError({target:this,data:code});}
}
global.window={YT:{Player},addEventListener(type,fn){events[type]=fn;}};
Object.defineProperty(global,'navigator',{value:{onLine:true},configurable:true});
global.document={createElement:()=>({})};
global.location={origin:'https://example.com'};
const ids=Object.keys(Show.media.performances);
const song='group-track-001';
const broadcasts=Show.performanceVideos(song);
assert.deepEqual(broadcasts.map(v=>v.videoId),['I6yE2PFlSaU','L0plLJw2v-I','nn639JifcBQ']);
assert(broadcasts.every(v=>v.kind==='broadcast'));
const fallbackProbe={kind:'tour',videoId:'-X63BGTttGM'};
Show.media.performances.probe=[fallbackProbe,{kind:'stage',videoId:'unreviewed'}];
assert.deepEqual(Show.performanceVideos('probe'),[]);
delete Show.media.performances.probe;
assert.deepEqual(ids.filter(id=>Show.performanceVideos(id).some(v=>v.kind==='tour')).sort(),
 ['group-track-022','group-track-058','group-track-060','group-track-062','group-track-063','group-track-064']);
const next=ids.find(k=>k!==song);
const show={title:'concert',sections:{opening:[song],main:[next],encore:[]},vcrs:[]};
const click=watch=>events.click({target:{closest:()=>({dataset:{watch}})}});
const flush=()=>new Promise(resolve=>setImmediate(resolve));
let tick=null;
global.setInterval=fn=>{tick=fn;return 1;};global.clearInterval=()=>{tick=null;};
(async()=>{
 init({root,$:el,esc:String,getShow:()=>show,getSongs:()=>songs,edit(){}});
 click('start');await flush();mock.events.onReady({target:mock});
 const first=mock.id;mock.events.onAutoplayBlocked();assert.match(el('mcPlayStatus').textContent,/재생 버튼/);
 assert.equal(mock.id,first);click('resume');mock.send(2);assert.match(el('mcPlayStatus').textContent,/일시정지/);
 assert.equal(el('mcToggle').attrs['aria-label'],'재생');click('toggle');assert.equal(mock.state,1);assert.equal(el('mcToggle').attrs['aria-label'],'일시정지');click('toggle');assert.equal(mock.state,2);
 mock.time=8;click('back15');assert.equal(mock.time,0);click('forward15');assert.equal(mock.time,15);
 mock.time=175;click('forward15');assert.equal(mock.time,180);
 mock.duration=3741;mock.time=80;tick();assert.equal(el('mcElapsed').textContent,'1:20');assert.equal(el('mcDuration').textContent,'1:02:21');
 el('mcSeek').value='100';el('mcSeek').events.input();mock.time=81;tick();assert.equal(el('mcSeek').value,'100');assert.equal(el('mcElapsed').textContent,'1:40');el('mcSeek').events.change();assert.equal(mock.time,100);assert.equal(mock.state,2);
 mock.error(101);assert.notEqual(mock.id,first);assert.equal(el('mcNow').textContent,'오프닝 · 1 / 2곡');
 assert.equal(el('mcSeek').disabled,true);assert.equal(el('mcElapsed').textContent,'0:00');assert.equal(el('mcDuration').textContent,'--:--');click('forward15');assert.equal(mock.time,0);
 mock.send(1);mock.send(0);assert.equal(el('mcNow').textContent,'본 무대 · 2 / 2곡');
 mock.send(0);assert.equal(el('mcNow').textContent,'본 무대 · 2 / 2곡');
 events.offline();assert(mock.destroyed);assert.match(el('mcPlayStatus').textContent,/연결을 확인/);
 assert.equal(tick,null);assert.equal(el('mcToggle').disabled,true);assert.equal(el('mcRetry').hidden,false);
 click('resume');await flush();mock.events.onReady({target:mock});assert.equal(mock.id,Show.media.performances[next][0].videoId);
 mock.send(1);mock.send(0);assert(mock.destroyed);assert.match(el('mcPlayStatus').textContent,/마쳤어요|모두 감상/);
 click('same');await flush();mock.events.onReady({target:mock});assert.equal(mock.id,first);
 for(const v of broadcasts){assert.equal(mock.id,v.videoId);mock.error(100);}
 assert.equal(mock.id,Show.media.performances[next][0].videoId);assert.match(el('mcQueue').innerHTML,/재생 제한/);
 click('poster');assert(mock.destroyed);assert.equal(el('mcResult').hidden,false);
 assert.equal(tick,null);assert.equal(el('mcSeek').disabled,true);
 console.log('PASS concert playback: blocked, pause, resume, alternatives, end, duplicate end, offline retry, exhaustion, restart and teardown.');
})().catch(e=>{console.error(e);process.exitCode=1;});
