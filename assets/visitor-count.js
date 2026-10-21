'use strict';
(() => {
  const get = id => document.getElementById(id);
  const count = get('today-visitors-count');
  if (!count) return;
  const status = get('today-visitors-status');
  const koreaDay = time => new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Seoul', year: 'numeric', month: '2-digit', day: '2-digit'
  }).format(new Date(time));
  const dateOK = value => typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value) && Number.isFinite(Date.parse(value+'T00:00:00+09:00')) && koreaDay(value+'T00:00:00+09:00') === value;
  const usersOK = value => Number.isSafeInteger(value) && value >= 0;
  let last, busy = false;
  function validate(data) {
    const stamp = Date.parse(data.updatedAt);
    if (!dateOK(data.date) || !usersOK(data.users) || !Number.isFinite(stamp) || stamp > Date.now()+60000 || data.date > koreaDay(stamp)) throw Error('Invalid report');
    if (data.schemaVersion === 2) {
      if (data.metric !== 'totalUsers' || data.timeZone !== 'Asia/Seoul' || !Array.isArray(data.history) || data.history.length !== 8 || typeof data.limited !== 'boolean') throw Error('Invalid history');
      const expected = Array.from({length:8}, (_,i)=>koreaDay(Date.parse(data.date+'T12:00:00+09:00')-(7-i)*86400000));
      data.history.forEach((row,i)=>{if(row.date!==expected[i] || !usersOK(row.users))throw Error('Invalid day');});
      if (data.history[7].users !== data.users) throw Error('Inconsistent count');
    } else if (data.schemaVersion != null) throw Error('Unknown report version');
    return data;
  }
  function render(data, failed = false) {
    const now = Date.now(), today = koreaDay(now);
    const current = data && data.date === today;
    count.textContent = current ? data.users.toLocaleString('ko-KR') : '—';
    status.textContent = current ? '명' : '집계 대기';
    // Keep the compact Today display; report freshness is available on hover.
    let detail = '집계를 불러오지 못했어요. 잠시 후 다시 확인해 주세요.';
    if (data) {
      const stamp = new Date(data.updatedAt);
      const time = stamp.toLocaleString('ko-KR', {timeZone:'Asia/Seoul',month:'numeric',day:'numeric',hour:'2-digit',minute:'2-digit',hour12:false});
      const stale = now-stamp.getTime()>2*3600000 || !current;
      detail = `${failed?'연결 실패 · ':stale?'갱신 지연 · ':''}${time} 가져온 수치. Google 집계 지연으로 나중에 보정될 수 있습니다.${data.limited?' Google 집계 제한 있음.':''}`;
    }
    count.parentElement.setAttribute('title', detail);
  }
  async function refresh() {
    if (busy || document.visibilityState === 'hidden') return;
    busy=true;
    try {
      const response=await fetch('/data/visitors.json',{cache:'no-store'});
      if (!response.ok) throw Error('Unavailable');
      last=validate(await response.json());render(last);
    } catch (_) { render(last,true); }
    finally { busy=false; }
  }
  refresh();
  setInterval(refresh,300000);
  window.addEventListener('pageshow',refresh);
  document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible')refresh();});
})();
