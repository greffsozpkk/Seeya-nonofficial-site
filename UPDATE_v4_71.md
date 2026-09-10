# v4.71 연락처 추가 및 방문 통계 안내

메인 화면 비영리 안내 아래 contact. + 인스타그램 로고를 추가했습니다. 로고는 https://www.instagram.com/seeya_archive_fanpage/ 를 새 창으로 엽니다.

## 적용
최신 main을 Pull한 뒤 SOURCE_PATCH의 내부 파일을 같은 경로에 덮어쓰고 Commit/Push하세요. 기존 GitHub Actions가 HTML과 CSS를 자동 생성합니다. 뉴스·사진·아카이브 데이터는 업데이트용 ZIP에 포함하지 않았습니다. FULL_SOURCE는 전체 소스 및 생성 결과 보관본으로, 운영 데이터가 더 최신이면 전체 덮어쓰지 마세요.

## 방문 통계 — 아직 미연결
현재 소스에는 방문 통계 코드가 없습니다. 통계 서비스 계정의 사이트별 설치 코드를 받아야 연결을 완료할 수 있습니다. 과거 방문자 수는 새로 설치하는 도구로 소급 수집할 수 없습니다.

무료 Cloudflare Web Analytics를 사용할 경우:
1. Cloudflare 계정에서 Web Analytics → Add a site를 엽니다.
2. seeya-fanpage.com을 등록합니다.
3. Manage site에서 JS snippet(설치 코드)을 복사해 전달하세요. 비밀번호나 API 비밀키는 필요 없습니다.
4. 코드 적용 이후 대시보드에서 날짜 범위를 선택하여 방문(Visits)과 페이지 조회(Page views)를 확인합니다. Visits는 중복 없는 사람 수와는 다른 지표입니다.

GitHub Pages에서도 사용할 수 있으며 DNS 이전은 필요 없습니다. 이미 Google Analytics를 사용한다면 해당 측정 ID로 연결할 수 있습니다.
공식 안내: https://developers.cloudflare.com/web-analytics/get-started/

## 검증
로컬 브라우저에서 비영리 문구 아래 연락처와 정확한 링크 확인. 빌드 재현성·JavaScript 문법·11개 정적 페이지·내부 링크 검사 통과. 통계 전송 검증은 설치 코드 수신 이후 진행합니다.
