'use strict';
const assert=require('node:assert/strict'),vm=require('node:vm'),fs=require('node:fs');
(async()=>{
 let writes=0,draws=0,wallRefreshes=0,src='',image=null,defer=false,fail=false,finish;
 const s={simple:{nickname:'기존 이름',passIssuedAt:1,debuted:true,concerts:{}}};
 const nodes={'#passNickname':{value:'기존 이름'},'#passNameStatus':{textContent:''},'.wall-pass small':{textContent:''}};
 const slot={isConnected:true,querySelector:()=>image,set innerHTML(html){writes++;if(html.includes('stage-ticket-preview'))image={src};}};
 nodes['#ticketCanvasSlot']=slot;
 const context={module:{exports:{}},Image:class{set src(v){this.value=v;}async decode(){if(fail)throw Error('decode');if(defer)await new Promise(r=>{finish=r;});}},File:class{},navigator:{},document:{},
 require:id=>id==='./our-stage-keepsake-art'?{drawPass:async({nickname})=>({toDataURL:()=>{src='data:'+nickname;return src;},toBlob:f=>f({})})}:()=>{}};
 vm.runInNewContext(fs.readFileSync(require.resolve('../src/client/our-stage-tickets'),'utf8'),context);
 const ui=context.module.exports({M:{albums:[],albumById:()=>null},state:()=>s,root:{querySelector:q=>nodes[q]},dialog:()=>{},button:()=>'',esc:x=>x,save:()=>true,draw:()=>draws++,refreshWall:()=>wallRefreshes++});
 await ui.showPass();const initial=image,beforeWrites=writes;
 nodes['#passNickname'].value='새 이름';defer=true;const pending=ui.handle('pass-name-save');
 await new Promise(setImmediate);
 assert.equal(image,initial);assert.equal(image.src,'data:기존 이름');assert.equal(writes,beforeWrites);assert.equal(draws,0);
 finish();await pending;assert.equal(image,initial);assert.equal(image.src,'data:새 이름');assert.equal(wallRefreshes,1);
 fail=true;defer=false;nodes['#passNickname'].value='이미지 실패';await ui.handle('pass-name-save');
 assert.equal(image.src,'data:새 이름');assert.equal(writes,beforeWrites);assert(nodes['#passNameStatus'].textContent.includes('갱신에 실패'));
 fail=false;await ui.handle('pass-name-save');assert.equal(image.src,'data:이미지 실패');
 console.log('PASS pass refresh: no clearing or whole-screen draw, decode before swap, old preview retained on failure, retry.');
})().catch(e=>{console.error(e);process.exitCode=1;});
