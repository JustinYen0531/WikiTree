@echo off
chcp 65001 >nul
cd /d "%~dp0"
node launcher.mjs
if errorlevel 1 pause
