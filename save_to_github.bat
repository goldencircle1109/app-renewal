@echo off
echo ========================================
echo  Save to GitHub
echo ========================================
echo.

cd /d "%~dp0"

echo [1/4] Current status:
git status --short
echo.

echo [2/4] Adding all changes...
git add -A
echo.

echo [3/4] Committing...
set /p MSG="Enter commit message (or press Enter for default): "
if "%MSG%"=="" set MSG=Update files

git commit -m "%MSG%"
echo.

echo [4/4] Pushing to GitHub...
git push origin master
echo.

echo ========================================
echo  Done!
echo ========================================
pause
