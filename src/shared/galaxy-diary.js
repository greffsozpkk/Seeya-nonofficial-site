'use strict';
const P = require('./passport');
const members = {'씨야':'seeya','남규리':'gyuri','김연지':'yeonji','이보람':'boram'};

// Call only after a confirmed create, password-verified edit or delete.
function update(adapter, id, letter) {
 if (!/^[a-f0-9-]{36}$/.test(id)) throw Error('편지 번호를 확인해 주세요.');
 const entryId = 'galaxy-' + id;
 const store = P.storage(adapter);
 const state = store.get();
 const previous = state.entries.find(e => e.entryId === entryId);
 if (!letter && !previous) return entryId;
 const entries = state.entries.filter(e => e.entryId !== entryId);
 if (letter) {
  if (letter.id !== id || !Object.hasOwn(members,letter.recipient)) throw Error('편지를 확인해 주세요.');
  const now = new Date().toISOString();
  entries.push(P.entry({
   ...previous, entryId, kind:'story', status:'done', date:letter.date,
   title:letter.recipient+'에게 보낸 은하수 편지', members:[members[letter.recipient]],
   note:letter.body, snapshot:{title:letter.nickname},
   createdAt:previous?.createdAt || now, updatedAt:now
  }));
 }
 store.save({...state,entries});
 return entryId;
}
module.exports = {update};
