const format=value=>{if(!value)return '';const d=new Date(value);return Number.isNaN(d.getTime())?'':d.toLocaleString('ko-KR',{timeZone:'Asia/Seoul',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit'});};
function newsStatus(data,category){
 const checked=format(data.lastCheckedAt||data.updatedAt),changed=format(data.categoryContentUpdatedAt?.[category]);
 const status=data.categoryStatus?.[category]?.status;
 const hint={error:'검색 연결 실패 · 이전 기사 표시',partial:'일부 검색 연결 실패',empty:'검색된 새 기사 없음',unchanged:'추가 기사 없음'}[status]||'';
 return [checked&&'최근 확인 '+checked,changed&&'기사 반영 '+changed,hint].filter(Boolean).join(' · ');
}
module.exports={newsStatus};
