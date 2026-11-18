'use strict';
const assert=require('node:assert/strict'),art=require('../src/client/our-stage-gift-art');
const designs=require('../src/shared/our-stage-gift-designs'),tasks=require('../src/shared/our-stage-word-tasks');
const legacy=['story-journey','collection-30','first-stage','collection-10','event-rookie','reunion','event-ost','cheer-1','collection-60'];
for(const q of tasks){
 const id='word:'+q.track,seed=Array.from(id).reduce((n,c)=>(n*31+c.charCodeAt(0))>>>0,0);
 assert.equal(designs.forGift(id).id,legacy[seed%9]);
 const html=art({id,kind:'box'});assert(html.includes('data-gift-art="'+legacy[seed%9]+'"'));assert(html.includes('<image href="/images/game/our-stage/'));assert(!html.includes('present-box'));
}
assert.equal(new Set(tasks.map(q=>designs.forGift('word:'+q.track).id)).size,9);
console.log('PASS original nine detailed gift designs and stable mapping for all '+tasks.length+' lyric tasks.');
