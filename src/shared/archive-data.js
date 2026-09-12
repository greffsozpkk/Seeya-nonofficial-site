// The complete archive now lives in data/archive.json. No version overlays.
function mergeArchive(rows){
 if(!Array.isArray(rows))throw new TypeError('Archive must be an array');
 return rows.map(x=>({...x}));
}
module.exports={mergeArchive};
