'use strict';
// Selected gestures from the supplied passages, enlarged for the front-facing pixel rig.
// This is an in-place adaptation, not frame-exact reconstruction: travelling/closeups
// become rhythmic knee lifts. Actor x, body yaw and crossing steps stay at zero.
module.exports=({cue,rest})=>{
 const p=(b,c={})=>Array.from({length:12},(_,i)=>c[i]??b[i]??0);
 const sing=p(rest,{6:100,7:90}),waist=p(rest,{6:22,7:90});
 function pose(shoulder,elbow,beat,lead,accent=0){
  const side=beat%2?1:-1;
  const v=p(lead?sing:waist,{1:beat%2?5:0,2:side*(4+accent),3:-side*3,4:shoulder,5:elbow,8:side*(14+accent),9:-side*(11+accent)});
  v.push(1.3);return v; // Slightly longer free-arm reach keeps gestures readable below the large pixel head.
 }
 const marry=[];
 // Toe lifts; gathering hands to the chest; a promise offered forward;
 // an open palm by the cheek. Smaller members echo the lead instead of freezing.
 const phrases=[
  {name:'앞발 들기와 가슴으로 모았다 펴는 손',lead:0,arms:[[8,-25],[35,-70],[-18,-115],[50,-55],[82,-18],[35,-65],[-15,-110],[65,-35]]},
  {name:'약속 손을 얼굴 옆에 들고 앞으로 건네기',lead:2,arms:[[65,-125],[95,-105],[55,-55],[90,-15],[40,-75],[-18,-115],[65,-95],[90,-30]]},
  {name:'손바닥을 어깨 높이로 펼치고 얼굴 옆으로 흔들기',lead:2,arms:[[78,-70],[112,-105],[70,-45],[115,-90],[78,-35],[110,-110],[60,-65],[25,-95]]},
  {name:'세 멤버 얼굴 옆 웨이브와 번갈아 발끝 들기',lead:1,arms:[[92,-110],[120,-95],[74,-60],[115,-100],[68,-40],[98,-105],[42,-65],[-20,-95]]}
 ];
 phrases.forEach((phrase,section)=>phrase.arms.forEach(([arm,elbow],i)=>{
  const members=[0,1,2].map(m=>pose(arm+(m-1)*5,elbow,i,m===phrase.lead,section===3?2:0));
  marry.push(cue(section*6+i*.75,phrase.name+' · '+(i+1),...members));
 }));
 marry.push(cue(24,'허리 손과 정면 자세로 다음 무대에 연결',pose(8,-25,0,true),pose(8,-25,0,true),pose(8,-25,0,true)));
 const voice=[];
 // Four unmistakable overhead→temple→outward accents from the chorus motif.
 // The reference's travelling passages are replaced by in-place steps as requested.
 const arms=[[20,-65],[95,-45],[158,-25],[123,-75],[165,-15],[92,-12],[110,-110],[65,-45],[12,-35],[50,-65]];
 for(let repeat=0;repeat<4;repeat++)arms.forEach(([arm,elbow],i)=>{
  const members=[0,1,2].map(m=>{
   const v=pose(arm+(m-1)*4,elbow,i,m===(repeat<2?2:0),2);
   // Keep the microphone near the singer; other members punctuate the open-arm beat.
   if(m!==(repeat<2?2:0)&&i===5){v[6]=-65;v[7]=25;}
   return v;
  });
  voice.push(cue(repeat*5+i*.5,`${repeat+1}번째 후렴 강조 · ${['준비 반동','팔 올리기','머리 위 큰 팔선','머리 옆 접기','위로 한 번 더','옆으로 크게 펼치기','관자놀이 손짓','앞으로 펼치기','제자리 발 구르기','다음 강조로 연결'][i]}`,...members));
 });
 voice.push(cue(20,'마지막 반동을 풀며 다음 무대로 연결',pose(20,-65,0,true),pose(20,-65,0,false),pose(20,-65,0,false)));
 return {marry,voice};
};
