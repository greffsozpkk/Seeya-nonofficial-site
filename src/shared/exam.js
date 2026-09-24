'use strict';
const data=require('../data/exam-hard.json');
const banks=[require('../data/exam-reunion.json'),require('../data/exam-memory.json'),data];
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const normalize=s=>String(s??'').normalize('NFKC').toLocaleLowerCase('en').replace(/\s+/g,'').trim();
const validIndex=(q,value)=>Number.isInteger(value)&&value>=0&&value<q.choices.length;
function validSelection(q,value){return Array.isArray(value)&&value.length>0&&new Set(value).size===value.length&&value.every(v=>validIndex(q,v));}
function correct(q,value){
 if(q.type==='choice')return q.multiple?validSelection(q,value)&&value.length===q.answer.length&&q.answer.every(v=>value.includes(v)):validIndex(q,value)&&value===q.answer;
 const n=normalize(value);return n!==''&&[q.answer,...(q.aliases||[])].some(a=>normalize(a)===n);
}
function answered(q,value){return q.type==='choice'?(q.multiple?validSelection(q,value):validIndex(q,value)):normalize(value)!=='';}
function answerText(q,value){if(!answered(q,value))return '미응답';return q.type==='choice'?(q.multiple?[...value].sort((a,b)=>a-b).map(v=>q.choices[v]).join(' / '):q.choices[value]):String(value);}
function grade(answers,bank=data){const rows=bank.questions.map(q=>({id:q.id,answered:answered(q,answers[q.id]),correct:correct(q,answers[q.id])}));return {rows,count:rows.filter(r=>r.correct).length,score:rows.filter(r=>r.correct).length*bank.points,blank:rows.filter(r=>!r.answered).length};}
function shuffledChoices(random=Math.random,bank=data){return bank.questions.map(q=>{const a=(q.choices||[]).map((_,i)=>i);for(let i=a.length-1;i>0;i--){const j=Math.floor(random()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;});}
function printQuestions(order,name='',bank=data){return require('./exam-layout').papers((q,i)=>`<section class="exam-print-question"><h3>${i+1}. ${esc(q.prompt)} <small>[4점]</small></h3>${q.multiple?'<p class="exam-multiple-help">복수정답 · 정답을 모두 선택해야 4점입니다. 부분 점수는 없습니다.</p>':''}${q.type==='choice'?(order?order[i]:q.choices.map((_,n)=>n)).map((v,n)=>`<p>${['①','②','③','④'][n]} ${esc(q.choices[v])}</p>`).join(''):'<p class="exam-print-answer">답: <span></span></p>'}</section>`,name,bank);}
module.exports={data,banks,esc,normalize,correct,answered,answerText,grade,shuffledChoices,printQuestions};
