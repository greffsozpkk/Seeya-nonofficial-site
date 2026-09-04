#!/usr/bin/env python3
import json, re, urllib.parse, urllib.request, xml.etree.ElementTree as ET
from datetime import datetime, timezone
from email.utils import parsedate_to_datetime
from pathlib import Path

QUERIES = {
    "씨야": ['"씨야" 가수', '"씨야" 콘서트 OR 앨범 OR 신곡 OR 컴백'],
    "남규리": ['"남규리" 가수', '"남규리" 신곡 OR 앨범 OR 씨야'],
    "김연지": ['"김연지" 가수 -코스프레 -모델', '"김연지" 신곡 OR 앨범 OR OST OR 뮤지컬'],
    "이보람": ['"이보람" 가수', '"이보람" 신곡 OR 앨범 OR 씨야']
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
        desc=re.sub(r"\s+"," ",desc).strip()
        if title and link:
            try:
                dt=parsedate_to_datetime(pub)
                pub_iso=dt.isoformat()
            except Exception:
                pub_iso=pub
            out.append({"title":title,"source":source or "NEWS","pubDate":pub_iso,"link":link,"description":desc[:220]})
    return out

data={}
for category, queries in QUERIES.items():
    merged=[]
    for q in queries:
        try:
            merged.extend(parse(fetch(q)))
        except Exception as e:
            print(category, q, e)
    seen=set()
    clean=[]
    for x in merged:
        key=re.sub(r"\s+-\s+[^-]+$","",x["title"]).strip()
        if key in seen: continue
        seen.add(key)
        clean.append(x)
    clean.sort(key=lambda x:x["pubDate"], reverse=True)
    data[category]=clean[:10]

data["updatedAt"]=datetime.now(timezone.utc).isoformat()
OUT.parent.mkdir(parents=True, exist_ok=True)
OUT.write_text(json.dumps(data, ensure_ascii=False, indent=2), encoding="utf-8")
