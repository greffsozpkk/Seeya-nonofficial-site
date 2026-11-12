(function(){'use strict';const modules={
"src/client/galaxy.js":function(module,exports,__require){
(() => {
 const {layout}=__require("src/shared/galaxy-layout.js");
 const root=document.getElementById('galaxy');if(!root)return;
 const $=id=>document.getElementById(id),key='seeya-galaxy-prototype-v1';
 const samples=[
 ['씨야','오래된 이어폰','처음 씨야의 노래를 듣던 날 쓰던 이어폰은 이제 없지만, 그때의 마음은 아직 그대로예요.\n\n다시 같은 무대에서 세 사람의 목소리를 들을 수 있어서 참 행복합니다. 앞으로의 페이지도 함께 채워가요.'],
 ['남규리','귤빛 오후','무대 위에서 노래하는 모습도, 일상을 조곤조곤 들려주는 모습도 좋아해요.\n보여주는 모든 모습이 오래도록 편안한 기억이 되었으면 좋겠어요.'],
 ['김연지','작은 쉼표','마음이 복잡한 날에는 연지 언니의 목소리를 찾아요. 말로 다 하지 못했던 마음을 대신 노래해 주는 것 같거든요.\n오늘은 제가 한마디 전할게요. 고마워요, 정말 많이.'],
 ['이보람','밤의 라디오','라디오가 끝나면 하루도 조금 다정하게 마무리되는 기분이에요.\n언니에게도 그런 밤이 많았으면 좋겠어요. 좋은 꿈 꾸세요.'],
 ['씨야','봄을 기다리며','기다리는 동안에도 노래는 늘 곁에 있었어요.\n다시 만나고 보니 그 시간이 빈칸은 아니었네요. 우리, 천천히 오래 함께해요.'],
 ['남규리','첫 번째 줄','노래를 시작하기 직전의 표정을 좋아해요. 작은 숨 하나에 얼마나 많은 마음이 담겨 있는지 느껴져서요.\n다음 무대에서도 그 순간을 기다릴게요.'],
 ['김연지','연보라 하늘','음악을 오래 좋아할 수 있게 해줘서 고마워요.\n한 곡을 끝까지 듣는 시간이 이렇게 든든한 휴식이 될 줄 몰랐어요.'],
 ['이보람','오늘도 보람','함께 웃다가 어느새 눈물이 나는 무대. 그런 기억들을 선물해 줘서 고마워요.\n다음에 만날 때는 더 크게 응원할게요!'],
 ['씨야','한 장의 티켓','서랍에 넣어 둔 티켓을 꺼내 봤어요. 그날의 조명과 함성이 아직도 생생해요.\n언젠가 오늘을 떠올릴 때도 이렇게 웃을 수 있겠죠.'],
 ['남규리','느린 걸음','언니의 새로운 도전을 볼 때마다 저도 작은 용기를 얻어요.\n잘하고 있다는 말을 오늘은 꼭 전하고 싶었어요.'],
 ['김연지','여름 끝에서','오래 듣던 노래를 라이브로 만났을 때의 감정을 아직 기억해요.\n같은 노래인데 그날만의 이야기가 새로 생겼어요.'],
 ['이보람','분홍 구름','장난스럽게 웃다가도 노래가 시작되면 몰입하는 모습이 멋져요.\n앞으로도 무대에서 가장 즐거운 사람이 언니였으면 좋겠어요.'],
 ['씨야','처음 만난 봄','늦게 좋아하게 되었지만, 천천히 알아가는 시간이 정말 즐거워요.\n오래된 영상 하나를 보고 나면 좋아할 이유가 또 하나 늘어나요.'],
 ['남규리','작은 귤 하나','오늘도 영상 보면서 많이 웃었어요.\n소소한 이야기들을 나눠 줘서 고마워요. 언니의 하루에도 웃을 일이 가득하길!'],
 ['김연지','노래의 온도','한 음 한 음 정성스럽게 건네주는 노래를 듣고 있으면, 제 하루도 소중하게 돌보고 싶어져요.\n오래 노래해 주세요. 오래 들을게요.'],
 ['이보람','달빛 산책','집으로 돌아오는 길에 목소리를 들으면 혼자 걷는 길도 덜 쓸쓸해요.\n늘 곁에 있어 줘서 고맙다는 인사를 남겨요.'],
 ['씨야','같은 자리','세 사람이 마주 보고 웃는 장면이 제일 좋아요.\n그 웃음을 보며 객석에서도 같이 웃던 우리를 기억해 주세요.'],
 ['남규리','기억 한 조각','어떤 날은 무대가, 어떤 날은 작품 속 한 장면이 생각나요.\n다양한 얼굴로 좋은 기억을 남겨줘서 고마워요.'],
 ['김연지','소중한 후렴','친구에게 좋아하는 가수를 소개하다가 이야기가 너무 길어졌어요.\n전하고 싶은 좋은 노래가 많다는 건 참 행복한 일이네요.'],
 ['이보람','별빛 한 스푼','응원이 닿았으면 하는 마음으로 편지를 써요.\n좋은 날에도 조금 지친 날에도, 여기에서 마음을 보내는 사람이 있다는 걸 기억해 주세요.'],
 ['씨야','다음 계절','함께할 다음 계절이 기대돼요.\n특별한 날뿐 아니라 평범한 하루에도 씨야의 음악이 곁에 있기를 바라요.'],
 ['남규리','포근한 밤','좋아하는 마음을 말로 꺼내는 게 조금 쑥스럽지만 오늘은 남겨 볼게요.\n언니 덕분에 즐거운 순간이 참 많았어요. 늘 응원합니다.'],
 ['김연지','다정한 음표','노래를 듣다가 문득 이 마음이 전해졌으면 좋겠다고 생각했어요.\n멋진 무대 뒤에 있을 노력까지, 다 헤아리지는 못해도 늘 고마워하고 있어요.'],
 ['이보람','오래오래','다음 만남에는 어떤 노래를 들을 수 있을까요?\n기다리는 시간마저 즐겁게 만들어 주는 사람이 되어 줘서 고마워요.']
 ].map(([recipient,nickname,body],i)=>({id:'sample-'+i,recipient,nickname,body,date:'2026-11-07',sample:true}));
 const {starEditor,letterColor,paintLight}=__require("src/client/galaxy-art.js");
 const recipients=['씨야','남규리','김연지','이보람'];let mine=[],storageOK=true;
 try{const saved=JSON.parse(localStorage.getItem(key)||'[]');if(Array.isArray(saved))mine=saved.filter(x=>x&&typeof x.id==='string'&&x.id.startsWith('local-')&&recipients.includes(x.recipient)&&typeof x.body==='string'&&x.body.trim()&&x.body.length<=1000&&typeof x.nickname==='string'&&x.nickname.length<=20&&/^\d{4}-\d{2}-\d{2}$/.test(x.date)).slice(-100);}catch{storageOK=false;}
 let filter='전체',view='sky',page=1,current=null,lastFocus=null;
 const density=$('glDensity'),options=[24,200,300,500,1000],initial=Number(new URLSearchParams(location.search).get('stars'));
 density.value=String(options.includes(initial)?initial:24);
 const publicPage=document.body.dataset.page==='fan-letters';
 const shared=publicPage||!options.includes(initial);
 // Reserve a UUID namespace so the existing sheet can serve separate skies.
 const publicPrefix='fa11e77e-';
 function newLetterId(){
  let id=crypto.randomUUID();
  if(publicPage)return publicPrefix+id.slice(publicPrefix.length);
  while(id.startsWith(publicPrefix))id=crypto.randomUUID();
  return id;
 }
 const service=__require("src/client/galaxy-service.js")(__require("src/data/galaxy-connection.json").endpoint);
 let letters=[],generation=0,loading=false,lastRead=0,connected=false;
 density.parentElement.hidden=shared;
 if(shared){
  $('glCompose').disabled=true;
  $('glForm').querySelector('.gl-form-note').textContent='작성한 편지는 이 브라우저의 씨야 다이어리에도 저장돼요.';
  $('glFind').querySelector('.gl-form-note').textContent='닉네임으로 편지를 찾을 수 있어요. 예전에 쓴 편지는 ‘편지 수정’에서 비밀번호를 입력하고 저장하면 이 기기의 다이어리에도 담겨요.';
  $('glConnection').textContent=service?'공유 편지를 불러오고 있어요.':'공유 은하수는 구글 시트 연결을 기다리고 있어요.';
 }else{
  $('glForm').querySelector('.gl-form-note').textContent='예시 화면에 작성한 편지는 이 브라우저에서만 보입니다.';
  $('glConnection').textContent='예시 은하수 · 여기서 직접 쓴 편지는 이 브라우저에만 저장됩니다.';
 }
 const demo=Array.from({length:1000},(_,i)=>{const base=samples[i%samples.length];return i<samples.length?base:{...base,id:'demo-'+i,nickname:'예시 팬 '+(i+1),body:'은하수가 커진 모습을 보여주는 예시 편지입니다.\n\n'+base.body};});
 const all=()=>shared?letters:[...demo.slice(0,Number(density.value)),...mine];const filtered=()=>all().filter(x=>filter==='전체'||x.recipient===filter);const size=()=>view==='sky'?Math.max(1,all().length):8;
 const camera=__require("src/client/galaxy-camera.js")($('glSky'),$('glScene'));
 function save(){try{localStorage.setItem(key,JSON.stringify(mine));storageOK=true;return true;}catch{storageOK=false;return false;}}
 function notice(text){$('glNotice').textContent=text;$('glDiaryLink').hidden=true;}
 async function updateDiary(id,letter){
  const task=()=>__require("src/shared/galaxy-diary.js").update(localStorage,id,letter);
  try{
   const entryId=navigator.locks?await navigator.locks.request('seeya-passport-save',task):task();
   if(letter){
    notice('은하수와 이 기기의 다이어리에 편지를 저장했어요.');
    const link=$('glDiaryLink');link.href='/diary/#entry='+encodeURIComponent(entryId);link.hidden=false;
   }
  }catch{
   notice(letter?'은하수에 편지를 저장했지만 이 기기의 다이어리에 담지 못했어요. 저장 공간을 확인한 뒤 편지 수정에서 다시 저장해 주세요.':'은하수에서 삭제했지만 이 기기의 다이어리 기록은 지우지 못했어요. 다이어리에서 삭제해 주세요.');
  }
 }
 function open(dialog){lastFocus=document.activeElement;dialog.showModal();}
 function saving(dialog){return shared&&dialog.querySelector('button[type=submit]:disabled');}
 function close(dialog){if(!saving(dialog))dialog.close();}
 for(const dialog of root.querySelectorAll('dialog'))dialog.addEventListener('cancel',e=>{if(saving(dialog))e.preventDefault();});
 root.querySelectorAll('dialog').forEach(dialog=>{dialog.querySelectorAll('[data-close]').forEach(b=>b.addEventListener('click',()=>close(dialog)));dialog.addEventListener('close',()=>{if(lastFocus&&lastFocus.isConnected)lastFocus.focus();});dialog.addEventListener('click',e=>{if(e.target===dialog){const r=dialog.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)close(dialog);}});});
 function read(id){current=all().find(x=>x.id===id);if(!current)return;$('glLetterTitle').textContent='To. '+current.recipient;$('glLetterBody').textContent=current.body;$('glAuthor').textContent='From. '+current.nickname;$('glDate').textContent=current.date.replaceAll('-','. ');$('glDate').dateTime=current.date;$('glLetterKind').textContent=current.sample?'SAMPLE LETTER · 예시 편지':shared?'LETTER · 팬이 남긴 별':'MY LITTLE STAR · 나의 별';$('glLetterNote').textContent=current.sample?'화면을 살펴보기 위해 만든 예시 편지입니다.':shared?'작성할 때 정한 비밀번호로 수정하거나 삭제할 수 있어요.':'이 브라우저에만 남아 있는 나의 테스트 편지입니다.';const protectedLetter=!current.sample&&(shared||validLock(current.lock));$('glEdit').hidden=$('glDelete').hidden=!protectedLetter;
 if(!current.sample&&!protectedLetter)$('glLetterNote').textContent='비밀번호 기능을 넣기 전에 쓴 편지라 읽기만 가능해요.';if(!$('glLetter').open)open($('glLetter'));}
 let skyEntries=[], activeHighlight=null, lastBand=-1;
 const skyCaption=root.querySelector('.gl-sky-caption');
 function makeStar({letter,x,y,index}){
  const button=document.createElement('button');
  button.type='button';
  button.className='gl-star'+(!letter.sample?' gl-own':'')+(letter.id===activeHighlight?' gl-new':'');
  button.dataset.id=letter.id;
  button.style.left=x+'px';
  button.style.top=y+'px';
  button.style.setProperty('--star',letterColor(letter));
  button.setAttribute('aria-label',letter.nickname+'님이 '+letter.recipient+'에게 쓴 '+(letter.sample?'예시 편지':'편지')+' 읽기');
  const icon=document.createElement('i'),label=document.createElement('span');
  icon.setAttribute('aria-hidden','true');
  icon.style.width=(3+(index*7%4))+'px';
  icon.style.height=icon.style.width;
  label.textContent=letter.nickname;
  button.append(icon,label);
  button.onclick=()=>read(letter.id);
  return button;
 }
 function drawLetters(zoom,force=false){
  if(view!=='sky')return;
  const dense=skyEntries.length>500;
  const band=!dense||zoom>=4?0:zoom>=2?28:56;
  if(!force&&band===lastBand)return;
  lastBand=band;
  const stars=$('glStars'),fragment=document.createDocumentFragment();
  stars.classList.toggle('gl-dense',dense);
  skyCaption.textContent=band?'별무리를 누르면 가까이 모인 편지들이 펼쳐져요.':'작은 빛 하나에도 씨야를 향한 진심이 담겨있어요.';
  const cloud=$('glLetterCloud');
  cloud.hidden=!band;
  const rect=$('glSky').getBoundingClientRect(),ratio=Math.min(devicePixelRatio||1,2);
  let ctx;
  if(band){
   cloud.width=Math.round(rect.width*ratio);cloud.height=Math.round(rect.height*ratio);
   ctx=cloud.getContext('2d');ctx.scale(ratio,ratio);
  }
  const groups=new Map();
  for(const entry of skyEntries){
   if(!band){fragment.append(makeStar(entry));continue;}
   const key=Math.floor(entry.x/band)+','+Math.floor(entry.y/band);
   if(!groups.has(key))groups.set(key,[]);
   groups.get(key).push(entry);
  }
  for(const group of groups.values()){
   if(group.length===1){fragment.append(makeStar(group[0]));continue;}
   const x=group.reduce((sum,p)=>sum+p.x,0)/group.length;
   const y=group.reduce((sum,p)=>sum+p.y,0)/group.length;
   const button=document.createElement('button');
   button.type='button';
   // The group supplies the hit area. Every letter still shines at its own
   // coordinates and in its own colour, at both overview zoom levels.
   for(const entry of group){
    const radius=1.15+(entry.index%7)*.21;
    paintLight(ctx,entry.x,entry.y,letterColor(entry.letter),radius);
   }
   button.className='gl-cluster-hit';
   const cell=group[0];
   button.style.left=Math.floor(cell.x/band)*band+'px';
   button.style.top=Math.floor(cell.y/band)*band+'px';
   button.style.width=band+'px';
   button.style.height=band+'px';
   button.dataset.count=String(group.length);
   const label='편지 '+group.length+'통이 모인 별무리';
   button.setAttribute('aria-label',label+' 확대');
   button.title=label;
   button.onclick=()=>camera.locate(x,y,band===56?2:4);
   fragment.append(button);
  }
  stars.replaceChildren(fragment);
 }
 camera.onZoom(zoom=>drawLetters(zoom));
 function makeCard(letter){
  const card=document.createElement('button');
  card.type='button';
  card.className='gl-card';
  card.onclick=()=>read(letter.id);
  const kind=document.createElement('small'),title=document.createElement('strong'),preview=document.createElement('p'),by=document.createElement('small');
  kind.textContent=letter.sample?'예시 편지':shared?'팬이 남긴 별':'나의 별';
  title.textContent='To. '+letter.recipient;
  preview.textContent=letter.body.slice(0,95)+(letter.body.length>95?'…':'');
  by.textContent=letter.nickname+' · '+letter.date;
  card.append(kind,title,preview,by);
  return card;
 }
 function render(highlight){
  const rows=filtered(),pages=Math.max(1,Math.ceil(rows.length/size()));
  page=Math.min(page,pages);
  const sky=view==='sky';
  $('glSky').hidden=!sky;
  $('glList').hidden=sky;
  $('glView').textContent=sky?'편지 목록으로 보기':'밤하늘로 보기';
  $('glView').setAttribute('aria-pressed',String(!sky));
  if(sky){
   const catalog=all(),rect=$('glSky').getBoundingClientRect();
   const positions=layout(catalog,rect.width,rect.height);
   skyEntries=catalog.map((letter,index)=>({letter,index,...positions[index]})).filter(p=>filter==='전체'||p.letter.recipient===filter);
   activeHighlight=highlight;
   drawLetters(camera.zoom,true);
  }else{
   $('glList').replaceChildren(...rows.slice((page-1)*size(),page*size()).map(makeCard));
  }
  $('glCount').textContent=shared?(connected?'팬들이 남긴 별 '+rows.length+'개':''):rows.length+'개의 별 · 예시 '+rows.filter(x=>x.sample).length+' / 내가 쓴 편지 '+rows.filter(x=>!x.sample).length;
  $('glPage').textContent=page+' / '+pages;
  for(const id of ['glPage','glPrevious','glNext'])$(id).hidden=sky;
  $('glPrevious').disabled=page===1;
  $('glNext').disabled=page===pages;
  root.querySelectorAll('[data-filter]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.filter===filter)));
 }
 root.querySelectorAll('[data-filter]').forEach(b=>b.addEventListener('click',()=>{filter=b.dataset.filter;page=1;render();}));$('glView').onclick=()=>{view=view==='sky'?'list':'sky';page=1;render();};$('glPrevious').onclick=()=>{page--;render();};$('glNext').onclick=()=>{page++;render();};
 // Local examples use random salts. Shared letters use their unique UUID as the salt.
 const hex=bytes=>Array.from(bytes,x=>x.toString(16).padStart(2,'0')).join('');
 const validLock=lock=>lock?.version===1&&/^[a-f0-9]{32}$/.test(lock.salt)&&/^[a-f0-9]{64}$/.test(lock.hash);
 async function verifier(password,salt){const material=await crypto.subtle.importKey('raw',new TextEncoder().encode(password),'PBKDF2',false,['deriveBits']);const bytes=Uint8Array.from(salt.match(/../g),x=>parseInt(x,16));return hex(new Uint8Array(await crypto.subtle.deriveBits({name:'PBKDF2',salt:bytes,iterations:600000,hash:'SHA-256'},material,256)));}
 async function accepts(letter,password){return validLock(letter?.lock)&&await verifier(password,letter.lock.salt)===letter.lock.hash;}
 function persist(next){const old=mine;mine=next;if(save())return true;mine=old;return false;}
 const form=$('glForm'),removeForm=$('glRemoveForm'),editor=starEditor(form);let editing=null,removing=null;
 let draftId,draftPlace,writeRequest,deleteRequest;
 function compose(letter=null){draftId=letter?.id||newLetterId();writeRequest=crypto.randomUUID();editing=letter;form.reset();form.elements.body.setCustomValidity('');$('glError').textContent='';$('glWriteTitle').textContent=letter?'별에 담은 마음 고치기':'당신의 마음을 별로 남겨요.';
  $('glSubmit').textContent=letter?'비밀번호 확인 후 수정':'밤하늘에 내 별 띄우기';form.elements.password.autocomplete=letter?'current-password':'new-password';
  if(letter){form.elements.recipient.value=letter.recipient;form.elements.nickname.value=letter.nickname;form.elements.body.value=letter.body;}
  // Keep one coordinate for this draft, including retries and edits.
  draftPlace=letter ? letter.place : .05+Math.random()*.90;
  editor.open(letter);
  $('glLength').textContent=form.elements.body.value.length+' / 1,000';open($('glWrite'));
 }
 $('glCompose').onclick=()=>compose();
 $('glEdit').onclick=()=>{if(!current||current.sample||(!shared&&!validLock(current.lock)))return;close($('glLetter'));compose(current);};
 $('glDelete').onclick=()=>{if(!current||current.sample||(!shared&&!validLock(current.lock)))return;removing=current;deleteRequest=crypto.randomUUID();close($('glLetter'));removeForm.reset();$('glRemoveError').textContent='';open($('glRemove'));};
 $('glWrite').addEventListener('close',()=>{form.elements.password.value='';});
 $('glRemove').addEventListener('close',()=>{removeForm.elements.password.value='';});
 form.elements.body.addEventListener('input',()=>{$('glLength').textContent=form.elements.body.value.length+' / 1,000';form.elements.body.setCustomValidity('');});
 form.addEventListener('submit',async e=>{
  e.preventDefault();if($('glSubmit').disabled)return;const design=editor.values();if(Number.isFinite(draftPlace))design.place=draftPlace;const target=editing,body=form.elements.body.value.trim(),nickname=form.elements.nickname.value.trim()||'익명의 씨야 팬',recipient=form.elements.recipient.value,password=form.elements.password.value;
  if(!body){form.elements.body.setCustomValidity('편지를 한 줄 이상 적어주세요.');form.elements.body.reportValidity();return;}
  if(!shared&&!target&&mine.length>=100){$('glError').textContent='이 브라우저에는 편지를 100통까지 저장할 수 있어요.';return;}
  $('glSubmit').disabled=true;$('glError').textContent='';
  try{
   if(shared){
    const proof=await verifier(password,draftId.replaceAll('-',''));
    const {letter}=await service.change({action:target?'edit':'create',id:draftId,requestId:writeRequest,revision:target?.revision,proof,nickname,body,recipient,...design});
    applyShared(letter.id,letter);
    $('glWrite').close();form.reset();showOnSky(letter.id);
    await updateDiary(letter.id,letter);
    return;
   }
   let letter;if(target){if(!await accepts(target,password)){$('glError').textContent='편지 비밀번호가 맞지 않아요.';return;}letter={...target,nickname,body,recipient,...design};}
   else{const salt=hex(crypto.getRandomValues(new Uint8Array(16)));letter={id:'local-'+crypto.randomUUID(),recipient,nickname,body,...design,date:new Intl.DateTimeFormat('sv-SE',{timeZone:'Asia/Seoul'}).format(new Date()),lock:{version:1,salt,hash:await verifier(password,salt)}};}
   if(!$('glWrite').open||target!==editing)return;
   if(!persist(target?mine.map(x=>x.id===target.id?letter:x):[...mine,letter])){$('glError').textContent='브라우저에 저장하지 못했어요. 작성한 내용은 이 창에 남아 있어요.';return;}
   close($('glWrite'));form.reset();showOnSky(letter.id);notice(target?'편지를 수정했어요.':'밤하늘에 내 별이 떠올랐어요.');
  }catch(err){if(shared){$('glError').textContent=err.message;if(['CONFLICT','MISSING'].includes(err.code))refresh();}else $('glError').textContent='비밀번호를 확인할 수 없어 저장하지 않았어요. 브라우저에서 페이지를 다시 열어주세요.';}finally{$('glSubmit').disabled=false;}
 });
 removeForm.addEventListener('submit',async e=>{e.preventDefault();const target=removing,submit=removeForm.querySelector('[type=submit]');if(submit.disabled)return;submit.disabled=true;
  try{if(shared){
    const proof=await verifier(removeForm.elements.password.value,target.id.replaceAll('-',''));
    await service.change({action:'delete',id:target.id,requestId:deleteRequest,revision:target.revision,proof});
    applyShared(target.id,null);$('glRemove').close();render();notice('공유 은하수에서 편지를 삭제했어요.');await updateDiary(target.id,null);return;
   }
   if(!await accepts(target,removeForm.elements.password.value)){$('glRemoveError').textContent='편지 비밀번호가 맞지 않아요.';return;}if(!$('glRemove').open||target!==removing)return;
   if(!persist(mine.filter(x=>x.id!==target.id))){$('glRemoveError').textContent='삭제 내용을 저장할 수 없어요.';return;}close($('glRemove'));render();notice('편지와 별을 삭제했어요.');
  }catch(err){$('glRemoveError').textContent=shared?err.message:'비밀번호를 확인하지 못했어요.';if(shared&&['CONFLICT','MISSING'].includes(err.code))refresh();}finally{submit.disabled=false;}
 });
 function showOnSky(id){
  filter='전체';view='sky';page=1;render(id);
  const entry=skyEntries.find(p=>p.letter.id===id);
  if(entry){camera.locate(entry.x,entry.y,skyEntries.length>500?4:3);$('glSky').scrollIntoView({block:'center'});}
 }
 $('glLocate').onclick=()=>{const id=current.id;close($('glLetter'));showOnSky(id);};
 function search(){const q=$('glQuery').value.trim().normalize().toLocaleLowerCase(),found=(shared?letters:mine).filter(x=>x.nickname.normalize().toLocaleLowerCase().includes(q)).reverse();$('glMatches').replaceChildren();
  $('glFindStatus').textContent=shared&&!q?'편지를 쓸 때 사용한 닉네임을 입력해 주세요.':!shared&&!mine.length?'아직 이 브라우저에서 작성한 편지가 없어요.':!found.length?'이 이름으로 남긴 편지가 없어요.':'찾은 편지 '+found.length+'통';
  if(shared&&!q)return;
  for(const x of found){const b=document.createElement('button'),by=document.createElement('strong'),preview=document.createElement('span');b.type='button';by.textContent=x.nickname+' → '+x.recipient;preview.textContent=x.date+' · '+x.body.slice(0,65);b.append(by,preview);b.onclick=()=>{close($('glFind'));read(x.id);};$('glMatches').append(b);}
 }
 $('glMine').onclick=()=>{$('glQuery').value='';search();open($('glFind'));$('glQuery').focus();};$('glQuery').oninput=search;
 $('glAnother').onclick=()=>{const choices=filtered().filter(x=>x.id!==current?.id);if(choices.length)read(choices[Math.floor(Math.random()*choices.length)].id);};
 density.onchange=()=>{view='sky';filter='전체';page=1;camera.reset();render();const url=new URL(location.href);url.searchParams.set('stars',density.value);history.replaceState(null,'',url);};
 function applyShared(id,updated){
  generation++;
  $('glConnection').textContent='';
  const idx=letters.findIndex(x=>x.id===id);
  if(!updated)letters=letters.filter(x=>x.id!==id);
  else if(idx<0)letters.push(updated);
  else letters[idx]=updated;
 }
 async function refresh(){
  if(!shared||!service||loading)return;
  const version=generation;loading=true;
  try{
   const next=await service.list();
   if(version!==generation)return;
   letters=next.filter(letter=>letter.id.startsWith(publicPrefix)===publicPage);connected=true;lastRead=Date.now();
   $('glCompose').disabled=false;
   $('glConnection').textContent=letters.length?'':'아직 별이 없어요. 첫 편지를 남겨 함께 보는 은하수를 시작해 주세요.';
   render();
   if($('glFind').open)search();
   if($('glLetter').open){
    const latest=letters.find(x=>x.id===current?.id);
    if(latest)read(latest.id);else{close($('glLetter'));notice('이 편지는 삭제됐어요.');}
   }
  }catch(e){if(version===generation)$('glConnection').textContent=e.message;}
  finally{loading=false;if(version!==generation)refresh();}
 }
 if(shared&&service){
  const whenVisible=()=>{if(!document.hidden&&Date.now()-lastRead>15000)refresh();};
  document.addEventListener('visibilitychange',whenVisible);window.addEventListener('focus',whenVisible);
  setInterval(whenVisible,60000);refresh();
 }
 let resize;window.addEventListener('resize',()=>{clearTimeout(resize);resize=setTimeout(()=>{if(view==='sky')camera.reset();render();},150);});render();if(!shared&&!storageOK)notice('브라우저 저장 공간을 읽지 못했어요. 새 편지를 저장할 때 다시 확인합니다.');
})();

},
"src/shared/galaxy-layout.js":function(module,exports,__require){
'use strict';
// A reproducible, curved cloud rather than rows. Small light points can cluster; zoom reveals the letters.
function random(seed=742){return()=>((seed=(Math.imul(seed,1664525)+1013904223)>>>0)/4294967296);}
function spine(t){return .79-.6*t+.065*Math.sin(t*Math.PI*2);}
// Vary the thickness along the curved core. The wider halo fades into a
// sparse field. Reject samples outside the sky to avoid lines along its edges.
function scatter(rand) {
 for (;;) {
  const layer=rand();
  if(layer<.12)return {x:rand(),y:rand()};
  const x=rand()<.48?(rand()+rand())/2:rand();
  const mid=Math.sin(Math.PI*x);
  const width=.05+.075*mid+.045*Math.sin(2.2*Math.PI*x+.6)**2;
  const gaussian=Math.sqrt(-2*Math.log(1-rand()))*Math.cos(2*Math.PI*rand());
  const y=spine(x)+gaussian*width*(layer<.46?1.85:.62);
  if(y>0&&y<1)return {x,y};
 }
}

function layout(letters,width,height){
 const field=random(927),points=[],normalized=[];
 const left=22,top=48,usableWidth=width-left*2,usableHeight=height-top*2;
 for(const letter of letters){
  const hasPlace=Number.isFinite(letter.place)&&letter.place>=.05&&letter.place<=.95;
  let seed=19;
  for(const char of letter.id)seed=(Math.imul(seed,31)+char.charCodeAt(0))>>>0;
  const personal=random(seed);
  const origin=hasPlace
   ? {x:letter.place,y:spine(letter.place)+(personal()+personal()+personal()-1.5)*.04}
   : scatter(field);
  let {x,y}=origin;
  for(let attempt=0;attempt<45;attempt++){
   if(!normalized.some(other=>Math.abs(x-other.x)<.007&&Math.abs(y-other.y)<.012))break;
   const dx=origin.x+(personal()-.5)*.045;
   const dy=origin.y+(personal()-.5)*.085;
   if(dx>0 && dx<1 && dy>0 && dy<1){x=dx;y=dy;}
  }
  normalized.push({x,y});
  points.push({x:left+x*usableWidth,y:top+y*usableHeight});
 }
 return points;
}
module.exports={random,spine,layout};

},
"src/client/galaxy-art.js":function(module,exports,__require){
'use strict';

const palette = [
 ['살구빛', '#f5d9bf'], ['하늘빛', '#bfcdf9'], ['보랏빛', '#dfc6fc'],
 ['분홍빛', '#f4b9d3'], ['민트빛', '#90e2cc'], ['금빛', '#ffcf60']
];

function letterColor(letter) {
 const value=letter.color;
 if (/^#[a-f0-9]{6}$/i.test(value)) {
  // Old test letters could store any RGB value. Display the closest swatch.
  const channels=hex=>[1,3,5].map(i=>parseInt(hex.slice(i,i+2),16));
  const rgb=channels(value);
  const distance=hex=>channels(hex).reduce((sum,c,i)=>sum+(c-rgb[i])**2,0);
  return palette.reduce((best,item)=>distance(item[1])<distance(best[1])?item:best)[1];
 }
 const index=['씨야','남규리','김연지','이보람'].indexOf(letter.recipient);
 return palette[Math.max(0,index)][1];
}

function paintLight(ctx,x,y,color,radius) {
 const halo = ctx.createRadialGradient(x,y,0,x,y,radius*3);
 halo.addColorStop(0,color);
 halo.addColorStop(.30,color+'ad');
 halo.addColorStop(1,color+'00');
 ctx.fillStyle=halo;
 ctx.fillRect(x-radius*3,y-radius*3,radius*6,radius*6);
 ctx.fillStyle=color;
 ctx.beginPath();ctx.arc(x,y,radius*.66,0,2*Math.PI);ctx.fill();
 ctx.fillStyle='#fff8f1';
 ctx.beginPath();ctx.arc(x,y,radius*.32,0,2*Math.PI);ctx.fill();
}

function starEditor(form) {
 let color=palette[0][1];
 const colors=document.getElementById('glPalette');
 let customColor=false;
 function syncPalette(){
  for(const button of colors.children)button.setAttribute('aria-pressed',String(button.dataset.color===color));
 }
 for(const [name,value] of palette){
  const button=document.createElement('button');button.type='button';
  button.title=name;button.setAttribute('aria-label',name);button.dataset.color=value;
  button.style.setProperty('--swatch',value);button.onclick=()=>{customColor=true;color=value;syncPalette();};colors.append(button);
 }
 form.elements.recipient.addEventListener('change',()=>{
  if(!customColor)color=letterColor({recipient:form.elements.recipient.value});
  syncPalette();
 });
 return {
  open(letter){
   color=letterColor(letter||{recipient:form.elements.recipient.value});
   customColor=Boolean(letter?.color);
   syncPalette();
  },
  values(){return {color};}
 };
}

module.exports={starEditor,letterColor,paintLight};

},
"src/client/galaxy-service.js":function(module,exports,__require){
'use strict';

const service = 'seeya-galaxy-test-v1';
const messages = {
 PASSWORD:'편지 비밀번호가 맞지 않아요.',
 LIMIT:'비밀번호를 여러 번 틀렸어요. 1분 뒤 다시 시도해 주세요.',
 MISSING:'이미 삭제된 편지예요.',
 CONFLICT:'다른 창에서 먼저 변경했어요. 최신 편지를 다시 열어주세요.',
 INVALID:'편지와 별 설정을 다시 확인해 주세요.',
 SETUP:'운영자가 구글 시트 연결을 마치면 이용할 수 있어요.',
 BUSY:'다른 편지를 저장하고 있어요. 잠시 후 다시 눌러주세요.'
};

module.exports = function galaxyService(endpoint) {
 if (!/^https:\/\/script\.google\.com\/macros\/s\/[\w-]+\/exec$/.test(endpoint)) return null;
 async function call(payload) {
  const controller = new AbortController(), timeout = setTimeout(()=>controller.abort(),35000);
  try {
   const options = {credentials:'omit',signal:controller.signal};
   if (payload) Object.assign(options,{method:'POST',headers:{'Content-Type':'text/plain;charset=UTF-8'},body:JSON.stringify({service,...payload})});
   const response = await fetch(payload ? endpoint : endpoint+'?t='+Date.now(),options);
   if (!response.ok) throw Error();
   const data = await response.json();
   if (data.service !== service) throw Error();
   if (!data.ok) throw Object.assign(Error(messages[data.code] || '구글 시트 요청을 처리하지 못했어요.'),{code:data.code});
   return data;
  } catch (e) {
   if (e.code && messages[e.code]) throw e;
   throw Error(payload ? '저장 결과를 확인하지 못했어요. 이 창에서 다시 눌러 확인해 주세요.' : '공유 편지를 불러오지 못했어요. 잠시 후 자동으로 다시 확인할게요.');
  } finally { clearTimeout(timeout); }
 }
 return {list:async()=>{const data=await call();if (!Array.isArray(data.letters)) throw Error('편지 목록을 확인할 수 없어요.');return data.letters;}, change:call};
};

},
"src/data/galaxy-connection.json":function(module,exports,__require){
module.exports={"endpoint":"https://script.google.com/macros/s/AKfycbzibFLscsB5auy4VbyjEa9BesDqf9VRn0JQx6BQOViEB86RykC44PWe58SY57EU5TTJ-w/exec"};
},
"src/client/galaxy-camera.js":function(module,exports,__require){
'use strict';
module.exports=function camera(viewport,scene){
 const label=document.getElementById('glZoomLevel'),plus=document.getElementById('glZoomIn'),minus=document.getElementById('glZoomOut');
 let onZoom=null, reportedZoom=null;
 let zoom=1,x=0,y=0,gesture=null,blockedUntil=0;const pointers=new Map();
 const bounds=()=>({width:viewport.clientWidth,height:viewport.clientHeight});
 function draw(){const b=bounds();x=Math.max(b.width*(1-zoom),Math.min(0,x));y=Math.max(b.height*(1-zoom),Math.min(0,y));scene.style.transform=`translate(${x}px,${y}px) scale(${zoom})`;label.textContent=Math.round(zoom*100)+'%';plus.disabled=zoom>=8;minus.disabled=zoom<=1;viewport.classList.toggle('gl-zoomed',zoom>1);
  scene.style.setProperty('--gl-marker-scale',String(1/Math.sqrt(zoom)));
  if(!pointers.size && reportedZoom!==zoom){reportedZoom=zoom;onZoom?.(zoom);}}
 function zoomAt(next,px,py){next=Math.max(1,Math.min(8,next));const ratio=next/zoom;x=px-(px-x)*ratio;y=py-(py-y)*ratio;zoom=next;draw();}
 function centerZoom(factor){const b=bounds();zoomAt(zoom*factor,b.width/2,b.height/2);}
 function reset(){zoom=1;x=0;y=0;gesture=null;pointers.clear();draw();}
 plus.onclick=()=>centerZoom(1.4);minus.onclick=()=>centerZoom(1/1.4);document.getElementById('glZoomReset').onclick=reset;
 viewport.addEventListener('wheel',e=>{if(e.target.closest('.gl-controls'))return;e.preventDefault();const r=viewport.getBoundingClientRect();zoomAt(zoom*Math.exp(-e.deltaY*.002),e.clientX-r.left,e.clientY-r.top);},{passive:false});
 function snapshot(){const p=[...pointers.values()],r=viewport.getBoundingClientRect();if(!p.length){gesture=null;return;}const mid=p.length>1?{x:(p[0].x+p[1].x)/2,y:(p[0].y+p[1].y)/2}:p[0];gesture={px:mid.x-r.left,py:mid.y-r.top,x,y,zoom,distance:p.length>1?Math.hypot(p[0].x-p[1].x,p[0].y-p[1].y):0};}
 viewport.addEventListener('pointerdown',e=>{if(e.target.closest('.gl-controls')||e.button>0)return;pointers.set(e.pointerId,{x:e.clientX,y:e.clientY});e.target.setPointerCapture(e.pointerId);snapshot();if(pointers.size>1)blockedUntil=Date.now()+500;});
 viewport.addEventListener('pointermove',e=>{if(!pointers.has(e.pointerId)||!gesture)return;pointers.set(e.pointerId,{x:e.clientX,y:e.clientY});const p=[...pointers.values()],r=viewport.getBoundingClientRect();const mid=p.length>1?{x:(p[0].x+p[1].x)/2,y:(p[0].y+p[1].y)/2}:p[0],px=mid.x-r.left,py=mid.y-r.top;
  if(p.length>1&&gesture.distance>0){zoom=Math.max(1,Math.min(8,gesture.zoom*Math.hypot(p[0].x-p[1].x,p[0].y-p[1].y)/gesture.distance));blockedUntil=Date.now()+500;}else if(Math.hypot(px-gesture.px,py-gesture.py)>5)blockedUntil=Date.now()+500;
  const ratio=zoom/gesture.zoom;x=px-(gesture.px-gesture.x)*ratio;y=py-(gesture.py-gesture.y)*ratio;draw();
 });
 function end(e){if(!pointers.has(e.pointerId))return;if(pointers.size>1)blockedUntil=Date.now()+500;pointers.delete(e.pointerId);snapshot();draw();}
 viewport.addEventListener('pointerup',end);viewport.addEventListener('pointercancel',end);viewport.addEventListener('lostpointercapture',end);
 viewport.addEventListener('click',e=>{if(!e.target.closest('.gl-controls')&&Date.now()<blockedUntil&&e.detail!==0){e.preventDefault();e.stopImmediatePropagation();}},true);
 viewport.addEventListener('keydown',e=>{if(e.target!==viewport)return;if(e.key==='+'||e.key==='='){e.preventDefault();centerZoom(1.4);}else if(e.key==='-'){e.preventDefault();centerZoom(1/1.4);}else if(e.key==='0'){e.preventDefault();reset();}else if(['ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(e.key)){e.preventDefault();x+=e.key==='ArrowLeft'?60:e.key==='ArrowRight'?-60:0;y+=e.key==='ArrowUp'?60:e.key==='ArrowDown'?-60:0;draw();}});
 scene.addEventListener('focusin',e=>{if(!e.target.matches('.gl-star:focus-visible'))return;const b=bounds();x=b.width/2-parseFloat(e.target.style.left)*zoom;y=b.height/2-parseFloat(e.target.style.top)*zoom;draw();});
 draw();return{reset,onZoom(callback){onZoom=callback;},get zoom(){return zoom;},locate(px,py,level=3){zoom=level;const b=bounds();x=b.width/2-px*zoom;y=b.height/2-py*zoom;draw();}};
};

},
"src/shared/galaxy-diary.js":function(module,exports,__require){
'use strict';
const P = __require("src/shared/passport.js");
const members = {'씨야':'seeya','남규리':'gyuri','김연지':'yeonji','이보람':'boram'};

// Call only after a confirmed create, password-verified edit or delete.
function update(adapter, id, letter) {
 if (!/^[a-f0-9-]{36}$/.test(id)) throw Error('편지 번호를 확인해 주세요.');
 const entryId = 'galaxy-' + id;
 const store = P.storage(adapter);
 const state = store.get();
 const previous = state.entries.find(e => e.entryId === entryId);
 if (!letter && !previous) return entryId;
 const entries = state.entries.filter(e => e.entryId !== entryId);
 if (letter) {
  if (letter.id !== id || !Object.hasOwn(members,letter.recipient)) throw Error('편지를 확인해 주세요.');
  const now = new Date().toISOString();
  entries.push(P.entry({
   ...previous, entryId, kind:'story', status:'done', date:letter.date,
   title:letter.recipient+'에게 보낸 은하수 편지', members:[members[letter.recipient]],
   note:letter.body, snapshot:{title:letter.nickname},
   createdAt:previous?.createdAt || now, updatedAt:now
  }));
 }
 store.save({...state,entries});
 return entryId;
}
module.exports = {update};

},
"src/shared/passport.js":function(module,exports,__require){
'use strict';
const G=__require("src/shared/passport-goods.js"),Play=__require("src/shared/passport-play.js"),Concert=__require("src/shared/concert-diary.js");
const KEY='seeya-passport-v1';
const DEBUT='2006-03-12';
const defaultStatus=(date,day=today())=>date&&date<day.slice(0,date.length)?'done':'planned';
const beforeDebut=since=>!!since&&since<DEBUT.slice(0,since.length);
const KINDS={concert:'공연 관람',visit:'장소 방문',event:'팬 행사',story:'나의 씨야 이야기',goods:'굿즈 구매',play:'씨야 플레이'};
const MEMBERS={seeya:'씨야 완전체',gyuri:'남규리',yeonji:'김연지',boram:'이보람'};
const COLORS={rose:'#ac365f',violet:'#6856af',teal:'#267866',ink:'#29242d'};
const esc=x=>String(x??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const today=()=>new Intl.DateTimeFormat('sv-SE',{timeZone:'Asia/Seoul'}).format(new Date());
function text(x,max=200){if(typeof x!=='string'||x.length>max)throw Error('글자 수나 입력 형식이 맞지 않습니다.');return x.trim();}
function date(value){
 if(value==='')return '';
 if(typeof value!=='string'||!/^\d{4}(-\d{2}){0,2}$/.test(value))throw Error('날짜 형식을 확인해 주세요.');
 const [y,m,d]=value.split('-').map(Number);if(y<1900||y>2100||m!==undefined&&(m<1||m>12)||d!==undefined&&(d<1||d>new Date(Date.UTC(y,m,0)).getUTCDate()))throw Error('실제 존재하는 날짜를 입력해 주세요.');return value;
}
const precision=d=>['none','year','month','day'][d?d.split('-').length:0];
const dateLabel=d=>d?d.split('-').map((x,i)=>Number(x)+['년','월','일'][i]).join(' '):'날짜 미상';
function profile(p={},allowLegacy=false){if(!p||typeof p!=='object'||Array.isArray(p))throw Error('신분 카드 형식이 올바르지 않습니다.');const since=date(p.since||'');if(!allowLegacy&&beforeDebut(since))throw Error('처음 좋아한 날은 데뷔일인 2006년 3월 12일부터 입력할 수 있어요.');if(since>today().slice(0,since.length))throw Error('입덕일은 오늘 이전으로 입력해 주세요.');return {nickname:text(p.nickname||'',30),since,motto:text(p.motto||'',120),favMember:Object.hasOwn(MEMBERS,p.favMember)?p.favMember:'seeya',favSong:text(p.favSong||'',160),color:Object.hasOwn(COLORS,p.color)?p.color:'rose'};}
function entry(e){
 if(!e||typeof e!=='object'||!Object.hasOwn(KINDS,e.kind)||!['planned','done'].includes(e.status)||typeof e.entryId!=='string'||!/^[-a-zA-Z0-9]{8,80}$/.test(e.entryId))throw Error('기록 형식이 올바르지 않습니다.');
 const title=text(e.title,160);if(!title)throw Error('제목을 입력해 주세요.');
 const dt=date(e.date||'');if(!Array.isArray(e.members)||e.members.length>4||e.members.some(m=>!Object.hasOwn(MEMBERS,m)))throw Error('멤버 정보가 올바르지 않습니다.');
 if(e.status==='done'&&dt>today().slice(0,dt.length))throw Error('미래 날짜는 예정 상태로 저장해 주세요.');
 const time=text(e.time||'',5);if(time&&!/^([01]\d|2[0-3]):[0-5]\d$/.test(time))throw Error('시간을 확인해 주세요.');
 for(const k of ['createdAt','updatedAt'])if(typeof e[k]!=='string'||!/^\d{4}-/.test(e[k])||!Number.isFinite(Date.parse(e[k])))throw Error('기록 저장 시각이 올바르지 않습니다.');
 const snap=e.snapshot||{};
 const songs=e.songs||[],links=e.links||[];
 if(!Array.isArray(songs)||songs.length>400||songs.some(s=>typeof s!=='string'||s.length>180))throw Error('곡 목록을 확인해 주세요.');
 if(!Array.isArray(links)||links.length>8)throw Error('링크는 최대 8개까지 저장할 수 있어요.');
 const checkedLinks=links.map(l=>{const raw=text(l.url,2000),u=new URL(raw);if(u.protocol!=='https:'||u.username||u.password)throw Error('링크는 https:// 주소로 입력해 주세요.');return {url:u.href,label:text(l.label||'',120)};});
 return {entryId:e.entryId,kind:e.kind,status:e.status,title,date:dt,datePrecision:precision(dt),time,members:[...new Set(e.members)],eventId:text(e.eventId||'',160),placeId:text(e.placeId||'',160),archiveId:text(e.archiveId||'',160),songs:e.kind==='concert'?[...new Set(songs)]:[],links:checkedLinks,seat:text(e.seat||'',100),companions:text(e.companions||'',120),note:text(e.note||'',4000),...(e.kind==='goods'?{goods:G.clean(e.goods)}:{}),...(e.kind==='play'?{play:Play.clean(e.play),...(e.concertPoster?{concertPoster:Concert.clean(e.concertPoster)}:{})}:{}),snapshot:{title:text(snap.title||'',300),place:text(snap.place||'',300),address:text(snap.address||'',400)},createdAt:e.createdAt,updatedAt:e.updatedAt};
}
function validate(input,allowLegacyProfile=false){
 if(!input||input.schemaVersion!==1||!Array.isArray(input.entries)||input.entries.length>2000)throw Error('지원하지 않는 백업이거나 기록이 2,000건을 넘습니다.');
 const entries=input.entries.map(entry);if(new Set(entries.map(e=>e.entryId)).size!==entries.length)throw Error('파일 안에 동일한 기록 ID가 반복됩니다.');
 return {schemaVersion:1,profile:profile(input.profile,allowLegacyProfile),entries};
}
const empty=()=>({schemaVersion:1,profile:profile(),entries:[]});
function duplicate(a,b){if(a.kind==='goods'||b.kind==='goods')return a.kind===b.kind&&a.date===b.date&&G.same(a,b);return a.kind===b.kind&&a.date===b.date&&a.time===b.time&&((a.eventId&&a.eventId===b.eventId)||(a.archiveId&&a.archiveId===b.archiveId)||(a.placeId&&a.placeId===b.placeId)||(!a.eventId&&!a.placeId&&!b.eventId&&!b.placeId&&a.title===b.title));}
function review(current,incoming){return {added:incoming.entries.filter(e=>!current.entries.some(x=>x.entryId===e.entryId)).length,conflicts:incoming.entries.filter(e=>current.entries.some(x=>x.entryId===e.entryId)).length,suspected:incoming.entries.filter(e=>current.entries.some(x=>x.entryId!==e.entryId&&duplicate(x,e))).length};}
function merge(current,incoming,replace=false,replaceProfile=false){const rows=new Map(current.entries.map(e=>[e.entryId,e]));for(const e of incoming.entries)if(replace||!rows.has(e.entryId))rows.set(e.entryId,e);return validate({schemaVersion:1,profile:replaceProfile?incoming.profile:current.profile,entries:[...rows.values()]});}
function completed(e,day=today()){return e.status==='done'&&(!e.date||e.date<=day.slice(0,e.date.length));}
function summary(entries,day=today()){const done=entries.filter(e=>completed(e,day));return {concert:done.filter(e=>e.kind==='concert').length,visit:done.filter(e=>e.kind==='visit').length,event:done.filter(e=>e.kind==='event').length,story:done.filter(e=>e.kind==='story').length,goods:done.filter(e=>e.kind==='goods').length,play:done.filter(e=>e.kind==='play').length};}
function storage(adapter){let raw=adapter.getItem(KEY),state=raw?validate(JSON.parse(raw),true):empty();return {get:()=>state,raw:()=>raw,save(next){const checked=validate(next);if(adapter.getItem(KEY)!==raw)throw Error('다른 창에서 수첩이 변경됐습니다. 입력 내용을 복사한 뒤 새로고침해 주세요.');const value=JSON.stringify(checked);adapter.setItem(KEY,value);raw=value;state=checked;return state;}};}
module.exports={KEY,DEBUT,defaultStatus,beforeDebut,KINDS,MEMBERS,COLORS,esc,today,date,precision,dateLabel,profile,entry,validate,empty,duplicate,review,merge,completed,summary,storage};

},
"src/shared/passport-goods.js":function(module,exports,__require){
'use strict';
function clean(value={}){
 if(!value||typeof value!=='object'||Array.isArray(value))throw Error('굿즈 정보를 확인해 주세요.');
 const str=(v,max)=>{if(typeof v!=='string'||v.length>max)throw Error('굿즈 정보의 글자 수를 확인해 주세요.');return v.trim();};
 const quantity=value.quantity??1,amount=value.amount??null;
 if(!Number.isInteger(quantity)||quantity<1||quantity>999)throw Error('수량은 1~999개의 정수로 입력해 주세요.');
 if(amount!==null&&(!Number.isInteger(amount)||amount<0||amount>999999999))throw Error('결제금액은 0~999,999,999원의 정수로 입력해 주세요.');
 return {catalogId:str(value.catalogId||'',80),quantity,amount,shop:str(value.shop||'',160),variant:str(value.variant||'',100)};
}
function same(a,b){
 const x=a.goods||{},y=b.goods||{};
 return (x.catalogId&&y.catalogId?x.catalogId===y.catalogId:a.title===b.title)&&(x.variant||'')===(y.variant||'')&&(x.shop||'')===(y.shop||'');
}
function totals(entries,day=new Intl.DateTimeFormat('sv-SE',{timeZone:'Asia/Seoul'}).format(new Date())){const rows=entries.filter(e=>e.kind==='goods'&&e.status==='done'&&(!e.date||e.date<=day.slice(0,e.date.length)));return {records:rows.length,quantity:rows.reduce((n,e)=>n+(e.goods?.quantity||1),0)};}
function eventValues(event){return {eventId:event.id,placeId:event.placeId||'',archiveId:event.archiveId||'',snapshot:{title:event.title,place:event.venue||'',address:''}};}
module.exports={clean,same,totals,eventValues};

},
"src/shared/passport-play.js":function(module,exports,__require){
'use strict';
const GAMES={lyrics:'가사 보고 제목 맞히기',exam:'씨야 모의고사',other:'기타 씨야 플레이'};
function clean(p={}){
 if(!p||typeof p!=='object'||!Object.hasOwn(GAMES,p.game))throw Error('플레이 종류를 선택해 주세요.');
 const text=(s,n)=>{if(typeof s!=='string'||s.length>n)throw Error('플레이 정보를 확인해 주세요.');return s.trim();};
 const number=v=>{if(v==null||v==='')return null;if(!Number.isInteger(v)||v<0||v>10000)throw Error('점수·정답 수는 0 이상의 정수로 입력해 주세요.');return v;};
 const score=number(p.score),maxScore=number(p.maxScore),correct=number(p.correct),total=number(p.total);
 if((score!==null&&maxScore===null)||maxScore===0||score>maxScore)throw Error('점수와 만점을 함께 확인해 주세요.');
 if((correct!==null&&total===null)||total===0||correct>total)throw Error('정답 수와 전체 문항 수를 함께 확인해 주세요.');
 return {game:p.game,level:text(p.level||'',80),mode:text(p.mode||'',30),score,maxScore,correct,total,source:p.source==='result'?'result':'manual'};
}
function summary(p){if(!p)return '';return [p.level,p.mode,p.score==null?'':`${p.score} / ${p.maxScore}점`,p.correct==null?'':`정답 ${p.correct} / ${p.total}개`].filter(Boolean).join(' · ');}
module.exports={GAMES,clean,summary};

},
"src/shared/concert-diary.js":function(module,exports,__require){
'use strict';
const D=__require("src/shared/my-concert-design.js");
const sections={opening:3,main:25,encore:4};
function clean(value){
 if(!value||value.version!==1)throw Error('콘서트 포스터 형식을 확인해 주세요.');
 const text=(v,max)=>{if(typeof v!=='string'||v.length>max)throw Error('콘서트 포스터 내용을 확인해 주세요.');return v;};
 const d=value.draft;if(!d||!Object.hasOwn(D.themes,d.theme)||!Object.hasOwn(D.fonts,d.font))throw Error('포스터 배경·글꼴을 확인해 주세요.');
 const ids=[];const checked={};
 for(const [key,max] of Object.entries(sections)){
  const list=d.sections?.[key];if(!Array.isArray(list)||!list.length||list.length>max)throw Error('포스터 곡 수를 확인해 주세요.');
  checked[key]=list.map(id=>{text(id,100);if(!/^[-a-zA-Z0-9_]+$/.test(id)||ids.includes(id))throw Error('포스터 곡 정보를 확인해 주세요.');ids.push(id);return id;});
 }
 if(!Array.isArray(value.songs)||value.songs.length>32)throw Error('포스터 곡 목록을 확인해 주세요.');
 const songs=value.songs.map(s=>({id:text(s.id,100),title:text(s.title,300),artistType:s.artistType==='solo'?'solo':'group',artistNames:Array.isArray(s.artistNames)&&s.artistNames.length<=4?s.artistNames.map(n=>text(n,100)):[]}));
 if(new Set(songs.map(s=>s.id)).size!==songs.length||ids.some(id=>!/^hidden-[0-9a-z-]+$/.test(id)&&!songs.some(s=>s.id===id)))throw Error('포스터의 곡 제목이 빠져 있어요.');
 if(!Array.isArray(d.vcrs)||d.vcrs.length>64||d.vcrs.some(v=>!Number.isInteger(v.after)||v.after<1||v.after>=ids.length))throw Error('포스터 VCR 위치를 확인해 주세요.');
 return {version:1,draft:{title:text(d.title,120),planner:text(d.planner,80),theme:d.theme,font:d.font,format:D.outputFormat(d.theme,d.format),sections:checked,vcrs:d.vcrs.map(v=>({after:v.after}))},songs};
}
function snapshot(d,songs){const ids=Object.values(d.sections).flat();return clean({version:1,draft:d,songs:songs.filter(s=>ids.includes(s.id))});}
module.exports={clean,snapshot};

},
"src/shared/my-concert-design.js":function(module,exports,__require){
'use strict';
// Coordinates are in the exported 1080 × 1350 poster.
const themes = {
  curtain: {label:'커튼콜', left:102, right:978, top:152, bottom:1030, centered:true},
  skyline: {label:'도시의 밤', left:84, right:996, top:82, bottom:910, dark:true},
  blossom: {label:'벚꽃 무대', left:165, right:915, top:140, bottom:934, centered:true},
  paper: {label:'종이 셋리스트', left:108, right:972, top:106, bottom:1210},
  breeze: {label:'봄빛 편지', left:126, right:954, top:178, bottom:1160, centered:true},
  spotlight: {label:'세 개의 스포트라이트', left:96, right:984, top:128, bottom:1120, dark:true, centered:true},
  pressed: {label:'장미 편지', left:120, right:960, top:330, bottom:1010, centered:true},
  ribbon: {label:'핑크 리본', left:108, right:972, top:154, bottom:1190, centered:true},
  blueTicket: {label:'블루 티켓', left:114, right:978, top:120, bottom:1160, centered:true},
  rose: {label:'로즈 티켓', left:86, right:994, top:96, bottom:1170},
  night: {label:'나이트 스테이지', left:86, right:994, top:96, bottom:1170, dark:true}
};
const fonts = {
  dodum: {label:'고운돋움', family:'"Passport Dodum", sans-serif'},
  jua: {label:'배민 주아체', family:'"Concert Jua", sans-serif'},
  yeonsung: {label:'배민 연성체', family:'"Concert Yeon Sung", serif'},
  gaegu: {label:'개구체', family:'"Concert Gaegu", cursive'},
  pen: {label:'나눔손글씨 펜', family:'"Passport Pen", cursive'},
  batang: {label:'고운바탕', family:'"Passport Batang", serif'}
};
const formats={poster:'한 장 포스터',long:'읽기 편한 긴 이미지'};
const backdrop = key => ['curtain','skyline','blossom','paper','breeze','spotlight','pressed','ribbon','blueTicket'].includes(key) ? '/images/game/concert-poster-'+key+'.png' : '';
const allowsLong=theme=>!['curtain','blossom','pressed'].includes(theme);
const outputFormat=(theme,format)=>format==='long'&&allowsLong(theme)?'long':'poster';
module.exports = {themes, fonts, formats, backdrop, allowsLong, outputFormat};


}
};const cache={};function __require(id){if(cache[id])return cache[id].exports;const m=cache[id]={exports:{}};modules[id](m,m.exports,__require);return m.exports;}__require("src/client/galaxy.js");})();
