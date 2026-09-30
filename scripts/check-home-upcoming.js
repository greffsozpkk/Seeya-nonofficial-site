'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {upcomingSchedule,homeUpcoming}=require('../src/shared/home-upcoming');
const {buildEvents}=require('../src/shared/calendar-data');
const {selectionFromURL}=require('../src/shared/calendar-state');
const now=new Date('2026-09-30T12:00:00+09:00');
const row=(id,date,extra={})=>({id,date,title:id,members:['김연지'],type:'event',dateStatus:'confirmed',dateBasis:'event',eventState:'scheduled',...extra});
const fixtures=[row('past','2026-09-29'),row('today','2026-09-30'),row('timed','2026-10-02',{calendar:{time:'19:00'}}),row('untimed','2026-10-02'),row('sunday','2026-10-04'),row('next-week','2026-10-05'),row('cancelled','2026-10-01',{eventState:'cancelled'}),row('cal-cancelled','2026-10-01',{calendar:{state:'cancelled'}}),row('completed','2026-10-01',{eventState:'completed'}),row('hidden','2026-10-01',{hidden:true}),row('disabled','2026-10-01',{calendar:{enabled:false}}),row('uncertain','2026-10-01',{dateStatus:'estimated'}),row('posted','2026-10-01',{dateBasis:'upload'}),row('season','2026-10-01',{dateBasis:'season',endDate:'2026-12-30'})];
let selected=upcomingSchedule(fixtures,now);
assert.equal(selected.weekStart,'2026-09-28');assert.equal(selected.weekEnd,'2026-10-04');
assert.deepEqual(selected.events.map(e=>e.id),['activity-today','activity-timed','activity-untimed','activity-sunday']);
assert.equal(upcomingSchedule(Array.from({length:8},(_,i)=>row('many-'+i,'2026-10-01')),now).events.length,5);
selected=upcomingSchedule([row('later','2026-10-10')],now);
assert.equal(selected.thisWeek,false);assert.equal(selected.events.length,1);
assert.match(homeUpcoming([],now),/새로운 만남을 기다리고/);
assert(!homeUpcoming([row('unknown-time','2026-10-01')],now).includes('시간 미정'));
assert(homeUpcoming([row('known-time','2026-10-01',{calendar:{time:'17:50'}})],now).includes('17:50'));
assert.match(homeUpcoming([row('later','2026-10-10')],now),/다가오는 씨야/);
// KST midnight, Sunday -> Monday, and year boundary must switch the window correctly.
assert.equal(upcomingSchedule(fixtures,new Date('2026-10-04T14:59:59Z')).events[0].id,'activity-sunday');
assert.equal(upcomingSchedule(fixtures,new Date('2026-10-04T15:00:00Z')).events[0].id,'activity-next-week');
assert.equal(upcomingSchedule([],new Date('2026-12-31T12:00:00+09:00')).weekEnd,'2027-01-03');
const grouped=[row('one','2026-10-01',{calendar:{groupId:'show'}}),row('two','2026-10-01',{calendar:{groupId:'show'}})];
assert.equal(upcomingSchedule(grouped,now).events.length,1);
assert.equal(upcomingSchedule([row('ongoing','2026-09-29',{endDate:'2026-10-02'})],now).events.length,1);
assert.match(homeUpcoming([row('escape','2026-10-01',{title:'<script>alert("x")</script>'})],now),/&lt;script&gt;/);
assert(!homeUpcoming([row('escape','2026-10-01',{title:'<script>alert("x")</script>'})],now).includes('<script>'));
const root=path.resolve(__dirname,'..'),rows=JSON.parse(fs.readFileSync(path.join(root,'data/archive.json'),'utf8'));
const rendered=homeUpcoming(rows,now),events=buildEvents(rows);
for(const href of rendered.matchAll(/href="([^\"]+)"/g)){
 const url=new URL(href[1].replaceAll('&amp;','&'),'https://seeya-fanpage.com');
 const state=selectionFromURL(url.search,events,'2026-09-30');
 if(url.searchParams.has('event')){
  assert.equal(state.event,url.searchParams.get('event'));
  assert.equal(state.day,events.find(e=>e.id===state.event).date);
 }else assert.equal(state.day,'','All schedules link should show the month');
}
const html=fs.readFileSync(path.join(root,'index.html'),'utf8');
assert(html.includes('id="homeUpcoming"'),'Schedule must exist before JavaScript runs');
assert(html.indexOf('class="home-visual"')<html.indexOf('id="homeUpcoming"'));
assert(html.indexOf('id="homeUpcoming"')<html.indexOf('class="home-video"'));
console.log('PASS: HOME schedule date/week boundaries, 5-item limit, exclusions, fallback, escaping, grouping and calendar links.');
