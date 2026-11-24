'use strict';
(()=>{
 const root=document.getElementById('liveAtlas');if(!root)return;
 const $=id=>document.getElementById(id),data=JSON.parse($('liveAtlasData').textContent),{cell,summary}=require('../shared/live-state');
 const E=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const S=id=>data.sessions.find(s=>s.id===id),songById=id=>data.songs.find(s=>s.id===id),short=s=>s.date.slice(5).replace('-','.');
 const options=data.sessions.map(s=>`<option value="${E(s.id)}">${E(s.label)} · ${short(s)}</option>`).join('');$('lvFirst').innerHTML=$('lvSecond').innerHTML=options;
 const dialog=$('lvDialog');let state,lastTrigger=null,dialogKey='',timer;
 function parse(){const p=new URLSearchParams(location.search),first=S(p.get('session'))?.id||data.sessions[0].id;let second=S(p.get('second'))?.id||data.sessions[1].id;if(second===first)second=data.sessions.find(s=>s.id!==first).id;
  return {view:['session','compare','table'].includes(p.get('view'))?p.get('view'):matchMedia('(max-width:760px)').matches?'session':'table',session:first,second,q:(p.get('q')||'').slice(0,120),album:[...$('lvAlbum').options].some(o=>o.value===p.get('album'))?p.get('album'):'all',group:['both','first','second','unknown'].includes(p.get('group'))?p.get('group'):'all',page:Math.max(1,Number.parseInt(p.get('page'))||1),detail:songById(p.get('detail'))?.id||'',at:S(p.get('at'))?.id||first};
 }
 function update(patch,replace=false){const p=new URLSearchParams(location.search);for(const [k,v] of Object.entries(patch)){if(v===''||v==null)p.delete(k);else p.set(k,String(v));}history[replace?'replaceState':'pushState']({live:true},'',location.pathname+'?'+p);render();}
 function diaryLink(session){let entries=[];try{const saved=JSON.parse(localStorage.getItem(data.diaryKey)||'null');entries=Array.isArray(saved?.entries)?saved.entries:[];}catch{}
  const found=entries.filter(e=>e.kind==='concert'&&e.date===session.date&&(e.eventId===session.diaryEventId||e.archiveId===session.archiveId)).sort((a,b)=>String(b.updatedAt).localeCompare(String(a.updatedAt)))[0];
  if(found&&typeof found.entryId==='string')return `<a class="lv-action" href="/diary/#entry=${encodeURIComponent(found.entryId)}">내 공연 기록 보기 ↗</a>`;
  return session.diaryEventId?`<a class="lv-action" href="/diary/#new?event=${encodeURIComponent(session.diaryEventId)}&date=${session.date}">이 공연 다녀왔어요 ↗</a>`:'';
 }
 function status(c){return c.status==='confirmed'?(c.excerpt?'◐ 짧은 영상·일부':'● 무대 확인'):c.status==='not-performed'?'미공연 확인':'— 확인 중';}
 function badge(song,session,compact=false){const c=cell(data,song.id,session.id);return `<button class="lv-cell ${c.status==='confirmed'?'is-confirmed':''}" data-song="${E(song.id)}" data-at="${E(session.id)}" aria-label="${E(song.name+' · '+session.label+' '+session.date+' · '+status(c))}">${compact?(c.status==='confirmed'?(c.excerpt?'◐':'●'):c.status==='not-performed'?'×':'—'):status(c)}</button>`;}
 const cat=song=>{const a=cell(data,song.id,state.session).status==='confirmed',b=cell(data,song.id,state.second).status==='confirmed';return a&&b?'both':a?'first':b?'second':'unknown';};
 function openDetail(){const song=songById(state.detail),session=S(state.at);if(!song||!session){if(dialog.open)dialog.close();dialogKey='';return;}
  const key=song.id+'|'+session.id;if(dialog.open&&dialogKey===key)return;dialogKey=key;
  const c=cell(data,song.id,session.id),links=c.sources;
  $('lvDetail').innerHTML=`<p class="lv-kicker">${E(session.label)} · ${session.date.replaceAll('-','. ')}</p><h2 id="lvDetailTitle">${E(song.name)}</h2><p class="lv-detail-sub">${E(session.venue)} · ${status(c)}</p><div id="lvPlayer" class="lv-player">${links.some(s=>s.videoId)?`<button data-play="${links.findIndex(s=>s.videoId)}" class="lv-play"><span aria-hidden="true">▶</span>근거 영상 재생</button>`:'<p>이 회차의 무대 근거를 아직 연결하지 못했어요.<br>자료가 없다는 뜻이며, 미공연으로 판단하지 않습니다.</p>'}</div><p class="lv-help">${links.length?'원본 제목의 곡명과 공연 날짜·지역을 기존 공연 기록과 대조했습니다. 짧은 영상보다 일반 무대 영상을 우선 연결했습니다.':'회차가 불분명한 자료는 집계에서 제외했습니다.'}</p><div class="lv-evidence">${links.map((s,i)=>`<article><p class="lv-video-length">${s.durationSeconds?Math.floor(s.durationSeconds/60)+':'+String(s.durationSeconds%60).padStart(2,'0'):'길이 확인 중'}${s.scope==='excerpt'?' · 짧은 영상 / 일부 무대':''}</p><p>${E(s.label||'원본 자료')}</p>${s.publishedDate?`<small>영상 게시일 ${E(s.publishedDate)} · 공연일 ${session.date}</small>`:''}<div>${s.videoId?`<button data-play="${i}">이 영상 재생</button>`:''}<a href="${E(s.url)}" target="_blank" rel="noopener noreferrer">원본에서 열기 ↗</a></div></article>`).join('')}</div><p class="lv-help">삽입이 제한되거나 재생되지 않으면 원본에서 열어주세요.</p><div class="lv-detail-actions">${diaryLink(session)}<a href="/archive/concerts/the-fan-2026/?event=${encodeURIComponent(session.archiveId)}&view=media">이 공연의 전체 자료 ↗</a>${song.stageId?`<a href="/music/stages/${E(song.stageId)}/">곡별 무대 ↗</a>`:''}</div>`;
  if(!dialog.open)dialog.showModal();
 }
 function closeDetail(){if(history.state?.liveDialog){history.back();}else update({detail:'',at:''},true);}
 $('lvClose').onclick=closeDetail;dialog.addEventListener('cancel',e=>{e.preventDefault();closeDetail();});dialog.addEventListener('click',e=>{if(e.target===dialog){const b=dialog.getBoundingClientRect();if(e.clientX<b.left||e.clientX>b.right||e.clientY<b.top||e.clientY>b.bottom)closeDetail();}});
 dialog.addEventListener('close',()=>{$('lvPlayer')?.replaceChildren();dialogKey='';if(lastTrigger?.isConnected)lastTrigger.focus({preventScroll:true});});
 $('lvDetail').addEventListener('click',e=>{const b=e.target.closest('[data-play]');if(!b)return;const c=cell(data,state.detail,state.at),v=c.sources[Number(b.dataset.play)];if(!v?.videoId)return;const frame=document.createElement('iframe');frame.src='https://www.youtube.com/embed/'+v.videoId+'?playsinline=1&rel=0';frame.title=songById(state.detail).name+' · '+S(state.at).label;frame.allow='accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share';frame.allowFullscreen=true;frame.referrerPolicy='strict-origin-when-cross-origin';$('lvPlayer').replaceChildren(frame);});
 function render(){state=parse();
  root.querySelectorAll('[data-view]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.view===state.view)));
  $('lvSearch').value=state.q;$('lvAlbum').value=state.album;$('lvFirst').value=state.session;$('lvSecond').value=state.second;$('lvGroup').value=state.group;
  $('lvCompare').hidden=state.view!=='compare';$('lvGroupLabel').hidden=state.view!=='compare';$('lvSessions').hidden=state.view==='compare';
  $('lvSessions').innerHTML=data.sessions.map(s=>`<button data-session="${s.id}" aria-pressed="${s.id===state.session}"><span>${short(s)}</span><strong>${E(s.label)}</strong><small>${data.songs.filter(song=>cell(data,song.id,s.id).status==='confirmed').length}곡 확인</small></button>`).join('');
  const session=S(state.session),second=S(state.second),scope=state.view==='table'?data.sessions.map(s=>s.id):state.view==='compare'?[session.id,second.id]:[session.id];
  $('lvSessionInfo').innerHTML=state.view==='table'?`<div><h2>투어의 노래 지도</h2><p>8회차 비교 · 곡명과 날짜는 스크롤해도 고정돼요.</p></div><span class="lv-muted">전체 셋리스트 확인 중</span>`:state.view==='compare'?`<div><h2>${E(session.label)} <span>×</span> ${E(second.label)}</h2><p>두 공연에서 확인된 곡을 비교해보세요.</p></div><span class="lv-muted">한쪽만 확인 ≠ 다른 쪽 미공연</span>`:`<div><h2>${E(session.label)} <span>${short(session)}</span></h2><p>${E(session.venue)} · 전체 셋리스트 확인 중</p></div>${diaryLink(session)}`;
  const normalize=s=>s.toLowerCase().replace(/[\s,]/g,'');let songs=data.songs.filter(s=>(state.album==='all'||s.album===state.album)&&normalize([s.name,...s.aliases].join(' ')).includes(normalize(state.q))&&(state.view!=='compare'||state.group==='all'||cat(s)===state.group));
  const total=songs.length,pages=Math.max(1,Math.ceil(total/12));state.page=Math.min(state.page,pages);songs=songs.slice((state.page-1)*12,state.page*12);
  $('lvResult').textContent=`${total}곡 · ${state.view==='table'?'투어 전체 8회차':state.view==='compare'?'선택한 2회차':'선택한 1회차'} 기준`;
  const count=s=>{const n=summary(data,s.id,scope);return `무대 확인 ${n.confirmed}회${n.excerpt?' · 일부 '+n.excerpt+'회 포함':''}`;};
  if(!total)$('lvContent').innerHTML='<div class="lv-empty"><h3>찾는 곡이 없어요.</h3><p>검색어나 앨범 필터를 바꿔보세요.</p><button data-reset>전체 곡 보기</button></div>';
  else if(state.view==='table')$('lvContent').innerHTML=`<div class="lv-table-wrap" tabindex="0" role="region" aria-label="공연별 무대 비교표, 가로 스크롤 가능"><table><thead><tr><th scope="col">곡 · 확인된 회차</th>${data.sessions.map(s=>`<th scope="col" class="${s.id===session.id?'selected':''}">${E(s.label)}<small>${short(s)}</small></th>`).join('')}</tr></thead><tbody>${songs.map(s=>`<tr><th scope="row"><strong>${E(s.name)}</strong><small>${count(s)}</small></th>${data.sessions.map(at=>`<td class="${at.id===session.id?'selected':''}">${badge(s,at,true)}</td>`).join('')}</tr>`).join('')}</tbody></table></div><p class="lv-table-tip">● 또는 — 를 누르면 근거와 연결 자료를 볼 수 있어요.</p>`;
  else $('lvContent').innerHTML=`<div class="lv-song-list ${state.view==='compare'?'lv-comparison':''}">${songs.map(s=>`<article><div class="lv-song-name"><small>${E(s.album)}</small><h3>${E(s.name)}</h3><span>${count(s)}</span></div><div class="lv-song-states">${state.view==='compare'?`<div><small>${E(session.label)}</small>${badge(s,session)}</div><div><small>${E(second.label)}</small>${badge(s,second)}</div>`:badge(s,session)}</div></article>`).join('')}</div>`;
  $('lvPages').innerHTML=pages>1?`<button data-page="${state.page-1}" ${state.page===1?'disabled':''}>이전</button>${Array.from({length:pages},(_,i)=>`<button data-page="${i+1}" ${state.page===i+1?'aria-current="page"':''}>${i+1}</button>`).join('')}<button data-page="${state.page+1}" ${state.page===pages?'disabled':''}>다음</button>`:'';
  // Renders replace list buttons. Restore focus to the corresponding new trigger.
  if(lastTrigger?.dataset.song)lastTrigger=root.querySelector(`[data-song="${lastTrigger.dataset.song}"][data-at="${lastTrigger.dataset.at}"]`)||lastTrigger;
  openDetail();
 }
 root.addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;
  if(b.dataset.song){lastTrigger=b;const p=new URLSearchParams(location.search);p.set('view',state.view);p.set('detail',b.dataset.song);p.set('at',b.dataset.at);history.pushState({liveDialog:true},'',location.pathname+'?'+p);state=parse();openDetail();}
  else if(b.dataset.view)update({view:b.dataset.view,page:1,detail:'',at:''});
  else if(b.dataset.session)update({session:b.dataset.session,page:1});
  else if(b.dataset.page){update({page:b.dataset.page});$('lvResult').scrollIntoView({block:'nearest'});}
  else if(b.id==='lvReset'||b.hasAttribute('data-reset'))update({q:'',album:'',group:'',page:1});
 });
 $('lvSearch').addEventListener('input',()=>{clearTimeout(timer);timer=setTimeout(()=>update({q:$('lvSearch').value,page:1},true),180);});
 $('lvAlbum').onchange=()=>update({album:$('lvAlbum').value,page:1});$('lvGroup').onchange=()=>update({group:$('lvGroup').value,page:1});
 $('lvFirst').onchange=()=>update({session:$('lvFirst').value,second:$('lvFirst').value===state.second?state.session:state.second,page:1});
 $('lvSecond').onchange=()=>update({second:$('lvSecond').value,session:$('lvSecond').value===state.session?state.second:state.session,page:1});
 root.querySelector('form').onsubmit=e=>{e.preventDefault();clearTimeout(timer);update({q:$('lvSearch').value,page:1},true);};
 window.addEventListener('popstate',render);render();
})();
