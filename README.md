# SEEYA ARCHIVE v2.6

기준: v2.5

## Official Instagram 자동 갱신
- HOME은 `data/instagram.json`의 최신 3개 게시물을 표시합니다.
- `.github/workflows/update-instagram.yml`이 6시간마다 실행됩니다.
- `scripts/update_instagram.py`가 공개 Instagram 프로필의 최신 게시물 3개를 가져옵니다.
- 갱신 실패 시 마지막으로 성공한 JSON을 유지해 화면이 깨지지 않습니다.
- GitHub 저장소의 Actions가 활성화되어 있어야 합니다.

주의: 이 방식은 Instagram의 공개 웹 엔드포인트를 이용하므로 Instagram 측 차단/변경에 영향을 받을 수 있습니다.

## Google Sheets 스케줄
NEWS & SCHEDULE 페이지는 아래 시트의 gid=0을 CSV로 직접 읽습니다.
https://docs.google.com/spreadsheets/d/1r7aGbHpoYf6f-ixZI3dNZ9v7Pnt0CAVRgKWWNxPdPhI/edit?gid=0#gid=0

시트 수정 → 사이트 새로고침 시 자동 반영됩니다.

필수 공유 설정:
Google Sheets → 공유 → 일반 액세스 → 링크가 있는 모든 사용자 → 뷰어

## GitHub 업로드 구조
index.html
data/instagram.json
scripts/update_instagram.py
.github/workflows/update-instagram.yml
README.md
