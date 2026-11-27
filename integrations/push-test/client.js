'use strict';
const $=id=>document.getElementById(id),base=new URL('./',location.href),tokenKey='seeya-push-test-token:'+base.pathname;
let token='',config,reg,sub,busy=false,savedTime='09:00';
for(let minute=0;minute<1440;minute+=30){const option=document.createElement('option');option.value=String(Math.floor(minute/60)).padStart(2,'0')+':'+String(minute%60).padStart(2,'0');option.textContent=option.value;$('dailyTime').append(option);}$('dailyTime').value=savedTime;
try{token=localStorage.getItem(tokenKey)||'';}catch{}
function status(text,error=false){$('status').textContent=text;$('status').classList.toggle('error',error);}
const ios=/iPad|iPhone|iPod/.test(navigator.userAgent)||(navigator.platform==='MacIntel'&&navigator.maxTouchPoints>1);
const standalone=matchMedia('(display-mode: standalone)').matches||navigator.standalone;
const supported=isSecureContext&&'serviceWorker'in navigator&&'PushManager'in window&&'Notification'in window&&(!ios||standalone);
async function api(route,data){const res=await fetch(new URL('api/'+route,base),{method:'POST',headers:{'Content-Type':'application/json',...(token?{Authorization:'Bearer '+token}:{})},body:JSON.stringify(data||{})});let result;try{result=await res.json();}catch{throw Error('서버 연결이 끊겼어요. 테스트 서버가 켜져 있는지 확인해 주세요.');}if(!res.ok){if(res.status===401)tokenSave('');throw Error(result.error||'서버 요청에 실패했어요.');}return result;}
function controls(){const connected=!!(sub&&token);$('connection').textContent=connected?'알림 신청됨':'신청 전';$('subscribe').disabled=busy||!supported||!config||connected;$('subscribe').textContent=connected?'알림 신청 완료':'알림 받기';$('unsubscribe').hidden=!sub&&!token;$('unsubscribe').disabled=busy;for(const id of['test','today','daily','dailyTime','sendPreview'])$(id).disabled=busy||!connected;$('refresh').disabled=busy;if(!config?.events.length)$('today').disabled=true;if(!config?.previews?.find(p=>p.key===$('previewKind').value)?.payload){$('sendPreview').disabled=true;$('test').disabled=true;}}
function preview(){const p=config?.previews?.find(p=>p.key===$('previewKind').value);$('previewNote').textContent=p?(p.key==='today'?'오늘의 확정 일정 기준입니다.':'실제 아카이브의 '+p.date+' 일정 중 '+p.events.length+'개를 사용한 예시입니다. 오늘 일정이 아닙니다.') :'';$('previewTitle').textContent=p?.payload?.title||'오늘은 일정 알림을 보내지 않아요.';$('testTitle').textContent=p?.payload?.title||'먼저 알림 구성을 선택해 주세요.';$('testBody').textContent=p?.payload?.body||'';$('previewBody').textContent=p?.payload?.body||'등록된 확정 일정이 없습니다. 다른 구성을 선택하면 알림 형식을 확인할 수 있어요.';$('previewLink').hidden=!p?.payload;if(p?.payload){$('previewLink').href=p.payload.url;$('previewLink').textContent=p.events.length===1?'누르면 이 일정의 상세 내용이 열려요 ↗':'누르면 '+p.date+'의 일정 목록이 열려요 ↗';}controls();}
function tokenSave(value){token=value;try{if(value)localStorage.setItem(tokenKey,value);else localStorage.removeItem(tokenKey);}catch{status('기기 저장 공간을 사용할 수 없어 새로 열 때 다시 연결해야 할 수 있어요.',true);}}
function keyBytes(s){return Uint8Array.from(atob(s.replace(/-/g,'+').replace(/_/g,'/')+'='.repeat((4-s.length%4)%4)),c=>c.charCodeAt(0));}
async function refresh(){
 const res=await fetch(new URL('api/config',base),{cache:'no-store'});if(!res.ok)throw Error('테스트 서버에 연결하지 못했어요.');config=await res.json();$('date').textContent=config.date.replaceAll('-','.');$('events').replaceChildren();
 if(!config.events.length){const p=document.createElement('p');p.className='empty';p.textContent='오늘 등록된 확정 일정이 없어요.\n아침 자동 알림도 발송하지 않습니다. 테스트 알림은 받아볼 수 있어요.';$('events').append(p);}
 for(const e of config.events){const article=document.createElement('article');article.className='event';const t=document.createElement('time');t.textContent=e.time||'시간 미정';const h=document.createElement('strong');h.textContent=e.title;article.append(t,h);$('events').append(article);}
 const selection=$('previewKind').value;$('previewKind').replaceChildren();for(const p of config.previews||[]){const option=document.createElement('option');option.value=p.key;option.textContent=p.label;$('previewKind').append(option);}if(config.previews?.some(p=>p.key===selection))$('previewKind').value=selection;else if(!config.events.length&&config.previews?.some(p=>p.payload))$('previewKind').value=config.previews.find(p=>p.payload).key;preview();
 $('hostingNote').textContent=config.mode==='cloud'?'PC를 꺼도 클라우드에서 발송합니다.':'로컬 테스트 서버가 켜져 있을 때만 발송합니다.';$('sourceNote').textContent=config.mode==='cloud'?'공개 사이트의 최신 캘린더를 확인합니다. 취소·미확정 일정은 제외합니다.':'현재 로컬 캘린더 기준입니다. 취소·미확정 일정은 제외합니다.';$('serverNote').textContent=config.mode==='cloud'?'클라우드에서 약 15초 뒤 발송합니다. 지연 시 1분 간격으로 대기 중인 알림을 확인합니다.':'임시 주소나 서버가 종료되면 테스트도 멈춥니다.';
 $('install').hidden=!ios||!!standalone;
 $('environment').textContent=!isSecureContext?'휴대전화에서는 HTTPS 테스트 주소로 접속해 주세요.':ios&&!standalone?'홈 화면에 추가한 앱에서 알림을 신청할 수 있어요.':!supported?'이 브라우저에서는 웹 푸시를 지원하지 않아요. Safari 또는 Chrome에서 확인해 주세요.':Notification.permission==='denied'?'알림이 차단되어 있어요. 브라우저 또는 휴대전화 설정에서 이 사이트의 알림을 허용해 주세요.':'알림을 허용하면 이 기기로 테스트 메시지를 받을 수 있어요.';
 if(supported){reg=await navigator.serviceWorker.register(new URL('sw.js',base),{scope:base.pathname,updateViaCache:'none'});if(!reg.active)await new Promise((resolve,reject)=>{const worker=reg.installing||reg.waiting;const timer=setTimeout(()=>reject(Error('알림 준비 시간이 초과됐어요. 새로고침해 주세요.')),15000);function check(){if(reg.active||worker?.state==='activated'){clearTimeout(timer);resolve();}else if(worker?.state==='redundant'){clearTimeout(timer);reject(Error('알림 준비에 실패했어요.'));}}worker?.addEventListener('statechange',check);check();});sub=await reg.pushManager.getSubscription();}
 if(sub&&token){try{const s=await api('status');$('daily').checked=s.daily;savedTime=s.dailyTime||'09:00';$('dailyTime').value=savedTime;status(s.expired?'구독이 만료됐어요. 해제 후 다시 신청해 주세요.':s.lastResult||'연결됐어요. 테스트 알림을 받아보세요.',s.expired);}catch(e){status(e.message,true);}}else status('알림을 신청한 뒤 테스트 버튼을 눌러보세요.');controls();
}
async function action(fn){if(busy)return;busy=true;controls();try{await fn();}catch(e){status(e.message,true);}finally{busy=false;controls();}}
$('subscribe').onclick=()=>action(async()=>{
 // Permission must be requested directly within the user's button gesture on iOS.
 const permission=await Notification.requestPermission();if(permission!=='granted')throw Error('알림이 허용되지 않았어요. 기기 설정에서 허용한 뒤 다시 시도해 주세요.');
 if(!reg?.active)throw Error('알림을 준비 중이에요. 잠시 뒤 다시 눌러주세요.');
 if(sub&&!token){await sub.unsubscribe();sub=null;}
 sub=sub||await reg.pushManager.subscribe({userVisibleOnly:true,applicationServerKey:keyBytes(config.publicKey)});
 const r=await api('subscribe',{subscription:sub.toJSON()});tokenSave(r.token);status('알림 신청이 완료됐어요. 아래에서 테스트해보세요.');
});
$('unsubscribe').onclick=()=>action(async()=>{if(token){try{await api('unsubscribe');}catch(e){if(token)throw e;}}if(sub)await sub.unsubscribe();sub=null;tokenSave('');$('daily').checked=false;status('이 기기의 구독 정보와 예약된 테스트 알림을 삭제했어요.');});
async function sendSelectedPreview(){const selected=config?.previews?.find(p=>p.key===$('previewKind').value);if(!selected?.payload)throw Error('알림 구성을 먼저 선택해 주세요.');await api('test',{kind:'preview',preview:selected.key,ticket:selected.ticket});status('약 15초 뒤 미리보기 내용으로 알림을 보냅니다. 화면을 닫거나 잠가보세요.');}
$('test').onclick=()=>action(sendSelectedPreview);
$('today').onclick=()=>action(async()=>{const r=await api('test',{kind:'today'});status(r.empty?'오늘 일정이 없어 발송하지 않았어요.':'약 15초 뒤 오늘 일정 알림을 보냅니다.');});
function savePreference(toggle=false){const enabled=$('daily').checked,time=$('dailyTime').value;action(async()=>{try{await api('daily',{enabled,time});savedTime=time;status(enabled?time+' 알림을 설정했어요. 오늘 일정이 있을 때 하루 한 번 발송합니다.':'자동 알림은 꺼져 있어요. 선택한 시간 '+time+'은 저장했습니다.');}catch(e){if(toggle)$('daily').checked=!enabled;$('dailyTime').value=savedTime;throw e;}});}
$('daily').onchange=()=>savePreference(true);$('dailyTime').onchange=()=>savePreference();
$('previewKind').onchange=preview;
$('sendPreview').onclick=()=>action(sendSelectedPreview);
$('refresh').onclick=()=>action(refresh);
window.addEventListener('pageshow',()=>{if(config&&!busy)action(refresh);});
action(refresh);
