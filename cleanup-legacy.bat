@echo off
cd /d "%~dp0"
powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%~dp0scripts\cleanup-legacy.ps1" -Apply
if errorlevel 1 echo Cleanup stopped. See the message above.
pause
