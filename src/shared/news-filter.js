const policy=require('../data/news-filter.json');
// Korean particles are valid suffixes; another word such as 씨야드 is not.
function groupMention(text){
  const suffix=policy.groupSuffixes.join('|');
  return new RegExp('(?:^|[^가-힣A-Za-z0-9_])씨야(?:(?:'+suffix+'))?(?=$|[^가-힣A-Za-z0-9_])').test(text)||/\bseeya\b/i.test(text);
}
function relevantNews(item,category){
  try{const url=new URL(item.link);if(policy.blockedArticleIds.includes(url.pathname.split('/').filter(Boolean).pop()))return false;}catch{return false;}
  const strip=value=>String(value||'').replace(/<[^>]*>/g,' ').replace(/\s+/g,' ').trim();
  const title=strip(item.title),description=strip(item.description);
  const byline=new RegExp(category+'\\s*(?:'+policy.bylineRoles.join('|')+')','g');
  const headline=title.replace(byline,'');
  const text=(headline+' '+description.replace(byline,'')).toLowerCase();
  if(category==='씨야')return groupMention(headline)&&[...policy.artistContext.filter(t=>!['씨야','SeeYa'].includes(t)),...policy.groupContext].some(term=>text.includes(term.toLowerCase()));
  // A name appearing only in a reporter credit or RSS description is insufficient.
  return headline.includes(category)&&(groupMention(text)||[...policy.artistContext.filter(t=>!['씨야','SeeYa'].includes(t)),...(policy.memberContext?.[category]||[])].some(term=>text.includes(term.toLowerCase())));
}
function filterNews(items,category){return (Array.isArray(items)?items:[]).filter(item=>relevantNews(item,category));}
module.exports={filterNews,relevantNews};
