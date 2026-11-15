'use strict';
// Local game economy. Limits survive reloads; this is not a server anti-cheat system.
module.exports=function(testMode=false){
 const cooldown=testMode?60000:900000, dailyLimit=6;
 const games=[{id:'quiz',name:'노래 단서 퀴즈',description:'곡과 앨범의 단서를 보고 세 문제를 풀어요.',maxReward:15},{id:'rhythm',name:'응원 리듬 맞추기',description:'다가오는 빛이 중앙에 닿을 때, 여덟 번 박자를 맞춰요.',maxReward:16}];
 const bank={...require('../data/our-stage-challenges.json'),...require('../data/our-stage-journey-challenges.json')};
 const pool=Object.keys(bank).filter(k=>k.startsWith('song:'));
 const fresh=()=>({earned:0,day:null,plays:0,next:{quiz:0,rhythm:0},active:null});
 const time=n=>Number.isSafeInteger(n)&&n>=0&&n<253402268399999;
 const day=n=>time(n)?new Date(n+32400000).toISOString().slice(0,10):null;
 const used=(m,now)=>m.day&&day(now)>m.day?0:m.plays;
 const wait=(m,kind,now)=>Math.max(0,(m.next[kind]||0)-now);
 function canStart(m,kind,now){return time(now)&&games.some(g=>g.id===kind)&&!m.active&&(!m.day||day(now)>=m.day)&&used(m,now)<dailyLimit&&!wait(m,kind,now);}
 function start(m,kind,now,random=Math.random,pattern='steady'){
  if(!canStart(m,kind,now)||!patterns.some(p=>p.id===pattern))return false;
  if(m.day!==day(now)){m.day=day(now);m.plays=0;}m.plays++;m.next[kind]=now+cooldown;
  const keys=[...pool];for(let i=keys.length-1;i>0;i--){const j=Math.floor(Math.max(0,Math.min(.999999,random()))*(i+1));[keys[i],keys[j]]=[keys[j],keys[i]];}
  m.active={id:kind+':'+now,kind,...(kind==='rhythm'?{pattern}:{}),started:now,keys:kind==='quiz'?keys.slice(0,3):[],answers:[],taps:[],beatStart:null};return m.active.id;
 }
 const question=a=>a?.kind==='quiz'?bank[a.keys[a.answers.length]]:null;
 function answer(m,id,index){const a=m.active,q=question(a);if(!a||a.id!==id||!q||!Number.isInteger(index)||index<0||index>=q.choices.length)return false;a.answers.push(index);return true;}
 const beats=8,interval=700,lead=2100,windowMs=200;
 const patterns=[{id:'steady',name:'기본 박자',offsets:[0,700,1400,2100,2800,3500,4200,4900]},{id:'pairs',name:'두 번씩 치기',offsets:[0,450,1400,1850,2800,3250,4200,4650]},{id:'offbeat',name:'엇박자',offsets:[0,1050,1750,2100,3150,3850,4200,5250]}];
 const offsets=a=>patterns.find(p=>p.id===(a.pattern||'steady')).offsets;
 const endAt=a=>a.beatStart+offsets(a)[7]+windowMs;
 function beginBeat(m,id,now){const a=m.active;if(!a||a.id!==id||a.kind!=='rhythm'||a.beatStart!==null||!time(now)||now<a.started)return false;a.beatStart=now+lead;return true;}
 function tap(m,id,now){const a=m.active;if(!a||a.id!==id||a.kind!=='rhythm'||a.beatStart===null||!time(now)||now<a.beatStart-lead||now>endAt(a))return null;
  if(a.taps.length>=32||a.taps.length&&now-a.taps[a.taps.length-1]<100)return null;
  a.taps.push(now);return score(a);
 }
 function score(a){if(a.kind==='quiz')return a.answers.reduce((n,x,i)=>n+(x===bank[a.keys[i]].answer?1:0),0);
  const hit=new Set(),times=offsets(a);for(const t of a.taps){let n=0;times.forEach((x,i)=>{if(Math.abs(t-a.beatStart-x)<Math.abs(t-a.beatStart-times[n]))n=i;});if(Math.abs(t-a.beatStart-times[n])<=windowMs)hit.add(n);}return hit.size;
 }
 function finish(m,id,now){const a=m.active;if(!a||a.id!==id||!time(now))return null;
  if(a.kind==='quiz'?a.answers.length!==3:a.beatStart===null||now<endAt(a))return null;
  const correct=score(a),reward=correct*(a.kind==='quiz'?5:2),result={kind:a.kind,correct,total:a.kind==='quiz'?3:beats,reward};m.earned+=reward;m.active=null;return result;
 }
 function abandon(m,id){if(m.active?.id!==id)return false;m.active=null;return true;}
 function valid(m){
  if(!m||!Number.isSafeInteger(m.earned)||m.earned<0||m.earned>100000000||!Number.isInteger(m.plays)||m.plays<0||m.plays>dailyLimit||!m.next||!games.every(g=>time(m.next[g.id])))return false;
  if(m.day===null?m.plays!==0:typeof m.day!=='string'||!/^\d{4}-\d{2}-\d{2}$/.test(m.day)||!Number.isFinite(Date.parse(m.day+'T00:00:00Z'))||new Date(m.day+'T00:00:00Z').toISOString().slice(0,10)!==m.day)return false;
  const a=m.active;if(a===null)return true;
  if(!a||!games.some(g=>g.id===a.kind)||!time(a.started)||a.id!==a.kind+':'+a.started||m.plays<1||m.next[a.kind]<=a.started||!Array.isArray(a.keys)||!Array.isArray(a.answers)||!Array.isArray(a.taps))return false;
  if(a.kind==='quiz')return a.keys.length===3&&new Set(a.keys).size===3&&a.keys.every(k=>pool.includes(k))&&a.answers.length<=3&&a.answers.every((x,i)=>Number.isInteger(x)&&x>=0&&x<bank[a.keys[i]].choices.length)&&a.taps.length===0&&a.beatStart===null;
  return patterns.some(p=>p.id===(a.pattern||'steady'))&&!a.keys.length&&!a.answers.length&&(a.beatStart===null?!a.taps.length:time(a.beatStart)&&a.beatStart>=a.started+lead)&&a.taps.length<=32&&a.taps.every((t,i)=>time(t)&&t>=a.beatStart-lead&&t<=endAt(a)&&(!i||t-a.taps[i-1]>=100));
 }
 return {patterns,offsets,endAt,games,bank,pool,fresh,day,used,wait,canStart,start,question,answer,beginBeat,tap,score,finish,abandon,valid,cooldown,dailyLimit,beats,interval,lead,windowMs};
};
