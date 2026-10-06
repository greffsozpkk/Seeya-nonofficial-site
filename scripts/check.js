const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict'),crypto=require('node:crypto'),{execFileSync}=require('node:child_process');
const root=path.resolve(__dirname,'..'),read=p=>fs.readFileSync(path.join(root,p),'utf8');
const manifest=JSON.parse(read('build-manifest.json'));
// Inspect the current files before rebuilding: a rebuild can erase HTML markers.
require('./conflict-markers')(root,['src','data','scripts','.github','build.js',...manifest.files,...manifest.assets,...(manifest.auxiliary||[])]);
const hashes=()=>Object.fromEntries([...manifest.files,...manifest.assets,...(manifest.auxiliary||[])].map(p=>[p,crypto.createHash('sha256').update(read(p)).digest('hex')]));
const before=hashes();execFileSync(process.execPath,['build.js'],{cwd:root});assert.deepEqual(hashes(),before,'Build must reproduce exactly');
for(const p of [...manifest.assets,...manifest.files].filter(p=>p.endsWith('.js')))execFileSync(process.execPath,['--check',p],{cwd:root});
for(const p of manifest.files.filter(p=>p.endsWith('.html'))){const html=read(p),main=html.match(/<main id="app">([\s\S]*?)<\/main>/);assert(main&&main[1].replace(/<[^>]*>/g,'').trim().length>100,p+' missing static content');assert(!html.includes('function route('));assert(!html.includes('{{'));for(const m of html.matchAll(/(?:href|src)="([^"#]+)"/g)){const ref=m[1];if(/^(?:https?:|data:|mailto:|tel:|javascript:|\/\/)/.test(ref))continue;const clean=decodeURIComponent(ref.split(/[?#]/)[0]).replace(/^\//,'');if(!clean)continue;let dest=path.join(root,clean);if(fs.existsSync(dest)&&fs.statSync(dest).isDirectory())dest=path.join(dest,'index.html');assert(fs.existsSync(dest),p+' missing local link '+ref);}}
assert(!manifest.assets.some(p=>read(p).includes('data/instagram.json')));
const routes=JSON.parse(read('src/data/routes.json'));
assert.equal(manifest.files.filter(p=>p.endsWith('.html')).length,routes.length);
assert.equal(new Set(routes.map(r=>r.path)).size,routes.length,'Route paths must be unique');
console.log(`PASS: reproducible build, JS syntax, ${routes.length} static bodies, local links, no Instagram feed dependency.`);

require('./check-archive');
require('./check-archive-updates');
require('./check-archive-content');
require('./check-radio');
require('./check-podcasts');
require('./check-on-this-day');

require('./check-stages');
require('./check-concerts');
require('./check-map');
require('./check-fan-gallery');
require('./check-exam');
require('./check-dictionary');
require('./check-calendar');
require('./check-home-upcoming');
execFileSync(process.execPath,['scripts/check-home-upcoming-client.js'],{cwd:root,stdio:'inherit'});
require('./check-admin');
require('./check-news-status');
execFileSync(process.execPath,['scripts/check-pwa.js'],{cwd:root,stdio:'inherit'});

execFileSync(process.execPath,['scripts/check-offline.js'],{cwd:root,stdio:'inherit'});
