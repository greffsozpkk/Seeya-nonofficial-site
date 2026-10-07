'use strict';
const {filterPlaces,cards,detail,groupPins,esc,tone}=require('../shared/seeya-map');
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
