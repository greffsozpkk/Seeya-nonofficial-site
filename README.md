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


## v4.50 · GUIDE / FAN CHANT Ending Art
- 사용자 제공 응원 도트 이미지를 공용 자산으로 추가
  - `images/common/seeya-cheer-pixel.png`
- MUSIC → FAN CHANT 페이지 최하단에 배치
- GUIDE 페이지 최하단에 동일 이미지 배치
- 기존 TODAY / GALLERY / ARCHIVE / NEWS와 동일한 `.page-pixel-art` 엔딩 스타일 재사용
- 장식 이미지로 처리하여 빈 alt 사용


## v4.51 · 씨야엔터테인먼트 명예 영업사원증 발급소

### 신규 페이지
- `/employee-card/`
- 상단 메인 메뉴에는 추가하지 않음
- HOME 참여형 배너 + GUIDE 마지막 버튼 + SEO footer에서 진입

### 기능
- 이름 또는 닉네임 입력
- JPG / PNG / WEBP 사진 업로드
- 사진 확대/축소
- 사원증 미리보기에서 사진 직접 드래그
- 사진 위치 초기화
- 장식용 사번 자동 생성 / 재생성
- 발급일 자동 입력
- `명예 영업사원증 발급하기`
- 1086×1448 PNG 저장

### 개인정보
- 사진 합성은 브라우저 Canvas 안에서만 수행
- 사진을 서버에 업로드하거나 저장하지 않음
- localStorage / sessionStorage 사용하지 않음

### 디자인
- 승인된 B안 템플릿 사용
- `SEE YOU ALWAYS`
- `UNOFFICIAL · FAN MADE ID CARD`
- 실제 씨야엔터테인먼트 공식 사원증이 아닌 팬 콘텐츠임을 명시

### SEO
- `/employee-card/` clean URL 생성
- 고유 title / description / canonical / OG / Twitter metadata
- sitemap.xml 등록


## v4.52 · Employee Card Rendering Fix
- 템플릿에 박혀 있던 샘플 이름/사번/발급일이 신규 값과 겹쳐 보이던 문제 수정
- 반투명 개별 덮개 대신 NAME/FAN TITLE/ID/DATE 값 영역 전체를 불투명 패널로 정리
- 패널 위에 구분선을 다시 그리고, 이름·팬 호칭·사번·발급일을 한 번만 렌더링
- `씨야와 함께하는`도 Canvas 레이어에서 다시 출력
- 한글 폰트 fallback 보강
- 1086×1448 PNG 출력 유지


## v4.53 · Employee Card Alignment + HOME Pixel Restore
- 사원증 값 영역 전체를 덮던 큰 사각 패널 제거
- 템플릿의 고정 FAN TITLE / 꽃 / 구분선 / 배경 질감을 그대로 유지
- 샘플 `홍길동`, `SY-2026-001`, `2026.09.07` 부분만 좁게 마스킹 후 새 값 합성
- 이름 글자 크기를 템플릿 원본에 가깝게 축소
- ID / 발급일 좌표를 원본 행 중앙에 맞춤
- 사진 영역을 실제 템플릿 안쪽 프레임 크기(338×382)에 맞게 확대
- 사진 미선택 시 원래 PHOTO 플레이스홀더를 그대로 표시
- 우측 하단과 겹치던 `ISSUED · SEEYA ARCHIVE` 추가 스탬프 제거
- 최근 ZIP에서 누락됐던 HOME 도트 캐릭터 자산 복구:
  `images/common/seeya-pixel-characters.png`


## v4.54 · Employee Card Text Alignment Fix
- 사원증 이름/사번/발급일 마스킹 영역을 더 넓혀 브라우저별 잔상이 보이지 않도록 조정
- 글자 기준선을 middle → alphabetic 으로 변경해 템플릿 원본 행과 더 자연스럽게 정렬
- 이름/사번/발급일의 X/Y 좌표와 폰트 크기를 재조정
- HOME 하단 도트 캐릭터 복구 상태 유지


## v4.55 · Employee Card Temporarily Disabled
- 명예 영업사원증 기능 임시 비활성화
- HOME `명예 영업사원 모집중` 배너 제거
- GUIDE `명예 영업사원증 만들기` 버튼 제거
- SEO footer `STAFF ID` 링크 제거
- `/employee-card/` clean URL 페이지 제거
- sitemap.xml에서 `/employee-card/` 제거
- 라우터의 employee-card 진입 및 초기화 제거
- 기존 사원증 코드와 템플릿 자산은 나중에 새 템플릿으로 재작업할 수 있도록 내부에 보존


## v4.56 · TODAY'S SEEYA 80 Songs + ARCHIVE Tracklist Update

### TODAY'S SEEYA
- 기존 Tarot 22장 대표곡 의존 구조 제거
- 추천곡 전용 풀 `data/today-songs.json` 신설
- 총 80곡
- 범위:
  - 씨야 정규/미니/베스트의 주요 고유 수록곡
  - 주요 프로젝트/OST
  - 2026 남규리·김연지·이보람 최근 솔로곡
- Inst. 트랙은 TODAY 추천에서 제외
- 8개 분위기:
  `start / love / energy / comfort / longing / breakup / reflection / connection`
- 먼저 오늘의 분위기를 뽑고, 그 분위기에 매칭된 곡만 추천
- 같이 들으면 좋은 곡도 같은 분위기 풀에서 2곡 추천
- 추천 링크는 직접 확인된 Melon 앨범 링크를 우선하고, 프로젝트/OST는 Bugs 원본 페이지 사용
- Tarot 기능은 기존 22장 구조 그대로 유지하며 TODAY와 분리

### ARCHIVE
- 전체 기록: 80개
- The First Mind / Lovely Sweet Heart / California Dream / Brillant Change / Rebloom /
  See You Again / First, Again 전체 트랙 검색 가능하도록 songs 배열 보강
- 숙명 OST `시차`, Baby Brown `미쳤나봐`, TWENTYth Urban `이별이 오지 못하게` 보강
- `See You Again` 참여 멤버를 남규리·김연지·이보람으로 교정
- 2026.08.27 K-WORLD DREAM AWARDS `K 월드 드림 리스너 초이스상` 수상 기록 추가
