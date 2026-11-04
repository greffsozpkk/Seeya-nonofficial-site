'use strict';
const Show=require('./my-concert-show');
const SECTIONS=[{id:'opening',name:'OPENING',ko:'오프닝',limit:3},{id:'main',name:'MAIN STAGE',ko:'본 무대',limit:25},{id:'encore',name:'ENCORE',ko:'앙코르',limit:4}];
const design=require('./my-concert-design');
const THEMES=Object.keys(design.themes),KEY='seeya-my-concert-test-v1';
const segmenter=typeof Intl.Segmenter==='function'?new Intl.Segmenter('ko',{granularity:'grapheme'}):null;
const chars=s=>segmenter?[...segmenter.segment(String(s))].map(x=>x.segment):Array.from(String(s));
const clean=s=>typeof s==='string'?s.normalize('NFC').replace(/[\u0000-\u001f\u007f-\u009f\u202a-\u202e\u2066-\u2069]/g,''):'';
const fresh=()=>({schema:3,hidden:{},vcrs:[],title:'우리, 다시 같은 무대에서',planner:'',sections:{opening:[],main:[],encore:[]},theme:'curtain',font:'dodum',format:'poster',updatedAt:''});
const count=d=>SECTIONS.reduce((n,s)=>n+d.sections[s.id].length,0);
const find=(d,id)=>SECTIONS.find(s=>d.sections[s.id].includes(id));
function problems(d){
 const p=[];if(!clean(d.title).trim()||chars(clean(d.title).trim()).length>30)p.push('공연 제목은 1~30자로 입력해 주세요.');
 if(chars(clean(d.planner).trim()).length>20)p.push('기획자 이름은 20자 이내로 입력해 주세요.');
 const missing=SECTIONS.filter(s=>d.sections[s.id].length===0).map(s=>s.ko+' 1곡');
 if(missing.length)p.push(missing.join(', ')+'을 더 골라주세요.');return p;
}
function validate(raw,songs,strict=false){
 if(!raw||typeof raw!=='object'||Array.isArray(raw)||!raw.sections||typeof raw.sections!=='object')throw Error('저장된 구성의 형식을 읽을 수 없어요.');
 const ids=new Set(songs.filter(s=>s.enabled).map(s=>s.id)),d=fresh(),issues=[],seen=new Set();
 if(raw.schema!==1 && raw.schema!==2 && raw.schema!==3){if(strict)throw Error('지원하지 않는 공유 버전이에요.');issues.push('이전 버전에서 복원 가능한 내용을 불러왔어요.');}
 for(const [key,max] of [['title',30],['planner',20]]){
  if(typeof raw[key]!=='string'){if(strict)throw Error('공연 이름 정보를 확인해 주세요.');issues.push('일부 이름 정보를 복원하지 못했어요.');continue;}
  const text=clean(raw[key]).trim();if(strict&&(chars(text).length>max||(key==='title'&&!text)))throw Error('공연 제목·기획자 이름 길이를 확인해 주세요.');
  d[key]=strict?text:chars(text).slice(0,max).join('');if(chars(text).length>max)issues.push('너무 긴 이름은 허용 길이까지 복원했어요.');
 }
 if(raw.schema===2||raw.schema===3){
  if(raw.vcrs!==undefined&&!Array.isArray(raw.vcrs))throw Error('VCR 구성을 읽을 수 없어요.');
  d.vcrs=(raw.vcrs||[]).map(Show.vcrConfig);
  for(const slot of SECTIONS.flatMap(s=>Array.isArray(raw.sections[s.id])?raw.sections[s.id]:[])){
   if(Show.isHidden(slot)){d.hidden[slot]=Show.config(raw.hidden?.[slot],songs);ids.add(slot);}
  }
 }
 for(const s of SECTIONS){
  if(!Array.isArray(raw.sections[s.id])){if(strict)throw Error('공연 구간이 올바르지 않아요.');issues.push(s.ko+' 구성을 복원하지 못했어요.');continue;}
  for(const id of raw.sections[s.id]){
   if(typeof id!=='string'||!ids.has(id)||seen.has(id)||d.sections[s.id].length>=s.limit){if(strict)throw Error('알 수 없는 곡·중복 곡 또는 구간별 곡 수를 확인해 주세요.');issues.push('없어졌거나 중복된 곡을 빈자리로 두었어요.');continue;}
   d.sections[s.id].push(id);seen.add(id);
  }
 }
 if(raw.schema===2 && !strict){
  const oldSlots=[...Array.from({length:1},(_,i)=>d.sections.opening[i]),...Array.from({length:9},(_,i)=>d.sections.main[i]),...Array.from({length:2},(_,i)=>d.sections.encore[i])];
  d.vcrs=d.vcrs.map(v=>({...v,after:Math.max(1,Math.min(count(d)-1,oldSlots.slice(0,v.after).filter(Boolean).length))}));
 }
 if(strict && d.vcrs.some(v=>v.after>=count(d)))throw Error('VCR은 노래와 노래 사이에 배치해 주세요.');
 if(strict&&(Object.keys(raw.sections).length!==3||SECTIONS.some(s=>d.sections[s.id].length===0)))throw Error('완성되지 않은 공유 구성이에요.');
 if(!THEMES.includes(raw.theme)){if(strict)throw Error('지원하지 않는 포스터 테마예요.');issues.push('기본 포스터 테마로 복원했어요.');}else d.theme=raw.theme;
 if(raw.font!==undefined && !Object.hasOwn(design.fonts,raw.font)){if(strict)throw Error('지원하지 않는 글꼴이에요.');}
 else if(raw.font)d.font=raw.font;
 if(raw.format!==undefined&&!Object.hasOwn(design.formats,raw.format)){if(strict)throw Error('지원하지 않는 이미지 형식이에요.');}
 else if(raw.format)d.format=raw.format;
 d.updatedAt=typeof raw.updatedAt==='string'?raw.updatedAt:'';
 return {draft:d,issues:[...new Set(issues)]};
}
function change(d,action,songs){
 const next=JSON.parse(JSON.stringify(d)),section=SECTIONS.find(s=>s.id===action.section);let message='';
 if(!section)throw Error('구간을 선택해 주세요.');
 if(action.type==='add'){
  if(!songs.some(s=>s.id===action.id&&s.enabled)&&!(Show.isHidden(action.id)&&d.hidden?.[action.id]))throw Error('선택할 수 없는 곡이에요.');
  const selected=find(d,action.id);if(selected)throw Error(selected.name+'에 이미 담긴 곡이에요.');
  if(next.sections[section.id].length>=section.limit)throw Error(section.ko+'이 가득 찼어요. 다른 구간을 골라주세요.');
  next.sections[section.id].push(action.id);message=section.ko+'에 담았어요.';
 }else{
  const list=next.sections[section.id],index=list.indexOf(action.id);if(index<0)throw Error('곡을 다시 선택해 주세요.');
  if(action.type==='remove'){list.splice(index,1);message='곡을 뺐어요. 되돌릴 수 있어요.';}
  else if(action.type==='move'){
   const target=SECTIONS.find(s=>s.id===action.target);if(!target)throw Error('이동할 구간을 선택해 주세요.');
   if(target.id===section.id)return {draft:next,message:'같은 구간이에요.'};
   if(next.sections[target.id].length>=target.limit)throw Error(target.ko+'이 가득 찼어요. 먼저 빈자리를 만들어 주세요.');
   const to=action.to??next.sections[target.id].length;
   if(!Number.isInteger(to)||to<0||to>next.sections[target.id].length)throw Error('놓을 위치를 다시 선택해 주세요.');
   list.splice(index,1);next.sections[target.id].splice(to,0,action.id);message=target.ko+'로 옮겼어요.';
  }else if(action.type==='order'){
   const to=action.to;if(!Number.isInteger(to)||to<0||to>=list.length)throw Error('더 이동할 수 없어요.');
   list.splice(index,1);list.splice(to,0,action.id);message='순서를 바꿨어요.';
  }else throw Error('지원하지 않는 편집이에요.');
 }
 Show.alignVcrs(d,next);
 return {draft:next,message};
}
function encode(d){const payload={schema:3,hidden:Object.fromEntries(Object.entries(d.hidden||{}).filter(([id])=>find(d,id))),vcrs:d.vcrs||[],title:clean(d.title).trim(),planner:clean(d.planner).trim(),sections:d.sections,theme:d.theme,font:d.font,format:d.format};const bytes=new TextEncoder().encode(JSON.stringify(payload));return btoa(Array.from(bytes,b=>String.fromCharCode(b)).join('')).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'');}
function decode(value,songs){if(typeof value!=='string'||value.length>1000000||!/^[\w-]+$/.test(value))throw Error('공유 링크 형식을 확인해 주세요.');let raw;try{raw=JSON.parse(new TextDecoder('utf-8',{fatal:true}).decode(Uint8Array.from(atob(value.replace(/-/g,'+').replace(/_/g,'/')),c=>c.charCodeAt(0))));}catch{throw Error('공유 링크를 읽지 못했어요.');}return validate(raw,songs,true).draft;}
function filter(songs,query,artist,album){const q=clean(query).trim().toLocaleLowerCase('ko');return songs.filter(s=>s.enabled&&(artist==='all'||(artist==='group'?s.artistType==='group':s.memberId===artist))&&(album==='all'||s.albumId===album)&&s.title.toLocaleLowerCase('ko').includes(q));}
function restore(raw,songs){if(!raw)return {draft:fresh(),issues:[]};if(raw.length>1000000)throw Error('저장된 구성의 크기를 확인해 주세요.');let data;try{data=JSON.parse(raw);}catch{throw Error('이전 편집본을 읽지 못했어요. 원본은 지우지 않았습니다.');}return validate(data,songs);}
module.exports={SECTIONS,THEMES,KEY,chars,clean,fresh,count,find,problems,validate,change,encode,decode,filter,restore};
