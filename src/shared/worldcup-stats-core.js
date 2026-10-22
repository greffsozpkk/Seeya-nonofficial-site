'use strict';
const G=require('./worldcup');
function fail(code,message){const e=new Error(message);e.code=code;throw e;}
function createService(catalog,repo,env){
 const validId=s=>typeof s==='string'&&/^[a-zA-Z0-9_-]{8,100}$/.test(s);
 function scope(q){if(q.environment!==env.environment)fail('ENVIRONMENT','테스트와 운영 통계는 함께 사용할 수 없어요.');const c=catalog.find(c=>c.id===q.collection&&c.version===q.version);if(!c||!c.rounds.includes(q.size))fail('VERSION','후보 구성이나 라운드가 변경됐어요. 페이지를 새로 열어 주세요.');return c;}
 function start(q){const c=scope(q);if(c.active===false)fail('VERSION','목록이 갱신됐어요. 페이지를 새로 열어 주세요.');if(!validId(q.client)||!validId(q.requestId))fail('INPUT','게임 시작 정보를 확인해 주세요.');if(repo.paused(c.id))fail('PAUSED','현재 이 월드컵의 전체 통계 집계가 잠시 중지되어 있어요.');
  const client=env.hash(q.client),now=env.now(),old=repo.request(client,q.requestId);
  if(old){if(old.collection!==c.id||old.version!==c.version||old.size!==q.size)fail('CONFLICT','같은 시작 요청의 조건이 달라요.');if(old.expires<=now)fail('EXPIRED','시작 요청이 만료됐어요. 새 게임을 시작해 주세요.');return issued(old);}
  const limits=repo.usage(client,now);if(limits.hour>=10||limits.day>=60||limits.globalDay>=1000)fail('RATE_LIMIT','게임 시작 요청이 많아요. 잠시 후 다시 시도하거나 통계 없이 플레이해 주세요.');
  const id=env.uuid(),ids=c.candidates.map(x=>x.id),game=q.size==='all'?G.createAll(ids,c.version,id,env.random):G.create(ids,q.size,c.version,id,env.random);
  const session={id,client,requestId:q.requestId,collection:c.id,version:c.version,size:q.size,game,issued:now,expires:now+24*60*60*1000};repo.addSession(session);return issued(session);
 }
 function issued(s){return {ok:true,environment:env.environment,game:s.game,token:env.sign(s.id),expires:s.expires,policy:'completed-game'};}
 function finish(q){scope(q);if(!validId(q.id)||typeof q.token!=='string'||!env.verify(q.id,q.token))fail('TOKEN','게임 확인 정보가 올바르지 않아요.');
  const old=repo.result(q.id);if(old){if(old.collection!==q.collection||old.version!==q.version||old.size!==q.size||old.winner!==q.winner)fail('CONFLICT','이미 처리한 결과와 다른 요청이에요.');return receipt(old,true);}
  const s=repo.session(q.id);if(!s)fail('SESSION','게임 발급 기록을 찾지 못했어요.');if(s.collection!==q.collection||s.version!==q.version||s.size!==q.size)fail('CONFLICT','게임 종류가 일치하지 않아요.');if(s.expires<=env.now())fail('EXPIRED','통계 등록 기한이 지났어요. 결과는 이 기기에 남습니다.');if(repo.paused(s.collection))fail('PAUSED','통계 집계가 잠시 중지되어 있어요. 나중에 다시 시도해 주세요.');
  const c=catalog.find(c=>c.id===s.collection&&c.version===s.version);if(!Array.isArray(q.picks)||q.picks.length>127||!q.picks.every(x=>typeof x==='string'&&x.length<100))fail('PATH','선택 기록 형식이 올바르지 않아요.');
  let state;try{state=G.replay({...s.game,picks:q.picks},c.candidates.map(x=>x.id),c.version);}catch{fail('PATH','발급된 대진과 선택 기록이 일치하지 않아요.');}
  if(!state.winner||state.winner!==q.winner)fail('INCOMPLETE','결승까지 완료한 게임만 등록할 수 있어요.');
  const row={id:s.id,collection:s.collection,version:s.version,size:s.size,winner:state.winner,at:new Date(env.now()).toISOString(),excluded:false,reason:''};
  repo.addResult(row); // Append ledger first. A lost response is recovered by the lookup above.
  return receipt(row,false);
 }
 function receipt(row,already){return {ok:true,environment:env.environment,id:row.id,winner:row.winner,already,excluded:row.excluded,acceptedAt:row.at};}
 function ranks(q){const c=scope(q),ids=c.candidates.map(x=>x.id),seen=new Set();const all=repo.results().filter(r=>{if(seen.has(r.id)||r.excluded||r.collection!==c.id||r.version!==c.version||r.size!==q.size||!ids.includes(r.winner))return false;seen.add(r.id);return true;});const ranked=G.ranking(all,q.size,c.version);const counts=new Map(ranked.rows.map(x=>[x.id,x]));let prev=-1,rank=0;
  const rows=ids.map(id=>counts.get(id)||{id,wins:0,percent:0}).sort((a,b)=>b.wins-a.wins||a.id.localeCompare(b.id)).map((r,i)=>{if(r.wins!==prev)rank=i+1;prev=r.wins;return {...r,rank};});
  return {ok:true,environment:env.environment,collection:c.id,version:c.version,size:q.size,total:all.length,rows,updatedAt:new Date(env.now()).toISOString(),policy:'completed-game'};
 }
 function handle(q){if(!q||typeof q!=='object'||JSON.stringify(q).length>20000)fail('INPUT','요청 크기를 확인해 주세요.');if(q.action==='start')return start(q);if(q.action==='finish')return finish(q);if(q.action==='ranks')return ranks(q);if(q.action==='health')return {ok:true,environment:env.environment,policy:'completed-game',collections:catalog.filter(c=>c.active!==false).map(c=>({id:c.id,version:c.version,rounds:c.rounds}))};fail('ACTION','지원하지 않는 요청입니다.');}
 return {handle};
}
module.exports={createService};
