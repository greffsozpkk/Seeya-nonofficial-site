'use strict';
// Practice-only progression; frozen legacy economy is retained for save compatibility.
module.exports=function(B){
 const old=require('./our-stage-growth')(B),activity=require('../data/our-stage-activity-quiz.json'),mini=require('./our-stage-puzzles')(require('./our-stage-mini')(B.timing.testMode,activity));
 mini.games[0]={...mini.games[0],name:'씨야 활동 퀴즈',description:'무대·방송·수상·협업의 순간을 떠올리는 세 문제예요.'};
 const seed=()=>({version:1,walletOffset:0,concerts:{},nickname:''});
 const eligible=(s,id)=>{const a=B.songAlbum(id);if(!a||a.id!=='first-mind'&&!B.albumUnlocked(s,a.id))return false;const i=a.tracks.findIndex(t=>t.id===id);return i===0||B.ready(s,a.tracks[i-1].id);};
 function collect(s){let n=0;for(const id of B.ids)if(!B.open(s,id)&&eligible(s,id)){s.collected.push(id);n++;}return n;}
 const coins=s=>B.coins(s)+s.simple.walletOffset;
 function valid(s){try{const x=s.simple;if(!x||x.version!==1||!Number.isSafeInteger(x.walletOffset)||Math.abs(x.walletOffset)>1e12||typeof x.nickname!=='string'||x.nickname.length>24||!x.concerts||Array.isArray(x.concerts))return false;
 if(!Object.entries(x.concerts).every(([id,r])=>B.albumById(id)&&r&&Number.isSafeInteger(r.at)&&r.at>=0&&r.at<253402268399999&&Array.isArray(r.tracks)&&r.tracks.length===new Set(r.tracks).size&&B.albumById(id).tracks.filter(t=>!t.instrumental).every(t=>r.tracks.includes(t.id)&&B.ready(s,t.id))&&r.tracks.every(t=>B.songAlbum(t)?.id===id)&&r.serial==='OS-'+id+'-'+r.at))return false;
 return B.valid(s,{balance:coins(s),miniValid:mini.valid,eligible:(s,id)=>eligible(s,id)||B.eligible(s,id)});
 }catch{return false;}}
 function loadSave(raw){if(typeof raw!=='string'||raw.length>512000)throw Error('Invalid stage save');let s=JSON.parse(raw);if(s?.simple){if(!valid(s))throw Error('Invalid practice save');return s;}
 s=s?.growth?old.loadSave(raw):B.loadSave(raw);const balance=s.growth?old.coins(s):B.coins(s);s.simple=seed();s.simple.walletOffset=balance-B.coins(s);s.points=Math.min(100,s.points);mini.migrate(s.mini);
 if(s.mini.active?.kind==='quiz'){s.mini.active=null;s.mini.plays=Math.max(0,s.mini.plays-1);s.mini.next.quiz=0;}
 if(!valid(s))throw Error('Invalid migrated practice save');return s;}
 const fresh=now=>{const s=B.fresh(now);s.simple=seed();mini.migrate(s.mini);return s;};
 const settle=(s,now=Date.now())=>B.settle(s,now)+collect(s);
 const albumRequirements=(s,id)=>B.albumRequirements(s,id).map((r,i)=>i===0?{...r,label:B.albums[B.albums.findIndex(a=>a.id===id)-1].name+' 전곡 연습 완료',done:r.done&&B.albumMastered(s,B.albums[B.albums.findIndex(a=>a.id===id)-1].id)}:r);
 const albumAvailable=(s,id)=>B.albumAvailable(s,id)&&albumRequirements(s,id).every(r=>r.done);
 function unlockAlbum(s,id){if(!albumAvailable(s,id)||!B.unlockAlbum(s,id))return false;collect(s);return true;}
 const songs=B.songs.map(t=>{const a=B.songAlbum(t.id),i=a.tracks.findIndex(x=>x.id===t.id);return {...t,hint:i?'앞 곡의 연습을 모두 마치면 자동으로 열려요.':a.id==='first-mind'?'첫 연습을 시작해요.':'앨범을 열면 바로 연습할 수 있어요.'};});
 const challenges={...B.challenges},map={'first':'debut-team','album':'debut-duet','ending':'debut-ost','chapter-lovely':'copyright','chapter-california':'california-ost','chapter-brilliant':'new-beat','chapter-rebloom':'rebloom-member','chapter-again':'again-new','chapter-still':'pre-release','chapter-first-again':'album-writing','gr':'gyuri-49','yj':'yeonji-dmc','br':'boram-team','reunion':'reunion-show'};
 for(const [id,q]of Object.entries(map))challenges['story:'+id]={...activity['song:activity-'+q],level:1,skill:'활동의 순간'};
 const canChallenge=(s,key)=>!key.startsWith('song:')&&B.canChallenge(s,key);
 function answer(s,key,index){if(!canChallenge(s,key)||challenges[key].answer!==index)return false;return B.answer(s,key,B.challenges[key].answer);}
 function claim(s,id){if(['first','ending'].includes(id)&&B.canChallenge(s,'story:'+id)&&!s.proofs.includes('story:'+id))s.proofs.push('story:'+id);return B.claim(s,id);}
 function purchase(s,id,member){const o=B.shopById(id);if(!o||!B.memberIds.includes(member)||s.purchases.includes(id+':'+member)||coins(s)<o.price)return false;s.purchases.push(id+':'+member);return true;}
 const concertTracks=(s,id)=>B.albumById(id)?.tracks.filter(t=>!t.instrumental).map(t=>t.id)||[];
 const concertReady=(s,id)=>B.albumComplete(s,id)&&concertTracks(s,id).length>0&&concertTracks(s,id).every(t=>B.ready(s,t));
 function finishConcert(s,id,tracks,now=Date.now()){if(!concertReady(s,id)||s.simple.concerts[id]||!Number.isSafeInteger(now)||now<0||now>=253402268399999||!Array.isArray(tracks)||!concertTracks(s,id).every(t=>tracks.includes(t)))return false;s.simple.concerts[id]={at:now,tracks:concertTracks(s,id),serial:'OS-'+id+'-'+now};return true;}
 const badges=s=>B.badges(s).filter(b=>!b.id.startsWith('cheer-')||b.earned).map(b=>b.id.startsWith('cheer-')?{...b,hint:'이전에 간직한 응원 기록'}:b);
 return {...B,simpleMode:true,fresh,loadSave,valid,mini,coins,purchase,settle,eligible,songs,albumRequirements,albumAvailable,unlockAlbum,challenges,canChallenge,answer,claim,badges,concertTracks,concertReady,finishConcert};
};
