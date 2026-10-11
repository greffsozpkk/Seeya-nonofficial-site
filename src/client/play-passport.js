'use strict';
const S=require('../shared/passport-play-save');
function mount(host,record=null){
 host.innerHTML=`<section class="play-passport"><label><input type="checkbox" data-play-auto> 씨야 플레이 완료 결과를 다이어리에 자동 저장</label><p>이 기기에서만 저장합니다. 모의고사·가사 퀴즈에 함께 적용되며 이름·답안은 저장하지 않아요.${record?' 지금 켜면 이 결과부터 저장해요.':''}</p>${record?'<button type="button" data-play-save>이 결과만 다이어리에 저장</button>':''}<a href="/diary/${record?'':'#new?kind=play'}">${record?'다이어리 보기':'플레이 기록 직접 남기기'} →</a><p data-play-status role="status"></p></section>`;
 const check=host.querySelector('[data-play-auto]'),button=host.querySelector('[data-play-save]'),status=host.querySelector('[data-play-status]');let busy=false;
 try{check.checked=S.enabled(localStorage);}catch{check.disabled=true;status.textContent='이 브라우저의 저장소를 사용할 수 없어요.';}
 async function save(){
  if(!record||busy)return;busy=true;if(button)button.disabled=true;
  try{
   const task=()=>S.save(localStorage,record),saved=navigator.locks?await navigator.locks.request('seeya-passport-save',task):task();
   status.textContent=saved.already?'이미 저장한 결과입니다.':'다이어리에 결과를 저장했어요.';
   const a=host.querySelector('a');a.href='/diary/#entry='+encodeURIComponent(saved.id);a.textContent='저장한 기록 보기 →';
   if(button)button.textContent='저장 완료';
  }catch(e){status.textContent='저장하지 못했어요. '+e.message;if(button)button.disabled=false;}finally{busy=false;}
 }
 check.addEventListener('change',()=>{try{S.preference(localStorage,check.checked);status.textContent=check.checked?'완료 결과 자동 저장을 켰어요.':'앞으로의 자동 저장을 껐어요. 기존 기록은 유지됩니다.';if(check.checked&&record)save();}catch{check.checked=false;status.textContent='설정을 저장하지 못했어요. 브라우저의 사이트 저장 허용 여부를 확인해 주세요.';}});
 button?.addEventListener('click',save);
 if(record&&check.checked)save();
}
module.exports={mount,result:S.result};
