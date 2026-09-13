@echo off
setlocal
chcp 65001 >nul
cd /d "%~dp0"
echo.
echo SEEYA ARCHIVE - 최신 페이지 생성 및 로컬 미리보기
echo.
where node >nul 2>nul
if errorlevel 1 goto missing_node
echo [1/2] 업데이트된 소스로 최신 페이지를 만들고 있습니다.
call node build.js
if errorlevel 1 goto build_failed
echo.
echo [2/2] 미리보기를 시작합니다.
echo 브라우저에서 http://127.0.0.1:8000/ 을 열어주세요.
echo 이 창을 열어 두세요. 종료하려면 Ctrl+C를 누르세요.
echo 이미 실행 중인 미리보기 창이 있다면 먼저 닫아주세요.
echo.
call node scripts/serve.js 8000
goto finished

:missing_node
echo Node.js가 설치되어 있지 않거나 설치 후 이 창을 다시 열어야 합니다.
echo https://nodejs.org/ 에서 Node.js LTS를 한 번 설치해주세요.
echo 설치한 뒤 이 배치파일을 다시 실행하면 됩니다.
echo 전체 백업 ZIP을 다시 풀거나 Python을 설치할 필요는 없습니다.
goto failed

:build_failed
echo.
echo 최신 페이지 생성에 실패하여 미리보기를 시작하지 않았습니다.
echo 위 오류를 확인하고 업데이트 ZIP이 기존 사이트 폴더에 덮어써졌는지 확인해주세요.
:failed
pause
exit /b 1

:finished
pause
