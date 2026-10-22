const {W,esc:E}=require('../shared/common');
module.exports=()=>{const stats=require('../data/worldcup-stats.json');const data={collections:require('../shared/worldcup-manifest').current(),stats};return W(`<section class="wc-shell">
<div class="wc-top"><a href="/game/test/">← SEEYA PLAY</a></div>
<header class="wc-heading"><p class="eye">YOUR FAVORITE, YOUR CHOICE</p><h1>이상형 월드컵</h1><p>씨야의 노래와 커버 무대, 뮤비와 남규리의 배역까지.<br>월드컵을 선택하고, 마지막에 남을 나의 최애를 골라보세요.</p></header>
<div id="wcNotice" class="wc-notice" role="status" hidden></div><div id="worldcupApp">
<p>씨야 노래·멤버 솔로곡·씨야 뮤비·남규리 필모드컵·씨야 4집·방송 커버곡·통합 커버곡 중 하나를 선택하세요.</p><noscript>월드컵을 진행하려면 JavaScript를 켜 주세요.</noscript></div>
<p class="wc-footnote">진행 상황과 내 우승 기록은 이 브라우저에 저장됩니다. 통계 참여 시 익명 게임 정보와 선택 경로를 전송하며 이름·이메일·다이어리는 전송하지 않습니다.<br>완료한 새 게임은 다시 집계합니다. 같은 게임의 재전송·결과 공유는 추가 집계하지 않습니다.</p>
<script type="application/json" id="worldcupData">${JSON.stringify(data).replace(/</g,'\\u003c')}</script>
</section>`);};
