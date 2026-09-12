# SEEYA ARCHIVE — v4.90

v4.89 통합본의 기존 아카이브 553건을 보존하고, 2012~2019년 씨야 멤버 활동 156건을 추가했습니다. 전체 아카이브는 709건입니다. 개인·공동 무대, 공연·행사, 라디오·인터뷰, 음원·OST, 예능·연기 활동과 기사 기록을 포함합니다. 공개 자료로 확인한 범위이며 이 기간의 모든 활동을 빠짐없이 수집했다는 의미는 아닙니다.

## 이번 통합본 적용

1. GitHub Desktop에서 **Fetch origin → Pull origin**으로 최신 파일을 받습니다.
2. `SEEYA_v4_90_UPLOAD.zip`의 내용물을 저장소 최상위 폴더에 같은 경로로 복사합니다.
3. 복사한 **cleanup-legacy.bat**을 한 번 실행합니다. Node 설치 없이 Windows PowerShell로 동작하며 이전 버전별 문서·아카이브 JSON·검사 파일을 백업 후 정리합니다.
4. GitHub Desktop에서 변경·삭제 내역을 확인하고 **Commit → Push**합니다. 뉴스/사이트 빌드와 Pages 배포 완료를 기다립니다.

정리 대상 44개 중 원본 내용과 일치하는 파일만 삭제합니다. 별도로 편집한 파일은 `SKIP changed`로 남깁니다. 백업 ZIP은 임시 폴더의 `SEEYA-backups`에 생성되며 정확한 경로가 실행 결과에 나옵니다. 오래 보관할 백업은 따로 복사하세요. 재실행해도 이미 없는 파일은 건너뜁니다. 정리 도구를 실행하지 않아도 새 사이트는 동작하지만 예전 파일은 남습니다.

UPLOAD는 변경 소스와 정리 도구입니다. **news.json·photos.json·visitors.json·CNAME 및 생성 HTML은 덮어쓰지 않습니다.** 이번에는 통합된 기존 553건과 새 기록 156건을 합친 `data/archive.json`이 포함됩니다. v4.89 정리를 아직 적용하지 않은 v4.88 저장소에서도 사용할 수 있도록 통합 로더·정리 도구를 함께 넣었습니다. FULL_BACKUP은 전체 소스·이미지·빌드 산출물이 있는 보관·미리보기용입니다.

## 앞으로 수정할 파일

| 내용 | 편집 위치 |
|---|---|
| 아카이브 전체 기록·날짜·출처·설명 | `data/archive.json` |
| 현재 실행·운영 안내 | `README.md` |
| 버전별 변경 내역·과거 조사 문서 | `CHANGELOG.md` |
| 뉴스 | `data/news.json` — 자동 갱신 |
| 갤러리 | `data/photos.json`, `images/gallery/` |
| 오늘 방문자 집계 | `data/visitors.json` — 자동 갱신 |
| 메뉴·하단 안내·GA 태그 | `src/template.html`, `src/pages/home.js` |
| 페이지 내용·동작·스타일 | `src/pages/`, `src/shared/`, `src/client/`, `src/styles/` |
| 앨범·멤버·연표·가이드 등 | `src/data/` |
| 경로·메타·사이트맵 기준 | `src/data/routes.json` |

앞으로 버전별 아카이브 JSON이나 MD 파일을 새로 만들지 않습니다. `data/archive.json`에 새 고유 ID를 추가하거나 기존 기록을 수정하고 `CHANGELOG.md`에 변경 내역을 누적합니다. 같은 출연의 여러 곡·영상은 songs·additionalSources에 모읍니다. 날짜가 불명확하면 영상 게시일을 표시하고 dateBasis·note에 근거를 남깁니다. 발매·공개일, 첫 방송일, 공연 시즌도 따로 표시합니다. 팬 보관 자료의 날짜만 확인된 경우에는 잠정 표시를 유지합니다.

기존 별도 MD 문서는 CHANGELOG에 원문을 보관했습니다. 그 안의 과거 적용 방법·당시 수치·확인 대기 문구는 역사적 기록이며 현재 안내를 대체하지 않습니다. 현재 출처와 확정 여부는 아카이브 각 기록에 있습니다.

## 로컬 실행과 빌드

생성된 사이트를 확인하려면 Python 3이 설치된 PC에서 `serve-local.bat`을 실행하고 http://localhost:8000/ 을 엽니다. 서버 창은 열어 두세요. 미리보기에는 Node가 필요하지 않습니다.

소스를 수정한 뒤 HTML을 만들 때는 Node.js가 필요합니다. 기존 Actions와 같은 Node 22를 사용할 수 있고 별도 npm 패키지는 필요 없습니다.

```sh
node build.js
node scripts/check.js
node scripts/check-archive.js
node scripts/serve.js
```

Node 서버 주소는 http://127.0.0.1:8080/ 입니다. file:// 더블클릭 대신 로컬 서버를 사용하세요.

**생성된 HTML 직접 편집 금지.** 각 경로 index.html, 해시 파일명 assets/site.*·assets/lyric-quiz.*, sitemap.xml, build-manifest.json은 빌드 산출물입니다. 일반 링크로 이동하며 NEWS·ARCHIVE·GALLERY는 빌드 시 본문과 대체 데이터를 만들고 방문 후 최신 JSON을 읽습니다.

이전 해시 자산은 캐시된 HTML이 참조할 수 있어 유지합니다. 임의로 지우면 예전 페이지에서 퀴즈가 실행되지 않을 수 있습니다. 정리 도구는 이 파일들을 삭제하지 않습니다.

## 자동화와 방문 통계

- `update-news.yml`: main Push 시와 6시간마다 뉴스 수집·빌드·배포. 수집 실패 시 기존 기사를 보존합니다.
- `build.yml`: 수동 사이트 빌드.
- `update-visitors.yml`: 매시간 43분 방문 통계 갱신. 실행·GA 반영에는 지연이 있을 수 있습니다.

GA4 수집 태그는 `G-0S36GKBD8C`, 조회 속성은 `553597076`입니다. 실제 조회는 GitHub Secrets의 `GA_PROPERTY_ID`, `GA_SERVICE_ACCOUNT_JSON`을 사용하며 기존 Secrets를 다시 등록할 필요가 없습니다. 비밀 키는 통합본에 포함하지 않습니다.

오늘의 숫자는 한국 시간 기준 GA `totalUsers`입니다. 실시간 접속자 수나 새로고침 횟수가 아닙니다. GA 속성 시간대는 `Asia/Seoul`, 서비스 계정은 해당 속성 조회 권한이 있어야 합니다. 최초 설정 안내는 CHANGELOG의 v4.73 보관 문서에 있습니다.

제작자 contact는 https://www.instagram.com/seeya_archive_fanpage/ 로 연결됩니다. 최신 인스타 글 피드는 사용하지 않습니다.

## 검증과 배포 범위

`scripts/check.js`는 빌드 재현성·11개 경로 본문·JS 문법·로컬 링크와 아카이브 검사를 실행합니다. `scripts/check-archive.js`는 ID·날짜·출처, 필터·페이지 이동 및 주요 회차를 검사합니다. 별도 브라우저 검사는 Edge와 Playwright 설치 환경에서 진행합니다.

사이트 실행에는 각 경로 HTML, assets/, images/, data/, 404.html, robots.txt, sitemap.xml이 필요합니다. GitHub에서 빌드하려면 src/, scripts/, build.js, .github/도 유지하세요. 운영 저장소의 CNAME·사진·자동화 데이터는 계속 보존합니다.
