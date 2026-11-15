'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs');
const layers=require('../src/data/our-stage-layers.json'),outfits=require('../src/data/our-stage-outfits.json');
// These column assignments follow named captions, not the original generation prompt.
const expected={'first-mind':{br:0,gr:2,yj:1},'still-here':{br:2,gr:1,yj:0},'first-again':{br:2,gr:1,yj:0}};
for(const [album,members] of Object.entries(expected)){
 const o=outfits.find(o=>o.id===album);assert.equal(o.identityReview.status,'caption-checked');
 for(const [id,column] of Object.entries(members)){
  const p=layers[album].members[id];
  for(const box of [p.head,p.body])assert.equal(Math.floor((box[0]+box[2]/2)/512),column,album+' '+id);
 }
}
const client=fs.readFileSync('src/client/our-stage.js','utf8');
assert(client.includes('sprite(id,o)'));
assert(!client.includes('<img class="outfit-sheet"'));
assert(!client.includes('outfits.find(o=>o.id===a.id).image'));
for(const id of ['california-dream','brilliant-change'])assert.equal(outfits.find(o=>o.id===id).identityReview.status,'caption-checked');
console.log('PASS named wardrobe mapping, matched head/body columns, shared preview renderer and activity-period reference labels.');
