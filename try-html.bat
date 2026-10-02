@echo off
cd /d "%~dp0"
node html-reader-launcher.mjs
if errorlevel 1 pause
