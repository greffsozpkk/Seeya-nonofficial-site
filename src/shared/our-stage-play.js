'use strict';
const bank=require('./our-stage-play-bank');
module.exports=function(M){
 const cooldown=M.timing.testMode?10000:900000,limit=6;
 const games=[{id:'quiz',name:'씨야 활동 퀴즈',description:'무대와 이야기 속 순간을 떠올려요.',detail:'3문제 · 모두 맞히면 20코인',icon:'?'},{id:'pairs',name:'멤버 스타일 짝 맞추기',description:'모은 앨범의 의상으로 매번 새로운 조합.',detail:'16장 · 8쌍 · 최대 20코인',icon:'♡'},{id:'jigsaw',name:'이야기 그림 맞추기',description:'두 조각을 눌러 추억의 그림을 완성해요.',detail:'4 × 4 · 최대 20코인',icon:'▦'}];
 const fresh=(old={})=>({day:old.day||null,plays:old.plays||0,total:0,earned:0,next:{quiz:old.next?.quiz||0,pairs:old.next?.pairs||0,jigsaw:0},recent:[],active:null});
 const time=n=>Number.isSafeInteger(n)&&n>=0&&n<253402200000000;
 const day=n=>new Date(n+32400000).toISOString().slice(0,10);
 const used=(m,now)=>!m.day||day(now)>m.day?0:m.plays;
 const wait=(m,kind,now)=>Math.max(0,m.next[kind]-now);
 const shuffle=(a,r=Math.random)=>{a=[...a];for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.max(0,Math.min(.999999,Number(r())||0))*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;};
 const cardPool=s=>[...['practice','base'],...M.albums.filter(a=>M.albumUnlocked(s,a.id)).map(a=>a.id)].flatMap(style=>M.memberIds.map(member=>({id:style+':'+member,style,member,label:style==='practice'?'연습복':style==='base'?'20주년':M.albumById(style).name})));
 const stories=s=>M.storyEntries.filter(e=>M.storyDone(s,e.id)&&e.image);
 const questionPool=s=>bank.filter(q=>M.albumUnlocked(s,q.album));
 const available=(s,kind)=>kind!=='jigsaw'||stories(s).length>0;
 function canStart(s,kind,now){const m=s.leisure.play;return time(now)&&time(now+cooldown)&&s.simple.debuted&&games.some(g=>g.id===kind)&&available(s,kind)&&!m.active&&!s.mini.active&&(!m.day||day(now)>=m.day)&&used(m,now)<limit&&!wait(m,kind,now)&&m.total<1000000;}
 function start(s,kind,now,random=Math.random){if(!canStart(s,kind,now))return false;const m=s.leisure.play;let a={id:kind+':'+now,kind,started:now};
 if(kind==='quiz'){const pool=questionPool(s),unused=pool.filter(q=>!m.recent.includes(q.id));const qs=shuffle(unused.length>=3?unused:pool,random).slice(0,3);if(qs.length<3)return false;a.questions=qs.map(q=>({id:q.id,order:shuffle(q.choices.map((_,i)=>i),random)}));a.answers=[];m.recent=[...qs.map(q=>q.id),...m.recent.filter(id=>!qs.some(q=>q.id===id))].slice(0,9);}
 if(kind==='pairs'){const cards=shuffle(cardPool(s),random).slice(0,8);if(cards.length<8)return false;a.deck=shuffle(cards.flatMap(c=>[c.id,c.id]),random);a.history=[];a.open=null;a.reveal=null;a.hideAt=0;}
 if(kind==='jigsaw'){const list=stories(s).sort((a,b)=>a.id.localeCompare(b.id)),hash=[...day(now)].reduce((n,c)=>(n*31+c.charCodeAt(0))>>>0,0);a.story=list[hash%list.length].id;a.perm=shuffle(Array.from({length:16},(_,i)=>i),random);if(a.perm.filter((n,i)=>n===i).length>=5)a.perm=a.perm.map((_,i)=> (i+5)%16);a.swaps=0;}
 if(m.day!==day(now)){m.day=day(now);m.plays=0;}m.plays++;m.total++;m.next[kind]=now+cooldown;m.active=a;return a.id;
 }
 const question=a=>a?.kind==='quiz'?bank.find(q=>q.id===a.questions[a.answers.length]?.id):null;
 function answer(m,id,position){const a=m.active,q=question(a);if(!q||a.id!==id||!Number.isInteger(position)||position<0||position>=q.choices.length)return false;a.answers.push(a.questions[a.answers.length].order[position]);return true;}
 function progress(a){const matched=new Set();let combo=0,maxCombo=0;for(const [x,y]of a.history){if(a.deck[x]===a.deck[y]){matched.add(x);matched.add(y);maxCombo=Math.max(maxCombo,++combo);}else combo=0;}return {matched,combo,maxCombo,turns:a.history.length,pairs:matched.size/2,done:matched.size===16||a.history.length>=200};}
 function settle(m,now){const a=m.active;if(a?.kind==='pairs'&&a.reveal&&now>=a.hideAt){a.reveal=null;a.hideAt=0;return true;}return false;}
 function flip(m,id,i,now){const a=m.active;if(a?.kind!=='pairs'||a.id!==id||!Number.isInteger(i)||i<0||i>=16||!time(now)||now<a.started)return false;settle(m,now);const p=progress(a);if(p.done||a.reveal||p.matched.has(i)||a.open===i)return false;if(a.open===null){a.open=i;return true;}const first=a.open;a.open=null;a.history.push([first,i]);if(a.deck[first]!==a.deck[i]){a.reveal=[first,i];a.hideAt=now+850;}return true;}
 function swap(m,id,i,j){const a=m.active;if(a?.kind!=='jigsaw'||a.id!==id||![i,j].every(n=>Number.isInteger(n)&&n>=0&&n<16)||i===j||a.swaps>=10000||a.perm.every((n,k)=>n===k))return false;[a.perm[i],a.perm[j]]=[a.perm[j],a.perm[i]];a.swaps++;return true;}
 function finish(m,id){const a=m.active;if(!a||a.id!==id)return null;let result;
 if(a.kind==='quiz'){if(a.answers.length!==3)return null;const correct=a.answers.reduce((n,v,i)=>n+(v===bank.find(q=>q.id===a.questions[i].id).answer?1:0),0);result={kind:a.kind,correct,total:3,reward:correct*5+(correct===3?5:0)};}
 if(a.kind==='pairs'){const p=progress(a);if(!p.done)return null;result={kind:a.kind,correct:p.pairs,total:8,reward:Math.min(20,Math.floor(p.pairs*1.5*(1+p.maxCombo*.05))+(p.turns===8?4:0)),turns:p.turns,combo:p.maxCombo};}
 if(a.kind==='jigsaw'){if(!a.perm.every((n,i)=>n===i))return null;result={kind:a.kind,correct:16,total:16,reward:a.swaps<=24?20:a.swaps<=36?15:10,story:a.story,swaps:a.swaps};}
 if(!result)return null;m.earned+=result.reward;m.active=null;return result;
 }
 const permutation=(a,n)=>Array.isArray(a)&&a.length===n&&new Set(a).size===n&&a.every(v=>Number.isInteger(v)&&v>=0&&v<n);
 function valid(m,s){try{
 if(!m||!Number.isSafeInteger(m.earned)||m.earned<0||m.earned>m.total*20||!Number.isSafeInteger(m.total)||m.total<0||m.total>1000000||!Number.isInteger(m.plays)||m.plays<0||m.plays>6||!m.next||!games.every(g=>time(m.next[g.id]))||!Array.isArray(m.recent)||m.recent.length>9||new Set(m.recent).size!==m.recent.length||!m.recent.every(id=>bank.some(q=>q.id===id)))return false;
 if(m.day===null?m.plays!==0:typeof m.day!=='string'||!/^\d{4}-\d{2}-\d{2}$/.test(m.day)||!Number.isFinite(Date.parse(m.day))||new Date(m.day).toISOString().slice(0,10)!==m.day)return false;
 const a=m.active;if(a===null)return true;if(!a||!games.some(g=>g.id===a.kind)||!time(a.started)||a.id!==a.kind+':'+a.started||m.plays<1||m.total<1||m.next[a.kind]!==a.started+cooldown||m.day!==day(a.started))return false;
 if(a.kind==='quiz')return Array.isArray(a.questions)&&a.questions.length===3&&new Set(a.questions.map(q=>q.id)).size===3&&a.questions.every(q=>questionPool(s).some(x=>x.id===q.id)&&permutation(q.order,bank.find(x=>x.id===q.id).choices.length))&&Array.isArray(a.answers)&&a.answers.length<=3&&a.answers.every((v,i)=>a.questions[i].order.includes(v));
 if(a.kind==='jigsaw')return stories(s).some(e=>e.id===a.story)&&permutation(a.perm,16)&&Number.isInteger(a.swaps)&&a.swaps>=0&&a.swaps<=10000;
 const index=n=>Number.isInteger(n)&&n>=0&&n<16,pool=cardPool(s);if(!Array.isArray(a.deck)||a.deck.length!==16||new Set(a.deck).size!==8||!a.deck.every(id=>pool.some(c=>c.id===id)&&a.deck.filter(x=>x===id).length===2)||!Array.isArray(a.history)||a.history.length>200)return false;
 const matched=new Set();for(const p of a.history){if(!Array.isArray(p)||p.length!==2||!p.every(index)||p[0]===p[1]||p.some(i=>matched.has(i)))return false;if(a.deck[p[0]]===a.deck[p[1]])p.forEach(i=>matched.add(i));}
 if(a.open!==null&&(!index(a.open)||matched.has(a.open)))return false;
 if(a.reveal!==null){const p=a.history.at(-1);if(a.open!==null||!Array.isArray(a.reveal)||a.reveal.length!==2||!a.reveal.every((v,i)=>v===p?.[i])||a.deck[p[0]]===a.deck[p[1]]||!time(a.hideAt)||a.hideAt<a.started)return false;}else if(a.hideAt!==0)return false;return true;
 }catch{return false;}}
 return {bank,games,limit,cooldown,fresh,used,wait,start,canStart,available,question,answer,cardPool,stories,progress,flip,settle,swap,finish,valid};
};
