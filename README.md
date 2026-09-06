# SEEYA ARCHIVE v4.40 — FAN CHANT Route Fix

v4.39 기반.

## 수정
MUSIC 내부 `FAN CHANT · 응원법` 탭이 clean URL 환경에서 반응하지 않던 문제를 수정했습니다.

원인:
- MUSIC 함수가 응원법 여부를 `location.hash`만 보고 판단하고 있었음.
- v4.32 이후 공개 URL은 `/music/fanchant/` 형태의 pathname 기반 clean URL이므로,
  해당 페이지에 들어가도 MUSIC이 계속 DISCOGRAPHY로 판단했습니다.

수정:
- `location.hash`가 있으면 기존 hash route를 사용
- 아니면 `location.pathname`을 사용
- `/music/fanchant/`를 정확히 FAN CHANT 하위 페이지로 인식

따라서 localhost와 GitHub Pages의 clean URL 모두 정상 동작합니다.
