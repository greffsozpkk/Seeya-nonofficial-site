@echo off
cd /d "%~dp0"
echo.
echo SEEYA ARCHIVE local server
echo Open: http://localhost:8000/
echo Stop: Ctrl+C
echo.
py -3 --version >nul 2>nul
if not errorlevel 1 goto use_py
python --version >nul 2>nul
if not errorlevel 1 goto use_python
echo Python was not found. Please install Python 3 and try again.
pause
exit /b 1

:use_py
py -3 -m http.server 8000 --bind 127.0.0.1
goto finished

:use_python
python -m http.server 8000 --bind 127.0.0.1

:finished
pause
