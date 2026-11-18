'use strict';
// Reuse the approved SEEYA merchandise artwork, including its official logo overlays.
const art=require('../data/our-stage-badge-art.json'),designs=require('../shared/our-stage-gift-designs');
let sequence=0;
module.exports=function(gift){
 const g=typeof gift==='string'?{kind:gift}:gift;
 const id=g.id?.startsWith('concert:')?g.id.slice(8)+'-master':g.kind==='letters'?'cheer-5':designs.forGift(g.id||g.kind).id;
 const entry=art.badges[id],source=entry.logo?art.logoSheets[entry.sheet]:art.sheets[entry.sheet],filter='gift-cutout-'+(++sequence),box=entry.logo?.box;
 const logo=box?`<image href="/images/game/our-stage/${entry.logo.tone==='light'?'badge-logo-light.svg':'card-logo.svg'}" x="${box[0]}" y="${box[1]}" width="${box[2]}" height="${box[3]}"/>`:'';
 const preserved=(entry.preserve||[]).map(b=>`<svg x="${b[0]}" y="${b[1]}" width="${b[2]}" height="${b[3]}" viewBox="${b.join(' ')}" overflow="hidden"><image href="${art.sheets[entry.sheet]}" width="1536" height="1024"/></svg>`).join('');
 return `<svg viewBox="${entry.box.join(' ')}" class="gift-pixel" aria-hidden="true" data-gift-art="${id}" overflow="hidden"><defs><filter id="${filter}"><feComponentTransfer><feFuncA type="discrete" tableValues="0 0 0 0 0 0 0 1"/></feComponentTransfer></filter></defs><image href="${source}" width="1536" height="1024" filter="url(#${filter})"/>${logo}${preserved}</svg>`;
};
