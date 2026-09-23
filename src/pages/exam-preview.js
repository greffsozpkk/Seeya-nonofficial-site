const {banks,printQuestions}=require('../shared/exam');
const welcome=require('../shared/exam-welcome');
module.exports=()=>`<div class="page exam-page"><div id="examScreen">${welcome()}</div><section class="exam-print" aria-label="인쇄용 빈 시험지">${printQuestions(undefined,'',banks[0])}</section></div>`;
