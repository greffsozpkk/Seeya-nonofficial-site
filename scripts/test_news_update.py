import unittest
from update_news import collect

OLD={'updatedAt':'2026-09-08T00:00:00+00:00','김연지':[{'title':'씨야 김연지 기존 앨범 발매','link':'https://example.com/old','pubDate':'2026-09-08T00:00:00+00:00'}]}
def rss(title):
    return ('<rss><channel><item><title>'+title+'</title><link>https://example.com/new</link><pubDate>Wed, 09 Sep 2026 12:00:00 GMT</pubDate></item></channel></rss>').encode()

class UpdateTests(unittest.TestCase):
    def test_name_only_query_and_cross_category_discovery(self):
        def fetch(q):
            return rss('씨야 남규리, 미발매 자작곡 공개') if q=='"남규리" when:7d' else b'<rss><channel/></rss>'
        data,_=collect({},fetch,'2026-10-05T01:00:00Z')
        self.assertEqual(len(data['남규리']),1)
        self.assertEqual(len(data['씨야']),1)
    def test_unchanged_check_does_not_relabel_content_as_new(self):
        first,_=collect({},lambda q:rss('씨야 김연지 신곡 발매'),'2026-10-04T01:00:00Z')
        second,_=collect(first,lambda q:rss('씨야 김연지 신곡 발매'),'2026-10-05T01:00:00Z')
        self.assertEqual(second['categoryContentUpdatedAt'],first['categoryContentUpdatedAt'])
        self.assertEqual(second['lastCheckedAt'],'2026-10-05T01:00:00Z')
        self.assertEqual(second['categoryStatus']['김연지']['status'],'unchanged')
    def test_empty_search_and_network_failure_have_different_status(self):
        empty,_=collect(OLD,lambda q:b'<rss><channel/></rss>','2026-10-05T01:00:00Z')
        def fail(q):raise OSError()
        failed,_=collect(OLD,fail,'2026-10-05T01:00:00Z')
        self.assertEqual(empty['categoryStatus']['김연지']['status'],'empty')
        self.assertEqual(failed['categoryStatus']['김연지']['status'],'error')
    def test_outage_retains_articles_and_timestamp(self):
        def fail(q): raise OSError('simulated outage')
        data,count=collect(OLD,fail,'2026-09-09T13:00:00+00:00')
        self.assertEqual(count,0)
        self.assertEqual(data['김연지'],OLD['김연지'])
        self.assertEqual(data['updatedAt'],OLD['updatedAt'])
    def test_empty_or_irrelevant_results_retain_cache(self):
        data,count=collect(OLD,lambda q:rss('김연지 대표 기업 투자'),'2026-09-09T13:00:00+00:00')
        self.assertEqual(count,0)
        self.assertEqual(data['김연지'],OLD['김연지'])
    def test_new_articles_merge_newest_first(self):
        data,count=collect(OLD,lambda q:rss('씨야 김연지 신곡 발매'),'2026-09-09T13:00:00+00:00')
        self.assertGreater(count,0)
        self.assertEqual(len(data['김연지']),2)
        self.assertEqual(data['김연지'][0]['link'],'https://example.com/new')
        self.assertEqual(data['categoryUpdatedAt']['김연지'],'2026-09-09T13:00:00+00:00')

if __name__=='__main__': unittest.main()
