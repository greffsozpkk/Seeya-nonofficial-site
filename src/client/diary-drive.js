'use strict';
const P=require('../shared/passport'),API=require('./diary-drive-api'),config=require('../data/diary-drive.json');
const service=API.create(config.clientId,{fetch:(...args)=>fetch(...args)}),E=P.esc;
let ready=false,loading=null,busy=false,notice='',files=[],next='',listed=false;
const listeners=new Set(),refresh=()=>listeners.forEach(fn=>fn());
const dateLabel=value=>{const d=new Date(value);return Number.isFinite(d.getTime())?d.toLocaleString('ko-KR'):'날짜 확인 필요';};
function loadGoogle(){
 if(window.google?.accounts?.oauth2)return Promise.resolve(window.google);
 if(loading)return loading;
 loading=new Promise((resolve,reject)=>{const script=document.createElement('script');script.src='https://accounts.google.com/gsi/client';script.async=true;script.referrerPolicy='no-referrer';let done=false;const finish=error=>{if(done)return;done=true;clearTimeout(timer);if(error){script.remove();loading=null;reject(error);}else resolve(window.google);};const timer=setTimeout(()=>finish(Error('Google 연결 화면을 불러오지 못했어요. 인터넷 연결을 확인해 주세요.')),15000);script.onload=()=>finish(window.google?.accounts?.oauth2?null:Error('Google 연결을 준비하지 못했어요.'));script.onerror=()=>finish(Error('Google 연결 화면을 불러오지 못했어요. 인터넷 연결을 확인해 주세요.'));document.head.append(script);});
 return loading;
}
function mount(root,{getState,onRestore,onRestoreStart,onBackedUp}){
 const configured=API.validClientId(config.clientId);
 function render(){
  if(!root.isConnected)return;
  const account=service.account();let last=null;try{last=JSON.parse(localStorage.getItem('seeya-diary-drive-last')||'null');}catch{}
  root.innerHTML=`<section class="pp-panel pp-drive"><div class="pp-drive-heading"><span class="pp-label">MY PRIVATE BACKUP</span><span class="pp-drive-badge">${!configured?'연결 준비 중':account?'연결됨':'선택 기능'}</span></div><h2>Google Drive에 백업</h2><p>내 구글 드라이브에 다이어리를 보관하고, 다른 기기에서도 백업을 불러올 수 있어요.</p><p class="pp-help">신분 카드와 모든 기록을 저장합니다. 메모·좌석·동행인·구매 금액도 포함돼요. 사진과 이미지 편집 초안은 포함되지 않습니다.</p>${!configured?'<div class="pp-drive-note">구글 연결을 준비하고 있어요. 지금은 아래의 파일 백업을 이용해 주세요.</div><button disabled>Google Drive 연결 준비 중</button>':`<div class="pp-drive-account">${account?`<b>${E(account.emailAddress)}</b><span>이 계정의 내 드라이브에 저장합니다.</span>`:'구글 연결은 선택 사항입니다. 연결하지 않아도 다이어리를 사용할 수 있어요.'}</div><div class="pp-actions">${account?`<button data-drive="backup" class="pp-primary" ${busy?'disabled':''}>지금 백업 (${getState().entries.length}개 기록)</button><button data-drive="list" ${busy?'disabled':''}>백업 목록 보기</button><button data-drive="disconnect" ${busy?'disabled':''}>이 창 연결 해제</button>`:`<button data-drive="connect" class="pp-primary" ${busy?'disabled':''}>${ready?'Google 계정 선택':'Google Drive 연결'}</button>`}</div>`}<p class="pp-drive-status" role="status" aria-live="polite">${E(notice)}</p>${last?`<p class="pp-help">이 브라우저에서 마지막 백업 성공: ${E(dateLabel(last.at))} · ${Number(last.count)||0}개 기록</p>`:''}<p class="pp-help">버튼을 눌러 백업한 시점의 기록을 날짜별 새 파일로 보관합니다. 자동 백업·기기 간 자동 동기화는 하지 않습니다. 새로고침하거나 연결 시간이 지나면 다시 연결해 주세요.</p><details class="pp-drive-details"><summary>백업과 개인정보 안내</summary><p>연결한 계정에 저장하며 사이트 운영자에게 기록을 보내지 않습니다. 백업 파일은 자동으로 공유하지 않습니다. 개인 Drive에서 파일을 직접 공유하면 그 파일의 내용도 상대방에게 전달됩니다.</p><p>이 창 연결 해제는 구글 계정 로그아웃이나 백업 삭제가 아닙니다. 접근 권한은 <a href="https://myaccount.google.com/connections" target="_blank" rel="noopener noreferrer">Google 계정의 연결 관리</a>에서 취소할 수 있어요.</p><p><a href="/diary/privacy/">다이어리 개인정보 처리 안내</a></p></details>${account&&listed?`<div class="pp-drive-files"><h3>백업 목록</h3><p class="pp-help">이 사이트에서 해당 계정에 만든 백업을 최신순으로 표시해요. 예전 백업은 자동 삭제하지 않습니다. 불필요한 파일은 내 Drive에서 정리해 주세요.</p>${files.length?files.map((file,i)=>`<div class="pp-drive-file"><div><strong>${E(dateLabel(file.createdTime))}</strong><span>${E(file.appProperties?.entries||'?')}개 기록 · ${E(file.name)}</span></div><button data-drive="restore" data-index="${i}" ${busy?'disabled':''}>내용 확인</button></div>`).join(''):'<p>저장된 백업이 아직 없어요. 지금 백업으로 첫 기록을 보관해 보세요.</p>'}${next?`<button data-drive="more" ${busy?'disabled':''}>이전 백업 더 보기</button>`:''}</div>`:''}</section>`;
 }
 listeners.add(render);render();
 async function act(ev){
  const button=ev.target.closest('[data-drive]');if(!button||busy)return;
  const action=button.dataset.drive;
  if(action==='disconnect'){service.disconnect();files=[];next='';listed=false;notice='이 창의 연결을 해제했어요. 기록과 Drive 백업은 그대로 남아 있습니다.';refresh();return;}
  if(navigator.onLine===false){notice='인터넷에 연결한 뒤 이용해 주세요. 기기에 저장한 기록은 그대로예요.';refresh();return;}
  const selected=files[Number(button.dataset.index)];busy=true;notice=action==='backup'?'백업 파일을 저장하고 내용을 확인하고 있어요. 이 창을 닫지 마세요.':'불러오는 중이에요.';
  // The OAuth popup must be requested synchronously from the account-selection click.
  let connection;if(action==='connect'&&ready){try{connection=service.connect();}catch(e){connection=Promise.reject(e);}}
  refresh();
  try{
   if(action==='connect'){
    if(!ready){service.prepare(await loadGoogle());ready=true;notice='준비됐어요. ‘Google 계정 선택’을 눌러 연결해 주세요.';}
    else{await connection;files=[];next='';listed=false;notice='계정을 연결했어요. 지금 백업하거나 기존 백업 목록을 확인해 주세요.';}
   }else if(action==='backup'){
    const snapshot=P.validate(getState()),result=await service.backup(snapshot);
    try{localStorage.setItem('seeya-diary-drive-last',JSON.stringify({at:result.exportedAt,count:result.count}));}catch{}
    onBackedUp(snapshot);notice=`${result.count}개 기록을 백업하고 저장 내용을 확인했어요.`;
    files=[];next='';listed=false;
   }else if(action==='list'||action==='more'){
    const result=await service.list(action==='more'?next:'');files=action==='more'?[...files,...(result.files||[])]:result.files||[];next=result.nextPageToken||'';listed=true;notice='백업을 선택하면 적용 전에 내용을 확인할 수 있어요.';
   }else if(action==='restore'){
    const requestId=onRestoreStart();const value=await service.read(selected);
    if(root.isConnected){notice=onRestore(value,selected.name,requestId)===false?'다른 백업 선택으로 이번 복원 확인을 취소했어요.':'아래 복원 확인란에서 내용을 확인하고 적용해 주세요.';}
    else notice='백업 내용을 읽었지만 화면을 이동하여 복원 확인을 취소했어요. 다시 선택해 주세요.';
   }
  }catch(e){notice=e.message||'요청을 완료하지 못했어요. 기존 기록은 바뀌지 않았습니다.';if(!service.connected()){files=[];next='';listed=false;}}
  finally{busy=false;refresh();}
 }
 root.addEventListener('click',act);
 return ()=>{listeners.delete(render);root.removeEventListener('click',act);};
}
module.exports={mount};
