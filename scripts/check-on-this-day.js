const assert=require('node:assert/strict');
const {koreaDate,selectOnThisDay,onThisDay}=require('../src/shared/on-this-day');
assert.equal(koreaDate(new Date('2026-09-12T14:59:59Z')),'2026-09-12');
assert.equal(koreaDate(new Date('2026-09-12T15:00:00Z')),'2026-09-13');
const rows=[
 {id:'old',date:'2006-09-13',title:'옛 무대',type:'music-show'},
 {id:'published',publishedDate:'2011-09-13',title:'영상',type:'official'},
 {id:'tentative',date:'2008-09-13',dateStatus:'tentative',dateBasis:'event',title:'<잠정>',type:'event',source:{label:'일정표',url:'https://docs.google.com/spreadsheets/d/example'}},
 {id:'old',date:'2006-09-13',title:'중복'},
 {id:'this-year',date:'2026-09-13'},
 {id:'future',date:'2027-09-13'},
 {id:'other',date:'2011-09-12'},
 {id:'season',date:'2011-09-13',dateBasis:'season',endDate:'2012-02-12'},
 {id:'unknown',date:'2011-09-13',dateStatus:'unknown'},
 {id:'scheduled',date:'2011-09-13',eventState:'scheduled'},
 {id:'cancelled',date:'2011-09-13',eventState:'cancelled'},
 {id:'hidden',date:'2011-09-13',hidden:true},
 {id:'partial',date:'2011-09'},
];
const now=new Date('2026-09-13T02:00:00Z');
assert.deepEqual(selectOnThisDay(rows,now).records.map(x=>x.id),['published','tentative','old']);
const html=onThisDay(rows,now);
assert(html.includes('영상 게시일'));assert(html.includes('(잠정)'));assert(html.includes('&lt;잠정&gt;'));assert(!html.includes('href="https://docs.google.com'));
const leap=[{id:'leap',date:'2020-02-29'},{id:'invalid',date:'2021-02-29'}];
assert.deepEqual(selectOnThisDay(leap,new Date('2024-02-29T00:00:00Z')).records.map(x=>x.id),['leap']);
assert.equal(selectOnThisDay(leap,new Date('2025-02-28T00:00:00Z')).records.length,0);
assert(onThisDay([],now).includes('9월 13일의 과거 기록을 기다리고 있어요.'));
const archive=require('../data/archive.json');
const sample=archive.find(x=>/^20\d\d-\d\d-\d\d$/.test(x.date||'')&&Number(x.date.slice(0,4))<2026&&x.dateBasis==='broadcast'&&x.dateStatus==='confirmed');
assert(sample);assert(selectOnThisDay(archive,new Date('2026'+sample.date.slice(4)+'T03:00:00Z')).records.some(x=>x.id===sample.id));
console.log('PASS: Korea midnight, exact month/day, prior years, leap day, uncertain dates, source labels, empty state, archive match');
