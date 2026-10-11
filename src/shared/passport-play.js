'use strict';
const GAMES={lyrics:'가사 보고 제목 맞히기',exam:'씨야 모의고사',other:'기타 씨야 플레이'};
function clean(p={}){
 if(!p||typeof p!=='object'||!Object.hasOwn(GAMES,p.game))throw Error('플레이 종류를 선택해 주세요.');
 const text=(s,n)=>{if(typeof s!=='string'||s.length>n)throw Error('플레이 정보를 확인해 주세요.');return s.trim();};
 const number=v=>{if(v==null||v==='')return null;if(!Number.isInteger(v)||v<0||v>10000)throw Error('점수·정답 수는 0 이상의 정수로 입력해 주세요.');return v;};
 const score=number(p.score),maxScore=number(p.maxScore),correct=number(p.correct),total=number(p.total);
 if((score===null)!==(maxScore===null)||maxScore===0||score>maxScore)throw Error('점수와 만점을 함께 확인해 주세요.');
 if((correct===null)!==(total===null)||total===0||correct>total)throw Error('정답 수와 전체 문항 수를 함께 확인해 주세요.');
 return {game:p.game,level:text(p.level||'',80),mode:text(p.mode||'',30),score,maxScore,correct,total,source:p.source==='result'?'result':'manual'};
}
function summary(p){if(!p)return '';return [p.level,p.mode,p.score==null?'':`${p.score} / ${p.maxScore}점`,p.correct==null?'':`정답 ${p.correct} / ${p.total}개`].filter(Boolean).join(' · ');}
module.exports={GAMES,clean,summary};
