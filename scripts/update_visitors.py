"""Publish only the aggregate daily user count. Credentials stay in Actions secrets."""
import json
import os
from datetime import datetime
from pathlib import Path
from zoneinfo import ZoneInfo


def main():
    property_id = os.environ.get('GA_PROPERTY_ID', '')
    credentials_json = os.environ.get('GA_SERVICE_ACCOUNT_JSON', '')
    if not property_id or not credentials_json:
        print('Visitor reporting is not configured; existing data retained.')
        return
    if not property_id.isdigit():
        raise ValueError('GA_PROPERTY_ID must be the numeric property ID, not G- measurement ID.')
    from google.oauth2 import service_account
    from google.auth.transport.requests import AuthorizedSession
    credentials = service_account.Credentials.from_service_account_info(
        json.loads(credentials_json), scopes=['https://www.googleapis.com/auth/analytics.readonly'])
    now = datetime.now(ZoneInfo('Asia/Seoul'))
    date = now.date().isoformat()
    with AuthorizedSession(credentials) as session:
        response = session.post(
            f'https://analyticsdata.googleapis.com/v1beta/properties/{property_id}:runReport',
            json={'dateRanges': [{'startDate': date, 'endDate': date}],
                  'metrics': [{'name': 'totalUsers'}]}, timeout=30)
        response.raise_for_status()
        report = response.json()
    if report.get('metadata', {}).get('timeZone') != 'Asia/Seoul':
        raise ValueError('Set the GA property reporting time zone to Asia/Seoul.')
    rows = report.get('rows', [])
    users = int(rows[0]['metricValues'][0]['value']) if rows else 0
    if users < 0:
        raise ValueError('Invalid user count')
    target = Path(__file__).resolve().parents[1] / 'data' / 'visitors.json'
    temp = target.with_suffix('.tmp')
    temp.write_text(json.dumps({'date': date, 'users': users,
                               'updatedAt': now.isoformat()}, indent=2) + '\n', encoding='utf-8')
    temp.replace(target)
    print('Daily visitor count updated.')


if __name__ == '__main__':
    main()
