'use strict';
const fs=require('node:fs'),path=require('node:path'),os=require('node:os'),assert=require('node:assert/strict'),{execFileSync}=require('node:child_process');
const root=path.resolve(__dirname,'..');
const manifest=JSON.parse(fs.readFileSync(path.join(root,'build-manifest.json'),'utf8'));
const outputs=[...manifest.files,...manifest.assets,...manifest.auxiliary,'build-manifest.json'];
// Stage actual generated paths in an isolated Git index using each workflow's command.
// A locally successful build does not prove newly generated files will be deployed.
for(const name of fs.readdirSync(path.join(root,'.github/workflows'))){
 const source=fs.readFileSync(path.join(root,'.github/workflows',name),'utf8');
 if(!source.includes('node build.js'))continue;
 const lines=[...source.matchAll(/^\s+git add (.+)$/gm)];
 assert(lines.length,name+' must save generated outputs');
 const scratch=fs.mkdtempSync(path.join(os.tmpdir(),'seeya-deploy-'));
 try{
  for(const file of new Set([...outputs,'data/archive.json','data/archive-update-log.json','data/news.json','data/visitors.json'])){
   const dest=path.join(scratch,file);fs.mkdirSync(path.dirname(dest),{recursive:true});fs.writeFileSync(dest,'fixture\n');
  }
  const git=args=>execFileSync('git',args,{cwd:scratch,encoding:'utf8',stdio:['ignore','pipe','pipe']});
  git(['init','--quiet']);
  for(const line of lines){const args=line[1].trim().match(/'[^']*'|"[^"]*"|\S+/g).map(x=>x.replace(/^(['"])(.*)\1$/,'$2'));git(['add','--',...args]);}
  const staged=new Set(git(['diff','--cached','--name-only','-z']).split('\0'));
  assert.deepEqual(outputs.filter(f=>!staged.has(f)),[],name+' is missing generated deployment files');
 }finally{
  assert.equal(path.dirname(path.resolve(scratch)),path.resolve(os.tmpdir()));
  assert(path.basename(scratch).startsWith('seeya-deploy-'));
  fs.rmSync(scratch,{recursive:true,force:true});
 }
}
console.log('PASS deployment: all generated pages, assets and auxiliary JSON are staged by build workflows.');
