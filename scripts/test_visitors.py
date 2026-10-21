import unittest
from copy import deepcopy
from datetime import date, datetime, timezone
from update_visitors import make_payload, request_body


class VisitorTests(unittest.TestCase):
    def report(self, rows=()):
        return {'metadata': {'timeZone': 'Asia/Seoul'},
                'dimensionHeaders': [{'name': 'date'}],
                'metricHeaders': [{'name': 'totalUsers'}],
                'rows': [{'dimensionValues': [{'value': day}],
                          'metricValues': [{'value': str(users)}]} for day, users in rows]}

    def parse(self, report):
        return make_payload(report, date(2026, 10, 21), datetime(2026, 10, 21, 9, tzinfo=timezone.utc))

    def test_rechecks_past_seven_days_and_total_users(self):
        request = request_body(date(2026, 10, 21))
        self.assertEqual(request['dateRanges'], [{'startDate': '2026-10-14', 'endDate': '2026-10-21'}])
        self.assertEqual(request['metrics'], [{'name': 'totalUsers'}])
        payload = self.parse(self.report([('20261020', 27), ('20261021', 12)]))
        self.assertEqual(payload['users'], 12)
        self.assertEqual(payload['history'][-2], {'date': '2026-10-20', 'users': 27})
        self.assertEqual(len(payload['history']), 8)
        self.assertTrue(payload['updatedAt'].endswith('+09:00'))

    def test_missing_rows_are_zero_processed_users(self):
        payload = self.parse(self.report())
        self.assertEqual(payload['users'], 0)
        self.assertEqual(payload['history'][0]['date'], '2026-10-14')

    def test_corrections_can_decrease(self):
        first = self.parse(self.report([('20261020', 28)]))
        second = self.parse(self.report([('20261020', 27)]))
        self.assertLess(second['history'][-2]['users'], first['history'][-2]['users'])

    def test_rejects_wrong_zone_schema_truncation_and_invalid_counts(self):
        base = self.report([('20261020', 27)])
        variants = []
        for key, value in [('timeZone', 'America/Los_Angeles'), ('emptyReason', 'restricted'), ('dataLossFromOtherRow', True), ('dataTruncationReasons', [{}])]:
            report = deepcopy(base); report['metadata'][key] = value; variants.append(report)
        report = deepcopy(base); report['metricHeaders'] = [{'name': 'activeUsers'}]; variants.append(report)
        report = deepcopy(base); report['rowCount'] = 2; variants.append(report)
        variants += [self.report([('20261020', -1)]), self.report([('20261020', '1.5')]),
                     self.report([('20261020', 1), ('20261020', 2)]), self.report([('20261022', 2)])]
        for report in variants:
            with self.subTest(report=report), self.assertRaises(ValueError): self.parse(report)

    def test_threshold_flag_and_month_boundary(self):
        report = self.report(); report['metadata']['subjectToThresholding'] = True
        self.assertTrue(self.parse(report)['limited'])
        self.assertEqual(request_body(date(2026, 11, 1))['dateRanges'][0]['startDate'], '2026-10-25')


if __name__ == '__main__': unittest.main()
