'use strict';
const Show=require('../shared/my-concert-show');
const M=require('../shared/my-concert');
module.exports=function specials({root,$,esc,getDraft,getSongs,getTarget,apply,announce}){
 const dialog=$('mcSpecial'),fields=$('mcSpecialFields');
 let kind,slot,vIndex;
 function options(items,selected){return items.map(([v,name])=>'<option value="'+esc(v)+'"'+(v===selected?' selected':'')+'>'+esc(name)+'</option>').join('');}
 function filterVcr(selected){
  const query=$('mcVcrSearch').value.trim().toLowerCase();
  const list=Show.media.vcr.filter(v=>[v.title,v.channel,Show.media.channels[v.channelId]].join(' ').toLowerCase().includes(query));
  $('mcFixed').innerHTML=options(list.map(v=>[v.videoId,v.title]),selected);
  $('mcVcrMatches').textContent=list.length+'편';
}
 function displayChoices(){
  const mode=$('mcMode').value;
  fields.querySelectorAll('[data-for]').forEach(el=>el.hidden=el.dataset.for!==mode);
  if(kind==='vcr' && mode==='fixed'){
   const v=Show.media.vcr.find(v=>v.videoId===$('mcFixed').value);
   $('mcVcrPreview').innerHTML=v?'<img alt="" src="https://i.ytimg.com/vi/'+v.videoId+'/mqdefault.jpg"><span>'+esc(v.channel)+' · '+(v.duration?Math.floor(v.duration/60)+':'+String(v.duration%60).padStart(2,'0'):'채널 영상')+'</span>':'';
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
   fields.innerHTML='<label>담을 구간<select id="mcDestination">'+M.SECTIONS.map(s=>'<option value="'+s.id+'"'+(selected===s.id?' selected':'')+(d.sections[s.id].length>=s.limit&&(!id||s.id!==destination)?' disabled':'')+'>'+s.ko+' · '+d.sections[s.id].length+' / '+s.limit+'</option>').join('')+'</select></label><label>추첨 범위<select id="mcMode">'+options([['all','전체 랜덤'],['album','앨범별 랜덤'],['custom','직접 고른 곡 중 랜덤']],range.mode)+'</select></label><label data-for="album">앨범<select id="mcHiddenAlbum">'+options([...albums],range.album)+'</select></label><fieldset class="mc-candidates" data-for="custom"><legend>후보곡 선택</legend>'+Show.checkedSongs(songs).map(s=>'<label><input type="checkbox" value="'+esc(s.id)+'"'+(range.ids?.includes(s.id)?' checked':'')+'> '+esc(s.title)+'</label>').join('')+'</fieldset><p id="mcCandidateCount"></p>';
  }else{
   const v=d.vcrs?.[index]||{mode:'fixed',after:gap},media=Show.media;
   fields.innerHTML='<label>위치<select id="mcGap">'+options(Array.from({length:Math.max(0,M.count(d)-1)},(_,i)=>[i+1,(i+1)+'번 노래 뒤 · '+(i+2)+'번 노래 앞']),v.after)+'</select></label><label>영상 선택<select id="mcMode">'+options([['fixed','직접 선택'],['random','채널에서 랜덤'],['link','YouTube 링크 입력']],v.mode)+'</select></label><div data-for="fixed"><label>공식 채널 영상 검색<input type="search" id="mcVcrSearch" placeholder="제목 또는 채널명"></label><span id="mcVcrMatches"></span><label>영상<select id="mcFixed">'+options(media.vcr.map(x=>[x.videoId,x.title]),v.value)+'</select></label><div id="mcVcrPreview"></div></div><label data-for="link">YouTube 영상 주소<input id="mcVideoLink" type="url" placeholder="https://youtu.be/…" value="'+(v.mode==='link'?'https://youtu.be/'+esc(v.value):'')+'"></label><label data-for="random">채널<select id="mcChannel">'+options([['all','전체 채널'],...Object.entries(media.channels)],v.value)+'</select></label>';
  }
  if(type==='vcr'){filterVcr(vIndex===null?'':d.vcrs[vIndex].value);if(M.count(d)<2)$('mcSpecialError').textContent='노래를 두 곡 이상 담으면 그 사이에 VCR을 넣을 수 있어요.';}
  displayChoices();dialog.showModal();
 }
 fields.addEventListener('input',event=>{if(event.target.id==='mcVcrSearch'){filterVcr($('mcFixed').value);displayChoices();}});
 fields.addEventListener('change',displayChoices);
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
   const value=mode==='link'?Show.youtubeId($('mcVideoLink').value):$(mode==='fixed'?'mcFixed':'mcChannel').value;
   if(!value)throw Error(mode==='link'?'개별 YouTube 영상 주소를 확인해 주세요.':'영상을 선택해 주세요.');
   const next=Show.vcrConfig({after:Number($('mcGap').value),mode,value});
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
  return rows.map(({i},n)=>'<li class="mc-interlude"><strong>VCR 재생</strong> <button data-special="vcr" data-vindex="'+i+'">설정·위치</button> '+(n?'<button data-special="upVcr" data-vindex="'+i+'">위로</button> ':'')+'<button data-special="deleteVcr" data-vindex="'+i+'">삭제</button></li>').join('')+'<li class="mc-vcr-add"><button data-special="vcr" data-gap="'+number+'">+ VCR 추가</button></li>';
 }
 return {gapRows};
};
