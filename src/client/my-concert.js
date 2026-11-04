'use strict';
const M=require('../shared/my-concert'),P=require('./my-concert-poster');
const Show=require('../shared/my-concert-show'),Design=require('../shared/my-concert-design'),Diary=require('./concert-diary');
const initSpecials=require('./my-concert-specials');
const initPlayback=require('./my-concert-playback');
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
 require('./my-concert-drag')({root,getDraft:()=>draft,mutate});
 window.addEventListener('pagehide',()=>{if(dirty)save();});
 load();
}
