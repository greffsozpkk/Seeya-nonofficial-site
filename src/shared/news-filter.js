const policy=require('../data/news-filter.json');
function relevantNews(item,category){
  try{const url=new URL(item.link);if(policy.blockedArticleIds.includes(url.pathname.split('/').filter(Boolean).pop()))return false;}catch{return false;}
  const strip=value=>String(value||'').replace(/<[^>]*>/g,' ').replace(/\s+/g,' ').trim();
  const title=strip(item.title),description=strip(item.description);
  const byline=new RegExp(category+'\\s*(?:'+policy.bylineRoles.join('|')+')','g');
  const headline=title.replace(byline,'');
  const text=(headline+' '+description.replace(byline,'')).toLowerCase();
  if(category==='씨야')return headline.includes('씨야')||/\bseeya\b/i.test(headline);
  // A name appearing only in a reporter credit or RSS description is insufficient.
  return headline.includes(category)&&policy.artistContext.some(term=>text.includes(term.toLowerCase()));
}
function filterNews(items,category){return (Array.isArray(items)?items:[]).filter(item=>relevantNews(item,category));}
module.exports={filterNews,relevantNews};
