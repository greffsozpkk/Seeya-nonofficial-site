'use strict';
// Deliberately separate from normal unlock rules. Only the test client calls this.
module.exports=function(M){
 const core=['gr','yj','reunion','br'],counts={gr:5,yj:9,reunion:12,br:15};
 const options=()=>[...(M.decorStore?[{id:'all-content',label:'모든 콘텐츠 해금 · 의상·무대·뽑기까지 전부',album:'first-again'}]:[]),...(M.finishDebut?[{id:'trainee',label:'연습생부터 · 첫 연습과 데뷔',album:'first-mind'}]:[]),...M.albums.map(a=>({id:'album:'+a.id,label:a.name+' · 앨범 시작',album:a.id})),{id:'complete',label:'전체 앨범 전곡 수집 · 이야기와 피날레는 직접 진행',album:'first-again'},...core.map(id=>({id:'story:'+id,label:id==='reunion'?'씨야 · 하나로 모인 기록':M.members.find(m=>m.id===id).name+' · '+M.members.find(m=>m.id===id).title,album:'see-you-again'})),...M.storyEntries.map(e=>({id:'story:'+e.id,label:e.date+' · '+e.subject+' · '+e.title,album:e.album}))];
 function create(target,now=Date.now()){
  if(!M.timing.testMode)throw Error('Test tools disabled');
  const option=options().find(o=>o.id===target);if(!option)throw Error('Unknown test target');
  if(target==='trainee')return M.fresh(now);
  if(target==='all-content'){
   const s=create('complete',now);
   s.flags=['first','album','gr','yj','br','reunion','ending'];s.proofs=Object.keys(M.challenges);s.finale=true;
   for(const a of M.albums)s.simple.concerts[a.id]={at:now,tracks:M.concertTracks(s,a.id),serial:'OS-'+a.id+'-'+now,restored:true};
   for(const q of M.wordTasks)s.simple.wordDone[q.track]=now;
   s.purchases=M.shop.flatMap(o=>M.memberIds.map(id=>o.id+':'+id));
   const pool=M.capsules.pool,g=s.leisure.capsules;
   Object.assign(g,{pulls:pool.length,freePulls:1,day:M.capsules.day(now),freeDay:M.capsules.day(now),owned:pool.map(i=>i.id),last:{number:pool.length,item:pool[pool.length-1].id,duplicate:false,free:false}});
   s.leisure.decor.owned=M.decorStore.items.map(i=>i.id);
   s.simple.walletOffset+=10000-M.coins(s);
   if(!M.valid(s))throw Error('Invalid full-content checkpoint');return s;
  }
  const s=M.fresh(now),ai=M.albums.findIndex(a=>a.id===option.album),story=target.startsWith('story:')?target.slice(6):null,e=M.storyById(story);
  const count=target==='complete'?M.albumById(option.album).tracks.length:story?(e?.minTracks??counts[story]):option.album==='first-mind'?1:0;
  const proof=k=>{if(!s.proofs.includes(k))s.proofs.push(k);};
  const flag=id=>{if(!s.flags.includes(id))s.flags.push(id);proof('story:'+id);};
  flag('first');flag('album');s.tracks.scent=[0,1,2];if(s.simple?.phaseOne){s.simple.debuted=true;s.simple.passIssuedAt=now;}
  s.albums=M.albums.slice(1,ai+1).map(a=>a.id);
  for(const [i,a] of M.albums.entries()){
   if(i>ai)break;
   for(const t of a.tracks.slice(0,i<ai?a.tracks.length:count)){if(!s.collected.includes(t.id))s.collected.push(t.id);s.tracks[t.id]=[0,1,2];if(t.id!=='scent')proof('song:'+t.id);}
  }
  const personal=M.albumCount(s,'see-you-again'),stop=core.indexOf(story);
  for(const [i,id] of core.entries())if(personal>=counts[id]&&(stop<0||i<stop))flag(id);
  // Only prerequisites of already-opened albums are pre-completed; selected stories remain playable.
  for(const a of M.albums.slice(1,ai+1))for(const id of M.albumStoryGates[a.id]||[])proof('story:'+id);
  if(ai>=M.albums.findIndex(a=>a.id==='still-here'))for(const id of ['event-wsg','event-yeonji-return','event-gyulmung'])proof('story:'+id);
  if(e?.requiresFlags)for(const id of e.requiresFlags)flag(id);
  s.setlist=s.collected.filter(id=>M.ready(s,id)).slice(0,2);
  if(s.simple?.version===2)for(const a of M.albums.slice(0,ai)){s.simple.concerts[a.id]={at:now,tracks:M.concertTracks(s,a.id),serial:'OS-'+a.id+'-'+now,...(s.simple?.phaseOne?{restored:true}:{})};}
  if(M.growth)M.growth.prepareTest(s,option.album);
  if(!M.valid(s)||story&&(e?!M.storyAvailable(s,story):!M.coreAvailable(s,story)))throw Error('Invalid test checkpoint');
  return s;
 }
 return {options,create};
};
