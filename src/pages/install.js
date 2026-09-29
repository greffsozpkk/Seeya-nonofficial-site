const aboutNav=require('../shared/about-nav');
const installGuide=require('../shared/install-guide');
module.exports=function(){return `<section class="about-install-page">
 ${aboutNav('install')}
 <div class="eye">ABOUT SEEYA ARCHIVE</div>
 <h1>늘 가까이, 씨야</h1>
 <p>다시 찾아오는 길이 조금 더 편해지도록.<br>홈 화면에 씨야 아카이브를 놓아보세요.</p>
 ${installGuide()}
 </section>`;};
