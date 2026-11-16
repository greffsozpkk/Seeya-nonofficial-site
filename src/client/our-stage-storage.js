'use strict';
// The last successfully observed value is a compare-and-swap baseline.
module.exports=function({storage,key,load}){
 let baseline=storage.getItem(key),dirty=false,conflict=false;
 function pull(){const raw=storage.getItem(key);if(dirty){conflict=raw!==baseline;return null;}if(raw===baseline)return null;const value=raw?load(raw):null;baseline=raw;return value;}
 function write(value){dirty=true;try{const raw=storage.getItem(key);if(raw!==baseline){conflict=true;return false;}const next=JSON.stringify(value);storage.setItem(key,next);baseline=next;dirty=false;conflict=false;return true;}catch{return false;}}
 function adopt(){baseline=storage.getItem(key);dirty=false;conflict=false;}
 function discard(){const raw=storage.getItem(key);const value=raw?load(raw):null;baseline=raw;dirty=false;conflict=false;return value;}
 return {pull,write,adopt,discard,get dirty(){return dirty;},get conflict(){return conflict;}};
};
