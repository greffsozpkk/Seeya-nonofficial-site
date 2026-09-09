const {albums,history,tarot,TODAY_SONGS,TODAY_MOODS,fanChantImages,archiveTypes,W,esc,archivePageItems,archiveSearchText,galleryCard,pickTodayMoment,newsDateParts}=require('../shared/common');
const {newsList,galleryMoment,archiveView}=require('../shared/views');
function historyPage(){return W(`
<div class="history-hero">
  <div class="eye">SEEYA · HISTORY</div>
  <h1>HISTORY</h1>
  <div class="history-kicker">Our story, still being written.</div>
  <p class="history-intro">씨야의 이야기는 한 번 끝난 적이 있다. 그리고 아주 오랜 시간이 지나, 다시 시작됐다.<br>노래로 만났던 순간부터 다시 같은 이름으로 무대에 서기까지. SEEYA의 지나온 시간, 그리고 계속될 이야기.</p>
</div>

<div class="history-story">
  <section class="history-chapter">
    <div><span class="history-no">01 · FIRST MIND</span><span class="history-years">2006</span></div>
    <h2>처음, 세 목소리가 하나가 되다</h2>
    <div class="history-sub">모든 이야기는 세 사람의 목소리에서 시작됐다.</div>
    <div class="history-copy">
      <p>2006년, 남규리·김연지·이보람 세 사람의 목소리가 <b>씨야(SeeYa)</b>라는 이름으로 만났다.</p>
      <p>첫 정규앨범 <i>The First Mind</i>와 ‘여인의 향기’로 시작된 씨야의 음악은 애절한 감성과 세 사람의 하모니로 빠르게 사랑받았다. 이어 ‘구두’, ‘미친 사랑의 노래’ 등이 사랑받으며 데뷔 첫해부터 자신들만의 색을 가진 여성 보컬 그룹으로 자리 잡았다.</p>
      <p>그리고 그 시작은 여러 시상식의 신인상으로 이어졌다.</p>
    </div>
    <div class="milestones">
      <div class="milestones-title">MILESTONES</div>
      <div class="milestone"><span class="m-date">2006.02.24</span><span class="m-type">ALBUM</span><span class="m-text">정규 1집 <b>The First Mind</b> 발매</span></div>
      <div class="milestone"><span class="m-date">2006</span><span class="m-type">MUSIC</span><span class="m-text"><b>여인의 향기 · 구두 · 미친 사랑의 노래</b> 활동</span></div>
      <div class="milestone"><span class="m-date">2006</span><span class="m-type">AWARD</span><span class="m-text"><b>골든디스크 신인상</b></span></div>
      <div class="milestone"><span class="m-date">2006</span><span class="m-type">AWARD</span><span class="m-text"><b>SBS 가요대전 여자 신인상</b></span></div>
      <div class="milestone"><span class="m-date">2006</span><span class="m-type">AWARD</span><span class="m-text"><b>서울가요대상 신인상 · 아시아송페스티벌 신인상</b></span></div>
    </div>
  </section>

  <section class="history-chapter">
    <div><span class="history-no">02 · OUR DAYS</span><span class="history-years">2007 — 2009</span></div>
    <h2>노래마다 추억이 되어가던 시간</h2>
    <div class="history-sub">신인에서, 한 시대를 기억하게 하는 목소리로.</div>
    <div class="history-copy">
      <p>데뷔의 성공은 시작에 불과했다. 2007년 정규 2집 <i>Lovely Sweet Heart</i>와 함께 ‘사랑의 인사’, ‘결혼할까요’가 이어졌고, 이후 ‘슬픈 발걸음’, ‘가니’, ‘Hot Girl’, ‘그 놈 목소리’까지 씨야의 음악은 폭을 넓혀갔다.</p>
      <p>발라드부터 미디엄 템포와 댄스곡까지 음악은 계속 달라졌지만, 세 사람의 목소리가 만났을 때 느껴지는 <b>‘씨야의 감성’</b>은 변하지 않았다.</p>
      <p>2007년에는 ‘사랑의 인사’로 MKMF 여자그룹상을, 골든디스크에서 디지털음원부문 본상을 수상하며 대표 여성 보컬 그룹으로 자리매김했다.</p>
    </div>
    <div class="milestones">
      <div class="milestones-title">MILESTONES</div>
      <div class="milestone"><span class="m-date">2007.05.25</span><span class="m-type">ALBUM</span><span class="m-text">정규 2집 <b>Lovely Sweet Heart</b> 발매</span></div>
      <div class="milestone"><span class="m-date">2007.11.17</span><span class="m-type">AWARD</span><span class="m-text"><b>MKMF 여자그룹상</b> · 사랑의 인사</span></div>
      <div class="milestone"><span class="m-date">2007.12.14</span><span class="m-type">AWARD</span><span class="m-text"><b>골든디스크 디지털음원부문 본상</b></span></div>
      <div class="milestone"><span class="m-date">2008.01.02</span><span class="m-type">ALBUM</span><span class="m-text">2.5집 <b>California Dream</b> 발매</span></div>
      <div class="milestone"><span class="m-date">2008.09.26</span><span class="m-type">ALBUM</span><span class="m-text">정규 3집 <b>Brilliant Change</b> 발매</span></div>
      <div class="milestone"><span class="m-date">2009.10.26</span><span class="m-type">ALBUM</span><span class="m-text">미니앨범 <b>Rebloom</b> 발매</span></div>
    </div>
  </section>

  <section class="history-chapter">
    <div><span class="history-no">03 · SEE YOU AGAIN</span><span class="history-years">2010 — 2011</span></div>
    <h2>끝이라고 생각했던 인사</h2>
    <div class="history-sub">See You Again.</div>
    <div class="history-copy">
      <p>함께 달려온 시간 속에서 씨야에게도 변화가 찾아왔다.</p>
      <p>그리고 2011년, <i>See You Again</i>. 다시 세 사람이 함께한 마지막 앨범은 제목 그대로 팬들에게 건네는 하나의 인사처럼 남았다.</p>
      <p>마지막 무대가 끝나고 씨야라는 이름의 시간도 멈췄다. 수많은 노래와 추억을 남긴 채, 그렇게 씨야의 첫 번째 이야기는 끝나는 것처럼 보였다.</p>
    </div>
    <div class="history-quote">그때는 정말 마지막인 줄 알았다.</div>
    <div class="milestones">
      <div class="milestones-title">MILESTONES</div>
      <div class="milestone"><span class="m-date">2011.01.21</span><span class="m-type">ALBUM</span><span class="m-text"><b>See You Again</b> 발매</span></div>
      <div class="milestone"><span class="m-date">2011.01.30</span><span class="m-type">STAGE</span><span class="m-text">SBS <b>인기가요 마지막 음악방송 무대</b></span></div>
    </div>
  </section>

  <section class="history-chapter">
    <div><span class="history-no">04 · AGAIN, BUT NOT YET</span><span class="history-years">2020</span></div>
    <h2>다시 만났지만, 아직은 아니었던</h2>
    <div class="history-sub">아홉 해 만의 세 사람.</div>
    <div class="history-copy">
      <p>그렇게 9년이 흘렀다. 2020년 JTBC <b>슈가맨3</b>에서 남규리, 김연지, 이보람이 다시 씨야라는 이름으로 한 무대에 섰다.</p>
      <p>오랜 시간이 흘렀음에도 세 사람의 목소리는 여전히 씨야였고, 이 만남은 추억으로만 남아 있던 이름을 다시 움직이게 했다. 실제로 프로젝트 앨범을 통한 재결합까지 추진됐지만, 계획은 결국 성사되지 못했다.</p>
      <p>다시 만났지만, 다시 시작하기에는 아직 조금 이른 시간이었던 셈이다.</p>
    </div>
    <div class="history-quote">다시 만났다는 것만으로도, 기다릴 이유는 충분했다.</div>
    <div class="milestones">
      <div class="milestones-title">MILESTONES</div>
      <div class="milestone"><span class="m-date">2020.02</span><span class="m-type">REUNION</span><span class="m-text">JTBC <b>슈가맨3 · 완전체 무대</b></span></div>
      <div class="milestone"><span class="m-date">2020</span><span class="m-type">REUNION</span><span class="m-text"><b>씨야 프로젝트 앨범 및 재결합 추진</b></span></div>
      <div class="milestone"><span class="m-date">2020.11.25</span><span class="m-type">REUNION</span><span class="m-text"><b>재결합 프로젝트 무산 발표</b></span></div>
    </div>
  </section>

  <section class="history-chapter">
    <div><span class="history-no">05 · FIRST, AGAIN</span><span class="history-years">NOW</span></div>
    <h2>그럼에도, 우린 다시</h2>
    <div class="history-sub">끝났던 이야기가 아니라, 다시 쓰이기 시작한 이야기.</div>
    <div class="history-copy">
      <p>그리고 또 시간이 흘렀다. 데뷔 20주년을 맞은 남규리, 김연지, 이보람은 다시 한번 <b>씨야</b>라는 이름으로 노래하기 시작했다.</p>
      <p>2026년 3월 30일 ‘그럼에도, 우린’. 그리고 5월 14일, 15년 만의 정규앨범 <i>First, Again</i>.</p>
      <p>과거의 씨야를 그대로 되풀이하기보다 긴 시간을 지나온 지금의 세 사람이 부르는 새로운 씨야의 음악이 시작됐다. 그리고 그 이야기는 음반에서 끝나지 않았다. 팬들과 다시 만나는 20주년 전국투어 <b>THE FAN</b>이 서울에서 시작되어 전국으로 이어진다.</p>
    </div>
    <div class="milestones">
      <div class="milestones-title">MILESTONES · THE SECOND CHAPTER</div>
      <div class="milestone"><span class="m-date">2026.03.30</span><span class="m-type">SINGLE</span><span class="m-text"><b>그럼에도, 우린</b> 발매</span></div>
      <div class="milestone"><span class="m-date">2026.05.14</span><span class="m-type">ALBUM</span><span class="m-text">정규 4집 <b>First, Again</b> 발매</span></div>
      <div class="milestone"><span class="m-date">2026.08.29–30</span><span class="m-type">CONCERT</span><span class="m-text"><b>THE FAN · SEOUL</b> · 경희대학교 평화의전당</span></div>
      <div class="milestone"><span class="m-date">2026.09.05</span><span class="m-type">CONCERT</span><span class="m-text"><b>THE FAN · BUSAN</b> · KBS부산홀</span></div>
      <div class="milestone"><span class="m-date">2026.09.12</span><span class="m-type">CONCERT</span><span class="m-text"><b>THE FAN · DAEGU</b> · EXCO 5층 컨벤션홀</span></div>
      <div class="milestone"><span class="m-date">2026.10.04</span><span class="m-type">CONCERT</span><span class="m-text"><b>THE FAN · GOYANG</b> · 킨텍스 제2전시장 10홀</span></div>
      <div class="milestone"><span class="m-date">2026.10.10</span><span class="m-type">CONCERT</span><span class="m-text"><b>THE FAN · CHEONGJU</b> · 청주대학교 석우문화체육관</span></div>
      <div class="milestone"><span class="m-date">2026.10.17</span><span class="m-type">CONCERT</span><span class="m-text"><b>THE FAN · SUWON</b> · 경희대학교 국제캠퍼스 선승관</span></div>
      <div class="milestone"><span class="m-date">2026.10.31</span><span class="m-type">CONCERT</span><span class="m-text"><b>THE FAN · INCHEON</b> · 인천남동체육관</span></div>
    </div>
  </section>

  <section class="history-now">
    <div class="now-label">NOW · AND THE STORY GOES ON</div>
    <h2>계속되는 이야기.</h2>
    <p>SEE YOU ALWAYS.</p>
    <div class="history-ing-art" aria-hidden="true">
      <img src="images/history/seeya-history-ing.png" alt="" loading="lazy">
    </div>
  </section>
</div>
`) }
module.exports=historyPage;
