const assert=require('node:assert/strict'),fs=require('node:fs');
require('./check-our-stage-wardrobe-review');
const M=require('../src/shared/our-stage').forTest(),art=require('../src/data/our-stage-badge-art.json');
const badges=M.badges(M.fresh());assert.equal(badges.length,48);assert.equal(Object.keys(art.badges).length,48);
assert.equal(new Set(badges.map(b=>art.badges[b.id].sheet+':'+art.badges[b.id].index)).size,48);
for(const b of badges){const a=art.badges[b.id];assert(a.index>=0&&a.index<24);assert(fs.existsSync('.'+art.sheets[a.sheet]));}
assert.equal(M.members.find(m=>m.id==='yj').name,'김연지');assert(M.members.find(m=>m.id==='yj').fact.startsWith('김연지'));
for(const e of M.storyEntries){assert(e.subject);assert(e.summary);assert(!e.summary.includes('트랙 수집'));if(['event-kairos','event-bcm'].includes(e.id)){assert.equal(e.subject,'남규리');assert(e.summary.startsWith('남규리'));}}
assert(M.storyById('event-kairos').source.includes('imbc.com'));assert(!M.coreCondition('yj').includes('남규리 이야기'));
assert(M.storyById('chapter-rebloom').subject.includes('수미'));
const client=fs.readFileSync('src/client/our-stage.js','utf8');assert(client.includes('description:m.fact'));assert(client.includes('description:e.summary'));assert(client.includes('해금 조건 · '));
console.log('PASS 48 unique badge motifs, stable reward IDs, explicit story subjects/summaries, Gyuri acting awards, Yeonji performance and separate prerequisite labels.');
