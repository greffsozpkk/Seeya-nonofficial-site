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
function context_(){
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
 return {book:book,service:WorldcupStats.createService(WORLDCUP_CATALOG,repo,{environment:environment,now:Date.now,uuid:Utilities.getUuid,random:Math.random,sign:sign,hash:function(s){return bytesHex_(Utilities.computeHmacSha256Signature('client|'+s,secret));},verify:function(id,token){return constantEqual_(sign(id),token);}})};
}
function json_(x){return ContentService.createTextOutput(JSON.stringify(x)).setMimeType(ContentService.MimeType.JSON);}
function doGet(e){return dispatch_(Object.assign({},e&&e.parameter||{}, {action:(e&&e.parameter&&e.parameter.action)||'health'}),true);}
function doPost(e){try{if(!e||!e.postData||e.postData.contents.length>20000)return json_({ok:false,code:'INPUT',message:'요청 크기가 올바르지 않습니다.'});return dispatch_(JSON.parse(e.postData.contents),false);}catch(err){return json_({ok:false,code:'INPUT',message:'요청을 읽지 못했습니다.'});}}
function dispatch_(q,readOnly){
 var lock=null;
 try{
  if(readOnly&&!['health','ranks'].includes(q.action))return json_({ok:false,code:'ACTION',message:'조회 요청만 가능합니다.'});
  if(typeof q.size==='string'&&/^(16|32|64)$/.test(q.size))q.size=Number(q.size);
  if(!['start','finish','ranks','health'].includes(q.action))return json_({ok:false,code:'ACTION',message:'지원하지 않는 요청입니다.'});
  var cache=CacheService.getScriptCache(),cacheKey=q.action==='ranks'?'ranks:'+bytesHex_(Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256,JSON.stringify([q.environment,q.collection,q.version,q.size]))):null;
  if(cacheKey){var cached=cache.get(cacheKey);if(cached)return json_(JSON.parse(cached));}
  // All result lookups and appends share one script lock, including lost-response retries.
  lock=LockService.getScriptLock();if(!lock.tryLock(10000))return json_({ok:false,code:'BUSY',message:'저장 요청이 겹쳤어요. 잠시 후 다시 시도해 주세요.'});
  var response=context_().service.handle(q);
  if(cacheKey){try{cache.put(cacheKey,JSON.stringify(response),60);}catch(ignore){}}
  return json_(response);
 }catch(err){return json_({ok:false,code:err.code||'SERVER',message:err.code?err.message:'통계 서버를 확인하지 못했어요. 결과는 기기에 보관됩니다.'});}
 finally{if(lock)lock.releaseLock();}
}
// Owner-only functions. No public API can call these functions or read the ledger.
function cleanupExpiredSessions(){var lock=LockService.getScriptLock();lock.waitLock(10000);try{var sheet=context_().book.getSheetByName('Sessions'),n=sheet.getLastRow();if(n<2)return;var rows=sheet.getRange(2,1,n-1,9).getValues(),cutoff=Date.now()-7*86400000;for(var i=rows.length-1;i>=0;i--)if(Number(rows[i][7])<cutoff)sheet.deleteRow(i+2);}finally{lock.releaseLock();}}
function backupResults(){var book=context_().book;book.getSheetByName('Results').copyTo(book).setName('Backup_'+Utilities.formatDate(new Date(),'Asia/Seoul','yyyyMMdd_HHmmss'));}
function rebuildStatistics(){
 // Rankings always derive from the ledger; editing excluded/reason is effective on the next request.
 var ctx=context_(),sheet=ctx.book.getSheetByName('Summary')||ctx.book.insertSheet('Summary'),rows=[['collection','version','mode','candidate','wins','total','percent','updatedAt']];
 WORLDCUP_CATALOG.forEach(function(c){c.rounds.forEach(function(size){var r=ctx.service.handle({action:'ranks',environment:PropertiesService.getScriptProperties().getProperty('ENVIRONMENT'),collection:c.id,version:c.version,size:size});r.rows.forEach(function(x){rows.push([c.id,c.version,size,x.id,x.wins,r.total,x.percent,r.updatedAt]);});});});sheet.clearContents();sheet.getRange(1,1,rows.length,8).setValues(rows);
}
