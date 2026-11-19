'use strict';
const original=require('../data/our-stage-activity-quiz.json'),stories=require('../data/our-stage-stories.json');
const bank=Object.entries(original).map(([id,q])=>({id,...q}));
for(const e of stories.filter(e=>['chapter-california','chapter-first-again','event-boram-nightingale','event-yeonji-return','event-gyulmung','event-rebloom-fanmeeting','event-the-fan-tour'].includes(e.id))){const q=e.quiz;bank.push({id:'memory:'+e.id,album:e.album,question:q.question,choices:[q.correct,...q.wrong],answer:0,explanation:q.explanation,source:e.source});}
const extra=[
 ['chapter-california','California Dream 재킷 촬영지로 소개된 두 도시는?','LA와 라스베가스','파리와 런던','도쿄와 오사카'],
 ['chapter-california','California Dream에 모인 이보람의 OST는 어느 드라마와 연결되나요?','풀하우스','49일','카이로스'],
 ['chapter-california','California Dream에 담긴 협업에서 김연지와 함께 노래한 가수는?','제아','아이유','태연'],
 ['chapter-brilliant','Hot Girl 활동 당시 씨야가 새롭게 보여 주고 싶었다고 밝힌 것은?','다른 장르와 춤','악기 연주만 하는 무대','멤버 없는 무대'],
 ['chapter-again','See You Again에 새 곡으로 함께 담긴 두 제목은?','내겐 너무 멋진 그대 · The Last','Stay · 잔향','Hot Girl · Turn It Up'],
 ['chapter-first-again','First, Again 앨범 소개에서 세 멤버가 참여한 작업은?','작사·작곡','뮤지컬 번역','영화 각본'],
 ['event-yeonji-gasoline','불광동 휘발유가 가왕에 오를 때 맞붙었던 가왕은?','흑기사','걸리버','나이팅게일'],
 ['event-boram-nightingale','나이팅게일이 처음 가왕에 올랐을 때 꺾은 가왕은?','걸리버','흑기사','불광동 휘발유'],
 ['event-boram-nightingale','나이팅게일이 지킨 가왕의 대수는?','103대부터 105대','35대부터 37대','1대부터 3대'],
 ['event-rebloom-fanmeeting','재결합 팬미팅 RE:BLOOM이 열린 서울의 장소는?','종로구 이들스(EDLS)','올림픽주경기장','고척스카이돔'],
 ['event-the-fan-tour','20주년 THE FAN 전국투어의 마지막 도시는?','인천','서울','부산'],
 ['event-the-fan-tour','20주년 THE FAN 전국투어가 이어진 도시 수는?','일곱 도시','세 도시','열두 도시']
];
extra.filter((_,i)=>i>=6).forEach(([id,question,...choices],i)=>{const e=stories.find(e=>e.id===id);bank.push({id:'detail:'+i,album:e.album,question,choices,answer:0,explanation:e.body[0]+(id==='chapter-california'?' '+e.body[1]:''),source:e.source});});
module.exports=bank;
