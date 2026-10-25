'use strict';
const {bank,axes}=require('./clinic-scoring'),profiles=require('../data/clinic-profiles.json');
function explain(score){
 const profile=score.typeCode?profiles.types[score.typeCode]:null;
 const prescription=profile?.prescription||profiles.fallbackPrescriptions[score.possibleTypes.length?'balanced':'insufficient'];
 const meaning=score.typeCode?axes.map((axis,i)=>{const code=score.typeCode[i],def=bank.axes[axis];return {code,label:code===def.left?def.leftLabel:def.rightLabel};}):[];
 if(profile)return {...profile,meaning,prescription,revision:profiles.revision};
 if(score.possibleTypes.length)return {tagline:'한쪽의 이름만으로 다 담기지 않는 마음',paragraphs:['지금 응답에서는 일부 방향이 같은 비중으로 나타났습니다. 어느 한 유형에 억지로 맞추기보다, 양쪽의 감상 방식을 함께 즐기는 모습으로 읽어보세요.','아래의 가능한 유형은 함께 살펴볼 후보입니다. 경계인 방향에 따라 마음이 움직일 수 있으며, 나머지 비율에서 지금의 감상 취향을 확인할 수 있습니다.'],findings:['경계 소견 · 같은 비중으로 나타난 방향은 한쪽으로 확정하지 않았습니다.','감상 제안 · 양쪽 설명을 읽으며 실제로 편안했던 감상 장면을 떠올려보세요.'],meaning,prescription,revision:profiles.revision};
 return {tagline:'확인된 마음부터 천천히 살펴보기',paragraphs:['일부 영역에 판단할 응답이 충분하지 않아 전체 유형의 해석을 보류했습니다. 비율이 표시된 방향은 먼저 살펴보고, 아직 어렵게 느껴지는 문항은 다시 읽어볼 수 있습니다.'],findings:['관찰 보류 · 확인되지 않은 성향이나 행동을 임의로 덧붙이지 않았습니다.'],meaning,prescription,revision:profiles.revision};
}
module.exports={explain,profiles};
