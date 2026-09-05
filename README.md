# SEEYA ARCHIVE v4.21

## MEMBERS hotfix
v4.20에서 MEMBERS 라우트가 열리지 않던 JavaScript 런타임 오류를 수정했습니다.

원인:
- 멤버 카드 밖에서 `m.name`을 참조하는 잘못된 표현이 들어가 있었음
- 이 때문에 MEMBERS 페이지 렌더링 시 `m is not defined` 오류 발생

수정:
- 잘못된 표현 제거
- 남규리 / 김연지 / 이보람 각 카드에 해당 싸인 PNG를 직접 연결
- JavaScript 문법 검증 완료

v4.20의 다른 기능은 그대로 유지합니다.
