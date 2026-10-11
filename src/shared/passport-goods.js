'use strict';
function clean(value={}){
 if(!value||typeof value!=='object'||Array.isArray(value))throw Error('굿즈 정보를 확인해 주세요.');
 const str=(v,max)=>{if(typeof v!=='string'||v.length>max)throw Error('굿즈 정보의 글자 수를 확인해 주세요.');return v.trim();};
 const quantity=value.quantity??1,amount=value.amount??null;
 if(!Number.isInteger(quantity)||quantity<1||quantity>999)throw Error('수량은 1~999개의 정수로 입력해 주세요.');
 if(amount!==null&&(!Number.isInteger(amount)||amount<0||amount>999999999))throw Error('결제금액은 0~999,999,999원의 정수로 입력해 주세요.');
 return {catalogId:str(value.catalogId||'',80),quantity,amount,shop:str(value.shop||'',160),variant:str(value.variant||'',100)};
}
function same(a,b){
 const x=a.goods||{},y=b.goods||{};
 return (x.catalogId&&y.catalogId?x.catalogId===y.catalogId:a.title===b.title)&&(x.variant||'')===(y.variant||'')&&(x.shop||'')===(y.shop||'');
}
function totals(entries,day=new Intl.DateTimeFormat('sv-SE',{timeZone:'Asia/Seoul'}).format(new Date())){const rows=entries.filter(e=>e.kind==='goods'&&e.status==='done'&&(!e.date||e.date<=day.slice(0,e.date.length)));return {records:rows.length,quantity:rows.reduce((n,e)=>n+(e.goods?.quantity||1),0)};}
function eventValues(event){return {eventId:event.id,placeId:event.placeId||'',archiveId:event.archiveId||'',snapshot:{title:event.title,place:event.venue||'',address:''}};}
module.exports={clean,same,totals,eventValues};
