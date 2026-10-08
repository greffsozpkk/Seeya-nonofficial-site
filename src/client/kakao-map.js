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
