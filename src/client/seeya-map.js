'use strict';
const {filterPlaces,cards,detail,groupPins,esc,tone}=require('../shared/seeya-map');
const data=JSON.parse(document.getElementById('mapData').textContent);
const $=id=>document.getElementById(id),workspace=document.querySelector('.map-workspace');
const state={query:'',member:'전체',region:'전체',category:'전체',relation:'전체',sort:'tour',bounds:null};
let selected=null,map=null,pins=null,rows=data.places,tileTimer;
function view(which){workspace.dataset.view=which;document.querySelectorAll('[data-map-view]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.mapView===which)));if(which==='map'&&map)requestAnimationFrame(()=>map.invalidateSize());}
function closeDetail(focus=false){const previous=selected;selected=null;$('mapBrowse').hidden=false;$('mapDetail').hidden=true;$('mapSelectedMobile').hidden=true;$('mapHint').textContent='장소를 선택하면 씨야와의 이야기와 방문 정보를 볼 수 있어요.';renderList();renderPins();if(focus)document.querySelector('[data-place="'+previous+'"]')?.focus();}
async function copyAddress(p){
 try{if(!navigator.clipboard?.writeText)throw Error('Clipboard unavailable');await navigator.clipboard.writeText(p.address);$('mapCopyStatus').textContent='주소를 복사했어요.';}
 catch{const range=document.createRange();range.selectNodeContents($('mapAddress'));const selection=window.getSelection();selection.removeAllRanges();selection.addRange(range);$('mapCopyStatus').textContent='자동 복사가 지원되지 않아요. 선택된 주소를 길게 눌러 복사해 주세요.';}
}
function selectPlace(id,{pan=true}={}){
 const p=rows.find(x=>x.id===id);if(!p)return;
 selected=id;$('mapBrowse').hidden=true;$('mapDetail').hidden=false;$('mapDetail').innerHTML=detail(p,new Date());$('mapBack').onclick=()=>closeDetail(true);$('mapCopy').onclick=()=>copyAddress(p);
 $('mapHint').textContent=p.name+' · '+p.date;$('mapSelectedMobile').textContent=p.city+' · '+p.name+'　상세 보기 ›';$('mapSelectedMobile').hidden=false;
 document.querySelector('.map-sidebar').scrollTop=0;
 if(window.matchMedia('(max-width: 760px)').matches)view('list');
 $('mapDetailTitle').focus({preventScroll:true});renderList();renderPins();
 if(map&&pan)map.setView(p.coordinates,Math.max(map.getZoom(),12));
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
  const label=many?group.items.map(p=>p.city).join(' · ')+' 장소 '+group.items.length+'곳 확대':p.name+' 상세 보기';
  const marker=L.marker(center,{title:label,alt:label,keyboard:true,icon:L.divIcon({className:'map-pin-wrap',html:`<span class="${many?'map-cluster':'map-pin map-pin-'+tone(p)} ${active?'is-active':''}">${many?group.items.length:'♥'}</span>`,iconSize:[42,48],iconAnchor:[21,42]})}).addTo(pins);
  marker.getElement()?.setAttribute('aria-label',label);
  marker.on('click',()=>{if(many)map.fitBounds(group.items.map(p=>p.coordinates),{padding:[65,65],maxZoom:13});else selectPlace(p.id);});
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
