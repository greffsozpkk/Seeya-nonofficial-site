// Generated from current candidate IDs. No credentials in this file.
const WORLDCUP_CATALOG=[{"id":"group","version":"songs-20261021-v2","rounds":[32,64],"candidates":[{"id":"track-001"},{"id":"track-002"},{"id":"track-003"},{"id":"track-004"},{"id":"track-005"},{"id":"track-006"},{"id":"track-007"},{"id":"track-008"},{"id":"track-009"},{"id":"track-010"},{"id":"track-011"},{"id":"track-012"},{"id":"track-013"},{"id":"track-014"},{"id":"track-015"},{"id":"track-016"},{"id":"track-017"},{"id":"track-018"},{"id":"track-019"},{"id":"track-020"},{"id":"track-021"},{"id":"track-022"},{"id":"track-023"},{"id":"track-024"},{"id":"track-025"},{"id":"track-026"},{"id":"track-027"},{"id":"track-028"},{"id":"track-029"},{"id":"track-030"},{"id":"track-031"},{"id":"track-032"},{"id":"track-033"},{"id":"track-034"},{"id":"track-035"},{"id":"track-036"},{"id":"track-037"},{"id":"track-038"},{"id":"track-039"},{"id":"track-040"},{"id":"track-041"},{"id":"track-042"},{"id":"track-043"},{"id":"track-044"},{"id":"track-045"},{"id":"track-046"},{"id":"track-047"},{"id":"track-048"},{"id":"track-049"},{"id":"track-050"},{"id":"track-051"},{"id":"track-052"},{"id":"track-053"},{"id":"track-054"},{"id":"track-055"},{"id":"track-056"},{"id":"track-057"},{"id":"track-058"},{"id":"track-059"},{"id":"track-060"},{"id":"track-061"},{"id":"track-062"},{"id":"track-063"},{"id":"track-064"},{"id":"track-065"},{"id":"track-066"},{"id":"track-068"},{"id":"track-070"},{"id":"track-071"},{"id":"track-072"},{"id":"track-073"},{"id":"track-074"},{"id":"track-075"},{"id":"track-076"},{"id":"fate-one-person"}]},{"id":"solo","version":"solo-20261022-v1","rounds":[16,32],"candidates":[{"id":"solo-xHB6Pn5rNxo"},{"id":"solo-MiUAHBTO55g"},{"id":"solo-Sn7YYiXgQ6Y"},{"id":"solo-cjuv_qVAgRA"},{"id":"solo-siyf1bcO5Gc"},{"id":"solo-9klPsmjNPDw"},{"id":"solo-nN7NV5FBhBw"},{"id":"solo-5USUHmWpPcg"},{"id":"solo-Mjl8tBDX5Ik"},{"id":"solo-06MOxzzMPvI"},{"id":"solo-DFBk5oSn72Y"},{"id":"solo-8UAxgcnvk2E"},{"id":"solo-lOvBRahMvtQ"},{"id":"solo-_FJkNLkV82U"},{"id":"solo-JIpU0HXvc_E"},{"id":"solo-Uko7Y-Tfj-8"},{"id":"solo-arm2c6NH9vg"},{"id":"solo-gwRkvYc59_s"},{"id":"solo-atp-TU4Xezs"},{"id":"solo-8k-YrZ5Gg2g"},{"id":"solo-7h3ndp05JN0"},{"id":"solo-_lTZCnkpoyQ"},{"id":"solo-PHQbDyffSTw"},{"id":"solo-6yrrTYk4sMs"},{"id":"solo-ppe9vyChKLs"},{"id":"solo-2WyOq7IMEnc"},{"id":"solo-L5Cn7BpkEeQ"},{"id":"solo-yjvTqgRzcXY"},{"id":"solo-7VGw30BGkyw"},{"id":"solo-pwdQrpNpFyA"},{"id":"solo-oukYixC1ldo"},{"id":"solo-c6MlQvbbZw0"},{"id":"solo-q4jtpVDemFE"},{"id":"solo-DujKGd4aA60"}]},{"id":"mv","version":"mv-20261022-v1","rounds":[16,"all"],"candidates":[{"id":"mv-_8nBbgv5DJI"},{"id":"mv-8CMqMqyeapg"},{"id":"mv-PHigJJ-Lx8Q"},{"id":"mv-xiHuOabOH9c"},{"id":"mv-lu1kJ25OWfg"},{"id":"mv-Ut_QWvPwvgA"},{"id":"mv-_veObwyUQj8"},{"id":"mv-pvwPEdvChds"},{"id":"mv-khHra8dCxUY"},{"id":"mv-vEbiLplHd-M"},{"id":"mv-jIPUa3A9AA0"},{"id":"mv-_esZucb02gs"},{"id":"mv-Yax4nGDtkW4"},{"id":"mv-ANUSI5FfWFM"},{"id":"mv-dmsw-tEenZ0"},{"id":"mv-RMNcT5AqLGA"},{"id":"mv-I1zhkwIuZ0A"},{"id":"mv-JeNLPdkh6FM"},{"id":"mv-_CGekO1IRGc"}]},{"id":"film","version":"film-20261022-v1","rounds":["all",16,32],"candidates":[{"id":"film-01"},{"id":"film-02"},{"id":"film-03"},{"id":"film-04"},{"id":"film-05"},{"id":"film-06"},{"id":"film-07"},{"id":"film-08"},{"id":"film-09"},{"id":"film-10"},{"id":"film-11"},{"id":"film-12"},{"id":"film-13"},{"id":"film-14"},{"id":"film-15"},{"id":"film-16"},{"id":"film-17"},{"id":"film-18"},{"id":"film-19"},{"id":"film-20"},{"id":"film-21"},{"id":"film-22"},{"id":"film-23"},{"id":"film-24"},{"id":"film-25"},{"id":"film-26"},{"id":"film-27"},{"id":"film-28"},{"id":"film-29"},{"id":"film-30"},{"id":"film-31"},{"id":"film-32"},{"id":"film-33"}]}];
const WorldcupBracket=(function(){
'use strict';
// Deterministic bracket replay keeps saved progress verifiable; it is not an anti-bot server.
function shuffle(ids,random=Math.random){const a=[...ids];for(let i=a.length-1;i>0;i--){const j=Math.floor(random()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;}
function create(ids,size,version,id,random=Math.random){if(![16,32,64].includes(size)||new Set(ids).size!==ids.length||ids.length<size)throw Error('후보 수를 확인해 주세요.');return {schema:1,id,version,size,initial:shuffle(ids,random).slice(0,size),picks:[]};}
function replay(game,ids,version){
 if(game?.schema===2)return replayAll(game,ids,version);
 if(!game||game.schema!==1||game.version!==version||typeof game.id!=='string'||!/^[\w-]{8,100}$/.test(game.id)||![16,32,64].includes(game.size)||!Array.isArray(game.initial)||game.initial.length!==game.size||new Set(game.initial).size!==game.size||!game.initial.every(x=>ids.includes(x))||!Array.isArray(game.picks)||game.picks.length>game.size-1)throw Error('이전 게임을 불러올 수 없어요. 새 게임을 시작해 주세요.');
 let round=[...game.initial],winners=[],match=0;const history=[];
 for(const pick of game.picks){const pair=round.slice(match*2,match*2+2);if(round.length===1||!pair.includes(pick))throw Error('잘못된 선택 기록');history.push({round:round.length,pair,winner:pick});winners.push(pick);match++;if(match===round.length/2){round=winners;winners=[];match=0;}}
 return {round:round.length,match,pair:round.length>1?round.slice(match*2,match*2+2):[],winner:round.length===1?round[0]:null,history,done:game.picks.length,total:game.size-1};
}
function choose(game,pick,ids,version){const state=replay(game,ids,version);if(!state.pair.includes(pick))throw Error('현재 대결의 곡을 선택해 주세요.');return {...game,picks:[...game.picks,pick]};}
function recordResult(history,game,ids,version,now){const state=replay(game,ids,version);if(!state.winner)throw Error('완료되지 않은 게임');const old=Array.isArray(history)?history:[];if(old.some(r=>r.id===game.id))return old;return [...old,{id:game.id,version,size:game.full?'all':game.size,winner:state.winner,at:now}].slice(-100);}
function ranking(history,size,version){const rows=history.filter(r=>r.version===version&&r.size===size),counts=new Map();rows.forEach(r=>counts.set(r.winner,(counts.get(r.winner)||0)+1));let prev=-1,rank=0;return {total:rows.length,rows:[...counts].sort((a,b)=>b[1]-a[1]||a[0].localeCompare(b[0])).map(([id,wins],i)=>{if(wins!==prev)rank=i+1;prev=wins;return {id,wins,rank,percent:rows.length?wins/rows.length*100:0};})};}
function roundProgress(state){const label=state.round===2?'결승':state.round+'강',matches=state.matches??state.round/2,completed=state.completed??state.match;return {label,matches,current:completed+1,completed,text:label+' '+(completed+1)+'/'+matches};}
// All entrants participate. Random first-round byes complete the power-of-two bracket.
function createAll(ids,version,id,random=Math.random){
 if(ids.length<2||ids.length>128||new Set(ids).size!==ids.length)throw Error('후보 수를 확인해 주세요.');
 const size=2**Math.ceil(Math.log2(ids.length)),order=shuffle(ids,random),paired=2*(ids.length-size/2),initial=order.slice(0,paired);
 for(const entrant of order.slice(paired))initial.push(entrant,null);
 return {schema:2,full:true,id,version,size,initial,picks:[]};
}
function replayAll(game,ids,version){
 const valid=Array.isArray(game.initial)?game.initial.filter(x=>x!==null):[];
 if(!game.full||game.version!==version||typeof game.id!=='string'||!/^[\w-]{8,100}$/.test(game.id)||game.size!==2**Math.ceil(Math.log2(ids.length))||game.initial?.length!==game.size||valid.length!==ids.length||new Set(valid).size!==ids.length||!valid.every(x=>ids.includes(x))||!Array.isArray(game.picks)||game.picks.length>ids.length-1)throw Error('전체 참가 기록을 읽을 수 없어요.');
 let round=[...game.initial],winners=[],match=0,completed=0,cursor=0;const history=[];
 while(round.length>1){
  const pair=round.slice(match*2,match*2+2),byes=round.filter(x=>x===null).length,matches=round.length/2-byes;
  if(pair.every(x=>x===null))throw Error('잘못된 부전승 대진');
  if(pair.includes(null))winners.push(pair.find(x=>x!==null));
  else {
   if(cursor===game.picks.length)return {round:round.length,match,pair,winner:null,history,done:cursor,total:ids.length-1,matches,completed,byes};
   const pick=game.picks[cursor++];if(!pair.includes(pick))throw Error('잘못된 선택 기록');
   winners.push(pick);completed++;history.push({round:round.length,pair,winner:pick});
  }
  match++;if(match===round.length/2){round=winners;winners=[];match=0;completed=0;}
 }
 if(cursor!==game.picks.length)throw Error('종료 이후 선택');
 return {round:1,match:0,pair:[],winner:round[0],history,done:cursor,total:ids.length-1};
}
return {shuffle,create,createAll,replay,choose,recordResult,ranking,roundProgress};

})();
const WorldcupStats=(function(){
'use strict';
const G=WorldcupBracket;
function fail(code,message){const e=new Error(message);e.code=code;throw e;}
function createService(catalog,repo,env){
 const validId=s=>typeof s==='string'&&/^[a-zA-Z0-9_-]{8,100}$/.test(s);
 function scope(q){if(q.environment!==env.environment)fail('ENVIRONMENT','테스트와 운영 통계는 함께 사용할 수 없어요.');const c=catalog.find(c=>c.id===q.collection&&c.version===q.version);if(!c||!c.rounds.includes(q.size))fail('VERSION','후보 구성이나 라운드가 변경됐어요. 페이지를 새로 열어 주세요.');return c;}
 function start(q){const c=scope(q);if(!validId(q.client)||!validId(q.requestId))fail('INPUT','게임 시작 정보를 확인해 주세요.');if(repo.paused(c.id))fail('PAUSED','현재 이 월드컵의 전체 통계 집계가 잠시 중지되어 있어요.');
  const client=env.hash(q.client),now=env.now(),old=repo.request(client,q.requestId);
  if(old){if(old.collection!==c.id||old.version!==c.version||old.size!==q.size)fail('CONFLICT','같은 시작 요청의 조건이 달라요.');if(old.expires<=now)fail('EXPIRED','시작 요청이 만료됐어요. 새 게임을 시작해 주세요.');return issued(old);}
  const limits=repo.usage(client,now);if(limits.hour>=10||limits.day>=60||limits.globalDay>=1000)fail('RATE_LIMIT','게임 시작 요청이 많아요. 잠시 후 다시 시도하거나 통계 없이 플레이해 주세요.');
  const id=env.uuid(),ids=c.candidates.map(x=>x.id),game=q.size==='all'?G.createAll(ids,c.version,id,env.random):G.create(ids,q.size,c.version,id,env.random);
  const session={id,client,requestId:q.requestId,collection:c.id,version:c.version,size:q.size,game,issued:now,expires:now+24*60*60*1000};repo.addSession(session);return issued(session);
 }
 function issued(s){return {ok:true,environment:env.environment,game:s.game,token:env.sign(s.id),expires:s.expires,policy:'completed-game'};}
 function finish(q){scope(q);if(!validId(q.id)||typeof q.token!=='string'||!env.verify(q.id,q.token))fail('TOKEN','게임 확인 정보가 올바르지 않아요.');
  const old=repo.result(q.id);if(old){if(old.collection!==q.collection||old.version!==q.version||old.size!==q.size||old.winner!==q.winner)fail('CONFLICT','이미 처리한 결과와 다른 요청이에요.');return receipt(old,true);}
  const s=repo.session(q.id);if(!s)fail('SESSION','게임 발급 기록을 찾지 못했어요.');if(s.collection!==q.collection||s.version!==q.version||s.size!==q.size)fail('CONFLICT','게임 종류가 일치하지 않아요.');if(s.expires<=env.now())fail('EXPIRED','통계 등록 기한이 지났어요. 결과는 이 기기에 남습니다.');if(repo.paused(s.collection))fail('PAUSED','통계 집계가 잠시 중지되어 있어요. 나중에 다시 시도해 주세요.');
  const c=catalog.find(c=>c.id===s.collection&&c.version===s.version);if(!Array.isArray(q.picks)||q.picks.length>127||!q.picks.every(x=>typeof x==='string'&&x.length<100))fail('PATH','선택 기록 형식이 올바르지 않아요.');
  let state;try{state=G.replay({...s.game,picks:q.picks},c.candidates.map(x=>x.id),c.version);}catch{fail('PATH','발급된 대진과 선택 기록이 일치하지 않아요.');}
  if(!state.winner||state.winner!==q.winner)fail('INCOMPLETE','결승까지 완료한 게임만 등록할 수 있어요.');
  if(env.now()-s.issued<15000)fail('TOO_FAST','통계 등록을 잠시 후 다시 시도해 주세요.');
  const row={id:s.id,collection:s.collection,version:s.version,size:s.size,winner:state.winner,at:new Date(env.now()).toISOString(),excluded:false,reason:''};
  repo.addResult(row); // Append ledger first. A lost response is recovered by the lookup above.
  return receipt(row,false);
 }
 function receipt(row,already){return {ok:true,environment:env.environment,id:row.id,winner:row.winner,already,excluded:row.excluded,acceptedAt:row.at};}
 function ranks(q){const c=scope(q),ids=c.candidates.map(x=>x.id),seen=new Set();const all=repo.results().filter(r=>{if(seen.has(r.id)||r.excluded||r.collection!==c.id||r.version!==c.version||r.size!==q.size||!ids.includes(r.winner))return false;seen.add(r.id);return true;});const ranked=G.ranking(all,q.size,c.version);const counts=new Map(ranked.rows.map(x=>[x.id,x]));let prev=-1,rank=0;
  const rows=ids.map(id=>counts.get(id)||{id,wins:0,percent:0}).sort((a,b)=>b.wins-a.wins||a.id.localeCompare(b.id)).map((r,i)=>{if(r.wins!==prev)rank=i+1;prev=r.wins;return {...r,rank};});
  return {ok:true,environment:env.environment,collection:c.id,version:c.version,size:q.size,total:all.length,rows,updatedAt:new Date(env.now()).toISOString(),policy:'completed-game'};
 }
 function handle(q){if(!q||typeof q!=='object'||JSON.stringify(q).length>20000)fail('INPUT','요청 크기를 확인해 주세요.');if(q.action==='start')return start(q);if(q.action==='finish')return finish(q);if(q.action==='ranks')return ranks(q);if(q.action==='health')return {ok:true,environment:env.environment,policy:'completed-game',collections:catalog.map(c=>({id:c.id,version:c.version,rounds:c.rounds}))};fail('ACTION','지원하지 않는 요청입니다.');}
 return {handle};
}
return {createService};

})();
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
