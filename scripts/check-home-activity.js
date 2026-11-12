'use strict';
const assert=require('node:assert/strict');
const {activityModel,activityActions,matches}=require('../src/shared/home-activity');
const {MEMBERS}=require('../src/shared/calendar-data');
const mobileTabs=require('../src/shared/mobile-tabs');
const now=new Date('2026-11-12T14:00:00+09:00');
function row(id,date,time='',extra={}){
 return {id,date,members:['김연지'],type:'concert',dateStatus:'confirmed',dateBasis:'event',eventState:'scheduled',title:id,calendar:{time},...extra};
}
const model=(rows,artist='전체')=>activityModel(rows,artist,now);
const rows=[
 row('tomorrow','2026-11-13','10:00'),row('past','2026-11-12','09:00',{eventState:'completed'}),
 row('next','2026-11-12','15:00'),row('unk','2026-11-12'),row('later','2026-11-12','16:00'),
 row('cancel','2026-11-12','11:00',{eventState:'cancelled'})
];
assert.equal(model(rows).feature.event.id,'activity-next');
assert.deepEqual(model(rows).other.map(x=>x.row.id),['later','unk','tomorrow']);
assert.equal(model(rows).notices.length,1);
assert(!matches('김연지',MEMBERS));assert(matches('씨야',MEMBERS));assert(matches('김연지',['남규리','김연지']));
const outside=row('next-week','2026-11-16','10:00',{addedAt:'2026-11-12'});
assert.equal(model([outside]).feature,undefined);
assert.equal(model([outside]).recent,null);
assert(!model([...rows,outside]).other.some(x=>x.row.id===outside.id));
const recent=row('older-performance','2007-11-01','',{eventState:'completed',addedAt:'2026-11-12'});
assert.equal(model([recent]).recent.row.id,recent.id);
assert(activityModel([recent],'전체',now,new Date('2026-11-10')).since);
assert(!model([row('none','2007-01-02')]).recent);
assert(!model([row('yesterday','2026-11-11')]).feature);
const entry=model([rows[2]]).feature;
assert.deepEqual(activityActions(entry,{venues:{},concerts:{}}).map(b=>b.label),['공연 안내','일정 담기']);
const incheon=require('../data/archive.json').find(r=>r.id==='20261031-the-fan-incheon');
for(const [date,state,rank] of [['2026-10-30','scheduled',1],['2026-10-31','scheduled',0],['2026-11-01','completed',2]]){
 const {feature}=activityModel([{...incheon,eventState:state}],'씨야',new Date(date+'T12:00:00+09:00'));
 assert.equal(feature.rank,rank);assert.equal(feature.row.id,incheon.id);
}
assert.equal(mobileTabs('/radio/').includes('aria-current'),false);
assert.equal((mobileTabs('/archive/concerts/the-fan-2026/').match(/aria-current/g)||[]).length,1);
console.log('PASS home activity priority, group/collaboration, notices, recent archive metadata, exact Incheon dates and mobile tabs.');
