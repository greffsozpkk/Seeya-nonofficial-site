'use strict';
const cols=6,rows=8;
const members=[['br','보람'],['gr','규리'],['yj','연지']];
const styles=[['first-mind','1집'],['lovely-sweet-heart','2집'],['california-dream','2.5집'],['brilliant-change','3집']];
// Keep the original twelve IDs stable for saved games.
const tiles=styles.flatMap(([style,era])=>members.map(([member,name])=>({member,name,style,era,part:'hair'})));
const outfits=[...require('../data/our-stage-outfits.json'),...require('../data/our-stage-shop.json'),...require('../data/our-stage-capsule-outfits.json')];
for(const outfit of outfits)for(const [member,name] of members)for(const part of ['hair','clothes']){
 if(outfit.reward&&!outfit.members.includes(member))continue;
 if(!tiles.some(t=>t.style===outfit.id&&t.member===member&&t.part===part))tiles.push({member,name,style:outfit.id,era:styles.find(s=>s[0]===outfit.id)?.[1]||({'practice':'연습복','base':'20주년','first-again':'4집','still-here':'재결합'})[outfit.id]||outfit.name,part});
}
const pick=require('./our-stage-style-pick');
const point=i=>({x:i%cols+1,y:Math.floor(i/cols)+1});
function route(board,a,b,match=true){
 if(!Number.isInteger(a)||!Number.isInteger(b)||a<0||b<0||a>=48||b>=48||a===b||board[a]===null||board[b]===null||match&&board[a]!==board[b])return null;
 const start=point(a),end=point(b);
 const empty=p=>p.x===0||p.y===0||p.x===cols+1||p.y===rows+1||board[(p.y-1)*cols+p.x-1]===null||p.x===start.x&&p.y===start.y||p.x===end.x&&p.y===end.y;
 const clear=(p,q)=>{
  if(p.x!==q.x&&p.y!==q.y||!empty(p)||!empty(q))return false;
  const dx=Math.sign(q.x-p.x),dy=Math.sign(q.y-p.y);
  for(let x=p.x+dx,y=p.y+dy;x!==q.x||y!==q.y;x+=dx,y+=dy)if(!empty({x,y}))return false;
  return true;
 };
 const check=ps=>{
  ps=ps.filter((p,i)=>!i||p.x!==ps[i-1].x||p.y!==ps[i-1].y);
  if(!ps.slice(1).every((p,i)=>clear(ps[i],p)))return null;
  return ps.filter((p,i)=>!i||i===ps.length-1||!((ps[i-1].x===p.x&&p.x===ps[i+1].x)||(ps[i-1].y===p.y&&p.y===ps[i+1].y)));
 };
 let path=check([start,end]);if(path)return path;
 for(const corner of [{x:start.x,y:end.y},{x:end.x,y:start.y}]){path=check([start,corner,end]);if(path)return path;}
 for(let x=0;x<=cols+1;x++){path=check([start,{x,y:start.y},{x,y:end.y},end]);if(path)return path;}
 for(let y=0;y<=rows+1;y++){path=check([start,{x:start.x,y},{x:end.x,y},end]);if(path)return path;}
 return null;
}
function hint(board){for(let a=0;a<board.length;a++)if(board[a]!==null)for(let b=a+1;b<board.length;b++)if(board[a]===board[b]){const path=route(board,a,b);if(path)return {a,b,path};}return null;}
function shuffle(board,random=Math.random){
 const next=[...board],slots=board.flatMap((v,i)=>v===null?[]:[i]);
 for(let i=slots.length-1;i>0;i--){const j=Math.floor(Math.max(0,Math.min(.999999,random()))*(i+1));[next[slots[i]],next[slots[j]]]=[next[slots[j]],next[slots[i]]];}
 if(slots.length&&!hint(next)){
  // Keep cleared spaces and the exact tile counts; guarantee one legal next move.
  outer:for(const a of slots)for(const b of slots)if(route(next,a,b,false)){
   const c=slots.find(i=>i!==a&&next[i]===next[a]);
   [next[b],next[c]]=[next[c],next[b]];break outer;
  }
 }
 return next;
}
const fresh=(random=Math.random)=>({version:1,board:shuffle(pick(tiles.map((t,id)=>({...t,id})),12,random).flatMap(t=>[t.id,t.id,t.id,t.id]),random),elapsed:0,moves:0,shuffles:0});
function valid(s){return !!s&&s.version===1&&Array.isArray(s.board)&&s.board.length===48&&s.board.every(v=>v===null||Number.isInteger(v)&&v>=0&&v<tiles.length)&&tiles.every((_,i)=>{const n=s.board.filter(v=>v===i).length;return n<=4&&n%2===0;})&&['elapsed','moves','shuffles'].every(k=>Number.isSafeInteger(s[k])&&s[k]>=0&&s[k]<=1e9);}
function remove(s,a,b){const path=route(s.board,a,b);if(!path)return null;s.board[a]=null;s.board[b]=null;s.moves++;return path;}
module.exports={cols,rows,tiles,point,route,hint,shuffle,fresh,valid,remove};
