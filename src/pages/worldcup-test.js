const {W,esc:E}=require('../shared/common');
module.exports=()=>{const group=require('../shared/worldcup-catalog')(),solo=require('../data/worldcup-solo-songs.json'),data={collections:[{...group,id:'group',title:'씨야 노래 월드컵',description:'씨야 앨범 수록곡과 OST·협업곡'},solo]};return W(`<section class="wc-shell">
<div class="wc-top"><a href="/game/test/">← SEEYA PLAY</a><span class="wc-badge">TEST PLAY</span></div>
<header class="wc-heading"><p class="eye">ONE SONG, YOUR CHOICE</p><h1>이상형 월드컵</h1><p>함께 부른 노래와 각자의 목소리.<br>월드컵을 선택하고, 마지막에 남을 한 곡을 골라보세요.</p></header>
<div id="wcNotice" class="wc-notice" role="status" hidden></div><div id="worldcupApp">
<p>씨야 노래 월드컵과 멤버 솔로곡 월드컵 중 하나를 선택하세요.</p><noscript>월드컵을 진행하려면 JavaScript를 켜 주세요.</noscript></div>
<p class="wc-footnote">테스트 페이지 · 전체 이용자 우승 통계는 아직 집계하지 않습니다.<br>진행 상황과 내 우승 기록은 이 브라우저에만 저장됩니다.</p>
<script type="application/json" id="worldcupData">${JSON.stringify(data).replace(/</g,'\\u003c')}</script>
</section>`);};
