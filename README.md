# SEEYA ARCHIVE v3.3

## NEWS 개편
기존 Google Sheets 기반 SCHEDULE 페이지를 제거하고 NEWS 페이지로 변경했습니다.

필터:
- 씨야
- 남규리
- 김연지
- 이보람

각 탭은 Google News RSS 검색 결과를 최근 90일 기준으로 불러옵니다.
표가 아니라 사이트 스타일의 뉴스 목록으로 렌더링합니다.

표시 내용:
- 날짜
- 언론사
- 기사 제목
- 짧은 기사 설명
- 기사 원문 링크

정적 GitHub Pages에서 Google News RSS를 직접 읽으면 CORS 제한이 있어
현재는 `allorigins.win` 프록시를 사용합니다.

프록시 장애가 있으면 뉴스 영역에 오류 메시지가 표시됩니다.
