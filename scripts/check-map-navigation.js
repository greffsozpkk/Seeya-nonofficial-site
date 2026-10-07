'use strict';
const assert=require('node:assert/strict'),vm=require('node:vm'),fs=require('node:fs');
const shared=require('../src/shared/seeya-map');
const places=shared.resolvePlaces(require('../src/data/map-places.json'),require('../data/archive.json'));
function fixture(isMobile=true,historyAllowed=true){
 const elements=new Map(),listeners={},mapEvents={},markers=[];
 const el=id=>{if(!elements.has(id))elements.set(id,{hidden:false,textContent:'',innerHTML:'',scrollTop:0,dataset:{},attrs:{},handlers:{},setAttribute(k,v){this.attrs[k]=v;},addEventListener(k,fn){this.handlers[k]=fn;},focus(){focused=id;}});return elements.get(id);};
 let focused='',position=[36,127.8],zoom=7,moves=0;
 const work=el('workspace'),sidebar=el('sidebar'),canvas=el('canvas'),media={matches:isMobile,addEventListener(k,fn){this.change=fn;}};
 const tabs=['map','list'].map(view=>Object.assign(el('tab-'+view),{dataset:{mapView:view}}));
 const historyEntries=[null];let cursor=0;
 const history={state:null,replaceState(s){if(!historyAllowed)throw Error('History disabled');this.state=s;historyEntries[cursor]=s;},pushState(s){historyEntries.splice(++cursor);historyEntries.push(s);this.state=s;},back(){if(cursor){this.state=historyEntries[--cursor];listeners.popstate({state:this.state});}},forward(){if(cursor+1<historyEntries.length){this.state=historyEntries[++cursor];listeners.popstate({state:this.state});}}};
 const map={setView(p,z){position=p;zoom=z;moves++;return this;},getZoom:()=>zoom,fitBounds(){moves++;},latLngToContainerPoint:c=>({x:c[0]*10000,y:c[1]*10000}),invalidateSize(){},on(k,fn){mapEvents[k]=fn;return this;},getBounds:()=>({getSouth:()=>30,getNorth:()=>40,getWest:()=>120,getEast:()=>140}),attributionControl:{setPrefix(){}}};
 const layer={addTo(){return this;},clearLayers(){markers.length=0;}};
 const L={map:()=>map,layerGroup:()=>layer,divIcon:x=>x,control:{zoom:()=>({addTo(){}})},tileLayer:()=>({on(){return this;},addTo(){}}),marker:(coords,options)=>{const marker={options,events:{},addTo(){markers.push(this);return this;},getElement:()=>({setAttribute(){}}),on(k,fn){this.events[k]=fn;},bindTooltip(){}};return marker;}};
 const document={getElementById:el,querySelectorAll:s=>s==='[data-map-view]'?tabs:[],querySelector:s=>s==='.map-workspace'?work:s==='.map-sidebar'?sidebar:s==='.map-canvas-panel'?canvas:s.startsWith('[data-place=')?el(s):null,addEventListener(k,fn){listeners[k]=fn;}};
 el('mapData').textContent=JSON.stringify({places,tileUrl:'https://example.test/{z}/{x}/{y}'});
 const context=vm.createContext({require:()=>shared,document,window:{history,matchMedia:()=>media,addEventListener(k,fn){listeners[k]=fn;}},L,ResizeObserver:class{observe(){}},requestAnimationFrame:fn=>fn(),setTimeout(){},clearTimeout(){},navigator:{}});
 vm.runInContext(fs.readFileSync(require.resolve('../src/client/seeya-map.js'),'utf8'),context);
 return {el,work,sidebar,canvas,history,media,listeners,mapEvents,position:()=>JSON.stringify(position),moves:()=>moves,focused:()=>focused,
  pin(id){const name=places.find(p=>p.id===id).name;markers.find(m=>m.options.title===name+' 장소 선택').events.click();},
  list(id){el('mapList').handlers.click({target:{closest:()=>({dataset:{place:id}})}});}};
}
const t=fixture();
const first='old-kim-you-jeong-station',second='uiam-lake';
const before=t.position(),moves=t.moves();t.pin(first);
assert.equal(t.work.dataset.view,'map');assert.equal(t.el('mapSelectedMobile').hidden,false);assert.equal(t.el('mapDetail').hidden,true);
assert.equal(t.position(),before);assert.equal(t.moves(),moves,'Pin selection must not recenter or zoom');
t.el('mapSelectedOpen').onclick();assert.equal(t.work.dataset.view,'detail');assert.equal(t.canvas.inert,true);assert.equal(t.el('mapBack').textContent,'← 지도 보기');
t.el('mapBack').onclick();assert.equal(t.work.dataset.view,'map');assert.equal(t.canvas.inert,false);assert.equal(t.el('mapSelectedName').textContent,'옛 김유정역');assert.equal(t.position(),before);
t.el('mapSelectedOpen').onclick();t.history.back();assert.equal(t.work.dataset.view,'map');t.history.forward();assert.equal(t.work.dataset.view,'detail');
t.el('mapSheetHandle').onpointerdown({clientX:100,clientY:100});t.el('mapSheetHandle').onpointerup({clientX:105,clientY:180});t.el('mapSheetHandle').onclick();assert.equal(t.work.dataset.view,'map');assert.equal(t.el('mapSelectedMobile').hidden,false,'Drag and synthetic click must not double-back');
t.pin(second);t.history.back();assert.equal(t.el('mapSelectedMobile').hidden,true,'Changing pins must not stack a history entry per pin');
t.pin(first);t.el('mapSelectedClose').onclick();assert.equal(t.el('mapSelectedMobile').hidden,true);
t.pin(first);t.mapEvents.click();assert.equal(t.el('mapSelectedMobile').hidden,true);
t.pin(first);t.el('tab-list').onclick();t.sidebar.scrollTop=1200;t.list(second);
assert.equal(t.el('mapBack').textContent,'← 장소 목록');t.el('mapBack').onclick();assert.equal(t.work.dataset.view,'list');assert.equal(t.sidebar.scrollTop,1200);assert(t.focused().includes(second),'Focus must return to the clicked list row, not an older map selection');
t.el('mapSearch').handlers.input({target:{value:'김유정'}});t.el('tab-map').onclick();assert.equal(t.work.dataset.view,'map');assert(t.el('mapList').innerHTML.includes('김유정역'));assert.equal(t.el('mapSelectedMobile').hidden,true,'Filtering out the selected item must clear its preview');
t.el('mapArea').onclick();assert.equal(t.work.dataset.view,'map','Search in this area must remain on the map');
t.el('mapSearchOpen').onclick();assert.equal(t.work.dataset.view,'list');assert.equal(t.focused(),'mapSearch');
const desktop=fixture(false);desktop.pin(first);assert.equal(desktop.work.dataset.view,'detail');assert.equal(desktop.canvas.inert,false);desktop.el('mapBack').onclick();assert.equal(desktop.el('mapBrowse').hidden,false);
const fallback=fixture(true,false);fallback.pin(first);fallback.el('mapSelectedOpen').onclick();fallback.el('mapBack').onclick();assert.equal(fallback.work.dataset.view,'map');
console.log('PASS: mobile pin/summary/detail/back, native history, map position, list scroll/focus, handle drag, filters and desktop/history fallback.');
