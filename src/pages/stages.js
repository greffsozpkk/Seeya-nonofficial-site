const {W,esc}=require('../shared/common');
const nav=require('../shared/music-nav');
const {songs,songPath,performances}=require('../shared/stage-data');
const site=require('../data/site.json');
module.exports=function stages(route,archive){
 const cards=songs.map(song=>({...song,count:performances(archive,song.id,site.snapshotDate.slice(0,10)).length}));
 return W(`<section class="stage-heading"><div class="eye">MUSIC · LIVE ARCHIVE</div><h1>MUSIC</h1><p class="lead">좋아하는 한 곡으로,<br>씨야가 노래했던 순간들을 만나보세요.</p>${nav('stages')}</section>
 <section class="stage-browser" data-stage-browser="catalog" data-page-size="12" aria-label="곡별 무대 모아보기">
 <div class="stage-intro"><div><span class="eye">SONG COLLECTION</span><h2>곡별 무대 모아보기</h2></div><p>${songs.length}곡으로 시작하는 무대 기록</p></div>
 <form class="stage-controls" role="search"><label class="stage-search">곡·앨범 찾기<input type="search" name="q" placeholder="곡명이나 앨범명을 입력하세요" autocomplete="off"></label><label>앨범<select name="album"><option value="all">모든 앨범</option>${[...new Set(songs.map(s=>s.album))].map(a=>`<option value="${esc(a)}">${esc(a)}</option>`).join('')}</select></label><label>정렬<select name="sort"><option value="release">최신 발매순</option><option value="oldest">오래된 발매순</option><option value="name">가나다순</option><option value="count">무대 많은순</option></select></label></form>
 <p class="stage-result" role="status" aria-live="polite">${cards.length}곡</p>
 <div class="stage-song-grid">${cards.sort((a,b)=>b.release.localeCompare(a.release)||a.name.localeCompare(b.name,'ko')).map(s=>`<a class="stage-song-card" href="${songPath(s)}" data-stage-item data-name="${esc(s.name)}" data-search="${esc([s.name,s.album,...s.aliases].join(' '))}" data-album="${esc(s.album)}" data-date="${s.release}" data-count="${s.count}"><div class="stage-album-art"><span>SEEYA</span><img src="${esc(s.cover)}" alt="" loading="lazy" onerror="this.remove()"><b>무대 ${s.count}</b></div><div class="stage-song-copy"><small>${esc(s.release.slice(0,4))} · SEEYA</small><h3>${esc(s.name)}</h3><p>${esc(s.album)}</p><span class="stage-card-go">무대 모아보기 <span aria-hidden="true">↗</span></span></div></a>`).join('')}</div>
 <div class="stage-empty" hidden><h3>찾는 곡이 아직 없어요.</h3><p>다른 검색어로 찾아보거나 필터를 초기화해보세요.</p><button type="button" data-stage-reset>전체 곡 보기</button></div>
 <nav class="stage-pagination" aria-label="곡 목록 페이지" hidden></nav>
 <p class="stage-footnote">기존 아카이브에서 곡과 영상의 연결을 정리한 목록입니다.<br>한 무대의 여러 영상은 카드 하나에 모으고, 예정된 행사는 제외했습니다.<br><a href="/archive/concerts/">공연별로 보고 싶다면, 콘서트 기록관 →</a></p>
 <noscript><p>모든 곡을 표시하고 있습니다. 검색과 페이지 이동은 JavaScript를 켜면 사용할 수 있습니다.</p></noscript></section>`);
};
