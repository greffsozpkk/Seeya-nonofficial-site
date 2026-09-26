'use strict';
const {grade}=require('../shared/exam');
const {level}=require('../shared/exam-layout');

// Draw locally with system fonts; no screenshot service, remote images or uploads.
function reportImage(answers,name,bank){
 const r=grade(answers,bank),choice=r.rows.slice(0,20).filter(x=>x.correct).length;
 const canvas=document.createElement('canvas');canvas.width=1400;canvas.height=1900;
 const c=canvas.getContext('2d');if(!c)throw new Error('Canvas unavailable');c.scale(2,2);
 const ink='#352b31',pink='#8e4969',line='#d8c6cf';
 function text(s,x,y,size=14,color=ink,align='left',bold=false){c.font=`${bold?'700':'400'} ${size}px Arial,"Malgun Gothic","Apple SD Gothic Neo",sans-serif`;c.fillStyle=color;c.textAlign=align;c.textBaseline='top';c.fillText(String(s),x,y);}
 function rule(y){c.strokeStyle=line;c.lineWidth=1;c.beginPath();c.moveTo(44,y);c.lineTo(656,y);c.stroke();}
 function wrapped(s,x,y,width){let row='',n=0;c.font='14px Arial,"Malgun Gothic","Apple SD Gothic Neo",sans-serif';for(const ch of s){if(c.measureText(row+ch).width>width){text(row,x,y+n*19,14,ink,'center');row='';n++;}row+=ch;}text(row,x,y+n*19,14,ink,'center');}
 c.fillStyle='#fff';c.fillRect(0,0,700,950);c.strokeStyle=line;c.strokeRect(20.5,20.5,659,909);
 text('SEEYA ARCHIVE',44,43,11,pink);text('팬메이드 모의고사',656,43,11,pink,'right');
 text(`씨야 모의고사 · 난이도 ${bank.level}`,350,80,14,pink,'center');text('성적 통지서',350,110,38,ink,'center',true);rule(168);
 [['응시자',name||'응시자'],['시험 영역',bank.area],['총 문항','25문항']].forEach(([label,value],i)=>{const x=146+i*204;text(label,x,187,11,pink,'center');wrapped(value,x,207,182);});rule(260);
 text('종합 점수',197,279,13,pink,'center');text('성취 등급',503,279,13,pink,'center');
 text(r.score,197,305,56,pink,'center',true);text(level(r.score),503,305,56,pink,'center',true);
 text('/ 100점',197,370,12,pink,'center');text('등급',503,370,12,pink,'center');rule(404);
 text('영역별 성적',44,421,15,ink,'left',true);
 const rows=[['영역','문항 수','정답 수','점수'],['객관식','20',choice,`${choice*4} / 80`],['주관식','5',r.count-choice,`${(r.count-choice)*4} / 20`],['합계','25',r.count,`${r.score} / 100`]];
 rows.forEach((row,i)=>{const y=450+i*34;if(i===0||i===3){c.fillStyle='#f8eff3';c.fillRect(44,y,612,34);}row.forEach((v,j)=>text(v,120+j*153,y+10,13,ink,'center',i===0||i===3));rule(y+34);});
 text('문항별 정오표',44,609,15,ink,'left',true);text(`정답 ${r.count} · 오답 ${25-r.count-r.blank} · 미응답 ${r.blank}`,656,611,12,pink,'right');
 r.rows.forEach((row,i)=>{const x=44+(i%5)*122.4,y=641+Math.floor(i/5)*32;c.strokeStyle=line;c.strokeRect(x,y,122.4,32);text(i+1,x+33,y+9,12,pink,'center');text(row.correct?'O':row.answered?'X':'—',x+79,y+7,16,row.correct?pink:ink,'center',true);});
 text('당신의 마음에 남아 있는 씨야를 응원합니다.',350,824,14,pink,'center');text('SEEYA ARCHIVE',350,852,13,ink,'center',true);
 text('1등급 90점 이상 · 2등급 80점 이상 · 3등급 60점 이상',350,884,10,pink,'center');
 text('4등급 40점 이상 · 5등급 40점 미만  |  팬게임 자체 기준',350,900,10,pink,'center');
 return canvas.toDataURL('image/png');
}
module.exports={reportImage};
