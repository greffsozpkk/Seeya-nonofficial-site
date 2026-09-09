import unittest
from update_news import collect

OLD={'updatedAt':'2026-09-08T00:00:00+00:00','김연지':[{'title':'씨야 김연지 기존 앨범 발매','link':'https://example.com/old','pubDate':'2026-09-08T00:00:00+00:00'}]}
def rss(title):
    return ('<rss><channel><item><title>'+title+'</title><link>https://example.com/new</link><pubDate>Wed, 09 Sep 2026 12:00:00 GMT</pubDate></item></channel></rss>').encode()

class UpdateTests(unittest.TestCase):
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
