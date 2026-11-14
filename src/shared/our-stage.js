'use strict';
function createModel(testMode=false) {
  const timing={shopMs:testMode?1000:60000,recoveryMs:testMode?1000:60000,performanceMs:testMode?1000:3300,testMode};
  // Album order follows Melon 314286. Each condition uses permanent progress.
  const songs = [
    {id:'scent', title:'여인의 향기', hint:'연습실에 처음 들어오면 열려요.', unlocked:()=>true},
    {id:'shoes', title:'구두', hint:'첫 무대를 마치면 열려요.', unlocked:s=>has(s,'first')},
    {id:'because', title:'사랑하기 때문에 (Feat. SG워너비)', hint:'구두의 팀 호흡 연습을 마치면 열려요.', unlocked:s=>s.tracks.shoes.includes(1)},
    {id:'flower', title:'접시꽃', hint:'구두 준비도 100%를 달성하면 열려요.', unlocked:s=>ready(s,'shoes')},
    {id:'promise', title:'Promise U', hint:'앨범 퀴즈를 풀거나 1집 기록을 간직하면 열려요.', unlocked:s=>has(s,'album')},
    {id:'again', title:'처음부터 또다시', hint:'Promise U의 보컬 연습을 마치면 열려요.', unlocked:s=>s.tracks.promise.includes(0)},
    {id:'guilty', title:'유죄', hint:'처음부터 또다시를 한 번 연습하면 열려요.', unlocked:s=>has(s,'yj')||s.tracks.again.length>0},
    {id:'parting', title:'이별 해보기', hint:'유죄를 한 번 연습하면 열려요.', unlocked:s=>has(s,'gr')||s.tracks.guilty.length>0},
    {id:'tears', title:'Tears And Fears', hint:'이별 해보기를 한 번 연습하면 열려요.', unlocked:s=>has(s,'br')||s.tracks.parting.length>0},
    {id:'loved', title:'사랑했다면', hint:'Tears And Fears를 한 번 연습하면 열려요.', unlocked:s=>has(s,'reunion')||s.tracks.tears.length>0},
    {id:'just', title:'그냥', hint:'서로 다른 세 곡의 준비도를 100%로 만들면 열려요.', unlocked:s=>ids.filter(id=>id!=='just'&&ready(s,id)).length>=3},
    {id:'fault', title:'내 잘못입니다', hint:'그냥을 한 번 연습하면 열려요.', unlocked:s=>has(s,'ending')||s.tracks.just.length>0}
  ];
  const lessons = [
    {title:'보컬 연습', seconds:testMode?1:10, gain:30},
    {title:'팀 호흡 맞추기', seconds:testMode?1:12, gain:30},
    {title:'무대 동선 연습', seconds:testMode?1:15, gain:40}
  ];
  const members = [
    {id:'yj', name:'김연지', episode:'E04', title:'가면 너머의 목소리', date:'2018.09.07', fact:'김연지의 DMC 페스티벌 ‘복면가왕 더 위너’ 무대를 아카이브에서 만날 수 있어요.', url:'https://www.youtube.com/watch?v=VX4z0syPoWw'},
    {id:'gr', name:'남규리', episode:'E05', title:'카메라 앞에서', date:'2011.05.20', fact:'드라마 ‘49일’의 마지막 장면을 돌아보는 종영 보도에 남규리의 연기 기록이 남아 있어요.', url:'https://www.bntnews.co.kr/article/view/bnt201105200353'},
    {id:'br', name:'이보람', episode:'E06', title:'또 다른 하모니', date:'2022.07.16', fact:'이보람은 ‘놀면 뭐하니?’에서 가야G 멤버로 첫 쇼케이스 무대에 섰어요.', url:'https://www.youtube.com/watch?v=cojgPoISAf0'}
  ];
  const reunionUrl='https://tv.jtbc.co.kr/clip/pr10011122/pm10055652/vo10354827/view';

  const albums=require('../data/our-stage-albums.json');
  const albumById=id=>albums.find(a=>a.id===id);
  const storyEntries=require('../data/our-stage-stories.json');
  const storyById=id=>storyEntries.find(e=>e.id===id);
  const storyAvailable=(s,id)=>{const e=storyById(id);return Boolean(e&&albumUnlocked(s,e.album)&&albumCount(s,e.album)>=e.minTracks);};
  const storyDone=(s,id)=>Boolean(storyById(id)&&s.proofs.includes('story:'+id));
  const storyCondition=id=>{const e=storyById(id);return albumById(e.album).name+(e.minTracks?' · '+e.minTracks+'트랙 수집':' 해금');};
  const quizLevels=['','첫걸음','기억 넓히기','연결하기','비교하기','종합하기'];
  const songAlbum=id=>albums.find(a=>a.tracks.some(t=>t.id===id));
  const albumCount=(s,id)=>albumById(id)?.tracks.filter(t=>open(s,t.id)).length||0;
  const albumComplete=(s,id)=>Boolean(albumById(id)&&albumCount(s,id)===albumById(id).tracks.length);
  const albumMastered=(s,id)=>Boolean(albumById(id)&&albumById(id).tracks.every(t=>ready(s,t.id)));
  const albumUnlocked=(s,id)=>id==='first-mind'?has(s,'album'):s.albums.includes(id);
  const albumAvailable=(s,id)=>{const i=albums.findIndex(a=>a.id===id);return i>0&&!albumUnlocked(s,id)&&albumUnlocked(s,albums[i-1].id)&&albumComplete(s,albums[i-1].id);};
  function unlockAlbum(s,id){if(!albumAvailable(s,id))return false;s.albums.push(id);return true;}
  // Personal activities belong to the 2011–2022 interval, never the debut tutorial.
  const coreCondition=id=>({gr:'See You Again · 5트랙 수집',yj:'See You Again 9트랙 수집 + ‘카메라 앞에서’ 간직하기',reunion:'See You Again 12트랙 수집 + ‘가면 너머의 목소리’ 간직하기',br:'See You Again 전곡 수집 + ‘하나로 모인 기록’ 간직하기'}[id]||'');
  const coreAvailable=(s,id)=>{
    if(!albumUnlocked(s,'see-you-again'))return false;
    const n=albumCount(s,'see-you-again');
    return id==='gr'?n>=5:id==='yj'?n>=9&&has(s,'gr'):id==='reunion'?n>=12&&has(s,'yj')&&has(s,'gr'):id==='br'?n>=15&&has(s,'reunion'):false;
  };
  const finaleReady=s=>albumComplete(s,'first-again')&&albumById('first-again').tracks.filter(t=>!t.instrumental&&ready(s,t.id)).length>=2;
  function finishFinale(s){if(!finaleReady(s)||s.finale)return false;s.finale=true;return true;}
  function memberCards(s){
    const cards=[];
    for(const a of albums)for(const member of ['br','gr','yj'])cards.push({id:'album:'+a.id+':'+member,member,kind:'album',title:a.name,style:a.id,earned:albumUnlocked(s,a.id),hint:a.name+' 해금',note:a.id==='rebloom'?'현재 세 멤버 의상의 재해석 카드 · 실제 활동 멤버 구성과 다릅니다.':'앨범 의상 도트 카드'});
    for(const m of members)cards.push({id:'story:'+m.id,member:m.id,kind:'story',title:m.title,scene:{yj:3,gr:4,br:5}[m.id],earned:has(s,m.id),hint:coreCondition(m.id)+' 후 이야기 간직하기',note:m.date+' · 활동 이야기 카드'});
    for(const member of ['br','gr','yj']){
      cards.push({id:'reunion:'+member,member,kind:'story',title:'다시 같은 무대',style:'stage-sugarman',earned:has(s,'reunion'),hint:'2020년 재회 이야기 간직하기',note:'재회 기념 도트 카드'});
      cards.push({id:'finale:'+member,member,kind:'special',title:'우리의 빛, First, Again',style:'first-again',earned:s.finale,hint:'4집 전곡 수집 · 보컬곡 2곡 준비 · 4집 피날레 완료',note:'게임 속 콘서트 기념 카드'});
    }
    for(const id of ['event-bcm','event-kairos']){const e=storyById(id);cards.push({id:'event:'+id,member:'gr',kind:'story',title:e.title,image:e.image,earned:storyDone(s,id),hint:storyCondition(id)+' 후 이야기 간직하기',note:e.illustrationNote});}
    return cards;
  }
  const cardOwned=(s,id)=>memberCards(s).some(c=>c.id===id&&c.earned);
  const shop=require('../data/our-stage-shop.json');
  const memberIds=['br','gr','yj'];
  const shopById=id=>shop.find(o=>o.id===id);
  const defaultEquipment=()=>({br:'base',gr:'base',yj:'base'});
  const earnings=s=>({
    songs:Math.max(0,s.collected.length-1)*5,
    practice:ids.reduce((n,id)=>n+s.tracks[id].length,0)*2,
    stories:s.flags.length*5+storyEntries.filter(e=>storyDone(s,e.id)).length*8,
    jobs:s.gigs*10
  });
  const coins=s=>Object.values(earnings(s)).reduce((a,b)=>a+b,0)-s.purchases.reduce((n,p)=>n+(shopById(p.split(':')[0])?.price||0),0);
  const styleOwned=(s,id,member)=>memberIds.includes(member)&&(id==='base'||Boolean(albumById(id))&&albumUnlocked(s,id)||Boolean(shopById(id))&&s.purchases.includes(id+':'+member));
  function equipPart(s,member,part,id){if(!['clothes','hair'].includes(part)||!styleOwned(s,id,member))return false;(part==='hair'?s.hair:s.equipped)[member]=id;return true;}
  function equip(s,member,id){if(!styleOwned(s,id,member))return false;s.equipped[member]=id;s.hair[member]=id;return true;}
  function purchase(s,id,member){const o=shopById(id);if(!o||!memberIds.includes(member)||s.purchases.includes(id+':'+member)||coins(s)<o.price)return false;s.purchases.push(id+':'+member);return true;}
  function startShopJob(s,now=Date.now()){if(s.shopJob||s.gigs>=1000000||!Number.isSafeInteger(now)||now<0)return false;s.shopJob={end:now+timing.shopMs};return true;}
  const outfitOwned=(s,id)=>id==='base'||albumUnlocked(s,id);
  const canWearOutfit=(s,id)=>(id==='base'||Boolean(albumById(id)))&&(outfitOwned(s,id)||testMode);
  for(const a of albums.slice(1))a.tracks.forEach((t,i)=>songs.push({
    ...t,album:a.id,
    hint:i?'앞 트랙을 수집하고 한 번 연습하면 열려요.':'이 앨범을 해금하면 열려요.',
    unlocked:s=>albumUnlocked(s,a.id)&&(!i||(open(s,a.tracks[i-1].id)&&s.tracks[a.tracks[i-1].id].length>0))
  }));

  const ids = songs.map(s=>s.id);
  const flags = ['first','album','yj','gr','br','reunion','ending'];
  function fresh(now=Date.now()){
    return {version:8,cardDecorations:{},displayCard:null,finale:false,purchases:[],equipped:defaultEquipment(),hair:defaultEquipment(),gigs:0,shopJob:null,content:'album-journey',albums:[],points:100,energyAt:now,tracks:Object.fromEntries(ids.map(id=>[id,[]])),flags:[],collected:['scent'],proofs:[],notes:{},active:null,queue:null,setlist:[],display:null};
  }
  const has=(s,id)=>s.flags.includes(id);
  const eligible=(s,id)=>songs.find(song=>song.id===id)?.unlocked(s)??false;
  const open=(s,id)=>s.collected.includes(id);
  const ready=(s,id)=>s.tracks[id].length===3;
  const percent=(s,id)=>s.tracks[id].reduce((sum,i)=>sum+lessons[i].gain,0);
  const voices=s=>members.filter(m=>has(s,m.id)).length;
  const count=s=>ids.filter(id=>open(s,id)).length;
  const cheers=s=>ids.reduce((n,k)=>n+s.tracks[k].length,0)*2+s.flags.length*5;
  function recover(s,now){
    if(now<s.energyAt)return;
    const n=Math.floor((now-s.energyAt)/timing.recoveryMs);
    if(s.points===100){s.energyAt=now;return;}
    if(n){s.points=Math.min(100,s.points+n*5);s.energyAt=s.points===100?now:s.energyAt+n*timing.recoveryMs;}
  }
  function start(s,job,at){
    if(s.points<5)return false;
    if(s.points===100)s.energyAt=at;
    s.points-=5;s.active={...job,end:at+lessons[job.lesson].seconds*1000};return true;
  }
  function settle(s,now=Date.now()){
    let finished=0;
    if(s.shopJob&&s.shopJob.end<=now){s.gigs++;s.shopJob=null;finished++;}
    while(s.active&&s.active.end<=now){
      const {track,lesson,end}=s.active;
      if(!s.tracks[track].includes(lesson))s.tracks[track].push(lesson);
      if(ready(s,track)&&!s.setlist.includes(track))s.setlist.push(track);
      s.active=null;finished++;recover(s,end);
      if(s.queue){const next=s.queue;s.queue=null;start(s,next,end);}
    }
    recover(s,now);return finished;
  }
  function train(s,track,lesson,now=Date.now()){
    if(!ids.includes(track)||!open(s,track)||!lessons[lesson]||s.tracks[track].includes(lesson))return false;
    const same=j=>j&&j.track===track&&j.lesson===lesson;
    if(same(s.active)||same(s.queue)||s.queue)return false;
    const job={track,lesson};
    if(s.active){s.queue=job;return true;}
    return start(s,job,now);
  }
  function claim(s,id){
    if(has(s,id))return false;
    const allowed=id==='first'?ready(s,'scent'):id==='album'?has(s,'first'):
      members.some(m=>m.id===id)||id==='reunion'?coreAvailable(s,id):
      id==='ending'?has(s,'album')&&s.setlist.length>=2:false;
    if(!allowed||!s.proofs.includes('story:'+id))return false;
    s.flags.push(id);return true;
  }
  function valid(s){
    if(!s||s.version!==8||s.content!=='album-journey'||!Number.isInteger(s.points)||s.points<0||s.points>100||!Number.isSafeInteger(s.energyAt)||s.energyAt<0)return false;
    const subset=(a,opts)=>Array.isArray(a)&&a.every(x=>opts.includes(x))&&new Set(a).size===a.length;
    if(!subset(s.flags,flags)||!s.tracks||!ids.every(id=>subset(s.tracks[id],[0,1,2])))return false;
    if(!subset(s.albums,albums.slice(1).map(a=>a.id)))return false;
    if(!s.albums.every((id,i)=>id===albums[i+1].id&&albumUnlocked(s,albums[i].id)&&albumComplete(s,albums[i].id)))return false;
    if(!subset(s.collected,ids)||!s.collected.includes('scent')||!s.collected.every(id=>eligible(s,id))||!subset(s.proofs,Object.keys(challenges))||!s.notes||typeof s.notes!=='object'||Array.isArray(s.notes)||!Object.entries(s.notes).every(([k,v])=>k.startsWith('story:')&&challenges[k]&&typeof v==='string'&&v.trim().length>0&&v.length<=200))return false;
    if(!subset(s.flags,flags)||!s.tracks||!ids.every(id=>subset(s.tracks[id],[0,1,2]))||!ids.every(id=>!s.tracks[id].length||open(s,id)))return false;
    const job=j=>j&&ids.includes(j.track)&&open(s,j.track)&&[0,1,2].includes(j.lesson)&&!s.tracks[j.track].includes(j.lesson);
    if(s.active!==null&&(!job(s.active)||!Number.isSafeInteger(s.active.end)||s.active.end<0))return false;
    if(s.queue!==null&&(!s.active||!job(s.queue)||(s.queue.track===s.active.track&&s.queue.lesson===s.active.lesson)))return false;
    if(!storyEntries.every(e=>!storyDone(s,e.id)||storyAvailable(s,e.id)))return false;
    if(!subset(s.setlist,ids.filter(id=>ready(s,id)))||!(s.display===null||members.some(m=>m.id===s.display&&has(s,m.id))))return false;
    if(!Number.isInteger(s.gigs)||s.gigs<0||s.gigs>1000000||!subset(s.purchases,shop.flatMap(o=>memberIds.map(m=>o.id+':'+m))))return false;
    if(s.shopJob!==null&&(!s.shopJob||!Number.isSafeInteger(s.shopJob.end)||s.shopJob.end<0||s.gigs>=1000000))return false;
    if(typeof s.finale!=='boolean'||s.finale&&!finaleReady(s)||!(s.displayCard===null||cardOwned(s,s.displayCard)))return false;
    if(!s.cardDecorations||typeof s.cardDecorations!=='object'||Array.isArray(s.cardDecorations))return false;
    const earnedBadges=badges(s).filter(b=>b.earned).map(b=>b.id);
    if(!Object.entries(s.cardDecorations).every(([id,list])=>cardOwned(s,id)&&Array.isArray(list)&&list.length<=3&&subset(list,earnedBadges)))return false;
    if(!s.equipped||!s.hair||!memberIds.every(m=>styleOwned(s,s.equipped[m],m)&&styleOwned(s,s.hair[m],m))||coins(s)<0)return false;
    return s.flags.every(id=>s.proofs.includes('story:'+id))&&(!has(s,'first')||ready(s,'scent'))&&(!has(s,'album')||has(s,'first'))&&(!voices(s)||has(s,'album'))&&(!has(s,'reunion')||has(s,'gr')&&has(s,'yj'))&&(!has(s,'ending')||has(s,'album')&&ids.filter(id=>ready(s,id)).length>=2);
  }

  function loadSave(raw){
    let data=JSON.parse(raw);
    if([1,2,3].includes(data?.version)){
      const legacy=require('./our-stage-legacy').loadSave(raw);
      data={...legacy,version:4,content:'album-journey',tracks:{...fresh().tracks,...legacy.tracks},albums:[]};
    }
    if(data?.version===4)data={...data,version:5,purchases:[],equipped:defaultEquipment(),gigs:0,shopJob:null};
    if(data?.version===5)data={...data,version:6,hair:{...data.equipped}};
    if(data?.version===6)data={...data,version:8,cardDecorations:{},displayCard:data.display?'story:'+data.display:null,finale:false};
    if(data?.version===7)data={...data,version:8,cardDecorations:{}};
    if(!valid(data))throw Error('Invalid stage save');
    return data;
  }


  const challenges = {...require('../data/our-stage-challenges.json'),...require('../data/our-stage-journey-challenges.json')};
  for(const q of Object.values(challenges)){if(!q.level)q.level=1;if(!q.skill)q.skill='첫 기억';}
  storyEntries.forEach((e,i)=>{
    const q=e.quiz,choices=[...q.wrong],answer=i%(choices.length+1);choices.splice(answer,0,q.correct);
    challenges['story:'+e.id]={...q,choices,answer,source:e.source};
  });

  function canChallenge(s,key){
    if(!challenges[key])return false;
    const [kind,id]=key.split(':');
    if(kind==='story'&&storyById(id))return storyAvailable(s,id)&&!storyDone(s,id);
    if(kind==='song')return eligible(s,id)&&!open(s,id);
    return id==='first'?ready(s,'scent'):id==='album'?has(s,'first'):
      members.some(m=>m.id===id)||id==='reunion'?coreAvailable(s,id):
      id==='ending'?has(s,'album')&&s.setlist.length>=2:false;
  }
  function answer(s,key,index){
    if(!canChallenge(s,key)||index!==challenges[key].answer)return false;
    if(!s.proofs.includes(key))s.proofs.push(key);
    if(key.startsWith('song:'))s.collected.push(key.slice(5));
    return true;
  }
  function cheer(s,key,text){
    text=String(text||'').trim();
    if(!key.startsWith('story:')||!canChallenge(s,key)||!text||text.length>200)return false;
    s.notes[key]=text;if(!s.proofs.includes(key))s.proofs.push(key);return true;
  }

  function decorateCard(s,cardId,badgeId){
    if(!cardOwned(s,cardId)||!badges(s).some(b=>b.id===badgeId&&b.earned))return false;
    const list=s.cardDecorations[cardId]||[];
    if(list.includes(badgeId)){const next=list.filter(id=>id!==badgeId);if(next.length)s.cardDecorations[cardId]=next;else delete s.cardDecorations[cardId];return true;}
    if(list.length>=3)return false;
    s.cardDecorations[cardId]=[...list,badgeId];return true;
  }
  function badges(s){
    const b=[
      {id:'first-practice',name:'첫 연습',earned:ids.some(id=>s.tracks[id].length),hint:'어떤 곡이든 한 번 연습',icon:0},
      {id:'first-stage',name:'첫 무대 포스터',earned:has(s,'first'),hint:'첫 무대 완료',icon:1},
      {id:'three-voices',name:'세 개의 마이크',earned:voices(s)===3,hint:'멤버 카드 3장 수집',icon:3},
      {id:'reunion',name:'다시 같은 무대',earned:has(s,'reunion'),hint:'재회 이야기 완료',icon:4},
      {id:'ending',name:'우리의 불빛',earned:has(s,'ending'),hint:'첫 콘서트 완료',icon:5}
    ].map(x=>({...x,group:'이야기',kind:'activity'}));
    albums.forEach((a,i)=>{
      for(const [kind,name,earned,hint] of [
        ['unlock',a.name+' · 첫 페이지',albumUnlocked(s,a.id),'앨범 해금'],
        ['collect',i===0?'첫 번째 앨범을 펼치다':a.name+' · 전곡 수집',albumComplete(s,a.id),a.tracks.length+'트랙 모두 수집'],
        ['master',a.name+' · 무대 완성',albumMastered(s,a.id),'모든 트랙 준비도 100%']
      ])b.push({id:a.id+'-'+kind,name,earned,hint,group:'앨범',kind,album:a.id,icon:i});
    });
    const practices=ids.reduce((n,id)=>n+s.tracks[id].length,0),notes=Object.keys(s.notes).length;
    for(const [prefix,label,values,n,icon] of [
      ['practice','차곡차곡 연습',[10,30,60],practices,0],
      ['collection','노래 수집가',[10,30,60],count(s),2],
      ['cheer','응원의 문장',[1,3,5],notes,3]
    ])for(const target of values)b.push({id:prefix+'-'+target,name:label+' '+target,earned:n>=target,hint:prefix==='practice'?target+'회 연습 완료':prefix==='collection'?target+'트랙 수집':target+'개 이야기에 응원 남기기',group:'활동',kind:'activity',icon});
    b.push({id:'all-master',name:'우리의 모든 계절',earned:albums.every(a=>albumMastered(s,a.id)),hint:'8개 앨범의 모든 트랙 준비도 100%',group:'활동',kind:'activity',icon:5});
    for(const e of storyEntries.filter(e=>e.kind==='event'))b.push({id:e.id,name:e.title,earned:storyDone(s,e.id),hint:'사이드 이벤트 간직하기 · '+e.date,group:'이벤트',kind:'activity',icon:e.icon});
    b.push({id:'story-journey',name:'노래 사이의 모든 기억',earned:storyEntries.every(e=>storyDone(s,e.id)),hint:'앨범 이야기 7개와 사이드 이벤트 8개 간직하기',group:'이야기',kind:'activity',icon:2});
    return b;
  }

  return {decorateCard,memberCards,cardOwned,coreAvailable,coreCondition,finaleReady,finishFinale,shop,shopById,memberIds,earnings,coins,styleOwned,equip,equipPart,purchase,startShopJob,storyEntries,storyById,storyAvailable,storyDone,storyCondition,quizLevels,albums,albumById,songAlbum,albumCount,albumComplete,albumMastered,albumAvailable,unlockAlbum,badges,albumUnlocked,outfitOwned,canWearOutfit,timing,challenges,canChallenge,answer,cheer,eligible,loadSave,songs,lessons,members,reunionUrl,ids,fresh,has,open,ready,percent,voices,count,cheers,settle,train,claim,valid};
}
module.exports=createModel();
module.exports.forTest=()=>createModel(true);
