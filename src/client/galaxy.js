(() => {
 const {layout}=require('../shared/galaxy-layout');
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
 const {starEditor,letterColor,paintLight}=require('./galaxy-art');
 const recipients=['씨야','남규리','김연지','이보람'];let mine=[],storageOK=true;
 try{const saved=JSON.parse(localStorage.getItem(key)||'[]');if(Array.isArray(saved))mine=saved.filter(x=>x&&typeof x.id==='string'&&x.id.startsWith('local-')&&recipients.includes(x.recipient)&&typeof x.body==='string'&&x.body.trim()&&x.body.length<=1000&&typeof x.nickname==='string'&&x.nickname.length<=20&&/^\d{4}-\d{2}-\d{2}$/.test(x.date)).slice(-100);}catch{storageOK=false;}
 let filter='전체',view='sky',page=1,current=null,lastFocus=null;
 const density=$('glDensity'),options=[24,200,300,500,1000],initial=Number(new URLSearchParams(location.search).get('stars'));
 density.value=String(options.includes(initial)?initial:24);
 const shared=!options.includes(initial);
 const service=require('./galaxy-service')(require('../data/galaxy-connection.json').endpoint);
 let letters=[],generation=0,loading=false,lastRead=0,connected=false;
 const sharingNote='이곳에 남긴 편지는 테스트 주소를 방문한 누구나 읽을 수 있어요.';
 density.parentElement.hidden=shared;
 if(shared){
  $('glCompose').disabled=true;
  $('glForm').querySelector('.gl-form-note').textContent=sharingNote;
  $('glFind').querySelector('.gl-form-note').textContent='팬들이 함께 남긴 편지를 닉네임으로 찾을 수 있어요.';
  $('glConnection').textContent=service?'공유 편지를 불러오고 있어요.':'공유 은하수는 구글 시트 연결을 기다리고 있어요.';
 }else{
  $('glConnection').textContent='예시 은하수 · 여기서 직접 쓴 편지는 이 브라우저에만 저장됩니다.';
 }
 const demo=Array.from({length:1000},(_,i)=>{const base=samples[i%samples.length];return i<samples.length?base:{...base,id:'demo-'+i,nickname:'예시 팬 '+(i+1),body:'은하수가 커진 모습을 보여주는 예시 편지입니다.\n\n'+base.body};});
 const all=()=>shared?letters:[...demo.slice(0,Number(density.value)),...mine];const filtered=()=>all().filter(x=>filter==='전체'||x.recipient===filter);const size=()=>view==='sky'?Math.max(1,all().length):8;
 const camera=require('./galaxy-camera')($('glSky'),$('glScene'));
 function save(){try{localStorage.setItem(key,JSON.stringify(mine));storageOK=true;return true;}catch{storageOK=false;return false;}}
 function notice(text){$('glNotice').textContent=text;}
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
  skyCaption.textContent=band?'별무리를 누르면 가까이 모인 편지들이 펼쳐져요.':'가까이 다가가면, 작은 빛 하나에도 마음이 있어요.';
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
 let draftId,writeRequest,deleteRequest;
 function compose(letter=null){draftId=letter?.id||crypto.randomUUID();writeRequest=crypto.randomUUID();editing=letter;form.reset();form.elements.body.setCustomValidity('');$('glError').textContent='';$('glWriteTitle').textContent=letter?'별에 담은 마음 고치기':'당신의 마음을 별로 남겨요.';
  $('glSubmit').textContent=letter?'비밀번호 확인 후 수정':'밤하늘에 내 별 띄우기';form.elements.password.autocomplete=letter?'current-password':'new-password';
  if(letter){form.elements.recipient.value=letter.recipient;form.elements.nickname.value=letter.nickname;form.elements.body.value=letter.body;}
  const previousPoint=letter&&skyEntries.find(entry=>entry.letter.id===letter.id);
  const skyWidth=$('glSky').clientWidth;
  editor.open(letter,previousPoint&&skyWidth?(previousPoint.x-22)/(skyWidth-44):undefined);
  $('glLength').textContent=form.elements.body.value.length+' / 1,000';open($('glWrite'));
 }
 $('glCompose').onclick=()=>compose();
 $('glEdit').onclick=()=>{if(!current||current.sample||(!shared&&!validLock(current.lock)))return;close($('glLetter'));compose(current);};
 $('glDelete').onclick=()=>{if(!current||current.sample||(!shared&&!validLock(current.lock)))return;removing=current;deleteRequest=crypto.randomUUID();close($('glLetter'));removeForm.reset();$('glRemoveError').textContent='';open($('glRemove'));};
 $('glWrite').addEventListener('close',()=>{form.elements.password.value='';});
 $('glRemove').addEventListener('close',()=>{removeForm.elements.password.value='';});
 form.elements.body.addEventListener('input',()=>{$('glLength').textContent=form.elements.body.value.length+' / 1,000';form.elements.body.setCustomValidity('');});
 form.addEventListener('submit',async e=>{
  e.preventDefault();if($('glSubmit').disabled)return;const design=editor.values();const target=editing,body=form.elements.body.value.trim(),nickname=form.elements.nickname.value.trim()||'익명의 씨야 팬',recipient=form.elements.recipient.value,password=form.elements.password.value;
  if(!body){form.elements.body.setCustomValidity('편지를 한 줄 이상 적어주세요.');form.elements.body.reportValidity();return;}
  if(!shared&&!target&&mine.length>=100){$('glError').textContent='이 브라우저에는 편지를 100통까지 저장할 수 있어요.';return;}
  $('glSubmit').disabled=true;$('glError').textContent='';
  try{
   if(shared){
    const proof=await verifier(password,draftId.replaceAll('-',''));
    const {letter}=await service.change({action:target?'edit':'create',id:draftId,requestId:writeRequest,revision:target?.revision,proof,nickname,body,recipient,...design});
    applyShared(letter.id,letter);
    $('glWrite').close();form.reset();showOnSky(letter.id);
    notice(target?'공유 편지를 수정했어요.':'함께 보는 밤하늘에 내 별이 떠올랐어요.');
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
    applyShared(target.id,null);$('glRemove').close();render();notice('공유 은하수에서 편지를 삭제했어요.');return;
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
  $('glConnection').textContent=sharingNote;
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
   letters=next;connected=true;lastRead=Date.now();
   $('glCompose').disabled=false;
   $('glConnection').textContent=letters.length?sharingNote:'아직 별이 없어요. 첫 편지를 남겨 함께 보는 은하수를 시작해 주세요.';
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
