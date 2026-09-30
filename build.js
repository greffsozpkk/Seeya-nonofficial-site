'use strict';
process.env.TZ='Asia/Seoul';
// Generated HTML and assets are outputs. Edit src/ and data/, then run node build.js.
const fs=require('node:fs');
const path=require('node:path');
const crypto=require('node:crypto');
const root=__dirname;
const args=process.argv.slice(2);
if(args.some(arg=>arg!=='--preview'))throw new Error('Usage: node build.js [--preview]');
const outputRoot=args.includes('--preview')?require('./scripts/preview-path')(root):root;
require('./scripts/conflict-markers')(root,['src','data','scripts','build.js']);
let archiveText;
const read=p=>p==='data/archive.json'&&archiveText!==undefined?archiveText:fs.readFileSync(path.join(root,p),'utf8');
const json=p=>JSON.parse(read(p));
const write=(p,s)=>{fs.mkdirSync(path.dirname(path.join(outputRoot,p)),{recursive:true});fs.writeFileSync(path.join(outputRoot,p),s);};
const originalArchive=read('data/archive.json');
archiveText=JSON.stringify(require('./scripts/apply-archive-updates')(JSON.parse(originalArchive)),null,2)+'\n';
if(originalArchive!==archiveText||outputRoot!==root)write('data/archive.json',archiveText);
const routes=json('src/data/routes.json'),site=json('src/data/site.json');
const pwa=json('src/data/pwa.json');
const {esc}=require('./src/shared/common');
// Small local CommonJS bundler: build-time only, no npm or browser dependency.
function bundle(entry){
 const modules=new Map();
 function visit(file){
  if(modules.has(file))return file;
  modules.set(file,'');
  let source=read(file);
  if(file.endsWith('.json'))source='module.exports='+JSON.stringify(JSON.parse(source))+';';
  else source=source.replace(/require\(['"]([^'"]+)['"]\)/g,(_,ref)=>{
   if(!ref.startsWith('.'))throw new Error('Only local modules are supported: '+ref);
   let dep=path.posix.normalize(path.posix.join(path.posix.dirname(file),ref));
   if(!path.posix.extname(dep))dep+='.js';
   if(dep.startsWith('../'))throw new Error('Module outside project');
   visit(dep);return '__require('+JSON.stringify(dep)+')';
  });
  modules.set(file,source);return file;
 }
 visit(entry);
 return `(function(){'use strict';const modules={\n${[...modules].map(([id,s])=>JSON.stringify(id)+':function(module,exports,__require){\n'+s+'\n}').join(',\n')}\n};const cache={};function __require(id){if(cache[id])return cache[id].exports;const m=cache[id]={exports:{}};modules[id](m,m.exports,__require);return m.exports;}__require(${JSON.stringify(entry)});})();\n`;
}
const assets=[];
function asset(name,ext,source){const hash=crypto.createHash('sha256').update(source).digest('hex').slice(0,12);const p=`assets/${name}.${hash}.${ext}`;write(p,source);assets.push(p);return '/'+p;}
const siteCss=asset('site','css',read('src/styles/site.css')+'\n'+read('src/styles/stages.css')+'\n'+read('src/styles/concerts.css')+'\n'+read('src/styles/letter.css')+'\n'+read('src/styles/pwa.css')+'\n'+read('src/styles/home-upcoming.css'));
const pwaJs=asset('pwa','js',bundle('src/client/pwa.js'));
const offlineJs=asset('offline','js',bundle('src/client/offline.js'));
const offlineHtml=read('src/offline.html');
const offlineHash=crypto.createHash('sha256').update(offlineHtml).digest('hex').slice(0,12);
const offlinePaths=routes.flatMap(r=>[r.path,...(r.path==='/'?['/index.html']:[r.path.slice(0,-1),r.path+'index.html'])]);
write('offline.html',offlineHtml);
write('sw.js',read('src/service-worker.js').replace('__OFFLINE_HASH__',JSON.stringify(offlineHash)).replace('__PUBLIC_PATHS__',JSON.stringify(offlinePaths)));
const quizCss=asset('lyric-quiz','css',read('src/styles/lyric-quiz.css'));
const siteJs=asset('site','js',bundle('src/client/site.js'));
const quizJs=asset('lyric-quiz','js',bundle('src/client/lyric-quiz.js'));
const fanCss=asset('fan-gallery','css',read('src/styles/fan-gallery.css'));
const fanJs=asset('fan-gallery','js',bundle('src/client/fan-gallery.js'));
const examCss=asset('seeya-exam','css',read('src/styles/exam.css'));
const examJs=asset('seeya-exam','js',bundle('src/client/exam.js'));
const dictionaryCss=asset('dictionary','css',read('src/styles/dictionary.css'));
const dictionaryJs=asset('dictionary','js',bundle('src/client/dictionary.js'));
const calendarCss=asset('calendar','css',read('src/styles/calendar.css'));
const calendarJs=asset('calendar','js',bundle('src/client/calendar.js'));
const adminCss=asset('archive-admin','css',read('src/admin/admin.css'));
const adminJs=asset('archive-admin','js',read('src/admin/admin.js'));
write('manage/index.html',read('src/admin/template.html').replace('{{adminCss}}',adminCss).replace('{{adminJs}}',adminJs));
const archiveRows=json('data/archive.json');
const {buildEvents,buildAnniversaries}=require('./src/shared/calendar-data');
const {calendarICS}=require('./src/shared/calendar-ics');
const debut=archiveRows.find(row=>row.id==='20060312-inkigayo-debut');
if(!debut)throw Error('Missing debut record for calendar');
const calendarData={asOf:site.snapshotDate.slice(0,10),events:buildEvents(archiveRows),anniversaries:buildAnniversaries(json('src/data/members.json'),json('src/data/albums.json'),debut)};
write('calendar/events.json',JSON.stringify(calendarData)+'\n');
write('calendar/activities.ics',calendarICS(calendarData.events));
write('calendar/anniversaries.ics',calendarICS(calendarData.anniversaries,'씨야 기념일'));
const previewRoute=json('src/data/exam-preview-route.json');
if(!/^\/preview\/seeya-exam-[a-f0-9]{16}\/$/.test(previewRoute.path)||!previewRoute.unlisted)throw new Error('Invalid exam preview route');
const photosRaw=json('data/photos.json');
const photos=(Array.isArray(photosRaw)?photosRaw:photosRaw.photos||[]).filter(x=>x&&x.hidden!==true).sort((a,b)=>String(b.date||'').localeCompare(String(a.date||''))||Number(a.order||999)-Number(b.order||999));
const template=read('src/template.html');
const files=[];
for(const route of [...routes,previewRoute]){
 const key=route.key;
 const render=require('./src/pages/'+(key==='fanchant'?'music':key)+'.js');
 let content;
 if(key==='news')content=render(json('data/news.json'));
 else if(key==='calendar')content=render(calendarData);
 else if(key==='home')content=render(archiveRows,new Date(site.snapshotDate));
 else if(key==='archive')content=render(require('./src/shared/archive-data').mergeArchive(json('data/archive.json')));
 else if(key==='gallery')content=render(photos,new Date(site.snapshotDate));
 else if(key==='today'){let seed=465;const random=()=>((seed=(seed*1664525+1013904223)>>>0)/4294967296);content=render(new Date(site.snapshotDate),random,json('data/archive.json'));}
 else if(key==='stages'||key==='song'||key==='concerts'||key==='concert')content=render(route,json('data/archive.json'));
 else if(key==='music'||key==='fanchant')content=render(route.path);
 else content=render();
 if(!content||content.includes('undefined'))throw new Error('Invalid content for '+key);
 const vars={pageHead:(key==='letter'||key==='about')?'<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Nanum+Pen+Script&amp;display=swap">':'',page:key,title:esc(route.title),description:esc(route.description),canonical:esc(site.origin+(key==='letter'?'/about/':route.path)),content,siteCss,quizCss,scripts:(key==='quiz'?`<script defer src="${quizJs}"></script>\n`:'')+`<script defer src="${siteJs}"></script>`};
 if(key==='dictionary'){vars.pageHead+=`<link rel="stylesheet" href="${dictionaryCss}">`;vars.scripts+=`\n<script defer src="${dictionaryJs}"></script>`;}
 if(key==='calendar'){vars.pageHead+=`<link rel="stylesheet" href="${calendarCss}">`;vars.scripts=`<script defer src="${calendarJs}"></script>`;}
 if(key==='fans'){vars.pageHead+=`<link rel="stylesheet" href="${fanCss}">`;vars.scripts+=`\n<script defer src="${fanJs}"></script>`;}
 if(key==='exam'||key==='exam-preview'){vars.pageHead=`<meta name="referrer" content="no-referrer"><link rel="stylesheet" href="${examCss}">`;vars.scripts=`<script defer src="${examJs}"></script>`;}
 vars.themeColor=esc(pwa.theme_color);
 vars.pwaHead=route.unlisted?'':`<link rel="manifest" href="/manifest.webmanifest">\n<link rel="apple-touch-icon" sizes="180x180" href="/images/app/apple-touch-icon-180.png">\n<meta name="mobile-web-app-capable" content="yes">\n<meta name="apple-mobile-web-app-capable" content="yes">\n<meta name="apple-mobile-web-app-title" content="${esc(pwa.short_name)}">\n<meta name="apple-mobile-web-app-status-bar-style" content="default">`;
 if(!route.unlisted)vars.scripts+=`\n<script defer src="${pwaJs}"></script>\n<script defer src="${offlineJs}"></script>`;
 let output=template.replace(/\{\{(\w+)\}\}/g,(_,key)=>{if(!(key in vars))throw new Error('Unknown template key '+key);return vars[key];});
 if(route.unlisted){
  output=output.replace(/(<meta name="(?:robots|googlebot)" content=")[^"]+/g,'$1noindex,nofollow,noarchive,nosnippet');
  output=output.replace(/<script\b[^>]*src="(?:https:\/\/www\.googletagmanager\.com\/[^\"]*|\/assets\/(?:analytics|visitor-count)\.js)"[^>]*><\/script>\s*/g,'');
 }
 const file=route.path.slice(1)+'index.html';write(file,'<!-- Generated by node build.js. DO NOT EDIT. -->\n'+output);if(!route.unlisted)files.push(file);
}
write('sitemap.xml','<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'+routes.filter(r=>r.key!=='letter').map(r=>'  <url><loc>'+esc(site.origin+r.path)+'</loc></url>').join('\n')+'\n</urlset>\n');
// Keep previously published hashed assets: cached HTML may still reference them.
write('manifest.webmanifest',JSON.stringify(pwa,null,2)+'\n');
write('build-manifest.json',JSON.stringify({version:site.version,baseline:site.baseline,files:[...files,'sitemap.xml','manifest.webmanifest','sw.js'],assets,auxiliary:['offline.html','manage/index.html','calendar/events.json','calendar/activities.ics','calendar/anniversaries.ics']},null,2)+'\n');
console.log(`Built ${routes.length} public pages, 1 unlisted preview and ${assets.length} cached assets.`);
if(outputRoot!==root)console.log('Local preview prepared. Repository HTML files were not changed.');
