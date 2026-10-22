'use strict';
function collections(){return [{...require('./worldcup-catalog')(),id:'group',title:'씨야 노래 월드컵',description:'씨야 앨범 수록곡과 OST·협업곡'},require('../data/worldcup-solo-songs.json'),require('../data/worldcup-mvs.json'),require('../data/worldcup-filmography.json')];}
// Duplicate IDs, media and equivalent entries are build errors, never silently assigned new IDs.
function audit(list=collections()){
 const norm=s=>String(s||'').normalize('NFKC').toLowerCase().replace(/[^\p{L}\p{N}]/gu,'');
 for(const c of list){const seen={id:new Set(),media:new Set(),entry:new Set()};
  for(const r of c.candidates){const entry=c.id==='film'?norm(r.work)+'|'+norm(r.role):norm(r.artist||'씨야')+'|'+norm(r.title);for(const [key,value] of [['id',r.id],['media',r.youtubeId],['entry',entry]]){if(!value)continue;if(seen[key].has(value))throw Error(c.id+' 중복 '+key+': '+value);seen[key].add(value);}}
 }
 return list;
}
module.exports={collections,audit};
