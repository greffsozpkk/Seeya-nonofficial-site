"""List recent public Instagram posts to review for the fan gallery."""
import json
import sys
from datetime import datetime, timedelta, timezone
from pathlib import Path
from urllib.error import URLError
from urllib.request import Request, urlopen

DATA = Path(__file__).resolve().parents[1] / "src" / "data"
KST = timezone(timedelta(hours=9))


def recent_posts(handle):
    url = f"https://www.instagram.com/{handle}/embed/"
    with urlopen(Request(url, headers={"User-Agent": "Mozilla/5.0"}), timeout=20) as response:
        html = response.read().decode()
    marker = '"contextJSON":'
    if marker not in html:
        raise ValueError("공개 프로필을 읽을 수 없음")
    encoded, _ = json.JSONDecoder().raw_decode(html.split(marker, 1)[1].lstrip())
    context = json.loads(encoded)["context"]
    if context["username"] != handle:
        raise ValueError("요청 계정과 프로필 불일치")
    for item in context["graphql_media"]:
        post = item["shortcode_media"]
        owner = post["owner"]
        if owner["username"] != handle or owner["is_private"]:
            continue
        caption = " ".join(edge["node"]["text"] for edge in post["edge_media_to_caption"]["edges"])
        yield post["shortcode"], datetime.fromtimestamp(post["taken_at_timestamp"], KST).date(), caption


def main():
    gallery = json.loads((DATA / "fan-posts.json").read_text("utf-8"))
    paused = json.loads((DATA / "fan-posts-paused.json").read_text("utf-8"))
    excluded = {post["id"] for post in gallery["posts"] + paused["posts"]}
    failed = False
    for account in gallery["accounts"]:
        handle = account["handle"]
        try:
            count = 0
            for code, day, caption in recent_posts(handle):
                if code not in excluded:
                    print(day, handle, f"https://www.instagram.com/p/{code}/", " ".join(caption.split())[:140])
                    count += 1
            print(f"@{handle} 공개 프로필 미등록 후보 {count}건", file=sys.stderr)
        except (URLError, OSError, ValueError, TypeError, KeyError) as exc:
            print(f"@{handle} 확인 실패: {exc}", file=sys.stderr)
            failed = True
    return int(failed)


if __name__ == "__main__":
    sys.stdout.reconfigure(encoding="utf-8")
    sys.stderr.reconfigure(encoding="utf-8")
    sys.exit(main())
