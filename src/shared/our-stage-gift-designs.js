'use strict';
// Keep the original earned-gift mapping stable. Art is the approved merchandise atlas.
const designs=[
 {id:'story-journey',name:'씨야 굿즈 선물 상자'},
 {id:'collection-30',name:'세 목소리 폴라로이드'},
 {id:'first-stage',name:'씨야 응원 슬로건'},
 {id:'collection-10',name:'앨범 키링'},
 {id:'event-rookie',name:'세 멤버 아크릴 스탠드'},
 {id:'reunion',name:'씨야 응원 수건'},
 {id:'event-ost',name:'씨야 탁상 달력'},
 {id:'cheer-1',name:'리본 포토카드 홀더'},
 {id:'collection-60',name:'멤버 포토카드 세트'}
];
function forGift(id){const seed=Array.from(id).reduce((n,c)=>(n*31+c.charCodeAt(0))>>>0,0);return designs[seed%designs.length];}
module.exports={designs,forGift};
