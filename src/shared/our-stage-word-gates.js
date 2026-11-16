'use strict';
// Reuse the short excerpts already supplied in the archive's lyric quiz dataset.
const bank=require('../../data/lyric-quiz.json');
const specs=[['lovely-sweet-heart','L1-001'],['brilliant-change','L1-021'],['still-here','L1-022']];
module.exports=specs.map(([album,id])=>{const q=bank.find(q=>q.id===id);return {album,id,song:q.song,source:q.source,tokens:q.lyric.trim().split(/\s+/)};});
