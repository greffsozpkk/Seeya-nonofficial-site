'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const root=path.resolve(__dirname,'..'),read=p=>fs.readFileSync(path.join(root,p),'utf8');
const {resolvePodcasts}=require('../src/shared/radio-podcasts');
const reviews=require('../src/data/radio-podcasts.json'),archive=JSON.parse(read('data/archive.json'));
const rows=resolvePodcasts(archive,reviews,'2026-10-03');
assert(rows.length>0);assert.equal(new Set(rows.map(r=>r.id)).size,rows.length);
const sample=archive.find(r=>r.id===reviews[0].recordId),review=reviews[0];
for(const changes of [{hidden:true},{status:'scheduled'},{eventState:'cancelled'},{date:'2099-01-01'},{source:null,additionalSources:[]},{type:'article'}])assert.equal(resolvePodcasts([{...sample,...changes}],[review],'2026-10-03').length,0);
assert.equal(resolvePodcasts([sample],[review,review],'2026-10-03').length,1);
assert.equal(resolvePodcasts([sample],[{...review,episodeId:'1" onload="alert(1)'}],'2026-10-03').length,0);
const renamed=resolvePodcasts([{...sample,title:'변경한 방송명'}],[review],'2026-10-03');assert.equal(renamed[0].title,'변경한 방송명');
const html=read('radio/podcast-test/index.html');
assert(html.includes('noindex,follow'));assert(!read('sitemap.xml').includes('/radio/podcast-test/'));
assert.equal((html.match(/<iframe /g)||[]).length,1);assert(html.includes('rel="manifest"'));assert(!html.includes('youtube.com/embed/'));
assert(read('radio/index.html').includes('id="radioFormat"')); 
// Simulate switching while playing: old frame is removed first, same selection is a no-op.
const nodes={},events={},buttons=[];let removals=0,mounts=0;
for(const id of ['podcastData','podcastFrame','podcastCurrent','podcastOriginal','podcastArchive','podcastStatus','podcastList','podcastReload'])nodes[id]={textContent:'',addEventListener:(name,fn)=>events[id+name]=fn};
nodes.podcastData.textContent=JSON.stringify(rows);
nodes.podcastFrame.replaceChildren=()=>{removals++;};
Object.defineProperty(nodes.podcastFrame,'innerHTML',{set(v){assert.equal(removals,mounts+1);assert(v.includes('<iframe'));mounts++;}});
for(const row of rows)buttons.push({dataset:{podcastId:row.id},setAttribute(k,v){this[k]=v;},closest:()=>({classList:{toggle(){}}})});
vm.runInNewContext(read('src/client/podcasts.js'),{require:()=>require('../src/shared/radio-podcasts'),document:{getElementById:id=>nodes[id],querySelectorAll:()=>buttons}});
events.podcastListclick({target:{closest:()=>buttons[0]}});assert.equal(mounts,0);
if(rows.length>1){events.podcastListclick({target:{closest:()=>buttons[1]}});assert.equal(mounts,1);assert.equal(nodes.podcastOriginal.href,rows[1].url);assert.equal(buttons[1]['aria-pressed'],'true');events.podcastListclick({target:{closest:()=>buttons[1]}});assert.equal(mounts,1);}
const before=mounts;events.podcastReloadclick();assert.equal(mounts,before+1);
console.log('PASS: podcast archive joins, visibility/source checks, single-frame switching, retry, PWA and noindex.');
