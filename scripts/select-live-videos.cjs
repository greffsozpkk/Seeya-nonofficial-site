// Review the printed changes before using --apply. Durations are not proof of completeness.
const fs=require('node:fs'),meta=require('../src/data/live-evidence.json');
const groups=require('../output/live-video-audit/candidates.json'),cache=require('../output/live-video-audit/metadata.json');
const tracks=require('../src/data/worldcup-songs.json').candidates;
const archive=require('../data/archive.json');
const info=s=>cache[new URL(s.url).searchParams.get('v')]||{};
let changed=0,short=0,unknown=0;const report=[];
for(const e of meta.evidence){
 const group=groups.find(g=>g.sessionId===e.sessionId&&g.songId===e.songId);
 const track=tracks.find(t=>t.id===meta.songs.find(s=>s.id===e.songId).trackId);
 const seconds=String(track.duration||'3:30').split(':').reduce((n,v)=>n*60+Number(v),0),threshold=Math.max(150,seconds*.8);
 const adequate=s=>{const v=info(s);return v.durationSeconds>=threshold&&v.shortsEligible===false&&!/메들리|일부|한소절|shorts/i.test(s.label||'');};
 const row=archive.find(r=>r.id===meta.sessions.find(s=>s.id===e.sessionId).archiveId);
 let selected=group.sources.find(s=>s.url===e.sources[0].url)||[row.source,...row.additionalSources].find(s=>s.url===e.sources[0].url);
 const candidates=group.sources.filter(adequate).sort((a,b)=>Math.abs(info(a).durationSeconds-seconds)-Math.abs(info(b).durationSeconds-seconds));
 if(!adequate(selected)&&candidates.length)selected=candidates[0];
 const v=info(selected),old=info(e.sources[0]);
 const excerpt=!!v.durationSeconds&&(v.shortsEligible||v.durationSeconds<150||/메들리|일부|한소절|shorts/i.test(selected.label));
 if(selected.url!==e.sources[0].url){changed++;report.push(`${group.sessionId} ${group.name}: ${old.durationSeconds??'?'}s → ${v.durationSeconds}s | ${selected.label} | ${selected.url}`);}
 if(excerpt){short++;report.push(`REMAINS ${group.sessionId} ${group.name} ${v.durationSeconds}s | ${selected.label} | ${selected.url}`);}
 if(!v.durationSeconds){unknown++;report.push(`UNKNOWN ${group.sessionId} ${group.name} | ${selected.url}`);}
 e.sources=[{url:selected.url,scope:excerpt?'excerpt':'documented',...(selected.videoTitle?{videoTitle:selected.videoTitle}:{}),...(v.durationSeconds?{durationSeconds:v.durationSeconds}:{}),...(typeof v.shortsEligible==='boolean'?{shortsEligible:v.shortsEligible}:{}),durationCheckedAt:'2026-11-24'}];
}
const result=`Replaced ${changed}; excerpts ${short}; unavailable metadata ${unknown}\n`+report.join('\n')+'\n';
fs.writeFileSync('output/live-video-audit/selection-review.txt',result);console.log(result);
if(process.argv.includes('--apply'))fs.writeFileSync('src/data/live-evidence.json',JSON.stringify(meta,null,2)+'\n');
