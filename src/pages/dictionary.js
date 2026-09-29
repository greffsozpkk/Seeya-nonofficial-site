const entries=require('../data/dictionary.json');
const {esc}=require('../shared/common');
const kinds={member:'멤버 사용 표현',official:'공식 이름',fan:'팬 별명·용어',activity:'방송·활동명'};
const searchText=e=>[e.term,...e.aliases,...e.members,e.meaning,...e.context].join(' ').normalize('NFKC').toLowerCase();
function dictionary(){return `<div class="dictionary-page">
  <header class="dictionary-hero"><div class="eye">SEEYA DICTIONARY</div><h1>씨야사전</h1><p class="lead">알고 나면, 더 재미있는 씨야의 말들.</p><p>영상 속 익숙한 호칭부터 채널 이름까지.<br>한 표현에서 다음 이야기로 이어가 보세요.</p></header>
  <nav class="dictionary-nav" aria-label="입문 가이드 메뉴"><a href="/guide/">입문 가이드</a><a href="/guide/dictionary/" aria-current="page">씨야사전</a></nav>
  <div class="dictionary-note">멤버 사용 표현·공식 이름·방송 활동명·팬 별명을 구분해 기록합니다.<br>옛 별명은 <a href="https://gall.dcinside.com/board/view/?id=seeya&amp;no=207233" target="_blank" rel="noopener noreferrer">2020년 씨야 갤러리 단어장</a>의 설명을 바탕으로 정리했습니다. 당시 팬들의 표현과 일화로 읽어주세요.</div>
  <form class="dictionary-tools" id="dictionaryTools" role="search" hidden>
    <div><label for="dictionarySearch">어떤 표현이 궁금한가요?</label><input type="search" id="dictionarySearch" placeholder="표현 또는 멤버 이름으로 찾기" autocomplete="off"></div>
    <div><label for="dictionaryMember">멤버</label><select id="dictionaryMember"><option value="">전체 멤버</option><option>남규리</option><option>김연지</option><option>이보람</option></select></div>
    <button type="reset">초기화</button>
  </form>
  <div class="dictionary-index"><p id="dictionaryCount" role="status" aria-live="polite">${entries.length}개의 표현</p><details class="dictionary-jump"><summary>전체 표현 빠르게 찾기</summary><nav aria-label="표현 바로가기">${entries.map(e=>`<a href="/guide/dictionary/#${esc(e.id)}">${esc(e.term)}</a>`).join('')}</nav></details></div>
  <section class="dictionary-entries" aria-label="씨야사전 표현 목록">${entries.map((e,i)=>`<details class="dictionary-entry" id="${esc(e.id)}" data-search="${esc(searchText(e))}" data-members="${esc(e.members.join('|'))}">
    <summary><span class="dictionary-number" aria-hidden="true">${String(i+1).padStart(2,'0')}</span><span class="dictionary-word"><strong>${esc(e.term)}</strong><small>${esc(e.members.join(' · '))}</small></span><span class="dictionary-meaning">${esc(e.meaning)}</span><span class="dictionary-plus" aria-hidden="true">+</span></summary>
    <div class="dictionary-detail"><span class="dictionary-kind">${esc(kinds[e.kind])}</span>${e.aliases.length?`<span class="dictionary-alias">함께 쓰는 말 · ${e.aliases.map(esc).join(' / ')}</span>`:''}${e.sourcePeriod?`<p class="dictionary-period">${esc(e.sourcePeriod)}</p>`:''}
      <h2>어떤 말인가요?</h2><p>${esc(e.meaning)}</p>
      <h2>이런 맥락에서 만나요</h2>${e.context.map(p=>`<p>${esc(p)}</p>`).join('')}
      <h2>관련 영상 · 게시물</h2><ul class="dictionary-sources">${e.sources.map(s=>`<li><a href="${esc(s.url)}" target="_blank" rel="noopener noreferrer">${esc(s.label)}<span>${esc(s.action)} <span aria-hidden="true">↗</span><span class="dictionary-sr"> (새 탭)</span></span></a></li>`).join('')}</ul>
      <div class="dictionary-related"><h2>함께 알아두면 좋은 표현</h2>${e.related.map(id=>`<a href="/guide/dictionary/#${esc(id)}">${esc(entries.find(x=>x.id===id).term)}</a>`).join('')}</div>
      <a class="dictionary-permalink" href="/guide/dictionary/#${esc(e.id)}">이 표현 바로가기</a>
    </div></details>`).join('')}</section>
  <div id="dictionaryEmpty" class="dictionary-empty" hidden><h2>아직 담지 못한 표현이에요.</h2><p>다른 표현이나 멤버 이름으로 찾아보세요.</p><button type="button" id="dictionaryClear">전체 표현 보기</button></div>
  <p class="dictionary-footnote">확인된 영상과 게시물을 바탕으로, 씨야의 표현을 한 장씩 더해갑니다.</p>
  </div>`;}
module.exports=dictionary;
