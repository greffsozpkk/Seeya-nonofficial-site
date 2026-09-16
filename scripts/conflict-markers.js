'use strict';
const fs=require('node:fs'),path=require('node:path');
module.exports=function assertNoConflictMarkers(root,entries){
 const problems=[];
 function visit(relative){
  const file=path.join(root,relative);
  if(!fs.existsSync(file))return;
  const stat=fs.lstatSync(file);
  if(stat.isSymbolicLink())return;
  if(stat.isDirectory()){for(const name of fs.readdirSync(file))visit(path.join(relative,name));return;}
  if(!/\.(?:html|js|json|css|yml|yaml|bat|sh)$/.test(file))return;
  fs.readFileSync(file,'utf8').split(/\r?\n/).forEach((line,i)=>{if(/^(?:<{7}(?: |$)|={7}$|>{7}(?: |$))/.test(line))problems.push(relative+':'+(i+1));});
 }
 for(const entry of entries)visit(entry);
 if(problems.length)throw new Error('Unresolved Git conflict markers. Resolve these files before building or publishing:\n'+problems.join('\n'));
};
