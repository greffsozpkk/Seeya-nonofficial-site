'use strict';
const DAY='2026-10-30';
const STORAGE_KEY='seeya-birthday-popup:yeonji:'+DAY;
const END=Date.parse('2026-10-31T00:00:00+09:00');
function isBirthday(now=new Date()){
 const time=now.getTime();
 return Number.isFinite(time)&&time>=Date.parse('2026-10-30T00:00:00+09:00')&&time<END;
}
function birthdayPopup(){return `<dialog class="birthday-popup" id="birthdayPopup" aria-label="김연지 생일 축하" aria-describedby="birthdayPopupDate">
 <p class="birthday-popup-sr" id="birthdayPopupDate">김연지의 생일을 축하합니다. 한국 시간 2026년 10월 30일 하루 동안 표시됩니다.</p>
 <img id="birthdayPopupImage" data-birthday-src="/images/events/yeonji-birthday-20261030.png" width="850" height="1063" alt="HAPPY Birthday to yeonji. 우리의 빛 연지야 생일 축하해! 씨야 갤러리의 김연지 생일 축하 이미지">
 <div class="birthday-popup-actions"><label><input type="checkbox" id="birthdayPopupHide">오늘 다시 보지 않기</label><button type="button" id="birthdayPopupClose" autofocus>닫기 <span aria-hidden="true">×</span></button></div>
</dialog>`;}
module.exports={DAY,STORAGE_KEY,END,isBirthday,birthdayPopup};
