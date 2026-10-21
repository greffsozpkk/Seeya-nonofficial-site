'use strict';
const config=require('../data/worldcup-songs.json'),songs=require('../data/today-songs.json'),stages=require('../data/stage-songs.json');
const normalize=s=>s.toLowerCase().replace(/\s*\(feat\..*/i,'').replace(/[^\p{L}\p{N}]/gu,'');
function catalog(){const candidates=config.candidates.map(row=>{const song=row.songRef?songs.find(s=>s.song===row.songRef):null;if(row.songRef&&!song)throw Error('World cup song reference missing: '+row.songRef);const title=(song?.song||row.title),stage=stages.find(s=>normalize(s.name)===normalize(title)||s.aliases?.some(a=>normalize(a)===normalize(title)));return {...row,title,album:(song?.album||row.album).replace('Brillant','Brilliant'),scope:song?.scope||row.scope,catalogUrl:song?.url||row.catalogUrl,stagePath:stage?'/music/stages/'+stage.id+'/':''};});return {...config,candidates};}
module.exports=catalog;
