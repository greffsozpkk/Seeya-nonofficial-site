import json
import subprocess
import unittest
from pathlib import Path
from news_filter import relevant_news, POLICY

ROOT = Path(__file__).resolve().parents[1]
CASES = [
    ('김연지', '씨야 김연지, 새 싱글 노래 발매', '', True),
    ('김연지', '김연지, 뮤지컬 무대 복귀', '', True),
    ('김연지', '김연지 대표, 기업 투자 발표', '', False),
    ('김연지', '신인 가수 새 앨범 발표 - 김연지 기자', '', False),
    ('김연지', '신인 가수 새 앨범 발표', '김연지 기자', False),
    ('김연지', '김연지, 팬들에게 전한 소식', '씨야의 가수 김연지', True),
    ('김연지', '다른 가수 콘서트', '씨야 김연지', False),
    ('이보람', '이보람, 골때녀 발라드림 합류', '', True),
    ('남규리', '배우 남규리, 새 드라마 출연', '', True),
    ('씨야', '씨야, 20주년 전국투어 개최', '', True),
    ('씨야', 'SeeYa announces new album', '', True),
    ('씨야', '관련 없는 뉴스', '검색어 씨야', False),
]

class FilterTests(unittest.TestCase):
    def test_python_and_browser_rules_match(self):
        rows = [dict(category=c, item=dict(title=t, description=d, link='https://example.com/article'), expected=e) for c,t,d,e in CASES]
        for scheme in ['http', 'https']:
            for query in ['', '?oc=5&hl=ko', '?hl=ko&oc=5']:
                rows.append(dict(category='김연지', item=dict(title='씨야 김연지 신곡', link=scheme+'://news.google.com/rss/articles/'+POLICY['blockedArticleIds'][0]+query), expected=False))
        expected = [r['expected'] for r in rows]
        self.assertEqual([relevant_news(r['item'],r['category']) for r in rows], expected)
        script = "const fs=require('fs'),{relevantNews}=require('./src/shared/news-filter');const rows=JSON.parse(fs.readFileSync(0,'utf8'));console.log(JSON.stringify(rows.map(r=>relevantNews(r.item,r.category))));"
        result = subprocess.check_output(['node','-e',script],input=json.dumps(rows).encode(),cwd=ROOT)
        self.assertEqual(json.loads(result),expected)

if __name__ == '__main__':
    unittest.main()
