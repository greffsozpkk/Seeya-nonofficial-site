(function(){'use strict';const modules={
"src/client/seeya-map.js":function(module,exports,__require){
'use strict';
const {filterPlaces,cards,detail,groupPins,esc,tone}=__require("src/shared/seeya-map.js");
const {mountKakaoMap,isDomestic}=__require("src/client/kakao-map.js");
const data=JSON.parse(document.getElementById('mapData').textContent);
const $=id=>document.getElementById(id),workspace=document.querySelector('.map-workspace');
const state={query:'',member:'전체',region:'전체',category:'전체',relation:'전체',sort:'tour',bounds:null};
const mobile=window.matchMedia('(max-width: 850px)'),sidebar=document.querySelector('.map-sidebar');
let selected=null,map=null,rows=data.places;
let screen={view:'map',selected:null,origin:'map',listScroll:0},steps=[screen],step=0;
const historyToken='seeya-map-'+Date.now();
let nativeHistory=false;
try{window.history.replaceState({...window.history.state,seeyaMap:{token:historyToken,step:0}},'');nativeHistory=true;}catch{}
function rememberScroll(){if(screen.view==='list'&&sidebar){screen={...screen,listScroll:sidebar.scrollTop};steps[step]=screen;}}
function navigate(next,{replace=false}={}){
 rememberScroll();screen={...screen,...next};
 if(replace)steps[step]=screen;else{steps=steps.slice(0,step+1);steps.push(screen);step++;}
 if(nativeHistory)try{window.history[replace?'replaceState':'pushState']({...window.history.state,seeyaMap:{token:historyToken,step}},'');}catch{nativeHistory=false;}
 paintScreen();
}
function goBack(){
 if(step>0){if(nativeHistory){window.history.back();return;}screen=steps[--step];}
 else screen={...screen,view:screen.origin,selected:screen.origin==='map'?selected:null};
 paintScreen(true);
}
window.addEventListener?.('popstate',e=>{
 const saved=e.state?.seeyaMap;
 if(saved?.token!==historyToken||!steps[saved.step])return;
 rememberScroll();step=saved.step;screen=steps[step];paintScreen(true);
});
function view(which){if(screen.view===which)return;navigate({view:which,origin:which});}
function dismissSelection(){
 const prior=steps[step-1];
 if(screen.view==='map'&&selected&&prior?.view==='map'&&!prior.selected){goBack();return;}
 navigate({selected:null},{replace:true});
}
function closeDetail(){navigate({view:screen.view==='detail'?screen.origin:screen.view,selected:null},{replace:true});}
function paintScreen(returning=false){
 const previous=selected;
 if(returning&&screen.view==='list'&&rows.some(p=>p.id===previous))screen={...screen,selected:previous};
 if(screen.selected&&!rows.some(p=>p.id===screen.selected))screen={...screen,selected:null,view:screen.view==='detail'?screen.origin:screen.view};
 selected=screen.selected;const p=rows.find(p=>p.id===selected),expanded=screen.view==='detail'&&p;
 steps[step]=screen;
 const base=expanded?screen.origin:screen.view;
 workspace.dataset.view=screen.view;workspace.dataset.detailOrigin=screen.origin;workspace.dataset.selected=String(Boolean(p));
 $('mapBrowse').hidden=Boolean(expanded);$('mapDetail').hidden=!expanded;
 const canvas=document.querySelector('.map-canvas-panel');if(canvas)canvas.inert=Boolean(mobile.matches&&expanded);
 document.querySelectorAll('[data-map-view]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.mapView===base)));
 if(expanded){
  $('mapDetail').innerHTML=detail(p,new Date());
  $('mapBack').textContent=screen.origin==='map'?'← 지도 보기':'← 장소 목록';$('mapBack').onclick=goBack;$('mapCopy').onclick=()=>copyAddress(p);
  const handle=$('mapSheetHandle');if(handle){
   handle.hidden=screen.origin!=='map';
   let start=null,dragged=false;handle.onclick=()=>{if(!dragged)goBack();dragged=false;};
   handle.onpointerdown=e=>{start={x:e.clientX,y:e.clientY};dragged=false;handle.setPointerCapture?.(e.pointerId);};
   handle.onpointerup=e=>{if(start&&e.clientY-start.y>55&&Math.abs(e.clientX-start.x)<70){dragged=true;goBack();}start=null;};
   handle.onpointercancel=()=>{start=null;};
  }
  if(sidebar)sidebar.scrollTop=0;
 }
 $('mapSelectedMobile').hidden=!(p&&screen.view==='map');
 if(p){$('mapSelectedName').textContent=p.name;$('mapSelectedMeta').textContent=p.city+' · '+p.category+' · '+p.date.replaceAll('-','.');$('mapSelectedAddress').textContent=p.address;$('mapSelectedOpen').setAttribute('aria-label',p.name+' 상세 보기');}
 $('mapHint').textContent=p?p.name+' · '+p.date:'장소를 선택하면 씨야와의 이야기와 방문 정보를 볼 수 있어요.';
 renderList();renderPins();
 if(!expanded&&sidebar&&base==='list')sidebar.scrollTop=screen.listScroll;
 if(map)requestAnimationFrame(()=>map.invalidateSize());
 if(expanded)$('mapDetailTitle').focus({preventScroll:true});
 else if(returning&&base==='map'&&p&&mobile.matches)$('mapSelectedOpen').focus({preventScroll:true});
 else if(returning&&base==='list')document.querySelector('[data-place="'+(selected||previous)+'"]')?.focus({preventScroll:true});
}
async function copyAddress(p){
 try{if(!navigator.clipboard?.writeText)throw Error('Clipboard unavailable');await navigator.clipboard.writeText(p.address);$('mapCopyStatus').textContent='주소를 복사했어요.';}
 catch{const range=document.createRange();range.selectNodeContents($('mapAddress'));const selection=window.getSelection();selection.removeAllRanges();selection.addRange(range);$('mapCopyStatus').textContent='자동 복사가 지원되지 않아요. 선택된 주소를 길게 눌러 복사해 주세요.';}
}
function selectPlace(id,{from='list',pan=true}={}){
 const p=rows.find(x=>x.id===id);if(!p)return;
 navigate({selected:id,origin:from,view:from==='map'&&mobile.matches?'map':'detail'},{replace:from==='map'&&screen.view==='map'&&Boolean(selected)});
 // Pin taps keep the user's map scale and position; list selections locate the place.
 if(map&&pan&&from==='list'&&isDomestic(p.coordinates))map.setView(p.coordinates,Math.max(map.getZoom(),12),{animate:false});
}
function renderList(){
 $('mapList').innerHTML=cards(rows,selected,new Date());$('mapEmpty').hidden=rows.length>0;
 $('mapCount').innerHTML=(state.bounds?'이 지역 장소':'전체 장소')+' <em>'+rows.length+'</em>';$('mapMobileCount').textContent=rows.length;$('mapClearArea').hidden=!state.bounds;
}
function renderPins(){
 if(!map)return;map.clearPins();
 const groups=groupPins(rows.filter(p=>isDomestic(p.coordinates)),c=>map.latLngToContainerPoint(c),map.getZoom()>=13?0:46);
 for(const group of groups){
  const many=group.items.length>1,p=group.items[0],active=group.items.some(p=>p.id===selected);
  const center=many?[group.items.reduce((n,p)=>n+p.coordinates[0],0)/group.items.length,group.items.reduce((n,p)=>n+p.coordinates[1],0)/group.items.length]:p.coordinates;
  const label=many?[...new Set(group.items.map(p=>p.city))].join(' · ')+' 장소 '+group.items.length+'곳 확대':p.name+' 장소 선택';
  map.addPin({coordinates:center,label,html:`<span class="${many?'map-cluster':'map-pin map-pin-'+tone(p)} ${active?'is-active':''}">${many?group.items.length:'♥'}</span>`,onClick:()=>{if(many)map.fitBounds(group.items.map(p=>p.coordinates),{padding:[65,65],maxZoom:13});else selectPlace(p.id,{from:'map',pan:false});}});
 }

}
function filter(){rows=filterPlaces(data.places,state);if(selected&&!rows.some(p=>p.id===selected))closeDetail();renderList();renderPins();}
function reset(){Object.assign(state,{query:'',member:'전체',region:'전체',category:'전체',relation:'전체',bounds:null,sort:'tour'});$('mapSearch').value='';$('mapRegion').value='전체';$('mapRelation').value='전체';$('mapSort').value='tour';document.querySelectorAll('[data-member],[data-category]').forEach(b=>b.setAttribute('aria-pressed',String((b.dataset.member||b.dataset.category)==='전체')));filter();}
$('mapSearch').addEventListener('input',e=>{state.query=e.target.value;state.bounds=null;filter();});
$('mapRegion').addEventListener('change',e=>{state.region=e.target.value;state.bounds=null;filter();if(map&&rows.length)map.fitBounds(rows.map(p=>p.coordinates),{padding:[70,70],maxZoom:10});if(rows.length&&!rows.some(p=>isDomestic(p.coordinates))&&mobile.matches)view('list');});
$('mapRelation').addEventListener('change',e=>{state.relation=e.target.value;state.bounds=null;filter();});
$('mapSort').addEventListener('change',e=>{state.sort=e.target.value;filter();});
document.querySelectorAll('[data-member],[data-category]').forEach(b=>b.addEventListener('click',()=>{const key=b.dataset.member?'member':'category';state[key]=b.dataset[key];document.querySelectorAll('[data-'+key+']').forEach(x=>x.setAttribute('aria-pressed',String(x===b)));filter();}));
$('mapList').addEventListener('click',e=>{const b=e.target.closest('[data-place]');if(b)selectPlace(b.dataset.place);});
$('mapReset').onclick=reset;$('mapClearArea').onclick=()=>{state.bounds=null;filter();};
document.querySelectorAll('[data-map-view]').forEach(b=>b.onclick=()=>view(b.dataset.mapView));
$('mapSelectedOpen').onclick=()=>navigate({view:'detail',origin:'map'});
$('mapSelectedClose').onclick=dismissSelection;
$('mapSearchOpen').onclick=()=>{view('list');$('mapSearch').focus();};
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&selected){if(screen.view==='detail')goBack();else dismissSelection();}});
function mapFailure(){$('mapError').hidden=false;$('mapError').textContent='지도를 불러오지 못했어요. 목록에서 장소·주소·길찾기를 계속 이용할 수 있어요.';}
function national(){state.bounds=null;filter();map.fitBounds([[33.05,125.5],[38.55,130.1]],{padding:[25,25],animate:false});}
mountKakaoMap(data.mapProvider,{
 onReady(controller){
  map=controller;map.on('moveend zoomend',renderPins);map.on('click',()=>{if(mobile.matches&&screen.view==='map'&&selected)dismissSelection();});national();
  $('mapNation').disabled=false;$('mapArea').disabled=false;$('mapNation').onclick=national;
  $('mapArea').onclick=()=>{const b=map.getBounds();state.bounds={south:b.getSouth(),north:b.getNorth(),west:b.getWest(),east:b.getEast()};filter();};
  const observer=new ResizeObserver(()=>map.invalidateSize());observer.observe($('seeyaMap'));
  paintScreen();
  if(selected){const p=rows.find(p=>p.id===selected);if(p&&isDomestic(p.coordinates))map.setView(p.coordinates,12,{animate:false});}
 },
 onError(){mapFailure();if(!map&&!selected)navigate({view:'list',origin:'list'},{replace:true});}
});
filter();

paintScreen();
mobile.addEventListener?.('change',()=>{const canvas=document.querySelector('.map-canvas-panel');if(canvas)canvas.inert=mobile.matches&&screen.view==='detail';});

// A link from an archive record opens the exact venue, including with a failed map SDK.
if(typeof location!=='undefined'&&typeof URLSearchParams!=='undefined'){
 const requested=new URLSearchParams(location.search).get('place');
 if(requested&&rows.some(p=>p.id===requested)){navigate({view:'list',origin:'list'},{replace:true});selectPlace(requested,{from:'list'});}
}

},
"src/shared/seeya-map.js":function(module,exports,__require){
'use strict';
const {recordsByPlace}=__require("src/shared/map-archive.js");
const esc=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const link=(url,label)=>/^https?:\/\//.test(url||'')?`<a href="${esc(url)}" target="_blank" rel="noopener">${esc(label)} ↗</a>`:'';
function resolvePlaces(config,archive){
 const byId=new Map(archive.map(row=>[row.id,row])),grouped=recordsByPlace(archive);
 return config.places.flatMap(({archiveExclusion,...place})=>{
  const records=grouped.get(place.id)||[];
  if(!Array.isArray(place.coordinates)||place.coordinates.length!==2||!place.coordinates.every(Number.isFinite))throw Error('Invalid place coordinates: '+place.id);
  if(place.archiveOnly){
   if(!records.length)return [];
   const current=records[0],members=[...new Set(records.flatMap(r=>r.members))];
   return [{...place,recordId:current.id,title:current.title,date:current.date,dateBasis:current.dateBasis,eventState:current.eventState,members,group:records.some(r=>r.members.length===3)?'씨야':'멤버',source:current.source,records,checkedAt:config.checkedAt}];
  }
  const row=byId.get(place.recordId);
  // Concert metadata stays joined to the archive. Other places retain their own identity.
  if(!place.name&&(!row||row.hidden||row.mergedInto))return [];
  if(!Array.isArray(place.coordinates)||place.coordinates.length!==2||!place.coordinates.every(Number.isFinite))throw Error('Invalid place coordinates: '+place.id);
  if(place.name)return [{...place,recordId:row&&!row.hidden&&!row.mergedInto?row.id:null,records,checkedAt:config.checkedAt}];
  return [{...place,tourVenue:true,name:row.venue,title:row.title,date:row.date,dateBasis:'공연일',time:row.calendar?.time||'',eventState:row.eventState||'',members:row.members||[],group:'씨야',category:'공연장',relations:['공연'],source:row.source,records,checkedAt:config.checkedAt}];
 });
}
function filterPlaces(rows,{query='',member='전체',region='전체',category='전체',relation='전체',bounds=null,sort='tour'}={}){
 const words=query.trim().toLocaleLowerCase().split(/\s+/).filter(Boolean);
 return rows.filter(p=>words.every(w=>[p.name,p.city,p.locality,p.address,p.title,p.story,...(p.records||[]).flatMap(r=>[r.title,r.venue]),...p.members,...p.relations].join(' ').toLocaleLowerCase().includes(w))&&(member==='전체'||(member==='씨야'?p.group==='씨야':p.members.includes(member)))&&(region==='전체'||p.region===region)&&(category==='전체'||p.category===category)&&(relation==='전체'||p.relations.includes(relation))&&(!bounds||(p.coordinates[0]>=bounds.south&&p.coordinates[0]<=bounds.north&&p.coordinates[1]>=bounds.west&&p.coordinates[1]<=bounds.east))).sort((a,b)=>sort==='name'?a.name.localeCompare(b.name,'ko'):sort==='newest'?b.date.localeCompare(a.date):a.date.localeCompare(b.date));
}
function promoStatus(p,now=p.checkedAt+'T12:00:00+09:00'){
 if(!p.promotion)return '';
 const t=new Date(now).getTime(),start=new Date(p.promotion.start+'T00:00:00+09:00').getTime(),end=new Date(p.promotion.endsAt||p.promotion.end+'T23:59:59+09:00').getTime();
 return t<start?'혜택 예정':t>end?'혜택 종료':'혜택 기간';
}
function badge(p,now){return p.operatingStatus==='closed'?'영업 종료 · 과거 기록':p.promotion?promoStatus(p,now):p.category==='공연장'?(p.eventState==='cancelled'?'공연 취소':p.eventState==='scheduled'?'공연 예정':p.relations.includes('팬 행사')?'팬 행사 기록':'공연 기록'):p.relations.join(' · ');}
const tone=p=>({'공연장':'venue','카페':'cafe','식당':'food','문화공간':'culture','여행·자연':'nature','쇼핑':'shopping'}[p.category]||'culture');
function cards(rows,selected,now){return rows.map(p=>`<li><button type="button" class="map-place-card ${p.id===selected?'is-selected':''}" data-place="${esc(p.id)}" aria-pressed="${p.id===selected}"><span class="map-card-copy"><strong>${esc(p.name)}</strong><span class="map-location">⌖ ${esc(p.locality||p.address.split(' ').slice(0,2).join(' '))}</span><span class="map-card-meta"><span class="map-tag map-tag-${tone(p)}">${esc(p.category)}</span><span class="map-card-status">${esc(badge(p,now))}</span></span><span class="map-card-date">${esc(p.date.replaceAll('-','.'))} · ${esc(p.dateBasis)}</span></span><span class="map-card-arrow" aria-hidden="true">›</span></button></li>`).join('');}
function detail(p,now){
 const concert=p.tourVenue===true,area=p.locationPrecision==='area',closed=p.operatingStatus==='closed',overseas=p.country&&p.country!=='KR',directions=overseas?'https://www.google.com/maps/search/?api=1&query='+encodeURIComponent(p.coordinates.join(',')):'https://map.kakao.com/link/'+(area||closed?'map/':'to/')+encodeURIComponent(p.name)+','+p.coordinates.join(','),record=p.relatedRecordId||p.recordId;
 const activities=(p.records||[]).length?`<section class="map-activities" aria-label="이곳의 씨야 기록"><h3>이곳의 씨야 기록 <span>${p.records.length}</span></h3><ul>${p.records.map(r=>`<li><span class="map-activity-date">${esc(r.date)} · ${esc(r.dateBasis)}${r.eventState==='scheduled'?' · 예정':r.eventState==='cancelled'?' · 취소':''}</span><a class="map-activity-title" href="/archive/?record=${encodeURIComponent(r.id)}">${esc(r.title)}</a>${r.venue?`<p>${esc(r.venue)}</p>`:''}<div>${link(r.source?.url,r.source?.label||'원본 자료 보기')}</div></li>`).join('')}</ul></section>`:'';
 const promotion=p.promotion?`<section class="map-promotion ${promoStatus(p,now)==='혜택 종료'?'is-ended':''}"><strong>${esc(promoStatus(p,now))}</strong><p>${esc(p.promotion.benefit)}</p><p>${esc(p.promotion.start)}${p.promotion.end!==p.promotion.start?' ~ '+esc(p.promotion.end):''}${p.promotion.endsAt?' · 10월 11일 새벽 1시 종료':''}</p><p>${esc(p.promotion.condition)}</p>${link(p.promotion.sourceUrl,'혜택 원문 확인')}</section>`:'';
 return `<button type="button" id="mapSheetHandle" class="map-sheet-handle" aria-label="장소 요약으로 접기"><span></span></button><button type="button" id="mapBack" class="map-back">← 장소 목록</button><header class="map-place-heading"><div class="map-place-meta"><span class="map-tag map-tag-${tone(p)}">${esc(badge(p,now))}</span><span class="map-place-region">${esc(p.city)}</span></div><h2 id="mapDetailTitle" tabindex="-1">${esc(p.name)}</h2><p class="map-place-date">${esc(p.date.replaceAll('-','.'))} · ${esc(p.dateBasis)}</p></header><p class="map-story">${esc(p.story||`씨야 20주년 전국 투어 ‘THE FAN’ ${p.city} 공연이 연결된 장소입니다.`).replace(/\n/g,'<br>')}</p><dl><dt>${concert?'공연':'멤버'}</dt><dd>${concert?esc(p.date)+(p.time?' · '+esc(p.time):'')+'<br>':''}${esc(p.members.join(' · '))}</dd><dt>주소</dt><dd id="mapAddress">${esc(p.address)}</dd></dl><div class="map-detail-actions"><button id="mapCopy" type="button">주소 복사</button><a href="${esc(directions)}" target="_blank" rel="noopener">${closed?'옛 위치 보기':overseas?'지도 보기':area?'지역 지도':'길찾기'} ↗</a></div><p id="mapCopyStatus" class="map-small" role="status"></p>${promotion}${activities}${p.note?'<p class="map-place-note">'+esc(p.note)+'</p>':''}<div class="map-record-links">${record&&!activities?`<a href="/archive/?record=${encodeURIComponent(record)}" target="_blank" rel="noopener">관련 아카이브 보기 ↗</a>`:''}${link(p.source?.url,p.source?.label||'기록 출처')}${(p.evidence||[]).map(e=>link(e.url,e.label)).join('')}${concert?'<a href="/archive/concerts/the-fan-2026/" target="_blank" rel="noopener">20주년 콘서트 기록관 ↗</a>':''}</div><details class="map-evidence"><summary>장소 정보 출처</summary>${link(p.addressSource,'주소 확인 자료')}${link(p.coordinateSource,'지도 위치 확인 자료')}<p>자료 확인 ${esc(p.checkedAt)} · ${area?'지역·시설의 대표 위치이며 정확한 촬영 지점은 아닙니다.':'건물·매장 단위의 위치입니다.'} ${concert?'입장 시간과 출입구는 공연 안내를 확인해 주세요.':['식당','카페'].includes(p.category)?'영업 시간·이전·휴무 여부는 방문 전 매장 안내를 확인해 주세요.':'방문 가능한 구역과 운영 안내는 해당 장소의 최신 안내를 확인해 주세요.'}</p></details>`;
}
function groupPins(rows,project,radius=44){
 const groups=[];
 for(const p of rows){const point=project(p.coordinates);const g=groups.find(g=>Math.hypot(point.x-g.x,point.y-g.y)<radius);if(g)g.items.push(p);else groups.push({x:point.x,y:point.y,items:[p]});}
 return groups;
}
module.exports={resolvePlaces,filterPlaces,cards,detail,groupPins,esc,promoStatus,tone};

},
"src/shared/map-archive.js":function(module,exports,__require){
'use strict';
const registry=__require("src/data/map-archive-links.json");
const normalizeVenue=value=>String(value||'').normalize('NFKC').replace(/\s+/g,' ').trim();
const venues=new Map(Object.entries(registry.venues).map(([name,id])=>[normalizeVenue(name),id]));
function placeIdsForRecord(row){
 if(!row||row.hidden||row.mergedInto)return [];
 return [...new Set([...(registry.records[row.id]||[]),venues.get(normalizeVenue(row.venue))].filter(Boolean))];
}
const dateLabel=row=>({'event':'활동일','broadcast':'방송일','season':'공연 시작일','recording':'촬영일','schedule':'예정일','post-published':'게시일','video-published':'영상 게시일','article-published':'기사 게시일','published':'게시일'}[row.dateBasis]||'기록일');
function recordsByPlace(archive){
 const result=new Map();
 for(const row of archive){for(const id of placeIdsForRecord(row)){
  if(!result.has(id))result.set(id,[]);
  result.get(id).push({id:row.id,title:row.title,date:row.date,dateBasis:dateLabel(row),members:row.members||[],eventState:row.eventState||'',venue:row.venue||'',source:row.source});
 }}
 for(const rows of result.values())rows.sort((a,b)=>b.date.localeCompare(a.date)||a.id.localeCompare(b.id));
 return result;
}
function coverage(archive,places,pending){
 const ids=new Set(places.map(p=>p.id)),rows=[];
 for(const record of archive){
  if(record.hidden||record.mergedInto||!record.venue)continue;
  const linked=placeIdsForRecord(record).filter(id=>ids.has(id)),reason=pending[normalizeVenue(record.venue)];
  rows.push({recordId:record.id,title:record.title,venue:record.venue,placeIds:linked,status:linked.length?'linked':reason?'pending':'unreviewed',...(!linked.length?{reason:reason||'새 장소의 위치와 연결을 확인해 주세요.'}:{})});
 }
 return {summary:{records:rows.length,venues:new Set(rows.map(r=>normalizeVenue(r.venue))).size,linked:rows.filter(r=>r.status==='linked').length,pending:rows.filter(r=>r.status==='pending').length,unreviewed:rows.filter(r=>r.status==='unreviewed').length},rows};
}
module.exports={normalizeVenue,placeIdsForRecord,recordsByPlace,coverage};

},
"src/data/map-archive-links.json":function(module,exports,__require){
module.exports={"venues":{"인천남동체육관":"namdong-gymnasium","경희대학교 국제캠퍼스 선승관":"khu-seonseung","청주대학교 석우문화체육관":"cju-seokwoo","킨텍스 제2전시장 10홀":"kintex-second","대구 엑스코 5층 컨벤션홀":"exco-west","부산 KBS홀":"kbs-busan-hall","경희대학교 평화의 전당":"khu-grand-peace-palace","경희대학교 평화의전당":"khu-grand-peace-palace","룰리커피 가창점":"rully-gachang","음악역1939 야외무대":"music-station-1939","영화의전당 하늘연극장":"busan-cinema-haneul","고척스카이돔":"gocheok-skydome","서울 종로구 이들스(EDLS)":"edls","성신여자대학교 운정그린캠퍼스 대강당":"sungshin-unjeong","성암아트홀":"seongam-hall","SMTOWN THEATER 코엑스아티움":"smtown-theater-historic","대학로 SH아트홀":"sh-art-hall","디큐브아트센터":"dcube-historic","봉산문화회관 가온홀":"bongsan-gaon","ICT밸리컨벤션 B1 플로리아홀":"ict-valley-floria","옛 김유정역":"old-kim-you-jeong-station","도산정육 본점":"dosan-butcher","유지카페":"yoozzy","공간양":"gonggan-yang","우리는 정육가든 수성구점":"woorineun-suseong","익커피 홍대점 · 과거 행사":"ikcoffee-historic","금돼지식당":"geumdwaeji-sikdang","양재 엘타워":"eltower","홍익대 대학로 아트센터 대극장":"hongik-daehakro","송도컨벤시아 프리미어볼룸 A룸 (센트럴로 123)":"songdo-convensia","대전과학기술대학교 중앙광장":"dst-campus","영월 동서강정원 청령포원":"cheongnyeongpo-garden","우석대학교 전주캠퍼스 농구장 주무대":"woosuk-jeonju","광주교육대학교 제1운동장":"gnue-campus","한국경제신문사 다산홀":"hankyung-dasan","익산 원광대학교 문화체육관":"wonkwang-campus","여수 엑스포 광장":"yeosu-expo","부산 다대포해수욕장":"dadaepo-beach","동해문화예술회관 야외 공연장":"donghae-arts","콘래드 서울 3층 그랜드볼룸":"conrad-seoul","울산문화예술회관 야외공연장":"ulsan-arts","한강공원 신사잠원지구 다목적운동장":"jamwon-hangang","기아 챔피언스 필드":"kia-champions","더현대 서울":"hyundai-seoul","국립극장 해오름극장":"national-theater","고려대학교 화정체육관":"korea-hwajeong","경기아트센터 대극장":"gyeonggi-arts","천마아트센터":"chunma-arts","올림픽공원 올림픽홀":"olympic-hall","세종문화회관 대극장":"sejong-center","블루스퀘어 인터파크홀":"blue-square","동덕여자대학교 백주년기념관":"dongduk-campus","상암 MBC 특설무대":"mbc-sangam","의령중학교 체육관":"uiryeong-school","김대중컨벤션센터 다목적홀":"kimdaejung-center","부산시청":"busan-cityhall","서울 잠실야구장":"jamsil-baseball","서울 목동 SBS홀":"sbs-mokdong","서울 잠실 실내체육관":"jamsil-gym","일본 구마모토성":"kumamoto-castle","창원실내체육관":"changwon-gym","미국 뉴욕 맨해튼 센터 해머스타인 볼룸":"hammerstein-ballroom","서울 올림픽공원 체조경기장":"kspo-dome","서울 소공동 롯데호텔 에메랄드룸":"lotte-hotel-seoul","서울 코엑스 대서양홀":"coex","서울 올림픽주경기장":"olympic-main-stadium","SBS 등촌동 공개홀":"sbs-deungchon","그랜드 하얏트 서울":"grand-hyatt-seoul","KBS 신관 공개홀":"kbs-new-building","대구 닭동가리 수성못 본점":"dakdonggari-suseong","제천한방엑스포공원 한방무대(주무대)":"jecheon-hanbang-expo","서울 올림픽공원 올림픽홀":"olympic-hall","엘타워":"eltower","송도컨벤시아":"songdo-convensia","대전과학기술대학교":"dst-campus","동서강정원 청령포원":"cheongnyeongpo-garden","우석대학교 전주캠퍼스":"woosuk-jeonju","광주교육대학교":"gnue-campus","원광대학교":"wonkwang-campus","여수세계박람회장":"yeosu-expo","다대포해수욕장":"dadaepo-beach","동해문화예술회관":"donghae-arts","콘래드 서울":"conrad-seoul","울산문화예술회관":"ulsan-arts","잠원한강공원":"jamwon-hangang","광주 기아 챔피언스 필드":"kia-champions","국립극장":"national-theater","경기아트센터":"gyeonggi-arts","세종문화회관":"sejong-center","블루스퀘어":"blue-square","동덕여자대학교":"dongduk-campus","상암 MBC":"mbc-sangam","의령중학교":"uiryeong-school","김대중컨벤션센터":"kimdaejung-center","부산광역시청":"busan-cityhall","잠실야구장":"jamsil-baseball","SBS 목동 방송센터":"sbs-mokdong","잠실 실내체육관":"jamsil-gym","구마모토성":"kumamoto-castle","창원체육관":"changwon-gym","맨해튼 센터 해머스타인 볼룸":"hammerstein-ballroom","올림픽공원 체조경기장 · KSPO DOME":"kspo-dome","롯데호텔 서울":"lotte-hotel-seoul","코엑스":"coex","잠실 올림픽주경기장":"olympic-main-stadium","KBS 신관":"kbs-new-building","닭동가리 수성못 본점":"dakdonggari-suseong","제천한방엑스포공원":"jecheon-hanbang-expo","우석대 전주캠퍼스":"woosuk-jeonju","홍익대학교 대학로 아트센터 대극장":"hongik-daehakro","대전과기대 중앙광장":"dst-campus","잠실종합운동장 올림픽주경기장":"olympic-main-stadium"},"records":{"20260829-the-fan-seoul":["khu-grand-peace-palace"],"20260905-the-fan-busan":["kbs-busan-hall"],"20260912-the-fan-daegu":["exco-west"],"20261004-the-fan-goyang":["kintex-second","grandma-sister","gogichanggo","dowon","kitsuki","hibi","thailicious"],"20261010-the-fan-cheongju":["cju-seokwoo","elephant","pyeonbaek","dalma","stonefalls","ohji"],"20261017-the-fan-suwon":["khu-seonseung"],"20261031-the-fan-incheon":["namdong-gymnasium"],"20260531-seeya-baekban":["aengdu","baekhap","chowon"],"v4145-NIeNbStvYa0":["byeongang","maboklim","yupdduk"],"v488-audit-041":["mother","choding","ijinri"],"v4145-60dNYPs5RJ4":["fingers-hotdog","pongdang-ramyeon","eq-table","sinchang-coast"],"v4145-jVCa6jPn3JA":["chunmihyang","jeopjjak","dufore-jeju"],"v4145-pmhw1lyc0M4":["geumak-noodles","innisfree-jeju","mippeun-bakery","geum-oreum","isidore-farm"],"v4145-UHwGZGI-nyE":["joyang-bangjik"],"v475-sheet2-row31":["rully-gachang"],"v4145-frUkQQcK6iQ":["about-project-jamsil"],"v4145-WsyxwPl55wQ":["ulsan-art-museum"],"v4145-D2g3gaQdqVI":["dongmyo-area"],"v4145-DEEQmmrQLgs":["apgujeong-haru"],"v4145-_AbFDbCDAHI":["jungmun-byeoljang"],"20240906-yeonji-dosan-photo":["dosan-butcher"],"20250728-yeonji-yoozzy-live":["yoozzy"],"20240727-gyuri-gonggan-photo":["gonggan-yang"],"20260914-seeya-woorineun-photo":["woorineun-suseong"],"20240215-boram-birthday-fancafe":["ikcoffee-historic"],"20260330-rebloom-fanmeeting":["edls"],"20260312-reunion-announced":["express-bus-terminal-fan-ad"],"v4145-c8NnJNnkvt0":["haeundae-busking"],"v4145-b8d3lpKFLrE":["gwangalli"],"v488-audit-046":["gukje-market","bupyeong-market"],"20260405-gyuri-first-pitch":["gocheok-skydome"],"v4145-5CD4IThQet0":["avenue-of-stars"],"v4145-05rfQa2tRYw":["cheonjiyeon"],"v4145-HQQl-3OPp0U":["yeonjuam","yeonjudae"],"v490-marie-press":["dcube-historic"],"v491-lux":["seongam-hall"],"v490-hug2019":["smtown-theater-historic"],"v490-boramhada":["sh-art-hall"],"v490-daegu2017":["bongsan-gaon"],"v491-still-singing":["sungshin-unjeong"],"20260502-boram-sparkle-busan":["busan-cinema-haneul"],"v487-2026-008":["music-station-1939"],"v475-sheet2-row17":["hannam-gamjatang"],"20190120-boram-geumdwaeji-photo":["geumdwaeji-sikdang"],"20261009-boram-worldmom-yongin":["ict-valley-floria"],"20240503-gyuri-sbs-chuncheon":["old-kim-you-jeong-station","uiam-lake"]}};
},
"src/client/kakao-map.js":function(module,exports,__require){
'use strict';
// SDK-only adapter. Search/filter operates on our saved places, never Local APIs.
const isDomestic=coordinates=>Array.isArray(coordinates)&&coordinates[0]>=32&&coordinates[0]<=39.5&&coordinates[1]>=124&&coordinates[1]<=132;
function mountKakaoMap(config,{onReady,onError}){
 if(!/^[a-f0-9]{32}$/i.test(config?.javascriptKey||'')){onError('configuration');return;}
 let settled=false,timer;
 const fail=()=>{if(settled)return;settled=true;clearTimeout(timer);onError('unavailable');};
 const initialize=()=>{
  if(settled)return;
  try{
   const k=window.kakao.maps,el=document.getElementById('seeyaMap');
   const point=c=>new k.LatLng(c[0],c[1]);
   const nativeMap=new k.Map(el,{center:point([36,127.8]),level:12});
   nativeMap.setMinLevel(1);nativeMap.setMaxLevel(14);
   // Keep the provider's logo/copyright and standard controls unobstructed.
   nativeMap.addControl(new k.ZoomControl(),k.ControlPosition.RIGHT);
   let overlays=[],tileTimer;
   const watchTiles=()=>{clearTimeout(tileTimer);tileTimer=setTimeout(()=>onError('tiles'),15000);};
   k.event.addListener(nativeMap,'tilesloaded',()=>{clearTimeout(tileTimer);document.getElementById('mapError').hidden=true;});
   // All zoom values exposed to the UI increase as you zoom in.
   const controller={
    setView(c,z){if(!isDomestic(c))return;nativeMap.setLevel(Math.max(1,Math.min(14,19-z)));nativeMap.setCenter(point(c));},
    getZoom:()=>19-nativeMap.getLevel(),
    fitBounds(coords,options={}){
     const points=coords.filter(isDomestic);if(!points.length)return;
     const b=new k.LatLngBounds();points.forEach(c=>b.extend(point(c)));
     const padding=options.padding?.[0]??40;nativeMap.setBounds(b,padding,padding,padding,padding);
     if(options.maxZoom&&controller.getZoom()>options.maxZoom)nativeMap.setLevel(19-options.maxZoom);
    },
    latLngToContainerPoint:c=>nativeMap.getProjection().containerPointFromCoords(point(c)),
    invalidateSize(){const center=nativeMap.getCenter();nativeMap.relayout();nativeMap.setCenter(center);},
    getBounds(){const b=nativeMap.getBounds(),sw=b.getSouthWest(),ne=b.getNorthEast();return {getSouth:()=>sw.getLat(),getNorth:()=>ne.getLat(),getWest:()=>sw.getLng(),getEast:()=>ne.getLng()};},
    on(events,fn){k.event.addListener(nativeMap,events==='click'?'click':'idle',fn);},
    clearPins(){overlays.forEach(o=>o.setMap(null));overlays=[];},
    addPin({coordinates,label,html,onClick}){
     const button=document.createElement('button');button.type='button';button.className='map-kakao-pin';button.title=label;button.setAttribute('aria-label',label);button.innerHTML=html;
     button.addEventListener('click',e=>{e.stopPropagation();k.event.preventMap();onClick();});
     const overlay=new k.CustomOverlay({map:nativeMap,position:point(coordinates),content:button,xAnchor:.5,yAnchor:1,clickable:true,zIndex:3});overlays.push(overlay);
    }
   };
   settled=true;clearTimeout(timer);watchTiles();onReady(controller);
  }catch(error){fail();}
 };
 const loaded=()=>{if(settled)return;try{if(!window.kakao?.maps?.load)throw Error('Missing SDK');window.kakao.maps.load(initialize);}catch{fail();}};
 timer=setTimeout(fail,15000);
 if(window.kakao?.maps?.load){loaded();return;}
 // One SDK request per page. No retry loops and no services/Places/geocoder library.
 const script=document.createElement('script');script.id='seeyaKakaoSdk';script.async=true;
 script.src='https://dapi.kakao.com/v2/maps/sdk.js?autoload=false&appkey='+encodeURIComponent(config.javascriptKey);
 script.onload=loaded;script.onerror=fail;document.head.appendChild(script);
}
module.exports={mountKakaoMap,isDomestic};

}
};const cache={};function __require(id){if(cache[id])return cache[id].exports;const m=cache[id]={exports:{}};modules[id](m,m.exports,__require);return m.exports;}__require("src/client/seeya-map.js");})();
