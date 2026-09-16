const songs=require('../data/stage-songs.json');
const mappings=require('../data/stage-sources.json');
const normalize=s=>String(s).trim().toLowerCase().replace(/\s+/g,'');
const songByTitle=title=>songs.find(s=>[s.name,...s.aliases].some(x=>normalize(x)===normalize(title)));
const songPath=s=>'/music/stages/'+s.id+'/';
function videoId(url){try{const u=new URL(url);if(u.hostname==='youtu.be')return u.pathname.slice(1).match(/^[\w-]{11}$/)?.[0]||'';if(['youtube.com','www.youtube.com','m.youtube.com'].includes(u.hostname))return (u.searchParams.get('v')||'').match(/^[\w-]{11}$/)?.[0]||'';}catch(_){}return '';}
// A mapping selects an existing source, never all links on a multi-song event.
function performances(archive,songId,cutoff){
 const rows=new Map(archive.map(x=>[x.id,x]));const grouped=new Map();
 for(const mapping of mappings){
  if(!mapping.songIds.includes(songId))continue;
  const row=rows.get(mapping.archiveId);
  if(!row||row.hidden||row.eventState==='scheduled'||(row.date&&row.date>cutoff))continue;
  const source=[row.source,...(row.additionalSources||[])].find(x=>x?.url===mapping.url);
  if(!source||!videoId(source.url))continue;
  if(!grouped.has(row.id))grouped.set(row.id,{...row,category:mapping.category,clips:[]});
  const event=grouped.get(row.id);
  if(!event.clips.some(x=>x.url===source.url))event.clips.push({...source,scope:mapping.scope});
 }
 return [...grouped.values()].sort((a,b)=>String(b.date).localeCompare(String(a.date))||a.id.localeCompare(b.id));
}
module.exports={songs,mappings,songByTitle,songPath,videoId,performances};
