'use strict';
(() => {
  const count = document.getElementById('today-visitors-count');
  if (!count) return;
  const status = document.getElementById('today-visitors-status');
  const dateInKorea = () => new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Seoul', year: 'numeric', month: '2-digit', day: '2-digit'
  }).format(new Date());
  async function refresh() {
    try {
      const response = await fetch('/data/visitors.json', {cache: 'no-store'});
      if (!response.ok) throw new Error('unavailable');
      const data = await response.json();
      if (data.date !== dateInKorea() || !Number.isSafeInteger(data.users) || data.users < 0 || !Number.isFinite(Date.parse(data.updatedAt))) throw new Error('pending');
      count.textContent = data.users.toLocaleString('ko-KR');
      status.textContent = '명';
      count.parentElement.title = `오늘 방문 사용자 · 한국 시간 기준 · ${new Date(data.updatedAt).toLocaleString('ko-KR', {timeZone:'Asia/Seoul'})} 집계 (GA 반영 지연 있음)`;
    } catch (_) {
      count.textContent = '—';
      status.textContent = '집계 준비 중';
      count.parentElement.removeAttribute('title');
    }
  }
  refresh();
  setInterval(refresh, 300000);
})();
