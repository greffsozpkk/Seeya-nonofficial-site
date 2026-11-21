'use strict';
// Purely visual room life: no currency, rewards, or saved progress are changed.
module.exports=function({root,sprite,members,practiceOutfit,isTest}){
 // Separate floor lanes leave room for hair, raised arms and labels, even on mobile.
 const homes={br:[22,90],gr:[50,90],yj:[78,90]},names=Object.fromEntries(members.map(m=>[m.id,m.name]));
 const plans={
  br:[['water',19,74],['score',25,80],['stretch',21,86],['hair',24,75],['hum',21,83],['greet',25,85]],
  gr:[['stretch',50,78],['score',48,86],['water',53,76],['hum',50,80],['greet',48,85],['hair',49,74]],
  yj:[['capsule',80,81],['stretch',77,75],['score',79,87],['greet',77,85],['hair',77,75],['hum',80,83]]
 };
 const texts={capsule:'뭐가 나올까?',water:'잠깐 쉬어가요',stretch:'기지개 쭉!',score:'한 번 더 맞춰볼까?',hair:'이 정도면 됐지?',hum:'♪ ♫',greet:''};
 const order=['br','gr','yj'];
 const icons={water:'<path fill="#4079a3" d="M13 3h10v7H13z"/><path fill="#d8f0f5" stroke="#436278" stroke-width="2" d="M10 10h16v30H10z"/><path fill="#79c8e3" d="M12 21h12v16H12z"/>',score:'<path fill="#fff2d0" stroke="#745040" stroke-width="2" d="M2 10h18l4 3 4-3h18v29H28l-4 3-4-3H2z"/><path stroke="#a28165" stroke-width="2" d="M8 17h10M8 23h10M8 29h10M30 17h10M30 23h10M30 29h10"/>',capsule:'<circle cx="23" cy="23" r="14" fill="#f1c1d6" stroke="#74465f" stroke-width="3"/><path fill="#fff0ce" d="M10 23a13 13 0 0 1 26 0z"/><path stroke="#74465f" stroke-width="3" d="M9 23h28"/>'};
 let room=null,raf=0,last=0,elapsed=0,routines=new Map(),paused=false,reactions=new Map(),reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
 function markup(trainee=false){return `<div class="room-residents">${members.map(m=>`<button class="room-actor" data-room-action="touch" data-member="${m.id}" data-pose="idle" style="left:${homes[m.id][0]}%;top:90%" aria-label="${m.name} 반응 보기"><span class="room-emote" aria-hidden="true"></span><span class="room-actor-art">${sprite(m.id,trainee?practiceOutfit:undefined,'room')}</span><span class="room-prop" aria-hidden="true"></span><span class="room-actor-name">${m.name}</span></button>`).join('')}</div>`;}
 function controls(){return `<div class="room-life-controls"><button data-room-action="pause" aria-pressed="${paused||reduced}">${paused||reduced?'일상 동작 켜기':'일상 동작 멈추기'}</button>${isTest?'<button data-room-action="next">다음 일상 보기</button>':''}<span class="room-life-status" role="status" aria-live="polite"></span></div>`;}
 function actor(id){return room?.querySelector(`[data-member="${id}"]`);}
 function pose(id,kind,text=''){const el=actor(id);if(!el)return;if(el.dataset.pose===kind&&el.querySelector('.room-emote').textContent===text)return;el.dataset.pose=kind;el.querySelector('.room-emote').textContent=text;el.querySelector('.room-prop').innerHTML=icons[kind]?`<svg viewBox="0 0 48 48">${icons[kind]}</svg>`:'';}
 function put(id,p){const el=actor(id);if(!el)return;el.style.left=p[0]+'%';el.style.top=p[1]+'%';el.style.zIndex=String(Math.round(p[1]));}
 function resetActor(id){put(id,homes[id]);pose(id,'idle');actor(id)?.classList.remove('capsule-received');}
 function start(id,r){const [kind,x,y]=plans[id][r.sequence%plans[id].length];r.sequence++;r.cycle={kind,at:[x,y],time:0};}
 function greet(id,c){
  const other=id==='gr'?'br':'gr';
  // Do not interrupt a touch response or another exchange. Both stay in their lanes.
  if(reactions.has(other))return;
  c.greetSent=true;
  for(const [who,target,delay,text] of [[id,other,0,'같이 힘내요!'],[other,id,650,'좋아!']]){
   const el=actor(who);el.dataset.greetingSide=homes[target][0]>homes[who][0]?'right':'left';
   el.classList.remove('capsule-received');
   pose(who,delay?'idle':'greet',delay?'':text);
   reactions.set(who,{start:elapsed+delay,until:elapsed+delay+2100,kind:'greet',text});
  }
 }
 function interpolate(points,progress){const t=Math.min(.999999,Math.max(0,progress))*(points.length-1),i=Math.floor(t),u=t-i;return points[i].map((n,k)=>n+(points[i+1][k]-n)*u);}
 function frame(now){raf=0;if(!room?.isConnected)return;const dt=last?Math.min(80,now-last):0;last=now;
  const unavailable=document.hidden||!!root.querySelector('dialog[open]');room.classList.toggle('life-paused',unavailable||paused||reduced);
  let turning=false;
  if(!unavailable&&!paused&&!reduced){elapsed+=dt;for(const [id,r] of reactions){if(elapsed>=r.until){pose(id,'idle');reactions.delete(id);}else if(r.kind&&elapsed>=r.start)pose(id,r.kind,r.text);}
   if(!paused&&!reduced&&!room.classList.contains('is-practicing')){
    for(const [id,r] of routines){
     if(reactions.has(id))continue;
     if(!r.cycle){r.wait-=dt;if(r.wait<=0)start(id,r);}
     if(!r.cycle)continue;
     const c=r.cycle;c.time+=dt;const t=c.time,home=homes[id],walk=r.walk,hold=r.hold;
     const route=[home,[(home[0]+c.at[0])/2,Math.min(home[1],(home[1]+c.at[1])/2+2)],c.at];
     if(t<walk){put(id,interpolate(route,t/walk));pose(id,'walk');}
     else if(t<walk+hold){put(id,c.at);pose(id,c.kind,texts[c.kind]);if(c.kind==='greet'&&!c.greetSent)greet(id,c);if(c.kind==='capsule'){turning=t<walk+hold*.65;actor(id).classList.toggle('capsule-received',!turning);}}
     else if(t<walk*2+hold){actor(id).classList.remove('capsule-received');put(id,interpolate(route.slice().reverse(),(t-walk-hold)/walk));pose(id,'walk');}
     else{resetActor(id);r.cycle=null;r.wait=r.rest;}
    }
   }
  }
  if(!unavailable&&!paused&&!reduced)room.classList.toggle('machine-turning',turning&&!reactions.has('yj'));
  raf=requestAnimationFrame(frame);
 }
 function bind(){cancelAnimationFrame(raf);room=root.querySelector('.studio-room-v2');reactions.clear();last=0;routines=new Map(order.map((id,i)=>[id,{sequence:0,cycle:null,wait:900+i*400,walk:3100+i*400,hold:4300+i*350,rest:1300+i*300}]));if(room){for(const id of order)resetActor(id);raf=requestAnimationFrame(frame);}}
 root.addEventListener('click',e=>{const control=e.target.closest('[data-room-action]');if(!control)return;const action=control.dataset.roomAction;
  if(action==='touch'){const id=control.dataset.member;if(!actor(id))return;if(routines.get(id)?.cycle?.kind==='capsule')room.classList.remove('machine-turning');actor(id).classList.remove('capsule-received');const previous=Number(control.dataset.touches||0);control.dataset.touches=String(previous+1);const kinds=['wave','heart','nod'];pose(id,kinds[previous%3],['반가워요!','♥','함께 연습해요!'][previous%3]);reactions.set(id,{until:elapsed+2400});const status=root.querySelector('.room-life-status');if(status)status.textContent=names[id]+' '+['손 흔들기','하트 인사','고개 끄덕이기'][previous%3];}
  if(action==='pause'){paused=!(paused||reduced);reduced=false;control.textContent=paused?'일상 동작 켜기':'일상 동작 멈추기';control.setAttribute('aria-pressed',String(paused));}
  if(action==='next'){for(const [id,r] of routines){resetActor(id);r.cycle=null;r.wait=0;}room?.classList.remove('machine-turning');reactions.clear();paused=false;reduced=false;const p=root.querySelector('[data-room-action="pause"]');if(p){p.textContent='일상 동작 멈추기';p.setAttribute('aria-pressed','false');}}
 });
 return {markup,controls,bind};
};
