(function(){'use strict';const modules={
"src/client/seeya-map.js":function(module,exports,__require){
'use strict';
const {filterPlaces,cards,detail,groupPins,esc,tone}=__require("src/shared/seeya-map.js");
const data=JSON.parse(document.getElementById('mapData').textContent);
const $=id=>document.getElementById(id),workspace=document.querySelector('.map-workspace');
const state={query:'',member:'전체',region:'전체',category:'전체',relation:'전체',sort:'tour',bounds:null};
const mobile=window.matchMedia('(max-width: 760px)'),sidebar=document.querySelector('.map-sidebar');
let selected=null,map=null,pins=null,rows=data.places,tileTimer;
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
 if(map&&pan&&from==='list')map.setView(p.coordinates,Math.max(map.getZoom(),12),{animate:false});
}
function renderList(){
 $('mapList').innerHTML=cards(rows,selected,new Date());$('mapEmpty').hidden=rows.length>0;
 $('mapCount').innerHTML=(state.bounds?'이 지역 장소':'전체 장소')+' <em>'+rows.length+'</em>';$('mapMobileCount').textContent=rows.length;$('mapClearArea').hidden=!state.bounds;
}
function renderPins(){
 if(!map||!pins)return;pins.clearLayers();
 const groups=groupPins(rows,c=>map.latLngToContainerPoint(c),map.getZoom()>=13?0:46);
 for(const group of groups){
  const many=group.items.length>1,p=group.items[0],active=group.items.some(p=>p.id===selected);
  const center=many?[group.items.reduce((n,p)=>n+p.coordinates[0],0)/group.items.length,group.items.reduce((n,p)=>n+p.coordinates[1],0)/group.items.length]:p.coordinates;
  const label=many?group.items.map(p=>p.city).join(' · ')+' 장소 '+group.items.length+'곳 확대':p.name+' 장소 선택';
  const marker=L.marker(center,{title:label,alt:label,keyboard:true,bubblingMouseEvents:false,icon:L.divIcon({className:'map-pin-wrap',html:`<span class="${many?'map-cluster':'map-pin map-pin-'+tone(p)} ${active?'is-active':''}">${many?group.items.length:'♥'}</span>`,iconSize:[42,48],iconAnchor:[21,42]})}).addTo(pins);
  marker.getElement()?.setAttribute('aria-label',label);
  marker.on('click',()=>{if(many)map.fitBounds(group.items.map(p=>p.coordinates),{padding:[65,65],maxZoom:13});else selectPlace(p.id,{from:'map',pan:false});});
  marker.bindTooltip(many?group.items.length+'곳의 장소':esc(p.city+' · '+p.name),{direction:'top',offset:[0,-32]});
 }
}
function filter(){rows=filterPlaces(data.places,state);if(selected&&!rows.some(p=>p.id===selected))closeDetail();renderList();renderPins();}
function reset(){Object.assign(state,{query:'',member:'전체',region:'전체',category:'전체',relation:'전체',bounds:null,sort:'tour'});$('mapSearch').value='';$('mapRegion').value='전체';$('mapRelation').value='전체';$('mapSort').value='tour';document.querySelectorAll('[data-member],[data-category]').forEach(b=>b.setAttribute('aria-pressed',String((b.dataset.member||b.dataset.category)==='전체')));filter();}
$('mapSearch').addEventListener('input',e=>{state.query=e.target.value;state.bounds=null;filter();});
$('mapRegion').addEventListener('change',e=>{state.region=e.target.value;state.bounds=null;filter();if(map&&rows.length)map.fitBounds(rows.map(p=>p.coordinates),{padding:[70,70],maxZoom:10});});
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
function mapFailure(){clearTimeout(tileTimer);$('mapError').hidden=false;$('mapError').textContent='지도를 불러오지 못했어요. 목록에서 장소·주소·길찾기를 계속 이용할 수 있어요.';}
function national(){state.bounds=null;filter();map.fitBounds([[33.05,125.5],[38.55,130.1]],{padding:[25,25],animate:false});}
try{
 if(typeof L==='undefined')throw Error('Map library unavailable');
 map=L.map('seeyaMap',{zoomControl:false,minZoom:6,maxZoom:18,scrollWheelZoom:true}).setView([36,127.8],7);pins=L.layerGroup().addTo(map);
 L.control.zoom({position:'bottomright',zoomInTitle:'지도 확대',zoomOutTitle:'지도 축소'}).addTo(map);
 map.attributionControl.setPrefix('<a href="https://leafletjs.com" target="_blank" rel="noopener">Leaflet</a>');
 const tiles=L.tileLayer(data.tileUrl,{maxZoom:19,attribution:'© <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">OpenStreetMap</a> contributors'});
 let failed=0,loaded=0;
 tiles.on('loading',()=>{failed=0;loaded=0;clearTimeout(tileTimer);tileTimer=setTimeout(mapFailure,12000);});
 tiles.on('tileload',()=>{loaded++;clearTimeout(tileTimer);});
 tiles.on('tileerror',()=>{failed++;mapFailure();});
 tiles.on('load',()=>{clearTimeout(tileTimer);if(loaded&&!failed)$('mapError').hidden=true;});
 tiles.addTo(map);map.on('moveend zoomend',renderPins);map.on('click',()=>{if(mobile.matches&&screen.view==='map'&&selected)dismissSelection();});national();
 $('mapNation').disabled=false;$('mapArea').disabled=false;$('mapNation').onclick=national;
 $('mapArea').onclick=()=>{const b=map.getBounds();state.bounds={south:b.getSouth(),north:b.getNorth(),west:b.getWest(),east:b.getEast()};filter();};
 const observer=new ResizeObserver(()=>map.invalidateSize());observer.observe($('seeyaMap'));
}catch(error){mapFailure();navigate({view:'list',origin:'list'},{replace:true});}
filter();

paintScreen();
mobile.addEventListener?.('change',()=>{const canvas=document.querySelector('.map-canvas-panel');if(canvas)canvas.inert=mobile.matches&&screen.view==='detail';});

},
"src/shared/seeya-map.js":function(module,exports,__require){
'use strict';
const esc=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const link=(url,label)=>/^https?:\/\//.test(url||'')?`<a href="${esc(url)}" target="_blank" rel="noopener">${esc(label)} ↗</a>`:'';
function resolvePlaces(config,archive){
 const byId=new Map(archive.map(row=>[row.id,row]));
 return config.places.flatMap(({archiveExclusion,...place})=>{
  const row=byId.get(place.recordId);
  // Concert metadata stays joined to the archive. Other places retain their own identity.
  if(!place.name&&(!row||row.hidden||row.mergedInto))return [];
  if(!Array.isArray(place.coordinates)||place.coordinates.length!==2||!place.coordinates.every(Number.isFinite))throw Error('Invalid place coordinates: '+place.id);
  if(place.name)return [{...place,recordId:row&&!row.hidden&&!row.mergedInto?row.id:null,checkedAt:config.checkedAt}];
  return [{...place,tourVenue:true,name:row.venue,title:row.title,date:row.date,dateBasis:'공연일',time:row.calendar?.time||'',eventState:row.eventState||'',members:row.members||[],group:'씨야',category:'공연장',relations:['공연'],source:row.source,checkedAt:config.checkedAt}];
 });
}
function filterPlaces(rows,{query='',member='전체',region='전체',category='전체',relation='전체',bounds=null,sort='tour'}={}){
 const words=query.trim().toLocaleLowerCase().split(/\s+/).filter(Boolean);
 return rows.filter(p=>words.every(w=>[p.name,p.city,p.locality,p.address,p.title,p.story,...p.members,...p.relations].join(' ').toLocaleLowerCase().includes(w))&&(member==='전체'||(member==='씨야'?p.group==='씨야':p.members.includes(member)))&&(region==='전체'||p.region===region)&&(category==='전체'||p.category===category)&&(relation==='전체'||p.relations.includes(relation))&&(!bounds||(p.coordinates[0]>=bounds.south&&p.coordinates[0]<=bounds.north&&p.coordinates[1]>=bounds.west&&p.coordinates[1]<=bounds.east))).sort((a,b)=>sort==='name'?a.name.localeCompare(b.name,'ko'):sort==='newest'?b.date.localeCompare(a.date):a.date.localeCompare(b.date));
}
function promoStatus(p,now=p.checkedAt+'T12:00:00+09:00'){
 if(!p.promotion)return '';
 const t=new Date(now).getTime(),start=new Date(p.promotion.start+'T00:00:00+09:00').getTime(),end=new Date(p.promotion.endsAt||p.promotion.end+'T23:59:59+09:00').getTime();
 return t<start?'혜택 예정':t>end?'혜택 종료':'혜택 기간';
}
function badge(p,now){return p.operatingStatus==='closed'?'영업 종료 · 과거 기록':p.promotion?promoStatus(p,now):p.category==='공연장'?(p.eventState==='cancelled'?'공연 취소':p.eventState==='scheduled'?'공연 예정':p.relations.includes('팬 행사')?'팬 행사 기록':'공연 기록'):p.relations.join(' · ');}
const tone=p=>({'공연장':'venue','카페':'cafe','식당':'food','문화공간':'culture','여행·자연':'nature','쇼핑':'shopping'}[p.category]||'culture');
const ticket=p=>p.tourVenue?'THE FAN':({'venue':'STAGE','cafe':'COFFEE','food':'TABLE','culture':'CULTURE','nature':'JOURNEY','shopping':'WALK'}[tone(p)]);
function cards(rows,selected,now){return rows.map(p=>`<li><button type="button" class="map-place-card ${p.id===selected?'is-selected':''}" data-place="${esc(p.id)}" aria-pressed="${p.id===selected}"><span class="map-ticket map-ticket-${tone(p)}" aria-hidden="true"><small>${ticket(p)}</small><strong>${esc(p.city)}</strong><span>${esc(p.category)}</span></span><span class="map-card-copy"><strong>${esc(p.name)}</strong><span class="map-location">⌖ ${esc(p.locality||p.address.split(' ').slice(0,2).join(' '))}</span><span class="map-card-meta"><span class="map-tag map-tag-${tone(p)}">${esc(p.category)}</span><span class="map-card-status">${esc(badge(p,now))}</span></span><span class="map-card-date">${esc(p.date.replaceAll('-','.'))} · ${esc(p.dateBasis)}</span></span><span class="map-card-arrow" aria-hidden="true">›</span></button></li>`).join('');}
function detail(p,now){
 const concert=p.tourVenue===true,area=p.locationPrecision==='area',closed=p.operatingStatus==='closed',overseas=p.country&&p.country!=='KR',directions=overseas?'https://www.google.com/maps/search/?api=1&query='+encodeURIComponent(p.coordinates.join(',')):'https://map.kakao.com/link/'+(area||closed?'map/':'to/')+encodeURIComponent(p.name)+','+p.coordinates.join(','),record=p.relatedRecordId||p.recordId;
 const promotion=p.promotion?`<section class="map-promotion ${promoStatus(p,now)==='혜택 종료'?'is-ended':''}"><strong>${esc(promoStatus(p,now))}</strong><p>${esc(p.promotion.benefit)}</p><p>${esc(p.promotion.start)}${p.promotion.end!==p.promotion.start?' ~ '+esc(p.promotion.end):''}${p.promotion.endsAt?' · 10월 11일 새벽 1시 종료':''}</p><p>${esc(p.promotion.condition)}</p>${link(p.promotion.sourceUrl,'혜택 원문 확인')}</section>`:'';
 return `<button type="button" id="mapSheetHandle" class="map-sheet-handle" aria-label="장소 요약으로 접기"><span></span></button><button type="button" id="mapBack" class="map-back">← 장소 목록</button><div class="map-detail-cover map-cover-${tone(p)}"><span>${concert?'SEEYA · 20TH ANNIVERSARY TOUR':esc(p.category+' · '+p.relations.join(' / '))}</span><strong>${concert?'THE FAN':esc(p.city)}</strong><span>${esc(p.city)} · ${esc(p.date.replaceAll('-','.'))} ${esc(p.dateBasis)}</span></div><span class="map-tag map-tag-${tone(p)}">${esc(badge(p,now))}</span><h2 id="mapDetailTitle" tabindex="-1">${esc(p.name)}</h2><p class="map-story">${esc(p.story||`씨야 20주년 전국 투어 ‘THE FAN’ ${p.city} 공연이 연결된 장소입니다.`).replace(/\n/g,'<br>')}</p><dl><dt>${concert?'공연':'관련 멤버'}</dt><dd>${concert?esc(p.date)+(p.time?' · '+esc(p.time):'')+'<br>':''}${esc(p.members.join(' · '))}</dd><dt>주소</dt><dd id="mapAddress">${esc(p.address)}</dd></dl><div class="map-detail-actions"><button id="mapCopy" type="button">주소 복사</button><a href="${esc(directions)}" target="_blank" rel="noopener">${closed?'옛 위치 보기':overseas?'지도 보기':area?'지역 지도':'길찾기'} ↗</a></div><p id="mapCopyStatus" class="map-small" role="status"></p>${promotion}${p.note?'<p class="map-place-note">'+esc(p.note)+'</p>':''}<div class="map-record-links">${record?`<a href="/archive/?record=${encodeURIComponent(record)}" target="_blank" rel="noopener">관련 아카이브 보기 ↗</a>`:''}${link(p.source?.url,p.source?.label||'기록 출처')}${(p.evidence||[]).map(e=>link(e.url,e.label)).join('')}${concert?'<a href="/archive/concerts/the-fan-2026/" target="_blank" rel="noopener">20주년 콘서트 기록관 ↗</a>':''}</div><details class="map-evidence"><summary>장소 정보 출처</summary>${link(p.addressSource,'주소 확인 자료')}${link(p.coordinateSource,'지도 위치 확인 자료')}<p>자료 확인 ${esc(p.checkedAt)} · ${area?'지역·시설의 대표 위치이며 정확한 촬영 지점은 아닙니다.':'건물·매장 단위의 위치입니다.'} ${concert?'입장 시간과 출입구는 공연 안내를 확인해 주세요.':['식당','카페'].includes(p.category)?'영업 시간·이전·휴무 여부는 방문 전 매장 안내를 확인해 주세요.':'방문 가능한 구역과 운영 안내는 해당 장소의 최신 안내를 확인해 주세요.'}</p></details>`;
}
function groupPins(rows,project,radius=44){
 const groups=[];
 for(const p of rows){const point=project(p.coordinates);const g=groups.find(g=>Math.hypot(point.x-g.x,point.y-g.y)<radius);if(g)g.items.push(p);else groups.push({x:point.x,y:point.y,items:[p]});}
 return groups;
}
module.exports={resolvePlaces,filterPlaces,cards,detail,groupPins,esc,promoStatus,tone};

}
};const cache={};function __require(id){if(cache[id])return cache[id].exports;const m=cache[id]={exports:{}};modules[id](m,m.exports,__require);return m.exports;}__require("src/client/seeya-map.js");})();
