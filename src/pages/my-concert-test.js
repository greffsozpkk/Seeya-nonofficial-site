const {W}=require('../shared/common');
module.exports=()=>W(`<section class="mc" id="myConcert">
 <header class="mc-hero"><div><a class="mc-breadcrumb" href="/game/test/">SEEYA PLAY / MY CONCERT</a><div class="eye">A STAGE MADE BY YOU</div><h1>나만의 씨야 콘서트</h1><p>첫 곡이 흐르는 순간부터, 마지막 앙코르까지.<br>당신이 꿈꾸던 씨야의 무대를 만들어보세요.</p></div><div class="mc-ticket" aria-hidden="true"><span>ADMIT ONE</span><strong>SEEYA</strong><small>YOUR STAGE · YOUR STORY</small><i>01 — 12</i></div></header>
 <div class="mc-status" id="mcStatus" role="status" aria-live="polite">곡 목록을 불러오고 있어요.</div>
 <div id="mcLoadError" class="mc-notice" hidden><p>곡 목록을 불러오지 못했어요. 저장된 편집본은 그대로 보관됩니다.</p><button type="button" data-action="retry">다시 불러오기</button></div>
 <div id="mcRecovery" class="mc-notice" hidden><p id="mcRecoveryText"></p><button type="button" data-action="recover">새 편집 시작</button></div>
 <div id="mcSharedError" class="mc-notice" hidden><h2>공유 구성을 확인해 주세요</h2><p id="mcSharedErrorText"></p><button type="button" data-action="own">내 편집본 열기</button><button type="button" data-action="new">새 콘서트 만들기</button></div>
 <div id="mcEditor" hidden>
  <div class="mc-mobile-summary"><strong id="mcMobileTitle">우리, 다시 같은 무대에서</strong><span id="mcMobileCount">선택한 곡 0 / 12</span></div>
  <div class="mc-tabs" role="tablist" aria-label="콘서트 편집"><button type="button" role="tab" id="mcPickTab" aria-controls="mcPicker" aria-selected="true" data-tab="pick">노래 고르기</button><button type="button" role="tab" id="mcSetTab" aria-controls="mcSetlist" aria-selected="false" data-tab="set">세트리스트 <span id="mcTabCount">0</span></button></div>
  <div class="mc-columns" data-mobile-tab="pick">
   <section class="mc-panel mc-picker" id="mcPicker" aria-labelledby="mcPickTitle"><div class="mc-panel-head"><span class="mc-kicker">YOUR MUSIC</span><h2 id="mcPickTitle">어떤 노래를 들을까요?</h2></div>
    <label class="mc-search">곡 제목 검색<input id="mcSearch" type="search" placeholder="듣고 싶은 노래를 찾아보세요" autocomplete="off"></label>
    <div class="mc-artists" aria-label="아티스트 필터"><button type="button" data-artist="all" aria-pressed="true">전체</button><button type="button" data-artist="group" aria-pressed="false">씨야</button><button type="button" data-artist="gyuri" aria-pressed="false">남규리</button><button type="button" data-artist="yeonji" aria-pressed="false">김연지</button><button type="button" data-artist="boram" aria-pressed="false">이보람</button></div>
    <label class="mc-album-label">앨범<select id="mcAlbum"><option value="all">전체 앨범</option></select></label>
    <label class="mc-target">추가할 구간<select id="mcTarget"><option value="opening">OPENING · 오프닝</option><option value="main">MAIN STAGE · 본 무대</option><option value="encore">ENCORE · 앙코르</option></select></label>
    <div class="mc-library-meta"><span id="mcSongCount"></span><button type="button" data-action="clearFilters">필터 초기화</button></div>
    <div id="mcSongs" class="mc-songs"></div><div id="mcPaging" class="mc-paging" aria-label="곡 목록 페이지"></div>
    <button type="button" class="mc-mobile-only mc-primary" data-tab="set">세트리스트 보기 <span id="mcPickCount">0 / 12</span></button>
    <p class="mc-footnote">기존 카탈로그에서 확인된 발매곡입니다. 반주곡·미발매 커버는 제외했어요. 과거 씨야 명의 곡도 함께 담았습니다.</p>
   </section>
   <section class="mc-panel mc-setlist" id="mcSetlist" aria-labelledby="mcSetTitle"><div class="mc-panel-head"><span class="mc-kicker">YOUR SETLIST</span><h2 id="mcSetTitle">이 무대의 이름은</h2></div>
    <label>공연 제목 <span id="mcTitleCount">0 / 30</span><input id="mcTitle" aria-describedby="mcTitleError" autocomplete="off"></label><p class="mc-field-error" id="mcTitleError"></p>
    <label>기획자 이름 <small>선택</small><span id="mcPlannerCount">0 / 20</span><input id="mcPlanner" placeholder="팬 닉네임을 적어주세요" aria-describedby="mcPlannerError" autocomplete="off"></label><p class="mc-field-error" id="mcPlannerError"></p>
    <p class="mc-footnote">닉네임은 공유 링크와 포스터에 함께 담깁니다.</p>
    <div class="mc-progress-head"><span>선택한 곡</span><strong id="mcTotal">0 / 12</strong></div><progress id="mcProgress" max="12" value="0" aria-label="선택한 곡 수"></progress>
    <div id="mcSections"></div><div class="mc-undo" id="mcUndo" hidden><span>곡을 뺐어요.</span><button type="button" data-action="undo">되돌리기</button></div>
    <div class="mc-save-row"><span id="mcSaved">이 브라우저에서 이어 만들 수 있어요.</span><button type="button" data-action="reset">전체 초기화</button></div>
    <p id="mcCompleteError" class="mc-field-error" role="alert"></p><button type="button" class="mc-primary mc-complete" data-action="finish">콘서트 포스터 완성하기 <span aria-hidden="true">↗</span></button>
   </section>
  </div>
 </div>
 <section id="mcResult" class="mc-result" hidden aria-labelledby="mcResultTitle"><div class="mc-result-heading"><span class="mc-kicker">MY DREAM CONCERT</span><h2 id="mcResultTitle" tabindex="-1">당신의 무대가 완성됐어요</h2><p id="mcResultHint">첫 곡부터 앙코르까지, 좋아하는 마음을 한 장에 담았어요.</p></div>
  <div class="mc-themes" aria-label="포스터 테마"><button type="button" data-theme="rose" aria-pressed="true">로즈 티켓</button><button type="button" data-theme="night" aria-pressed="false">나이트 스테이지</button></div>
  <div class="mc-poster-wrap"><canvas id="mcPoster" width="1080" height="1350" role="img" aria-label="내 콘서트 포스터. 아래 텍스트 세트리스트에서도 내용을 읽을 수 있습니다."></canvas></div>
  <p id="mcPosterStatus" role="status"></p><div class="mc-result-actions"><button type="button" class="mc-primary" data-action="export">이미지 저장</button><button type="button" data-action="share">공유 링크 복사</button><button type="button" id="mcEditButton" data-action="edit">다시 편집하기</button></div>
  <div class="mc-copy" id="mcCopy" hidden><label>아래 링크를 선택해 직접 복사해 주세요.<input id="mcCopyLink" readonly></label></div>
  <details class="mc-readable"><summary>텍스트로 세트리스트 보기</summary><div id="mcTextList"></div></details>
  <p class="mc-footnote">팬이 만든 가상 콘서트입니다. 실제 공연 안내가 아닙니다.</p>
 </section>
 <dialog id="mcConfirm" class="mc-dialog"><h2>편집본을 바꿀까요?</h2><p id="mcConfirmMessage"></p><div class="mc-result-actions"><button type="button" data-action="cancelConfirm">취소</button><button type="button" class="mc-primary" data-action="confirm">확인</button></div></dialog>
 <dialog id="mcImageDialog" class="mc-dialog mc-image-dialog"><div class="mc-dialog-head"><h2>콘서트 포스터 저장</h2><button type="button" data-action="closeImage" aria-label="이미지 저장 창 닫기">닫기 ×</button></div><img id="mcExportImage" alt="저장할 콘서트 포스터"><p>1080 × 1350 PNG · 저장이 안 되면 이미지를 길게 눌러 저장해 주세요.</p><a id="mcDownload" class="mc-primary" download>PNG 내려받기</a><a id="mcOpenImage" target="_blank" rel="noopener">이미지 크게 열기 ↗</a></dialog>
 <noscript><p>콘서트를 만들려면 브라우저의 자바스크립트를 켜 주세요. 곡을 선택하거나 구성 정보를 서버에 전송하지 않습니다.</p></noscript>
</section>`);
