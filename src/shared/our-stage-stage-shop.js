'use strict';
const items=[
 {id:'hall',slot:'background',name:'작은 라이브홀',price:80,description:'와인빛 커튼과 원목 바닥, 가까이서 만나는 세 목소리.'},
 {id:'showcase',slot:'background',name:'연습실 쇼케이스',price:60,description:'거울 벽과 따뜻한 조명 아래 여는 작은 공연.'},
 {id:'rooftop',slot:'background',name:'야외 밤무대',price:120,description:'도시의 밤을 뒤로하고 펼치는 옥상 라이브.'},
 {id:'mic',slot:'prop',name:'스탠드 마이크',price:35,description:'무대 양옆에 세워두는 빈티지 마이크 한 쌍.'},
 {id:'speakers',slot:'prop',name:'라이브 스피커',price:45,description:'무대 양옆을 채우는 작은 모니터 스피커.'},
 {id:'flowers',slot:'prop',name:'봄날의 꽃 장식',price:60,description:'무대 가장자리에 놓인 분홍빛 꽃바구니.'},
 {id:'balloons',slot:'audience',name:'분홍 풍선 객석',price:50,description:'작은 분홍 풍선들이 높낮이를 달리하며 객석을 가득 채워요.'},
 {id:'phone-lights',slot:'audience',name:'휴대폰 라이트 객석',price:50,description:'객석 곳곳에서 켠 하얀 휴대폰 라이트가 잔잔하게 반짝여요.'},
 {id:'banner',slot:'audience',name:'도트 응원 플래카드',price:60,description:'보람·규리·연지와 씨야를 응원하는 작은 손팻말 네 개.'}
];
const slots={background:'배경',prop:'소품',audience:'관객석'},byId=id=>items.find(i=>i.id===id);
const fresh=()=>({owned:[],equipped:{background:null,prop:null,audience:null}});
function valid(d){return !!d&&Array.isArray(d.owned)&&new Set(d.owned).size===d.owned.length&&d.owned.every(id=>byId(id))&&!!d.equipped&&typeof d.equipped==='object'&&!Array.isArray(d.equipped)&&Object.keys(d.equipped).length===3&&Object.keys(slots).every(slot=>d.equipped[slot]===null||d.owned.includes(d.equipped[slot])&&byId(d.equipped[slot])?.slot===slot);}
const spent=d=>d.owned.reduce((n,id)=>n+(byId(id)?.price||0),0);
module.exports={items,slots,byId,fresh,valid,spent};
