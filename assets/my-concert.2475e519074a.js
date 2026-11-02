(function(){'use strict';const modules={
"src/client/my-concert.js":function(module,exports,__require){
'use strict';
const M=__require("src/shared/my-concert.js"),P=__require("src/client/my-concert-poster.js");
const Show=__require("src/shared/my-concert-show.js");
const initSpecials=__require("src/client/my-concert-specials.js");
const initPlayback=__require("src/client/my-concert-playback.js");
const root=document.getElementById('myConcert');
if(root){
 const $=id=>document.getElementById(id),esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 let songs=[],draft=M.fresh(),shared=null,artist='all',album='all',query='',page=1,target='opening',timer,undoTimer,undo=null,confirmAction=null,rawSaved=null,blocked=false,dirty=false,result=false,renderToken=0,drag=null,imageUrl='',loading=false;
 const pageSize=10,announce=t=>{$('mcStatus').textContent=t;};
 const extras=initSpecials({root,$,esc,getDraft:()=>draft,getSongs:()=>songs,getTarget:()=>target,announce,apply(next){draft=next;invalidateUndo();if(next.sections[target].length===M.SECTIONS.find(s=>s.id===target).limit)target=M.SECTIONS.find(s=>next.sections[s.id].length<s.limit)?.id||target;persist();update();}});
 const playback=initPlayback({root,$,esc,getShow:()=>shared||draft,getSongs:()=>songs,edit:()=>$('mcEditButton').click()});
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
  $('mcSections').innerHTML=M.SECTIONS.map(section=>`<section class="mc-section" aria-label="${section.ko}"><div class="mc-section-title"><h3>${section.name}</h3><span>${draft.sections[section.id].length} / ${section.limit}</span></div><ol>${draft.sections[section.id].map((id,index)=>{const s=Show.songInfo(id,songs);return `<li class="mc-track" draggable="true" data-track="${esc(id)}" data-section="${section.id}"><div class="mc-track-name"><span class="mc-track-number">${String(n++).padStart(2,'0')}</span><strong>${esc(s.title)}</strong><small>${esc(s.artistNames.join(' · '))}</small></div><div class="mc-track-actions">${Show.isHidden(id)?'<button data-special="hidden" data-slot="'+esc(id)+'">후보 설정</button>':''}<button type="button" data-order="-1" data-id="${esc(id)}" data-section="${section.id}" aria-label="${esc(s.title)} 위로"${index===0?' disabled':''}>↑</button><button type="button" data-order="1" data-id="${esc(id)}" data-section="${section.id}" aria-label="${esc(s.title)} 아래로"${index===draft.sections[section.id].length-1?' disabled':''}>↓</button><select data-move="${esc(id)}" data-section="${section.id}" aria-label="${esc(s.title)} 다른 구간으로 이동"><option value="">구간 이동</option>${M.SECTIONS.filter(x=>x.id!==section.id).map(x=>`<option value="${x.id}">${x.ko}${draft.sections[x.id].length>=x.limit?' (가득 참)':''}</option>`).join('')}</select><button type="button" data-remove="${esc(id)}" data-section="${section.id}" aria-label="${esc(s.title)} 삭제">삭제</button></div></li>${extras.gapRows(draft,n-1)}`;}).join('')}${Array.from({length:section.limit-draft.sections[section.id].length},()=>{const gap=n++;return '<li class="mc-slot"><span>＋</span> 이 자리에 흐를 노래</li>'+((draft.vcrs||[]).some(v=>v.after===gap)?extras.gapRows(draft,gap):'');}).join('')}</ol></section>`).join('');
  const count=M.count(draft);$('mcTotal').textContent=`${count} / 12`;$('mcMobileCount').textContent=`선택한 곡 ${count} / 12`;$('mcTabCount').textContent=count;$('mcPickCount').textContent=`${count} / 12`;$('mcProgress').value=count;
  $('mcTarget').value=target;
 }
 function update(){metadata();setlist();library();$('mcCompleteError').textContent='';}
 function tab(name){root.querySelector('.mc-columns').dataset.mobileTab=name;root.querySelectorAll('[role="tab"]').forEach(b=>{b.setAttribute('aria-selected',String(b.dataset.tab===name));b.tabIndex=b.dataset.tab===name?0:-1;});}
 function editing(){playback.close();result=false;shared=null;renderToken++;$('mcSharedError').hidden=true;$('mcResult').hidden=true;$('mcEditor').hidden=false;$('mcCopy').hidden=true;history.replaceState(null,'',location.pathname);$('mcTitle').value=draft.title;$('mcPlanner').value=draft.planner;refreshAlbums();update();}
 function invalidateUndo(){clearTimeout(undoTimer);undo=null;$('mcUndo').hidden=true;}
 function mutate(action){
  try{
   const previous=JSON.parse(JSON.stringify(draft.sections)),r=M.change(draft,action,songs);if(action.type==='add'&&Object.keys(r.draft.hidden||{}).length)Show.session(r.draft,songs,()=>0.5);
   draft=r.draft;invalidateUndo();let message=r.message;
   if(action.type==='remove'){undo=previous;$('mcUndo').hidden=false;undoTimer=setTimeout(invalidateUndo,10000);}
   if(action.type==='add'){const s=M.SECTIONS.find(s=>s.id===target);if(draft.sections[target].length===s.limit){const next=M.SECTIONS.find(x=>draft.sections[x.id].length<x.limit);if(next){target=next.id;message=s.ko+'을 골랐어요. '+next.ko+'에 넣을 노래를 골라주세요.';}else message='12곡을 모두 골랐어요. 포스터를 완성해 보세요.';}}
   persist();update();announce(message);
   if(action.type==='order'){const b=[...root.querySelectorAll('[data-order]')].find(x=>x.dataset.id===action.id&&x.dataset.order===String(action.to>0?-1:1));b?.focus();}
  }catch(e){announce(e.message);}
 }
 function confirm(message,action){confirmAction=action;$('mcConfirmMessage').textContent=message;$('mcConfirm').showModal();}
 function clearShared(){history.replaceState(null,'',location.pathname);shared=null;}
 async function showResult(d){
  playback.summary(d,songs);result=true;$('mcEditor').hidden=true;$('mcResult').hidden=false;$('mcSharedError').hidden=true;$('mcCopy').hidden=true;
  $('mcResultTitle').textContent=shared?'팬이 꿈꾸는 씨야 콘서트':'당신의 무대가 완성됐어요';$('mcResultHint').textContent=shared?'공유받은 구성이에요. 내 편집본은 그대로 보관됩니다.':'첫 곡부터 앙코르까지, 좋아하는 마음을 한 장에 담았어요.';$('mcEditButton').textContent=shared?'이 구성으로 만들기':'다시 편집하기';
  root.querySelectorAll('[data-theme]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.theme===d.theme)));
  $('mcTextList').innerHTML='<h3>'+esc(d.title.trim())+'</h3>'+M.SECTIONS.map(section=>'<h4>'+section.name+'</h4>'+Show.rows(d).filter(e=>e.section===section.id).map(e=>'<p>'+(e.kind==='vcr'?Show.vcrLabel:e.number+'. '+esc(Show.songInfo(e.id,songs).title))+'</p>').join('')).join('');
  const token=++renderToken;$('mcPosterStatus').textContent='포스터를 만들고 있어요.';$('mcPoster').hidden=true;
  try{const off=document.createElement('canvas');await P.render(off,d,songs);if(token!==renderToken)return;$('mcPoster').height=off.height;$('mcPoster').getContext('2d').drawImage(off,0,0);$('mcPoster').hidden=false;$('mcPosterStatus').textContent='1080 × '+off.height+' · 조작 버튼 없이 포스터만 저장됩니다.';}
  catch(e){if(token===renderToken)$('mcPosterStatus').textContent=e.message+' 이미지 저장 버튼으로 다시 시도할 수 있어요.';}
 }
 async function exportImage(){
  const b=root.querySelector('[data-action="export"]');b.disabled=true;b.textContent='이미지 만드는 중…';
  try{const canvas=document.createElement('canvas');await P.render(canvas,shared||draft,songs);$('mcExportSize').textContent='1080 × '+canvas.height;const blob=await P.png(canvas);if(imageUrl)URL.revokeObjectURL(imageUrl);imageUrl=URL.createObjectURL(blob);$('mcExportImage').src=imageUrl;$('mcDownload').href=imageUrl;$('mcOpenImage').href=imageUrl;const date=new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Seoul',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date()).replace(/\D/g,'');$('mcDownload').download='seeya-my-concert-'+date+'.png';$('mcImageDialog').showModal();}
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
   case 'finish':metadata();{const errors=M.problems(draft);try{Show.session(draft,songs,()=>0.5);}catch(e){errors.push(e.message);}$('mcCompleteError').textContent=errors.join(' ');if(errors.length){tab('set');announce(errors.join(' '));if($('mcTitleError').textContent)$('mcTitle').focus();else if($('mcPlannerError').textContent)$('mcPlanner').focus();else $('mcCompleteError').scrollIntoView({block:'nearest'});break;}persist();showResult(draft);$('mcResultTitle').focus();}break;
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
const Show=__require("src/shared/my-concert-show.js");
const SECTIONS=[{id:'opening',name:'OPENING',ko:'오프닝',limit:1},{id:'main',name:'MAIN STAGE',ko:'본 무대',limit:9},{id:'encore',name:'ENCORE',ko:'앙코르',limit:2}];
const THEMES=['rose','night'],KEY='seeya-my-concert-test-v1';
const segmenter=typeof Intl.Segmenter==='function'?new Intl.Segmenter('ko',{granularity:'grapheme'}):null;
const chars=s=>segmenter?[...segmenter.segment(String(s))].map(x=>x.segment):Array.from(String(s));
const clean=s=>typeof s==='string'?s.normalize('NFC').replace(/[\u0000-\u001f\u007f-\u009f\u202a-\u202e\u2066-\u2069]/g,''):'';
const fresh=()=>({schema:2,hidden:{},vcrs:[],title:'우리, 다시 같은 무대에서',planner:'',sections:{opening:[],main:[],encore:[]},theme:'rose',updatedAt:''});
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
 if(raw.schema!==1 && raw.schema!==2){if(strict)throw Error('지원하지 않는 공유 버전이에요.');issues.push('이전 버전에서 복원 가능한 내용을 불러왔어요.');}
 for(const [key,max] of [['title',30],['planner',20]]){
  if(typeof raw[key]!=='string'){if(strict)throw Error('공연 이름 정보를 확인해 주세요.');issues.push('일부 이름 정보를 복원하지 못했어요.');continue;}
  const text=clean(raw[key]).trim();if(strict&&(chars(text).length>max||(key==='title'&&!text)))throw Error('공연 제목·기획자 이름 길이를 확인해 주세요.');
  d[key]=strict?text:chars(text).slice(0,max).join('');if(chars(text).length>max)issues.push('너무 긴 이름은 허용 길이까지 복원했어요.');
 }
 if(raw.schema===2){
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
 if(strict&&(Object.keys(raw.sections).length!==3||SECTIONS.some(s=>d.sections[s.id].length!==s.limit)))throw Error('완성되지 않은 공유 구성이에요.');
 if(!THEMES.includes(raw.theme)){if(strict)throw Error('지원하지 않는 포스터 테마예요.');issues.push('기본 포스터 테마로 복원했어요.');}else d.theme=raw.theme;
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
   list.splice(index,1);next.sections[target.id].push(action.id);message=target.ko+'로 옮겼어요.';
  }else if(action.type==='order'){
   const to=action.to;if(!Number.isInteger(to)||to<0||to>=list.length)throw Error('더 이동할 수 없어요.');
   list.splice(index,1);list.splice(to,0,action.id);message='순서를 바꿨어요.';
  }else throw Error('지원하지 않는 편집이에요.');
 }
 return {draft:next,message};
}
function encode(d){const payload={schema:2,hidden:Object.fromEntries(Object.entries(d.hidden||{}).filter(([id])=>find(d,id))),vcrs:d.vcrs||[],title:clean(d.title).trim(),planner:clean(d.planner).trim(),sections:d.sections,theme:d.theme};const bytes=new TextEncoder().encode(JSON.stringify(payload));return btoa(Array.from(bytes,b=>String.fromCharCode(b)).join('')).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'');}
function decode(value,songs){if(typeof value!=='string'||value.length>1000000||!/^[\w-]+$/.test(value))throw Error('공유 링크 형식을 확인해 주세요.');let raw;try{raw=JSON.parse(new TextDecoder('utf-8',{fatal:true}).decode(Uint8Array.from(atob(value.replace(/-/g,'+').replace(/_/g,'/')),c=>c.charCodeAt(0))));}catch{throw Error('공유 링크를 읽지 못했어요.');}return validate(raw,songs,true).draft;}
function filter(songs,query,artist,album){const q=clean(query).trim().toLocaleLowerCase('ko');return songs.filter(s=>s.enabled&&(artist==='all'||(artist==='group'?s.artistType==='group':s.memberId===artist))&&(album==='all'||s.albumId===album)&&s.title.toLocaleLowerCase('ko').includes(q));}
function restore(raw,songs){if(!raw)return {draft:fresh(),issues:[]};if(raw.length>1000000)throw Error('저장된 구성의 크기를 확인해 주세요.');let data;try{data=JSON.parse(raw);}catch{throw Error('이전 편집본을 읽지 못했어요. 원본은 지우지 않았습니다.');}return validate(data,songs);}
module.exports={SECTIONS,THEMES,KEY,chars,clean,fresh,count,find,problems,validate,change,encode,decode,filter,restore};

},
"src/shared/my-concert-show.js":function(module,exports,__require){
'use strict';
const media = __require("src/data/my-concert-media.json");
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

},
"src/data/my-concert-media.json":function(module,exports,__require){
module.exports={"channels":{"UCn6SB-9q1gNfGhx9_fFxIxg":"씨야엔터","UC_naRJKw5Isgpv5nF8yNXLw":"남규리","UCjLZIdvRV7fQ3m_DA9NEkOg":"김연지","UCz11CPccQ2AnizJrdp58Bog":"이보람"},"performances":{"group-track-001":[{"videoId":"sIkd5n4Nppw","title":"여인의 향기 - 씨야 (SeeYa) / 이보람 (Lee Boram) [보람씨야]","channel":"보람씨야","channelId":"UCz11CPccQ2AnizJrdp58Bog","duration":226,"published":"2020-02-27","embedAllowed":true,"checkedOn":"2026-11-02","played":true,"performanceId":"stage-sIkd5n4Nppw","date":"2020-02-27"},{"videoId":"-X63BGTttGM","title":"씨야(SeeYa) 콘서트「여인의 향기」직캠 | 261010 씨야 20주년 콘서트 The Fan in 청주","channel":"🐿람보바라기","channelId":"UChSBTXCJyi5jb8eesVMDdfA","duration":219,"published":"2026-10-14","embedAllowed":true,"checkedOn":"2026-11-02","played":true,"performanceId":"stage--X63BGTttGM","date":"2026-10-10"}],"group-track-002":[{"videoId":"jJypqIDNcv4","title":"06/07/09 씨야 구두 SBS인기가요","channel":"보람아몇씨야","channelId":"UCkMT4pUugWZJRfq2t58znaA","duration":225,"published":"2020-06-13","embedAllowed":true,"checkedOn":"2026-11-02","played":true,"performanceId":"stage-jJypqIDNcv4","date":"2006-07-09"},{"videoId":"eQ0KOxJL1kg","title":"씨야(SeeYa) 콘서트「구두」직캠 | 261010 씨야 20주년 콘서트 The Fan in 청주","channel":"🐿람보바라기","channelId":"UChSBTXCJyi5jb8eesVMDdfA","duration":236,"published":"2026-10-13","embedAllowed":true,"checkedOn":"2026-11-02","played":true,"performanceId":"stage-eQ0KOxJL1kg","date":"2026-10-10"}],"group-track-013":[{"videoId":"HwOHSUttRfY","title":"음악중심 - See Ya - Love Greeting, 씨야 - 사랑의 인사, Music Core 20070526","channel":"MBCkpop","channelId":"UCe52oeb7Xv_KaJsEzcKXJJg","duration":221,"published":"2012-02-17","embedAllowed":true,"checkedOn":"2026-11-02","played":true,"performanceId":"stage-HwOHSUttRfY","date":"2007-05-26"}],"group-track-014":[{"videoId":"B77V1wfmhqw","title":"결혼할까요 - 씨야 (SeeYa) / 이보람 (Lee Boram) [보람씨야]","channel":"보람씨야","channelId":"UCz11CPccQ2AnizJrdp58Bog","duration":203,"published":"2020-03-12","embedAllowed":true,"checkedOn":"2026-11-02","played":true,"performanceId":"stage-B77V1wfmhqw","date":"2020-03-12"}],"group-track-023":[{"videoId":"DpIkcrhqobw","title":"[4K]씨야 대구 콘서트 얼음인형 직캠 #씨야#남규리#김연지#이보람#SEEYA#씨야콘서트#라이브#직캠#live#concert#kpop#idol#youtube#music#video","channel":"투카로그","channelId":"UCVxB_XeTHjFT3o9-8HVPqnQ","duration":197,"published":"2026-09-13","embedAllowed":true,"checkedOn":"2026-11-02","played":true,"performanceId":"stage-DpIkcrhqobw","date":"2026-09-12"}],"group-track-026":[{"videoId":"zDjkCVF9zzI","title":"Seeya - Sad steps (씨야-슬픈발걸음) @SBS Inkigayo 인기가요 20080113","channel":"SBSKPOP X INKIGAYO","channelId":"UCS_hnpJLQTvBkqALgapi_4g","duration":198,"published":"2012-01-06","embedAllowed":true,"checkedOn":"2026-11-02","played":true,"performanceId":"stage-zDjkCVF9zzI","date":"2008-01-13"}],"group-track-027":[{"videoId":"1fzT-UcIF5E","title":"Seeya - I still like you (씨야-그래도좋아)@SBS Inkigayo 인기가요 200802017","channel":"SBSKPOP X INKIGAYO","channelId":"UCS_hnpJLQTvBkqALgapi_4g","duration":196,"published":"2012-01-10","embedAllowed":true,"checkedOn":"2026-11-02","played":true,"performanceId":"stage-1fzT-UcIF5E","date":"2012-01-10"}],"group-track-034":[{"videoId":"FhGp3Q4ZXtk","title":"[풀버전] 씨야 메인보컬 김연지 등장?!😮 라이브 실력에 난리 난 연습생들 반응ㄷㄷ🔥| 씨야 '미친 사랑의 노래' | SOONIGROUP","channel":"SOONIGROUP [수니그룹]","channelId":"UCO_HUi1SA_FoWMa-Zo3RHKg","duration":218,"published":"2026-04-02","embedAllowed":true,"checkedOn":"2026-11-02","played":true,"performanceId":"stage-FhGp3Q4ZXtk","date":"2026-04-02"}],"group-track-038":[{"videoId":"iEl0SHS7XAk","title":"Seeya - Hot girl (씨야-핫걸) @SBS Inkigayo 인기가요 20081019","channel":"SBSKPOP X INKIGAYO","channelId":"UCS_hnpJLQTvBkqALgapi_4g","duration":181,"published":"2012-01-18","embedAllowed":true,"checkedOn":"2026-11-02","played":true,"performanceId":"stage-iEl0SHS7XAk","date":"2008-10-19"}],"group-track-050":[{"videoId":"9AseMGUeNqY","title":"See Ya- His voice (씨야 - 그놈 목소리) @ SBS Inkigayo 인기가요 091220","channel":"SBSKPOP X INKIGAYO","channelId":"UCS_hnpJLQTvBkqALgapi_4g","duration":170,"published":"2012-01-25","embedAllowed":true,"checkedOn":"2026-11-02","played":true,"performanceId":"stage-9AseMGUeNqY","date":"2009-12-20"}],"group-track-055":[{"videoId":"w4DHifb4nCE","title":"9년 만에 부르는!! 내겐 너무 멋진 그대 - 씨야 (SeeYa) / 이보람 (Lee Boram) [보람씨야]","channel":"보람씨야","channelId":"UCz11CPccQ2AnizJrdp58Bog","duration":227,"published":"2020-08-10","embedAllowed":true,"checkedOn":"2026-11-02","played":true,"performanceId":"stage-w4DHifb4nCE","date":"2020-08-10"}],"group-track-057":[{"videoId":"XZOKi5OMtAs","title":"SEEYA (씨야) - Stay | Show! MusicCore | MBC260627방송","channel":"MBCkpop","channelId":"UCe52oeb7Xv_KaJsEzcKXJJg","duration":212,"published":"2026-06-27","embedAllowed":true,"checkedOn":"2026-11-02","played":true,"performanceId":"stage-XZOKi5OMtAs","date":"2026-06-27"},{"videoId":"Tm2OdWE8KBc","title":"Stay - SEEYA (씨야) | SBS 260621 방송","channel":"SBSKPOP X INKIGAYO","channelId":"UCS_hnpJLQTvBkqALgapi_4g","duration":210,"published":"2026-06-21","embedAllowed":true,"checkedOn":"2026-11-02","played":true,"performanceId":"stage-Tm2OdWE8KBc","date":"2026-06-21"}],"group-track-059":[{"videoId":"QY-F5iSN8aM","title":"씨야(SeeYa) 콘서트「봄처럼 그댄」직캠 Full Ver | 261004 씨야 20주년 콘서트 The Fan in 고양","channel":"🐿람보바라기","channelId":"UChSBTXCJyi5jb8eesVMDdfA","duration":226,"published":"2026-10-05","embedAllowed":true,"checkedOn":"2026-11-02","played":true,"performanceId":"stage-QY-F5iSN8aM","date":"2026-10-04"}],"group-track-060":[{"videoId":"m9fbiFor9F0","title":"2026년 10월 31일 씨야 20주년 인천 콘서트 김연지 직캠 - I Believe","channel":"냥펀치","channelId":"UCdJ2pixI027OrcraTPH303w","duration":216,"published":"2026-11-01","embedAllowed":true,"checkedOn":"2026-11-02","played":true,"performanceId":"stage-m9fbiFor9F0","date":null}],"group-track-061":[{"videoId":"SKZr7-QfysI","title":"씨야 - 그럼에도 우린 [260912 ‘The Fan’ 20주년 콘서트 - 대구]","channel":"정아선","channelId":"UChvTqi62fYg7i0PFBSEGh5A","duration":203,"published":"2026-09-13","embedAllowed":true,"checkedOn":"2026-11-02","played":true,"performanceId":"stage-SKZr7-QfysI","date":"2026-09-12"}],"group-track-066":[{"videoId":"si3VEPvpr9A","title":"씨야(SeeYa) 콘서트「바보」직캠 | 261004 씨야 20주년 콘서트 The Fan in 고양","channel":"🐿람보바라기","channelId":"UChSBTXCJyi5jb8eesVMDdfA","duration":194,"published":"2026-10-04","embedAllowed":true,"checkedOn":"2026-11-02","played":true,"performanceId":"stage-si3VEPvpr9A","date":"2026-10-04"}]},"vcr":[{"videoId":"rrMkSeKS4eM","title":"[(주)씨야엔터] 괴성과 고함이 난무한 씨야엔터 굿즈 아이템 회의?! 🐷⏰️👕","channel":"SEEYA Official","channelId":"UCn6SB-9q1gNfGhx9_fFxIxg","duration":113,"published":"2026-10-16","embedAllowed":true,"checkedOn":"2026-11-02","played":true},{"videoId":"Ip9XvKCeEkA","title":"[대구콘서트 스케치] 모두들 풍성한 한가위 보내시고 곧 고양에서 만나요! 🌕🩷","channel":"SEEYA Official","channelId":"UCn6SB-9q1gNfGhx9_fFxIxg","duration":291,"published":"2026-09-25","embedAllowed":true,"checkedOn":"2026-11-02","played":true},{"videoId":"6mik2QfyVCY","title":"EP.68 길고양이 겨울집 만들어주기!(feat. 방산시장 & 다이소) 남규리 소장님의 셀프 시공기 😺♥️🏠","channel":"남규리의 귤멍","channelId":"UC_naRJKw5Isgpv5nF8yNXLw","duration":822,"published":"2026-10-25","embedAllowed":true,"checkedOn":"2026-11-02","played":true},{"videoId":"PzdIJOVqS7I","title":"EP.67 남규리 ASMR 도전! 자연의 소리로 같이 힐링해요 🌳🍃🌞","channel":"남규리의 귤멍","channelId":"UC_naRJKw5Isgpv5nF8yNXLw","duration":1012,"published":"2026-10-18","embedAllowed":true,"checkedOn":"2026-11-02","played":true},{"videoId":"e2-TRuJUoVM","title":"[보람씨야] 조카네 집에 놀러 왔어요! 👶🏻 | 일상 브이로그 VLOG","channel":"보람씨야","channelId":"UCz11CPccQ2AnizJrdp58Bog","duration":448,"published":"2026-10-28","embedAllowed":true,"checkedOn":"2026-11-02","played":true},{"videoId":"-ahH0aTmUDY","title":"[보람씨야] 간만에 친구들이랑 성수 나들이 ☕️ | 일상 브이로그 VLOG","channel":"보람씨야","channelId":"UCz11CPccQ2AnizJrdp58Bog","duration":607,"published":"2026-10-21","embedAllowed":true,"checkedOn":"2026-11-02","played":true},{"videoId":"vScm0bPIGG8","title":"난생 처음 성대 수술하는 20년 차 가수의 슬기로운 '수술' 브이로그 .!","channel":"김연지 Official","channelId":"UCjLZIdvRV7fQ3m_DA9NEkOg","duration":536,"published":"2025-05-13","embedAllowed":true,"checkedOn":"2026-11-02","played":true},{"videoId":"r99O8h-lY40","title":"[VLOG] 김연지, 불후의 명곡 레전드 도전💛 | 왕중왕전 브이로그👑 (feat. DK 오빠) #잊지말아요","channel":"김연지 Official","channelId":"UCjLZIdvRV7fQ3m_DA9NEkOg","duration":1837,"published":"2025-04-29","embedAllowed":true,"checkedOn":"2026-11-02","played":true}]};
},
"src/client/my-concert-poster.js":function(module,exports,__require){
'use strict';
const {SECTIONS,chars}=__require("src/shared/my-concert.js");
const Show=__require("src/shared/my-concert-show.js");
function wrap(ctx,text,width){const lines=[];let line='';for(const ch of chars(text)){if(line&&ctx.measureText(line+ch).width>width){lines.push(line);line='';}line+=ch;}if(line)lines.push(line);return lines;}
function layout(ctx,d,songs){
 const byId=new Map(songs.map(s=>[s.id,s]));let size=34,groups,total=0;
 for(;size>=12;size--){
  ctx.font=`${size}px "Passport Dodum", sans-serif`;
  groups=SECTIONS.map(section=>({section,rows:d.sections[section.id].map(id=>{const song=Show.isHidden(id)?Show.songInfo(id,songs):byId.get(id);if(!song)throw Error('곡 정보를 다시 불러와 주세요.');const text=song.title+(song.artistType==='solo'?'  /  '+song.artistNames.join(' · '):'');const lines=wrap(ctx,text,822);return {song,lines,height:Math.max(44,lines.length*(size*1.28)+14)};})}));
  total=groups.reduce((n,g)=>n+42+g.rows.reduce((v,r)=>v+r.height,0)+16,0);if(total<=825)break;
 }
 if(total>825)throw Error('글자가 너무 길어 포스터에 담지 못했어요. 곡 정보를 확인해 주세요.');
 return {size,groups,total};
}
async function fonts(){if(!document.fonts)return;await Promise.race([Promise.allSettled([document.fonts.load('30px "Passport Dodum"'),document.fonts.load('60px "Passport Batang"')]),new Promise(r=>setTimeout(r,2500))]);}
function draw(canvas,d,songs){
 canvas.width=1080;const addedHeight=(d.vcrs?.length||0)*80;canvas.height=1350+addedHeight;const ctx=canvas.getContext('2d');if(!ctx)throw Error('이 브라우저에서 이미지 만들기를 사용할 수 없어요.');
 const night=d.theme==='night',ink=night?'#fff3eb':'#3d2834',muted=night?'#dfbdcb':'#855d70',line=night?'#735066':'#d8a2b6';
 const bg=ctx.createLinearGradient(0,0,1080,canvas.height);bg.addColorStop(0,night?'#342337':'#fff7ee');bg.addColorStop(1,night?'#171624':'#f6dbe4');ctx.fillStyle=bg;ctx.fillRect(0,0,1080,canvas.height);
 if(night){for(const [x,color] of [[220,'#b96a8350'],[850,'#a8a1cc35']]){const g=ctx.createRadialGradient(x,20,1,x,20,630);g.addColorStop(0,color);g.addColorStop(1,'#00000000');ctx.fillStyle=g;ctx.fillRect(0,0,1080,canvas.height);}}
 ctx.strokeStyle=line;ctx.lineWidth=2;ctx.strokeRect(34,34,1012,1282+addedHeight);ctx.strokeRect(46,46,988,1258+addedHeight);
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
  for(const row of g.rows){ctx.fillStyle=muted;ctx.font='20px "Passport Dodum",sans-serif';ctx.fillText(String(number++).padStart(2,'0'),90,y+l.size);ctx.fillStyle=ink;ctx.font=`${l.size}px "Passport Dodum",sans-serif`;row.lines.forEach((s,i)=>ctx.fillText(s,157,y+l.size+i*l.size*1.28));bounds.push({id:row.song.id,bottom:start+(y+row.height)*scale,lines:row.lines});y+=row.height;
   for(const vcr of d.vcrs||[]){if(vcr.after===number-1){ctx.fillStyle=muted;ctx.font='26px "Passport Dodum",sans-serif';ctx.fillText(Show.vcrLabel,157,y+40);y+=80/scale;}}
  }
  y+=16;
 }
 ctx.restore();ctx.strokeStyle=line;ctx.beginPath();ctx.moveTo(86,1215+addedHeight);ctx.lineTo(994,1215+addedHeight);ctx.stroke();ctx.fillStyle=muted;ctx.textAlign='center';ctx.font='17px "Passport Dodum",sans-serif';ctx.fillText('팬이 만든 가상 콘서트입니다. 실제 공연 안내가 아닙니다.',540,1250+addedHeight);ctx.font='16px sans-serif';ctx.fillText('SEEYA ARCHIVE  ·  seeya-fanpage.com',540,1281+addedHeight);
 return {width:1080,height:canvas.height,rows:bounds,fontSize:l.size};
}
async function render(canvas,d,songs){await fonts();return draw(canvas,d,songs);}
function png(canvas){return new Promise((resolve,reject)=>{try{canvas.toBlob(b=>b?resolve(b):reject(Error('이미지를 만들지 못했어요. 다시 시도해 주세요.')),'image/png');}catch{reject(Error('이미지 저장을 다시 시도해 주세요.'));}});}
module.exports={wrap,layout,draw,render,png};

},
"src/client/my-concert-specials.js":function(module,exports,__require){
'use strict';
const Show=__require("src/shared/my-concert-show.js");
module.exports=function specials({root,$,esc,getDraft,getSongs,getTarget,apply,announce}){
 const dialog=$('mcSpecial'),fields=$('mcSpecialFields');
 let kind,slot,vIndex;
 function options(items,selected){return items.map(([v,name])=>'<option value="'+esc(v)+'"'+(v===selected?' selected':'')+'>'+esc(name)+'</option>').join('');}
 function displayChoices(){
  const mode=$('mcMode').value;
  fields.querySelectorAll('[data-for]').forEach(el=>el.hidden=el.dataset.for!==mode);
  if(kind==='vcr' && mode==='fixed'){
   const v=Show.media.vcr.find(v=>v.videoId===$('mcFixed').value);
   $('mcVcrPreview').innerHTML=v?'<img alt="" src="https://i.ytimg.com/vi/'+v.videoId+'/mqdefault.jpg"><span>'+esc(v.channel)+' · '+Math.floor(v.duration/60)+':'+String(v.duration%60).padStart(2,'0')+'</span>':'';
  }
  if(kind==='hidden'){
   const range=readRange();
   $('mcCandidateCount').textContent='현재 후보 '+Show.candidates(range,getSongs()).length+'곡';
  }
 }
 function readRange(){
  const mode=$('mcMode').value;
  if(mode==='album')return {mode,album:$('mcHiddenAlbum').value};
  if(mode==='custom')return {mode,ids:[...fields.querySelectorAll('input:checked')].map(x=>x.value)};
  return {mode};
 }
 function open(type,id=null,index=null,gap=1){
  kind=type;slot=id;vIndex=index;const d=getDraft();
  $('mcSpecialError').textContent='';$('mcSpecialTitle').textContent=type==='hidden'?'히든 스테이지 설정':'VCR 설정';
  if(type==='hidden'){
   const range=d.hidden?.[id]||{mode:'all'},songs=getSongs(),albums=new Map(songs.map(s=>[s.albumId,s.albumTitle]));
   fields.innerHTML='<label>추첨 범위<select id="mcMode">'+options([['all','전체 랜덤'],['album','앨범별 랜덤'],['custom','직접 고른 곡 중 랜덤']],range.mode)+'</select></label><label data-for="album">앨범<select id="mcHiddenAlbum">'+options([...albums],range.album)+'</select></label><fieldset class="mc-candidates" data-for="custom"><legend>후보곡 선택</legend>'+Show.checkedSongs(songs).map(s=>'<label><input type="checkbox" value="'+esc(s.id)+'"'+(range.ids?.includes(s.id)?' checked':'')+'> '+esc(s.title)+'</label>').join('')+'</fieldset><p id="mcCandidateCount"></p>';
  }else{
   const v=d.vcrs?.[index]||{mode:'fixed',after:gap},media=Show.media;
   fields.innerHTML='<label>위치<select id="mcGap">'+options(Array.from({length:11},(_,i)=>[i+1,(i+1)+'번 노래 뒤 · '+(i+2)+'번 노래 앞']),v.after)+'</select></label><label>영상 선택<select id="mcMode">'+options([['fixed','직접 선택'],['random','랜덤']],v.mode)+'</select></label><div data-for="fixed"><label>영상<select id="mcFixed">'+options(media.vcr.map(x=>[x.videoId,x.title]),v.value)+'</select></label><div id="mcVcrPreview"></div></div><label data-for="random">채널<select id="mcChannel">'+options([['all','전체 채널'],...Object.entries(media.channels)],v.value)+'</select></label>';
  }
  displayChoices();dialog.showModal();
 }
 fields.addEventListener('change',displayChoices);
 function commit(){
  const d=JSON.parse(JSON.stringify(getDraft()));
  if(kind==='hidden'){
   const section=d.sections[getTarget()];const max={opening:1,main:9,encore:2}[getTarget()];
   if(!slot&&section.length>=max)throw Error('선택한 구간이 가득 찼어요. 추가할 구간을 바꿔주세요.');
   let id=slot;
   if(!id){let n=1;while(d.hidden['hidden-'+n])n++;id='hidden-'+n;section.push(id);}
   d.hidden[id]=Show.config(readRange(),getSongs());
  }else{
   const mode=$('mcMode').value;
   const next=Show.vcrConfig({after:Number($('mcGap').value),mode,value:$(mode==='fixed'?'mcFixed':'mcChannel').value});
   if(vIndex===null)d.vcrs.push(next);else d.vcrs[vIndex]=next;
  }
  Show.session(d,getSongs(),()=>0.5);
  apply(d);dialog.close();announce('공연 구성을 저장했어요.');
 }
 root.addEventListener('click',event=>{
  const b=event.target.closest('button');if(!b)return;
  try{
   if(b.dataset.special==='hidden')open('hidden',b.dataset.slot||null);
   if(b.dataset.special==='vcr')open('vcr',null,b.dataset.vindex===undefined?null:Number(b.dataset.vindex),Number(b.dataset.gap)||1);
   if(b.dataset.special==='save')commit();
   if(b.dataset.special==='cancel')dialog.close();
   if(b.dataset.special==='deleteVcr'||b.dataset.special==='upVcr'){
    const d=JSON.parse(JSON.stringify(getDraft())),index=Number(b.dataset.vindex);
    if(b.dataset.special==='deleteVcr')d.vcrs.splice(index,1);
    else{let prev=index-1;while(prev>=0&&d.vcrs[prev].after!==d.vcrs[index].after)prev--;if(prev>=0)[d.vcrs[index],d.vcrs[prev]]=[d.vcrs[prev],d.vcrs[index]];}
    apply(d);
   }
  }catch(e){$('mcSpecialError').textContent=e.message;announce(e.message);}
 });
 function gapRows(d,number){
  if(number>=12)return '';
  const rows=(d.vcrs||[]).map((v,i)=>({v,i})).filter(x=>x.v.after===number);
  return rows.map(({i},n)=>'<li class="mc-interlude"><strong>VCR 재생</strong> <button data-special="vcr" data-vindex="'+i+'">설정·위치</button> '+(n?'<button data-special="upVcr" data-vindex="'+i+'">위로</button> ':'')+'<button data-special="deleteVcr" data-vindex="'+i+'">삭제</button></li>').join('')+'<li class="mc-vcr-add"><button data-special="vcr" data-gap="'+number+'">+ VCR 추가</button></li>';
 }
 return {gapRows};
};

},
"src/client/my-concert-playback.js":function(module,exports,__require){
'use strict';
const Show=__require("src/shared/my-concert-show.js");
let apiPromise;
function loadApi(){
 if(window.YT?.Player)return Promise.resolve(window.YT);
 if(apiPromise)return apiPromise;
 apiPromise=new Promise((resolve,reject)=>{
  const script=document.createElement('script'),previous=window.onYouTubeIframeAPIReady;
  let timer;
  function finish(ok){clearTimeout(timer);window.onYouTubeIframeAPIReady=previous;if(ok)resolve(window.YT);else{script.remove();apiPromise=null;reject(Error('플레이어 연결 실패'));}}
  window.onYouTubeIframeAPIReady=()=>{try{previous?.();}finally{finish(true);}};
  script.src='https://www.youtube.com/iframe_api';script.onerror=()=>finish(false);
  timer=setTimeout(()=>finish(false),15000);document.head.appendChild(script);
 });return apiPromise;
}
module.exports=function playback({root,$,esc,getShow,getSongs,edit}){
 let queue=[],index=-1,alternative=0,player=null,ready=false,generation=0,playing=false,ended=false,active=false,finished=false,readyTimer,failed=new Map(),lastMove=0;
 const status=msg=>{$('mcPlayStatus').textContent=msg;};
 const current=()=>queue[index],video=()=>current()?.videos[alternative];
 function destroy(){generation++;ready=false;playing=false;clearTimeout(readyTimer);if(player){try{player.destroy();}catch{}player=null;}$('mcMount').innerHTML='';}
 function close(){active=false;destroy();$('mcWatch').hidden=true;queue=[];}
 const sectionName={opening:'OPENING',main:'MAIN STAGE',encore:'ENCORE'};
 function controls(){
  let section='';
  $('mcQueue').innerHTML=queue.map((e,i)=>{
   let heading='';if(section!==e.section){section=e.section;heading='<h3>'+sectionName[section]+'</h3>';}
   return heading+'<button data-queue="'+i+'"'+(i===index?' aria-current="step"':'')+'>'+esc(e.kind==='vcr'?'VCR':String(e.number).padStart(2,'0'))+' · '+esc(e.label)+(i===index?(playing?' · 재생 중':' · 현재 항목'):'')+(failed.has(i)?' · '+esc(failed.get(i)):!e.videos.length?' · 무대 영상 준비 중':'')+'</button>';
  }).join('');
  $('mcPrevious').disabled=nextPlayable(index-1,-1)<0;
  $('mcNext').disabled=finished||nextPlayable(index+1,1)>=queue.length;
 }
 function pauseForNetwork(){playing=false;ended=true;destroy();status('플레이어를 불러오지 못했어요. 연결을 확인한 뒤 다시 시도해 주세요.');controls();}
 function finish(){
  finished=true;playing=false;ended=true;destroy();controls();
  const misses=queue.filter((e,i)=>!e.videos.length||failed.has(i)).length;
  status(misses?'감상을 마쳤어요. 재생하지 못한 항목이 '+misses+'개 있어요.':'내 콘서트를 모두 감상했어요.');
 }
 function nextPlayable(start,step){let i=start;while(i>=0&&i<queue.length&&!queue[i].videos.length)i+=step;return i;}
 function advance(){lastMove=Date.now();const next=nextPlayable(index+1,1);if(next>=queue.length)finish();else select(next);}
 function describe(){
  const e=current(),v=video();
  $('mcNow').textContent=(e.kind==='vcr'?'VCR · 다음 노래 '+(e.after+1):e.number)+' / 12 · '+sectionName[e.section];
  $('mcPlayingTitle').textContent=(e.kind==='hidden'?'히든 스테이지 공개 · ':'')+e.title;
  $('mcPlayingCredit').textContent=[e.artist,v?.title,v?.date,v?.channel].filter(Boolean).join(' · ');
  const link=$('mcOriginal');link.hidden=!v;if(v)link.href='https://www.youtube.com/watch?v='+v.videoId;
 }
 function videoError(code){
  if(!navigator.onLine||![2,5,100,101,150].includes(code)){pauseForNetwork();return;}
  playing=false;ended=true;
  if(++alternative<current().videos.length){status('같은 곡의 대체 무대를 연결하고 있어요.');requestVideo();return;}
  failed.set(index,'영상 재생 제한');advance();
 }
 async function mount(){
  destroy();const token=generation;
  try{
   const YT=await loadApi();if(!active||token!==generation)return;
   const frame=document.createElement('iframe');frame.title='콘서트 영상';frame.allow='autoplay; encrypted-media; fullscreen; picture-in-picture';frame.allowFullscreen=true;frame.referrerPolicy='strict-origin-when-cross-origin';
   frame.src='https://www.youtube.com/embed/'+video().videoId+'?enablejsapi=1&playsinline=1&origin='+encodeURIComponent(location.origin);
   $('mcMount').replaceChildren(frame);
   const alive=()=>active&&generation===token&&!finished;
   const matches=()=>alive()&&player?.getVideoData?.()?.video_id===video()?.videoId;
   readyTimer=setTimeout(()=>{if(alive()&&!ready)pauseForNetwork();},15000);
   player=new YT.Player(frame,{events:{
    onReady(event){if(!alive())return;clearTimeout(readyTimer);ready=true;player=event.target;player.loadVideoById(video().videoId);},
    onStateChange(event){
     if(!matches()||event.target.getPlayerState()!==event.data)return;
     if(event.data===1){playing=true;ended=false;failed.delete(index);status('재생 중');controls();}
     if(event.data===2){status('일시정지');playing=false;controls();}
     if(event.data===0&&!ended&&hasStarted){ended=true;playing=false;advance();}
     if(event.data===1)hasStarted=true;
    },
    onAutoplayBlocked(){if(alive()){status('계속 보려면 재생 버튼을 눌러주세요.');playing=false;controls();}},
    onError(event){if(!alive()||ended)return;const id=event.target.getVideoData?.()?.video_id;if(id&&id!==video()?.videoId)return;videoError(event.data);}
   }});
  }catch{if(active&&token===generation)pauseForNetwork();}
 }
 let hasStarted=false,lastVideo='';
 function requestVideo(){
  const id=video().videoId,repeat=lastVideo===id;lastVideo=id;
  hasStarted=false;playing=false;ended=false;describe();controls();
  if(!navigator.onLine){pauseForNetwork();return;}
  if(!ready||repeat)mount();else {try{player.loadVideoById(id);}catch{pauseForNetwork();}}
 }
 function select(i){
  if(i<0||i>=queue.length)return;
  index=i;alternative=0;finished=false;playing=false;ended=false;hasStarted=false;
  if(!current().videos.length){destroy();describe();controls();status('무대 영상 준비 중 · 다음 항목을 선택해 주세요.');return;}
  status('영상을 연결하고 있어요.');requestVideo();
 }
 function start(fresh){
  const d=getShow();
  if(fresh||!queue.length)queue=Show.session(d,getSongs());
  failed.clear();active=true;finished=false;
  $('mcWatchTitle').textContent=d.title;$('mcWatch').hidden=false;$('mcResult').hidden=true;
  const i=nextPlayable(0,1);if(i===queue.length){finish();return;}select(i);$('mcWatchTitle').focus();
 }
 function summary(d,songs){
  const rows=Show.rows(d),hidden=rows.filter(r=>r.kind==='hidden').length,vcr=rows.filter(r=>r.kind==='vcr').length;
  const connected=rows.filter(r=>r.kind==='song'&&Show.media.performances[r.id]?.length).length;
  let problem='';try{Show.session(d,songs,()=>0.5);}catch(e){problem=e.message;}
  $('mcCoverage').textContent=problem||('지정곡 '+(12-hidden)+'곡 중 무대 연결 '+connected+'곡 · 히든 스테이지 '+hidden+'개 · VCR '+vcr+'개'+(!connected&&!hidden&&!vcr?' · 연결된 영상이 없어요.':''));
  $('mcStart').disabled=!!problem||!connected&&!hidden&&!vcr;
 }
 root.addEventListener('click',event=>{
  const b=event.target.closest('button');if(!b)return;
  if(b.dataset.queue!==undefined){select(Number(b.dataset.queue));return;}
  switch(b.dataset.watch){
   case 'start':try{start(true);}catch(e){status(e.message);}break;
   case 'same':start(false);break;case 'redraw':start(true);break;
   case 'prev':case 'next':{const now=Date.now();if(now-lastMove<250)return;lastMove=now;const step=b.dataset.watch==='next'?1:-1;select(nextPlayable(index+step,step));break;}
   case 'resume':if(ready&&!finished&&video())player.playVideo();else if(!finished&&current()?.videos.length)select(index);break;
   case 'poster':close();$('mcResult').hidden=false;$('mcResultTitle').focus();break;
   case 'edit':close();$('mcResult').hidden=false;edit();break;
  }
 });
 window.addEventListener('pagehide',()=>{if(active){close();$('mcResult').hidden=false;}});
 window.addEventListener('offline',()=>{if(active&&!finished)pauseForNetwork();});
 return {summary,close};
};

}
};const cache={};function __require(id){if(cache[id])return cache[id].exports;const m=cache[id]={exports:{}};modules[id](m,m.exports,__require);return m.exports;}__require("src/client/my-concert.js");})();
