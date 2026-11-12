'use strict';
const {venues}=require('../data/map-archive-links.json');
const collections=require('../data/concerts.json');
function homeLinks(places,tour){
 const byId=new Map(places.map(p=>[p.id,p]));
 const directions={};
 for(const [venue,id] of Object.entries(venues)){
  const p=byId.get(id);
  if(!p||p.historical||p.operatingStatus==='closed'||p.locationPrecision==='area'||(p.country&&p.country!=='KR'))continue;
  directions[venue]='https://map.kakao.com/link/to/'+encodeURIComponent(p.name||venue)+','+p.coordinates.join(',');
 }
 const concerts={};
 for(const collection of collections){
  for(const event of collection.events){
   const sessions=tour.filter(s=>s.archiveId===event.id).map(s=>({date:s.date,id:s.eventId}));
   concerts[event.id]={label:event.label,sessions:sessions.length>1?sessions:[],href:'/archive/concerts/'+collection.id+'/?event='+encodeURIComponent(event.id)};
  }
 }
 return {venues:directions,concerts};
}
module.exports={homeLinks};
