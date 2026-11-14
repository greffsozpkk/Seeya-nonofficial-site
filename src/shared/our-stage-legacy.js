'use strict';
function createModel(testMode=false) {
  const timing={recoveryMs:testMode?1000:60000,performanceMs:testMode?1000:3300,testMode};
  // Album order follows Melon 314286. Each condition uses permanent progress.
  const songs = [
    {id:'scent', title:'여인의 향기', hint:'연습실에 처음 들어오면 열려요.', unlocked:()=>true},
    {id:'shoes', title:'구두', hint:'첫 무대를 마치면 열려요.', unlocked:s=>has(s,'first')},
    {id:'because', title:'사랑하기 때문에 (Feat. SG워너비)', hint:'구두의 팀 호흡 연습을 마치면 열려요.', unlocked:s=>s.tracks.shoes.includes(1)},
    {id:'flower', title:'접시꽃', hint:'구두 준비도 100%를 달성하면 열려요.', unlocked:s=>ready(s,'shoes')},
    {id:'promise', title:'Promise U', hint:'앨범 퀴즈를 풀거나 1집 기록을 간직하면 열려요.', unlocked:s=>has(s,'album')},
    {id:'again', title:'처음부터 또다시', hint:'Promise U의 보컬 연습을 마치면 열려요.', unlocked:s=>s.tracks.promise.includes(0)},
    {id:'guilty', title:'유죄', hint:'이야기에서 김연지의 멤버 카드를 얻으면 열려요.', unlocked:s=>has(s,'yj')},
    {id:'parting', title:'이별 해보기', hint:'이야기에서 남규리의 멤버 카드를 얻으면 열려요.', unlocked:s=>has(s,'gr')},
    {id:'tears', title:'Tears And Fears', hint:'이야기에서 이보람의 멤버 카드를 얻으면 열려요.', unlocked:s=>has(s,'br')},
    {id:'loved', title:'사랑했다면', hint:'세 카드를 모으고 재회의 기억을 간직하면 열려요.', unlocked:s=>has(s,'reunion')},
    {id:'just', title:'그냥', hint:'서로 다른 세 곡의 준비도를 100%로 만들면 열려요.', unlocked:s=>ids.filter(id=>id!=='just'&&ready(s,id)).length>=3},
    {id:'fault', title:'내 잘못입니다', hint:'우리의 콘서트 엔딩을 보면 열려요.', unlocked:s=>has(s,'ending')}
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
  const ids = songs.map(s=>s.id);
  const flags = ['first','album','yj','gr','br','reunion','ending'];
  function fresh(now=Date.now()){
    return {version:3,content:'first-mind',points:100,energyAt:now,tracks:Object.fromEntries(ids.map(id=>[id,[]])),flags:[],collected:['scent'],proofs:[],notes:{},active:null,queue:null,setlist:[],display:null};
  }
  const has=(s,id)=>s.flags.includes(id);
  // Costume ownership is derived from album progress, never from test fitting.
  // Add a real chapter unlock flag here when its playable album is implemented.
  const albumUnlockFlags={'first-mind':'album','lovely-sweet-heart':null,'california-dream':null,'brilliant-change':null,rebloom:null,'see-you-again':null,'still-here':null,'first-again':null};
  const albumUnlocked=(s,id)=>Boolean(albumUnlockFlags[id]&&has(s,albumUnlockFlags[id]));
  const outfitOwned=(s,id)=>id==='base'||albumUnlocked(s,id);
  const canWearOutfit=(s,id)=>(id==='base'||Object.hasOwn(albumUnlockFlags,id))&&(outfitOwned(s,id)||testMode);
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
      members.some(m=>m.id===id)?has(s,'album'):id==='reunion'?voices(s)===3:
      id==='ending'?has(s,'reunion')&&s.setlist.length>=2:false;
    if(!allowed||!s.proofs.includes('story:'+id))return false;
    s.flags.push(id);return true;
  }
  function valid(s){
    if(!s||s.version!==3||s.content!=='first-mind'||!Number.isInteger(s.points)||s.points<0||s.points>100||!Number.isSafeInteger(s.energyAt)||s.energyAt<0)return false;
    const subset=(a,opts)=>Array.isArray(a)&&a.every(x=>opts.includes(x))&&new Set(a).size===a.length;
    if(!subset(s.flags,flags)||!s.tracks||!ids.every(id=>subset(s.tracks[id],[0,1,2])))return false;
    if(!subset(s.collected,ids)||!s.collected.includes('scent')||!s.collected.every(id=>eligible(s,id))||!subset(s.proofs,Object.keys(challenges))||!s.notes||typeof s.notes!=='object'||Array.isArray(s.notes)||!Object.entries(s.notes).every(([k,v])=>k.startsWith('story:')&&challenges[k]&&typeof v==='string'&&v.trim().length>0&&v.length<=200))return false;
    if(!subset(s.flags,flags)||!s.tracks||!ids.every(id=>subset(s.tracks[id],[0,1,2]))||!ids.every(id=>!s.tracks[id].length||open(s,id)))return false;
    const job=j=>j&&ids.includes(j.track)&&open(s,j.track)&&[0,1,2].includes(j.lesson)&&!s.tracks[j.track].includes(j.lesson);
    if(s.active!==null&&(!job(s.active)||!Number.isSafeInteger(s.active.end)||s.active.end<0))return false;
    if(s.queue!==null&&(!s.active||!job(s.queue)||(s.queue.track===s.active.track&&s.queue.lesson===s.active.lesson)))return false;
    if(!subset(s.setlist,ids.filter(id=>ready(s,id)))||!(s.display===null||members.some(m=>m.id===s.display&&has(s,m.id))))return false;
    return s.flags.every(id=>s.proofs.includes('story:'+id))&&(!has(s,'first')||ready(s,'scent'))&&(!has(s,'album')||has(s,'first'))&&(!voices(s)||has(s,'album'))&&(!has(s,'reunion')||voices(s)===3)&&(!has(s,'ending')||has(s,'reunion')&&ids.filter(id=>ready(s,id)).length>=2);
  }
  function loadSave(raw){
    const data=JSON.parse(raw);
    if(data?.version===1&&data.content==='studio-1'&&data.tracks&&['scent','shoes','promise'].every(id=>Array.isArray(data.tracks[id]))){
      const tracks=fresh().tracks;
      for(const id of ['scent','shoes','promise'])tracks[id]=data.tracks[id];
      Object.assign(data,{version:2,content:'first-mind',tracks});
    }
    if(data?.version===2&&data.content==='first-mind'){
      if(!data.tracks||!Array.isArray(data.flags)||!ids.every(id=>Array.isArray(data.tracks[id])))throw Error('Invalid stage save');
      data.collected=ids.filter(id=>eligible(data,id));data.proofs=data.flags.map(id=>'story:'+id);data.notes={};data.version=3;
    }
    if(!valid(data))throw Error('Invalid stage save');
    return data;
  }

  const challenges = require('../data/our-stage-challenges.json');
  function canChallenge(s,key){
    if(!challenges[key])return false;
    const [kind,id]=key.split(':');
    if(kind==='song')return eligible(s,id)&&!open(s,id);
    return id==='first'?ready(s,'scent'):id==='album'?has(s,'first'):
      members.some(m=>m.id===id)?has(s,'album'):id==='reunion'?voices(s)===3:
      id==='ending'?has(s,'reunion')&&s.setlist.length>=2:false;
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
  return {albumUnlocked,outfitOwned,canWearOutfit,timing,challenges,canChallenge,answer,cheer,eligible,loadSave,songs,lessons,members,reunionUrl,ids,fresh,has,open,ready,percent,voices,count,cheers,settle,train,claim,valid};
}
module.exports=createModel();
module.exports.forTest=()=>createModel(true);
