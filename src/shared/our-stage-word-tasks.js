'use strict';
const bank=require('../../data/lyric-quiz.json');
module.exports=require('../data/our-stage-word-task-specs.json').map(([album,track,id])=>{const q=bank.find(q=>q.id===id);return {album,track,id,song:q.song,source:q.source,tokens:q.lyric.trim().split(/\s+/)};});
