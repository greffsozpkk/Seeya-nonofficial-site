#!/usr/bin/env python3
"""Find review candidates; never write archive.json or generated site files.

Python standard library only. Remote text is data, never an instruction.
"""
import argparse
import csv
import hashlib
import html
import json
import os
import re
import sys
import urllib.error
import urllib.parse
import urllib.request
from datetime import datetime, timedelta, timezone
from pathlib import Path

from news_filter import relevant_news
from update_news import parse as parse_news

ROOT = Path(__file__).resolve().parents[1]
KST = timezone(timedelta(hours=9))
MEMBERS = ['남규리', '김연지', '이보람']
TOPICS = [('radio', '라디오', ['라디오', '컬투쇼', '정오의 희망곡', '박명수', 'radio']),
          ('variety', '예능', ['예능', '야심만만', '스타골든벨', '골때녀', '골 때리는']),
          ('concert', '공연', ['콘서트', '뮤지컬', 'concert']),
          ('event', '행사', ['축제', '행사', '가요제', '페스티벌']),
          ('music-show', '음악방송·무대', ['무대', '직캠', '인기가요', '음악중심', '뮤직뱅크', 'live']),
          ('interview', '인터뷰', ['인터뷰', 'interview']),
          ('album', '앨범·음원', ['앨범', '발매', '신곡', 'ost'])]


def clean(text):
    return re.sub(r'\s+', ' ', html.unescape(re.sub(r'<[^>]*>', ' ', str(text or '')))).strip()


def canonical(url):
    try:
        p = urllib.parse.urlsplit(html.unescape(url).strip())
        if p.scheme not in ('http', 'https') or not p.hostname or p.username or p.password:
            return ''
        host = p.hostname.lower().removeprefix('www.')
        query = urllib.parse.parse_qs(p.query)
        video = ''
        if host == 'youtu.be':
            video = p.path.strip('/').split('/')[0]
        elif host in ('youtube.com', 'm.youtube.com', 'music.youtube.com'):
            video = query.get('v', [''])[0] if p.path == '/watch' else ''
            if p.path.startswith(('/shorts/', '/live/', '/embed/')):
                video = p.path.split('/')[2]
        if re.fullmatch(r'[A-Za-z0-9_-]{11}', video):
            return 'https://www.youtube.com/watch?v=' + video
        if host == 'news.google.com':
            return 'https://' + host + p.path.rstrip('/')
        kept = sorted((k, v) for k, vs in query.items() for v in vs
                      if not k.lower().startswith('utm_') and k.lower() not in ('fbclid', 'gclid', 'feature', 'si'))
        return urllib.parse.urlunsplit(('https', host, p.path.rstrip('/') or '/', urllib.parse.urlencode(kept), ''))
    except (ValueError, TypeError):
        return ''


def title_key(title):
    return re.sub(r'[^a-z0-9가-힣]', '', clean(title).lower())


def source_title(title):
    return re.sub(r'\s+-\s+[^-]+$', '', title).strip()


def published_date(value):
    try:
        dt = datetime.fromisoformat(value.replace('Z', '+00:00'))
        if dt.tzinfo is None:
            return ''
        return dt.astimezone(KST).date().isoformat()
    except (ValueError, TypeError, AttributeError):
        return ''


def get_bytes(url):
    req = urllib.request.Request(url, headers={'User-Agent': 'SEEYA-Archive-Discovery/1.0'})
    with urllib.request.urlopen(req, timeout=25) as response:
        return response.read(8_000_000)


def history_queries(config, day):
    # Cycle every day through years and topics; old activity year is a search
    # term, never an assumed broadcast date or a video publication filter.
    years = list(range(config['historyStartYear'], day.year + 1))
    index = (day - datetime(2026, 1, 1).date()).days
    year = years[index % len(years)]
    topic = config['historyTopics'][(index // len(years)) % len(config['historyTopics'])]
    return [f'{term} {year} {topic}' for term in config['historyTerms']]


def discover(config, now, api_key='', fetcher=get_bytes):
    found, checks = [], []
    for item in config['newsQueries']:
        q = item['query'] + f" when:{config['recentDays']}d"
        url = 'https://news.google.com/rss/search?' + urllib.parse.urlencode({'q': q, 'hl': 'ko', 'gl': 'KR', 'ceid': 'KR:ko'})
        try:
            rows = parse_news(fetcher(url))
            for row in rows:
                if relevant_news(row, item['category']):
                    found.append({'url': row['link'], 'title': row['title'], 'description': row['description'],
                                  'publisher': row['source'], 'publishedAt': row['pubDate'], 'sourceKind': 'news', 'query': q})
            checks.append({'source': 'news', 'query': q, 'status': 'ok', 'results': len(rows)})
        except Exception as exc:
            # Do not log request URLs / exception messages (API credentials).
            checks.append({'source': 'news', 'query': q, 'status': 'error', 'reason': type(exc).__name__})
    if not api_key:
        checks.append({'source': 'youtube', 'status': 'not_configured', 'reason': 'YOUTUBE_API_KEY 미등록'})
        return found, checks
    jobs = [(q, True) for q in config['youtubeQueries']] + [(q, False) for q in history_queries(config, now.astimezone(KST).date())]
    halted = False
    for q, recent in jobs:
        if halted:
            checks.append({'source': 'youtube', 'query': q, 'status': 'skipped', 'reason': '앞선 API 인증/할당량 오류'})
            continue
        token, total = '', 0
        try:
            for page in range(config['youtubePagesPerQuery']):
                params = {'part': 'snippet', 'type': 'video', 'q': q, 'order': 'date' if recent else 'relevance',
                          'maxResults': 50, 'relevanceLanguage': 'ko', 'key': api_key}
                if recent:
                    params['publishedAfter'] = (now - timedelta(days=config['recentDays'])).astimezone(timezone.utc).isoformat().replace('+00:00', 'Z')
                if token:
                    params['pageToken'] = token
                response = json.loads(fetcher('https://www.googleapis.com/youtube/v3/search?' + urllib.parse.urlencode(params)))
                if 'error' in response:
                    raise ValueError('API error')
                for row in response.get('items', []):
                    video = row.get('id', {}).get('videoId', '')
                    if not re.fullmatch(r'[A-Za-z0-9_-]{11}', video):
                        continue
                    s = row.get('snippet', {})
                    found.append({'url': 'https://www.youtube.com/watch?v=' + video, 'title': s.get('title', ''),
                                  'description': s.get('description', ''), 'publisher': s.get('channelTitle', ''),
                                  'publishedAt': s.get('publishedAt', ''), 'sourceKind': 'youtube', 'query': q})
                    total += 1
                token = response.get('nextPageToken', '')
                if not token:
                    break
            checks.append({'source': 'youtube', 'query': q, 'status': 'ok', 'results': total, 'limited': bool(token)})
        except Exception as exc:
            if isinstance(exc, urllib.error.HTTPError) and exc.code in (400, 401, 403):
                halted = True
            checks.append({'source': 'youtube', 'query': q, 'status': 'error', 'reason': type(exc).__name__})
    return found, checks


def classify(row):
    title, desc = clean(row.get('title')), clean(row.get('description'))
    text = title + ' ' + desc
    members = [m for m in MEMBERS if m in text]
    group = '씨야' in text or bool(re.search(r'\bseeya\b', text, re.I))
    if not group and not members:
        return None
    # A group mention does not establish individual attendance.
    subjects = members or ['씨야']
    kind, label = ('news', '기사') if row['sourceKind'] == 'news' else ('etc', '분류 확인')
    for key, name, words in TOPICS:
        if any(w.lower() in text.lower() for w in words):
            kind, label = key, name
            break
    warnings = ['실제 활동일 확인 필요', '원문 내용·출연 여부 확인 필요']
    if not group and row['sourceKind'] == 'youtube':
        warnings.append('동명이인·커버 영상 여부 확인 필요')
    if '예정' in text or '취소' in text or '변경' in text:
        warnings.append('일정 상태 확인 필요')
    if row['sourceKind'] == 'news' and 'news.google.com' in row.get('url', ''):
        warnings.append('Google 뉴스 경유 링크 · 원문 링크 확인 필요')
    return subjects, kind, label, warnings


def related_records(row, archive):
    from archive_match import recommendations
    strong=recommendations(row,archive)
    if strong:return strong
    title = clean(row['title']).lower()
    words = set(re.findall(r'[가-힣a-z0-9]{2,}', title)) - set(MEMBERS) - {
        '씨야', 'seeya', '공식', '영상', '출연', '예정', '예고', '무대', '가수',
        '음악', '방송', '근황', '소식', '공개', '컴백', '활동', '멤버', '발표', '기념', '신곡'}
    scored = []
    for record in archive:
        if record.get('hidden') or record.get('mergedInto'):
            continue
        if '씨야' not in row['members'] and not set(row['members']).intersection(record.get('members', [])):
            continue
        other = set(re.findall(r'[가-힣a-z0-9]{2,}', (record['title'] + ' ' + record.get('program', '')).lower()))
        common = words & other
        exact_title = title_key(source_title(row['title'])) == title_key(record['title'])
        if len(common) >= 2 or exact_title:
            scored.append((100 if exact_title else len(common), record))
    return [{'id': r['id'], 'title': r['title'], 'date': r['date']} for _, r in sorted(scored, key=lambda v: (-v[0], v[1]['id']))[:3]]


def merge_candidates(previous, fresh, archive, config, now, checks):
    existing_urls = set()
    for record in archive:
        for s in [record.get('source', {}), *record.get('additionalSources', [])]:
            existing_urls.add(canonical(s.get('url', '')))
    ignored = {canonical(u) for u in config.get('ignoredUrls', [])}
    pending, duplicates, excluded = {}, set(), set()
    stamp = now.isoformat()
    for old in previous.get('candidates', []):
        url = canonical(old['url'])
        aliases = {url, *(canonical(u) for u in old.get('alternateUrls', []))}
        if aliases.intersection(existing_urls):
            existing_urls.update(aliases)
        if aliases.intersection(ignored):
            ignored.update(aliases)
        if url and not aliases.intersection(existing_urls | ignored):
            pending[url] = dict(old)
    for raw in fresh:
        url = canonical(raw.get('url', ''))
        if not url or url in ignored:
            continue
        title = clean(raw.get('title'))
        if url in existing_urls:
            duplicates.add(url)
            continue
        info = classify(raw)
        if not info:
            excluded.add(url)
            continue
        members, kind, label, warnings = info
        old = pending.get(url, {})
        candidate = {'id': 'candidate-' + hashlib.sha256(url.encode()).hexdigest()[:16], 'url': url,
                     'title': title, 'description': clean(raw.get('description'))[:1000],
                     'publisher': clean(raw.get('publisher')), 'sourceKind': raw['sourceKind'],
                     'publishedAt': raw.get('publishedAt', ''), 'publishedDateKST': published_date(raw.get('publishedAt', '')),
                     'activityDate': None, 'dateBasis': 'published', 'members': members,
                     'suggestedType': kind, 'typeLabel': label, 'reviewNotes': warnings,
                     'firstSeenAt': old.get('firstSeenAt', stamp), 'lastSeenAt': stamp,
                     'alternateUrls': old.get('alternateUrls', []),
                     'queries': sorted(set(old.get('queries', []) + [raw.get('query', '')]) - {''})}
        pending[url] = candidate
    # Google News can give the same article several wrapper URLs. Only merge
    # identical publisher + title + publication day; preserve every source URL.
    grouped = {}
    grouped_count = 0
    for candidate in sorted(pending.values(), key=lambda r: (r['firstSeenAt'], r['url'])):
        key = ('news', title_key(candidate['title']), candidate['publisher'], candidate['publishedDateKST']) if candidate['sourceKind'] == 'news' and candidate['publishedDateKST'] else ('url', candidate['url'])
        if key not in grouped:
            grouped[key] = candidate
            continue
        first = grouped[key]
        first['alternateUrls'] = sorted(({candidate['url'], *candidate.get('alternateUrls', []), *first.get('alternateUrls', [])} - {first['url']}))
        first['queries'] = sorted(set(first['queries'] + candidate['queries']))
        first['lastSeenAt'] = max(first['lastSeenAt'], candidate['lastSeenAt'])
        grouped_count += 1
    pending = {r['url']: r for r in grouped.values() if not {r['url'], *r.get('alternateUrls', [])}.intersection(existing_urls | ignored)}
    for candidate in pending.values():
        candidate['relatedRecords'] = related_records(candidate, archive)
    candidates = sorted(pending.values(), key=lambda r: (r['firstSeenAt'], r.get('publishedDateKST', ''), r['id']), reverse=True)
    return {'schemaVersion': 1, 'checkedAt': stamp, 'archiveCount': len(archive),
            'summary': {'pending': len(candidates), 'new': sum(r['firstSeenAt'] == stamp for r in candidates),
                        'alreadyArchived': len(duplicates), 'unrelated': len(excluded), 'groupedNewsLinks': grouped_count},
            'checks': checks, 'candidates': candidates}


def safe_csv(value):
    text = str(value or '')
    return "'" + text if text.lstrip().startswith(('=', '+', '-', '@')) else text


def render_report(state):
    esc = lambda s: html.escape(str(s), quote=True)
    cards = []
    for row in state['candidates']:
        related = ''.join(f'<li><a href="https://seeya-fanpage.com/archive/?record={urllib.parse.quote(r["id"])}" target="_blank" rel="noopener noreferrer">{esc(r["date"])} · {esc(r["title"])}</a></li>' for r in row['relatedRecords'])
        is_new = row['firstSeenAt'] == state['checkedAt']
        cards.append(f'''<article data-source="{esc(row['sourceKind'])}" data-members="{esc(' '.join(row['members']))}" data-new="{str(is_new).lower()}">
<label class="pick"><input type="checkbox" value="{esc(row['id'])}"> 선택 {"· 이번에 발견" if is_new else "· 이전에 발견"}</label>
<p class="meta">{esc(' · '.join(row['members']))} · {esc(row['typeLabel'])} 후보 · {esc(row['publisher'])}</p>
<h2><a href="{esc(row['url'])}" target="_blank" rel="noopener noreferrer">{esc(row['title'])} ↗</a></h2>
<p>게시일 {esc(row['publishedDateKST'] or '미확인')} · <strong>활동일 미확정</strong></p><p>{esc(row['description'])}</p>
<details><summary>확인할 내용{(' · 유사 기록 ' + str(len(row['relatedRecords'])) + '건') if related else ''}</summary>
<ul>{''.join('<li>'+esc(w)+'</li>' for w in row['reviewNotes'])}</ul>{('<p>같은 활동인지 비교해 주세요. 자동으로 합치지 않았습니다.</p><ul>'+related+'</ul>') if related else ''}
<p>발견 검색어: {esc(' / '.join(row['queries']))}</p>{('<p>동일 제목·매체·게시일의 링크를 묶었습니다.</p><ul>'+''.join('<li><a target="_blank" rel="noopener noreferrer" href="'+esc(u)+'">다른 검색 링크 ↗</a></li>' for u in row.get('alternateUrls', []) if canonical(u))+'</ul>') if row.get('alternateUrls') else ''}</details></article>''')
    checks = ''.join('<li>'+esc(f"{c['source']} · {c.get('query', '')} · {c['status']} · {c.get('reason', '')}" + (' · 검색 결과 상한 도달' if c.get('limited') else ''))+'</li>' for c in state['checks'])
    payload = json.dumps(state['candidates'], ensure_ascii=False).replace('<', '\\u003c').replace('&', '\\u0026')
    summary = state['summary']
    checked_label = datetime.fromisoformat(state['checkedAt']).astimezone(KST).strftime('%Y년 %m월 %d일 %H:%M (한국 시간)')
    return f'''<!doctype html><html lang="ko"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex,nofollow"><title>씨야 아카이브 · 발견한 기록 검토</title>
<style>body{{margin:0;background:#fff8fb;color:#352932;font:16px/1.65 system-ui,sans-serif}}main{{max-width:960px;margin:auto;padding:30px 20px}}h1{{font-size:28px}}h2{{font-size:19px;margin:8px 0}}a{{color:#92385a;overflow-wrap:anywhere}}p{{overflow-wrap:anywhere}}.intro,article{{background:white;border:1px solid #e7ccd7;border-radius:14px;padding:22px;margin:18px 0}}.meta,.pick{{font-size:14px;color:#66505c}}.toolbar{{display:flex;gap:10px;flex-wrap:wrap;margin:20px 0}}input[type=search]{{flex:1;min-width:150px}}select,button,input[type=search]{{font:inherit;padding:10px;border:1px solid #bb8c9f;border-radius:8px;background:white;color:#352932}}button{{cursor:pointer;background:#f5e1ea}}summary{{cursor:pointer;font-weight:600}}[hidden]{{display:none!important}}.notice{{color:#853243}}@media(max-width:480px){{main{{padding:18px 14px}}article{{padding:17px}}h1{{font-size:24px}}}}</style>
<main><p>SEEYA · ARCHIVE REVIEW</p><h1>새로 발견한 씨야 기록</h1><div class="intro"><b>검토 대기 {summary['pending']}건 · 이번에 발견 {summary['new']}건</b><p>아카이브 {state['archiveCount']}건과 비교했습니다. 이미 등록된 자료 {summary['alreadyArchived']}건은 제외했습니다.</p><p>조회 시각 {esc(checked_label)}</p><p class="notice">검색으로 찾은 후보입니다. 출연 여부·실제 날짜·분류는 확인이 필요하며 사이트와 캘린더에 자동 공개되지 않습니다.</p><p>필요한 항목을 선택해 저장한 뒤 다음 아카이브 업데이트 때 전달해 주세요.</p></div>
<div class="toolbar"><input id="search" type="search" placeholder="제목·방송·행사 검색" aria-label="기록 검색"><select id="member" aria-label="멤버"><option value="">전체 멤버</option><option>씨야</option><option>남규리</option><option>김연지</option><option>이보람</option></select><select id="source" aria-label="자료 종류"><option value="">모든 자료</option><option value="youtube">유튜브</option><option value="news">뉴스</option></select><label><input id="onlynew" type="checkbox"> 이번 발견만</label></div>
<div class="toolbar"><button id="export">선택 기록 저장 (JSON)</button><button id="reject">선택 항목 제외 설정</button><span id="count" role="status"></span></div><section id="cards">{''.join(cards) or '<p>아직 검토 후보가 없습니다. 아래 수집 상태를 확인해 주세요.</p>'}</section><details><summary>수집 상태 · 오류 및 설정 확인</summary><ul>{checks}</ul><p>반영하지 않을 항목은 ‘선택 항목 제외 설정’으로 저장해 src/data/archive-discovery.json의 ignoredUrls에 합칩니다. 선택만 하고 창을 닫으면 영구 제외되지 않습니다.</p><p>검색 결과는 전체 자료를 보장하지 않습니다. 실패한 수집원은 다음 실행에서 다시 확인하며 이전 후보를 유지합니다. 유튜브 API 키 미등록 시 뉴스만 수집합니다.</p></details></main>
<script type="application/json" id="records">{payload}</script><script>
const rows=JSON.parse(document.getElementById('records').textContent),cards=[...document.querySelectorAll('article')];
const search=document.getElementById('search'),member=document.getElementById('member'),source=document.getElementById('source'),onlynew=document.getElementById('onlynew'),count=document.getElementById('count');
function filter(){{let shown=0;for(const c of cards){{c.hidden=!(c.textContent.toLowerCase().includes(search.value.toLowerCase())&&(!member.value||c.dataset.members.includes(member.value))&&(!source.value||c.dataset.source===source.value)&&(!onlynew.checked||c.dataset.new==='true'));if(!c.hidden)shown++;}}count.textContent=shown+'건 표시 · '+document.querySelectorAll('.pick input:checked').length+'건 선택';}}
for(const e of [search,member,source,onlynew])e.addEventListener('input',filter);for(const e of document.querySelectorAll('.pick input'))e.addEventListener('change',filter);
function save(reject){{const ids=new Set([...document.querySelectorAll('.pick input:checked')].map(e=>e.value)),selected=rows.filter(r=>ids.has(r.id));if(!selected.length){{count.textContent='저장할 항목을 먼저 선택해 주세요.';return;}}const result=reject?{{ignoredUrls:[...new Set(selected.flatMap(r=>[r.url,...(r.alternateUrls||[])]))]}}:{{candidates:selected}};const url=URL.createObjectURL(new Blob([JSON.stringify(result,null,2)],{{type:'application/json'}}));const a=document.createElement('a');a.href=url;a.download=reject?'archive-ignored-urls.json':'archive-selected.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);}}
document.getElementById('export').onclick=()=>save(false);document.getElementById('reject').onclick=()=>save(true);filter();
</script></html>'''


def write_outputs(state, output):
    output.mkdir(parents=True, exist_ok=True)
    tmp = output / 'candidates.tmp'
    tmp.write_text(json.dumps(state, ensure_ascii=False, indent=2), encoding='utf-8')
    tmp.replace(output / 'candidates.json')
    (output / 'review.html').write_text(render_report(state), encoding='utf-8')
    with (output / 'candidates.csv').open('w', encoding='utf-8-sig', newline='') as f:
        writer = csv.writer(f)
        writer.writerow(['후보 ID', '제목', '멤버/그룹 언급', '분류 후보', '게시일(한국)', '활동일', '링크', '출처', '검토 메모'])
        for r in state['candidates']:
            writer.writerow([safe_csv(v) for v in [r['id'], r['title'], ' · '.join(r['members']), r['typeLabel'], r['publishedDateKST'], '미확정', r['url'], r['publisher'], ' / '.join(r['reviewNotes'])]])


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--output', type=Path, default=ROOT.parent / 'archive-review')
    parser.add_argument('--previous', type=Path)
    args = parser.parse_args()
    config = json.loads((ROOT / 'src/data/archive-discovery.json').read_text(encoding='utf-8'))
    assert 1 <= config['recentDays'] <= 90 and 1 <= config['youtubePagesPerQuery'] <= 3
    assert 2006 <= config['historyStartYear'] <= datetime.now(KST).year
    archive = json.loads((ROOT / 'data/archive.json').read_text(encoding='utf-8'))
    previous_path = args.previous or args.output / 'candidates.json'
    previous = json.loads(previous_path.read_text(encoding='utf-8')) if previous_path.exists() else {}
    if previous and previous.get('schemaVersion') != 1:
        raise ValueError('Unsupported prior candidate format; refusing to overwrite')
    now = datetime.now(timezone.utc)
    fresh, checks = discover(config, now, os.environ.get('YOUTUBE_API_KEY', ''))
    state = merge_candidates(previous, fresh, archive, config, now, checks)
    write_outputs(state, args.output)
    errors = sum(c['status'] == 'error' for c in checks)
    message = f"검토 대기 {state['summary']['pending']}건 / 이번 발견 {state['summary']['new']}건 / 수집 오류 {errors}건"
    print(message)
    if os.environ.get('GITHUB_STEP_SUMMARY'):
        with open(os.environ['GITHUB_STEP_SUMMARY'], 'a', encoding='utf-8') as f:
            f.write('## 씨야 아카이브 수집 결과\n\n'+message+'\n\n아래 Artifacts의 **archive-discovery-review**를 내려받아 압축을 풀고 **review.html**을 여세요.\n\n')
            f.write('유튜브: '+('키 설정됨' if os.environ.get('YOUTUBE_API_KEY') else '**YOUTUBE_API_KEY 미등록 — 뉴스만 수집**')+'\n\n')
            f.write('기존 아카이브와 사이트는 변경하지 않았습니다. 수집 오류가 있더라도 이전 후보와 이번에 성공한 결과를 저장했습니다.\n')
    return 2 if errors else 0


if __name__ == '__main__':
    sys.exit(main())
