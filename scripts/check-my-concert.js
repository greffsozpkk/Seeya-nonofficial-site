'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'..'),read=p=>fs.readFileSync(path.join(root,p),'utf8');
const M=require('../src/shared/my-concert'),P=require('../src/client/my-concert-poster');
const songs=JSON.parse(read('game/my-concert/catalog.json')).songs;
assert(songs.length>=100);assert.equal(new Set(songs.map(s=>s.id)).size,songs.length);
assert(songs.every(s=>s.enabled&&s.title&&s.albumId&&s.albumTitle&&s.artistNames.length));
assert(!songs.some(s=>s.title==='관악산'||/\binst\b/i.test(s.title)));
for(const title of ['깊은 밤을 날아서','처음 그 자리에'])assert.equal(songs.filter(s=>s.title===title).length,1);
assert.equal(M.chars('👨‍👩‍👧‍👦').length,1);assert.equal(M.chars('씨야').length,2);
let d=M.fresh();const first=songs[0].id;
assert.equal(M.count(d),0);assert(M.problems(d).join('').includes('본 무대 1곡'));
d=M.change(d,{type:'add',section:'opening',id:first},songs).draft;
assert.throws(()=>M.change(d,{type:'add',section:'main',id:first},songs),/이미 담긴/);
assert.equal(M.change(d,{type:'add',section:'opening',id:songs[1].id},songs).draft.sections.opening.length,2);
for(let i=1;i<10;i++)d=M.change(d,{type:'add',section:'main',id:songs[i].id},songs).draft;
for(let i=10;i<12;i++)d=M.change(d,{type:'add',section:'encore',id:songs[i].id},songs).draft;
assert.equal(M.count(d),12);assert.deepEqual(M.problems(d),[]);
assert.equal(M.change(d,{type:'move',section:'main',target:'encore',id:songs[1].id},songs).draft.sections.encore.length,3);
const before=JSON.stringify(d),removed=M.change(d,{type:'remove',section:'main',id:songs[1].id},songs).draft;
assert.equal(JSON.stringify(d),before);assert.deepEqual(removed.sections.encore,d.sections.encore);assert.deepEqual(removed.sections.opening,d.sections.opening);
const moved=M.change(removed,{type:'move',section:'encore',target:'main',id:songs[10].id},songs).draft;assert.equal(moved.sections.main.length,9);assert.equal(moved.sections.encore.length,1);
const reordered=M.change(d,{type:'order',section:'main',id:songs[1].id,to:8},songs).draft;assert.equal(reordered.sections.main[8],songs[1].id);assert.deepEqual(reordered.sections.encore,d.sections.encore);
d.title='우리의 씨야 🎤 <script>alert(1)</script>';assert(M.problems(d).length);d.title='별빛 속 우리, 씨야 🎤';d.planner='팬 <b>이름</b>';d.theme='night';
const encoded=M.encode(d),decoded=M.decode(encoded,songs);assert.equal(decoded.title,d.title);assert.equal(decoded.planner,d.planner);assert.deepEqual(decoded.sections,d.sections);assert.equal(decoded.theme,d.theme);
for(const bad of [{...d,theme:'javascript:alert(1)'},{...d,schema:999},{...d,title:'a'.repeat(31)},{...d,planner:'a'.repeat(21)},{...d,sections:{...d.sections,main:[first,...d.sections.main.slice(1)]}},{...d,sections:{...d.sections,opening:['unknown']}}])assert.throws(()=>M.validate(bad,songs,true));
for(const text of ['!!','e30','x'.repeat(9000)])assert.throws(()=>M.decode(text,songs));
const broken={...d,schema:0,sections:{...d.sections,main:['missing',...d.sections.main]}};const recovered=M.restore(JSON.stringify(broken),songs);assert(recovered.issues.length);assert.deepEqual(recovered.draft.sections.main,d.sections.main);
assert.throws(()=>M.restore('{broken',songs));assert.equal(M.filter(songs,'  sTaY  ','group','all')[0].title,'Stay');
assert(M.filter(songs,'','gyuri','all').every(s=>s.memberId==='gyuri'));
assert.equal(M.filter(songs,'','gyuri','not-an-album').length,0);
// Poster uses measured full text, never ellipses. Stress the maximum metadata and long titles.
const drawn=[];const ctx={font:'',measureText(s){return {width:M.chars(s).length*(Number(this.font.match(/(\d+)px/)?.[1])||20)*.9};},fillText(s,x,y){drawn.push({s,x,y});},createLinearGradient(){return {addColorStop(){}};},createRadialGradient(){return {addColorStop(){}};},fillRect(){},strokeRect(){},setLineDash(){},beginPath(){},moveTo(){},lineTo(){},stroke(){},save(){},translate(){},scale(){},restore(){}};
const canvas={getContext:()=>ctx};const longSongs=songs.map(s=>({...s,title:'아주 길고 긴 노래 제목과 함께 떠나는 우리들의 꿈같은 무대 (Special Live Version)'}));
d.title='별'.repeat(29)+'👨‍👩‍👧‍👦';d.planner='팬'.repeat(20);
for(const theme of ['rose','night']){d.theme=theme;drawn.length=0;const result=P.draw(canvas,d,longSongs);assert.equal(canvas.width,1080);assert.equal(canvas.height,1350);assert.equal(result.rows.length,12);assert(result.rows.every(r=>r.bottom<1215));assert(!drawn.some(x=>x.s.includes('…')));for(const row of result.rows)assert(row.lines.join(' ').includes('Special Live Version'));assert(drawn.some(x=>x.s.includes('팬이 만든 가상 콘서트')));}
// A short show, a full bill and a legacy link all use the same editor.
const full=M.fresh();let index=0;
for(const s of M.SECTIONS){
 for(let j=0;j<s.limit;j++)full.sections[s.id].push(songs[index++].id);
 assert.throws(()=>M.change(full,{type:'add',section:s.id,id:songs[50].id},songs),/가득/);
}
assert.equal(index,32);assert.deepEqual(M.problems(full),[]);
full.vcrs=[{mode:'link',after:31,value:'nn639JifcBQ'}];
assert.deepEqual(M.decode(M.encode(full),songs).vcrs,full.vcrs);
const large=P.draw(canvas,full,songs);assert.equal(large.rows.length,32);assert(large.rows.at(-1).bottom<large.height-120);
const design=require('../src/shared/my-concert-design');
for(const [theme,style] of Object.entries(design.themes)){
 for(const font of Object.keys(design.fonts)){
  full.theme=theme;full.font=font;full.title='공'.repeat(30);full.planner='팬'.repeat(20);
  full.vcrs=Array.from({length:31},(_,i)=>({mode:'link',after:i+1,value:'nn639JifcBQ'}));
  const poster=P.draw(canvas,full,longSongs);
  assert.equal(poster.height,1350);assert.equal(poster.rows.length,32);
  assert(poster.rows.every(row=>row.bottom<=style.bottom));
  assert.deepEqual(poster.rows.map(r=>r.id),M.SECTIONS.flatMap(s=>full.sections[s.id]));
  assert.equal(M.decode(M.encode(full),songs).font,font);
 }
}
const small=M.fresh();M.SECTIONS.forEach((s,i)=>small.sections[s.id]=[songs[i].id]);assert.deepEqual(M.problems(small),[]);
for(const [theme,style] of Object.entries(design.themes)){
 small.theme=theme;
 const short=P.draw(canvas,small,songs);
 assert.equal(short.columns,1);assert.equal(short.height,1350);
 assert(Math.abs(short.rows[0].left+short.rows[0].width/2-(style.left+style.right)/2)<1);
 full.theme=theme;full.format='long';
 const readable=P.draw(canvas,full,longSongs);
 assert.equal(readable.fontSize,40);assert.equal(readable.columns,1);assert(readable.height>1350);
 assert.equal(readable.rows.length,32);assert(readable.rows.every(r=>r.bottom<=readable.contentBottom));
 assert.equal(M.decode(M.encode(full),songs).format,'long');
}
assert.throws(()=>M.validate({...full,format:'unknown'},songs,true));
const legacyFormat={...full};delete legacyFormat.format;assert.equal(M.validate(legacyFormat,songs,true).draft.format,'poster');
assert.equal(require('../src/shared/my-concert-show').performanceVideos('group-track-013')[0].videoId,'uYp15-zFr4M');
small.sections.encore=[];assert(M.problems(small).length);assert.throws(()=>M.decode(M.encode(small),songs));
const oldShare={...d,schema:2,vcrs:[{mode:'fixed',after:10,value:'rrMkSeKS4eM'}]};
assert.equal(M.validate(oldShare,songs,true).draft.vcrs[0].after,10);
const S=require('../src/shared/my-concert-show');
assert.equal(S.youtubeId('https://youtu.be/nn639JifcBQ?t=5'),'nn639JifcBQ');
assert.equal(S.youtubeId('https://www.youtube.com/shorts/nn639JifcBQ'),'nn639JifcBQ');
assert.equal(S.youtubeId('https://youtube.com.evil.test/watch?v=nn639JifcBQ'),'');
const html=read('game/my-concert/test/index.html');assert(html.includes('noindex,nofollow'));assert(!html.includes('googletagmanager'));assert(!read('game/index.html').includes('/game/my-concert/'));assert(read('game/test/index.html').includes('/game/my-concert/test/'));assert(!read('sitemap.xml').includes('/game/my-concert/'));
for(const f of ['build.yml','update-news.yml'])assert(read('.github/workflows/'+f).includes('game/my-concert/catalog.json'));
console.log(`PASS my concert: ${songs.length} researched tracks, variable section limits, duplicates/moves/order, graphemes, strict share validation, damaged draft recovery, filters, 1080x1350 full-text posters and unlisted routing.`);
