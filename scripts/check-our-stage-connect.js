'use strict';
const assert=require('node:assert/strict'),G=require('../src/shared/our-stage-connect');
let seed=7933;const random=()=>((seed=(Math.imul(seed,1664525)+1013904223)>>>0)/4294967296);
// Independent direction-aware search checks the two-bend and outside-edge rule.
function reachable(board,a,b){
 if(a===b||board[a]===null||board[b]===null||board[a]!==board[b])return false;
 const start=G.point(a),end=G.point(b),queue=[[start.x,start.y,-1,0]],seen=new Map(),dirs=[[1,0],[-1,0],[0,1],[0,-1]];
 for(let q=0;q<queue.length;q++){
  const [x,y,d,t]=queue[q];
  for(let nd=0;nd<4;nd++){
   const nx=x+dirs[nd][0],ny=y+dirs[nd][1],turn=t+(d!==-1&&nd!==d?1:0);
   if(nx<0||ny<0||nx>7||ny>9||turn>2)continue;
   if(nx===end.x&&ny===end.y)return true;
   if(nx>0&&nx<7&&ny>0&&ny<9&&board[(ny-1)*6+nx-1]!==null)continue;
   const key=[nx,ny,nd].join();if((seen.get(key)??3)<=turn)continue;seen.set(key,turn);queue.push([nx,ny,nd,turn]);
  }
 }
 return false;
}
let board=Array(48).fill(null);board[0]=board[5]=0;
assert.equal(G.route(board,0,5).length,2);assert.equal(G.route(board,0,0),null);
board=Array(48).fill(1);board[0]=board[5]=0;const outside=G.route(board,0,5);assert.equal(outside.length,4);assert(outside.some(p=>p.y===0));
board=Array(48).fill(1);board[14]=board[21]=0;assert.equal(G.route(board,14,21),null);
for(let sample=0;sample<100;sample++){
 const s=G.fresh(random);assert(G.valid(s));assert(G.hint(s.board));
 for(let n=0;n<24;n++){
  if(!G.hint(s.board)){const previous=s.board.filter(x=>x!==null).sort();s.board=G.shuffle(s.board,random);assert.deepEqual(s.board.filter(x=>x!==null).sort(),previous);}
  const h=G.hint(s.board);assert(h);assert(reachable(s.board,h.a,h.b));
  for(let probe=0;probe<10;probe++){const a=Math.floor(random()*48),b=Math.floor(random()*48);assert.equal(!!G.route(s.board,a,b),reachable(s.board,a,b));}
  assert(G.remove(s,h.a,h.b));assert.equal(G.remove(s,h.a,h.b),null);assert(G.valid(s));assert(G.valid(JSON.parse(JSON.stringify(s))));
 }
 assert.equal(s.moves,24);assert(s.board.every(v=>v===null));
}
for(const mutate of [s=>s.board.pop(),s=>s.board[0]=G.tiles.length,s=>s.board[0]=null,s=>s.elapsed=-1,s=>s.version=2,s=>s.moves=Infinity]){const s=G.fresh(random);mutate(s);assert(!G.valid(s));}
// Client uses a separate save and never receives the game's coin/point model.
const make=require('../src/client/our-stage-connect'),mem=new Map(),listeners={};let now=1000;
const saved={document:global.document,window:global.window,localStorage:global.localStorage,performance:global.performance};
global.document={hidden:false,addEventListener:(event,fn)=>listeners[event]=fn};global.window={addEventListener:(event,fn)=>listeners[event]=fn};
global.localStorage={getItem:k=>mem.get(k),setItem:(k,v)=>mem.set(k,v)};global.performance={now:()=>now};
let html='',visible=true;const element={set outerHTML(v){html=v;}};
const root={querySelector:q=>q==='.connect-page'&&visible?element:null};
const options={root,sprite:()=>'<svg viewBox="0 0 440 680"></svg>',styles:[],esc:s=>String(s)};
const ui=make(options);assert(!ui.handle('coin-claim',''));ui.handle('connect-new');assert.equal(mem.size,1);
now+=1000;ui.update();ui.handle('connect-hint');assert(html.includes('is-hint'));
const state=JSON.parse(mem.get('seeya-our-stage-connect-v1')),h=G.hint(state.board);ui.handle('connect-tile',h.a);ui.handle('connect-tile',h.b);
let stored=JSON.parse(mem.get('seeya-our-stage-connect-v1'));assert.equal(stored.moves,1);assert.equal(stored.board.filter(x=>x===null).length,2);
now+=500;ui.update();ui.handle('connect-pause');const elapsed=JSON.parse(mem.get('seeya-our-stage-connect-v1')).elapsed;
now+=10000;ui.update();ui.handle('connect-resume');now+=1000;ui.handle('connect-pause');stored=JSON.parse(mem.get('seeya-our-stage-connect-v1'));assert.equal(stored.elapsed,elapsed+1000);
assert(make(options).render().includes('이어서 하기'));ui.handle('connect-reset');ui.handle('connect-cancel');assert.equal(JSON.parse(mem.get('seeya-our-stage-connect-v1')).moves,1);
global.localStorage.setItem=()=>{throw Error('full');};ui.handle('connect-resume');ui.handle('connect-shuffle');assert(html.includes('진행 상황을 저장하지 못했어요'));
Object.assign(global,saved);
console.log('PASS member connect: 100 complete boards, independent two-turn path checks, outside routes, blocked paths, shuffle preservation, duplicate protection, save validation, pause/resume and storage failure.');
