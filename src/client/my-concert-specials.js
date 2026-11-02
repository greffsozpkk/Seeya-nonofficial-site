'use strict';
const Show=require('../shared/my-concert-show');
module.exports=function specials({root,$,esc,getDraft,getSongs,getTarget,apply,announce}){
 const dialog=$('mcSpecial'),fields=$('mcSpecialFields');
 let kind,slot,vIndex;
 function options(items,selected){return items.map(([v,name])=>'<option value="'+esc(v)+'"'+(v===selected?' selected':'')+'>'+esc(name)+'</option>').join('');}
 function displayChoices(){
  const mode=$('mcMode').value;
  fields.querySelectorAll('[data-for]').forEach(el=>el.hidden=el.dataset.for!==mode);
  if(kind==='vcr' && mode==='fixed'){
   const v=Show.media.vcr.find(v=>v.videoId===$('mcFixed').value);
   $('mcVcrPreview').innerHTML=v?'<img alt="" src="https://i.ytimg.com/vi/'+v.videoId+'/mqdefault.jpg"><span>'+esc(v.channel)+' · '+Math.floor(v.duration/60)+':'+String(v.duration%60).padStart(2,'0')+'</span>':'';
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
   fields.innerHTML='<label>추첨 범위<select id="mcMode">'+options([['all','전체 랜덤'],['album','앨범별 랜덤'],['custom','직접 고른 곡 중 랜덤']],range.mode)+'</select></label><label data-for="album">앨범<select id="mcHiddenAlbum">'+options([...albums],range.album)+'</select></label><fieldset class="mc-candidates" data-for="custom"><legend>후보곡 선택</legend>'+Show.checkedSongs(songs).map(s=>'<label><input type="checkbox" value="'+esc(s.id)+'"'+(range.ids?.includes(s.id)?' checked':'')+'> '+esc(s.title)+'</label>').join('')+'</fieldset><p id="mcCandidateCount"></p>';
  }else{
   const v=d.vcrs?.[index]||{mode:'fixed',after:gap},media=Show.media;
   fields.innerHTML='<label>위치<select id="mcGap">'+options(Array.from({length:11},(_,i)=>[i+1,(i+1)+'번 노래 뒤 · '+(i+2)+'번 노래 앞']),v.after)+'</select></label><label>영상 선택<select id="mcMode">'+options([['fixed','직접 선택'],['random','랜덤']],v.mode)+'</select></label><div data-for="fixed"><label>영상<select id="mcFixed">'+options(media.vcr.map(x=>[x.videoId,x.title]),v.value)+'</select></label><div id="mcVcrPreview"></div></div><label data-for="random">채널<select id="mcChannel">'+options([['all','전체 채널'],...Object.entries(media.channels)],v.value)+'</select></label>';
  }
  displayChoices();dialog.showModal();
 }
 fields.addEventListener('change',displayChoices);
 function commit(){
  const d=JSON.parse(JSON.stringify(getDraft()));
  if(kind==='hidden'){
   const section=d.sections[getTarget()];const max={opening:1,main:9,encore:2}[getTarget()];
   if(!slot&&section.length>=max)throw Error('선택한 구간이 가득 찼어요. 추가할 구간을 바꿔주세요.');
   let id=slot;
   if(!id){let n=1;while(d.hidden['hidden-'+n])n++;id='hidden-'+n;section.push(id);}
   d.hidden[id]=Show.config(readRange(),getSongs());
  }else{
   const mode=$('mcMode').value;
   const next=Show.vcrConfig({after:Number($('mcGap').value),mode,value:$(mode==='fixed'?'mcFixed':'mcChannel').value});
   if(vIndex===null)d.vcrs.push(next);else d.vcrs[vIndex]=next;
  }
  Show.session(d,getSongs(),()=>0.5);
  apply(d);dialog.close();announce('공연 구성을 저장했어요.');
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
  if(number>=12)return '';
  const rows=(d.vcrs||[]).map((v,i)=>({v,i})).filter(x=>x.v.after===number);
  return rows.map(({i},n)=>'<li class="mc-interlude"><strong>VCR 재생</strong> <button data-special="vcr" data-vindex="'+i+'">설정·위치</button> '+(n?'<button data-special="upVcr" data-vindex="'+i+'">위로</button> ':'')+'<button data-special="deleteVcr" data-vindex="'+i+'">삭제</button></li>').join('')+'<li class="mc-vcr-add"><button data-special="vcr" data-gap="'+number+'">+ VCR 추가</button></li>';
 }
 return {gapRows};
};
