const {W,esc}=require('../shared/common');
module.exports=(route,archive,diary)=>{
 const data=require('../shared/live-data').catalog(archive,diary);
 return W(`<section class="lv" id="liveAtlas">
 <div class="lv-topline"><a href="/music/">MUSIC</a>${route.unlisted?'<span>LOCAL PREVIEW</span>':''}</div>
 ${require('../shared/music-nav')('live')}
 <header class="lv-hero"><div><p class="lv-kicker">THE SONGS WE SHARED</p><h1>씨야 라이브 도감</h1><p class="lv-lead">같은 노래, 다른 날의 기억.<br>우리의 무대를 한눈에 펼쳐보세요.</p></div><div class="lv-tour-art"><div class="lv-tour-title"><img src="/images/music/the-fan-title-transparent.png" alt="씨야 20주년 전국 투어 콘서트 THE FAN" width="2172" height="724"></div><p class="lv-tour-caption">2026 · SEOUL · BUSAN · DAEGU · GOYANG<br>CHEONGJU · SUWON · INCHEON</p></div></header>
 <div class="lv-overview"><div><span>살펴볼 투어</span><strong>2026 THE FAN</strong></div><div><strong>${data.sessions.length}<small> 회차</small></strong><span>서울 양일 별도 기록</span></div><div><strong>${data.songs.length}<small> 곡</small></strong><span>이번 도감의 조사 범위</span></div></div>
 <nav class="lv-tabs" aria-label="도감 보기 방식"><button data-view="session">회차별 곡 보기</button><button data-view="compare">두 공연 비교</button><button data-view="table">전체 표 보기</button></nav>
 <div id="lvSessions" class="lv-sessions" aria-label="공연 회차"></div>
 <div id="lvCompare" class="lv-compare-controls" hidden><label>첫 번째 공연<select id="lvFirst"></select></label><span aria-hidden="true">↔</span><label>두 번째 공연<select id="lvSecond"></select></label></div>
 <section id="lvSessionInfo" class="lv-session-info"></section>
 <form class="lv-tools" role="search"><label class="lv-search">곡 찾기<input id="lvSearch" type="search" placeholder="곡 제목을 입력하세요" autocomplete="off"></label><label>앨범<select id="lvAlbum"><option value="all">모든 앨범</option>${[...new Set(data.songs.map(s=>s.album))].map(a=>`<option>${esc(a)}</option>`).join('')}</select></label><label id="lvGroupLabel" hidden>비교 결과<select id="lvGroup"><option value="all">모든 곡</option><option value="both">두 공연 모두 확인</option><option value="first">첫 공연에서만 확인</option><option value="second">두 번째 공연에서만 확인</option><option value="unknown">두 공연 모두 확인 중</option></select></label><button type="button" id="lvReset">초기화</button></form>
 <div class="lv-results-head"><p id="lvResult" role="status" aria-live="polite"></p><div class="lv-legend"><span><b>●</b> 무대 확인</span><span><b>◐</b> 짧은 영상·일부</span><span><b>—</b> 확인 중</span></div></div>
 <div id="lvContent"></div><nav id="lvPages" class="lv-pages" aria-label="곡 목록 페이지"></nav>
 <div class="lv-note" role="note"><strong>빈칸은 ‘부르지 않았다’는 뜻이 아니에요.</strong><p>자료로 확인한 회차만 집계합니다. 같은 날의 여러 영상은 1회로 세며, ‘한 공연에서만 확인’은 다른 공연의 미공연을 뜻하지 않습니다.</p><details><summary>이번 도감의 자료 범위</summary><p>${esc(data.scopeNote)}</p><p>연결된 영상은 전체 곡 또는 일부 무대일 수 있습니다. 짧은 영상·일부로 확인된 자료는 별도 표시하며, 전체 셋리스트가 확인되지 않은 회차에는 미공연 표시를 하지 않습니다.</p><p>자료 확인일 ${esc(data.checkedAt)} · <a href="/archive/concerts/the-fan-2026/">콘서트 기록관에서 전체 자료 보기 →</a></p></details></div>
 <dialog id="lvDialog" class="lv-dialog" aria-labelledby="lvDetailTitle"><button id="lvClose" class="lv-close" aria-label="상세 닫기">×</button><div id="lvDetail"></div></dialog>
 <noscript>공연 비교와 근거 자료를 보려면 JavaScript를 켜주세요. <a href="/archive/concerts/the-fan-2026/">콘서트 기록관으로 이동</a></noscript>
 </section><script id="liveAtlasData" type="application/json">${JSON.stringify(data).replace(/</g,'\\u003c')}</script>`);
};
