'use strict';
const limit=30;
const fresh=()=>({day:null,count:0});
const day=now=>Number.isSafeInteger(now)&&now>=0&&now<253402268399999?new Date(now+9*3600000).toISOString().slice(0,10):null;
function valid(x){return !!x&&!Array.isArray(x)&&Number.isInteger(x.count)&&x.count>=0&&x.count<=limit&&(x.day===null?x.count===0:typeof x.day==='string'&&/^\d{4}-\d{2}-\d{2}$/.test(x.day)&&Number.isFinite(Date.parse(x.day+'T00:00:00Z'))&&new Date(x.day+'T00:00:00Z').toISOString().slice(0,10)===x.day);}
function remaining(s,now=Date.now()){const x=s.simple.concertCoins,today=day(now);if(!valid(x)||!today||x.day&&today<x.day)return 0;return limit-(today===x.day?x.count:0);}
function claim(s,now=Date.now()){if(!remaining(s,now)||!Number.isSafeInteger(s.simple.walletOffset)||s.simple.walletOffset>=1e12)return false;const x=s.simple.concertCoins,today=day(now);if(x.day!==today){x.day=today;x.count=0;}x.count++;s.simple.walletOffset++;return true;}
module.exports={limit,fresh,valid,remaining,claim};
