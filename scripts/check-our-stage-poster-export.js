'use strict';
const assert=require('node:assert/strict');
(async()=>{
 let target,open=true,id='first-mind',pending=[],clicks=[];
 const root={querySelector:q=>q==='#roomPosterExport'?target:q==='#stageModal'?{open}:null};
 const ui=require('../src/client/our-stage-room-posters')({
  M:{albums:[{id:'first-mind',name:'The First Mind',type:'2006'},{id:'first-again',name:'First, Again',type:'2026'}],albumUnlocked:()=>true},
  state:()=>({displayPoster:id}),esc:String,root,button:(text,action)=>'<button data-action="'+action+'">'+text+'</button>',
  dialog(){if(target)target.isConnected=false;target={isConnected:true,innerHTML:''};},
  renderPoster:()=>new Promise((resolve,reject)=>pending.push({resolve,reject}))
 });
 global.document={createElement:()=>({click(){clicks.push({url:this.href,name:this.download});}})};
 const old=ui.view(),oldTarget=target;id='first-again';const current=ui.view();
 pending[0].resolve({toDataURL:()=> 'data:image/png;base64,OLD'});await old;assert.equal(oldTarget.innerHTML,'');
 ui.download();assert.equal(clicks.length,0,'not downloadable until ready');
 pending[1].resolve({toDataURL:()=> 'data:image/png;base64,NEW'});await current;
 assert(target.innerHTML.includes('<img class="room-poster-export"'));assert(target.innerHTML.includes('이미지 저장'));assert(target.innerHTML.includes('SEEYA Archive'));
 ui.download();assert.deepEqual(clicks,[{url:'data:image/png;base64,NEW',name:'seeya-first-again-poster.png'}]);
 const closed=ui.view();open=false;pending[2].resolve({toDataURL:()=>{throw Error('must not export closed preview');}});await closed;assert.equal(target.innerHTML,'');ui.download();assert.equal(clicks.length,1);
 open=true;const failed=ui.view();pending[3].reject(Error('image failed'));await failed;assert(target.innerHTML.includes('다시 불러오기'));ui.download();assert.equal(clicks.length,1);
 console.log('PASS poster export: PNG preview/download identity, pending guard, stale/closed rendering and retry on failure.');
})().catch(e=>{console.error(e);process.exitCode=1;});
