# v4.72 — Google Analytics 연결

GA4 측정 ID G-0S36GKBD8C를 전체 11개 경로에 연결했습니다. v4.71의 contact. 인스타그램 링크도 포함됩니다.

## 적용
1. GitHub 최신 main을 먼저 Pull합니다.
2. SOURCE_PATCH ZIP의 SEEYA_ARCHIVE_v4_72 폴더 안 파일을 저장소의 같은 경로에 덮어쓰고 Commit/Push합니다.
3. 기존 Update SEEYA news and static HTML 자동 실행과 Pages 배포 완료를 확인합니다.
4. 실제 seeya-fanpage.com을 방문한 뒤 GA4 실시간 보고서에서 유입을 확인합니다.

SOURCE_PATCH에는 자동 생성 HTML과 최신 뉴스·사진·아카이브 JSON이 없습니다. GitHub 빌드가 최신 데이터로 HTML을 생성합니다. FULL_SOURCE는 전체 소스와 생성 HTML 보관본입니다.

## 방문 수 확인
GA4에서 날짜 범위를 하루로 선택해 사용자 수와 조회수를 확인하세요. 사용자 수와 조회수는 서로 다릅니다. 수집은 배포 이후부터이며, 과거 방문은 소급 집계되지 않습니다. 표준 보고서는 즉시 반영되지 않을 수 있습니다.

## 검증 및 상태
11개 페이지 태그 각 1개, 올바른 측정 ID 설정, localhost 설정 호출 제외, 빌드 재현성·문법·내부 링크 검사 통과. 운영 배포와 GA4 수신 확인은 아직 수행하지 않았습니다. 브라우저의 광고 차단이나 방문자의 동의 설정 등에 따라 집계가 누락될 수 있습니다.

생성된 HTML 직접 편집 금지. 소스를 수정한 뒤 node build.js로 생성합니다.
