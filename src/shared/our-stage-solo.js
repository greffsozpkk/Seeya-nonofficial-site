'use strict';
// A separate encore chapter preserves the original eight-album save and unlock order.
module.exports=function(B){
 const soloAlbums=require('../data/our-stage-solos.json');
 const legacyAlbums=require('../data/our-stage-solos-v1.json');
 const soloById=id=>soloAlbums.find(a=>a.id===id);
 const soloTrackById=id=>soloAlbums.flatMap(a=>a.tracks).find(t=>t.id===id);
 const chapter=id=>soloAlbums.find(a=>a.tracks.some(t=>t.id===id));
 const soloUnlocked=s=>Boolean(s.simple?.concerts?.['first-again']);
 const soloSeconds=B.timing.testMode?3:15,soloCost=15;
 const data=s=>s.solo||{catalogVersion:2,done:[],active:null,concerts:{}};
 const soloDone=(s,id)=>data(s).done.includes(id);
 const soloOpen=(s,id)=>{const a=chapter(id),i=a?.tracks.findIndex(t=>t.id===id);return !!a&&soloUnlocked(s)&&(soloDone(s,id)||i===0||soloDone(s,a.tracks[i-1].id));};
 const soloConcertReady=(s,id)=>soloUnlocked(s)&&!!soloById(id)&&soloById(id).tracks.every(t=>soloDone(s,t.id));
 const stamp=n=>Number.isSafeInteger(n)&&n>0&&n<253402268399999;
 function ownValid(s){
  if(s.solo===undefined)return true;
  const x=s.solo;if(!x||x.catalogVersion!==2||Array.isArray(x)||!Array.isArray(x.done)||new Set(x.done).size!==x.done.length||!x.done.every(id=>soloTrackById(id))||!x.concerts||typeof x.concerts!=='object'||Array.isArray(x.concerts))return false;
  if(!soloUnlocked(s)&&(x.done.length||x.active||Object.keys(x.concerts).length))return false;
  if(x.active!==null&&(!x.active||!soloOpen(s,x.active.id)||soloDone(s,x.active.id)||!stamp(x.active.end)||s.active||s.queue))return false;
  return Object.entries(x.concerts).every(([id,r])=>soloConcertReady(s,id)&&r&&stamp(r.at)&&typeof r.restored==='boolean'&&r.serial==='OS-'+id+'-'+r.at&&Array.isArray(r.tracks)&&r.tracks.join('|')===soloById(id).tracks.map(t=>t.id).join('|'));
 }
 const valid=s=>{try{return B.valid(s)&&ownValid(s);}catch{return false;}};
 function migrate(s){
  const x=s.solo;if(x===undefined||x?.catalogVersion!==undefined)return s;
  const oldTrack=id=>legacyAlbums.flatMap(a=>a.tracks).find(t=>t.id===id);
  const oldOpen=id=>{const a=legacyAlbums.find(a=>a.tracks.some(t=>t.id===id)),i=a?.tracks.findIndex(t=>t.id===id);return !!a&&soloUnlocked(s)&&(i===0||x.done.includes(a.tracks[i-1].id));};
  if(!x||!Array.isArray(x.done)||new Set(x.done).size!==x.done.length||!x.done.every(id=>oldTrack(id)&&oldOpen(id))||!x.concerts||typeof x.concerts!=='object'||Array.isArray(x.concerts))throw Error('Invalid legacy solo save');
  if(!soloUnlocked(s)&&(x.done.length||x.active||Object.keys(x.concerts).length))throw Error('Invalid legacy solo gate');
  if(x.active!==null&&(!x.active||!oldOpen(x.active.id)||x.done.includes(x.active.id)||!stamp(x.active.end)||s.active||s.queue))throw Error('Invalid legacy solo practice');
  for(const [id,r] of Object.entries(x.concerts)){
   const a=legacyAlbums.find(a=>a.id===id);
   if(!a||!a.tracks.every(t=>x.done.includes(t.id))||!r||!stamp(r.at)||typeof r.restored!=='boolean'||r.serial!=='OS-'+id+'-'+r.at||!Array.isArray(r.tracks)||r.tracks.join('|')!==a.tracks.map(t=>t.id).join('|'))throw Error('Invalid legacy solo receipt');
  }
  const done=[];
  for(const a of soloAlbums){
   const old=legacyAlbums.find(v=>v.id===a.id),earned=old.tracks.filter(t=>x.done.includes(t.id));
   const kept=a.tracks.filter(t=>x.done.includes(t.id)).map(t=>t.id);
   let credit=earned.length-kept.length;
   for(const t of a.tracks)if(!kept.includes(t.id)&&(x.concerts[a.id]||credit>0)){kept.push(t.id);credit--;}
   done.push(...kept);
   if(x.concerts[a.id])x.concerts[a.id].tracks=a.tracks.map(t=>t.id);
  }
  // A changed catalog must not strand a paid practice on a removed song.
  if(x.active)s.points=Math.min(100,s.points+soloCost);
  x.done=done;x.active=null;x.catalogVersion=2;return s;
 }
 function loadSave(raw){const s=migrate(B.loadSave(raw));if(!ownValid(s))throw Error('Invalid solo save');return s;}
 function settle(s,now=Date.now()){
  let n=B.settle(s,now);const a=s.solo?.active;
  if(a&&now>=a.end){if(!s.solo.done.includes(a.id))s.solo.done.push(a.id);s.solo.active=null;n++;}
  return n;
 }
 function soloTrain(s,id,now=Date.now()){
  if(!stamp(now)||!soloOpen(s,id)||soloDone(s,id)||s.solo?.active||s.active||s.queue)return false;
  settle(s,now);if(s.points<soloCost)return false;
  if(s.points===100)s.energyAt=now;
  s.points-=soloCost;s.solo??={catalogVersion:2,done:[],active:null,concerts:{}};s.solo.active={id,end:now+soloSeconds*1000};return true;
 }
 function finishSoloConcert(s,id,now=Date.now()){
  if(!stamp(now)||!soloConcertReady(s,id)||s.solo.concerts[id])return false;
  s.solo.concerts[id]={at:now,serial:'OS-'+id+'-'+now,tracks:soloById(id).tracks.map(t=>t.id),restored:false};return true;
 }
 const trainAll=(s,...args)=>!s.solo?.active&&B.trainAll(s,...args);
 const train=(s,...args)=>!s.solo?.active&&B.train(s,...args);
 function restoreTicket(s,id,perm){if(!soloById(id))return B.restoreTicket(s,id,perm);const r=s.solo?.concerts[id];if(!r||r.restored||!Array.isArray(perm)||perm.length!==9||!perm.every((v,i)=>v===i))return false;r.restored=true;return true;}
 return {...B,soloAlbums,soloById,soloTrackById,soloUnlocked,soloOpen,soloDone,soloSeconds,soloCost,soloConcertReady,soloTrain,finishSoloConcert,trainAll,train,valid,loadSave,settle,restoreTicket};
};
