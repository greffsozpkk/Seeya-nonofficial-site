(function(){'use strict';const modules={
"src/client/seeya-map.js":function(module,exports,__require){
'use strict';
const {filterPlaces,cards,detail,groupPins,esc}=__require("src/shared/seeya-map.js");
const data=JSON.parse(document.getElementById('mapData').textContent);
const $=id=>document.getElementById(id),workspace=document.querySelector('.map-workspace');
const state={query:'',member:'전체',region:'전체',category:'전체',sort:'tour',bounds:null};
let selected=null,map=null,pins=null,rows=data.places,tileTimer;
function view(which){workspace.dataset.view=which;document.querySelectorAll('[data-map-view]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.mapView===which)));if(which==='map'&&map)requestAnimationFrame(()=>map.invalidateSize());}
function closeDetail(focus=false){const previous=selected;selected=null;$('mapBrowse').hidden=false;$('mapDetail').hidden=true;$('mapSelectedMobile').hidden=true;$('mapHint').textContent='장소를 선택하면 씨야와의 이야기와 방문 정보를 볼 수 있어요.';renderList();renderPins();if(focus)document.querySelector('[data-place="'+previous+'"]')?.focus();}
async function copyAddress(p){
 try{if(!navigator.clipboard?.writeText)throw Error('Clipboard unavailable');await navigator.clipboard.writeText(p.address);$('mapCopyStatus').textContent='주소를 복사했어요.';}
 catch{const range=document.createRange();range.selectNodeContents($('mapAddress'));const selection=window.getSelection();selection.removeAllRanges();selection.addRange(range);$('mapCopyStatus').textContent='자동 복사가 지원되지 않아요. 선택된 주소를 길게 눌러 복사해 주세요.';}
}
function selectPlace(id,{pan=true}={}){
 const p=rows.find(x=>x.id===id);if(!p)return;
 selected=id;$('mapBrowse').hidden=true;$('mapDetail').hidden=false;$('mapDetail').innerHTML=detail(p);$('mapBack').onclick=()=>closeDetail(true);$('mapCopy').onclick=()=>copyAddress(p);
 $('mapHint').textContent=p.name+' · '+p.date;$('mapSelectedMobile').textContent=p.city+' · '+p.name+'　상세 보기 ›';$('mapSelectedMobile').hidden=false;
 document.querySelector('.map-sidebar').scrollTop=0;
 if(window.matchMedia('(max-width: 760px)').matches)view('list');
 $('mapDetailTitle').focus({preventScroll:true});renderList();renderPins();
 if(map&&pan)map.setView(p.coordinates,Math.max(map.getZoom(),12));
}
function renderList(){
 $('mapList').innerHTML=cards(rows,selected);$('mapEmpty').hidden=rows.length>0;
 $('mapCount').innerHTML=(state.bounds?'이 지역 장소':'전체 장소')+' <em>'+rows.length+'</em>';$('mapMobileCount').textContent=rows.length;$('mapClearArea').hidden=!state.bounds;
}
function renderPins(){
 if(!map||!pins)return;pins.clearLayers();
 const groups=groupPins(rows,c=>map.latLngToContainerPoint(c),map.getZoom()>=13?0:46);
 for(const group of groups){
  const many=group.items.length>1,p=group.items[0],active=group.items.some(p=>p.id===selected);
  const center=many?[group.items.reduce((n,p)=>n+p.coordinates[0],0)/group.items.length,group.items.reduce((n,p)=>n+p.coordinates[1],0)/group.items.length]:p.coordinates;
  const label=many?group.items.map(p=>p.city).join(' · ')+' 공연장 '+group.items.length+'곳 확대':p.name+' 상세 보기';
  const marker=L.marker(center,{title:label,alt:label,keyboard:true,icon:L.divIcon({className:'map-pin-wrap',html:`<span class="${many?'map-cluster':'map-pin'} ${active?'is-active':''}">${many?group.items.length:'♥'}</span>`,iconSize:[42,48],iconAnchor:[21,42]})}).addTo(pins);
  marker.getElement()?.setAttribute('aria-label',label);
  marker.on('click',()=>{if(many)map.fitBounds(group.items.map(p=>p.coordinates),{padding:[65,65],maxZoom:13});else selectPlace(p.id);});
  marker.bindTooltip(many?group.items.length+'곳의 공연장':esc(p.city+' · '+p.name),{direction:'top',offset:[0,-32]});
 }
}
function filter(){rows=filterPlaces(data.places,state);if(selected&&!rows.some(p=>p.id===selected))closeDetail();renderList();renderPins();}
function reset(){Object.assign(state,{query:'',member:'전체',region:'전체',category:'전체',bounds:null,sort:'tour'});$('mapSearch').value='';$('mapRegion').value='전체';$('mapSort').value='tour';document.querySelectorAll('[data-member],[data-category]').forEach(b=>b.setAttribute('aria-pressed',String((b.dataset.member||b.dataset.category)==='전체')));filter();}
$('mapSearch').addEventListener('input',e=>{state.query=e.target.value;state.bounds=null;filter();});
$('mapRegion').addEventListener('change',e=>{state.region=e.target.value;state.bounds=null;filter();if(map&&rows.length)map.fitBounds(rows.map(p=>p.coordinates),{padding:[70,70],maxZoom:10});});
$('mapSort').addEventListener('change',e=>{state.sort=e.target.value;filter();});
document.querySelectorAll('[data-member],[data-category]').forEach(b=>b.addEventListener('click',()=>{const key=b.dataset.member?'member':'category';state[key]=b.dataset[key];document.querySelectorAll('[data-'+key+']').forEach(x=>x.setAttribute('aria-pressed',String(x===b)));filter();}));
$('mapList').addEventListener('click',e=>{const b=e.target.closest('[data-place]');if(b)selectPlace(b.dataset.place);});
$('mapReset').onclick=reset;$('mapClearArea').onclick=()=>{state.bounds=null;filter();};
document.querySelectorAll('[data-map-view]').forEach(b=>b.onclick=()=>view(b.dataset.mapView));
$('mapSelectedMobile').onclick=()=>view('list');
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&selected)closeDetail(true);});
function mapFailure(){clearTimeout(tileTimer);$('mapError').hidden=false;$('mapError').textContent='지도를 불러오지 못했어요. 목록에서 장소·주소·길찾기를 계속 이용할 수 있어요.';}
function national(){state.bounds=null;filter();map.fitBounds([[33.05,125.5],[38.55,130.1]],{padding:[25,25]});}
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
 tiles.addTo(map);map.on('moveend zoomend',renderPins);national();
 $('mapNation').disabled=false;$('mapArea').disabled=false;$('mapNation').onclick=national;
 $('mapArea').onclick=()=>{const b=map.getBounds();state.bounds={south:b.getSouth(),north:b.getNorth(),west:b.getWest(),east:b.getEast()};filter();if(window.matchMedia('(max-width:760px)').matches)view('list');};
 const observer=new ResizeObserver(()=>map.invalidateSize());observer.observe($('seeyaMap'));
}catch(error){mapFailure();view('list');}
filter();

},
"src/shared/seeya-map.js":function(module,exports,__require){
'use strict';
const esc=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function resolvePlaces(config,archive){
 const byId=new Map(archive.map(row=>[row.id,row]));
 return config.places.flatMap(place=>{
  const row=byId.get(place.recordId);
  // Deleted or merged records are excluded; archive dates and names are resolved at build time.
  if(!row||row.hidden||row.mergedInto)return [];
  if(!Array.isArray(place.coordinates)||place.coordinates.length!==2||!place.coordinates.every(Number.isFinite))throw Error('Invalid place coordinates: '+place.id);
  return [{...place,name:row.venue,title:row.title,date:row.date,time:row.calendar?.time||'',eventState:row.eventState||'',members:row.members||[],category:'공연장',source:row.source,checkedAt:config.checkedAt}];
 });
}
function filterPlaces(rows,{query='',member='전체',region='전체',category='전체',bounds=null,sort='tour'}={}){
 const words=query.trim().toLocaleLowerCase().split(/\s+/).filter(Boolean);
 return rows.filter(p=>words.every(w=>[p.name,p.city,p.locality,p.address,p.title,...p.members].join(' ').toLocaleLowerCase().includes(w))&&(member==='전체'||member==='씨야'||p.members.includes(member))&&(region==='전체'||p.region===region)&&(category==='전체'||p.category===category)&&(!bounds||(p.coordinates[0]>=bounds.south&&p.coordinates[0]<=bounds.north&&p.coordinates[1]>=bounds.west&&p.coordinates[1]<=bounds.east))).sort((a,b)=>sort==='name'?a.name.localeCompare(b.name,'ko'):sort==='newest'?b.date.localeCompare(a.date):a.date.localeCompare(b.date));
}
function badge(p){return p.eventState==='cancelled'?'공연 취소':p.eventState==='scheduled'?'공연 예정':'공연 기록';}
function cards(rows,selected){return rows.map((p,i)=>`<li><button type="button" class="map-place-card ${p.id===selected?'is-selected':''}" data-place="${esc(p.id)}" aria-pressed="${p.id===selected}"><span class="map-ticket map-ticket-${i%4}" aria-hidden="true"><small>THE FAN</small><strong>${esc(p.city)}</strong><span>20TH ANNIVERSARY</span></span><span class="map-card-copy"><strong>${esc(p.name)}</strong><span class="map-location">⌖ ${esc(p.locality||p.address.split(' ').slice(0,2).join(' '))}</span><span class="map-card-meta"><span class="map-tag">공연장</span><time>${esc(p.date.replaceAll('-','.'))}</time></span></span><span class="map-card-arrow" aria-hidden="true">›</span></button></li>`).join('');}
function detail(p){
 const directions='https://map.kakao.com/link/to/'+encodeURIComponent(p.name)+','+p.coordinates.join(',');
 return `<button type="button" id="mapBack" class="map-back">← 장소 목록</button><div class="map-detail-cover"><span>SEEYA · 20TH ANNIVERSARY TOUR</span><strong>THE FAN</strong><span>${esc(p.city)} · ${esc(p.date.replaceAll('-','.'))}</span></div><span class="map-tag">공연장 · ${badge(p)}</span><h2 id="mapDetailTitle" tabindex="-1">${esc(p.name)}</h2><p class="map-story">씨야 20주년 전국 투어 ‘THE FAN’ ${esc(p.city)} 공연이 연결된 장소입니다.</p><dl><dt>공연</dt><dd>${esc(p.date)}${p.time?' · '+esc(p.time):''}<br>씨야 · 남규리 · 김연지 · 이보람</dd><dt>주소</dt><dd id="mapAddress">${esc(p.address)}</dd></dl><div class="map-detail-actions"><button id="mapCopy" type="button">주소 복사</button><a href="${esc(directions)}" target="_blank" rel="noopener">길찾기 ↗</a></div><p id="mapCopyStatus" class="map-small" role="status"></p>${p.note?'<p class="map-place-note">'+esc(p.note)+'</p>':''}<div class="map-record-links"><a href="/archive/?record=${encodeURIComponent(p.recordId)}" target="_blank" rel="noopener">공연 아카이브 보기 ↗</a>${p.source?.url&&/^https?:\/\//.test(p.source.url)?`<a href="${esc(p.source.url)}" target="_blank" rel="noopener">${esc(p.source.label||'기록 출처')} ↗</a>`:''}<a href="/archive/concerts/the-fan-2026/" target="_blank" rel="noopener">20주년 콘서트 기록관 ↗</a></div><details class="map-evidence"><summary>장소 정보 출처</summary><a href="${esc(p.addressSource)}" target="_blank" rel="noopener">주소 확인 자료 ↗</a><a href="${esc(p.coordinateSource)}" target="_blank" rel="noopener">OpenStreetMap 시설 위치 ↗</a><p>위치 확인 ${esc(p.checkedAt)} · 건물·시설 단위의 위치입니다. 입장 시간과 출입구는 공연 안내를 확인해 주세요.</p></details>`;
}
// Screen-space grouping only; no extra clustering plugin or additional map requests.
function groupPins(rows,project,radius=44){
 const groups=[];
 for(const p of rows){const point=project(p.coordinates);const g=groups.find(g=>Math.hypot(point.x-g.x,point.y-g.y)<radius);if(g)g.items.push(p);else groups.push({x:point.x,y:point.y,items:[p]});}
 return groups;
}
module.exports={resolvePlaces,filterPlaces,cards,detail,groupPins,esc};

}
};const cache={};function __require(id){if(cache[id])return cache[id].exports;const m=cache[id]={exports:{}};modules[id](m,m.exports,__require);return m.exports;}__require("src/client/seeya-map.js");})();
