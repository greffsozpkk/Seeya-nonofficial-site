const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const entries=require('../src/data/dictionary.json'),routes=require('../src/data/routes.json');
const ids=new Set(entries.map(e=>e.id));
assert.equal(ids.size,entries.length,'Dictionary IDs must be unique');
const members=require('../src/data/members.json').map(m=>m.name);
for(const e of entries){
 assert(/^[a-z][a-z0-9-]*$/.test(e.id),'Stable safe dictionary anchor: '+e.id);
 assert(e.term&&e.meaning&&e.context.length&&Array.isArray(e.aliases)&&e.sources.length,e.id+' incomplete');
 assert(['member','official','fan','activity'].includes(e.kind),e.id+' unknown origin category');
 assert(e.members.length&&e.members.every(m=>members.includes(m)),e.id+' unknown member');
 for(const id of e.related)assert(ids.has(id)&&id!==e.id,e.id+' invalid related expression');
 for(const s of e.sources)assert(s.label&&s.action&&new URL(s.url).protocol==='https:',e.id+' invalid source');
}
const root=path.resolve(__dirname,'..'),html=fs.readFileSync(path.join(root,'guide/dictionary/index.html'),'utf8');
assert(routes.some(r=>r.path==='/guide/dictionary/'&&r.key==='dictionary'));
assert(fs.readFileSync(path.join(root,'sitemap.xml'),'utf8').includes('https://seeya-fanpage.com/guide/dictionary/'));
for(const e of entries){
 assert(html.includes('id="'+e.id+'"')&&html.includes(e.meaning),'Static dictionary content must remain readable without JS');
 for(const id of e.related)assert(html.includes('href="/guide/dictionary/#'+id+'"'));
}
assert.equal((html.match(/class="dictionary-entry"/g)||[]).length,entries.length);
assert(fs.readFileSync(path.join(root,'guide/index.html'),'utf8').includes('href="/guide/dictionary/"'));
console.log(`PASS: ${entries.length} sourced dictionary entries; category/member validity, related anchors, static content, guide link and sitemap.`);

const historical=entries.filter(e=>e.sourcePeriod);
assert.equal(historical.length,35);
assert(historical.every(e=>e.sources.some(s=>s.url.endsWith("no=207233"))),"Historical entries must cite glossary");
for(const e of historical)assert(html.includes(e.sourcePeriod));
assert.equal(entries.filter(e=>e.term==="보람씨야").length,1);
assert(entries.find(e=>e.id==="edit-gyul").aliases.includes("남크리스탈"));
assert(entries.find(e=>e.id==="chat-names").aliases.includes("고맙다람"));
