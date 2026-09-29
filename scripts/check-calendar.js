'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'..'),read=p=>fs.readFileSync(path.join(root,p),'utf8'),json=p=>JSON.parse(read(p));
const {buildEvents,occurrences,filterEvents,exactDate,koreaDate}=require('../src/shared/calendar-data');
const {calendarICS}=require('../src/shared/calendar-ics');
const {eventCard,monthContent}=require('../src/shared/calendar-view');
const data=json('calendar/events.json'),archive=json('data/archive.json');
assert(data.events.length>400);assert.equal(data.anniversaries.length,11);assert.equal(new Set([...data.events,...data.anniversaries].map(e=>e.id)).size,data.events.length+data.anniversaries.length);
const byId=new Map(archive.map(r=>[r.id,r]));
for(const e of data.events)for(const id of e.recordIds){const r=byId.get(id);assert(r);assert.equal(e.date,r.date);assert.equal(r.dateStatus,'confirmed');assert(['event','broadcast','release','recording'].includes(r.dateBasis));}
assert.equal(data.events.filter(e=>e.recordIds.includes('v480-stage-040')).length,1);assert(data.events.find(e=>e.recordIds.includes('v480-stage-040')).recordIds.includes('20091204-seeya-sketchbook30'));
assert(!data.events.some(e=>e.recordIds.includes('20261215-boram-six-season')));
const base={id:'test',date:'2026-10-02',dateStatus:'confirmed',dateBasis:'event',type:'event',title:'행사',members:['김연지'],source:{label:'공식',url:'https://example.com/'},addedAt:'2026-09-30'};
for(const patch of [{date:'2026-02-30'},{dateStatus:'tentative'},{dateBasis:'video-published'},{dateBasis:'series-start'},{calendar:{enabled:false}},{hidden:true}])assert.equal(buildEvents([{...base,...patch}]).length,0);
const event=buildEvents([base])[0],rescheduled=buildEvents([{...base,date:'2026-10-04',updatedAt:'2026-09-30T13:00:00+09:00',calendar:{state:'changed',sequence:1}}])[0];
assert.equal(event.id,rescheduled.id);assert(calendarICS([rescheduled]).includes('SEQUENCE:1'));assert(calendarICS([rescheduled]).includes('LAST-MODIFIED:20260930T040000Z'));
const cancelled=buildEvents([{...base,eventState:'cancelled'}])[0];assert.equal(cancelled.id,event.id);assert(calendarICS([cancelled]).includes('STATUS:CANCELLED'));assert(!eventCard(cancelled).includes('data-save'));
const utc=calendarICS([buildEvents([{...base,calendar:{time:'00:30',endTime:'01:00'}}])[0]]);assert(utc.includes('DTSTART:20261001T153000Z'));assert(utc.includes('DTEND:20261001T160000Z'));
const whole=calendarICS([event]);assert(whole.includes('DTSTART;VALUE=DATE:20261002'));assert(whole.includes('DTEND;VALUE=DATE:20261003'));assert(!whole.includes('VALARM'));
assert.throws(()=>buildEvents([{...base,calendar:{time:'25:00'}}]));assert.throws(()=>buildEvents([{...base,calendar:{time:'19:00',endTime:'18:00'}}]));
const span=buildEvents([{...base,date:'2026-12-31',endDate:'2027-01-02'}])[0];assert.equal(occurrences([span],'2027-01').length,1);assert.equal(monthContent([span],{month:'2027-01',day:'2027-01-02'}).count,1);assert(calendarICS([span]).includes('DTEND;VALUE=DATE:20270103'));
assert.equal(koreaDate(new Date('2026-09-29T15:00:00Z')),'2026-09-30');assert(exactDate('2028-02-29'));assert(!exactDate('2027-02-29'));
const annual={...event,id:'leap',date:'2020-02-29',annual:true};assert.equal(occurrences([annual],'2027-02').length,0);assert.equal(occurrences([annual],'2028-02')[0].date,'2028-02-29');assert.equal(occurrences([annual],'2016-02').length,0);
assert.equal(filterEvents([event],{member:'남규리'}).length,0);assert.equal(filterEvents([event],{member:'김연지'}).length,1);assert.equal(filterEvents([annual],{anniversaries:false}).length,0);
const grid=monthContent([annual],{month:'2028-02'});assert.equal((grid.grid.match(/data-day=/g)||[]).length,29);assert.equal(monthContent([event],{month:'2026-11'}).count,0);
assert(eventCard({...event,title:'<img src=x onerror=alert(1)>',note:'a\nb'}).includes('&lt;img'));assert(eventCard({...event,note:'a\nb'}).includes('a<br>b'));
const sample=calendarICS([{...event,title:'한글🙂'.repeat(60)+' ,;\\',note:'line\r\nnext,;\\'}]);
for(const line of sample.split('\r\n'))assert(Buffer.byteLength(line,'utf8')<=75);assert(sample.replace(/\r\n /g,'').includes('DESCRIPTION:김연지\\n시간 미정\\nline\\nnext\\,\\;\\\\'));
for(const [file,events] of [['activities',data.events],['anniversaries',data.anniversaries]]){
 const raw=read('calendar/'+file+'.ics');assert.equal((raw.match(/BEGIN:VEVENT/g)||[]).length,events.length);assert(!raw.replace(/\r\n/g,'').includes('\n'));for(const line of raw.split('\r\n'))assert(Buffer.byteLength(line)<=75);assert(raw.endsWith('END:VCALENDAR\r\n'));
 const unfolded=raw.replace(/\r\n /g,'');for(const e of events)assert(unfolded.includes('UID:'+e.id+'@seeya-fanpage.com'));
 assert.equal((unfolded.match(/RRULE:FREQ=YEARLY/g)||[]).length,file==='anniversaries'?events.length:0);
}
assert(read('sitemap.xml').includes('https://seeya-fanpage.com/calendar/'));
assert(read('src/template.html').includes('href="/calendar/">CALENDAR'));
assert(read('.github/workflows/update-news.yml').includes('branches: [main]'));
for(const p of ['build.yml','update-news.yml'])assert(read('.github/workflows/'+p).includes('assets calendar sitemap.xml'));
console.log(`PASS calendar: ${data.events.length} deduplicated activities / ${data.anniversaries.length} annual dates; actual dates, KST, filters, leap day, UID changes/cancellation, UTF-8 ICS folding, feeds and automatic build wiring.`);
