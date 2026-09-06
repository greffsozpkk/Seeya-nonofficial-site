# SEEYA ARCHIVE v4.34 — Local Preview / Clean URL

## 변경 사항
- v4.33의 ChatGPT/web-sandbox 전용 우회 라우팅 제거
- localhost와 실제 `seeya-fanpage.com`에서 동일한 clean URL 구조 사용
- `popstate` 라우팅 추가
- `/guide/`, `/news/`, `/music/`, `/history/`, `/members/`, `/gallery/`, `/archive/`, `/today/` 구조 유지
- `serve-local.bat` 추가
- `serve-local.sh` 추가
- `LOCAL_PREVIEW.md` 추가

## 로컬 확인
Windows:
`serve-local.bat`

직접 실행:
`py -m http.server 8000`
또는
`python -m http.server 8000`

브라우저:
`http://localhost:8000/`

## 배포
GitHub Pages에는 ZIP의 폴더 구조 전체를 그대로 업로드해야 합니다.
