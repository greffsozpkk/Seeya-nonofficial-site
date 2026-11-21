'use strict';
const layers=require('../data/our-stage-layers.json'),optimized=require('../data/our-stage-optimized-images.json');
let sequence=0;
module.exports=function tile(c){
 const d=layers[c.style],clothes=c.part==='clothes',box=d.members[c.member][clothes?'body':'head'];
 const image=clothes?d.image:d.headImage||d.image,clip='style-tile-'+(++sequence);
 return `<svg class="style-tile-art" data-part="${clothes?'clothes':'hair'}" viewBox="${box.join(' ')}" overflow="hidden" aria-hidden="true"><defs><clipPath id="${clip}"><rect x="${box[0]}" y="${box[1]}" width="${box[2]}" height="${box[3]}"/></clipPath></defs><image clip-path="url(#${clip})" href="${optimized[image]||image}" width="${d.width}" height="${d.height}"/></svg>`;
};
