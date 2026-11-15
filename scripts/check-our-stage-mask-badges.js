const assert=require('node:assert/strict'),M=require('../src/shared/our-stage').forTest();
const s=structuredClone(require('./check-our-stage-stories').unread);
for(const [id,member,date] of [['event-yeonji-gasoline','김연지','2016.07.31'],['event-boram-nightingale','이보람','2019.06.02']]){
 const e=M.storyById(id);assert.equal(e.subject,member);assert.equal(e.date,date);assert(!M.storyDestination(id));
 const badge=()=>M.badges(s).find(b=>b.id===id);assert(!badge().earned);assert(badge().name.startsWith(member));
 const before=M.coins(s);assert(M.answer(s,'story:'+id,M.challenges['story:'+id].answer));assert(badge().earned);assert.equal(M.coins(s),before+8);
 assert(!M.answer(s,'story:'+id,M.challenges['story:'+id].answer));assert.equal(M.coins(s),before+8);
 assert(M.decorateCard(s,'album:first-mind:'+(member==='김연지'?'yj':'br'),id));
 assert.deepEqual(M.loadSave(JSON.stringify(s)),s);
}
console.log('PASS two championship stories: correct identities/dates, optional gates, once-only badges/coins, member-card decoration and save reload.');
