@echo off
cd /d "%~dp0"
echo.
echo SEEYA ARCHIVE local server
echo Open: http://localhost:8000/
echo Stop: Ctrl+C
echo.
where py >nul 2>nul
if %errorlevel%==0 (
  py -m http.server 8000
) else (
  python -m http.server 8000
)
