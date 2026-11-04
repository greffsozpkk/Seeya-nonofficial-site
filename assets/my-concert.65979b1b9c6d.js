(function(){'use strict';const modules={
"src/client/my-concert.js":function(module,exports,__require){
'use strict';
const M=__require("src/shared/my-concert.js"),P=__require("src/client/my-concert-poster.js");
const Show=__require("src/shared/my-concert-show.js"),Design=__require("src/shared/my-concert-design.js"),Diary=__require("src/client/concert-diary.js");
const initSpecials=__require("src/client/my-concert-specials.js");
const initPlayback=__require("src/client/my-concert-playback.js");
const root=document.getElementById('myConcert');
if(root){
 const $=id=>document.getElementById(id),esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 let songs=[],draft=M.fresh(),shared=null,artist='all',album='all',query='',page=1,target='opening',timer,undoTimer,undo=null,confirmAction=null,rawSaved=null,blocked=false,dirty=false,result=false,renderToken=0,imageUrl='',loading=false;
 const pageSize=10,announce=t=>{$('mcStatus').textContent=t;};
 const extras=initSpecials({root,$,esc,getDraft:()=>draft,getSongs:()=>songs,getTarget:()=>target,announce,apply(next,section){if(section)target=section;draft=next;invalidateUndo();if(next.sections[target].length===M.SECTIONS.find(s=>s.id===target).limit)target=M.SECTIONS.find(s=>next.sections[s.id].length<s.limit)?.id||target;persist();update();}});
 const playback=initPlayback({root,$,esc,getShow:()=>shared||draft,getSongs:()=>songs,edit:()=>$('mcEditButton').click()});
 function storageRead(){try{return localStorage.getItem(M.KEY);}catch{return null;}}
 function save(){clearTimeout(timer);if(blocked)return;draft.updatedAt=new Date().toISOString();try{localStorage.setItem(M.KEY,JSON.stringify(draft));rawSaved=JSON.stringify(draft);dirty=false;$('mcSaved').textContent='이 브라우저에 저장됨 · 다른 기기와는 동기화되지 않아요.';}catch{$('mcSaved').textContent='자동 저장을 사용할 수 없어요. 완성 후 이미지를 저장해주세요.';}}
 function persist(){dirty=true;save();}
 function metadata(){
  const title=M.clean(draft.title).trim(),planner=M.clean(draft.planner).trim();$('mcTitleCount').textContent=M.chars(title).length+' / 30';$('mcPlannerCount').textContent=M.chars(planner).length+' / 20';
  $('mcTitleError').textContent=!title||M.chars(title).length>30?'공연 제목은 1~30자로 입력해 주세요.':'';
  $('mcPlannerError').textContent=M.chars(planner).length>20?'기획자 이름은 20자 이내로 입력해 주세요.':'';
  $('mcTitle').setAttribute('aria-invalid',String(!!$('mcTitleError').textContent));$('mcPlanner').setAttribute('aria-invalid',String(!!$('mcPlannerError').textContent));
  const problems=M.problems(draft);
  $('mcReady').textContent=problems[0]||'공연 완성 가능';
  $('mcMobileCount').textContent='현재 '+M.count(draft)+'곡 · 최대 32곡'+(problems.length?'':' · 공연 완성 가능');
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
  $('mcSections').innerHTML=M.SECTIONS.map(section=>`<section class="mc-section" data-destination="${section.id}" aria-label="${section.ko}"><div class="mc-section-title"><h3>${section.name}</h3><span>${draft.sections[section.id].length} / ${section.limit}</span></div><ol>${draft.sections[section.id].map((id,index)=>{const s=Show.songInfo(id,songs);return `<li class="mc-track" draggable="true" data-track="${esc(id)}" data-section="${section.id}"><div class="mc-track-head"><span class="mc-grip" title="잡아서 순서 바꾸기" aria-hidden="true">⠿</span><div class="mc-track-name"><span class="mc-track-number">${String(n++).padStart(2,'0')}</span><strong>${esc(s.title)}</strong><small>${esc(s.artistNames.join(' · '))}</small></div></div><div class="mc-track-actions">${Show.isHidden(id)?'<button data-special="hidden" data-slot="'+esc(id)+'">후보 설정</button>':''}<button type="button" data-order="-1" data-id="${esc(id)}" data-section="${section.id}" aria-label="${esc(s.title)} 위로"${index===0?' disabled':''}>↑</button><button type="button" data-order="1" data-id="${esc(id)}" data-section="${section.id}" aria-label="${esc(s.title)} 아래로"${index===draft.sections[section.id].length-1?' disabled':''}>↓</button><select data-move="${esc(id)}" data-section="${section.id}" aria-label="${esc(s.title)} 다른 구간으로 이동"><option value="">구간 이동</option>${M.SECTIONS.filter(x=>x.id!==section.id).map(x=>`<option value="${x.id}">${x.ko}${draft.sections[x.id].length>=x.limit?' (가득 참)':''}</option>`).join('')}</select><button type="button" data-remove="${esc(id)}" data-section="${section.id}" aria-label="${esc(s.title)} 삭제">삭제</button></div></li>${extras.gapRows(draft,n-1)}`;}).join('')}${!draft.sections[section.id].length?'<li class="mc-slot">이 구간에 첫 곡을 담아 주세요.</li>':''}</ol></section>`).join('');
  const count=M.count(draft);$('mcTotal').textContent=`현재 ${count}곡 · 최대 32곡`;$('mcTabCount').textContent=count;$('mcPickCount').textContent=`현재 ${count}곡`;
  $('mcTarget').value=target;
 }
 function update(){metadata();setlist();library();$('mcCompleteError').textContent='';$('mcTopError').textContent='';}
 function tab(name){root.querySelector('.mc-columns').dataset.mobileTab=name;root.querySelectorAll('[role="tab"]').forEach(b=>{b.setAttribute('aria-selected',String(b.dataset.tab===name));b.tabIndex=b.dataset.tab===name?0:-1;});}
 function editing(){playback.close();result=false;shared=null;renderToken++;$('mcSharedError').hidden=true;$('mcResult').hidden=true;$('mcEditor').hidden=false;$('mcCopy').hidden=true;history.replaceState(null,'',location.pathname);$('mcTitle').value=draft.title;$('mcPlanner').value=draft.planner;refreshAlbums();update();}
 function invalidateUndo(){clearTimeout(undoTimer);undo=null;$('mcUndo').hidden=true;}
 function mutate(action){
  try{
   const previous={sections:draft.sections,vcrs:draft.vcrs},r=M.change(draft,action,songs);if(action.type==='add'&&Object.keys(r.draft.hidden||{}).length)Show.session(r.draft,songs,()=>0.5);
   draft=r.draft;invalidateUndo();let message=r.message;
   if(action.type==='remove'){undo=previous;$('mcUndo').hidden=false;undoTimer=setTimeout(invalidateUndo,10000);}
   if(action.type==='add'){const s=M.SECTIONS.find(s=>s.id===target);if(draft.sections[target].length===s.limit){const next=M.SECTIONS.find(x=>draft.sections[x.id].length<x.limit);if(next){target=next.id;message=s.ko+'을 골랐어요. '+next.ko+'에 넣을 노래를 골라주세요.';}else message='32곡을 모두 골랐어요. 포스터를 완성해 보세요.';}}
   persist();update();announce(message);
   if(action.type==='order'){const b=[...root.querySelectorAll('[data-order]')].find(x=>x.dataset.id===action.id&&x.dataset.order===String(action.to>0?-1:1));b?.focus();}
  }catch(e){announce(e.message);}
 }
 function confirm(message,action){confirmAction=action;$('mcConfirmMessage').textContent=message;$('mcConfirm').showModal();}
 function clearShared(){history.replaceState(null,'',location.pathname);shared=null;}
 async function showResult(d){
  $('mcDiaryStatus').textContent='이 브라우저에 저장되며 다이어리 백업에 포함됩니다.';$('mcDiaryLink').hidden=true;playback.summary(d,songs);result=true;$('mcEditor').hidden=true;$('mcResult').hidden=false;$('mcSharedError').hidden=true;$('mcCopy').hidden=true;
  $('mcResultTitle').textContent=shared?'팬이 꿈꾸는 씨야 콘서트':'당신의 무대가 완성됐어요';$('mcResultHint').textContent=shared?'공유받은 구성이에요. 내 편집본은 그대로 보관됩니다.':'첫 곡부터 앙코르까지, 좋아하는 마음을 한 장에 담았어요.';$('mcEditButton').textContent=shared?'이 구성으로 만들기':'다시 편집하기';
  d.format=Design.outputFormat(d.theme,d.format);$('mcPosterFormat').innerHTML=Object.entries(Design.formats).filter(([id])=>id!=='long'||Design.allowsLong(d.theme)).map(([id,label])=>'<option value="'+id+'">'+label+'</option>').join('');
  $('mcPosterTheme').value=d.theme;$('mcPosterFont').value=d.font;$('mcPosterFormat').value=d.format||'poster';
  $('mcFormatHint').textContent=!Design.allowsLong(d.theme)?'이 배경은 그림의 비율을 살려 한 장 포스터로 저장해요.':d.format==='long'?'곡명 크기를 유지하고 목록 길이에 맞춰 이미지가 길어집니다.':M.count(d)>=20||d.vcrs.length>=3?'곡이나 VCR이 많다면 ‘읽기 편한 긴 이미지’를 추천해요.':'한 장 포스터는 전체 구성을 한눈에, 긴 이미지는 곡명을 크게 볼 수 있어요.';
  $('mcTextList').innerHTML='<h3>'+esc(d.title.trim())+'</h3>'+M.SECTIONS.map(section=>'<h4>'+section.name+'</h4>'+Show.rows(d).filter(e=>e.section===section.id).map(e=>'<p>'+(e.kind==='vcr'?Show.vcrLabel:e.number+'. '+esc(Show.songInfo(e.id,songs).title))+'</p>').join('')).join('');
  const token=++renderToken;$('mcPosterStatus').textContent='포스터를 만들고 있어요.';$('mcPoster').hidden=true;
  try{const off=document.createElement('canvas');await P.render(off,d,songs);if(token!==renderToken)return;$('mcPoster').height=off.height;$('mcPoster').getContext('2d').drawImage(off,0,0);$('mcPoster').hidden=false;$('mcPosterStatus').textContent='1080 × '+off.height+' · 조작 버튼 없이 포스터만 저장됩니다.';}
  catch(e){if(token===renderToken)$('mcPosterStatus').textContent=e.message+' 이미지 저장 버튼으로 다시 시도할 수 있어요.';}
 }
 async function saveDiary(){
  const b=$('mcDiarySave'),status=$('mcDiaryStatus');b.disabled=true;
  try{const saved=await Diary.save(shared||draft,songs);status.textContent=saved.already?'이미 같은 포스터가 다이어리에 있어요.':'셋리스트와 포스터를 다이어리에 저장했어요.';const a=$('mcDiaryLink');a.href='/diary/#entry='+encodeURIComponent(saved.id);a.hidden=false;}
  catch(e){status.textContent='다이어리에 저장하지 못했어요. '+e.message;}finally{b.disabled=false;}
 }
 $('mcDiarySave').addEventListener('click',saveDiary);
 async function exportImage(){
  const b=root.querySelector('[data-action="export"]');b.disabled=true;b.textContent='이미지 만드는 중…';
  try{const canvas=document.createElement('canvas');await P.render(canvas,shared||draft,songs);$('mcExportSize').textContent='1080 × '+canvas.height;const blob=await P.png(canvas);if(imageUrl)URL.revokeObjectURL(imageUrl);imageUrl=URL.createObjectURL(blob);$('mcExportImage').src=imageUrl;$('mcDownload').href=imageUrl;$('mcOpenImage').href=imageUrl;const date=new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Seoul',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date()).replace(/\D/g,'');$('mcDownload').download='seeya-my-concert-'+date+'-'+((shared||draft).format||'poster')+'.png';$('mcImageDialog').showModal();}
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
  if(['mcPosterTheme','mcPosterFont','mcPosterFormat'].includes(e.target.id)){
   const d=shared||draft;d[{mcPosterTheme:'theme',mcPosterFont:'font',mcPosterFormat:'format'}[e.target.id]]=e.target.value;
   d.format=Design.outputFormat(d.theme,d.format);if(!shared)persist();showResult(d);return;
  }
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
  
  switch(b.dataset.action){
   case 'retry':load();break;
   case 'clearFilters':artist='all';album='all';query='';page=1;$('mcSearch').value='';root.querySelectorAll('[data-artist]').forEach(x=>x.setAttribute('aria-pressed',String(x.dataset.artist==='all')));refreshAlbums();library();break;
   case 'undo':if(undo){Object.assign(draft,undo);invalidateUndo();persist();update();announce('삭제한 곡을 원래 위치에 돌려놓았어요.');}break;
   case 'finish':metadata();{const errors=M.problems(draft);try{Show.session(draft,songs,()=>0.5);}catch(e){errors.push(e.message);}const errorBox=$(b.nextElementSibling?.id==='mcTopError'?'mcTopError':'mcCompleteError');$('mcTopError').textContent='';$('mcCompleteError').textContent='';errorBox.textContent=errors.join(' ');if(errors.length){tab('set');announce(errors.join(' '));if($('mcTitleError').textContent)$('mcTitle').focus();else if($('mcPlannerError').textContent)$('mcPlanner').focus();else errorBox.scrollIntoView({block:'nearest'});break;}persist();showResult(draft);$('mcResultTitle').focus();}break;
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
 __require("src/client/my-concert-drag.js")({root,getDraft:()=>draft,mutate});
 window.addEventListener('pagehide',()=>{if(dirty)save();});
 load();
}

},
"src/shared/my-concert.js":function(module,exports,__require){
'use strict';
const Show=__require("src/shared/my-concert-show.js");
const SECTIONS=[{id:'opening',name:'OPENING',ko:'오프닝',limit:3},{id:'main',name:'MAIN STAGE',ko:'본 무대',limit:25},{id:'encore',name:'ENCORE',ko:'앙코르',limit:4}];
const design=__require("src/shared/my-concert-design.js");
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
 d.format=design.outputFormat(d.theme,d.format);
 d.updatedAt=typeof raw.updatedAt==='string'?raw.updatedAt:'';
 return {draft:d,issues:[...new Set(issues)]};
}
function change(d,action,songs){
 const next=JSON.parse(JSON.stringify(d)),section=SECTIONS.find(s=>s.id===action.section);let message='';
 if(action.type==='vcr-order'){
  if(!Number.isInteger(action.index)||!next.vcrs[action.index]||!Number.isInteger(action.after)||action.after<1||action.after>=count(d))throw Error('VCR은 노래와 노래 사이에 놓아 주세요.');
  const moved=next.vcrs.splice(action.index,1)[0];moved.after=action.after;
  const siblings=next.vcrs.filter(v=>v.after===action.after);
  if(!Number.isInteger(action.to)||action.to<0||action.to>siblings.length)throw Error('VCR 순서를 다시 선택해 주세요.');
  const before=siblings[action.to];let at=before?next.vcrs.indexOf(before):siblings.length?next.vcrs.indexOf(siblings.at(-1))+1:next.vcrs.length;
  next.vcrs.splice(at,0,moved);return {draft:next,message:'VCR 순서를 바꿨어요.'};
 }
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

},
"src/shared/my-concert-show.js":function(module,exports,__require){
'use strict';
const media = __require("src/data/my-concert-media.json");
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
  const sources=media.performances[id]||[];
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

},
"src/data/my-concert-media.json":function(module,exports,__require){
module.exports={"channels":{"UCn6SB-9q1gNfGhx9_fFxIxg":"씨야엔터","UC_naRJKw5Isgpv5nF8yNXLw":"남규리","UCjLZIdvRV7fQ3m_DA9NEkOg":"김연지","UCz11CPccQ2AnizJrdp58Bog":"이보람"},"performances":{"group-track-001":[{"videoId":"I6yE2PFlSaU","title":"060319 씨야(Seeya) - 여인의 향기(Scent of a Woman) | SBS 인기가요","channel":"여돌음방모음","channelId":"UCFil7uLJDTsOQPLGb9AwZyg","duration":213,"date":"2006-03-19","kind":"broadcast","embedAllowed":true,"played":false,"checkedOn":"2026-11-03"},{"videoId":"L0plLJw2v-I","title":"씨야(See ya ) - 여인의 향기 [윤도현의 러브레터] | KBS 20060414 방송","channel":"Again 가요톱10 : KBS KPOP Classic","channelId":"UCmZ19AIj_wcpwRcqG7p9L8g","duration":216,"date":"2006-04-14","kind":"broadcast","embedAllowed":true,"played":false,"checkedOn":"2026-11-03"},{"videoId":"nn639JifcBQ","title":"씨야  - '여인의 향기' [KBS 콘서트7080, 20060826] | SeeYa","channel":"Again 가요톱10 : KBS KPOP Classic","channelId":"UCmZ19AIj_wcpwRcqG7p9L8g","duration":231,"kind":"broadcast","embedAllowed":true,"played":false,"checkedOn":"2026-11-02"},{"videoId":"_8nBbgv5DJI","title":"[MV] 씨야(SeeYa) \"여인의 향기\" - 여인의 향기","channel":"DanalEntertainment","channelId":"UCpmctTnUfbeoycGhieZQAmw","duration":451,"kind":"official","embedAllowed":true,"played":false,"checkedOn":"2026-11-02"},{"videoId":"YKW0KSHTF1k","title":"여인의 향기","channel":"SeeYa - Topic","channelId":"UCcZrxE5zk2zKYmMe9lg9xKA","duration":227,"kind":"official","embedAllowed":true,"played":false,"checkedOn":"2026-11-02"}],"group-track-002":[{"videoId":"jJypqIDNcv4","title":"06/07/09 씨야 구두 SBS인기가요","channel":"보람아몇씨야","channelId":"UCkMT4pUugWZJRfq2t58znaA","duration":225,"published":"2020-06-13","embedAllowed":true,"checkedOn":"2026-11-02","played":true,"performanceId":"stage-jJypqIDNcv4","date":"2006-07-09","kind":"broadcast"},{"videoId":"yu2GPWuI4oI","title":"구두","channel":"SeeYa - Topic","channelId":"UCcZrxE5zk2zKYmMe9lg9xKA","duration":251,"kind":"official","embedAllowed":true,"played":false,"checkedOn":"2026-11-02"}],"group-track-003":[{"videoId":"D9k98OKgfJ8","title":"[뮤직] 워너비 - With(씨야 See Ya) 사랑하기 때문에 06.05.07","channel":"ajax wang","channelId":"UCHaf6i978GU126WwRjZGrSA","duration":208,"kind":"broadcast","embedAllowed":true,"played":false,"checkedOn":"2026-11-02"},{"videoId":"Qq5vnQOAo70","title":"사랑하기때문에","channel":"SeeYa - Topic","channelId":"UCcZrxE5zk2zKYmMe9lg9xKA","duration":235,"kind":"official","embedAllowed":true,"played":false,"checkedOn":"2026-11-02"}],"group-track-004":[{"videoId":"3AokMjrjDD4","title":"접시꽃","channel":"SeeYa - Topic","channelId":"UCcZrxE5zk2zKYmMe9lg9xKA","duration":232,"kind":"official","embedAllowed":true,"played":false,"checkedOn":"2026-11-02"}],"group-track-005":[{"videoId":"eCk7xwAIDDQ","title":"씨야(See ya ) - Promise U [윤도현의 러브레터] | KBS 20060414 방송","channel":"Again 가요톱10 : KBS KPOP Classic","channelId":"UCmZ19AIj_wcpwRcqG7p9L8g","duration":196,"kind":"broadcast","embedAllowed":true,"played":false,"checkedOn":"2026-11-02"},{"videoId":"xWVlz_ThGTk","title":"Promise U","channel":"SeeYa - Topic","channelId":"UCcZrxE5zk2zKYmMe9lg9xKA","duration":221,"kind":"official","embedAllowed":true,"played":false,"checkedOn":"2026-11-02"}],"group-track-006":[{"videoId":"sgpSPvBDUlI","title":"처음부터 또다시","channel":"SeeYa - Topic","channelId":"UCcZrxE5zk2zKYmMe9lg9xKA","duration":264,"kind":"official","embedAllowed":true,"played":false,"checkedOn":"2026-11-02"}],"group-track-007":[{"videoId":"Sv123H1lVI0","title":"유죄","channel":"SeeYa - Topic","channelId":"UCcZrxE5zk2zKYmMe9lg9xKA","duration":245,"kind":"official","embedAllowed":true,"played":false,"checkedOn":"2026-11-02"}],"group-track-008":[{"videoId":"2923ZP17xVA","title":"이별해보기","channel":"SeeYa - Topic","channelId":"UCcZrxE5zk2zKYmMe9lg9xKA","duration":239,"kind":"official","embedAllowed":true,"played":false,"checkedOn":"2026-11-02"}],"group-track-009":[{"videoId":"gCc_mJwuZTs","title":"TearsandFears","channel":"SeeYa - Topic","channelId":"UCcZrxE5zk2zKYmMe9lg9xKA","duration":209,"kind":"official","embedAllowed":true,"played":false,"checkedOn":"2026-11-02"}],"group-track-010":[{"videoId":"6JQ1KkBQZDw","title":"사랑했다면","channel":"SeeYa - Topic","channelId":"UCcZrxE5zk2zKYmMe9lg9xKA","duration":265,"kind":"official","embedAllowed":true,"played":false,"checkedOn":"2026-11-02"}],"group-track-011":[{"videoId":"bA8F0v603OM","title":"그냥","channel":"SeeYa - Topic","channelId":"UCcZrxE5zk2zKYmMe9lg9xKA","duration":265,"kind":"official","embedAllowed":true,"played":false,"checkedOn":"2026-11-02"}],"group-track-012":[{"videoId":"DQ_9e-iKRtA","title":"내 잘못입니다","channel":"SeeYa - Topic","channelId":"UCcZrxE5zk2zKYmMe9lg9xKA","duration":252,"kind":"official","embedAllowed":true,"played":false,"checkedOn":"2026-11-02"}],"group-track-013":[{"videoId":"uYp15-zFr4M","title":"[슈가송] 그 시절 우리가 사랑했던 씨야(See Ya)의 '사랑의 인사'♪ (엉엉 ㅠ_ㅠ) 슈가맨3(SUGARMAN3) 12회","channel":"JTBC Entertainment","channelId":"UCFL1sCAksD6_7JIZwwHcwjQ","duration":336,"date":"2020-02-21","kind":"broadcast","embedAllowed":true,"played":false,"checkedOn":"2026-11-04"},{"videoId":"HwOHSUttRfY","title":"음악중심 - See Ya - Love Greeting, 씨야 - 사랑의 인사, Music Core 20070526","channel":"MBCkpop","channelId":"UCe52oeb7Xv_KaJsEzcKXJJg","duration":221,"kind":"broadcast","embedAllowed":true,"played":false,"checkedOn":"2026-11-02"},{"videoId":"lu1kJ25OWfg","title":"[MV] 씨야(SeeYa) \"Lovely Sweet Heart\" - 사랑의 인사","channel":"DanalEntertainment","channelId":"UCpmctTnUfbeoycGhieZQAmw","duration":368,"kind":"official","embedAllowed":true,"played":false,"checkedOn":"2026-11-02"},{"videoId":"wRdNZKsh_a0","title":"사랑의 인사","channel":"SeeYa - Topic","channelId":"UCcZrxE5zk2zKYmMe9lg9xKA","duration":275,"kind":"official","embedAllowed":true,"played":false,"checkedOn":"2026-11-02"}],"group-track-014":[{"videoId":"tIiNpSJoQ6k","title":"씨야(Seeya) - 결혼할까요 💎몽글몽글 그 시절 사랑노래💙 @2007 바다축제 개막 축하쇼","channel":"BAAMBC LIVE | 뱀비씨 라이브","channelId":"UCiqZSNtipGd0IH59WfriBfA","duration":229,"kind":"broadcast","embedAllowed":true,"played":false,"checkedOn":"2026-11-02"},{"videoId":"Ut_QWvPwvgA","title":"[MV] 씨야(SeeYa) \"Lovely Sweet Heart\" - 결혼할까요","channel":"DanalEntertainment","channelId":"UCpmctTnUfbeoycGhieZQAmw","duration":255,"kind":"official","embedAllowed":true,"played":false,"checkedOn":"2026-11-02"},{"videoId":"0ROaJ2Rp9UU","title":"결혼할까요","channel":"SeeYa - Topic","channelId":"UCcZrxE5zk2zKYmMe9lg9xKA","duration":254,"kind":"official","embedAllowed":true,"played":false,"checkedOn":"2026-11-02"}],"group-track-015":[{"videoId":"A9RgzfE7_os","title":"너는 내 남자","channel":"SeeYa - Topic","channelId":"UCcZrxE5zk2zKYmMe9lg9xKA","duration":211,"kind":"official","embedAllowed":true,"played":false,"checkedOn":"2026-11-02"}],"group-track-016":[{"videoId":"Swo_UcXurL8","title":"Dirty Dancing","channel":"SeeYa - Topic","channelId":"UCcZrxE5zk2zKYmMe9lg9xKA","duration":239,"kind":"official","embedAllowed":true,"played":false,"checkedOn":"2026-11-02"}],"group-track-017":[{"videoId":"RShXr9We_DA","title":"어떻게 널 잊겠니","channel":"SeeYa - Topic","channelId":"UCcZrxE5zk2zKYmMe9lg9xKA","duration":256,"kind":"official","embedAllowed":true,"played":false,"checkedOn":"2026-11-02"}],"group-track-018":[{"videoId":"iIgUm9J3csg","title":"사랑아","channel":"SeeYa - Topic","channelId":"UCcZrxE5zk2zKYmMe9lg9xKA","duration":262,"kind":"official","embedAllowed":true,"played":false,"checkedOn":"2026-11-02"}],"group-track-019":[{"videoId":"-cdNcji7uow","title":"그 사람이 나를 사랑해요","channel":"SeeYa - Topic","channelId":"UCcZrxE5zk2zKYmMe9lg9xKA","duration":257,"kind":"official","embedAllowed":true,"played":false,"checkedOn":"2026-11-02"}],"group-track-020":[{"videoId":"qJQQQi5Tdx8","title":"Summer Dream","channel":"SeeYa - Topic","channelId":"UCcZrxE5zk2zKYmMe9lg9xKA","duration":255,"kind":"official","embedAllowed":true,"played":false,"checkedOn":"2026-11-02"}],"group-track-021":[{"videoId":"alI0-z40e1U","title":"사랑이 간다","channel":"SeeYa - Topic","channelId":"UCcZrxE5zk2zKYmMe9lg9xKA","duration":171,"kind":"official","embedAllowed":true,"played":false,"checkedOn":"2026-11-02"}],"group-track-022":[{"videoId":"iWdwBHd9bFQ","title":"[4K 직캠] 수원 2026 씨야 20주년 콘서트 : THE FAN  - 감동을 주세요(남규리,김연지,이보람)","channel":"kyunphg","channelId":"UC3nEDqvVuqBnigVc88fiMyA","duration":252,"kind":"tour","date":"2026-10-17","checkedOn":"2026-11-03","embedAllowed":true,"played":false},{"videoId":"jnRBe9IktFs","title":"감동을 주세요","channel":"SeeYa - Topic","channelId":"UCcZrxE5zk2zKYmMe9lg9xKA","duration":246,"kind":"official","embedAllowed":true,"played":false,"checkedOn":"2026-11-02"}],"group-track-023":[{"videoId":"AlabxMtT3YI","title":"070913 씨야 얼음인형 엠카","channel":"seeyalover","channelId":"UC3yj9gHFG88rsHJUenBp5Vg","duration":223,"kind":"broadcast","embedAllowed":true,"played":false,"checkedOn":"2026-11-02"},{"videoId":"_veObwyUQj8","title":"[MV] 씨야(SeeYa) \"Lovely Sweet Heart\" - 얼음인형","channel":"DanalEntertainment","channelId":"UCpmctTnUfbeoycGhieZQAmw","duration":289,"kind":"official","embedAllowed":true,"played":false,"checkedOn":"2026-11-02"},{"videoId":"k9nKPduDfUg","title":"얼음인형","channel":"SeeYa - Topic","channelId":"UCcZrxE5zk2zKYmMe9lg9xKA","duration":218,"kind":"official","embedAllowed":true,"played":false,"checkedOn":"2026-11-02"}],"group-track-024":[{"videoId":"zK-pL3A1MeM","title":"순애보","channel":"SeeYa - Topic","channelId":"UCcZrxE5zk2zKYmMe9lg9xKA","duration":295,"kind":"official","embedAllowed":true,"played":false,"checkedOn":"2026-11-02"}],"group-track-025":[{"videoId":"IwU9XiTITMs","title":"남","channel":"SeeYa - Topic","channelId":"UCcZrxE5zk2zKYmMe9lg9xKA","duration":238,"kind":"official","embedAllowed":true,"played":false,"checkedOn":"2026-11-02"}],"group-track-026":[{"videoId":"0nFA9QPlnjg","title":"See Ya - Sad Step, 씨야 - 슬픈 발걸음, Music Core 20080105","channel":"MBCkpop","channelId":"UCe52oeb7Xv_KaJsEzcKXJJg","duration":197,"kind":"broadcast","embedAllowed":true,"played":false,"checkedOn":"2026-11-02"},{"videoId":"zDjkCVF9zzI","title":"Seeya - Sad steps (씨야-슬픈발걸음) @SBS Inkigayo 인기가요 20080113","channel":"SBSKPOP X INKIGAYO","channelId":"UCS_hnpJLQTvBkqALgapi_4g","duration":198,"published":"2012-01-06","embedAllowed":true,"checkedOn":"2026-11-02","played":true,"performanceId":"stage-zDjkCVF9zzI","date":"2008-01-13","kind":"broadcast"},{"videoId":"cFEE7KZZUy0","title":"슬픈 발걸음 (구두 II)","channel":"SeeYa - Topic","channelId":"UCcZrxE5zk2zKYmMe9lg9xKA","duration":270,"kind":"official","embedAllowed":true,"played":false,"checkedOn":"2026-11-02"}],"group-track-027":[{"videoId":"kzbky4z5gu4","title":"See Ya - I still like you, 씨야 - 그래도 좋아, Music Core 20080202","channel":"MBCkpop","channelId":"UCe52oeb7Xv_KaJsEzcKXJJg","duration":186,"kind":"broadcast","embedAllowed":true,"played":false,"checkedOn":"2026-11-02"},{"videoId":"1fzT-UcIF5E","title":"Seeya - I still like you (씨야-그래도좋아)@SBS Inkigayo 인기가요 200802017","channel":"SBSKPOP X INKIGAYO","channelId":"UCS_hnpJLQTvBkqALgapi_4g","duration":196,"published":"2012-01-10","embedAllowed":true,"checkedOn":"2026-11-02","played":true,"performanceId":"stage-1fzT-UcIF5E","date":"2012-01-10","kind":"broadcast"},{"videoId":"Wu2mflg_tyk","title":"그래도 좋아","channel":"SeeYa - Topic","channelId":"UCcZrxE5zk2zKYmMe9lg9xKA","duration":267,"kind":"official","embedAllowed":true,"played":false,"checkedOn":"2026-11-02"}],"group-track-028":[{"videoId":"cav_38-1kBU","title":"Classic","channel":"SeeYa - Topic","channelId":"UCcZrxE5zk2zKYmMe9lg9xKA","duration":200,"kind":"official","embedAllowed":true,"played":false,"checkedOn":"2026-11-02"}],"group-track-029":[{"videoId":"tDFsPmjW3uc","title":"연가","channel":"SeeYa - Topic","channelId":"UCcZrxE5zk2zKYmMe9lg9xKA","duration":230,"kind":"official","embedAllowed":true,"played":false,"checkedOn":"2026-11-02"}],"group-track-030":[{"videoId":"R2Sf4TVhBVQ","title":"07.03.01 씨야 미워요 엠 카운트다운","channel":"씨야박물관","channelId":"UCbQr4QmfQqvOAT7aSY09KBw","duration":250,"kind":"broadcast","embedAllowed":true,"played":false,"checkedOn":"2026-11-02"},{"videoId":"N4z5AUvKkaw","title":"미워요","channel":"SeeYa - Topic","channelId":"UCcZrxE5zk2zKYmMe9lg9xKA","duration":259,"kind":"official","embedAllowed":true,"played":false,"checkedOn":"2026-11-02"}],"group-track-034":[{"videoId":"dRu8mfIa2Ak","title":"[화질개선] 씨야 - 미친 사랑의 노래 #한곡인가 #인기가요","channel":"SBS 옛날 예능 - 빽능","channelId":"UCvRIeQeTZDHRcqVZRu0XBug","duration":622,"kind":"broadcast","embedAllowed":true,"played":false,"checkedOn":"2026-11-02"},{"videoId":"FhGp3Q4ZXtk","title":"[풀버전] 씨야 메인보컬 김연지 등장?!😮 라이브 실력에 난리 난 연습생들 반응ㄷㄷ🔥| 씨야 '미친 사랑의 노래' | SOONIGROUP","channel":"SOONIGROUP [수니그룹]","channelId":"UCO_HUi1SA_FoWMa-Zo3RHKg","duration":218,"published":"2026-04-02","embedAllowed":true,"checkedOn":"2026-11-02","played":true,"performanceId":"stage-FhGp3Q4ZXtk","date":"2026-04-02","kind":"live"},{"videoId":"tnjV-wOYok8","title":"미친 사랑의 노래","channel":"SeeYa - Topic","channelId":"UCcZrxE5zk2zKYmMe9lg9xKA","duration":240,"kind":"official","embedAllowed":true,"played":false,"checkedOn":"2026-11-02"}],"group-track-035":[{"videoId":"kya1JSJak9A","title":"Seeya & BrownEyedGirls - The Day [09_24_06]","channel":"pamy15","kind":"broadcast","played":false,"checkedOn":"2026-11-02"},{"videoId":"3aGZFjkZZsY","title":"The Day","channel":"SeeYa - Topic","channelId":"UCcZrxE5zk2zKYmMe9lg9xKA","duration":240,"kind":"official","embedAllowed":true,"played":false,"checkedOn":"2026-11-02"}],"group-track-036":[{"videoId":"p8vMZP9T1t4","title":"정","channel":"SeeYa - Topic","channelId":"UCcZrxE5zk2zKYmMe9lg9xKA","duration":229,"kind":"official","embedAllowed":true,"played":false,"checkedOn":"2026-11-02"}],"group-track-037":[{"videoId":"Ppd8T3vwHoY","title":"음악중심 - See Ya - Are you leaving, 씨야 - 가니, Music Core 20081101","channel":"MBCkpop","channelId":"UCe52oeb7Xv_KaJsEzcKXJJg","duration":179,"kind":"broadcast","embedAllowed":true,"played":false,"checkedOn":"2026-11-02"},{"videoId":"4aQEJqWtSzs","title":"가니 (Feat. SG워너비 김용준, 황정음, Mario)","channel":"SeeYa - Topic","channelId":"UCcZrxE5zk2zKYmMe9lg9xKA","duration":202,"kind":"official","embedAllowed":true,"played":false,"checkedOn":"2026-11-02"}],"group-track-038":[{"videoId":"28tmGVxRG3s","title":"See Ya - Hot Girl, 씨야 - 핫 걸, Music Core 20081004","channel":"MBCkpop","channelId":"UCe52oeb7Xv_KaJsEzcKXJJg","duration":210,"date":"2008-10-04","kind":"broadcast","embedAllowed":true,"played":false,"checkedOn":"2026-11-04"},{"videoId":"CzkUIfl5R4Q","title":"See Ya - Hot Girl, 씨야 - 핫 걸, Music Core 20081018","channel":"MBCkpop","channelId":"UCe52oeb7Xv_KaJsEzcKXJJg","duration":189,"date":"2008-10-18","kind":"broadcast","embedAllowed":true,"played":false,"checkedOn":"2026-11-04"},{"videoId":"VYvKqDIxERQ","title":"Hot girl","channel":"SeeYa - Topic","channelId":"UCcZrxE5zk2zKYmMe9lg9xKA","duration":196,"kind":"official","embedAllowed":true,"played":false,"checkedOn":"2026-11-02"}],"group-track-039":[{"videoId":"3MlJembFD7s","title":"Turn it up","channel":"SeeYa - Topic","channelId":"UCcZrxE5zk2zKYmMe9lg9xKA","duration":222,"kind":"official","embedAllowed":true,"played":false,"checkedOn":"2026-11-02"}],"group-track-040":[{"videoId":"d25C3kMqdps","title":"집으로 돌아오는길 (Feat. SG워너비 김진호)","channel":"SeeYa - Topic","channelId":"UCcZrxE5zk2zKYmMe9lg9xKA","duration":213,"kind":"official","embedAllowed":true,"played":false,"checkedOn":"2026-11-02"}],"group-track-041":[{"videoId":"6EWtPi95ytY","title":"내가 울더라도","channel":"SeeYa - Topic","channelId":"UCcZrxE5zk2zKYmMe9lg9xKA","duration":201,"kind":"official","embedAllowed":true,"played":false,"checkedOn":"2026-11-02"}],"group-track-042":[{"videoId":"87lN0cAX-FY","title":"덩그러니","channel":"SeeYa - Topic","channelId":"UCcZrxE5zk2zKYmMe9lg9xKA","duration":273,"kind":"official","embedAllowed":true,"played":false,"checkedOn":"2026-11-02"}],"group-track-043":[{"videoId":"MzfMWx7hTuE","title":"사모곡","channel":"SeeYa - Topic","channelId":"UCcZrxE5zk2zKYmMe9lg9xKA","duration":213,"kind":"official","embedAllowed":true,"played":false,"checkedOn":"2026-11-02"}],"group-track-044":[{"videoId":"0d6qNoyLVII","title":"I wish","channel":"SeeYa - Topic","channelId":"UCcZrxE5zk2zKYmMe9lg9xKA","duration":234,"kind":"official","embedAllowed":true,"played":false,"checkedOn":"2026-11-02"}],"group-track-045":[{"videoId":"6kOSSc2Sk4s","title":"남자는 그래요","channel":"SeeYa - Topic","channelId":"UCcZrxE5zk2zKYmMe9lg9xKA","duration":270,"kind":"official","embedAllowed":true,"played":false,"checkedOn":"2026-11-02"}],"group-track-046":[{"videoId":"PZQnPnaAee4","title":"081102 씨야 그사람","channel":"휴우흐","kind":"broadcast","played":false,"checkedOn":"2026-11-02"},{"videoId":"GM8MyJ7ejJ4","title":"그 사람 (구두 Ⅲ)","channel":"SeeYa - Topic","channelId":"UCcZrxE5zk2zKYmMe9lg9xKA","duration":212,"kind":"official","embedAllowed":true,"played":false,"checkedOn":"2026-11-02"}],"group-track-047":[{"videoId":"haW2RdDxZJM","title":"솜사탕","channel":"SeeYa - Topic","channelId":"UCcZrxE5zk2zKYmMe9lg9xKA","duration":190,"kind":"official","embedAllowed":true,"played":false,"checkedOn":"2026-11-02"}],"group-track-048":[{"videoId":"1zsvEKsRU3s","title":"나 없이도","channel":"SeeYa - Topic","channelId":"UCcZrxE5zk2zKYmMe9lg9xKA","duration":282,"kind":"official","embedAllowed":true,"played":false,"checkedOn":"2026-11-02"}],"group-track-049":[{"videoId":"O80eQwDaEuI","title":"Loving you","channel":"SeeYa - Topic","channelId":"UCcZrxE5zk2zKYmMe9lg9xKA","duration":208,"kind":"official","embedAllowed":true,"played":false,"checkedOn":"2026-11-02"}],"group-track-050":[{"videoId":"iXzTNAD2m20","title":"SeeYa - His voice, 씨야 - 그놈 목소리, Music Core 20091114","channel":"MBCkpop","channelId":"UCe52oeb7Xv_KaJsEzcKXJJg","duration":180,"kind":"broadcast","embedAllowed":true,"played":false,"checkedOn":"2026-11-02"},{"videoId":"9AseMGUeNqY","title":"See Ya- His voice (씨야 - 그놈 목소리) @ SBS Inkigayo 인기가요 091220","channel":"SBSKPOP X INKIGAYO","channelId":"UCS_hnpJLQTvBkqALgapi_4g","duration":170,"published":"2012-01-25","embedAllowed":true,"checkedOn":"2026-11-02","played":true,"performanceId":"stage-9AseMGUeNqY","date":"2009-12-20","kind":"broadcast"},{"videoId":"_esZucb02gs","title":"MV | 씨야(SeeYa) - 그 놈 목소리 (His Voice) | Rebloom","channel":"DanalEntertainment","channelId":"UCpmctTnUfbeoycGhieZQAmw","duration":185,"kind":"official","embedAllowed":true,"played":false,"checkedOn":"2026-11-02"},{"videoId":"678GDIWAgPg","title":"그 놈 목소리","channel":"SeeYa - Topic","channelId":"UCcZrxE5zk2zKYmMe9lg9xKA","duration":185,"kind":"official","embedAllowed":true,"played":false,"checkedOn":"2026-11-02"}],"group-track-051":[{"videoId":"TTEB9BXpMuk","title":"앗차!","channel":"SeeYa - Topic","channelId":"UCcZrxE5zk2zKYmMe9lg9xKA","duration":176,"kind":"official","embedAllowed":true,"played":false,"checkedOn":"2026-11-02"}],"group-track-052":[{"videoId":"QiSUtXJY_ws","title":"눈물의 여왕","channel":"SeeYa - Topic","channelId":"UCcZrxE5zk2zKYmMe9lg9xKA","duration":262,"kind":"official","embedAllowed":true,"played":false,"checkedOn":"2026-11-02"}],"group-track-053":[{"videoId":"kfgEH8WBpsc","title":"바람핀다 믿었니","channel":"SeeYa - Topic","channelId":"UCcZrxE5zk2zKYmMe9lg9xKA","duration":194,"kind":"official","embedAllowed":true,"played":false,"checkedOn":"2026-11-02"}],"group-track-054":[{"videoId":"FyN34Vw1SAw","title":"T-Gana","channel":"SeeYa - Topic","channelId":"UCcZrxE5zk2zKYmMe9lg9xKA","duration":204,"kind":"official","embedAllowed":true,"played":false,"checkedOn":"2026-11-02"}],"group-track-055":[{"videoId":"KsqChvjaI6w","title":"SeeYa - So Nice To Meet You, 씨야 - 내겐 너무 멋진 그대, Music Core 20110129","channel":"MBCkpop","channelId":"UCe52oeb7Xv_KaJsEzcKXJJg","duration":218,"kind":"broadcast","embedAllowed":true,"played":false,"checkedOn":"2026-11-02"},{"videoId":"Yax4nGDtkW4","title":"MV | 씨야(SeeYa) - 내겐 너무 멋진 그대 | See You Again","channel":"DanalEntertainment","channelId":"UCpmctTnUfbeoycGhieZQAmw","duration":227,"kind":"official","embedAllowed":true,"played":false,"checkedOn":"2026-11-02"},{"videoId":"kkjuZvmpLFo","title":"내겐 너무 멋진 그대","channel":"SeeYa - Topic","channelId":"UCcZrxE5zk2zKYmMe9lg9xKA","duration":229,"kind":"official","embedAllowed":true,"played":false,"checkedOn":"2026-11-02"}],"group-track-056":[{"videoId":"4gpfFganjz4","title":"SeeYa - The Last, 씨야 - 더 라스트, Music Core 20110129","channel":"MBCkpop","channelId":"UCe52oeb7Xv_KaJsEzcKXJJg","duration":127,"kind":"broadcast","embedAllowed":true,"played":false,"checkedOn":"2026-11-02"},{"videoId":"wGRlWbfddJk","title":"The last","channel":"SeeYa - Topic","channelId":"UCcZrxE5zk2zKYmMe9lg9xKA","duration":204,"kind":"official","embedAllowed":true,"played":false,"checkedOn":"2026-11-02"}],"group-track-057":[{"videoId":"XZOKi5OMtAs","title":"SEEYA (씨야) - Stay | Show! MusicCore | MBC260627방송","channel":"MBCkpop","channelId":"UCe52oeb7Xv_KaJsEzcKXJJg","duration":212,"published":"2026-06-27","embedAllowed":true,"checkedOn":"2026-11-02","played":true,"performanceId":"stage-XZOKi5OMtAs","date":"2026-06-27","kind":"broadcast"},{"videoId":"Tm2OdWE8KBc","title":"Stay - SEEYA (씨야) | SBS 260621 방송","channel":"SBSKPOP X INKIGAYO","channelId":"UCS_hnpJLQTvBkqALgapi_4g","duration":210,"published":"2026-06-21","embedAllowed":true,"checkedOn":"2026-11-02","played":true,"performanceId":"stage-Tm2OdWE8KBc","date":"2026-06-21","kind":"broadcast"},{"videoId":"I1zhkwIuZ0A","title":"씨야 SEEYA - Stay Official MV (SEEYA Ver.)","channel":"SEEYA Official","channelId":"UCn6SB-9q1gNfGhx9_fFxIxg","duration":202,"kind":"official","embedAllowed":true,"played":false,"checkedOn":"2026-11-02"}],"group-track-058":[{"videoId":"5NHQjIoadto","title":"[4K]씨야 SEEYA - 계절은 돌고 돌아 Fancam│2026.08.29 경희대 평화의전당 콘서트 : THE FAN","channel":"DodongFancam도동직캠","channelId":"UCgm2Xzs8djJCUemRhGM6S-g","duration":210,"kind":"tour","embedAllowed":true,"played":false,"checkedOn":"2026-11-02"},{"videoId":"Uq9Tw4NERmQ","title":"Returning to You","channel":"SeeYa - Topic","channelId":"UCcZrxE5zk2zKYmMe9lg9xKA","duration":218,"kind":"official","embedAllowed":true,"played":false,"checkedOn":"2026-11-02"}],"group-track-059":[{"videoId":"vH8QBCYO0Yc","title":"[열린예술무대 뒤란] 씨야(SeeYa) - 봄처럼 그댄(You, Like Spring) | ubc 260821 방송","channel":"열린예술무대 뒤란","kind":"broadcast","played":false,"checkedOn":"2026-11-02"},{"videoId":"JeNLPdkh6FM","title":"씨야 SEEYA - 봄처럼 그댄 Official MV","channel":"SEEYA Official","channelId":"UCn6SB-9q1gNfGhx9_fFxIxg","duration":267,"kind":"official","embedAllowed":true,"played":false,"checkedOn":"2026-11-02"}],"group-track-060":[{"videoId":"pr3jaMISgsk","title":"260829 씨야 20주년 전국 투어 콘서트 THEFAN - 서울 씨야 Seeya - I Believe","channel":"콘서트 직촬","channelId":"UCzNyK9awuAbwFKM4TUF2ofQ","duration":227,"kind":"tour","date":"2026-08-29","checkedOn":"2026-11-03","embedAllowed":true,"played":false},{"videoId":"_CGekO1IRGc","title":"씨야 SEEYA - I Believe Official MV","channel":"SEEYA Official","channelId":"UCn6SB-9q1gNfGhx9_fFxIxg","duration":260,"kind":"official","embedAllowed":true,"played":false,"checkedOn":"2026-11-02"}],"group-track-061":[{"videoId":"whTAN8EeeB8","title":"씨야 -  그럼에도 우린 [열린 음악회/Open Concert] | KBS 260607 방송","channel":"KBS 레전드 케이팝","kind":"broadcast","played":false,"checkedOn":"2026-11-02"},{"videoId":"dmsw-tEenZ0","title":"씨야 SEEYA - 그럼에도 우린 Official MV","channel":"SEEYA Official","channelId":"UCn6SB-9q1gNfGhx9_fFxIxg","duration":222,"kind":"official","embedAllowed":true,"played":false,"checkedOn":"2026-11-02"}],"group-track-062":[{"videoId":"OvNfsRAnG74","title":"260829 씨야 20주년 전국 투어 콘서트 THEFAN - 서울 씨야 Seeya 안돼요","channel":"콘서트 직촬","kind":"tour","played":false,"checkedOn":"2026-11-02"},{"videoId":"aECHa9GVJok","title":"Please Don't","channel":"SeeYa - Topic","channelId":"UCcZrxE5zk2zKYmMe9lg9xKA","duration":242,"kind":"official","embedAllowed":true,"played":false,"checkedOn":"2026-11-02"}],"group-track-063":[{"videoId":"UMpTyqk0sRA","title":"씨야(SeeYa) 콘서트「잔향-4집」직캠 | 260829 씨야 20주년 콘서트 The Fan in 서울","channel":"🐿람보바라기","kind":"tour","played":false,"checkedOn":"2026-11-02"},{"videoId":"nFo1grp3Bjw","title":"Traces of You","channel":"SeeYa - Topic","channelId":"UCcZrxE5zk2zKYmMe9lg9xKA","duration":236,"kind":"official","embedAllowed":true,"played":false,"checkedOn":"2026-11-02"}],"group-track-064":[{"videoId":"mPgTjK3GurQ","title":"2026 08 29 끝내 꺾이지 않는 것 - SEEYA 20주년 기념 콘서트 THE FAN 직캠 4K60P","channel":"햄햄햄","kind":"tour","played":false,"checkedOn":"2026-11-02"},{"videoId":"iOQddZHdcLQ","title":"The Unbroken","channel":"SeeYa - Topic","channelId":"UCcZrxE5zk2zKYmMe9lg9xKA","duration":224,"kind":"official","embedAllowed":true,"played":false,"checkedOn":"2026-11-02"}],"group-track-065":[{"videoId":"OfaMxNJlD_I","title":"씨야 SEEYA - 우리 Live Ver. Official MV","channel":"SEEYA Official","channelId":"UCn6SB-9q1gNfGhx9_fFxIxg","duration":279,"kind":"live","embedAllowed":true,"played":false,"checkedOn":"2026-11-02"}],"group-track-066":[{"videoId":"8BBTw0eJ4HA","title":"Seeya-fool (씨야-바보) @SBS Inkigayo 인기가요 20080413@SBS Inkigayo 인기가요 20080413vv","channel":"SBSKPOP X INKIGAYO","channelId":"UCS_hnpJLQTvBkqALgapi_4g","duration":190,"kind":"broadcast","checkedOn":"2026-11-03","embedAllowed":true,"played":false,"date":"2008-04-13"},{"videoId":"ANUSI5FfWFM","title":"[MV] 씨야 _ 바보","channel":"1theK (원더케이)","channelId":"UCweOkPb1wVVH0Q0Tlj4a5Pw","duration":205,"kind":"official","embedAllowed":true,"played":false,"checkedOn":"2026-11-02"}],"group-track-068":[{"videoId":"sHeo6FDdH_A","title":"[2K] 씨야 & 다비치 & 지연 - 여성시대 (인기가요 2009.05.31)","channel":"화질중시채널","kind":"broadcast","played":false,"checkedOn":"2026-11-02"},{"videoId":"JQ-5-HjuSv0","title":"여성시대","channel":"SeeYa - Topic","channelId":"UCcZrxE5zk2zKYmMe9lg9xKA","duration":212,"kind":"official","embedAllowed":true,"played":false,"checkedOn":"2026-11-02"}],"group-track-070":[{"videoId":"ubVtYiAopyg","title":"【TVPP】Davichi(with T-ARA & SeeYa) - Wonder Woman, 다비치(티아라 & 씨야) - 원더우먼 @ Show! Music Core Live","channel":"TV-People","kind":"broadcast","played":false,"checkedOn":"2026-11-02"},{"videoId":"HuTfUAuwkdU","title":"원더우먼","channel":"SeeYa - Topic","channelId":"UCcZrxE5zk2zKYmMe9lg9xKA","duration":218,"kind":"official","embedAllowed":true,"played":false,"checkedOn":"2026-11-02"}],"group-track-071":[{"videoId":"sHnPOsZSpFQ","title":"씨야 - 가슴이 뭉클 (2010년)","channel":"MBC강원영동 MUSIC","kind":"broadcast","played":false,"checkedOn":"2026-11-02"},{"videoId":"mhmDf1o1hw0","title":"Personal Taste (Original Television Soundtrack) Pt. 2 - My heart is touched (개인의 취향...","channel":"SeeYa - Topic","channelId":"UCcZrxE5zk2zKYmMe9lg9xKA","duration":230,"kind":"official","embedAllowed":true,"played":false,"checkedOn":"2026-11-02"}],"group-track-072":[{"videoId":"NObuBFWx9RM","title":"미쳤나봐","channel":"SeeYa - Topic","channelId":"UCXh-QU9pBl7UgJQaFjbA6gQ","duration":239,"kind":"official","embedAllowed":true,"played":false,"checkedOn":"2026-11-02"}],"group-track-074":[{"videoId":"hpPNSxHK2Mw","title":"씨야 그리고 다비치 - 다 컸잖아 (다 컸잖아)","channel":"SeeYa - Topic","channelId":"UCXh-QU9pBl7UgJQaFjbA6gQ","duration":218,"kind":"official","embedAllowed":true,"played":false,"checkedOn":"2026-11-02"}],"group-track-075":[{"videoId":"5xVPQKrZ-yI","title":"시차 (With DAVICHI, Black Pearl) (시차)","channel":"SeeYa - Topic","channelId":"UCcZrxE5zk2zKYmMe9lg9xKA","duration":229,"kind":"official","embedAllowed":true,"played":false,"checkedOn":"2026-11-02"}],"group-track-076":[{"videoId":"7rs0gK-ahIg","title":"씨야 SeeYa - 용기를 주세요","channel":"MusicActionPlus","channelId":"UCbkYJV9r3qDOHYVvCoX2AAQ","duration":141,"kind":"official","embedAllowed":true,"played":false,"checkedOn":"2026-11-02"}],"group-fate-one-person":[{"videoId":"oqNMOWPuEW0","title":"가슴속에 한사람 (가슴속에 한사람)","channel":"SeeYa - Topic","channelId":"UCcZrxE5zk2zKYmMe9lg9xKA","duration":264,"kind":"official","embedAllowed":true,"played":false,"checkedOn":"2026-11-02"}],"solo-solo-MiUAHBTO55g":[{"videoId":"cUb8m6bpbyw","title":"Nam Gyu-ri - Man, 남규리 - 남자, Music Core 20080809","channel":"MBCkpop","channelId":"UCe52oeb7Xv_KaJsEzcKXJJg","duration":179,"kind":"broadcast","embedAllowed":true,"played":false,"checkedOn":"2026-11-02"},{"videoId":"MiUAHBTO55g","title":"고사: 피의 중간고사 (Original Motion Picture Soundtrack) - 남자 (남자 (男子))","channel":"Nam Gyu ri - Topic","channelId":"UCKRsSjFGndJb9VrTisc60ig","duration":226,"kind":"official","embedAllowed":true,"played":false,"checkedOn":"2026-11-02"}],"solo-solo-Sn7YYiXgQ6Y":[{"videoId":"MbHnINHWyC0","title":"남규리(Nam Kyuri) - 깊은 밤을 날아서 [콘서트7080] | KBS 20070505 방송","channel":"Again 가요톱10 : KBS KPOP Classic","channelId":"UCmZ19AIj_wcpwRcqG7p9L8g","duration":125,"kind":"broadcast","embedAllowed":true,"played":false,"checkedOn":"2026-11-02"},{"videoId":"Sn7YYiXgQ6Y","title":"깊은 밤을 날아서","channel":"SeeYa - Topic","channelId":"UCcZrxE5zk2zKYmMe9lg9xKA","duration":121,"kind":"official","embedAllowed":true,"played":false,"checkedOn":"2026-11-02"}],"solo-solo-cjuv_qVAgRA":[{"videoId":"ZhGOpr2lljo","title":"남규리 'HALO' 라이브클립 VER.1","channel":"뮤직카우","channelId":"UCWMPzEshTKfeQZKFRxyX8_w","duration":184,"kind":"live","embedAllowed":true,"played":false,"checkedOn":"2026-11-02"},{"videoId":"cjuv_qVAgRA","title":"[MV] Nam Kyu Ri(남규리) _ HALO","channel":"1theK (원더케이)","channelId":"UCweOkPb1wVVH0Q0Tlj4a5Pw","duration":186,"kind":"official","embedAllowed":true,"played":false,"checkedOn":"2026-11-02"}],"solo-solo-siyf1bcO5Gc":[{"videoId":"FbOzui3wk1Q","title":"남규리 - 그래도 좋아해요ㅣENA 케이팝업 차트쇼ㅣENA250829 방송","channel":"ENA K-POP","channelId":"UCFpfKdO4MMSc9ZoMjk2Tikg","duration":216,"kind":"broadcast","embedAllowed":true,"played":false,"checkedOn":"2026-11-02"},{"videoId":"siyf1bcO5Gc","title":"[MV] Nam Gyu ri(남규리) _ Still, I Like You(그래도 좋아해요)","channel":"1theK (원더케이)","channelId":"UCweOkPb1wVVH0Q0Tlj4a5Pw","duration":227,"kind":"official","embedAllowed":true,"played":false,"checkedOn":"2026-11-02"}],"solo-solo-9klPsmjNPDw":[{"videoId":"7CsBU-Pk-Po","title":"남규리 - 디셈버드림 (December Dream) Live Ver.","channel":"남규리 Nam Gyu Ri","channelId":"UCNbU5_rEMwaqy6PSXS1wiBA","duration":187,"kind":"live","embedAllowed":true,"played":false,"checkedOn":"2026-11-02"},{"videoId":"9klPsmjNPDw","title":"남규리 - 디셈버드림 (December Dream) Official Music Video","channel":"남규리 Nam Gyu Ri","channelId":"UCNbU5_rEMwaqy6PSXS1wiBA","duration":189,"kind":"official","embedAllowed":true,"played":false,"checkedOn":"2026-11-02"}],"solo-solo-nN7NV5FBhBw":[{"videoId":"nN7NV5FBhBw","title":"LIVE CLIP | 남규리(Nam Gyu Ri) - 슬픔이 찾아와서 그래(Prod. 로코베리)","channel":"에잇 8recordz x studio8","channelId":"UCWQTae3cFaQke_LchN7cGaQ","duration":198,"kind":"live","embedAllowed":true,"played":false,"checkedOn":"2026-11-02"}],"solo-solo-5USUHmWpPcg":[{"videoId":"jsZqyfW7-7M","title":"남규리 - 가슴앓이 (Love, Unspoken) LIVE Clip","channel":"남규리 Nam Gyu Ri","channelId":"UCNbU5_rEMwaqy6PSXS1wiBA","duration":196,"kind":"live","embedAllowed":true,"played":false,"checkedOn":"2026-11-02"},{"videoId":"5USUHmWpPcg","title":"[MV] Nam Gyu Ri(남규리) _ Love, Unspoken(가슴앓이)","channel":"1theK (원더케이)","channelId":"UCweOkPb1wVVH0Q0Tlj4a5Pw","duration":225,"kind":"official","embedAllowed":true,"played":false,"checkedOn":"2026-11-02"}],"solo-solo-Mjl8tBDX5Ik":[{"videoId":"UkOV4Z8Vpm8","title":"[Live Clip] 남규리(Nam Gyu Ri)_고백하는 거 맞아(I'm in love with you)","channel":"뮤직카우","channelId":"UCWMPzEshTKfeQZKFRxyX8_w","duration":247,"kind":"live","embedAllowed":true,"played":false,"checkedOn":"2026-11-02"},{"videoId":"Mjl8tBDX5Ik","title":"[Special Clip] 남규리(Nam Gyu Ri)_고백하는 거 맞아(I'm in love with you)","channel":"뮤직카우","channelId":"UCWMPzEshTKfeQZKFRxyX8_w","duration":249,"kind":"official","embedAllowed":true,"played":false,"checkedOn":"2026-11-02"}],"solo-solo-06MOxzzMPvI":[{"videoId":"njcupKAaiLM","title":"[LIVE] 씨야 남규리(Nam Gyu Ri) - 우리 사랑 그런 거 해요 Part.1 | 12시엔 주현영","channel":"SBS Radio 에라오","channelId":"UCAmff0euQRf6RwVlbB8PLMw","duration":204,"kind":"broadcast","embedAllowed":true,"played":false,"checkedOn":"2026-11-02"},{"videoId":"06MOxzzMPvI","title":"남규리 - 우리 사랑 그런 거 해요 Part.1 Official MV","channel":"남규리 Nam Gyu Ri","channelId":"UCNbU5_rEMwaqy6PSXS1wiBA","duration":210,"kind":"official","embedAllowed":true,"played":false,"checkedOn":"2026-11-02"}],"solo-solo-DFBk5oSn72Y":[{"videoId":"YMRvsqIF7QM","title":"남규리 - 우리 사랑 그런 거 해요 Part.2 (feat. KoN)ㅣ#케이팝업차트쇼 24회 #KPopUpChartShow #클립 ENA260929","channel":"ENA K-POP","channelId":"UCFpfKdO4MMSc9ZoMjk2Tikg","duration":241,"kind":"broadcast","embedAllowed":true,"played":false,"checkedOn":"2026-11-02"},{"videoId":"DFBk5oSn72Y","title":"남규리 - 우리 사랑 그런 거 해요 Part.2 (feat.KoN) Official MV","channel":"남규리 Nam Gyu Ri","channelId":"UCNbU5_rEMwaqy6PSXS1wiBA","duration":240,"kind":"official","embedAllowed":true,"played":false,"checkedOn":"2026-11-02"}],"solo-solo-8UAxgcnvk2E":[{"videoId":"mNbm_SAKk_E","title":"[SBS]최화정의파워타임,잊었니, 김연지 라이브","channel":"SBS Radio 에라오","channelId":"UCAmff0euQRf6RwVlbB8PLMw","duration":190,"kind":"broadcast","embedAllowed":true,"played":false,"checkedOn":"2026-11-02"},{"videoId":"8UAxgcnvk2E","title":"[M/V] 잊었니(Forgot) - 김연지(KIMYEONJI)","channel":"SUPER SOUND Bugs!","channelId":"UC9PVYlrwFSlqG7w8TDsqRvQ","duration":220,"kind":"official","embedAllowed":true,"played":false,"checkedOn":"2026-11-02"}],"solo-solo-lOvBRahMvtQ":[{"videoId":"lOvBRahMvtQ","title":"김연지 - 바람이 불면 [유희열의 스케치북/You Heeyeol's Sketchbook] 20200306","channel":"KBS Kpop","channelId":"UCeLPm9yH_a_QH8n6445G-Ow","duration":252,"kind":"broadcast","embedAllowed":true,"played":false,"checkedOn":"2026-11-02"}],"solo-solo-_FJkNLkV82U":[{"videoId":"_FJkNLkV82U","title":"[Live Clip] 내 맘(Mom) - 김연지 Official","channel":"김연지 Official","channelId":"UCjLZIdvRV7fQ3m_DA9NEkOg","duration":201,"kind":"live","embedAllowed":true,"played":false,"checkedOn":"2026-11-02"}],"solo-solo-JIpU0HXvc_E":[{"videoId":"JIpU0HXvc_E","title":"목소리를 되찾은 김연지의 진짜 이야기 | 김연지 (Kim Yeon Ji) - 노래ㅣ숲세권 라이브 (For:Rest LIVE)","channel":"숲세권 라이브 (For:Rest LIVE)","channelId":"UCEDGYiAk2qmg63pamdGMHSQ","duration":339,"kind":"live","embedAllowed":true,"played":false,"checkedOn":"2026-11-02"}],"solo-solo-Uko7Y-Tfj-8":[{"videoId":"Uko7Y-Tfj-8","title":"[Official] '김연지 - 당신은 천사와 커피를 마셔본 적이 있습니까' Special Clip (Full ver.)","channel":"TOON STUDIO","channelId":"UCve0b6qhfxTpKeqzZ4u0MjQ","duration":280,"kind":"official","embedAllowed":true,"played":false,"checkedOn":"2026-11-02"}],"solo-solo-arm2c6NH9vg":[{"videoId":"pI5rjwb-y2s","title":"[4K] 김연지(KIM YEON JI) “비가 오면 마음껏 울어도 되니까” Band LIVE Concert 노래방 18번 예약이요💘 [it’s KPOP LIVE 잇츠라이브]","channel":"it's Live","channelId":"UCB9e3pof1o83aa0kkaoeJGA","duration":285,"kind":"live","embedAllowed":true,"played":false,"checkedOn":"2026-11-02"},{"videoId":"arm2c6NH9vg","title":"[MV] KIM YEON JI(김연지) _ You can cry when it rains(비가 오면 마음껏 울어도 되니까)","channel":"1theK (원더케이)","channelId":"UCweOkPb1wVVH0Q0Tlj4a5Pw","duration":197,"kind":"official","embedAllowed":true,"played":false,"checkedOn":"2026-11-02"}],"solo-solo-gwRkvYc59_s":[{"videoId":"Xm5Oma6TVTE","title":"김연지 – 사랑의 인사 (원곡 : 씨야) | 피크닉라이브 소풍 | EP.134","channel":"ALL THE K-POP","channelId":"UCPde4guD9yFBRzkxk2PatoA","duration":247,"kind":"broadcast","embedAllowed":true,"played":false,"checkedOn":"2026-11-02"},{"videoId":"gwRkvYc59_s","title":"[Live Clip] 사랑의인사 - 김연지","channel":"김연지 Official","channelId":"UCjLZIdvRV7fQ3m_DA9NEkOg","duration":254,"kind":"live","embedAllowed":true,"played":false,"checkedOn":"2026-11-02"}],"solo-solo-atp-TU4Xezs":[{"videoId":"atp-TU4Xezs","title":"[Live Clip] 가슴으로운다 - 김연지","channel":"김연지 Official","channelId":"UCjLZIdvRV7fQ3m_DA9NEkOg","duration":206,"kind":"live","embedAllowed":true,"played":false,"checkedOn":"2026-11-02"}],"solo-solo-8k-YrZ5Gg2g":[{"videoId":"8k-YrZ5Gg2g","title":"[Live Clip] 빨간풍선 (빨간풍선ost) - 김연지","channel":"김연지 Official","channelId":"UCjLZIdvRV7fQ3m_DA9NEkOg","duration":231,"kind":"live","embedAllowed":true,"played":false,"checkedOn":"2026-11-02"}],"solo-solo-7h3ndp05JN0":[{"videoId":"NRhYAttexQ0","title":"[Live] Whisky on the Rock _ 김연지 [임백천의 백뮤직] | KBS 220817 방송","channel":"KBS KONG","channelId":"UC4GVSWFx-E6At_bnRIUmP4A","duration":304,"kind":"broadcast","embedAllowed":true,"played":false,"checkedOn":"2026-11-02"},{"videoId":"7h3ndp05JN0","title":"[MV] 김연지(Kim Yeon-Ji) - Whisky on the Rock | 우리들의 블루스(Our Blues) OST Part 1","channel":"냠냠엔터테인먼트 YAMYAM ENTERTAINMENT","channelId":"UCx_IoWPI_v4jI230YSvAHWQ","duration":307,"kind":"official","embedAllowed":true,"played":false,"checkedOn":"2026-11-02"}],"solo-solo-_lTZCnkpoyQ":[{"videoId":"_lTZCnkpoyQ","title":"[MV] Kim Yeon Ji(김연지) _ 10 years without you…(10년이나 버티니)","channel":"1theK (원더케이)","channelId":"UCweOkPb1wVVH0Q0Tlj4a5Pw","duration":209,"kind":"official","embedAllowed":true,"played":false,"checkedOn":"2026-11-02"}],"solo-solo-PHQbDyffSTw":[{"videoId":"PHQbDyffSTw","title":"[MV] 김연지 \"군주 - 가면의 주인 OST Part.5\" (Ruler: Master Of The Mask OST Part 5) - 계절사이 (Between Seasons)","channel":"DanalEntertainment","channelId":"UCpmctTnUfbeoycGhieZQAmw","duration":275,"kind":"official","embedAllowed":true,"played":false,"checkedOn":"2026-11-02"}],"solo-solo-6yrrTYk4sMs":[{"videoId":"6yrrTYk4sMs","title":"[RBW 아티스트 다이어리 시즌2] 김연지 '너만 있으면 다였는데' Live","channel":"RainbowbridgeWorld (RBW Inc.)","channelId":"UC4Rt2GpPPCr6IEhm1Jt967A","duration":280,"kind":"live","embedAllowed":true,"played":false,"checkedOn":"2026-11-02"}],"solo-solo-ppe9vyChKLs":[{"videoId":"H_U4HugKNK8","title":"★신곡★ '흩어지는 중' - 이보람 (Lee Boram) ▷Live clip◁ / [보람씨야]","channel":"보람씨야","channelId":"UCz11CPccQ2AnizJrdp58Bog","duration":171,"kind":"live","embedAllowed":true,"played":false,"checkedOn":"2026-11-02"},{"videoId":"ppe9vyChKLs","title":"[Full ver.] 흩어지는 중 (음원ver.) - 이보람 (Lee Boram) / [보람씨야]","channel":"보람씨야","channelId":"UCz11CPccQ2AnizJrdp58Bog","duration":252,"kind":"official","embedAllowed":true,"played":false,"checkedOn":"2026-11-02"}],"solo-solo-2WyOq7IMEnc":[{"videoId":"zWTxdwT2Gqo","title":"이보람 - 처음 그 자리에 (드라마 ＜풀하우스＞ OST) [더 시즌즈-성시경의 고막남친] | KBS 260529 방송","channel":"KBS Kpop","channelId":"UCeLPm9yH_a_QH8n6445G-Ow","duration":45,"kind":"broadcast","embedAllowed":true,"played":false,"checkedOn":"2026-11-02"},{"videoId":"2WyOq7IMEnc","title":"처음 그 자리에","channel":"leeboram - Topic","channelId":"UCO_OtqR33fYqev4XIZ69jvQ","duration":233,"kind":"official","embedAllowed":true,"played":false,"checkedOn":"2026-11-02"}],"solo-solo-L5Cn7BpkEeQ":[{"videoId":"L5Cn7BpkEeQ","title":"FREAK (Korean Version)","channel":"leeboram - Topic","channelId":"UCO_OtqR33fYqev4XIZ69jvQ","duration":203,"kind":"official","embedAllowed":true,"played":false,"checkedOn":"2026-11-02"}],"solo-solo-yjvTqgRzcXY":[{"videoId":"gyzBkqs65xY","title":"[ALLIVE] 이보람 - 빛의 반대편에서 | #MBCRADIO #정오의희망곡김신영입니다 #이보람 #씨야 #빛의반대편에서 #라이브 #무대 | MBC 260804 방송","channel":"Mhz 므흐즈: MBC RADIO","channelId":"UCKNZsAeQXpvI-Mpoc0ZKhsA","duration":211,"kind":"broadcast","embedAllowed":true,"played":false,"checkedOn":"2026-11-02"},{"videoId":"yjvTqgRzcXY","title":"이보람 (씨야) Lee Boram - 빛의 반대편에서 Beyond the light Official M/V","channel":"GENIE MUSIC","channelId":"UCd-OrgPLrnQiQBcq19j5oEQ","duration":209,"kind":"official","embedAllowed":true,"played":false,"checkedOn":"2026-11-02"}],"solo-solo-7VGw30BGkyw":[{"videoId":"7VGw30BGkyw","title":"매일 이렇게 비가 내려 -이보람 (IONY의 오선지 : Project #01)","channel":"보람씨야","channelId":"UCz11CPccQ2AnizJrdp58Bog","duration":151,"kind":"official","embedAllowed":true,"played":false,"checkedOn":"2026-11-02"}],"solo-solo-pwdQrpNpFyA":[{"videoId":"pwdQrpNpFyA","title":"[OFFICIAL SPECIAL VIDEO] 이보람(Lee Bo-Ram) - 너를 사랑하니까(Love, Always) 녹음실 버전","channel":"냠냠엔터테인먼트 YAMYAM ENTERTAINMENT","channelId":"UCx_IoWPI_v4jI230YSvAHWQ","duration":187,"kind":"live","embedAllowed":true,"played":false,"checkedOn":"2026-11-02"}],"solo-solo-oukYixC1ldo":[{"videoId":"_y5Pbme0BBo","title":"한계라고 느껴질 때... 이보람(Lee Boram)이 전하는 마음 '형 (兄)'♬｜비긴어게인 오픈마이크","channel":"Beginagain 비긴어게인","channelId":"UC8WoHUeN-eLynnLKGkwajYQ","duration":401,"kind":"broadcast","embedAllowed":true,"played":false,"checkedOn":"2026-11-02"},{"videoId":"oukYixC1ldo","title":"[최초 공개] 이보람 (씨야) - 형 (兄) Special Clip #이보람 #형","channel":"방구석 캐스팅","channelId":"UCqxtYw8SCaYFNQmCdjnvZrw","duration":250,"kind":"official","embedAllowed":true,"played":false,"checkedOn":"2026-11-02"}],"solo-solo-c6MlQvbbZw0":[{"videoId":"7sgBNEHjpZ0","title":"[OFFICIAL SPECIAL VIDEO] 이보람(Lee Bo-Ram) - 한 밤의 꿈처럼(Dream) 실외라이브","channel":"냠냠엔터테인먼트 YAMYAM ENTERTAINMENT","channelId":"UCx_IoWPI_v4jI230YSvAHWQ","duration":191,"kind":"live","embedAllowed":true,"played":false,"checkedOn":"2026-11-02"},{"videoId":"c6MlQvbbZw0","title":"이보람 (LEE BORAM) (씨야 (SeeYa)) - 한 밤의 꿈처럼 (Dream) MV","channel":"STONE MUSIC","channelId":"UC_pwIXKXNm5KGhdEVzmY60A","duration":189,"kind":"official","embedAllowed":true,"played":false,"checkedOn":"2026-11-02"}],"solo-solo-q4jtpVDemFE":[{"videoId":"BLALkFyMUOk","title":"[풀버전] 가로라이브 '이보람 - 사랑하니까'","channel":"보람씨야","channelId":"UCz11CPccQ2AnizJrdp58Bog","duration":220,"kind":"live","embedAllowed":true,"played":false,"checkedOn":"2026-11-02"},{"videoId":"q4jtpVDemFE","title":"[뮤비] 이보람 - 사랑하니까","channel":"보람씨야","channelId":"UCz11CPccQ2AnizJrdp58Bog","duration":223,"kind":"official","embedAllowed":true,"played":false,"checkedOn":"2026-11-02"}],"solo-solo-DujKGd4aA60":[{"videoId":"DujKGd4aA60","title":"▶Live clip◀ 이렇게 좋은 날 - 이보람 (Lee Boram) / [보람씨야]","channel":"보람씨야","channelId":"UCz11CPccQ2AnizJrdp58Bog","duration":184,"kind":"live","embedAllowed":true,"played":false,"checkedOn":"2026-11-02"}]},"vcr":[{"videoId":"rrMkSeKS4eM","title":"[(주)씨야엔터] 괴성과 고함이 난무한 씨야엔터 굿즈 아이템 회의?! 🐷⏰️👕","channel":"SEEYA Official","channelId":"UCn6SB-9q1gNfGhx9_fFxIxg","duration":113,"published":"2026-10-16","embedAllowed":true,"checkedOn":"2026-11-02","played":true},{"videoId":"Ip9XvKCeEkA","title":"[대구콘서트 스케치] 모두들 풍성한 한가위 보내시고 곧 고양에서 만나요! 🌕🩷","channel":"SEEYA Official","channelId":"UCn6SB-9q1gNfGhx9_fFxIxg","duration":291,"published":"2026-09-25","embedAllowed":true,"checkedOn":"2026-11-02","played":true},{"videoId":"6mik2QfyVCY","title":"EP.68 길고양이 겨울집 만들어주기!(feat. 방산시장 & 다이소) 남규리 소장님의 셀프 시공기 😺♥️🏠","channel":"남규리의 귤멍","channelId":"UC_naRJKw5Isgpv5nF8yNXLw","duration":822,"published":"2026-10-25","embedAllowed":true,"checkedOn":"2026-11-02","played":true},{"videoId":"PzdIJOVqS7I","title":"EP.67 남규리 ASMR 도전! 자연의 소리로 같이 힐링해요 🌳🍃🌞","channel":"남규리의 귤멍","channelId":"UC_naRJKw5Isgpv5nF8yNXLw","duration":1012,"published":"2026-10-18","embedAllowed":true,"checkedOn":"2026-11-02","played":true},{"videoId":"e2-TRuJUoVM","title":"[보람씨야] 조카네 집에 놀러 왔어요! 👶🏻 | 일상 브이로그 VLOG","channel":"보람씨야","channelId":"UCz11CPccQ2AnizJrdp58Bog","duration":448,"published":"2026-10-28","embedAllowed":true,"checkedOn":"2026-11-02","played":true},{"videoId":"-ahH0aTmUDY","title":"[보람씨야] 간만에 친구들이랑 성수 나들이 ☕️ | 일상 브이로그 VLOG","channel":"보람씨야","channelId":"UCz11CPccQ2AnizJrdp58Bog","duration":607,"published":"2026-10-21","embedAllowed":true,"checkedOn":"2026-11-02","played":true},{"videoId":"vScm0bPIGG8","title":"난생 처음 성대 수술하는 20년 차 가수의 슬기로운 '수술' 브이로그 .!","channel":"김연지 Official","channelId":"UCjLZIdvRV7fQ3m_DA9NEkOg","duration":536,"published":"2025-05-13","embedAllowed":true,"checkedOn":"2026-11-02","played":true},{"videoId":"r99O8h-lY40","title":"[VLOG] 김연지, 불후의 명곡 레전드 도전💛 | 왕중왕전 브이로그👑 (feat. DK 오빠) #잊지말아요","channel":"김연지 Official","channelId":"UCjLZIdvRV7fQ3m_DA9NEkOg","duration":1837,"published":"2025-04-29","embedAllowed":true,"checkedOn":"2026-11-02","played":true},{"videoId":"JvCo9GItLaE","title":"씨야의 리즈시절은 지금! 🤣","channelId":"UCn6SB-9q1gNfGhx9_fFxIxg","channel":"SEEYA Official","duration":60},{"videoId":"V3VvyytAW1U","title":"📢 씨야 전국투어 콘서트 예매는 티켓링크와 Yes24에서! #씨야 #남규리 #김연지 #이보람","channelId":"UCn6SB-9q1gNfGhx9_fFxIxg","channel":"SEEYA Official","duration":72},{"videoId":"frBg_RzSfd0","title":"📢 씨야 전국투어 콘서트 예매는 티켓링크와 Yes24에서! #씨야 #남규리 #김연지 #이보람","channelId":"UCn6SB-9q1gNfGhx9_fFxIxg","channel":"SEEYA Official","duration":83},{"videoId":"GaY5Hi4O9xM","title":"📢 씨야 전국투어 콘서트 예매는 티켓링크와 Yes24에서! #씨야 #남규리 #김연지 #이보람","channelId":"UCn6SB-9q1gNfGhx9_fFxIxg","channel":"SEEYA Official","duration":60},{"videoId":"Fc0AFR1Mguo","title":"🎉 씨야 20주년 전국투어 콘서트 합니다 🎉 티켓 예매는 Yes24에서 🩷","channelId":"UCn6SB-9q1gNfGhx9_fFxIxg","channel":"SEEYA Official","duration":60},{"videoId":"vsoslE-hZvA","title":"#테이 선배님의 #씨야 의 #stay 뺏기에 성공하셨습니다 🎵","channelId":"UCn6SB-9q1gNfGhx9_fFxIxg","channel":"SEEYA Official"},{"videoId":"hG8wvCu--4I","title":"#피프티피프티 #예원 #아테나 후배님들과 오늘도 귀여움 \"Stay\" 🩷 @WE_FIFTYFIFTY  #FIFTYFIFTY #YEWON #ATHENA#남규리 #STAY","channelId":"UCn6SB-9q1gNfGhx9_fFxIxg","channel":"SEEYA Official"},{"videoId":"MUx5pquM6gk","title":"보이넥스트도어@BOYNEXTDOOR 성호 후배님과 \"Stay\" 하고싶은 분? 🫢 #BOYNEXTDOOR #성호#씨야 #남규리 #STAY","channelId":"UCn6SB-9q1gNfGhx9_fFxIxg","channel":"SEEYA Official","duration":24},{"videoId":"oizr5swPErA","title":"뭔진 잘 모르겠지만 유행이래요 🫪 콘서트 홍보를 위해 열심히 챌린지 공부 중","channelId":"UCn6SB-9q1gNfGhx9_fFxIxg","channel":"SEEYA Official","duration":15},{"videoId":"n-QfT6M-5e4","title":"라이즈(@RIIZE) 은석 후배님과 음중에서 \"Stay\"✨️ #RIIZE #라이즈#EUNSEOK #은석#SEEYA #씨야 #남규리#STAY #스테이","channelId":"UCn6SB-9q1gNfGhx9_fFxIxg","channel":"SEEYA Official","duration":22},{"videoId":"7RFH_IzUWU0","title":"계속 함께 \"Stay\"하고 싶은 스테이씨 세은 후배님과🩷 @STAYC #STAYC #세은 #씨야 #남규리 #stay","channelId":"UCn6SB-9q1gNfGhx9_fFxIxg","channel":"SEEYA Official","duration":23},{"videoId":"RzKQByBoX6o","title":"스테이씨@STAYC 후배님들! 같이 놀아줘서 고마워요🩷 #STAYC #스테이씨 #시은 #아이사 #재이#씨야 #남규리","channelId":"UCn6SB-9q1gNfGhx9_fFxIxg","channel":"SEEYA Official","duration":22},{"videoId":"y-4OHMWz2-E","title":"오늘은 씨야 대구 콘서트 티켓 오픈날 🫣","channelId":"UCn6SB-9q1gNfGhx9_fFxIxg","channel":"SEEYA Official"},{"videoId":"8c0DhTuDeD8","title":"씨야 전국 투어 콘서트를 위해 E로 개조(?) 중! #씨야 #남규리 #김연지 #이보람","channelId":"UCn6SB-9q1gNfGhx9_fFxIxg","channel":"SEEYA Official","duration":19},{"videoId":"cGVGqZpHIx4","title":"씨야 20주년 콘서트 The Fan에서 만나요 👋 Yes24에서 예매하기! 🫣#씨야 #남규리 #김연지 #이보람 #콘서트","channelId":"UCn6SB-9q1gNfGhx9_fFxIxg","channel":"SEEYA Official","duration":11},{"videoId":"4wZpr4oSygM","title":"2026년 9월 5일, 씨야 부산 갑니다! 지금 Yes24로 고고 🩷","channelId":"UCn6SB-9q1gNfGhx9_fFxIxg","channel":"SEEYA Official","duration":59},{"videoId":"Xr4Z_WbAeAE","title":"여러분들의 많은 사랑과 관심 하나도 빠짐없이 마음에 담을게요! 감사하고 사랑합니다 🩷 -씨야 올림 #씨야 #남규리 #김연지 #이보람","channelId":"UCn6SB-9q1gNfGhx9_fFxIxg","channel":"SEEYA Official","duration":52},{"videoId":"e7YLmydYRqc","title":"2026.05.14 6PM 씨야 정규앨범 [First, Again] D-1 #씨야 #남규리 #김연지 #이보람","channelId":"UCn6SB-9q1gNfGhx9_fFxIxg","channel":"SEEYA Official","duration":47},{"videoId":"lG5qlYP93Qk","title":"2026.05.14 6PM 씨야 정규앨범 [First, Again] D-2 #씨야 #남규리 #김연지 #이보람","channelId":"UCn6SB-9q1gNfGhx9_fFxIxg","channel":"SEEYA Official","duration":60},{"videoId":"Jt8whrpLmyg","title":"2026.05.14 6PM 씨야 정규앨범 [First, Again] D-3 #씨야 #남규리 #김연지 #이보람","channelId":"UCn6SB-9q1gNfGhx9_fFxIxg","channel":"SEEYA Official","duration":43},{"videoId":"EvdD3pMkxTM","title":"2026.05.14 6PM 씨야 정규앨범 [First, Again] D-4 #씨야 #남규리 #김연지 #이보람","channelId":"UCn6SB-9q1gNfGhx9_fFxIxg","channel":"SEEYA Official","duration":44},{"videoId":"kWlQgOXZ0jM","title":"2026.05.14 6PM 씨야 정규앨범 [First, Again] D-5 #씨야 #남규리 #김연지 #이보람","channelId":"UCn6SB-9q1gNfGhx9_fFxIxg","channel":"SEEYA Official","duration":50},{"videoId":"f2xHyZJHheM","title":"2026.05.14 6PM 씨야 정규앨범 [First, Again] D-6 #씨야 #남규리 #김연지 #이보람","channelId":"UCn6SB-9q1gNfGhx9_fFxIxg","channel":"SEEYA Official","duration":28},{"videoId":"9pI-ACDbMVw","title":"2026.05.14 6PM 씨야 정규앨범 [First, Again] D-7 #씨야 #남규리 #김연지 #이보람","channelId":"UCn6SB-9q1gNfGhx9_fFxIxg","channel":"SEEYA Official","duration":27},{"videoId":"aq5Kynr1sAA","title":"2026.05.14 6PM 씨야 정규앨범 [First, Again] D-8 #씨야 #남규리 #김연지 #이보람","channelId":"UCn6SB-9q1gNfGhx9_fFxIxg","channel":"SEEYA Official","duration":60},{"videoId":"IMgKVlFZv2o","title":"2026.05.14 6PM 씨야 정규앨범 [First, Again] D-9 #씨야 #남규리 #김연지 #이보람","channelId":"UCn6SB-9q1gNfGhx9_fFxIxg","channel":"SEEYA Official","duration":60},{"videoId":"-WsgsQkVzJI","title":"2026.05.14 6PM SEEYA Special Album [First, Again] 🎵 #씨야 #SEEYA #남규리 #김연지 #이보람","channelId":"UCn6SB-9q1gNfGhx9_fFxIxg","channel":"SEEYA Official","duration":31},{"videoId":"QOxBzlWPFlc","title":"#남규리 의 사랑의 인사 2026 with #김연지 ❤ 무해한 조합 🤣","channelId":"UCn6SB-9q1gNfGhx9_fFxIxg","channel":"SEEYA Official","duration":44},{"videoId":"ZR1v0Zau09A","title":"#남규리 님이 #김연지 님의 #구두 노래뺏기에 도전하셨습니다 👠 과연 그 결과는?!","channelId":"UCn6SB-9q1gNfGhx9_fFxIxg","channel":"SEEYA Official","duration":66},{"videoId":"Pzl9mpZ-f5Y","title":"챌린지 뚝딱이들의 '그럼에도 우린' LIVE Ver. 많관사부 💗 #씨야 #남규리 #김연지 #이보람 #허각 #그럼에도우린","channelId":"UCn6SB-9q1gNfGhx9_fFxIxg","channel":"SEEYA Official","excludeFromVcr":true},{"videoId":"mv7LonElRgQ","title":"씨야 남규리 - 그럼에도 우린 LIVE Ver. 🎤 많관사부 💗 @Gyulmung","channelId":"UCn6SB-9q1gNfGhx9_fFxIxg","channel":"SEEYA Official","excludeFromVcr":true},{"videoId":"W3JI-zs9aEg","title":"씨야 김연지 - 그럼에도 우린 LIVE Ver. 🎤 많관사부 💗 @Official-eu4ex","channelId":"UCn6SB-9q1gNfGhx9_fFxIxg","channel":"SEEYA Official","excludeFromVcr":true},{"videoId":"Nzub6TrI8DU","title":"씨야 이보람 - 그럼에도 우린 LIVE Ver. 🎤 많관사부 💗 @BoramSEEYA","channelId":"UCn6SB-9q1gNfGhx9_fFxIxg","channel":"SEEYA Official","excludeFromVcr":true},{"videoId":"rSneZtiwVsc","title":"씨야 SEEYA '그럼에도 우린' Teaser 규리 ver.","channelId":"UCn6SB-9q1gNfGhx9_fFxIxg","channel":"SEEYA Official"},{"videoId":"3PlZg9_iTh8","title":"씨야 SEEYA '그럼에도 우린' Teaser 연지 ver.","channelId":"UCn6SB-9q1gNfGhx9_fFxIxg","channel":"SEEYA Official","duration":60},{"videoId":"pCU5V_4VyRM","title":"씨야 SEEYA '그럼에도 우린' Teaser 보람 ver.","channelId":"UCn6SB-9q1gNfGhx9_fFxIxg","channel":"SEEYA Official"},{"videoId":"Xfy-v6uFwqQ","title":"10월에 씨야 전국투어콘서트에서 만나요!","channelId":"UCn6SB-9q1gNfGhx9_fFxIxg","channel":"SEEYA Official","duration":94},{"videoId":"b7NzrBXnWnI","title":"씨야 전국투어콘서트 10월엔 더 즐거울 걸요? 🤣","channelId":"UCn6SB-9q1gNfGhx9_fFxIxg","channel":"SEEYA Official","duration":79},{"videoId":"7RA6GClaMgU","title":"씨야 전국투어 콘서트 [The Fan]은 계속 됩니다!","channelId":"UCn6SB-9q1gNfGhx9_fFxIxg","channel":"SEEYA Official","duration":94},{"videoId":"M-eCxfaBBoA","title":"씨야 전국투어 콘서트 [The Fan] 이젠 부산으로 갑니다!","channelId":"UCn6SB-9q1gNfGhx9_fFxIxg","channel":"SEEYA Official","duration":79},{"videoId":"n_n5s6i_diE","title":"씨야 -  Stay 응원법 (Fanchant Guide)","channelId":"UCn6SB-9q1gNfGhx9_fFxIxg","channel":"SEEYA Official"},{"videoId":"_CGekO1IRGc","title":"씨야 SEEYA - I Believe Official MV","channelId":"UCn6SB-9q1gNfGhx9_fFxIxg","channel":"SEEYA Official","duration":260},{"videoId":"OfaMxNJlD_I","title":"씨야 SEEYA - 우리 Live Ver. Official MV","channelId":"UCn6SB-9q1gNfGhx9_fFxIxg","channel":"SEEYA Official","excludeFromVcr":true},{"videoId":"JeNLPdkh6FM","title":"씨야 SEEYA - 봄처럼 그댄 Official MV","channelId":"UCn6SB-9q1gNfGhx9_fFxIxg","channel":"SEEYA Official","duration":267},{"videoId":"I1zhkwIuZ0A","title":"씨야 SEEYA - Stay Official MV (SEEYA Ver.)","channelId":"UCn6SB-9q1gNfGhx9_fFxIxg","channel":"SEEYA Official","duration":202},{"videoId":"RMNcT5AqLGA","title":"씨야 SEEYA - Stay Official MV","channelId":"UCn6SB-9q1gNfGhx9_fFxIxg","channel":"SEEYA Official","duration":229},{"videoId":"GsoQyLvtqi4","title":"[씨야 SEEYA - Stay] Teaser 03","channelId":"UCn6SB-9q1gNfGhx9_fFxIxg","channel":"SEEYA Official","duration":76},{"videoId":"l9kscOVD9UA","title":"[씨야 SEEYA - Stay] Teaser 02","channelId":"UCn6SB-9q1gNfGhx9_fFxIxg","channel":"SEEYA Official"},{"videoId":"fUMtb3QZMU0","title":"[씨야 SEEYA - Stay] Teaser 01","channelId":"UCn6SB-9q1gNfGhx9_fFxIxg","channel":"SEEYA Official","duration":65},{"videoId":"qqvOlrAx4p4","title":"[비하인드 클립] Nice to See You Again!","channelId":"UCn6SB-9q1gNfGhx9_fFxIxg","channel":"SEEYA Official"},{"videoId":"dmsw-tEenZ0","title":"씨야 SEEYA - 그럼에도 우린 Official MV","channelId":"UCn6SB-9q1gNfGhx9_fFxIxg","channel":"SEEYA Official","duration":222},{"videoId":"7JUhMkPNIXU","title":"씨야 SEEYA '그럼에도 우린' MV Teaser","channelId":"UCn6SB-9q1gNfGhx9_fFxIxg","channel":"SEEYA Official","duration":42},{"videoId":"iEK5HhRNzoQ","title":"씨야 SEEYA '그럼에도 우린' Teaser","channelId":"UCn6SB-9q1gNfGhx9_fFxIxg","channel":"SEEYA Official","duration":39},{"videoId":"TfdmlPWnEkQ","title":"보고만 있어도 미소 지어지는 치즈 냥이네 😺","channelId":"UC_naRJKw5Isgpv5nF8yNXLw","channel":"남규리의 귤멍","duration":28},{"videoId":"QleGsEuPEDA","title":"온 세상이 귀여워 🥰","channelId":"UC_naRJKw5Isgpv5nF8yNXLw","channel":"남규리의 귤멍","duration":56},{"videoId":"5IGU9JCcVUs","title":"한강공원의 소리를 찾아서...!  #남규리 #asmr #한강공원","channelId":"UC_naRJKw5Isgpv5nF8yNXLw","channel":"남규리의 귤멍","duration":59},{"videoId":"4CD3d5uGZjU","title":"편집자는 소리가 잘 안들려서 안경을 썼습니다...? 🤓 #남규리 #귤멍 #ASMR","channelId":"UC_naRJKw5Isgpv5nF8yNXLw","channel":"남규리의 귤멍","duration":58},{"videoId":"rSforGsXP7A","title":"ASMR 재밌네요 🤣 #남규리 #귤멍 #ASMR","channelId":"UC_naRJKw5Isgpv5nF8yNXLw","channel":"남규리의 귤멍"},{"videoId":"qtEsRUrIjZg","title":"우리 사랑 그런 거 해요 콘서트 Ver.🎤🎵 (feat. 씨야 전국투어콘서트)","channelId":"UC_naRJKw5Isgpv5nF8yNXLw","channel":"남규리의 귤멍","duration":132},{"videoId":"4SwCN_toeKk","title":"역시 락발라드하면 허각 @singer.huhgak ! 노래 뺏긴 것 같은데 어쩌죠? 🤣 #남규리 #우사그 #허각","channelId":"UC_naRJKw5Isgpv5nF8yNXLw","channel":"남규리의 귤멍","duration":33},{"videoId":"Iw4Iitj0PsI","title":"우사그 Part.1과 Part.2 가사로 드라마 한 편 탄생 🫪🩷","channelId":"UC_naRJKw5Isgpv5nF8yNXLw","channel":"남규리의 귤멍","duration":53},{"videoId":"zgPmcyfCtds","title":"노래도 잘하고 너무 착하신 #황가람 후배님과 사랑의 인사를 전합니다 ☺️ #남규리 #사랑의인사2026","channelId":"UC_naRJKw5Isgpv5nF8yNXLw","channel":"남규리의 귤멍"},{"videoId":"fZRczmoAggc","title":"원하고 또 원하고 있는데~~~~~~ 경환님 함께해주셔서 감사합니다☺️ #허경환 #남규리 #사랑의인사2026","channelId":"UC_naRJKw5Isgpv5nF8yNXLw","channel":"남규리의 귤멍","duration":51},{"videoId":"eZLx6be0Drw","title":"내겐 그대가 하나뿐이라 다른 사랑 못할 것 같아요🎵 #이세영 #남규리 #사랑의인사2026 #많관사부 🩷","channelId":"UC_naRJKw5Isgpv5nF8yNXLw","channel":"남규리의 귤멍","duration":43},{"videoId":"XwL35GMb_bM","title":"사랑의 인사 2026 with 김용준 🎵 #남규리 #김용준 #씨야 #SG워너비","channelId":"UC_naRJKw5Isgpv5nF8yNXLw","channel":"남규리의 귤멍","duration":49},{"videoId":"2Lt0UKzVuy8","title":"산에서 뛰지 맙시다 🫠","channelId":"UC_naRJKw5Isgpv5nF8yNXLw","channel":"남규리의 귤멍","duration":42},{"videoId":"-DwR0EqHGfA","title":"드라마 인간시장 대본 리딩 현장 👀 배우 남규리의 역할은?!","channelId":"UC_naRJKw5Isgpv5nF8yNXLw","channel":"남규리의 귤멍","duration":26},{"videoId":"gSe6LziFH1M","title":"🍊🐷 듣자마자 군침이 도는 삼겹살송 🎵","channelId":"UC_naRJKw5Isgpv5nF8yNXLw","channel":"남규리의 귤멍","duration":36},{"videoId":"Puc1uh7yuso","title":"새해 복 많이 받으시고 행복한 설 연휴 보내세요🍊⭐️🧡","channelId":"UC_naRJKw5Isgpv5nF8yNXLw","channel":"남규리의 귤멍","duration":83},{"videoId":"3gIhIZWe2ns","title":"🍊 vs 🤖 남규리의 새로운 친구(?)를 소개합니다","channelId":"UC_naRJKw5Isgpv5nF8yNXLw","channel":"남규리의 귤멍","duration":29},{"videoId":"YNCslwKHw5c","title":"🍊 + 🍓 + 🍫 남규리의 딸기 두쫀쿠 만들기","channelId":"UC_naRJKw5Isgpv5nF8yNXLw","channel":"남규리의 귤멍","duration":48},{"videoId":"WEjtFPR2xJY","title":"🍊한테 🍫 #두쫀쿠 사줄 사람~? 😁","channelId":"UC_naRJKw5Isgpv5nF8yNXLw","channel":"남규리의 귤멍","duration":27},{"videoId":"fPQIwFYPHzU","title":"🍊 남규리의 #홍콩여행 은 계속 됩니다 #귤멍 #남규리 #브이로그","channelId":"UC_naRJKw5Isgpv5nF8yNXLw","channel":"남규리의 귤멍","duration":36},{"videoId":"BC6vq6QzTDc","title":"🍊 in #홍콩 ! 혼자서 홍콩은 처음이라서 😂 #홍콩여행 과연 무사히 마쳤을까요?","channelId":"UC_naRJKw5Isgpv5nF8yNXLw","channel":"남규리의 귤멍","duration":29},{"videoId":"OaX7K0TN-Hc","title":"🍊 남규리, 식당 오픈한다?! 남셰프의 요리실력을 #귤멍 에서 확인하세요 🙃","channelId":"UC_naRJKw5Isgpv5nF8yNXLw","channel":"남규리의 귤멍","duration":32},{"videoId":"N8KUIHIftsw","title":"🍊 ☕️ 마시고 마시고 또 마시고! 배가 터질 뻔 했던 #강릉여행 ! 같이 #커피 한 잔 하실래요? 😂","channelId":"UC_naRJKw5Isgpv5nF8yNXLw","channel":"남규리의 귤멍","duration":33},{"videoId":"4vJecNsnSZE","title":"남규리 X SLAY - 디셈버드림 (December Dream) Duet cover #남규리 #slay #decemberdream","channelId":"UC_naRJKw5Isgpv5nF8yNXLw","channel":"남규리의 귤멍","duration":54},{"videoId":"-M7IibL8pA0","title":"2026년 귤도 귤별이도 원하는 일 다 이루어져라 얍🍊 ⭐️🧡","channelId":"UC_naRJKw5Isgpv5nF8yNXLw","channel":"남규리의 귤멍","duration":34},{"videoId":"PsxQWhATlDA","title":"우리 귤별이들은 2026년 어떤 새해 소원을 빌었나요? 👀","channelId":"UC_naRJKw5Isgpv5nF8yNXLw","channel":"남규리의 귤멍","duration":39},{"videoId":"DMOnCJ3jm-s","title":"드디어 귤멍 구독자 애칭을 결정했습니다 🍊🧡","channelId":"UC_naRJKw5Isgpv5nF8yNXLw","channel":"남규리의 귤멍","duration":35},{"videoId":"B2pYJbvHvdo","title":"🍊 남규리 #DecemberDream 뮤비 촬영 현장","channelId":"UC_naRJKw5Isgpv5nF8yNXLw","channel":"남규리의 귤멍","duration":25},{"videoId":"qbAJITv_Hr8","title":"🍊's 신곡 디셈버드림(December Dream)이 12월 23일(화) 오후 6시 공개됩니다! 많은 관심 부탁드려요 🧡","channelId":"UC_naRJKw5Isgpv5nF8yNXLw","channel":"남규리의 귤멍"},{"videoId":"DRLD4c0fdkk","title":"2025 남규리 목소리로 듣는 #씨야 #결혼할까요","channelId":"UC_naRJKw5Isgpv5nF8yNXLw","channel":"남규리의 귤멍","duration":47},{"videoId":"2rLqObTrDMg","title":"다시 돌아온 🍊 휴게소 먹방!","channelId":"UC_naRJKw5Isgpv5nF8yNXLw","channel":"남규리의 귤멍","duration":49},{"videoId":"-bmaW-61dXw","title":"🍊 신곡이 12월 23일 발매됩니다 #남규리 #Decemberdream","channelId":"UC_naRJKw5Isgpv5nF8yNXLw","channel":"남규리의 귤멍","duration":46},{"videoId":"DICaD9bKqHM","title":"🍊 in 결혼식! 저의 오랜 팬을 만나러 광주까지 달려 갔습니다","channelId":"UC_naRJKw5Isgpv5nF8yNXLw","channel":"남규리의 귤멍","duration":25},{"videoId":"0q6OJpqYct8","title":"귤멍 내일 예고! 규리의 비밀 작전이 펼쳐집니다 🫣","channelId":"UC_naRJKw5Isgpv5nF8yNXLw","channel":"남규리의 귤멍","duration":32},{"videoId":"TGp-VQlYnrQ","title":"보부상st 🍊의 가방 속을 공개합니다 😬","channelId":"UC_naRJKw5Isgpv5nF8yNXLw","channel":"남규리의 귤멍","duration":31},{"videoId":"11kcsgcOzNY","title":"🍊 남규리 중국 출장 헤메코","channelId":"UC_naRJKw5Isgpv5nF8yNXLw","channel":"남규리의 귤멍","duration":41},{"videoId":"rIu9Fxw62bI","title":"🍊 집에 몰래(?) 온 손님은? 내일 #귤멍 에서 확인하세요 😬","channelId":"UC_naRJKw5Isgpv5nF8yNXLw","channel":"남규리의 귤멍"},{"videoId":"NQWde0xKsFk","title":"귤 & 멍 듀엣🎵 #그래도좋아해요","channelId":"UC_naRJKw5Isgpv5nF8yNXLw","channel":"남규리의 귤멍","duration":40},{"videoId":"jcob_oe-g64","title":"촬영장에 커피차 선물받았🍊🧡","channelId":"UC_naRJKw5Isgpv5nF8yNXLw","channel":"남규리의 귤멍","duration":17},{"videoId":"i-VpN290pyw","title":"드라마 촬영장 속 🍊은 어떤 모습일까요? #남규리 #배우 #비하인드","channelId":"UC_naRJKw5Isgpv5nF8yNXLw","channel":"남규리의 귤멍","duration":23},{"videoId":"XV_ub5fyEeY","title":"여러분은 #그래도좋아해요 뮤비 다 보셨죠? 😂","channelId":"UC_naRJKw5Isgpv5nF8yNXLw","channel":"남규리의 귤멍","duration":30},{"videoId":"HFqo3cRWePs","title":"유튜브 #먹방 꿈나무 🍊 입니다 🧡","channelId":"UC_naRJKw5Isgpv5nF8yNXLw","channel":"남규리의 귤멍","duration":29},{"videoId":"3KIo5Dgl1z8","title":"🍊도 가끔 빡친답니다...!","channelId":"UC_naRJKw5Isgpv5nF8yNXLw","channel":"남규리의 귤멍","duration":28},{"videoId":"xycH73F9D0A","title":"배우 남규리의 연기 열정 뿜뿜 😬🍊","channelId":"UC_naRJKw5Isgpv5nF8yNXLw","channel":"남규리의 귤멍"},{"videoId":"vC6Ct8n-TC0","title":"웃기는 동생 자월이와 함께한 떡볶이 투어, 함께 보실래요? ☺️","channelId":"UC_naRJKw5Isgpv5nF8yNXLw","channel":"남규리의 귤멍"},{"videoId":"svM4V9SErN0","title":"🍊 오아시스 내한 공연 다녀왔어요 #남규리 #오아시스","channelId":"UC_naRJKw5Isgpv5nF8yNXLw","channel":"남규리의 귤멍","duration":67},{"videoId":"eiw5_ayqGng","title":"🍊🐬🍀 여러분에게도 행운이 함께하길 바라며!","channelId":"UC_naRJKw5Isgpv5nF8yNXLw","channel":"남규리의 귤멍","duration":69},{"videoId":"Phr_VOLlb9k","title":"🍊's 드라이브! 아름다운 신창 해안도로 풍경을 담아왔어요 ☺️","channelId":"UC_naRJKw5Isgpv5nF8yNXLw","channel":"남규리의 귤멍","duration":66},{"videoId":"G5iqrE-FWrU","title":"매주 일요일 #남규리 의 귤멍타임이 찾아옵니다 🍊","channelId":"UC_naRJKw5Isgpv5nF8yNXLw","channel":"남규리의 귤멍","duration":25},{"videoId":"JV7GVJlA0EE","title":"남규리의 #힐링 #브이로그 지금 시작합니다 🍊","channelId":"UC_naRJKw5Isgpv5nF8yNXLw","channel":"남규리의 귤멍","duration":31},{"videoId":"Ajn6wJMUJx0","title":"🍊🥑🥪 아보카도 샌드위치 ASMR #남규리 #레시피","channelId":"UC_naRJKw5Isgpv5nF8yNXLw","channel":"남규리의 귤멍","duration":58},{"videoId":"--IHejqqjNA","title":"🍊🍫🍰 #남규리 의 #티라미수케이크 #레시피 ASMR","channelId":"UC_naRJKw5Isgpv5nF8yNXLw","channel":"남규리의 귤멍","duration":57},{"videoId":"_vSZqKP0Db8","title":"#남규리 작사 🎵 나만을 위해","channelId":"UC_naRJKw5Isgpv5nF8yNXLw","channel":"남규리의 귤멍","duration":68},{"videoId":"Ar15_1Zh78A","title":"혼자서도 잘 먹는 🍊 #먹방 #브이로그","channelId":"UC_naRJKw5Isgpv5nF8yNXLw","channel":"남규리의 귤멍","duration":74},{"videoId":"23mKW4zJxnI","title":"🍊 우리집에 부장님이 놀러오셨어요 😁","channelId":"UC_naRJKw5Isgpv5nF8yNXLw","channel":"남규리의 귤멍","duration":61},{"videoId":"g1kI0iiBy7U","title":"꿈같이 행복한 날들이 계속 되기를 🍊🧡","channelId":"UC_naRJKw5Isgpv5nF8yNXLw","channel":"남규리의 귤멍","duration":86},{"videoId":"M8K4FBtbNNU","title":"🍊 새로운 노래도 많이 기대해주세요^^","channelId":"UC_naRJKw5Isgpv5nF8yNXLw","channel":"남규리의 귤멍","duration":20},{"videoId":"jYT9uH7fLH8","title":"🍊 #남규리 #그래도좋아해요 곧 발매됩니다^^","channelId":"UC_naRJKw5Isgpv5nF8yNXLw","channel":"남규리의 귤멍","duration":20},{"videoId":"S_7mbxOfYHA","title":"🍊's 우당탕탕 #솔로캠핑 기록! 😬","channelId":"UC_naRJKw5Isgpv5nF8yNXLw","channel":"남규리의 귤멍","duration":48},{"videoId":"XsG6uiLceeY","title":"오직 귤멍🍊에서만 볼 수 있는 #허용별 #고민중독 LIVE (feat.소시지 마이크)","channelId":"UC_naRJKw5Isgpv5nF8yNXLw","channel":"남규리의 귤멍","excludeFromVcr":true},{"videoId":"aH34h0M2WPg","title":"여러분, 그래도 좋아해요 🧡","channelId":"UC_naRJKw5Isgpv5nF8yNXLw","channel":"남규리의 귤멍","duration":36},{"videoId":"2cEiN8WY_Jk","title":"🍊 8월 17일 #남규리 #그래도좋아해요","channelId":"UC_naRJKw5Isgpv5nF8yNXLw","channel":"남규리의 귤멍","duration":48},{"videoId":"xaK2DN7t0pc","title":"남규리 - 그래도 좋아해요 D-1 🧡","channelId":"UC_naRJKw5Isgpv5nF8yNXLw","channel":"남규리의 귤멍"},{"videoId":"oO5FmttBXV0","title":"자랑스런 내 친구의 노래^^ #허각 #혼자한잔","channelId":"UC_naRJKw5Isgpv5nF8yNXLw","channel":"남규리의 귤멍","duration":60},{"videoId":"dEplPqErYCA","title":"귤멍과 너무 잘 어울렸던 #신용재 #불멍 (feat. MC귤🍊)","channelId":"UC_naRJKw5Isgpv5nF8yNXLw","channel":"남규리의 귤멍","duration":60},{"videoId":"Oar6mot3rfE","title":"역주행각! #임한별 안녕, 오늘의 그대에게 (feat.MC귤🍊)","channelId":"UC_naRJKw5Isgpv5nF8yNXLw","channel":"남규리의 귤멍","duration":39},{"videoId":"HHN9ncjr2R8","title":"그래도 좋아해요 🍊🧡 with 남규리 밴드","channelId":"UC_naRJKw5Isgpv5nF8yNXLw","channel":"남규리의 귤멍","duration":46},{"videoId":"SfBnm7lUTYM","title":"🍊's 쇼핑 in 동묘!","channelId":"UC_naRJKw5Isgpv5nF8yNXLw","channel":"남규리의 귤멍","duration":33},{"videoId":"2LUJGLqTgjo","title":"미친 허용별귤의 노래...🧡","channelId":"UC_naRJKw5Isgpv5nF8yNXLw","channel":"남규리의 귤멍","duration":51},{"videoId":"boM6aJ-h0Os","title":"허용별🍊이 전하는 사랑의 인사 👋","channelId":"UC_naRJKw5Isgpv5nF8yNXLw","channel":"남규리의 귤멍","duration":101},{"videoId":"8N2L40Hw33A","title":"현장 LIVE를 듣고 더 좋아진 황가람님의 나는 반딧불입니다 🍊🎵","channelId":"UC_naRJKw5Isgpv5nF8yNXLw","channel":"남규리의 귤멍","duration":55},{"videoId":"ZCqSUW8OsFI","title":"🍊 여수 먹방 🐟","channelId":"UC_naRJKw5Isgpv5nF8yNXLw","channel":"남규리의 귤멍","duration":47},{"videoId":"BUncYP66LwI","title":"규리의 업사이클링 리폼 도전! 안입는 옷들을 재탄생시켜 볼까요? ☺️ #패션 #스타일링 #리폼","channelId":"UC_naRJKw5Isgpv5nF8yNXLw","channel":"남규리의 귤멍","duration":52},{"videoId":"ooooRNIgqbs","title":"🍊's New Mate 이야누(Iyana)를 소개합니다 ☺️","channelId":"UC_naRJKw5Isgpv5nF8yNXLw","channel":"남규리의 귤멍","duration":57},{"videoId":"JzyV4zpIffk","title":"🍊만 몰랐던 이야기...?! 본편에서 확인하세요 😂","channelId":"UC_naRJKw5Isgpv5nF8yNXLw","channel":"남규리의 귤멍","duration":62},{"videoId":"J9G9RWjDE4o","title":"사랑을 나누러 갔다가 사랑을 가득 채우고 온 날의 기록 🍊  #HUG #만나샘","channelId":"UC_naRJKw5Isgpv5nF8yNXLw","channel":"남규리의 귤멍","duration":116},{"videoId":"5k6GmZ5eUG4","title":"열정 뿜뿜! 호기심 많은 🍊의 질문 폭격 주의! 🚨","channelId":"UC_naRJKw5Isgpv5nF8yNXLw","channel":"남규리의 귤멍","duration":36},{"videoId":"MGLqMkidH8w","title":"추석특집! 충격과 공포의 송편 만들기 대작전! ☺️🧡","channelId":"UC_naRJKw5Isgpv5nF8yNXLw","channel":"남규리의 귤멍","duration":53},{"videoId":"ut2OmROBB4A","title":"여러분~~ 행복한 한가위 되세요 🍊🧡","channelId":"UC_naRJKw5Isgpv5nF8yNXLw","channel":"남규리의 귤멍"},{"videoId":"8AmlrduO1NY","title":"핫도그, 문어라면, 흑돼지삼겹살...! 제주여행은 먹으려고 가는 거죠! 🫣","channelId":"UC_naRJKw5Isgpv5nF8yNXLw","channel":"남규리의 귤멍","duration":60},{"videoId":"B4IZ9ZR0R2c","title":"규리의 셀프힐링여행☺️🍊🧡 #제주도 #제주여행","channelId":"UC_naRJKw5Isgpv5nF8yNXLw","channel":"남규리의 귤멍","duration":46},{"videoId":"Pcw00-0_4g8","title":"🍊's 제주루트 2일차!","channelId":"UC_naRJKw5Isgpv5nF8yNXLw","channel":"남규리의 귤멍","duration":55},{"videoId":"mab7cyUudfA","title":"🍊 제주 먹방은 계속 됩니다 ☺️ #고기국수 #아이스크림 #돌하르방빵 #핫도그 #문어라면","channelId":"UC_naRJKw5Isgpv5nF8yNXLw","channel":"남규리의 귤멍"},{"videoId":"XYxAjjpYz5Y","title":"🍊 드디어 신곡이 나왔어요!! 우리 라이브 그런거해요!","channelId":"UC_naRJKw5Isgpv5nF8yNXLw","channel":"남규리의 귤멍","excludeFromVcr":true},{"videoId":"XeuhMsp44_s","title":"🍊","channelId":"UC_naRJKw5Isgpv5nF8yNXLw","channel":"남규리의 귤멍","excludeFromVcr":true},{"videoId":"2AGkX5SjOJY","title":"[Special Story with 씨야 마지막 콘서트] 기적같은 여러분! 우리 다시 만나요 👋","channelId":"UC_naRJKw5Isgpv5nF8yNXLw","channel":"남규리의 귤멍","duration":932},{"videoId":"7ESzhJT7lDQ","title":"[🍊's Pick] Dr.Shin 류신 아르기닌 & 관절 6","channelId":"UC_naRJKw5Isgpv5nF8yNXLw","channel":"남규리의 귤멍","duration":147},{"videoId":"vjH-71Nliko","title":"Ep.66 바쁘다 바빠! 남대표 남규리의 요즘 근황 🐷♥️ with 돼지","channelId":"UC_naRJKw5Isgpv5nF8yNXLw","channel":"남규리의 귤멍"},{"videoId":"1cK268hTM8Y","title":"[Special Clip] 나의 별이 되어준 귤별이들에게 💕","channelId":"UC_naRJKw5Isgpv5nF8yNXLw","channel":"남규리의 귤멍","duration":144},{"videoId":"_ij_QXFCzHY","title":"Ep65. 귤별이를 위한 팬송 공개🍊⭐🩷 넌 감동이라고 말하고 싶었어! (feat. 팬 선물 언박싱)","channelId":"UC_naRJKw5Isgpv5nF8yNXLw","channel":"남규리의 귤멍","duration":782},{"videoId":"U8xKCKSkhhk","title":"Ep.64 남규리, 울보된 날! 왜 자꾸 눈물이 날까요? 🥲음악방송 비하인드 (feat. KoN)","channelId":"UC_naRJKw5Isgpv5nF8yNXLw","channel":"남규리의 귤멍","duration":1051},{"videoId":"PQuBCS74HxM","title":"Ep.63 남규리, 10만 유튜버 되다! 실버버튼 언박싱과 구독자 Q&A 함께 해요! 🍊♥️","channelId":"UC_naRJKw5Isgpv5nF8yNXLw","channel":"남규리의 귤멍","duration":979},{"videoId":"wBJxsUK0nc8","title":"Ep.62 살다보니 이런 날이 오네요! 씨야 전국투어 콘서트 [The Fan] 비하인드 🍊🐿️🐶","channelId":"UC_naRJKw5Isgpv5nF8yNXLw","channel":"남규리의 귤멍"},{"videoId":"2FBZ9Vib3Lw","title":"Ep.61 남규리, 단발로 변신! 우리 사랑 그런 거 해요 😘 뮤직비디오 현장 비하인드","channelId":"UC_naRJKw5Isgpv5nF8yNXLw","channel":"남규리의 귤멍","duration":849},{"videoId":"uSVVyzQBRyw","title":"Ep.60 솔로라이프 이제 안녕! 이제 같이 살기로 했어요 😺♥️","channelId":"UC_naRJKw5Isgpv5nF8yNXLw","channel":"남규리의 귤멍"},{"videoId":"j9bpzfdX5yc","title":"Ep.59 우린 조금 멀리 돌아와 같은 곳에 서 있나 봐 🙂 씨야가 콘서트에 진심인 이유 (feat. The Fan)","channelId":"UC_naRJKw5Isgpv5nF8yNXLw","channel":"남규리의 귤멍","duration":977},{"videoId":"COprzuxGen4","title":"Ep.58 남규리 해외 출장 브이로그! 저 어디 다녀왔게요? @.@)","channelId":"UC_naRJKw5Isgpv5nF8yNXLw","channel":"남규리의 귤멍","duration":849},{"videoId":"0zcLLAFvpmw","title":"Ep.57 게임광 남규리의 달콤살벌 힐링데이 a.k.a. 오락실 도장깨기?!","channelId":"UC_naRJKw5Isgpv5nF8yNXLw","channel":"남규리의 귤멍","duration":932},{"videoId":"WsyxwPl55wQ","title":"Ep.56 전시보러 울산 다녀왔어요! 규리의 우아한 하루 브이로그 (feat. 하이퍼리얼리즘)","channelId":"UC_naRJKw5Isgpv5nF8yNXLw","channel":"남규리의 귤멍","duration":824},{"videoId":"POheFIIwsqo","title":"Ep.55 이번엔 대구 다녀왔습니다 🌞 남규리의 두 번째 버스킹 🎶","channelId":"UC_naRJKw5Isgpv5nF8yNXLw","channel":"남규리의 귤멍","duration":1091},{"videoId":"Qdi_gVUmhXI","title":"Ep.54 여러분! 씨야도 음방 돌아요! 씨야~호! 🤗 / 씨야 음악방송 비하인드 🎶","channelId":"UC_naRJKw5Isgpv5nF8yNXLw","channel":"남규리의 귤멍","duration":797},{"videoId":"aZKPgZHFd0c","title":"Ep.53 씨야 엔터 남대표가 쏜다! 고생하는 멤버들을 위한 당근타임 🥕","channelId":"UC_naRJKw5Isgpv5nF8yNXLw","channel":"남규리의 귤멍","duration":1008},{"videoId":"dKVDn4pUiLc","title":"Ep.52 대한민국, 북중미 월드컵! 기적을 바라며 응원했지만.. 🥲","channelId":"UC_naRJKw5Isgpv5nF8yNXLw","channel":"남규리의 귤멍","duration":1144},{"videoId":"ytKnBh5tA30","title":"Ep. 51 부산하면 시장투어! 남규리의 국제시장 & 깡통시장 털기 (feat.씨야 콘서트 홍보)","channelId":"UC_naRJKw5Isgpv5nF8yNXLw","channel":"남규리의 귤멍"},{"videoId":"17gUWdAZWEA","title":"Ep. 50 남대표는 열심히 부산콘서트 홍보 중!🎙 남규리 & 순순희 부산 버스킹 현장 두 번째","channelId":"UC_naRJKw5Isgpv5nF8yNXLw","channel":"남규리의 귤멍","duration":1475},{"videoId":"c8NnJNnkvt0","title":"Ep. 49 버스킹하기 딱 좋은 날씨네! 😎 남규리 & 순순희 부산 버스킹 현장 첫 번째","channelId":"UC_naRJKw5Isgpv5nF8yNXLw","channel":"남규리의 귤멍","duration":968},{"videoId":"b8d3lpKFLrE","title":"Ep.48 남대표의 부산 출장길 브이로그🚙 | 이 상무의 단콘 축하합니다🎉","channelId":"UC_naRJKw5Isgpv5nF8yNXLw","channel":"남규리의 귤멍","duration":1083},{"videoId":"qMxYWkAXPXU","title":"[스페셜 클립] 씨야 SEEYA 정규 4집 앨범 'First, Again' 랜선음감회 🎧 여러분의 최애곡은?! 🩷","channelId":"UC_naRJKw5Isgpv5nF8yNXLw","channel":"남규리의 귤멍"},{"videoId":"Ud_KJY1I1vQ","title":"Ep.47 오늘 밤은 씨야와 함께 STAY 🌟 🤗 | 씨야 정규 4집 타이틀곡 촬영현장 (with 아이키)","channelId":"UC_naRJKw5Isgpv5nF8yNXLw","channel":"남규리의 귤멍","duration":559},{"videoId":"FYrV4XZdbFE","title":"Ep.46 안녕하세요! 정규 4집으로 돌아온 씨야입니다! 🤗 | 씨야 자켓 촬영 현장 비하인드 📸","channelId":"UC_naRJKw5Isgpv5nF8yNXLw","channel":"남규리의 귤멍","duration":504},{"videoId":"uyMM80OZCMY","title":"Ep.45 해피귤스데이 🎂🍊♥️ | 울고 웃었던 아주 특별한 하루 with 특별 게스트들","channelId":"UC_naRJKw5Isgpv5nF8yNXLw","channel":"남규리의 귤멍"},{"videoId":"VE1bXWiCp-4","title":"[보너스 클립] 남규리 - 사랑의 인사 2026 홈비디오 ver.","channelId":"UC_naRJKw5Isgpv5nF8yNXLw","channel":"남규리의 귤멍","duration":241},{"videoId":"esccpk5IGbY","title":"Ep.44 📚책 읽어주는 귤 Part.2 | 꽃을 보듯 너를 본다 나태주 (feat. 수면유도 ASMR)","channelId":"UC_naRJKw5Isgpv5nF8yNXLw","channel":"남규리의 귤멍"},{"videoId":"7FAHv1Xt-Fo","title":"🍊귤's 레시피｜근대쌈밥 with 후무스","channelId":"UC_naRJKw5Isgpv5nF8yNXLw","channel":"남규리의 귤멍","duration":234},{"videoId":"LtGGq6cQxvo","title":"🍊남규리 힐링 브이로그｜Ep 01.멈추니까 보이는 것들｜숨이 차오를 때 한 번씩 잠시 멈춰보세요","channelId":"UC_naRJKw5Isgpv5nF8yNXLw","channel":"남규리의 귤멍","duration":515},{"videoId":"4DLmyJxXkkc","title":"🍊남규리 힐링 브이로그｜Ep 02. 내 시간을 변화시키는 작은 시작 Part1｜망설이지 말고 그냥 시작하세요!","channelId":"UC_naRJKw5Isgpv5nF8yNXLw","channel":"남규리의 귤멍","duration":426},{"videoId":"rZROlcGGWb0","title":"🍊귤's 레시피｜아보카도 샌드위치","channelId":"UC_naRJKw5Isgpv5nF8yNXLw","channel":"남규리의 귤멍"},{"videoId":"fjWWE-dE6To","title":"🍊남규리 힐링 브이로그｜Ep 02. 내 시간을 변화시키는 작은 시작 Part2 ｜ 잘 쉰다는 건 나와 친해지는 일이래요!","channelId":"UC_naRJKw5Isgpv5nF8yNXLw","channel":"남규리의 귤멍","duration":333},{"videoId":"hBRNG286too","title":"🍊귤's 레시피｜홈메이드 티라미수","channelId":"UC_naRJKw5Isgpv5nF8yNXLw","channel":"남규리의 귤멍","duration":148},{"videoId":"9Fo5VYRNnm8","title":"🍊 남규리 힐링 브이로그｜ Ep 03. 나를 위로하는 시간｜혼자서도 밥 잘 먹어요! 나만을 위한 밥상","channelId":"UC_naRJKw5Isgpv5nF8yNXLw","channel":"남규리의 귤멍","duration":554},{"videoId":"hP4Xwjr_J8Q","title":"🍊귤's 레시피｜꽃차","channelId":"UC_naRJKw5Isgpv5nF8yNXLw","channel":"남규리의 귤멍","duration":60},{"videoId":"Akw-DaBjhQ8","title":"🍊 귤's 레시피 | 할머니 갈비찜","channelId":"UC_naRJKw5Isgpv5nF8yNXLw","channel":"남규리의 귤멍","duration":84},{"videoId":"mMGx3-CdDyE","title":"🍊 남규리 힐링 브이로그 | Ep.04 소중한 사람과 함께하는 소중한 순간 | 조카랑 놀아주기 (feat. 짜장면 & 딸기라떼)","channelId":"UC_naRJKw5Isgpv5nF8yNXLw","channel":"남규리의 귤멍","duration":603},{"videoId":"Q6wN8rNK9dA","title":"🍊귤's 레시피 | 나나이모짜장면","channelId":"UC_naRJKw5Isgpv5nF8yNXLw","channel":"남규리의 귤멍","duration":113},{"videoId":"DUwwXeRiQVA","title":"🍊 귤's 레시피 | 나나이모 딸기라테","channelId":"UC_naRJKw5Isgpv5nF8yNXLw","channel":"남규리의 귤멍","duration":55},{"videoId":"zjytr57_Its","title":"🍊 배우 남규리 브이로그 | Ep.05 이 꿈에 머물고 싶어 | 칸 영화제 핑크카펫 &서울가요대상 비하인드","channelId":"UC_naRJKw5Isgpv5nF8yNXLw","channel":"남규리의 귤멍"},{"videoId":"UHwGZGI-nyE","title":"🍊 남규리 힐링 브이로그 | Ep.06 혼자라서 더 즐거운 시간 | 석모도 글램핑 (feat.조양방직)","channelId":"UC_naRJKw5Isgpv5nF8yNXLw","channel":"남규리의 귤멍","duration":1148},{"videoId":"3NxLrvrnzAo","title":"🍊 귤's 핫플레이스 | 조양방직","channelId":"UC_naRJKw5Isgpv5nF8yNXLw","channel":"남규리의 귤멍","duration":204},{"videoId":"89QLwY_GngY","title":"🍊 남규리 뮤직토크쇼 | Ep.07 함께 해줘서 고마워🧡 | 한 여름밤의 친구들(feat.허용별)","channelId":"UC_naRJKw5Isgpv5nF8yNXLw","channel":"남규리의 귤멍","duration":1196},{"videoId":"G_B9p2RZ8vQ","title":"🍊 귤's LIVE | 여름 안에서 (feat.허용별)","channelId":"UC_naRJKw5Isgpv5nF8yNXLw","channel":"남규리의 귤멍","excludeFromVcr":true},{"videoId":"D8XBjkcX7Z0","title":"[남규리 스페셜 다큐멘터리] 이제야 말하는 진심, 노래로 전하는 고백｜씨야에서 그래도 좋아해요까지","channelId":"UC_naRJKw5Isgpv5nF8yNXLw","channel":"남규리의 귤멍","duration":940},{"videoId":"72dkRGcIYgk","title":"🍊 남규리 뮤직토크쇼 | Ep.08 여름밤 허용별 콘서트 | MC규리는 성장 중...!","channelId":"UC_naRJKw5Isgpv5nF8yNXLw","channel":"남규리의 귤멍","duration":1270},{"videoId":"JSD0go1lLII","title":"🍊 귤's LIVE | 허각 - 혼자, 한잔","channelId":"UC_naRJKw5Isgpv5nF8yNXLw","channel":"남규리의 귤멍","excludeFromVcr":true},{"videoId":"dIL1Qdg7_xs","title":"🍊 귤's LIVE | 임한별 - 안녕, 오늘의 그대에게","channelId":"UC_naRJKw5Isgpv5nF8yNXLw","channel":"남규리의 귤멍","excludeFromVcr":true},{"videoId":"t6RZwGdhX98","title":"🍊 귤's LIVE | 신용재 - 불멍","channelId":"UC_naRJKw5Isgpv5nF8yNXLw","channel":"남규리의 귤멍","excludeFromVcr":true},{"videoId":"QLCHun_k69Q","title":"[Special Clip] 그래도 좋아해요 MV 비하인드 토크","channelId":"UC_naRJKw5Isgpv5nF8yNXLw","channel":"남규리의 귤멍","duration":890},{"videoId":"D2g3gaQdqVI","title":"🍊 남규리 힐링 브이로그 | Ep.09 그래도 좋아한다고 고백하는 거 맞아 | 밴드 멤버들과 동묘나들이 (feat. 스타일리스트 귤)","channelId":"UC_naRJKw5Isgpv5nF8yNXLw","channel":"남규리의 귤멍","duration":1137},{"videoId":"v94ggr3izUk","title":"🍊 남규리 뮤직토크쇼 | Ep.10 허용별귤 함께 LIVE | 노래할 때 가장 빛나는 사람들","channelId":"UC_naRJKw5Isgpv5nF8yNXLw","channel":"남규리의 귤멍","excludeFromVcr":true},{"videoId":"FG3pspmrsrw","title":"🍊  귤's LIVE | 허용별 - 이게 뭐냔 말이야","channelId":"UC_naRJKw5Isgpv5nF8yNXLw","channel":"남규리의 귤멍","excludeFromVcr":true},{"videoId":"q3--9xMqPew","title":"🍊  귤's LIVE | 허용별귤 - 미친 사랑의 노래","channelId":"UC_naRJKw5Isgpv5nF8yNXLw","channel":"남규리의 귤멍","excludeFromVcr":true},{"videoId":"wPcNvicmkPo","title":"🍊 남규리 힐링 브이로그 | Ep.11 여수 밤바다 그리고 반딧불 | 여수여행 & 페스티벌 MC 도전기 (특별출연 황가람님)","channelId":"UC_naRJKw5Isgpv5nF8yNXLw","channel":"남규리의 귤멍"},{"videoId":"1oLXlAEXcBU","title":"🍊 남규리 마음대로 브이로그 | Ep.12 만원짜리 패션스타일링?! | 귤실장님 업사이클링 리폼 도전 😀","channelId":"UC_naRJKw5Isgpv5nF8yNXLw","channel":"남규리의 귤멍","duration":1285},{"videoId":"qU2fayONEp0","title":"🍊 남규리 우당탕탕 브이로그 | Ep.13 나의 영국 친구를 소개합니다 | 영어 공부 열심히 하고 있어요 🫣","channelId":"UC_naRJKw5Isgpv5nF8yNXLw","channel":"남규리의 귤멍"},{"videoId":"5JANf4FmbNQ","title":"🍊 남규리 배움 브이로그 | Ep.14 귤식당 오픈 준비 중 | 열심히 메뉴 개발 중! (feat.  어바웃 박준영 셰프)","channelId":"UC_naRJKw5Isgpv5nF8yNXLw","channel":"남규리의 귤멍","duration":1763},{"videoId":"JwmAXqvpR-g","title":"🍊귤's 레시피｜삼겹살 토마토 파스타","channelId":"UC_naRJKw5Isgpv5nF8yNXLw","channel":"남규리의 귤멍","duration":275},{"videoId":"bi4NCaz__OA","title":"🍊귤's 레시피｜마라 크림 리소토 with 삼겹살","channelId":"UC_naRJKw5Isgpv5nF8yNXLw","channel":"남규리의 귤멍","duration":185},{"videoId":"VtouIEjeNnI","title":"🍊귤's 레시피｜삼겹살 떡볶이","channelId":"UC_naRJKw5Isgpv5nF8yNXLw","channel":"남규리의 귤멍","duration":235},{"videoId":"KNOasVMSYrU","title":"🍊 남규리 우당탕탕 브이로그 | Ep.15 추석특집 🥟 달콤살벌 송편 만들기 대작전(?) | 행복한 추석 보내세요 🧡","channelId":"UC_naRJKw5Isgpv5nF8yNXLw","channel":"남규리의 귤멍","duration":1425},{"videoId":"60dNYPs5RJ4","title":"🍊 남규리 힐링 브이로그 | Ep.16 남규리의 제주루트 Day 1 | 제주하늘,제주바다, 그리고 먹방🧡","channelId":"UC_naRJKw5Isgpv5nF8yNXLw","channel":"남규리의 귤멍","duration":1188},{"videoId":"pmhw1lyc0M4","title":"🍊 남규리 힐링 브이로그 | Ep.17 남규리의 제주루트 Day 2 | 규리야! 뭐 햄시냐? 👀","channelId":"UC_naRJKw5Isgpv5nF8yNXLw","channel":"남규리의 귤멍"},{"videoId":"jVCa6jPn3JA","title":"🍊 남규리 힐링 브이로그 | Ep.18 남규리의 제주루트 Day3 | 제주여행, 폭싹 속았수다! 🍀","channelId":"UC_naRJKw5Isgpv5nF8yNXLw","channel":"남규리의 귤멍","duration":1355},{"videoId":"YCtzV3bR6hc","title":"🍊 남규리 일상 브이로그 | Ep.19 남규리의 평범하지만 조금은 특별한 일주일 | 일본어공부 🖊 노래•연기연습 🎤 친구랑 수다👭 김완선 선배님 전시회 🖼  오아시스 콘서트 🎸","channelId":"UC_naRJKw5Isgpv5nF8yNXLw","channel":"남규리의 귤멍","duration":1411},{"videoId":"NIeNbStvYa0","title":"🍊 남규리 일상 브이로그 | Ep.20 변강쇠, 신당동, 엽기의 공통점은?! 🫣 | 매콤 달콤 떡볶이 투어 (feat. 위자월)","channelId":"UC_naRJKw5Isgpv5nF8yNXLw","channel":"남규리의 귤멍","duration":979},{"videoId":"EZDH03RfPKQ","title":"🍊 남규리 일상 브이로그 | Ep.21 남규리 충격 변신! 맑은 눈의 연기광 규리 | 드라마 촬영현장 살짝 보여드릴게요 (feat. 카카오페이지 인간시장)","channelId":"UC_naRJKw5Isgpv5nF8yNXLw","channel":"남규리의 귤멍","duration":591},{"videoId":"4TSdt2-DT80","title":"🍊 남규리 일상 브이로그 | Ep.22 눈물 펑펑 🥲 촬영장에서 생긴 일?! | 드라마 촬영현장 비하인드 두 번째 이야기","channelId":"UC_naRJKw5Isgpv5nF8yNXLw","channel":"남규리의 귤멍","duration":735},{"videoId":"6JiTQ12-tFg","title":" 🍊 남규리 힐링 브이로그 | Ep.23 이상한 나라에서 온 두부 | 남규리의 1일 펫시터 체험기 🐶","channelId":"UC_naRJKw5Isgpv5nF8yNXLw","channel":"남규리의 귤멍","duration":905},{"videoId":"AD77imZkwlM","title":"귤식당 당첨자 발표합니다 🍊🧡","channelId":"UC_naRJKw5Isgpv5nF8yNXLw","channel":"남규리의 귤멍","duration":695},{"videoId":"dkpgvfS_7RA","title":"🍊 남규리 힐링 브이로그 | Ep.24 낯선 도시, 익숙한 설레임의 중국 출장기 | 오늘 저 예쁜가요?","channelId":"UC_naRJKw5Isgpv5nF8yNXLw","channel":"남규리의 귤멍","duration":852},{"videoId":"6h86trNY6zc","title":"🍊 남규리 힐링 브이로그 | Ep.25 남규리의 왓츠인마이백 👝 | 여배우 파우치 털기! 뭐가 계속 나와요...!","channelId":"UC_naRJKw5Isgpv5nF8yNXLw","channel":"남규리의 귤멍","duration":968},{"videoId":"HnUQU1QkZRA","title":"🍊 남규리 힐링 브이로그 | Ep.26 깜짝 몰래카메라 나의 오랜 팬에게 | 광주가서 축가 부르고 왔어요 🎤 #씨야 #결혼할까요","channelId":"UC_naRJKw5Isgpv5nF8yNXLw","channel":"남규리의 귤멍","duration":865},{"videoId":"wmOhX7wUndk","title":"🍊 남규리 힐링 브이로그 | Ep.27 디셈버드림(December Dream) 뮤비 촬영 비하인드 | 드디어 구독자 애칭 발표 😬🧡","channelId":"UC_naRJKw5Isgpv5nF8yNXLw","channel":"남규리의 귤멍"},{"videoId":"9eL33u9f3CE","title":"🍊 남규리 힐링 브이로그 | Ep.28 2026년 새해 복 많이 받으세요! | 강원도 강릉으로 해돋이 기차여행 🌞","channelId":"UC_naRJKw5Isgpv5nF8yNXLw","channel":"남규리의 귤멍","duration":753},{"videoId":"RaK_jf5PwRc","title":"🍊 남규리 힐링 브이로그 | Ep.29 같이 커피 한 잔 할래요? | 강원도 강릉 이색 커피 투어 ☕️","channelId":"UC_naRJKw5Isgpv5nF8yNXLw","channel":"남규리의 귤멍","duration":725},{"videoId":"frUkQQcK6iQ","title":"🍊 남규리 힐링 브이로그 | Ep.30 넌 감동이었어🧡 | 귤별이들과 함께하는 귤식당 오픈! 🎉","channelId":"UC_naRJKw5Isgpv5nF8yNXLw","channel":"남규리의 귤멍","duration":944},{"videoId":"fIehhuyApqI","title":"🍊 남규리 여행 브이로그 | Ep.31 남규리의 우당탕탕 홍콩 여행 🛫 | 혼자 여행 쉽지 않네요...! 🤣","channelId":"UC_naRJKw5Isgpv5nF8yNXLw","channel":"남규리의 귤멍","duration":826},{"videoId":"5CD4IThQet0","title":"🍊 남규리 여행 브이로그 | Ep.32 남규리의 화양연화는 지금! 🌸 | 프로 유튜버로 거듭나는 중입니다 🫡","channelId":"UC_naRJKw5Isgpv5nF8yNXLw","channel":"남규리의 귤멍","duration":997},{"videoId":"1ca4er9zDD0","title":"🍊 남규리 우당탕탕  브이로그 | Ep.33 규리한테 두쫀쿠 사줄 사람? 저요! | 두바이st. 디저트 뿌시기! 👩‍🍳","channelId":"UC_naRJKw5Isgpv5nF8yNXLw","channel":"남규리의 귤멍","duration":880},{"videoId":"DtW-I-B1Pa4","title":"Ep.34 ChatGPT와 함께하는 한남동 투어! 우리..친구가 될 수 있을까? 🤔 |  남규리 우당탕탕 브이로그 🍊","channelId":"UC_naRJKw5Isgpv5nF8yNXLw","channel":"남규리의 귤멍","duration":850},{"videoId":"4m7JqK5odjo","title":"Ep.35 한남동을 방황하는 남규리?! with chatGPT (BGM 삼겹살송 🐷🎵) |  남규리 우당탕탕 브이로그 🍊","channelId":"UC_naRJKw5Isgpv5nF8yNXLw","channel":"남규리의 귤멍","duration":874},{"videoId":"_tCxUsVAd_U","title":"Ep.36 규리야~ 뭐하니? 배우 남규리 드라마 [인간시장] 대본리딩 & 시사회 현장 전격 공개! 😍 |  남규리 힐링 브이로그 🍊","channelId":"UC_naRJKw5Isgpv5nF8yNXLw","channel":"남규리의 귤멍","duration":822},{"videoId":"dfZxJIH4cCI","title":"Ep.37 남규리의 야밤 셀프 세차 도전기! 미안하고 고마운 나의 친구 붕붕이 목욕 시켜줬어요 🚗✨ |  남규리 힐링 브이로그 🍊","channelId":"UC_naRJKw5Isgpv5nF8yNXLw","channel":"남규리의 귤멍","duration":769},{"videoId":"uS_C2lANbP0","title":"Ep.38 남규리의 꿀피부를 위한 소소한 꿀팁들 공개합니다! ☺️ |  남규리 뷰티 브이로그 🍊","channelId":"UC_naRJKw5Isgpv5nF8yNXLw","channel":"남규리의 귤멍"},{"videoId":"HQQl-3OPp0U","title":"Ep.39 관악산 남다람쥐 등장! 좋은 기운 받으러 같이 등산해요 ⛰️ |  남규리 힐링 브이로그 🍊","channelId":"UC_naRJKw5Isgpv5nF8yNXLw","channel":"남규리의 귤멍","duration":891},{"videoId":"QwEAjrfN8WE","title":"Ep.40 그럼에도 우린 씨야입니다 💗 |  씨야 남규리, 김연지, 이보람 브이로그","channelId":"UC_naRJKw5Isgpv5nF8yNXLw","channel":"남규리의 귤멍","duration":883},{"videoId":"evYuFOqyJys","title":"Ep.41 15년을 기다린 꿈같은 하루 ✨️ |  씨야 신곡 그럼에도 우린 뮤직비디오 촬영현장 브이로그 🎵","channelId":"UC_naRJKw5Isgpv5nF8yNXLw","channel":"남규리의 귤멍","duration":961},{"videoId":"ctLA9ECbcoo","title":"Ep.42 야구왕(이 되고 싶은) 남규리 고척돔 가다! |  키움 히어로즈 시구하러 고척돔 간 브이로그 🎵","channelId":"UC_naRJKw5Isgpv5nF8yNXLw","channel":"남규리의 귤멍","duration":1059},{"videoId":"UdgmRKp8A-M","title":"남규리 - 사랑의 인사 2026 Teaser 3","channelId":"UC_naRJKw5Isgpv5nF8yNXLw","channel":"남규리의 귤멍","duration":31},{"videoId":"sMV9vkvXV1c","title":"Ep.43 규리가 2026년에 전하는 사랑의 인사 |  그토록 부르고 싶었던 노래 뮤직비디오 촬영 현장 비하인드🎥","channelId":"UC_naRJKw5Isgpv5nF8yNXLw","channel":"남규리의 귤멍"},{"videoId":"Y1136sZlQHs","title":"Ep.44 📚책 읽어주는 귤 Part.1 | 우리 같이 책 읽을까요? 졸면 안돼요 🤣 본격 꿀잠 유발 영상","channelId":"UC_naRJKw5Isgpv5nF8yNXLw","channel":"남규리의 귤멍","duration":1442},{"videoId":"dPUQRulJx-0","title":"🔔#징글벨락 🔔 #크리스마스송 #캐롤송 #김연지 #생목라이브 #메리크리스마스 🎅🎄#jinglebellsrock #merrychristmas","channelId":"UCjLZIdvRV7fQ3m_DA9NEkOg","channel":"김연지 Official","excludeFromVcr":true},{"videoId":"0UOyAoaehBI","title":"#생목라이브 #차안 #가슴으로운다 #김연지 #목풀기 #연습 #풀려라 #신곡 #리메이크 #kpop #발라드 #라이브","channelId":"UCjLZIdvRV7fQ3m_DA9NEkOg","channel":"김연지 Official","excludeFromVcr":true},{"videoId":"wf7pWfHTkOI","title":"모차르트 막공 퇴근길~","channelId":"UCjLZIdvRV7fQ3m_DA9NEkOg","channel":"김연지 Official","excludeFromVcr":true},{"videoId":"YpaUJoDM_MM","title":"연지시는 아니지만 인이어 언박싱!!!","channelId":"UCjLZIdvRV7fQ3m_DA9NEkOg","channel":"김연지 Official","excludeFromVcr":true},{"videoId":"-_I13nTF-L0","title":"4월22일 연지시","channelId":"UCjLZIdvRV7fQ3m_DA9NEkOg","channel":"김연지 Official","excludeFromVcr":true},{"videoId":"1Vg27yBtWUM","title":"3월15일 연지시","channelId":"UCjLZIdvRV7fQ3m_DA9NEkOg","channel":"김연지 Official","excludeFromVcr":true},{"videoId":"Dk4nQoGfh2g","title":"3월8일 연지시","channelId":"UCjLZIdvRV7fQ3m_DA9NEkOg","channel":"김연지 Official","excludeFromVcr":true},{"videoId":"afk_AwDkE1Y","title":"이걸 다시 부른다고요? 성대수술 후 ‘구두’ 로 돌아왔습니다!","channelId":"UCjLZIdvRV7fQ3m_DA9NEkOg","channel":"김연지 Official","duration":911},{"videoId":"OFAHe024sH0","title":"씨야 김연지, 성대 수술 6개월 만에 처음 노래해 봤습니다","channelId":"UCjLZIdvRV7fQ3m_DA9NEkOg","channel":"김연지 Official","duration":622},{"videoId":"yKevwM9DHk8","title":"씨야 노래를... 다시 부를 수 있을까요? (성대 수술 후 첫 도전)","channelId":"UCjLZIdvRV7fQ3m_DA9NEkOg","channel":"김연지 Official"},{"videoId":"a2Q-Psdhi4I","title":"데뷔 20년 만에 말 못하는 멤버를 처음 보는 씨야 보람이 반응","channelId":"UCjLZIdvRV7fQ3m_DA9NEkOg","channel":"김연지 Official","duration":1288},{"videoId":"Y5niUKlWVQY","title":"20년 차 가수가 목소리를 낼 수 없게 된다면?","channelId":"UCjLZIdvRV7fQ3m_DA9NEkOg","channel":"김연지 Official","duration":724},{"videoId":"mlNsbQEm8Yw","title":"20년 차 가수 생활.. 중단해야할까요?","channelId":"UCjLZIdvRV7fQ3m_DA9NEkOg","channel":"김연지 Official","duration":733},{"videoId":"T9UJ3PcPxu0","title":"[VLOG] 2주만에 불후의명곡 우승하는 방법!!","channelId":"UCjLZIdvRV7fQ3m_DA9NEkOg","channel":"김연지 Official","duration":1640},{"videoId":"g5ZJBeFQuGg","title":"[Real live] 🔔Jingle Bell Rock 🔔- 캐롤송 🎶🎄","channelId":"UCjLZIdvRV7fQ3m_DA9NEkOg","channel":"김연지 Official","excludeFromVcr":true},{"videoId":"p9M3n_ayuOw","title":"[VLOG] 연지의 부산여행 - 해변요가ㅣ브런치ㅣ요트투어ㅣ친구집에서 수다 타임까지ㅣ힐링여행","channelId":"UCjLZIdvRV7fQ3m_DA9NEkOg","channel":"김연지 Official"},{"videoId":"qSUpPP7vHpc","title":"[비하인드] ★ M/V 촬영 비하인드!!★\"비가오면 마음껏울어도되니까\" 뮤비 준비과정 &촬영현장 대.공.개!!","channelId":"UCjLZIdvRV7fQ3m_DA9NEkOg","channel":"김연지 Official"},{"videoId":"HvlsJ-sHt04","title":"[Live Clip] 비가오면 마음껏 울어도 되니까 - 김연지","channelId":"UCjLZIdvRV7fQ3m_DA9NEkOg","channel":"김연지 Official","excludeFromVcr":true},{"videoId":"5p_WUIHRNPk","title":"[VLOG] #전시회 나들이 VIOG -당신에게 '인연'은 무엇인가요??","channelId":"UCjLZIdvRV7fQ3m_DA9NEkOg","channel":"김연지 Official","duration":681},{"videoId":"gwRkvYc59_s","title":"[Live Clip] 사랑의인사 - 김연지","channelId":"UCjLZIdvRV7fQ3m_DA9NEkOg","channel":"김연지 Official","excludeFromVcr":true},{"videoId":"atp-TU4Xezs","title":"[Live Clip] 가슴으로운다 - 김연지","channelId":"UCjLZIdvRV7fQ3m_DA9NEkOg","channel":"김연지 Official","excludeFromVcr":true},{"videoId":"8k-YrZ5Gg2g","title":"[Live Clip] 빨간풍선 (빨간풍선ost) - 김연지","channelId":"UCjLZIdvRV7fQ3m_DA9NEkOg","channel":"김연지 Official","excludeFromVcr":true},{"videoId":"yhRSBlT-zq8","title":"[Live Clip] 시간이 지나면 잊혀진다 누가 그랬어 (뷰티풀모먼트ost) - 김연지","channelId":"UCjLZIdvRV7fQ3m_DA9NEkOg","channel":"김연지 Official","excludeFromVcr":true},{"videoId":"Vtbod5RDRog","title":"[Live Clip] 상상 (이상한변호사우영우ost) -김연지 Official","channelId":"UCjLZIdvRV7fQ3m_DA9NEkOg","channel":"김연지 Official","excludeFromVcr":true},{"videoId":"EPx3mcT-wZI","title":"[Live Clip] Whisky on the rock (우리들의 블루스 OST) - 김연지","channelId":"UCjLZIdvRV7fQ3m_DA9NEkOg","channel":"김연지 Official","excludeFromVcr":true},{"videoId":"fpwo3qTQxuY","title":"[VLOG] 연지의 퍼스널 컬러는?","channelId":"UCjLZIdvRV7fQ3m_DA9NEkOg","channel":"김연지 Official","duration":568},{"videoId":"DHLZEUD8BJk","title":"[Q&A] 미스트롯? 뮤지컬?  연지가 다 알려드립니다~!","channelId":"UCjLZIdvRV7fQ3m_DA9NEkOg","channel":"김연지 Official","duration":934},{"videoId":"zcgC6NDD0tQ","title":"[VLOG] ✨연지 노래방 OPEN✨ - 글램핑 브이로그 2탄","channelId":"UCjLZIdvRV7fQ3m_DA9NEkOg","channel":"김연지 Official"},{"videoId":"b17N4UnAMts","title":"[VLOG] 🏕연지의 가을 글램핑 VLOG - 매니저 1일 체험, 휴게소 간식 flex, 과자 asmr, 바닷가 라이브, 불멍까지🔥","channelId":"UCjLZIdvRV7fQ3m_DA9NEkOg","channel":"김연지 Official","duration":576},{"videoId":"qq7VPSJKwk8","title":"[Live Clip] Shallow (A Star Is Born OST) Vocal only ver. - 김연지 Official","channelId":"UCjLZIdvRV7fQ3m_DA9NEkOg","channel":"김연지 Official","excludeFromVcr":true},{"videoId":"i0iVyaJVyc4","title":"[Live Clip] Shallow(A Star Is Born OST) - 김연지  Official","channelId":"UCjLZIdvRV7fQ3m_DA9NEkOg","channel":"김연지 Official","excludeFromVcr":true},{"videoId":"hNpaQELx8uw","title":"[비하인드]★뮤지컬 모차르트!★ 연콘과 함께하는 대기실 비하인드(with.난넬)","channelId":"UCjLZIdvRV7fQ3m_DA9NEkOg","channel":"김연지 Official","duration":427},{"videoId":"uSWmUJF6Oeg","title":"[비하인드] 첫! 커스텀 인이어 제작기(feat. 언박싱 라이브)","channelId":"UCjLZIdvRV7fQ3m_DA9NEkOg","channel":"김연지 Official"},{"videoId":"0-VgHCHe91s","title":"[Live Clip] 김연지 단독 콘서트 직캠 ✨하이라이트✨ - 2편","channelId":"UCjLZIdvRV7fQ3m_DA9NEkOg","channel":"김연지 Official","excludeFromVcr":true},{"videoId":"K02MHUVQ-6k","title":"[Live Clip] 김연지 단독 콘서트 직캠  ✨하이라이트✨ - 1편","channelId":"UCjLZIdvRV7fQ3m_DA9NEkOg","channel":"김연지 Official","excludeFromVcr":true},{"videoId":"Y1eBMRxDtLo","title":"김연지 - 우리 다시 만나요 [MP3 Audio]","channelId":"UCjLZIdvRV7fQ3m_DA9NEkOg","channel":"김연지 Official","duration":249},{"videoId":"BezuQgMKfYA","title":"김연지 - 도망쳐 [MP3 Audio]","channelId":"UCjLZIdvRV7fQ3m_DA9NEkOg","channel":"김연지 Official","duration":187},{"videoId":"BKr4WHOP07g","title":"[Live Clip] 김연지 - 10년이나버티니","channelId":"UCjLZIdvRV7fQ3m_DA9NEkOg","channel":"김연지 Official","excludeFromVcr":true},{"videoId":"Ce8_oX93cMA","title":"[커버라이브] 우리 그만하자 - 김연지","channelId":"UCjLZIdvRV7fQ3m_DA9NEkOg","channel":"김연지 Official","excludeFromVcr":true},{"videoId":"yKi9ryETvBo","title":"[커버라이브] 전하지 못한 진심(방탄소년단_BTS) - 김연지","channelId":"UCjLZIdvRV7fQ3m_DA9NEkOg","channel":"김연지 Official","excludeFromVcr":true},{"videoId":"ylpCN-CXWJQ","title":"[Official Audio] 10년이나 버티니 - 김연지","channelId":"UCjLZIdvRV7fQ3m_DA9NEkOg","channel":"김연지 Official"},{"videoId":"_FJkNLkV82U","title":"[Live Clip] 내 맘(Mom) - 김연지 Official","channelId":"UCjLZIdvRV7fQ3m_DA9NEkOg","channel":"김연지 Official","excludeFromVcr":true},{"videoId":"M_FPSyuVae4","title":"[Teaser] 바람이 불면(When The Wind Blows) - 김연지 Official","channelId":"UCjLZIdvRV7fQ3m_DA9NEkOg","channel":"김연지 Official","duration":44},{"videoId":"cLaC4v0kRWk","title":"[스포라이브 티저] 바람이 불면(When The Wind Blows) - 김연지 Official","channelId":"UCjLZIdvRV7fQ3m_DA9NEkOg","channel":"김연지 Official","excludeFromVcr":true},{"videoId":"lRY2u_9IQLE","title":"[커버라이브] Love Poem (IU 아이유) - 김연지 Official","channelId":"UCjLZIdvRV7fQ3m_DA9NEkOg","channel":"김연지 Official","excludeFromVcr":true},{"videoId":"wRyD0sv1k8c","title":"[MV] 바람이 불면 (When The Wind Blows) - 김연지 Official","channelId":"UCjLZIdvRV7fQ3m_DA9NEkOg","channel":"김연지 Official"},{"videoId":"yg5sLcy7tCw","title":"[비하인드] ★씨야★ 멤버들과 함께한 슈가맨3 비하인드 영상 대!공!개!","channelId":"UCjLZIdvRV7fQ3m_DA9NEkOg","channel":"김연지 Official"},{"videoId":"r1ZWK8KxAIM","title":"[스포라이브] 김연지 - 바람이 불면 full ver.","channelId":"UCjLZIdvRV7fQ3m_DA9NEkOg","channel":"김연지 Official","excludeFromVcr":true},{"videoId":"Sp0HDqM-xHU","title":"[Official Audio] 바람이 불면 - 김연지 Official","channelId":"UCjLZIdvRV7fQ3m_DA9NEkOg","channel":"김연지 Official","duration":251},{"videoId":"bgSdWO0-iMk","title":"[커버라이브] Best Part(H.E.R) - 김연지 Official","channelId":"UCjLZIdvRV7fQ3m_DA9NEkOg","channel":"김연지 Official","excludeFromVcr":true},{"videoId":"h0o0CtFw1I0","title":"[비하인드] 경★유희열의 스케치북★축 돌아온 김연지의 유.스.케 나들이 + 콘푸로스트 언박싱","channelId":"UCjLZIdvRV7fQ3m_DA9NEkOg","channel":"김연지 Official","duration":188},{"videoId":"eJcxC1f-YTM","title":"[Live Clip] 사랑의인사 (씨야_SeeYa)  - 김연지 Official","channelId":"UCjLZIdvRV7fQ3m_DA9NEkOg","channel":"김연지 Official","excludeFromVcr":true},{"videoId":"NJRvSCPIlpQ","title":"[Live Clip] 비하인드! 사랑의인사 (씨야_SeeYa) - 김연지 Official","channelId":"UCjLZIdvRV7fQ3m_DA9NEkOg","channel":"김연지 Official","duration":119},{"videoId":"YTjhddY18WI","title":"[Live Clip] 미친사랑의 노래 (SeeYa_씨야) - 김연지 Official","channelId":"UCjLZIdvRV7fQ3m_DA9NEkOg","channel":"김연지 Official","excludeFromVcr":true},{"videoId":"PJai01nhBDw","title":"[Live Clip] 미친사랑의 노래(Vocal ver.) - 김연지 Official","channelId":"UCjLZIdvRV7fQ3m_DA9NEkOg","channel":"김연지 Official","excludeFromVcr":true},{"videoId":"CZy8Z1rDlrM","title":"[비하인드] ★불후의 명곡★ 깨발랄한 연지의 P.R.O적 모먼트 대.공.개","channelId":"UCjLZIdvRV7fQ3m_DA9NEkOg","channel":"김연지 Official","duration":365},{"videoId":"8D50dA-bWr8","title":"[Live Clip] 2002(Anne Marie) - 김연지 Official","channelId":"UCjLZIdvRV7fQ3m_DA9NEkOg","channel":"김연지 Official","excludeFromVcr":true},{"videoId":"Us3kFQ39f2Y","title":"[비하인드] ★뮤지컬 모차르트!★ 연지콘스탄체의 연습 현장 대.공.개","channelId":"UCjLZIdvRV7fQ3m_DA9NEkOg","channel":"김연지 Official","duration":246},{"videoId":"4YuwjlXda4s","title":"빛의 반대편에서 by 김연지 #이보람 #김연지 #KimYeonJi #빛의반대편에서 #Beyond_the_light","channelId":"UCz11CPccQ2AnizJrdp58Bog","channel":"보람씨야","duration":37},{"videoId":"dT48xQRbqrc","title":"빛의 반대편에서 with 경서 #이보람 #경서 #KyoungSeo #빛의반대편에서 #Beyond_the_light","channelId":"UCz11CPccQ2AnizJrdp58Bog","channel":"보람씨야","duration":39},{"videoId":"N5xtqno2aoI","title":"노래🎵#김연지 #노래","channelId":"UCz11CPccQ2AnizJrdp58Bog","channel":"보람씨야","duration":39},{"videoId":"dSvveFDnLhE","title":"빛의 반대편에서 by 알리(ALi) #이보람 #알리 #ALi #빛의반대편에서 #Beyond_the_light","channelId":"UCz11CPccQ2AnizJrdp58Bog","channel":"보람씨야","duration":39},{"videoId":"aJvQYuTiilc","title":"빛의 반대편에서 by HYNN(박혜원) #이보람 #박혜원 #HYNN #빛의반대편에서 #Beyond_the_light","channelId":"UCz11CPccQ2AnizJrdp58Bog","channel":"보람씨야","duration":35},{"videoId":"DmB3Frs6x5Q","title":"빛의 반대편에서 by 이솔로몬 #이보람 #이솔로몬 #leesolomon #빛의반대편에서 #Beyond_the_light","channelId":"UCz11CPccQ2AnizJrdp58Bog","channel":"보람씨야","duration":39},{"videoId":"QyAHFzU7b6Y","title":"빛의 반대편에서 by 임한별 #이보람 #임한별 #Onestar #빛의반대편에서 #Beyond_the_light","channelId":"UCz11CPccQ2AnizJrdp58Bog","channel":"보람씨야","duration":40},{"videoId":"l6E1_bRCOGk","title":"빛의 반대편에서 by 쏘머즈 #이보람 #쏘머즈 #somerz #빛의반대편에서 #Beyond_the_light","channelId":"UCz11CPccQ2AnizJrdp58Bog","channel":"보람씨야","duration":57},{"videoId":"2adhvJ-9anM","title":"빛의 반대편에서 by 제아 #이보람 #제아 #JeA #빛의반대편에서 #Beyond_the_light","channelId":"UCz11CPccQ2AnizJrdp58Bog","channel":"보람씨야","duration":35},{"videoId":"B2uSDXuJhOs","title":"☀️ 요즘 날씨 요약 🌧️ #이보람 #씨야","channelId":"UCz11CPccQ2AnizJrdp58Bog","channel":"보람씨야","duration":14},{"videoId":"vCiKmDWJnLc","title":"빛의 반대편에서 by 정동하 #이보람 #정동하 #JungDongHa #빛의반대편에서 #Beyond_the_light","channelId":"UCz11CPccQ2AnizJrdp58Bog","channel":"보람씨야"},{"videoId":"VEm8U00raMY","title":"빛의 반대편에서 by 김예찬 #이보람 #김예찬 #YECHAN #빛의반대편에서 #Beyond_the_light","channelId":"UCz11CPccQ2AnizJrdp58Bog","channel":"보람씨야","duration":38},{"videoId":"ZTQ0dWqiux8","title":"파격 변신!! 드디어 돌아온 빨머람💇‍♀️ #씨야 #이보람","channelId":"UCz11CPccQ2AnizJrdp58Bog","channel":"보람씨야","duration":108},{"videoId":"pYE7U7Ifb74","title":"빛의 반대편에서 by 하은 #이보람 #하은 #haeun #빛의반대편에서 #Beyond_the_light","channelId":"UCz11CPccQ2AnizJrdp58Bog","channel":"보람씨야","duration":39},{"videoId":"OWVEOmnAhVY","title":"🎬✨ 이보람 신곡 [빛의 반대편에서] 비하인드!  #이보람 #씨야 #빛의반대편에서","channelId":"UCz11CPccQ2AnizJrdp58Bog","channel":"보람씨야","duration":110},{"videoId":"QtmrMGKP4tA","title":"빛의 반대편에서 by 허각  #이보람 #허각 #HuhGak #빛의반대편에서 #Beyond_the_light","channelId":"UCz11CPccQ2AnizJrdp58Bog","channel":"보람씨야","duration":34},{"videoId":"pjuVbvMGP14","title":"빛의 반대편에서 by SF9 인성#이보람 #LEEBORAM #SF9 #에스에프나인 #인성 #INSEONG#빛의반대편에서 #Beyond_the_light","channelId":"UCz11CPccQ2AnizJrdp58Bog","channel":"보람씨야"},{"videoId":"d0UxjB8qJNk","title":"빛의 반대편에서 by DK (디셈버) #이보람 #LEEBORAM #디케이 #DK#빛의반대편에서 #Beyond_the_light","channelId":"UCz11CPccQ2AnizJrdp58Bog","channel":"보람씨야","duration":40},{"videoId":"dmlWyVxZVLg","title":"🐯⚾️ 갸보람, 시구하러 가기 전 특훈(?) 받는 중  #씨야 #이보람","channelId":"UCz11CPccQ2AnizJrdp58Bog","channel":"보람씨야","duration":51},{"videoId":"EhnA1riBvFk","title":"#이제야사랑이보이네 #이선희","channelId":"UCz11CPccQ2AnizJrdp58Bog","channel":"보람씨야","duration":60},{"videoId":"MNkq3Hy7f20","title":"#그대에게불러봐요 #정소연","channelId":"UCz11CPccQ2AnizJrdp58Bog","channel":"보람씨야","duration":35},{"videoId":"9O--CDE2ErM","title":"Mute is Off by 이보람 #이보람 #leeboram #MuteisOff챌린지","channelId":"UCz11CPccQ2AnizJrdp58Bog","channel":"보람씨야","duration":36},{"videoId":"WxLSAf8aiXU","title":"#RETURN #DK #디셈버","channelId":"UCz11CPccQ2AnizJrdp58Bog","channel":"보람씨야","duration":55},{"videoId":"m5AhI339WPg","title":"#그집앞 #정동하","channelId":"UCz11CPccQ2AnizJrdp58Bog","channel":"보람씨야","duration":60},{"videoId":"YXZpEBb2Nn8","title":"#당신을위하여 #더크로스","channelId":"UCz11CPccQ2AnizJrdp58Bog","channel":"보람씨야","duration":56},{"videoId":"Ufm2t1N5ekk","title":"#물고기자리 #이안","channelId":"UCz11CPccQ2AnizJrdp58Bog","channel":"보람씨야","duration":58},{"videoId":"1GOS-MSvLoA","title":"#숙녀에게 #변진섭 #송필근","channelId":"UCz11CPccQ2AnizJrdp58Bog","channel":"보람씨야","duration":57},{"videoId":"CCDiQH8Uruk","title":"#Golden #연습","channelId":"UCz11CPccQ2AnizJrdp58Bog","channel":"보람씨야","duration":50},{"videoId":"8p64YYbPyCI","title":"#운명 #풀하우스ost #why","channelId":"UCz11CPccQ2AnizJrdp58Bog","channel":"보람씨야","duration":53},{"videoId":"mqYgq98EuuE","title":"#너에게닿기를 #10cm","channelId":"UCz11CPccQ2AnizJrdp58Bog","channel":"보람씨야"},{"videoId":"AC4zOPFH94E","title":"#이럴거면 #아이비","channelId":"UCz11CPccQ2AnizJrdp58Bog","channel":"보람씨야","duration":60},{"videoId":"3kl-wqnW8fI","title":"매일 이렇게 비가 내려 - 이보람 25.06.23 오후 12시 💙","channelId":"UCz11CPccQ2AnizJrdp58Bog","channel":"보람씨야","duration":13},{"videoId":"tt0uG1HrEAk","title":"'매일 이렇게 비가 내려' - 이보람 25.06.23 오후 12:00","channelId":"UCz11CPccQ2AnizJrdp58Bog","channel":"보람씨야"},{"videoId":"Wg088E533ws","title":"#아시나요 #조성모","channelId":"UCz11CPccQ2AnizJrdp58Bog","channel":"보람씨야","duration":55},{"videoId":"Lo9HeSxc9p8","title":"Never Ending Story - 아이유(IU) (원곡 : 부활)","channelId":"UCz11CPccQ2AnizJrdp58Bog","channel":"보람씨야","duration":39},{"videoId":"pXZ5U8cjhiQ","title":"얼음인형 연습중 🎤 #얼음인형 #씨야","channelId":"UCz11CPccQ2AnizJrdp58Bog","channel":"보람씨야","duration":63},{"videoId":"mEHxqn2t4fo","title":"반가운 목소리 🩷 한서인 - 시간을 지나 🎶","channelId":"UCz11CPccQ2AnizJrdp58Bog","channel":"보람씨야","duration":22},{"videoId":"lXOUFuh24qw","title":"#고민중독 #qwer 연습중 🎤","channelId":"UCz11CPccQ2AnizJrdp58Bog","channel":"보람씨야"},{"videoId":"rp6cw0eAW3Y","title":"겨울 플리에 추가해야징 🧡 #녹지않을게 #케이시 #kassy","channelId":"UCz11CPccQ2AnizJrdp58Bog","channel":"보람씨야"},{"videoId":"KbN2F8o4O0g","title":"‘어떻게 이별까지 사랑하겠어, 널 사랑하는 거지’ 두 번째 미리보기  #어떻게이별까지사랑하겠어 #akmu #cover","channelId":"UCz11CPccQ2AnizJrdp58Bog","channel":"보람씨야","duration":52},{"videoId":"-7undJTsmCs","title":"HAPPY - DAY6(데이식스)","channelId":"UCz11CPccQ2AnizJrdp58Bog","channel":"보람씨야","duration":30},{"videoId":"rszZxGzq5yY","title":"보람씨야 이보람이 추천하는 '2024 Everything we do is music' 뮤지션 모집","channelId":"UCz11CPccQ2AnizJrdp58Bog","channel":"보람씨야"},{"videoId":"PZxV32jEC8I","title":"#그그그 가사가 뭐였더라..🥲","channelId":"UCz11CPccQ2AnizJrdp58Bog","channel":"보람씨야","duration":45},{"videoId":"aPL94FV7u3Q","title":"#형 살려줘... 행사 연습중🤤","channelId":"UCz11CPccQ2AnizJrdp58Bog","channel":"보람씨야","duration":45},{"videoId":"xHrfSq_swgM","title":"[보람씨야] I AM - 아이브 무반주 라이브 #shorts","channelId":"UCz11CPccQ2AnizJrdp58Bog","channel":"보람씨야","excludeFromVcr":true},{"videoId":"1kl1AnjHaNQ","title":"[보람씨야] 늦은후회 - 보보 #shorts","channelId":"UCz11CPccQ2AnizJrdp58Bog","channel":"보람씨야","duration":45},{"videoId":"TYGALsPfGuY","title":"[보람씨야] 결국엔 너에게 닿아서 - WSG워너비(가야G) #shorts","channelId":"UCz11CPccQ2AnizJrdp58Bog","channel":"보람씨야","duration":43},{"videoId":"8P8ryEGx0_U","title":"[보람씨야] Blue Moon - 씨야, 다비치, 블랙펄 #shorts","channelId":"UCz11CPccQ2AnizJrdp58Bog","channel":"보람씨야","duration":32},{"videoId":"wbiDHPTtqVs","title":"냥이와 함께 😺 에스파 #DreamsComeTrue #YouTubeShorts #드컴챌","channelId":"UCz11CPccQ2AnizJrdp58Bog","channel":"보람씨야"},{"videoId":"eFi6rasGFbM","title":"준비하시고 쏘세요 🔫 #댓댓 #thatthat #싸이","channelId":"UCz11CPccQ2AnizJrdp58Bog","channel":"보람씨야","duration":25},{"videoId":"ZnP8ug8cv2c","title":"의리의 가야G 가야G 평생 가야G 🥹❤️","channelId":"UCz11CPccQ2AnizJrdp58Bog","channel":"보람씨야","duration":27},{"videoId":"cCbgFNrqhLk","title":"#NeoSeoulChallenge #NCT127Challenge #광고","channelId":"UCz11CPccQ2AnizJrdp58Bog","channel":"보람씨야","duration":10},{"videoId":"vjdFfiMeLlE","title":"[보람씨야] 사건의 지평선 - 윤하 #shorts","channelId":"UCz11CPccQ2AnizJrdp58Bog","channel":"보람씨야"},{"videoId":"k_f_oFhA71o","title":"람봉 골라보람 🐿️💛","channelId":"UCz11CPccQ2AnizJrdp58Bog","channel":"보람씨야","excludeFromVcr":true},{"videoId":"sDtfWK-qFtM","title":"보람씨야 라이브 스트리밍 중","channelId":"UCz11CPccQ2AnizJrdp58Bog","channel":"보람씨야","excludeFromVcr":true},{"videoId":"S27UvqQdUs0","title":"수다라방📢 당신을 위하여 🎶🎧","channelId":"UCz11CPccQ2AnizJrdp58Bog","channel":"보람씨야","excludeFromVcr":true},{"videoId":"xE2qsy-Ao8c","title":"보람씨야 라이브 스트리밍 중","channelId":"UCz11CPccQ2AnizJrdp58Bog","channel":"보람씨야","excludeFromVcr":true},{"videoId":"Ns0t_K9VX38","title":"보람씨야 라이브 스트리밍 중","channelId":"UCz11CPccQ2AnizJrdp58Bog","channel":"보람씨야","excludeFromVcr":true},{"videoId":"2F8lbmAIe9E","title":"보람씨야 라이브 스트리밍 중","channelId":"UCz11CPccQ2AnizJrdp58Bog","channel":"보람씨야","excludeFromVcr":true},{"videoId":"5EFMPIOC0q4","title":"수다라방 😆","channelId":"UCz11CPccQ2AnizJrdp58Bog","channel":"보람씨야","excludeFromVcr":true},{"videoId":"obqGtsQI-bY","title":"더 울어라~ 젊은 인생아~~","channelId":"UCz11CPccQ2AnizJrdp58Bog","channel":"보람씨야","excludeFromVcr":true},{"videoId":"x1PvT31_vck","title":"오랜만에 깜짝 라방🫣","channelId":"UCz11CPccQ2AnizJrdp58Bog","channel":"보람씨야","excludeFromVcr":true},{"videoId":"oD9ITwOT9_E","title":"오랜만이람","channelId":"UCz11CPccQ2AnizJrdp58Bog","channel":"보람씨야","excludeFromVcr":true},{"videoId":"kvSnASgOItM","title":"구독자 애칭 발표 🥁","channelId":"UCz11CPccQ2AnizJrdp58Bog","channel":"보람씨야","excludeFromVcr":true},{"videoId":"KONXltUM2DA","title":"퇴근길 🚗","channelId":"UCz11CPccQ2AnizJrdp58Bog","channel":"보람씨야","excludeFromVcr":true},{"videoId":"OLg6GfKb7Yc","title":"가야G 가야G 라이브 가야G!!!!❤️","channelId":"UCz11CPccQ2AnizJrdp58Bog","channel":"보람씨야","excludeFromVcr":true},{"videoId":"c6PoIF3PQ04","title":"30만 감사합니다 🙇🏻‍♀️","channelId":"UCz11CPccQ2AnizJrdp58Bog","channel":"보람씨야","excludeFromVcr":true},{"videoId":"gxb926KhG0c","title":"데뷔 16주년이라니!! 근데 이제 코로나를 곁들인..","channelId":"UCz11CPccQ2AnizJrdp58Bog","channel":"보람씨야","excludeFromVcr":true},{"videoId":"ljV61LAl3Ss","title":"치킨 라이브 🐯","channelId":"UCz11CPccQ2AnizJrdp58Bog","channel":"보람씨야","excludeFromVcr":true},{"videoId":"mhbZnyxouAM","title":"눕방 😴 얼마만에 라이브지? 🤭","channelId":"UCz11CPccQ2AnizJrdp58Bog","channel":"보람씨야","excludeFromVcr":true},{"videoId":"CdtBBO_KV8o","title":"오랜만이에요❤️","channelId":"UCz11CPccQ2AnizJrdp58Bog","channel":"보람씨야","excludeFromVcr":true},{"videoId":"f9j0Cj91emE","title":"너무 늦어 죄송해요ㅠ 복면가왕 Q&A 👉🏻👈🏻","channelId":"UCz11CPccQ2AnizJrdp58Bog","channel":"보람씨야","excludeFromVcr":true},{"videoId":"WTZFDr_ZP9Y","title":"이보람 음원발매 기념 버스킹","channelId":"UCz11CPccQ2AnizJrdp58Bog","channel":"보람씨야","excludeFromVcr":true},{"videoId":"yRYZeoEBWDU","title":"[보람씨야] 맛있는 것도 먹고! 우석대학교 씨야 행사🎤 | [일상 브이로그/VLOG]","channelId":"UCz11CPccQ2AnizJrdp58Bog","channel":"보람씨야"},{"videoId":"dW8vBqXwWGE","title":"[보람씨야] 씨야 콘서트 '대구' VLOG 🎤 | 짧음 주의! 대구 콘서트 비하인드","channelId":"UCz11CPccQ2AnizJrdp58Bog","channel":"보람씨야","duration":176},{"videoId":"yyj8xNAfjUs","title":"[보람씨야] 눈물광광🥹 테라리움 만들고 왔어요! 🌿 | 일상 브이로그 VLOG","channelId":"UCz11CPccQ2AnizJrdp58Bog","channel":"보람씨야"},{"videoId":"05rfQa2tRYw","title":"[보람씨야] 제주도 호캉스에 천지연폭포 산책까지!🌴(2부) [제주도 여행 브이로그/VLOG]","channelId":"UCz11CPccQ2AnizJrdp58Bog","channel":"보람씨야","duration":596},{"videoId":"_AbFDbCDAHI","title":"[보람씨야] 제주도 호캉스! (1부)🌴✈️ 먹고! 놀고! 쉬고! [제주도 여행 브이로그/VLOG]","channelId":"UCz11CPccQ2AnizJrdp58Bog","channel":"보람씨야","duration":907},{"videoId":"EKj0dbTGa8M","title":"[보람씨야] 파격 변신!!💇‍♀️ 염색부터 NEW 앨범 라이브 촬영까지! [일상 브이로그/VLOG]","channelId":"UCz11CPccQ2AnizJrdp58Bog","channel":"보람씨야","duration":834},{"videoId":"171P24SS1hM","title":"[보람씨야] (2부) 15년만에 씨야 완전체 음방투어 브이로그!! [일상 브이로그/VLOG]","channelId":"UCz11CPccQ2AnizJrdp58Bog","channel":"보람씨야","duration":607},{"videoId":"wUBH9MJAO_w","title":"[보람씨야] (1부) 15년만에 씨야 완전체 음방투어 브이로그!! [일상 브이로그/VLOG]","channelId":"UCz11CPccQ2AnizJrdp58Bog","channel":"보람씨야"},{"videoId":"gLoFe4TpFSA","title":"[보람씨야] 갸보람 8년만에 시구하고 왔어요! 🐯⚾️ [일상 브이로그/VLOG]","channelId":"UCz11CPccQ2AnizJrdp58Bog","channel":"보람씨야","duration":549},{"videoId":"g2YE1HfEDv0","title":"RETURN - DK(디셈버) / 이보람 (Lee Boram) [보람씨야]","channelId":"UCz11CPccQ2AnizJrdp58Bog","channel":"보람씨야"},{"videoId":"BizTUTWCwyc","title":"그 집 앞 - 정동하 / 이보람 (Lee Boram) [보람씨야]","channelId":"UCz11CPccQ2AnizJrdp58Bog","channel":"보람씨야","duration":234},{"videoId":"eP4cvTgvRys","title":"당신을 위하여 - 더크로스 김혁건x이보람 / 이보람 (Lee Boram) [보람씨야]","channelId":"UCz11CPccQ2AnizJrdp58Bog","channel":"보람씨야","duration":235},{"videoId":"3puQpiw9Ps4","title":"당신을 위하여 / 더 크로스(The Cross) / 이보람 (Lee Boram) [보람씨야]","channelId":"UCz11CPccQ2AnizJrdp58Bog","channel":"보람씨야","duration":243},{"videoId":"sVRdHDy1i5c","title":"물고기자리 -이안 / 이보람 (Lee Boram) [보람씨야]","channelId":"UCz11CPccQ2AnizJrdp58Bog","channel":"보람씨야"},{"videoId":"3hGcIbMd_Lc","title":"숙녀에게 (원곡 : 변진섭) - 송필근 / 이보람 (Lee Boram) [보람씨야]","channelId":"UCz11CPccQ2AnizJrdp58Bog","channel":"보람씨야","duration":193},{"videoId":"Cq7U0pxRzmg","title":"운명 (풀하우스 OST) - WHY / 이보람 (Lee Boram) [보람씨야]","channelId":"UCz11CPccQ2AnizJrdp58Bog","channel":"보람씨야","duration":253},{"videoId":"SiQa6tzVkUw","title":"너에게 닿기를 - 10CM / 이보람 (Lee Boram) [보람씨야]","channelId":"UCz11CPccQ2AnizJrdp58Bog","channel":"보람씨야","duration":154},{"videoId":"_Vq6xCg4Vro","title":"이럴거면 - 아이비 / 이보람 (Lee Boram) [보람씨야]","channelId":"UCz11CPccQ2AnizJrdp58Bog","channel":"보람씨야","duration":234},{"videoId":"0O9DWnIC9ok","title":"#매일이렇게비가내려 #이보람 #무반주 #lyricvideo","channelId":"UCz11CPccQ2AnizJrdp58Bog","channel":"보람씨야","excludeFromVcr":true},{"videoId":"7VGw30BGkyw","title":"매일 이렇게 비가 내려 -이보람 (IONY의 오선지 : Project #01)","channelId":"UCz11CPccQ2AnizJrdp58Bog","channel":"보람씨야","duration":151},{"videoId":"p7GbnNbMuTE","title":"매일 이렇게 비가 내려 -이보람 (IONY의 오선지 : Project #01) (Liveclip Acoustic ver.)","channelId":"UCz11CPccQ2AnizJrdp58Bog","channel":"보람씨야"},{"videoId":"Pkw7SA5Gdx8","title":"모르시나요 - 다비치 / 이보람 (Lee Boram) [보람씨야]","channelId":"UCz11CPccQ2AnizJrdp58Bog","channel":"보람씨야","duration":307},{"videoId":"ZxHFkXjNZ2A","title":"#모르시나요 #다비치","channelId":"UCz11CPccQ2AnizJrdp58Bog","channel":"보람씨야","duration":60},{"videoId":"LvUdZoTQGJ0","title":"아시나요 - 조성모 / 이보람 (Lee Boram) [보람씨야]","channelId":"UCz11CPccQ2AnizJrdp58Bog","channel":"보람씨야","duration":273},{"videoId":"PVTeDuQW-Ng","title":"Never Ending Story - 아이유(IU) (원곡 : 부활) / 이보람 (Lee Boram) [보람씨야]","channelId":"UCz11CPccQ2AnizJrdp58Bog","channel":"보람씨야","duration":224},{"videoId":"8qxl7p8sDPI","title":"다정히 내 이름을 부르면 - 경서예지, 전건호 / 이보람 (Lee Boram) [보람씨야]","channelId":"UCz11CPccQ2AnizJrdp58Bog","channel":"보람씨야","duration":234},{"videoId":"SS2W1KpMIvc","title":"사랑..그게 뭔데 - 지아 (원곡 : 양파) / 이보람 (Lee Boram) [보람씨야]","channelId":"UCz11CPccQ2AnizJrdp58Bog","channel":"보람씨야","duration":226},{"videoId":"M-97dYACT8U","title":"얼음인형 - 씨야(SeeYa) / 이보람 (Lee Boram) [보람씨야]","channelId":"UCz11CPccQ2AnizJrdp58Bog","channel":"보람씨야","duration":215},{"videoId":"6GRYPTsYKJo","title":"★데뷔 13주년 기념★ 미친 사랑의 노래 - 씨야(SeeYa) / 이보람 (Lee Boram) [보람씨야]","channelId":"UCz11CPccQ2AnizJrdp58Bog","channel":"보람씨야","duration":236},{"videoId":"MR4HGTG0CfQ","title":"구두 - 씨야(SeeYa) / 씨야의 '구두 시리즈' 첫 번째 이야기 / 이보람 (Lee Boram) [보람씨야]","channelId":"UCz11CPccQ2AnizJrdp58Bog","channel":"보람씨야","duration":247},{"videoId":"rcG8XAi3OPA","title":"180도 - 벤(BEN) / 이보람 (Lee Boram) [보람씨야]","channelId":"UCz11CPccQ2AnizJrdp58Bog","channel":"보람씨야"},{"videoId":"hpAheGUSvTk","title":"180도 촬영중 무슨일이??? / 이보람 (Lee Boram) [보람씨야]","channelId":"UCz11CPccQ2AnizJrdp58Bog","channel":"보람씨야","duration":54},{"videoId":"ObSPf7YptQY","title":"[보이는노래방] 처음 그 자리에(풀하우스 OST) / 이보람 (Lee Boram) [보람씨야]","channelId":"UCz11CPccQ2AnizJrdp58Bog","channel":"보람씨야","duration":247},{"videoId":"kRHM1rP4gmk","title":"넘쳐흘러 - 엠씨더맥스 (M.C The Max) / 이보람 (Lee Boram) [보람씨야]","channelId":"UCz11CPccQ2AnizJrdp58Bog","channel":"보람씨야","duration":178},{"videoId":"SpOLbureBk4","title":"★신곡발매기념★ '그때의 나 그때의 너' 녹음실 라이브!! / 이보람 (Lee Boram) [보람씨야]","channelId":"UCz11CPccQ2AnizJrdp58Bog","channel":"보람씨야","excludeFromVcr":true},{"videoId":"Gc1_sEj-IrU","title":"[보이는노래방] 여성시대 - 씨야, 다비치, 티아라 / 이보람 (Lee Boram) [보람씨야]","channelId":"UCz11CPccQ2AnizJrdp58Bog","channel":"보람씨야","duration":218},{"videoId":"CySMA0bphao","title":"[보이는노래방] 사랑의 인사 - 씨야 (SeeYa) / 이보람 (Lee Boram) [보람씨야]","channelId":"UCz11CPccQ2AnizJrdp58Bog","channel":"보람씨야","duration":278},{"videoId":"LuorknUivWc","title":"사계 (Four Seasons) - 태연 (TAEYEON) / 이보람 (Lee Boram) [보람씨야]","channelId":"UCz11CPccQ2AnizJrdp58Bog","channel":"보람씨야","duration":152},{"videoId":"NVA1IdgcuBA","title":"잊어가지마 (Prod. 로코베리) - 윤미래 / 이보람 (Lee boram) [보람씨야]","channelId":"UCz11CPccQ2AnizJrdp58Bog","channel":"보람씨야","duration":134},{"videoId":"i1aFaLwsqvM","title":"사계 (하루살이) - 엠씨더맥스 (M.C The Max) / 이보람 (Lee Boram) [보람씨야]","channelId":"UCz11CPccQ2AnizJrdp58Bog","channel":"보람씨야","duration":166},{"videoId":"51O7VJheD9E","title":"★복면가왕 ver.★ 나를 슬프게 하는 사람들 - 김경호 / 이보람 (Lee Boram) [보람씨야]","channelId":"UCz11CPccQ2AnizJrdp58Bog","channel":"보람씨야","duration":263},{"videoId":"DujKGd4aA60","title":"▶Live clip◀ 이렇게 좋은 날 - 이보람 (Lee Boram) / [보람씨야]","channelId":"UCz11CPccQ2AnizJrdp58Bog","channel":"보람씨야","excludeFromVcr":true},{"videoId":"LQKWuMBJuFQ","title":"[복면가왕] 103, 104, 105대 가왕 나이팅게일 이보람 인사드립니다♥","channelId":"UCz11CPccQ2AnizJrdp58Bog","channel":"보람씨야","duration":248},{"videoId":"H_U4HugKNK8","title":"★신곡★ '흩어지는 중' - 이보람 (Lee Boram) ▷Live clip◁ / [보람씨야]","channelId":"UCz11CPccQ2AnizJrdp58Bog","channel":"보람씨야","excludeFromVcr":true},{"videoId":"T2Vy2QnAxLg","title":"[보이는노래방] ▶LIVE◀ 흩어지는 중 - 이보람 (Lee Boram) / [보람씨야]","channelId":"UCz11CPccQ2AnizJrdp58Bog","channel":"보람씨야","excludeFromVcr":true},{"videoId":"orvzqEviTfQ","title":"그때가 좋았어 - 케이시(Kassy) / 이보람 (Lee Boram) [보람씨야]","channelId":"UCz11CPccQ2AnizJrdp58Bog","channel":"보람씨야","duration":237},{"videoId":"ppe9vyChKLs","title":"[Full ver.] 흩어지는 중 (음원ver.) - 이보람 (Lee Boram) / [보람씨야]","channelId":"UCz11CPccQ2AnizJrdp58Bog","channel":"보람씨야","duration":252},{"videoId":"2iSzvt7hmpA","title":"너에 대한 모든 것 - 로코베리 / 이보람 (Lee Boram) [보람씨야]","channelId":"UCz11CPccQ2AnizJrdp58Bog","channel":"보람씨야","duration":209},{"videoId":"pBCWMCG92ms","title":"지우지 못한 사진들처럼 (Vocal.정미) - 아이오니 / 이보람 (Lee Boram) [보람씨야]","channelId":"UCz11CPccQ2AnizJrdp58Bog","channel":"보람씨야"},{"videoId":"p8T0WjpGr-M","title":"가을밤 떠난 너 - 케이시(Kassy) / 이보람 (Lee Boram) [보람씨야]","channelId":"UCz11CPccQ2AnizJrdp58Bog","channel":"보람씨야"},{"videoId":"kiQF638_yBE","title":"시든 꽃에 물을 주듯 - HYNN(박혜원) / 이보람 (Lee Boram) [보람씨야]","channelId":"UCz11CPccQ2AnizJrdp58Bog","channel":"보람씨야"},{"videoId":"LIkmnZmomGM","title":"'보람하다'  나만의 향수만들기 ♥","channelId":"UCz11CPccQ2AnizJrdp58Bog","channel":"보람씨야","duration":372},{"videoId":"9dJFlFTMlSk","title":"헤어지자는 말은 사랑한다는 말이야 - 베이지(Beige) / 이보람 (Lee Boram) [보람씨야]","channelId":"UCz11CPccQ2AnizJrdp58Bog","channel":"보람씨야","duration":230},{"videoId":"Outw2iebvDs","title":"오늘도 빛나는 너에게 (To You My Light) (Feat. 이라온) - 마크툽(Maktub) / 이보람 (Lee Boram) [보람씨야]","channelId":"UCz11CPccQ2AnizJrdp58Bog","channel":"보람씨야","duration":225},{"videoId":"Qqg4KmkfkV0","title":"늦은 밤 너의 집 앞 골목길에서 - 노을 / 이보람 (Lee Boram) [보람씨야]","channelId":"UCz11CPccQ2AnizJrdp58Bog","channel":"보람씨야","duration":216},{"videoId":"-QWumNvRJdM","title":"Into the Unknown 'Frozen 2 (겨울왕국 2 OST)' - Idina Menzel, Aurora / 이보람 (Lee Boram) [보람씨야]","channelId":"UCz11CPccQ2AnizJrdp58Bog","channel":"보람씨야","duration":194},{"videoId":"UEsPL6tqCp4","title":"하얀 크리스마스 - 이보람 (Lee Boram) / [보람씨야]","channelId":"UCz11CPccQ2AnizJrdp58Bog","channel":"보람씨야","duration":124},{"videoId":"sIkd5n4Nppw","title":"여인의 향기 - 씨야 (SeeYa) / 이보람 (Lee Boram) [보람씨야]","channelId":"UCz11CPccQ2AnizJrdp58Bog","channel":"보람씨야","duration":226},{"videoId":"WeMuc0cFk0I","title":"미워요 - 씨야 (SeeYa) / 이보람 (Lee Boram) [보람씨야]","channelId":"UCz11CPccQ2AnizJrdp58Bog","channel":"보람씨야","duration":254},{"videoId":"B77V1wfmhqw","title":"결혼할까요 - 씨야 (SeeYa) / 이보람 (Lee Boram) [보람씨야]","channelId":"UCz11CPccQ2AnizJrdp58Bog","channel":"보람씨야","duration":203},{"videoId":"pmhgDj1J3UQ","title":"실버버튼 언박싱이 왔습니다! 감동의 개봉식✨[보람씨야]","channelId":"UCz11CPccQ2AnizJrdp58Bog","channel":"보람씨야","duration":374},{"videoId":"fU0TvPPWxBk","title":"방구석 콘서트 같은 '발코니 콘서트'  봄 커버송 메들리 [아로하 / 흔들리는 꽃들속에서  네 샴푸향이 느껴진거야 / 봄 사랑 벚꽃말고 / 러브블러썸 / 봄이 좋냐 / 우연히 봄]","channelId":"UCz11CPccQ2AnizJrdp58Bog","channel":"보람씨야","duration":164},{"videoId":"Ne5glv53Rn8","title":"실버버튼 기념 '보람씨야' Q&A '이것이 궁금해 보람' ?!","channelId":"UCz11CPccQ2AnizJrdp58Bog","channel":"보람씨야","duration":718},{"videoId":"1fjX0ibzUlE","title":"데뷔 15년 만에 인이어 이어폰이 생겼습니다~~ '나만의 커스텀 인이어' [보람씨야]","channelId":"UCz11CPccQ2AnizJrdp58Bog","channel":"보람씨야","duration":437},{"videoId":"1aajfv0l_z8","title":"복면가왕 나이팅게일 1주년 기념~! 3라운드 미공개곡 공개! '양파 - A'ddio' [보람씨야]","channelId":"UCz11CPccQ2AnizJrdp58Bog","channel":"보람씨야","duration":216},{"videoId":"JwvWLf-iYDo","title":"뷰티데이/ 메이크업 받기, 머리 붙이기, 뿌염하기, 그리고 저녁메뉴는???!! [보람씨야]","channelId":"UCz11CPccQ2AnizJrdp58Bog","channel":"보람씨야","duration":642},{"videoId":"gaoZ40kWZo4","title":"Lonely Night - 부활 / 슬기로운 의사생활 OST 원곡 ver. [보람씨야]","channelId":"UCz11CPccQ2AnizJrdp58Bog","channel":"보람씨야","duration":196},{"videoId":"sjgD4-10HpM","title":"Memories- Maroon 5 / 이보람 (Lee Boram) [보람씨야]","channelId":"UCz11CPccQ2AnizJrdp58Bog","channel":"보람씨야"},{"videoId":"N5YSV7xejoI","title":"복면가왕 역대 최다득표곡!! 나이팅게일 ver. '그 여자 - 백지영 '/ 이보람 (Lee Boram) [보람씨야]","channelId":"UCz11CPccQ2AnizJrdp58Bog","channel":"보람씨야","duration":277},{"videoId":"h5j9eoeP-ss","title":"갸보람의 야구 사랑 ♥ 보물상자 공개!! (Feat. 남행열차)","channelId":"UCz11CPccQ2AnizJrdp58Bog","channel":"보람씨야","duration":420},{"videoId":"cDN_odyS1Gk","title":"Part of your world - The Little Mermaid (인어공주 ost) / 이보람 (Lee Boram) [보람씨야]","channelId":"UCz11CPccQ2AnizJrdp58Bog","channel":"보람씨야","duration":176},{"videoId":"yQdFh57QgX4","title":"잠시만 안녕 - M.C the MAX (복면가왕 나이팅게일 ver.) / 이보람 (Lee Boram) [보람씨야]","channelId":"UCz11CPccQ2AnizJrdp58Bog","channel":"보람씨야"},{"videoId":"G6Afw4ni6tQ","title":"헬곡!!! My Way (돈꽃 OST) - 이수 (M.C the MAX) / 이보람 (Lee Boram) [보람씨야]","channelId":"UCz11CPccQ2AnizJrdp58Bog","channel":"보람씨야","duration":251},{"videoId":"K_GGhmCnVRc","title":"하늘 끝에서 흘린 눈물 - 주니퍼 / 이보람 (Lee boram) [보람씨야]","channelId":"UCz11CPccQ2AnizJrdp58Bog","channel":"보람씨야","duration":238},{"videoId":"Gd-ES77t1eQ","title":"3 Days 클렌즈주스 디톡스 리얼 후기!! (다이어트 포기할 뻔 ?!) [보람씨야]","channelId":"UCz11CPccQ2AnizJrdp58Bog","channel":"보람씨야","duration":489},{"videoId":"w4DHifb4nCE","title":"9년 만에 부르는!! 내겐 너무 멋진 그대 - 씨야 (SeeYa) / 이보람 (Lee Boram) [보람씨야]","channelId":"UCz11CPccQ2AnizJrdp58Bog","channel":"보람씨야","duration":227},{"videoId":"hcaCPLuKsFg","title":"바람기억 - 나얼 / 이보람 (Lee Boram) [보람씨야]","channelId":"UCz11CPccQ2AnizJrdp58Bog","channel":"보람씨야","duration":295},{"videoId":"CfBcdJovUj0","title":"컴알못의 컴퓨터 조립 도전!! 1탄! (부품설명편) / 이보람 (Lee Boram) [보람씨야]","channelId":"UCz11CPccQ2AnizJrdp58Bog","channel":"보람씨야","duration":422},{"videoId":"NbXCoYTC1Lk","title":"현명한 선택 - 소찬휘 (복면가왕 나이팅게일 ver.) / 이보람 (Lee Boram) [보람씨야]","channelId":"UCz11CPccQ2AnizJrdp58Bog","channel":"보람씨야","duration":198},{"videoId":"oQ7HR-3SNYk","title":"컴알못의 컴퓨터 조립 도전!! 2탄! (조립편) / 이보람 (Lee Boram) [보람씨야]","channelId":"UCz11CPccQ2AnizJrdp58Bog","channel":"보람씨야"},{"videoId":"IS8Rdor6suU","title":"여름 노래 메들리 [여름 안에서/아틀란티스 소녀/SHAKE IT/그 여름을 틀어줘/여행/비행기] / 이보람 (Lee Boram) [보람씨야]","channelId":"UCz11CPccQ2AnizJrdp58Bog","channel":"보람씨야","duration":142},{"videoId":"ZTE1Oq8Z_04","title":"오랜만에 연예인보람! 복면가왕 다녀왔어요~! [보람씨야]","channelId":"UCz11CPccQ2AnizJrdp58Bog","channel":"보람씨야","duration":267},{"videoId":"qagiSVG5MyE","title":"연 - 이영현 (빅마마) (복면가왕 나이팅게일 ver.) / 이보람(Lee Boram) [보람씨야]","channelId":"UCz11CPccQ2AnizJrdp58Bog","channel":"보람씨야"},{"videoId":"BtNY_6QXXvk","title":"Dynamite - 방탄소년단 (BTS) / 이보람 (Lee Boram) [보람씨야]","channelId":"UCz11CPccQ2AnizJrdp58Bog","channel":"보람씨야","duration":202},{"videoId":"LrkSXt9YhPg","title":"야생화 - 박효신 / 이보람 (Lee Boram) [보람씨야]","channelId":"UCz11CPccQ2AnizJrdp58Bog","channel":"보람씨야","duration":312},{"videoId":"tBkXPEddWD4","title":"이 노래 아시는 분!!🙋🏼‍♀️ '입모양 - 이승기' / 이보람 (Lee Boram) [보람씨야]","channelId":"UCz11CPccQ2AnizJrdp58Bog","channel":"보람씨야"},{"videoId":"wD3H4dR706k","title":"흔들리는 꽃들 속에서 네 샴푸향이 느껴진거야 - 장범준 / 이보람 (Lee Boram) [보람씨야]","channelId":"UCz11CPccQ2AnizJrdp58Bog","channel":"보람씨야"},{"videoId":"YjIJ28LSyUw","title":"'음색여신' 펀치의 신곡♥ 너의 목소리 - 펀치 (Punch) / 이보람 (Lee Boram) [보람씨야]","channelId":"UCz11CPccQ2AnizJrdp58Bog","channel":"보람씨야","duration":197},{"videoId":"erD8CrzmE60","title":"오래된 노래 - 스탠딩 에그 (Standing Egg) / 이보람 (Lee Boram) [보람씨야]","channelId":"UCz11CPccQ2AnizJrdp58Bog","channel":"보람씨야"},{"videoId":"Tn6VPGgZqcU","title":"반려견 사랑이와 함께한 화보 촬영 현장 🐶💕 견생샷 찍고 왔어요📸","channelId":"UCz11CPccQ2AnizJrdp58Bog","channel":"보람씨야","duration":451},{"videoId":"viCpi-KTXbU","title":"힘든 건 사랑이 아니다 - 임창정 / 이보람 (Lee Boram) [보람씨야]","channelId":"UCz11CPccQ2AnizJrdp58Bog","channel":"보람씨야"},{"videoId":"t-btii-76E0","title":"행복하니 - 케이시(Kassy) / 이보람 (Lee Boram) [보람씨야]","channelId":"UCz11CPccQ2AnizJrdp58Bog","channel":"보람씨야"},{"videoId":"S26yKHgCpLQ","title":"어디에도 - 엠씨더맥스 (M.C the MAX) / 이보람 (Lee Boram) [보람씨야]","channelId":"UCz11CPccQ2AnizJrdp58Bog","channel":"보람씨야","duration":332},{"videoId":"XP0NRwP4LyU","title":"형 (兄) - 노라조 / 이보람 (Lee Boram) [보람씨야]","channelId":"UCz11CPccQ2AnizJrdp58Bog","channel":"보람씨야","duration":251},{"videoId":"nLpIgkzAa1A","title":"눈의 꽃 - 박효신 / 이보람 (Lee Boram) [보람씨야]","channelId":"UCz11CPccQ2AnizJrdp58Bog","channel":"보람씨야","duration":321},{"videoId":"6ZjBUuEIKds","title":"술 한잔 해요 - 지아 / 이보람 (Lee Boram) [보람씨야]","channelId":"UCz11CPccQ2AnizJrdp58Bog","channel":"보람씨야","duration":210},{"videoId":"A7x52bJ6nRQ","title":"상사화 - 안예은 / 이보람 (Lee Boram) [보람씨야]","channelId":"UCz11CPccQ2AnizJrdp58Bog","channel":"보람씨야","duration":327},{"videoId":"GAjn-2-qUDg","title":"희재 - 성시경 / 이보람 (Lee Boram) [보람씨야]","channelId":"UCz11CPccQ2AnizJrdp58Bog","channel":"보람씨야","duration":226},{"videoId":"wKsaKuZebsM","title":"Celebrity - 아이유(IU) / 이보람 (Lee Boram) [보람씨야]","channelId":"UCz11CPccQ2AnizJrdp58Bog","channel":"보람씨야"},{"videoId":"8EzsOCUpAIw","title":"Don't cry - 더 크로스 (The Cross) / 이보람 (Lee Boram) [보람씨야]","channelId":"UCz11CPccQ2AnizJrdp58Bog","channel":"보람씨야","duration":207},{"videoId":"i2pxhIgWj8s","title":"VLOG ｜ 생애 첫 셀프세차! 제 차가 생겼어요 ♥","channelId":"UCz11CPccQ2AnizJrdp58Bog","channel":"보람씨야","duration":460},{"videoId":"CDTK_FEPsKs","title":"밤하늘의 별을 (2020) - 경서 / 이보람 (Lee Boram) [보람씨야]","channelId":"UCz11CPccQ2AnizJrdp58Bog","channel":"보람씨야","duration":218},{"videoId":"q6YQAvSIo84","title":"VLOG ｜ 💐데뷔 15주년, 보람씨야 2주년 기념! ❤","channelId":"UCz11CPccQ2AnizJrdp58Bog","channel":"보람씨야"},{"videoId":"PvqSbY1VfNU","title":"롤린 (Rollin') - 브레이브걸스(Brave Girls) / 이보람 (Lee Boram) [보람씨야]","channelId":"UCz11CPccQ2AnizJrdp58Bog","channel":"보람씨야","duration":203},{"videoId":"pD7suketqvE","title":"내 손을 잡아 - 아이유(IU) / 이보람 (Lee Boram) [보람씨야]","channelId":"UCz11CPccQ2AnizJrdp58Bog","channel":"보람씨야"},{"videoId":"ib6T90JptX8","title":"VLOG ｜ 카레 만들어 먹기🍛, 호텔식 수건 접기, 소창행주 삶기","channelId":"UCz11CPccQ2AnizJrdp58Bog","channel":"보람씨야","duration":550},{"videoId":"NH0uUxO0MCw","title":"오르막길 - 정인, 윤종신 / 이보람 (Lee Boram) [보람씨야]","channelId":"UCz11CPccQ2AnizJrdp58Bog","channel":"보람씨야","duration":281},{"videoId":"d4F7IvAx1qA","title":"행복한 나를 - 에코 / 이보람 (Lee Boram) [보람씨야]","channelId":"UCz11CPccQ2AnizJrdp58Bog","channel":"보람씨야","duration":243},{"videoId":"erONHczFnGA","title":"삭제 - 이승기 / 이보람 (Lee Boram) [보람씨야]","channelId":"UCz11CPccQ2AnizJrdp58Bog","channel":"보람씨야","duration":236},{"videoId":"CHwqt8Ngu0c","title":"묘해, 너와 - 어쿠스틱 콜라보 (연애의 발견 ost) / 이보람 (Lee Boram) [보람씨야]","channelId":"UCz11CPccQ2AnizJrdp58Bog","channel":"보람씨야","duration":224},{"videoId":"JqlXCrcSJ80","title":"만약에 - 태연 (쾌도 홍길동 ost) / 이보람 (Lee Boram) [보람씨야]","channelId":"UCz11CPccQ2AnizJrdp58Bog","channel":"보람씨야","duration":251},{"videoId":"gcd9t0ZFVcI","title":"끝사랑 - 김범수  / 이보람 (Lee Boram) [보람씨야]","channelId":"UCz11CPccQ2AnizJrdp58Bog","channel":"보람씨야"},{"videoId":"TtXJpgG8bzY","title":"좋니 - 윤종신 / 이보람 (Lee Boram) [보람씨야]","channelId":"UCz11CPccQ2AnizJrdp58Bog","channel":"보람씨야","duration":310},{"videoId":"K9bkqIrGJuY","title":"해바라기도 가끔 목이 아프죠 - 엠씨더맥스 (M.C the MAX) / 이보람 (Lee Boram) [보람씨야]","channelId":"UCz11CPccQ2AnizJrdp58Bog","channel":"보람씨야","duration":269},{"videoId":"6i4gBYneDic","title":"술 노래 메들리 (술이야/소주 한 잔/밤이 되니까/술 한 잔 해요/취중진담) / 이보람 (Lee Boram) [보람씨야]","channelId":"UCz11CPccQ2AnizJrdp58Bog","channel":"보람씨야","duration":193},{"videoId":"EW5WaO64Wa4","title":"바라만 본다 - MSG워너비(M.O.M) / 이보람 (Lee Boram) [보람씨야]","channelId":"UCz11CPccQ2AnizJrdp58Bog","channel":"보람씨야","duration":213},{"videoId":"MFGbHLC4cjw","title":"VLOG ｜ 다이어트 시즌 / 프로필촬영📸 / 보상 폭식데이","channelId":"UCz11CPccQ2AnizJrdp58Bog","channel":"보람씨야","duration":481},{"videoId":"_GuO0h0bVCE","title":"소주 한 잔 - 임창정 / 이보람 (Lee Boram) [보람씨야]","channelId":"UCz11CPccQ2AnizJrdp58Bog","channel":"보람씨야","duration":283},{"videoId":"TSd7SW59ZW8","title":"[티저] 드디어 신곡 나와요! ♥ '사랑하니까 - 이보람'","channelId":"UCz11CPccQ2AnizJrdp58Bog","channel":"보람씨야","duration":114},{"videoId":"14p6foEx1Y4","title":"[티저] 가로라이브 '이보람 - 사랑하니까'","channelId":"UCz11CPccQ2AnizJrdp58Bog","channel":"보람씨야","excludeFromVcr":true},{"videoId":"MxQA54orKlE","title":"사랑앓이 - FT아일랜드 (FTISLAND) / 이보람 (Lee Boram) [보람씨야]","channelId":"UCz11CPccQ2AnizJrdp58Bog","channel":"보람씨야","duration":196},{"videoId":"cEC1MYO8SMs","title":"[녹음실 티저] 이보람 - 사랑하니까","channelId":"UCz11CPccQ2AnizJrdp58Bog","channel":"보람씨야","duration":52},{"videoId":"q4jtpVDemFE","title":"[뮤비] 이보람 - 사랑하니까","channelId":"UCz11CPccQ2AnizJrdp58Bog","channel":"보람씨야","duration":223},{"videoId":"BLALkFyMUOk","title":"[풀버전] 가로라이브 '이보람 - 사랑하니까'","channelId":"UCz11CPccQ2AnizJrdp58Bog","channel":"보람씨야","excludeFromVcr":true},{"videoId":"0ANfHmkSyoQ","title":"[세로라이브] '이보람 - 사랑하니까'","channelId":"UCz11CPccQ2AnizJrdp58Bog","channel":"보람씨야","excludeFromVcr":true},{"videoId":"hNBitlLkebo","title":"[녹음실 풀버전] 이보람 - 사랑하니까","channelId":"UCz11CPccQ2AnizJrdp58Bog","channel":"보람씨야","duration":222},{"videoId":"xkpwmaCJ9uI","title":"못해 - 포맨(4MEN) / 이보람 (Lee Boram) [보람씨야]","channelId":"UCz11CPccQ2AnizJrdp58Bog","channel":"보람씨야"},{"videoId":"5C8O5IEBfXw","title":"비가 오는 날엔 - 비스트(Beast) / 이보람 (Lee Boram) [보람씨야]","channelId":"UCz11CPccQ2AnizJrdp58Bog","channel":"보람씨야","duration":182},{"videoId":"bshC6bXVnos","title":"You - 김상민 / 이보람 (Lee Boram) [보람씨야]","channelId":"UCz11CPccQ2AnizJrdp58Bog","channel":"보람씨야","duration":204},{"videoId":"q-USEdXO8xI","title":"시간을 거슬러 (해를 품은 달 OST) - 린(LYn) / 이보람 (Lee Boram) [보람씨야]","channelId":"UCz11CPccQ2AnizJrdp58Bog","channel":"보람씨야"},{"videoId":"akQz5sPv6Yc","title":"칵테일 사랑 - 마로니에 (권인하/신윤미), (로맨스가 필요해 2012 - 옥상달빛 ver.) / 이보람 (Lee Boram) [보람씨야]","channelId":"UCz11CPccQ2AnizJrdp58Bog","channel":"보람씨야","duration":208},{"videoId":"cx1rw5h7Mi8","title":"기다리다 - 윤하 / 이보람 (Lee Boram) [보람씨야]","channelId":"UCz11CPccQ2AnizJrdp58Bog","channel":"보람씨야","duration":260},{"videoId":"R7trKzGtTtU","title":"기억을 걷는 시간 - 넬(NELL) / 이보람 (Lee Boram) [보람씨야]","channelId":"UCz11CPccQ2AnizJrdp58Bog","channel":"보람씨야","duration":294},{"videoId":"Zj7GVXcF7x8","title":"VLOG ｜(스포주의) 손목 걸고 오징어게임??! 달고나 만들기 / 구슬 홀짝 게임","channelId":"UCz11CPccQ2AnizJrdp58Bog","channel":"보람씨야","duration":488},{"videoId":"yhDlGFZyd9k","title":"사랑 안 해 - 백지영 / 이보람 (Lee Boram) [보람씨야]","channelId":"UCz11CPccQ2AnizJrdp58Bog","channel":"보람씨야"},{"videoId":"cb96dqwR6tM","title":"OHAYO MY NIGHT - 디핵(D-Hack), PATEKO(파테코) / 이보람 (Lee Boram) [보람씨야]","channelId":"UCz11CPccQ2AnizJrdp58Bog","channel":"보람씨야","duration":193},{"videoId":"GsJmvkeW44s","title":"널 사랑하지 않아 - 어반자카파 / 이보람 (Lee Boram) [보람씨야]","channelId":"UCz11CPccQ2AnizJrdp58Bog","channel":"보람씨야","duration":251},{"videoId":"ZNm0mB9bKmE","title":"사랑은 늘 도망가 - 임영웅 (신사와 아가씨 OST) (원곡 : 이문세) / 이보람 (Lee Boram) [보람씨야]","channelId":"UCz11CPccQ2AnizJrdp58Bog","channel":"보람씨야","duration":232},{"videoId":"QdSvK75Tx0w","title":"두 사람 - 성시경 / 이보람 (Lee Boram) [보람씨야]","channelId":"UCz11CPccQ2AnizJrdp58Bog","channel":"보람씨야","duration":249},{"videoId":"p_hYS33CUs0","title":"질풍가도 - 유정석 (쾌걸 근육맨 2세 OST) / 이보람 (Lee Boram) [보람씨야]","channelId":"UCz11CPccQ2AnizJrdp58Bog","channel":"보람씨야"},{"videoId":"I2SaTVt-OwQ","title":"응급실 (쾌걸춘향 OST) - izi / 이보람 (Lee Boram) [보람씨야]","channelId":"UCz11CPccQ2AnizJrdp58Bog","channel":"보람씨야","duration":218},{"videoId":"6l72TmYsxig","title":"12월의 기적 (Miracles in December) - EXO / 이보람 (Lee Boram) [보람씨야]","channelId":"UCz11CPccQ2AnizJrdp58Bog","channel":"보람씨야","duration":274},{"videoId":"ipmP7tnhY-Y","title":"Heaven - 김현성 / 이보람 (Lee Boram) [보람씨야]","channelId":"UCz11CPccQ2AnizJrdp58Bog","channel":"보람씨야","duration":273},{"videoId":"uAHkNFE9lmI","title":"12월32일 - 별 / 이보람 (Lee Boram) [보람씨야]","channelId":"UCz11CPccQ2AnizJrdp58Bog","channel":"보람씨야"},{"videoId":"yp3-w2fRjEk","title":"말하는 대로 - 처진 달팽이 (유재석 & 이적) / 이보람 (Lee Boram) [보람씨야]","channelId":"UCz11CPccQ2AnizJrdp58Bog","channel":"보람씨야"},{"videoId":"-_j3UCirOio","title":"첫눈처럼 너에게 가겠다 - 에일리(Ailee) (도깨비 ost) / 이보람 (Lee Boram) [보람씨야]","channelId":"UCz11CPccQ2AnizJrdp58Bog","channel":"보람씨야","duration":230},{"videoId":"-WFvjBB8xqo","title":"가질 수 없는 너 - 뱅크 / 이보람 (Lee Boram) [보람씨야]","channelId":"UCz11CPccQ2AnizJrdp58Bog","channel":"보람씨야","duration":248},{"videoId":"aIlo_-8iWB4","title":"사랑에 빠지고 싶다 - 김조한 / 이보람 (Lee Boram) [보람씨야]","channelId":"UCz11CPccQ2AnizJrdp58Bog","channel":"보람씨야","duration":222},{"videoId":"miB25j6VFA0","title":"tvN즐거움송 커버 콘테스트 함께해요 🎤🎵","channelId":"UCz11CPccQ2AnizJrdp58Bog","channel":"보람씨야","duration":62},{"videoId":"Bup6nyspaxk","title":"너의 모든 순간 - 성시경 (별에서 온 그대 OST) / 이보람 (Lee Boram) [보람씨야]","channelId":"UCz11CPccQ2AnizJrdp58Bog","channel":"보람씨야","duration":233},{"videoId":"NXRd7NRTg8c","title":"호랑수월가 (나와 호랑이님 ost) - 상록수(feat.나래) / 이보람 (Lee Boram) [보람씨야]","channelId":"UCz11CPccQ2AnizJrdp58Bog","channel":"보람씨야","duration":288},{"videoId":"lV_badY3Bi8","title":"덩그러니 - 이수영 / 이보람 (Lee Boram) [보람씨야]","channelId":"UCz11CPccQ2AnizJrdp58Bog","channel":"보람씨야","duration":240},{"videoId":"agdpOKt8EBA","title":"That That (prod. ＆ feat. SUGA of BTS) - 싸이 (PSY) / 이보람 (Lee Boram) [보람씨야]","channelId":"UCz11CPccQ2AnizJrdp58Bog","channel":"보람씨야","duration":28},{"videoId":"tg2IuFVhUps","title":"어마어마해 - WSG워너비 / 이보람 (Lee Boram) [보람씨야]","channelId":"UCz11CPccQ2AnizJrdp58Bog","channel":"보람씨야"},{"videoId":"g7nYVmFX23Q","title":"한 밤의 꿈처럼 - 이보람 / 방구석 라이브🫶🏻❤️","channelId":"UCz11CPccQ2AnizJrdp58Bog","channel":"보람씨야","excludeFromVcr":true},{"videoId":"P8o3Ss-xPAQ","title":"애교 폭발 길냥이 고양이 냥줍! 이게 바로 간택이란 건가...? [일상 브이로그/VLOG]","channelId":"UCz11CPccQ2AnizJrdp58Bog","channel":"보람씨야","duration":702},{"videoId":"5auNDhYBVI4","title":"그때 그 순간 그대로 (그그그) - WSG워너비(가야G) / 이보람 (Lee Boram) [보람씨야]","channelId":"UCz11CPccQ2AnizJrdp58Bog","channel":"보람씨야","duration":222},{"videoId":"HslC4f6pQWA","title":"냥줍 길냥이! 너의 이름은? 집사 첫 번째 과제! 캣타워 조립하기 [일상 브이로그/VLOG]","channelId":"UCz11CPccQ2AnizJrdp58Bog","channel":"보람씨야","duration":661},{"videoId":"2ShLQvkT9QI","title":"우리 구독자 애칭 정해요😍❤️","channelId":"UCz11CPccQ2AnizJrdp58Bog","channel":"보람씨야","duration":38},{"videoId":"EdjxuH4Z5aY","title":"돈가스 맛집 '정돈'｜백화점에서 블러셔, 안경 구매｜친구들과 수다, 커피 [일상 브이로그/VLOG]","channelId":"UCz11CPccQ2AnizJrdp58Bog","channel":"보람씨야","duration":479},{"videoId":"IgQe-vV6Ivo","title":"가슴으로 낳아 지갑으로 모신다 🙇🏻‍♀️ 펫박람회, 두끼 떡볶이, 분식데이! [일상 브이로그/VLOG]","channelId":"UCz11CPccQ2AnizJrdp58Bog","channel":"보람씨야","duration":810},{"videoId":"Hn5KtY2Dlns","title":"따끈한 청국장 만들어 먹기 ! 스투키캣vs로마샌드 모래 테스트, 아우어 베이커리, 식세기 강추!!! [일상 브이로그/VLOG]","channelId":"UCz11CPccQ2AnizJrdp58Bog","channel":"보람씨야","duration":1045},{"videoId":"SwlPn9ZqMVw","title":"십 년 만에 새 안경, 전설의 핫도그, 애슐리 퀸즈 다녀왔어요! 지비츠 추천! 크록스 꾸미기 [일상 브이로그/VLOG]","channelId":"UCz11CPccQ2AnizJrdp58Bog","channel":"보람씨야","duration":742},{"videoId":"KPSR-eFXSgE","title":"먹고 또 먹고 먹기만 하는 크리스마스 연휴 🎄｜백화점 푸드코트｜백미당｜굴찜｜창문해먹설치｜팥칼국수｜조개롱 [일상 브이로그/VLOG]","channelId":"UCz11CPccQ2AnizJrdp58Bog","channel":"보람씨야","duration":1087},{"videoId":"P-wM7YnPb24","title":"먹고 또 먹고! 오늘도 먹는 브이로그🍜 순두부열라면, 에그샌드위치, 크로플, 구구크러스터, 수제간식 만들기 [일상 브이로그/VLOG]","channelId":"UCz11CPccQ2AnizJrdp58Bog","channel":"보람씨야","duration":857},{"videoId":"EWxFYLtGRXc","title":"잡채만들기, 온센텐동, 모래 전체갈이 [일상 브이로그/VLOG]","channelId":"UCz11CPccQ2AnizJrdp58Bog","channel":"보람씨야","duration":604},{"videoId":"Dx8G_cQ0Ym8","title":"집사 맴찢 ㅠ 동물병원 방문｜마켓컬리 추천템!! 🍤🍝 [일상 브이로그/VLOG]","channelId":"UCz11CPccQ2AnizJrdp58Bog","channel":"보람씨야","duration":606},{"videoId":"DEEQmmrQLgs","title":"[보람씨야X수페] 촬영현장, 압구정 하루, 카레돈가스, 카페 수다, 이보람의 숲킨케어?! 나이트루틴","channelId":"UCz11CPccQ2AnizJrdp58Bog","channel":"보람씨야","duration":1047},{"videoId":"uZ15Br_Zrvo","title":"생일주간 브이로그🥳🎂 선물 언박싱 🎁｜애플워치SE 44mm｜커스텀에어팟｜브레오 눈마사지기｜브리츠 블루투스 스피커｜후원증서,고기,화장품,족욕기｜밀리 자동급식기😻","channelId":"UCz11CPccQ2AnizJrdp58Bog","channel":"보람씨야","duration":888},{"videoId":"IHGTxWrJRag","title":"'그그그' 커버 녹음하던 날🎙｜거제 행사 가던 날 🎤 VLOG","channelId":"UCz11CPccQ2AnizJrdp58Bog","channel":"보람씨야","duration":318},{"videoId":"MrpO55KORTE","title":"오랜만에 보컬쌤으로 보낸 하루 ㅣ 셀프메이크업 ㅣ 노래 잘 부르는 꿀팁전수 ㅣ카페투어 ㅣ마무리는 고기🥩🍖[일상 브이로그/VLOG]","channelId":"UCz11CPccQ2AnizJrdp58Bog","channel":"보람씨야","duration":766},{"videoId":"u8qQCBsd-QA","title":"사건의 지평선 - 윤하 / 이보람 (Lee Boram) [보람씨야]","channelId":"UCz11CPccQ2AnizJrdp58Bog","channel":"보람씨야"},{"videoId":"NXvCPVKKwEI","title":"Blue Moon - 씨야, 다비치, 블랙펄 / 이보람 (Lee Boram) [보람씨야]","channelId":"UCz11CPccQ2AnizJrdp58Bog","channel":"보람씨야","duration":189},{"videoId":"o7iYsuxWLz0","title":"[VLOG] 막방 가야G ..","channelId":"UCz11CPccQ2AnizJrdp58Bog","channel":"보람씨야"},{"videoId":"tE0DpENLHn4","title":"결국엔 너에게 닿아서 - WSG워너비(가야G) / 이보람 (Lee Boram) [보람씨야]","channelId":"UCz11CPccQ2AnizJrdp58Bog","channel":"보람씨야"},{"videoId":"Qn69Fv_2z24","title":"늦은후회 - 보보 / 이보람 (Lee Boram) [보람씨야]","channelId":"UCz11CPccQ2AnizJrdp58Bog","channel":"보람씨야","duration":281},{"videoId":"bm83_9NjE9Q","title":"[Medley] 가족을 위한 노래 (가족사진/걱정말아요 그대/꽃길/엄마/아버지/하늘바라기) / 이보람 (Lee Boram) [보람씨야]","channelId":"UCz11CPccQ2AnizJrdp58Bog","channel":"보람씨야","duration":317},{"videoId":"GvjvBSwl7Pk","title":"5월의 일상 모음.zip  (일하고🎤먹고🥐놀고🐶힐링하고🌿) [일상 브이로그/VLOG]","channelId":"UCz11CPccQ2AnizJrdp58Bog","channel":"보람씨야","duration":818},{"videoId":"Hw4zJ634t4s","title":"놀고 먹는 갓벽한 편의점 세일 제품 먹방편 🍽️ [일상 브이로그/VLOG]","channelId":"UCz11CPccQ2AnizJrdp58Bog","channel":"보람씨야","duration":752},{"videoId":"dJ3oh792Gkk","title":"[무반주메들리] 밤/혼자가아닌나/사랑이야/찰나가영원이될때/열애중/I AM / 이보람 (Lee Boram) [보람씨야]","channelId":"UCz11CPccQ2AnizJrdp58Bog","channel":"보람씨야","excludeFromVcr":true},{"videoId":"LSecsdCJH6k","title":"[Medley] 비 노래 메들리 (빗속에서/비/장마/rain drop/rain/비도오고그래서) / 이보람 (Lee Boram) [보람씨야]","channelId":"UCz11CPccQ2AnizJrdp58Bog","channel":"보람씨야","duration":227},{"videoId":"uLMExuJ2DkQ","title":"헤어지자 말해요 - 박재정 / 이보람 (Lee Boram) [보람씨야]","channelId":"UCz11CPccQ2AnizJrdp58Bog","channel":"보람씨야"},{"videoId":"Zc1xppiQJk0","title":"[무반주메들리] 어른/기댈곳/사랑의바보/그대를알고/해바라기/중독된사랑 / 이보람 (Lee Boram) [보람씨야]","channelId":"UCz11CPccQ2AnizJrdp58Bog","channel":"보람씨야","excludeFromVcr":true},{"videoId":"H9fSg8R9YWY","title":"심(心) - DK(디셈버) / 이보람 (Lee Boram) [보람씨야]","channelId":"UCz11CPccQ2AnizJrdp58Bog","channel":"보람씨야","duration":249},{"videoId":"3xqcLnd2ZvM","title":"돌아와줘요 - 주주시크릿 / 이보람 (Lee Boram) [보람씨야]","channelId":"UCz11CPccQ2AnizJrdp58Bog","channel":"보람씨야","duration":201},{"videoId":"qH-VA8u8BVY","title":"나트랑 브이로그 🥭🌿🪂🔥 주로 먹고 노는 여행🍽️ [일상 브이로그/VLOG]","channelId":"UCz11CPccQ2AnizJrdp58Bog","channel":"보람씨야","duration":767},{"videoId":"3U55-CJIfOE","title":"모래알갱이 - 임영웅 / 이보람 (Lee Boram) [보람씨야]","channelId":"UCz11CPccQ2AnizJrdp58Bog","channel":"보람씨야","duration":222},{"videoId":"SlzpUt53NoU","title":"사랑시 고백구 행복동 - 최수호 / 이보람 (Lee Boram) [보람씨야]","channelId":"UCz11CPccQ2AnizJrdp58Bog","channel":"보람씨야","duration":239},{"videoId":"Fr_7Lo_u8mI","title":"속는 셈 치고 다시 만나자 - 케이시(Kassy) / 이보람 (Lee Boram) [보람씨야]","channelId":"UCz11CPccQ2AnizJrdp58Bog","channel":"보람씨야","duration":192},{"videoId":"if9HWsWUsDY","title":"천상연 - 이창섭 (웹툰 '선녀외전' X 이창섭 (LEE CHANGSUB)) / 이보람 (Lee Boram) [보람씨야]","channelId":"UCz11CPccQ2AnizJrdp58Bog","channel":"보람씨야","duration":271},{"videoId":"Hlj0ItkkP4A","title":"Love wins all - 아이유 (IU) / 이보람 (Lee Boram) [보람씨야]","channelId":"UCz11CPccQ2AnizJrdp58Bog","channel":"보람씨야","duration":257},{"videoId":"yC9B9CHDtyA","title":"태연 - 꿈 / 이보람 (Lee Boram) [보람씨야]","channelId":"UCz11CPccQ2AnizJrdp58Bog","channel":"보람씨야"},{"videoId":"bfPnBgdlkbE","title":"소나기 - 이클립스(ECLIPSE) / 이보람 (Lee Boram) [보람씨야]","channelId":"UCz11CPccQ2AnizJrdp58Bog","channel":"보람씨야","duration":228},{"videoId":"-z0OzrD2lTw","title":"미인 - 이기찬 / 이보람 (Lee Boram) [보람씨야]","channelId":"UCz11CPccQ2AnizJrdp58Bog","channel":"보람씨야","duration":208},{"videoId":"3rkxlYWemP4","title":"영원 (남은 인생 10년 X DK(디셈버)) - 원곡 : 최진영 (SKY) / 이보람 (Lee Boram) [보람씨야]","channelId":"UCz11CPccQ2AnizJrdp58Bog","channel":"보람씨야","duration":224},{"videoId":"_ghnqdvLHVc","title":"HAPPY - DAY6(데이식스) / 이보람 (Lee Boram) [보람씨야]","channelId":"UCz11CPccQ2AnizJrdp58Bog","channel":"보람씨야","duration":187},{"videoId":"807qH9sWxa0","title":"‘어떻게 이별까지 사랑하겠어, 널 사랑하는 거지’ 첫 번째 미리보기  #어떻게이별까지사랑하겠어 #akmu #cover","channelId":"UCz11CPccQ2AnizJrdp58Bog","channel":"보람씨야","duration":60},{"videoId":"DEdF_b1bpsw","title":"어떻게 이별까지 사랑하겠어, 널 사랑하는 거지 - AKMU(악뮤) / 이보람 (Lee Boram) [보람씨야]","channelId":"UCz11CPccQ2AnizJrdp58Bog","channel":"보람씨야","duration":290},{"videoId":"9l4XXP5Tlhk","title":"나는 반딧불 - 황가람 / 이보람 (Lee Boram) [보람씨야]","channelId":"UCz11CPccQ2AnizJrdp58Bog","channel":"보람씨야","duration":206}]};
},
"src/shared/my-concert-design.js":function(module,exports,__require){
'use strict';
// Coordinates are in the exported 1080 × 1350 poster.
const themes = {
  curtain: {label:'커튼콜', left:102, right:978, top:152, bottom:1030, centered:true},
  skyline: {label:'도시의 밤', left:84, right:996, top:82, bottom:910, dark:true},
  blossom: {label:'벚꽃 무대', left:165, right:915, top:140, bottom:934, centered:true},
  paper: {label:'종이 셋리스트', left:108, right:972, top:106, bottom:1210},
  breeze: {label:'봄빛 편지', left:126, right:954, top:178, bottom:1160, centered:true},
  spotlight: {label:'세 개의 스포트라이트', left:96, right:984, top:128, bottom:1120, dark:true, centered:true},
  pressed: {label:'장미 편지', left:120, right:960, top:330, bottom:1010, centered:true},
  ribbon: {label:'핑크 리본', left:108, right:972, top:154, bottom:1190, centered:true},
  blueTicket: {label:'블루 티켓', left:114, right:978, top:120, bottom:1160, centered:true},
  rose: {label:'로즈 티켓', left:86, right:994, top:96, bottom:1170},
  night: {label:'나이트 스테이지', left:86, right:994, top:96, bottom:1170, dark:true}
};
const fonts = {
  dodum: {label:'고운돋움', family:'"Passport Dodum", sans-serif'},
  jua: {label:'배민 주아체', family:'"Concert Jua", sans-serif'},
  yeonsung: {label:'배민 연성체', family:'"Concert Yeon Sung", serif'},
  gaegu: {label:'개구체', family:'"Concert Gaegu", cursive'},
  pen: {label:'나눔손글씨 펜', family:'"Passport Pen", cursive'},
  batang: {label:'고운바탕', family:'"Passport Batang", serif'}
};
const formats={poster:'한 장 포스터',long:'읽기 편한 긴 이미지'};
const backdrop = key => ['curtain','skyline','blossom','paper','breeze','spotlight','pressed','ribbon','blueTicket'].includes(key) ? '/images/game/concert-poster-'+key+'.png' : '';
const allowsLong=theme=>!['curtain','blossom','pressed'].includes(theme);
const outputFormat=(theme,format)=>format==='long'&&allowsLong(theme)?'long':'poster';
module.exports = {themes, fonts, formats, backdrop, allowsLong, outputFormat};


},
"src/client/my-concert-poster.js":function(module,exports,__require){
'use strict';
const {SECTIONS,chars,count}=__require("src/shared/my-concert.js");
const Show=__require("src/shared/my-concert-show.js");
const {themes,fonts,backdrop,outputFormat}=__require("src/shared/my-concert-design.js");
const W=1080,H=1350,metaFont='"Passport Dodum", sans-serif';

function wrap(ctx,text,width){
 const lines=[];let line='';
 for(const word of text.trim().split(/\s+/)){
  const next=line?line+' '+word:word;
  if(ctx.measureText(next).width<=width){line=next;continue;}
  if(line)lines.push(line);
  line='';
  if(ctx.measureText(word).width<=width || /[A-Za-z]/.test(word)){line=word;continue;}
  for(const ch of chars(word)){
   if(line && ctx.measureText(line+ch).width>width){lines.push(line);line='';}
   line+=ch;
  }
 }
 if(line)lines.push(line);
 return lines;
}

function tracks(d,songs){
 const interruptions=new Map();
 for(const v of d.vcrs||[])interruptions.set(v.after,(interruptions.get(v.after)||0)+1);
 let number=0;
 return SECTIONS.flatMap(section=>d.sections[section.id].map((id,i)=>{
  const song=Show.songInfo(id,songs);
  const feature=song.title.match(/\s*\((feat\.\s*.+)\)\s*$/i);
  const text=Show.isHidden(id)?'히든 스테이지':song.title.slice(0,feature?.index??song.title.length);
  const credit=[feature?.[1],song.artistType==='solo'?song.artistNames.join(' · '):''].filter(Boolean).join(' / ');
  return {id,text,credit,section:i===0?section.name:'',number:++number,vcr:interruptions.get(number)||0};
 }));
}

// Keep each section heading and its first song together. Choose the largest size
// that fits, retaining one column when a second column offers little benefit.
function layout(ctx,entries,area,family,{long=false,sparse=entries.length<=6}={}){
 let best;
 for(const columns of long||sparse?[1]:[1,2]){
  const width=(area.right-area.left-(columns-1)*42)/columns*(sparse?.82:1);
  for(let size=long||sparse?40:36;size>=(long?40:8);size--){
   ctx.font=size+'px '+family;
   const step=Math.ceil(size*1.28), indent=size*1.65;
   const rows=entries.map((row,i)=>{
    ctx.font=size+'px '+family;
    const lines=wrap(ctx,row.text,width-indent);
    const creditSize=Math.max(9,Math.round(size*.75)),creditStep=Math.ceil(creditSize*1.22);
    ctx.font=creditSize+'px '+family;
    const credits=row.credit?wrap(ctx,row.credit,width-indent):[];
    const gap=row.section&&i>0?(sparse?38:long?30:0):0;
    const heading=row.section?step:0;
    const height=gap+heading+Math.max(lines.length*step+credits.length*creditStep,row.vcr?step*1.65:0)+Math.ceil(size*(long?.35:.25));
    return {...row,lines,credits,creditSize,creditStep,height,heading,gap};
   });
   const total=rows.reduce((n,r)=>n+r.height,0);
   let split=rows.length,tallest=total;
   if(columns===2){
    let left=0;
    for(let i=1;i<rows.length;i++){
     left+=rows[i-1].height;
     const h=Math.max(left,total-left);
     if(h<tallest){split=i;tallest=h;}
    }
   }
   if(!long&&tallest>area.bottom-area.top)continue;
   if(!best || size>best.size+2)best={size,step,indent,width,usedHeight:tallest,columns:columns===1?[rows]:[rows.slice(0,split),rows.slice(split)]};
   break;
  }
 }
 if(!best)throw Error('글자가 포스터 영역을 넘었어요. 제목 길이를 확인해 주세요.');
 if(sparse){
  let measured=240;
  for(const row of best.columns[0]){
   ctx.font=best.size+'px '+family;
   for(const line of row.lines)measured=Math.max(measured,best.indent+ctx.measureText(line).width);
   ctx.font=row.creditSize+'px '+family;
   for(const line of row.credits)measured=Math.max(measured,best.indent+ctx.measureText(line).width);
   ctx.font=Math.min(21,Math.round(best.size*.82))+'px '+metaFont;
   if(row.section)measured=Math.max(measured,ctx.measureText(row.section).width);
  }
  best.width=Math.min(best.width,Math.ceil(measured)+2);
 }
 return best;
}

// Extend only the quiet middle of the paper; keep header/footer art in proportion.
function paintBackground(ctx,image,height){
 if(height===H){ctx.drawImage(image,0,0,W,H);return;}
 const scale=image.naturalHeight/H,cut=650,band=90,extra=height-H;
 ctx.drawImage(image,0,0,image.naturalWidth,cut*scale,0,0,W,cut);
 ctx.drawImage(image,0,cut*scale,image.naturalWidth,band*scale,0,cut,W,band+extra);
 ctx.drawImage(image,0,(cut+band)*scale,image.naturalWidth,(H-cut-band)*scale,0,cut+band+extra,W,H-cut-band);
}

function draw(canvas,d,songs,logo,background){
 canvas.width=W;canvas.height=H;
 const ctx=canvas.getContext('2d');if(!ctx)throw Error('이 브라우저에서 이미지 만들기를 사용할 수 없어요.');
 const t=themes[d.theme]||themes.rose,family=(fonts[d.font]||fonts.dodum).family;
 const ink=t.dark?'#fff7f1':'#392c34', accent=t.dark?'#e4cee3':'#75495e';
 const entries=tracks(d,songs),long=outputFormat(d.theme,d.format)==='long',sparse=entries.length<=6;
 let titleSize=entries.length>=20?46:60,lines;
 do{
  ctx.font='bold '+titleSize+'px '+family;lines=wrap(ctx,d.title.trim(),t.right-t.left);
  if(lines.length<=2)break;
  titleSize-=2;
 }while(titleSize>=30);
 const headingY=t.top+36+28+titleSize;
 const dividerY=headingY+(lines.length-1)*titleSize*1.12+(d.planner.trim()?35:0)+29;
 const top=dividerY+14;
 const fitted=layout(ctx,entries,{...t,top},family,{long,sparse}),bounds=[];
 const extra=long?Math.max(0,Math.ceil(top+fitted.usedHeight+24-t.bottom)):0;
 const height=H+extra,bottom=t.bottom+extra;
 canvas.height=height;
 if(background)paintBackground(ctx,background,height);
 else{
  const g=ctx.createLinearGradient(0,0,W,height);
  g.addColorStop(0,t.dark?'#342337':'#fff7ee');g.addColorStop(1,t.dark?'#171624':'#f6dbe4');
  ctx.fillStyle=g;ctx.fillRect(0,0,W,height);ctx.strokeStyle=t.dark?'#735066':'#d8a2b6';ctx.strokeRect(38,38,W-76,height-76);
 }
 const center=(t.left+t.right)/2,anchor=t.centered?center:t.left;
 ctx.textAlign=t.centered?'center':'left';ctx.fillStyle=accent;
 if(logo){
  const h=36,w=h*logo.naturalWidth/logo.naturalHeight;
  ctx.save();if(t.dark)ctx.filter='brightness(0) invert(1)';
  ctx.drawImage(logo,t.centered?center-w/2:anchor,t.top,w,h);ctx.restore();
 }
 ctx.font='bold '+titleSize+'px '+family;
 let y=headingY;
 ctx.fillStyle=ink;
 for(const line of lines){ctx.fillText(line,anchor,y,t.right-t.left);y+=titleSize*1.12;}
 y-=titleSize*1.12;
 if(d.planner.trim()){y+=35;ctx.font='24px '+family;ctx.fillStyle=accent;ctx.fillText('기획 · '+d.planner.trim(),anchor,y);}
 y+=29;ctx.strokeStyle=accent;ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(t.left,y);ctx.lineTo(t.right,y);ctx.stroke();
 const {size,step,indent,width}=fitted;
 ctx.textAlign='left';
 fitted.columns.forEach((rows,col)=>{
  const x=sparse?center-width/2:t.left+col*(width+42);
  let rowY=top+(sparse?Math.min(70,Math.max(0,(bottom-top-fitted.usedHeight)/3)):0);
  for(const r of rows){
   let base=rowY+r.gap;
   if(r.section){
    ctx.fillStyle=accent;ctx.font=Math.min(21,Math.round(size*.82))+'px '+metaFont;
    ctx.fillText(r.section,x,base+step*.78);base+=r.heading;
   }
   ctx.fillStyle=accent;ctx.font=Math.round(size*.73)+'px '+metaFont;
   ctx.fillText(String(r.number).padStart(2,'0'),x,base+size);
   ctx.fillStyle=ink;ctx.font=size+'px '+family;
   r.lines.forEach((line,i)=>ctx.fillText(line,x+indent,base+size+i*step,width-indent));
   ctx.fillStyle=accent;ctx.font=r.creditSize+'px '+family;
   r.credits.forEach((line,i)=>ctx.fillText(line,x+indent,base+r.lines.length*step+r.creditSize+i*r.creditStep,width-indent));
   if(r.vcr){ctx.fillStyle=accent;ctx.font=Math.round(size*.53)+'px '+metaFont;ctx.fillText('VCR'+(r.vcr>1?'×'+r.vcr:''),x,base+size+step*.55,indent-2);}
   rowY+=r.height;bounds.push({id:r.id,lines:r.lines,left:x,width,bottom:rowY});
  }
 });
 ctx.font='17px '+metaFont;ctx.fillStyle=accent;ctx.textAlign=t.centered?'center':'left';
 ctx.fillText('SEEYA ARCHIVE   ·   '+count(d)+' SONGS   ·   팬이 만든 가상 콘서트',anchor,bottom+27);
 return {width:W,height,rows:bounds,fontSize:size,columns:fitted.columns.length,contentBottom:bottom};
}

const images=new Map();
function image(src){
 if(!images.has(src))images.set(src,new Promise((resolve,reject)=>{
  const im=new Image();im.onload=()=>resolve(im);im.onerror=()=>{images.delete(src);reject(Error('포스터 이미지를 불러오지 못했어요. 다시 시도해 주세요.'));};im.src=src;
 }));
 return images.get(src);
}
async function render(canvas,d,songs){
 const bg=backdrop(d.theme);
 const [logo,background]=await Promise.all([image(__require("src/data/passport-brand.json").logo),bg?image(bg):null,
  document.fonts?.load('30px '+(fonts[d.font]||fonts.dodum).family),
  document.fonts?.load('bold 60px '+(fonts[d.font]||fonts.dodum).family),document.fonts?.load('20px '+metaFont)]);
 return draw(canvas,d,songs,logo,background);
}
function png(canvas){return new Promise((resolve,reject)=>{try{canvas.toBlob(b=>b?resolve(b):reject(Error('이미지를 만들지 못했어요. 다시 시도해 주세요.')),'image/png');}catch{reject(Error('이미지 저장을 다시 시도해 주세요.'));}});}
module.exports={wrap,layout,draw,render,png};

},
"src/data/passport-brand.json":function(module,exports,__require){
module.exports={"logo":"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAA1IAAADPCAMAAADI6BA1AAAABGdBTUEAALGPC/xhBQAAAAFzUkdCAK7OHOkAAAAbUExURUxpcWBhYWBhYWBhYWBhYWBhYWBhYWBhYWBhYdFAEKwAAAAIdFJOUwAZ0e64RGGG3E8CEgAADElJREFUeNrt3dty5CgQBNAGcdH/f/F6vRsTc3F7VKgSslDy7GjTQHIEQurXS0Vl81LOM6sVVFS8Sj3O82xqBxUVP6SexFRSIS9kg2AQqd2ZSqm21stHySrspeMVwdbmE6kPptKuaaofWcr/zRsqEcpR0UsdS23qKFJ7MpVqLwpTuFJmLHVwdfnx8dsxlZriJKYWIrUZU8qTmFqN1FZMpZ41LsXUaqT2YaoKKDH1vuRpSO3CVCoakWJqHVK/fkDb4ZJP41FMsSC1A1NNl3xi6vsRgq3EHwZ2XfOp7M3UXKSiMyWixBQbUqGZ0ipKTPEhFZmpqjtRm5W6BVJxmVKixBQlUh/RjMlU1TJKTHEiFZQpbUyIqSvL7RVIxWRKRokpb6RON6QiMqVEiSkGpN5+fDimkhIlptyRSn5IxWNKe33blrwFUuGY0h3ejUuLg9S3Hx+KqaZxJ6bIkYrFlBZSYsr/auZI3lN7IKZ09lxM+SPVnZGKxJQu+8RUBKTiMJW02yemGJD6+8dHYUq7fWIqBlJRmBJSYgqwi9UhAzEGU0JKTEVBKgZTQuoZTKUdkIrBlLb7xFQcpEIwpXtSYioOUhN+5Od20TMdYioSUvgf+dHmhMocpkiQCsCUNifEVCik6JkaOTB75FJ68ysXO+to68rFiafX2aXMYooGKXqmzPt9R+k1LYn1yu3TMsOBoaXwCR3pY0jlhB2H3EwVa6DqMikVqbsdeIMpIqTImTLe5y2Q76JI8TPFhBQ3U8k0OXTMoFak6JmiQoqbKdOLQ1EDRpGiZ4pnu4+eqU6QKEVqHlODbQhG6mXfduZlqsy4DleksEwdcKbASA0cN6BlynANC/wOihQ5U+DQDr1MiJWp618GuSBUpMiZMmUWayA9U4ngsk+RYmfKFNkGnNcjMJUYkFKkyJliRIqWqUpRf0Vq4satvRk5kWJlqjJc9ylS3EyB7yUPP13EyVSjmBEUKWamWJEiZaqhLhYUKdatWzNTrEiRMnU5Ui9FijpSOKZ4keJk6mqksiJFHikYU7xIcTKlSO0SKRRTzEhRMlUVqV0iBWKKGSlKphSpbSKFYcr05Mh0pBiZutpi2p7gj5RpeBbf770IKfRcP9QN2kTfJlI2pqrrlLsKqcUtfus76VYvfwcDmLIgVRYgRcjU5eeldCApwJzpzhQ/UoRMFedrb0VqJ6aKO3veSLn8yM+aiQ06nBUpTqYiIMXH1OVzs3oEMUD3OjOVAyDFx1RlqLgiRcmUCamKzX8gpq6/z6UpUvy968pUDKT4mCoEFVekGJlCI3W6FTKmrr/nU+/xC9C5yY+WKEjRMVUJXjumSK1h6ltbWhik2JgyTGuwyUCRImQKjJTrj66TMdWhLadI8V7Jf6tLJKTYmLI8Y9YUKfqudWIqElJ0TBm+HWg5pUitYqovQqoe585MteWzgSK1iKm3LZpIkMqX/zDqBgVoJ12RWjRH0iPVakymOrb9FCnWOZIfqXT5Tw+q1ZTpFAui6orUGqb4kTKc4QjMVFGk2Pv1IjI5AFLGP47JFGDYKFJLmKJH6rOCHL+EgWXKfyddkfIueRukXk9YTfkTq0itYKp5IHWgkXoGU+51V6QWMEWP1I/uziGZMp0/OY+mSJFHqvEiZZ64W0ymTM+beV/6KVLz50gfpDqsJX/q7cs1invSz30n/epSrtwvFds8+X4N+xymmscaYApSYZkyvlyjLfzfd0qdMuPcKWUKU4GQisuU6WaE7066IgWIVJ2AVJqCVFimjKPGc0JQpBDX1Hnk4HY6+JDyOLW46NLPtOvnOSEoUohI1W2QMlSLjCnbrp/jckqRguz8lF2QisuU8YavX+0VKUik6jZIxWXKeOlXFCnqSL2t9DKkxq25XDM2puqanXRFChOpam0EFqTKjaqRMWXcSfd6xFeRAt1FLzGROtONuh1Rf2/KdSddkQJFqlIh1W41QVimluykK1KgSH1Z7UKPVL1VOzqmViynFClUpL7qzZhIBWZqxU66IoWK1Bf1DopUZKYWnElXpGCR+pOpqEgZ+oCOqfnLKUUKFqk/Kh4WKcOahI8p23LK4Uy6IoWL1O+dGRepyExN30lXpHCR+q3mq5BK2aGHrh9CpWPKOIC6IkUcqV+YOiIjFZqpyY/4KlLASP1S9dBIGZjiW01ZH/FNihRvpH5iygepvAopQzcUukgZl1NFkeKN1E91Ly47Um0VUrGZmrqTrkhBI/WjecMjFZupmTvpihR2LJRdkLIwVfkyZVtO3dpJV6Swkfq/fd+PssKC1N8/OwdmauJOuiIFHgr9+y6iQao5xpORKeNyqilStJH6bGB+pK58dgrNlHE5lRQp1kh9MtVvr08IkArO1LSddEUKHamPFn4/5UVCKjpTadJySpGCD4S+C1LRmbItp4a/giIFj1TKq5Dq3p8dm6lXm/KLo4oUfhzUXZCKztSc5ZQitXBqjYZUeKam7KQrUuuGARqpA/DZHd7d2ExN2ElXpNZFyoTUiwGp8EwZDyYVRSpUpCIiFZ4p42hqwEjl++Uxv9UbDCnb5c31pHIyZdxJT7BI6Rfl90Wqg6JKypTtYFJRpOKUmEjFZ8q4k94UqS2Rqqh+HTl4E50p23LKfvNCkRJSsLSSMmVbTnVFSkhhkdqAKdNyyjz0FSl+pApw1I907PURmUlbvyOZUqSWlBYYKct8QMqU6TkP0P6NIiWkRq5aWZlCvo5UkRJSD2TK1APGwa9IsW858SG1A1Om5VRXpIQUFikLU22DaQ1yZEuRElKbMWXZSW+KlJDCIrUDU5ZuKIqUkEJ36gZMWbZdkyK1C1IDr3CoM5DaginDTnpTpIQUJK5jTKX4k1tRpIQU/FBrjs/U9e9gGf+KlJBCTw28TF2ntipSQgr95EV6FFNdkYrfiWOjvsxCag+mGqArFKm9kDpnIbUJU1dRPxSp6F3Ij9QeTF1tMEMAFCkh9WSmLndIVaQ4t/uAj+lMR8pympuWqeo/KShSM0vfCaktmEr+E5wi9USkvJ4M3ICpQ5GKHCkTUvYWn40U7JTczJIVqcCRMh2ciIDUDkxl91lIkRJSj2ZKkQocqQ2RskwTBydThyIVN1I0SHk+FGhgqlPOc6ciFTZS2233bcFUVaTiRgqN1KK3KgdnqitSYSPFg1Rb0j2kTAGe7lCktJK6eekUmal6KlJRI7UtUrGZQjSbIvU0pNK6mZ6OKUPVFSkhNa+ZwjJluVOohzuE1LxzQWGZKpBOUaSE1EOZSqZ57qVIhUUqR0MqKFPJ9sPyipSQmtlIAZlqlj7RG5IehtT616pEYyq1fNqK3uMnpOa2UQ7EVGrlOK1Fb5vVSmruY4ANMGdU/9J6H4iTbXficqQ6vrR7kSoTqjg0JNOJRSoTXHQlf6bS0NgHFcAvd8wo79q68LRsAyobdyWFYaoTJco0GSlSoCvqMaRaTKQATFEhhfgVREVqWCkapLDrYW+mqJAynd5XpMBKVXBkOZByZ4oLqa5IESn1EKS8maJCynTdp0iBlaoHNrEsSDkzxYWU7SVtihRWqccgZYKlx0KqKlI8Sj0HKVemuJAyvlpAkYIqVXA9x4aUJ1NcSDVFikepJyFlG0vJ7VYe2UpKkcIqRYPUOeWMZncap4UqUlWR4mldMFKJCyk3priQ6i9FikephyHlxRQVUvZtWEUKpxQPUmVOokyjqbqcNyG8b6JI4dr3cUiZvnIJgVR/KVI8SoFP9xEiZYO5OtgO3+1LihSRUpZ6F+S65ajTIuXAFBNSQ0+YKVIopSrqg4mRMn3rr5POhNTYXKRIoZSiQeqciNR9pkr0RClSKKWeidRtpoiQGr1eVqRASj0UqbtMlfCJUqRASj0VqZtM8SA1/u4bRQqj1GORuscUTV+X8Vt5ihSEEzRSBzKv65hiQeq4855VRQqilOWV25shdYcpkq4utxpNkUJ40s7xmTo6UjaiK9/pvuPmq8AVKYRSj0bK9PULW08f/e6BSEUKoNSzkbJ9/0qF1FHuz0GKFECphyNl+lnpQtTRR/doL0XKX6mnIzXI1GqkcvN5BkaR8leKB6lVv7k1xNTSfs69ej1Upki5K8WDVH694jC1DqnDMU+KFECpJKSGmCqr4tScn3lWpLyVat4fGBAp28st6xqkjtJbBbxCQJFyVkpImZshWxegN8bYkXMp/d8swd7HESFSB02pzkilXZGyMvUPd42NHc7RGbMAAAAASUVORK5CYII="};
},
"src/client/concert-diary.js":function(module,exports,__require){
'use strict';
const C=__require("src/shared/concert-diary.js"),P=__require("src/shared/passport.js"),Save=__require("src/shared/passport-play-save.js"),Poster=__require("src/client/my-concert-poster.js");
async function save(d,songs){
 const concertPoster=C.snapshot(d,songs),json=JSON.stringify(concertPoster);
 const hash=Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(json)))).map(v=>v.toString(16).padStart(2,'0')).join('');
 const at=new Date(),record=P.entry({entryId:'concert-'+hash,kind:'play',status:'done',date:P.today(),title:d.title,members:['seeya'],play:{game:'other',level:'나만의 씨야 콘서트',mode:Object.values(d.sections).flat().length+'곡',source:'result'},note:'직접 구성한 가상 콘서트의 셋리스트와 포스터입니다.',concertPoster,createdAt:at.toISOString(),updatedAt:at.toISOString()});
 const task=()=>Save.save(localStorage,record);
 return navigator.locks?navigator.locks.request('seeya-passport-save',task):task();
}
async function mount(host,value,download){
 host.innerHTML='<h3>나의 콘서트 포스터</h3><p role="status">포스터를 불러오고 있어요.</p>';
 try{
  const recipe=C.clean(value),canvas=document.createElement('canvas');await Poster.render(canvas,recipe.draft,recipe.songs);if(!host.isConnected)return;
  canvas.setAttribute('role','img');canvas.setAttribute('aria-label',recipe.draft.title+' 콘서트 셋리스트 포스터');canvas.style.cssText='width:100%;height:auto;display:block;border-radius:12px';
  host.querySelector('p').textContent='저장 당시의 셋리스트와 디자인입니다. 다이어리 백업에도 함께 포함돼요.';host.append(canvas);
  const button=document.createElement('button');button.type='button';button.textContent='콘서트 포스터 저장';host.append(button);
  button.onclick=async()=>{button.disabled=true;try{download(await Poster.png(canvas),'seeya-diary-concert.png');}catch(e){host.querySelector('p').textContent=e.message;}finally{button.disabled=false;}};
 }catch(e){if(host.isConnected)host.querySelector('p').textContent='포스터를 불러오지 못했어요. '+e.message;}
}
module.exports={save,mount};

},
"src/shared/concert-diary.js":function(module,exports,__require){
'use strict';
const D=__require("src/shared/my-concert-design.js");
const sections={opening:3,main:25,encore:4};
function clean(value){
 if(!value||value.version!==1)throw Error('콘서트 포스터 형식을 확인해 주세요.');
 const text=(v,max)=>{if(typeof v!=='string'||v.length>max)throw Error('콘서트 포스터 내용을 확인해 주세요.');return v;};
 const d=value.draft;if(!d||!Object.hasOwn(D.themes,d.theme)||!Object.hasOwn(D.fonts,d.font))throw Error('포스터 배경·글꼴을 확인해 주세요.');
 const ids=[];const checked={};
 for(const [key,max] of Object.entries(sections)){
  const list=d.sections?.[key];if(!Array.isArray(list)||!list.length||list.length>max)throw Error('포스터 곡 수를 확인해 주세요.');
  checked[key]=list.map(id=>{text(id,100);if(!/^[-a-zA-Z0-9]+$/.test(id)||ids.includes(id))throw Error('포스터 곡 정보를 확인해 주세요.');ids.push(id);return id;});
 }
 if(!Array.isArray(value.songs)||value.songs.length>32)throw Error('포스터 곡 목록을 확인해 주세요.');
 const songs=value.songs.map(s=>({id:text(s.id,100),title:text(s.title,300),artistType:s.artistType==='solo'?'solo':'group',artistNames:Array.isArray(s.artistNames)&&s.artistNames.length<=4?s.artistNames.map(n=>text(n,100)):[]}));
 if(new Set(songs.map(s=>s.id)).size!==songs.length||ids.some(id=>!/^hidden-[0-9a-z-]+$/.test(id)&&!songs.some(s=>s.id===id)))throw Error('포스터의 곡 제목이 빠져 있어요.');
 if(!Array.isArray(d.vcrs)||d.vcrs.length>64||d.vcrs.some(v=>!Number.isInteger(v.after)||v.after<1||v.after>=ids.length))throw Error('포스터 VCR 위치를 확인해 주세요.');
 return {version:1,draft:{title:text(d.title,120),planner:text(d.planner,80),theme:d.theme,font:d.font,format:D.outputFormat(d.theme,d.format),sections:checked,vcrs:d.vcrs.map(v=>({after:v.after}))},songs};
}
function snapshot(d,songs){const ids=Object.values(d.sections).flat();return clean({version:1,draft:d,songs:songs.filter(s=>ids.includes(s.id))});}
module.exports={clean,snapshot};

},
"src/shared/passport.js":function(module,exports,__require){
'use strict';
const G=__require("src/shared/passport-goods.js"),Play=__require("src/shared/passport-play.js"),Concert=__require("src/shared/concert-diary.js");
const KEY='seeya-passport-v1';
const DEBUT='2006-03-12';
const defaultStatus=(date,day=today())=>date&&date<day.slice(0,date.length)?'done':'planned';
const beforeDebut=since=>!!since&&since<DEBUT.slice(0,since.length);
const KINDS={concert:'공연 관람',visit:'장소 방문',event:'팬 행사',story:'나의 씨야 이야기',goods:'굿즈 구매',play:'씨야 플레이'};
const MEMBERS={seeya:'씨야 완전체',gyuri:'남규리',yeonji:'김연지',boram:'이보람'};
const COLORS={rose:'#ac365f',violet:'#6856af',teal:'#267866',ink:'#29242d'};
const esc=x=>String(x??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const today=()=>new Intl.DateTimeFormat('sv-SE',{timeZone:'Asia/Seoul'}).format(new Date());
function text(x,max=200){if(typeof x!=='string'||x.length>max)throw Error('글자 수나 입력 형식이 맞지 않습니다.');return x.trim();}
function date(value){
 if(value==='')return '';
 if(typeof value!=='string'||!/^\d{4}(-\d{2}){0,2}$/.test(value))throw Error('날짜 형식을 확인해 주세요.');
 const [y,m,d]=value.split('-').map(Number);if(y<1900||y>2100||m!==undefined&&(m<1||m>12)||d!==undefined&&(d<1||d>new Date(Date.UTC(y,m,0)).getUTCDate()))throw Error('실제 존재하는 날짜를 입력해 주세요.');return value;
}
const precision=d=>['none','year','month','day'][d?d.split('-').length:0];
const dateLabel=d=>d?d.split('-').map((x,i)=>Number(x)+['년','월','일'][i]).join(' '):'날짜 미상';
function profile(p={},allowLegacy=false){if(!p||typeof p!=='object'||Array.isArray(p))throw Error('신분 카드 형식이 올바르지 않습니다.');const since=date(p.since||'');if(!allowLegacy&&beforeDebut(since))throw Error('처음 좋아한 날은 데뷔일인 2006년 3월 12일부터 입력할 수 있어요.');if(since>today().slice(0,since.length))throw Error('입덕일은 오늘 이전으로 입력해 주세요.');return {nickname:text(p.nickname||'',30),since,motto:text(p.motto||'',120),favMember:Object.hasOwn(MEMBERS,p.favMember)?p.favMember:'seeya',favSong:text(p.favSong||'',160),color:Object.hasOwn(COLORS,p.color)?p.color:'rose'};}
function entry(e){
 if(!e||typeof e!=='object'||!Object.hasOwn(KINDS,e.kind)||!['planned','done'].includes(e.status)||typeof e.entryId!=='string'||!/^[-a-zA-Z0-9]{8,80}$/.test(e.entryId))throw Error('기록 형식이 올바르지 않습니다.');
 const title=text(e.title,160);if(!title)throw Error('제목을 입력해 주세요.');
 const dt=date(e.date||'');if(!Array.isArray(e.members)||e.members.length>4||e.members.some(m=>!Object.hasOwn(MEMBERS,m)))throw Error('멤버 정보가 올바르지 않습니다.');
 if(e.status==='done'&&dt>today().slice(0,dt.length))throw Error('미래 날짜는 예정 상태로 저장해 주세요.');
 const time=text(e.time||'',5);if(time&&!/^([01]\d|2[0-3]):[0-5]\d$/.test(time))throw Error('시간을 확인해 주세요.');
 for(const k of ['createdAt','updatedAt'])if(typeof e[k]!=='string'||!/^\d{4}-/.test(e[k])||!Number.isFinite(Date.parse(e[k])))throw Error('기록 저장 시각이 올바르지 않습니다.');
 const snap=e.snapshot||{};
 const songs=e.songs||[],links=e.links||[];
 if(!Array.isArray(songs)||songs.length>400||songs.some(s=>typeof s!=='string'||s.length>180))throw Error('곡 목록을 확인해 주세요.');
 if(!Array.isArray(links)||links.length>8)throw Error('링크는 최대 8개까지 저장할 수 있어요.');
 const checkedLinks=links.map(l=>{const raw=text(l.url,2000),u=new URL(raw);if(u.protocol!=='https:'||u.username||u.password)throw Error('링크는 https:// 주소로 입력해 주세요.');return {url:u.href,label:text(l.label||'',120)};});
 return {entryId:e.entryId,kind:e.kind,status:e.status,title,date:dt,datePrecision:precision(dt),time,members:[...new Set(e.members)],eventId:text(e.eventId||'',160),placeId:text(e.placeId||'',160),archiveId:text(e.archiveId||'',160),songs:e.kind==='concert'?[...new Set(songs)]:[],links:checkedLinks,seat:text(e.seat||'',100),companions:text(e.companions||'',120),note:text(e.note||'',4000),...(e.kind==='goods'?{goods:G.clean(e.goods)}:{}),...(e.kind==='play'?{play:Play.clean(e.play),...(e.concertPoster?{concertPoster:Concert.clean(e.concertPoster)}:{})}:{}),snapshot:{title:text(snap.title||'',300),place:text(snap.place||'',300),address:text(snap.address||'',400)},createdAt:e.createdAt,updatedAt:e.updatedAt};
}
function validate(input,allowLegacyProfile=false){
 if(!input||input.schemaVersion!==1||!Array.isArray(input.entries)||input.entries.length>2000)throw Error('지원하지 않는 백업이거나 기록이 2,000건을 넘습니다.');
 const entries=input.entries.map(entry);if(new Set(entries.map(e=>e.entryId)).size!==entries.length)throw Error('파일 안에 동일한 기록 ID가 반복됩니다.');
 return {schemaVersion:1,profile:profile(input.profile,allowLegacyProfile),entries};
}
const empty=()=>({schemaVersion:1,profile:profile(),entries:[]});
function duplicate(a,b){if(a.kind==='goods'||b.kind==='goods')return a.kind===b.kind&&a.date===b.date&&G.same(a,b);return a.kind===b.kind&&a.date===b.date&&a.time===b.time&&((a.eventId&&a.eventId===b.eventId)||(a.archiveId&&a.archiveId===b.archiveId)||(a.placeId&&a.placeId===b.placeId)||(!a.eventId&&!a.placeId&&!b.eventId&&!b.placeId&&a.title===b.title));}
function review(current,incoming){return {added:incoming.entries.filter(e=>!current.entries.some(x=>x.entryId===e.entryId)).length,conflicts:incoming.entries.filter(e=>current.entries.some(x=>x.entryId===e.entryId)).length,suspected:incoming.entries.filter(e=>current.entries.some(x=>x.entryId!==e.entryId&&duplicate(x,e))).length};}
function merge(current,incoming,replace=false,replaceProfile=false){const rows=new Map(current.entries.map(e=>[e.entryId,e]));for(const e of incoming.entries)if(replace||!rows.has(e.entryId))rows.set(e.entryId,e);return validate({schemaVersion:1,profile:replaceProfile?incoming.profile:current.profile,entries:[...rows.values()]});}
function completed(e,day=today()){return e.status==='done'&&(!e.date||e.date<=day.slice(0,e.date.length));}
function summary(entries,day=today()){const done=entries.filter(e=>completed(e,day));return {concert:done.filter(e=>e.kind==='concert').length,visit:done.filter(e=>e.kind==='visit').length,event:done.filter(e=>e.kind==='event').length,story:done.filter(e=>e.kind==='story').length,goods:done.filter(e=>e.kind==='goods').length,play:done.filter(e=>e.kind==='play').length};}
function storage(adapter){let raw=adapter.getItem(KEY),state=raw?validate(JSON.parse(raw),true):empty();return {get:()=>state,raw:()=>raw,save(next){const checked=validate(next);if(adapter.getItem(KEY)!==raw)throw Error('다른 창에서 수첩이 변경됐습니다. 입력 내용을 복사한 뒤 새로고침해 주세요.');const value=JSON.stringify(checked);adapter.setItem(KEY,value);raw=value;state=checked;return state;}};}
module.exports={KEY,DEBUT,defaultStatus,beforeDebut,KINDS,MEMBERS,COLORS,esc,today,date,precision,dateLabel,profile,entry,validate,empty,duplicate,review,merge,completed,summary,storage};

},
"src/shared/passport-goods.js":function(module,exports,__require){
'use strict';
function clean(value={}){
 if(!value||typeof value!=='object'||Array.isArray(value))throw Error('굿즈 정보를 확인해 주세요.');
 const str=(v,max)=>{if(typeof v!=='string'||v.length>max)throw Error('굿즈 정보의 글자 수를 확인해 주세요.');return v.trim();};
 const quantity=value.quantity??1,amount=value.amount??null;
 if(!Number.isInteger(quantity)||quantity<1||quantity>999)throw Error('수량은 1~999개의 정수로 입력해 주세요.');
 if(amount!==null&&(!Number.isInteger(amount)||amount<0||amount>999999999))throw Error('결제금액은 0~999,999,999원의 정수로 입력해 주세요.');
 return {catalogId:str(value.catalogId||'',80),quantity,amount,shop:str(value.shop||'',160),variant:str(value.variant||'',100)};
}
function same(a,b){
 const x=a.goods||{},y=b.goods||{};
 return (x.catalogId&&y.catalogId?x.catalogId===y.catalogId:a.title===b.title)&&(x.variant||'')===(y.variant||'')&&(x.shop||'')===(y.shop||'');
}
function totals(entries,day=new Intl.DateTimeFormat('sv-SE',{timeZone:'Asia/Seoul'}).format(new Date())){const rows=entries.filter(e=>e.kind==='goods'&&e.status==='done'&&(!e.date||e.date<=day.slice(0,e.date.length)));return {records:rows.length,quantity:rows.reduce((n,e)=>n+(e.goods?.quantity||1),0)};}
function eventValues(event){return {eventId:event.id,placeId:event.placeId||'',archiveId:event.archiveId||'',snapshot:{title:event.title,place:event.venue||'',address:''}};}
module.exports={clean,same,totals,eventValues};

},
"src/shared/passport-play.js":function(module,exports,__require){
'use strict';
const GAMES={lyrics:'가사 보고 제목 맞히기',exam:'씨야 모의고사',other:'기타 씨야 플레이'};
function clean(p={}){
 if(!p||typeof p!=='object'||!Object.hasOwn(GAMES,p.game))throw Error('플레이 종류를 선택해 주세요.');
 const text=(s,n)=>{if(typeof s!=='string'||s.length>n)throw Error('플레이 정보를 확인해 주세요.');return s.trim();};
 const number=v=>{if(v==null||v==='')return null;if(!Number.isInteger(v)||v<0||v>10000)throw Error('점수·정답 수는 0 이상의 정수로 입력해 주세요.');return v;};
 const score=number(p.score),maxScore=number(p.maxScore),correct=number(p.correct),total=number(p.total);
 if((score!==null&&maxScore===null)||maxScore===0||score>maxScore)throw Error('점수와 만점을 함께 확인해 주세요.');
 if((correct!==null&&total===null)||total===0||correct>total)throw Error('정답 수와 전체 문항 수를 함께 확인해 주세요.');
 return {game:p.game,level:text(p.level||'',80),mode:text(p.mode||'',30),score,maxScore,correct,total,source:p.source==='result'?'result':'manual'};
}
function summary(p){if(!p)return '';return [p.level,p.mode,p.score==null?'':`${p.score} / ${p.maxScore}점`,p.correct==null?'':`정답 ${p.correct} / ${p.total}개`].filter(Boolean).join(' · ');}
module.exports={GAMES,clean,summary};

},
"src/shared/passport-play-save.js":function(module,exports,__require){
'use strict';
const P=__require("src/shared/passport.js"),Play=__require("src/shared/passport-play.js");
const PREF='seeya-passport-play-auto-v1';
const enabled=adapter=>adapter.getItem(PREF)==='true';
const preference=(adapter,value)=>adapter.setItem(PREF,value?'true':'false');
function result(id,details,at=new Date()){
 const play=Play.clean({...details,source:'result'}),date=new Intl.DateTimeFormat('sv-SE',{timeZone:'Asia/Seoul'}).format(at),time=new Intl.DateTimeFormat('en-GB',{timeZone:'Asia/Seoul',hour:'2-digit',minute:'2-digit'}).format(at);
 return P.entry({entryId:'play-'+id,kind:'play',status:'done',title:Play.GAMES[play.game]+(play.level?' · '+play.level:''),date,time,members:['seeya'],play,snapshot:{},createdAt:at.toISOString(),updatedAt:at.toISOString()});
}
// Read the newest notebook on each save. A result ID belongs to one completed run.
function save(adapter,record){
 const checked=P.entry(record),store=P.storage(adapter),state=store.get();
 if(state.entries.some(e=>e.entryId===checked.entryId))return {id:checked.entryId,already:true};
 store.save({...state,entries:[...state.entries,checked]});return {id:checked.entryId,already:false};
}
module.exports={PREF,enabled,preference,result,save};

},
"src/client/my-concert-specials.js":function(module,exports,__require){
'use strict';
const Show=__require("src/shared/my-concert-show.js");
const M=__require("src/shared/my-concert.js");
module.exports=function specials({root,$,esc,getDraft,getSongs,getTarget,apply,announce}){
 const dialog=$('mcSpecial'),fields=$('mcSpecialFields');
 let kind,slot,vIndex,selectedVideo,page=1;
 const pageSize=6;
 function options(items,selected){return items.map(([v,name])=>'<option value="'+esc(v)+'"'+(v===selected?' selected':'')+'>'+esc(name)+'</option>').join('');}
 function durationLabel(seconds){
  if(!Number.isInteger(seconds)||seconds<=0)return '길이 미확인';
  const mins=Math.floor(seconds/60);
  return (mins>=60?Math.floor(mins/60)+':'+String(mins%60).padStart(2,'0'):mins)+':'+String(seconds%60).padStart(2,'0');
 }
 function filterSongs(){
  const query=$('mcCandidateSearch').value.trim().toLocaleLowerCase(),artist=$('mcCandidateArtist').value;
  let visible=0;
  for(const label of fields.querySelectorAll('[data-candidate-artist]')){
   label.hidden=!!((artist&&label.dataset.candidateArtist!==artist)||!label.textContent.toLocaleLowerCase().includes(query));
   if(!label.hidden)visible++;
  }
  $('mcCandidateMatches').textContent=visible?'검색 결과 '+visible+'곡':'일치하는 후보곡이 없어요.';
 }
 function renderVcr(){
  const query=$('mcVcrSearch').value.trim().toLocaleLowerCase(), channel=$('mcBrowseChannel').value;
  const type=$('mcBrowseType').value;
  const list=Show.vcrLibrary.filter(v=>(!type||Show.vcrType(v)===type)&&(!channel||channel===v.channelId)&&[v.title,v.channel,Show.media.channels[v.channelId]].join(' ').toLocaleLowerCase().includes(query));
  const pages=Math.max(1,Math.ceil(list.length/pageSize));
  page=Math.min(pages,Math.max(1,page));
  $('mcVcrMatches').textContent=list.length+'편'+(list.length?' · '+page+' / '+pages+' 페이지':'');
  $('mcVcrList').innerHTML=list.slice((page-1)*pageSize,page*pageSize).map(v=>'<button type="button" class="mc-vcr-choice" data-video="'+v.videoId+'" aria-pressed="'+(v.videoId===selectedVideo)+'"><img src="https://i.ytimg.com/vi/'+v.videoId+'/mqdefault.jpg" alt="" loading="lazy"><span><small>'+esc(v.channel)+' · '+Show.vcrTypes[Show.vcrType(v)]+' · '+durationLabel(v.duration)+'</small><strong>'+esc(v.title)+'</strong></span><i aria-hidden="true">'+(v.videoId===selectedVideo?'✓':'')+'</i></button>').join('')||'<p>검색 결과가 없어요. 다른 제목이나 채널을 골라주세요.</p>';
  $('mcVcrPrev').disabled=page===1;$('mcVcrNext').disabled=page===pages;
  $('mcVcrNav').hidden=pages<=1;
  const selected=Show.media.vcr.find(v=>v.videoId===selectedVideo);
  $('mcVcrSelected').textContent=selected?'선택한 영상 · '+selected.title:'VCR에 담을 영상을 선택해 주세요.';
 }
 function displayChoices(){
  const mode=$('mcMode').value;
  fields.querySelectorAll('[data-for]').forEach(el=>el.hidden=el.dataset.for!==mode);
  if(kind==='vcr'&&mode==='random'){
   const n=Show.randomVcrs($('mcChannel').value,$('mcRandomType').value).length;
   $('mcRandomCount').textContent=n?'추첨 후보 '+n+'편':'후보가 없어요. 다른 채널이나 유형을 선택해 주세요.';
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
   const destination=M.find(d,id)?.id||getTarget();
   const selected=d.sections[destination].length<M.SECTIONS.find(s=>s.id===destination).limit||id?destination:M.SECTIONS.find(s=>d.sections[s.id].length<s.limit)?.id;
   fields.innerHTML='<label>담을 구간<select id="mcDestination">'+M.SECTIONS.map(s=>'<option value="'+s.id+'"'+(selected===s.id?' selected':'')+(d.sections[s.id].length>=s.limit&&(!id||s.id!==destination)?' disabled':'')+'>'+s.ko+' · '+d.sections[s.id].length+' / '+s.limit+'</option>').join('')+'</select></label><label>추첨 범위<select id="mcMode">'+options([['all','전체 랜덤'],['album','앨범별 랜덤'],['custom','직접 고른 곡 중 랜덤']],range.mode)+'</select></label><label data-for="album">앨범<select id="mcHiddenAlbum">'+options([...albums],range.album)+'</select></label><div data-for="custom"><div class="mc-vcr-filters"><label>후보 검색<input type="search" id="mcCandidateSearch" placeholder="곡명, 아티스트 또는 앨범"></label><label>아티스트<select id="mcCandidateArtist">'+options([['','전체 아티스트'],...[...new Set(Show.checkedSongs(songs).map(s=>s.artistNames.join(' · ')))].map(a=>[a,a])],'')+'</select></label></div><p id="mcCandidateMatches" role="status"></p><fieldset class="mc-candidates"><legend>후보곡 선택</legend>'+Show.checkedSongs(songs).map(s=>'<label data-candidate-artist="'+esc(s.artistNames.join(' · '))+'"><input type="checkbox" value="'+esc(s.id)+'"'+(range.ids?.includes(s.id)?' checked':'')+'> <span><strong>'+esc(s.title)+'</strong><small>'+esc(s.artistNames.join(' · '))+' · '+esc(s.albumTitle)+'</small></span></label>').join('')+'</fieldset></div><p id="mcCandidateCount"></p>';
   filterSongs();
  }else{
   const v=d.vcrs?.[index]||{mode:'fixed',after:gap},media=Show.media;
   fields.innerHTML='<label>위치<select id="mcGap">'+options(Array.from({length:Math.max(0,M.count(d)-1)},(_,i)=>[i+1,(i+1)+'번 노래 뒤 · '+(i+2)+'번 노래 앞']),v.after)+'</select></label><label>영상 선택<select id="mcMode">'+options([['fixed','직접 선택'],['random','채널에서 랜덤'],['link','YouTube 링크 입력']],v.mode)+'</select></label><div data-for="fixed"><div class="mc-vcr-filters"><label>영상 검색<input type="search" id="mcVcrSearch" placeholder="제목 또는 채널명"></label><label>채널<select id="mcBrowseChannel">'+options([['','전체 채널'],...Object.entries(media.channels)],'')+'</select></label><label>유형<select id="mcBrowseType">'+options([['','전체 유형'],...Object.entries(Show.vcrTypes)],'')+'</select></label></div><p id="mcVcrMatches" aria-live="polite"></p><div id="mcVcrList"></div><nav id="mcVcrNav" aria-label="VCR 목록 페이지"><button type="button" id="mcVcrPrev" data-vpage="-1">이전</button><button type="button" id="mcVcrNext" data-vpage="1">다음</button></nav><p id="mcVcrSelected" role="status"></p></div><label data-for="link">YouTube 영상 주소<input id="mcVideoLink" type="url" placeholder="https://youtu.be/…" value="'+(v.mode==='link'?'https://youtu.be/'+esc(v.value):'')+'"></label><label data-for="random">채널<select id="mcChannel">'+options([['all','전체 채널'],...Object.entries(media.channels)],v.value)+'</select></label><div data-for="random"><label>랜덤 유형<select id="mcRandomType">'+options([['recommended','전체 (홍보·예고 제외)'],...Object.entries(Show.vcrTypes)],v.type||'recommended')+'</select></label><p id="mcRandomCount" role="status"></p></div>';
  }
  dialog.classList.toggle('mc-vcr-dialog',type==='vcr');
  if(type==='vcr'){selectedVideo=vIndex!==null&&d.vcrs[vIndex].mode==='fixed'?d.vcrs[vIndex].value:'';page=Math.max(1,1+Math.floor(Show.vcrLibrary.findIndex(v=>v.videoId===selectedVideo)/pageSize));renderVcr();if(M.count(d)<2)$('mcSpecialError').textContent='노래를 두 곡 이상 담으면 그 사이에 VCR을 넣을 수 있어요.';}
  displayChoices();dialog.showModal();
 }
 fields.addEventListener('input',event=>{if(event.target.id==='mcCandidateSearch')filterSongs();if(event.target.id==='mcVcrSearch'){page=1;renderVcr();}});
 fields.addEventListener('change',event=>{
  if(event.target.id==='mcCandidateArtist')filterSongs();
  if(['mcBrowseChannel','mcBrowseType'].includes(event.target.id)){page=1;renderVcr();}else displayChoices();
 });
 fields.addEventListener('click',event=>{
  const b=event.target.closest('button');if(!b)return;
  if(b.dataset.vpage){page+=Number(b.dataset.vpage);renderVcr();$('mcVcrList').querySelector('button')?.focus();}
  if(b.dataset.video){selectedVideo=b.dataset.video;renderVcr();$('mcVcrList').querySelector('[aria-pressed="true"]')?.focus();}
 });
 function commit(){
  const d=JSON.parse(JSON.stringify(getDraft()));
  if(kind==='hidden'){
   const dest=$('mcDestination').value, section=d.sections[dest];
   if(!section)throw Error('빈자리가 있는 구간을 선택해 주세요.');
   const max=M.SECTIONS.find(s=>s.id===dest).limit;
   if(!slot&&section.length>=max)throw Error('선택한 구간이 가득 찼어요. 추가할 구간을 바꿔주세요.');
   let id=slot;
   if(!id){let n=1;while(d.hidden['hidden-'+n])n++;id='hidden-'+n;section.push(id);}
   if(slot && !section.includes(id)){if(section.length>=max)throw Error('선택한 구간이 가득 찼어요.');const from=M.find(d,id);d.sections[from.id].splice(d.sections[from.id].indexOf(id),1);section.push(id);}
   Show.alignVcrs(getDraft(),d);
   d.hidden[id]=Show.config(readRange(),getSongs());
  }else{
   const mode=$('mcMode').value;
   if(!$('mcGap').value)throw Error('먼저 노래를 두 곡 이상 담아 주세요.');
   const value=mode==='link'?Show.youtubeId($('mcVideoLink').value):mode==='fixed'?selectedVideo:$('mcChannel').value;
   if(!value)throw Error(mode==='link'?'개별 YouTube 영상 주소를 확인해 주세요.':'영상을 선택해 주세요.');
   const type=mode==='random'?$('mcRandomType').value:undefined;
   if(mode==='random'&&!Show.randomVcrs(value,type).length)throw Error('선택한 채널과 유형에 맞는 영상이 없어요.');
   const next=Show.vcrConfig({after:Number($('mcGap').value),mode,value,type});
   if(vIndex===null)d.vcrs.push(next);else d.vcrs[vIndex]=next;
  }
  Show.session(d,getSongs(),()=>0.5);
  apply(d,kind==='hidden'?$('mcDestination').value:null);dialog.close();announce('공연 구성을 저장했어요.');
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
  if(number>=M.count(d) && !d.vcrs?.some(v=>v.after===number))return '';
  const rows=(d.vcrs||[]).map((v,i)=>({v,i})).filter(x=>x.v.after===number);
  return rows.map(({i},n)=>'<li class="mc-interlude" draggable="true" data-vcr="'+i+'"><span class="mc-grip" title="잡아서 순서 바꾸기" aria-hidden="true">⠿</span><strong>VCR 재생</strong> <button data-special="vcr" data-vindex="'+i+'">설정·위치</button> '+(n?'<button data-special="upVcr" data-vindex="'+i+'">위로</button> ':'')+'<button data-special="deleteVcr" data-vindex="'+i+'">삭제</button></li>').join('')+'<li class="mc-vcr-add"><button data-special="vcr" data-gap="'+number+'">+ VCR 추가</button></li>';
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
 function close(){root.classList?.remove('mc-when-playing');active=false;destroy();$('mcWatch').hidden=true;queue=[];}
 const sectionName={opening:'오프닝',main:'본 무대',encore:'앙코르'};
 const trackCount=()=>queue.filter(e=>e.kind!=='vcr').length;
 function controls(){
  let section='';
  $('mcQueue').innerHTML=queue.map((e,i)=>{
   let heading='';if(section!==e.section){section=e.section;heading='<h3>'+sectionName[section]+'</h3>';}
   return heading+'<button data-queue="'+i+'"'+(i===index?' aria-current="step"':'')+'>'+esc(e.kind==='vcr'?'VCR':String(e.number).padStart(2,'0'))+' · '+esc(e.label)+(i===index?(playing?' · 재생 중':' · 현재 항목'):'')+(failed.has(i)?' · '+esc(failed.get(i)):!e.videos.length?' · 영상 준비 중':'')+'</button>';
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
  $('mcNow').textContent=sectionName[e.section]+' · '+(e.kind==='vcr'?e.after+'번째 곡 뒤 VCR':e.number+' / '+trackCount()+'곡');
  $('mcPlayingTitle').textContent=(e.kind==='hidden'?'히든 스테이지 공개 · ':'')+e.title;
  const sourceLabels={broadcast:'방송 무대',live:'공식 라이브',tour:'20주년 투어 직캠',official:'공식 영상'};
  $('mcPlayingCredit').textContent=[e.kind==='vcr'?'VCR':sourceLabels[v?.kind],v?.channel,v?.title!==e.title?v?.title:''].filter(Boolean).join(' · ');
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
     if(event.data===1){if(current().kind==='vcr'&&current().config.mode==='link'){
       const title=event.target.getVideoData()?.title;if(title)$('mcPlayingTitle').textContent=title;
     }playing=true;ended=false;failed.delete(index);status('재생 중');controls();}
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
  if(!current().videos.length){destroy();describe();controls();status('영상 준비 중 · 다음 항목을 선택해 주세요.');return;}
  status('영상을 연결하고 있어요.');requestVideo();
 }
 function start(fresh){
  const d=getShow();
  if(fresh||!queue.length)queue=Show.session(d,getSongs());
  root.classList?.add('mc-when-playing');failed.clear();active=true;finished=false;
  $('mcWatchTitle').textContent=d.title;$('mcWatch').hidden=false;$('mcResult').hidden=true;
  const i=nextPlayable(0,1);if(i===queue.length){finish();return;}select(i);$('mcWatchTitle').focus();
 }
 function summary(d,songs){
  const rows=Show.rows(d),hidden=rows.filter(r=>r.kind==='hidden').length,vcr=rows.filter(r=>r.kind==='vcr').length;
  const connected=rows.filter(r=>r.kind==='song'&&Show.performanceVideos(r.id).length).length;
  let problem='';try{Show.session(d,songs,()=>0.5);}catch(e){problem=e.message;}
  $('mcCoverage').textContent=problem||('지정곡 '+(rows.filter(e=>e.kind==='song').length)+'곡 중 영상 연결 '+connected+'곡 · 히든 스테이지 '+hidden+'개 · VCR '+vcr+'개'+(!connected&&!hidden&&!vcr?' · 연결된 영상이 없어요.':''));
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

},
"src/client/my-concert-drag.js":function(module,exports,__require){
'use strict';
module.exports=function initDrag({root,getDraft,mutate}){
 let source,mark,touch,frame;
 function clearMark(){if(mark)mark.element.classList.remove('mc-drop-'+mark.side);mark=null;}
 function cancel(){
  if(frame)cancelAnimationFrame(frame);frame=null;touch=null;
  source?.classList.remove('mc-lifted');source=null;clearMark();
 }
 function locate(element,y){
  clearMark();
  const section=element?.closest('[data-destination]');
  if(!section||!root.contains(section))return;
  if(source?.hasAttribute('data-vcr')){
   const rows=[...root.querySelectorAll('[data-track],[data-vcr]')].filter(r=>r!==source);
   const local=rows.filter(r=>section.contains(r));
   const next=local.find(row=>{const box=row.getBoundingClientRect();return y<box.top+box.height/2;});
   const last=local.at(-1);if(!next&&!last)return;
   const target=next||last,side=next?'before':'after',cut=rows.indexOf(target)+(next?0:1),prefix=rows.slice(0,cut);
   const after=prefix.filter(r=>r.hasAttribute('data-track')).length;
   const previous=prefix.map(r=>r.hasAttribute('data-track')).lastIndexOf(true);
   const to=prefix.slice(previous+1).filter(r=>r.hasAttribute('data-vcr')).length;
   mark={element:target,side,after,to};target.classList.add('mc-drop-'+side);return;
  }
  const tracks=[...section.querySelectorAll('[data-track]')];
  const next=tracks.find(row=>{const box=row.getBoundingClientRect();return y<box.top+box.height/2;});
  const side=next?'before':'after', target=next||tracks.at(-1)||section.querySelector('.mc-slot');
  if(!target)return;
  mark={element:target,side,section:section.dataset.destination,index:next?tracks.indexOf(next):tracks.length};
  target.classList.add('mc-drop-'+side);
 }
 function drop(){
  const item=source?.dataset, target=mark;
  cancel();if(!item||!target)return;
  if(item.vcr!==undefined){mutate({type:'vcr-order',index:Number(item.vcr),after:target.after,to:target.to});return;}
  const same=item.section===target.section;
  const from=getDraft().sections[item.section].indexOf(item.track);
  const to=target.index-(same&&from<target.index?1:0);
  if(from<0||(same&&from===to))return;
  mutate({type:same?'order':'move',id:item.track,section:item.section,target:target.section,to});
 }
 root.addEventListener('dragstart',event=>{
  const row=event.target.closest('[data-track],[data-vcr]');
  if(!row||touch||event.target.closest('button,select,input')){event.preventDefault();return;}
  source=row;source.classList.add('mc-lifted');
  event.dataTransfer.effectAllowed='move';event.dataTransfer.setData('text/plain',row.dataset.track||'vcr-'+row.dataset.vcr);
 });
 root.addEventListener('dragover',event=>{
  if(!source||touch)return;
  locate(event.target,event.clientY);if(mark)event.preventDefault();
 });
 root.addEventListener('drop',event=>{
  if(!source||touch)return;
  event.preventDefault();locate(event.target,event.clientY);drop();
 });
 root.addEventListener('dragend',cancel);
 function scrollFrame(){
  if(!touch)return;
  const {x,y}=touch;
  const distance=y<65?y-65:y>window.innerHeight-65?y-window.innerHeight+65:0;
  if(distance){window.scrollBy(0,Math.sign(distance)*Math.min(16,Math.ceil(Math.abs(distance)/4)));locate(document.elementFromPoint(x,y),y);}
  frame=requestAnimationFrame(scrollFrame);
 }
 root.addEventListener('pointerdown',event=>{
  const grip=event.target.closest('.mc-grip');
  if(!grip||event.pointerType==='mouse'||!event.isPrimary)return;
  event.preventDefault();source=grip.closest('[data-track],[data-vcr]');source.classList.add('mc-lifted');
  grip.setPointerCapture(event.pointerId);
  touch={id:event.pointerId,x:event.clientX,y:event.clientY};frame=requestAnimationFrame(scrollFrame);
 });
 root.addEventListener('pointermove',event=>{
  if(touch?.id!==event.pointerId)return;
  touch.x=event.clientX;touch.y=event.clientY;
  locate(document.elementFromPoint(touch.x,touch.y),touch.y);
 });
 root.addEventListener('pointerup',event=>{
  if(touch?.id!==event.pointerId)return;
  locate(document.elementFromPoint(event.clientX,event.clientY),event.clientY);drop();
 });
 root.addEventListener('pointercancel',event=>{if(touch?.id===event.pointerId)cancel();});
 root.addEventListener('lostpointercapture',event=>{if(touch?.id===event.pointerId)cancel();});
 window.addEventListener('pagehide',cancel);
};

}
};const cache={};function __require(id){if(cache[id])return cache[id].exports;const m=cache[id]={exports:{}};modules[id](m,m.exports,__require);return m.exports;}__require("src/client/my-concert.js");})();
