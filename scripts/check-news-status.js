const assert=require('node:assert/strict');
const {newsStatus}=require('../src/shared/news-status');
assert.equal(newsStatus({},'씨야'),'');
const data={lastCheckedAt:'2026-10-05T06:00:00Z',categoryContentUpdatedAt:{'씨야':'2026-10-04T01:00:00Z'},categoryStatus:{'씨야':{status:'unchanged'}}};
const text=newsStatus(data,'씨야');
assert(text.includes('최근 확인')&&text.includes('기사 반영')&&text.includes('추가 기사 없음'));
assert(newsStatus({...data,categoryStatus:{'씨야':{status:'error'}}},'씨야').includes('검색 연결 실패'));
assert(!newsStatus({lastCheckedAt:'invalid'},'씨야').includes('Invalid'));
console.log('PASS news: distinct check/content dates, empty and error status.');
