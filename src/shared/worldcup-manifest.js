'use strict';
const crypto=require('node:crypto');
function describe(c){return {id:c.id,title:c.title,version:c.version,rounds:c.rounds,candidates:c.candidates.map(r=>({id:r.id,title:r.title,artist:r.artist||'씨야',album:r.work||r.album||''}))};}
function version(c){const key=JSON.stringify({rounds:c.rounds,ids:c.candidates.map(x=>x.id).sort()}),fingerprint=c.version+'-'+crypto.createHash('sha256').update(key).digest('hex').slice(0,12),baseline=require('../data/worldcup-version-baseline.json')[c.id];return baseline?.fingerprint===fingerprint?baseline.version:fingerprint;}
function current(){return require('./worldcup-collections').audit().map(c=>({...c,version:version(c)}));}
function manifest(){return {schema:1,collections:current().map(describe)};}
module.exports={describe,version,current,manifest};
