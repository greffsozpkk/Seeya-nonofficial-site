'use strict';
const data=require('../data/exam-hard.json');
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const normalize=s=>String(s??'').normalize('NFKC').toLocaleLowerCase('en').replace(/\s+/g,'').trim();
function correct(q,value){
 if(q.type==='choice')return Number.isInteger(value)&&value===q.answer;
 const n=normalize(value);return n!==''&&[q.answer,...(q.aliases||[])].some(a=>normalize(a)===n);
}
function answered(q,value){return q.type==='choice'?Number.isInteger(value)&&value>=0&&value<q.choices.length:normalize(value)!=='';}
function grade(answers){const rows=data.questions.map(q=>({id:q.id,answered:answered(q,answers[q.id]),correct:correct(q,answers[q.id])}));return {rows,count:rows.filter(r=>r.correct).length,score:rows.filter(r=>r.correct).length*data.points,blank:rows.filter(r=>!r.answered).length};}
function shuffledChoices(random=Math.random){return data.questions.map(q=>{const a=(q.choices||[]).map((_,i)=>i);for(let i=a.length-1;i>0;i--){const j=Math.floor(random()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;});}
function printQuestions(order,name=''){return require('./exam-layout').papers((q,i)=>`<section class="exam-print-question"><h3>${i+1}. ${esc(q.prompt)} <small>[4점]</small></h3>${q.type==='choice'?(order?order[i]:q.choices.map((_,n)=>n)).map((v,n)=>`<p>${['①','②','③','④'][n]} ${esc(q.choices[v])}</p>`).join(''):'<p class="exam-print-answer">답: <span></span></p>'}</section>`,name);}
module.exports={data,esc,normalize,correct,answered,grade,shuffledChoices,printQuestions};
