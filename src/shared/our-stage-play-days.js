'use strict';
// Separate from the optional daily coin claim. Older saves retain verified attendance.
const state=s=>s.playDays===undefined?s.daily:s.playDays;
const count=s=>state(s)?.count||0;
function valid(s){
 if(s.playDays===undefined)return true;
 const p=s.playDays;if(!p||Array.isArray(p)||!Number.isInteger(p.count)||p.count<0||p.count>1000000)return false;
 if(p.count===0)return p.lastDay===null;
 return typeof p.lastDay==='string'&&/^\d{4}-\d{2}-\d{2}$/.test(p.lastDay)&&Number.isFinite(Date.parse(p.lastDay+'T00:00:00Z'))&&new Date(p.lastDay+'T00:00:00Z').toISOString().slice(0,10)===p.lastDay;
}
function record(s,day){
 if(!day||!valid(s))return false;
 const p=state(s);if(!p||p.count>=1000000||p.lastDay&&day<=p.lastDay)return false;
 s.playDays={count:p.count+1,lastDay:day};return true;
}
module.exports={count,valid,record};
