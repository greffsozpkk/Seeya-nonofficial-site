// Generated Code.gs includes this adapter, shared bracket rules and candidate IDs.
// Keep legacy ENVIRONMENT=test. Public launch uses dedicated Production_* tabs.
// Old deployments continue to see only legacy test records.
function defaultEnvironment_(){var p=PropertiesService.getScriptProperties();return p.getProperty('PUBLIC_WORLD_CUP_READY')==='true'?'production':p.getProperty('ENVIRONMENT');}
function environment_(value){var e=value||defaultEnvironment_();if(!['test','production'].includes(e))throw Object.assign(Error('통계 환경을 확인해 주세요.'),{code:'ENVIRONMENT'});return e;}
function ledgerName_(name,environment){return environment==='production'?'Production_'+name:name;}
function setupWorldcup() { return setupEnvironment_(environment_(PropertiesService.getScriptProperties().getProperty('PUBLIC_WORLD_CUP_READY')==='true'?'production':(PropertiesService.getScriptProperties().getProperty('ENVIRONMENT')||'test'))); }
function setupEnvironment_(environment) {
  var props=PropertiesService.getScriptProperties();
  if(!props.getProperty('ENVIRONMENT'))props.setProperty('ENVIRONMENT','test');
  if(!props.getProperty('TOKEN_SECRET'))props.setProperty('TOKEN_SECRET',Utilities.getUuid()+Utilities.getUuid()+Utilities.getUuid());
  var book=SpreadsheetApp.openById(props.getProperty('SPREADSHEET_ID'));
  [['Sessions',['id','clientHash','requestId','collection','version','mode','issued','expires','game']],['Results',['id','collection','version','mode','winner','acceptedAt','excluded','reason']]].forEach(function(spec){
    var sheet=book.getSheetByName(ledgerName_(spec[0],environment))||book.insertSheet(ledgerName_(spec[0],environment));
    if(sheet.getLastRow()===0){sheet.appendRow(spec[1]);sheet.setFrozenRows(1);}
    else if(JSON.stringify(sheet.getRange(1,1,1,spec[1].length).getValues()[0])!==JSON.stringify(spec[1]))throw Error('시트 열 이름이 맞지 않습니다: '+spec[0]);
  });
  ensureNicknameColumn_(book.getSheetByName(ledgerName_('Results',environment)));
  SpreadsheetApp.flush();
  return '준비 완료: '+environment;
}
// Add only the new trailing column; preserve all existing rows and column positions.
function ensureNicknameColumn_(sheet){var cell=sheet.getRange(1,9),value=cell.getValue();if(value&&value!=='nickname')throw Error('Results I열을 확인해 주세요. 기존 데이터를 덮어쓰지 않았습니다.');if(!value)cell.setValue('nickname');}
function sheetText_(value){var s=String(value||'');return /^[=+@\-\t\r\n]/.test(s)?"'"+s:s;}
function bytesHex_(a){return a.map(function(b){return ('0'+((b+256)%256).toString(16)).slice(-2);}).join('');}
function constantEqual_(a,b){if(typeof b!=='string'||a.length!==b.length)return false;var n=0;for(var i=0;i<a.length;i++)n|=a.charCodeAt(i)^b.charCodeAt(i);return n===0;}
function context_(forceCatalog,requestedEnvironment){
 var props=PropertiesService.getScriptProperties(),environment=environment_(requestedEnvironment),secret=props.getProperty('TOKEN_SECRET');
 if(!['test','production'].includes(environment)||!secret)throw Error('먼저 setupWorldcup을 실행해 주세요.');
 if(environment==='production'&&props.getProperty('PUBLIC_WORLD_CUP_READY')!=='true')throw Object.assign(Error('공개 통계 연결을 준비 중입니다.'),{code:'NOT_READY'});
 var book=SpreadsheetApp.openById(props.getProperty('SPREADSHEET_ID')),ss=book.getSheetByName(ledgerName_('Sessions',environment)),rs=book.getSheetByName(ledgerName_('Results',environment));
 if(!ss||!rs)throw Error('통계 시트가 준비되지 않았습니다.');
 ensureNicknameColumn_(rs);
 function values(sheet,n){return sheet.getLastRow()<2?[]:sheet.getRange(2,1,sheet.getLastRow()-1,n).getValues();}
 var sessions=values(ss,9).map(function(r){return {id:r[0],client:r[1],requestId:r[2],collection:r[3],version:r[4],size:r[5],issued:Number(r[6]),expires:Number(r[7]),game:JSON.parse(r[8])};});
 var results=values(rs,9).map(function(r){return {id:r[0],collection:r[1],version:r[2],size:r[3],winner:r[4],at:r[5] instanceof Date?r[5].toISOString():String(r[5]),excluded:r[6]===true||String(r[6]).toLowerCase()==='true',reason:String(r[7]||''),nickname:WorldcupBracket.nickname(r[8])};});
 function sign(id){return bytesHex_(Utilities.computeHmacSha256Signature(environment+'|'+id,secret));}
 var repo={
  paused:function(id){return (props.getProperty('PAUSED_COLLECTIONS')||'').split(',').map(function(s){return s.trim();}).includes(id);},
  request:function(client,id){return sessions.find(function(s){return s.client===client&&s.requestId===id;});},
  usage:function(client,now){return {hour:sessions.filter(function(s){return s.client===client&&s.issued>now-3600000;}).length,day:sessions.filter(function(s){return s.client===client&&s.issued>now-86400000;}).length,globalDay:sessions.filter(function(s){return s.issued>now-86400000;}).length};},
  session:function(id){return sessions.find(function(s){return s.id===id;});},
  result:function(id){return results.find(function(r){return r.id===id;});},
  results:function(){return results;},
  addSession:function(s){if(sessions.length>=10000)throw Error('발급 기록 정리가 필요합니다.');ss.appendRow([s.id,s.client,s.requestId,s.collection,s.version,s.size,s.issued,s.expires,JSON.stringify(s.game)]);SpreadsheetApp.flush();sessions.push(s);},
  addResult:function(r){if(results.length>=50000)throw Error('통계 저장 용량 점검이 필요합니다.');rs.appendRow([r.id,r.collection,r.version,r.size,r.winner,r.at,false,'',sheetText_(r.nickname)]);SpreadsheetApp.flush();results.push(r);}
 };
 var catalog=loadCatalog_(book,forceCatalog);return {book:book,environment:environment,catalog:catalog,service:WorldcupStats.createService(catalog,repo,{environment:environment,now:Date.now,uuid:Utilities.getUuid,random:Math.random,sign:sign,hash:function(s){return bytesHex_(Utilities.computeHmacSha256Signature('client|'+s,secret));},verify:function(id,token){return constantEqual_(sign(id),token);}})};
}
function json_(x){return ContentService.createTextOutput(JSON.stringify(x)).setMimeType(ContentService.MimeType.JSON);}
function doGet(e){return dispatch_(Object.assign({},e&&e.parameter||{}, {action:(e&&e.parameter&&e.parameter.action)||'health'}),true);}
function doPost(e){try{if(!e||!e.postData||e.postData.contents.length>40000)return json_({ok:false,code:'INPUT',message:'요청 크기가 올바르지 않습니다.'});return dispatch_(JSON.parse(e.postData.contents),false);}catch(err){return json_({ok:false,code:'INPUT',message:'요청을 읽지 못했습니다.'});}}
function dispatch_(q,readOnly){
 var lock=null;
 try{
  if(readOnly&&!['health','ranks','catalog','overview'].includes(q.action))return json_({ok:false,code:'ACTION',message:'조회 요청만 가능합니다.'});
  if(typeof q.size==='string'&&/^(16|32|64)$/.test(q.size))q.size=Number(q.size);
  if(!['start','finish','ranks','health','catalog','overview'].includes(q.action))return json_({ok:false,code:'ACTION',message:'지원하지 않는 요청입니다.'});
  q.environment=environment_(q.environment);
  var cache=CacheService.getScriptCache(),cacheKey=q.action==='ranks'?'ranks:'+bytesHex_(Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256,JSON.stringify([q.environment,q.collection,q.version,q.size]))):null;
  if(cacheKey){var cached=cache.get(cacheKey);if(cached)return json_(JSON.parse(cached));}
  // All result lookups and appends share one script lock, including lost-response retries.
  lock=LockService.getScriptLock();if(!lock.tryLock(10000))return json_({ok:false,code:'BUSY',message:'저장 요청이 겹쳤어요. 잠시 후 다시 시도해 주세요.'});
  var ctx=context_(false,q.environment),response;
  if(q.action==='catalog')response={ok:true,environment:ctx.environment,collections:ctx.catalog};
  else if(q.action==='overview'){
   var environment=ctx.environment;if(q.environment!==environment)throw Object.assign(Error('통계 환경이 다릅니다.'),{code:'ENVIRONMENT'});
   var scopes=[];ctx.catalog.forEach(function(c){c.rounds.forEach(function(size){var r=ctx.service.handle({action:'ranks',environment:environment,collection:c.id,version:c.version,size:size});scopes.push({collection:c.id,version:c.version,size:size,total:r.total,leader:r.rows[0]||null});});});
   response={ok:true,environment:environment,scopes:scopes,updatedAt:new Date().toISOString()};
  }
  else {try{response=ctx.service.handle(q);}catch(err){if(err.code!=='VERSION')throw err;ctx=context_(true,q.environment);response=ctx.service.handle(q);}}
  if(q.action==='health'){response.environmentIsolation=true;response.publicReady=PropertiesService.getScriptProperties().getProperty('PUBLIC_WORLD_CUP_READY')==='true';}
  if(q.action==='finish'&&response.ok){var key='ranks:'+bytesHex_(Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256,JSON.stringify([q.environment,q.collection,q.version,q.size])));try{cache.remove(key);}catch(ignore){}}
  if(cacheKey){try{cache.put(cacheKey,JSON.stringify(response),60);}catch(ignore){}}
  return json_(response);
 }catch(err){return json_({ok:false,code:err.code||'SERVER',message:err.code?err.message:'통계 서버를 확인하지 못했어요. 결과는 기기에 보관됩니다.'});}
 finally{if(lock)lock.releaseLock();}
}
// Owner-only functions. No public API can call these functions or read the ledger.
function cleanupExpiredSessions(){var lock=LockService.getScriptLock();lock.waitLock(10000);try{var ctx=context_(),sheet=ctx.book.getSheetByName(ledgerName_('Sessions',ctx.environment)),n=sheet.getLastRow();if(n<2)return;var rows=sheet.getRange(2,1,n-1,9).getValues(),cutoff=Date.now()-7*86400000;for(var i=rows.length-1;i>=0;i--)if(Number(rows[i][7])<cutoff)sheet.deleteRow(i+2);}finally{lock.releaseLock();}}
function backupResults(){var ctx=context_(),book=ctx.book;book.getSheetByName(ledgerName_('Results',ctx.environment)).copyTo(book).setName('Backup_'+Utilities.formatDate(new Date(),'Asia/Seoul','yyyyMMdd_HHmmss'));}
function rebuildStatistics(){
 // Rankings derive from the ledger; cached responses may take up to 60 seconds to reflect exclusions.
 var ctx=context_(),sheet=ctx.book.getSheetByName(ledgerName_('Summary',ctx.environment))||ctx.book.insertSheet(ledgerName_('Summary',ctx.environment)),rows=[['collection','version','mode','candidate','wins','total','percent','updatedAt']];
 ctx.catalog.forEach(function(c){c.rounds.forEach(function(size){var r=ctx.service.handle({action:'ranks',environment:ctx.environment,collection:c.id,version:c.version,size:size});r.rows.forEach(function(x){rows.push([c.id,c.version,size,x.id,x.wins,r.total,x.percent,r.updatedAt]);});});});sheet.clearContents();sheet.getRange(1,1,rows.length,8).setValues(rows);
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
  return [Number.isFinite(date.getTime())?date:'날짜 확인 필요',text(c?c.title:r[1]),r[3]==='all'?'전체 참가':text(r[3]+'강'),text(candidate?candidate.title:r[4]),text(candidate?candidate.artist:''),text(candidate?candidate.album:''),duplicate?'중복 원장 · 집계 제외':excluded?'집계 제외':eligible?'집계 대상':'과거/미확인 구성 · 현재 순위 제외',text(r[7]),text(r[0]),text(r[2]),text(r[8])];
 });
 return rows.sort(function(a,b){return (b[0] instanceof Date?b[0].getTime():0)-(a[0] instanceof Date?a[0].getTime():0);});
}
function refreshPrivateReport(){return refreshPrivateReportFor_(defaultEnvironment_());}
function refreshPrivateTestReport(){return refreshPrivateReportFor_('test');}
function refreshPrivateReportFor_(requestedEnvironment){
 var lock=LockService.getScriptLock();lock.waitLock(10000);
 try{
  var props=PropertiesService.getScriptProperties(),environment=environment_(requestedEnvironment);
  if(!['test','production'].includes(environment))throw Error('먼저 setupWorldcup을 실행해 주세요.');
  var sourceId=props.getProperty('SPREADSHEET_ID'),source=SpreadsheetApp.openById(sourceId),ledger=source.getSheetByName(ledgerName_('Results',environment));
  if(!ledger)throw Error('Results 원장이 없습니다. 원본 시트를 확인해 주세요.');
  var raw=ledger.getLastRow()<2?[]:ledger.getRange(2,1,ledger.getLastRow()-1,9).getValues(),rows=privateReportRows_(raw,loadCatalog_(source,false));
  var key='PRIVATE_REPORT_ID_'+environment,id=props.getProperty(key),book;
  if(id===sourceId)throw Error('확인용 파일과 원본 파일은 달라야 합니다.');
  if(id){book=SpreadsheetApp.openById(id);}else{
   book=SpreadsheetApp.create('씨야 월드컵 · 운영자 통계 확인 · '+(environment==='test'?'테스트':'운영'));
   props.setProperty(key,book.getId());
  }
  book.setSpreadsheetTimeZone('Asia/Seoul');
  var sheet=book.getSheetByName('완료 기록')||book.insertSheet('완료 기록'),info=book.getSheetByName('읽어주세요')||book.insertSheet('읽어주세요');
  var headers=['완료 시각 (한국)','월드컵 종류','라운드','우승자 / 우승곡','가수 · 배우','앨범 · 작품','집계 상태','제외 사유','게임 번호','후보 구성 버전','닉네임'];
  if(sheet.getMaxRows()<rows.length+1)sheet.insertRowsAfter(sheet.getMaxRows(),rows.length+1-sheet.getMaxRows());
  if(sheet.getFilter())sheet.getFilter().remove();
  sheet.clearContents();sheet.getRange(1,1,1,11).setValues([headers]);
  if(rows.length){sheet.getRange(2,1,rows.length,11).setValues(rows);sheet.getRange(2,1,rows.length,1).setNumberFormat('yyyy-mm-dd hh:mm:ss');sheet.getRange(1,1,rows.length+1,11).createFilter();}
  sheet.setFrozenRows(1);sheet.getRange(1,1,1,11).setBackground('#f4dbe6').setFontWeight('bold');sheet.setColumnWidths(1,11,180);sheet.setColumnWidth(4,240);sheet.setColumnWidth(7,270);
  var notes=[['항목','내용'],['용도','운영자 확인용 사본입니다. 여기서 편집·삭제해도 사이트 통계는 바뀌지 않습니다.'],['마지막 새로고침 (한국)',Utilities.formatDate(new Date(),'Asia/Seoul','yyyy-MM-dd HH:mm:ss')],['환경',environment],['원장 행 수',rows.length],['갱신 방법','최초 setupWorldcupAutomation 실행 후 매시간 갱신합니다. 바로 확인하려면 refreshPrivateReport를 실행하세요.'],['표시 범위','서버에서 접수한 완료 결과만 표시합니다. 중도 종료·개인 기록만 저장한 게임은 없습니다.'],['집계 기준','완료한 게임 기준이며 방문자 수가 아닙니다. 종류·라운드·후보 구성 버전별로 분리됩니다.'],['개인정보','통계 참여 시 입력한 닉네임을 표시합니다. 이메일·익명 이용자 해시·토큰·선택 경로는 복사하지 않습니다. 공개 공유하지 마세요.'],['공유','새 파일은 공유 설정을 변경하지 않습니다. 공유 화면에서 일반 액세스가 제한됨인지 확인해 주세요.'],['백업 아님','다시 실행하면 사본을 원장 기준으로 덮어씁니다. 원장 삭제 대비 자동 백업과 복원 기능은 아닙니다.']];
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

// Owner-run once. Idempotent: never clear, rename or migrate existing ledgers.
function setupWorldcupPublicLaunch(){
 var lock=LockService.getScriptLock();lock.waitLock(10000);
 try{
  var props=PropertiesService.getScriptProperties();
  if(props.getProperty('ENVIRONMENT')!=='test')throw Error('기존 ENVIRONMENT는 test로 유지해 주세요. 기존 기록을 변경하지 않았습니다.');
  setupEnvironment_('test');setupEnvironment_('production');
  props.setProperty('PUBLIC_WORLD_CUP_READY','true');
 }finally{lock.releaseLock();}
 var url=setupWorldcupAutomation();
 Logger.log('공개 준비 완료. Production_Results는 공개 통계, Results는 기존 테스트 통계입니다. 기존 웹 앱을 새 버전으로 배포해 주세요.');
 return url;
}
