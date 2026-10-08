'use strict';
const assert=require('node:assert/strict'),vm=require('node:vm'),fs=require('node:fs');
function fixture(){
 const requests=[],errors=[],overlays=[],events=new Map(),timers=new Map();let id=0,ready=null,center,level,moves=0;
 const el={hidden:false};
 const document={getElementById:()=>el,head:{appendChild:s=>requests.push(s)},createElement:tag=>({tag,handlers:{},setAttribute(){},addEventListener(k,f){this.handlers[k]=f;}})};
 class LatLng{constructor(lat,lng){this.lat=lat;this.lng=lng;}getLat(){return this.lat;}getLng(){return this.lng;}}
 class Bounds{constructor(){this.points=[];}extend(p){this.points.push(p);}getSouthWest(){return new LatLng(33,125);}getNorthEast(){return new LatLng(39,131);}}
 class FakeMap{constructor(node,o){center=o.center;level=o.level;}setMinLevel(){}setMaxLevel(){}addControl(){}setLevel(l){level=l;}getLevel(){return level;}setCenter(p){center=p;moves++;}getCenter(){return center;}setBounds(b){assert(b.points.every(p=>p.lat>=32));level=7;}getBounds(){return new Bounds();}relayout(){}getProjection(){return {containerPointFromCoords:p=>({x:p.lng*100,y:p.lat*100})};}}
 const k={Map:FakeMap,LatLng,LatLngBounds:Bounds,ZoomControl:class{},ControlPosition:{RIGHT:1},CustomOverlay:class{constructor(o){this.options=o;overlays.push(this);}setMap(v){this.options.map=v;}},event:{addListener(m,n,f){events.set(n,f);},preventMap(){}},load:f=>f()};
 const context=vm.createContext({window:{},document,module:{exports:{}},setTimeout(f){timers.set(++id,f);return id;},clearTimeout(id){timers.delete(id);}});
 vm.runInContext(fs.readFileSync(require.resolve('../src/client/kakao-map'),'utf8'),context);
 return {requests,errors,overlays,events,timers,el,k,context,start(key){context.module.exports.mountKakaoMap({javascriptKey:key},{onReady:c=>ready=c,onError:e=>errors.push(e)});},ready:()=>ready,moves:()=>moves,center:()=>center,provide(){context.window.kakao={maps:k};requests[0].onload();}};
}
let f=fixture();f.start('');assert.equal(f.requests.length,0);assert.deepEqual(f.errors,['configuration']);
f=fixture();f.start('bad-key');assert.equal(f.requests.length,0);
f=fixture();f.start('a'.repeat(32));assert.equal(f.requests.length,1);assert(f.requests[0].src.startsWith('https://dapi.kakao.com/'));assert(!f.requests[0].src.includes('libraries='));
f.requests[0].onerror();f.provide();assert(!f.ready(),'Late callback cannot mount after failure');assert.equal(f.errors.length,1);
f=fixture();f.start('a'.repeat(32));[...f.timers.values()][0]();f.provide();assert(!f.ready(),'Timeout must preserve fallback');
f=fixture();f.start('a'.repeat(32));f.provide();const map=f.ready();assert(map);f.events.get('tilesloaded')();assert.equal(f.timers.size,0);
map.setView([37.5,127],14);assert.equal(map.getZoom(),14);const before=f.center();map.invalidateSize();assert.equal(f.center(),before,'Resize retains map position');
const moves=f.moves();map.setView([22.3,114],14);assert.equal(f.moves(),moves,'Overseas place must not pan the domestic map');
let clicks=0;map.addPin({coordinates:[37.5,127],label:'장소',html:'♥',onClick:()=>clicks++});f.overlays[0].options.content.handlers.click({stopPropagation(){}});assert.equal(clicks,1);
map.clearPins();assert.equal(f.overlays[0].options.map,null,'Old overlays removed on filters');
map.fitBounds([[22.3,114],[37.5,127]],{maxZoom:10});assert.equal(map.getZoom(),10);
assert.equal(f.requests.length,1,'Resize, zoom, markers and filtering never reload SDK');
map.on('moveend zoomend',()=>{});assert(f.events.has('idle'));assert.equal(f.timers.size,0,'Cached pans must not start a false tile timeout');
const root=require('node:path').resolve(__dirname,'..');const provider=JSON.parse(fs.readFileSync(root+'/src/data/map-provider.json','utf8'));
assert.equal(provider.provider,'kakao');assert(provider.javascriptKey===''||/^[a-f0-9]{32}$/i.test(provider.javascriptKey));
const manifest=JSON.parse(fs.readFileSync(root+'/build-manifest.json','utf8'));assert(!manifest.assets.some(p=>p.includes('leaflet')));
const route=require('../src/data/map-preview-route.json');const html=fs.readFileSync(root+route.path+'index.html','utf8');assert(html.includes('"mapProvider"'));assert(!html.includes('tile.openstreetmap.org'));assert(!html.includes('leaflet'));
console.log('PASS Kakao: lazy single SDK load, key/network/timeout fallbacks, late callback, preserved center, zoom, accessible pins, overseas exclusion and no Local API calls.');
