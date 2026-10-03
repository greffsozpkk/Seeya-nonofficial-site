'use strict';
// Keep the current item first; Fisher–Yates shuffles every other item once.
module.exports=function(ids,current,random=Math.random){
 const remaining=[...new Set(ids)].filter(id=>id!==current);
 for(let i=remaining.length-1;i>0;i--){const j=Math.floor(random()*(i+1));[remaining[i],remaining[j]]=[remaining[j],remaining[i]];}
 return ids.includes(current)?[current,...remaining]:remaining;
};
