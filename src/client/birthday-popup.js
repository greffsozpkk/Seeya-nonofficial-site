'use strict';
const {DAY,STORAGE_KEY,END,isBirthday}=require('../shared/birthday-popup');
function initBirthdayPopup(doc=document,win=window,now=()=>new Date()){
 const dialog=doc.getElementById('birthdayPopup');
 if(!dialog||!isBirthday(now())||typeof dialog.showModal!=='function')return;
 const suppressed=()=>{try{return win.localStorage.getItem(STORAGE_KEY)===DAY;}catch{return false;}};
 if(suppressed())return;
 const checkbox=doc.getElementById('birthdayPopupHide'),closeButton=doc.getElementById('birthdayPopupClose'),image=doc.getElementById('birthdayPopupImage');
 let timer;
 const close=()=>{if(dialog.open)dialog.close();doc.documentElement.classList.remove('birthday-popup-open');win.clearTimeout(timer);};
 const expire=()=>{if(!isBirthday(now())||suppressed())close();};
 checkbox.addEventListener('change',()=>{try{if(checkbox.checked)win.localStorage.setItem(STORAGE_KEY,DAY);else win.localStorage.removeItem(STORAGE_KEY);}catch{/* Closing remains available when browser storage is unavailable. */}});
 closeButton.addEventListener('click',close);
 dialog.addEventListener('close',()=>{doc.documentElement.classList.remove('birthday-popup-open');win.clearTimeout(timer);});
 dialog.addEventListener('cancel',event=>{event.preventDefault();close();});
 dialog.addEventListener('click',event=>{if(event.target!==dialog)return;const rect=dialog.getBoundingClientRect();if(event.clientX<rect.left||event.clientX>rect.right||event.clientY<rect.top||event.clientY>rect.bottom)close();});
 doc.addEventListener('visibilitychange',expire);
 win.addEventListener('pageshow',expire);
 win.addEventListener('storage',event=>{if(event.key===STORAGE_KEY||event.key===null)expire();});
 image.addEventListener('error',close);
 image.src=image.dataset.birthdaySrc;
 dialog.showModal();
 doc.documentElement.classList.add('birthday-popup-open');
 const atMidnight=()=>{expire();if(dialog.open)timer=win.setTimeout(atMidnight,Math.max(1,END-now().getTime()));};
 timer=win.setTimeout(atMidnight,Math.max(1,END-now().getTime()));
}
module.exports={initBirthdayPopup};
