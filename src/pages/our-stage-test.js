const {W}=require('../shared/common');
module.exports=()=>W(`<section id="ourStage" class="os-game">
<a class="game-back" href="/game/test/">← SEEYA PLAY</a>
<header class="os-heading"><div><div class="eye">SEEYA · OUR STAGE</div><h1>씨야 키우기</h1><p>작은 연습이 모여, 우리의 무대가 됩니다.</p></div><button data-action="storage" class="quiet">저장 관리</button></header>
<p class="test-timing">테스트 속도 · 연습, 포인트 회복, 곡별 공연 연출은 모두 1초입니다.</p>
<section id="saveAlert" role="alert" hidden></section>
<div class="os-chapter"><span>CHAPTER 01</span><strong>The First Mind</strong><small>첫 번째 앨범, 열두 개의 기억</small></div>
<nav id="tabs" aria-label="씨야 키우기 메뉴"></nav><section id="screen" aria-label="게임 화면" tabindex="-1"></section><div id="albumNotice" role="status"></div><p id="feedback" role="status" aria-live="polite"></p>
<footer class="os-save-note">진행 상황과 게임 속 응원글은 이 브라우저에만 저장됩니다.<br>기기를 바꾸기 전 ‘저장 관리’에서 백업해 주세요.</footer>
<dialog id="stageModal" aria-labelledby="stageModalTitle"><article id="modalBody"></article><button id="stageClose" aria-label="닫기">×</button></dialog><input id="stageFile" type="file" accept=".json,application/json" hidden>
</section>`);
