const aboutNav=require('../shared/about-nav');
module.exports=()=>`<section class="notification-page">
${aboutNav('notifications')}
<div class="eye">A LITTLE REMINDER</div><h1>오늘의 씨야, 놓치지 않도록</h1>
<p class="notification-lead">일정이 있는 날, 원하는 시간에 하루 한 번.<br>씨야와 멤버들의 오늘 일정을 알림으로 받아보세요.</p>
<div class="notification-grid">
<section class="notification-panel" aria-labelledby="notification-settings"><h2 id="notification-settings">일정 알림 설정</h2>
<p id="pushEnvironment" role="status">알림을 지원하는 환경인지 확인하고 있어요.</p>
<div id="pushInstall" class="notification-note" hidden>아이폰은 Safari에서 <b>공유 → 홈 화면에 추가</b>한 뒤, 설치한 씨야 아카이브에서 이 페이지를 열어 주세요. <a href="/about/install/">설치 방법 보기 →</a></div>
<label class="notification-time" for="pushTime">알림 받을 시간 <select id="pushTime" disabled></select></label><p class="notification-help">한국 시간 기준 · 이 기기에 적용됩니다. 실제 도착은 몇 분 늦어질 수 있어요.</p>
<button id="pushSubscribe" class="notification-primary" disabled>알림 허용하고 신청하기</button>
<label class="notification-toggle" id="pushDailyWrap" hidden><input id="pushDaily" type="checkbox"><span>일정 있는 날 하루 한 번 받기</span></label>
<p id="pushStatus" class="notification-status" role="status" aria-live="polite">알림 서버를 연결하고 있어요.</p>
<div class="notification-actions"><button id="pushRefresh">연결 상태 확인</button><button id="pushUnsubscribe" hidden>이 기기 알림 해제</button></div>
<p class="notification-help">PC를 켜두지 않아도 발송합니다.<br>다른 기기에서도 받고 싶다면 그 기기에서 따로 신청해 주세요.</p></section>
<section class="notification-panel" aria-labelledby="notification-preview"><h2 id="notification-preview">어떻게 도착하나요?</h2>
<div class="notification-sample"><div><img src="/images/app/icon-192-v2.png" width="36" height="36" alt=""><strong>SEEYA ARCHIVE</strong></div><strong id="pushTitle">일정을 확인하고 있어요.</strong><p id="pushBody"></p></div>
<p id="pushPreviewNote" class="notification-help"></p><button id="pushTest" disabled>이 내용으로 테스트 알림 받기</button>
<p class="notification-help">버튼을 누르고 화면을 닫거나 잠가보세요. 약 15초 뒤 발송하며, 연결 상태에 따라 더 걸릴 수 있어요.</p>
<a id="pushLink" href="/calendar/">일정 자세히 보기 →</a></section>
</div>
<section class="notification-panel notification-guide"><h2>처음 신청하시나요?</h2><ol><li>홈 화면에 <strong>씨야 아카이브를 추가</strong>하고, 설치한 앱에서 ABOUT → 일정 알림을 여세요. Android에서는 일반 브라우저에서도 신청할 수 있어요.</li><li>받을 시간을 정한 뒤 <strong>‘알림 허용하고 신청하기’</strong>를 누르고, 기기의 알림 허용 창에서도 허용해 주세요.</li><li><strong>테스트 알림</strong>을 받아본 뒤, 일정이 있는 날 선택한 시간에 확인해 주세요.</li></ol>
<p>홈 화면에 설치한 앱에서는 아카이브 이름과 로고로 표시될 수 있어요. 일반 브라우저에서는 인터넷·Chrome 이름이나 로고가 함께 나올 수 있으며, 기기별 표시 방식은 다릅니다.</p>
<a href="/about/install/">홈 화면에 추가하는 방법 →</a>
<details><summary>어떤 일정을 알려주나요?</summary><p>공개 캘린더에 등록된 확정·변경 일정 중 오늘의 일정을 모아 보냅니다. 일정이 없는 날과 취소·미확정 일정, 기념일은 보내지 않습니다. 한 건이면 해당 일정 상세로, 여러 건이면 해당 날짜 목록으로 연결합니다. 알림에는 시간순으로 최대 두 건을 표시하고, 나머지는 건수로 안내합니다.</p><p>방송 직전 알림이나 일정 변경·취소 즉시 알림은 포함하지 않습니다. 선택한 시각 이후 등록된 일정은 당일 알림에 빠질 수 있어요.</p></details>
<details><summary>알림이 안 오거나 잠시 끄고 싶어요</summary><p>위에서 연결 상태를 확인하고, 기기·브라우저의 알림 허용과 방해금지·절전 설정을 확인해 주세요. 자동 알림 체크를 끄면 일시 중지하며, ‘이 기기 알림 해제’를 누르면 구독을 삭제합니다. 기기 설정에서 차단한 권한은 여기서 다시 허용할 수 없어요.</p></details>
<details><summary>어떤 정보를 저장하나요?</summary><p>알림 전송을 위한 기기 구독 주소·암호화 키, 선택한 시간, 신청 시각과 전송 상태를 Cloudflare에 저장합니다. 다이어리·게임·편지 내용, 이름·이메일·전화번호는 수집하지 않습니다. 발송할 때 기기의 Google·Apple 등 푸시 서비스와 통신합니다.</p><p>전송 작업 기록은 7일 후 삭제하며, 해제하면 해당 기기의 서버 구독과 연결된 작업도 삭제합니다. 남용 방지용 임시 해시값은 최대 하루 보관합니다. 구독은 기기별로 관리됩니다.</p></details>
</section></section>`;
