'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const root=path.resolve(__dirname,'..'),read=p=>fs.readFileSync(path.join(root,p),'utf8');
const {resolveRadio,filterRadio,videoId,paginateRadio,pagination,PAGE_SIZE,cards,selection}=require('../src/shared/radio');
const reviews=require('../src/data/radio-pilot.json'),rows=JSON.parse(read('data/archive.json'));
const current=resolveRadio(rows,reviews,'2026-10-02');
assert(current.length>9&&current.length<=reviews.length);assert(new Set(current.map(r=>r.videoId)).size===current.length);
const seed={id:'fixture',date:'2026-09-30',type:'radio',title:'방송',members:['이보람'],source:{label:'공식',url:'https://youtube.com/watch?v=trvkTPhlNFc'}};
const review={...reviews.find(r=>r.youtubeId==='trvkTPhlNFc'),recordId:'fixture'};
for(const patch of [{hidden:true},{status:'scheduled'},{eventState:'cancelled'},{date:'2026-10-03'},{type:'article'},{source:{url:'https://example.com'}}])assert.equal(resolveRadio([{...seed,...patch}],[review],'2026-10-02').length,0);
assert.equal(resolveRadio([seed],[{...review,channelStatus:'unchecked'}],'2026-10-02').length,0);
assert.equal(resolveRadio([seed],[review,review],'2026-10-02').length,1);
const fan=resolveRadio([{...seed,dateBasis:'video-published'}],[{...review,channelStatus:'fan-channel-checked'}],'2026-10-02')[0];
assert(fan);assert(cards([fan],fan.id).includes('팬 보관 영상'));assert(selection(fan).includes('영상 게시일'));
assert(selection({...fan,dateBasis:'broadcast',dateStatus:'tentative'}).includes('방송일 · 잠정'));
const twoSources={...seed,additionalSources:[{url:'https://youtube.com/watch?v=rWE6SSVs3BA'}]};
assert.equal(resolveRadio([twoSources],[review,{...review,youtubeId:'rWE6SSVs3BA'}],'2026-10-02').length,1,'One representative video per archive record');
assert(current.some(r=>r.date.startsWith('2006-'))&&current.some(r=>r.date.startsWith('2025-')),'Older broadcasts must reach the public list');
assert(current.some(r=>r.channelStatus==='fan-channel-checked'));
assert.equal(new Set(current.map(r=>r.id)).size,current.length);
assert.equal(resolveRadio([{...seed,title:'관리자 변경'}],[review],'2026-10-02')[0].title,'관리자 변경');
assert.equal(videoId('https://youtube.com.evil.test/watch?v=trvkTPhlNFc'),'');
const testRows=[{id:'a',date:'2026-09-30',title:'첫 방송',program:'BTN',members:['이보람'],videoId:'trvkTPhlNFc',kind:'replay',channel:'BTN',source:'BTN'}, {id:'b',date:'2026-09-17',title:'다음 방송',program:'SBS',members:['남규리','김연지'],videoId:'rWE6SSVs3BA',kind:'full',channel:'SBS',source:'SBS'}];
assert.equal(filterRadio(testRows,{member:'씨야'}).length,0);assert.equal(filterRadio(testRows,{member:'남규리'})[0].id,'b');assert.equal(filterRadio(testRows,{query:'btn'})[0].id,'a');assert.equal(filterRadio(testRows,{sort:'oldest'})[0].id,'b');

let writes=0,cues=0,pauses=0,plays=0,interval,options;
const nodes={};function element(){return {handlers:{},dataset:{},textContent:'',value:'',innerHTML:'',disabled:true,checked:false,addEventListener(type,fn){this.handlers[type]=fn;},setAttribute(){},scrollIntoView(){},focus(){}};}
for(const id of ['radioContinuous','radioNext','radioData','radioPlayer','radioList','radioSearch','radioSort','radioCount','radioCurrent','radioSelectionStatus','radioSeek','radioPlay','radioSpeed','radioSave','radioBack','radioForward','radioRestart','radioSavedOnly','radioOriginal','radioArchive','radioBottomTitle','radioBottomStatus','radioElapsed','radioDuration','radioToPlayer','radioPagination'])nodes[id]=element();
nodes.radioData.textContent=JSON.stringify(testRows);Object.defineProperty(nodes.radioPlayer,'src',{set(){writes++;}});
const members=['전체','씨야','남규리','김연지','이보람'].map(m=>({...element(),dataset:{radioMember:m}}));
let currentVideo=testRows[0].videoId,time=100,playerState=2,rate=1,persisted='';
const fake={getVideoData:()=>({video_id:currentVideo}),getCurrentTime:()=>time,getDuration:()=>200,getPlayerState:()=>playerState,getAvailablePlaybackRates:()=>[.5,1,1.5,2],getPlaybackRate:()=>rate,setPlaybackRate:n=>rate=n,playVideo(){plays++;playerState=1;},pauseVideo(){pauses++;playerState=2;},seekTo(n){time=n;},cueVideoById({videoId,startSeconds}){cues++;currentVideo=videoId;time=startSeconds;playerState=5;}};
const document={hidden:false,getElementById:id=>nodes[id],querySelectorAll:()=>members,querySelector:()=>element(),addEventListener(){},head:{appendChild(){}},createElement:()=>element()};
const window={YT:{Player:function(id,config){options=config;return fake;}},addEventListener(){}};
const context={require:()=>require('../src/shared/radio'),document,window,location:{origin:'http://localhost:8000'},URL,URLSearchParams,localStorage:{getItem:()=>null,setItem:(k,v)=>persisted=v},setTimeout:()=>1,clearTimeout(){},setInterval:fn=>interval=fn};
vm.runInNewContext(read('src/client/radio.js'),{...context});assert.equal(writes,1);options.events.onReady({target:fake});
assert.equal(nodes.radioPlay.disabled,false);assert.equal(nodes.radioDuration.textContent,'3:20');
nodes.radioSearch.value='SBS';nodes.radioSearch.handlers.input();members[1].handlers.click();nodes.radioSort.value='oldest';nodes.radioSort.handlers.change();assert.equal(writes,1);assert.equal(cues,0);assert.equal(pauses,0,'Filters must not pause/reload player');
nodes.radioPlay.handlers.click();assert.equal(plays,1);interval();assert.equal(nodes.radioElapsed.textContent,'1:40');nodes.radioPlay.handlers.click();assert.equal(pauses,1);
nodes.radioForward.handlers.click();assert.equal(time,115);nodes.radioBack.handlers.click();assert.equal(time,100);nodes.radioSeek.value='999';nodes.radioSeek.handlers.change();assert.equal(time,200);nodes.radioRestart.handlers.click();assert.equal(time,0);
nodes.radioSpeed.value='1.5';nodes.radioSpeed.handlers.change();assert.equal(rate,1.5);
nodes.radioSave.handlers.click();assert.deepEqual(JSON.parse(persisted).saved,['a']);nodes.radioSavedOnly.checked=true;nodes.radioSavedOnly.handlers.change();
const select=id=>nodes.radioList.handlers.click({target:{closest:()=>({dataset:{radioId:id}})}});
select('a');assert.equal(cues,0);select('b');assert.equal(cues,1);assert.equal(writes,1,'One persistent iframe');select('b');select('invalid');assert.equal(cues,1);assert(nodes.radioCurrent.innerHTML.includes('다음 방송'));
options.events.onError();assert.equal(nodes.radioPlay.disabled,true);assert(nodes.radioSelectionStatus.textContent.includes('YouTube'));assert(nodes.radioOriginal.href.includes('rWE6SSVs3BA'));select('a');assert.equal(nodes.radioPlay.disabled,false);
playerState=0;options.events.onStateChange({data:0});assert.equal(plays,1,'No automatic next playback');assert.equal(JSON.parse(persisted).positions.a.time,0);
// Denied or corrupt storage must never prevent the player from connecting.
context.localStorage={getItem(){throw Error('blocked');},setItem(){throw Error('blocked');}};vm.runInNewContext(read('src/client/radio.js'),{...context});nodes.radioSave.handlers.click();assert(nodes.radioSelectionStatus.textContent.includes('이번 화면'));
context.localStorage={getItem:()=>'{invalid',setItem(){}};vm.runInNewContext(read('src/client/radio.js'),{...context});
const html=read('radio/index.html');assert.equal((html.match(/<iframe /g)||[]).length,1);assert(html.includes('referrerpolicy="strict-origin-when-cross-origin"'));assert(!html.includes('autoplay=1'));assert(!html.includes('noindex,follow'));assert(read('radio/test/index.html').includes('noindex,follow'));assert(read('sitemap.xml').includes('<loc>https://seeya-fanpage.com/radio/</loc>'));assert(!read('sitemap.xml').includes('/radio/test/'));assert(read('about/install/index.html').includes('/radio/'));assert(read('src/client/radio.js').includes('loadVideoById'));assert(html.includes('id="radioContinuous"'));
if(current.length)assert(html.includes('enablejsapi=1'));
console.log('PASS radio: archive joins, single iframe, filter continuity, transport, favorites/storage fallback, error recovery, no automatic next playback.');

const many=Array.from({length:25},(_,i)=>({...testRows[0],id:'row'+i}));
assert.equal(PAGE_SIZE,9);assert.equal(paginateRadio(many,1).items.length,9);assert.equal(paginateRadio(many,2).items[0].id,'row9');assert.equal(paginateRadio(many,99).items.length,7);assert.equal(paginateRadio([],5).page,1);assert.equal(pagination(1,1),'');assert(pagination(2,3).includes('aria-current="page"'));
// Paging changes only library rows, never transport or iframe.
context.localStorage={getItem:()=>null,setItem(){}};nodes.radioData.textContent=JSON.stringify(many);nodes.radioSavedOnly.checked=false;currentVideo=many[0].videoId;
vm.runInNewContext(read('src/client/radio.js'),{...context});options.events.onReady({target:fake});
const oldWrites=writes,oldCues=cues,oldPauses=pauses;
nodes.radioPagination.handlers.click({target:{closest:()=>({dataset:{radioPage:'2'}})}});
assert(nodes.radioCount.textContent.includes('2 / 3'));assert(nodes.radioList.innerHTML.includes('data-radio-id="row17"'));assert.equal(writes,oldWrites);assert.equal(cues,oldCues);assert.equal(pauses,oldPauses);
nodes.radioSearch.value='없는 방송';nodes.radioSearch.handlers.input();assert(nodes.radioCount.textContent.includes('0개 · 1 / 1'));assert.equal(nodes.radioPagination.innerHTML,'');
nodes.radioSearch.value='';nodes.radioSearch.handlers.input();assert(nodes.radioCount.textContent.includes('1 / 3'));
assert.equal((html.match(/class="radio-item /g)||[]).length,9);
assert(read('index.html').includes('class="home-radio"'));
for(const path of ['index.html','music/index.html','members/index.html'])assert.equal((read(path).match(/href="\/radio\/">RADIO<\/a>/g)||[]).length,2);
console.log('PASS radio public route/home/navigation, 9-item paging, boundaries/filter reset and uninterrupted player.');



// Realistic event sequencing: queue boundaries, skipped failures, and blocked autoplay.
const queued=Array.from({length:12},(_,i)=>({...testRows[0],id:'queue'+i,videoId:'testvideo'+String(i).padStart(2,'0'),date:'2020-01-'+String(i+1).padStart(2,'0'),title:'방송 '+i}));
let loads=[],timerId=0;const timers=new Map();
fake.loadVideoById=({videoId,startSeconds})=>{loads.push({videoId,startSeconds});currentVideo=videoId;time=startSeconds;playerState=3;};
context.setTimeout=fn=>{const id=++timerId;timers.set(id,fn);return id;};context.clearTimeout=id=>timers.delete(id);
function bootQueue(){
 timers.clear();loads=[];nodes.radioData.textContent=JSON.stringify(queued);nodes.radioSavedOnly.checked=false;nodes.radioSearch.value='';nodes.radioSort.value='newest';context.localStorage={getItem:()=>null,setItem(){}};
 currentVideo=queued[0].videoId;playerState=2;time=0;vm.runInNewContext(read('src/client/radio.js'),{...context});options.events.onReady({target:fake});
}
function enable(){nodes.radioContinuous.checked=true;nodes.radioContinuous.handlers.change();}
function playing(){playerState=1;options.events.onStateChange({data:1});}
function ended(){playerState=0;options.events.onStateChange({data:0});}
function drain(){const jobs=[...timers.values()];timers.clear();jobs.forEach(fn=>fn());}
bootQueue();assert.equal(nodes.radioContinuous.checked,false);enable();assert.equal(loads.length,0,'Enabling does not start playback');
nodes.radioSort.value='oldest';nodes.radioSort.handlers.change();select('queue8');playing();ended();
assert.equal(loads.length,1);assert.equal(loads[0].videoId,queued[9].videoId);assert.equal(loads[0].startSeconds,0);assert(nodes.radioCount.textContent.includes('2 / 2'),'Advance crosses page boundary');
options.events.onStateChange({data:0});assert.equal(loads.length,1,'Ignore duplicate ended while next video loads');
playing();ended();assert.equal(loads.at(-1).videoId,queued[10].videoId);
options.events.onError({data:150});assert(nodes.radioSelectionStatus.textContent.includes('건너뛰고'));drain();assert.equal(loads.at(-1).videoId,queued[11].videoId);
playing();ended();const count=loads.length;assert(nodes.radioSelectionStatus.textContent.includes('마쳤습니다'));ended();assert.equal(loads.length,count,'No wrapping or endless retry');
bootQueue();nodes.radioSort.value='oldest';nodes.radioSort.handlers.change();enable();playing();ended();options.events.onError({data:100});nodes.radioContinuous.checked=false;nodes.radioContinuous.handlers.change();drain();assert.equal(loads.length,1,'Turning off cancels pending skip');
bootQueue();nodes.radioSort.value='oldest';nodes.radioSort.handlers.change();enable();playing();ended();options.events.onAutoplayBlocked();ended();assert.equal(loads.length,1,'Blocked autoplay does not skip remaining queue');playing();ended();assert.equal(loads.length,2,'User resume restores opt-in continuation');
bootQueue();enable();playing();nodes.radioSearch.value='방송 11';nodes.radioSearch.handlers.input();ended();assert.equal(loads.length,0,'Do not jump when current item is filtered out');
bootQueue();nodes.radioSort.value='oldest';nodes.radioSort.handlers.change();enable();playing();options.events.onError({data:153});drain();assert.equal(loads.length,0,'Global player configuration errors do not drain queue');
bootQueue();nodes.radioSort.value='oldest';nodes.radioSort.handlers.change();enable();playing();ended();options.events.onError({data:101});select('queue5');drain();assert.equal(loads.length,1,'Manual selection cancels delayed skip');
bootQueue();select('queue11');enable();playing();ended();assert.equal(loads[0].videoId,queued[10].videoId,'Newest-first order honored');
bootQueue();nodes.radioSort.value='oldest';nodes.radioSort.handlers.change();nodes.radioSave.handlers.click();select('queue2');nodes.radioSave.handlers.click();select('queue0');nodes.radioSavedOnly.checked=true;nodes.radioSavedOnly.handlers.change();enable();playing();ended();assert.equal(loads[0].videoId,queued[2].videoId,'Saved-only queue honored');
console.log('PASS continuous radio: opt-in, queue ordering/filtering, page boundaries, zero start, errors/cancellation, blocked autoplay, final stop.');
