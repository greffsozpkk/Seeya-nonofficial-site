'use strict';
const P=require('../shared/passport');
const SCOPE='https://www.googleapis.com/auth/drive.file',MARKER='seeya-diary-v1',MAX_BYTES=8*1024*1024;
const validClientId=id=>typeof id==='string'&&/^\d+-[a-zA-Z0-9_-]+\.apps\.googleusercontent\.com$/.test(id);
// Credentials live only in this module instance, never in browser storage or URLs.
function create(clientId,env){
 let token='',expires=0,user=null,oauth=null,serial=0;
 const now=()=>env.now?env.now():Date.now();
 const connected=()=>!!token&&now()<expires;
 const disconnect=()=>{serial++;token='';expires=0;user=null;};
 const requireToken=()=>{if(!connected()){disconnect();throw Error('연결 시간이 지났어요. Google 계정을 다시 연결해 주세요.');}return token;};
 async function request(url,options={}){
  const u=new URL(url);if(u.origin!=='https://www.googleapis.com'||!/^\/(?:upload\/)?drive\/v3\//.test(u.pathname))throw Error('지원하지 않는 백업 주소입니다.');
  const usedToken=requireToken(),controller=new AbortController(),timer=setTimeout(()=>controller.abort(),45000);
  try{
   const response=await env.fetch(u.href,{...options,headers:{...options.headers,Authorization:'Bearer '+usedToken},credentials:'omit',cache:'no-store',redirect:'error',signal:controller.signal});
   if(token!==usedToken)throw Error('연결 계정이 바뀌었어요. 다시 시도해 주세요.');
   if(!response.ok){
    if(response.status===401){disconnect();throw Error('연결 시간이 지났어요. Google 계정을 다시 연결해 주세요.');}
    let reason='';try{reason=(await response.json()).error?.errors?.[0]?.reason||'';}catch{}
    if(reason==='storageQuotaExceeded')throw Error('Google Drive 저장 공간이 부족해요. 공간을 확보한 뒤 다시 시도해 주세요.');
    if(response.status===403)throw Error('Google Drive 접근을 허용하지 못했어요. 계정 권한이나 사이트 연결 설정을 확인해 주세요.');
    if(response.status===404)throw Error('백업 파일을 찾지 못했어요. 삭제됐거나 다른 계정의 파일일 수 있어요.');
    if(response.status===429||response.status>=500)throw Error('Google Drive가 잠시 응답하지 않아요. 조금 뒤 다시 시도해 주세요.');
    throw Error('Google Drive 요청을 완료하지 못했어요. 다시 시도해 주세요.');
   }
   return response;
  }catch(e){if(e.name==='AbortError'||e instanceof TypeError)throw Error('인터넷 연결이 끊겼거나 응답이 늦어요. 완료 여부를 목록에서 확인한 뒤 다시 시도해 주세요.');throw e;}finally{clearTimeout(timer);}
 }
 function prepare(google){
  if(!validClientId(clientId))throw Error('Google Drive 연결을 준비 중입니다. 파일 백업을 이용해 주세요.');
  oauth=google.accounts.oauth2;
 }
 function connect(){
  if(!oauth)throw Error('Google 연결 화면을 먼저 준비해 주세요.');
  disconnect();const attempt=serial;
  return new Promise((resolve,reject)=>{
   let settled=false;const finish=(error,value)=>{if(settled)return;settled=true;clearTimeout(timer);error?reject(error):resolve(value);};
   const timer=setTimeout(()=>{if(serial===attempt)disconnect();finish(Error('연결 시간이 길어졌어요. 계정 선택 창을 닫고 다시 연결해 주세요.'));},120000);
   let client;try{client=oauth.initTokenClient({client_id:clientId,scope:SCOPE,include_granted_scopes:false,
    callback:async result=>{
     if(settled||serial!==attempt)return;
     if(result.error||!result.access_token||!oauth.hasGrantedAllScopes(result,SCOPE)){finish(Error('Google Drive 연결이 취소됐거나 저장 권한이 허용되지 않았어요.'));return;}
     token=result.access_token;expires=now()+Math.max(0,Number(result.expires_in)*1000-60000);
     try{const data=await (await request('https://www.googleapis.com/drive/v3/about?fields=user(displayName,emailAddress)')).json();if(settled||serial!==attempt)return;user=data.user;if(!user?.emailAddress)throw Error('연결된 계정을 확인하지 못했어요.');finish(null,{...user});}catch(e){if(serial===attempt)disconnect();finish(e);}
    },error_callback:e=>finish(Error(e.type==='popup_failed_to_open'?'계정 선택 창이 차단됐어요. 팝업을 허용한 뒤 다시 연결해 주세요.':'Google 계정 연결을 취소했어요.'))});}catch{finish(Error('Google 연결 설정을 확인해 주세요.'));return;}
   try{client.requestAccessToken({prompt:'select_account'});}catch{finish(Error('Google 계정 선택 창을 열지 못했어요. 다시 시도해 주세요.'));}
  });
 }
 async function list(pageToken=''){
  const query=new URLSearchParams({q:"trashed = false and 'me' in owners and appProperties has { key='seeyaBackup' and value='"+MARKER+"' }",spaces:'drive',orderBy:'createdTime desc',pageSize:'20',fields:'nextPageToken,files(id,name,createdTime,size,mimeType,appProperties)'});
  if(pageToken)query.set('pageToken',pageToken);
  return (await request('https://www.googleapis.com/drive/v3/files?'+query)).json();
 }
 async function read(file){
  if(!file||!/^[-\w]+$/.test(file.id)||file.mimeType!=='application/json'||file.appProperties?.seeyaBackup!==MARKER)throw Error('다이어리 백업 파일을 선택해 주세요.');
  if(Number(file.size)>MAX_BYTES)throw Error('8MB 이하의 백업만 가져올 수 있어요.');
  const response=await request('https://www.googleapis.com/drive/v3/files/'+encodeURIComponent(file.id)+'?alt=media');
  const blob=await response.blob();if(blob.size>MAX_BYTES)throw Error('8MB 이하의 백업만 가져올 수 있어요.');
  try{return P.validate(JSON.parse(await blob.text()));}catch(e){throw Error('백업 내용을 읽지 못했어요. '+(e instanceof SyntaxError?'파일 형식이 올바르지 않습니다.':e.message));}
 }
 async function backup(state){
  const value=P.validate(state),exportedAt=new Date(now()).toISOString(),data=JSON.stringify({...value,exportedAt},null,2),body=new Blob([data],{type:'application/json'});
  if(body.size>MAX_BYTES)throw Error('백업이 8MB를 넘어요. 파일 내려받기로 보관해 주세요.');
  // Create independent snapshots: an empty or stale device cannot overwrite another backup.
  const metadata={name:'SEEYA-Diary-'+exportedAt.replace(/[:.]/g,'-')+'.json',mimeType:'application/json',appProperties:{seeyaBackup:MARKER,entries:String(value.entries.length),exportedAt}};
  const started=await request('https://www.googleapis.com/upload/drive/v3/files?uploadType=resumable&fields=id,name,createdTime,size,mimeType,appProperties',{method:'POST',headers:{'Content-Type':'application/json; charset=UTF-8','X-Upload-Content-Type':'application/json','X-Upload-Content-Length':String(body.size)},body:JSON.stringify(metadata)});
  const url=started.headers.get('Location');if(!url)throw Error('백업 저장을 시작하지 못했어요.');
  const file=await (await request(url,{method:'PUT',headers:{'Content-Type':'application/json'},body})).json();
  if(!file.id)throw Error('백업 완료를 확인하지 못했어요. 목록에서 확인해 주세요.');
  try{const checked=await read(file);if(JSON.stringify(checked)!==JSON.stringify(value))throw Error('저장된 내용이 다릅니다.');}catch{throw Error('백업 파일은 전송했지만 내용 확인을 마치지 못했어요. 백업 목록에서 다시 확인해 주세요.');}
  return {file,exportedAt,count:value.entries.length};
 }
 return {prepare,connect,disconnect,connected,account:()=>connected()?user:null,list,read,backup};
}
module.exports={create,validClientId,SCOPE,MARKER,MAX_BYTES};
