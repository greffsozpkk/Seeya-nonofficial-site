const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict'),crypto=require('node:crypto'),{execFileSync}=require('node:child_process');
const root=path.resolve(__dirname,'..'),read=p=>fs.readFileSync(path.join(root,p),'utf8');
const {data,banks,correct,answered,answerText,grade,shuffledChoices,printQuestions}=require('../src/shared/exam');
assert.equal(data.questions.length,25);assert.equal(data.questions.filter(q=>q.type==='choice').length,20);assert.equal(data.questions.filter(q=>q.type==='text').length,5);assert.equal(new Set(data.questions.map(q=>q.id)).size,25);
const all={};for(const q of data.questions){assert(q.explanation&&q.source.startsWith('https://'));if(q.type==='choice'){assert.equal(q.choices.length,4);assert.equal(new Set(q.choices).size,4);if(q.multiple){assert(Array.isArray(q.answer)&&q.answer.length>1&&q.answer.length<4);assert.equal(new Set(q.answer).size,q.answer.length);assert(q.answer.every(v=>Number.isInteger(v)&&v>=0&&v<4));}else assert(Number.isInteger(q.answer)&&q.answer>=0&&q.answer<4);assert(!correct(q,String(q.answer)));assert(!correct(q,(q.answer+1)%4));}all[q.id]=q.answer;assert(correct(q,q.answer));assert(!answered(q,undefined));assert(!correct(q,undefined));}
assert.equal(grade(all).score,100);assert.equal(grade({}).score,0);assert.equal(grade({}).blank,25);assert.equal(grade({h01:1,h21:'내잘못입니다'}).score,8);
assert(correct(data.questions[20],'  내 잘못 입니다  '));assert(correct(data.questions[24],'lIe'));assert(!correct(data.questions[24],'우리들'));assert(!correct(data.questions[20],'잘못입니다'));assert(!correct(data.questions[24],' '));
const orders=shuffledChoices(()=>0.25);orders.forEach((a,i)=>{if(data.questions[i].type==='choice')assert.deepEqual([...a].sort(),[0,1,2,3]);});
const printed=printQuestions();assert.equal((printed.match(/exam-print-question/g)||[]).length,25);assert(!printed.includes('근거 자료')&&!printed.includes('정답:'));
const {sheets,level,report}=require('../src/shared/exam-layout');
// Check exported report content against grading for all areas, including blanks.
const {reportImage}=require('../src/client/exam-export');
for(const bank of banks){
 for(const filled of [false,true]){
  const labels=[],answers=filled?Object.fromEntries(bank.questions.map(q=>[q.id,q.answer])):{};
  const context={scale(){},fillRect(){},strokeRect(){},beginPath(){},moveTo(){},lineTo(){},stroke(){},fillText(t){labels.push(t);},measureText(t){return {width:t.length*14};}};
  const canvas={getContext:()=>context,toDataURL:()=> 'data:image/png;test'};
  global.document={createElement:()=>canvas};
  try{assert.equal(reportImage(answers,'검토자',bank),'data:image/png;test');}finally{delete global.document;}
  assert.equal(canvas.width,1400);assert.equal(canvas.height,1900);
  assert(labels.includes(bank.area)&&labels.includes('검토자'));
  assert(labels.includes(filled?'100 / 100':'0 / 100'));
  assert.equal(labels.filter(t=>t==='O').length,filled?25:0);
  assert.equal(labels.filter(t=>t==='—').length,filled?0:25);
  assert(labels.includes(filled?'정답 25 · 오답 0 · 미응답 0':'정답 0 · 오답 0 · 미응답 25'));
 }
}
assert.deepEqual(sheets.flat(2),Array.from({length:25},(_,i)=>i));
assert.equal((printed.match(/class="exam-paper"/g)||[]).length,3);
assert.deepEqual([0,39,40,59,60,79,80,89,90,100].map(level),[5,5,4,4,3,3,2,2,1,1]);
const mixed=report({h01:1,h02:1,h21:'내 잘못입니다'},'<응시자>');
assert(mixed.includes('&lt;응시자&gt;')&&!mixed.includes('<응시자>'));
assert.equal((mixed.match(/class="correct"/g)||[]).length,2);
assert.equal((mixed.match(/class="wrong"/g)||[]).length,1);
assert.equal((mixed.match(/class="blank"/g)||[]).length,22);
assert.equal((mixed.match(/data-review="h/g)||[]).length,25);
const namedPrint=printQuestions(orders,'<응시자>');
assert(namedPrint.includes('&lt;응시자&gt;')&&!namedPrint.includes('<응시자>'));
const firstPrinted=namedPrint.split('class="exam-print-question"')[1].split('</section>')[0];
orders[0].forEach((v,n)=>assert(firstPrinted.includes(['①','②','③','④'][n]+' '+data.questions[0].choices[v])));
assert.equal(banks.length,3);
assert.equal(new Set(banks.flatMap(b=>b.questions.map(q=>q.id))).size,75);
for(const bank of banks){
 assert.equal(bank.questions.length,25);assert.equal(bank.questions.filter(q=>q.type==='choice').length,20);assert.equal(bank.questions.filter(q=>q.type==='text').length,5);
 const answers={};for(const q of bank.questions){assert(q.prompt&&q.explanation&&q.source.startsWith('https://'));if(q.type==='choice'){assert.equal(q.choices.length,4);assert.equal(new Set(q.choices).size,4);if(q.multiple){assert(Array.isArray(q.answer)&&q.answer.length>1&&q.answer.length<4);assert.equal(new Set(q.answer).size,q.answer.length);assert(q.answer.every(v=>Number.isInteger(v)&&v>=0&&v<4));}else assert(Number.isInteger(q.answer)&&q.answer>=0&&q.answer<4);}answers[q.id]=q.answer;assert(correct(q,q.answer));for(const alias of q.aliases||[])assert(correct(q,alias));}
 assert.equal(grade(answers,bank).score,100);assert.equal(grade({},bank).blank,25);
 for(const other of banks.filter(b=>b!==bank))assert.equal(grade(answers,other).score,0,'Answers must not cross areas');
 const orders=shuffledChoices(()=>0.25,bank),paper=printQuestions(orders,'<검토자>',bank),result=report(answers,'<검토자>',bank);
 assert(paper.includes(bank.area)&&result.includes(bank.area));assert(paper.includes('&lt;검토자&gt;')&&result.includes('&lt;검토자&gt;'));
 assert.equal((paper.match(/exam-print-question/g)||[]).length,25);assert.equal((paper.match(/class="exam-paper"/g)||[]).length,3);
 assert(!paper.includes('정답:')&&!paper.includes('근거 자료'));
 for(const q of bank.questions)assert(paper.includes(q.prompt.replace(/&/g,'&amp;')));
}
assert(correct(banks.find(b=>b.key==='memory').questions[21],'女神'));assert(correct(banks.find(b=>b.key==='memory').questions[22],'초롱'));assert(correct(banks.find(b=>b.key==='reunion').questions[24],'우리 LIVE VER.'));assert(!correct(data.questions[24],'우리'));
const memory=banks.find(b=>b.key==='memory'),multi=memory.questions[0];
assert(multi.multiple);assert.deepEqual(multi.answer,[0,1]);
for(let mask=0;mask<16;mask++){
 const selection=[0,1,2,3].filter(i=>mask&(1<<i)),r=grade({[multi.id]:selection},memory);
 assert.equal(correct(multi,selection),mask===3);assert.equal(answered(multi,selection),mask!==0);
 assert.equal(r.score,mask===3?4:0);assert.equal(r.blank,mask===0?25:24);
}
assert(correct(multi,[1,0]));
for(const bad of [undefined,null,0,'0,1',[0,0,1],[0,1,4],['0',1]]){assert(!correct(multi,bad));assert(!answered(multi,bad));}
assert.equal(answerText(multi,[1,0]),multi.choices[0]+' / '+multi.choices[1]);assert.equal(answerText(multi,[]),'미응답');
assert(printQuestions(undefined,'',memory).includes('복수정답'));
assert(require('../src/shared/exam-welcome')(memory).includes('부분 점수는 없습니다'));
const route=JSON.parse(read('src/data/exam-preview-route.json')),file=route.path.slice(1)+'index.html',html=read(file);
for(const bank of banks)assert(html.includes('data-area="'+bank.key+'"')&&html.includes(bank.area));
assert(html.includes('noindex,nofollow,noarchive,nosnippet'));assert(!html.includes('googletagmanager')&&!html.includes('/assets/analytics.js'));assert(html.includes('no-referrer'));assert(!read('sitemap.xml').includes(route.path));assert(!read('build-manifest.json').includes(route.path));assert(!read('src/data/routes.json').includes(route.path));
const manifest=JSON.parse(read('build-manifest.json'));for(const f of manifest.files.filter(f=>f.endsWith('.html')))assert(!read(f).includes(route.path),f+' exposes preview');
const publicExam=read('game/exam/index.html');
assert(publicExam.includes('시험지형으로 시작')&&publicExam.includes('카드형으로 시작'));
assert(publicExam.includes('data-preview="false"')&&html.includes('data-preview="true"'));
assert(!publicExam.includes('PREVIEW')&&!publicExam.includes('업데이트 예정')&&!publicExam.includes('noindex'));
assert(html.includes('SEEYA EXAM · PREVIEW'));
assert(publicExam.includes('https://seeya-fanpage.com/game/exam/'));
assert(read('sitemap.xml').includes('https://seeya-fanpage.com/game/exam/'));
for(const bank of banks)assert(publicExam.includes('data-area="'+bank.key+'"'));
for(const match of html.matchAll(/(?:href|src)="(\/assets\/seeya-exam[^"?]+)"/g))assert(publicExam.includes(match[1]),'Public exam must load exam engine and styles');
for(const name of ['index.html','game/index.html'])assert(!read(name).includes('씨야 모의고사는 업데이트 예정'));
assert(read('game/index.html').includes('모의고사 풀기'));
assert(read('guide/index.html').includes('href="/game/exam/"'));
assert(read('src/styles/exam.css').includes('body:is([data-page="exam"],[data-page="exam-preview"])'));

for(const m of html.matchAll(/(?:href|src)="([^"#]+)"/g)){const ref=m[1];if(/^(https?:|data:)/.test(ref))continue;const p=path.join(root,ref.split('?')[0]);assert(fs.existsSync(p),'Preview missing resource '+ref);}
const hash=s=>crypto.createHash('sha256').update(s).digest('hex');const before=hash(html);execFileSync(process.execPath,['build.js'],{cwd:root});assert.equal(hash(read(file)),before);
console.log('PASS: 3 areas / 75 questions, isolated scoring, aliases, shuffled choices, 3-sheet blank print, unlisted/noindex route, public playable entry and preserved preview, reproducible preview.');
