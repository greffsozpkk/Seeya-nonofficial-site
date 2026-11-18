'use strict';
// First-release experience layered over the proven practice-only economy.
module.exports=function(M){
 const stamp=n=>Number.isSafeInteger(n)&&n>0&&n<253402268399999;
 function migrate(s,now=Date.now()){
  if(s.simple.phaseOne===undefined){
   s.simple.phaseOne=1;
   s.simple.debuted=M.has(s,'first');
   s.simple.passIssuedAt=s.simple.debuted?(s.simple.concerts['first-mind']?.at||now):null;
   for(const r of Object.values(s.simple.concerts))r.restored=true;
  }
  return s;
 }
 const fresh=now=>migrate(M.fresh(now),now);
 function valid(s){return M.valid(s)&&s.simple.phaseOne===1&&typeof s.simple.debuted==='boolean'&&s.simple.debuted===M.has(s,'first')&&(s.simple.debuted?stamp(s.simple.passIssuedAt):s.simple.passIssuedAt===null)&&Object.values(s.simple.concerts).every(r=>typeof r.restored==='boolean')&&(!s.active?.chain||s.simple.debuted||s.active.track==='scent');}
 function loadSave(raw){const s=migrate(M.loadSave(raw));if(!valid(s))throw Error('Invalid first-release save');return s;}
 function finishDebut(s,now=Date.now()){
  if(s.simple.debuted||!M.ready(s,'scent')||!stamp(now))return false;
  if(!M.has(s,'first')&&!M.claim(s,'first'))return false;
  s.simple.debuted=true;s.simple.passIssuedAt=now;
  // The free trainee practice carries no coin payout.
  s.simple.walletOffset-=6;
  M.settle(s,now);return true;
 }
 function settle(s,now=Date.now()){
  const n=M.settle(s,now);
  if(!s.simple.debuted&&s.collected.every(id=>id==='scent'||id==='shoes')&&!s.tracks.shoes.length)s.collected=['scent'];
  return n;
 }
 function finishConcert(s,id,tracks,now){const changed=M.finishConcert(s,id,tracks,now);if(changed)s.simple.concerts[id].restored=false;return changed;}
 function restoreTicket(s,id,permutation){const r=s.simple.concerts[id];if(!r||r.restored||!Array.isArray(permutation)||permutation.length!==9||!permutation.every((v,i)=>v===i))return false;r.restored=true;return true;}
 const trainAll=(s,id,now)=>!s.simple.debuted&&id!=='scent'?false:M.trainAll(s,id,now);
 return {...M,fresh,valid,loadSave,settle,finishDebut,finishConcert,restoreTicket,trainAll};
};
