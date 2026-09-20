const {W}=require('../shared/common');
const {galleryHeader}=require('../shared/gallery-layout');
const {prepare,pageSlice,cards,pagination}=require('../shared/fan-gallery');
module.exports=()=>{
 const posts=prepare(require('../data/fan-posts.json'));
 const state=pageSlice(posts,1);
 return W(`${galleryHeader('fans')}<section class="fan-photo-shell" aria-labelledby="fanPhotoTitle">
 <div class="gallery-section-kicker">THROUGH FANS' EYES</div><h2 id="fanPhotoTitle" class="gallery-section-title" tabindex="-1">팬이 담은 씨야</h2>
 <p class="gallery-section-desc">팬의 시선으로 간직한 씨야의 순간들.<br>사진을 남겨주신 분들의 Instagram 게시물을 모았습니다.</p>
 <p class="fan-photo-note">사진은 Instagram에서 불러옵니다. 표시되지 않으면 ‘원본 게시물 보기’를 이용해주세요.<br>날짜는 촬영일이 아닌 게시일 기준입니다.</p>
 <p id="fanPhotoStatus" class="fan-photo-status" role="status">총 ${posts.length}개 게시물 · 1 / ${state.totalPages} 페이지</p>
 <div id="fanPhotoGrid" class="fan-photo-grid">${cards(state.items)}</div>
 <nav id="fanPhotoPages" class="fan-photo-pages" aria-label="팬 사진 페이지">${pagination(1,state.totalPages)}</nav>
 <noscript><p>사진을 바로 표시하거나 다음 페이지로 이동하려면 JavaScript를 켜주세요. 원본 게시물 링크는 바로 열 수 있습니다.</p></noscript>
 </section>`);
};
