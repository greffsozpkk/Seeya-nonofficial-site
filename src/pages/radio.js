const reviews=require('../data/radio-pilot.json');
const {resolveRadio,filterRadio,cards,selection,esc}=require('../shared/radio');
module.exports=function(archive,today){
 const rows=filterRadio(resolveRadio(archive,reviews,today)),first=rows[0];
 return `<section class="radio-page"><header class="radio-heading"><div class="eye">THE VOICES WE KEEP</div><h1>씨야 라디오</h1><p>일상 곁에 두고 듣는, 세 사람의 목소리</p><span class="radio-preview-label">공식 영상 ${rows.length}개 · 재생 테스트</span></header>
 <div class="radio-layout"><section class="radio-player-panel" aria-label="선택한 방송">
 <div class="radio-video" ${first?'':'hidden'}><iframe id="radioPlayer" ${first?`src="https://www.youtube.com/embed/${first.videoId}?rel=0&amp;enablejsapi=1&amp;playsinline=1"`:''} title="${esc(first?.title||'라디오 영상')}" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe></div>
 <div id="radioCurrent">${first?selection(first):'<h2>준비된 테스트 영상이 없습니다.</h2>'}</div>
 <div class="radio-transport"><label class="radio-sr" for="radioSeek">재생 위치</label><input id="radioSeek" type="range" min="0" max="0" value="0" step="1" disabled><div class="radio-times"><span id="radioElapsed">0:00</span><span id="radioDuration">--:--</span></div><div class="radio-main-controls"><button id="radioBack" class="radio-skip" type="button" aria-label="15초 뒤로" disabled>↶<small>15</small></button><button id="radioPlay" class="radio-play" type="button" aria-label="재생" disabled><span aria-hidden="true">▶</span></button><button id="radioForward" class="radio-skip" type="button" aria-label="15초 앞으로" disabled><small>15</small>↷</button></div>
 <div class="radio-options"><label><span class="radio-sr">재생 속도</span><select id="radioSpeed" aria-label="재생 속도" disabled><option value="1">1.0×</option></select></label><button id="radioSave" type="button" aria-pressed="false" ${first?'':'disabled'}>♡ 저장</button><button id="radioRestart" type="button" disabled>처음부터</button></div></div>
 <p id="radioSelectionStatus" class="radio-status" role="status">${first?'플레이어 연결 중 · 영상 안의 재생 버튼도 사용할 수 있어요.':''}</p>
 <div class="radio-source-links"><a id="radioOriginal" href="${first?'https://www.youtube.com/watch?v='+first.videoId:'https://www.youtube.com/'}" target="_blank" rel="noopener noreferrer">YouTube에서 열기 ↗</a><a id="radioArchive" href="${first?'/archive/?record='+encodeURIComponent(first.id):'/archive/'}">아카이브 기록 →</a></div>
 <p class="radio-device-note">화면을 잠그고 편하게 들어보세요.<br>기기와 브라우저에 따라 재생이 멈출 수 있어요.</p>
 </section><section class="radio-library" aria-label="방송 목록"><h2 class="radio-sr">방송 고르기</h2>
 <label class="radio-sr" for="radioSearch">방송·프로그램·출연 멤버 검색</label><div class="radio-search-wrap"><span aria-hidden="true">⌕</span><input id="radioSearch" type="search" placeholder="방송명, 출연 멤버 검색" autocomplete="off"></div>
 <div class="radio-members" role="group" aria-label="출연 멤버">${['전체','씨야','남규리','김연지','이보람'].map(m=>`<button type="button" data-radio-member="${m}" aria-pressed="${m==='전체'}">${m}</button>`).join('')}</div>
 <div class="radio-list-toolbar"><label class="radio-saved-filter"><input id="radioSavedOnly" type="checkbox"> 저장한 방송만</label><span id="radioCount" role="status">${rows.length}개 영상</span><select id="radioSort" aria-label="정렬"><option value="newest">최신순</option><option value="oldest">오래된순</option></select></div>
 <div id="radioList">${cards(rows,first?.id)}</div><p class="radio-filter-note">‘씨야’는 세 멤버가 함께한 기록을 모읍니다.</p><noscript><p>검색과 방송 전환에는 JavaScript가 필요합니다. 영상의 기본 조작 버튼은 그대로 사용할 수 있습니다.</p></noscript>
 </section></div>
 <div class="radio-bottom" aria-label="현재 방송 요약"><span class="radio-bottom-icon" aria-hidden="true">ıllı</span><div><strong id="radioBottomTitle">${esc(first?.title||'씨야 라디오')}</strong><span id="radioBottomStatus">한 편씩, 천천히</span></div><button id="radioToPlayer" type="button">플레이어로 ↑</button></div>
 <details class="radio-test"><summary>재생 안내 · 휴대전화 테스트</summary><p>삼성 인터넷에서 잠글 때 멈춘다면 설정 → 유용한 기능 → 백그라운드 재생을 확인해 주세요. 이번 디자인은 YouTube 기본 플레이어를 유지하고 별도 버튼을 연결했습니다. 잠금 후 재개와 10~20분 청취는 설치 앱과 일반 브라우저에서 다시 비교해 주세요.</p><p>검색·필터·정렬은 재생을 중단하지 않습니다. 다른 방송을 선택하면 앞 방송이 멈추고 새 방송이 준비됩니다. 페이지를 이동하면 재생이 끝납니다.</p><p>최근 재생 위치와 저장한 방송은 이 브라우저에만 남습니다. 영상 파일은 저장하지 않습니다. 재생이 안 되거나 삽입이 제한되면 위의 ‘YouTube에서 열기’를 이용해 주세요.</p><p>전체본·방송 다시보기·클립은 구분해 표시합니다. 공식 채널 확인은 재생 가능 여부나 이용 권한을 보증하지 않습니다.</p><a href="/">메인 뮤비와 비교하기 →</a></details>
 <script type="application/json" id="radioData">${JSON.stringify(rows).replace(/</g,'\\u003c')}</script></section>`;
};
