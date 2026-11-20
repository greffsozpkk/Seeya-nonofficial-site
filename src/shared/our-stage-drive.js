'use strict';
const duration=30000,limit=2,reward=10;
const difficulties={
 easy:{name:'쉬움',reward:8,description:'천천히, 여유롭게',speed:.14,gain:.05,earlyGap:2300,gap:1950,doubleAfter:16000,doubleChance:.2},
 normal:{name:'보통',reward:10,description:'익숙한 속도로',speed:.18,gain:.07,earlyGap:1900,gap:1500,doubleAfter:9000,doubleChance:.45},
 hard:{name:'어려움',reward:12,description:'빠르게, 연속해서',speed:.23,gain:.08,earlyGap:1600,gap:1250,doubleAfter:5000,doubleChance:.65}
};
const hasDifficulty=id=>Object.hasOwn(difficulties,id);
const difficultyOf=r=>r.difficulty===undefined?'normal':r.difficulty;
const winsValid=s=>s.wins===undefined?s.earned===s.paid*reward:!!s.wins&&Object.keys(s.wins).length===3&&Object.keys(difficulties).every(k=>Number.isSafeInteger(s.wins[k])&&s.wins[k]>=0)&&Object.values(s.wins).reduce((a,b)=>a+b,0)===s.paid&&Object.entries(difficulties).reduce((n,[k,d])=>n+s.wins[k]*d.reward,0)===s.earned;
const day=n=>new Date(n+32400000).toISOString().slice(0,10);
const time=n=>Number.isSafeInteger(n)&&n>=0&&n<253402200000000;
const fresh=()=>({day:null,count:0,earned:0,paid:0,serial:0,active:null,wins:{easy:0,normal:0,hard:0}});
const remaining=(s,now=Date.now())=>s.day&&day(now)<s.day?0:limit-(s.day===day(now)?s.count:0);
function valid(s){return !!s&&Number.isSafeInteger(s.serial)&&s.serial>=0&&s.serial<=1000000&&Number.isSafeInteger(s.paid)&&s.paid>=0&&s.paid<=s.serial&&winsValid(s)&&Number.isInteger(s.count)&&s.count>=0&&s.count<=limit&&s.count<=s.paid&&(s.day===null?s.count===0&&s.paid===0:typeof s.day==='string'&&/^\d{4}-\d{2}-\d{2}$/.test(s.day)&&Number.isFinite(Date.parse(s.day))&&new Date(s.day).toISOString().slice(0,10)===s.day)&&(s.active===null||!!s.active&&s.active.id===s.serial&&time(s.active.started)&&hasDifficulty(difficultyOf(s.active)));}
function start(s,now=Date.now(),difficulty='normal'){
 if(!valid(s)||!time(now)||s.serial>=1000000||!hasDifficulty(difficulty))return null;
 // Older saves earned 10 coins per win; preserve those wins and their daily count.
 if(s.wins===undefined)s.wins={easy:0,normal:s.paid,hard:0};
 s.active={id:++s.serial,started:now,difficulty};return {...s.active};
}
function finish(s,run,now=Date.now()){
 if(!valid(s)||!s.active||!run||run.id!==s.active.id||difficultyOf(run)!==difficultyOf(s.active)||!run.done||!time(now))return null;
 const difficulty=difficultyOf(s.active),amount=difficulties[difficulty].reward;
 if(s.wins===undefined)s.wins={easy:0,normal:s.paid,hard:0};
 const eligible=run.elapsed>=duration&&run.hits<2&&now-s.active.started>=duration;
 s.active=null;
 let coins=0;
 if(eligible&&remaining(s,now)>0){if(s.day!==day(now)){s.day=day(now);s.count=0;}s.count++;s.paid++;s.wins[difficulty]++;s.earned+=amount;coins=amount;}
 return {success:eligible,coins,difficulty,remaining:remaining(s,now)};
}
const patterns=['weave','convoy','mixed'];
function mixSeed(seed){let n=seed>>>0;n=Math.imul(n^(n>>>16),0x7feb352d);n=Math.imul(n^(n>>>15),0x846ca68b);return (n^(n>>>16))>>>0;}
function create(id,seed=Date.now(),difficulty='normal',previousPattern=null){
 if(!hasDifficulty(difficulty))throw Error('Invalid drive difficulty');
 const r={id,difficulty,seed:mixSeed(seed),elapsed:0,lane:1,x:1,hits:0,immune:0,next:1000,rows:[],done:false,passed:0,wave:0,lastSafe:null,hold:0};
 const pool=patterns.filter(p=>p!==previousPattern);
 r.pattern=pool[Math.floor(random(r)*pool.length)];r.direction=random(r)<.5?-1:1;r.phase=Math.floor(random(r)*4);
 r.next=800+Math.floor(random(r)*500);return r;
}
function nextSafe(r){
 let safe;
 if(r.pattern==='weave'){
  // Sweep the open lane left/centre/right, with a random phase and mirrored start.
  const sequence=[0,1,2,1];safe=sequence[(r.wave+r.phase)%4];if(r.direction<0)safe=2-safe;
 }else if(r.pattern==='convoy'){
  // Short clusters of traffic leave one edge open, then switch to another corridor.
  if(r.hold<=0){const choices=[0,1,2].filter(l=>l!==r.lastSafe);r.lastSafe=choices[Math.floor(random(r)*choices.length)];r.hold=2+Math.floor(random(r)*2);}
  safe=r.lastSafe;r.hold--;
 }else{
  const choices=[0,1,2].filter(l=>l!==r.lastSafe);safe=choices[Math.floor(random(r)*choices.length)];
 }
 r.lastSafe=safe;r.wave++;return safe;
}
function random(r){r.seed=(Math.imul(r.seed,1664525)+1013904223)>>>0;return r.seed/4294967296;}
function move(r,direction){if(!r.done)r.lane=Math.max(0,Math.min(2,r.lane+Math.sign(direction)));}
function advance(r,ms){
 if(r.done)return r;
 const dt=Math.max(0,Math.min(50,ms));
 r.elapsed=Math.min(duration,r.elapsed+dt);r.immune=Math.max(0,r.immune-dt);
 r.x+=Math.sign(r.lane-r.x)*Math.min(Math.abs(r.lane-r.x),dt/150);
 const level=difficulties[difficultyOf(r)],speed=level.speed+level.gain*Math.min(1,r.elapsed/duration);
 for(const car of r.rows){car.y+=dt*speed;
  if(!car.hit&&car.y>341&&car.y<421&&Math.abs(car.lane-r.x)<.62&&r.immune<=0){car.hit=true;r.hits++;r.immune=1400;}
 }
 r.rows=r.rows.filter(c=>c.y<520);
 if(r.elapsed>=r.next&&r.elapsed<duration-2200){
  const safe=nextSafe(r),lanes=[0,1,2].filter(l=>l!==safe);
  const occupied=r.elapsed<level.doubleAfter?[lanes[Math.floor(random(r)*2)]]:random(r)<level.doubleChance?lanes:[lanes[Math.floor(random(r)*2)]];
  occupied.forEach(lane=>r.rows.push({lane,y:-72,color:Math.floor(random(r)*4),hit:false}));
  // Bounded timing variation keeps successive rows far enough apart to change lanes.
  r.next=r.elapsed+(r.elapsed<5000?level.earlyGap:level.gap)*(.95+random(r)*.2);
 }
 r.done=r.hits>=2||r.elapsed>=duration;
 return r;
}
module.exports={duration,limit,reward,difficulties,patterns,day,fresh,valid,remaining,start,finish,create,move,advance};
