'use strict';
// Installation only. No service worker, offline cache, storage or forced reload.
(() => {
 const button=document.getElementById('pwaInstall');
 const status=document.getElementById('pwaStatus');
 const mode=window.matchMedia('(display-mode: standalone)');
 let pending=null,installed=false,busy=false;
 const standalone=()=>mode.matches||navigator.standalone===true;
 function render(){
  const running=standalone();
  if(button){button.hidden=running||installed||!pending;button.disabled=busy;}
  if(status&&(running||installed))status.textContent=running?'홈 화면 앱으로 이용 중이에요.':'추가되었습니다. 홈 화면 또는 앱 목록에서 SEEYA ARCHIVE를 찾아보세요.';
 }
 window.addEventListener('beforeinstallprompt',event=>{
  // Only suppress native promotion on the installation page, where an install button exists.
  if(!button||standalone()||installed)return;
  event.preventDefault();pending=event;render();
 });
 window.addEventListener('appinstalled',()=>{installed=true;pending=null;render();});
 if(mode.addEventListener)mode.addEventListener('change',render);
 if(button)button.addEventListener('click',async()=>{
  if(!pending||busy)return;
  const prompt=pending;pending=null;busy=true;button.disabled=true;
  try{
   await prompt.prompt();
   const choice=await prompt.userChoice;
   if(status&&!installed)status.textContent=choice.outcome==='accepted'?'설치 요청을 보냈어요. 완료 후 홈 화면 또는 앱 목록에서 확인해 주세요.':'나중에 브라우저 메뉴에서도 추가할 수 있어요.';
  }catch(_){if(status)status.textContent='아래 안내에 따라 브라우저 메뉴에서 홈 화면에 추가해 주세요.';}
  finally{busy=false;render();}
 });
 render();
})();
