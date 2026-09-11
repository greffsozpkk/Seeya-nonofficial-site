const extra=require('../../data/archive-stage-v474.json');
function mergeArchive(base){
 const rows=base.map(x=>({...x}));
 for(const patch of extra.patches){const x=rows.find(x=>x.id===patch.id);if(!x)continue;x.songs=[...new Set([...(x.songs||[]),...patch.songs])];x.additionalSources=[...(x.additionalSources||[]),...patch.additionalSources].filter((s,i,a)=>s.url!==x.source?.url&&a.findIndex(t=>t.url===s.url)===i);}
 const ids=new Set(rows.map(x=>x.id));for(const x of extra.records)if(!ids.has(x.id)){rows.push(x);ids.add(x.id);}return rows;
}
module.exports={mergeArchive};
