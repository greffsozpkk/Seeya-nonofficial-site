'use strict';
function create(config,{fetch:request=(...args)=>window.fetch(...args),storage=localStorage,uuid=()=>crypto.randomUUID(),now=()=>Date.now()}={}){
 const environment=config?.environment||'test',endpoint=config?.endpoint||'',enabled=/^https:\/\/script\.google\.com\/macros\/s\/[\w-]+\/exec$/.test(endpoint);
 const key='seeya-worldcup-'+environment+'-outbox-v1';let inflight=new Map();
 function read(){try{const a=JSON.parse(storage.getItem(key)||'[]');return Array.isArray(a)?a:[];}catch{return [];}}
 function write(rows){storage.setItem(key,JSON.stringify(rows));}
 function client(){const k='seeya-worldcup-anonymous-v1';let value=storage.getItem(k);if(!/^[\w-]{8,100}$/.test(value||'')){value=uuid();storage.setItem(k,value);}return value;}
 async function call(q){if(!enabled)throw Object.assign(Error('전체 통계 연결을 준비 중이에요.'),{code:'UNCONFIGURED'});const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),Math.min(config.timeoutMs||15000,20000));
  try{const response=await request(endpoint,{method:'POST',credentials:'omit',redirect:'follow',headers:{'Content-Type':'text/plain;charset=UTF-8'},body:JSON.stringify({...q,environment}),signal:controller.signal});if(!response.ok||response.type==='opaque')throw Error('서버 응답을 확인하지 못했어요.');const d=await response.json();if(!d.ok)throw Object.assign(Error(d.message||'통계 요청을 처리하지 못했어요.'),{code:d.code||'SERVER'});if(d.environment!==environment)throw Object.assign(Error('테스트·운영 연결 설정이 서로 달라요.'),{code:'ENVIRONMENT'});return d;
  }catch(e){if(e.name==='AbortError')throw Object.assign(Error('응답이 늦어 결과 확인을 기다리고 있어요.'),{code:'NETWORK'});throw e;}finally{clearTimeout(timer);}
 }
 function scope(c,size){return {collection:c.id,version:c.version,size};}
 async function start(c,size,requestId){return call({action:'start',...scope(c,size),client:client(),requestId});}
 function queue(c,game,winner){if(!game.remote||game.remote.environment!==environment)return null;const id=game.id,all=read(),old=all.find(r=>r.id===id);if(old)return old;if(all.filter(r=>!['saved','excluded','expired','rejected'].includes(r.status)).length>=20)throw Error('등록 대기 결과가 20개예요. 먼저 대기 결과를 다시 등록해 주세요.');
  const row={id,...scope(c,game.full?'all':game.size),token:game.remote.token,picks:game.picks,winner,expires:game.remote.expires,status:'pending',attempts:0,nextTry:0};write([...all.filter(r=>!['saved','excluded','expired','rejected'].includes(r.status)).slice(-19),...all.filter(r=>['saved','excluded','expired','rejected'].includes(r.status)).slice(-80),row]);return row;
 }
 function update(id,patch){const all=read(),r=all.find(r=>r.id===id);if(r){Object.assign(r,patch);write(all);}return r;}
 function get(id){return read().find(r=>r.id===id);}
 async function submit(id,manual=false){if(inflight.has(id))return inflight.get(id);const row=get(id);if(!row||['saved','excluded','expired','rejected'].includes(row.status))return row;if(!manual&&(row.attempts>=3||row.nextTry>now()))return row;
  // Even after local expiry one explicit retry may recover a receipt saved before a lost response.
  const task=(async()=>{update(id,{status:'sending',attempts:row.attempts+1,nextTry:now()+Math.min(60000*2**row.attempts,900000)});try{const d=await call({action:'finish',...row});if(d.id!==row.id||d.winner!==row.winner||typeof d.already!=='boolean'||typeof d.excluded!=='boolean'||!Number.isFinite(Date.parse(d.acceptedAt)))throw Error('저장 확인 응답이 올바르지 않아 다시 확인해야 해요.');return update(id,{status:d.excluded?'excluded':'saved',already:d.already,acceptedAt:d.acceptedAt,message:''});}catch(e){const terminal=['EXPIRED','TOKEN','PATH','CONFLICT','INCOMPLETE','VERSION','ENVIRONMENT','SESSION'].includes(e.code);return update(id,{status:terminal?(e.code==='EXPIRED'?'expired':'rejected'):'pending',message:e.message});}})();inflight.set(id,task);try{return await task;}finally{inflight.delete(id);}
 }
 return {enabled,environment,call,start,queue,get,submit,pending:()=>read().filter(r=>!['saved','excluded','expired','rejected'].includes(r.status)),ranks:(c,size)=>call({action:'ranks',...scope(c,size)})};
}
module.exports={create};
