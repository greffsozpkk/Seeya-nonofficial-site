'use strict';
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..'),read=p=>fs.readFileSync(path.join(root,p),'utf8');
const manifest=JSON.parse(read('manifest.webmanifest'));
assert.deepEqual(manifest,JSON.parse(read('src/data/pwa.json')));
assert.equal(manifest.id,'/');assert.equal(manifest.scope,'/');assert.equal(manifest.display,'standalone');
assert.equal(new URL(manifest.start_url,'https://seeya-fanpage.com').pathname,'/');
for(const icon of [...manifest.icons,{src:'/images/app/apple-touch-icon-180-v2.png',sizes:'180x180'}]){
 const bytes=fs.readFileSync(path.join(root,icon.src.slice(1)));
 assert.equal(bytes.subarray(1,4).toString(),'PNG');
 assert.equal(`${bytes.readUInt32BE(16)}x${bytes.readUInt32BE(20)}`,icon.sizes,icon.src);
 require('./check-icon-pixels')(bytes,icon.src);
 assert.deepEqual(bytes,fs.readFileSync(path.join(root,icon.src.slice(1).replace('-v2.png','.png'))),'Legacy icon must also be repaired');
}
assert(manifest.icons.some(icon=>icon.purpose==='maskable'));
for(const shortcut of manifest.shortcuts)assert(fs.existsSync(path.join(root,shortcut.url.slice(1),'index.html')));
const build=JSON.parse(read('build-manifest.json'));
for(const file of build.files.filter(p=>p.endsWith('.html'))){
 const html=read(file);
 assert.equal((html.match(/rel="manifest"/g)||[]).length,1,file);
 assert(html.includes('href="/images/app/apple-touch-icon-180-v2.png"'),file+' updated Apple icon');
 assert.equal((html.match(/name="theme-color"/g)||[]).length,1,file);
 assert(html.includes(`name="theme-color" content="${manifest.theme_color}"`));
 assert(html.includes('href="/about/">ABOUT</a>'),file);
 assert(/src="\/assets\/pwa\.[a-f0-9]+\.js"/.test(html),file);
}
const preview=JSON.parse(read('src/data/exam-preview-route.json'));
const privateHtml=read(preview.path.slice(1)+'index.html');
assert(!privateHtml.includes('rel="manifest"'));assert(!privateHtml.includes('data-install-link'));
assert(!/src="\/assets\/pwa\./.test(privateHtml));
assert(!read('guide/index.html').includes('id="pwaInstall"'));
assert(read('about/install/index.html').includes('id="pwaInstall"'));
assert(read('about/index.html').includes('class="letter-paper"'));
assert(read('letter/index.html').includes('rel="canonical" href="https://seeya-fanpage.com/about/"'));
assert(read('sitemap.xml').includes('/about/install/'));
const source=read('src/client/pwa.js');
assert(!/serviceWorker|caches\.|localStorage|location\.reload/.test(source));

function setup({standalone=false,ios=false,guide=true}={}){
 const handlers={},clicks={},link={hidden:false},status={textContent:'manual help'},button={hidden:true,disabled:false,addEventListener:(n,f)=>clicks[n]=f};
 const mode={matches:standalone,addEventListener:(n,f)=>handlers.mode=f};
 const window={matchMedia:()=>mode,addEventListener:(n,f)=>handlers[n]=f};
 const document={getElementById:id=>id==='pwaInstall'?(guide?button:null):id==='pwaStatus'?(guide?status:null):null,querySelectorAll:()=>[link]};
 vm.runInNewContext(source,{window,document,navigator:{standalone:ios}});
 return {handlers,clicks,link,status,button,mode};
}
async function check(){
 let t=setup();assert(t.button.hidden);
 let prevented=0,prompted=0;
 const event=outcome=>({preventDefault(){prevented++;},async prompt(){prompted++;},userChoice:Promise.resolve({outcome})});
 t.handlers.beforeinstallprompt(event('dismissed'));assert(!t.button.hidden);assert.equal(prompted,0);
 await t.clicks.click();assert(t.button.hidden);assert(t.status.textContent.includes('나중에'));assert.equal(prompted,1);
 await t.clicks.click();assert.equal(prompted,1,'Consumed prompt must not be reused');
 t.handlers.beforeinstallprompt(event('accepted'));await t.clicks.click();assert(t.status.textContent.includes('설치 요청'));
 t.handlers.appinstalled();assert(t.button.hidden);assert(t.status.textContent.includes('추가되었습니다'));
 for(const config of [{standalone:true},{ios:true}]){t=setup(config);assert(t.button.hidden);const before=prevented;t.handlers.beforeinstallprompt(event('accepted'));assert.equal(prevented,before);}
 t=setup({guide:false});const before=prevented;t.handlers.beforeinstallprompt(event('accepted'));assert.equal(prevented,before,'Keep browser promotion on pages without install button');
 t=setup();t.handlers.beforeinstallprompt({preventDefault(){},async prompt(){throw Error('unavailable');}});await t.clicks.click();assert(t.button.hidden);assert(!t.button.disabled);assert(t.status.textContent.includes('브라우저'));
 t=setup();let resolvePrompt;const pending=new Promise(resolve=>resolvePrompt=resolve);let times=0;
 t.handlers.beforeinstallprompt({preventDefault(){},prompt(){times++;return pending;},userChoice:Promise.resolve({outcome:'accepted'})});
 const first=t.clicks.click();await t.clicks.click();assert.equal(times,1);resolvePrompt();await first;
 t.mode.matches=true;t.handlers.mode();assert(t.status.textContent.includes('이용 중'));
 console.log('PASS PWA: manifest, exact PNG sizes, public/private pages, manual help, prompt lifecycle and standalone state.');
}
check().catch(error=>{console.error(error);process.exitCode=1;});
