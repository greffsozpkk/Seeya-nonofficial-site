'use strict';
// Deterministic bracket replay keeps saved progress verifiable; it is not an anti-bot server.
function shuffle(ids,random=Math.random){const a=[...ids];for(let i=a.length-1;i>0;i--){const j=Math.floor(random()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;}
function create(ids,size,version,id,random=Math.random){if(![16,32,64].includes(size)||new Set(ids).size!==ids.length||ids.length<size)throw Error('후보 수를 확인해 주세요.');return {schema:1,id,version,size,initial:shuffle(ids,random).slice(0,size),picks:[]};}
function replay(game,ids,version){
 if(game?.schema===2)return replayAll(game,ids,version);
 if(!game||game.schema!==1||game.version!==version||typeof game.id!=='string'||!/^[\w-]{8,100}$/.test(game.id)||![16,32,64].includes(game.size)||!Array.isArray(game.initial)||game.initial.length!==game.size||new Set(game.initial).size!==game.size||!game.initial.every(x=>ids.includes(x))||!Array.isArray(game.picks)||game.picks.length>game.size-1)throw Error('이전 게임을 불러올 수 없어요. 새 게임을 시작해 주세요.');
 let round=[...game.initial],winners=[],match=0;const history=[];
 for(const pick of game.picks){const pair=round.slice(match*2,match*2+2);if(round.length===1||!pair.includes(pick))throw Error('잘못된 선택 기록');history.push({round:round.length,pair,winner:pick});winners.push(pick);match++;if(match===round.length/2){round=winners;winners=[];match=0;}}
 return {round:round.length,match,pair:round.length>1?round.slice(match*2,match*2+2):[],winner:round.length===1?round[0]:null,history,done:game.picks.length,total:game.size-1};
}
function choose(game,pick,ids,version){const state=replay(game,ids,version);if(!state.pair.includes(pick))throw Error('현재 대결의 곡을 선택해 주세요.');return {...game,picks:[...game.picks,pick]};}
function recordResult(history,game,ids,version,now){const state=replay(game,ids,version);if(!state.winner)throw Error('완료되지 않은 게임');const old=Array.isArray(history)?history:[];if(old.some(r=>r.id===game.id))return old;return [...old,{id:game.id,version,size:game.full?'all':game.size,winner:state.winner,at:now}].slice(-100);}
function ranking(history,size,version){const rows=history.filter(r=>r.version===version&&r.size===size),counts=new Map();rows.forEach(r=>counts.set(r.winner,(counts.get(r.winner)||0)+1));let prev=-1,rank=0;return {total:rows.length,rows:[...counts].sort((a,b)=>b[1]-a[1]||a[0].localeCompare(b[0])).map(([id,wins],i)=>{if(wins!==prev)rank=i+1;prev=wins;return {id,wins,rank,percent:rows.length?wins/rows.length*100:0};})};}
function roundProgress(state){const label=state.round===2?'결승':state.round+'강',matches=state.matches??state.round/2,completed=state.completed??state.match;return {label,matches,current:completed+1,completed,text:label+' '+(completed+1)+'/'+matches};}
// All entrants participate. Random first-round byes complete the power-of-two bracket.
function createAll(ids,version,id,random=Math.random){
 if(ids.length<2||ids.length>128||new Set(ids).size!==ids.length)throw Error('후보 수를 확인해 주세요.');
 const size=2**Math.ceil(Math.log2(ids.length)),order=shuffle(ids,random),paired=2*(ids.length-size/2),initial=order.slice(0,paired);
 for(const entrant of order.slice(paired))initial.push(entrant,null);
 return {schema:2,full:true,id,version,size,initial,picks:[]};
}
function replayAll(game,ids,version){
 const valid=Array.isArray(game.initial)?game.initial.filter(x=>x!==null):[];
 if(!game.full||game.version!==version||typeof game.id!=='string'||!/^[\w-]{8,100}$/.test(game.id)||game.size!==2**Math.ceil(Math.log2(ids.length))||game.initial?.length!==game.size||valid.length!==ids.length||new Set(valid).size!==ids.length||!valid.every(x=>ids.includes(x))||!Array.isArray(game.picks)||game.picks.length>ids.length-1)throw Error('전체 참가 기록을 읽을 수 없어요.');
 let round=[...game.initial],winners=[],match=0,completed=0,cursor=0;const history=[];
 while(round.length>1){
  const pair=round.slice(match*2,match*2+2),byes=round.filter(x=>x===null).length,matches=round.length/2-byes;
  if(pair.every(x=>x===null))throw Error('잘못된 부전승 대진');
  if(pair.includes(null))winners.push(pair.find(x=>x!==null));
  else {
   if(cursor===game.picks.length)return {round:round.length,match,pair,winner:null,history,done:cursor,total:ids.length-1,matches,completed,byes};
   const pick=game.picks[cursor++];if(!pair.includes(pick))throw Error('잘못된 선택 기록');
   winners.push(pick);completed++;history.push({round:round.length,pair,winner:pick});
  }
  match++;if(match===round.length/2){round=winners;winners=[];match=0;completed=0;}
 }
 if(cursor!==game.picks.length)throw Error('종료 이후 선택');
 return {round:1,match:0,pair:[],winner:round[0],history,done:cursor,total:ids.length-1};
}
module.exports={shuffle,create,createAll,replay,choose,recordResult,ranking,roundProgress};
