'use strict';
const assert=require('node:assert/strict');
const apply=require('./apply-archive-updates');
const updates=require('../src/data/archive-time-updates.json');
const fixture=u=>({id:u.id,date:u.date,dateBasis:u.allowSeason?'season':'event',dateStatus:'confirmed',eventState:'scheduled',title:'Original',note:'Keep this note',source:{url:'https://example.com/original'},additionalSources:[{url:'https://example.com/new-user-link'}],calendar:{groupId:'keep-group',sequence:4},updatedAt:'2026-09-29'});
for(const u of updates){
 const before=fixture(u),saved=JSON.stringify(before),after=apply([before])[0];
 assert.equal(JSON.stringify(before),saved,'Input must not mutate');
 assert(after.additionalSources.some(s=>s.url==='https://example.com/new-user-link'));
 assert.deepEqual(apply([after]),[after],'Repeated builds must be idempotent');
 if(u.calendar){assert.equal(after.calendar.time,u.calendar.time);assert.equal(after.calendar.sequence,5);assert.equal(after.calendar.groupId,'keep-group');}
 if(u.fields){assert.equal(after.date,u.fields.date);assert.equal(after.id,before.id,'Keep calendar UID stable');}
 for(const patch of [{hidden:true},{calendar:{enabled:false}},{calendar:{state:'cancelled'}},{eventState:'cancelled'},{eventState:'completed'},{date:'2027-01-01'}]){
  const protectedRow={...before,...patch};assert.deepEqual(apply([protectedRow]),[protectedRow]);
 }
 if(!u.fields&&!u.allowSeason){const edited={...before,calendar:{time:'22:00'}};assert.deepEqual(apply([edited]),[edited]);}
 if(u.fields){const newer={...before,updatedAt:'2026-10-01'};assert.deepEqual(apply([newer]),[newer]);}
}
const custom={id:'new-user-record',date:'2027-01-01',note:'Preserve all fields'};
assert.deepEqual(apply([custom]),[custom]);
console.log('PASS: verified schedule updates, stable IDs, idempotence, newer edits and live records preserved.');
