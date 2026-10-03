'use strict';
const {resolveRadio,filterRadio}=require('./radio');
const {resolvePodcasts}=require('./radio-podcasts');
module.exports=function(archive,today){
 const videos=resolveRadio(archive,require('../data/radio-pilot.json'),today);
 const ids=new Set(videos.map(r=>r.id));
 const spotify=require('../data/radio-spotify.json');
 const podcasts=resolvePodcasts(archive,require('../data/radio-podcasts.json'),today).filter(r=>!ids.has(r.id)).flatMap(r=>{
  const review=spotify.find(s=>s.recordId===r.id&&s.date===r.date&&s.status==='official-embed-checked'&&/^[A-Za-z0-9]{22}$/.test(s.episodeId)&&/^[A-Za-z0-9]{22}$/.test(s.showId));
  return review?[{...r,provider:'spotify',episodeId:review.episodeId,url:'https://open.spotify.com/episode/'+review.episodeId,embed:'https://open.spotify.com/embed/episode/'+review.episodeId,kind:'podcast',channel:review.publisher,channelStatus:'official-podcast'}]:[];
 });
 return filterRadio([...videos,...podcasts]);
};
