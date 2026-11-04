'use strict';
const Show=require('../shared/my-concert-show');
const M=require('../shared/my-concert');
module.exports=function specials({root,$,esc,getDraft,getSongs,getTarget,apply,announce}){
 const dialog=$('mcSpecial'),fields=$('mcSpecialFields');
 let kind,slot,vIndex,selectedVideo,page=1;
 const pageSize=6;
 function options(items,selected){return items.map(([v,name])=>'<option value="'+esc(v)+'"'+(v===selected?' selected':'')+'>'+esc(name)+'</option>').join('');}
 function durationLabel(seconds){
  if(!Number.isInteger(seconds)||seconds<=0)return '길이 미확인';
  const mins=Math.floor(seconds/60);
  return (mins>=60?Math.floor(mins/60)+':'+String(mins%60).padStart(2,'0'):mins)+':'+String(seconds%60).padStart(2,'0');
 }
 function filterSongs(){
  const query=$('mcCandidateSearch').value.trim().toLocaleLowerCase(),artist=$('mcCandidateArtist').value;
  let visible=0;
  for(const label of fields.querySelectorAll('[data-candidate-artist]')){
   label.hidden=!!((artist&&label.dataset.candidateArtist!==artist)||!label.textContent.toLocaleLowerCase().includes(query));
   if(!label.hidden)visible++;
  }
  $('mcCandidateMatches').textContent=visible?'검색 결과 '+visible+'곡':'일치하는 후보곡이 없어요.';
 }
 function renderVcr(){
  const query=$('mcVcrSearch').value.trim().toLocaleLowerCase(), channel=$('mcBrowseChannel').value;
  const type=$('mcBrowseType').value;
  const list=Show.vcrLibrary.filter(v=>(!type||Show.vcrType(v)===type)&&(!channel||channel===v.channelId)&&[v.title,v.channel,Show.media.channels[v.channelId]].join(' ').toLocaleLowerCase().includes(query));
  const pages=Math.max(1,Math.ceil(list.length/pageSize));
  page=Math.min(pages,Math.max(1,page));
  $('mcVcrMatches').textContent=list.length+'편'+(list.length?' · '+page+' / '+pages+' 페이지':'');
  $('mcVcrList').innerHTML=list.slice((page-1)*pageSize,page*pageSize).map(v=>'<button type="button" class="mc-vcr-choice" data-video="'+v.videoId+'" aria-pressed="'+(v.videoId===selectedVideo)+'"><img src="https://i.ytimg.com/vi/'+v.videoId+'/mqdefault.jpg" alt="" loading="lazy"><span><small>'+esc(v.channel)+' · '+Show.vcrTypes[Show.vcrType(v)]+' · '+durationLabel(v.duration)+'</small><strong>'+esc(v.title)+'</strong></span><i aria-hidden="true">'+(v.videoId===selectedVideo?'✓':'')+'</i></button>').join('')||'<p>검색 결과가 없어요. 다른 제목이나 채널을 골라주세요.</p>';
  $('mcVcrPrev').disabled=page===1;$('mcVcrNext').disabled=page===pages;
  $('mcVcrNav').hidden=pages<=1;
  const selected=Show.media.vcr.find(v=>v.videoId===selectedVideo);
  $('mcVcrSelected').textContent=selected?'선택한 영상 · '+selected.title:'VCR에 담을 영상을 선택해 주세요.';
 }
 function displayChoices(){
  const mode=$('mcMode').value;
  fields.querySelectorAll('[data-for]').forEach(el=>el.hidden=el.dataset.for!==mode);
  if(kind==='vcr'&&mode==='random'){
   const n=Show.randomVcrs($('mcChannel').value,$('mcRandomType').value).length;
   $('mcRandomCount').textContent=n?'추첨 후보 '+n+'편':'후보가 없어요. 다른 채널이나 유형을 선택해 주세요.';
  }
  if(kind==='hidden'){
   const range=readRange();
   $('mcCandidateCount').textContent='현재 후보 '+Show.candidates(range,getSongs()).length+'곡';
  }
 }
 function readRange(){
  const mode=$('mcMode').value;
  if(mode==='album')return {mode,album:$('mcHiddenAlbum').value};
  if(mode==='custom')return {mode,ids:[...fields.querySelectorAll('input:checked')].map(x=>x.value)};
  return {mode};
 }
 function open(type,id=null,index=null,gap=1){
  kind=type;slot=id;vIndex=index;const d=getDraft();
  $('mcSpecialError').textContent='';$('mcSpecialTitle').textContent=type==='hidden'?'히든 스테이지 설정':'VCR 설정';
  if(type==='hidden'){
   const range=d.hidden?.[id]||{mode:'all'},songs=getSongs(),albums=new Map(songs.map(s=>[s.albumId,s.albumTitle]));
   const destination=M.find(d,id)?.id||getTarget();
   const selected=d.sections[destination].length<M.SECTIONS.find(s=>s.id===destination).limit||id?destination:M.SECTIONS.find(s=>d.sections[s.id].length<s.limit)?.id;
   fields.innerHTML='<label>담을 구간<select id="mcDestination">'+M.SECTIONS.map(s=>'<option value="'+s.id+'"'+(selected===s.id?' selected':'')+(d.sections[s.id].length>=s.limit&&(!id||s.id!==destination)?' disabled':'')+'>'+s.ko+' · '+d.sections[s.id].length+' / '+s.limit+'</option>').join('')+'</select></label><label>추첨 범위<select id="mcMode">'+options([['all','전체 랜덤'],['album','앨범별 랜덤'],['custom','직접 고른 곡 중 랜덤']],range.mode)+'</select></label><label data-for="album">앨범<select id="mcHiddenAlbum">'+options([...albums],range.album)+'</select></label><div data-for="custom"><div class="mc-vcr-filters"><label>후보 검색<input type="search" id="mcCandidateSearch" placeholder="곡명, 아티스트 또는 앨범"></label><label>아티스트<select id="mcCandidateArtist">'+options([['','전체 아티스트'],...[...new Set(Show.checkedSongs(songs).map(s=>s.artistNames.join(' · ')))].map(a=>[a,a])],'')+'</select></label></div><p id="mcCandidateMatches" role="status"></p><fieldset class="mc-candidates"><legend>후보곡 선택</legend>'+Show.checkedSongs(songs).map(s=>'<label data-candidate-artist="'+esc(s.artistNames.join(' · '))+'"><input type="checkbox" value="'+esc(s.id)+'"'+(range.ids?.includes(s.id)?' checked':'')+'> <span><strong>'+esc(s.title)+'</strong><small>'+esc(s.artistNames.join(' · '))+' · '+esc(s.albumTitle)+'</small></span></label>').join('')+'</fieldset></div><p id="mcCandidateCount"></p>';
   filterSongs();
  }else{
   const v=d.vcrs?.[index]||{mode:'fixed',after:gap},media=Show.media;
   fields.innerHTML='<label>위치<select id="mcGap">'+options(Array.from({length:Math.max(0,M.count(d)-1)},(_,i)=>[i+1,(i+1)+'번 노래 뒤 · '+(i+2)+'번 노래 앞']),v.after)+'</select></label><label>영상 선택<select id="mcMode">'+options([['fixed','직접 선택'],['random','채널에서 랜덤'],['link','YouTube 링크 입력']],v.mode)+'</select></label><div data-for="fixed"><div class="mc-vcr-filters"><label>영상 검색<input type="search" id="mcVcrSearch" placeholder="제목 또는 채널명"></label><label>채널<select id="mcBrowseChannel">'+options([['','전체 채널'],...Object.entries(media.channels)],'')+'</select></label><label>유형<select id="mcBrowseType">'+options([['','전체 유형'],...Object.entries(Show.vcrTypes)],'')+'</select></label></div><p id="mcVcrMatches" aria-live="polite"></p><div id="mcVcrList"></div><nav id="mcVcrNav" aria-label="VCR 목록 페이지"><button type="button" id="mcVcrPrev" data-vpage="-1">이전</button><button type="button" id="mcVcrNext" data-vpage="1">다음</button></nav><p id="mcVcrSelected" role="status"></p></div><label data-for="link">YouTube 영상 주소<input id="mcVideoLink" type="url" placeholder="https://youtu.be/…" value="'+(v.mode==='link'?'https://youtu.be/'+esc(v.value):'')+'"></label><label data-for="random">채널<select id="mcChannel">'+options([['all','전체 채널'],...Object.entries(media.channels)],v.value)+'</select></label><div data-for="random"><label>랜덤 유형<select id="mcRandomType">'+options([['recommended','전체 (홍보·예고 제외)'],...Object.entries(Show.vcrTypes)],v.type||'recommended')+'</select></label><p id="mcRandomCount" role="status"></p></div>';
  }
  dialog.classList.toggle('mc-vcr-dialog',type==='vcr');
  if(type==='vcr'){selectedVideo=vIndex!==null&&d.vcrs[vIndex].mode==='fixed'?d.vcrs[vIndex].value:'';page=Math.max(1,1+Math.floor(Show.vcrLibrary.findIndex(v=>v.videoId===selectedVideo)/pageSize));renderVcr();if(M.count(d)<2)$('mcSpecialError').textContent='노래를 두 곡 이상 담으면 그 사이에 VCR을 넣을 수 있어요.';}
  displayChoices();dialog.showModal();
 }
 fields.addEventListener('input',event=>{if(event.target.id==='mcCandidateSearch')filterSongs();if(event.target.id==='mcVcrSearch'){page=1;renderVcr();}});
 fields.addEventListener('change',event=>{
  if(event.target.id==='mcCandidateArtist')filterSongs();
  if(['mcBrowseChannel','mcBrowseType'].includes(event.target.id)){page=1;renderVcr();}else displayChoices();
 });
 fields.addEventListener('click',event=>{
  const b=event.target.closest('button');if(!b)return;
  if(b.dataset.vpage){page+=Number(b.dataset.vpage);renderVcr();$('mcVcrList').querySelector('button')?.focus();}
  if(b.dataset.video){selectedVideo=b.dataset.video;renderVcr();$('mcVcrList').querySelector('[aria-pressed="true"]')?.focus();}
 });
 function commit(){
  const d=JSON.parse(JSON.stringify(getDraft()));
  if(kind==='hidden'){
   const dest=$('mcDestination').value, section=d.sections[dest];
   if(!section)throw Error('빈자리가 있는 구간을 선택해 주세요.');
   const max=M.SECTIONS.find(s=>s.id===dest).limit;
   if(!slot&&section.length>=max)throw Error('선택한 구간이 가득 찼어요. 추가할 구간을 바꿔주세요.');
   let id=slot;
   if(!id){let n=1;while(d.hidden['hidden-'+n])n++;id='hidden-'+n;section.push(id);}
   if(slot && !section.includes(id)){if(section.length>=max)throw Error('선택한 구간이 가득 찼어요.');const from=M.find(d,id);d.sections[from.id].splice(d.sections[from.id].indexOf(id),1);section.push(id);}
   Show.alignVcrs(getDraft(),d);
   d.hidden[id]=Show.config(readRange(),getSongs());
  }else{
   const mode=$('mcMode').value;
   if(!$('mcGap').value)throw Error('먼저 노래를 두 곡 이상 담아 주세요.');
   const value=mode==='link'?Show.youtubeId($('mcVideoLink').value):mode==='fixed'?selectedVideo:$('mcChannel').value;
   if(!value)throw Error(mode==='link'?'개별 YouTube 영상 주소를 확인해 주세요.':'영상을 선택해 주세요.');
   const type=mode==='random'?$('mcRandomType').value:undefined;
   if(mode==='random'&&!Show.randomVcrs(value,type).length)throw Error('선택한 채널과 유형에 맞는 영상이 없어요.');
   const next=Show.vcrConfig({after:Number($('mcGap').value),mode,value,type});
   if(vIndex===null)d.vcrs.push(next);else d.vcrs[vIndex]=next;
  }
  Show.session(d,getSongs(),()=>0.5);
  apply(d,kind==='hidden'?$('mcDestination').value:null);dialog.close();announce('공연 구성을 저장했어요.');
 }
 root.addEventListener('click',event=>{
  const b=event.target.closest('button');if(!b)return;
  try{
   if(b.dataset.special==='hidden')open('hidden',b.dataset.slot||null);
   if(b.dataset.special==='vcr')open('vcr',null,b.dataset.vindex===undefined?null:Number(b.dataset.vindex),Number(b.dataset.gap)||1);
   if(b.dataset.special==='save')commit();
   if(b.dataset.special==='cancel')dialog.close();
   if(b.dataset.special==='deleteVcr'||b.dataset.special==='upVcr'){
    const d=JSON.parse(JSON.stringify(getDraft())),index=Number(b.dataset.vindex);
    if(b.dataset.special==='deleteVcr')d.vcrs.splice(index,1);
    else{let prev=index-1;while(prev>=0&&d.vcrs[prev].after!==d.vcrs[index].after)prev--;if(prev>=0)[d.vcrs[index],d.vcrs[prev]]=[d.vcrs[prev],d.vcrs[index]];}
    apply(d);
   }
  }catch(e){$('mcSpecialError').textContent=e.message;announce(e.message);}
 });
 function gapRows(d,number){
  if(number>=M.count(d) && !d.vcrs?.some(v=>v.after===number))return '';
  const rows=(d.vcrs||[]).map((v,i)=>({v,i})).filter(x=>x.v.after===number);
  return rows.map(({i},n)=>'<li class="mc-interlude" draggable="true" data-vcr="'+i+'"><span class="mc-grip" title="잡아서 순서 바꾸기" aria-hidden="true">⠿</span><strong>VCR 재생</strong> <button data-special="vcr" data-vindex="'+i+'">설정·위치</button> '+(n?'<button data-special="upVcr" data-vindex="'+i+'">위로</button> ':'')+'<button data-special="deleteVcr" data-vindex="'+i+'">삭제</button></li>').join('')+'<li class="mc-vcr-add"><button data-special="vcr" data-gap="'+number+'">+ VCR 추가</button></li>';
 }
 return {gapRows};
};
