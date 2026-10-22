// Only this site-controlled HTTPS resource may supply candidates. Caller input never chooses a URL.
var WORLDCUP_CATALOG_URL='https://seeya-fanpage.com/game/worldcup/catalog.json';
function validateCatalog_(data){
 if(!data||data.schema!==1||!Array.isArray(data.collections)||!data.collections.length||data.collections.length>100)throw Error('목록 형식 오류');
 var used=new Set(),text=function(x,max){return typeof x==='string'&&x.length>0&&x.length<=max;};
 data.collections.forEach(function(c){
  if(!text(c.id,80)||!/^[\w-]+$/.test(c.id)||used.has(c.id)||!text(c.version,160)||!/^[\w-]+$/.test(c.version)||!text(c.title,150))throw Error('종류 형식 오류');used.add(c.id);
  if(!Array.isArray(c.candidates)||c.candidates.length<2||c.candidates.length>128||!Array.isArray(c.rounds)||!c.rounds.length||new Set(c.rounds).size!==c.rounds.length)throw Error('후보 수 오류');
  var ids=new Set();c.candidates.forEach(function(r){if(!text(r.id,99)||!/^[\w-]+$/.test(r.id)||ids.has(r.id)||!text(r.title,200)||typeof r.artist!=='string'||r.artist.length>150||typeof r.album!=='string'||r.album.length>250)throw Error('후보 형식 오류');ids.add(r.id);});
  if(c.rounds.some(function(n){return n!=='all'&&(![16,32,64].includes(n)||n>c.candidates.length);})||JSON.stringify(c).length>40000)throw Error('라운드 형식 오류');
 });return data.collections;
}
function loadCatalog_(book,force){
 var props=PropertiesService.getScriptProperties(),sheet=book.getSheetByName('Catalogs')||book.insertSheet('Catalogs');
 if(!sheet.getLastRow())sheet.appendRow(['collection','version','active','definition']);
 var rows=sheet.getLastRow()<2?[]:sheet.getRange(2,1,sheet.getLastRow()-1,4).getValues();
 var saved=rows.map(function(r){return Object.assign(JSON.parse(r[3]),{active:r[2]===true});});
 var checked=Number(props.getProperty('CATALOG_CHECKED_AT')||0),now=Date.now();
 if(!force&&saved.some(function(c){return c.active;})&&now-checked<60000)return saved;
 try{
  var response=UrlFetchApp.fetch(WORLDCUP_CATALOG_URL,{followRedirects:false,muteHttpExceptions:true});
  var body=response.getContentText();if(response.getResponseCode()!==200||body.length>2000000)throw Error('목록 서버 응답 오류');
  var current=validateCatalog_(JSON.parse(body)),next=saved.map(function(c){return Object.assign({},c,{active:false});});
  // Bootstrap games issued before automatic catalogs were introduced. Keep their IDs/versions intact.
  WORLDCUP_CATALOG.forEach(function(c){if(!next.some(function(x){return x.id===c.id&&x.version===c.version;}))next.push(Object.assign({},c,{active:false}));});
  current.forEach(function(c){var old=next.find(function(x){return x.id===c.id&&x.version===c.version;});
   if(old&&JSON.stringify([old.rounds,old.candidates.map(function(r){return r.id;}).sort()])!==JSON.stringify([c.rounds,c.candidates.map(function(r){return r.id;}).sort()]))throw Error('같은 구성 버전의 후보가 변경되었습니다.');
   if(old)Object.assign(old,c,{active:true});else next.push(Object.assign({},c,{active:true}));
  });
  if(next.length>500)throw Error('후보 이력 점검이 필요합니다.');
  var values=next.map(function(c){return [c.id,c.version,c.active,JSON.stringify(c)];});
  if(sheet.getMaxRows()<values.length+1)sheet.insertRowsAfter(sheet.getMaxRows(),values.length+1-sheet.getMaxRows());
  sheet.getRange(2,1,values.length,4).setValues(values);SpreadsheetApp.flush();props.setProperty('CATALOG_CHECKED_AT',String(now));props.deleteProperty('CATALOG_LAST_ERROR');return next;
 }catch(e){props.setProperty('CATALOG_LAST_ERROR',String(e.message).slice(0,300));
  if(saved.some(function(c){return c.active;})&&now-checked<86400000)return saved;
  throw Error('사이트의 월드컵 목록을 읽지 못했습니다. 사이트를 먼저 배포해 주세요.');
 }
}
