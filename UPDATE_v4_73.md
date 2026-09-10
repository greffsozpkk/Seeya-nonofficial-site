# v4.73 — contact 표시 및 Today 집계 연결 준비

## 적용
GitHub 최신 main을 Pull한 뒤 APPLY_PATCH ZIP 안 SEEYA_ARCHIVE_v4_73 폴더의 내용물을 기존 저장소 루트에 덮어쓰고 Commit/Push하세요. 폴더 자체를 한 단계 더 넣으면 안 됩니다.
이번 패치는 메인 index.html과 필요한 생성 자산까지 포함합니다. 별도 로컬 빌드 없이 contact와 Today 자리 표시가 반영됩니다. 기존 뉴스/사진/아카이브 JSON은 포함하지 않습니다. 전체 소스 ZIP은 보관용입니다.
메인 이외 경로의 GA 태그는 기존 GitHub Actions의 node build.js 실행과 Pages 배포 성공 후 반영됩니다. Actions에서 Update SEEYA news and static HTML 및 Pages 배포가 성공했는지 확인하세요.
생성된 HTML 직접 편집 금지. 이후 수정은 src/에서 하고 node build.js로 생성합니다.

## Today 숫자를 켜는 일회성 설정
측정 ID G-0S36GKBD8C는 수집용이며, 통계를 읽는 권한은 별도입니다. 현재는 Today — 집계 준비 중으로 표시됩니다.
1. Google Analytics 관리에서 숫자로만 된 속성 ID를 확인하고 속성 보고 시간대를 대한민국(Asia/Seoul)으로 설정합니다.
2. Google Cloud 프로젝트에서 Google Analytics Data API를 사용 설정하고 서비스 계정을 생성합니다. 그 서비스 계정의 JSON 키를 발급합니다.
3. Google Analytics 속성 액세스 관리에 해당 서비스 계정 이메일을 뷰어 권한으로 추가합니다.
4. GitHub 저장소 Settings → Secrets and variables → Actions → New repository secret에서 GA_PROPERTY_ID(숫자 속성 ID), GA_SERVICE_ACCOUNT_JSON(JSON 키 파일 전체 내용)을 등록합니다. 키 파일은 저장소나 채팅에 올리지 마세요.
5. Actions → Update daily visitors → Run workflow를 실행합니다. 성공하면 data/visitors.json이 자동으로 생성되고 Pages 재배포가 요청됩니다.

매시간 43분에 갱신을 요청하며 GitHub 실행 및 GA 데이터 반영은 지연될 수 있습니다. 실시간 접속자 수가 아니라 한국 시간 기준 오늘의 GA totalUsers입니다. 광고 차단, 다른 기기 사용 등에 따라 실제 사람 수와 다를 수 있습니다. 날짜가 바뀌거나 데이터를 읽지 못하면 과거 숫자를 오늘 값으로 표시하지 않습니다. 0명은 API에서 오늘 0으로 응답한 경우에만 표시합니다.
공개 JSON에는 날짜·집계 숫자·집계 시각만 저장됩니다. 계정 키는 GitHub Secrets에서만 읽습니다.

공식 안내: https://developers.google.com/analytics/devguides/reporting/data/v1/quickstart

## 검증
11경로 빌드 재현성·링크·JS 검사 통과. 로컬 브라우저에서 contact와 인스타 링크, Today 자리 표시 확인. 오늘 정상값·0명·과거 날짜·요청 실패 표시 검사 통과. 실제 GA 조회는 계정 권한 미설정으로 검증하지 못했습니다. 실제 사이트 배포는 수행하지 않았습니다.
