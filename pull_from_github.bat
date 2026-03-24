@echo off
echo ========================================
echo  Pull from GitHub
echo ========================================
echo.

cd /d "%~dp0"

echo [1/3] Fetching from origin...
git fetch origin
echo.

echo [2/3] Current status:
git status --short
echo.

echo [3/3] Pulling latest changes...
git pull origin master
echo.

echo ========================================
echo  Done!
echo ========================================
pause
