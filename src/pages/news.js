const {albums,history,tarot,TODAY_SONGS,TODAY_MOODS,fanChantImages,archiveTypes,W,esc,archivePageItems,archiveSearchText,galleryCard,pickTodayMoment,newsDateParts}=require('../shared/common');
const {newsList,galleryMoment,archiveView}=require('../shared/views');
function news(data){data={...data,"씨야":require('../shared/news-filter').filterNews(data["씨야"],"씨야")};return W(`<div class="section news-hero" style="border:0">
<div class="eye">LATEST STORIES</div>
<h1 style="font-size:55px">SEEYA NEWS</h1>
<p class="lead">씨야 전체 소식과 세 멤버의 최근 기사를 최신순으로 확인할 수 있습니다.</p>
</div>

<div class="news-filter" id="newsFilter">
  <button class="active" data-news="씨야">씨야</button>
  <button data-news="남규리">남규리</button>
  <button data-news="김연지">김연지</button>
  <button data-news="이보람">이보람</button>
</div>

<div class="news-meta">
  <span id="newsLabel">SEEYA · LATEST NEWS</span>
  <span id="newsUpdated"></span>
</div>

<div id="newsBox">${newsList((data["씨야"]||[]).slice().sort((a,b)=>new Date(b.pubDate)-new Date(a.pubDate)))}</div>
<div class="page-pixel-art" aria-hidden="true"><img src="images/archive/archive-interview.png" alt="" loading="lazy"></div>`)}
module.exports=news;
