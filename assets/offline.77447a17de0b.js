(function(){'use strict';const modules={
"src/client/offline.js":function(module,exports,__require){
'use strict';
// Fallback only: registration failure must not affect the online site.
if('serviceWorker' in navigator&&window.isSecureContext){
 const register=()=>navigator.serviceWorker.register('/sw.js',{scope:'/',updateViaCache:'none'}).catch(()=>{});
 if(document.readyState==='complete')register();
 else window.addEventListener('load',register,{once:true});
}

}
};const cache={};function __require(id){if(cache[id])return cache[id].exports;const m=cache[id]={exports:{}};modules[id](m,m.exports,__require);return m.exports;}__require("src/client/offline.js");})();
