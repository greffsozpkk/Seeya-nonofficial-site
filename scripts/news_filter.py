import json
import re
from pathlib import Path
from urllib.parse import urlparse

POLICY = json.loads((Path(__file__).resolve().parents[1] / 'src/data/news-filter.json').read_text(encoding='utf-8'))

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
    if category == '씨야':
        return '씨야' in title or re.search(r'\bseeya\b', title, re.I) is not None
    text = (title + ' ' + description).lower()
    return category in title and any(term.lower() in text for term in POLICY['artistContext'])
