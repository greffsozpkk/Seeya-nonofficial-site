module.exports=function guideNav(active){
  const pages=[['guide','/guide/','입문 가이드'],['dictionary','/guide/dictionary/','씨야사전']];
  return `<nav class="music-subnav guide-subnav" aria-label="입문 가이드 메뉴">${pages.map(([key,url,label])=>`<a href="${url}"${key===active?' class="active" aria-current="page"':''}>${label}</a>`).join('')}</nav>`;
};
