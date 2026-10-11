'use strict';
const Brand=require('../data/passport-brand.json');
const P=require('../shared/passport'),R=require('../shared/passport-image'),D=require('../shared/passport-image-edit'),E=P.esc;
module.exports=function maker(app,state,catalog,say,download,entryId=''){
 const templates={profile:'나의 위듀 카드',review:'이달의 나',records:'선택한 기록',ticket:'포토 티켓',lock:'잠금화면',home:'홈화면'};
 let type=entryId?'ticket':'profile',photo=null,serial=0,uploadSerial=0,disposed=false,selected='none',gesture=null,fontSerial=0,fontReady=true,logoReady=false;
 const logos={},photos=[],mottos=[{motto:state.profile.motto||'',mottoFont:'basic',mottoSize:28,mottoX:0,mottoY:92}],recordIds=[];
 let photoIndex=-1,mottoIndex=0,photoCount=0,photoBusy=false;
 const photoKeys=['photoSize','photoOpacity','photoX','photoY'],mottoKeys=['motto','mottoFont','mottoSize','mottoX','mottoY'];
 const opts=(items,selected)=>items.map(([v,n])=>`<option value="${E(v)}" ${v===selected?'selected':''}>${E(n)}</option>`).join('');
 const slider=(name,label,value,min,max,unit='%')=>`<label class="pp-field pp-slider" for="${name}"><span>${label} <output for="${name}" aria-hidden="true">${value}${unit}</output></span><input id="${name}" name="${name}" form="ppMakerControls" type="range" step="any" aria-label="${label}" min="${min}" max="${max}" value="${value}" data-unit="${unit}"></label>`;
 app.innerHTML=`<a class="pp-back" href="/passport/test/">← 내 패스포트</a><section class="pp-panel pp-maker"><h2>이미지 만들기</h2><div class="pp-template-tabs" role="group" aria-label="이미지 템플릿">${Object.entries(templates).map(([v,n])=>`<button data-template="${v}" aria-pressed="${v===type}">${n}</button>`).join('')}</div><div class="pp-maker-layout"><div class="pp-canvas-wrap"><div id="ppEditStage" class="pp-edit-stage"><canvas id="ppCanvas" aria-label="내 패스포트 이미지 미리보기"></canvas><div id="ppSelection" class="pp-selection" role="group" tabindex="0" aria-label="선택한 요소 이동" hidden>${['nw','ne','sw','se'].map((d,i)=>`<button type="button" class="pp-resize pp-resize-${d}" data-corner="${d}" aria-label="사진 ${['왼쪽 위','오른쪽 위','왼쪽 아래','오른쪽 아래'][i]} 크기 조절"></button>`).join('')}</div></div>
 <div class="pp-edit-tools"><div class="pp-edit-modes" role="group" aria-label="편집할 요소"><button type="button" data-edit="photo" disabled>사진</button><button type="button" data-edit="motto">문구</button><button type="button" data-edit="none" aria-pressed="true">완료</button></div><div id="ppPhotoTools" hidden>${slider('photoSize','사진 확대',75,10,200)}${slider('photoOpacity','사진 진하기',70,0,100)}<div class="pp-actions"><button type="button" id="ppCenterPhoto">가운데</button><button type="button" id="ppResetPhoto">초기화</button></div></div><div id="ppMottoTools" hidden><label class="pp-field"><span>문구 글꼴</span><select name="mottoFont" form="ppMakerControls">${opts(Object.entries(R.FONTS).map(([k,v])=>[k,v.label]),'basic')}</select></label><p id="ppFontStatus" class="pp-help" role="status"></p><label class="pp-field pp-font-size"><span>글자 크기</span><button type="button" data-font="-2" aria-label="글자 작게">−</button><input form="ppMakerControls" type="number" name="mottoSize" aria-label="문구 글자 크기" min="18" max="150" value="28"><span>px</span><button type="button" data-font="2" aria-label="글자 크게">+</button></label><div class="pp-actions"><button type="button" id="ppEditMotto">문구 수정</button><button type="button" id="ppCenterMotto">가운데</button><button type="button" id="ppResetMotto">초기화</button></div></div><p id="ppEditHint" class="pp-help" aria-live="polite">사진이나 문구를 선택해 편집하세요.</p></div><p id="ppImageSize" class="pp-help"></p></div><form id="ppMakerControls" class="pp-form-grid">
 <label class="pp-field"><span>배경색</span><select name="color">${opts(Object.entries(R.COLORS).map(([id,c])=>[id,c.label]),'ink')}</select></label><label class="pp-field" id="ppDevice"><span>화면 크기</span><select name="device">${opts([['iphone','iPhone 일반 · 1170×2532'],['max','Pro Max · 1290×2796'],['android','Android · 1440×3120']],'iphone')}</select></label><p class="pp-help pp-wide">멤버 색은 팬페이지에서 구분을 위해 사용하는 색입니다.</p>
 <fieldset class="pp-wide pp-maker-box"><legend>사진 여러 장</legend><label class="pp-field"><span>사진 추가 · 최대 6장</span><input name="photo" type="file" multiple accept="image/jpeg,image/png,image/webp"></label><p id="ppPhotoStatus" class="pp-help" role="status">JPG·PNG·WebP · 1장당 최대 15MB. 사진은 서버로 전송하지 않습니다.</p><label class="pp-field"><span>편집할 사진</span><select id="ppPhotoList" aria-label="편집할 사진"></select></label><div class="pp-actions"><button type="button" id="ppRemovePhoto" disabled>선택 사진 삭제</button><button type="button" id="ppPhotoBack">뒤로</button><button type="button" id="ppPhotoFront">앞으로</button></div><p class="pp-help">사진을 선택해 끌어서 이동하고 모서리로 크기를 바꾸세요. 앞으로/뒤로는 사진끼리 겹치는 순서입니다. 사진은 모든 글씨 아래에 놓입니다. 화면을 나가거나 새로고침하면 다시 선택해 주세요.</p></fieldset>
 <fieldset class="pp-wide pp-maker-box"><legend>문구 여러 개</legend><label class="pp-field"><span>편집할 문구</span><select id="ppMottoList" aria-label="편집할 문구"></select></label><div class="pp-actions"><button type="button" id="ppAddMotto">문구 추가</button><button type="button" id="ppRemoveMotto">선택 문구 삭제</button></div><label class="pp-field"><span>문구</span><textarea name="motto" maxlength="120" rows="2" placeholder="함께한 기억, 앞으로의 우리">${E(state.profile.motto)}</textarea></label><p class="pp-help">문구는 최대 8개까지 추가하고, 각각 글꼴·크기(18~150)·위치를 바꿀 수 있어요. 저장 전 다른 정보와 겹치지 않는지 확인해 주세요.</p></fieldset>
 <fieldset class="pp-wide pp-maker-box" id="ppRecordControls"><legend>이미지에 담을 기록</legend><label class="pp-checks"><input type="checkbox" name="showRecords"> 선택한 기록 표시</label><p class="pp-help">수첩에 저장한 기록을 최대 6개 골라 담습니다. 이달의 나에는 선택한 달의 기록만 표시합니다. 신분 카드에 기록을 넣으면 세로 이미지로 늘어납니다.</p><label class="pp-field"><span>내 기록 검색</span><input type="search" id="ppRecordSearch" placeholder="제목 또는 날짜로 찾기"></label><div id="ppRecordChoices" class="pp-record-choices"></div><p id="ppRecordCount" class="pp-help" role="status"></p><ol id="ppPickedRecords" class="pp-picked-records"></ol></fieldset>
 <label class="pp-checks pp-wide" id="ppTourOpt"><input type="checkbox" name="showTour" checked> 투어 도장·다음 일정 표시</label>
 ${[['photoX',50],['photoY',42],['mottoX',0],['mottoY',92]].map(([n,v])=>`<input type="hidden" name="${n}" value="${v}">`).join('')}
 <label class="pp-field pp-wide" id="ppImageEntry"><span>티켓에 담을 기록</span><select name="entry">${opts(state.entries.map(e=>[e.entryId,P.dateLabel(e.date)+' · '+e.title]),entryId||state.entries[0]?.entryId)}</select></label><label class="pp-field pp-wide" id="ppReviewMonth"><span>기록을 돌아볼 달</span><input type="hidden" name="period" value="month"><input type="month" name="month" value="${P.today().slice(0,7)}"></label><label class="pp-checks pp-wide"><input name="nickname" type="checkbox"> 닉네임 포함</label><label class="pp-checks pp-wide" id="ppSeatOpt"><input name="seat" type="checkbox"> 좌석 정보 포함</label><p class="pp-help pp-wide">기록의 결제금액·구매처·메모·동행인·첨부 링크는 이미지에 넣지 않습니다. 직접 선택한 사진과 작성한 문구는 저장·공유 이미지에 포함됩니다.</p><div class="pp-actions pp-wide"><button type="button" id="ppSaveImage" class="pp-primary">이미지 저장</button><button type="button" id="ppShareMade">이미지 공유</button></div></form></div></section>`;
 const f=document.getElementById('ppMakerControls'),canvas=document.getElementById('ppCanvas'),photoStatus=document.getElementById('ppPhotoStatus');
 const values=()=>({type,photos,mottos,recordIds,showTour:f.elements.showTour.checked,showRecords:type==='records'||f.elements.showRecords.checked,color:f.elements.color.value,device:f.elements.device.value,entry:f.elements.entry.value,period:f.elements.period.value,month:f.elements.month.value,nickname:f.elements.nickname.checked,seat:f.elements.seat.checked,motto:f.elements.motto.value,mottoFont:f.elements.mottoFont.value,...Object.fromEntries(['photoSize','photoOpacity','photoX','photoY','mottoSize','mottoX','mottoY'].map(k=>[k,Number(f.elements[k].value)]))});
 function draw(){if(disposed||!canvas.isConnected)return;saveLayer();for(const [i,m] of mottos.entries()){const o=document.getElementById('ppMottoList').options[i];if(o)o.textContent='문구 '+(i+1)+(m.motto?' · '+m.motto.slice(0,16):'');}serial++;const v=values(),wallpaper=['lock','home'].includes(type),e=state.entries.find(e=>e.entryId===v.entry);document.getElementById('ppDevice').hidden=!wallpaper;document.getElementById('ppTourOpt').hidden=!wallpaper;document.getElementById('ppRecordControls').hidden=type==='ticket';f.elements.showRecords.disabled=type==='records';document.getElementById('ppImageEntry').hidden=type!=='ticket';document.getElementById('ppSeatOpt').hidden=type!=='ticket'||e?.kind!=='concert';document.getElementById('ppReviewMonth').hidden=type!=='review';for(const input of app.querySelectorAll('input[type=range]'))app.querySelector(`output[for="${input.name}"]`).textContent=Math.round(input.value)+input.dataset.unit;const s=R.draw(canvas,state,catalog,v,null,logos[v.color]);document.getElementById('ppImageSize').textContent=`${s.width} × ${s.height} PNG · ${templates[type]}`;syncSelection();}
 function saveLayer(){
  if(photos[photoIndex])for(const k of photoKeys)photos[photoIndex][k]=Number(f.elements[k].value);
  if(mottos[mottoIndex])for(const k of mottoKeys)mottos[mottoIndex][k]=['motto','mottoFont'].includes(k)?f.elements[k].value:Number(f.elements[k].value);
 }
 function layersUI(){
  document.getElementById('ppPhotoList').innerHTML=photos.map((p,i)=>`<option value="${i}" ${i===photoIndex?'selected':''}>${E(p.label)}</option>`).join('')||'<option>사진을 추가해 주세요</option>';
  document.getElementById('ppMottoList').innerHTML=mottos.map((p,i)=>`<option value="${i}" ${i===mottoIndex?'selected':''}>문구 ${i+1}${p.motto?' · '+E(p.motto.slice(0,16)):''}</option>`).join('')||'<option>문구를 추가해 주세요</option>';
  app.querySelector('[data-edit="photo"]').disabled=!photo;
  app.querySelector('[data-edit="motto"]').disabled=!mottos.length;
  document.getElementById('ppRemovePhoto').disabled=!photo;
  document.getElementById('ppPhotoBack').disabled=photoIndex<=0;
  document.getElementById('ppPhotoFront').disabled=photoIndex<0||photoIndex===photos.length-1;
  document.getElementById('ppRemoveMotto').disabled=!mottos.length;
  document.getElementById('ppAddMotto').disabled=mottos.length>=8;
  f.elements.motto.disabled=!mottos.length;
  document.getElementById('ppPhotoList').disabled=!photos.length;
  document.getElementById('ppMottoList').disabled=!mottos.length;
 }
 function chooseLayer(kind,index){
  saveLayer();gesture=null;selected=kind;
  if(kind==='photo'){photoIndex=index;const p=photos[index];photo=p?.image||null;if(p)for(const k of photoKeys)f.elements[k].value=p[k];}
  else{mottoIndex=index;const p=mottos[index];for(const k of mottoKeys)f.elements[k].value=p?.[k]??({motto:'',mottoFont:'basic',mottoSize:28,mottoX:0,mottoY:92}[k]);}
  if(kind==='photo'&&!photo||kind==='motto'&&!mottos[index])selected='none';
  layersUI();draw();
 }
 const resetPhoto=()=>{for(const [k,v] of Object.entries({photoSize:100,photoOpacity:type==='ticket'?100:45,photoX:50,photoY:type==='ticket'?38:42}))f.elements[k].value=v;};
 f.elements.photo.addEventListener('change',async()=>{
  const files=[...f.elements.photo.files||[]];if(!files.length||photoBusy)return;
  const run=++uploadSerial;photoBusy=true;f.elements.photo.disabled=true;exportState();let added=0,failed=0;
  photoStatus.textContent='사진을 불러오는 중이에요…';
  try{for(const file of files){
   if(disposed||run!==uploadSerial)break;
   if(photos.length>=6){failed+=files.length-added-failed;break;}
   if(!['image/jpeg','image/png','image/webp'].includes(file.type)||file.size>15*1024*1024){failed++;continue;}
   const url=URL.createObjectURL(file);
   try{const img=new Image();img.src=url;await img.decode();if(disposed||run!==uploadSerial)break;
    if(!img.naturalWidth||!img.naturalHeight||img.naturalWidth*img.naturalHeight>60000000)throw Error('size');
    const ratio=Math.min(1,2048/Math.max(img.naturalWidth,img.naturalHeight)),scaled=document.createElement('canvas');scaled.width=Math.max(1,Math.round(img.naturalWidth*ratio));scaled.height=Math.max(1,Math.round(img.naturalHeight*ratio));scaled.getContext('2d').drawImage(img,0,0,scaled.width,scaled.height);
    photos.push({image:scaled,label:'사진 '+(++photoCount),photoSize:photos.length?55:100,photoOpacity:type==='ticket'?100:65,photoX:50,photoY:Math.min(75,38+photos.length*8)});added++;chooseLayer('photo',photos.length-1);
   }catch{failed++;}finally{URL.revokeObjectURL(url);}
  }}finally{if(!disposed&&run===uploadSerial){photoBusy=false;f.elements.photo.disabled=false;f.elements.photo.value='';photoStatus.textContent=added+'장 추가 · 총 '+photos.length+'/6장'+(failed?' · '+failed+'장은 추가하지 못했어요. 형식·용량·최대 장수를 확인해 주세요.':'');exportState();}}
 });
 document.getElementById('ppPhotoList').onchange=e=>chooseLayer('photo',Number(e.target.value));
 document.getElementById('ppMottoList').onchange=e=>chooseLayer('motto',Number(e.target.value));
 document.getElementById('ppRemovePhoto').onclick=()=>{saveLayer();photos.splice(photoIndex,1);photoIndex=-1;photo=null;chooseLayer('photo',photos.length-1);photoStatus.textContent='총 '+photos.length+'/6장';};
 for(const [id,delta] of [['ppPhotoBack',-1],['ppPhotoFront',1]])document.getElementById(id).onclick=()=>{saveLayer();const next=photoIndex+delta;if(next<0||next>=photos.length)return;[photos[photoIndex],photos[next]]=[photos[next],photos[photoIndex]];photoIndex=-1;chooseLayer('photo',next);};
 document.getElementById('ppAddMotto').onclick=()=>{if(mottos.length>=8)return;saveLayer();mottos.push({motto:'새 문구',mottoFont:'basic',mottoSize:40,mottoX:50,mottoY:Math.max(10,85-mottos.length*12)});chooseLayer('motto',mottos.length-1);f.elements.motto.focus();};
 document.getElementById('ppRemoveMotto').onclick=()=>{saveLayer();mottos.splice(mottoIndex,1);mottoIndex=-1;chooseLayer('motto',mottos.length-1);loadFont();};
 document.getElementById('ppResetPhoto').onclick=()=>{resetPhoto();draw();};
 document.getElementById('ppResetMotto').onclick=()=>{f.elements.mottoSize.value=28;f.elements.mottoX.value=0;f.elements.mottoY.value=92;draw();};
 function recordChoices(){
  const q=document.getElementById('ppRecordSearch').value.trim().toLowerCase(),rows=state.entries.filter(e=>(type!=='review'||e.date.startsWith(f.elements.month.value))&&(e.title+' '+e.date).toLowerCase().includes(q));
  document.getElementById('ppRecordChoices').innerHTML=rows.slice(0,50).map(e=>`<label><input type="checkbox" data-record="${E(e.entryId)}" ${recordIds.includes(e.entryId)?'checked':''}><span>${E(e.title)}<small>${E(P.dateLabel(e.date))} · ${E(P.KINDS[e.kind])}</small></span></label>`).join('')||'<p class="pp-help">해당하는 기록이 없어요. 내 패스포트에서 기록을 먼저 남겨 주세요.</p>';
  document.getElementById('ppRecordCount').textContent=`${recordIds.length}/6개 선택`+(rows.length>50?' · 검색 결과는 50개씩 표시됩니다. 검색어로 좁혀 주세요.':'');
  document.getElementById('ppPickedRecords').innerHTML=recordIds.map((id,i)=>{const e=state.entries.find(e=>e.entryId===id);return `<li><span>${E(e?.title||'기록')}${type==='review'&&!e?.date.startsWith(f.elements.month.value)?' (다른 달 · 이미지에서 제외)':''}</span><button type="button" data-record-up="${i}" aria-label="선택 기록 ${i+1} 위로" ${i===0?'disabled':''}>↑</button><button type="button" data-record-down="${i}" aria-label="선택 기록 ${i+1} 아래로" ${i===recordIds.length-1?'disabled':''}>↓</button><button type="button" data-record-remove="${i}" aria-label="선택 기록 ${i+1} 빼기">×</button></li>`;}).join('');
 }
 document.getElementById('ppRecordSearch').oninput=recordChoices;
 document.getElementById('ppRecordChoices').onchange=e=>{const id=e.target.dataset.record;if(!id)return;if(e.target.checked){if(recordIds.length>=6){e.target.checked=false;say('기록은 한 이미지에 최대 6개까지 담을 수 있어요.');return;}recordIds.push(id);f.elements.showRecords.checked=true;}else recordIds.splice(recordIds.indexOf(id),1);recordChoices();draw();};
 document.getElementById('ppPickedRecords').onclick=e=>{const b=e.target.closest('button');if(!b)return;if(b.dataset.recordRemove!==undefined)recordIds.splice(Number(b.dataset.recordRemove),1);else{const up=b.dataset.recordUp!==undefined,i=Number(up?b.dataset.recordUp:b.dataset.recordDown),j=i+(up?-1:1);if(j>=0&&j<recordIds.length)[recordIds[i],recordIds[j]]=[recordIds[j],recordIds[i]];}recordChoices();draw();};
 app.querySelectorAll('[data-template]').forEach(b=>b.onclick=()=>{gesture=null;type=b.dataset.template;app.querySelectorAll('[data-template]').forEach(x=>x.setAttribute('aria-pressed',String(x===b)));recordChoices();draw();});const onInput=e=>{if(e.target.name==='mottoFont'){saveLayer();loadFont();return;}if(e.target.name!=='photo'){if(e.target.name==='motto')selected='motto';if(e.target.name==='month')recordChoices();draw();}};app.addEventListener('input',onInput);f.onsubmit=e=>e.preventDefault();
 const stage=document.getElementById('ppEditStage'),selection=document.getElementById('ppSelection');
 function geometry(){const v=values(),H=canvas.height/canvas.width*1080,g=canvas.getContext('2d');return {v,H,m:R.mottoLayout(g,v,H),r:photo?R.photoRect(photo.width,photo.height,1080,H,v):null};}
 function syncSelection(){
  const {H,m,r}=geometry(),b=selected==='photo'?r:selected==='motto'&&values().motto.trim()?{x:m.x,y:m.y-m.font,width:m.width,height:m.height}:null;
  selection.hidden=!b;
  if(b){Object.assign(selection.style,{left:b.x/1080*100+'%',top:b.y/H*100+'%',width:b.width/1080*100+'%',height:b.height/H*100+'%'});selection.setAttribute('aria-label',selected==='photo'?'사진 이동 · 방향키로 미세 조절':'문구 이동 · 방향키로 미세 조절');}
  selection.querySelectorAll('[data-corner]').forEach(el=>el.hidden=selected!=='photo');
  document.getElementById('ppPhotoTools').hidden=selected!=='photo';document.getElementById('ppMottoTools').hidden=selected!=='motto';
  app.querySelectorAll('[data-edit]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.edit===selected)));
  document.getElementById('ppEditHint').textContent=selected==='photo'?'사진을 끌어 이동 · 모서리를 끌어 크기 조절':selected==='motto'?'문구를 끌어 이동 · 아래에서 글자 크기 조절':'사진이나 문구를 선택해 편집하세요.';
 }
 function setValues(v){for(const [k,n] of Object.entries(v))f.elements[k].value=n;draw();}
 app.querySelectorAll('[data-edit]').forEach(b=>b.onclick=()=>{selected=b.dataset.edit;layersUI();syncSelection();});
 app.querySelectorAll('[data-font]').forEach(b=>b.onclick=()=>setValues({mottoSize:Math.max(18,Math.min(150,(Number(f.elements.mottoSize.value)||28)+Number(b.dataset.font)))}));
 document.getElementById('ppCenterPhoto').onclick=()=>setValues({photoX:50,photoY:50});
 document.getElementById('ppCenterMotto').onclick=()=>setValues({mottoX:50});
 document.getElementById('ppEditMotto').onclick=()=>f.elements.motto.focus();
 canvas.addEventListener('pointerdown',e=>{saveLayer();const box=canvas.getBoundingClientRect(),H=canvas.height/canvas.width*1080,x=(e.clientX-box.left)/box.width*1080,y=(e.clientY-box.top)/box.height*H,g=canvas.getContext('2d');const hit=b=>b&&x>=b.x&&x<=b.x+b.width&&y>=b.y&&y<=b.y+b.height;
  for(let i=mottos.length-1;i>=0;i--){const m=R.mottoLayout(g,mottos[i],H);if(mottos[i].motto.trim()&&hit({x:m.x,y:m.y-m.font,width:m.width,height:m.height})){chooseLayer('motto',i);return;}}
  for(let i=photos.length-1;i>=0;i--){const p=photos[i];if(hit(R.photoRect(p.image.width,p.image.height,1080,H,p))){chooseLayer('photo',i);return;}}
  selected='none';syncSelection();
 });
 selection.addEventListener('pointerdown',e=>{if(e.button!==0||gesture)return;e.preventDefault();const box=canvas.getBoundingClientRect();gesture={...geometry(),x:e.clientX,y:e.clientY,k:1080/box.width,corner:e.target.dataset.corner,id:e.pointerId,selected};selection.setPointerCapture(e.pointerId);});
 selection.addEventListener('pointermove',e=>{if(!gesture||e.pointerId!==gesture.id)return;const t=gesture,dx=(e.clientX-t.x)*t.k,dy=(e.clientY-t.y)*t.k;setValues(t.selected==='photo'?(t.corner?D.resizePhoto(t.v,t.r,t.corner,dx,dy,t.H):D.movePhoto(t.v,dx,dy,t.H)):D.moveMotto(t.v,t.m,dx,dy,t.H));});
 const stop=e=>{if(gesture&&e.pointerId===gesture.id){gesture=null;if(selection.hasPointerCapture(e.pointerId))selection.releasePointerCapture(e.pointerId);}};
 selection.addEventListener('pointerup',stop);selection.addEventListener('pointercancel',stop);selection.addEventListener('lostpointercapture',()=>gesture=null);
 selection.addEventListener('keydown',e=>{if(e.key==='Escape'){selected='none';syncSelection();return;}const dirs={ArrowLeft:[-1,0],ArrowRight:[1,0],ArrowUp:[0,-1],ArrowDown:[0,1]};if(!dirs[e.key])return;e.preventDefault();const {v,H,m,r}=geometry(),step=e.shiftKey?20:4,[dx,dy]=dirs[e.key].map(n=>n*step);setValues(selected==='photo'?(e.target.dataset.corner?D.resizePhoto(v,r,e.target.dataset.corner,dx,dy,H):D.movePhoto(v,dx,dy,H)):D.moveMotto(v,m,dx,dy,H));});
 function exportState(){for(const id of ['ppSaveImage','ppShareMade'])document.getElementById(id).disabled=!fontReady||!logoReady||photoBusy;}
 async function loadFont(){
  saveLayer();serial++;const run=++fontSerial,message=document.getElementById('ppFontStatus');
  const ids=[...new Set(mottos.map(m=>m.mottoFont).filter(id=>id!=='basic'))];
  if(!ids.length){fontReady=true;message.textContent='';exportState();draw();return;}
  fontReady=false;message.textContent='글꼴을 불러오는 중이에요…';exportState();
  const failed=[];
  await Promise.all(ids.map(async id=>{try{const loaded=await document.fonts.load(`400 32px ${R.fontFamily(id).split(',')[0]}`,'씨야와 함께한 기억 ABC');if(!loaded.length)throw Error('Font missing');}catch{failed.push(id);}}));
  if(disposed||run!==fontSerial)return;
  for(const m of mottos)if(failed.includes(m.mottoFont))m.mottoFont='basic';
  if(mottos[mottoIndex])f.elements.mottoFont.value=mottos[mottoIndex].mottoFont;
  fontReady=true;message.textContent=failed.length?'불러오지 못한 글꼴을 기본 고딕으로 바꿨어요.':'';exportState();draw();
 }
 const logoLoad=(async()=>{try{const img=new Image();img.src=Brand.logo;await img.decode();if(disposed)return;for(const [id,c] of Object.entries(R.COLORS)){const layer=document.createElement('canvas');layer.width=img.naturalWidth;layer.height=img.naturalHeight;const g=layer.getContext('2d');g.drawImage(img,0,0);g.globalCompositeOperation='source-in';g.fillStyle=c.fg;g.fillRect(0,0,layer.width,layer.height);logos[id]=layer;}logoReady=true;exportState();draw();}catch{if(!disposed)say('로고를 불러오지 못했어요. 새로고침 후 다시 시도해 주세요.');}})();
 async function output(share){if(!fontReady||!logoReady||photoBusy){say('사진·글꼴·로고를 불러온 뒤 저장해 주세요.');return;}draw();const version=serial,kind=type;const blob=await new Promise(resolve=>canvas.toBlob(resolve,'image/png'));if(disposed||!canvas.isConnected)return;if(version!==serial){say('이미지가 변경됐어요. 다시 저장해 주세요.');return;}if(!blob){say('이미지를 만들지 못했어요. 사진 크기를 줄이고 다시 시도해 주세요.');return;}const name=`with-you-${kind}.png`,file=new File([blob],name,{type:'image/png'});if(share&&navigator.canShare?.({files:[file]})){try{await navigator.share({files:[file]});}catch(e){if(e.name!=='AbortError')download(blob,name);}}else download(blob,name);}
 document.getElementById('ppSaveImage').onclick=()=>output(false).catch(()=>say('이미지 저장을 다시 시도해 주세요.'));document.getElementById('ppShareMade').onclick=()=>output(true).catch(()=>say('이미지 저장을 이용해 주세요.'));layersUI();recordChoices();exportState();draw();
 return ()=>{disposed=true;uploadSerial++;fontSerial++;photo=null;photos.length=0;mottos.length=0;gesture=null;app.removeEventListener('input',onInput);};
};
