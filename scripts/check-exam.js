const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict'),crypto=require('node:crypto'),{execFileSync}=require('node:child_process');
const root=path.resolve(__dirname,'..'),read=p=>fs.readFileSync(path.join(root,p),'utf8');
const {data,correct,answered,grade,shuffledChoices,printQuestions}=require('../src/shared/exam');
assert.equal(data.questions.length,25);assert.equal(data.questions.filter(q=>q.type==='choice').length,20);assert.equal(data.questions.filter(q=>q.type==='text').length,5);assert.equal(new Set(data.questions.map(q=>q.id)).size,25);
const all={};for(const q of data.questions){assert(q.explanation&&q.source.startsWith('https://'));if(q.type==='choice'){assert.equal(q.choices.length,4);assert.equal(new Set(q.choices).size,4);assert(Number.isInteger(q.answer)&&q.answer>=0&&q.answer<4);assert(!correct(q,String(q.answer)));assert(!correct(q,(q.answer+1)%4));}all[q.id]=q.answer;assert(correct(q,q.answer));assert(!answered(q,undefined));assert(!correct(q,undefined));}
assert.equal(grade(all).score,100);assert.equal(grade({}).score,0);assert.equal(grade({}).blank,25);assert.equal(grade({h01:1,h21:'내잘못입니다'}).score,8);
assert(correct(data.questions[20],'  내 잘못 입니다  '));assert(correct(data.questions[24],'우리 LIVE VER.'));assert(!correct(data.questions[24],'우리들'));assert(!correct(data.questions[20],'잘못입니다'));assert(!correct(data.questions[24],' '));
const orders=shuffledChoices(()=>0.25);orders.forEach((a,i)=>{if(data.questions[i].type==='choice')assert.deepEqual([...a].sort(),[0,1,2,3]);});
const printed=printQuestions();assert.equal((printed.match(/exam-print-question/g)||[]).length,25);assert(!printed.includes('근거 자료')&&!printed.includes('정답:'));
const route=JSON.parse(read('src/data/exam-preview-route.json')),file=route.path.slice(1)+'index.html',html=read(file);
assert(html.includes('noindex,nofollow,noarchive,nosnippet'));assert(!html.includes('googletagmanager')&&!html.includes('/assets/analytics.js'));assert(html.includes('no-referrer'));assert(!read('sitemap.xml').includes(route.path));assert(!read('build-manifest.json').includes(route.path));assert(!read('src/data/routes.json').includes(route.path));
const manifest=JSON.parse(read('build-manifest.json'));for(const f of manifest.files.filter(f=>f.endsWith('.html')))assert(!read(f).includes(route.path),f+' exposes preview');
assert(read('game/exam/index.html').includes('업데이트 예정'));assert(!read('game/exam/index.html').includes('시험지형으로 시작'));
for(const m of html.matchAll(/(?:href|src)="([^"#]+)"/g)){const ref=m[1];if(/^(https?:|data:)/.test(ref))continue;const p=path.join(root,ref.split('?')[0]);assert(fs.existsSync(p),'Preview missing resource '+ref);}
const hash=s=>crypto.createHash('sha256').update(s).digest('hex');const before=hash(html);execFileSync(process.execPath,['build.js'],{cwd:root});assert.equal(hash(read(file)),before);
console.log('PASS: exam 20+5, scoring, aliases, shuffled choices, blank print sheet, unlisted/noindex route, unchanged public entry, reproducible preview.');
