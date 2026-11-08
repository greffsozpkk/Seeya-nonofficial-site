'use strict';
const assert=require('node:assert/strict'),C=require('../src/shared/concert-diary'),M=require('../src/shared/my-concert'),P=require('../src/shared/passport'),Save=require('../src/shared/passport-play-save'),Show=require('../src/shared/my-concert-show');
const {songs}=require('../game/my-concert/catalog.json'),d=M.fresh();
d.sections={opening:[songs[0].id],main:[songs[1].id,'hidden-1'],encore:[songs[2].id]};d.hidden={'hidden-1':{mode:'all'}};
d.vcrs=[{mode:'link',value:'uYp15-zFr4M',after:1},{mode:'link',value:'28tmGVxRG3s',after:2},{mode:'link',value:'CzkUIfl5R4Q',after:2}];
let moved=M.change(d,{type:'vcr-order',index:0,after:2,to:1},songs).draft;
assert.deepEqual(moved.vcrs.map(v=>v.value),['28tmGVxRG3s','uYp15-zFr4M','CzkUIfl5R4Q']);assert.deepEqual(moved.sections,d.sections);
moved=M.change(moved,{type:'vcr-order',index:2,after:1,to:0},songs).draft;assert.equal(moved.vcrs.find(v=>v.value==='CzkUIfl5R4Q').after,1);
assert.throws(()=>M.change(d,{type:'vcr-order',index:0,after:0,to:0},songs));assert.throws(()=>M.change(d,{type:'vcr-order',index:0,after:4,to:0},songs));
assert.deepEqual(M.decode(M.encode(moved),songs).vcrs,moved.vcrs);
for(const song of songs.filter(s=>s.enabled)){
 const others=songs.filter(s=>s.enabled && s.id!==song.id);
 const allTracks={...d,vcrs:[],sections:{opening:[song.id],main:[others[0].id],encore:[others[1].id]}};
 assert(C.snapshot(allTracks,songs).songs.some(s=>s.id===song.id));
}
const recipe=C.snapshot(d,songs),now=new Date().toISOString();
const record=P.entry({entryId:'concert-example',kind:'play',status:'done',date:P.today(),title:d.title,members:['seeya'],play:{game:'other'},concertPoster:recipe,createdAt:now,updatedAt:now});
const state={...P.empty(),entries:[record]};assert.deepEqual(P.validate(JSON.parse(JSON.stringify(state))).entries[0].concertPoster,recipe);
assert.equal(P.summary(state.entries).concert,0);assert.equal(P.summary(state.entries).play,1);
assert.equal(P.entry({...record,note:'수정한 메모'}).concertPoster.draft.title,d.title);
let raw=null;const adapter={getItem:()=>raw,setItem:(k,v)=>{raw=v;}};assert.equal(Save.save(adapter,record).already,false);assert.equal(Save.save(adapter,record).already,true);assert.equal(JSON.parse(raw).entries.length,1);
const broken=structuredClone(recipe);broken.songs=[];assert.throws(()=>C.clean(broken));broken.songs=recipe.songs;broken.draft.theme='../../secret';assert.throws(()=>C.clean(broken));
assert(!require('../src/shared/passport-extra').publicSummary(state).r[0].concertPoster);
assert.equal(Show.performanceVideos('group-track-038')[0].videoId,'28tmGVxRG3s');assert(!Show.performanceVideos('group-track-038').some(v=>v.videoId==='iEl0SHS7XAk'));
console.log('PASS concert diary: validated portable poster recipe, backup round trip, edit preservation, duplicate save, real-concert exclusion, privacy; VCR gap/order bounds and hot-girl replacement.');
