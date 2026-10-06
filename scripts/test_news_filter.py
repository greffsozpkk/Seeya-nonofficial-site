import json
import subprocess
import unittest
from pathlib import Path
from news_filter import relevant_news, POLICY

ROOT = Path(__file__).resolve().parents[1]
CASES = [
    ('남규리', '남규리, 오직 팬들만을 위해 만든 미발매 자작곡 깜짝 공개', '', True),
    ('김연지', '정치 현안 논란 - 김연지 기자', '', False),
    ('이보람', '이보람 귀묘한 하루 공개', '', True),
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
    ('씨야', "거제 대형카페 '씨야드', 블루리본서베이 2026 선정 - 거제인터넷신문", '', False),
    ('씨야', '씨야드 카페에서 가수 콘서트 개최', '', False),
    ('씨야', '날씨야 맑아져라, 음악 축제 개최', '', False),
    ('씨야', 'SEEYARD 카페 음악 행사', '', False),
    ('씨야', "카페 '씨야', 블루리본 선정", '', False),
    ('씨야', '씨야의 20주년, 팬들과 다시 만나다', '', True),
    ('씨야', '씨야가 돌아왔다', '', True),
    ('씨야', '씨야와의 콘서트, 함께한 팬들', '', True),
    ('씨야', '씨야는 무대에서 노래한다', '', True),
    ('씨야', '씨야(SeeYa), 새 앨범 발매', '', True),
    ('씨야', '씨야출신 남규리, 근황 공개', '', True),
    ('씨야', '씨야 이보람, 대전 무대 앞 셀카', '', True),
    ('김연지', '김연지 대표, 씨야드 매장 확장', '', False),
]

class FilterTests(unittest.TestCase):
    def test_python_and_browser_rules_match(self):
        rows = [dict(category=c, item=dict(title=t, description=d, link='https://example.com/article'), expected=e) for c,t,d,e in CASES]
        for article_id in POLICY['blockedArticleIds']:
            for category in ['씨야', '김연지']:
                for scheme in ['http', 'https']:
                    for query in ['', '?oc=5&hl=ko', '?hl=ko&oc=5']:
                        rows.append(dict(category=category, item=dict(title='씨야 김연지 신곡', link=scheme+'://news.google.com/rss/articles/'+article_id+query), expected=False))
        expected = [r['expected'] for r in rows]
        self.assertEqual([relevant_news(r['item'],r['category']) for r in rows], expected)
        script = "const fs=require('fs'),{relevantNews}=require('./src/shared/news-filter');const rows=JSON.parse(fs.readFileSync(0,'utf8'));console.log(JSON.stringify(rows.map(r=>relevantNews(r.item,r.category))));"
        result = subprocess.check_output(['node','-e',script],input=json.dumps(rows).encode(),cwd=ROOT)
        self.assertEqual(json.loads(result),expected)

    def test_prerender_filters_unreviewed_cache(self):
        data={'씨야':[
            {'title':"거제 대형카페 '씨야드', 블루리본서베이 2026 선정",'link':'https://example.com/cafe'},
            {'title':'씨야의 20주년 전국투어','link':'https://example.com/concert'}]}
        script="const fs=require('fs');process.stdout.write(require('./src/pages/news')(JSON.parse(fs.readFileSync(0,'utf8'))));"
        html=subprocess.check_output(['node','-e',script],input=json.dumps(data).encode(),cwd=ROOT).decode()
        self.assertNotIn('씨야드',html)
        self.assertIn('씨야의 20주년 전국투어',html)

if __name__ == '__main__':
    unittest.main()
