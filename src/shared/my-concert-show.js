'use strict';
const media = require('../data/my-concert-media.json');
const hiddenLabel = '히든 스테이지 (랜덤 노래)';
const vcrLabel = 'VCR 재생';
const sections = [['opening',1], ['main',9], ['encore',2]];
const isHidden = id => typeof id === 'string' && /^hidden-[0-9a-z-]+$/.test(id);
function songInfo(id, songs) {
  return isHidden(id) ? {id,title:hiddenLabel,artistNames:[],enabled:true} : songs.find(s=>s.id===id);
}
function checkedSongs(songs) {
  return songs.filter(song => song.enabled && media.performances[song.id]?.some(v=>v.played));
}
function config(value,songs) {
  if(value?.mode==='all') return {mode:'all'};
  if(value?.mode==='album' && songs.some(s=>s.albumId===value.album)) return {mode:'album',album:value.album};
  if(value?.mode==='custom' && Array.isArray(value.ids) && value.ids.length && new Set(value.ids).size===value.ids.length && value.ids.every(id=>songs.some(s=>s.id===id && s.enabled)))
    return {mode:'custom',ids:[...new Set(value.ids)]};
  throw Error('히든 스테이지의 후보 범위를 다시 설정해 주세요.');
}
function vcrConfig(v) {
  if(!v || !Number.isInteger(v.after) || v.after<1 || v.after>11) throw Error('VCR 위치를 확인해 주세요.');
  if(v.mode==='fixed' && media.vcr.some(x=>x.videoId===v.value)) return {after:v.after,mode:v.mode,value:v.value};
  if(v.mode==='random' && (v.value==='all'||Object.hasOwn(media.channels,v.value))) return {after:v.after,mode:v.mode,value:v.value};
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
function rows(d) {
  const entries=[];let offset=0;
  for(const [section,limit] of sections){
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
  const vFixed=new Set(vcrs.filter(v=>v.mode==='fixed').map(v=>v.value));
  const vDraw=matching(entries.filter(e=>e.kind==='vcr'&&e.config.mode==='random').map(e=>media.vcr.filter(v=>v.played && (e.config.value==='all'||e.config.value===v.channelId)).map(v=>v.videoId)),vFixed,random);
  let h=0,v=0;
  return entries.map(e=>{
    if(e.kind==='vcr'){
      const video=media.vcr.find(x=>x.videoId===(e.config.mode==='fixed'?e.config.value:vDraw[v]));
      if(e.config.mode==='random')v++;
      return {...e,label:vcrLabel,title:video.title,artist:video.channel,videos:[video]};
    }
    const id=e.kind==='hidden'?drawn[h++]:e.id,song=songInfo(id,songs);
    const choices=media.performances[id]||[];
    return {...e,label:e.kind==='hidden'?hiddenLabel:song.title,title:song.title,artist:song.artistNames.join(' · '),videos:e.kind==='hidden'?choices.filter(v=>v.played):choices};
  });
}
module.exports={media,hiddenLabel,vcrLabel,isHidden,songInfo,checkedSongs,config,vcrConfig,candidates,matching,rows,session};
