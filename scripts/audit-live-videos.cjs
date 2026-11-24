// Read public YouTube metadata only; no media downloads and no automatic source changes.
const fs=require('node:fs'),path=require('node:path');
const metadata=require('../src/data/live-evidence.json');
const archive=require('../data/archive.json');
const dir=path.resolve(__dirname,'../output/live-video-audit');fs.mkdirSync(dir,{recursive:true});
const cacheFile=path.join(dir,'metadata.json');
const cache=fs.existsSync(cacheFile)?JSON.parse(fs.readFileSync(cacheFile,'utf8')):{};
const ids=new Set();
const add=url=>{try{const id=new URL(url).searchParams.get('v');if(id)ids.add(id);}catch{}};
if(process.argv.includes('--candidates')){
 for(const s of metadata.sessions){const row=archive.find(r=>r.id===s.archiveId);for(const ref of [row.source,...row.additionalSources])add(ref.url);}
}else for(const e of metadata.evidence)for(const s of e.sources)add(s.url);
const pending=[...ids].filter(id=>!cache[id]?.durationSeconds);
let done=0;
async function worker(){while(pending.length){const id=pending.shift();try{
 const text=await (await fetch('https://www.youtube.com/watch?v='+id,{signal:AbortSignal.timeout(25000)})).text();
 const plain=text.replace(/\\"/g,'"');
 const length=plain.match(/"lengthSeconds"\s*:\s*"(\d+)"/);
 const short=plain.match(/"isShortsEligible"\s*:\s*(true|false)/);
 const title=plain.match(/"videoDetails":\{"videoId":"[^"]+","title":"([^"]+)"/);
 cache[id]={durationSeconds:length?Number(length[1]):null,shortsEligible:short?short[1]==='true':null,title:title?.[1]||'',checkedAt:new Date().toISOString()};
 }catch(e){cache[id]={error:e.message};}
 fs.writeFileSync(cacheFile,JSON.stringify(cache,null,2)+'\n');if(++done%25===0)console.log('Checked',done,'remaining',pending.length);
}}
Promise.all(Array.from({length:4},worker)).then(()=>{console.log('Metadata',Object.keys(cache).length,'missing',[...ids].filter(id=>!cache[id]?.durationSeconds).length);for(const e of metadata.evidence){for(const s of e.sources){const id=new URL(s.url).searchParams.get('v'),v=cache[id];if(!v?.durationSeconds||v.durationSeconds<120||v.shortsEligible)console.log(e.sessionId,e.songId,v?.durationSeconds,v?.shortsEligible,id);}}});
