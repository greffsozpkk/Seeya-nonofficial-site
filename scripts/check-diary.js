'use strict';
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict'),vm=require('node:vm');
const root=path.resolve(__dirname,'..'),read=p=>fs.readFileSync(path.join(root,p),'utf8');
const html=read('diary/index.html'),test=read('passport/test/index.html'),catalog=h=>JSON.parse(h.match(/id="passportCatalog">([\s\S]*?)<\/script>/)[1]);
assert(html.includes('씨야 다이어리'));assert(!html.includes('noindex'));assert(!html.includes('googletagmanager'));assert(!html.includes('analytics.js'));
assert(test.includes('noindex,nofollow'));assert(test.includes("location.replace(\"/diary/\"+location.search+location.hash)"));assert(html.includes('/diary/#new'));assert(!html.includes('/passport/test/'));
assert(!test.includes('passportCatalog'));assert(read('sitemap.xml').includes('/diary/'));assert(!read('sitemap.xml').includes('/passport/test/'));
assert.equal((read('src/template.html').match(/href="\/diary\/">DIARY/g)||[]).length,3);
const script=html.match(/src="(\/assets\/diary\.[a-f0-9]+\.js)"/)[1],bundle=read(script.slice(1));
assert(!bundle.includes('/passport/test/'));assert(bundle.includes("register('/diary/sw.js'"));assert(bundle.includes("KEY='seeya-passport-v1'"),'Existing personal entries must survive launch');
const {playFormats}=catalog(html),banks=require('../src/shared/exam').banks,P=require('../src/shared/passport-play');
assert.deepEqual(playFormats.lyrics,{total:10,maxScore:10});
for(const b of banks)assert.deepEqual(playFormats.exam,{total:b.questions.length,maxScore:b.points*b.questions.length});
for(const [game,preset] of Object.entries(playFormats)){const p=P.clean({game,...preset});assert.equal(p.score,null);assert.equal(p.correct,null);assert.equal(p.total,preset.total);assert.throws(()=>P.clean({...p,score:p.maxScore+1}));assert.throws(()=>P.clean({...p,correct:p.total+1}));}
assert.throws(()=>P.clean({game:'other',score:2}));assert.throws(()=>P.clean({game:'other',correct:2}));
for(const file of ['.github/workflows/build.yml','.github/workflows/update-news.yml']){const commit=read(file).split('\n').find(line=>line.includes('git add '));for(const output of ['diary/sw.js','passport/sw.js'])assert(commit.includes(output),file+' must publish '+output);}
async function offline(){
 const handlers={},items=new Map(),deleted=[],cache={put:async(k,v)=>items.set(k,v),match:async k=>items.get(k)};let down=false;
 const context={URL,Request:class{constructor(url){this.url=url;}},Response:{error:()=>({error:true})},fetch:async req=>{if(down)throw Error('offline');return {ok:true,url:req.url};},caches:{open:async()=>cache,keys:async()=>['seeya-diary-shell-old','seeya-passport-shell-test','unrelated'],delete:async n=>deleted.push(n)},self:{location:{origin:'https://seeya-fanpage.com'},clients:{claim:async()=>{}},addEventListener:(k,f)=>handlers[k]=f}};
 vm.runInNewContext(read('diary/sw.js'),context);let task;handlers.install({waitUntil:p=>task=p});await task;assert(items.has('/diary/'));assert(!items.has('/passport/test/'));handlers.activate({waitUntil:p=>task=p});await task;assert.deepEqual(deleted,['seeya-diary-shell-old']);
 down=true;let response;handlers.fetch({request:{method:'GET',mode:'navigate',url:'https://seeya-fanpage.com/diary/?from=calendar'},respondWith:p=>response=p});assert.equal((await response).url,'/diary/');
 for(const path of ['/passport/test/','/data/archive.json','/manage/']){let called=false;handlers.fetch({request:{method:'GET',mode:'navigate',url:'https://seeya-fanpage.com'+path},respondWith:()=>called=true});assert(!called);}
 console.log('PASS diary: public/test paths, menus/SEO/privacy, shared legacy storage, actual game counts/unknown score, isolated offline caches and recovery.');
}
offline().catch(e=>{console.error(e);process.exitCode=1;});
