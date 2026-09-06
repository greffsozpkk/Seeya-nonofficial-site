# SEEYA ARCHIVE v4.43 — Solo Melon Links + Nam Gyu-ri Archive

v4.42 기반.

## HOME · MEMBER SOLO
### 남규리
- `우리 사랑 그런 거 해요`
- PART.1 MV / PART.2 MV 버튼 유지
- `Melon에서 감상하기 →` 추가
- Melon: https://www.melon.com/album/detail.htm?albumId=14521264
- 사용자 제공 Part.1 + Part.2 합성 이미지 유지

### 김연지
- `노래`
- Melon: https://www.melon.com/album/detail.htm?albumId=14493829
- 카드 전체 링크 대신 하단 Melon 버튼으로 통일

### 이보람
- `빛의 반대편에서`
- Melon: https://www.melon.com/album/detail.htm?albumId=14335999
- 카드 전체 링크 대신 하단 Melon 버튼으로 통일

## ARCHIVE
기존 남규리 Part.2 teaser 단독 기록을 제거하고 정식 공개 기록으로 교체:
1. `우리 사랑 그런 거 해요` 싱글 발매 · Melon
2. `우리 사랑 그런 거 해요 Part.1` Official MV · YouTube
3. `우리 사랑 그런 거 해요 Part.2 (feat. KoN)` Official MV · YouTube

Melon 기준:
- 발매일: 2026.09.06
- 싱글
- 장르: 발라드
- 기획사: ㈜탱글미디어
- 수록곡 2곡, 두 곡 모두 타이틀


## v4.44 · Naver Search Advisor
- Naver site verification meta tag added inside `<head>`.
- Verification token:
  `10549d56351a36ea7d8df11682ed09dfe3b75bc9`
- Applied to root and clean-URL routed HTML copies.
- Existing `robots.txt` and `sitemap.xml` are preserved.


## v4.45 · Naver Description Optimization
- 메인 페이지 description을 네이버 권장 80자 이내로 축약
- Open Graph description과 Twitter description을 동일 문구로 동기화
- GUIDE 포함 모든 clean URL 페이지 description을 80자 이하로 점검/정리
- 런타임 routeMeta의 description도 정적 HTML과 동일하게 동기화

메인 설명:
`씨야(SeeYa) 팬 아카이브. 남규리, 김연지, 이보람의 음악과 활동 기록, 사진, 역사를 만나보세요.`


## v4.46 · Music Broadcast / Live Stage Archive

v4.45 기반.

### ARCHIVE
- `음악방송` 필터명을 `음악방송·무대`로 확장
- `type: music-show` 기록 19개 추가
- 현재 전체 ARCHIVE: 79개
- 현재 음악방송·무대 기록: 19개

### 1차 수록 범위
- 2006 KBS 콘서트7080 · 여인의 향기
- 2007 KBS 콘서트7080 · 사랑의 인사
- 2007 MBC 쇼! 음악중심 · 슬픈 발걸음
- 2008 MBC 쇼! 음악중심 · Hot Girl
- 2009 MBC 쇼! 음악중심 · 여성시대 / 그 놈 목소리
- 2010 MBC 쇼! 음악중심 · 원더우먼
- 2011 마지막 방송 주간 · M Countdown / 뮤직뱅크 / 음악중심 / 인기가요
- 2026 더 시즌즈 / 열린음악회
- 2026 M Countdown / Simply K-Pop / 인기가요 / 음악중심 / ENA 케이팝업 차트쇼

### 데이터 원칙
- 방송사 공식 YouTube·공식 VOD를 우선 연결
- 공식 영상이 확인되지 않은 과거 무대는 당시 기사로 방송 사실을 확인
- 이번 버전은 전수 목록이 아니라 출처가 명확한 대표·핵심 무대 1차 구축


## v4.47 · TODAY / GALLERY / ARCHIVE Pixel Art
- 사용자 제공 `도트_Today.png` → TODAY'S SEEYA 하단
- 사용자 제공 `도트_사진.png` → GALLERY 하단
- 사용자 제공 `도트_아카이브.png` → ARCHIVE 하단
- 각 이미지는 사이트 로컬 자산으로 저장
- HISTORY 이미지(최대 820px)보다 작은 최대 720px로 조정
- PC 기준 74vw + `max-width: calc(100% - 48px)`로 가로 스크롤 방지
- 모바일 최대 88vw
- 카드/박스 없이 짧은 Pearl Light Pink 구분선과 약한 그림자만 사용


## v4.48 · NEWS 10 + ARCHIVE Pagination
- NEWS: 카테고리별 화면 노출 최대 5개 → 최대 10개
- ARCHIVE: 페이지당 9개
- 검색 / 연도 / 멤버 / 카테고리 / 정렬 변경 시 자동으로 1페이지 복귀
- 페이지 번호는 많은 경우 `1 … 4 5 6 … 9`처럼 압축 표시
- 이전/다음 버튼 지원
- 페이지 이동 시 ARCHIVE 결과 상단으로 부드럽게 이동
- 결과 카운트에 현재 페이지 표시 (`총 79개의 기록 · 1 / 9 페이지`)
- 모바일에서도 페이지 버튼이 과하게 넓어지지 않도록 별도 크기 조정
- ARCHIVE 이미지/placeholder는 이번 버전에서 변경하지 않음

※ NEWS 데이터 자체가 10건 미만인 카테고리는 존재하는 기사 수만큼만 표시됩니다.


## v4.49 · Stage / Interview Placeholder Art
- `archive-stage.png`
  - ARCHIVE `음악방송·무대` 카드에서 실제 썸네일이 없는 경우 기본 이미지로 사용
- `archive-interview.png`
  - ARCHIVE `인터뷰` 카드에서 실제 썸네일이 없는 경우 기본 이미지로 사용
  - SEEYA NEWS 페이지 최하단에도 다른 페이지와 같은 엔딩 아트 형식으로 배치
- 실제 썸네일이 존재하면 placeholder보다 실제 썸네일을 우선 표시
- placeholder 이미지 로딩 실패 시 기존 연도/카테고리 텍스트 fallback 유지
- v4.48 페이지네이션의 카드 렌더 할당도 함께 점검/교정
