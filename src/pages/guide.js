const {albums,history,tarot,TODAY_SONGS,TODAY_MOODS,fanChantImages,archiveTypes,W,esc,archivePageItems,archiveSearchText,galleryCard,pickTodayMoment,newsDateParts}=require('../shared/common');
const {newsList,galleryMoment,archiveView}=require('../shared/views');
function guide(){
  const {songs}=require('../data/guide.json');
  return `<section class="guide-hero">
    <div class="eye">NEW TO SEEYA?</div>
    <h1>처음 만나는 씨야</h1>
    <div class="guide-lead guide-lines"><span>세 사람의 목소리, 스무 해의 이야기.</span><span>어디서부터 들어야 할지 모르겠다면 여기서 시작하세요.</span><span>노래를 듣고, 시간을 따라가고, 지금의 씨야까지 만나보는 짧은 입문 가이드입니다.</span></div>
  </section>
  <div class="guide-wrap">
    <section class="guide-step">
      <div class="guide-step-head"><div class="guide-no">01</div><div><div class="eye">WHO IS SEEYA?</div><h2>세 목소리로 시작된 씨야</h2><div class="guide-lines"><span>2006년 데뷔한 씨야는 남규리, 김연지, 이보람 세 멤버의 목소리로 많은 발라드와 미디엄 템포 곡을 남겼습니다.</span><span>긴 시간을 지나 2026년, 세 사람은 다시 씨야의 이름으로 이야기를 이어가고 있습니다.</span></div></div></div>
      <div class="guide-intro-card"><b>SEEYA · 씨야</b><br><div class="guide-lines"><span>2006년 <i>The First Mind</i>로 시작해 2011년 마지막 인사를 건넸습니다.</span><span>2020년 다시 한 무대에 선 뒤, 2026년 <i>First, Again</i>으로 돌아왔습니다.</span></div><div class="guide-actions"><a class="guide-link" href="/history/">전체 이야기 보기 →</a><a class="guide-link" href="/members/">멤버 프로필 보기 →</a></div></div>
    </section>
    <section class="guide-step">
      <div class="guide-step-head"><div class="guide-no">02</div><div><div class="eye">START WITH THESE SONGS</div><h2>어떤 노래부터 들을까요?</h2><div class="guide-lines"><span>한 곡씩 분위기를 바꿔가며 들어보세요.</span><span>마음에 드는 방향을 찾으면 그 곡이 담긴 앨범으로 자연스럽게 이어갈 수 있습니다.</span></div></div></div>
      <div class="guide-songs">${songs.map(s=>`<article class="guide-song"><small>${s[0]}</small><h3>${s[1]}</h3><p>${s[2]}</p><a target="_blank" rel="noopener" href="https://www.melon.com/album/detail.htm?albumId=${s[3]}">Melon 앨범에서 듣기 →</a></article>`).join("")}</div>
    </section>
    <section class="guide-step">
      <div class="guide-step-head"><div class="guide-no">03</div><div><div class="eye">WHICH ALBUM FIRST?</div><h2>취향대로 골라 듣는 세 가지 루트</h2><div class="guide-lines"><span>모든 앨범을 순서대로 들을 필요는 없습니다.</span><span>원하는 씨야의 모습에서 시작해보세요.</span></div></div></div>
      <div class="guide-routes">
        <div class="guide-route"><b>ROUTE A · 정석</b><strong>The First Mind<br>↓<br>Lovely Sweet Heart<br>↓<br>First, Again</strong><span>처음의 씨야와 대표적인 시기, 그리고 현재를 한 번에 연결하는 루트.</span></div>
        <div class="guide-route"><b>ROUTE B · 히트곡 중심</b><strong>Lovely Sweet Heart<br>↓<br>California Dream<br>↓<br>Brilliant Change</strong><span>익숙한 대표곡을 중심으로 2000년대 씨야의 흐름을 따라가는 루트.</span></div>
        <div class="guide-route"><b>ROUTE C · 2026부터</b><strong>그럼에도, 우린<br>↓<br>First, Again<br>↓<br>과거 앨범으로</strong><span>지금의 씨야를 먼저 만난 뒤 스무 해의 음악을 거꾸로 찾아가는 루트.</span></div>
      </div>
      <div class="guide-actions"><a class="guide-link" href="/music/">전체 디스코그래피 보기 →</a></div>
    </section>
    <section class="guide-step">
      <div class="guide-step-head"><div class="guide-no">04</div><div><div class="eye">THE STORY SO FAR</div><h2>스무 해를 다섯 장면으로</h2><div class="guide-lines"><span>씨야의 시간을 아주 짧게 훑어보면</span><span>지금의 <i>First, Again</i>이 조금 다르게 들립니다.</span></div></div></div>
      <div class="guide-timeline">
        <div class="guide-time"><b>2006</b><span>데뷔<br>The First Mind</span></div>
        <div class="guide-time"><b>2007—2009</b><span>씨야의 음악이<br>추억이 된 시간</span></div>
        <div class="guide-time"><b>2011</b><span>See You Again<br>마지막 인사</span></div>
        <div class="guide-time"><b>2020</b><span>다시 만난<br>세 사람</span></div>
        <div class="guide-time"><b>2026</b><span>FIRST, AGAIN<br>다시 시작</span></div>
      </div>
      <div class="guide-actions"><a class="guide-link" href="/history/">HISTORY에서 이어보기 →</a></div>
    </section>
    <section class="guide-step">
      <div class="guide-step-head"><div class="guide-no">05</div><div><div class="eye">READY FOR THE CONCERT?</div><h2>이제 함께 부를 차례</h2><div class="guide-lines"><span>노래와 이야기를 알았다면 공연에서 함께 즐겨보세요.</span></div></div></div>
      <div class="guide-concert"><div class="eye">SEEYA · THE FAN</div><h3 style="font-family:'Gowun Batang',serif;font-size:28px;margin:10px 0">콘서트 가기 전, 이것만 확인해도 충분해요.</h3><div class="guide-actions"><a class="guide-link" href="/music/fanchant/">응원법 보기 →</a><a class="guide-link" target="_blank" rel="noopener" href="https://www.youtube.com/@SEEYA_Ent_Official">공식 YouTube →</a><a class="guide-link" target="_blank" rel="noopener" href="https://m.ticket.yes24.com/genre/genrebridge.aspx?genre=15456&id=1530&utm_source=ig&utm_medium=social&utm_content=link_in_bio">THE FAN 일정 →</a></div></div>
    </section>
    <section class="guide-finish"><div class="eye">WELCOME TO SEEYA</div><h2>이제 준비됐어요.</h2><div class="guide-lines"><span>한 곡을 듣고, 한 장면을 보고, 한 시절을 따라가다 보면</span><span>어느새 당신에게도 씨야의 노래가 하나쯤 남아 있을 거예요.</span></div><div class="guide-actions" style="justify-content:center"><a class="guide-link" href="/today/">오늘의 씨야 만나기 →</a><a class="guide-link" href="/game/lyrics/">가사 퀴즈 도전하기 →</a></div></section>
    <div class="page-pixel-art" aria-hidden="true"><img src="images/common/seeya-cheer-pixel.png" alt="" loading="lazy"></div>
  </div>`;
}
module.exports=guide;
