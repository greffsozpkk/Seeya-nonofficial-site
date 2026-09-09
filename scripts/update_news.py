#!/usr/bin/env python3
import json, re, urllib.parse, urllib.request, xml.etree.ElementTree as ET
from html import unescape
from datetime import datetime, timezone
from email.utils import parsedate_to_datetime
from pathlib import Path
from news_filter import relevant_news

QUERIES = {
    "씨야": ['"씨야" 가수', '"씨야" 콘서트 OR 앨범 OR 신곡 OR 컴백'],
    "남규리": ['"남규리" 가수', '"남규리" 신곡 OR 앨범 OR 씨야'],
    "김연지": ['"씨야" "김연지"', '"김연지" "가수"', '"김연지" (신곡 OR 앨범 OR OST OR 뮤지컬)'],
    "이보람": ['"씨야 이보람"', '"이보람" 가수', '"이보람" 골때녀 OR 신곡 OR 앨범']
}
OUT = Path("data/news.json")

def fetch(q):
    url = "https://news.google.com/rss/search?" + urllib.parse.urlencode({
        "q": q + " when:60d", "hl":"ko", "gl":"KR", "ceid":"KR:ko"
    })
    req = urllib.request.Request(url, headers={"User-Agent":"Mozilla/5.0 SEEYA-Archive-NewsBot/1.0"})
    with urllib.request.urlopen(req, timeout=20) as r:
        return r.read()

def parse(xml_bytes):
    root = ET.fromstring(xml_bytes)
    out=[]
    for item in root.findall(".//item"):
        title=(item.findtext("title") or "").strip()
        link=(item.findtext("link") or "").strip()
        pub=(item.findtext("pubDate") or "").strip()
        desc=(item.findtext("description") or "").strip()
        src_el=item.find("source")
        source=(src_el.text if src_el is not None and src_el.text else "").strip()
        desc=re.sub(r"<[^>]+>"," ",desc)
        desc=re.sub(r"\s+"," ",unescape(desc)).strip()
        if title and link:
            try:
                dt=parsedate_to_datetime(pub)
                pub_iso=dt.isoformat()
            except Exception:
                pub_iso=pub
            out.append({"title":title,"source":source or "NEWS","pubDate":pub_iso,"link":link,"description":desc[:220]})
    return out

def collect(previous, fetcher=fetch, now=None):
    now = now or datetime.now(timezone.utc).isoformat()
    data = dict(previous)
    updated = dict(previous.get('categoryUpdatedAt', {}))
    successful = 0
    for category, queries in QUERIES.items():
        merged = []
        for q in queries:
            try:
                merged.extend(parse(fetcher(q)))
            except Exception as e:
                print(category, q, e)
        fresh = [x for x in merged if relevant_news(x, category)]
        old = [x for x in previous.get(category, []) if relevant_news(x, category)]
        if fresh:
            successful += 1
            updated[category] = now
        else:
            print(category, ': no valid new results; preserving previous articles')
        seen = set()
        clean = []
        def timestamp(item):
            try:
                return datetime.fromisoformat(item.get('pubDate','').replace('Z','+00:00')).timestamp()
            except (ValueError, TypeError):
                return 0
        for item in sorted(fresh + old, key=timestamp, reverse=True):
            key = re.sub(r'\s+-\s+[^-]+$', '', item['title']).strip()
            if key not in seen:
                seen.add(key)
                clean.append(item)
        data[category] = clean[:5]
    data['lastCheckedAt'] = now
    data['categoryUpdatedAt'] = updated
    if successful:
        data['updatedAt'] = now
    return data, successful

def main():
    previous = json.loads(OUT.read_text(encoding='utf-8')) if OUT.exists() else {}
    data, successful = collect(previous)
    OUT.parent.mkdir(parents=True, exist_ok=True)
    OUT.write_text(json.dumps(data, ensure_ascii=False, indent=2), encoding='utf-8')
    # The workflow still builds and deploys preserved data, then reports the outage.
    return 0 if successful else 2

if __name__ == '__main__':
    raise SystemExit(main())
