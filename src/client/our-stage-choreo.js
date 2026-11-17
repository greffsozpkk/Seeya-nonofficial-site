'use strict';

// Articulated cuts of the approved first-album sprite, not a new character design.
// The source atlas is normalised to 234 × 333 so all three mapped costumes share joints.
// Greeting gesture reference: https://www.youtube.com/watch?v=0w_viJPsbOk&t=198s
// Gesture reference: https://www.youtube.com/watch?v=rFCNRIpPukY&t=61s
// A sixteen-beat silent interpretation at 2x by default; not a frame-accurate or audio-synchronised copy.
module.exports=function choreoBody({uid,image,head,x,width,mode}){
 const legY=mode==='greeting'?195:208;
 const left='0,32 72,32 62,78 62,112 50,137 47,184 0,184';
 const right='234,32 162,32 172,78 172,112 184,137 187,184 234,184';
 const piece=(name,shape)=>`<clipPath id="${uid}-${name}">${shape}</clipPath>`;
 const cut=name=>`<g clip-path="url(#${uid}-${name})">${image}</g>`;
 return `${head}<svg class="scent-body" x="${x}" y="340" width="${width}" height="320" viewBox="0 0 234 333" overflow="visible">
 <defs>${piece('left',`<polygon points="${left}"/>`)}${piece('right',`<polygon points="${right}"/>`)}${piece('leg-l',`<rect x="0" y="${legY}" width="117" height="${333-legY}"/>`)}${piece('leg-r',`<rect x="117" y="${legY}" width="117" height="${333-legY}"/>`)}
 <mask id="${uid}-torso" maskUnits="userSpaceOnUse" x="0" y="0" width="234" height="333"><rect width="234" height="${legY+2}" fill="white"/><polygon points="${left}" fill="black"/><polygon points="${right}" fill="black"/></mask></defs>
 <g class="scent-leg scent-leg-left">${cut('leg-l')}</g><g class="scent-leg scent-leg-right">${cut('leg-r')}</g>
 <g class="scent-upper"><g mask="url(#${uid}-torso)">${image}</g>
 <g class="scent-arm scent-free-arm">${cut('left')}</g>
 <g class="scent-arm scent-singing-arm">${cut('right')}<g class="scent-hand-mic" shape-rendering="crispEdges"><path fill="#292631" d="M202 145h12v45h-12z"/><path fill="#aea6bb" d="M198 185h20v18h-20z"/><path fill="#e8e2ed" d="M198 195h20v5h-20z"/><path fill="#ffcfac" d="M199 145h17v13h-17z"/></g></g></g></svg>`;
};
