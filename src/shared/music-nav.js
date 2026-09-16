module.exports=function musicNav(active){
 return '<nav class="music-subnav" aria-label="음악 메뉴">'+[
  ['discography','/music/','DISCOGRAPHY'],['stages','/music/stages/','곡별 무대'],['fanchant','/music/fanchant/','FAN CHANT · 응원법']
 ].map(([key,url,label])=>`<a href="${url}"${key===active?' class="active" aria-current="page"':''}>${label}</a>`).join('')+'</nav>';
};
