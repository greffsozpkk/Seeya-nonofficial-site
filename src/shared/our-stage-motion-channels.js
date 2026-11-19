'use strict';
// Same rig channels for CSS previews and the continuously blended concert player.
const rot=n=>`rotate(${n}deg)`,scaled=n=>`rotate(calc(${n}deg * var(--motion)))`;
// The rig's screen-left arm is the singer's right arm. When it lifts outwards,
// its forearm must fold in the opposite direction from the low chest gesture.
// Mirror this for the other arm, preserving the inward microphone hold.
const elbow=(shoulder,bend,side)=>{
 const lift=Math.max(0,Math.min(1,(side*shoulder-25)/35));
 return Math.round((bend+(side*Math.abs(bend)-bend)*lift)*1000)/1000;
};
module.exports={
 '':v=>`translate(calc(${v[0]}px * var(--motion)),${v[1]}px) ${scaled(v[2])}`,
 ' .sprite-hair':v=>scaled(v[3]),
 ' .scent-free-arm':v=>rot(v[4])+` scaleY(${v[12]||1})`,' .scent-elbow-left':v=>rot(elbow(v[4],v[5],1)),
 ' .scent-singing-arm':v=>rot(v[6]),' .scent-elbow-right':v=>rot(elbow(v[6],v[7],-1)),
 ' .scent-leg-left':v=>scaled(v[8]),' .scent-leg-right':v=>scaled(v[9]),
 ' .scent-facing-body':v=>`skewY(${Math.sin((v[10]||0)*Math.PI/180)*4}deg) scaleX(${1-Math.abs(Math.sin((v[10]||0)*Math.PI/180))*.28})`,
 ' .scent-step-left':v=>`translate(${v[11]||0}px,${(v[11]||0)>0?-5:0}px)`,
 ' .scent-step-right':v=>`translate(${-(v[11]||0)}px,${(v[11]||0)<0?-5:0}px)`
};
