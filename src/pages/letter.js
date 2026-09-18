const {esc}=require('../shared/common');
const letter=require('../data/letter.json');
const heart='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true"><path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8L12 21l8.8-8.6a5.5 5.5 0 0 0 0-7.8Z"/></svg>';
module.exports=function(){
 return `<div id="seeya-makers-letter">
  <section class="letter-page" aria-labelledby="letter-greeting">
    <div class="letter-page-heading"><span>A LETTER FOR YOU · 제작자의 편지</span></div>
    <article class="letter-paper" aria-labelledby="letter-greeting">
      <div class="letter-tape" aria-hidden="true"></div>
      <header class="letter-paper-header">
        <div class="letter-date"><span>FROM. SEEYA ARCHIVE</span><time datetime="${esc(letter.date)}">${esc(letter.dateLabel)}</time></div>
        <div class="letter-postmark" aria-hidden="true"><span>SEE YOU</span>${heart}<span>ALWAYS</span></div>
      </header>
      <h1 id="letter-greeting">${esc(letter.greeting)}</h1>
      <div class="letter-writing">${letter.paragraphs.map(lines=>`<p>${lines.map(esc).join('<br> ')}</p>`).join('\n')}</div>
      <footer class="letter-signature"><div>${esc(letter.signature)}</div>${heart}</footer>
      <div class="letter-paper-bottom" aria-hidden="true"><span>SEEYA ARCHIVE</span><span>01</span></div>
    </article>
    <footer class="letter-contact"><span>답장을 보내고 싶다면</span><a href="https://www.instagram.com/seeya_archive_fanpage/" target="_blank" rel="noopener noreferrer" aria-label="제작자에게 연락하기 · 인스타그램 (새 창)"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none"/></svg>제작자에게 연락하기 <span aria-hidden="true">↗</span></a></footer>
    <div class="letter-return"><a href="/">홈으로 돌아가기</a></div>
  </section>
 </div>`;
};
