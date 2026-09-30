'use strict';
// Fill verified, missing schedule times without replacing web-managed records.
const updates=require('../src/data/archive-time-updates.json');
function applyArchiveUpdates(rows){
 return rows.map(row=>{
  const update=updates.find(u=>u.id===row.id&&u.date===row.date);
  if(!update||row.calendar?.enabled===false||row.calendar?.state==='cancelled'||row.hidden||row.eventState!=='scheduled'||row.dateStatus!=='confirmed'||!['event','broadcast',...(update.allowSeason?['season']:[])].includes(row.dateBasis))return row;
  const key=`schedule-${update.checkedAt}-${update.id}`;
  if(row.appliedUpdates?.includes(key)||(!update.fields&&!update.allowSeason&&row.calendar?.time))return row;
  if(update.fields&&row.updatedAt>update.checkedAt)return row;
  const existing=[row.source,...(row.additionalSources||[])].filter(Boolean);
  const additionalSources=[...(row.additionalSources||[]),...update.sources.filter(s=>!existing.some(old=>old.url===s.url))];
  const note=[row.note,update.note].filter(Boolean).join('\n');
  return {...row,note,...update.fields,...(update.calendar?{calendar:{...row.calendar,...update.calendar,sequence:(row.calendar?.sequence||0)+1}}:{}),additionalSources,appliedUpdates:[...(row.appliedUpdates||[]),key],updatedAt:[row.updatedAt||row.addedAt||update.checkedAt,update.checkedAt].sort().at(-1)};
 });
}
module.exports=applyArchiveUpdates;
