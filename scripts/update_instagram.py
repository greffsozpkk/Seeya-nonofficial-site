#!/usr/bin/env python3
import json
import sys
from datetime import datetime, timezone
from pathlib import Path
from urllib.request import Request, urlopen

USERNAME = "seeya_ent_official"
API = f"https://www.instagram.com/api/v1/users/web_profile_info/?username={USERNAME}"
OUT = Path(__file__).resolve().parents[1] / "data" / "instagram.json"

headers = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/131 Safari/537.36",
    "Accept": "*/*",
    "Accept-Language": "ko-KR,ko;q=0.9,en;q=0.8",
    "Referer": f"https://www.instagram.com/{USERNAME}/",
    "X-IG-App-ID": "936619743392459",
}

try:
    req = Request(API, headers=headers)
    with urlopen(req, timeout=25) as res:
        payload = json.load(res)

    user = payload["data"]["user"]
    edges = user["edge_owner_to_timeline_media"]["edges"]
    posts = []
    for edge in edges[:3]:
        n = edge["node"]
        posts.append({
            "url": f"https://www.instagram.com/p/{n['shortcode']}/",
            "image": n.get("display_url") or n.get("thumbnail_src"),
            "type": "video" if n.get("is_video") else "image",
            "taken_at": n.get("taken_at_timestamp")
        })

    if len(posts) < 3 or any(not p["image"] for p in posts):
        raise RuntimeError("Instagram returned fewer than 3 usable posts")

    out = {
        "account": USERNAME,
        "updated_at": datetime.now(timezone.utc).isoformat(),
        "source": "instagram-web-profile-info",
        "posts": posts
    }
    OUT.parent.mkdir(parents=True, exist_ok=True)
    OUT.write_text(json.dumps(out, ensure_ascii=False, indent=2), encoding="utf-8")
    print("Updated", OUT)

except Exception as e:
    print(f"Instagram update skipped: {e}", file=sys.stderr)
    sys.exit(0)
