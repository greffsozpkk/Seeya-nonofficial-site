'use strict';
// Same rig channels for CSS previews and the continuously blended concert player.
const rot=n=>`rotate(${n}deg)`,scaled=n=>`rotate(calc(${n}deg * var(--motion)))`;
module.exports={
 '':v=>`translate(calc(${v[0]}px * var(--motion)),${v[1]}px) ${scaled(v[2])}`,
 ' .sprite-hair':v=>scaled(v[3]),
 ' .scent-free-arm':v=>rot(v[4]),' .scent-elbow-left':v=>rot(v[5]),
 ' .scent-singing-arm':v=>rot(v[6]),' .scent-elbow-right':v=>rot(v[7]),
 ' .scent-leg-left':v=>scaled(v[8]),' .scent-leg-right':v=>scaled(v[9]),
 ' .scent-facing-body':v=>`skewY(${Math.sin((v[10]||0)*Math.PI/180)*4}deg) scaleX(${1-Math.abs(Math.sin((v[10]||0)*Math.PI/180))*.28})`,
 ' .scent-step-left':v=>`translate(${v[11]||0}px,${(v[11]||0)>0?-5:0}px)`,
 ' .scent-step-right':v=>`translate(${-(v[11]||0)}px,${(v[11]||0)<0?-5:0}px)`
};
