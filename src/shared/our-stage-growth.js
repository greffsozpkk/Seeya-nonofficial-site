'use strict';
// Opt-in test economy; original collection/story IDs and legacy save schema survive.
module.exports=function(B){
 const mini=require('./our-stage-puzzles')(B.mini),wordGates=require('./our-stage-word-gates');
 const test=B.timing.testMode,stats=['vocal','harmony','emotion'],names=['보컬','화음','감성'];
 const time=n=>Number.isSafeInteger(n)&&n>=0&&n<253402268399999;
 const integer=(n,max=1e9)=>Number.isSafeInteger(n)&&n>=0&&n<=max;
 const object=o=>o&&typeof o==='object'&&!Array.isArray(o);
 const exact=(o,keys)=>object(o)&&Object.keys(o).length===keys.length&&keys.every(k=>Object.hasOwn(o,k));
 const themes=['#241d42','#59354e','#34534f','#293d61','#47344d','#5b4637','#3d495e','#442b53'];
 // Eight real release chapters, not the four-album approximation in the review.
 const ranges=[[100,180,80,150,2,5,12],[190,300,160,260,5,20,45],[310,400,270,380,8,20,45],[410,520,390,550,10,45,90],[530,600,560,700,10,45,90],[610,730,710,900,12,45,90],[740,780,910,1100,15,90,180],[790,950,1110,1500,15,90,180]];
 const itemNames=['진주빛 풍선','첫 무대 데님 리본','화음 마이크','꽃잎 응원 카드','별빛 헤어핀','추억의 라디오','무대 뒤 응원 수건','재회의 세 줄 리본','우리의 응원봉 장식','피날레 골드 프레임'];
 const items=itemNames.map((name,i)=>({id:'keepsake-'+i,name,price:100+i*120,buff:.01,chapter:Math.min(7,Math.floor(i*.8)),shape:i%3,theme:themes[Math.min(7,Math.floor(i*.8))]}));
 const cost=l=>Math.floor(50*Math.pow(l,1.55));
 const value=l=>30+12*(l-1)+30*Math.floor(l/10);
 const spent=levels=>stats.reduce((sum,k)=>{for(let l=1;l<levels[k];l++)sum+=cost(l);return sum;},0);
 const seed=now=>({version:1,testGrant:0,levels:{vocal:1,harmony:1,emotion:1},stageEarned:0,offlineEarned:0,offlineUnits:0,records:{},items:[],booster:{day:B.kstDay(now),used:0,armed:false},representative:null,lastActiveAt:now,offlineReceipt:null,pending:null,sequence:0,receipts:{},nickname:'',lastResult:null});
 function init(s,now=Date.now()){if(!s.growth)s.growth=seed(now);mini.migrate(s.mini);if(s.chapterWords===undefined)s.chapterWords=[];return s;}
 const profile=id=>{const a=B.songAlbum(id);if(!a)return null;const ai=B.albums.indexOf(a),i=a.tracks.findIndex(t=>t.id===id),t=a.tracks[i],r=ranges[ai],ratio=i/Math.max(1,a.tracks.length-1);const tempo=/Hot Girl|그 놈 목소리|가니|그래도 좋아/i.test(t.title);return {album:a,track:t,chapter:ai,theme:themes[ai],target:Math.round(r[0]+(r[1]-r[0])*Math.pow(ratio,1.2)),reward:Math.round(r[2]+(r[3]-r[2])*ratio),ap:r[4],seconds:ai===0&&i<3?3:Math.round(r[5]+(r[6]-r[5])*ratio),weights:tempo?[1.4,1.1,.9]:[1,1.2,1.5],kind:tempo?'템포':'발라드',role:i===0?'첫 트랙':'수록 트랙'};};
 const cleared=(s,a)=>a.tracks.filter(t=>!t.instrumental).every(t=>s.growth?.records[t.id]?.wins>0);
 const cap=s=>100+20*B.albums.filter(a=>cleared(s,a)).length;
 const coins=s=>B.coins(s)+200+s.growth.testGrant+s.growth.stageEarned+s.growth.offlineEarned-spent(s.growth.levels)-s.growth.items.reduce((n,id)=>n+items.find(i=>i.id===id).price,0);
 const buff=s=>s.growth.items.reduce((n,id)=>n+items.find(i=>i.id===id).buff,0);
 const score=(s,id,condition=1)=>Math.round(profile(id).weights.reduce((n,w,i)=>n+w*value(s.growth.levels[stats[i]]),0)*(1+buff(s))*condition);
 const rank=(score,target)=>score>=Math.ceil(target*125/100)?'PERFECT':score>=Math.ceil(target*110/100)?'S':score>=target?'A':'RETRY';
 const apCost=(s,id)=>profile(id).ap;
 const recoveryMs=test?1000:30000;
 function recover(s,now){if(now<s.energyAt)return;const maximum=cap(s);if(s.points>=maximum){s.points=maximum;s.energyAt=now;return;}const n=Math.floor((now-s.energyAt)/recoveryMs);s.points=Math.min(maximum,s.points+n);s.energyAt=s.points===maximum?now:s.energyAt+n*recoveryMs;}
 const trainingSeconds=(s,id)=>test?1:Math.max(1,profile(id).seconds-(s.growth.booster.armed?1:0));
 function start(s,job,at){const ap=apCost(s,job.track);if(s.points<ap)return false;if(s.points===cap(s))s.energyAt=at;s.points-=ap;s.active={...job,end:at+trainingSeconds(s,job.track)*1000};return true;}
 function train(s,id,lesson,now=Date.now()){init(s,now);if(!B.ids.includes(id)||!B.open(s,id)||![0,1,2].includes(lesson)||s.tracks[id].includes(lesson)||s.queue||s.active?.track===id&&s.active.lesson===lesson)return false;if(s.active){s.queue={track:id,lesson};return true;}return start(s,{track:id,lesson},now);}
 function refreshBooster(s,now){const b=s.growth.booster,day=B.kstDay(now);if(day>b.day)s.growth.booster={day,used:0,armed:false};}
 function settle(s,now=Date.now()){
  init(s,now);refreshBooster(s,now);let done=0;
  if(s.shopJob&&s.shopJob.end<=now){if(s.shopJob.kind==='setup')s.gigs++;else s.jobCounts[s.shopJob.kind]++;s.shopJob=null;done++;}
  while(s.active&&s.active.end<=now){const j=s.active;s.active=null;if(!s.tracks[j.track].includes(j.lesson))s.tracks[j.track].push(j.lesson);if(B.ready(s,j.track)&&!s.setlist.includes(j.track))s.setlist.push(j.track);done++;recover(s,j.end);if(s.queue&&start(s,s.queue,j.end))s.queue=null;}
  if(!s.active&&s.queue){const needed=Math.max(0,apCost(s,s.queue.track)-s.points),at=s.energyAt+needed*recoveryMs;if(at<=now){recover(s,at);if(start(s,s.queue,at)){s.queue=null;done+=settle(s,now);}}}
  recover(s,now);
  const g=s.growth,p=g.pending;
  if(p&&p.end<=now){const r=g.records[p.track]||{plays:0,wins:0,best:0,rank:'RETRY',mastery:0};r.plays++;if(p.rank!=='RETRY'){r.wins++;r.mastery++;}r.best=Math.max(r.best,p.score);r.rank=rank(r.best,profile(p.track).target);g.records[p.track]=r;g.stageEarned+=p.reward;g.lastResult={...p};g.pending=null;done++;for(const a of B.albums)if(cleared(s,a)&&!g.receipts[a.id])g.receipts[a.id]={at:p.end,serial:'OS-'+a.id+'-'+p.serial};}
  return done;
 }
 function perform(s,id,now=Date.now(),random=Math.random){init(s,now);settle(s,now);const p=profile(id),g=s.growth;if(!p||p.track.instrumental||!B.ready(s,id)||g.pending||s.points<p.ap||g.sequence>=1e6)return false;const v=score(s,id,.95+.1*Math.max(0,Math.min(1,random()))),r=rank(v,p.target),boost=g.booster.armed;s.points-=p.ap;g.booster.armed=false;g.sequence++;g.pending={track:id,score:v,rank:r,reward:r==='RETRY'?0:Math.floor(p.reward*(boost?1.5:1)),end:now+(test?1:Math.min(12,3+p.chapter))*1000,serial:g.sequence,boost};return true;}
 function upgrade(s,k){if(!stats.includes(k)||s.growth.levels[k]>=500||coins(s)<cost(s.growth.levels[k]))return false;s.growth.levels[k]++;return true;}
 function buy(s,id){const i=items.find(x=>x.id===id);if(!i||s.growth.items.includes(id)||!B.albumUnlocked(s,B.albums[i.chapter].id)||coins(s)<i.price)return false;s.growth.items.push(id);return true;}
 function boost(s,now=Date.now()){refreshBooster(s,now);const b=s.growth.booster;if(b.day>B.kstDay(now)||b.used>=3||b.armed)return false;b.used++;b.armed=true;return true;}
 function resume(s,now=Date.now()){
  init(s,now);const g=s.growth;if(now<g.lastActiveAt)return 0;const seconds=Math.min(21600,Math.max(0,Math.floor((now-g.lastActiveAt)/1000))),units=Math.floor(seconds/60),p=profile(g.representative);let reward=0;
  if(p&&units&&g.records[p.track.id]?.wins){reward=units*Math.max(1,Math.floor(p.reward/100));g.offlineEarned+=reward;g.offlineUnits+=units;g.records[p.track.id].mastery+=units;g.offlineReceipt={at:now,seconds:units*60,reward};}
  g.lastActiveAt=now;return reward;
 }
 function validate(s){try{
  if(!Array.isArray(s.chapterWords)||new Set(s.chapterWords).size!==s.chapterWords.length||!s.chapterWords.every(id=>wordGates.some(q=>q.album===id)))return false;
  const g=s.growth;if(!exact(g,Object.keys(seed(0)))||g.version!==1||!integer(g.testGrant,1000000)||(!test&&g.testGrant!==0)||!exact(g.levels,stats)||!stats.every(k=>integer(g.levels[k],500)&&g.levels[k]>=1)||!integer(g.stageEarned)||!integer(g.offlineEarned)||!integer(g.offlineUnits,1e7)||!integer(g.sequence,1e6)||!time(g.lastActiveAt))return false;
  if(!object(g.records)||!Object.entries(g.records).every(([id,r])=>B.ids.includes(id)&&B.ready(s,id)&&!profile(id).track.instrumental&&exact(r,['plays','wins','best','rank','mastery'])&&integer(r.plays,1e6)&&integer(r.wins,r.plays)&&integer(r.best,1e6)&&r.rank===rank(r.best,profile(id).target)&&integer(r.mastery,1e8)&&r.mastery>=r.wins&&r.mastery<=r.wins+g.offlineUnits&&Boolean(r.wins)===(r.best>=profile(id).target)))return false;
  if(Object.values(g.records).reduce((n,r)=>n+r.mastery-r.wins,0)!==g.offlineUnits)return false;
  const plays=Object.values(g.records).reduce((n,r)=>n+r.plays,0);if(plays+(g.pending?1:0)!==g.sequence||g.stageEarned>Object.entries(g.records).reduce((n,[id,r])=>n+r.wins*Math.floor(profile(id).reward*1.5),0)||g.offlineEarned>g.offlineUnits*15)return false;
  if(!Array.isArray(g.items)||new Set(g.items).size!==g.items.length||!g.items.every(id=>items.some(i=>i.id===id&&B.albumUnlocked(s,B.albums[i.chapter].id))))return false;
  const b=g.booster;if(!exact(b,['day','used','armed'])||!/^\d{4}-\d{2}-\d{2}$/.test(b.day)||B.kstDay(Date.parse(b.day+'T00:00:00+09:00'))!==b.day||!integer(b.used,3)||typeof b.armed!=='boolean'||b.armed&&!b.used)return false;
  if(g.representative!==null&&!g.records[g.representative]?.wins)return false;
  const result=p=>exact(p,['track','score','rank','reward','end','serial','boost'])&&B.ids.includes(p.track)&&B.ready(s,p.track)&&!profile(p.track).track.instrumental&&integer(p.score,1e6)&&p.rank===rank(p.score,profile(p.track).target)&&p.reward===(p.rank==='RETRY'?0:Math.floor(profile(p.track).reward*(p.boost?1.5:1)))&&time(p.end)&&integer(p.serial,g.sequence)&&p.serial>0&&typeof p.boost==='boolean';
  if(g.pending!==null&&(!result(g.pending)||g.pending.serial!==g.sequence)||g.lastResult!==null&&!result(g.lastResult))return false;
  if(!B.albums.every(a=>!cleared(s,a)||Object.hasOwn(g.receipts,a.id)))return false;
  if(!object(g.receipts)||!Object.entries(g.receipts).every(([id,r])=>B.albums.some(a=>a.id===id&&cleared(s,a))&&exact(r,['at','serial'])&&time(r.at)&&typeof r.serial==='string'&&new RegExp('^OS-'+id+'-[1-9][0-9]{0,6}$').test(r.serial)))return false;
  if(g.offlineReceipt!==null&&(!exact(g.offlineReceipt,['at','seconds','reward'])||!time(g.offlineReceipt.at)||!integer(g.offlineReceipt.seconds,21600)||!integer(g.offlineReceipt.reward,5400)))return false;
  if(typeof g.nickname!=='string'||g.nickname.length>24||!integer(s.points,cap(s))||coins(s)<0)return false;
  // Validate all legacy collection fields without interpreting the new AP cap as corruption.
  return B.valid(s,{maxPoints:cap(s),balance:coins(s),miniValid:mini.valid});
 }catch{return false;}}
 function loadSave(raw){if(typeof raw!=='string'||raw.length>256000)throw Error('Invalid stage save');const parsed=JSON.parse(raw);let s;if(parsed?.growth!==undefined){s=init(parsed);if(!validate(s))throw Error('Invalid growth save');}else{s=init(B.loadSave(raw));}return s;}
 function prepareTest(s,id){if(!test)return false;const a=B.albumById(id);if(!a)return false;const p=profile(a.tracks.filter(t=>!t.instrumental).at(-1).id);while(score(s,p.track.id,.95)<p.target)stats.forEach(k=>s.growth.levels[k]++);s.growth.testGrant=spent(s.growth.levels);return true;}
 const albumRequirements=(s,id)=>{const req=B.albumRequirements(s,id),i=B.albums.findIndex(a=>a.id===id);if(i>0&&!B.albumUnlocked(s,id))req.push({label:B.albums[i-1].name+' 보컬 무대 모두 A 이상',done:cleared(s,B.albums[i-1]),action:'growth-album',value:B.albums[i-1].id});if(i>0&&!B.albumUnlocked(s,id)&&wordGates.some(q=>q.album===id))req.push({label:'대표곡 가사 블록 완성',done:s.chapterWords.includes(id),action:'chapter-words',value:id});return req;};
 const albumAvailable=(s,id)=>B.albumAvailable(s,id)&&albumRequirements(s,id).every(r=>r.done);
 const wordAvailable=(s,id)=>wordGates.some(q=>q.album===id)&&!B.albumUnlocked(s,id)&&!s.chapterWords.includes(id)&&albumRequirements(s,id).filter(r=>r.action!=='chapter-words').every(r=>r.done);
 function answerWords(s,id,guess){const q=wordGates.find(q=>q.album===id);if(!q||!wordAvailable(s,id)||!Array.isArray(guess)||guess.length!==q.tokens.length||new Set(guess).size!==guess.length||!guess.every((n,i)=>Number.isInteger(n)&&q.tokens[n]===q.tokens[i]))return false;s.chapterWords.push(id);return true;}
 function unlockAlbum(s,id){return albumAvailable(s,id)&&B.unlockAlbum(s,id);}
 function purchase(s,id,member){const o=B.shopById(id);if(!o||!B.memberIds.includes(member)||s.purchases.includes(id+':'+member)||coins(s)<o.price)return false;s.purchases.push(id+':'+member);return true;}
 return {...B,mini,wordGates,wordAvailable,answerWords,growth:{stats,names,items,themes,ranges,prepareTest,cost,value,profile,cap,coins,buff,score,rank,cleared,trainingSeconds,apCost,perform,upgrade,buy,boost,resume,init},timing:{...B.timing,recoveryMs},fresh:now=>init(B.fresh(now),now),loadSave,valid:validate,train,settle,coins,purchase,albumRequirements,albumAvailable,unlockAlbum};
};
