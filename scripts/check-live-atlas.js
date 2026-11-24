'use strict';
const assert=require('node:assert/strict');
const {catalog,cell,summary}=require('../src/shared/live-data');
const archive=require('../data/archive.json'),meta=require('../src/data/live-evidence.json');
const data=catalog(archive);
const fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'..');
const routes=require('../src/data/routes.json');
assert(routes.some(r=>r.key==='live'&&r.path==='/music/live/'&&!r.noindex&&!r.unlisted));
const html=fs.readFileSync(path.join(root,'music/live/index.html'),'utf8');
assert(!html.includes('LOCAL PREVIEW'));
assert(html.includes('data-page="live"'));
assert(html.includes('/images/music/the-fan-title-transparent.png'));
assert(fs.readFileSync(path.join(root,'sitemap.xml'),'utf8').includes('https://seeya-fanpage.com/music/live/'));
for(const page of ['music','music/stages','music/fanchant','music/live']){
 const pageHtml=fs.readFileSync(path.join(root,page,'index.html'),'utf8');
 const nav=pageHtml.match(/<nav class="music-subnav"[\s\S]*?<\/nav>/)[0];
 assert.equal((nav.match(/<a /g)||[]).length,4);
 assert(nav.includes('href="/music/live/"'));
 assert.equal((nav.match(/aria-current="page"/g)||[]).length,1);
}
assert.equal(data.sessions.length,8);assert.equal(data.songs.length,25);
assert.equal(new Set(data.sessions.map(s=>s.id)).size,8);
const [first,second]=data.sessions;
assert.equal(first.archiveId,second.archiveId);assert.notEqual(first.date,second.date);
for(const evidence of data.evidence){assert(evidence.sources.length);for(const s of evidence.sources)assert(s.url.startsWith('https://'));}
for(const evidence of data.evidence)for(const s of evidence.sources){
 assert(Number.isInteger(s.durationSeconds)&&s.durationSeconds>0,'Every selected video has an observed duration');
 if(s.durationSeconds<120||s.shortsEligible===true)assert.equal(s.scope,'excerpt','Short clips must be labeled as excerpts');
}
assert(data.evidence.find(e=>e.sessionId==='the-fan-20260830'&&e.songId==='still-like-you').sources.some(s=>s.url.includes('1Zct-L96S8o')&&s.durationSeconds===261));
const evidence=data.evidence[0],song=evidence.songId,session=evidence.sessionId;
const doubled={...data,evidence:[...data.evidence,evidence,evidence]};
assert.deepEqual(summary(doubled,song),summary(data,song));
assert.equal(cell(doubled,song,session).sources.length,cell(data,song,session).sources.length);
const firstOnly={...data,evidence:[{...evidence,sessionId:first.id}]};
assert.equal(cell(firstOnly,song,second.id).status,'unknown');
assert.equal(summary(firstOnly,song).confirmed,1);
assert.equal(summary(firstOnly,song,[first.id,first.id]).confirmed,1);
const hidden=archive.map(r=>r.id===first.archiveId?{...r,hidden:true}:r);
assert.equal(catalog(hidden).sessions.length,6);
const missing=archive.map(r=>r.id===first.archiveId?{...r,source:{url:'https://example.com',label:'test'},additionalSources:[]}:r);
assert.equal(cell(catalog(missing),song,first.id).status,'unknown');
const withdrawn=JSON.parse(JSON.stringify(meta));withdrawn.evidence=[{...meta.evidence[0],status:'not-performed'}];
assert.equal(cell(catalog(archive,{},withdrawn),song,first.id).status,'unknown');
const partial={...data,evidence:[{...evidence,sources:evidence.sources.map(s=>({...s,scope:'excerpt'}))}]};
assert.equal(summary(partial,song).excerpt,1);
assert.equal(cell({...data,evidence:[]},song,first.id).status,'unknown');
const invalid=JSON.parse(JSON.stringify(meta));invalid.sessions[0].date='2026-08-28';assert.throws(()=>catalog(archive,{tour:[]},invalid));
console.log('PASS live atlas: eight dated sessions, Seoul separation, distinct concert counts, missing/hidden source removal, partial scope and no unsupported absence claims.');
