const {albums,history,tarot,TODAY_SONGS,TODAY_MOODS,fanChantImages,archiveTypes,W,esc,archivePageItems,archiveSearchText,galleryCard,pickTodayMoment,newsDateParts}=require('../shared/common');
const {newsList,galleryMoment,archiveView}=require('../shared/views');
function todayPickSong(mood,random=Math.random){
  const pool=TODAY_SONGS.filter(x=>(x.moods||[]).includes(mood));
  return pool[Math.floor(random()*pool.length)]||TODAY_SONGS[Math.floor(random()*TODAY_SONGS.length)];
}
function todayRelatedSongs(song,mood,random=Math.random){
  const pool=TODAY_SONGS.filter(x=>x.song!==song.song&&(x.moods||[]).includes(mood));
  const shuffled=[...pool].sort(()=>random()-.5);
  return shuffled.slice(0,2).map(x=>x.song);
}
function todayBlock(now=new Date(),random=Math.random){
  const d=now;
  const keys=Object.keys(TODAY_MOODS);
  const todayRandomMood=keys[Math.floor(random()*keys.length)];
  const f=TODAY_MOODS[todayRandomMood];
  const s=todayPickSong(todayRandomMood,random);
  const related=todayRelatedSongs(s,todayRandomMood,random);
  return `<div class="today-fortune">
    <section class="fortune-main">
      <div class="eye">TODAY'S FORTUNE · ${d.getFullYear()}.${String(d.getMonth()+1).padStart(2,"0")}.${String(d.getDate()).padStart(2,"0")}</div>
      <h2>${f.title}</h2>
      <p class="fortune-note">${f.text}</p>
      <div class="fortune-keywords">${f.keywords.map(x=>`<span>${x}</span>`).join("")}</div>
    </section>
    <section class="fortune-song">
      <div class="eye">SONG FOR TODAY · ${TODAY_SONGS.length} TRACKS</div>
      <h3>♪ ${s.song}</h3>
      <div class="song-album-info">${s.album} · ${s.scope}</div>
      <p>${f.message}</p>
      <a class="melon-song-link" href="${s.url}" target="_blank" rel="noopener noreferrer">${s.linkLabel} →</a>
      <div class="related-song-line"><b>같이 들으면 좋은 곡</b><span>${related.join(" · ")}</span></div>
    </section>
    <section class="fortune-guide">
      <div class="mini-fortune"><b>오늘의 한마디</b><span>${f.detail}</span></div>
      <div class="mini-fortune"><b>오늘의 키워드</b><span>${f.keywords.join(" · ")}</span></div>
      <div class="notice">오늘의 운세와 추천곡은 재미로 즐기는 팬 콘텐츠입니다. 씨야 그룹곡, 주요 프로젝트·OST와 최근 멤버 솔로곡 중 오늘의 분위기와 맞는 곡을 무작위로 추천하며 사용자 정보는 저장하지 않습니다.</div>
    </section>
  </div>`;
}
function today(now,random){return W(`<div class="section" style="border:0"><div class="eye">DAILY SEEYA</div><h1 style="font-size:55px">TODAY'S SEEYA</h1><p class="lead">오늘의 흐름을 가볍게 읽고, 그 기분에 어울리는 씨야와 멤버들의 노래를 한 곡 추천합니다.</p></div>${todayBlock(now,random)}<div class="page-pixel-art" aria-hidden="true"><img src="images/today/seeya-today-pixel.png" alt="" loading="lazy"></div>`)}
module.exports=today;
