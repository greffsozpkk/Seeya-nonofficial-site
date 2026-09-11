function normalizeTitle(value){return String(value??'').trim().toLowerCase();}
function isLyricAnswer(value,title){
 const answer=normalizeTitle(value),full=normalizeTitle(title);
 if(!answer||!full)return false;
 // Remove only trailing featuring credits, not subtitles or version names.
 const bare=full.replace(/\s*(?:\(\s*(?:feat\.?|ft\.?|featuring)\s+[^)]*\)|\[\s*(?:feat\.?|ft\.?|featuring)\s+[^\]]*\]|\s+(?:feat\.?|ft\.?|featuring)\s+.+)\s*$/i,'').trim();
 return answer===full||answer===bare;
}
module.exports={isLyricAnswer};
