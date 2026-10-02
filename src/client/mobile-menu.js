(function(){
 'use strict';
 const menu=document.getElementById('mobileMenu');if(!menu)return;
 const summary=menu.querySelector('summary');
 function close(restore){const opened=menu.open;menu.open=false;if(opened&&restore)summary.focus({preventScroll:true});}
 menu.querySelector('.mobile-menu-close').addEventListener('click',()=>close(true));
 document.addEventListener('keydown',event=>{if(event.key==='Escape'&&menu.open){event.preventDefault();event.stopPropagation();close(true);}},true);
 document.addEventListener('click',event=>{if(menu.open&&!menu.contains(event.target))close(false);});
 menu.querySelectorAll('a').forEach(link=>link.addEventListener('click',()=>close(false)));
 const mobile=window.matchMedia('(max-width:850px)');
 mobile.addEventListener('change',event=>{if(!event.matches)close(false);});
 window.addEventListener('pagehide',()=>close(false));
 document.querySelectorAll('.mobile-compact a').forEach(link=>{if(link.pathname===location.pathname)link.setAttribute('aria-current','page');});
})();
