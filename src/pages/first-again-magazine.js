const titles = [
 '표지 · 세 사람이 다시 부른 노래들', '두 장의 재킷 사이', '우리의 재생 목록', '두 번째 곡이 달랐다',
 '두 편의 Stay', '여섯 번의 Stay', '마이크 앞에 앉은 세 사람', '멤버들의 카메라에 담긴 4집',
 'THE FAN · 8월의 서울에서 10월의 인천까지', '4집 수록곡의 공연지별 재생 변화',
 '전체 앨범 수록곡의 공연지별 재생 변화', '마지막 공연 뒤의 일주일', '이 호에 담은 기록'
];
const path = '/archive/magazine/first-again/';
module.exports = () => `<article class="mag-reader">
 <header><a href="/archive/">← 아카이브</a><h1>First, Again</h1><p>씨야 4집 활동 특집 · 총 ${titles.length}쪽</p>
 <nav aria-label="매거진 열람"><details><summary>목차</summary><ol>${titles.map((title,i)=>`<li><a href="${path}#page-${i+1}">${title}</a></li>`).join('')}</ol></details>
 <a href="/assets/magazine/first-again.pdf" download="씨야_4집_활동특집_First_Again_매거진.pdf">원본 PDF 내려받기</a></nav></header>
 ${titles.map((title,i)=>`<figure id="page-${i+1}"><img src="/assets/magazine/first-again/page-${String(i+1).padStart(2,'0')}.jpg" width="1225" height="1700" alt="${i+1}쪽 · ${title}" ${i?'loading="lazy"':'fetchpriority="high"'} decoding="async"><figcaption>${i+1} / ${titles.length} · ${title}</figcaption></figure>`).join('')}
 <footer><a href="/archive/">← 아카이브로 돌아가기</a></footer>
</article>`;
