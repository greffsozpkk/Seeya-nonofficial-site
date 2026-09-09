const {albums,history,tarot,TODAY_SONGS,TODAY_MOODS,fanChantImages,archiveTypes,W,esc,archivePageItems,archiveSearchText,galleryCard,pickTodayMoment,newsDateParts}=require('../shared/common');
const {newsList,galleryMoment,archiveView}=require('../shared/views');
function gallery(items,now){return W(`
  <div class="gallery-head">
    <div class="eye">SEEYA · GALLERY</div>
    <h1 style="font-size:55px;margin:10px 0 4px">GALLERY</h1>
    <div class="gallery-tagline">SeeYa in Pictures</div>
  </div>
  <div class="gallery-shell">
    <section class="gallery-section">
      <div class="gallery-section-kicker">TODAY'S PICK</div>
      <h2 class="gallery-section-title">SEEYA MOMENT</h2>
      <p class="gallery-section-desc">오늘 만나는 씨야의 한 장</p>
      <div id="galleryMoment">${galleryMoment(items,now)}</div>
    </section>

    <section class="gallery-section">
      <div class="gallery-recent-head">
        <div>
          <div class="gallery-section-kicker">PHOTO ARCHIVE</div>
          <h2 class="gallery-section-title">RECENT PHOTOS</h2>
        </div>
        <div class="gallery-status" id="galleryStatus">PHOTO ARCHIVE</div>
      </div>
      <div class="gallery-grid" id="galleryGrid">${items.length?items.slice(0,8).map((x,i)=>galleryCard(x,i)).join(""):`<div class="gallery-empty"><div class="gallery-empty-inner"><div class="gallery-empty-mark">✦</div><h2>아직 등록된 사진이 없어요.</h2></div></div>`}</div>
      <div class="gallery-footnote">사진을 클릭하면 원본 비율로 크게 볼 수 있습니다.</div>
    </section>
  </div>
  <div class="page-pixel-art" aria-hidden="true"><img src="images/gallery/seeya-gallery-pixel.png" alt="" loading="lazy"></div>
`) }
module.exports=gallery;
