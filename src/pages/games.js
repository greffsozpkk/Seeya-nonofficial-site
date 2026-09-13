const {W}=require('../shared/common');

module.exports=()=>W(`<section class="game-hub">
  <header class="game-hub-heading">
    <div class="eye">SEEYA · FAN GAME</div>
    <h1>SEEYA PLAY</h1>
    <p>씨야와 함께하는 팬 놀이터<br>마음에 드는 게임을 골라보세요.</p>
  </header>
  <div class="game-card-grid">
    <a class="game-card game-card-lyrics" href="/game/lyrics/" aria-labelledby="game-lyrics-title" aria-describedby="game-lyrics-description">
      <div class="game-card-art game-card-art-lyrics" aria-hidden="true"></div>
      <div class="game-card-copy">
        <span class="game-card-kicker">01 · LYRICS QUIZ</span>
        <h2 id="game-lyrics-title">가사 보고 제목 맞히기</h2>
        <p id="game-lyrics-description">익숙한 후렴부터 수록곡의 한 줄까지.<br>가사를 보고 노래 제목을 맞혀보세요.</p>
        <div class="game-card-details">3단계 난이도 · 한 게임 10문제</div>
        <span class="game-card-link">게임으로 이동 <span aria-hidden="true">→</span></span>
      </div>
    </a>
    <a class="game-card game-card-exam" href="/game/exam/" aria-labelledby="game-exam-title" aria-describedby="game-exam-description game-exam-status">
      <div class="game-card-art game-card-art-exam" aria-hidden="true">
        <div class="game-exam-paper"><span>SEEYA ARCHIVE</span><strong>씨야 모의고사</strong><i></i><i></i><div>①　②　③　④</div><i></i></div>
      </div>
      <div class="game-card-copy">
        <span class="game-card-kicker">02 · SEEYA EXAM</span>
        <h2 id="game-exam-title">씨야 모의고사</h2>
        <p id="game-exam-description">씨야에 대해 얼마나 알고 있나요?<br>팬심을 확인할 새로운 시험을 준비합니다.</p>
        <div class="game-card-details"><span class="game-status" id="game-exam-status">업데이트 예정</span></div>
        <span class="game-card-link">안내 보기 <span aria-hidden="true">→</span></span>
      </div>
    </a>
  </div>
</section>`);
