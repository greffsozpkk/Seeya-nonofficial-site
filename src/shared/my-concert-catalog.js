'use strict';
// Reuse researched music data. No playback lengths or release dates are inferred.
const group=require('./worldcup-catalog');
const solo=require('../data/worldcup-solo-songs.json');
const albums=require('../data/albums.json');
const norm=s=>String(s||'').normalize('NFC').toLowerCase().replace(/\s+/g,'').replace('brillant','brilliant');
const memberIds={'남규리':'gyuri','김연지':'yeonji','이보람':'boram'};
const duration=value=>/^\d+:\d{2}$/.test(value||'')?value.split(':').reduce((n,x)=>n*60+Number(x),0):null;
function catalog(archive){
 const rows=[],seen=new Set();
 const solos=solo.candidates.filter(x=>x.id!=='solo-gwanaksan'&&x.sourceType!=='official-live');
 const soloReissues=new Set(['깊은 밤을 날아서','처음 그 자리에']);
 function add(x,isSolo){
  const title=x.title,artistNames=isSolo?[x.artist]:['씨야'];
  const key=norm(title)+'|'+artistNames.join('|');if(seen.has(key))return;seen.add(key);
  const albumTitle=x.album.replace(/ · \d{4}$/,'').replace('Brillant','Brilliant');
  const album=albums.find(a=>norm(a.name)===norm(albumTitle));
  const release=archive.find(r=>r.id===x.archiveId)||archive.find(r=>r.type==='album'&&r.dateBasis==='release'&&r.source?.url===x.catalogUrl&&r.songs?.some(s=>norm(s)===norm(title)));
  const albumDate=album?.type.match(/(\d{4})\.(\d{2})\.(\d{2})/);
  rows.push({id:(isSolo?'solo-':'group-')+x.id,title,artistType:isSolo?'solo':'group',artistNames,memberId:isSolo?memberIds[x.artist]:null,albumId:'album-'+encodeURIComponent(albumTitle),albumTitle,coverUrl:album?.cover||null,releaseDate:release?.dateStatus==='confirmed'?release.date:albumDate?albumDate.slice(1).join('-'):null,durationSec:duration(x.duration),officialUrl:x.catalogUrl||((x.sourceType==='official-video'||x.channel==='SEEYA Official')&&x.youtubeId?'https://www.youtube.com/watch?v='+x.youtubeId:null),enabled:true});
 }
 group().candidates.filter(x=>!soloReissues.has(x.title)&&!/\binst\b|instrumental/i.test(x.title)).forEach(x=>add(x,false));
 solos.forEach(x=>add(x,true));
 return {schema:1,songs:rows,notes:['기존 MUSIC·월드컵에서 확인한 발매곡을 사용합니다.','공개 자작곡 관악산, 미발매 커버·반주곡은 제외합니다.','California Dream에 재수록된 깊은 밤을 날아서·처음 그 자리에는 솔로곡으로 한 번만 표시합니다.']};
}
module.exports={catalog};
