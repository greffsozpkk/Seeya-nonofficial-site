(function(){'use strict';const modules={
"src/client/my-concert.js":function(module,exports,__require){
'use strict';
const M=__require("src/shared/my-concert.js"),P=__require("src/client/my-concert-poster.js");
const root=document.getElementById('myConcert');
if(root){
 const $=id=>document.getElementById(id),esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 let songs=[],draft=M.fresh(),shared=null,artist='all',album='all',query='',page=1,target='opening',timer,undoTimer,undo=null,confirmAction=null,rawSaved=null,blocked=false,dirty=false,result=false,renderToken=0,drag=null,imageUrl='',loading=false;
 const pageSize=10,announce=t=>{$('mcStatus').textContent=t;};
 function storageRead(){try{return localStorage.getItem(M.KEY);}catch{return null;}}
 function save(){clearTimeout(timer);if(blocked)return;draft.updatedAt=new Date().toISOString();try{localStorage.setItem(M.KEY,JSON.stringify(draft));rawSaved=JSON.stringify(draft);dirty=false;$('mcSaved').textContent='이 브라우저에 저장됨 · 다른 기기와는 동기화되지 않아요.';}catch{$('mcSaved').textContent='자동 저장을 사용할 수 없어요. 완성 후 이미지를 저장해주세요.';}}
 function persist(){dirty=true;save();}
 function metadata(){
  const title=M.clean(draft.title).trim(),planner=M.clean(draft.planner).trim();$('mcTitleCount').textContent=M.chars(title).length+' / 30';$('mcPlannerCount').textContent=M.chars(planner).length+' / 20';
  $('mcTitleError').textContent=!title||M.chars(title).length>30?'공연 제목은 1~30자로 입력해 주세요.':'';
  $('mcPlannerError').textContent=M.chars(planner).length>20?'기획자 이름은 20자 이내로 입력해 주세요.':'';
  $('mcTitle').setAttribute('aria-invalid',String(!!$('mcTitleError').textContent));$('mcPlanner').setAttribute('aria-invalid',String(!!$('mcPlannerError').textContent));
  $('mcMobileTitle').textContent=title||'공연 제목을 적어주세요';
 }
 function refreshAlbums(){
  const list=M.filter(songs,'',artist,'all'),options=[...new Map(list.map(s=>[s.albumId,s.albumTitle]))];
  if(album!=='all'&&!options.some(x=>x[0]===album))album='all';
  $('mcAlbum').innerHTML='<option value="all">전체 앨범</option>'+options.map(([id,name])=>`<option value="${esc(id)}">${esc(name)}</option>`).join('');$('mcAlbum').value=album;
 }
 function library(){
  const list=M.filter(songs,query,artist,album),pages=Math.max(1,Math.ceil(list.length/pageSize));page=Math.max(1,Math.min(page,pages));
  $('mcSongCount').textContent=`${list.length}곡 · ${page} / ${pages} 페이지`;
  $('mcSongs').innerHTML=list.slice((page-1)*pageSize,page*pageSize).map(s=>{const selected=M.find(draft,s.id),cover=s.coverUrl?`<img src="${esc(s.coverUrl)}" alt="" loading="lazy" referrerpolicy="no-referrer">`:'';return `<article class="mc-song${selected?' is-selected':''}"><div class="mc-cover" aria-hidden="true"><span>${esc(M.chars(s.albumTitle).slice(0,2).join(''))}</span>${cover}</div><div class="mc-song-copy"><strong>${esc(s.title)}</strong><small>${esc(s.artistNames.join(' · '))} · ${esc(s.albumTitle)}</small>${selected?`<span class="mc-selected">✓ ${selected.name}에 담김</span>`:''}</div><button type="button" data-add="${esc(s.id)}" aria-label="${esc(s.title)} ${selected?'선택 상태 확인':'추가'}">${selected?'✓ 담김':'+ 담기'}</button></article>`;}).join('')||'<div class="mc-empty">찾는 곡이 없어요.<br>검색어를 바꾸거나 필터를 해제해 보세요.</div>';
  $('mcPaging').innerHTML=`<button type="button" data-page="${page-1}"${page===1?' disabled':''}>이전</button><span>${page} / ${pages}</span><button type="button" data-page="${page+1}"${page===pages?' disabled':''}>다음</button>`;
 }
 function setlist(){
  let n=1;const byid=new Map(songs.map(s=>[s.id,s]));
  $('mcSections').innerHTML=M.SECTIONS.map(section=>`<section class="mc-section" aria-label="${section.ko}"><div class="mc-section-title"><h3>${section.name}</h3><span>${draft.sections[section.id].length} / ${section.limit}</span></div><ol>${draft.sections[section.id].map((id,index)=>{const s=byid.get(id);return `<li class="mc-track" draggable="true" data-track="${esc(id)}" data-section="${section.id}"><div class="mc-track-name"><span class="mc-track-number">${String(n++).padStart(2,'0')}</span><strong>${esc(s.title)}</strong><small>${esc(s.artistNames.join(' · '))}</small></div><div class="mc-track-actions"><button type="button" data-order="-1" data-id="${esc(id)}" data-section="${section.id}" aria-label="${esc(s.title)} 위로"${index===0?' disabled':''}>↑</button><button type="button" data-order="1" data-id="${esc(id)}" data-section="${section.id}" aria-label="${esc(s.title)} 아래로"${index===draft.sections[section.id].length-1?' disabled':''}>↓</button><select data-move="${esc(id)}" data-section="${section.id}" aria-label="${esc(s.title)} 다른 구간으로 이동"><option value="">구간 이동</option>${M.SECTIONS.filter(x=>x.id!==section.id).map(x=>`<option value="${x.id}">${x.ko}${draft.sections[x.id].length>=x.limit?' (가득 참)':''}</option>`).join('')}</select><button type="button" data-remove="${esc(id)}" data-section="${section.id}" aria-label="${esc(s.title)} 삭제">삭제</button></div></li>`;}).join('')}${Array.from({length:section.limit-draft.sections[section.id].length},()=>'<li class="mc-slot"><span>＋</span> 이 자리에 흐를 노래</li>').join('')}</ol></section>`).join('');
  const count=M.count(draft);$('mcTotal').textContent=`${count} / 12`;$('mcMobileCount').textContent=`선택한 곡 ${count} / 12`;$('mcTabCount').textContent=count;$('mcPickCount').textContent=`${count} / 12`;$('mcProgress').value=count;
  $('mcTarget').value=target;
 }
 function update(){metadata();setlist();library();$('mcCompleteError').textContent='';}
 function tab(name){root.querySelector('.mc-columns').dataset.mobileTab=name;root.querySelectorAll('[role="tab"]').forEach(b=>{b.setAttribute('aria-selected',String(b.dataset.tab===name));b.tabIndex=b.dataset.tab===name?0:-1;});}
 function editing(){result=false;shared=null;renderToken++;$('mcSharedError').hidden=true;$('mcResult').hidden=true;$('mcEditor').hidden=false;$('mcCopy').hidden=true;history.replaceState(null,'',location.pathname);$('mcTitle').value=draft.title;$('mcPlanner').value=draft.planner;refreshAlbums();update();}
 function invalidateUndo(){clearTimeout(undoTimer);undo=null;$('mcUndo').hidden=true;}
 function mutate(action){
  try{
   const previous=JSON.parse(JSON.stringify(draft.sections)),r=M.change(draft,action,songs);draft=r.draft;invalidateUndo();let message=r.message;
   if(action.type==='remove'){undo=previous;$('mcUndo').hidden=false;undoTimer=setTimeout(invalidateUndo,10000);}
   if(action.type==='add'){const s=M.SECTIONS.find(s=>s.id===target);if(draft.sections[target].length===s.limit){const next=M.SECTIONS.find(x=>draft.sections[x.id].length<x.limit);if(next){target=next.id;message=s.ko+'을 골랐어요. '+next.ko+'에 넣을 노래를 골라주세요.';}else message='12곡을 모두 골랐어요. 포스터를 완성해 보세요.';}}
   persist();update();announce(message);
   if(action.type==='order'){const b=[...root.querySelectorAll('[data-order]')].find(x=>x.dataset.id===action.id&&x.dataset.order===String(action.to>0?-1:1));b?.focus();}
  }catch(e){announce(e.message);}
 }
 function confirm(message,action){confirmAction=action;$('mcConfirmMessage').textContent=message;$('mcConfirm').showModal();}
 function clearShared(){history.replaceState(null,'',location.pathname);shared=null;}
 async function showResult(d){
  result=true;$('mcEditor').hidden=true;$('mcResult').hidden=false;$('mcSharedError').hidden=true;$('mcCopy').hidden=true;
  $('mcResultTitle').textContent=shared?'팬이 꿈꾸는 씨야 콘서트':'당신의 무대가 완성됐어요';$('mcResultHint').textContent=shared?'공유받은 구성이에요. 내 편집본은 그대로 보관됩니다.':'첫 곡부터 앙코르까지, 좋아하는 마음을 한 장에 담았어요.';$('mcEditButton').textContent=shared?'이 구성으로 만들기':'다시 편집하기';
  root.querySelectorAll('[data-theme]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.theme===d.theme)));
  const byid=new Map(songs.map(s=>[s.id,s]));let n=1;$('mcTextList').innerHTML=`<h3>${esc(d.title.trim())}</h3>${d.planner.trim()?`<p>기획 · ${esc(d.planner.trim())}</p>`:''}`+M.SECTIONS.map(s=>`<h4>${s.name}</h4><ol start="${n}">${d.sections[s.id].map(id=>{n++;const song=byid.get(id);return `<li>${esc(song.title)} · ${esc(song.artistNames.join(' · '))}</li>`;}).join('')}</ol>`).join('');
  const token=++renderToken;$('mcPosterStatus').textContent='포스터를 만들고 있어요.';$('mcPoster').hidden=true;
  try{const off=document.createElement('canvas');await P.render(off,d,songs);if(token!==renderToken)return;$('mcPoster').getContext('2d').drawImage(off,0,0);$('mcPoster').hidden=false;$('mcPosterStatus').textContent='1080 × 1350 · 조작 버튼 없이 포스터만 저장됩니다.';}
  catch(e){if(token===renderToken)$('mcPosterStatus').textContent=e.message+' 이미지 저장 버튼으로 다시 시도할 수 있어요.';}
 }
 async function exportImage(){
  const b=root.querySelector('[data-action="export"]');b.disabled=true;b.textContent='이미지 만드는 중…';
  try{const canvas=document.createElement('canvas');await P.render(canvas,shared||draft,songs);const blob=await P.png(canvas);if(imageUrl)URL.revokeObjectURL(imageUrl);imageUrl=URL.createObjectURL(blob);$('mcExportImage').src=imageUrl;$('mcDownload').href=imageUrl;$('mcOpenImage').href=imageUrl;const date=new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Seoul',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date()).replace(/\D/g,'');$('mcDownload').download='seeya-my-concert-'+date+'.png';$('mcImageDialog').showModal();}
  catch(e){announce(e.message||'이미지 저장을 다시 시도해 주세요.');$('mcPosterStatus').textContent='이미지를 만들지 못했어요. 다시 저장을 눌러주세요.';}
  finally{b.disabled=false;b.textContent='이미지 저장';}
 }
 async function shareLink(){const url=new URL(location.pathname,location.origin);url.searchParams.set('concert',M.encode(shared||draft));try{await navigator.clipboard.writeText(url.href);announce('제목·곡 순서·테마를 담은 공유 링크를 복사했어요.');}catch{$('mcCopy').hidden=false;$('mcCopyLink').value=url.href;$('mcCopyLink').focus();$('mcCopyLink').select();announce('링크를 직접 복사해 주세요.');}}
 async function load(){
  if(loading)return;loading=true;$('mcLoadError').hidden=true;announce('곡 목록을 불러오고 있어요.');
  try{const response=await fetch('/game/my-concert/catalog.json',{cache:'no-cache'});if(!response.ok)throw Error();const data=await response.json();if(data.schema!==1||!Array.isArray(data.songs)||data.songs.length<12||new Set(data.songs.map(s=>s.id)).size!==data.songs.length||!data.songs.every(s=>typeof s.id==='string'&&typeof s.title==='string'&&typeof s.albumId==='string'&&typeof s.albumTitle==='string'&&Array.isArray(s.artistNames)))throw Error();songs=data.songs;
   rawSaved=storageRead();try{const restored=M.restore(rawSaved,songs);draft=restored.draft;if(restored.issues.length)announce(restored.issues.join(' '));else announce(rawSaved?'이 브라우저의 편집본을 불러왔어요.':'오프닝에 흐를 첫 곡을 골라주세요.');}catch(e){blocked=true;$('mcRecovery').hidden=false;$('mcRecoveryText').textContent=e.message;}
   const token=new URLSearchParams(location.search).get('concert');if(token!==null){try{shared=M.decode(token,songs);await showResult(shared);}catch(e){$('mcSharedError').hidden=false;$('mcSharedErrorText').textContent=e.message;$('mcEditor').hidden=true;}}else editing();
  }catch{$('mcLoadError').hidden=false;announce('곡 목록을 불러오지 못했어요. 다시 시도해 주세요.');}finally{loading=false;}
 }
 root.addEventListener('input',e=>{
  if(e.target.id==='mcSearch'){query=e.target.value;page=1;library();}
  if(['mcTitle','mcPlanner'].includes(e.target.id)){draft[e.target.id==='mcTitle'?'title':'planner']=e.target.value;metadata();dirty=true;clearTimeout(timer);timer=setTimeout(save,500);}
 });
 root.addEventListener('change',e=>{
  if(e.target.id==='mcAlbum'){album=e.target.value;page=1;library();}
  if(e.target.id==='mcTarget'){target=e.target.value;announce(M.SECTIONS.find(s=>s.id===target).ko+'에 노래를 담습니다.');}
  if(e.target.dataset.move){const v=e.target.value;e.target.value='';if(v)mutate({type:'move',id:e.target.dataset.move,section:e.target.dataset.section,target:v});}
 });
 root.addEventListener('click',e=>{
  const b=e.target.closest('button');if(!b)return;
  if(b.dataset.tab){tab(b.dataset.tab);if(!b.hasAttribute('role'))$('mcSetTab').focus();return;}
  if(b.dataset.artist){artist=b.dataset.artist;page=1;root.querySelectorAll('[data-artist]').forEach(x=>x.setAttribute('aria-pressed',String(x===b)));refreshAlbums();library();return;}
  if(b.dataset.add){mutate({type:'add',id:b.dataset.add,section:target});return;}
  if(b.dataset.remove){mutate({type:'remove',id:b.dataset.remove,section:b.dataset.section});return;}
  if(b.dataset.order){mutate({type:'order',id:b.dataset.id,section:b.dataset.section,to:draft.sections[b.dataset.section].indexOf(b.dataset.id)+Number(b.dataset.order)});return;}
  if(b.dataset.page){page=Number(b.dataset.page);library();return;}
  if(b.dataset.theme){const d=shared||draft;d.theme=b.dataset.theme;if(!shared)persist();showResult(d);return;}
  switch(b.dataset.action){
   case 'retry':load();break;
   case 'clearFilters':artist='all';album='all';query='';page=1;$('mcSearch').value='';root.querySelectorAll('[data-artist]').forEach(x=>x.setAttribute('aria-pressed',String(x.dataset.artist==='all')));refreshAlbums();library();break;
   case 'undo':if(undo){draft.sections=undo;invalidateUndo();persist();update();announce('삭제한 곡을 원래 위치에 돌려놓았어요.');}break;
   case 'finish':metadata();{const errors=M.problems(draft);$('mcCompleteError').textContent=errors.join(' ');if(errors.length){tab('set');announce(errors.join(' '));if($('mcTitleError').textContent)$('mcTitle').focus();else if($('mcPlannerError').textContent)$('mcPlanner').focus();else $('mcCompleteError').scrollIntoView({block:'nearest'});break;}persist();showResult(draft);$('mcResultTitle').focus();}break;
   case 'reset':case 'new':case 'recover':confirm('현재 이 브라우저의 편집본을 지우고 빈 콘서트로 시작합니다.',()=>{clearTimeout(timer);invalidateUndo();blocked=false;draft=M.fresh();target='opening';$('mcRecovery').hidden=true;clearShared();persist();editing();announce('새 콘서트를 시작했어요.');});break;
   case 'own':clearShared();editing();break;
   case 'edit':if(shared){const use=()=>{clearTimeout(timer);draft=JSON.parse(JSON.stringify(shared));blocked=false;$('mcRecovery').hidden=true;clearShared();persist();editing();announce('공유 구성을 내 편집본으로 가져왔어요.');};if(rawSaved)confirm('이 브라우저에 보관된 편집본을 이 공유 구성으로 교체합니다.',use);else use();}else editing();break;
   case 'confirm':$('mcConfirm').close();if(confirmAction){const action=confirmAction;confirmAction=null;action();}break;
   case 'cancelConfirm':confirmAction=null;$('mcConfirm').close();break;
   case 'export':exportImage();break;
   case 'share':shareLink();break;
   case 'closeImage':$('mcImageDialog').close();break;
  }
 });
 root.addEventListener('keydown',e=>{if(e.target.matches('[role="tab"]')&&['ArrowLeft','ArrowRight'].includes(e.key)){e.preventDefault();const next=e.target.dataset.tab==='pick'?'set':'pick';tab(next);$(next==='pick'?'mcPickTab':'mcSetTab').focus();}});
 root.addEventListener('error',e=>{if(e.target.matches('.mc-cover img'))e.target.hidden=true;},true);
 root.addEventListener('dragstart',e=>{if(e.target.closest('button,select,input')){e.preventDefault();return;}const row=e.target.closest('[data-track]');if(row){drag={id:row.dataset.track,section:row.dataset.section};e.dataTransfer.setData('text/plain',drag.id);e.dataTransfer.effectAllowed='move';}});
 root.addEventListener('dragover',e=>{const row=e.target.closest('[data-track]');if(drag&&row?.dataset.section===drag.section)e.preventDefault();});
 root.addEventListener('drop',e=>{const row=e.target.closest('[data-track]');if(drag&&row?.dataset.section===drag.section){e.preventDefault();mutate({type:'order',...drag,to:draft.sections[drag.section].indexOf(row.dataset.track)});}drag=null;});root.addEventListener('dragend',()=>{drag=null;});
 window.addEventListener('pagehide',()=>{if(dirty)save();});
 load();
}

},
"src/shared/my-concert.js":function(module,exports,__require){
'use strict';
const SECTIONS=[{id:'opening',name:'OPENING',ko:'오프닝',limit:1},{id:'main',name:'MAIN STAGE',ko:'본 무대',limit:9},{id:'encore',name:'ENCORE',ko:'앙코르',limit:2}];
const THEMES=['rose','night'],KEY='seeya-my-concert-test-v1';
const segmenter=typeof Intl.Segmenter==='function'?new Intl.Segmenter('ko',{granularity:'grapheme'}):null;
const chars=s=>segmenter?[...segmenter.segment(String(s))].map(x=>x.segment):Array.from(String(s));
const clean=s=>typeof s==='string'?s.normalize('NFC').replace(/[\u0000-\u001f\u007f-\u009f\u202a-\u202e\u2066-\u2069]/g,''):'';
const fresh=()=>({schema:1,title:'우리, 다시 같은 무대에서',planner:'',sections:{opening:[],main:[],encore:[]},theme:'rose',updatedAt:''});
const count=d=>SECTIONS.reduce((n,s)=>n+d.sections[s.id].length,0);
const find=(d,id)=>SECTIONS.find(s=>d.sections[s.id].includes(id));
function problems(d){
 const p=[];if(!clean(d.title).trim()||chars(clean(d.title).trim()).length>30)p.push('공연 제목은 1~30자로 입력해 주세요.');
 if(chars(clean(d.planner).trim()).length>20)p.push('기획자 이름은 20자 이내로 입력해 주세요.');
 const missing=SECTIONS.filter(s=>d.sections[s.id].length<s.limit).map(s=>s.ko+' '+(s.limit-d.sections[s.id].length)+'곡');
 if(missing.length)p.push(missing.join(', ')+'을 더 골라주세요.');return p;
}
function validate(raw,songs,strict=false){
 if(!raw||typeof raw!=='object'||Array.isArray(raw)||!raw.sections||typeof raw.sections!=='object')throw Error('저장된 구성의 형식을 읽을 수 없어요.');
 const ids=new Set(songs.filter(s=>s.enabled).map(s=>s.id)),d=fresh(),issues=[],seen=new Set();
 if(raw.schema!==1){if(strict)throw Error('지원하지 않는 공유 버전이에요.');issues.push('이전 버전에서 복원 가능한 내용을 불러왔어요.');}
 for(const [key,max] of [['title',30],['planner',20]]){
  if(typeof raw[key]!=='string'){if(strict)throw Error('공연 이름 정보를 확인해 주세요.');issues.push('일부 이름 정보를 복원하지 못했어요.');continue;}
  const text=clean(raw[key]).trim();if(strict&&(chars(text).length>max||(key==='title'&&!text)))throw Error('공연 제목·기획자 이름 길이를 확인해 주세요.');
  d[key]=strict?text:chars(text).slice(0,max).join('');if(chars(text).length>max)issues.push('너무 긴 이름은 허용 길이까지 복원했어요.');
 }
 for(const s of SECTIONS){
  if(!Array.isArray(raw.sections[s.id])){if(strict)throw Error('공연 구간이 올바르지 않아요.');issues.push(s.ko+' 구성을 복원하지 못했어요.');continue;}
  for(const id of raw.sections[s.id].slice(0,300)){
   if(typeof id!=='string'||!ids.has(id)||seen.has(id)||d.sections[s.id].length>=s.limit){if(strict)throw Error('알 수 없는 곡·중복 곡 또는 구간별 곡 수를 확인해 주세요.');issues.push('없어졌거나 중복된 곡을 빈자리로 두었어요.');continue;}
   d.sections[s.id].push(id);seen.add(id);
  }
 }
 if(strict&&(Object.keys(raw.sections).length!==3||SECTIONS.some(s=>d.sections[s.id].length!==s.limit)))throw Error('완성되지 않은 공유 구성이에요.');
 if(!THEMES.includes(raw.theme)){if(strict)throw Error('지원하지 않는 포스터 테마예요.');issues.push('기본 포스터 테마로 복원했어요.');}else d.theme=raw.theme;
 d.updatedAt=typeof raw.updatedAt==='string'?raw.updatedAt:'';
 return {draft:d,issues:[...new Set(issues)]};
}
function change(d,action,songs){
 const next=JSON.parse(JSON.stringify(d)),section=SECTIONS.find(s=>s.id===action.section);let message='';
 if(!section)throw Error('구간을 선택해 주세요.');
 if(action.type==='add'){
  if(!songs.some(s=>s.id===action.id&&s.enabled))throw Error('선택할 수 없는 곡이에요.');
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
   list.splice(index,1);next.sections[target.id].push(action.id);message=target.ko+'로 옮겼어요.';
  }else if(action.type==='order'){
   const to=action.to;if(!Number.isInteger(to)||to<0||to>=list.length)throw Error('더 이동할 수 없어요.');
   list.splice(index,1);list.splice(to,0,action.id);message='순서를 바꿨어요.';
  }else throw Error('지원하지 않는 편집이에요.');
 }
 return {draft:next,message};
}
function encode(d){const payload={schema:1,title:clean(d.title).trim(),planner:clean(d.planner).trim(),sections:d.sections,theme:d.theme};const bytes=new TextEncoder().encode(JSON.stringify(payload));return btoa(Array.from(bytes,b=>String.fromCharCode(b)).join('')).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'');}
function decode(value,songs){if(typeof value!=='string'||value.length>8192||!/^[\w-]+$/.test(value))throw Error('공유 링크 형식을 확인해 주세요.');let raw;try{raw=JSON.parse(new TextDecoder('utf-8',{fatal:true}).decode(Uint8Array.from(atob(value.replace(/-/g,'+').replace(/_/g,'/')),c=>c.charCodeAt(0))));}catch{throw Error('공유 링크를 읽지 못했어요.');}return validate(raw,songs,true).draft;}
function filter(songs,query,artist,album){const q=clean(query).trim().toLocaleLowerCase('ko');return songs.filter(s=>s.enabled&&(artist==='all'||(artist==='group'?s.artistType==='group':s.memberId===artist))&&(album==='all'||s.albumId===album)&&s.title.toLocaleLowerCase('ko').includes(q));}
function restore(raw,songs){if(!raw)return {draft:fresh(),issues:[]};if(raw.length>40000)throw Error('저장된 구성의 크기를 확인해 주세요.');let data;try{data=JSON.parse(raw);}catch{throw Error('이전 편집본을 읽지 못했어요. 원본은 지우지 않았습니다.');}return validate(data,songs);}
module.exports={SECTIONS,THEMES,KEY,chars,clean,fresh,count,find,problems,validate,change,encode,decode,filter,restore};

},
"src/client/my-concert-poster.js":function(module,exports,__require){
'use strict';
const {SECTIONS,chars}=__require("src/shared/my-concert.js");
function wrap(ctx,text,width){const lines=[];let line='';for(const ch of chars(text)){if(line&&ctx.measureText(line+ch).width>width){lines.push(line);line='';}line+=ch;}if(line)lines.push(line);return lines;}
function layout(ctx,d,songs){
 const byId=new Map(songs.map(s=>[s.id,s]));let size=34,groups,total=0;
 for(;size>=12;size--){
  ctx.font=`${size}px "Passport Dodum", sans-serif`;
  groups=SECTIONS.map(section=>({section,rows:d.sections[section.id].map(id=>{const song=byId.get(id);if(!song)throw Error('곡 정보를 다시 불러와 주세요.');const text=song.title+(song.artistType==='solo'?'  /  '+song.artistNames.join(' · '):'');const lines=wrap(ctx,text,822);return {song,lines,height:Math.max(44,lines.length*(size*1.28)+14)};})}));
  total=groups.reduce((n,g)=>n+42+g.rows.reduce((v,r)=>v+r.height,0)+16,0);if(total<=825)break;
 }
 if(total>825)throw Error('글자가 너무 길어 포스터에 담지 못했어요. 곡 정보를 확인해 주세요.');
 return {size,groups,total};
}
async function fonts(){if(!document.fonts)return;await Promise.race([Promise.allSettled([document.fonts.load('30px "Passport Dodum"'),document.fonts.load('60px "Passport Batang"')]),new Promise(r=>setTimeout(r,2500))]);}
function draw(canvas,d,songs){
 canvas.width=1080;canvas.height=1350;const ctx=canvas.getContext('2d');if(!ctx)throw Error('이 브라우저에서 이미지 만들기를 사용할 수 없어요.');
 const night=d.theme==='night',ink=night?'#fff3eb':'#3d2834',muted=night?'#dfbdcb':'#855d70',line=night?'#735066':'#d8a2b6';
 const bg=ctx.createLinearGradient(0,0,1080,1350);bg.addColorStop(0,night?'#342337':'#fff7ee');bg.addColorStop(1,night?'#171624':'#f6dbe4');ctx.fillStyle=bg;ctx.fillRect(0,0,1080,1350);
 if(night){for(const [x,color] of [[220,'#b96a8350'],[850,'#a8a1cc35']]){const g=ctx.createRadialGradient(x,20,1,x,20,630);g.addColorStop(0,color);g.addColorStop(1,'#00000000');ctx.fillStyle=g;ctx.fillRect(0,0,1080,1350);}}
 ctx.strokeStyle=line;ctx.lineWidth=2;ctx.strokeRect(34,34,1012,1282);ctx.strokeRect(46,46,988,1258);
 ctx.fillStyle=muted;ctx.textAlign='left';ctx.font='19px "Passport Dodum",sans-serif';ctx.fillText('A STAGE MADE BY YOU',86,100);ctx.textAlign='right';ctx.fillText('ADMIT ONE · 12 SONGS',994,100);
 ctx.textAlign='left';ctx.fillStyle=ink;ctx.font='bold 46px "Passport Batang",serif';ctx.fillText('SEEYA',86,168);
 let titleSize=66,titleLines;do{ctx.font=`${titleSize}px "Passport Batang",serif`;titleLines=wrap(ctx,d.title.trim(),908);if(titleLines.length<=2)break;titleSize-=2;}while(titleSize>30);
 ctx.font=`${titleSize}px "Passport Batang",serif`;titleLines.forEach((s,i)=>ctx.fillText(s,86,237+i*(titleSize*1.12)));
 let top=237+(titleLines.length-1)*titleSize*1.12+36;
 if(d.planner.trim()){ctx.fillStyle=muted;ctx.font='22px "Passport Dodum",sans-serif';ctx.fillText('기획 · '+d.planner.trim(),86,top);top+=27;}
 const start=Math.max(335,top+18);ctx.setLineDash([5,7]);ctx.strokeStyle=line;ctx.beginPath();ctx.moveTo(65,start-18);ctx.lineTo(1015,start-18);ctx.stroke();ctx.setLineDash([]);
 const l=layout(ctx,d,songs);let y=start,number=1;const available=1202-start,scale=Math.min(1,available/l.total);ctx.save();ctx.translate(0,start);ctx.scale(1,scale);y=0;
 const bounds=[];
 for(const g of l.groups){ctx.fillStyle=muted;ctx.font='bold 19px "Passport Dodum",sans-serif';ctx.fillText(g.section.name,88,y+25);ctx.textAlign='right';ctx.fillText(String(g.section.limit).padStart(2,'0')+' TRACK'+(g.section.limit>1?'S':''),990,y+25);ctx.textAlign='left';y+=42;
  for(const row of g.rows){ctx.fillStyle=muted;ctx.font='20px "Passport Dodum",sans-serif';ctx.fillText(String(number++).padStart(2,'0'),90,y+l.size);ctx.fillStyle=ink;ctx.font=`${l.size}px "Passport Dodum",sans-serif`;row.lines.forEach((s,i)=>ctx.fillText(s,157,y+l.size+i*l.size*1.28));bounds.push({id:row.song.id,bottom:start+(y+row.height)*scale,lines:row.lines});y+=row.height;}
  y+=16;
 }
 ctx.restore();ctx.strokeStyle=line;ctx.beginPath();ctx.moveTo(86,1215);ctx.lineTo(994,1215);ctx.stroke();ctx.fillStyle=muted;ctx.textAlign='center';ctx.font='17px "Passport Dodum",sans-serif';ctx.fillText('팬이 만든 가상 콘서트입니다. 실제 공연 안내가 아닙니다.',540,1250);ctx.font='16px sans-serif';ctx.fillText('SEEYA ARCHIVE  ·  seeya-fanpage.com',540,1281);
 return {width:1080,height:1350,rows:bounds,fontSize:l.size};
}
async function render(canvas,d,songs){await fonts();return draw(canvas,d,songs);}
function png(canvas){return new Promise((resolve,reject)=>{try{canvas.toBlob(b=>b?resolve(b):reject(Error('이미지를 만들지 못했어요. 다시 시도해 주세요.')),'image/png');}catch{reject(Error('이미지 저장을 다시 시도해 주세요.'));}});}
module.exports={wrap,layout,draw,render,png};

}
};const cache={};function __require(id){if(cache[id])return cache[id].exports;const m=cache[id]={exports:{}};modules[id](m,m.exports,__require);return m.exports;}__require("src/client/my-concert.js");})();
