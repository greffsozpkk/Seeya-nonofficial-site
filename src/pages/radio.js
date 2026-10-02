'use strict';
const reviews=require('../data/radio-pilot.json');
const {resolveRadio,filterRadio,cards,selection,esc}=require('../shared/radio');
module.exports=function(archive,today){
 const rows=filterRadio(resolveRadio(archive,reviews,today)),first=rows[0];
 return `<section class="radio-page"><div class="eye">SEEYA RADIO · PREVIEW</div><h1>라디오 모아듣기</h1><p class="radio-intro">목소리와 함께 머무는 시간.<br>공식 라디오 영상 3개로 먼저 만나보세요.</p>
 <div class="radio-layout"><section class="radio-player-panel" aria-label="선택한 방송">
 <div id="radioCurrent">${first?selection(first):'<h2>준비된 테스트 영상이 없습니다.</h2>'}</div>
 <div class="radio-video" ${first?'':'hidden'}><iframe id="radioPlayer" ${first?`src="https://www.youtube.com/embed/${first.videoId}?rel=0"`:''} title="${esc(first?.title||'라디오 영상')}" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe></div>
 <p class="radio-help">영상 안의 ▶ 버튼을 눌러 재생하세요.<br>재생이 안 되거나 삽입이 제한되면 ‘YouTube에서 열기’를 이용해 주세요.</p><p id="radioSelectionStatus" class="radio-status" role="status">${first?'방송을 선택했습니다. 재생 버튼을 눌러주세요.':''}</p>
 <details class="radio-test"><summary>휴대전화에서 확인해 주세요</summary><ol><li>설치한 팬페이지와 일반 브라우저에서 각각 영상을 재생해 주세요.</li><li>화면을 잠근 뒤 재생이 멈추는지, 잠금 화면의 재생 버튼으로 다시 들을 수 있는지 확인해 주세요.</li><li>재개한 뒤 10~20분 동안 듣고, 다른 앱을 사용한 후 돌아와 상태를 확인해 주세요.</li><li>검색·멤버 필터·정렬을 바꿀 때 소리가 끊기지 않는지 확인해 주세요.</li><li>다른 방송을 선택하면 앞 영상의 소리가 멈추고 새 영상만 재생되는지 확인해 주세요.</li></ol><p>잠금 후 재개는 기기·브라우저에 따라 다를 수 있으며, 실제 휴대전화 검증 전입니다. 페이지를 이동하면 재생이 끝납니다.</p><a href="/">메인 뮤비와 비교하기 →</a></details>
 </section><section class="radio-library" aria-label="방송 목록"><h2>방송 고르기</h2>
 <label for="radioSearch">방송·프로그램 검색</label><input id="radioSearch" type="search" placeholder="제목 또는 프로그램명" autocomplete="off">
 <div class="radio-members" role="group" aria-label="출연 멤버">${['전체','씨야','남규리','김연지','이보람'].map(m=>`<button type="button" data-radio-member="${m}" aria-pressed="${m==='전체'}">${m}</button>`).join('')}</div>
 <p class="radio-filter-note">씨야 필터는 세 멤버가 함께한 기록입니다.</p><div class="radio-list-toolbar"><span id="radioCount" role="status">${rows.length}개 영상</span><label>정렬 <select id="radioSort"><option value="newest">최신순</option><option value="oldest">오래된순</option></select></label></div>
 <div id="radioList">${cards(rows,first?.id)}</div><noscript><p>방송 전환과 검색에는 JavaScript가 필요합니다. 아카이브 기록에서 원본 링크를 열 수 있습니다.</p></noscript>
 </section></div><p class="radio-footnote">공식 채널 출처를 확인한 테스트 영상입니다. 전체 방송과 클립은 구분해 표시하며, 재생 가능 여부는 YouTube와 기기 환경에 따라 달라질 수 있습니다.</p>
 <script type="application/json" id="radioData">${JSON.stringify(rows).replace(/</g,'\\u003c')}</script></section>`;
};
