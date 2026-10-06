import json
import re
from pathlib import Path
from urllib.parse import urlparse

POLICY = json.loads((Path(__file__).resolve().parents[1] / 'src/data/news-filter.json').read_text(encoding='utf-8'))

def group_mention(text):
    suffix = '|'.join(re.escape(x) for x in POLICY['groupSuffixes'])
    return (re.search(r'(?:^|[^가-힣A-Za-z0-9_])씨야(?:(?:' + suffix + r'))?(?=$|[^가-힣A-Za-z0-9_])', text) is not None
            or re.search(r'(?<![A-Za-z0-9_])seeya(?![A-Za-z0-9_])', text, re.I) is not None)

def relevant_news(item, category):
    link = urlparse(item.get('link', ''))
    if not link.scheme or not link.netloc:
        return False
    if link.path.rstrip('/').split('/')[-1] in POLICY['blockedArticleIds']:
        return False
    def strip(value):
        return re.sub(r'\s+', ' ', re.sub(r'<[^>]*>', ' ', str(value or ''))).strip()
    byline = re.compile(re.escape(category) + r'\s*(?:' + '|'.join(POLICY['bylineRoles']) + ')')
    title = byline.sub('', strip(item.get('title')))
    description = byline.sub('', strip(item.get('description')))
    text = (title + ' ' + description).lower()
    context = [term for term in POLICY['artistContext'] if term not in ('씨야', 'SeeYa')]
    if category == '씨야':
        return group_mention(title) and any(term.lower() in text for term in context + POLICY['groupContext'])
    context += POLICY.get('memberContext', {}).get(category, [])
    return category in title and (group_mention(text) or any(term.lower() in text for term in context))
