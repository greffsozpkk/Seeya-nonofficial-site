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
      <div class="game-card-art game-card-art-exam"><img src="/images/game/seeya-exam.png?v=4.100" alt="교실에서 씨야 모의고사를 푸는 세 멤버의 일러스트" width="1402" height="1122" loading="lazy"></div>
      <div class="game-card-copy">
        <span class="game-card-kicker">02 · SEEYA EXAM</span>
        <h2 id="game-exam-title">씨야 모의고사</h2>
        <p id="game-exam-description">씨야에 대해 얼마나 알고 있나요?<br>재회·기억·종합 탐구에 도전해보세요.</p>
        <div class="game-card-details"><span class="game-status" id="game-exam-status">3개 영역 · 영역별 25문제</span></div>
        <span class="game-card-link">모의고사 풀기 <span aria-hidden="true">→</span></span>
      </div>
    </a>
  </div>
</section>`);
