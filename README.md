# SEEYA ARCHIVE — v4.67

기준: 사용자 지정 SEEYA_ARCHIVE_Pearl_Light_Pink_v4_65_QUIZ_READABILITY_MOBILE_BANNER.zip.

이번 버전은 뉴스 오탐 필터를 추가했습니다. 변경 내용은 CHANGELOG.md를 참조하세요. 이후 전달본도 버전을 순차 증가합니다.

## 실행

이미 생성된 사이트를 보려면 기존처럼 **serve-local.bat을 실행하고 http://localhost:8000/ 을 여세요.** Python 3을 사용하므로 Node.js는 필요하지 않습니다. 서버 창은 열어 두세요.

소스를 수정하여 HTML을 다시 생성할 때만 Node.js 22 이상을 권장합니다. 빌드에는 npm 패키지가 필요 없습니다.

```sh
node build.js
node scripts/check.js
node scripts/serve.js
```

http://127.0.0.1:8080/ 에서 확인합니다. 종료는 Ctrl+C. file:// 더블클릭 대신 로컬 서버를 사용하세요. 도메인 루트 배포 기준입니다.

**생성된 HTML 직접 편집 금지.** 각 경로 index.html, 해시가 붙은 assets/site.* 및 assets/lyric-quiz.*, sitemap.xml, build-manifest.json은 빌드 산출물입니다. src/ 또는 data/를 수정하고 node build.js를 실행하세요.

## 편집 위치

- src/template.html: 공통 head·메뉴·main·모달
- src/pages/: 페이지별 렌더 함수. FANCHANT는 music.js에서 경로로 구분
- src/shared/: 빌드·브라우저 공용 순수 렌더 함수
- src/client/: 검색·필터·확대·추천·퀴즈 동작
- src/styles/: 기존 CSS. 인스타 피드 스타일 제거·배경 경로 보정 외 유지
- src/data/: albums, members, guide, history, tarot, today-songs, today-moods, fanchant, archive-types, routes, site JSON
- data/news.json: 뉴스 빌드 입력 및 브라우저 최신 갱신
- data/archive.json, data/photos.json: 활동 기록·갤러리
- scripts/update_news.py: 기존 뉴스 수집기

앨범·멤버 기본 프로필·가이드 추천곡·오늘의 추천곡·분위기·응원법을 JSON으로 분리했습니다. HISTORY 기존 요약 배열도 보존했습니다. 긴 HISTORY 서술, GUIDE 설명, 멤버 SNS 마크업은 디자인 보존을 위해 페이지 렌더 함수에 남겨 점진 분리합니다.

퀴즈 실행 문제은행은 원본처럼 src/client/lyric-quiz.js에 내장되어 있습니다. 문제 변경 시 참고용 data/lyric-quiz.json도 함께 수정하세요. 총 135문제(30/45/60), 무작위 10문제, 앨범 힌트, 첫 시도 점수, 결과 줄바꿈·모바일 배너를 유지했습니다.

## 생성·이동

src/data/routes.json이 경로·메타·sitemap의 단일 기준입니다. 메뉴는 일반 링크로 실제 HTML을 엽니다. route()를 통한 본문 재생성이 없습니다. 예전 #/guide/ 같은 북마크만 실제 경로로 전환합니다. 숨겨진 타로는 기존 키 입력으로 클라이언트에서 열립니다.

NEWS·ARCHIVE·GALLERY는 JSON을 초기 HTML에 반영하고 브라우저에서 갱신합니다. 통신 실패 시 빌드 데이터가 대체합니다. JS를 꺼도 본문과 링크는 동작합니다. 검색·필터·퀴즈·확대에는 JS가 필요합니다.

같은 입력은 같은 산출물을 만듭니다. src/data/site.json의 snapshotDate는 TODAY·갤러리 기본 표시 기준이며, TODAY는 방문 시 현재 날짜·무작위 추천으로 갱신됩니다. 날짜를 바꾸려면 이 설정을 수정하세요. 뉴스 날짜는 한국 시간 기준입니다.

CSS/JS는 내용 해시 파일명을 사용합니다. 생성기가 소유한 오래된 해시 자산만 정리합니다. 소스와 산출물을 함께 보관하세요.

## 기준 ZIP 누락 보충

ZIP에 news.json·photos.json·뉴스 수집기·Actions가 없었습니다. 뉴스는 v4.65 NEWS_FALLBACK을 JSON으로 옮겼습니다. 사진은 원본처럼 빈 목록이며 테스트용 사진은 포함하지 않습니다.

원본이 참조하지만 ZIP에 없던 멤버 서명 3개, 응원법 이미지·배경 13개, 타로 이미지 1개와 뉴스 수집기를 기존 greffsozpkk/Seeya-nonofficial-site 저장소 커밋 87b9ddc7459fde1ba9996a78ade847ca504f6033에서 보충했습니다. v4.65에 존재하는 파일은 구버전으로 덮어쓰지 않았습니다.

메인 인스타 피드·전용 스타일·데이터 의존·갱신 자동화는 제거했습니다. 공식 인스타 및 멤버 SNS로 가는 일반 링크는 유지합니다.

## 자동화·배포

.github/workflows/update-news.yml: 수집 → 빌드 → 검증 → JSON·HTML·자산 동시 커밋. build.yml: main의 소스·데이터 변경 시 재생성. 저장소 쓰기 권한이 필요합니다. 이번 작업에서 원격 업로드·실제 Actions 실행·배포는 하지 않았습니다.

배포 파일: index.html, 각 경로 폴더, assets/, images/, data/, 404.html, robots.txt, sitemap.xml. GitHub Pages 저장소의 기존 CNAME 설정을 유지하세요.

## 검증

node scripts/check.js는 재현성·JS 구문·로컬 링크를 확인합니다. 선택적 기능 검사는 Playwright 설치 환경에서 node scripts/browser-check.cjs로 실행합니다(Edge 필요). 빌드 자체는 Playwright에 의존하지 않습니다.

검증 범위와 기존 제한은 validation/REPORT.md를 확인하세요.
