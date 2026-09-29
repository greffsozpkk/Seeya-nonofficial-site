'use strict';
// Fallback only: registration failure must not affect the online site.
if('serviceWorker' in navigator&&window.isSecureContext){
 const register=()=>navigator.serviceWorker.register('/sw.js',{scope:'/',updateViaCache:'none'}).catch(()=>{});
 if(document.readyState==='complete')register();
 else window.addEventListener('load',register,{once:true});
}
