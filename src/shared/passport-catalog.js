'use strict';
const {placeIdsForRecord}=require('./map-archive');
module.exports=function buildPassportCatalog(archive,calendar,places,collection,asOf){
 const members=rows=>['남규리','김연지','이보람'].every(m=>rows.includes(m))?['seeya']:rows.map(m=>({'남규리':'gyuri','김연지':'yeonji','이보람':'boram'}[m])).filter(Boolean);
 const placeId=r=>placeIdsForRecord(r||{}).find(id=>places.some(p=>p.id===id))||'';
 const events=calendar.filter(e=>e.state!=='cancelled').map(e=>({id:e.id,type:e.type,title:e.title,date:e.date,endDate:e.endDate,time:e.time,venue:e.venue,members:members(e.members),archiveId:e.recordIds[0]||'',placeId:placeId(archive.find(r=>r.id===e.recordIds[0])),calendar:true}));
 const tour=[];
 for(const item of collection.events){
  const record=archive.find(r=>r.id===item.id&&!r.hidden&&r.eventState!=='cancelled');
  if(!record)continue;
  let event=events.find(e=>e.archiveId===item.id);
  if(!event){
   // Older concert records predate the calendar metadata. Reuse their existing date;
   // do not change the archive or imply that a calendar event exists.
   event={id:'activity-'+record.id,type:'performance',title:record.title,date:record.date,endDate:record.endDate||record.date,time:record.calendar?.time||'',venue:record.venue||'',members:members(record.members),archiveId:record.id,placeId:placeId(record),calendar:false};
   events.push(event);
  }
  event.city=item.label;
  const dates=item.passportDates||[event.date];
  const eventIds=dates.map(day=>{
   if(day===event.date)return event.id;
   if(day<event.date||day>event.endDate)throw Error('Tour session is outside recorded dates: '+item.id);
   const session={...event,id:event.id+'-'+day.replaceAll('-',''),date:day,endDate:day,time:'',calendar:false};
   events.push(session);return session.id;
  });
  for(const id of eventIds){const session=events.find(e=>e.id===id);tour.push({label:item.label,eventId:id,archiveId:session.archiveId,date:session.date,venue:session.venue});}
  if(eventIds.length>1)event.endDate=event.date;
 }
 const stage=require('../data/stage-songs.json'),daily=require('../data/today-songs.json');const songMap=new Map(stage.map(s=>[s.name,{id:s.id,title:s.name,album:s.album}]));for(const s of daily)if(!songMap.has(s.song))songMap.set(s.song,{id:'song-'+encodeURIComponent(s.song),title:s.song,album:s.album});
 return {asOf,songs:[...songMap.values()],characters:require('../data/character-gallery.json').filter(x=>['today','gallery'].includes(x.id)).map(x=>({id:x.id,image:x.image})),places:places.map(p=>({id:p.id,name:p.name,address:p.address})),events:events.sort((a,b)=>b.date.localeCompare(a.date)),tour};
};
