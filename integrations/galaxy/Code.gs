// 새 비공개 스프레드시트에 바인딩한 후 setupGalaxy를 한 번 실행하세요.
const GALAXY = 'seeya-galaxy-test-v1';
const TAB = '은하수 테스트 편지';
const ORIGINAL_HEAD = ['별 ID','받는 사람','닉네임','편지','색','위치','작성일','수정 번호','마지막 요청','비밀번호 검증값'];
// Keep the creation timestamp last so an edit never rewrites the original instant.
const HEAD = ORIGINAL_HEAD.concat(['편지 글자 수','마지막 수정 시각 (한국)','최초 작성 시각 (한국)']);

function setupGalaxy() {
  const lock = LockService.getScriptLock();
  lock.waitLock(15000);
  try { prepareGalaxy_(); SpreadsheetApp.flush(); }
  finally { lock.releaseLock(); }
}

function prepareGalaxy_() {
  const book = SpreadsheetApp.getActiveSpreadsheet();
  const tab = book.getSheetByName(TAB) || book.insertSheet(TAB);
  if (!tab.getLastRow()) {
    tab.appendRow(HEAD);
    tab.setFrozenRows(1);
  } else {
    const existing = tab.getRange(1,1,1,HEAD.length).getValues()[0];
    if (existing.slice(0,ORIGINAL_HEAD.length).join('|') !== ORIGINAL_HEAD.join('|')) throw Error('SETUP');
    if (existing.slice(ORIGINAL_HEAD.length).every(v=>v==='') && tab.getLastColumn() === ORIGINAL_HEAD.length) {
      tab.getRange(1,11,1,3).setValues([HEAD.slice(10)]);
    }
  }
  checkHeader_(tab);
  tab.getRange('L2:M').setNumberFormat('yyyy-mm-dd hh:mm:ss');
  const n = tab.getLastRow()-1;
  if (n > 0) {
    const rows = tab.getRange(2,1,n,4).getValues();
    tab.getRange(2,11,n,1).setValues(rows.map(r=>[r[1] ? Array.from(r[3].slice(1)).length : '']));
  }
  const props = PropertiesService.getScriptProperties();
  props.setProperty('GALAXY_BOOK', book.getId());
  if (!props.getProperty('GALAXY_SECRET')) props.setProperty('GALAXY_SECRET', Utilities.getUuid() + Utilities.getUuid());
}

function checkHeader_(tab) {
  if (!tab || tab.getRange(1,1,1,HEAD.length).getValues()[0].join('|') !== HEAD.join('|')) throw Error('SETUP');
}

function reply_(fn) {
  let payload;
  try { payload = Object.assign({ok:true}, fn()); }
  catch (e) {
    const codes = ['INVALID','PASSWORD','BUSY','MISSING','CONFLICT','SETUP','LIMIT'];
    payload = {ok:false, code:codes.includes(e.message) ? e.message : 'SERVER'};
  }
  payload.service = GALAXY;
  return ContentService.createTextOutput(JSON.stringify(payload)).setMimeType(ContentService.MimeType.JSON);
}

function table_() {
  const id = PropertiesService.getScriptProperties().getProperty('GALAXY_BOOK');
  if (!id) throw Error('SETUP');
  const tab = SpreadsheetApp.openById(id).getSheetByName(TAB);
  checkHeader_(tab);
  return tab;
}

// Prefix text cells so Sheets preserves numeric nicknames and never evaluates letter text.
function publicRow_(r) {
  return {id:r[0], recipient:r[1], nickname:r[2].slice(1), body:r[3].slice(1),
    color:r[4], place:r[5], date:r[6].slice(1), revision:r[7]};
}

function doGet() {
  return reply_(function() {
    const rows = table_().getDataRange().getValues().slice(1);
    return {schemaVersion:2, letters:rows.filter(r=>r[1]).map(publicRow_)};
  });
}

function doPost(e) {
  return reply_(function() {
    if (!e.postData || e.postData.contents.length > 12000) throw Error('INVALID');
    const q = JSON.parse(e.postData.contents);
    const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;
    if (q.service !== GALAXY || !uuid.test(q.id) || !uuid.test(q.requestId) ||
        !['create','edit','delete'].includes(q.action) || !/^[0-9a-f]{64}$/.test(q.proof)) throw Error('INVALID');
    if (q.action !== 'delete') {
      if (!['씨야','남규리','김연지','이보람'].includes(q.recipient) ||
          typeof q.nickname !== 'string' || !q.nickname.trim() || q.nickname.length > 20 ||
          typeof q.body !== 'string' || !q.body.trim() || q.body.length > 1000 ||
          !['#f5d9bf','#bfcdf9','#dfc6fc','#f4b9d3','#90e2cc','#ffcf60'].includes(q.color) ||
          !Number.isFinite(q.place) || q.place < .05 || q.place > .95) throw Error('INVALID');
    }
    const lock = LockService.getScriptLock();
    if (!lock.tryLock(8000)) throw Error('BUSY');
    try {
      const result = change_(q);
      SpreadsheetApp.flush();
      return result;
    } finally { lock.releaseLock(); }
  });
}

function change_(q) {
  const tab = table_(), last = tab.getLastRow();
  const cell = last > 1 && tab.getRange(2,1,last-1,1).createTextFinder(q.id).matchEntireCell(true).findNext();
  const rowNumber = cell ? cell.getRow() : last+1;
  const prior = cell && tab.getRange(rowNumber,1,1,HEAD.length).getValues()[0];
  const secret = PropertiesService.getScriptProperties().getProperty('GALAXY_SECRET');
  if (!secret) throw Error('SETUP');
  const digest = Utilities.base64Encode(Utilities.computeHmacSha256Signature(q.id+'|'+q.proof,secret));
  if (prior) {
    const cache = CacheService.getScriptCache(), tries = Number(cache.get(q.id) || 0);
    if (tries >= 8) throw Error('LIMIT');
    if (prior[9] !== digest) {
      cache.put(q.id,String(tries+1),60);
      throw Error('PASSWORD');
    }
    if (prior[8] === q.requestId) return prior[1] ? {letter:publicRow_(prior)} : {id:q.id};
    if (!prior[1]) throw Error('MISSING');
    if (q.action === 'create' || q.revision !== prior[7]) throw Error('CONFLICT');
  } else if (q.action !== 'create') throw Error('MISSING');
  const now = new Date();
  const date = prior ? prior[6] : '\u200b'+Utilities.formatDate(now,'Asia/Seoul','yyyy-MM-dd');
  // Sheets date serial for the Korean wall clock, independent of the book's time zone.
  const stamp = 25569 + (Math.floor(now.getTime()/1000) + 9*3600)/86400;
  const revision = prior ? prior[7]+1 : 1;
  const deleted = q.action === 'delete';
  const row = deleted ? [q.id,'','','','','','',revision,q.requestId,digest] :
    [q.id,q.recipient,'\u200b'+q.nickname.trim(),'\u200b'+q.body.trim(),q.color,q.place,date,revision,q.requestId,digest];
  if (deleted) row.push('','','');
  else {
    row.push(Array.from(q.body.trim()).length, prior ? stamp : '');
    if (!prior) row.push(stamp);
  }
  if (rowNumber > tab.getMaxRows()) {
    tab.insertRowsAfter(last,100);
    tab.getRange(last+1,12,100,2).setNumberFormat('yyyy-mm-dd hh:mm:ss');
  }
  tab.getRange(rowNumber,1,1,row.length).setValues([row]);
  return deleted ? {id:q.id} : {letter:publicRow_(row)};
}
