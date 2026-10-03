'use strict';
const reviews=require('../data/radio-podcasts.json');
const {resolvePodcasts,current,frame}=require('../shared/radio-podcasts');
const {esc}=require('../shared/radio');
module.exports=function(archive,today){
 const rows=resolvePodcasts(archive,reviews,today),first=rows[0];
 return `<section class="radio-page podcast-page"><header class="radio-heading"><div class="eye">THE VOICES WE KEEP</div><h1>팟캐스트로 듣는 씨야</h1><p>남규리와 함께한 정오의 희망곡.<br>공식 플레이어로 편하게 들어보세요.</p><span class="radio-preview-label">재생 테스트 · ${rows.length}개 회차</span><p class="podcast-back"><a href="/radio/">← 라디오 영상 목록</a></p></header>
 <div class="radio-layout"><section class="radio-player-panel podcast-panel" aria-label="선택한 팟캐스트">
 <div id="podcastCurrent">${first?current(first):'<h2>준비된 팟캐스트가 없습니다.</h2>'}</div><div id="podcastFrame">${first?frame(first):''}</div>
 <p id="podcastStatus" class="radio-status" role="status">${first?'플레이어 안의 재생 버튼을 눌러주세요.':''}</p>
 <div class="radio-source-links">${first?`<a id="podcastOriginal" href="${esc(first.url)}" target="_blank" rel="noopener noreferrer">Apple Podcasts에서 열기 ↗</a><a id="podcastArchive" href="/archive/?record=${encodeURIComponent(first.id)}">아카이브 기록 →</a><button id="podcastReload" type="button">플레이어 다시 불러오기</button>`:''}</div>
 <p class="radio-device-note">화면을 잠근 뒤에도 재생되는지 확인해 주세요.<br>멈춘다면 잠금 화면의 재생 버튼으로 이어 들어보세요.</p></section>
 <section class="radio-library" aria-label="팟캐스트 방송 목록"><h2>방송 고르기</h2><div id="podcastList">${rows.map(r=>`<article class="radio-item ${r.id===first.id?'is-selected':''}"><div class="radio-wave" aria-hidden="true">◖◗</div><div><h3>${esc(r.title)}</h3><p>${esc(r.date)} · ${esc(r.members.join(' · '))}</p><p>${esc(r.program)}</p><div class="radio-item-meta">${esc(r.publisher)} · 공식 팟캐스트</div><noscript><a href="${esc(r.url)}">공식 회차 듣기</a></noscript></div><button type="button" data-podcast-id="${esc(r.id)}" aria-pressed="${r.id===first.id}" aria-label="${esc(r.date)} 방송 선택">${r.id===first.id?'선택됨':'선택'}</button></article>`).join('')}</div></section></div>
 <details class="radio-test"><summary>재생 테스트 안내</summary><p>방송을 고른 뒤 Apple Podcasts 플레이어의 재생 버튼을 눌러주세요. 다른 방송을 고르면 앞 방송은 멈춥니다. 팟캐스트의 자동 다음 회차 재생은 아직 지원하지 않습니다.</p><p>휴대폰 홈 화면에 설치한 팬페이지에서 화면 잠금 → 잠금 화면 재생 버튼 → 10~20분 청취 → 다른 앱 사용 후 돌아오기를 확인해 주세요. 일반 브라우저에서도 같은 순서로 비교할 수 있습니다. 기기별 백그라운드 재생 동작은 다를 수 있습니다.</p><p>플레이어가 표시되지 않거나 재생되지 않으면 ‘다시 불러오기’ 또는 ‘Apple Podcasts에서 열기’를 이용해 주세요. 오디오는 공식 제공처에서 재생하며, 팬페이지에 파일을 저장하지 않습니다.</p></details>
 <script type="application/json" id="podcastData">${JSON.stringify(rows).replace(/</g,'\\u003c')}</script></section>`;
};
