'use strict';
const P=require('./passport'),Play=require('./passport-play');
const PREF='seeya-passport-play-auto-v1';
const enabled=adapter=>adapter.getItem(PREF)==='true';
const preference=(adapter,value)=>adapter.setItem(PREF,value?'true':'false');
function result(id,details,at=new Date()){
 const play=Play.clean({...details,source:'result'}),date=new Intl.DateTimeFormat('sv-SE',{timeZone:'Asia/Seoul'}).format(at),time=new Intl.DateTimeFormat('en-GB',{timeZone:'Asia/Seoul',hour:'2-digit',minute:'2-digit'}).format(at);
 return P.entry({entryId:'play-'+id,kind:'play',status:'done',title:Play.GAMES[play.game]+(play.level?' · '+play.level:''),date,time,members:['seeya'],play,snapshot:{},createdAt:at.toISOString(),updatedAt:at.toISOString()});
}
// Read the newest notebook on each save. A result ID belongs to one completed run.
function save(adapter,record){
 const checked=P.entry(record),store=P.storage(adapter),state=store.get();
 if(state.entries.some(e=>e.entryId===checked.entryId))return {id:checked.entryId,already:true};
 store.save({...state,entries:[...state.entries,checked]});return {id:checked.entryId,already:false};
}
module.exports={PREF,enabled,preference,result,save};
