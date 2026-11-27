'use strict';
const fs=require('node:fs'),path=require('node:path');
const {Resvg}=require('@resvg/resvg-js');
const root=path.resolve(__dirname,'../../..'),test=path.dirname(__dirname),out=path.join(test,'.cloud-assets');
fs.mkdirSync(out,{recursive:true});
// Reuse the official vector mark; no new or generated logo artwork.
const source=fs.readFileSync(path.join(root,'images/game/our-stage/card-logo.svg'),'utf8');
const mark=source.match(/<path[\s\S]*<\/svg>/)[0].replace('</svg>','').replace(/fill:#[a-fA-F0-9]+/g,'fill:#ffffff');
const badge='<svg xmlns="http://www.w3.org/2000/svg" width="96" height="96" viewBox="0 0 96 96"><g transform="translate(4 31) scale(0.19876)">'+mark+'</g><path d="M30 65H66" stroke="white" stroke-width="3"/></svg>';
fs.writeFileSync(path.join(test,'badge-96.svg'),badge);
fs.writeFileSync(path.join(test,'badge-96.png'),new Resvg(badge).render().asPng());
for(const f of ['page.html','client.js','style.css','sw.js','badge-96.png'])fs.copyFileSync(path.join(test,f),path.join(out,f));
for(const [to,from]of Object.entries({'icon-192.png':'icon-192-v2.png','icon-512.png':'icon-512-v2.png','apple-touch-icon.png':'apple-touch-icon-180-v2.png'}))fs.copyFileSync(path.join(root,'images/app',from),path.join(out,to));
console.log('Prepared test assets and monochrome notification badge.');
