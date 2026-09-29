module.exports=function aboutNav(active){
 const pages=[['letter','/about/','제작자의 편지'],['install','/about/install/','홈 화면에 추가']];
 return `<nav class="music-subnav about-subnav" aria-label="ABOUT 메뉴">${pages.map(([key,url,label])=>`<a href="${url}"${key===active?' class="active" aria-current="page"':''}>${label}</a>`).join('')}</nav>`;
};
