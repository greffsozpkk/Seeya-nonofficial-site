import copy
import json
import tempfile
import unittest
import urllib.error
import urllib.parse
from datetime import datetime, timezone
from pathlib import Path

import discover_archive as d

NOW = datetime(2026, 9, 30, tzinfo=timezone.utc)
CONFIG = json.loads((d.ROOT / 'src/data/archive-discovery.json').read_text(encoding='utf-8'))


def video(url='https://youtu.be/abcdefghijk', title='씨야 남규리 컬투쇼 라이브'):
    return dict(url=url, title=title, description='출연 영상', publisher='방송사', publishedAt='2026-09-29T16:00:00Z', sourceKind='youtube', query='씨야')


def record(url='https://youtube.com/watch?v=abcdefghijk&t=4'):
    return dict(id='old', title='씨야 · 지난 방송', program='컬투쇼 라이브', members=['남규리'], date='2008-01-01',
                source={'url': 'https://example.com/a'}, additionalSources=[{'url': url}])


class DiscoveryTests(unittest.TestCase):
    def test_video_url_variants_and_unsafe_urls(self):
        expected = 'https://www.youtube.com/watch?v=abcdefghijk'
        for url in ['https://youtu.be/abcdefghijk?si=xx', 'https://m.youtube.com/watch?v=abcdefghijk&t=2',
                    'https://youtube.com/shorts/abcdefghijk', 'https://youtube.com/live/abcdefghijk']:
            self.assertEqual(d.canonical(url), expected)
        for url in ['javascript:alert(1)', 'file:///a', 'https://name:password@example.com']:
            self.assertEqual(d.canonical(url), '')
        self.assertNotEqual(d.canonical('https://example.com?id=1'), d.canonical('https://example.com?id=2'))

    def test_existing_additional_source_excluded_and_no_mutation(self):
        archive = [record()]
        before = copy.deepcopy(archive)
        state = d.merge_candidates({}, [video()], archive, CONFIG, NOW, [])
        self.assertEqual(state['candidates'], [])
        self.assertEqual(state['summary']['alreadyArchived'], 1)
        self.assertEqual(archive, before)

    def test_dedup_queries_kst_and_activity_date_unknown(self):
        row = video(); other = video('https://youtube.com/shorts/abcdefghijk'); other['query'] = '남규리'
        state = d.merge_candidates({}, [row, other], [], CONFIG, NOW, [])
        self.assertEqual(len(state['candidates']), 1)
        candidate = state['candidates'][0]
        self.assertEqual(candidate['queries'], ['남규리', '씨야'])
        self.assertEqual(candidate['publishedDateKST'], '2026-09-30')
        self.assertIsNone(candidate['activityDate'])
        self.assertEqual(candidate['suggestedType'], 'radio')
        self.assertEqual(candidate['members'], ['남규리'])

    def test_carry_forward_failure_ignore_and_later_archived(self):
        state = d.merge_candidates({}, [video()], [], CONFIG, NOW, [])
        later = datetime(2026, 10, 1, tzinfo=timezone.utc)
        carried = d.merge_candidates(state, [], [], CONFIG, later, [{'status': 'error'}])
        self.assertEqual(len(carried['candidates']), 1)
        self.assertEqual(carried['summary']['new'], 0)
        ignored = dict(CONFIG, ignoredUrls=['https://youtu.be/abcdefghijk'])
        self.assertEqual(d.merge_candidates(state, [video()], [], ignored, later, [])['candidates'], [])
        self.assertEqual(d.merge_candidates(state, [], [record()], CONFIG, later, [])['candidates'], [])

    def test_related_not_auto_merged_and_unrelated_excluded(self):
        state = d.merge_candidates({}, [video(), video('https://youtu.be/zzzzzzzzzzz', '다른 가수')],
                                   [record('https://example.com/other')], CONFIG, NOW, [])
        self.assertEqual(len(state['candidates']), 1)
        self.assertEqual(state['candidates'][0]['relatedRecords'][0]['id'], 'old')
        self.assertEqual(state['summary']['unrelated'], 1)

    def test_same_title_different_video_is_not_discarded(self):
        existing = record('https://youtu.be/zzzzzzzzzzz')
        existing['title'] = '씨야 남규리 컬투쇼 라이브'
        result = d.merge_candidates({}, [video()], [existing], CONFIG, NOW, [])
        self.assertEqual(len(result['candidates']), 1)
        self.assertEqual(result['candidates'][0]['relatedRecords'][0]['id'], 'old')

    def test_identical_news_group_keeps_all_links(self):
        a = dict(video('https://news.google.com/rss/articles/first'), sourceKind='news')
        b = dict(a, url='https://news.google.com/rss/articles/second')
        result = d.merge_candidates({}, [a, b], [], CONFIG, NOW, [])
        self.assertEqual(len(result['candidates']), 1)
        self.assertEqual(len(result['candidates'][0]['alternateUrls']), 1)
        # Exclusion export includes all aliases, preventing rediscovery.
        ignored = dict(CONFIG, ignoredUrls=[b['url']])
        self.assertEqual(d.merge_candidates(result, [a, b], [], ignored, NOW, [])['candidates'], [])
        ignored['ignoredUrls'].append(a['url'])
        self.assertEqual(d.merge_candidates(result, [a, b], [], ignored, NOW, [])['candidates'], [])
        self.assertEqual(d.merge_candidates(result, [a, b], [record(b['url'])], CONFIG, NOW, [])['candidates'], [])

    def test_report_escaping_and_csv_formula(self):
        row = video(title='=씨야 <script>alert(1)</script>')
        row['publisher'] = '<img src=x onerror=alert(1)>'
        state = d.merge_candidates({}, [row], [], CONFIG, NOW, [])
        report = d.render_report(state)
        self.assertNotIn('<script>alert(1)', report)
        self.assertNotIn('<img src=x', report)
        self.assertNotIn('<img src=x', report)
        with tempfile.TemporaryDirectory() as tmp:
            d.write_outputs(state, Path(tmp))
            self.assertIn("'=씨야", (Path(tmp)/'candidates.csv').read_text(encoding='utf-8-sig'))
            self.assertEqual(json.loads((Path(tmp)/'candidates.json').read_text(encoding='utf-8')), state)

    def test_news_without_key_and_homonym_filter(self):
        def fetch(url):
            return b'<rss><channel></channel></rss>'
        rows, checks = d.discover(CONFIG, NOW, fetcher=fetch)
        self.assertEqual(rows, [])
        self.assertEqual(checks[-1]['status'], 'not_configured')
        self.assertTrue(all(c['status'] == 'ok' for c in checks[:-1]))
        self.assertFalse(d.relevant_news({'title': '김연지 기자 경제 뉴스', 'description': '', 'link': 'https://example.com'}, '김연지'))

    def test_pagination_quota_error_redaction_and_partial_success(self):
        calls = []
        def fetch(url):
            if 'news.google' in url:
                return b'<rss><channel/></rss>'
            params = urllib.parse.parse_qs(urllib.parse.urlsplit(url).query)
            calls.append(params)
            if params['q'] == ['남규리']:
                raise urllib.error.HTTPError(url, 403, 'SECRET in request', {}, None)
            body = {'items': [{'id': {'videoId': 'abcdefghijk'}, 'snippet': {'title': '씨야 무대'}}]}
            if 'pageToken' not in params:
                body['nextPageToken'] = 'page2'
            return json.dumps(body).encode()
        rows, checks = d.discover(CONFIG, NOW, 'SECRET', fetch)
        self.assertEqual(len(calls), 3)
        self.assertEqual(len(rows), 2)
        self.assertNotIn('SECRET', json.dumps(checks))
        self.assertEqual(calls[1]['pageToken'], ['page2'])
        self.assertIn('publishedAfter', calls[0])
        self.assertTrue(any(c['status'] == 'skipped' for c in checks))

    def test_historical_search_does_not_assume_publication_year(self):
        queries = d.history_queries(CONFIG, NOW.date())
        self.assertEqual(len(queries), 4)
        self.assertNotEqual(queries, d.history_queries(CONFIG, datetime(2026, 10, 1).date()))
        calls = []
        def fetch(url):
            if 'news.google' in url:
                return b'<rss><channel/></rss>'
            calls.append(urllib.parse.parse_qs(urllib.parse.urlsplit(url).query))
            return b'{"items": []}'
        d.discover(CONFIG, NOW, 'test', fetch)
        self.assertEqual(len(calls), 8)
        self.assertTrue(all('publishedAfter' not in c for c in calls[4:]))


if __name__ == '__main__':
    unittest.main()
