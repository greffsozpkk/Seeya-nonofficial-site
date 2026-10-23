'use strict';
const assert=require('node:assert/strict'),vm=require('node:vm'),fs=require('node:fs'),path=require('node:path');
async function check(failImages){
 const texts=[],draws=[],requests=[],ctx={fillRect(){},strokeRect(){},fillText:t=>texts.push(t),measureText:t=>({width:[...t].length*25}),drawImage:(...a)=>draws.push(a)};
 const sandbox={module:{exports:{}},setTimeout,clearTimeout,Image:class{set src(url){requests.push({url,cors:this.crossOrigin});this.naturalWidth=1280;this.naturalHeight=720;queueMicrotask(()=>failImages?this.onerror?.():this.onload?.());}},document:{createElement:()=>({getContext:()=>ctx,toBlob:cb=>cb({size:1234})})}};
 vm.runInNewContext(fs.readFileSync(path.join(__dirname,'../src/client/worldcup-export.js'),'utf8'),sandbox);
 const result=await sandbox.module.exports.render({row:{youtubeId:'_CGekO1IRGc',title:'우승곡',artist:'씨야',channel:'SEEYA Official'},title:'씨야 월드컵',nickname:'위듀'});
 assert.equal(result.hasImage,!failImages);assert(result.blob.size>0);assert(texts.includes('위듀 님의 최종 선택'));assert(texts.includes('우승곡'));assert.equal(draws.length,failImages?0:1);assert(requests.every(r=>r.cors==='anonymous'));assert(requests[0].url.includes('maxresdefault'));
 if(failImages)assert(texts.includes('MY FAVORITE'));
}
Promise.all([check(false),check(true)]).then(()=>console.log('PASS result export: nickname, thumbnail, anonymous CORS loading and downloadable image fallback.')).catch(e=>{console.error(e);process.exitCode=1;});
