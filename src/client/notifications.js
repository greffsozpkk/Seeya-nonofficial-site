'use strict';
const API='https://seeya-notifications.seeya-push-test.workers.dev/api/';
const $=id=>document.getElementById('push'+id),storage='seeya-notifications-token-v1';
let token='',config,reg,sub,busy=false,selected,lastTime='09:00';
try{token=localStorage.getItem(storage)||'';}catch{}
const ios=/iPad|iPhone|iPod/.test(navigator.userAgent)||(navigator.platform==='MacIntel'&&navigator.maxTouchPoints>1),installed=matchMedia('(display-mode: standalone)').matches||navigator.standalone;
const supported=isSecureContext&&'serviceWorker'in navigator&&'PushManager'in window&&'Notification'in window&&(!ios||installed);
for(let m=0;m<1440;m+=30){const o=document.createElement('option');o.value=String(Math.floor(m/60)).padStart(2,'0')+':'+String(m%60).padStart(2,'0');o.textContent=o.value;$('Time').append(o);}$('Time').value=lastTime;
function say(text,error=false){$('Status').textContent=text;$('Status').classList.toggle('error',error);}
function saveToken(value){token=value;try{if(value)localStorage.setItem(storage,value);else localStorage.removeItem(storage);}catch{throw Error('구독 연결을 저장하지 못했어요. 브라우저의 사이트 저장 공간을 허용해 주세요.');}}
function controls(){const connected=!!(sub&&token);$('Subscribe').hidden=connected;$('Subscribe').disabled=busy||!supported||!config;$('Time').disabled=busy||!supported||!config;$('DailyWrap').hidden=!connected;$('Daily').disabled=busy;$('Unsubscribe').hidden=!sub&&!token;$('Unsubscribe').disabled=busy;$('Test').disabled=busy||!connected||!selected?.payload;$('Refresh').disabled=busy;}
async function api(path,data){const r=await fetch(API+path,{method:'POST',credentials:'omit',headers:{'Content-Type':'application/json',...(token?{Authorization:'Bearer '+token}:{})},body:JSON.stringify(data||{}),signal:AbortSignal.timeout(15000)});const d=await r.json();if(!r.ok){if(r.status===401){token='';try{localStorage.removeItem(storage);}catch{}}throw Error(d.error||'알림 연결을 확인하지 못했어요.');}return d;}
async function action(fn){if(busy)return;busy=true;controls();try{await fn();}catch(e){say(e.name==='TimeoutError'?'연결이 늦어지고 있어요. 잠시 뒤 다시 확인해 주세요.':e instanceof TypeError?'알림 서버에 연결하지 못했어요. 인터넷 연결을 확인한 뒤 다시 눌러 주세요.':e.message,true);}finally{busy=false;controls();}}
const decode=s=>Uint8Array.from(atob(s.replace(/-/g,'+').replace(/_/g,'/')+'='.repeat((4-s.length%4)%4)),c=>c.charCodeAt(0));
async function refresh(){
 $('Install').hidden=!ios||!!installed;$('Environment').textContent=ios&&!installed?'아이폰은 홈 화면에 추가한 앱에서 신청할 수 있어요.':!supported?'이 환경에서는 웹 푸시를 지원하지 않아요. 지원하는 브라우저나 설치한 웹 앱에서 확인해 주세요.':Notification.permission==='denied'?'알림이 차단되어 있어요. 기기 또는 브라우저 설정에서 씨야 아카이브의 알림을 허용해 주세요.':'원할 때만 알림을 신청하고, 언제든 해제할 수 있어요.';
 const r=await fetch(API+'config',{credentials:'omit',cache:'no-store',signal:AbortSignal.timeout(15000)});if(!r.ok)throw Error('알림 서버에 연결하지 못했어요. 잠시 뒤 다시 확인해 주세요.');config=await r.json();
 selected=config.previews.find(p=>p.key==='today'&&p.payload)||config.previews.find(p=>p.payload);
 $('Title').textContent=selected?.payload?.title||'오늘 등록된 일정이 없어요.';$('Body').textContent=selected?.payload?.body||'';$('PreviewNote').textContent=selected?.key==='today'?'오늘의 확정 일정을 사용합니다.':selected?'오늘은 일정이 없어 '+selected.date+'의 실제 일정을 예시로 보여드려요.':'일정이 없는 날에는 알림을 보내지 않아요.';$('Link').href=selected?.payload?.url||'/calendar/';

 if(supported){reg=await navigator.serviceWorker.register('/about/notifications/sw.js',{scope:'/about/notifications/',updateViaCache:'none'});if(!reg.active)await new Promise((resolve,reject)=>{const worker=reg.installing||reg.waiting,timer=setTimeout(()=>reject(Error('알림 준비가 늦어져요. 잠시 뒤 다시 확인해 주세요.')),15000);function check(){if(reg.active||worker?.state==='activated'){clearTimeout(timer);resolve();}else if(worker?.state==='redundant'){clearTimeout(timer);reject(Error('알림 준비에 실패했어요.'));}}worker?.addEventListener('statechange',check);check();});sub=await reg.pushManager.getSubscription();}
 if(sub&&token){const d=await api('status');$('Daily').checked=d.daily;lastTime=d.dailyTime;$('Time').value=lastTime;say(d.expired?'알림 연결이 만료됐어요. 해제 후 다시 신청해 주세요.':d.lastResult||(d.daily?'일정이 있는 날 '+lastTime+'에 알려드릴게요.':'자동 알림이 일시 중지되어 있어요.'),d.expired);}else say('받을 시간을 고른 뒤 알림을 신청해 주세요.');
}
$('Subscribe').onclick=()=>action(async()=>{
 say('기기의 알림 허용 창에서 허용을 선택해 주세요.');const permission=await Notification.requestPermission();if(permission!=='granted')throw Error('알림이 허용되지 않았어요. 기기·브라우저 설정에서 변경할 수 있어요.');
 if(!reg?.active)throw Error('알림을 준비 중이에요. 잠시 뒤 다시 눌러주세요.');if(sub&&!token){await sub.unsubscribe();sub=null;}
 sub=sub||await reg.pushManager.subscribe({userVisibleOnly:true,applicationServerKey:decode(config.publicKey)});const d=await api('subscribe',{subscription:sub.toJSON()});saveToken(d.token);
 await api('daily',{enabled:true,time:$('Time').value});lastTime=$('Time').value;$('Daily').checked=true;say('신청했어요. 일정이 있는 날 '+lastTime+'에 알려드릴게요. 테스트 알림도 받아보세요.');
});
$('Unsubscribe').onclick=()=>action(async()=>{if(token){try{await api('unsubscribe');}catch(e){if(token)throw e;}}if(sub)await sub.unsubscribe();sub=null;saveToken('');$('Daily').checked=false;say('이 기기의 알림 신청과 서버 구독 정보를 삭제했어요.');});
function preference(toggle){if(!token){lastTime=$('Time').value;return;}const enabled=$('Daily').checked;action(async()=>{try{await api('daily',{enabled,time:$('Time').value});lastTime=$('Time').value;say(enabled?'일정이 있는 날 '+lastTime+'에 알려드릴게요.':'자동 알림을 일시 중지했어요.');}catch(e){if(toggle)$('Daily').checked=!enabled;$('Time').value=lastTime;throw e;}});}
$('Time').onchange=()=>preference(false);$('Daily').onchange=()=>preference(true);
$('Test').onclick=()=>action(async()=>{await api('test',{kind:'preview',ticket:selected.ticket});say('약 15초 뒤 위 미리보기 내용으로 발송합니다. 화면을 닫거나 잠가보세요.');});
$('Refresh').onclick=()=>action(refresh);window.addEventListener('pageshow',()=>{if(config&&!busy)action(refresh);});action(refresh);
