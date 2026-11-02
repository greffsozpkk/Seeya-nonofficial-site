'use strict';
// Coordinates are in the exported 1080 × 1350 poster.
const themes = {
  curtain: {label:'커튼콜', left:102, right:978, top:152, bottom:1030, centered:true},
  skyline: {label:'도시의 밤', left:84, right:996, top:82, bottom:910, dark:true},
  blossom: {label:'벚꽃 무대', left:165, right:915, top:140, bottom:934, centered:true},
  paper: {label:'종이 셋리스트', left:108, right:972, top:106, bottom:1210},
  rose: {label:'로즈 티켓', left:86, right:994, top:96, bottom:1170},
  night: {label:'나이트 스테이지', left:86, right:994, top:96, bottom:1170, dark:true}
};
const fonts = {
  dodum: {label:'고운돋움', family:'"Passport Dodum", sans-serif'},
  jua: {label:'배민 주아체', family:'"Concert Jua", sans-serif'},
  yeonsung: {label:'배민 연성체', family:'"Concert Yeon Sung", serif'},
  gaegu: {label:'개구체', family:'"Concert Gaegu", cursive'},
  pen: {label:'나눔손글씨 펜', family:'"Passport Pen", cursive'},
  batang: {label:'고운바탕', family:'"Passport Batang", serif'}
};
const backdrop = key => ['curtain','skyline','blossom','paper'].includes(key) ? '/images/game/concert-poster-'+key+'.png' : '';
module.exports = {themes, fonts, backdrop};

