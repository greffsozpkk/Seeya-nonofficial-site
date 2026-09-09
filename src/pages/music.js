const {albums,history,tarot,TODAY_SONGS,TODAY_MOODS,fanChantImages,archiveTypes,W,esc,archivePageItems,archiveSearchText,galleryCard,pickTodayMoment,newsDateParts}=require('../shared/common');
const {newsList,galleryMoment,archiveView}=require('../shared/views');
function music(route="/music/"){
 const currentMusicRoute=route;
 const sub=currentMusicRoute.startsWith("/music/fanchant")?"fanchant":"discography";
 const subnav=`<div class="music-subnav"><a href="/music/" class="${sub==="discography"?"active":""}">DISCOGRAPHY</a><a href="/music/fanchant/" class="${sub==="fanchant"?"active":""}">FAN CHANT · 응원법</a></div>`;
 if(sub==="fanchant")return W(`
    <div class="section" style="border:0">
      <div class="eye">MUSIC · FAN GUIDE</div>
      <h1 style="font-size:55px">MUSIC</h1>
      <p class="lead">씨야의 음악과 함께 공연장에서 더 크게 즐기는 응원법을 모았습니다.</p>
      ${subnav}
    </div>
    <section class="fanchant">
      <div class="fanchant-copy">
        <div class="eye">FAN CHANT · 응원법</div>
        <h2>같이 부르면, 더 씨야답게.</h2>
        <p>콘서트에서 함께 외칠 수 있는 씨야 응원법을 한눈에 확인해보세요.</p>
        <a class="fanchant-btn" href="https://seeya-fighting.linkstory.co.kr/" target="_blank" rel="noopener noreferrer">응원법 전용 페이지 →</a>
      </div>
    </section>
    <section class="fanchant-library">
      <div class="fanchant-library-head">
        <div>
          <div class="eye">SEEYA · FAN CHANT VIDEO</div>
          <h2>영상으로 익히는 씨야 응원법</h2>
        </div>
        <p>공연 전에 응원 타이밍과 구호를 영상으로 확인해보세요.</p>
      </div>
      <div style="position:relative;width:100%;aspect-ratio:16/9;overflow:hidden;background:#160d12;border:1px solid var(--line)">
        <iframe
          src="https://www.youtube.com/embed/n_n5s6i_diE?rel=0"
          title="씨야 응원법 YouTube"
          loading="lazy"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowfullscreen
          style="position:absolute;inset:0;width:100%;height:100%;border:0">
        </iframe>
      </div>
      <div class="fanchant-source">
        <a href="https://www.youtube.com/watch?v=n_n5s6i_diE" target="_blank" rel="noopener noreferrer">YouTube에서 보기 ↗</a>
      </div>
    </section>
    <section class="fanchant-library">
      <div class="fanchant-library-head">
        <div>
          <div class="eye">CHEER GUIDE · 12 SONGS</div>
          <h2>응원법 이미지 모아보기</h2>
        </div>
        <p>썸네일을 선택하면 전체 화면으로 확대되며, 좌우 이동·키보드 방향키·모바일 스와이프를 지원합니다.</p>
      </div>
      <div class="fanchant-grid" id="fanChantGrid">${fanChantImages.map((x,i)=>`<button type="button" class="fanchant-image-card" onclick="openFanChantLightbox(${i})" aria-label="${x.title} 응원법 크게 보기"><img src="${x.image}" alt="${x.title} 응원법" loading="lazy"><span class="fanchant-image-label">${x.title}</span></button>`).join("")}</div>
    </section>
    <div class="page-pixel-art" aria-hidden="true"><img src="images/common/seeya-cheer-pixel.png" alt="" loading="lazy"></div>`);
 return W(`<div class="section" style="border:0"><div class="eye">DISCOGRAPHY</div><h1 style="font-size:55px">MUSIC</h1><p class="lead">정규·미니·베스트 앨범을 커버 이미지와 함께 찾아가는 공간입니다.</p>${subnav}</div><div class="albums">${albums.map(a=>`<a class="album" href="${a.url}" target="_blank" rel="noopener noreferrer"><div class="album-cover"><img src="${a.cover}" alt="${a.name} album cover" loading="lazy"></div><div class="album-info"><div class="eye">${a.type}</div><b>${a.name}</b><small>${a.meta}</small><span class="album-link">Melon에서 감상하기 →</span></div></a>`).join("")}</div><div class="notice" style="margin-top:22px">음반 카드를 선택하면 Melon에서 해당 앨범 또는 싱글을 감상할 수 있습니다. 커버 이미지는 외부 원본을 참조하며 저장소에는 복제하지 않습니다.</div>`);
}
module.exports=music;
