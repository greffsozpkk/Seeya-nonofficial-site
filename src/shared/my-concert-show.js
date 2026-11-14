'use strict';
const media = require('../data/my-concert-media.json');
const concertCovers = require('../data/worldcup-covers.json').candidates.filter(x=>x.concertEnabled);
const vcrLibrary=media.vcr.filter(v=>!v.excludeFromVcr);
const vcrTypes={vlog:'브이로그',behind:'비하인드',promo:'홍보·예고',music:'뮤직비디오',challenge:'챌린지',other:'기타 콘텐츠'};
function vcrType(video){
  const t=video.title;
  if(/예매|티켓|홍보|yes\s*24|티저|teaser|trailer|ticket|D-\d+|전국투어\s*콘서트.*(?:만나요|즐거울|계속 됩니다|갑니다)/i.test(t))return 'promo';
  if(/비하인드|behind|스케치|메이킹|making|리허설/i.test(t))return 'behind';
  if(/브이로그|vlog|일상|나들이|여행|먹방|귤멍|ep\.\s*\d+/i.test(t))return 'vlog';
  if(/챌린지|challenge/i.test(t))return 'challenge';
  if(/뮤직비디오|\bMV\b|M\/V|music video/i.test(t))return 'music';
  return 'other';
}
function randomVcrs(channel,type='recommended'){
  return vcrLibrary.filter(v=>(channel==='all'||channel===v.channelId) &&
    (type==='recommended'?vcrType(v)!=='promo':vcrType(v)===type));
}
const hiddenLabel = '히든 스테이지 (랜덤 노래)';
const vcrLabel = 'VCR 재생';
const sections = ['opening','main','encore'];
const isHidden = id => typeof id === 'string' && /^hidden-[0-9a-z-]+$/.test(id);
function songInfo(id, songs) {
  return isHidden(id) ? {id,title:hiddenLabel,artistNames:[],enabled:true} : songs.find(s=>s.id===id);
}
// Only these six songs have a tour recording approved for the concert player.
const tourSongs = new Set(['group-track-022','group-track-058','group-track-060','group-track-062','group-track-063','group-track-064']);
function performanceVideos(id) {
  const cover=concertCovers.find(x=>x.id===id);
  const sources=media.performances[id]||(cover?[{videoId:cover.youtubeId,title:cover.videoTitle,channel:cover.channel,channelId:cover.channelId,duration:cover.durationSec,date:cover.broadcastDate,kind:'broadcast',embedAllowed:cover.embedAllowed,checkedOn:cover.checkedAt}]:[]);
  for(const kind of ['broadcast','live','tour','official']){
    if(kind==='tour'&&!tourSongs.has(id))continue;
    const videos=sources.filter(v=>v.kind===kind && v.embedAllowed!==false);
    if(videos.length)return videos;
  }
  return [];
}
function checkedSongs(songs) {
  return songs.filter(song => song.enabled && performanceVideos(song.id).length);
}
function config(value,songs) {
  if(value?.mode==='all') return {mode:'all'};
  if(value?.mode==='album' && songs.some(s=>s.albumId===value.album)) return {mode:'album',album:value.album};
  if(value?.mode==='custom' && Array.isArray(value.ids) && value.ids.length && new Set(value.ids).size===value.ids.length && value.ids.every(id=>songs.some(s=>s.id===id && s.enabled)))
    return {mode:'custom',ids:[...new Set(value.ids)]};
  throw Error('히든 스테이지의 후보 범위를 다시 설정해 주세요.');
}
function vcrConfig(v) {
  if(!v || !Number.isInteger(v.after) || v.after<1 || v.after>31) throw Error('VCR 위치를 확인해 주세요.');
  if(v.mode==='link' && typeof v.value==='string' && /^[a-zA-Z0-9_-]{11}$/.test(v.value))return {after:v.after,mode:'link',value:v.value};
  if(v.mode==='fixed' && media.vcr.some(x=>x.videoId===v.value)) return {after:v.after,mode:v.mode,value:v.value};
  if(v.mode==='random' && (v.value==='all'||Object.hasOwn(media.channels,v.value))){
    const type=v.type??'recommended';
    if(type!=='recommended'&&!Object.hasOwn(vcrTypes,type))throw Error('VCR 유형을 다시 선택해 주세요.');
    return {after:v.after,mode:v.mode,value:v.value,...(type==='recommended'?{}:{type})};
  }
  throw Error('VCR 영상 또는 채널을 다시 설정해 주세요.');
}
function candidates(range,songs) {
  return checkedSongs(songs).filter(s=>range.mode==='all'||(range.mode==='album'?s.albumId===range.album:range.ids.includes(s.id))).map(s=>s.id);
}
// Augmenting paths allow a narrow album to displace an earlier broad assignment.
function matching(pools,reserved,random=Math.random) {
  const owner=new Map(),result=[];
  const choices=pools.map(pool=>{
    const ids=[...new Set(pool)].filter(id=>!reserved.has(id));
    for(let i=ids.length-1;i>0;i--){const j=Math.floor(random()*(i+1));[ids[i],ids[j]]=[ids[j],ids[i]];}
    return ids;
  });
  function place(slot,visited) {
    for(const id of choices[slot]){
      if(visited.has(id)) continue;
      visited.add(id);
      if(!owner.has(id)||place(owner.get(id),visited)){
        owner.set(id,slot);result[slot]=id;return true;
      }
    }
    return false;
  }
  if(!choices.every((_,i)=>place(i,new Set()))) throw Error('이 범위에서는 서로 다른 후보를 배정할 수 없어요. 랜덤 범위를 넓히거나 자리를 줄여 주세요.');
  return result;
}
function alignVcrs(previous,next){
  const before=sections.flatMap(s=>previous.sections[s]);
  const after=sections.flatMap(s=>next.sections[s]);
  if(!after.length){next.vcrs=[];return;}
  for(const v of next.vcrs){
    const anchor=after.indexOf(before[v.after-1]);
    v.after=Math.max(1,Math.min(after.length-1,anchor<0?v.after:anchor+1));
  }
}
function youtubeId(input){
  try{
    const u=new URL(input.trim());
    if(!['https:','http:'].includes(u.protocol)||u.username||u.password||u.port)return '';
    const host=u.hostname.replace(/^(www[.]|m[.]|music[.])/,'');
    let id='';
    if(host==='youtu.be')id=u.pathname.slice(1);
    if(host==='youtube.com')id=u.pathname==='/watch'?u.searchParams.get('v'):u.pathname.match(/^\/(?:embed|shorts|live)\/([a-zA-Z0-9_-]{11})\/?$/)?.[1];
    return /^[a-zA-Z0-9_-]{11}$/.test(id||'')?id:'';
  }catch{return '';}
}
function rows(d) {
  const entries=[];let offset=0;
  for(const section of sections){
    const limit=d.sections[section].length;
    for(let i=0;i<limit;i++){
      const number=offset+i+1,id=d.sections[section][i];
      if(id)entries.push({key:'slot-'+number,section,number,id,kind:isHidden(id)?'hidden':'song'});
      (d.vcrs||[]).forEach((v,index)=>{if(v.after===number)entries.push({key:'vcr-'+index,section,after:number,index,kind:'vcr',config:v});});
    }
    offset+=limit;
  }
  return entries;
}
function session(d,songs,random=Math.random) {
  const entries=rows(d);
  const slots=entries.filter(e=>e.kind==='hidden'),fixed=new Set(entries.filter(e=>e.kind==='song').map(e=>e.id));
  const drawn=matching(slots.map(e=>candidates(config(d.hidden?.[e.id],songs),songs)),fixed,random);
  const vcrs=(d.vcrs||[]).map(vcrConfig);
  const vFixed=new Set(vcrs.filter(v=>v.mode!=='random').map(v=>v.value));
  const vDraw=matching(entries.filter(e=>e.kind==='vcr'&&e.config.mode==='random').map(e=>randomVcrs(e.config.value,e.config.type).map(v=>v.videoId)),vFixed,random);
  let h=0,v=0;
  return entries.map(e=>{
    if(e.kind==='vcr'){
      const id=e.config.mode==='random'?vDraw[v]:e.config.value;
      const video=media.vcr.find(x=>x.videoId===id)||{videoId:id,title:'직접 담은 VCR',channel:'YouTube'};
      if(e.config.mode==='random')v++;
      return {...e,label:vcrLabel,title:video.title,artist:video.channel,videos:[video]};
    }
    const id=e.kind==='hidden'?drawn[h++]:e.id,song=songInfo(id,songs);
    const choices=performanceVideos(id);
    return {...e,label:e.kind==='hidden'?hiddenLabel:song.title,title:song.title,artist:song.artistNames.join(' · '),videos:choices};
  });
}
module.exports={vcrLibrary,vcrType,vcrTypes,randomVcrs,alignVcrs,youtubeId,media,hiddenLabel,vcrLabel,isHidden,songInfo,performanceVideos,checkedSongs,config,vcrConfig,candidates,matching,rows,session};
