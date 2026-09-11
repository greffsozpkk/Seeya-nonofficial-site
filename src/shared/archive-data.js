const additions=[require('../../data/archive-stage-v474.json'),require('../../data/archive-schedule-v475.json')];
function mergeArchive(base){
 const rows=base.map(x=>({...x}));
 const ids=new Set(rows.map(x=>x.id));
 for(const extra of additions)for(const x of extra.records)if(!ids.has(x.id)){rows.push({...x});ids.add(x.id);}
 for(const extra of additions)for(const patch of extra.patches){
  const x=rows.find(x=>x.id===patch.id);if(!x)continue;
  if(patch.set)Object.assign(x,patch.set);
  if(patch.songs)x.songs=[...new Set([...(x.songs||[]),...patch.songs])];
  if(patch.appendNote&&!(x.note||'').includes(patch.appendNote))x.note=[x.note,patch.appendNote].filter(Boolean).join(' ');
  x.additionalSources=[...(x.additionalSources||[]),...(patch.additionalSources||[])].filter((s,i,a)=>s.url!==x.source?.url&&a.findIndex(t=>t.url===s.url)===i);
 }
 return rows;
}
module.exports={mergeArchive};
