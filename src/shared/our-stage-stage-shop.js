'use strict';
const items=[
 {id:'hall',slot:'background',name:'작은 라이브홀',price:80,description:'와인빛 커튼과 원목 바닥, 가까이서 만나는 세 목소리.'},
 {id:'showcase',slot:'background',name:'연습실 쇼케이스',price:60,description:'거울 벽과 따뜻한 조명 아래 여는 작은 공연.'},
 {id:'rooftop',slot:'background',name:'야외 밤무대',price:120,description:'도시의 밤을 뒤로하고 펼치는 옥상 라이브.'},
 {id:'petals',slot:'effect',name:'꽃잎',price:45,description:'분홍 꽃잎이 무대 위로 천천히 흩날려요.'},
 {id:'confetti',slot:'effect',name:'색종이',price:60,description:'작은 색종이가 축하 인사처럼 내려와요.'},
 {id:'starlight',slot:'effect',name:'별빛',price:50,description:'무대 뒤편에 작은 별빛이 은은하게 반짝여요.'},
 {id:'balloons',slot:'audience',name:'분홍 풍선 객석',price:50,description:'작은 분홍 풍선들이 높낮이를 달리하며 객석을 가득 채워요.'},
 {id:'phone-lights',slot:'audience',name:'휴대폰 라이트 객석',price:50,description:'객석 곳곳에서 켠 하얀 휴대폰 라이트가 잔잔하게 반짝여요.'},
 {id:'banner',slot:'audience',name:'도트 응원 플래카드',price:60,description:'보람·규리·연지와 씨야를 응원하는 작은 손팻말 네 개.'}
];
const slots={background:'배경',effect:'무대 효과',audience:'관객석'},byId=id=>items.find(i=>i.id===id);
const fresh=()=>({owned:[],equipped:{background:null,effect:null,audience:null}});
function valid(d){return !!d&&Array.isArray(d.owned)&&new Set(d.owned).size===d.owned.length&&d.owned.every(id=>byId(id))&&!!d.equipped&&typeof d.equipped==='object'&&!Array.isArray(d.equipped)&&Object.keys(d.equipped).length===3&&Object.keys(slots).every(slot=>d.equipped[slot]===null||d.owned.includes(d.equipped[slot])&&byId(d.equipped[slot])?.slot===slot);}
const spent=d=>d.owned.reduce((n,id)=>n+(byId(id)?.price||0),0);
function migrate(d){
 // Refund retired props by removing their purchase deductions, once and idempotently.
 if(!d?.equipped)return d;
 if(!Object.hasOwn(d.equipped,'prop')){
  const e=d.equipped;
  if(Object.keys(e).length===2&&Object.hasOwn(e,'background')&&Object.hasOwn(e,'audience'))return {...d,equipped:{...e,effect:null}};
  return d;
 }
 const retired=['mic','speakers','flowers'],e=d.equipped;
 if(!Array.isArray(d.owned)||new Set(d.owned).size!==d.owned.length||d.owned.some(id=>!byId(id)&&!retired.includes(id))||Object.keys(e).length!==3||!(e.prop===null||retired.includes(e.prop)&&d.owned.includes(e.prop)))throw Error('Invalid retired props');
 const next={...d,owned:d.owned.filter(id=>!retired.includes(id)),equipped:{background:e.background,effect:null,audience:e.audience}};
 if(!valid(next))throw Error('Invalid stage decorations');return next;
}
module.exports={items,slots,byId,fresh,valid,spent,migrate};
