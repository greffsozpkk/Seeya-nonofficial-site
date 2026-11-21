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
require('./check-birthday-popup');

require('./check-stages');
require('./check-concerts');
require('./check-map');
require('./check-map-coverage');
require('./check-map-navigation');
require('./check-kakao-map');
require('./check-fan-gallery');
require('./check-exam');
require('./check-dictionary');
require('./check-calendar');
require('./check-home-upcoming');
require('./check-home-activity');
execFileSync(process.execPath,['scripts/check-home-upcoming-client.js'],{cwd:root,stdio:'inherit'});
require('./check-admin');
require('./check-news-status');
execFileSync(process.execPath,['scripts/check-visitors.js'],{cwd:root,stdio:'inherit'});
execFileSync(process.execPath,['scripts/check-pwa.js'],{cwd:root,stdio:'inherit'});

execFileSync(process.execPath,['scripts/check-offline.js'],{cwd:root,stdio:'inherit'});

execFileSync(process.execPath,['scripts/check-passport.js'],{cwd:root,stdio:'inherit'});
execFileSync(process.execPath,['scripts/check-passport-extra.js'],{cwd:root,stdio:'inherit'});
execFileSync(process.execPath,['scripts/check-passport-goods.js'],{cwd:root,stdio:'inherit'});
execFileSync(process.execPath,['scripts/check-passport-image.js'],{cwd:root,stdio:'inherit'});

execFileSync(process.execPath,['scripts/check-passport-play.js'],{cwd:root,stdio:'inherit'});
execFileSync(process.execPath,['scripts/check-diary.js'],{cwd:root,stdio:'inherit'});
execFileSync(process.execPath,['scripts/check-diary-drive.js'],{cwd:root,stdio:'inherit'});

require('./check-worldcup');
execFileSync(process.execPath,['scripts/check-worldcup-export.js'],{cwd:root,stdio:'inherit'});
require('./check-worldcup-new-types');
execFileSync(process.execPath,['scripts/check-worldcup-stats.js'],{cwd:root,stdio:'inherit'});
execFileSync(process.execPath,['scripts/check-worldcup-auto.js'],{cwd:root,stdio:'inherit'});

require('./check-deployment');

execFileSync(process.execPath,['scripts/check-worldcup-public.js'],{cwd:root,stdio:'inherit'});

execFileSync(process.execPath,['scripts/check-clinic.js'],{cwd:root,stdio:'inherit'});
require('./check-my-concert');
require('./check-concert-diary');
execFileSync(process.execPath,['scripts/check-my-concert-client.js'],{cwd:root,stdio:'inherit'});
require('./check-my-concert-show');
execFileSync(process.execPath,['scripts/check-my-concert-playback.js'],{cwd:root,stdio:'inherit'});

require('./check-our-stage-cards');
require('./check-our-stage-decoration');
require('./check-our-stage-hair');
require('./check-our-stage-journey');
require('./check-our-stage-release');
require('./check-our-stage-shop');
require('./check-our-stage-backstage');
require('./check-our-stage-coins');
require('./check-our-stage-stories');
require('./check-our-stage');
require('./check-our-stage-public');

require('./check-our-stage-mini');

require('./check-our-stage-comeback');

require('./check-our-stage-milestones');
require('./check-our-stage-mask-badges');
require('./check-our-stage-test-tools');
require('./check-our-stage-song');

require('./check-our-stage-review');
require('./check-our-stage-growth');
require('./check-our-stage-puzzles');
require('./check-our-stage-simple');
require('./check-our-stage-first-release');
require('./check-our-stage-keepsakes');
require('./check-our-stage-concert-rewards');
require('./check-our-stage-concert-coins');
require('./check-our-stage-continuous-concert');
require('./check-our-stage-motion-mix');
require('./check-our-stage-member-history');
require('./check-our-stage-leisure');
require('./check-our-stage-capsule-design');
require('./check-our-stage-capsule-page');
require('./check-our-stage-drive');

require('./check-our-stage-stage-shop');

require('./check-our-stage-pacing');

require('./check-our-stage-play-days');

require('./check-our-stage-solo');
require('./check-our-stage-connect');
