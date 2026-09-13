const {W}=require('../shared/common');

module.exports=()=>W(`<section class="game-hub game-exam-page">
  <a class="game-back" href="/game/">← SEEYA PLAY</a>
  <header class="game-hub-heading">
    <div class="eye">SEEYA · FAN GAME</div>
    <h1>씨야 모의고사</h1>
    <p>씨야와 함께한 시간, 얼마나 기억하고 있나요?<br>팬심을 확인할 새로운 시험을 준비하고 있어요.</p>
  </header>
  <section class="game-exam-notice" aria-labelledby="exam-status-title">
    <span class="game-card-kicker">SEEYA EXAM</span>
    <h2 id="exam-status-title">업데이트 예정</h2>
    <p>모의고사는 아직 준비 중입니다.<br>문제와 시험 안내는 이곳에 차례로 추가할 예정이에요.</p>
    <p>기다리는 동안 가사 한 줄로<br>씨야의 노래 제목을 맞혀보세요.</p>
    <a class="game-primary-link" href="/game/lyrics/">제목 맞히기 도전하기 →</a>
  </section>
</section>`);
