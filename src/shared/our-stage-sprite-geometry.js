'use strict';
const anchors=require('../data/our-stage-anchors.json');
// Align the anatomical chin and neck, not the bounding box of asymmetric hair.
module.exports=function geometry(member,hairId,clothesId,layers){
 const h=layers[hairId].members[member],b=layers[clothesId].members[member];
 const headAnchor=anchors[hairId][member].head,neckAnchor=anchors[clothesId][member].neck;
 const reach=Math.max(headAnchor[0]-h.head[0],h.head[0]+h.head[2]-headAnchor[0]);
 const hs=Math.min(320/(headAnchor[1]-h.head[1]),216/reach),bs=320/b.body[3];
 return {hw:h.head[2]*hs,hh:h.head[3]*hs,bw:b.body[2]*bs,bh:320,
  headX:220-(headAnchor[0]-h.head[0])*hs,headY:345-(headAnchor[1]-h.head[1])*hs,
  bodyX:220-(neckAnchor[0]-b.body[0])*bs,bodyY:340-(neckAnchor[1]-b.body[1])*bs};
};
