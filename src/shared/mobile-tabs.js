'use strict';
const tabs=[
 ['홈','/','M3 10 12 3l9 7v10h-6v-6H9v6H3Z'],
 ['일정','/calendar/','M4 6h16v15H4ZM8 3v5m8-5v5M4 11h16'],
 ['기록','/archive/','M3 6h7l2 2h9v12H3ZM6 13h12'],
 ['놀이터','/game/','M7 7h10c3 0 4 3 5 10 .3 3-2 4-4 2l-3-3H9l-3 3c-2 2-4.3 1-4-2 1-7 2-10 5-10Zm0 3v4m-2-2h4m7 0h.1m2-2h.1'],
 ['다이어리','/diary/','M6 3h13v18H6a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2Zm2 0v18m3-13h5']
];
module.exports=function mobileTabs(path){
 const links=tabs.map(([name,url,icon])=>{
  const current=url==='/'?path==='/':path.startsWith(url);
  return `<a href="${url}"${current?' aria-current="page"':''}><svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="${icon}"/></svg><span>${name}</span></a>`;
 });
 return '<nav class="mobile-tabs" aria-label="바로가기">'+links.join('')+'</nav>';
};
