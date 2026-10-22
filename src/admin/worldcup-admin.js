'use strict';
const {esc:E}=require('../shared/common');
function create({host,config,canAccess}){
 const stats=require('../client/worldcup-stats').create(config);let generation=0,catalog=[],scopes=[],current=null,rank=null,page=1,stamp='';
 const allowed=()=>canAccess()&&!host.hidden;
 const mode=n=>n==='all'?'전체 참가':n+'강';
 function find(s){return catalog.find(c=>c.id===s.collection&&c.version===s.version);}
 function frame(){
  const total=scopes.reduce((sum,s)=>sum+s.total,0),active=scopes.filter(s=>find(s)?.active!==false).reduce((sum,s)=>sum+s.total,0);
  host.innerHTML=`<h2>월드컵 전체 통계</h2><p>완료한 게임 기준입니다. 이용자 수가 아니며, 이전 후보 구성의 기록도 함께 조회합니다.</p><p class="muted">${E(config.environment==='test'?'연결 환경: 검증용':'연결 환경: 운영용')} · ${E(stamp)}</p><div class="actions"><button data-wc-refresh>최신 통계 불러오기</button></div><div class="summary"><p>전체 완료 게임 <strong>${total}판</strong></p><p>현재 후보 구성 <strong>${active}판</strong></p><p>이전 후보 구성 <strong>${total-active}판</strong></p></div><div class="wc-admin-table"><table><thead><tr><th>종류</th><th>구성</th><th>라운드</th><th>완료 게임</th><th>최다 우승 후보</th><th></th></tr></thead><tbody>${scopes.map((s,i)=>{const c=find(s),leader=c?.candidates.find(r=>r.id===s.leader?.id);return `<tr><td>${E(c?.title||s.collection)}</td><td>${c?.active===false?'이전':'현재'}</td><td>${mode(s.size)}</td><td>${s.total}판</td><td>${s.total?E(leader?.title||s.leader?.id)+' · '+s.leader.wins+'회':'—'}</td><td><button data-wc-scope="${i}">순위 보기</button></td></tr>`;}).join('')}</tbody></table></div><div data-wc-detail aria-live="polite"></div>`;
 }
 async function load(){if(!allowed())return;const ticket=++generation;host.innerHTML='<h2>월드컵 전체 통계</h2><p role="status">통계를 불러오는 중…</p>';try{
  const c=await stats.call({action:'catalog'});const d=await stats.call({action:'overview'});if(ticket!==generation||!allowed())return;
  if(!Array.isArray(c.collections)||!Array.isArray(d.scopes)||d.scopes.some(s=>!Number.isInteger(s.total)||s.total<0))throw Error('통계 응답을 확인해 주세요.');
  catalog=c.collections;scopes=d.scopes;stamp=new Date(d.updatedAt).toLocaleString('ko-KR',{timeZone:'Asia/Seoul'});rank=null;current=null;frame();
 }catch(e){if(ticket===generation&&allowed())host.innerHTML=`<h2>월드컵 전체 통계</h2><p role="status">${E(e.message)}</p><p>처음 도입할 때는 사이트 배포 후 구글 코드를 최신 버전으로 한 번 교체해야 합니다.</p><button data-wc-refresh>다시 불러오기</button>`;}}
 function detail(){const box=host.querySelector('[data-wc-detail]');if(!box||!rank||!current)return;const c=find(current),pages=Math.max(1,Math.ceil(rank.rows.length/20));page=Math.min(Math.max(1,page),pages);
  box.innerHTML=`<h3 tabindex="-1">${E(c.title)} · ${mode(current.size)}</h3><p>${c.active===false?'이전 후보 구성':'현재 후보 구성'} · ${rank.total}판 집계</p><div class="wc-admin-table"><table><thead><tr><th>순위</th><th>후보</th><th>우승 횟수</th><th>우승 비율</th></tr></thead><tbody>${rank.rows.slice((page-1)*20,page*20).map(r=>`<tr><td>${r.wins?r.rank:'—'}</td><td>${E(c.candidates.find(x=>x.id===r.id)?.title||r.id)}</td><td>${r.wins}회</td><td>${r.percent.toFixed(1)}%</td></tr>`).join('')}</tbody></table></div><div class="actions"><button data-wc-page="${page-1}" ${page===1?'disabled':''}>이전</button><span>${page} / ${pages}</span><button data-wc-page="${page+1}" ${page===pages?'disabled':''}>다음</button><button data-wc-csv>이 순위 CSV 저장</button></div>`;
 }
 host.addEventListener('click',async e=>{if(!allowed())return;const b=e.target.closest('button');if(!b)return;if(b.hasAttribute('data-wc-refresh'))return load();
  if(b.hasAttribute('data-wc-scope')){const s=scopes[Number(b.dataset.wcScope)];if(!s)return;const ticket=++generation;current=s;page=1;host.querySelector('[data-wc-detail]').textContent='순위를 불러오는 중…';try{const r=await stats.ranks(find(s),s.size);if(ticket!==generation||!allowed())return;if(!Array.isArray(r.rows)||r.rows.some(x=>!Number.isFinite(x.percent)||!Number.isInteger(x.wins)))throw Error('잘못된 순위 응답');rank=r;detail();host.querySelector('[data-wc-detail] h3')?.focus();}catch(err){if(ticket===generation&&allowed())host.querySelector('[data-wc-detail]').textContent=err.message;}}
  else if(b.hasAttribute('data-wc-page')){page=Number(b.dataset.wcPage);detail();}
  else if(b.hasAttribute('data-wc-csv')&&rank){const c=find(current),cell=s=>'"'+String(s??'').replace(/^[=+@-]/,"'$&").replace(/"/g,'""')+'"';const rows=[['월드컵','라운드','순위','후보','우승 횟수','비율','구성'],...rank.rows.map(r=>[c.title,mode(current.size),r.rank,c.candidates.find(x=>x.id===r.id)?.title||r.id,r.wins,r.percent,c.version])];const u=URL.createObjectURL(new Blob(['\ufeff'+rows.map(r=>r.map(cell).join(',')).join('\r\n')],{type:'text/csv;charset=utf-8'})),a=document.createElement('a');a.href=u;a.download='seeya-worldcup-ranking.csv';a.click();setTimeout(()=>URL.revokeObjectURL(u),1000);}
 });
 return {load,clear(){generation++;catalog=[];scopes=[];rank=null;current=null;host.replaceChildren();}};
}
module.exports={create};
