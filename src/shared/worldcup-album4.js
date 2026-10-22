'use strict';
// Reuse the main song catalog so media corrections are shared by both worldcups.
module.exports=()=>{
 const candidates=require('./worldcup-catalog')().candidates.filter(r=>r.album==='First, Again · 2026');
 if(candidates.length!==9||candidates.some(r=>/inst\.|instrumental/i.test(r.title)))throw Error('4집 보컬곡 9곡을 확인해 주세요.');
 return {id:'album4',title:'씨야 4집 월드컵',description:'First, Again, 아홉 곡 중 나의 최애',tag:'FIRST, AGAIN',unit:'곡',pickLabel:'이 곡 선택',version:'album4-20261023-v1',rounds:['all'],scopeNote:'4집 First, Again의 보컬곡 9곡이 매번 모두 참여합니다. 반주곡 2개는 제외하며, 무작위 대진과 첫 라운드 부전승을 거쳐 8번의 선택으로 우승곡을 정합니다.',candidates};
};
