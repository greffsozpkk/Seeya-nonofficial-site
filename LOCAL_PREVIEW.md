# 로컬 미리보기 방법

## Windows
압축을 푼 뒤 `serve-local.bat`을 더블클릭합니다.

브라우저에서:
- http://localhost:8000/
- http://localhost:8000/history/
- http://localhost:8000/music/
- http://localhost:8000/gallery/
- http://localhost:8000/archive/

을 열어 확인할 수 있습니다.

서버 종료는 열린 터미널에서 `Ctrl + C`.

## macOS / Linux
터미널에서 프로젝트 폴더로 이동 후:

```bash
chmod +x serve-local.sh
./serve-local.sh
```

또는:

```bash
python3 -m http.server 8000
```

## 중요
v4.34부터 ChatGPT 미리보기 전용 우회 코드는 제거했습니다.
로컬과 실제 `seeya-fanpage.com` 모두 같은 clean URL 구조로 동작합니다.
