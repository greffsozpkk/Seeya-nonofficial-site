const {W}=require('../shared/common');

module.exports=()=>W(`<section class="game-hub game-exam-page">
  <a class="game-back" href="/game/">← SEEYA PLAY</a>
  <header class="game-hub-heading">
    <div class="eye">SEEYA · FAN GAME</div>
    <h1>씨야 과몰입 진단소</h1>
    <p>내 일상에 씨야가 얼마나 스며들었을까?<br>씨야를 향한 마음을 살펴보는 팬 테스트.</p>
  </header>
  <figure class="game-exam-illustration"><img src="/images/game/seeya-clinic.png" alt="진료실에서 함께하는 씨야 세 멤버의 캐릭터 일러스트" width="1536" height="1024"></figure>
  <section class="game-exam-notice" aria-labelledby="clinic-status-title">
    <span class="game-card-kicker">SEEYA FAN CHECK</span>
    <h2 id="clinic-status-title">준비중</h2>
    <p>문항마다 나와 얼마나 닮았는지 1~5점으로 체크하면,<br>점수에 따라 나만의 ‘씨야 과몰입 진단서’를 받는<br>팬 테스트를 준비하고 있어요.</p>
    <p>기다리는 동안 가사 퀴즈와<br>씨야 모의고사를 즐겨보세요.</p>
    <a class="game-primary-link" href="/game/">SEEYA PLAY로 돌아가기 →</a>
  </section>
</section>`);
