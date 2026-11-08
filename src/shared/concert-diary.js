'use strict';
const D=require('./my-concert-design');
const sections={opening:3,main:25,encore:4};
function clean(value){
 if(!value||value.version!==1)throw Error('콘서트 포스터 형식을 확인해 주세요.');
 const text=(v,max)=>{if(typeof v!=='string'||v.length>max)throw Error('콘서트 포스터 내용을 확인해 주세요.');return v;};
 const d=value.draft;if(!d||!Object.hasOwn(D.themes,d.theme)||!Object.hasOwn(D.fonts,d.font))throw Error('포스터 배경·글꼴을 확인해 주세요.');
 const ids=[];const checked={};
 for(const [key,max] of Object.entries(sections)){
  const list=d.sections?.[key];if(!Array.isArray(list)||!list.length||list.length>max)throw Error('포스터 곡 수를 확인해 주세요.');
  checked[key]=list.map(id=>{text(id,100);if(!/^[-a-zA-Z0-9_]+$/.test(id)||ids.includes(id))throw Error('포스터 곡 정보를 확인해 주세요.');ids.push(id);return id;});
 }
 if(!Array.isArray(value.songs)||value.songs.length>32)throw Error('포스터 곡 목록을 확인해 주세요.');
 const songs=value.songs.map(s=>({id:text(s.id,100),title:text(s.title,300),artistType:s.artistType==='solo'?'solo':'group',artistNames:Array.isArray(s.artistNames)&&s.artistNames.length<=4?s.artistNames.map(n=>text(n,100)):[]}));
 if(new Set(songs.map(s=>s.id)).size!==songs.length||ids.some(id=>!/^hidden-[0-9a-z-]+$/.test(id)&&!songs.some(s=>s.id===id)))throw Error('포스터의 곡 제목이 빠져 있어요.');
 if(!Array.isArray(d.vcrs)||d.vcrs.length>64||d.vcrs.some(v=>!Number.isInteger(v.after)||v.after<1||v.after>=ids.length))throw Error('포스터 VCR 위치를 확인해 주세요.');
 return {version:1,draft:{title:text(d.title,120),planner:text(d.planner,80),theme:d.theme,font:d.font,format:D.outputFormat(d.theme,d.format),sections:checked,vcrs:d.vcrs.map(v=>({after:v.after}))},songs};
}
function snapshot(d,songs){const ids=Object.values(d.sections).flat();return clean({version:1,draft:d,songs:songs.filter(s=>ids.includes(s.id))});}
module.exports={clean,snapshot};
