const {banks,printQuestions}=require('./exam');
const welcome=require('./exam-welcome');
module.exports=(preview=false)=>`<div class="page exam-page"><a class="game-back exam-back" href="/game/">← SEEYA PLAY</a><div id="examScreen" data-preview="${preview}">${welcome(banks[0],'',preview)}</div><section class="exam-print" aria-label="인쇄용 빈 시험지">${printQuestions(undefined,'',banks[0])}</section></div>`;
