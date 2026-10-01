@echo off
chcp 65001 > nul
echo ====================================================
echo      QA STORIES - SETUP DATABASE MYSQL
echo ====================================================
echo.
node setup-db.js
echo.
pause
