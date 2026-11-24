'use strict';
const config=require('../data/live-evidence.json');
const tracks=require('../data/worldcup-songs.json').candidates;
const stage=require('../data/stage-songs.json');
const daily=require('../data/today-songs.json');
const {sources}=require('./concert-data');
const {videoId}=require('./stage-data');
const normalize=s=>String(s||'').normalize('NFKC').toLowerCase().replace(/[\s.,()]/g,'').replace(/livever/g,'');
function catalog(archive,diary={tour:[]},metadata=config){
 const by=new Map(archive.filter(r=>!r.hidden&&!r.mergedInto&&r.eventState!=='cancelled').map(r=>[r.id,r]));
 const sessions=metadata.sessions.filter(s=>by.has(s.archiveId)).map(s=>{
  const r=by.get(s.archiveId);if(s.date<r.date||s.date>(r.endDate||r.date))throw Error('Live session outside archive date: '+s.id);
  return {...s,venue:r.venue||'공연장 확인 중',diaryEventId:(diary.tour||[]).find(t=>t.archiveId===s.archiveId&&t.date===s.date)?.eventId||'',archiveTitle:r.title};
 });
 const songs=metadata.songs.map(ref=>{const track=tracks.find(t=>t.id===ref.trackId);if(!track)throw Error('Missing song '+ref.id);const st=stage.find(s=>s.id===ref.stageId),day=daily.find(s=>normalize(s.song)===normalize(track.songRef));return {...ref,name:ref.displayName||st?.name||track.songRef,album:(st?.album||day?.album||'기타 발표곡').replace(/ · \d{4}$/,'').replace('Brillant Change','Brilliant Change'),aliases:st?.aliases||[]};});
 const evidence=[];
 for(const e of metadata.evidence){const session=sessions.find(s=>s.id===e.sessionId);if(!session||!songs.some(s=>s.id===e.songId))continue;
  const known=sources(by.get(session.archiveId));
  const links=e.sources.map(ref=>{const original=known.find(s=>s.url===ref.url);return original?{...original,label:ref.videoTitle&&!original.label?.includes(ref.videoTitle)?original.label+' · '+ref.videoTitle:original.label,scope:ref.scope,durationSeconds:ref.durationSeconds||null,shortsEligible:ref.shortsEligible??null,videoId:videoId(ref.url)}:null;}).filter(Boolean);
  if(!links.length)continue;
  if(e.status==='not-performed'&&session.setlistCompleteness!=='complete')continue;
  evidence.push({...e,sources:links});
 }
 return {checkedAt:metadata.checkedAt,scopeNote:metadata.scopeNote,tourId:metadata.tourId,sessions,songs,evidence,diaryKey:require('./passport').KEY};
}
module.exports={catalog,...require('./live-state')};
