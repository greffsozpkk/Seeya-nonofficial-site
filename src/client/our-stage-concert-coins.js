'use strict';
// One ephemeral show session. The existing save/lock path owns wallet updates.
module.exports=function({root,award,allowed,remaining=()=>Infinity,dailyLimit=30,now=()=>performance.now(),random=Math.random,setTimer=setTimeout,clearTimer=clearTimeout}){
 const limit=12,lifetime=3500,places=[[10,20],[30,13],[50,16],[72,13],[90,20],[10,51],[90,51],[20,70],[80,70]];
 let total=0,spawned=0,serial=0,stage=null,layer=null,active=null,task=null,end=0,pausedAt=null,lastPlace=-1;
 const $=q=>root.querySelector(q);
 function cancel(){if(task)clearTimer(task.id);task=null;}
 function later(fn,ms){cancel();task={fn,due:now()+ms,id:setTimer(()=>{task=null;fn();},ms)};}
 function clearStage(){cancel();layer?.remove();layer=null;stage=null;active=null;pausedAt=null;}
 function begin(){clearStage();total=0;spawned=0;serial++;lastPlace=-1;}
 function dailyText(){const left=Math.max(0,Math.min(dailyLimit,remaining()));return '오늘 모은 코인 '+(dailyLimit-left)+' / '+dailyLimit+'개 · 더 얻을 수 있는 코인 '+left+'개'+(left===0?' — 오늘 코인을 전부 모았어요! 내일 다시 만나요.':'');}
 function dailyMarkup(){const left=Math.max(0,Math.min(dailyLimit,remaining()));return '<span>오늘 모음 <b>'+(dailyLimit-left)+' / '+dailyLimit+'코인</b></span><span>추가 획득 가능 <b>'+left+'코인</b></span>'+(left===0?'<strong class="concert-coin-complete">오늘 코인을 전부 모았어요!<br>내일 다시 만나요.</strong>':'');}
 function update(){const n=$('#concertCoinCount');if(n)n.textContent=String(total);const d=$('#concertCoinDaily');if(d)d.innerHTML=dailyMarkup();}
 function schedule(delay=1300+random()*1900){if(!stage?.isConnected||spawned>=limit||remaining()<=0||now()+delay+lifetime>end)return;later(spawn,delay);}
 function expire(){active=null;layer?.replaceChildren();schedule();}
 function spawn(){update();if(remaining()<=0||!allowed()||!stage?.isConnected||pausedAt!==null)return;
  let place=Math.floor(random()*places.length);if(place===lastPlace)place=(place+1)%places.length;lastPlace=place;
  const [x,y]=places[place],id=String(++serial);spawned++;
  const coin=document.createElement('button');coin.type='button';coin.className='concert-coin';coin.dataset.action='concert-coin';coin.dataset.value=id;coin.setAttribute('aria-label','보너스 1코인 받기');coin.style.left=x+'%';coin.style.top=y+'%';
  coin.innerHTML='<svg viewBox="0 0 24 24" aria-hidden="true" shape-rendering="crispEdges"><path fill="#794a26" d="M6 1h12v3h3v3h2v11h-3v3H5v-3H2V6h4z"/><path fill="#f5bc48" d="M7 3h10v2h3v13h-3v2H7v-2H4V6h3z"/><path fill="#ffed9c" d="M7 5h10v2H7zM6 7h2v9H6z"/><path fill="#b7742d" d="M11 7h3v10h-3v-7H9V8h2z"/></svg>';
  layer.replaceChildren(coin);active={id,coin,expires:now()+lifetime};later(expire,lifetime);
 }
 function mount(target,duration,entrance=0){clearStage();stage=target;end=now()+duration;if(!stage)return;
  layer=document.createElement('div');layer.className='concert-coin-layer';stage.append(layer);update();
  schedule(entrance+(duration-entrance<=4000?300+random()*150:650+random()*650));
 }
 function claim(id){if(!active||active.id!==id||pausedAt!==null||!allowed()||!stage?.isConnected||now()>=active.expires)return false;
  const coin=active.coin;active=null;cancel();coin.disabled=true;
  // Consume before saving: repeated taps and a delayed queued click cannot pay twice.
  if(!award()){layer?.replaceChildren();update();return false;}
  total++;coin.className='concert-coin concert-coin-earned';coin.removeAttribute('data-action');coin.setAttribute('aria-label','1코인을 받았어요');coin.innerHTML='<span>+1</span>';update();
  const status=$('#concertCoinStatus');if(status)status.textContent='1코인을 받았어요. 이번 공연 '+total+'코인. '+dailyText();
  schedule();return true;
 }
 function pause(value){if(value&&pausedAt===null){pausedAt=now();if(task){task.remaining=Math.max(0,task.due-now());clearTimer(task.id);}if(layer)layer.hidden=true;}
  else if(!value&&pausedAt!==null){const elapsed=now()-pausedAt;end+=elapsed;if(active)active.expires+=elapsed;pausedAt=null;if(layer)layer.hidden=false;if(task){const {fn,remaining}=task;later(fn,remaining);}}
 }
 function counter(){return '<p class="concert-coin-counter">이번 공연 <b id="concertCoinCount">'+total+'</b>코인 <small>반짝이는 코인을 누르면 +1</small></p><p id="concertCoinDaily" class="concert-coin-daily">'+dailyMarkup()+'</p><span id="concertCoinStatus" class="concert-accessible-title" role="status"></span>';}
 function summary(){return total?'<p class="concert-coin-result">공연 중 모은 보너스 <strong>'+total+'코인</strong>을 지갑에 담았어요.</p><p class="concert-coin-daily">'+dailyMarkup()+'</p>':'<p class="concert-coin-daily">'+dailyMarkup()+'</p>';}
 return {begin,mount,claim,pause,clearStage,counter,summary};
};
