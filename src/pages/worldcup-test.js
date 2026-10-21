const {W,esc:E}=require('../shared/common');
module.exports=()=>{const data=require('../shared/worldcup-catalog')();return W(`<section class="wc-shell">
<div class="wc-top"><a href="/game/">← SEEYA PLAY</a><span class="wc-badge">TEST PLAY</span></div>
<header class="wc-heading"><p class="eye">ONE SONG, YOUR CHOICE</p><h1>씨야 노래 월드컵</h1><p>첫 소절의 설렘부터, 오래 간직한 수록곡까지.<br>마지막에 남을 나의 씨야 노래를 골라보세요.</p></header>
<div id="wcNotice" class="wc-notice" role="status" hidden></div><div id="worldcupApp">
<p>씨야의 ${data.candidates.length}곡 중 32곡 또는 64곡을 무작위로 골라 시작합니다.</p><noscript>월드컵을 진행하려면 JavaScript를 켜 주세요.</noscript></div>
<p class="wc-footnote">테스트 페이지 · 전체 이용자 우승 통계는 아직 집계하지 않습니다.<br>진행 상황과 내 우승 기록은 이 브라우저에만 저장됩니다.</p>
<script type="application/json" id="worldcupData">${JSON.stringify(data).replace(/</g,'\\u003c')}</script>
</section>`);};
