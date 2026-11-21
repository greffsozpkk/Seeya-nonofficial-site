'use strict';
// Balanced faces on each new board, without changing a resumed board.
module.exports=function pick(pool,count,random=Math.random){
 const shuffle=a=>{a=[...a];for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.max(0,Math.min(.999999,Number(random())||0))*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;};
 return shuffle(['hair','clothes'].flatMap(part=>shuffle(pool.filter(c=>c.part===part)).slice(0,count/2)));
};
