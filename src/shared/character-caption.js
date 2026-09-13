const {esc}=require('./common');
function characterCaption(item){
 return item.usedOn.length?item.usedOn.map(p=>`<a href="${esc(p.path)}">${esc(p.label)} →</a>`).join(''):'<span class="character-generic">캐릭터 일러스트</span>';
}
function characterAlt(item,index){return `${item.usedOn.map(p=>p.label).join(' · ')||'씨야'} 캐릭터 일러스트 ${index+1}`;}
module.exports={characterCaption,characterAlt};
