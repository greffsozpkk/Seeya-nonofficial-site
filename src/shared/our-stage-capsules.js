'use strict';
// Cosmetic rewards only. Album/story collections are never part of this pool.
const rows=[
 ['frame-letter','frame','normal','분홍 편지','letter','#a75b7a','#fff0ee'],
 ['frame-ticket','frame','normal','입장 티켓','ticket','#295383','#fff4d8'],
 ['frame-varsity','frame','normal','씨야 과잠','varsity','#29364c','#fff8e9'],
 ['frame-piano','frame','normal','피아노 건반','piano','#353044','#fffdf4'],
 ['frame-blossom','frame','rare','벚꽃 약속','blossom','#c16d97','#fff0f6'],
 ['frame-vinyl','frame','rare','보랏빛 레코드','vinyl','#7560aa','#efe7ff'],
 ['frame-stars','frame','special','우리의 별자리','stars','#e3bc71','#222842'],
 ['frame-encore','frame','special','황금빛 앙코르','encore','#b8873f','#fff6dd'],
 ['back-note','background','normal','노래가 적힌 노트','note','#8d7793','#fffaf0'],
 ['back-check','background','normal','연습실 체크','check','#7995a4','#eaf4f6'],
 ['back-petals','background','normal','봄날의 꽃잎','petals','#df93ac','#fff1f4'],
 ['back-stamp','background','normal','마음의 우표','stamp','#a2819d','#f5edf7'],
 ['back-night','background','rare','밤하늘의 오선지','night','#d9caed','#292841'],
 ['back-fan','background','special','객석의 불빛','fan','#edb3de','#302345'],
 ['effect-petals','frame','rare','꽃잎 리본','ribbon','#e69ab7','#fff1f4'],
 ['effect-record','frame','rare','레코드 컬렉션','record','#aa9bdb','#ede6ff'],
 ['effect-twinkle','frame','rare','별빛 브로치','twinkle','#e6c78b','#fff4d7'],
 ['effect-confetti','frame','rare','커튼콜 리본','confetti','#c188a9','#fff0f6'],
 ['stage-sunset','stage','normal','노을빛 무대','sunset','#d37d82','#422b51'],
 ['stage-blue','stage','normal','푸른 새벽','blue','#78aace','#182842'],
 ['stage-spring','stage','rare','벚꽃 앙코르','spring','#e9a3c1','#583652'],
 ['stage-neon','stage','rare','Hot 네온','neon','#66e5d8','#271744'],
 ['stage-moon','stage','rare','달빛 발라드','moon','#b7b4ee','#202846'],
 ['stage-reunion','stage','rare','슈가맨 · 다시 만난 무대','reunion','#8acdde','#101b38'],
 ['stage-gold','stage','special','THE FAN · 황금빛 밤','gold','#f2ce78','#37274e']
];
const outfits=require('../data/our-stage-capsule-outfits.json');
for(const o of outfits)rows.push([o.reward,'outfit',o.rarity,o.name,o.id.replace('capsule-',''),o.color,o.paper]);
const pool=rows.map(([id,kind,rarity,name,motif,color,paper])=>({id,kind,rarity,name,motif,color,paper}));
const byId=id=>pool.find(x=>x.id===id),rates={normal:70,rare:25,special:5},refund={normal:1,rare:2,special:3},cost={normal:3,rare:6,special:12};
const fresh=()=>({pulls:0,freePulls:0,freeDay:null,day:null,rareMiss:0,specialMiss:0,owned:[],tickets:0,exchanges:[],history:[],last:null});
const integer=(n,max=1000000)=>Number.isSafeInteger(n)&&n>=0&&n<=max;
const date=d=>d===null||typeof d==='string'&&/^\d{4}-\d{2}-\d{2}$/.test(d)&&Number.isFinite(Date.parse(d))&&new Date(d).toISOString().slice(0,10)===d;
const day=now=>new Date(now+32400000).toISOString().slice(0,10);
const time=n=>Number.isSafeInteger(n)&&n>0&&n<253402200000000;
const randomUnit=r=>Math.max(0,Math.min(.999999,Number(r())||0));
function valid(g){try{
 if(!g||![g.pulls,g.freePulls,g.tickets,g.rareMiss,g.specialMiss].every(n=>integer(n))||g.freePulls>g.pulls||g.rareMiss>9||g.specialMiss>29||g.rareMiss>g.specialMiss||g.specialMiss>g.pulls||!date(g.freeDay)||!date(g.day)||g.freeDay!==null&&(!g.day||g.freeDay>g.day)||g.pulls===0&&(g.day!==null||g.last!==null)||g.freePulls===0&&g.freeDay!==null||g.freePulls>0&&g.freeDay===null)return false;
 if(!Array.isArray(g.owned)||new Set(g.owned).size!==g.owned.length||!g.owned.every(id=>byId(id))||!Array.isArray(g.exchanges)||new Set(g.exchanges).size!==g.exchanges.length||!g.exchanges.every(id=>g.owned.includes(id))||g.owned.length>g.pulls+g.exchanges.length)return false;
 if(g.tickets+g.exchanges.reduce((n,id)=>n+cost[byId(id).rarity],0)>g.pulls*3||!Array.isArray(g.history)||g.history.length>10||!g.history.every(r=>byId(r.item)&&date(r.day)&&r.day!==null&&typeof r.duplicate==='boolean'&&typeof r.free==='boolean')||g.pulls>0&&(!g.last||!byId(g.last.item)||!g.owned.includes(g.last.item)||!integer(g.last.number)||g.last.number!==g.pulls||typeof g.last.duplicate!=='boolean'||typeof g.last.free!=='boolean'))return false;
 return true;
 }catch{return false;}}
function pull(g,now,balance,random=Math.random){if(!time(now)||g.day&&day(now)<g.day||g.pulls>=1000000)return null;const today=day(now),free=g.freeDay!==today;if(!free&&balance<30)return null;
 let rarity;if(g.specialMiss===29)rarity='special';else if(g.rareMiss===9)rarity=randomUnit(random)<.05?'special':'rare';else{const n=randomUnit(random);rarity=n<.7?'normal':n<.95?'rare':'special';}
 const tier=pool.filter(x=>x.rarity===rarity),unowned=tier.filter(x=>!g.owned.includes(x.id)),choices=unowned.length?unowned:tier,item=choices[Math.floor(randomUnit(random)*choices.length)],duplicate=g.owned.includes(item.id);
 g.pulls++;g.day=today;if(free){g.freePulls++;g.freeDay=today;}g.rareMiss=rarity==='normal'?g.rareMiss+1:0;g.specialMiss=rarity==='special'?0:g.specialMiss+1;
 if(duplicate)g.tickets+=refund[rarity];else g.owned.push(item.id);
 g.last={number:g.pulls,item:item.id,duplicate,free};g.history=[{item:item.id,duplicate,free,day:today},...g.history].slice(0,10);return {...g.last,refund:duplicate?refund[rarity]:0};
}
function exchange(g,id){const item=byId(id);if(!item||item.kind==='outfit'||g.owned.includes(id)||g.tickets<cost[item.rarity])return false;g.tickets-=cost[item.rarity];g.owned.push(id);g.exchanges.push(id);return true;}
module.exports={pool,byId,rates,refund,cost,fresh,valid,pull,exchange,day,time,price:30};
