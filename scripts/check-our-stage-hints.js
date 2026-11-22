'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs');
const base=require('../src/shared/our-stage'),wrap=B=>require('../src/shared/our-stage-leisure')(require('../src/shared/our-stage-first-release')(require('../src/shared/our-stage-simple')(B)));
const hints=require('../src/data/our-stage-story-hints.json'),normalize=s=>s.replace(/[\s·.,‘’“”'"()]/g,'').toLowerCase();
for(const M of [wrap(base),wrap(base.forTest())]){
 const questions=Object.entries(M.challenges).filter(([id])=>id.startsWith('story:'));
 assert.equal(questions.length,Object.keys(hints).length);
 for(const [id,q]of questions){
  assert.equal(q.hint,hints[id.slice(6)],id+' needs an explicit hint');
  assert(q.hint.length>=15,id+' should have a useful clue');
  assert.notEqual(q.hint,q.explanation,id+' must separate clue and explanation');
  assert(!normalize(q.hint).includes(normalize(q.choices[q.answer])),id+' reveals the answer');
 }
 assert.equal(M.challenges['story:album'].choices[M.challenges['story:album'].answer],'SG워너비');
 for(const id of ['story:ending','story:event-ost'])assert.equal(M.challenges[id].choices[M.challenges[id].answer],'최우수 OST상');
}
const client=fs.readFileSync('src/client/our-stage.js','utf8'),beforeAnswer=client.slice(client.indexOf('function challenge('),client.indexOf('function finishChallenge('));
assert(beforeAnswer.includes('q.hint'));assert(!beforeAnswer.includes('q.explanation'));
assert(client.slice(client.indexOf('function finishChallenge('),client.indexOf('function perform(')).includes('q.explanation'),'keep post-answer explanation');
console.log('PASS hints: all 29 story quizzes have indirect clues in public/test, no verbatim answers, unchanged duet/OST answers and explanations only after answering.');
