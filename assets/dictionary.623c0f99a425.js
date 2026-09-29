(function(){'use strict';const modules={
"src/client/dictionary.js":function(module,exports,__require){
'use strict';
const form=document.getElementById('dictionaryTools');
if(form){
 const input=document.getElementById('dictionarySearch'),member=document.getElementById('dictionaryMember');
 const entries=[...document.querySelectorAll('.dictionary-entry')];
 const normalize=s=>s.normalize('NFKC').toLowerCase().replace(/\s+/g,'');
 function filter(){
  const q=normalize(input.value);let count=0;
  for(const entry of entries){
   const match=normalize(entry.dataset.search).includes(q)&&(!member.value||entry.dataset.members.split('|').includes(member.value));
   entry.hidden=!match;if(match)count++;
  }
  document.getElementById('dictionaryCount').textContent=`${count}개의 표현`;
  document.getElementById('dictionaryEmpty').hidden=count!==0;
 }
 function clear(){input.value='';member.value='';filter();}
 function openHash(){
  let id;try{id=decodeURIComponent(location.hash.slice(1));}catch{return;}
  const entry=entries.find(e=>e.id===id);if(!entry)return;
  clear();entry.open=true;
  entry.querySelector('summary').focus({preventScroll:true});entry.scrollIntoView({block:'start'});
 }
 form.hidden=false;
 form.addEventListener('submit',e=>{e.preventDefault();filter();});
 form.addEventListener('reset',e=>{e.preventDefault();clear();input.focus();});
 input.addEventListener('input',filter);member.addEventListener('change',filter);
 document.getElementById('dictionaryClear').addEventListener('click',()=>{clear();input.focus();});
 document.querySelector('.dictionary-page').addEventListener('click',e=>{
  const anchor=e.target.closest('a[href]');if(!anchor)return;
  const url=new URL(anchor.href);if(url.origin!==location.origin||url.pathname!==location.pathname||!url.hash)return;
  // A link to the current hash still needs to reopen a closed/filtered entry.
  if(url.hash===location.hash){e.preventDefault();openHash();}
 });
 window.addEventListener('hashchange',openHash);openHash();
}

}
};const cache={};function __require(id){if(cache[id])return cache[id].exports;const m=cache[id]={exports:{}};modules[id](m,m.exports,__require);return m.exports;}__require("src/client/dictionary.js");})();
