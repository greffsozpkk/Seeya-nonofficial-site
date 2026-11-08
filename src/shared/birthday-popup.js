'use strict';
const DAY='2026-11-08';
const STORAGE_KEY='seeya-home-notice:gyuri-mv:'+DAY;
const END=Date.parse('2026-11-09T00:00:00+09:00');
function isBirthday(now=new Date()){
 const time=now.getTime();
 return Number.isFinite(time)&&time>=Date.parse('2026-11-08T00:00:00+09:00')&&time<END;
}
function birthdayPopup(){return `<dialog class="birthday-popup" id="birthdayPopup" aria-label="남규리 신곡 뮤직비디오 촬영 현장 초대" aria-describedby="birthdayPopupDate">
 <p class="birthday-popup-sr" id="birthdayPopupDate">신청은 11월 8일 밤 11시 59분까지입니다. 이미지를 누르면 남규리의 귤멍 유튜브 공지가 새 창에서 열립니다.</p>
 <a class="birthday-popup-link" href="https://www.youtube.com/post/Ugkxq8hwrQLbrHcHjJHFcOk4t0V46nEDyl55" target="_blank" rel="noopener noreferrer"><img id="birthdayPopupImage" data-birthday-src="/images/events/gyuri-mv-invitation-20261108.png" width="1080" height="1350" alt="남규리 신곡 뮤직비디오 촬영 현장 초대 · 11월 13일 서울 은평구. 유튜브 공지 보기 (새 창)"></a>
 <div class="birthday-popup-actions"><label><input type="checkbox" id="birthdayPopupHide">오늘 다시 보지 않기</label><button type="button" id="birthdayPopupClose" autofocus>닫기 <span aria-hidden="true">×</span></button></div>
</dialog>`;}
module.exports={DAY,STORAGE_KEY,END,isBirthday,birthdayPopup};
