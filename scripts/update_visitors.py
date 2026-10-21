"""Refresh aggregate daily users and seven past days for late GA processing."""
import json
import os
import re
from datetime import datetime, timedelta
from pathlib import Path
from zoneinfo import ZoneInfo

KOREA = ZoneInfo('Asia/Seoul')


def request_body(today):
    return {
        'dateRanges': [{'startDate': (today - timedelta(days=7)).isoformat(),
                        'endDate': today.isoformat()}],
        'dimensions': [{'name': 'date'}],
        'metrics': [{'name': 'totalUsers'}],
        'orderBys': [{'dimension': {'dimensionName': 'date'}}],
        'keepEmptyRows': True, 'limit': '8',
    }


def make_payload(report, today, fetched_at):
    metadata = report.get('metadata', {})
    if metadata.get('timeZone') != 'Asia/Seoul':
        raise ValueError('Set the GA property reporting time zone to Asia/Seoul.')
    if metadata.get('emptyReason') or metadata.get('dataLossFromOtherRow') or metadata.get('dataTruncationReasons'):
        raise ValueError('GA returned incomplete data; existing counts retained.')
    if [x.get('name') for x in report.get('dimensionHeaders', [])] != ['date'] or [x.get('name') for x in report.get('metricHeaders', [])] != ['totalUsers']:
        raise ValueError('Unexpected visitor report schema.')
    days = [(today - timedelta(days=n)).isoformat() for n in range(7, -1, -1)]
    values = {}
    for row in report.get('rows', []):
        date_text = row['dimensionValues'][0]['value']
        raw = row['metricValues'][0]['value']
        if not re.fullmatch(r'\d{8}', date_text) or not re.fullmatch(r'\d+', raw):
            raise ValueError('Invalid daily visitor row.')
        day = datetime.strptime(date_text, '%Y%m%d').date().isoformat()
        if day not in days or day in values or int(raw) > 9007199254740991:
            raise ValueError('Unexpected date or user count.')
        values[day] = int(raw)
    if int(report.get('rowCount', len(values))) != len(values):
        raise ValueError('Truncated visitor response.')
    # An absent date has no processed events yet; zero is still provisional.
    history = [{'date': day, 'users': values.get(day, 0)} for day in days]
    return {
        'schemaVersion': 2, 'metric': 'totalUsers', 'timeZone': 'Asia/Seoul',
        'date': today.isoformat(), 'users': values.get(today.isoformat(), 0),
        'updatedAt': fetched_at.astimezone(KOREA).isoformat(), 'history': history,
        'limited': bool(metadata.get('subjectToThresholding') or metadata.get('samplingMetadatas')),
    }


def main():
    property_id = os.environ.get('GA_PROPERTY_ID', '')
    credentials_json = os.environ.get('GA_SERVICE_ACCOUNT_JSON', '')
    if not property_id or not credentials_json:
        raise ValueError('Visitor reporting credentials are missing; existing data retained.')
    if not property_id.isdigit():
        raise ValueError('GA_PROPERTY_ID must be the numeric property ID, not G- measurement ID.')
    from google.oauth2 import service_account
    from google.auth.transport.requests import AuthorizedSession
    credentials = service_account.Credentials.from_service_account_info(
        json.loads(credentials_json), scopes=['https://www.googleapis.com/auth/analytics.readonly'])
    today = datetime.now(KOREA).date()
    with AuthorizedSession(credentials) as session:
        response = session.post(
            f'https://analyticsdata.googleapis.com/v1beta/properties/{property_id}:runReport',
            json=request_body(today), timeout=30)
        response.raise_for_status()
        payload = make_payload(response.json(), today, datetime.now(KOREA))
    target = Path(__file__).resolve().parents[1] / 'data' / 'visitors.json'
    target.parent.mkdir(parents=True, exist_ok=True)
    temp = target.with_suffix('.tmp')
    temp.write_text(json.dumps(payload, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
    temp.replace(target)
    print('Daily users and seven previous days refreshed. Today remains provisional.')


if __name__ == '__main__':
    main()
