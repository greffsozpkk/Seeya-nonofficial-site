'use strict';
const {W}=require('./common');
const revision=require('../data/clinic-bank.json').revision;

module.exports=(environment='public')=>{
 const isTest=environment==='test';
 return W(`<section class="clinic-shell"><a href="/game/">← SEEYA PLAY</a><header class="clinic-intro"><div class="clinic-seti clinic-seti-intro"><strong>SETI</strong><span>SEEYA Enthusiasm &amp; Type Indicator</span></div><h1>씨야 과몰입 진단소</h1><p>어떤 방식으로 좋아하고,<br>일상에는 얼마나 스며들었을까요?</p></header><p class="clinic-note">${isTest?'문항·채점 검토용 화면입니다. ':''}씨야를 좋아하는 방식을 살펴보는 팬 테스트입니다.</p><p id="clinicNotice" role="status" hidden></p><div id="clinicApp" data-clinic-environment="${isTest?'test':'public'}"></div><noscript><p class="clinic-note">검사를 진행하려면 브라우저의 JavaScript를 켜주세요.</p></noscript><script id="clinicData" type="application/json">${JSON.stringify({revision}).replace(/</g,'\\u003c')}</script></section>`);
};
