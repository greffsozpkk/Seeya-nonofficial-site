'use strict';
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const source=fs.readFileSync('src/client/our-stage.js','utf8');
for(const [albumId,songs] of [['first-mind',['scent','shoes','love']],['lovely-sweet-heart',['lovely-sweet-heart-01','marry','man']]]){
 const album={id:albumId,name:albumId},nodes={},delays=[],mounted=[],renders=[];
 const stage={classList:{contains:()=>false,add(){}},querySelector:()=>({innerHTML:''})};
 const s={simple:{concerts:{}},albums:[albumId]};
 const ctx={s,showing:false,showHeld:false,showTimer:null,document:{hidden:false},require:()=>({[albumId]:{colors:['white','pink']}}),
 M:{albumById:()=>album,concertReady:()=>true,concertTracks:()=>songs,albums:[album],finishConcert(){},settle(){},finishFinale(){}},
 $:q=>q==='#modalBody .stage-art'?stage:(nodes[q]||=( {innerHTML:'',textContent:''})),
 motionFor:id=>id==='scent'?'scent':id==='lovely-sweet-heart-01'?'greeting':false,
 stageArt:(...args)=>{renders.push(args);return '<figure></figure>';},esc:x=>x,title:x=>x,button:()=>'',fanLetterInvite:()=>'',mark:()=>'',
 dialog:()=>mounted.push('dialog'),coinUI:{begin(){},clearStage(){},mount:(...args)=>mounted.push(args),pause(){},counter:()=>'',summary:()=>''},
 motionUI:{mount(){},pause(){},stop(){}},ticketUI:{show:()=>mounted.push('ticket')},locked:fn=>fn(),sync(){},save:()=>true,draw(){},setTimeout:(fn,ms)=>{delays.push(ms);return 1;},clearTimeout(){}};
 vm.createContext(ctx);vm.runInContext(source.slice(source.indexOf('function perform(id){'),source.indexOf('\nfunction bridge(')),ctx);
 ctx.perform('album:'+albumId);
 assert.deepEqual(delays,[8500],'entrance plus exactly four seconds for first song');
 const firstStage=renders[0];assert.equal(firstStage[8],false,'first album concert uses album styling');assert.equal(firstStage[5],albumId==='first-mind'?'scent':'greeting');
 nodes['#stageModal']._next();nodes['#stageModal']._next();
 assert.deepEqual(delays,[8500,4000,4000]);assert.equal(renders.length,1,'song changes must not rebuild sprite DOM');
 assert.equal(mounted.filter(x=>x==='dialog').length,1,'dialog is rendered once');
 assert.equal(mounted.find(Array.isArray)[1],16500,'coin lifetime spans the whole concert');
 assert.equal(nodes['#concertPhase'].textContent,'마지막 곡 · 3 / 3곡');
 nodes['#stageModal']._next();assert.equal(mounted.at(-1),'ticket');assert.equal(ctx.showing,false);
 s.simple.concerts[albumId]={completedAt:Date.now()};
 ctx.perform('album:'+albumId);assert.equal(renders.at(-1)[8],true,'replay uses equipped clothes and hair');
 nodes['#stageModal']._finish();
 ctx.M.songAlbum=()=>album;ctx.perform('encore:'+songs[0]);
 assert.equal(renders.at(-1)[8],true,'encore uses equipped clothes and hair');
 nodes['#stageModal']._next();assert.equal(ctx.showing,false);
}
console.log('PASS continuous concerts: both choreographies keep one stage, four seconds per song, shared coin session, normal ticket completion.');
