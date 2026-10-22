// Generated Code.gs includes this adapter, shared bracket rules and candidate IDs.
// Set Script Properties: SPREADSHEET_ID, ENVIRONMENT=test (use another project/sheet for production).
function setupWorldcup() {
  var props=PropertiesService.getScriptProperties();
  if(!props.getProperty('ENVIRONMENT'))props.setProperty('ENVIRONMENT','test');
  if(!props.getProperty('TOKEN_SECRET'))props.setProperty('TOKEN_SECRET',Utilities.getUuid()+Utilities.getUuid()+Utilities.getUuid());
  var book=SpreadsheetApp.openById(props.getProperty('SPREADSHEET_ID'));
  [['Sessions',['id','clientHash','requestId','collection','version','mode','issued','expires','game']],['Results',['id','collection','version','mode','winner','acceptedAt','excluded','reason']]].forEach(function(spec){
    var sheet=book.getSheetByName(spec[0])||book.insertSheet(spec[0]);
    if(sheet.getLastRow()===0){sheet.appendRow(spec[1]);sheet.setFrozenRows(1);}
    else if(JSON.stringify(sheet.getRange(1,1,1,spec[1].length).getValues()[0])!==JSON.stringify(spec[1]))throw Error('시트 열 이름이 맞지 않습니다: '+spec[0]);
  });
  SpreadsheetApp.flush();
  return '준비 완료: '+props.getProperty('ENVIRONMENT');
}
function bytesHex_(a){return a.map(function(b){return ('0'+((b+256)%256).toString(16)).slice(-2);}).join('');}
function constantEqual_(a,b){if(typeof b!=='string'||a.length!==b.length)return false;var n=0;for(var i=0;i<a.length;i++)n|=a.charCodeAt(i)^b.charCodeAt(i);return n===0;}
function context_(forceCatalog){
 var props=PropertiesService.getScriptProperties(),environment=props.getProperty('ENVIRONMENT'),secret=props.getProperty('TOKEN_SECRET');
 if(!['test','production'].includes(environment)||!secret)throw Error('먼저 setupWorldcup을 실행해 주세요.');
 var book=SpreadsheetApp.openById(props.getProperty('SPREADSHEET_ID')),ss=book.getSheetByName('Sessions'),rs=book.getSheetByName('Results');
 if(!ss||!rs)throw Error('통계 시트가 준비되지 않았습니다.');
 function values(sheet,n){return sheet.getLastRow()<2?[]:sheet.getRange(2,1,sheet.getLastRow()-1,n).getValues();}
 var sessions=values(ss,9).map(function(r){return {id:r[0],client:r[1],requestId:r[2],collection:r[3],version:r[4],size:r[5],issued:Number(r[6]),expires:Number(r[7]),game:JSON.parse(r[8])};});
 var results=values(rs,8).map(function(r){return {id:r[0],collection:r[1],version:r[2],size:r[3],winner:r[4],at:r[5] instanceof Date?r[5].toISOString():String(r[5]),excluded:r[6]===true||String(r[6]).toLowerCase()==='true',reason:String(r[7]||'')};});
 function sign(id){return bytesHex_(Utilities.computeHmacSha256Signature(environment+'|'+id,secret));}
 var repo={
  paused:function(id){return (props.getProperty('PAUSED_COLLECTIONS')||'').split(',').map(function(s){return s.trim();}).includes(id);},
  request:function(client,id){return sessions.find(function(s){return s.client===client&&s.requestId===id;});},
  usage:function(client,now){return {hour:sessions.filter(function(s){return s.client===client&&s.issued>now-3600000;}).length,day:sessions.filter(function(s){return s.client===client&&s.issued>now-86400000;}).length,globalDay:sessions.filter(function(s){return s.issued>now-86400000;}).length};},
  session:function(id){return sessions.find(function(s){return s.id===id;});},
  result:function(id){return results.find(function(r){return r.id===id;});},
  results:function(){return results;},
  addSession:function(s){if(sessions.length>=10000)throw Error('발급 기록 정리가 필요합니다.');ss.appendRow([s.id,s.client,s.requestId,s.collection,s.version,s.size,s.issued,s.expires,JSON.stringify(s.game)]);SpreadsheetApp.flush();sessions.push(s);},
  addResult:function(r){if(results.length>=50000)throw Error('통계 저장 용량 점검이 필요합니다.');rs.appendRow([r.id,r.collection,r.version,r.size,r.winner,r.at,false,'']);SpreadsheetApp.flush();results.push(r);}
 };
 var catalog=loadCatalog_(book,forceCatalog);return {book:book,catalog:catalog,service:WorldcupStats.createService(catalog,repo,{environment:environment,now:Date.now,uuid:Utilities.getUuid,random:Math.random,sign:sign,hash:function(s){return bytesHex_(Utilities.computeHmacSha256Signature('client|'+s,secret));},verify:function(id,token){return constantEqual_(sign(id),token);}})};
}
function json_(x){return ContentService.createTextOutput(JSON.stringify(x)).setMimeType(ContentService.MimeType.JSON);}
function doGet(e){return dispatch_(Object.assign({},e&&e.parameter||{}, {action:(e&&e.parameter&&e.parameter.action)||'health'}),true);}
function doPost(e){try{if(!e||!e.postData||e.postData.contents.length>20000)return json_({ok:false,code:'INPUT',message:'요청 크기가 올바르지 않습니다.'});return dispatch_(JSON.parse(e.postData.contents),false);}catch(err){return json_({ok:false,code:'INPUT',message:'요청을 읽지 못했습니다.'});}}
function dispatch_(q,readOnly){
 var lock=null;
 try{
  if(readOnly&&!['health','ranks','catalog','overview'].includes(q.action))return json_({ok:false,code:'ACTION',message:'조회 요청만 가능합니다.'});
  if(typeof q.size==='string'&&/^(16|32|64)$/.test(q.size))q.size=Number(q.size);
  if(!['start','finish','ranks','health','catalog','overview'].includes(q.action))return json_({ok:false,code:'ACTION',message:'지원하지 않는 요청입니다.'});
  var cache=CacheService.getScriptCache(),cacheKey=q.action==='ranks'?'ranks:'+bytesHex_(Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256,JSON.stringify([q.environment,q.collection,q.version,q.size]))):null;
  if(cacheKey){var cached=cache.get(cacheKey);if(cached)return json_(JSON.parse(cached));}
  // All result lookups and appends share one script lock, including lost-response retries.
  lock=LockService.getScriptLock();if(!lock.tryLock(10000))return json_({ok:false,code:'BUSY',message:'저장 요청이 겹쳤어요. 잠시 후 다시 시도해 주세요.'});
  var ctx=context_(),response;
  if(q.action==='catalog')response={ok:true,environment:PropertiesService.getScriptProperties().getProperty('ENVIRONMENT'),collections:ctx.catalog};
  else if(q.action==='overview'){
   var environment=PropertiesService.getScriptProperties().getProperty('ENVIRONMENT');if(q.environment!==environment)throw Object.assign(Error('통계 환경이 다릅니다.'),{code:'ENVIRONMENT'});
   var scopes=[];ctx.catalog.forEach(function(c){c.rounds.forEach(function(size){var r=ctx.service.handle({action:'ranks',environment:environment,collection:c.id,version:c.version,size:size});scopes.push({collection:c.id,version:c.version,size:size,total:r.total,leader:r.rows[0]||null});});});
   response={ok:true,environment:environment,scopes:scopes,updatedAt:new Date().toISOString()};
  }
  else {try{response=ctx.service.handle(q);}catch(err){if(err.code!=='VERSION')throw err;ctx=context_(true);response=ctx.service.handle(q);}}
  if(q.action==='finish'&&response.ok){var key='ranks:'+bytesHex_(Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256,JSON.stringify([q.environment,q.collection,q.version,q.size])));try{cache.remove(key);}catch(ignore){}}
  if(cacheKey){try{cache.put(cacheKey,JSON.stringify(response),60);}catch(ignore){}}
  return json_(response);
 }catch(err){return json_({ok:false,code:err.code||'SERVER',message:err.code?err.message:'통계 서버를 확인하지 못했어요. 결과는 기기에 보관됩니다.'});}
 finally{if(lock)lock.releaseLock();}
}
// Owner-only functions. No public API can call these functions or read the ledger.
function cleanupExpiredSessions(){var lock=LockService.getScriptLock();lock.waitLock(10000);try{var sheet=context_().book.getSheetByName('Sessions'),n=sheet.getLastRow();if(n<2)return;var rows=sheet.getRange(2,1,n-1,9).getValues(),cutoff=Date.now()-7*86400000;for(var i=rows.length-1;i>=0;i--)if(Number(rows[i][7])<cutoff)sheet.deleteRow(i+2);}finally{lock.releaseLock();}}
function backupResults(){var book=context_().book;book.getSheetByName('Results').copyTo(book).setName('Backup_'+Utilities.formatDate(new Date(),'Asia/Seoul','yyyyMMdd_HHmmss'));}
function rebuildStatistics(){
 // Rankings derive from the ledger; cached responses may take up to 60 seconds to reflect exclusions.
 var ctx=context_(),sheet=ctx.book.getSheetByName('Summary')||ctx.book.insertSheet('Summary'),rows=[['collection','version','mode','candidate','wins','total','percent','updatedAt']];
 ctx.catalog.forEach(function(c){c.rounds.forEach(function(size){var r=ctx.service.handle({action:'ranks',environment:PropertiesService.getScriptProperties().getProperty('ENVIRONMENT'),collection:c.id,version:c.version,size:size});r.rows.forEach(function(x){rows.push([c.id,c.version,size,x.id,x.wins,r.total,x.percent,r.updatedAt]);});});});sheet.clearContents();sheet.getRange(1,1,rows.length,8).setValues(rows);
}
// Owner-run snapshot only. Never dispatched by the public web app; no sharing permissions are changed.
function privateReportRows_(raw,catalog){
 var seen=new Set();
 var rows=raw.map(function(r){
  var c=catalog.find(function(c){return c.id===r[1];}),known=c&&c.version===r[2];
  var candidate=known&&c.candidates.find(function(x){return x.id===r[4];});
  var excluded=r[6]===true||String(r[6]).toLowerCase()==='true',date=new Date(r[5]);
  var eligible=known&&candidate&&c.rounds.includes(r[3])&&!excluded,key=JSON.stringify([r[1],r[2],r[3],r[0]]),duplicate=eligible&&seen.has(key);
  if(eligible)seen.add(key);
  var text=function(v){v=String(v==null?'':v);return /^[=+@\-\t\r\n]/.test(v)?"'"+v:v;};
  return [Number.isFinite(date.getTime())?date:'날짜 확인 필요',text(c?c.title:r[1]),r[3]==='all'?'전체 참가':text(r[3]+'강'),text(candidate?candidate.title:r[4]),text(candidate?candidate.artist:''),text(candidate?candidate.album:''),duplicate?'중복 원장 · 집계 제외':excluded?'집계 제외':eligible?'집계 대상':'과거/미확인 구성 · 현재 순위 제외',text(r[7]),text(r[0]),text(r[2])];
 });
 return rows.sort(function(a,b){return (b[0] instanceof Date?b[0].getTime():0)-(a[0] instanceof Date?a[0].getTime():0);});
}
function refreshPrivateReport(){
 var lock=LockService.getScriptLock();lock.waitLock(10000);
 try{
  var props=PropertiesService.getScriptProperties(),environment=props.getProperty('ENVIRONMENT');
  if(!['test','production'].includes(environment))throw Error('먼저 setupWorldcup을 실행해 주세요.');
  var sourceId=props.getProperty('SPREADSHEET_ID'),source=SpreadsheetApp.openById(sourceId),ledger=source.getSheetByName('Results');
  if(!ledger)throw Error('Results 원장이 없습니다. 원본 시트를 확인해 주세요.');
  var raw=ledger.getLastRow()<2?[]:ledger.getRange(2,1,ledger.getLastRow()-1,8).getValues(),rows=privateReportRows_(raw,loadCatalog_(source,false));
  var key='PRIVATE_REPORT_ID_'+environment,id=props.getProperty(key),book;
  if(id===sourceId)throw Error('확인용 파일과 원본 파일은 달라야 합니다.');
  if(id){book=SpreadsheetApp.openById(id);}else{
   book=SpreadsheetApp.create('씨야 월드컵 · 운영자 통계 확인 · '+(environment==='test'?'테스트':'운영'));
   props.setProperty(key,book.getId());
  }
  book.setSpreadsheetTimeZone('Asia/Seoul');
  var sheet=book.getSheetByName('완료 기록')||book.insertSheet('완료 기록'),info=book.getSheetByName('읽어주세요')||book.insertSheet('읽어주세요');
  var headers=['완료 시각 (한국)','월드컵 종류','라운드','우승자 / 우승곡','가수 · 배우','앨범 · 작품','집계 상태','제외 사유','게임 번호','후보 구성 버전'];
  if(sheet.getMaxRows()<rows.length+1)sheet.insertRowsAfter(sheet.getMaxRows(),rows.length+1-sheet.getMaxRows());
  if(sheet.getFilter())sheet.getFilter().remove();
  sheet.clearContents();sheet.getRange(1,1,1,10).setValues([headers]);
  if(rows.length){sheet.getRange(2,1,rows.length,10).setValues(rows);sheet.getRange(2,1,rows.length,1).setNumberFormat('yyyy-mm-dd hh:mm:ss');sheet.getRange(1,1,rows.length+1,10).createFilter();}
  sheet.setFrozenRows(1);sheet.getRange(1,1,1,10).setBackground('#f4dbe6').setFontWeight('bold');sheet.setColumnWidths(1,10,180);sheet.setColumnWidth(4,240);sheet.setColumnWidth(7,270);
  var notes=[['항목','내용'],['용도','운영자 확인용 사본입니다. 여기서 편집·삭제해도 사이트 통계는 바뀌지 않습니다.'],['마지막 새로고침 (한국)',Utilities.formatDate(new Date(),'Asia/Seoul','yyyy-MM-dd HH:mm:ss')],['환경',environment],['원장 행 수',rows.length],['갱신 방법','최초 setupWorldcupAutomation 실행 후 매시간 갱신합니다. 바로 확인하려면 refreshPrivateReport를 실행하세요.'],['표시 범위','서버에서 접수한 완료 결과만 표시합니다. 중도 종료·개인 기록만 저장한 게임은 없습니다.'],['집계 기준','완료한 게임 기준이며 방문자 수가 아닙니다. 종류·라운드·후보 구성 버전별로 분리됩니다.'],['개인정보','이름·이메일·익명 이용자 해시·토큰·선택 경로는 이 확인용 파일에 복사하지 않습니다.'],['공유','새 파일은 공유 설정을 변경하지 않습니다. 공유 화면에서 일반 액세스가 제한됨인지 확인해 주세요.'],['백업 아님','다시 실행하면 사본을 원장 기준으로 덮어씁니다. 원장 삭제 대비 자동 백업과 복원 기능은 아닙니다.']];
  info.clearContents();info.getRange(1,1,notes.length,2).setValues(notes);info.setColumnWidth(1,210);info.setColumnWidth(2,700);info.getRange(1,1,notes.length,2).setWrap(true);info.setFrozenRows(1);
  SpreadsheetApp.flush();Logger.log('운영자 확인용 시트: '+book.getUrl());return book.getUrl();
 }finally{lock.releaseLock();}
}
// Owner executes once after deploying the site and replacing this script.
function setupWorldcupAutomation(){
 setupWorldcup();
 var url=refreshPrivateReport();
 var triggers=ScriptApp.getProjectTriggers().filter(function(t){return t.getHandlerFunction()==='refreshPrivateReport';});
 if(!triggers.length)ScriptApp.newTrigger('refreshPrivateReport').timeBased().everyHours(1).create();
 Logger.log('목록 자동 연결 및 확인용 시트 매시간 갱신 설정 완료: '+url);return url;
}
